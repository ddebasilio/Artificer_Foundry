export class CraftingApp extends Application {
    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.selectedRecipeId = null;
        this.providedIngredients = {}; // { ingredientName: quantityProvided }
        this.filterRarity = "all";
        this.filterLearned = "all"; // "all" | "known" | "unknown"
        this.searchQuery = "";
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "artificer-foundry-app",
            title: "Alchemy & Crafting Station",
            template: "modules/artificer-foundry/templates/crafting-app.hbs",
            width: 960,
            height: 680,
            resizable: true,
            classes: ["artificer-foundry", "crafting-app"]
        });
    }

    getData() {
        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);

        // Apply filters
        const recipes = allRecipes.filter(r => {
            if (this.filterRarity !== "all" && r.rarity !== this.filterRarity) return false;
            if (this.filterLearned === "known" && !r.isLearned) return false;
            if (this.filterLearned === "unknown" && r.isLearned) return false;
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                if (!r.name.toLowerCase().includes(q)) return false;
            }
            return true;
        });

        // Find selected recipe
        let selectedRecipe = null;
        let mappedIngredients = [];

        if (this.selectedRecipeId) {
            selectedRecipe = allRecipes.find(r => r.id === this.selectedRecipeId);
            if (selectedRecipe) {
                mappedIngredients = selectedRecipe.ingredients.map(ing => {
                    const provided = this.providedIngredients[ing.name] || 0;
                    return {
                        ...ing,
                        provided,
                        fulfilled: provided >= ing.quantity
                    };
                });
            }
        }

        const canCraft = selectedRecipe?.isLearned &&
            mappedIngredients.length > 0 &&
            mappedIngredients.every(i => i.fulfilled);

        // Build actor inventory items relevant to the selected recipe
        let inventoryItems = [];
        if (this.actor && selectedRecipe) {
            const requiredNames = new Set(
                selectedRecipe.ingredients.map(i => i.name.toLowerCase())
            );
            inventoryItems = (this.actor.items?.contents || [])
                .filter(item => {
                    const qty = item.system?.quantity ?? 1;
                    return qty > 0 && requiredNames.has(item.name.toLowerCase());
                })
                .map(item => ({
                    id: item.id,
                    name: item.name,
                    img: item.img,
                    quantity: item.system?.quantity ?? 1
                }));
        }

        return {
            actor: this.actor,
            recipes,
            selectedRecipe,
            mappedIngredients,
            canCraft,
            inventoryItems,
            isGM: game.user.isGM,
            filterRarity: this.filterRarity,
            filterLearned: this.filterLearned,
            searchQuery: this.searchQuery,
            rarities: ["common", "uncommon", "rare", "very_rare", "legendary"]
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Recipe selection
        html.find('.recipe-item').click(this._onSelectRecipe.bind(this));

        // Learn / Forget recipe
        html.find('.learn-recipe-btn').click(this._onLearnRecipe.bind(this));
        html.find('.forget-recipe-btn').click(this._onForgetRecipe.bind(this));

        // Filters
        html.find('.filter-rarity').change(this._onFilterChange.bind(this));
        html.find('.filter-learned').change(this._onFilterChange.bind(this));
        html.find('.search-input').on('input', this._onSearchChange.bind(this));

        // Drop zone
        const dropZone = html.find('.ingredient-drop-zone')[0];
        if (dropZone) {
            dropZone.addEventListener('dragover', e => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('drag-over');
            });
            dropZone.addEventListener('drop', this._onDropIngredient.bind(this));
        }

        // Inventory item drag source — so players can drag from the right panel
        html.find('.inventory-item').each((i, el) => {
            el.setAttribute('draggable', true);
            el.addEventListener('dragstart', ev => {
                const itemId = el.dataset.itemId;
                const item = this.actor?.items?.get(itemId);
                if (!item) return;
                ev.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'Item',
                    uuid: item.uuid
                }));
            });
        });

        // Quick-add button on inventory items
        html.find('.quick-add-btn').click(this._onQuickAdd.bind(this));

        // Craft / Clear
        html.find('.craft-btn').click(this._onCraftItem.bind(this));
        html.find('.clear-station-btn').click(this._onClearStation.bind(this));

        // Remove individual ingredient from station
        html.find('.remove-ingredient-btn').click(this._onRemoveIngredient.bind(this));
    }

    // ─────────────────────────── RECIPE SELECTION ──────────────────────────

    _onSelectRecipe(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.recipeId;
        if (this.selectedRecipeId === id) return; // already selected
        this.selectedRecipeId = id;
        this.providedIngredients = {};
        this.render();
    }

    // ──────────────────────────── LEARN / FORGET ────────────────────────────

    async _onLearnRecipe(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.actor) {
            ui.notifications.warn("No actor associated with this crafting station.");
            return;
        }
        const recipeId = event.currentTarget.dataset.recipeId;
        await window.ArtificerFoundry.recipeManager.learnRecipe(this.actor.id, recipeId);
        ui.notifications.info(`${this.actor.name} has learned a new recipe!`);
        this.render();
    }

    async _onForgetRecipe(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.actor) return;
        const recipeId = event.currentTarget.dataset.recipeId;
        await window.ArtificerFoundry.recipeManager.forgetRecipe(this.actor.id, recipeId);
        ui.notifications.info(`${this.actor.name} has forgotten a recipe.`);
        this.render();
    }

    // ─────────────────────────────── FILTERS ────────────────────────────────

    _onFilterChange(event) {
        const el = event.currentTarget;
        if (el.classList.contains('filter-rarity')) this.filterRarity = el.value;
        if (el.classList.contains('filter-learned')) this.filterLearned = el.value;
        this.render();
    }

    _onSearchChange(event) {
        this.searchQuery = event.currentTarget.value;
        this.render();
    }

    // ───────────────────────── DRAG & DROP ──────────────────────────────────

    async _onDropIngredient(event) {
        event.preventDefault();
        event.currentTarget.classList?.remove('drag-over');

        if (!this.selectedRecipeId) {
            ui.notifications.warn("Please select a recipe first.");
            return;
        }

        try {
            const raw = event.dataTransfer?.getData('text/plain');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.type !== "Item") return;

            const item = await fromUuid(data.uuid);
            if (!item) return;

            // Must belong to this actor
            if (item.parent?.id !== this.actor?.id) {
                ui.notifications.warn("You can only use items from your own inventory.");
                return;
            }

            this._addIngredientFromItem(item);
        } catch (err) {
            console.error("Artificer Foundry | Drop error:", err);
        }
    }

    async _onQuickAdd(event) {
        event.preventDefault();
        const itemId = event.currentTarget.dataset.itemId;
        const item = this.actor?.items?.get(itemId);
        if (!item) return;
        this._addIngredientFromItem(item);
    }

    _addIngredientFromItem(item) {
        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        const recipe = allRecipes.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        const required = recipe.ingredients.find(
            i => i.name.toLowerCase() === item.name.toLowerCase()
        );

        if (!required) {
            ui.notifications.warn(`"${item.name}" is not needed for this recipe.`);
            return;
        }

        const alreadyProvided = this.providedIngredients[required.name] || 0;
        if (alreadyProvided >= required.quantity) {
            ui.notifications.info(`You already have enough ${required.name}.`);
            return;
        }

        const inventoryQty = item.system?.quantity ?? 1;
        const stillNeeded = required.quantity - alreadyProvided;
        const toAdd = Math.min(stillNeeded, inventoryQty);

        this.providedIngredients[required.name] = alreadyProvided + toAdd;
        ui.notifications.info(`Added ${toAdd}× ${item.name} to the crafting station.`);
        this.render();
    }

    _onRemoveIngredient(event) {
        event.preventDefault();
        const name = event.currentTarget.dataset.ingredientName;
        if (name && this.providedIngredients[name]) {
            delete this.providedIngredients[name];
            this.render();
        }
    }

    // ──────────────────────────── CRAFTING ──────────────────────────────────

    async _onCraftItem(event) {
        event.preventDefault();
        if (!this.selectedRecipeId || !this.actor) return;

        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        const recipe = allRecipes.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        // Final validation
        for (const ing of recipe.ingredients) {
            const provided = this.providedIngredients[ing.name] || 0;
            if (provided < ing.quantity) {
                ui.notifications.error(`Not enough ${ing.name} (need ${ing.quantity}, have ${provided}).`);
                return;
            }
        }

        // Deduct ingredients from inventory
        for (const ing of recipe.ingredients) {
            let remaining = ing.quantity;
            const actorItems = this.actor.items.filter(
                i => i.name.toLowerCase() === ing.name.toLowerCase()
            );
            for (const actorItem of actorItems) {
                if (remaining <= 0) break;
                const currentQty = actorItem.system?.quantity ?? 1;
                if (currentQty <= remaining) {
                    remaining -= currentQty;
                    await actorItem.delete();
                } else {
                    await actorItem.update({ "system.quantity": currentQty - remaining });
                    remaining = 0;
                }
            }
        }

        // Add crafted item to inventory
        const output = recipe.output;
        const newItemData = {
            name: output.name,
            type: output.type || "consumable",
            img: output.img || "icons/consumables/potions/potion-flask-corked-red.webp",
            system: { quantity: output.quantity || 1 }
        };
        await this.actor.createEmbeddedDocuments("Item", [newItemData]);

        ui.notifications.info(`✓ ${this.actor.name} crafted ${output.name}!`);

        // Reset station
        this.providedIngredients = {};
        this.render();
    }

    _onClearStation(event) {
        event.preventDefault();
        this.providedIngredients = {};
        this.render();
    }
}
