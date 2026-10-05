
import { $BuiltInRegistries } from 'java:net/minecraft/core/registries/BuiltInRegistries'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'
import { $OP } from 'java:gregapi/data/OP'
import { GT_FORM, GT_MATERIAL, GT6_MATERIAL_NAME } from './lib/gt6_materials.js'

const TAG = '[NekoJS/GT6]'

function safe(label, fn) {
  try {
    const value = fn()
    return value == null ? `${label}=空` : String(value)
  } catch (error) {
    return `${label} 取不到：${String(error)}`
  }
}

function probe(formKey, materialKey) {
  const formId = GT_FORM[formKey]
  const materialName = GT6_MATERIAL_NAME[materialKey]
  const lines = []
  lines.push(`  形态 ${formKey} → id 静态表写作 ${formId}`)
  const manual = (() => {
    try {
      return Item.of(formId, 1)
    } catch (manualError) {
      return null
    }
  })()
  lines.push(`    Item.of('${formId}')：${manual == null ? '抛错' : (manual.isEmpty() ? '物品不存在' : safe('toString', () => manual))}`)
  const prefix = (() => {
    try {
      return $OP[formKey]
    } catch (opError) {
      return null
    }
  })()
  lines.push(`    $OP.${formKey}：${prefix == null ? '不存在' : safe('前缀名', () => prefix.mNameInternal)}`)
  const material = (() => {
    try {
      return $OreDictMaterial.MATERIAL_MAP.get(materialName)
    } catch (materialError) {
      return null
    }
  })()
  lines.push(`    材料 ${materialName}：${material == null ? '不存在' : `mID=${safe('mID', () => material.mID)}`}`)
  if (prefix != null && material != null) {
    const stack = (() => {
      try {
        return $OreDictManager.INSTANCE.getStack(prefix, material, 1)
      } catch (stackError) {
        return null
      }
    })()
    if (stack == null) {
      lines.push('    OreDictManager.getStack：返回空')
    } else {
      lines.push(`    getStack 真实 id：${safe('id', () => $BuiltInRegistries.ITEM.getKey(stack.getItem()))}`)
      lines.push(`    getStack 物品：${safe('toString', () => stack)}`)
      lines.push(`    getStack 组件：${safe('components', () => stack.getComponents())}`)
    }
  }
  return lines
}

console.info(`${TAG} 形态 id 探测开始（静态表 plate=${GT_FORM.plate}，steel mID=${GT_MATERIAL.steel}）`)
for (const pair of [['plate', 'steel'], ['ingot', 'iron'], ['gear', 'iron'], ['screw', 'steel']]) {
  for (const line of probe(pair[0], pair[1])) {
    console.info(`${TAG}${line}`)
  }
}
console.info(`${TAG} 形态 id 探测结束`)
