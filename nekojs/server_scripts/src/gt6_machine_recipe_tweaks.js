import { $RM } from 'java:gregapi/data'

const MAX_CRUSHER_DURATION_TICKS = 100

ServerEvents.started(() => {
  const crusher = $RM.Crusher
  const recipes = crusher.mRecipeList.iterator()
  let changed = 0
  let checked = 0

  while (recipes.hasNext()) {
    const recipe = recipes.next()
    if (recipe == null || !recipe.mEnabled || recipe.mDuration <= 0) continue

    checked++
    if (recipe.mDuration > MAX_CRUSHER_DURATION_TICKS) {
      recipe.mDuration = MAX_CRUSHER_DURATION_TICKS
      changed++
    }
  }

  console.info(
    `[NekoJS/GT6] ${crusher.mNameInternal}: capped ${changed} of ${checked} loaded recipes at ${MAX_CRUSHER_DURATION_TICKS} ticks.`
  )

  const pendingHandlers = crusher.mRecipeMapHandlers.size()
  if (pendingHandlers > 0) {
    console.warn(
      `[NekoJS/GT6] ${pendingHandlers} dynamic Crusher recipe handlers remain; recipes they generate later are not changed by this pass.`
    )
  }
})
