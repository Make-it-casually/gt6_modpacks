package dshgt6bridge;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Runtime override table filled by CraftTweaker / MineTweaker scripts
 * (ZenClass "mods.gt6bridge.Bridge") and consumed by the material and recipe passes.
 *
 * Pure Java, no Minecraft types beyond the item rules list, so it is unit tested in
 * test/TestMain.java.
 */
public final class Overrides {

    /** material token -> GT6 material name, or "-" to never bind that token. */
    private static final Map<String, String> MATERIALS = new LinkedHashMap<String, String>();

    /** item rules: {selector, prefix, material} - bind a specific item to a prefix+material. */
    private static final List<String[]> ITEMS = new ArrayList<String[]>();

    private Overrides() {}

    public static synchronized void bindMaterial(String token, String material) {
        if (token == null || token.trim().isEmpty()) return;
        MATERIALS.put(token.trim(), material == null ? "" : material.trim());
    }

    public static synchronized void skipMaterial(String token) {
        bindMaterial(token, "-");
    }

    /** selector uses the same syntax as removals.csv: "mod:name[:meta]", "*:name*", "EnderIO:*". */
    public static synchronized void bindItem(String selector, String prefix, String material) {
        if (selector == null || selector.trim().isEmpty()) return;
        ITEMS.add(new String[] { selector.trim(), prefix == null ? "" : prefix.trim(),
            material == null ? "" : material.trim() });
    }

    /** configured material for a token, or null when the script did not touch it. */
    public static synchronized String materialFor(String token) {
        return token == null ? null : MATERIALS.get(token.trim());
    }

    public static synchronized int materialCount() {
        return MATERIALS.size();
    }

    public static synchronized int itemCount() {
        return ITEMS.size();
    }

    public static synchronized List<String[]> itemRules() {
        return new ArrayList<String[]>(ITEMS);
    }

    public static synchronized void clear() {
        MATERIALS.clear();
        ITEMS.clear();
    }

    /** one line per configured override, for the report. */
    public static synchronized String describe() {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> e : MATERIALS.entrySet()) {
            sb.append("  material ").append(e.getKey()).append(" -> ").append(e.getValue()).append('\n');
        }
        for (String[] r : ITEMS) {
            sb.append("  item ").append(r[0]).append(" -> ").append(r[1]).append('/').append(r[2]).append('\n');
        }
        return sb.toString();
    }
}
