//00_test.zs —— 环境自检（借鉴 神秘纪元 v1.7.3 的写法：首行中文模块名 + // 分节）
//用法：把这个文件放进 .minecraft\versions\GT6\scripts\ ，启动 MC，只看 minetweaker.log
//验收：日志里出现 "OK: CraftTweaker 已接管脚本目录" 且没有任何 ERROR，即通路正常。

//自检
print("OK: CraftTweaker 已接管脚本目录");
print("自检 - 铁锭查询: " + <minecraft:iron_ingot>);
print("自检 - 矿词查询: " + <ore:ingotIron>);

//删
//（自检阶段不删任何东西，保持空白，避免污染存档）

//增(无序)
//一条无害的自检配方：1 个圆石 + 1 个煤炭 → 1 个圆石（等价替换，随时可删）
//注意：这一行会让"圆石+煤=圆石"出现在 NEI 里；确认环境通了之后请把它注释掉。
recipes.addShapeless(<minecraft:cobblestone>, [<minecraft:cobblestone>, <minecraft:coal>]);

//增(有序)
//（留空）

//杂项
//（留空）
