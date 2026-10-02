package dshgt6bridge;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import gregapi.data.MT;
import gregapi.data.OP;
import gregapi.data.RM;
import gregapi.oredict.OreDictItemData;
import gregapi.oredict.OreDictManager;
import gregapi.oredict.OreDictMaterial;
import gregapi.oredict.OreDictPrefix;
import gregapi.recipes.Recipe;
import net.minecraft.item.ItemStack;
import net.minecraftforge.oredict.OreDictionary;

/**
 * Read-only self check of the GT6 API surface this mod depends on, written into the report.
 *
 * It runs before anything is changed, so if GT6 ever changes shape the report shows exactly
 * which entry point broke instead of the bridge silently doing nothing.
 */
public final class Diagnostics {

    private Diagnostics() {}

    public static void run(Report rep) {
        rep.heading("GT6 API diagnostics");

        rep.line("  OreDictManager.INSTANCE reachable : " + (OreDictManager.INSTANCE != null));

        int prefixCount = -1;
        try {
            prefixCount = OreDictPrefix.VALUES.size();
        } catch (Throwable t) {
            rep.error("OreDictPrefix.VALUES unavailable: " + t);
        }
        int materialCount = -1;
        try {
            materialCount = OreDictMaterial.MATERIAL_MAP.size();
        } catch (Throwable t) {
            rep.error("OreDictMaterial.MATERIAL_MAP unavailable: " + t);
        }
        rep.line("  GT6 prefixes                      : " + prefixCount);
        rep.line("  GT6 materials (MATERIAL_MAP)      : " + materialCount);

        int oreNames = -1;
        try {
            String[] names = OreDictionary.getOreNames();
            oreNames = names == null ? -1 : names.length;
        } catch (Throwable t) {
            rep.error("OreDictionary.getOreNames() failed: " + t);
        }
        rep.line("  forge ore dictionary names        : " + oreNames);

        // the exact path the bridge relies on: material + prefix -> GT6 item
        String ironIngot = describe(Gt6.gtStack(OP.ingot, MT.Fe, 1));
        String ironDust = describe(Gt6.gtStack(OP.dust, MT.Fe, 1));
        String copperPlate = describe(Gt6.gtStack(OP.plate, MT.Cu, 1));
        rep.line("  OM.get(ingot, Fe, 1)              : " + ironIngot);
        rep.line("  OM.get(dust,  Fe, 1)              : " + ironDust);
        rep.line("  OM.get(plate, Cu, 1)              : " + copperPlate);
        if ("null".equals(ironIngot)) {
            rep.error("OM.get(OP.ingot, MT.Fe, 1) returned null - material/prefix resolution is broken");
        }

        // material lookup by name, both via the map and via the string API
        OreDictMaterial byMap = null;
        try {
            byMap = OreDictMaterial.MATERIAL_MAP.get("Iron");
        } catch (Throwable ignored) {}
        rep.line("  MATERIAL_MAP.get(\"Iron\")          : " + (byMap == null ? "null" : byMap.mNameInternal));
        rep.line("  OreDictMaterial.get(\"Iron\")       : "
            + (Gt6.material("Iron") == null ? "null" : Gt6.material("Iron").mNameInternal));
        rep.line("  prefix lookup \"ingot\"/\"dustSmall\": "
            + (Gt6.prefix("ingot") == null ? "null" : Gt6.prefix("ingot").mNameInternal) + " / "
            + (Gt6.prefix("dustSmall") == null ? "null" : Gt6.prefix("dustSmall").mNameInternal));

        // reading material data of an existing GT6 item
        OreDictItemData data = ironIngot == null ? null : Gt6.data(Gt6.gtStack(OP.ingot, MT.Fe, 1));
        rep.line("  data of GT iron ingot             : " + describeData(data));

        // recipe maps
        List<String> maps = Gt6.recipeMapNames();
        Collections.sort(maps);
        rep.line("  RM recipe maps                    : " + maps.size());
        rep.count("gt6.recipeMaps", maps.size());
        rep.heading("GT6 recipe map names (for recipes.csv)");
        StringBuilder sb = new StringBuilder("  ");
        for (String m : maps) {
            sb.append(m).append("  ");
        }
        rep.line(sb.toString());

        for (String m : new String[] { "Crusher", "Mortar", "Shredder", "Smelter", "Mixer", "Centrifuge",
                                       "Electrolyzer", "Compressor", "Hammer", "Bath", "Generifier", "Wiremill" }) {
            Recipe.RecipeMap map = Gt6.recipeMap(m);
            int size = -1;
            if (map != null) {
                try {
                    size = map.mRecipeList.size();
                } catch (Throwable ignored) {}
            }
            rep.line("  map " + pad(m, 12) + ": " + (map == null ? "MISSING" : ("recipes=" + size)));
            if (map == null) rep.error("GT6 recipe map missing: " + m);
        }

        // which maps carry dynamic handlers (those synthesize recipes for bound items)
        List<String> withHandlers = new ArrayList<String>();
        try {
            for (String m : maps) {
                Recipe.RecipeMap map = Gt6.recipeMap(m);
                if (map == null) continue;
                if (map.mRecipeMapHandlers != null && !map.mRecipeMapHandlers.isEmpty()) withHandlers.add(m);
            }
        } catch (Throwable t) {
            rep.error("could not read mRecipeMapHandlers: " + t);
        }
        rep.line("  maps with dynamic handlers        : " + withHandlers.size() + " " + withHandlers);

        // prefix table: names are what autorules.csv / recipes.csv use, the counts show how
        // many items GT6 has registered per prefix
        try {
            List<OreDictPrefix> sorted = new ArrayList<OreDictPrefix>(OreDictPrefix.VALUES);
            Collections.sort(sorted, new java.util.Comparator<OreDictPrefix>() {
                @Override
                public int compare(OreDictPrefix a, OreDictPrefix b) {
                    return String.valueOf(a.mNameInternal).compareTo(String.valueOf(b.mNameInternal));
                }
            });
            rep.heading("GT6 ore dictionary prefixes (name / items / materials)");
            for (OreDictPrefix p : sorted) {
                int items = -1;
                int mats = -1;
                try {
                    items = p.mRegisteredItems.size();
                } catch (Throwable ignored) {}
                try {
                    mats = p.mRegisteredMaterials.size();
                } catch (Throwable ignored) {}
                rep.line("  " + pad(String.valueOf(p.mNameInternal), 22) + " items=" + pad(String.valueOf(items), 7)
                    + " materials=" + mats);
            }
        } catch (Throwable t) {
            rep.error("could not dump the prefix table: " + t);
        }

        // write the authoritative list of material names GT6 knows, for the report analyser
        try {
            List<String> names = new ArrayList<String>();
            for (OreDictMaterial m : OreDictMaterial.MATERIAL_MAP.values()) {
                if (m != null && m.mNameInternal != null) names.add(m.mNameInternal);
            }
            Collections.sort(names);
            java.io.Writer w = new java.io.OutputStreamWriter(
                new java.io.FileOutputStream(new java.io.File(GT6Bridge.configDir(), "materials-known.txt")), "UTF-8");
            for (String n : names) w.write(n + "\n");
            w.close();
            rep.line("  known material list written          : materials-known.txt (" + names.size() + " names)");
        } catch (Throwable t) {
            rep.error("could not write materials-known.txt: " + t);
        }
    }

    private static String describe(ItemStack stack) {
        if (stack == null) return "null";
        return Items.id(stack);
    }

    private static String describeData(OreDictItemData data) {
        if (data == null) return "null";
        try {
            OreDictPrefix p = data.mPrefix;
            OreDictMaterial m = data.mMaterial == null ? null : data.mMaterial.mMaterial;
            return (p == null ? "?" : p.mNameInternal) + "/" + (m == null ? "?" : m.mNameInternal)
                + " validData=" + data.validData();
        } catch (Throwable t) {
            return "error: " + t;
        }
    }

    private static String pad(String s, int width) {
        StringBuilder sb = new StringBuilder(s);
        while (sb.length() < width) sb.append(' ');
        return sb.toString();
    }
}
