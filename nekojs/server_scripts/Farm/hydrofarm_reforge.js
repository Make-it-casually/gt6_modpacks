
import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'hydrofarm:animal_capture_net', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:autocrafter', path: 'key.C', value: RF.copper_plate },
  { id: 'hydrofarm:autocrafter', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:capture_crate', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:energy_cell', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:energy_pipe', path: 'key.C', value: RF.copper_plate },
  { id: 'hydrofarm:hydroelectric_generator', path: 'key.C', value: RF.copper_plate },
  { id: 'hydrofarm:hydroelectric_generator', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:hydrofarm_planter', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:liquid_pipe', path: 'key.C', value: RF.copper_plate },
  { id: 'hydrofarm:liquid_siphon', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:liquid_tank', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:mending_station', path: 'key.C', value: RF.copper_plate },
  { id: 'hydrofarm:mending_station', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:repulser', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:sprinkler', path: 'key.C', value: RF.copper_plate },
  { id: 'hydrofarm:sprinkler', path: 'key.I', value: RF.steel_plate },
  { id: 'hydrofarm:xp_drain', path: 'key.I', value: RF.steel_plate },
]

const GATES = [
  { id: 'hydrofarm:animal_capture_net', path: 'pattern', value: ['S S', ' I ', 'SZS'] },
  { id: 'hydrofarm:animal_capture_net',
    path: 'key',
    value: { "S": "minecraft:string",
      "I": RF.steel_plate,
      "Z": RF.bronze_plate
    }
  },
  { id: 'hydrofarm:autocrafter', path: 'pattern', value: ['ICI', 'CTC', 'IZI'] },
  { id: 'hydrofarm:autocrafter',
    path: 'key',
    value: { "I": RF.steel_plate,
      "C": RF.copper_plate,
      "T": "minecraft:crafting_table",
      "Z": RF.bronze_plate
    }
  },
  { id: 'hydrofarm:black_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:blue_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:brown_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:capture_crate', path: 'pattern', value: ['SNS', 'IEI', 'SZS'] },
  { id: 'hydrofarm:capture_crate', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:cyan_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:energy_cell', path: 'pattern', value: ['IRI', 'RCR', 'IZI'] },
  { id: 'hydrofarm:energy_cell', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:energy_pipe', path: 'pattern', value: ['CCC', 'RRR', 'CZC'] },
  { id: 'hydrofarm:energy_pipe', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:glowcube', path: 'pattern', value: ['HHH', 'HDH', 'HZH'] },
  { id: 'hydrofarm:glowcube', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:gray_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:green_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:hydroelectric_generator', path: 'pattern', value: ['ICI', 'CPC', 'IZI'] },
  { id: 'hydrofarm:hydroelectric_generator',
    path: 'key',
    value: { "I": RF.steel_plate,
      "C": RF.copper_plate,
      "P": "hydrofarm:liquid_pipe",
      "Z": RF.bronze_plate
    }
  },
  { id: 'hydrofarm:hydrofarm_planter', path: 'pattern', value: ['G G', 'GIG', ' Z '] },
  { id: 'hydrofarm:hydrofarm_planter', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:item_pipe', path: 'pattern', value: ['DDD', 'GGG', 'DZD'] },
  { id: 'hydrofarm:item_pipe', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:light_blue_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:light_gray_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:lime_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:liquid_pipe', path: 'pattern', value: ['CCC', 'GGG', 'CZC'] },
  { id: 'hydrofarm:liquid_pipe', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:liquid_siphon', path: 'pattern', value: ['III', 'IBI', 'IZI'] },
  { id: 'hydrofarm:liquid_siphon', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:liquid_tank', path: 'pattern', value: ['GGI', 'GIG', 'IZI'] },
  { id: 'hydrofarm:liquid_tank', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:magenta_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:mending_station', path: 'pattern', value: ['ICI', 'CGC', 'IZI'] },
  { id: 'hydrofarm:mending_station',
    path: 'key',
    value: { "I": RF.steel_plate,
      "C": RF.copper_plate,
      "G": "minecraft:grindstone",
      "Z": RF.bronze_plate
    }
  },
  { id: 'hydrofarm:orange_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:pink_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:purple_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:red_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:repulser', path: 'pattern', value: ['INI', 'ROR', 'IZI'] },
  { id: 'hydrofarm:repulser',
    path: 'key',
    value: { "I": RF.steel_plate,
      "R": "minecraft:redstone_block",
      "O": "minecraft:observer",
      "N": "minecraft:note_block",
      "Z": RF.bronze_plate
    }
  },
  { id: 'hydrofarm:sprinkler', path: 'pattern', value: [' C ', 'III', ' Z '] },
  { id: 'hydrofarm:sprinkler', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:white_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
  { id: 'hydrofarm:xp_drain', path: 'pattern', value: ['GGI', 'GRG', 'IZI'] },
  { id: 'hydrofarm:xp_drain', path: 'key.Z', value: RF.bronze_plate },
  { id: 'hydrofarm:yellow_glowcube', path: 'ingredients[2]', value: RF.bronze_plate },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Hydrofarm', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
