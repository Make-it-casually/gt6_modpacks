import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'

const MACHINE = 'Extruder'
const DURATION = 60
const EUT = 16
const INPUT_ID = 'thaumaturge:ingot_brass'
const OUTPUT_ID = 'thaumaturge:plate_brass'

ServerEvents.started(() => {
  const map = $RM[MACHINE]
  if (map == null) {
    console.warn('[NekoJS/ThaumaturgeBrassPlate] 取不到挤压机映射 ' + MACHINE + '，未做任何改动。')
    return
  }

  const problems = []
  let added = 0
  try {
    addItemRecipe(MACHINE, {
      itemInputs: [item(INPUT_ID, 1)],
      itemOutputs: [item(OUTPUT_ID, 1)],
      duration: DURATION,
      eut: EUT,
      checkForCollisions: false
    })
    added = 1
  } catch (error) {
    problems.push(String(error))
  }

  console.info('[NekoJS/ThaumaturgeBrassPlate] 炼金黄铜板改用格雷挤压机：新增配方 ' + added + '/1 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeBrassPlate] 未完成：' + problems.join(' | '))
  }
})
