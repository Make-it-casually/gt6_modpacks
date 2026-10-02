"""
Classify the ore dictionary entries GT6 itself could not resolve.

Source: the "Outputting Unknown Materials" section GT6 writes into logs/oredict.log.
Output: a materials.csv suggestion file plus a full classification report.

Usage:
    python classify-unknown.py [--unknown tools/gt6-unknown-oredict.txt]
                               [--prefixes tools/gt6-prefixes.txt]
                               [--materials tools/gt6-material-names.txt]
                               [--out <config dir>] [--report tools/unknown-oredict-report.txt]
"""
import argparse
import os
import re
import sys

# prefixes where a GT6 material really is the right answer (a new material can be created for them);
# everything else (bottle, food, plant, tree, tool, ...) is an item, not a material
MATERIAL_PREFIXES = set("""
ore oreNether oreEnd oreGravel oreSand oreSandstone oreRaw orePoor oreRich oreSmall oreDense
crushed crushedPurified crushedCentrifuged crushedTiny crushedPurifiedTiny crushedCentrifugedTiny
dust dustSmall dustTiny dustImpure dustPure dustRefined dustDiv72
gem gemChipped gemFlawed gemFlawless gemExquisite gemPolished gemRaw gemUncut gemOre
ingot ingotDouble ingotTriple ingotQuadruple ingotQuintuple ingotHot
nugget tiny
plate plateDouble plateTriple plateQuadruple plateQuintuple plateDense plateTiny plateCurved
gear gearGtSmall
stick stickLong rod wire wireFine foil screw bolt ring spring springSmall
frame frameGt lens
block blockIngot blockPlate blockGem blockDust blockRaw blockSolid
cluster shard crystal crystalPure crystalline rawOreChunk pellet round
billet lump powder reduced refined clump
""".split())


def normalize(s):
    return re.sub(r'[^A-Za-z0-9]', '', s).lower()


def levenshtein(a, b):
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--unknown', default=r'E:\game\minecraft\gt6\tools\gt6-unknown-oredict.txt')
    ap.add_argument('--prefixes', default=r'E:\game\minecraft\gt6\tools\gt6-prefixes.txt')
    ap.add_argument('--materials', default=r'E:\game\minecraft\gt6\tools\gt6-material-names.txt')
    ap.add_argument('--runtime-materials',
                    default=r'E:\game\minecraft\gt6\.minecraft\versions\GT6\config\gt6bridge\materials-known.txt')
    ap.add_argument('--out', default=r'E:\game\minecraft\gt6\tools')
    ap.add_argument('--report', default=r'E:\game\minecraft\gt6\tools\unknown-oredict-report.txt')
    args = ap.parse_args()

    materials = []
    for path in (args.runtime_materials, args.materials):
        if os.path.isfile(path):
            materials = [l.strip() for l in open(path, encoding='utf-8', errors='replace') if l.strip()]
            print('material name list: %s (%d names)' % (path, len(materials)))
            break
    prefixes = sorted((l.strip() for l in open(args.prefixes, encoding='utf-8', errors='replace') if l.strip()),
                      key=len, reverse=True)
    entries = [l.strip() for l in open(args.unknown, encoding='utf-8', errors='replace')
               if l.strip() and not l.startswith('=')]
    print('unknown ore dictionary entries: %d, GT6 prefixes: %d' % (len(entries), len(prefixes)))

    by_norm = {}
    for m in materials:
        by_norm.setdefault(normalize(m), m)

    bind, create, ignore = [], [], []
    for entry in entries:
        prefix = None
        token = None
        for p in prefixes:
            if len(entry) > len(p) and entry.lower().startswith(p.lower()):
                rest = entry[len(p):]
                if rest and rest[0].isupper() and not rest.isdigit():
                    prefix, token = p, rest
                    break
        if prefix is None:
            ignore.append((entry, 'no GT6 prefix (plain item / block name)'))
            continue
        if prefix not in MATERIAL_PREFIXES:
            ignore.append((entry, 'prefix "%s" is an item prefix, not a material' % prefix))
            continue
        if token in materials:
            bind.append((token, token, 'exact'))
            continue
        norm = normalize(token)
        if norm in by_norm:
            bind.append((token, by_norm[norm], 'ignoring case and separators'))
            continue
        best, best_d = None, 99
        for m in materials:
            d = levenshtein(norm, normalize(m))
            if d < best_d:
                best, best_d = m, d
        # a fuzzy match is only trusted for tokens long enough to be a name and when the two names
        # share a real prefix - otherwise "Sol" would be bound to "SO2" and "Slime" to "Lime"
        if best is not None and len(norm) >= 5:
            norm_best = normalize(best)
            common = 0
            while common < min(len(norm), len(norm_best)) and norm[common] == norm_best[common]:
                common += 1
            if best_d <= max(1, len(norm) // 4) and common >= 4:
                bind.append((token, best, 'close spelling (distance %d, shared prefix %d)' % (best_d, common)))
                continue
        create.append((token, prefix, entry))

    os.makedirs(args.out, exist_ok=True)
    csv_path = os.path.join(args.out, 'materials-from-oredict-log.csv')
    seen_rows = set()
    with open(csv_path, 'w', encoding='utf-8') as fh:
        fh.write('# generated from GT6\'s own "Outputting Unknown Materials" list (logs/oredict.log)\n')
        fh.write('# syntax: <oredictMaterialToken>,<gt6Material|create|->[,note]\n')
        fh.write('# rows below are suggestions - review before merging into materials.csv\n')
        for token, target, why in sorted(bind):
            key = (token, target)
            if key in seen_rows:
                continue
            seen_rows.add(key)
            fh.write('%s,%s,auto: bind to existing GT6 material (%s)\n' % (token, target, why))
        for token, prefix, entry in sorted(create):
            key = (token, 'create')
            if key in seen_rows:
                continue
            seen_rows.add(key)
            fh.write('%s,create,auto: unknown material, first seen as %s\n' % (token, entry))

    with open(args.report, 'w', encoding='utf-8') as fh:
        fh.write('GT6 unknown ore dictionary entries - classification\n')
        fh.write('unknown entries: %d\n' % len(entries))
        fh.write('  bind to an existing GT6 material : %d\n' % len(bind))
        fh.write('  create a new GT6 material        : %d\n' % len(create))
        fh.write('  not material related (ignored)   : %d\n' % len(ignore))
        fh.write('\n== bind suggestions ==\n')
        for token, target, why in sorted(bind):
            fh.write('  %-32s -> %-28s %s\n' % (token, target, why))
        fh.write('\n== create suggestions (unique tokens) ==\n')
        for token, prefix, entry in sorted(create):
            fh.write('  %-32s prefix=%-14s (%s)\n' % (token, prefix, entry))
        fh.write('\n== ignored ==\n')
        for entry, why in sorted(ignore):
            fh.write('  %-40s %s\n' % (entry, why))

    print('bind to existing material : %d' % len(bind))
    print('create new material       : %d' % len(create))
    print('ignored (not material)    : %d' % len(ignore))
    print('written: %s' % csv_path)
    print('written: %s' % args.report)
    return 0


if __name__ == '__main__':
    sys.exit(main())
