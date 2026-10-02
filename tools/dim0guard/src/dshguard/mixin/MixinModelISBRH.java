package dshguard.mixin;

import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * GTNHLib ships a JSON block-model system (client.model) and hooks it into RenderBlocks
 * through ModelISBRH.renderWorldBlock. For the vanilla blocks it takes over -- grass, both
 * mushrooms, waterlily, crafting table, flower pot, pumpkin -- the blockstate JSON cannot
 * be resolved:
 *
 *     [GTNHLib|Models/]: Could not load minecraft:blockstates/grass.json
 *     ResourcePackFileNotFoundException: 'assets/minecraft/blockstates/grass.json'
 *
 * even when the file is demonstrably present in the active resource pack. GTNHLib's own
 * loader (ResourceLoc.load) goes through the standard resource manager, so the lookup
 * keeps failing whatever pack is used, and the affected blocks render as missing textures
 * (草方块材质丢失).
 *
 * renderWorldBlock returns boolean ("did I handle this block?"). Injecting at HEAD and
 * forcing false sends every block back to the classic 1.7.10 renderer, which restores the
 * broken blocks. Note: because the method returns a value the callback MUST be a
 * CallbackInfoReturnable -- using a plain CallbackInfo makes Mixin fail with
 * "Invalid descriptor ... CallbackInfoReturnable is required!", which takes the whole
 * gtnhlib mod (and every mod depending on it) down with it.
 */
@Mixin(targets = "com.gtnewhorizon.gtnhlib.client.model.ModelISBRH", remap = false)
public abstract class MixinModelISBRH {

    private static boolean dshguard$reported;

    @Inject(method = "renderWorldBlock", at = @At("HEAD"), cancellable = true, remap = false)
    private void dshguard$fallBackToVanillaRenderer(CallbackInfoReturnable<Boolean> cir) {
        if (!dshguard$reported) {
            dshguard$reported = true;
            System.out.println("[dim0guard] GTNHLib JSON block models disabled - vanilla renderer restored "
                    + "(fixes missing grass/mushroom/waterlily/crafting table/flower pot/pumpkin models)");
        }
        cir.setReturnValue(Boolean.FALSE);
    }
}
