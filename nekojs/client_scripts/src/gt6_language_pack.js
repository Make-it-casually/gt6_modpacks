import { $Minecraft } from 'java:net/minecraft/client/Minecraft'

const PACK_ID_HINT = 'gt6_zh_cn'
const CHINESE_PREFIX = 'zh'
const STATE_KEY = 'gt6mcLanguagePackAppliedV1'

function findPackId(repository) {
  const ids = repository.getAvailableIds()
  for (const id of ids) {
    if (String(id).indexOf(PACK_ID_HINT) >= 0) {
      return String(id)
    }
  }
  return null
}

function isSelected(repository, packId) {
  const selected = repository.getSelectedIds()
  return selected.contains(packId) === true
}

function applyLanguagePack() {
  if (global[STATE_KEY] === true) {
    return
  }
  global[STATE_KEY] = true

  try {
    const minecraft = $Minecraft.getInstance()
    if (minecraft == null) {
      global[STATE_KEY] = false
      return
    }

    const language = String(minecraft.getLanguageManager().getSelected())
    const wantChinese = language.indexOf(CHINESE_PREFIX) === 0

    const repository = minecraft.getResourcePackRepository()
    const packId = findPackId(repository)
    if (packId === null) {
      console.info('[NekoJS/GT6] 语言适配：未找到汉化资源包，跳过。')
      return
    }

    const selected = isSelected(repository, packId)
    if (wantChinese === selected) {
      console.info('[NekoJS/GT6] 语言适配：' + language + '，汉化资源包状态无需变动' + (wantChinese ? '（已启用）' : '（已禁用）') + '。')
      return
    }

    let changed
    if (wantChinese) {
      changed = repository.addPack(packId)
    } else {
      changed = repository.removePack(packId)
    }

    if (changed === true) {
      minecraft.reloadResourcePacks()
      console.info('[NekoJS/GT6] 语言适配：' + language + ' → ' + (wantChinese ? '已启用' : '已禁用') + '汉化资源包（' + packId + '），正在重载资源。')
    } else {
      console.warn('[NekoJS/GT6] 语言适配：' + packId + ' 状态切换被拒绝（可能被强制启用）。')
    }
  } catch (error) {
    console.warn('[NekoJS/GT6] 语言适配失败：' + String(error))
  }
}

ClientEvents.tick(() => {
  applyLanguagePack()
})
