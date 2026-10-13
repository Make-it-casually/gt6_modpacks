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
 return { ok: false, reason: 'item does not exist (mod not installed or renamed)' }
 }

 const previous = $OreDictManager.INSTANCE.getItemData(stack)
 if (previous != null && previous.validData()) {
 const previousMaterial = previous.mMaterial == null ? null : previous.mMaterial.mMaterial
 if (previousMaterial != null &&
 String(previousMaterial.mNameInternal) === String(material.mNameInternal)) {
 return { ok: true, reason: 'same material data already present' }
 }
 return {
 ok: false,
 reason: `other material data already present (${previousMaterial == null ? 'unknown' : String(previousMaterial.mNameInternal)}); setItemData will not overwrite`
 }
 }

 const accepted = $OreDictManager.INSTANCE.setItemData(
 stack,
 new $OreDictItemData($OP.ingot, material)
 )
 return accepted ? { ok: true } : { ok: false, reason: 'GT6 rejected setItemData' }
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
 report.aliasConflicts.push(`${alias} → ${aliasEntry.material}: GT6 has no such material, skipping alias`)
 continue
 }
 const aliasExisting = $OreDictMaterial.MATERIAL_MAP.get(alias)
 if (aliasExisting == null) {
 $OreDictMaterial.MATERIAL_MAP.put(alias, aliasMaterial)
 report.aliases.push(`${alias} → ${aliasEntry.material}`)
 } else if (String(aliasExisting.mNameInternal) === String(aliasMaterial.mNameInternal)) {
 report.aliases.push(`${alias} → ${aliasEntry.material} (already exists, skipping)`)
 } else {
 report.aliasConflicts.push(
 `${alias} → ${aliasEntry.material}: GT6 already has a material named ${String(aliasExisting.mNameInternal)}, not overwriting`
 )
 }
 } catch (aliasError) {
 report.aliasConflicts.push(`${alias} → ${aliasEntry.material}: ${String(aliasError)}`)
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
 report.failed.push(`${itemEntry.item}: GT6 has no material ${itemEntry.material}`)
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
 report.failed.push(`${itemEntry.item} → ${String(itemMaterial.mNameInternal)}: ${itemResult.reason}`)
 }
 } catch (itemError) {
 report.failed.push(`${itemEntry.item}: ${String(itemError)}`)
 }
 }

 lastReport = report
 const skipped = GT6_INGOT_MATERIALS.length - activeEntries.length
 for (const conflict of report.aliasConflicts) {
 }
 for (const failure of report.failed) {
 }
}

function verifyAll() {
 const lines = []
 let ok = 0
 let bad = 0
 for (const checkEntry of activeEntries) {
 const expected = checkEntry.material == null ? `${checkEntry.autoMaterial}(unknown material)` : checkEntry.material
 const stack = Item.of(checkEntry.item, 1)
 if (stack == null || stack.isEmpty()) {
 lines.push(`missing item ${checkEntry.item} (expected ${expected})`)
 bad++
 continue
 }
 const data = $OreDictManager.INSTANCE.getItemData(stack)
 const material = data == null || !data.validData() || data.mMaterial == null
 ? null
 : data.mMaterial.mMaterial
 const actual = material == null ? 'unrecognized' : `${String(material.mNameInternal)}(${material.mID})`
 if (material != null &&
 (checkEntry.material == null || String(material.mNameInternal) === checkEntry.material)) {
 lines.push(`OK ${checkEntry.item} → ${actual}`)
 ok++
 } else {
 lines.push(`mismatch ${checkEntry.item} → ${actual} (expected ${expected})`)
 bad++
 }
 }
 const skipped = GT6_INGOT_MATERIALS.length - activeEntries.length
 lines.unshift(
 `total ${activeEntries.length}: ok ${ok}, mismatch/missing ${bad}` +
 `${skipped > 0 ? ` (${skipped} similar entries skipped by config)` : ''}`
 )
 return lines
}

try {
 registerAll()
} catch (bootError) {
}

ServerEvents.started(() => {
 if (lastReport == null || lastReport.failed.length === 0) {
 return
 }
 try {
 registerAll()
 } catch (retryError) {
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
 `aliases ${lastReport.aliases.length}, already present ${lastReport.alreadySet.length}, failed ${lastReport.failed.length} (result at script load)`
 ))
 } else {
 source.sendSystemMessage($Component.literal(
 `${TAG} no registration record in this process: the startup script may have failed to load, check logs/nekojs/startup.log`
 ))
 }
 } catch (commandError) {
 source.sendSystemMessage($Component.literal(`${TAG} recheck error: ${String(commandError)}`))
 return 0
 }
 return 1
 })

 event.getDispatcher().register(
 $LiteralArgumentBuilder.literal('nekojs').then(command)
 )
})
