import { CraftingApp } from "./crafting-app.js";
import { RecipeManager } from "./recipe-manager.js";

Hooks.once('init', async function() {
    console.log('Artificer Foundry | Initializing Alchemy & Crafting Module');

    // Register module settings
    game.settings.register("artificer-foundry", "recipeData", {
        name: "Recipe Data",
        hint: "Stores the custom recipes learned by characters.",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

    // Register Handlebars helpers
    Handlebars.registerHelper('eq', function (a, b) {
        return a === b;
    });

    // Register Template
    foundry.applications.handlebars.loadTemplates([
        "modules/artificer-foundry/templates/crafting-app.hbs"
    ]);
});

Hooks.once('ready', async function() {
    console.log('Artificer Foundry | Ready');
    // Initialize Recipe Manager
    window.ArtificerFoundry = {
        recipeManager: new RecipeManager(),
        showCraftingApp: () => {
            new CraftingApp().render(true);
        }
    };
});

function injectButton(app, html) {
    let actor = app.document || app.actor;
    if (!actor || actor.documentName !== 'Actor') return;

    // Support both Application V1 (jQuery) and Application V2 (HTMLElement)
    const htmlElement = html instanceof HTMLElement ? html : html[0];
    if (!htmlElement) return;
    
    // Find inventory section using standard selectors
    // Targets standard dnd5e V2 sheet layout, V1 layout, and generic layouts
    let targetArea = htmlElement.querySelector('.tab[data-tab="inventory"] .inventory-filters, .tab[data-group="primary"][data-tab="inventory"] .inventory-filters, section.inventory, .inventory-list');
    
    if (!targetArea) {
        targetArea = htmlElement.querySelector('.tab[data-tab="inventory"]'); // Fallback to inventory tab
    }
    
    if (!targetArea) {
         // Ultimate fallback: Just append it to the sheet body
         targetArea = htmlElement.querySelector('form') || htmlElement;
    }

    if (targetArea) {
        // Prevent adding multiple buttons if rendered multiple times
        if (htmlElement.querySelector('.artificer-foundry-inventory-btn')) return;

        const buttonHtml = `
            <div class="artificer-foundry-inventory-btn" style="
                display: flex; 
                align-items: center; 
                justify-content: center; 
                background: #5c1818; 
                color: white; 
                border: 1px solid #000; 
                border-radius: 5px; 
                padding: 10px; 
                margin: 10px 0; 
                cursor: pointer;
                box-shadow: 0 0 5px red;
                width: 100%;
            " title="Open Alchemy & Crafting">
                <img src="icons/consumables/potions/potion-flask-corked-red.webp" style="width: 40px; height: 40px; margin-right: 15px; border: none; background: transparent;" alt="Red Flask">
                <span style="font-size: 1.5em; font-weight: bold; text-shadow: 1px 1px 2px black;">Open Crafting Station</span>
            </div>
        `;
        
        // Create element
        const template = document.createElement('template');
        template.innerHTML = buttonHtml.trim();
        const buttonElement = template.content.firstChild;
        
        // Open the app when clicked
        buttonElement.addEventListener('click', (ev) => {
            ev.preventDefault();
            new CraftingApp(actor).render(true);
        });

        // Insert it
        if (targetArea.classList && targetArea.classList.contains('inventory-filters')) {
            targetArea.parentNode.insertBefore(buttonElement, targetArea.nextSibling);
        } else if (targetArea.firstChild) {
            targetArea.insertBefore(buttonElement, targetArea.firstChild);
        } else {
            targetArea.appendChild(buttonElement);
        }
    }
}

// Add header button for both Application V1 and V2
const headerHooks = ['getActorSheetHeaderButtons', 'getApplicationHeaderButtons'];
headerHooks.forEach(hookName => {
    Hooks.on(hookName, (app, buttons) => {
        let actor = app.document || app.actor;
        if (actor && actor.documentName === 'Actor') {
            buttons.unshift({
                class: 'artificer-foundry-btn',
                icon: 'fas fa-flask',
                label: 'Crafting',
                onclick: () => {
                    new CraftingApp(actor).render(true);
                }
            });
        }
    });
});

// Inject button on render for both Application V1 and V2
const renderHooks = ['renderActorSheet', 'renderApplication', 'renderActorSheet5eCharacter2', 'renderActorSheet5eNPC2'];
renderHooks.forEach(hookName => {
    Hooks.on(hookName, (app, html, data) => {
        injectButton(app, html);
    });
});