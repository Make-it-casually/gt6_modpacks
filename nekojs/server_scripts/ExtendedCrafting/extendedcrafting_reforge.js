import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gtBlock } from '../src/lib/gt6_materials.js'

const REMOVE = [
]

const EDITS = [
  { id: 'extendedcrafting:advanced_component', path: 'ingredients[2]', value: RF.gold_plate },
  { id: 'extendedcrafting:advanced_component', path: 'ingredients[3]', value: RF.gold_plate },
  { id: 'extendedcrafting:basic_component', path: 'ingredients[2]', value: RF.steel_plate },
  { id: 'extendedcrafting:basic_component', path: 'ingredients[3]', value: RF.steel_plate },
  { id: 'extendedcrafting:black_iron_ingot', path: 'ingredients[0]', value: RF.steel_plate },
  { id: 'extendedcrafting:compressor', path: 'key.I', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:crafting_core', path: 'key.I', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:crystaltine_ingot', path: 'key.G', value: RF.gold_plate },
  { id: 'extendedcrafting:crystaltine_ingot', path: 'key.I', value: RF.steel_plate },
  { id: 'extendedcrafting:ender_ingot', path: 'ingredients[0]', value: RF.steel_plate },
  { id: 'extendedcrafting:flux_alternator', path: 'key.E', value: RF.gold_plate },
  { id: 'extendedcrafting:flux_crafter', path: 'key.E', value: RF.gold_plate },
  { id: 'extendedcrafting:flux_star', path: 'key.E', value: RF.gold_plate },
  { id: 'extendedcrafting:redstone_ingot', path: 'ingredients[0]', value: RF.steel_plate },
]

const GATES = [
  { id: 'extendedcrafting:advanced_auto_table', path: 'pattern', value: ['BSB', 'CTC', 'BZB'] },
  { id: 'extendedcrafting:advanced_auto_table', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:auto_ender_crafter', path: 'pattern', value: ['BSB', 'CTC', 'BZB'] },
  { id: 'extendedcrafting:auto_ender_crafter', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:auto_flux_crafter', path: 'pattern', value: ['BSB', 'CTC', 'BZB'] },
  { id: 'extendedcrafting:auto_flux_crafter', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:basic_auto_table', path: 'pattern', value: ['BSB', 'CTC', 'BZB'] },
  { id: 'extendedcrafting:basic_auto_table', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:compressor', path: 'pattern', value: ['CBC', 'AIA', 'CZC'] },
  { id: 'extendedcrafting:compressor',
    path: 'key',
    value: { "I": gtBlock('machineCasing', 'tungstensteel'),
      "B": "extendedcrafting:elite_component",
      "C": "extendedcrafting:black_iron_ingot",
      "A": "extendedcrafting:elite_catalyst",
      "Z": gtBlock('machineCasing', 'tungstensteel')
    }
  },
  { id: 'extendedcrafting:crafting_core', path: 'pattern', value: ['CAC', 'BIB', 'CZC'] },
  { id: 'extendedcrafting:crafting_core',
    path: 'key',
    value: { "I": gtBlock('machineCasing', 'tungstensteel'),
      "B": "extendedcrafting:elite_component",
      "C": "extendedcrafting:black_iron_ingot",
      "A": "extendedcrafting:elite_catalyst",
      "Z": gtBlock('machineCasing', 'tungstensteel')
    }
  },
  { id: 'extendedcrafting:elite_auto_table', path: 'pattern', value: ['BSB', 'CTC', 'BZB'] },
  { id: 'extendedcrafting:elite_auto_table', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:ender_alternator', path: 'pattern', value: [' E ', ' I ', 'IZI'] },
  { id: 'extendedcrafting:ender_alternator', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:ender_crafter', path: 'pattern', value: ['EEE', 'ICI', 'IZI'] },
  { id: 'extendedcrafting:ender_crafter', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:flux_alternator', path: 'pattern', value: [' E ', ' I ', 'IZI'] },
  { id: 'extendedcrafting:flux_alternator', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:flux_crafter', path: 'pattern', value: ['EEE', 'ICI', 'IZI'] },
  { id: 'extendedcrafting:flux_crafter', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:frame', path: 'pattern', value: ['GGI', 'GSG', 'IZI'] },
  { id: 'extendedcrafting:frame', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
  { id: 'extendedcrafting:pedestal', path: 'pattern', value: [' I ', ' I ', 'IZI'] },
  { id: 'extendedcrafting:pedestal',
    path: 'key',
    value: { "I": "extendedcrafting:black_iron_ingot",
      "Z": gtBlock('machineCasing', 'tungstensteel')
    }
  },
  { id: 'extendedcrafting:ultimate_auto_table', path: 'pattern', value: ['BSB', 'CTC', 'BZB'] },
  { id: 'extendedcrafting:ultimate_auto_table', path: 'key.Z', value: gtBlock('machineCasing', 'tungstensteel') },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'ExtendedCrafting', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
