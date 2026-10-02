"""
Pre-flight link audit for gt6bridge.

The mod is compiled with plain javac against hand written stubs and is NOT reobfuscated by
ForgeGradle, so every net.minecraft.* member it references must exist in the runtime mapping
with exactly the same name AND descriptor, otherwise the game throws NoSuchMethodError.

This script reads the compiled classes, extracts every referenced member from the javap
comments, and checks it against FML's deobfuscation data (SRG names) extracted from the
forge jar.

Usage:
    python audit-links.py [--classes <dir>] [--srg <deobf_data.txt>]
"""
import argparse
import os
import re
import subprocess
import sys

JAVAP = r'C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe'

METHOD_REF = re.compile(r'// Method ((?:net/minecraft|net/minecraftforge|cpw/mods)/[^\s:]+)\.([^\s:]+):(\S+)')
INTERFACE_REF = re.compile(r'// InterfaceMethod ((?:net/minecraft|net/minecraftforge|cpw/mods)/[^\s:]+)\.([^\s:]+):(\S+)')
FIELD_REF = re.compile(r'// Field ((?:net/minecraft|net/minecraftforge|cpw/mods)/[^\s:]+)\.([^\s:;]+):(\S+)')


def load_srg(path):
    methods, fields, classes = set(), set(), set()
    with open(path, encoding='utf-8', errors='replace') as fh:
        for line in fh:
            parts = line.rstrip('\n').split(' ')
            if line.startswith('CL: ') and len(parts) == 3:
                classes.add(parts[2])
            elif line.startswith('MD: ') and len(parts) == 5:
                methods.add((parts[3], parts[4]))
            elif line.startswith('FD: ') and len(parts) == 3:
                fields.add(parts[2])
    return methods, fields, classes


def javap_refs(class_dir, classes):
    refs = {'method': set(), 'field': set()}
    for name in classes:
        full = os.path.join(class_dir, name)
        try:
            out = subprocess.run([JAVAP, '-p', '-c', full], capture_output=True, text=True,
                                 encoding='utf-8', errors='replace').stdout
        except Exception as exc:  # pragma: no cover
            print('javap failed for %s: %s' % (name, exc))
            continue
        for line in out.splitlines():
            for rx in (METHOD_REF, INTERFACE_REF):
                m = rx.search(line)
                if m:
                    refs['method'].add((m.group(1), m.group(2).strip('"'), m.group(3)))
            m = FIELD_REF.search(line)
            if m:
                refs['field'].add((m.group(1), m.group(2).strip('"'), m.group(3)))
    return refs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--classes', default=r'E:\game\minecraft\gt6\gt6bridge\out\dshgt6bridge')
    ap.add_argument('--srg', default=r'E:\game\minecraft\gt6\tools\deobf_data.txt')
    args = ap.parse_args()

    class_files = sorted(f for f in os.listdir(args.classes) if f.endswith('.class'))
    methods, fields, classes = load_srg(args.srg)
    print('mapping: %d methods, %d fields, %d classes' % (len(methods), len(fields), len(classes)))
    print('classes to audit: %d' % len(class_files))

    refs = javap_refs(args.classes, class_files)
    print('referenced net.minecraft*/forge/fml members: %d methods, %d fields'
          % (len(refs['method']), len(refs['field'])))

    ok = bad = skipped = inherited = 0
    problems = []
    # constructors and static initialisers are never renamed by SRG, so they are absent from the
    # obf -> SRG mapping; the class lookup above already proves the class exists
    for owner, name, desc in sorted(refs['method']):
        if owner.startswith('net/minecraftforge') or owner.startswith('cpw/mods'):
            skipped += 1
            continue
        owner_srg = owner.replace('.', '/')
        if owner_srg not in classes:
            problems.append('class not in mapping: %s' % owner_srg)
            bad += 1
            continue
        if name in ('<init>', '<clinit>'):
            ok += 1
            continue
        if (owner_srg + '/' + name, desc) in methods:
            ok += 1
            continue
        # inherited member? accept when some class in the mapping declares that exact name+descriptor
        donors = sorted({decl.rsplit('/', 1)[0] for decl, d in methods
                         if d == desc and decl.endswith('/' + name)})
        if donors:
            inherited += 1
            print('  inherited: %s.%s %s  <- declared in %s' % (owner_srg, name, desc, ', '.join(donors)))
        else:
            bad += 1
            problems.append('method missing in mapping: %s.%s %s' % (owner_srg, name, desc))

    for owner, name, desc in sorted(refs['field']):
        if owner.startswith('net/minecraftforge') or owner.startswith('cpw/mods'):
            skipped += 1
            continue
        owner_srg = owner.replace('.', '/')
        if (owner_srg + '/' + name) in fields:
            ok += 1
        else:
            bad += 1
            problems.append('field missing in mapping: %s.%s' % (owner_srg, name))

    print('resolved: %d (inherited: %d)   unresolved: %d   forge/fml (not in this mapping): %d'
          % (ok, inherited, bad, skipped))
    for p in problems:
        print('  PROBLEM %s' % p)
    if bad:
        print('AUDIT FAILED')
        return 1
    print('AUDIT OK - every net.minecraft.* reference matches the runtime SRG mapping')
    return 0


if __name__ == '__main__':
    sys.exit(main())
