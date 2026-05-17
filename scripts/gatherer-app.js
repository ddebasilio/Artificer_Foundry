const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

// Type → image path lookup (verified against Foundry v14 core asset paths).
const INGREDIENT_IMAGES = {
    common_herb:          'icons/consumables/plants/herb-tied-bundle-green.webp',
    uncommon_herb:        'icons/consumables/plants/leaf-elm-glowing-green.webp',
    liquid:               'icons/consumables/potions/bottle-corked-empty.webp',
    common_component:     'icons/commodities/materials/plant-sprout-seed-green.webp',
    uncommon_component:   'icons/commodities/materials/powder-teal.webp',
    rare_component:       'icons/commodities/gems/gem-rough-cushion-teal.webp',
    monster_part:         'icons/commodities/bones/bone-jaw-teeth-white-grey.webp',
    rare_monster_part:    'icons/commodities/biological/organ-heart-red.webp',
    very_rare_component:  'icons/commodities/gems/gem-rough-cushion-purple.webp',
    legendary_component:  'icons/commodities/gems/gem-rough-cushion-red.webp',
};
const DEFAULT_INGREDIENT_IMG = 'icons/svg/item-bag.svg';

export class GathererApp extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.searchQuery = "";
        this.filterType = "all";
    }

    // ── Application V2 config ─────────────────────────────────────────────────

    static DEFAULT_OPTIONS = {
        window: {
            title: "Ingredient Gatherer",
            icon: "fas fa-leaf",
            resizable: true,
        },
        classes: ["artificer-foundry", "gatherer-app"],
        position: {
            width: 760,
            height: 580,
        },
    };

    static PARTS = {
        gatherer: {
            template: "modules/artificer-foundry/templates/gatherer-app.hbs"
        }
    };

    // ── Context ───────────────────────────────────────────────────────────────

    async _prepareContext(options) {
        const allRecipes = window.ArtificerFoundry.recipeManager.recipes;

        // Collect unique ingredients from all recipes
        const ingredientMap = new Map();
        for (const recipe of allRecipes) {
            for (const ing of recipe.ingredients) {
                if (!ingredientMap.has(ing.name)) {
                    ingredientMap.set(ing.name, { name: ing.name, type: ing.type });
                }
            }
        }

        // All ingredient names (lowercase) for inventory filtering
        const allIngredientNames = new Set(
            [...ingredientMap.keys()].map(n => n.toLowerCase())
        );

        // Collect all types for the filter dropdown
        const allTypes = [...new Set([...ingredientMap.values()].map(i => i.type))].sort();

        // Always pass all ingredients — filtering is done client-side in _onRender
        const ingredients = [...ingredientMap.values()].sort((a, b) => a.name.localeCompare(b.name));

        // Actor inventory — show only items whose names match catalog ingredients
        const inventory = (this.actor?.items?.contents ?? [])
            .filter(item => allIngredientNames.has(item.name.toLowerCase()))
            .map(item => ({
                id: item.id,
                name: item.name,
                img: item.img,
                quantity: item.system?.quantity ?? 1,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            actor: this.actor,
            ingredients,
            inventory,
            allTypes,
            filterType: this.filterType,
            searchQuery: this.searchQuery,
        };
    }

    // ── Event wiring ──────────────────────────────────────────────────────────

    _onRender(context, options) {
        const el = this.element;

        // Client-side search + type filter — no re-render on each keystroke
        const applyFilters = () => {
            const q = this.searchQuery.toLowerCase();
            const type = this.filterType;
            const rows = el.querySelectorAll('.ingredient-catalog-item');
            let visibleCount = 0;
            rows.forEach(row => {
                const nameMatch = !q || row.dataset.name.toLowerCase().includes(q);
                const typeMatch = type === 'all' || row.dataset.ingType === type;
                const show = nameMatch && typeMatch;
                row.style.display = show ? '' : 'none';
                if (show) visibleCount++;
            });
            // Show/hide "no results" message
            let noResults = el.querySelector('.gatherer-no-results');
            if (!noResults && rows.length > 0) {
                noResults = document.createElement('p');
                noResults.className = 'empty-list gatherer-no-results';
                noResults.textContent = 'No ingredients match your search.';
                el.querySelector('.gatherer-catalog-list')?.appendChild(noResults);
            }
            if (noResults) noResults.style.display = visibleCount === 0 ? '' : 'none';
        };

        el.querySelector('.gatherer-search')?.addEventListener('input', e => {
            this.searchQuery = e.target.value;
            applyFilters();
        });

        el.querySelector('.gatherer-filter-type')?.addEventListener('change', e => {
            this.filterType = e.target.value;
            applyFilters();
        });

        applyFilters(); // restore filter state after any re-render

        // Drag sources (catalog items)
        el.querySelectorAll('.ingredient-catalog-item').forEach(row => {
            row.addEventListener('dragstart', ev => {
                ev.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'af-ingredient',
                    name: row.dataset.name,
                    ingType: row.dataset.ingType,
                }));
                row.classList.add('dragging');
            });
            row.addEventListener('dragend', () => row.classList.remove('dragging'));
        });

        // Drop zone (right panel)
        const dropZone = el.querySelector('.gatherer-inventory');
        if (dropZone) {
            dropZone.addEventListener('dragover', e => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', this._onDrop.bind(this));
        }

        // Add buttons
        el.querySelectorAll('.add-ingredient-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const { name, ingType } = btn.dataset;
                const qtyInput = btn.closest('.ingredient-catalog-item')?.querySelector('.catalog-qty');
                const qty = Math.max(1, parseInt(qtyInput?.value ?? '1') || 1);
                await this._addIngredient(name, ingType, qty);
            });
        });

        // Inventory quantity buttons
        el.querySelectorAll('.inv-qty-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const item = this.actor?.items?.get(btn.dataset.itemId);
                if (!item) return;
                const current = item.system?.quantity ?? 1;
                const next = current + parseInt(btn.dataset.delta);
                if (next <= 0) {
                    await item.delete();
                } else {
                    await item.update({ 'system.quantity': next });
                }
                this.render();
            });
        });

        // Delete inventory item
        el.querySelectorAll('.inv-remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const item = this.actor?.items?.get(btn.dataset.itemId);
                if (item) await item.delete();
                this.render();
            });
        });
    }

    // ── Drop handler ──────────────────────────────────────────────────────────

    async _onDrop(e) {
        e.preventDefault();
        this.element.querySelector('.gatherer-inventory')?.classList.remove('drag-over');
        let data;
        try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
        if (data.type !== 'af-ingredient') return;
        await this._addIngredient(data.name, data.ingType, 1);
    }

    // ── Add ingredient to actor inventory ─────────────────────────────────────

    async _addIngredient(name, ingType, qty = 1) {
        if (!this.actor) return;

        // Stack with existing item if name matches
        const existing = this.actor.items.find(
            i => i.name.toLowerCase() === name.toLowerCase()
        );
        if (existing) {
            const current = existing.system?.quantity ?? 1;
            await existing.update({ 'system.quantity': current + qty });
            ui.notifications.info(`Added ${qty}× ${name}.`);
            this.render();
            return;
        }

        // Try compendium first for rich item data
        const compendiumItem = await this._findInCompendiums(name);
        if (compendiumItem) {
            const itemData = compendiumItem.toObject();
            itemData.system.quantity = qty;
            await this.actor.createEmbeddedDocuments("Item", [itemData]);
        } else {
            const img = INGREDIENT_IMAGES[ingType] ?? DEFAULT_INGREDIENT_IMG;
            await this.actor.createEmbeddedDocuments("Item", [{
                name,
                type: "loot",
                img,
                system: { quantity: qty },
            }]);
        }

        ui.notifications.info(`Added ${qty}× ${name} to ${this.actor.name}'s inventory.`);
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
}
