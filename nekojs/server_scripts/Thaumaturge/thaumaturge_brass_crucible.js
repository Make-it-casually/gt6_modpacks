import { gtIngredient } from '../src/lib/gt6_materials.js'

const RECIPE_ID = 'thaumaturge:crucible/ingot_brass'
const BRASS_INGOT_MATERIAL = 8620

ServerEvents.recipes(event => {
  const problems = []
  try {
    const text = event.getJson(RECIPE_ID)
    if (text == null) {
      console.warn('[NekoJS/ThaumaturgeBrass] 取不到配方 ' + RECIPE_ID + '，未做改动。')
      return
    }
    const recipe = JSON.parse(text)
    const before = JSON.stringify(recipe.catalyst)

    recipe.catalyst = gtIngredient('gregtech:gt.meta.ingot', BRASS_INGOT_MATERIAL)

    event.setJson(RECIPE_ID, JSON.stringify(recipe))
  } catch (error) {
    problems.push(RECIPE_ID + '：' + String(error))
  }

  console.info('[NekoJS/ThaumaturgeBrass] 炼金黄铜改为在坩埚中用格雷黄铜锭制作：改动 ' + (problems.length === 0 ? 1 : 0) + '/1 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeBrass] 未完成：' + problems.join(' | '))
  }
})
