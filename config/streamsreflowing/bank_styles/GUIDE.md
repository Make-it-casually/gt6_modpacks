# Streams Reflowing — Bank Styles and Bank Features Guide

This guide tells you how to change the land around your streams. It is written in
simplified technical English. The sentences are short. Each instruction is one step.

Streams Reflowing has two systems for the banks:

- **Bank style** — the blocks of a channel, in rings out from the water: the bed, the
  waterline, the bank, and more rings if you want them.
- **Bank feature** — scenery on a bank. A style can put a feature on one of its rings
  (fallen logs on the bank, for example), or a feature can place itself by biome.

You edit both systems with JSON files. The JSON is the same for the config folder and for a
datapack.

---

## 1. Before you start

Obey these three rules for both systems.

1. The mod reads the files one time, at game start.
2. A change applies to new chunks only. The mod does not change land that exists already.
3. After you edit a file, load the change again:
   - Config folder: stop the game. Then start the game again.
   - Datapack: run the `/reload` command, or make a new world.

---

## 2. Two ways to add a file

You can put a bank style or a bank feature in two places. Use the place that is correct for
your task.

| Place | Folder | Use it for |
|---|---|---|
| Config folder | `config/streamsreflowing/` on one instance | A quick change on your own game. It wins over a datapack. |
| Datapack | `data/<namespace>/streamsreflowing/` in a datapack or a mod | A change that you send with a modpack. |

`<namespace>` is a name that you choose. Use only lowercase letters, numbers, and the
`_` sign.

---

## 3. Bank styles

A bank style paints the ground around the water in **rings**, from the water outward.

```
   top_bank     (a second bank ring, if you want two)
      bank      (the cut slope beside the water)
  ~~~~~~~~~~~~  (the waterline, a strip at the water surface)
      bed       (the floor below the water)
```

### 3.1 One unit: percent of the stream's width

Every size in a style is a **percent of the stream's width** at that place, bank to bank.
`100` means "as wide as the stream is right here". A wide river gets wide rings. A brook
gets narrow rings. The same file does both.

Two rules:

- A ring whose size is not zero is never thinner than **one block**. A brook keeps its waterline.
- A pattern is never finer than **two blocks**. Blobs on a brook are small specks.

A lake or sea shore counts as a stream **32 blocks wide**. It is painted under the water only
(the bed and the waterline).

### 3.2 Where the file goes

- **Config folder:** `config/streamsreflowing/bank_styles/`
  At the first game start, the mod makes this folder. It puts a `README.md` file and an
  `examples/` folder in it. The `examples/` folder has one small, complete style for each
  technique in this guide (see 3.11). The top folder is empty at the start.

  To change a style, do these steps:
  1. Copy a file from the `examples/` folder to the top folder, or write your own.
  2. Edit the copy in the top folder.

  The mod loads the top-level files only. It does not load the `examples/` folder.

  You do not need the mod's own files to change a biome: a style you write wins over the
  shipped one for the biomes it names. 3.2 lists what each biome uses now.

- **Datapack:** `data/<namespace>/streamsreflowing/bank_style/<name>.json`
  To replace a default style, use the same file name as the default.

### 3.3 The rings

Each ring is a block, a list of blocks, or an object (see 3.5). The rings sit side by side,
from the water outward. A later ring does not paint over an earlier one.

This is one bank, cut through. The water is on the left.

```
                       water surface
                            |   above (up the bank)
    ~~~~~~~~~~~~~~~~~~~~~~~~+~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                            |   below (under the water)
         bed                |  bank      | top_bank | rings...
    (the floor under water) |<-------- the cut -------->|
```

**Sizes are measured in two different ways.** Both are a percent of the stream's width.

| Ring | What it covers | How its size is measured | Default |
|---|---|---|---|
| `bed` | the floor under the water | no size: everything below the waterline strip | — |
| `waterline` | a band hugging the water surface | UP and DOWN from the surface: `below` under it, `above` onto the bank | `below` 10, `above` 0 |
| `bank` | the cut slope beside the water | OUTWARD from the water's edge | `reach` 100, or 50 with a `top_bank` |
| `top_bank` | a second band, further out | OUTWARD from where `bank` stopped | `reach` the rest of the cut |
| `rings: [ ... ]` | any number of further bands | OUTWARD from where the last one stopped | `reach` required |

**The reaches add up.** A `reach` is the width of that band, not its distance from the water.
A `bank` of 50 with a `top_bank` of 30 means: bank from 0 to 50, top_bank from 50 to 80.

**The cut is the budget.** A stream cuts the ground on each side as wide as the stream itself,
never less than 5 blocks. `bank`, `top_bank` and `rings` share that cut.

- You do not have to reach 100. Stop early and the rest of the cut keeps what the carve left.
- Go past 100 and the extra paints nothing: there is no cut ground out there.
- Write no sizes at all and the defaults fill the cut for you.

`bed`, `waterline` and `bank` are always there. If you leave one out, it takes gravel,
coarse dirt, or the column's own material. A `top_bank` or extra ring you leave out is simply
not there.

Two blocks have a special meaning in any ring:

- `streamsreflowing:chameleon` — the column's own material: dirt under grass, sandstone under
  sand, terracotta in badlands.
- `minecraft:air` — leave that share of the ring as it was.

`bed`'s and `waterline`'s `features` (3.7) plant IN the water, not beside it: `bed` on the
submerged floor, `waterline` at the open surface. `bank`, `top_bank` and any extra ring still
plant on dry land, exactly as before.

### 3.4 The style fields

| Field | Type | Default | Function |
|---|---|---|---|
| `biomes` | list of ids | none | Use this style in these exact biomes. |
| `tags` | list of tags | none | Use this style in a biome that has ALL of these tags. |
| `exclude_biomes` | list of ids | none | Never use this style in these exact biomes. |
| `exclude_tags` | list of tags | none | Never use this style in a biome that has ANY of these tags. |
| `star` | true or false | false | This style beats every unstarred style at its level (see 3.8). |
| `enabled` | true or false | true | Set `false` to leave the carved land raw here. |
| `cohesion` | 0.0 to 1.0 | inferred | How firmly the banks hold. 0 = loose sand or gravel: streams there spread wide and shallow and can form bars. 1 = clay or roots: narrow, deep, no bars. Leave it out and the mod infers it from the biome tags. |
| `bed`, `waterline`, `bank`, `top_bank` | block, list, or ring object | see 3.3 | The rings. |
| `rings` | list of ring objects | none | More rings outward. Each needs `reach`. |
| `_about` (or any field that starts with `_`) | anything | none | A note for people. The mod ignores it. |

Write tags without `#`. Write `"minecraft:is_forest"`, not `"#minecraft:is_forest"`. A tag
with `#` stops the file from loading.

### 3.5 A ring as an object

A bare block or list is the short form. The object form adds more:

```json
"bank": {
  "reach": 50,
  "block": ["minecraft:cobblestone", "streamsreflowing:chameleon"],
  "pattern": "blobs",
  "scale": 30,
  "edge_noise": 0.3,
  "overrides": [ ... ],
  "features": [ ... ]
}
```

| Field | Default | Function |
|---|---|---|
| `block` | required | One block, or a list of blocks mixed by `pattern`. |
| `reach`, `above`, `below` | see 3.3 | The ring's size, in percent of the stream's width. |
| `pattern` | `blobs` | How a list is mixed: `blobs` (patches), `bands` (stripes along the stream), `speckle` (a random pick per column). |
| `scale` | `30` | The patch size or the stripe width, in percent of the stream's width. |
| `edge_noise` | `0.3` | How softly the ring's outer edge blends into the next ring. 0 = a sharp line. 1 = very soft. |
| `overrides` | none | Swap the ring's blocks where the stream is a certain way (3.6). |
| `features` | none | Scenery placed in this ring (3.7). |

A list is divided into equal shares, one share for each block. Repeat a block for more
shares. `["minecraft:mud", "minecraft:air", "minecraft:air"]` paints one third with mud and
leaves two thirds natural.

### 3.6 Overrides: where the stream is a certain way

An override is a sticker on the ring. `when` names stream properties with a comparison.
`fade` says how softly the sticker comes in. The mod tries the overrides top to bottom. The
first one whose roll succeeds paints the column. If none does, the ring's own block paints it.

```json
"overrides": [
  { "when": { "slope": "> 0.5" }, "fade": 0.1, "block": "minecraft:stone" },
  { "when": { "bend": "> 0.3", "side": "inner" }, "block": "minecraft:gravel" },
  { "when": { "to_mouth": "< 0.2", "width": "> 0.4" }, "block": ["minecraft:sand", "minecraft:gravel"], "scale": 60 }
]
```

| Field | Default | Function |
|---|---|---|
| `when` | required | Properties and comparisons. All must hold. Comparisons: `"> 0.3"`, `">= 0.3"`, `"< 0.3"`, `"<= 0.3"`. |
| `fade` | `0.1` | At the threshold the override claims half the columns. `fade` past it, all of them. |
| `block` | required | The sticker's block or list. |
| `pattern`, `scale` | the ring's | As for a ring. |

Every property runs from 0 to 1:

| Property | 0 | 1 | Anchors |
|---|---|---|---|
| `slope` | flat | a sheer drop | 0.05 gentle, 0.2 brisk, 0.5 steep |
| `width` | a 1-block brook | a 32-block river | 0.25 = 8 blocks |
| `speed` | still | the fastest the mod models | |
| `bend` | straight | a hairpin | 0.2 = a clear curve |
| `side` | | | `"inner"` (the inside of the bend, where deposits form) or `"outer"` (the cut bank) |
| `to_mouth` | at the outlet | 16 stream widths upstream or further | 0.2 = the last few widths before the sea or lake |
| `to_junction` | at a confluence | 16 widths from any | |
| `flat_run` | just steepened | a long flat, settled reach | what braids and bars follow |

### 3.7 Features on a ring

```json
"features": [
  { "id": "riverside_logs", "chance": 2 },
  { "id": "mypack:mossy_boulder", "chance": 1 }
]
```

`id` names a bank feature **definition**: a file in `config/streamsreflowing/bank_features/`
by its name without `.json`, or a datapack entry as `namespace:name`. It does not name a placed
feature directly. `"id": "streamsreflowing:fallen_log_a"` places nothing, because no definition
has that name. Make a definition that lists the placed features, then name the definition.

`chance` is the percent of the sampled sites in this ring that get one. Keep it low: 1 to 5.

Where a feature lands depends on its ring. `bank`, `top_bank` and any extra ring plant on dry
land beside the water, as always. `bed` plants ON the submerged floor, water directly above —
sea grass, kelp, coral and the like. `waterline` plants AT the open water's surface, water
directly below and air above — a lily pad is the obvious case. One limit: a `bed` or `waterline`
feature never appears in a biome tagged `#streamsreflowing:no_underwater_flora` (frozen and dry
biomes by default), the same opt-out the `underwaterFlora` setting honours. A feature that
cannot survive where its ring puts it is skipped quietly, never a crash.

The `bank_features/examples/` folder has four definitions to start from: `riverside_logs.json`
(fallen logs) and `riverside_stumps.json` (log stumps) for the dry rings, `riverside_lilies.json`
(lily pads) for a `waterline` ring and `riverside_seagrass.json` for a `bed` ring. Copy them into
`bank_features/`. Then `{ "id": "riverside_logs", "chance": 3 }` works in any ring.
See section 4 for the feature files.

### 3.8 Which style the mod uses

For each column of a stream, the mod uses one style only.

1. An exact biome match (`biomes`) wins over all tag matches. Both win over a style with no
   `biomes` and no `tags`.
2. At each of those levels, a **starred** style (`"star": true`) wins over every unstarred
   style, whatever their tags.
3. Then a config-folder style wins over a datapack style. Among tag styles, the style with
   the most matching tags wins. A tag style matches only if the biome has EVERY tag in the list.
4. `exclude_biomes` and `exclude_tags` are a block list. The mod does not use a style for a
   biome on its exclude list. The mod then uses the next style.

To write "all overworld biomes but not frozen biomes", do this:

```json
{ "tags": ["minecraft:is_overworld"], "exclude_tags": ["minecraft:is_frozen"] }
```

### 3.9 Bank style examples

**The smallest useful style:**
```json
{ "biomes": ["minecraft:plains"], "bed": "minecraft:mud", "waterline": "minecraft:mud", "bank": "streamsreflowing:chameleon" }
```

**Stone mountain streams, but not when frozen. Skin the bed and the waterline. Keep the bank
natural:**
```json
{
  "tags": ["minecraft:is_mountain"],
  "exclude_tags": ["minecraft:is_frozen"],
  "bed": "minecraft:stone",
  "waterline": "minecraft:gravel",
  "bank": "minecraft:air"
}
```

**Leave the swamp streams raw:**
```json
{ "biomes": ["minecraft:swamp"], "enabled": false }
```

**Everything at once:**
```json
{
  "tags": ["minecraft:is_mountain"],
  "exclude_biomes": ["minecraft:stony_peaks"],
  "star": true,
  "cohesion": 0.8,
  "bed": ["minecraft:gravel", "minecraft:stone"],
  "waterline": { "above": 5, "below": 15, "block": "minecraft:mossy_cobblestone", "edge_noise": 0.35 },
  "bank": {
    "reach": 50,
    "block": ["minecraft:cobblestone", "streamsreflowing:chameleon"],
    "pattern": "blobs", "scale": 30, "edge_noise": 0.3,
    "overrides": [
      { "when": { "slope": "> 0.5" }, "fade": 0.1, "block": "minecraft:stone" },
      { "when": { "bend": "> 0.3", "side": "inner" }, "block": "minecraft:gravel" }
    ],
    "features": [ { "id": "riverside_logs", "chance": 2 } ]
  },
  "top_bank": { "reach": 30, "block": ["streamsreflowing:chameleon", "minecraft:air"], "edge_noise": 0.5 },
  "rings": [
    { "reach": 20, "block": ["minecraft:coarse_dirt", "minecraft:air", "minecraft:air"], "pattern": "speckle" }
  ]
}
```

### 3.10 Old files

A style written for version 2.13 or earlier works unchanged. Its fields mean the same rings:

| Old field | Now means |
|---|---|
| `bed` / `waterline` / `bank` as a block or list | the same ring, `speckle` pattern, with every old default |
| `waterline_below` / `waterline_above` (blocks) | the waterline's `below` / `above`, still counted in blocks |
| `underwater_noise` / `above_water_noise` | `edge_noise` of the bed ring and of the waterline ring |
| `bed_enabled` / `waterline_enabled` / `bank_enabled: false` | that ring painted as `minecraft:air` |
| `point_bar` | an override on the bed for the inside of bends |

If a file gives a ring as an object AND the old fields for it, the object wins.

### 3.11 Worked examples: one file per technique

The folder `config/streamsreflowing/bank_styles/examples/` has one small, complete style for
each technique. Each file explains itself in its `_about` field. To try one, copy it to
`config/streamsreflowing/bank_styles/`. Then start the game again and make a new world.

| File | Technique | What to look for |
|---|---|---|
| `01_smallest.json` | The smallest complete style | Mud streams in mangrove swamps. |
| `02_rings_and_sizes.json` | Every ring and its size | Four bands of blocks out from the water in meadows. |
| `03_patterns_and_mixes.json` | `blobs`, `bands`, `speckle`, `scale`, `edge_noise`, weighted lists, `air` | Striped terracotta banks in the badlands. |
| `04_overrides.json` | All eight stream properties, the comparisons, `fade`, order | Sand inside bends, stone on steep reaches, mud on long flats in old-growth taiga. |
| `05_scenery_on_rings.json` | Features on rings | Fallen logs on dark forest banks. Needs the two definitions (3.7). |
| `06_matching_and_priority.json` | `biomes` and `tags` together, excludes, `star`, `cohesion` | Jungle streams, vanilla and modded, but not bamboo jungle. |
| `07_leave_raw.json` | `enabled: false` | Unpainted streams in mushroom fields. |
| `08_everything.json` | Every field there is: targeting, all five ring kinds, all three patterns, all eight stream properties, scenery under the water, at the surface and on land | Windswept hills and mountain streams: striped banks, gravel beds with sand inside the bends, lily pads and seagrass, logs and stumps. Needs the four definitions (3.7). |
| `09_old_2_13_format.json` | The old format | A 2.13 river style that still loads. |

Some things to know:

- An example for a biome that already has a style of its own replaces that style. A copied
  example is a config file, and a config file wins over the mod's own style at the same level.
- A tag example paints only the biomes that no style names by name. The mod's own styles name
  many vanilla biomes by name. To take one over, add it to `biomes`.
- The examples use vanilla blocks and biomes, so they load on every Minecraft version the mod
  supports.

---

## 4. Bank features

A bank feature file is one of two things.

- A **definition**: only `features` (and maybe `chance`). It places nothing by itself. A bank
  style puts it on a ring with `"features": [{ "id": "<file name without .json>", "chance": 2 }]`.
  This is the way to put scenery exactly where you want it.
- A **self-placing entry**: `features` plus `biomes` and/or `tags`. It runs on its own wherever
  those match. Every matching entry runs. There is no selection contest.

### 4.1 Where the file goes

- **Config folder:** `config/streamsreflowing/bank_features/`
  At the first game start, the mod puts a `README.md` file and an `examples/` folder here.
  Copy an example to the top folder. Then edit it. The mod loads the top-level files only.

- **Datapack:** `data/<namespace>/streamsreflowing/bank_feature/<name>.json`
  A style names a datapack entry as `namespace:name`.

### 4.2 The fields

| Field | Type | Default | Function |
|---|---|---|---|
| `features` | list of ids | none (required) | The placed features. ONE of them is chosen per placement. |
| `biomes` | list of ids | none | Run this entry on its own in these exact biomes. |
| `tags` | list of tags | none | Run this entry on its own in a biome that has ALL of these tags. |
| `exclude_biomes` | list of ids | none | Never run this entry in these exact biomes. |
| `exclude_tags` | list of tags | none | Never run this entry in a biome that has ANY of these tags. |
| `chance` | 0 to 100 | 100 | The chance, in percent, per sampled bank site. A style's ring can give its own `chance` instead. |

If you give no `biomes` and no `tags`, the file is a definition. It places nothing until a
style names it.

### 4.3 Which sites get a feature

The mod samples a few sites on each bank per chunk. At a site:

1. The site's style is found, and the ring the site is in. Each feature on that ring rolls
   its `chance`. The first hit places, and the site is done.
2. Otherwise each self-placing entry that includes the biome (and does not exclude it) rolls
   its `chance`. The first hit places.

**Warning:** The mod puts each feature on the bank as it is. The mod checks for solid ground
below only, so nothing floats. A tree feature makes trees at the water. Use small features
for the bank, unless you want trees at the water.

### 4.4 Bank feature examples

**A definition, placed by a style (see 3.7).** This is `examples/riverside_logs.json`. Copy it
to `bank_features/riverside_logs.json`, and a style ring names it as `riverside_logs`:
```json
{ "features": ["streamsreflowing:fallen_log_a", "streamsreflowing:fallen_log_b"] }
```

**Another definition,** `examples/riverside_stumps.json`:
```json
{ "features": ["streamsreflowing:fallen_log_stub_a", "streamsreflowing:fallen_log_stub_b"] }
```

The mod's own pieces you can list in a definition: `streamsreflowing:fallen_log_a` and `_b`,
`fallen_log_stub_a` and `_b`, the `_pale` driftwood version of each of those four,
`fallen_tree_small`, `fallen_tree_acacia`, and `fallen_tree_jungle_a` and `_b`.

**Reeds and bushes on overworld banks on their own, but not in frozen biomes:**
```json
{
  "features": ["minecraft:patch_sugar_cane", "minecraft:patch_berry_bush"],
  "tags": ["minecraft:is_overworld"],
  "exclude_tags": ["minecraft:is_frozen"],
  "chance": 30
}
```

---

## 5. Config toggles

These options are in the main config file:

- NeoForge and Forge: `config/streamsreflowing-common.toml`
- Fabric: `config/streamsreflowing.properties`

| Option | Values | Default | Function |
|---|---|---|---|
| `customBanks` | true or false | true | The main switch for bank styles. Set `false` to show raw carved land. |
| `allWaterBanks` | 0, 1, 2 | 1 | Bank styles on other water too: `0` this mod's streams and lakes only, `1` also vanilla rivers, lakes and ponds, `2` also ocean shores. |
| `bankFeatures` | 0 to 3 | 3 | Where bank features may appear: `0` nowhere, `1` this mod's streams, `2` streams and its lakes, `3` every water edge. |

---

## 6. How to make a datapack

Do these steps to make a datapack for your bank files.

1. Make a folder for the datapack. Use any name.
2. Make a `pack.mcmeta` file in that folder. Put this text in it:

```json
{
  "pack": {
    "pack_format": 48,
    "description": "My custom stream banks"
  }
}
```

3. Set the correct `pack_format` number for your Minecraft version:

| Minecraft version | `pack_format` |
|---|---|
| 1.20.1 | 15 |
| 1.21 / 1.21.1 | 48 |

   The number is different for each Minecraft version, and it changes often. For a version
   that is not in the table, search online for its data pack format number.

   **Note:** Minecraft shows a warning for a wrong `pack_format`, but it loads the datapack in
   most cases. The bank files still work.

4. Make the folders for your files:
   - Bank styles: `data/<namespace>/streamsreflowing/bank_style/`
   - Bank features: `data/<namespace>/streamsreflowing/bank_feature/`
5. Put your JSON files in the correct folder.
6. Put the datapack folder in a world:
   - Put it in the `datapacks/` folder of the world save. Then run `/reload`, or make a new
     world.
7. To use the datapack in all worlds, use a global-datapack mod.

---

## 7. Quick reference

| Task | Action |
|---|---|
| Change the bank blocks in one biome | Make a bank style with `biomes` or `tags` and `bed`/`waterline`/`bank`. |
| Two bank zones | Add `top_bank`. `bank` takes the inner half of the cut, `top_bank` the rest. |
| Patches instead of a random mix | A list of blocks is patches already. Set `scale` for the patch size. |
| Stripes along the stream | `"pattern": "bands"` on the ring. |
| Rock on steep reaches, sand near the mouth | An `overrides` entry with `"when": { "slope": "> 0.5" }` or `{ "to_mouth": "< 0.2" }`. |
| Gravel on the inside of bends | `"when": { "bend": "> 0.2", "side": "inner" }`. |
| Make one style always win in its biomes | `"star": true`. |
| Leave one biome's stream raw | `{ "biomes": [...], "enabled": false }`. |
| Keep the bank natural, skin the bed | `"bank": "minecraft:air"`. |
| Put scenery on a ring | A feature definition file, named in the ring's `features`. |
| Send it with a modpack | Put the JSON in `data/<namespace>/streamsreflowing/bank_style` or `bank_feature`. |
| See a technique working | Copy a file from `bank_styles/examples/` (3.11). |
| Keep notes in a file | Any field that starts with `_`, for example `"_about"`. |

