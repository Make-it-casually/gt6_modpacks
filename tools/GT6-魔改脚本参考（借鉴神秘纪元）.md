# 借鉴 `神秘纪元 v1.7.3-Angelica` 的脚本写法（GT6 实例落地版）

> 参考对象：`E:\game\minecraft\神秘纪元+v1.7.3-Angelica\神秘纪元 v1.7.3-Angelica\.minecraft\scripts\`
> 目标实例：`E:\game\minecraft\gt6\.minecraft\versions\GT6\`
> 结论一句话：**它的"文件组织 / 注释分节 / 先删后加"值得照抄；但它的 GT6 配方写法没有（一行都没有），GT6 那部分仍要自己解决。**

---

## 一、参考包实测统计（这组数字本身就是结论）

21 个 `.zs`，4864 行，全量统计：

| 文件 | 行数 | `recipes.remove` | `recipes.add*` | `mods.thaumcraft.*` | GT6 相关 |
|---|---|---|---|---|---|
| ys.zs（天境/工业/亚图姆） | 824 | 0 | 0 | 812 | **0** |
| 5tc.zs（神秘） | 772 | 6 | 4 | 533 | **0** |
| wsx.zs（巫术学） | 460 | 4 | 0 | 310 | **0** |
| lzyj.zs（龙之研究） | 424 | 43 | 0 | 233 | **0** |
| wj.zs（无尽/终极神秘学） | 349 | 0 | 0 | 189 | **0** |
| sw.zs（生物学） | 327 | 22 | 10 | 187 | **0** |
| 2xg.zs（删/增总表） | 286 | 68 | 192 | 9 | **0** |
| smtt.zs / npc.zs / fmx.zs / zz.zs / hkxt.zs / hasm.zs / mjzj.zs / hhmf.zs / kfz.zs / fw.zs / am.zs / qgzs.zs / 3hh.zs | 1141 | 52 | 37 | 约 600 | **0** |
| **合计** | **4864** | **195** | **243** | **约 2870** | **0** |

要点：

1. **`mods.thaumcraft.*` 占了近 60%** —— 这是一个"以神秘时代为核心"的整合包，脚本主体是**研究/注魔/奥术配方**，不是普通工作台配方。
2. **`recipes.remove` + `recipes.addShaped/Shapeless` 共 438 处** —— 纯 CraftTweaker 的标准用法，说明作者的能力圈在标准 API 内。
3. **GT6 相关：0** —— 全文没有 `MTUtilsGT`、没有 `gt.recipe.*`、没有 `gregtech` 字符串。**同一个 GT6 6.17.06 版本**，作者在 GT6 配方上一行都没改。
   → 这反向验证了 [GT6-魔改准备清单.md](GT6-魔改准备清单.md) §0 的结论：**GT6 的机器配方不吃 CraftTweaker，必须靠 MTUtils 或自写 mod**。
4. 作者对 GT6 的唯一"改动"方式是**间接的**：改别的 mod 的配方（如 Immersive Engineering 园艺罩 `mods.immersiveengineering.GardenCloche.addDefaultCrop`），让资源入口从别处来。

---

## 二、值得照抄的 6 个写法

### 1. 文件名 = 拼音首字母（一个文件一个主题）

```
2xg.zs   二选罐?（实际是"删/增"总表）
3hh.zs   三合一?（名字/标签）
5tc.zs   神秘
ys.zs    天境（+ 工业 + 亚图姆，一个大文件内用注释分段）
wsx.zs   巫术学
lzyj.zs  龙之研究
wj.zs    无尽
qgzs.zs  奇怪知识?（食物向）
zz.zs    杂项（Immersive Engineering 园艺罩全量补全）
```

**借鉴**：别用 `main.zs`、`test.zs`。一主题一文件，文件名可以拼音首字母，但**必须是你能一眼认出的**。

### 2. 文件首行：模块中文名

```zenscript
//赫克西特
mods.thaumcraft.Research.addTab("HKXT", "thaumcraft", ...);
```

### 3. 文件内用 `//` 分节，且**固定节名约定**

```
//删              ← 所有 remove 集中放最前面
//增(无序)        ← addShapeless
//增(有序)        ← addShaped
//杂项            ← 其他
```

`2xg.zs` 是这个约定的教科书：`//删`(行1) → `//增(无序)`(行67) → `//增(有序)`(行172) → `//杂项`(行261)。

其他文件用"物品/机制名"分节，一个物品一节（`lzyj.zs` 有 33 节：`//龙矿`、`//龙锭`、`//龙芯`…；`5tc.zs` 有 40+ 节）。
**关键点：节名 = 你要改的东西的名字**，这样 NEI 里发现一条配方不对时，能直接按名字定位到行。

### 4. 先删后加，成对出现

```zenscript
recipes.remove(<FoodCraft:ItemSCMW1>);
...
recipes.addShapeless(<FoodCraft:ItemSCMW1>,[<minecraft:carrot>,<minecraft:potato>,...]);
```

`qgzs.zs` 就是"删 19 条 → 加 25 条"。**不要只加不删**（旧配方还在，玩家会走最便宜的那条）。

### 5. 组件/材料用矿词 `ore:`，不用写死物品

```zenscript
recipes.addShaped(<harvestcraft:freshwaterItem>*64,[[null,null,null],[<minecraft:water_bucket>,<ore:blockCloth>,<minecraft:water_bucket>],[null,null,null]]);
```

好处：换 mod / 换材质包 / 走 GT6 统一化（unification）时不会失效。**GT6 会大量替换别家锭/粉**，写矿词能自动跟随。

### 6. 中文一律走 `\u` 转义 / 拼音 key，避免乱码

```zenscript
game.setLocalization("zh_CN", "tc.research_category.SMRH", "\u795e\u79d8\u878d\u5408");
// 或直接用拼音 key
mods.thaumcraft.Research.addTab("SMRH", ...);
```

同一个包里编码并不统一（部分文件是 GBK 中文直写、部分是 UTF-8 + `\u` 转义）。**我们现在统一走 UTF-8 无 BOM + `\u` 转义**。

---

## 三、可直接照抄的写法：其他 mod 的配方（GT6 之外的部分）

这部分**在你的实例里 100% 能用**，因为 CraftTweaker 3.1.0 已装好。先把"非 GT6"的配方改了，收益快、风险低：

```zenscript
//基础
recipes.remove(<modid:item:meta>);
recipes.removeShaped(<modid:item>,[[<a>,<b>,<c>],...]);
recipes.removeShapeless(<modid:item>,[<a>,<b>]);
recipes.addShaped(<out>*N,   [[<a>,<b>,<c>],[<d>,<e>,<f>],[<g>,<h>,<i>]]);
recipes.addShapeless(<out>*N,[<a>,<b>,<c>]);
furnace.addRecipe(<out>,<in>);            // 熔炉
furnace.remove(<in>);
//模糊匹配 / 忽略耐久
<modid:item>.anyDamage()
//矿词
<ore:ingotIron>
//概率/数量
<modid:item>*4
```

你的实例里可用的非 GT6 tweaker 接口（已装 jar 决定）：

| 接口 | 来自 | 你能改什么 |
|---|---|---|
| `recipes.*` / `furnace.*` | CraftTweaker 3.1.0 | 原版工作台、熔炉 |
| `mods.thaumcraft.*` | ModTweaker2 0.9.6 + 本实例有 Thaumcraft 4.2.3.5 | 研究/注魔/奥术（写法与参考包一致，可**直接抄**参考包的 `am.zs`/`fmx.zs`/`smtt.zs` 句式） |
| `mods.forestry.*`、`mods.bloodmagic.*`、`mods.botania.*` 等 | ModTweaker2 0.9.6 | 对应 mod 的机器 |
| `mods.StatTweaker.*` | **参考包有、你没有**（`StatTweaker-4.jar`） | 改怪物血量/属性/掉落 |

> ⚠️ 抄参考包的 `.zs` 前先核 mod：参考包有 `ImmersiveEngineering`、`Erebus`、`lotr`、`arsmagica2`、`customnpcs`、`FoodCraft`、`trop` 等，**你的实例里没有**（你有的是 Galacticraft / GalaxySpace / AE2 / IC2 / TE / 无尽 / 龙研 / 豆腐 / 潘马斯）。直接粘贴会大面积 `Not found variable`。

---

## 四、GT6 那部分：参考包没给答案，我们的方案

参考包在 GT6 上完全空白，所以 GT6 仍按准备清单 §3 走：

| 目标 | 手段 |
|---|---|
| GT 机器配方（研磨/离心/搅拌/压模/装配…） | **MTUtils**（`mods.MTUtilsGT.addCustomRecipe/removeAllRecipes`），待装 |
| GT 燃料图（涡轮/热交换/燃气） | MTUtils 覆盖不到 → 改 GT6 源码或自写 mod（`gregtech/loaders/b/Loader_Fuels.java`、`gregapi/data/FM.java`） |
| 坩埚熔炼温度、材料属性 | 同上，需 mod/源码 |
| 快速微调某条材料配方耗时 | `config/recipes/*.cfg`（先做读写验证） |

**脚本层仍可照抄参考包的组织方式**，只是把 `mods.thaumcraft.*` 换成 `mods.MTUtilsGT.*`：

```zenscript
//格雷机器配方
import mods.MTUtilsGT;

//删
MTUtilsGT.removeAllRecipes("gt.recipe.crusher", <minecraft:iron_ore>);

//增
// addCustomRecipe(key, useNBT, GU/t, ticks, [产出概率/10000], [输入物品], [输入液体], [输出液体], [输出物品])
MTUtilsGT.addCustomRecipe("gt.recipe.crusher", false, 32, 400, [10000],
    [<minecraft:iron_ore>], null, null, [<gregtech:gt.meta.dust:2200>*2]);

//杂项：流体替换（不限定机器，配方量巨大，慎用）
MTUtilsGT.addFluidInput(<liquid:soda>, <liquid:mineralsoda>);
```

> `null` 占位不能省；输入/输出槽位数量不够会**静默失效**；产出概率是万分比（10000 = 100%）；想让某物品不被消耗就写 `*0`。
> 改删除类脚本后**必须整体重启 MC**，`/mt reload` 会重复叠加配方。

---

## 五、落地建议：分两步走

**第一步（现在就做，零风险）** —— 先把 GT6 之外的部分按参考包的写法建起来：

```
.minecraft\versions\GT6\scripts\
├── 00_test.zs          //环境自检：一条无害配方，验证 CraftTweaker 通路
├── 10_vanilla.zs       //删/增(无序)/增(有序)/杂项   原版工作台+熔炉
├── 20_gt_machines.zs   //GT 机器配方（MTUtils 到位后启用，未到位时整文件注释）
├── 30_thaumcraft.zs    //直接抄参考包 am.zs / fmx.zs 的句式
├── 40_ae2_ic2_te.zs    //AE2 / IC2 / 热力 等
├── 50_quests_items.zs  //任务奖励物品、无尽/龙研门槛
└── 90_misc.zs          //杂项（矿词补充、名称本地化）
```

每个文件内部固定用 `//删` → `//增(无序)` → `//增(有序)` → `//杂项` 四节。

**第二步** —— MTUtils 到位后再启用 `20_gt_machines.zs`，并按 §3 的坑逐条验证。

---

## 六、可以立刻复制的骨架

见同目录 [scripts-模板/](scripts-模板/)：

* `00_test.zs` —— 环境自检脚本（已验证语法形态，装脚本后第一件事就是跑它）
* `10_vanilla.zs` —— 空骨架，已写好四节注释
* `20_gt_machines.zs` —— MTUtils 骨架，含全部参数说明与常用 key 表

把这三个文件复制进 `.minecraft\versions\GT6\scripts\` 即可开始。
