"""
Pre-flight audit of the *other mods'* reflection targets used by gt6bridge's removal backends.

The removal backends call other mods' classes by name through reflection, so a typo (for example
RedstoneFurnaceManager instead of FurnaceManager) fails silently: the backend finds no class and
removes nothing. This script checks every registered target against the jars extracted under
tools/research/ex/<mod>/ with javap.

Usage:
    python audit-mod-targets.py [--ex <extraction dir>] [--source <RecipeRemover.java>] [--removals <removals.csv>]
"""
import argparse
import os
import re
import subprocess
import sys

JAVAP = r'C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe'

# backend prefix -> extraction directory name under tools/research/ex
MOD_DIR = {
    'te_': 'thermalexpansion',
    'ic2_': 'ic2',
    'ae2_': 'ae2',
    'actuallyadditions': 'actuallyadditions',
    'railcraft_': 'railcraft',
    'enderio_': 'enderio',
    'galacticraft_': 'galacticraft',
}


def javap(classes_dir, fqcn):
    if not classes_dir or not os.path.isdir(classes_dir):
        return None
    out = subprocess.run([JAVAP, '-p', '-classpath', classes_dir, fqcn],
                         capture_output=True, text=True, encoding='utf-8', errors='replace')
    if out.returncode != 0 or 'Error:' in out.stderr:
        return None
    return out.stdout


def javap_chain(classes_dir, fqcn, depth=6):
    """javap output of the class plus its superclasses - invented members are not printed by javap."""
    parts = []
    current = fqcn
    seen = set()
    while current and current not in seen and depth > 0:
        seen.add(current)
        dump = javap(classes_dir, current)
        if dump is None:
            return '\n'.join(parts) if parts else None
        parts.append(dump)
        m = re.search(r'^\s*(?:public |abstract |final )*class \S+ extends ([\w.$]+)', dump, re.M)
        current = m.group(1) if m else None
        depth -= 1
    return '\n'.join(parts)


def parse_source(path):
    """pulls the reflective targets out of the registration code."""
    specs = []
    text = open(path, encoding='utf-8', errors='replace').read()
    for m in re.finditer(r'registerStackApi\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*\)', text):
        specs.append({'name': m.group(1), 'kind': 'stackApi', 'class': m.group(2), 'arity': int(m.group(3))})
    for m in re.finditer(r'new PrivateMapBackend\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)', text):
        specs.append({'name': m.group(1), 'kind': 'map', 'class': m.group(2), 'member': m.group(3)})
    for m in re.finditer(r'new ListBackend\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(null|"[^"]*")\s*\)', text):
        specs.append({'name': m.group(1), 'kind': 'list', 'class': m.group(2),
                      'instance': m.group(3), 'list': m.group(4)})
    for m in re.finditer(r'new RegistryOnlyBackend\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)', text):
        specs.append({'name': m.group(1), 'kind': 'registry', 'class': m.group(2), 'key': m.group(3)})
    return specs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ex', default=r'E:\game\minecraft\gt6\tools\research\ex')
    ap.add_argument('--source', default=r'E:\game\minecraft\gt6\gt6bridge\src\dshgt6bridge\RecipeRemover.java')
    ap.add_argument('--removals', default=r'E:\game\minecraft\gt6\.minecraft\versions\GT6\config\gt6bridge\removals.csv')
    args = ap.parse_args()

    specs = parse_source(args.source)
    print('registered backends in source: %d' % len(specs))

    checked = failed = skipped = 0
    problems = []

    for spec in specs:
        name = spec['name']
        prefix = next((p for p in MOD_DIR if name.startswith(p)), None)
        if prefix is None:
            skipped += 1
            continue
        classes_dir = os.path.join(args.ex, MOD_DIR[prefix])
        if not os.path.isdir(classes_dir):
            print('  skip %-28s (%s not extracted)' % (name, MOD_DIR[prefix]))
            skipped += 1
            continue
        dump = javap_chain(classes_dir, spec['class'])
        checked += 1
        if dump is None:
            problems.append('%s: class not found: %s' % (name, spec['class']))
            failed += 1
            continue
        if spec['kind'] == 'stackApi':
            rx = re.compile(r'public static \S+ removeRecipe\(([^)]*)\)')
            m = rx.search(dump)
            if not m:
                problems.append('%s: %s has no removeRecipe' % (name, spec['class']))
                failed += 1
            else:
                params = [p for p in m.group(1).split(',') if p.strip()]
                if len(params) != spec['arity']:
                    problems.append('%s: removeRecipe arity %d != expected %d'
                                    % (name, len(params), spec['arity']))
                    failed += 1
        elif spec['kind'] == 'map':
            if not re.search(r'\b%s\b' % re.escape(spec['member']), dump):
                problems.append('%s: %s has no field %s' % (name, spec['class'], spec['member']))
                failed += 1
        elif spec['kind'] == 'list':
            for member in (spec['instance'], spec['list']):
                if not re.search(r'\b%s\s*\(' % re.escape(member), dump):
                    problems.append('%s: %s has no method %s' % (name, spec['class'], member))
                    failed += 1
        elif spec['kind'] == 'registry':
            for member in ('instance', 'getRecipesForMachine'):
                if not re.search(r'\b%s\b' % re.escape(member), dump):
                    problems.append('%s: %s has no %s' % (name, spec['class'], member))
                    failed += 1

    # IC2 machine names referenced by the active removals.csv rows
    ic2_dir = os.path.join(args.ex, 'ic2')
    if os.path.isdir(ic2_dir) and os.path.isfile(args.removals):
        dump = javap(ic2_dir, 'ic2.api.recipe.Recipes') or ''
        fields = set(re.findall(r'public static \S+ (\w+);', dump))
        for line in open(args.removals, encoding='utf-8', errors='replace'):
            line = line.strip()
            if not line or line.startswith('#') or not line.startswith('ic2_'):
                continue
            machine = line.split(',')[0].strip()[4:]
            checked += 1
            if machine not in fields:
                problems.append('removals.csv: IC2 has no Recipes.%s' % machine)
                failed += 1

    # AE2 + Actually Additions special cases
    ae2_dir = os.path.join(args.ex, 'ae2')
    if os.path.isdir(ae2_dir):
        checked += 1
        if javap(ae2_dir, 'appeng.api.AEApi') is None:
            problems.append('AE2: appeng.api.AEApi missing')
            failed += 1
        else:
            container = javap(ae2_dir, 'appeng.api.features.IRegistryContainer') or ''
            if 'inscriber' not in container:
                problems.append('AE2: IRegistryContainer has no inscriber()')
                failed += 1
    aa_dir = os.path.join(args.ex, 'actuallyadditions')
    if os.path.isdir(aa_dir):
        checked += 1
        api = javap(aa_dir, 'de.ellpeck.actuallyadditions.api.ActuallyAdditionsAPI') or ''
        reg = javap(aa_dir, 'de.ellpeck.actuallyadditions.mod.recipe.CrusherRecipeRegistry') or ''
        if 'crusherRecipes' not in api:
            problems.append('ActuallyAdditions: ActuallyAdditionsAPI.crusherRecipes missing')
            failed += 1
        if 'registerFinally' not in reg:
            problems.append('ActuallyAdditions: CrusherRecipeRegistry.registerFinally missing')
            failed += 1

    print('checked: %d   failed: %d   skipped: %d' % (checked, failed, skipped))
    for p in problems:
        print('  PROBLEM %s' % p)
    if failed:
        print('MOD TARGET AUDIT FAILED')
        return 1
    print('MOD TARGET AUDIT OK - every reflective removal target exists in the installed mods')
    return 0


if __name__ == '__main__':
    sys.exit(main())
