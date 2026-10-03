import { $CR } from 'java:gregapi/util/CR'
import { $RecipeMapAutocrafting } from 'java:gregapi/recipes/maps/RecipeMapAutocrafting'

const MACHINE_RECIPE_TYPES = new Set([
    'enderio:alloy_smelting',
    'enderio:sag_milling',
    'enderio:vat_fermenting'
])

const MACHINE_OUTPUTS = new Set([
    'enderio:alloy_smelter',
    'enderio:sag_mill',
    'enderio:vat',
    'enderio_evolution:basic_alloy_smelter',
    'enderio_evolution:basic_sag_mill',
    'enderio_evolution:basic_vat',
    'enderio_evolution:crystalline_alloy_smelter',
    'enderio_evolution:crystalline_alloy_sag_mill',
    'enderio_evolution:crystalline_alloy_vat',
    'enderio_evolution:melodic_alloy_smelter',
    'enderio_evolution:melodic_alloy_sag_mill',
    'enderio_evolution:melodic_alloy_vat',
    'enderio_evolution:stellar_alloy_smelter',
    'enderio_evolution:stellar_alloy_sag_mill',
    'enderio_evolution:stellar_alloy_vat',
    'enderio_evolution:vivid_alloy_smelter',
    'enderio_evolution:vivid_alloy_sag_mill',
    'enderio_evolution:vivid_alloy_vat'
])

const UPGRADE_OUTPUTS = new Set([
    'enderio_evolution:basic_batch_upgrade',
    'enderio_evolution:basic_stack_upgrade',
    'enderio_evolution:crystalline_batch_upgrade',
    'enderio_evolution:crystalline_stack_upgrade',
    'enderio_evolution:stellar_batch_upgrade',
    'enderio_evolution:stellar_stack_upgrade'
])

function recipeHasOutput(json, targets) {
    const outputs = [
        json.result,
        json.results,
        json.output,
        json.outputs
    ]

    for (const output of outputs) {
        const entries = Array.isArray(output) ? output : [output]
        for (const entry of entries) {
            const itemId = outputItemId(entry)
            if (targets.has(itemId)) {
                return true
            }
        }
    }
    return false
}

function outputItemId(value) {
    if (typeof value === 'string') {
        return value
    }
    if (value == null || typeof value !== 'object') {
        return null
    }
    if (typeof value.id === 'string') {
        return value.id
    }
    if (typeof value.item === 'string') {
        return value.item
    }
    return null
}

function recipeOutputId(recipe) {
    const output = recipe.getRecipeOutput()
    if (output == null || output.isEmpty()) {
        return null
    }
    return output.getItem()
        .builtInRegistryHolder()
        .key()
        .identifier()
        .toString()
}

function removeCachedAutocraftingRecipes(recipes, outputId) {
    let removed = 0
    for (let index = recipes.size() - 1; index >= 0; index--) {
        const recipe = recipes.get(index)
        if (recipe != null && recipeOutputId(recipe) === outputId) {
            recipes.remove(index)
            removed++
        }
    }
    return removed
}

ServerEvents.recipes(event => {
    let removedMachineRecipes = 0
    let removedMachineCraftingRecipes = 0
    let removedUpgradeRecipes = 0

    for (const rawId of event.ids().toArray()) {
        const id = String(rawId)
        const json = JSON.parse(event.getJson(id))
        const hasMachineOutput = recipeHasOutput(json, MACHINE_OUTPUTS)
        const hasUpgradeOutput = recipeHasOutput(json, UPGRADE_OUTPUTS)

        if (MACHINE_RECIPE_TYPES.has(json.type) || hasMachineOutput || hasUpgradeOutput) {
            event.removeById(id)
            if (MACHINE_RECIPE_TYPES.has(json.type)) {
                removedMachineRecipes++
            }
            if (hasMachineOutput) {
                removedMachineCraftingRecipes++
            }
            if (hasUpgradeOutput) {
                removedUpgradeRecipes++
            }
        }
    }

    let removedGT6CraftingRecipes = 0
    let removedGT6CachedRecipes = 0
    let unavailableGT6Outputs = 0
    const blockedOutputs = [...MACHINE_OUTPUTS, ...UPGRADE_OUTPUTS]
    for (const outputId of blockedOutputs) {
        let outputStack
        try {
            outputStack = Item.of(outputId)
        } catch (error) {
            unavailableGT6Outputs++
            console.warn(
                `[NekoJS/EIO] Skipping GT6 cleanup for unregistered item ${outputId}: ${String(error)}`
            )
            continue
        }

        const recipesBeforeRemoval = $CR.list().size()
        $CR.remout(outputStack, true, false, false, false)
        removedGT6CraftingRecipes += recipesBeforeRemoval - $CR.list().size()
        removedGT6CachedRecipes += removeCachedAutocraftingRecipes(
            $RecipeMapAutocrafting.ALLOWED_RECIPES,
            outputId
        )
        removedGT6CachedRecipes += removeCachedAutocraftingRecipes(
            $RecipeMapAutocrafting.RECENT_RECIPES,
            outputId
        )
    }

    console.info(
        `[NekoJS/EIO] Removed ${removedMachineRecipes} Ender IO processing recipes, ` +
        `${removedMachineCraftingRecipes} machine crafting recipes, ` +
        `${removedUpgradeRecipes} upgrade crafting recipes, ` +
        `${removedGT6CraftingRecipes} GT6 crafting recipes, and ` +
        `${removedGT6CachedRecipes} cached GT6 autocrafting recipes; ` +
        `${unavailableGT6Outputs} targets were not registered.`
    )
})
