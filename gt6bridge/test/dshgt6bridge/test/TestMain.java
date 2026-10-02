package dshgt6bridge.test;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.List;

import dshgt6bridge.Cfg;
import dshgt6bridge.Items;
import dshgt6bridge.LinkCheck;
import dshgt6bridge.Reflect;
import dshgt6bridge.Report;
import dshgt6bridge.Settings;

/**
 * Plain JVM self test for everything that does not need Minecraft running: CSV parsing,
 * default file creation, settings, report writing, token splitting and the reflection layer.
 *
 * Run with test.ps1 - it compiles the mod against the compile-time stubs and executes this
 * with "config" relative to a scratch directory.
 */
public final class TestMain {

    private static int checks;
    private static int failures;

    public static void main(String[] args) throws Exception {
        File base = new File(".").getAbsoluteFile();
        System.out.println("gt6bridge self test, working dir: " + base);

        testCsvParsing();
        testDefaultCreation();
        testSettings();
        testReport();
        testItemTokens();
        testPrefixSplit();
        testOverrides();
        testReflect();
        testLinkCheck();
        testConfigWatch();
        // must run last: it writes the report the python/powershell tools are tested against, and
        // the tests above write their own reports into the same scratch directory
        testToolsChainFixture();

        System.out.println();
        System.out.println("checks: " + checks + ", failures: " + failures);
        if (failures > 0) {
            System.out.println("SELFTEST FAILED");
            System.exit(1);
        }
        System.out.println("SELFTEST OK");
    }

    // ------------------------------------------------------------------ tests

    private static void testCsvParsing() throws Exception {
        write("config/gt6bridge/materials.csv",
            "# comment line\n" +
            "\n" +
            "Enderium,create\n" +
            "Signalum,create:Signalum,some note\n" +
            "  Spaced  ,  Lumium  ,\n" +
            "\"Quoted,Name\",-\n" +
            "Semi;Colon;Row\n" +
            "Tab\tSeparated\tRow\n");

        Cfg cfg = new Cfg();
        List<String[]> rows = cfg.read(Cfg.FILE_MATERIALS, Cfg.HEADER_MATERIALS);
        check("row count is 6 (comments and blank lines skipped)", rows.size() == 6);
        check("simple row parsed", rows.get(0).length == 2 && "Enderium".equals(rows.get(0)[0])
            && "create".equals(rows.get(0)[1]));
        check("3 cells parsed", rows.get(1).length == 3 && "some note".equals(rows.get(1)[2]));
        check("cells are trimmed", "Spaced".equals(rows.get(2)[0]) && "Lumium".equals(rows.get(2)[1]));
        check("quoted comma kept in one cell", rows.get(3).length == 2 && "Quoted,Name".equals(rows.get(3)[0]));
        check("semicolon separator detected", rows.get(4).length == 3 && "Colon".equals(rows.get(4)[1]));
        check("tab separator detected", rows.get(5).length == 3 && "Separated".equals(rows.get(5)[1]));
    }

    private static void testDefaultCreation() throws Exception {
        Cfg cfg = new Cfg();
        File f = cfg.file("removals.csv");
        if (f.exists()) f.delete();
        List<String[]> rows = cfg.read(Cfg.FILE_REMOVALS, Cfg.HEADER_REMOVALS);
        check("missing file is created", f.exists());
        check("created file only holds comments -> no rows", rows.isEmpty());
        String text = read(f);
        check("created file keeps the documented header", text.contains("gt6bridge recipe removals")
            && text.contains("enderio_sagmill"));
    }

    private static void testSettings() throws Exception {
        write("config/gt6bridge/settings.csv",
            "# test settings\n" +
            "dryRun,true\n" +
            "enableAutoRules,yes\n" +
            "bindOnlyWithGt6Item,false\n" +
            "bindLimit,25\n" +
            "skipMods, Foo , BAR ,\n" +
            "skipItems, *:itemAlloy:6 , EnderIO:* ,\n" +
            "onlyPrefixes, ingot , dust ,\n" +
            "unknownKey,true\n");
        Cfg cfg = new Cfg();
        Settings s = new Settings(cfg);
        check("explicit value read", s.getBool("dryRun"));
        check("'yes' counts as true", s.getBool("enableAutoRules"));
        check("explicit false overrides the default true", !s.getBool("bindOnlyWithGt6Item"));
        check("default applied when absent", s.getBool("enableMaterialBinding"));
        check("unknown key is false", !s.getBool("doesNotExist"));
        check("keys are case insensitive", s.getBool("DRYRUN"));
        check("removal dry run defaults to on", new Settings(new Cfg()).getBool("removalDryRun"));
        check("getInt default for a missing key", new Settings(new Cfg()).getInt("definitelyNotSet", 42) == 42);
        check("getInt reads a value", s.getInt("bindLimit", -1) == 25);
        check("getLong reads a value", s.getLong("bindLimit", -1L) == 25L);
        check("getInt falls back on garbage", s.getInt("unknownKey", 7) == 7);
        java.util.Set<String> set = s.getList("skipMods");
        check("getList splits, trims and lowercases",
            set.size() == 2 && set.contains("foo") && set.contains("bar"));
        check("getList of a missing key is empty", new Settings(new Cfg()).getList("nope").isEmpty());
        java.util.Set<String> skips = s.getList("skipItems");
        check("item selectors survive the CSV (globs and colons)",
            skips.size() == 2 && skips.contains("*:itemalloy:6") && skips.contains("enderio:*"));
        java.util.Set<String> prefixes = s.getList("onlyPrefixes");
        check("onlyPrefixes parsed", prefixes.size() == 2 && prefixes.contains("ingot") && prefixes.contains("dust"));
    }

    private static void testReport() throws Exception {
        Cfg cfg = new Cfg();
        Report rep = new Report();
        rep.phase("selftest");
        rep.count("bindings", 3);
        rep.binding("ingotEnderium", "EnderIO:itemAlloy:6", "ingot", "Enderium", false);
        rep.unknownMaterial("Unobtainium", "Avaritia:item:0");
        rep.recipeAdded("Crusher", "test -> test2");
        rep.recipeRemoved("te_pulverizer", "minecraft:iron_ore");
        rep.error("synthetic error");
        File out = rep.write(cfg.dir());
        check("report file written", out.exists());
        String text = read(out);
        // count("bindings", 3) plus one binding() call = 4
        check("counters present", text.contains("bindings: 4"));
        check("binding line present", text.contains("ingotEnderium"));
        check("unknown material listed", text.contains("Unobtainium"));
        check("recipe add/remove listed", text.contains("+ [Crusher]") && text.contains("- [te_pulverizer]"));
        check("errors counted", rep.errors() == 1 && text.contains("synthetic error"));
    }

    private static void testItemTokens() {
        List<String> t = Items.tokens("ore:ingotIron + gt:dust:Iron+ EnderIO:itemAlloy:6 ");
        check("token count", t.size() == 3);
        check("token 0", "ore:ingotIron".equals(t.get(0)));
        check("token 1", "gt:dust:Iron".equals(t.get(1)));
        check("token 2", "EnderIO:itemAlloy:6".equals(t.get(2)));
        check("empty cell -> no tokens", Items.tokens("").isEmpty());
        check("null safe", Items.tokens(null).isEmpty());
        // selector name matching (globs for the removals table)
        check("exact name matches", Items.nameMatches("itemAlloy", "itemAlloy"));
        check("glob matches prefix", Items.nameMatches("oreCopper", "ore*"));
        check("glob is case insensitive", Items.nameMatches("OREcopper", "ore*"));
        check("glob matches middle", Items.nameMatches("itemDustGold", "*Dust*"));
        check("'*' matches anything", Items.nameMatches("whatever", "*"));
        check("no false positive", !Items.nameMatches("ingotIron", "ore*"));
        check("null name is safe", !Items.nameMatches(null, "ore*"));
        // no registry in the stub environment: both must return without throwing
        check("resolve is null safe", Items.resolve(null).isEmpty());
        check("matches is null safe", !Items.matches("mod:*", null));
        check("candidates is null safe", Items.candidates(null).isEmpty());
        // chance suffix parsing for recipes.csv outputs
        check("no suffix keeps the default", Items.chanceOf("minecraft:iron_ingot", 10000L) == 10000L);
        check("percent form", Items.chanceOf("minecraft:gold_ingot@50", 10000L) == 5000L);
        check("GT6 unit form", Items.chanceOf("minecraft:gold_ingot@5000", 10000L) == 5000L);
        check("10000 is 100%", Items.chanceOf("x@10000", 0L) == 10000L);
        check("zero chance", Items.chanceOf("x@0", 10000L) == 0L);
        check("garbage falls back", Items.chanceOf("x@abc", 10000L) == 10000L);
        check("negative falls back", Items.chanceOf("x@-5", 10000L) == 10000L);
        check("token without chance", "minecraft:iron_ingot".equals(Items.withoutChance("minecraft:iron_ingot@50")));
        check("token with chance", "minecraft:iron_ingot".equals(Items.withoutChance("minecraft:iron_ingot")));
    }

    private static void testReflect() {
        check("class lookup", Reflect.cls("java.lang.String") != null);
        check("missing class -> null", Reflect.cls("does.not.Exist") == null);
        check("present()", Reflect.present("java.util.List") && !Reflect.present("does.not.Exist"));
        Object sub = Reflect.call("abcdef", "substring", Integer.valueOf(2));
        check("method call by name/arity", "cdef".equals(sub));
        Object len = Reflect.call("abcdef", "length");
        check("no-arg method call", Integer.valueOf(6).equals(len));
        check("method() finds overload", Reflect.method(String.class, "substring", new Object[] { Integer.valueOf(1) }) != null);
        check("has()", Reflect.has(String.class, "substring", 1) && !Reflect.has(String.class, "substring", 5));
        check("hasSignature exact match", Reflect.hasSignature(String.class, "substring", int.class));
        check("hasSignature rejects wrong parameter type",
            !Reflect.hasSignature(String.class, "substring", String.class));
        check("hasSignature on inherited member",
            Reflect.hasSignature(java.util.ArrayList.class, "size"));
        check("hasCtor", Reflect.hasCtor(java.util.ArrayList.class, java.util.Collection.class)
            && !Reflect.hasCtor(java.util.ArrayList.class, String.class, String.class));
        check("hasField", Reflect.hasField(String.class, "value", null));
        check("hasField type check", Reflect.hasField(Pojo.class, "STATIC", String.class)
            && !Reflect.hasField(Pojo.class, "STATIC", Integer.class));
        check("call on null target is safe", Reflect.call(null, "anything") == null);
        Pojo p = new Pojo();
        check("pick() prefers getter", "out".equals(Reflect.pick(p, "getOutput", "output")));
        check("field access", "hidden".equals(Reflect.field(p, "secret")));
        check("static field access", Reflect.staticField(Pojo.class, "STATIC") != null);
        check("callStatic", "static!".equals(Reflect.callStatic(Pojo.class, "hello")));

        // primitive / boxed / varargs handling (mod APIs rely on this)
        java.util.List<String> list = new java.util.ArrayList<String>();
        list.add("a");
        list.add("b");
        check("boxed int parameter", "a".equals(Reflect.call(list, "get", Integer.valueOf(0))));
        Object removed = Reflect.call(list, "remove", "a");
        check("Object parameter still matches remove(Object)", Boolean.TRUE.equals(removed) && list.size() == 1);
        Object numbered = Reflect.call(p, "scaled", Float.valueOf(2.0F), new Object[] { "x", "y" });
        check("boxed float + typed array (varargs) call", Float.valueOf(6.0F).equals(numbered));
        check("has() counts arity only", Reflect.has(Pojo.class, "scaled", 2));
    }

    private static void testLinkCheck() throws Exception {
        Cfg cfg = new Cfg();
        Report rep = new Report();
        rep.phase("selftest");
        LinkCheck.run(rep);
        // against our own stubs every link resolves; in game the same run checks the real classes
        check("link check: no failure against the stubs", LinkCheck.failureCount() == 0);
        check("link check: ore dictionary ok", LinkCheck.ok("forge.oredict"));
        check("link check: crafting + furnace ok",
            LinkCheck.ok("vanilla.crafting") && LinkCheck.ok("vanilla.furnace"));
        check("link check: item stack + registry ok",
            LinkCheck.ok("vanilla.itemstack") && LinkCheck.ok("vanilla.registry"));
        File out = rep.write(cfg.dir());
        String text = read(out);
        check("link section written to the report", text.contains("runtime link check"));
        check("link failure counter written", text.contains("links.failed: 0"));
    }

    private static void testConfigWatch() throws Exception {
        Cfg cfg = new Cfg();
        long before = cfg.lastModified();
        check("lastModified sees the tables", before > 0);
        Thread.sleep(1100L); // filesystem timestamp resolution
        write("config/gt6bridge/recipes.csv", "# edited by the self test\n");
        check("editing a table is noticed", cfg.lastModified() > before);
    }

    private static void testPrefixSplit() {
        // the practical prefix order (longest first) that the mod builds per first letter
        java.util.List<String> prefixes = java.util.Arrays.asList(
            "dustSmall", "dustTiny", "dust", "ingotDouble", "ingotHot", "ingot", "oreNether", "ore", "plateDouble", "plate");

        String[] hit = dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "dustSmallSignalum");
        check("longest prefix wins (dustSmall)", hit != null && "dustSmall".equals(hit[0]) && "Signalum".equals(hit[1]));

        hit = dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "dustTinyGold");
        check("dustTiny split", hit != null && "dustTiny".equals(hit[0]) && "Gold".equals(hit[1]));

        hit = dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "ingotIron");
        check("simple split", hit != null && "ingot".equals(hit[0]) && "Iron".equals(hit[1]));

        hit = dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "oreNetherCopper");
        check("oreNether split", hit != null && "oreNether".equals(hit[0]) && "Copper".equals(hit[1]));

        check("lower case remainder is rejected",
            dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "ingotiron") == null);
        check("digits-only remainder is rejected",
            dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "ingot123") == null);
        check("exact prefix without material is rejected",
            dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "ingot") == null);
        check("unknown prefix is rejected",
            dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "zundaBlock") == null);
        check("empty input is rejected",
            dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "") == null
                && dshgt6bridge.MaterialBinder.splitPrefix(null, "ingotIron") == null);
        check("case insensitive prefix match",
            dshgt6bridge.MaterialBinder.splitPrefix(prefixes, "INGOTIron") != null);
    }

    private static void testOverrides() {
        dshgt6bridge.Overrides.clear();
        dshgt6bridge.Overrides.bindMaterial("Enderium", "Enderium");
        dshgt6bridge.Overrides.skipMaterial("TofuMetal");
        dshgt6bridge.Overrides.bindItem("EnderIO:itemAlloy:6", "ingot", "Enderium");
        dshgt6bridge.Overrides.bindMaterial("   ", "ignored");
        dshgt6bridge.Overrides.bindItem(null, "ingot", "Iron");

        check("script binding stored", "Enderium".equals(dshgt6bridge.Overrides.materialFor("Enderium")));
        check("script skip stored as '-'", "-".equals(dshgt6bridge.Overrides.materialFor("TofuMetal")));
        check("untouched token has no override", dshgt6bridge.Overrides.materialFor("Nope") == null);
        check("blank token ignored", dshgt6bridge.Overrides.materialCount() == 2);
        check("item rule counted", dshgt6bridge.Overrides.itemCount() == 1);
        java.util.List<String[]> rules = dshgt6bridge.Overrides.itemRules();
        check("item rule contents", rules.size() == 1 && "EnderIO:itemAlloy:6".equals(rules.get(0)[0])
            && "ingot".equals(rules.get(0)[1]) && "Enderium".equals(rules.get(0)[2]));
        String described = dshgt6bridge.Overrides.describe();
        check("describe lists material and item rules",
            described.contains("material Enderium -> Enderium")
                && described.contains("item EnderIO:itemAlloy:6 -> ingot/Enderium"));
        dshgt6bridge.Overrides.clear();
        check("clear empties the table",
            dshgt6bridge.Overrides.materialCount() == 0 && dshgt6bridge.Overrides.itemCount() == 0);
    }

    /**
     * Writes a realistic report through the mod's own Report class, so test.ps1 can run the
     * analyzer and the acceptance check against a file in exactly the production format.
     */
    private static void testToolsChainFixture() throws Exception {
        Report rep = new Report();
        rep.count("links.failed", 0);
        rep.count("oredict.names", 300955);
        rep.count("oredict.stacks", 412330);
        rep.count("gt6.prefixes", 453);
        rep.count("materials.table.rows", 11);
        rep.count("alreadyBound", 9021);
        rep.count("skipped.gt6OwnItems", 388412);
        rep.count("skipped.noGt6Item", 1020);
        rep.count("skipped.lockedAutoInvalid", 7);
        rep.count("timing.materialPass.ms", 8421);
        rep.count("timing.linkCheck.ms", 24);
        rep.count("timing.recipeReInit.ms", 263);

        for (int i = 0; i < 250; i++) {
            rep.binding("ingotTest" + i, "TestMod:ingot" + i, "ingot", "Iron", false);
            rep.count("bound.byPrefix.ingot");
            rep.count("bound.byMod.TestMod");
            if (i != 0) rep.count("bindings.verified");
        }
        rep.count("bindings.verifyFailed", 1);

        rep.unknownMaterial("Cobaltum", "GalaxySpace:oreCobaltum");
        rep.unknownMaterial("Cobaltum", "GalaxySpace:ingotCobaltum");
        rep.unknownMaterial("Cobaltum", "GalaxySpace:blockCobaltum");
        rep.unknownMaterial("TofuMetal", "TofuCraft:item.tofuMetal");
        rep.unknownMaterial("Fronisium", "MorePlanets:item.fronisiumIngot");
        rep.unparsedOre("zundaBlock");
        rep.unparsedOre("uranium");
        rep.skipped("ingotTofuMetal", "TofuCraft:item.tofuMetal", "materials.csv skip");

        rep.recipeRemoved("te_pulverizer", "would remove *:ore* (12)");
        for (int i = 0; i < 12; i++) rep.recipeRemoved("te_pulverizer", "would remove ore " + i);
        for (int i = 0; i < 5; i++) rep.recipeRemoved("ic2_macerator", "would remove ore " + i);
        rep.count("removed.total", 17);
        rep.recipeAdded("Smelter", "gt:dust:Iron -> gt:ingot:Iron  [32t, 16EU/t]");
        rep.count("autorules.added", 1);
        rep.note("scan budget of 20000 ms reached after 300955 ore dictionary names");

        File out = rep.write(new File("config/gt6bridge"));
        check("fixture report written", out != null && out.isFile() && out.length() > 500);
        String text = read(out);
        check("fixture has the counter block", text.contains("links.failed: 0") && text.contains("bindings: 250"));
        check("fixture has an unknown token line with count and example",
            text.contains("  Cobaltum : 3 item(s)   e.g. GalaxySpace:oreCobaltum"));
        check("fixture has a removed per backend block",
            text.contains("-- removed per backend --") && text.contains("  te_pulverizer: 13"));
        check("fixture has no error section entries",
            text.indexOf("-- errors --") > 0 && text.substring(text.indexOf("-- errors --")).trim()
                .equals("-- errors --"));
        write("config/gt6bridge/settings.csv",
            "# fixture settings - all keys the mod knows\n"
                + "enableMaterialBinding,true\nbindOnlyWithGt6Item,true\nenableMaterialCreation,true\n"
                + "dryRun,false\nremovalDryRun,true\nbindLimit,0\nscanBudgetMs,20000\n"
                + "skipMods,\nskipItems,\nonlyPrefixes,\nlogEveryBinding,false\nenableAutoRules,false\n");
        write("config/gt6bridge/materials.csv",
            "# fixture material table\nCobaltum,Cobalt,fixture alias\nTofuMetal,-,fixture skip\n");
        write("config/gt6bridge/recipes.csv",
            "# fixture recipes\nSmelter,gt:dust:Iron,gt:ingot:Iron,16,32,true,fixture\n");
        write("config/gt6bridge/removals.csv",
            "# fixture removals\nte_pulverizer,*:ore*\nic2_macerator,*:ore*\n");
        write("config/gt6bridge/autorules.csv",
            "# fixture auto rules\ndust,Smelter,ingot,1,16,32,true,false\n");
        check("fixture settings written", new File("config/gt6bridge/settings.csv").isFile());
    }

    // ------------------------------------------------------------------ helpers
    public static final class Pojo {
        public static final String STATIC = "s";
        private final String secret = "hidden";

        public String getOutput() {
            return "out";
        }

        public static String hello() {
            return "static!";
        }

        /** mimics EnderIO's IMachineRecipe.getCompletedResult(float, MachineRecipeInput...) shape. */
        public float scaled(float factor, String... rest) {
            return factor * (rest == null ? 1 : rest.length + 1);
        }
    }

    private static void check(String what, boolean ok) {
        checks++;
        if (!ok) {
            failures++;
            System.out.println("  FAIL  " + what);
        } else {
            System.out.println("  ok    " + what);
        }
    }

    private static void write(String path, String content) throws Exception {
        File f = new File(path);
        File dir = f.getParentFile();
        if (dir != null && !dir.exists()) dir.mkdirs();
        Writer w = new OutputStreamWriter(new FileOutputStream(f), "UTF-8");
        w.write(content);
        w.close();
    }

    private static String read(File f) throws Exception {
        StringBuilder sb = new StringBuilder();
        java.io.BufferedReader r = new java.io.BufferedReader(
            new java.io.InputStreamReader(new java.io.FileInputStream(f), "UTF-8"));
        String line;
        while ((line = r.readLine()) != null) sb.append(line).append('\n');
        r.close();
        return sb.toString();
    }
}
