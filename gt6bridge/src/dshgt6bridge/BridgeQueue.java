package dshgt6bridge;

import java.util.ArrayList;
import java.util.List;

import net.minecraft.item.ItemStack;

/**
 * Requests made by CraftTweaker / MineTweaker scripts before the recipe passes run.
 *
 * Scripts are executed by MineTweaker during PostInit, i.e. before GT6 finished registering its
 * own recipes, so recipe requests are queued here and drained by the load-complete passes.
 */
public final class BridgeQueue {

    public static final class RecipeRequest {
        public final String map;
        public final ItemStack[] inputs;
        public final ItemStack[] outputs;
        public final long eut;
        public final long duration;
        public final String origin;

        RecipeRequest(String map, ItemStack[] inputs, ItemStack[] outputs, long eut, long duration, String origin) {
            this.map = map;
            this.inputs = inputs;
            this.outputs = outputs;
            this.eut = eut;
            this.duration = duration;
            this.origin = origin;
        }
    }

    public static final class RemovalRequest {
        public final String target;
        public final String selector;
        public final String origin;

        RemovalRequest(String target, String selector, String origin) {
            this.target = target;
            this.selector = selector;
            this.origin = origin;
        }
    }

    private static final List<RecipeRequest> RECIPES = new ArrayList<RecipeRequest>();
    private static final List<RemovalRequest> REMOVALS = new ArrayList<RemovalRequest>();

    private BridgeQueue() {}

    public static synchronized void addRecipe(String map, ItemStack[] inputs, ItemStack[] outputs,
                                              long eut, long duration, String origin) {
        RECIPES.add(new RecipeRequest(map, inputs, outputs, eut, duration, origin));
    }

    public static synchronized void addRemoval(String target, String selector, String origin) {
        REMOVALS.add(new RemovalRequest(target, selector, origin));
    }

    public static synchronized List<RecipeRequest> drainRecipes() {
        List<RecipeRequest> out = new ArrayList<RecipeRequest>(RECIPES);
        RECIPES.clear();
        return out;
    }

    public static synchronized List<RemovalRequest> drainRemovals() {
        List<RemovalRequest> out = new ArrayList<RemovalRequest>(REMOVALS);
        REMOVALS.clear();
        return out;
    }

    public static synchronized int pendingRecipes() {
        return RECIPES.size();
    }

    public static synchronized int pendingRemovals() {
        return REMOVALS.size();
    }

    public static synchronized void clear() {
        RECIPES.clear();
        REMOVALS.clear();
    }
}
