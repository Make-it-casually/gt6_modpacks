# Streams Reflowing -- bank styles (config overrides)

A **bank style** is the blocks a stream, river or lake shore wears, in rings out from the water:
the bed (under water), the waterline (a strip at the surface), the bank (the cut slope beside the water),
an optional second bank ring (`top_bank`), and any more you add.

> **Full guide** (every field, patterns, overrides, features on rings, datapacks): see `GUIDE.md` in this
> folder. This file is the quick reference.

The shipped defaults are NOT in this folder -- they're built into the mod as a datapack, and any other mod
or datapack can add to or override them. This folder is YOUR override layer, applied on top of all of that:
anything you put here wins over a datapack style of equal specificity, so it's the final say.

## How to override
1. Look in `examples/` -- worked styles, one technique each, with notes in every file. 2. Copy one UP
into this folder (or write your own) and edit it. 3. Relaunch.

A style you write here replaces the shipped one for the biomes it names, so you never need the shipped
file itself; `08_everything.json` shows every field there is, and GUIDE.md 3.2 lists what each default
biome uses.

(Files in `examples/` are reference-only and are NOT loaded. Only top-level `*.json` here is active.)

## Learn by example
`examples/` holds one small, complete style per technique, each with notes in its `_about` field
(the mod ignores fields that start with `_`, so you can keep notes in your own files too):

| File | Teaches |
|---|---|
| `01_smallest.json` | the smallest complete style |
| `02_rings_and_sizes.json` | every ring, percent sizes, how the bank rings share the cut |
| `03_patterns_and_mixes.json` | blobs, bands, speckle, patch size, soft edges, weighted lists, air |
| `04_overrides.json` | every stream property, comparisons, fade, order, per-override patterns |
| `05_scenery_on_rings.json` | features on rings (with the two definitions in `bank_features/examples/`) |
| `06_matching_and_priority.json` | biomes + tags together, excludes, star, config over the mod, cohesion |
| `07_leave_raw.json` | turning banks off for a biome |
| `08_everything.json` | every field the format has, in one style: all eight stream properties, all three patterns, scenery in the water and on the land |
| `09_old_2_13_format.json` | the old format, which still works |

## One unit: percent of the stream's width
Every size is a percent of how wide the stream is right there, bank to bank. `100` = as wide as the
stream. A ring that is not zero is never thinner than one block, so a brook keeps its waterline.

## The smallest style
`{ "biomes": ["minecraft:plains"], "bed": "minecraft:mud", "waterline": "minecraft:mud", "bank": "streamsreflowing:chameleon" }`

A ring can be one block, a list of blocks (mixed as patches by default), or an object with more:
`"bank": { "reach": 50, "block": [...], "pattern": "blobs", "scale": 30, "edge_noise": 0.3, "overrides": [...], "features": [...] }`

## Which style a stream uses
Tags are written without `#`: `"tags": ["minecraft:is_forest"]`.
1. **Exact biome** (`biomes`) beats any tag style, and both beat a style with no biomes/tags.
2. Within each of those, a **starred** style (`"star": true`) beats every unstarred one.
3. Then a config style here beats a datapack one; among tag styles, more matching tags beat fewer.

## Special blocks
- `streamsreflowing:chameleon` -- the column's OWN material (dirt under grass, sandstone under sand).
- `minecraft:air` -- leave that share of the ring exactly as it was.

## Old files
A style written for 2.13 or earlier works unchanged: `bed`/`waterline`/`bank` as a block, `waterline_below`
and `waterline_above` in blocks, `underwater_noise`/`above_water_noise`, the `_enabled` flags, `point_bar`.

## Shipping a style with a mod / datapack
Put `<name>.json` files at `data/<namespace>/streamsreflowing/bank_style/` in any datapack or mod jar -- they
load automatically. Use the `streamsreflowing` namespace with a default's name to override one of ours.
