import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  // key.#:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'croptopia:cooking_pot', path: 'key.#', value: RF.steel_plate },
  // key.#:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'croptopia:frying_pan', path: 'key.#', value: RF.steel_plate },
  // key.#:  "minecraft:iron_ingot"  ->  GT steel_plate
  { id: 'croptopia:knife', path: 'key.#', value: RF.steel_plate },
]

const GATES = [
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Croptopia', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
