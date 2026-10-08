import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'
import { $OreDictItemData } from 'java:gregapi/oredict/OreDictItemData'
import { $OP } from 'java:gregapi/data/OP'

const PREFIX_BY_NAME = {
  gem: $OP.gem,
  oreRaw: $OP.oreRaw,
  log: $OP.log,
  plank: $OP.plank,
  nugget: $OP.nugget
}

const REGISTRATIONS = [
  { item: 'thaumaturge:quicksilver', prefix: 'gem', material: 800, name: 'Mercury' },
  { item: 'thaumaturge:nugget_quicksilver', prefix: 'nugget', material: 800, name: 'Mercury' },
  { item: 'thaumaturge:amber', prefix: 'gem', material: 8310, name: 'Amber' },
  { item: 'thaumaturge:raw_cinnabar', prefix: 'oreRaw', material: 9114, name: 'Cinnabar' },
  { item: 'thaumaturge:cluster_cinnabar', prefix: 'oreRaw', material: 9114, name: 'Cinnabar' },
  { item: 'thaumaturge:nugget_quartz', prefix: 'nugget', material: 8346, name: 'NetherQuartz' },
  { item: 'thaumaturge:log_greatwood', prefix: 'log', material: 8296, name: 'Greatwood' },
  { item: 'thaumaturge:plank_greatwood', prefix: 'plank', material: 8296, name: 'Greatwood' },
  { item: 'thaumaturge:log_silverwood', prefix: 'log', material: 8297, name: 'Silverwood' },
  { item: 'thaumaturge:plank_silverwood', prefix: 'plank', material: 8297, name: 'Silverwood' }
]

ServerEvents.started(() => {
  const manager = $OreDictManager.INSTANCE
  if (manager == null) {
    console.warn('[NekoJS/ThaumaturgeGT] 取不到 OreDictManager，跳过格雷矿辞注册。')
    return
  }
  let done = 0
  const problems = []
  for (let registerIndex = 0; registerIndex < REGISTRATIONS.length; registerIndex++) {
    const entry = REGISTRATIONS[registerIndex]
    try {
      const stack = Item.of(entry.item)
      if (stack == null || stack.isEmpty()) {
        problems.push(entry.item + '：物品不存在')
        continue
      }
      const prefix = PREFIX_BY_NAME[entry.prefix]
      if (prefix == null) {
        problems.push(entry.item + '：前缀 ' + entry.prefix + ' 不可用')
        continue
      }
      const material = $OreDictMaterial.get(entry.material)
      if (material == null) {
        problems.push(entry.item + '：材料 ' + entry.material + ' 不存在')
        continue
      }
      const accepted = manager.setItemData(stack, new $OreDictItemData(prefix, material))
      if (accepted) {
        done = done + 1
      } else {
        problems.push(entry.item + '：setItemData 被拒绝（可能已有其他材料数据）')
      }
    } catch (error) {
      problems.push(entry.item + '：' + String(error))
    }
  }
  console.info('[NekoJS/ThaumaturgeGT] 格雷矿辞注册：成功 ' + done + '/' + REGISTRATIONS.length + ' 条；问题 ' + problems.length + ' 处。')
  if (problems.length > 0) {
    console.warn('[NekoJS/ThaumaturgeGT] 未完成：' + problems.join(' | '))
  }
})
