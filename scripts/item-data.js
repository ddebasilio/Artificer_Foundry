/**
 * Item data for the Artificer Foundry forge system.
 * Loaded from data/items.json at runtime.
 * Items are matched by name to the Plutonium importer — descriptions, rarity, etc.
 * come from Plutonium, not from this module.
 */

let _itemData = null;

export async function loadItemData() {
    if (_itemData) return _itemData;
    const resp = await fetch("modules/artificer-foundry/data/items.json");
    _itemData = await resp.json();
    return _itemData;
}

export function getItemData() {
    return _itemData ?? [];
}
