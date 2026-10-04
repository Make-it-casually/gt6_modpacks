
export const GT6_INGOT_MATERIALS = Object.freeze([

  {
    item: 'enderio:conductive_alloy_ingot',
    material: 'ConductiveIron',
    tagMaterial: 'ConductiveAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 4 = ConductiveIron；标签名为 conductive_alloy'
  },
  {
    item: 'enderio:dark_steel_ingot',
    material: 'ObsidianSteel',
    tagMaterial: 'DarkSteel',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 6 = ObsidianSteel，即 EnderIO 的 Dark Steel'
  },
  {
    item: 'enderio:end_steel_ingot',
    material: 'EndSteel',
    tagMaterial: 'EndSteel',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 8 = EndSteel，标签名同名'
  },
  {
    item: 'enderio:energetic_alloy_ingot',
    material: 'EnergeticAlloy',
    tagMaterial: 'EnergeticAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 1 = EnergeticAlloy，标签名同名'
  },
  {
    item: 'enderio:pulsating_alloy_ingot',
    material: 'PulsatingIron',
    tagMaterial: 'PulsatingAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 5 = PulsatingIron；标签名为 pulsating_alloy'
  },
  {
    item: 'enderio:redstone_alloy_ingot',
    material: 'RedstoneAlloy',
    tagMaterial: 'RedstoneAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 3 = RedstoneAlloy，标签名同名。注意 GT6 的入站例外表把 ' +
      'c:ingots/redstone_alloy 直接判成 RedAlloy（OreDictTags.sExceptions），所以桥那边会把它登记到 ' +
      'ingotRedAlloy；显式 ItemData 先写先赢，材料信息仍是 RedstoneAlloy'
  },
  {
    item: 'enderio:soularium_ingot',
    material: 'Soularium',
    tagMaterial: 'Soularium',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 7 = Soularium，标签名同名'
  },
  {
    item: 'enderio:vibrant_alloy_ingot',
    material: 'VibrantAlloy',
    tagMaterial: 'VibrantAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloy meta 2 = VibrantAlloy，标签名同名'
  },

  {
    item: 'enderio_endergy:crude_steel_ingot',
    material: 'CrudeSteel',
    tagMaterial: null,
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 0 = CrudeSteel；本 mod 未给物品打 c:ingots 标签'
  },
  {
    item: 'enderio_endergy:crystalline_alloy_ingot',
    material: 'CrystallineAlloy',
    tagMaterial: null,
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 1 = CrystallineAlloy；无 c: 标签'
  },
  {
    item: 'enderio_endergy:melodic_alloy_ingot',
    material: 'MelodicAlloy',
    tagMaterial: null,
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 2 = MelodicAlloy；无 c: 标签'
  },
  {
    item: 'enderio_endergy:stellar_alloy_ingot',
    material: 'StellarAlloy',
    tagMaterial: null,
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 3 = StellarAlloy；无 c: 标签'
  },
  {
    item: 'enderio_endergy:vivid_alloy_ingot',
    material: 'VividAlloy',
    tagMaterial: null,
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 6 = VividAlloy；无 c: 标签'
  },

  {
    item: 'enderio_evolution:crude_steel_ingot',
    material: 'CrudeSteel',
    tagMaterial: 'CrudeSteel',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 0 = CrudeSteel，标签名同名'
  },
  {
    item: 'enderio_evolution:crystalline_alloy_ingot',
    material: 'CrystallineAlloy',
    tagMaterial: 'CrystallineAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 1 = CrystallineAlloy，标签名同名'
  },
  {
    item: 'enderio_evolution:crystalline_pink_slime_ingot',
    material: 'CrystallinePinkSlime',
    tagMaterial: 'CrystallinePinkSlime',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 4 = CrystallinePinkSlime，标签名同名'
  },
  {
    item: 'enderio_evolution:energetic_silver_ingot',
    material: 'EnergeticSilver',
    tagMaterial: 'EnergeticSilver',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 5 = EnergeticSilver，标签名同名'
  },
  {
    item: 'enderio_evolution:melodic_alloy_ingot',
    material: 'MelodicAlloy',
    tagMaterial: 'MelodicAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 2 = MelodicAlloy，标签名同名'
  },
  {
    item: 'enderio_evolution:stellar_alloy_ingot',
    material: 'StellarAlloy',
    tagMaterial: 'StellarAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 3 = StellarAlloy，标签名同名'
  },
  {
    item: 'enderio_evolution:vivid_alloy_ingot',
    material: 'VividAlloy',
    tagMaterial: 'VividAlloy',
    confidence: 'verified',
    note: 'GT6 兼容表 itemAlloyEndergy meta 6 = VividAlloy，标签名同名'
  },
  {
    item: 'enderio_evolution:construction_alloy_ingot',
    material: 'Iron',
    tagMaterial: 'ConstructionAlloy',
    confidence: 'approx',
    note: 'GT6 无 ConstructionAlloy。原版配方=铜锭+粗钢锭+沙砾的低阶结构合金，按铁处理'
  },

  {
    item: 'stellaris:desh_ingot',
    material: 'Desh',
    tagMaterial: 'Desh',
    confidence: 'verified',
    note: 'GT6 自带同名材料 Desh（行星金属），标签名同名'
  },
  {
    item: 'stellaris:titanium_ingot',
    material: 'Titanium',
    tagMaterial: 'Titanium',
    confidence: 'verified',
    note: 'GT6 自带同名材料 Titanium，标签名同名'
  },
  {
    item: 'stellaris:novite_ingot',
    material: 'Steel',
    tagMaterial: 'Novite',
    confidence: 'approx',
    note: 'GT6 无 Novite。Stellaris 的 Novite 是基础结构金属（由 raw novite 熔炼），按钢处理'
  },

  {
    item: 'extendedcrafting:black_iron_ingot',
    material: 'DarkIron',
    tagMaterial: 'BlackIron',
    confidence: 'approx',
    note: 'GT6 无 BlackIron（原版配方=铁锭+黑色染料）。取名字最接近的 DarkIron；改 Iron 也可'
  },
  {
    item: 'extendedcrafting:redstone_ingot',
    material: 'RedstoneAlloy',
    tagMaterial: 'RedstoneIngot',
    confidence: 'approx',
    note: 'GT6 无 RedstoneIngot（原版配方=铁锭+红石粉），按 GT 的红石合金处理'
  },
  {
    item: 'extendedcrafting:enhanced_redstone_ingot',
    material: 'RedstoneAlloy',
    tagMaterial: 'EnhancedRedstoneIngot',
    confidence: 'approx',
    note: 'GT6 无 EnhancedRedstoneIngot，与 redstone_ingot 归为同一材料（它是更贵的升级件，不会被刷）'
  },
  {
    item: 'extendedcrafting:ender_ingot',
    material: 'Enderium',
    tagMaterial: 'EnderIngot',
    confidence: 'approx',
    note: 'GT6 无 EnderIngot（原版配方=铁锭+末影珍珠），取 GT 的末影金属 Enderium'
  },
  {
    item: 'extendedcrafting:enhanced_ender_ingot',
    material: 'Enderium',
    tagMaterial: 'EnhancedEnderIngot',
    confidence: 'approx',
    note: 'GT6 无 EnhancedEnderIngot，与 ender_ingot 归为同一材料（它是更贵的升级件，不会被刷）'
  },
  {
    item: 'extendedcrafting:crystaltine_ingot',
    material: 'CrystalMatrix',
    tagMaterial: 'Crystaltine',
    confidence: 'approx',
    note: 'GT6 无 Crystaltine。取同为"终局晶体金属"的 CrystalMatrix'
  },
  {
    item: 'extendedcrafting:the_ultimate_ingot',
    material: 'Ultimate',
    tagMaterial: 'TheUltimate',
    confidence: 'approx',
    note: 'GT6 有同名材料 Ultimate（MT.tier("Ultimate") 的分级材料，非同物质），仅名字对齐'
  },

  {
    item: 'extendedae:entro_ingot',
    material: 'InfusedEntropy',
    tagMaterial: 'InfusedEntro',
    confidence: 'approx',
    note: 'GT6 无 Entro。标签名 infused_entro，取名字最接近的 InfusedEntropy'
  },

  {
    item: 'mmcr:modularium',
    material: 'RedAlloy',
    tagMaterial: 'Modularium',
    confidence: 'approx',
    note: 'GT6 无 Modularium（原版配方=铁+红石+萤石+铜，用于机器外壳），按红石合金处理'
  },

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
