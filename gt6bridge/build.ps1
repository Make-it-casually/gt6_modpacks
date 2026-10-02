<#
    gt6bridge build script - plain javac + jar, no Gradle / no network.

    Usage:
        pwsh -File build.ps1                 # compile and package gt6bridge.jar
        pwsh -File build.ps1 -Deploy         # ... and copy the jar into the instance mods folder

    The mod is compiled against:
      * its own compile-time stubs in stub\  (net.minecraft.* / cpw.mods.fml.* / net.minecraftforge.*
        as they are named inside the developer environment; the real classes are supplied at runtime)
      * the real GregTech 6 jar, so every GT6 API call is compile-time checked.
#>
param(
    [switch]$Deploy,
    [string]$Jdk = 'C:\Program Files\BellSoft\LibericaJDK-8\bin',
    [string]$Instance = 'E:\game\minecraft\gt6\.minecraft\versions\GT6'
)

$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcDir  = Join-Path $root 'src'
$stubDir = Join-Path $root 'stub'
$outDir  = Join-Path $root 'out'
$outStub = Join-Path $root 'out-stub'
$jarPath = Join-Path $root 'gt6bridge.jar'
$gt6Jar  = Join-Path $Instance 'mods\gregtech_1.7.10-6.17.06.jar'
# optional: CraftTweaker / MineTweaker is needed to compile the script API (src\dshgt6bridge\crt)
$mtJar   = Get-ChildItem (Join-Path $Instance 'mods') -Filter '*Tweaker*.jar' -ErrorAction SilentlyContinue |
           Where-Object { $_.Name -match 'CraftTweaker|MineTweaker' } | Select-Object -First 1 -ExpandProperty FullName

$javac = Join-Path $Jdk 'javac.exe'
$jar   = Join-Path $Jdk 'jar.exe'
foreach ($tool in @($javac, $jar)) {
    if (-not (Test-Path $tool)) { throw "missing JDK tool: $tool" }
}
if (-not (Test-Path $gt6Jar)) { throw "missing GT6 jar: $gt6Jar" }

foreach ($d in @($outDir, $outStub)) {
    if (Test-Path $d) { Remove-Item $d -Recurse -Force }
    New-Item -ItemType Directory -Path $d | Out-Null
}

function Invoke-Javac([string[]]$files, [string]$classpath, [string]$dest) {
    $argList = @('-encoding', 'UTF-8', '-nowarn', '-Xlint:none', '-d', $dest)
    if ($classpath) { $argList += @('-cp', $classpath) }
    $argList += $files
    & $javac @argList
    if ($LASTEXITCODE -ne 0) { throw "javac failed (exit $LASTEXITCODE)" }
}

# 1) compile the stubs once, into a directory that is NOT packaged
$stubFiles = Get-ChildItem $stubDir -Recurse -Filter *.java | ForEach-Object { $_.FullName }
if ($stubFiles.Count -eq 0) { throw "no stub sources found in $stubDir" }
Write-Host "[1/3] compiling $($stubFiles.Count) stub source(s)"
Invoke-Javac $stubFiles '' $outStub

# 2) compile the mod against stubs + the real GT6 jar (+ MineTweaker when present)
$srcFiles = Get-ChildItem $srcDir -Recurse -Filter *.java | ForEach-Object { $_.FullName }
if ($mtJar) {
    Write-Host "[2/3] compiling $($srcFiles.Count) mod source(s) against GT6 + $(Split-Path $mtJar -Leaf)"
    Invoke-Javac $srcFiles "$outStub;$gt6Jar;$mtJar" $outDir
} else {
    Write-Host "[2/3] compiling $($srcFiles.Count) mod source(s) against GT6 (no script mod found - script API excluded)"
    $noCrt = $srcFiles | Where-Object { $_ -notmatch '\\crt\\' }
    Invoke-Javac $noCrt "$outStub;$gt6Jar" $outDir
}

# 3) package only the mod package + mcmod.info (never the stubs)
Copy-Item (Join-Path $root 'mcmod.info') (Join-Path $outDir 'mcmod.info') -Force
if (Test-Path $jarPath) { Remove-Item $jarPath -Force }
Write-Host "[3/3] packaging $jarPath"
& $jar cf $jarPath -C $outDir dshgt6bridge -C $outDir mcmod.info
if ($LASTEXITCODE -ne 0) { throw "jar failed (exit $LASTEXITCODE)" }

$info = Get-Item $jarPath
Write-Host ("built {0} ({1} bytes)" -f $info.FullName, $info.Length)

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($jarPath)
Write-Host "contents:"
$zip.Entries | ForEach-Object { Write-Host ("  {0}  ({1})" -f $_.FullName, $_.Length) }
$zip.Dispose()

if ($Deploy) {
    $target = Join-Path $Instance 'mods\gt6bridge-0.1.jar'
    Copy-Item $jarPath $target -Force
    Write-Host "deployed to $target"
}
