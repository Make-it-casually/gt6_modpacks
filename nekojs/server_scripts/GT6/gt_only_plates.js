import { gt } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

// RailCraft plates and c:/forge: plate tags are replaced by GT plates.
// Each edit is written out explicitly; the comment above it shows the original tag/item.

const EDITS = [
  // railcraft:charge_coil
  //   key.b:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:charge_coil', path: 'key.b', value: gt('plate', 'iron') },

  // railcraft:charge_motor
  //   key.b:  "#c:plates/tin"  ->  GT plate
  { id: 'railcraft:charge_motor', path: 'key.b', value: gt('plate', 'tin') },

  // railcraft:charge_terminal
  //   key.b:  "#c:plates/brass"  ->  GT plate
  { id: 'railcraft:charge_terminal', path: 'key.b', value: gt('plate', 'brass') },

  // railcraft:dumping_track_kit
  //   ingredients[2]:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:dumping_track_kit', path: 'ingredients[2]', value: gt('plate', 'steel') },

  // railcraft:electric_locomotive
  //   key.b:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:electric_locomotive', path: 'key.b', value: gt('plate', 'steel') },

  // railcraft:feed_station
  //   key.c:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:feed_station', path: 'key.c', value: gt('plate', 'steel') },

  // railcraft:force_track_emitter
  //   key.a:  "#c:plates/tin"  ->  GT plate
  { id: 'railcraft:force_track_emitter', path: 'key.a', value: gt('plate', 'tin') },

  // railcraft:frame_brass_plate
  //   key.a:  "#c:plates/brass"  ->  GT plate
  { id: 'railcraft:frame_brass_plate', path: 'key.a', value: gt('plate', 'brass') },

  // railcraft:frame_bronze_plate
  //   key.a:  "#c:plates/bronze"  ->  GT plate
  { id: 'railcraft:frame_bronze_plate', path: 'key.a', value: gt('plate', 'bronze') },

  // railcraft:frame_iron_plate
  //   key.a:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:frame_iron_plate', path: 'key.a', value: gt('plate', 'iron') },

  // railcraft:frame_steel_plate
  //   key.a:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:frame_steel_plate', path: 'key.a', value: gt('plate', 'steel') },

  // railcraft:high_pressure_steam_boiler_tank
  //   key.a:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:high_pressure_steam_boiler_tank', path: 'key.a', value: gt('plate', 'steel') },

  // railcraft:iron_tank_gauge
  //   key.b:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:iron_tank_gauge', path: 'key.b', value: gt('plate', 'iron') },

  // railcraft:iron_tank_valve
  //   key.b:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:iron_tank_valve', path: 'key.b', value: gt('plate', 'iron') },

  // railcraft:iron_tank_wall
  //   key.a:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:iron_tank_wall', path: 'key.a', value: gt('plate', 'iron') },

  // railcraft:low_pressure_steam_boiler_tank
  //   key.a:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:low_pressure_steam_boiler_tank', path: 'key.a', value: gt('plate', 'iron') },

  // railcraft:rolling/brass_electrode
  //   key.a:  "#c:plates/brass"  ->  GT plate
  { id: 'railcraft:rolling/brass_electrode', path: 'key.a', value: gt('plate', 'brass') },

  // railcraft:rolling/bronze_electrode
  //   key.a:  "#c:plates/bronze"  ->  GT plate
  { id: 'railcraft:rolling/bronze_electrode', path: 'key.a', value: gt('plate', 'bronze') },

  // railcraft:rolling/bushing_gear_brass
  //   key.a:  "#c:plates/brass"  ->  GT plate
  { id: 'railcraft:rolling/bushing_gear_brass', path: 'key.a', value: gt('plate', 'brass') },

  // railcraft:rolling/bushing_gear_bronze
  //   key.a:  "#c:plates/bronze"  ->  GT plate
  { id: 'railcraft:rolling/bushing_gear_bronze', path: 'key.a', value: gt('plate', 'bronze') },

  // railcraft:rolling/copper_electrode
  //   key.a:  "#c:plates/copper"  ->  GT plate
  { id: 'railcraft:rolling/copper_electrode', path: 'key.a', value: gt('plate', 'copper') },

  // railcraft:rolling/gold_electrode
  //   key.a:  "#c:plates/gold"  ->  GT plate
  { id: 'railcraft:rolling/gold_electrode', path: 'key.a', value: gt('plate', 'gold') },

  // railcraft:rolling/iron_electrode
  //   key.a:  "#c:plates/iron"  ->  GT plate
  { id: 'railcraft:rolling/iron_electrode', path: 'key.a', value: gt('plate', 'iron') },

  // railcraft:rolling/lead_electrode
  //   key.a:  "#c:plates/lead"  ->  GT plate
  { id: 'railcraft:rolling/lead_electrode', path: 'key.a', value: gt('plate', 'lead') },

  // railcraft:rolling/nickel_electrode
  //   key.a:  "#c:plates/nickel"  ->  GT plate
  { id: 'railcraft:rolling/nickel_electrode', path: 'key.a', value: gt('plate', 'nickel') },

  // railcraft:rolling/nickel_turbine_blade
  //   key.a:  "#c:plates/nickel"  ->  GT plate
  { id: 'railcraft:rolling/nickel_turbine_blade', path: 'key.a', value: gt('plate', 'nickel') },

  // railcraft:rolling/silver_electrode
  //   key.a:  "#c:plates/silver"  ->  GT plate
  { id: 'railcraft:rolling/silver_electrode', path: 'key.a', value: gt('plate', 'silver') },

  // railcraft:rolling/steel_electrode
  //   key.a:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:rolling/steel_electrode', path: 'key.a', value: gt('plate', 'steel') },

  // railcraft:rolling/steel_turbine_blade
  //   key.a:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:rolling/steel_turbine_blade', path: 'key.a', value: gt('plate', 'steel') },

  // railcraft:rolling/tin_electrode
  //   key.a:  "#c:plates/tin"  ->  GT plate
  { id: 'railcraft:rolling/tin_electrode', path: 'key.a', value: gt('plate', 'tin') },

  // railcraft:rolling/zinc_electrode
  //   key.a:  "#c:plates/zinc"  ->  GT plate
  { id: 'railcraft:rolling/zinc_electrode', path: 'key.a', value: gt('plate', 'zinc') },

  // railcraft:steam_oven
  //   key.a:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:steam_oven', path: 'key.a', value: gt('plate', 'steel') },

  // railcraft:steam_turbine
  //   key.b:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:steam_turbine', path: 'key.b', value: gt('plate', 'steel') },

  // railcraft:steel_tank_gauge
  //   key.b:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:steel_tank_gauge', path: 'key.b', value: gt('plate', 'steel') },

  // railcraft:steel_tank_valve
  //   key.b:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:steel_tank_valve', path: 'key.b', value: gt('plate', 'steel') },

  // railcraft:steel_tank_wall
  //   key.a:  "#c:plates/steel"  ->  GT plate
  { id: 'railcraft:steel_tank_wall', path: 'key.a', value: gt('plate', 'steel') },
  // ---- invar (added in round 1b) ----
  // railcraft:fluid_fueled_firebox  [invar fix]
  //   key.a:  "#c:plates/invar"  ->  GT invar plate
  { id: 'railcraft:fluid_fueled_firebox', path: 'key.a', value: gt('plate', 'invar') },

  // railcraft:high_pressure_steam_boiler_tank  [invar fix]
  //   key.b:  "#c:plates/invar"  ->  GT invar plate
  { id: 'railcraft:high_pressure_steam_boiler_tank', path: 'key.b', value: gt('plate', 'invar') },

  // railcraft:low_pressure_steam_boiler_tank  [invar fix]
  //   key.b:  "#c:plates/invar"  ->  GT invar plate
  { id: 'railcraft:low_pressure_steam_boiler_tank', path: 'key.b', value: gt('plate', 'invar') },

  // railcraft:rolling/invar_electrode  [invar fix]
  //   key.a:  "#c:plates/invar"  ->  GT invar plate
  { id: 'railcraft:rolling/invar_electrode', path: 'key.a', value: gt('plate', 'invar') },

]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'GTOnlyPlates', edits: EDITS })
})
