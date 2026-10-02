# id-audit.ps1 - 1.7.10 modpack ID space audit (fast, single-regex pass)
#
# Scans every mod config for declared IDs, groups them by ID space, and reports
# duplicate values and out-of-range values.
#
# Run with:
#   $sb = [scriptblock]::Create((Get-Content tools\id-audit.ps1 -Raw))
#   & $sb -ConfigDir ".minecraft\versions\GT6\config" -Report "tools\id-audit-report.txt"

param(
    [string]$ConfigDir = (Join-Path (Get-Location) '.minecraft\versions\GT6\config'),
    [string]$Report    = (Join-Path (Get-Location) 'tools\id-audit-report.txt')
)

$ErrorActionPreference = 'Stop'
# matches, in order: a section header, a closing brace, or a typed integer entry
$rx = [regex]'(?m)^[ \t]*(?:(?<sec>[^{}\r\n]+?)[ \t]*\{|(?<close>\})|[IBDS]:[ \t]*(?<key>.+?)[ \t]*=[ \t]*(?<val>-?\d+))[ \t\r]*$'

# ---------------------------------------------------------------- collect
$entries = New-Object System.Collections.Generic.List[object]
$files = Get-ChildItem $ConfigDir -Recurse -Force -File -Include '*.cfg','*.conf','*.json' -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\recipes\\' -and $_.FullName -notmatch '\\enviromine\\profiles\\' }
foreach ($f in $files) {
    $text = $null
    try { $text = [System.IO.File]::ReadAllText($f.FullName) } catch { continue }
    if ([string]::IsNullOrEmpty($text)) { continue }
    $stack = New-Object System.Collections.Generic.List[string]
    foreach ($m in $rx.Matches($text)) {
        if ($m.Groups['sec'].Success) { $stack.Add($m.Groups['sec'].Value.Trim().Replace('"','')); continue }
        if ($m.Groups['close'].Success) { if ($stack.Count -gt 0) { $stack.RemoveAt($stack.Count - 1) }; continue }
        $key = $m.Groups['key'].Value.Replace('"','').Trim()
        $entries.Add([pscustomobject]@{
            File    = $f.FullName.Substring($ConfigDir.Length).TrimStart('\','/')
            Section = ($stack -join ' > ')
            Key     = $key
            Value   = [int]$m.Groups['val'].Value
        })
    }
}

# ---------------------------------------------------------------- classify
# Include tokens are matched against "section + key" so that IDs declared under a
# descriptive section (e.g. AmunRa's "dimension_ids { Neper=20 }" or Betweenlands'
# "potion effects { bl.elixir.healing=52 }") are still recognised.
# Exclude tokens are matched against the key only.
function Test-Row {
    param($Row, $Include, $Exclude)
    $k = $Row.Key.ToLowerInvariant()
    foreach ($e in $Exclude) { if ($k.Contains($e)) { return $false } }
    $all = ("$($Row.Section) $k")
    foreach ($i in $Include) { if ($all.Contains($i)) { return $true } }
    return $false
}

$spaces = [ordered]@{
    'DIMENSION' = @{ Include=@('dimension','dimid','spacestationid','freespaceid','mothershipproviderid','spectredimensionid','worldprovider','providerid','outer_lands_dim','cascadedimid'); Exclude=@('range','prefix','reset','spm','density','ore','min','border','landing','required','brightness','frequency'); Max=$null; Min=$null }
    'BIOME'     = @{ Include=@('biome'); Exclude=@('weight','spread','speed','density','chance','from_flux','blacklist','base','maxbiomes','radius','size','enable','biomesoplenty','rate','metadata','multiplier','whitelist','dimension',';'); Max=255; Min=0 }
    'SCHEMATIC' = @{ Include=@('schematic'); Exclude=@('enable','disable','recipe',';'); Max=$null; Min=$null }
    'GUI/PAGE'  = @{ Include=@('gui id','guiid','gui_id','page id','pageid','page_id'); Exclude=@('enable',';'); Max=$null; Min=$null }
    'ENCHANT'   = @{ Include=@('enchant'); Exclude=@('enable','disable','chance',';','.'); Max=255; Min=0 }
    'POTION'    = @{ Include=@('potion'); Exclude=@('enable','disable','chance',';','multiplier','burn','capacity'); Max=255; Min=0 }
    'BLOCK'     = @{ Include=@('blockid','block_id','block id'); Exclude=@('enable','disable',';'); Max=4095; Min=0 }
    'ITEM'      = @{ Include=@('itemid','item_id','item id'); Exclude=@('enable','disable',';'); Max=31999; Min=4096 }
}

$out = New-Object System.Collections.Generic.List[string]
function Emit($s) { $out.Add($s) }

Emit "================================================================"
Emit " 1.7.10 ID SPACE AUDIT"
Emit " config dir : $ConfigDir"
Emit " configs    : $($files.Count)"
Emit " int entries: $($entries.Count)"

# ---- EndlessIDs awareness: its config raises the vanilla hard limits ----
$eidPath = Join-Path $ConfigDir 'endlessids.cfg'
if (Test-Path $eidPath) {
    $eid = [System.IO.File]::ReadAllText($eidPath)
    $getB = { param($n) if ($eid -match "B:$n=(true|false)") { $Matches[1] -eq 'true' } else { $false } }
    $getI = { param($n) if ($eid -match "I:$n=(\d+)") { [int]$Matches[1] } else { $null } }
    if (& $getB 'extendBlockItem') {
        $bb = & $getI 'extraBlockIDBits'; if ($null -eq $bb) { $bb = 3 }
        $ib = & $getI 'extraItemIDBits';  if ($null -eq $ib) { $ib = 1 }
        $spaces['BLOCK'].Max = 4096 * [math]::Pow(2, $bb)
        $spaces['ITEM'].Min = 0
        $spaces['ITEM'].Max = 32000 * [math]::Pow(2, $ib)
        Emit (" EndlessIDs : block/item limit raised (blocks {0:N0}, items {1:N0})" -f $spaces['BLOCK'].Max, $spaces['ITEM'].Max)
    }
    if (& $getB 'extendBiome')       { $spaces['BIOME'].Max   = 65535; Emit " EndlessIDs : biome limit raised to 65535" }
    if (& $getB 'extendPotion')      { $spaces['POTION'].Max  = 65535; Emit " EndlessIDs : potion limit raised to 65535" }
    if (& $getB 'extendEnchantment') { $spaces['ENCHANT'].Max = 32767; Emit " EndlessIDs : enchantment limit raised to 32767" }
} else {
    Emit " EndlessIDs : config not found - using vanilla limits"
}
Emit "================================================================"

$summary = @()
foreach ($name in $spaces.Keys) {
    $spec = $spaces[$name]
    $rows = @($entries | Where-Object { Test-Row $_ $spec.Include $spec.Exclude })

    Emit ""
    Emit "############ $name ############"
    Emit "declared entries: $($rows.Count)"
    if ($rows.Count -eq 0) { $summary += [pscustomobject]@{Space=$name;Count=0;Dups=0}; continue }

    $dups = @($rows | Group-Object Value | Where-Object { $_.Count -gt 1 })
    if ($dups.Count) {
        Emit "-- DUPLICATE VALUES --"
        foreach ($d in ($dups | Sort-Object { [int]$_.Name })) {
            Emit ("   [{0}]" -f $d.Name)
            $d.Group | Sort-Object File | ForEach-Object { Emit ("        {0}: {1}" -f $_.File, $_.Key) }
        }
    } else { Emit "-- no duplicate values --" }

    if ($null -ne $spec.Max) {
        $bad = @($rows | Where-Object { $_.Value -lt $spec.Min -or $_.Value -gt $spec.Max })
        if ($bad.Count) {
            Emit ("-- OUT OF RANGE (allowed {0}..{1}) --" -f $spec.Min, $spec.Max)
            $bad | Sort-Object Value | ForEach-Object { Emit ("        {0,-12} {1,-45} [{2}]" -f $_.Value, $_.Key, $_.File) }
        } else { Emit ("-- all within range {0}..{1} --" -f $spec.Min, $spec.Max) }
    }

    Emit "-- all declared values --"
    $rows | Sort-Object Value | ForEach-Object { Emit ("        {0,12}  {1,-45} [{2}]" -f $_.Value, $_.Key, $_.File) }
    $summary += [pscustomobject]@{ Space=$name; Count=$rows.Count; Dups=$dups.Count }
}

Emit ""
Emit "================================================================"
Emit " SUMMARY"
Emit "================================================================"
$summary | ForEach-Object { Emit ("  {0,-12} entries={1,-6} duplicate-values={2}" -f $_.Space, $_.Count, $_.Dups) }

[System.IO.File]::WriteAllLines($Report, $out)
Write-Host "report written: $Report"
Write-Host ($out | Select-Object -Last (($summary.Count) + 3) | Out-String)
