# CRT 配方脚本

每个模组的配方修改单独放在同名 `.zs` 文件中，方便按模组启用、检查和维护。
新增配方时复制对应模板里的格式，并只取消需要执行的那条语句。

| 文件 | 用途 |
|---|---|
| `00_test.zs` | 环境自检；确认脚本加载后，可注释其中的测试配方 |
| `10_vanilla.zs` | 原版工作台与熔炉 |
| `20_gt_machines.zs` | GT6 机器配方 |
| `30_thermalexpansion.zs` | Thermal Expansion |
| `31_appeng.zs` | Applied Energistics 2 |
| `32_botania.zs` | Botania |
| `33_chisel.zs` | Chisel |
| `34_forestry.zs` | Forestry |
| `35_mariculture.zs` | Mariculture |
| `36_railcraft.zs` | Railcraft |
| `37_tconstruct.zs` | Tinkers' Construct |
| `38_thaumcraft.zs` | Thaumcraft |
| `39_gt6bridge.zs` | gt6bridge 材料绑定、GT6 配方入口和已接入机器的配方移除 |
| `40_actuallyadditions.zs` | Actually Additions |
| `41_advancedrocketry.zs` | Advanced Rocketry |
| `42_enderio.zs` | Ender IO |
| `43_galacticraft.zs` | Galacticraft |
| `44_ic2.zs` | IndustrialCraft 2 |
| `45_bloodmagic.zs` | Blood Magic |
| `46_witchery.zs` | Witchery |
| `recipe_helpers.zs` | 共用函数库；不要在这里写某个模组专属的实际配方 |

ModTweaker 专属 API 的可用范围以当前安装版本为准；对应模板里会注明没有原生 CRT 配方集成的模组。
gt6bridge 可通过 `Bridge.removeRecipe` 删除自身已接入的机器配方，但这不代表能向这些模组添加配方。
实际生效的清理规则也可配置在 `config/gt6bridge/removals.csv` 中。

## 魔法仪式 CRT 函数

`recipe_helpers.zs` 定义了以下全局便捷函数，可在模组脚本中直接调用：

| API | 支持配方类型 |
|---|---|
| `magicBotaniaAddManaInfusion` / `magicBotaniaAddAlchemy` / `magicBotaniaAddConjuration` | 魔力注入、炼金术、凝聚 |
| `magicBotaniaAddRuneAltar` | 符文祭坛 |
| `magicBotaniaAddApothecary` | 花药台 |
| `magicBotaniaAddElvenTrade` | 精灵贸易 |
| `magicBotaniaAddBrew` | 酿造 |
| 对应的 `magicBotaniaRemove...` | 删除对应 Botania 配方 |
| `magicThaumcraftAddCrucible` | Thaumcraft 坩埚 |
| `magicThaumcraftAddArcaneShaped` / `magicThaumcraftAddArcaneShapeless` | 奥术工作台 |
| `magicThaumcraftAddInfusion` / `magicThaumcraftAddInfusionWithAlternates` | 注魔祭坛 |
| `magicThaumcraftAddInfusionEnchantment` | 注魔附魔 |
| 对应的 `magicThaumcraftRemove...` | 删除对应 Thaumcraft 配方 |

可复制的调用模板在 `32_botania.zs` 和 `38_thaumcraft.zs` 中，默认全部注释。参数签名与当前 ModTweaker 0.9.6 已安装 API 对齐。
该 ModTweaker 版本未包含 Blood Magic 或 Witchery 的专用配方 handler，因此血祭坛、Witchery 锅釜/蒸馏器/仪式圈配方目前不能通过这些函数增删；须另加并验证兼容 API，不能用普通工作台配方冒充。
