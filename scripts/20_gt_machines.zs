//20_gt_machines.zs —— GregTech 6 机器配方
//本文件只放 GT6 机器配方；每个其它模组请编辑对应的独立脚本文件。
//GT6Bridge 提供 mods.gt6bridge.Bridge.addRecipe，不依赖 MTUtils。

import mods.gt6bridge.Bridge;

//删
//非 GT6 模组机器配方的移除规则统一放在 39_gt6bridge.zs。

//增(无序)
// Bridge.addRecipe("Crusher", [<minecraft:iron_ore>], [<gregtech:gt.meta.dust:2200>]);
// Bridge.addRecipe("Mixer", [<ore:dustIron>, <ore:dustCopper>], [<minecraft:iron_ingot>], 16, 200);

//增(有序)
//（GT 机器配方无有序/无序之分，此节留空）

//杂项
//本文件只编辑 GT6 配方。材料绑定/移除规则请分别使用 gt6bridge 配置或 39_gt6bridge.zs。

/* ============================ 常用 RecipeMap key（gregapi.data.RM） ============================
gt.recipe.macerator/crusher  粉碎     gt.recipe.centrifuge   离心      gt.recipe.electrolyzer 电解
gt.recipe.mixer              搅拌     gt.recipe.cryomixer    冷冻搅拌  gt.recipe.compressor   压模
gt.recipe.extruder           挤压     gt.recipe.lathe        车床      gt.recipe.cutter       切割
gt.recipe.rollingmill        轧机     gt.recipe.wiremill     拉丝      gt.recipe.hammer       锻造锤
gt.recipe.sifter             筛选     gt.recipe.shredder     撕碎      gt.recipe.mortar       研钵
gt.recipe.smelter            熔炼     gt.recipe.cruciblesmelting  坩埚熔炼（MTUtils 可能改不动）
gt.recipe.distillery         蒸馏     gt.recipe.fermenter    发酵      gt.recipe.drying       干燥
gt.recipe.canner             灌装     gt.recipe.injector     注液      gt.recipe.squeezer     压榨
gt.recipe.laserengraver      激光雕刻 gt.recipe.crystallisationcrucible 结晶坩埚
gt.recipe.assembler          组装机   gt.recipe.cncmachine   CNC       gt.recipe.blastfurnace 高炉
gt.recipe.vacuumfreezer      真空冷冻 gt.recipe.fusionreactor 聚变反应堆 gt.recipe.cokeoven   焦炉
gt.recipe.autocrafting       自动合成 gt.recipe.massfab     物质制造  gt.recipe.replicator   物质复制
完整 GT6 配方表名：游戏内执行 /mtu gtkeys；或查看源码 gregapi/data/RM.java
=============================================================================================== */
