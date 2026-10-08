import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const DURATION = 160
const EUT = 32

const CAP_MATERIALS = [
  { cap: 'wand_cap_iron', vanillaNugget: 'minecraft:iron_nugget' },
  { cap: 'wand_cap_gold', vanillaNugget: 'minecraft:gold_nugget' },
  { cap: 'wand_cap_copper', material: 290, gtName: 'Copper' },
  { cap: 'wand_cap_silver_inert', material: 470, gtName: 'Silver' },
  { cap: 'wand_cap_thaumium_inert', material: 8679, gtName: 'Thaumium' },
  { cap: 'wand_cap_void_inert', material: 8681, gtName: 'VoidMetal' }
]

ServerEvents.recipes(event => {
  let removed = 0
  const problems = []
  for (let removeIndex = 0; removeIndex < CAP_MATERIALS.length; removeIndex++) {
    const removeId = 'thaumaturge:wand/part/' + CAP_MATERIALS[removeIndex].cap
    try {
      event.get(removeId).remove()
      removed = removed + 1
    } catch (error) {
      problems.push(removeId + '：删除失败 ' + String(error))
    }
  }
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeCap] 删除未完成：' + problems.join(' | '))
  }
})

ServerEvents.started(() => {
  const problems = []
  const map = $RM.Lathe

  const manager = $OreDictManager.INSTANCE
  let added = 0
  for (let capIndex = 0; capIndex < CAP_MATERIALS.length; capIndex++) {
    const entry = CAP_MATERIALS[capIndex]
    try {
      let nuggets
      if (entry.vanillaNugget !== undefined) {
        nuggets = item(entry.vanillaNugget, 5)
      } else {
        const material = $OreDictMaterial.get(entry.material)
        if (material == null) {
          problems.push(entry.cap + '：材料 ' + entry.material + ' 不存在')
          continue
        }
        nuggets = manager.getStack($OP.nugget, material, 5)
        if (nuggets == null || nuggets.isEmpty()) {
          problems.push(entry.cap + '：取不到格雷粒 ' + entry.gtName)
          continue
        }
      }
      addItemRecipe('Lathe', {
        itemInputs: [nuggets],
        itemOutputs: [item('thaumaturge:' + entry.cap, 1)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
      problems.push(entry.cap + '：' + String(error))
    }
  }

  console.info('[NekoJS/ThaumaturgeCap] 未完成杖端：新增车床配方 ' + added + '/' + CAP_MATERIALS.length + ' 条（充能步骤保持原样）；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeCap] 未完成：' + problems.join(' | '))
  }
})
