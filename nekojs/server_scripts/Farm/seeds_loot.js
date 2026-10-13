function stripSeedEntry(entry) {
  if (entry == null || typeof entry !== 'object') {
    return entry
  }
  if (JSON.stringify(entry).indexOf('wheat_seeds') < 0) {
    return entry
  }
  if (Array.isArray(entry.children)) {
    const kept = []
    for (const child of entry.children) {
      const cleaned = stripSeedEntry(child)
      if (cleaned != null) {
        kept.push(cleaned)
      }
    }
    if (kept.length === 0) {
      return null
    }
    return Object.assign({}, entry, { children: kept })
  }
  return null
}

ServerEvents.lootTables(event => {
  const TABLES = [
    'minecraft:blocks/short_grass',
    'minecraft:blocks/tall_grass',
    'minecraft:blocks/fern',
    'minecraft:blocks/large_fern'
  ]
  let touched = 0
  let removedEntries = 0

  for (const tableId of TABLES) {
    let json = null
    try {
      json = JSON.parse(event.getJson(tableId))
    } catch (readError) {
      continue
    }
    if (json == null || typeof json !== 'object') {
      continue
    }
    const keptPools = []
    let tableRemoved = 0
    const beforeText = JSON.stringify(json.pools ?? [])
    for (const pool of (json.pools ?? [])) {
      const keptEntries = []
      for (const entry of (pool.entries ?? [])) {
        const cleaned = stripSeedEntry(entry)
        if (cleaned == null) {
          tableRemoved++
          continue
        }
        keptEntries.push(cleaned)
      }
      if (keptEntries.length > 0) {
        pool.entries = keptEntries
        keptPools.push(pool)
      }
    }

    const afterText = JSON.stringify(keptPools)
    if (afterText === beforeText) {
      continue
    }
    if (tableRemoved === 0) {
      tableRemoved = 1
    }
    json.pools = keptPools
    event.setJson(tableId, JSON.stringify(json))
    touched++
    removedEntries = removedEntries + tableRemoved
  }

})
