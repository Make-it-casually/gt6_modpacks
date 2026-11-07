import { $RM } from 'java:gregapi/data'
import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { gt } from '../src/lib/gt6_materials.js'

const DIM_CORE = 'dimstorage:dim_core'
const CIRCUIT = 'gregapi:gt.integrated_circuit'

const REMOVE = [
  'dimstorage:dim_wall',
  'dimstorage:solid_dim_core',
  'dimstorage:dim_core',
  'nekojs:dimstorage/dim_wall',
  'nekojs:dimstorage/solid_dim_core'
]

const RECIPES = [
  {
    id: 'nekojs:dimstorage/dim_wall',
    result: 'dimstorage:dim_wall',
    count: 4,
    pattern: ['aba', 'bcb', 'aba'],
    keys: {
      a: 'extendedae:entro_ingot',
      b: 'minecraft:redstone',
      c: 'minecraft:ender_pearl'
    }
  },
  {
    id: 'nekojs:dimstorage/solid_dim_core',
    result: 'dimstorage:solid_dim_core',
    pattern: ['aaa', 'aba', 'aaa'],
    keys: {
      a: gt('plate', 8654),
      b: 'dimstorage:dim_core'
    }
  }
]

function toIngredient(value) {
  return value
}

function toResult(recipe) {
  return recipe.count === undefined ? { id: recipe.result } : { id: recipe.result, count: recipe.count }
}

function buildRecipeJson(recipe) {
  const key = {}
  for (const [letter, value] of Object.entries(recipe.keys)) {
    key[letter] = toIngredient(value)
  }
  return JSON.stringify({
    type: 'minecraft:crafting_shaped',
    category: 'misc',
    pattern: recipe.pattern,
    key: key,
    result: toResult(recipe)
  })
}

function addDesigned(event, recipe) {
  const jsonText = buildRecipeJson(recipe)
  event.shaped(Item.of('minecraft:stone'), ['S'], { S: 'minecraft:stone' }).id(recipe.id)
  event.setJson(recipe.id, jsonText)
  const readBack = JSON.parse(event.getJson(recipe.id))
  if (JSON.stringify(readBack) !== JSON.stringify(JSON.parse(jsonText))) {
    throw new Error('recipe JSON mismatch after write-back: ' + recipe.id)
  }
}

// GT6 recipe maps keep their recipes across /reload, so clear the previous dim_core recipes first
function clearDimCoreRecipes() {
  const list = $RM.Nanofab.mRecipeList
  if (list == null) {
    return
  }
  const doomed = []
  const iterator = list.iterator()
  while (iterator.hasNext()) {
    const recipe = iterator.next()
    if (recipe == null) {
      continue
    }
    const outputs = recipe.getOutputs()
    if (outputs == null) {
      continue
    }
    for (let index = 0; index < outputs.length; index++) {
      const output = outputs[index]
      if (output == null || output.isEmpty()) {
        continue
      }
      if (output.getItem().builtInRegistryHolder().key().identifier().toString() === DIM_CORE) {
        doomed.push(recipe)
        break
      }
    }
  }
  for (const recipe of doomed) {
    try {
      list.remove(recipe)
    } catch (removeError) {
    }
    try {
      recipe.mEnabled = false
    } catch (disableError) {
    }
  }
}

function addNanofabRecipe() {
  clearDimCoreRecipes()
  const recipe = addItemRecipe($RM.Nanofab, {
    itemInputs: [item(CIRCUIT, 1), item('minecraft:ender_eye', 1)],
    itemOutputs: [item(DIM_CORE, 1)],
    duration: 200,
    eut: 32
  })
  if (recipe == null) {
    throw new Error('GT6 rejected the dim_core nanofab recipe')
  }
}

ServerEvents.recipes(event => {
  addNanofabRecipe()

  for (const removeId of REMOVE) {
    if (!event.exists(removeId)) {
      continue
    }
    try {
      event.get(removeId).remove()
    } catch (removeError) {
    }
  }

  for (const recipe of RECIPES) {
    try {
      addDesigned(event, recipe)
    } catch (addError) {
      console.warn('[NekoJS/DimStorage] ' + String(addError))
    }
  }
})
