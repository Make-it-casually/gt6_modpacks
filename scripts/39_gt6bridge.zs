//39_gt6bridge.zs —— gt6bridge 接口
//只在本文件使用 gt6bridge 专属 CRT API。

import mods.gt6bridge.Bridge;

//删：只支持 RecipeRemover 已接入的机器后端；目标名与 config/gt6bridge/removals.csv 相同。
//Bridge.removeRecipe("te_pulverizer", "minecraft:iron_ore");
//Bridge.removeRecipe("advancedrocketry_machines", "*:*");

//增(无序)
//Bridge.addRecipe("Crusher", [<minecraft:iron_ore>], [<gregtech:gt.meta.dust:2200>]);
//Bridge.addRecipe("Mixer", [<ore:dustIron>, <ore:dustCopper>], [<minecraft:iron_ingot>], 16, 200);

//增(有序)
//GT6 机器配方没有工作台式有序摆放。

//杂项
//Bridge.bind("外部材料词", "GT6材料名");
//Bridge.skip("不参与材料绑定的词");
//Bridge.bindItem("modid:item_name", "ingot", "Iron");
//recipe_helpers.zs 提供的 recipeAddGT6 / recipeRemoveGT6 是可复用封装。
