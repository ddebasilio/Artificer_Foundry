/**
 * Forge material metadata for the Artificer Foundry module.
 * Loaded from data/forge-materials.json at runtime.
 */

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

export function getForgeCraftingTime(rarity, isSmith = false) {
    const times = getForgeCraftingTimes();
    const base = times[rarity] ?? times.common ?? { days: 1, cost: 50 };
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
 * Add a forge material item to an actor's inventory.
 */
export async function addForgeMaterialToActor(actor, name, type, qty = 1) {
    const icon = getForgeMaterialIcon(name, type);
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
