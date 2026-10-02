package net.minecraft.util;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * COMPILE-TIME STUB ONLY - never packaged into the mod jar.
 * SRG member names (MCP in comments) - see ItemStack.java for why.
 */
public class RegistryNamespaced {
    private final Map<String, Object> values = new LinkedHashMap<String, Object>();

    public void register(String name, Object object) {
        values.put(name, object);
    }

    public Object func_82594_a(String name) { // MCP: getObject(String)
        return values.get(name);
    }

    public String func_148750_c(Object object) { // MCP: getNameForObject(Object)
        for (Map.Entry<String, Object> entry : values.entrySet()) {
            if (entry.getValue() == object) return entry.getKey();
        }
        return null;
    }

    public Set func_148742_b() { // MCP: getKeys()  (declared in RegistrySimple)
        return values.keySet();
    }

    public boolean func_148741_d(String name) { // MCP: containsKey(String)
        return values.containsKey(name);
    }
}
