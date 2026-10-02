package net.minecraft.item;

/**
 * COMPILE-TIME STUB ONLY - never packaged into the mod jar.
 *
 * Member names are the SRG names the game actually uses at runtime (MCP names in comments),
 * because this mod is compiled by plain javac without ForgeGradle's reobfuscation step.
 * The FML deobfuscation data (deobfuscation_data-1.7.10.lzma in the forge jar) was used to
 * verify every name; see tools/deobf_data.txt.
 */
public class ItemStack {

    public int field_77994_a; // MCP: stackSize

    public ItemStack(Item item, int size, int meta) {
    }

    public Item func_77973_b() { // MCP: getItem()
        return null;
    }

    public int func_77960_j() { // MCP: getItemDamage()  (obf add.k() returns the meta field)
        return 0;
    }

    public ItemStack func_77946_l() { // MCP: copy()
        return null;
    }
}
