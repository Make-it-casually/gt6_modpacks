package dshgt6bridge;

import java.util.ArrayList;
import java.util.List;

import gregapi.oredict.OreDictMaterial;
import gregapi.oredict.OreDictPrefix;
import net.minecraft.item.Item;
import net.minecraft.item.ItemStack;
import net.minecraftforge.oredict.OreDictionary;

/**
 * Item token parsing / resolution.
 *
 * tokens:
 *   mod:name[:meta]         exact item
 *   ore:&lt;OreDictName&gt;  every stack registered under that ore dictionary entry
 *   gt:&lt;prefix&gt;:&lt;material&gt;  the GT6 item for that prefix+material (gregapi.util.OM.get)
 */
public final class Items {

    private Items() {}

    public static String name(Object item) {
        if (item == null) return null;
        try {
            // SRG names: Item.field_150901_e = itemRegistry, func_148750_c = getNameForObject
            String s = Item.field_150901_e.func_148750_c(item);
            return s;
        } catch (Throwable t) {
            return null;
        }
    }

    public static String id(ItemStack stack) {
        if (stack == null) return "null";
        String n = name(stack.func_77973_b());
        int meta = 0;
        try { meta = stack.func_77960_j(); } catch (Throwable ignored) {}
        return (n == null ? "unknown" : n) + (meta == 0 ? "" : ":" + meta);
    }

    public static String modid(ItemStack stack) {
        String n = stack == null ? null : name(stack.func_77973_b());
        if (n == null) return "unknown";
        int i = n.indexOf(':');
        return i < 0 ? n : n.substring(0, i);
    }

    public static ItemStack make(Item item, int size, int meta) {
        try {
            return new ItemStack(item, size, meta);
        } catch (Throwable t) {
            return null;
        }
    }

    /** Resolves a single (non 'ore:') token. Returns null when the item does not exist. */
    public static ItemStack stack(String token) {
        if (token == null) return null;
        token = token.trim();
        if (token.isEmpty()) return null;
        if (token.startsWith("gt:")) {
            String[] p = token.split(":");
            if (p.length < 3) return null;
            OreDictPrefix prefix = Gt6.prefix(p[1]);
            OreDictMaterial material = Gt6.material(p[2]);
            if (prefix == null || material == null) return null;
            return Gt6.gtStack(prefix, material, 1);
        }
        String[] p = token.split(":");
        if (p.length < 2) return null;
        Item item = null;
        try {
            Object o = Item.field_150901_e.func_82594_a(p[0] + ":" + p[1]);
            if (o instanceof Item) item = (Item) o;
        } catch (Throwable ignored) {}
        if (item == null) return null;
        int meta = 0;
        if (p.length > 2) {
            try { meta = Integer.parseInt(p[2]); } catch (Throwable ignored) {}
        }
        return make(item, 1, meta);
    }

    /** Resolves any token, expanding 'ore:' to all registered stacks. */
    public static List<ItemStack> resolve(String token) {
        List<ItemStack> out = new ArrayList<ItemStack>();
        if (token == null) return out;
        token = token.trim();
        if (token.isEmpty()) return out;
        if (token.startsWith("ore:")) {
            String ore = token.substring(4).trim();
            try {
                List<ItemStack> l = OreDictionary.getOres(ore, false);
                if (l != null) for (ItemStack s : l) if (s != null) out.add(s);
            } catch (Throwable ignored) {}
            return out;
        }
        ItemStack s = stack(token);
        if (s != null) out.add(s);
        return out;
    }

    /**
     * Expands a removal selector into concrete candidate stacks (needed by the mods whose
     * removal API takes an ItemStack): exact item, mod:*, *:name, *:* and ore:&lt;name&gt;.
     * Wildcard selectors also try item metadata 0..15, because a mod's recipes often output
     * a specific variant.
     */
    public static List<ItemStack> candidates(String selector) {
        List<ItemStack> out = new ArrayList<ItemStack>();
        if (selector == null) return out;
        selector = selector.trim();
        if (selector.isEmpty()) return out;
        if (selector.indexOf('|') >= 0) {
            String[] alternatives = selector.split("\\|");
            for (String alternative : alternatives) {
                for (ItemStack candidate : candidates(alternative)) {
                    boolean duplicate = false;
                    for (ItemStack existing : out) {
                        if (sameItem(existing, candidate)) {
                            duplicate = true;
                            break;
                        }
                    }
                    if (!duplicate) out.add(candidate);
                }
            }
            return out;
        }
        if (selector.startsWith("ore:")) return resolve(selector);
        String[] sel = selector.split(":");
        boolean wildcardMod = sel.length > 0 && "*".equals(sel[0]);
        boolean wildcardName = sel.length > 1 && sel[1].indexOf('*') >= 0;
        boolean allItems = wildcardMod && sel.length > 1 && "*".equals(sel[1]);
        if (sel.length < 2 || (!wildcardMod && !wildcardName)) {
            ItemStack s = stack(selector);
            if (s != null) out.add(s);
            return out;
        }
        int explicitMeta = -1;
        if (sel.length > 2 && !sel[2].trim().isEmpty()) {
            try {
                explicitMeta = Integer.parseInt(sel[2].trim());
            } catch (Throwable ignored) {}
        }
        int[] metas;
        if (explicitMeta >= 0) metas = new int[] { explicitMeta };
        else metas = new int[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 };

        try {
            java.util.Set keys = Item.field_150901_e.func_148742_b(); // MCP: itemRegistry.getKeys()
            if (keys == null) return out;
            for (Object keyObj : keys) {
                String key = String.valueOf(keyObj);
                int colon = key.indexOf(':');
                if (colon < 0) continue;
                String keyMod = key.substring(0, colon);
                String keyName = key.substring(colon + 1);
                if (!wildcardMod && !keyMod.equalsIgnoreCase(sel[0])) continue;
                if (!nameMatches(keyName, sel[1])) continue;
                Object o = Item.field_150901_e.func_82594_a(key);
                if (!(o instanceof Item)) continue;
                for (int meta : metas) {
                    ItemStack s = make((Item) o, 1, meta);
                    if (s != null) out.add(s);
                    if (!allItems && out.size() >= 8192) return out;
                }
            }
        } catch (Throwable ignored) {}
        return out;
    }

    /** Splits an input/output list like "ore:ingotIron+gt:dust:Iron". */
    public static List<String> tokens(String cell) {
        List<String> out = new ArrayList<String>();
        if (cell == null) return out;
        String[] parts = cell.split("\\+");
        for (String p : parts) {
            p = p.trim();
            if (!p.isEmpty()) out.add(p);
        }
        return out;
    }

    /** strips an optional "@chance" suffix from an output token. */
    public static String withoutChance(String token) {
        if (token == null) return null;
        int at = token.indexOf('@');
        return at > 0 ? token.substring(0, at).trim() : token.trim();
    }

    /**
     * GT6 chance value of an output token (10000 = 100%). A value up to 100 is read as percent
     * ("@50" = 50%), anything above as GT6's own unit ("@5000" = 50%, "@10000" = 100%).
     * Unit tested in test/TestMain.java.
     */
    public static long chanceOf(String token, long def) {
        if (token == null) return def;
        int at = token.indexOf('@');
        if (at < 0) return def;
        String part = token.substring(at + 1).trim();
        long value;
        try {
            value = Long.parseLong(part);
        } catch (Throwable t) {
            return def;
        }
        if (value < 0) return def;
        if (value <= 100) return value * 100L;
        return value;
    }

    /**
     * Name part matching for selectors: exact, '*' (anything) or a glob like 'ore*', 'ingot*'.
     */
    public static boolean nameMatches(String name, String pattern) {
        if (pattern == null || pattern.isEmpty() || "*".equals(pattern)) return true;
        if (name == null) return false;
        if (pattern.indexOf('*') < 0) return pattern.equalsIgnoreCase(name);
        StringBuilder rx = new StringBuilder("(?i)");
        for (int i = 0; i < pattern.length(); i++) {
            char c = pattern.charAt(i);
            if (c == '*') rx.append(".*");
            else rx.append(java.util.regex.Pattern.quote(String.valueOf(c)));
        }
        try {
            return name.matches(rx.toString());
        } catch (Throwable t) {
            return false;
        }
    }

    /**
     * selector matching for the removals table:
     *   mod:name[:meta] | mod:* | *:name | *:* | *:glob* | ore:&lt;OreDictName&gt;
     *   selector|selector for an explicit alternative list
     */
    public static boolean matches(String selector, ItemStack stack) {
        if (selector == null || stack == null) return false;
        selector = selector.trim();
        if (selector.isEmpty()) return false;
        if (selector.indexOf('|') >= 0) {
            for (String alternative : selector.split("\\|")) {
                if (matches(alternative, stack)) return true;
            }
            return false;
        }
        if (selector.startsWith("ore:")) {
            String ore = selector.substring(4).trim();
            try {
                List<ItemStack> l = OreDictionary.getOres(ore, false);
                if (l != null) {
                    for (ItemStack s : l) {
                        if (s == null) continue;
                        if (sameItem(s, stack)) return true;
                    }
                }
            } catch (Throwable ignored) {}
            return false;
        }
        String itemName = name(stack.func_77973_b());
        if (itemName == null) return false;
        String[] sel = selector.split(":");
        String[] own = itemName.split(":");
        String selMod = sel.length > 0 ? sel[0] : "*";
        String selName = sel.length > 1 ? sel[1] : "*";
        if (!"*".equals(selMod) && !selMod.equalsIgnoreCase(own[0])) return false;
        if (!nameMatches(own.length > 1 ? own[1] : "", selName)) return false;
        if (sel.length > 2) {
            int metaSel = -1;
            try { metaSel = Integer.parseInt(sel[2]); } catch (Throwable ignored) {}
            if (metaSel >= 0) {
                int meta;
                try { meta = stack.func_77960_j(); } catch (Throwable t) { meta = 0; }
                if (metaSel != meta) return false;
            }
        }
        return true;
    }

    public static boolean sameItem(ItemStack a, ItemStack b) {
        if (a == null || b == null) return false;
        try {
            if (a.func_77973_b() != b.func_77973_b()) return false;
            int ma = a.func_77960_j(), mb = b.func_77960_j();
            return ma == mb || ma == OreDictionary.WILDCARD_VALUE || mb == OreDictionary.WILDCARD_VALUE;
        } catch (Throwable t) {
            return false;
        }
    }
}
