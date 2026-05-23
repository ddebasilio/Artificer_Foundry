/**
 * Helper to import items via Plutonium when available.
 * Falls back to compendium-based item creation if Plutonium is not installed.
 */

export class PlutoniumHelper {

    /**
     * Check if Plutonium module is active and available.
     */
    static isAvailable() {
        return !!(game.modules.get("plutonium")?.active && game.plutonium?.importer);
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

            const importer = await game.plutonium.importer.pGetImporter({page: "items.html"});
            if (!importer) {
                console.warn("Artificer Foundry | Failed to get Plutonium item importer");
                return false;
            }

            const ImportOpts = game.plutonium.importer.ImportOpts;
            const importOpts = new ImportOpts({actor});

            await importer.pImportEntry(ent, importOpts);

            // Set quantity if needed
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
}
