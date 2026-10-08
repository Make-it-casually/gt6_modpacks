import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'

const RODS = [
  'blaze',
  'bone',
  'greatwood',
  'ice',
  'obsidian',
  'quartz',
  'reed',
  'silverwood'
]

const DURATION = 200
const EUT = 32

ServerEvents.recipes(event => {
  let added = 0
  const problems = []
  let removed = 0

  for (let removeIndex = 0; removeIndex < RODS.length; removeIndex++) {
    const removeId = 'thaumaturge:wand/part/staff_rod_' + RODS[removeIndex]
    try {
      event.get(removeId).remove()
      removed = removed + 1
    } catch (error) {
      problems.push(removeId + '：删除失败 ' + String(error))
    }
  }
  for (let addIndex = 0; addIndex < RODS.length; addIndex++) {
    const rod = RODS[addIndex]
    try {
      addItemRecipe('Assembler', {
        itemInputs: [
          item('thaumaturge:wand_rod_' + rod, 2),
          item('thaumaturge:primal_charm', 1)
        ],
        itemOutputs: [item('thaumaturge:staff_rod_' + rod, 1)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
      problems.push(rod + '：' + String(error))
    }
  }

  console.info('[NekoJS/ThaumaturgeStaff] 杖芯改装：删除奥术工作台配方 ' + removed + ' 条，新增组装机配方 ' + added + '/' + RODS.length + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeStaff] 未完成：' + problems.join(' | '))
  }
})
