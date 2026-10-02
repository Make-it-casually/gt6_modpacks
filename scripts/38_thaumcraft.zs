//38_thaumcraft.zs —— Thaumcraft 配方
//只在本文件修改 Thaumcraft；具体 API 用法可参考 recipe_helpers.zs 中 mods.thaumcraft 调用。

//删
recipes.remove(<Thaumcraft:ItemThaumometer>);

//增(无序)
recipes.addShaped(<Thaumcraft:ItemThaumometer>, [
    [<minecraft:gold_nugget>, <minecraft:glass_pane>, <minecraft:gold_nugget>],
    [<minecraft:gold_ingot>, <Thaumcraft:ItemShard:0>, <minecraft:gold_ingot>],
    [null, <ore:blockPlateSteel>, null]
]);

//增(有序)
//Thaumcraft 魔法配方不使用工作台式有序摆放。

//杂项
//仪式/专用配方示例（仅作模板；替换参数后再取消注释）
//magicThaumcraftAddCrucible("RESEARCH_KEY", <输出>, <催化剂>, "aer:8,ignis:4");
//magicThaumcraftAddArcaneShaped("RESEARCH_KEY", <输出>, "2,2,2,2,2,2", [[<a>,<b>,<c>],[<d>,<e>,<f>],[<g>,<h>,<i>]]);
//magicThaumcraftAddArcaneShapeless("RESEARCH_KEY", <输出>, "2,2,2,2,2,2", [<材料1>, <材料2>]);
//magicThaumcraftAddInfusion("RESEARCH_KEY", <输出>, [<祭坛材料1>, <祭坛材料2>], "ordo:8,terra:8", <中心物品>, 不稳定度);
//删除对应配方：magicThaumcraftRemoveCrucible(<输出>)、magicThaumcraftRemoveArcane(<输出>)、
//magicThaumcraftRemoveInfusion(<输出>)。注魔附魔可用 Add/RemoveInfusionEnchantment。
//参数格式以当前 ModTweaker API 为准；尤其 aspect 字符串、研究 key 与注魔稳定度必须核对。
