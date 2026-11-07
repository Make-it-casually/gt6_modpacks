// 其他 mod 的锭 → GT6 材料登记表。
// 由 startup_scripts/src/gt6_ingot_materials.js 在启动时读取：
//   - item + material：给该物品写入 OreDictItemData(ingot, material)，让 GT6 机器/配方识别它；
//   - tagMaterial：给 GT6 的 MATERIAL_MAP 注册一个材料别名，使 c:ingots/<tagMaterial 的 snake_case>
//     这类标签被 GT6 的词条桥接识别（别名先于物品数据写入，标签导入时就能命中）。
// subtype：游戏内 /nekojs hand 读到的 gregtech:gt.meta.ingot 的 gregapi:subtype 值，
// 仅作登记依据备注；GT6 材料 ID 以运行时为准，material 按材料名查找。
export const GT6_INGOT_MATERIALS = Object.freeze([

  {
    item: 'enderio:conductive_alloy_ingot',
    material: 'PulsatingIron',
    subtype: 8725,
    tagMaterial: 'ConductiveAlloy',
    confidence: 'verified',
    note: '游戏内实测对应 gt.meta.ingot 8725（GT6 材料 PulsatingIron）；EIO 的 c: 标签为 conductive_alloy'
  },
  {
    item: 'enderio:pulsating_alloy_ingot',
    material: 'ConductiveIron',
    subtype: 8727,
    tagMaterial: 'PulsatingAlloy',
    confidence: 'verified',
    note: '游戏内实测对应 gt.meta.ingot 8727（GT6 材料 ConductiveIron）；EIO 的 c: 标签为 pulsating_alloy'
  }
])

export function gt6MaterialAliases() {
  const list = []
  for (const aliasEntry of GT6_INGOT_MATERIALS) {
    if (aliasEntry.tagMaterial === null || aliasEntry.tagMaterial === undefined) continue
    if (aliasEntry.material === null || aliasEntry.tagMaterial === aliasEntry.material) continue
    list.push([aliasEntry.tagMaterial, aliasEntry.material])
  }
  return list
}

export function itemIdList() {
  return GT6_INGOT_MATERIALS.map(mappedEntry => mappedEntry.item)
}
