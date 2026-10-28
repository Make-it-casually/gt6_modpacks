import { gt } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

// Recipes whose ingredients referenced c:/forge: tags that this pack empties.
// The tag is replaced by the matching GT6 material item so the recipe stays craftable.
// Recipes using materials GT6 has no equivalent for are still removed.

const EDITS = [
  // ae2:network/wireless_booster
  //   key.c:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'ae2:network/wireless_booster', path: 'key.c', value: gt('dust', 'enderpearl') },
  // ae2:transform/entangled_singularity
  //   ingredients[1]:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'ae2:transform/entangled_singularity', path: 'ingredients[1]', value: gt('dust', 'enderpearl') },
  // enderio:alloy_smelting/black_dye
  //   inputs[0].ingredient:  "#c:dusts/coal"  ->  GT coal dust
  { id: 'enderio:alloy_smelting/black_dye', path: 'inputs[0].ingredient', value: gt('dust', 'coal') },
  // enderio:alloy_smelting/black_dye_double
  //   inputs[0].ingredient:  "#c:dusts/coal"  ->  GT coal dust
  { id: 'enderio:alloy_smelting/black_dye_double', path: 'inputs[0].ingredient', value: gt('dust', 'coal') },
  // enderio:alloy_smelting/dark_steel_ingot
  //   inputs[1].ingredient:  "#c:dusts/coal"  ->  GT coal dust
  { id: 'enderio:alloy_smelting/dark_steel_ingot', path: 'inputs[1].ingredient', value: gt('dust', 'coal') },
  // enderio:alloy_smelting/ender_pearl
  //   inputs[0].ingredient:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'enderio:alloy_smelting/ender_pearl', path: 'inputs[0].ingredient', value: gt('dust', 'enderpearl') },
  // enderio:alloy_smelting/industrial_insulation
  //   inputs[0].ingredient:  "#c:dusts/lapis"  ->  GT lapis dust
  { id: 'enderio:alloy_smelting/industrial_insulation', path: 'inputs[0].ingredient', value: gt('dust', 'lapis') },
  // enderio:big_item_filter
  //   key.D:  "#c:dusts/obsidian"  ->  GT obsidian dust
  { id: 'enderio:big_item_filter', path: 'key.D', value: gt('dust', 'obsidian') },
  // enderio:hardened_conduit_facade
  //   key.O:  "#c:dusts/obsidian"  ->  GT obsidian dust
  { id: 'enderio:hardened_conduit_facade', path: 'key.O', value: gt('dust', 'obsidian') },
  // enderio:photovoltaic_composite
  //   ingredients[0]:  "#c:dusts/lapis"  ->  GT lapis dust
  { id: 'enderio:photovoltaic_composite', path: 'ingredients[0]', value: gt('dust', 'lapis') },
  //   ingredients[1]:  "#c:dusts/coal"  ->  GT coal dust
  { id: 'enderio:photovoltaic_composite', path: 'ingredients[1]', value: gt('dust', 'coal') },
  // enderio:sag_milling/lead
  //   input:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'enderio:sag_milling/lead', path: 'input', value: gt('ingot', 'lead') },
  // enderio:sag_milling/tin
  //   input:  "#c:ingots/tin"  ->  GT tin ingot
  { id: 'enderio:sag_milling/tin', path: 'input', value: gt('ingot', 'tin') },
  // enderio:transparent_hardened_conduit_facade
  //   key.O:  "#c:dusts/obsidian"  ->  GT obsidian dust
  { id: 'enderio:transparent_hardened_conduit_facade', path: 'key.O', value: gt('dust', 'obsidian') },
  // extendedae:entro_seed
  //   ingredients[1]:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'extendedae:entro_seed', path: 'ingredients[1]', value: gt('dust', 'enderpearl') },
  //   ingredients[2]:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'extendedae:entro_seed', path: 'ingredients[2]', value: gt('dust', 'enderpearl') },
  //   ingredients[3]:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'extendedae:entro_seed', path: 'ingredients[3]', value: gt('dust', 'enderpearl') },
  // extendedae:fixer/entro_half
  //   fuel.ingredient:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'extendedae:fixer/entro_half', path: 'fuel.ingredient', value: gt('dust', 'enderpearl') },
  // extendedae:fixer/entro_hardly
  //   fuel.ingredient:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'extendedae:fixer/entro_hardly', path: 'fuel.ingredient', value: gt('dust', 'enderpearl') },
  // extendedae:fixer/entro_mostly
  //   fuel.ingredient:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'extendedae:fixer/entro_mostly', path: 'fuel.ingredient', value: gt('dust', 'enderpearl') },
  // mmcr:radioactive_chemical_input_hatch
  //   key.A:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'mmcr:radioactive_chemical_input_hatch', path: 'key.A', value: gt('ingot', 'lead') },
  // mmcr:radioactive_chemical_output_hatch
  //   key.A:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'mmcr:radioactive_chemical_output_hatch', path: 'key.A', value: gt('ingot', 'lead') },
  // railcraft:advanced_detector
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:advanced_detector', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:advanced_item_loader
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:advanced_item_loader', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:advanced_item_unloader
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:advanced_item_unloader', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:brass_ingot_crafted_with_ingots
  //   key.a:  "#c:ingots/zinc"  ->  GT zinc ingot
  { id: 'railcraft:brass_ingot_crafted_with_ingots', path: 'key.a', value: gt('ingot', 'zinc') },
  // railcraft:bronze_gear
  //   key.a:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:bronze_gear', path: 'key.a', value: gt('ingot', 'bronze') },
  // railcraft:bronze_ingot_crafted_with_ingots
  //   key.a:  "#c:ingots/tin"  ->  GT tin ingot
  { id: 'railcraft:bronze_ingot_crafted_with_ingots', path: 'key.a', value: gt('ingot', 'tin') },
  // railcraft:bronze_tunnel_bore_head
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:bronze_tunnel_bore_head', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:bushing_gear_bronze
  //   key.a:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:bushing_gear_bronze', path: 'key.a', value: gt('ingot', 'bronze') },
  // railcraft:charge_motor
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:charge_motor', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:crusher/crushing_tags_ingots_bronze
  //   ingredient:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:crusher/crushing_tags_ingots_bronze', path: 'ingredient', value: gt('ingot', 'bronze') },
  // railcraft:crusher/crushing_tags_ingots_lead
  //   ingredient:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'railcraft:crusher/crushing_tags_ingots_lead', path: 'ingredient', value: gt('ingot', 'lead') },
  // railcraft:crusher/crushing_tags_ingots_nickel
  //   ingredient:  "#c:ingots/nickel"  ->  GT nickel ingot
  { id: 'railcraft:crusher/crushing_tags_ingots_nickel', path: 'ingredient', value: gt('ingot', 'nickel') },
  // railcraft:crusher/crushing_tags_ingots_silver
  //   ingredient:  "#c:ingots/silver"  ->  GT silver ingot
  { id: 'railcraft:crusher/crushing_tags_ingots_silver', path: 'ingredient', value: gt('ingot', 'silver') },
  // railcraft:crusher/crushing_tags_ingots_steel
  //   ingredient:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:crusher/crushing_tags_ingots_steel', path: 'ingredient', value: gt('ingot', 'steel') },
  // railcraft:crusher/crushing_tags_ingots_tin
  //   ingredient:  "#c:ingots/tin"  ->  GT tin ingot
  { id: 'railcraft:crusher/crushing_tags_ingots_tin', path: 'ingredient', value: gt('ingot', 'tin') },
  // railcraft:diamond_tunnel_bore_head
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:diamond_tunnel_bore_head', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:energy_minecart
  //   key.a:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'railcraft:energy_minecart', path: 'key.a', value: gt('ingot', 'lead') },
  // railcraft:force_track_emitter
  //   key.b:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'railcraft:force_track_emitter', path: 'key.b', value: gt('dust', 'enderpearl') },
  // railcraft:goggles
  //   key.c:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:goggles', path: 'key.c', value: gt('ingot', 'steel') },
  // railcraft:invar_gear
  //   key.a:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:invar_gear', path: 'key.a', value: gt('ingot', 'invar') },
  // railcraft:invar_ingot_crafted_with_ingots
  //   key.a:  "#c:ingots/nickel"  ->  GT nickel ingot
  { id: 'railcraft:invar_ingot_crafted_with_ingots', path: 'key.a', value: gt('ingot', 'nickel') },
  // railcraft:iron_tunnel_bore_head
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:iron_tunnel_bore_head', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:lead_gear
  //   key.a:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'railcraft:lead_gear', path: 'key.a', value: gt('ingot', 'lead') },
  // railcraft:nickel_gear
  //   key.a:  "#c:ingots/nickel"  ->  GT nickel ingot
  { id: 'railcraft:nickel_gear', path: 'key.a', value: gt('ingot', 'nickel') },
  // railcraft:rolling/bronze_plate
  //   key.a:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:rolling/bronze_plate', path: 'key.a', value: gt('ingot', 'bronze') },
  // railcraft:rolling/bronze_rail
  //   key.a:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:rolling/bronze_rail', path: 'key.a', value: gt('ingot', 'bronze') },
  //   key.b:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:rolling/bronze_rail', path: 'key.b', value: gt('ingot', 'bronze') },
  // railcraft:rolling/electric_rail
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/electric_rail', path: 'key.a', value: gt('ingot', 'steel') },
  //   key.c:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/electric_rail', path: 'key.c', value: gt('ingot', 'steel') },
  // railcraft:rolling/invar_plate
  //   key.a:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:rolling/invar_plate', path: 'key.a', value: gt('ingot', 'invar') },
  // railcraft:rolling/invar_rail
  //   key.a:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:rolling/invar_rail', path: 'key.a', value: gt('ingot', 'invar') },
  //   key.b:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:rolling/invar_rail', path: 'key.b', value: gt('ingot', 'invar') },
  // railcraft:rolling/invar_reinforced_rail
  //   key.a:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:rolling/invar_reinforced_rail', path: 'key.a', value: gt('ingot', 'invar') },
  //   key.b:  "#c:dusts/obsidian"  ->  GT obsidian dust
  { id: 'railcraft:rolling/invar_reinforced_rail', path: 'key.b', value: gt('dust', 'obsidian') },
  //   key.c:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:rolling/invar_reinforced_rail', path: 'key.c', value: gt('ingot', 'invar') },
  // railcraft:rolling/lead_plate
  //   key.a:  "#c:ingots/lead"  ->  GT lead ingot
  { id: 'railcraft:rolling/lead_plate', path: 'key.a', value: gt('ingot', 'lead') },
  // railcraft:rolling/nickel_plate
  //   key.a:  "#c:ingots/nickel"  ->  GT nickel ingot
  { id: 'railcraft:rolling/nickel_plate', path: 'key.a', value: gt('ingot', 'nickel') },
  // railcraft:rolling/rebar_bronze
  //   key.a:  "#c:ingots/bronze"  ->  GT bronze ingot
  { id: 'railcraft:rolling/rebar_bronze', path: 'key.a', value: gt('ingot', 'bronze') },
  // railcraft:rolling/rebar_invar
  //   key.a:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:rolling/rebar_invar', path: 'key.a', value: gt('ingot', 'invar') },
  // railcraft:rolling/rebar_steel
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/rebar_steel', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:rolling/silver_plate
  //   key.a:  "#c:ingots/silver"  ->  GT silver ingot
  { id: 'railcraft:rolling/silver_plate', path: 'key.a', value: gt('ingot', 'silver') },
  // railcraft:rolling/standard_high_speed_rail
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/standard_high_speed_rail', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:rolling/steel_plate
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/steel_plate', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:rolling/steel_rail
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/steel_rail', path: 'key.a', value: gt('ingot', 'steel') },
  //   key.b:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/steel_rail', path: 'key.b', value: gt('ingot', 'steel') },
  // railcraft:rolling/steel_reinforced_rail
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/steel_reinforced_rail', path: 'key.a', value: gt('ingot', 'steel') },
  //   key.b:  "#c:dusts/obsidian"  ->  GT obsidian dust
  { id: 'railcraft:rolling/steel_reinforced_rail', path: 'key.b', value: gt('dust', 'obsidian') },
  //   key.c:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:rolling/steel_reinforced_rail', path: 'key.c', value: gt('ingot', 'steel') },
  // railcraft:rolling/tin_plate
  //   key.a:  "#c:ingots/tin"  ->  GT tin ingot
  { id: 'railcraft:rolling/tin_plate', path: 'key.a', value: gt('ingot', 'tin') },
  // railcraft:rolling/zinc_plate
  //   key.a:  "#c:ingots/zinc"  ->  GT zinc ingot
  { id: 'railcraft:rolling/zinc_plate', path: 'key.a', value: gt('ingot', 'zinc') },
  // railcraft:silver_gear
  //   key.a:  "#c:ingots/silver"  ->  GT silver ingot
  { id: 'railcraft:silver_gear', path: 'key.a', value: gt('ingot', 'silver') },
  // railcraft:steel_anvil
  //   key.b:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_anvil', path: 'key.b', value: gt('ingot', 'steel') },
  // railcraft:steel_axe
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_axe', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_boots
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_boots', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_chestplate
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_chestplate', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_crowbar
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_crowbar', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_gear
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_gear', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_helmet
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_helmet', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_hoe
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_hoe', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_leggings
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_leggings', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_pickaxe
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_pickaxe', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_shears
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_shears', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_shovel
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_shovel', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_spike_maul
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_spike_maul', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_sword
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_sword', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:steel_tunnel_bore_head
  //   key.a:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:steel_tunnel_bore_head', path: 'key.a', value: gt('ingot', 'steel') },
  // railcraft:strengthened_glass_invar
  //   key.b:  "#c:ingots/invar"  ->  GT invar ingot
  { id: 'railcraft:strengthened_glass_invar', path: 'key.b', value: gt('ingot', 'invar') },
  // railcraft:strengthened_glass_nickel
  //   key.b:  "#c:ingots/nickel"  ->  GT nickel ingot
  { id: 'railcraft:strengthened_glass_nickel', path: 'key.b', value: gt('ingot', 'nickel') },
  // railcraft:strengthened_glass_tin
  //   key.b:  "#c:ingots/tin"  ->  GT tin ingot
  { id: 'railcraft:strengthened_glass_tin', path: 'key.b', value: gt('ingot', 'tin') },
  // railcraft:tin_gear
  //   key.a:  "#c:ingots/tin"  ->  GT tin ingot
  { id: 'railcraft:tin_gear', path: 'key.a', value: gt('ingot', 'tin') },
  // railcraft:turbine_disk
  //   key.b:  "#c:ingots/steel"  ->  GT steel ingot
  { id: 'railcraft:turbine_disk', path: 'key.b', value: gt('ingot', 'steel') },
  // railcraft:void_dust
  //   ingredients[0]:  "#c:dusts/coal"  ->  GT coal dust
  { id: 'railcraft:void_dust', path: 'ingredients[0]', value: gt('dust', 'coal') },
  //   ingredients[1]:  "#c:dusts/ender_pearl"  ->  GT enderpearl dust
  { id: 'railcraft:void_dust', path: 'ingredients[1]', value: gt('dust', 'enderpearl') },
  //   ingredients[2]:  "#c:dusts/obsidian"  ->  GT obsidian dust
  { id: 'railcraft:void_dust', path: 'ingredients[2]', value: gt('dust', 'obsidian') },
  // railcraft:zinc_gear
  //   key.a:  "#c:ingots/zinc"  ->  GT zinc ingot
  { id: 'railcraft:zinc_gear', path: 'key.a', value: gt('ingot', 'zinc') },
  //   ingredient:  "#c:ingots/lead"  ->  GT lead ingot
  //   ingredient:  "#c:ingots/nickel"  ->  GT nickel ingot
  //   ingredient:  "#c:ingots/silver"  ->  GT silver ingot
  //   ingredient:  "#c:ingots/tin"  ->  GT tin ingot
  //   ingredient:  "#c:ingots/zinc"  ->  GT zinc ingot
]

const REMOVE = [
  // no GT equivalent: #c:ingots/soularium, #c:dusts/quartz
  'enderio:soul_chain',
  // no GT equivalent: #c:ingots/infused_entro
  'extendedae:assembler_matrix_glass',
  // no GT equivalent: #c:ingots/infused_entro
  'extendedae:assembler_matrix_wall',
  // no GT equivalent: #c:ingots
  'extendedae:drive_upgrade',
  // no GT equivalent: #c:ingots
  'extendedae:ex_bus_upgrade_in',
  // no GT equivalent: #c:ingots
  'extendedae:ex_bus_upgrade_out',
  // no GT equivalent: #c:ingots
  'extendedae:ex_pattern_access_terminal_upgrade',
  // no GT equivalent: #c:ingots
  'extendedae:interface_upgrade',
  // no GT equivalent: #c:ingots/infused_entro
  'extendedae:machine_frame_mirror',
  // no GT equivalent: #c:ingots/infused_entro
  'extendedae:machine_frame_normal',
  // no GT equivalent: #c:ingots
  'extendedae:pattern_provider_upgrade',
  // no GT equivalent: #c:dusts/quartz
  'extendedae:quartz_blend_alt',
  // no GT equivalent: #c:ingots
  'extendedae:wireless_connector_upgrade',
  // no GT equivalent: #c:ingots
  // no GT equivalent: #c:ingots/demonite
  // no GT equivalent: #c:ingots/uraninite
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'EmptyTagGTRewrite', remove: REMOVE, edits: EDITS })
})
