const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { getForgeTypeLabels, getForgeMaterialIcon, getForgeTypeIcons, getForgeMaterialCosts } from "./forge-data.js";

const DEFAULT_MATERIAL_IMG = 'icons/svg/item-bag.svg';

export class MaterialsApp extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;
        this.searchQuery = "";
        this.filterType = "all";
        this.sortBy = "name";
    }

    static DEFAULT_OPTIONS = {
        window: { title: "Materials Catalog", icon: "fas fa-hammer", resizable: true },
        classes: ["artificer-foundry", "materials-app"],
        position: { width: 820, height: 640 },
    };

    static PARTS = {
        materials: { template: "modules/artificer-foundry/templates/materials-app.hbs" }
    };

    async _prepareContext(options) {
        const allRecipes = window.ArtificerFoundry.forgeRecipeManager.recipes;
        const materialMap = new Map();
        const typeLabels = getForgeTypeLabels();
        const costs = getForgeMaterialCosts();

        for (const recipe of allRecipes) {
            for (const ing of recipe.ingredients) {
                if (!materialMap.has(ing.name)) {
                    materialMap.set(ing.name, {
                        name: ing.name,
                        type: ing.type,
                        icon: getForgeMaterialIcon(ing.name, ing.type),
                        typeLabel: typeLabels[ing.type] || ing.type,
                        cost: costs[ing.name] || 0,
                    });
                }
            }
        }

        const allMaterialNames = new Set([...materialMap.keys()].map(n => n.toLowerCase()));
        const allTypes = [...new Set([...materialMap.values()].map(i => i.type))].sort();
        const allTypeLabels = allTypes.map(t => ({ value: t, label: typeLabels[t] || t }));

        let materials = [...materialMap.values()];
        if (this.sortBy === "type") {
            materials.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
        } else {
            materials.sort((a, b) => a.name.localeCompare(b.name));
        }

        const inventory = (this.actor?.items?.contents ?? [])
            .filter(item => allMaterialNames.has(item.name.toLowerCase()))
            .map(item => ({ id: item.id, name: item.name, img: item.img, quantity: item.system?.quantity ?? 1 }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            actor: this.actor, materials, inventory, allTypes, allTypeLabels,
            filterType: this.filterType, searchQuery: this.searchQuery, sortBy: this.sortBy,
        };
    }

    _onRender(context, options) {
        const el = this.element;

        const applyFilters = () => {
            const q = this.searchQuery.toLowerCase();
            const type = this.filterType;
            el.querySelectorAll('.material-catalog-item').forEach(row => {
                const nameMatch = !q || row.dataset.name.toLowerCase().includes(q);
                const typeMatch = type === 'all' || row.dataset.matType === type;
                row.style.display = (nameMatch && typeMatch) ? '' : 'none';
            });
        };

        el.querySelector('.materials-search')?.addEventListener('input', e => { this.searchQuery = e.target.value; applyFilters(); });
        el.querySelector('.materials-filter-type')?.addEventListener('change', e => { this.filterType = e.target.value; applyFilters(); });
        el.querySelector('.materials-sort')?.addEventListener('change', e => { this.sortBy = e.target.value; this.render(); });
        applyFilters();

        // Drag sources
        el.querySelectorAll('.material-catalog-item').forEach(row => {
            row.addEventListener('dragstart', ev => {
                ev.dataTransfer.setData('text/plain', JSON.stringify({ type: 'af-material', name: row.dataset.name, matType: row.dataset.matType }));
                row.classList.add('dragging');
            });
            row.addEventListener('dragend', () => row.classList.remove('dragging'));
        });

        // Drop zone
        const dropZone = el.querySelector('.materials-inventory');
        if (dropZone) {
            dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
            dropZone.addEventListener('drop', this._onDrop.bind(this));
        }

        // Add buttons
        el.querySelectorAll('.add-material-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const { name, matType } = btn.dataset;
                const qtyInput = btn.closest('.material-catalog-item')?.querySelector('.catalog-qty');
                const qty = Math.max(1, parseInt(qtyInput?.value ?? '1') || 1);
                await this._addMaterial(name, matType, qty);
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
    }

    async _onDrop(e) {
        e.preventDefault();
        this.element.querySelector('.materials-inventory')?.classList.remove('drag-over');
        let data;
        try { data = JSON.parse(e.dataTransfer.getData('text/plain')); } catch { return; }
        if (data.type !== 'af-material') return;
        await this._addMaterial(data.name, data.matType, 1);
    }

    async _addMaterial(name, matType, qty = 1) {
        if (!this.actor) return;
        const targetName = name.toLowerCase();

        let matchingItems = this.actor.items.contents.filter(i => i.name.toLowerCase() === targetName);

        if (this.actor.items.invalidDocumentIds) {
            for (const id of this.actor.items.invalidDocumentIds) {
                if (!matchingItems.find(i => i.id === id)) {
                    const raw = this.actor._source.items.find(i => i._id === id);
                    if (raw && raw.name.toLowerCase() === targetName) {
                        matchingItems.push({
                            id: id, _source: raw, isInvalid: true,
                            delete: async () => { await this.actor.deleteEmbeddedDocuments("Item", [id]); }
                        });
                    }
                }
            }
        }

        if (matchingItems.length > 0) {
            let totalQty = 0;
            let isCorrupted = false;
            let validExisting = null;

            for (const item of matchingItems) {
                const raw = item._source || item;
                totalQty += raw.system?.quantity ?? 1;
                const hasActivities = raw.system?.activities && Object.keys(raw.system.activities).length > 0;
                if (raw.type !== "loot" || hasActivities || item.isInvalid || this.actor.items.invalidDocumentIds?.has(item.id)) {
                    isCorrupted = true;
                } else {
                    if (!validExisting) validExisting = item;
                }
            }

            if (isCorrupted || matchingItems.length > 1 || !validExisting) {
                for (const item of matchingItems) {
                    try { await item.delete(); } catch(e) {}
                }
                const compendiumItem = await this._findInCompendiums(name);
                const img = getForgeMaterialIcon(name, matType) || compendiumItem?.img || DEFAULT_MATERIAL_IMG;
                await this.actor.createEmbeddedDocuments("Item", [{
                    name, type: "loot", img,
                    system: { quantity: totalQty + qty, description: { value: compendiumItem?.system?.description?.value || "" } }
                }]);
                ui.notifications.info(`Added ${qty}× ${name} (and cleaned up corrupted item).`);
            } else {
                try {
                    await validExisting.update({ 'system.quantity': totalQty + qty });
                    ui.notifications.info(`Added ${qty}× ${name}.`);
                } catch(e) {
                    await validExisting.delete();
                    await this.actor.createEmbeddedDocuments("Item", [{
                        name: validExisting.name, type: "loot", img: validExisting.img,
                        system: { quantity: totalQty + qty, description: validExisting._source?.system?.description || {} }
                    }]);
                    ui.notifications.info(`Added ${qty}× ${name}.`);
                }
            }
            this.render();
            return;
        }

        const compendiumItem = await this._findInCompendiums(name);
        const img = getForgeMaterialIcon(name, matType) || compendiumItem?.img || DEFAULT_MATERIAL_IMG;
        await this.actor.createEmbeddedDocuments("Item", [{
            name, type: "loot", img,
            system: { quantity: qty, description: { value: compendiumItem?.system?.description?.value || "" } }
        }]);
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
            } catch {}
        }
        return null;
    }
}
