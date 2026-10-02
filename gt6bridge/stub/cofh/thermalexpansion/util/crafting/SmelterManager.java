package cofh.thermalexpansion.util.crafting;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class SmelterManager {

    private static final Map<Object, Object> recipeMap = new HashMap<Object, Object>();
    private static final Set<Object> validationSet = new HashSet<Object>();
    private static final Set<Object> lockSet = new HashSet<Object>();

    public static void addFixture(Object key, Object recipe) {
        recipeMap.put(key, recipe);
        validationSet.add(key);
        lockSet.add(key);
    }

    public static int recipeCount() {
        return recipeMap.size();
    }

    public static int validationCount() {
        return validationSet.size();
    }

    public static int lockCount() {
        return lockSet.size();
    }
}
