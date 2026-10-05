import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gtBlock, gtIngredient } from '../src/lib/gt6_materials.js'

const REMOVE = [
]

const EDITS = [
  { id: 'rootsclassic:brazier', path: 'key.I', value: RF.steel_plate },
  { id: 'rootsclassic:component/azure_bluet', path: 'ingredients[1]', value: RF.steel_plate },
  { id: 'rootsclassic:component/oxeye_daisy', path: 'ingredients[2]', value: RF.gold_plate },
  { id: 'rootsclassic:ritual/time_shift', path: 'ingredients[1]', value: RF.steel_plate },
]

const GATES = [
  { id: 'rootsclassic:altar', path: 'pattern', value: ['BFB', 'SGS', ' Z '] },
  { id: 'rootsclassic:altar',
    path: 'key',
    value: { "B": "rootsclassic:verdant_sprig",
      "F": "minecraft:poppy",
      "G": "#c:storage_blocks/gold",
      "S": "#c:stones",
      "Z": gtBlock('machineCasing', 'iron')
    }
  },
  { id: 'rootsclassic:attuned_standing_stone', path: 'pattern', value: ['SNS', 'NDN', 'SZS'] },
  { id: 'rootsclassic:attuned_standing_stone', path: 'key.Z', value: gtBlock('machineCasing', 'iron') },
  { id: 'rootsclassic:brazier', path: 'pattern', value: ['ISI', 'ICI', 'IZI'] },
  { id: 'rootsclassic:brazier',
    path: 'key',
    value: { "C": "minecraft:cauldron",
      "I": "minecraft:iron_bars",
      "S": "#c:strings",
      "Z": gtBlock('machineCasing', 'iron')
    }
  },
  { id: 'rootsclassic:mortar', path: 'pattern', value: ['X X', 'X X', ' Z '] },
  { id: 'rootsclassic:mortar', path: 'key.Z', value: gtIngredient('gregtech:gt.meta.plate', 260) },
  { id: 'rootsclassic:mundane_standing_stone', path: 'pattern', value: ['SBS', 'BLB', 'SZS'] },
  { id: 'rootsclassic:mundane_standing_stone', path: 'key.Z', value: gtBlock('machineCasing', 'iron') },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Roots', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
