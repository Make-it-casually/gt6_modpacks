import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const DURATION = 200
const EUT = 32
const REMOVE_ID = 'thaumaturge:arcane_workbench/mind_clockwork'
const OUTPUT_ID = 'thaumaturge:mind_clockwork'

const BRASS_PLATE_MATERIAL = 8620

ServerEvents.recipes(event => {
  try {
    event.get(REMOVE_ID).remove()
  } catch (error) {
  }
})

ServerEvents.started(() => {
  const map = $RM.Welder
  if (map == null) {
    return
  }

  let brassPlate = null
  try {
    const material = $OreDictMaterial.get(BRASS_PLATE_MATERIAL)
    if (material == null) {
    } else {
      brassPlate = $OreDictManager.INSTANCE.getStack($OP.plate, material, 1)
      if (brassPlate == null || brassPlate.isEmpty()) {
        brassPlate = null
      }
    }
  } catch (error) {
  }

  let added = 0
  if (brassPlate != null) {
    try {
      addItemRecipe('Welder', {
        itemInputs: [
          brassPlate,
          item('minecraft:glass_pane', 2),
          item('thaumaturge:mechanism_simple', 1),
          item('minecraft:comparator', 1)
        ],
        itemOutputs: [item(OUTPUT_ID, 1)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
    }
  }

})
