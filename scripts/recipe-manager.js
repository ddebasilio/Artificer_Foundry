export class RecipeManager {
    constructor() {
        this.recipes = this.loadDefaultRecipes();
    }

    loadDefaultRecipes() {
        // A structured representation of basic recipes
        return [
            {
                id: "potion-healing-1",
                name: "Potion of Healing",
                rarity: "common",
                time: "1 hour",
                learned: true, // Default learned for all
                ingredients: [
                    { name: "Bloodgrass", quantity: 2, type: "common_herb" },
                    { name: "Water", quantity: 1, type: "liquid" }
                ],
                description: "A simple potion that restores hit points."
            },
            {
                id: "potion-strength-1",
                name: "Elixir of Giant Strength (Hill)",
                rarity: "uncommon",
                time: "4 hours",
                learned: false, // Must be learned
                ingredients: [
                    { name: "Giant Toenail", quantity: 1, type: "monster_part" },
                    { name: "Mandrake Root", quantity: 1, type: "uncommon_herb" }
                ],
                description: "Increases strength temporarily."
            },
            {
                id: "potion-invisibility-1",
                name: "Potion of Invisibility",
                rarity: "very_rare",
                time: "1 day",
                learned: false,
                ingredients: [
                    { name: "Displacer Beast Tentacle", quantity: 1, type: "rare_monster_part" },
                    { name: "Ethereal Dust", quantity: 2, type: "rare_component" }
                ],
                description: "Renders the drinker invisible."
            }
        ];
    }

    getRecipesForActor(actor) {
        if (!actor) return this.recipes;
        
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let learnedList = recipeData[actor.id] || [];

        return this.recipes.map(recipe => {
            return {
                ...recipe,
                // It's learned if it's default learned OR if the actor has learned it
                isLearned: recipe.learned || learnedList.includes(recipe.id)
            };
        });
    }

    async learnRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        
        // Deep clone to avoid proxy issues in Foundry
        let newData = duplicate(recipeData);
        
        if (!newData[actorId]) {
            newData[actorId] = [];
        }
        
        if (!newData[actorId].includes(recipeId)) {
            newData[actorId].push(recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }
}
