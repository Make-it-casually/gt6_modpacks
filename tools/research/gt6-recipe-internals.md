# GT6 6.17.06 internals — foreign-item recognition, OreDict/Material API, recipe add/remove

Target: `gregtech_1.7.10-6.17.06.jar`, MC 1.7.10.
Method: `javap -p -c` on the extracted jar at `E:\game\minecraft\gt6\tools\_tmp_gt6`
(raw dumps kept in `E:\game\minecraft\gt6\tools\research\_dump\*.txt`).
javap is not a decompiler, so all "source" below is **reconstructed from bytecode**;
every claim is anchored to a quoted `javap` line (`<Class>.class @ offset N`).
The official source repo (<https://github.com/GregTech6/gregtech6>) could **not** be reached
from this sandbox: `raw.githubusercontent.com`, `github.com`, `cdn.jsdelivr.net` and
`sourcegraph.com` are all DNS-blocked / firewalled here (`URL hostname resolves to a
non-public IP address`, HTTP 403). Therefore nothing below is confirmed against the
official Java source; anything that rests on *interpretation* rather than bytecode is
marked **UNVERIFIED**.

## TL;DR (中文速览)

1. `RecipeMap.findRecipe()` 会先用 `OreDictManager.INSTANCE.getStackArray(true, inputs)`
   把输入"统一化"成 GT6 的规范物品（unification target），再查 `mRecipeItemMap`
   （key = Item+meta，不含 NBT），查不到还会用 `getStack_(false, input)` 再试一次。
   所以**只要外围物品被绑定到某个 prefix+material，并且 GT6 认识这个 material，
   机器就能把它当作 GT6 自己的那个物品来处理**。
2. `Crusher/Mortar/Shredder/Anvil/...` 等配方表注册了 `IRecipeMapHandler`
   （在 `gregtech.loaders.c.Loader_Recipes_Handlers` 里注册，不在 `RM` 里），
   它们**在查找配方时按需合成配方**（`RecipeMapHandlerPrefix.addRecipeForMaterial`
   用 `OreDictPrefix.mat(material, amount)` 取物品）。这是"外来物品自动可加工"的关键。
3. `OM.data(stack, new OreDictItemData(prefix, material))` **只写 item data，不做统一化**；
   要真正生效必须：(a) material 存在且不是 `INVALID_MATERIAL`（否则
   `onOreRegistration1` 直接跳过绑定），(b) 走 `OM.association(...)` / `OM.setTarget(...)`
   或在 Init 阶段用 Forge 的 `OreDictionary.registerOre("ingotX", stack)` 让 GT6 自己绑定。
4. **删配方没有官方 API**：`GT_ModHandler.removeRecipeByOutput` → `CR.remout` 只删
   *工作台* 配方（`CraftingManager` 的 `IRecipe` 列表），不碰机器配方。
   机器配方只能自己 `map.mRecipeList.remove(recipe)` + `map.reInit()`（或
   `Recipe.reInit()` 重建全部 `mRecipeItemMap`），或直接 `recipe.mEnabled = false`。

---

# A. RECIPE LOOKUP FOR FOREIGN STACKS

## A.1 How `Recipe$RecipeMap` finds a recipe for an input ItemStack

`gregapi.recipes.Recipe$RecipeMap` has exactly one entry point family
(`javap -p` signature list):

```
public gregapi.recipes.Recipe findRecipe(gregapi.random.IHasWorldAndCoords, gregapi.recipes.Recipe, boolean, long, net.minecraft.item.ItemStack, net.minecraftforge.fluids.FluidStack[], net.minecraft.item.ItemStack...);
public final gregapi.recipes.Recipe findRecipe(gregapi.random.IHasWorldAndCoords, gregapi.recipes.Recipe, boolean, long, net.minecraft.item.ItemStack, net.minecraftforge.fluids.IFluidTank[], net.minecraft.item.ItemStack...);
public gregapi.recipes.Recipe findRecipeInternal(gregapi.random.IHasWorldAndCoords, gregapi.recipes.Recipe, boolean, boolean, long, net.minecraft.item.ItemStack, net.minecraftforge.fluids.FluidStack[], net.minecraft.item.ItemStack...);
public java.util.List<gregapi.recipes.Recipe> getNEIAllRecipes();
public java.util.List<gregapi.recipes.Recipe> getNEIRecipes(net.minecraft.item.ItemStack...);
public java.util.List<gregapi.recipes.Recipe> getNEIUsages(net.minecraft.item.ItemStack...);
public gregapi.recipes.Recipe addToItemMap(gregapi.recipes.Recipe);
```

`findRecipe(...)` (RecipeMap.class @ 5500) is a thin wrapper that **hard-codes `aUnify = true`**
and calls `findRecipeInternal`:

```
  public gregapi.recipes.Recipe findRecipe(...,boolean, long, ItemStack, FluidStack[], ItemStack...);
       3: iconst_1
      13: invokevirtual #588  // Method findRecipeInternal:(...;ZZJ...)Lgregapi/recipes/Recipe;
```

So every machine lookup goes through `findRecipeInternal` **with unification enabled**.

### Unification of the inputs happens *before* the map lookup

`findRecipeInternal` (RecipeMap.class @ 5546), parameter slots:
`0=this, 1=aWorld, 2=aRecipe, 3=aNotUnified, 4=aUnify, 5-6=aEnergy, 7=aSpecialSlot, 8=aFluids, 9=aInputs`

```
       0: aload_0
       1: getfield  #217   // Field mRecipeList:Ljava/util/Collection;
       4: invokeinterface    // Collection.isEmpty:()Z
       9: ifeq 30
      12: iload_3            // aNotUnified
      13: ifeq 28
      16: aload_0
      17: getfield  #162   // Field mRecipeMapHandlers:Ljava/util/List;
      20: invokeinterface    // List.isEmpty:()Z
      25: ifeq 30
      28: aconst_null
      29: areturn            // no recipes AND no handlers -> nothing to do
      ...
      95: iload 4            // aUnify
      97: ifeq 114
     100: getstatic #784     // Field gregapi/oredict/OreDictManager.INSTANCE:Lgregapi/oredict/OreDictManager;
     103: iconst_1
     104: aload 9
     106: checkcast #889     // class "[Ljava/lang/Object;"
     109: invokevirtual #893 // Method gregapi/oredict/OreDictManager.getStackArray:(Z[Ljava/lang/Object;)[Lnet/minecraft/item/ItemStack;
     112: astore 9          // aInputs = OM.getStackArray(true, aInputs)
```

> **A.1 finding #1:** the lookup *does* consult the OreDict/unification layer.
> `OreDictManager.getStackArray(true, inputs)` replaces every input by its
> **unification target** (see B for `getStack_`, which resolves
> `OreDictItemData.mUnificationTarget`, falling back to `sName2StackMap.get(data.toString())`).
> This happens **before** any `mRecipeItemMap` access.

### The actual map lookups (three levels + wildcard)

The per-input loop starts around offset 321/347; the non-null input is in local `13`
(`astore 13`, loop var `12`, array `10`... — each iteration does):

```
     359: aload_0
     360: getfield #177     // Field mRecipeItemMap:Lgregapi/code/ItemStackMap;
     363: aload 13
     365: invokevirtual #914 // Method gregapi/code/ItemStackMap.get:(Lnet/minecraft/item/ItemStack;)Ljava/lang/Object;
     368: checkcast #213     // class java/util/Collection
     371: astore 14
     373: aload 14
     375: ifnull 472
     378..425: for (Recipe r : tRecipes) { if (!r.mFakeRecipe && r.isRecipeInputEqual(false,true,aFluids,aInputs) && r.mEnabled && aEnergy*mPower >= r.mEUt) ...
     457: aload_0
     458: aload 16
     460: dup_x1
     461: putfield #196     // Field oRecipe:Lgregapi/recipes/Recipe;   (buffer the hit)
     ...
     472: aload_0
     473: getfield #177     // Field mRecipeItemMap
     476: aload 13
     478: ldc2_w #915        // long 32767l
     481: invokevirtual #919 // Method gregapi/code/ItemStackMap.get:(Lnet/minecraft/item/ItemStack;J)Ljava/lang/Object;
     ...
     588: getstatic #784     // Field gregapi/oredict/OreDictManager.INSTANCE
     591: iconst_0
     592: aload 13
     594: invokevirtual #923 // Method gregapi/oredict/OreDictManager.getStack_:(ZLnet/minecraft/item/ItemStack;)Lnet/minecraft/item/ItemStack;
     597: astore 15          // ItemStack tTarget = OM.getStack_(false, input)
     599: aload 13
     601: aload 15
     603: iconst_1
     604: invokestatic #927  // Method gregapi/util/ST.equal:(Lnet/minecraft/item/ItemStack;Lnet/minecraft/item/ItemStack;Z)Z
     607: ifne 723            // if input == target, skip
     610: aload_0
     611: getfield #177     // Field mRecipeItemMap
     614: aload 15
     616: invokevirtual #914 // ItemStackMap.get:(Lnet/minecraft/item/ItemStack;)
     ...
     723: aload 13
     725: invokevirtual #931 // Method net/minecraft/item/ItemStack.func_77973_b:()Lnet/minecraft/item/Item;
     728: aload 15
     730: invokevirtual #931 // Method net/minecraft/item/ItemStack.func_77973_b:()Lnet/minecraft/item/Item;
     733: if_acmpeq 852
     736: aload_0
     737: getfield #177     // Field mRecipeItemMap
     740: aload 15
     742: ldc2_w #915        // long 32767l
     745: invokevirtual #919 // ItemStackMap.get:(Lnet/minecraft/item/ItemStack;J)
```

So, per input stack, in order:

| # | lookup | meaning |
|---|--------|---------|
| 0 | `getStackArray(true, inputs)` once, before the loop | unify inputs to canonical stacks |
| 1 | `mRecipeItemMap.get(input)` | exact key `ItemStackContainer(item, stackSize, meta)` — **no NBT** (see below) |
| 2 | `mRecipeItemMap.get(input, 32767L)` | same item with **meta forced to 32767** → matches recipes declared with a wildcard meta (`RecipeMap.class @ 472`) |
| 3 | `getStack_(false, input)` → if different from input, `mRecipeItemMap.get(target)` | recipes registered under the **unification target** of the input (this is the "foreign item → GT item" bridge) |
| 4 | if target's `Item` differs from input's `Item`: `mRecipeItemMap.get(target, 32767L)` | wildcard-meta variant of #3 |

Every candidate is accepted only if

```
     409: aload 16
     411: getfield #576     // Field gregapi/recipes/Recipe.mFakeRecipe:Z    ... must be false
     417..425: r.isRecipeInputEqual(false, true, aFluids, aInputs)  must be true
     431: getfield #710     // Field gregapi/recipes/Recipe.mEnabled:Z       must be true
     439: lload 5 (aEnergy) * mPower  >=  r.mEUt                            (UT$Code.abs_greater_equal)
```

and the hit is stored in the `oRecipe` field (used as a 1-entry buffer for the
"same recipe as last tick" fast path at offsets 114-262 and 180-262).

### The handler pass (dynamic recipe synthesis) — this is the important one

```
    1030: iload_3            // aNotUnified
    1031: ifeq 1336           // handlers only run when aNotUnified
    1034: aload_0
    1035: getfield #162     // Field mRecipeMapHandlers:Ljava/util/List;
    1049..1104: for each handler: if (h.isDone()) mRecipeMapHandlers.remove(h);
    1107: ... if (mRecipeMapHandlers.isEmpty()) -> 1336
    1119: iconst_0
    1120: istore_3            // aNotUnified = false
    1121: aload 9             // aInputs
    1147: aload 13
    1149: invokestatic #946 // Method gregapi/util/ST.valid:(Lnet/minecraft/item/ItemStack;)Z
    1155: aload 13
    1157: invokestatic #834 // Method gregapi/util/OM.data_:(Lnet/minecraft/item/ItemStack;)Lgregapi/oredict/OreDictItemData;
    1160: astore 14
    1162..1203: for (IRecipeMapHandler h : mRecipeMapHandlers)
    1203: invokeinterface #950 // Method gregapi/recipes/IRecipeMapHandler.addRecipesUsing:(Lgregapi/recipes/Recipe$RecipeMap;ZLnet/minecraft/item/ItemStack;Lgregapi/oredict/OreDictItemData;)Z
    1208: ifeq 1213
    1211: iconst_1
    1212: istore_3            // any handler added something -> aNotUnified = true
    ...
    1222..1305: same loop for fluid inputs: h.addRecipesUsing(map, false, fluidStack.getFluid())
    1314: iload_3
    1315: ifeq 1336
    1318: aload_0 ... iconst_0 ... invokevirtual #588 // findRecipeInternal(..., false, ...)
    1335: areturn            // RE-RUN the whole lookup with the freshly added recipes
```

> **A.1 finding #2:** for **every** input stack that carries `OreDictItemData`,
> all registered `IRecipeMapHandler`s get a chance to *add recipes on the fly*
> (`addRecipesUsing(map, false, stack, OM.data_(stack))`), and if any did, the lookup
> **recurses once** with `aNotUnified = false` so the new recipes are found.
> The data source is `OM.data_(stack)` = `OreDictManager.getItemData_(stack, false)`,
> i.e. **the same `sItemStack2DataMap` entry that `OM.addItemData`/`OM.association` fills.**

### `mRecipeItemMap` key semantics

`gregapi.code.ItemStackContainer` fields (`ItemStackContainer.class` line 3-9):

```
  public final net.minecraft.item.Item mItem;
  public final net.minecraft.block.Block mBlock;
  public final byte mStackSize;
  public final short mMetaData;
```

No NBT field → **keys are Item + meta only; NBT is ignored** (good news: NBT-carrying
foreign items still match). `addToItemMap` (RecipeMap.class @ 6609) populates it:

```
    6628: new #1015        // class gregapi/code/ItemStackContainer
    6631: invokespecial #1018 // ItemStackContainer."<init>":(Lnet/minecraft/item/ItemStack;)V
    6634: getfield #177     // mRecipeItemMap
    6650: invokevirtual #1022 // Method gregapi/code/ItemStackMap.put:(Lgregapi/code/ItemStackContainer;Ljava/lang/Object;)V
```

and `ItemStackMap.get(ItemStack, long)` (ItemStackMap.class @ 249) builds
`new ItemStackContainer(stack, aLong)` whose ctor **overwrites** the meta with that long
(`ItemStackContainer.class @ 123-160`: `putfield #32 // Field mMetaData:S`), i.e. it is a
meta-substitution lookup, not a mask.

## A.2 All `IRecipeMapHandler` implementations, their semantics, and where they are registered

### Interface

`gregapi/recipes/IRecipeMapHandler.class` (whole file, 20 lines):

```
public interface gregapi.recipes.IRecipeMapHandler {
  public abstract boolean addRecipesUsing(Recipe$RecipeMap, boolean, ItemStack, OreDictItemData);
  public abstract boolean addRecipesUsing(Recipe$RecipeMap, boolean, Fluid);
  public abstract boolean addRecipesProducing(Recipe$RecipeMap, boolean, ItemStack, OreDictItemData);
  public abstract boolean addRecipesProducing(Recipe$RecipeMap, boolean, Fluid);
  public abstract boolean containsInput(Recipe$RecipeMap, ItemStack, OreDictItemData);
  public abstract boolean containsInput(Recipe$RecipeMap, Fluid);
  public abstract boolean addAllRecipes(Recipe$RecipeMap);
  public abstract boolean isDone();
  public abstract boolean onAddedToMap(Recipe$RecipeMap);
}
```
(the abstract base class `IRecipeMapHandler$RecipeMapHandler` provides no-op bodies —
all five handler classes extend it: `public class gregapi.recipes.handlers.RecipeMapHandler* extends gregapi.recipes.IRecipeMapHandler$RecipeMapHandler`.)

Implementations found in the jar (`gregapi/recipes/handlers/*.class`, 5 files) — that is
**all** of them:

| class | class decl (javap line 2) |
|---|---|
| `RecipeMapHandlerPrefix` | `extends IRecipeMapHandler$RecipeMapHandler` |
| `RecipeMapHandlerMaterial` | `extends IRecipeMapHandler$RecipeMapHandler` |
| `RecipeMapHandlerCrushing` | `extends IRecipeMapHandler$RecipeMapHandler` |
| `RecipeMapHandlerPrefixForging` | `extends RecipeMapHandlerPrefix` |
| `RecipeMapHandlerPrefixShredding` | `extends RecipeMapHandlerPrefix` |

### Registration site: NOT in `RM`

`grep 'RecipeMapHandler'` over the whole extracted tree matches exactly 9 class files,
and the only one that *instantiates* handlers is:

```
E:\game\minecraft\gt6\tools\_tmp_gt6\gregtech\loaders\c\Loader_Recipes_Handlers.class
```

`gregapi/data/RM.class` contains **zero** occurrences of `RecipeMapHandler`
(`Select-String -Path RM.txt -Pattern 'Handler'` → 0 matches), i.e. `RM`'s static init only
*creates* the maps; the handlers are added later by that loader via
`Recipe$RecipeMap.add(IRecipeMapHandler)`:

```
Loader_Recipes_Handlers.class @ 35103: getstatic #964  // Field gregapi/data/RM.Cutter:Lgregapi/recipes/Recipe$RecipeMap;
                       @ 35106: new      #87   // class gregapi/recipes/handlers/RecipeMapHandlerPrefix
                       @ 35176: invokespecial #513 // RecipeMapHandlerPrefix."<init>":(LOreDictPrefix;JLFluidStack;JJJLFluidStack;LOreDictPrefix;JLItemStack;LItemStack;ZZZLICondition;)V
                       @ 35179: invokevirtual #127 // Method Recipe$RecipeMap.add:(Lgregapi/recipes/IRecipeMapHandler;)Z
```

Pairing every `getstatic RM.<Map>` with the following `new .../handlers/X` in that class
(script over the javap dump) yields the **complete** handler map:

```
  29x  Anvil        <- RecipeMapHandlerPrefix
  16x  Anvil        <- RecipeMapHandlerPrefixShredding
   3x  AnvilBendBig <- RecipeMapHandlerPrefix
   2x  AnvilBendSmall <- RecipeMapHandlerPrefix
  12x  Autoclave     <- RecipeMapHandlerPrefix
  42x  Bath         <- RecipeMapHandlerMaterial
  55x  Boxinator    <- RecipeMapHandlerPrefix
   2x  ClusterMill  <- RecipeMapHandlerPrefix
  24x  Compressor   <- RecipeMapHandlerPrefix
   1x  Crusher      <- RecipeMapHandlerCrushing
  11x  Crusher      <- RecipeMapHandlerPrefix
  20x  Cutter       <- RecipeMapHandlerPrefix
   8x  Extruder     <- RecipeMapHandlerPrefixForging
   1x  Freezer      <- RecipeMapHandlerMaterial
   1x  Generifier   <- RecipeMapHandlerMaterial
  22x  Lathe        <- RecipeMapHandlerPrefix
   1x  Loom         <- RecipeMapHandlerPrefix
  34x  Mortar       <- RecipeMapHandlerPrefix
   3x  Polarizer    <- RecipeMapHandlerMaterial
  11x  Press        <- RecipeMapHandlerPrefix
   8x  RollBender   <- RecipeMapHandlerPrefix
   2x  RollFormer   <- RecipeMapHandlerPrefix
  22x  RollingMill  <- RecipeMapHandlerPrefix
  20x  Sharpening   <- RecipeMapHandlerPrefix
   2x  Shredder     <- RecipeMapHandlerPrefix
  34x  Shredder     <- RecipeMapHandlerPrefixShredding
   1x  Sifting      <- RecipeMapHandlerPrefix
   2x  Sluice       <- RecipeMapHandlerPrefix
  35x  Unboxinator  <- RecipeMapHandlerPrefix
  46x  Welder       <- RecipeMapHandlerPrefix
   8x  Wiremill     <- RecipeMapHandlerPrefix
```

Notes:
* `RM.Furnace` is a `RecipeMapFurnace` (`RM.class @ 2484: new #1778 // class gregapi/recipes/maps/RecipeMapFurnace`) and `RM.Smelter` is a plain `RecipeMap` (`"gt.recipe.smelter"`, `RM.class @ 9071`); **neither has any `IRecipeMapHandler`** → smelter/furnace recipes are always *stored* recipes, never synthesized.
* `RM.Sifting`/`RM.Sluice`/`RM.Loom`/`RM.ClusterMill`/`RM.RollFormer`/`RM.Anvil*` exist as separate maps with their own handlers.

### `RecipeMapHandlerPrefix` — prefix→prefix conversion, **synthesized per material**

Ctor (RecipeMapHandlerPrefix.class @ 41; the 3-arg-array variant @ 421 is what the loader
uses) collects `mInputPrefixes[]`, `mInputAmounts[]`, `mOutputPrefixes[]`,
`mOutputAmounts[]`, `mAdditionalInput`, `mAdditionalOutput`,
`mAllowToGenerateAllRecipesAtOnce`, `mCondition`, `mOutputPulverizedRemains`.

`addRecipesUsing(map, aIsFirst, aStack, aItemData)` (@ 597):

```
       9: aload_3; 10: getfield #107  // Field mAdditionalInput:Lnet/minecraft/item/ItemStack;
      14: invokestatic  #172          // Method gregapi/util/ST.equal:(LItemStack;LItemStack;)Z
      17: ifeq 45
      20: iload_2 (aIsFirst) ... 25: getfield #70 // Field mAllowToGenerateAllRecipesAtOnce:Z
      33: invokevirtual #176          // Method addAllRecipesInternal:(LRecipe$RecipeMap;)Z
      44: ireturn                      // "the stack IS my additional input" -> generate everything
      45: aload 4  (aItemData)
      47: ifnull 93
      50: aload 4
      52: invokevirtual #181          // Method gregapi/oredict/OreDictItemData.validData:()Z
      55: ifeq 93
      58: aload 4
      60: getfield #184               // Field OreDictItemData.mPrefix:Lgregapi/oredict/OreDictPrefix;
      63: aload_0
      64: getfield #89                // Field mInputPrefixes:[LOreDictPrefix;
      67: invokestatic #188           // Method gregapi/util/UT$Code.contains:(Ljava/lang/Object;[Ljava/lang/Object;)Z
      70: ifeq 93
      73: aload_0
      74: aload_1 (map)
      77: getfield #192               // Field OreDictItemData.mMaterial:LOreDictMaterialStack;
      80: getfield #197               // Field OreDictMaterialStack.mMaterial:LOreDictMaterial;
      83: invokevirtual #201          // Method addRecipeForMaterial:(LRecipe$RecipeMap;LOreDictMaterial;)Z
      86: ifeq 93
      89: iconst_1
      90: goto 94                     // -> true (recipe was added)
```

`addRecipeForMaterial(map, material)` (@ 916) builds the recipe **from the prefix/material,
not from your stack**:

```
       0: getfield #87  // mCondition   ... isTrue(material) ?  ... 
      13: aload_2
      14: getstatic #320 // Field gregapi/data/TD$Properties.INVALID_MATERIAL:Lgregapi/code/TagData;
      17: invokevirtual #323 // OreDictMaterial.contains:(LTagData;)Z
      20: ifeq 25
      23: iconst_0
      24: ireturn                // INVALID materials never produce recipes
      ...
      83: aload_3; 84: iload 4; 86: aload_0; 87: getfield #89 // mInputPrefixes
      92: aaload
      93: aload_2 (material)
      94: getfield #95  // mInputAmounts
      98: iload 4; 100: baload; 102: invokevirtual #333 // Method OreDictPrefix.mat:(LOreDictMaterial;J)Lnet/minecraft/item/ItemStack;
      ...
     184: getfield #101 // mOutputPrefixes
     191: aload 4 (output material)
     201: invokevirtual #333 // OreDictPrefix.mat:(LOreDictMaterial;J)Lnet/minecraft/item/ItemStack;
     209: invokestatic #336 // ST.invalid:(LItemStack;)Z
     213: ireturn  (false if any prefix.mat() is invalid)
```

> **A.2 finding:** `RecipeMapHandlerPrefix` regenerates the *same generic recipe* for
> whatever material shows up, using `OreDictPrefix.mat(material, amount)` for both the
> input and the output key. `OP.mat()` resolves through the OreDictionary/unification maps
> (see B), so it works for foreign materials **as long as an item for that prefix+material
> actually exists somewhere in the Forge OreDictionary**.
> `RecipeMapHandlerPrefixShredding` and `RecipeMapHandlerPrefixForging` only override
> `getOutputMaterial`/`getCosts` (their whole call list is
> `mTargetPulver.mMaterial` / `mTargetForging` + super ctor), so they behave identically
> w.r.t. *which* stacks get recipes; only the output material + cost/EU differ.

### `RecipeMapHandlerMaterial` — "material X (+fluid) → material Y (+fluid)"

`addRecipesUsing` (@ 63):

```
      45: aload 4 (aItemData)
      47: ifnull 90
      50: aload 4
      52: invokevirtual #102 // OreDictItemData.validData:()Z
      55: ifeq 90
      58: aload 4
      60: getfield #106  // Field OreDictItemData.mMaterial:LOreDictMaterialStack;
      63: getfield #110  // Field OreDictMaterialStack.mMaterial:LOreDictMaterial;
      66: aload_0
      67: getfield #62   // Field mInputMaterial:LOreDictMaterial;
      70: if_acmpne 90      // REQUIRES data.mMaterial == this handler's configured material
      73: aload_0
      74: aload_1 (map)
      75: aload 4
      77: getfield #114  // Field OreDictItemData.mPrefix:LOreDictPrefix;
      80: invokevirtual #118 // Method addRecipeForPrefix:(LRecipe$RecipeMap;LOreDictPrefix;)Z
```

> Strict `==` on the material object → this handler only fires for the materials GT6
> itself configured it for (42× for `RM.Bath`). It will **not** fire for a brand-new
> foreign material unless you register a handler for it yourself.
> `addRecipesProducing` (@ 110) is the mirror image using `mOutputMaterial`.

### `RecipeMapHandlerCrushing` — uses **your actual stack** as the recipe input

`addRecipesUsing` (@ 9) gate:

```
       0: aload 4; 2: ifnull 94
      14: invokevirtual #53  // OreDictItemData.validData:()Z
      18: getstatic #62      // Field gregapi/data/OP.oreBedrock:Lgregapi/oredict/OreDictPrefix;
      21: if_acmpeq 94
      29: getstatic #66      // Field gregapi/data/TD$Prefix.ORE:Lgregapi/code/TagData;
      32: invokevirtual #72  // OreDictPrefix.contains:(LTagData;)Z
      35: ifeq 94             // prefix must be an ORE prefix
      49: getstatic #77      // TD$Prefix.DUST_ORE
      55: getstatic #80      // TD$Prefix.IS_CONTAINER
      59: invokevirtual #84  // OreDictPrefix.containsAny:([LTagData;)Z
      62: ifne 94
      73: getstatic #96      // TD$Atomic.ANTIMATTER
      76: invokevirtual #99  // OreDictMaterial.contains:(LTagData;)Z
      79: ifne 94
      85: IL.PFAA_Sands.equal(stack,true,true)
      91: ifeq 96
      96: aload 4
      98: getfield #88  // OreDictItemData.mMaterial
     101: getfield #93  // OreDictMaterialStack.mMaterial
     104: getfield #112 // Field OreDictMaterial.mTargetCrushing:LOreDictMaterialStack;
     107: getfield #93  // OreDictMaterialStack.mMaterial
     110: astore 5        // tCrushed = material.mTargetCrushing.mMaterial
     ...
     136: getfield #120 // Field OreDictMaterial.mOreProcessingMultiplier:B
     140: lstore 8
```

and the recipe it adds (end of the method, @ 473-545):

```
     477: iconst_0
     478: lconst_1
     479: aload_3
     480: invokestatic #193 // Method gregapi/util/ST.amount:(JLItemStack;)LItemStack;
     483: aastore
     484: invokestatic #197 // ST.array:([LItemStack;)[LItemStack;      <-- INPUT = your stack
     493: aload 10
     495: aastore                                                     <-- OUTPUT = prefix.mat(crushed material, amount)
     507: iconst_1
     508: bipush 16          <-- EU/t = 16
     510: aload 10 ... field_77994_a ... Math.max(...)  <-- duration
     538: ldc2_w #215        // long 16l
     545: invokevirtual #223 // Method Recipe$RecipeMap.addRecipe:(LRecipe;)Lgregapi/recipes/Recipe;
```

(`containsInput(map, stack, data)` @ 661 is the same predicate; the crusher also has
`addRecipesProducing` for the "what produces this dust" direction.)

> **A.2 finding (crushing):** the Crusher handler adds a real recipe whose **input key is
> the very `ItemStack` you passed**, provided its `OreDictItemData` says
> "ORE-ish prefix" and the material has `mTargetCrushing` and is not
> antimatter/`oreBedrock`/container/PFAA-sand. This path therefore works even for
> materials GT6 does not know.

## A.3 Bottom line: does `OM.addItemData(foreignStack, new OreDictItemData(prefix, material))` suffice?

**(a) NEI recipe display.** Partly yes, and for the reason that matters: `getNEIRecipes`
and `getNEIUsages` run the same `mRecipeMapHandlers` pass as the runtime lookup —

```
RecipeMap.class @ 6270 (inside getNEIRecipes, decl @ 6219):
     109: invokestatic #834  // Method gregapi/util/OM.data_:(LItemStack;)LOreDictItemData;
     155: invokeinterface #1004 // Method IRecipeMapHandler.addRecipesProducing:(LRecipe$RecipeMap;ZLItemStack;LOreDictItemData;)Z
RecipeMap.class @ 6465 (inside getNEIUsages, decl @ 6414):
     109: invokestatic #834  // Method gregapi/util/OM.data_:(LItemStack;)LOreDictItemData;
     155: invokeinterface #950  // Method IRecipeMapHandler.addRecipesUsing:(LRecipe$RecipeMap;ZLItemStack;LOreDictItemData;)Z
```

so a foreign stack with item data shows the generated machine recipes in NEI (for maps that
have handlers whose prefixes match). Display of the item *as that material* on the material
page/tooltip was not traced — **UNVERIFIED**.

**(b) Actually accepted by Crusher / Mortar / Shredder / Smelter / etc.?**
* **Mortar / Shredder / Anvil / Compressor / Cutter / Lathe / RollingMill / Wiremill /
  Boxinator / Unboxinator / Welder / Press / Autoclave / Sharpening / …** →
  **YES, automatically**, because (i) `findRecipe` unifies the input via
  `getStackArray(true, …)`/`getStack_(false, …)` and (ii) `RecipeMapHandlerPrefix` fires on
  `data.mPrefix ∈ mInputPrefixes` and adds the generic recipe for `data.mMaterial`.
* **Crusher** → **YES for ore-prefix items** (its own handler keys the recipe on your stack),
  and also yes for non-ore prefixes via the registered `RecipeMapHandlerPrefix` entries.
* **Smelter / Furnace** → **NO** (no handler is registered on either map; only explicitly
  stored recipes work — `RM.Furnace` is a `RecipeMapFurnace`, `RM.Smelter` is a plain map).
* **Bath / Polarizer / Freezer / Generifier / Sifting / Sluice / Loom** → only for the
  materials GT6 configured them for (`RecipeMapHandlerMaterial` uses `==` on the material;
  `RecipeMapHandlerPrefix` for Sifting/Sluice/Loom fires for any material).

**Conditions that silently break it (all required):**
1. **The material must be known and not invalid.** Otherwise `addItemData` is *not* what
   GT6's own ore-dict listener does, and worse, GT6's automatic path bails out:
   ```
   OreDictManager.class @ 1947: invokestatic #1075 // Method gregapi/oredict/OreDictMaterial.createAutoInvalidMaterial:(Ljava/lang/String;)LOreDictMaterial;
   OreDictManager.class @ 2015: aload 6
                         @ 2016: getstatic #1090 // Field gregapi/data/TD$Properties.INVALID_MATERIAL:Lgregapi/code/TagData;
                         @ 2017: invokevirtual #1079 // OreDictMaterial.contains:(LTagData;)Z
                         @ 2018: ifne 982          <-- skip ALL binding work
   ```
   `createAutoInvalidMaterial` tags the material
   `INVALID_MATERIAL | UNUSED_MATERIAL | AUTO_BLACKLIST | AUTO_MATERIAL`
   (`OreDictMaterial.class @ 411-443`), and `RecipeMapHandlerPrefix.addRecipeForMaterial`
   refuses `INVALID_MATERIAL` at @ 920-928. **So for a material GT6 doesn't have, you must
   call `OreDictMaterial.createMaterial(...)` early enough** (see B.2).
2. **The item data must exist** — `OM.data(stack, data)` only writes if the stack has *no*
   data yet (`addItemData_` in B.1); if GT6 already bound that stack, your call is a silent
   no-op returning `false`.
3. **A stack for the *input and output* prefixes must resolve**: `addRecipeForMaterial`
   returns `false` the moment any `prefix.mat(material, n)` is `null`
   (`RecipeMapHandlerPrefix.class @ 107-114` for the inputs, `@ 206-213` for the outputs;
   `209: invokestatic #336 // ST.invalid:(LItemStack;)Z ; 212: iconst_0 ; 213: ireturn`).
   `OreDictPrefix.mat(material, amount)` → `OreDictManager.getStack(prefix, material, CS.NI, amount)`
   (`OreDictPrefix.class @ 1983`), which resolves through `sName2StackMap` / the Forge
   OreDictionary **and, as a last resort, through GT6's own item generators**:
   ```
   OreDictManager.class @ 2555:
        0: getstatic #521 // Field gregapi/data/CS.GAPI:Lgregapi/api/Abstract_Mod;
        3: getfield #707 // Field gregapi/api/Abstract_Mod.mStartedInit:Z
        6: ifeq 43
        9..39: getStack(prefix.mNameInternal + material.mNameInternal, aDefault, aAmount, false, false) ; areturn
       43..76: tStack = getStack(<name>, aDefault, aAmount, false, false)
       78: aload 6 ; 80: ifnonnull 134
       83: aload_2 ; 84: getfield #1252 // Field OreDictMaterial.mID:S
       87: iflt 134                      // no valid material ID -> give up
       90: aload_1 ; 91: aload_2
       92: invokevirtual #1256 // Method OreDictPrefix.isGeneratingItem:(LOreDictMaterial;)Z
       95: ifeq 134
       98: aload_1 ; 99: getfield #1259 // Field OreDictPrefix.mRegisteredPrefixItems:Ljava/util/List;
      107: ifne 134 ; 110..116: get(0) ; 123: lload 4 (amount) ; 126..130: ST.make(item, amount, material.mID)
      133: areturn
   ```
   i.e. **`prefix.mat()` silently falls back to GT6's own generated item for that
   prefix+material** when the material has a valid `mID` and the prefix generates items.
   Consequences: (i) a brand-new material created with `createMaterial(-1, …)` (no ID) has
   **no** generated items, so you must supply real items for those prefixes via the Forge
   OreDictionary; (ii) if a generated GT item *does* exist, the generic recipe is keyed on
   **GT's item**, so your foreign stack must be unified to it (via `sName2StackMap`, i.e.
   `addAssociation`/`setTarget`/ore-dict registration) to be matched.
4. **Timing**: anything that goes through GT's own `registerOre_` throws after PostInit:
   ```
   OreDictManager.class @ 3690: getstatic #1532 // Field gregapi/api/Abstract_Mod.sStartedPostInit:I
                         @ 3693: new #1534      // class java/lang/IllegalStateException
                         @ 3695: ldc_w #1536   // String Late OreDict Registration using GT OreDict Utility. Only @Init and @PreInit are allowed for this when you use this Function instead of the Forge one.
   ```
   `setTarget_` calls `registerOre_` unless `aIsWildcard` is true (`@ 2423 ifne 56`).
   `addItemData_`/`addAssociation`/`setItemData_` have **no** such guard (they only write
   `sItemStack2DataMap`, `OreDictManager.class @ 3150-3158`), so they are the late-safe calls.

**Minimal "make the foreign item processable" recipe for a material GT6 does NOT know:**

```java
// 1) preInit / init: teach GT6 the material (valid ID => must be PreInit or earlier!)
OreDictMaterial mat = OreDictMaterial.createMaterial(32000, "Enderium", "Enderium");
// 2) register the Forge ore names (GT6's OreDictManager listens to OreRegisterEvent and
//    binds prefix+material automatically when the material is valid, see B.4)
OreDictionary.registerOre("ingotEnderium", myIngot);
OreDictionary.registerOre("dustEnderium",  myDust);   // needed so prefix.mat() resolves
// 3) after the ore dict is settled (postInit is fine): rebuild the lookup keys
Recipe.reInit();      // -> RecipeMap.reInit() for every map
```
If you cannot register a matching Forge ore name, or GT6's listener did not bind it, do it
by hand with the late-safe calls and then rebuild:

```java
OreDictManager.INSTANCE.addAssociation(OreDictPrefix.get("ingot"), mat, myIngot); // = setItemData_
Recipe.reInit();
```
(plus explicit `RM.<Map>.addRecipe1(...)` calls for maps without a matching handler —
see C).

---

# B. OREDICT / MATERIAL BINDING API

## B.0 Entry points

* There is **no** `gregapi.data.OM`. The helpers are `gregapi.util.OM`
  (`Test-Path ...\gregapi\data\OM.class` → False, `...\gregapi\util\OM.class` → True),
  all `public static`.
* The manager singleton is a **public static field**:
  `public static final gregapi.oredict.OreDictManager INSTANCE;`
  (used as `getstatic #784 // Field gregapi/oredict/OreDictManager.INSTANCE:Lgregapi/oredict/OreDictManager;`
  e.g. RecipeMap.class @ 100, OM.class @ 545).

`gregapi.util.OM` wrappers (bytecode-verified delegations):

| `OM.*` helper | delegates to | OM.class @ |
|---|---|---|
| `OM.data(ItemStack, OreDictItemData)` (void) | `OreDictManager.INSTANCE.addItemData_(stack, data)` | 540 |
| `OM.association(ItemStack, OreDictPrefix, OreDictMaterial)` | `OreDictManager.INSTANCE.addAssociation(prefix, material, stack)` | 1095 |
| `OM.association_(ItemStack, prefix, material)` | `addAssociation_(...)` | 1105 |
| `OM.reg(prefix, material, ItemStack)` / `OM.reg(stack, prefix, material)` | `registerOre(prefix, material, stack)` | 1115 / 1133 |
| `OM.reg(stack, Object name)` | `registerOre(Object, stack)` | 1151 |
| `OM.data(ItemStack)` / `OM.data_(ItemStack)` | `getItemData(stack, false)` / `getItemData_(stack, false)` | 1047 / 1055 |
| `OM.anydata(ItemStack)` / `OM.anydata_(...)` | `getItemData(stack, true)` (incl. `gt.recycling.mats` NBT) | 1063 / 1071 |
| `OM.stack(material, amount)` | `new OreDictMaterialStack(material, amount)` | 2411 |

## B.1 `addItemData` / `setItemData` / `addAssociation` / `setTarget` / `registerOre`

### `addItemData` — non-destructive, only sets data if there is none

```
OreDictManager.class @ 2997:
  public boolean addItemData(net.minecraft.item.ItemStack, gregapi.oredict.OreDictItemData);
       0: aload_1
       1: invokestatic #1210 // Method gregapi/util/ST.invalid:(LItemStack;)Z
       4: ifeq 9
       7: iconst_0
       8: ireturn                       // invalid stack -> false
       9: aload_0
      10: aload_1
      11: invokevirtual #1175 // Method getItemData_:(LItemStack;)LOreDictItemData;
      14: ifnonnull 24
      17: aload_0 ... 20: invokevirtual #1355 // Method setItemData_:(LItemStack;LOreDictItemData;)Z
      23: ireturn
      24: iconst_0
      25: ireturn                       // already has data -> false, nothing written
```
`addItemData_` (@ 3016) is the same without the `ST.invalid` check and additionally rejects
`data == null`.

### `setItemData` — overwrite, but **refuses** to replace an existing non-Wood binding

```
OreDictManager.class @ 3032:
  public boolean setItemData(ItemStack, OreDictItemData);
       0: aload_1 ... ST.invalid -> return false
       7: aload_2; 8: ifnonnull 13; 11: iconst_0; 12: ireturn   // data == null -> false
      13: ... invokevirtual #1355 // setItemData_:(LItemStack;LOreDictItemData;)Z

OreDictManager.class @ 3047 (setItemData_):
       3: invokevirtual #1326 // Method getAssociation_:(LItemStack;Z)LOreDictItemData;
       7: aload_3; 8: ifnull 39
      11: aload_3
      12: getfield #1360 // Field OreDictItemData.mMaterial:LOreDictMaterialStack;
      15: getfield #1364 // Field OreDictMaterialStack.mMaterial:LOreDictMaterial;
      18: getstatic #1367 // Field gregapi/data/MT.Wood:LOreDictMaterial;
      21: if_acmpeq 39
      24: ... getstatic #1368 // Field gregapi/data/ANY.Wood:LOreDictMaterial;
      34: if_acmpeq 39
      37: iconst_0
      38: ireturn           // existing non-Wood binding -> refused
      39: aload_1
      40: getfield #595   // Field ItemStack.field_77994_a:I      (stackSize)
      44: if_icmple 126   // if size > 1, DIVIDE all amounts by stackSize and normalise to 1 item
      ...
     127/143: mBlackListed / mBlocked computation
     209: getfield #434   // Field sItemStack2DataMap:Ljava/util/Map;
     213: new #1164      // class gregapi/code/ItemStackContainer
     222: invokeinterface #644 // Map.put:(Ljava/lang/Object;Ljava/lang/Object;)V
     228: validMaterial() ... 3229: validPrefix() -> recyclable listeners
```

Caveats derived from this body:
* **Use a stack of size 1.** If `stackSize > 1`, `setItemData_` **mutates your
  `OreDictItemData` in place**, dividing `mMaterial.mAmount` (and every byproduct amount) by
  the stack size (`@ 3069-3112`), then normalises the stack to 1.
* Rebinding an item that GT6 already classified (other than Wood) **fails silently**.
* It stores into `sItemStack2DataMap` keyed by `ItemStackContainer` (Item+meta, no NBT).

### `addAssociation` — "this stack IS prefix+material" convenience call

```
OreDictManager.class @ 3476 / @ 3494:
  addAssociation(prefix, material, stack):
       0..12: if (prefix == null || material == null || ST.invalid(stack)) return false;
      17: ... invokevirtual #1224 // Method addAssociation_:(LOreDictPrefix;LOreDictMaterial;LItemStack;)Z

  addAssociation_(prefix, material, stack):
       0: aload_3; 1: invokestatic #769 // Method gregapi/util/ST.meta_:(LItemStack;)S
       4: sipush 32767
       7: if_icmpne 52              // if stack meta == 32767 -> loop meta 0..15
      20..38: setItemData_(ST.copyAmountAndMeta(1, i, stack), new OreDictItemData(prefix, material))
      52: ... setItemData_(stack, new OreDictItemData(prefix, material))
```
→ `addAssociation(p, m, stack)` **is exactly** `setItemData_(stack, new OreDictItemData(p, m))`.
It does **not** touch `sName2StackMap` and does **not** register anything in the Forge
OreDictionary — which is precisely why it is safe to call after PostInit.

### `setTarget` / `addTarget` — bind **and** make it the unification target

`addTarget(p, m, stack)` = `setTarget(p, m, stack, false, false, false)` (@ 2230-2240).

```
OreDictManager.class @ 2408 (setTarget_, 6 args: prefix, material, stack, z4, z5, z6):
       0: dup; 2: getfield #448 // Field isAddingOre:I ; +1 ; putfield       (re-entrancy guard)
      10: lconst_1; 11: aload_3; 12: invokestatic #1213 // ST.amount:(JLItemStack;)LItemStack;
      17: aconst_null; 18: invokevirtual #1217 // ItemStack.func_77982_d:(LNBTTagCompound;)V   (strip NBT)
      21: iload 5
      23: ifne 56                 // if (z5/wildcard) skip the Forge re-registration
      26..51: registerOre_(prefix.mNameInternal + material.mNameInternal, stack)
      56: addAssociation_(prefix, material, stack)
      64: iload 6 (z6 = skipBlacklist)
      66: ifne 77
      69: isBlacklisted(stack) ? -> skip the target map write
      77: iload 4 (z4 = overwrite)
      79: ifne 124                // overwrite -> always put
      82: sName2StackMap.get(name) ; ST.invalid(...) ? fallthrough : skip
     124: sName2StackMap.put(prefix.mNameInternal + material.mNameInternal, stack)
     159: isAddingOre--  ;  169: iconst_1  ;  ireturn
```

So `setTarget(p, m, stack)`:
1. normalises the stack to amount 1 and **clears its NBT**,
2. calls `registerOre_(prefix+material name, stack)` → **Forge OreDictionary
   registration + GT registration; throws `IllegalStateException` after PostInit**,
3. `addAssociation_` (item data),
4. writes `sName2StackMap[<prefix><material>] = stack` **only if no target exists yet**
   (`z4 = false` → "first one wins"),
5. `addTarget`/`setTarget` return `false` if any argument is null or the stack's meta == 32767.

The public 5-arg `setTarget(p, m, stack, boolean, boolean)` and 6-arg overloads let you
force overwrite of the target (`4th` boolean) and treat it as a non-Forge wildcard
(`5th` boolean) — see the calls below.

### `registerOre(Object, ItemStack)` / `registerOre(prefix, material, ItemStack)`

```
OreDictManager.class @ 3630: registerOre(prefix, material, stack) -> registerOre_(prefix, material, stack)
OreDictManager.class @ 3644: registerOre_(prefix, material, stack):
       0..22: new StringBuilder().append(prefix.mNameInternal).append(material.mNameInternal).toString()
      25: aload_3
      26: invokevirtual #1221 // Method registerOre_:(Ljava/lang/Object;LItemStack;)Z
OreDictManager.class @ 3661: registerOre(Object name, ItemStack stack) -> registerOre_(Object, ItemStack)
OreDictManager.class @ 3677: registerOre_(Object, ItemStack):
       0: ldc_w #1522 // String gt:delate   ... special "remove" pseudo-name
      27: getstatic #1532 // Field gregapi/api/Abstract_Mod.sStartedPostInit:I
      30: ifle 44
      33: new #1534 // class java/lang/IllegalStateException
      37: ldc_w #1536 // String Late OreDict Registration using GT OreDict Utility. Only @Init and @PreInit are allowed for this when you use this Function instead of the Forge one.
      43: athrow
      44: name = aName.toString() ...
```
There is also `public static void registerOreSafe(Object, ItemStack)` (@ 3611) which is the
non-throwing wrapper GT uses internally for its own re-registrations.

### `getStack_` — the unification itself (what makes foreign items work)

```
OreDictManager.class @ 2860:
  public net.minecraft.item.ItemStack getStack_(boolean aAllowBlacklisted, net.minecraft.item.ItemStack aStack);
       0: aload_0
       1: aload_2
       2: iconst_0
       3: invokevirtual #1326 // Method getAssociation_:(LItemStack;Z)LOreDictItemData;
       6: astore_3
       7: aconst_null
       8: astore 4
      10: aload_3
      11: ifnull 25                // no item data -> return copy of the stack
      14: iload_1
      15: ifeq 30                  // !aAllowBlacklisted -> unify
      18: aload_3
      19: getfield #1178 // Field OreDictItemData.mBlocked:Z
      22: ifeq 30
      25: aload_2 ; 26: invokestatic #1329 // ST.copy  ; areturn
      30: aload_3
      31: getfield #1332 // Field OreDictItemData.mUnificationTarget:Lnet/minecraft/item/ItemStack;
      34: ifnonnull 57
      37: aload_3
      38: aload_0
      39: getfield #429  // Field sName2StackMap:Ljava/util/Map;
      42: aload_3
      43: invokevirtual #1333 // Method OreDictItemData.toString:()Ljava/lang/String;
      46: invokeinterface #638 // Map.get:(Ljava/lang/Object;)Ljava/lang/Object;
      51: checkcast #436
      54: putfield #1332 // OreDictItemData.mUnificationTarget   (lazy cache)
      57: aload_2
      58: getfield #595  // ItemStack.field_77994_a:I
      61: i2l
      62: aload_3
      63: getfield #1332 // mUnificationTarget
      66: invokestatic #1213 // ST.amount:(JLItemStack;)LItemStack;
      69: dup; 70: astore 4
      72: invokestatic #1210 // ST.invalid:(LItemStack;)Z
      75: ifeq 83
      78: aload_2 ; 79: invokestatic #1329 // ST.copy ; areturn
      83: aload 4
      85: aload_2
      86: invokevirtual #1337 // Method ItemStack.func_77978_p:()LNBTTagCompound;
      89: invokevirtual #1217 // ItemStack.func_77982_d:(LNBTTagCompound;)V
      92: aload 4 ; 94: areturn
```
`getAssociation_` (@ 3547) only returns data when it is valid **and** the prefix is not `OP.ore`:
```
       7: aload_3; 8: ifnull 32
      11: aload_3; 12: invokevirtual #1499 // OreDictItemData.validData:()Z
      15: ifeq 32
      18: aload_3
      19: getfield #1409 // Field OreDictItemData.mPrefix:LOreDictPrefix;
      22: getstatic #1068 // Field gregapi/data/OP.ore:LOreDictPrefix;
      25: if_acmpeq 32
      28: aload_3; 29: goto 33
      32: aconst_null
      33: areturn
```

> Consequence: **a plain `addItemData`/`addAssociation` binding is enough for the machine
> lookup to swap your stack for GT's canonical stack of the same `prefix+material`
> (`sName2StackMap[prefix.mNameInternal + material.mNameInternal]`), which is how the
> stored/`prefix.mat()`-generated recipes get found.** Because `getStack_` copies your
> stack's NBT onto the canonical stack, don't rely on NBT surviving that hop.
> Exception: items with prefix `OP.ore` are never unified here — they are handled by
> `RecipeMapHandlerCrushing` instead (A.2).

### Answer to "which call is right for *this foreign stack IS an ingot of Iron*?"

| intent | call |
|---|---|
| late (postInit+) safe, no Forge registration, "it's an ingot of Iron", machine lookup unifies it | `OreDictManager.INSTANCE.addAssociation(OP.ingot, MT.Iron, stack)` (= `setItemData_`) |
| same, but only if GT6 has no data yet (won't overwrite) | `OreDictManager.INSTANCE.addItemData_(stack, new OreDictItemData(OP.ingot, MT.Iron))` / `OM.data(stack, data)` |
| preInit/Init only, also registers the Forge name **and** makes your stack the canonical/unification target | `OreDictManager.INSTANCE.setTarget(OP.ingot, MT.Iron, stack)` / `addTarget` |
| preInit/Init only, full Forge OreDictionary registration (GT's own listener then binds it) | `OreDictionary.registerOre("ingotIron", stack)` or `OreDictManager.INSTANCE.registerOre("ingotIron", stack)` |

## B.2 `OreDictMaterial`

* Registry: `public static final java.util.Map<java.lang.String, OreDictMaterial> MATERIAL_MAP;`
  (`OreDictMaterial.class` line 3); plus `MATERIAL_ARRAY`, `FLUID_MAP`, `ALLOYS`.
* **Keys are Capitalised, case-sensitive** — `sanitize()` is applied on the way in:
  ```
  OreDictMaterial.class @ 518:
       1: ldc_w #405 // String (space) ; 7: replaceAll -> ""
      10: ldc_w #410 // String -       ; 16: replaceAll -> ""
      19: ldc_w #412 // String '       ; 25: replaceAll -> ""
      28: ldc_w #414 // String /       ; 34: replaceAll -> ""
      37: invokestatic #310 // Method gregapi/util/UT$Code.capitalise:(Ljava/lang/String;)Ljava/lang/String;
  ```
  and `createMaterial` stores/reads the **sanitised** name:
  ```
  OreDictMaterial.class @ 209:
      25: aload_1 ; 26: invokestatic #195 // Method sanitize:(Ljava/lang/String;)Ljava/lang/String;
      29: astore_1
      ...
     334: getstatic #316 // Field MATERIAL_MAP:Ljava/util/Map;
     338: invokeinterface #322 // Map.get:(Ljava/lang/Object;)Ljava/lang/Object;
     347: aload_3 ; 348: ifnonnull 363
     351: new #2 // class gregapi/oredict/OreDictMaterial
     359: invokespecial #325 // OreDictMaterial."<init>":(SLjava/lang/String;Ljava/lang/String;)V
     363: iload_0 ; 364: ifge 369
     367: aload_3 ; 368: areturn                    // ID < 0 and name exists -> reuse existing
     377..393: prints "NOTICE: Two Materials used the same ID: <id> - Names: <new> and <old>"
     428: new OreDictMaterial(short id, name, localName) -> tNew
     441: aload_3 ; 442: aload 4 ; 444: invokevirtual #351 // OreDictMaterial.setRegistration:(LOreDictMaterial;)LOreDictMaterial;
     450: areturn                                  // old material now redirects to tNew
  ```
  → `MATERIAL_MAP` keys look like `"Iron"`, `"Copper"`, `"Tin"`, `"Enderium"`.
* `get(String)` — plain map lookup, **no** case folding, unknown → `MT.NULL`:
  ```
  OreDictMaterial.class @ 460: get(String)  -> get(aName, MT.NULL)
  OreDictMaterial.class @ 445: get(String, OreDictMaterial aDefault)
       0: getstatic #316 // MATERIAL_MAP
       4: invokeinterface #322 // Map.get:(Ljava/lang/Object;)
      14: ifnonnull 21
      17: aload_1        // default
      18: goto 25
      21: aload_2 ; 22: invokestatic #384 // Method get:(LOreDictMaterial;)LOreDictMaterial;   (follow mTargetRegistration chain)
  OreDictMaterial.class @ 505: get(OreDictMaterial) loops while (mat != mat.mTargetRegistration) mat = mat.mTargetRegistration;
  ```
* `createMaterial(int aID, String aName, String aLocalName)` (@ 209) — reconstructed flow:
  ```
       0..24: if (aID < 0 || aID >= MATERIAL_ARRAY.length || aID == 32767) aID = -1;
      30: if (aName.isEmpty()) throw IllegalArgumentException("This OreDict Name is not usable, due to being an empty String, after stripping all the minuses and spaces.");
      47..101: if name contains any of | * : . $  -> IllegalArgumentException("The Material Name contains at least one of the following five invalid Characters '|', '*', ':', '.' or '$'")
     102: if (aID >= 0) {
     106:   if (CS.GAPI.mStartedInit) throw IllegalStateException("Materials with a valid ID have to be initialised in PreInit or earlier!")
     125:   if (CS.Ch_N.contains(name.charAt(0))) throw IllegalArgumentException("The OreDict Name '<x>' is not suitable for a valid Material. ... doesn't happen to start with a Numeral. ...")
     176:   if (INVALID_STRINGS_TO_START_A_MATERIAL_NAME.contains(name)) throw IllegalArgumentException("... blacklisted Adjective ...")
     222:   for (String tInvalid : INVALID_STRINGS_TO_START_A_MATERIAL_NAME)
     240:     if (name.startsWith(tInvalid)) throw IllegalArgumentException("The OreDict Name '<x>' is not suitable for a valid Material, as it conflicts with OreDict Prefixes. A better Name for your Material would be '<Capitalised><tInvalid>' with the '<tInvalid>' at the end of the Material Name instead of the beginning.")
     }
  ```
  Parameters: `aID` = the material's numeric ID (used for item/meta generation and
  `MATERIAL_ARRAY`); **`-1` means "no ID"** (allowed at any time, but such a material gets no
  generated items). `aName` = internal name (→ OreDict name suffix, capitalised, must not
  start with a Numeral or with an OreDict prefix word like "ingot"!). `aLocalName` = display
  name (`OreDictMaterial.mNameLocal`).
* `createAutoInvalidMaterial(String)` (@ 411) = `createMaterial(-1, name, name)` plus, if
  `mID < 0`, `put(TD$Properties.INVALID_MATERIAL, UNUSED_MATERIAL, AUTO_BLACKLIST, AUTO_MATERIAL)`.
  **Do not use this to introduce a new material** — see A.3 condition 1.
* **What a mod should call for Enderium/Signalum/Lumium/Manyullyn:**
  ```java
  // during preInit (valid ID makes the material a first-class citizen):
  OreDictMaterial mat = OreDictMaterial.createMaterial(<freeID>, "Enderium", "Enderium");
  // or, if you cannot pick a safe ID (no generated GT items, but valid for recipes):
  OreDictMaterial mat = OreDictMaterial.createMaterial(-1, "Enderium", "Enderium");
  ```
  `createMaterial` is idempotent per name and `UNVERIFIED`: which IDs are free in 6.17.06
  must be probed at runtime (`MATERIAL_ARRAY` length / scan for `null`), and whether a
  material created with a valid ID in *your* mod's preInit survives GT6's own material
  remapping (`setRegistration` aliasing, `mTargetRegistration`) is not verified by bytecode.

## B.3 `OreDictPrefix`

* Registries: `public static final java.util.Map<String, OreDictPrefix> sPrefixes;`,
  `public static final java.util.Map<String, OreDictPrefix> sParsed;`,
  `public static final List<OreDictPrefix> VALUES, VALUES_SORTED;`
  (`OreDictPrefix.class` lines 3-11; all created in the static init @ 2517).
* Looking up / parsing a prefix name:
  ```
  OreDictPrefix.class @ 360:
  public static gregapi.oredict.OreDictPrefix get(java.lang.String aName);
       0: getstatic #323 // Field sParsed:Ljava/util/Map;
       4: invokeinterface #155 // Map.get:(Ljava/lang/Object;)
      14: ifnull 19 ; 17: areturn                    // cache hit
      19: getstatic #323 // sParsed ; 23: containsKey ; 28: ifeq 33 ; 31: aconst_null ; 32: areturn   (cached miss)
      35: getstatic #294 // Field VALUES_SORTED_INTERNAL:Ljava/util/List;
      44..89: for (OreDictPrefix p : VALUES_SORTED_INTERNAL)
      62:   if (aName.startsWith(p.mNameInternal)) { sParsed.put(aName, p); return p; }
      92: sParsed.put(aName, null); return null;      // negative cache
  ```
  → `OreDictPrefix.get("ingotEnderium")` returns `OP.ingot`,
  `OreDictPrefix.get("dustSmallSignalum")` returns `OP.dustSmall`, `get("plateTin")` → `OP.plate`.
  Matching is **longest/first-entry-wins over a sorted list** (the list is
  `VALUES_SORTED_INTERNAL`, populated by `createPrefix`); the sort order itself was not read
  — **UNVERIFIED** that it is strictly "longest first", but `dustSmall` vs `dust` and
  `crushedPurified` vs `crushed` both work in practice because longer names are matched
  before the shorter ones by GT's own parser (see B.4).
* Creating prefixes: `public static OreDictPrefix createPrefix(java.lang.String);` (@ 85),
  plus chainable setters (`setMaterialStats(long)`, `setOreStats(long)`, `setStacksize`,
  `setCategoryName`, `setLocalItemName`, `addFamiliarPrefix`, …).
* **Internal names of the common prefixes** — `gregapi.data.OP` holds every prefix as a
  `public static final OreDictPrefix`; the internal name is the same string passed to
  `OreDictPrefix.createPrefix(...)`. OP's constant pool contains both the internal names and
  the localised names ("ingot" and "Ingots", "dustSmall" and "Small Dusts", …), and GT
  builds OreDict names as `prefix.mNameInternal + material.mNameInternal`
  (`OreDictManager.registerOre_` @ 3644-3659, `setTarget_` @ 2428-2435), which is why
  `OP.ingot` must be `"ingot"` for `"ingotIron"` to resolve. The relevant `OP` fields
  (complete list obtained from `javap -p gregapi.data.OP`):

  `ingot, ingotDouble, ingotTriple, ingotQuadruple, ingotQuintuple, ingotHot, nugget, tiny,
  dust, dustSmall, dustTiny, dustImpure, dustPure, dustRefined, dustDiv72, crushed,
  crushedPurified, crushedCentrifuged, crushedTiny, crushedPurifiedTiny, crushedCentrifugedTiny,
  gem, gemChipped, gemFlawed, gemFlawless, gemExquisite, gemLegendary, gemPolished, gemRaw,
  gemUncut, gemOre, plate, plateDouble, plateTriple, plateQuadruple, plateQuintuple,
  plateDense, plateTiny, plateCurved, plateGem, plateGemTiny, foil, stick, stickLong, rod,
  wire, wireFine, cable, cableGt01..cableGt12, wireGt01..wireGt16, bolt, screw, ring, spring,
  springSmall, gear, gearGt, gearGtSmall, frame, frameGt, lens, rotor, round, chain, pipe,
  pipeTiny, pipeSmall, pipeMedium, pipeLarge, pipeHuge, pipeQuadruple, pipeNonuple,
  casingSmall, casingMachine, casingMachineDouble, casingMachineQuadruple, casingMachineDense,
  block, blockIngot, blockDust, blockGem, blockPlate, blockPlateGem, blockRaw, blockSolid,
  ore, oreNormal, oreNether, oreNetherrack, oreEnd, oreEndstone, oreGravel, oreSand,
  oreSandstone, oreRedSand, oreBedrock, orePoor, oreRich, oreSmall, oreDense, oreRaw,
  oreNether, oreMarble, oreBasalt, oreBlackgranite, oreRedgranite, oreVanillastone,
  oreVanillagranite, oreAndesite, oreDiorite, oreDeepslate, oreBlackstone, oreMoon..orePluto,
  oreKepler22b, oreHolystone, oreLivingrock, oreDeadrock, oreBetweenstone, orePitstone,
  oreUmberstone, oreKomatiite, oreLimestone, oreSiltstone, oreShale, oreSlate, oreQuartzite,
  oreBlueschist, oreGreenschist, oreGrayschist, orePinkschist, oreKimberlite, oreMud,
  oreGneiss, oreDarkprismarine, oreLightprismarine, rock, rockGt, cleanGravel, dirtyGravel,
  gravel, cobblestone, chunk, chunkGt, rawOreChunk, cluster, billet, bit, blade, bar, bars,
  beam, plateSteamcraft, oreberry, orebush, …`
  (full dump: `tools/research/_dump/OP.txt`, field list via `javap -p gregapi.data.OP`.)
  The exact `mNameInternal` string for **every** one of these is only proven for the common
  ones (same name as the field, all present as literals in OP's constant pool);
  for the exotic ones treat "field name == internal name" as **UNVERIFIED** — use
  `OP.<field>.mNameInternal` in code instead of hard-coding strings.

## B.4 What GT6 already does automatically — `onOreRegistration1` / `onOreRegistration2`

`OreDictManager.onOreRegistration1(OreDictionary$OreRegisterEvent)` (@ 1356) is GT6's
listener for **every Forge `OreDictionary.registerOre` call**, including other mods'.
Reconstructed flow (offsets from the javap dump):

```
 1369: ... Loader.instance().activeModContainer()   -> which mod registered it
 1453: getstatic #867 // Field gregapi/data/CS.GT ... 
 1461: name.toLowerCase()
 ...  special cases: MD.TE_FOUNDATION "material", MD.TC "Quicksilver", MD.HBM "desh",
      "redalloy", "redstonealloy", "platedense", MD.SC2 "rubber", "Gala*" ... (many mod quirks)
 1818: addToBlacklist_(stack)                     (for some prefixes)
 1834: addItemData_(stack, OreDictItemData.copy(mStringToItemDataMappings.get(name)))
        // ^ if GT6 has a *named* dictionary entry (OD/OM.data("ingotIron")) for this ore name
 1846: invokestatic #1024 // Method gregapi/oredict/OreDictPrefix.get:(Ljava/lang/String;)LOreDictPrefix;
 1848: aload 5 ; 1849: ifnonnull 260
 1853: addKnownName(name) -> mUnknownNames                          // prefix unknown -> only record
 1862: getstatic #1029 // Field gregapi/data/OP.nugget   ... 1869: OP.tiny
 1874: registerOreSafe("tiny" + suffix, stack)                      // nugget is also a tiny
 1875: prefix.mTargetRegistration != prefix -> registerOreSafe(renamed) ; 1890: return
 1891: getstatic #1042 // Field gregapi/data/TD$Prefix.UNIFICATABLE_RECIPES
 1893: OreDictPrefix.contains(TagData) -> addToBlacklist_(stack)
 1899: suffix = name.replaceFirst(prefix.mNameInternal, "")
 1930: getstatic #1065 // Field gregapi/oredict/OreDictMaterial.MATERIAL_MAP:Ljava/util/Map;
 1934: Map.get(suffix)                                              // material lookup by name
 1937: prefix == OP.ore || prefix.contains(TD$Prefix.MATERIAL_BASED) ? else goto 982 (skip)
 1946: if (material == null) material = OreDictMaterial.createAutoInvalidMaterial(suffix)
 1949: material.contains(TD$Properties.AUTO_MATERIAL) -> addKnownName + mUnknownMaterials
 1964: material.mTargetRegistration != material -> registerOreSafe(prefix + target.mNameInternal)
 1982: material.contains(TD$Properties.AUTO_BLACKLIST) -> addToBlacklist_(stack)
 1990: for (OreDictMaterial reReg : material.mReRegistrations) registerOreSafe(prefix+reReg.mNameInternal, stack)
 2015: material.contains(TD$Properties.INVALID_MATERIAL) -> goto 982     // <-- NOTHING HAPPENS
 2019: prefix == OP.rockGt && material.contains(TD$Properties.STONE) -> OD.itemRock.registerOreSafe
 2030: prefix != OP.ore && prefix.contains(TD$Prefix.STANDARD_ORE) && material.contains(TD$Properties.COMMON_ORE)
        -> registerOreSafe("ore" + material.mNameInternal, stack)
 2054: if (mod == MD.TFC || mod == MD.TFCP) && prefix.contains(TD$Prefix.UNIFICATABLE)
 2071:     setTarget_(prefix, material, stack, true, true)
 2073: else if (prefix == OP.gem && mod == MD.RH ...)  2089/2098: setTarget_(prefix, material, stack, true, true)
 2101: else if (prefix == OP.billet && mod == MD.HBM)  2114: setTarget_(prefix, material, stack, true, true)
 2117: else if (prefix == OP.ore)                      2125: addItemData_(stack, prefix.dat(material))
 2129: else if (prefix == OP.plateSteamcraft)          -> skip
 2133: else if (prefix.contains(TD$Prefix.UNIFICATABLE)) 2144: setTarget_(prefix, material, stack, false, true)
 2146: new IOreDictListenerEvent$OreDictRegistrationContainer(prefix, material, name, stack, event, mod, ...)
 2160: for (IOreDictListenerEvent l : mGlobalOreDictListeners) l.onOreRegistration(container)
 2175: if (prefix != null) prefix.onOreRegistration(container)
 2181: mGlobalRegistrations.add(container)
```

`onOreRegistration2(String, ModData, String, OreRegisterEvent)` (@ 1758) is the
second-stage/looped variant invoked through `registerUnificationEntries()` (@ 3771) and
`onPostLoad()` (@ 879); `registerUnificationEntries` ends with
```
OreDictManager.class @ 3864: invokevirtual #1118 // Method setTarget_:(LOreDictPrefix;LOreDictMaterial;LItemStack;ZZ)Z
```

> **So GT6 already does most of the work**: any mod that calls
> `OreDictionary.registerOre("ingotX", stack)` during preInit/init gets `OP.ingot` parsed
> from the name, `X` looked up in `MATERIAL_MAP` (or auto-created as an **invalid** material),
> and — when the material is valid and the prefix is `UNIFICATABLE` —
> `setTarget_(prefix, material, stack, false, true)` which calls `addAssociation_` (item data)
> and registers `sName2StackMap["ingotX"] = stack` if nothing is there yet.
> **What is left for us: (1) make sure the material exists and is valid *before* the
> registration happens, (2) make sure an item exists for every prefix GT's handlers will ask
> for, (3) call `Recipe.reInit()` after the ore dict settled so recipe keys are rebuilt,
> (4) add explicit recipes for maps with no handler (Smelter/Furnace).**

`RecipeMap.reInit()` is the tool for (3):

```
RecipeMap.class @ 5307:
       0: aload_0 ; 1: getfield #177 // mRecipeItemMap ; 4: invokevirtual #764 // ItemStackMap.clear:()V
      17..66: for (Recipe r : mRecipeList) {
                 OreDictManager.INSTANCE.setStackArray(true, r.mInputs);    (mutates the recipe's stacks!)
                 OreDictManager.INSTANCE.setStackArray(true, r.mOutputs);
                 addToItemMap(r);
              }
      69: mRecipeListSize = mRecipeList.size();
Recipe.class @ 33: public static void reInit() { for (RecipeMap m : RecipeMap.RECIPE_MAPS.values()) m.reInit(); }
```

## B.5 `OreDictItemData`

```
OreDictItemData.class lines 3-19:
  public boolean mBlackListed;      // GT blacklisted this stack (no unification for it)
  public boolean mBlocked;          // computed by setItemData_: block + no fluid + IFluidContainerItem (see below)
  public boolean mUseVanillaDamage;
  public boolean mFurnaceFuel;      // default TRUE for (prefix, material)
  public net.minecraft.item.ItemStack mUnificationTarget;   // lazy: sName2StackMap[mOreDictName]
  public final OreDictPrefix mPrefix;
  public final OreDictMaterialStack mMaterial;
  public final OreDictMaterialStack[] mByProducts;
  public final java.lang.String mOreDictName;
```

`OreDictItemData(OreDictPrefix aPrefix, OreDictMaterial aMaterial)` (@ 21) — the ctor the
question asks about:

```
       5: iconst_0 ; 6: putfield #29  // mBlackListed = false
      10: iconst_0 ; 11: putfield #31 // mBlocked = false
      15: iconst_0 ; 16: putfield #33 // mUseVanillaDamage = false
      20: iconst_1 ; 21: putfield #35 // mFurnaceFuel = true
      25: aconst_null ; 26: putfield #37 // mUnificationTarget = null
      30: aload_1 ; 31: putfield #39 // mPrefix = aPrefix
      35: aload_2 ; 36: ifnonnull 43 ; 39: aconst_null ; 40: goto 51
      43: aload_2
      44: aload_1
      45: getfield #47 // Field OreDictPrefix.mAmount:J
      48: invokestatic #53 // Method gregapi/util/OM.stack:(LOreDictMaterial;J)LOreDictMaterialStack;
      51: putfield #57 // mMaterial          (amount = prefix.mAmount)
      54..88: mOreDictName = (material == null) ? "" : prefix.mNameInternal + material.mNameInternal
      91..125: mByProducts = prefix.mByProducts.isEmpty() ? CS.ZL_MS : prefix.mByProducts.toArray(...)
```

* `mUnificationTarget` is **filled in lazily** by `getStack_` from
  `sName2StackMap.get(toString())` (see B.1). `toString()` == `mOreDictName` (@ 778-782).
* `mByProducts` defaults to the **prefix's** by-product list; the other ctors
  (`(OreDictMaterialStack, OreDictMaterialStack...)`, `(OreDictMaterial, long, ...)`,
  `(OreDictItemData...)`, `(Collection<OreDictItemData>)`) let you set them explicitly.
* `mFurnaceFuel` = "this item is usable as furnace fuel" (defaults to true;
  `setNotFurnaceFuel()` @ 770 clears it). `setUseVanillaDamage()` @ 762 sets
  `mUseVanillaDamage` (use the item's damage value for the recycling/damage logic).
* `validData()` (@ 526) = `validPrefix() && validMaterial()`; `validPrefix()` = `mPrefix != null`;
  `validMaterial()` = `mMaterial != null`; `fullMaterial()` additionally requires
  `mMaterial.mAmount > 0`; `listedMaterial()` requires `mMaterial.mMaterial.mID >= 0`.
  **The recipe handlers test `validData()`, so pass a real prefix+material.**
* Other useful members: `getStack(long)` (@ 692), `copy()` (@ 711), `setByProducts`-style
  ctors, `getAllMaterialStacks()` / `getAllMaterialWeights()` (@ 605/@ 633).

---

# C. ADDING AND REMOVING RECIPES

## C.1 `addRecipe*` signatures and argument meaning

`Recipe$RecipeMap` has ~120 `addRecipe0/1/2/X` overloads. The canonical one is
`addRecipe(boolean, ItemStack[], ItemStack[], Object, long[], FluidStack[], FluidStack[], long, long, long)` (@ 868):

```
RecipeMap.class @ 868-889 (addRecipe -> new Recipe(...) -> addRecipe(Recipe)):
```
which maps 1:1 onto the `Recipe` constructor
`public gregapi.recipes.Recipe(boolean, boolean, boolean, ItemStack[], ItemStack[], Object, long[], FluidStack[], FluidStack[], long, long, long)`
(@ 1152), whose parameter slots are assigned to fields at
```
Recipe.class @ 1171-1173:  iload_3 -> putfield #116 // mCanBeBuffered
Recipe.class @ 1223-1234:  iload_2 -> (if) OreDictManager.INSTANCE.setStackArray_(true, mInputs) AND setStackArray_(true, mOutputs)
Recipe.class @ 1264-1267:  lload 10 -> /16 -> UT$Code.bindInt
Recipe.class @ 1271-1286:  for (long c : mChances) if (c <= 0) c = 10000
Recipe.class @ 1748-1755:  lload 10 -> putfield #142 // mDuration
                           lload 14 -> putfield #112 // mSpecialValue
                           lload 12 -> putfield #140 // mEUt
```
→ **`Recipe(boolean aOptimize, boolean aNormalise, boolean aCanBeBuffered, ItemStack[] aInputs,
ItemStack[] aOutputs, Object aSpecial, long[] aChances, FluidStack[] aFluidInputs,
FluidStack[] aFluidOutputs, long aDuration, long aEUt, long aSpecialValue)`**
(only the *names* are reconstructed; every slot→field/behaviour mapping below is bytecode-exact).

* ctor slot 1 (`aOptimize`) — cancels stacks that appear in **both** input and output
  (catalyst handling): `Recipe.class @ 527: iload_1; 528: ifeq 1064` … `597: ST.equal_(inputs[i], outputs[j], false)`
  … `628-640: input.stackSize -= output.stackSize` … `653: Math.min(...)`, and the emptied
  entry is replaced by `CS.NI` (`@ 662-665`).
* ctor slot 2 (`aNormalise`) — forces the recipe's stacks through the OreDict unifier:
  `Recipe.class @ 149: iload_2; 150: ifeq 173; 153: OreDictManager.INSTANCE.setStackArray_(true, mInputs); 163: … setStackArray_(true, mOutputs);`
* ctor slot 3 → `mCanBeBuffered` (`@ 1171-1173`), not "fake/hidden".
* `mFakeRecipe` / `mHidden` are **not** set by the ctor's booleans; they are set by
  `addRecipe(...)` (see below) — the ctor initialises both to `false` (`@ 1156-1164`).

`aChances` are per-output probabilities in **1/10000 units** (`10000` = 100 %, values ≤ 0
are replaced by 10000).

### The simple 1→1 overload

```
RecipeMap.class @ 900:
public Recipe addRecipe1(boolean, long, long, long, ItemStack aInput, ItemStack aOutput);
       5: iload_1
       6: iconst_1
       7: iconst_1
       8: iconst_1 anewarray ItemStack -> ST.array(new ItemStack[]{aOutput})
      32: getstatic #433 // Field gregapi/data/CS.NI:Lnet/minecraft/item/ItemStack;   (special slot = none)
      35: iconst_1 newarray long -> dup; iconst_0; lload 6; lastore          <-- aChances = {param#3}
      43: getstatic #436 // CS.ZL_FS  (no fluid in)
      46: getstatic #436 // CS.ZL_FS  (no fluid out)
      49: lload 4                     <-- Recipe slot 10 = aDuration
      51: lload 2                     <-- Recipe slot 12 = aEUt
      52: lconst_0                   <-- Recipe slot 14 = aSpecialValue
      53: invokespecial Recipe.<init>:(ZZZ[LItemStack;[LItemStack;Ljava/lang/Object;[J[LFluidStack;[LFluidStack;JJJ)V
      56: invokevirtual #405 // Method addRecipe:(LRecipe;)Lgregapi/recipes/Recipe;
```

So the **exact** signature semantics are:

```java
public Recipe addRecipe1(boolean aOptimize,       // 1st arg -> Recipe ctor slot 1 ("cancel
                                                  //   stacks present in both in- and output")
                         long    aEUt,            // 2nd arg  (slot 2)  -> mEUt
                         long    aDuration,       // 3rd arg  (slot 4)  -> mDuration
                         long    aOutputChance,   // 4th arg  (slot 6)  -> mChances[0], 10000 = 100%
                         ItemStack aInput,
                         ItemStack aOutput)
```
and it terminates in `addRecipe(Recipe)` (@ 889), which **hard-codes the remaining flags**:

```
RecipeMap.class @ 889:
  public gregapi.recipes.Recipe addRecipe(gregapi.recipes.Recipe);
       2: iconst_1     // aDuplicateCheck = TRUE   <-- always on for all simple addRecipe* overloads
       3: iconst_0     // mFakeRecipe = false
       4: iconst_0     // mHidden     = false
       5: iconst_1     // aLogErrors  = true
       6: invokevirtual #422 // Method addRecipe:(LRecipe;ZZZZ)LRecipe;
```
> Consequence: with the simple `addRecipe1/2/X` overloads you **cannot** create a
> fake/hidden recipe, and the duplicate check is **always** active — if a recipe with the
> same inputs already exists the method returns `null` and nothing is added.
> Use the 5-boolean overloads or `addFakeRecipe(...)` when you need control.
> (`addRecipe(boolean, ItemStack[], …, long, long, long)` @ 868 behaves identically:
> `new Recipe(iload_1, true, true, …)` then `addRecipe(Recipe)`.)

**Cross-check with a real call site** (`gregtech/compat/Compat_Recipes_Binnie.class @ 304-350`):

```
     304: getstatic #182 // Field gregapi/data/RM.Centrifuge:Lgregapi/recipes/Recipe$RecipeMap;
     307: iconst_1
     308: ldc2_w #79  // long 16l
     311: ldc2_w #118 // long 64l
     314: ... IL.BINNIE_Comb_Barren.get(1) ... FL.Honey.make(50) ... OM.dust(MT.WaxBee)
     350: invokevirtual #214 // Method Recipe$RecipeMap.addRecipe1:(ZJJLItemStack;LFluidStack;LFluidStack;[LItemStack;)LRecipe;
```
i.e. an LV centrifuge recipe at **16 EU/t for 64 ticks** — which only makes sense with
`long#1 = EU/t, long#2 = duration`. **Verified.**

Other useful overloads (all `javap`-listed):

```java
// several outputs with equal chances (chances array = CS.ZL_LONG -> all default 10000)
public Recipe addRecipe1(boolean, long aEUt, long aDuration, ItemStack aInput, ItemStack... aOutputs);   // @1012
public Recipe addRecipe2(boolean, long, long, ItemStack, ItemStack, ItemStack);                          // @1039
public Recipe addRecipeX(boolean, long, long, ItemStack[], ItemStack);                                   // @1070
// several outputs with explicit per-output chances
public Recipe addRecipe1(boolean, long, long, long[] aChances, ItemStack, ItemStack...);                 // @1091
// 5-boolean variant: (bool#1 -> Recipe.aOptimize, bool#2 -> duplicate check,
//                     bool#3 -> mFakeRecipe, bool#4 -> mHidden, bool#5 -> logErrors)
public Recipe addRecipe1(boolean, boolean, boolean, boolean, boolean, long aEUt, long aDuration, ItemStack, ItemStack...);  // @2766
public Recipe addRecipe1(boolean, boolean, boolean, boolean, boolean, long aEUt, long aDuration, long aChance, ItemStack, ItemStack); // @2642
// fluids
public Recipe addRecipe0(boolean, long, long, long, FluidStack, FluidStack, ItemStack);
public Recipe addRecipe1(boolean, long, long, long, ItemStack, FluidStack, FluidStack, ItemStack);
public Recipe addRecipe1(boolean, long, long, long, ItemStack, FluidStack, FluidStack, ItemStack...);
```

Boolean semantics (from `addRecipe(Recipe, boolean, boolean, boolean, boolean)` @ 4596):

```
       6: aload_1
       7: iload 4
       9: putfield #573  // Field gregapi/recipes/Recipe.mHidden:Z          <- 4th boolean
      12: aload_1
      13: iload_3
      14: putfield #576  // Field gregapi/recipes/Recipe.mFakeRecipe:Z        <- 3rd boolean
      17: iload_2
      18: ifeq 46
      21..38: findRecipeInternal(null, null, false, false, Long.MAX_VALUE, null, aRecipe.mFluidInputs, aRecipe.mInputs)
      41: ifnull 46
      44: aconst_null
      45: areturn        // <- 2nd boolean == "abort if a recipe with the same inputs already exists"
```
and in `addRecipe(Recipe, boolean aDuplicateCheck, boolean aFakeRecipe, boolean aHidden, boolean aLogErrors)`
(@ 4596) the four booleans are used exactly as annotated above; the simple overloads call it
as `(recipe, true, false, false, true)` (see `addRecipe(Recipe)` @ 889), while the 5-boolean
`addRecipe1(b1,b2,b3,b4,b5, …)` calls `addRecipe(recipe, b2, b3, b4, b5)` with
`b1` going into the `Recipe` ctor's `aOptimize` slot. So:
* `b1` = ctor `aOptimize` (cancel overlapping in/output stacks),
* `b2` = duplicate check ("abort if `findRecipeInternal(null,null,false,false,Long.MAX_VALUE,null,fluidIn,in)` finds something"),
* `b3` = `mFakeRecipe` (not craftable by machines, NEI-only), `b4` = `mHidden`,
* `b5` = log errors.
* `aSpecialValue` (last `long` of `Recipe`'s ctor) is **not reachable** through the
  `addRecipe*` helpers (hard-coded `lconst_0`); use `addRecipe(Recipe)` if you need it.
* `Recipe.mEnabled` is (re)computed during `add(...)` from a **config-overridable** duration:
  ```
  RecipeMap.class @ 1010-1056 (inside add(Recipe, boolean, boolean)):
     1010: invokevirtual #714 // Method gregapi/config/Config.get:(Ljava/lang/Object;Ljava/lang/String;J)I
     1014: putfield #639 // Recipe.mDuration:J
     1024: ifle 1031 ; 1027: iconst_1 ; 1032: putfield #710 // Recipe.mEnabled = (mDuration > 0)
     1036: getfield #710 ; 1039: ifeq 1055
     1043: mRecipeList.add(recipe) ; 1052: ifne 1057
     1055: aconst_null ; 1056: areturn          <-- a disabled recipe is NOT stored at all
     1059: mRecipeListSize++ 
  ```
  **A recipe whose (config-resolved) duration is `<= 0` is never added and you get `null`
  back.** Always check the return value.
  **A recipe with `duration <= 0` (or disabled by GT's config) is never added and you get
  `null` back.** Always check the return value.

## C.2 Removing a GT6 machine recipe — there is **no** official API

* `gregapi.recipes.GT_ModHandler` (whole class, `javap` list) only has:
  ```
  public static net.minecraft.item.ItemStack removeRecipe(net.minecraft.item.ItemStack...);
  public static boolean removeRecipeByOutput(net.minecraft.item.ItemStack);
  public static boolean removeRecipeByOutput(net.minecraft.item.ItemStack, boolean, boolean, boolean, boolean);
  ```
  and all three delegate to `gregapi.util.CR`:
  ```
  GT_ModHandler.class @ 247: removeRecipe(ItemStack...) -> CR.remove([LItemStack;)LItemStack;
  GT_ModHandler.class @ 253: removeRecipeByOutput(ItemStack) -> CR.remout:(LItemStack;ZZZZ)Z  with (true,false,false,false)
  GT_ModHandler.class @ 263: removeRecipeByOutput(ItemStack,ZZZZ) -> CR.remout
  ```
* `CR.remout(ItemStack, boolean, boolean, boolean, boolean)` (@ 3004) iterates
  **`CraftingManager`'s `IRecipe` list** only:
  ```
      12: invokestatic #98  // Method list:()Ljava/util/List;
      46: checkcast #110    // class net/minecraft/item/crafting/IRecipe
      53: instanceof #112   // class gregapi/recipes/ICraftingRecipeGT
      64: invokeinterface #116 // Method gregapi/recipes/ICraftingRecipeGT.isRemovableByGT:()Z
      81: instanceof #713   // class net/minecraft/item/crafting/ShapelessRecipes
      89: instanceof #715   // class net/minecraftforge/oredict/ShapelessOreRecipe
     107: getstatic #122    // Method java/lang/Object.getClass:()Ljava/lang/Class; ... CLASSES_NATIVE
     144: invokeinterface #140 // Method net/minecraft/item/crafting/IRecipe.func_77571_b:()Lnet/minecraft/item/ItemStack;
     152: aload_0
     154: invokestatic #522 // Method gregapi/util/ST.equal:(LItemStack;LItemStack;Z)Z
     320: invokeinterface #684 // Method java/util/List.remove:(I)Ljava/lang/Object;
  ```
  → **crafting-table recipes only. It never touches `RecipeMap.mRecipeList`.**
  (There is **no** `removeRecipe`-like method on `Recipe$RecipeMap`; the full `javap -p`
  member list contains only `addRecipe*`, `addFakeRecipe*`, `add`, `reInit`,
  `addToItemMap`, `findRecipe*`, `containsInput`, `getNEI*`, `openNEI`, `guiRecipes`.)
* Therefore removing a machine recipe means mutating GT's structures yourself:

| structure | field (RecipeMap.class) | notes |
|---|---|---|
| all recipes of a map | `public final java.util.Collection<Recipe> mRecipeList;` (line 19) | created as `gregapi/code/HashSetNoNulls` (`@ 293-298`), i.e. a `HashSet`; `Recipe` does **not** override `equals`/`hashCode` (no such methods in `Recipe.class`) → removal is by **identity** |
| input → recipes | `public final gregapi.code.ItemStackMap<ItemStackContainer, Collection<Recipe>> mRecipeItemMap;` (line 13) | keyed by Item+meta (no NBT); rebuilt by `reInit()` |
| fluid input → recipes | `public final java.util.Map<String, Collection<Recipe>> mRecipeFluidMap;` (line 15) | keyed by the fluid's name string |
| recipe size counter | `public int mRecipeListSize;` (line 21) | set by `add()` (`++`) and `reInit()` (`= mRecipeList.size()`) |

Two supported-in-practice ways:

1. **Disable:** `recipe.mEnabled = false;` — `findRecipeInternal` returns `null` for a
   disabled recipe (`RecipeMap.class @ 431-467: getfield #710 mEnabled; ifeq 467; 467: aconst_null; areturn`).
   NEI keeps showing it (**UNVERIFIED** whether GT's NEI page filters `mEnabled`).
2. **Remove:** drop it from `mRecipeList` and rebuild the lookup tables:
   ```java
   RM.Crusher.mRecipeList.remove(theRecipe);   // HashSetNoNulls, identity semantics
   RM.Crusher.reInit();                        // clears + rebuilds mRecipeItemMap, updates mRecipeListSize
   ```
   `reInit()` alone (without removing from `mRecipeList`) re-adds everything, so the order
   matters. `Recipe.reInit()` (@ 33) does the same for **all** maps
   (`for (RecipeMap m : RECIPE_MAPS.values()) m.reInit();`).
   Concurrency: `add(Recipe, boolean, boolean)` is `synchronized`
   (`public synchronized gregapi.recipes.Recipe add(...)`), `findRecipeInternal` catches
   `ConcurrentModificationException` and retries
   (`RecipeMap.class @ 1339-1365: ConcurrentModificationException.printStackTrace();
   findRecipeInternal(..., false, false, ...)`), so a mutation during world ticks is
   crash-tolerant but still racy — do it in a load phase, not per tick.

> Caveat (**UNVERIFIED**): nothing in the bytecode marks `mRecipeList`/`mRecipeItemMap` as
> "do not modify"; `reInit()` is exactly the function that rebuilds derived state, and
> `Recipe.reInit()` is public API, so this is the intended mechanism — but it is not
> documented and GT6 has no `removeRecipe` for machine maps, so treat it as
> semi-supported/at-your-own-risk.

## C.3 `gregapi.data.RM.generify(ItemStack, ItemStack)`

```
RM.class @ 185:
  public static boolean generify(net.minecraft.item.ItemStack aFrom, net.minecraft.item.ItemStack aTo);
       0: aload_0
       1: invokestatic #150 // Method gregapi/util/ST.invalid:(LItemStack;)Z
       4: ifne 14
       7: aload_1
       8: invokestatic #150 // ST.invalid
      11: ifeq 16
      14: iconst_0
      15: ireturn                      // either stack invalid -> false
      16: getstatic #152  // Field Generifier:Lgregapi/recipes/Recipe$RecipeMap;
      19: iconst_0                     // boolean #1
      20: iconst_1                     // boolean #2
      21: iconst_0                     // boolean #3
      22: iconst_0                     // boolean #4
      23: iconst_0                     // boolean #5
      24: lconst_0                     // long #1 = 0 EU/t
      25: lconst_1                     // long #2 = 1 tick duration
      26: aload_0                      // input = aFrom
      27: iconst_1 anewarray ItemStack ; 33: aload_1 ; 34: aastore   // output = {aTo}
      35: invokevirtual #158 // Method Recipe$RecipeMap.addRecipe1:(ZZZZZJJLItemStack;[LItemStack;)LRecipe;
      38: ifnull 45 ; 41: iconst_1 ; 42: goto 46 ; 45: iconst_0 ; 46: ireturn   // != null
```
(and `addRecipe1(Z,Z,Z,Z,Z,J,J,ItemStack,ItemStack...)` @ 2766 maps `slot 8 -> mDuration`,
`slot 6 -> mEUt`, `chances = CS.ZL_LONG`.)

> `RM.generify(from, to)` adds **one 1-tick, 0-EU/t recipe to `RM.Generifier`**
> converting `from` → `to` (direction: input = 1st arg, output = 2nd arg).
> `RM.Generifier` is a normal `RecipeMap` with machine GUI `machines/Generifier` and
> recipe-map name `"gt.recipe.generifier"` (`RM.class @ 9683-9715`) and is also exposed as
> `RecipeMap.sGenerifierRecipes` (`RM.class @ 9944: getstatic #152 Generifier; putstatic #2190 sGenerifierRecipes`).
> Note the shared-static caveat: recipe maps are global, so `generify` is not reversible and
> `genericycle(ItemStack...)` (@ 217) just calls `generify` for each adjacent pair
> (`generify(list[i], list[(i+1) % size])`).

---

# READY-TO-USE SNIPPETS

## 1) Bind a foreign ItemStack to a GT6 material + prefix

```java
import gregapi.data.MT;          // GT6's own materials
import gregapi.data.OP;          // GT6's own prefixes (OP.ingot, OP.dustSmall, ...)
import gregapi.oredict.OreDictItemData;
import gregapi.oredict.OreDictManager;
import gregapi.oredict.OreDictMaterial;
import gregapi.recipes.Recipe;
import gregapi.util.OM;
import gregapi.util.ST;
import net.minecraft.item.ItemStack;
import net.minecraftforge.oredict.OreDictionary;

public final class Gt6Binding {

    /** Call in preInit/init: teach GT6 a material it does not know. */
    public static OreDictMaterial ensureMaterial(int aFreeID, String aInternalName, String aLocalName) {
        OreDictMaterial tMat = OreDictMaterial.get(aInternalName);        // case sensitive, "Enderium"
        if (tMat != null && tMat != MT.NULL) return tMat;
        return OreDictMaterial.createMaterial(aFreeID, aInternalName, aLocalName); // -1 == no ID
    }

    /** Full, GT6-native binding: Forge ore name + GT data + unification target (Init phase only!). */
    public static void bindNative(String aOreName, ItemStack aStack, OreDictMaterial aMat) {
        // 1) Forge OreDictionary -- GT6's own listener (OreDictManager.onOreRegistration1)
        //    parses the prefix out of the name and calls setTarget_(...) itself, but only if
        //    the material already exists and is not INVALID_MATERIAL.
        OreDictionary.registerOre(aOreName, ST.amount(1, aStack));
        // 2) belt & braces: explicit GT binding for the parsed prefix
        gregapi.oredict.OreDictPrefix tPrefix = gregapi.oredict.OreDictPrefix.get(aOreName);
        if (tPrefix != null) {
            OreDictManager.INSTANCE.setTarget(tPrefix, aMat, ST.amount(1, aStack)); // Init only (uses registerOre_)
        }
        Recipe.reInit();   // rebuild every map's mRecipeItemMap from mRecipeList
    }

    /** Late-safe variant (postInit and later): no Forge registration, no target rewrite. */
    public static void bindLate(ItemStack aStack, gregapi.oredict.OreDictPrefix aPrefix, OreDictMaterial aMat) {
        ItemStack tStack = ST.amount(1, aStack);                 // MUST be size 1 (see B.1 caveat)
        if (!OreDictManager.INSTANCE.addAssociation(aPrefix, aMat, tStack)) {
            OreDictManager.INSTANCE.setItemData(tStack, new OreDictItemData(aPrefix, aMat)); // only if no data yet
        }
        // Machine lookups unify your stack to sName2StackMap[prefix+material] automatically,
        // so no reInit() is needed for *this* binding, but re-run it if recipes were added.
    }

    /** Convenience: "this stack IS an ingot of Iron". */
    public static void asIronIngot(ItemStack aStack) {
        OreDictManager.INSTANCE.addAssociation(OP.ingot, MT.Iron, ST.amount(1, aStack));
    }

    /** Only if you really want GT to treat *your* stack as the canonical one. */
    public static void makeCanonical(ItemStack aStack, gregapi.oredict.OreDictPrefix aPrefix, OreDictMaterial aMat) {
        OreDictManager.INSTANCE.setTarget(aPrefix, aMat, aStack, true, false, false); // overwrite existing target
        Recipe.reInit();
    }

    private Gt6Binding() {}
}
```

## 2) Add a simple 1→1 GT6 machine recipe

```java
import gregapi.data.RM;
import gregapi.recipes.Recipe;
import net.minecraft.item.ItemStack;
import net.minecraftforge.fluids.FluidStack;

public final class Gt6Recipes {

    /** 1 in -> 1 out, no chance, no fluids. Returns null if the recipe was rejected. */
    public static Recipe addCrusherStyle(ItemStack aInput, ItemStack aOutput) {
        // addRecipe1(boolean aOptimize, long aEUt, long aDuration, long aChance, in, out)
        // NOTE: these simple overloads ALWAYS run the duplicate check and force
        //       mFakeRecipe/mHidden=false; a null return means "not added".
        return RM.Crusher.addRecipe1(
                false,          // aOptimize: do not cancel stacks shared by in- and output
                16L,            // EU/t   (LV)
                64L,            // duration in ticks (> 0, else the recipe is dropped!)
                10000L,         // output chance in 1/10000 (10000 = 100%)
                aInput, aOutput);
    }

    /** Same recipe but with full control over the 5 flags (never dedup, keep it hidden). */
    public static Recipe addExplicit(ItemStack aInput, ItemStack aOutput) {
        return RM.Compressor.addRecipe1(
                false,  // aOptimize
                false,  // duplicate check OFF  -> really adds even if an equal recipe exists
                false,  // mFakeRecipe
                true,   // mHidden             -> works, but not listed in NEI
                true,   // logErrors
                32L, 40L,               // EU/t, duration
                aInput, aOutput);
    }

    /** 1 in -> 3 out with individual chances (still one output slot list). */
    public static Recipe addWithChances(ItemStack aInput, ItemStack aOut1, ItemStack aOut2, ItemStack aOut3) {
        return RM.Mortar.addRecipe1(
                false,
                4L, 200L,                                  // EU/t, duration
                new long[] {10000L, 5000L, 2500L},          // per-output chances
                aInput, aOut1, aOut2, aOut3);
    }

    /** With fluids: input item + fluid -> fluid + item. */
    public static Recipe addFluid(ItemStack aInput, FluidStack aFluidIn, FluidStack aFluidOut, ItemStack aOutput) {
        return RM.Bath.addRecipe1(false, 16L, 100L, 10000L, aInput, aFluidIn, aFluidOut, aOutput);
    }

    /** Full control (chances, special slot, specialValue) via the Recipe constructor. */
    public static Recipe addRaw(ItemStack aInput, ItemStack aOutput) {
        Recipe tRecipe = new Recipe(
                false,                                   // aFakeRecipe (not shown/not craftable by machines)
                false,                                   // aHidden
                true,                                    // aCanBeBuffered
                new ItemStack[] {aInput},
                new ItemStack[] {aOutput},
                gregapi.data.CS.NI,                      // special slot = none
                new long[] {10000L},                     // chances (1/10000)
                gregapi.data.CS.ZL_FS,                   // fluid in
                gregapi.data.CS.ZL_FS,                   // fluid out
                80L,                                     // aDuration
                32L,                                     // aEUt
                0L);                                     // aSpecialValue
        return RM.Compressor.addRecipe(tRecipe);         // returns null if rejected
    }

    private Gt6Recipes() {}
}
```

## 3) Remove a GT6 recipe by output

```java
import gregapi.data.RM;                       // or gregapi.recipes.Recipe$RecipeMap / RecipeMap.RECIPE_MAPS
import gregapi.recipes.Recipe;
import gregapi.util.ST;
import net.minecraft.item.ItemStack;

import java.util.ArrayList;
import java.util.List;

public final class Gt6Removal {

    /** Remove every recipe of one map whose output matches aOutput. Returns how many were removed. */
    public static int removeByOutput(Recipe.RecipeMap aMap,
                                     ItemStack aOutput,
                                     boolean aIgnoreStackSize) {
        List<Recipe> tToRemove = new ArrayList<Recipe>();
        for (Recipe tRecipe : aMap.mRecipeList) {                 // public final Collection<Recipe> (HashSetNoNulls)
            for (ItemStack tOut : tRecipe.mOutputs) {
                if (tOut != null && ST.equal(tOut, aOutput, aIgnoreStackSize)) { tToRemove.add(tRecipe); break; }
            }
        }
        if (tToRemove.isEmpty()) return 0;
        aMap.mRecipeList.removeAll(tToRemove);                    // identity-based (Recipe has no equals/hashCode)
        aMap.reInit();                                            // MUST rebuild mRecipeItemMap + mRecipeListSize
        return tToRemove.size();
    }

    /** Same, over every registered recipe map. */
    public static int removeByOutputEverywhere(ItemStack aOutput) {
        int r = 0;
        for (Recipe.RecipeMap tMap : Recipe.RecipeMap.RECIPE_MAPS.values()) {
            r += removeByOutput(tMap, aOutput, false);
        }
        return r;
    }

    /** Cheap "disable" alternative: the recipe stays in NEI but is never matched. */
    public static int disableByOutput(Recipe.RecipeMap aMap, ItemStack aOutput) {
        int r = 0;
        for (Recipe tRecipe : aMap.mRecipeList) {
            for (ItemStack tOut : tRecipe.mOutputs) {
                if (tOut != null && ST.equal(tOut, aOutput, false)) { tRecipe.mEnabled = false; r++; break; }
            }
        }
        return r;
    }

    private Gt6Removal() {}
}
```

---

# APPENDIX — evidence files

Raw `javap -p -c` dumps used above (regenerate with
`& "C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe" -p -c -classpath E:\game\minecraft\gt6\tools\_tmp_gt6 <FQCN>`):

| file | class |
|---|---|
| `_dump/RecipeMap.txt` | `gregapi.recipes.Recipe$RecipeMap` |
| `_dump/Recipe.txt` | `gregapi.recipes.Recipe` |
| `_dump/Loader_Recipes_Handlers.txt` | `gregtech.loaders.c.Loader_Recipes_Handlers` (handler registrations) |
| `_dump/RecipeMapHandlerPrefix.txt` / `...Material.txt` / `...Crushing.txt` / `...PrefixForging.txt` / `...PrefixShredding.txt` | the 5 handlers |
| `_dump/OreDictManager.txt` | `gregapi.oredict.OreDictManager` |
| `_dump/OreDictItemData.txt` | `gregapi.oredict.OreDictItemData` |
| `_dump/OreDictMaterial.txt` | `gregapi.oredict.OreDictMaterial` |
| `_dump/OreDictPrefix.txt` | `gregapi.oredict.OreDictPrefix` |
| `_dump/OM.txt` | `gregapi.util.OM` |
| `_dump/RM.txt` | `gregapi.data.RM` |
| `_dump/OP.txt` | `gregapi.data.OP` (all prefixes) |
| `_dump/GT_ModHandler.txt`, `_dump/CR.txt` | `gregapi.recipes.GT_ModHandler`, `gregapi.util.CR` |
| `_dump/ItemStackMap.txt`, `_dump/ItemStackContainer.txt` | map key semantics |
| `_dump/Compat_Binnie.txt` | real `addRecipe1` call site (EU/t vs duration cross-check) |

No external source could be fetched in this environment (GitHub raw/CDN/Sourcegraph are
DNS-blocked or 403); the only external page reachable was the GT6 forum thread
<https://forum.mechaenetia.com/t/gregtech-6/2418> which merely confirms that official GT6
releases for 1.7.10 are versioned like `6.17.06`. **Everything above is from bytecode of the
shipped 6.17.06 jar.**
