import { gt, gtIngredient } from '../src/lib/gt6_materials.js'
import { applyReforge } from '../src/lib/gt6_reforge.js'

// Witchery ingots are replaced by the matching GT6 plate.
// Each edit is written out explicitly; the comment above it shows the original item/tag.

const GT_PLATE = 'gregtech:gt.meta.plate'

const EDITS = [
  // witchery:arthana
  //   key.I:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:arthana', path: 'key.I', value: gt('plate', 'gold') },

  // witchery:black_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:black_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:blood_crucible
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:blood_crucible', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:blue_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:blue_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:brazier
  //   key.B:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:brazier', path: 'key.B', value: gt('plate', 'iron') },

  // witchery:brown_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:brown_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:cage_1
  //   key.E:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:cage_1', path: 'key.E', value: gt('plate', 'iron') },

  // witchery:cage_2
  //   key.B:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:cage_2', path: 'key.B', value: gt('plate', 'iron') },

  // witchery:cane_sword
  //   key.G:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:cane_sword', path: 'key.G', value: gt('plate', 'gold') },

  // witchery:cauldron
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:cauldron', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:censer
  //   key.G:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:censer', path: 'key.G', value: gt('plate', 'gold') },

  // witchery:censer_long
  //   key.G:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:censer_long', path: 'key.G', value: gt('plate', 'gold') },

  // witchery:chalice
  //   key.I:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:chalice', path: 'key.I', value: gt('plate', 'gold') },

  // witchery:copper_cauldron
  //   key.I:  "minecraft:copper_ingot"  ->  GT plate copper
  { id: 'witchery:copper_cauldron', path: 'key.I', value: gt('plate', 'copper') },

  // witchery:copper_witches_oven
  //   key.C:  "minecraft:copper_ingot"  ->  GT plate copper
  { id: 'witchery:copper_witches_oven', path: 'key.C', value: gt('plate', 'copper') },

  // witchery:crystal_ball
  //   key.D:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:crystal_ball', path: 'key.D', value: gt('plate', 'gold') },

  // witchery:cyan_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:cyan_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:distillery
  //   key.G:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:distillery', path: 'key.G', value: gt('plate', 'gold') },
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:distillery', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:gray_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:gray_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:green_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:green_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:iron_witches_oven
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:iron_witches_oven', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:light_blue_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:light_blue_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:light_gray_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:light_gray_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:lime_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:lime_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:magenta_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:magenta_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:orange_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:orange_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:pink_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:pink_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:purple_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:purple_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:red_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:red_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:ritual/blocks_below_copper
  //   ritual_events[0].items[1].item:  "minecraft:copper_ingot"  ->  GT plate copper
  { id: 'witchery:ritual/blocks_below_copper', path: 'ritual_events[0].items[1].item', value: gt('plate', 'copper') },

  // witchery:ritual/blocks_below_gold
  //   ritual_events[0].items[1].item:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:ritual/blocks_below_gold', path: 'ritual_events[0].items[1].item', value: gt('plate', 'gold') },

  // witchery:ritual/blocks_below_iron
  //   ritual_events[0].items[1].item:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:ritual/blocks_below_iron', path: 'ritual_events[0].items[1].item', value: gt('plate', 'iron') },

  // witchery:ritual/blocks_below_zinc
  //   ritual_events[1].item_ids[0].item:  "create:zinc_ingot"  ->  GT plate zinc
  { id: 'witchery:ritual/blocks_below_zinc', path: 'ritual_events[1].item_ids[0].item', value: gt('plate', 'zinc') },

  // witchery:ritual/rite_of_sunbinding
  //   ritual_events[0].items[4].item:  "minecraft:gold_ingot"  ->  GT plate gold
  { id: 'witchery:ritual/rite_of_sunbinding', path: 'ritual_events[0].items[4].item', value: gt('plate', 'gold') },

  // witchery:ritual/teleport_taglock_to_waystone
  //   ritual_events[0].items[3].item:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:ritual/teleport_taglock_to_waystone', path: 'ritual_events[0].items[3].item', value: gt('plate', 'iron') },

  // witchery:sunlight_collector
  //   key.B:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:sunlight_collector', path: 'key.B', value: gt('plate', 'iron') },

  // witchery:white_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:white_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },

  // witchery:yellow_iron_candelabra
  //   key.I:  "minecraft:iron_ingot"  ->  GT plate iron
  { id: 'witchery:yellow_iron_candelabra', path: 'key.I', value: gt('plate', 'iron') },
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'WitcheryIngotToPlate', edits: EDITS })
})
