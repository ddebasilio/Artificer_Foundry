/**
 * Ingredient metadata for the Artificer Foundry module.
 * Loaded from data/potion-ingredients.json and data/biomes.json at runtime.
 */

let _ingredientData = null;
let _biomeData = null;

export async function loadIngredientData() {
    if (!_ingredientData) {
        const resp = await fetch("modules/artificer-foundry/data/potion-ingredients.json");
        _ingredientData = await resp.json();
    }
    if (!_biomeData) {
        const resp = await fetch("modules/artificer-foundry/data/biomes.json");
        _biomeData = await resp.json();
    }
    return { ingredients: _ingredientData, biomes: _biomeData };
}

// ─── Accessors (sync, must call loadIngredientData first) ────────────────────

export function getTypeLabels() {
    return _ingredientData?.typeLabels ?? {};
}

export function getIngredientIcons() {
    return _ingredientData?.icons ?? {};
}

export function getTypeIcons() {
    return _ingredientData?.typeIcons ?? {};
}

export function getDefaultIngredientIcon() {
    return _ingredientData?.defaultIcon ?? "icons/svg/item-bag.svg";
}

export function getIngredientIcon(name, type) {
    const icons = getIngredientIcons();
    if (icons[name]) return icons[name];
    return getTypeIcons()[type] ?? getDefaultIngredientIcon();
}

export function getSubstitutionGroups() {
    return _ingredientData?.substitutionGroups ?? {};
}

export function getCraftingTimes() {
    return _ingredientData?.craftingTimes ?? {};
}

export function getCraftingTimesHealingPotions() {
    return _ingredientData?.craftingTimesHealingPotions ?? {};
}

export function getIngredientCosts() {
    return _ingredientData?.costs ?? {};
}

// ─── Biome / Foraging accessors ──────────────────────────────────────────────

export function getBiomes() {
    return _biomeData?.biomes ?? {};
}

export function getAbundanceModifiers() {
    return _biomeData?.abundanceModifiers ?? {};
}

export function getTimeUnits() {
    return _biomeData?.timeUnits ?? {};
}

export function getBiomeIngredients() {
    return _biomeData?.biomeIngredients ?? {};
}

export function getRarityWeights() {
    return _biomeData?.rarityWeights ?? {};
}

export function getWeatherModifiers() {
    return _biomeData?.weatherModifiers ?? [];
}

export function getSeasonModifiers() {
    return _biomeData?.seasonModifiers ?? [];
}

export function getSkillOptions() {
    return _biomeData?.skillOptions ?? [];
}

// ─── Substitution logic ──────────────────────────────────────────────────────

export function canSubstitute(ingredientName, requiredName, recipeRarity) {
    if (ingredientName.toLowerCase() === requiredName.toLowerCase()) return true;

    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);
    const groups = getSubstitutionGroups();

    for (const group of Object.values(groups)) {
        const maxIdx = rarityOrder.indexOf(group.maxRecipeRarity);
        if (recipeIdx > maxIdx) continue;

        const hasRequired = group.members.some(m => m.toLowerCase() === requiredName.toLowerCase());
        const hasIngredient = group.members.some(m => m.toLowerCase() === ingredientName.toLowerCase());
        if (hasRequired && hasIngredient) return true;
    }
    return false;
}

export function getSubstitutes(ingredientName, recipeRarity) {
    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);
    const results = [];
    const groups = getSubstitutionGroups();

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

// ─── Crafting time helpers ───────────────────────────────────────────────────

export function getCraftingTime(rarity, speedMult = 1.0, isHealingPotion = false) {
    const times = isHealingPotion ? getCraftingTimesHealingPotions() : getCraftingTimes();
    const base = times[rarity] ?? times.common ?? { days: 1, cost: 25 };
    const days = base.days * speedMult;
    return { days, cost: base.cost };
}

export function formatCraftingTime(days) {
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

// ─── Foraging logic ──────────────────────────────────────────────────────────

function calculateTimeModifiers(amount, unit) {
    const timeUnits = getTimeUnits();
    const hours = amount * (timeUnits[unit]?.hours ?? 1);
    let dcMod = 0;
    let maxItems = 0;

    if (hours <= 1 / 600) {
        dcMod = +6; maxItems = 2;
    } else if (hours <= 1 / 60) {
        dcMod = +4; maxItems = 5;
    } else if (hours <= 10 / 60) {
        dcMod = +2; maxItems = 8;
    } else if (hours <= 1) {
        dcMod = 0; maxItems = 10;
    } else {
        const hourBlocks = Math.floor(hours);
        dcMod = -Math.min(4, Math.floor(hourBlocks / 2));
        maxItems = 5 + Math.floor((hours - 1) * 1);
        if (hours >= 8) maxItems = 50;
        if (hours > 8) maxItems += Math.floor((hours - 8) / 2);
    }

    return { dcMod, maxItems, label: `${amount} ${(timeUnits[unit]?.name ?? unit).toLowerCase()}` };
}

export function resolveForaging(biomeKey, abundanceKey, timeAmount, timeUnit, rollResult, rarityMod = 0) {
    const biomes = getBiomes();
    const abundanceMods = getAbundanceModifiers();
    const biome = biomes[biomeKey];
    const abundance = abundanceMods[abundanceKey];
    const timeModifiers = calculateTimeModifiers(timeAmount, timeUnit);

    if (!biome || !abundance || !timeUnit || isNaN(timeAmount)) return { success: false, dc: 20, items: [], critFail: false };

    const dc = Math.max(1, biome.baseDC + abundance.dcMod + timeModifiers.dcMod);
    const critFail = rollResult === 1;
    const critSuccess = rollResult === 20;
    const success = rollResult >= dc || critSuccess;

    if (critFail) return { success: false, dc, items: [], critFail: true };

    // Calculate time-scaled quantity using progressive dice roll
    const timeUnits = getTimeUnits();
    const hours = timeAmount * (timeUnits[timeUnit]?.hours ?? 1);
    const minutes = hours * 60;
    
    const rollData = getGatheringDice(minutes, abundance.qtyMul);
    let itemCount = rollFormula(rollData.formula);

    if (success) {
        if (itemCount === 0) itemCount = 1; // Guarantee at least 1 item on success
        itemCount += critSuccess ? 2 : 1; // Success bonus
    }

    if (itemCount === 0) return { success: false, dc, items: [], critFail: false };

    // Calculate time-scaled rarity multiplier (spending more time increases chances of rare things!)
    const timeRarityMult = Math.min(2.5, 1.0 + Math.max(0, Math.log10(hours)));

    // Rarity distribution based on roll margin + GM rarityMod
    const margin = (rollResult - dc) + rarityMod;
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

    const getGroup = (tier) => {
        if (["common_herb", "common_component", "liquid"].includes(tier)) return "C";
        if (["uncommon_herb", "uncommon_component"].includes(tier)) return "U";
        if (["monster_part", "rare_component"].includes(tier)) return "R";
        return "VR";
    };

    const rarityWeights = { ...getRarityWeights() };
    if ((rarityWeights["very_rare_component"] ?? 0) === 0) rarityWeights["very_rare_component"] = 0.5;
    if ((rarityWeights["legendary_component"] ?? 0) === 0) rarityWeights["legendary_component"] = 0.1;
    if ((rarityWeights["rare_monster_part"] ?? 0) === 0) rarityWeights["rare_monster_part"] = 1.0;

    const biomePool = { ...getBiomeIngredients()[biomeKey] };
    const allIngredientsByTier = {};
    for (const bPool of Object.values(getBiomeIngredients())) {
        for (const [t, names] of Object.entries(bPool)) {
            if (!allIngredientsByTier[t]) allIngredientsByTier[t] = new Set();
            for (const name of names) allIngredientsByTier[t].add(name);
        }
    }

    const rareTiers = ["monster_part", "rare_monster_part", "rare_component", "very_rare_component", "legendary_component"];
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
        if (finalWeight > 0) {
            for (const name of names) {
                weightedPool.push({ name, type: tier, weight: finalWeight });
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
 * Resolve foraging by a pre-computed DC (used by gathering panel).
 */
export function resolveForagingByDC(dc, biomeKey, rollTotal, timeAmount = 1, timeUnit = "hours", abundanceKey = "medium", rarityMod = 0) {
    const abundanceMods = getAbundanceModifiers();
    const abundance = abundanceMods[abundanceKey] ?? { qtyMul: 1.0 };
    const critFail = rollTotal === 1;
    const critSuccess = rollTotal === 20;
    const success = rollTotal >= dc || critSuccess;

    if (critFail) return { success: false, dc, items: [], critFail: true };

    // Calculate time-scaled quantity using progressive dice roll
    const timeUnits = getTimeUnits();
    const hours = timeAmount * (timeUnits[timeUnit]?.hours ?? 1);
    const minutes = hours * 60;
    
    const rollData = getGatheringDice(minutes, abundance.qtyMul);
    let itemCount = rollFormula(rollData.formula);

    if (success) {
        if (itemCount === 0) itemCount = 1; // Guarantee at least 1 item on success
        itemCount += critSuccess ? 2 : 1; // Success bonus
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

    const getGroup = (tier) => {
        if (["common_herb", "common_component", "liquid"].includes(tier)) return "C";
        if (["uncommon_herb", "uncommon_component"].includes(tier)) return "U";
        if (["monster_part", "rare_component"].includes(tier)) return "R";
        return "VR";
    };

    const biomePool = getBiomeIngredients()[biomeKey] ?? {};
    const rarityWeights = getRarityWeights();
    const items = [];
    const weightedPool = [];

    for (const [tier, names] of Object.entries(biomePool)) {
        const baseWeight = rarityWeights[tier] ?? 0;
        const group = getGroup(tier);
        const mult = multipliers[group];
        const finalWeight = baseWeight * mult;
        if (finalWeight > 0) {
            for (const name of names) {
                weightedPool.push({ name, type: tier, weight: finalWeight });
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
 * Get the Artificer's Component Bag on the actor if it exists.
 */
export function getArtificerBag(actor) {
    if (!actor) return null;
    return actor.items.find(i => 
        i.name === "Artificer's Component Bag" && 
        ["container", "backpack"].includes(i.type)
    ) || null;
}

/**
 * Add an ingredient item to an actor's inventory.
 */
export async function addIngredientToActor(actor, name, type, qty = 1) {
    const icon = getIngredientIcon(name, type);
    const existing = actor.items.find(i => i.name === name && i.type === "loot");
    if (existing) {
        const newQty = (existing.system.quantity ?? 0) + qty;
        await existing.update({ "system.quantity": newQty });
    } else {
        const costs = getIngredientCosts();
        const goldVal = costs[name] ?? 0;
        const bag = getArtificerBag(actor);
        const itemData = {
            name,
            type: "loot",
            img: icon,
            system: { 
                quantity: qty, 
                weight: { value: 0.1 },
                price: { value: goldVal, denomination: "gp" }
            }
        };
        if (bag) {
            itemData.system.container = bag.id;
        }
        await actor.createEmbeddedDocuments("Item", [itemData]);
    }
}

/**
 * Calculate the progressive dice pool for gathering based on minutes spent and abundance.
 */
export function getGatheringDice(minutes, qtyMul) {
    const totalMinutes = minutes * qtyMul;
    if (totalMinutes <= 1) {
        return { formula: "1d2 - 1", average: 0.5 };
    } else if (totalMinutes <= 5) {
        return { formula: "1d3", average: 2.0 };
    } else if (totalMinutes <= 10) {
        return { formula: "1d6", average: 3.5 };
    } else if (totalMinutes <= 15) {
        return { formula: "1d8", average: 4.5 };
    } else if (totalMinutes <= 30) {
        return { formula: "1d10", average: 5.5 };
    } else if (totalMinutes <= 45) {
        return { formula: "1d12 + 1d4", average: 9.0 };
    } else {
        const hours = totalMinutes / 60;
        const effectiveHours = Math.pow(hours, 0.6);
        const numD10 = Math.round(effectiveHours * 2);
        if (numD10 <= 1) {
            return { formula: "1d10", average: 5.5 };
        }
        return { formula: `${numD10}d10`, average: numD10 * 5.5 };
    }
}

/**
 * Roll a synchronous dice formula.
 */
export function rollFormula(formula) {
    if (formula === "1d2 - 1") {
        return Math.floor(Math.random() * 2);
    }
    const match = formula.replace(/\s+/g, "").match(/^(\d+)d(\d+)(?:\+(\d+)d(\d+))?$/);
    if (!match) return 1;
    
    const count1 = parseInt(match[1]);
    const faces1 = parseInt(match[2]);
    let total = 0;
    for (let i = 0; i < count1; i++) {
        total += Math.floor(Math.random() * faces1) + 1;
    }
    
    if (match[3] && match[4]) {
        const count2 = parseInt(match[3]);
        const faces2 = parseInt(match[4]);
        for (let i = 0; i < count2; i++) {
            total += Math.floor(Math.random() * faces2) + 1;
        }
    }
    return total;
}
