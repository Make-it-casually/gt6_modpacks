package dshgt6bridge;

import java.io.File;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import cpw.mods.fml.common.FMLLog;
import gregapi.oredict.OreDictMaterial;

/**
 * Optional PreInit pass: creates GT6 materials for ore dictionary tokens GT6 does not know
 * (Enderium, Signalum, Lumium, Manyullyn, ...).
 *
 * Why PreInit: GT6 requires materials with a valid (item generating) ID to be created during
 * PreInit - "Materials with a valid ID have to be initialised in PreInit or earlier". GT6 then
 * generates the prefix items for them, and its own ore dictionary parser binds the foreign
 * stacks so that GT6 machines and NEI see them.
 *
 * Config (materials.csv, column 2):
 *   create                 -> create a material named like the token
 *   create:Name            -> create a material with that name
 *   create:Name:12345      -> ... with an explicit ID
 */
public final class MaterialCreator {

    /** results of the PreInit run, merged into the main report later. */
    public static final List<String> NOTES = new ArrayList<String>();
    /** how many materials were really created. */
    public static int CREATED;
    private static boolean done;

    private final Cfg cfg;
    private final Settings settings;
    private final Report rep;

    public MaterialCreator(Cfg cfg, Settings settings, Report rep) {
        this.cfg = cfg;
        this.settings = settings;
        this.rep = rep;
    }

    public void run() {
        if (done) return;
        done = true;
        if (!settings.getBool("enableMaterialCreation")) {
            rep.note("material creation disabled by settings.csv (enableMaterialCreation=false)");
            return;
        }
        List<String[]> rows = cfg.read(Cfg.FILE_MATERIALS, Cfg.HEADER_MATERIALS);
        for (String[] row : rows) {
            if (row.length < 2) continue;
            String token = row[0].trim();
            String target = row[1].trim();
            if (token.isEmpty() || token.startsWith("<")) continue;
            if (!target.toLowerCase().startsWith("create")) continue;
            try {
                create(token, target);
            } catch (Throwable t) {
                rep.error("create material '" + token + "' failed: " + t);
            }
        }
        writePreInitReport();
    }

    private void create(String token, String target) {
        String name = token;
        String idPart = null;
        String[] parts = target.split(":");
        if (parts.length >= 2 && !parts[1].trim().isEmpty()) name = parts[1].trim();
        if (parts.length >= 3 && !parts[2].trim().isEmpty()) idPart = parts[2].trim();
        name = OreDictMaterial.sanitize(name);

        OreDictMaterial existing = Gt6.material(name);
        if (existing != null) {
            note("material '" + name + "' already exists (id " + existing.mID + "), creation skipped");
            rep.count("materials.existing");
            return;
        }

        int id = -1;
        if (idPart != null) {
            try {
                id = Integer.parseInt(idPart);
            } catch (Throwable t) {
                note("could not parse id '" + idPart + "' for " + name + ", using an automatic one");
            }
        }
        if (id < 0) id = findFreeId();
        if (id < 0) {
            note("no free material id found for '" + name + "' - created without item generation (id -1)");
        }

        OreDictMaterial created = null;
        try {
            created = OreDictMaterial.createMaterial(id, name, name);
        } catch (Throwable t) {
            note("OreDictMaterial.createMaterial(" + id + ", " + name + ") threw: " + t);
        }
        if (created == null) {
            rep.error("material creation returned null for '" + name + "' (id " + id + ")");
            return;
        }
        rep.count("materials.created");
        CREATED++;
        note("created GT6 material '" + name + "' with id " + id);
        FMLLog.info("[%s] created GT6 material %s (id %d)", GT6Bridge.MODID, name, Integer.valueOf(id));
    }

    /** highest free slot of GT6's material array - every GT6 material is created at class load. */
    private static int findFreeId() {
        try {
            OreDictMaterial[] array = OreDictMaterial.MATERIAL_ARRAY;
            if (array == null) return -1;
            for (int i = array.length - 1; i >= 0; i--) {
                if (array[i] == null) return i;
            }
        } catch (Throwable t) {
            return -1;
        }
        return -1;
    }

    private void note(String message) {
        NOTES.add(message);
        rep.note(message);
    }

    private void writePreInitReport() {
        File dir = cfg.dir();
        File f = new File(dir, "report-preinit.txt");
        Writer w = null;
        try {
            w = new OutputStreamWriter(new java.io.FileOutputStream(f), "UTF-8");
            w.write("gt6bridge " + GT6Bridge.VERSION + " - pre-init material creation\n\n");
            if (NOTES.isEmpty()) w.write("nothing created (no 'create:' rows, or all materials already existed)\n");
            for (String s : NOTES) w.write("  " + s + "\n");
            w.write("\nmaterials now known by GT6: ");
            try {
                Map<String, OreDictMaterial> map = OreDictMaterial.MATERIAL_MAP;
                w.write(map == null ? "?" : String.valueOf(map.size()));
            } catch (Throwable t) {
                w.write("?");
            }
            w.write("\n");
            w.flush();
        } catch (Throwable t) {
            FMLLog.warn("[%s] could not write pre-init report: %s", GT6Bridge.MODID, t.toString());
        } finally {
            if (w != null) try { w.close(); } catch (Throwable ignored) {}
        }
    }
}
