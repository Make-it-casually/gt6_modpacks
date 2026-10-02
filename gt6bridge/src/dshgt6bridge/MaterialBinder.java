package dshgt6bridge;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gregapi.oredict.OreDictItemData;
import gregapi.oredict.OreDictMaterial;
import gregapi.oredict.OreDictPrefix;
import net.minecraft.item.ItemStack;
import net.minecraftforge.oredict.OreDictionary;

/**
 * Pass 1: walks the whole ore dictionary, splits every name into GT6 prefix + material
 * token and binds the foreign stacks to GT6's material system.
 *
 * GT6 already parses the ore dictionary itself, but names whose material it does not
 * know end up as "auto invalid" materials - those are exactly the gaps this pass fills.
 * config/gt6bridge/materials.csv can force a mapping or skip a token.
 */
public final class MaterialBinder {

    /** a successful binding: foreign stack == prefix of material, used by the auto rules pass. */
    public static final class Binding {
        public final String prefixName;
        public final OreDictMaterial material;
        public final ItemStack stack;

        public Binding(String prefixName, OreDictMaterial material, ItemStack stack) {
            this.prefixName = prefixName;
            this.material = material;
            this.stack = stack;
        }
    }

    private final Cfg cfg;
    private final Report rep;
    private final Settings settings;
    private final List<Binding> bindingList = new ArrayList<Binding>();

    private final Map<String, String> overrides = new HashMap<String, String>();
    private final Map<String, String> notes = new HashMap<String, String>();

    public MaterialBinder(Cfg cfg, Report rep, Settings settings) {
        this.cfg = cfg;
        this.rep = rep;
        this.settings = settings;
    }

    public List<Binding> bindings() {
        return bindingList;
    }

    public void loadTable() {        for (String[] row : cfg.read(Cfg.FILE_MATERIALS, Cfg.HEADER_MATERIALS)) {
            if (row.length < 2) continue;
            String token = row[0].trim();
            String target = row[1].trim();
            if (token.isEmpty() || token.startsWith("<")) continue;
            overrides.put(token, target);
            if (row.length > 2 && !row[2].trim().isEmpty()) notes.put(token, row[2].trim());
        }
        rep.count("materials.table.rows", overrides.size());
    }

    public void run() {
        if (!LinkCheck.ok("forge.oredict")) {
            rep.error("material pass skipped: the ore dictionary link check failed (see report)");
            return;
        }
        if (!settings.getBool("enableMaterialBinding")) {
            rep.note("material binding disabled by settings.csv (enableMaterialBinding=false)");
            return;
        }
        final boolean dryRun = settings.getBool("dryRun");
        final boolean requireGtItem = settings.getBool("bindOnlyWithGt6Item");
        final boolean logEach = settings.getBool("logEveryBinding");
        final int bindLimit = settings.getInt("bindLimit", 0);
        final long scanBudgetMs = settings.getLong("scanBudgetMs", 20000L);
        final java.util.Set<String> skipMods = settings.getList("skipMods");
        final java.util.Set<String> skipItems = settings.getList("skipItems");
        final java.util.Set<String> onlyPrefixes = settings.getList("onlyPrefixes");
        if (!skipMods.isEmpty()) rep.note("skipMods=" + skipMods + " - items of those mods are not bound");
        if (!skipItems.isEmpty()) rep.note("skipItems=" + skipItems + " - those items are not bound");
        if (!onlyPrefixes.isEmpty()) rep.note("onlyPrefixes=" + onlyPrefixes + " - other prefixes are skipped");
        if (dryRun) rep.note("dryRun=true - nothing is changed, the report only lists what would happen");
        if (bindLimit > 0) rep.note("bindLimit=" + bindLimit + " - binding stops after that many stacks");

        OreDictPrefix[] prefixes = sortedPrefixes();
        if (prefixes.length == 0) {
            rep.error("no GT6 ore dictionary prefixes found - GT6 API mismatch?");
            return;
        }
        buildBuckets(prefixes);
        rep.count("gt6.prefixes", prefixes.length);

        String[] oreNames;
        try {
            oreNames = OreDictionary.getOreNames();
        } catch (Throwable t) {
            rep.error("OreDictionary.getOreNames() failed: " + t);
            return;
        }
        if (oreNames == null) return;
        final long started = System.currentTimeMillis();
        // one stack is often registered under several ore dictionary names (ingotIron, ingotAnyIron,
        // ...); remember what this run already handled so the second attempt is not mistaken for a
        // stack GT6 had locked with auto-generated data
        final java.util.Set<String> handledThisRun = new java.util.HashSet<String>();

        for (String ore : oreNames) {
            if (bindLimit > 0 && bindingList.size() >= bindLimit) {
                rep.note("bindLimit reached (" + bindingList.size() + " bindings), stopping the scan");
                break;
            }
            if (scanBudgetMs > 0 && (System.currentTimeMillis() - started) > scanBudgetMs) {
                rep.note("scan budget of " + scanBudgetMs + " ms reached after "
                    + rep.counters().get("oredict.names") + " ore dictionary names, stopping the scan"
                    + " (raise scanBudgetMs in settings.csv to scan everything)");
                break;
            }
            if (ore == null || ore.isEmpty()) continue;
            rep.count("oredict.names");

            // parse BEFORE asking the ore dictionary for the item list: the pack registers ~300k
            // names and most of them do not even start with a GT6 prefix, so those cost nothing
            Parsed p = parse(ore, prefixes);
            if (p == null) {
                rep.unparsedOre(ore);
                continue;
            }

            List<ItemStack> stacks;
            try {
                stacks = OreDictionary.getOres(ore, false);
            } catch (Throwable t) {
                continue;
            }
            if (stacks == null || stacks.isEmpty()) continue;
            rep.count("oredict.stacks", stacks.size());

            if (!onlyPrefixes.isEmpty() && !onlyPrefixes.contains(p.prefixName.toLowerCase())) {
                rep.count("skipped.prefixFiltered");
                continue;
            }

            String token = p.materialToken;
            // script overrides (CraftTweaker Bridge.bind/skip) win over materials.csv
            String override = Overrides.materialFor(token);
            String overrideSource = "script";
            if (override == null) {
                override = overrides.get(token);
                overrideSource = "materials.csv";
            }
            if ("-".equals(override)) {
                for (ItemStack s : stacks) {
                    rep.skipped(ore, Items.id(s), overrideSource + " skip" + note(token));
                }
                continue;
            }
            String target = override != null && !override.isEmpty() ? override : token;
            OreDictMaterial material = Gt6.material(target);
            if (material == null) {
                for (ItemStack s : stacks) rep.unknownMaterial(token, Items.id(s));
                continue;
            }
            for (ItemStack stack : stacks) {
                if (stack == null) continue;
                String modid = Items.modid(stack);
                if ("gregtech".equalsIgnoreCase(modid) || "gregapi".equalsIgnoreCase(modid)) {
                    rep.count("skipped.gt6OwnItems");
                    continue;
                }
                if (skipMods.contains(modid.toLowerCase())) {
                    rep.count("skipped.byMod." + modid);
                    continue;
                }
                if (!skipItems.isEmpty() && matchesAnySelector(skipItems, stack)) {
                    rep.count("skipped.byItem");
                    continue;
                }
                // per item rules from scripts / config: selector -> prefix + material
                OreDictPrefix bindPrefix = p.prefix;
                OreDictMaterial bindMaterial = material;
                String bindLabel = p.prefixName;
                String bindTarget = target;
                String[] rule = itemRuleFor(stack);
                if (rule != null) {
                    OreDictPrefix rp = Gt6.prefix(rule[1]);
                    OreDictMaterial rm = Gt6.material(rule[2]);
                    if (rp != null && rm != null) {
                        bindPrefix = rp;
                        bindMaterial = rm;
                        bindLabel = rp.mNameInternal;
                        bindTarget = rm.mNameInternal;
                        rep.count("bindings.byItemRule");
                    } else {
                        rep.error("item rule '" + rule[0] + "' has unknown prefix/material: "
                            + rule[1] + "/" + rule[2]);
                    }
                }
                if (Gt6.hasValidData(stack)) {
                    rep.count("alreadyBound");
                    continue;
                }
                String stackKey = Items.id(stack);
                if (handledThisRun.contains(stackKey)) {
                    rep.count("skipped.alreadyHandledThisRun");
                    continue;
                }
                handledThisRun.add(stackKey);
                if (requireGtItem && Gt6.gtStack(bindPrefix, bindMaterial, 1) == null) {
                    rep.count("skipped.noGt6Item");
                    rep.count("skipped.noGt6Item." + bindTarget);
                    continue;
                }
                boolean overwrite = Gt6.data(stack) != null;
                if (overwrite) {
                    // GT6 already stored (auto generated, invalid) data for this stack. setItemData_
                    // refuses to replace a non Wood binding, so this cannot be fixed at runtime -
                    // it needs the material to exist before GT6 parses the ore dictionary (PreInit
                    // "create:" rows). Counted separately so it does not look like a real failure.
                    rep.count("skipped.lockedAutoInvalid");
                    if (rep.counters().get("skipped.lockedAutoInvalid").intValue() <= 20) {
                        rep.note("cannot re-bind " + Items.id(stack) + " (" + ore + "): GT6 already stored "
                            + "auto-generated material data; use a materials.csv 'create:' row instead");
                    }
                    continue;
                }
                if (dryRun) {
                    rep.binding(ore, Items.id(stack), bindLabel, bindTarget, false);
                    rep.count("bindings.dryRun");
                    continue;
                }
                if (Gt6.bind(stack, bindPrefix, bindMaterial)) {
                    rep.binding(ore, Items.id(stack), bindLabel, bindTarget, false);
                    rep.count("bound.byPrefix." + bindLabel);
                    rep.count("bound.byMod." + Items.modid(stack));
                    bindingList.add(new Binding(bindLabel, bindMaterial, stack));
                    // read the data back: proves GT6 really stored the binding
                    if (Gt6.sameMaterial(Gt6.data(stack), bindMaterial)) {
                        rep.count("bindings.verified");
                    } else {
                        rep.count("bindings.verifyFailed");
                    }
                    if (logEach) {
                        cpw.mods.fml.common.FMLLog.info("[%s] bound %s -> %s/%s",
                            GT6Bridge.MODID, Items.id(stack), bindLabel, bindTarget);
                    }
                } else {
                    rep.error("bind failed: " + ore + " -> " + Items.id(stack));
                }
            }
        }
    }

    private String note(String token) {
        String n = notes.get(token);
        return n == null || n.isEmpty() ? "" : " (" + n + ")";
    }

    /** first script/config item rule matching the stack, or null. */
    private static String[] itemRuleFor(ItemStack stack) {
        for (String[] rule : Overrides.itemRules()) {
            if (rule == null || rule.length < 3) continue;
            if (Items.matches(rule[0], stack)) return rule;
        }
        return null;
    }

    /** true when any of the configured item selectors matches the stack. */
    private static boolean matchesAnySelector(java.util.Set<String> selectors, ItemStack stack) {
        for (String sel : selectors) {
            if (Items.matches(sel, stack)) return true;
        }
        return false;
    }

    private static OreDictPrefix[] sortedPrefixes() {
        List<OreDictPrefix> list = new ArrayList<OreDictPrefix>();
        try {
            for (OreDictPrefix p : OreDictPrefix.VALUES) if (p != null && p.mNameInternal != null) list.add(p);
        } catch (Throwable ignored) {}
        if (list.isEmpty()) {
            try {
                for (Map.Entry<String, OreDictPrefix> e : OreDictPrefix.sPrefixes.entrySet()) {
                    if (e.getValue() != null && e.getValue().mNameInternal != null) list.add(e.getValue());
                }
            } catch (Throwable ignored) {}
        }
        OreDictPrefix[] arr = list.toArray(new OreDictPrefix[list.size()]);
        Arrays.sort(arr, new Comparator<OreDictPrefix>() {
            @Override
            public int compare(OreDictPrefix a, OreDictPrefix b) {
                return b.mNameInternal.length() - a.mNameInternal.length();
            }
        });
        return arr;
    }

    private static final class Parsed {
        OreDictPrefix prefix;
        String prefixName;
        String materialToken;
    }

    /** prefixes grouped by their first letter: with ~300k ore names a full 453 prefix scan is too slow. */
    private final Map<Character, List<String>> prefixBuckets = new HashMap<Character, List<String>>();
    private final Map<String, OreDictPrefix> prefixByName = new HashMap<String, OreDictPrefix>();

    private void buildBuckets(OreDictPrefix[] all) {
        prefixBuckets.clear();
        prefixByName.clear();
        for (OreDictPrefix p : all) {
            String n = p.mNameInternal;
            if (n == null || n.isEmpty()) continue;
            Character key = Character.valueOf(Character.toLowerCase(n.charAt(0)));
            List<String> bucket = prefixBuckets.get(key);
            if (bucket == null) {
                bucket = new ArrayList<String>();
                prefixBuckets.put(key, bucket);
            }
            bucket.add(n);
            prefixByName.put(n, p);
        }
    }

    /**
     * Pure string part of the prefix split (unit tested in test/TestMain.java):
     * longest-prefix match where the remainder must start with an upper case letter,
     * so "dustSmallSignalum" becomes "dustSmall" + "Signalum" and not "dust" + "SmallSignalum".
     * Prefix names must be ordered longest first.
     */
    public static String[] splitPrefix(List<String> prefixNamesLongestFirst, String oreName) {
        if (prefixNamesLongestFirst == null || oreName == null || oreName.isEmpty()) return null;
        for (String name : prefixNamesLongestFirst) {
            if (name == null || name.isEmpty()) continue;
            if (oreName.length() <= name.length()) continue;
            if (!oreName.regionMatches(true, 0, name, 0, name.length())) continue;
            String rest = oreName.substring(name.length());
            if (rest.isEmpty()) continue;
            char c = rest.charAt(0);
            if (!Character.isLetter(c) && !Character.isDigit(c)) continue;
            if (!Character.isUpperCase(c)) continue;
            if (isDigitsOnly(rest)) continue;
            return new String[] { name, rest };
        }
        return null;
    }

    /** resolves an ore dictionary name to prefix + material token using the pre-built buckets. */
    private Parsed parse(String oreName, OreDictPrefix[] unused) {
        if (oreName == null || oreName.isEmpty()) return null;
        List<String> bucket = prefixBuckets.get(Character.valueOf(Character.toLowerCase(oreName.charAt(0))));
        String[] hit = splitPrefix(bucket, oreName);
        if (hit == null) return null;
        Parsed p = new Parsed();
        p.prefixName = hit[0];
        p.materialToken = hit[1];
        p.prefix = prefixByName.get(hit[0]);
        return p.prefix == null ? null : p;
    }

    private static boolean isDigitsOnly(String s) {
        for (int i = 0; i < s.length(); i++) if (!Character.isDigit(s.charAt(i))) return false;
        return true;
    }

    /** used by the report to show what a token would be bound to. */
    public String overrideFor(String token) {
        return overrides.get(token);
    }

    public static OreDictMaterial materialOf(ItemStack stack) {
        return Gt6.materialOf(Gt6.data(stack));
    }

    public static OreDictItemData dataOf(ItemStack stack) {
        return Gt6.data(stack);
    }
}
