package cofh.thermalexpansion.util.crafting;

import java.util.HashMap;
import java.util.Map;

public class TransposerManager {

    private static final Map<Object, Object> recipeMapFill = new HashMap<Object, Object>();
    private static final Map<Object, Object> recipeMapExtraction = new HashMap<Object, Object>();

    public static void addFillFixture(Object key, Object recipe) {
        recipeMapFill.put(key, recipe);
    }

    public static void addExtractionFixture(Object key, Object recipe) {
        recipeMapExtraction.put(key, recipe);
    }

    public static int fillCount() {
        return recipeMapFill.size();
    }

    public static int extractionCount() {
        return recipeMapExtraction.size();
    }
}
