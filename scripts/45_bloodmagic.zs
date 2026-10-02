//45_bloodmagic.zs —— Blood Magic 配方
//只在本文件修改 Blood Magic。

//删
recipes.remove(<AWWayofTime:blockAltar>);

//增(无序)
recipes.addShaped(<AWWayofTime:blockAltar>, [
    [<minecraft:stone>, <ore:blockPlateSteel>, <minecraft:stone>],
    [<minecraft:stone>, <minecraft:furnace>, <minecraft:stone>],
    [<minecraft:stone>, <minecraft:stone>, <minecraft:stone>]
]);

//增(有序)
//（见上方工作台配方）

//杂项
//当前安装的 ModTweaker 0.9.6 未提供 Blood Magic 祭坛/仪式 CRT 集成。
//不要将工作台 recipes.add* 当成血祭坛仪式配方；需要单独的兼容 API 才能增删祭坛配方。
