/**
 * Loot Generator – rolls treasure (coins + magic items) based on DMG loot tables.
 * Items are sourced from data/items.json grouped by rarity.
 */

import { getItemData } from "./item-data.js";

let _lootTables = null;
let _itemsByRarity = null;
let _itemsByCategory = null;

// ─── Item Category Definitions ────────────────────────────────────────────────

/** Ordered matchers – first match wins; unmatched items fall into "general" */
const _CATEGORY_MATCHERS = [
    { key: "potions",  test: (t) => /potion/i.test(t) },
    { key: "scrolls",  test: (t) => /scroll/i.test(t) },
    { key: "rings",    test: (t) => /\bring\b/i.test(t) },
    { key: "weapons",  test: (t) => /weapon|wand|shield|staff/i.test(t) },
    { key: "armor",    test: (t) => /\barmou?r\b/i.test(t) },
];

function _categoryForType(type) {
    for (const { key, test } of _CATEGORY_MATCHERS) {
        if (test(type)) return key;
    }
    return "general";
}

/** Normalize dnd5e camelCase rarity keys to items.json format (space-separated lowercase) */
const _rarityMap = {
    "veryRare": "very rare",
    "veryrare": "very rare",
    "very_rare": "very rare",
};

export function normalizeRarity(rarity) {
    if (!rarity) return "common";
    return _rarityMap[rarity] || rarity.toLowerCase().replace(/[_]+/g, " ").trim();
}

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
        const key = r;
        if (!_itemsByRarity[key]) _itemsByRarity[key] = [];
        _itemsByRarity[key].push(name);
    }
    return _itemsByRarity;
}

/** Build a { category: { rarity: [itemName, …] } } index from items.json */
function _buildCategoryIndex() {
    if (_itemsByCategory) return _itemsByCategory;
    const items = getItemData();
    _itemsByCategory = {};
    for (const [name, data] of Object.entries(items)) {
        const r = (data.rarity || "").toLowerCase().replace(/\s+/g, " ").trim();
        if (!r || r === "varies" || r.startsWith("unknown")) continue;
        const cat = _categoryForType(data.type || "");
        if (!_itemsByCategory[cat]) _itemsByCategory[cat] = {};
        if (!_itemsByCategory[cat][r]) _itemsByCategory[cat][r] = [];
        _itemsByCategory[cat][r].push(name);
    }
    return _itemsByCategory;
}

/** Pick a random item of the given rarity within a specific category */
function _pickRandomItemInCategory(rarity, category) {
    const index = _buildCategoryIndex();
    const pool = index[category]?.[rarity];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
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
                        img: "icons/svg/item-bag.svg",
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
    const normalized = normalizeRarity(rarity);
    const itemName = _pickRandomItem(normalized);
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
        img: "icons/svg/item-bag.svg",
    };
}

/**
 * Roll only the coin portion of a treasure hoard (no items).
 * @param {string} crTier
 * @returns {Promise<{coins: Object, items: []}>}
 */
export async function rollCurrencyOnly(crTier) {
    const tables = getLootTables();
    const tier = tables.treasureHoard[crTier];
    if (!tier) throw new Error(`Unknown CR tier: ${crTier}`);
    const coins = {};
    for (const [coinType, formula] of Object.entries(tier.baseCoins)) {
        coins[coinType] = await _evalFormula(formula);
    }
    return { coins, items: [] };
}

/**
 * Roll magic items from a specific category using the hoard item rarity table.
 * Coins are not included.
 * @param {string} crTier
 * @param {string} category – one of the keys from getItemCategories()
 * @returns {Promise<{coins: {}, items: Array}>}
 */
export async function rollItemsByCategory(crTier, category) {
    const tables = getLootTables();
    const tier = tables.treasureHoard[crTier];
    if (!tier) throw new Error(`Unknown CR tier: ${crTier}`);

    const d100 = Math.floor(Math.random() * 100) + 1;
    const row = tier.magicItems.find(r => d100 >= r.min && d100 <= r.max);
    const rolledItems = [];

    if (row && row.items.length > 0) {
        for (const entry of row.items) {
            const count = await _evalFormula(entry.count);
            for (let i = 0; i < count; i++) {
                const itemName = _pickRandomItemInCategory(entry.rarity, category);
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
                        img: "icons/svg/item-bag.svg",
                    });
                }
            }
        }
    }

    return { coins: {}, items: rolledItems };
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
        { value: "currency",   label: "Currency Only" },
        { value: "category",   label: "Items by Category" },
    ];
}

/**
 * Get item category options for the category roll mode.
 */
export function getItemCategories() {
    return [
        { value: "potions", label: "Potions" },
        { value: "scrolls", label: "Scrolls" },
        { value: "weapons", label: "Weapons, Wands, Staves & Shields" },
        { value: "armor",   label: "Armor" },
        { value: "rings",   label: "Rings" },
        { value: "general", label: "General Magic Items" },
    ];
}
