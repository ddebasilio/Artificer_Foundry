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
    // Adding the button to all actors that have an inventory/sheet for testing
    // Foundry's dnd5e system uses 'character' for PCs and 'npc' for monsters.
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