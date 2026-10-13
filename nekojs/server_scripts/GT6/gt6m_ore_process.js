import { addItemRecipe, addMixedRecipe, item, fluid } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const REGISTRATION_KEY = 'gt6mOreProcessRegisteredV1'

const RECIPES = [
  {
    label: 'gt6m_hammer_gravel',
    machine: 'Hammer',
    input: { id: 'minecraft:gravel', count: 1 },
    outputs: [{ item: 'minecraft:sand', count: 1 }],
    chances: [10000],
    duration: 40,
    eut: 0,
    checkForCollisions: false,
  },
]

function metaStack(formKey, subtype, count) {
  const shared = globalThis.__nekojsGtMetaStacks
  if (shared != null) {
    const cached = shared[formKey + ':' + subtype]
    if (cached !== undefined) {
      return cached.copyWithCount(count)
    }
  }
  const prefix = $OP[formKey]
  if (prefix == null) {
    throw new Error('unknown form: ' + formKey)
  }
  const material = $OreDictMaterial.get(subtype)
  if (material == null) {
    throw new Error('unknown material id: ' + subtype)
  }
  let stack = $OreDictManager.INSTANCE.getStack(prefix, material, count)
  if (stack == null || stack.isEmpty()) {
    stack = $OreDictManager.INSTANCE.getStack(prefix, material, null, count)
  }
  if (stack == null || stack.isEmpty()) {
    throw new Error('form=' + String(prefix) + ' material=' + String(material) + ' count=' + count + ' item not obtainable')
  }
  return stack
}

function buildStacks(list) {
  const stacks = []
  for (let index = 0; index < list.length; index++) {
    const entry = list[index]
    if (entry.item === undefined) {
      stacks.push(metaStack(entry.form, entry.subtype, entry.count))
    } else {
      stacks.push(item(entry.item, entry.count))
    }
  }
  return stacks
}

ServerEvents.started(() => {
  if (global[REGISTRATION_KEY] === true) {
    return
  }
  global[REGISTRATION_KEY] = true
  let ok = 0
  for (let index = 0; index < RECIPES.length; index++) {
    const entry = RECIPES[index]
    try {
      const map = $RM[entry.machine]
      const add = entry.fluidSpec === undefined ? addItemRecipe : addMixedRecipe
      const entryFluids = []
      if (entry.fluidSpec !== undefined) {
        for (let fi = 0; fi < entry.fluidSpec.length; fi++) {
          entryFluids.push(fluid(entry.fluidSpec[fi].id, entry.fluidSpec[fi].amount))
        }
      }
      add(map, {
        fluidInputs: entryFluids,
        itemInputs: [item(entry.input.id, entry.input.count)],
        itemOutputs: buildStacks(entry.outputs),
        chances: entry.chances,
        duration: entry.duration,
        eut: entry.eut
      })
      ok = ok + 1
    } catch (error) {
    }
  }

})
