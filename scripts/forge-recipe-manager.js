/**
 * Forge recipe manager for the Artificer Foundry item forge system.
 * Loads blueprints from data/forge-recipes.json at runtime.
 */

export class ForgeRecipeManager {
    constructor() {
        this.recipes = [];
        this._loaded = false;
    }

    async loadRecipes() {
        if (this._loaded) return;
        const resp = await fetch("modules/artificer-foundry/data/forge-recipes.json");
        const data = await resp.json();
        this.recipes = data.map(r => {
            if (r.rarity) {
                r.rarity = r.rarity.toLowerCase().replace(/[\s-]+/g, "_");
            }
            return r;
        });
        this._loaded = true;
    }

    getRecipesForActor(actor) {
        const actorId = actor?.id;
        if (!actorId) return this.recipes.map(r => ({ ...r, isLearned: r.learned }));

        const flagRecipes = actor.getFlag("artificer-foundry", "learnedRecipes") ?? [];
        const recipeData = game.settings.get("artificer-foundry", "forgeRecipeData") ?? {};
        const learnedIds = recipeData[actorId] ?? [];

        return this.recipes.map(r => ({
            ...r,
            isLearned: r.learned || flagRecipes.includes(r.id) || learnedIds.includes(r.id)
        }));
    }

    async learnRecipe(actorOrId, recipeId) {
        const actor = typeof actorOrId === "string" ? game.actors.get(actorOrId) : actorOrId;
        if (!actor) return;

        const flagRecipes = actor.getFlag("artificer-foundry", "learnedRecipes") ?? [];
        if (!flagRecipes.includes(recipeId)) {
            const newFlags = [...flagRecipes, recipeId];
            await actor.setFlag("artificer-foundry", "learnedRecipes", newFlags);
        }
    }

    async forgetRecipe(actorOrId, recipeId) {
        const actor = typeof actorOrId === "string" ? game.actors.get(actorOrId) : actorOrId;
        if (!actor) return;

        const flagRecipes = actor.getFlag("artificer-foundry", "learnedRecipes") ?? [];
        if (flagRecipes.includes(recipeId)) {
            const newFlags = flagRecipes.filter(id => id !== recipeId);
            await actor.setFlag("artificer-foundry", "learnedRecipes", newFlags);
        }

        // Keep legacy data clean if GM is online and updating
        if (game.user.isGM) {
            let recipeData = game.settings.get("artificer-foundry", "forgeRecipeData") ?? {};
            if (recipeData[actor.id]) {
                let newData = foundry.utils.duplicate(recipeData);
                newData[actor.id] = newData[actor.id].filter(id => id !== recipeId);
                await game.settings.set("artificer-foundry", "forgeRecipeData", newData);
            }
        }
    }
}
