/**
 * Ingredient metadata for the Artificer Foundry module.
 * Per-ingredient icons, type display labels, biome data, substitution groups, and foraging config.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPE LABELS — Human-readable names for ingredient type codes
// ─────────────────────────────────────────────────────────────────────────────
export const TYPE_LABELS = {
    common_herb:          "Common herb",
    uncommon_herb:        "Uncommon herb",
    liquid:               "Liquid",
    common_component:     "Common component",
    uncommon_component:   "Uncommon component",
    rare_component:       "Rare component",
    monster_part:         "Monster part",
    rare_monster_part:    "Rare monster part",
    very_rare_component:  "Very rare component",
    legendary_component:  "Legendary component",
};

// ─────────────────────────────────────────────────────────────────────────────
// PER-INGREDIENT ICONS — Unique icon for each named ingredient
// ─────────────────────────────────────────────────────────────────────────────
export const INGREDIENT_ICONS = {
    // Common herbs
    "Bloodgrass":             "icons/consumables/plants/flax-leaves-spiked-bundle-orange.webp",
    "Silverleaf":             "icons/commodities/flowers/lily-grey-orange.webp",
    "Toadstool":              "icons/consumables/mushrooms/campanulate-bell-shiny-bumpy-red.webp",
    "Spidergrass":            "icons/creatures/invertebrates/spider-skull-green.webp",
    "Catnip":                 "icons/commodities/materials/powder-black.webp",

    // Uncommon herbs
    "Mandrake Root":          "icons/consumables/vegetable/root-potato-radish-white.webp",
    "Sea Kelp":               "icons/consumables/plants/kelp-fern-glowing-green.webp",
    "Firebloom":              "icons/commodities/flowers/flower-grey-orange.webp",
    "Giant's Ear Mushroom":   "icons/consumables/mushrooms/umbontae-green.webp",
    "Quicksilver Herb":       "icons/consumables/plants/fern-stem-curved-green.webp",
    "Dreamfern":              "icons/consumables/plants/fern-leaf-bundle-green.webp",
    "Skybloom Petal":         "icons/commodities/flowers/cornflower-blue.webp",
    "Moonpetal Flower":       "icons/commodities/flowers/lotus-purple.webp",

    // Liquids
    "Pure Water":             "icons/consumables/potions/bottle-corked-blue.webp",
    "Naphtha Oil":            "icons/consumables/potions/bottle-round-corked-orange.webp",

    // Common components
    "Charcoal Powder":        "icons/commodities/materials/powder-black.webp",
    "Pine Resin":             "icons/commodities/materials/liquid-orange.webp",
    "Sulphur":                "icons/commodities/materials/bowl-powder-yellow.webp",
    "Rendered Fat":           "icons/commodities/materials/bowl-liquid-white.webp",
    "Powdered Charcoal":      "icons/commodities/materials/powder-grey.webp",

    // Uncommon components
    "Pixie Dust":             "icons/commodities/materials/powder-teal.webp",
    "Magmin Ash":             "icons/commodities/materials/bowl-powder-gold.webp",

    // Monster parts
    "Wolf Fang":              "icons/commodities/bones/tooth-canine-white.webp",
    "Merfolk Scale":          "icons/commodities/biological/shell-ribbed-grey.webp",
    "Rabbit Foot":            "icons/commodities/bones/bone-foot-bird-brown.webp",
    "Salamander Scale":       "icons/commodities/biological/shell-ribbed-gold.webp",
    "Giant Toenail":          "icons/commodities/claws/claw-worn-tan.webp",
    "Goblin Teeth":           "icons/commodities/bones/bone-jaw-teeth-white-grey.webp",
    "Troll Blood":            "icons/consumables/potions/vial-cork-green.webp",

    // Rare components
    "Ethereal Dust":          "icons/commodities/materials/bowl-powder-blue.webp",

    // Rare monster parts
    "Basilisk Eye":           "icons/creatures/eyes/lizard-single-slit-green.webp",
    "Harpy Feather":          "icons/commodities/materials/feather-blue-grey.webp",
    "Griffon Feather":        "icons/commodities/materials/feather-white.webp",
    "Pegasus Hair":           "icons/commodities/materials/hair-tuft-white.webp",
    "Mindflayer Tentacle":    "icons/creatures/tentacles/tentacles-octopus-black-pink.webp",
    "Stone Giant Knuckle":    "icons/commodities/bones/bone-joint-tan.webp",
    "Gargoyle Dust":          "icons/commodities/materials/powder-grey.webp",
    "Beholder Eyestalk":      "icons/creatures/eyes/slime-stalk-green.webp",
    "Manticore Spine":        "icons/commodities/bones/bone-spine-grey.webp",
    "Frost Giant Knuckle":    "icons/commodities/bones/bone-joint-tan.webp",
    "Fire Giant Heartstring": "icons/commodities/biological/organ-heart-red.webp",
    "Will-o-Wisp Essence":    "icons/commodities/materials/liquid-green.webp",
    "Displacer Beast Tentacle": "icons/creatures/tentacles/tentacles-octopus-black-pink.webp",
    "Wyvern Poison Gland":    "icons/commodities/materials/slime-green.webp",
    "Aboleth Slime":          "icons/commodities/materials/slime-green.webp",
    "Storm Eagle Talon":      "icons/commodities/claws/talon-blue.webp",

    // Very rare components
    "Unicorn Horn Shaving":   "icons/commodities/bones/horn-simple-white.webp",
    "Phoenix Ash":            "icons/commodities/materials/bowl-powder-gold.webp",
    "Shadow Essence":         "icons/commodities/materials/liquid-purple.webp",
    "Vampire Dust":           "icons/commodities/materials/powder-grey.webp",
    "Paladin's Tear":         "icons/commodities/gems/gem-teardrop-blue.webp",
    "Celestial Feather":      "icons/commodities/materials/feather-white.webp",
    "Cloud Giant Heartstring": "icons/commodities/materials/liquid-blue.webp",
    "Lightning-Struck Wood":  "icons/commodities/wood/wood-carved-runes.webp",
    "Medusa Blood":           "icons/commodities/materials/liquid-purple.webp",

    // Legendary components
    "Storm Giant Blood":      "icons/commodities/materials/liquid-blue.webp",
    "Dragon Blood":           "icons/consumables/potions/vial-cork-red.webp",
    "Lich Finger Bone":       "icons/commodities/bones/bones-hand-grey.webp",
    "Unicorn Horn":           "icons/commodities/bones/horn-simple-white.webp",
    "Dragon Scale":           "icons/commodities/biological/shell-ribbed-gold.webp",
    "Demon Horn Fragment":    "icons/commodities/bones/bone-broken-brown.webp",
};

// Fallback icon when a specific ingredient icon isn't defined
export const DEFAULT_INGREDIENT_ICON = "icons/svg/item-bag.svg";

/**
 * Get the icon for an ingredient by name, with fallback to type-based icon.
 */
export function getIngredientIcon(name, type) {
    if (INGREDIENT_ICONS[name]) return INGREDIENT_ICONS[name];
    return TYPE_ICONS[type] ?? DEFAULT_INGREDIENT_ICON;
}

// Type-based fallback icons (used when per-ingredient icon not found)
export const TYPE_ICONS = {
    common_herb:          "icons/consumables/plants/herb-tied-bundle-green.webp",
    uncommon_herb:        "icons/consumables/plants/leaf-elm-glowing-green.webp",
    liquid:               "icons/consumables/potions/bottle-corked-empty.webp",
    common_component:     "icons/commodities/materials/plant-sprout-seed-green.webp",
    uncommon_component:   "icons/commodities/materials/powder-teal.webp",
    rare_component:       "icons/commodities/gems/gem-rough-cushion-teal.webp",
    monster_part:         "icons/commodities/bones/bone-jaw-teeth-white-grey.webp",
    rare_monster_part:    "icons/commodities/biological/organ-heart-red.webp",
    very_rare_component:  "icons/commodities/gems/gem-rough-cushion-purple.webp",
    legendary_component:  "icons/commodities/gems/gem-rough-cushion-red.webp",
};

// ─────────────────────────────────────────────────────────────────────────────
// INGREDIENT SUBSTITUTION GROUPS
// Ingredients within the same group are interchangeable for common/uncommon recipes
// ─────────────────────────────────────────────────────────────────────────────
export const SUBSTITUTION_GROUPS = {
    common_herbs: {
        tier: "common_herb",
        maxRecipeRarity: "uncommon", // Only substitutable in common & uncommon recipes
        members: ["Bloodgrass", "Silverleaf", "Toadstool", "Spidergrass", "Catnip"],
    },
    uncommon_herbs: {
        tier: "uncommon_herb",
        maxRecipeRarity: "uncommon",
        members: ["Mandrake Root", "Sea Kelp", "Firebloom", "Giant's Ear Mushroom", "Quicksilver Herb", "Dreamfern", "Skybloom Petal", "Moonpetal Flower"],
    },
    common_components: {
        tier: "common_component",
        maxRecipeRarity: "uncommon",
        members: ["Charcoal Powder", "Pine Resin", "Sulphur", "Rendered Fat", "Powdered Charcoal"],
    },
    liquids: {
        tier: "liquid",
        maxRecipeRarity: "uncommon",
        members: ["Pure Water", "Naphtha Oil"],
    },
    monster_parts: {
        tier: "monster_part",
        maxRecipeRarity: "uncommon",
        members: ["Wolf Fang", "Merfolk Scale", "Rabbit Foot", "Salamander Scale", "Giant Toenail", "Goblin Teeth", "Troll Blood"],
    },
};

/**
 * Check if ingredientName can substitute for requiredName in a recipe of given rarity.
 */
export function canSubstitute(ingredientName, requiredName, recipeRarity) {
    if (ingredientName.toLowerCase() === requiredName.toLowerCase()) return true;

    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);

    for (const group of Object.values(SUBSTITUTION_GROUPS)) {
        const maxIdx = rarityOrder.indexOf(group.maxRecipeRarity);
        if (recipeIdx > maxIdx) continue; // Recipe too rare for substitution

        const hasRequired = group.members.some(m => m.toLowerCase() === requiredName.toLowerCase());
        const hasIngredient = group.members.some(m => m.toLowerCase() === ingredientName.toLowerCase());
        if (hasRequired && hasIngredient) return true;
    }
    return false;
}

/**
 * Get substitution group members for an ingredient (excluding itself).
 */
export function getSubstitutes(ingredientName, recipeRarity) {
    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);
    const results = [];

    for (const group of Object.values(SUBSTITUTION_GROUPS)) {
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

// ─────────────────────────────────────────────────────────────────────────────
// XANATHAR'S CRAFTING TIMES (per rarity)
// days = workdays needed, cost = gp material cost
// ─────────────────────────────────────────────────────────────────────────────
export const CRAFTING_TIMES = {
    common:    { days: 1,  cost: 25 },
    uncommon:  { days: 3,  cost: 100 },
    rare:      { days: 7,  cost: 1000 },   // 1 workweek
    very_rare: { days: 14, cost: 10000 },  // 2 workweeks
    legendary: { days: 28, cost: 50000 },  // 4 workweeks
};

/**
 * Get crafting time for a recipe, accounting for Artificer Alchemist halving.
 */
export function getCraftingTime(rarity, isAlchemist = false) {
    const base = CRAFTING_TIMES[rarity] ?? CRAFTING_TIMES.common;
    const days = isAlchemist ? Math.max(1, Math.ceil(base.days / 2)) : base.days;
    return { days, cost: base.cost };
}

/**
 * Format crafting days into a human-readable string.
 */
export function formatCraftingTime(days) {
    if (days === 1) return "1 day";
    if (days < 7) return `${days} days`;
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    if (remainder === 0) return weeks === 1 ? "1 workweek" : `${weeks} workweeks`;
    return `${weeks}w ${remainder}d`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BIOME / FORAGING DATA
// ─────────────────────────────────────────────────────────────────────────────

export const BIOMES = {
    forest:    { name: "Forest",    baseDC: 8,  icon: "fas fa-tree" },
    swamp:     { name: "Swamp",     baseDC: 10, icon: "fas fa-water" },
    mountain:  { name: "Mountain",  baseDC: 12, icon: "fas fa-mountain" },
    coast:     { name: "Coast",     baseDC: 9,  icon: "fas fa-umbrella-beach" },
    desert:    { name: "Desert",    baseDC: 16, icon: "fas fa-sun" },
    arctic:    { name: "Arctic",    baseDC: 15, icon: "fas fa-snowflake" },
    underdark: { name: "Underdark",  baseDC: 14, icon: "fas fa-dungeon" },
    plains:    { name: "Plains",    baseDC: 10, icon: "fas fa-wind" },
    urban:     { name: "Urban",     baseDC: 13, icon: "fas fa-city" },
};

export const ABUNDANCE_MODIFIERS = {
    plentiful: { name: "Plentiful", dcMod: -4, qtyMul: 2.0 },
    medium:    { name: "Medium",    dcMod: 0,  qtyMul: 1.0 },
    scarce:    { name: "Scarce",    dcMod: +4, qtyMul: 0.5 },
    barren:    { name: "Barren",    dcMod: +8, qtyMul: 0.25 },
};

export const TIME_UNITS = {
    seconds: { name: "Seconds", hours: 1 / 3600 },
    minutes: { name: "Minutes", hours: 1 / 60 },
    hours:   { name: "Hours",   hours: 1 },
    days:    { name: "Days",    hours: 8 }, // Assuming 8 hours of foraging per day
};

// Which ingredients are commonly found in each biome (weighted by rarity tier)
export const BIOME_INGREDIENTS = {
    forest: {
        common_herb:    ["Bloodgrass", "Silverleaf", "Catnip", "Spidergrass"],
        uncommon_herb:  ["Mandrake Root", "Dreamfern", "Moonpetal Flower"],
        common_component: ["Pine Resin", "Charcoal Powder"],
        uncommon_component: ["Pixie Dust"],
        monster_part:   ["Wolf Fang", "Rabbit Foot"],
        rare_monster_part: ["Basilisk Eye"],
        liquid:         ["Pure Water"],
    },
    swamp: {
        common_herb:    ["Toadstool", "Bloodgrass", "Spidergrass"],
        uncommon_herb:  ["Mandrake Root", "Giant's Ear Mushroom", "Sea Kelp"],
        common_component: ["Rendered Fat", "Charcoal Powder"],
        uncommon_component: ["Magmin Ash"],
        monster_part:   ["Troll Blood", "Goblin Teeth"],
        rare_monster_part: ["Aboleth Slime"],
        liquid:         ["Pure Water", "Naphtha Oil"],
    },
    mountain: {
        common_herb:    ["Silverleaf", "Spidergrass"],
        uncommon_herb:  ["Quicksilver Herb", "Skybloom Petal"],
        common_component: ["Sulphur", "Pine Resin"],
        uncommon_component: ["Magmin Ash"],
        monster_part:   ["Giant Toenail", "Wolf Fang"],
        rare_monster_part: ["Griffon Feather", "Harpy Feather", "Manticore Spine"],
        liquid:         ["Pure Water"],
    },
    coast: {
        common_herb:    ["Bloodgrass", "Catnip", "Silverleaf"],
        uncommon_herb:  ["Sea Kelp", "Moonpetal Flower"],
        common_component: ["Rendered Fat"],
        uncommon_component: ["Pixie Dust"],
        monster_part:   ["Merfolk Scale", "Salamander Scale"],
        rare_monster_part: ["Storm Eagle Talon"],
        liquid:         ["Pure Water"],
    },
    desert: {
        common_herb:    ["Toadstool", "Catnip"],
        uncommon_herb:  ["Firebloom"],
        common_component: ["Sulphur", "Charcoal Powder"],
        uncommon_component: ["Magmin Ash"],
        monster_part:   ["Salamander Scale", "Goblin Teeth"],
        rare_monster_part: ["Manticore Spine"],
        liquid:         ["Naphtha Oil"],
    },
    arctic: {
        common_herb:    ["Silverleaf", "Bloodgrass"],
        uncommon_herb:  ["Quicksilver Herb", "Moonpetal Flower"],
        common_component: ["Charcoal Powder", "Rendered Fat"],
        uncommon_component: [],
        monster_part:   ["Wolf Fang", "Troll Blood"],
        rare_monster_part: ["Frost Giant Knuckle"],
        liquid:         ["Pure Water"],
    },
    underdark: {
        common_herb:    ["Toadstool", "Spidergrass"],
        uncommon_herb:  ["Dreamfern", "Giant's Ear Mushroom", "Mandrake Root"],
        common_component: ["Powdered Charcoal", "Sulphur"],
        uncommon_component: ["Magmin Ash"],
        monster_part:   ["Goblin Teeth", "Troll Blood"],
        rare_monster_part: ["Mindflayer Tentacle", "Beholder Eyestalk", "Displacer Beast Tentacle"],
        liquid:         ["Naphtha Oil"],
    },
    plains: {
        common_herb:    ["Bloodgrass", "Catnip", "Silverleaf", "Spidergrass"],
        uncommon_herb:  ["Mandrake Root", "Skybloom Petal"],
        common_component: ["Pine Resin", "Rendered Fat"],
        uncommon_component: ["Pixie Dust"],
        monster_part:   ["Rabbit Foot", "Wolf Fang"],
        rare_monster_part: ["Harpy Feather", "Pegasus Hair"],
        liquid:         ["Pure Water"],
    },
    urban: {
        common_herb:    ["Catnip", "Toadstool"],
        uncommon_herb:  ["Mandrake Root"],
        common_component: ["Charcoal Powder", "Sulphur", "Powdered Charcoal", "Rendered Fat"],
        uncommon_component: ["Magmin Ash"],
        monster_part:   ["Goblin Teeth", "Rabbit Foot"],
        rare_monster_part: [],
        liquid:         ["Pure Water", "Naphtha Oil"],
    },
};

// Probability weights for finding each tier during foraging
export const RARITY_WEIGHTS = {
    common_herb:        40,
    uncommon_herb:      20,
    common_component:   20,
    uncommon_component: 8,
    monster_part:       8,
    rare_monster_part:  3,
    liquid:             10,
    rare_component:     1,
    very_rare_component: 0, // Not forageable — must be quest/loot
    legendary_component: 0,
};

// Ingredient base costs in GP
export const INGREDIENT_COSTS = {
    // Common herbs: 1-5 gp
    "Bloodgrass": 2, "Silverleaf": 2, "Toadstool": 1, "Spidergrass": 3, "Catnip": 1,
    // Uncommon herbs: 10-25 gp
    "Mandrake Root": 15, "Sea Kelp": 10, "Firebloom": 20, "Giant's Ear Mushroom": 15,
    "Quicksilver Herb": 20, "Dreamfern": 15, "Skybloom Petal": 25, "Moonpetal Flower": 20,
    // Liquids: 1-5 gp
    "Pure Water": 1, "Naphtha Oil": 5,
    // Common components: 2-5 gp
    "Charcoal Powder": 2, "Pine Resin": 3, "Sulphur": 4, "Rendered Fat": 2, "Powdered Charcoal": 2,
    // Uncommon components: 15-30 gp
    "Pixie Dust": 25, "Magmin Ash": 20,
    // Monster parts: 10-30 gp
    "Wolf Fang": 10, "Merfolk Scale": 20, "Rabbit Foot": 10, "Salamander Scale": 25,
    "Giant Toenail": 15, "Goblin Teeth": 5, "Troll Blood": 30,
    // Rare components: 50-100 gp
    "Ethereal Dust": 80,
    // Rare monster parts: 100-300 gp
    "Basilisk Eye": 200, "Harpy Feather": 100, "Griffon Feather": 150, "Pegasus Hair": 200,
    "Mindflayer Tentacle": 300, "Stone Giant Knuckle": 150, "Gargoyle Dust": 100,
    "Beholder Eyestalk": 250, "Manticore Spine": 150, "Frost Giant Knuckle": 150,
    "Fire Giant Heartstring": 200, "Will-o-Wisp Essence": 180, "Displacer Beast Tentacle": 200,
    "Wyvern Poison Gland": 250, "Aboleth Slime": 200, "Storm Eagle Talon": 180,
    // Very rare components: 500-2000 gp
    "Unicorn Horn Shaving": 1000, "Phoenix Ash": 1500, "Shadow Essence": 800,
    "Vampire Dust": 600, "Paladin's Tear": 1200, "Celestial Feather": 1500,
    "Cloud Giant Heartstring": 2000, "Lightning-Struck Wood": 800, "Medusa Blood": 1000,
    // Legendary components: 5000+ gp
    "Storm Giant Blood": 5000, "Dragon Blood": 8000, "Lich Finger Bone": 10000,
    "Unicorn Horn": 12000, "Dragon Scale": 7000, "Demon Horn Fragment": 6000,
};

function calculateTimeModifiers(amount, unit) {
    const hours = amount * TIME_UNITS[unit].hours;
    let dcMod = 0;
    let maxItems = 0;

    if (hours <= 1 / 600) { // <= 6 seconds
        dcMod = +6;
        maxItems = 2;
    } else if (hours <= 1 / 60) { // <= 1 minute
        dcMod = +4;
        maxItems = 5;
    } else if (hours <= 10 / 60) { // <= 10 minutes
        dcMod = +2;
        maxItems = 8;
    } else if (hours <= 1) { // <= 1 hour
        dcMod = 0;
        maxItems = 10;
    } else { // > 1 hour
        const hourBlocks = Math.floor(hours);
        dcMod = -Math.min(4, Math.floor(hourBlocks / 2)); // Caps at -4 for 8+ hours
        maxItems = 5 + Math.floor((hours - 1) * 1); // 1 extra item per hour over 1, maxes based on total time
        // Just setting a reasonable cap
        if (hours >= 8) maxItems = 50;
        if (hours > 8) maxItems += Math.floor((hours - 8) / 2);
    }

    return { dcMod, maxItems, label: `${amount} ${TIME_UNITS[unit].name.toLowerCase()}` };
}


/**
 * Perform a foraging roll and return results.
 * @param {string} biomeKey - Key from BIOMES
 * @param {string} abundanceKey - Key from ABUNDANCE_MODIFIERS
 * @param {number} timeAmount - The numerical amount of time
 * @param {string} timeUnit - Key from TIME_UNITS
 * @param {number} rollResult - The d20 roll result
 * @returns {{ success: boolean, dc: number, items: Array<{name, type, qty}>, critFail: boolean }}
 */
export function resolveForaging(biomeKey, abundanceKey, timeAmount, timeUnit, rollResult) {
    const biome = BIOMES[biomeKey];
    const abundance = ABUNDANCE_MODIFIERS[abundanceKey];
    const timeModifiers = calculateTimeModifiers(timeAmount, timeUnit);

    if (!biome || !abundance || !timeUnit || isNaN(timeAmount)) return { success: false, dc: 20, items: [], critFail: false };

    const dc = Math.max(1, biome.baseDC + abundance.dcMod + timeModifiers.dcMod);
    const critFail = rollResult === 1;
    const critSuccess = rollResult === 20;

    if (critFail) {
        return { success: false, dc, items: [], critFail: true };
    }

    if (rollResult < dc && !critSuccess) {
        return { success: false, dc, items: [], critFail: false };
    }

    // Success — determine how many items
    const margin = rollResult - dc;
    let itemCount = Math.min(
        timeModifiers.maxItems,
        Math.max(1, Math.floor(1 + margin / 3))
    );
    itemCount = Math.ceil(itemCount * abundance.qtyMul);
    if (critSuccess) itemCount = Math.min(timeModifiers.maxItems, itemCount + 2);

    // Pick random ingredients from this biome
    const biomePool = BIOME_INGREDIENTS[biomeKey] ?? {};
    const items = [];

    // Build weighted pool
    const weightedPool = [];
    for (const [tier, names] of Object.entries(biomePool)) {
        const weight = RARITY_WEIGHTS[tier] ?? 0;
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
                // Stack with existing
                const existing = items.find(it => it.name === entry.name);
                if (existing) existing.qty++;
                else items.push({ name: entry.name, type: entry.type, qty: 1 });
                break;
            }
        }
    }

    return { success: true, dc, items, critFail: false };
}
