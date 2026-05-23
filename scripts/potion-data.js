/**
 * Potion & oil data for the Artificer Foundry crafting system.
 * Loaded from data/items.json at runtime, filtered to potion/oil types.
 * Name-keyed; descriptions and metadata come from the Plutonium importer at runtime.
 */

let _potionData = null;

export async function loadPotionData() {
    if (_potionData) return _potionData;
    const resp = await fetch("modules/artificer-foundry/data/items.json");
    const items = await resp.json();
    _potionData = {};
    for (const [name, data] of Object.entries(items)) {
        const type = (data.type || "").toLowerCase();
        if (type.includes("potion") || type.includes("oil") || type.includes("elixir")) {
            _potionData[name.toLowerCase()] = data;
        }
    }
    return _potionData;
}

export function getPotionData() {
    return _potionData ?? {};
}
