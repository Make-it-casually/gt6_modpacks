package dshgt6bridge;

import java.io.File;

import cpw.mods.fml.common.FMLLog;
import cpw.mods.fml.common.Loader;

/**
 * Resolves the gt6bridge config directory (config/gt6bridge) and loads the three
 * CSV tables. Missing files are created with a documented header so the format is
 * self explanatory.
 */
public final class Cfg {

    public static final String FILE_MATERIALS = "materials.csv";
    public static final String FILE_RECIPES = "recipes.csv";
    public static final String FILE_REMOVALS = "removals.csv";
    public static final String FILE_REPORT = "report.txt";

    private final File dir;

    public Cfg() {
        File base = null;
        try {
            base = Loader.instance().getConfigDir();
        } catch (Throwable t) {
            base = null;
        }
        if (base == null) base = new File("config");
        this.dir = new File(base, GT6Bridge.MODID);
        if (!this.dir.exists()) this.dir.mkdirs();
    }

    public File dir() {
        return dir;
    }

    public File file(String name) {
        return new File(dir, name);
    }

    /** newest modification time of every known table - used to notice edited configs at runtime. */
    public long lastModified() {
        long newest = 0L;
        String[] names = { FILE_MATERIALS, FILE_RECIPES, FILE_REMOVALS, Settings.FILE, AutoRules.FILE };
        for (String n : names) {
            try {
                File f = file(n);
                if (f.exists() && f.lastModified() > newest) newest = f.lastModified();
            } catch (Throwable ignored) {}
        }
        return newest;
    }

    /**
     * Reads a CSV file: '#' starts a comment, blank lines are ignored, the separator is
     * auto-detected (',' or ';' or tab). Returns rows of trimmed cells.
     */
    public java.util.List<String[]> read(String fileName, String defaultHeader) {
        java.util.List<String[]> rows = new java.util.ArrayList<String[]>();
        File f = file(fileName);
        if (!f.exists()) {
            writeDefault(f, defaultHeader);
            return rows;
        }
        java.io.BufferedReader r = null;
        try {
            r = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(f), "UTF-8"));
            String line;
            while ((line = r.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.charAt(0) == '#') continue;
                char sep = detectSeparator(line);
                String[] cells = split(line, sep);
                boolean empty = true;
                for (int i = 0; i < cells.length; i++) {
                    cells[i] = strip(cells[i]);
                    if (!cells[i].isEmpty()) empty = false;
                }
                if (!empty) rows.add(cells);
            }
        } catch (Throwable t) {
            FMLLog.warn("[%s] could not read %s: %s", GT6Bridge.MODID, fileName, t.toString());
        } finally {
            close(r);
        }
        return rows;
    }

    private static char detectSeparator(String line) {
        int c = line.indexOf(',');
        int s = line.indexOf(';');
        int t = line.indexOf('\t');
        char best = ',';
        int bestAt = c;
        if (bestAt < 0 || (s >= 0 && s < bestAt)) { best = ';'; bestAt = s; }
        if (bestAt < 0 || (t >= 0 && t < bestAt)) { best = '\t'; bestAt = t; }
        return bestAt < 0 ? ',' : best;
    }

    private static String[] split(String line, char sep) {
        java.util.List<String> out = new java.util.ArrayList<String>();
        StringBuilder cur = new StringBuilder();
        boolean quoted = false;
        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') { quoted = !quoted; continue; }
            if (ch == sep && !quoted) { out.add(cur.toString()); cur.setLength(0); continue; }
            cur.append(ch);
        }
        out.add(cur.toString());
        return out.toArray(new String[out.size()]);
    }

    private static String strip(String s) {
        s = s.trim();
        if (s.length() >= 2 && s.charAt(0) == '"' && s.charAt(s.length() - 1) == '"') {
            s = s.substring(1, s.length() - 1).trim();
        }
        return s;
    }

    private static void close(java.io.Closeable c) {
        if (c != null) try { c.close(); } catch (Throwable ignored) {}
    }

    private void writeDefault(File f, String header) {
        if (header == null) return;
        java.io.Writer w = null;
        try {
            w = new java.io.OutputStreamWriter(new java.io.FileOutputStream(f), "UTF-8");
            w.write(header);
            if (!header.endsWith("\n")) w.write("\n");
        } catch (Throwable t) {
            FMLLog.warn("[%s] could not create %s: %s", GT6Bridge.MODID, f.getName(), t.toString());
        } finally {
            if (w != null) try { w.close(); } catch (Throwable ignored) {}
        }
    }

    public static final String HEADER_MATERIALS =
        "# gt6bridge material table\n" +
        "# syntax: <oredictMaterialToken>,<gt6Material>[,note]\n" +
        "#   <oredictMaterialToken> : the part of an ore dictionary name behind the prefix, e.g. 'Enderium' for 'ingotEnderium'\n" +
        "#   <gt6Material>          : one of\n" +
        "#       <name>       bind to an existing GT6 material (see GregTech's material list)\n" +
        "#       -            do not bind this token at all\n" +
        "#       create       create a new GT6 material named like the token (PreInit)\n" +
        "#       create:Name  create it with an explicit name\n" +
        "#       create:Name:12345   ... with an explicit id\n" +
        "#   unmatched tokens are listed in report.txt so you can add lines here\n" +
        "# Material names are Capitalised and case sensitive (sanitize() strips space - ' /).\n" +
        "#\n" +
        "# examples:\n" +
        "# Enderium,create\n" +
        "# Signalum,create:Signalum\n" +
        "# Unobtainium,-,intentionally skipped\n";

    public static final String HEADER_RECIPES =
        "# gt6bridge recipe additions (applied to GT6 recipe maps)\n" +
        "# syntax: <map>,<inputs>,<outputs>[,eut,duration,optimize,note]\n" +
        "#   <map>     : GT6 recipe map field of gregapi.data.RM, e.g. Crusher, Mortar, Shredder,\n" +
        "#               Smelter, Melter, Mixer, Centrifuge, Electrolyzer, Compressor, Hammer,\n" +
        "#               Bath, Canner, Boxinator, Unboxinator, Wiremill, RollingMill, Assembler ...\n" +
        "#   inputs    : item tokens joined with '+' - a recipe with SEVERAL inputs (not alternatives),\n" +
        "#               each token may still expand to one recipe per matching stack\n" +
        "#   outputs   : item tokens joined with '+'; add '@chance' per output, e.g. '@50' = 50%%, '@5000' = 50%%\n" +
        "#               (values up to 100 are read as percent, above as GT6's 1/10000 unit)\n" +
        "#   eut       : GT6 energy per tick (default 16)\n" +
        "#   duration  : ticks (default 16, must be > 0)\n" +
        "#   optimize  : GT6's first addRecipe1 flag (default true)\n" +
        "# item tokens:\n" +
        "#   mod:name[:meta]        e.g. minecraft:iron_ingot  or  EnderIO:itemAlloy:6\n" +
        "#   ore:<OreDictName>      e.g. ore:ingotIron          (one recipe per matching stack)\n" +
        "#   gt:<prefix>:<material> e.g. gt:dust:Iron           (the GT6 item for that prefix+material)\n" +
        "# examples:\n" +
        "# Crusher,ore:ingotEnderium,gt:dust:Enderium,16,20,true,bridge test\n";

    public static final String HEADER_REMOVALS =
        "# gt6bridge recipe removals (other mods' own recipes)\n" +
        "# syntax: <target>,<selector>[,note]\n" +
        "#   <target>  : vanilla: crafting | furnace\n" +
        "#               Thermal Expansion: te_pulverizer te_furnace te_sawmill te_crucible te_charger\n" +
        "#                                  te_smelter te_insolator te_precipitator te_extruder\n" +
        "#               IC2: ic2_<machine> with machine one of\n" +
        "#                    macerator extractor compressor centrifuge blockcutter blastfurance\n" +
        "#                    recycler metalformerRolling metalformerCutting metalformerExtruding oreWashing\n" +
        "#                    (blockcutter / blastfurance are IC2's own spellings)\n" +
        "#               AE2: ae2_inscriber\n" +
        "#               Actually Additions: actuallyadditions_crusher\n" +
        "#               Railcraft: railcraft_rockcrusher railcraft_cokeoven railcraft_blastfurnace railcraft_rolling\n" +
        "#               EnderIO: enderio_sagmill enderio_alloy enderio_slicensplice enderio_vat enderio_soulbinder\n" +
        "#               Galacticraft: galacticraft_compressor galacticraft_circuitfabricator\n" +
        "#   selector  : matched against the recipe OUTPUT\n" +
        "#       mod:name[:meta]     exact item\n" +
        "#       mod:*               every item of that mod (metadata 0..15 tried)\n" +
        "#       *:name              that registry name in any mod\n" +
        "#       *:*                 every recipe of that backend (wipes the machine)\n" +
        "#       ore:<OreDictName>   every item registered under that ore dictionary entry\n" +
        "# examples:\n" +
        "# te_pulverizer,ore:ingotIron\n" +
        "# ic2_macerator,*:iron_ore\n" +
        "# enderio_sagmill,ore:oreIron\n" +
        "# crafting,EnderIO:itemAlloy:6\n";
}
