/**
 * Forge material metadata for the Artificer Foundry module.
 * Loaded from data/forge-materials.json at runtime.
 */

import { getAbundanceModifiers, getTimeUnits, getIngredientCosts, getArtificerBag, getGatheringDice, rollFormula, calculateGroupWeights } from "./ingredient-data.js";

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
        const rollData = getGatheringDice(minutes, abundanceKey);
        itemCount = rollFormula(rollData.formula);
    }

    if (success) {
        if (itemCount === 0) itemCount = 1; // Guarantee at least 1 item on success
        if (forcedItemCount === null || forcedItemCount === undefined) {
            if (critSuccess) {
                itemCount = Math.round(itemCount * 1.5);
                if (itemCount <= 1) itemCount = 2;
            }
        }
    }

    if (itemCount === 0) return { success: false, dc, items: [], critFail: false };

    const getGroup = (type) => {
        if (["metal", "crafting_supply", "wood", "hide", "natural", "cloth", "paper", "tool"].includes(type)) return "C";
        if (["essence", "gem", "monster_part", "arcane"].includes(type)) return "U";
        if (["divine", "elemental", "rare_metal", "rare_essence", "rare_gem", "rare_monster_part"].includes(type)) return "R";
        return "VR";
    };

    let biomePool = {};
    if (biomeKey === "all") {
        const allBiomes = getBiomeMaterials();
        for (const [bKey, tiers] of Object.entries(allBiomes)) {
            if (bKey === "all") continue;
            for (const [t, names] of Object.entries(tiers)) {
                if (!biomePool[t]) biomePool[t] = [];
                for (const name of names) {
                    if (!biomePool[t].includes(name)) biomePool[t].push(name);
                }
            }
        }
    } else {
        const source = getBiomeMaterials()[biomeKey] ?? {};
        for (const [t, names] of Object.entries(source)) {
            biomePool[t] = [...names];
        }
    }
    const allIngredientsByTier = {};
    for (const bPool of Object.values(getBiomeMaterials())) {
        for (const [t, names] of Object.entries(bPool)) {
            if (!allIngredientsByTier[t]) allIngredientsByTier[t] = new Set();
            for (const name of names) allIngredientsByTier[t].add(name);
        }
    }

    // Statically inject very rare, legendary, divine, planar, elemental components if not in biomes
    const staticVeryRareMetal = ["Adamantine Ingot", "Mithral Ingot"];
    if (!allIngredientsByTier["very_rare_metal"]) allIngredientsByTier["very_rare_metal"] = new Set();
    for (const name of staticVeryRareMetal) allIngredientsByTier["very_rare_metal"].add(name);

    const staticVeryRareEssence = ["Superior Arcane Essence"];
    if (!allIngredientsByTier["very_rare_essence"]) allIngredientsByTier["very_rare_essence"] = new Set();
    for (const name of staticVeryRareEssence) allIngredientsByTier["very_rare_essence"].add(name);

    const staticLegendaryEssence = ["Legendary Arcane Essence"];
    if (!allIngredientsByTier["legendary_essence"]) allIngredientsByTier["legendary_essence"] = new Set();
    for (const name of staticLegendaryEssence) allIngredientsByTier["legendary_essence"].add(name);

    const staticVeryRareGem = ["Diamond"];
    if (!allIngredientsByTier["very_rare_gem"]) allIngredientsByTier["very_rare_gem"] = new Set();
    for (const name of staticVeryRareGem) allIngredientsByTier["very_rare_gem"].add(name);

    const staticLegendaryGem = ["Diamond"];
    if (!allIngredientsByTier["legendary_gem"]) allIngredientsByTier["legendary_gem"] = new Set();
    for (const name of staticLegendaryGem) allIngredientsByTier["legendary_gem"].add(name);

    const staticVeryRareMonsterPart = ["Storm Giant Blood", "Fire Giant Heartstring", "Pegasus Hair"];
    if (!allIngredientsByTier["very_rare_monster_part"]) allIngredientsByTier["very_rare_monster_part"] = new Set();
    for (const name of staticVeryRareMonsterPart) allIngredientsByTier["very_rare_monster_part"].add(name);

    const staticLegendaryComponent = ["Dragon Heart", "Unicorn Horn"];
    if (!allIngredientsByTier["legendary_component"]) allIngredientsByTier["legendary_component"] = new Set();
    for (const name of staticLegendaryComponent) allIngredientsByTier["legendary_component"].add(name);

    const staticDivine = ["Divine Spark"];
    if (!allIngredientsByTier["divine"]) allIngredientsByTier["divine"] = new Set();
    for (const name of staticDivine) allIngredientsByTier["divine"].add(name);

    const staticElemental = ["Elemental Core"];
    if (!allIngredientsByTier["elemental"]) allIngredientsByTier["elemental"] = new Set();
    for (const name of staticElemental) allIngredientsByTier["elemental"].add(name);

    const staticPlanar = ["Astral Shard"];
    if (!allIngredientsByTier["planar"]) allIngredientsByTier["planar"] = new Set();
    for (const name of staticPlanar) allIngredientsByTier["planar"].add(name);

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

    const groupWeights = calculateGroupWeights(rarityMod);
    const groupedItems = { C: [], U: [], R: [], VR: [] };
    for (const [tier, names] of Object.entries(biomePool)) {
        const group = getGroup(tier);
        if (names && names.length > 0) {
            for (const name of names) {
                if (!groupedItems[group].some(e => e.name === name)) {
                    groupedItems[group].push({ name, tier });
                }
            }
        }
    }

    const items = [];
    const weightedPool = [];
    for (const group of ["C", "U", "R", "VR"]) {
        const itemsInGroup = groupedItems[group];
        const gWeight = groupWeights[group];
        if (gWeight > 0 && itemsInGroup.length > 0) {
            const itemWeight = gWeight / itemsInGroup.length;
            for (const item of itemsInGroup) {
                weightedPool.push({ name: item.name, type: item.tier, weight: itemWeight });
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
