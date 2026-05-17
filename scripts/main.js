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
    loadTemplates([
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
        // Look for the inventory filter or inventory list container
        // This targets the dnd5e inventory tab header specifically, but falls back to generic locations
        let targetArea = html.find('.tab.inventory .inventory-filters');
        if (targetArea.length === 0) {
            targetArea = html.find('.tab.inventory .items-list').first();
        }
        if (targetArea.length === 0) {
            targetArea = html.find('.tab.inventory'); // Generic fallback
        }

        if (targetArea.length > 0) {
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
                " title="Open Alchemy & Crafting">
                    <img src="icons/consumables/potions/potion-flask-corked-red.webp" style="width: 40px; height: 40px; margin-right: 15px; border: none; background: transparent;" alt="Red Flask">
                    <span style="font-size: 1.5em; font-weight: bold; text-shadow: 1px 1px 2px black;">Open Crafting Station</span>
                </div>
            `;
            
            // Insert it at the top of the target area
            const buttonElement = $(buttonHtml);
            
            // Open the app when clicked
            buttonElement.click(ev => {
                ev.preventDefault();
                new CraftingApp(app.actor).render(true);
            });

            if (targetArea.hasClass('inventory-filters')) {
                targetArea.after(buttonElement);
            } else {
                targetArea.prepend(buttonElement);
            }
        }
    }
});