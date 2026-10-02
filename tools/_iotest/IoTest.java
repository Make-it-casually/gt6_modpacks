import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.nio.file.Paths;

public class IoTest {
    public static void main(String[] args) throws Exception {
        File dir = new File(args[0]);
        dir.mkdirs();
        String name = "reccomplex:structuredata"; // MapStorage name as used by RecurrentComplex
        File f = new File(dir, name + ".dat");

        System.out.println("java.version = " + System.getProperty("java.version"));
        System.out.println("target File   = " + f.getPath());

        // 1) What Hodgepodge's threaded WorldDataSaver does (NIO Path)
        try {
            Path p = f.toPath();
            System.out.println("[NIO ] toPath() ok      -> " + p);
        } catch (Throwable t) {
            System.out.println("[NIO ] toPath() FAILED  -> " + t);
        }

        // 2) What vanilla MapStorage.saveData does (java.io.FileOutputStream)
        try {
            byte[] payload = "VANILLA-PATH-OK".getBytes("UTF-8");
            FileOutputStream out = new FileOutputStream(f);
            out.write(payload);
            out.close();
            System.out.println("[FILE] FileOutputStream ok, exists=" + f.exists() + ", length=" + f.length());
            FileInputStream in = new FileInputStream(f);
            byte[] back = new byte[payload.length];
            int n = in.read(back);
            in.close();
            System.out.println("[FILE] read back " + n + " bytes -> " + new String(back, 0, n, "UTF-8"));
        } catch (Throwable t) {
            System.out.println("[FILE] FileOutputStream FAILED -> " + t);
        }

        // 3) plain listing of the directory (base file created by the ':' write?)
        System.out.println("[DIR ] " + dir.getAbsolutePath());
        File[] list = dir.listFiles();
        if (list != null) {
            for (File c : list) {
                System.out.println("       " + c.getName() + " (" + c.length() + " bytes)");
            }
        }
    }
}
