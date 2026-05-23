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

export function getCraftingTime(rarity, isAlchemist = false) {
    const times = getCraftingTimes();
    const base = times[rarity] ?? times.common ?? { days: 1, cost: 25 };
    const days = isAlchemist ? Math.max(1, Math.ceil(base.days / 2)) : base.days;
    return { days, cost: base.cost };
}

export function formatCraftingTime(days) {
    if (days === 1) return "1 day";
    if (days < 7) return `${days} days`;
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    if (remainder === 0) return weeks === 1 ? "1 workweek" : `${weeks} workweeks`;
    return `${weeks}w ${remainder}d`;
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

export function resolveForaging(biomeKey, abundanceKey, timeAmount, timeUnit, rollResult) {
    const biomes = getBiomes();
    const abundanceMods = getAbundanceModifiers();
    const biome = biomes[biomeKey];
    const abundance = abundanceMods[abundanceKey];
    const timeModifiers = calculateTimeModifiers(timeAmount, timeUnit);

    if (!biome || !abundance || !timeUnit || isNaN(timeAmount)) return { success: false, dc: 20, items: [], critFail: false };

    const dc = Math.max(1, biome.baseDC + abundance.dcMod + timeModifiers.dcMod);
    const critFail = rollResult === 1;
    const critSuccess = rollResult === 20;

    if (critFail) return { success: false, dc, items: [], critFail: true };
    if (rollResult < dc && !critSuccess) return { success: false, dc, items: [], critFail: false };

    const margin = rollResult - dc;
    let itemCount = Math.min(timeModifiers.maxItems, Math.max(1, Math.floor(1 + margin / 3)));
    itemCount = Math.ceil(itemCount * abundance.qtyMul);
    if (critSuccess) itemCount = Math.min(timeModifiers.maxItems, itemCount + 2);

    const biomePool = getBiomeIngredients()[biomeKey] ?? {};
    const rarityWeights = getRarityWeights();
    const items = [];
    const weightedPool = [];

    for (const [tier, names] of Object.entries(biomePool)) {
        const weight = rarityWeights[tier] ?? 0;
        for (const name of names) {
            weightedPool.push({ name, type: tier, weight });
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
export function resolveForagingByDC(dc, biomeKey, rollTotal) {
    const critFail = rollTotal === 1;
    const critSuccess = rollTotal === 20;

    if (critFail) return { success: false, dc, items: [], critFail: true };
    if (rollTotal < dc && !critSuccess) return { success: false, dc, items: [], critFail: false };

    const margin = rollTotal - dc;
    let itemCount = Math.max(1, Math.floor(1 + margin / 3));
    if (critSuccess) itemCount += 2;

    const biomePool = getBiomeIngredients()[biomeKey] ?? {};
    const rarityWeights = getRarityWeights();
    const items = [];
    const weightedPool = [];

    for (const [tier, names] of Object.entries(biomePool)) {
        const weight = rarityWeights[tier] ?? 0;
        for (const name of names) {
            weightedPool.push({ name, type: tier, weight });
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
 * Add an ingredient item to an actor's inventory.
 */
export async function addIngredientToActor(actor, name, type, qty = 1) {
    const icon = getIngredientIcon(name, type);
    const existing = actor.items.find(i => i.name === name && i.type === "loot");
    if (existing) {
        const newQty = (existing.system.quantity ?? 0) + qty;
        await existing.update({ "system.quantity": newQty });
    } else {
        await actor.createEmbeddedDocuments("Item", [{
            name,
            type: "loot",
            img: icon,
            system: { quantity: qty }
        }]);
    }
}
