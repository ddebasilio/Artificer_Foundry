import { ArtificerApp } from "./artificer-app.js";
import { RecipeManager } from "./recipe-manager.js";
import { ForgeRecipeManager } from "./forge-recipe-manager.js";
import { loadIngredientData, getTypeLabels, getIngredientCosts, getBiomeIngredients } from "./ingredient-data.js";
import { loadForgeData, getForgeTypeLabels, getForgeMaterialCosts, getBiomeMaterials } from "./forge-data.js";
import { loadPotionData } from "./potion-data.js";
import { loadItemData } from "./item-data.js";
import { GatheringPanel } from "./gathering-panel.js";
import { PartyInventory } from "./party-inventory.js";
import { loadLootTables } from "./loot-generator.js";

const MODULE = "Artificer Foundry";
const MODULE_ID = "artificer-foundry";

// Track open app instances per actor to avoid duplicates
const _artificerApps = new Map();
const _gatherStates = new Map();

function openArtificerApp(actor) {
    if (!actor) return;
    actor.sheet.render(true);

    const selectTab = () => {
        const sheetEl = actor.sheet.element instanceof HTMLElement ? actor.sheet.element : actor.sheet.element?.[0];
        const tabBtn = sheetEl?.querySelector?.('.af-artificer-nav-item');
        if (tabBtn) {
            tabBtn.click();
        } else {
            setTimeout(selectTab, 50);
        }
    };
    setTimeout(selectTab, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

Hooks.once('init', function () {
    console.log(`${MODULE} | Initializing`);

    game.settings.register(MODULE_ID, "recipeData", {
        name: "Recipe Data",
        hint: "Stores recipes learned by each character.",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

    game.settings.register(MODULE_ID, "showAlchemyButton", {
        name: "Show Alchemy & Ingredients Tabs",
        hint: "Display the Alchemy and Ingredient Catalog tabs on actor sheets.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "showForgeButton", {
        name: "Show Forge & Materials Tabs",
        hint: "Display the Item Forge and Materials Catalog tabs on actor sheets.",
        scope: "client",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "potionCompendiumPack", {
        name: "Preferred Potion Compendium",
        hint: "Compendium pack ID to source crafted potion items from (e.g. 'plutonium-backend.items'). Leave blank for auto-detect.",
        scope: "world",
        config: true,
        type: String,
        default: ""
    });

    game.settings.register(MODULE_ID, "defaultBiome", {
        name: "Default Foraging Biome",
        hint: "Default biome selection for the foraging interface.",
        scope: "world",
        config: true,
        type: String,
        default: "all"
    });

    game.settings.register(MODULE_ID, "activeGatherRequests", {
        name: "Active Gather Requests",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

    game.settings.register(MODULE_ID, "forgeRecipeData", {
        name: "Forge Recipe Data",
        hint: "Stores forge blueprints learned by each character.",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

    game.settings.register(MODULE_ID, "partyInventory", {
        name: "Party Inventory",
        hint: "Shared party loot storage.",
        scope: "world",
        config: false,
        type: Object,
        default: { coins: {}, items: [] }
    });

    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('typeLabel', (typeCode) => {
        const tl = getTypeLabels();
        const fl = getForgeTypeLabels();
        return tl[typeCode] || fl[typeCode] || typeCode;
    });
    Handlebars.registerHelper('rarityLabel', (rarity) => {
        const labels = { common: "Common", uncommon: "Uncommon", rare: "Rare", very_rare: "Very rare", legendary: "Legendary" };
        return labels[rarity] || rarity;
    });
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('join', (arr, sep) => (arr || []).join(sep || ", "));
    Handlebars.registerHelper('math', (a, op, b) => {
        a = Number(a); b = Number(b);
        if (op === '+') return a + b;
        if (op === '-') return a - b;
        if (op === '*') return a * b;
        if (op === '/') return a / b;
        return a;
    });

    // Register the Loot Generator sidebar tab (renamed from Gathering)
    CONFIG.ui.sidebar.TABS["af-gathering"] = {
        icon: "fa-solid fa-gem",
        tooltip: "Loot Generator",
        gmOnly: true,
    };
    CONFIG.ui["af-gathering"] = GatheringPanel;

    // Register the Party Inventory sidebar tab
    CONFIG.ui.sidebar.TABS["af-party-inventory"] = {
        icon: "fa-solid fa-boxes-stacked",
        tooltip: "Party Inventory",
        gmOnly: false,
    };
    CONFIG.ui["af-party-inventory"] = PartyInventory;
});

// ─────────────────────────────────────────────────────────────────────────────
// READY
// ─────────────────────────────────────────────────────────────────────────────

Hooks.once('ready', async function () {
    console.log(`${MODULE} | Ready — loading data files…`);

    // Load all JSON data files
    await Promise.all([
        loadIngredientData(),
        loadForgeData(),
        loadPotionData(),
        loadItemData(),
        loadLootTables(),
    ]);

    const recipeManager = new RecipeManager();
    const forgeRecipeManager = new ForgeRecipeManager();
    await recipeManager.loadRecipes();
    await forgeRecipeManager.loadRecipes();

    console.log(`${MODULE} | Data loaded`);

    // Register party inventory socket listeners for live refresh
    PartyInventory.registerSocketListeners();

    // Socket handler — allows players to learn/forget recipes via GM proxy
    const SOCKET_NAME = `module.${MODULE_ID}`;
    game.socket.on(SOCKET_NAME, async (data) => {
        if (!game.user.isGM) return;
        if (data.action === "learnRecipe") {
            await recipeManager.learnRecipe(data.actorId, data.recipeId);
        } else if (data.action === "forgetRecipe") {
            await recipeManager.forgetRecipe(data.actorId, data.recipeId);
        } else if (data.action === "learnForgeRecipe") {
            await forgeRecipeManager.learnRecipe(data.actorId, data.recipeId);
        } else if (data.action === "forgetForgeRecipe") {
            await forgeRecipeManager.forgetRecipe(data.actorId, data.recipeId);
        } else if (data.action === "takePartyInventoryItem") {
            const realItem = game.items.get(data.itemId);
            if (realItem) {
                await realItem.delete();
            }
            await PartyInventory.removeItem(data.itemId);
        } else if (data.action === "addItemToPartyInventory") {
            await PartyInventory.addItems([{ id: data.itemId }]);
        } else if (data.action === "removeItemFromPartyInventory") {
            await PartyInventory.removeItem(data.itemId);
        } else if (data.action === "takeCoinsFromPartyInventory") {
            await PartyInventory.removeCoins(data.coinType, data.amount);
        } else if (data.action === "addCoinsToPartyInventory") {
            await PartyInventory.addCoins(data.coins);
        } else if (data.action === "setPartyInventoryCoins") {
            const inv = PartyInventory._getInventory();
            if (!inv.coins) inv.coins = {};
            inv.coins[data.coinType] = data.value;
            if (data.value <= 0) delete inv.coins[data.coinType];
            await PartyInventory._setInventory(inv);
            PartyInventory._broadcastRefresh();
        } else if (data.action === "playerAddItemToPartyInventory") {
            try {
                const folder = await PartyInventory._getOrCreatePartyLootFolder();
                const itemData = data.itemData;
                delete itemData._id;
                itemData.folder = folder.id;
                const createdWorldItem = await Item.create(itemData);
                if (createdWorldItem) {
                    await PartyInventory.addItems([{ id: createdWorldItem.id }]);
                    // GM removes the item from the player's character (atomic operation)
                    const actor = game.actors.get(data.actorId);
                    if (actor && data.embeddedItemId) {
                        try {
                            await actor.deleteEmbeddedDocuments("Item", [data.embeddedItemId]);
                        } catch (e) {
                            console.warn("Artificer Foundry | Failed to remove item from character:", e);
                        }
                    }
                    const qty = data.qty || 1;
                    const countText = qty > 1 ? `${qty}× ` : "";
                    await ChatMessage.create({
                        content: `<p><strong>${data.actorName}</strong> added <strong>${countText}${data.itemName}</strong> to the party inventory.</p>`,
                        speaker: { alias: "Party Inventory" },
                    });
                } else {
                    console.error("Artificer Foundry | Failed to create world item for party inventory");
                }
            } catch (err) {
                console.error("Artificer Foundry | Error handling playerAddItemToPartyInventory:", err);
            }
        }
    });
    // Note: refreshPartyInventory is handled by PartyInventory.registerSocketListeners()
    // Refresh crafting and forge sheets when recipe data settings change
    Hooks.on('updateSetting', (setting) => {
        if (setting.key === `${MODULE_ID}.recipeData`) {
            for (const app of _craftingApps.values()) {
                if (app?.element?.isConnected) app.render();
            }
        } else if (setting.key === `${MODULE_ID}.forgeRecipeData`) {
            for (const app of _forgeApps.values()) {
                if (app?.element?.isConnected) app.render();
            }
        }
    });

    // Refresh crafting and forge sheets when actor flags change
    Hooks.on('updateActor', (actor, changes, options, userId) => {
        const craftingApp = _craftingApps.get(actor.id);
        if (craftingApp?.element?.isConnected) craftingApp.render();
        const forgeApp = _forgeApps.get(actor.id);
        if (forgeApp?.element?.isConnected) forgeApp.render();
    });

    window.ArtificerFoundry = {
        recipeManager,
        forgeRecipeManager,
        getBiomeIngredients,
        getBiomeMaterials,
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render(true),
        showForgeApp: (actor) => new ForgeApp(actor ?? null).render(true),
        showLootGenerator: () => {
            const tab = ui["af-gathering"];
            if (tab) tab.activate();
        },
        showGatheringPanel: () => {
            const tab = ui["af-gathering"];
            if (tab) tab.activate();
        },
        showPartyInventory: () => {
            const tab = ui["af-party-inventory"];
            if (tab) tab.activate();
        },
        PartyInventory,
    };



    // MutationObserver — catches sheets opened before hooks fire
    const interfaceEl = document.querySelector('#interface') ?? document.body;

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1 || !node.classList?.contains('application')) continue;
                requestAnimationFrame(() => {
                    const appId = parseInt(node.dataset?.appid);
                    if (appId && ui.windows?.[appId]) {
                        injectCraftingTab(ui.windows[appId], node);
                        return;
                    }
                    _tryInjectFromNode(node, 0);
                });
            }
        }
    });

    observer.observe(interfaceEl, { childList: true, subtree: true });
    console.log(`${MODULE} | MutationObserver active on #${interfaceEl.id || interfaceEl.tagName}`);

    // ── Chat message roll button handler ─────────────────────────────────────
    Hooks.on('renderChatMessageHTML', (message, html) => {
        const el = html instanceof HTMLElement ? html : html?.[0] ?? html;
        if (!el) return;
        // 1. Skill check roll button handler
        el.querySelectorAll('.af-gather-roll-btn').forEach(btn => {
            const requestId = btn.dataset.requestId;
            const actorId = btn.dataset.actorId;
            const state = _gatherStates.get(requestId);

            const dc = parseInt(btn.dataset.dc || "10");
            const formula = btn.dataset.formula || "1d4";
            const skillKey = btn.dataset.skillKey || "sur";
            const gatherMode = btn.dataset.gatherMode || "ingredients";

            // Restore state on render
            if (state) {
                if (state.step === "done" || state.step === "done_check") {
                    const isSuccess = state.rollTotal >= dc || state.rollTotal === 20;
                    const suffix = isSuccess ? "(Success!)" : "(Failure)";
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-check"></i> Check: ${state.rollTotal} ${suffix}`;
                } else if (state.step === "failed") {
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-times"></i> Failed (Rolled: ${state.rollTotal})`;
                }
            }

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const actor = game.actors.get(actorId);
                if (!actor) { ui.notifications.warn("Actor not found."); return; }

                // Check permission
                if (!actor.isOwner) {
                    ui.notifications.warn("You don't own this character.");
                    return;
                }

                const skillMap = { sur: "sur", nat: "nat", arc: "arc", inv: "inv", per: "prc", med: "med" };
                const dndSkill = skillMap[skillKey] ?? "sur";

                let rollTotal;
                try {
                    // dnd5e 5.x uses { skill } object syntax
                    const result = await actor.rollSkill({ skill: dndSkill });
                    if (!result) return; // user cancelled the dialog
                    const roll = Array.isArray(result) ? result[0] : result;
                    if (!roll) return;
                    rollTotal = roll.total;
                } catch (err) {
                    console.warn(`${MODULE} | rollSkill({ skill }) failed, trying legacy:`, err);
                    try {
                        // Legacy dnd5e versions use positional args
                        const result = await actor.rollSkill(dndSkill, {});
                        if (!result) return;
                        const roll = Array.isArray(result) ? result[0] : result;
                        if (!roll) return;
                        rollTotal = roll.total;
                    } catch (err2) {
                        // Last resort: manual d20 + skill modifier
                        console.warn(`${MODULE} | rollSkill legacy also failed, using manual roll:`, err2);
                        const skillData = actor.system?.skills?.[dndSkill];
                        const mod = skillData?.total ?? skillData?.mod ?? 0;
                        const roll = await new Roll(`1d20 + ${mod}`).evaluate();
                        await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }), flavor: `Skill Check` });
                        rollTotal = roll.total;
                    }
                }

                // Verify check success against the requested DC
                const isSuccess = rollTotal >= dc || rollTotal === 20;
                const isCritFail = rollTotal === 1;

                if (isCritFail) {
                    _gatherStates.set(requestId, { rollTotal, qtyTotal: 0, step: "failed" });
                    btn.disabled = true;
                    btn.innerHTML = `<i class="fas fa-times"></i> Failed (Rolled: ${rollTotal})`;

                    if (game.user.isGM) {
                        await GatheringPanel.handleRollResult({ requestId, actorId, rollTotal, qtyTotal: 0 });
                    } else {
                        const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
                        await ChatMessage.create({
                            content: `<div class="af-gather-result-msg" data-request-id="${requestId}" data-actor-id="${actorId}" data-roll-total="${rollTotal}" data-qty-total="0">
                                <p><strong>${actor.name}</strong> rolled <strong>${rollTotal}</strong> (failed) for gathering.</p>
                            </div>`,
                            whisper: gmUsers,
                            speaker: { alias: "Artificer Foundry" },
                        });
                    }
                } else {
                    _gatherStates.set(requestId, { rollTotal, step: "done_check" });
                    btn.disabled = true;
                    const suffix = isSuccess ? "(Success!)" : "(Failure)";
                    btn.innerHTML = `<i class="fas fa-check"></i> Check: ${rollTotal} ${suffix}`;

                    // Generate a separate chat card whispered to the player to roll their yield
                    const checkStatusHtml = isSuccess 
                        ? `<p><i class="fas fa-check-circle" style="color: green;"></i> <strong>Gathering Success!</strong></p>` 
                        : `<p><i class="fas fa-exclamation-triangle" style="color: #ff9800;"></i> <strong>Check failed</strong>, but you still gather what you can (rarity reduced).</p>`;

                    const content = `
                        <div class="af-gather-yield-request">
                            ${checkStatusHtml}
                            <p>Click below to roll the yield formula to see what you find.</p>
                            <button 
                                data-action="af-gather-yield-roll" 
                                data-request-id="${requestId}" 
                                data-actor-id="${actorId}" 
                                data-roll-total="${rollTotal}" 
                                data-dc="${dc}" 
                                data-formula="${formula}" 
                                data-gather-mode="${gatherMode}" 
                                class="af-gather-yield-roll-btn">
                                <i class="fas fa-dice-six"></i> Roll Yield (${formula})
                            </button>
                        </div>`;
                    await ChatMessage.create({
                        content,
                        whisper: [game.user.id],
                        speaker: { alias: "Artificer Foundry" }
                    });
                }
            });
        });

        // 2. Yield roll button handler (on the separate success card)
        el.querySelectorAll('.af-gather-yield-roll-btn').forEach(btn => {
            const requestId = btn.dataset.requestId;
            const actorId = btn.dataset.actorId;
            const state = _gatherStates.get(requestId);

            const rollTotal = parseInt(btn.dataset.rollTotal || "0");
            const formula = btn.dataset.formula || "1d4";
            const gatherMode = btn.dataset.gatherMode || "ingredients";

            // Restore state on render
            if (state && state.step === "done") {
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-check"></i> Yield Rolled: ${state.qtyTotal}`;
            }

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const actor = game.actors.get(actorId);
                if (!actor) { ui.notifications.warn("Actor not found."); return; }

                if (!actor.isOwner) {
                    ui.notifications.warn("You don't own this character.");
                    return;
                }

                btn.disabled = true;

                // Roll the quantity yield formula using standard Foundry VTT Roll
                let qtyTotal = 1;
                try {
                    const qtyRoll = await new Roll(formula).evaluate();
                    const modeLabel = gatherMode === "materials" ? "Forge Materials" : "Ingredients";
                    await qtyRoll.toMessage({
                        speaker: ChatMessage.getSpeaker({ actor }),
                        flavor: `Gathering Yield: ${modeLabel} (${formula})`
                    });
                    qtyTotal = qtyRoll.total;
                } catch (errQty) {
                    console.error("Artificer Foundry | Quantity roll failed:", errQty);
                }

                _gatherStates.set(requestId, { rollTotal, qtyTotal, step: "done" });
                btn.innerHTML = `<i class="fas fa-check"></i> Yield Rolled: ${qtyTotal}`;

                // Send result to GM for processing
                if (game.user.isGM) {
                    await GatheringPanel.handleRollResult({ requestId, actorId, rollTotal, qtyTotal });
                } else {
                    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
                    await ChatMessage.create({
                        content: `<div class="af-gather-result-msg" data-request-id="${requestId}" data-actor-id="${actorId}" data-roll-total="${rollTotal}" data-qty-total="${qtyTotal}">
                            <p><strong>${actor.name}</strong> rolled <strong>${rollTotal}</strong> (yield: <strong>${qtyTotal}</strong>) for gathering.</p>
                        </div>`,
                        whisper: gmUsers,
                        speaker: { alias: "Artificer Foundry" },
                    });
                }
            });
        });

        // Handle GM-side result processing from player messages
        if (game.user.isGM) {
            el.querySelectorAll('.af-gather-result-msg').forEach(msg => {
                const requestId = msg.dataset.requestId;
                const actorId = msg.dataset.actorId;
                const rollTotal = parseInt(msg.dataset.rollTotal);
                const qtyTotal = parseInt(msg.dataset.qtyTotal || "0");
                if (requestId && actorId && !isNaN(rollTotal) && !msg.dataset.processed) {
                    msg.dataset.processed = "true";
                    GatheringPanel.handleRollResult({ requestId, actorId, rollTotal, qtyTotal });
                }
            });
        }
    });
});

function _tryInjectFromNode(node, attempt) {
    if (!node.isConnected) return;
    if (node.querySelector('.af-crafting-nav-item') && node.querySelector('.af-forge-nav-item') && node.querySelector('.af-materials-nav-item')) return;

    if (foundry.applications?.instances) {
        for (const app of foundry.applications.instances.values()) {
            const el = app.element instanceof HTMLElement ? app.element : app.element?.[0];
            if (el === node || app.id === node.id) {
                injectCraftingTab(app, node);
                return;
            }
        }
    }

    if (attempt < 15) setTimeout(() => _tryInjectFromNode(node, attempt + 1), 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB INJECTION
// ─────────────────────────────────────────────────────────────────────────────

function injectCraftingTab(app, htmlArg) {
    try {
        const showAlchemy = game.settings.get(MODULE_ID, "showAlchemyButton");
        const showForge = game.settings.get(MODULE_ID, "showForgeButton");
        if (!showAlchemy && !showForge) return;

        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;

        let root = htmlArg instanceof HTMLElement
            ? htmlArg
            : (htmlArg?.length ? htmlArg[0] : null);

        root = root?.closest?.('.application') ?? root;

        const appEl = app.element instanceof HTMLElement
            ? app.element
            : (app.element?.length ? app.element[0] : null);

        if (appEl && !root?.querySelector?.('nav.tabs, nav[data-group]')) {
            root = appEl;
        }

        if (!root) return;

        if (root.querySelector('.af-artificer-nav-item')) return;

        const NAV_SELECTORS = [
            'nav.tabs[data-group="primary"]',
            'nav[data-group="primary"]',
            'nav[data-tabs="primary"]',
            'nav.tabs.tabs-primary',
            'nav.primary-tabs',
            'nav.sheet-navigation',
            'nav.sheet-tabs',
            'nav.tabs',
        ];

        let tabsNav = null;
        for (const sel of NAV_SELECTORS) {
            tabsNav = root.querySelector(sel);
            if (tabsNav) break;
        }

        if (!tabsNav) return;

        // Check if Artificer Lab is the tracked active tab
        let isTabActive = false;
        if (app.tabGroups?.primary === "artificer-lab") {
            isTabActive = true;
        } else if (Array.isArray(app._tabs)) {
            for (const t of app._tabs) {
                if (t.group === 'primary' && t.active === 'artificer-lab') {
                    isTabActive = true;
                    break;
                }
            }
        }

        // Injected tab button (mortar & pestle / tools icon)
        const navItem = document.createElement('a');
        navItem.className = 'item af-artificer-nav-item';
        navItem.dataset.tab = 'artificer-lab';
        navItem.title = 'Artificer Lab';
        navItem._af_actor = actor;

        if (isTabActive) {
            navItem.classList.add('active');
            navItem.ariaSelected = "true";
        }

        const firstLink = tabsNav.querySelector('a.item, a[data-tab]');
        if (firstLink) {
            const hasLabel = firstLink.querySelector('label') !== null;
            const tooltip = firstLink.dataset.tooltip || firstLink.getAttribute('data-tooltip');
            const hasVisibleText = firstLink.textContent.trim().length > 0;

            if (hasLabel) {
                navItem.innerHTML = `<i class="fas fa-tools"></i>`;
            } else if (tooltip && !hasVisibleText) {
                // Icon-only tab with tooltip (V2 sheets)
                navItem.innerHTML = `<i class="fas fa-tools"></i>`;
                navItem.dataset.tooltip = 'Artificer Lab';
                navItem.setAttribute('aria-label', 'Artificer Lab');
            } else {
                navItem.innerHTML = `<i class="fas fa-tools"></i>`;
            }
        } else {
            navItem.innerHTML = `<i class="fas fa-tools"></i>`;
        }
        tabsNav.appendChild(navItem);

        // Inject the tab content body
        const tabBody = root.querySelector('.tab-body, .sheet-body, form, .sheet-content');
        if (tabBody) {
            let labTab = tabBody.querySelector('.artificer-lab-tab');
            if (!labTab) {
                const featuresTab = root.querySelector('[data-tab="features"], [data-tab="biography"], [data-tab="description"]');
                if (featuresTab) {
                    const parent = featuresTab.parentElement;
                    labTab = document.createElement('div');
                    labTab.className = 'tab artificer-lab-tab';
                    labTab.dataset.group = 'primary';
                    labTab.dataset.tab = 'artificer-lab';
                    parent.appendChild(labTab);
                } else {
                    labTab = document.createElement('div');
                    labTab.className = 'tab artificer-lab-tab';
                    labTab.dataset.group = 'primary';
                    labTab.dataset.tab = 'artificer-lab';
                    tabBody.appendChild(labTab);
                }
            }

            // Sync visibility based on active state
            if (isTabActive) {
                // Deactivate other tabs
                tabsNav.querySelectorAll('.item').forEach(item => {
                    if (item !== navItem) {
                        item.classList.remove('active');
                        item.ariaSelected = "false";
                    }
                });

                // Hide other tab content containers
                tabBody.querySelectorAll('.tab').forEach(tab => {
                    if (tab !== labTab) {
                        tab.classList.remove('active');
                        tab.style.display = 'none';
                    }
                });

                labTab.classList.add('active');
                labTab.style.display = 'block';
            } else {
                labTab.classList.remove('active');
                labTab.style.display = 'none';
            }

            // Click listener for our tab button
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Persist the active tab group state in Foundry's sheet tracker
                if (app.tabGroups) {
                    app.tabGroups.primary = "artificer-lab";
                }
                if (Array.isArray(app._tabs)) {
                    for (const t of app._tabs) {
                        if (t.group === 'primary') {
                            t.active = 'artificer-lab';
                        }
                    }
                }

                // Deactivate other tabs
                tabsNav.querySelectorAll('.item').forEach(item => {
                    if (item !== navItem) {
                        item.classList.remove('active');
                        item.ariaSelected = "false";
                    }
                });

                // Activate our tab button
                navItem.classList.add('active');
                navItem.ariaSelected = "true";

                // Toggle visibility of content tabs
                tabBody.querySelectorAll('.tab').forEach(tab => {
                    if (tab === labTab) {
                        tab.classList.add('active');
                        tab.style.display = 'block';
                    } else {
                        tab.classList.remove('active');
                        tab.style.display = 'none';
                    }
                });

                // Force render on switch to ensure freshness
                let appInstance = _artificerApps.get(actor.id);
                if (appInstance) {
                    appInstance.renderInline(labTab);
                }
            });

            // Listen to other native tab clicks to hide our lab view
            tabsNav.querySelectorAll('.item').forEach(item => {
                if (item !== navItem) {
                    item.addEventListener('click', () => {
                        // Reset active tracker when navigating away
                        if (app.tabGroups && app.tabGroups.primary === "artificer-lab") {
                            app.tabGroups.primary = item.dataset.tab;
                        }
                        if (Array.isArray(app._tabs)) {
                            for (const t of app._tabs) {
                                if (t.group === 'primary' && t.active === 'artificer-lab') {
                                    t.active = item.dataset.tab;
                                }
                            }
                        }

                        navItem.classList.remove('active');
                        navItem.ariaSelected = "false";
                        labTab.classList.remove('active');
                        labTab.style.display = 'none';

                        tabBody.querySelectorAll('.tab').forEach(tab => {
                            if (tab !== labTab && tab.dataset.tab === item.dataset.tab) {
                                tab.classList.add('active');
                                tab.style.display = '';
                            }
                        });
                    });
                }
            });

            // Render the app inline
            let appInstance = _artificerApps.get(actor.id);
            if (!appInstance) {
                appInstance = new ArtificerApp(actor);
                _artificerApps.set(actor.id, appInstance);
            }
            appInstance.renderInline(labTab);
        }

    } catch (err) {
        console.error(`${MODULE} | injectCraftingTab error:`, err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS — belt-and-suspenders
// ─────────────────────────────────────────────────────────────────────────────

Hooks.on('renderApplication', (app, html) => injectCraftingTab(app, html));
Hooks.on('renderApplicationV2', (app, html) => injectCraftingTab(app, html));

[
    'renderActorSheet',
    'renderActorSheet5eCharacter2',
    'renderActorSheet5eNPC2',
    'renderActorSheet5eVehicle2',
    'renderCharacterSheet5e',
    'renderNPCSheet5e',
].forEach(hookName => Hooks.on(hookName, (app, html) => injectCraftingTab(app, html)));

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK HEADER BUTTONS (V1 + V2 dnd5e)
// ─────────────────────────────────────────────────────────────────────────────

Hooks.on('getActorSheetHeaderButtons', (app, buttons) => {
    const actor = app.document ?? app.object ?? app.actor;
    if (!actor || actor.documentName !== 'Actor') return;
    if (!game.settings.get(MODULE_ID, "showAlchemyButton") && !game.settings.get(MODULE_ID, "showForgeButton")) return;
    if (buttons.some(b => b.class === 'artificer-foundry-btn')) return;
    buttons.unshift({
        class: 'artificer-foundry-btn',
        icon: 'fas fa-tools',
        label: 'Artificer Lab',
        onclick: () => openArtificerApp(actor)
    });
});

[
    'getActorSheet5eCharacter2HeaderButtons',
    'getActorSheet5eNPC2HeaderButtons',
].forEach(hookName => {
    Hooks.on(hookName, (app, buttons) => {
        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;
        if (!game.settings.get(MODULE_ID, "showAlchemyButton") && !game.settings.get(MODULE_ID, "showForgeButton")) return;
        if (buttons.some(b => b.action === MODULE_ID)) return;
        buttons.unshift({
            action: MODULE_ID,
            icon: 'fas fa-tools',
            label: 'Artificer Lab',
            onClick: () => openArtificerApp(actor)
        });
    });
});

// Automatically merge duplicate loot/consumable items in actor sheets on creation
Hooks.on("preCreateItem", (itemDoc, data, options, userId) => {
    const actor = itemDoc.parent;
    if (!actor) return true;

    // We only stack "loot" (ingredients/materials) and "consumable" (potions) items
    if (!["loot", "consumable"].includes(itemDoc.type)) return true;

    // Don't treat the bag itself as a stackable component
    if (itemDoc.name === "Artificer's Component Bag") return true;

    const existing = actor.items.find(i => i.name === itemDoc.name && i.type === itemDoc.type);
    if (existing) {
        const currentQty = existing.system.quantity ?? 1;
        const addedQty = itemDoc.system.quantity ?? 1;
        const newQty = currentQty + addedQty;

        existing.update({ "system.quantity": newQty }).then(() => {
            console.log(`Artificer Foundry | Merged duplicate item ${itemDoc.name} into existing stack. New quantity: ${newQty}`);
        });

        return false; // cancels the creation of the duplicate item document
    }

    // Put new loot items in the Artificer's Component Bag if the bag exists and it's a valid crafting ingredient or material
    if (itemDoc.type === "loot") {
        const ingCosts = typeof getIngredientCosts === "function" ? getIngredientCosts() : {};
        const forgeCosts = typeof getForgeMaterialCosts === "function" ? getForgeMaterialCosts() : {};
        const isComponent = ingCosts[itemDoc.name] !== undefined || forgeCosts[itemDoc.name] !== undefined;

        if (isComponent) {
            const bag = actor.items.find(i =>
                i.name === "Artificer's Component Bag" &&
                ["container", "backpack"].includes(i.type)
            );
            if (bag) {
                itemDoc.updateSource({ "system.container": bag.id });
            }
        }
    }
    return true;
});
