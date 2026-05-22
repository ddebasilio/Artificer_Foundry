import { CraftingApp } from "./crafting-app.js";
import { GathererApp } from "./gatherer-app.js";
import { makeGatheringPanel } from "./gathering-panel.js";
import { GatheringRollDialog } from "./gathering-roll-dialog.js";
import { RecipeManager } from "./recipe-manager.js";
import { TYPE_LABELS } from "./ingredient-data.js";

let GatheringPanel;

const MODULE    = "Artificer Foundry";
const MODULE_ID = "artificer-foundry";

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

    game.settings.register(MODULE_ID, "showCraftingButton", {
        name: "Show Crafting Button",
        hint: "Display a 'Crafting' tab button on actor sheets.",
        scope: "world",
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

    Handlebars.registerHelper('eq', (a, b) => a === b);
    Handlebars.registerHelper('typeLabel', (typeCode) => TYPE_LABELS[typeCode] || typeCode);
    Handlebars.registerHelper('rarityLabel', (rarity) => {
        const labels = { common: "Common", uncommon: "Uncommon", rare: "Rare", very_rare: "Very rare", legendary: "Legendary" };
        return labels[rarity] || rarity;
    });
    Handlebars.registerHelper('gt', (a, b) => a > b);
    Handlebars.registerHelper('join', (arr, sep) => (arr || []).join(sep || ", "));

    // Register the Gathering sidebar tab (GM-only)
    try {
        GatheringPanel = makeGatheringPanel();
        CONFIG.ui['af-gathering'] = GatheringPanel;
    } catch (err) {
        console.error(`${MODULE} | Failed to register GatheringPanel sidebar tab:`, err);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// READY
// ─────────────────────────────────────────────────────────────────────────────

Hooks.once('ready', function () {
    console.log(`${MODULE} | Ready`);

    window.ArtificerFoundry = {
        recipeManager: new RecipeManager(),
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render(true)
    };

    // ── Module socket handler ─────────────────────────────────────────────────
    game.socket.on(`module.${MODULE_ID}`, async (msg) => {
        if (msg.type === 'gatherRollResult' && game.user.isGM) {
            await GatheringPanel.handleRollResult(msg);
        }
    });

    // Document-level capture handler for the injected crafting/gatherer nav buttons
    // AND the gathering roll buttons in chat messages.
    // Using capture phase (third arg = true) ensures this fires before dnd5e's
    // own tab-nav click delegation, which can otherwise swallow the event.
    document.addEventListener('click', (e) => {
        // Gathering roll button in chat
        const rollBtn = e.target.closest?.('[data-action="af-gather-roll"]');
        if (rollBtn) {
            e.stopImmediatePropagation();
            e.preventDefault();
            const { requestId, actorId } = rollBtn.dataset;
            const actor = game.actors?.get(actorId);
            if (!actor) { ui.notifications.warn("Actor not found."); return; }
            if (!actor.isOwner) { ui.notifications.warn("You don't own this character."); return; }
            // Check request is still active
            const active = game.settings.get(MODULE_ID, "activeGatherRequests");
            if (!active[requestId]) { ui.notifications.warn("This gathering request has already been fulfilled or expired."); return; }
            new GatheringRollDialog(actor, requestId).render(true);
            return;
        }

        const navItem = e.target.closest?.('.af-crafting-nav-item, .af-gatherer-nav-item');
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
            try { new CraftingApp(actor).render(true); }
            catch (err) { console.error(`${MODULE} | Failed to open CraftingApp:`, err); }
        } else {
            console.log(`${MODULE} | Gatherer tab clicked — actor:`, actor.name);
            try { new GathererApp(actor).render(true); }
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
                    // V1 path
                    const appId = parseInt(node.dataset?.appid);
                    if (appId && ui.windows?.[appId]) {
                        injectCraftingTab(ui.windows[appId], node);
                        return;
                    }
                    // V2 path — app may not yet be in foundry.applications.instances,
                    // so also try a short retry
                    _tryInjectFromNode(node, 0);
                });
            }
        }
    });

    observer.observe(interfaceEl, { childList: true, subtree: true });
    console.log(`${MODULE} | MutationObserver active on #${interfaceEl.id || interfaceEl.tagName}`);
});

function _tryInjectFromNode(node, attempt) {
    if (!node.isConnected) return;
    if (node.querySelector('.af-crafting-nav-item')) return; // already done

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
        if (!game.settings.get(MODULE_ID, "showCraftingButton")) return;

        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;

        // ── Resolve the root element ──────────────────────────────────────────
        // html can be: HTMLElement (full app), jQuery object, or content-area element.
        // We want the full .application element so the nav search works in all layouts.
        let root = htmlArg instanceof HTMLElement
            ? htmlArg
            : (htmlArg?.length ? htmlArg[0] : null);

        // Walk up to .application in case we received a content-area element
        root = root?.closest?.('.application') ?? root;

        // If that didn't yield a nav, also try app.element
        const appEl = app.element instanceof HTMLElement
            ? app.element
            : (app.element?.length ? app.element[0] : null);

        if (appEl && !root?.querySelector?.('nav.tabs, nav[data-group]')) {
            root = appEl;
        }

        if (!root) {
            return;
        }

        // Guard: only inject once per render
        if (root.querySelector('.af-crafting-nav-item')) return;

        // ── Find the tab nav ──────────────────────────────────────────────────
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
            if (tabsNav) {
                break;
            }
        }

        if (!tabsNav) {
            return;
        }

        // ── Build the nav item ────────────────────────────────────────────────
        // No data-tab → dnd5e's tab system ignores it; other tabs never go blank.
        const navItem = document.createElement('a');
        navItem.className = 'item af-crafting-nav-item';
        navItem.title = 'Alchemy & Crafting Station';
        navItem.innerHTML = `<i class="fas fa-flask"></i>`;

        // Store actor reference for the document-level capture click handler
        navItem._af_actor = actor;
        tabsNav.appendChild(navItem);

        // Gatherer tab (leaf icon)
        const gathererItem = document.createElement('a');
        gathererItem.className = 'item af-gatherer-nav-item';
        gathererItem.title = 'Ingredient Gatherer';
        gathererItem.innerHTML = `<i class="fas fa-leaf"></i>`;
        gathererItem._af_actor = actor;
        tabsNav.appendChild(gathererItem);


    } catch (err) {
        console.error(`${MODULE} | injectCraftingTab error:`, err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS — belt-and-suspenders
// renderApplication  fires for all V1 apps
// renderApplicationV2 fires for all V2 apps (Foundry v13+)
// Plus specific dnd5e class hooks as named fallbacks
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
    if (!game.settings.get(MODULE_ID, "showCraftingButton")) return;
    if (buttons.some(b => b.class === 'artificer-foundry-btn')) return;
    buttons.unshift({
        class: 'artificer-foundry-btn',
        icon: 'fas fa-flask',
        label: 'Crafting',
        onclick: () => new CraftingApp(actor).render()
    });
});

[
    'getActorSheet5eCharacter2HeaderButtons',
    'getActorSheet5eNPC2HeaderButtons',
].forEach(hookName => {
    Hooks.on(hookName, (app, buttons) => {
        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;
        if (!game.settings.get(MODULE_ID, "showCraftingButton")) return;
        if (buttons.some(b => b.action === MODULE_ID)) return;
        buttons.unshift({
            action: MODULE_ID,
            icon: 'fas fa-flask',
            label: 'Crafting',
            onClick: () => new CraftingApp(actor).render()
        });
    });
});