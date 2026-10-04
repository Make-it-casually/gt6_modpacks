
import { $OreDictManager } from 'java:gregapi/oredict/OreDictManager'
import { $OreDictMaterial } from 'java:gregapi/oredict/OreDictMaterial'
import { $OreDictItemData } from 'java:gregapi/oredict/OreDictItemData'
import { $OP } from 'java:gregapi/data/OP'
import { $Component } from 'java:net/minecraft/network/chat/Component'
import { $LiteralArgumentBuilder } from 'java:com/mojang/brigadier/builder/LiteralArgumentBuilder'
import { GT6_INGOT_MATERIALS } from './lib/gt6_ingot_materials.js'

const REGISTRATION_KEY = 'gt6IngotMaterialsRegisteredV1'
const TAG = '[NekoJS/GT6]'

const ENABLE_APPROXIMATE = true

const activeEntries = GT6_INGOT_MATERIALS.filter(
  mapping => ENABLE_APPROXIMATE || mapping.confidence !== 'approx'
)

let lastReport = null

function findMaterial(name) {
  const material = $OreDictMaterial.get(name, null)
  return material == null ? null : material
}

function registerIngot(itemId, material) {
  const stack = Item.of(itemId, 1)
  if (stack == null || stack.isEmpty()) {
    return { ok: false, reason: '物品不存在（该 mod 未安装/改名）' }
  }

  const previous = $OreDictManager.INSTANCE.getItemData(stack)
  if (previous != null && previous.validData()) {
    const previousMaterial = previous.mMaterial == null ? null : previous.mMaterial.mMaterial
    if (previousMaterial != null &&
        String(previousMaterial.mNameInternal) === String(material.mNameInternal)) {
      return { ok: true, reason: '已有相同材料数据' }
    }
    return {
      ok: false,
      reason: `已有其他材料数据（${previousMaterial == null ? '未知' : String(previousMaterial.mNameInternal)}），setItemData 不会覆盖`
    }
  }

  const accepted = $OreDictManager.INSTANCE.setItemData(
    stack,
    new $OreDictItemData($OP.ingot, material)
  )
  return accepted ? { ok: true } : { ok: false, reason: 'GT6 拒绝了 setItemData' }
}

function registerAll() {
  if (global[REGISTRATION_KEY] === true) {
    return
  }
  global[REGISTRATION_KEY] = true

  const report = {
    aliases: [],
    aliasConflicts: [],
    registered: [],
    alreadySet: [],
    failed: []
  }

  for (const aliasEntry of activeEntries) {
    const alias = aliasEntry.tagMaterial
    if (alias == null || alias === aliasEntry.material) {
      continue
    }
    try {
      const aliasMaterial = findMaterial(aliasEntry.material)
      if (aliasMaterial == null) {
        report.aliasConflicts.push(`${alias} → ${aliasEntry.material}：GT6 没有这个材料，跳过别名`)
        continue
      }
      const aliasExisting = $OreDictMaterial.MATERIAL_MAP.get(alias)
      if (aliasExisting == null) {
        $OreDictMaterial.MATERIAL_MAP.put(alias, aliasMaterial)
        report.aliases.push(`${alias} → ${aliasEntry.material}`)
      } else if (String(aliasExisting.mNameInternal) === String(aliasMaterial.mNameInternal)) {
        report.aliases.push(`${alias} → ${aliasEntry.material}（已存在，跳过）`)
      } else {
        report.aliasConflicts.push(
          `${alias} → ${aliasEntry.material}：GT6 已有同名材料 ${String(aliasExisting.mNameInternal)}，不覆盖`
        )
      }
    } catch (aliasError) {
      report.aliasConflicts.push(`${alias} → ${aliasEntry.material}：${String(aliasError)}`)
    }
  }

  for (const itemEntry of activeEntries) {
    try {
      let itemMaterial = null
      if (itemEntry.material != null) {
        itemMaterial = findMaterial(itemEntry.material)
      } else if (itemEntry.autoMaterial != null) {

        itemMaterial = $OreDictMaterial.createAutoInvalidMaterial(itemEntry.autoMaterial)
      }

      if (itemMaterial == null) {
        report.failed.push(`${itemEntry.item}：GT6 没有材料 ${itemEntry.material}`)
        continue
      }

      const itemResult = registerIngot(itemEntry.item, itemMaterial)
      if (itemResult.ok) {
        const itemLine = `${itemEntry.item} → ${String(itemMaterial.mNameInternal)}(${itemMaterial.mID})`
        if (itemResult.reason === undefined) {
          report.registered.push(itemLine)
        } else {
          report.alreadySet.push(`${itemLine} — ${itemResult.reason}`)
        }
      } else {
        report.failed.push(`${itemEntry.item} → ${String(itemMaterial.mNameInternal)}：${itemResult.reason}`)
      }
    } catch (itemError) {
      report.failed.push(`${itemEntry.item}：${String(itemError)}`)
    }
  }

  lastReport = report
  const skipped = GT6_INGOT_MATERIALS.length - activeEntries.length
  console.info(
    `${TAG} 其他 mod 锭 → GT6 材料：成功 ${report.registered.length}，` +
    `已存在 ${report.alreadySet.length}，失败 ${report.failed.length}；` +
    `标签名别名 ${report.aliases.length}，别名冲突 ${report.aliasConflicts.length}` +
    `（共 ${GT6_INGOT_MATERIALS.length} 条映射，本次处理 ${activeEntries.length} 条` +
    `${skipped > 0 ? `，按开关跳过 ${skipped} 条近似条目` : ''}）`
  )
  for (const conflict of report.aliasConflicts) {
    console.warn(`${TAG} 别名跳过：${conflict}`)
  }
  for (const failure of report.failed) {
    console.warn(`${TAG} 注册失败：${failure}`)
  }
}

function verifyAll() {
  const lines = []
  let ok = 0
  let bad = 0
  for (const checkEntry of activeEntries) {
    const expected = checkEntry.material == null ? `${checkEntry.autoMaterial}(未知材料)` : checkEntry.material
    const stack = Item.of(checkEntry.item, 1)
    if (stack == null || stack.isEmpty()) {
      lines.push(`缺失物品  ${checkEntry.item}  （期望 ${expected}）`)
      bad++
      continue
    }
    const data = $OreDictManager.INSTANCE.getItemData(stack)
    const material = data == null || !data.validData() || data.mMaterial == null
      ? null
      : data.mMaterial.mMaterial
    const actual = material == null ? '未识别' : `${String(material.mNameInternal)}(${material.mID})`
    if (material != null &&
        (checkEntry.material == null || String(material.mNameInternal) === checkEntry.material)) {
      lines.push(`OK        ${checkEntry.item} → ${actual}`)
      ok++
    } else {
      lines.push(`不符      ${checkEntry.item} → ${actual}  （期望 ${expected}）`)
      bad++
    }
  }
  const skipped = GT6_INGOT_MATERIALS.length - activeEntries.length
  lines.unshift(
    `共 ${activeEntries.length} 项：符合 ${ok}，不符/缺失 ${bad}` +
    `${skipped > 0 ? `（另有 ${skipped} 条近似条目被开关跳过）` : ''}`
  )
  return lines
}

try {
  registerAll()
} catch (bootError) {
  console.error(`${TAG} 锭材料注册整体失败：${String(bootError)}`)
}

ServerEvents.started(() => {
  if (lastReport == null || lastReport.failed.length === 0) {
    return
  }
  console.info(`${TAG} 服务端启动后补注册：重试 ${lastReport.failed.length} 条启动时没拿到的锭`)
  try {
    registerAll()
  } catch (retryError) {
    console.error(`${TAG} 补注册失败：${String(retryError)}`)
  }
})

CommandEvents.register(event => {
  const command = $LiteralArgumentBuilder.literal('gt6ingots').executes(context => {
    const source = context.getSource()
    try {
      for (const reportLine of verifyAll()) {
        source.sendSystemMessage($Component.literal(reportLine))
      }
      if (lastReport != null) {
        source.sendSystemMessage($Component.literal(
          `别名 ${lastReport.aliases.length}，已存在 ${lastReport.alreadySet.length}，失败 ${lastReport.failed.length}（脚本加载时的结果）`
        ))
      } else {
        source.sendSystemMessage($Component.literal(
          `${TAG} 本次进程里没有注册记录：启动脚本可能没加载成功，检查 logs/nekojs/startup.log 的"脚本执行失败"`
        ))
      }
    } catch (commandError) {
      source.sendSystemMessage($Component.literal(`${TAG} 复查出错：${String(commandError)}`))
      return 0
    }
    return 1
  })

  event.getDispatcher().register(
    $LiteralArgumentBuilder.literal('nekojs').then(command)
  )
  console.info(`${TAG} 已注册 /nekojs gt6ingots`)
})
