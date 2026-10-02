package dshgt6bridge;

import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Small reflection helper used for the other mods' recipe managers: gt6bridge is
 * compiled without those mods on the classpath, so every call is reflective and
 * failure-tolerant (a missing mod or renamed method must never break the game).
 */
public final class Reflect {

    private Reflect() {}

    public static Class<?> cls(String name) {
        try {
            return Class.forName(name);
        } catch (Throwable t) {
            return null;
        }
    }

    public static boolean present(String name) {
        return cls(name) != null;
    }

    public static Field field(Class<?> c, String name) {
        Class<?> k = c;
        while (k != null) {
            try {
                Field f = k.getDeclaredField(name);
                f.setAccessible(true);
                return f;
            } catch (Throwable t) {
                k = k.getSuperclass();
            }
        }
        return null;
    }

    public static Object field(Object target, String name) {
        if (target == null) return null;
        try {
            Field f = field(target.getClass(), name);
            return f == null ? null : f.get(target);
        } catch (Throwable t) {
            return null;
        }
    }

    public static Object staticField(Class<?> c, String name) {
        if (c == null) return null;
        try {
            Field f = field(c, name);
            return f == null ? null : f.get(null);
        } catch (Throwable t) {
            return null;
        }
    }

    public static Method method(Class<?> c, String name, Object[] args) {
        if (c == null) return null;
        int arity = args == null ? 0 : args.length;
        Method lenient = null;
        for (Method m : c.getMethods()) {
            if (!m.getName().equals(name)) continue;
            Class<?>[] p = m.getParameterTypes();
            if (p.length != arity) continue;
            boolean strict = true;
            boolean loose = true;
            for (int i = 0; i < p.length; i++) {
                if (!compatible(p[i], args[i], false)) { strict = false; }
                if (!compatible(p[i], args[i], true)) { loose = false; }
            }
            if (strict) return m;
            if (loose && lenient == null) lenient = m;
        }
        return lenient;
    }

    /**
     * Parameter compatibility. The strict pass only accepts exact reference matches; the
     * lenient pass also maps boxed primitives (int/float/boolean/...) and lets an Object[]
     * argument satisfy a typed array parameter (mod APIs like
     * getCompletedResult(float, MachineRecipeInput...) are reflected with boxed values).
     */
    private static boolean compatible(Class<?> param, Object arg, boolean lenient) {
        if (arg == null) return !param.isPrimitive();
        Class<?> ac = arg.getClass();
        if (param.isPrimitive()) {
            if (!lenient) return false;
            if (param == int.class) return ac == Integer.class || ac == Short.class || ac == Byte.class;
            if (param == long.class) return ac == Long.class || ac == Integer.class || ac == Short.class || ac == Byte.class;
            if (param == float.class) return ac == Float.class || ac == Double.class || ac == Integer.class || ac == Long.class;
            if (param == double.class) return ac == Double.class || ac == Float.class || ac == Integer.class || ac == Long.class;
            if (param == boolean.class) return ac == Boolean.class;
            if (param == short.class) return ac == Short.class || ac == Byte.class || ac == Integer.class;
            if (param == byte.class) return ac == Byte.class;
            if (param == char.class) return ac == Character.class;
            return false;
        }
        if (param.isAssignableFrom(ac)) return true;
        if (lenient && param.isArray() && arg instanceof Object[]) return true;
        return false;
    }

    public static Object call(Object target, String name, Object... args) {
        if (target == null) return null;
        try {
            Method m = method(target.getClass(), name, args);
            return m == null ? null : m.invoke(target, adapt(m, args));
        } catch (Throwable t) {
            return null;
        }
    }

    public static Object callStatic(Class<?> c, String name, Object... args) {
        if (c == null) return null;
        try {
            Method m = method(c, name, args);
            return m == null ? null : m.invoke(null, adapt(m, args));
        } catch (Throwable t) {
            return null;
        }
    }

    /**
     * Method.invoke requires an array whose component type matches the parameter type; a varargs
     * call reflected as (float, String...) is reached with a plain Object[] for the array
     * parameter, which the JVM rejects. Copy it into an array of the right component type.
     */
    private static Object[] adapt(Method m, Object[] args) {
        if (args == null) return new Object[0];
        Class<?>[] p = m.getParameterTypes();
        if (p.length != args.length) return args;
        Object[] out = new Object[args.length];
        for (int i = 0; i < args.length; i++) {
            Object a = args[i];
            if (a != null && p[i].isArray() && a instanceof Object[] && !p[i].isInstance(a)) {
                Object[] src = (Object[]) a;
                Object typed = java.lang.reflect.Array.newInstance(p[i].getComponentType(), src.length);
                for (int j = 0; j < src.length; j++) java.lang.reflect.Array.set(typed, j, src[j]);
                out[i] = typed;
            } else {
                out[i] = a;
            }
        }
        return out;
    }

    /** tries several accessor names in order, returns the first non-null result. */
    public static Object pick(Object target, String... names) {
        if (target == null) return null;
        for (String n : names) {
            Object o = call(target, n);
            if (o != null) return o;
        }
        for (String n : names) {
            Object o = field(target, n);
            if (o != null) return o;
        }
        return null;
    }

    /** true when a class with that name is loadable and has a method with that name/arity. */
    public static boolean has(Class<?> c, String name, int arity) {
        if (c == null) return false;
        for (Method m : c.getMethods()) {
            if (m.getName().equals(name) && m.getParameterTypes().length == arity) return true;
        }
        return false;
    }

    /** exact parameter type lookup (inherited public methods included). */
    public static boolean hasSignature(Class<?> c, String name, Class<?>... params) {
        if (c == null) return false;
        for (Method m : c.getMethods()) {
            if (!m.getName().equals(name)) continue;
            Class<?>[] p = m.getParameterTypes();
            if (p.length != params.length) continue;
            boolean ok = true;
            for (int i = 0; i < p.length; i++) {
                if (!p[i].equals(params[i])) { ok = false; break; }
            }
            if (ok) return true;
        }
        return false;
    }

    /** field lookup walking the hierarchy; type == null accepts any type. */
    public static boolean hasField(Class<?> c, String name, Class<?> type) {
        Class<?> k = c;
        while (k != null) {
            for (Field f : k.getDeclaredFields()) {
                if (f.getName().equals(name) && (type == null || f.getType().equals(type))) return true;
            }
            for (Field f : k.getFields()) {
                if (f.getName().equals(name) && (type == null || f.getType().equals(type))) return true;
            }
            k = k.getSuperclass();
        }
        return false;
    }

    public static boolean hasCtor(Class<?> c, Class<?>... params) {
        if (c == null) return false;
        for (java.lang.reflect.Constructor<?> k : c.getConstructors()) {
            Class<?>[] p = k.getParameterTypes();
            if (p.length != params.length) continue;
            boolean ok = true;
            for (int i = 0; i < p.length; i++) {
                if (!p[i].equals(params[i])) { ok = false; break; }
            }
            if (ok) return true;
        }
        return false;
    }
}
