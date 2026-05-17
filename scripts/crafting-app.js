export class CraftingApp extends Application {
    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.selectedRecipeId = null;
        this.providedIngredients = {}; // Maps ingredient name to quantity provided
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "artificer-foundry-app",
            title: "Alchemy & Crafting Recipe Book",
            template: "modules/artificer-foundry/templates/crafting-app.hbs",
            width: 800,
            height: 600,
            resizable: true,
            classes: ["artificer-foundry", "crafting-app"]
        });
    }

    getData() {
        // Fetch recipes from the RecipeManager
        const recipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        
        // Find selected recipe details
        let selectedRecipe = null;
        let mappedIngredients = [];
        
        if (this.selectedRecipeId) {
            selectedRecipe = recipes.find(r => r.id === this.selectedRecipeId);
            if (selectedRecipe) {
                // Map the required ingredients against what the user has dragged in
                mappedIngredients = selectedRecipe.ingredients.map(ing => {
                    const provided = this.providedIngredients[ing.name] || 0;
                    return {
                        ...ing,
                        provided: provided,
                        fulfilled: provided >= ing.quantity
                    };
                });
            }
        }
        
        const canCraft = selectedRecipe && mappedIngredients.length > 0 && mappedIngredients.every(i => i.fulfilled);

        return {
            actor: this.actor,
            recipes: recipes,
            selectedRecipe: selectedRecipe,
            mappedIngredients: mappedIngredients,
            canCraft: canCraft,
            isGM: game.user.isGM
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Handle Drag and Drop for ingredients
        html.find('.ingredient-drop-zone').on('drop', this._onDropIngredient.bind(this));
        
        // Handle Craft button
        html.find('.craft-btn').click(this._onCraftItem.bind(this));

        // Handle recipe selection
        html.find('.recipe-item').click(this._onSelectRecipe.bind(this));
        
        // Handle Learn Recipe
        html.find('.learn-recipe-btn').click(this._onLearnRecipe.bind(this));
        
        // Handle Clear Station
        html.find('.clear-station-btn').click(this._onClearStation.bind(this));
    }

    async _onDropIngredient(event) {
        event.preventDefault();
        try {
            if (!this.selectedRecipeId) {
                ui.notifications.warn("Please select a recipe first.");
                return;
            }
            
            const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
            if (data.type !== "Item") return;
            
            const item = await Item.implementation.fromDropData(data);
            
            // Check if the item belongs to the actor
            if (item.parent?.id !== this.actor.id) {
                ui.notifications.warn("You must drag items from your own inventory.");
                return;
            }

            // Simplified mapping: checking if the item's name matches the required ingredient name
            // For a more robust system, you could check item tags, IDs, or base item names
            const itemName = item.name;
            const itemQuantity = item.system.quantity || 1;
            
            const recipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
            const recipe = recipes.find(r => r.id === this.selectedRecipeId);
            
            const requiredIngredient = recipe.ingredients.find(i => i.name.toLowerCase() === itemName.toLowerCase());
            
            if (requiredIngredient) {
                this.providedIngredients[requiredIngredient.name] = (this.providedIngredients[requiredIngredient.name] || 0) + itemQuantity;
                ui.notifications.info(`Added ${itemQuantity}x ${itemName} to the crafting station.`);
                this.render(); // Re-render to update the UI
            } else {
                ui.notifications.warn(`${itemName} is not required for this recipe.`);
            }

        } catch (err) {
            console.error("Artificer Foundry | Error dropping ingredient", err);
        }
    }

    async _onCraftItem(event) {
        event.preventDefault();
        if (!this.selectedRecipeId) return;
        
        ui.notifications.info("Crafting completed! (Inventory deduction/addition logic to be implemented)");
        // Reset station after crafting
        this.providedIngredients = {};
        this.render();
    }

    _onSelectRecipe(event) {
        event.preventDefault();
        this.selectedRecipeId = event.currentTarget.dataset.recipeId;
        this.providedIngredients = {}; // Reset provided ingredients when switching recipes
        this.render();
    }
    
    async _onLearnRecipe(event) {
        event.preventDefault();
        event.stopPropagation(); // prevent triggering the recipe select
        const recipeId = event.currentTarget.dataset.recipeId;
        
        if (this.actor) {
            await window.ArtificerFoundry.recipeManager.learnRecipe(this.actor.id, recipeId);
            ui.notifications.info(`${this.actor.name} has learned a new recipe!`);
            this.render();
        }
    }
    
    _onClearStation(event) {
        event.preventDefault();
        this.providedIngredients = {};
        this.render();
    }
}
