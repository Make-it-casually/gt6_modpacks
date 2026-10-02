package dshgt6bridge;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import gregapi.data.RM;
import gregapi.oredict.OreDictItemData;
import gregapi.oredict.OreDictManager;
import gregapi.oredict.OreDictMaterial;
import gregapi.oredict.OreDictPrefix;
import gregapi.recipes.Recipe;
import gregapi.util.OM;
import net.minecraft.item.ItemStack;

/**
 * Defensive facade over the GregTech 6 API (built against gregtech_1.7.10-6.17.06.jar).
 * Every call is wrapped so a missing/renamed API can never take the game down - failures
 * are counted and reported instead.
 */
public final class Gt6 {

    private Gt6() {}

    public static OreDictManager om() {
        return OreDictManager.INSTANCE;
    }

    public static OreDictItemData data(ItemStack stack) {
        try {
            OreDictItemData d = OM.data(stack);
            if (d != null) return d;
        } catch (Throwable ignored) {}
        try {
            return om().getItemData_(stack);
        } catch (Throwable ignored) {}
        return null;
    }

    /** true when the stack already carries a usable (non auto-invalid) material binding. */
    public static boolean hasValidData(ItemStack stack) {
        OreDictItemData d = data(stack);
        if (d == null) return false;
        try {
            return d.validMaterial();
        } catch (Throwable t) {
            return true;
        }
    }

    public static OreDictPrefix prefixOf(OreDictItemData d) {
        if (d == null) return null;
        try { return d.mPrefix; } catch (Throwable t) { return null; }
    }

    public static OreDictMaterial materialOf(OreDictItemData d) {
        if (d == null) return null;
        try {
            return d.mMaterial == null ? null : d.mMaterial.mMaterial;
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * true when the stack's stored data points at the same material. Used to verify every write -
     * GT6's OM.data(ItemStack, OreDictItemData) is void and addItemData_ silently refuses when the
     * stack already has data, so a boolean return value alone cannot be trusted.
     */
    public static boolean sameMaterial(OreDictItemData d, OreDictMaterial material) {
        if (d == null || material == null) return false;
        try {
            OreDictMaterial now = materialOf(d);
            return now != null && now.mNameInternal != null && material.mNameInternal != null
                && now.mNameInternal.equalsIgnoreCase(material.mNameInternal);
        } catch (Throwable t) {
            return false;
        }
    }

    /** Binds (or re-binds) a stack to a GT6 prefix+material. Returns true only if the write stuck. */
    public static boolean bind(ItemStack stack, OreDictPrefix prefix, OreDictMaterial material) {
        if (stack == null || prefix == null || material == null) return false;
        OreDictItemData d;
        try {
            d = new OreDictItemData(prefix, material);
        } catch (Throwable t) {
            return false;
        }
        // setItemData_ refuses to replace an existing non Wood association, addItemData_ only writes
        // when there is no data at all - whatever succeeds, confirm it by reading the data back
        try {
            if (om().setItemData(stack, d) && sameMaterial(data(stack), material)) return true;
        } catch (Throwable ignored) {}
        try {
            if (om().addItemData(stack, d) && sameMaterial(data(stack), material)) return true;
        } catch (Throwable ignored) {}
        try {
            OM.data(stack, d);
            return sameMaterial(data(stack), material);
        } catch (Throwable ignored) {}
        return false;
    }

    public static OreDictPrefix prefix(String name) {
        if (name == null || name.isEmpty()) return null;
        try {
            OreDictPrefix p = OreDictPrefix.get(name);
            if (p != null) return p;
        } catch (Throwable ignored) {}
        try {
            Map<String, OreDictPrefix> m = OreDictPrefix.sPrefixes;
            if (m != null) {
                for (Map.Entry<String, OreDictPrefix> e : m.entrySet()) {
                    if (e.getKey().equalsIgnoreCase(name)) return e.getValue();
                }
            }
        } catch (Throwable ignored) {}
        return null;
    }

    public static OreDictMaterial material(String token) {
        if (token == null || token.isEmpty()) return null;
        try {
            Map<String, OreDictMaterial> m = OreDictMaterial.MATERIAL_MAP;
            if (m != null) {
                OreDictMaterial mat = m.get(token);
                if (mat != null) return mat;
                for (Map.Entry<String, OreDictMaterial> e : m.entrySet()) {
                    if (e.getKey().equalsIgnoreCase(token)) return e.getValue();
                }
            }
        } catch (Throwable ignored) {}
        try {
            return OreDictMaterial.get(token);
        } catch (Throwable ignored) {}
        return null;
    }

    /** the GT6 item for a prefix+material, e.g. (dust, Iron) - null when GT6 has no such item. */
    public static ItemStack gtStack(OreDictPrefix prefix, OreDictMaterial material, long size) {
        try {
            return OM.get(prefix, material, size);
        } catch (Throwable t) {
            return null;
        }
    }

    public static List<String> recipeMapNames() {
        List<String> out = new ArrayList<String>();
        try {
            for (Field f : RM.class.getFields()) {
                if (f.getType() == Recipe.RecipeMap.class) out.add(f.getName());
            }
        } catch (Throwable ignored) {}
        return out;
    }

    public static Recipe.RecipeMap recipeMap(String name) {
        if (name == null) return null;
        try {
            Field f = RM.class.getField(name.trim());
            if (f.getType() != Recipe.RecipeMap.class) return null;
            Object o = f.get(null);
            return (Recipe.RecipeMap) o;
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * Adds a simple recipe: one input stack, any number of output stacks.
     *
     * GT6's helper signature is addRecipe1(boolean aOptimize, long aEUt, long aDuration, ...) -
     * the argument order is EU/t BEFORE duration (verified in Recipe$RecipeMap bytecode: slot 2
     * goes into Recipe.mEUt, slot 4 into Recipe.mDuration). A duration <= 0 is never stored.
     * Returns the created recipe (used as a sentinel to detect recipe map rebuilds).
     */
    public static Recipe add1(Recipe.RecipeMap map, boolean aOptimize, long eut, long duration,
                              ItemStack input, ItemStack[] outputs) {
        if (map == null || input == null || outputs == null || outputs.length == 0) return null;
        if (duration <= 0L) duration = 1L;
        try {
            return map.addRecipe1(aOptimize, eut, duration, input, outputs);
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * Adds a recipe with one or more inputs (addRecipeX). Same argument order as add1:
     * (aOptimize, aEUt, aDuration, inputs, outputs) - verified in Recipe$RecipeMap bytecode.
     */
    public static Recipe addX(Recipe.RecipeMap map, boolean aOptimize, long eut, long duration,
                              ItemStack[] inputs, ItemStack[] outputs) {
        if (map == null || inputs == null || inputs.length == 0 || outputs == null || outputs.length == 0) return null;
        if (duration <= 0L) duration = 1L;
        try {
            return map.addRecipeX(aOptimize, eut, duration, inputs, outputs);
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * Same, with per output chances (10000 = 100%). The chances array is the 4th argument
     * (aOptimize, aEUt, aDuration, aChances, inputs, outputs) - verified in bytecode.
     */
    public static Recipe addXChances(Recipe.RecipeMap map, boolean aOptimize, long eut, long duration,
                                     long[] chances, ItemStack[] inputs, ItemStack[] outputs) {
        if (map == null || inputs == null || inputs.length == 0 || outputs == null || outputs.length == 0) return null;
        if (duration <= 0L) duration = 1L;
        try {
            return map.addRecipeX(aOptimize, eut, duration, chances, inputs, outputs);
        } catch (Throwable t) {
            return null;
        }
    }

    public static Collection<Recipe> recipes(Recipe.RecipeMap map) {
        if (map == null) return null;
        try {
            return map.mRecipeList;
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * RM.generify(input, output) - GT6's Generifier machine converts a foreign item into its
     * GT6 counterpart (1 tick, 0 EU/t). Direction: first argument is the input.
     */
    public static boolean generify(ItemStack from, ItemStack to) {
        if (from == null || to == null) return false;
        try {
            return RM.generify(from, to);
        } catch (Throwable t) {
            return false;
        }
    }

    public static ItemStack[] outputsOf(Recipe r) {
        try {
            return r.mOutputs;
        } catch (Throwable t) {
            return null;
        }
    }
}
