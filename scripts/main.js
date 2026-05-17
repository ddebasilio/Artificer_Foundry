import { CraftingApp } from "./crafting-app.js";
import { RecipeManager } from "./recipe-manager.js";

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────

Hooks.once('init', function () {
    console.log('Artificer Foundry | Initializing');

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
    console.log('Artificer Foundry | Ready');
    window.ArtificerFoundry = {
        recipeManager: new RecipeManager(),
        showCraftingApp: (actor) => new CraftingApp(actor ?? null).render(true)
    };
});

// ─────────────────────────────────────────────────────────────────────────────
// TAB INJECTION
// Adds an "Crafting" tab to the character sheet primary tab bar.
// Works for both Application V1 (dnd5e 2.x) and V2 (dnd5e 3.x / Foundry 12+).
// ─────────────────────────────────────────────────────────────────────────────

function injectCraftingTab(app, html) {
    const actor = app.document ?? app.actor;
    if (!actor || actor.documentName !== 'Actor') return;

    const root = html instanceof HTMLElement ? html : html[0];
    if (!root) return;

    // Guard: only inject once per render
    if (root.querySelector('.af-crafting-nav-item')) return;

    // ── 1. Find the primary tab navigation ───────────────────────────────────
    //    dnd5e V2:  nav.tabs[data-group="primary"]  or  nav[data-tabs="primary"]
    //    dnd5e V1:  nav.tabs.tabs-primary  or  nav.sheet-tabs
    const tabsNav = root.querySelector(
        'nav[data-group="primary"], nav[data-tabs="primary"], nav.tabs-primary, nav.sheet-tabs'
    );
    if (!tabsNav) return;

    // ── 2. Find the tab body (where section.tab / div.tab panels live) ────────
    //    V2 typically has a sibling .tab-body; V1 has .tab panels directly
    //    in a parent container.
    const tabBody =
        root.querySelector('.tab-body') ??
        tabsNav.nextElementSibling ??
        tabsNav.parentElement;
    if (!tabBody) return;

    // ── 3. Build nav item ─────────────────────────────────────────────────────
    const navItem = document.createElement('a');
    navItem.className = 'item af-crafting-nav-item';
    navItem.dataset.tab = 'af-crafting';
    navItem.title = 'Alchemy & Crafting';
    navItem.innerHTML = `<i class="fas fa-flask"></i><span>Crafting</span>`;
    tabsNav.appendChild(navItem);

    // ── 4. Build tab pane ─────────────────────────────────────────────────────
    const pane = document.createElement('section');
    pane.className = 'tab af-crafting-tab-pane';
    pane.dataset.tab = 'af-crafting';
    pane.style.display = 'none';
    pane.innerHTML = buildTabPaneHTML(actor);
    tabBody.appendChild(pane);

    // ── 5. Activate our tab ───────────────────────────────────────────────────
    navItem.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        // Deactivate every other nav item
        tabsNav.querySelectorAll('.item').forEach(t => t.classList.remove('active'));

        // Hide every other tab pane (handle V2 active-class system + inline display)
        tabBody.querySelectorAll(':scope > .tab, :scope > section.tab').forEach(t => {
            t.classList.remove('active');
            t.style.display = 'none';
        });

        navItem.classList.add('active');
        pane.classList.add('active');
        pane.style.display = '';
    });

    // ── 6. Deactivate our pane when the user picks a different tab ────────────
    tabsNav.querySelectorAll('.item:not(.af-crafting-nav-item)').forEach(otherNav => {
        otherNav.addEventListener('click', () => {
            pane.classList.remove('active');
            pane.style.display = 'none';
            navItem.classList.remove('active');
        });
    });

    // ── 7. Wire up pane buttons ───────────────────────────────────────────────
    pane.querySelector('.af-open-station-btn')?.addEventListener('click', () => {
        new CraftingApp(actor).render(true);
    });
}

// Build the inner HTML for the crafting tab pane.
function buildTabPaneHTML(actor) {
    const recipeManager = window.ArtificerFoundry?.recipeManager;
    const recipes = recipeManager ? recipeManager.getRecipesForActor(actor) : [];
    const known   = recipes.filter(r => r.isLearned);
    const unknown = recipes.filter(r => !r.isLearned);

    const rarityLabel = {
        common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
        very_rare: 'Very Rare', legendary: 'Legendary'
    };

    function recipeRow(r) {
        return `
        <li class="af-recipe-row rarity-${r.rarity}">
            <span class="af-recipe-row-name">${r.name}</span>
            <span class="rarity-badge rarity-${r.rarity}">${rarityLabel[r.rarity] ?? r.rarity}</span>
            <span class="time-badge"><i class="fas fa-clock"></i> ${r.time}</span>
        </li>`;
    }

    const knownRows   = known.length   ? known.map(recipeRow).join('')   : '<li class="af-empty">No recipes learned yet.</li>';
    const unknownRows = unknown.length ? unknown.map(recipeRow).join('') : '<li class="af-empty">All recipes known!</li>';

    return `
    <div class="af-tab-pane-inner">
        <div class="af-tab-pane-header">
            <button class="af-open-station-btn">
                <i class="fas fa-mortar-pestle"></i> Open Crafting Station
            </button>
            <p class="af-tab-pane-summary">
                <strong>${known.length}</strong> recipe${known.length !== 1 ? 's' : ''} known &nbsp;·&nbsp;
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
// HOOKS — fire tab injection for every actor sheet render
// ─────────────────────────────────────────────────────────────────────────────

const RENDER_HOOKS = [
    'renderActorSheet',
    'renderActorSheet5eCharacter2',
    'renderActorSheet5eNPC2',
    'renderActorSheet5eVehicle2',
];

RENDER_HOOKS.forEach(hookName => {
    Hooks.on(hookName, (app, html) => injectCraftingTab(app, html));
});

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK — header button for sheets that don't have a standard tab bar
// (e.g. custom community sheets, simple-worldbuilding actors)
// ─────────────────────────────────────────────────────────────────────────────

Hooks.on('getActorSheetHeaderButtons', (app, buttons) => {
    const actor = app.document ?? app.actor;
    if (!actor || actor.documentName !== 'Actor') return;
    buttons.unshift({
        class: 'artificer-foundry-btn',
        icon: 'fas fa-flask',
        label: 'Crafting',
        onclick: () => new CraftingApp(actor).render(true)
    });
});

const V2_HEADER_HOOKS = [
    'getActorSheet5eCharacter2HeaderButtons',
    'getActorSheet5eNPC2HeaderButtons',
    'getActorSheet5eVehicle2HeaderButtons',
    'getActorSheet5eGroupHeaderButtons'
];
V2_HEADER_HOOKS.forEach(hookName => {
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
