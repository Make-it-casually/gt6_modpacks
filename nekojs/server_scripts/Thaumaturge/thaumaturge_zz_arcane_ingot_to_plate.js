import { gtIngredient } from '../src/lib/gt6_materials.js'

const TARGETS = [
  'thaumaturge:arcane_workbench/activator_rail',
  'thaumaturge:arcane_workbench/advanced_alchemical_construct',
  'thaumaturge:arcane_workbench/alchemical_construct',
  'thaumaturge:arcane_workbench/alembic',
  'thaumaturge:arcane_workbench/arcane_door',
  'thaumaturge:arcane_workbench/arcane_ear',
  'thaumaturge:arcane_workbench/arcane_grindstone',
  'thaumaturge:arcane_workbench/arcane_key_gold',
  'thaumaturge:arcane_workbench/arcane_key_iron',
  'thaumaturge:arcane_workbench/arcane_pressure_plate',
  'thaumaturge:arcane_workbench/arcane_workbench_charger',
  'thaumaturge:arcane_workbench/bellows',
  'thaumaturge:arcane_workbench/brain_box',
  'thaumaturge:arcane_workbench/candle_holder_brass',
  'thaumaturge:arcane_workbench/candle_holder_thaumium',
  'thaumaturge:arcane_workbench/candle_holder_void',
  'thaumaturge:arcane_workbench/centrifuge',
  'thaumaturge:arcane_workbench/cloth_boots',
  'thaumaturge:arcane_workbench/cloth_chest',
  'thaumaturge:arcane_workbench/cloth_legs',
  'thaumaturge:arcane_workbench/condenser',
  'thaumaturge:arcane_workbench/condenser_lattice',
  'thaumaturge:arcane_workbench/deconstruction_table',
  'thaumaturge:arcane_workbench/dioptra',
  'thaumaturge:arcane_workbench/essentia_crystalizer',
  'thaumaturge:arcane_workbench/essentia_input',
  'thaumaturge:arcane_workbench/essentia_output',
  'thaumaturge:arcane_workbench/fabric',
  'thaumaturge:arcane_workbench/filter',
  'thaumaturge:arcane_workbench/flux_scrubber',
  'thaumaturge:arcane_workbench/focal_manipulator',
  'thaumaturge:arcane_workbench/focus_pouch',
  'thaumaturge:arcane_workbench/goggles_revealing',
  'thaumaturge:arcane_workbench/golem_bowtie',
  'thaumaturge:arcane_workbench/golem_fetter',
  'thaumaturge:arcane_workbench/golem_fez',
  'thaumaturge:arcane_workbench/golem_glasses',
  'thaumaturge:arcane_workbench/golem_top_hat',
  'thaumaturge:arcane_workbench/golem_visor',
  'thaumaturge:arcane_workbench/grapple_gun',
  'thaumaturge:arcane_workbench/grapple_gun_spool',
  'thaumaturge:arcane_workbench/grapple_gun_tip',
  'thaumaturge:arcane_workbench/hungry_chest',
  'thaumaturge:arcane_workbench/infusion_matrix',
  'thaumaturge:arcane_workbench/inlay',
  'thaumaturge:arcane_workbench/jar_normal',
  'thaumaturge:arcane_workbench/jar_void',
  'thaumaturge:arcane_workbench/lamp_arcane',
  'thaumaturge:arcane_workbench/levitator',
  'thaumaturge:arcane_workbench/matrix_cost',
  'thaumaturge:arcane_workbench/matrix_speed',
  'thaumaturge:arcane_workbench/mechanism_complex',
  'thaumaturge:arcane_workbench/mechanism_simple',
  'thaumaturge:arcane_workbench/mind_clockwork',
  'thaumaturge:arcane_workbench/mirrored_glass',
  'thaumaturge:arcane_workbench/module_aggression',
  'thaumaturge:arcane_workbench/module_vision',
  'thaumaturge:arcane_workbench/morphic_resonator',
  'thaumaturge:arcane_workbench/pattern_crafter',
  'thaumaturge:arcane_workbench/paving_stone_barrier',
  'thaumaturge:arcane_workbench/paving_stone_travel',
  'thaumaturge:arcane_workbench/pedestal_ancient',
  'thaumaturge:arcane_workbench/pedestal_arcane',
  'thaumaturge:arcane_workbench/pedestal_eldritch',
  'thaumaturge:arcane_workbench/potion_sprayer',
  'thaumaturge:arcane_workbench/recharge_pedestal',
  'thaumaturge:arcane_workbench/redstone_relay',
  'thaumaturge:arcane_workbench/resonator',
  'thaumaturge:arcane_workbench/sanity_checker',
  'thaumaturge:arcane_workbench/seal_blank',
  'thaumaturge:arcane_workbench/smelter_aux',
  'thaumaturge:arcane_workbench/smelter_basic',
  'thaumaturge:arcane_workbench/smelter_thaumium',
  'thaumaturge:arcane_workbench/smelter_vent',
  'thaumaturge:arcane_workbench/smelter_void',
  'thaumaturge:arcane_workbench/spa',
  'thaumaturge:arcane_workbench/stabilizer',
  'thaumaturge:arcane_workbench/thaumometer',
  'thaumaturge:arcane_workbench/thaumonomicon_sharing',
  'thaumaturge:arcane_workbench/tube',
  'thaumaturge:arcane_workbench/tube_buffer',
  'thaumaturge:arcane_workbench/tube_filter',
  'thaumaturge:arcane_workbench/tube_oneway',
  'thaumaturge:arcane_workbench/tube_restrict',
  'thaumaturge:arcane_workbench/tube_valve',
  'thaumaturge:arcane_workbench/turret_advanced',
  'thaumaturge:arcane_workbench/turret_basic',
  'thaumaturge:arcane_workbench/vis_battery',
  'thaumaturge:arcane_workbench/vis_generator',
  'thaumaturge:arcane_workbench/vis_resonator',
  'thaumaturge:arcane_workbench/warded_glass',
]

const PLATE_INGOTS = [
  { from: '#c:ingots/gold', material: 790 },
  { from: '#c:ingots/iron', material: 260 },
  { from: '#c:ingots/thaumium', material: 8679 },
  { from: '#c:ingots/void_metal', material: 8681 },
  { from: 'thaumaturge:ingot_thaumium', material: 8679 },
  { from: 'thaumaturge:ingot_void', material: 8681 },
]

const SIMPLE_PLATES = [
  { from: '#c:ingots/brass', to: 'thaumaturge:plate_brass' },
]

const SKIP_KEYS = ['type', 'result', 'output', 'outputs']

function convertNode(node) {
  if (typeof node === 'string') {
    for (let simpleIndex = 0; simpleIndex < SIMPLE_PLATES.length; simpleIndex++) {
      if (node === SIMPLE_PLATES[simpleIndex].from) {
        return SIMPLE_PLATES[simpleIndex].to
      }
    }
    for (let plateIndex = 0; plateIndex < PLATE_INGOTS.length; plateIndex++) {
      if (node === PLATE_INGOTS[plateIndex].from) {
        return gtIngredient('gregtech:gt.meta.plate', PLATE_INGOTS[plateIndex].material)
      }
    }
    return node
  }
  if (Array.isArray(node)) {
    const out = []
    for (let nodeIndex = 0; nodeIndex < node.length; nodeIndex++) {
      out.push(convertNode(node[nodeIndex]))
    }
    return out
  }
  if (node !== null && typeof node === 'object') {
    if (node.items === 'gregtech:gt.meta.ingot' && node.components !== undefined) {
      const subtype = node.components['gregapi:subtype']
      if (subtype !== undefined) {
        const converted = gtIngredient('gregtech:gt.meta.plate', subtype)
        return converted
      }
    }
    const out = {}
    const keys = Object.keys(node)
    for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
      const key = keys[keyIndex]
      if (SKIP_KEYS.indexOf(key) >= 0) {
        out[key] = node[key]
        continue
      }
      out[key] = convertNode(node[key])
    }
    return out
  }
  return node
}

ServerEvents.recipes(event => {
  let changed = 0
  const problems = []
  for (let targetIndex = 0; targetIndex < TARGETS.length; targetIndex++) {
    const id = TARGETS[targetIndex]
    try {
      if (!event.exists(id)) {
        continue
      }
      const text = event.getJson(id)
      if (text == null) {
        continue
      }
      const parsed = JSON.parse(text)
      const rebuilt = JSON.stringify(convertNode(parsed))
      if (rebuilt === JSON.stringify(parsed)) {
        continue
      }
      event.setJson(id, rebuilt)
      changed = changed + 1
    } catch (error) {
      problems.push(id + '：' + String(error))
    }
  }
  console.info('[NekoJS/ThaumaturgeArcane] 奥术工作台配方锭改板：改动 ' + changed + '/' + TARGETS.length + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeArcane] 未完成：' + problems.join(' | '))
  }
})
