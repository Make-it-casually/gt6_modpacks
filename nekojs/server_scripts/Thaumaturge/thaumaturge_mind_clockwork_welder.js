import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const DURATION = 200
const EUT = 32
const REMOVE_ID = 'thaumaturge:arcane_workbench/mind_clockwork'
const OUTPUT_ID = 'thaumaturge:mind_clockwork'

const BRASS_PLATE_MATERIAL = 8620

ServerEvents.recipes(event => {
  try {
    event.get(REMOVE_ID).remove()
  } catch (error) {
    console.warn('[NekoJS/ThaumaturgeClock] 删除原配方失败：' + String(error))
  }
})

ServerEvents.started(() => {
  const problems = []
  const map = $RM.Welder
  if (map == null) {
    console.warn('[NekoJS/ThaumaturgeClock] 取不到焊接机映射 Welder，未做任何改动。')
    return
  }

  let brassPlate = null
  try {
    const material = $OreDictMaterial.get(BRASS_PLATE_MATERIAL)
    if (material == null) {
      problems.push('材料 ' + BRASS_PLATE_MATERIAL + ' 不存在')
    } else {
      brassPlate = $OreDictManager.INSTANCE.getStack($OP.plate, material, 1)
      if (brassPlate == null || brassPlate.isEmpty()) {
        problems.push('取不到格雷黄铜板')
        brassPlate = null
      }
    }
  } catch (error) {
    problems.push('解析黄铜板失败：' + String(error))
  }

  let added = 0
  if (brassPlate != null) {
    try {
      addItemRecipe('Welder', {
        itemInputs: [
          brassPlate,
          item('minecraft:glass_pane', 2),
          item('thaumaturge:mechanism_simple', 1),
          item('minecraft:comparator', 1)
        ],
        itemOutputs: [item(OUTPUT_ID, 1)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
      problems.push(OUTPUT_ID + '：' + String(error))
    }
  }

  console.info('[NekoJS/ThaumaturgeClock] 心灵发条改用激光焊接机：新增配方 ' + added + '/1 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeClock] 未完成：' + problems.join(' | '))
  }
})
