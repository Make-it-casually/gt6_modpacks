
import { RF, applyReforge } from '../src/lib/gt6_reforge.js'

const REMOVE = [
  'alcocraftplus:chorus_ale',
  'alcocraftplus:digger_bitter',
  'alcocraftplus:drowned_ale',
  'alcocraftplus:ice_beer',
  'alcocraftplus:kvass',
  'alcocraftplus:leprechaun_cider',
  'alcocraftplus:magnet_pilsner',
  'alcocraftplus:nether_porter',
  'alcocraftplus:night_rauch',
  'alcocraftplus:sun_pale_ale',
  'alcocraftplus:nether_star_lager',
  'alcocraftplus:wither_stout',
]

const EDITS = [
  { id: 'alcocraftplus:spruce_keg', path: 'key.1', value: RF.steel_plate },
]

const GATES = [
]

const ADD = []

ServerEvents.recipes(event => {
  applyReforge(event, { tag: 'AlcoCraft', remove: REMOVE, edits: EDITS, gates: GATES, add: ADD })
})
