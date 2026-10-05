import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
  'enderio_endergy:crude_steel_ingot',
  'enderio_endergy:item.enderio_endergy.crude_steel_nugget_to_ingot',
  'enderio_endergy:crude_steel_nugget',
]

const EDITS = [
  { id: 'enderio_endergy:basic_capacitor', path: 'key.C', value: RF.copper_plate },
  { id: 'enderio_endergy:copper_energy_conduit', path: 'key.I', value: RF.copper_plate },
  { id: 'enderio_endergy:crude_energy_conduit', path: 'key.I', value: RF.steel_ingot },
  { id: 'enderio_endergy:crude_steel_block', path: 'key.I', value: RF.steel_ingot },
  { id: 'enderio_endergy:crude_steel_grinding_ball', path: 'key.I', value: RF.steel_ingot },
  { id: 'enderio_endergy:crude_steel_nugget', path: 'ingredients[0]', value: RF.steel_ingot },
  { id: 'enderio_endergy:gold_energy_conduit', path: 'key.I', value: RF.gold_plate },
  { id: 'enderio_endergy:iron_energy_conduit', path: 'key.I', value: RF.steel_plate },
]

const GATES = [
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'EIO-Endergy', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
