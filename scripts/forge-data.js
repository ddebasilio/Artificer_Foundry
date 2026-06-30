/**
 * Forge material metadata for the Artificer Foundry module.
 * Loaded from data/forge-materials.json at runtime.
 */

import { getAbundanceModifiers, getTimeUnits, getIngredientCosts, getArtificerBag, getGatheringDice, rollFormula } from "./ingredient-data.js";

let _forgeData = null;

export async function loadForgeData() {
    if (_forgeData) return _forgeData;
    const resp = await fetch("modules/artificer-foundry/data/forge-materials.json");
    _forgeData = await resp.json();
    return _forgeData;
}

// ─── Accessors (sync, must call loadForgeData first) ─────────────────────────

export function getForgeTypeLabels() {
    return _forgeData?.typeLabels ?? {};
}

export function getForgeMaterialIcons() {
    return _forgeData?.icons ?? {};
}

export function getForgeTypeIcons() {
    return _forgeData?.typeIcons ?? {};
}

export function getDefaultForgeIcon() {
    return _forgeData?.defaultIcon ?? "icons/svg/item-bag.svg";
}

export function getForgeMaterialIcon(name, type) {
    const icons = getForgeMaterialIcons();
    if (icons[name]) return icons[name];
    return getForgeTypeIcons()[type] ?? getDefaultForgeIcon();
}

export function getForgeCraftingTimes() {
    return _forgeData?.craftingTimes ?? {};
}

export function getForgeMaterialCosts() {
    return _forgeData?.costs ?? {};
}

export function getForgeSubstitutionGroups() {
    return _forgeData?.substitutionGroups ?? {};
}

// ─── Crafting time helpers ───────────────────────────────────────────────────

export function getForgeCraftingTime(rarity, speedMult = 1.0) {
    const times = getForgeCraftingTimes();
    const base = times[rarity] ?? times.common ?? { days: 1, cost: 50 };
    const days = base.days * speedMult;
    return { days, cost: base.cost };
}

export function formatForgeCraftingTime(days) {
    if (days === 0.5) return "4 hours (1/2 day)";
    if (days === 1) return "1 day";
    if (days < 7) {
        return Number.isInteger(days) ? `${days} days` : `${days.toFixed(2).replace(/\.?0+$/, "")} days`;
    }
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    if (remainder === 0) return weeks === 1 ? "1 workweek" : `${weeks} workweeks`;
    const remStr = Number.isInteger(remainder) ? `${remainder}d` : `${remainder.toFixed(2).replace(/\.?0+$/, "")}d`;
    return `${weeks}w ${remStr}`;
}

// ─── Substitution logic ──────────────────────────────────────────────────────

export function canForgeSubstitute(ingredientName, requiredName, recipeRarity) {
    if (ingredientName.toLowerCase() === requiredName.toLowerCase()) return true;

    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);
    const groups = getForgeSubstitutionGroups();

    for (const group of Object.values(groups)) {
        const maxIdx = rarityOrder.indexOf(group.maxRecipeRarity);
        if (recipeIdx > maxIdx) continue;

        const hasRequired = group.members.some(m => m.toLowerCase() === requiredName.toLowerCase());
        const hasIngredient = group.members.some(m => m.toLowerCase() === ingredientName.toLowerCase());
        if (hasRequired && hasIngredient) return true;
    }
    return false;
}

export function getBiomeMaterials() {
    return _forgeData?.biomeMaterials ?? {};
}

export function getMaterialRarityWeights() {
    return _forgeData?.materialRarityWeights ?? {};
}

export function getForgeSubstitutes(ingredientName, recipeRarity) {
    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);
    const results = [];
    const groups = getForgeSubstitutionGroups();

    for (const group of Object.values(groups)) {
        const maxIdx = rarityOrder.indexOf(group.maxRecipeRarity);
        if (recipeIdx > maxIdx) continue;

        const isMember = group.members.some(m => m.toLowerCase() === ingredientName.toLowerCase());
        if (isMember) {
            for (const m of group.members) {
                if (m.toLowerCase() !== ingredientName.toLowerCase()) results.push(m);
            }
        }
    }
    return results;
}

/**
 * Resolve forge material gathering by a pre-computed DC (used by gathering panel).
 */
export function resolveForgeForagingByDC(dc, biomeKey, rollTotal, timeAmount = 1, timeUnit = "hours", abundanceKey = "medium", rarityMod = 0, forcedItemCount = null) {
    const abundanceMods = getAbundanceModifiers();
    const abundance = abundanceMods[abundanceKey] ?? { qtyMul: 1.0 };
    const critFail = rollTotal === 1;
    const critSuccess = rollTotal === 20;
    const success = rollTotal >= dc || critSuccess;

    if (critFail) return { success: false, dc, items: [], critFail: true };

    const timeUnits = getTimeUnits();
    const hours = timeAmount * (timeUnits[timeUnit]?.hours ?? 1);

    // Calculate time-scaled quantity using progressive dice roll or use forced roll
    let itemCount;
    if (forcedItemCount !== null && forcedItemCount !== undefined && forcedItemCount > 0) {
        itemCount = forcedItemCount;
    } else {
        const minutes = hours * 60;
        const rollData = getGatheringDice(minutes, abundance.qtyMul);
        itemCount = rollFormula(rollData.formula);
    }

    if (success) {
        if (itemCount === 0) itemCount = 1; // Guarantee at least 1 item on success
        if (forcedItemCount === null || forcedItemCount === undefined) {
            itemCount += critSuccess ? 2 : 1; // Success bonus
        }
    }

    if (itemCount === 0) return { success: false, dc, items: [], critFail: false };

    // Calculate time-scaled rarity multiplier
    const timeRarityMult = Math.min(2.5, 1.0 + Math.max(0, Math.log10(hours)));

    // Rarity distribution based on roll margin + GM rarityMod
    const margin = (rollTotal - dc) + rarityMod;
    let multipliers = { C: 1.0, U: 1.0, R: 1.0, VR: 1.0 };

    if (!success) {
        multipliers = { C: 1.0, U: 0.02 * timeRarityMult, R: 0.0, VR: 0.0 };
    } else if (critSuccess) {
        multipliers = { C: 0.1, U: 0.5 * timeRarityMult, R: 1.0 * timeRarityMult, VR: 1.0 * timeRarityMult };
    } else if (margin >= 10) {
        multipliers = { C: 0.2, U: 0.6 * timeRarityMult, R: 1.0 * timeRarityMult, VR: 0.8 * timeRarityMult };
    } else if (margin >= 5) {
        multipliers = { C: 0.5, U: 0.8 * timeRarityMult, R: 0.8 * timeRarityMult, VR: 0.2 * timeRarityMult };
    } else {
        const vrBase = 0.02 * timeRarityMult;
        multipliers = { C: 1.0, U: 0.8 * timeRarityMult, R: 0.4 * timeRarityMult, VR: vrBase };
    }

    const getGroup = (type) => {
        if (["metal", "crafting_supply", "wood", "hide", "natural", "cloth", "paper", "tool"].includes(type)) return "C";
        if (["essence", "gem", "monster_part", "arcane"].includes(type)) return "U";
        if (["divine", "elemental"].includes(type)) return "R";
        return "VR";
    };

    const rarityWeights = { ...getMaterialRarityWeights() };
    if ((rarityWeights["very_rare_metal"] ?? 0) === 0) rarityWeights["very_rare_metal"] = 1.5;
    if ((rarityWeights["rare_essence"] ?? 0) === 0) rarityWeights["rare_essence"] = 2.0;
    if ((rarityWeights["very_rare_essence"] ?? 0) === 0) rarityWeights["very_rare_essence"] = 1.0;
    if ((rarityWeights["legendary_essence"] ?? 0) === 0) rarityWeights["legendary_essence"] = 0.1;
    if ((rarityWeights["rare_gem"] ?? 0) === 0) rarityWeights["rare_gem"] = 2.0;
    if ((rarityWeights["very_rare_gem"] ?? 0) === 0) rarityWeights["very_rare_gem"] = 1.0;
    if ((rarityWeights["legendary_gem"] ?? 0) === 0) rarityWeights["legendary_gem"] = 0.1;
    if ((rarityWeights["rare_monster_part"] ?? 0) === 0) rarityWeights["rare_monster_part"] = 1.0;
    if ((rarityWeights["very_rare_monster_part"] ?? 0) === 0) rarityWeights["very_rare_monster_part"] = 0.5;
    if ((rarityWeights["very_rare_component"] ?? 0) === 0) rarityWeights["very_rare_component"] = 0.5;
    if ((rarityWeights["legendary_component"] ?? 0) === 0) rarityWeights["legendary_component"] = 0.1;
    if ((rarityWeights["divine"] ?? 0) === 0) rarityWeights["divine"] = 1.0;
    if ((rarityWeights["elemental"] ?? 0) === 0) rarityWeights["elemental"] = 1.0;
    if ((rarityWeights["planar"] ?? 0) === 0) rarityWeights["planar"] = 1.0;

    const biomePool = { ...getBiomeMaterials()[biomeKey] };
    const allIngredientsByTier = {};
    for (const bPool of Object.values(getBiomeMaterials())) {
        for (const [t, names] of Object.entries(bPool)) {
            if (!allIngredientsByTier[t]) allIngredientsByTier[t] = new Set();
            for (const name of names) allIngredientsByTier[t].add(name);
        }
    }

    const rareTiers = [
        "rare_metal", "very_rare_metal", "rare_essence", "very_rare_essence", "legendary_essence",
        "rare_gem", "very_rare_gem", "legendary_gem", "rare_monster_part", "very_rare_monster_part",
        "divine", "elemental", "planar", "very_rare_component", "legendary_component"
    ];
    for (const t of rareTiers) {
        const globalNames = Array.from(allIngredientsByTier[t] || []);
        if (globalNames.length > 0) {
            if (!biomePool[t]) {
                biomePool[t] = globalNames;
            } else {
                const existing = new Set(biomePool[t]);
                for (const name of globalNames) {
                    if (!existing.has(name)) biomePool[t].push(name);
                }
            }
        }
    }

    const items = [];
    const weightedPool = [];

    for (const [tier, names] of Object.entries(biomePool)) {
        const baseWeight = rarityWeights[tier] ?? 0;
        const group = getGroup(tier);
        const mult = multipliers[group];
        const finalWeight = baseWeight * mult;
        if (finalWeight > 0 && names.length > 0) {
            const itemWeight = finalWeight / names.length;
            for (const name of names) {
                weightedPool.push({ name, type: tier, weight: itemWeight });
            }
        }
    }

    if (weightedPool.length === 0) return { success: true, dc, items: [], critFail: false };

    const totalWeight = weightedPool.reduce((sum, e) => sum + e.weight, 0);

    for (let i = 0; i < itemCount; i++) {
        let roll = Math.random() * totalWeight;
        for (const entry of weightedPool) {
            roll -= entry.weight;
            if (roll <= 0) {
                const existing = items.find(it => it.name === entry.name);
                if (existing) existing.qty++;
                else items.push({ name: entry.name, type: entry.type, qty: 1 });
                break;
            }
        }
    }

    return { success: true, dc, items, critFail: false };
}

/**
 * Add a forge material item to an actor's inventory.
 */
export async function addForgeMaterialToActor(actor, name, type, qty = 1) {
    const icon = getForgeMaterialIcon(name, type);
    const existing = actor.items.find(i => i.name === name && i.type === "loot");
    const getWeight = (t) => {
        if (["metal", "rare_metal", "very_rare_metal", "wood", "hide", "natural"].includes(t)) return 1.0;
        return 0.1;
    };
    if (existing) {
        const newQty = (existing.system.quantity ?? 0) + qty;
        await existing.update({ "system.quantity": newQty });
    } else {
        const costs = getForgeMaterialCosts();
        const goldVal = costs[name] ?? 0;
        const bag = getArtificerBag(actor);
        const itemData = {
            name,
            type: "loot",
            img: icon,
            system: { 
                quantity: qty, 
                weight: { value: getWeight(type) },
                price: { value: goldVal, denomination: "gp" }
            }
        };
        if (bag) {
            itemData.system.container = bag.id;
        }
        await actor.createEmbeddedDocuments("Item", [itemData]);
    }
}
