import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'homesteads:honey_bottling_station_recipe', path: 'key.c', value: RF.steel_plate },
  { id: 'homesteads:wood_work_log_recipe', path: 'key.b', value: RF.steel_plate },
]

const GATES = [
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Homesteads', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
