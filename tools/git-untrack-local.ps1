# =============================================================================
# git-untrack-local.ps1
#
# 目标：让"本地测试日志 / 世界存档 / 大体积二进制"不再被 git 上传。
#
# 背景：
#   E:\game\minecraft\gt6\.minecraft\versions\GT6 已经是一个 git 仓库（分支 run），
#   里面的 logs\、crash-reports\、saves\、mods\ 等早就被提交进去了。
#   只加 .gitignore 是【不够的】—— 已跟踪文件不受 .gitignore 影响，
#   必须用 git rm --cached 把它们从索引里摘掉。
#
# 安全保证：
#   本脚本【只用 git rm --cached】，--cached 表示"只从 git 索引移除，磁盘文件原封不动"。
#   你的存档、日志、mod 包都不会被删。
#
# 用法（在 E:\game\minecraft\gt6 下开 PowerShell）：
#   .\tools\git-untrack-local.ps1 -WhatIf          # 先预览，不做任何修改
#   .\tools\git-untrack-local.ps1                  # 真正执行
#   .\tools\git-untrack-local.ps1 -WhatIf -Full     # 额外把 mods\ / resourcepacks\ 也摘掉
# =============================================================================

[CmdletBinding()]
param(
    # 除了日志/世界，是否连 mods\、mods-disabled\、resourcepacks\、natives\ 也一起取消跟踪
    [switch]$Full,
    # 只预览不修改
    [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'

# --- 1. 定位并校验仓库 ------------------------------------------------------
Write-Host '[1/6] 定位仓库'
$top = (git rev-parse --show-toplevel 2>$null)
if (-not $top) {
    Write-Host '✖ 当前目录不是 git 仓库。请先 cd 到 E:\game\minecraft\gt6\.minecraft\versions\GT6' -ForegroundColor Red
    exit 1
}
$top = $top -replace '/', '\'
Set-Location $top
$branch = git rev-parse --abbrev-ref HEAD
Write-Host ("  ✔ 仓库根目录: {0}（分支 {1}）" -f $top, $branch)

if (-not (Test-Path -LiteralPath (Join-Path $top '.gitignore'))) {
    Write-Host '✖ 找不到 .gitignore，中止' -ForegroundColor Red
    exit 1
}
if (Test-Path -LiteralPath (Join-Path $top '.git\index.lock')) {
    Write-Host '✖ 发现 .git\index.lock，可能有 git 正在运行，中止' -ForegroundColor Red
    Write-Host '   若确认没有 git 在跑，手动删除：Remove-Item .git\index.lock -Force'
    exit 1
}

# --- 2. 要取消跟踪的路径（字面路径，不含通配符）-----------------------------
$dirs = @(
    'logs',                          # 本地测试日志
    'crash-reports',                 # 崩溃报告
    'saves',                         # 世界存档（核心诉求）
    'backups',
    'datapacks',
    'XaeroWorldMap',                 # 世界地图缓存
    'XaeroWaypoints',                # 路径点
    'XaeroWaypoints_BACKUP032021',
    'serverutilities',               # 本地运行时数据
    'opencomputers',
    'coretweaks',
    'falsepattern',
    '.hmcl'
)
$files = @(
    'minetweaker.log',
    'usernamecache.json',
    'BotaniaVars.dat',
    'optionsnf.txt',
    'GT6.jar',
    'gregtech.lang',
    'desktop.ini'
)
if ($Full) {
    $dirs += @('mods', 'mods-disabled', 'resourcepacks', 'shaderpacks', 'natives-windows-x86_64', 'libraries')
}

# --- 3. 逐个统计将要摘掉的内容 ---------------------------------------------
Write-Host ''
Write-Host '[2/6] 将要取消跟踪（仅从 git 索引移除，磁盘文件保留）'
$plan = @()
foreach ($d in $dirs) {
    if (-not (Test-Path -LiteralPath $d)) { continue }
    $n = @(git ls-files -- "$d").Count
    if ($n -gt 0) { $plan += [pscustomobject]@{ Kind = 'dir'; Path = $d; Count = $n } }
}
foreach ($f in $files) {
    if (-not (Test-Path -LiteralPath $f)) { continue }
    $n = @(git ls-files -- "$f").Count
    if ($n -gt 0) { $plan += [pscustomobject]@{ Kind = 'file'; Path = $f; Count = $n } }
}
if ($plan.Count -eq 0) { Write-Host '  没有需要处理的条目。'; exit 0 }
$plan | ForEach-Object { '  {0,-5} {1,-32} {2,5} 个' -f $_.Kind, $_.Path, $_.Count }
'  ------------------------------------------------'
'  合计 {0} 个文件' -f (($plan | Measure-Object -Property Count -Sum).Sum)

if ($WhatIf) {
    Write-Host ''
    Write-Host '[预览模式] 未做任何修改。确认无误后去掉 -WhatIf 再运行。' -ForegroundColor Yellow
    exit 0
}

# --- 4. 执行取消跟踪 --------------------------------------------------------
Write-Host ''
Write-Host '[3/6] 执行 git rm --cached'
foreach ($p in $plan) {
    git rm -r --cached --quiet -- $p.Path
    if ($LASTEXITCODE -ne 0) {
        Write-Host ("  ✖ {0} 失败" -f $p.Path) -ForegroundColor Red
        exit 1
    }
    '  ✔ {0,-32} 已从索引移除' -f $p.Path
}

# --- 5. 把 .gitignore / .gitattributes 也纳入本次提交 ------------------------
Write-Host ''
Write-Host '[4/6] 暂存规则文件'
foreach ($r in '.gitignore', '.gitattributes') {
    if (Test-Path -LiteralPath $r) { git add -- $r; '  ✔ {0} 已暂存' -f $r }
}

# --- 6. 暂存区概览 + 提交 ---------------------------------------------------
Write-Host ''
Write-Host '[5/6] 暂存区概览'
git diff --cached --shortstat

Write-Host ''
Write-Host '[6/6] 提交'
$msg = "chore: 忽略本地测试日志与世界存档`n`n- 新增 .gitignore / .gitattributes`n- 取消跟踪 logs\ crash-reports\ saves\ Xaero* serverutilities\ 等本地运行产物`n- 仅 git rm --cached，磁盘文件未改动"
git commit -q -m $msg
if ($LASTEXITCODE -ne 0) {
    Write-Host '  ✖ 提交失败（可能没配 user.name / user.email）' -ForegroundColor Red
    exit 1
}
git --no-pager log --oneline -1

Write-Host ''
Write-Host '✔ 完成。校验：' -ForegroundColor Green
'  索引条目数: {0}' -f @(git ls-files).Count
'  工作区状态（前 10 条）:'
git status --short | Select-Object -First 10
