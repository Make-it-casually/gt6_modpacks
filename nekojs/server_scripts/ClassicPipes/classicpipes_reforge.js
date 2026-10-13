import { gt } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

const TARGETS = `classicpipes:acacia_fluid_pipe_a
classicpipes:acacia_fluid_pipe_b
classicpipes:acacia_pipe
classicpipes:advanced_copper_fluid_pipe_a
classicpipes:advanced_copper_fluid_pipe_b
classicpipes:advanced_copper_pipe_a
classicpipes:advanced_copper_pipe_b
classicpipes:bamboo_fluid_pipe_a
classicpipes:bamboo_fluid_pipe_b
classicpipes:bamboo_pipe
classicpipes:birch_fluid_pipe_a
classicpipes:birch_fluid_pipe_b
classicpipes:birch_pipe
classicpipes:bone_pipe
classicpipes:brick_fluid_pipe_a
classicpipes:brick_fluid_pipe_b
classicpipes:brick_pipe
classicpipes:cherry_fluid_pipe_a
classicpipes:cherry_fluid_pipe_b
classicpipes:cherry_pipe
classicpipes:copper_fluid_pipe_a
classicpipes:copper_fluid_pipe_b
classicpipes:copper_pipe
classicpipes:crimson_fluid_pipe_a
classicpipes:crimson_fluid_pipe_b
classicpipes:crimson_pipe
classicpipes:dark_oak_fluid_pipe_a
classicpipes:dark_oak_fluid_pipe_b
classicpipes:dark_oak_pipe
classicpipes:diamond_fluid_pipe_a
classicpipes:diamond_fluid_pipe_b
classicpipes:diamond_pipe
classicpipes:flint_pipe
classicpipes:golden_pipe
classicpipes:inverted_advanced_copper_fluid_pipe_a
classicpipes:inverted_advanced_copper_fluid_pipe_b
classicpipes:inverted_advanced_copper_fluid_pipe_c
classicpipes:inverted_advanced_copper_pipe_a
classicpipes:inverted_advanced_copper_pipe_b
classicpipes:inverted_copper_fluid_pipe_a
classicpipes:inverted_copper_fluid_pipe_b
classicpipes:inverted_copper_pipe_a
classicpipes:inverted_copper_pipe_b
classicpipes:iron_fluid_pipe_a
classicpipes:iron_fluid_pipe_b
classicpipes:iron_pipe
classicpipes:jungle_fluid_pipe_a
classicpipes:jungle_fluid_pipe_b
classicpipes:jungle_pipe
classicpipes:lapis_fluid_pipe_a
classicpipes:lapis_fluid_pipe_b
classicpipes:lapis_pipe
classicpipes:mangrove_fluid_pipe_a
classicpipes:mangrove_fluid_pipe_b
classicpipes:mangrove_pipe
classicpipes:matching_pipe_a
classicpipes:matching_pipe_b
classicpipes:matching_pipe_c
classicpipes:mod_label
classicpipes:nether_brick_fluid_pipe_a
classicpipes:nether_brick_fluid_pipe_b
classicpipes:nether_brick_pipe
classicpipes:oak_fluid_pipe_a
classicpipes:oak_fluid_pipe_b
classicpipes:oak_pipe
classicpipes:obsidian_fluid_pipe_a
classicpipes:obsidian_fluid_pipe_b
classicpipes:obsidian_pipe
classicpipes:pale_oak_fluid_pipe_a
classicpipes:pale_oak_fluid_pipe_b
classicpipes:pale_oak_pipe
classicpipes:pipe_slicer
classicpipes:provider_pipe_a
classicpipes:provider_pipe_b
classicpipes:provider_pipe_c
classicpipes:recipe_pipe_a
classicpipes:recipe_pipe_b
classicpipes:request_pipe_a
classicpipes:request_pipe_b
classicpipes:request_pipe_c
classicpipes:routing_pipe
classicpipes:spruce_fluid_pipe_a
classicpipes:spruce_fluid_pipe_b
classicpipes:spruce_pipe
classicpipes:stocking_pipe_a
classicpipes:stocking_pipe_b
classicpipes:storage_pipe_a
classicpipes:storage_pipe_b
classicpipes:tag_label_a
classicpipes:tag_label_b
classicpipes:warped_fluid_pipe_a
classicpipes:warped_fluid_pipe_b
classicpipes:warped_pipe`.split('\n')

const MATERIAL_MAP = Object.freeze({
  'minecraft:copper_ingot': gt('plate', 'copper'),
  'minecraft:iron_ingot': gt('plate', 'iron'),
  'minecraft:gold_ingot': gt('plate', 'gold'),
  'minecraft:copper_nugget': gt('nugget', 'copper'),
  'minecraft:iron_nugget': gt('nugget', 'iron'),
  'minecraft:gold_nugget': gt('nugget', 'gold'),
  'minecraft:diamond': gt('gem', 'diamond'),
  'minecraft:lapis_lazuli': gt('gem', 'lapis'),
  'minecraft:quartz': gt('gem', 'netherquartz')
})

ServerEvents.recipes(event => {
  const edits = []
  for (let targetIndex = 0; targetIndex < TARGETS.length; targetIndex++) {
    const recipeId = TARGETS[targetIndex]
    if (!event.exists(recipeId)) continue
    let parsed = null
    try {
      parsed = JSON.parse(event.getJson(recipeId))
    } catch (readError) {
      continue
    }
    const key = parsed === null ? undefined : parsed.key
    if (key === undefined || key === null) continue
    const letters = Object.keys(key)
    for (let letterIndex = 0; letterIndex < letters.length; letterIndex++) {
      const letter = letters[letterIndex]
      const replacement = MATERIAL_MAP[String(key[letter])]
      if (replacement === undefined) continue
      edits.push({ id: recipeId, path: 'key.' + letter, value: replacement })
    }
  }

  applyReforge(event, {
    tag: 'ClassicPipesGT',
    edits: edits
  })
})
