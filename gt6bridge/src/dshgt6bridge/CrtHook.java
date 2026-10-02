package dshgt6bridge;

import cpw.mods.fml.common.FMLLog;
import cpw.mods.fml.common.Loader;

/**
 * Registers {@code dshgt6bridge.crt.BridgeCrT} with MineTweaker / CraftTweaker.
 *
 * Everything here is reflective so the bridge works unchanged when no script mod is installed:
 * the Zen class itself (which references minetweaker.* types directly) is only loaded through
 * Class.forName once MineTweaker3 is known to be present.
 */
public final class CrtHook {

    private static boolean registered;

    private CrtHook() {}

    public static void register() {
        if (registered) return;
        registered = true;
        if (!Loader.isModLoaded("MineTweaker3")) {
            FMLLog.info("[%s] no MineTweaker/CraftTweaker installed - script API disabled", GT6Bridge.MODID);
            return;
        }
        try {
            Class<?> api = Class.forName("minetweaker.MineTweakerAPI");
            Class<?> zen = Class.forName("dshgt6bridge.crt.BridgeCrT");
            api.getMethod("registerClass", Class.class).invoke(null, zen);
            FMLLog.info("[%s] CraftTweaker/MineTweaker API registered as mods.gt6bridge.Bridge",
                GT6Bridge.MODID);
        } catch (Throwable t) {
            FMLLog.warn("[%s] could not register the script API: %s", GT6Bridge.MODID, String.valueOf(t));
        }
    }
}
