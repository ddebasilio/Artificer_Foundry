/**
 * Helper to import items via Plutonium when available.
 * Falls back to compendium-based item creation if Plutonium is not installed.
 */

export class PlutoniumHelper {

    static _getApi() {
        return game.modules.get("plutonium")?.api;
    }

    static isAvailable() {
        return !!(game.modules.get("plutonium")?.active && this._getApi()?.importer && globalThis.DataLoader);
    }

    /**
     * Import an item to an actor via Plutonium's importer.
     * @param {Actor} actor - The target actor
     * @param {string} itemName - The name of the item to import
     * @param {number} [quantity=1] - Quantity to set on the imported item
     * @returns {Promise<boolean>} true if import succeeded via Plutonium
     */
    static async pImportItem(actor, itemName, quantity = 1) {
        if (!this.isAvailable()) return false;

        try {
            const api = this._getApi();

            const allItems = await DataLoader.pCacheAndGetAllSite("item");
            if (!allItems?.length) {
                console.warn("Artificer Foundry | Plutonium DataLoader returned no items");
                return false;
            }

            const target = itemName.toLowerCase();
            const ent = allItems.find(it => it.name.toLowerCase() === target);
            if (!ent) {
                console.warn(`Artificer Foundry | Item "${itemName}" not found in 5etools data`);
                return false;
            }

            const importer = await api.importer.pGetImporter({page: "items.html"});
            if (!importer) {
                console.warn("Artificer Foundry | Failed to get Plutonium item importer");
                return false;
            }

            const importOpts = new api.importer.ImportOpts({actor});
            await importer.pImportEntry(ent, importOpts);

            if (quantity > 1) {
                const created = actor.items.contents.find(i => i.name.toLowerCase() === target);
                if (created?.system?.quantity !== undefined) {
                    await created.update({"system.quantity": quantity});
                }
            }

            return true;
        } catch (err) {
            console.error("Artificer Foundry | Plutonium import failed:", err);
            return false;
        }
    }

    /**
     * Import an item directly to the world items directory via Plutonium.
     * @param {string} itemName - The name of the item to import
     * @param {string} folderId - The folder ID to place the item in
     * @returns {Promise<Item|null>} the created world Item document or null
     */
    static async pImportItemToWorld(itemName, folderId) {
        if (!this.isAvailable()) return null;

        try {
            const api = this._getApi();

            const allItems = await DataLoader.pCacheAndGetAllSite("item");
            if (!allItems?.length) {
                console.warn("Artificer Foundry | Plutonium DataLoader returned no items");
                return null;
            }

            const target = itemName.toLowerCase();
            const ent = allItems.find(it => it.name.toLowerCase() === target);
            if (!ent) {
                console.warn(`Artificer Foundry | Item "${itemName}" not found in 5etools data`);
                return null;
            }

            const importer = await api.importer.pGetImporter({page: "items.html"});
            if (!importer) {
                console.warn("Artificer Foundry | Failed to get Plutonium item importer");
                return null;
            }

            // Snapshot existing world item IDs before import
            const beforeIds = new Set(game.items.map(i => i.id));

            // Import directly to the world (no actor)
            const importOpts = new api.importer.ImportOpts({});
            await importer.pImportEntry(ent, importOpts);

            // Find the newly created item(s) by diffing against the snapshot
            const newItems = game.items.filter(i => !beforeIds.has(i.id));
            let created = null;

            if (newItems.length === 1) {
                created = newItems[0];
            } else if (newItems.length > 1) {
                // Multiple items were created — pick the one matching by name
                created = newItems.find(i => i.name.toLowerCase() === target) ?? newItems[0];
            }

            if (created && folderId) {
                await created.update({ folder: folderId });
            }

            return created || null;
        } catch (err) {
            console.error("Artificer Foundry | Plutonium world import failed:", err);
            return null;
        }
    }
}
