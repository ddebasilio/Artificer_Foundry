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

    observer.observe(interfaceEl, { childList: true });
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
    injectCraftingButton(app, node, actor);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON INJECTION
// ─────────────────────────────────────────────────────────────────────────────

function injectCraftingButton(app, root, actor) {
    try {
        if (!game.settings.get(MODULE_ID, "showCraftingButton")) return;
        if (!actor) {
            actor = app.document ?? app.object ?? app.actor;
            if (!actor || actor.documentName !== 'Actor') return;
        }

        // Guard: only once per render
        if (root.querySelector('.af-inventory-btn')) return;

        // ── Find the inventory content section ────────────────────────────────
        // We need the content panel, NOT the <a> nav item.
        // Try selectors from most to least specific, skipping inline/nav elements.
        const SELECTORS = [
            'section.tab.inventory',
            '.tab.inventory',
            'section[data-tab="inventory"]',
            'div[data-tab="inventory"]',
            '.inventory-element',
            '.items-list',
            '.inventory-list',
        ];

        let target = null;
        for (const sel of SELECTORS) {
            const el = root.querySelector(sel);
            // Skip if this is a nav link or other inline element
            if (el && !['A', 'BUTTON', 'LI', 'SPAN'].includes(el.tagName)) {
                target = el;
                console.log(`${MODULE} | Inventory target found: "${sel}" (${el.tagName})`);
                break;
            }
        }

        if (!target) {
            console.warn(`${MODULE} | Could not find inventory section for ${actor.name}`);
            console.warn(`${MODULE} | Sheet HTML preview:`, root.outerHTML?.slice(0, 1200));
            return;
        }

        // Build the button
        const btn = document.createElement('div');
        btn.className = 'af-inventory-btn';
        btn.title = 'Open Alchemy & Crafting Station';
        btn.innerHTML = `
            <img src="icons/commodities/materials/bowl-powder-gold.webp" alt="Crafting Station">
            <span>Open Crafting Station</span>
        `;
        btn.addEventListener('click', () => new CraftingApp(actor).render());

        target.insertBefore(btn, target.firstChild);
        console.log(`${MODULE} | ✓ Button injected for ${actor.name}`);

    } catch (err) {
        console.error(`${MODULE} | injectCraftingButton error:`, err);
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
        if (root) injectCraftingButton(app, root);
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
