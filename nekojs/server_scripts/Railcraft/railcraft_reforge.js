import { gt, gtItemJson, GT_FORM, resolveMaterial } from '../src/lib/gt6_materials.js'

const TARGETS = `minecraft:gunpowder
minecraft:lead_ingot_from_blasting_deepslate_lead_ore
minecraft:lead_ingot_from_blasting_lead_ore
minecraft:lead_ingot_from_blasting_lead_raw
minecraft:lead_ingot_from_smelting_deepslate_lead_ore
minecraft:lead_ingot_from_smelting_lead_ore
minecraft:lead_ingot_from_smelting_lead_raw
minecraft:nickel_ingot_from_blasting_deepslate_nickel_ore
minecraft:nickel_ingot_from_blasting_nickel_ore
minecraft:nickel_ingot_from_blasting_nickel_raw
minecraft:nickel_ingot_from_smelting_deepslate_nickel_ore
minecraft:nickel_ingot_from_smelting_nickel_ore
minecraft:nickel_ingot_from_smelting_nickel_raw
minecraft:rail
minecraft:silver_ingot_from_blasting_deepslate_silver_ore
minecraft:silver_ingot_from_blasting_silver_ore
minecraft:silver_ingot_from_blasting_silver_raw
minecraft:silver_ingot_from_smelting_deepslate_silver_ore
minecraft:silver_ingot_from_smelting_silver_ore
minecraft:silver_ingot_from_smelting_silver_raw
minecraft:tin_ingot_from_blasting_deepslate_tin_ore
minecraft:tin_ingot_from_blasting_tin_ore
minecraft:tin_ingot_from_blasting_tin_raw
minecraft:tin_ingot_from_smelting_deepslate_tin_ore
minecraft:tin_ingot_from_smelting_tin_ore
minecraft:tin_ingot_from_smelting_tin_raw
minecraft:zinc_ingot_from_blasting_deepslate_zinc_ore
minecraft:zinc_ingot_from_blasting_zinc_ore
minecraft:zinc_ingot_from_blasting_zinc_raw
minecraft:zinc_ingot_from_smelting_deepslate_zinc_ore
minecraft:zinc_ingot_from_smelting_zinc_ore
minecraft:zinc_ingot_from_smelting_zinc_raw
railcraft:abandoned_activator_track
railcraft:abandoned_booster_track
railcraft:abandoned_buffer_stop_track
railcraft:abandoned_control_track
railcraft:abandoned_coupler_track
railcraft:abandoned_detector_track
railcraft:abandoned_disembarking_track
railcraft:abandoned_dumping_track
railcraft:abandoned_embarking_track
railcraft:abandoned_gated_track
railcraft:abandoned_junction_track
railcraft:abandoned_launcher_track
railcraft:abandoned_locking_track
railcraft:abandoned_locomotive_track
railcraft:abandoned_one_way_track
railcraft:abandoned_routing_track
railcraft:abandoned_throttle_track
railcraft:abandoned_track
railcraft:abandoned_turnout_track
railcraft:abandoned_whistle_track
railcraft:abandoned_wye_track
railcraft:abyssal_brick_slab
railcraft:abyssal_brick_stairs
railcraft:abyssal_bricks
railcraft:abyssal_paver
railcraft:abyssal_paver_slab
railcraft:abyssal_paver_stairs
railcraft:activator_track_kit
railcraft:advanced_detector
railcraft:advanced_item_loader
railcraft:advanced_item_unloader
railcraft:age_detector
railcraft:analog_signal_controller_box
railcraft:animal_detector
railcraft:any_detector
railcraft:bag_of_cement
railcraft:bag_of_cement_slag
railcraft:black_iron_tank_gauge
railcraft:black_iron_tank_valve
railcraft:black_iron_tank_wall
railcraft:black_post
railcraft:black_steel_tank_gauge
railcraft:black_steel_tank_valve
railcraft:black_steel_tank_wall
railcraft:black_strengthened_glass
railcraft:blast_furnace/blasting_bucket
railcraft:blast_furnace/blasting_iron_axe
railcraft:blast_furnace/blasting_iron_boots
railcraft:blast_furnace/blasting_iron_chestplate
railcraft:blast_furnace/blasting_iron_crowbar
railcraft:blast_furnace/blasting_iron_door
railcraft:blast_furnace/blasting_iron_helmet
railcraft:blast_furnace/blasting_iron_hoe
railcraft:blast_furnace/blasting_iron_horse_armor
railcraft:blast_furnace/blasting_iron_ingot
railcraft:blast_furnace/blasting_iron_leggings
railcraft:blast_furnace/blasting_iron_pickaxe
railcraft:blast_furnace/blasting_iron_shovel
railcraft:blast_furnace/blasting_iron_sword
railcraft:blast_furnace/blasting_iron_trapdoor
railcraft:blast_furnace/blasting_shears
railcraft:blast_furnace/blasting_steel_axe
railcraft:blast_furnace/blasting_steel_block
railcraft:blast_furnace/blasting_steel_boots
railcraft:blast_furnace/blasting_steel_chestplate
railcraft:blast_furnace/blasting_steel_helmet
railcraft:blast_furnace/blasting_steel_hoe
railcraft:blast_furnace/blasting_steel_leggings
railcraft:blast_furnace/blasting_steel_pickaxe
railcraft:blast_furnace/blasting_steel_shears
railcraft:blast_furnace/blasting_steel_sword
railcraft:blast_furnace_bricks
railcraft:block_signal
railcraft:blue_iron_tank_gauge
railcraft:blue_iron_tank_valve
railcraft:blue_iron_tank_wall
railcraft:blue_post
railcraft:blue_steel_tank_gauge
railcraft:blue_steel_tank_valve
railcraft:blue_steel_tank_wall
railcraft:blue_strengthened_glass
railcraft:booster_track_kit
railcraft:brass_block_from_brass_ingot
railcraft:brass_gear
railcraft:brass_ingot
railcraft:brass_ingot_crafted_with_ingots
railcraft:brass_ingot_from_brass_nugget
railcraft:brass_nugget
railcraft:bronze_block_from_bronze_ingot
railcraft:bronze_gear
railcraft:bronze_ingot
railcraft:bronze_ingot_crafted_with_ingots
railcraft:bronze_ingot_from_bronze_nugget
railcraft:bronze_nugget
railcraft:bronze_tunnel_bore_head
railcraft:brown_iron_tank_gauge
railcraft:brown_iron_tank_valve
railcraft:brown_iron_tank_wall
railcraft:brown_post
railcraft:brown_steel_tank_gauge
railcraft:brown_steel_tank_valve
railcraft:brown_steel_tank_wall
railcraft:brown_strengthened_glass
railcraft:buffer_stop_track_kit
railcraft:bushing_gear_brass
railcraft:bushing_gear_bronze
railcraft:cargo_minecart
railcraft:cart_dispenser
railcraft:charge_coil
railcraft:charge_meter
railcraft:charge_motor
railcraft:charge_spool_medium_from_large
railcraft:charge_spool_small_from_medium
railcraft:charge_terminal
railcraft:chest_minecart_disassembly
railcraft:chimney
railcraft:chiseled_abyssal_stone
railcraft:chiseled_quarried_stone
railcraft:coal_coke
railcraft:coal_coke_block_from_coal_coke
railcraft:coke_oven/charcoal
railcraft:coke_oven/coal_coke
railcraft:coke_oven/coal_coke_block
railcraft:coke_oven_bricks
railcraft:control_track_kit
railcraft:controller_circuit
railcraft:copper_gear
railcraft:coupler_track_kit
railcraft:crusher
railcraft:crusher/crushing_abyssal_brick_slab
railcraft:crusher/crushing_abyssal_brick_stairs
railcraft:crusher/crushing_amethyst_block
railcraft:crusher/crushing_blast_furnace_bricks
railcraft:crusher/crushing_blaze_rod
railcraft:crusher/crushing_bone
railcraft:crusher/crushing_brick_slab
railcraft:crusher/crushing_brick_stairs
railcraft:crusher/crushing_bricks
railcraft:crusher/crushing_charcoal
railcraft:crusher/crushing_clay
railcraft:crusher/crushing_coal
railcraft:crusher/crushing_coal_block
railcraft:crusher/crushing_cobblestone
railcraft:crusher/crushing_cobblestone_slab
railcraft:crusher/crushing_cobblestone_stairs
railcraft:crusher/crushing_coke_oven_bricks
railcraft:crusher/crushing_crushed_obsidian
railcraft:crusher/crushing_dark_prismarine
railcraft:crusher/crushing_ender_pearl
railcraft:crusher/crushing_firestone_ore
railcraft:crusher/crushing_glowstone
railcraft:crusher/crushing_gravel
railcraft:crusher/crushing_ice
railcraft:crusher/crushing_lapis_lazuli
railcraft:crusher/crushing_mossy_cobblestone
railcraft:crusher/crushing_nether_brick_fence
railcraft:crusher/crushing_nether_brick_stairs
railcraft:crusher/crushing_nether_wart_block
railcraft:crusher/crushing_netherite_ingot
railcraft:crusher/crushing_obsidian
railcraft:crusher/crushing_personal_world_spike
railcraft:crusher/crushing_prismarine
railcraft:crusher/crushing_prismarine_bricks
railcraft:crusher/crushing_quarried_brick_slab
railcraft:crusher/crushing_quarried_brick_stairs
railcraft:crusher/crushing_quartz_block
railcraft:crusher/crushing_raw_gold_block
railcraft:crusher/crushing_raw_iron_block
railcraft:crusher/crushing_redstone_lamp
railcraft:crusher/crushing_sandstone_slab
railcraft:crusher/crushing_stone_brick_stairs
railcraft:crusher/crushing_stone_slab
railcraft:crusher/crushing_tags_abyssal
railcraft:crusher/crushing_tags_coal_coke
railcraft:crusher/crushing_tags_gems_diamond
railcraft:crusher/crushing_tags_gems_emerald
railcraft:crusher/crushing_tags_gems_quartz
railcraft:crusher/crushing_tags_ingots_bronze
railcraft:crusher/crushing_tags_ingots_copper
railcraft:crusher/crushing_tags_ingots_gold
railcraft:crusher/crushing_tags_ingots_iron
railcraft:crusher/crushing_tags_ingots_lead
railcraft:crusher/crushing_tags_ingots_nickel
railcraft:crusher/crushing_tags_ingots_silver
railcraft:crusher/crushing_tags_ingots_steel
railcraft:crusher/crushing_tags_ingots_tin
railcraft:crusher/crushing_tags_ores_coal
railcraft:crusher/crushing_tags_ores_copper
railcraft:crusher/crushing_tags_ores_diamond
railcraft:crusher/crushing_tags_ores_emerald
railcraft:crusher/crushing_tags_ores_gold
railcraft:crusher/crushing_tags_ores_iron
railcraft:crusher/crushing_tags_ores_lapis
railcraft:crusher/crushing_tags_ores_lead
railcraft:crusher/crushing_tags_ores_nickel
railcraft:crusher/crushing_tags_ores_quartz
railcraft:crusher/crushing_tags_ores_redstone
railcraft:crusher/crushing_tags_ores_saltpeter
railcraft:crusher/crushing_tags_ores_silver
railcraft:crusher/crushing_tags_ores_sulfur
railcraft:crusher/crushing_tags_quarried
railcraft:crusher/crushing_tags_raw_materials_copper
railcraft:crusher/crushing_tags_raw_materials_iron
railcraft:crusher/crushing_tags_raw_materials_nickel
railcraft:crusher/crushing_tags_raw_materials_silver
railcraft:crusher/crushing_tags_sandstone_blocks
railcraft:crusher/crushing_tags_stone_bricks
railcraft:crusher/crushing_tags_stones
railcraft:crusher/crushing_tags_storage_blocks_raw_copper
railcraft:crusher/crushing_tags_storage_blocks_raw_gold
railcraft:crusher/crushing_tags_storage_blocks_raw_iron
railcraft:crusher/crushing_tags_storage_blocks_raw_lead
railcraft:crusher/crushing_tags_storage_blocks_raw_nickel
railcraft:crusher/crushing_tags_storage_blocks_raw_silver
railcraft:crusher/crushing_tags_wool
railcraft:crusher/crushing_zinc_silver_battery_empty
railcraft:cut_firestone
railcraft:cyan_iron_tank_gauge
railcraft:cyan_iron_tank_valve
railcraft:cyan_iron_tank_wall
railcraft:cyan_post
railcraft:cyan_steel_tank_gauge
railcraft:cyan_steel_tank_valve
railcraft:cyan_steel_tank_wall
railcraft:cyan_strengthened_glass
railcraft:detector_track_kit
railcraft:diamond_crowbar
railcraft:diamond_spike_maul
railcraft:diamond_tunnel_bore_head
railcraft:disembarking_track_kit
railcraft:distant_signal
railcraft:dual_block_signal
railcraft:dual_distant_signal
railcraft:dual_token_signal
railcraft:dumping_track_kit
railcraft:electric_activator_track
railcraft:electric_booster_track
railcraft:electric_buffer_stop_track
railcraft:electric_control_track
railcraft:electric_coupler_track
railcraft:electric_detector_track
railcraft:electric_disembarking_track
railcraft:electric_dumping_track
railcraft:electric_embarking_track
railcraft:electric_gated_track
railcraft:electric_junction_track
railcraft:electric_launcher_track
railcraft:electric_locking_track
railcraft:electric_locomotive
railcraft:electric_locomotive_track
railcraft:electric_one_way_track
railcraft:electric_routing_track
railcraft:electric_throttle_track
railcraft:electric_track
railcraft:electric_turnout_track
railcraft:electric_whistle_track
railcraft:electric_wye_track
railcraft:elevator_track
railcraft:embarking_track_kit
railcraft:empty_detector
railcraft:energy_minecart
railcraft:etched_abyssal_stone
railcraft:etched_quarried_stone
railcraft:feed_station
railcraft:firestone_cracked_fixing
railcraft:firestone_lava_refinement
railcraft:fluid_fueled_firebox
railcraft:fluid_loader
railcraft:fluid_unloader
railcraft:force_track_emitter
railcraft:frame_brass_plate
railcraft:frame_bronze_plate
railcraft:frame_iron_plate
railcraft:frame_steel_plate
railcraft:gated_track_kit
railcraft:goggles
railcraft:gold_gear
railcraft:golden_ticket
railcraft:gray_iron_tank_gauge
railcraft:gray_iron_tank_valve
railcraft:gray_iron_tank_wall
railcraft:gray_post
railcraft:gray_steel_tank_gauge
railcraft:gray_steel_tank_valve
railcraft:gray_steel_tank_wall
railcraft:gray_strengthened_glass
railcraft:green_iron_tank_gauge
railcraft:green_iron_tank_valve
railcraft:green_iron_tank_wall
railcraft:green_post
railcraft:green_steel_tank_gauge
railcraft:green_steel_tank_valve
railcraft:green_steel_tank_wall
railcraft:green_strengthened_glass
railcraft:high_pressure_steam_boiler_tank
railcraft:high_speed_activator_track
railcraft:high_speed_booster_track
railcraft:high_speed_detector_track
railcraft:high_speed_electric_activator_track
railcraft:high_speed_electric_booster_track
railcraft:high_speed_electric_detector_track
railcraft:high_speed_electric_junction_track
railcraft:high_speed_electric_locking_track
railcraft:high_speed_electric_locomotive_track
railcraft:high_speed_electric_throttle_track
railcraft:high_speed_electric_track
railcraft:high_speed_electric_transition_track
railcraft:high_speed_electric_turnout_track
railcraft:high_speed_electric_whistle_track
railcraft:high_speed_electric_wye_track
railcraft:high_speed_junction_track
railcraft:high_speed_locking_track
railcraft:high_speed_locomotive_track
railcraft:high_speed_throttle_track
railcraft:high_speed_track
railcraft:high_speed_transition_track
railcraft:high_speed_turnout_track
railcraft:high_speed_whistle_track
railcraft:high_speed_wye_track
railcraft:invar_block_from_invar_ingot
railcraft:invar_gear
railcraft:invar_ingot
railcraft:invar_ingot_crafted_with_ingots
railcraft:invar_ingot_from_invar_nugget
railcraft:invar_nugget
railcraft:iron_activator_track
railcraft:iron_booster_track
railcraft:iron_buffer_stop_track
railcraft:iron_control_track
railcraft:iron_coupler_track
railcraft:iron_crowbar
railcraft:iron_detector_track
railcraft:iron_disembarking_track
railcraft:iron_dumping_track
railcraft:iron_embarking_track
railcraft:iron_gated_track
railcraft:iron_gear
railcraft:iron_junction_track
railcraft:iron_launcher_track
railcraft:iron_locking_track
railcraft:iron_locomotive_track
railcraft:iron_one_way_track
railcraft:iron_routing_track
railcraft:iron_spike_maul
railcraft:iron_tank_gauge
railcraft:iron_tank_valve
railcraft:iron_tank_wall
railcraft:iron_throttle_track
railcraft:iron_tunnel_bore_head
railcraft:iron_turnout_track
railcraft:iron_whistle_track
railcraft:iron_wye_track
railcraft:item_detector
railcraft:item_loader
railcraft:item_unloader
railcraft:launcher_track_kit
railcraft:lead_block_from_lead_ingot
railcraft:lead_gear
railcraft:lead_ingot
railcraft:lead_ingot_from_lead_nugget
railcraft:lead_nugget
railcraft:light_blue_iron_tank_gauge
railcraft:light_blue_iron_tank_valve
railcraft:light_blue_iron_tank_wall
railcraft:light_blue_post
railcraft:light_blue_steel_tank_gauge
railcraft:light_blue_steel_tank_valve
railcraft:light_blue_steel_tank_wall
railcraft:light_blue_strengthened_glass
railcraft:light_gray_iron_tank_gauge
railcraft:light_gray_iron_tank_valve
railcraft:light_gray_iron_tank_wall
railcraft:light_gray_post
railcraft:light_gray_steel_tank_gauge
railcraft:light_gray_steel_tank_valve
railcraft:light_gray_steel_tank_wall
railcraft:light_gray_strengthened_glass
railcraft:lime_iron_tank_gauge
railcraft:lime_iron_tank_valve
railcraft:lime_iron_tank_wall
railcraft:lime_post
railcraft:lime_steel_tank_gauge
railcraft:lime_steel_tank_valve
railcraft:lime_steel_tank_wall
railcraft:lime_strengthened_glass
railcraft:locking_track_kit
railcraft:locomotive_color_variant
railcraft:locomotive_detector
railcraft:locomotive_track_kit
railcraft:logbook
railcraft:low_pressure_steam_boiler_tank
railcraft:magenta_iron_tank_gauge
railcraft:magenta_iron_tank_valve
railcraft:magenta_iron_tank_wall
railcraft:magenta_post
railcraft:magenta_steel_tank_gauge
railcraft:magenta_steel_tank_valve
railcraft:magenta_steel_tank_wall
railcraft:magenta_strengthened_glass
railcraft:manual_rolling_machine
railcraft:mob_detector
railcraft:nickel_block_from_nickel_ingot
railcraft:nickel_gear
railcraft:nickel_ingot
railcraft:nickel_ingot_from_nickel_nugget
railcraft:nickel_iron_battery
railcraft:nickel_nugget
railcraft:nickel_zinc_battery
railcraft:one_way_track_kit
railcraft:orange_iron_tank_gauge
railcraft:orange_iron_tank_valve
railcraft:orange_iron_tank_wall
railcraft:orange_post
railcraft:orange_steel_tank_gauge
railcraft:orange_steel_tank_valve
railcraft:orange_steel_tank_wall
railcraft:orange_strengthened_glass
railcraft:overalls
railcraft:patchouli_book_crafting
railcraft:personal_world_spike
railcraft:pink_iron_tank_gauge
railcraft:pink_iron_tank_valve
railcraft:pink_iron_tank_wall
railcraft:pink_post
railcraft:pink_steel_tank_gauge
railcraft:pink_steel_tank_valve
railcraft:pink_steel_tank_wall
railcraft:pink_strengthened_glass
railcraft:player_detector
railcraft:polished_abyssal_stone_from_abyssal_cobblestone
railcraft:polished_abyssal_stone_from_abyssal_cobblestone_in_stonecutter
railcraft:polished_abyssal_stone_from_abyssal_stone
railcraft:polished_abyssal_stone_from_abyssal_stone_in_stonecutter
railcraft:polished_quarried_stone_from_quarried_cobblestone
railcraft:polished_quarried_stone_from_quarried_cobblestone_in_stonecutter
railcraft:polished_quarried_stone_from_quarried_stone
railcraft:polished_quarried_stone_from_quarried_stone_in_stonecutter
railcraft:powered_rolling_machine
railcraft:purple_iron_tank_gauge
railcraft:purple_iron_tank_valve
railcraft:purple_iron_tank_wall
railcraft:purple_post
railcraft:purple_steel_tank_gauge
railcraft:purple_steel_tank_valve
railcraft:purple_steel_tank_wall
railcraft:purple_strengthened_glass
railcraft:quarried_brick_slab
railcraft:quarried_brick_stairs
railcraft:quarried_bricks
railcraft:quarried_paver
railcraft:quarried_paver_slab
railcraft:quarried_paver_stairs
railcraft:radio_circuit
railcraft:receiver_circuit
railcraft:red_iron_tank_gauge
railcraft:red_iron_tank_valve
railcraft:red_iron_tank_wall
railcraft:red_post
railcraft:red_steel_tank_gauge
railcraft:red_steel_tank_valve
railcraft:red_steel_tank_wall
railcraft:red_strengthened_glass
railcraft:reinforced_activator_track
railcraft:reinforced_booster_track
railcraft:reinforced_buffer_stop_track
railcraft:reinforced_control_track
railcraft:reinforced_coupler_track
railcraft:reinforced_detector_track
railcraft:reinforced_disembarking_track
railcraft:reinforced_dumping_track
railcraft:reinforced_embarking_track
railcraft:reinforced_gated_track
railcraft:reinforced_junction_track
railcraft:reinforced_launcher_track
railcraft:reinforced_locking_track
railcraft:reinforced_locomotive_track
railcraft:reinforced_one_way_track
railcraft:reinforced_routing_track
railcraft:reinforced_throttle_track
railcraft:reinforced_track
railcraft:reinforced_turnout_track
railcraft:reinforced_whistle_track
railcraft:reinforced_wye_track
railcraft:rolling/advanced_rail
railcraft:rolling/black_post
railcraft:rolling/brass_electrode
railcraft:rolling/brass_plate
railcraft:rolling/bronze_electrode
railcraft:rolling/bronze_plate
railcraft:rolling/bronze_rail
railcraft:rolling/bushing_gear_brass
railcraft:rolling/bushing_gear_bronze
railcraft:rolling/carbon_electrode
railcraft:rolling/charge_spool_large
railcraft:rolling/charge_spool_small
railcraft:rolling/copper_electric_rail
railcraft:rolling/copper_electrode
railcraft:rolling/copper_plate
railcraft:rolling/electric_rail
railcraft:rolling/gold_electrode
railcraft:rolling/gold_plate
railcraft:rolling/invar_electrode
railcraft:rolling/invar_plate
railcraft:rolling/invar_rail
railcraft:rolling/invar_reinforced_rail
railcraft:rolling/iron_electrode
railcraft:rolling/iron_plate
railcraft:rolling/lead_electrode
railcraft:rolling/lead_plate
railcraft:rolling/nickel_electrode
railcraft:rolling/nickel_plate
railcraft:rolling/nickel_turbine_blade
railcraft:rolling/rebar_bronze
railcraft:rolling/rebar_invar
railcraft:rolling/rebar_iron
railcraft:rolling/rebar_steel
railcraft:rolling/silver_electrode
railcraft:rolling/silver_plate
railcraft:rolling/standard_high_speed_rail
railcraft:rolling/standard_rail
railcraft:rolling/steel_electrode
railcraft:rolling/steel_plate
railcraft:rolling/steel_rail
railcraft:rolling/steel_reinforced_rail
railcraft:rolling/steel_turbine_blade
railcraft:rolling/tin_electrode
railcraft:rolling/tin_plate
railcraft:rolling/track_parts_bronze_nugget
railcraft:rolling/track_parts_iron_nugget
railcraft:rolling/track_parts_steel_nugget
railcraft:rolling/zinc_electrode
railcraft:rolling/zinc_plate
railcraft:rotor_repair
railcraft:routing_detector
railcraft:routing_table_book
railcraft:routing_track_kit
railcraft:sheep_detector
railcraft:signal_block_relay_box
railcraft:signal_block_surveyor
railcraft:signal_capacitor_box
railcraft:signal_circuit
railcraft:signal_controller_box
railcraft:signal_interlock_box
railcraft:signal_label
railcraft:signal_lamp
railcraft:signal_receiver_box
railcraft:signal_sequencer_box
railcraft:signal_tuner
railcraft:silver_block_from_silver_ingot
railcraft:silver_gear
railcraft:silver_ingot
railcraft:silver_ingot_from_silver_nugget
railcraft:silver_nugget
railcraft:solid_fueled_firebox
railcraft:standard_rail_from_rail
railcraft:steam_locomotive
railcraft:steam_oven
railcraft:steam_turbine
railcraft:steel_anvil
railcraft:steel_axe
railcraft:steel_block_from_steel_ingot
railcraft:steel_boots
railcraft:steel_chestplate
railcraft:steel_crowbar
railcraft:steel_gear
railcraft:steel_helmet
railcraft:steel_hoe
railcraft:steel_ingot
railcraft:steel_ingot_from_steel_nugget
railcraft:steel_leggings
railcraft:steel_nugget
railcraft:steel_pickaxe
railcraft:steel_shears
railcraft:steel_shovel
railcraft:steel_spike_maul
railcraft:steel_sword
railcraft:steel_tank_gauge
railcraft:steel_tank_valve
railcraft:steel_tank_wall
railcraft:steel_tunnel_bore_head
railcraft:stone_railbed
railcraft:stone_tie
railcraft:strap_iron_activator_track
railcraft:strap_iron_booster_track
railcraft:strap_iron_buffer_stop_track
railcraft:strap_iron_control_track
railcraft:strap_iron_coupler_track
railcraft:strap_iron_detector_track
railcraft:strap_iron_disembarking_track
railcraft:strap_iron_dumping_track
railcraft:strap_iron_embarking_track
railcraft:strap_iron_gated_track
railcraft:strap_iron_junction_track
railcraft:strap_iron_launcher_track
railcraft:strap_iron_locking_track
railcraft:strap_iron_locomotive_track
railcraft:strap_iron_one_way_track
railcraft:strap_iron_routing_track
railcraft:strap_iron_throttle_track
railcraft:strap_iron_track
railcraft:strap_iron_turnout_track
railcraft:strap_iron_whistle_track
railcraft:strap_iron_wye_track
railcraft:strengthened_glass_brass
railcraft:strengthened_glass_invar
railcraft:strengthened_glass_iron
railcraft:strengthened_glass_nickel
railcraft:strengthened_glass_tin
railcraft:switch_track_lever
railcraft:switch_track_motor
railcraft:switch_track_router
railcraft:tank_detector
railcraft:tank_minecart
railcraft:throttle_track_kit
railcraft:ticket
railcraft:tin_block_from_tin_ingot
railcraft:tin_gear
railcraft:tin_ingot
railcraft:tin_ingot_from_tin_nugget
railcraft:tin_nugget
railcraft:token_signal
railcraft:token_signal_box
railcraft:track_layer
railcraft:track_relayer
railcraft:track_remover
railcraft:track_undercutter
railcraft:train_detector
railcraft:train_dispenser
railcraft:transition_track_kit
railcraft:tunnel_bore
railcraft:turbine_disk
railcraft:turbine_rotor
railcraft:villager_detector
railcraft:void_chest
railcraft:void_chest_minecart
railcraft:void_chest_minecart_disassembly
railcraft:void_dust
railcraft:water_tank_siding
railcraft:whistle_track_kit
railcraft:whistle_tuner
railcraft:white_iron_tank_gauge
railcraft:white_iron_tank_valve
railcraft:white_iron_tank_wall
railcraft:white_post
railcraft:white_steel_tank_gauge
railcraft:white_steel_tank_valve
railcraft:white_steel_tank_wall
railcraft:white_strengthened_glass
railcraft:wooden_rail
railcraft:wooden_railbed
railcraft:wooden_tie
railcraft:world_spike
railcraft:world_spike_minecart
railcraft:worldspike_minecart_disassembly
railcraft:yellow_iron_tank_gauge
railcraft:yellow_iron_tank_valve
railcraft:yellow_iron_tank_wall
railcraft:yellow_post
railcraft:yellow_steel_tank_gauge
railcraft:yellow_steel_tank_valve
railcraft:yellow_steel_tank_wall
railcraft:yellow_strengthened_glass
railcraft:zinc_block_from_zinc_ingot
railcraft:zinc_carbon_battery
railcraft:zinc_gear
railcraft:zinc_ingot
railcraft:zinc_ingot_from_zinc_nugget
railcraft:zinc_nugget
railcraft:zinc_silver_battery`.split('\n')

const MATERIALS = ['brass', 'bronze', 'copper', 'gold', 'iron', 'lead', 'nickel', 'silver', 'steel', 'tin', 'zinc']

const FORM_BY_SUFFIX = {
  ingot: 'ingot',
  plate: 'plate',
  gear: 'gear',
  dust: 'dust',
  stick: 'stick',
  screw: 'screw',
  wire: 'wire',
  foil: 'foil',
  ring: 'ring',
  bolt: 'bolt',
  nugget: null,
  block: null
}

const GT_MATERIAL_ALIAS = { aluminium: 'aluminium', aluminum: 'aluminium' }

const SKIP_KEYS = ['type', 'category', 'group', 'pattern']

function parseMaterialItem(text) {
  if (text.indexOf('railcraft:') !== 0) {
    return null
  }
  const body = text.slice('railcraft:'.length)
  const underscore = body.lastIndexOf('_')
  if (underscore < 0) {
    return null
  }
  const material = body.slice(0, underscore)
  const suffix = body.slice(underscore + 1)
  if (MATERIALS.indexOf(material) < 0) {
    return null
  }
  const formKey = FORM_BY_SUFFIX[suffix]
  if (formKey === undefined || formKey === null) {
    return null
  }
  return { formKey: formKey, material: material }
}

function parseMaterialTag(text) {
  const prefixes = ['#c:ingots/', '#c:plates/', '#c:dusts/', '#c:gears/', '#c:rods/', '#forge:ingots/', '#forge:plates/', '#forge:dusts/']
  for (let index = 0; index < prefixes.length; index++) {
    const prefix = prefixes[index]
    if (text.indexOf(prefix) === 0) {
      const name = text.slice(prefix.length)
      const formKey = prefix.indexOf('ingots') >= 0 ? 'ingot'
        : prefix.indexOf('plates') >= 0 ? 'plate'
          : prefix.indexOf('dusts') >= 0 ? 'dust'
            : prefix.indexOf('gears') >= 0 ? 'gear' : 'stick'
      const material = GT_MATERIAL_ALIAS[name] === undefined ? name : GT_MATERIAL_ALIAS[name]
      if (MATERIALS.indexOf(material) < 0) {
        return null
      }
      return { formKey: formKey, material: material }
    }
  }
  return null
}

function parseMaterial(text) {
  const fromTag = parseMaterialTag(text)
  if (fromTag !== null) {
    return fromTag
  }
  return parseMaterialItem(text)
}

function formOfMaterialItem(text) {
  if (text.indexOf('railcraft:') !== 0) {
    return null
  }
  const body = text.slice('railcraft:'.length)
  const underscore = body.lastIndexOf('_')
  if (underscore < 0) {
    return null
  }
  const material = body.slice(0, underscore)
  const suffix = body.slice(underscore + 1)
  if (MATERIALS.indexOf(material) < 0) {
    return null
  }
  const form = FORM_BY_SUFFIX[suffix]
  if (form === undefined || form === null) {
    return null
  }
  return gt(form, material)
}

function formFromTag(text) {
  const prefixes = ['#c:ingots/', '#c:plates/', '#c:dusts/', '#c:gears/', '#c:rods/', '#forge:ingots/', '#forge:plates/', '#forge:dusts/']
  for (let index = 0; index < prefixes.length; index++) {
    const prefix = prefixes[index]
    if (text.indexOf(prefix) === 0) {
      const name = text.slice(prefix.length)
      const form = prefix.indexOf('ingots') >= 0 ? 'ingot'
        : prefix.indexOf('plates') >= 0 ? 'plate'
          : prefix.indexOf('dusts') >= 0 ? 'dust'
            : prefix.indexOf('gears') >= 0 ? 'gear' : 'stick'
      const material = GT_MATERIAL_ALIAS[name] === undefined ? name : GT_MATERIAL_ALIAS[name]
      if (MATERIALS.indexOf(material) < 0) {
        return null
      }
      return gt(form, material)
    }
  }
  return null
}

function convertStack(entry) {
  if (typeof entry === 'string') {
    const parsed = parseMaterial(entry)
    if (parsed === null) {
      return null
    }
    return gtItemJson(GT_FORM[parsed.formKey], resolveMaterial(parsed.material))
  }
  if (entry !== null && typeof entry === 'object' && !Array.isArray(entry) && typeof entry.id === 'string') {
    const parsed = parseMaterial(entry.id)
    if (parsed === null) {
      return null
    }
    const stack = gtItemJson(GT_FORM[parsed.formKey], resolveMaterial(parsed.material))
    if (entry.count !== undefined) {
      stack.count = entry.count
    }
    return stack
  }
  return null
}

function convert(entry) {
  if (typeof entry === 'string') {
    const parsed = parseMaterial(entry)
    if (parsed === null) {
      return null
    }
    return gt(parsed.formKey, parsed.material)
  }
  if (Array.isArray(entry)) {
    let changed = false
    const out = []
    for (let index = 0; index < entry.length; index++) {
      const replaced = convert(entry[index])
      if (replaced === null) {
        out.push(entry[index])
      } else {
        out.push(replaced)
        changed = true
      }
    }
    return changed ? out : null
  }
  if (entry !== null && typeof entry === 'object') {
    let changed = false
    const out = {}
    const keys = Object.keys(entry)
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]
      const current = entry[key]
      if (key === 'result' || key === 'output') {
        const replacedStack = convertStack(current)
        if (replacedStack === null) {
          out[key] = current
        } else {
          out[key] = replacedStack
          changed = true
        }
        continue
      }
      if (SKIP_KEYS.indexOf(key) >= 0) {
        out[key] = current
        continue
      }
      const replaced = convert(current)
      if (replaced === null) {
        out[key] = current
      } else {
        out[key] = replaced
        changed = true
      }
    }
    return changed ? out : null
  }
  return null
}

ServerEvents.recipes(event => {
  let recipesChanged = 0
  const problems = []
  for (let index = 0; index < TARGETS.length; index++) {
    const id = TARGETS[index]
    try {
      if (!event.exists(id)) {
        continue
      }
      const text = event.getJson(id)
      if (text == null) {
        continue
      }
      const parsed = JSON.parse(text)
      const replaced = convert(parsed)
      if (replaced === null) {
        continue
      }
      event.setJson(id, JSON.stringify(replaced))
      recipesChanged = recipesChanged + 1
    } catch (error) {
      problems.push(id + '：' + String(error))
    }
  }
  const summary = '[NekoJS/RailcraftReforge] RailCraft 配方材料改为格雷：改动 ' + recipesChanged
    + '/' + TARGETS.length + ' 条；问题 ' + problems.length + ' 处。'
  console.info(summary)
  if (problems.length > 0) {
    console.warn('[NekoJS/RailcraftReforge] 未完成：' + problems.join(' | '))
  }
})
