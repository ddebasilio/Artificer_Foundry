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
    if (app.actor) {
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
    if (app.actor) {
        // Foundry V12+ standardizes on HTML elements over jQuery for new V2 Application apps, 
        // but old apps still use jQuery. It's safer to handle both.
        const htmlElement = html instanceof HTMLElement ? html : html[0];
        
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
                new CraftingApp(app.actor).render(true);
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
});