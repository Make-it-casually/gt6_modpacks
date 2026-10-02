package dshgt6bridge;

import java.util.HashMap;
import java.util.Map;

/**
 * Global switches, read from config/gt6bridge/settings.csv ("key,value" lines).
 */
public final class Settings {

    public static final String FILE = "settings.csv";

    public static final String HEADER =
        "# gt6bridge switches (key,value)\n" +
        "#   enableMaterialBinding : bind foreign ore dictionary items to GT6 materials (default true)\n" +
        "#   bindOnlyWithGt6Item   : only bind when GT6 also has an item for that prefix+material (default true)\n" +
        "#   enableMaterialCreation: create GT6 materials for materials.csv \"create:\" rows in PreInit (default true)\n" +
        "#   dryRun                : analyse and report, but change nothing (default false)\n" +
        "#   removalDryRun         : removals.csv only counts and reports what it would delete (default true)\n" +
        "#                           set to false to really delete\n" +
        "#   bindLimit             : stop the material pass after N bindings, 0 = no limit (default 0)\n" +
        "#   scanBudgetMs          : stop the ore dictionary scan after N ms, 0 = no limit (default 20000)\n" +
        "#   skipMods              : comma separated mod ids whose items are never bound (default empty)\n" +
        "#   skipItems             : comma separated item selectors never bound, e.g. \"*:itemAlloy:6, EnderIO:*\"\n" +
        "#   onlyPrefixes          : bind only these ore dictionary prefixes (default empty = all of GT6's 450+)\n" +
        "#   logEveryBinding       : also print every binding to the game log (default false)\n" +
        "#   enableAutoRules       : generate recipes from autorules.csv (default false)\n" +
        "# examples:\n" +
        "# enableMaterialBinding,true\n" +
        "# removalDryRun,true\n";

    private final Map<String, String> values = new HashMap<String, String>();

    public Settings(Cfg cfg) {
        set("enableMaterialBinding", "true");
        // GT6 refuses to re-bind a stack that already carries material data, and it tags
        // materials it auto-created for unknown ore dictionary names as invalid. Binding only
        // when GT6 has a corresponding item keeps us on real materials and gives the machine
        // lookup a unification target.
        set("bindOnlyWithGt6Item", "true");
        set("dryRun", "false");
        set("logEveryBinding", "false");
        // create GT6 materials for unknown ore dictionary tokens (materials.csv "create:" rows)
        set("enableMaterialCreation", "true");
        // generate recipes from autorules.csv - every rule also has its own enabled flag
        set("enableAutoRules", "false");
        // removals: count what would be deleted instead of deleting it (safe first look)
        set("removalDryRun", "true");
        // safety valve: stop binding after N stacks (0 = no limit)
        set("bindLimit", "0");
        // safety valve: stop the ore dictionary scan after N milliseconds (0 = no limit)
        set("scanBudgetMs", "20000");
        // comma separated mod ids whose items are never bound (GT6's own items are always skipped)
        set("skipMods", "");
        // comma separated item selectors never bound, e.g. "*:itemAlloy:6, EnderIO:*"
        set("skipItems", "");
        // comma separated ore dictionary prefixes to bind (empty = all GT6 prefixes)
        set("onlyPrefixes", "");
        for (String[] row : cfg.read(FILE, HEADER)) {
            if (row.length < 2) continue;
            String k = row[0].trim();
            if (k.isEmpty() || k.startsWith("<")) continue;
            // cells behind the first one belong to the value: "skipMods, Foo , BAR ," and
            // "dryRun,true,note" both survive; scalars take the first part, lists take all
            StringBuilder v = new StringBuilder(row[1].trim());
            for (int i = 2; i < row.length; i++) {
                v.append(',').append(row[i].trim());
            }
            set(k, v.toString());
        }
    }

    private void set(String key, String value) {
        values.put(key.toLowerCase(), value);
    }

    /** scalar part of a value: everything before the first comma. */
    private String scalar(String key) {
        String v = values.get(key.toLowerCase());
        if (v == null) return null;
        int i = v.indexOf(',');
        return (i < 0 ? v : v.substring(0, i)).trim();
    }

    public boolean getBool(String key) {
        String v = scalar(key);
        return v != null && ("true".equalsIgnoreCase(v) || "1".equals(v) || "yes".equalsIgnoreCase(v));
    }

    public int getInt(String key, int def) {
        String v = scalar(key);
        if (v == null) return def;
        try {
            return Integer.parseInt(v);
        } catch (Throwable t) {
            return def;
        }
    }

    public long getLong(String key, long def) {
        String v = scalar(key);
        if (v == null) return def;
        try {
            return Long.parseLong(v);
        } catch (Throwable t) {
            return def;
        }
    }

    /** comma separated list value, trimmed and lower cased. */
    public java.util.Set<String> getList(String key) {
        java.util.Set<String> out = new java.util.HashSet<String>();
        String v = values.get(key.toLowerCase());
        if (v == null) return out;
        for (String part : v.split(",")) {
            String s = part.trim().toLowerCase();
            if (!s.isEmpty()) out.add(s);
        }
        return out;
    }
}
