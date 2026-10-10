const REMOVE_IDS = [
  'thaumaturge:plate_iron',
  'thaumaturge:plate_thaumium',
  'thaumaturge:plate_void'
]

ServerEvents.recipes(event => {
  const failed = []
  let removed = 0
  for (let removeIndex = 0; removeIndex < REMOVE_IDS.length; removeIndex++) {
    const recipeId = REMOVE_IDS[removeIndex]
    try {
      event.get(recipeId).remove()
      removed = removed + 1
    } catch (error) {
      failed.push(recipeId)
    }
  }
  console.info('[NekoJS/ThaumaturgePlate] 删除三张板的工作台合成配方：' + removed + '/' + REMOVE_IDS.length + ' 条。')
  if (failed.length > 0) {
    console.warn('[NekoJS/ThaumaturgePlate] 未完成（可能已不存在）：' + failed.join(' | '))
  }
})
