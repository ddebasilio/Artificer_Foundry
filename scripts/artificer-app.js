const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import {
    getIngredientIcon, getTypeLabels, getIngredientCosts, getSubstitutes,
    getCraftingTime, formatCraftingTime, getBiomeIngredients, addIngredientToActor,
    getIngredientIcons, getArtificerBag
} from "./ingredient-data.js";
import {
    getForgeMaterialIcon, getForgeTypeLabels, getForgeMaterialCosts, getForgeSubstitutes,
    getForgeCraftingTime, formatForgeCraftingTime, canForgeSubstitute, addForgeMaterialToActor, getBiomeMaterials,
    getForgeMaterialIcons
} from "./forge-data.js";
import { PlutoniumHelper } from "./plutonium-helper.js";

const FORGE_VARIANTS = {
    "Armor +1": [
        "Padded Armor +1",
        "Leather Armor +1",
        "Studded Leather Armor +1",
        "Hide Armor +1",
        "Chain Shirt +1",
        "Scale Mail +1",
        "Breastplate +1",
        "Half Plate +1",
        "Ring Mail +1",
        "Chain Mail +1",
        "Splint Armor +1",
        "Plate Armor +1"
    ],
    "Armor +2": [
        "Padded Armor +2",
        "Leather Armor +2",
        "Studded Leather Armor +2",
        "Hide Armor +2",
        "Chain Shirt +2",
        "Scale Mail +2",
        "Breastplate +2",
        "Half Plate +2",
        "Ring Mail +2",
        "Chain Mail +2",
        "Splint Armor +2",
        "Plate Armor +2"
    ],
    "Armor +3": [
        "Padded Armor +3",
        "Leather Armor +3",
        "Studded Leather Armor +3",
        "Hide Armor +3",
        "Chain Shirt +3",
        "Scale Mail +3",
        "Breastplate +3",
        "Half Plate +3",
        "Ring Mail +3",
        "Chain Mail +3",
        "Splint Armor +3",
        "Plate Armor +3"
    ],
    "Weapon +1": [
        "Dagger +1",
        "Handaxe +1",
        "Javelin +1",
        "Light Hammer +1",
        "Mace +1",
        "Quarterstaff +1",
        "Sickle +1",
        "Spear +1",
        "Light Crossbow +1",
        "Dart +1",
        "Shortbow +1",
        "Sling +1",
        "Battleaxe +1",
        "Flail +1",
        "Glaive +1",
        "Greataxe +1",
        "Greatsword +1",
        "Halberd +1",
        "Lance +1",
        "Longsword +1",
        "Maul +1",
        "Morningstar +1",
        "Pike +1",
        "Rapier +1",
        "Scimitar +1",
        "Shortsword +1",
        "Trident +1",
        "War Pick +1",
        "Warhammer +1",
        "Whip +1",
        "Blowgun +1",
        "Hand Crossbow +1",
        "Heavy Crossbow +1",
        "Longbow +1"
    ],
    "Weapon +2": [
        "Dagger +2",
        "Handaxe +2",
        "Javelin +2",
        "Light Hammer +2",
        "Mace +2",
        "Quarterstaff +2",
        "Sickle +2",
        "Spear +2",
        "Light Crossbow +2",
        "Dart +2",
        "Shortbow +2",
        "Sling +2",
        "Battleaxe +2",
        "Flail +2",
        "Glaive +2",
        "Greataxe +2",
        "Greatsword +2",
        "Halberd +2",
        "Lance +2",
        "Longsword +2",
        "Maul +2",
        "Morningstar +2",
        "Pike +2",
        "Rapier +2",
        "Scimitar +2",
        "Shortsword +2",
        "Trident +2",
        "War Pick +2",
        "Warhammer +2",
        "Whip +2",
        "Blowgun +2",
        "Hand Crossbow +2",
        "Heavy Crossbow +2",
        "Longbow +2"
    ],
    "Weapon +3": [
        "Dagger +3",
        "Handaxe +3",
        "Javelin +3",
        "Light Hammer +3",
        "Mace +3",
        "Quarterstaff +3",
        "Sickle +3",
        "Spear +3",
        "Light Crossbow +3",
        "Dart +3",
        "Shortbow +3",
        "Sling +3",
        "Battleaxe +3",
        "Flail +3",
        "Glaive +3",
        "Greataxe +3",
        "Greatsword +3",
        "Halberd +3",
        "Lance +3",
        "Longsword +3",
        "Maul +3",
        "Morningstar +3",
        "Pike +3",
        "Rapier +3",
        "Scimitar +3",
        "Shortsword +3",
        "Trident +3",
        "War Pick +3",
        "Warhammer +3",
        "Whip +3",
        "Blowgun +3",
        "Hand Crossbow +3",
        "Heavy Crossbow +3",
        "Longbow +3"
    ]
};

function getItemTier(name) {
    if (!name) return "common";
    const nameLower = name.toLowerCase();

    // Loop through alchemy biomes
    const pBiomes = getBiomeIngredients() || {};
    for (const biomeData of Object.values(pBiomes)) {
        if (!biomeData || typeof biomeData !== "object") continue;
        for (const [tier, names] of Object.entries(biomeData)) {
            if (Array.isArray(names) && names.some(n => n.toLowerCase() === nameLower)) {
                return tier;
            }
        }
    }

    // Loop through forge biomes
    const fBiomes = getBiomeMaterials() || {};
    for (const biomeData of Object.values(fBiomes)) {
        if (!biomeData || typeof biomeData !== "object") continue;
        for (const [tier, names] of Object.entries(biomeData)) {
            if (Array.isArray(names) && names.some(n => n.toLowerCase() === nameLower)) {
                return tier;
            }
        }
    }

    return "common";
}

function getRarityFromTier(tier) {
    if (!tier) return "common";
    const t = tier.toLowerCase();
    if (t.includes("legendary")) return "legendary";
    if (t.includes("very_rare") || t.includes("very-rare") || t.includes("planar")) return "very_rare";
    if (t.includes("rare") || t.includes("divine") || t.includes("elemental")) return "rare";
    if (t.includes("uncommon") || t.includes("essence") || t.includes("gem") || t.includes("monster_part") || t.includes("arcane")) return "uncommon";
    return "common";
}

export class ArtificerApp extends HandlebarsApplicationMixin(ApplicationV2) {
    static _recipeImageCache = {};
    static _compendiumImagesPreloaded = false;

    static async _preloadCompendiumImages() {
        if (this._compendiumImagesPreloaded) return;
        this._compendiumImagesPreloaded = true;
        this._recipeImageCache = {};

        // 1. Preload standard dnd5e items compendium
        const dnd5eItems = game.packs.get("dnd5e.items");
        if (dnd5eItems) {
            try {
                const idx = await dnd5eItems.getIndex({ fields: ["img"] });
                for (const entry of idx) {
                    this._recipeImageCache[entry.name.toLowerCase()] = entry.img;
                }
            } catch (e) {
                console.warn("Artificer Foundry | Failed to load dnd5e.items index", e);
            }
        }

        // 2. Preload other item compendiums
        for (const pack of game.packs) {
            if (pack.documentName !== "Item" || pack.metadata.id === "dnd5e.items") continue;
            try {
                const idx = await pack.getIndex({ fields: ["img"] });
                for (const entry of idx) {
                    const key = entry.name.toLowerCase();
                    if (!this._recipeImageCache[key] && entry.img) {
                        this._recipeImageCache[key] = entry.img;
                    }
                }
            } catch {}
        }
    }

    static async _resolvePlutoniumImage(name) {
        const cacheKey = name.toLowerCase();
        if (this._recipeImageCache[cacheKey]) return this._recipeImageCache[cacheKey];

        if (PlutoniumHelper.isAvailable()) {
            try {
                const allItems = await DataLoader.pCacheAndGetAllSite("item");
                const ent = allItems.find(it => it.name.toLowerCase() === cacheKey);
                if (ent) {
                    const nameUrl = encodeURIComponent(ent.name);
                    const imgUrl = `https://raw.githubusercontent.com/5etools-mirror-2/5etools-img/main/items/${nameUrl}.png`;
                    this._recipeImageCache[cacheKey] = imgUrl;
                    return imgUrl;
                }
            } catch {}
        }
        return null;
    }

    constructor(actor = null, options = {}) {
        super(options);
        this.actor = actor;

        // Active recipe selection states
        this.selectedRecipeId = null;
        this.selectedRecipeType = null; // "alchemy" or "forge"
        this.providedIngredients = {};
        this._crafting = false;

        // Tabs & Navigation
        this.activeRecipeTab = "alchemy"; // "alchemy" or "forge"
        this.collapsedAlchemyCategories = new Set();
        this.collapsedForgeCategories = new Set();

        // Search text inputs
        this.recipeSearchQuery = "";
        this.recipeRarityFilter = "all";
        this.recipeCraftableFilter = false;
        this.recipeShowKnown = true;
        this.recipeShowUnknown = true;
        this.craftQuantity = 1;
        this.inventoryRecipeFilter = false;
        this.catalogSearchQuery = "";
        this.inventorySearchQuery = "";
        this.catalogFilterType = "all";
        this.showCatalog = false;
        this.catalogRarityFilter = "all";
        this._draggedIngredient = null;
        this._duplicatesMerged = false;
    }

    async renderInline(targetElement) {
        this.targetElement = targetElement;

        // Save scroll positions before rendering to prevent layout jumpiness
        const scrollPositions = {};
        const selectors = [
            ".catalog-list-container",
            ".inventory-grid-container",
            ".recipe-list-container",
            ".artificer-panels-layout"
        ];
        for (const selector of selectors) {
            const el = targetElement.querySelector(selector);
            if (el) {
                scrollPositions[selector] = el.scrollTop;
            }
        }

        const context = await this._prepareContext();
        const renderFn = foundry.applications?.handlebars?.renderTemplate || renderTemplate;
        const html = await renderFn("modules/artificer-foundry/templates/artificer-app.hbs", context);
        targetElement.innerHTML = html;

        // Restore scroll positions after rendering is complete
        for (const selector of selectors) {
            const el = targetElement.querySelector(selector);
            if (el && scrollPositions[selector] !== undefined) {
                el.scrollTop = scrollPositions[selector];
            }
        }

        this._onRender(context);
    }

    async render(force = false, options = {}) {
        if (this.targetElement && this.targetElement.isConnected) {
            await this.renderInline(this.targetElement);
            return this;
        }
        return super.render(force, options);
    }

    static DEFAULT_OPTIONS = {
        window: { title: "", icon: "fas fa-cogs", resizable: true },
        classes: ["artificer-foundry", "artificer-app"],
        position: { width: 1200, height: 820 },
    };

    static PARTS = {
        lab: { template: "modules/artificer-foundry/templates/artificer-app.hbs" }
    };

    async _mergeActorDuplicates() {
        if (!this.actor || !this.actor.isOwner) return;

        // Find the Artificer's Component Bag if it exists (no auto-creation)
        const bag = getArtificerBag(this.actor);
        const bagId = bag?.id;

        const items = this.actor.items?.contents ?? [];
        const duplicates = {};

        const ingCosts = typeof getIngredientCosts === "function" ? getIngredientCosts() : {};
        const forgeCosts = typeof getForgeMaterialCosts === "function" ? getForgeMaterialCosts() : {};
        const allComponentNames = new Set([
            ...Object.keys(ingCosts).map(n => n.toLowerCase()),
            ...Object.keys(forgeCosts).map(n => n.toLowerCase())
        ]);

        for (const item of items) {
            if (!["loot", "consumable"].includes(item.type)) continue;
            // Don't treat the bag itself as a component to duplicate/stack
            if (item.name === "Artificer's Component Bag") continue;

            // Only consolidate/move items if they are valid crafting ingredients/materials
            if (!allComponentNames.has(item.name.toLowerCase())) continue;

            const key = `${item.name.toLowerCase()}_${item.type}`;
            if (!duplicates[key]) {
                duplicates[key] = [];
            }
            duplicates[key].push(item);
        }

        const updates = [];
        const deletes = [];

        for (const [key, list] of Object.entries(duplicates)) {
            const firstItem = list[0];
            const isLoot = firstItem.type === "loot";

            // Check if we need to update the price of this stack (if it has no price, set it)
            let updateNeeded = false;
            const updateData = { _id: firstItem.id };

            let currentPriceValue = firstItem.system?.price?.value ?? 0;
            if (isLoot && currentPriceValue === 0) {
                const name = firstItem.name;
                const standardPrice = ingCosts[name] || forgeCosts[name] || 0;
                if (standardPrice > 0) {
                    currentPriceValue = standardPrice;
                    updateData["system.price"] = { value: currentPriceValue, denomination: "gp" };
                    updateNeeded = true;
                }
            }

            // Move loot items into the Artificer bag
            if (isLoot && bagId && firstItem.system.container !== bagId) {
                updateData["system.container"] = bagId;
                updateNeeded = true;
            }

            if (list.length > 1) {
                // Keep the first item, sum all quantities, delete the rest
                let totalQty = 0;
                for (const item of list) {
                    totalQty += item.system.quantity ?? 1;
                }

                updateData["system.quantity"] = totalQty;
                updates.push(updateData);

                for (let i = 1; i < list.length; i++) {
                    deletes.push(list[i].id);
                }
            } else if (updateNeeded) {
                updates.push(updateData);
            }
        }

        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments("Item", updates);
        }
        if (deletes.length > 0) {
            await this.actor.deleteEmbeddedDocuments("Item", deletes);
        }
    }



    _isAlchemistAuto() {
        if (!this.actor) return false;
        const systemSubclass = this.actor.system?.details?.subclass;
        if (systemSubclass && typeof systemSubclass === "string" && systemSubclass.toLowerCase().includes("alchemist")) {
            return true;
        }
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && (name.includes("alchemist") || name.includes("alchemy"))) return true;
            if (type === "class" && name.includes("alchemist")) return true;
            if (type === "feat" && (name.includes("alchemist") || name.includes("alchemy"))) return true;
            if (name.includes("tool proficiency") && name.includes("alchemist")) return true;
            return false;
        });
    }

    _isArmorerAuto() {
        if (!this.actor) return false;
        const systemSubclass = this.actor.system?.details?.subclass;
        if (systemSubclass && typeof systemSubclass === "string" && systemSubclass.toLowerCase().includes("armorer")) {
            return true;
        }
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && name.includes("armorer")) return true;
            if (type === "class" && name.includes("armorer")) return true;
            if (type === "feat" && name.includes("armorer")) return true;
            return false;
        });
    }

    _isArtilleristAuto() {
        if (!this.actor) return false;
        const systemSubclass = this.actor.system?.details?.subclass;
        if (systemSubclass && typeof systemSubclass === "string" && systemSubclass.toLowerCase().includes("artillerist")) {
            return true;
        }
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && name.includes("artillerist")) return true;
            if (type === "class" && name.includes("artillerist")) return true;
            if (type === "feat" && name.includes("artillerist")) return true;
            return false;
        });
    }

    _isBattleSmithAuto() {
        if (!this.actor) return false;
        const systemSubclass = this.actor.system?.details?.subclass;
        if (systemSubclass && typeof systemSubclass === "string" && (systemSubclass.toLowerCase().includes("battlesmith") || systemSubclass.toLowerCase().includes("battle smith"))) {
            return true;
        }
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && (name.includes("battlesmith") || name.includes("battle smith"))) return true;
            if (type === "class" && (name.includes("battlesmith") || name.includes("battle smith"))) return true;
            if (type === "feat" && (name.includes("battlesmith") || name.includes("battle smith"))) return true;
            return false;
        });
    }

    _getAlchemySpeedMultiplier(recipe) {
        if (!this.actor) return 1.0;
        let mult = 1.0;

        // Forge of the Artificer: Alchemist potion crafting halves duration
        const alchemistPerk = this.actor.getFlag("artificer-foundry", "alchemistSubclass") ?? this._isAlchemistAuto();
        if (alchemistPerk) {
            mult *= 0.5;
        }

        return mult;
    }

    _getForgeSpeedMultiplier(recipe) {
        if (!this.actor) return 1.0;
        let mult = 1.0;

        if (recipe) {
            const category = (recipe.category || "").toLowerCase();
            const nameLower = (recipe.name || "").toLowerCase();

            // Forge of the Artificer: Armorer armor crafting halves duration
            const armorerPerk = this.actor.getFlag("artificer-foundry", "armorerSubclass") ?? this._isArmorerAuto();
            if (armorerPerk && category === "armor") {
                mult *= 0.5;
            }

            // Forge of the Artificer: Artillerist wand crafting halves duration
            const artilleristPerk = this.actor.getFlag("artificer-foundry", "artilleristSubclass") ?? this._isArtilleristAuto();
            if (artilleristPerk && (category === "wand" || nameLower.includes("wand"))) {
                mult *= 0.5;
            }

            // Forge of the Artificer: Battle Smith weapon/shield crafting halves duration
            const battleSmithPerk = this.actor.getFlag("artificer-foundry", "battleSmithSubclass") ?? this._isBattleSmithAuto();
            if (battleSmithPerk && (category === "weapon" || category === "shield")) {
                mult *= 0.5;
            }
        }

        return mult;
    }

    async _prepareContext(options) {
        if (!this._duplicatesMerged) {
            this._duplicatesMerged = true;
            this._mergeActorDuplicates().catch(err => {
                console.error("Artificer Foundry | Error merging duplicate actor items on load:", err);
            });
        }

        await ArtificerApp._preloadCompendiumImages();

        const isAlchemist = this._getAlchemySpeedMultiplier() < 1.0;
        const isSmith = this._getForgeSpeedMultiplier({ ingredients: [], category: "weapon" }) < 1.0;

        const allAlchemyRecipes = window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor) || [];
        const allForgeRecipes = window.ArtificerFoundry.forgeRecipeManager.getRecipesForActor(this.actor) || [];

        const matchNames = new Set();
        if (this.selectedRecipeId) {
            const isPotion = this.selectedRecipeType === "alchemy";
            const pool = isPotion ? allAlchemyRecipes : allForgeRecipes;
            const selected = pool.find(r => r.id === this.selectedRecipeId);
            if (selected) {
                for (const ing of selected.ingredients) {
                    matchNames.add(ing.name.toLowerCase());
                    const subs = isPotion ? getSubstitutes(ing.name, selected.rarity) : getForgeSubstitutes(ing.name, selected.rarity);
                    for (const s of subs) matchNames.add(s.toLowerCase());
                }
            }
        }

        // 1. Gather all loot/consumables in actor's inventory
        const actorInventory = {};
        let inventoryItems = [];
        if (this.actor) {
            for (const item of (this.actor.items?.contents ?? [])) {
                const nameLower = (item.name ?? "").toLowerCase();
                const qty = item.system?.quantity ?? 1;
                if (qty > 0) {
                    actorInventory[nameLower] = (actorInventory[nameLower] || 0) + qty;
                }
            }

            inventoryItems = (this.actor.items?.contents ?? [])
                .filter(item => item.type === "loot" && (item.system?.quantity ?? 1) > 0)
                .map(item => {
                    const tier = getItemTier(item.name);
                    const rarity = getRarityFromTier(tier);

                    // Extract price and weight
                    let priceVal = 0;
                    let denom = "gp";
                    if (item.system?.price) {
                        if (typeof item.system.price === "object") {
                            priceVal = item.system.price.value ?? 0;
                            denom = item.system.price.denomination ?? "gp";
                        } else if (typeof item.system.price === "number") {
                            priceVal = item.system.price;
                        }
                    }
                    let weightVal = 0;
                    let weightUnits = "lbs";
                    if (item.system?.weight) {
                        if (typeof item.system.weight === "object") {
                            weightVal = item.system.weight.value ?? 0;
                            weightUnits = item.system.weight.units ?? "lbs";
                        } else if (typeof item.system.weight === "number") {
                            weightVal = item.system.weight;
                        }
                    }

                    return {
                        id: item.id,
                        name: item.name,
                        img: item.img,
                        quantity: item.system?.quantity ?? 1,
                        uuid: item.uuid,
                        rarity,
                        price: `${priceVal} ${denom}`,
                        weight: `${weightVal} ${weightUnits}`
                    };
                });

            if (this.inventoryRecipeFilter && this.selectedRecipeId) {
                inventoryItems = inventoryItems.filter(item => matchNames.has(item.name.toLowerCase()));
            }

            if (this.inventorySearchQuery) {
                const query = this.inventorySearchQuery.toLowerCase();
                inventoryItems = inventoryItems.filter(item => (item.name ?? "").toLowerCase().includes(query));
            }
        }

        // 2. Fetch Selected Recipe details
        let selectedRecipe = null;
        let mappedIngredients = [];
        let workstationSlots = [];
        const query = this.recipeSearchQuery.toLowerCase();

        const checkAlchemyAvailable = (recipe) => {
            let availableTypes = 0;
            for (const ing of recipe.ingredients) {
                const direct = actorInventory[ing.name.toLowerCase()] || 0;
                let subs = 0;
                for (const sub of getSubstitutes(ing.name, recipe.rarity)) {
                    subs += actorInventory[sub.toLowerCase()] || 0;
                }
                if ((direct + subs) >= ing.quantity) availableTypes++;
            }
            return availableTypes === recipe.ingredients.length;
        };

        const checkForgeAvailable = (recipe) => {
            let availableTypes = 0;
            for (const ing of recipe.ingredients) {
                const direct = actorInventory[ing.name.toLowerCase()] || 0;
                let subs = 0;
                for (const sub of getForgeSubstitutes(ing.name, recipe.rarity)) {
                    subs += actorInventory[sub.toLowerCase()] || 0;
                }
                if ((direct + subs) >= ing.quantity) availableTypes++;
            }
            return availableTypes === recipe.ingredients.length;
        };

        // Alchemy Recipes (Potion list)
        const filteredAlchemy = allAlchemyRecipes.filter(r => {
            if (this.recipeRarityFilter !== "all" && r.rarity !== this.recipeRarityFilter) return false;
            if (this.recipeCraftableFilter && !checkAlchemyAvailable(r)) return false;
            if (!this.recipeShowKnown && r.isLearned) return false;
            if (!this.recipeShowUnknown && !r.isLearned) return false;
            if (this.activeRecipeTab === "alchemy" && query) {
                const nameMatch = r.name.toLowerCase().includes(query);
                const ingredientMatch = r.ingredients.some(ing => ing.name.toLowerCase().includes(query));
                const rarityMatch = r.rarity.toLowerCase().replace(/_/g, " ").includes(query);
                if (!nameMatch && !ingredientMatch && !rarityMatch) return false;
            }
            return true;
        }).map(r => {
            const isHealingPotion = /healing/i.test(r.name);
            const speedMult = this._getAlchemySpeedMultiplier();
            const ct = getCraftingTime(r.rarity, speedMult, isHealingPotion);

            // Check availability
            let availableTypes = 0;
            for (const ing of r.ingredients) {
                const direct = actorInventory[ing.name.toLowerCase()] || 0;
                let subs = 0;
                for (const sub of getSubstitutes(ing.name, r.rarity)) {
                    subs += actorInventory[sub.toLowerCase()] || 0;
                }
                if ((direct + subs) >= ing.quantity) availableTypes++;
            }
            return {
                ...r,
                craftingTimeLabel: formatCraftingTime(ct.days),
                craftingCost: ct.cost,
                allAvailable: availableTypes === r.ingredients.length,
                availabilityLabel: `${availableTypes}/${r.ingredients.length}`
            };
        });

        // Forge Blueprints List
        const filteredForge = allForgeRecipes.filter(r => {
            if (this.recipeRarityFilter !== "all" && r.rarity !== this.recipeRarityFilter) return false;
            if (this.recipeCraftableFilter && !checkForgeAvailable(r)) return false;
            if (!this.recipeShowKnown && r.isLearned) return false;
            if (!this.recipeShowUnknown && !r.isLearned) return false;
            if (this.activeRecipeTab === "forge" && query) {
                const nameMatch = r.name.toLowerCase().includes(query);
                const ingredientMatch = r.ingredients.some(ing => ing.name.toLowerCase().includes(query));
                const rarityMatch = r.rarity.toLowerCase().replace(/_/g, " ").includes(query);
                if (!nameMatch && !ingredientMatch && !rarityMatch) return false;
            }
            return true;
        }).map(r => {
            const speedMult = this._getForgeSpeedMultiplier(r);
            const ct = getForgeCraftingTime(r.rarity, speedMult);

            let availableTypes = 0;
            for (const ing of r.ingredients) {
                const direct = actorInventory[ing.name.toLowerCase()] || 0;
                let subs = 0;
                for (const sub of getForgeSubstitutes(ing.name, r.rarity)) {
                    subs += actorInventory[sub.toLowerCase()] || 0;
                }
                if ((direct + subs) >= ing.quantity) availableTypes++;
            }
            return {
                ...r,
                craftingTimeLabel: formatForgeCraftingTime(ct.days),
                craftingCost: ct.cost,
                allAvailable: availableTypes === r.ingredients.length,
                availabilityLabel: `${availableTypes}/${r.ingredients.length}`
            };
        });

        // Resolve images for recipes (lazy-loaded for unlearned/unselected items to boost sheet performance)
        for (const r of filteredAlchemy) {
            r.recipeType = "alchemy";
            const isSelected = this.selectedRecipeId === r.id;
            const isLearned = r.isLearned || r.learned;
            if (isLearned || isSelected) {
                if (!r.output.img || r.output.img === "icons/svg/item-bag.svg" || r.output.img === "icons/svg/mystery-man.svg") {
                    const cachedImg = ArtificerApp._recipeImageCache[r.name.toLowerCase()] || await ArtificerApp._resolvePlutoniumImage(r.name);
                    if (cachedImg) r.output.img = cachedImg;
                    else r.output.img = "icons/consumables/potions/bottle-corked-empty-blue.webp";
                }
            } else {
                if (!r.output.img || r.output.img === "icons/svg/item-bag.svg" || r.output.img === "icons/svg/mystery-man.svg") {
                    r.output.img = "icons/consumables/potions/bottle-corked-empty-blue.webp";
                }
            }
        }
        for (const r of filteredForge) {
            r.recipeType = "forge";
            const isSelected = this.selectedRecipeId === r.id;
            const isLearned = r.isLearned || r.learned;
            if (isLearned || isSelected) {
                if (!r.output.img || r.output.img === "icons/svg/item-bag.svg" || r.output.img === "icons/svg/mystery-man.svg") {
                    const cachedImg = ArtificerApp._recipeImageCache[r.name.toLowerCase()] || await ArtificerApp._resolvePlutoniumImage(r.name);
                    if (cachedImg) r.output.img = cachedImg;
                    else r.output.img = "icons/weapons/swords/sword-bastard-steel.webp";
                }
            } else {
                if (!r.output.img || r.output.img === "icons/svg/item-bag.svg" || r.output.img === "icons/svg/mystery-man.svg") {
                    r.output.img = "icons/weapons/swords/sword-bastard-steel.webp";
                }
            }
        }

        // Select the active recipe details
        let maxQuantity = 1;
        if (this.selectedRecipeId) {
            const pool = this.selectedRecipeType === "alchemy" ? allAlchemyRecipes : allForgeRecipes;
            selectedRecipe = pool.find(r => r.id === this.selectedRecipeId);

            if (selectedRecipe) {
                const isPotion = this.selectedRecipeType === "alchemy";

                // Calculate max craftable quantity based on available ingredients
                let limits = [];
                for (const ing of selectedRecipe.ingredients) {
                    const direct = actorInventory[ing.name.toLowerCase()] || 0;
                    const subs = isPotion
                        ? getSubstitutes(ing.name, selectedRecipe.rarity)
                        : getForgeSubstitutes(ing.name, selectedRecipe.rarity);
                    let subsQty = 0;
                    for (const s of subs) {
                        subsQty += actorInventory[s.toLowerCase()] || 0;
                    }
                    const totalAvailable = direct + subsQty;
                    limits.push(Math.floor(totalAvailable / ing.quantity));
                }
                maxQuantity = limits.length > 0 ? Math.max(1, Math.min(...limits)) : 1;
                this.craftQuantity = Math.min(Math.max(1, this.craftQuantity || 1), maxQuantity);

                const isHealing = isPotion && /healing/i.test(selectedRecipe.name);
                const speedMult = isPotion
                    ? this._getAlchemySpeedMultiplier()
                    : this._getForgeSpeedMultiplier(selectedRecipe);
                const ct = isPotion
                    ? getCraftingTime(selectedRecipe.rarity, speedMult, isHealing)
                    : getForgeCraftingTime(selectedRecipe.rarity, speedMult);

                selectedRecipe = {
                    ...selectedRecipe,
                    craftingTimeLabel: isPotion ? formatCraftingTime(ct.days) : formatForgeCraftingTime(ct.days),
                    craftingCost: ct.cost,
                    recipeType: this.selectedRecipeType
                };

                // Generate workstationSlots (flattened individual items)
                for (const ing of selectedRecipe.ingredients) {
                    const tier = getItemTier(ing.name);
                    const rarity = getRarityFromTier(tier);

                    for (let i = 0; i < ing.quantity; i++) {
                        const slotIndex = workstationSlots.length;
                        const providedData = this.providedIngredients[slotIndex.toString()];

                        let icon = isPotion
                            ? getIngredientIcon(ing.name, ing.type)
                            : getForgeMaterialIcon(ing.name, ing.type);

                        if (providedData && providedData.img) {
                            icon = providedData.img;
                        }

                        workstationSlots.push({
                            slotIndex,
                            recipeIngName: ing.name,
                            recipeIngType: ing.type,
                            rarity,
                            isFilled: providedData !== undefined,
                            providedName: providedData?.name || "",
                            icon
                        });
                    }
                }

                // Map ingredients for the aggregated checklist view
                mappedIngredients = selectedRecipe.ingredients.map((ing) => {
                    const subs = isPotion
                        ? getSubstitutes(ing.name, selectedRecipe.rarity)
                        : getForgeSubstitutes(ing.name, selectedRecipe.rarity);

                    const typeLabel = isPotion
                        ? (getTypeLabels()[ing.type] || ing.type)
                        : (getForgeTypeLabels()[ing.type] || ing.type);

                    const direct = actorInventory[ing.name.toLowerCase()] || 0;
                    let subsQty = 0;
                    for (const s of subs) {
                        subsQty += actorInventory[s.toLowerCase()] || 0;
                    }

                    // Calculate how many matching items are currently provided in the workstation slots
                    const provided = workstationSlots.filter(s => {
                        if (!s.isFilled) return false;
                        return s.recipeIngName.toLowerCase() === ing.name.toLowerCase();
                    }).length;

                    const tier = getItemTier(ing.name);
                    const rarity = getRarityFromTier(tier);

                    // Display name shows the name of the first item provided for this ingredient, if any
                    const firstProvidedSlot = workstationSlots.find(s => s.isFilled && s.recipeIngName.toLowerCase() === ing.name.toLowerCase());
                    const displayName = firstProvidedSlot ? firstProvidedSlot.providedName : ing.name;

                    return {
                        ...ing,
                        displayName,
                        provided,
                        fulfilled: provided >= ing.quantity,
                        typeLabel,
                        substitutes: subs,
                        inventoryCount: direct + subsQty,
                        rarity
                    };
                });

                if (this.inventoryRecipeFilter) {
                    // Sort actor inventory so matching ingredients are sorted to the top
                    const recipeIngs = new Set();
                    for (const ing of selectedRecipe.ingredients) {
                        recipeIngs.add(ing.name.toLowerCase());
                        const subs = isPotion ? getSubstitutes(ing.name, selectedRecipe.rarity) : getForgeSubstitutes(ing.name, selectedRecipe.rarity);
                        for (const s of subs) recipeIngs.add(s.toLowerCase());
                    }
                    inventoryItems.sort((a, b) => {
                        const aMatches = recipeIngs.has(a.name.toLowerCase()) ? 1 : 0;
                        const bMatches = recipeIngs.has(b.name.toLowerCase()) ? 1 : 0;
                        if (aMatches !== bMatches) return bMatches - aMatches;
                        return a.name.localeCompare(b.name);
                    });
                } else {
                    inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
                }
            }
        } else {
            inventoryItems.sort((a, b) => a.name.localeCompare(b.name));
        }

        let hasEnoughForQuantity = true;
        if (selectedRecipe && this.craftQuantity > 1) {
            const isPotion = this.selectedRecipeType === "alchemy";
            for (const ing of selectedRecipe.ingredients) {
                const requiredTotal = ing.quantity * this.craftQuantity;
                const direct = actorInventory[ing.name.toLowerCase()] || 0;
                const subs = isPotion
                    ? getSubstitutes(ing.name, selectedRecipe.rarity)
                    : getForgeSubstitutes(ing.name, selectedRecipe.rarity);
                let subsQty = 0;
                for (const s of subs) {
                    subsQty += actorInventory[s.toLowerCase()] || 0;
                }
                if ((direct + subsQty) < requiredTotal) {
                    hasEnoughForQuantity = false;
                    break;
                }
            }
        }

        const canCraft = selectedRecipe &&
            workstationSlots.length > 0 &&
            workstationSlots.every(s => s.isFilled) &&
            hasEnoughForQuantity;

        // Group recipes into collapsible category submenus
        const groupRecipes = (list, collapsedSet) => {
            const groups = {};
            for (const r of list) {
                const cat = r.category || "other";
                if (!groups[cat]) {
                    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
                    groups[cat] = { name: label, recipes: [] };
                }
                groups[cat].recipes.push(r);
            }
            return Object.entries(groups)
                .map(([id, g]) => ({
                    id,
                    name: g.name,
                    recipes: g.recipes,
                    collapsed: collapsedSet.has(id)
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        };

        const alchemyCategories = groupRecipes(filteredAlchemy, this.collapsedAlchemyCategories);
        const forgeCategories = groupRecipes(filteredForge, this.collapsedForgeCategories);

        // Unified Queue projects
        const mappedProjects = [];
        for (const p of (this.actor?.getFlag("artificer-foundry", "craftingProjects") || [])) {
            const reqHours = p.requiredHours !== undefined ? p.requiredHours : (p.requiredDays || 1) * 8;
            const spentHours = p.spentHours !== undefined ? p.spentHours : (p.spentDays || 0) * 8;
            const progress = Math.min(100, Math.floor((spentHours / reqHours) * 100));
            const completed = spentHours >= reqHours;
            
            let img = p.output?.img || "icons/svg/item-bag.svg";
            if (!img || img === "icons/svg/item-bag.svg" || img === "icons/svg/mystery-man.svg") {
                const cachedImg = ArtificerApp._recipeImageCache[p.recipeName.toLowerCase()] || await ArtificerApp._resolvePlutoniumImage(p.recipeName);
                if (cachedImg) img = cachedImg;
                else img = p.type === "potion" ? "icons/consumables/potions/bottle-corked-empty-blue.webp" : "icons/weapons/swords/sword-bastard-steel.webp";
            }

            mappedProjects.push({
                ...p,
                requiredHours: reqHours,
                spentHours: spentHours,
                progress,
                completed,
                isPotion: p.type === "potion",
                output: {
                    ...p.output,
                    img
                }
            });
        }

        const playerProjects = mappedProjects.filter(p => !p.isHomunculus);
        const homunculusProjects = mappedProjects.filter(p => p.isHomunculus);

        // Filter catalog items
        let catalogItems = [];
        if (this.showCatalog) {
            let rawCatalog = [];
            if (this.activeRecipeTab === "alchemy") {
                const icons = getIngredientIcons() || {};
                const costs = getIngredientCosts() || {};
                for (const [name, img] of Object.entries(icons)) {
                    const tier = getItemTier(name);
                    const rarity = getRarityFromTier(tier);
                    const price = costs[name] ?? 0;
                    rawCatalog.push({ name, img, rarity, price, type: tier });
                }
            } else {
                const icons = getForgeMaterialIcons() || {};
                const costs = getForgeMaterialCosts() || {};
                for (const [name, img] of Object.entries(icons)) {
                    const tier = getItemTier(name);
                    const rarity = getRarityFromTier(tier);
                    const price = costs[name] ?? 0;
                    rawCatalog.push({ name, img, rarity, price, type: tier });
                }
            }

            // Apply search & rarity filters
            const catQuery = this.catalogSearchQuery.toLowerCase().trim();
            const catRarity = this.catalogRarityFilter;

            catalogItems = rawCatalog.filter(item => {
                if (catRarity !== "all" && item.rarity !== catRarity) return false;
                if (catQuery) {
                    const matchesName = item.name.toLowerCase().includes(catQuery);
                    const label = this.activeRecipeTab === "alchemy"
                        ? (getTypeLabels()[item.type] || item.type)
                        : (getForgeTypeLabels()[item.type] || item.type);
                    const matchesType = (label || "").toLowerCase().includes(catQuery);
                    if (!matchesName && !matchesType) return false;
                }
                return true;
            });

            // Sort catalog items by rarity first, then by name
            const rarityOrder = { common: 0, uncommon: 1, rare: 2, very_rare: 3, legendary: 4 };
            catalogItems.sort((a, b) => {
                const diff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
                if (diff !== 0) return diff;
                return a.name.localeCompare(b.name);
            });
        }

        const hasBag = !!getArtificerBag(this.actor);

        return {
            actor: this.actor,
            hasBag,
            showCatalog: this.showCatalog,
            catalogSearchQuery: this.catalogSearchQuery,
            inventorySearchQuery: this.inventorySearchQuery,
            catalogRarityFilter: this.catalogRarityFilter,
            catalogItems,
            inventoryItems,
            selectedRecipe,
            mappedIngredients,
            workstationSlots,
            isManyIngredients: workstationSlots.length > 4,
            canCraft,
            crafting: this._crafting,
            playerProjects,
            homunculusProjects,
            recipeSearchQuery: this.recipeSearchQuery,
            recipeRarityFilter: this.recipeRarityFilter,
            recipeCraftableFilter: this.recipeCraftableFilter,
            recipeShowKnown: this.recipeShowKnown,
            recipeShowUnknown: this.recipeShowUnknown,
            inventoryRecipeFilter: this.inventoryRecipeFilter,
            craftQuantity: this.craftQuantity,
            maxQuantity: maxQuantity,

            // Navigation tabs
            activeRecipeTab: this.activeRecipeTab,
            isAlchemyTab: this.activeRecipeTab === "alchemy",
            isForgeTab: this.activeRecipeTab === "forge",
            alchemyCategories,
            forgeCategories,

            isAlchemist,
            isSmith,
            isSettingsTab: this.activeRecipeTab === "settings",
            craftingAssistants: this.actor.getFlag("artificer-foundry", "craftingAssistants") ?? 0,
            alchemistSubclass: this.actor.getFlag("artificer-foundry", "alchemistSubclass") ?? this._isAlchemistAuto(),
            armorerSubclass: this.actor.getFlag("artificer-foundry", "armorerSubclass") ?? this._isArmorerAuto(),
            artilleristSubclass: this.actor.getFlag("artificer-foundry", "artilleristSubclass") ?? this._isArtilleristAuto(),
            battleSmithSubclass: this.actor.getFlag("artificer-foundry", "battleSmithSubclass") ?? this._isBattleSmithAuto(),
            hasHomunculus: this.actor.getFlag("artificer-foundry", "hasHomunculus") ?? false,
            homunculusMode: this.actor.getFlag("artificer-foundry", "homunculusMode") || "assist",
            hasHomunculusIndependent: (this.actor.getFlag("artificer-foundry", "hasHomunculus") ?? false) && (this.actor.getFlag("artificer-foundry", "homunculusMode") || "assist") === "independent",
            assignHomunculus: this.assignHomunculus ?? false
        };
    }

    _onRender(context, options) {
        const el = this.targetElement || this.element;

        // --- Recipe Type Tab Switching ---
        el.querySelectorAll('.recipe-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeRecipeTab = btn.dataset.tab;
                this.render();
            });
        });

        // --- Left Panel Tab Switching ---
        el.querySelectorAll('.left-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showCatalog = btn.dataset.tab === "catalog";
                this.render();
            });
        });

        // --- Create Artificer Bag Action ---
        const createBagBtn = el.querySelector('.create-bag-btn');
        if (createBagBtn) {
            createBagBtn.addEventListener('click', async e => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.actor?.isOwner) {
                    ui.notifications.warn("You do not own this character.");
                    return;
                }

                // Double check if bag already exists
                let bag = getArtificerBag(this.actor);
                if (bag) {
                    ui.notifications.warn("An Artificer's Component Bag already exists.");
                    return;
                }

                const type = game.documentTypes.Item.includes("container") ? "container" : "backpack";
                const [created] = await this.actor.createEmbeddedDocuments("Item", [{
                    name: "Artificer's Component Bag",
                    type: type,
                    img: "icons/containers/bags/pouch-leather-leaf-green.webp",
                    system: {
                        description: { value: "A special, enchanted bag used by artificers to store components, ingredients, and materials gathered for crafting." },
                        weight: { value: 1 }
                    }
                }]);

                if (created) {
                    ui.notifications.info("Created Artificer's Component Bag. Consolidating your items...");

                    // Force migration to move all existing components into this bag!
                    await this._mergeActorDuplicates();
                    this.render();
                }
            });
        }

        // --- Inventory search listener ---
        const invSearchInput = el.querySelector('.inventory-search-input');
        if (invSearchInput) {
            invSearchInput.addEventListener('input', e => {
                this.inventorySearchQuery = e.target.value;
                this._restoreInventorySearchFocus = true;
                this._inventorySearchCursorPos = e.target.selectionStart;
                this._debouncedSearch();
            });
        }

        // --- Catalog search & filter dropdown listeners ---
        const catSearchInput = el.querySelector('.catalog-search-input');
        if (catSearchInput) {
            catSearchInput.addEventListener('input', e => {
                this.catalogSearchQuery = e.target.value;
                this._restoreCatalogSearchFocus = true;
                this._catalogSearchCursorPos = e.target.selectionStart;
                this._debouncedSearch();
            });
        }

        const catRaritySelect = el.querySelector('.catalog-rarity-filter');
        if (catRaritySelect) {
            catRaritySelect.addEventListener('change', e => {
                this.catalogRarityFilter = e.target.value;
                this.render();
            });
        }

        el.querySelectorAll('.catalog-add-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.actor?.isOwner) {
                    ui.notifications.warn("You do not own this character.");
                    return;
                }
                const name = btn.dataset.name;
                const type = btn.dataset.type;
                const tab = this.activeRecipeTab;

                if (tab === "alchemy") {
                    await addIngredientToActor(this.actor, name, type, 1);
                } else {
                    await addForgeMaterialToActor(this.actor, name, type, 1);
                }
                ui.notifications.info(`Added 1x ${name} to your inventory.`);
            });
        });

        if (this._restoreCatalogSearchFocus) {
            const search = el.querySelector('.catalog-search-input');
            if (search) {
                search.focus();
                search.selectionStart = search.selectionEnd = this._catalogSearchCursorPos ?? search.value.length;
            }
            this._restoreCatalogSearchFocus = false;
        }

        if (this._restoreInventorySearchFocus) {
            const search = el.querySelector('.inventory-search-input');
            if (search) {
                search.focus();
                search.selectionStart = search.selectionEnd = this._inventorySearchCursorPos ?? search.value.length;
            }
            this._restoreInventorySearchFocus = false;
        }

        // --- Category Header Collapse Toggles ---
        el.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', () => {
                const catId = header.dataset.categoryId;
                const tab = this.activeRecipeTab;
                const collapsedSet = tab === "alchemy" ? this.collapsedAlchemyCategories : this.collapsedForgeCategories;

                if (collapsedSet.has(catId)) collapsedSet.delete(catId);
                else collapsedSet.add(catId);

                this.render();
            });
        });

        // --- Search bar & rarity dropdown listeners ---
        const searchInput = el.querySelector('.recipe-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', e => {
                this.recipeSearchQuery = e.target.value;
                this._restoreSearchFocus = true;
                this._searchCursorPos = e.target.selectionStart;
                this._debouncedSearch();
            });
        }

        const raritySelect = el.querySelector('.recipe-rarity-filter');
        if (raritySelect) {
            raritySelect.addEventListener('change', e => {
                this.recipeRarityFilter = e.target.value;
                this.render();
            });
        }

        const craftableCheckbox = el.querySelector('.recipe-craftable-filter');
        if (craftableCheckbox) {
            craftableCheckbox.addEventListener('change', e => {
                this.recipeCraftableFilter = e.target.checked;
                this.render();
            });
        }

        const knownCheckbox = el.querySelector('.recipe-known-filter');
        if (knownCheckbox) {
            knownCheckbox.addEventListener('change', e => {
                this.recipeShowKnown = e.target.checked;
                this.render();
            });
        }

        const unknownCheckbox = el.querySelector('.recipe-unknown-filter');
        if (unknownCheckbox) {
            unknownCheckbox.addEventListener('change', e => {
                this.recipeShowUnknown = e.target.checked;
                this.render();
            });
        }

        const invRecipeCheckbox = el.querySelector('.inventory-recipe-filter');
        if (invRecipeCheckbox) {
            invRecipeCheckbox.addEventListener('change', e => {
                this.inventoryRecipeFilter = e.target.checked;
                this.render();
            });
        }

        // Lab Settings Checkbox events
        const bindSetting = (className, flagName) => {
            const checkbox = el.querySelector(className);
            if (checkbox) {
                checkbox.addEventListener('change', async e => {
                    await this.actor.setFlag("artificer-foundry", flagName, e.target.checked);
                    this.render();
                });
            }
        };

        bindSetting('.setting-alchemist-subclass', 'alchemistSubclass');
        bindSetting('.setting-armorer-subclass', 'armorerSubclass');
        bindSetting('.setting-artillerist-subclass', 'artilleristSubclass');
        bindSetting('.setting-battle-smith-subclass', 'battleSmithSubclass');



        bindSetting('.setting-has-homunculus', 'hasHomunculus');

        const homunculusModeSelect = el.querySelector('.setting-homunculus-mode');
        if (homunculusModeSelect) {
            homunculusModeSelect.addEventListener('change', async e => {
                await this.actor.setFlag("artificer-foundry", "homunculusMode", e.target.value);
                this.render();
            });
        }

        const assignHomunculusCheckbox = el.querySelector('.assign-homunculus-craft');
        if (assignHomunculusCheckbox) {
            assignHomunculusCheckbox.addEventListener('change', e => {
                this.assignHomunculus = e.target.checked;
                this.render();
            });
        }

        const craftQtyInput = el.querySelector('.craft-quantity');
        if (craftQtyInput) {
            craftQtyInput.addEventListener('change', e => {
                const max = parseInt(e.target.getAttribute('max')) || 1;
                const qty = Math.min(max, Math.max(1, parseInt(e.target.value) || 1));
                this.craftQuantity = qty;
                this.render();
            });
        }

        const qtyMinusBtn = el.querySelector('.qty-minus');
        if (qtyMinusBtn) {
            qtyMinusBtn.addEventListener('click', e => {
                e.preventDefault();
                this.craftQuantity = Math.max(1, (this.craftQuantity || 1) - 1);
                this.render();
            });
        }

        const qtyPlusBtn = el.querySelector('.qty-plus');
        if (qtyPlusBtn) {
            qtyPlusBtn.addEventListener('click', e => {
                e.preventDefault();
                const max = parseInt(craftQtyInput?.getAttribute('max')) || 1;
                this.craftQuantity = Math.min(max, (this.craftQuantity || 1) + 1);
                this.render();
            });
        }

        if (this._restoreSearchFocus) {
            const search = el.querySelector('.recipe-search-input');
            if (search) {
                search.focus();
                search.selectionStart = search.selectionEnd = this._searchCursorPos ?? search.value.length;
            }
            this._restoreSearchFocus = false;
        }

        // --- Hover Dynamic Header in Inventory ---
        el.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('mouseenter', () => {
                const name = slot.dataset.name;
                const price = slot.dataset.price;
                const weight = slot.dataset.weight;
                const detailEl = el.querySelector('.inventory-hover-detail');
                if (detailEl) {
                    detailEl.innerHTML = `<span style="color: #2e1503; font-weight: bold;">${name}</span> <span style="font-size: 0.85em; color: #5c2018; margin-left: 6px; font-weight: normal;"> - ${price} | ${weight}</span>`;
                }
            });
            slot.addEventListener('mouseleave', () => {
                const detailEl = el.querySelector('.inventory-hover-detail');
                if (detailEl) {
                    detailEl.innerHTML = "SELECT AN INGREDIENT";
                }
            });
        });

        // --- Interactive Clicks & Drag Setup ---
        el.querySelectorAll('.recipe-item').forEach(item => {
            item.addEventListener('click', e => this._onSelectRecipe(e));

            // Drag recipe to cauldron
            item.setAttribute('draggable', 'true');
            item.addEventListener('dragstart', ev => {
                ev.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'af-recipe',
                    id: item.dataset.recipeId,
                    recipeType: this.activeRecipeTab
                }));
            });
        });

        el.querySelectorAll('.learn-recipe-btn').forEach(btn => btn.addEventListener('click', e => this._onLearnRecipe(e)));
        el.querySelectorAll('.forget-recipe-btn').forEach(btn => btn.addEventListener('click', e => this._onForgetRecipe(e)));

        // Stage Ingredient Quick clicks
        el.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.addEventListener('click', e => {
                e.preventDefault();
                this._stageIngredientByName(slot.dataset.name, slot.dataset.img);
            });

            // Drag ingredient
            slot.setAttribute('draggable', 'true');
            slot.addEventListener('dragstart', ev => {
                ev.stopPropagation(); // Avoid triggering system-level sheet drags!
                ev.dataTransfer.effectAllowed = "move";
                ev.dataTransfer.setData('text/plain', JSON.stringify({
                    type: 'Item',
                    uuid: slot.dataset.uuid,
                    name: slot.dataset.name,
                    img: slot.dataset.img
                }));
                this._draggedIngredient = {
                    name: slot.dataset.name,
                    img: slot.dataset.img
                };
            });
            slot.addEventListener('dragend', () => {
                this._draggedIngredient = null;
                el.querySelectorAll('.station-slot').forEach(s => s.classList.remove('valid-drag-over', 'invalid-drag-over'));
            });
        });

        // Drop zone central workstation cauldron/forge
        const dropZones = el.querySelectorAll('.workstation-scene, .staged-slots-row');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                e.stopPropagation();
                el.querySelector('.workstation-scene')?.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', (e) => {
                e.stopPropagation();
                el.querySelector('.workstation-scene')?.classList.remove('drag-over');
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                e.stopPropagation();
                this._onDropOnWorkstation(e);
            });
        });

        // Interactive validation per workstation slot
        el.querySelectorAll('.station-slot').forEach(stationSlot => {
            stationSlot.addEventListener('dragover', e => {
                if (!this._draggedIngredient) return;

                const isPotion = this.selectedRecipeType === "alchemy";
                const pool = isPotion
                    ? window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor)
                    : window.ArtificerFoundry.forgeRecipeManager.getRecipesForActor(this.actor);
                const recipe = pool.find(r => r.id === this.selectedRecipeId);
                if (!recipe) return;

                const targetSlotName = stationSlot.dataset.ingredientName;
                const ing = recipe.ingredients.find(i => i.name.toLowerCase() === targetSlotName.toLowerCase());
                if (!ing) return;

                const isExact = this._draggedIngredient.name.toLowerCase() === ing.name.toLowerCase();
                const isSub = isPotion
                    ? getSubstitutes(ing.name, recipe.rarity).some(s => s.toLowerCase() === this._draggedIngredient.name.toLowerCase())
                    : getForgeSubstitutes(ing.name, recipe.rarity).some(s => s.toLowerCase() === this._draggedIngredient.name.toLowerCase());

                if (isExact || isSub) {
                    e.preventDefault(); // ALLOW drop
                    e.stopPropagation();
                    stationSlot.classList.add('valid-drag-over');
                    stationSlot.classList.remove('invalid-drag-over');
                } else {
                    e.stopPropagation();
                    stationSlot.classList.add('invalid-drag-over');
                    stationSlot.classList.remove('valid-drag-over');
                }
            });
            stationSlot.addEventListener('dragleave', (e) => {
                e.stopPropagation();
                stationSlot.classList.remove('valid-drag-over', 'invalid-drag-over');
            });
            stationSlot.addEventListener('drop', e => {
                e.preventDefault();
                e.stopPropagation();
                this._onDropOnWorkstation(e);
            });
        });

        el.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault(); e.stopPropagation();
                const idx = btn.dataset.slotIndex;
                if (idx !== undefined) {
                    delete this.providedIngredients[idx];
                }
                this.render();
            });
        });

        el.querySelector('.clear-station-btn')?.addEventListener('click', e => {
            e.preventDefault();
            this.providedIngredients = {};
            this.render();
        });

        el.querySelector('.craft-btn')?.addEventListener('click', e => this._onCraftItem(e));

        // Queue interactions
        el.querySelectorAll('.advance-project-btn').forEach(btn => btn.addEventListener('click', e => this._onContributeTime(e)));
        el.querySelectorAll('.claim-project-btn').forEach(btn => btn.addEventListener('click', e => this._onClaimProject(e)));
        el.querySelectorAll('.cancel-project-btn').forEach(btn => btn.addEventListener('click', e => this._onCancelProject(e)));
        el.querySelectorAll('.project-details-click').forEach(elem => elem.addEventListener('click', e => this._onShowProjectDescription(e)));
    }

    _debouncedSearch = foundry.utils.debounce(() => this.render(), 300);

    _onSelectRecipe(event) {
        event.preventDefault();
        const id = event.currentTarget.dataset.recipeId;
        const recipeType = this.activeRecipeTab;
        if (this.selectedRecipeId === id && this.selectedRecipeType === recipeType) return;
        this.selectedRecipeId = id;
        this.selectedRecipeType = recipeType;
        this.providedIngredients = {};
        this.render();
    }

    _onShowProjectDescription(event) {
        event.preventDefault();
        event.stopPropagation();
        const recipeId = event.currentTarget.dataset.recipeId;
        if (!recipeId) return;

        let recipe = window.ArtificerFoundry.recipeManager.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            recipe = window.ArtificerFoundry.forgeRecipeManager.recipes.find(r => r.id === recipeId);
        }
        if (!recipe) return;

        const ingredientsList = recipe.ingredients.map(ing => `<li>${ing.quantity}x ${ing.name}</li>`).join("");

        new Dialog({
            title: recipe.name,
            content: `
                <div style="padding: 8px; font-family: 'Signika', 'Palatino Linotype', serif; color: #2e1503;">
                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 12px;">
                        <img src="${recipe.output.img || 'icons/svg/item-bag.svg'}" style="width: 64px; height: 64px; border: 2px solid #3c2418; border-radius: 4px; background: rgba(0,0,0,0.05);" />
                        <div>
                            <h2 style="margin: 0; color: #5c2018; border-bottom: none; font-size: 1.5em; font-family: 'Signika', 'Palatino Linotype', serif;">${recipe.name}</h2>
                            <p style="margin: 4px 0 0; text-transform: capitalize; color: #2e1503; font-size: 0.9em;"><strong>Rarity:</strong> ${recipe.rarity}</p>
                        </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <h4 style="margin: 0 0 4px; color: #5c2018; border-bottom: 1px solid rgba(60,36,24,0.3); font-family: 'Signika', 'Palatino Linotype', serif;">Ingredients Required:</h4>
                        <ul style="margin: 0; padding-left: 20px; font-size: 0.95em; color: #2e1503;">
                            ${ingredientsList}
                        </ul>
                    </div>
                    <div style="line-height: 1.4; max-height: 200px; overflow-y: auto; background: rgba(0,0,0,0.05); padding: 8px; border: 1px solid rgba(60,36,24,0.2); border-radius: 4px; font-size: 0.95em; color: #2e1503;">
                        ${recipe.description || "No description available."}
                    </div>
                </div>
            `,
            buttons: {
                close: { label: "Close" }
            },
            default: "close"
        }).render(true);
    }

    async _onLearnRecipe(event) {
        event.preventDefault(); event.stopPropagation();
        if (!this.actor?.isOwner) { ui.notifications.warn("You do not own this character."); return; }
        const recipeId = event.currentTarget.dataset.recipeId;
        const type = this.activeRecipeTab;
        if (type === "alchemy") {
            await window.ArtificerFoundry.recipeManager.learnRecipe(this.actor, recipeId);
        } else {
            await window.ArtificerFoundry.forgeRecipeManager.learnRecipe(this.actor, recipeId);
        }
        ui.notifications.info(`${this.actor.name} has learned a new recipe!`);
        this.render();
    }

    async _onForgetRecipe(event) {
        event.preventDefault(); event.stopPropagation();
        if (!this.actor?.isOwner) { ui.notifications.warn("You do not own this character."); return; }
        const recipeId = event.currentTarget.dataset.recipeId;
        const type = this.activeRecipeTab;
        const recipeName = event.currentTarget.closest('.recipe-item-header')?.querySelector('.recipe-name')?.textContent?.trim() || "this recipe";

        Dialog.confirm({
            title: `Forget Recipe: ${recipeName}`,
            content: `<p style="color: #2e1503; font-family: 'Signika', 'Palatino Linotype', serif;">Are you sure you want to forget <strong>${recipeName}</strong>?</p>`,
            yes: async () => {
                if (type === "alchemy") {
                    await window.ArtificerFoundry.recipeManager.forgetRecipe(this.actor, recipeId);
                } else {
                    await window.ArtificerFoundry.forgeRecipeManager.forgetRecipe(this.actor, recipeId);
                }
                ui.notifications.info(`${this.actor.name} has forgotten the recipe for ${recipeName}.`);
                this.render();
            },
            no: () => {},
            defaultYes: false
        });
    }

    async _onDropOnWorkstation(event) {
        event.preventDefault();
        event.stopPropagation();
        const el = this.targetElement || this.element;
        el.querySelector('.workstation-scene')?.classList.remove('drag-over');

        try {
            const data = JSON.parse(event.dataTransfer?.getData('text/plain') || "{}");

            // Drop recipe
            if (data.type === "af-recipe") {
                this.selectedRecipeId = data.id;
                this.selectedRecipeType = data.recipeType;
                this.providedIngredients = {};
                this.render();
                return;
            }

            // Find closest slot target
            const slotEl = event.target.closest('.station-slot');
            const targetSlotIndexStr = slotEl ? slotEl.dataset.slotIndex : null;
            const targetSlotIndex = targetSlotIndexStr !== null ? parseInt(targetSlotIndexStr, 10) : null;

            // Drop ingredient
            if (data.type === "Item") {
                if (data.name && data.img) {
                    this._stageIngredientByName(data.name, data.img, targetSlotIndex);
                } else if (data.uuid) {
                    const item = await fromUuid(data.uuid);
                    if (item?.parent?.id !== this.actor?.id) {
                        ui.notifications.warn("You can only use items from your own inventory.");
                        return;
                    }
                    this._stageIngredientByName(item.name, item.img, targetSlotIndex);
                }
            }
        } catch (err) {
            console.error("Artificer Foundry | Drop error:", err);
        }
    }

    _stageIngredientByName(name, img, targetSlotIndex = null) {
        if (!this.selectedRecipeId) { ui.notifications.warn("Select or drag a recipe to the workstation first."); return; }

        const isPotion = this.selectedRecipeType === "alchemy";
        const pool = isPotion
            ? window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor)
            : window.ArtificerFoundry.forgeRecipeManager.getRecipesForActor(this.actor);
        const recipe = pool.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        // Generate the list of individual required slots to match against
        const workstationSlots = [];
        for (const ing of recipe.ingredients) {
            for (let i = 0; i < ing.quantity; i++) {
                workstationSlots.push({
                    slotIndex: workstationSlots.length,
                    recipeIngName: ing.name,
                    recipeIngType: ing.type,
                    rarity: getRarityFromTier(getItemTier(ing.name))
                });
            }
        }

        const isExact = (slot) => name.toLowerCase() === slot.recipeIngName.toLowerCase();
        const isSub = (slot) => isPotion
            ? getSubstitutes(slot.recipeIngName, recipe.rarity).some(s => s.toLowerCase() === name.toLowerCase())
            : getForgeSubstitutes(slot.recipeIngName, recipe.rarity).some(s => s.toLowerCase() === name.toLowerCase());

        let targetSlot = null;

        if (targetSlotIndex !== null) {
            // Drop onto a specific slot
            const slot = workstationSlots.find(s => s.slotIndex === targetSlotIndex);
            if (slot && (isExact(slot) || isSub(slot))) {
                targetSlot = slot;
            } else {
                const requiredTypeLabel = slot ? (isPotion ? (getTypeLabels()[slot.recipeIngType] || slot.recipeIngType) : (getForgeTypeLabels()[slot.recipeIngType] || slot.recipeIngType)) : "";
                ui.notifications.warn(`"${name}" cannot be used for this slot (requires ${slot?.recipeIngName || requiredTypeLabel}).`);
                return;
            }
        } else {
            // General drop/click fallback: find the first empty slot that matches
            targetSlot = workstationSlots.find(slot => {
                const isFilled = this.providedIngredients[slot.slotIndex.toString()] !== undefined;
                if (isFilled) return false;
                return isExact(slot) || isSub(slot);
            });

            if (!targetSlot) {
                ui.notifications.warn(`"${name}" is not needed for any remaining slots of this recipe.`);
                return;
            }
        }

        // Verify if total inventory has enough of this item to commit
        const totalInInventory = (this.actor?.items?.contents ?? [])
            .filter(i => i.name.toLowerCase() === name.toLowerCase())
            .reduce((sum, i) => sum + (i.system?.quantity ?? 1), 0);

        let alreadyStagedOfThisName = 0;
        for (const [idxStr, entry] of Object.entries(this.providedIngredients)) {
            if (idxStr === targetSlot.slotIndex.toString()) continue;
            if (entry.name.toLowerCase() === name.toLowerCase()) {
                alreadyStagedOfThisName += 1;
            }
        }

        if (alreadyStagedOfThisName >= totalInInventory) {
            ui.notifications.info(`You do not have enough "${name}" in your inventory to stage another.`);
            return;
        }

        // Stage the item into this slot!
        this.providedIngredients[targetSlot.slotIndex.toString()] = {
            provided: 1,
            name: name,
            img: img || ""
        };

        ui.notifications.info(`Added ${name} to workstation slot #${targetSlot.slotIndex + 1}.`);
        this.render();
    }

    async _onCraftItem(event) {
        event.preventDefault();
        if (!this.selectedRecipeId || !this.actor) return;

        const isPotion = this.selectedRecipeType === "alchemy";
        const pool = isPotion
            ? window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor)
            : window.ArtificerFoundry.forgeRecipeManager.getRecipesForActor(this.actor);
        const recipe = pool.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        if (!recipe.isLearned) {
            ui.notifications.warn(`You do not know the recipe for "${recipe.name}" yet! You must learn the recipe before crafting it.`);
            return;
        }

        let variantName = recipe.output.name;
        const variants = FORGE_VARIANTS[recipe.name];
        if (variants) {
            const selectedVariant = await new Promise((resolve) => {
                let optionsHtml = "";
                for (const v of variants) {
                    optionsHtml += `<option value="${v}">${v}</option>`;
                }

                new Dialog({
                    title: `Select Variant for ${recipe.name}`,
                    content: `
                        <form style="margin-bottom: 8px;">
                            <div class="form-group">
                                <label>Choose Variant:</label>
                                <select name="variant" style="width: 100%;">
                                    ${optionsHtml}
                                </select>
                            </div>
                        </form>
                    `,
                    buttons: {
                        craft: {
                            label: "Select & Craft",
                            callback: (html) => resolve(html.find('[name="variant"]').val())
                        },
                        cancel: {
                            label: "Cancel",
                            callback: () => resolve(null)
                        }
                    },
                    default: "craft",
                    close: () => resolve(null)
                }).render(true);
            });

            if (!selectedVariant) return; // User cancelled or closed dialog
            variantName = selectedVariant;
        }

        // 1. Generate the list of individual required slots to check status
        const workstationSlots = [];
        for (const ing of recipe.ingredients) {
            for (let i = 0; i < ing.quantity; i++) {
                workstationSlots.push({
                    slotIndex: workstationSlots.length,
                    recipeIngName: ing.name,
                    recipeIngType: ing.type
                });
            }
        }

        const allSatisfied = workstationSlots.every(slot => this.providedIngredients[slot.slotIndex.toString()] !== undefined);
        if (!allSatisfied) {
            ui.notifications.error("Please fill all ingredient slots in the workstation before crafting.");
            return;
        }

        // 2. Verify total inventory contains enough materials for quantity multiplier
        const quantity = this.craftQuantity || 1;
        const actorInventory = {};
        for (const item of (this.actor.items?.contents ?? [])) {
            const nameLower = (item.name ?? "").toLowerCase();
            const qty = item.system?.quantity ?? 1;
            if (qty > 0) actorInventory[nameLower] = (actorInventory[nameLower] || 0) + qty;
        }

        for (const ing of recipe.ingredients) {
            const requiredTotal = ing.quantity * quantity;
            const direct = actorInventory[ing.name.toLowerCase()] || 0;
            const subs = isPotion
                ? getSubstitutes(ing.name, recipe.rarity)
                : getForgeSubstitutes(ing.name, recipe.rarity);
            let subsQty = 0;
            for (const s of subs) {
                subsQty += actorInventory[s.toLowerCase()] || 0;
            }
            if ((direct + subsQty) < requiredTotal) {
                ui.notifications.error(`Not enough total ingredients in inventory to craft ${quantity}x ${recipe.name}. Needed: ${requiredTotal} of "${ing.name}" (with substitutes), but only have ${direct + subsQty} in total.`);
                return;
            }
        }

        // Animated Craft state
        this._crafting = true;
        this.render();
        await new Promise(r => setTimeout(r, 2200));

        // Deduct materials from inventory
        const itemsToConsume = {}; // name (lowercase) -> quantity
        for (const slot of workstationSlots) {
            const stagedItem = this.providedIngredients[slot.slotIndex.toString()];
            if (stagedItem) {
                const nameLower = stagedItem.name.toLowerCase();
                itemsToConsume[nameLower] = (itemsToConsume[nameLower] || 0) + 1;
            }
        }

        if (quantity > 1) {
            // Create a temporary copy of inventory counts to see what's available
            const tempInventory = { ...actorInventory };
            // Deduct the staged items first from our temporary inventory count
            for (const [nameLower, qty] of Object.entries(itemsToConsume)) {
                if (tempInventory[nameLower] !== undefined) {
                    tempInventory[nameLower] = Math.max(0, tempInventory[nameLower] - qty);
                }
            }

            for (const ing of recipe.ingredients) {
                let needed = ing.quantity * (quantity - 1);
                if (needed <= 0) continue;

                // 1. Try to consume exact ingredient first
                const exactLower = ing.name.toLowerCase();
                const availableExact = tempInventory[exactLower] || 0;
                const takeExact = Math.min(needed, availableExact);
                if (takeExact > 0) {
                    itemsToConsume[exactLower] = (itemsToConsume[exactLower] || 0) + takeExact;
                    tempInventory[exactLower] -= takeExact;
                    needed -= takeExact;
                }

                // 2. Try to consume substitutes
                if (needed > 0) {
                    const subs = isPotion
                        ? getSubstitutes(ing.name, recipe.rarity)
                        : getForgeSubstitutes(ing.name, recipe.rarity);
                    for (const s of subs) {
                        if (needed <= 0) break;
                        const subLower = s.toLowerCase();
                        const availableSub = tempInventory[subLower] || 0;
                        const takeSub = Math.min(needed, availableSub);
                        if (takeSub > 0) {
                            itemsToConsume[subLower] = (itemsToConsume[subLower] || 0) + takeSub;
                            tempInventory[subLower] -= takeSub;
                            needed -= takeSub;
                        }
                    }
                }
            }
        }

        // Deduct materials from inventory using itemsToConsume map
        for (const [nameLower, totalToDeduct] of Object.entries(itemsToConsume)) {
            let remaining = totalToDeduct;
            const matchingItems = this.actor.items.filter(i => i.type === "loot" &&
                i.name.toLowerCase() === nameLower
            );
            for (const actorItem of matchingItems) {
                if (remaining <= 0) break;
                const qty = actorItem.system?.quantity ?? 1;
                if (qty <= remaining) {
                    remaining -= qty;
                    await actorItem.delete();
                } else {
                    await actorItem.update({ "system.quantity": qty - remaining });
                    remaining = 0;
                }
            }
        }

        // Homunculus assignment checks
        const hasHomunculus = this.actor.getFlag("artificer-foundry", "hasHomunculus") ?? false;
        const homunculusMode = this.actor.getFlag("artificer-foundry", "homunculusMode") || "assist";
        const hasHomunculusIndependent = hasHomunculus && homunculusMode === "independent";
        const isHomunculus = hasHomunculusIndependent && (this.assignHomunculus ?? false);

        // Get crafting times
        let requiredDays, requiredHours;
        if (isPotion) {
            const isHealingPotion = /healing/i.test(recipe.name);
            const speedMult = isHomunculus ? 1.0 : this._getAlchemySpeedMultiplier();
            const ct = getCraftingTime(recipe.rarity, speedMult, isHealingPotion);
            requiredDays = ct.days; // Brewing multiple potions in same cauldron takes NO extra time!
            requiredHours = requiredDays * 8;
        } else {
            const speedMult = isHomunculus ? 1.0 : this._getForgeSpeedMultiplier(recipe);
            const ct = getForgeCraftingTime(recipe.rarity, speedMult);
            requiredDays = ct.days * quantity; // Forging scales with quantity
            requiredHours = requiredDays * 8;
        }

        // Create crafting project
        const projects = this.actor.getFlag("artificer-foundry", "craftingProjects") || [];
        const newProject = {
            id: foundry.utils.randomID(),
            type: isPotion ? "potion" : "anvil",
            recipeName: recipe.name,
            recipeId: recipe.id,
            output: {
                name: variantName,
                img: recipe.output.img || "icons/svg/item-bag.svg",
                quantity: (recipe.output.quantity ?? 1) * quantity
            },
            requiredDays,
            requiredHours,
            spentHours: 0,
            dateStarted: new Date().toLocaleDateString(),
            isHomunculus
        };
        projects.push(newProject);
        await this.actor.setFlag("artificer-foundry", "craftingProjects", projects);

        ui.notifications.info(`Started crafting ${quantity}x ${recipe.name}! Project added to queue.`);

        this.providedIngredients = {};
        this.craftQuantity = 1;
        this.assignHomunculus = false;
        this._crafting = false;
        this.render();
    }

    async _onContributeTime(event) {
        event.preventDefault();
        const projectId = event.currentTarget.dataset.projectId;
        if (!projectId || !this.actor) return;

        new Dialog({
            title: "Contribute Crafting Progress",
            content: `
                <form class="flexcol">
                    <div class="form-group">
                        <label>Amount to contribute:</label>
                        <input type="number" name="amount" value="1" min="0.1" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Unit:</label>
                        <select name="unit">
                            <option value="hours">Hours</option>
                            <option value="days">Days (1 Day = 8 Hours)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Crafting Assistants:</label>
                        <select name="assistants">
                            <option value="0">Solo Crafting (1.0x progress)</option>
                            <option value="1">1 Assistant (2.0x progress)</option>
                            <option value="2">2 Assistants (3.0x progress)</option>
                            <option value="3">3 Assistants (4.0x progress)</option>
                            <option value="4">4 Assistants (5.0x progress)</option>
                            <option value="5">5 Assistants (6.0x progress)</option>
                            <option value="6">6 Assistants (7.0x progress)</option>
                            <option value="7">7 Assistants (8.0x progress)</option>
                            <option value="8">8 Assistants (9.0x progress)</option>
                            <option value="9">9 Assistants (10.0x progress)</option>
                        </select>
                    </div>
                </form>
            `,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-hourglass-half"></i>',
                    label: "Contribute",
                    callback: async (html) => {
                        const amount = parseFloat(html.find('[name="amount"]').val() || 0);
                        const unit = html.find('[name="unit"]').val();
                        const assistants = parseInt(html.find('[name="assistants"]').val() || 0);
                        if (amount <= 0 || isNaN(amount)) return;

                        const projects = this.actor.getFlag("artificer-foundry", "craftingProjects") || [];
                        const project = projects.find(p => p.id === projectId);
                        if (!project) return;

                        const hasHomunculus = this.actor.getFlag("artificer-foundry", "hasHomunculus") ?? false;
                        const homunculusMode = this.actor.getFlag("artificer-foundry", "homunculusMode") || "assist";
                        const isAssisting = hasHomunculus && homunculusMode === "assist" && !project.isHomunculus;
                        const homunculusBonus = isAssisting ? 1 : 0;

                        const baseHours = unit === "days" ? amount * 8 : amount;
                        // homunculus adds +1 to progress rate when assisting
                        const hoursToAdd = baseHours * (1 + assistants + homunculusBonus);

                        // Migrate legacy project fields
                        if (project.requiredHours === undefined) {
                            project.requiredHours = (project.requiredDays || 1) * 8;
                            project.spentHours = (project.spentDays || 0) * 8;
                        }

                        project.spentHours = Math.round((project.spentHours + hoursToAdd) * 10) / 10;
                        await this.actor.setFlag("artificer-foundry", "craftingProjects", projects);

                        const workerName = project.isHomunculus ? "Homunculus Servant" : "You";
                        const helperTextParts = [];
                        if (assistants > 0) helperTextParts.push(`${assistants} assistant${assistants > 1 ? 's' : ''}`);
                        if (isAssisting) helperTextParts.push("Homunculus Servant");
                        const helperText = helperTextParts.length > 0 ? ` (with ${helperTextParts.join(" & ")})` : '';

                        ui.notifications.info(`${workerName} contributed ${amount} ${unit}${helperText}, adding ${hoursToAdd} hours of progress to ${project.recipeName}.`);
                        this.render();
                    }
                },
                cancel: { label: "Cancel" }
            },
            default: "confirm"
        }).render(true);
    }

    async _onClaimProject(event) {
        event.preventDefault();
        const projectId = event.currentTarget.dataset.projectId;
        if (!projectId || !this.actor) return;

        const projects = this.actor.getFlag("artificer-foundry", "craftingProjects") || [];
        const projectIdx = projects.findIndex(p => p.id === projectId);
        if (projectIdx === -1) return;

        const project = projects[projectIdx];
        const isPotion = project.type === "potion";

        const pool = isPotion
            ? window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor)
            : window.ArtificerFoundry.forgeRecipeManager.getRecipesForActor(this.actor);
        const recipe = pool.find(r => r.id === project.recipeId);
        if (!recipe) { ui.notifications.error("Recipe no longer exists."); return; }

        const output = project.output;
        const plutoniumImported = await PlutoniumHelper.pImportItem(this.actor, output.name, output.quantity ?? 1);

        if (!plutoniumImported) {
            const compendiumItem = await this._findInCompendiums(output.name);
            let itemData;
            if (compendiumItem) {
                itemData = compendiumItem.toObject();
                itemData.name = output.name;
                if (output.img) itemData.img = output.img;
                if (output.quantity && itemData.system) itemData.system.quantity = output.quantity;
                delete itemData._id;
            } else {
                itemData = {
                    name: output.name,
                    type: "loot",
                    img: output.img || "icons/svg/item-bag.svg",
                    system: {
                        quantity: output.quantity ?? 1,
                        description: { value: recipe.description || "" }
                    }
                };
            }

            try {
                const getMarketPrice = (name, rarity) => {
                    const n = name.toLowerCase();
                    if (isPotion) {
                        if (n.includes("supreme healing")) return 1350;
                        if (n.includes("superior healing")) return 450;
                        if (n.includes("greater healing")) return 150;
                        if (n.includes("healing")) return 50;
                        switch (rarity) {
                            case "common": return 100;
                            case "uncommon": return 250;
                            case "rare": return 2000;
                            case "very_rare": return 20000;
                            case "legendary": return 100000;
                            case "artifact": return 500000;
                            default: return 50;
                        }
                    } else {
                        switch (rarity) {
                            case "common": return 100;
                            case "uncommon": return 400;
                            case "rare": return 2000;
                            case "very_rare": return 20000;
                            case "legendary": return 100000;
                            case "artifact": return 500000;
                            default: return 100;
                        }
                    }
                };

                if (itemData.system) {
                    if (!itemData.system.price || (itemData.system.price.value ?? 0) === 0) {
                        itemData.system.price = { value: getMarketPrice(project.recipeName, recipe.rarity), denomination: "gp" };
                    }
                    if (!itemData.system.weight) {
                        itemData.system.weight = { value: isPotion ? 0.1 : 1.0 };
                    }
                }
                await this.actor.createEmbeddedDocuments("Item", [itemData]);
            } catch (err) {
                console.error(`Artificer Foundry | Failed to create item ${output.name}. Error:`, err);
                ui.notifications.error(`Failed to claim ${output.name}. See console.`);
                return;
            }
        }

        // Ensure the item has a valid, nice image if it was created/imported with a generic one
        try {
            const genericImages = ["icons/svg/item-bag.svg", "icons/svg/mystery-man.svg", "icons/svg/combat.svg", "icons/svg/shield.svg", "icons/svg/item.svg", "icons/svg/bag.svg"];
            const createdItems = this.actor.items.filter(i => i.name === output.name);
            for (const item of createdItems) {
                if (genericImages.includes(item.img) || !item.img) {
                    await item.update({ img: output.img });
                }
            }
        } catch (e) {
            console.error("Artificer Foundry | Error updating claimed item image:", e);
        }

        // Clean from actor flags
        projects.splice(projectIdx, 1);
        await this.actor.setFlag("artificer-foundry", "craftingProjects", projects);

        await ChatMessage.create({
            content: `<p><strong>${this.actor.name}</strong> finished crafting and claimed <strong>${output.name}</strong>!</p>`,
            speaker: ChatMessage.getSpeaker({ actor: this.actor })
        });

        ui.notifications.info(`Successfully claimed ${output.name}!`);
        this.render();
    }

    async _onCancelProject(event) {
        event.preventDefault();
        const projectId = event.currentTarget.dataset.projectId;
        if (!projectId) return;

        new Dialog({
            title: "Cancel Crafting",
            content: "<p>Are you sure you want to discard this project? All committed materials will be lost.</p>",
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-trash"></i>',
                    label: "Discard",
                    callback: async () => {
                        const projects = this.actor.getFlag("artificer-foundry", "craftingProjects") || [];
                        const projectIdx = projects.findIndex(p => p.id === projectId);
                        if (projectIdx === -1) return;

                        const project = projects[projectIdx];
                        projects.splice(projectIdx, 1);
                        await this.actor.setFlag("artificer-foundry", "craftingProjects", projects);

                        ui.notifications.warn(`Cancelled crafting of ${project.recipeName}. Materials were lost.`);
                        this.render();
                    }
                },
                cancel: { label: "Keep Project" }
            },
            default: "cancel"
        }).render(true);
    }

    async _findInCompendiums(name) {
        const target = name.toLowerCase();
        for (const pack of game.packs) {
            if (pack.documentName !== "Item") continue;
            try {
                const idx = await pack.getIndex();
                const entry = idx.find(e => e.name.toLowerCase() === target);
                if (entry) return await pack.getDocument(entry._id);
            } catch { }
        }
        return null;
    }
}
