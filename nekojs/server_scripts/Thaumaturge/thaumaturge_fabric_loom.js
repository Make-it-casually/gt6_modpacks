import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'

const DURATION = 100
const EUT = 16
const REMOVE_ID = 'thaumaturge:arcane_workbench/fabric'
const OUTPUT_ID = 'thaumaturge:fabric'

const WOOLS = [
  'minecraft:white_wool',
  'minecraft:orange_wool',
  'minecraft:magenta_wool',
  'minecraft:light_blue_wool',
  'minecraft:yellow_wool',
  'minecraft:lime_wool',
  'minecraft:pink_wool',
  'minecraft:gray_wool',
  'minecraft:light_gray_wool',
  'minecraft:cyan_wool',
  'minecraft:purple_wool',
  'minecraft:blue_wool',
  'minecraft:brown_wool',
  'minecraft:green_wool',
  'minecraft:red_wool',
  'minecraft:black_wool'
]

ServerEvents.recipes(event => {
  try {
    event.get(REMOVE_ID).remove()
  } catch (error) {
    console.warn('[NekoJS/ThaumaturgeFabric] 删除原配方失败：' + String(error))
  }
})

ServerEvents.started(() => {
  const problems = []
  const map = $RM.Loom
  if (map == null) {
    console.warn('[NekoJS/ThaumaturgeFabric] 取不到织布机映射 Loom，未做任何改动。')
    return
  }

  let added = 0
  for (let woolIndex = 0; woolIndex < WOOLS.length; woolIndex++) {
    const woolId = WOOLS[woolIndex]
    try {
      addItemRecipe('Loom', {
        itemInputs: [
          item(woolId, 1),
          item('minecraft:string', 4),
          item('thaumaturge:salis_mundus', 1)
        ],
        itemOutputs: [item(OUTPUT_ID, 1)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
      problems.push(woolId + '：' + String(error))
    }
  }

  console.info('[NekoJS/ThaumaturgeFabric] 魔力布匹改用格雷织布机：新增配方 ' + added + '/' + WOOLS.length + ' 条（羊毛 ×1 + 线 ×4 + 世界盐 ×1）；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeFabric] 未完成：' + problems.join(' | '))
  }
})
