package net.minecraftforge.oredict;

import java.util.ArrayList;
import java.util.List;

import net.minecraft.item.ItemStack;

/**
 * COMPILE-TIME STUB ONLY - never packaged into the mod jar.
 * Mirrors the MCP-named 1.7.10 Forge API surface that this mod uses.
 */
public class OreDictionary {

    public static final int WILDCARD_VALUE = 32767;

    public static String[] getOreNames() {
        return null;
    }

    public static ArrayList<ItemStack> getOres(String name) {
        return null;
    }

    public static List<ItemStack> getOres(String name, boolean alwaysCreateEntry) {
        return null;
    }

    public static boolean doesOreNameExist(String name) {
        return false;
    }

    public static int getOreID(String name) {
        return -1;
    }

    public static String getOreName(int id) {
        return null;
    }

    public static void registerOre(String name, ItemStack ore) {
    }
}
