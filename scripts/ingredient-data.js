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

export function getItemTier(name) {
    if (!name) return "common";
    const nameLower = name.toLowerCase();

    const pBiomes = getBiomeIngredients() || {};
    for (const biomeData of Object.values(pBiomes)) {
        if (!biomeData || typeof biomeData !== "object") continue;
        for (const [tier, names] of Object.entries(biomeData)) {
            if (Array.isArray(names) && names.some(n => n.toLowerCase() === nameLower)) {
                return tier;
            }
        }
    }

    const getForgeBiomes = window.ArtificerFoundry?.getBiomeMaterials;
    const fBiomes = getForgeBiomes ? getForgeBiomes() : {};
    for (const biomeData of Object.values(fBiomes)) {
        if (!biomeData || typeof biomeData !== "object") continue;
        for (const [tier, names] of Object.entries(biomeData)) {
            if (Array.isArray(names) && names.some(n => n.toLowerCase() === nameLower)) {
                return tier;
            }
        }
    }

    const staticVeryRare = ["Phoenix Ash", "Shadow Essence", "Vampire Dust", "Paladin's Tear", "Celestial Feather", "Cloud Giant Heartstring", "Medusa Blood", "Storm Giant Blood", "Adamantine Ingot", "Mithral Ingot", "Superior Arcane Essence"];
    if (staticVeryRare.some(n => n.toLowerCase() === nameLower)) return "very_rare_component";

    const staticLegendary = ["Lich Finger Bone", "Unicorn Horn", "Dragon Heart", "Dragon Scale", "Demon Horn Fragment", "Legendary Core"];
    if (staticLegendary.some(n => n.toLowerCase() === nameLower)) return "legendary_component";

    return "common";
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

export function calculateGroupWeights(rarityMod = 0) {
    const shift = rarityMod * 0.06; // 6% shift per point
    let c = 0.60;
    let u = 0.30;
    let r = 0.07;
    let vr = 0.03;

    if (rarityMod >= 0) {
        c = Math.max(0.10, 0.60 - shift);
        r = 0.07 + shift * 0.70;
        vr = 0.03 + shift * 0.30;
    } else {
        c = Math.min(0.95, 0.60 - shift);
        const rem = 1.0 - c;
        u = rem * 0.75;
        r = rem * 0.175;
        vr = rem * 0.075;
    }

    return { C: c, U: u, R: r, VR: vr };
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

    const timeUnits = getTimeUnits();
    const hours = timeAmount * (timeUnits[timeUnit]?.hours ?? 1);
    const minutes = hours * 60;
    
    const rollData = getGatheringDice(minutes, abundanceKey);
    let itemCount = rollFormula(rollData.formula);

    if (success) {
        if (itemCount === 0) itemCount = 1;
        if (critSuccess) {
            itemCount = Math.round(itemCount * 1.5);
            if (itemCount <= 1) itemCount = 2;
        }
    }

    if (itemCount === 0) return { success: false, dc, items: [], critFail: false };

    const getGroup = (tier) => {
        if (["common_herb", "common_component", "liquid"].includes(tier)) return "C";
        if (["uncommon_herb", "uncommon_component"].includes(tier)) return "U";
        if (["monster_part", "rare_component"].includes(tier)) return "R";
        return "VR";
    };

    let biomePool = {};
    if (biomeKey === "all") {
        const allBiomes = getBiomeIngredients();
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
        const source = getBiomeIngredients()[biomeKey] ?? {};
        for (const [t, names] of Object.entries(source)) {
            biomePool[t] = [...names];
        }
    }

    const recipeIngredients = new Set();
    const recipeManager = window.ArtificerFoundry?.recipeManager;
    if (recipeManager?.recipes) {
        for (const recipe of recipeManager.recipes) {
            for (const ing of recipe.ingredients) {
                recipeIngredients.add(ing.name);
            }
        }
    }

    for (const ingName of recipeIngredients) {
        let exists = false;
        for (const names of Object.values(biomePool)) {
            if (names.some(n => n.toLowerCase() === ingName.toLowerCase())) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const tier = getItemTier(ingName);
            if (!biomePool[tier]) biomePool[tier] = [];
            biomePool[tier].push(ingName);
        }
    }

    const allIngredientsByTier = {};
    for (const bPool of Object.values(getBiomeIngredients())) {
        for (const [t, names] of Object.entries(bPool)) {
            if (!allIngredientsByTier[t]) allIngredientsByTier[t] = new Set();
            for (const name of names) allIngredientsByTier[t].add(name);
        }
    }

    const staticVeryRareIngredients = ["Phoenix Ash", "Shadow Essence", "Vampire Dust", "Paladin's Tear", "Celestial Feather", "Cloud Giant Heartstring", "Medusa Blood", "Storm Giant Blood"];
    if (!allIngredientsByTier["very_rare_component"]) allIngredientsByTier["very_rare_component"] = new Set();
    for (const name of staticVeryRareIngredients) allIngredientsByTier["very_rare_component"].add(name);

    const staticLegendaryIngredients = ["Lich Finger Bone", "Unicorn Horn", "Dragon Heart", "Dragon Scale", "Demon Horn Fragment"];
    if (!allIngredientsByTier["legendary_component"]) allIngredientsByTier["legendary_component"] = new Set();
    for (const name of staticLegendaryIngredients) allIngredientsByTier["legendary_component"].add(name);

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
 * Resolve foraging by a pre-computed DC (used by gathering panel).
 */
export function resolveForagingByDC(dc, biomeKey, rollTotal, timeAmount = 1, timeUnit = "hours", abundanceKey = "medium", rarityMod = 0, forcedItemCount = null) {
    const critFail = rollTotal === 1;
    const critSuccess = rollTotal === 20;
    const success = rollTotal >= dc || critSuccess;

    if (critFail) return { success: false, dc, items: [], critFail: true };

    const timeUnits = getTimeUnits();
    const hours = timeAmount * (timeUnits[timeUnit]?.hours ?? 1);

    let itemCount;
    if (forcedItemCount !== null && forcedItemCount !== undefined && forcedItemCount > 0) {
        itemCount = forcedItemCount;
    } else {
        const minutes = hours * 60;
        const rollData = getGatheringDice(minutes, abundanceKey);
        itemCount = rollFormula(rollData.formula);
    }

    if (success) {
        if (itemCount === 0) itemCount = 1;
        if (forcedItemCount === null || forcedItemCount === undefined) {
            if (critSuccess) {
                itemCount = Math.round(itemCount * 1.5);
                if (itemCount <= 1) itemCount = 2;
            }
        }
    }

    if (itemCount === 0) return { success: false, dc, items: [], critFail: false };

    const getGroup = (tier) => {
        if (["common_herb", "common_component", "liquid"].includes(tier)) return "C";
        if (["uncommon_herb", "uncommon_component"].includes(tier)) return "U";
        if (["monster_part", "rare_component"].includes(tier)) return "R";
        return "VR";
    };

    let biomePool = {};
    if (biomeKey === "all") {
        const allBiomes = getBiomeIngredients();
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
        const source = getBiomeIngredients()[biomeKey] ?? {};
        for (const [t, names] of Object.entries(source)) {
            biomePool[t] = [...names];
        }
    }

    const recipeIngredientsByDC = new Set();
    const recipeManagerByDC = window.ArtificerFoundry?.recipeManager;
    if (recipeManagerByDC?.recipes) {
        for (const recipe of recipeManagerByDC.recipes) {
            for (const ing of recipe.ingredients) {
                recipeIngredientsByDC.add(ing.name);
            }
        }
    }

    for (const ingName of recipeIngredientsByDC) {
        let exists = false;
        for (const names of Object.values(biomePool)) {
            if (names.some(n => n.toLowerCase() === ingName.toLowerCase())) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const tier = getItemTier(ingName);
            if (!biomePool[tier]) biomePool[tier] = [];
            biomePool[tier].push(ingName);
        }
    }

    const allIngredientsByTier = {};
    for (const bPool of Object.values(getBiomeIngredients())) {
        for (const [t, names] of Object.entries(bPool)) {
            if (!allIngredientsByTier[t]) allIngredientsByTier[t] = new Set();
            for (const name of names) allIngredientsByTier[t].add(name);
        }
    }

    const staticVeryRareIngredients = ["Phoenix Ash", "Shadow Essence", "Vampire Dust", "Paladin's Tear", "Celestial Feather", "Cloud Giant Heartstring", "Medusa Blood", "Storm Giant Blood"];
    if (!allIngredientsByTier["very_rare_component"]) allIngredientsByTier["very_rare_component"] = new Set();
    for (const name of staticVeryRareIngredients) allIngredientsByTier["very_rare_component"].add(name);

    const staticLegendaryIngredients = ["Lich Finger Bone", "Unicorn Horn", "Dragon Heart", "Dragon Scale", "Demon Horn Fragment"];
    if (!allIngredientsByTier["legendary_component"]) allIngredientsByTier["legendary_component"] = new Set();
    for (const name of staticLegendaryIngredients) allIngredientsByTier["legendary_component"].add(name);

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
export function getGatheringDice(minutes, abundanceKey = "medium") {
    const hours = minutes / 60;
    const effectiveHours = Math.pow(hours, 0.6);
    const numDice = Math.max(1, Math.round(effectiveHours * 2));
    
    const dieSizes = {
        barren: 4,
        scarce: 6,
        medium: 8,
        plentiful: 10,
        abundant: 12
    };
    const dieSize = dieSizes[abundanceKey] ?? 8;
    
    const formula = `${numDice}d${dieSize}`;
    const average = numDice * (dieSize + 1) / 2;
    return { formula, average };
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
