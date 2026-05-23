/**
 * Potion & oil data for the Artificer Foundry crafting system.
 * Loaded from data/potions.json at runtime.
 * Name-keyed; descriptions and metadata come from the Plutonium importer at runtime.
 */

let _potionData = null;

export async function loadPotionData() {
    if (_potionData) return _potionData;
    const resp = await fetch("modules/artificer-foundry/data/potions.json");
    _potionData = await resp.json();
    return _potionData;
}

export function getPotionData() {
    return _potionData ?? {};
}
