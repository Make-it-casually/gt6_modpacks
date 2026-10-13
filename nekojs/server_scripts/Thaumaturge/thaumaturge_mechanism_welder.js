import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const DURATION = 200
const EUT = 32

const ENTRIES = [
  {
    id: 'mechanism_simple',
    out: 1,
    note: 'gt brass plate x2 + gt iron plate x2 + stick x1',
    items: [
      { vanilla: 'minecraft:stick', count: 1 }
    ],
    plates: [
      { material: 8620, count: 2 },
      { material: 260, count: 2 }
    ]
  },
  {
    id: 'mechanism_complex',
    out: 1,
    note: 'gt mechanism x2 + piston x1 + gt thaumium plate x2',
    items: [
      { vanilla: 'thaumaturge:mechanism_simple', count: 2 },
      { vanilla: 'minecraft:piston', count: 1 }
    ],
    plates: [
      { material: 8679, count: 2 }
    ]
  },
  {
    id: 'alchemical_construct',
    out: 2,
    note: 'gt iron plate x4 + valve x2 + plank x1 + pipe x2',
    items: [
      { vanilla: 'thaumaturge:tube_valve', count: 2 },
      { vanilla: 'thaumaturge:plank_greatwood', count: 1 },
      { vanilla: 'thaumaturge:tube', count: 2 }
    ],
    plates: [
      { material: 260, count: 4 }
    ]
  },
  {
    id: 'advanced_alchemical_construct',
    out: 4,
    note: 'gt alchemical mechanism x4 + primordial pearl x1 + gt void ingot x4',
    items: [
      { vanilla: 'thaumaturge:alchemical_construct', count: 4 },
      { vanilla: 'thaumaturge:primordial_pearl', count: 1 }
    ],
    ingots: [
      { material: 8681, count: 4 }
    ]
  }
]

ServerEvents.recipes(event => {
  let removed = 0
  for (let removeIndex = 0; removeIndex < ENTRIES.length; removeIndex++) {
    const removeId = 'thaumaturge:arcane_workbench/' + ENTRIES[removeIndex].id
    try {
      event.get(removeId).remove()
      removed = removed + 1
    } catch (error) {
    }
  }

})

ServerEvents.started(() => {
  const map = $RM.Welder
  if (map == null) {
    return
  }

  const manager = $OreDictManager.INSTANCE

  function stackFor(prefix, materialId, count, label) {
    const material = $OreDictMaterial.get(materialId)
    if (material == null) {
      return null
    }
    const stack = manager.getStack(prefix, material, count)
    if (stack == null || stack.isEmpty()) {
      return null
    }
    return stack
  }

  let added = 0
  for (let entryIndex = 0; entryIndex < ENTRIES.length; entryIndex++) {
    const entry = ENTRIES[entryIndex]
    try {
      const inputs = []
      let failed = false

      if (entry.items !== undefined) {
        for (let itemIndex = 0; itemIndex < entry.items.length; itemIndex++) {
          const spec = entry.items[itemIndex]
          inputs.push(item(spec.vanilla, spec.count))
        }
      }
      if (entry.plates !== undefined) {
        for (let plateIndex = 0; plateIndex < entry.plates.length; plateIndex++) {
          const spec = entry.plates[plateIndex]
          const stack = stackFor($OP.plate, spec.material, spec.count, entry.id + '/gt_plate' + spec.material)
          if (stack == null) {
            failed = true
          } else {
            inputs.push(stack)
          }
        }
      }
      if (entry.ingots !== undefined) {
        for (let ingotIndex = 0; ingotIndex < entry.ingots.length; ingotIndex++) {
          const spec = entry.ingots[ingotIndex]
          const stack = stackFor($OP.ingot, spec.material, spec.count, entry.id + '/gt_ingot' + spec.material)
          if (stack == null) {
            failed = true
          } else {
            inputs.push(stack)
          }
        }
      }

      if (failed) {
        continue
      }

      addItemRecipe('Welder', {
        itemInputs: inputs,
        itemOutputs: [item('thaumaturge:' + entry.id, entry.out)],
        duration: DURATION,
        eut: EUT,
        checkForCollisions: false
      })
      added = added + 1
    } catch (error) {
    }
  }

})
