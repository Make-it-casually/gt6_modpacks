package dshguard.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import java.lang.reflect.Field;

/**
 * TofuCraft's TcPotion.onLogin does this, unconditionally:
 *
 *     ids[0] = glowing.func_76396_c();      // getId()
 *     ids[1] = filling.func_76396_c();
 *
 * Both fields are plain statics that stay null when TofuCraft's registration fails --
 * its assignId() only accepts potion ids 0..127 and swallows the failure -- so every
 * single player login throws a NullPointerException out of the PlayerLoggedInEvent
 * listener. FML reacts by marking mods errored, which poisons the session: the
 * Galacticraft family gets errored too and the next world load dies with
 * "the state engine was in incorrect state ERRORED".
 *
 * This injection skips the (purely cosmetic) potion-id-check packet when the potions are
 * missing, so a broken TofuCraft potion can no longer break the whole session.
 *
 * The target is referenced by name only, so this jar needs no compile-time or runtime
 * dependency on TofuCraft's class hierarchy.
 */
@Mixin(targets = "tsuteto.tofu.potion.TcPotion", remap = false)
public abstract class MixinTcPotion {

    private static boolean dshguard$reported;

    @Inject(method = "onLogin", at = @At("HEAD"), cancellable = true, remap = false)
    private static void dshguard$skipBrokenPotionCheck(net.minecraft.entity.player.EntityPlayer player, CallbackInfo ci) {
        try {
            Class<?> tcPotion = Class.forName("tsuteto.tofu.potion.TcPotion");
            Field glowing = tcPotion.getDeclaredField("glowing");
            Field filling = tcPotion.getDeclaredField("filling");
            glowing.setAccessible(true);
            filling.setAccessible(true);
            if (glowing.get(null) == null || filling.get(null) == null) {
                if (!dshguard$reported) {
                    dshguard$reported = true;
                    System.out.println("[dim0guard] TofuCraft potions are not registered - skipping its "
                            + "potion id check packet so login no longer throws (see TofuCraft.cfg 'potion')");
                }
                ci.cancel();
            }
        } catch (Throwable ignored) {
            // never let this guard itself become a problem
        }
    }
}
