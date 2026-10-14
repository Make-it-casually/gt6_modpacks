import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gtBlock } from '../src/lib/gt6_materials.js'

const REMOVE = [
]

const EDITS = [
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:alloy_smelter', path: 'key.G', value: RF.iron_gear },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:alloy_smelter', path: 'key.I', value: RF.steel_plate },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:alloy_smelter', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:attractor_obelisk', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:aversion_obelisk', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.I:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'enderio:basic_capacitor', path: 'key.I', value: RF.copper_plate },
  // key.C:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:crafter', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:crafter', path: 'key.G', value: RF.iron_gear },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:crafter', path: 'key.I', value: RF.steel_plate },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:dark_bimetal_gear', path: 'key.G', value: RF.iron_gear },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:drain', path: 'key.G', value: RF.iron_gear },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:drain', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.E:  "#c:ingots/gold"  ->  GT gold_plate
  { id: 'enderio:energetic_photovoltaic_module', path: 'key.E', value: RF.gold_plate },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:energized_gear', path: 'key.G', value: RF.iron_gear },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:farming_station', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:fluid_tank', path: 'key.I', value: RF.steel_plate },
  // key.C:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:impulse_hopper', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:impulse_hopper', path: 'key.G', value: RF.iron_gear },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:inhibitor_obelisk', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.G:  "enderio:iron_gear"  ->  GT iron_gear
  { id: 'enderio:inhibitor_obelisk', path: 'key.G', value: RF.iron_gear },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:iron_gear', path: 'key.I', value: RF.steel_plate },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:niard', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:painting_machine', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.M:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:painting_machine', path: 'key.M', value: RF.iron_gear },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:powered_spawner', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:redstone_filter_base', path: 'key.I', value: RF.steel_plate },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:sag_mill', path: 'key.G', value: RF.iron_gear },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:sag_mill', path: 'key.I', value: RF.steel_plate },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:sag_mill', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:slice_and_splice', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:soul_binder', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:soul_engine', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.G:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:stirling_generator', path: 'key.G', value: RF.iron_gear },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:stirling_generator', path: 'key.I', value: RF.steel_plate },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:stirling_generator', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:travel_anchor', path: 'key.I', value: RF.steel_plate },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:vacuum_chest', path: 'key.I', value: RF.steel_plate },
  // key.C:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:vat', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.M:  "#c:gears/iron"  ->  GT iron_gear
  { id: 'enderio:vat', path: 'key.M', value: RF.iron_gear },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:void_chassis', path: 'key.I', value: RF.steel_plate },
  // key.C:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:weather_obelisk', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:wired_charger', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.V:  "enderio:void_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:wireless_charger', path: 'key.V', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.C:  "enderio:ensouled_chassis"  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:xp_obelisk', path: 'key.C', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // key.I:  "#c:ingots/iron"  ->  GT steel_plate
  { id: 'enderio:xp_vacuum', path: 'key.I', value: RF.steel_plate },
  // key.I:  "#c:ingots/copper"  ->  GT copper_plate
  { id: 'enderio:yeta_wrench', path: 'key.I', value: RF.copper_plate },
]

const GATES = [
  // pattern:  ["GFG","FVF","IOI"]  ->  [GFG, FVF, IZI]
  { id: 'enderio:alloy_smelter', path: 'pattern', value: ['GFG', 'FVF', 'IZI'] },
  { id: 'enderio:alloy_smelter',
    path: 'key',
    value: { "F": "minecraft:furnace",
      "G": RF.iron_gear,
      "I": RF.steel_plate,
      "V": gtBlock('machineCasing', 'galvanizedsteel'),
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["SSS","ICI","GTG"]  ->  [TSS, ICI, GZG]
  { id: 'enderio:crafter', path: 'pattern', value: ['TSS', 'ICI', 'GZG'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:crafter', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["ICI","IVI","GBG"]  ->  [BCI, IVI, GZG]
  { id: 'enderio:drain', path: 'pattern', value: ['BCI', 'IVI', 'GZG'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:drain', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  [" B ","DLD","III"]  ->  [ B , DLD, IZI]
  { id: 'enderio:enchanter', path: 'pattern', value: [' B ', 'DLD', 'IZI'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:enchanter', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["EFE","PPP","CDC"]  ->  [EFE, PPP, CZC]
  { id: 'enderio:energetic_photovoltaic_module', path: 'pattern', value: ['EFE', 'PPP', 'CZC'] },
  { id: 'enderio:energetic_photovoltaic_module',
    path: 'key',
    value: { "C": "enderio:basic_capacitor",
      "E": RF.gold_plate,
      "F": "#c:glass_blocks",
      "P": "enderio:photovoltaic_plate",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_alloy_smelter', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_attractor_obelisk', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_aversion_obelisk', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_crafter', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_drain', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_energetic_photovoltaic_module', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_fluid_tank', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_impulse_hopper', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_inhibitor_obelisk', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_painting_machine', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_pressurized_fluid_tank', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_pulsating_photovoltaic_module', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_relocator_obelisk', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_sag_mill', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_soul_binder', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_stirling_generator', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_vacuum_chest', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_vibrant_photovoltaic_module', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_xp_obelisk', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // ingredients[1]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:erase_xp_vacuum', path: 'ingredients[1]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["IBI","BGB","IBI"]  ->  [IBI, BGB, IZI]
  { id: 'enderio:fluid_tank', path: 'pattern', value: ['IBI', 'BGB', 'IZI'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:fluid_tank', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["IHI","GCG","IRI"]  ->  [IHI, GCG, IZI]
  { id: 'enderio:impulse_hopper', path: 'pattern', value: ['IHI', 'GCG', 'IZI'] },
  { id: 'enderio:impulse_hopper',
    path: 'key',
    value: { "C": gtBlock('machineCasing', 'galvanizedsteel'),
      "G": RF.iron_gear,
      "H": "minecraft:hopper",
      "I": "#c:ingots/conductive_alloy",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["RGB","ICI","MAM"]  ->  [RGB, ICI, MZM]
  { id: 'enderio:painting_machine', path: 'pattern', value: ['RGB', 'ICI', 'MZM'] },
  { id: 'enderio:painting_machine',
    path: 'key',
    value: { "B": "#c:dyes/blue",
      "C": gtBlock('machineCasing', 'galvanizedsteel'),
      "G": "#c:dyes/green",
      "I": "#c:ingots/conductive_alloy",
      "M": RF.iron_gear,
      "R": "#c:dyes/red",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // ingredients[3]:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:photovoltaic_composite', path: 'ingredients[3]', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["IBI","BGB","IBI"]  ->  [IBI, BGB, IZI]
  { id: 'enderio:pressurized_fluid_tank', path: 'pattern', value: ['IBI', 'BGB', 'IZI'] },
  // pattern:  ["IFI","PDP","CSC"]  ->  [IFI, PDP, CZC]
  { id: 'enderio:pulsating_photovoltaic_module', path: 'pattern', value: ['IFI', 'PDP', 'CZC'] },
  { id: 'enderio:pulsating_photovoltaic_module',
    path: 'key',
    value: { "C": "enderio:double_layer_capacitor",
      "D": "#c:dusts/coal",
      "F": "#c:glass_blocks/enlighted_fused_quartz",
      "I": "#c:ingots/pulsating_alloy",
      "P": "enderio:photovoltaic_plate",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["GFG","IVI","OPO"]  ->  [PFG, IVI, OZO]
  { id: 'enderio:sag_mill', path: 'pattern', value: ['PFG', 'IVI', 'OZO'] },
  // key.Z:  (not found)  ->  GT block machineCasing, galvanizedsteel
  { id: 'enderio:sag_mill', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  // pattern:  ["IVI","GCG","IZI"]  ->  [IVI, GCG, IYI]
  { id: 'enderio:soul_binder', path: 'pattern', value: ['IVI', 'GCG', 'IYI'] },
  { id: 'enderio:soul_binder',
    path: 'key',
    value: { "C": gtBlock('machineCasing', 'galvanizedsteel'),
      "G": "#c:gears/energized",
      "I": "#c:ingots/soularium",
      "V": { "neoforge:ingredient_type":"enderio:empty_soul_storage",
        "item":"enderio:soul_vial"
      },
      "Y": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["GFG","IVI","ODO"]  ->  [GFG, IVI, OZO]
  { id: 'enderio:stirling_generator', path: 'pattern', value: ['GFG', 'IVI', 'OZO'] },
  { id: 'enderio:stirling_generator',
    path: 'key',
    value: { "F": "minecraft:furnace",
      "G": RF.iron_gear,
      "I": RF.steel_plate,
      "O": "#c:obsidians",
      "V": gtBlock('machineCasing', 'galvanizedsteel'),
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["III","ICI","IPI"]  ->  [III, ICI, IZI]
  { id: 'enderio:vacuum_chest', path: 'pattern', value: ['III', 'ICI', 'IZI'] },
  // key:  {"C":"#c:chests","I":"#c:ingots/iron","P":"#c:gems/pulsating_crystal"}  ->  { "C": "#c:chests", "I": RF.steel_plate, "Z": gtBlock(machineCasing, galvanizedsteel) }
  { id: 'enderio:vacuum_chest', path: 'key', value: { "C": "#c:chests", "I": RF.steel_plate, "Z": gtBlock('machineCasing', 'galvanizedsteel') } },
  // pattern:  ["SBS","ACA","MRM"]  ->  [SBS, ACA, MZM]
  { id: 'enderio:vat', path: 'pattern', value: ['SBS', 'ACA', 'MZM'] },
  { id: 'enderio:vat',
    path: 'key',
    value: { "A": "#c:ingots/conductive_alloy",
      "B": "minecraft:barrel",
      "C": gtBlock('machineCasing', 'galvanizedsteel'),
      "M": RF.iron_gear,
      "S": "#c:ingots/dark_steel",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["IFI","PGP","CSC"]  ->  [IFI, PGP, CZC]
  { id: 'enderio:vibrant_photovoltaic_module', path: 'pattern', value: ['IFI', 'PGP', 'CZC'] },
  { id: 'enderio:vibrant_photovoltaic_module',
    path: 'key',
    value: { "C": "enderio:octadic_capacitor",
      "F": "#c:glass_blocks/dark_fused_quartz",
      "G": "minecraft:glowstone",
      "I": "#c:ingots/vibrant_alloy",
      "P": "enderio:photovoltaic_plate",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  // pattern:  ["III","IRI","IPI"]  ->  [III, IRI, IZI]
  { id: 'enderio:xp_vacuum', path: 'pattern', value: ['III', 'IRI', 'IZI'] },
  // key:  {"I":"#c:ingots/iron","P":"#c:gems/pulsating_crystal","R":"enderio:void_vial"}  ->  { "I": RF.steel_plate, "R": "enderio:void_vial", "Z": gtBlock(machineCasing, galvanizedsteel) }
  { id: 'enderio:xp_vacuum', path: 'key', value: { "I": RF.steel_plate, "R": "enderio:void_vial", "Z": gtBlock('machineCasing', 'galvanizedsteel') } },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'EIO', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
