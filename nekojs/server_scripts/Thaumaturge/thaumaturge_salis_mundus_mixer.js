import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $TTAspects } from 'java:com/leclowndu93150/thaumaturge/api/aspect/TTAspects'
import { $EssentiaCrystalFactory } from 'java:com/leclowndu93150/thaumaturge/content/taint/item/EssentiaCrystalFactory'

const RECIPE_ID = 'thaumaturge:salis_mundus'
const MACHINE = 'Mixer'
const DURATION = 200
const EUT = 32
const SHARDS = 3

const ASPECT_KEYS = [
  { name: 'AER', key: $TTAspects.AER },
  { name: 'IGNIS', key: $TTAspects.IGNIS },
  { name: 'AQUA', key: $TTAspects.AQUA },
  { name: 'TERRA', key: $TTAspects.TERRA },
  { name: 'ORDO', key: $TTAspects.ORDO },
  { name: 'PERDITIO', key: $TTAspects.PERDITIO }
]

ServerEvents.recipes(event => {
  try {
    event.get(RECIPE_ID).remove()
  } catch (error) {
  }
})

ServerEvents.started(event => {
  const map = $RM[MACHINE]
  if (map == null) {
    return
  }

  let server = null
  try {
    server = event.getServer()
  } catch (error) {
    server = null
  }
  if (server == null) {
    try {
      server = Java.type('net.neoforged.neoforge.server.ServerLifecycleHooks').getCurrentServer()
    } catch (error) {
    }
  }
  if (server == null) {
    return
  }

  let provider = null
  try {
    provider = server.registryAccess()
  } catch (error) {
    return
  }

  const crystals = []
  for (let aspectIndex = 0; aspectIndex < ASPECT_KEYS.length; aspectIndex++) {
    const aspect = ASPECT_KEYS[aspectIndex]
    try {
      const stack = $EssentiaCrystalFactory.of(provider, aspect.key)
      if (stack == null || stack.isEmpty()) {
        continue
      }
      crystals.push({ name: aspect.name, stack: stack })
    } catch (error) {
    }
  }

  let added = 0
  let skipped = 0
  for (let firstIndex = 0; firstIndex < crystals.length; firstIndex++) {
    for (let secondIndex = firstIndex; secondIndex < crystals.length; secondIndex++) {
      for (let thirdIndex = secondIndex; thirdIndex < crystals.length; thirdIndex++) {
        try {
          addItemRecipe(MACHINE, {
            itemInputs: [
              item('minecraft:redstone', 1),
              crystals[firstIndex].stack,
              crystals[secondIndex].stack,
              crystals[thirdIndex].stack
            ],
            itemOutputs: [item('thaumaturge:salis_mundus', 1)],
            duration: DURATION,
            eut: EUT,
            checkForCollisions: false
          })
          added = added + 1
        } catch (error) {
          skipped = skipped + 1
        }
      }
    }
  }

})
