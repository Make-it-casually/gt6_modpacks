import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
]

const EDITS = [
  { id: 'waystones:copper_portstone', path: 'key.D', value: RF.copper_plate },
  { id: 'waystones:copper_sharestone', path: 'key.D', value: RF.copper_plate },
  { id: 'waystones:copper_sharestone_from_ruined', path: 'ingredients[1]', value: RF.copper_plate },
  { id: 'waystones:copper_sharestone_from_ruined', path: 'ingredients[2]', value: RF.copper_plate },
  { id: 'waystones:copper_warp_stone', path: 'key.M', value: RF.copper_plate },
  { id: 'waystones:gold_portstone', path: 'key.D', value: RF.gold_plate },
  { id: 'waystones:gold_sharestone', path: 'key.D', value: RF.gold_plate },
  { id: 'waystones:gold_sharestone_from_ruined', path: 'ingredients[1]', value: RF.gold_plate },
  { id: 'waystones:gold_sharestone_from_ruined', path: 'ingredients[2]', value: RF.gold_plate },
  { id: 'waystones:gold_warp_stone', path: 'key.M', value: RF.gold_plate },
  { id: 'waystones:warp_stone', path: 'key.G', value: RF.gold_plate },
]

const GATES = [
  { id: 'waystones:amethyst_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:amethyst_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:copper_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:copper_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:diamond_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:diamond_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:emerald_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:emerald_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:gold_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:gold_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:lapis_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:lapis_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:prismarine_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:prismarine_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:redstone_warp_stone', path: 'pattern', value: [' M ', 'MWM', ' Z '] },
  { id: 'waystones:redstone_warp_stone', path: 'key.Z', value: RF.steel_plate },
  { id: 'waystones:warp_stone', path: 'pattern', value: ['AEA', 'EGE', 'AZA'] },
  { id: 'waystones:warp_stone', path: 'key.Z', value: RF.steel_plate },
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'Waystones', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
