package dshgt6bridge;

import cpw.mods.fml.common.FMLLog;
import cpw.mods.fml.common.Mod;
import cpw.mods.fml.common.event.FMLLoadCompleteEvent;
import cpw.mods.fml.common.event.FMLPreInitializationEvent;
import cpw.mods.fml.common.event.FMLServerStartedEvent;

/**
 * GT6 Recipe Bridge - data driven bridge between GregTech 6 and every other mod
 * present in the pack.
 *
 * 1) material pass: scans the Forge ore dictionary and binds foreign items
 *    (ingots, dusts, plates, gears, ores, nuggets, blocks...) to GT6's own
 *    OreDictMaterial/OreDictPrefix system so GT6 machines and NEI see them.
 * 2) recipe pass: adds recipes to GT6 recipe maps from config/gt6bridge/recipes.csv
 * 3) removal pass: deletes other tech mods' own recipes from config/gt6bridge/removals.csv
 *
 * Everything is driven by CSV files under config/gt6bridge/. Nothing is hardcoded,
 * so the tables can be edited without recompiling this mod.
 */
@Mod(modid = GT6Bridge.MODID, name = "GT6 Recipe Bridge", version = GT6Bridge.VERSION)
public class GT6Bridge {

    public static final String MODID = "gt6bridge";
    public static final String VERSION = "0.6";

    /** config/gt6bridge - shared by the mod and the report analyser. */
    public static java.io.File configDir() {
        java.io.File base = null;
        try {
            base = cpw.mods.fml.common.Loader.instance().getConfigDir();
        } catch (Throwable ignored) {}
        if (base == null) base = new java.io.File("config");
        java.io.File dir = new java.io.File(base, MODID);
        if (!dir.exists()) dir.mkdirs();
        return dir;
    }

    /**
     * Pre-init: create GT6 materials for ore dictionary tokens GT6 does not know.
     * GT6 only generates items for materials created during or before PreInit.
     */
    @Mod.EventHandler
    public void onPreInit(FMLPreInitializationEvent event) {
        try {
            CrtHook.register();
        } catch (Throwable t) {
            FMLLog.warn("[%s] script API registration failed: %s", MODID, String.valueOf(t));
        }
        try {
            Cfg cfg = new Cfg();
            Settings settings = new Settings(cfg);
            Report rep = new Report();
            rep.phase("pre-init");
            try {
                new MaterialCreator(cfg, settings, rep).run();
            } catch (Throwable t) {
                rep.error("pre-init material creation crashed: " + t);
            }
            FMLLog.info("[%s] pre-init done: %d material(s) created, %d error(s)", MODID,
                Integer.valueOf(MaterialCreator.CREATED), Integer.valueOf(rep.errors()));
        } catch (Throwable t) {
            // never let a bridge failure escape into FML's state machine
            FMLLog.severe("[%s] pre-init pass failed, continuing without it: %s", MODID, String.valueOf(t));
        }
    }

    /** Runs after every mod finished its post-init, i.e. after GT6 registered its own recipes. */
    @Mod.EventHandler
    public void onLoadComplete(FMLLoadCompleteEvent event) {
        try {
            Bridge.INSTANCE.run("load-complete");
        } catch (Throwable t) {
            // FML turns an exception thrown here into "Loading cannot continue" for the whole game,
            // so nothing may escape: report it and keep the session alive.
            FMLLog.severe("[%s] load-complete pass failed, the bridge stays inactive this session: %s",
                MODID, String.valueOf(t));
        }
    }

    /**
     * GT6 rebuilds parts of its recipe maps when a world is loaded, so re-apply the
     * configured changes if they are missing (idempotent, cheap when nothing changed).
     */
    @Mod.EventHandler
    public void onServerStarted(FMLServerStartedEvent event) {
        try {
            Bridge.INSTANCE.reapplyIfNeeded();
        } catch (Throwable t) {
            FMLLog.severe("[%s] re-apply pass failed, continuing: %s", MODID, String.valueOf(t));
        }
    }
}
