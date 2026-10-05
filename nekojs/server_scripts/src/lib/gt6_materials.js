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
  const fromStack = USE_STACK_INGREDIENTS ? ingredientFromStack(formKey, materialKey, count) : null
  if (fromStack !== null) {
    return fromStack
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

const USE_STACK_INGREDIENTS = false

function javaClass(name) {
  try {
    if (typeof Java === 'undefined' || Java.type === undefined) {
      return null
    }
    return Java.type(name)
  } catch (loadError) {
    return null
  }
}

const RUNTIME = (() => {
  const prefixes = javaClass('gregapi.data.OP')
  const materialClass = javaClass('gregapi.oredict.OreDictMaterial')
  const managerClass = javaClass('gregapi.oredict.OreDictManager')
  const stackClass = javaClass('net.minecraft.world.item.ItemStack')
  const opsClass = javaClass('com.mojang.serialization.JsonOps')
  if (prefixes == null || materialClass == null || managerClass == null || stackClass == null || opsClass == null) {
    return null
  }
  return { prefixes, materialClass, managerClass, stackClass, opsClass }
})()

let stackReported = false
const stackFormMisses = []

function stackToJson(formKey, materialName, count) {
  if (RUNTIME === null) {
    return null
  }
  try {
    const prefix = RUNTIME.prefixes[formKey]
    if (prefix == null) {
      if (stackFormMisses.indexOf(formKey) < 0) {
        stackFormMisses.push(formKey)
      }
      return null
    }
    const material = RUNTIME.materialClass.MATERIAL_MAP.get(materialName)
    if (material == null) {
      return null
    }
    const stack = RUNTIME.managerClass.INSTANCE.getStack(prefix, material, count)
    if (stack == null || stack.isEmpty()) {
      return null
    }
    const encoded = RUNTIME.stackClass.CODEC.encodeStart(RUNTIME.opsClass.INSTANCE, stack)
    const json = encoded.result().orElse(null)
    if (json == null) {
      return null
    }
    return JSON.parse(String(json))
  } catch (stackError) {
    console.warn(`[NekoJS/GT6] OreDictManager 取 ${String(formKey)}/${String(materialName)} 失败：${String(stackError)}`)
    return null
  }
}

function reportStackUse(formKey, materialName, json) {
  if (stackReported) {
    return
  }
  stackReported = true
  const components = json.components === undefined ? '无组件' : JSON.stringify(json.components)
  console.info(`[NekoJS/GT6] 原料由 OreDictManager 生成：${formKey}/${materialName} → ${String(json.id)}  组件=${components}` + (stackFormMisses.length > 0 ? `；这些形态 $OP 里没有（走静态表）：${stackFormMisses.join(', ')}` : ''))
}

function ingredientFromStack(formKey, materialKey, count) {
  const json = stackToJson(formKey, GT6_MATERIAL_NAME[materialKey], 1)
  if (json == null) {
    return null
  }
  const entry = {
    'neoforge:ingredient_type': 'neoforge:components',
    items: String(json.id)
  }
  if (json.components !== undefined) {
    entry.components = json.components
  }
  if (count !== undefined && count !== 1) {
    entry.count = count
  }
  reportStackUse(formKey, GT6_MATERIAL_NAME[materialKey], json)
  return entry
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
