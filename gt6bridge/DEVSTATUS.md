# gt6bridge 开发进度文档

> 生成时间：2026-10-03 00:05（本会话第 24 轮）
> 目标实例：`E:\game\minecraft\gt6\.minecraft\versions\GT6`（MC 1.7.10 / Forge 10.13.4.1614 / GT6 6.17.06）
> 本文档只写**本会话中实际用工具核实过**的内容；未核实的一律标注。

---

## 1. 一句话状态

**mod 本体已完成并可编译、部署（v0.6，82,576 字节已装进 mods/），构建与审计共 9 道闸门全绿；差最后一步：一次游戏内启动来产出真实报告并据此配置三份表。**

当前阻塞点：**从未用 v0.6 跑过游戏** —— 磁盘上的报告仍是旧版 0.4 留下的（`links.failed: 24`、`errors: 36`），因此 ①层的真实绑定数字、NEI/机器实测、③层的真实删除效果都还没有数据。

---

## 2. 交付物清单

| 类别 | 路径 | 状态 |
|---|---|---|
| mod jar | `mods\gt6bridge.jar`（v0.6，82,576 B，SHA256 `FB44A2A9…C2934`） | 已部署（哈希与构建产物一致） |
| 源码 | `gt6bridge\src\dshgt6bridge\`（19 个 .java） | 完成 |
| 编译桩 | `gt6bridge\stub\`（SRG 名字的手写桩，仅编译期，不进 jar） | 完成 |
| 构建/测试 | `gt6bridge\build.ps1`、`test.ps1`、`deploy.cmd` | 完成 |
| 配置表 | `config\gt6bridge\settings.csv`、`materials.csv`、`recipes.csv`、`removals.csv`、`autorules.csv` | 就绪（安全首跑状态，lint 通过） |
| 报告 | `report.txt`、`report-preinit.txt`（v0.6 新增 `materials-known.txt`） | 待首次运行刷新 |
| 脚本示例 | `scripts\gt6bridge-example.zs` | 就位（默认全部注释） |
| 文档 | `gt6bridge\README.md`、`ACCEPTANCE.md`、`DEVSTATUS.md`（本文档） | 完成 |
| 工具链 | `tools\` 下 11 个脚本（见 §6） | 完成并验证 |

---

## 3. 已完成内容

### 3.1 ① 材料绑定层（核心）

按矿物词典把**非 GT6 mod 的矿/锭/粉/板/齿轮等物品**绑定到 GT6 的 `OreDictMaterial` / `OreDictItemData`。

* 全量扫描矿物词典（本包实测 **300,955** 个名字），按**最长前缀优先**拆分「前缀 + 材料」。例：`dustSmallSignalum` → `dustSmall` + `Signalum`。
* 前缀表来自运行期 `OreDictPrefix.VALUES`（实测 **468** 项），并按首字母分桶（453 个前缀 → 每个名字只比对约 20 个），先解析后取物品列表，配合 `scanBudgetMs` 预算限制（默认 20 s）。
* 绑定用 `setItemData` → `addItemData` → `OM.data(stack,d)` 三级兜底，**每次写入后回读校验**（`bindings.verified` / `bindings.verifyFailed`）。这一点是必须的：`OM.data(Stack,Data)` 是 void，`addItemData_` 在已有数据时静默拒绝。
* 防误绑开关：`skipMods`（整 mod 排除）、`skipItems`（按物品种选择器排除，支持通配符）、`onlyPrefixes`（只绑定指定前缀）。
* 安全阀 `bindOnlyWithGt6Item`：仅当 GT6 对该前缀+材料确实有物品时才绑定（避免绑到 GT6 自动生成的 invalid 材料上）。
* 统计区分：`alreadyBound`（GT6 已绑好）、`skipped.lockedAutoInvalid`（GT6 已写入自动生成数据、运行期无法改写，需改用 `create:` 建档）、`skipped.noGt6Item`、`skipped.alreadyHandledThisRun`（同一物品挂多个词典名时去重）。
* 绑定后调用 `Recipe.reInit()` 重建配方索引（实测约 240–280 ms）。

**已知的官方机制依据（从 GT6 字节码与日志核实）**：GT6 查询配方时会先对输入做统一化，再让各配方处理器的 `addRecipesUsing` 现场生成配方；因此「绑定成功」即可让 GT6 机器与 NEI 识别外部物品。Crusher/Mortar/Shredder/Anvil 等有处理器，Smelter/Furnace 没有 → 需要 ②层补配方。

### 3.2 ② 配方层

* `recipes.csv`：`<map>,<inputs>,<outputs>[,eut,duration,optimize,note]`
  * 多输入（`+` 连接 = 一条多输入配方，走 `addRecipeX`）；
  * 概率产物 `@chance`（`@50` = 50%，`@5000` = 50%，走 `long[]` 重载）；
  * 两种重载的参数顺序均已用字节码核对为 **(optimize, EUt, duration, …)**。
* `autorules.csv`：按词典前缀批量补配方（如 `dust,Smelter,ingot`），可走 `RM.generify`。默认全部 `enabled=false`。
* `create:` 建档：在 PreInit 创建 GT6 不认识的材料（含自由 ID 扫描），并在报告里记录。

### 3.3 ③ 删除层

20 个后端 + 10 个前缀族注册：

| 目标 | 覆盖 |
|---|---|
| `crafting` / `furnace` | 原版工作台、熔炉 |
| `te_*` | TE 打粉机、红石炉、锯木机、坩埚、充能器、感应炉、种植机、沉淀器、挤出机（9） |
| `ic2_<machine>` | IC2 任意机器（打粉/压缩/提取/离心/切割/洗涤…），族注册 |
| `ae2_inscriber` | AE2 压印器 |
| `actuallyadditions_crusher` | AA 粉碎机 |
| `railcraft_*` | 碎石机等 4 个 |
| `enderio_*` | 合金炉、切片机、研磨机、魂炉等 5 个 |
| `galacticraft_*` | 压缩机、电路制造台 |

* 选择器：`mod:name[:meta]`、`mod:*`、`*:name`、`*:ore*`、`*:*`、`ore:<词典名>`。
* **默认干跑**（`removalDryRun=true`）：只统计"会删多少"，报告逐后端列出；改成 false 才真正删除，且删除只发生在内存，重启即恢复。
* 预设 14 行（TE/IC2/AA/Railcraft/EnderIO/GC 的"矿石→粉"等），首次运行即可看到干跑计数。

### 3.4 CraftTweaker / MineTweaker 脚本 API（v0.6 新增）

包里的 `CraftTweaker-1.7.10-3.1.0-legacy.jar` 实际是 **MineTweaker 3**（modid `MineTweaker3`，包 `minetweaker.*`）。mod 在 PreInit 用**纯反射**注册 ZenClass（未装脚本 mod 时自动跳过）：

```zenscript
import mods.gt6bridge.Bridge;
Bridge.bind("Cobaltum", "Cobalt");                              // 材料 token → GT6 材料（优先于 CSV）
Bridge.skip("TofuMetal");                                       // 永不绑定
Bridge.bindItem("EnderIO:itemAlloy:6", "ingot", "Enderium");     // 指定物品 → 前缀/材料
Bridge.addRecipe("Mixer", [<ore:ingotCopper>, <ore:ingotTin>], [<minecraft:gold_ingot>], 30, 64);
Bridge.removeRecipe("te_pulverizer", "*:ore*");                 // 显式指令：真正删除
Bridge.countRemovable("ic2_macerator", "*:ore*");               // 只统计
Bridge.apply();  Bridge.status();  Bridge.version();
```

* **时机设计**：MineTweaker 在 `PostInit` 执行脚本（已 javap `minetweaker.mc1710.MineTweakerMod.onPostInit/onComplete` 核实），gt6bridge 的自动绑定在 `LoadComplete` → 脚本的 `bind/skip` 正好赶在自动扫描前生效；配方/删除请求先入队，由各阶段统一应用。

### 3.5 实例环境修复（与 mod 无关但影响该实例）

`config\hodgepodge.cfg` 的 `B:threadedWorldDataSaving=false`：原值 true 时线程化世界数据保存在 Windows 上必然抛 `InvalidPathException: Illegal char <:>`（`reccomplex:structuredata`、`thebetweenlands:worldData`），导致这两个 mod 的世界数据从未落盘。已关闭并验证报错归零。备份在 `tools\config-backup\hodgepodge.cfg.bak-20261002-213836`。

---

## 4. 验证矩阵（9 道闸门，当前全绿）

| # | 闸门 | 结果 |
|---|---|---|
| 1 | 单元自检（CSV/设置/报告/物品 token/前缀拆分/脚本覆盖/反射/link check/配置监听） | `checks: 110, failures: 0` |
| 4 | `net.minecraft.*` 引用 vs 运行时 SRG 映射（防 `NoSuchMethodError`） | AUDIT OK（35 个类，0 未解析） |
| 5 | 删除后端反射目标 vs 已装 mod（类+成员存在性，沿继承链） | MOD TARGET AUDIT OK（25 项） |
| 6 | CraftTweaker 脚本 API 引用 vs 已装 jar | CRT API AUDIT OK |
| 7 | 分析器（吃 **mod 自己写的**仿真报告） | 3 条建议 |
| 8 | 验收判定（同上） | ACCEPTANCE PASSED 6/6 |
| 9 | 配置 lint（5 张表逐一校验） | CONFIG LINT OK |
| — | 运行检测 `game-check.ps1` | 强/弱信号分级，避免假阳性阻塞部署 |

其中 7–9 是**端到端闭环**：自检用 mod 的 `Report` 类生成生产格式的报告 → 分析器/验收/lint 直接消费它，所以"报告格式与工具解析不一致"这类问题在启动前就能暴露（实际已借此抓到 1 个假阴性）。

---

## 5. 未完成内容（按优先级）

### P0 —— 必须由我在你启动游戏后才能做

| 项 | 说明 | 验收依据 |
|---|---|---|
| ① 真实绑定数据 | v0.6 从未运行；报告的 `bindings` / `bindings.verified` / 未知 token 清单都还是空的 | `report.txt` 出现 `links.failed: 0` 且 `bindings > 0` |
| ① NEI / 机器实测 | 对准外部 mod 的锭按 U 应出现 GT6 机器页；外部矿石/粉进 GT6 粉碎机应能加工 | `ACCEPTANCE.md` B、C 段 |
| ③ 真实删除 | 目前 `removalDryRun=true`，只干跑；未验证过任何后端实际删除 | 报告 `removed per backend` 各后端计数 + NEI 页消失 |
| ② 生效配方 | `recipes.csv` 现在只有注释示例，`autorules.csv` 全部 `enabled=false` | 报告 `added per recipe map` / `autorules.added` |

### P1 —— 数据到手后我才能定的事

* `create:` 建档：**该路径从未执行过**（当前无 `create:` 行）。已备好短名单 `tools\create-candidates-metals.txt`（7 个太空金属 + 若干可选）。决策依据：每建档一个材料，GT6 会为它的每个前缀生成物品 → NEI 膨胀，所以只挑科技线需要的。
* 三份表的最终内容：`materials.csv`（现有 3 条别名绑定 + 8 条显式跳过）、`removals.csv`（据干跑计数筛掉"匹配 0 条"的行）、`autorules.csv`（据报告里 `autorules.available.*` 计数启用）。
* CrT 脚本 API 的**实机确认**：需一次启动看到日志 `[gt6bridge] CraftTweaker/MineTweaker API registered as mods.gt6bridge.Bridge`，并用 `.zs` 实测一条 `Bridge.bind`。

### P2 —— 待确认/低优先级

* `materials-known.txt`（运行期材料表 dump）首次运行后才会出现；出现后分析器的材料匹配会从静态 1544 个名单升级为运行时全表（**2313** 个）。
* 实例目录曾在 23:42:02 出现"内容回退到 22:26 状态"的现象（`report.txt` 内容是旧的但 mtime 是新的、我写的 settings 新键消失、`scripts\` 目录一度消失）。**原因未确认**，需你确认是否用过启动器回滚/还原；若不是，说明有后台同步工具在动这个目录，后续部署需先哈希校验。
* 与目标无关的遗留崩溃：`crash-2026-10-02_21.55.53-client.txt`（Alfheim `ItemSplashPotion.func_77624_a` NPE，既有 `dim0guard` mixin 无效）。曾提出可修，未动手。

---

## 6. 工具链说明

| 脚本 | 作用 |
|---|---|
| `build.ps1` | 编译桩 → 编译 mod（自动带上 CraftTweaker jar；缺失则跳过脚本包）→ 打包（只含 `dshgt6bridge` + mcmod.info） |
| `test.ps1` | 9 道闸门（见 §4），任一失败即非零退出 |
| `deploy.cmd` | 部署 jar 到 mods/，内置"游戏在运行就拒绝" |
| `game-check.ps1` | 判断游戏是否运行：强信号（java 进程/世界 session.lock/日志 30 s 内增长/无停止标记）+ 弱信号（句柄被占，可能只是索引/杀毒进程） |
| `audit-links.py` | 编译产物里每个 `net.minecraft.*` 引用 vs FML 的 SRG 映射 |
| `audit-mod-targets.py` | 删除后端/IC2 机器字段/AE2/AA 目标 vs 已装 mod 的 javap |
| `audit-crt-refs.py` | CraftTweaker 脚本 API 引用 + `registerClass` 反射目标 |
| `lint-config.py` | 5 张配置表预检（材料名 1544、配方表 88、后端 20+10 族、词典前缀 453、设置键 12） |
| `gt6bridge-analyze.ps1` | 读报告 → `tools\suggestions\` 下出 `materials-suggested.csv` / `removals-final.csv` / `autorules-suggested.csv` / `analyze-summary.txt` / `next-steps.txt` |
| `acceptance-check.ps1` | 把 `ACCEPTANCE.md` 的硬指标变成 PASS/FAIL（含按配置的条件检查） |
| `gt6bridge-postrun.ps1` | 启动后一键：配置 lint → 加载证据 → 分析器 → 验收 |
| `classify-unknown.py` / `find-oredict-owner.py` | 离线分析 GT6 未知矿物词典条目，并定位到注册它的 jar |

---

## 7. 本会话修掉的缺陷（踩坑记录）

| # | 现象 | 根因 | 修复 |
|---|---|---|---|
| 1 | 首次真机报告 `links.failed: 12`，`NoSuchMethodError: ItemStack.getItem()` | 用了 MCP 名字，运行期是 SRG 名字 | 桩与代码全部改 SRG；新增 `audit-links.py` 闸门 |
| 2 | `te_furnace` 删除后端静默无效 | 类名写成 `RedstoneFurnaceManager`（实际 `FurnaceManager`） | 修正；新增"删除目标审计"闸门（正是它抓到的） |
| 3 | `skipMods, Foo , BAR` 只读到第一个值 | CSV 解析只取第二格 | `Settings` 合并后续格；标量取首段、列表取全部 |
| 4 | 多输入配方被静默降级为单输入 | `RecipeAdder` 只用了 `inputs[0]` | 改用 `addRecipeX`（参数序经字节码核对） |
| 5 | 概率产物不支持 | 未用 `long[]` 重载 | 实现 `@chance`（`@50`=50%，`@5000`=50%） |
| 6 | `autorules.csv` 一行前缀 `purified` 无效 | GT6 实际叫 `crushedPurified` | 修正；新增 `lint-config.py`（它抓到的） |
| 7 | 验收脚本把"零错误"判成 FAIL | `errors` 计数器在 0 错误时不存在 | 验收脚本把缺失视为 0；报告改为总是写 `errors: 0` |
| 8 | 仿真报告是空壳 | 它在其他测试写报告之前生成、被覆盖 | 移到测试列表末尾 |
| 9 | `bind()` 可能虚报成功 | `OM.data(stack,d)` 是 void setter | 三级兜底后一律**回读校验** |
| 10 | javac 报错 | 用 PowerShell `Set-Content -Encoding utf8` 改源码写入了 BOM | 去掉 BOM；改用编辑工具改源码 |
| 11 | `game-check` 假阳性阻塞部署 | 仅凭句柄被占就判"运行中" | 强/弱信号分级 |

---

## 8. 需要你做的事（解除阻塞）

1. **启动一次游戏**（进不进世界都行；绑定发生在主菜单之前的 LoadComplete 阶段）。
2. 启动后告诉我一声，我会跑 `tools\gt6bridge-postrun.ps1`，然后给你：
   * 加载证据链（`gt6bridge{0.6}` 状态位无 `E`、CrT 注册行、`pass finished ... 0 error(s)`）；
   * 真实绑定数与未知 token 清单（含物品数、示例物品、来源 mod）；
   * 每个删除后端的干跑计数；
   * 分析器建议 + 验收判定。
3. 顺便确认：23:42 那次实例目录内容回退是**你**做的（启动器回滚/还原）吗？
4. 若中途需要重新部署：**先正常退出游戏**再让我动 jar（运行中替换会 `NoClassDefFoundError`）。

---

## 9. 版本历史

| 版本 | 内容 | 说明 |
|---|---|---|
| 0.1–0.3 | stub 构建流水线、三层骨架、CSV 读取、报告与诊断成型 | 早期阶段；本会话未见到这些版本的报告，故不列细节 |
| 0.4 | 首次真机运行（22:10 / 22:23 / 22:26 / 22:58 多次会话） | 暴露 MCP/SRG 链接失败（`links.failed: 24`） |
| 0.5 | 全部改 SRG 名字；TE 熔炉类名；`skipMods`/`skipItems`/`onlyPrefixes`；多值 CSV；扫描分桶+预算；多输入配方；概率产物；`materials-known.txt` | 本次部署前磁盘上的版本 |
| **0.6** | **CraftTweaker/MineTweaker 脚本 API**；报告 `errors: 0` 自描述；`bind()` 回读校验；工具链 9 道闸门（含端到端仿真闭环与配置 lint） | **当前已部署**（82,576 B，`FB44A2A9…`） |
