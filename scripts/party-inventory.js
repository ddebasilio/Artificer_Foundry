/**
 * Party Inventory – a sidebar tab that holds shared loot.
 * GM can send loot here from the Loot Generator; players can drag items
 * to their character sheets (removing from party) or add items back.
 * Uses Plutonium importer when available, same pattern as forge-app.js.
 */

import { PlutoniumHelper } from "./plutonium-helper.js";

const MODULE_ID = "artificer-foundry";
const SOCKET_NAME = `module.${MODULE_ID}`;

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;

export class PartyInventory extends HandlebarsApplicationMixin(AbstractSidebarTab) {

    static tabName = "af-party-inventory";

    static PARTS = {
        inventory: {
            template: "modules/artificer-foundry/templates/party-inventory.hbs",
        }
    };

    static DEFAULT_OPTIONS = {
        id: "af-party-inventory",
        classes: ["af-party-inventory-tab"],
    };

    constructor(options = {}) {
        super(options);
    }

    // ─── Data helpers ────────────────────────────────────────────────────────────

    static _getInventory() {
        return game.settings.get(MODULE_ID, "partyInventory") ?? { coins: {}, items: [] };
    }

    static async _setInventory(inv) {
        await game.settings.set(MODULE_ID, "partyInventory", inv);
    }

    /** Add coins to party inventory */
    static async addCoins(coins) {
        const inv = this._getInventory();
        if (!inv.coins) inv.coins = {};
        for (const [type, amount] of Object.entries(coins)) {
            inv.coins[type] = (inv.coins[type] || 0) + amount;
        }
        await this._setInventory(inv);
        this._broadcastRefresh();
    }

    /** Add items to party inventory */
    static async addItems(items) {
        const inv = this._getInventory();
        if (!inv.items) inv.items = [];
        inv.items.push(...items);
        await this._setInventory(inv);
        this._broadcastRefresh();
    }

    /** Add full loot result (coins + items) to party inventory */
    static async addLoot(lootResult) {
        const inv = this._getInventory();
        if (!inv.coins) inv.coins = {};
        if (!inv.items) inv.items = [];
        if (lootResult.coins) {
            for (const [type, amount] of Object.entries(lootResult.coins)) {
                inv.coins[type] = (inv.coins[type] || 0) + amount;
            }
        }
        if (lootResult.items) {
            inv.items.push(...lootResult.items);
        }
        await this._setInventory(inv);
        this._broadcastRefresh();
    }

    /** Remove an item by id from party inventory */
    static async removeItem(itemId) {
        const inv = this._getInventory();
        inv.items = (inv.items || []).filter(i => i.id !== itemId);
        await this._setInventory(inv);
        this._broadcastRefresh();
    }

    /** Remove coins from party inventory */
    static async removeCoins(coinType, amount) {
        const inv = this._getInventory();
        if (!inv.coins?.[coinType]) return false;
        if (inv.coins[coinType] < amount) return false;
        inv.coins[coinType] -= amount;
        if (inv.coins[coinType] <= 0) delete inv.coins[coinType];
        await this._setInventory(inv);
        this._broadcastRefresh();
        return true;
    }

    /** Broadcast refresh to all connected clients via socket */
    static _broadcastRefresh() {
        this._refreshLocal();
        game.socket.emit(SOCKET_NAME, { action: "refreshPartyInventory" });
    }

    /** Refresh the local panel instance */
    static _refreshLocal() {
        const tab = ui["af-party-inventory"];
        if (tab) tab.render(true);
    }

    /** Register socket listener (called from main.js) */
    static registerSocketListeners() {
        game.socket.on(SOCKET_NAME, (data) => {
            if (data.action === "refreshPartyInventory") {
                this._refreshLocal();
            }
        });
    }

    // ─── Template data ───────────────────────────────────────────────────────────

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const inv = PartyInventory._getInventory();

        const coinOrder = ["pp", "gp", "ep", "sp", "cp"];
        const coinLabels = { cp: "Copper", sp: "Silver", ep: "Electrum", gp: "Gold", pp: "Platinum" };
        const coinIcons = { cp: "fa-coins", sp: "fa-coins", ep: "fa-coins", gp: "fa-coins", pp: "fa-coins" };
        const coins = coinOrder
            .filter(c => (inv.coins?.[c] || 0) > 0)
            .map(c => ({ type: c, label: coinLabels[c], amount: inv.coins[c], icon: coinIcons[c] }));

        const rarityOrder = { common: 0, uncommon: 1, rare: 2, "very rare": 3, legendary: 4, artifact: 5 };
        const items = [...(inv.items || [])].sort((a, b) => (rarityOrder[a.rarity] ?? 9) - (rarityOrder[b.rarity] ?? 9));

        // Ensure every item has an img fallback
        for (const item of items) {
            if (!item.img) item.img = "icons/svg/item-bag.svg";
        }

        const ownedActors = game.actors.filter(a => a.isOwner && a.type === "character");

        Object.assign(context, {
            coins,
            items,
            hasCoins: coins.length > 0,
            hasItems: items.length > 0,
            isEmpty: coins.length === 0 && items.length === 0,
            isGM: game.user.isGM,
            ownedActors: ownedActors.map(a => ({ id: a.id, name: a.name })),
        });

        return context;
    }

    // ─── Listeners ───────────────────────────────────────────────────────────────

    _onRender(context, options) {
        super._onRender(context, options);
        const el = this.element;

        // ── Drag-and-drop: make items draggable ──
        el.querySelectorAll('.af-pi-item-row[draggable="true"]').forEach(row => {
            row.addEventListener('dragstart', (e) => {
                const itemId = row.dataset.itemId;
                e.dataTransfer.setData("application/af-party-inventory", JSON.stringify({
                    type: "af-party-inventory-item",
                    itemId,
                }));
                e.dataTransfer.effectAllowed = "move";
                row.classList.add('dragging');
            });
            row.addEventListener('dragend', () => {
                row.classList.remove('dragging');
            });
        });

        // ── Click on item: view item details ──
        el.querySelectorAll('.af-pi-item-row').forEach(row => {
            row.addEventListener('click', (e) => {
                const itemId = row.dataset.itemId;
                const inv = PartyInventory._getInventory();
                const item = inv.items?.find(i => i.id === itemId);
                if (!item) return;
                this._viewItem(item);
            });
        });

        // ── Clear inventory button ──
        el.querySelector('.af-pi-clear-btn')?.addEventListener('click', async () => {
            const first = await foundry.applications.api.DialogV2.confirm({
                window: { title: "Clear Party Inventory" },
                content: "<p>Are you sure you want to delete <strong>all items and coins</strong> from the party inventory?</p>",
                yes: { label: "Yes, Clear It" },
                no: { label: "Cancel" },
            });
            if (!first) return;
            const second = await foundry.applications.api.DialogV2.confirm({
                window: { title: "Final Confirmation" },
                content: "<p><strong>This cannot be undone.</strong> All party inventory contents will be permanently deleted. Are you absolutely sure?</p>",
                yes: { label: "Delete Everything" },
                no: { label: "Cancel" },
            });
            if (!second) return;
            await PartyInventory._setInventory({ coins: {}, items: [] });
            PartyInventory._broadcastRefresh();
            ui.notifications.info("Party inventory cleared.");
        });

        // ── Coin take: input + take button ──
        el.querySelectorAll('.af-pi-coin-take-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const coinType = btn.dataset.coinType;
                const input = el.querySelector(`.af-pi-coin-input[data-coin-type="${coinType}"]`);
                const amount = parseInt(input?.value) || 0;
                if (amount <= 0) {
                    ui.notifications.warn("Enter an amount to take.");
                    return;
                }
                const actorSelect = el.querySelector('.af-pi-actor-select');
                const actorId = actorSelect?.value;
                if (!actorId) {
                    ui.notifications.warn("Select a character first.");
                    return;
                }
                await this._takeCoins(coinType, amount, actorId);
            });
        });

        // ── Take all coins ──
        el.querySelector('.af-pi-take-all-coins')?.addEventListener('click', async () => {
            const actorSelect = el.querySelector('.af-pi-actor-select');
            const actorId = actorSelect?.value;
            if (!actorId) {
                ui.notifications.warn("Select a character first.");
                return;
            }
            await this._takeAllCoins(actorId);
        });

        // ── Drop zone: allow dropping items from character sheets onto party inventory ──
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });
        el.addEventListener('drop', async (e) => {
            e.preventDefault();
            // Check for party inventory items first (ignore if dropped back on self)
            const afData = e.dataTransfer.getData("application/af-party-inventory");
            if (afData) return;

            let data;
            try {
                data = JSON.parse(e.dataTransfer.getData("text/plain"));
            } catch { return; }

            // Handle drops from character sheets (Foundry Item type)
            if (data.type === "Item" && data.uuid) {
                await this._handleItemDrop(data);
            }
        });
    }

    // ─── Actions ─────────────────────────────────────────────────────────────────

    /** Handle an item dropped from a character sheet onto party inventory */
    async _handleItemDrop(data) {
        const item = await fromUuid(data.uuid);
        if (!item) return;

        const actor = item.parent;
        if (!actor || actor.documentName !== "Actor") {
            ui.notifications.warn("Can only add items from character sheets.");
            return;
        }
        if (!actor.isOwner) {
            ui.notifications.warn("You don't own this character.");
            return;
        }

        const transferableTypes = ["loot", "weapon", "equipment", "consumable", "tool", "backpack", "container"];
        if (!transferableTypes.includes(item.type)) {
            ui.notifications.warn(`Cannot transfer ${item.type} items to party inventory.`);
            return;
        }

        // Add to party inventory (include img for display)
        await PartyInventory.addItems([{
            id: foundry.utils.randomID(),
            name: item.name,
            img: item.img || "icons/svg/item-bag.svg",
            rarity: item.system?.rarity || "common",
            type: item.type,
            text: item.system?.description?.value || "",
            price: item.system?.price?.value || 0,
            source: "",
        }]);

        // Remove from character
        await actor.deleteEmbeddedDocuments("Item", [item.id]);
        ui.notifications.info(`Moved ${item.name} from ${actor.name} to party inventory.`);
        await ChatMessage.create({
            content: `<p><strong>${actor.name}</strong> added <strong>${item.name}</strong> to the party inventory.</p>`,
            speaker: { alias: "Party Inventory" },
        });
    }

    async _takeCoins(coinType, amount, actorId) {
        const inv = PartyInventory._getInventory();
        const available = inv.coins?.[coinType] || 0;
        if (amount > available) amount = available;
        if (amount <= 0) return;

        const actor = game.actors.get(actorId);
        if (!actor) return;

        const currencyPath = `system.currency.${coinType}`;
        const current = foundry.utils.getProperty(actor, currencyPath) || 0;
        await actor.update({ [currencyPath]: current + amount });
        await PartyInventory.removeCoins(coinType, amount);

        const coinLabels = { cp: "Copper", sp: "Silver", ep: "Electrum", gp: "Gold", pp: "Platinum" };
        ui.notifications.info(`${actor.name} took ${amount} ${coinLabels[coinType] || coinType}.`);
    }

    async _takeAllCoins(actorId) {
        const inv = PartyInventory._getInventory();
        const actor = game.actors.get(actorId);
        if (!actor) return;

        for (const [coinType, amount] of Object.entries(inv.coins || {})) {
            if (amount <= 0) continue;
            const currencyPath = `system.currency.${coinType}`;
            const current = foundry.utils.getProperty(actor, currencyPath) || 0;
            await actor.update({ [currencyPath]: current + amount });
        }
        const inv2 = PartyInventory._getInventory();
        inv2.coins = {};
        await PartyInventory._setInventory(inv2);
        PartyInventory._broadcastRefresh();
        ui.notifications.info(`${actor.name} took all coins from party inventory.`);
    }

    /** View item details in a dialog */
    _viewItem(item) {
        const rarityLabel = item.rarity ? item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1) : "Common";
        const html = `
            <div style="display:flex; gap:12px; align-items:flex-start;">
                <img src="${item.img || 'icons/svg/item-bag.svg'}" width="64" height="64" style="border:none; border-radius:4px;">
                <div>
                    <p><strong>Type:</strong> ${item.type || 'loot'}</p>
                    <p><strong>Rarity:</strong> ${rarityLabel}</p>
                    ${item.price ? `<p><strong>Price:</strong> ${item.price} gp</p>` : ''}
                    ${item.text ? `<div style="margin-top:8px;">${item.text}</div>` : '<p><em>No description available.</em></p>'}
                </div>
            </div>`;
        new foundry.applications.api.DialogV2({
            window: { title: item.name },
            content: html,
            buttons: [{ action: "close", label: "Close" }],
        }).render(true);
    }

    /** Import item to actor using Plutonium (like forge-app), fallback to compendium */
    async _createItemOnActor(actor, itemData) {
        // Try Plutonium first (same pattern as forge-app.js)
        const plutoniumImported = await PlutoniumHelper.pImportItem(actor, itemData.name, 1);
        if (plutoniumImported) return;

        // Fallback: search compendiums
        let compendiumItem = null;
        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            try {
                const index = await pack.getIndex();
                const entry = index.find(e => e.name === itemData.name);
                if (entry) {
                    compendiumItem = await pack.getDocument(entry._id);
                    break;
                }
            } catch (e) { /* skip inaccessible packs */ }
        }

        if (compendiumItem) {
            await actor.createEmbeddedDocuments("Item", [compendiumItem.toObject()]);
        } else {
            // Last resort: create a basic loot item
            await actor.createEmbeddedDocuments("Item", [{
                name: itemData.name,
                type: "loot",
                system: {
                    description: { value: itemData.text || "" },
                    rarity: itemData.rarity || "",
                    price: { value: itemData.price || 0, denomination: "gp" },
                    quantity: 1,
                },
                img: itemData.img || "icons/svg/item-bag.svg",
            }]);
        }
    }
}

// ─── Global drop handler: handle party inventory items dropped on actor sheets ──
// Use a document-level drop listener for maximum compatibility with ApplicationV2 sheets.
Hooks.once('ready', () => {
    document.addEventListener('drop', async (event) => {
        const raw = event.dataTransfer.getData("application/af-party-inventory");
        if (!raw) return;

        let data;
        try {
            data = JSON.parse(raw);
        } catch { return; }

        if (data.type !== "af-party-inventory-item") return;

        // Stop Foundry from interpreting this as a real Item drop
        event.stopImmediatePropagation();
        event.preventDefault();

        // Prevent duplicate processing
        if (event._afPiHandled) return;
        event._afPiHandled = true;

        // Find the actor sheet this was dropped on
        // Check AppV2 instances first, then legacy ui.windows
        let actor = null;
        for (const app of foundry.applications.instances.values()) {
            const el = app.element instanceof HTMLElement ? app.element : app.element?.[0];
            if (el?.contains(event.target) && app.document?.documentName === "Actor") {
                actor = app.document;
                break;
            }
        }
        if (!actor) {
            const sheet = Object.values(ui.windows).find(w => {
                const el = w.element instanceof HTMLElement ? w.element : w.element?.[0];
                return el?.contains(event.target);
            });
            actor = sheet?.document ?? sheet?.object ?? sheet?.actor;
        }
        if (!actor || actor.documentName !== "Actor") {
            ui.notifications.warn("Drop items onto a character sheet.");
            return;
        }

        // Check item still exists in inventory
        const inv = PartyInventory._getInventory();
        const item = inv.items?.find(i => i.id === data.itemId);
        if (!item) {
            ui.notifications.warn("Item no longer in party inventory.");
            return;
        }

        // Remove from party inventory FIRST to prevent double-processing
        await PartyInventory.removeItem(data.itemId);

        // Import via Plutonium, then compendium, then basic creation
        const tab = ui["af-party-inventory"];
        if (tab) {
            await tab._createItemOnActor(actor, item);
        }

        ui.notifications.info(`${actor.name} took ${item.name} from party inventory.`);
        await ChatMessage.create({
            content: `<p><strong>${actor.name}</strong> took <strong>${item.name}</strong> from the party inventory.</p>`,
            speaker: { alias: "Party Inventory" },
        });
    }, true);  // Use capture phase to intercept before Foundry's handlers
});
