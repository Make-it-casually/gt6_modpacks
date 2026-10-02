package dshgt6bridge;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Runtime verification of every Minecraft/Forge/FML member this mod calls.
 *
 * gt6bridge is compiled against minimal compile-time stubs (the shipped Forge jar has no
 * deobfuscated net.minecraft.*), so a wrong stub signature could only be discovered as a
 * NoSuchMethodError in the middle of a world load. This class resolves every referenced
 * member reflectively on the REAL runtime classes, records the result in report.txt and
 * lets each pass skip itself instead of crashing when a link is missing.
 */
public final class LinkCheck {

    private static final Map<String, Boolean> OK = new HashMap<String, Boolean>();
    private static final List<String> FAILURES = new ArrayList<String>();

    private LinkCheck() {}

    public static boolean ok(String key) {
        Boolean b = OK.get(key);
        return b != null && b.booleanValue();
    }

    public static int failureCount() {
        return FAILURES.size();
    }

    public static void run(Report rep) {
        rep.heading("runtime link check (do the compile-time stubs match the real classes?)");

        boolean itemStack =
            check("vanilla.itemstack", "net.minecraft.item.ItemStack class", Reflect.cls("net.minecraft.item.ItemStack")) &
            ctor("vanilla.itemstack", "ItemStack(Item,int,int)", "net.minecraft.item.ItemStack",
                Reflect.cls("net.minecraft.item.Item"), int.class, int.class) &
            method("vanilla.itemstack", "ItemStack.func_77973_b() [getItem]",
                "net.minecraft.item.ItemStack", "func_77973_b") &
            method("vanilla.itemstack", "ItemStack.func_77960_j() [getItemDamage]",
                "net.minecraft.item.ItemStack", "func_77960_j") &
            method("vanilla.itemstack", "ItemStack.func_77946_l() [copy]",
                "net.minecraft.item.ItemStack", "func_77946_l");

        Class<?> rn = Reflect.cls("net.minecraft.util.RegistryNamespaced");
        boolean registry =
            check("vanilla.registry", "RegistryNamespaced class", rn) &
            field("vanilla.registry", "Item.field_150901_e [itemRegistry]",
                "net.minecraft.item.Item", "field_150901_e", rn) &
            method("vanilla.registry", "RegistryNamespaced.func_148750_c(Object) [getNameForObject]",
                "net.minecraft.util.RegistryNamespaced", "func_148750_c", Object.class) &
            method("vanilla.registry", "RegistryNamespaced.func_82594_a(String) [getObject]",
                "net.minecraft.util.RegistryNamespaced", "func_82594_a", String.class) &
            method("vanilla.registry", "RegistryNamespaced.func_148742_b() [getKeys]",
                "net.minecraft.util.RegistryNamespaced", "func_148742_b");

        boolean crafting =
            method("vanilla.crafting", "CraftingManager.func_77594_a() [getInstance]",
                "net.minecraft.item.crafting.CraftingManager", "func_77594_a") &
            method("vanilla.crafting", "CraftingManager.func_77592_b() [getRecipeList]",
                "net.minecraft.item.crafting.CraftingManager", "func_77592_b") &
            method("vanilla.crafting", "IRecipe.func_77571_b() [getRecipeOutput]",
                "net.minecraft.item.crafting.IRecipe", "func_77571_b");

        boolean furnace =
            method("vanilla.furnace", "FurnaceRecipes.func_77602_a() [smelting]",
                "net.minecraft.item.crafting.FurnaceRecipes", "func_77602_a") &
            method("vanilla.furnace", "FurnaceRecipes.func_77599_b() [getSmeltingList]",
                "net.minecraft.item.crafting.FurnaceRecipes", "func_77599_b");

        boolean oredict =
            method("forge.oredict", "OreDictionary.getOreNames()",
                "net.minecraftforge.oredict.OreDictionary", "getOreNames") &
            method("forge.oredict", "OreDictionary.getOres(String,boolean)",
                "net.minecraftforge.oredict.OreDictionary", "getOres", String.class, boolean.class) &
            field("forge.oredict", "OreDictionary.WILDCARD_VALUE",
                "net.minecraftforge.oredict.OreDictionary", "WILDCARD_VALUE", int.class);

        boolean loader =
            method("fml.loader", "Loader.instance()", "cpw.mods.fml.common.Loader", "instance") &
            method("fml.loader", "Loader.getConfigDir()", "cpw.mods.fml.common.Loader", "getConfigDir");

        boolean log =
            method("fml.log", "FMLLog.info(String,Object[])",
                "cpw.mods.fml.common.FMLLog", "info", String.class, Object[].class);

        rep.line("  vanilla itemstack : " + itemStack);
        rep.line("  vanilla registry  : " + registry);
        rep.line("  vanilla crafting  : " + crafting);
        rep.line("  vanilla furnace   : " + furnace);
        rep.line("  forge ore dict    : " + oredict);
        rep.line("  FML loader        : " + loader);
        rep.line("  FML log           : " + log);
        rep.line("  missing links     : " + FAILURES.size());
        rep.count("links.failed", FAILURES.size());
        for (String f : FAILURES) rep.error("link check: " + f);
    }

    // ------------------------------------------------------------------ helpers

    private static boolean check(String key, String what, Class<?> c) {
        if (c == null) {
            fail(key, what + " -> class not found");
            return false;
        }
        pass(key);
        return true;
    }

    private static boolean method(String key, String what, String className, String name, Class<?>... params) {
        Class<?> c = Reflect.cls(className);
        if (c == null) {
            fail(key, what + " -> class " + className + " not found");
            return false;
        }
        if (!Reflect.hasSignature(c, name, params)) {
            fail(key, what + " -> method not found");
            return false;
        }
        pass(key);
        return true;
    }

    private static boolean field(String key, String what, String className, String name, Class<?> type) {
        Class<?> c = Reflect.cls(className);
        if (c == null) {
            fail(key, what + " -> class " + className + " not found");
            return false;
        }
        if (!Reflect.hasField(c, name, type)) {
            fail(key, what + " -> field not found");
            return false;
        }
        pass(key);
        return true;
    }

    private static boolean ctor(String key, String what, String className, Class<?>... params) {
        Class<?> c = Reflect.cls(className);
        if (c == null) {
            fail(key, what + " -> class " + className + " not found");
            return false;
        }
        if (!Reflect.hasCtor(c, params)) {
            fail(key, what + " -> constructor not found");
            return false;
        }
        pass(key);
        return true;
    }

    private static void pass(String key) {
        Boolean old = OK.get(key);
        OK.put(key, Boolean.valueOf(old == null ? true : old.booleanValue()));
    }

    private static void fail(String key, String what) {
        OK.put(key, Boolean.FALSE);
        FAILURES.add(what);
    }
}
