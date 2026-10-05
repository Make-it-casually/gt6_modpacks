import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'sophisticatedbackpacks:advanced_alchemy_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_compacting_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_deposit_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_feeding_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_filter_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_jukebox_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_magnet_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:advanced_magnet_upgrade_from_basic', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_mob_catcher_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_pickup_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_pump_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_refill_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_restock_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_tool_swapper_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:advanced_void_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:alchemy_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:anvil_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:auto_blasting_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:auto_blasting_upgrade_from_auto_smelting_upgrade',
    path: 'key.I',
    value: RF.steel_plate
  },
  { id: 'sophisticatedbackpacks:auto_smelting_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:auto_smoking_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:battery_upgrade', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:blasting_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:blasting_upgrade_from_smelting_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:compacting_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:copper_backpack', path: 'key.C', value: RF.copper_plate },
  { id: 'sophisticatedbackpacks:crafting_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:deposit_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:gold_backpack', path: 'key.G', value: RF.gold_plate },
  { id: 'sophisticatedbackpacks:iron_backpack', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:iron_backpack_from_copper', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:jukebox_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:magnet_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:mob_catcher_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:refill_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:restock_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:smelting_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:smithing_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:smoking_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:stonecutter_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:tool_swapper_upgrade', path: 'key.I', value: RF.steel_plate },
  { id: 'sophisticatedbackpacks:upgrade_base', path: 'key.I', value: RF.steel_plate },
]

const GATES = [
  { id: 'sophisticatedbackpacks:alchemy_upgrade', path: 'pattern', value: ['TGF', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:alchemy_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "F": "minecraft:fermented_spider_eye",
      "G": "minecraft:glass_bottle",
      "I": RF.steel_plate,
      "R": "minecraft:blaze_rod",
      "T": "minecraft:ghast_tear",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:anvil_upgrade', path: 'pattern', value: ['ADA', 'IBI', ' Z '] },
  { id: 'sophisticatedbackpacks:anvil_upgrade',
    path: 'key',
    value: { "A": "minecraft:anvil",
      "B": "sophisticatedbackpacks:upgrade_base",
      "D": "#c:gems/diamond",
      "I": RF.steel_plate,
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:auto_blasting_upgrade_from_auto_smelting_upgrade',
    path: 'pattern',
    value: ['III', 'ISI', 'TZT']
  },
  { id: 'sophisticatedbackpacks:auto_blasting_upgrade_from_auto_smelting_upgrade',
    path: 'key.Z',
    value: RF.steel_screw
  },
  { id: 'sophisticatedbackpacks:auto_smoking_upgrade_from_auto_smelting_upgrade',
    path: 'pattern',
    value: [' L ', 'LSL', ' Z ']
  },
  { id: 'sophisticatedbackpacks:auto_smoking_upgrade_from_auto_smelting_upgrade',
    path: 'key.Z',
    value: RF.steel_screw
  },
  { id: 'sophisticatedbackpacks:blasting_upgrade', path: 'pattern', value: ['FIR', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:blasting_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:blasting_upgrade_from_smelting_upgrade',
    path: 'pattern',
    value: ['III', 'ISI', 'TZT']
  },
  { id: 'sophisticatedbackpacks:blasting_upgrade_from_smelting_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:compacting_upgrade', path: 'pattern', value: ['PPI', 'PBP', 'RZR'] },
  { id: 'sophisticatedbackpacks:compacting_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:crafting_upgrade', path: 'pattern', value: [' T ', 'IBI', ' Z '] },
  { id: 'sophisticatedbackpacks:crafting_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "T": "minecraft:crafting_table",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:deposit_upgrade', path: 'pattern', value: [' P ', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:deposit_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "P": "minecraft:piston",
      "R": "#c:dusts/redstone",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:everlasting_upgrade', path: 'pattern', value: ['CSC', 'SBS', 'CZC'] },
  { id: 'sophisticatedbackpacks:everlasting_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:feeding_upgrade', path: 'pattern', value: [' C ', 'ABM', ' Z '] },
  { id: 'sophisticatedbackpacks:feeding_upgrade',
    path: 'key',
    value: { "A": "minecraft:golden_apple",
      "B": "sophisticatedbackpacks:upgrade_base",
      "C": "minecraft:golden_carrot",
      "M": "minecraft:glistering_melon_slice",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:filter_upgrade', path: 'pattern', value: ['RSR', 'SBS', 'RZR'] },
  { id: 'sophisticatedbackpacks:filter_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:inception_upgrade', path: 'pattern', value: ['ESE', 'DBD', 'EZE'] },
  { id: 'sophisticatedbackpacks:inception_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:jukebox_upgrade', path: 'pattern', value: [' J ', 'IBI', ' Z '] },
  { id: 'sophisticatedbackpacks:jukebox_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "J": "minecraft:jukebox",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:mob_catcher_upgrade', path: 'pattern', value: [' E ', ' BI', 'LZL'] },
  { id: 'sophisticatedbackpacks:mob_catcher_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:pickup_upgrade', path: 'pattern', value: [' P ', 'SBS', 'RZR'] },
  { id: 'sophisticatedbackpacks:pickup_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:refill_upgrade', path: 'pattern', value: [' E ', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:refill_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "E": "#c:ender_pearls",
      "I": RF.steel_plate,
      "R": "#c:dusts/redstone",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:restock_upgrade', path: 'pattern', value: [' P ', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:restock_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "P": "minecraft:sticky_piston",
      "R": "#c:dusts/redstone",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:smelting_upgrade', path: 'pattern', value: ['FIR', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:smelting_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:smithing_upgrade', path: 'pattern', value: [' S ', 'IBI', ' Z '] },
  { id: 'sophisticatedbackpacks:smithing_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "S": "minecraft:smithing_table",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:smoking_upgrade', path: 'pattern', value: ['RIR', 'IBI', 'RZR'] },
  { id: 'sophisticatedbackpacks:smoking_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "R": "#c:dusts/redstone",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:smoking_upgrade_from_smelting_upgrade', path: 'pattern', value: [' L ', 'LSL', ' Z '] },
  { id: 'sophisticatedbackpacks:smoking_upgrade_from_smelting_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_omega_tier', path: 'pattern', value: ['SSS', 'SSS', 'SZS'] },
  { id: 'sophisticatedbackpacks:stack_upgrade_omega_tier', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier', path: 'pattern', value: ['CCC', 'CBC', 'CZC'] },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_1_conversion',
    path: 'pattern',
    value: [' I ', 'ILI', ' Z ']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_1_conversion',
    path: 'key.Z',
    value: RF.steel_screw
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_2_conversion',
    path: 'pattern',
    value: ['GGG', 'GSG', 'GZG']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_2_conversion',
    path: 'key.Z',
    value: RF.steel_screw
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_3_conversion',
    path: 'pattern',
    value: ['DDD', 'DSD', 'DZD']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_3_conversion',
    path: 'key.Z',
    value: RF.steel_screw
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_4_conversion',
    path: 'pattern',
    value: ['NNN', 'NSN', 'NZN']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_starter_tier_to_tier_4_conversion',
    path: 'key.Z',
    value: RF.steel_screw
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1', path: 'pattern', value: ['III', 'IBI', 'IZI'] },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_from_starter', path: 'pattern', value: [' I ', 'ISI', ' Z '] },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_from_starter', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_2_conversion',
    path: 'pattern',
    value: ['GGG', 'GLG', 'GZG']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_2_conversion', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_3_conversion',
    path: 'pattern',
    value: ['DDD', 'DSD', 'DZD']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_3_conversion', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_4_conversion',
    path: 'pattern',
    value: ['NNN', 'NSN', 'NZN']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_1_to_tier_4_conversion', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_2', path: 'pattern', value: ['GGG', 'GSG', 'GZG'] },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_2', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_3_conversion',
    path: 'pattern',
    value: ['DDD', 'DLD', 'DZD']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_3_conversion', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_4_conversion',
    path: 'pattern',
    value: ['NNN', 'NSN', 'NZN']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_2_to_tier_4_conversion', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_3', path: 'pattern', value: ['DDD', 'DSD', 'DZD'] },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_3', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_3_to_tier_4_conversion',
    path: 'pattern',
    value: ['NNN', 'NLN', 'NZN']
  },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_3_to_tier_4_conversion', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_4', path: 'pattern', value: ['NNN', 'NSN', 'NZN'] },
  { id: 'sophisticatedbackpacks:stack_upgrade_tier_4', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:stonecutter_upgrade', path: 'pattern', value: [' S ', 'IBI', ' Z '] },
  { id: 'sophisticatedbackpacks:stonecutter_upgrade',
    path: 'key',
    value: { "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "S": "minecraft:stonecutter",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:tool_swapper_upgrade', path: 'pattern', value: ['RWR', 'PBA', 'IZI'] },
  { id: 'sophisticatedbackpacks:tool_swapper_upgrade',
    path: 'key',
    value: { "A": "minecraft:wooden_axe",
      "B": "sophisticatedbackpacks:upgrade_base",
      "I": RF.steel_plate,
      "P": "minecraft:wooden_pickaxe",
      "R": "#c:dusts/redstone",
      "W": "minecraft:wooden_sword",
      "Z": RF.steel_screw
    }
  },
  { id: 'sophisticatedbackpacks:void_upgrade', path: 'pattern', value: [' E ', 'OBO', 'RZR'] },
  { id: 'sophisticatedbackpacks:void_upgrade', path: 'key.Z', value: RF.steel_screw },
  { id: 'sophisticatedbackpacks:xp_pump_upgrade', path: 'pattern', value: ['RER', 'CPC', 'RZR'] },
  { id: 'sophisticatedbackpacks:xp_pump_upgrade', path: 'key.Z', value: RF.steel_screw },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Backpacks', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
