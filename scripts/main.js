import { CraftingApp } from "./crafting-app.js";
import { GathererApp } from "./gatherer-app.js";
import { ForgeApp } from "./forge-app.js";
import { MaterialsApp } from "./materials-app.js";
import { RecipeManager } from "./recipe-manager.js";
import { ForgeRecipeManager } from "./forge-recipe-manager.js";
import { loadIngredientData, getTypeLabels } from "./ingredient-data.js";
import { loadForgeData, getForgeTypeLabels } from "./forge-data.js";
import { loadPotionData } from "./potion-data.js";
import { loadItemData } from "./item-data.js";
import { GatheringPanel } from "./gathering-panel.js";
import { PartyInventory } from "./party-inventory.js";
import { loadLootTables } from "./loot-generator.js";

const MODULE    = "Artificer Foundry";
const MODULE_ID = "artificer-foundry";

// Track open app instances per actor to avoid duplicates
const _craftingApps = new Map();
const _gathererApps = new Map();
const _forgeApps = new Map();
const _materialsApps = new Map();

function openCraftingApp(actor) {
    const existing = _craftingApps.get(actor.id);
    if (existing?.element?.isConnected) { existing.bringToFront(); return; }
    const app = new CraftingApp(actor);
    _craftingApps.set(actor.id, app);
    app.render(true);
}

function openGathererApp(actor) {
    const existing = _gathererApps.get(actor.id);
    if (existing?.element?.isConnected) { existing.bringToFront(); return; }
    const app = new GathererApp(actor);
    _gathererApps.set(actor.id, app);
    app.render(true);
}

function openForgeApp(actor) {
    const existing = _forgeApps.get(actor.id);
    if (existing?.element?.isConnected) { existing.bringToFront(); return; }
    const app = new ForgeApp(actor);
    _forgeApps.set(actor.id, app);
    app.render(true);
}

function openMaterialsApp(actor) {
    const existing = _materialsApps.get(actor.id);
    if (existing?.element?.isConnected) { existing.bringToFront(); return; }
    const app = new MaterialsApp(actor);
    _materialsApps.set(actor.id, app);
    app.render(true);
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
        default: "forest"
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

    // Register the Loot Generator sidebar tab (renamed from Gathering)
    CONFIG.ui.sidebar.TABS["af-gathering"] = {
        icon: "fa-solid fa-sack",
        tooltip: "Loot Generator",
        gmOnly: true,
    };
    CONFIG.ui["af-gathering"] = GatheringPanel;

    // Register the Party Inventory sidebar tab
    CONFIG.ui.sidebar.TABS["af-party-inventory"] = {
        icon: "fa-solid fa-treasure-chest",
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
        }
        // Note: refreshPartyInventory is handled by PartyInventory.registerSocketListeners()
    });

    window.ArtificerFoundry = {
        recipeManager,
        forgeRecipeManager,
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render(true),
        showForgeApp: (actor) => new ForgeApp(actor ?? null).render(true),
        showLootGenerator: () => {
            const tab = ui.sidebar?.tabInstances?.["af-gathering"] ?? ui.sidebar?.tabs?.["af-gathering"];
            if (tab) tab.activate();
        },
        showGatheringPanel: () => {
            const tab = ui.sidebar?.tabInstances?.["af-gathering"] ?? ui.sidebar?.tabs?.["af-gathering"];
            if (tab) tab.activate();
        },
        showPartyInventory: () => {
            const tab = ui.sidebar?.tabInstances?.["af-party-inventory"] ?? ui.sidebar?.tabs?.["af-party-inventory"];
            if (tab) tab.activate();
        },
        PartyInventory,
    };

    // Document-level capture handler for the injected crafting/gatherer nav buttons.
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest?.('.af-crafting-nav-item, .af-gatherer-nav-item, .af-forge-nav-item, .af-materials-nav-item');
        if (!navItem) return;
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        const actor = navItem._af_actor;
        if (!actor || actor.documentName !== 'Actor') {
            ui.notifications.warn("No actor associated with this sheet.");
            return;
        }
        if (navItem.classList.contains('af-crafting-nav-item')) {
            console.log(`${MODULE} | Crafting tab clicked — actor:`, actor.name);
            try { openCraftingApp(actor); }
            catch (err) { console.error(`${MODULE} | Failed to open CraftingApp:`, err); }
        } else if (navItem.classList.contains('af-forge-nav-item')) {
            console.log(`${MODULE} | Forge tab clicked — actor:`, actor.name);
            try { openForgeApp(actor); }
            catch (err) { console.error(`${MODULE} | Failed to open ForgeApp:`, err); }
        } else if (navItem.classList.contains('af-materials-nav-item')) {
            console.log(`${MODULE} | Materials tab clicked — actor:`, actor.name);
            try { openMaterialsApp(actor); }
            catch (err) { console.error(`${MODULE} | Failed to open MaterialsApp:`, err); }
        } else {
            console.log(`${MODULE} | Gatherer tab clicked — actor:`, actor.name);
            try { openGathererApp(actor); }
            catch (err) { console.error(`${MODULE} | Failed to open GathererApp:`, err); }
        }
    }, true);

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
        el.querySelectorAll('.af-gather-roll-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const requestId = btn.dataset.requestId;
                const actorId = btn.dataset.actorId;
                const actor = game.actors.get(actorId);
                if (!actor) { ui.notifications.warn("Actor not found."); return; }

                // Check permission
                if (!actor.isOwner) {
                    ui.notifications.warn("You don't own this character.");
                    return;
                }

                const active = game.settings.get(MODULE_ID, "activeGatherRequests");
                const req = active[requestId];
                if (!req) { ui.notifications.warn("This gathering request has expired."); return; }

                const skillKey = req.skillKey ?? "sur";
                const skillMap = { sur: "sur", nat: "nat", arc: "arc", inv: "inv", per: "prc", med: "med" };
                const dndSkill = skillMap[skillKey] ?? "sur";

                // Roll the skill check
                let rollTotal;
                try {
                    const roll = await actor.rollSkill(dndSkill);
                    if (!roll) return; // user cancelled
                    rollTotal = roll.total;
                } catch (err) {
                    // Fallback: manual d20 roll
                    console.warn(`${MODULE} | rollSkill failed, using manual roll:`, err);
                    const roll = await new Roll("1d20").evaluate();
                    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });
                    rollTotal = roll.total;
                }

                // Disable the button after rolling
                btn.disabled = true;
                btn.innerHTML = `<i class="fas fa-check"></i> Rolled: ${rollTotal}`;

                // Send result to GM for processing
                if (game.user.isGM) {
                    await GatheringPanel.handleRollResult({ requestId, actorId, rollTotal });
                } else {
                    // Use a socket or setting to notify GM
                    // For simplicity, create a GM-whispered message with the result
                    const gmUsers = game.users.filter(u => u.isGM).map(u => u.id);
                    await ChatMessage.create({
                        content: `<div class="af-gather-result-msg" data-request-id="${requestId}" data-actor-id="${actorId}" data-roll-total="${rollTotal}">
                            <p><strong>${actor.name}</strong> rolled <strong>${rollTotal}</strong> for gathering.</p>
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
                if (requestId && actorId && !isNaN(rollTotal) && !msg.dataset.processed) {
                    msg.dataset.processed = "true";
                    GatheringPanel.handleRollResult({ requestId, actorId, rollTotal });
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

        if (root.querySelector('.af-crafting-nav-item') || root.querySelector('.af-forge-nav-item')) return;

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

        if (showAlchemy) {
            // Alchemy & Crafting tab (flask icon)
            const navItem = document.createElement('a');
            navItem.className = 'item af-crafting-nav-item';
            navItem.title = 'Alchemy & Crafting Station';
            navItem.innerHTML = `<i class="fas fa-flask"></i>`;
            navItem._af_actor = actor;
            tabsNav.appendChild(navItem);

            // Ingredient Catalog tab (leaf icon)
            const gathererItem = document.createElement('a');
            gathererItem.className = 'item af-gatherer-nav-item';
            gathererItem.title = 'Ingredient Catalog';
            gathererItem.innerHTML = `<i class="fas fa-leaf"></i>`;
            gathererItem._af_actor = actor;
            tabsNav.appendChild(gathererItem);
        }

        if (showForge) {
            // Item Forge tab (hammer/anvil icon)
            const forgeItem = document.createElement('a');
            forgeItem.className = 'item af-forge-nav-item';
            forgeItem.title = 'Item Forge';
            forgeItem.innerHTML = `<i class="fas fa-hammer"></i>`;
            forgeItem._af_actor = actor;
            tabsNav.appendChild(forgeItem);

            // Materials Catalog tab (cubes icon)
            const materialsItem = document.createElement('a');
            materialsItem.className = 'item af-materials-nav-item';
            materialsItem.title = 'Materials Catalog';
            materialsItem.innerHTML = `<i class="fas fa-cubes"></i>`;
            materialsItem._af_actor = actor;
            tabsNav.appendChild(materialsItem);
        }

    } catch (err) {
        console.error(`${MODULE} | injectCraftingTab error:`, err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS — belt-and-suspenders
// ─────────────────────────────────────────────────────────────────────────────

Hooks.on('renderApplication',   (app, html) => injectCraftingTab(app, html));
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
        icon: 'fas fa-flask',
        label: 'Crafting',
        onclick: () => openCraftingApp(actor)
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
            icon: 'fas fa-flask',
            label: 'Crafting',
            onClick: () => openCraftingApp(actor)
        });
    });
});
