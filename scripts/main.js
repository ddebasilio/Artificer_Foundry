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

    foundry.applications.handlebars.loadTemplates([
        "modules/artificer-foundry/templates/crafting-app.hbs"
    ]);
});

Hooks.once('ready', function () {
    console.log(`${MODULE} | Ready`);
    window.ArtificerFoundry = {
        recipeManager: new RecipeManager(),
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render(true)
    };
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB INJECTION
// ─────────────────────────────────────────────────────────────────────────────

function injectCraftingTab(app, html) {
    try {
        const actor = app.document ?? app.actor;
        if (!actor || actor.documentName !== 'Actor') return;

        // Resolve the root element.
        // ApplicationV2 may pass an HTMLElement directly; ApplicationV1 passes jQuery.
        // Also try app.element (the window frame) as a fallback so we search the full DOM.
        let root = html instanceof HTMLElement ? html : (html?.length ? html[0] : null);

        // For AppV2, app.element is the actual window frame and is more reliable
        const appElement = app.element instanceof HTMLElement
            ? app.element
            : (app.element?.length ? app.element[0] : null);

        // Use whichever root actually contains a tab nav
        for (const candidate of [root, appElement]) {
            if (!candidate) continue;
            if (candidate.querySelector('nav.tabs, nav[data-group], nav[data-tabs]')) {
                root = candidate;
                break;
            }
        }

        if (!root) {
            console.warn(`${MODULE} | injectCraftingTab: could not resolve root element`);
            return;
        }

        // Guard: only inject once per render cycle
        if (root.querySelector('.af-crafting-nav-item')) return;

        // ── 1. Find the primary tab nav ───────────────────────────────────────
        // Try every known selector for dnd5e V1, V2, and generic sheets.
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
                console.log(`${MODULE} | Tab nav found with selector: "${sel}"`);
                break;
            }
        }

        if (!tabsNav) {
            console.warn(`${MODULE} | No tab nav found — tried: ${NAV_SELECTORS.join(', ')}`);
            console.warn(`${MODULE} | Root element outerHTML (first 600 chars):`, root.outerHTML?.slice(0, 600));
            return;
        }

        // ── 2. Find where tab pane content lives ──────────────────────────────
        // In dnd5e V2 the tab sections are direct children of the form (no wrapper).
        // In some themes there's a .tab-body wrapper.
        const tabBody =
            root.querySelector('.tab-body') ??
            root.querySelector('.sheet-body') ??
            tabsNav.parentElement;   // form or sheet-body — tab sections are its children

        if (!tabBody) {
            console.warn(`${MODULE} | No tab body container found`);
            return;
        }

        console.log(`${MODULE} | Injecting Crafting tab for actor: ${actor.name}`);

        // ── 3. Create nav item ────────────────────────────────────────────────
        const navItem = document.createElement('a');
        navItem.className = 'item af-crafting-nav-item';
        navItem.dataset.tab = 'af-crafting';
        // Copy data-group if other items have it (required by dnd5e V2 tab system)
        const existingGroup = tabsNav.querySelector('[data-group]')?.dataset.group;
        if (existingGroup) navItem.dataset.group = existingGroup;
        navItem.title = 'Alchemy & Crafting';
        navItem.innerHTML = `<i class="fas fa-flask"></i><span> Crafting</span>`;
        tabsNav.appendChild(navItem);

        // ── 4. Create tab pane ────────────────────────────────────────────────
        const pane = document.createElement('section');
        pane.className = 'tab af-crafting-tab-pane';
        pane.dataset.tab = 'af-crafting';
        if (existingGroup) pane.dataset.group = existingGroup;
        pane.style.display = 'none';
        pane.innerHTML = buildTabPaneHTML(actor);
        tabBody.appendChild(pane);

        // ── 5. Click: activate our tab ────────────────────────────────────────
        navItem.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            // Deactivate all nav items (including ones managed by dnd5e)
            tabsNav.querySelectorAll('.item').forEach(t => t.classList.remove('active'));

            // Hide ALL tab panes in the body, regardless of depth
            tabBody.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
                t.style.display = 'none';
            });

            navItem.classList.add('active');
            pane.classList.add('active');
            pane.style.display = 'block';
        });

        // ── 6. Deactivate our pane when other tabs are clicked ────────────────
        // Use event delegation on the nav so we catch dynamically-added items too
        tabsNav.addEventListener('click', e => {
            const clicked = e.target.closest('.item');
            if (!clicked || clicked === navItem) return;
            pane.classList.remove('active');
            pane.style.display = 'none';
            navItem.classList.remove('active');
        });

        // ── 7. Wire the "Open Crafting Station" button ────────────────────────
        pane.querySelector('.af-open-station-btn')?.addEventListener('click', () => {
            new CraftingApp(actor).render(true);
        });

    } catch (err) {
        console.error(`${MODULE} | injectCraftingTab error:`, err);
    }
}

// ── Build tab pane HTML ───────────────────────────────────────────────────────

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
// HOOKS
// We listen on every plausible hook name so the tab appears regardless of
// which version of dnd5e / Foundry is running.
// ─────────────────────────────────────────────────────────────────────────────

// Generic catch-all — fires for every Application render (V1 and V2)
Hooks.on('renderApplication', (app, html) => injectCraftingTab(app, html));

// Specific dnd5e V2 hooks (Foundry v12+ / dnd5e 3.x+)
[
    'renderActorSheet5eCharacter2',
    'renderActorSheet5eNPC2',
    'renderActorSheet5eVehicle2',
    'renderActorSheet',
].forEach(hookName => Hooks.on(hookName, (app, html) => injectCraftingTab(app, html)));

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK — header button (visible even if tab injection fails)
// ─────────────────────────────────────────────────────────────────────────────

Hooks.on('getActorSheetHeaderButtons', (app, buttons) => {
    const actor = app.document ?? app.actor;
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
        const actor = app.document ?? app.actor;
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
