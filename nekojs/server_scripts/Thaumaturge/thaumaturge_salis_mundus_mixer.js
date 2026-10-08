import { addItemRecipe, item } from '../src/lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'
import { $TTAspects } from 'java:com/leclowndu93150/thaumaturge/api/aspect/TTAspects'
import { $EssentiaCrystalFactory } from 'java:com/leclowndu93150/thaumaturge/content/taint/item/EssentiaCrystalFactory'

const RECIPE_ID = 'thaumaturge:salis_mundus'
const MACHINE = 'Mixer'
const DURATION = 200
const EUT = 32
const SHARDS = 3

const ASPECT_KEYS = [
  { name: 'AER', key: $TTAspects.AER },
  { name: 'IGNIS', key: $TTAspects.IGNIS },
  { name: 'AQUA', key: $TTAspects.AQUA },
  { name: 'TERRA', key: $TTAspects.TERRA },
  { name: 'ORDO', key: $TTAspects.ORDO },
  { name: 'PERDITIO', key: $TTAspects.PERDITIO }
]

ServerEvents.recipes(event => {
  try {
    event.get(RECIPE_ID).remove()
  } catch (error) {
    console.warn('[NekoJS/ThaumaturgeSalis] 删除原配方失败：' + String(error))
  }
})

ServerEvents.started(event => {
  const problems = []
  const map = $RM[MACHINE]
  if (map == null) {
    console.warn('[NekoJS/ThaumaturgeSalis] 取不到机器映射 ' + MACHINE + '，未做任何改动。')
    return
  }

  let server = null
  try {
    server = event.getServer()
  } catch (error) {
    server = null
  }
  if (server == null) {
    try {
      server = Java.type('net.neoforged.neoforge.server.ServerLifecycleHooks').getCurrentServer()
    } catch (error) {
      problems.push('取服务端实例失败：' + String(error))
    }
  }
  if (server == null) {
    console.warn('[NekoJS/ThaumaturgeSalis] 取不到服务端实例，未新增配方。')
    return
  }

  let provider = null
  try {
    provider = server.registryAccess()
  } catch (error) {
    console.warn('[NekoJS/ThaumaturgeSalis] 取注册表失败：' + String(error))
    return
  }

  const crystals = []
  for (let aspectIndex = 0; aspectIndex < ASPECT_KEYS.length; aspectIndex++) {
    const aspect = ASPECT_KEYS[aspectIndex]
    try {
      const stack = $EssentiaCrystalFactory.of(provider, aspect.key)
      if (stack == null || stack.isEmpty()) {
        problems.push(aspect.name + '：结晶构造返回空')
        continue
      }
      crystals.push({ name: aspect.name, stack: stack })
    } catch (error) {
      problems.push(aspect.name + '：' + String(error))
    }
  }

  let added = 0
  let skipped = 0
  for (let firstIndex = 0; firstIndex < crystals.length; firstIndex++) {
    for (let secondIndex = firstIndex; secondIndex < crystals.length; secondIndex++) {
      for (let thirdIndex = secondIndex; thirdIndex < crystals.length; thirdIndex++) {
        try {
          addItemRecipe(MACHINE, {
            itemInputs: [
              item('minecraft:redstone', 1),
              crystals[firstIndex].stack,
              crystals[secondIndex].stack,
              crystals[thirdIndex].stack
            ],
            itemOutputs: [item('thaumaturge:salis_mundus', 1)],
            duration: DURATION,
            eut: EUT,
            checkForCollisions: false
          })
          added = added + 1
        } catch (error) {
          skipped = skipped + 1
          if (problems.length < 6) {
            problems.push(crystals[firstIndex].name + '+' + crystals[secondIndex].name + '+' + crystals[thirdIndex].name + '：' + String(error))
          }
        }
      }
    }
  }

  console.info('[NekoJS/ThaumaturgeSalis] 世界盐改由红石 + 任意 ' + SHARDS + ' 个魔力碎片制作：结晶 ' + crystals.length + '/' + ASPECT_KEYS.length + ' 种，新增配方 ' + added + ' 条，被拒 ' + skipped + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeSalis] 未完成：' + problems.join(' | '))
  }
})
