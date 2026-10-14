import { gt, gtItemJson, GT_FORM, resolveMaterial } from '../src/lib/gt6_materials.js'
import { applyOne } from '../src/lib/gt6_reforge.js'

// RailCraft reforge: replace RailCraft material items and c:/forge: material tags with GT6 equivalents.
// Every edit is written out explicitly; the comment above each line shows the original tag/item.

ServerEvents.recipes(event => {

  // minecraft:lead_ingot_from_blasting_deepslate_lead_ore
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'minecraft:lead_ingot_from_blasting_deepslate_lead_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // minecraft:lead_ingot_from_blasting_lead_ore
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'minecraft:lead_ingot_from_blasting_lead_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // minecraft:lead_ingot_from_blasting_lead_raw
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'minecraft:lead_ingot_from_blasting_lead_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // minecraft:lead_ingot_from_smelting_deepslate_lead_ore
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'minecraft:lead_ingot_from_smelting_deepslate_lead_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // minecraft:lead_ingot_from_smelting_lead_ore
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'minecraft:lead_ingot_from_smelting_lead_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // minecraft:lead_ingot_from_smelting_lead_raw
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'minecraft:lead_ingot_from_smelting_lead_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // minecraft:nickel_ingot_from_blasting_deepslate_nickel_ore
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'minecraft:nickel_ingot_from_blasting_deepslate_nickel_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // minecraft:nickel_ingot_from_blasting_nickel_ore
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'minecraft:nickel_ingot_from_blasting_nickel_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // minecraft:nickel_ingot_from_blasting_nickel_raw
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'minecraft:nickel_ingot_from_blasting_nickel_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // minecraft:nickel_ingot_from_smelting_deepslate_nickel_ore
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'minecraft:nickel_ingot_from_smelting_deepslate_nickel_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // minecraft:nickel_ingot_from_smelting_nickel_ore
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'minecraft:nickel_ingot_from_smelting_nickel_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // minecraft:nickel_ingot_from_smelting_nickel_raw
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'minecraft:nickel_ingot_from_smelting_nickel_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // minecraft:silver_ingot_from_blasting_deepslate_silver_ore
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'minecraft:silver_ingot_from_blasting_deepslate_silver_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // minecraft:silver_ingot_from_blasting_silver_ore
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'minecraft:silver_ingot_from_blasting_silver_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // minecraft:silver_ingot_from_blasting_silver_raw
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'minecraft:silver_ingot_from_blasting_silver_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // minecraft:silver_ingot_from_smelting_deepslate_silver_ore
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'minecraft:silver_ingot_from_smelting_deepslate_silver_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // minecraft:silver_ingot_from_smelting_silver_ore
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'minecraft:silver_ingot_from_smelting_silver_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // minecraft:silver_ingot_from_smelting_silver_raw
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'minecraft:silver_ingot_from_smelting_silver_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // minecraft:tin_ingot_from_blasting_deepslate_tin_ore
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'minecraft:tin_ingot_from_blasting_deepslate_tin_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // minecraft:tin_ingot_from_blasting_tin_ore
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'minecraft:tin_ingot_from_blasting_tin_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // minecraft:tin_ingot_from_blasting_tin_raw
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'minecraft:tin_ingot_from_blasting_tin_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // minecraft:tin_ingot_from_smelting_deepslate_tin_ore
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'minecraft:tin_ingot_from_smelting_deepslate_tin_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // minecraft:tin_ingot_from_smelting_tin_ore
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'minecraft:tin_ingot_from_smelting_tin_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // minecraft:tin_ingot_from_smelting_tin_raw
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'minecraft:tin_ingot_from_smelting_tin_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // minecraft:zinc_ingot_from_blasting_deepslate_zinc_ore
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'minecraft:zinc_ingot_from_blasting_deepslate_zinc_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // minecraft:zinc_ingot_from_blasting_zinc_ore
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'minecraft:zinc_ingot_from_blasting_zinc_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // minecraft:zinc_ingot_from_blasting_zinc_raw
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'minecraft:zinc_ingot_from_blasting_zinc_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // minecraft:zinc_ingot_from_smelting_deepslate_zinc_ore
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'minecraft:zinc_ingot_from_smelting_deepslate_zinc_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // minecraft:zinc_ingot_from_smelting_zinc_ore
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'minecraft:zinc_ingot_from_smelting_zinc_ore',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // minecraft:zinc_ingot_from_smelting_zinc_raw
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'minecraft:zinc_ingot_from_smelting_zinc_raw',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // railcraft:advanced_detector
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:advanced_detector',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:advanced_item_loader
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:advanced_item_loader',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:advanced_item_unloader
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:advanced_item_unloader',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:blast_furnace/blasting_bucket
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_bucket',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 3 })
  )

  // railcraft:blast_furnace/blasting_iron_axe
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_axe',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 3 })
  )

  // railcraft:blast_furnace/blasting_iron_boots
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_boots',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 4 })
  )

  // railcraft:blast_furnace/blasting_iron_chestplate
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_chestplate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 8 })
  )

  // railcraft:blast_furnace/blasting_iron_crowbar
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_crowbar',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_iron_door
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_door',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_iron_helmet
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_helmet',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 5 })
  )

  // railcraft:blast_furnace/blasting_iron_hoe
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_hoe',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_iron_horse_armor
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_horse_armor',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 4 })
  )

  // railcraft:blast_furnace/blasting_iron_ingot
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_ingot',
      'ingredient',
      'minecraft:iron_ingot'
  )
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_ingot',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('steel'))
  )

  // railcraft:blast_furnace/blasting_iron_leggings
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_leggings',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 7 })
  )

  // railcraft:blast_furnace/blasting_iron_pickaxe
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_pickaxe',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 3 })
  )

  // railcraft:blast_furnace/blasting_iron_shovel
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_shovel',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('steel'))
  )

  // railcraft:blast_furnace/blasting_iron_sword
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_sword',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_iron_trapdoor
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_iron_trapdoor',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 4 })
  )

  // railcraft:blast_furnace/blasting_shears
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_shears',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_steel_axe
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_axe',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_steel_boots
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_boots',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 3 })
  )

  // railcraft:blast_furnace/blasting_steel_chestplate
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_chestplate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 7 })
  )

  // railcraft:blast_furnace/blasting_steel_helmet
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_helmet',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 4 })
  )

  // railcraft:blast_furnace/blasting_steel_hoe
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_hoe',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('steel'))
  )

  // railcraft:blast_furnace/blasting_steel_leggings
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_leggings',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 6 })
  )

  // railcraft:blast_furnace/blasting_steel_pickaxe
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_pickaxe',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 2 })
  )

  // railcraft:blast_furnace/blasting_steel_shears
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_shears',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('steel'))
  )

  // railcraft:blast_furnace/blasting_steel_sword
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:blast_furnace/blasting_steel_sword',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('steel'))
  )

  // railcraft:brass_block_from_brass_ingot
  //   railcraft:brass_ingot  ->  GT brass ingot
  applyOne(event, 'railcraft:brass_block_from_brass_ingot',
      'key.a',
      gt('ingot', 'brass')
  )

  // railcraft:brass_gear
  //   #c:ingots/brass  ->  GT brass ingot
  applyOne(event, 'railcraft:brass_gear',
      'key.a',
      gt('ingot', 'brass')
  )
  //   railcraft:brass_gear  ->  GT brass gear
  applyOne(event, 'railcraft:brass_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('brass'))
  )

  // railcraft:brass_ingot
  //   railcraft:brass_ingot  ->  GT brass ingot
  applyOne(event, 'railcraft:brass_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('brass')), { count: 9 })
  )

  // railcraft:brass_ingot_crafted_with_ingots
  //   #c:ingots/zinc  ->  GT zinc ingot
  applyOne(event, 'railcraft:brass_ingot_crafted_with_ingots',
      'key.a',
      gt('ingot', 'zinc')
  )
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:brass_ingot_crafted_with_ingots',
      'key.b',
      gt('ingot', 'copper')
  )
  //   railcraft:brass_ingot  ->  GT brass ingot
  applyOne(event, 'railcraft:brass_ingot_crafted_with_ingots',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('brass')), { count: 4 })
  )

  // railcraft:brass_ingot_from_brass_nugget
  //   railcraft:brass_ingot  ->  GT brass ingot
  applyOne(event, 'railcraft:brass_ingot_from_brass_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('brass'))
  )

  // railcraft:brass_nugget
  //   railcraft:brass_ingot  ->  GT brass ingot
  applyOne(event, 'railcraft:brass_nugget',
      'ingredients[0]',
      gt('ingot', 'brass')
  )

  // railcraft:bronze_block_from_bronze_ingot
  //   railcraft:bronze_ingot  ->  GT bronze ingot
  applyOne(event, 'railcraft:bronze_block_from_bronze_ingot',
      'key.a',
      gt('ingot', 'bronze')
  )

  // railcraft:bronze_gear
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:bronze_gear',
      'key.a',
      gt('ingot', 'bronze')
  )
  //   railcraft:bronze_gear  ->  GT bronze gear
  applyOne(event, 'railcraft:bronze_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('bronze'))
  )

  // railcraft:bronze_ingot
  //   railcraft:bronze_ingot  ->  GT bronze ingot
  applyOne(event, 'railcraft:bronze_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('bronze')), { count: 9 })
  )

  // railcraft:bronze_ingot_crafted_with_ingots
  //   #c:ingots/tin  ->  GT tin ingot
  applyOne(event, 'railcraft:bronze_ingot_crafted_with_ingots',
      'key.a',
      gt('ingot', 'tin')
  )
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:bronze_ingot_crafted_with_ingots',
      'key.b',
      gt('ingot', 'copper')
  )
  //   railcraft:bronze_ingot  ->  GT bronze ingot
  applyOne(event, 'railcraft:bronze_ingot_crafted_with_ingots',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('bronze')), { count: 4 })
  )

  // railcraft:bronze_ingot_from_bronze_nugget
  //   railcraft:bronze_ingot  ->  GT bronze ingot
  applyOne(event, 'railcraft:bronze_ingot_from_bronze_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('bronze'))
  )

  // railcraft:bronze_nugget
  //   railcraft:bronze_ingot  ->  GT bronze ingot
  applyOne(event, 'railcraft:bronze_nugget',
      'ingredients[0]',
      gt('ingot', 'bronze')
  )

  // railcraft:bronze_tunnel_bore_head
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:bronze_tunnel_bore_head',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:buffer_stop_track_kit
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:buffer_stop_track_kit',
      'ingredients[2]',
      'minecraft:iron_ingot'
  )
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:buffer_stop_track_kit',
      'ingredients[3]',
      'minecraft:iron_ingot'
  )

  // railcraft:bushing_gear_brass
  //   #c:ingots/brass  ->  GT brass ingot
  applyOne(event, 'railcraft:bushing_gear_brass',
      'key.a',
      gt('ingot', 'brass')
  )

  // railcraft:bushing_gear_bronze
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:bushing_gear_bronze',
      'key.a',
      gt('ingot', 'bronze')
  )

  // railcraft:charge_coil
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:charge_coil',
      'key.b',
      gt('plate', 'iron')
  )

  // railcraft:charge_meter
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:charge_meter',
      'key.a',
      gt('ingot', 'copper')
  )
  //   #c:ingots/brass  ->  GT brass ingot
  applyOne(event, 'railcraft:charge_meter',
      'key.d',
      gt('ingot', 'brass')
  )

  // railcraft:charge_motor
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:charge_motor',
      'key.a',
      gt('ingot', 'steel')
  )
  //   #c:plates/tin  ->  GT tin plate
  applyOne(event, 'railcraft:charge_motor',
      'key.b',
      gt('plate', 'tin')
  )

  // railcraft:charge_terminal
  //   #c:ingots/brass  ->  GT brass ingot
  applyOne(event, 'railcraft:charge_terminal',
      'key.a',
      gt('ingot', 'brass')
  )
  //   #c:plates/brass  ->  GT brass plate
  applyOne(event, 'railcraft:charge_terminal',
      'key.b',
      gt('plate', 'brass')
  )

  // railcraft:controller_circuit
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:controller_circuit',
      'key.G',
      gt('ingot', 'gold')
  )

  // railcraft:copper_gear
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:copper_gear',
      'key.a',
      gt('ingot', 'copper')
  )
  //   railcraft:copper_gear  ->  GT copper gear
  applyOne(event, 'railcraft:copper_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('copper'))
  )

  // railcraft:crusher/crushing_tags_ingots_bronze
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_bronze',
      'ingredient',
      gt('ingot', 'bronze')
  )
  //   #c:dusts/bronze  ->  GT bronze dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_bronze',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('bronze'))
  )

  // railcraft:crusher/crushing_tags_ingots_copper
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_copper',
      'ingredient',
      gt('ingot', 'copper')
  )
  //   #c:dusts/copper  ->  GT copper dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_copper',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('copper'))
  )

  // railcraft:crusher/crushing_tags_ingots_gold
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_gold',
      'ingredient',
      gt('ingot', 'gold')
  )
  //   #c:dusts/gold  ->  GT gold dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_gold',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('gold'))
  )

  // railcraft:crusher/crushing_tags_ingots_iron
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_iron',
      'ingredient',
      'minecraft:iron_ingot'
  )
  //   #c:dusts/iron  ->  GT iron dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_iron',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('iron'))
  )

  // railcraft:crusher/crushing_tags_ingots_lead
  //   #c:ingots/lead  ->  GT lead ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_lead',
      'ingredient',
      gt('ingot', 'lead')
  )
  //   #c:dusts/lead  ->  GT lead dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_lead',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('lead'))
  )

  // railcraft:crusher/crushing_tags_ingots_nickel
  //   #c:ingots/nickel  ->  GT nickel ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_nickel',
      'ingredient',
      gt('ingot', 'nickel')
  )
  //   #c:dusts/nickel  ->  GT nickel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_nickel',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('nickel'))
  )

  // railcraft:crusher/crushing_tags_ingots_silver
  //   #c:ingots/silver  ->  GT silver ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_silver',
      'ingredient',
      gt('ingot', 'silver')
  )
  //   #c:dusts/silver  ->  GT silver dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_silver',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('silver'))
  )

  // railcraft:crusher/crushing_tags_ingots_steel
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_steel',
      'ingredient',
      gt('ingot', 'steel')
  )
  //   #c:dusts/steel  ->  GT steel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_steel',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('steel'))
  )

  // railcraft:crusher/crushing_tags_ingots_tin
  //   #c:ingots/tin  ->  GT tin ingot
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_tin',
      'ingredient',
      gt('ingot', 'tin')
  )
  //   #c:dusts/tin  ->  GT tin dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ingots_tin',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('tin'))
  )

  // railcraft:crusher/crushing_tags_ores_copper
  //   #c:dusts/copper  ->  GT copper dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_copper',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('copper'))
  )
  //   #c:dusts/gold  ->  GT gold dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_copper',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('gold'))
  )

  // railcraft:crusher/crushing_tags_ores_gold
  //   #c:dusts/gold  ->  GT gold dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_gold',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('gold'))
  )

  // railcraft:crusher/crushing_tags_ores_iron
  //   #c:dusts/iron  ->  GT iron dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_iron',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('iron'))
  )
  //   #c:dusts/nickel  ->  GT nickel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_iron',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('nickel'))
  )

  // railcraft:crusher/crushing_tags_ores_lead
  //   #c:dusts/lead  ->  GT lead dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_lead',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('lead'))
  )
  //   #c:dusts/silver  ->  GT silver dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_lead',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('silver'))
  )

  // railcraft:crusher/crushing_tags_ores_nickel
  //   #c:dusts/nickel  ->  GT nickel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_nickel',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('nickel'))
  )

  // railcraft:crusher/crushing_tags_ores_silver
  //   #c:dusts/silver  ->  GT silver dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_silver',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('silver'))
  )
  //   #c:dusts/lead  ->  GT lead dust
  applyOne(event, 'railcraft:crusher/crushing_tags_ores_silver',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('lead'))
  )

  // railcraft:crusher/crushing_tags_raw_materials_copper
  //   #c:dusts/copper  ->  GT copper dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_copper',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('copper'))
  )
  //   #c:dusts/copper  ->  GT copper dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_copper',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('copper'))
  )

  // railcraft:crusher/crushing_tags_raw_materials_iron
  //   #c:dusts/iron  ->  GT iron dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_iron',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('iron'))
  )
  //   #c:dusts/iron  ->  GT iron dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_iron',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('iron'))
  )

  // railcraft:crusher/crushing_tags_raw_materials_nickel
  //   #c:dusts/nickel  ->  GT nickel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_nickel',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('nickel'))
  )
  //   #c:dusts/nickel  ->  GT nickel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_nickel',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('nickel'))
  )

  // railcraft:crusher/crushing_tags_raw_materials_silver
  //   #c:dusts/silver  ->  GT silver dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_silver',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('silver'))
  )
  //   #c:dusts/silver  ->  GT silver dust
  applyOne(event, 'railcraft:crusher/crushing_tags_raw_materials_silver',
      'outputs[1].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('silver'))
  )

  // railcraft:crusher/crushing_tags_storage_blocks_raw_gold
  //   #c:dusts/gold  ->  GT gold dust
  applyOne(event, 'railcraft:crusher/crushing_tags_storage_blocks_raw_gold',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('gold'))
  )

  // railcraft:crusher/crushing_tags_storage_blocks_raw_iron
  //   #c:dusts/iron  ->  GT iron dust
  applyOne(event, 'railcraft:crusher/crushing_tags_storage_blocks_raw_iron',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('iron'))
  )

  // railcraft:crusher/crushing_tags_storage_blocks_raw_lead
  //   #c:dusts/lead  ->  GT lead dust
  applyOne(event, 'railcraft:crusher/crushing_tags_storage_blocks_raw_lead',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('lead'))
  )

  // railcraft:crusher/crushing_tags_storage_blocks_raw_nickel
  //   #c:dusts/nickel  ->  GT nickel dust
  applyOne(event, 'railcraft:crusher/crushing_tags_storage_blocks_raw_nickel',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('nickel'))
  )

  // railcraft:crusher/crushing_tags_storage_blocks_raw_silver
  //   #c:dusts/silver  ->  GT silver dust
  applyOne(event, 'railcraft:crusher/crushing_tags_storage_blocks_raw_silver',
      'outputs[0].result',
      gtItemJson(GT_FORM['dust'], resolveMaterial('silver'))
  )

  // railcraft:diamond_tunnel_bore_head
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:diamond_tunnel_bore_head',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:dumping_track_kit
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:dumping_track_kit',
      'ingredients[2]',
      gt('plate', 'steel')
  )

  // railcraft:electric_locomotive
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:electric_locomotive',
      'key.b',
      gt('plate', 'steel')
  )
  //   #c:gears/steel  ->  GT steel gear
  applyOne(event, 'railcraft:electric_locomotive',
      'key.e',
      gt('gear', 'steel')
  )

  // railcraft:energy_minecart
  //   #c:ingots/lead  ->  GT lead ingot
  applyOne(event, 'railcraft:energy_minecart',
      'key.a',
      gt('ingot', 'lead')
  )

  // railcraft:feed_station
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:feed_station',
      'key.c',
      gt('plate', 'steel')
  )

  // railcraft:force_track_emitter
  //   #c:plates/tin  ->  GT tin plate
  applyOne(event, 'railcraft:force_track_emitter',
      'key.a',
      gt('plate', 'tin')
  )

  // railcraft:frame_brass_plate
  //   #c:plates/brass  ->  GT brass plate
  applyOne(event, 'railcraft:frame_brass_plate',
      'key.a',
      gt('plate', 'brass')
  )

  // railcraft:frame_bronze_plate
  //   #c:plates/bronze  ->  GT bronze plate
  applyOne(event, 'railcraft:frame_bronze_plate',
      'key.a',
      gt('plate', 'bronze')
  )

  // railcraft:frame_iron_plate
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:frame_iron_plate',
      'key.a',
      gt('plate', 'iron')
  )

  // railcraft:frame_steel_plate
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:frame_steel_plate',
      'key.a',
      gt('plate', 'steel')
  )

  // railcraft:goggles
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:goggles',
      'key.c',
      gt('ingot', 'steel')
  )

  // railcraft:gold_gear
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:gold_gear',
      'key.a',
      gt('ingot', 'gold')
  )
  //   railcraft:gold_gear  ->  GT gold gear
  applyOne(event, 'railcraft:gold_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('gold'))
  )

  // railcraft:high_pressure_steam_boiler_tank
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:high_pressure_steam_boiler_tank',
      'key.a',
      gt('plate', 'steel')
  )

  // railcraft:invar_ingot_crafted_with_ingots
  //   #c:ingots/nickel  ->  GT nickel ingot
  applyOne(event, 'railcraft:invar_ingot_crafted_with_ingots',
      'key.a',
      gt('ingot', 'nickel')
  )
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:invar_ingot_crafted_with_ingots',
      'key.b',
      'minecraft:iron_ingot'
  )

  // railcraft:iron_crowbar
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:iron_crowbar',
      'key.a',
      'minecraft:iron_ingot'
  )

  // railcraft:iron_gear
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:iron_gear',
      'key.a',
      'minecraft:iron_ingot'
  )
  //   railcraft:iron_gear  ->  GT iron gear
  applyOne(event, 'railcraft:iron_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('iron'))
  )

  // railcraft:iron_spike_maul
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:iron_spike_maul',
      'key.a',
      'minecraft:iron_ingot'
  )

  // railcraft:iron_tank_gauge
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:iron_tank_gauge',
      'key.b',
      gt('plate', 'iron')
  )

  // railcraft:iron_tank_valve
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:iron_tank_valve',
      'key.b',
      gt('plate', 'iron')
  )

  // railcraft:iron_tank_wall
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:iron_tank_wall',
      'key.a',
      gt('plate', 'iron')
  )

  // railcraft:iron_tunnel_bore_head
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:iron_tunnel_bore_head',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:lead_block_from_lead_ingot
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'railcraft:lead_block_from_lead_ingot',
      'key.a',
      gt('ingot', 'lead')
  )

  // railcraft:lead_gear
  //   #c:ingots/lead  ->  GT lead ingot
  applyOne(event, 'railcraft:lead_gear',
      'key.a',
      gt('ingot', 'lead')
  )
  //   railcraft:lead_gear  ->  GT lead gear
  applyOne(event, 'railcraft:lead_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('lead'))
  )

  // railcraft:lead_ingot
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'railcraft:lead_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('lead')), { count: 9 })
  )

  // railcraft:lead_ingot_from_lead_nugget
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'railcraft:lead_ingot_from_lead_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('lead'))
  )

  // railcraft:lead_nugget
  //   railcraft:lead_ingot  ->  GT lead ingot
  applyOne(event, 'railcraft:lead_nugget',
      'ingredients[0]',
      gt('ingot', 'lead')
  )

  // railcraft:low_pressure_steam_boiler_tank
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:low_pressure_steam_boiler_tank',
      'key.a',
      gt('plate', 'iron')
  )

  // railcraft:manual_rolling_machine
  //   #c:gears/bronze  ->  GT bronze gear
  applyOne(event, 'railcraft:manual_rolling_machine',
      'key.a',
      gt('gear', 'bronze')
  )

  // railcraft:nickel_block_from_nickel_ingot
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'railcraft:nickel_block_from_nickel_ingot',
      'key.a',
      gt('ingot', 'nickel')
  )

  // railcraft:nickel_gear
  //   #c:ingots/nickel  ->  GT nickel ingot
  applyOne(event, 'railcraft:nickel_gear',
      'key.a',
      gt('ingot', 'nickel')
  )
  //   railcraft:nickel_gear  ->  GT nickel gear
  applyOne(event, 'railcraft:nickel_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('nickel'))
  )

  // railcraft:nickel_ingot
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'railcraft:nickel_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel')), { count: 9 })
  )

  // railcraft:nickel_ingot_from_nickel_nugget
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'railcraft:nickel_ingot_from_nickel_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('nickel'))
  )

  // railcraft:nickel_nugget
  //   railcraft:nickel_ingot  ->  GT nickel ingot
  applyOne(event, 'railcraft:nickel_nugget',
      'ingredients[0]',
      gt('ingot', 'nickel')
  )

  // railcraft:personal_world_spike
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:personal_world_spike',
      'key.g',
      gt('ingot', 'gold')
  )

  // railcraft:powered_rolling_machine
  //   #c:gears/steel  ->  GT steel gear
  applyOne(event, 'railcraft:powered_rolling_machine',
      'key.a',
      gt('gear', 'steel')
  )

  // railcraft:radio_circuit
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:radio_circuit',
      'key.G',
      gt('ingot', 'gold')
  )

  // railcraft:receiver_circuit
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:receiver_circuit',
      'key.G',
      gt('ingot', 'gold')
  )

  // railcraft:rolling/advanced_rail
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:rolling/advanced_rail',
      'key.b',
      gt('ingot', 'gold')
  )

  // railcraft:rolling/black_post
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:rolling/black_post',
      'key.a',
      'minecraft:iron_ingot'
  )

  // railcraft:rolling/brass_electrode
  //   #c:plates/brass  ->  GT brass plate
  applyOne(event, 'railcraft:rolling/brass_electrode',
      'key.a',
      gt('plate', 'brass')
  )

  // railcraft:rolling/brass_plate
  //   #c:ingots/brass  ->  GT brass ingot
  applyOne(event, 'railcraft:rolling/brass_plate',
      'key.a',
      gt('ingot', 'brass')
  )
  //   railcraft:brass_plate  ->  GT brass plate
  applyOne(event, 'railcraft:rolling/brass_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('brass')), { count: 4 })
  )

  // railcraft:rolling/bronze_electrode
  //   #c:plates/bronze  ->  GT bronze plate
  applyOne(event, 'railcraft:rolling/bronze_electrode',
      'key.a',
      gt('plate', 'bronze')
  )

  // railcraft:rolling/bronze_plate
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:rolling/bronze_plate',
      'key.a',
      gt('ingot', 'bronze')
  )
  //   railcraft:bronze_plate  ->  GT bronze plate
  applyOne(event, 'railcraft:rolling/bronze_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('bronze')), { count: 4 })
  )

  // railcraft:rolling/bronze_rail
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:rolling/bronze_rail',
      'key.a',
      gt('ingot', 'bronze')
  )
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:rolling/bronze_rail',
      'key.b',
      gt('ingot', 'bronze')
  )

  // railcraft:rolling/bushing_gear_brass
  //   #c:plates/brass  ->  GT brass plate
  applyOne(event, 'railcraft:rolling/bushing_gear_brass',
      'key.a',
      gt('plate', 'brass')
  )

  // railcraft:rolling/bushing_gear_bronze
  //   #c:plates/bronze  ->  GT bronze plate
  applyOne(event, 'railcraft:rolling/bushing_gear_bronze',
      'key.a',
      gt('plate', 'bronze')
  )

  // railcraft:rolling/charge_spool_small
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:rolling/charge_spool_small',
      'key.a',
      gt('ingot', 'copper')
  )

  // railcraft:rolling/copper_electric_rail
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:rolling/copper_electric_rail',
      'key.a',
      gt('ingot', 'copper')
  )
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:rolling/copper_electric_rail',
      'key.b',
      gt('ingot', 'copper')
  )

  // railcraft:rolling/copper_electrode
  //   #c:plates/copper  ->  GT copper plate
  applyOne(event, 'railcraft:rolling/copper_electrode',
      'key.a',
      gt('plate', 'copper')
  )

  // railcraft:rolling/copper_plate
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:rolling/copper_plate',
      'key.a',
      gt('ingot', 'copper')
  )
  //   railcraft:copper_plate  ->  GT copper plate
  applyOne(event, 'railcraft:rolling/copper_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('copper')), { count: 4 })
  )

  // railcraft:rolling/electric_rail
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/electric_rail',
      'key.a',
      gt('ingot', 'steel')
  )
  //   #c:ingots/copper  ->  GT copper ingot
  applyOne(event, 'railcraft:rolling/electric_rail',
      'key.b',
      gt('ingot', 'copper')
  )
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/electric_rail',
      'key.c',
      gt('ingot', 'steel')
  )

  // railcraft:rolling/gold_electrode
  //   #c:plates/gold  ->  GT gold plate
  applyOne(event, 'railcraft:rolling/gold_electrode',
      'key.a',
      gt('plate', 'gold')
  )

  // railcraft:rolling/gold_plate
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:rolling/gold_plate',
      'key.a',
      gt('ingot', 'gold')
  )
  //   railcraft:gold_plate  ->  GT gold plate
  applyOne(event, 'railcraft:rolling/gold_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('gold')), { count: 4 })
  )

  // railcraft:rolling/iron_electrode
  //   #c:plates/iron  ->  GT iron plate
  applyOne(event, 'railcraft:rolling/iron_electrode',
      'key.a',
      gt('plate', 'iron')
  )

  // railcraft:rolling/iron_plate
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:rolling/iron_plate',
      'key.a',
      'minecraft:iron_ingot'
  )
  //   railcraft:iron_plate  ->  GT iron plate
  applyOne(event, 'railcraft:rolling/iron_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('iron')), { count: 4 })
  )

  // railcraft:rolling/lead_electrode
  //   #c:plates/lead  ->  GT lead plate
  applyOne(event, 'railcraft:rolling/lead_electrode',
      'key.a',
      gt('plate', 'lead')
  )

  // railcraft:rolling/lead_plate
  //   #c:ingots/lead  ->  GT lead ingot
  applyOne(event, 'railcraft:rolling/lead_plate',
      'key.a',
      gt('ingot', 'lead')
  )
  //   railcraft:lead_plate  ->  GT lead plate
  applyOne(event, 'railcraft:rolling/lead_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('lead')), { count: 4 })
  )

  // railcraft:rolling/nickel_electrode
  //   #c:plates/nickel  ->  GT nickel plate
  applyOne(event, 'railcraft:rolling/nickel_electrode',
      'key.a',
      gt('plate', 'nickel')
  )

  // railcraft:rolling/nickel_plate
  //   #c:ingots/nickel  ->  GT nickel ingot
  applyOne(event, 'railcraft:rolling/nickel_plate',
      'key.a',
      gt('ingot', 'nickel')
  )
  //   railcraft:nickel_plate  ->  GT nickel plate
  applyOne(event, 'railcraft:rolling/nickel_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('nickel')), { count: 4 })
  )

  // railcraft:rolling/nickel_turbine_blade
  //   #c:plates/nickel  ->  GT nickel plate
  applyOne(event, 'railcraft:rolling/nickel_turbine_blade',
      'key.a',
      gt('plate', 'nickel')
  )

  // railcraft:rolling/rebar_bronze
  //   #c:ingots/bronze  ->  GT bronze ingot
  applyOne(event, 'railcraft:rolling/rebar_bronze',
      'key.a',
      gt('ingot', 'bronze')
  )

  // railcraft:rolling/rebar_iron
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:rolling/rebar_iron',
      'key.a',
      'minecraft:iron_ingot'
  )

  // railcraft:rolling/rebar_steel
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/rebar_steel',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:rolling/silver_electrode
  //   #c:plates/silver  ->  GT silver plate
  applyOne(event, 'railcraft:rolling/silver_electrode',
      'key.a',
      gt('plate', 'silver')
  )

  // railcraft:rolling/silver_plate
  //   #c:ingots/silver  ->  GT silver ingot
  applyOne(event, 'railcraft:rolling/silver_plate',
      'key.a',
      gt('ingot', 'silver')
  )
  //   railcraft:silver_plate  ->  GT silver plate
  applyOne(event, 'railcraft:rolling/silver_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('silver')), { count: 4 })
  )

  // railcraft:rolling/standard_high_speed_rail
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/standard_high_speed_rail',
      'key.a',
      gt('ingot', 'steel')
  )
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:rolling/standard_high_speed_rail',
      'key.c',
      gt('ingot', 'gold')
  )

  // railcraft:rolling/standard_rail
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:rolling/standard_rail',
      'key.a',
      'minecraft:iron_ingot'
  )
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:rolling/standard_rail',
      'key.b',
      'minecraft:iron_ingot'
  )

  // railcraft:rolling/steel_electrode
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:rolling/steel_electrode',
      'key.a',
      gt('plate', 'steel')
  )

  // railcraft:rolling/steel_plate
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/steel_plate',
      'key.a',
      gt('ingot', 'steel')
  )
  //   railcraft:steel_plate  ->  GT steel plate
  applyOne(event, 'railcraft:rolling/steel_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('steel')), { count: 4 })
  )

  // railcraft:rolling/steel_rail
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/steel_rail',
      'key.a',
      gt('ingot', 'steel')
  )
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/steel_rail',
      'key.b',
      gt('ingot', 'steel')
  )

  // railcraft:rolling/steel_reinforced_rail
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/steel_reinforced_rail',
      'key.a',
      gt('ingot', 'steel')
  )
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:rolling/steel_reinforced_rail',
      'key.c',
      gt('ingot', 'steel')
  )

  // railcraft:rolling/steel_turbine_blade
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:rolling/steel_turbine_blade',
      'key.a',
      gt('plate', 'steel')
  )

  // railcraft:rolling/tin_electrode
  //   #c:plates/tin  ->  GT tin plate
  applyOne(event, 'railcraft:rolling/tin_electrode',
      'key.a',
      gt('plate', 'tin')
  )

  // railcraft:rolling/tin_plate
  //   #c:ingots/tin  ->  GT tin ingot
  applyOne(event, 'railcraft:rolling/tin_plate',
      'key.a',
      gt('ingot', 'tin')
  )
  //   railcraft:tin_plate  ->  GT tin plate
  applyOne(event, 'railcraft:rolling/tin_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('tin')), { count: 4 })
  )

  // railcraft:rolling/zinc_electrode
  //   #c:plates/zinc  ->  GT zinc plate
  applyOne(event, 'railcraft:rolling/zinc_electrode',
      'key.a',
      gt('plate', 'zinc')
  )

  // railcraft:rolling/zinc_plate
  //   #c:ingots/zinc  ->  GT zinc ingot
  applyOne(event, 'railcraft:rolling/zinc_plate',
      'key.a',
      gt('ingot', 'zinc')
  )
  //   railcraft:zinc_plate  ->  GT zinc plate
  applyOne(event, 'railcraft:rolling/zinc_plate',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['plate'], resolveMaterial('zinc')), { count: 4 })
  )

  // railcraft:signal_circuit
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:signal_circuit',
      'key.G',
      gt('ingot', 'gold')
  )

  // railcraft:silver_block_from_silver_ingot
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'railcraft:silver_block_from_silver_ingot',
      'key.a',
      gt('ingot', 'silver')
  )

  // railcraft:silver_gear
  //   #c:ingots/silver  ->  GT silver ingot
  applyOne(event, 'railcraft:silver_gear',
      'key.a',
      gt('ingot', 'silver')
  )
  //   railcraft:silver_gear  ->  GT silver gear
  applyOne(event, 'railcraft:silver_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('silver'))
  )

  // railcraft:silver_ingot
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'railcraft:silver_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('silver')), { count: 9 })
  )

  // railcraft:silver_ingot_from_silver_nugget
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'railcraft:silver_ingot_from_silver_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('silver'))
  )

  // railcraft:silver_nugget
  //   railcraft:silver_ingot  ->  GT silver ingot
  applyOne(event, 'railcraft:silver_nugget',
      'ingredients[0]',
      gt('ingot', 'silver')
  )

  // railcraft:steam_oven
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:steam_oven',
      'key.a',
      gt('plate', 'steel')
  )

  // railcraft:steam_turbine
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:steam_turbine',
      'key.b',
      gt('plate', 'steel')
  )

  // railcraft:steel_anvil
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_anvil',
      'key.b',
      gt('ingot', 'steel')
  )

  // railcraft:steel_axe
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_axe',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_block_from_steel_ingot
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_block_from_steel_ingot',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_boots
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_boots',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_chestplate
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_chestplate',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_crowbar
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_crowbar',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_gear
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_gear',
      'key.a',
      gt('ingot', 'steel')
  )
  //   railcraft:steel_gear  ->  GT steel gear
  applyOne(event, 'railcraft:steel_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('steel'))
  )

  // railcraft:steel_helmet
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_helmet',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_hoe
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_hoe',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_ingot
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('steel')), { count: 9 })
  )

  // railcraft:steel_ingot_from_steel_nugget
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_ingot_from_steel_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('steel'))
  )

  // railcraft:steel_leggings
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_leggings',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_nugget
  //   railcraft:steel_ingot  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_nugget',
      'ingredients[0]',
      gt('ingot', 'steel')
  )

  // railcraft:steel_pickaxe
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_pickaxe',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_shears
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_shears',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_shovel
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_shovel',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_spike_maul
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_spike_maul',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_sword
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_sword',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:steel_tank_gauge
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:steel_tank_gauge',
      'key.b',
      gt('plate', 'steel')
  )

  // railcraft:steel_tank_valve
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:steel_tank_valve',
      'key.b',
      gt('plate', 'steel')
  )

  // railcraft:steel_tank_wall
  //   #c:plates/steel  ->  GT steel plate
  applyOne(event, 'railcraft:steel_tank_wall',
      'key.a',
      gt('plate', 'steel')
  )

  // railcraft:steel_tunnel_bore_head
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:steel_tunnel_bore_head',
      'key.a',
      gt('ingot', 'steel')
  )

  // railcraft:strengthened_glass_brass
  //   #c:ingots/brass  ->  GT brass ingot
  applyOne(event, 'railcraft:strengthened_glass_brass',
      'key.b',
      gt('ingot', 'brass')
  )

  // railcraft:strengthened_glass_iron
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:strengthened_glass_iron',
      'key.b',
      'minecraft:iron_ingot'
  )

  // railcraft:strengthened_glass_nickel
  //   #c:ingots/nickel  ->  GT nickel ingot
  applyOne(event, 'railcraft:strengthened_glass_nickel',
      'key.b',
      gt('ingot', 'nickel')
  )

  // railcraft:strengthened_glass_tin
  //   #c:ingots/tin  ->  GT tin ingot
  applyOne(event, 'railcraft:strengthened_glass_tin',
      'key.b',
      gt('ingot', 'tin')
  )

  // railcraft:tin_block_from_tin_ingot
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'railcraft:tin_block_from_tin_ingot',
      'key.a',
      gt('ingot', 'tin')
  )

  // railcraft:tin_gear
  //   #c:ingots/tin  ->  GT tin ingot
  applyOne(event, 'railcraft:tin_gear',
      'key.a',
      gt('ingot', 'tin')
  )
  //   railcraft:tin_gear  ->  GT tin gear
  applyOne(event, 'railcraft:tin_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('tin'))
  )

  // railcraft:tin_ingot
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'railcraft:tin_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('tin')), { count: 9 })
  )

  // railcraft:tin_ingot_from_tin_nugget
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'railcraft:tin_ingot_from_tin_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('tin'))
  )

  // railcraft:tin_nugget
  //   railcraft:tin_ingot  ->  GT tin ingot
  applyOne(event, 'railcraft:tin_nugget',
      'ingredients[0]',
      gt('ingot', 'tin')
  )

  // railcraft:turbine_disk
  //   #c:ingots/steel  ->  GT steel ingot
  applyOne(event, 'railcraft:turbine_disk',
      'key.b',
      gt('ingot', 'steel')
  )

  // railcraft:water_tank_siding
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:water_tank_siding',
      'key.b',
      'minecraft:iron_ingot'
  )

  // railcraft:wooden_rail
  //   #c:ingots/iron  ->  vanilla iron ingot
  applyOne(event, 'railcraft:wooden_rail',
      'ingredients[1]',
      'minecraft:iron_ingot'
  )

  // railcraft:world_spike
  //   #c:ingots/gold  ->  GT gold ingot
  applyOne(event, 'railcraft:world_spike',
      'key.g',
      gt('ingot', 'gold')
  )

  // railcraft:zinc_block_from_zinc_ingot
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'railcraft:zinc_block_from_zinc_ingot',
      'key.a',
      gt('ingot', 'zinc')
  )

  // railcraft:zinc_gear
  //   #c:ingots/zinc  ->  GT zinc ingot
  applyOne(event, 'railcraft:zinc_gear',
      'key.a',
      gt('ingot', 'zinc')
  )
  //   railcraft:zinc_gear  ->  GT zinc gear
  applyOne(event, 'railcraft:zinc_gear',
      'result',
      gtItemJson(GT_FORM['gear'], resolveMaterial('zinc'))
  )

  // railcraft:zinc_ingot
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'railcraft:zinc_ingot',
      'result',
      Object.assign({}, gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc')), { count: 9 })
  )

  // railcraft:zinc_ingot_from_zinc_nugget
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'railcraft:zinc_ingot_from_zinc_nugget',
      'result',
      gtItemJson(GT_FORM['ingot'], resolveMaterial('zinc'))
  )

  // railcraft:zinc_nugget
  //   railcraft:zinc_ingot  ->  GT zinc ingot
  applyOne(event, 'railcraft:zinc_nugget',
      'ingredients[0]',
      gt('ingot', 'zinc')
  )

  // railcraft:fluid_fueled_firebox  [invar fix]
  //   "#c:plates/invar"  ->  GT invar
  applyOne(event, 'railcraft:fluid_fueled_firebox',
      'key.a',
      gt('plate', 'invar')
  )

  // railcraft:high_pressure_steam_boiler_tank  [invar fix]
  //   "#c:plates/invar"  ->  GT invar
  applyOne(event, 'railcraft:high_pressure_steam_boiler_tank',
      'key.b',
      gt('plate', 'invar')
  )

  // railcraft:invar_block_from_invar_ingot  [invar fix]
  //   "railcraft:invar_ingot"  ->  GT invar
  applyOne(event, 'railcraft:invar_block_from_invar_ingot',
      'key.a',
      gt('ingot', 'invar')
  )

  // railcraft:invar_gear  [invar fix]
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:invar_gear',
      'key.a',
      gt('ingot', 'invar')
  )

  // railcraft:invar_nugget  [invar fix]
  //   "railcraft:invar_ingot"  ->  GT invar
  applyOne(event, 'railcraft:invar_nugget',
      'ingredients[0]',
      gt('ingot', 'invar')
  )

  // railcraft:low_pressure_steam_boiler_tank  [invar fix]
  //   "#c:plates/invar"  ->  GT invar
  applyOne(event, 'railcraft:low_pressure_steam_boiler_tank',
      'key.b',
      gt('plate', 'invar')
  )

  // railcraft:rolling/invar_electrode  [invar fix]
  //   "#c:plates/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/invar_electrode',
      'key.a',
      gt('plate', 'invar')
  )

  // railcraft:rolling/invar_plate  [invar fix]
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/invar_plate',
      'key.a',
      gt('ingot', 'invar')
  )

  // railcraft:rolling/invar_rail  [invar fix]
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/invar_rail',
      'key.a',
      gt('ingot', 'invar')
  )
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/invar_rail',
      'key.b',
      gt('ingot', 'invar')
  )

  // railcraft:rolling/invar_reinforced_rail  [invar fix]
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/invar_reinforced_rail',
      'key.a',
      gt('ingot', 'invar')
  )
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/invar_reinforced_rail',
      'key.c',
      gt('ingot', 'invar')
  )

  // railcraft:rolling/rebar_invar  [invar fix]
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:rolling/rebar_invar',
      'key.a',
      gt('ingot', 'invar')
  )

  // railcraft:strengthened_glass_invar  [invar fix]
  //   "#c:ingots/invar"  ->  GT invar
  applyOne(event, 'railcraft:strengthened_glass_invar',
      'key.b',
      gt('ingot', 'invar')
  )
})
