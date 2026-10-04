
import { $CR } from 'java:gregapi/util/CR'
import { $RecipeMapAutocrafting } from 'java:gregapi/recipes/maps/RecipeMapAutocrafting'

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

function removeCached(recipes, outputId) {
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

export function clearGt6CraftingFor(outputIds) {
    let crafting = 0
    let cached = 0
    let unavailable = 0

    for (const outputId of outputIds) {
        let stack
        try {
            stack = Item.of(outputId)
        } catch (error) {
            unavailable++
            console.warn(`[NekoJS/GT6清理] 未注册的产物，跳过：${outputId} (${String(error)})`)
            continue
        }

        const before = $CR.list().size()
        $CR.remout(stack, true, false, false, false)
        crafting += before - $CR.list().size()
        cached += removeCached($RecipeMapAutocrafting.ALLOWED_RECIPES, outputId)
        cached += removeCached($RecipeMapAutocrafting.RECENT_RECIPES, outputId)
    }

    return { crafting, cached, unavailable }
}
