package dshguard.mixin;

import gregapi.GT_API_Proxy;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Redirect;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;

/**
 * GT6's chunk-watch handler iterates the chunk's tile-entity map and only guards against
 * ConcurrentModificationException:
 *
 *     for (Object tTileEntity : tChunk.field_150816_i.values()) { ...sendUpdateToPlayer... }
 *     catch (ConcurrentModificationException e) { retry, up to 8 times }
 *
 * ChunkAPI/Angelica replace that map with a fastutil Object2ObjectOpenHashMap, whose
 * ValueIterator throws NullPointerException instead of ConcurrentModificationException
 * when the map is modified during iteration. GT6 does not catch that, so it escapes the
 * server tick loop and crashes the server with "Ticking entity".
 *
 * Redirecting Map.values() to a defensive snapshot keeps GT6's behaviour (every
 * ITileEntitySynchronising still gets its update) while making the loop immune to
 * concurrent modification.
 */
@Mixin(value = GT_API_Proxy.class, remap = false)
public abstract class MixinGTAPIProxy {

    private static boolean dshguard$logged;

    @Redirect(
        method = "onChunkWatchEvent(Lnet/minecraftforge/event/world/ChunkWatchEvent$Watch;)V",
        at = @At(value = "INVOKE", target = "Ljava/util/Map;values()Ljava/util/Collection;", remap = false),
        remap = false
    )
    private Collection<?> dshguard$snapshotValues(Map<?, ?> map) {
        try {
            return new ArrayList<Object>(map.values());
        } catch (Throwable t) {
            if (!dshguard$logged) {
                dshguard$logged = true;
                System.out.println("[dim0guard] chunk tile-entity map changed while reading it, "
                        + "skipping this sync round (" + t + ")");
            }
            return Collections.emptyList();
        }
    }
}
