/**
 * Recipe manager for the Artificer Foundry alchemy system.
 * Loads recipes from data/recipes.json at runtime.
 */

export class RecipeManager {
    constructor() {
        this.recipes = [];
        this._loaded = false;
    }

    async loadRecipes() {
        if (this._loaded) return;
        const resp = await fetch("modules/artificer-foundry/data/recipes.json");
        this.recipes = await resp.json();
        this._loaded = true;
    }

    getRecipesForActor(actor) {
        const actorId = actor?.id;
        if (!actorId) return this.recipes.map(r => ({...r, isLearned: r.learned}));

        const recipeData = game.settings.get("artificer-foundry", "recipeData") ?? {};
        const learnedIds = recipeData[actorId] ?? [];

        return this.recipes.map(r => ({
            ...r,
            isLearned: r.learned || learnedIds.includes(r.id)
        }));
    }

    async learnRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let newData = foundry.utils.duplicate(recipeData);
        if (!newData[actorId]) newData[actorId] = [];
        if (!newData[actorId].includes(recipeId)) {
            newData[actorId].push(recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }

    async forgetRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let newData = foundry.utils.duplicate(recipeData);
        if (newData[actorId]) {
            newData[actorId] = newData[actorId].filter(id => id !== recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }
}
