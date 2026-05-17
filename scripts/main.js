import { CraftingApp } from "./crafting-app.js";
import { RecipeManager } from "./recipe-manager.js";

const MODULE = "Artificer Foundry";
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
        hint: "Display the Open Crafting Station button at the top of the Inventory tab on actor sheets.",
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

    // MutationObserver: watch for any new .application window added to the DOM
    // and inject the crafting button into its inventory tab.
    const interfaceEl = document.querySelector('#interface') ?? document.body;
    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1 || !node.classList?.contains('application')) continue;
                requestAnimationFrame(() => {
                    const appId = parseInt(node.dataset?.appid);
                    const theApp = appId ? ui.windows[appId] : null;
                    if (!theApp) return;
                    injectCraftingButton(theApp, node);
                });
            }
        }
    });
    observer.observe(interfaceEl, { childList: true });
    console.log(`${MODULE} | MutationObserver active`);
});

// ─────────────────────────────────────────────────────────────────────────────
// BUTTON INJECTION
// Places a single "Open Crafting Station" button at the top of the
// inventory tab inside any actor sheet.
// ─────────────────────────────────────────────────────────────────────────────

function injectCraftingButton(app, root) {
    try {
        if (!game.settings.get(MODULE_ID, "showCraftingButton")) return;

        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;

        // Guard: already injected
        if (root.querySelector('.af-inventory-btn')) return;

        // Find the inventory tab pane — try multiple selectors for V1/V2 compat
        const inventoryTab =
            root.querySelector('[data-tab="inventory"][data-group="primary"]') ??
            root.querySelector('[data-tab="inventory"]') ??
            root.querySelector('.inventory-list');

        if (!inventoryTab) {
            console.warn(`${MODULE} | Could not find inventory tab in sheet for ${actor.name}`);
            return;
        }

        const btn = document.createElement('div');
        btn.className = 'af-inventory-btn';
        btn.title = 'Open Alchemy & Crafting Station';
        btn.innerHTML = `
            <img src="icons/commodities/materials/bowl-powder-gold.webp" alt="Crafting">
            <span>Open Crafting Station</span>
        `;
        btn.addEventListener('click', () => new CraftingApp(actor).render());

        inventoryTab.insertBefore(btn, inventoryTab.firstChild);
        console.log(`${MODULE} | Button injected for ${actor.name}`);

    } catch (err) {
        console.error(`${MODULE} | injectCraftingButton error:`, err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS (belt-and-suspenders alongside the MutationObserver)
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
    'getActorSheet5eVehicle2HeaderButtons',
    'getActorSheet5eGroupHeaderButtons',
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
