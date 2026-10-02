<#
    gt6bridge acceptance check - turns ACCEPTANCE.md section A/F into pass/fail checks against
    config\gt6bridge\report.txt.

    Usage:
        powershell -NoProfile -ExecutionPolicy Bypass -File acceptance-check.ps1
        ... -Report <path> [-ConfigDir <path>]

    Exit code 0 = all hard checks passed, 1 = at least one failed.
#>
param(
    [string]$Report = 'E:\game\minecraft\gt6\.minecraft\versions\GT6\config\gt6bridge\report.txt',
    [string]$ConfigDir = ''
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($ConfigDir)) { $ConfigDir = Split-Path -Parent $Report }

$hard = 0; $hardFail = 0; $warn = 0; $soft = 0
function Check([string]$name, [bool]$ok, [string]$detail, [switch]$Soft) {
    if ($ok) { Write-Host ("  PASS  {0}{1}" -f $name, ($(if ($detail) { "   ($detail)" } else { '' }))) }
    else {
        if ($Soft) { Write-Host ("  WARN  {0}{1}" -f $name, ($(if ($detail) { "   ($detail)" } else { '' }))); $script:warn++ }
        else { Write-Host ("  FAIL  {0}{1}" -f $name, ($(if ($detail) { "   ($detail)" } else { '' }))); $script:hardFail++ }
    }
    $script:hard++
}

Write-Host "gt6bridge acceptance check"
Write-Host "report : $Report"
Write-Host "config : $ConfigDir"
Write-Host ""

if (-not (Test-Path $Report)) {
    Write-Host '  FAIL  report.txt not found - start the game once with the mod installed'
    exit 1
}

$lines = Get-Content $Report
$counters = @{}
$section = ''
$errorLines = @()
foreach ($line in $lines) {
    if ($line -match '^-- (.+) --$') { $section = $matches[1]; continue }
    if ($section -eq 'errors' -and $line.Trim() -ne '' -and $line -notmatch '^\s*--') { $errorLines += $line.Trim(); continue }
    if ($section -eq '' -and $line -match '^([a-zA-Z0-9_.]+):\s*(\d+)$') { $counters[$matches[1]] = [int]$matches[2] }
}
function C([string]$key) { if ($counters.ContainsKey($key)) { return $counters[$key] } return $null }

$version = ($lines | Select-String -Pattern '^GT6 Recipe Bridge (.+) report' | Select-Object -First 1).Matches[0].Groups[1].Value
Write-Host "version: $version"
Write-Host ''

# --- hard checks -------------------------------------------------------------------------
$linksFailed = C 'links.failed'
Check 'runtime API links resolve (links.failed)' ($null -ne $linksFailed -and $linksFailed -eq 0) "links.failed=$(if ($null -eq $linksFailed) {'missing'} else {$linksFailed})"

$bindings = C 'bindings'
Check 'material pass bound something (bindings > 0)' ($null -ne $bindings -and $bindings -gt 0) "bindings=$(if ($null -eq $bindings) {'missing'} else {$bindings})"

$verified = C 'bindings.verified'
if ($null -ne $bindings -and $bindings -gt 0 -and $null -ne $verified) {
    $ratio = [math]::Round(100.0 * $verified / $bindings, 1)
    Check 'bindings verify on read-back (>= 95%)' ($ratio -ge 95.0) "verified=$verified ($ratio%)"
} else {
    Check 'bindings verify on read-back (>= 95%)' $false "verified=$(if ($null -eq $verified) {'missing'} else {$verified})"
}

$errors = C 'errors'
# the mod only emits the counter when an error happened, so "absent" means zero
$errorCount = if ($null -eq $errors) { 0 } else { $errors }
Check 'no errors in the report' ($errorCount -eq 0) "errors=$errorCount$(if ($null -eq $errors) { ' (counter absent = 0)' })"

# --- conditional checks based on the configuration actually used -------------------------
$settings = Join-Path $ConfigDir 'settings.csv'
$settingsText = if (Test-Path $settings) { Get-Content $settings -Raw } else { '' }

$dryRun = $settingsText -match '(?m)^\s*dryRun\s*,\s*true'
$dryRunText = if ($dryRun) { 'true' } else { 'false' }
Check 'material binding was not a dry run' (-not $dryRun) "dryRun=$dryRunText in settings.csv" -Soft

$removalDry = -not ($settingsText -match '(?m)^\s*removalDryRun\s*,\s*false')
if ($removalDry) {
    $would = 0
    foreach ($k in $counters.Keys) { if ($k -like 'removed.total') { $would = $counters[$k] } }
    Check 'removal dry run produced numbers (informational)' ($null -ne $would) "removed.total=$would with removalDryRun=true" -Soft
} else {
    $removed = C 'removed.total'
    Check 'removals were applied (removed.total > 0)' ($null -ne $removed -and $removed -gt 0) "removed.total=$(if ($null -eq $removed) {'missing'} else {$removed})"
}

$autoRules = $settingsText -match '(?m)^\s*enableAutoRules\s*,\s*true'
if ($autoRules) {
    $added = C 'autorules.added'
    Check 'auto rules added recipes' ($null -ne $added -and $added -gt 0) "autorules.added=$(if ($null -eq $added) {'missing'} else {$added})"
} else {
    Write-Host '  SKIP  auto rules disabled in settings.csv'
}

# --- informational ----------------------------------------------------------------------
Write-Host ''
Write-Host 'observed values:'
foreach ($k in @('oredict.names','oredict.stacks','alreadyBound','bindings','bindings.verified',
                 'bindings.verifyFailed','skipped.gt6OwnItems','skipped.noGt6Item','skipped.lockedAutoInvalid',
                 'skipped.alreadyHandledThisRun','skipped.byItem','skipped.prefixFiltered',
                 'removed.total','timing.materialPass.ms','timing.recipeReInit.ms','errors')) {
    if ($counters.ContainsKey($k)) { Write-Host ("  {0,-32} {1}" -f $k, $counters[$k]) }
}
$locked = C 'skipped.lockedAutoInvalid'
if ($null -ne $locked -and $locked -gt 0) {
    Write-Host ''
    Write-Host "  note: $locked stack(s) could not be re-bound because GT6 stored auto-generated data"
    Write-Host '        first - use a materials.csv "create:" row for those materials (PreInit)'
}
if ($errorLines.Count -gt 0) {
    Write-Host ''
    Write-Host "first errors:"
    $errorLines | Select-Object -First 5 | ForEach-Object { Write-Host "  $_" }
}

Write-Host ''
if ($hardFail -gt 0) {
    Write-Host "ACCEPTANCE FAILED: $hardFail hard check(s) failed, $warn warning(s)"
    exit 1
}
Write-Host "ACCEPTANCE PASSED: $hard checks, $warn warning(s)"
exit 0
