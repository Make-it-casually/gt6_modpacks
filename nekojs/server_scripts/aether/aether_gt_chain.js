import { addItemRecipe, addMixedRecipe, item, fluid } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const RECIPES = [
  {
    label: 'aether_crush_ambrosium_ore',
    machine: 'Crusher',
    input: { id: 'aether_ii:ambrosium_ore', count: 1 },
    outputs: [{ item: "aether_ii:ambrosium_shard", count: 2 }, { form: 'dust', subtype: 8500, count: 1 }],
    chances: [10000, 3000],
    duration: 100,
    eut: 16,
    checkForCollisions: false
  },
  {
    label: 'aether_wash_ambrosium_ore',
    machine: 'PressureWasher',
    input: { id: 'aether_ii:ambrosium_ore', count: 1 },
    outputs: [{ item: "aether_ii:ambrosium_shard", count: 3 }, { form: 'dust', subtype: 8500, count: 1 }],
    chances: [10000, 5000],
    duration: 200,
    eut: 16,
    checkForCollisions: false,
    fluidSpec: [{ id: 'water', amount: 100 }]
  },
  {
    label: 'aether_crush_holystone_quartz_ore',
    machine: 'Crusher',
    input: { id: 'aether_ii:holystone_quartz_ore', count: 1 },
    outputs: [{ item: "minecraft:quartz", count: 2 }, { form: 'dust', subtype: 8500, count: 1 }],
    chances: [10000, 3000],
    duration: 100,
    eut: 16,
    checkForCollisions: false
  },
  {
    label: 'aether_wash_holystone_quartz_ore',
    machine: 'PressureWasher',
    input: { id: 'aether_ii:holystone_quartz_ore', count: 1 },
    outputs: [{ item: "minecraft:quartz", count: 3 }, { form: 'dust', subtype: 8500, count: 1 }],
    chances: [10000, 5000],
    duration: 200,
    eut: 16,
    checkForCollisions: false,
    fluidSpec: [{ id: 'water', amount: 100 }]
  },
  {
    label: 'aether_crush_undershale_ambrosium_ore',
    machine: 'Crusher',
    input: { id: 'aether_ii:undershale_ambrosium_ore', count: 1 },
    outputs: [{ item: "aether_ii:ambrosium_shard", count: 2 }, { form: 'dust', subtype: 8500, count: 1 }],
    chances: [10000, 3000],
    duration: 100,
    eut: 16,
    checkForCollisions: false
  },
  {
    label: 'aether_wash_undershale_ambrosium_ore',
    machine: 'PressureWasher',
    input: { id: 'aether_ii:undershale_ambrosium_ore', count: 1 },
    outputs: [{ item: "aether_ii:ambrosium_shard", count: 3 }, { form: 'dust', subtype: 8500, count: 1 }],
    chances: [10000, 5000],
    duration: 200,
    eut: 16,
    checkForCollisions: false,
    fluidSpec: [{ id: 'water', amount: 100 }]
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
  const stack = $OreDictManager.INSTANCE.getStack(prefix, material, count)
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
  let ok = 0
  for (let index = 0; index < RECIPES.length; index++) {
    const entry = RECIPES[index]
    try {
      const map = $RM[entry.machine]
      const entryFluids = []
      if (entry.fluidSpec !== undefined) {
        for (let fi = 0; fi < entry.fluidSpec.length; fi++) {
          entryFluids.push(fluid(entry.fluidSpec[fi].id, entry.fluidSpec[fi].amount))
        }
      }
      const add = entry.fluidSpec === undefined ? addItemRecipe : addMixedRecipe
      add(map, {
        fluidInputs: entryFluids,
        itemInputs: [item(entry.input.id, entry.input.count)],
        itemOutputs: buildStacks(entry.outputs),
        chances: entry.chances,
        duration: entry.duration,
        eut: entry.eut,
        checkForCollisions: entry.checkForCollisions
      })
      ok = ok + 1
    } catch (error) {
    }
  }

})
