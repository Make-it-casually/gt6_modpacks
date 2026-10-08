import { gt } from '../src/lib/gt6_materials.js'

const TARGETS = `railcraft:charge_coil
railcraft:charge_motor
railcraft:charge_terminal
railcraft:dumping_track_kit
railcraft:electric_locomotive
railcraft:feed_station
railcraft:fluid_fueled_firebox
railcraft:force_track_emitter
railcraft:frame_brass_plate
railcraft:frame_bronze_plate
railcraft:frame_iron_plate
railcraft:frame_steel_plate
railcraft:high_pressure_steam_boiler_tank
railcraft:iron_tank_gauge
railcraft:iron_tank_valve
railcraft:iron_tank_wall
railcraft:low_pressure_steam_boiler_tank
railcraft:rolling/brass_electrode
railcraft:rolling/brass_plate
railcraft:rolling/bronze_electrode
railcraft:rolling/bronze_plate
railcraft:rolling/bushing_gear_brass
railcraft:rolling/bushing_gear_bronze
railcraft:rolling/copper_electrode
railcraft:rolling/copper_plate
railcraft:rolling/gold_electrode
railcraft:rolling/gold_plate
railcraft:rolling/invar_electrode
railcraft:rolling/invar_plate
railcraft:rolling/iron_electrode
railcraft:rolling/iron_plate
railcraft:rolling/lead_electrode
railcraft:rolling/lead_plate
railcraft:rolling/nickel_electrode
railcraft:rolling/nickel_plate
railcraft:rolling/nickel_turbine_blade
railcraft:rolling/silver_electrode
railcraft:rolling/silver_plate
railcraft:rolling/steel_electrode
railcraft:rolling/steel_plate
railcraft:rolling/steel_turbine_blade
railcraft:rolling/tin_electrode
railcraft:rolling/tin_plate
railcraft:rolling/zinc_electrode
railcraft:rolling/zinc_plate
railcraft:steam_oven
railcraft:steam_turbine
railcraft:steel_tank_gauge
railcraft:steel_tank_valve
railcraft:steel_tank_wall`.split('\n')

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
  tungsten: 'tungsten'
}

const SKIP_KEYS = ['result', 'output', 'results', 'type', 'category', 'group', 'pattern']

function materialOfPlate(text) {
  if (text.indexOf('#c:plates/') === 0 || text.indexOf('#forge:plates/') === 0 || text.indexOf('#neoforge:plates/') === 0) {
    const name = text.split('/').pop()
    const material = MATERIAL_ALIAS[name]
    if (material === undefined) {
      return null
    }
    return material
  }
  if (text.indexOf('railcraft:') === 0 && text.slice(-6) === '_plate') {
    const name = text.slice('railcraft:'.length, -6)
    const material = MATERIAL_ALIAS[name]
    if (material === undefined) {
      return null
    }
    return material
  }
  return null
}

function gtPlateConvert(entry) {
  if (typeof entry === 'string') {
    const material = materialOfPlate(entry)
    if (material === null) {
      return null
    }
    return gt('plate', material)
  }
  if (Array.isArray(entry)) {
    let changed = false
    const out = []
    for (let index = 0; index < entry.length; index++) {
      const replaced = gtPlateConvert(entry[index])
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
      const replaced = gtPlateConvert(current)
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
  let changed = 0
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
      const replaced = gtPlateConvert(parsed)
      if (replaced === null) {
        continue
      }
      event.setJson(id, JSON.stringify(replaced))
      changed = changed + 1
    } catch (error) {
      problems.push(id + '：' + String(error))
    }
  }
  const summary = '[NekoJS/GTOnlyPlates] 板原料统一为格雷板：改动 ' + changed + '/' + TARGETS.length
    + ' 条；问题 ' + problems.length + ' 处。'
  if (problems.length > 0) {
    console.warn('[NekoJS/GTOnlyPlates] 未完成：' + problems.join(' | '))
  }
})
