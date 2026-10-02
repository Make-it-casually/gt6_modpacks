package dshgt6bridge;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gregapi.oredict.OreDictMaterial;
import gregapi.oredict.OreDictPrefix;
import gregapi.recipes.Recipe;
import net.minecraft.item.ItemStack;

/**
 * Optional pass: generates GT6 machine recipes for every bound foreign item, driven by
 * config/gt6bridge/autorules.csv (one rule per ore dictionary prefix).
 *
 * GT6 already synthesizes recipes for the prefixes its own handlers cover
 * (Crusher/Mortar/Shredder/Anvil/...). These rules exist for the gaps - most importantly
 * Smelter/Furnace, which have no handler - and for conversion recipes (Generifier).
 *
 * Every rule ships disabled; enable them one by one after looking at report.txt.
 */
public final class AutoRules {

    public static final String FILE = "autorules.csv";

    public static final String HEADER =
        "# gt6bridge automatic recipes, one rule per ore dictionary prefix\n" +
        "# syntax: <prefix>,<map>,<outputPrefix>,<count>[,eut,duration,optimize,enabled]\n" +
        "#   <prefix>       : ore dictionary prefix as GT6 names it, e.g. ore, crushed, dust, ingot, plate, gear\n" +
        "#   <map>          : GT6 recipe map (Crusher, Smelter, Mixer, ..., Generifier)\n" +
        "#   <outputPrefix> : GT6 prefix of the result, produced for the SAME material as the input\n" +
        "#                    (use 'same' to keep the input prefix)\n" +
        "#   <count>        : output amount\n" +
        "#   eut,duration   : energy per tick / ticks (default 16 / 32)\n" +
        "#   optimize       : GT6 addRecipe1 flag (default true)\n" +
        "#   enabled        : false = only listed in the report, true = actually added\n" +
        "#\n" +
        "# 'Generifier' uses RM.generify(input, output) - the machine that converts foreign\n" +
        "# items into their GT6 counterpart.\n" +
        "#\n" +
        "# candidate rules (all disabled by default - check report.txt first):\n" +
        "ore,Crusher,crushed,2,16,32,true,false\n" +
        "crushed,Crusher,dust,1,16,32,true,false\n" +
        "purified,Crusher,dust,1,16,32,true,false\n" +
        "dust,Smelter,ingot,1,16,32,true,false\n" +
        "dustTiny,Smelter,nugget,4,16,16,true,false\n" +
        "nugget,Smelter,ingot,9,16,16,true,false\n" +
        "ingot,Generifier,same,1,0,1,true,false\n" +
        "dust,Generifier,same,1,0,1,true,false\n" +
        "plate,Generifier,same,1,0,1,true,false\n" +
        "gear,Generifier,same,1,0,1,true,false\n";

    private final Cfg cfg;
    private final Settings settings;
    private final Report rep;

    public AutoRules(Cfg cfg, Settings settings, Report rep) {
        this.cfg = cfg;
        this.settings = settings;
        this.rep = rep;
    }

    public void run(List<MaterialBinder.Binding> bindings) {
        Map<String, String[]> rules = load();
        if (rules.isEmpty()) return;
        if (!settings.getBool("enableAutoRules")) {
            rep.note("autorules.csv has " + rules.size()
                + " rule(s) but they are disabled by settings.csv (enableAutoRules=false)");
            for (String k : rules.keySet()) rep.count("autorules.available." + k, 0);
            return;
        }
        if (bindings == null || bindings.isEmpty()) return;

        for (MaterialBinder.Binding b : bindings) {
            String[] r = rules.get(b.prefixName == null ? "" : b.prefixName.toLowerCase());
            if (r == null) continue;
            boolean enabled = r.length > 7 && Boolean.parseBoolean(r[7].trim());
            if (!enabled) {
                rep.count("autorules.disabled");
                continue;
            }
            String mapName = r[1].trim();
            String outPrefixName = r[2].trim();
            int count = parseInt(r.length > 3 ? r[3] : "1", 1);
            long eut = parseLong(r.length > 4 ? r[4] : "", 16L);
            long duration = parseLong(r.length > 5 ? r[5] : "", 32L);
            boolean optimize = r.length <= 6 || r[6].trim().isEmpty() || Boolean.parseBoolean(r[6].trim());

            OreDictPrefix outPrefix = "same".equalsIgnoreCase(outPrefixName)
                ? Gt6.prefix(b.prefixName) : Gt6.prefix(outPrefixName);
            if (outPrefix == null) {
                rep.error("autorule: unknown output prefix '" + outPrefixName + "'");
                continue;
            }
            ItemStack out = Gt6.gtStack(outPrefix, b.material, count);
            if (out == null) {
                rep.count("autorules.skipped.noGtItem");
                continue;
            }

            boolean ok;
            if ("Generifier".equalsIgnoreCase(mapName)) {
                ok = Gt6.generify(b.stack, out);
            } else {
                Recipe.RecipeMap map = Gt6.recipeMap(mapName);
                if (map == null) {
                    rep.error("autorule: unknown recipe map '" + mapName + "'");
                    continue;
                }
                ok = Gt6.add1(map, optimize, eut, duration, b.stack, new ItemStack[] { out }) != null;
            }
            if (ok) {
                rep.recipeAdded("auto:" + mapName, Items.id(b.stack) + " -> " + Items.id(out)
                    + " (rule " + r[0] + ")");
                rep.count("autorules.added");
            } else {
                rep.error("autorule failed: " + mapName + " " + Items.id(b.stack) + " -> " + Items.id(out));
            }
        }
    }

    private Map<String, String[]> load() {
        Map<String, String[]> rules = new HashMap<String, String[]>();
        for (String[] row : cfg.read(FILE, HEADER)) {
            if (row.length < 4) continue;
            String prefix = row[0].trim();
            if (prefix.isEmpty() || prefix.startsWith("<")) continue;
            rules.put(prefix.toLowerCase(), row);
        }
        return rules;
    }

    private static int parseInt(String s, int def) {
        try {
            return Integer.parseInt(s.trim());
        } catch (Throwable t) {
            return def;
        }
    }

    private static long parseLong(String s, long def) {
        try {
            return Long.parseLong(s.trim());
        } catch (Throwable t) {
            return def;
        }
    }

    /** the material a rule produced output for, used in the report only. */
    public static String describe(OreDictMaterial m) {
        return m == null ? "?" : m.mNameInternal;
    }
}
