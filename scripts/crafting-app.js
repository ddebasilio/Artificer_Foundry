const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { getTypeLabels, getIngredientIcon, canSubstitute, getSubstitutes, getCraftingTime, formatCraftingTime, getCraftingTimes } from "./ingredient-data.js";

export class CraftingApp extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.selectedRecipeId = null;
        this.providedIngredients = {};
        this.filterRarity = "all";
        this.filterLearned = "known";
        this.searchQuery = "";
        this._crafting = false;
    }

    static DEFAULT_OPTIONS = {
        window: { title: "Alchemy & Crafting Station", icon: "fas fa-flask", resizable: true },
        classes: ["artificer-foundry", "crafting-app"],
        position: { width: 980, height: 700 },
    };

    static PARTS = {
        crafting: { template: "modules/artificer-foundry/templates/crafting-app.hbs" }
    };

    _isAlchemist() {
        if (!this.actor) return false;
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && name.includes("alchemist")) return true;
            if (name.includes("alchemical savant")) return true;
            return false;
        });
    }

    async _prepareContext(options) {
        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        const isAlchemist = this._isAlchemist();

        const recipes = allRecipes.filter(r => {
            if (this.filterRarity !== "all" && r.rarity !== this.filterRarity) return false;
            if (this.filterLearned === "known" && !r.isLearned) return false;
            if (this.filterLearned === "unknown" && r.isLearned) return false;
            if (this.searchQuery && !r.name.toLowerCase().includes(this.searchQuery.toLowerCase())) return false;
            return true;
        }).map(r => {
            const ct = getCraftingTime(r.rarity, isAlchemist);
            return { ...r, craftingTimeLabel: formatCraftingTime(ct.days), craftingCost: ct.cost };
        });

        let selectedRecipe = null;
        let mappedIngredients = [];

        if (this.selectedRecipeId) {
            selectedRecipe = allRecipes.find(r => r.id === this.selectedRecipeId);
            if (selectedRecipe) {
                const ct = getCraftingTime(selectedRecipe.rarity, isAlchemist);
                selectedRecipe = { ...selectedRecipe, craftingTimeLabel: formatCraftingTime(ct.days), craftingCost: ct.cost };
                mappedIngredients = selectedRecipe.ingredients.map(ing => {
                    const provided = this.providedIngredients[ing.name] || 0;
                    const icon = getIngredientIcon(ing.name, ing.type);
                    const typeLabel = getTypeLabels()[ing.type] || ing.type;
                    const subs = getSubstitutes(ing.name, selectedRecipe.rarity);
                    return { ...ing, provided, fulfilled: provided >= ing.quantity, icon, typeLabel, substitutes: subs };
                });
            }
        }

        const canCraft = selectedRecipe?.isLearned && mappedIngredients.length > 0 && mappedIngredients.every(i => i.fulfilled);

        let inventoryItems = [];
        if (this.actor && selectedRecipe) {
            const allIngNames = new Set();
            for (const ing of selectedRecipe.ingredients) {
                allIngNames.add(ing.name.toLowerCase());
                for (const s of getSubstitutes(ing.name, selectedRecipe.rarity)) allIngNames.add(s.toLowerCase());
            }
            inventoryItems = (this.actor.items?.contents ?? [])
                .filter(item => (item.system?.quantity ?? 1) > 0 && allIngNames.has(item.name.toLowerCase()))
                .map(item => ({ id: item.id, name: item.name, img: item.img, quantity: item.system?.quantity ?? 1 }));
        }

        return {
            actor: this.actor, recipes, selectedRecipe, mappedIngredients, canCraft,
            inventoryItems, isGM: game.user.isGM, filterRarity: this.filterRarity,
            filterLearned: this.filterLearned, searchQuery: this.searchQuery,
            isAlchemist, crafting: this._crafting,
        };
    }

    _onRender(context, options) {
        const el = this.element;
        el.querySelectorAll('.recipe-item').forEach(item => item.addEventListener('click', this._onSelectRecipe.bind(this)));
        el.querySelectorAll('.learn-recipe-btn').forEach(btn => btn.addEventListener('click', this._onLearnRecipe.bind(this)));
        el.querySelectorAll('.forget-recipe-btn').forEach(btn => btn.addEventListener('click', this._onForgetRecipe.bind(this)));
        el.querySelectorAll('.filter-rarity').forEach(sel => sel.addEventListener('change', this._onFilterChange.bind(this)));
        el.querySelectorAll('.filter-learned').forEach(sel => sel.addEventListener('change', this._onFilterChange.bind(this)));
        el.querySelectorAll('.search-input').forEach(inp => inp.addEventListener('input', this._onSearchChange.bind(this)));

        const dropZone = el.querySelector('.rune-circle-container');
        if (dropZone) {
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', this._onDropIngredient.bind(this));
        }

        el.querySelectorAll('.inventory-item').forEach(row => {
            row.setAttribute('draggable', 'true');
            row.addEventListener('dragstart', ev => {
                const item = this.actor?.items?.get(row.dataset.itemId);
                if (!item) return;
                ev.dataTransfer.setData('text/plain', JSON.stringify({ type: 'Item', uuid: item.uuid }));
            });
        });

        el.querySelectorAll('.quick-add-btn').forEach(btn => btn.addEventListener('click', this._onQuickAdd.bind(this)));
        el.querySelectorAll('.remove-ingredient-btn').forEach(btn => btn.addEventListener('click', this._onRemoveIngredient.bind(this)));
        el.querySelector('.craft-btn')?.addEventListener('click', this._onCraftItem.bind(this));
        el.querySelector('.clear-station-btn')?.addEventListener('click', this._onClearStation.bind(this));
    }

    _onSelectRecipe(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.recipeId;
        if (this.selectedRecipeId === id) return;
        this.selectedRecipeId = id;
        this.providedIngredients = {};
        this.render();
    }

    async _onLearnRecipe(event) {
        event.preventDefault(); event.stopPropagation();
        if (!this.actor) { ui.notifications.warn("No actor associated."); return; }
        await window.ArtificerFoundry.recipeManager.learnRecipe(this.actor.id, event.currentTarget.dataset.recipeId);
        ui.notifications.info(`${this.actor.name} has learned a new recipe!`);
        this.render();
    }

    async _onForgetRecipe(event) {
        event.preventDefault(); event.stopPropagation();
        if (!this.actor) return;
        await window.ArtificerFoundry.recipeManager.forgetRecipe(this.actor.id, event.currentTarget.dataset.recipeId);
        ui.notifications.info(`${this.actor.name} has forgotten a recipe.`);
        this.render();
    }

    _onFilterChange(event) {
        const el = event.currentTarget;
        if (el.classList.contains('filter-rarity')) this.filterRarity = el.value;
        if (el.classList.contains('filter-learned')) this.filterLearned = el.value;
        this.render();
    }

    _onSearchChange(event) { this.searchQuery = event.currentTarget.value; this.render(); }

    async _onDropIngredient(event) {
        event.preventDefault();
        event.currentTarget.classList?.remove('drag-over');
        if (!this.selectedRecipeId) { ui.notifications.warn("Select a recipe first."); return; }
        try {
            const data = JSON.parse(event.dataTransfer?.getData('text/plain') || "{}");
            if (data.type !== "Item") return;
            const item = await fromUuid(data.uuid);
            if (!item) return;
            if (item.parent?.id !== this.actor?.id) { ui.notifications.warn("You can only use items from your own inventory."); return; }
            this._addIngredientFromItem(item);
        } catch (err) { console.error("Artificer Foundry | Drop error:", err); }
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

        const required = recipe.ingredients.find(i => canSubstitute(item.name, i.name, recipe.rarity));
        if (!required) { ui.notifications.warn(`"${item.name}" is not needed for this recipe.`); return; }

        const totalInInventory = (this.actor?.items?.contents ?? [])
            .filter(i => canSubstitute(i.name, required.name, recipe.rarity))
            .reduce((sum, i) => sum + (i.system?.quantity ?? 1), 0);

        const already = this.providedIngredients[required.name] || 0;
        const maxCanCommit = Math.min(required.quantity, totalInInventory);
        if (already >= maxCanCommit) {
            ui.notifications.info(`Already have enough ${required.name} staged.`);
            return;
        }
        this.providedIngredients[required.name] = maxCanCommit;
        ui.notifications.info(`Added ${item.name} to the crafting station.`);
        this.render();
    }

    _onRemoveIngredient(event) {
        event.preventDefault();
        const name = event.currentTarget.dataset.ingredientName;
        if (name) { delete this.providedIngredients[name]; this.render(); }
    }

    async _onCraftItem(event) {
        event.preventDefault();
        if (!this.selectedRecipeId || !this.actor) return;
        const allRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor);
        const recipe = allRecipes.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;
        for (const ing of recipe.ingredients) {
            if ((this.providedIngredients[ing.name] || 0) < ing.quantity) {
                ui.notifications.error(`Not enough ${ing.name}.`);
                return;
            }
        }

        // Animation
        this._crafting = true;
        this.render();
        await new Promise(r => setTimeout(r, 2200));

        // Deduct
        for (const ing of recipe.ingredients) {
            let remaining = ing.quantity;
            const matching = this.actor.items.filter(i => canSubstitute(i.name, ing.name, recipe.rarity));
            for (const actorItem of matching) {
                if (remaining <= 0) break;
                const qty = actorItem.system?.quantity ?? 1;
                if (qty <= remaining) { remaining -= qty; await actorItem.delete(); }
                else { await actorItem.update({ "system.quantity": qty - remaining }); remaining = 0; }
            }
        }

        // Create output
        const output = recipe.output;
        const compendiumItem = await this._findInCompendiums(output.name);
        
        // We avoid carrying over problematic properties entirely.
        const cleanItemData = {
            name: output.name,
            type: compendiumItem?.type === "consumable" || compendiumItem?.type === "loot" ? compendiumItem.type : "loot",
            img: output.img || compendiumItem?.img || "icons/svg/item-bag.svg",
            system: {
                quantity: output.quantity ?? 1,
                description: {
                    value: compendiumItem?.system?.description?.value || ""
                }
            }
        };

        try {
            await this.actor.createEmbeddedDocuments("Item", [cleanItemData]);
            ui.notifications.info(`\u2713 ${this.actor.name} crafted ${output.name}!`);
        } catch (error) {
            console.error(`Artificer Foundry | Failed to create clean item ${output.name}. Error:`, error);
            ui.notifications.error(`Failed to craft ${output.name}. See console.`);
        }

        this.providedIngredients = {};
        this._crafting = false;
        this.render();
    }

    async _findInCompendiums(name) {
        const target = name.toLowerCase();
        const preferredPack = game.settings.get("artificer-foundry", "potionCompendiumPack");
        if (preferredPack) {
            const pack = game.packs.get(preferredPack);
            if (pack?.documentName === "Item") {
                try {
                    const idx = await pack.getIndex();
                    const entry = idx.find(e => e.name.toLowerCase() === target);
                    if (entry) return await pack.getDocument(entry._id);
                } catch {}
            }
        }
        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            if (pack.collection === preferredPack) continue;
            try {
                const idx = await pack.getIndex();
                const entry = idx.find(e => e.name.toLowerCase() === target);
                if (entry) return await pack.getDocument(entry._id);
            } catch {}
        }
        return null;
    }

    _onClearStation(event) { event.preventDefault(); this.providedIngredients = {}; this.render(); }
}