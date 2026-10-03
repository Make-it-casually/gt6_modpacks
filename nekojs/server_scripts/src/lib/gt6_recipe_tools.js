import { $FL, $RM } from 'java:gregapi/data'
import { $Recipe } from 'java:gregapi/recipes/Recipe'

const ITEM_STACK_ARRAY = 'net.minecraft.world.item.ItemStack[]'
const FLUID_STACK_ARRAY = 'net.neoforged.neoforge.fluids.FluidStack[]'
const LONG_ARRAY = 'long[]'
const GUARANTEED_CHANCE = 10000

/**
 * Validate an input value as a JavaScript array.
 * @param {*} value Value to validate.
 * @param {string} name Parameter name used in the error message.
 * @returns {Array} The validated array.
 */
function requireArray(value, name) {
  if (!Array.isArray(value)) {
    throw new TypeError(`${name} must be an array`)
  }
  return value
}

/**
 * Validate an integer parameter and enforce its minimum value.
 * @param {*} value Number to validate.
 * @param {string} name Parameter name used in the error message.
 * @param {number} minimum Inclusive lower bound.
 * @returns {number} The validated integer.
 */
function requireWholeNumber(value, name, minimum) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new RangeError(`${name} must be a safe integer >= ${minimum}`)
  }
  return value
}

/**
 * Resolve a GT6 recipe map from its name or accept an already-resolved map.
 * @param {*} mapOrName GT6 map object or a property name from gregapi.data.RM.
 * @returns {*} The resolved GT6 recipe map.
 */
function resolveMap(mapOrName) {
  const recipeMap = typeof mapOrName === 'string' ? $RM[mapOrName] : mapOrName
  if (recipeMap == null || typeof recipeMap.addRecipe !== 'function') {
    throw new TypeError(`Unknown GT6 recipe map: ${String(mapOrName)}`)
  }
  return recipeMap
}

/**
 * Validate item stacks and convert them to the Java array expected by GT6.
 * @param {*} value Array of non-empty Minecraft ItemStacks.
 * @param {string} name Parameter name used in the error message.
 * @returns {*} A Java ItemStack array.
 */
function itemArray(value, name) {
  const stacks = requireArray(value, name)
  for (const stack of stacks) {
    if (stack == null || stack.isEmpty()) {
      throw new TypeError(`${name} must contain non-empty ItemStacks`)
    }
  }
  return Java.to(stacks, ITEM_STACK_ARRAY)
}

/**
 * Validate fluid stacks and convert them to the Java array expected by GT6.
 * @param {*} value Array of non-empty NeoForge FluidStacks.
 * @param {string} name Parameter name used in the error message.
 * @returns {*} A Java FluidStack array.
 */
function fluidArray(value, name) {
  const stacks = requireArray(value, name)
  for (const stack of stacks) {
    if (stack == null || stack.isEmpty()) {
      throw new TypeError(`${name} must contain non-empty FluidStacks`)
    }
  }
  return Java.to(stacks, FLUID_STACK_ARRAY)
}

/**
 * Create a validated item stack from its registry id.
 * @param {string} id Item registry id.
 * @param {number} count Stack size; defaults to one.
 * @returns {*} Minecraft ItemStack for the requested item.
 */
function item(id, count) {
  const itemId = id
  const itemCount = count === undefined ? 1 : count
  if (typeof itemId !== 'string' || itemId.length === 0) {
    throw new TypeError('Item id must be a non-empty string')
  }
  requireWholeNumber(itemCount, 'Item count', 1)
  const stack = Item.of(itemId, itemCount)
  if (stack == null || stack.isEmpty()) {
    throw new Error(`Unknown or invalid item: ${itemId}`)
  }
  return stack
}

/**
 * Create a validated GT6 fluid stack from its registered name.
 * @param {string} id Fluid name understood by GT6's FL registry.
 * @param {number} amount Fluid amount in millibuckets; defaults to 1000.
 * @returns {*} NeoForge FluidStack for the requested fluid.
 */
function fluid(id, amount) {
  const fluidId = id
  const fluidAmount = amount === undefined ? 1000 : amount
  if (typeof fluidId !== 'string' || fluidId.length === 0) {
    throw new TypeError('Fluid id must be a non-empty string')
  }
  requireWholeNumber(fluidAmount, 'Fluid amount', 1)
  const stack = $FL.make(fluidId, fluidAmount)
  if (stack == null || stack.isEmpty()) {
    throw new Error(`Unknown or invalid fluid: ${fluidId}`)
  }
  return stack
}

/**
 * Add a machine recipe with any combination of item and fluid inputs/outputs.
 * @param {*} mapOrName GT6 recipe map object or its name in gregapi.data.RM.
 * @param {object} spec Recipe fields: itemInputs, itemOutputs, fluidInputs,
 *   fluidOutputs, duration, eut, chances, specialValue, optimize, and
 *   checkForCollisions. Disable collision checks only when overlap is intentional.
 * @returns {*} The recipe accepted by the GT6 recipe map.
 */
function addRecipe(mapOrName, spec) {
  const recipeSpec = spec
  if (recipeSpec == null || typeof recipeSpec !== 'object') {
    throw new TypeError('Recipe specification must be an object')
  }

  const map = resolveMap(mapOrName)
  const inputs = itemArray(recipeSpec.itemInputs ?? [], 'itemInputs')
  const outputs = itemArray(recipeSpec.itemOutputs ?? [], 'itemOutputs')
  const fluidInputs = fluidArray(recipeSpec.fluidInputs ?? [], 'fluidInputs')
  const fluidOutputs = fluidArray(recipeSpec.fluidOutputs ?? [], 'fluidOutputs')

  if (inputs.length === 0 && fluidInputs.length === 0) {
    throw new RangeError('A machine recipe must have at least one item or fluid input')
  }
  if (outputs.length === 0 && fluidOutputs.length === 0) {
    throw new RangeError('A machine recipe must have at least one item or fluid output')
  }

  const duration = requireWholeNumber(recipeSpec.duration, 'duration', 1)
  const eut = recipeSpec.eut ?? 0
  if (!Number.isSafeInteger(eut)) {
    throw new RangeError('eut must be a safe integer')
  }
  const specialValue = requireWholeNumber(recipeSpec.specialValue ?? 0, 'specialValue', 0)
  const chances = requireArray(
    recipeSpec.chances ?? outputs.map(() => GUARANTEED_CHANCE),
    'chances'
  )
  if (chances.length !== outputs.length) {
    throw new RangeError('chances must have one entry per item output')
  }
  for (const chance of chances) {
    requireWholeNumber(chance, 'chance', 0)
    if (chance > GUARANTEED_CHANCE) {
      throw new RangeError(`chance must be <= ${GUARANTEED_CHANCE}`)
    }
  }

  const checkForCollisions = recipeSpec.checkForCollisions !== false
  const recipeData = new $Recipe(
    recipeSpec.optimize !== false,
    true,
    true,
    inputs,
    outputs,
    null,
    Java.to(chances, LONG_ARRAY),
    fluidInputs,
    fluidOutputs,
    duration,
    eut,
    specialValue
  )
  const recipe = map.addRecipe(recipeData, checkForCollisions, false, false, true)
  if (recipe == null) {
    throw new Error(
      `GT6 rejected recipe for ${map.mNameInternal}. It may collide with an existing recipe, ` +
      'be disabled by GT6 config, or violate this map\'s input requirements. ' +
      'Check the map limits and input combination; use checkForCollisions: false only if overlap is intentional.'
    )
  }
  return recipe
}

/**
 * Add a machine recipe containing item inputs and item outputs only.
 * @param {*} mapOrName GT6 recipe map object or its name in gregapi.data.RM.
 * @param {object} spec Recipe fields including itemInputs, itemOutputs,
 *   duration, eut, optional chances, specialValue, and optimize.
 * @returns {*} The recipe accepted by the GT6 recipe map.
 */
function addItemRecipe(mapOrName, spec) {
  const recipeSpec = spec
  return addRecipe(mapOrName, {
    ...recipeSpec,
    fluidInputs: [],
    fluidOutputs: []
  })
}

/**
 * Add a machine recipe containing fluid inputs and fluid outputs only.
 * @param {*} mapOrName GT6 recipe map object or its name in gregapi.data.RM.
 * @param {object} spec Recipe fields including fluidInputs, fluidOutputs,
 *   duration, eut, specialValue, and optimize.
 * @returns {*} The recipe accepted by the GT6 recipe map.
 */
function addFluidRecipe(mapOrName, spec) {
  const recipeSpec = spec
  return addRecipe(mapOrName, {
    ...recipeSpec,
    itemInputs: [],
    itemOutputs: [],
    chances: []
  })
}

/**
 * Add a recipe with both item and fluid ingredients and/or results.
 * @param {*} mapOrName GT6 recipe map object or its name in gregapi.data.RM.
 * @param {object} spec Recipe fields including any itemInputs, itemOutputs,
 *   fluidInputs, fluidOutputs, duration, eut, chances, specialValue, and optimize.
 * @returns {*} The recipe accepted by the GT6 recipe map.
 */
function addMixedRecipe(mapOrName, spec) {
  const recipeSpec = spec
  return addRecipe(mapOrName, recipeSpec)
}

export { item, fluid, addRecipe, addItemRecipe, addFluidRecipe, addMixedRecipe }
