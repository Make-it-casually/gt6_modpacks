import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gtBlock } from '../src/lib/gt6_materials.js'

const REMOVE = [
]

const EDITS = [
  // key.c:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:apple_iron', path: 'key.c', value: RF.steel_plate },
  // key.c:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:battery_clay', path: 'key.c', value: RF.copper_plate },
  // key.d:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:carrot_copper', path: 'key.d', value: RF.copper_plate },
  // key.g:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:charm_knockback_resistance', path: 'key.g', value: RF.gold_plate },
  // key.i:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:charm_water', path: 'key.i', value: RF.gold_plate },
  // key.g:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:charm_world', path: 'key.g', value: RF.gold_plate },
  // key.r:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:collector', path: 'key.r', value: RF.steel_plate },
  // key.c:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_axe', path: 'key.c', value: RF.copper_plate },
  // key.r:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_bars', path: 'key.r', value: RF.copper_plate },
  // key.c:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:copper_boots', path: 'key.c', value: RF.copper_plate },
  // key.i:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_chain', path: 'key.i', value: RF.copper_plate },
  // key.c:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:copper_chestplate', path: 'key.c', value: RF.copper_plate },
  // key.c:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:copper_helmet', path: 'key.c', value: RF.copper_plate },
  // key.c:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_hoe', path: 'key.c', value: RF.copper_plate },
  // key.c:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:copper_leggings', path: 'key.c', value: RF.copper_plate },
  // key.c:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_pickaxe', path: 'key.c', value: RF.copper_plate },
  // key.c:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_pressure_plate', path: 'key.c', value: RF.copper_plate },
  // key.c:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_shovel', path: 'key.c', value: RF.copper_plate },
  // key.c:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:copper_sword', path: 'key.c', value: RF.copper_plate },
  // key.i:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'cyclic:crafting_bag', path: 'key.i', value: RF.steel_plate },
  // key.p:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'cyclic:dropper', path: 'key.p', value: RF.steel_plate },
  // key.i:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:fan', path: 'key.i', value: RF.steel_plate },
  // key.o:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:forester', path: 'key.o', value: RF.copper_plate },
  // key.r:  "#c:ingots/gold"  ->  GT gold_plate
  { id: 'cyclic:gold_bars', path: 'key.r', value: RF.gold_plate },
  // key.i:  "#c:ingots/gold"  ->  GT gold_plate
  { id: 'cyclic:gold_chain', path: 'key.i', value: RF.gold_plate },
  // key.b:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:hopper_gold', path: 'key.b', value: RF.gold_plate },
  // key.c:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:lunchbox', path: 'key.c', value: RF.copper_plate },
  // key.i:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:mob_container_empty', path: 'key.i', value: RF.gold_plate },
  // key.i:  "minecraft:copper_ingot"  ->  GT copper_plate
  { id: 'cyclic:peat_farm', path: 'key.i', value: RF.copper_plate },
  // key.i:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:scepter_build', path: 'key.i', value: RF.steel_plate },
  // key.o:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:scepter_build', path: 'key.o', value: RF.copper_plate },
  // key.i:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:scepter_offset', path: 'key.i', value: RF.steel_plate },
  // key.o:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:scepter_offset', path: 'key.o', value: RF.copper_plate },
  // key.i:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:scepter_replace', path: 'key.i', value: RF.steel_plate },
  // key.o:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:scepter_replace', path: 'key.o', value: RF.copper_plate },
  // ingredients[0]:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:shapeless/copper_nugget', path: 'ingredients[0]', value: RF.copper_plate },
  // key.i:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:shears_obsidian', path: 'key.i', value: RF.steel_plate },
  // ingredients[2]:  "#c:ingots/gold"  ->  GT gold_plate
  { id: 'cyclic:solidifier/solidifier_amberalt', path: 'ingredients[2]', value: RF.gold_plate },
  // ingredients[1]:  "#c:ingots/gold"  ->  GT gold_plate
  { id: 'cyclic:solidifier/solidifier_charm_home', path: 'ingredients[1]', value: RF.gold_plate },
  // ingredients[2]:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:solidifier/solidifier_charm_wing', path: 'ingredients[2]', value: RF.copper_plate },
  // ingredients[0]:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'cyclic:solidifier/solidifier_plate_launch', path: 'ingredients[0]', value: RF.copper_plate },
  // ingredients[0]:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:solidifier/solidifier_scepter_hypno', path: 'ingredients[0]', value: RF.gold_plate },
  // ingredients[1]:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'cyclic:solidifier/solidifier_scepter_randomize', path: 'ingredients[1]', value: RF.steel_plate },
  // key.t:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:spikes_iron', path: 'key.t', value: RF.steel_plate },
  // key.i:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:stirrups', path: 'key.i', value: RF.steel_plate },
  // key.i:  "minecraft:gold_ingot"  ->  GT gold_plate
  { id: 'cyclic:stirrups_reverse', path: 'key.i', value: RF.gold_plate },
  // key.i:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'cyclic:tank', path: 'key.i', value: RF.steel_plate },
  // key.s:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'cyclic:trash', path: 'key.s', value: RF.steel_plate },
  // key.r:  "#c:ingots/gold"  ->  GT gold_plate
  { id: 'cyclic:user', path: 'key.r', value: RF.gold_plate },
]

const GATES = [
  // pattern:  ["ddd","rer","iii"]  ->  [ddd, rer, iZi]
  { id: 'cyclic:anvil', path: 'pattern', value: ['ddd', 'rer', 'iZi'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:anvil', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["ddd"," s ","rfr"]  ->  [ddd,  s , rZr]
  { id: 'cyclic:anvil_magma', path: 'pattern', value: ['ddd', ' s ', 'rZr'] },
  { id: 'cyclic:anvil_magma',
    path: 'key',
    value: { "s": "#c:storage_blocks/cobblestone",
      "d": "minecraft:magma_block",
      "r": "minecraft:obsidian",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["ddd"," d ","sss"]  ->  [ddd,  d , sZs]
  { id: 'cyclic:anvil_void', path: 'pattern', value: ['ddd', ' d ', 'sZs'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:anvil_void', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["cbc","bab","cbc"]  ->  [cbc, bab, cZc]
  { id: 'cyclic:battery', path: 'pattern', value: ['cbc', 'bab', 'cZc'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:battery', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["cbc","bab","cbc"]  ->  [cbc, bab, cZc]
  { id: 'cyclic:battery_clay', path: 'pattern', value: ['cbc', 'bab', 'cZc'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:battery_clay', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["sss","sbs","ooo"]  ->  [sss, sbs, oZo]
  { id: 'cyclic:beacon', path: 'pattern', value: ['sss', 'sbs', 'oZo'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:beacon', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["sss","s s","bcb"]  ->  [sss, s s, bZb]
  { id: 'cyclic:beacon_redstone', path: 'pattern', value: ['sss', 's s', 'bZb'] },
  { id: 'cyclic:beacon_redstone',
    path: 'key',
    value: { "b": "#c:storage_blocks/redstone",
      "s": "#c:glass/dark",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["sss","sbs","ooo"]  ->  [sss, sbs, oZo]
  { id: 'cyclic:beacon_sponge', path: 'pattern', value: ['sss', 'sbs', 'oZo'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:beacon_sponge', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["rlr","g g","ooo"]  ->  [rlr, g g, oZo]
  { id: 'cyclic:breaker', path: 'pattern', value: ['rlr', 'g g', 'oZo'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:breaker', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["dgd","gxg","dad"]  ->  [dgd, gxg, dZd]
  { id: 'cyclic:charm_xp_blocker', path: 'pattern', value: ['dgd', 'gxg', 'dZd'] },
  { id: 'cyclic:charm_xp_blocker',
    path: 'key',
    value: { "x": "#c:storage_blocks/flint",
      "g": "#c:nuggets/copper",
      "d": "minecraft:gray_concrete_powder",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["rlr","gqg","hhh"]  ->  [hlr, gqg, hZh]
  { id: 'cyclic:collector', path: 'pattern', value: ['hlr', 'gqg', 'hZh'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:collector', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["rlr","gqg","hhh"]  ->  [hlr, gqg, hZh]
  { id: 'cyclic:collector_fluid', path: 'pattern', value: ['hlr', 'gqg', 'hZh'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:collector_fluid', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["r r","rcr","r r"]  ->  [  r, rcr, rZr]
  { id: 'cyclic:conveyor', path: 'pattern', value: ['  r', 'rcr', 'rZr'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:conveyor', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["pip","cbc","pip"]  ->  [pip, cbc, pZp]
  { id: 'cyclic:crusher', path: 'pattern', value: ['pip', 'cbc', 'pZp'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:crusher', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["dcd"," q ","r r"]  ->  [ cd,  q , rZr]
  { id: 'cyclic:detector_entity', path: 'pattern', value: [' cd', ' q ', 'rZr'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:detector_entity', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["dcd"," q ","r r"]  ->  [ cd,  q , rZr]
  { id: 'cyclic:detector_item', path: 'pattern', value: [' cd', ' q ', 'rZr'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:detector_item', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["c c"," q ","r r"]  ->  [  c,  q , rZr]
  { id: 'cyclic:detector_moon', path: 'pattern', value: ['  c', ' q ', 'rZr'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:detector_moon', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["c c"," q ","r r"]  ->  [  c,  q , rZr]
  { id: 'cyclic:detector_weather', path: 'pattern', value: ['  c', ' q ', 'rZr'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:detector_weather', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  [" i ","iri","sis"]  ->  [ i , iri, sZs]
  { id: 'cyclic:fan', path: 'pattern', value: [' i ', 'iri', 'sZs'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:fan', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["pip","cbc","pip"]  ->  [pip, ibc, pZp]
  { id: 'cyclic:generator_fluid', path: 'pattern', value: ['pip', 'ibc', 'pZp'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:generator_fluid', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["pip","cbc","pip"]  ->  [pip, cbc, pZp]
  { id: 'cyclic:generator_food', path: 'pattern', value: ['pip', 'cbc', 'pZp'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:generator_food', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["pip","cbc","pip"]  ->  [iip, cbc, pZp]
  { id: 'cyclic:generator_fuel', path: 'pattern', value: ['iip', 'cbc', 'pZp'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:generator_fuel', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["pip","cbc","pip"]  ->  [pip, cbc, pZp]
  { id: 'cyclic:generator_item', path: 'pattern', value: ['pip', 'cbc', 'pZp'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:generator_item', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["cbc","cec","cpc"]  ->  [cbc, cec, cZc]
  { id: 'cyclic:generator_solar', path: 'pattern', value: ['cbc', 'cec', 'cZc'] },
  { id: 'cyclic:generator_solar',
    path: 'key',
    value: { "e": "cyclic:gem_amber",
      "b": "minecraft:lapis_lazuli",
      "c": "#c:nuggets/copper",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["ror","gbg","sss"]  ->  [ror, gbg, sZs]
  { id: 'cyclic:harvester', path: 'pattern', value: ['ror', 'gbg', 'sZs'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:harvester', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["sbs","bxb","sbs"]  ->  [sbs, bxb, sZs]
  { id: 'cyclic:magnet_block', path: 'pattern', value: ['sbs', 'bxb', 'sZs'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:magnet_block', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["rlr","gqg","hhh"]  ->  [rlr, gqg, hZh]
  { id: 'cyclic:melter', path: 'pattern', value: ['rlr', 'gqg', 'hZh'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:melter', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["rsr","g g","ooo"]  ->  [rsr, g g, oZo]
  { id: 'cyclic:placer', path: 'pattern', value: ['rsr', 'g g', 'oZo'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:placer', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["r r","gbg","ooo"]  ->  [r r, gbg, oZo]
  { id: 'cyclic:placer_fluid', path: 'pattern', value: ['r r', 'gbg', 'oZo'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:placer_fluid', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  [" gd"," ig","i  "]  ->  [ gd,   g, iZ ]
  { id: 'cyclic:prospector', path: 'pattern', value: [' gd', '  g', 'iZ '] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:prospector', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["rlr","gqg","hhh"]  ->  [rlr, gqg, hZh]
  { id: 'cyclic:solidifier', path: 'pattern', value: ['rlr', 'gqg', 'hZh'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:solidifier', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["c c","dbd","c c"]  ->  [c c,  bd, cZc]
  { id: 'cyclic:sprinkler', path: 'pattern', value: ['c c', ' bd', 'cZc'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:sprinkler', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["igi","gog","igi"]  ->  [ggi, gog, iZi]
  { id: 'cyclic:tank', path: 'pattern', value: ['ggi', 'gog', 'iZi'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:tank', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  [" s ","ncn","nnn"]  ->  [ s , ncn, nZn]
  { id: 'cyclic:trash', path: 'pattern', value: [' s ', 'ncn', 'nZn'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:trash', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'cyclic:shapeless/tank_wipenbt', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Cyclic', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
