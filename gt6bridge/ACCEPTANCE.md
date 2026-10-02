# gt6bridge 验收清单

> 前提：`mods\gt6bridge.jar` 已安装，且游戏是在装好之后启动的（运行中替换 jar 会导致 NoClassDefFoundError）。
> 报告位置：`config\gt6bridge\report.txt`、`report-preinit.txt`、`materials-known.txt`。

## A. 启动阶段（不用进世界就能看）

| 检查点 | 期望 |
|---|---|
| 日志 `[gt6bridge] pre-init done: ...` | `0 error(s)`；如果你填了 `create:` 行，会显示创建了几个材料 |
| 日志 `[gt6bridge] load-complete pass finished in ...` | 秒级完成，`0 error(s)`（有错误也会继续，不会崩游戏） |
| `report.txt` 顶部 `links.failed` | **0**（非 0 表示运行期 API 名字对不上，把 `runtime link check` 段发我） |
| `timing.recipeReInit.ms` | 通常几百毫秒 |

## B. NEI 验收（最直观）

1. 打开 NEI，搜索**外部 mod 的锭**：例如 EnderIO 的 Enderium 锭（`itemAlloy:6`）或 TE 的 Signalum 锭。
2. 对着它按 **U（用途）**：应能看到 **GT6 机器配方页**（Crusher / Mortar / Shredder 等）——这些是 GT6 的配方处理器按材料**当场生成**的。
   对照：GT6 自己的铁锭按 U 应出现同样类型的页面；两者结构一致即为通过。
3. 对着它按 **R（配方）**：若已启用 `autorules.csv`（`enableAutoRules,true` + `dust,Smelter,ingot,...`），应能看到 GT6 熔炼/转换配方。
4. 搜索外部 mod 的**粉/矿**，按 U：GT6 Crusher/Mortar 页应出现。

## C. 机器实测

1. 把外部 mod 的**矿石/粉碎矿**放进 GT6 的 Crusher / Mortar → 能加工并给出 GT6 产物（外部物品已被统一到 GT6 材料）。
2. 启用 `ingot,Generifier,same,1,0,1,true,true` 后，把外部 mod 的锭放进 GT6 的 Generifier → 变成 GT6 的锭。
3. 反向（③层之外的桥接，属于后续扩展）：GT6 的物品进 TE/IC2 机器仍走它们自己的配方。

## D. 删除层验收（先把 `removalDryRun` 改成 `false`）

1. `removals.csv` 里保留你确认要删的行（`removals-final.csv` 是分析器按干跑结果筛出来的版本）。
2. 启动后 `report.txt` 的 `-- removed per backend --` 会列出每个后端实际删掉的条数。
3. 游戏内：TE 打粉机 / IC2 打粉机 / EnderIO 研磨机里，矿石→粉的配方应消失（NEI 对应页同步消失）。
4. **不满意可直接改回**：删除只发生在内存，重启即恢复原样；把 `removalDryRun` 改回 `true` 就只统计不删。

## E. 出问题怎么反馈

| 现象 | 处理 |
|---|---|
| `report.txt` 有 `-- errors --` | 把这一段整体发我（含前面的 `runtime link check` 与 `GT6 API diagnostics` 段） |
| NEI 里看不到 GT6 机器页 | 发我 `bindings` / `bindings.verified` / `alreadyBound` / `skipped.*` 计数和该物品的 `矿物词典名 -> 物品` 绑定行 |
| 有 `skipped.lockedAutoInvalid` | 这些物品 GT6 早先已存了自动生成的材料数据，运行期无法改写：在 `materials.csv` 用 `create:` 行为该材料建档（PreInit 生效），并在报告里核对材料名 |
| 想立刻停用 | `settings.csv` 改 `enableMaterialBinding,false`（下局生效），或删掉 `mods\gt6bridge.jar` |

## F. 判定"通过"的最小集合

* `links.failed: 0`
* `bindings.verified` ≥ `bindings` 的 95%
* NEI 中外部的锭/粉/矿出现 GT6 机器配方页（B-2/B-4）
* GT6 机器能吃下外部矿石/粉并给出产物（C-1）
