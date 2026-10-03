# Streams Reflowing -- custom bank features

This pass plants features on the land around water. A file here is one of two things:

- A **definition** -- just `features` (and maybe `chance`), no biomes, no tags. It places nothing by itself.
  A bank style puts it on a ring: `"features": [{ "id": "<this file's name without .json>", "chance": 2 }]`
  inside the style's `bank`, `bed` or any other ring. See `examples/riverside_logs.json` and
  `examples/riverside_stumps.json` for dry rings, and `examples/riverside_lilies.json` (lily pads at a
  `waterline`) and `examples/riverside_seagrass.json` (a `bed`) for the wet ones, plus the bank-style
  GUIDE. This is the way to put scenery exactly where you want it. A ring names the DEFINITION, never a
  placed feature: `"id": "streamsreflowing:fallen_log_a"` in a ring places nothing.
- A **self-placing entry** -- `features` plus `biomes` and/or `tags`. It runs on its own wherever those
  match, as it always has. Every matching entry runs (there is no override contest like bank styles have).

- **How often one appears**: `chance` in its file (or in the style's ring, for a definition).
- **Where**: the ring of the style that names it, or `biomes` / `tags` / the excludes.
- **What**: any placed feature by id. The mod's own bank pieces are available to reference --
  `streamsreflowing:fallen_log_a` / `_b`, `fallen_log_stub_a` / `_b` (and their `_pale` driftwood
  variants), `fallen_tree_small`, `fallen_tree_acacia`, `fallen_tree_jungle_a` / `_b` -- and a structure
  you save with a structure block can be placed the same way (see the guide).

> **Full guide** (every field, more examples, datapacks, and bank styles too): see `GUIDE.md` in this
> folder. This file is the quick reference.

## How to add one
1. Look in `examples/example.json` for the shape. 2. Copy it UP into this folder (or write your own) and
edit it. 3. Relaunch. (Files in `examples/` are reference-only and are NOT loaded.)

## Where features place
On the bank around water, bounded by your **bank scenery** setting (`bankFeatures`): 0 = nowhere,
1 = this mod's streams, 2 = also its lakes, 3 = every water edge. Each listed feature is run AT the
chosen column, on sturdy ground, exactly as written -- trees and big features included (you chose them).

A definition on a style's ring follows THAT ring: `bank`, `top_bank` and extra rings plant on the dry
land beside the water; `bed` plants on the submerged floor (water above it -- sea grass, kelp, coral);
`waterline` plants at the open surface (water below, air above -- lily pads). Wet placements are skipped
in biomes tagged `#streamsreflowing:no_underwater_flora`, the same opt-out `underwaterFlora` honours.

## Fields
- `features` : a POOL of PLACED-feature ids -- ONE is chosen at random per placement. Required.
- `biomes` : exact biome ids to include.   `tags` : biome tags the biome must ALL have to include.
  (If both are empty, the file is a DEFINITION and places nothing until a bank style names it.)
- `exclude_biomes` / `exclude_tags` : biomes/tags to drop AFTER the include -- so "all overworld but not
  frozen" is `tags: ["minecraft:is_overworld"]` + `exclude_tags: ["minecraft:is_frozen_ocean", ...]`
  (plus any snowy biomes/tags you want out).
- `chance` : 0-100, the percent chance per sampled SITE (a few are drawn per chunk from each band,
  so density is the same along a brook and a wide river). Default 100.

## Shipping entries with a mod / datapack
Put `<name>.json` files at `data/<namespace>/streamsreflowing/bank_feature/` in any datapack or mod jar --
they load automatically and are merged with this folder.
