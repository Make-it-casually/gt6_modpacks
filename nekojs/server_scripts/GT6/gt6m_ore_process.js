import { addItemRecipe, addMixedRecipe, item, fluid } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $OP } from 'java:gregapi/data/OP'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'

const REGISTRATION_KEY = 'gt6mOreProcessRegisteredV1'

const RECIPES = [
  {
    label: 'gt6m_inert_arkenium_wash',
    machine: 'PressureWasher',
    input: { id: 'gt6m:inert_arkenium_dust', count: 1 },
    outputs: [{ form: 'dust', subtype: 760, count: 1 }],
    chances: [10000],
    duration: 200,
    eut: 16,
    checkForCollisions: false,
    fluidSpec: [{ id: 'water', amount: 100 }]
  },
  {
    label: 'gt6m_inert_arkenium_centrifuge',
    machine: 'Centrifuge',
    input: { id: 'gt6m:inert_arkenium_dust', count: 1 },
    outputs: [{ form: 'dustSmall', subtype: 760, count: 1 }, { form: 'dustTiny', subtype: 260, count: 1 }],
    chances: [8000, 3000],
    duration: 240,
    eut: 32,
    checkForCollisions: false,
  },
  {
    label: 'gt6m_inert_arkenium_smelt',
    machine: 'Smelter',
    input: { id: 'gt6m:inert_arkenium_dust', count: 1 },
    outputs: [{ form: 'ingot', subtype: 760, count: 1 }],
    chances: [10000],
    duration: 300,
    eut: 0,
    checkForCollisions: false,
  },
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
    throw new Error('未知形态：' + formKey)
  }
  const material = $OreDictMaterial.get(subtype)
  if (material == null) {
    throw new Error('未知材料号：' + subtype)
  }
  let stack = $OreDictManager.INSTANCE.getStack(prefix, material, count)
  if (stack == null || stack.isEmpty()) {
    stack = $OreDictManager.INSTANCE.getStack(prefix, material, null, count)
  }
  if (stack == null || stack.isEmpty()) {
    throw new Error('形态=' + String(prefix) + ' 材料=' + String(material) + ' 数量=' + count + ' 取不到物品')
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
  const problems = []
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
      problems.push(entry.label + '：' + String(error))
    }
  }
  console.info('[NekoJS/GT6M] 矿处理链：注册 ' + ok + '/' + RECIPES.length + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/GT6M] 未完成：' + problems.join(' | '))
  }
})
