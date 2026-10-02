# id-renumber.ps1 - move conflicting 1.7.10 ID allocations into the extended space
#
# Requires EndlessIDs with extendBiome/extendPotion enabled (biome ids -> 65536,
# potion ids -> 65536). EndlessIDs does NOT extend dimension ids, so dimensions are
# handled separately (see the id-audit report).
#
# Every rule is offset-based per mod, which preserves each mod's internal ordering
# while moving its whole allocation out of contested ranges.
#
# Run:
#   $sb = [scriptblock]::Create((Get-Content tools\id-renumber.ps1 -Raw))
#   & $sb -ConfigDir ".minecraft\versions\GT6\config" -BackupDir "tools\config-backup"

param(
    [string]$ConfigDir = (Join-Path (Get-Location) '.minecraft\versions\GT6\config'),
    [string]$BackupDir = (Join-Path (Get-Location) 'tools\config-backup')
)

$ErrorActionPreference = 'Stop'

$rules = @(
    # ---------------- BIOMES (contested 41-213 bands) ----------------
    @{ File='thebetweenlands\mainConfig.cfg';  Kind='keylike'; Pattern='*Biome ID';   Offset=250;  Expect=7  }
    @{ File='utilitiesinexcess.cfg';           Kind='keyset';  Keys=@('underWorldBiomeId','endOfTimeBiomeId','defaultBiomeId'); Offset=260; Expect=4 }
    @{ File='advRocketry\advancedRocketry.cfg';Kind='keyset';  Keys=@('moonBiomeId','alienForestBiomeId','hotDryBiome','spaceBiomeId','stormLandsBiomeId','crystalChasmsBiomeId','deepSwampBiomeId','moonBiomeDarkId','marsh','oceanSpires'); Offset=210; Expect=10 }
    # NOTE: ASJCore's WEBiomeID must stay at its default 40. Its patcher resets the value
    # on startup and its serverStarted check only passes while biome slot 40 is free, so we
    # free slot 40 by moving AE2's spatial storage biome out of it instead of moving ASJCore.
    @{ File='AppliedEnergistics2\AppliedEnergistics2.cfg'; Kind='keyset'; Keys=@('storageBiomeID'); Abs=3000; Expect=1 }
    @{ File='ExtraPlanets.cfg';                Kind='keylike'; Pattern='*Biome ID';   Offset=1000; Expect=40 }
    @{ File='GalaxySpace\biomes.conf';         Kind='keylike'; Pattern='IDSpace*';    Offset=2000; Expect=13 }
    @{ File='GalaxySpace\biomes.conf';         Kind='keyset';  Keys=@('IDWorldEngineBiome'); Offset=2000; Expect=1 }
    @{ File='MorePlanets.cfg';                 Kind='keylike'; Pattern='*Biome ID';   Offset=3000; Expect=20 }
    @{ File='atum.cfg';                        Kind='keyset';  Keys=@('Atum Desert Biome ID'); Abs=800; Expect=1 }
    @{ File='enviromine\CaveDimension.cfg';    Kind='keyset';  Keys=@('Cave Biome ID'); Abs=423; Expect=1 }
    # Betweenlands refuses biome ids > 127 by default; the extended space needs it off
    @{ File='thebetweenlands\mainConfig.cfg';  Kind='bool';    Keys=@('Biome ID Limit'); Value='false'; Expect=1 }

    # ---------------- POTIONS (contested 20-116 band) ----------------
    @{ File='witchery.cfg';                    Kind='section'; Section='potions';   Offset=600;  Expect=30 }
    @{ File='witchery.cfg';                    Kind='keyset';  Keys=@('PotionStartID'); Offset=600; Expect=1 }
    @{ File='Alfheim\mod.cfg';                 Kind='keylike'; Pattern='potionID*';  Offset=800;  Expect=30 }
    @{ File='thebetweenlands\mainConfig.cfg';  Kind='keylike'; Pattern='bl.elixir.*';Offset=400;  Expect=30 }
    @{ File='etfuturum\enchantspotions.cfg';   Kind='section'; Section='potions';   Offset=1300; Expect=1 }
    @{ File='biomesoplenty\ids.cfg';           Kind='keylike'; Pattern='*Potion ID'; Offset=1400; Expect=2 }
)

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$report = New-Object System.Collections.Generic.List[string]
function Say($s) { $report.Add($s); Write-Host $s }

$byFile = $rules | Group-Object { $_.File }
foreach ($grp in $byFile) {
    $rel  = $grp.Name
    $path = Join-Path $ConfigDir $rel
    if (-not (Test-Path $path)) { Say "SKIP  $rel (not found)"; continue }

    # backup once per file
    $safe = $rel -replace '[\\/]','__'
    Copy-Item -LiteralPath $path -Destination (Join-Path $BackupDir "$safe.bak") -Force

    $bytes = [System.IO.File]::ReadAllBytes($path)
    $hasBom = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
    $text = [System.Text.Encoding]::UTF8.GetString($bytes)
    if ($hasBom) { $text = $text.Substring(1) }
    # Split keeping the line separators so the original line endings are preserved
    # exactly (a plain `-split "`n"` leaves a stray CR and doubles blank lines).
    $parts = [regex]::Split($text, '(\r\n|\n)')
    $stack = New-Object System.Collections.Generic.List[string]
    $counts = @{}
    foreach ($r in $grp.Group) { $counts[$r.GetHashCode()] = 0 }

    for ($i = 0; $i -lt $parts.Count; $i += 2) {
        $line = $parts[$i]
        # section tracking
        if ($line -match '^[ \t]*([^{}\r\n]+?)[ \t]*\{[ \t]*$') { $stack.Add($Matches[1].Trim().Replace('"','')); continue }
        if ($line -match '^[ \t]*\}[ \t]*$') { if ($stack.Count -gt 0) { $stack.RemoveAt($stack.Count - 1) }; continue }

        $section = ($stack -join ' > ')
        foreach ($r in $grp.Group) {
            $k = $r.GetHashCode()
            if ($r.Kind -eq 'bool') {
                if ($line -match '^[ \t]*B:[ \t]*(?<k>.+?)[ \t]*=[ \t]*(?<v>true|false)[ \t]*$') {
                    $kk = $Matches['k'].Replace('"','').Trim()
                    if ($r.Keys -contains $kk) {
                        $parts[$i] = $line -replace '=\s*(true|false)\s*$', "= $($r.Value)"
                        $counts[$k]++
                    }
                }
                continue
            }
            if ($line -notmatch '^[ \t]*I:[ \t]*(?<k>.+?)[ \t]*=[ \t]*(?<v>-?\d+)[ \t]*$') { continue }
            $kk = $Matches['k'].Replace('"','').Trim()
            $vv = [int]$Matches['v']
            $hit = $false
            switch ($r.Kind) {
                'keylike' { if ($kk -like $r.Pattern) { $hit = $true } }
                'keyset'  { if ($r.Keys -contains $kk)  { $hit = $true } }
                'section' { if ($section.ToLowerInvariant().Contains($r.Section.ToLowerInvariant())) { $hit = $true } }
            }
            if (-not $hit) { continue }
            $new = if ($r.ContainsKey('Abs')) { [int]$r.Abs } else { $vv + [int]$r.Offset }
            $parts[$i] = ($line -replace '=(?<sp>\s*)-?\d+\s*$', ('= ' + $new))
            $counts[$k]++
        }
    }

    # assert change counts
    $ok = $true
    foreach ($r in $grp.Group) {
        $n = $counts[$r.GetHashCode()]
        if ($n -lt $r.Expect) { Say ("FAIL  {0}  [{1}/{2}] expected >= {3} changes" -f $rel, $r.Kind, ($r.Pattern + $r.Section + ($r.Keys -join ',')), $r.Expect); $ok = $false }
    }
    if (-not $ok) { Say "      -> file left UNCHANGED"; continue }

    $out = ($parts -join '')
    if ($hasBom) { [System.IO.File]::WriteAllText($path, $out, (New-Object System.Text.UTF8Encoding($true))) }
    else         { [System.IO.File]::WriteAllText($path, $out, (New-Object System.Text.UTF8Encoding($false))) }
    $total = ($counts.Values | Measure-Object -Sum).Sum
    Say ("OK    {0,-42} {1} values renumbered" -f $rel, $total)
}

Say ""
Say "backups: $BackupDir"
