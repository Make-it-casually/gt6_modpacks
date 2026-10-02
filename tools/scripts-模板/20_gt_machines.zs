//20_gt_machines.zs —— GT6 机器配方（MTUtils）
//!! 前置：mods\ 里必须有 MTUtils（本实例当前【没有】）。缺 MTUtils 时本文件会整体报错，
//!!       所以下载安装前请保持本文件处于"整段注释"状态。
//!! 参考包 神秘纪元 v1.7.3 的脚本里 GT6 配方是 0 行 —— 这块没有现成作业可抄，按下面的说明自己写。

//import mods.MTUtilsGT;

//删
//MTUtilsGT.removeAllRecipes("gt.recipe.crusher", <minecraft:iron_ore>);
//  ↑ 第二个参数是"输出物品"，不支持矿词/流体，一次只能填一个输出
//  改完必须【整体重启 MC】；/mt reload 会让配方重复叠加（MTUtils 只能在首次加载时移除 GT 配方）

//增(无序)
//MTUtilsGT.addCustomRecipe(key, useNBT, GU/t, ticks, [产出概率/10000], [输入物品], [输入液体], [输出液体], [输出物品]);
//  key          : "gt.recipe.xxx"（见下表）
//  useNBT       : true/false
//  GU/t, ticks  : 能量与耗时；浸洗盆、凝结器等不耗能的机器必须写 0
//  [概率]       : 万分比，10000 = 100%，5000 = 50%；只写一个数则所有产出同概率
//  [输入物品]   : 不支持矿词；数量不足的槽位会让配方【静默失效】
//  [输入液体]   : <liquid:名称>*mB；没有就写 null
//  [输出液体]   : 同上，没有写 null
//  [输出物品]   : 不支持矿词
//  不消耗的物品：把数量写成 *0（例如透镜、选择器标签）—— 这是 Greg 本人确认的用法
//示例（取消注释前先确认物品名与槽位数）：
//MTUtilsGT.addCustomRecipe("gt.recipe.crusher", false, 32, 400, [10000],
//    [<minecraft:iron_ore>], null, null, [<gregtech:gt.meta.dust:2200>]);

//增(有序)
//（GT 机器配方无有序/无序之分，此节留空）

//杂项
//流体替换：不限定机器，命中范围极大，先用 /mt liquids 查清名字再动
//MTUtilsGT.addFluidInput(<liquid:soda>, <liquid:mineralsoda>);

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
完整清单：游戏内执行 /mtu gtkeys ；或读源码 gregapi/data/RM.java
=============================================================================================== */
