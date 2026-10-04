
import { $RM } from 'java:gregapi/data'

const DEFAULT_CAP = 600

const LARGE_CAP = 2400

const PER_MAP_CAP = {
  Crusher: 100,
  Shredder: 100,
  Sifting: 100,
  Sluice: 100,
  Mortar: 100,
  Hammer: 100,
  Anvil: 100,
  AnvilBendSmall: 100,
  AnvilBendBig: 200,
  Compressor: 200,
  Lathe: 200,
  Wiremill: 200,
  Cutter: 200,
  Extruder: 200,
  RollingMill: 200,
  RollBender: 200,
  RollFormer: 200,
  ClusterMill: 200,
  Polarizer: 200,
  Welder: 200,
  Slicer: 200,
  Juicer: 100,
  LaserEngraver: 300,
  Roasting: 400,
  Calciner: 400,
}

const LARGE_MAPS = [
  'Fusion',
  'DistillationTower',
  'CryoDistillationTower',
  'SteamCracking',
  'CatalyticCracking',
  'Massfab',
  'Nanofab',
  'Replicator',
  'ScannerMolecular',
  'ScannerVisuals',
  'ImplosionCompressor',
  'Autoclave',
  'CrystallisationCrucible',
  'CrucibleAlloying',
  'CrucibleSmelting',
  'BedrockOreList',
  'ByProductList',
]

const MAP_NAMES = [
  'Anvil', 'AnvilBendBig', 'AnvilBendSmall', 'Assembler', 'Autoclave', 'Autocrafter',
  'Bath', 'BedrockOreList', 'BlastFurnace', 'Boxinator', 'Bumblelyzer', 'BumbleQueens',
  'BurnMixer', 'ByProductList', 'Calciner', 'Canner', 'CatalyticCracking', 'Centrifuge',
  'Chisel', 'ClusterMill', 'CNC', 'Coagulator', 'CokeOven', 'Compressor',
  'Cooking', 'CrucibleAlloying', 'CrucibleSmelting', 'Crusher', 'CryoDistillationTower', 'CryoMixer',
  'CrystallisationCrucible', 'Cutter', 'Debarker', 'DidYouKnow', 'DistillationTower', 'Distillery',
  'Drying', 'Electrolyzer', 'Extruder', 'Fermenter', 'Freezer', 'Furnace',
  'Fusion', 'Generifier', 'Hammer', 'HeatMixer', 'ImplosionCompressor', 'Injector',
  'Juicer', 'Laminator', 'LaserEngraver', 'Lathe', 'Lightning', 'Loom',
  'MagneticSeparator', 'Massfab', 'Melter', 'Microwave', 'Mixer', 'Mortar',
  'Nanofab', 'Other', 'Plantalyzer', 'Polarizer', 'Press', 'PressureWasher',
  'Printer', 'Replicator', 'Roasting', 'RollBender', 'RollFormer', 'RollingMill',
  'ScannerMolecular', 'ScannerVisuals', 'Sharpening', 'Shredder', 'Sifting', 'Slicer',
  'Sluice', 'Smelter', 'Squeezer', 'SteamCracking', 'ToolHeads', 'Trees',
  'Unboxinator', 'VacuumFreezer', 'Welder', 'Wiremill',
]

function capFor(mapName) {
  if (PER_MAP_CAP[mapName] !== undefined) {
    return PER_MAP_CAP[mapName]
  }
  if (LARGE_MAPS.indexOf(mapName) >= 0) {
    return LARGE_CAP
  }
  return DEFAULT_CAP
}

function capMap(mapName) {
  const map = $RM[mapName]
  if (map == null || map.mRecipeList == null) {
    return [0, 0]
  }
  const cap = capFor(mapName)
  let checked = 0
  let capped = 0
  const iterator = map.mRecipeList.iterator()
  while (iterator.hasNext()) {
    const recipe = iterator.next()
    if (recipe == null || !recipe.mEnabled || recipe.mDuration <= 0) {
      continue
    }
    checked = checked + 1
    if (recipe.mDuration > cap) {
      recipe.mDuration = cap
      capped = capped + 1
    }
  }
  return [checked, capped]
}

ServerEvents.started(() => {
  let mapsTouched = 0
  let totalChecked = 0
  let totalCapped = 0
  const pendingHandlers = []
  for (const mapName of MAP_NAMES) {
    const result = capMap(mapName)
    totalChecked = totalChecked + result[0]
    totalCapped = totalCapped + result[1]
    if (result[1] > 0) {
      mapsTouched = mapsTouched + 1
    }
    const map = $RM[mapName]
    if (map != null && map.mRecipeMapHandlers != null && map.mRecipeMapHandlers.size() > 0) {
      pendingHandlers.push(mapName + '(' + map.mRecipeMapHandlers.size() + ')')
    }
  }
  console.info(
    '[NekoJS/GT6] 配方耗时上限：检查 ' + MAP_NAMES.length + ' 张表 / ' + totalChecked + ' 条配方，' +
    '压上限 ' + totalCapped + ' 条（涉及 ' + mapsTouched + ' 张表；小机器 100 tick、默认 ' + DEFAULT_CAP + '、大型 ' + LARGE_CAP + '）。'
  )
  if (pendingHandlers.length > 0) {
    console.warn('[NekoJS/GT6] 这些表的动态 handler 之后还会生成配方，本轮没压到：' + pendingHandlers.join('、'))
  }
})
