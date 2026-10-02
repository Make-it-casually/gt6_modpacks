package dshguard.mixin;

import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

import java.util.List;

/**
 * Alfheim's ItemSplashPotion (a Botania brew container) crashes the creative inventory:
 *
 *     java.lang.NullPointerException
 *         at alfheim.common.item.ItemSplashPotion.func_77624_a(ItemSplashPotion.kt:73)
 *         at net.minecraft.item.ItemStack.func_82840_a(ItemStack.java:525)
 *         at net.minecraft.client.gui.inventory.GuiContainerCreative.updateFilteredItems
 *
 * GuiContainerCreative builds a tooltip for every single item it lists, so any stack this
 * tooltip cannot handle (a plain, NBT-less splash potion) takes the whole creative menu
 * down. Redirecting the Botania call was not enough -- the null check that throws sits
 * inside the method -- so the method is skipped outright. The lost text is the cosmetic
 * "Brew of <name> / effect list" block only.
 */
@Mixin(targets = "alfheim.common.item.ItemSplashPotion", remap = false)
public abstract class MixinItemSplashPotion {

    private static boolean dshguard$reported;

    @Inject(method = "func_77624_a", at = @At("HEAD"), cancellable = true, remap = false)
    private void dshguard$skipCrashingTooltip(ItemStack stack, EntityPlayer player, List<?> list,
                                              boolean advanced, CallbackInfo ci) {
        if (!dshguard$reported) {
            dshguard$reported = true;
            System.out.println("[dim0guard] skipping Alfheim splash potion tooltips - its tooltip throws an NPE "
                    + "and takes the creative inventory down (ItemSplashPotion.kt:73)");
        }
        ci.cancel();
    }
}
