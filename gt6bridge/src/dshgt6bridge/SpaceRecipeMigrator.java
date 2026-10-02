package dshgt6bridge;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import gregapi.recipes.Recipe;
import net.minecraft.item.Item;
import net.minecraft.item.ItemStack;

/** Copies space-mod machine recipes into equivalent GT6 maps before removing their originals. */
public final class SpaceRecipeMigrator {

    private static final int MAX_EXPANSION = 64;
    private static final Map<String, MigratedRecipe> MIGRATED =
        new LinkedHashMap<String, MigratedRecipe>();

    private final Report rep;
    private final boolean enabled;
    private final boolean dryRun;

    public SpaceRecipeMigrator(Settings settings, Report rep) {
        this.rep = rep;
        this.enabled = settings.getBool("migrateSpaceRecipes");
        this.dryRun = settings.getBool("dryRun") || settings.getBool("removalDryRun");
    }

    public Map<Recipe, String> sentinels() {
        Map<Recipe, String> out = new LinkedHashMap<Recipe, String>();
        for (MigratedRecipe recipe : MIGRATED.values()) {
            if (recipe.created != null) out.put(recipe.created, recipe.map);
        }
        return out;
    }

    public void run() {
        if (!enabled) {
            rep.note("space recipe migration disabled by settings.csv");
        } else if (dryRun) {
            rep.note("space recipe migration is read-only while dryRun or removalDryRun is enabled");
            return;
        }

        if (!dryRun) {
            if (enabled) {
                rep.note("space recipes intentionally kept outside GT6: final rocket workbench/assembly recipes, "
                    + "oxygen/fuel processing, hydroponics, motherships, and machines without a deterministic item recipe");
                migrateGalacticraftCompressor();
                migrateGalacticraftCircuitFabricator();
                migrateAmunRaCircuitFabricator();
                migrateGalaxySpaceAssembler();
                migrateGalaxySpaceRocketParts();
            }
            replayMigratedRecipes();
        }
    }

    private void migrateGalacticraftCompressor() {
        Class<?> type = Reflect.cls("micdoodle8.mods.galacticraft.api.recipe.CompressorRecipes");
        if (type == null) return;
        Object listObj = Reflect.callStatic(type, "getRecipeList");
        if (!(listObj instanceof List)) {
            rep.error("Galacticraft CompressorRecipes.getRecipeList() is unavailable");
            return;
        }
        List<?> recipes = (List<?>) listObj;
        for (Object recipe : new ArrayList<Object>(recipes)) {
            if (migrateRecipe("galacticraft_compressor", "Compressor", recipe,
                recipeInputs(recipe), RecipeRemover.outputsOf(recipe))) {
                recipes.remove(recipe);
            }
        }
    }

    private void migrateGalacticraftCircuitFabricator() {
        Class<?> type = Reflect.cls("micdoodle8.mods.galacticraft.api.recipe.CircuitFabricatorRecipes");
        if (type == null) return;
        Object recipesObj = Reflect.staticField(type, "recipes");
        if (!(recipesObj instanceof Map)) {
            rep.error("Galacticraft CircuitFabricatorRecipes.recipes is unavailable");
            return;
        }
        Map<?, ?> recipes = (Map<?, ?>) recipesObj;
        boolean changed = false;
        for (Map.Entry<?, ?> entry : new ArrayList<Map.Entry<?, ?>>(recipes.entrySet())) {
            List<List<ItemStack>> inputs = inputSlots(entry.getKey());
            List<ItemStack> outputs = stacks(entry.getValue());
            if (migrate("galacticraft_circuitfabricator", "Assembler", inputs, outputs)) {
                recipes.remove(entry.getKey());
                changed = true;
            }
        }
        if (changed) rebuildCircuitFabricatorSlots(type, recipes);
    }

    private void migrateAmunRaCircuitFabricator() {
        Class<?> type = Reflect.cls("de.katzenpapst.amunra.crafting.RecipeHelper");
        if (type == null) return;
        Object recipesObj = Reflect.callStatic(type, "getCircuitFabricatorRecipes");
        if (!(recipesObj instanceof List)) {
            rep.error("AmunRa RecipeHelper.getCircuitFabricatorRecipes() is unavailable");
            return;
        }
        List<?> recipes = (List<?>) recipesObj;
        for (Object recipe : new ArrayList<Object>(recipes)) {
            List<List<ItemStack>> inputs = new ArrayList<List<ItemStack>>();
            boolean supported = true;
            for (String field : new String[] { "crystal", "silicon1", "silicon2", "redstone" }) {
                List<ItemStack> alternatives = stacks(Reflect.field(recipe, field));
                if (alternatives.isEmpty()) {
                    supported = false;
                    break;
                }
                inputs.add(alternatives);
            }
            if (!supported || !stacks(Reflect.field(recipe, "optional")).isEmpty()) {
                preserve("amunra_circuitfabricator", recipe, "optional or unrecognized slot");
                continue;
            }
            if (migrate("amunra_circuitfabricator", "Assembler", inputs,
                stacks(Reflect.field(recipe, "output")))) {
                recipes.remove(recipe);
            }
        }
    }

    private void migrateGalaxySpaceAssembler() {
        Class<?> type = Reflect.cls(
            "galaxyspace.systems.SolarSystem.planets.overworld.recipe.AssemberRecipes");
        if (type == null) return;
        Object instance = Reflect.staticField(type, "instance");
        Object recipesObj = Reflect.call(instance, "getRecipeList");
        if (!(recipesObj instanceof List)) {
            rep.error("GalaxySpace AssemberRecipes.getRecipeList() is unavailable");
            return;
        }
        List<?> recipes = (List<?>) recipesObj;
        for (Object recipe : new ArrayList<Object>(recipes)) {
            if (migrateRecipe("galaxyspace_assembler", "Assembler", recipe,
                recipeInputs(recipe), RecipeRemover.outputsOf(recipe))) {
                recipes.remove(recipe);
            }
        }
    }

    private void migrateGalaxySpaceRocketParts() {
        Class<?> type = Reflect.cls("galaxyspace.core.util.GSRecipeUtil");
        String[][] groups = {
            { "getConeRecipes", "Cone" },
            { "getBodyRecipes", "Body" },
            { "getEngineRecipes", "Engine" },
            { "getBoosterRecipes", "Booster" },
            { "getFinsRecipes", "Fins" },
            { "getOxTankRecipes", "OxygenTank" },
            { "getPNRRecipes", "NuclearPort" }
        };
        for (String[] group : groups) {
            Object recipesObj = Reflect.callStatic(type, group[0]);
            if (type != null && !(recipesObj instanceof List)) {
                rep.error("GalaxySpace GSRecipeUtil." + group[0] + "() is unavailable");
                continue;
            }
            List<?> recipes = (List<?>) recipesObj;
            String source = "galaxyspace_rocket_" + group[1].toLowerCase();
            for (Object recipe : new ArrayList<Object>(recipes)) {
                Object rawInputs = Reflect.pick(recipe, "getRecipeInput");
                List<List<ItemStack>> inputs = inputSlots(rawInputs);
                List<ItemStack> outputs = RecipeRemover.outputsOf(recipe);
                if (migrateRecipe(source, "Assembler", recipe, inputs, outputs)) {
                    recipes.remove(recipe);
                }
            }
        }
    }

    private List<List<ItemStack>> recipeInputs(Object recipe) {
        Object raw = Reflect.pick(recipe, "recipeItems", "getInput", "input", "getRecipeItems");
        return inputSlots(raw);
    }

    private List<List<ItemStack>> inputSlots(Object raw) {
        List<List<ItemStack>> slots = new ArrayList<List<ItemStack>>();
        if (raw == null) return slots;
        if (raw instanceof Map) {
            Map<?, ?> mapped = (Map<?, ?>) raw;
            List<Object> keys = new ArrayList<Object>(mapped.keySet());
            java.util.Collections.sort(keys, new java.util.Comparator<Object>() {
                @Override
                public int compare(Object left, Object right) {
                    if (left instanceof Number && right instanceof Number) {
                        return ((Number) left).intValue() - ((Number) right).intValue();
                    }
                    return String.valueOf(left).compareTo(String.valueOf(right));
                }
            });
            for (Object key : keys) {
                Object value = mapped.get(key);
                if (value == null) continue;
                List<ItemStack> alternatives = stacks(value);
                if (!alternatives.isEmpty()) slots.add(alternatives);
            }
            return slots;
        }
        List<Object> values = sequence(raw);
        if (values.isEmpty()) values.add(raw);
        for (Object value : values) {
            if (value == null) continue;
            List<ItemStack> alternatives = stacks(value);
            if (!alternatives.isEmpty()) slots.add(alternatives);
        }
        return slots;
    }

    private List<Object> sequence(Object value) {
        List<Object> out = new ArrayList<Object>();
        if (value instanceof Iterable) {
            for (Object item : (Iterable<?>) value) out.add(item);
        } else if (value != null && value.getClass().isArray()) {
            for (int i = 0; i < Array.getLength(value); i++) out.add(Array.get(value, i));
        }
        return out;
    }

    private List<ItemStack> stacks(Object value) {
        List<ItemStack> out = new ArrayList<ItemStack>();
        if (value == null) return out;
        if (value instanceof ItemStack) {
            out.add(((ItemStack) value).func_77946_l());
        } else if (value instanceof Item) {
            out.add(new ItemStack((Item) value, 1, 0));
        } else if (value instanceof String) {
            String token = ((String) value).trim();
            List<ItemStack> found = token.startsWith("ore:")
                ? Items.resolve(token) : Items.resolve("ore:" + token);
            out.addAll(found);
        } else if (value.getClass().isArray() || value instanceof Iterable) {
            for (Object alternative : sequence(value)) out.addAll(stacks(alternative));
        } else {
            Object blockItem = Reflect.callStatic(Item.class, "getItemFromBlock", value);
            if (blockItem == null) blockItem = Reflect.callStatic(Item.class, "func_150898_a", value);
            if (blockItem instanceof Item) out.add(new ItemStack((Item) blockItem, 1, 0));
        }
        return out;
    }

    private boolean migrateRecipe(String source, String map, Object recipe,
                                  List<List<ItemStack>> inputs, List<ItemStack> outputs) {
        if (inputs.isEmpty()) {
            preserve(source, recipe, "input format is not representable");
            return false;
        }
        return migrate(source, map, inputs, outputs);
    }

    private boolean migrate(String source, String mapName, List<List<ItemStack>> inputChoices,
                            List<ItemStack> outputs) {
        if (inputChoices.isEmpty() || outputs.isEmpty()) {
            preserve(source, "unknown recipe", "missing input or output");
            return false;
        }
        if (expansionExceeded(inputChoices)) {
            preserve(source, "recipe with more than " + MAX_EXPANSION + " input alternatives",
                "input expansion cap");
            return false;
        }
        Recipe.RecipeMap map = Gt6.recipeMap(mapName);
        if (map == null) {
            rep.error(source + ": GT6 recipe map " + mapName + " is unavailable");
            return false;
        }
        List<ItemStack[]> combinations = combinations(inputChoices);
        if (combinations.isEmpty()) return false;
        List<Recipe> createdNow = new ArrayList<Recipe>();
        List<String> descriptions = new ArrayList<String>();
        Map<String, MigratedRecipe> replaced = new LinkedHashMap<String, MigratedRecipe>();
        List<String> createdKeys = new ArrayList<String>();
        for (ItemStack[] inputs : combinations) {
            ItemStack[] outputArray = outputs.toArray(new ItemStack[outputs.size()]);
            String key = key(mapName, inputs, outputArray);
            MigratedRecipe prior = MIGRATED.get(key);
            if (prior != null && map.mRecipeList.contains(prior.created)) {
                continue;
            }
            Recipe created = Gt6.addX(map, true, 16L, 32L, inputs, outputArray);
            if (created == null) {
                for (Recipe added : createdNow) map.mRecipeList.remove(added);
                for (String createdKey : createdKeys) {
                    MigratedRecipe old = replaced.get(createdKey);
                    if (old == null) MIGRATED.remove(createdKey);
                    else MIGRATED.put(createdKey, old);
                }
                rep.error(source + ": GT6 " + mapName + " rejected " + describe(inputs, outputArray));
                return false;
            }
            if (prior != null) replaced.put(key, prior);
            MIGRATED.put(key, new MigratedRecipe(mapName, inputs, outputArray, created));
            createdNow.add(created);
            descriptions.add(describe(inputs, outputArray));
            createdKeys.add(key);
        }
        for (int i = 0; i < createdNow.size(); i++) {
            rep.recipeAdded(mapName, "[space migration] " + descriptions.get(i));
            rep.count("spaceRecipes.migrated");
        }
        return !combinations.isEmpty();
    }

    private void replayMigratedRecipes() {
        for (Map.Entry<String, MigratedRecipe> entry : MIGRATED.entrySet()) {
            MigratedRecipe old = entry.getValue();
            Recipe.RecipeMap map = Gt6.recipeMap(old.map);
            if (map == null || (old.created != null && map.mRecipeList.contains(old.created))) continue;
            Recipe created = Gt6.addX(map, true, 16L, 32L, old.inputs, old.outputs);
            if (created == null) {
                rep.error("space recipe replay failed for GT6 " + old.map + ": "
                    + describe(old.inputs, old.outputs));
            } else {
                entry.setValue(new MigratedRecipe(old.map, old.inputs, old.outputs, created));
            }
        }
    }

    private List<ItemStack[]> combinations(List<List<ItemStack>> choices) {
        List<ItemStack[]> out = new ArrayList<ItemStack[]>();
        buildCombinations(choices, 0, new ArrayList<ItemStack>(), out);
        return out;
    }

    private void buildCombinations(List<List<ItemStack>> choices, int index, List<ItemStack> current,
                                   List<ItemStack[]> out) {
        if (out.size() >= MAX_EXPANSION) return;
        if (index == choices.size()) {
            out.add(current.toArray(new ItemStack[current.size()]));
            return;
        }
        for (ItemStack stack : choices.get(index)) {
            current.add(stack);
            buildCombinations(choices, index + 1, current, out);
            current.remove(current.size() - 1);
            if (out.size() >= MAX_EXPANSION) return;
        }
    }

    private String key(String map, ItemStack[] inputs, ItemStack[] outputs) {
        return map + "|" + signature(inputs) + "->" + signature(outputs);
    }

    private String signature(ItemStack[] stacks) {
        StringBuilder out = new StringBuilder();
        for (ItemStack stack : stacks) {
            if (out.length() > 0) out.append('+');
            out.append(Items.id(stack)).append('*').append(stack.field_77994_a);
        }
        return out.toString();
    }

    private String describe(ItemStack[] inputs, ItemStack[] outputs) {
        return signature(inputs) + " -> " + signature(outputs);
    }

    @SuppressWarnings("unchecked")
    private void rebuildCircuitFabricatorSlots(Class<?> type, Map<?, ?> recipes) {
        Object slotObj = Reflect.staticField(type, "slotValidItems");
        if (!(slotObj instanceof List)) {
            rep.error("Galacticraft Circuit Fabricator: slotValidItems is unavailable after recipe migration");
            return;
        }
        List<List<ItemStack>> rawSlots = (List<List<ItemStack>>) slotObj;
        rawSlots.clear();
        for (Object key : recipes.keySet()) {
            if (!(key instanceof ItemStack[])) continue;
            ItemStack[] inputs = (ItemStack[]) key;
            for (int i = 0; i < inputs.length; i++) {
                ItemStack stack = inputs[i];
                if (stack == null) continue;
                while (rawSlots.size() <= i) rawSlots.add(new ArrayList<ItemStack>());
                Object slot = rawSlots.get(i);
                if (!(slot instanceof List)) {
                    rep.error("Galacticraft Circuit Fabricator: invalid slotValidItems entry " + i);
                    return;
                }
                List<ItemStack> rawItems = (List<ItemStack>) slot;
                boolean exists = false;
                for (Object item : rawItems) {
                    if (item instanceof ItemStack
                        && Items.id((ItemStack) item).equals(Items.id(stack))
                        && ((ItemStack) item).field_77994_a == stack.field_77994_a) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) rawItems.add(stack.func_77946_l());
            }
        }
    }

    private boolean expansionExceeded(List<List<ItemStack>> choices) {
        long combinations = 1L;
        for (List<ItemStack> alternatives : choices) {
            combinations *= alternatives.size();
            if (combinations > MAX_EXPANSION) return true;
        }
        return false;
    }

    private void preserve(String source, Object recipe, String reason) {
        preserve(source, String.valueOf(recipe), reason);
    }

    private void preserve(String source, String recipe, String reason) {
        rep.note(source + ": kept source recipe (" + reason + "): " + recipe);
        rep.count("spaceRecipes.preserved");
    }

    private static final class MigratedRecipe {
        final String map;
        final ItemStack[] inputs;
        final ItemStack[] outputs;
        final Recipe created;

        MigratedRecipe(String map, ItemStack[] inputs, ItemStack[] outputs, Recipe created) {
            this.map = map;
            this.inputs = copy(inputs);
            this.outputs = copy(outputs);
            this.created = created;
        }

        private static ItemStack[] copy(ItemStack[] stacks) {
            ItemStack[] out = new ItemStack[stacks.length];
            for (int i = 0; i < stacks.length; i++) out[i] = stacks[i].func_77946_l();
            return out;
        }
    }
}
