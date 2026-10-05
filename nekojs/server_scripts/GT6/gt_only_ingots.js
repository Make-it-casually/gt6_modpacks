import { gt } from '../src/lib/gt6_materials.js'

const TARGETS = `ae2:decorative/quartz_fixture
ae2:inscriber/logic_processor_print
ae2:materials/advancedcard
ae2:materials/basiccard
ae2:network/blocks/cell_workbench
ae2:network/blocks/crank
ae2:network/blocks/crystal_processing_charger
ae2:network/blocks/crystal_processing_growth_accelerator
ae2:network/blocks/energy_energy_acceptor
ae2:network/blocks/energy_vibration_chamber
ae2:network/blocks/inscribers
ae2:network/blocks/interfaces_interface
ae2:network/blocks/io_condenser
ae2:network/blocks/io_port
ae2:network/blocks/pattern_providers_interface
ae2:network/blocks/quantum_ring
ae2:network/blocks/spatial_anchor
ae2:network/blocks/spatial_io_port
ae2:network/blocks/storage_chest
ae2:network/blocks/storage_drive
ae2:network/cells/fluid_cell_housing
ae2:network/cells/fluid_storage_cell_16k
ae2:network/cells/fluid_storage_cell_1k
ae2:network/cells/fluid_storage_cell_256k
ae2:network/cells/fluid_storage_cell_4k
ae2:network/cells/fluid_storage_cell_64k
ae2:network/cells/item_cell_housing
ae2:network/cells/item_storage_cell_16k
ae2:network/cells/item_storage_cell_1k
ae2:network/cells/item_storage_cell_256k
ae2:network/cells/item_storage_cell_4k
ae2:network/cells/item_storage_cell_64k
ae2:network/cells/spatial_storage_cell_128_cubed
ae2:network/cells/spatial_storage_cell_16_cubed
ae2:network/cells/spatial_storage_cell_2_cubed
ae2:network/cells/view_cell
ae2:network/crafting/cpu_crafting_unit
ae2:network/crafting/molecular_assembler
ae2:network/crafting/patterns_blank
ae2:network/crystal_resonance_generator
ae2:network/parts/annihilation_plane_alt
ae2:network/parts/annihilation_plane_alt2
ae2:network/parts/export_bus
ae2:network/parts/formation_plane
ae2:network/parts/formation_plane_alt
ae2:network/parts/import_bus
ae2:network/parts/panels_semi_dark_monitor
ae2:network/parts/tunnels_me
ae2:network/wireless_booster
ae2:network/wireless_part
ae2:tools/certus_quartz_cutting_knife
ae2:tools/matter_cannon
ae2:tools/misctools_charged_staff
ae2:tools/misctools_entropy_manipulator
ae2:tools/nether_quartz_cutting_knife
ae2:tools/network_color_applicator
ae2:tools/network_memory_card
aether_ii:blast_furnace_from_holystone_furnace
agritechevolved:advanced_planter
agritechevolved:biomass_burner
agritechevolved:capacitor_tier1
agritechevolved:capacitor_tier2
agritechevolved:cloche_dome
agritechevolved:composter
agritechevolved:fertilizer_spreader
agritechevolved:silo
agritechevolved:sm_mk1
alcocraftplus:spruce_keg
applied_extended_crafting:table_advanced_pattern_provider
applied_extended_crafting:table_basic_pattern_provider
bakeries:blender
bakeries:bread_knife
bakeries:cash_register_computer
bakeries:luminous_light_sign
bakeries:moka_pot
bakeries:mould
bakeries:oven
bakeries:toaster
blockbox:brazier
blockbox:chiseled_gold
blockbox:golden_bars
blockbox:golden_door
blockbox:golden_trapdoor
blockbox:iron_plate
blockbox:soul_brazier
croptopia:cooking_pot
croptopia:frying_pan
croptopia:knife
cyclic:apple_iron
cyclic:battery_clay
cyclic:carrot_copper
cyclic:charm_knockback_resistance
cyclic:charm_water
cyclic:charm_world
cyclic:collector
cyclic:copper_axe
cyclic:copper_bars
cyclic:copper_boots
cyclic:copper_chain
cyclic:copper_chestplate
cyclic:copper_helmet
cyclic:copper_hoe
cyclic:copper_leggings
cyclic:copper_pickaxe
cyclic:copper_pressure_plate
cyclic:copper_shovel
cyclic:copper_sword
cyclic:crafting_bag
cyclic:dropper
cyclic:fan
cyclic:forester
cyclic:gold_bars
cyclic:gold_chain
cyclic:hopper_gold
cyclic:lunchbox
cyclic:mob_container_empty
cyclic:peat_farm
cyclic:scepter_build
cyclic:scepter_offset
cyclic:scepter_replace
cyclic:shapeless/copper_ingot
cyclic:shapeless/copper_nugget
cyclic:shears_obsidian
cyclic:solidifier/solidifier_amberalt
cyclic:solidifier/solidifier_charm_home
cyclic:solidifier/solidifier_charm_wing
cyclic:solidifier/solidifier_plate_launch
cyclic:solidifier/solidifier_scepter_hypno
cyclic:solidifier/solidifier_scepter_randomize
cyclic:spikes_iron
cyclic:stirrups
cyclic:stirrups_reverse
cyclic:tank
cyclic:trash
cyclic:user
enderio:alloy_smelter
enderio:basic_capacitor
enderio:crafter
enderio:energetic_photovoltaic_module
enderio:fluid_tank
enderio:iron_gear
enderio:item.minecraft.copper_ingot_from_blasting
enderio:item.minecraft.copper_ingot_from_smelting
enderio:item.minecraft.gold_ingot_from_blasting
enderio:item.minecraft.gold_ingot_from_smelting
enderio:item.minecraft.iron_ingot_from_blasting
enderio:item.minecraft.iron_ingot_from_smelting
enderio:redstone_filter_base
enderio:sag_mill
enderio:stirling_generator
enderio:travel_anchor
enderio:vacuum_chest
enderio:void_chassis
enderio:xp_vacuum
enderio:yeta_wrench
enderio_endergy:basic_capacitor
enderio_endergy:copper_energy_conduit
enderio_endergy:gold_energy_conduit
enderio_endergy:iron_energy_conduit
enderio_evolution:alloy_smelting/construction_alloy_ingot
enderio_evolution:alloy_smelting/crude_steel_ingot
enderio_evolution:alloy_smelting/energetic_silver_ingot_from_iron
enderio_evolution:capacitor/capacitor_silver_iron_iron
enderio_evolution:capacitor/capacitor_silver_iron_silver
enderio_evolution:capacitor/capacitor_silver_lead_iron
enderio_evolution:capacitor/capacitor_silver_lead_silver
enderio_evolution:conduit/crude_energy_conduit
enderio_evolution:machine/simple_machine_frame
extendedae:ingredient_buffer
extendedae:machine_frame_mirror
extendedae:machine_frame_normal
extendedae:me_packing_tape
extendedae:transform/entro_ingot
extendedcrafting:advanced_component
extendedcrafting:basic_component
extendedcrafting:black_iron_ingot
extendedcrafting:crystaltine_ingot
extendedcrafting:ender_ingot
extendedcrafting:flux_alternator
extendedcrafting:flux_crafter
extendedcrafting:flux_star
extendedcrafting:redstone_ingot
harvestheritage:hyprid/gold_ingot
harvestheritage:hyprid/iron_ingot
harvestheritage:hyprid/netherite_scrap
homesteads:honey_bottling_station_recipe
homesteads:prospector_bench_recipe
homesteads:wood_work_log_recipe
hydrofarm:animal_capture_net
hydrofarm:autocrafter
hydrofarm:butcher_bed
hydrofarm:capture_crate
hydrofarm:energy_cell
hydrofarm:energy_pipe
hydrofarm:husbandry_bed
hydrofarm:hydroelectric_generator
hydrofarm:hydrofarm_planter
hydrofarm:hydroponics_bed
hydrofarm:liquid_pipe
hydrofarm:liquid_siphon
hydrofarm:liquid_tank
hydrofarm:mending_station
hydrofarm:repulser
hydrofarm:sprinkler
hydrofarm:tree_farm_bed
hydrofarm:xp_drain
illagerinvasion:horn_of_sight
mcwdoors:garage_white_door
mcwdoors:iron_portcullis
mcwdoors:metal_door
mcwdoors:metal_hospital_door
mcwdoors:sliding_glass_door
mcwdoors:store_door
mcwdoors:wooden_portcullis
merequester:requester
minecraft:activator_rail
minecraft:anvil
minecraft:blast_furnace
minecraft:brush
minecraft:bucket
minecraft:cauldron
minecraft:clock
minecraft:compass
minecraft:copper_bars
minecraft:copper_block
minecraft:copper_boots
minecraft:copper_chain
minecraft:copper_chest
minecraft:copper_chestplate
minecraft:copper_door
minecraft:copper_helmet
minecraft:copper_leggings
minecraft:copper_nugget
minecraft:copper_trapdoor
minecraft:crafter
minecraft:crossbow
minecraft:detector_rail
minecraft:flint_and_steel
minecraft:gold_block
minecraft:gold_nugget
minecraft:golden_apple
minecraft:golden_boots
minecraft:golden_chestplate
minecraft:golden_helmet
minecraft:golden_leggings
minecraft:heavy_weighted_pressure_plate
minecraft:hopper
minecraft:iron_bars
minecraft:iron_block
minecraft:iron_boots
minecraft:iron_chain
minecraft:iron_chestplate
minecraft:iron_door
minecraft:iron_helmet
minecraft:iron_leggings
minecraft:iron_nugget
minecraft:iron_trapdoor
minecraft:lead_ingot_from_blasting_deepslate_lead_ore
minecraft:lead_ingot_from_blasting_lead_ore
minecraft:lead_ingot_from_blasting_lead_raw
minecraft:lead_ingot_from_smelting_deepslate_lead_ore
minecraft:lead_ingot_from_smelting_lead_ore
minecraft:lead_ingot_from_smelting_lead_raw
minecraft:light_weighted_pressure_plate
minecraft:lightning_rod
minecraft:lodestone
minecraft:minecart
minecraft:netherite_ingot
minecraft:nickel_ingot_from_blasting_deepslate_nickel_ore
minecraft:nickel_ingot_from_blasting_nickel_ore
minecraft:nickel_ingot_from_blasting_nickel_raw
minecraft:nickel_ingot_from_smelting_deepslate_nickel_ore
minecraft:nickel_ingot_from_smelting_nickel_ore
minecraft:nickel_ingot_from_smelting_nickel_raw
minecraft:piston
minecraft:powered_rail
minecraft:rail
minecraft:saddle
minecraft:shears
minecraft:shield
minecraft:silver_ingot_from_blasting_deepslate_silver_ore
minecraft:silver_ingot_from_blasting_silver_ore
minecraft:silver_ingot_from_blasting_silver_raw
minecraft:silver_ingot_from_smelting_deepslate_silver_ore
minecraft:silver_ingot_from_smelting_silver_ore
minecraft:silver_ingot_from_smelting_silver_raw
minecraft:smithing_table
minecraft:spyglass
minecraft:stonecutter
minecraft:tin_ingot_from_blasting_deepslate_tin_ore
minecraft:tin_ingot_from_blasting_tin_ore
minecraft:tin_ingot_from_blasting_tin_raw
minecraft:tin_ingot_from_smelting_deepslate_tin_ore
minecraft:tin_ingot_from_smelting_tin_ore
minecraft:tin_ingot_from_smelting_tin_raw
minecraft:tripwire_hook
minecraft:zinc_ingot_from_blasting_deepslate_zinc_ore
minecraft:zinc_ingot_from_blasting_zinc_ore
minecraft:zinc_ingot_from_blasting_zinc_raw
minecraft:zinc_ingot_from_smelting_deepslate_zinc_ore
minecraft:zinc_ingot_from_smelting_zinc_ore
minecraft:zinc_ingot_from_smelting_zinc_raw
mmcr:factory_controller
mmcr:heat_input_hatch
mmcr:heat_output_hatch
mmcr:key_card
mmcr:modularium
mmcr:radioactive_chemical_input_hatch
mmcr:radioactive_chemical_output_hatch
mmcr:thread_disperser
railcraft:advanced_detector
railcraft:advanced_item_loader
railcraft:advanced_item_unloader
railcraft:analog_signal_controller_box
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
railcraft:blast_furnace/blasting_steel_boots
railcraft:blast_furnace/blasting_steel_chestplate
railcraft:blast_furnace/blasting_steel_helmet
railcraft:blast_furnace/blasting_steel_hoe
railcraft:blast_furnace/blasting_steel_leggings
railcraft:blast_furnace/blasting_steel_pickaxe
railcraft:blast_furnace/blasting_steel_shears
railcraft:blast_furnace/blasting_steel_sword
railcraft:block_signal
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
railcraft:buffer_stop_track_kit
railcraft:bushing_gear_brass
railcraft:bushing_gear_bronze
railcraft:charge_meter
railcraft:charge_motor
railcraft:charge_terminal
railcraft:controller_circuit
railcraft:copper_gear
railcraft:crusher/crushing_tags_ingots_bronze
railcraft:crusher/crushing_tags_ingots_copper
railcraft:crusher/crushing_tags_ingots_gold
railcraft:crusher/crushing_tags_ingots_iron
railcraft:crusher/crushing_tags_ingots_lead
railcraft:crusher/crushing_tags_ingots_nickel
railcraft:crusher/crushing_tags_ingots_silver
railcraft:crusher/crushing_tags_ingots_steel
railcraft:crusher/crushing_tags_ingots_tin
railcraft:diamond_tunnel_bore_head
railcraft:distant_signal
railcraft:dual_block_signal
railcraft:dual_distant_signal
railcraft:dual_token_signal
railcraft:energy_minecart
railcraft:goggles
railcraft:gold_gear
railcraft:invar_ingot_crafted_with_ingots
railcraft:iron_crowbar
railcraft:iron_gear
railcraft:iron_spike_maul
railcraft:iron_tunnel_bore_head
railcraft:lead_block_from_lead_ingot
railcraft:lead_gear
railcraft:lead_ingot
railcraft:lead_ingot_from_lead_nugget
railcraft:lead_nugget
railcraft:logbook
railcraft:nickel_block_from_nickel_ingot
railcraft:nickel_gear
railcraft:nickel_ingot
railcraft:nickel_ingot_from_nickel_nugget
railcraft:nickel_nugget
railcraft:personal_world_spike
railcraft:radio_circuit
railcraft:receiver_circuit
railcraft:rolling/advanced_rail
railcraft:rolling/black_post
railcraft:rolling/brass_plate
railcraft:rolling/bronze_plate
railcraft:rolling/bronze_rail
railcraft:rolling/charge_spool_small
railcraft:rolling/copper_electric_rail
railcraft:rolling/copper_plate
railcraft:rolling/electric_rail
railcraft:rolling/gold_plate
railcraft:rolling/iron_plate
railcraft:rolling/lead_plate
railcraft:rolling/nickel_plate
railcraft:rolling/rebar_bronze
railcraft:rolling/rebar_iron
railcraft:rolling/rebar_steel
railcraft:rolling/silver_plate
railcraft:rolling/standard_high_speed_rail
railcraft:rolling/standard_rail
railcraft:rolling/steel_plate
railcraft:rolling/steel_rail
railcraft:rolling/steel_reinforced_rail
railcraft:rolling/tin_plate
railcraft:rolling/zinc_plate
railcraft:signal_block_relay_box
railcraft:signal_capacitor_box
railcraft:signal_circuit
railcraft:signal_controller_box
railcraft:signal_interlock_box
railcraft:signal_receiver_box
railcraft:signal_sequencer_box
railcraft:silver_block_from_silver_ingot
railcraft:silver_gear
railcraft:silver_ingot
railcraft:silver_ingot_from_silver_nugget
railcraft:silver_nugget
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
railcraft:steel_tunnel_bore_head
railcraft:strengthened_glass_brass
railcraft:strengthened_glass_iron
railcraft:strengthened_glass_nickel
railcraft:strengthened_glass_tin
railcraft:switch_track_lever
railcraft:switch_track_motor
railcraft:tin_block_from_tin_ingot
railcraft:tin_gear
railcraft:tin_ingot
railcraft:tin_ingot_from_tin_nugget
railcraft:tin_nugget
railcraft:token_signal
railcraft:token_signal_box
railcraft:turbine_disk
railcraft:water_tank_siding
railcraft:wooden_rail
railcraft:world_spike
railcraft:zinc_block_from_zinc_ingot
railcraft:zinc_gear
railcraft:zinc_ingot
railcraft:zinc_ingot_from_zinc_nugget
railcraft:zinc_nugget
refurbished_furniture:constructing/acacia_basin
refurbished_furniture:constructing/acacia_bath
refurbished_furniture:constructing/acacia_kitchen_sink
refurbished_furniture:constructing/acacia_light_ceiling_fan
refurbished_furniture:constructing/acacia_storage_cabinet
refurbished_furniture:constructing/acacia_toilet
refurbished_furniture:constructing/birch_basin
refurbished_furniture:constructing/birch_bath
refurbished_furniture:constructing/birch_kitchen_sink
refurbished_furniture:constructing/birch_light_ceiling_fan
refurbished_furniture:constructing/birch_storage_cabinet
refurbished_furniture:constructing/birch_toilet
refurbished_furniture:constructing/black_grill
refurbished_furniture:constructing/black_trampoline
refurbished_furniture:constructing/blue_grill
refurbished_furniture:constructing/blue_trampoline
refurbished_furniture:constructing/brown_grill
refurbished_furniture:constructing/brown_trampoline
refurbished_furniture:constructing/cherry_basin
refurbished_furniture:constructing/cherry_bath
refurbished_furniture:constructing/cherry_kitchen_sink
refurbished_furniture:constructing/cherry_light_ceiling_fan
refurbished_furniture:constructing/cherry_storage_cabinet
refurbished_furniture:constructing/cherry_toilet
refurbished_furniture:constructing/computer
refurbished_furniture:constructing/crimson_basin
refurbished_furniture:constructing/crimson_bath
refurbished_furniture:constructing/crimson_kitchen_sink
refurbished_furniture:constructing/crimson_light_ceiling_fan
refurbished_furniture:constructing/crimson_storage_cabinet
refurbished_furniture:constructing/crimson_toilet
refurbished_furniture:constructing/cyan_grill
refurbished_furniture:constructing/cyan_trampoline
refurbished_furniture:constructing/dark_oak_basin
refurbished_furniture:constructing/dark_oak_bath
refurbished_furniture:constructing/dark_oak_kitchen_sink
refurbished_furniture:constructing/dark_oak_light_ceiling_fan
refurbished_furniture:constructing/dark_oak_storage_cabinet
refurbished_furniture:constructing/dark_oak_toilet
refurbished_furniture:constructing/doorbell
refurbished_furniture:constructing/frying_pan
refurbished_furniture:constructing/gray_grill
refurbished_furniture:constructing/gray_trampoline
refurbished_furniture:constructing/green_grill
refurbished_furniture:constructing/green_trampoline
refurbished_furniture:constructing/jungle_basin
refurbished_furniture:constructing/jungle_bath
refurbished_furniture:constructing/jungle_kitchen_sink
refurbished_furniture:constructing/jungle_light_ceiling_fan
refurbished_furniture:constructing/jungle_storage_cabinet
refurbished_furniture:constructing/jungle_toilet
refurbished_furniture:constructing/light_blue_grill
refurbished_furniture:constructing/light_blue_trampoline
refurbished_furniture:constructing/light_ceiling_light
refurbished_furniture:constructing/light_fridge
refurbished_furniture:constructing/light_gray_grill
refurbished_furniture:constructing/light_gray_trampoline
refurbished_furniture:constructing/light_lightswitch
refurbished_furniture:constructing/light_microwave
refurbished_furniture:constructing/light_range_hood
refurbished_furniture:constructing/light_stove
refurbished_furniture:constructing/light_toaster
refurbished_furniture:constructing/lime_grill
refurbished_furniture:constructing/lime_trampoline
refurbished_furniture:constructing/magenta_grill
refurbished_furniture:constructing/magenta_trampoline
refurbished_furniture:constructing/mangrove_basin
refurbished_furniture:constructing/mangrove_bath
refurbished_furniture:constructing/mangrove_kitchen_sink
refurbished_furniture:constructing/mangrove_light_ceiling_fan
refurbished_furniture:constructing/mangrove_storage_cabinet
refurbished_furniture:constructing/mangrove_toilet
refurbished_furniture:constructing/oak_basin
refurbished_furniture:constructing/oak_bath
refurbished_furniture:constructing/oak_kitchen_sink
refurbished_furniture:constructing/oak_light_ceiling_fan
refurbished_furniture:constructing/oak_storage_cabinet
refurbished_furniture:constructing/oak_toilet
refurbished_furniture:constructing/orange_grill
refurbished_furniture:constructing/orange_trampoline
refurbished_furniture:constructing/pale_oak_basin
refurbished_furniture:constructing/pale_oak_bath
refurbished_furniture:constructing/pale_oak_kitchen_sink
refurbished_furniture:constructing/pale_oak_light_ceiling_fan
refurbished_furniture:constructing/pale_oak_storage_cabinet
refurbished_furniture:constructing/pale_oak_toilet
refurbished_furniture:constructing/pink_grill
refurbished_furniture:constructing/pink_trampoline
refurbished_furniture:constructing/post_box
refurbished_furniture:constructing/purple_grill
refurbished_furniture:constructing/purple_trampoline
refurbished_furniture:constructing/recycle_bin
refurbished_furniture:constructing/red_grill
refurbished_furniture:constructing/red_trampoline
refurbished_furniture:constructing/spruce_basin
refurbished_furniture:constructing/spruce_bath
refurbished_furniture:constructing/spruce_kitchen_sink
refurbished_furniture:constructing/spruce_light_ceiling_fan
refurbished_furniture:constructing/spruce_storage_cabinet
refurbished_furniture:constructing/spruce_toilet
refurbished_furniture:constructing/television
refurbished_furniture:constructing/warped_basin
refurbished_furniture:constructing/warped_bath
refurbished_furniture:constructing/warped_kitchen_sink
refurbished_furniture:constructing/warped_light_ceiling_fan
refurbished_furniture:constructing/warped_storage_cabinet
refurbished_furniture:constructing/warped_toilet
refurbished_furniture:constructing/white_grill
refurbished_furniture:constructing/white_trampoline
refurbished_furniture:constructing/yellow_grill
refurbished_furniture:constructing/yellow_trampoline
refurbished_furniture:knife
refurbished_furniture:light_electricity_generator
refurbished_furniture:spatula
refurbished_furniture:television_remote
refurbished_furniture:workbench
refurbished_furniture:wrench
rootsclassic:brazier
rootsclassic:component/azure_bluet
rootsclassic:component/oxeye_daisy
rootsclassic:ritual/time_shift
sophisticatedbackpacks:advanced_alchemy_upgrade
sophisticatedbackpacks:advanced_compacting_upgrade
sophisticatedbackpacks:advanced_deposit_upgrade
sophisticatedbackpacks:advanced_feeding_upgrade
sophisticatedbackpacks:advanced_filter_upgrade
sophisticatedbackpacks:advanced_jukebox_upgrade
sophisticatedbackpacks:advanced_magnet_upgrade
sophisticatedbackpacks:advanced_magnet_upgrade_from_basic
sophisticatedbackpacks:advanced_mob_catcher_upgrade
sophisticatedbackpacks:advanced_pickup_upgrade
sophisticatedbackpacks:advanced_pump_upgrade
sophisticatedbackpacks:advanced_refill_upgrade
sophisticatedbackpacks:advanced_restock_upgrade
sophisticatedbackpacks:advanced_tool_swapper_upgrade
sophisticatedbackpacks:advanced_void_upgrade
sophisticatedbackpacks:alchemy_upgrade
sophisticatedbackpacks:anvil_upgrade
sophisticatedbackpacks:auto_blasting_upgrade
sophisticatedbackpacks:auto_blasting_upgrade_from_auto_smelting_upgrade
sophisticatedbackpacks:auto_smelting_upgrade
sophisticatedbackpacks:auto_smoking_upgrade
sophisticatedbackpacks:battery_upgrade
sophisticatedbackpacks:blasting_upgrade
sophisticatedbackpacks:blasting_upgrade_from_smelting_upgrade
sophisticatedbackpacks:compacting_upgrade
sophisticatedbackpacks:copper_backpack
sophisticatedbackpacks:crafting_upgrade
sophisticatedbackpacks:deposit_upgrade
sophisticatedbackpacks:gold_backpack
sophisticatedbackpacks:iron_backpack
sophisticatedbackpacks:iron_backpack_from_copper
sophisticatedbackpacks:jukebox_upgrade
sophisticatedbackpacks:magnet_upgrade
sophisticatedbackpacks:mob_catcher_upgrade
sophisticatedbackpacks:refill_upgrade
sophisticatedbackpacks:restock_upgrade
sophisticatedbackpacks:smelting_upgrade
sophisticatedbackpacks:smithing_upgrade
sophisticatedbackpacks:smoking_upgrade
sophisticatedbackpacks:stonecutter_upgrade
sophisticatedbackpacks:tool_swapper_upgrade
sophisticatedbackpacks:upgrade_base
sophisticatedstorage:advanced_alchemy_upgrade
sophisticatedstorage:advanced_compacting_upgrade
sophisticatedstorage:advanced_feeding_upgrade
sophisticatedstorage:advanced_filter_upgrade
sophisticatedstorage:advanced_hopper_upgrade
sophisticatedstorage:advanced_jukebox_upgrade
sophisticatedstorage:advanced_magnet_upgrade
sophisticatedstorage:advanced_magnet_upgrade_from_basic
sophisticatedstorage:advanced_pickup_upgrade
sophisticatedstorage:advanced_void_upgrade
sophisticatedstorage:alchemy_upgrade
sophisticatedstorage:auto_blasting_upgrade
sophisticatedstorage:auto_blasting_upgrade_from_auto_smelting_upgrade
sophisticatedstorage:auto_smelting_upgrade
sophisticatedstorage:auto_smoking_upgrade
sophisticatedstorage:basic_to_copper_tier_upgrade
sophisticatedstorage:basic_to_gold_tier_upgrade
sophisticatedstorage:basic_to_iron_tier_from_basic_to_copper_tier
sophisticatedstorage:basic_to_iron_tier_upgrade
sophisticatedstorage:blasting_upgrade
sophisticatedstorage:blasting_upgrade_from_smelting_upgrade
sophisticatedstorage:compacting_upgrade
sophisticatedstorage:compression_upgrade
sophisticatedstorage:copper_barrel
sophisticatedstorage:copper_chest
sophisticatedstorage:copper_shulker_box
sophisticatedstorage:copper_to_gold_tier_upgrade
sophisticatedstorage:copper_to_iron_tier_upgrade
sophisticatedstorage:crafting_upgrade
sophisticatedstorage:double_copper_chest
sophisticatedstorage:double_gold_chest
sophisticatedstorage:double_iron_chest
sophisticatedstorage:double_iron_chest_from_copper_chest
sophisticatedstorage:gold_barrel
sophisticatedstorage:gold_chest
sophisticatedstorage:gold_shulker_box
sophisticatedstorage:hopper_upgrade
sophisticatedstorage:iron_barrel
sophisticatedstorage:iron_barrel_from_copper_barrel
sophisticatedstorage:iron_chest
sophisticatedstorage:iron_chest_from_copper_chest
sophisticatedstorage:iron_shulker_box
sophisticatedstorage:iron_shulker_box_from_copper_shulker_box
sophisticatedstorage:iron_to_gold_tier_upgrade
sophisticatedstorage:jukebox_upgrade
sophisticatedstorage:limited_copper_barrel_1
sophisticatedstorage:limited_copper_barrel_2
sophisticatedstorage:limited_copper_barrel_3
sophisticatedstorage:limited_copper_barrel_4
sophisticatedstorage:limited_gold_barrel_1
sophisticatedstorage:limited_gold_barrel_2
sophisticatedstorage:limited_gold_barrel_3
sophisticatedstorage:limited_gold_barrel_4
sophisticatedstorage:limited_iron_barrel_1
sophisticatedstorage:limited_iron_barrel_1_from_limited_copper_barrel_1
sophisticatedstorage:limited_iron_barrel_2
sophisticatedstorage:limited_iron_barrel_2_from_limited_copper_barrel_2
sophisticatedstorage:limited_iron_barrel_3
sophisticatedstorage:limited_iron_barrel_3_from_limited_copper_barrel_3
sophisticatedstorage:limited_iron_barrel_4
sophisticatedstorage:limited_iron_barrel_4_from_limited_copper_barrel_4
sophisticatedstorage:magnet_upgrade
sophisticatedstorage:smelting_upgrade
sophisticatedstorage:smoking_upgrade
sophisticatedstorage:stack_upgrade_tier_1_plus
sophisticatedstorage:stack_upgrade_tier_1_plus_to_tier_2_conversion
sophisticatedstorage:stack_upgrade_tier_1_plus_to_tier_3_conversion
sophisticatedstorage:stack_upgrade_tier_1_to_tier_1_plus_conversion
sophisticatedstorage:stack_upgrade_tier_1_to_tier_2_conversion
sophisticatedstorage:stack_upgrade_tier_1_to_tier_3_conversion
sophisticatedstorage:stack_upgrade_tier_2
sophisticatedstorage:stack_upgrade_tier_2_from_tier_1_plus
sophisticatedstorage:stack_upgrade_tier_2_to_tier_3_conversion
sophisticatedstorage:stack_upgrade_tier_3
sophisticatedstorage:stonecutter_upgrade
sophisticatedstorage:storage_input
sophisticatedstorage:storage_io
sophisticatedstorage:storage_output
sophisticatedstorage:storage_tool
sophisticatedstorage:upgrade_base
theurgy:crafting/shaped/calcination_oven
theurgy:crafting/shaped/caloric_flux_emitter_from_campfire
theurgy:crafting/shaped/caloric_flux_emitter_from_lava_bucket
theurgy:crafting/shaped/copper_wire
theurgy:crafting/shaped/digestion_vat
theurgy:crafting/shaped/distiller
theurgy:crafting/shaped/fermentation_vat
theurgy:crafting/shaped/incubator
theurgy:crafting/shaped/incubator_mercury_vessel
theurgy:crafting/shaped/incubator_salt_vessel
theurgy:crafting/shaped/incubator_sulfur_vessel
theurgy:crafting/shaped/liquefaction_cauldron
theurgy:crafting/shaped/logistics_capability_probe
theurgy:crafting/shaped/logistics_capability_proxy
theurgy:crafting/shaped/logistics_connector_node
theurgy:crafting/shaped/logistics_fluid_extractor
theurgy:crafting/shaped/logistics_fluid_inserter
theurgy:crafting/shaped/logistics_item_extractor
theurgy:crafting/shaped/logistics_item_inserter
theurgy:crafting/shaped/logistics_nexus
theurgy:crafting/shaped/mercurial_wand
theurgy:crafting/shaped/mercury_capacitor
theurgy:crafting/shaped/mercury_catalyst
theurgy:crafting/shaped/mercury_flux_emitter
theurgy:crafting/shaped/pyromantic_brazier
theurgy:crafting/shaped/reformation_result_pedestal
theurgy:crafting/shaped/reformation_source_pedestal
theurgy:crafting/shaped/reformation_target_pedestal
theurgy:crafting/shaped/sal_ammoniac_accumulator
theurgy:crafting/shaped/sal_ammoniac_tank
theurgy:crafting/shaped/sulfuric_flux_emitter
theurgy:digestion/purified_gold
theurgy:liquefaction/alchemical_sulfur_aluminum_from_ingots_aluminum
theurgy:liquefaction/alchemical_sulfur_copper_from_ingots_copper
theurgy:liquefaction/alchemical_sulfur_gold_from_ingots_gold
theurgy:liquefaction/alchemical_sulfur_iron_from_ingots_iron
theurgy:liquefaction/alchemical_sulfur_lead_from_ingots_lead
theurgy:liquefaction/alchemical_sulfur_nickel_from_ingots_nickel
theurgy:liquefaction/alchemical_sulfur_platinum_from_ingots_platinum
theurgy:liquefaction/alchemical_sulfur_silver_from_ingots_silver
theurgy:liquefaction/alchemical_sulfur_tin_from_ingots_tin
theurgy:liquefaction/alchemical_sulfur_uranium_from_ingots_uranium
theurgy:liquefaction/alchemical_sulfur_zinc_from_ingots_zinc
thirstwastaken2:advanced_drinking_upgrade
thirstwastaken2:copper_canteen
thirstwastaken2:copper_hanging_pot
thirstwastaken2:iron_flask
thirstwastaken2:iron_hanging_pot
waystones:copper_portstone
waystones:copper_sharestone
waystones:copper_sharestone_from_ruined
waystones:copper_warp_stone
waystones:gold_portstone
waystones:gold_sharestone
waystones:gold_sharestone_from_ruined
waystones:gold_warp_stone
waystones:warp_stone
wilder_wilds:golden_festive_tree_recipe
witchery:arthana
witchery:black_iron_candelabra
witchery:blood_crucible
witchery:blue_iron_candelabra
witchery:brazier
witchery:brown_iron_candelabra
witchery:cage_1
witchery:cage_2
witchery:cane_sword
witchery:cauldron
witchery:censer
witchery:censer_long
witchery:chalice
witchery:copper_cauldron
witchery:copper_witches_oven
witchery:crystal_ball
witchery:cyan_iron_candelabra
witchery:distillery
witchery:gray_iron_candelabra
witchery:green_iron_candelabra
witchery:iron_candelabra
witchery:iron_witches_oven
witchery:light_blue_iron_candelabra
witchery:light_gray_iron_candelabra
witchery:lime_iron_candelabra
witchery:magenta_iron_candelabra
witchery:orange_iron_candelabra
witchery:pink_iron_candelabra
witchery:purple_iron_candelabra
witchery:red_iron_candelabra
witchery:ritual/blocks_below_copper
witchery:ritual/blocks_below_gold
witchery:ritual/blocks_below_iron
witchery:ritual/rite_of_sunbinding
witchery:ritual/teleport_taglock_to_waystone
witchery:sunlight_collector
witchery:white_iron_candelabra
witchery:yellow_iron_candelabra`.split('\n')

const MATERIAL_ALIAS = {
  iron: 'iron',
  gold: 'gold',
  copper: 'copper',
  tin: 'tin',
  lead: 'lead',
  silver: 'silver',
  nickel: 'nickel',
  zinc: 'zinc',
  aluminium: 'aluminium',
  aluminum: 'aluminium',
  bronze: 'bronze',
  brass: 'brass',
  steel: 'steel',
  platinum: 'platinum',
  uranium: 'uranium',
  titanium: 'titanium',
  tungsten: 'tungsten',
  tungstensteel: 'tungstensteel',
  stainlesssteel: 'stainlesssteel',
  redalloy: 'redalloy'
}

const ITEM_TO_MATERIAL = {
  'minecraft:iron_ingot': 'iron',
  'minecraft:gold_ingot': 'gold',
  'minecraft:copper_ingot': 'copper',
  'railcraft:steel_ingot': 'steel',
  'railcraft:tin_ingot': 'tin',
  'railcraft:lead_ingot': 'lead',
  'railcraft:silver_ingot': 'silver',
  'railcraft:nickel_ingot': 'nickel',
  'railcraft:zinc_ingot': 'zinc',
  'railcraft:bronze_ingot': 'bronze',
  'railcraft:brass_ingot': 'brass'
}

const SKIP_KEYS = ['result', 'output', 'results', 'type', 'category', 'group', 'pattern']

function materialFromTag(text) {
  const isTag = text.indexOf('#c:ingots/') === 0 ||
    text.indexOf('#forge:ingots/') === 0 ||
    text.indexOf('#neoforge:ingots/') === 0
  if (!isTag) {
    return null
  }
  const parts = text.split('/')
  const name = parts[parts.length - 1]
  const material = MATERIAL_ALIAS[name]
  if (material === undefined) {
    return null
  }
  return material
}

function convertNode(entry) {
  if (typeof entry === 'string') {
    const fromTag = materialFromTag(entry)
    if (fromTag !== null) {
      return gt('ingot', fromTag)
    }
    const fromItem = ITEM_TO_MATERIAL[entry]
    if (fromItem === undefined) {
      return null
    }
    return gt('ingot', fromItem)
  }
  if (Array.isArray(entry)) {
    let changed = false
    const out = []
    for (let index = 0; index < entry.length; index++) {
      const replaced = convertNode(entry[index])
      if (replaced === null) {
        out.push(entry[index])
      } else {
        out.push(replaced)
        changed = true
      }
    }
    if (!changed) {
      return null
    }
    return out
  }
  if (entry !== null && typeof entry === 'object') {
    let changed = false
    const out = {}
    const keys = Object.keys(entry)
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]
      const current = entry[key]
      if (SKIP_KEYS.indexOf(key) >= 0) {
        out[key] = current
        continue
      }
      const replaced = convertNode(current)
      if (replaced === null) {
        out[key] = current
      } else {
        out[key] = replaced
        changed = true
      }
    }
    if (!changed) {
      return null
    }
    return out
  }
  return null
}

ServerEvents.recipes(event => {
  let recipesChanged = 0
  let slotsChanged = 0
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
      const replaced = convertNode(parsed)
      if (replaced === null) {
        continue
      }
      event.setJson(id, JSON.stringify(replaced))
      recipesChanged = recipesChanged + 1
      slotsChanged = slotsChanged + 1
    } catch (error) {
      problems.push(id + '：' + String(error))
    }
  }
  const summary = '[NekoJS/GTOnlyIngots] 锭原料统一为格雷锭：改动 ' + recipesChanged +
    '/' + TARGETS.length + ' 条配方；问题 ' + problems.length + ' 处。'
  console.info(summary)
  if (problems.length > 0) {
    console.warn('[NekoJS/GTOnlyIngots] 未完成：' + problems.join(' | '))
  }
})
