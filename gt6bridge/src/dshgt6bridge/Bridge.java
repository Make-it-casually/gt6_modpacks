package dshgt6bridge;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import cpw.mods.fml.common.FMLLog;
import gregapi.recipes.Recipe;

/**
 * Orchestrates the three passes and keeps enough state to notice when GT6 rebuilds its
 * recipe maps (which happens when a world is loaded).
 */
public final class Bridge {

    public static final Bridge INSTANCE = new Bridge();

    private static String lastSummary = "gt6bridge has not run yet";

    /** one line summary of the last pass, returned to CraftTweaker scripts. */
    public static synchronized String lastSummary() {
        return lastSummary;
    }

    private static synchronized void setSummary(String s) {
        lastSummary = s;
    }

    private boolean applied;
    private long lastConfigSeen;
    private Map<Recipe, String> sentinels = new HashMap<Recipe, String>();
    private java.util.List<MaterialBinder.Binding> binderList = new java.util.ArrayList<MaterialBinder.Binding>();

    private Bridge() {}

    public synchronized void run(String phase) {
        long t0 = System.currentTimeMillis();
        Cfg cfg = new Cfg();
        Settings settings = new Settings(cfg);
        Report rep = new Report();
        rep.phase(phase);

        FMLLog.info("[%s] run (%s): config dir %s", GT6Bridge.MODID, phase, cfg.dir().getAbsolutePath());

        try {
            long t = System.currentTimeMillis();
            LinkCheck.run(rep);
            rep.count("timing.linkCheck.ms", (int) (System.currentTimeMillis() - t));
        } catch (Throwable t) {
            rep.error("link check crashed: " + t);
        }

        try {
            long t = System.currentTimeMillis();
            Diagnostics.run(rep);
            rep.count("timing.diagnostics.ms", (int) (System.currentTimeMillis() - t));
        } catch (Throwable t) {
            rep.error("diagnostics crashed: " + t);
        }

        try {
            long t = System.currentTimeMillis();
            MaterialBinder binder = new MaterialBinder(cfg, rep, settings);
            binder.loadTable();
            binder.run();
            binderList = binder.bindings();
            rep.count("timing.materialPass.ms", (int) (System.currentTimeMillis() - t));
        } catch (Throwable t) {
            rep.error("material pass crashed: " + t);
        }

        // GT6 builds its per-item recipe index (mRecipeItemMap) while items are registered.
        // After we injected material data at runtime it has to be rebuilt, otherwise machines
        // would keep looking up the old (empty) entries. Skipped in dry runs (nothing changed).
        if (settings.getBool("dryRun")) {
            rep.note("Recipe.reInit() skipped (dryRun=true)");
        } else {
            try {
                long t = System.currentTimeMillis();
                Recipe.reInit();
                rep.count("timing.recipeReInit.ms", (int) (System.currentTimeMillis() - t));
                rep.note("Recipe.reInit() called - GT6 recipe item index rebuilt after the bindings");
            } catch (Throwable t) {
                rep.error("Recipe.reInit() failed: " + t);
            }
        }

        try {
            long t = System.currentTimeMillis();
            new AutoRules(cfg, settings, rep).run(binderList);
            rep.count("timing.autoRules.ms", (int) (System.currentTimeMillis() - t));
        } catch (Throwable t) {
            rep.error("auto rules pass crashed: " + t);
        }

        for (String n : MaterialCreator.NOTES) {
            rep.note("pre-init: " + n);
        }

        try {
            long t = System.currentTimeMillis();
            RecipeAdder adder = new RecipeAdder(cfg, rep);
            adder.run();
            sentinels = adder.sentinels();
            SpaceRecipeMigrator migrator = new SpaceRecipeMigrator(settings, rep);
            migrator.run();
            sentinels.putAll(migrator.sentinels());
            rep.count("timing.recipePass.ms", (int) (System.currentTimeMillis() - t));
        } catch (Throwable t) {
            rep.error("recipe pass crashed: " + t);
        }

        try {
            long t = System.currentTimeMillis();
            RecipeRemover remover = new RecipeRemover(cfg, settings, rep);
            remover.run();
            rep.count("timing.removalPass.ms", (int) (System.currentTimeMillis() - t));
        } catch (Throwable t) {
            rep.error("removal pass crashed: " + t);
        }

        File report = rep.write(cfg.dir());
        applied = true;
        try {
            lastConfigSeen = cfg.lastModified();
        } catch (Throwable ignored) {}

        StringBuilder summary = new StringBuilder();
        summary.append("gt6bridge ").append(GT6Bridge.VERSION).append(" (").append(phase).append(")");
        for (String key : new String[] { "bindings", "bindings.verified", "bindings.verifyFailed",
                                         "alreadyBound", "skipped.lockedAutoInvalid", "removed.total",
                                         "autorules.added", "errors" }) {
            Integer v = rep.counters().get(key);
            if (v != null) summary.append(' ').append(key).append('=').append(v);
        }
        summary.append(" report=").append(report.getAbsolutePath());
        setSummary(summary.toString());

        FMLLog.info("[%s] %s pass finished in %d ms with %d error(s); report: %s",
            GT6Bridge.MODID, phase, Long.valueOf(System.currentTimeMillis() - t0),
            Integer.valueOf(rep.errors()), report.getAbsolutePath());
    }

    /**
     * GT6 rebuilds recipe maps on world load; if any recipe we created disappeared, redo
     * the passes (bindings are idempotent, recipes are re-added).
     */
    public synchronized void reapplyIfNeeded() {
        if (!applied) {
            run("server-started");
            return;
        }
        // edited CSV tables? apply them on the next world load, no game restart needed
        try {
            long newest = new Cfg().lastModified();
            if (newest > lastConfigSeen) {
                FMLLog.info("[%s] config tables changed, re-applying (workshop-friendly reload)",
                    GT6Bridge.MODID);
                run("config-changed");
                return;
            }
        } catch (Throwable t) {
            // ignore: the sentinel check below still runs
        }
        boolean lost = false;
        for (Map.Entry<Recipe, String> e : sentinels.entrySet()) {
            Recipe.RecipeMap map = Gt6.recipeMap(e.getValue());
            if (map == null) continue;
            boolean present;
            try {
                present = map.mRecipeList.contains(e.getKey());
            } catch (Throwable t) {
                present = true;
            }
            if (!present) {
                FMLLog.info("[%s] recipe map %s lost a recipe we added, re-applying",
                    GT6Bridge.MODID, e.getValue());
                lost = true;
                break;
            }
        }
        if (lost) run("re-apply-after-world-load");
    }
}
