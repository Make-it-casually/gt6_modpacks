
import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gtBlock } from '../src/lib/gt6_materials.js'

const REMOVE = [
]

const EDITS = [
  { id: 'theurgy:crafting/shaped/calcination_oven', path: 'key.I', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/caloric_flux_emitter_from_campfire', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/caloric_flux_emitter_from_lava_bucket', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/copper_wire', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/digestion_vat', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/distiller', path: 'key.I', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/fermentation_vat', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/incubator', path: 'key.C', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/incubator', path: 'key.G', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/incubator_mercury_vessel', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/incubator_salt_vessel', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/incubator_sulfur_vessel', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/liquefaction_cauldron', path: 'key.C', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_capability_probe', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_capability_proxy', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_connector_node', path: 'key.i', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/logistics_fluid_extractor', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_fluid_inserter', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_item_extractor', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_item_inserter', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/logistics_nexus', path: 'key.i', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/mercurial_wand', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/mercury_capacitor', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/mercury_catalyst', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/mercury_catalyst', path: 'key.i', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/mercury_flux_emitter', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/pyromantic_brazier', path: 'key.C', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/reformation_result_pedestal', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:crafting/shaped/reformation_source_pedestal', path: 'key.i', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/reformation_target_pedestal', path: 'key.c', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_accumulator', path: 'key.I', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_tank', path: 'key.C', value: RF.copper_plate },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_tank', path: 'key.I', value: RF.steel_plate },
  { id: 'theurgy:crafting/shaped/sulfuric_flux_emitter', path: 'key.g', value: RF.gold_plate },
  { id: 'theurgy:liquefaction/alchemical_sulfur_aluminum_from_ingots_aluminum',
    path: 'ingredient',
    value: RF.aluminium_plate
  },
  { id: 'theurgy:liquefaction/alchemical_sulfur_copper_from_ingots_copper',
    path: 'ingredient',
    value: RF.copper_plate
  },
  { id: 'theurgy:liquefaction/alchemical_sulfur_gold_from_ingots_gold', path: 'ingredient', value: RF.gold_plate },
  { id: 'theurgy:liquefaction/alchemical_sulfur_iron_from_ingots_iron', path: 'ingredient', value: RF.steel_plate },
  { id: 'theurgy:liquefaction/alchemical_sulfur_lead_from_ingots_lead', path: 'ingredient', value: RF.lead_plate },
  { id: 'theurgy:liquefaction/alchemical_sulfur_nickel_from_ingots_nickel',
    path: 'ingredient',
    value: RF.nickel_plate
  },
  { id: 'theurgy:liquefaction/alchemical_sulfur_platinum_from_ingots_platinum',
    path: 'ingredient',
    value: RF.platinum_plate
  },
  { id: 'theurgy:liquefaction/alchemical_sulfur_silver_from_ingots_silver',
    path: 'ingredient',
    value: RF.silver_plate
  },
  { id: 'theurgy:liquefaction/alchemical_sulfur_tin_from_ingots_tin', path: 'ingredient', value: RF.tin_plate },
  { id: 'theurgy:liquefaction/alchemical_sulfur_uranium_from_ingots_uranium',
    path: 'ingredient',
    value: RF.uranium_plate
  },
  { id: 'theurgy:liquefaction/alchemical_sulfur_zinc_from_ingots_zinc', path: 'ingredient', value: RF.zinc_plate },
]

const GATES = [
  { id: 'theurgy:crafting/shaped/amethyst_divination_rod', path: 'pattern', value: [' GP', '  G', 'RZ '] },
  { id: 'theurgy:crafting/shaped/amethyst_divination_rod', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/divination_rod_t1', path: 'pattern', value: [' G ', ' RG', 'RZ '] },
  { id: 'theurgy:crafting/shaped/divination_rod_t1', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/divination_rod_t2', path: 'pattern', value: [' G ', ' AG', 'RZ '] },
  { id: 'theurgy:crafting/shaped/divination_rod_t2',
    path: 'key',
    value: { "A": "#c:gems/amethyst",
      "G": "#c:glass_blocks",
      "R": "#c:rods/wooden",
      "Z": gtBlock('machineCasing', 'stainlesssteel')
    }
  },
  { id: 'theurgy:crafting/shaped/divination_rod_t3', path: 'pattern', value: [' G ', ' QG', 'AZ '] },
  { id: 'theurgy:crafting/shaped/divination_rod_t3',
    path: 'key',
    value: { "A": "#c:gems/amethyst",
      "G": "#c:glass_blocks",
      "Q": "#c:gems/quartz",
      "Z": gtBlock('machineCasing', 'stainlesssteel')
    }
  },
  { id: 'theurgy:crafting/shaped/divination_rod_t4', path: 'pattern', value: [' G ', ' RG', 'AZ '] },
  { id: 'theurgy:crafting/shaped/divination_rod_t4',
    path: 'key',
    value: { "A": "#c:gems/amethyst",
      "G": "#c:glass_blocks",
      "R": "#c:rods/blaze",
      "Z": gtBlock('machineCasing', 'stainlesssteel')
    }
  },
  { id: 'theurgy:crafting/shaped/incubator_mercury_vessel', path: 'pattern', value: ['cMc', 'c c', 'SZS'] },
  { id: 'theurgy:crafting/shaped/incubator_mercury_vessel', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/incubator_salt_vessel', path: 'pattern', value: ['csc', 'c c', 'SZS'] },
  { id: 'theurgy:crafting/shaped/incubator_salt_vessel', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/incubator_sulfur_vessel', path: 'pattern', value: ['csc', 'c c', 'SZS'] },
  { id: 'theurgy:crafting/shaped/incubator_sulfur_vessel', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/mercury_flux_emitter', path: 'pattern', value: [' m ', 'gmg', 'sZs'] },
  { id: 'theurgy:crafting/shaped/mercury_flux_emitter', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/reformation_result_pedestal', path: 'pattern', value: ['ggg', 'gSg', 'sZs'] },
  { id: 'theurgy:crafting/shaped/reformation_result_pedestal', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_accumulator', path: 'pattern', value: [' SS', 'III', 'RZR'] },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_accumulator', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_tank', path: 'pattern', value: ['ICI', 'ICI', 'RZR'] },
  { id: 'theurgy:crafting/shaped/sal_ammoniac_tank', path: 'key.Z', value: gtBlock('machineCasing', 'stainlesssteel') },
  { id: 'theurgy:crafting/shapeless/sal_ammoniac_crystal_from_sal_ammoniac_bucket',
    path: 'ingredients[1]',
    value: gtBlock('machineCasing', 'stainlesssteel')
  },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Theurgy', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
