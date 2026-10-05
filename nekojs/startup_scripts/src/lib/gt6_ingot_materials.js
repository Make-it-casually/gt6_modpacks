export const GT6_INGOT_MATERIALS = Object.freeze([

  {
    item: 'witchery:koboldite_ingot',
    material: null,
    tagMaterial: null,
    autoMaterial: 'Koboldite',
    confidence: 'unknown',
    note: 'GT6 没有 Koboldite（Witchery 魔法金属，靠狗头人交易获得），按 GT 的未知材料登记'
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
