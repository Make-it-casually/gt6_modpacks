// CraftTweaker 3 recipe helpers for the installed Minecraft 1.7.10 pack.
// Definitions are inert until called from a recipe script.
// ModTweaker wrappers cover installed integrations exposed by version 0.9.6:
// AE2, Botania, Chisel, Forestry, Mariculture, Railcraft, TConstruct,
// Thaumcraft, and Thermal Expansion. Other mods may not expose a CRT API.
// Function parameters retain the names from the installed API where available.

function recipeAddShaped(output as IItemStack, pattern as IIngredient[][]) {
    recipes.addShaped(output, pattern);
}

function recipeAddShapeless(output as IItemStack, ingredients as IIngredient[]) {
    recipes.addShapeless(output, ingredients);
}

function recipeRemoveCraftingOutput(output as IItemStack) {
    recipes.remove(output);
}

function recipeAddFurnace(input as IIngredient, output as IItemStack) {
    furnace.addRecipe(output, input);
}

function recipeRemoveFurnaceInput(input as IIngredient) {
    furnace.remove(input);
}

function recipeAddGT6(mapName as string, inputs as IItemStack[], outputs as IItemStack[], eut as int, ticks as int) {
    mods.gt6bridge.Bridge.addRecipe(mapName, inputs, outputs, eut, ticks);
}

function recipeRemoveGT6(backend as string, selector as string) {
    mods.gt6bridge.Bridge.removeRecipe(backend, selector);
}

function recipe_mods_chisel_Groups_addVariation_1(arg0 as string, arg1 as IItemStack) {
    mods.chisel.Groups.addVariation(arg0, arg1);
}

function recipe_mods_chisel_Groups_removeVariation_2(arg0 as IItemStack) {
    mods.chisel.Groups.removeVariation(arg0);
}

function recipe_mods_chisel_Groups_addGroup_3(arg0 as string) {
    mods.chisel.Groups.addGroup(arg0);
}

function recipe_mods_chisel_Groups_removeGroup_4(arg0 as string) {
    mods.chisel.Groups.removeGroup(arg0);
}

function recipe_mods_thermalexpansion_Transposer_addFillRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as ILiquidStack) {
    mods.thermalexpansion.Transposer.addFillRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_thermalexpansion_Transposer_addExtractRecipe_2(arg0 as int, arg1 as IItemStack, arg2 as ILiquidStack, arg3 as IItemStack, arg4 as int) {
    mods.thermalexpansion.Transposer.addExtractRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_thermalexpansion_Transposer_addExtractRecipe_3(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as ILiquidStack, arg4 as int) {
    mods.thermalexpansion.Transposer.addExtractRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_thermalexpansion_Transposer_removeFillRecipe_4(arg0 as IIngredient, arg1 as IIngredient) {
    mods.thermalexpansion.Transposer.removeFillRecipe(arg0, arg1);
}

function recipe_mods_thermalexpansion_Transposer_removeExtractRecipe_5(arg0 as IIngredient) {
    mods.thermalexpansion.Transposer.removeExtractRecipe(arg0);
}

function recipe_mods_thermalexpansion_Transposer_refreshRecipes_6() {
    mods.thermalexpansion.Transposer.refreshRecipes();
}

function recipe_mods_thermalexpansion_Insolator_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as IItemStack, arg4 as IItemStack, arg5 as int) {
    mods.thermalexpansion.Insolator.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_thermalexpansion_Insolator_removeRecipe_2(arg0 as IIngredient, arg1 as IIngredient) {
    mods.thermalexpansion.Insolator.removeRecipe(arg0, arg1);
}

function recipe_mods_thermalexpansion_Insolator_refreshRecipes_3() {
    mods.thermalexpansion.Insolator.refreshRecipes();
}

function recipe_mods_thermalexpansion_Crucible_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as ILiquidStack) {
    mods.thermalexpansion.Crucible.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_thermalexpansion_Crucible_removeRecipe_2(arg0 as IIngredient) {
    mods.thermalexpansion.Crucible.removeRecipe(arg0);
}

function recipe_mods_thermalexpansion_Crucible_refreshRecipes_3() {
    mods.thermalexpansion.Crucible.refreshRecipes();
}

function recipe_mods_thermalexpansion_Smelter_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as IItemStack) {
    mods.thermalexpansion.Smelter.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_thermalexpansion_Smelter_addRecipe_2(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as IItemStack, arg4 as IItemStack, arg5 as int) {
    mods.thermalexpansion.Smelter.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_thermalexpansion_Smelter_removeRecipe_3(arg0 as IIngredient, arg1 as IIngredient) {
    mods.thermalexpansion.Smelter.removeRecipe(arg0, arg1);
}

function recipe_mods_thermalexpansion_Smelter_refreshRecipes_4() {
    mods.thermalexpansion.Smelter.refreshRecipes();
}

function recipe_mods_thermalexpansion_Furnace_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as IItemStack) {
    mods.thermalexpansion.Furnace.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_thermalexpansion_Furnace_removeRecipe_2(arg0 as IIngredient) {
    mods.thermalexpansion.Furnace.removeRecipe(arg0);
}

function recipe_mods_thermalexpansion_Furnace_refreshRecipes_3() {
    mods.thermalexpansion.Furnace.refreshRecipes();
}

function recipe_mods_thermalexpansion_Sawmill_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as IItemStack) {
    mods.thermalexpansion.Sawmill.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_thermalexpansion_Sawmill_addRecipe_2(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as IItemStack, arg4 as int) {
    mods.thermalexpansion.Sawmill.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_thermalexpansion_Sawmill_removeRecipe_3(arg0 as IIngredient) {
    mods.thermalexpansion.Sawmill.removeRecipe(arg0);
}

function recipe_mods_thermalexpansion_Sawmill_refreshRecipes_4() {
    mods.thermalexpansion.Sawmill.refreshRecipes();
}

function recipe_mods_thermalexpansion_Pulverizer_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as IItemStack) {
    mods.thermalexpansion.Pulverizer.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_thermalexpansion_Pulverizer_addRecipe_2(arg0 as int, arg1 as IItemStack, arg2 as IItemStack, arg3 as IItemStack, arg4 as int) {
    mods.thermalexpansion.Pulverizer.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_thermalexpansion_Pulverizer_removeRecipe_3(arg0 as IIngredient) {
    mods.thermalexpansion.Pulverizer.removeRecipe(arg0);
}

function recipe_mods_thermalexpansion_Pulverizer_refreshRecipes_4() {
    mods.thermalexpansion.Pulverizer.refreshRecipes();
}

function recipe_mods_appeng_Inscriber_addRecipe_1(arg0 as IItemStack, arg1 as IItemStack[], arg2 as IItemStack, arg3 as IItemStack, arg4 as string) {
    mods.appeng.Inscriber.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_appeng_Inscriber_addRecipe_2(arg0 as IItemStack[], arg1 as IItemStack, arg2 as IItemStack, arg3 as IItemStack, arg4 as string) {
    mods.appeng.Inscriber.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_appeng_Inscriber_removeRecipe_3(arg0 as IIngredient) {
    mods.appeng.Inscriber.removeRecipe(arg0);
}

function recipe_mods_appeng_Grinder_addRecipe_1(arg0 as WeightedItemStack[], arg1 as IItemStack, arg2 as int) {
    mods.appeng.Grinder.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_appeng_Grinder_addRecipe_2(arg0 as IItemStack, arg1 as IItemStack, arg2 as IItemStack, arg3 as float, arg4 as IItemStack, arg5 as float, arg6 as int) {
    mods.appeng.Grinder.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5, arg6);
}

function recipe_mods_appeng_Grinder_addRecipe_3(arg0 as IItemStack, arg1 as IItemStack, arg2 as int, arg3 as IItemStack, arg4 as float, arg5 as IItemStack, arg6 as float) {
    mods.appeng.Grinder.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5, arg6);
}

function recipe_mods_appeng_Grinder_removeRecipe_4(arg0 as IIngredient) {
    mods.appeng.Grinder.removeRecipe(arg0);
}

function recipe_mods_botania_ManaInfusion_addInfusion_1(arg0 as IItemStack, arg1 as IIngredient, arg2 as int) {
    mods.botania.ManaInfusion.addInfusion(arg0, arg1, arg2);
}

function recipe_mods_botania_ManaInfusion_addAlchemy_2(arg0 as IItemStack, arg1 as IIngredient, arg2 as int) {
    mods.botania.ManaInfusion.addAlchemy(arg0, arg1, arg2);
}

function recipe_mods_botania_ManaInfusion_addConjuration_3(arg0 as IItemStack, arg1 as IIngredient, arg2 as int) {
    mods.botania.ManaInfusion.addConjuration(arg0, arg1, arg2);
}

function recipe_mods_botania_ManaInfusion_removeRecipe_4(arg0 as IIngredient) {
    mods.botania.ManaInfusion.removeRecipe(arg0);
}

function recipe_mods_botania_ElvenTrade_addRecipe_1(arg0 as IItemStack, arg1 as IIngredient[]) {
    mods.botania.ElvenTrade.addRecipe(arg0, arg1);
}

function recipe_mods_botania_ElvenTrade_removeRecipe_2(arg0 as IIngredient) {
    mods.botania.ElvenTrade.removeRecipe(arg0);
}

function recipe_mods_botania_Orechid_addOre_1(arg0 as IOreDictEntry, arg1 as int) {
    mods.botania.Orechid.addOre(arg0, arg1);
}

function recipe_mods_botania_Orechid_addOre_2(arg0 as string, arg1 as int) {
    mods.botania.Orechid.addOre(arg0, arg1);
}

function recipe_mods_botania_Orechid_removeOre_3(arg0 as IOreDictEntry) {
    mods.botania.Orechid.removeOre(arg0);
}

function recipe_mods_botania_Orechid_removeOre_4(arg0 as string) {
    mods.botania.Orechid.removeOre(arg0);
}

function recipe_mods_botania_Lexicon_addBrewPage_1(arg0 as string, arg1 as string, arg2 as int, arg3 as string, arg4 as IIngredient[], arg5 as string) {
    mods.botania.Lexicon.addBrewPage(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_botania_Lexicon_addCraftingPage_2(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[][][]) {
    mods.botania.Lexicon.addCraftingPage(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_botania_Lexicon_addElvenPage_3(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[][]) {
    mods.botania.Lexicon.addElvenPage(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_botania_Lexicon_addEntityPage_4(arg0 as string, arg1 as string, arg2 as int, arg3 as string, arg4 as int) {
    mods.botania.Lexicon.addEntityPage(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_botania_Lexicon_addImagePage_5(arg0 as string, arg1 as string, arg2 as int, arg3 as string) {
    mods.botania.Lexicon.addImagePage(arg0, arg1, arg2, arg3);
}

function recipe_mods_botania_Lexicon_addLorePage_6(arg0 as string, arg1 as string, arg2 as int) {
    mods.botania.Lexicon.addLorePage(arg0, arg1, arg2);
}

function recipe_mods_botania_Lexicon_addInfusionPage_7(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[], arg5 as int[]) {
    mods.botania.Lexicon.addInfusionPage(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_botania_Lexicon_addAlchemyPage_8(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[], arg5 as int[]) {
    mods.botania.Lexicon.addAlchemyPage(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_botania_Lexicon_addConjurationPage_9(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[], arg5 as int[]) {
    mods.botania.Lexicon.addConjurationPage(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_botania_Lexicon_addPetalPage_10(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[][]) {
    mods.botania.Lexicon.addPetalPage(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_botania_Lexicon_addRunePage_11(arg0 as string, arg1 as string, arg2 as int, arg3 as IItemStack[], arg4 as IIngredient[][], arg5 as int[]) {
    mods.botania.Lexicon.addRunePage(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_botania_Lexicon_addTextPage_12(arg0 as string, arg1 as string, arg2 as int) {
    mods.botania.Lexicon.addTextPage(arg0, arg1, arg2);
}

function recipe_mods_botania_Lexicon_removePage_13(arg0 as string, arg1 as int) {
    mods.botania.Lexicon.removePage(arg0, arg1);
}

function recipe_mods_botania_Lexicon_addEntry_14(arg0 as string, arg1 as string, arg2 as IItemStack) {
    mods.botania.Lexicon.addEntry(arg0, arg1, arg2);
}

function recipe_mods_botania_Lexicon_removeEntry_15(arg0 as string) {
    mods.botania.Lexicon.removeEntry(arg0);
}

function recipe_mods_botania_Lexicon_addCategory_16(arg0 as string) {
    mods.botania.Lexicon.addCategory(arg0);
}

function recipe_mods_botania_Lexicon_removeCategory_17(arg0 as string) {
    mods.botania.Lexicon.removeCategory(arg0);
}

function recipe_mods_botania_Lexicon_addRecipeMapping_18(arg0 as IItemStack, arg1 as string, arg2 as int) {
    mods.botania.Lexicon.addRecipeMapping(arg0, arg1, arg2);
}

function recipe_mods_botania_Lexicon_removeRecipeMapping_19(arg0 as IItemStack) {
    mods.botania.Lexicon.removeRecipeMapping(arg0);
}

function recipe_mods_botania_RuneAltar_addRecipe_1(arg0 as IItemStack, arg1 as IIngredient[], arg2 as int) {
    mods.botania.RuneAltar.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_botania_RuneAltar_removeRecipe_2(arg0 as IIngredient) {
    mods.botania.RuneAltar.removeRecipe(arg0);
}

function recipe_mods_botania_PureDaisy_addRecipe_1(arg0 as IIngredient, arg1 as IItemStack) {
    mods.botania.PureDaisy.addRecipe(arg0, arg1);
}

function recipe_mods_botania_PureDaisy_removeRecipe_2(arg0 as IIngredient) {
    mods.botania.PureDaisy.removeRecipe(arg0);
}

function recipe_mods_botania_Brew_addRecipe_1(arg0 as IIngredient[], arg1 as string) {
    mods.botania.Brew.addRecipe(arg0, arg1);
}

function recipe_mods_botania_Brew_removeRecipe_2(arg0 as string) {
    mods.botania.Brew.removeRecipe(arg0);
}

function recipe_mods_botania_Apothecary_addRecipe_1(arg0 as IItemStack, arg1 as IIngredient[]) {
    mods.botania.Apothecary.addRecipe(arg0, arg1);
}

function recipe_mods_botania_Apothecary_addRecipe_2(arg0 as string, arg1 as IIngredient[]) {
    mods.botania.Apothecary.addRecipe(arg0, arg1);
}

function recipe_mods_botania_Apothecary_removeRecipe_3(arg0 as IIngredient) {
    mods.botania.Apothecary.removeRecipe(arg0);
}

function recipe_mods_botania_Apothecary_removeRecipe_4(arg0 as string) {
    mods.botania.Apothecary.removeRecipe(arg0);
}

function recipe_mods_forestry_Moistener_addRecipe_1(arg0 as IItemStack, arg1 as IItemStack, arg2 as int) {
    mods.forestry.Moistener.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_forestry_Moistener_addRecipe_2(arg0 as int, arg1 as IItemStack, arg2 as IItemStack) {
    mods.forestry.Moistener.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_forestry_Moistener_removeRecipe_3(arg0 as IIngredient) {
    mods.forestry.Moistener.removeRecipe(arg0);
}

function recipe_mods_forestry_Moistener_addFuel_4(arg0 as IItemStack, arg1 as IItemStack, arg2 as int, arg3 as int) {
    mods.forestry.Moistener.addFuel(arg0, arg1, arg2, arg3);
}

function recipe_mods_forestry_Moistener_removeFuel_5(arg0 as IIngredient) {
    mods.forestry.Moistener.removeFuel(arg0);
}

function recipe_mods_forestry_Squeezer_addRecipe_1(arg0 as ILiquidStack, arg1 as int, arg2 as IItemStack[]) {
    mods.forestry.Squeezer.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_forestry_Squeezer_addRecipe_2(arg0 as ILiquidStack, arg1 as WeightedItemStack, arg2 as IItemStack[], arg3 as int) {
    mods.forestry.Squeezer.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_forestry_Squeezer_addRecipe_3(arg0 as int, arg1 as IItemStack[], arg2 as ILiquidStack, arg3 as IItemStack, arg4 as int) {
    mods.forestry.Squeezer.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_forestry_Squeezer_removeRecipe_4(arg0 as IIngredient, arg1 as IIngredient[]) {
    mods.forestry.Squeezer.removeRecipe(arg0, arg1);
}

function recipe_mods_forestry_Still_addRecipe_1(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as int) {
    mods.forestry.Still.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_forestry_Still_addRecipe_2(arg0 as int, arg1 as ILiquidStack, arg2 as ILiquidStack) {
    mods.forestry.Still.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_forestry_Still_removeRecipe_3(arg0 as IIngredient, arg1 as ILiquidStack) {
    mods.forestry.Still.removeRecipe(arg0, arg1);
}

function recipe_mods_forestry_Fermenter_addRecipe_1(arg0 as ILiquidStack, arg1 as IItemStack, arg2 as ILiquidStack, arg3 as int, arg4 as float) {
    mods.forestry.Fermenter.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_forestry_Fermenter_addRecipe_2(arg0 as IItemStack, arg1 as ILiquidStack, arg2 as int, arg3 as float, arg4 as ILiquidStack) {
    mods.forestry.Fermenter.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_forestry_Fermenter_removeRecipe_3(arg0 as IIngredient) {
    mods.forestry.Fermenter.removeRecipe(arg0);
}

function recipe_mods_forestry_Fermenter_addFuel_4(arg0 as IItemStack, arg1 as int, arg2 as int) {
    mods.forestry.Fermenter.addFuel(arg0, arg1, arg2);
}

function recipe_mods_forestry_Fermenter_removeFuel_5(arg0 as IIngredient) {
    mods.forestry.Fermenter.removeFuel(arg0);
}

function recipe_mods_forestry_ThermionicFabricator_addSmelting_1(arg0 as int, arg1 as IItemStack, arg2 as int) {
    mods.forestry.ThermionicFabricator.addSmelting(arg0, arg1, arg2);
}

function recipe_mods_forestry_ThermionicFabricator_addSmelting_2(arg0 as IItemStack, arg1 as int, arg2 as int) {
    mods.forestry.ThermionicFabricator.addSmelting(arg0, arg1, arg2);
}

function recipe_mods_forestry_ThermionicFabricator_addCast_3(arg0 as IItemStack, arg1 as IIngredient[][], arg2 as int, arg3 as IItemStack) {
    mods.forestry.ThermionicFabricator.addCast(arg0, arg1, arg2, arg3);
}

function recipe_mods_forestry_ThermionicFabricator_addCast_4(arg0 as ILiquidStack, arg1 as IIngredient[][], arg2 as IItemStack, arg3 as IItemStack) {
    mods.forestry.ThermionicFabricator.addCast(arg0, arg1, arg2, arg3);
}

function recipe_mods_forestry_ThermionicFabricator_removeSmelting_5(arg0 as IIngredient) {
    mods.forestry.ThermionicFabricator.removeSmelting(arg0);
}

function recipe_mods_forestry_ThermionicFabricator_removeCast_6(arg0 as IIngredient) {
    mods.forestry.ThermionicFabricator.removeCast(arg0);
}

function recipe_mods_forestry_ThermionicFabricator_removeCasts_7(arg0 as IIngredient) {
    mods.forestry.ThermionicFabricator.removeCasts(arg0);
}

function recipe_mods_forestry_Centrifuge_addRecipe_1(arg0 as WeightedItemStack[], arg1 as IItemStack, arg2 as int) {
    mods.forestry.Centrifuge.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_forestry_Centrifuge_addRecipe_2(arg0 as int, arg1 as IItemStack, arg2 as IItemStack[], arg3 as int[]) {
    mods.forestry.Centrifuge.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_forestry_Centrifuge_removeRecipe_3(arg0 as IIngredient) {
    mods.forestry.Centrifuge.removeRecipe(arg0);
}

function recipe_mods_forestry_Carpenter_addRecipe_1(arg0 as IItemStack, arg1 as IIngredient[][], arg2 as int, arg3 as IItemStack) {
    mods.forestry.Carpenter.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_forestry_Carpenter_addRecipe_2(arg0 as IItemStack, arg1 as IIngredient[][], arg2 as ILiquidStack, arg3 as int, arg4 as IItemStack) {
    mods.forestry.Carpenter.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_forestry_Carpenter_addRecipe_3(arg0 as int, arg1 as ILiquidStack, arg2 as IItemStack[], arg3 as IItemStack, arg4 as IItemStack) {
    mods.forestry.Carpenter.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_forestry_Carpenter_removeRecipe_4(arg0 as IIngredient, arg1 as IIngredient) {
    mods.forestry.Carpenter.removeRecipe(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addTab_1(arg0 as string, arg1 as string, arg2 as string) {
    mods.thaumcraft.Research.addTab(arg0, arg1, arg2);
}

function recipe_mods_thaumcraft_Research_addTab_2(arg0 as string, arg1 as string, arg2 as string, arg3 as string, arg4 as string) {
    mods.thaumcraft.Research.addTab(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_thaumcraft_Research_removeTab_3(arg0 as string) {
    mods.thaumcraft.Research.removeTab(arg0);
}

function recipe_mods_thaumcraft_Research_removeResearch_4(arg0 as string) {
    mods.thaumcraft.Research.removeResearch(arg0);
}

function recipe_mods_thaumcraft_Research_addResearch_5(arg0 as string, arg1 as string, arg2 as string, arg3 as int, arg4 as int, arg5 as int, arg6 as string, arg7 as string) {
    mods.thaumcraft.Research.addResearch(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
}

function recipe_mods_thaumcraft_Research_addResearch_6(arg0 as string, arg1 as string, arg2 as string, arg3 as int, arg4 as int, arg5 as int, arg6 as IItemStack) {
    mods.thaumcraft.Research.addResearch(arg0, arg1, arg2, arg3, arg4, arg5, arg6);
}

function recipe_mods_thaumcraft_Research_addResearch_7(arg0 as string, arg1 as string, arg2 as string, arg3 as int, arg4 as int, arg5 as int, arg6 as IItemStack, arg7 as IItemStack[], arg8 as string[]) {
    mods.thaumcraft.Research.addResearch(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
}

function recipe_mods_thaumcraft_Research_addPage_8(arg0 as string, arg1 as string) {
    mods.thaumcraft.Research.addPage(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addCraftingPage_9(arg0 as string, arg1 as IItemStack) {
    mods.thaumcraft.Research.addCraftingPage(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addCruciblePage_10(arg0 as string, arg1 as IItemStack) {
    mods.thaumcraft.Research.addCruciblePage(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addArcanePage_11(arg0 as string, arg1 as IItemStack) {
    mods.thaumcraft.Research.addArcanePage(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addInfusionPage_12(arg0 as string, arg1 as IItemStack) {
    mods.thaumcraft.Research.addInfusionPage(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addEnchantmentPage_13(arg0 as string, arg1 as int) {
    mods.thaumcraft.Research.addEnchantmentPage(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_addPrereq_14(arg0 as string, arg1 as string, arg2 as bool) {
    mods.thaumcraft.Research.addPrereq(arg0, arg1, arg2);
}

function recipe_mods_thaumcraft_Research_addSibling_15(arg0 as string, arg1 as string) {
    mods.thaumcraft.Research.addSibling(arg0, arg1);
}

function recipe_mods_thaumcraft_Research_refreshResearchRecipe_16(arg0 as string) {
    mods.thaumcraft.Research.refreshResearchRecipe(arg0);
}

function recipe_mods_thaumcraft_Loot_addCommonLoot_1(arg0 as IItemStack, arg1 as int) {
    mods.thaumcraft.Loot.addCommonLoot(arg0, arg1);
}

function recipe_mods_thaumcraft_Loot_addUncommonLoot_2(arg0 as IItemStack, arg1 as int) {
    mods.thaumcraft.Loot.addUncommonLoot(arg0, arg1);
}

function recipe_mods_thaumcraft_Loot_addRareLoot_3(arg0 as IItemStack, arg1 as int) {
    mods.thaumcraft.Loot.addRareLoot(arg0, arg1);
}

function recipe_mods_thaumcraft_Loot_removeCommonLoot_4(arg0 as IIngredient) {
    mods.thaumcraft.Loot.removeCommonLoot(arg0);
}

function recipe_mods_thaumcraft_Loot_removeUncommonLoot_5(arg0 as IIngredient) {
    mods.thaumcraft.Loot.removeUncommonLoot(arg0);
}

function recipe_mods_thaumcraft_Loot_removeRareLoot_6(arg0 as IIngredient) {
    mods.thaumcraft.Loot.removeRareLoot(arg0);
}

function recipe_mods_thaumcraft_Crucible_addRecipe_1(arg0 as string, arg1 as IItemStack, arg2 as IIngredient, arg3 as string) {
    mods.thaumcraft.Crucible.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_thaumcraft_Crucible_removeRecipe_2(arg0 as IIngredient) {
    mods.thaumcraft.Crucible.removeRecipe(arg0);
}

function recipe_mods_thaumcraft_Arcane_addShaped_1(arg0 as string, arg1 as IItemStack, arg2 as string, arg3 as IIngredient[][]) {
    mods.thaumcraft.Arcane.addShaped(arg0, arg1, arg2, arg3);
}

function recipe_mods_thaumcraft_Arcane_addShapeless_2(arg0 as string, arg1 as IItemStack, arg2 as string, arg3 as IIngredient[]) {
    mods.thaumcraft.Arcane.addShapeless(arg0, arg1, arg2, arg3);
}

function recipe_mods_thaumcraft_Arcane_removeRecipe_3(arg0 as IIngredient) {
    mods.thaumcraft.Arcane.removeRecipe(arg0);
}

function recipe_mods_thaumcraft_Aspects_add_1(arg0 as IItemStack, arg1 as string) {
    mods.thaumcraft.Aspects.add(arg0, arg1);
}

function recipe_mods_thaumcraft_Aspects_remove_2(arg0 as IItemStack, arg1 as string) {
    mods.thaumcraft.Aspects.remove(arg0, arg1);
}

function recipe_mods_thaumcraft_Aspects_addEntity_3(arg0 as string, arg1 as string) {
    mods.thaumcraft.Aspects.addEntity(arg0, arg1);
}

function recipe_mods_thaumcraft_Aspects_removeEntity_4(arg0 as string, arg1 as string) {
    mods.thaumcraft.Aspects.removeEntity(arg0, arg1);
}

function recipe_mods_thaumcraft_Infusion_addRecipe_1(arg0 as string, arg1 as IItemStack, arg2 as IItemStack[], arg3 as string, arg4 as IItemStack, arg5 as int) {
    mods.thaumcraft.Infusion.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_thaumcraft_Infusion_addRecipe_2(arg0 as string, arg1 as IItemStack, arg2 as IItemStack[], arg3 as string, arg4 as IItemStack, arg5 as int, arg6 as bool, arg7 as bool[]) {
    mods.thaumcraft.Infusion.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7);
}

function recipe_mods_thaumcraft_Infusion_addEnchantment_3(arg0 as string, arg1 as int, arg2 as int, arg3 as string, arg4 as IItemStack[]) {
    mods.thaumcraft.Infusion.addEnchantment(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_thaumcraft_Infusion_removeRecipe_4(arg0 as IIngredient) {
    mods.thaumcraft.Infusion.removeRecipe(arg0);
}

function recipe_mods_thaumcraft_Infusion_removeEnchant_5(arg0 as int) {
    mods.thaumcraft.Infusion.removeEnchant(arg0);
}

function recipe_mods_thaumcraft_Warp_addToResearch_1(arg0 as string, arg1 as int) {
    mods.thaumcraft.Warp.addToResearch(arg0, arg1);
}

function recipe_mods_thaumcraft_Warp_addToItem_2(arg0 as IItemStack, arg1 as int) {
    mods.thaumcraft.Warp.addToItem(arg0, arg1);
}

function recipe_mods_thaumcraft_Warp_removeFromResearch_3(arg0 as string) {
    mods.thaumcraft.Warp.removeFromResearch(arg0);
}

function recipe_mods_thaumcraft_Warp_removeFromItem_4(arg0 as IItemStack) {
    mods.thaumcraft.Warp.removeFromItem(arg0);
}

function recipe_mods_thaumcraft_Warp_removeAll_5() {
    mods.thaumcraft.Warp.removeAll();
}

function recipe_mods_thaumcraft_Warp_removeAllResearch_6() {
    mods.thaumcraft.Warp.removeAllResearch();
}

function recipe_mods_thaumcraft_Warp_removeAllItems_7() {
    mods.thaumcraft.Warp.removeAllItems();
}

function recipe_mods_mariculture_Fishing_addJunk_1(arg0 as IItemStack, arg1 as double, arg2 as string, arg3 as bool, arg4 as int[]) {
    mods.mariculture.Fishing.addJunk(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Fishing_addGood_2(arg0 as IItemStack, arg1 as double, arg2 as string, arg3 as bool, arg4 as int[]) {
    mods.mariculture.Fishing.addGood(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Fishing_addRare_3(arg0 as IItemStack, arg1 as double, arg2 as string, arg3 as bool, arg4 as int[]) {
    mods.mariculture.Fishing.addRare(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Fishing_removeLoot_4(arg0 as IItemStack) {
    mods.mariculture.Fishing.removeLoot(arg0);
}

function recipe_mods_mariculture_Casting_addNuggetRecipe_1(arg0 as ILiquidStack, arg1 as IItemStack) {
    mods.mariculture.Casting.addNuggetRecipe(arg0, arg1);
}

function recipe_mods_mariculture_Casting_addIngotRecipe_2(arg0 as ILiquidStack, arg1 as IItemStack) {
    mods.mariculture.Casting.addIngotRecipe(arg0, arg1);
}

function recipe_mods_mariculture_Casting_addBlockRecipe_3(arg0 as ILiquidStack, arg1 as IItemStack) {
    mods.mariculture.Casting.addBlockRecipe(arg0, arg1);
}

function recipe_mods_mariculture_Casting_removeNuggetRecipe_4(arg0 as IIngredient) {
    mods.mariculture.Casting.removeNuggetRecipe(arg0);
}

function recipe_mods_mariculture_Casting_removeIngotRecipe_5(arg0 as IIngredient) {
    mods.mariculture.Casting.removeIngotRecipe(arg0);
}

function recipe_mods_mariculture_Casting_removeBlockRecipe_6(arg0 as IIngredient) {
    mods.mariculture.Casting.removeBlockRecipe(arg0);
}

function recipe_mods_mariculture_Anvil_addRecipe_1(arg0 as IItemStack, arg1 as IItemStack, arg2 as int) {
    mods.mariculture.Anvil.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_mariculture_Anvil_removeRecipe_2(arg0 as IIngredient) {
    mods.mariculture.Anvil.removeRecipe(arg0);
}

function recipe_mods_mariculture_Crucible_addRecipe_1(arg0 as int, arg1 as IItemStack, arg2 as ILiquidStack, arg3 as IItemStack, arg4 as int) {
    mods.mariculture.Crucible.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Crucible_removeRecipe_2(arg0 as IIngredient) {
    mods.mariculture.Crucible.removeRecipe(arg0);
}

function recipe_mods_mariculture_Crucible_addFuel_3(arg0 as IItemStack, arg1 as int, arg2 as int, arg3 as int) {
    mods.mariculture.Crucible.addFuel(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Crucible_addFuel_4(arg0 as ILiquidStack, arg1 as int, arg2 as int, arg3 as int) {
    mods.mariculture.Crucible.addFuel(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Crucible_addFuel_5(arg0 as string, arg1 as int, arg2 as int, arg3 as int) {
    mods.mariculture.Crucible.addFuel(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Crucible_removeFuel_6(arg0 as IItemStack) {
    mods.mariculture.Crucible.removeFuel(arg0);
}

function recipe_mods_mariculture_Crucible_removeFuel_7(arg0 as ILiquidStack) {
    mods.mariculture.Crucible.removeFuel(arg0);
}

function recipe_mods_mariculture_Crucible_removeFuel_8(arg0 as string) {
    mods.mariculture.Crucible.removeFuel(arg0);
}

function recipe_mods_mariculture_Vat_addRecipe_1(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as ILiquidStack, arg3 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Vat_addRecipe_2(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Vat_addRecipe_3(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as ILiquidStack, arg3 as IItemStack, arg4 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Vat_addRecipe_4(arg0 as ILiquidStack, arg1 as IItemStack, arg2 as ILiquidStack, arg3 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Vat_addRecipe_5(arg0 as ILiquidStack, arg1 as IItemStack, arg2 as IItemStack, arg3 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_mariculture_Vat_addRecipe_6(arg0 as ILiquidStack, arg1 as IItemStack, arg2 as ILiquidStack, arg3 as IItemStack, arg4 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Vat_addRecipe_7(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as ILiquidStack, arg4 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Vat_addRecipe_8(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as IItemStack, arg4 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_mariculture_Vat_addRecipe_9(arg0 as ILiquidStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as ILiquidStack, arg4 as IItemStack, arg5 as int) {
    mods.mariculture.Vat.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_mariculture_Vat_removeRecipe_10(arg0 as IIngredient) {
    mods.mariculture.Vat.removeRecipe(arg0);
}

function recipe_mods_mariculture_Vat_removeRecipe_11(arg0 as IIngredient, arg1 as IIngredient) {
    mods.mariculture.Vat.removeRecipe(arg0, arg1);
}

function recipe_mods_railcraft_CokeOven_addRecipe_1(arg0 as IItemStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as int) {
    mods.railcraft.CokeOven.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_railcraft_CokeOven_addRecipe_2(arg0 as IItemStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as bool, arg4 as int) {
    mods.railcraft.CokeOven.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_railcraft_CokeOven_addRecipe_3(arg0 as IItemStack, arg1 as bool, arg2 as bool, arg3 as IItemStack, arg4 as ILiquidStack, arg5 as int) {
    mods.railcraft.CokeOven.addRecipe(arg0, arg1, arg2, arg3, arg4, arg5);
}

function recipe_mods_railcraft_CokeOven_removeRecipe_4(arg0 as IIngredient) {
    mods.railcraft.CokeOven.removeRecipe(arg0);
}

function recipe_mods_railcraft_BlastFurnace_addRecipe_1(arg0 as IItemStack, arg1 as IItemStack, arg2 as int, arg3 as bool) {
    mods.railcraft.BlastFurnace.addRecipe(arg0, arg1, arg2, arg3);
}

function recipe_mods_railcraft_BlastFurnace_addRecipe_2(arg0 as IItemStack, arg1 as bool, arg2 as bool, arg3 as int, arg4 as IItemStack) {
    mods.railcraft.BlastFurnace.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_railcraft_BlastFurnace_removeRecipe_3(arg0 as IIngredient) {
    mods.railcraft.BlastFurnace.removeRecipe(arg0);
}

function recipe_mods_railcraft_BlastFurnace_addFuel_4(arg0 as IIngredient) {
    mods.railcraft.BlastFurnace.addFuel(arg0);
}

function recipe_mods_railcraft_BlastFurnace_removeFuel_5(arg0 as IIngredient) {
    mods.railcraft.BlastFurnace.removeFuel(arg0);
}

function recipe_mods_railcraft_Rolling_addShaped_1(arg0 as IItemStack, arg1 as IIngredient[][]) {
    mods.railcraft.Rolling.addShaped(arg0, arg1);
}

function recipe_mods_railcraft_Rolling_addShapeless_2(arg0 as IItemStack, arg1 as IIngredient[]) {
    mods.railcraft.Rolling.addShapeless(arg0, arg1);
}

function recipe_mods_railcraft_Rolling_removeRecipe_3(arg0 as IIngredient) {
    mods.railcraft.Rolling.removeRecipe(arg0);
}

function recipe_mods_railcraft_RockCrusher_addRecipe_1(arg0 as WeightedItemStack[], arg1 as IItemStack, arg2 as bool) {
    mods.railcraft.RockCrusher.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_railcraft_RockCrusher_addRecipe_2(arg0 as IItemStack, arg1 as bool, arg2 as bool, arg3 as IItemStack[], arg4 as double[]) {
    mods.railcraft.RockCrusher.addRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_railcraft_RockCrusher_removeRecipe_3(arg0 as IIngredient) {
    mods.railcraft.RockCrusher.removeRecipe(arg0);
}

function recipe_mods_tconstruct_Smeltery_addAlloy_1(arg0 as ILiquidStack, arg1 as ILiquidStack[]) {
    mods.tconstruct.Smeltery.addAlloy(arg0, arg1);
}

function recipe_mods_tconstruct_Smeltery_removeAlloy_2(arg0 as IIngredient) {
    mods.tconstruct.Smeltery.removeAlloy(arg0);
}

function recipe_mods_tconstruct_Smeltery_addMelting_3(arg0 as IIngredient, arg1 as ILiquidStack, arg2 as int, arg3 as IItemStack) {
    mods.tconstruct.Smeltery.addMelting(arg0, arg1, arg2, arg3);
}

function recipe_mods_tconstruct_Smeltery_removeMelting_4(arg0 as IIngredient) {
    mods.tconstruct.Smeltery.removeMelting(arg0);
}

function recipe_mods_tconstruct_Smeltery_removeFuel_5(arg0 as IIngredient) {
    mods.tconstruct.Smeltery.removeFuel(arg0);
}

function recipe_mods_tconstruct_Smeltery_addFuel_6(arg0 as ILiquidStack, arg1 as int, arg2 as int) {
    mods.tconstruct.Smeltery.addFuel(arg0, arg1, arg2);
}

function recipe_mods_tconstruct_Casting_addBasinRecipe_1(arg0 as IItemStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as bool, arg4 as int) {
    mods.tconstruct.Casting.addBasinRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_tconstruct_Casting_addTableRecipe_2(arg0 as IItemStack, arg1 as ILiquidStack, arg2 as IItemStack, arg3 as bool, arg4 as int) {
    mods.tconstruct.Casting.addTableRecipe(arg0, arg1, arg2, arg3, arg4);
}

function recipe_mods_tconstruct_Casting_removeTableRecipe_3(arg0 as IIngredient, arg1 as IIngredient, arg2 as IIngredient) {
    mods.tconstruct.Casting.removeTableRecipe(arg0, arg1, arg2);
}

function recipe_mods_tconstruct_Casting_removeBasinRecipe_4(arg0 as IIngredient, arg1 as IIngredient, arg2 as IIngredient) {
    mods.tconstruct.Casting.removeBasinRecipe(arg0, arg1, arg2);
}

function recipe_mods_tconstruct_Tweaks_addRepairMaterial_1(arg0 as IItemStack, arg1 as string, arg2 as int) {
    mods.tconstruct.Tweaks.addRepairMaterial(arg0, arg1, arg2);
}

function recipe_mods_tconstruct_Tweaks_removeRepairMaterial_2(arg0 as IIngredient, arg1 as string) {
    mods.tconstruct.Tweaks.removeRepairMaterial(arg0, arg1);
}

function recipe_mods_tconstruct_Drying_addRecipe_1(arg0 as IItemStack, arg1 as IItemStack, arg2 as int) {
    mods.tconstruct.Drying.addRecipe(arg0, arg1, arg2);
}

function recipe_mods_tconstruct_Drying_removeRecipe_2(arg0 as IIngredient) {
    mods.tconstruct.Drying.removeRecipe(arg0);
}

function recipe_mods_tconstruct_Modifiers_remove_1(arg0 as string) {
    mods.tconstruct.Modifiers.remove(arg0);
}

