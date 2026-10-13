import { gtIngredient } from '../src/lib/gt6_materials.js'

const RECIPE_ID = 'thaumaturge:crucible/ingot_brass'
const BRASS_INGOT_MATERIAL = 8620

ServerEvents.recipes(event => {
  try {
    const text = event.getJson(RECIPE_ID)
    if (text == null) {
      return
    }
    const recipe = JSON.parse(text)
    const before = JSON.stringify(recipe.catalyst)

    recipe.catalyst = gtIngredient('gregtech:gt.meta.ingot', BRASS_INGOT_MATERIAL)

    event.setJson(RECIPE_ID, JSON.stringify(recipe))
  } catch (error) {
  }

})
