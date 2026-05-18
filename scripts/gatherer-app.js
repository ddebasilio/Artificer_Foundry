const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { TYPE_LABELS, getIngredientIcon, TYPE_ICONS, INGREDIENT_COSTS, BIOMES, ABUNDANCE_MODIFIERS, TIME_UNITS, resolveForaging } from "./ingredient-data.js";

const DEFAULT_INGREDIENT_IMG = 'icons/svg/item-bag.svg';

export class GathererApp extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.searchQuery = "";
        this.filterType = "all";
        this.sortBy = "name";
        // Foraging state
        this.forageBiome = "forest";
        this.forageAbundance = "medium";
        this.forageTimeAmount = 1;
        this.forageTimeUnit = "hours";
    }

    static DEFAULT_OPTIONS = {
        window: { title: "Ingredient Gatherer", icon: "fas fa-leaf", resizable: true },
        classes: ["artificer-foundry", "gatherer-app"],
        position: { width: 820, height: 640 },
    };

    static PARTS = {
        gatherer: { template: "modules/artificer-foundry/templates/gatherer-app.hbs" }
    };

    async _prepareContext(options) {
        const allRecipes = window.ArtificerFoundry.recipeManager.recipes;
        const ingredientMap = new Map();
        for (const recipe of allRecipes) {
            for (const ing of recipe.ingredients) {
                if (!ingredientMap.has(ing.name)) {
                    ingredientMap.set(ing.name, {
                        name: ing.name,
                        type: ing.type,
                        icon: getIngredientIcon(ing.name, ing.type),
                        typeLabel: TYPE_LABELS[ing.type] || ing.type,
                        cost: INGREDIENT_COSTS[ing.name] || 0,
                    });
                }
            }
        }

        const allIngredientNames = new Set([...ingredientMap.keys()].map(n => n.toLowerCase()));
        const allTypes = [...new Set([...ingredientMap.values()].map(i => i.type))].sort();
        const allTypeLabels = allTypes.map(t => ({ value: t, label: TYPE_LABELS[t] || t }));

        let ingredients = [...ingredientMap.values()];
        if (this.sortBy === "type") {
            ingredients.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        } else {
            ingredients.sort((a, b) => a.name.localeCompare(b.name));
        }

        const inventory = (this.actor?.items?.contents ?? [])
            .filter(item => allIngredientNames.has(item.name.toLowerCase()))
            .map(item => ({ id: item.id, name: item.name, img: item.img, quantity: item.system?.quantity ?? 1 }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const biomes = Object.entries(BIOMES).map(([k, v]) => ({ value: k, ...v }));
        const abundances = Object.entries(ABUNDANCE_MODIFIERS).map(([k, v]) => ({ value: k, ...v }));
        const timeUnits = Object.entries(TIME_UNITS).map(([k, v]) => ({ value: k, ...v }));

        return {
            actor: this.actor, ingredients, inventory, allTypes, allTypeLabels,
            filterType: this.filterType, searchQuery: this.searchQuery, sortBy: this.sortBy,
            biomes, abundances, timeUnits,
            forageBiome: this.forageBiome, forageAbundance: this.forageAbundance,
            forageTimeAmount: this.forageTimeAmount, forageTimeUnit: this.forageTimeUnit,
        };
    }

    _onRender(context, options) {
        const el = this.element;

        const applyFilters = () => {
            const q = this.searchQuery.toLowerCase();
            const type = this.filterType;
            el.querySelectorAll('.ingredient-catalog-item').forEach(row => {
                const nameMatch = !q || row.dataset.name.toLowerCase().includes(q);
                const typeMatch = type === 'all' || row.dataset.ingType === type;
                row.style.display = (nameMatch && typeMatch) ? '' : 'none';
            });
        };

        el.querySelector('.gatherer-search')?.addEventListener('input', e => { this.searchQuery = e.target.value; applyFilters(); });
        el.querySelector('.gatherer-filter-type')?.addEventListener('change', e => { this.filterType = e.target.value; applyFilters(); });
        el.querySelector('.gatherer-sort')?.addEventListener('change', e => { this.sortBy = e.target.value; this.render(); });
        applyFilters();

        // Drag sources
        el.querySelectorAll('.ingredient-catalog-item').forEach(row => {
            row.addEventListener('dragstart', ev => {
                ev.dataTransfer.setData('text/plain', JSON.stringify({ type: 'af-ingredient', name: row.dataset.name, ingType: row.dataset.ingType }));
                row.classList.add('dragging');
            });
            row.addEventListener('dragend', () => row.classList.remove('dragging'));
        });

        // Drop zone
        const dropZone = el.querySelector('.gatherer-inventory');
        if (dropZone) {
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
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

        // Inventory controls
        el.querySelectorAll('.inv-qty-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const item = this.actor?.items?.get(btn.dataset.itemId);
                if (!item) return;
                const next = (item.system?.quantity ?? 1) + parseInt(btn.dataset.delta);
                if (next <= 0) await item.delete();
                else await item.update({ 'system.quantity': next });
                this.render();
            });
        });
        el.querySelectorAll('.inv-remove-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const item = this.actor?.items?.get(btn.dataset.itemId);
                if (item) await item.delete();
                this.render();
            });
        });

        // Foraging controls
        el.querySelector('.forage-biome')?.addEventListener('change', e => { this.forageBiome = e.target.value; });
        el.querySelector('.forage-abundance')?.addEventListener('change', e => { this.forageAbundance = e.target.value; });
        el.querySelector('.forage-time-amount')?.addEventListener('change', e => { this.forageTimeAmount = Number(e.target.value) || 1; });
        el.querySelector('.forage-time-unit')?.addEventListener('change', e => { this.forageTimeUnit = e.target.value; });
        el.querySelector('.forage-roll-btn')?.addEventListener('click', this._onForage.bind(this));
    }

    async _onDrop(e) {
        e.preventDefault();
        this.element.querySelector('.gatherer-inventory')?.classList.remove('drag-over');
        let data;
        try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
        if (data.type !== 'af-ingredient') return;
        await this._addIngredient(data.name, data.ingType, 1);
    }

    async _addIngredient(name, ingType, qty = 1) {
        if (!this.actor) return;
        const existing = this.actor.items.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            await existing.update({ 'system.quantity': (existing.system?.quantity ?? 1) + qty });
            ui.notifications.info(`Added ${qty}\u00d7 ${name}.`);
            this.render();
            return;
        }
        const compendiumItem = await this._findInCompendiums(name);
        if (compendiumItem) {
            const itemData = compendiumItem.toObject();
            itemData.system.quantity = qty;
            try {
                await this.actor.createEmbeddedDocuments("Item", [itemData]);
            } catch (error) {
                console.warn(`Artificer Foundry | Failed to create item from compendium data, falling back to basic loot item. Error:`, error);
                const img = getIngredientIcon(name, ingType) || compendiumItem.img;
                await this.actor.createEmbeddedDocuments("Item", [{ name, type: "loot", img, system: { quantity: qty } }]);
            }
        } else {
            const img = getIngredientIcon(name, ingType);
            await this.actor.createEmbeddedDocuments("Item", [{ name, type: "loot", img, system: { quantity: qty } }]);
        }
        ui.notifications.info(`Added ${qty}\u00d7 ${name} to ${this.actor.name}'s inventory.`);
        this.render();
    }

    async _onForage(event) {
        event.preventDefault();
        if (!this.actor) { ui.notifications.warn("No actor associated."); return; }

        // Roll d20
        const roll = await new Roll("1d20").evaluate();
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: `<strong>Foraging Roll</strong> (${BIOMES[this.forageBiome]?.name}, ${ABUNDANCE_MODIFIERS[this.forageAbundance]?.name}, ${this.forageTimeAmount} ${TIME_UNITS[this.forageTimeUnit]?.name.toLowerCase()})`,
        });

        const result = resolveForaging(this.forageBiome, this.forageAbundance, this.forageTimeAmount, this.forageTimeUnit, roll.total);

        if (result.critFail) {
            ui.notifications.warn("Critical failure! You found nothing and disturbed the area.");
            return;
        }

        if (!result.success) {
            ui.notifications.info(`DC was ${result.dc}. You didn't find anything useful this time.`);
            return;
        }

        // Add found items
        let msg = `<strong>${this.actor.name} found:</strong><ul>`;
        for (const item of result.items) {
            await this._addIngredient(item.name, item.type, item.qty);
            msg += `<li>${item.qty}\u00d7 ${item.name}</li>`;
        }
        msg += `</ul><em>DC was ${result.dc}</em>`;

        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            content: msg,
        });
    }

    async _findInCompendiums(name) {
        const target = name.toLowerCase();
        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            try {
                const index = await pack.getIndex();
                const entry = index.find(e => e.name.toLowerCase() === target);
                if (entry) return await pack.getDocument(entry._id);
            } catch {}
        }
        return null;
    }
}