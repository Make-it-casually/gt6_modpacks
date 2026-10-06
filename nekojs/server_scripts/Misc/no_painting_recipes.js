import { applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
  'minecraft:painting',
  'dimpaintings:end_painting'
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'NoPaintingRecipes', remove: REMOVE, edits: [], gates: [], add: [] })
})
