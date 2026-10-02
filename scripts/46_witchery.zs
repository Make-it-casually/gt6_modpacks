//46_witchery.zs —— Witchery 配方
//只在本文件修改 Witchery。

//删
recipes.remove(<witchery:altar>);

//增(无序)
recipes.addShaped(<witchery:altar>, [
    [<minecraft:stonebrick>, <minecraft:stonebrick>, <minecraft:stonebrick>],
    [<minecraft:redstone>, <ore:blockPlateSteel>, <minecraft:redstone>],
    [<minecraft:stonebrick>, <minecraft:stonebrick>, <minecraft:stonebrick>]
]);

//增(有序)
//（见上方工作台配方）

//杂项
//当前安装的 ModTweaker 0.9.6 未提供 Witchery 锅釜、蒸馏器、炼金锅/仪式圈 CRT 配方集成。
//不要将工作台 recipes.add* 当成这些专用配方；需要单独的兼容 API 才能增删对应配方。
