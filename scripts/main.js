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

// Add a button to the actor sheet to open the crafting app
Hooks.on('getActorSheetHeaderButtons', (app, buttons) => {
    console.log('Artificer Foundry | getActorSheetHeaderButtons hook fired for:', app.title);
    if (app.actor) {
        console.log('Artificer Foundry | Actor found, adding header button.');
        buttons.unshift({
            class: 'artificer-foundry-btn',
            icon: 'fas fa-flask',
            label: 'Crafting',
            onclick: () => {
                new CraftingApp(app.actor).render(true);
            }
        });
    }
});

// Inject a large red flask button into the inventory tab
Hooks.on('renderActorSheet', (app, html, data) => {
    console.log('Artificer Foundry | renderActorSheet hook fired for:', app.title, 'Actor Type:', app.actor?.type);
    if (app.actor) {
        const htmlElement = html instanceof HTMLElement ? html : html[0];
        
        console.log('Artificer Foundry | Searching for target area in sheet...');
        let targetArea = htmlElement.querySelector('.tab[data-tab="inventory"] .inventory-filters, .tab[data-group="primary"][data-tab="inventory"] .inventory-filters, section.inventory, .inventory-list');
        
        if (!targetArea) {
            console.log('Artificer Foundry | Primary target not found. Trying fallback 1...');
            targetArea = htmlElement.querySelector('.tab[data-tab="inventory"]');
        }
        
        if (!targetArea) {
             console.log('Artificer Foundry | Fallback 1 not found. Trying ultimate fallback...');
             targetArea = htmlElement.querySelector('form') || htmlElement;
        }

        if (targetArea) {
            console.log('Artificer Foundry | Target area found!', targetArea);
            if (htmlElement.querySelector('.artificer-foundry-inventory-btn')) {
                console.log('Artificer Foundry | Button already exists. Aborting.');
                return;
            }

            console.log('Artificer Foundry | Creating and injecting button...');
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
            
            const template = document.createElement('template');
            template.innerHTML = buttonHtml.trim();
            const buttonElement = template.content.firstChild;
            
            buttonElement.addEventListener('click', (ev) => {
                ev.preventDefault();
                new CraftingApp(app.actor).render(true);
            });

            if (targetArea.classList && targetArea.classList.contains('inventory-filters')) {
                targetArea.parentNode.insertBefore(buttonElement, targetArea.nextSibling);
            } else if (targetArea.firstChild) {
                targetArea.insertBefore(buttonElement, targetArea.firstChild);
            } else {
                targetArea.appendChild(buttonElement);
            }
            console.log('Artificer Foundry | Button injected successfully.');
        } else {
            console.error('Artificer Foundry | Could not find any target area to inject the button into.');
        }
    }
});