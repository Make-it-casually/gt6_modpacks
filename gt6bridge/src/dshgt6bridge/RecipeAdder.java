package dshgt6bridge;

import java.util.ArrayList;
import java.util.List;

import gregapi.recipes.Recipe;
import net.minecraft.item.ItemStack;

/**
 * Pass 2: adds recipes to GT6 recipe maps from config/gt6bridge/recipes.csv.
 *
 * Every 'ore:' input token expands to one recipe per registered stack, so a single
 * line can cover all mods that register e.g. "ingotEnderium".
 */
public final class RecipeAdder {

    private final Cfg cfg;
    private final Report rep;
    private final java.util.Map<String, Integer> addedPerMap = new java.util.HashMap<String, Integer>();
    private final java.util.Map<String, Integer> afterSize = new java.util.HashMap<String, Integer>();
    private final java.util.Map<String, Recipe.RecipeMap> touched = new java.util.HashMap<String, Recipe.RecipeMap>();
    private final java.util.Map<Recipe, String> sentinels = new java.util.LinkedHashMap<Recipe, String>();

    private static final int MAX_EXPANSION = 64;
    private static final int MAX_SENTINELS = 200;

    public RecipeAdder(Cfg cfg, Report rep) {
        this.cfg = cfg;
        this.rep = rep;
    }

    public java.util.Map<String, Integer> addedPerMap() {
        return addedPerMap;
    }

    /** recipe map name -> size of that map right after our additions (used to detect rebuilds). */
    public java.util.Map<String, Integer> afterSize() {
        return afterSize;
    }

    /** a few of the recipes we created, so a world load can detect a recipe map rebuild. */
    public java.util.Map<Recipe, String> sentinels() {
        return sentinels;
    }

    public void run() {
        for (String[] row : cfg.read(Cfg.FILE_RECIPES, Cfg.HEADER_RECIPES)) {
            if (row.length < 3) continue;
            String mapName = row[0].trim();
            String inCell = row[1].trim();
            String outCell = row[2].trim();
            if (mapName.isEmpty() || mapName.startsWith("<")) continue;

            long eut = 16L;
            long duration = 16L;
            boolean optimize = true;
            if (row.length > 3 && !row[3].trim().isEmpty()) eut = parseLong(row[3], 16L);
            if (row.length > 4 && !row[4].trim().isEmpty()) duration = parseLong(row[4], 16L);
            if (row.length > 5 && !row[5].trim().isEmpty()) optimize = Boolean.parseBoolean(row[5].trim());
            String note = row.length > 6 ? row[6].trim() : "";

            Recipe.RecipeMap map = Gt6.recipeMap(mapName);
            if (map == null) {
                rep.error("unknown GT6 recipe map in recipes.csv: " + mapName
                    + " (see report for the list of valid names)");
                continue;
            }
            touched.put(mapName, map);

            List<List<ItemStack>> inputChoices = new ArrayList<List<ItemStack>>();
            boolean bad = false;
            for (String token : Items.tokens(inCell)) {
                List<ItemStack> resolved = Items.resolve(token);
                if (resolved.isEmpty()) {
                    rep.error("unresolved input token '" + token + "' for map " + mapName);
                    bad = true;
                    break;
                }
                inputChoices.add(resolved);
            }
            if (bad || inputChoices.isEmpty()) continue;

            List<ItemStack> outputs = new ArrayList<ItemStack>();
            List<Long> chances = new ArrayList<Long>();
            boolean chanceGiven = false;
            for (String token : Items.tokens(outCell)) {
                long chance = Items.chanceOf(token, 10000L);
                if (chance != 10000L) chanceGiven = true;
                chances.add(Long.valueOf(chance));
                List<ItemStack> resolved = Items.resolve(Items.withoutChance(token));
                if (resolved.isEmpty()) {
                    rep.error("unresolved output token '" + token + "' for map " + mapName);
                    bad = true;
                    break;
                }
                outputs.add(resolved.get(0));
            }
            if (bad || outputs.isEmpty()) continue;

            List<ItemStack[]> combos = combinations(inputChoices, MAX_EXPANSION);
            if (combos.isEmpty()) continue;
            if (combos.size() == MAX_EXPANSION) {
                rep.note("input expansion for '" + inCell + "' capped at " + MAX_EXPANSION + " recipes");
            }

            long[] chanceArray = null;
            if (chanceGiven) {
                chanceArray = new long[chances.size()];
                for (int i = 0; i < chances.size(); i++) chanceArray[i] = chances.get(i).longValue();
            }

            int added = 0;
            for (ItemStack[] inputs : combos) {
                ItemStack[] outs = outputs.toArray(new ItemStack[outputs.size()]);
                Recipe created = chanceArray == null
                    ? Gt6.addX(map, optimize, eut, duration, inputs, outs)
                    : Gt6.addXChances(map, optimize, eut, duration, chanceArray, inputs, outs);
                if (created != null) {
                    added++;
                    if (sentinels.size() < MAX_SENTINELS) sentinels.put(created, mapName);
                    rep.recipeAdded(mapName, join(inputs) + " -> " + join(outs)
                        + (chanceGiven ? "  chances " + chanceArray[0] + "/10000" : "")
                        + "  [" + duration + "t, " + eut + "EU/t]" + (note.isEmpty() ? "" : "  # " + note));
                } else {
                    rep.error("addRecipe failed on map " + mapName + ": " + join(inputs) + " -> " + join(outs));
                }
            }
            Integer old = addedPerMap.get(mapName);
            addedPerMap.put(mapName, Integer.valueOf((old == null ? 0 : old.intValue()) + added));
        }

        try {
            for (java.util.Map.Entry<String, Recipe.RecipeMap> e : touched.entrySet()) {
                afterSize.put(e.getKey(), Integer.valueOf(e.getValue().mRecipeList.size()));
            }
        } catch (Throwable t) {
            // size tracking is only used to detect recipe-map rebuilds
        }

        // recipes requested by CraftTweaker scripts (queued during PostInit)
        for (BridgeQueue.RecipeRequest req : BridgeQueue.drainRecipes()) {
            Recipe.RecipeMap map = Gt6.recipeMap(req.map);
            if (map == null) {
                rep.error("script recipe: unknown GT6 recipe map '" + req.map + "'");
                continue;
            }
            touched.put(req.map, map);
            Recipe created = Gt6.addX(map, true, req.eut <= 0 ? 16 : req.eut,
                req.duration <= 0 ? 32 : req.duration, req.inputs, req.outputs);
            if (created != null) {
                if (sentinels.size() < MAX_SENTINELS) sentinels.put(created, req.map);
                rep.recipeAdded(req.map, "[script] " + join(req.inputs) + " -> " + join(req.outputs)
                    + "  [" + (req.duration <= 0 ? 32 : req.duration) + "t, "
                    + (req.eut <= 0 ? 16 : req.eut) + "EU/t]");
            } else {
                rep.error("script recipe failed on map " + req.map + ": " + join(req.inputs)
                    + " -> " + join(req.outputs));
            }
        }
    }

    private static long parseLong(String s, long def) {
        try {
            return Long.parseLong(s.trim());
        } catch (Throwable t) {
            return def;
        }
    }

    private static String join(ItemStack[] stacks) {
        StringBuilder sb = new StringBuilder();
        for (ItemStack s : stacks) {
            if (sb.length() > 0) sb.append(" + ");
            sb.append(Items.id(s));
        }
        return sb.toString();
    }

    private static List<ItemStack[]> combinations(List<List<ItemStack>> choices, int cap) {
        List<ItemStack[]> out = new ArrayList<ItemStack[]>();
        build(choices, 0, new ArrayList<ItemStack>(), out, cap);
        return out;
    }

    private static void build(List<List<ItemStack>> choices, int index, List<ItemStack> current,
                              List<ItemStack[]> out, int cap) {
        if (out.size() >= cap) return;
        if (index >= choices.size()) {
            out.add(current.toArray(new ItemStack[current.size()]));
            return;
        }
        for (ItemStack s : choices.get(index)) {
            if (s == null) continue;
            current.add(s);
            build(choices, index + 1, current, out, cap);
            current.remove(current.size() - 1);
            if (out.size() >= cap) return;
        }
    }
}
