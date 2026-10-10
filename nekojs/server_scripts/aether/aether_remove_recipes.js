const REMOVE_IDS = [
  'aether_ii:gravitite_plate_from_gravitite_block',
  'aether_ii:gravitite_plate',
  'aether_ii:gravitite_plates_from_gravitite_ore',
  'aether_ii:gravitite_plates_from_undershale_gravitite_ore'
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
  console.info('[NekoJS/AetherPlate] 删除重力石板配方：' + removed + '/' + REMOVE_IDS.length + ' 条。')
  if (failed.length > 0) {
    console.warn('[NekoJS/AetherPlate] 未完成（可能已不存在）：' + failed.join(' | '))
  }
})
