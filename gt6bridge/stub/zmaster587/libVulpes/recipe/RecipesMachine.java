package zmaster587.libVulpes.recipe;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RecipesMachine {

    private static final RecipesMachine INSTANCE = new RecipesMachine();
    public final Map<Class<?>, List<Object>> recipeList = new HashMap<Class<?>, List<Object>>();

    public static RecipesMachine getInstance() {
        return INSTANCE;
    }

    public List<Object> getRecipes(Class<?> machine) {
        return recipeList.get(machine);
    }

    public void addRecipe(Class<?> machine, Object recipe) {
        List<Object> recipes = recipeList.get(machine);
        if (recipes == null) {
            recipes = new ArrayList<Object>();
            recipeList.put(machine, recipes);
        }
        recipes.add(recipe);
    }
}
