import { gtIngredient } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

// Thaumaturge ingots/plates/nuggets are replaced by the matching GT6 material components.
// Each edit is written out explicitly; the comment above it shows the original item/tag.

const EDITS = [
  // thaumaturge:arcane_workbench/advanced_alchemical_construct
  //   key.V:  "thaumaturge:ingot_void"  ->  GT ingot (8681)
  { id: 'thaumaturge:arcane_workbench/advanced_alchemical_construct', path: 'key.V', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:arcane_workbench/alchemical_construct
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/alchemical_construct', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/arcane_door
  //   key.T:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:arcane_workbench/arcane_door', path: 'key.T', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:arcane_workbench/arcane_grindstone
  //   key.T:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:arcane_workbench/arcane_grindstone', path: 'key.T', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:arcane_workbench/arcane_pressure_plate
  //   key.T:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:arcane_workbench/arcane_pressure_plate', path: 'key.T', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:arcane_workbench/brain_box
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/brain_box', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/candle_holder_thaumium
  //   key.P:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:arcane_workbench/candle_holder_thaumium', path: 'key.P', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:arcane_workbench/candle_holder_void
  //   key.P:  "#c:plates/void_metal"  ->  GT plate (8681)
  { id: 'thaumaturge:arcane_workbench/candle_holder_void', path: 'key.P', value: gtIngredient('gregtech:gt.meta.plate', 8681) },

  // thaumaturge:arcane_workbench/condenser_lattice
  //   key.T:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:arcane_workbench/condenser_lattice', path: 'key.T', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:arcane_workbench/dioptra
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/dioptra', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/essentia_input
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/essentia_input', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/essentia_output
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/essentia_output', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/focal_manipulator
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/focal_manipulator', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/grapple_gun
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/grapple_gun', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/lamp_arcane
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/lamp_arcane', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/levitator
  //   key.B:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/levitator', path: 'key.B', value: gtIngredient('gregtech:gt.meta.plate', 260) },
  //   key.I:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:arcane_workbench/levitator', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:arcane_workbench/mechanism_complex
  //   key.T:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:arcane_workbench/mechanism_complex', path: 'key.T', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:arcane_workbench/mechanism_simple
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/mechanism_simple', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/potion_sprayer
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/potion_sprayer', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/resonator
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/resonator', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/smelter_aux
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/smelter_aux', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/smelter_thaumium
  //   key.C:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:arcane_workbench/smelter_thaumium', path: 'key.C', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:arcane_workbench/smelter_vent
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/smelter_vent', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/smelter_void
  //   key.C:  "#c:plates/void_metal"  ->  GT plate (8681)
  { id: 'thaumaturge:arcane_workbench/smelter_void', path: 'key.C', value: gtIngredient('gregtech:gt.meta.plate', 8681) },

  // thaumaturge:arcane_workbench/stabilizer
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/stabilizer', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/tube
  //   key.P:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/tube', path: 'key.P', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/tube_buffer
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/tube_buffer', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/turret_advanced
  //   key.P:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/turret_advanced', path: 'key.P', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/turret_basic
  //   key.I:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/turret_basic', path: 'key.I', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:arcane_workbench/vis_resonator
  //   ingredients[0]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:arcane_workbench/vis_resonator', path: 'ingredients[0]', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:infusion/essentia_reservoir
  //   components[0]:  "thaumaturge:ingot_void"  ->  GT ingot (8681)
  { id: 'thaumaturge:infusion/essentia_reservoir', path: 'components[0]', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },
  //   components[3]:  "thaumaturge:ingot_void"  ->  GT ingot (8681)
  { id: 'thaumaturge:infusion/essentia_reservoir', path: 'components[3]', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:infusion/fortress_chest
  //   components[0]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_chest', path: 'components[0]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },
  //   components[1]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_chest', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },
  //   components[2]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_chest', path: 'components[2]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },
  //   components[3]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_chest', path: 'components[3]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:infusion/fortress_helm
  //   components[0]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_helm', path: 'components[0]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },
  //   components[1]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_helm', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:infusion/fortress_helm_mask_0
  //   components[1]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:infusion/fortress_helm_mask_0', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 260) },
  //   components[5]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:infusion/fortress_helm_mask_0', path: 'components[5]', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:infusion/fortress_helm_mask_1
  //   components[1]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:infusion/fortress_helm_mask_1', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 260) },
  //   components[5]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:infusion/fortress_helm_mask_1', path: 'components[5]', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:infusion/fortress_helm_mask_2
  //   components[1]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:infusion/fortress_helm_mask_2', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 260) },
  //   components[5]:  "#c:plates/iron"  ->  GT plate (260)
  { id: 'thaumaturge:infusion/fortress_helm_mask_2', path: 'components[5]', value: gtIngredient('gregtech:gt.meta.plate', 260) },

  // thaumaturge:infusion/fortress_legs
  //   components[0]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_legs', path: 'components[0]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },
  //   components[1]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_legs', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },
  //   components[2]:  "#c:plates/thaumium"  ->  GT plate (8679)
  { id: 'thaumaturge:infusion/fortress_legs', path: 'components[2]', value: gtIngredient('gregtech:gt.meta.plate', 8679) },

  // thaumaturge:infusion/void_robe_chest
  //   components[1]:  "#c:plates/void_metal"  ->  GT plate (8681)
  { id: 'thaumaturge:infusion/void_robe_chest', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 8681) },
  //   components[2]:  "#c:plates/void_metal"  ->  GT plate (8681)
  { id: 'thaumaturge:infusion/void_robe_chest', path: 'components[2]', value: gtIngredient('gregtech:gt.meta.plate', 8681) },

  // thaumaturge:infusion/void_robe_legs
  //   components[1]:  "#c:plates/void_metal"  ->  GT plate (8681)
  { id: 'thaumaturge:infusion/void_robe_legs', path: 'components[1]', value: gtIngredient('gregtech:gt.meta.plate', 8681) },
  //   components[2]:  "#c:plates/void_metal"  ->  GT plate (8681)
  { id: 'thaumaturge:infusion/void_robe_legs', path: 'components[2]', value: gtIngredient('gregtech:gt.meta.plate', 8681) },

  // thaumaturge:metal_thaumium
  //   key.#:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:metal_thaumium', path: 'key.#', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:metal_void
  //   key.#:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:metal_void', path: 'key.#', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:nugget_thaumium
  //   ingredients[0]:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:nugget_thaumium', path: 'ingredients[0]', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:nugget_void
  //   ingredients[0]:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:nugget_void', path: 'ingredients[0]', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:plate_thaumium
  //   key.N:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:plate_thaumium', path: 'key.N', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:plate_void
  //   key.N:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:plate_void', path: 'key.N', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:thaumium_axe
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_axe', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_boots
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_boots', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_chest
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_chest', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_helm
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_helm', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_hoe
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_hoe', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_legs
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_legs', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_pickaxe
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_pickaxe', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_shovel
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_shovel', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_spear
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_spear', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:thaumium_sword
  //   key.I:  "#c:ingots/thaumium"  ->  GT ingot (8679)
  { id: 'thaumaturge:thaumium_sword', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8679) },

  // thaumaturge:void_axe
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_axe', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_boots
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_boots', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_chest
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_chest', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_helm
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_helm', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_hoe
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_hoe', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_legs
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_legs', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_pickaxe
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_pickaxe', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_shovel
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_shovel', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_spear
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_spear', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },

  // thaumaturge:void_sword
  //   key.I:  "#c:ingots/void_metal"  ->  GT ingot (8681)
  { id: 'thaumaturge:void_sword', path: 'key.I', value: gtIngredient('gregtech:gt.meta.ingot', 8681) },
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'ThaumaturgeGTM', edits: EDITS })
})
