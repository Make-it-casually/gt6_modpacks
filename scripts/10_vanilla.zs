//10_vanilla.zs —— 原版工作台 / 熔炉（照抄 神秘纪元 的 //删 → //增(无序) → //增(有序) → //杂项 结构）
//只写"别的 mod 都改不动、必须从原版入口下手"的配方。GT6 机器配方请写进 20_gt_machines.zs。

//删
//recipes.remove(<modid:item>);                          // 删掉该物品的"全部"工作台配方
//recipes.removeShaped(<modid:item>, [[<a>,<b>,<c>],[<d>,<e>,<f>],[<g>,<h>,<i>]]);   // 只删指定摆放
//recipes.removeShapeless(<modid:item>, [<a>,<b>]);      // 只删指定无序配方
//furnace.remove(<minecraft:iron_ore>);                  // 熔炉
//示例（请改成你要删的）：
//recipes.remove(<minecraft:wooden_slab>);

//增(无序)
//recipes.addShapeless(<输出>*数量, [<材料1>, <材料2>, ...]);
//示例（请改成你要加的）：
//recipes.addShapeless(<minecraft:torch>*4, [<minecraft:stick>, <minecraft:coal>]);

//增(有序)
//recipes.addShaped(<输出>*数量, [[<1>,<2>,<3>],[<4>,<5>,<6>],[<7>,<8>,<9>]]);   // null = 空格
//furnace.addRecipe(<输出>, <输入>);
//示例（请改成你要加的）：
//recipes.addShaped(<minecraft:chest>, [[<minecraft:log>,<minecraft:log>,<minecraft:log>],[<minecraft:log>,null,<minecraft:log>],[<minecraft:log>,<minecraft:log>,<minecraft:log>]]);

//杂项
// - 矿词优先：<ore:ingotIron> 而不是 <minecraft:iron_ingot>，GT6 会做统一化(unification)，写矿词更稳
// - 忽略耐久/NBT：<modid:item>.anyDamage()
// - 中文不要直写，走 game.setLocalization("zh_CN","key","\uXXXX")
