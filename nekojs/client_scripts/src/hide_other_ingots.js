const HIDDEN = [
  'enderio:conductive_alloy_ingot',
  'enderio:dark_steel_ingot',
  'enderio:end_steel_ingot',
  'enderio:energetic_alloy_ingot',
  'enderio:pulsating_alloy_ingot',
  'enderio:redstone_alloy_ingot',
  'enderio:soularium_ingot',
  'enderio:vibrant_alloy_ingot',
  'enderio_endergy:crude_steel_ingot',
  'enderio_endergy:crystalline_alloy_ingot',
  'enderio_endergy:melodic_alloy_ingot',
  'enderio_endergy:stellar_alloy_ingot',
  'enderio_endergy:vivid_alloy_ingot',
  'enderio_evolution:construction_alloy_ingot',
  'enderio_evolution:crude_steel_ingot',
  'enderio_evolution:crystalline_alloy_ingot',
  'enderio_evolution:crystalline_pink_slime_ingot',
  'enderio_evolution:energetic_silver_ingot',
  'enderio_evolution:melodic_alloy_ingot',
  'enderio_evolution:stellar_alloy_ingot',
  'enderio_evolution:vivid_alloy_ingot',
  'extendedae:entro_ingot',
  'extendedcrafting:black_iron_ingot',
  'extendedcrafting:redstone_ingot',
  'extendedcrafting:enhanced_redstone_ingot',
  'extendedcrafting:ender_ingot',
  'extendedcrafting:enhanced_ender_ingot',
  'extendedcrafting:crystaltine_ingot',
  'extendedcrafting:the_ultimate_ingot',
  'mmcr:modularium',
  'railcraft:brass_ingot',
  'railcraft:bronze_ingot',
  'railcraft:invar_ingot',
  'railcraft:lead_ingot',
  'railcraft:nickel_ingot',
  'railcraft:silver_ingot',
  'railcraft:steel_ingot',
  'railcraft:tin_ingot',
  'railcraft:zinc_ingot',
  'witchery:koboldite_ingot',
  'railcraft:brass_plate',
  'railcraft:bronze_plate',
  'railcraft:copper_plate',
  'railcraft:gold_plate',
  'railcraft:invar_plate',
  'railcraft:iron_plate',
  'railcraft:lead_plate',
  'railcraft:nickel_plate',
  'railcraft:silver_plate',
  'railcraft:steel_plate',
  'railcraft:tin_plate',
  'railcraft:zinc_plate',
]

RecipeViewerEvents.removeEntries('item', event => {
  let hidden = 0
  const failed = []
  for (const id of HIDDEN) {
    try {
      event.add(Item.of(id))
      hidden = hidden + 1
    } catch (stackError) {
      try {
        event.add(id)
        hidden = hidden + 1
      } catch (idError) {
        failed.push(id)
      }
    }
  }
  console.info('[NekoJS/GT6] JEI 隐藏其他模组锭 ' + hidden + '/' + HIDDEN.length + ' 个' + (failed.length > 0 ? '；失败：' + failed.join(', ') : '') + '。')
})
