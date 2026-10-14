import { gt } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

// ClassicPipes ingots, nuggets and gems are replaced by the matching GT6 items (plates/nuggets/gems).
// Each edit is written out explicitly; the comment above it shows the original item.

const EDITS = [
  // classicpipes:advanced_copper_fluid_pipe_b
  //   key.W:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:advanced_copper_fluid_pipe_b', path: 'key.W', value: gt('gem', 'diamond') },

  // classicpipes:advanced_copper_pipe_a
  //   key.O:  "minecraft:copper_ingot"  ->  GT copper plate
  { id: 'classicpipes:advanced_copper_pipe_a', path: 'key.O', value: gt('plate', 'copper') },
  //   key.X:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:advanced_copper_pipe_a', path: 'key.X', value: gt('gem', 'diamond') },

  // classicpipes:advanced_copper_pipe_b
  //   key.W:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:advanced_copper_pipe_b', path: 'key.W', value: gt('gem', 'diamond') },

  // classicpipes:copper_fluid_pipe_a
  //   key.O:  "minecraft:copper_ingot"  ->  GT copper plate
  { id: 'classicpipes:copper_fluid_pipe_a', path: 'key.O', value: gt('plate', 'copper') },

  // classicpipes:copper_pipe
  //   key.O:  "minecraft:copper_ingot"  ->  GT copper plate
  { id: 'classicpipes:copper_pipe', path: 'key.O', value: gt('plate', 'copper') },

  // classicpipes:diamond_fluid_pipe_a
  //   key.O:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:diamond_fluid_pipe_a', path: 'key.O', value: gt('gem', 'diamond') },

  // classicpipes:diamond_pipe
  //   key.O:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:diamond_pipe', path: 'key.O', value: gt('gem', 'diamond') },

  // classicpipes:golden_pipe
  //   key.O:  "minecraft:gold_ingot"  ->  GT gold plate
  { id: 'classicpipes:golden_pipe', path: 'key.O', value: gt('plate', 'gold') },

  // classicpipes:inverted_advanced_copper_fluid_pipe_b
  //   key.W:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:inverted_advanced_copper_fluid_pipe_b', path: 'key.W', value: gt('gem', 'diamond') },

  // classicpipes:inverted_advanced_copper_pipe_b
  //   key.W:  "minecraft:diamond"  ->  GT diamond gem
  { id: 'classicpipes:inverted_advanced_copper_pipe_b', path: 'key.W', value: gt('gem', 'diamond') },

  // classicpipes:inverted_copper_pipe_a
  //   key.O:  "minecraft:copper_ingot"  ->  GT copper plate
  { id: 'classicpipes:inverted_copper_pipe_a', path: 'key.O', value: gt('plate', 'copper') },

  // classicpipes:iron_fluid_pipe_a
  //   key.O:  "minecraft:iron_ingot"  ->  GT iron plate
  { id: 'classicpipes:iron_fluid_pipe_a', path: 'key.O', value: gt('plate', 'iron') },

  // classicpipes:iron_pipe
  //   key.O:  "minecraft:iron_ingot"  ->  GT iron plate
  { id: 'classicpipes:iron_pipe', path: 'key.O', value: gt('plate', 'iron') },

  // classicpipes:lapis_fluid_pipe_a
  //   key.O:  "minecraft:lapis_lazuli"  ->  GT lapis gem
  { id: 'classicpipes:lapis_fluid_pipe_a', path: 'key.O', value: gt('gem', 'lapis') },

  // classicpipes:lapis_pipe
  //   key.O:  "minecraft:lapis_lazuli"  ->  GT lapis gem
  { id: 'classicpipes:lapis_pipe', path: 'key.O', value: gt('gem', 'lapis') },

  // classicpipes:matching_pipe_a
  //   key.X:  "minecraft:iron_ingot"  ->  GT iron plate
  { id: 'classicpipes:matching_pipe_a', path: 'key.X', value: gt('plate', 'iron') },

  // classicpipes:matching_pipe_b
  //   key.W:  "minecraft:iron_ingot"  ->  GT iron plate
  { id: 'classicpipes:matching_pipe_b', path: 'key.W', value: gt('plate', 'iron') },

  // classicpipes:matching_pipe_c
  //   key.O:  "minecraft:iron_nugget"  ->  GT iron nugget
  { id: 'classicpipes:matching_pipe_c', path: 'key.O', value: gt('nugget', 'iron') },

  // classicpipes:pipe_slicer
  //   key.Q:  "minecraft:quartz"  ->  GT nether quartz gem
  { id: 'classicpipes:pipe_slicer', path: 'key.Q', value: gt('gem', 'netherquartz') },

  // classicpipes:provider_pipe_a
  //   key.X:  "minecraft:copper_ingot"  ->  GT copper plate
  { id: 'classicpipes:provider_pipe_a', path: 'key.X', value: gt('plate', 'copper') },

  // classicpipes:provider_pipe_b
  //   key.W:  "minecraft:copper_ingot"  ->  GT copper plate
  { id: 'classicpipes:provider_pipe_b', path: 'key.W', value: gt('plate', 'copper') },

  // classicpipes:provider_pipe_c
  //   key.O:  "minecraft:copper_nugget"  ->  GT copper nugget
  { id: 'classicpipes:provider_pipe_c', path: 'key.O', value: gt('nugget', 'copper') },

  // classicpipes:request_pipe_a
  //   key.X:  "minecraft:gold_ingot"  ->  GT gold plate
  { id: 'classicpipes:request_pipe_a', path: 'key.X', value: gt('plate', 'gold') },

  // classicpipes:request_pipe_b
  //   key.W:  "minecraft:gold_ingot"  ->  GT gold plate
  { id: 'classicpipes:request_pipe_b', path: 'key.W', value: gt('plate', 'gold') },

  // classicpipes:request_pipe_c
  //   key.O:  "minecraft:gold_nugget"  ->  GT gold nugget
  { id: 'classicpipes:request_pipe_c', path: 'key.O', value: gt('nugget', 'gold') },

  // classicpipes:stocking_pipe_a
  //   key.X:  "minecraft:lapis_lazuli"  ->  GT lapis gem
  { id: 'classicpipes:stocking_pipe_a', path: 'key.X', value: gt('gem', 'lapis') },

  // classicpipes:stocking_pipe_b
  //   key.W:  "minecraft:lapis_lazuli"  ->  GT lapis gem
  { id: 'classicpipes:stocking_pipe_b', path: 'key.W', value: gt('gem', 'lapis') },
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'ClassicPipesGT', edits: EDITS })
})
