import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'

const REGISTRATION_KEY = 'gt6InertArkeniumCrusherRegisteredV1'

ServerEvents.recipes(() => {
  if (global[REGISTRATION_KEY] === true) {
    return
  }
  global[REGISTRATION_KEY] = true

  try {
    addItemRecipe($RM.Crusher, {
      itemInputs: [item('aether_ii:holystone', 1)],
      itemOutputs: [item('gt6m:inert_arkenium_dust', 1)],
      chances: [1000],
      duration: 200,
      eut: 16
    })
  } catch (error) {
    console.warn('[NekoJS/GT6] 粉碎机配方注册失败：' + String(error))
  }
})
