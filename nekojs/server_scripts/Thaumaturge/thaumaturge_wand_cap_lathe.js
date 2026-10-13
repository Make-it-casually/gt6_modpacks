import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const DURATION = 160
const EUT = 32

const CAP_MATERIALS = [
  { cap: 'wand_cap_iron', vanillaNugget: 'minecraft:iron_nugget' },
  { cap: 'wand_cap_gold', vanillaNugget: 'minecraft:gold_nugget' },
  { cap: 'wand_cap_copper', material: 290, gtName: 'Copper' },
  { cap: 'wand_cap_silver_inert', material: 470, gtName: 'Silver' },
  { cap: 'wand_cap_thaumium_inert', material: 8679, gtName: 'Thaumium' },
  { cap: 'wand_cap_void_inert', material: 8681, gtName: 'VoidMetal' }
]

ServerEvents.recipes(event => {
  let removed = 0
  const missing = []
  for (let removeIndex = 0; removeIndex < CAP_MATERIALS.length; removeIndex++) {
    const removeId = 'thaumaturge:wand/part/' + CAP_MATERIALS[removeIndex].cap
    const target = event.get(removeId)
    if (target === null || target === undefined) {
      missing.push(removeId)
      continue
    }
    try {
      target.remove()
      removed = removed + 1
    } catch (error) {
    }
  }

})

ServerEvents.started(() => {
  const map = $RM.Lathe

  const manager = $OreDictManager.INSTANCE
  let added = 0
  for (let capIndex = 0; capIndex < CAP_MATERIALS.length; capIndex++) {
    const entry = CAP_MATERIALS[capIndex]
    try {
      let nuggets
      if (entry.vanillaNugget !== undefined) {
        nuggets = item(entry.vanillaNugget, 5)
      } else {
        const material = $OreDictMaterial.get(entry.material)
        if (material == null) {
          continue
        }
        nuggets = manager.getStack($OP.nugget, material, 5)
        if (nuggets == null || nuggets.isEmpty()) {
          continue
        }
      }
      addItemRecipe('Lathe', {
        itemInputs: [nuggets],
        itemOutputs: [item('thaumaturge:' + entry.cap, 1)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
    }
  }

})
