// ============================================================================
//  gt6bridge - CraftTweaker / MineTweaker 3 脚本示例
//  （本文件默认全部注释，去掉行首的 // 即可生效）
//
//  加载时机：MineTweaker 在 PostInit 执行脚本，gt6bridge 的自动绑定在 LoadComplete，
//  所以脚本里的 bind/skip 会在随后那次自动扫描中生效；addRecipe/removeRecipe 会先入队，
//  等 gt6bridge 的各阶段跑时统一应用。想让脚本自己触发一次完整流程，调用 Bridge.apply()。
//
//  前提：gt6bridge 版本需包含脚本 API（v0.6+）。启动日志里会出现：
//    [gt6bridge] CraftTweaker/MineTweaker API registered as mods.gt6bridge.Bridge
//  旧版本下这一行 import 会报 class not found，但不会影响其它 .zs 脚本。
// ============================================================================

import mods.gt6bridge.Bridge;

// ---------------------------------------------------------------------------
// 1) 材料绑定覆盖（优先级高于 config/gt6bridge/materials.csv）
// ---------------------------------------------------------------------------
// Bridge.bind("Enderium", "Enderium");                          // token -> GT6 材料
// Bridge.bind("Cobaltum", "Cobalt");                            // GalaxySpace 的 oreCobaltum 等
// Bridge.skip("TofuMetal");                                     // 永不绑定该 token
// Bridge.bindItem("EnderIO:itemAlloy:6", "ingot", "Enderium");  // 指定物品 -> 前缀/材料
// Bridge.bindItem("*:itemAlloy:*", "ingot", "Enderium");        // 支持通配符

// ---------------------------------------------------------------------------
// 2) 往 GT6 配方表加配方
//    参数：map 名（合法名字见 report.txt）、输入数组、输出数组、[EUt, ticks]
// ---------------------------------------------------------------------------
// Bridge.addRecipe("Crusher", [<minecraft:iron_ore>], [<minecraft:iron_ingot>]);
// Bridge.addRecipe("Crusher", [<EnderIO:itemAlloy:6>], [<minecraft:gold_ingot>], 16, 40);
// Bridge.addRecipe("Mixer",   [<ore:ingotCopper>, <ore:ingotTin>], [<minecraft:gold_ingot>], 30, 64);

// ---------------------------------------------------------------------------
// 3) 删除其它科技 mod 的自带配方
//    目标名同 removals.csv：te_pulverizer / ic2_macerator / enderio_sagmill /
//    actuallyadditions_crusher / railcraft_rockcrusher / galacticraft_compressor / crafting / furnace ...
//    选择器：mod:name[:meta] | mod:* | *:name | *:ore* | *:* | ore:<词典名>
//
//    注意：脚本里的 removeRecipe 是明确指令，会真正删除（不受 removalDryRun 影响）；
//    想先知道会删多少就用 countRemovable。
// ---------------------------------------------------------------------------
// print("pulverizer 会删掉 " ~ Bridge.countRemovable("te_pulverizer", "*:ore*") ~ " 条");
// Bridge.removeRecipe("te_pulverizer", "*:ore*");
// Bridge.removeRecipe("ic2_macerator", "*:ore*");
// Bridge.removeRecipe("enderio_sagmill", "*:ore*");

// ---------------------------------------------------------------------------
// 4) 立即执行并打印结果
// ---------------------------------------------------------------------------
// var summary = Bridge.apply();
// print("[gt6bridge] " ~ summary);
// print("[gt6bridge] 版本 " ~ Bridge.version());
// print(Bridge.status());        // 只读取上一次统计，不触发新一轮
