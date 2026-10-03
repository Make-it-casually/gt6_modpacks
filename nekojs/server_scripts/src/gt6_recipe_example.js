import {
  addFluidRecipe,
  addItemRecipe,
  addMixedRecipe,
  addRecipe,
  fluid,
  item
} from './lib/gt6_recipe_tools.js'
import { $RM } from 'java:gregapi/data'

/***
ServerEvents.recipes(() => {
  const registrationKey = 'gt6RecipeExamplesRegisteredV2'
  if (global[registrationKey] === true) {
    console.info('[NekoJS/GT6] Machine recipe examples were already registered; skipping duplicates.')
    return
  }

  // 示例一 | 机器：Crusher（粉碎机）| 配方类型：物品输入 -> 物品输出。
  // 配方：1 个鹦鹉螺壳 -> 2 个海晶碎片。使用不常见输入以避开 GT6 已有矿物处理配方。
  const itemRecipe = addItemRecipe($RM.Crusher, {
    itemInputs: [item('minecraft:nautilus_shell')],
    itemOutputs: [item('minecraft:prismarine_shard', 2)],
    duration: 100,
    eut: 16
  })

  // 示例二 | 机器：Distillation Tower（蒸馏塔）| 配方类型：流体输入 -> 流体输出。
  // 配方：1000 mB 光谱露水 -> 1000 mB GT6/IC2 蒸馏水。
  const fluidRecipe = addFluidRecipe($RM.DistillationTower, {
    fluidInputs: [fluid('spectral_dew', 1000)],
    fluidOutputs: [fluid('ic2distilledwater', 1000)],
    duration: 200,
    eut: 16
  })

  // 示例三 | 机器：Bath（流体浴槽）| 配方类型：物品 + 流体输入 -> 物品输出。
  // 配方：用 100 mB 光谱露水处理 1 个鹦鹉螺壳，得到 1 个海晶碎片。
  const mixedRecipe = addMixedRecipe($RM.Bath, {
    itemInputs: [item('minecraft:nautilus_shell')],
    fluidInputs: [fluid('spectral_dew', 100)],
    itemOutputs: [item('minecraft:prismarine_shard')],
    duration: 100,
    eut: 0
  })

  // 示例四 | 机器：Distillation Tower（蒸馏塔）| 配方类型：物品 + 流体输入 -> 物品 + 流体输出。
  // 通用 addRecipe 可组合两类输入/输出；本例中海晶碎片副产物的概率为 25%。
  const combinedRecipe = addRecipe($RM.DistillationTower, {
    itemInputs: [item('minecraft:nautilus_shell')],
    fluidInputs: [fluid('lava', 250)],
    itemOutputs: [item('minecraft:prismarine_shard')],
    fluidOutputs: [fluid('ic2distilledwater', 100)],
    duration: 120,
    eut: 0,
    chances: [2500]
  })

  global[registrationKey] = true
  console.info(
    `[NekoJS/GT6] Registered four machine recipes: ` +
    `${$RM.Crusher.mNameInternal} (${itemRecipe.mDuration} ticks), ` +
    `${$RM.DistillationTower.mNameInternal} fluid-only (${fluidRecipe.mDuration} ticks), ` +
    `${$RM.Bath.mNameInternal} item+fluid (${mixedRecipe.mDuration} ticks), ` +
    `${$RM.DistillationTower.mNameInternal} mixed I/O (${combinedRecipe.mDuration} ticks).`
  )
})

// duration 单位是 tick；eut 是每 tick 的能耗。
// fluid(id, amount) 的 amount 单位是 mB，省略时默认 1000 mB。
// chances 和 itemOutputs 一一对应，范围为 0..10000；10000 表示必定产出。
// 每个例子都会实际注册配方。如不需要某种示例，请删除对应调用后再加载脚本。

***/