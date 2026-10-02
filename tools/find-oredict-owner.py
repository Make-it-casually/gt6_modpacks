"""
Find which mod registers each unknown ore dictionary entry.

For every entry in the unknown list it scans the pack's mod jars for the literal ore dictionary
name in the class constant pools and reports the owning jar. That turns the "which of the 81
create candidates are worth materialising" question into an evidence based decision.

Usage:
    python find-oredict-owner.py [--unknown tools/gt6-unknown-oredict.txt] [--mods <mods dir>]
                                 [--out tools/unknown-oredict-owners.txt]
"""
import argparse
import os
import re
import sys
import zipfile

TOKEN = re.compile(rb'[\x20-\x7e]{6,}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--unknown', default=r'E:\game\minecraft\gt6\tools\gt6-unknown-oredict.txt')
    ap.add_argument('--mods', default=r'E:\game\minecraft\gt6\.minecraft\versions\GT6\mods')
    ap.add_argument('--out', default=r'E:\game\minecraft\gt6\tools\unknown-oredict-owners.txt')
    args = ap.parse_args()

    entries = [l.strip() for l in open(args.unknown, encoding='utf-8', errors='replace')
               if l.strip() and not l.startswith('=')]
    needles = set(entries)
    print('unknown entries to trace: %d' % len(needles))

    owners = {e: [] for e in entries}
    jars = sorted(f for f in os.listdir(args.mods) if f.lower().endswith('.jar'))
    print('scanning %d jars ...' % len(jars))

    for jar in jars:
        path = os.path.join(args.mods, jar)
        try:
            with zipfile.ZipFile(path) as zf:
                found = set()
                for name in zf.namelist():
                    if not name.endswith('.class'):
                        continue
                    try:
                        data = zf.read(name)
                    except Exception:
                        continue
                    for tok in TOKEN.findall(data):
                        try:
                            s = tok.decode('ascii')
                        except Exception:
                            continue
                        if s in needles:
                            found.add(s)
                    if len(found) == len(needles):
                        break
                for s in found:
                    owners[s].append(jar)
        except Exception as exc:
            print('  skip %s (%s)' % (jar, exc))

    matched = [e for e in entries if owners[e]]
    print('entries attributed to a jar: %d / %d' % (len(matched), len(entries)))

    with open(args.out, 'w', encoding='utf-8') as fh:
        fh.write('unknown ore dictionary entry -> registering jar(s)\n')
        fh.write('%d entries, %d attributed\n\n' % (len(entries), len(matched)))
        for e in sorted(entries):
            fh.write('%-36s %s\n' % (e, ', '.join(sorted(owners[e])) if owners[e] else '(not found - registered dynamically or by GT itself)'))
    print('written: %s' % args.out)

    by_jar = {}
    for e in entries:
        for j in owners[e]:
            by_jar.setdefault(j, 0)
            by_jar[j] += 1
    for j, n in sorted(by_jar.items(), key=lambda kv: -kv[1]):
        print('  %-60s %d entries' % (j, n))
    return 0


if __name__ == '__main__':
    sys.exit(main())
