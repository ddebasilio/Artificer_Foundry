/**
 * Forge material metadata for the Artificer Foundry module.
 * Icons, type labels, costs, and crafting times for the forge system.
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPE LABELS — Human-readable names for forge material type codes
// ─────────────────────────────────────────────────────────────────────────────
export const FORGE_TYPE_LABELS = {
    metal:               "Metal",
    rare_metal:          "Rare metal",
    very_rare_metal:     "Very rare metal",
    crafting_supply:     "Crafting supply",
    essence:             "Arcane essence",
    rare_essence:        "Rare essence",
    very_rare_essence:   "Very rare essence",
    legendary_essence:   "Legendary essence",
    gem:                 "Gemstone",
    rare_gem:            "Rare gemstone",
    legendary_gem:       "Legendary gemstone",
    monster_part:        "Monster part",
    rare_monster_part:   "Rare monster part",
    very_rare_component: "Very rare component",
    legendary_component: "Legendary component",
};

// ─────────────────────────────────────────────────────────────────────────────
// PER-MATERIAL ICONS
// ─────────────────────────────────────────────────────────────────────────────
export const FORGE_MATERIAL_ICONS = {
    // Metals
    "Iron Ingot":            "icons/commodities/metal/ingot-iron-grey.webp",
    "Steel Ingot":           "icons/commodities/metal/ingot-steel-grey.webp",
    "Gold Ingot":            "icons/commodities/metal/ingot-gold-yellow.webp",
    "Silver Dust":           "icons/commodities/materials/powder-grey.webp",
    "Mithral Ore":           "icons/commodities/metal/ore-chunk-silver-blue.webp",
    "Adamantine Shard":      "icons/commodities/metal/fragments-steel-grey.webp",
    "Star Metal Fragment":   "icons/commodities/metal/ore-chunk-steel-red.webp",

    // Crafting supplies
    "Leather Strips":        "icons/commodities/leather/leather-worn-tan.webp",
    "Silk Thread":           "icons/commodities/cloth/cloth-bolt-white.webp",
    "Hardwood Plank":        "icons/commodities/wood/wood-plain-stack.webp",

    // Essences
    "Arcane Essence":        "icons/commodities/gems/gem-rough-cushion-teal.webp",
    "Storm Shard":           "icons/commodities/gems/gem-rough-cut-blue.webp",
    "Greater Arcane Essence":"icons/commodities/gems/gem-rough-cushion-purple.webp",
    "Elemental Core":        "icons/commodities/gems/gem-rough-oval-orange.webp",
    "Superior Arcane Essence":"icons/commodities/gems/gem-rough-cushion-red.webp",
    "Legendary Arcane Essence":"icons/commodities/gems/gem-faceted-radiant-red.webp",

    // Gems
    "Gemstone Chip":         "icons/commodities/gems/gem-rough-navette-white.webp",
    "Moonstone":             "icons/commodities/gems/gem-rough-oval-white.webp",
    "Ruby":                  "icons/commodities/gems/gem-rough-oval-red.webp",
    "Sapphire":              "icons/commodities/gems/gem-rough-oval-blue.webp",
    "Diamond":               "icons/commodities/gems/gem-faceted-diamond-white.webp",

    // Monster parts (shared with alchemy where applicable)
    "Ogre Knucklebone":      "icons/commodities/bones/bone-joint-tan.webp",
    "Fire Giant Heartstring": "icons/commodities/biological/organ-heart-red.webp",
    "Frost Giant Knuckle":   "icons/commodities/bones/bone-joint-tan.webp",
    "Displacer Beast Tentacle": "icons/creatures/tentacles/tentacles-octopus-black-pink.webp",
    "Pegasus Hair":          "icons/commodities/materials/hair-tuft-white.webp",
    "Dragon Scale":          "icons/commodities/biological/shell-ribbed-gold.webp",
    "Dragon Blood":          "icons/consumables/potions/vial-cork-red.webp",
    "Storm Giant Blood":     "icons/commodities/materials/liquid-blue.webp",
    "Unicorn Horn":          "icons/commodities/bones/horn-simple-white.webp",
    "Celestial Feather":     "icons/commodities/materials/feather-white.webp",
};

export const DEFAULT_FORGE_ICON = "icons/svg/item-bag.svg";

// Type-based fallback icons
export const FORGE_TYPE_ICONS = {
    metal:               "icons/commodities/metal/ingot-iron-grey.webp",
    rare_metal:          "icons/commodities/metal/ore-chunk-silver-blue.webp",
    very_rare_metal:     "icons/commodities/metal/ore-chunk-steel-red.webp",
    crafting_supply:     "icons/commodities/leather/leather-worn-tan.webp",
    essence:             "icons/commodities/gems/gem-rough-cushion-teal.webp",
    rare_essence:        "icons/commodities/gems/gem-rough-cushion-purple.webp",
    very_rare_essence:   "icons/commodities/gems/gem-rough-cushion-red.webp",
    legendary_essence:   "icons/commodities/gems/gem-faceted-radiant-red.webp",
    gem:                 "icons/commodities/gems/gem-rough-navette-white.webp",
    rare_gem:            "icons/commodities/gems/gem-rough-oval-red.webp",
    legendary_gem:       "icons/commodities/gems/gem-faceted-diamond-white.webp",
    monster_part:        "icons/commodities/bones/bone-jaw-teeth-white-grey.webp",
    rare_monster_part:   "icons/commodities/biological/organ-heart-red.webp",
    very_rare_component: "icons/commodities/gems/gem-rough-cushion-purple.webp",
    legendary_component: "icons/commodities/gems/gem-rough-cushion-red.webp",
};

export function getForgeMaterialIcon(name, type) {
    if (FORGE_MATERIAL_ICONS[name]) return FORGE_MATERIAL_ICONS[name];
    return FORGE_TYPE_ICONS[type] ?? DEFAULT_FORGE_ICON;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGE CRAFTING TIMES (same scale as Xanathar's)
// ─────────────────────────────────────────────────────────────────────────────
export const FORGE_CRAFTING_TIMES = {
    common:    { days: 1,  cost: 50 },
    uncommon:  { days: 5,  cost: 200 },
    rare:      { days: 10, cost: 2000 },
    very_rare: { days: 25, cost: 20000 },
    legendary: { days: 50, cost: 100000 },
};

export function getForgeCraftingTime(rarity, isSmith = false) {
    const base = FORGE_CRAFTING_TIMES[rarity] ?? FORGE_CRAFTING_TIMES.common;
    const days = isSmith ? Math.max(1, Math.ceil(base.days / 2)) : base.days;
    return { days, cost: base.cost };
}

export function formatForgeCraftingTime(days) {
    if (days === 1) return "1 day";
    if (days < 7) return `${days} days`;
    const weeks = Math.floor(days / 7);
    const remainder = days % 7;
    if (remainder === 0) return weeks === 1 ? "1 workweek" : `${weeks} workweeks`;
    return `${weeks}w ${remainder}d`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FORGE MATERIAL COSTS (GP)
// ─────────────────────────────────────────────────────────────────────────────
export const FORGE_MATERIAL_COSTS = {
    // Metals
    "Iron Ingot": 5, "Steel Ingot": 15, "Gold Ingot": 50, "Silver Dust": 10,
    "Mithral Ore": 200, "Adamantine Shard": 300,
    "Star Metal Fragment": 2000,
    // Crafting supplies
    "Leather Strips": 2, "Silk Thread": 5, "Hardwood Plank": 3,
    // Essences
    "Arcane Essence": 50, "Storm Shard": 75,
    "Greater Arcane Essence": 500, "Elemental Core": 400,
    "Superior Arcane Essence": 2000,
    "Legendary Arcane Essence": 10000,
    // Gems
    "Gemstone Chip": 25, "Moonstone": 100,
    "Ruby": 500, "Sapphire": 500,
    "Diamond": 5000,
    // Monster parts (shared costs)
    "Ogre Knucklebone": 20,
    "Fire Giant Heartstring": 200, "Frost Giant Knuckle": 150,
    "Displacer Beast Tentacle": 200, "Pegasus Hair": 200,
    "Dragon Scale": 7000, "Dragon Blood": 8000,
    "Storm Giant Blood": 5000, "Unicorn Horn": 12000,
    "Celestial Feather": 1500,
};

// ─────────────────────────────────────────────────────────────────────────────
// FORGE MATERIAL SUBSTITUTION GROUPS
// ─────────────────────────────────────────────────────────────────────────────
export const FORGE_SUBSTITUTION_GROUPS = {
    basic_metals: {
        tier: "metal",
        maxRecipeRarity: "uncommon",
        members: ["Iron Ingot", "Steel Ingot"],
    },
    crafting_supplies: {
        tier: "crafting_supply",
        maxRecipeRarity: "uncommon",
        members: ["Leather Strips", "Silk Thread", "Hardwood Plank"],
    },
};

export function canForgeSubstitute(ingredientName, requiredName, recipeRarity) {
    if (ingredientName.toLowerCase() === requiredName.toLowerCase()) return true;

    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);

    for (const group of Object.values(FORGE_SUBSTITUTION_GROUPS)) {
        const maxIdx = rarityOrder.indexOf(group.maxRecipeRarity);
        if (recipeIdx > maxIdx) continue;

        const hasRequired = group.members.some(m => m.toLowerCase() === requiredName.toLowerCase());
        const hasIngredient = group.members.some(m => m.toLowerCase() === ingredientName.toLowerCase());
        if (hasRequired && hasIngredient) return true;
    }
    return false;
}

export function getForgeSubstitutes(ingredientName, recipeRarity) {
    const rarityOrder = ["common", "uncommon", "rare", "very_rare", "legendary"];
    const recipeIdx = rarityOrder.indexOf(recipeRarity);
    const results = [];

    for (const group of Object.values(FORGE_SUBSTITUTION_GROUPS)) {
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
