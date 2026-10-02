# GT6 整合包魔改（配方）准备工作清单

> 生成时间：基于当前实例的实测结果
> 实例根目录：`E:\game\minecraft\gt6\`
> 游戏目录：`.minecraft\versions\GT6\`（HMCL 游戏目录 = `.minecraft`，版本隔离 = `versions\GT6`）

---

## 0. 现状速览（已实测）

| 项目 | 实测结果 |
|---|---|
| MC / Forge | 1.7.10 / Forge 10.13.4.1614 |
| 格雷 | `gregtech_1.7.10-6.17.06.jar`（modid `gregtech`，`gregapi_post` 同源） |
| mod 数量 | `mods/` 下 115 个 jar（另有 `mods-disabled/` 4 个：binnie-mods 旧版、ClimateControl、RTG、ThaumicAllAspect） |
| CraftTweaker | `CraftTweaker-1.7.10-3.1.0-legacy.jar`（modid `MineTweaker3`，3.1.0）**已装、已加载** |
| 其他 tweaker | `ModTweaker2-0.9.6.jar`、`externaltweaker-1.7.10-0.3.jar`（GUI 生成脚本用），**均无 GT6 集成** |
| MTUtils | **未安装**（`mods/` 内无 `MTU*`） |
| 脚本目录 | `.minecraft\versions\GT6\scripts\` **完全为空** |
| 日志证据 | `fml-client-latest.log`：`MTTweaker:load: Loading scripts`，`minetweaker.log` 为 0 字节 |
| GT6 自带配方配置 | `.minecraft\versions\GT6\config\recipes\*.cfg`，**84 个**机器配方文件，最大 `mixer.cfg` 5.4MB |
| JDK | `java`/`javac` = Liberica **JDK 8** `C:\Program Files\BellSoft\LibericaJDK-8`（可直接编译 1.7.10 mod） |
| 已有自研 mod 经验 | `avaritia-de-bridge\`（手写 stub + javac 出 jar）。注意 `stub\` 里的 `net.minecraft.*` 桩类**不能**打包进游戏 jar |
| 存档 | `saves\新的世界`，含 40+ 个 Galacticraft/MorePlanets 维度；`config\id-audit-report.txt` 记录过 ID 审计 |
| 版本管理 | **无**（无 `.git`），`tools\config-backup\` 是唯一历史备份 |

### 关键结论：GT6 不吃普通 CraftTweaker

Greg 本人没给 GT6 写 MineTweaker 集成（`ConfigCategories` 里也搜不到 ZenScript 接口，`externaltweaker`/`modtweaker2` 的 jar 内**零个** `gregtech` 相关类）。
GT6 的机器配方走的是自己的一套 API：

```
gregapi.recipes.Recipe$RecipeMap.RECIPE_MAPS   // key -> 配方表（gt.recipe.crusher 等）
gregapi.recipes.Recipe$RecipeMap.mConfigFile   // 每张表绑定 config/recipes/<name>.cfg
gregapi.recipes.Recipe                         // mInputs/mOutputs/mFluid*/mChances/mDuration/mEUt/mSpecialItems
gregapi.data.RM                                // 所有 RecipeMap 的 key 常量
gregapi.data.FL                                // 所有流体名常量（<liquid:...> 用）
```

所以魔改路径只有三条，**第一条必须先装东西**：

1. **MTUtils（社区标准做法）** —— CraftTweaker 的 GT6 附加，暴露 `mods.MTUtilsGT`；
2. **GT6 原生 `config/recipes/*.cfg`** —— 零新增依赖，但有覆盖范围限制（见 §3.2）；
3. **自写小型 Forge mod 调 `gregapi` API** —— 覆盖面最大，可复用 `avaritia-de-bridge` 的编译流程（见 §3.3）。

---

## 1. 备份与可回滚（先做，10 分钟）

1. **热备最小集**（改动会碰到的全部内容，约几 MB）：
   ```
   .minecraft\versions\GT6\config\        （含 recipes\ 全部 84 个 cfg）
   .minecraft\versions\GT6\scripts\
   .minecraft\versions\GT6\gregtech.cfg
   .minecraft\versions\GT6\minetweaker.log
   ```
2. **冷备一份 `mods\` 列表 + 哈希**，锁定「改之前那一版」：
   ```powershell
   $v='.minecraft\versions\GT6'
   Get-ChildItem "$v\mods" -File -Filter *.jar |
     Get-FileHash -Algorithm SHA1 |
     ForEach-Object { "$($_.Hash)  $($_.Path)" } |
     Set-Content tools\mods-baseline.sha1
   ```
   > 意义：GTNH 分叉版（`-GTNH` 后缀）和老原版**共用 modid 但 ID 映射不同**，配方脚本里 `<modid:name:meta>` 会随 mod 版本漂移。没有这份基线，改完出错无法判断是配方问题还是 mod 被换过。
3. **给 `versions\GT6` 建 git**（`config\`、`scripts\`、`*.cfg` 均可文本 diff；`saves\`、`logs\`、`mods\` 走 `.gitignore`）：
   ```powershell
   cd .minecraft\versions\GT6
   git init; @('saves/','logs/','mods/','crash-reports/','resourcepacks/','Xaero*','backups/') | Set-Content .gitignore
   git add -A; git commit -m "baseline before recipe tweaks"
   ```
4. **确认「改之前能不能正常玩」**：当前最后一次成功启动是 `2026-10-02 21:20`（`logs\latest.log` 尾部仍在保存 40+ 维度区块 = 正常退出）。
   但 `crash-reports\` 里有 17 份崩溃报告，都是**配方无关的 ID/兼容问题**，必须先清干净（见 §6），否则改配方的 A/B 测试全是噪声。

---

## 2. 把「当前状态」变成可复现（关键，别跳）

1. 记录精确版本矩阵 → `tools\versions.md`：GT 6.17.06、CraftTweaker 3.1.0、NEI 2.8.155-GTNH、GTNHLib 0.11.52、hodgepodge 2.7.211……（`fml-client-latest.log` 第 39378 行有完整 165-mod 清单，可直接抄）。
2. 决定**改配方的作用域**：
   - 只在本地存档生效（改 `config\recipes`）
   - 还是随整合包分发（`scripts\*.zs` + 新增 mod jar + `config\`）
   两者需要的交付物完全不同，先定下来。
3. 决定**是否同时支持服务端**：`scripts\` 是客户端+服务端各自加载的；GT 机器配方在服务端权威。单人没问题，开服必须让服务端也有同一份 `scripts\` 与 `config\recipes\`。

---

## 3. 三条魔改路径的准备

### 3.1 路径 A：MTUtils（推荐先走这条）

* **要做的准备**：把 `MTUtils` 装进 `mods\`。它依赖 `MineTweaker3`（已有 3.1.0，满足）。
* **下载渠道**：CurseForge 项目页 [`MTUtils`](https://www.curseforge.com/minecraft/mc-mods/mtutils)（本机直连被 Cloudflare 403，需你在浏览器里下）；源码 [`LionZXY/MTUtils`](https://github.com/LionZXY/MTUtils)。
  ⚠️ 先确认**文件版本对应的 GT6 版本**：MTUtils 活跃期是 GT6 6.06~6.09（2017-2019），本实例是 **6.17.06（2023+）**，`gregapi` 包名/签名可能已变。装了先跑空脚本，看 `minetweaker.log` 有没有 `mods.MTUtilsGT` 解析错误。
* **准备查询手段**（改配方前必做）：
  * `/mtu gtkeys` —— 列出全部 GT 机器配方 key；报错信息形如 `Not found variable gt.recipe.mixer in gregapi.recipes.Recipe.RecipeMap` 就是 key 不存在。
  * `/mt liquids` —— 列出全部流体名（**输出写进 `minetweaker.logs`，日志里翻**），对应 `gregapi.data.FL`。
  * key 常量源码：[`gregapi/data/RM.java`](https://git.gregtech.overminddl1.com/GregTech-6/GT6/src/branch/master/src/main/java/gregapi/data/RM.java)；流体：[`gregapi/data/FL.java`](https://git.gregtech.overminddl1.com/GregTech-6/GT6/src/branch/master/src/main/java/gregapi/data/FL.java)。
* **必须提前知道的坑**（来自 [Mechaenetia 官方教程帖](https://forum.mechaenetia.com/t/tutorial-change-gt6-recipes-mtutils/985)、[MC百科中文补充](https://www.mcmod.cn/post/1184.html)）：
  | 现象 | 处理 |
  |---|---|
  | `/mt reload` 后配方越加越多 | MTUtils 只能在**首次加载**时移除 GT 配方 → 改脚本后**整个重启 MC**，别用 `/mt reload` 验证删除类改动 |
  | 数组形式的输入液体报错 | 已知 bug，改成单条/或按帖子里 `*0`、多条目写法绕 |
  | 想让某个物品**不被消耗**（透镜、选择器标签） | 把该物品堆叠数写成 `*0`（Greg 亲自确认的用法） |
  | 涡轮/热交换器的燃料配方、坩埚熔炼温度 | MTUtils **改不了**，只能改 GT6 源码或写 mod（`gregtech/loaders/b/Loader_Fuels.java`、`gregapi/data/FM.java`） |
  | 输入槽位数量不足 | 配方静默不生效，先确认目标机器 `mInputItemsCount`/`mInputFluidCount` |
* **脚本组织**：`scripts\` 按主题分文件（`00_remove.zs`、`10_gt_machines.zs`、`20_other_mods.zs`），全部**先删后加**，避免加载顺序踩踏。参考 `神秘纪元 v1.7.3` 的成熟写法见 [GT6-魔改脚本参考（借鉴神秘纪元）.md](GT6-魔改脚本参考（借鉴神秘纪元）.md)。
* **文件编码**：`.zs` 一律存 **UTF-8 无 BOM**；中文不要直接写在字符串里，按参考包的做法用 `game.setLocalization("zh_CN","key","\uXXXX…")`（该包把中文写成 `\u` 转义或用拼音 key，规避乱码）。

### 3.2 路径 B：GT6 原生 `config\recipes\*.cfg`

* **是什么**：GT6 把每张配方表的可持久化部分 dump 成 Forge 配置格式，键 = `内部名 + ';' + 数值`，值 = 数值：
  ```ini
  # .minecraft\versions\GT6\config\recipes\crusher.cfg
  crusher {
      I:"blockSolidObsidian;_600"=600
      I:"dustIron;_32"=32          # 键名 = 输入/输出内部名, 值 = 处理耗时(tick)
  }
  ```
  `turbine_fuels.cfg` → `I:"steam;_5"=5`；`gas_fuels.cfg` → `I:"hydrogen;_2"=2`。
* **准备**：先做**读写验证实验**（不要盲目手改）：
  1. 备份 `config\recipes\`；
  2. 改一条明显配方（如 `crusher.cfg` 里某个耗时），**不新建世界**，重启进游戏看 NEI 是否变；
  3. 再重启一次，看文件是否被 GT6 重新生成覆盖 → 若被覆盖，说明它只是 **dump（只写不读）**，此路只能当参考表用。
* **覆盖范围限制（已验证）**：`anvil.cfg`、`calciner.cfg`、`cooker.cfg`、`polarizer.cfg`、`molecular_scanner.cfg` 等是**空文件**（只有 `# Configuration file`），且没有 `assembler.cfg`、`cncmachine.cfg`、`blastfurnace.cfg`、`vacuumfreezer.cfg`、`debarker.cfg` —— 说明**走固定 ItemStack / 特殊栈的配方（NBT、机器本体、组装机等）不会被写进配置**，这部分必须走路径 A/C。
* **实证：这些 cfg 至少是「GT6 按当前实际配方重新生成」的产物**。与同版本 GT6（6.17.06）的参考整合包 `神秘纪元 v1.7.3` 对比，两边**文件数量完全一致（78 个），内容按各自 mod 表不同**：
  * `coke_oven.cfg` 多出 `item.erebus.materials.bamboo;_1800`、`item.itembamboo;_1800`（该包有 Erebus/竹），本实例没有；
  * `sharpener.cfg` 该包 2.1KB（含 `gemDiamond`、`ingotEnderium`、`toolHeadRawAxe*` 等），本实例仅 102B；
  * `turbine_fuels.cfg` 两边完全一致。
  → **含义**：① 可用它反推"某条 GT 配方是否存在"；② 跨包搬运这些 cfg 需要过滤掉本实例不存在的物品名，否则会污染配方表。
* **优点**：零新增 mod、可文本 diff、可进 git；适合微调**材料类**配方（尘/锭/宝石/岩石）。

### 3.3 路径 C：自写小 mod（覆盖 `FM` 燃料图、坩埚温度、组装机等）

* **准备**：
  1. JDK 8 已就绪（`javac` 可用）；
  2. 需要一个**可编译的 1.7.10 工程**。当前 `avaritia-de-bridge` 是"手写 stub + javac"的极简做法，**不适合**要写实际逻辑的 mod（stub 里的 `net.minecraft.*` 会污染 classpath）。建议改用 ForgeGradle 2.x + `forge-1.7.10-10.13.4.1614`（需要网络拉依赖），或从已有 GT6 mod 源码（[`GregTech6/gregtech6`](https://github.com/GregTech6/gregtech6)）里拷 `gregapi` 包做编译期依赖；
  3. 拦截点：`@Mod` 的 `preInit/postInit` 里遍历 `Recipe.RecipeMap.RECIPE_MAPS` 增删 `mRecipeList`/`mRecipeItemMap`，或直接调 `FM.*.addRecipe0(...)`；
  4. 生产 jar 放 `mods\`，**删掉 stub 类**再打包。
* **成本**：一次搭环境约 1~2 小时，之后每加一条配方成本极低。若打算大改（>100 条配方）或要动燃料/温度，这条迟早要走。

---

## 4. 查询与定位体系（改配方效率的核心）

改配方 80% 的时间花在"这个物品叫什么"上。GT6 的物品名是**内部名**，不是显示名：

| 需求 | 手段 |
|---|---|
| 手上物品的内部名 | `/mt hand`（CraftTweaker 命令）→ 输出到 `minetweaker.log` |
| GT6 材料/前缀的内部名 | `gregapi.data.MT`（材料）、`TD.Prefix`（前缀）；玩家侧看 Waila/NEI 提示（`gregtech.cfg` 的 `visibility.InternalNames` 可开内部名显示） |
| 机器/配方 key | `/mtu gtkeys`；静态表见 `RM.java` |
| 流体名 | `/mt liquids`；静态表见 `FL.java` |
| 这个物品到底有没有 GT 配方、配方长什么样 | 游戏内 NEI（`NotEnoughItems-2.8.155-GTNH`）翻 GT 页面；GT6 自带 `/gt` 命令族（含 debug 输出，可先 `B:logs_false=true` 打开 GT 日志） |
| 存档级 ID 对照 | `config\UniqueNames.txt`（456KB）、`tools\id-audit-report.txt`、`tools\id-audit.ps1`、`tools\id-renumber.ps1` |

**开 debug**：`gregtech.cfg` → `debug { B:logs_false=true }`；NEI 侧需要时再配 handler 过滤（`config\NEI\hiddenhandlers.cfg`、`handlerordering.csv`）。

---

## 5. 测试与验收流程（每条配方都走一遍）

1. **静态加载检查**：启动后看 `minetweaker.log` / `logs\crafttweaker.log`，**零 error**（warning 建议也清零，GT6 配方冲突常表现为 warning）。
2. **NEI 反查**：目标机器的 NEI 页面里
   - 我加的配方在 → 且**旧配方不在**（删干净了）
   - 用 `U`/`R` 反查输入/输出，确认没有残留的重复路径。
3. **实机跑一次**：机器里放材料，确认 EU/t、耗时、产出概率、副产、流体量与预期一致（`mChances` 是万分比：`10000 = 100%`）。
4. **存档兼容**：老存档里已存在的机器/半成品是否还能继续跑（删配方不影响已放置的机器，但会影响自动化产线）。
5. **回归**：列出本次改动的"受影响产线清单"，逐条在 NEI 里确认下游配方仍可达。
6. **每次改动单独 commit**，commit message 写清 `key + 输入 → 输出 + 数值`，方便二分定位哪次改动导致崩。

---

## 6. 改配方之前必须先清掉的阻塞项

`crash-reports\` 里 17 份崩溃报告（2026-10-02 当天）显示实例**经常起不来**，这些与配方无关但会彻底堵住测试：

| 崩溃 | 原因 | 修法 |
|---|---|---|
| `Two space station types registered with the same home planet ID: -29` | Galacticraft 系空间站 ID 撞车（GalaxySpace/ExtraPlanets/MorePlanets/AmunRa 四方都注册空间站） | 在各自 cfg 里把 `spaceStationId` 错开 |
| `Please change "mothershipProviderID" ... -39 is already in use by sol\saturn\rhea` | AmunRa `mothershipProviderID` 与 GalaxySpace 冲突 | 改 `config\GalacticraftAmunRa.cfg` |
| `Advanced Rocketry spaceStationId -2 is already registered` | AR 空间站 ID 冲突 | 改 `config\advRocketry\*.cfg` |
| `[asjpatcher] WEBiomeID is set to 40 - occupied with Storage Cell (appeng.spatial.BiomeGenStorage)` | ASJCore 生物群系 ID 与 AE2 冲突 | 改 `config\ASJCore.cfg`，跑 `tools\id-audit.ps1` 复核 |
| `Invalid id 8061 - maximum id range exceeded` | 方块 ID 溢出（`endlessids` 已装但配置可能未生效） | 检查 `config\endlessids.cfg`（`B:extendBlockIDs` 等），确认 `endlessids` 各子模块都加载 |
| `NoClassDefFoundError: magicbees/.../AlleleEffectRecharge` | magicbees 2.10.12-GTNH 与 Binnie 2.6.48 版本错配 | 对齐 binnie/magicbees/extrabees 版本（注意 `mods-disabled\binnie-mods-1.7.10-2.0.22.7.jar` 是旧版） |
| `NoClassDefFoundError: fox/spiteful/avaritia/items/tools/ItemPickaxeInfinity` | `avaritia-de-bridge` 是给 *另一个* Avaritia 版本做的桩，当前 Avaritia-1.99 不匹配 | 重新对 Avaritia-1.99 生成 bridge，或停用 bridge |
| `codechicken/nei/api/API` | 启动顺序/NEI 版本问题（历史一次） | 已自愈则忽略，复现再查 NEI 2.8.155 与 CodeChickenCore 1.4.22 组合 |
| `Could not get provider type for dimension 0` / `Ticking entity` fastutil NPE | 维度/实体数据损坏或 mod 卸载遗留 | 老存档问题，建议**新开测试世界**做配方验证，别拿主存档试 |

**验收前提：连续 3 次"启动 → 进世界 → 退出"无崩溃**，再开始改配方。

---

## 7. 建议的执行顺序（可直接当 TODO）

- [ ] **P0-1** 备份 `config\`、`scripts\`、`gregtech.cfg`；生成 `tools\mods-baseline.sha1`
- [ ] **P0-2** 给 `versions\GT6` 建 git repo，提交 baseline
- [ ] **P0-3** 复现并修掉 §6 的启动崩溃，达成"连续 3 次干净启停"；**开一个新的超平坦/创造测试世界**专门用于配方验证
- [ ] **P0-4** 记录版本矩阵到 `tools\versions.md`
- [ ] **P1-1** 下载 MTUtils（确认版本 ↔ GT6 6.17.06 兼容），装进 `mods\`，空脚本启动，确认 `mods.MTUtilsGT` 可解析、`/mtu gtkeys` 有输出
- [ ] **P1-2** 跑 `/mt liquids` 收集流体名 → 存 `tools\fluids.txt`；`/mtu gtkeys` 输出 → 存 `tools\recipe-keys.txt`
- [ ] **P1-3** 写 1 条"无害"测试配方（如给研磨机加一条铁锭→铁粉），走完 §5 全流程，确认工具链闭环
- [ ] **P2-1** 逐条实施正式魔改，按主题拆 `scripts\*.zs`，一条一 commit
- [ ] **P2-2** 对 MTUtils 覆盖不到的（燃料图、坩埚温度、组装机/CNC/高炉/真空冷冻）评估走路径 B/C
- [ ] **P2-3** 定稿：导出 `config\recipes\` + `scripts\` + 新增 mod jar 清单，写版本说明

---

## 8. 参考资料

- [Mechaenetia 论坛：Change GT6 Recipes (MTUtils)](https://forum.mechaenetia.com/t/tutorial-change-gt6-recipes-mtutils/985) —— API 签名、全部配方 key 列表、已知 bug
- [MC百科：MTUtils——GT6 魔改教程（中文补充）](https://www.mcmod.cn/post/1184.html) —— `removeAllRecipes` / `addFluidInput` 用法
- [CurseForge: MTUtils](https://www.curseforge.com/minecraft/mc-mods/mtutils) —— 下载
- [GT6 源码（gregapi/data/RM.java、FL.java、recipes/Recipe.java、loaders/b/Loader_Fuels.java）](https://git.gregtech.overminddl1.com/GregTech-6/GT6) —— key/流体/API 权威定义
- [Mechaenetia 论坛：How do I modify GregTech default recipe?](https://forum.mechaenetia.com/t/how-do-i-modify-gregtech-default-recipe/675) —— 社区讨论

---

### 附：本实例中与配方相关的文件位置（相对于 `E:\game\minecraft\gt6\`）

```
.minecraft\versions\GT6\mods\gregtech_1.7.10-6.17.06.jar      GT6 本体（gregapi API 在此）
.minecraft\versions\GT6\mods\CraftTweaker-1.7.10-3.1.0-legacy.jar
.minecraft\versions\GT6\mods\ModTweaker2-0.9.6.jar            非 GT6 的其他 mod 配方
.minecraft\versions\GT6\mods\externaltweaker-1.7.10-0.3.jar   GUI 生成 .zs
.minecraft\versions\GT6\scripts\                              CraftTweaker 脚本（当前为空）
.minecraft\versions\GT6\config\recipes\*.cfg                  GT6 机器配方持久化（84 个）
.minecraft\versions\GT6\config\gregtech\                      GT6 分项配置
.minecraft\versions\GT6\gregtech.cfg                          可见性/调试开关
.minecraft\versions\GT6\minetweaker.log                       CraftTweaker 输出（当前 0 字节）
.minecraft\versions\GT6\logs\crafttweaker.log                 （首次运行后生成）
.minecraft\versions\GT6\logs\gregtech.log                     GT 日志（开 debug 后有内容）
.minecraft\versions\GT6\config\UniqueNames.txt                名称/ID 对照
.minecraft\versions\GT6\config\NEI\                            NEI 隐藏项与 handler 配置
tools\id-audit.ps1 / id-renumber.ps1 / id-audit-report.txt    既有 ID 审计工具
avaritia-de-bridge\                                           既有自研 mod 工程（编译流程参考）
```
