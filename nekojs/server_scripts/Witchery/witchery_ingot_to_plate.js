import { gt } from '../src/lib/gt6_materials.js'

const TARGETS = `witchery:alder_boat
witchery:alder_button
witchery:alder_chest_boat
witchery:alder_door
witchery:alder_fence
witchery:alder_fence_gate
witchery:alder_hanging_sign
witchery:alder_planks
witchery:alder_pressure_plate
witchery:alder_sign
witchery:alder_slab
witchery:alder_stairs
witchery:alder_trapdoor
witchery:apple_of_sleeping
witchery:armor_protection_poppet
witchery:arthana
witchery:attuned_stone
witchery:attuned_stone_eternal
witchery:bark_belt
witchery:batwing_pendant
witchery:biome_note
witchery:biting_belt
witchery:black_iron_candelabra
witchery:black_iron_candelabra_dyed
witchery:blood_crucible
witchery:blood_stained_hay
witchery:blue_iron_candelabra
witchery:blue_iron_candelabra_dyed
witchery:bone_meal_4
witchery:bone_meal_5
witchery:bone_meal_6
witchery:bone_meal_7
witchery:bone_needle
witchery:brazier
witchery:brazier_passive/anguish_of_the_dead
witchery:brazier_passive/deathly_veil
witchery:brazier_passive/drain_growth
witchery:brazier_passive/fortification_of_the_corpse
witchery:brazier_passive/graveyard_mist
witchery:brazier_summoning/summon_banshee
witchery:brazier_summoning/summon_poltergeist
witchery:brazier_summoning/summon_spectre
witchery:broom
witchery:brown_iron_candelabra
witchery:brown_iron_candelabra_dyed
witchery:cage_1
witchery:cage_2
witchery:cane_sword
witchery:cauldron
witchery:cauldron_brewing/brew_of_erosion
witchery:cauldron_brewing/brew_of_flowing_spirit
witchery:cauldron_brewing/brew_of_frost
witchery:cauldron_brewing/brew_of_ink
witchery:cauldron_brewing/brew_of_last_stand
witchery:cauldron_brewing/brew_of_love
witchery:cauldron_brewing/brew_of_oblivion
witchery:cauldron_brewing/brew_of_raising
witchery:cauldron_brewing/brew_of_revealing
witchery:cauldron_brewing/brew_of_sleeping
witchery:cauldron_brewing/brew_of_the_depths
witchery:cauldron_brewing/brew_of_the_grotesque
witchery:cauldron_brewing/brew_of_verdant_foul
witchery:cauldron_brewing/brew_of_wasting
witchery:cauldron_brewing/brew_of_webs
witchery:cauldron_brewing/flying_ointment
witchery:cauldron_brewing/ghost_of_the_light
witchery:cauldron_brewing/happenstance
witchery:cauldron_brewing/infernal_animus
witchery:cauldron_brewing/mystic_ungent
witchery:cauldron_brewing/redstone_soup
witchery:cauldron_brewing/soul_of_the_world
witchery:cauldron_brewing/spirit_of_otherwhere
witchery:cauldron_crafting/binding_chalk
witchery:cauldron_crafting/drop_of_luck
witchery:cauldron_crafting/golden_chalk
witchery:cauldron_crafting/infernal_chalk
witchery:cauldron_crafting/mutandis
witchery:cauldron_crafting/mutandis_extremis
witchery:cauldron_crafting/mutating_sprig
witchery:cauldron_crafting/nether_wart
witchery:cauldron_crafting/otherwhere_chalk
witchery:cauldron_crafting/pentacle
witchery:cauldron_infusion/depths_respiration
witchery:cauldron_infusion/erosion_efficiency
witchery:cauldron_infusion/flowing_spirit_soul_speed
witchery:cauldron_infusion/flying_ointment_feather_falling
witchery:cauldron_infusion/frostwalker_boots
witchery:cauldron_infusion/ghost_of_the_light_swift_sneak
witchery:cauldron_infusion/grotesque_thorns
witchery:cauldron_infusion/hags_ring_infusion_lumber
witchery:cauldron_infusion/hags_ring_infusion_miner
witchery:cauldron_infusion/hags_ring_infusion_reach
witchery:cauldron_infusion/happenstance_oil_fortune
witchery:cauldron_infusion/happenstance_oil_looting
witchery:cauldron_infusion/happenstance_oil_luck_of_the_sea
witchery:cauldron_infusion/infernal_animus_fire_aspect
witchery:cauldron_infusion/infernal_animus_fire_protection
witchery:cauldron_infusion/infernal_animus_flame
witchery:cauldron_infusion/last_protection
witchery:cauldron_infusion/love_lure
witchery:cauldron_infusion/oblivion_vanishing
witchery:cauldron_infusion/palevine_ink
witchery:cauldron_infusion/redstone_soup_efficiency
witchery:cauldron_infusion/redstone_soup_quick_charge
witchery:cauldron_infusion/verdant_mending
witchery:cauldron_infusion/webs_silk_touch
witchery:censer
witchery:censer_long
witchery:chalice
witchery:clay_effigy
witchery:clay_jar
witchery:coffin
witchery:copper_cauldron
witchery:copper_witches_oven
witchery:copper_witches_oven_fume_extension
witchery:coven_contract_1
witchery:coven_contract_2
witchery:coven_contract_3
witchery:crystal_ball
witchery:cyan_iron_candelabra
witchery:cyan_iron_candelabra_dyed
witchery:death_protection_poppet
witchery:deepslate_altar_block
witchery:distillery
witchery:distilling/brew_of_hollow_tears
witchery:distilling/demons_blood
witchery:distilling/ender_dew
witchery:distilling/oil_of_vitriol_gypsum
witchery:distilling/phantom_vapor
witchery:distilling/reek_of_misfortune_glowstone
witchery:distilling/refined_evil
witchery:distilling/refined_evil_from_ghast
witchery:distilling/tear_and_whiff
witchery:disturbed_cotton
witchery:dream_weaver
witchery:dreamweaver_charm
witchery:dress_coat
witchery:eternal_catalyst
witchery:eternal_catalyst_1
witchery:eternal_catalyst_2
witchery:gold_ring
witchery:gray_iron_candelabra
witchery:gray_iron_candelabra_dyed
witchery:green_iron_candelabra
witchery:green_iron_candelabra_dyed
witchery:guidebook
witchery:hawthorn_boat
witchery:hawthorn_button
witchery:hawthorn_chest_boat
witchery:hawthorn_door
witchery:hawthorn_fence
witchery:hawthorn_fence_gate
witchery:hawthorn_hanging_sign
witchery:hawthorn_planks
witchery:hawthorn_pressure_plate
witchery:hawthorn_sign
witchery:hawthorn_slab
witchery:hawthorn_stairs
witchery:hawthorn_trapdoor
witchery:hunger_protection_poppet
witchery:hunter_boots
witchery:hunter_chestplate
witchery:hunter_helmet
witchery:hunter_leggings
witchery:icy_slippers
witchery:iron_candelabra
witchery:iron_candelabra_undyed
witchery:iron_witches_oven
witchery:iron_witches_oven_fume_extension
witchery:jar
witchery:koboldite_pentacle
witchery:koboldite_pickaxe
witchery:light_blue_iron_candelabra
witchery:light_blue_iron_candelabra_dyed
witchery:light_gray_iron_candelabra
witchery:light_gray_iron_candelabra_dyed
witchery:lime_iron_candelabra
witchery:lime_iron_candelabra_dyed
witchery:magenta_iron_candelabra
witchery:magenta_iron_candelabra_dyed
witchery:nullified_leather
witchery:orange_iron_candelabra
witchery:orange_iron_candelabra_dyed
witchery:oven_cooking/breath_of_the_goddess
witchery:oven_cooking/breath_of_the_goddess2
witchery:oven_cooking/exhale_of_the_horned_one
witchery:oven_cooking/exhale_of_the_horned_one2
witchery:oven_cooking/foul_fume_2
witchery:oven_cooking/foul_fume_logs
witchery:oven_cooking/hint_of_rebirth
witchery:oven_cooking/hint_of_rebirth2
witchery:oven_cooking/odor_of_purity
witchery:oven_cooking/phantom_vapor
witchery:oven_cooking/reek_of_misfortune
witchery:oven_cooking/whiff_of_magic
witchery:oxford_boots
witchery:palevine_quill
witchery:pink_iron_candelabra
witchery:pink_iron_candelabra_dyed
witchery:poppet
witchery:purple_iron_candelabra
witchery:purple_iron_candelabra_dyed
witchery:quartz_sphere
witchery:red_iron_candelabra
witchery:red_iron_candelabra_dyed
witchery:ritual/apply_ointment
witchery:ritual/apply_ungent
witchery:ritual/befuddlement
witchery:ritual/bestial_call
witchery:ritual/bind_familiar
witchery:ritual/bind_hobgoblin_statue
witchery:ritual/bind_spectral_creatures
witchery:ritual/blocks_below_amber
witchery:ritual/blocks_below_cinnabar
witchery:ritual/blocks_below_copper
witchery:ritual/blocks_below_gold
witchery:ritual/blocks_below_iron
witchery:ritual/blocks_below_zinc
witchery:ritual/change_biome
witchery:ritual/change_biome_cheap
witchery:ritual/change_biome_waystone
witchery:ritual/change_biome_waystone_cheap
witchery:ritual/charge_attuned
witchery:ritual/clear_weather
witchery:ritual/corrupt_poppet
witchery:ritual/curse_of_insanity
witchery:ritual/curse_of_misfortune
witchery:ritual/curse_of_overheating
witchery:ritual/curse_of_sinking
witchery:ritual/curse_of_the_undead
witchery:ritual/curse_of_the_wolf
witchery:ritual/fragility
witchery:ritual/hunger
witchery:ritual/infuse_infernal
witchery:ritual/infuse_light
witchery:ritual/infuse_otherwhere
witchery:ritual/infuse_overworld
witchery:ritual/infuse_seer
witchery:ritual/manifestation
witchery:ritual/mirror_pair
witchery:ritual/necro_stone
witchery:ritual/pull_mobs
witchery:ritual/push_mobs
witchery:ritual/raining_toad
witchery:ritual/remove_curse
witchery:ritual/resurrect_familiar
witchery:ritual/rite_of_bloodbinding
witchery:ritual/rite_of_charging_infusion
witchery:ritual/rite_of_moonbinding
witchery:ritual/rite_of_sunbinding
witchery:ritual/rot
witchery:ritual/set_day
witchery:ritual/set_midnight
witchery:ritual/summon_demon
witchery:ritual/summon_imp
witchery:ritual/summon_lightning
witchery:ritual/summon_lightning_on_waystone
witchery:ritual/summon_spectral_pig
witchery:ritual/summon_witch
witchery:ritual/summon_wither
witchery:ritual/teleport_owner_to_waystone
witchery:ritual/teleport_taglock_to_waystone
witchery:ritual_chalk
witchery:rowan_boat
witchery:rowan_button
witchery:rowan_chest_boat
witchery:rowan_door
witchery:rowan_fence
witchery:rowan_fence_gate
witchery:rowan_hanging_sign
witchery:rowan_planks
witchery:rowan_pressure_plate
witchery:rowan_sign
witchery:rowan_slab
witchery:rowan_stairs
witchery:rowan_trapdoor
witchery:scarecrow
witchery:special/leonards_urn
witchery:special/pendant_crafting_blood
witchery:special/pendant_crafting_sun
witchery:special/potion_transfer
witchery:special/taglock_binding
witchery:spinning/dream_weaver_of_fasting
witchery:spinning/dream_weaver_of_fleet_foot
witchery:spinning/dream_weaver_of_iron_arm
witchery:spinning/dream_weaver_of_nightmares
witchery:spinning/fanciful_thread
witchery:spinning/fibre_leather
witchery:spinning/golden_thread
witchery:spinning/impregnated_fabric
witchery:spinning/tormented_twine
witchery:spinning_wheel
witchery:statue_of_hobgoblin_patron
witchery:sunlight_collector
witchery:supernatural_arrow
witchery:suppression_arrow
witchery:taglock
witchery:top_hat
witchery:trousers
witchery:vampiric_poppet
witchery:voodoo_poppet
witchery:voodoo_protection_poppet
witchery:waystone
witchery:werewolf_altar
witchery:white_iron_candelabra
witchery:white_iron_candelabra_dyed
witchery:wine_glass
witchery:witches_hat
witchery:witches_robes
witchery:witches_slippers
witchery:woven_cruor
witchery:yellow_iron_candelabra
witchery:yellow_iron_candelabra_dyed`.split('\n')

const MATERIALS = {
  iron: 'iron',
  gold: 'gold',
  copper: 'copper',
  tin: 'tin',
  lead: 'lead',
  silver: 'silver',
  nickel: 'nickel',
  zinc: 'zinc',
  bronze: 'bronze',
  brass: 'brass',
  steel: 'steel',
  aluminium: 'aluminium',
  platinum: 'platinum',
  titanium: 'titanium',
  tungsten: 'tungsten'
}


const ITEM_TO_MATERIAL = {
  'minecraft:iron_ingot': 'iron',
  'minecraft:gold_ingot': 'gold',
  'minecraft:copper_ingot': 'copper',
  'witchery:koboldite_ingot': null,
  'create:zinc_ingot': 'zinc',
  'railcraft:steel_ingot': 'steel',
  'railcraft:tin_ingot': 'tin',
  'railcraft:lead_ingot': 'lead',
  'railcraft:silver_ingot': 'silver',
  'railcraft:nickel_ingot': 'nickel',
  'railcraft:zinc_ingot': 'zinc',
  'railcraft:bronze_ingot': 'bronze',
  'railcraft:brass_ingot': 'brass',
  'enderio:conductive_alloy_ingot': null,
  'enderio:dark_steel_ingot': null
}

const GT_INGOT = 'gregtech:gt.meta.ingot'
const GT_PLATE = 'gregtech:gt.meta.plate'

const SKIP_KEYS = ['type', 'category', 'group', 'pattern', 'result', 'output', 'results']

function fromTag(text) {
  const prefixes = ['#c:ingots/', '#forge:ingots/', '#neoforge:ingots/']
  for (let index = 0; index < prefixes.length; index++) {
    const prefix = prefixes[index]
    if (text.indexOf(prefix) !== 0) {
      continue
    }
    const name = text.slice(prefix.length)
    const material = MATERIALS[name]
    if (material === undefined) {
      return null
    }
    return gt('plate', material)
  }
  return null
}

function fromIngredientObject(entry) {
  const itemId = entry.items === undefined ? null : String(entry.items)
  if (itemId === null || itemId !== GT_INGOT) {
    return null
  }
  const components = entry.components
  if (components === null || typeof components !== 'object') {
    return null
  }
  const subtype = components['gregapi:subtype']
  if (typeof subtype !== 'number') {
    return null
  }
  const plate = { 'neoforge:ingredient_type': 'neoforge:components', items: GT_PLATE, components: { 'gregapi:subtype': subtype } }
  return plate
}

function fromItemId(text) {
  const material = ITEM_TO_MATERIAL[text]
  if (material === undefined || material === null) {
    return null
  }
  return gt('plate', material)
}

function convert(entry) {
  if (typeof entry === 'string') {
    const fromTagResult = fromTag(entry)
    if (fromTagResult !== null) {
      return fromTagResult
    }
    return fromItemId(entry)
  }
  if (Array.isArray(entry)) {
    let changed = false
    const out = []
    for (let index = 0; index < entry.length; index++) {
      const replaced = convert(entry[index])
      if (replaced === null) {
        out.push(entry[index])
      } else {
        out.push(replaced)
        changed = true
      }
    }
    if (!changed) {
      return null
    }
    return out
  }
  if (entry !== null && typeof entry === 'object') {
    const asIngredient = fromIngredientObject(entry)
    if (asIngredient !== null) {
      return asIngredient
    }
    let changed = false
    const out = {}
    const keys = Object.keys(entry)
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]
      const current = entry[key]
      if (SKIP_KEYS.indexOf(key) >= 0) {
        out[key] = current
        continue
      }
      const replaced = convert(current)
      if (replaced === null) {
        out[key] = current
      } else {
        out[key] = replaced
        changed = true
      }
    }
    if (!changed) {
      return null
    }
    return out
  }
  return null
}

ServerEvents.recipes(event => {
  let changed = 0
  const problems = []
  for (let index = 0; index < TARGETS.length; index++) {
    const id = TARGETS[index]
    try {
      if (!event.exists(id)) {
        continue
      }
      const text = event.getJson(id)
      if (text == null) {
        continue
      }
      const parsed = JSON.parse(text)
      const replaced = convert(parsed)
      if (replaced === null) {
        continue
      }
      event.setJson(id, JSON.stringify(replaced))
      changed = changed + 1
    } catch (error) {
      problems.push(id + '：' + String(error))
    }
  }
  const summary = '[NekoJS/WitcheryIngotToPlate] Witchery 配方：金属锭 → 板，改动 ' + changed + '/' + TARGETS.length
    + ' 条；问题 ' + problems.length + ' 处。'
  if (problems.length > 0) {
    console.warn('[NekoJS/WitcheryIngotToPlate] 未完成：' + problems.join(' | '))
  }
})
