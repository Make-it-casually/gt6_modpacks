
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'
import { $OP } from 'java:gregapi/data/OP'

export function gtStack(formKey, materialName, count) {
  const prefix = $OP[formKey]
  if (prefix == null) {
    throw new Error(`GT6 没有这个形态：${String(formKey)}`)
  }
  const material = $OreDictMaterial.MATERIAL_MAP.get(materialName)
  if (material == null) {
    throw new Error(`GT6 没有这个材料：${String(materialName)}`)
  }
  const amount = count === undefined ? 1 : count
  const stack = $OreDictManager.INSTANCE.getStack(prefix, material, amount)
  if (stack == null || stack.isEmpty()) {
    throw new Error(`GT6 取不到物品：${String(formKey)} / ${String(materialName)}`)
  }
  return stack
}

export const gtDust = (materialName, count) => gtStack('dust', materialName, count)
export const gtIngot = (materialName, count) => gtStack('ingot', materialName, count)
export const gtGem = (materialName, count) => gtStack('gem', materialName, count)
export const gtPlate = (materialName, count) => gtStack('plate', materialName, count)
export const gtGear = (materialName, count) => gtStack('gear', materialName, count)
export const gtScrew = (materialName, count) => gtStack('screw', materialName, count)
