package dshgt6bridge;

import java.io.File;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import cpw.mods.fml.common.FMLLog;

/**
 * Collects everything the bridge did and writes config/gt6bridge/report.txt.
 * The report is the main artefact for iterating on the CSV tables: it lists the
 * bindings, the material tokens GT6 does not know and every recipe change.
 */
public final class Report {

    private static final int MAX_LIST_LINES = 4000;

    private final List<String> lines = new ArrayList<String>();
    private final Map<String, Integer> unknownMaterials = new TreeMap<String, Integer>();
    private final Map<String, List<String>> unknownMaterialExamples = new TreeMap<String, List<String>>();
    private final Map<String, Integer> unparsedOres = new TreeMap<String, Integer>();
    private final Map<String, Integer> addedPerMap = new TreeMap<String, Integer>();
    private final Map<String, Integer> removedPerBackend = new TreeMap<String, Integer>();
    private final Map<String, Integer> counters = new LinkedHashMap<String, Integer>();
    private final List<String> errors = new ArrayList<String>();
    private final List<String> notes = new ArrayList<String>();
    private final List<String> bindings = new ArrayList<String>();
    private final List<String> skipped = new ArrayList<String>();
    private final List<String> recipes = new ArrayList<String>();

    private String phase = "?";

    public void phase(String p) {
        this.phase = p;
    }

    public void count(String key, int add) {
        Integer old = counters.get(key);
        counters.put(key, Integer.valueOf((old == null ? 0 : old.intValue()) + add));
    }

    public void count(String key) {
        count(key, 1);
    }

    public Map<String, Integer> counters() {
        return counters;
    }

    public void heading(String h) {
        lines.add("");
        lines.add("== " + h + " ==");
    }

    public void line(String s) {
        if (lines.size() < MAX_LIST_LINES) lines.add(s);
    }

    public void binding(String oreName, String itemId, String prefix, String material, boolean overwritten) {
        count("bindings");
        if (overwritten) count("bindings.overwrittenAutoInvalid");
        if (bindings.size() < MAX_LIST_LINES) {
            bindings.add("  " + oreName + "  ->  " + itemId + "  =  " + prefix + "/" + material
                + (overwritten ? "  (replaced auto-invalid binding)" : ""));
        }
    }

    public void skipped(String oreName, String itemId, String reason) {
        count("skipped");
        if (skipped.size() < MAX_LIST_LINES) skipped.add("  " + oreName + "  ->  " + itemId + "  :  " + reason);
    }

    /** dry run: records what the binding pass would do without counting it as a real binding. */
    public void wouldBind(String oreName, String itemId, String prefix, String material, boolean overwrite) {
        count("bindings.wouldBind");
        if (bindings.size() < MAX_LIST_LINES) {
            bindings.add("  (dry run) " + oreName + "  ->  " + itemId + "  =  " + prefix + "/" + material
                + (overwrite ? "  (would replace auto-invalid binding)" : ""));
        }
    }

    public void unknownMaterial(String token, String exampleItem) {
        Integer c = unknownMaterials.get(token);
        unknownMaterials.put(token, Integer.valueOf(c == null ? 1 : c.intValue() + 1));
        if (exampleItem != null) {
            List<String> ex = unknownMaterialExamples.get(token);
            if (ex == null) { ex = new ArrayList<String>(); unknownMaterialExamples.put(token, ex); }
            if (ex.size() < 3) ex.add(exampleItem);
        }
    }

    public void unparsedOre(String oreName) {
        Integer c = unparsedOres.get(oreName);
        unparsedOres.put(oreName, Integer.valueOf(c == null ? 1 : c.intValue() + 1));
    }

    public void recipeAdded(String mapName, String description) {
        Integer c = addedPerMap.get(mapName);
        addedPerMap.put(mapName, Integer.valueOf(c == null ? 1 : c.intValue() + 1));
        if (recipes.size() < MAX_LIST_LINES) recipes.add("  + [" + mapName + "] " + description);
    }

    public void recipeRemoved(String backend, String description) {
        Integer c = removedPerBackend.get(backend);
        removedPerBackend.put(backend, Integer.valueOf(c == null ? 1 : c.intValue() + 1));
        if (recipes.size() < MAX_LIST_LINES) recipes.add("  - [" + backend + "] " + description);
    }

    public void error(String message) {
        count("errors");
        if (errors.size() < 500) errors.add("  " + message);
    }

    public void note(String message) {
        if (notes.size() < 200) notes.add("  " + message);
    }

    public int errors() {
        Integer c = counters.get("errors");
        return c == null ? 0 : c.intValue();
    }

    /** keeps the report self describing: the counter is written even when nothing failed. */
    public void sealCounters() {
        count("errors", 0);
    }

    public File write(File dir) {
        sealCounters();
        File f = new File(dir, Cfg.FILE_REPORT);
        Writer w = null;
        try {
            w = new OutputStreamWriter(new java.io.FileOutputStream(f), "UTF-8");
            w.write("GT6 Recipe Bridge " + GT6Bridge.VERSION + " report\n");
            w.write("generated: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()) + "\n");
            w.write("phase: " + phase + "\n");
            for (Map.Entry<String, Integer> e : counters.entrySet()) {
                w.write(e.getKey() + ": " + e.getValue() + "\n");
            }
            w.write("\n-- unknown material tokens (add them to materials.csv) --\n");
            for (Map.Entry<String, Integer> e : unknownMaterials.entrySet()) {
                List<String> ex = unknownMaterialExamples.get(e.getKey());
                w.write("  " + e.getKey() + " : " + e.getValue() + " item(s)"
                    + (ex == null || ex.isEmpty() ? "" : "   e.g. " + ex.get(0)) + "\n");
            }
            w.write("\n-- ore dictionary names without a GT6 prefix --\n");
            int shown = 0;
            for (Map.Entry<String, Integer> e : unparsedOres.entrySet()) {
                if (shown++ >= 300) { w.write("  ... (" + (unparsedOres.size() - 300) + " more)\n"); break; }
                w.write("  " + e.getKey() + " : " + e.getValue() + "\n");
            }
            w.write("\n-- bindings --\n");
            for (String s : bindings) w.write(s + "\n");
            w.write("\n-- skipped --\n");
            for (String s : skipped) w.write(s + "\n");
            w.write("\n-- recipe changes --\n");
            for (String s : recipes) w.write(s + "\n");
            w.write("\n-- added per recipe map --\n");
            for (Map.Entry<String, Integer> e : addedPerMap.entrySet()) w.write("  " + e.getKey() + ": " + e.getValue() + "\n");
            w.write("\n-- removed per backend --\n");
            for (Map.Entry<String, Integer> e : removedPerBackend.entrySet()) w.write("  " + e.getKey() + ": " + e.getValue() + "\n");
            w.write("\n-- notes --\n");
            for (String s : notes) w.write(s + "\n");
            w.write("\n-- free form --\n");
            for (String s : lines) w.write(s + "\n");
            w.write("\n-- errors --\n");
            for (String s : errors) w.write(s + "\n");
            w.flush();
        } catch (Throwable t) {
            FMLLog.warn("[%s] could not write report: %s", GT6Bridge.MODID, t.toString());
        } finally {
            if (w != null) try { w.close(); } catch (Throwable ignored) {}
        }
        return f;
    }
}
