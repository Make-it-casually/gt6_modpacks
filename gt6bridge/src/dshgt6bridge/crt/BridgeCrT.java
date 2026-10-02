package dshgt6bridge.crt;

import dshgt6bridge.Bridge;
import dshgt6bridge.BridgeQueue;
import dshgt6bridge.GT6Bridge;
import dshgt6bridge.Overrides;
import minetweaker.MineTweakerAPI;
import minetweaker.api.item.IItemStack;
import minetweaker.api.minecraft.MineTweakerMC;
import net.minecraft.item.ItemStack;
import stanhebben.zenscript.annotations.Optional;
import stanhebben.zenscript.annotations.ZenClass;
import stanhebben.zenscript.annotations.ZenMethod;

/**
 * CraftTweaker / MineTweaker 3 script entry point.
 *
 *     import mods.gt6bridge.Bridge;
 *
 *     Bridge.bind("Enderium", "Enderium");            // ore dict material token -> GT6 material
 *     Bridge.skip("TofuMetal");                       // never bind that token
 *     Bridge.bindItem("EnderIO:itemAlloy:6", "ingot", "Enderium");
 *     Bridge.addRecipe("Crusher", [<EnderIO:itemAlloy:6>], [<minecraft:gold_ingot>], 16, 40);
 *     Bridge.addRecipe("Mixer", [<ore:ingotCopper>, <ore:ingotTin>], [<minecraft:gold_ingot>]);
 *     Bridge.removeRecipe("te_pulverizer", "*:ore*");
 *     print(Bridge.countRemovable("ic2_macerator", "*:ore*"));
 *     print(Bridge.apply());
 *
 * Material bindings/skips take effect in the next automatic pass; recipe requests are queued and
 * applied when the passes run (MineTweaker executes scripts during PostInit, before GT6 has
 * registered all of its recipes). Bridge.apply() runs the passes immediately and returns a summary.
 *
 * This class references MineTweaker/ZenScript types directly, so it is only loaded when
 * MineTweaker is installed - see CrtHook.
 */
@ZenClass("mods.gt6bridge.Bridge")
public final class BridgeCrT {

    private BridgeCrT() {}

    @ZenMethod
    public static void bind(String materialToken, String gt6Material) {
        Overrides.bindMaterial(materialToken, gt6Material);
        MineTweakerAPI.logInfo("[gt6bridge] material token '" + materialToken + "' -> '" + gt6Material
            + "' (takes effect in the next bridge pass)");
    }

    @ZenMethod
    public static void skip(String materialToken) {
        Overrides.skipMaterial(materialToken);
        MineTweakerAPI.logInfo("[gt6bridge] material token '" + materialToken + "' will not be bound");
    }

    @ZenMethod
    public static void bindItem(String selector, String prefix, String material) {
        Overrides.bindItem(selector, prefix, material);
        MineTweakerAPI.logInfo("[gt6bridge] item '" + selector + "' -> " + prefix + "/" + material);
    }

    @ZenMethod
    public static void addRecipe(String map, IItemStack[] inputs, IItemStack[] outputs) {
        addRecipe(map, inputs, outputs, 16, 32);
    }

    @ZenMethod
    public static void addRecipe(String map, IItemStack[] inputs, IItemStack[] outputs, int eut, int duration) {
        ItemStack[] in = toStacks(inputs);
        ItemStack[] out = toStacks(outputs);
        if (in.length == 0 || out.length == 0) {
            MineTweakerAPI.logError("[gt6bridge] addRecipe(" + map + ") needs at least one input and output");
            return;
        }
        BridgeQueue.addRecipe(map, in, out, eut, duration, "script");
        MineTweakerAPI.logInfo("[gt6bridge] queued recipe on " + map + ": " + in.length + " input(s) -> "
            + out.length + " output(s), " + eut + " EU/t, " + duration + " ticks");
    }

    @ZenMethod
    public static void removeRecipe(String target, String selector) {
        BridgeQueue.addRemoval(target, selector, "script");
        MineTweakerAPI.logInfo("[gt6bridge] queued removal on " + target + " matching '" + selector
            + "' (applied when the bridge passes run)");
    }

    /** how many recipes that removal would hit - does not change anything. */
    @ZenMethod
    public static int countRemovable(String target, String selector) {
        try {
            return dshgt6bridge.RecipeRemover.countMatches(target, selector);
        } catch (Throwable t) {
            MineTweakerAPI.logError("[gt6bridge] countRemovable failed: " + t);
            return -1;
        }
    }

    /** runs the material, recipe and removal passes now and returns the report summary. */
    @ZenMethod
    public static String apply() {
        try {
            Bridge.INSTANCE.run("script-apply");
            return Bridge.lastSummary();
        } catch (Throwable t) {
            MineTweakerAPI.logError("[gt6bridge] apply() failed: " + t);
            return "gt6bridge apply failed: " + t;
        }
    }

    /** summary of the last pass (counters and the report path). */
    @ZenMethod
    public static String status() {
        return Bridge.lastSummary();
    }

    @ZenMethod
    public static String version() {
        return GT6Bridge.VERSION;
    }

    private static ItemStack[] toStacks(IItemStack[] in) {
        if (in == null) return new ItemStack[0];
        ItemStack[] out = new ItemStack[in.length];
        int n = 0;
        for (IItemStack s : in) {
            if (s == null) continue;
            ItemStack mc = MineTweakerMC.getItemStack(s);
            if (mc != null) out[n++] = mc;
        }
        if (n == out.length) return out;
        ItemStack[] trimmed = new ItemStack[n];
        System.arraycopy(out, 0, trimmed, 0, n);
        return trimmed;
    }

    /** keeps the @Optional import meaningful for overload resolution in ZenScript. */
    @ZenMethod
    public static void addRecipe(String map, IItemStack[] inputs, IItemStack[] outputs,
                                 @Optional int eut, @Optional int duration, @Optional String note) {
        addRecipe(map, inputs, outputs, eut <= 0 ? 16 : eut, duration <= 0 ? 32 : duration);
    }
}
