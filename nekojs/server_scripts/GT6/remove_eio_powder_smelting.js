import { applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
  'enderio:item.minecraft.copper_ingot_from_blasting',
  'enderio:item.minecraft.copper_ingot_from_smelting',
  'enderio:item.minecraft.gold_ingot_from_blasting',
  'enderio:item.minecraft.gold_ingot_from_smelting',
  'enderio:item.minecraft.iron_ingot_from_blasting',
  'enderio:item.minecraft.iron_ingot_from_smelting',
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'NoEIOPowderSmelting', remove: REMOVE, edits: [], gates: [], add: [] })
})
