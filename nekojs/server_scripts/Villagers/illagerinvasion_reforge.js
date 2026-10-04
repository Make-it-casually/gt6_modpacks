
import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'illagerinvasion:horn_of_sight', path: 'key.#', value: RF.gold_plate },
]

const GATES = [
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'IllagerInvasion', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
