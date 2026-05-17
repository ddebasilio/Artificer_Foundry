export class RecipeManager {
    constructor() {
        this.recipes = this.loadDefaultRecipes();
    }

    loadDefaultRecipes() {
        return [
            // ─────────────────────────────────────────────────────────────
            // COMMON RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-healing",
                name: "Potion of Healing",
                rarity: "common",
                time: "1 hour",
                learned: true,
                description: "A simple red liquid that restores 2d4+2 hit points.",
                ingredients: [
                    { name: "Bloodgrass", quantity: 2, type: "common_herb" },
                    { name: "Pure Water", quantity: 1, type: "liquid" }
                ],
                output: { name: "Potion of Healing", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "antitoxin",
                name: "Antitoxin",
                rarity: "common",
                time: "1 hour",
                learned: true,
                description: "Gives advantage on saving throws against poison for 1 hour.",
                ingredients: [
                    { name: "Silverleaf", quantity: 2, type: "common_herb" },
                    { name: "Charcoal Powder", quantity: 1, type: "common_component" }
                ],
                output: { name: "Antitoxin", img: "icons/consumables/potions/potion-flask-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "oil-slipperiness",
                name: "Oil of Slipperiness",
                rarity: "common",
                time: "2 hours",
                learned: true,
                description: "Coats a creature with a slippery oil, granting freedom of movement.",
                ingredients: [
                    { name: "Toadstool", quantity: 3, type: "common_herb" },
                    { name: "Rendered Fat", quantity: 1, type: "common_component" }
                ],
                output: { name: "Oil of Slipperiness", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-climbing",
                name: "Potion of Climbing",
                rarity: "common",
                time: "1 hour",
                learned: true,
                description: "Grants a climbing speed equal to your walking speed for 1 hour.",
                ingredients: [
                    { name: "Spidergrass", quantity: 2, type: "common_herb" },
                    { name: "Pine Resin", quantity: 1, type: "common_component" }
                ],
                output: { name: "Potion of Climbing", img: "icons/consumables/potions/potion-flask-corked-green.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "alchemist-fire",
                name: "Alchemist's Fire",
                rarity: "common",
                time: "2 hours",
                learned: true,
                description: "A sticky, adhesive fluid that ignites when exposed to air.",
                ingredients: [
                    { name: "Sulphur", quantity: 2, type: "common_component" },
                    { name: "Naphtha Oil", quantity: 1, type: "liquid" }
                ],
                output: { name: "Alchemist's Fire", img: "icons/weapons/thrown/bomb-fuse-red.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // UNCOMMON RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-greater-healing",
                name: "Potion of Greater Healing",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Restores 4d4+4 hit points.",
                ingredients: [
                    { name: "Bloodgrass", quantity: 4, type: "common_herb" },
                    { name: "Mandrake Root", quantity: 1, type: "uncommon_herb" },
                    { name: "Wolf Fang", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Greater Healing", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-water-breathing",
                name: "Potion of Water Breathing",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Allows the drinker to breathe underwater for 1 hour.",
                ingredients: [
                    { name: "Sea Kelp", quantity: 3, type: "uncommon_herb" },
                    { name: "Merfolk Scale", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Water Breathing", img: "icons/consumables/potions/potion-flask-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-animal-friendship",
                name: "Potion of Animal Friendship",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Cast Animal Friendship on any beast for 1 hour.",
                ingredients: [
                    { name: "Catnip", quantity: 2, type: "common_herb" },
                    { name: "Pixie Dust", quantity: 1, type: "uncommon_component" },
                    { name: "Rabbit Foot", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Animal Friendship", img: "icons/consumables/potions/potion-flask-corked-green.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-fire-breath",
                name: "Potion of Fire Breath",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Exhale fire as a bonus action (up to 3 times): 4d6 fire damage, 30-foot cone.",
                ingredients: [
                    { name: "Firebloom", quantity: 2, type: "uncommon_herb" },
                    { name: "Magmin Ash", quantity: 2, type: "uncommon_component" },
                    { name: "Salamander Scale", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Fire Breath", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "elixir-hill-giant-strength",
                name: "Elixir of Hill Giant Strength",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Strength becomes 21 for 1 hour.",
                ingredients: [
                    { name: "Giant Toenail", quantity: 1, type: "monster_part" },
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" }
                ],
                output: { name: "Elixir of Hill Giant Strength", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "smoke-bomb",
                name: "Smoke Bomb",
                rarity: "uncommon",
                time: "2 hours",
                learned: false,
                description: "Creates a 20-foot radius cloud of dense smoke for 1 minute.",
                ingredients: [
                    { name: "Sulphur", quantity: 2, type: "common_component" },
                    { name: "Powdered Charcoal", quantity: 2, type: "common_component" },
                    { name: "Goblin Teeth", quantity: 3, type: "monster_part" }
                ],
                output: { name: "Smoke Bomb", img: "icons/weapons/thrown/bomb-fuse-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-growth",
                name: "Potion of Growth",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "The drinker grows Large for 1d4 hours, gaining advantage on Strength checks.",
                ingredients: [
                    { name: "Giant's Ear Mushroom", quantity: 2, type: "uncommon_herb" },
                    { name: "Troll Blood", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Growth", img: "icons/consumables/potions/potion-flask-corked-green.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // RARE RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-superior-healing",
                name: "Potion of Superior Healing",
                rarity: "rare",
                time: "8 hours",
                learned: false,
                description: "Restores 8d4+8 hit points.",
                ingredients: [
                    { name: "Bloodgrass", quantity: 6, type: "common_herb" },
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" },
                    { name: "Troll Blood", quantity: 2, type: "monster_part" },
                    { name: "Basilisk Eye", quantity: 1, type: "rare_monster_part" }
                ],
                output: { name: "Potion of Superior Healing", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-speed",
                name: "Potion of Speed",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Haste for 1 minute.",
                ingredients: [
                    { name: "Quicksilver Herb", quantity: 2, type: "uncommon_herb" },
                    { name: "Harpy Feather", quantity: 3, type: "rare_monster_part" },
                    { name: "Manticore Spine", quantity: 1, type: "rare_monster_part" }
                ],
                output: { name: "Potion of Speed", img: "icons/consumables/potions/potion-flask-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-flying",
                name: "Potion of Flying",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Fly speed of 60 ft. for 1 hour.",
                ingredients: [
                    { name: "Skybloom Petal", quantity: 3, type: "uncommon_herb" },
                    { name: "Griffon Feather", quantity: 2, type: "rare_monster_part" },
                    { name: "Pegasus Hair", quantity: 1, type: "rare_monster_part" }
                ],
                output: { name: "Potion of Flying", img: "icons/consumables/potions/potion-flask-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-mind-reading",
                name: "Potion of Mind Reading",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Detect Thoughts for 1 hour, no concentration required.",
                ingredients: [
                    { name: "Mindflayer Tentacle", quantity: 1, type: "rare_monster_part" },
                    { name: "Dreamfern", quantity: 2, type: "uncommon_herb" },
                    { name: "Aboleth Slime", quantity: 1, type: "rare_monster_part" }
                ],
                output: { name: "Potion of Mind Reading", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "elixir-stone-giant-strength",
                name: "Elixir of Stone Giant Strength",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Strength becomes 23 for 1 hour.",
                ingredients: [
                    { name: "Stone Giant Knuckle", quantity: 1, type: "rare_monster_part" },
                    { name: "Mandrake Root", quantity: 3, type: "uncommon_herb" },
                    { name: "Gargoyle Dust", quantity: 2, type: "rare_monster_part" }
                ],
                output: { name: "Elixir of Stone Giant Strength", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-clairvoyance",
                name: "Potion of Clairvoyance",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Clairvoyance spell for 10 minutes.",
                ingredients: [
                    { name: "Beholder Eyestalk", quantity: 1, type: "rare_monster_part" },
                    { name: "Moonpetal Flower", quantity: 3, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Clairvoyance", img: "icons/consumables/potions/potion-flask-corked-blue.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // VERY RARE RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-supreme-healing",
                name: "Potion of Supreme Healing",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Restores 10d4+20 hit points.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 4, type: "uncommon_herb" },
                    { name: "Troll Blood", quantity: 4, type: "monster_part" },
                    { name: "Unicorn Horn Shaving", quantity: 1, type: "very_rare_component" },
                    { name: "Phoenix Ash", quantity: 1, type: "very_rare_component" }
                ],
                output: { name: "Potion of Supreme Healing", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-invisibility",
                name: "Potion of Invisibility",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Invisible for 1 hour or until you attack or cast a spell.",
                ingredients: [
                    { name: "Displacer Beast Tentacle", quantity: 1, type: "rare_monster_part" },
                    { name: "Ethereal Dust", quantity: 2, type: "rare_component" },
                    { name: "Shadow Essence", quantity: 1, type: "very_rare_component" }
                ],
                output: { name: "Potion of Invisibility", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-vitality",
                name: "Potion of Vitality",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Remove exhaustion, diseases, and poisons. Max hit points for 24 hours.",
                ingredients: [
                    { name: "Vampire Dust", quantity: 2, type: "very_rare_component" },
                    { name: "Unicorn Horn Shaving", quantity: 1, type: "very_rare_component" },
                    { name: "Bloodgrass", quantity: 8, type: "common_herb" },
                    { name: "Wyvern Poison Gland", quantity: 1, type: "rare_monster_part" }
                ],
                output: { name: "Potion of Vitality", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-heroism",
                name: "Potion of Heroism",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Gain 10 temporary HP and the Blessed condition for 1 hour.",
                ingredients: [
                    { name: "Paladin's Tear", quantity: 1, type: "very_rare_component" },
                    { name: "Celestial Feather", quantity: 1, type: "very_rare_component" },
                    { name: "Mandrake Root", quantity: 4, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Heroism", img: "icons/consumables/potions/potion-flask-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "elixir-cloud-giant-strength",
                name: "Elixir of Cloud Giant Strength",
                rarity: "very_rare",
                time: "3 days",
                learned: false,
                description: "Strength becomes 27 for 1 hour.",
                ingredients: [
                    { name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component" },
                    { name: "Mandrake Root", quantity: 6, type: "uncommon_herb" },
                    { name: "Storm Eagle Talon", quantity: 2, type: "rare_monster_part" }
                ],
                output: { name: "Elixir of Cloud Giant Strength", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-gaseous-form",
                name: "Potion of Gaseous Form",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Gaseous Form for 1 hour, no concentration required.",
                ingredients: [
                    { name: "Will-o-Wisp Essence", quantity: 2, type: "rare_monster_part" },
                    { name: "Ethereal Dust", quantity: 3, type: "rare_component" },
                    { name: "Medusa Blood", quantity: 1, type: "very_rare_component" }
                ],
                output: { name: "Potion of Gaseous Form", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // LEGENDARY RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "elixir-storm-giant-strength",
                name: "Elixir of Storm Giant Strength",
                rarity: "legendary",
                time: "7 days",
                learned: false,
                description: "Strength becomes 29 for 1 hour.",
                ingredients: [
                    { name: "Storm Giant Blood", quantity: 3, type: "legendary_component" },
                    { name: "Lightning-Struck Wood", quantity: 2, type: "very_rare_component" },
                    { name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component" }
                ],
                output: { name: "Elixir of Storm Giant Strength", img: "icons/consumables/potions/potion-flask-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "philosopher-stone",
                name: "Philosopher's Stone",
                rarity: "legendary",
                time: "30 days",
                learned: false,
                description: "Transmutes base metals to silver or gold, and produces a Potion of Supreme Healing.",
                ingredients: [
                    { name: "Dragon Blood", quantity: 2, type: "legendary_component" },
                    { name: "Lich Finger Bone", quantity: 1, type: "legendary_component" },
                    { name: "Unicorn Horn", quantity: 1, type: "legendary_component" },
                    { name: "Phoenix Ash", quantity: 3, type: "very_rare_component" }
                ],
                output: { name: "Philosopher's Stone", img: "icons/commodities/gems/gem-rough-red-yellow.webp", type: "loot", quantity: 1 }
            },
            {
                id: "potion-dragon-strength",
                name: "Potion of Dragon Strength",
                rarity: "legendary",
                time: "7 days",
                learned: false,
                description: "Strength becomes 30 for 1 hour. You also gain immunity to the dragon's breath type.",
                ingredients: [
                    { name: "Dragon Scale", quantity: 3, type: "legendary_component" },
                    { name: "Dragon Blood", quantity: 2, type: "legendary_component" },
                    { name: "Demon Horn Fragment", quantity: 1, type: "legendary_component" }
                ],
                output: { name: "Potion of Dragon Strength", img: "icons/consumables/potions/potion-flask-corked-red.webp", type: "consumable", quantity: 1 }
            }
        ];
    }

    getRecipesForActor(actor) {
        if (!actor) return this.recipes;

        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let learnedList = recipeData[actor.id] || [];

        return this.recipes.map(recipe => ({
            ...recipe,
            isLearned: recipe.learned || learnedList.includes(recipe.id)
        }));
    }

    async learnRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let newData = foundry.utils.duplicate(recipeData);

        if (!newData[actorId]) newData[actorId] = [];

        if (!newData[actorId].includes(recipeId)) {
            newData[actorId].push(recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }

    async forgetRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let newData = foundry.utils.duplicate(recipeData);

        if (newData[actorId]) {
            newData[actorId] = newData[actorId].filter(id => id !== recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }
}
