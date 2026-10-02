# gt6bridge — GT6 配方桥接 mod

自写的数据驱动桥接 mod，用来解决 **GregTech 6 与整合包内其它 mod 之间没有配方互通** 的问题。

## 它做三件事

| 阶段 | 作用 | 配置表 |
|---|---|---|
| ⓪ 材料建档 | 给 GT6 不认识的矿物词典材料在 **PreInit** 建真材料（GT6 只给 PreInit 及更早创建的材料生成物品） | `materials.csv` 的 `create:` 行 |
| ① 材料绑定 | 扫描整个 Forge 矿物词典，把外部 mod 的矿/锭/粉/板/齿轮/粒/块按 `前缀 + 材料名` 挂到 GT6 的 `OreDictMaterial` 上 | `materials.csv`（可强制映射/跳过） |
| ② 补 GT6 配方 | 往 GT6 的 80+ 个配方表（Crusher/Mortar/Shredder/Smelter/Mixer/Centrifuge/Electrolyzer/Compressor…）里加配方，也可按前缀批量生成 | `recipes.csv`、`autorules.csv` |
| ③ 删别人的配方 | 删除其它科技 mod 自带配方（原版 + TE/IC2/AE2/AA/Railcraft/EnderIO/Galacticraft 共 15 个后端） | `removals.csv` |
| 开关 | 干跑、只绑定有 GT6 对应物品的材料、自动规则总开关 | `settings.csv` |

配置文件与报告在 `config/gt6bridge/`，第一次启动时自动生成（含格式说明），**改配方不需要重新编译 mod**。

## 为什么①层就够了（关键机制）

反编译 GT6 6.17.06 确认：GT6 的配方表在**查询配方时**会调用
`IRecipeMapHandler.addRecipesUsing(map, ..., stack, OM.data_(stack))`
（见 `Recipe$RecipeMap.findRecipeInternal` / `getNEIRecipes` / `getNEIUsages`）。

也就是说，只要一个外部物品在 GT6 里有了 `prefix + material` 数据，
GT6 机器和 NEI 就会**当场为它生成对应配方**——不需要我们逐个补配方。
所以①层是主干，②层只用于材料体系覆盖不到的特殊配方。

绑定调用链：`OreDictManager.INSTANCE.setItemData/addItemData(stack, new OreDictItemData(prefix, material))`。

## 目录结构

```
gt6bridge/
  build.ps1          # 纯 javac + jar 构建（无需 Gradle/网络）
  src/dshgt6bridge/  # mod 源码
  stub/              # 编译期 stub（net.minecraft.* / cpw.mods.fml.*），不打进 jar
  out/ out-stub/     # 编译产物
  gt6bridge.jar      # 成品
```

构建：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File build.ps1          # 只编译
powershell -NoProfile -ExecutionPolicy Bypass -File build.ps1 -Deploy  # 编译并复制进 mods/（沙箱内会被拒，见下）
```

安装（沙箱进程对 `.minecraft` 子树不可写，所以由你自己执行一次）：

* 双击 `deploy.cmd`（把 `gt6bridge.jar` 复制成 `mods\gt6bridge.jar`），或手动把 `gt6bridge.jar` 拖进 `mods\`。
* 启动游戏一次即可（进主菜单就会触发），生成 `config/gt6bridge/*.csv`、`report-preinit.txt` 和 `report.txt`。

> ⚠ **绝对不要在游戏运行时替换 `mods\gt6bridge.jar`。**
> FML 的类加载器只在启动时读取 jar，运行中换文件会让后续加载的类抛
> `NoClassDefFoundError / ClassNotFoundException`，该次会话的 FML 状态机会变成 ERRORED，
> 表现就是"加载世界退回主菜单"。`deploy.cmd` 已经内置了 java 进程检查；
> 手工替换前也请先完全退出游戏。

说明：Forge 通用 jar 里没有 deobf 的 `net.minecraft.*`，所以沿用本整合包既有的做法——
自己写编译期 stub；运行时由 FML 提供真实类，stub 绝不打包。

### ⚠ 关键：运行期成员名是 SRG，不是 MCP

1.7.10 运行期把 Minecraft 类去混淆成 **SRG 名字**（`func_77973_b`），**不是** MCP 名字（`getItem`）。
正常 mod 由 ForgeGradle 做一次 MCP→SRG 的重混淆，而本工程是纯 javac，所以 **stub 里必须直接声明 SRG 名字**
（源码里保留 MCP 注释）。踩过一次的真实症状：`NoSuchMethodError: net.minecraft.item.ItemStack.getItem()`，
mod 的材料绑定整段静默失败（自检把它抓了出来，见 `report.txt` 的 `runtime link check` 段）。

映射来源是 forge jar 里的 `deobfuscation_data-1.7.10.lzma`（已解压到 `tools/deobf_data.txt`），
并且与 EnderIO / AE2 / GT6 自身 jar 中实际调用的名字交叉验证过：

| MCP | SRG |
|---|---|
| `ItemStack.getItem()` | `func_77973_b` |
| `ItemStack.getItemDamage()` | `func_77960_j` |
| `ItemStack.copy()` | `func_77946_l` |
| `Item.itemRegistry` | `field_150901_e` |
| `RegistryNamespaced.getNameForObject(Object)` | `func_148750_c` |
| `RegistryNamespaced.getObject(String)` | `func_82594_a` |
| `RegistryNamespaced.getKeys()` | `func_148742_b` |
| `CraftingManager.getInstance()` | `func_77594_a` |
| `CraftingManager.getRecipeList()` | `func_77592_b` |
| `IRecipe.getRecipeOutput()` | `func_77571_b` |
| `FurnaceRecipes.smelting()` | `func_77602_a` |
| `FurnaceRecipes.getSmeltingList()` | `func_77599_b` |

构造函数与 Forge/FML 的成员名**不变**（`new ItemStack(...)`、`OreDictionary.getOres(...)` 直接可用）。

## 表格式速查

`materials.csv`
```
<矿物词典材料名>,<GT6材料名|->[,备注]
Enderium,Enderium
Unobtainium,-,故意跳过
```

`recipes.csv`
```
<GT6配方表>,<输入>,<输出>[,duration,eut,needsEmpty,备注]
Crusher,ore:ingotEnderium,gt:dust:Enderium,20,16,true,示例
```
物品写法：`mod:name[:meta]` / `ore:<矿物词典名>` / `gt:<前缀>:<材料>`，多个用 `+` 连接。

`removals.csv`
```
<目标>,<选择器>[,备注]
crafting,EnderIO:itemAlloy:6
furnace,*:iron_ingot
```

## CraftTweaker / MineTweaker 脚本支持

包里的 `CraftTweaker-1.7.10-3.1.0-legacy.jar` 实际是 MineTweaker 3（modid `MineTweaker3`，包 `minetweaker.*`），
mod 在 PreInit 用反射注册一个 ZenClass（未装脚本 mod 时自动跳过，不会缺类报错）：

```
import mods.gt6bridge.Bridge;

Bridge.bind("Enderium", "Enderium");                       // 材料 token -> GT6 材料（优先于 materials.csv）
Bridge.skip("TofuMetal");                                  // 永不绑定该 token
Bridge.bindItem("EnderIO:itemAlloy:6", "ingot", "Enderium"); // 指定物品 -> 指定 前缀/材料
Bridge.addRecipe("Crusher", [<EnderIO:itemAlloy:6>], [<minecraft:gold_ingot>], 16, 40);
Bridge.addRecipe("Mixer", [<ore:ingotCopper>, <ore:ingotTin>], [<minecraft:bronze_ingot>]);
Bridge.removeRecipe("te_pulverizer", "*:ore*");            // 显式指令：真正删除（不受 removalDryRun 影响）
print(Bridge.countRemovable("ic2_macerator", "*:ore*"));    // 先问会删多少（不改动）
print(Bridge.apply());                                     // 立刻跑一遍各阶段并返回统计摘要
print(Bridge.status());  /  Bridge.version();
```

* **时机**：MineTweaker 在 `PostInit` 执行脚本，而 gt6bridge 的自动绑定在 `LoadComplete` —— 所以脚本里的
  `bind`/`skip` 正好赶在自动扫描之前生效；`addRecipe`/`removeRecipe` 先入队，由各阶段统一应用
  （`removeRecipe` 会真正删除，`countRemovable` 只统计）。需要立即生效时调用 `Bridge.apply()`。
* 示例脚本见 `scripts\gt6bridge-example.zs`（默认全部注释）。
* 三道闸门之外还多了一道 **CrT API 审计**（`tools/audit-crt-refs.py`）：核对我引用的每个
  `minetweaker.*` / `stanhebben.*` 成员在已装 jar 里真实存在，避免脚本 API 静默失效。

## 配置预检

启动前先跑 `tools\lint-config.py`（或 `gt6bridge-postrun.ps1` 的第 0 步），它会核对：

| 表 | 校验内容 |
|---|---|
| `settings.csv` | 键名是否存在（对着 Settings.java 里注册的 12 个键），缺键给出提示 |
| `materials.csv` | 第二列必须是 `-`、`create:名称` 或 GT6 真实材料名（对着 1544 个材料名） |
| `recipes.csv` | 配方表名必须在 `gregapi.data.RM`（88 个）里；token 形态；EUt/时长必须是数字 |
| `removals.csv` | 目标名必须是 20 个后端之一或 10 个前缀族之一；选择器非空 |
| `autorules.csv` | 第一列必须是 GT6 的 453 个词典前缀之一；配方表名合法 |

它已经抓到过真错：`autorules.csv` 里写成 `purified`（GT6 实际叫 `crushedPurified`）。

## 验证方式

* **第一次启动想零风险**：把 `settings.csv` 里的 `dryRun` 改成 `true`。整条扫描照跑、报告照写（列出"将会绑定"的每一条），但不改 GT6 任何数据、也不重建配方索引；看完报告再改回 `false` 真正生效。
* 报告里每个阶段都有耗时（`timing.*.ms`），方便判断是不是某个阶段卡住。
* `bindLimit` 是保险阀：>0 时绑定到 N 条就停（默认 0 = 不限）。

* 纯 JVM 自检（不需要启动游戏）：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File test.ps1
```
  覆盖 CSV 解析（注释/空行/引号/三种分隔符）、默认文件生成、设置读取、报告输出、token 拆分、反射层（含装箱基本类型与变长参数），共 47 项断言。

* 游戏内运行：每次运行都会写 `config/gt6bridge/report.txt` 与 `report-preinit.txt`：

  * 扫描了多少矿物词典名 / 多少物品，成功绑定多少，跳过多少
  * **GT6 不认识的材材料 token 列表**（拿回来填 `materials.csv`）
  * 无法拆出 GT6 前缀的矿物词典名
  * 每条绑定的 `矿物词典名 -> 物品 = 前缀/材料` 明细
  * 配方新增/删除明细与错误列表

* 报告分析器（把未知材料变成可直接粘贴的配置）：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ..\tools\gt6bridge-analyze.ps1
```
  它读 `report.txt`，把未知 token 与从 `gregapi/data/MT` 抽出的 1544 个 GT6 材料名做精确/忽略大小写/忽略分隔符/编辑距离匹配，
  生成 `config/gt6bridge/materials-suggested.csv`（`Token,GT6材料名` 或 `Token,create`）与 `analyze-summary.txt`。

不需要开 IDE：把 `report.txt` 发回来即可继续迭代。

* **开发进度、已完成/未完成清单**见 [DEVSTATUS.md](DEVSTATUS.md)。
* **游戏内验收清单**见 [ACCEPTANCE.md](ACCEPTANCE.md)：启动日志检查 → NEI 用途/配方页 → GT6 机器实测 → 删除层验收 → 出问题怎么反馈 → 判定通过的最小集合。

* 每份构建都会跑三道闸门（`test.ps1`）：

```
[1-3] 73 项纯 JVM 自检                     SELFTEST OK
[4/5] net.minecraft.* 引用 vs 运行时 SRG   AUDIT OK
[5/5] 20 个删除后端的反射目标 vs 已装 mod   MOD TARGET AUDIT OK
```

## 状态

* v0.5（当前）
  * **SRG 修复（关键）**：stub 与全部 `net.minecraft.*` 调用改用运行期真实成员名，材料绑定/删除后端才真正能跑（v0.4 的报告显示 `links.failed: 12` + `NoSuchMethodError`）。
  * 阶段计时（`timing.*.ms`）、`bindLimit`、`scanBudgetMs`（本包矿物词典约 30 万个名字，默认 20 秒预算）三个安全阀。
  * `dryRun=true` 时不再重建 GT6 配方索引。
  * 运行期链接自检、改表免重启、绑定回读校验、删除干跑模式（沿用 v0.4）。
* 自检：`test.ps1`，68 项断言（CSV/设置/报告/token/通配选择器/反射/链接自检/配置监听）。
* 待办
  * 依据第一次运行的 `report.txt` 填 `materials.csv`（未知材料建档）与 `removals.csv`（取消注释预设）。
  * 打开确认可用的 `autorules.csv` 行（重点 Smelter/Furnace 这类 GT6 没有 handler 的表）。

## 调研依据

* `tools/research/gt6-recipe-internals.md`：GT6 配方查询/处理器/绑定 API 的字节码结论（含 `RecipeMap.findRecipeInternal` 动态生成配方、`addRecipe1` 参数顺序、`setItemData_` 拒绝覆盖非 Wood 绑定等）。
* `tools/research/othermods-recipes.md`：EnderIO/TE/AE2/IC2/AA/MFR/Railcraft/GC/LibVulpes/原版的配方删除路径（每条签名均来自 `javap`）。
