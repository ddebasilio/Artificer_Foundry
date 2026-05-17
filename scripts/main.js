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
        hint: "Display the 'Open Crafting Station' button at the top of the Inventory tab on actor sheets.",
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

    // Watch #interface for new .application windows being added to the DOM.
    // Works regardless of hook names or Foundry version.
    const interfaceEl = document.querySelector('#interface') ?? document.body;

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1 || !node.classList?.contains('application')) continue;
                // Wait one frame so the sheet body is fully populated
                requestAnimationFrame(() => _handleNewSheet(node));
            }
        }
    });

    // subtree: true catches windows nested inside sub-containers (e.g. Foundry v14 .windows-app)
    observer.observe(interfaceEl, { childList: true, subtree: true });
    console.log(`${MODULE} | MutationObserver active on #${interfaceEl.id || interfaceEl.tagName}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// FIND THE APP OBJECT FROM A DOM NODE
// In Foundry v13+ AppV2 is in foundry.applications.instances, not ui.windows.
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

    // Method 3 — V2 fallback: match by rendered element id attribute
    if (node.id) {
        if (foundry.applications?.instances) {
            for (const app of foundry.applications.instances.values()) {
                if (app.id === node.id) return app;
            }
        }
    }

    return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HANDLE A NEW SHEET WINDOW
// ─────────────────────────────────────────────────────────────────────────────

function _handleNewSheet(node) {
    const app = _getAppFromNode(node);

    if (!app) {
        console.warn(`${MODULE} | Could not resolve app for node (id="${node.id}", appid="${node.dataset?.appid}")`);
        return;
    }

    const actor = app.document ?? app.object ?? app.actor;
    if (!actor || actor.documentName !== 'Actor') return;

    console.log(`${MODULE} | Detected actor sheet for: ${actor.name}`);

    // Try immediately; if the inventory tab isn't rendered yet, retry with backoff.
    if (!injectCraftingButton(app, node, actor)) {
        _retryInjection(app, node, actor, 0);
    }
}

// Retry injection up to ~4 s to handle lazy-rendered tab content.
function _retryInjection(app, node, actor, attempt) {
    if (attempt >= 20) return;
    setTimeout(() => {
        if (!node.isConnected) return; // sheet was closed
        if (!injectCraftingButton(app, node, actor)) {
            _retryInjection(app, node, actor, attempt + 1);
        }
    }, 200);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON INJECTION
// ─────────────────────────────────────────────────────────────────────────────

// Returns true when the button was successfully injected (or already present),
// false when no injection point was found (caller may retry).
function injectCraftingButton(app, root, actor) {
    try {
        if (!game.settings.get(MODULE_ID, "showCraftingButton")) return true; // intentionally disabled
        if (!actor) {
            actor = app.document ?? app.object ?? app.actor;
            if (!actor || actor.documentName !== 'Actor') return true; // not an actor sheet
        }

        // Guard: only once per render
        if (root.querySelector('.af-inventory-btn')) return true;

        // Build the button element
        const btn = document.createElement('div');
        btn.className = 'af-inventory-btn';
        btn.title = 'Open Alchemy & Crafting Station';
        btn.innerHTML = `
            <img src="icons/commodities/materials/bowl-powder-gold.webp" alt="Crafting Station">
            <span>Open Crafting Station</span>
        `;
        btn.addEventListener('click', () => new CraftingApp(actor).render());

        // ── Find insertion point ──────────────────────────────────────────────
        // dnd5e 4.x inventory layout:
        //   div.top > div.encumbrance.card + ul.containers
        // We want to insert between those two elements.

        // Option A: after the encumbrance card (most precise)
        const encumbrance = root.querySelector('.encumbrance.card') ?? root.querySelector('.encumbrance');
        if (encumbrance) {
            encumbrance.parentElement.insertBefore(btn, encumbrance.nextElementSibling);
            console.log(`${MODULE} | ✓ Button injected after .encumbrance for ${actor.name}`);
            return true;
        }

        // Option B: before the containers list
        const containers = root.querySelector('ul.containers');
        if (containers) {
            containers.parentElement.insertBefore(btn, containers);
            console.log(`${MODULE} | ✓ Button injected before ul.containers for ${actor.name}`);
            return true;
        }

        // Option C: top of the inventory tab section (broad fallbacks)
        const invSection =
            root.querySelector('section.tab.inventory') ??
            root.querySelector('section[data-tab="inventory"]') ??
            root.querySelector('.tab[data-tab="inventory"]:not(a)');
        if (invSection) {
            invSection.insertBefore(btn, invSection.firstChild);
            console.log(`${MODULE} | ✓ Button injected into inventory section for ${actor.name}`);
            return true;
        }

        // No injection point found yet — caller should retry
        return false;

    } catch (err) {
        console.error(`${MODULE} | injectCraftingButton error:`, err);
        return false;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS — belt-and-suspenders alongside the MutationObserver
// ─────────────────────────────────────────────────────────────────────────────

[
    'renderActorSheet',
    'renderActorSheet5eCharacter2',
    'renderActorSheet5eNPC2',
    'renderActorSheet5eVehicle2',
].forEach(hookName => {
    Hooks.on(hookName, (app, html) => {
        const root = html instanceof HTMLElement ? html : html?.[0];
        if (!root) return;
        const actor = app.document ?? app.object ?? app.actor;
        if (!injectCraftingButton(app, root, actor)) {
            _retryInjection(app, root, actor, 0);
        }
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK HEADER BUTTONS (catches sheets that don't match any of the above)
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
