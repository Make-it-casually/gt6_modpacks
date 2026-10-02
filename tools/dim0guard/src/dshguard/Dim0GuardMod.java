package dshguard;

import cpw.mods.fml.common.FMLCommonHandler;
import cpw.mods.fml.common.Mod;
import cpw.mods.fml.common.event.FMLInitializationEvent;
import cpw.mods.fml.common.eventhandler.SubscribeEvent;
import cpw.mods.fml.common.gameevent.TickEvent;
import cpw.mods.fml.common.network.FMLNetworkEvent;
import net.minecraftforge.common.DimensionManager;
import net.minecraftforge.common.MinecraftForge;

/**
 * Belt-and-braces companion to MixinDimensionManager: if the Overworld's dimension
 * registration disappears for any reason, put it straight back. All Minecraft classes are
 * touched through reflection so this jar needs no compile-time Minecraft dependency.
 */
@Mod(modid = "dim0guard", name = "Overworld dimension guard", version = "1.0")
public class Dim0GuardMod {

    private static boolean restoredOnce;

    @Mod.EventHandler
    public void init(FMLInitializationEvent event) {
        FMLCommonHandler.instance().bus().register(this);
        MinecraftForge.EVENT_BUS.register(this);
        System.out.println("[dim0guard] active");
    }

    @SubscribeEvent
    public void onClientConnected(FMLNetworkEvent.ClientConnectedToServerEvent event) {
        ensureOverworld();
    }

    @SubscribeEvent
    public void onClientTick(TickEvent.ClientTickEvent event) {
        ensureOverworld();
    }

    private static void ensureOverworld() {
        try {
            if (DimensionManager.isDimensionRegistered(0)) {
                return;
            }
            if (!registerProviderTypeIfMissing()) {
                return;
            }
            DimensionManager.registerDimension(0, 0);
            if (!restoredOnce) {
                restoredOnce = true;
                System.out.println("[dim0guard] Overworld dimension 0 was missing - restored");
            }
        } catch (Throwable t) {
            System.out.println("[dim0guard] failed to restore dimension 0: " + t);
        }
    }

    private static boolean registerProviderTypeIfMissing() {
        try {
            DimensionManager.getProviderType(0);
            return true; // provider type still present
        } catch (Throwable missing) {
            // fall through and rebuild it
        }
        try {
            Class<?> surface = Class.forName("net.minecraft.world.WorldProviderSurface");
            @SuppressWarnings({"unchecked", "rawtypes"})
            Class provider = surface;
            DimensionManager.registerProviderType(0, provider, true);
            System.out.println("[dim0guard] re-registered WorldProviderSurface for provider type 0");
            return true;
        } catch (Throwable t) {
            System.out.println("[dim0guard] could not re-register provider type 0: " + t);
            return false;
        }
    }
}
