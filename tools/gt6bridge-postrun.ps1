<#
    One command to run after a game session with gt6bridge v0.6: shows the load evidence,
    then runs the report analyzer and the acceptance check.

    Usage: powershell -NoProfile -ExecutionPolicy Bypass -File gt6bridge-postrun.ps1
#>
param(
    [string]$Instance = 'E:\game\minecraft\gt6\.minecraft\versions\GT6',
    [string]$Tools    = 'E:\game\minecraft\gt6\tools'
)

$config = Join-Path $Instance 'config\gt6bridge'
$report = Join-Path $config 'report.txt'
$py     = 'C:\Users\TR\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe'
if (-not (Test-Path $py)) { $py = 'python' }

Write-Host '================ 0) config lint ================'
$lint = Join-Path $Tools 'lint-config.py'
if (Test-Path $lint) { & $py $lint --config $config } else { Write-Host 'lint-config.py not found' -ForegroundColor Yellow }

Write-Host ''
Write-Host '================ 1) load evidence ================'
$jars = Get-ChildItem (Join-Path $Instance 'mods') -Filter '*gt6bridge*.jar' -ErrorAction SilentlyContinue
foreach ($j in $jars) { Write-Host ("jar          : {0} ({1} bytes, {2})" -f $j.Name, $j.Length, $j.LastWriteTime) }

$logs = Get-ChildItem (Join-Path $Instance 'logs') -File -Filter 'fml-client-*.log' -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending
if ($logs) {
    $log = $logs[0].FullName
    Write-Host "newest fml log: $($logs[0].Name) ($($logs[0].LastWriteTime))"
    $state = Select-String -Path $log -Pattern 'gt6bridge\{[0-9.]+\}' -Encoding utf8 | Select-Object -Last 1
    if ($state) {
        $line = $state.Line.Trim()
        Write-Host "mod state    : $line"
        if ($line -match 'gt6bridge\{([0-9.]+)\}') { Write-Host "loaded version: $($matches[1])" }
        if ($line -match '^\s*(U?C?H?I?J?A?D?E?)\s+gt6bridge') {
            if ($matches[1] -match 'E') { Write-Host 'VERDICT      : mod ERRORED (state flag E)' -ForegroundColor Red }
        }
    } else {
        Write-Host 'mod state    : no gt6bridge line in this log - mod not loaded?' -ForegroundColor Yellow
    }
    foreach ($pat in @('\[gt6bridge\].*pre-init done.*', '\[gt6bridge\].*API registered.*', '\[gt6bridge\].*pass finished.*', 'Caught exception from gt6bridge')) {
        Select-String -Path $log -Pattern $pat -Encoding utf8 | Select-Object -Last 2 | ForEach-Object { Write-Host ("  " + $_.Line.Trim()) }
    }
} else {
    Write-Host 'no fml-client log found' -ForegroundColor Yellow
}

Write-Host ''
Write-Host '================ 2) report ================'
if (-not (Test-Path $report)) {
    Write-Host "no report yet at $report - start the game once with the mod installed" -ForegroundColor Yellow
    exit 1
}
$head = Get-Content $report -TotalCount 6
$head | ForEach-Object { Write-Host "  $_" }
$ver = ($head | Select-String -Pattern 'GT6 Recipe Bridge ([0-9.]+)' | Select-Object -First 1)
if ($ver -and $ver.Matches[0].Groups[1].Value -ne '0.6') {
    Write-Host "  note: this report is from version $($ver.Matches[0].Groups[1].Value), not the deployed 0.6" -ForegroundColor Yellow
}

Write-Host ''
Write-Host '================ 3) analyzer ================'
$analyze = Join-Path $Tools 'gt6bridge-analyze.ps1'
if (Test-Path $analyze) { & powershell -NoProfile -ExecutionPolicy Bypass -File $analyze } else { Write-Host 'analyzer not found' -ForegroundColor Yellow }

Write-Host ''
Write-Host '================ 4) acceptance check ================'
$accept = Join-Path $Tools 'acceptance-check.ps1'
if (Test-Path $accept) { & powershell -NoProfile -ExecutionPolicy Bypass -File $accept -Report $report -ConfigDir $config }
