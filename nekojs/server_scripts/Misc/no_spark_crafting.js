import { applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
  'cyclic:shapeless/spark'
]

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'NoSparkCrafting', remove: REMOVE, edits: [], gates: [], add: [] })
})
