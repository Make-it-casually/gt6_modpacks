
import { clearGt6CraftingFor } from '../src/lib/gt6_cleanup.js'

const SEAL = false

const MACHINE_RECIPE_TYPES = [
    'stellaris:blending',
    'stellaris:electrolyze',
    'stellaris:fuel_refinery',
    'stellaris:vaccine'
]

const MACHINE_OUTPUTS = [

    'stellaris:coal_generator',
    'stellaris:diesel_generator',
    'stellaris:solar_panel',
    'stellaris:star_light_panel',
    'stellaris:power_bank_t1',

    'stellaris:cable_t1',
    'stellaris:pipe_t1',
    'stellaris:fluid_tank_t1',
    'stellaris:cargo_unloader',

    'stellaris:fuel_refinery',
    'stellaris:electrolyzer',
    'stellaris:blender',
    'stellaris:pumpjack',
    'stellaris:water_pump',
    'stellaris:vacuumator',
    'stellaris:oil_finder',
    'stellaris:laboratory',
    'stellaris:space_farm',

    'stellaris:oxygen_distributor',
    'stellaris:oxygen_propagator',
    'stellaris:gravity_manipulator'
]

const SPACE_LINE_RECIPE_TYPES = ['stellaris:rocket_station']

const SPACE_LINE_OUTPUTS = [
    'stellaris:rocket_launch_pad',
    'stellaris:engineering_station',
    'stellaris:antenna',
    'stellaris:rover',
    'stellaris:tablet',
    'stellaris:sd_card',
    'stellaris:engine_fan',
    'stellaris:hydrogen_motor'
]

ServerEvents.recipes(event => {
    if (!SEAL) {

        console.info(
            `[NekoJS/Stellaris] 接入模式：机器与加工链保留（${MACHINE_OUTPUTS.length} 台机器 + 太空线 ` +
            `${SPACE_LINE_OUTPUTS.length} 件）；GT6 门槛见 stellaris_reforge.js（不锈钢/钨钢机壳 + GT6 钛板/钢板）。`
        )
        return
    }

    const types = MACHINE_RECIPE_TYPES.concat(SPACE_LINE_RECIPE_TYPES)
    const outputs = MACHINE_OUTPUTS.concat(SPACE_LINE_OUTPUTS)

    const byType = types.reduce((total, type) => total + event.count({ type: type }), 0)
    const byOutput = outputs.reduce((total, output) => total + event.count({ output: output }), 0)

    for (const type of types) {
        event.remove({ type: type })
    }
    for (const output of outputs) {
        event.remove({ output: output })
    }

    const gt6 = clearGt6CraftingFor(outputs)

    console.info(
        `[NekoJS/Stellaris] 封存模式：命中 ${byType} 条类型配方 + ${byOutput} 条产物配方；` +
        `另清 GT6 合成配方 ${gt6.crafting} 条、自动合成缓存 ${gt6.cached} 条。`
    )
})
