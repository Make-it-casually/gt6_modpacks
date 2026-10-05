import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'bakeries:blender', path: 'key.b', value: RF.steel_plate },
  { id: 'bakeries:bread_knife', path: 'key.a', value: RF.steel_plate },
  { id: 'bakeries:cash_register_computer', path: 'key.a', value: RF.steel_plate },
  { id: 'bakeries:moka_pot', path: 'key.a', value: RF.steel_plate },
  { id: 'bakeries:mould', path: 'key.c', value: RF.steel_plate },
  { id: 'bakeries:oven', path: 'key.a', value: RF.steel_plate },
  { id: 'bakeries:toaster', path: 'key.a', value: RF.steel_plate },
]

const GATES = [
  { id: 'bakeries:blender', path: 'pattern', value: ['abb', 'cdb', 'aZb'] },
  { id: 'bakeries:blender',
    path: 'key',
    value: { "a": "minecraft:iron_nugget",
      "b": RF.steel_plate,
      "c": "minecraft:redstone",
      "d": "minecraft:hopper",
      "Z": RF.bronze_plate
    }
  },
  { id: 'bakeries:oven', path: 'pattern', value: ['aba', 'cdc', 'aZa'] },
  { id: 'bakeries:oven', path: 'key.Z', value: RF.bronze_plate },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Bakeries', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
