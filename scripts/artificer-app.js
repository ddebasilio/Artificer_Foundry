const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
import { 
    getIngredientIcon, getTypeLabels, getIngredientCosts, getSubstitutes, 
    getCraftingTime, formatCraftingTime, getBiomeIngredients
} from "./ingredient-data.js";
import { 
    getForgeMaterialIcon, getForgeTypeLabels, getForgeMaterialCosts, getForgeSubstitutes, 
    getForgeCraftingTime, formatForgeCraftingTime, canForgeSubstitute, addForgeMaterialToActor, getBiomeMaterials
} from "./forge-data.js";
import { PlutoniumHelper } from "./plutonium-helper.js";

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
        this.catalogFilterType = "all";
        this._draggedIngredient = null;
        this._duplicatesMerged = false;
    }

    static DEFAULT_OPTIONS = {
        window: { title: "Artificer Lab", icon: "fas fa-cogs", resizable: true },
        classes: ["artificer-foundry", "artificer-app"],
        position: { width: 1200, height: 820 },
    };

    static PARTS = {
        lab: { template: "modules/artificer-foundry/templates/artificer-app.hbs" }
    };

    async _mergeActorDuplicates() {
        if (!this.actor || !this.actor.isOwner) return;
        const items = this.actor.items?.contents ?? [];
        const duplicates = {};
        
        for (const item of items) {
            if (!["loot", "consumable"].includes(item.type)) continue;
            const key = `${item.name.toLowerCase()}_${item.type}`;
            if (!duplicates[key]) {
                duplicates[key] = [];
            }
            duplicates[key].push(item);
        }

        const updates = [];
        const deletes = [];

        const ingCosts = typeof getIngredientCosts === "function" ? getIngredientCosts() : {};
        const forgeCosts = typeof getForgeMaterialCosts === "function" ? getForgeMaterialCosts() : {};

        for (const [key, list] of Object.entries(duplicates)) {
            const firstItem = list[0];
            const isLoot = firstItem.type === "loot";
            
            // Check if we need to update the price of this stack (if it has no price, set it)
            let priceUpdateNeeded = false;
            let currentPriceValue = firstItem.system?.price?.value ?? 0;
            if (isLoot && currentPriceValue === 0) {
                const name = firstItem.name;
                const standardPrice = ingCosts[name] || forgeCosts[name] || 0;
                if (standardPrice > 0) {
                    currentPriceValue = standardPrice;
                    priceUpdateNeeded = true;
                }
            }

            if (list.length > 1) {
                // Keep the first item, sum all quantities, delete the rest
                let totalQty = 0;
                for (const item of list) {
                    totalQty += item.system.quantity ?? 1;
                }
                
                const updateData = { _id: firstItem.id, "system.quantity": totalQty };
                if (priceUpdateNeeded) {
                    updateData["system.price"] = { value: currentPriceValue, denomination: "gp" };
                }
                updates.push(updateData);
                
                for (let i = 1; i < list.length; i++) {
                    deletes.push(list[i].id);
                }
            } else if (priceUpdateNeeded) {
                // Just update the price for this single item
                updates.push({
                    _id: firstItem.id,
                    "system.price": { value: currentPriceValue, denomination: "gp" }
                });
            }
        }

        if (updates.length > 0) {
            await this.actor.updateEmbeddedDocuments("Item", updates);
        }
        if (deletes.length > 0) {
            await this.actor.deleteEmbeddedDocuments("Item", deletes);
        }
    }

    _isAlchemist() {
        if (!this.actor) return false;
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && (name.includes("alchemist") || name.includes("alchemy"))) return true;
            if (name.includes("tool proficiency") && name.includes("alchemist")) return true;
            return false;
        });
    }

    _isSmith() {
        if (!this.actor) return false;
        const items = this.actor.items?.contents ?? [];
        return items.some(i => {
            const name = (i.name ?? "").toLowerCase();
            const type = i.type ?? "";
            if (type === "subclass" && (name.includes("armorer") || name.includes("battlesmith") || name.includes("battle smith"))) return true;
            if (name.includes("tool proficiency") && name.includes("smith")) return true;
            return false;
        });
    }

    async _prepareContext(options) {
        if (!this._duplicatesMerged) {
            this._duplicatesMerged = true;
            this._mergeActorDuplicates().catch(err => {
                console.error("Artificer Foundry | Error merging duplicate actor items on load:", err);
            });
        }

        const isAlchemist = this._isAlchemist();
        const isSmith = this._isSmith();

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
                    return {
                        id: item.id,
                        name: item.name,
                        img: item.img,
                        quantity: item.system?.quantity ?? 1,
                        uuid: item.uuid,
                        rarity
                    };
                });

            if (this.inventoryRecipeFilter && this.selectedRecipeId) {
                inventoryItems = inventoryItems.filter(item => matchNames.has(item.name.toLowerCase()));
            }
        }

        // 2. Fetch Selected Recipe details
        let selectedRecipe = null;
        let mappedIngredients = [];
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
            const ct = getCraftingTime(r.rarity, isAlchemist, isHealingPotion);
            
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
            const ct = getForgeCraftingTime(r.rarity, isSmith);
            
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
                const ct = isPotion 
                    ? getCraftingTime(selectedRecipe.rarity, isAlchemist, isHealing)
                    : getForgeCraftingTime(selectedRecipe.rarity, isSmith);

                selectedRecipe = {
                    ...selectedRecipe,
                    craftingTimeLabel: isPotion ? formatCraftingTime(ct.days) : formatForgeCraftingTime(ct.days),
                    craftingCost: ct.cost,
                    recipeType: this.selectedRecipeType
                };

                const totalIngredients = selectedRecipe.ingredients.length;
                mappedIngredients = selectedRecipe.ingredients.map((ing, idx) => {
                    const entry = this.providedIngredients[ing.name];
                    const provided = entry && typeof entry === "object" ? entry.provided : (entry || 0);
                    const icon = (provided > 0 && entry?.img) 
                        ? entry.img 
                        : (isPotion ? getIngredientIcon(ing.name, ing.type) : getForgeMaterialIcon(ing.name, ing.type));
                    const displayName = (provided > 0 && entry?.name) ? entry.name : ing.name;

                    const typeLabel = isPotion 
                        ? (getTypeLabels()[ing.type] || ing.type) 
                        : (getForgeTypeLabels()[ing.type] || ing.type);
                    const subs = isPotion 
                        ? getSubstitutes(ing.name, selectedRecipe.rarity) 
                        : getForgeSubstitutes(ing.name, selectedRecipe.rarity);

                    // Slots coordinates calculation
                    const angle = (idx / totalIngredients) * 2 * Math.PI - Math.PI / 2;
                    const radius = 35; // Radius percentage inside the cauldron/forge circle
                    const top = 50 + Math.sin(angle) * radius;
                    const left = 50 + Math.cos(angle) * radius;
                    const slotStyle = `top: ${top}%; left: ${left}%; transform: translate(-50%, -50%);`;

                    const direct = actorInventory[ing.name.toLowerCase()] || 0;
                    let subsQty = 0;
                    for (const s of subs) {
                        subsQty += actorInventory[s.toLowerCase()] || 0;
                    }

                    const tier = getItemTier(ing.name);
                    const rarity = getRarityFromTier(tier);

                    return {
                        ...ing,
                        displayName,
                        provided,
                        fulfilled: provided >= ing.quantity,
                        icon,
                        typeLabel,
                        substitutes: subs,
                        slotStyle,
                        inventoryCount: direct + subsQty,
                        rarity
                    };
                });

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

        const canCraft = selectedRecipe?.isLearned && 
            mappedIngredients.length > 0 && 
            mappedIngredients.every(i => i.fulfilled) && 
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
        const projects = (this.actor?.getFlag("artificer-foundry", "craftingProjects") || [])
            .map(p => {
                const reqHours = p.requiredHours !== undefined ? p.requiredHours : (p.requiredDays || 1) * 8;
                const spentHours = p.spentHours !== undefined ? p.spentHours : (p.spentDays || 0) * 8;
                const progress = Math.min(100, Math.floor((spentHours / reqHours) * 100));
                const completed = spentHours >= reqHours;
                return {
                    ...p,
                    requiredHours: reqHours,
                    spentHours: spentHours,
                    progress,
                    completed,
                    isPotion: p.type === "potion"
                };
            });

        return {
            actor: this.actor,
            inventoryItems,
            selectedRecipe,
            mappedIngredients,
            isManyIngredients: mappedIngredients.length > 4,
            canCraft,
            crafting: this._crafting,
            projects,
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
            isSmith
        };
    }

    _onRender(context, options) {
        const el = this.element;

        // --- Recipe Type Tab Switching ---
        el.querySelectorAll('.recipe-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeRecipeTab = btn.dataset.tab;
                this.render();
            });
        });

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
                const detailEl = el.querySelector('.inventory-hover-detail');
                if (detailEl) detailEl.textContent = name;
            });
            slot.addEventListener('mouseleave', () => {
                const detailEl = el.querySelector('.inventory-hover-detail');
                if (detailEl) detailEl.textContent = "Select an Ingredient";
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
                el.querySelector('.workstation-scene')?.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', () => el.querySelector('.workstation-scene')?.classList.remove('drag-over'));
            zone.addEventListener('drop', e => this._onDropOnWorkstation(e));
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
                    stationSlot.classList.add('valid-drag-over');
                    stationSlot.classList.remove('invalid-drag-over');
                } else {
                    // Block drop by not calling e.preventDefault()
                    stationSlot.classList.add('invalid-drag-over');
                    stationSlot.classList.remove('valid-drag-over');
                }
            });
            stationSlot.addEventListener('dragleave', () => {
                stationSlot.classList.remove('valid-drag-over', 'invalid-drag-over');
            });
        });

        el.querySelectorAll('.remove-ingredient-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault(); e.stopPropagation();
                delete this.providedIngredients[btn.dataset.ingredientName];
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
        if (type === "alchemy") {
            await window.ArtificerFoundry.recipeManager.forgetRecipe(this.actor, recipeId);
        } else {
            await window.ArtificerFoundry.forgeRecipeManager.forgetRecipe(this.actor, recipeId);
        }
        ui.notifications.info(`${this.actor.name} has forgotten a recipe.`);
        this.render();
    }

    async _onDropOnWorkstation(event) {
        event.preventDefault();
        event.stopPropagation();
        const el = this.element;
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
            const targetSlotName = slotEl ? slotEl.dataset.ingredientName : null;

            // Drop ingredient
            if (data.type === "Item") {
                if (data.name && data.img) {
                    this._stageIngredientByName(data.name, data.img, targetSlotName);
                } else if (data.uuid) {
                    const item = await fromUuid(data.uuid);
                    if (item?.parent?.id !== this.actor?.id) {
                        ui.notifications.warn("You can only use items from your own inventory.");
                        return;
                    }
                    this._stageIngredientByName(item.name, item.img, targetSlotName);
                }
            }
        } catch (err) {
            console.error("Artificer Foundry | Drop error:", err);
        }
    }

    _stageIngredientByName(name, img, targetSlotName) {
        if (!this.selectedRecipeId) { ui.notifications.warn("Select or drag a recipe to the workstation first."); return; }
        
        const isPotion = this.selectedRecipeType === "alchemy";
        const pool = isPotion 
            ? window.ArtificerFoundry.recipeManager.getRecipesForActor(this.actor)
            : window.ArtificerFoundry.forgeRecipeManager.getRecipesForActor(this.actor);
        const recipe = pool.find(r => r.id === this.selectedRecipeId);
        if (!recipe) return;

        const getProvided = (ingName) => {
            const entry = this.providedIngredients[ingName];
            return entry && typeof entry === "object" ? entry.provided : (entry || 0);
        };

        const isSatisfied = (ing) => getProvided(ing.name) >= ing.quantity;
        const isExact = (ing) => name.toLowerCase() === ing.name.toLowerCase();
        const isSub = (ing) => isPotion 
            ? getSubstitutes(ing.name, recipe.rarity).some(s => s.toLowerCase() === name.toLowerCase())
            : getForgeSubstitutes(ing.name, recipe.rarity).some(s => s.toLowerCase() === name.toLowerCase());

        let required = null;
        if (targetSlotName) {
            const ing = recipe.ingredients.find(i => i.name.toLowerCase() === targetSlotName.toLowerCase());
            if (ing && (isExact(ing) || isSub(ing))) {
                required = ing;
            } else {
                ui.notifications.warn(`"${name}" cannot be used for "${targetSlotName}".`);
                return;
            }
        } else {
            // General drop fallback, find first matching unsatisfied slot
            required =
                recipe.ingredients.find(i => isExact(i) && !isSatisfied(i)) ||
                recipe.ingredients.find(i => isSub(i) && !isSatisfied(i)) ||
                recipe.ingredients.find(i => isExact(i)) ||
                recipe.ingredients.find(i => isSub(i));
        }

        if (!required) {
            ui.notifications.warn(`"${name}" is not needed for this recipe.`);
            return;
        }

        const totalInInventory = (this.actor?.items?.contents ?? [])
            .filter(i => i.type === "loot" && i.name.toLowerCase() === name.toLowerCase())
            .reduce((sum, i) => sum + (i.system?.quantity ?? 1), 0);

        const already = getProvided(required.name);
        const maxCanCommit = Math.min(required.quantity, totalInInventory);
        if (already >= maxCanCommit) {
            ui.notifications.info(`Already have enough staged for "${required.name}".`);
            return;
        }

        this.providedIngredients[required.name] = {
            provided: maxCanCommit,
            name: name,
            img: img || ""
        };
        
        ui.notifications.info(`Added ${name} to "${required.name}" workstation slot.`);
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

        const getProvided = (ingName) => {
            const entry = this.providedIngredients[ingName];
            return entry && typeof entry === "object" ? entry.provided : (entry || 0);
        };

        // 1. Verify staged slots are satisfied (at least 1 base recipe complete)
        for (const ing of recipe.ingredients) {
            if (getProvided(ing.name) < ing.quantity) {
                ui.notifications.error(`First stage enough materials for at least one recipe batch of "${ing.name}".`);
                return;
            }
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
        for (const ing of recipe.ingredients) {
            const entry = this.providedIngredients[ing.name];
            const stagedName = (entry && typeof entry === "object" && entry.name) ? entry.name : ing.name;

            let remaining = ing.quantity * quantity;
            
            // A. Consume staged items first (which were specifically dragged/selected)
            const matchingStaged = this.actor.items.filter(i => i.type === "loot" && 
                i.name.toLowerCase() === stagedName.toLowerCase()
            );
            for (const actorItem of matchingStaged) {
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

            // B. Consume original items next
            if (remaining > 0) {
                const matchingOriginal = this.actor.items.filter(i => i.type === "loot" && 
                    i.name.toLowerCase() === ing.name.toLowerCase()
                );
                for (const actorItem of matchingOriginal) {
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

            // C. Consume eligible substitutes
            if (remaining > 0) {
                const subs = isPotion 
                    ? getSubstitutes(ing.name, recipe.rarity) 
                    : getForgeSubstitutes(ing.name, recipe.rarity);
                
                for (const subName of subs) {
                    if (remaining <= 0) break;
                    const matchingSub = this.actor.items.filter(i => i.type === "loot" && 
                        i.name.toLowerCase() === subName.toLowerCase()
                    );
                    for (const actorItem of matchingSub) {
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
            }
        }

        // Get crafting times
        let requiredDays, requiredHours;
        if (isPotion) {
            const isHealingPotion = /healing/i.test(recipe.name);
            const ct = getCraftingTime(recipe.rarity, this._isAlchemist(), isHealingPotion);
            requiredDays = ct.days; // Brewing multiple potions in same cauldron takes NO extra time!
            requiredHours = requiredDays * 8;
        } else {
            const ct = getForgeCraftingTime(recipe.rarity, this._isSmith());
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
                name: recipe.output.name,
                img: recipe.output.img || "icons/svg/item-bag.svg",
                quantity: (recipe.output.quantity ?? 1) * quantity
            },
            requiredDays,
            requiredHours,
            spentHours: 0,
            dateStarted: new Date().toLocaleDateString()
        };
        projects.push(newProject);
        await this.actor.setFlag("artificer-foundry", "craftingProjects", projects);

        ui.notifications.info(`Started crafting ${quantity}x ${recipe.name}! Project added to queue.`);
        
        this.providedIngredients = {};
        this.craftQuantity = 1;
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
                </form>
            `,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-hourglass-half"></i>',
                    label: "Contribute",
                    callback: async (html) => {
                        const amount = parseFloat(html.find('[name="amount"]').val() || 0);
                        const unit = html.find('[name="unit"]').val();
                        if (amount <= 0 || isNaN(amount)) return;
                        
                        const hoursToAdd = unit === "days" ? amount * 8 : amount;
                        const projects = this.actor.getFlag("artificer-foundry", "craftingProjects") || [];
                        const project = projects.find(p => p.id === projectId);
                        if (!project) return;
                        
                        // Migrate legacy project fields
                        if (project.requiredHours === undefined) {
                            project.requiredHours = (project.requiredDays || 1) * 8;
                            project.spentHours = (project.spentDays || 0) * 8;
                        }
                        
                        project.spentHours = Math.round((project.spentHours + hoursToAdd) * 10) / 10;
                        await this.actor.setFlag("artificer-foundry", "craftingProjects", projects);
                        
                        ui.notifications.info(`Contributed ${amount} ${unit} (${hoursToAdd} hours) to ${project.recipeName}.`);
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

        const output = recipe.output;
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
                            default: return 50;
                        }
                    } else {
                        switch (rarity) {
                            case "common": return 100;
                            case "uncommon": return 400;
                            case "rare": return 2000;
                            case "very_rare": return 20000;
                            case "legendary": return 100000;
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
            } catch {}
        }
        return null;
    }
}
