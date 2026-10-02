<#
    Reports whether Minecraft is currently running.

    Strong signals (a running game always produces at least one of them):
      * a java.exe / javaw.exe process
      * a world's session.lock being held exclusively (only a loaded world does that)
      * the newest log grew within the last 30 seconds
      * the newest log ends in a session start without a later shutdown
    Weak signals (also produced by file indexers, antivirus, backup tools - NOT enough alone):
      * options.txt / mods jars being held open

    Exit code 0 = running, 1 = closed. A weak-only verdict is reported as UNCERTAIN and still
    exits 1, so deploy.cmd is not blocked forever by an unrelated process holding a handle.

    Usage: powershell -NoProfile -ExecutionPolicy Bypass -File game-check.ps1 [-Instance <path>]
#>
param(
    [string]$Instance = 'E:\game\minecraft\gt6\.minecraft\versions\GT6'
)

$strong = New-Object System.Collections.Generic.List[string]
$weak   = New-Object System.Collections.Generic.List[string]

function Test-Exclusive([string]$path) {
    try {
        $fs = [System.IO.File]::Open($path, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
        $fs.Close()
        return $true
    } catch {
        return $false
    }
}

# 1) a loaded world holds its session.lock exclusively - strong
Get-ChildItem (Join-Path $Instance 'saves') -Filter 'session.lock' -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    if (-not (Test-Exclusive $_.FullName)) {
        $strong.Add("world session.lock is held: $($_.Directory.Name)")
    }
}

# 2) process list (may be invisible to a sandboxed shell, so it is only one signal)
foreach ($img in @('java.exe', 'javaw.exe')) {
    $o = cmd /c "tasklist /FI `"IMAGENAME eq $img`"" 2>&1
    if ($o -match [regex]::Escape($img)) { $strong.Add("process $img is running") }
}

# 3) logs: recent growth and the last session marker
$log = Join-Path $Instance 'logs\latest.log'
if (Test-Path $log) {
    $a = (Get-Item $log).LastWriteTime
    Start-Sleep -Seconds 3
    $b = (Get-Item $log).LastWriteTime
    if ($b -ne $a) { $strong.Add('log is still growing') }
    elseif (((Get-Date) - $b).TotalSeconds -lt 30) { $strong.Add("log was written $([int]((Get-Date) - $b).TotalSeconds)s ago") }

    $tail = Get-Content $log -Tail 400 -ErrorAction SilentlyContinue
    $lastStart = -1; $lastStop = -1; $i = 0
    foreach ($line in $tail) {
        $i++
        if ($line -match 'Starting integrated minecraft server|Loading tweak class name|Forge Mod Loader version') { $lastStart = $i }
        if ($line -match 'SoundSystem shutting down|\[Client thread/INFO\]: Stopping!|Stopping server') { $lastStop = $i }
    }
    if ($lastStart -gt $lastStop -and $lastStart -gt 0) { $strong.Add('newest log ends in a running session') }
}

# 4) handles on files that indexers/backup tools also touch - weak
foreach ($p in @((Join-Path $Instance 'options.txt'), (Join-Path $Instance 'mods\gt6bridge.jar'))) {
    if (-not (Test-Path $p)) { continue }
    if (-not (Test-Exclusive $p)) { $weak.Add("handle held on $(Split-Path $p -Leaf)") }
}

if ($strong.Count -gt 0) {
    Write-Host "RUNNING: $($strong -join '; ')$(if ($weak.Count) { "   [weak: $($weak -join ', ')]" })"
    exit 0
}
if ($weak.Count -gt 0) {
    Write-Host "CLOSED (uncertain: $($weak -join ', ') - likely an indexer/backup/antivirus process, no game signal)"
    exit 1
}
Write-Host 'CLOSED'
exit 1
