
import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'agritechevolved:advanced_planter', path: 'key.F', value: RF.steel_plate },
  { id: 'agritechevolved:biomass_burner', path: 'key.I', value: RF.steel_plate },
  { id: 'agritechevolved:capacitor_tier1', path: 'key.I', value: RF.steel_plate },
  { id: 'agritechevolved:capacitor_tier2', path: 'key.G', value: RF.gold_plate },
  { id: 'agritechevolved:cloche_dome', path: 'key.I', value: RF.steel_plate },
  { id: 'agritechevolved:composter', path: 'key.I', value: RF.steel_plate },
  { id: 'agritechevolved:fertilizer_spreader', path: 'key.I', value: RF.steel_plate },
  { id: 'agritechevolved:silo', path: 'key.I', value: RF.steel_plate },
  { id: 'agritechevolved:sm_mk1', path: 'key.G', value: RF.gold_plate },
  { id: 'agritechevolved:sm_mk1', path: 'key.I', value: RF.steel_plate },
]

const GATES = [
  { id: 'agritechevolved:advanced_planter', path: 'pattern', value: ['F F', 'IAI', 'RZR'] },
  { id: 'agritechevolved:advanced_planter', path: 'key.Z', value: RF.bronze_plate },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'AgriTech', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
