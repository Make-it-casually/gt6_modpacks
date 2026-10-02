package dshgt6bridge;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import net.minecraft.item.ItemStack;
import net.minecraft.item.crafting.CraftingManager;
import net.minecraft.item.crafting.FurnaceRecipes;
import net.minecraft.item.crafting.IRecipe;

/**
 * Pass 3: deletes other mods' recipes from config/gt6bridge/removals.csv.
 *
 * Backends are reflective (gt6bridge is compiled without those mods), so a missing mod or
 * a renamed method only shows up as an entry in the report instead of an error screen.
 * All removal targets and accessors were verified with javap against the jars in this
 * instance; see tools/research/othermods-recipes.md.
 */
public final class RecipeRemover {

    public interface Backend {
        String name();
        /** Removes every recipe whose result matches the selector; returns how many were removed. */
        int remove(String target, String selector, Report rep);
    }

    private final Cfg cfg;
    private final Settings settings;
    private final Report rep;
    private final Map<String, Backend> backends = new java.util.LinkedHashMap<String, Backend>();

    /** when true the backends only count and report what they would delete. */
    private static boolean dryRun = true;

    public RecipeRemover(Cfg cfg, Settings settings, Report rep) {
        this.cfg = cfg;
        this.settings = settings;
        this.rep = rep;
        dryRun = settings.getBool("removalDryRun");
        register(new CraftingBackend());
        register(new FurnaceBackend());

        // ---- Thermal Expansion / CoFH: real removeRecipe(ItemStack[, ItemStack]) APIs
        registerStackApi("te_pulverizer", "cofh.thermalexpansion.util.crafting.PulverizerManager", 1);
        registerStackApi("te_furnace", "cofh.thermalexpansion.util.crafting.FurnaceManager", 1);
        registerStackApi("te_sawmill", "cofh.thermalexpansion.util.crafting.SawmillManager", 1);
        registerStackApi("te_crucible", "cofh.thermalexpansion.util.crafting.CrucibleManager", 1);
        registerStackApi("te_charger", "cofh.thermalexpansion.util.crafting.ChargerManager", 1);
        registerStackApi("te_smelter", "cofh.thermalexpansion.util.crafting.SmelterManager", 2);
        registerStackApi("te_insolator", "cofh.thermalexpansion.util.crafting.InsolatorManager", 2);
        // TE managers without a remove API: mutate their private recipe maps
        register(new PrivateMapBackend("te_precipitator",
            "cofh.thermalexpansion.util.crafting.PrecipitatorManager", "recipeMap"));
        register(new PrivateMapBackend("te_extruder",
            "cofh.thermalexpansion.util.crafting.ExtruderManager", "recipeMap"));
        register(new PrivateMapBackend("te_transposer_fill",
            "cofh.thermalexpansion.util.crafting.TransposerManager", "recipeMapFill"));
        register(new PrivateMapBackend("te_transposer_extraction",
            "cofh.thermalexpansion.util.crafting.TransposerManager", "recipeMapExtraction"));

        // ---- Galacticraft
        registerStackApi("galacticraft_compressor",
            "micdoodle8.mods.galacticraft.api.recipe.CompressorRecipes", 1);
        registerStackApi("galacticraft_circuitfabricator",
            "micdoodle8.mods.galacticraft.api.recipe.CircuitFabricatorRecipes", 1);

        // ---- IC2 (cache aware iterator over Recipes.<machine>.getRecipes())
        register(new Ic2Backend());
        // ---- Actually Additions crusher
        register(new ActuallyAdditionsBackend());
        // ---- Applied Energistics 2 inscriber
        register(new Ae2InscriberBackend());
        // ---- Railcraft (live ArrayLists)
        register(new ListBackend("railcraft_rockcrusher",
            "mods.railcraft.common.util.crafting.RockCrusherCraftingManager", "getInstance", "getRecipes", null));
        register(new ListBackend("railcraft_cokeoven",
            "mods.railcraft.common.util.crafting.CokeOvenCraftingManager", "getInstance", "getRecipes", null));
        register(new ListBackend("railcraft_blastfurnace",
            "mods.railcraft.common.util.crafting.BlastFurnaceCraftingManager", "getInstance", "getRecipes", null));
        register(new ListBackend("railcraft_rolling",
            "mods.railcraft.common.util.crafting.RollingMachineCraftingManager", "getInstance", "getRecipeList", null));
        // ---- EnderIO (manager list + the registry map the machines really query)
        register(new ListBackend("enderio_sagmill",
            "crazypants.enderio.machine.crusher.CrusherRecipeManager", "getInstance", "getRecipes", "blockSagMill"));
        register(new ListBackend("enderio_alloy",
            "crazypants.enderio.machine.alloy.AlloyRecipeManager", "getInstance", "getRecipes", "blockAlloySmelter"));
        register(new ListBackend("enderio_slicensplice",
            "crazypants.enderio.machine.slicensplice.SliceAndSpliceRecipeManager", "getInstance", "getRecipes", "blockSliceAndSplice"));
        register(new ListBackend("enderio_vat",
            "crazypants.enderio.machine.vat.VatRecipeManager", "getInstance", "getRecipes", "blockVat"));
        register(new RegistryOnlyBackend("enderio_soulbinder",
            "crazypants.enderio.machine.MachineRecipeRegistry", "blockSoulBinder"));
        register(new AdvancedRocketryBackend());
    }

    public void register(Backend b) {
        backends.put(b.name().toLowerCase(), b);
    }

    private void registerStackApi(String name, final String className, final int arity) {
        register(new StackApiBackend(name, className, arity));
    }

    public java.util.Set<String> backendNames() {
        return backends.keySet();
    }

    static boolean isDryRun() {
        return dryRun;
    }

    /** reports a would-be removal without touching the recipe. */
    static void reportDryRun(Report rep, String backend, String description) {
        rep.recipeRemoved(backend, "would remove " + description);
    }

    public void run() {
        for (String[] row : cfg.read(Cfg.FILE_REMOVALS, Cfg.HEADER_REMOVALS)) {
            if (row.length < 2) continue;
            String target = row[0].trim().toLowerCase();
            String selector = row[1].trim();
            if (target.isEmpty() || target.startsWith("<")) continue;
            applyOne(target, selector, rep);
        }

        // requests queued by CraftTweaker scripts: an explicit script call is an explicit
        // instruction, so these are applied for real even when removals.csv runs in dry mode
        boolean wasDry = dryRun;
        dryRun = false;
        try {
            for (BridgeQueue.RemovalRequest req : BridgeQueue.drainRemovals()) {
                int n = applyOne(req.target.toLowerCase(), req.selector, rep);
                rep.note("script removal [" + req.target + "] '" + req.selector + "' matched " + n
                    + " recipe(s)");
            }
        } finally {
            dryRun = wasDry;
        }
    }

    /** removes - or just counts, in dry run - everything a single target/selector pair matches. */
    private int applyOne(String target, String selector, Report rep) {
        Backend b = backends.get(target);
        if (b == null && target.startsWith("ic2_")) b = backends.get("ic2");
        if (b == null) {
            rep.error("unknown removal backend '" + target + "' (known: " + backendNames() + ")");
            return 0;
        }
        try {
            if (!Reflect.present(classNameOf(target)) && !target.startsWith("crafting")
                && !target.startsWith("furnace")) {
                rep.note("removals: backend '" + target + "' - mod not installed, skipped");
                return 0;
            }
            int n = b.remove(target, selector, rep);
            rep.count("removed.total", n);
            if (n == 0) rep.note("removals: [" + target + "] '" + selector + "' matched nothing");
            return n;
        } catch (Throwable t) {
            rep.error("removal backend " + target + " failed on '" + selector + "': " + t);
            return 0;
        }
    }

    /**
     * Counts what a target/selector pair would remove without changing anything - used by the
     * CraftTweaker {@code Bridge.countRemovable(...)} helper.
     */
    public static synchronized int countMatches(String target, String selector) {
        if (target == null || selector == null) return -1;
        Cfg cfg = new Cfg();
        Report rep = new Report();
        RecipeRemover r = new RecipeRemover(cfg, new Settings(cfg), rep);
        boolean old = dryRun;
        dryRun = true;
        try {
            return r.applyOne(target.trim().toLowerCase(), selector.trim(), rep);
        } finally {
            dryRun = old;
        }
    }

    /** best effort detection of the class a backend needs, to skip cleanly when the mod is absent. */
    private static String classNameOf(String target) {
        if ("te_pulverizer".equals(target)) return "cofh.thermalexpansion.util.crafting.PulverizerManager";
        if ("te_furnace".equals(target)) return "cofh.thermalexpansion.util.crafting.FurnaceManager";
        if ("te_sawmill".equals(target)) return "cofh.thermalexpansion.util.crafting.SawmillManager";
        if ("te_crucible".equals(target)) return "cofh.thermalexpansion.util.crafting.CrucibleManager";
        if ("te_charger".equals(target)) return "cofh.thermalexpansion.util.crafting.ChargerManager";
        if ("te_smelter".equals(target)) return "cofh.thermalexpansion.util.crafting.SmelterManager";
        if ("te_insolator".equals(target)) return "cofh.thermalexpansion.util.crafting.InsolatorManager";
        if ("te_precipitator".equals(target)) return "cofh.thermalexpansion.util.crafting.PrecipitatorManager";
        if ("te_extruder".equals(target)) return "cofh.thermalexpansion.util.crafting.ExtruderManager";
        if (target.startsWith("te_transposer_")) return "cofh.thermalexpansion.util.crafting.TransposerManager";
        if (target.startsWith("ic2_")) return "ic2.api.recipe.Recipes";
        if (target.startsWith("ae2_")) return "appeng.api.AEApi";
        if (target.startsWith("actuallyadditions")) return "de.ellpeck.actuallyadditions.api.ActuallyAdditionsAPI";
        if (target.startsWith("railcraft_")) return "mods.railcraft.common.util.crafting.RockCrusherCraftingManager";
        if (target.startsWith("enderio_")) return "crazypants.enderio.machine.MachineRecipeRegistry";
        if (target.startsWith("galacticraft_")) return "micdoodle8.mods.galacticraft.api.recipe.CompressorRecipes";
        if (target.startsWith("advancedrocketry_")) return "zmaster587.advancedRocketry.AdvancedRocketry";
        return "";
    }

    // ---------------------------------------------------------------- helpers

    /** collects the item stacks a recipe produces, whatever shape the mod stores them in. */
    static List<ItemStack> outputsOf(Object recipe) {
        List<ItemStack> out = new ArrayList<ItemStack>();
        flatten(Reflect.pick(recipe, "getOutputs", "getRecipeOutputOnes", "getRecipeOutput", "getOutput",
            "getResult", "getOutputsList", "getPrimaryOutput"), out);
        flatten(Reflect.pick(recipe, "getSecondaryOutput", "getRecipeOutputTwos", "getSecondaryOutputs"), out);
        return out;
    }

    static void flatten(Object o, List<ItemStack> out) {
        if (o == null) return;
        if (o instanceof ItemStack) {
            out.add((ItemStack) o);
            return;
        }
        if (o instanceof Object[]) {
            for (Object e : (Object[]) o) flatten(e, out);
            return;
        }
        if (o instanceof Iterable) {
            for (Object e : (Iterable<?>) o) flatten(e, out);
            return;
        }
        // wrapper objects (RecipeOutput, ResultStack, IGrinderEntry, ...)
        Object inner = Reflect.pick(o, "getOutput", "getItem", "getStack", "item", "output");
        if (inner != null && inner != o) flatten(inner, out);
    }

    static boolean matchesAny(String selector, List<ItemStack> stacks) {
        for (ItemStack s : stacks) if (Items.matches(selector, s)) return true;
        return false;
    }

    private static boolean matchesAll(String selector) {
        return selector != null && "*:*".equals(selector.trim());
    }

    // ---------------------------------------------------------------- backends

    private static final class CraftingBackend implements Backend {
        @Override
        public String name() {
            return "crafting";
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            if (!LinkCheck.ok("vanilla.crafting")) {
                rep.error("crafting removal skipped: link check failed");
                return 0;
            }
            CraftingManager cm = CraftingManager.func_77594_a(); // MCP: getInstance()
            if (cm == null) return 0;
            List<IRecipe> list = cm.func_77592_b(); // MCP: getRecipeList()
            if (list == null) return 0;
            List<IRecipe> victims = new ArrayList<IRecipe>();
            for (IRecipe r : list) {
                if (r == null) continue;
                ItemStack out;
                try {
                    out = r.func_77571_b(); // MCP: getRecipeOutput()
                } catch (Throwable t) {
                    continue;
                }
                if (Items.matches(selector, out)) victims.add(r);
            }
            for (IRecipe r : victims) {
                String desc = "crafting recipe producing " + Items.id(r.func_77571_b());
                if (isDryRun()) {
                    reportDryRun(rep, "crafting", desc);
                } else {
                    list.remove(r);
                    rep.recipeRemoved("crafting", desc);
                }
            }
            return victims.size();
        }
    }

    private static final class FurnaceBackend implements Backend {
        @Override
        public String name() {
            return "furnace";
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            if (!LinkCheck.ok("vanilla.furnace")) {
                rep.error("furnace removal skipped: link check failed");
                return 0;
            }
            FurnaceRecipes fr = FurnaceRecipes.func_77602_a(); // MCP: smelting()
            if (fr == null) return 0;
            Map<ItemStack, ItemStack> map = fr.func_77599_b(); // MCP: getSmeltingList()
            if (map == null) return 0;
            List<ItemStack> victims = new ArrayList<ItemStack>();
            for (Map.Entry<ItemStack, ItemStack> e : map.entrySet()) {
                if (Items.matches(selector, e.getValue()) || Items.matches(selector, e.getKey())) victims.add(e.getKey());
            }
            for (ItemStack in : victims) {
                if (isDryRun()) {
                    reportDryRun(rep, "furnace", Items.id(in) + " -> " + Items.id(map.get(in)));
                } else {
                    ItemStack out = map.remove(in);
                    rep.recipeRemoved("furnace", Items.id(in) + " -> " + Items.id(out));
                }
            }
            return victims.size();
        }
    }

    /** mods exposing removeRecipe(ItemStack) / removeRecipe(ItemStack, ItemStack). */
    private static final class StackApiBackend implements Backend {
        private final String name;
        private final String className;
        private final int arity;

        StackApiBackend(String name, String className, int arity) {
            this.name = name;
            this.className = className;
            this.arity = arity;
        }

        @Override
        public String name() {
            return name;
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Class<?> c = Reflect.cls(className);
            if (c == null) return 0;
            if (matchesAll(selector)) {
                int removed = clearAllMap(c, "recipeMap", name, rep);
                if (removed >= 0 && !isDryRun()
                    && ("cofh.thermalexpansion.util.crafting.SmelterManager".equals(className)
                        || "cofh.thermalexpansion.util.crafting.InsolatorManager".equals(className))) {
                    clearThermalInputSets(c, rep);
                }
                return Math.max(removed, 0);
            }
            if (className.startsWith("cofh.thermalexpansion.")) {
                return removeThermalOutputs(c, target, selector, rep);
            }
            if (isDryRun()) {
                // count from the (fresh) recipe array without calling the removing API
                Object listObj = Reflect.callStatic(c, "getRecipeList");
                if (listObj instanceof Object[]) {
                    int matches = 0;
                    for (Object recipe : (Object[]) listObj) {
                        if (matchesAny(selector, outputsOf(recipe))) {
                            matches++;
                            reportDryRun(rep, name, String.valueOf(Reflect.pick(recipe, "getPrimaryOutput", "getOutput")));
                        }
                    }
                    return matches;
                }
                rep.note(name + ": dry run not available (no getRecipeList), "
                    + Items.candidates(selector).size() + " candidate stack(s) would be tried");
                return 0;
            }
            Method m = Reflect.method(c, "removeRecipe", new Object[arity]);
            if (m == null) {
                rep.error(name + ": " + className + " has no removeRecipe/" + arity);
                return 0;
            }
            int removed = 0;
            for (ItemStack candidate : Items.candidates(selector)) {
                Object result = arity == 1 ? Reflect.callStatic(c, "removeRecipe", candidate)
                    : Reflect.callStatic(c, "removeRecipe", candidate, candidate);
                boolean ok;
                if (result instanceof Boolean) ok = ((Boolean) result).booleanValue();
                else ok = m.getReturnType() == Void.TYPE && result == null;
                if (ok) {
                    removed++;
                    rep.recipeRemoved(name, Items.id(candidate));
                }
            }
            return removed;
        }
    }

    private static int removeThermalOutputs(Class<?> managerClass, String target, String selector, Report rep) {
        Object mapObj = Reflect.staticField(managerClass, "recipeMap");
        if (!(mapObj instanceof Map)) {
            rep.error(target + ": " + managerClass.getName() + ".recipeMap is not a Map");
            return 0;
        }
        Map<?, ?> map = (Map<?, ?>) mapObj;
        List<Object> keys = new ArrayList<Object>();
        List<Object> descriptions = new ArrayList<Object>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (!matchesAny(selector, outputsOf(entry.getValue()))) continue;
            keys.add(entry.getKey());
            descriptions.add(String.valueOf(Reflect.pick(entry.getValue(),
                "getPrimaryOutput", "getOutput", "getRecipeOutput")));
        }
        int removed = 0;
        for (int i = 0; i < keys.size(); i++) {
            if (isDryRun()) {
                reportDryRun(rep, target, String.valueOf(descriptions.get(i)));
                removed++;
            } else if (map.remove(keys.get(i)) != null) {
                rep.recipeRemoved(target, String.valueOf(descriptions.get(i)));
                removed++;
            }
        }
        if (!isDryRun() && removed > 0
            && ("te_smelter".equals(target) || "te_insolator".equals(target))) {
            removeThermalValidationEntries(managerClass, keys);
        }
        return removed;
    }

    private static void removeThermalValidationEntries(Class<?> managerClass, List<Object> recipeKeys) {
        for (String fieldName : new String[] { "validationSet", "lockSet" }) {
            Object setObj = Reflect.staticField(managerClass, fieldName);
            if (!(setObj instanceof Collection)) continue;
            Collection<?> values = (Collection<?>) setObj;
            for (Object key : recipeKeys) {
                if (key instanceof Iterable) {
                    for (Object value : (Iterable<?>) key) values.remove(value);
                } else {
                    values.remove(key);
                }
            }
        }
    }

    /** IC2: iterate the cache aware map view returned by Recipes.<machine>.getRecipes(). */
    private static final class Ic2Backend implements Backend {
        @Override
        public String name() {
            return "ic2";
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            String machine = target.startsWith("ic2_") ? target.substring(4) : target;
            Class<?> recipes = Reflect.cls("ic2.api.recipe.Recipes");
            if (recipes == null) return 0;
            Object manager = null;
            for (Field field : recipes.getFields()) {
                if (field.getName().equalsIgnoreCase(machine)) {
                    machine = field.getName();
                    manager = Reflect.staticField(recipes, machine);
                    break;
                }
            }
            if (manager == null) {
                rep.error("IC2: no Recipes." + machine);
                return 0;
            }
            Object mapObj = Reflect.call(manager, "getRecipes");
            if (!(mapObj instanceof Map)) {
                rep.error("IC2: Recipes." + machine + ".getRecipes() did not return a Map");
                return 0;
            }
            Map<?, ?> map = (Map<?, ?>) mapObj;
            int removed = 0;
            try {
                Iterator<?> it = map.entrySet().iterator();
                while (it.hasNext()) {
                    Map.Entry<?, ?> e = (Map.Entry<?, ?>) it.next();
                    List<ItemStack> outs = new ArrayList<ItemStack>();
                    flatten(Reflect.pick(e.getValue(), "getItems", "items"), outs);
                    if (matchesAny(selector, outs)) {
                        if (isDryRun()) {
                            reportDryRun(rep, "ic2_" + machine, join(outs));
                        } else {
                            it.remove();
                            rep.recipeRemoved("ic2_" + machine, join(outs));
                        }
                        removed++;
                    }
                }
            } catch (Throwable t) {
                rep.error("IC2 " + machine + " iteration failed: " + t);
            }
            return removed;
        }
    }

    private static final class ActuallyAdditionsBackend implements Backend {
        @Override
        public String name() {
            return "actuallyadditions_crusher";
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Class<?> api = Reflect.cls("de.ellpeck.actuallyadditions.api.ActuallyAdditionsAPI");
            if (api == null) api = Reflect.cls("de.ellpeck.actuallyadditions.mod.recipe.CrusherRecipeRegistry");
            Object listObj = Reflect.staticField(api, "crusherRecipes");
            if (!(listObj instanceof List)) {
                rep.error("ActuallyAdditions: crusherRecipes list not found");
                return 0;
            }
            List<?> list = (List<?>) listObj;
            int removed = 0;
            Iterator<?> it = list.iterator();
            while (it.hasNext()) {
                Object recipe = it.next();
                List<ItemStack> outs = new ArrayList<ItemStack>();
                flatten(Reflect.pick(recipe, "getRecipeOutputOnes", "getOutputOne"), outs);
                flatten(Reflect.pick(recipe, "getRecipeOutputTwos", "getOutputTwo"), outs);
                if (matchesAny(selector, outs)) {
                    if (isDryRun()) {
                        reportDryRun(rep, "actuallyadditions_crusher", join(outs));
                    } else {
                        it.remove();
                        rep.recipeRemoved("actuallyadditions_crusher", join(outs));
                    }
                    removed++;
                }
            }
            if (removed > 0 && !isDryRun()) {
                Class<?> reg = Reflect.cls("de.ellpeck.actuallyadditions.mod.recipe.CrusherRecipeRegistry");
                Reflect.callStatic(reg, "registerFinally");
                rep.note("ActuallyAdditions: rebuilt crusher NEI index (registerFinally)");
            }
            return removed;
        }
    }

    private static final class Ae2InscriberBackend implements Backend {
        @Override
        public String name() {
            return "ae2_inscriber";
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Object aea = Reflect.callStatic(Reflect.cls("appeng.api.AEApi"), "instance");
            Object registries = Reflect.call(aea, "registries");
            Object inscriber = Reflect.call(registries, "inscriber");
            Object collection = Reflect.call(inscriber, "getRecipes");
            if (!(collection instanceof Collection)) {
                rep.error("AE2: inscriber registry not reachable");
                return 0;
            }
            List<Object> victims = new ArrayList<Object>();
            for (Object recipe : (Collection<?>) collection) {
                List<ItemStack> outs = new ArrayList<ItemStack>();
                flatten(Reflect.pick(recipe, "getOutputs", "getOutput", "getOutputsList"), outs);
                if (matchesAny(selector, outs)) victims.add(recipe);
            }
            int removed = 0;
            for (Object v : victims) {
                if (isDryRun()) {
                    reportDryRun(rep, "ae2_inscriber", String.valueOf(Reflect.call(v, "getOutput")));
                } else {
                    Reflect.call(inscriber, "removeRecipe", v);
                    rep.recipeRemoved("ae2_inscriber", String.valueOf(Reflect.call(v, "getOutput")));
                }
                removed++;
            }
            return removed;
        }
    }

    /**
     * Mods whose recipe manager exposes a live java.util.List: Railcraft and the EnderIO
     * managers. When a registry key is given, matching recipes are also removed from
     * MachineRecipeRegistry (the map the machines actually query) by their UID.
     */
    private static final class ListBackend implements Backend {
        private final String name;
        private final String holderClass;
        private final String instanceAccessor;
        private final String listAccessor;
        private final String registryKey;

        ListBackend(String name, String holderClass, String instanceAccessor, String listAccessor, String registryKey) {
            this.name = name;
            this.holderClass = holderClass;
            this.instanceAccessor = instanceAccessor;
            this.listAccessor = listAccessor;
            this.registryKey = registryKey;
        }

        @Override
        public String name() {
            return name;
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Class<?> holder = Reflect.cls(holderClass);
            if (holder == null) return 0;
            Object instance = Reflect.callStatic(holder, instanceAccessor);
            if (instance == null) {
                rep.error(name + ": " + holderClass + "." + instanceAccessor + "() returned null");
                return 0;
            }
            Object listObj = Reflect.call(instance, listAccessor);
            if (!(listObj instanceof List)) {
                rep.error(name + ": " + listAccessor + "() did not return a List");
                return 0;
            }
            List<?> list = (List<?>) listObj;
            List<Object> victims = new ArrayList<Object>();
            for (Object recipe : list) {
                if (matchesAny(selector, outputsOf(recipe))) victims.add(recipe);
            }
            int removed = 0;
            for (Object v : victims) {
                String desc = String.valueOf(Reflect.pick(v, "getUid", "getRecipeOutput", "getOutput"));
                if (isDryRun()) {
                    reportDryRun(rep, name, desc);
                    removed++;
                } else if (list.remove(v)) {
                    removed++;
                    rep.recipeRemoved(name, desc);
                }
            }
            if (registryKey != null && removed > 0 && !isDryRun()) {
                Class<?> registry = Reflect.cls("crazypants.enderio.machine.MachineRecipeRegistry");
                Object regInstance = Reflect.staticField(registry, "instance");
                Object map = Reflect.call(regInstance, "getRecipesForMachine", registryKey);
                int regRemoved = 0;
                for (Object v : victims) {
                    Object uid = Reflect.call(v, "getUid");
                    if (uid != null && Reflect.call(map, "remove", uid) != null) regRemoved++;
                }
                rep.note(name + ": also removed " + regRemoved + " entr(y/ies) from MachineRecipeRegistry["
                    + registryKey + "]");
            }
            return removed;
        }
    }

    /**
     * Mods whose recipes live in a private Map without any removal API (Thermal Expansion's
     * Precipitator and Extruder): read the field reflectively and drop the matching entries.
     */
    private static final class PrivateMapBackend implements Backend {
        private final String name;
        private final String className;
        private final String fieldName;

        PrivateMapBackend(String name, String className, String fieldName) {
            this.name = name;
            this.className = className;
            this.fieldName = fieldName;
        }

        @Override
        public String name() {
            return name;
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Class<?> c = Reflect.cls(className);
            if (c == null) return 0;
            Object mapObj = Reflect.staticField(c, fieldName);
            if (!(mapObj instanceof Map)) {
                rep.error(name + ": " + className + "." + fieldName + " is not a Map");
                return 0;
            }
            Map<?, ?> map = (Map<?, ?>) mapObj;
            if (matchesAll(selector)) return clearAllMap(c, fieldName, name, rep);
            List<Object> keys = new ArrayList<Object>();
            for (Map.Entry<?, ?> e : map.entrySet()) {
                if (matchesAny(selector, outputsOf(e.getValue()))) keys.add(e.getKey());
            }
            int removed = 0;
            for (Object k : keys) {
                String desc = String.valueOf(k);
                if (isDryRun()) {
                    reportDryRun(rep, name, desc);
                    removed++;
                } else if (map.remove(k) != null) {
                    removed++;
                    rep.recipeRemoved(name, desc);
                }
            }
            return removed;
        }
    }

    private static int clearAllMap(Class<?> managerClass, String fieldName, String backend, Report rep) {
        Object mapObj = Reflect.staticField(managerClass, fieldName);
        if (!(mapObj instanceof Map)) {
            rep.error(backend + ": " + managerClass.getName() + "." + fieldName + " is not a Map");
            return -1;
        }
        Map<?, ?> map = (Map<?, ?>) mapObj;
        List<Object> keys = new ArrayList<Object>(map.keySet());
        for (Object key : keys) {
            if (isDryRun()) {
                reportDryRun(rep, backend, String.valueOf(key));
            } else {
                rep.recipeRemoved(backend, String.valueOf(key));
            }
        }
        if (!isDryRun()) map.clear();
        return keys.size();
    }

    private static void clearThermalInputSets(Class<?> managerClass, Report rep) {
        for (String fieldName : new String[] { "validationSet", "lockSet" }) {
            Object setObj = Reflect.staticField(managerClass, fieldName);
            if (!(setObj instanceof Collection)) {
                rep.error(managerClass.getName() + "." + fieldName + " is not a Collection");
                continue;
            }
            ((Collection<?>) setObj).clear();
        }
    }

    /** Advanced Rocketry recipes are keyed by machine class in LibVulpes' shared registry. */
    private static final class AdvancedRocketryBackend implements Backend {
        @Override
        public String name() {
            return "advancedrocketry_machines";
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Class<?> recipesClass = Reflect.cls("zmaster587.libVulpes.recipe.RecipesMachine");
            Object recipes = Reflect.callStatic(recipesClass, "getInstance");
            if (recipes == null) {
                rep.error(name() + ": LibVulpes RecipesMachine is unavailable");
                return 0;
            }
            Object recipeMapObj = Reflect.field(recipes, "recipeList");
            if (!(recipeMapObj instanceof Map)) {
                rep.error(name() + ": LibVulpes RecipesMachine.recipeList is unavailable");
                return 0;
            }

            int removed = 0;
            for (Map.Entry<?, ?> entry : ((Map<?, ?>) recipeMapObj).entrySet()) {
                Object machine = entry.getKey();
                if (!(machine instanceof Class)
                    || !((Class<?>) machine).getName().startsWith("zmaster587.advancedRocketry.")) continue;
                if (!(entry.getValue() instanceof List)) continue;
                List<?> machineRecipes = (List<?>) entry.getValue();
                Iterator<?> iterator = machineRecipes.iterator();
                while (iterator.hasNext()) {
                    Object recipe = iterator.next();
                    List<ItemStack> outputs = outputsOf(recipe);
                    if (!matchesAll(selector) && !matchesAny(selector, outputs)) continue;
                    if (isDryRun()) {
                        reportDryRun(rep, name(), String.valueOf(outputs));
                    } else {
                        iterator.remove();
                        rep.recipeRemoved(name(), String.valueOf(outputs));
                    }
                    removed++;
                }
            }
            return removed;
        }
    }

    /** EnderIO soul binder: recipes live only in MachineRecipeRegistry. */    private static final class RegistryOnlyBackend implements Backend {
        private final String name;
        private final String registryClass;
        private final String registryKey;

        RegistryOnlyBackend(String name, String registryClass, String registryKey) {
            this.name = name;
            this.registryClass = registryClass;
            this.registryKey = registryKey;
        }

        @Override
        public String name() {
            return name;
        }

        @Override
        public int remove(String target, String selector, Report rep) {
            Object instance = Reflect.staticField(Reflect.cls(registryClass), "instance");
            Object map = Reflect.call(instance, "getRecipesForMachine", registryKey);
            if (!(map instanceof Map)) {
                rep.error(name + ": registry map not reachable");
                return 0;
            }
            int removed = 0;
            for (Object value : new ArrayList<Object>(((Map<?, ?>) map).values())) {
                List<ItemStack> outs = new ArrayList<ItemStack>();
                flatten(Reflect.call(value, "getCompletedResult", Float.valueOf(1.0F), new Object[0]), outs);
                if (outs.isEmpty()) outs = outputsOf(value);
                if (matchesAny(selector, outs)) {
                    Object uid = Reflect.call(value, "getUid");
                    if (uid == null) continue;
                    if (isDryRun()) {
                        reportDryRun(rep, name, String.valueOf(uid));
                        removed++;
                    } else if (Reflect.call(map, "remove", uid) != null) {
                        removed++;
                        rep.recipeRemoved(name, String.valueOf(uid));
                    }
                }
            }
            return removed;
        }
    }

    private static String join(List<ItemStack> stacks) {
        StringBuilder sb = new StringBuilder();
        for (ItemStack s : stacks) {
            if (sb.length() > 0) sb.append(" + ");
            sb.append(Items.id(s));
        }
        return sb.toString();
    }
}
