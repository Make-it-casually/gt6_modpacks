package ic2.api.recipe;

import java.util.Collections;
import java.util.Map;

public final class Recipes {
    public static final MachineRecipeManager macerator = new MachineRecipeManager();
    public static final MachineRecipeManager extractor = new MachineRecipeManager();
    public static final MachineRecipeManager compressor = new MachineRecipeManager();
    public static final MachineRecipeManager centrifuge = new MachineRecipeManager();
    public static final MachineRecipeManager blockcutter = new MachineRecipeManager();
    public static final MachineRecipeManager blastfurance = new MachineRecipeManager();
    public static final MachineRecipeManager recycler = new MachineRecipeManager();
    public static final MachineRecipeManager metalformerExtruding = new MachineRecipeManager();
    public static final MachineRecipeManager metalformerCutting = new MachineRecipeManager();
    public static final MachineRecipeManager metalformerRolling = new MachineRecipeManager();
    public static final MachineRecipeManager oreWashing = new MachineRecipeManager();
    public static final MachineRecipeManager matterAmplifier = new MachineRecipeManager();

    private Recipes() {}

    public static final class MachineRecipeManager {
        public Map<?, ?> getRecipes() {
            return Collections.emptyMap();
        }
    }
}
