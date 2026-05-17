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
                output: { name: "Potion of Healing", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Antitoxin", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Oil of Slipperiness", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Climbing", img: "icons/consumables/potions/bottle-corked-green.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Alchemist's Fire", img: "icons/weapons/thrown/bomb-fuse-red-black.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Greater Healing", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Water Breathing", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Animal Friendship", img: "icons/consumables/potions/bottle-corked-green.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Fire Breath", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Elixir of Hill Giant Strength", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Smoke Bomb", img: "icons/weapons/thrown/bomb-fuse-red-black.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Growth", img: "icons/consumables/potions/bottle-corked-green.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Superior Healing", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Speed", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Flying", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Mind Reading", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Elixir of Stone Giant Strength", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Clairvoyance", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Supreme Healing", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Invisibility", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Vitality", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Heroism", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Elixir of Cloud Giant Strength", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Potion of Gaseous Form", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Elixir of Storm Giant Strength", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
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
                output: { name: "Philosopher's Stone", img: "icons/commodities/gems/gem-rough-cushion-red.webp", type: "loot", quantity: 1 }
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
                output: { name: "Potion of Dragon Strength", img: "icons/consumables/potions/bottle-corked-red.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // ADDITIONAL COMMON RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-watchful-rest",
                name: "Potion of Watchful Rest",
                rarity: "common",
                time: "1 hour",
                learned: true,
                description: "Grants the benefits of a long rest after only 1 hour of sleep, while remaining alert.",
                ingredients: [
                    { name: "Dreamfern", quantity: 2, type: "uncommon_herb" },
                    { name: "Silverleaf", quantity: 1, type: "common_herb" },
                    { name: "Pure Water", quantity: 1, type: "liquid" }
                ],
                output: { name: "Potion of Watchful Rest", img: "icons/consumables/potions/flask-corked-yellow-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-comprehension",
                name: "Potion of Comprehension",
                rarity: "common",
                time: "1 hour",
                learned: true,
                description: "Read and understand any written language for 24 hours.",
                ingredients: [
                    { name: "Catnip", quantity: 2, type: "common_herb" },
                    { name: "Pixie Dust", quantity: 1, type: "uncommon_component" }
                ],
                output: { name: "Potion of Comprehension", img: "icons/consumables/potions/bottle-round-label-cork-blue.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // ADDITIONAL UNCOMMON RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-acid-resistance",
                name: "Potion of Acid Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to acid damage for 1 hour.",
                ingredients: [
                    { name: "Toadstool", quantity: 2, type: "common_herb" },
                    { name: "Magmin Ash", quantity: 1, type: "uncommon_component" },
                    { name: "Goblin Teeth", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Acid Resistance", img: "icons/consumables/potions/bottle-conical-fumes-green.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-advantage",
                name: "Potion of Advantage",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Advantage on attack rolls for 1 minute.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" },
                    { name: "Pixie Dust", quantity: 2, type: "uncommon_component" }
                ],
                output: { name: "Potion of Advantage", img: "icons/consumables/potions/bottle-round-corked-yellow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "bottled-breath",
                name: "Bottled Breath",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Hold your breath indefinitely or breathe comfortably in any environment for 1 hour.",
                ingredients: [
                    { name: "Sea Kelp", quantity: 3, type: "uncommon_herb" },
                    { name: "Merfolk Scale", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Bottled Breath", img: "icons/consumables/potions/bottle-conical-corked-labeled-shell-cyan.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-cold-resistance",
                name: "Potion of Cold Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to cold damage for 1 hour.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 1, type: "uncommon_herb" },
                    { name: "Silverleaf", quantity: 2, type: "common_herb" },
                    { name: "Troll Blood", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Cold Resistance", img: "icons/consumables/potions/bottle-conical-corked-cyan.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-fire-resistance",
                name: "Potion of Fire Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to fire damage for 1 hour.",
                ingredients: [
                    { name: "Firebloom", quantity: 1, type: "uncommon_herb" },
                    { name: "Salamander Scale", quantity: 2, type: "monster_part" }
                ],
                output: { name: "Potion of Fire Resistance", img: "icons/consumables/potions/bottle-round-corked-orange.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-force-resistance",
                name: "Potion of Force Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to force damage for 1 hour.",
                ingredients: [
                    { name: "Dreamfern", quantity: 2, type: "uncommon_herb" },
                    { name: "Pixie Dust", quantity: 2, type: "uncommon_component" }
                ],
                output: { name: "Potion of Force Resistance", img: "icons/consumables/potions/bottle-conical-corked-purple.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-lightning-resistance",
                name: "Potion of Lightning Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to lightning damage for 1 hour.",
                ingredients: [
                    { name: "Quicksilver Herb", quantity: 2, type: "uncommon_herb" },
                    { name: "Mandrake Root", quantity: 1, type: "uncommon_herb" },
                    { name: "Goblin Teeth", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Lightning Resistance", img: "icons/consumables/potions/bottle-round-corked-yellow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-necrotic-resistance",
                name: "Potion of Necrotic Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to necrotic damage for 1 hour.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" },
                    { name: "Wolf Fang", quantity: 1, type: "monster_part" },
                    { name: "Charcoal Powder", quantity: 1, type: "common_component" }
                ],
                output: { name: "Potion of Necrotic Resistance", img: "icons/consumables/potions/bottle-ornate-bat-teal.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-poison",
                name: "Potion of Poison",
                rarity: "uncommon",
                time: "2 hours",
                learned: false,
                description: "A creature that drinks this takes 3d6 poison damage and must succeed on a DC 13 Constitution save or be poisoned for 24 hours.",
                ingredients: [
                    { name: "Toadstool", quantity: 3, type: "common_herb" },
                    { name: "Goblin Teeth", quantity: 2, type: "monster_part" },
                    { name: "Naphtha Oil", quantity: 1, type: "liquid" }
                ],
                output: { name: "Potion of Poison", img: "icons/consumables/potions/potion-jar-corked-labeled-poison-skull-green.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-poison-resistance",
                name: "Potion of Poison Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to poison damage and advantage on saving throws against being poisoned for 1 hour.",
                ingredients: [
                    { name: "Silverleaf", quantity: 3, type: "common_herb" },
                    { name: "Toadstool", quantity: 1, type: "common_herb" },
                    { name: "Charcoal Powder", quantity: 1, type: "common_component" }
                ],
                output: { name: "Potion of Poison Resistance", img: "icons/consumables/potions/bottle-corked-green.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-psychic-resistance",
                name: "Potion of Psychic Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to psychic damage for 1 hour.",
                ingredients: [
                    { name: "Dreamfern", quantity: 3, type: "uncommon_herb" },
                    { name: "Pixie Dust", quantity: 1, type: "uncommon_component" }
                ],
                output: { name: "Potion of Psychic Resistance", img: "icons/consumables/potions/bottle-bulb-corked-purple.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-psionic-fortitude",
                name: "Potion of Psionic Fortitude",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Advantage on Intelligence and Wisdom saving throws for 1 hour.",
                ingredients: [
                    { name: "Dreamfern", quantity: 3, type: "uncommon_herb" },
                    { name: "Mandrake Root", quantity: 1, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Psionic Fortitude", img: "icons/consumables/potions/bottle-conical-corked-purple.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-polychromy",
                name: "Potion of Polychromy",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Change your skin, hair, and eye color to any color you choose for 1 hour.",
                ingredients: [
                    { name: "Catnip", quantity: 2, type: "common_herb" },
                    { name: "Pixie Dust", quantity: 2, type: "uncommon_component" },
                    { name: "Moonpetal Flower", quantity: 1, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Polychromy", img: "icons/consumables/potions/bottle-round-corked-pink.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-pugilism",
                name: "Potion of Pugilism",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Unarmed strikes deal 1d6 bludgeoning damage and count as magical for 1 hour.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" },
                    { name: "Giant Toenail", quantity: 1, type: "monster_part" },
                    { name: "Troll Blood", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Pugilism", img: "icons/consumables/potions/bottle-round-corked-red.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-radiant-resistance",
                name: "Potion of Radiant Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to radiant damage for 1 hour.",
                ingredients: [
                    { name: "Moonpetal Flower", quantity: 3, type: "uncommon_herb" },
                    { name: "Mandrake Root", quantity: 1, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Radiant Resistance", img: "icons/consumables/potions/bottle-round-corked-yellow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-resistance",
                name: "Potion of Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to one damage type of the brewer's choice for 1 hour.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" },
                    { name: "Pixie Dust", quantity: 1, type: "uncommon_component" },
                    { name: "Toadstool", quantity: 1, type: "common_herb" }
                ],
                output: { name: "Potion of Resistance", img: "icons/consumables/potions/bottle-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-thunder-resistance",
                name: "Potion of Thunder Resistance",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "Resistance to thunder damage for 1 hour.",
                ingredients: [
                    { name: "Quicksilver Herb", quantity: 1, type: "uncommon_herb" },
                    { name: "Goblin Teeth", quantity: 3, type: "monster_part" }
                ],
                output: { name: "Potion of Thunder Resistance", img: "icons/consumables/potions/bottle-conical-bubbling-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "philter-of-love",
                name: "Philter of Love",
                rarity: "uncommon",
                time: "4 hours",
                learned: false,
                description: "The next creature the drinker sees within 10 minutes becomes their true love for 1 hour.",
                ingredients: [
                    { name: "Catnip", quantity: 3, type: "common_herb" },
                    { name: "Moonpetal Flower", quantity: 2, type: "uncommon_herb" },
                    { name: "Rabbit Foot", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Philter of Love", img: "icons/consumables/potions/bottle-pear-corked-pink.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // ADDITIONAL RARE RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-aqueous-form",
                name: "Potion of Aqueous Form",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Transform into a pool of water for up to 10 minutes. You can't attack or cast spells.",
                ingredients: [
                    { name: "Sea Kelp", quantity: 3, type: "uncommon_herb" },
                    { name: "Merfolk Scale", quantity: 2, type: "monster_part" },
                    { name: "Ethereal Dust", quantity: 1, type: "rare_component" }
                ],
                output: { name: "Potion of Aqueous Form", img: "icons/consumables/potions/bottle-round-corked-blue.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "elixir-of-health",
                name: "Elixir of Health",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Cures all diseases and removes blinded, deafened, paralyzed, and poisoned conditions.",
                ingredients: [
                    { name: "Mandrake Root", quantity: 3, type: "uncommon_herb" },
                    { name: "Bloodgrass", quantity: 4, type: "common_herb" },
                    { name: "Troll Blood", quantity: 2, type: "monster_part" }
                ],
                output: { name: "Elixir of Health", img: "icons/consumables/potions/bottle-corked-green.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "elixir-frost-giant-strength",
                name: "Elixir of Frost Giant Strength",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Strength becomes 23 for 1 hour.",
                ingredients: [
                    { name: "Frost Giant Knuckle", quantity: 1, type: "rare_monster_part" },
                    { name: "Mandrake Root", quantity: 3, type: "uncommon_herb" },
                    { name: "Troll Blood", quantity: 2, type: "monster_part" }
                ],
                output: { name: "Elixir of Frost Giant Strength", img: "icons/consumables/potions/bottle-conical-corked-cyan.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "elixir-fire-giant-strength",
                name: "Elixir of Fire Giant Strength",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Strength becomes 25 for 1 hour.",
                ingredients: [
                    { name: "Fire Giant Heartstring", quantity: 1, type: "rare_monster_part" },
                    { name: "Mandrake Root", quantity: 3, type: "uncommon_herb" },
                    { name: "Magmin Ash", quantity: 2, type: "uncommon_component" }
                ],
                output: { name: "Elixir of Fire Giant Strength", img: "icons/consumables/potions/bottle-round-corked-orange.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-invulnerability",
                name: "Potion of Invulnerability",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Resistance to all damage types for 1 minute.",
                ingredients: [
                    { name: "Basilisk Eye", quantity: 2, type: "rare_monster_part" },
                    { name: "Ethereal Dust", quantity: 2, type: "rare_component" },
                    { name: "Mandrake Root", quantity: 2, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Invulnerability", img: "icons/consumables/potions/flask-corked-red-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-maximum-power",
                name: "Potion of Maximum Power",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "The next spell you cast deals maximum damage instead of rolling.",
                ingredients: [
                    { name: "Mindflayer Tentacle", quantity: 1, type: "rare_monster_part" },
                    { name: "Harpy Feather", quantity: 2, type: "rare_monster_part" },
                    { name: "Ethereal Dust", quantity: 1, type: "rare_component" }
                ],
                output: { name: "Potion of Maximum Power", img: "icons/consumables/potions/flask-corked-blue-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-mind-control-beast",
                name: "Potion of Mind Control (Beast)",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Cast Dominate Beast on a beast that drinks this potion (no save). Duration: 1 hour.",
                ingredients: [
                    { name: "Aboleth Slime", quantity: 1, type: "rare_monster_part" },
                    { name: "Dreamfern", quantity: 3, type: "uncommon_herb" },
                    { name: "Rabbit Foot", quantity: 1, type: "monster_part" }
                ],
                output: { name: "Potion of Mind Control (Beast)", img: "icons/consumables/potions/conical-ornate-purple.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-mind-control-humanoid",
                name: "Potion of Mind Control (Humanoid)",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Cast Dominate Person on a humanoid that drinks this potion (no save). Duration: 1 hour.",
                ingredients: [
                    { name: "Aboleth Slime", quantity: 1, type: "rare_monster_part" },
                    { name: "Mindflayer Tentacle", quantity: 1, type: "rare_monster_part" },
                    { name: "Dreamfern", quantity: 2, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Mind Control (Humanoid)", img: "icons/consumables/potions/bottle-pear-corked-labeled-ornamental-purple.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "oil-etherealness",
                name: "Oil of Etherealness",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "Coats a creature with oil, sending them to the Ethereal Plane for 1 hour.",
                ingredients: [
                    { name: "Ethereal Dust", quantity: 3, type: "rare_component" },
                    { name: "Will-o-Wisp Essence", quantity: 1, type: "rare_monster_part" },
                    { name: "Displacer Beast Tentacle", quantity: 1, type: "rare_monster_part" }
                ],
                output: { name: "Oil of Etherealness", img: "icons/consumables/potions/bottle-pear-corked-labeled-ornamental-purple.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-diminution",
                name: "Potion of Diminution",
                rarity: "rare",
                time: "1 day",
                learned: false,
                description: "The drinker shrinks to Tiny size for 1d4 hours, gaining advantage on Dexterity (Stealth) checks.",
                ingredients: [
                    { name: "Beholder Eyestalk", quantity: 1, type: "rare_monster_part" },
                    { name: "Dreamfern", quantity: 2, type: "uncommon_herb" },
                    { name: "Pixie Dust", quantity: 2, type: "uncommon_component" }
                ],
                output: { name: "Potion of Diminution", img: "icons/consumables/potions/bottle-conical-corked-cyan.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // ADDITIONAL VERY RARE RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-greater-invisibility",
                name: "Potion of Greater Invisibility",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Greater Invisibility for 1 minute — you remain invisible even when attacking or casting spells.",
                ingredients: [
                    { name: "Shadow Essence", quantity: 2, type: "very_rare_component" },
                    { name: "Displacer Beast Tentacle", quantity: 2, type: "rare_monster_part" },
                    { name: "Ethereal Dust", quantity: 2, type: "rare_component" }
                ],
                output: { name: "Potion of Greater Invisibility", img: "icons/consumables/potions/bottle-corked-empty.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-longevity",
                name: "Potion of Longevity",
                rarity: "very_rare",
                time: "3 days",
                learned: false,
                description: "Reduces the drinker's apparent age by 1d6+6 years, to a minimum of 13.",
                ingredients: [
                    { name: "Unicorn Horn Shaving", quantity: 1, type: "very_rare_component" },
                    { name: "Phoenix Ash", quantity: 1, type: "very_rare_component" },
                    { name: "Mandrake Root", quantity: 6, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Longevity", img: "icons/consumables/potions/flask-corked-yellow-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-mind-control-monster",
                name: "Potion of Mind Control (Monster)",
                rarity: "very_rare",
                time: "3 days",
                learned: false,
                description: "Cast Dominate Monster on a creature that drinks this potion (no save). Duration: 1 hour.",
                ingredients: [
                    { name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component" },
                    { name: "Aboleth Slime", quantity: 2, type: "rare_monster_part" },
                    { name: "Mindflayer Tentacle", quantity: 2, type: "rare_monster_part" }
                ],
                output: { name: "Potion of Mind Control (Monster)", img: "icons/consumables/potions/flask-corked-purple-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-possibility",
                name: "Potion of Possibility",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Gain two Fragments of Possibility, each granting +2d4 to one attack roll, ability check, or saving throw.",
                ingredients: [
                    { name: "Paladin's Tear", quantity: 1, type: "very_rare_component" },
                    { name: "Celestial Feather", quantity: 1, type: "very_rare_component" },
                    { name: "Dreamfern", quantity: 3, type: "uncommon_herb" }
                ],
                output: { name: "Potion of Possibility", img: "icons/consumables/potions/flask-corked-blue-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "oil-sharpness",
                name: "Oil of Sharpness",
                rarity: "very_rare",
                time: "2 days",
                learned: false,
                description: "Coats a weapon or ammunition, granting a +3 bonus to attack and damage rolls for 1 hour.",
                ingredients: [
                    { name: "Wyvern Poison Gland", quantity: 1, type: "rare_monster_part" },
                    { name: "Medusa Blood", quantity: 1, type: "very_rare_component" },
                    { name: "Storm Eagle Talon", quantity: 2, type: "rare_monster_part" }
                ],
                output: { name: "Oil of Sharpness", img: "icons/consumables/potions/bottle-metal-yellow-gray.webp", type: "consumable", quantity: 1 }
            },

            // ─────────────────────────────────────────────────────────────
            // ADDITIONAL LEGENDARY RECIPES
            // ─────────────────────────────────────────────────────────────
            {
                id: "potion-giant-size",
                name: "Potion of Giant Size",
                rarity: "legendary",
                time: "7 days",
                learned: false,
                description: "The drinker grows to Huge size for 24 hours, doubling weapon damage dice.",
                ingredients: [
                    { name: "Storm Giant Blood", quantity: 2, type: "legendary_component" },
                    { name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component" },
                    { name: "Dragon Blood", quantity: 1, type: "legendary_component" }
                ],
                output: { name: "Potion of Giant Size", img: "icons/consumables/potions/flask-corked-red-glow.webp", type: "consumable", quantity: 1 }
            },
            {
                id: "potion-dragons-majesty",
                name: "Potion of Dragon's Majesty",
                rarity: "legendary",
                time: "7 days",
                learned: false,
                description: "Transform into an adult dragon of a type chosen at brewing for 1 hour.",
                ingredients: [
                    { name: "Dragon Scale", quantity: 4, type: "legendary_component" },
                    { name: "Dragon Blood", quantity: 3, type: "legendary_component" },
                    { name: "Demon Horn Fragment", quantity: 2, type: "legendary_component" }
                ],
                output: { name: "Potion of Dragon's Majesty", img: "icons/consumables/potions/flask-corked-red-glow.webp", type: "consumable", quantity: 1 }
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
