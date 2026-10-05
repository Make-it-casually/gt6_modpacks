import { RF, applyReforge } from '../src/lib/gt6_reforge.js'
import { gtBlock } from '../src/lib/gt6_materials.js'

const REMOVE = [
  'enderio_evolution:ingot/crude_steel_ingot',
  'enderio_evolution:ingot_from_block/crude_steel_ingot',
  'enderio_evolution:nugget/crude_steel_nugget',
]

const EDITS = [
  { id: 'enderio_evolution:capacitor/capacitor_silver_iron_iron', path: 'key.C', value: RF.steel_plate },
  { id: 'enderio_evolution:capacitor/capacitor_silver_iron_silver', path: 'key.C', value: RF.steel_plate },
  { id: 'enderio_evolution:capacitor/capacitor_silver_lead_iron', path: 'key.C', value: RF.lead_plate },
  { id: 'enderio_evolution:capacitor/capacitor_silver_lead_silver', path: 'key.C', value: RF.lead_plate },
  { id: 'enderio_evolution:conduit/gold_crude_energy_conduit', path: 'key.I', value: RF.steel_ingot },
  { id: 'enderio_evolution:grinding_ball/crude_steel_ball', path: 'key.X', value: RF.steel_ingot },
  { id: 'enderio_evolution:machine/simple_machine_frame', path: 'key.C', value: RF.copper_plate },
  { id: 'enderio_evolution:machine/simple_machine_frame', path: 'key.I', value: RF.steel_plate },
  { id: 'enderio_evolution:machine/simple_stirling_generator', path: 'key.G', value: RF.iron_gear },
  { id: 'enderio_evolution:machine/simple_stirling_generator', path: 'key.M', value: gtBlock('machineCasing', 'galvanizedsteel') },
  { id: 'enderio_evolution:nugget/crude_steel_nugget', path: 'ingredients[0]', value: RF.steel_ingot },
  { id: 'enderio_evolution:storage_block/crude_steel_block', path: 'key.X', value: RF.steel_ingot },
]

const GATES = [
  { id: 'enderio_evolution:machine/basic_alloy_smelter', path: 'pattern', value: ['PCP', 'CHC', 'MZM'] },
  { id: 'enderio_evolution:machine/basic_alloy_smelter',
    path: 'key',
    value: { "C": [ "enderio:basic_capacitor",
        "enderio_evolution:capacitor_grainy",
        "enderio_evolution:capacitor_silver"
      ],
      "H": "enderio_evolution:simple_machine_frame",
      "M": "enderio_evolution:construction_alloy_ingot",
      "P": "minecraft:ender_pearl",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/basic_sag_mill', path: 'pattern', value: ['CCC', 'MHM', 'EZE'] },
  { id: 'enderio_evolution:machine/basic_sag_mill',
    path: 'key',
    value: { "C": [ "enderio:basic_capacitor",
        "enderio_evolution:capacitor_grainy",
        "enderio_evolution:capacitor_silver"
      ],
      "E": "minecraft:ender_pearl",
      "H": "enderio_evolution:simple_machine_frame",
      "M": "enderio_evolution:construction_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/basic_vat', path: 'pattern', value: ['DED', 'MCM', 'DZD'] },
  { id: 'enderio_evolution:machine/basic_vat',
    path: 'key',
    value: { "C": [ "enderio:basic_capacitor",
        "enderio_evolution:capacitor_grainy",
        "enderio_evolution:capacitor_silver"
      ],
      "D": "enderio:dark_steel_ingot",
      "E": "minecraft:ender_chest",
      "M": "enderio_evolution:construction_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/crystalline_alloy_sag_mill', path: 'pattern', value: ['CCC', 'MHM', 'EZE'] },
  { id: 'enderio_evolution:machine/crystalline_alloy_sag_mill',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_crystalline",
      "E": "minecraft:ender_pearl",
      "H": "enderio_evolution:vivid_alloy_sag_mill",
      "M": "enderio_evolution:crystalline_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/crystalline_alloy_smelter', path: 'pattern', value: ['PCP', 'CHC', 'MZM'] },
  { id: 'enderio_evolution:machine/crystalline_alloy_smelter',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_crystalline",
      "H": "enderio_evolution:vivid_alloy_smelter",
      "M": "enderio_evolution:crystalline_alloy_ingot",
      "P": "minecraft:ender_pearl",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/crystalline_alloy_vat', path: 'pattern', value: ['DED', 'MCM', 'DZD'] },
  { id: 'enderio_evolution:machine/crystalline_alloy_vat',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_crystalline",
      "D": "enderio:dark_steel_ingot",
      "E": "minecraft:ender_chest",
      "M": "enderio_evolution:crystalline_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/melodic_alloy_sag_mill', path: 'pattern', value: ['CCC', 'MHM', 'EZE'] },
  { id: 'enderio_evolution:machine/melodic_alloy_sag_mill',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_melodic",
      "E": "minecraft:ender_pearl",
      "H": "enderio_evolution:crystalline_alloy_sag_mill",
      "M": "enderio_evolution:melodic_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/melodic_alloy_smelter', path: 'pattern', value: ['PCP', 'CHC', 'MZM'] },
  { id: 'enderio_evolution:machine/melodic_alloy_smelter',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_melodic",
      "H": "enderio_evolution:crystalline_alloy_smelter",
      "M": "enderio_evolution:melodic_alloy_ingot",
      "P": "minecraft:ender_pearl",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/melodic_alloy_vat', path: 'pattern', value: ['DED', 'MCM', 'DZD'] },
  { id: 'enderio_evolution:machine/melodic_alloy_vat',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_melodic",
      "D": "enderio:dark_steel_ingot",
      "E": "minecraft:ender_chest",
      "M": "enderio_evolution:melodic_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/simple_machine_frame', path: 'pattern', value: ['IBI', 'BCB', 'IZI'] },
  { id: 'enderio_evolution:machine/simple_machine_frame', path: 'key.Z', value: gtBlock('machineCasing', 'galvanizedsteel') },
  { id: 'enderio_evolution:machine/stellar_alloy_sag_mill', path: 'pattern', value: ['CCC', 'MHM', 'EZE'] },
  { id: 'enderio_evolution:machine/stellar_alloy_sag_mill',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_stellar",
      "E": "minecraft:ender_pearl",
      "H": "enderio_evolution:melodic_alloy_sag_mill",
      "M": "enderio_evolution:stellar_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/stellar_alloy_smelter', path: 'pattern', value: ['PCP', 'CHC', 'MZM'] },
  { id: 'enderio_evolution:machine/stellar_alloy_smelter',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_stellar",
      "H": "enderio_evolution:melodic_alloy_smelter",
      "M": "enderio_evolution:stellar_alloy_ingot",
      "P": "minecraft:ender_pearl",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/stellar_alloy_vat', path: 'pattern', value: ['DED', 'MCM', 'DZD'] },
  { id: 'enderio_evolution:machine/stellar_alloy_vat',
    path: 'key',
    value: { "C": "enderio_evolution:capacitor_stellar",
      "D": "enderio:dark_steel_ingot",
      "E": "minecraft:ender_chest",
      "M": "enderio_evolution:stellar_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/vivid_alloy_sag_mill', path: 'pattern', value: ['CCC', 'MHM', 'EZE'] },
  { id: 'enderio_evolution:machine/vivid_alloy_sag_mill',
    path: 'key',
    value: { "C": [ "enderio_evolution:capacitor_vivid",
        "enderio:octadic_capacitor"
      ],
      "E": "minecraft:ender_pearl",
      "H": "enderio_evolution:basic_sag_mill",
      "M": "enderio_evolution:vivid_alloy_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/vivid_alloy_smelter', path: 'pattern', value: ['PCP', 'CHC', 'MZM'] },
  { id: 'enderio_evolution:machine/vivid_alloy_smelter',
    path: 'key',
    value: { "C": [ "enderio_evolution:capacitor_vivid",
        "enderio:octadic_capacitor"
      ],
      "H": "enderio_evolution:basic_alloy_smelter",
      "M": "enderio_evolution:vivid_alloy_ingot",
      "P": "minecraft:ender_pearl",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
  { id: 'enderio_evolution:machine/vivid_alloy_vat', path: 'pattern', value: ['DED', 'MCM', 'DZD'] },
  { id: 'enderio_evolution:machine/vivid_alloy_vat',
    path: 'key',
    value: { "C": [ "enderio_evolution:capacitor_vivid",
        "enderio:octadic_capacitor"
      ],
      "D": "enderio:dark_steel_ingot",
      "E": "minecraft:ender_chest",
      "M": "enderio_evolution:energetic_silver_ingot",
      "Z": gtBlock('machineCasing', 'galvanizedsteel')
    }
  },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'EIO-Evolution', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
