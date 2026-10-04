import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'

const problems = []
const mapCounter = {}
let registered = 0

function addSafely(map, spec) {
  const mapName = map.mNameInternal
  mapCounter[mapName] = (mapCounter[mapName] === undefined ? 1 : mapCounter[mapName] + 1)
  const label = `${mapName}#${mapCounter[mapName]}`
  try {
    const result = addItemRecipe(map, spec)
    registered = registered + 1
    return result
  } catch (addError) {
    const message = addError != null && addError.message !== undefined ? addError.message : String(addError)
    problems.push(`${label}：${message}`)
    return null
  }
}

ServerEvents.recipes(() => {
  const registrationKey = 'gt6PackRecipesRegisteredV1'
  if (global[registrationKey] === true) {
    console.info('[NekoJS/GT6] 包内 GT6 配方已注册过，跳过重复注册。')
    return
  }

  const grassSeeds = addSafely($RM.Sifting, {
    itemInputs: [item('minecraft:short_grass', 1)],
    itemOutputs: [
      item('minecraft:wheat_seeds', 1),
      item('croptopia:barley_seed', 1),
      item('croptopia:oat_seed', 1),
      item('croptopia:rice_seed', 1)
    ],
    chances: [5000, 1200, 1200, 1200],
    duration: 40,
    eut: 0
  })

  const fernSeeds = addSafely($RM.Sifting, {
    itemInputs: [item('minecraft:fern', 1)],
    itemOutputs: [
      item('croptopia:lettuce_seed', 1),
      item('croptopia:onion_seed', 1),
      item('croptopia:cabbage_seed', 1),
      item('croptopia:tomato_seed', 1)
    ],
    chances: [900, 900, 900, 900],
    duration: 40,
    eut: 0
  })

  const tallFernSeeds = addSafely($RM.Sifting, {
    itemInputs: [item('minecraft:large_fern', 1)],
    itemOutputs: [
      item('croptopia:broccoli_seed', 1),
      item('croptopia:cauliflower_seed', 1),
      item('croptopia:garlic_seed', 1),
      item('croptopia:greenonion_seed', 1)
    ],
    chances: [1100, 1100, 1100, 1100],
    duration: 40,
    eut: 0
  })

  const leafBerries = addSafely($RM.Sifting, {
    itemInputs: [item('minecraft:oak_leaves', 1)],
    itemOutputs: [
      item('croptopia:blackberry_seed', 1),
      item('croptopia:blueberry_seed', 1),
      item('croptopia:raspberry_seed', 1),
      item('croptopia:strawberry_seed', 1)
    ],
    chances: [700, 700, 700, 700],
    duration: 30,
    eut: 0
  })

  const tropicalLeaves = addSafely($RM.Sifting, {
    itemInputs: [item('minecraft:jungle_leaves', 1)],
    itemOutputs: [
      item('croptopia:coffee_seed', 1),
      item('croptopia:tea_seed', 1),
      item('croptopia:pineapple_seed', 1),
      item('croptopia:kiwi_seed', 1)
    ],
    chances: [600, 600, 600, 600],
    duration: 30,
    eut: 0
  })

  const gravelSeeds = addSafely($RM.Sluice, {
    itemInputs: [item('minecraft:gravel', 1)],
    itemOutputs: [
      item('minecraft:wheat_seeds', 1),
      item('minecraft:beetroot_seeds', 1)
    ],
    chances: [2000, 800],
    duration: 60,
    eut: 0
  })

  const sandSeeds = addSafely($RM.Sluice, {
    itemInputs: [item('minecraft:sand', 1)],
    itemOutputs: [
      item('croptopia:corn_seed', 1),
      item('croptopia:peanut_seed', 1)
    ],
    chances: [800, 800],
    duration: 60,
    eut: 0
  })

  const fermenterDrinks = [
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:phantom_membrane', 1),
        item('minecraft:chorus_fruit', 1)
      ],
      itemOutputs: [item('alcocraftplus:chorus_ale', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:glow_lichen', 1),
        item('minecraft:diamond', 1)
      ],
      itemOutputs: [item('alcocraftplus:digger_bitter', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:prismarine_crystals', 1),
        item('minecraft:prismarine_shard', 1)
      ],
      itemOutputs: [item('alcocraftplus:drowned_ale', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:snowball', 1),
        item('minecraft:packed_ice', 1)
      ],
      itemOutputs: [item('alcocraftplus:ice_beer', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('minecraft:sugar', 1),
        item('minecraft:apple', 1),
        item('minecraft:honeycomb', 1),
        item('minecraft:bread', 1)
      ],
      itemOutputs: [item('alcocraftplus:kvass', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:emerald', 1),
        item('minecraft:rabbit_foot', 1)
      ],
      itemOutputs: [item('alcocraftplus:leprechaun_cider', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:iron_nugget', 1),
        item('minecraft:redstone', 1)
      ],
      itemOutputs: [item('alcocraftplus:magnet_pilsner', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:gold_nugget', 1),
        item('minecraft:blaze_powder', 1)
      ],
      itemOutputs: [item('alcocraftplus:nether_porter', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:charcoal', 1),
        item('minecraft:phantom_membrane', 1)
      ],
      itemOutputs: [item('alcocraftplus:night_rauch', 1)],
      duration: 200,
      eut: 0
    }),
    addSafely($RM.Fermenter, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:sunflower', 1),
        item('minecraft:glistering_melon_slice', 1)
      ],
      itemOutputs: [item('alcocraftplus:sun_pale_ale', 1)],
      duration: 200,
      eut: 0
    })
  ]

  const distilledDrinks = [
    addSafely($RM.Distillery, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:diamond', 1),
        item('minecraft:nether_star', 1)
      ],
      itemOutputs: [item('alcocraftplus:nether_star_lager', 1)],
      duration: 400,
      eut: 0
    }),
    addSafely($RM.Distillery, {

      itemInputs: [ item('alcocraftplus:hop', 1),
        item('alcocraftplus:dry_seeds', 1),
        item('minecraft:nether_wart', 1),
        item('minecraft:wither_skeleton_skull', 1)
      ],
      itemOutputs: [item('alcocraftplus:wither_stout', 1)],
      duration: 400,
      eut: 0
    })
  ]

  global[registrationKey] = true
  console.info(
    `[NekoJS/GT6] 注册包内 GT6 配方 ${registered}/${7 + fermenterDrinks.length + distilledDrinks.length} 条：` +
    `Sifting/Sluice 种子（#8 种子 + #17 概率副产）、` +
    `Fermenter ${fermenterDrinks.length} 条 + Distillery ${distilledDrinks.length} 条酒（#10 AlcoCraft 接入 GT6）；` +
    `赛特斯/fluix 保持纯 AE2 链（#5 已撤销）；` +
    `失败 ${problems.length} 条${problems.length > 0 ? '：' + problems.join(' | ') : '。'}`
  )
})
