/**
 * Party Inventory – a sidebar tab that holds shared loot.
 * GM can send loot here from the Loot Generator; players can drag items
 * to their character sheets (removing from party) or add items back.
 */

const MODULE_ID = "artificer-foundry";

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
        this._refreshAll();
    }

    /** Add items to party inventory */
    static async addItems(items) {
        const inv = this._getInventory();
        if (!inv.items) inv.items = [];
        inv.items.push(...items);
        await this._setInventory(inv);
        this._refreshAll();
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
        this._refreshAll();
    }

    /** Remove an item by id from party inventory */
    static async removeItem(itemId) {
        const inv = this._getInventory();
        inv.items = (inv.items || []).filter(i => i.id !== itemId);
        await this._setInventory(inv);
        this._refreshAll();
    }

    /** Remove coins from party inventory */
    static async removeCoins(coinType, amount) {
        const inv = this._getInventory();
        if (!inv.coins?.[coinType]) return false;
        if (inv.coins[coinType] < amount) return false;
        inv.coins[coinType] -= amount;
        if (inv.coins[coinType] <= 0) delete inv.coins[coinType];
        await this._setInventory(inv);
        this._refreshAll();
        return true;
    }

    /** Refresh all open instances of this panel */
    static _refreshAll() {
        const tab = ui.sidebar?.tabInstances?.["af-party-inventory"] ?? ui.sidebar?.tabs?.["af-party-inventory"];
        if (tab) tab.render(true);
    }

    // ─── Template data ───────────────────────────────────────────────────────────

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const inv = PartyInventory._getInventory();

        const coinOrder = ["pp", "gp", "ep", "sp", "cp"];
        const coinLabels = { cp: "Copper", sp: "Silver", ep: "Electrum", gp: "Gold", pp: "Platinum" };
        const coins = coinOrder
            .filter(c => (inv.coins?.[c] || 0) > 0)
            .map(c => ({ type: c, label: coinLabels[c], amount: inv.coins[c] }));

        const rarityOrder = { common: 0, uncommon: 1, rare: 2, "very rare": 3, legendary: 4, artifact: 5 };
        const items = [...(inv.items || [])].sort((a, b) => (rarityOrder[a.rarity] ?? 9) - (rarityOrder[b.rarity] ?? 9));

        // Determine which actors the current user owns (for the "take" dropdown)
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

        // Take item button
        el.querySelectorAll('.af-pi-take-item').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = btn.dataset.itemId;
                const actorSelect = el.querySelector('.af-pi-actor-select');
                const actorId = actorSelect?.value;
                if (!actorId) {
                    ui.notifications.warn("Select a character first.");
                    return;
                }
                await this._takeItem(itemId, actorId);
            });
        });

        // Take coins button
        el.querySelectorAll('.af-pi-take-coins').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const coinType = btn.dataset.coinType;
                const actorSelect = el.querySelector('.af-pi-actor-select');
                const actorId = actorSelect?.value;
                if (!actorId) {
                    ui.notifications.warn("Select a character first.");
                    return;
                }
                await this._takeCoins(coinType, actorId);
            });
        });

        // Take all coins
        el.querySelector('.af-pi-take-all-coins')?.addEventListener('click', async () => {
            const actorSelect = el.querySelector('.af-pi-actor-select');
            const actorId = actorSelect?.value;
            if (!actorId) {
                ui.notifications.warn("Select a character first.");
                return;
            }
            await this._takeAllCoins(actorId);
        });

        // GM: Add item from character to party inventory
        el.querySelector('.af-pi-add-item-btn')?.addEventListener('click', () => this._onAddItemDialog());

        // GM: Clear all
        el.querySelector('.af-pi-clear-all')?.addEventListener('click', async () => {
            const confirm = await Dialog.confirm({
                title: "Clear Party Inventory",
                content: "<p>Remove all items and coins from the party inventory?</p>",
            });
            if (confirm) {
                await PartyInventory._setInventory({ coins: {}, items: [] });
                PartyInventory._refreshAll();
            }
        });

        // Item description expand
        el.querySelectorAll('.af-pi-item-name').forEach(row => {
            row.addEventListener('click', () => {
                const desc = row.closest('.af-pi-item-row')?.querySelector('.af-pi-item-desc');
                if (desc) desc.classList.toggle('expanded');
            });
        });
    }

    // ─── Actions ─────────────────────────────────────────────────────────────────

    async _takeItem(itemId, actorId) {
        const inv = PartyInventory._getInventory();
        const item = inv.items?.find(i => i.id === itemId);
        if (!item) { ui.notifications.warn("Item not found in party inventory."); return; }

        const actor = game.actors.get(actorId);
        if (!actor) { ui.notifications.warn("Actor not found."); return; }

        // Try to create the item on the actor via Plutonium compendium lookup or basic item creation
        await this._createItemOnActor(actor, item);
        await PartyInventory.removeItem(itemId);

        ui.notifications.info(`${actor.name} took ${item.name} from party inventory.`);
        await ChatMessage.create({
            content: `<p><strong>${actor.name}</strong> took <strong>${item.name}</strong> from the party inventory.</p>`,
            speaker: { alias: "Party Inventory" },
        });
    }

    async _takeCoins(coinType, actorId) {
        const inv = PartyInventory._getInventory();
        const amount = inv.coins?.[coinType] || 0;
        if (amount <= 0) return;

        const actor = game.actors.get(actorId);
        if (!actor) return;

        // Prompt for amount
        const html = `<form><div class="form-group"><label>Amount (max ${amount})</label><input type="number" name="amount" value="${amount}" min="1" max="${amount}"></div></form>`;
        const result = await Dialog.prompt({
            title: `Take ${coinType.toUpperCase()}`,
            content: html,
            callback: (html) => {
                const form = html instanceof HTMLElement ? html.querySelector('form') : html[0]?.querySelector('form') ?? html.find?.('form')?.[0];
                return parseInt(form?.querySelector('[name=amount]')?.value) || 0;
            },
        });
        if (!result || result <= 0) return;
        const takeAmount = Math.min(result, amount);

        // Add to actor's currency
        const currencyPath = `system.currency.${coinType}`;
        const current = foundry.utils.getProperty(actor, currencyPath) || 0;
        await actor.update({ [currencyPath]: current + takeAmount });
        await PartyInventory.removeCoins(coinType, takeAmount);

        ui.notifications.info(`${actor.name} took ${takeAmount} ${coinType} from party inventory.`);
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
        PartyInventory._refreshAll();
        ui.notifications.info(`${actor.name} took all coins from party inventory.`);
    }

    async _createItemOnActor(actor, itemData) {
        // Try to find the item in compendiums first (Plutonium or dnd5e SRD)
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
            // Fallback: create a basic loot item
            await actor.createEmbeddedDocuments("Item", [{
                name: itemData.name,
                type: "loot",
                system: {
                    description: { value: itemData.text || "" },
                    rarity: itemData.rarity || "",
                    price: { value: itemData.price || 0, denomination: "gp" },
                    quantity: 1,
                },
                img: "icons/svg/item-bag.svg",
            }]);
        }
    }

    _onAddItemDialog() {
        // Simple dialog for GM to add an item back from a character
        const actors = game.actors.filter(a => a.type === "character");
        const actorOptions = actors.map(a => `<option value="${a.id}">${a.name}</option>`).join("");

        new Dialog({
            title: "Add Item to Party Inventory",
            content: `
                <form>
                    <div class="form-group">
                        <label>From Character</label>
                        <select name="actorId">${actorOptions}</select>
                    </div>
                    <p class="notes">Select a character, then pick an item from their inventory to move to the party inventory.</p>
                </form>`,
            buttons: {
                next: {
                    icon: '<i class="fas fa-arrow-right"></i>',
                    label: "Select Item",
                    callback: async (html) => {
                        const form = html instanceof HTMLElement ? html.querySelector('form') : html[0]?.querySelector('form') ?? html.find?.('form')?.[0];
                        const actorId = form?.querySelector('[name=actorId]')?.value;
                        if (actorId) await this._showItemPickerDialog(actorId);
                    }
                },
                cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" }
            },
            default: "next",
        }).render(true);
    }

    async _showItemPickerDialog(actorId) {
        const actor = game.actors.get(actorId);
        if (!actor) return;

        const items = actor.items.filter(i => ["loot", "weapon", "equipment", "consumable", "tool", "backpack", "container"].includes(i.type));
        if (items.length === 0) {
            ui.notifications.warn(`${actor.name} has no transferable items.`);
            return;
        }

        const itemOptions = items.map(i => `<option value="${i.id}">${i.name} (${i.type})</option>`).join("");

        new Dialog({
            title: `Move Item from ${actor.name}`,
            content: `
                <form>
                    <div class="form-group">
                        <label>Item</label>
                        <select name="itemId">${itemOptions}</select>
                    </div>
                </form>`,
            buttons: {
                move: {
                    icon: '<i class="fas fa-exchange-alt"></i>',
                    label: "Move to Party",
                    callback: async (html) => {
                        const form = html instanceof HTMLElement ? html.querySelector('form') : html[0]?.querySelector('form') ?? html.find?.('form')?.[0];
                        const itemId = form?.querySelector('[name=itemId]')?.value;
                        if (itemId) await this._moveItemToParty(actor, itemId);
                    }
                },
                cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel" }
            },
            default: "move",
        }).render(true);
    }

    async _moveItemToParty(actor, itemId) {
        const item = actor.items.get(itemId);
        if (!item) return;

        await PartyInventory.addItems([{
            id: foundry.utils.randomID(),
            name: item.name,
            rarity: item.system?.rarity || "common",
            type: item.type,
            text: item.system?.description?.value || "",
            price: item.system?.price?.value || 0,
            source: "",
        }]);

        await actor.deleteEmbeddedDocuments("Item", [itemId]);
        ui.notifications.info(`Moved ${item.name} from ${actor.name} to party inventory.`);
        await ChatMessage.create({
            content: `<p><strong>${actor.name}</strong> added <strong>${item.name}</strong> to the party inventory.</p>`,
            speaker: { alias: "Party Inventory" },
        });
    }
}
