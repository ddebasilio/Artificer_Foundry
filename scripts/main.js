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
        hint: "Display a 'Crafting' tab button on actor sheets.",
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
            console.warn(`${MODULE} | Could not resolve root element for ${actor.name}`);
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
                console.log(`${MODULE} | Nav found ("${sel}") for ${actor.name}`);
                break;
            }
        }

        if (!tabsNav) {
            // Debug dump so we can see the actual structure
            console.warn(`${MODULE} | No tab nav found for ${actor.name}`);
            console.warn(`${MODULE} | Root: <${root.tagName} id="${root.id}" class="${root.className}">`);
            console.warn(`${MODULE} | Root HTML (first 800 chars):`, root.outerHTML?.slice(0, 800));
            return;
        }

        // ── Build the nav item ────────────────────────────────────────────────
        // No data-tab → dnd5e's tab system ignores it; other tabs never go blank.
        const navItem = document.createElement('a');
        navItem.className = 'item af-crafting-nav-item';
        navItem.title = 'Alchemy & Crafting Station';
        navItem.innerHTML = `<i class="fas fa-flask"></i><span> Crafting</span>`;

        navItem.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            new CraftingApp(actor).render();
        });

        tabsNav.appendChild(navItem);
        console.log(`${MODULE} | ✓ Crafting tab injected for ${actor.name}`);

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
