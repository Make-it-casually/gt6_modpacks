package dshguard.mixin;

import net.minecraftforge.common.DimensionManager;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Protects the Overworld's dimension registration.
 *
 * Galacticraft's client-side dimension sync (WorldUtil.decodePlanetsListClient /
 * decodeSpaceStationListClient / unregisterSpaceStations) records the dimension ids it
 * registered and unregisters them again on the next sync. The Overworld (dimension 0) is
 * treated as a planet, so on the second sync it calls
 * DimensionManager.unregisterDimension(0), which removes dimension 0 from Forge's
 * dimension table. The client then cannot build a WorldClient for the Overworld and
 * crashes with "Could not get provider type for dimension 0, does not exist".
 *
 * Dimension 0 is never legitimately unregistered, so this injection simply refuses it.
 */
@Mixin(value = DimensionManager.class, remap = false)
public abstract class MixinDimensionManager {

    private static final Set<String> dshguard$reported =
            Collections.newSetFromMap(new ConcurrentHashMap<String, Boolean>());

    @Inject(method = "unregisterDimension(I)V", at = @At("HEAD"), cancellable = true, remap = false)
    private static void dshguard$keepOverworldRegistered(int dimensionId, CallbackInfo ci) {
        if (dimensionId != 0) {
            return;
        }
        StackTraceElement[] trace = new Throwable().getStackTrace();
        String caller = trace.length > 1 ? (trace[1].getClassName() + "#" + trace[1].getMethodName()) : "unknown";
        if (dshguard$reported.add(caller)) {
            System.out.println("[dim0guard] blocked DimensionManager.unregisterDimension(0), caller: " + caller);
        }
        ci.cancel();
    }
}
