const REMOVE_RECIPE_IDS = [
  'railcraft:blast_furnace/blasting_bucket',
  'railcraft:blast_furnace/blasting_iron_axe',
  'railcraft:blast_furnace/blasting_iron_boots',
  'railcraft:blast_furnace/blasting_iron_chestplate',
  'railcraft:blast_furnace/blasting_iron_crowbar',
  'railcraft:blast_furnace/blasting_iron_door',
  'railcraft:blast_furnace/blasting_iron_helmet',
  'railcraft:blast_furnace/blasting_iron_hoe',
  'railcraft:blast_furnace/blasting_iron_horse_armor',
  'railcraft:blast_furnace/blasting_iron_ingot',
  'railcraft:blast_furnace/blasting_iron_leggings',
  'railcraft:blast_furnace/blasting_iron_pickaxe',
  'railcraft:blast_furnace/blasting_iron_shovel',
  'railcraft:blast_furnace/blasting_iron_sword',
  'railcraft:blast_furnace/blasting_iron_trapdoor',
  'railcraft:blast_furnace/blasting_shears',
  'railcraft:blast_furnace/blasting_steel_axe',
  'railcraft:blast_furnace/blasting_steel_block',
  'railcraft:blast_furnace/blasting_steel_boots',
  'railcraft:blast_furnace/blasting_steel_chestplate',
  'railcraft:blast_furnace/blasting_steel_helmet',
  'railcraft:blast_furnace/blasting_steel_hoe',
  'railcraft:blast_furnace/blasting_steel_leggings',
  'railcraft:blast_furnace/blasting_steel_pickaxe',
  'railcraft:blast_furnace/blasting_steel_shears',
  'railcraft:blast_furnace/blasting_steel_sword',
  'railcraft:blast_furnace_bricks'
]

ServerEvents.recipes(event => {
  const failed = []
  let removed = 0
  for (let removeIndex = 0; removeIndex < REMOVE_RECIPE_IDS.length; removeIndex++) {
    const recipeId = REMOVE_RECIPE_IDS[removeIndex]
    try {
      event.get(recipeId).remove()
      removed = removed + 1
    } catch (error) {
      failed.push(recipeId)
    }
  }
  if (failed.length > 0) {
    console.warn('[NekoJS/RailcraftBlastFurnace] 未完成（可能已不存在）：' + failed.join(' | '))
  }
})
