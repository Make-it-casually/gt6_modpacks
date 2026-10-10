import { gtIngredient } from '../src/lib/gt6_materials.js'

const TARGETS = [
  'thirstwastaken2:advanced_drinking_upgrade',
  'thirstwastaken2:brick_firebox',
  'thirstwastaken2:clay_bowl',
  'thirstwastaken2:cooking_pot_purify_water_bottle',
  'thirstwastaken2:cooking_pot_purify_water_bowl',
  'thirstwastaken2:cooling_tub',
  'thirstwastaken2:copper_canteen',
  'thirstwastaken2:copper_distiller',
  'thirstwastaken2:copper_hanging_pot',
  'thirstwastaken2:copper_pipe',
  'thirstwastaken2:distiller_boiler',
  'thirstwastaken2:drinking_upgrade',
  'thirstwastaken2:drinking_upgrade_from_storage_upgrade_base',
  'thirstwastaken2:iron_flask',
  'thirstwastaken2:iron_hanging_pot',
  'thirstwastaken2:purify_water_bottle_0_smelting',
  'thirstwastaken2:purify_water_bottle_0_smoking',
  'thirstwastaken2:purify_water_bottle_1_smelting',
  'thirstwastaken2:purify_water_bottle_1_smoking',
  'thirstwastaken2:purify_water_bowl_0_smelting',
  'thirstwastaken2:purify_water_bowl_0_smoking',
  'thirstwastaken2:purify_water_bowl_1_smelting',
  'thirstwastaken2:purify_water_bowl_1_smoking',
  'thirstwastaken2:purify_water_bucket_0_smelting',
  'thirstwastaken2:purify_water_bucket_0_smoking',
  'thirstwastaken2:purify_water_bucket_1_smelting',
  'thirstwastaken2:purify_water_bucket_1_smoking',
  'thirstwastaken2:purify_water_copper_canteen_0_smelting',
  'thirstwastaken2:purify_water_copper_canteen_1_smelting',
  'thirstwastaken2:purify_water_iron_flask_0_smelting',
  'thirstwastaken2:purify_water_iron_flask_1_smelting',
  'thirstwastaken2:terracotta_bowl_from_smelting',
  'thirstwastaken2:terracotta_water_bowl',
  'thirstwastaken2:waterskin',
]

const PLATE_INGOTS = [
  { from: '#c:ingots/gold', material: 790 },
  { from: '#c:ingots/iron', material: 260 },
  { from: '#c:ingots/copper', material: 290 },
  { from: '#c:ingots/tin', material: 500 },
  { from: '#c:ingots/lead', material: 820 },
  { from: '#c:ingots/silver', material: 470 },
  { from: '#c:ingots/nickel', material: 280 },
  { from: '#c:ingots/zinc', material: 300 },
  { from: '#c:ingots/brass', material: 8620 },
  { from: '#c:ingots/bronze', material: 8610 },
  { from: '#c:ingots/steel', material: 8630 },
  { from: '#c:ingots/thaumium', material: 8679 },
  { from: '#c:ingots/void_metal', material: 8681 }
]

const SKIP_KEYS = ['type', 'result', 'output', 'outputs', 'neoforge:conditions']

function convertNode(node) {
  if (typeof node === 'string') {
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
        return gtIngredient('gregtech:gt.meta.plate', subtype)
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
      if (!event.exists(id)) continue
      const text = event.getJson(id)
      if (text == null) continue
      const parsed = JSON.parse(text)
      const rebuilt = JSON.stringify(convertNode(parsed))
      if (rebuilt === JSON.stringify(parsed)) continue
      event.setJson(id, rebuilt)
      changed = changed + 1
    } catch (error) {
      problems.push(id + '：' + String(error))
    }
  }
  console.info('[NekoJS/ThirstPlate] 饮水模组配方锭改板：改动 ' + changed + '/' + TARGETS.length + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThirstPlate] 未完成：' + problems.join(' | '))
  }
})
