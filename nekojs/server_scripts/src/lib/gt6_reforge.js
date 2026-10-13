import { GT_FORM, GT_MATERIAL, gtIngredient } from './gt6_materials.js'
import { modernizeRecipe } from './gt6_ingredient_forms.js'

function gt(formKey, materialKey, count) {
  return gtIngredient(GT_FORM[formKey], GT_MATERIAL[materialKey], count)
}

export const RF = Object.freeze({

  steel_ingot: gt('ingot', 'steel'),

  steel_plate: gt('plate', 'steel'),
  iron_ingot: gt('ingot', 'iron'),
  copper_ingot: gt('ingot', 'copper'),
  iron_plate: gt('plate', 'iron'),
  copper_plate: gt('plate', 'copper'),
  tin_plate: gt('plate', 'tin'),
  lead_plate: gt('plate', 'lead'),
  gold_plate: gt('plate', 'gold'),
  silver_plate: gt('plate', 'silver'),
  nickel_plate: gt('plate', 'nickel'),
  zinc_plate: gt('plate', 'zinc'),
  bronze_plate: gt('plate', 'bronze'),
  brass_plate: gt('plate', 'brass'),
  aluminium_plate: gt('plate', 'aluminium'),

  stainless_plate: gt('plate', 'stainlesssteel'),
  titanium_plate: gt('plate', 'titanium'),
  tungsten_plate: gt('plate', 'tungsten'),
  platinum_plate: gt('plate', 'platinum'),
  uranium_plate: gt('plate', 'uranium'),
  tungstensteel_plate: gt('plate', 'tungstensteel'),

  iron_gear: gt('gear', 'iron'),
  steel_gear: gt('gear', 'steel'),
  bronze_gear: gt('gear', 'bronze'),
  steel_screw: gt('screw', 'steel'),
  copper_screw: gt('screw', 'copper'),
  steel_stick: gt('stick', 'steel'),
  iron_stick: gt('stick', 'iron'),

  certus_gem: 'ae2:certus_quartz_crystal',
  charged_certus_gem: 'ae2:charged_certus_quartz_crystal',
  rubber_plate: gt('plate', 'rubber'),

  fluix_dust: 'ae2:fluix_dust',
})

export function splitPath(path) {
  const text = String(path)
  const parts = []
  let buffer = ''
  for (let index = 0; index < text.length; index++) {
    const ch = text.charAt(index)
    if (ch === '.' || ch === '[' || ch === ']') {
      if (buffer.length > 0) {
        parts.push(buffer)
        buffer = ''
      }
    } else {
      buffer = buffer + ch
    }
  }
  if (buffer.length > 0) {
    parts.push(buffer)
  }
  return parts
}

export function readJsonPath(object, path) {
  let current = object
  for (const part of splitPath(path)) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[part]
  }
  return current
}

export function applyOne(event, id, path, value) {
  let entry = null
  try {
    entry = event.get(id)
  } catch (getError) {
    return false
  }
  try {
    entry.setPath(path, value)
  } catch (setPathError) {

  }
  let stored = null
  try {
    stored = JSON.parse(event.getJson(id))
  } catch (readError) {
    stored = null
  }
  if (stored != null && JSON.stringify(readJsonPath(stored, path)) === JSON.stringify(value)) {
    return true
  }
  if (stored == null || typeof stored !== 'object') {
    return false
  }
  const parts = splitPath(path)
  let cursor = stored
  for (let index = 0; index < parts.length - 1; index++) {
    cursor = cursor[parts[index]]
  }
  cursor[parts[parts.length - 1]] = value
  event.setJson(id, JSON.stringify(stored))
  return JSON.stringify(readJsonPath(JSON.parse(event.getJson(id)), path)) === JSON.stringify(value)
}

function resultStack(recipe) {
  return recipe.count === undefined ? recipe.result : Item.of(recipe.result, recipe.count)
}

export function addDesigned(event, recipe) {
  if (recipe.kind === undefined || recipe.kind === 'shaped') {
    event.shaped(resultStack(recipe), recipe.pattern, recipe.keys).id(recipe.id)
    return
  }
  if (recipe.kind === 'shapeless') {
    event.shapeless(resultStack(recipe), recipe.ingredients).id(recipe.id)
    return
  }
  if (recipe.kind === 'smelting') {
    event.smelting(recipe.result, recipe.ingredient, recipe.xp, recipe.time).id(recipe.id)
    return
  }
  if (recipe.kind === 'custom') {
    event.custom(recipe.json).id(recipe.id)
    return
  }
  throw new Error(`unknown recipe type: ${String(recipe.kind)}`)
}

export function applyReforge(event, plan) {
  const tag = plan.tag === undefined ? 'REFORGE' : plan.tag
  const removeList = plan.remove === undefined ? [] : plan.remove
  const editList = plan.edits === undefined ? [] : plan.edits
  const gateList = plan.gates === undefined ? [] : plan.gates
  const addList = plan.add === undefined ? [] : plan.add

  const removed = new Set()
  let removedCount = 0
  for (const removeId of removeList) {
    if (!event.exists(removeId)) {
      continue
    }
    try {
      event.get(removeId).remove()
      removed.add(removeId)
      removedCount++
    } catch (removeError) {
    }
  }

  let editedCount = 0
  let skippedCount = 0
  for (const edit of editList) {
    if (removed.has(edit.id)) {
      continue
    }
    if (!event.exists(edit.id)) {

      skippedCount++
      continue
    }
    try {
      if (applyOne(event, edit.id, edit.path, edit.value)) {
        editedCount++
      } else {
      }
    } catch (editError) {
    }
  }

  let gatedCount = 0
  for (const gate of gateList) {
    if (removed.has(gate.id)) {
      continue
    }
    if (!event.exists(gate.id)) {
      skippedCount++
      continue
    }
    try {
      if (applyOne(event, gate.id, gate.path, gate.value)) {
        gatedCount++
      } else {
      }
    } catch (gateError) {
    }
  }

  const touchedIds = new Set()
  for (const touchedEdit of editList) touchedIds.add(touchedEdit.id)
  for (const touchedGate of gateList) touchedIds.add(touchedGate.id)
  let modernizedCount = 0
  for (const touchedId of touchedIds) {
    if (removed.has(touchedId) || !event.exists(touchedId)) {
      continue
    }
    try {
      if (modernizeRecipe(event, touchedId)) {
        modernizedCount++
      }
    } catch (modernizeError) {
    }
  }

  let addedCount = 0
  for (const recipe of addList) {
    try {
      addDesigned(event, recipe)
      addedCount++
    } catch (addError) {
    }
  }

}
