import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gt, gtBlock, gtIngredient } from '../src/lib/gt6_materials.js'

const REMOVE = [
]

const EDITS = [
  { id: 'witchery:arthana', path: 'key.I', value: RF.gold_plate },
  { id: 'witchery:black_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:blood_crucible', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:blue_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:brazier', path: 'key.B', value: RF.steel_plate },
  { id: 'witchery:brown_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:cage_1', path: 'key.E', value: RF.steel_plate },
  { id: 'witchery:cage_2', path: 'key.B', value: RF.steel_plate },
  { id: 'witchery:cane_sword', path: 'key.G', value: RF.gold_plate },
  { id: 'witchery:cauldron', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:censer', path: 'key.G', value: RF.gold_plate },
  { id: 'witchery:censer_long', path: 'key.G', value: RF.gold_plate },
  { id: 'witchery:chalice', path: 'key.I', value: RF.gold_plate },
  { id: 'witchery:copper_cauldron', path: 'key.I', value: RF.copper_plate },
  { id: 'witchery:copper_witches_oven', path: 'key.C', value: RF.copper_plate },
  { id: 'witchery:crystal_ball', path: 'key.D', value: RF.gold_plate },
  { id: 'witchery:cyan_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:distillery', path: 'key.G', value: RF.gold_plate },
  { id: 'witchery:distillery', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:gray_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:green_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:iron_witches_oven', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:light_blue_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:light_gray_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:lime_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:magenta_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:orange_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:pink_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:purple_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:red_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:sunlight_collector', path: 'key.B', value: RF.steel_plate },
  { id: 'witchery:white_iron_candelabra', path: 'key.I', value: RF.steel_plate },
  { id: 'witchery:yellow_iron_candelabra', path: 'key.I', value: RF.steel_plate },
]

const GATES = [
  { id: 'witchery:cauldron', path: 'pattern', value: ['I I', 'III', ' Z '] },
  { id: 'witchery:cauldron', path: 'key', value: { "I": RF.steel_plate, "Z": gtBlock('machineCasing', 'steel') } },
  { id: 'witchery:copper_cauldron', path: 'pattern', value: ['I I', 'IBI', ' Z '] },
  { id: 'witchery:copper_cauldron',
    path: 'key',
    value: { "B": "minecraft:copper_block",
      "I": RF.copper_plate,
      "Z": {
        'neoforge:ingredient_type': 'neoforge:components',
        items: 'gregtech:gt.multitileentity',
        components: { 'gregapi:subtype': 32064 }
      }
    }
  },
  { id: 'witchery:copper_witches_oven', path: 'pattern', value: [' T ', 'CCC', 'CZC'] },
  { id: 'witchery:copper_witches_oven', path: 'key.Z', value: gtBlock('machineCasing', 'steel') },
  { id: 'witchery:copper_witches_oven_fume_extension', path: 'pattern', value: ['BLB', 'BGB', 'IZI'] },
  { id: 'witchery:copper_witches_oven_fume_extension',
    path: 'key',
    value: { "B": "minecraft:lightning_rod",
      "G": "minecraft:glowstone",
      "I": gt('plate', 'copper'),
      "L": "minecraft:lava_bucket",
      "Z": gtBlock('machineCasing', 'copper')
    }
  },
  { id: 'witchery:coven_contract_1', path: 'ingredients[4]', value: gtBlock('machineCasing', 'steel') },
  { id: 'witchery:coven_contract_2', path: 'ingredients[4]', value: gtBlock('machineCasing', 'steel') },
  { id: 'witchery:coven_contract_3', path: 'ingredients[4]', value: gtBlock('machineCasing', 'steel') },
  { id: 'witchery:distillery', path: 'pattern', value: ['JIJ', 'III', 'GZG'] },
  { id: 'witchery:distillery',
    path: 'key',
    value: { "G": RF.gold_plate,
      "I": RF.steel_plate,
      "J": "witchery:jar",
      "Z": gtBlock('machineCasing', 'steel')
    }
  },
  { id: 'witchery:iron_witches_oven', path: 'pattern', value: [' B ', 'III', 'IZI'] },
  { id: 'witchery:iron_witches_oven', path: 'key.Z', value: gtBlock('machineCasing', 'steel') },
  { id: 'witchery:iron_witches_oven_fume_extension', path: 'pattern', value: ['BLB', 'BGB', 'IZI'] },
  { id: 'witchery:iron_witches_oven_fume_extension',
    path: 'key',
    value: { "B": "minecraft:bucket",
      "G": "minecraft:glowstone",
      "I": gt('plate', 'iron'),
      "L": "minecraft:lava_bucket",
      "Z": gtIngredient('gregtech:gt.meta.storage.plate', 260)
    }
  },
  { id: 'witchery:spinning_wheel', path: 'pattern', value: ['IIW', 'IIH', 'PZH'] },
  { id: 'witchery:spinning_wheel',
    path: 'key',
    value: { "H": "witchery:hawthorn_log",
      "I": "minecraft:item_frame",
      "P": "witchery:hawthorn_planks",
      "W": "#minecraft:wool",
      "Z": gtBlock('machineCasing', 'steel')
    }
  },
  { id: 'witchery:statue_of_hobgoblin_patron', path: 'pattern', value: [' IS', ' S ', 'SZS'] },
  { id: 'witchery:statue_of_hobgoblin_patron', path: 'key.Z', value: gtBlock('machineCasing', 'steel') },
  { id: 'witchery:werewolf_altar', path: 'pattern', value: [' S ', 'SFS', 'SZS'] },
  { id: 'witchery:werewolf_altar',
    path: 'key',
    value: { "F": "witchery:wolfsbane",
      "S": "minecraft:stone",
      "Z": gtBlock('machineCasing', 'steel')
    }
  },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Witchery', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
