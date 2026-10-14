import { gtIngredient } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

// ingot ingredients (c: tags and GT ingot components) are replaced by GT plates.
// Each edit is written out explicitly; the comment above it shows the original tag/item.

const EDITS = [
  // thirstwastaken2:advanced_drinking_upgrade
  //   key.G:  "#c:ingots/gold"  ->  GT plate (790)
  { id: 'thirstwastaken2:advanced_drinking_upgrade', path: 'key.G', value: gtIngredient('gregtech:gt.meta.plate', 790) },

  // thirstwastaken2:copper_canteen
  //   key.C:  "#c:ingots/copper"  ->  GT plate (290)
  { id: 'thirstwastaken2:copper_canteen', path: 'key.C', value: gtIngredient('gregtech:gt.meta.plate', 290) },

  // thirstwastaken2:copper_hanging_pot
  //   key.C:  "#c:ingots/copper"  ->  GT plate (290)
  { id: 'thirstwastaken2:copper_hanging_pot', path: 'key.C', value: gtIngredient('gregtech:gt.meta.plate', 290) },

  // thirstwastaken2:copper_pipe
  //   key.C:  "#c:ingots/copper"  ->  GT plate (290)
  { id: 'thirstwastaken2:copper_pipe', path: 'key.C', value: gtIngredient('gregtech:gt.meta.plate', 290) },

  // thirstwastaken2:distiller_boiler
  //   key.C:  "#c:ingots/copper"  ->  GT plate (290)
  { id: 'thirstwastaken2:distiller_boiler', path: 'key.C', value: gtIngredient('gregtech:gt.meta.plate', 290) },
  //   key.I:  "#c:ingots/iron"  ->  GT plate (260)
  { id: 'thirstwastaken2:distiller_boiler', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thirstwastaken2:iron_flask
  //   key.I:  "#c:ingots/iron"  ->  GT plate (260)
  { id: 'thirstwastaken2:iron_flask', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thirstwastaken2:iron_hanging_pot
  //   key.I:  "#c:ingots/iron"  ->  GT plate (260)
  { id: 'thirstwastaken2:iron_hanging_pot', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'ThirstPlate', edits: EDITS })
})
