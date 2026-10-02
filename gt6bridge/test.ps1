<#
    gt6bridge self test: compiles the mod against the compile-time stubs, runs the plain JVM
    test suite in a scratch directory (no Minecraft, no network) and reports the result.

    Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File test.ps1
#>
param(
    [string]$Jdk = 'C:\Program Files\BellSoft\LibericaJDK-8\bin',
    [string]$Instance = 'E:\game\minecraft\gt6\.minecraft\versions\GT6'
)

$ErrorActionPreference = 'Stop'
$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$javac   = Join-Path $Jdk 'javac.exe'
$java    = Join-Path $Jdk 'java.exe'
$outDir  = Join-Path $root 'out'
$outStub = Join-Path $root 'out-stub'
$testOut = Join-Path $root 'out-test'
$scratch = Join-Path $root 'test-run'

# 1) make sure the mod itself is built against the stubs
& (Join-Path $root 'build.ps1') -Jdk $Jdk -Instance $Instance | Out-Null
if ($LASTEXITCODE -ne 0) { throw "build failed" }

# 2) compile the test
if (Test-Path $testOut) { Remove-Item $testOut -Recurse -Force }
New-Item -ItemType Directory -Path $testOut | Out-Null
$testFiles = Get-ChildItem (Join-Path $root 'test') -Recurse -Filter *.java | ForEach-Object { $_.FullName }
& $javac -encoding UTF-8 -nowarn -Xlint:none -cp "$outStub;$outDir" -d $testOut $testFiles
if ($LASTEXITCODE -ne 0) { throw "test compilation failed" }

# 3) run it with a clean scratch config directory
if (Test-Path $scratch) { Remove-Item $scratch -Recurse -Force }
New-Item -ItemType Directory -Path $scratch | Out-Null
Push-Location $scratch
try {
    & $java -cp "$outStub;$outDir;$testOut" dshgt6bridge.test.TestMain
    $code = $LASTEXITCODE
} finally {
    Pop-Location
}
if ($code -ne 0) { Write-Host "self test failed"; exit $code }

# 4) pre-flight link audit: every net.minecraft.* reference in the compiled classes must exist in
#    FML's runtime SRG mapping with the same name and descriptor (guards against NoSuchMethodError)
$py = 'C:\Users\TR\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe'
$audit = Join-Path (Split-Path -Parent $root) 'tools\audit-links.py'
$srg = Join-Path (Split-Path -Parent $root) 'tools\deobf_data.txt'
if ((Test-Path $py) -and (Test-Path $audit) -and (Test-Path $srg)) {
    Write-Host '[4/5] link audit against the runtime SRG mapping'
    & $py $audit --classes (Join-Path $outDir 'dshgt6bridge') --srg $srg
    $auditCode = $LASTEXITCODE
    if ($auditCode -ne 0) { Write-Host 'link audit failed'; exit $auditCode }
} else {
    Write-Host '[4/5] link audit skipped (python / audit script / mapping not found)'
}

# 5) the removal backends call other mods by reflection: verify every target still exists
$modAudit = Join-Path (Split-Path -Parent $root) 'tools\audit-mod-targets.py'
$removals = 'E:\game\minecraft\gt6\.minecraft\versions\GT6\config\gt6bridge\removals.csv'
if ((Test-Path $py) -and (Test-Path $modAudit)) {
    Write-Host '[5/6] removal target audit against the installed mods'
    & $py $modAudit --source (Join-Path $root 'src\dshgt6bridge\RecipeRemover.java') --removals $removals
    $modCode = $LASTEXITCODE
    if ($modCode -ne 0) { Write-Host 'mod target audit failed'; exit $modCode }
} else {
    Write-Host '[5/6] removal target audit skipped'
}

# 6) the CraftTweaker / MineTweaker script API is loaded reflectively - verify its references
$crtAudit = Join-Path (Split-Path -Parent $root) 'tools\audit-crt-refs.py'
if ((Test-Path $py) -and (Test-Path $crtAudit)) {
    Write-Host '[6/6] CraftTweaker script API audit'
    & $py $crtAudit --classes (Join-Path $outDir 'dshgt6bridge\crt')
    $crtCode = $LASTEXITCODE
    if ($crtCode -ne 0) { Write-Host 'script API audit failed'; exit $crtCode }
} else {
    Write-Host '[6/6] CraftTweaker script API audit skipped'
}

# 7) the report the mod writes must stay parseable by the tools: run the analyzer and the
#    acceptance check against the fixture report the self test just produced
$toolsDir  = Split-Path -Parent $root
$fixture   = Join-Path $scratch 'config\gt6bridge\report.txt'
$fixtureCfg = Join-Path $scratch 'config\gt6bridge'
$analyze = Join-Path $toolsDir 'tools\gt6bridge-analyze.ps1'
$accept  = Join-Path $toolsDir 'tools\acceptance-check.ps1'
if (Test-Path $fixture) {
    Write-Host '[7/9] analyzer against the fixture report'
    & powershell -NoProfile -ExecutionPolicy Bypass -File $analyze -Report $fixture `
        -OutDir (Join-Path $scratch 'suggestions') | Select-String -Pattern 'suggestions|written|unknown material tokens|removed' | ForEach-Object { "  $($_.Line)" }
    if ($LASTEXITCODE -ne 0) { Write-Host 'analyzer failed on the fixture report'; exit $LASTEXITCODE }
    $suggested = Join-Path $scratch 'suggestions\materials-suggested.csv'
    if (-not (Test-Path $suggested)) { Write-Host 'analyzer wrote no materials-suggested.csv'; exit 1 }
    $rows = @(Get-Content $suggested | Where-Object { $_ -notmatch '^\s*#' -and $_.Trim() -ne '' })
    Write-Host "  analyzer suggestion rows: $($rows.Count)"
    if ($rows.Count -lt 1) { Write-Host 'analyzer produced no suggestion for the fixture (Cobaltum should yield one)'; exit 1 }

    Write-Host '[8/9] acceptance check against the fixture report'
    & powershell -NoProfile -ExecutionPolicy Bypass -File $accept -Report $fixture -ConfigDir $fixtureCfg |
        Select-String -Pattern 'PASS|FAIL|WARN|ACCEPTANCE' | ForEach-Object { "  $($_.Line)" }
    if ($LASTEXITCODE -ne 0) { Write-Host 'acceptance check failed on the fixture report'; exit $LASTEXITCODE }

    Write-Host '[9/9] config lint against the fixture config'
    $lint = Join-Path $toolsDir 'tools\lint-config.py'
    if ((Test-Path $py) -and (Test-Path $lint)) {
        & $py $lint --config $fixtureCfg | Select-String -Pattern 'LINT' | ForEach-Object { "  $($_.Line)" }
    } else {
        Write-Host '  config lint skipped'
    }
} else {
    Write-Host '[7-9] tool chain checks skipped (no fixture report)'
}

Write-Host "exit code: 0"
exit 0