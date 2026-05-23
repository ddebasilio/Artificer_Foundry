/**
 * Loot Generator – rolls treasure (coins + magic items) based on DMG loot tables.
 * Items are sourced from data/items.json grouped by rarity.
 */

import { getItemData } from "./item-data.js";

let _lootTables = null;
let _itemsByRarity = null;

export async function loadLootTables() {
    if (_lootTables) return _lootTables;
    const resp = await fetch("modules/artificer-foundry/data/loot-tables.json");
    _lootTables = await resp.json();
    return _lootTables;
}

export function getLootTables() {
    return _lootTables;
}

/** Build a { rarity: [itemName, …] } index from items.json */
function _buildRarityIndex() {
    if (_itemsByRarity) return _itemsByRarity;
    const items = getItemData();
    _itemsByRarity = {};
    for (const [name, data] of Object.entries(items)) {
        const r = (data.rarity || "").toLowerCase().replace(/\s+/g, " ").trim();
        if (!r || r === "varies" || r.startsWith("unknown")) continue;
        // Normalise "very rare" → "very rare"
        const key = r;
        if (!_itemsByRarity[key]) _itemsByRarity[key] = [];
        _itemsByRarity[key].push(name);
    }
    return _itemsByRarity;
}

/** Evaluate a dice formula like "4d6*100" and return the numeric result */
async function _evalFormula(formula) {
    // Split multiplier: "4d6*100" → roll "4d6", multiply by 100
    const parts = formula.split("*");
    const diceExpr = parts[0];
    const multiplier = parts.length > 1 ? parseInt(parts[1]) : 1;
    const roll = await new Roll(diceExpr).evaluate();
    return roll.total * multiplier;
}

/** Pick a random item name of the given rarity */
function _pickRandomItem(rarity) {
    const index = _buildRarityIndex();
    const pool = index[rarity];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
}

/** Get full item data by name */
export function getItemDetails(name) {
    const items = getItemData();
    return items[name] ?? null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Roll individual treasure for a given CR tier.
 * @param {string} crTier – e.g. "CR0-4", "CR5-10", "CR11-16", "CR17+"
 * @returns {Promise<{coins: Object}>}  e.g. { coins: { gp: 42, sp: 120 } }
 */
export async function rollIndividualTreasure(crTier) {
    const tables = getLootTables();
    const tier = tables.individualTreasure[crTier];
    if (!tier) throw new Error(`Unknown CR tier: ${crTier}`);

    const d100 = Math.floor(Math.random() * 100) + 1;
    const row = tier.coins.find(r => d100 >= r.min && d100 <= r.max);
    if (!row) return { coins: {} };

    const amount = await _evalFormula(row.formula);
    return { coins: { [row.type]: amount } };
}

/**
 * Roll a treasure hoard for a given CR tier.
 * @param {string} crTier
 * @returns {Promise<{coins: Object, items: Array<{name, rarity, text, type, price}>}>}
 */
export async function rollTreasureHoard(crTier) {
    const tables = getLootTables();
    const tier = tables.treasureHoard[crTier];
    if (!tier) throw new Error(`Unknown CR tier: ${crTier}`);

    // Roll base coins
    const coins = {};
    for (const [coinType, formula] of Object.entries(tier.baseCoins)) {
        coins[coinType] = await _evalFormula(formula);
    }

    // Roll magic items
    const d100 = Math.floor(Math.random() * 100) + 1;
    const row = tier.magicItems.find(r => d100 >= r.min && d100 <= r.max);
    const rolledItems = [];

    if (row && row.items.length > 0) {
        for (const entry of row.items) {
            const count = await _evalFormula(entry.count);
            for (let i = 0; i < count; i++) {
                const itemName = _pickRandomItem(entry.rarity);
                if (itemName) {
                    const details = getItemDetails(itemName);
                    rolledItems.push({
                        id: foundry.utils.randomID(),
                        name: itemName,
                        rarity: entry.rarity,
                        type: details?.type ?? "",
                        text: details?.text ?? "",
                        price: details?.price ?? 0,
                        source: details?.source ?? "",
                    });
                }
            }
        }
    }

    return { coins, items: rolledItems };
}

/**
 * Reroll a single item slot – returns a new random item of the same rarity.
 * @param {string} rarity
 * @returns {{id, name, rarity, type, text, price, source}}
 */
export function rerollItem(rarity) {
    const itemName = _pickRandomItem(rarity);
    if (!itemName) return null;
    const details = getItemDetails(itemName);
    return {
        id: foundry.utils.randomID(),
        name: itemName,
        rarity,
        type: details?.type ?? "",
        text: details?.text ?? "",
        price: details?.price ?? 0,
        source: details?.source ?? "",
    };
}

/**
 * Get the CR tier options for UI dropdowns.
 */
export function getCRTiers() {
    return [
        { value: "CR0-4",   label: "CR 0–4" },
        { value: "CR5-10",  label: "CR 5–10" },
        { value: "CR11-16", label: "CR 11–16" },
        { value: "CR17+",   label: "CR 17+" },
    ];
}

/**
 * Get loot type options.
 */
export function getLootTypes() {
    return [
        { value: "hoard",      label: "Treasure Hoard" },
        { value: "individual", label: "Individual Treasure" },
    ];
}
