
import { $BuiltInRegistries } from 'java:net/minecraft/core/registries/BuiltInRegistries'
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $Component } from 'java:net/minecraft/network/chat/Component'
import { $LiteralArgumentBuilder } from 'java:com/mojang/brigadier/builder/LiteralArgumentBuilder'

const TAG = '[NekoJS/GT6]'
const CHAT_LIMIT = 40

function isIngotId(path) {
  const text = String(path).toLowerCase()
  return text.endsWith('ingot') || text.endsWith('ingots') || text.endsWith('_ingot') || text.endsWith('_ingots')
}

function isIngotTag(tagName) {
  const text = String(tagName).toLowerCase()
  if (text === 'ingot' || text === 'ingots') return true
  if (text.startsWith('ingot/') || text.startsWith('ingots/')) return true
  if (text.indexOf('/ingot/') >= 0 || text.indexOf('/ingots/') >= 0) return true
  return text.endsWith('/ingot') || text.endsWith('/ingots')
}

function collectCandidates() {
  const ids = new Set()

  for (const identifier of $BuiltInRegistries.ITEM.keySet()) {
    const id = String(identifier)
    const path = id.includes(':') ? id.slice(id.indexOf(':') + 1) : id
    if (isIngotId(path)) {
      ids.add(id)
    }
  }

  for (const holderSet of $BuiltInRegistries.ITEM.getTags().iterator()) {
    let tagName = null
    try {
      tagName = String(holderSet.key().location())
    } catch (tagError) {
      console.warn(`${TAG} 读标签名失败：${String(tagError)}`)
      continue
    }
    if (!isIngotTag(tagName)) {
      continue
    }
    for (const holder of holderSet) {
      try {
        ids.add(String($BuiltInRegistries.ITEM.getKey(holder.value())))
      } catch (holderError) {
        console.warn(`${TAG} 读标签 ${tagName} 成员失败：${String(holderError)}`)
      }
    }
  }

  return ids
}

function inspect(itemId) {
  const stack = Item.of(itemId, 1)
  if (stack == null || stack.isEmpty()) {
    return { state: 'missing', detail: '物品不存在' }
  }
  const data = $OreDictManager.INSTANCE.getItemData(stack)
  if (data == null) {
    return { state: 'noData', detail: '没有 GT 材料数据' }
  }
  if (!data.validData() || data.mMaterial == null || data.mMaterial.mMaterial == null) {
    return { state: 'invalid', detail: '材料数据无效（多半是 GT6 自动建的未知材料）' }
  }
  const materialName = String(data.mMaterial.mMaterial.mNameInternal)
  const prefixName = data.mPrefix == null ? '?' : String(data.mPrefix.mNameInternal)
  return { state: 'ok', detail: `${materialName}（前缀 ${prefixName}）` }
}

CommandEvents.register(event => {
  const scanCommand = $LiteralArgumentBuilder.literal('gt6ingots-scan').executes(context => {
    const source = context.getSource()
    try {
      const candidates = [...collectCandidates()].sort()
      const problems = []
      let okCount = 0
      for (const itemId of candidates) {
        const result = inspect(itemId)
        if (result.state === 'ok') {
          okCount++
        } else {
          problems.push(`${result.state === 'missing' ? '缺失' : '未识别'}  ${itemId}  — ${result.detail}`)
        }
      }

      console.info(
        `${TAG} 锭扫描：候选 ${candidates.length} 个（名字像锭或带 ingots 标签），` +
        `有 GT 材料数据 ${okCount} 个，问题 ${problems.length} 个`
      )
      for (const problem of problems) {
        console.info(`${TAG}   ${problem}`)
      }

      source.sendSystemMessage($Component.literal(
        `${TAG} 锭扫描：候选 ${candidates.length}，有材料数据 ${okCount}，问题 ${problems.length}（完整列表见 logs/nekojs/server.log）`
      ))
      for (const chatLine of problems.slice(0, CHAT_LIMIT)) {
        source.sendSystemMessage($Component.literal(chatLine))
      }
      if (problems.length > CHAT_LIMIT) {
        source.sendSystemMessage($Component.literal(`…还有 ${problems.length - CHAT_LIMIT} 条，见日志`))
      }
      return 1
    } catch (scanError) {
      const message = `${TAG} 锭扫描出错：${String(scanError)}`
      console.error(message)
      source.sendSystemMessage($Component.literal(message))
      return 0
    }
  })

  event.getDispatcher().register(
    $LiteralArgumentBuilder.literal('nekojs').then(scanCommand)
  )
  console.info(`${TAG} 已注册 /nekojs gt6ingots-scan`)
})
