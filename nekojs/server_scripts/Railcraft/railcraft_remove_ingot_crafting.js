const REMOVE_IDS = [
  'railcraft:brass_ingot_crafted_with_ingots',
  'railcraft:bronze_ingot_crafted_with_ingots',
  'railcraft:invar_ingot_crafted_with_ingots',
  'railcraft:brass_ingot',
  'railcraft:bronze_ingot',
  'railcraft:invar_ingot',
  'railcraft:lead_ingot',
  'railcraft:nickel_ingot',
  'railcraft:silver_ingot',
  'railcraft:steel_ingot',
  'railcraft:tin_ingot',
  'railcraft:zinc_ingot',
  'railcraft:brass_ingot_from_brass_nugget',
  'railcraft:bronze_ingot_from_bronze_nugget',
  'railcraft:invar_ingot_from_invar_nugget',
  'railcraft:lead_ingot_from_lead_nugget',
  'railcraft:nickel_ingot_from_nickel_nugget',
  'railcraft:silver_ingot_from_silver_nugget',
  'railcraft:steel_ingot_from_steel_nugget',
  'railcraft:tin_ingot_from_tin_nugget',
  'railcraft:zinc_ingot_from_zinc_nugget'
]

ServerEvents.recipes(event => {
  const failed = []
  let removed = 0
  for (let removeIndex = 0; removeIndex < REMOVE_IDS.length; removeIndex++) {
    const recipeId = REMOVE_IDS[removeIndex]
    try {
      event.get(recipeId).remove()
      removed = removed + 1
    } catch (error) {
      failed.push(recipeId)
    }
  }
  if (failed.length > 0) {
    console.warn('[NekoJS/RailcraftIngots] 未完成（可能已不存在）：' + failed.join(' | '))
  }
})
