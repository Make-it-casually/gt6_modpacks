export function modernizeIngredient(value) {
  if (Array.isArray(value)) {
    return value.map(modernizeIngredient)
  }
  if (value == null || typeof value !== 'object') {
    return value
  }
  const keys = Object.keys(value)
  if (keys.length === 1) {
    if (typeof value.item === 'string') {
      return value.item
    }
    if (typeof value.tag === 'string') {
      return '#' + value.tag
    }
  }
  return value
}

export function modernizeStack(value) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return value
  }
  if (typeof value.item === 'string') {
    const out = { id: value.item }
    for (const key of Object.keys(value)) {
      if (key !== 'item') {
        out[key] = value[key]
      }
    }
    return out
  }
  return value
}

export function modernizeRecipeJson(parsed) {
  let changed = false

  const resultBefore = parsed.result
  const resultAfter = modernizeStack(resultBefore)
  if (resultAfter !== resultBefore) {
    parsed.result = resultAfter
    changed = true
  }
  const outputBefore = parsed.output
  const outputAfter = modernizeStack(outputBefore)
  if (outputAfter !== outputBefore) {
    parsed.output = outputAfter
    changed = true
  }

  if (parsed.key != null && typeof parsed.key === 'object' && !Array.isArray(parsed.key)) {
    for (const letter of Object.keys(parsed.key)) {
      const keyBefore = parsed.key[letter]
      const keyAfter = modernizeIngredient(keyBefore)
      if (keyAfter !== keyBefore) {
        parsed.key[letter] = keyAfter
        changed = true
      }
    }
  }

  if (Array.isArray(parsed.ingredients)) {
    for (let index = 0; index < parsed.ingredients.length; index++) {
      const listBefore = parsed.ingredients[index]
      const listAfter = modernizeIngredient(listBefore)
      if (listAfter !== listBefore) {
        parsed.ingredients[index] = listAfter
        changed = true
      }
    }
  }

  if (parsed.ingredient !== undefined) {
    const singleBefore = parsed.ingredient
    const singleAfter = modernizeIngredient(singleBefore)
    if (singleAfter !== singleBefore) {
      parsed.ingredient = singleAfter
      changed = true
    }
  }

  return changed
}

export function modernizeRecipe(event, recipeId) {
  let text = null
  try {
    text = event.getJson(recipeId)
  } catch (readError) {
    return false
  }
  let parsed = null
  try {
    parsed = JSON.parse(text)
  } catch (parseError) {
    return false
  }
  if (parsed == null || typeof parsed !== 'object') {
    return false
  }
  if (!modernizeRecipeJson(parsed)) {
    return false
  }
  event.setJson(recipeId, JSON.stringify(parsed))
  return true
}
