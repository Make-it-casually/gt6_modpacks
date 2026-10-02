"""
Link audit for the CraftTweaker / MineTweaker script API used by dshgt6bridge.crt.BridgeCrT.

The Zen class is loaded reflectively at runtime, so a wrong member name would simply make the
script API do nothing (or throw inside MineTweaker's class scanner). This script javap's the
compiled BridgeCrT, collects every minetweaker.* / stanhebben.* reference and verifies it exists
in the installed CraftTweaker jar.

Usage:
    python audit-crt-refs.py [--classes <out dir>] [--crt <extracted CraftTweaker dir>]
"""
import argparse
import os
import re
import subprocess
import sys

JAVAP = r'C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe'

REF = re.compile(r'// (?:Interface)?Method ((?:minetweaker|stanhebben)/[\w/$]+)\.([\w$<>]+):(\S+)')
FIELDREF = re.compile(r'// Field ((?:minetweaker|stanhebben)/[\w/$]+)\.([\w$]+):(\S+)')


def javap(classpath, name):
    out = subprocess.run([JAVAP, '-p', '-classpath', classpath, name],
                         capture_output=True, text=True, encoding='utf-8', errors='replace')
    if out.returncode != 0:
        return None
    return out.stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--classes', default=r'E:\game\minecraft\gt6\gt6bridge\out\dshgt6bridge\crt')
    ap.add_argument('--crt', default=r'E:\game\minecraft\gt6\tools\_tmp_crt')
    args = ap.parse_args()

    target = os.path.join(args.classes, 'BridgeCrT.class')
    if not os.path.isfile(target):
        print('BridgeCrT.class not found (%s) - script API was not compiled' % target)
        return 0

    dump = subprocess.run([JAVAP, '-p', '-c', target], capture_output=True, text=True,
                          encoding='utf-8', errors='replace').stdout
    methods, fields = set(), set()
    for line in dump.splitlines():
        m = REF.search(line)
        if m:
            methods.add((m.group(1), m.group(2), m.group(3)))
        m = FIELDREF.search(line)
        if m:
            fields.add((m.group(1), m.group(2), m.group(3)))

    print('BridgeCrT references: %d method(s), %d field(s)' % (len(methods), len(fields)))
    classes = {}
    problems = []
    for owner, name, desc in sorted(methods):
        fqcn = owner.replace('/', '.')
        if fqcn not in classes:
            classes[fqcn] = javap(args.crt, fqcn)
        dump = classes[fqcn]
        if dump is None:
            problems.append('class missing: %s' % fqcn)
            continue
        # javap prints   public static void registerClass(java.lang.Class);
        if not re.search(r'\b%s\s*\(' % re.escape(name), dump):
            problems.append('method missing: %s.%s' % (fqcn, name))
    for owner, name, desc in sorted(fields):
        fqcn = owner.replace('/', '.')
        if fqcn not in classes:
            classes[fqcn] = javap(args.crt, fqcn)
        dump = classes[fqcn]
        if dump is None:
            problems.append('class missing: %s' % fqcn)
            continue
        if not re.search(r'\b%s\b' % re.escape(name), dump):
            problems.append('field missing: %s.%s' % (fqcn, name))

    # the Zen annotations themselves must be present for MineTweaker's class scanner
    for ann in ('stanhebben.zenscript.annotations.ZenClass',
                'stanhebben.zenscript.annotations.ZenMethod',
                'stanhebben.zenscript.annotations.Optional'):
        if not os.path.isfile(os.path.join(args.crt, ann.replace('.', os.sep) + '.class')):
            problems.append('annotation missing: %s' % ann)

    # what CrtHook resolves reflectively at runtime
    api = javap(args.crt, 'minetweaker.MineTweakerAPI')
    if api is None:
        problems.append('class missing: minetweaker.MineTweakerAPI (CrtHook cannot register)')
    elif not re.search(r'\bregisterClass\s*\(\s*java\.lang\.Class', api):
        problems.append('minetweaker.MineTweakerAPI.registerClass(Class) missing (CrtHook cannot register)')
    if not os.path.isfile(os.path.join(args.classes, 'BridgeCrT.class')):
        problems.append('dshgt6bridge.crt.BridgeCrT not compiled - CrtHook would fail at runtime')

    for p in problems:
        print('  PROBLEM %s' % p)
    if problems:
        print('CRT API AUDIT FAILED')
        return 1
    print('CRT API AUDIT OK - every minetweaker/stanhebben reference exists in the installed jar')
    return 0


if __name__ == '__main__':
    sys.exit(main())
