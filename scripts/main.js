import { CraftingApp } from "./crafting-app.js";
import { RecipeManager } from "./recipe-manager.js";

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
        hint: "Display the 'Crafting' tab button on actor sheets.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    Handlebars.registerHelper('eq', (a, b) => a === b);
});

// ─────────────────────────────────────────────────────────────────────────────
// READY
// ─────────────────────────────────────────────────────────────────────────────

Hooks.once('ready', function () {
    console.log(`${MODULE} | Ready`);

    window.ArtificerFoundry = {
        recipeManager: new RecipeManager(),
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render()
    };

    // Watch #interface (and all descendants) for .application nodes being added.
    const interfaceEl = document.querySelector('#interface') ?? document.body;

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1 || !node.classList?.contains('application')) continue;
                requestAnimationFrame(() => _handleNewSheet(node, 0));
            }
        }
    });

    observer.observe(interfaceEl, { childList: true, subtree: true });
    console.log(`${MODULE} | MutationObserver active on #${interfaceEl.id || interfaceEl.tagName}`);

    // Also scan any sheets that are already open when the module loads.
    setTimeout(_scanOpenSheets, 500);
});

// ─────────────────────────────────────────────────────────────────────────────
// SCAN ALREADY-OPEN SHEETS
// ─────────────────────────────────────────────────────────────────────────────

function _scanOpenSheets() {
    // V2
    if (foundry.applications?.instances) {
        for (const app of foundry.applications.instances.values()) {
            const actor = app.document ?? app.object ?? app.actor;
            if (!actor || actor.documentName !== 'Actor') continue;
            const node = app.element instanceof HTMLElement ? app.element : null;
            if (node) injectCraftingButton(app, node, actor);
        }
    }
    // V1
    for (const app of Object.values(ui.windows ?? {})) {
        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') continue;
        const node = app.element instanceof HTMLElement ? app.element : app.element?.[0];
        if (node) injectCraftingButton(app, node, actor);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FIND THE APP OBJECT FROM A DOM NODE
// ─────────────────────────────────────────────────────────────────────────────

function _getAppFromNode(node) {
    // Method 1 — V1: numeric appId on dataset
    const appId = parseInt(node.dataset?.appid);
    if (appId && ui.windows?.[appId]) return ui.windows[appId];

    // Method 2 — V2: search foundry.applications.instances by element match
    if (foundry.applications?.instances) {
        for (const app of foundry.applications.instances.values()) {
            const el = app.element instanceof HTMLElement ? app.element : app.element?.[0];
            if (el === node) return app;
        }
    }

    // Method 3 — V2 fallback: match by element id attribute
    if (node.id && foundry.applications?.instances) {
        for (const app of foundry.applications.instances.values()) {
            if (app.id === node.id) return app;
        }
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE A NEW SHEET WINDOW
// ─────────────────────────────────────────────────────────────────────────────

function _handleNewSheet(node, attempt) {
    const app = _getAppFromNode(node);

    if (!app) {
        // App may not be registered in foundry.applications.instances yet — retry
        if (attempt < 10) {
            setTimeout(() => _handleNewSheet(node, attempt + 1), 100);
        } else {
            console.warn(`${MODULE} | Could not resolve app for node (id="${node.id}")`);
        }
        return;
    }

    const actor = app.document ?? app.object ?? app.actor;
    if (!actor || actor.documentName !== 'Actor') return;

    console.log(`${MODULE} | Detected actor sheet for: ${actor.name}`);

    if (!injectCraftingButton(app, node, actor)) {
        _retryInjection(app, node, actor, 0);
    }
}

// Retry injection up to ~4 s (handles lazy-rendered tab content)
function _retryInjection(app, node, actor, attempt) {
    if (attempt >= 20) return;
    setTimeout(() => {
        if (!node.isConnected) return;
        if (!injectCraftingButton(app, node, actor)) {
            _retryInjection(app, node, actor, attempt + 1);
        }
    }, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON INJECTION
// ─────────────────────────────────────────────────────────────────────────────

// Returns true when injected (or already present / not applicable),
// false when no nav bar found yet (caller should retry).
function injectCraftingButton(app, root, actor) {
    try {
        if (!game.settings.get(MODULE_ID, "showCraftingButton")) return true;
        if (!actor) {
            actor = app.document ?? app.object ?? app.actor;
            if (!actor || actor.documentName !== 'Actor') return true;
        }

        // Guard: only inject once
        if (root.querySelector('.af-crafting-tab-btn')) return true;

        // Build the tab nav item.
        // No data-tab attribute → dnd5e's tab system ignores it entirely.
        const btn = document.createElement('a');
        btn.className = 'item control af-crafting-tab-btn';
        btn.title = 'Alchemy & Crafting Station';
        btn.innerHTML = `<i class="fas fa-flask"></i> Crafting`;
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            new CraftingApp(actor).render();
        });

        // Try every plausible nav selector for dnd5e 4.x / Foundry v14
        const nav =
            root.querySelector('nav.tabs[data-group="primary"]') ??
            root.querySelector('nav.primary-tabs') ??
            root.querySelector('nav.sheet-navigation') ??
            root.querySelector('nav.tabs') ??
            root.querySelector('.sheet-tabs') ??
            root.querySelector('nav[data-tabs]') ??
            root.querySelector('[role="tablist"]') ??
            root.querySelector('ol.tabs') ??
            root.querySelector('ul.tabs');

        if (nav) {
            nav.appendChild(btn);
            console.log(`${MODULE} | ✓ Crafting tab injected for ${actor.name}`);
            return true;
        }

        // Debug: show what nav-like elements exist so we can refine the selector
        const candidates = [...root.querySelectorAll('nav, [data-group], [data-tabs], [role="tablist"]')]
            .map(el => `${el.tagName}[class="${el.className}"]`).join(', ');
        console.warn(`${MODULE} | No nav found for ${actor.name}. Candidates: ${candidates || 'none'}`);
        return false;

    } catch (err) {
        console.error(`${MODULE} | injectCraftingButton error:`, err);
        return false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS — belt-and-suspenders alongside the MutationObserver
// In V2, app.element is the FULL application element (including window chrome).
// The `html` arg passed to render hooks may only be the content area,
// so we always prefer app.element to ensure the nav bar is within root.
// ─────────────────────────────────────────────────────────────────────────────

[
    'renderActorSheet',
    'renderActorSheet5eCharacter2',
    'renderActorSheet5eNPC2',
    'renderActorSheet5eVehicle2',
].forEach(hookName => {
    Hooks.on(hookName, (app, html) => {
        // Prefer app.element (full window) over html (may be content-only)
        const root = (app.element instanceof HTMLElement ? app.element : null)
            ?? (html instanceof HTMLElement ? html : html?.[0]);
        if (!root) return;
        const actor = app.document ?? app.object ?? app.actor;
        if (!injectCraftingButton(app, root, actor)) {
            _retryInjection(app, root, actor, 0);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK HEADER BUTTONS
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
