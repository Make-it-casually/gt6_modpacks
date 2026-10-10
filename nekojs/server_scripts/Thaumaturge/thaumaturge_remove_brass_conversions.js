const REMOVE_IDS = [
  'thaumaturge:nugget_brass',
  'thaumaturge:nugget_brass_from_nuggets',
  'thaumaturge:metal_brass',
  'thaumaturge:ingot_brass_from_block'
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
  console.info('[NekoJS/ThaumaturgeBrass2] 删除炼金黄铜的粒/块合成：' + removed + '/' + REMOVE_IDS.length + ' 条。')
  if (failed.length > 0) {
    console.warn('[NekoJS/ThaumaturgeBrass2] 未完成（可能已不存在）：' + failed.join(' | '))
  }
})
