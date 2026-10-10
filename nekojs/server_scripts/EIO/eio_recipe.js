import { clearGt6CraftingFor } from '../src/lib/gt6_cleanup.js'

const EXPLICIT_REMOVALS = [
    'enderio:erase_alloy_smelter',
    'enderio:erase_sag_mill',
    'enderio:sag_mill',
    'enderio:vat'
]

const MACHINE_RECIPE_IDS = [
    'enderio:alloy_smelting/black_dye',
    'enderio:alloy_smelting/black_dye_double',
    'enderio:alloy_smelting/brown_dye_twigs',
    'enderio:alloy_smelting/brown_dye_twigs_double',
    'enderio:alloy_smelting/clear_glass',
    'enderio:alloy_smelting/clear_glass_d_from_base',
    'enderio:alloy_smelting/clear_glass_d_from_base_alt',
    'enderio:alloy_smelting/clear_glass_d_from_main',
    'enderio:alloy_smelting/clear_glass_d_from_main_alt',
    'enderio:alloy_smelting/clear_glass_e_from_base',
    'enderio:alloy_smelting/clear_glass_e_from_base_alt',
    'enderio:alloy_smelting/clear_glass_e_from_main',
    'enderio:alloy_smelting/clear_glass_e_from_main_alt',
    'enderio:alloy_smelting/conductive_alloy_ingot',
    'enderio:alloy_smelting/dark_steel_ingot',
    'enderio:alloy_smelting/dead_bush',
    'enderio:alloy_smelting/end_steel_ingot',
    'enderio:alloy_smelting/ender_pearl',
    'enderio:alloy_smelting/energetic_alloy_ingot',
    'enderio:alloy_smelting/fused_quartz',
    'enderio:alloy_smelting/fused_quartz_alt',
    'enderio:alloy_smelting/fused_quartz_d_from_base',
    'enderio:alloy_smelting/fused_quartz_d_from_base_alt',
    'enderio:alloy_smelting/fused_quartz_d_from_main',
    'enderio:alloy_smelting/fused_quartz_d_from_main_alt',
    'enderio:alloy_smelting/fused_quartz_d_from_storage',
    'enderio:alloy_smelting/fused_quartz_d_from_storage_alt',
    'enderio:alloy_smelting/fused_quartz_e_from_base',
    'enderio:alloy_smelting/fused_quartz_e_from_base_alt',
    'enderio:alloy_smelting/fused_quartz_e_from_main',
    'enderio:alloy_smelting/fused_quartz_e_from_main_alt',
    'enderio:alloy_smelting/fused_quartz_e_from_storage',
    'enderio:alloy_smelting/fused_quartz_e_from_storage_alt',
    'enderio:alloy_smelting/green_dye_clippings',
    'enderio:alloy_smelting/green_dye_double_clippings',
    'enderio:alloy_smelting/industrial_insulation',
    'enderio:alloy_smelting/photovoltaic_plate',
    'enderio:alloy_smelting/pulsating_alloy_ingot',
    'enderio:alloy_smelting/red_dye',
    'enderio:alloy_smelting/redstone_alloy_ingot',
    'enderio:alloy_smelting/soularium_ingot',
    'enderio:alloy_smelting/vibrant_alloy_ingot',
    'enderio:dark_steel_ingot_with_coal',
    'enderio:fermenting/fluid_cloud_seed_concentrated_still',
    'enderio:fermenting/fluid_cloud_seed_still',
    'enderio:fermenting/fluid_fire_water_still',
    'enderio:fermenting/fluid_hootch_still',
    'enderio:fermenting/fluid_liquid_darkness_still',
    'enderio:fermenting/fluid_liquid_sunshine_still',
    'enderio:fermenting/fluid_nutrient_distillation_still',
    'enderio:fermenting/fluid_rocket_fuel_still',
    'enderio:sag_milling/allium',
    'enderio:sag_milling/aluminum',
    'enderio:sag_milling/aluminum_ore',
    'enderio:sag_milling/azure_bluet',
    'enderio:sag_milling/blaze_powder',
    'enderio:sag_milling/blue_orchid',
    'enderio:sag_milling/bone',
    'enderio:sag_milling/bone_block',
    'enderio:sag_milling/cactus',
    'enderio:sag_milling/clay',
    'enderio:sag_milling/coal',
    'enderio:sag_milling/coal_ore',
    'enderio:sag_milling/cobbled_deepslate',
    'enderio:sag_milling/cobblestone',
    'enderio:sag_milling/cobweb',
    'enderio:sag_milling/copper',
    'enderio:sag_milling/copper_ore',
    'enderio:sag_milling/dandelion',
    'enderio:sag_milling/deepslate',
    'enderio:sag_milling/diamond_ore',
    'enderio:sag_milling/emerald_ore',
    'enderio:sag_milling/ender_crystal',
    'enderio:sag_milling/ender_pearl',
    'enderio:sag_milling/fern',
    'enderio:sag_milling/flower_pot',
    'enderio:sag_milling/glass',
    'enderio:sag_milling/glowstone',
    'enderio:sag_milling/gold',
    'enderio:sag_milling/gold_ore',
    'enderio:sag_milling/grass',
    'enderio:sag_milling/gravel',
    'enderio:sag_milling/iron',
    'enderio:sag_milling/iron_ore',
    'enderio:sag_milling/lapis',
    'enderio:sag_milling/lapis_ore',
    'enderio:sag_milling/large_fern',
    'enderio:sag_milling/lead',
    'enderio:sag_milling/lead_ore',
    'enderio:sag_milling/leaves',
    'enderio:sag_milling/lily_pad',
    'enderio:sag_milling/mossy_cobblestone',
    'enderio:sag_milling/obsidian',
    'enderio:sag_milling/orange_tulip',
    'enderio:sag_milling/osmium',
    'enderio:sag_milling/osmium_ore',
    'enderio:sag_milling/oxeye_daisy',
    'enderio:sag_milling/pink_tulip',
    'enderio:sag_milling/poeny',
    'enderio:sag_milling/poppy',
    'enderio:sag_milling/precient_crystal',
    'enderio:sag_milling/prismarine_shard',
    'enderio:sag_milling/pulsating_crystal',
    'enderio:sag_milling/quartz',
    'enderio:sag_milling/quartz_block',
    'enderio:sag_milling/quartz_ore',
    'enderio:sag_milling/quartz_slabs',
    'enderio:sag_milling/quartz_stairs',
    'enderio:sag_milling/raw_aluminum',
    'enderio:sag_milling/raw_copper',
    'enderio:sag_milling/raw_gold',
    'enderio:sag_milling/raw_iron',
    'enderio:sag_milling/raw_lead',
    'enderio:sag_milling/raw_osmium',
    'enderio:sag_milling/raw_tin',
    'enderio:sag_milling/raw_uranium',
    'enderio:sag_milling/red_tulip',
    'enderio:sag_milling/redstone_ore',
    'enderio:sag_milling/rose_bush',
    'enderio:sag_milling/sand',
    'enderio:sag_milling/sandstone',
    'enderio:sag_milling/shrub',
    'enderio:sag_milling/soularium',
    'enderio:sag_milling/stone',
    'enderio:sag_milling/sugar_canes',
    'enderio:sag_milling/sun_flower',
    'enderio:sag_milling/tall_grass',
    'enderio:sag_milling/tin',
    'enderio:sag_milling/tin_ore',
    'enderio:sag_milling/uranium',
    'enderio:sag_milling/uranium_ore',
    'enderio:sag_milling/vibrant_crystal',
    'enderio:sag_milling/vines',
    'enderio:sag_milling/white_tulip',
    'enderio:sag_milling/wither_rose',
    'enderio:sag_milling/wither_skull',
    'enderio:sag_milling/wool',
]

const MACHINE_OUTPUTS = [
    'enderio:alloy_smelter',
    'enderio:sag_mill',
    'enderio:vat'
]

const UPGRADE_OUTPUTS = [
]

ServerEvents.recipes(event => {
    const blockedOutputs = MACHINE_OUTPUTS.concat(UPGRADE_OUTPUTS)

    let removedById = 0
    for (const id of EXPLICIT_REMOVALS.concat(MACHINE_RECIPE_IDS)) {
        if (!event.exists(id)) {
            continue
        }
        event.get(id).remove()
        removedById = removedById + 1
    }

    const gt6 = clearGt6CraftingFor(blockedOutputs)

    console.info(
        `[NekoJS/EIO] 按 id 删除合成/加工配方 ${removedById}/${EXPLICIT_REMOVALS.length + MACHINE_RECIPE_IDS.length} 条；` +
        `另清 GT6 合成配方 ${gt6.crafting} 条、自动合成缓存 ${gt6.cached} 条。`
    )
})
