import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'

const mapCounter = {}
let registered = 0

function addSafely(map, spec) {
  const mapName = map.mNameInternal
  mapCounter[mapName] = (mapCounter[mapName] === undefined ? 1 : mapCounter[mapName] + 1)
  const label = `${mapName}#${mapCounter[mapName]}`
  try {
    const result = addItemRecipe(map, spec)
    registered = registered + 1
    return result
  } catch (addError) {
    const message = addError != null && addError.message !== undefined ? addError.message : String(addError)
    return null
  }
}

ServerEvents.recipes(() => {
  const registrationKey = 'gt6PackRecipesRegisteredV1'
  if (global[registrationKey] === true) {
    return
  }

  
  global[registrationKey] = true
})
