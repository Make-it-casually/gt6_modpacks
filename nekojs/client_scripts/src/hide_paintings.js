const HIDDEN = [
  'dimpaintings:end_painting'
]

RecipeViewerEvents.removeEntries('item', event => {
  let hidden = 0
  const failed = []
  for (const id of HIDDEN) {
    try {
      event.add(Item.of(id))
      hidden = hidden + 1
    } catch (stackError) {
      try {
        event.add(id)
        hidden = hidden + 1
      } catch (idError) {
        failed.push(id)
      }
    }
  }
  console.info('[NekoJS/GT6] JEI 隐藏末地绘画 ' + hidden + '/' + HIDDEN.length + ' 个' + (failed.length > 0 ? '；失败：' + failed.join(', ') : '') + '。')
})
