import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const DURATION = 200
const EUT = 32

const ENTRIES = [
  {
    id: 'mechanism_simple',
    out: 1,
    note: '格雷黄铜板 ×2 + 格雷铁板 ×2 + 木棍 ×1',
    items: [
      { vanilla: 'minecraft:stick', count: 1 }
    ],
    plates: [
      { material: 8620, count: 2 },
      { material: 260, count: 2 }
    ]
  },
  {
    id: 'mechanism_complex',
    out: 1,
    note: '简单机关 ×2 + 活塞 ×1 + 格雷神秘板 ×2',
    items: [
      { vanilla: 'thaumaturge:mechanism_simple', count: 2 },
      { vanilla: 'minecraft:piston', count: 1 }
    ],
    plates: [
      { material: 8679, count: 2 }
    ]
  },
  {
    id: 'alchemical_construct',
    out: 2,
    note: '格雷铁板 ×4 + 阀门 ×2 + 木板 ×1 + 管子 ×2',
    items: [
      { vanilla: 'thaumaturge:tube_valve', count: 2 },
      { vanilla: 'thaumaturge:plank_greatwood', count: 1 },
      { vanilla: 'thaumaturge:tube', count: 2 }
    ],
    plates: [
      { material: 260, count: 4 }
    ]
  },
  {
    id: 'advanced_alchemical_construct',
    out: 4,
    note: '炼金构装 ×4 + 原初珍珠 ×1 + 格雷虚空锭 ×4',
    items: [
      { vanilla: 'thaumaturge:alchemical_construct', count: 4 },
      { vanilla: 'thaumaturge:primordial_pearl', count: 1 }
    ],
    ingots: [
      { material: 8681, count: 4 }
    ]
  }
]

ServerEvents.recipes(event => {
  let removed = 0
  const problems = []
  for (let removeIndex = 0; removeIndex < ENTRIES.length; removeIndex++) {
    const removeId = 'thaumaturge:arcane_workbench/' + ENTRIES[removeIndex].id
    try {
      event.get(removeId).remove()
      removed = removed + 1
    } catch (error) {
      problems.push(removeId + '：删除失败 ' + String(error))
    }
  }
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeMech] 删除未完成：' + problems.join(' | '))
  }
})

ServerEvents.started(() => {
  const problems = []
  const map = $RM.Welder
  if (map == null) {
    console.warn('[NekoJS/ThaumaturgeMech] 取不到焊接机映射 Welder，未做任何改动。')
    return
  }

  const manager = $OreDictManager.INSTANCE

  function stackFor(prefix, materialId, count, label, problemList) {
    const material = $OreDictMaterial.get(materialId)
    if (material == null) {
      problemList.push(label + '：材料 ' + materialId + ' 不存在')
      return null
    }
    const stack = manager.getStack(prefix, material, count)
    if (stack == null || stack.isEmpty()) {
      problemList.push(label + '：取不到物品')
      return null
    }
    return stack
  }

  let added = 0
  for (let entryIndex = 0; entryIndex < ENTRIES.length; entryIndex++) {
    const entry = ENTRIES[entryIndex]
    try {
      const inputs = []
      let failed = false

      if (entry.items !== undefined) {
        for (let itemIndex = 0; itemIndex < entry.items.length; itemIndex++) {
          const spec = entry.items[itemIndex]
          inputs.push(item(spec.vanilla, spec.count))
        }
      }
      if (entry.plates !== undefined) {
        for (let plateIndex = 0; plateIndex < entry.plates.length; plateIndex++) {
          const spec = entry.plates[plateIndex]
          const stack = stackFor($OP.plate, spec.material, spec.count, entry.id + '/格雷板' + spec.material, problems)
          if (stack == null) {
            failed = true
          } else {
            inputs.push(stack)
          }
        }
      }
      if (entry.ingots !== undefined) {
        for (let ingotIndex = 0; ingotIndex < entry.ingots.length; ingotIndex++) {
          const spec = entry.ingots[ingotIndex]
          const stack = stackFor($OP.ingot, spec.material, spec.count, entry.id + '/格雷锭' + spec.material, problems)
          if (stack == null) {
            failed = true
          } else {
            inputs.push(stack)
          }
        }
      }

      if (failed) {
        continue
      }

      addItemRecipe('Welder', {
        itemInputs: inputs,
        itemOutputs: [item('thaumaturge:' + entry.id, entry.out)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
      problems.push(entry.id + '：' + String(error))
    }
  }

  console.info('[NekoJS/ThaumaturgeMech] 机构/构装改用格雷焊接机：新增配方 ' + added + '/' + ENTRIES.length + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeMech] 未完成：' + problems.join(' | '))
  }
})
