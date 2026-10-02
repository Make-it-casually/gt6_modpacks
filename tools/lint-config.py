"""
Pre-flight lint for the gt6bridge config tables.

Catches typos before a game launch: recipe map names are checked against gregapi.data.RM, removal
targets against the backends registered in RecipeRemover.java, settings keys against Settings.java
and material names against the GT6 material list.

Usage:
    python lint-config.py [--config <config dir>]
"""
import argparse
import os
import re
import subprocess
import sys

JAVAP = r'C:\Program Files\BellSoft\LibericaJDK-8\bin\javap.exe'


def parse_rm_maps(classes):
    out = subprocess.run([JAVAP, '-p', '-classpath', classes, 'gregapi.data.RM'],
                         capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    maps = set()
    for line in out.splitlines():
        m = re.search(r'public static final gregapi\.recipes\.Recipe\$RecipeMap (\w+);', line)
        if m:
            maps.add(m.group(1))
    return maps


def parse_backends(path):
    """literal backend names plus the families the code recognises with startsWith("...")."""
    text = open(path, encoding='utf-8', errors='replace').read()
    names = set(re.findall(r'registerStackApi\(\s*"([^"]+)"', text))
    names |= set(re.findall(r'new \w*Backend\(\s*"([^"]+)"', text))
    names |= set(re.findall(r'backends\.put\(\s*"([^"]+)"', text))
    if re.search(r'register\(\s*new AdvancedRocketryBackend\(\s*\)\s*\)', text):
        names.add('advancedrocketry_machines')
    families = set(re.findall(r'target\.startsWith\(\s*"([^"]+)"\s*\)', text))
    return names, families


def parse_settings_keys(path):
    text = open(path, encoding='utf-8', errors='replace').read()
    return set(k.lower() for k in re.findall(r'set\(\s*"([^"]+)"', text))


def read_rows(path):
    """yields (lineno, [cells]) for non comment, non empty lines."""
    if not os.path.isfile(path):
        return
    with open(path, encoding='utf-8', errors='replace') as fh:
        for i, line in enumerate(fh, 1):
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            yield i, [c.strip() for c in re.split(r'[,\t;]', s)]


def main():
    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    tools = os.path.join(repo, 'tools')
    ap = argparse.ArgumentParser()
    ap.add_argument('--config', default=os.path.join(repo, 'config', 'gt6bridge'))
    ap.add_argument('--classes', default=os.path.join(tools, '_tmp_gt6'))
    ap.add_argument('--materials', default=os.path.join(tools, 'gt6-material-names.txt'))
    ap.add_argument('--prefixes', default=os.path.join(tools, 'gt6-prefixes.txt'))
    ap.add_argument('--source', default=os.path.join(repo, 'gt6bridge', 'src', 'dshgt6bridge', 'RecipeRemover.java'))
    ap.add_argument('--settings', default=os.path.join(repo, 'gt6bridge', 'src', 'dshgt6bridge', 'Settings.java'))
    args = ap.parse_args()

    maps = parse_rm_maps(args.classes)
    backends, families = parse_backends(args.source)
    keys = parse_settings_keys(args.settings)
    materials = set()
    if os.path.isfile(args.materials):
        materials = set(l.strip() for l in open(args.materials, encoding='utf-8', errors='replace') if l.strip())
    prefixes = set()
    if os.path.isfile(args.prefixes):
        prefixes = set(l.strip() for l in open(args.prefixes, encoding='utf-8', errors='replace') if l.strip())
    known_creations = set()
    for _, cells in read_rows(os.path.join(args.config, 'materials.csv')):
        if len(cells) > 1 and cells[1].lower().startswith('create'):
            known_creations.add(cells[0])

    print('recipe maps in gregapi.data.RM : %d' % len(maps))
    print('removal backends in the mod     : %d (+%d families)' % (len(backends), len(families)))
    print('settings keys                   : %d' % len(keys))
    print('material names available        : %d' % len(materials))
    print('ore dictionary prefixes         : %d' % len(prefixes))
    print('')

    problems = []
    warnings = []

    # ---- settings.csv
    seen = set()
    for ln, cells in read_rows(os.path.join(args.config, 'settings.csv')):
        if len(cells) < 2:
            problems.append('settings.csv:%d needs <key>,<value>' % ln)
            continue
        key = cells[0].lower()
        seen.add(key)
        if key not in keys:
            problems.append('settings.csv:%d unknown key "%s"' % (ln, cells[0]))
    for key in sorted(keys - seen):
        warnings.append('settings.csv: key "%s" is missing (default is used)' % key)

    # ---- materials.csv
    for ln, cells in read_rows(os.path.join(args.config, 'materials.csv')):
        if len(cells) < 2:
            problems.append('materials.csv:%d needs <token>,<material|create:Name|->' % ln)
            continue
        target = cells[1]
        if target == '-' or target.lower().startswith('create'):
            continue
        if materials and target not in materials:
            problems.append('materials.csv:%d material "%s" not in the GT6 material list (typo?)' % (ln, target))

    # ---- recipes.csv
    for ln, cells in read_rows(os.path.join(args.config, 'recipes.csv')):
        if len(cells) < 3:
            problems.append('recipes.csv:%d needs <map>,<inputs>,<outputs>[,eut,duration,optimize,note]' % ln)
            continue
        if cells[0] not in maps:
            problems.append('recipes.csv:%d unknown GT6 recipe map "%s"' % (ln, cells[0]))
        for token in (t.strip() for t in cells[1].split('+') if t.strip()):
            if not re.match(r'^(ore:|gt:|\w+:)', token):
                problems.append('recipes.csv:%d input token "%s" has no prefix type' % (ln, token))
            if token.startswith('gt:') and token.count(':') == 2:
                mat = token.split(':')[2]
                if materials and mat not in materials:
                    problems.append('recipes.csv:%d unknown GT6 material "%s"' % (ln, mat))
        for token in (t.strip() for t in cells[2].split('+') if t.strip()):
            base = token.split('@')[0]
            if not re.match(r'^(ore:|gt:|\w+:)', base):
                problems.append('recipes.csv:%d output token "%s" has no prefix type' % (ln, token))
        if len(cells) > 3 and cells[3] and not cells[3].isdigit():
            problems.append('recipes.csv:%d eut "%s" is not a number' % (ln, cells[3]))
        if len(cells) > 4 and cells[4] and not cells[4].isdigit():
            problems.append('recipes.csv:%d duration "%s" is not a number' % (ln, cells[4]))

    # ---- removals.csv
    for ln, cells in read_rows(os.path.join(args.config, 'removals.csv')):
        if len(cells) < 2:
            problems.append('removals.csv:%d needs <target>,<selector>' % ln)
            continue
        target = cells[0].lower()
        known = target in backends or target in ('crafting', 'furnace')
        if not known:
            for fam in families:
                if target.startswith(fam.lower()) and len(target) > len(fam):
                    known = True
                    break
        if not known:
            problems.append('removals.csv:%d unknown target "%s"' % (ln, cells[0]))
        if not cells[1]:
            problems.append('removals.csv:%d empty selector' % ln)
        if cells[1].endswith('*') and '*' not in cells[1]:
            problems.append('removals.csv:%d selector "%s" looks broken' % (ln, cells[1]))

    # ---- autorules.csv (column 0 is an ore dictionary prefix, not a material)
    for ln, cells in read_rows(os.path.join(args.config, 'autorules.csv')):
        if len(cells) < 2:
            problems.append('autorules.csv:%d needs <oreDictPrefix>,<map>,...' % ln)
            continue
        if prefixes and cells[0] not in prefixes:
            warnings.append('autorules.csv:%d prefix "%s" is not a GT6 ore dictionary prefix' % (ln, cells[0]))
        if len(cells) > 2 and cells[1] and cells[1] not in maps:
            problems.append('autorules.csv:%d unknown GT6 recipe map "%s"' % (ln, cells[1]))

    for w in warnings:
        print('  warn  %s' % w)
    for p in problems:
        print('  ERROR %s' % p)
    print('')
    if problems:
        print('CONFIG LINT FAILED: %d problem(s)' % len(problems))
        return 1
    print('CONFIG LINT OK: no typos found (%d warning(s))' % len(warnings))
    return 0


if __name__ == '__main__':
    sys.exit(main())
