const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CraftingApp extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.selectedRecipeId = null;
        this.providedIngredients = {};
        this.filterRarity = "all";
        this.filterLearned = "all";
        this.searchQuery = "";
    }

    // ── Application V2 config ─────────────────────────────────────────────────

    static DEFAULT_OPTIONS = {
        id: "artificer-foundry-app",
        window: {
            title: "Alchemy & Crafting Station",
            icon: "fas fa-flask",
            resizable: true,
        },
        classes: ["artificer-foundry", "crafting-app"],
        position: {
            width: 960,
            height: 680,
            top: Math.max(20, (window.innerHeight - 680) / 2),
            left: Math.max(20, (window.innerWidth  - 960) / 2),
        }
    };

    static PARTS = {
        crafting: {
            template: "modules/artificer-foundry/templates/crafting-app.hbs"
        }
    };

    // ── Data for the template ─────────────────────────────────────────────────

    async _prepareContext(options) {
        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);

        const recipes = allRecipes.filter(r => {
            if (this.filterRarity !== "all" && r.rarity !== this.filterRarity) return false;
            if (this.filterLearned === "known"   && !r.isLearned) return false;
            if (this.filterLearned === "unknown" &&  r.isLearned) return false;
            if (this.searchQuery) {
                if (!r.name.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
            }
            return true;
        });

        let selectedRecipe = null;
        let mappedIngredients = [];

        if (this.selectedRecipeId) {
            selectedRecipe = allRecipes.find(r => r.id === this.selectedRecipeId);
            if (selectedRecipe) {
                mappedIngredients = selectedRecipe.ingredients.map(ing => {
                    const provided = this.providedIngredients[ing.name] || 0;
                    return { ...ing, provided, fulfilled: provided >= ing.quantity };
                });
            }
        }

        const canCraft = selectedRecipe?.isLearned &&
            mappedIngredients.length > 0 &&
            mappedIngredients.every(i => i.fulfilled);

        let inventoryItems = [];
        if (this.actor && selectedRecipe) {
            const required = new Set(selectedRecipe.ingredients.map(i => i.name.toLowerCase()));
            inventoryItems = (this.actor.items?.contents ?? [])
                .filter(item => (item.system?.quantity ?? 1) > 0 && required.has(item.name.toLowerCase()))
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
        };
    }

    // ── Event wiring (V2 equivalent of activateListeners) ─────────────────────

    _onRender(context, options) {
        const el = this.element;

        // Recipe selection
        el.querySelectorAll('.recipe-item').forEach(item => {
            item.addEventListener('click', this._onSelectRecipe.bind(this));
        });

        // Learn / Forget
        el.querySelectorAll('.learn-recipe-btn').forEach(btn => {
            btn.addEventListener('click', this._onLearnRecipe.bind(this));
        });
        el.querySelectorAll('.forget-recipe-btn').forEach(btn => {
            btn.addEventListener('click', this._onForgetRecipe.bind(this));
        });

        // Filters
        el.querySelectorAll('.filter-rarity').forEach(sel => {
            sel.addEventListener('change', this._onFilterChange.bind(this));
        });
        el.querySelectorAll('.filter-learned').forEach(sel => {
            sel.addEventListener('change', this._onFilterChange.bind(this));
        });
        el.querySelectorAll('.search-input').forEach(inp => {
            inp.addEventListener('input', this._onSearchChange.bind(this));
        });

        // Drop zone
        const dropZone = el.querySelector('.ingredient-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', e => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', this._onDropIngredient.bind(this));
        }

        // Inventory panel drag sources
        el.querySelectorAll('.inventory-item').forEach(row => {
            row.setAttribute('draggable', 'true');
            row.addEventListener('dragstart', ev => {
                const item = this.actor?.items?.get(row.dataset.itemId);
                if (!item) return;
                ev.dataTransfer.setData('text/plain', JSON.stringify({ type: 'Item', uuid: item.uuid }));
            });
        });

        // Quick-add buttons
        el.querySelectorAll('.quick-add-btn').forEach(btn => {
            btn.addEventListener('click', this._onQuickAdd.bind(this));
        });

        // Remove ingredient from station
        el.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
            btn.addEventListener('click', this._onRemoveIngredient.bind(this));
        });

        // Craft / Clear / Close
        el.querySelector('.craft-btn')?.addEventListener('click', this._onCraftItem.bind(this));
        el.querySelector('.clear-station-btn')?.addEventListener('click', this._onClearStation.bind(this));
        el.querySelector('.close-station-btn')?.addEventListener('click', () => this.close());
    }

    // ── Recipe selection ──────────────────────────────────────────────────────

    _onSelectRecipe(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.recipeId;
        if (this.selectedRecipeId === id) return;
        this.selectedRecipeId = id;
        this.providedIngredients = {};
        this.render();
    }

    // ── Learn / Forget ────────────────────────────────────────────────────────

    async _onLearnRecipe(event) {
        event.preventDefault();
        event.stopPropagation();
        if (!this.actor) { ui.notifications.warn("No actor associated with this crafting station."); return; }
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

    // ── Filters ───────────────────────────────────────────────────────────────

    _onFilterChange(event) {
        const el = event.currentTarget;
        if (el.classList.contains('filter-rarity'))  this.filterRarity  = el.value;
        if (el.classList.contains('filter-learned')) this.filterLearned = el.value;
        this.render();
    }

    _onSearchChange(event) {
        this.searchQuery = event.currentTarget.value;
        this.render();
    }

    // ── Drag & Drop ───────────────────────────────────────────────────────────

    async _onDropIngredient(event) {
        event.preventDefault();
        event.currentTarget.classList?.remove('drag-over');

        if (!this.selectedRecipeId) { ui.notifications.warn("Select a recipe first."); return; }

        try {
            const raw = event.dataTransfer?.getData('text/plain');
            if (!raw) return;
            const data = JSON.parse(raw);
            if (data.type !== "Item") return;

            const item = await fromUuid(data.uuid);
            if (!item) return;

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
        const item = this.actor?.items?.get(event.currentTarget.dataset.itemId);
        if (item) this._addIngredientFromItem(item);
    }

    _addIngredientFromItem(item) {
        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        const recipe = allRecipes.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        const required = recipe.ingredients.find(
            i => i.name.toLowerCase() === item.name.toLowerCase()
        );
        if (!required) { ui.notifications.warn(`"${item.name}" is not needed for this recipe.`); return; }

        // Total inventory quantity across all stacks of this ingredient
        const totalInInventory = (this.actor?.items?.contents ?? [])
            .filter(i => i.name.toLowerCase() === required.name.toLowerCase())
            .reduce((sum, i) => sum + (i.system?.quantity ?? 1), 0);

        const already = this.providedIngredients[required.name] || 0;

        // Cap: cannot commit more than is actually in inventory, and no more than recipe needs
        const maxCanCommit = Math.min(required.quantity, totalInInventory);
        if (already >= maxCanCommit) {
            if (totalInInventory < required.quantity) {
                ui.notifications.warn(`Not enough ${required.name} in inventory (have ${totalInInventory}, need ${required.quantity}).`);
            } else {
                ui.notifications.info(`Already have enough ${required.name} staged.`);
            }
            return;
        }

        const toAdd = maxCanCommit - already;
        this.providedIngredients[required.name] = already + toAdd;
        ui.notifications.info(`Added ${toAdd}× ${item.name} to the crafting station.`);
        this.render();
    }

    _onRemoveIngredient(event) {
        event.preventDefault();
        const name = event.currentTarget.dataset.ingredientName;
        if (name) { delete this.providedIngredients[name]; this.render(); }
    }

    // ── Crafting ──────────────────────────────────────────────────────────────

    async _onCraftItem(event) {
        event.preventDefault();
        if (!this.selectedRecipeId || !this.actor) return;

        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        const recipe = allRecipes.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        for (const ing of recipe.ingredients) {
            const provided = this.providedIngredients[ing.name] || 0;
            if (provided < ing.quantity) {
                ui.notifications.error(`Not enough ${ing.name} (need ${ing.quantity}, have ${provided}).`);
                return;
            }
        }

        // Deduct ingredients
        for (const ing of recipe.ingredients) {
            let remaining = ing.quantity;
            for (const actorItem of this.actor.items.filter(i => i.name.toLowerCase() === ing.name.toLowerCase())) {
                if (remaining <= 0) break;
                const qty = actorItem.system?.quantity ?? 1;
                if (qty <= remaining) { remaining -= qty; await actorItem.delete(); }
                else { await actorItem.update({ "system.quantity": qty - remaining }); remaining = 0; }
            }
        }

        // Add crafted item — prefer compendium match, fall back to loot
        const output = recipe.output;
        const compendiumItem = await this._findInCompendiums(output.name);
        if (compendiumItem) {
            const itemData = compendiumItem.toObject();
            itemData.system.quantity = output.quantity ?? 1;
            await this.actor.createEmbeddedDocuments("Item", [itemData]);
            console.log(`Artificer Foundry | Created "${output.name}" from compendium`);
        } else {
            await this.actor.createEmbeddedDocuments("Item", [{
                name: output.name,
                type: "loot",
                img: output.img ?? "icons/consumables/potions/potion-flask-corked-red.webp",
                system: { quantity: output.quantity ?? 1 }
            }]);
            console.log(`Artificer Foundry | Created "${output.name}" as loot item`);
        }

        ui.notifications.info(`✓ ${this.actor.name} crafted ${output.name}!`);
        this.providedIngredients = {};
        this.render();
    }

    async _findInCompendiums(name) {
        const target = name.toLowerCase();
        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            try {
                const index = await pack.getIndex();
                const entry = index.find(e => e.name.toLowerCase() === target);
                if (entry) return await pack.getDocument(entry._id);
            } catch { /* pack unavailable */ }
        }
        return null;
    }

    _onClearStation(event) {
        event.preventDefault();
        this.providedIngredients = {};
        this.render();
    }
}
