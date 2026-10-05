
export const GT_MATERIAL = Object.freeze({
  iron: 260,
  copper: 290,
  tin: 500,
  lead: 820,
  gold: 790,
  silver: 470,
  nickel: 280,
  zinc: 300,
  aluminium: 130,
  bronze: 8610,
  brass: 8620,
  steel: 8630,
  stainlesssteel: 8636,
  galvanizedsteel: 8651,
  tungstensteel: 8635,
  titanium: 220,
  tungsten: 740,
  platinum: 780,
  uranium: 920,
  niobiumtitanium: 8689,
  redalloy: 8660,
  silicon: 140,
  diamond: 8300,
  emerald: 8301,
  coal: 8334,
  lapis: 8332,
  obsidian: 8214,
  redstone: 8333,
  glowstone: 8341,
  enderpearl: 8318,
  rubber: 8217,
  plastic: 8218,
  netherquartz: 8346,
  certusquartz: 8347,
  chargedcertusquartz: 8348,
  fluix: 8389
})

export const GT_FORM = Object.freeze({
  plate: 'gregtech:gt.meta.plate',
  plateCurved: 'gregtech:gt.meta.platecurved',
  plateDouble: 'gregtech:gt.meta.platedouble',
  plateDense: 'gregtech:gt.meta.platedense',
  plateGem: 'gregtech:gt.meta.plategem',
  plateGemTiny: 'gregtech:gt.meta.plategemtiny',
  screw: 'gregtech:gt.meta.screw',
  bolt: 'gregtech:gt.meta.bolt',
  ring: 'gregtech:gt.meta.ring',
  stick: 'gregtech:gt.meta.stick',
  stickLong: 'gregtech:gt.meta.sticklong',
  foil: 'gregtech:gt.meta.foil',
  gear: 'gregtech:gt.meta.geargt',
  gearSmall: 'gregtech:gt.meta.geargtsmall',
  dust: 'gregtech:gt.meta.dust',
  dustSmall: 'gregtech:gt.meta.dustsmall',
  ingot: 'gregtech:gt.meta.ingot',
  gem: 'gregtech:gt.meta.gem',
  casingSmall: 'gregtech:gt.meta.casingsmall',
  wire: 'gregtech:gt.meta.wirefine'
})

export const GT_BLOCK = Object.freeze({
  machineCasing: 'gregtech:gt.meta.machine',
  machineCasingDense: 'gregtech:gt.meta.machine.dense',
  machineCasingDouble: 'gregtech:gt.meta.machine.double',
  machineCasingQuadruple: 'gregtech:gt.meta.machine.quadruple'
})

export function gtItemJson(id, subtype, count) {
  const stack = {
    id: id,
    components: { 'gregapi:subtype': subtype }
  }
  if (count !== undefined && count !== 1) {
    stack.count = count
  }
  return stack
}

export function gtIngredient(formOrBlockId, material, count) {
  const entry = {
    'neoforge:ingredient_type': 'neoforge:components',
    items: formOrBlockId,
    components: { 'gregapi:subtype': material }
  }
  if (count !== undefined && count !== 1) {
    entry.count = count
  }
  return entry
}

export function gt(formKey, materialKey, count) {
  const form = GT_FORM[formKey]
  if (form === undefined) {
    throw new Error(`Unknown GT6 form: ${String(formKey)}`)
  }
  return gtIngredient(form, resolveMaterial(materialKey), count)
}

export function gtBlock(blockKey, materialKey, count) {
  const id = GT_BLOCK[blockKey]
  if (id === undefined) {
    throw new Error(`Unknown GT6 block: ${String(blockKey)}`)
  }
  return gtIngredient(id, resolveMaterial(materialKey), count)
}

export function tag(name) {
  return '#' + name
}

export const GT6_MATERIAL_NAME = Object.freeze({
  iron: 'Iron',
  copper: 'Copper',
  tin: 'Tin',
  lead: 'Lead',
  gold: 'Gold',
  silver: 'Silver',
  nickel: 'Nickel',
  zinc: 'Zinc',
  aluminium: 'Aluminium',
  bronze: 'Bronze',
  brass: 'Brass',
  steel: 'Steel',
  stainlesssteel: 'StainlessSteel',
  galvanizedsteel: 'GalvanizedSteel',
  tungstensteel: 'TungstenSteel',
  titanium: 'Titanium',
  tungsten: 'Tungsten',
  platinum: 'Platinum',
  uranium: 'Uranium',
  niobiumtitanium: 'NiobiumTitanium',
  redalloy: 'RedAlloy',
  silicon: 'Silicon',
  diamond: 'Diamond',
  emerald: 'Emerald',
  coal: 'Coal',
  lapis: 'Lapis',
  obsidian: 'Obsidian',
  redstone: 'Redstone',
  glowstone: 'Glowstone',
  enderpearl: 'EnderPearl',
  rubber: 'Rubber',
  plastic: 'Plastic',
  netherquartz: 'NetherQuartz',
  certusquartz: 'CertusQuartz',
  chargedcertusquartz: 'ChargedCertusQuartz',
  fluix: 'Fluix'
})

function loadOreDictMaterial() {
  try {
    if (typeof Java === 'undefined' || Java.type === undefined) {
      return null
    }
    return Java.type('gregapi.oredict.OreDictMaterial')
  } catch (loadError) {
    return null
  }
}

const RUNTIME_IDS = (() => {
  const out = {}
  const material = loadOreDictMaterial()
  if (material === null) {
    return out
  }
  for (const key of Object.keys(GT_MATERIAL)) {
    try {
      const found = material.get(GT6_MATERIAL_NAME[key], null)
      if (found != null && found.mID !== undefined) {
        out[key] = found.mID
      }
    } catch (lookupError) {
      continue
    }
  }
  return out
})()

let reported = false

function reportRuntimeIds() {
  if (reported) {
    return
  }
  reported = true
  const keys = Object.keys(RUNTIME_IDS)
  if (keys.length === 0) {
    console.warn('[NekoJS/GT6] 材料号运行时解析不可用，使用静态表。')
    return
  }
  const changed = keys.filter(key => RUNTIME_IDS[key] !== GT_MATERIAL[key])
  console.info(`[NekoJS/GT6] 材料号运行时解析 ${keys.length}/${Object.keys(GT_MATERIAL).length} 个` + (changed.length > 0 ? `；与静态表不同 ${changed.length} 个：` + changed.map(key => `${key} ${GT_MATERIAL[key]}→${RUNTIME_IDS[key]}`).join('，') : '；与静态表完全一致'))
}

export function resolveMaterial(material) {
  if (typeof material === 'number') {
    return material
  }
  const key = String(material).toLowerCase()
  const id = GT_MATERIAL[key]
  if (id === undefined) {
    throw new Error(`Unknown GT6 material: ${String(material)}`)
  }
  reportRuntimeIds()
  const runtime = RUNTIME_IDS[key]
  if (runtime !== undefined) {
    return runtime
  }
  return id
}
