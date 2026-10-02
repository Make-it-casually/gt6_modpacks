//32_botania.zs —— Botania 配方与魔力注入
//只在本文件修改 Botania；API 用法可参考 recipe_helpers.zs 中 mods.botania 调用。

//删
recipes.remove(<Botania:lexicon>);

//增(无序)
recipes.addShaped(<Botania:lexicon>, [
    [<minecraft:book>, <ore:blockPlateSteel>, <ore:treeSapling>]
]);

//增(有序)
//Botania 机器配方不使用工作台式有序摆放。

//杂项
//仪式配方示例（仅作模板；替换物品与数值后再取消注释）
//magicBotaniaAddManaInfusion(<输出>, <输入>, 魔力值);
//magicBotaniaAddAlchemy(<输出>, <输入>, 魔力值);
//magicBotaniaAddConjuration(<输出>, <输入>, 魔力值);
//magicBotaniaAddRuneAltar(<输出>, [<材料1>, <材料2>], 魔力值);
//magicBotaniaAddApothecary(<输出>, [<花瓣1>, <花瓣2>]);
//magicBotaniaAddElvenTrade(<输出>, [<材料1>, <材料2>]);
//magicBotaniaAddBrew([<材料1>, <材料2>], "brewKey");
//删除对应仪式：magicBotaniaRemoveManaRecipe(<输出>);
//符文祭坛/花药台/精灵贸易可分别用同名 Remove 函数；酿造用 magicBotaniaRemoveBrew("brewKey")。
