import { CraftingApp } from "./crafting-app.js";
import { RecipeManager } from "./recipe-manager.js";

const MODULE = "Artificer Foundry";

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

Hooks.once('init', function () {
    console.log(`${MODULE} | Initializing`);

    game.settings.register("artificer-foundry", "recipeData", {
        name: "Recipe Data",
        hint: "Stores recipes learned by each character.",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

    Handlebars.registerHelper('eq', (a, b) => a === b);
    // Template is loaded automatically via CraftingApp.PARTS in ApplicationV2
});

Hooks.once('ready', function () {
    console.log(`${MODULE} | Ready — setting up tab injection`);

    window.ArtificerFoundry = {
        recipeManager: new RecipeManager(),
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render(true)
    };

    // ── MutationObserver approach ────────────────────────────────────────────
    // Watches for any new Application window being added to the DOM.
    // This is version-independent and catches both AppV1 and AppV2 sheets.
    const interfaceEl = document.querySelector('#interface') ?? document.body;

    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (!node.classList?.contains('application')) continue;

                // Wait one frame so the sheet body is fully rendered
                requestAnimationFrame(() => {
                    const appId = parseInt(node.dataset?.appid);
                    if (!appId) return;
                    const theApp = ui.windows[appId];
                    if (!theApp) return;

                    const actor = theApp.document ?? theApp.object ?? theApp.actor;
                    if (!actor || actor.documentName !== 'Actor') return;

                    console.log(`${MODULE} | MutationObserver: detected sheet for ${actor.name}`);
                    injectCraftingTab(theApp, node);
                });
            }
        }
    });

    // Watch for top-level window elements being added under #interface
    observer.observe(interfaceEl, { childList: true });
    console.log(`${MODULE} | MutationObserver active on`, interfaceEl.id || interfaceEl.tagName);
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB INJECTION
// ─────────────────────────────────────────────────────────────────────────────

function injectCraftingTab(app, htmlArg) {
    try {
        const actor = app.document ?? app.object ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;

        // Resolve root element — prefer the passed element, fall back to app.element
        let root = htmlArg instanceof HTMLElement
            ? htmlArg
            : (htmlArg?.length ? htmlArg[0] : null);

        const appEl = app.element instanceof HTMLElement
            ? app.element
            : (app.element?.length ? app.element[0] : null);

        // Pick whichever candidate actually contains a tab nav
        for (const candidate of [root, appEl]) {
            if (!candidate) continue;
            if (candidate.querySelector('nav.tabs, nav[data-group], nav[data-tabs]')) {
                root = candidate;
                break;
            }
        }

        if (!root) {
            console.warn(`${MODULE} | Could not resolve root element for ${actor.name}`);
            return;
        }

        // Guard: only inject once
        if (root.querySelector('.af-crafting-nav-item')) return;

        // ── Find tab nav ──────────────────────────────────────────────────────
        const NAV_SELECTORS = [
            'nav.tabs[data-group="primary"]',
            'nav[data-group="primary"]',
            'nav[data-tabs="primary"]',
            'nav.tabs.tabs-primary',
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
            console.warn(`${MODULE} | No tab nav in sheet for ${actor.name}`);
            console.warn(`${MODULE} | Root classes: ${root.className}`);
            console.warn(`${MODULE} | Root HTML (first 800 chars):`, root.outerHTML?.slice(0, 800));
            return;
        }

        // ── Find tab body ─────────────────────────────────────────────────────
        const tabBody =
            root.querySelector('.tab-body') ??
            root.querySelector('.sheet-body') ??
            tabsNav.parentElement;

        // ── Build nav item ────────────────────────────────────────────────────
        const navItem = document.createElement('a');
        navItem.className = 'item af-crafting-nav-item';
        navItem.dataset.tab = 'af-crafting';
        const existingGroup = tabsNav.querySelector('[data-group]')?.dataset.group;
        if (existingGroup) navItem.dataset.group = existingGroup;
        navItem.title = 'Alchemy & Crafting';
        navItem.innerHTML = `<i class="fas fa-flask"></i><span> Crafting</span>`;
        tabsNav.appendChild(navItem);

        // ── Build tab pane ────────────────────────────────────────────────────
        const pane = document.createElement('section');
        pane.className = 'tab af-crafting-tab-pane';
        pane.dataset.tab = 'af-crafting';
        if (existingGroup) pane.dataset.group = existingGroup;
        pane.style.display = 'none';
        pane.innerHTML = buildTabPaneHTML(actor);
        tabBody.appendChild(pane);

        // ── Activate our tab on click ─────────────────────────────────────────
        navItem.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            tabsNav.querySelectorAll('.item').forEach(t => t.classList.remove('active'));
            tabBody.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
                t.style.display = 'none';
            });
            navItem.classList.add('active');
            pane.classList.add('active');
            pane.style.display = 'block';
        });

        // ── Hide our pane when another tab is clicked ─────────────────────────
        tabsNav.addEventListener('click', e => {
            const clicked = e.target.closest('.item');
            if (!clicked || clicked === navItem) return;
            pane.classList.remove('active');
            pane.style.display = 'none';
            navItem.classList.remove('active');
        });

        // ── "Open Crafting Station" button ────────────────────────────────────
        pane.querySelector('.af-open-station-btn')?.addEventListener('click', () => {
            new CraftingApp(actor).render(true);
        });

        console.log(`${MODULE} | ✓ Crafting tab injected for ${actor.name}`);

    } catch (err) {
        console.error(`${MODULE} | injectCraftingTab error:`, err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS (belt-and-suspenders alongside the MutationObserver)
// ─────────────────────────────────────────────────────────────────────────────

// Generic catch-alls
Hooks.on('renderApplication',   (app, html) => injectCraftingTab(app, html));
Hooks.on('renderApplicationV2', (app, html) => injectCraftingTab(app, html));

// dnd5e-specific (class name may vary by version)
[
    'renderActorSheet',
    'renderActorSheet5eCharacter2',
    'renderActorSheet5eNPC2',
    'renderActorSheet5eVehicle2',
    'renderCharacterSheet5e',
    'renderNPCSheet5e',
].forEach(hookName => Hooks.on(hookName, (app, html) => injectCraftingTab(app, html)));

// ─────────────────────────────────────────────────────────────────────────────
// BUILD TAB PANE HTML
// ─────────────────────────────────────────────────────────────────────────────

function buildTabPaneHTML(actor) {
    const recipeManager = window.ArtificerFoundry?.recipeManager;
    const recipes = recipeManager ? recipeManager.getRecipesForActor(actor) : [];
    const known   = recipes.filter(r => r.isLearned);
    const unknown = recipes.filter(r => !r.isLearned);

    const rarityLabel = {
        common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
        very_rare: 'Very Rare', legendary: 'Legendary'
    };

    const recipeRow = r => `
        <li class="af-recipe-row rarity-${r.rarity}">
            <span class="af-recipe-row-name">${r.name}</span>
            <span class="rarity-badge rarity-${r.rarity}">${rarityLabel[r.rarity] ?? r.rarity}</span>
            <span class="time-badge"><i class="fas fa-clock"></i> ${r.time}</span>
        </li>`;

    const knownRows   = known.length   ? known.map(recipeRow).join('')   : '<li class="af-empty">No recipes learned yet.</li>';
    const unknownRows = unknown.length ? unknown.map(recipeRow).join('') : '<li class="af-empty">All recipes known!</li>';

    return `
    <div class="af-tab-pane-inner">
        <div class="af-tab-pane-header">
            <button class="af-open-station-btn">
                <i class="fas fa-mortar-pestle"></i> Open Crafting Station
            </button>
            <p class="af-tab-pane-summary">
                <strong>${known.length}</strong> recipe${known.length !== 1 ? 's' : ''} known
                &nbsp;·&nbsp;
                <strong>${unknown.length}</strong> undiscovered
            </p>
        </div>
        <div class="af-recipe-section">
            <h4><i class="fas fa-check-circle"></i> Known Recipes</h4>
            <ul class="af-recipe-list">${knownRows}</ul>
        </div>
        <div class="af-recipe-section">
            <h4><i class="fas fa-lock"></i> Unknown Recipes</h4>
            <ul class="af-recipe-list af-unknown">${unknownRows}</ul>
        </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK HEADER BUTTONS (V1 + V2 dnd5e)
// ─────────────────────────────────────────────────────────────────────────────

Hooks.on('getActorSheetHeaderButtons', (app, buttons) => {
    const actor = app.document ?? app.object ?? app.actor;
    if (!actor || actor.documentName !== 'Actor') return;
    if (buttons.some(b => b.class === 'artificer-foundry-btn')) return;
    buttons.unshift({
        class: 'artificer-foundry-btn',
        icon: 'fas fa-flask',
        label: 'Crafting',
        onclick: () => new CraftingApp(actor).render(true)
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
        if (buttons.some(b => b.action === 'artificer-foundry')) return;
        buttons.unshift({
            action: 'artificer-foundry',
            icon: 'fas fa-flask',
            label: 'Crafting',
            onClick: () => new CraftingApp(actor).render(true)
        });
    });
});
