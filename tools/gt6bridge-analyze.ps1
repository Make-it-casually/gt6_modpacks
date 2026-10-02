<#
    gt6bridge report analyser.

    Reads config\gt6bridge\report.txt (written by the mod) and turns the "unknown material
    tokens" section into a ready to paste materials.csv, matching tokens against GT6's own
    material names (extracted from gregapi/data/MT via javap).

    Usage:
        powershell -NoProfile -ExecutionPolicy Bypass -File gt6bridge-analyze.ps1
        ... -Report <path to report.txt> -MinItems 1
#>
param(
    [string]$Report   = 'E:\game\minecraft\gt6\.minecraft\versions\GT6\config\gt6bridge\report.txt',
    [string]$Materials = '',
    [int]$MinItems = 1,
    [string]$OutDir = ''
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Report)) {
    Write-Host "report not found: $Report"
    Write-Host "Start the game once with the mod installed - it writes the report at load complete."
    exit 2
}
$configDir = Split-Path -Parent $Report
# suggestions go to a writable folder: the sandboxed shell cannot write inside .minecraft,
# and the config folder should only change when the rows are reviewed and applied
if ([string]::IsNullOrWhiteSpace($OutDir)) {
    $OutDir = Join-Path 'E:\game\minecraft\gt6\tools' 'suggestions'
}
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

# prefer the list the mod itself dumps at runtime (config/gt6bridge/materials-known.txt, written by
# the diagnostics pass); fall back to the list extracted from gregapi/data/MT via javap
if ([string]::IsNullOrWhiteSpace($Materials)) {
    $runtime = Join-Path $configDir 'materials-known.txt'
    $static  = 'E:\game\minecraft\gt6\tools\gt6-material-names.txt'
    if (Test-Path $runtime) { $Materials = $runtime }
    elseif (Test-Path $static) { $Materials = $static }
    else { $Materials = $static }
}

$materialNames = @()
if (Test-Path $Materials) {
    $materialNames = Get-Content $Materials | Where-Object { $_.Trim() -ne '' } | ForEach-Object { $_.Trim() }
} else {
    Write-Host "note: GT6 material name list missing ($Materials) - only 'create' suggestions will be produced"
}

function Normalize([string]$s) {
    if ($null -eq $s) { return '' }
    return ($s -replace '[^A-Za-z0-9]', '').ToLowerInvariant()
}

function Levenshtein([string]$a, [string]$b) {
    if ($a.Length -eq 0) { return $b.Length }
    if ($b.Length -eq 0) { return $a.Length }
    $prev = New-Object int[] ($b.Length + 1)
    $cur  = New-Object int[] ($b.Length + 1)
    for ($j = 0; $j -le $b.Length; $j++) { $prev[$j] = $j }
    for ($i = 1; $i -le $a.Length; $i++) {
        $cur[0] = $i
        for ($j = 1; $j -le $b.Length; $j++) {
            $cost = if ($a[$i - 1] -eq $b[$j - 1]) { 0 } else { 1 }
            $cur[$j] = [Math]::Min([Math]::Min($cur[$j - 1] + 1, $prev[$j] + 1), $prev[$j - 1] + $cost)
        }
        $tmp = $prev; $prev = $cur; $cur = $tmp
    }
    return $prev[$b.Length]
}

function Suggest([string]$token) {
    $norm = Normalize $token
    foreach ($m in $materialNames) {
        if ($m -ceq $token) { return @{ name = $m; how = 'exact' } }
    }
    foreach ($m in $materialNames) {
        if ($m -ieq $token) { return @{ name = $m; how = 'case insensitive' } }
    }
    foreach ($m in $materialNames) {
        if ((Normalize $m) -eq $norm) { return @{ name = $m; how = 'ignoring case and separators' } }
    }
    $best = $null; $bestScore = 99
    foreach ($m in $materialNames) {
        $d = Levenshtein $norm (Normalize $m)
        if ($d -lt $bestScore) { $bestScore = $d; $best = $m }
    }
    $limit = [Math]::Max(1, [int]([Math]::Floor($norm.Length / 4)))
    if ($best -ne $null -and $bestScore -le $limit) { return @{ name = $best; how = "close spelling (distance $bestScore)" } }
    return @{ name = $null; how = '' }
}

# ---------------------------------------------------------------- parse report

$lines = Get-Content $Report
$counters = @{}
$unknown = New-Object System.Collections.Generic.List[object]
$removedPerBackend = @{}
$handlerMaps = @()
$unparsed = 0
$errors = 0
$section = ''

foreach ($line in $lines) {
    if ($line -match '^-- (.+) --$') { $section = $matches[1]; continue }
    if ($section -eq 'removed per backend' -and $line -match '^\s+(\S+):\s*(\d+)$') {
        $removedPerBackend[$matches[1]] = [int]$matches[2]
        continue
    }
    if ($line -match 'maps with dynamic handlers\s*:\s*(\d+)\s*\[(.*)\]') {
        $handlerMaps = ($matches[2] -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    }
    switch -Regex ($section) {
        'unknown material tokens' {
            if ($line -match '^\s+(\S+)\s*:\s*(\d+)\s+item\(s\)(?:\s+e\.g\.\s+(\S+))?') {
                $unknown.Add([pscustomobject]@{ Token = $matches[1]; Items = [int]$matches[2]; Example = $matches[3] })
            }
            continue
        }
        'ore dictionary names without' {
            if ($line -match '^\s+\S+\s*:\s*\d+') { $unparsed++ }
            continue
        }
        'errors' {
            if ($line.Trim() -ne '' -and $line -notmatch '^\s*--') { $errors++ }
            continue
        }
    }
    if ($section -eq '' -and $line -match '^([a-zA-Z0-9_.]+):\s*(\d+)$') {
        $counters[$matches[1]] = [int]$matches[2]
    }
}

# ---------------------------------------------------------------- report out

Write-Host "== gt6bridge report analysis =="
Write-Host ("report      : {0}" -f $Report)
foreach ($k in @('oredict.names','oredict.stacks','alreadyBound','bindings','skipped','removed.total','errors')) {
    if ($counters.ContainsKey($k)) { Write-Host ("{0,-14}: {1}" -f $k, $counters[$k]) }
}
Write-Host ("unparsed ore dictionary names: {0} (no GT6 prefix)" -f $unparsed)
Write-Host ("unknown material tokens      : {0}" -f $unknown.Count)
Write-Host ""

$sorted = $unknown | Sort-Object -Property Items -Descending
Write-Host "top unknown material tokens:"
$sorted | Select-Object -First 15 | ForEach-Object {
    Write-Host ("  {0,-24} {1,5} item(s)   {2}" -f $_.Token, $_.Items, $_.Example)
}
if ($sorted.Count -gt 15) { Write-Host ("  ... and {0} more" -f ($sorted.Count - 15)) }

$csv = New-Object System.Collections.Generic.List[string]
$csv.Add('# generated by gt6bridge-analyze.ps1 from report.txt - review before use')
$csv.Add('# syntax: <oredictMaterialToken>,<gt6Material|create|->[,note]')
$bind = 0; $create = 0
foreach ($u in $sorted) {
    if ($u.Items -lt $MinItems) { continue }
    $s = Suggest $u.Token
    if ($null -ne $s.name) {
        $csv.Add(("{0},{1},auto: {2}; {3} item(s); e.g. {4}" -f $u.Token, $s.name, $s.how, $u.Items, $u.Example))
        $bind++
    } else {
        $csv.Add(("{0},create,auto: no similar GT6 material; {1} item(s); e.g. {2}" -f $u.Token, $u.Items, $u.Example))
        $create++
    }
}
$csvPath = Join-Path $OutDir 'materials-suggested.csv'
$csv | Set-Content $csvPath -Encoding UTF8

$summaryPath = Join-Path $OutDir 'analyze-summary.txt'
$summary = New-Object System.Collections.Generic.List[string]
$summary.Add("gt6bridge report analysis - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$summary.Add("report: $Report")
foreach ($k in $counters.Keys) { $summary.Add(("{0}: {1}" -f $k, $counters[$k])) }
$summary.Add("unparsedOreNames: $unparsed")
$summary.Add("errorsInReport: $errors")
$summary.Add("")
$summary.Add("unknown material tokens (sorted by item count):")
foreach ($u in $sorted) {
    $s = Suggest $u.Token
    $hint = if ($null -ne $s.name) { "-> $($s.name)  [$($s.how)]" } else { '-> create' }
    $summary.Add(("  {0,-28} {1,5}  {2}" -f $u.Token, $u.Items, $hint))
}
$summary | Set-Content $summaryPath -Encoding UTF8

# ---------------------------------------------------------------- removals + autorules

$cfgDir = Split-Path -Parent $Report
$next = New-Object System.Collections.Generic.List[string]
$next.Add('gt6bridge next steps')
$next.Add('===================')

# 1) removals: keep only the rows whose dry run actually matched something
$removalsIn = Join-Path $cfgDir 'removals.csv'
if ((Test-Path $removalsIn) -and $removedPerBackend.Count -gt 0) {
    $rows = Get-Content $removalsIn | Where-Object { $_.Trim() -ne '' -and -not $_.TrimStart().StartsWith('#') }
    $keep = New-Object System.Collections.Generic.List[string]
    $keep.Add('# gt6bridge removals - only the rows whose dry run matched (generated from report.txt)')
    $keep.Add('# set removalDryRun,false in settings.csv to actually delete them')
    foreach ($row in $rows) {
        $target = ($row -split ',')[0].Trim()
        $count = 0
        if ($removedPerBackend.ContainsKey($target)) { $count = $removedPerBackend[$target] }
        if ($count -gt 0) { $keep.Add(("{0}   # {1} recipe(s)" -f $row.Trim(), $count)) }
    }
    if ($keep.Count -gt 2) {
        $removalsOut = Join-Path $OutDir 'removals-final.csv'
        $keep | Set-Content $removalsOut -Encoding UTF8
        $next.Add("[removals] wrote $removalsOut ($($keep.Count - 2) matching row(s))")
        $next.Add('           review it, then copy over config\gt6bridge\removals.csv and set removalDryRun,false')
    } else {
        $next.Add('[removals] no dry run row matched anything - check the selectors')
    }
    foreach ($k in ($removedPerBackend.Keys | Sort-Object)) {
        $next.Add(("           {0,-32} would remove {1}" -f $k, $removedPerBackend[$k]))
    }
} else {
    $next.Add('[removals] no "removed per backend" data - enable the preset rows and keep removalDryRun,true for one run')
}

# 2) autorules: suggest enabling rules whose prefix has bindings and whose map has no dynamic handler
$autorulesIn = Join-Path $cfgDir 'autorules.csv'
if (Test-Path $autorulesIn) {
    $suggested = New-Object System.Collections.Generic.List[string]
    $suggested.Add('# gt6bridge autorules - generated from report.txt')
    $suggested.Add('# prefixes with bindings whose target map has NO dynamic handler, so GT6 will not')
    $suggested.Add('# generate these recipes by itself. enableAutoRules must be true in settings.csv.')
    foreach ($row in (Get-Content $autorulesIn | Where-Object { $_.Trim() -ne '' -and -not $_.TrimStart().StartsWith('#') })) {
        $cells = $row -split ','
        if ($cells.Count -lt 4) { continue }
        $prefix = $cells[0].Trim()
        $map = $cells[1].Trim()
        if ($map -eq 'Generifier') { continue }   # handled separately, always useful
        $boundCount = 0
        if ($counters.ContainsKey("bound.byPrefix.$prefix")) { $boundCount = $counters["bound.byPrefix.$prefix"] }
        if ($boundCount -le 0) { continue }
        if ($handlerMaps -contains $map) {
            $next.Add(("[autorules] {0} -> {1}: {2} binding(s), GT6 generates these itself - no need" -f $prefix, $map, $boundCount))
            continue
        }
        $cells[7] = 'true'
        $suggested.Add(($cells -join ',') + "   # $boundCount binding(s)")
        $next.Add(("[autorules] {0} -> {1}: {2} binding(s), NO handler on that map -> enable" -f $prefix, $map, $boundCount))
    }
    if ($suggested.Count -gt 3) {
        $autorulesOut = Join-Path $OutDir 'autorules-suggested.csv'
        $suggested | Set-Content $autorulesOut -Encoding UTF8
        $next.Add("[autorules] wrote $autorulesOut")
    }
}

# 3) materials
$next.Add("[materials] review materials-suggested.csv, then merge the rows into config\gt6bridge\materials.csv")
$next.Add("[verify]    after the next run, report.txt should show bindings.verified close to bindings")

$nextPath = Join-Path $OutDir 'next-steps.txt'
$next | Set-Content $nextPath -Encoding UTF8

Write-Host ""
Write-Host ("suggestions : {0} bind row(s), {1} create row(s)" -f $bind, $create)
Write-Host ("written     : {0}" -f $csvPath)
Write-Host ("            : {0}" -f $summaryPath)
Write-Host ("            : {0}" -f $nextPath)
foreach ($n in $next) { Write-Host ("  " + $n) }
