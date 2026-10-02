# Other mods' recipe registries — javap findings for a recipe-removal bridge mod

Research target: Minecraft **1.7.10** / Forge **10.13.4.1614** instance at `E:\game\minecraft\gt6\.minecraft\versions\GT6\`
(instance mods dir: `...\versions\GT6\mods\`). Game instance was treated **read-only**; all jars were extracted to
`E:\game\minecraft\gt6\tools\research\ex\<mod>\` and inspected with Java 8 `javap`.

**How every signature below was obtained** (no signature is from memory):

```powershell
& "C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe" -p  -classpath <extractedDir> <fqcn>
& "C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe" -p -c -classpath <extractedDir> <fqcn>   # mutability proof
```

**Compilation conventions in these jars (important for reflection/remapping):**

* Class names are **deobfuscated MCP names** (`net/minecraft/item/crafting/CraftingManager`), but member names of
  vanilla classes are **SRG names** (`func_*`, `field_*`). Example seen in EnderIO bytecode:
  `getstatic // Field net/minecraft/block/Block.field_150319_E`. So a bridge mod compiled with MCP names works
  through Forge's deobfuscating remapper, and SRG names can be read straight out of the shipped jars.
* None of the target classes are obfuscated or absent (except the ones explicitly listed as *absent*).
* **No** target mod wraps its recipe collection in `Collections.unmodifiable*` unless stated — verified by scanning
  the getter bytecode for `unmodifiable` (see per-mod notes).

**Cross-cutting gotchas**

1. Do removals in `FMLPostInitializationEvent` or later (safest: `FMLLoadCompleteEvent`), after every mod has
   registered recipes.
2. Several mods re-add their defaults from a public reload method (`loadRecipes`, `refreshRecipes`,
   `loadRecipesFromConfig`, `registerAllMachineRecipes`, `run`). Do not call those after removing.
3. Follow the *runtime* lookup path, not the "obvious" field: a manager's own `List` and the registry a machine
   actually queries are often two different collections (EnderIO, ActuallyAdditions).

---

## 1. EnderIO (EnderIO-2.10.48.jar)

### 1a. The collection machines actually query — `crazypants.enderio.machine.MachineRecipeRegistry`

```
public class crazypants.enderio.machine.MachineRecipeRegistry {
  public static final crazypants.enderio.machine.MachineRecipeRegistry instance;
  private final java.util.Map<java.lang.String, java.util.Map<java.lang.String, crazypants.enderio.machine.IMachineRecipe>> machineRecipes;
  public void registerRecipe(java.lang.String, crazypants.enderio.machine.IMachineRecipe);
  public java.util.Map<java.lang.String, crazypants.enderio.machine.IMachineRecipe> getRecipesForMachine(java.lang.String);
  public crazypants.enderio.machine.IMachineRecipe getRecipeForUid(java.lang.String);
  public crazypants.enderio.machine.IMachineRecipe getRecipeForInputs(java.lang.String, crazypants.enderio.machine.MachineRecipeInput...);
  public java.util.List<crazypants.enderio.machine.IMachineRecipe> getRecipesForInput(java.lang.String, crazypants.enderio.machine.MachineRecipeInput);
}
```

* **`-c` proof of mutability:** `<init>` does `new java/util/HashMap` → `putfield machineRecipes`;
  `registerRecipe` is `getRecipesForMachine(name)` + `IMachineRecipe.getUid()` + `Map.put`;
  `getRecipesForMachine` is `getfield machineRecipes` → `Map.get` → `checkcast Map`, lazily
  `new java/util/LinkedHashMap` + put when absent, then returns the inner map **directly**
  (no `unmodifiableMap`, no defensive copy).
* **There is no remove method.** Enumerate via `getRecipesForMachine(key)` / `getRecipesForInput`,
  **remove** via `MachineRecipeRegistry.instance.getRecipesForMachine("<key>").remove("<recipeUid>")`.

Machine keys = `ModObject.blockX.unlocalisedName` (`-c` on `TileAlloySmelter/TileCrusher/TileVat/TileSliceAndSplice/
TileSoulBinder.getMachineName()` each return `ModObject.<machine>.unlocalisedName`). Verified literals in
`crazypants.enderio.ModObject` `<clinit>`: `blockAlloySmelter`, `blockSagMill`, `blockVat`, `blockSliceAndSplice`,
`blockSoulBinder`, `blockEnchanter`.

### 1b. Manager-level lists (a second copy of the same recipes)

```
public class crazypants.enderio.machine.recipe.ManyToOneRecipeManager {
  private final java.util.List<crazypants.enderio.machine.recipe.IManyToOneRecipe> recipes;
  public crazypants.enderio.machine.recipe.ManyToOneRecipeManager(java.lang.String, java.lang.String, java.lang.String);
  public void loadRecipesFromConfig();
  public void addCustomRecipes(java.lang.String);
  public java.util.List<crazypants.enderio.machine.recipe.IManyToOneRecipe> getRecipes();
  public void addRecipe(crazypants.enderio.machine.recipe.IManyToOneRecipe);
  public crazypants.enderio.machine.recipe.IRecipe getRecipeForInputs(crazypants.enderio.machine.MachineRecipeInput[]);
}
public class crazypants.enderio.machine.alloy.AlloyRecipeManager extends crazypants.enderio.machine.recipe.ManyToOneRecipeManager {
  static final crazypants.enderio.machine.alloy.AlloyRecipeManager instance;
  public static crazypants.enderio.machine.alloy.AlloyRecipeManager getInstance();
  public void loadRecipesFromConfig();
  public crazypants.enderio.machine.alloy.VanillaSmeltingRecipe getVanillaRecipe();
  public void setVanillaRecipe(crazypants.enderio.machine.alloy.VanillaSmeltingRecipe);
}
public class crazypants.enderio.machine.slicensplice.SliceAndSpliceRecipeManager extends crazypants.enderio.machine.recipe.ManyToOneRecipeManager {
  public static crazypants.enderio.machine.slicensplice.SliceAndSpliceRecipeManager getInstance();
}
public class crazypants.enderio.machine.crusher.CrusherRecipeManager {
  private final java.util.List<crazypants.enderio.machine.recipe.Recipe> recipes;
  private final java.util.List<crazypants.enderio.machine.recipe.RecipeInput> ballExcludes;
  private final java.util.List<crazypants.enderio.machine.crusher.GrindingBall> balls;
  private final java.util.Set<net.minecraft.item.ItemStack> excludedStacks;
  public static crazypants.enderio.machine.crusher.CrusherRecipeManager getInstance();
  public java.util.List<crazypants.enderio.machine.recipe.Recipe> getRecipes();
  public java.util.List<crazypants.enderio.machine.crusher.GrindingBall> getBalls();
  public void addRecipe(net.minecraft.item.ItemStack, int, net.minecraft.item.ItemStack);
  public void addRecipe(net.minecraft.item.ItemStack, int, crazypants.enderio.machine.recipe.RecipeOutput...);
  public void addRecipe(crazypants.enderio.machine.recipe.Recipe);
  public void loadRecipesFromConfig();
}
public class crazypants.enderio.machine.vat.VatRecipeManager {
  private final java.util.List<crazypants.enderio.machine.recipe.IRecipe> recipes;
  public static crazypants.enderio.machine.vat.VatRecipeManager getInstance();
  public void addRecipe(crazypants.enderio.machine.recipe.IRecipe);
  public java.util.List<crazypants.enderio.machine.recipe.IRecipe> getRecipes();
  public void loadRecipesFromConfig();
  public void addCustomRecipes(java.lang.String);
}
public class crazypants.enderio.machine.enchanter.EnchanterRecipeManager {
  private final java.util.List<crazypants.enderio.machine.enchanter.EnchanterRecipe> recipes;
  public static crazypants.enderio.machine.enchanter.EnchanterRecipeManager getInstance();
  public crazypants.enderio.machine.enchanter.EnchanterRecipe getEnchantmentRecipeForInput(net.minecraft.item.ItemStack);
  public java.util.List<crazypants.enderio.machine.enchanter.EnchanterRecipe> getRecipes();
  public void loadRecipesFromConfig();
  public void addCustomRecipes(java.lang.String);
}
public class crazypants.enderio.machine.soul.SoulBinderRecipeManager {
  public static crazypants.enderio.machine.soul.SoulBinderRecipeManager getInstance();
  public void addDefaultRecipes();
  public boolean addRecipeFromNBT(net.minecraft.nbt.NBTTagCompound);
}
```

* `-c` proof: each `recipes` list is created with `new java/util/ArrayList` and returned by `getRecipes()` with
  `getfield` + `areturn` — **live, mutable, not wrapped**. `CrusherRecipeManager.excludedStacks` is a `HashSet`.
* **No `removeRecipe`/`clear`/`setRecipes` exists anywhere** (`javap -c` scan for `List.clear`/`unmodifiable` over
  all four managers returned **0** matches).
* `SoulBinderRecipeManager` has **no list of its own** — its `ISoulBinderRecipe`s go into
  `MachineRecipeRegistry` under `blockSoulBinder` (`-c` shows `registerRecipe` calls from `addDefaultRecipes`).
     Remove soul-binder recipes from the registry map only.
* `addRecipe(...)` on the many-to-one managers registers into **both** the manager list and
  `MachineRecipeRegistry` (`AlloyRecipeManager`, `CrusherRecipeManager`, `SliceAndSpliceRecipeManager`,
  `SoulBinderRecipeManager`, `VatRecipe` all reference `registerRecipe`).

### 1c. How EnderIO loads recipes

```
public class crazypants.enderio.machine.recipe.RecipeConfig {
  public static crazypants.enderio.machine.recipe.RecipeConfig loadRecipeConfig(java.lang.String, java.lang.String, crazypants.enderio.machine.recipe.CustomTagHandler);
  public static java.lang.String readRecipes(java.io.File, java.lang.String, boolean) throws java.io.IOException;
  public void merge(crazypants.enderio.machine.recipe.RecipeConfig);
  public java.util.List<crazypants.enderio.machine.recipe.Recipe> getRecipes(boolean);
  public java.util.List<crazypants.enderio.machine.recipe.Recipe> getRecipesForGroup(java.lang.String, boolean);
  public java.util.Map<java.lang.String, crazypants.enderio.machine.recipe.RecipeConfig$RecipeGroup> getRecipeGroups();
}
public class crazypants.enderio.machine.recipe.RecipeConfigParser extends org.xml.sax.helpers.DefaultHandler {
  public static crazypants.enderio.machine.recipe.RecipeConfig parse(java.io.File, crazypants.enderio.machine.recipe.CustomTagHandler) throws java.lang.Exception;
}
```

File names are hard-coded per machine: `AlloySmelterRecipes_Core.xml` / `AlloySmelterRecipes_User.xml`,
`SAGMillRecipes_Core.xml` / `_User.xml`, `VatRecipes_Core.xml` / `_User.xml`, plus Slice'N'Splice and Enchanter files
(`-c` string constants), loaded from `crazypants.enderio.config.Config.configDirectory`.
`crazypants.enderio.api` contains **no** recipe API (only `EnderIOAPIProps`, `IMC`, `IRedstoneConnectable`,
teleport/tool interfaces) → there is no official removal hook.

**Recommended removal strategy:** reflection-free — mutate the live collections:
(a) `MachineRecipeRegistry.instance.getRecipesForMachine("blockSagMill").remove(uid)` etc.
(the map a machine reads), and (b) the manager's own `getRecipes()` list (`remove`/`removeIf`) so NEI/crafting views
and any later re-registration path stay consistent. Run in postInit/loadComplete and never call
`loadRecipesFromConfig()` afterwards (it appends without clearing — verified: no `List.clear` in bytecode).

---

## 2. Thermal Expansion / Thermal Foundation / CoFHCore

TE 4.1.5 **ships a real removal API**. Managers (all `cofh.thermalexpansion.util.crafting.*`, all `static`):

```
public static boolean PulverizerManager.removeRecipe(net.minecraft.item.ItemStack);
public static boolean FurnaceManager.removeRecipe(net.minecraft.item.ItemStack);
public static boolean SmelterManager.removeRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack);   // Induction Smelter
public static boolean SawmillManager.removeRecipe(net.minecraft.item.ItemStack);
public static boolean CrucibleManager.removeRecipe(net.minecraft.item.ItemStack);
public static boolean ChargerManager.removeRecipe(net.minecraft.item.ItemStack);
public static boolean InsolatorManager.removeRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack);
public static boolean TransposerManager.removeFillRecipe(net.minecraft.item.ItemStack, net.minecraftforge.fluids.FluidStack);
public static boolean TransposerManager.removeExtractionRecipe(net.minecraft.item.ItemStack);
```

Enumeration + addition (verified signatures):

```
public static cofh.thermalexpansion.util.crafting.PulverizerManager$RecipePulverizer PulverizerManager.getRecipe(net.minecraft.item.ItemStack);
public static boolean PulverizerManager.recipeExists(net.minecraft.item.ItemStack);
public static cofh.thermalexpansion.util.crafting.PulverizerManager$RecipePulverizer[] PulverizerManager.getRecipeList();
public static boolean PulverizerManager.addRecipe(int, net.minecraft.item.ItemStack, net.minecraft.item.ItemStack);
public static boolean PulverizerManager.addRecipe(int, net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, int, boolean);
public static cofh.thermalexpansion.util.crafting.SmelterManager$RecipeSmelter SmelterManager.getRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack);
public static cofh.thermalexpansion.util.crafting.SmelterManager$RecipeSmelter[] SmelterManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.FurnaceManager$RecipeFurnace[] FurnaceManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.SawmillManager$RecipeSawmill[] SawmillManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.TransposerManager$RecipeTransposer[] TransposerManager.getFillRecipeList();
public static cofh.thermalexpansion.util.crafting.TransposerManager$RecipeTransposer[] TransposerManager.getExtractionRecipeList();
public static cofh.thermalexpansion.util.crafting.CrucibleManager$RecipeCrucible[] CrucibleManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.InsolatorManager$RecipeInsolator[] InsolatorManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.ChargerManager$RecipeCharger[] ChargerManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.PrecipitatorManager$RecipePrecipitator[] PrecipitatorManager.getRecipeList();
public static cofh.thermalexpansion.util.crafting.ExtruderManager$RecipeExtruder[] ExtruderManager.getRecipeList();
```

**Internal collection + mutability.** Every manager holds

```
private static java.util.Map<...ComparableItemStackX, ...RecipeX> recipeMap;   // Pulverizer/Furnace/Sawmill/Charger/Crucible
private static java.util.Map<java.util.List<...ComparableItemStackSmelter>, ...RecipeSmelter> recipeMap;  // Smelter (key = List!)
private static java.util.Map<...ComparableItemStackInsolator, ...RecipeInsolator> recipeMap;             // Insolator
private static java.util.Map<net.minecraftforge.fluids.Fluid, ...RecipePrecipitator> recipeMap;          // Precipitator
private static java.util.Map<java.util.List<?>, ...RecipeExtruder> recipeMap;                            // Extruder
private static java.util.Map<java.util.List<java.lang.Integer>, ...RecipeTransposer> recipeMapFill;      // Transposer fill
private static java.util.Map<...ComparableItemStackTransposer, ...RecipeTransposer> recipeMapExtraction; // Transposer extract
```

* `getRecipeList()` is **not** a live view: `-c` shows
  `getstatic recipeMap` → `Map.values()` → `Collection.toArray(new X[0])` → `areturn`
  — it returns a **fresh array snapshot**; mutating it does nothing.
* `recipeMap` is `private static`, no `unmodifiable` wrapper, type `java.util.Map` (runtime `HashMap`/`THashMap`).
* `removeRecipe` implementations: `-c` of `PulverizerManager.removeRecipe` shows
  `recipeMap.remove(new ComparableItemStackPulverizer(stack))`; `SmelterManager.removeRecipe` shows
  `recipeMap.remove(Arrays.asList(new ComparableItemStackSmelter(a), new ComparableItemStackSmelter(b)))`.
* **PrecipitatorManager and ExtruderManager have NO `removeRecipe`** (javap lists only
  `getRecipeList`, `addDefaultRecipes`, `loadRecipes`, `refreshRecipes`, and for Precipitator the `getRecipe`/`recipeExists`
  overloads) → these two need reflection into `recipeMap`, or a NEI/JEI-level block.

**Gotchas (all javap-verified):**

* `SmelterManager`/`InsolatorManager` additionally keep
  `private static java.util.Set<...ComparableItemStackSmelter> validationSet;`
  `private static java.util.Set<...ComparableItemStackSmelter> lockSet;`
  and `removeRecipe` removes **only** from `recipeMap` (full method body quoted above; no `Set.remove` in it) →
  stale `validationSet`/`lockSet` entries remain (they are populated by the private `addFlux`). Bridge should
  reflect/clear these too if input validation must change.
* `loadRecipes()`, `refreshRecipes()`, `addDefaultRecipes()` are all `public static` and re-add the default set.
  `refreshRecipes` is invoked only from `cofh.thermalexpansion.ThermalExpansion.handleIdMapping()`
  (`public synchronized void handleIdMapping()` — the FML missing-mappings/ID-remap handler), so a world ID remap
  after your removal can resurrect defaults.
* TE also has a JSON-file recipe system: `cofh.thermalexpansion.util.crafting.TECraftingParser` with
  `public static void initialize();`, `public static void parseCraftingFiles();` and private
  `addXxxRecipe/removeXxxRecipe(String, JsonObject)` per machine. This is the mod-author path; a bridge can either
  call the managers directly (simpler) or emit JSON.
* `private static boolean allowOverwrite;` in every manager controls whether `addRecipe` overwrites an existing key.
* `CoFHCore` has **no** shared recipe registry: `cofh.core.util.crafting.*` contains only `IRecipe` helpers
  (`RecipeAugmentable`, `RecipeReset`, `RecipeSecure`, `RecipeSecureRemove`, `RecipeUpgrade`, `RecipeUpgradeOverride`).
* ThermalFoundation holds no machine recipe registry (only items/fluids/blocks).

**Recommended removal strategy:** direct API calls (`PulverizerManager.removeRecipe(stack)`, …) — the cleanest of all
mods here; use `getRecipeList()` only to enumerate (it is a snapshot). For `PrecipitatorManager`/`ExtruderManager`
use reflection on `recipeMap`. Call removals after TE has loaded and never invoke `refreshRecipes`/`loadRecipes`.

---

## 3. Applied Energistics 2 (appliedenergistics2-rv3-beta-1078-GTNH.jar)

```
public interface appeng.api.features.IInscriberRegistry {
  public abstract java.util.Collection<appeng.api.features.IInscriberRecipe> getRecipes();
  public abstract java.util.Set<net.minecraft.item.ItemStack> getOptionals();
  public abstract java.util.Set<net.minecraft.item.ItemStack> getInputs();
  public abstract appeng.api.features.IInscriberRecipeBuilder builder();
  public abstract void addRecipe(appeng.api.features.IInscriberRecipe);
  public abstract void removeRecipe(appeng.api.features.IInscriberRecipe);        // <-- real removal API
}
public interface appeng.api.features.IGrinderRegistry {
  public abstract java.util.List<appeng.api.features.IGrinderEntry> getRecipes();
  public abstract void addRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, int);
  public abstract void addRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, float, int);
  public abstract void addRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, float, net.minecraft.item.ItemStack, float, int);
  public abstract appeng.api.features.IGrinderEntry getRecipeForInput(net.minecraft.item.ItemStack);
}
public interface appeng.api.features.IRecipeHandlerRegistry {   // crafting-handler classes, no recipe collection
  public abstract void addNewCraftHandler(java.lang.String, java.lang.Class<? extends appeng.api.recipes.ICraftHandler>);
  public abstract appeng.api.recipes.ICraftHandler getCraftHandlerFor(java.lang.String);
}
```

Implementations (`appeng.core.features.registries.*`):

```
public final class appeng.core.features.registries.InscriberRegistry implements appeng.api.features.IInscriberRegistry {
  private final java.util.Set<appeng.api.features.IInscriberRecipe> recipes;    // HashSet (-c: new java/util/HashSet ++)
  private final java.util.Set<net.minecraft.item.ItemStack> optionals;
  private final java.util.Set<net.minecraft.item.ItemStack> inputs;
  public void removeRecipe(appeng.api.features.IInscriberRecipe);
}
public final class appeng.core.features.registries.GrinderRecipeManager implements appeng.api.features.IGrinderRegistry, appeng.recipes.ores.IOreListener {
  private final java.util.List<appeng.api.features.IGrinderEntry> recipes;      // ArrayList (-c: new java/util/ArrayList)
  private final java.util.Map<net.minecraft.item.ItemStack, java.lang.String> ores;
  private final java.util.Map<net.minecraft.item.ItemStack, java.lang.String> ingots;
  private final java.util.Map<java.lang.String, net.minecraft.item.ItemStack> dusts;
  public java.util.List<appeng.api.features.IGrinderEntry> getRecipes();
  public void oreRegistered(java.lang.String, net.minecraft.item.ItemStack);
}
public class appeng.core.features.registries.RecipeHandlerRegistry implements appeng.api.features.IRecipeHandlerRegistry {
  private final java.util.Map<java.lang.String, java.lang.Class<? extends appeng.api.recipes.ICraftHandler>> handlers;
  private final java.util.Collection<appeng.api.recipes.ISubItemResolver> resolvers;
}
```

* Entry point: `public static appeng.api.IAppEngApi appeng.api.AEApi.instance();` and
  `IRegistryContainer.inscriber()` / `.grinder()` (both `public abstract` on the interface).
* **Inscriber:** `getRecipes()` is wrapped — `-c` of `InscriberRegistry.getRecipes` contains
  `invokestatic java/util/Collections.unmodifiableCollection` → the returned `Collection` is **read-only**.
  Removal must use `removeRecipe(existingInstance)`; its body is `recipes.removeIf(predicate)`
  (`invokedynamic … Predicate`, `Set.removeIf`). Pass an element obtained from `getRecipes()` (an equal instance is
  required). **Gotcha:** `removeRecipe` does not update `inputs`/`optionals`, which stay stale.
  Adding: `builder().withInputs(...).withOutput(...).withTopOptional(...).withBottomOptional(...).
  withProcessType(InscriberProcessType).build()` then `addRecipe(...)`.
* **Grinder:** no remove API, but `GrinderRecipeManager.getRecipes()` returns the **live `ArrayList`**
  (`-c`: `getfield recipes` → `areturn`, after a `log("API - getRecipes")` call) → removal without reflection:
  iterate/cast the returned `List` and `remove(...)`/`removeIf(...)`. **Gotcha:** the manager is an
  `IOreListener`; its `oreRegistered(String, ItemStack)` injects new grinder recipes for ores/ingots/dusts that
  register later, so a removal done in preInit can silently come back — remove in a late phase (or after the last
  ore registration).
* **Absent in this build:** there is no `ICompressorRegistry`, no `IHeatPumpRegistry`, no Press registry
  (class scan of `appeng/**` finds only `appeng.recipes.handlers.Press`; `appeng.core.features.registries` contains
  exactly: BlockingModeIgnoreItemRegistry, CellRegistry, ExternalStorageRegistry, GridCacheRegistry,
  GrinderRecipeManager, InscriberRegistry, InterfaceTerminalRegistry, ItemDisplayRegistry, LocatableRegistry,
  MatterCannonAmmoRegistry, MovableTileRegistry, P2PTunnelRegistry, PlayerRegistry, RecipeHandlerRegistry,
  RegistryContainer, SpecialComparisonRegistry, WirelessRegistry, WorldGenRegistry).
  AE2's compressor/press behaviour is hard-coded in `appeng.recipes.handlers.Press`, not modifiable at runtime.
* `appeng.recipes.*` (`RecipeData`, `RecipeHandler`, `loader.ConfigLoader`, `CustomRecipeConfig`) is AE2's own
  recipe-file loader, not the machine registries — don't confuse them.

**Recommended removal strategy:** Inscriber → direct `AEApi.instance().registries().inscriber().removeRecipe(instance)`
(no reflection). Grinder → mutate the live `getRecipes()` list (unchecked cast), run late to survive ore-dict
injections. Press/compressor recipes → not removable.

---

## 4. IndustrialCraft 2 (industrialcraft-2-2.2.828-experimental.jar)

API entry point — all fields are **non-final `public static`**, so they can even be replaced wholesale:

```
public class ic2.api.recipe.Recipes {
  public static ic2.api.recipe.IMachineRecipeManager macerator;
  public static ic2.api.recipe.IMachineRecipeManager extractor;
  public static ic2.api.recipe.IMachineRecipeManager compressor;
  public static ic2.api.recipe.IMachineRecipeManager centrifuge;
  public static ic2.api.recipe.IMachineRecipeManager blockcutter;
  public static ic2.api.recipe.IMachineRecipeManager blastfurance;
  public static ic2.api.recipe.IMachineRecipeManager recycler;
  public static ic2.api.recipe.IMachineRecipeManager metalformerExtruding;
  public static ic2.api.recipe.IMachineRecipeManager metalformerCutting;
  public static ic2.api.recipe.IMachineRecipeManager metalformerRolling;
  public static ic2.api.recipe.IMachineRecipeManager oreWashing;
  public static ic2.api.recipe.ICannerBottleRecipeManager cannerBottle;
  public static ic2.api.recipe.ICannerEnrichRecipeManager cannerEnrich;
  public static ic2.api.recipe.IMachineRecipeManager matterAmplifier;
  public static ic2.api.recipe.IScrapboxManager scrapboxDrops;
  public static ic2.api.recipe.IListRecipeManager recyclerBlacklist;
  public static ic2.api.recipe.IListRecipeManager recyclerWhitelist;
  public static ic2.api.recipe.ICraftingRecipeManager advRecipes;
  public static ic2.api.recipe.ISemiFluidFuelManager semiFluidGenerator;
  public static ic2.api.recipe.IFluidHeatManager FluidHeatGenerator;
  public static ic2.api.recipe.ILiquidHeatExchangerManager liquidCooldownManager;
  public static ic2.api.recipe.ILiquidHeatExchangerManager liquidHeatupManager;
}
public interface ic2.api.recipe.IMachineRecipeManager {
  public abstract void addRecipe(ic2.api.recipe.IRecipeInput, net.minecraft.nbt.NBTTagCompound, net.minecraft.item.ItemStack...);
  public abstract ic2.api.recipe.RecipeOutput getOutputFor(net.minecraft.item.ItemStack, boolean);
  public abstract java.util.Map<ic2.api.recipe.IRecipeInput, ic2.api.recipe.RecipeOutput> getRecipes();
}
```

**No remove/clear exists on any IC2 interface** — but `getRecipes()` on the machine managers is a *live, cache-aware
Map view*, which makes removal possible **without reflection**:

```
public class ic2.core.BasicMachineRecipeManager implements ic2.api.recipe.IMachineRecipeManagerExt {
  private final java.util.Map<ic2.api.recipe.IRecipeInput, ic2.api.recipe.RecipeOutput> recipes;                 // HashMap
  private final java.util.Map<net.minecraft.item.Item, java.util.Map<java.lang.Integer, ic2.core.util.Tuple$T2<ic2.api.recipe.IRecipeInput, ic2.api.recipe.RecipeOutput>>> recipeCache;  // IdentityHashMap
  private final java.util.List<ic2.core.util.Tuple$T2<ic2.api.recipe.IRecipeInput, ic2.api.recipe.RecipeOutput>> uncacheableRecipes;
  public java.util.Map<ic2.api.recipe.IRecipeInput, ic2.api.recipe.RecipeOutput> getRecipes();
  private void removeCachedRecipes(ic2.api.recipe.IRecipeInput);      // private — but reachable via the view
  public void onOreRegister(net.minecraftforge.oredict.OreDictionary$OreRegisterEvent);
}
```

* `getRecipes()` is `new ic2.core.BasicMachineRecipeManager$1(this)` — an `AbstractMap` view, **not** the raw field.
* `BasicMachineRecipeManager$1.entrySet()` → `$1$1` (`extends java.util.AbstractSet`, `size()` delegates to the real
  map) → `iterator()` → `$1$1$1`, whose `remove()` is:

  ```
  public void remove();
  Code:
     0: getfield  recipeIt          // the underlying HashMap entrySet iterator
     4: invokeinterface java/util/Iterator.remove:()V
     ...
    23: invokestatic  ic2/core/BasicMachineRecipeManager.access$000   // == private removeCachedRecipes(lastInput)
  ```

  ⇒ **iterating `entrySet()` and calling `Iterator.remove()` removes from the map *and* invalidates `recipeCache`.**
  `Map.remove(key)` (`AbstractMap.remove` → `iterator.remove`) and `clear()` take the same path.
* **Key-equality gotcha:** `ic2.api.recipe.RecipeInputItemStack`, `RecipeInputOreDict` and
  `RecipeInputFluidContainer` do **not** override `equals`/`hashCode` (javap shows only `matches`, `getInputs`,
  `toString`) → a freshly constructed key will **not** match. Iterate the entries and decide with
  `IRecipeInput.matches(ItemStack)` / `getInputs()` / `toString()`.
* **Manager-reference gotcha:** `ic2.core.block.invslot.InvSlotProcessableGeneric` has
  `public ic2.api.recipe.IMachineRecipeManager recipeManager;` (set in its constructor, also via
  `public void setRecipeManager(...)`) — machines hold the manager instance they were built with, so swapping the
  object in `Recipes.macerator` (fields are non-final) only affects newly built machines. Mutating the map is
  correct for both.

Other IC2 collections (all live and mutable):

```
public class ic2.core.BasicListRecipeManager implements ic2.api.recipe.IListRecipeManager {
  private final java.util.List<ic2.api.recipe.IRecipeInput> list;                       // ArrayList
  public java.util.List<ic2.api.recipe.IRecipeInput> getInputs();                       // getfield + areturn (live)
  public java.util.Iterator<ic2.api.recipe.IRecipeInput> iterator();
}
public class ic2.core.block.machine.CannerBottleRecipeManager {
  private final java.util.Map<ic2.api.recipe.ICannerBottleRecipeManager$Input, ic2.api.recipe.RecipeOutput> recipes;
  public java.util.Map<...> getRecipes();                                               // live HashMap
}
public class ic2.core.block.machine.CannerEnrichRecipeManager {
  private final java.util.Map<ic2.api.recipe.ICannerEnrichRecipeManager$Input, net.minecraftforge.fluids.FluidStack> recipes;
  public java.util.Map<...> getRecipes();                                               // live HashMap
}
public class ic2.core.SemiFluidFuelManager     { public java.util.Map<java.lang.String, ...BurnProperty> getBurnProperties(); }
public class ic2.core.FluidHeatManager         { public java.util.Map<java.lang.String, ...BurnProperty> getBurnProperties(); }
public class ic2.core.LiquidHeatExchangerManager{ public java.util.Map<java.lang.String, ...HeatExchangeProperty> getHeatExchangeProperties(); }
public class ic2.core.AdvCraftingRecipeManager { public void addRecipe(...); public void addShapelessRecipe(...); }  // add-only
```

**Recommended removal strategy:** no official API — but **no reflection needed** for machine recipes: iterate
`Recipes.<machine>.getRecipes().entrySet()` and call `Iterator.remove()` on entries whose
`IRecipeInput.matches(...)`/`getInputs()` match. Do **not** reflect into the private `recipes` field: that leaves
`recipeCache` stale and the machine keeps producing the removed output. `recyclerBlacklist/Whitelist` →
`getInputs().clear()`; fuel/heat maps → `getBurnProperties()`/`getHeatExchangeProperties().remove(name)`.
`advRecipes` (`AdvCraftingRecipeManager`) exposes add-only methods; recipes added through it land in the vanilla
crafting system — see §10.

---

## 5. ActuallyAdditions (ActuallyAdditions-1.7.10-r21.jar)

```
public class de.ellpeck.actuallyadditions.api.ActuallyAdditionsAPI {
  public static java.util.List<de.ellpeck.actuallyadditions.api.recipe.CrusherRecipe> crusherRecipes;          // ArrayList, non-final
  public static java.util.List<de.ellpeck.actuallyadditions.api.recipe.BallOfFurReturn> ballOfFurReturnItems;
  public static java.util.List<de.ellpeck.actuallyadditions.api.recipe.TreasureChestLoot> treasureChestLoot;
  public static java.util.List<de.ellpeck.actuallyadditions.api.recipe.LensNoneRecipe> reconstructorLensNoneRecipes;
  public static java.util.List<de.ellpeck.actuallyadditions.api.recipe.coffee.CoffeeIngredient> coffeeMachineIngredients;
  public static void addCrusherRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack);
  public static void addCrusherRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, int);
  public static void addCrusherRecipe(net.minecraft.item.ItemStack, java.lang.String, int);
  public static void addCrusherRecipe(java.lang.String, java.lang.String, int);
  public static void addCrusherRecipe(java.lang.String, java.lang.String, int, java.lang.String, int, int);
  public static void addBallOfFurReturnItem(net.minecraft.item.ItemStack, int);
  public static void addTreasureChestLoot(net.minecraft.item.ItemStack, int, int, int);
  public static void addReconstructorLensNoneRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack, int);
}
public class de.ellpeck.actuallyadditions.mod.recipe.CrusherRecipeRegistry {
  public static java.util.ArrayList<de.ellpeck.actuallyadditions.mod.recipe.CrusherRecipeRegistry$SearchCase> searchCases;
  public static void registerFinally();
  public static boolean hasOreRecipe(java.lang.String);
  public static java.util.List<net.minecraft.item.ItemStack> getOutputOnes(net.minecraft.item.ItemStack);
  public static de.ellpeck.actuallyadditions.api.recipe.CrusherRecipe getRecipeFromInput(net.minecraft.item.ItemStack);
  public static java.util.List<net.minecraft.item.ItemStack> getOutputTwos(net.minecraft.item.ItemStack);
  public static int getOutputTwoChance(net.minecraft.item.ItemStack);
}
```

* `-c` of `ActuallyAdditionsAPI.<clinit>`: the lists are plain `new java/util/ArrayList` — **live, mutable,
  no `unmodifiable`, non-final fields**.
* **Runtime path verified:** `CrusherRecipeRegistry.getRecipeFromInput` does
  `getstatic ActuallyAdditionsAPI.crusherRecipes` → `List.iterator()` → per-recipe `getRecipeInputs()` +
  `ItemUtil.contains(...)`; `getOutputOnes` just calls `getRecipeFromInput`. `TileEntityGrinder` calls
  `CrusherRecipeRegistry.getOutputOnes/getOutputTwos/getOutputTwoChance/getRecipeFromInput`.
  ⇒ **removing from `ActuallyAdditionsAPI.crusherRecipes` takes effect immediately, no cache invalidation needed.**
* `searchCases` is a secondary ore-dictionary index built by `registerFinally()` (`-c`: builds a new ArrayList from
  `crusherRecipes` + `OreDictionary.getOreNames()`), used by `hasOreRecipe` (NEI/booklet). After bulk edits call
  `CrusherRecipeRegistry.registerFinally()` again, or clear `searchCases`, if NEI must stay correct.
* Double furnace: `de.ellpeck.actuallyadditions.mod.tile.TileEntityFurnaceDouble` has **no recipe collection at all**;
  `-c` shows it calls `FurnaceRecipes.func_77602_a().func_151395_a(ItemStack)` (= vanilla `getSmeltingResult`)
  → the double furnace is plain vanilla smelting (§10).
* No `removeCrusherRecipe` exists.

**Recommended removal strategy:** mutate `ActuallyAdditionsAPI.crusherRecipes` directly
(`removeIf(r -> r.getRecipeOutputOnes()…)`, `CrusherRecipe` exposes `public java.util.List<ItemStack>
getRecipeOutputOnes()/getRecipeOutputTwos()/getRecipeInputs()` and public fields `input`/`outputOne`/...),
then re-run `CrusherRecipeRegistry.registerFinally()`. Double-furnace recipes → vanilla `FurnaceRecipes`.

---

## 6. MineFactoryReloaded (MineFactoryReloaded-[1.7.10]2.8.2B1-201.jar)

* `powercrystals.minefactoryreloaded.api.FactoryRegistry` in this version contains **no recipe collections** —
  the whole class is:
  ```
  public class powercrystals.minefactoryreloaded.api.FactoryRegistry {
    public powercrystals.minefactoryreloaded.api.FactoryRegistry();
    public static void sendMessage(java.lang.String, java.lang.Object);
  }
  ```
* The live registry is `powercrystals.minefactoryreloaded.MFRRegistry` (abstract, all-static). Relevant members:

```
  private static java.util.Map<java.lang.Class<? extends net.minecraft.entity.EntityLivingBase>, powercrystals.minefactoryreloaded.api.IFactoryGrindable> _grindables;   // HashMap
  private static java.util.List<java.lang.Class<?>> _grindableBlacklist;                                                                                                // ArrayList
  public static void registerGrindable(powercrystals.minefactoryreloaded.api.IFactoryGrindable);
  public static java.util.Map<java.lang.Class<? extends net.minecraft.entity.EntityLivingBase>, powercrystals.minefactoryreloaded.api.IFactoryGrindable> getGrindables();
  public static void registerGrinderBlacklist(java.lang.Class<?>);
  public static java.util.List<java.lang.Class<?>> getGrinderBlacklist();
```

  `-c` of both getters is `getstatic _grindables; areturn` / `getstatic _grindableBlacklist; areturn`
  → **live, mutable, unwrapped**.
* There is **no ore-processing recipe registry** (the grinder processes *entities*; `IFactoryGrindable` supplies
  drops). `powercrystals.minefactoryreloaded.setup.recipe.{Vanilla,ThermalExpansion,EnderIO}` only register
  crafting-table recipes into the vanilla `CraftingManager` → §10.
* Grinder machine class: `powercrystals.minefactoryreloaded.tile.machine.TileEntityGrinder`.

**Recommended removal strategy:** `MFRRegistry.getGrindables().remove(EntityClass.class)` (or
`MFRRegistry.getGrinderBlacklist().add(EntityClass.class)` for a permanent skip). Reflecting into `_grindables`
is unnecessary. Anything ore/crafting-table related → vanilla CraftingManager route.

---

## 7. Railcraft (Railcraft-9.17.31.jar)

```
public class mods.railcraft.common.util.crafting.RollingMachineCraftingManager implements mods.railcraft.api.crafting.IRollingMachineCraftingManager {
  private final java.util.List<net.minecraft.item.crafting.IRecipe> recipes;              // ArrayList
  public static mods.railcraft.api.crafting.IRollingMachineCraftingManager getInstance();
  public static void copyRecipesToWorkbench();
  public void addRecipe(net.minecraft.item.ItemStack, java.lang.Object...);
  public void addShapelessRecipe(net.minecraft.item.ItemStack, java.lang.Object...);
  public net.minecraft.item.ItemStack findMatchingRecipe(net.minecraft.inventory.InventoryCrafting, net.minecraft.world.World);
  public java.util.List<net.minecraft.item.crafting.IRecipe> getRecipeList();
}
public class mods.railcraft.common.util.crafting.RockCrusherCraftingManager implements mods.railcraft.api.crafting.IRockCrusherCraftingManager {
  private final java.util.List<mods.railcraft.common.util.crafting.RockCrusherCraftingManager$CrusherRecipe> recipes;
  public static mods.railcraft.api.crafting.IRockCrusherCraftingManager getInstance();
  public java.util.List<? extends mods.railcraft.api.crafting.IRockCrusherRecipe> getRecipes();
  public mods.railcraft.api.crafting.IRockCrusherRecipe createNewRecipe(net.minecraft.item.ItemStack, boolean, boolean);
  public mods.railcraft.common.util.crafting.RockCrusherCraftingManager$CrusherRecipe getRecipe(net.minecraft.item.ItemStack);
}
public class mods.railcraft.common.util.crafting.BlastFurnaceCraftingManager implements mods.railcraft.api.crafting.IBlastFurnaceCraftingManager {
  private final java.util.List<mods.railcraft.common.util.crafting.BlastFurnaceCraftingManager$BlastFurnaceRecipe> recipes;
  private java.util.List<net.minecraft.item.ItemStack> fuels;
  public static mods.railcraft.api.crafting.IBlastFurnaceCraftingManager getInstance();
  public java.util.List<net.minecraft.item.ItemStack> getFuels();
  public java.util.List<? extends mods.railcraft.api.crafting.IBlastFurnaceRecipe> getRecipes();
  public void addRecipe(net.minecraft.item.ItemStack, boolean, boolean, int, net.minecraft.item.ItemStack);
  public mods.railcraft.api.crafting.IBlastFurnaceRecipe getRecipe(net.minecraft.item.ItemStack);
}
public class mods.railcraft.common.util.crafting.CokeOvenCraftingManager implements mods.railcraft.api.crafting.ICokeOvenCraftingManager {
  private final java.util.List<mods.railcraft.common.util.crafting.CokeOvenCraftingManager$CokeOvenRecipe> recipes;
  public static mods.railcraft.api.crafting.ICokeOvenCraftingManager getInstance();
  public java.util.List<? extends mods.railcraft.api.crafting.ICokeOvenRecipe> getRecipes();
  public void addRecipe(net.minecraft.item.ItemStack, boolean, boolean, net.minecraft.item.ItemStack, net.minecraftforge.fluids.FluidStack, int);
}
```

* **No remove/clear method exists on any Railcraft manager or API interface** (interfaces quoted: only
  `createNewRecipe`/`getRecipe`/`getRecipes`/`addRecipe`/`findMatchingRecipe`).
* `-c` proof: all four recipe lists are `new java/util/ArrayList` and `getRecipes()`/`getRecipeList()` is
  `getfield recipes` + `areturn` — **live and mutable** (`List<? extends X>` still accepts `remove(Object)`/`clear()`).
* **Exception / gotcha:** `BlastFurnaceCraftingManager.getFuels()` returns
  `Collections.unmodifiableList(...)` (`-c` shows `invokestatic java/util/Collections.unmodifiableList`) →
  blast-furnace **fuels cannot be removed** through the API.
* No cached lookup map: `RockCrusherCraftingManager`/`BlastFurnaceCraftingManager` only hold the recipe list, and
  their `getRecipe(ItemStack)` is a linear scan (no index field in javap) → nothing to invalidate.

**Recommended removal strategy:** `getInstance().getRecipes().remove(recipe)` / `removeIf(...)` (or `.clear()` for a
full wipe) on RockCrusher / BlastFurnace / CokeOven, and `((IRollingMachineCraftingManager)…).getRecipeList()`
for the rolling machine; `copyRecipesToWorkbench()` is how Railcraft mirrors rolling recipes, so remove **before**
that runs or re-run it afterwards. Fuels: not removable.

---

## 8. Utilities in Excess (utilitiesinexcess-1.0.0-alpha02.jar)

Package root is `com.fouristhenumber.utilitiesinexcess` (not `com.falsepattern.*`).

```
public class com.fouristhenumber.utilitiesinexcess.common.recipe.RecipeLoader {
  public static void run();
  private static void loadGeneratorRecipes();
  private static boolean addShapedRecipe(java.lang.Object, java.lang.Object...);
  private static boolean addShapelessRecipe(java.lang.Object, java.lang.Object...);
  private static boolean addFurnaceRecipe(java.lang.Object, java.lang.Object, float);
  ...
}
public class com.fouristhenumber.utilitiesinexcess.config.RecipeConfig {
  public static boolean enableBlockAnalyzerRecipe; ... public static boolean enableSuperArchitectsWandRecipe;
}
```

* **No runtime recipe registry exists.** `-c` shows `RecipeLoader` registering through
  `cpw.mods.fml.common.registry.GameRegistry.addShapedRecipe(ItemStack, Object...)`,
  `GameRegistry.addRecipe(IRecipe)` and
  `FurnaceRecipes.func_77602_a().func_151394_a(ItemStack, ItemStack, float)` (= vanilla `addSmeltingRecipe`).
  `DisableableItemStack` also calls `FurnaceRecipes.func_77602_a()` / `func_151394_a`.
* `RecipeConfig` is just static booleans toggled from the config file at load time (no API to set them).
* `apparently RecipeLoader.run()` is `public static` → calling it again re-adds everything.

**Recommended removal strategy:** treat as vanilla — remove the entries from `CraftingManager` / the
`FurnaceRecipes` map by output (§10). There is nothing mod-specific to clear; do not call `RecipeLoader.run()` after
removal.

---

## 9. Galacticraft / AdvancedRocketry / LibVulpes

### Galacticraft (Galacticraft-1.7-3.0.12.504.jar)

```
public class micdoodle8.mods.galacticraft.api.recipe.CompressorRecipes {
  private static java.util.List<net.minecraft.item.crafting.IRecipe> recipes;
  private static java.util.List<net.minecraft.item.crafting.IRecipe> recipesAdventure;
  public static net.minecraft.item.crafting.ShapedRecipes addRecipe(net.minecraft.item.ItemStack, java.lang.Object...);
  public static void addShapelessRecipe(net.minecraft.item.ItemStack, java.lang.Object...);
  public static net.minecraft.item.crafting.ShapedRecipes addRecipeAdventure(net.minecraft.item.ItemStack, java.lang.Object...);
  public static void addShapelessAdventure(net.minecraft.item.ItemStack, java.lang.Object...);
  public static net.minecraft.item.ItemStack findMatchingRecipe(net.minecraft.inventory.IInventory, net.minecraft.world.World);
  public static java.util.List<net.minecraft.item.crafting.IRecipe> getRecipeList();
  public static void removeRecipe(net.minecraft.item.ItemStack);      // <-- real removal API
}
public class micdoodle8.mods.galacticraft.api.recipe.CircuitFabricatorRecipes {
  private static java.util.HashMap<net.minecraft.item.ItemStack[], net.minecraft.item.ItemStack> recipes;
  public static java.util.ArrayList<java.util.ArrayList<net.minecraft.item.ItemStack>> slotValidItems;
  public static void addRecipe(net.minecraft.item.ItemStack, net.minecraft.item.ItemStack[]);
  public static net.minecraft.item.ItemStack getOutputForInput(net.minecraft.item.ItemStack[]);
  public static void removeRecipe(net.minecraft.item.ItemStack);      // <-- real removal API
}
```

* `CompressorRecipes.removeRecipe` (`-c` quoted): calls `getRecipeList()`, iterates it and removes every recipe
  whose **output** matches (`IRecipe.func_77571_b()` + `ItemStack.func_77989_b`) via `Iterator.remove()`.
  `getRecipeList()` returns `recipes` or `recipesAdventure` depending on
  `GalacticraftConfigAccess.getChallengeRecipes()` → it is the live list, so removal works.
* `CircuitFabricatorRecipes.removeRecipe` (`-c` quoted): iterates `recipes.entrySet()` and `Iterator.remove()`s
  entries whose **value** (output) matches. **Gotcha:** it does **not** rebuild
  `public static ArrayList<ArrayList<ItemStack>> slotValidItems` (the slot-validation/NEI cache) → after removal,
  clear or rebuild `slotValidItems` yourself (field is public).
* Other GC recipe classes (`RecipeManagerGC`, planets' `RecipeManagerMars/Asteroids`, NASA workbench
  `INasaWorkbenchRecipe`, `RecipeUtil`) are rocket/vehicle recipe managers, not ore processing — lower priority;
  they register into the crafting system / rockets and were not exhaustively enumerated.

### LibVulpes (LibVulpes-Continuation-1.7.10-0.2.11-universal.jar)

```
public class zmaster587.libVulpes.recipe.RecipesMachine {
  public java.util.HashMap<java.lang.Class<java.lang.Object>, java.util.List<zmaster587.libVulpes.interfaces.IRecipe>> recipeList;   // public, non-final
  private static zmaster587.libVulpes.recipe.RecipesMachine instance;
  public static zmaster587.libVulpes.recipe.RecipesMachine getInstance();
  public void clearRecipes(java.lang.Class);
  public void addRecipe(java.lang.Class, java.lang.Object[], int, int, java.lang.Object...);
  public void addRecipe(java.lang.Class, java.lang.Object, int, int, java.lang.Object...);
  public void addRecipe(java.lang.Class, java.util.List<java.lang.Object>, int, int, java.util.List<java.lang.Object>);
  public java.util.List<zmaster587.libVulpes.interfaces.IRecipe> getRecipes(java.lang.Class);
}
```

* `-c`: `clearRecipes(Class)` = `recipeList.get(c).clear()`; `getRecipes(Class)` = `recipeList.get(c)` + `areturn`
  → **the live per-machine `List<IRecipe>`; removal is fully supported without reflection**.
* **Gotchas:** `recipeList` is keyed by the machine's `TileEntity`/machine class
  (`HashMap<Class<Object>, List<IRecipe>>`), and `getRecipes(clazz)` returns `null` for a class that has no entry
  (NPE risk). The `recipeList` field is public and non-final, so it can also be replaced wholesale.

### AdvancedRocketry (AdvancedRocketry-Continuation-1.7.10-1.4.3-continuation.jar)

```
public class zmaster587.advancedRocketry.util.RecipeHandler {
  public void registerMachine(java.lang.Class<? extends zmaster587.libVulpes.tile.multiblock.TileMultiblockMachine>);
  public void clearAllMachineRecipes();
  public void registerXMLRecipes();
  public void registerAllMachineRecipes();
  public void createAutoGennedRecipes(java.util.HashMap<zmaster587.libVulpes.api.material.AllowedProducts, java.util.HashSet<java.lang.String>>);
}
```

AR does not carry its own recipe map: machine recipes live in LibVulpes' `RecipesMachine`, and this class only
(re)generates them (XML + auto-generated ore-dict recipes). **Gotcha:** `clearAllMachineRecipes()` wipes
LibVulpes' lists; `registerAllMachineRecipes()` / `registerXMLRecipes()` / `createAutoGennedRecipes(...)` re-add them.

**Recommended removal strategy:** Galacticraft → direct `CompressorRecipes.removeRecipe(stack)` and
`CircuitFabricatorRecipes.removeRecipe(stack)` (+ fix `slotValidItems`). LibVulpes/AdvancedRocketry →
`RecipesMachine.getInstance().getRecipes(MachineClass.class).removeIf(...)` or `clearRecipes(MachineClass.class)`,
executed **after** AR's `registerAllMachineRecipes()` and never followed by a re-register call.

---

## 10. Vanilla / Forge (1.7.10)

All names below are quoted from real bytecode of shipped jars (`CraftTweaker-1.7.10-3.1.0-legacy.jar`,
`CoFHCore`, `Railcraft`); MCP names are given in parentheses.

### Crafting

```
net/minecraft/item/crafting/CraftingManager.func_77594_a:()Lnet/minecraft/item/crafting/CraftingManager;      // getInstance()
net/minecraft/item/crafting/CraftingManager.func_77592_b:()Ljava/util/List;                                   // getRecipeList()
net/minecraft/item/crafting/CraftingManager.func_82787_a:(Lnet/minecraft/inventory/InventoryCrafting;Lnet/minecraft/world/World;)Lnet/minecraft/item/ItemStack;  // findMatchingRecipe
net/minecraft/item/crafting/IRecipe.func_77571_b:()Lnet/minecraft/item/ItemStack;                             // getRecipeOutput()
```

* Proof of liveliness: `minetweaker.mc1710.recipes.MCRecipeManager.<init>` does
  `invokestatic CraftingManager.func_77594_a()` → `invokevirtual CraftingManager.func_77592_b()` → `putfield recipes`
  and then mutates that cached `List` (javap shows `List.size/get/iterator/add` usage) — i.e. the returned list **is**
  the crafting recipe list, mutable, not wrapped.
* Ingredient inspection fields (from the same class): `ShapedRecipes.field_77576_b` (width),
  `ShapedRecipes.field_77577_c` (height), `ShapedRecipes.field_77574_d` (`ItemStack[]`),
  `ShapelessRecipes.field_77579_b` (`List`), `func_77570_a()` (recipe size),
  `net/minecraftforge/oredict/ShapedOreRecipe` / `ShapelessOreRecipe.func_77570_a()`.
* `ItemStack` helpers: `ItemStack.func_77989_b(ItemStack, ItemStack)` (areItemStacksEqual),
  `ItemStack.func_77973_b()` (getItem), `ItemStack.field_77994_a` (stackSize).

### Furnace

```
net/minecraft/item/crafting/FurnaceRecipes.func_77602_a:()Lnet/minecraft/item/crafting/FurnaceRecipes;         // smelting()
net/minecraft/item/crafting/FurnaceRecipes.func_77599_b:()Ljava/util/Map;                                     // getSmeltingList()
net/minecraft/item/crafting/FurnaceRecipes.func_151394_a:(Lnet/minecraft/item/ItemStack;Lnet/minecraft/item/ItemStack;F)V   // addSmeltingRecipe
net/minecraft/item/crafting/FurnaceRecipes.func_151395_a:(Lnet/minecraft/item/ItemStack;)Lnet/minecraft/item/ItemStack;     // getSmeltingResult
net/minecraft/item/crafting/FurnaceRecipes.func_151398_b:(Lnet/minecraft/item/ItemStack;)F                    // getSmeltingExperience
```

* `MCFurnaceManager.remove(...)` does `FurnaceRecipes.func_77602_a()` → `FurnaceRecipes.func_77599_b()` →
  `Map` and mutates that map (javap: `-c` of `minetweaker.mc1710.furnace.MCFurnaceManager`), i.e. the smelting list is
  the live `Map` (keyed by `ItemStack`, value `ItemStack`).
* There is **no** `getSmeltingExperience`-setter; XP is the `float` stored alongside each entry
  (`func_151398_b` reads it).

### Identifying which mod a recipe belongs to

```
net/minecraft/item/Item.field_150901_e:Lnet/minecraft/util/RegistryNamespaced;          // Item.itemRegistry
net/minecraft/block/Block.field_149771_c:Lnet/minecraft/util/RegistryNamespaced;        // Block.blockRegistry
net/minecraft/util/RegistryNamespaced.func_148750_c:(Ljava/lang/Object;)Ljava/lang/String;   // getNameForObject(Object)
net/minecraft/util/RegistryNamespaced.func_82594_a:(Ljava/lang/String;)Ljava/lang/Object;    // getObject(String)
net/minecraft/util/RegistryNamespaced.func_148742_b:()Ljava/util/Set;                        // getKeys()
cpw/mods/fml/common/registry/GameRegistry.findUniqueIdentifierFor:(Lnet/minecraft/item/Item;)Lcpw/mods/fml/common/registry/GameRegistry$UniqueIdentifier;
cpw/mods/fml/common/registry/GameRegistry.findUniqueIdentifierFor:(Lnet/minecraft/item/Block;)Lcpw/mods/fml/common/registry/GameRegistry$UniqueIdentifier;
cpw/mods/fml/common/registry/GameRegistry$UniqueIdentifier { public final java.lang.String modId; public final java.lang.String name; }
```

* `Item.field_150901_e` / `Block.field_149771_c` + `RegistryNamespaced.func_148750_c(Object)` were read from
  `minetweaker.mc1710.brackets.ItemBracketHandler` and `cofh.core.crash.CrashHelper$4` bytecode respectively.
  `Item.itemRegistry.getNameForObject(item)` → `"modid:name"`.
* `GameRegistry.findUniqueIdentifierFor` was read from `mods.railcraft.common.blocks.signals.RoutingLogic$TypeCondition`
  bytecode: `ItemStack.func_77973_b()` → `GameRegistry.findUniqueIdentifierFor(Item)` →
  `GameRegistry$UniqueIdentifier.modId` / `.name`. (In the shipped Forge universal jar the two overloads print with
  obfuscated parameter types `adb`/`aji`, because that jar is pre-remap; the Railcraft call site shows the
  `net/minecraft/item/Item` overload.)
* For "which mod does this machine recipe come from", the same `GameRegistry.findUniqueIdentifierFor` /
  `Item.itemRegistry.getNameForObject` on the recipe's ItemStack output is the reliable check; for
  `ShapedOreRecipe`/`ShapelessOreRecipe` you must walk the ingredient list, and for modded `IRecipe` types fall back
  to `recipe.getClass().getName()` package prefixes.
* Practical alternative: `CraftTweaker-1.7.10-3.1.0-legacy.jar` (`minetweaker.mc1710.recipes.MCRecipeManager` with
  `public int remove(minetweaker.api.item.IIngredient, boolean)`, `MCFurnaceManager.remove(...)`) and
  `ModTweaker2-0.9.6.jar` already implement removal for vanilla + several mods at runtime; if the bridge only needs
  scripted removal, delegating to them is less work than reimplementing.

**Recommended removal strategy:** mutate the live collections —
`CraftingManager.func_77592_b().removeIf(...)` (match `func_77571_b()` output / ingredients) and
`FurnaceRecipes.func_77602_a().func_77599_b().remove(inputStack)`; add via `GameRegistry.addShapedRecipe/…` and
`FurnaceRecipes.func_151394_a(...)`. Attribute recipes with `Item.itemRegistry.getNameForObject(...)` /
`GameRegistry.findUniqueIdentifierFor(...)`.

---

## Recommended removal strategy per mod (summary table)

| # | Mod | Strategy | Reflection? |
|---|-----|----------|-------------|
| 1 | EnderIO | `MachineRecipeRegistry.instance.getRecipesForMachine(key).remove(uid)` **and** manager `getRecipes().remove(...)`; keys `blockAlloySmelter/blockSagMill/blockVat/blockSliceAndSplice/blockSoulBinder` | No |
| 2 | Thermal Expansion | direct `XxxManager.removeRecipe(...)` / `removeFillRecipe` / `removeExtractionRecipe` | No (except Precipitator/Extruder → reflect `recipeMap`) |
| 3 | AE2 | Inscriber: `inscriber().removeRecipe(existingInstance)`; Grinder: mutate live `getRecipes()` list (run late for ore-dict injections) | No |
| 4 | IC2 | iterate `Recipes.<machine>.getRecipes().entrySet()` + `Iterator.remove()` (cache-aware); matches via `IRecipeInput.matches`; lists/fuel maps: mutate directly | No |
| 5 | ActuallyAdditions | `ActuallyAdditionsAPI.crusherRecipes.removeIf(...)` then `CrusherRecipeRegistry.registerFinally()`; double furnace → vanilla | No |
| 6 | MineFactoryReloaded | `MFRRegistry.getGrindables().remove(class)` / `getGrinderBlacklist().add(class)`; machine crafting recipes → vanilla | No |
| 7 | Railcraft | `getInstance().getRecipes().remove(...)` / `.clear()` (RockCrusher/BlastFurnace/CokeOven), `getRecipeList()` (RollingMachine) | No |
| 8 | Utilities in Excess | none of its own — remove from `CraftingManager` / `FurnaceRecipes` | No |
| 9 | Galacticraft / AR / LibVulpes | GC: `CompressorRecipes.removeRecipe` / `CircuitFabricatorRecipes.removeRecipe` (+rebuild `slotValidItems`); LibVulpes: `RecipesMachine.getRecipes(Class).removeIf(...)` / `clearRecipes(Class)` | No |
| 10 | Vanilla / Forge | `CraftingManager.func_77592_b().removeIf(...)`, `FurnaceRecipes.func_77602_a().func_77599_b().remove(...)` | No |

---

## Not removable / risky

1. **CoFH `PrecipitatorManager` and `ExtruderManager`** — no `removeRecipe` at all (javap lists only
   `addDefaultRecipes/loadRecipes/refreshRecipes/getRecipeList`). Requires reflection into the private static
   `recipeMap` (`Map<Fluid, RecipePrecipitator>` / `Map<List<?>, RecipeExtruder>`). Not confirmed to be a `HashMap`
   at runtime for Extruder (declared `java.util.Map`).
2. **CoFH reload hazard** — `refreshRecipes()` is called from
   `cofh.thermalexpansion.ThermalExpansion.handleIdMapping()` (public synchronized); an ID remap after removal can
   restore default recipes. `loadRecipes()`/`addDefaultRecipes()` are public static too.
3. **CoFH Smelter/Insolator stale sets** — `validationSet` and `lockSet` keep entries after `removeRecipe` (verified
   `-c`: only `recipeMap.remove` is performed). Reflection needed if input validation must change.
4. **AE2 inscriber `inputs`/`optionals`** — not updated by `removeRecipe` (verified: only `recipes.removeIf`).
5. **AE2 grinder re-injection** — `GrinderRecipeManager implements IOreListener`; `oreRegistered(...)` can add grinder
   recipes for ores/ingots/dusts registered after your removal.
6. **AE2 compressor / heat pump / press** — no registry exists in this build (only `appeng.recipes.handlers.Press`);
   not removable without patching the handler class.
7. **IC2 has no removal API**; the only safe path is the cache-aware `entrySet()` iterator view. Writing to the
   private `recipes` field (reflection) leaves `recipeCache` (`IdentityHashMap`) stale → the machine keeps producing
   the removed output. Also, IC2 machine slots (`InvSlotProcessableGeneric.recipeManager`, a **public** field) cache
   the manager instance from construction time, so swapping `Recipes.macerator` for a filtering wrapper only affects
   machines built afterwards.
8. **IC2 `IRecipeInput` key equality** — `RecipeInputItemStack`/`RecipeInputOreDict`/`RecipeInputFluidContainer` do
   not override `equals`/`hashCode`, so `Map.remove(new RecipeInputItemStack(...))` silently fails; iterate instead.
9. **IC2 `advRecipes` (`AdvCraftingRecipeManager`)** — only `addRecipe`/`addShapelessRecipe` verified; no removal
   method found. Its recipes are added through the vanilla crafting system, so treat as vanilla removal.
10. **Railcraft blast-furnace fuels** — `getFuels()` returns `Collections.unmodifiableList(...)`; not removable
    through the API (no setter/remove method found).
11. **Galacticraft circuit fabricator cache** — `removeRecipe` does not update
    `public static ArrayList<ArrayList<ItemStack>> slotValidItems`; it must be cleared/rebuilt by the bridge.
12. **EnderIO soul binder** — `SoulBinderRecipeManager` exposes no collection at all; removal is only possible via
    the `MachineRecipeRegistry` map (works, but the UID must be known/derived from the `ISoulBinderRecipe`).
13. **EnderIO XML reload** — `loadRecipesFromConfig()`/`addCustomRecipes(String)` are public and re-add; the managers
    never call `List.clear`, so re-running them duplicates entries and re-registers into `MachineRecipeRegistry`.
14. **MFR grinder drops** — drops come from the `IFactoryGrindable` implementation (per entity class), not from a
    data table; a mod's custom grindable cannot be "edited", only removed or blacklisted.
15. **Not exhaustively confirmed:** Galacticraft's rocket/NASA-workbench recipe managers
    (`RecipeManagerGC`/`RecipeManagerMars`/`RecipeManagerAsteroids`/`NasaWorkbenchRecipe`/`RecipeUtil`), and
    `appeng.recipes.RecipeData`/`RecipeHandler` (AE2's own recipe-file loader) — class/method lists were not fully
    javapped, since they are crafting/rocket recipes rather than ore-processing registries.
16. **No obfuscation anywhere** in the target classes: all of them resolve by their deobfuscated names with
    `javap -p`, so reflection is only needed for private fields (TE Precipitator/Extruder, CoFH `validationSet`/
    `lockSet`).

### Reproduction notes

* Extracted with `[System.IO.Compression.ZipFile]::ExtractToDirectory($jar, "E:\game\minecraft\gt6\tools\research\ex\<mod>\")`.
* Raw javap dumps for the EnderIO managers are kept in `E:\game\minecraft\gt6\tools\research\raw\`.
* Nothing under `E:\game\minecraft\gt6\.minecraft\` was modified (jars were only read from the mods dir).
