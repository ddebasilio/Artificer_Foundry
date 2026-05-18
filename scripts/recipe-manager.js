import {CRAFTING_TIMES} from "./ingredient-data.js";

export class RecipeManager {
    constructor() {
        this.recipes = this.loadDefaultRecipes();
    }

    loadDefaultRecipes() {
        return [
            // COMMON RECIPES (Xanathar's: 1 day, 25 gp)
            {
                id: "potion-healing",
                name: "Potion of Healing",
                rarity: "common",
                learned: true,
                description: "A simple red liquid that restores 2d4+2 hit points.",
                ingredients: [
                    {name: "Bloodgrass", quantity: 2, type: "common_herb"},
                    {name: "Pure Water", quantity: 1, type: "liquid"}
                ],
                output: {
                    name: "Potion of Healing",
                    img: "icons/consumables/potions/bottle-corked-red.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "antitoxin",
                name: "Antitoxin",
                rarity: "common",
                learned: true,
                description: "Gives advantage on saving throws against poison for 1 hour.",
                ingredients: [
                    {name: "Silverleaf", quantity: 2, type: "common_herb"},
                    {name: "Charcoal Powder", quantity: 1, type: "common_component"}
                ],
                output: {
                    name: "Antitoxin",
                    img: "icons/consumables/potions/bottle-corked-green.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "alchemists-fire",
                name: "Alchemist's Fire",
                rarity: "common",
                learned: true,
                description: "A flask of sticky, adhesive fluid that ignites on contact with air.",
                ingredients: [
                    {name: "Naphtha Oil", quantity: 1, type: "liquid"},
                    {name: "Sulphur", quantity: 1, type: "common_component"},
                    {name: "Rendered Fat", quantity: 1, type: "common_component"}
                ],
                output: {
                    name: "Alchemist's Fire",
                    img: "icons/consumables/potions/bottle-round-corked-orange.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-climbing",
                name: "Potion of Climbing",
                rarity: "common",
                learned: true,
                description: "Gain climbing speed equal to walking speed for 1 hour.",
                ingredients: [
                    {name: "Spidergrass", quantity: 2, type: "common_herb"},
                    {name: "Pure Water", quantity: 1, type: "liquid"}
                ],
                output: {
                    name: "Potion of Climbing",
                    img: "icons/consumables/potions/bottle-conical-corked-labeled-shell-cyan.webp",
                    type: "consumable",
                    quantity: 1
                }
            },

            // UNCOMMON RECIPES (Xanathar's: 3 days, 100 gp)
            {
                id: "potion-greater-healing",
                name: "Potion of Greater Healing",
                rarity: "uncommon",
                learned: false,
                description: "Restores 4d4+4 hit points.",
                ingredients: [
                    {name: "Bloodgrass", quantity: 3, type: "common_herb"},
                    {name: "Mandrake Root", quantity: 1, type: "uncommon_herb"},
                    {name: "Pure Water", quantity: 1, type: "liquid"}
                ],
                output: {
                    name: "Potion of Greater Healing",
                    img: "icons/consumables/potions/bottle-corked-red.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-cold-resistance",
                name: "Potion of Cold Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to cold for 1 hour.",
                ingredients: [
                    {name: "Mandrake Root", quantity: 1, type: "uncommon_herb"},
                    {name: "Silverleaf", quantity: 2, type: "common_herb"},
                    {name: "Troll Blood", quantity: 1, type: "monster_part"}
                ],
                output: {
                    name: "Potion of Cold Resistance",
                    img: "icons/consumables/potions/bottle-conical-corked-cyan.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-fire-resistance",
                name: "Potion of Fire Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to fire for 1 hour.",
                ingredients: [
                    {name: "Firebloom", quantity: 1, type: "uncommon_herb"},
                    {name: "Salamander Scale", quantity: 2, type: "monster_part"}
                ],
                output: {
                    name: "Potion of Fire Resistance",
                    img: "icons/consumables/potions/bottle-round-corked-orange.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-lightning-resistance",
                name: "Potion of Lightning Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to lightning for 1 hour.",
                ingredients: [
                    {name: "Quicksilver Herb", quantity: 2, type: "uncommon_herb"},
                    {name: "Mandrake Root", quantity: 1, type: "uncommon_herb"},
                    {name: "Goblin Teeth", quantity: 1, type: "monster_part"}
                ],
                output: {
                    name: "Potion of Lightning Resistance",
                    img: "icons/consumables/potions/bottle-round-corked-yellow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-necrotic-resistance",
                name: "Potion of Necrotic Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to necrotic for 1 hour.",
                ingredients: [
                    {name: "Mandrake Root", quantity: 2, type: "uncommon_herb"},
                    {name: "Wolf Fang", quantity: 1, type: "monster_part"},
                    {name: "Charcoal Powder", quantity: 1, type: "common_component"}
                ],
                output: {
                    name: "Potion of Necrotic Resistance",
                    img: "icons/consumables/potions/bottle-ornate-bat-teal.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-poison",
                name: "Potion of Poison",
                rarity: "uncommon",
                learned: false,
                description: "Appears to be a Potion of Healing; deals 3d6 poison damage.",
                ingredients: [
                    {name: "Toadstool", quantity: 3, type: "common_herb"},
                    {name: "Goblin Teeth", quantity: 1, type: "monster_part"},
                    {name: "Naphtha Oil", quantity: 1, type: "liquid"}
                ],
                output: {
                    name: "Potion of Poison",
                    img: "icons/consumables/potions/bottle-corked-green.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-psychic-resistance",
                name: "Potion of Psychic Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to psychic for 1 hour.",
                ingredients: [
                    {name: "Dreamfern", quantity: 3, type: "uncommon_herb"},
                    {name: "Pixie Dust", quantity: 1, type: "uncommon_component"}
                ],
                output: {
                    name: "Potion of Psychic Resistance",
                    img: "icons/consumables/potions/bottle-bulb-corked-purple.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-psionic-fortitude",
                name: "Potion of Psionic Fortitude",
                rarity: "uncommon",
                learned: false,
                description: "Advantage on Int/Wis saves for 1 hour.",
                ingredients: [
                    {name: "Dreamfern", quantity: 3, type: "uncommon_herb"},
                    {name: "Mandrake Root", quantity: 1, type: "uncommon_herb"}
                ],
                output: {
                    name: "Potion of Psionic Fortitude",
                    img: "icons/consumables/potions/bottle-conical-corked-purple.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-radiant-resistance",
                name: "Potion of Radiant Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to radiant for 1 hour.",
                ingredients: [
                    {name: "Moonpetal Flower", quantity: 3, type: "uncommon_herb"},
                    {name: "Mandrake Root", quantity: 1, type: "uncommon_herb"}
                ],
                output: {
                    name: "Potion of Radiant Resistance",
                    img: "icons/consumables/potions/bottle-round-corked-yellow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-resistance",
                name: "Potion of Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to one chosen type for 1 hour.",
                ingredients: [
                    {name: "Mandrake Root", quantity: 2, type: "uncommon_herb"},
                    {name: "Pixie Dust", quantity: 1, type: "uncommon_component"},
                    {name: "Toadstool", quantity: 1, type: "common_herb"}
                ],
                output: {
                    name: "Potion of Resistance",
                    img: "icons/consumables/potions/bottle-corked-blue.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-thunder-resistance",
                name: "Potion of Thunder Resistance",
                rarity: "uncommon",
                learned: false,
                description: "Resistance to thunder for 1 hour.",
                ingredients: [
                    {name: "Quicksilver Herb", quantity: 2, type: "uncommon_herb"},
                    {name: "Giant Toenail", quantity: 1, type: "monster_part"},
                    {name: "Pine Resin", quantity: 1, type: "common_component"}
                ],
                output: {
                    name: "Potion of Thunder Resistance",
                    img: "icons/consumables/potions/bottle-round-corked-yellow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-polychromy",
                name: "Potion of Polychromy",
                rarity: "uncommon",
                learned: false,
                description: "Changes the drinker's skin color for 1d4 hours.",
                ingredients: [
                    {name: "Moonpetal Flower", quantity: 2, type: "uncommon_herb"},
                    {name: "Pixie Dust", quantity: 1, type: "uncommon_component"}
                ],
                output: {
                    name: "Potion of Polychromy",
                    img: "icons/consumables/potions/bottle-bulb-corked-purple.webp",
                    type: "consumable",
                    quantity: 1
                }
            },

            // RARE RECIPES (Xanathar's: 1 workweek / 7 days, 1000 gp)
            {
                id: "potion-superior-healing",
                name: "Potion of Superior Healing",
                rarity: "rare",
                learned: false,
                description: "Restores 8d4+8 hit points.",
                ingredients: [
                    {name: "Bloodgrass", quantity: 6, type: "common_herb"},
                    {name: "Mandrake Root", quantity: 2, type: "uncommon_herb"},
                    {name: "Troll Blood", quantity: 2, type: "monster_part"},
                    {name: "Basilisk Eye", quantity: 1, type: "rare_monster_part"}
                ],
                output: {
                    name: "Potion of Superior Healing",
                    img: "icons/consumables/potions/bottle-corked-red.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-speed",
                name: "Potion of Speed",
                rarity: "rare",
                learned: false,
                description: "Haste for 1 minute (no concentration).",
                ingredients: [
                    {name: "Quicksilver Herb", quantity: 2, type: "uncommon_herb"},
                    {name: "Harpy Feather", quantity: 3, type: "rare_monster_part"},
                    {name: "Manticore Spine", quantity: 1, type: "rare_monster_part"}
                ],
                output: {
                    name: "Potion of Speed",
                    img: "icons/consumables/potions/bottle-corked-blue.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-mind-reading",
                name: "Potion of Mind Reading",
                rarity: "rare",
                learned: false,
                description: "Detect Thoughts (no concentration) for 1 hour.",
                ingredients: [
                    {name: "Mindflayer Tentacle", quantity: 1, type: "rare_monster_part"},
                    {name: "Dreamfern", quantity: 2, type: "uncommon_herb"},
                    {name: "Aboleth Slime", quantity: 1, type: "rare_monster_part"}
                ],
                output: {
                    name: "Potion of Mind Reading",
                    img: "icons/consumables/potions/bottle-corked-empty.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "elixir-stone-giant-strength",
                name: "Elixir of Stone Giant Strength",
                rarity: "rare",
                learned: false,
                description: "Strength becomes 23 for 1 hour.",
                ingredients: [
                    {name: "Stone Giant Knuckle", quantity: 1, type: "rare_monster_part"},
                    {name: "Mandrake Root", quantity: 3, type: "uncommon_herb"},
                    {name: "Gargoyle Dust", quantity: 2, type: "rare_monster_part"}
                ],
                output: {
                    name: "Elixir of Stone Giant Strength",
                    img: "icons/consumables/potions/bottle-corked-empty.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "elixir-health",
                name: "Elixir of Health",
                rarity: "rare",
                learned: false,
                description: "Cures disease, blindness, deafness, paralysis, poison.",
                ingredients: [
                    {name: "Mandrake Root", quantity: 3, type: "uncommon_herb"},
                    {name: "Bloodgrass", quantity: 4, type: "common_herb"},
                    {name: "Troll Blood", quantity: 2, type: "monster_part"}
                ],
                output: {
                    name: "Elixir of Health",
                    img: "icons/consumables/potions/bottle-corked-green.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "elixir-frost-giant-strength",
                name: "Elixir of Frost Giant Strength",
                rarity: "rare",
                learned: false,
                description: "Strength becomes 23 for 1 hour.",
                ingredients: [
                    {name: "Frost Giant Knuckle", quantity: 1, type: "rare_monster_part"},
                    {name: "Mandrake Root", quantity: 3, type: "uncommon_herb"},
                    {name: "Troll Blood", quantity: 2, type: "monster_part"}
                ],
                output: {
                    name: "Elixir of Frost Giant Strength",
                    img: "icons/consumables/potions/bottle-conical-corked-cyan.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "elixir-fire-giant-strength",
                name: "Elixir of Fire Giant Strength",
                rarity: "rare",
                learned: false,
                description: "Strength becomes 25 for 1 hour.",
                ingredients: [
                    {name: "Fire Giant Heartstring", quantity: 1, type: "rare_monster_part"},
                    {name: "Mandrake Root", quantity: 3, type: "uncommon_herb"},
                    {name: "Salamander Scale", quantity: 2, type: "monster_part"}
                ],
                output: {
                    name: "Elixir of Fire Giant Strength",
                    img: "icons/consumables/potions/bottle-round-corked-orange.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-maximum-power",
                name: "Potion of Maximum Power",
                rarity: "rare",
                learned: false,
                description: "Next damage spell uses max dice.",
                ingredients: [
                    {name: "Mindflayer Tentacle", quantity: 1, type: "rare_monster_part"},
                    {name: "Harpy Feather", quantity: 2, type: "rare_monster_part"},
                    {name: "Ethereal Dust", quantity: 1, type: "rare_component"}
                ],
                output: {
                    name: "Potion of Maximum Power",
                    img: "icons/consumables/potions/flask-corked-blue-glow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-mind-control-beast",
                name: "Potion of Mind Control (Beast)",
                rarity: "rare",
                learned: false,
                description: "Dominate Beast for 1 hour.",
                ingredients: [
                    {name: "Aboleth Slime", quantity: 1, type: "rare_monster_part"},
                    {name: "Dreamfern", quantity: 3, type: "uncommon_herb"},
                    {name: "Rabbit Foot", quantity: 1, type: "monster_part"}
                ],
                output: {
                    name: "Potion of Mind Control (Beast)",
                    img: "icons/consumables/potions/bottle-conical-corked-purple.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "oil-etherealness",
                name: "Oil of Etherealness",
                rarity: "rare",
                learned: false,
                description: "Etherealness for 1 hour.",
                ingredients: [
                    {name: "Ethereal Dust", quantity: 3, type: "rare_component"},
                    {name: "Will-o-Wisp Essence", quantity: 1, type: "rare_monster_part"},
                    {name: "Displacer Beast Tentacle", quantity: 1, type: "rare_monster_part"}
                ],
                output: {
                    name: "Oil of Etherealness",
                    img: "icons/consumables/potions/bottle-pear-corked-labeled-ornamental-purple.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-diminution",
                name: "Potion of Diminution",
                rarity: "rare",
                learned: false,
                description: "Reduce for 1d4 hours.",
                ingredients: [
                    {name: "Beholder Eyestalk", quantity: 1, type: "rare_monster_part"},
                    {name: "Dreamfern", quantity: 2, type: "uncommon_herb"},
                    {name: "Pixie Dust", quantity: 2, type: "uncommon_component"}
                ],
                output: {
                    name: "Potion of Diminution",
                    img: "icons/consumables/potions/bottle-conical-corked-purple.webp",
                    type: "consumable",
                    quantity: 1
                }
            },

            // VERY RARE RECIPES (Xanathar's: 2 workweeks / 14 days, 10000 gp)
            {
                id: "potion-supreme-healing",
                name: "Potion of Supreme Healing",
                rarity: "very_rare",
                learned: false,
                description: "Restores 10d4+20 hit points.",
                ingredients: [
                    {name: "Mandrake Root", quantity: 4, type: "uncommon_herb"},
                    {name: "Troll Blood", quantity: 4, type: "monster_part"},
                    {name: "Unicorn Horn Shaving", quantity: 1, type: "very_rare_component"},
                    {name: "Phoenix Ash", quantity: 1, type: "very_rare_component"}
                ],
                output: {
                    name: "Potion of Supreme Healing",
                    img: "icons/consumables/potions/bottle-corked-red.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-invisibility",
                name: "Potion of Invisibility",
                rarity: "very_rare",
                learned: false,
                description: "Invisible for 1 hour.",
                ingredients: [
                    {name: "Displacer Beast Tentacle", quantity: 1, type: "rare_monster_part"},
                    {name: "Ethereal Dust", quantity: 2, type: "rare_component"},
                    {name: "Shadow Essence", quantity: 1, type: "very_rare_component"}
                ],
                output: {
                    name: "Potion of Invisibility",
                    img: "icons/consumables/potions/bottle-corked-empty.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "elixir-cloud-giant-strength",
                name: "Elixir of Cloud Giant Strength",
                rarity: "very_rare",
                learned: false,
                description: "Strength becomes 27 for 1 hour.",
                ingredients: [
                    {name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component"},
                    {name: "Mandrake Root", quantity: 6, type: "uncommon_herb"},
                    {name: "Storm Eagle Talon", quantity: 2, type: "rare_monster_part"}
                ],
                output: {
                    name: "Elixir of Cloud Giant Strength",
                    img: "icons/consumables/potions/bottle-corked-empty.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-gaseous-form",
                name: "Potion of Gaseous Form",
                rarity: "very_rare",
                learned: false,
                description: "Gaseous Form for 1 hour.",
                ingredients: [
                    {name: "Will-o-Wisp Essence", quantity: 2, type: "rare_monster_part"},
                    {name: "Ethereal Dust", quantity: 3, type: "rare_component"},
                    {name: "Medusa Blood", quantity: 1, type: "very_rare_component"}
                ],
                output: {
                    name: "Potion of Gaseous Form",
                    img: "icons/consumables/potions/bottle-corked-empty.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-longevity",
                name: "Potion of Longevity",
                rarity: "very_rare",
                learned: false,
                description: "Reduce age by 1d6+6 years.",
                ingredients: [
                    {name: "Unicorn Horn Shaving", quantity: 1, type: "very_rare_component"},
                    {name: "Phoenix Ash", quantity: 1, type: "very_rare_component"},
                    {name: "Mandrake Root", quantity: 6, type: "uncommon_herb"}
                ],
                output: {
                    name: "Potion of Longevity",
                    img: "icons/consumables/potions/flask-corked-yellow-glow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-mind-control-monster",
                name: "Potion of Mind Control (Monster)",
                rarity: "very_rare",
                learned: false,
                description: "Dominate Monster for 1 hour.",
                ingredients: [
                    {name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component"},
                    {name: "Aboleth Slime", quantity: 2, type: "rare_monster_part"},
                    {name: "Mindflayer Tentacle", quantity: 2, type: "rare_monster_part"}
                ],
                output: {
                    name: "Potion of Mind Control (Monster)",
                    img: "icons/consumables/potions/flask-corked-blue-glow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "oil-sharpness",
                name: "Oil of Sharpness",
                rarity: "very_rare",
                learned: false,
                description: "+3 to attack/damage for 1 hour.",
                ingredients: [
                    {name: "Wyvern Poison Gland", quantity: 1, type: "rare_monster_part"},
                    {name: "Medusa Blood", quantity: 1, type: "very_rare_component"},
                    {name: "Storm Eagle Talon", quantity: 2, type: "rare_monster_part"}
                ],
                output: {
                    name: "Oil of Sharpness",
                    img: "icons/consumables/potions/bottle-metal-yellow-gray.webp",
                    type: "consumable",
                    quantity: 1
                }
            },

            // LEGENDARY RECIPES (Xanathar's: 4 workweeks / 28 days, 50000 gp)
            {
                id: "elixir-storm-giant-strength",
                name: "Elixir of Storm Giant Strength",
                rarity: "legendary",
                learned: false,
                description: "Strength becomes 29 for 1 hour.",
                ingredients: [
                    {name: "Storm Giant Blood", quantity: 3, type: "legendary_component"},
                    {name: "Lightning-Struck Wood", quantity: 2, type: "very_rare_component"},
                    {name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component"}
                ],
                output: {
                    name: "Elixir of Storm Giant Strength",
                    img: "icons/consumables/potions/bottle-corked-empty.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-dragon-strength",
                name: "Potion of Dragon Strength",
                rarity: "legendary",
                learned: false,
                description: "Strength becomes 30 for 1 hour.",
                ingredients: [
                    {name: "Dragon Blood", quantity: 2, type: "legendary_component"},
                    {name: "Storm Giant Blood", quantity: 1, type: "legendary_component"},
                    {name: "Unicorn Horn", quantity: 1, type: "legendary_component"}
                ],
                output: {
                    name: "Potion of Dragon Strength",
                    img: "icons/consumables/potions/bottle-corked-red.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-giant-size",
                name: "Potion of Giant Size",
                rarity: "legendary",
                learned: false,
                description: "Huge for 24 hours; doubled weapon dice.",
                ingredients: [
                    {name: "Storm Giant Blood", quantity: 2, type: "legendary_component"},
                    {name: "Cloud Giant Heartstring", quantity: 1, type: "very_rare_component"},
                    {name: "Dragon Blood", quantity: 1, type: "legendary_component"}
                ],
                output: {
                    name: "Potion of Giant Size",
                    img: "icons/consumables/potions/flask-corked-red-glow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
            {
                id: "potion-dragons-majesty",
                name: "Potion of Dragon's Majesty",
                rarity: "legendary",
                learned: false,
                description: "Transform into adult dragon for 1 hour.",
                ingredients: [
                    {name: "Dragon Scale", quantity: 4, type: "legendary_component"},
                    {name: "Dragon Blood", quantity: 3, type: "legendary_component"},
                    {name: "Demon Horn Fragment", quantity: 1, type: "legendary_component"}
                ],
                output: {
                    name: "Potion of Dragon's Majesty",
                    img: "icons/consumables/potions/flask-corked-red-glow.webp",
                    type: "consumable",
                    quantity: 1
                }
            },
        ];
    }

    /**
     * Get all recipes annotated with whether the actor has learned them.
     */
    getRecipesForActor(actor) {
        const actorId = actor?.id;
        if (!actorId) return this.recipes.map(r => ({...r, isLearned: r.learned}));

        const recipeData = game.settings.get("artificer-foundry", "recipeData") ?? {};
        const learnedIds = recipeData[actorId] ?? [];

        return this.recipes.map(r => ({
            ...r,
            isLearned: r.learned || learnedIds.includes(r.id)
        }));
    }

    /**
     * Mark a recipe as learned for a specific actor.
     */
    async learnRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let newData = foundry.utils.duplicate(recipeData);
        if (!newData[actorId]) newData[actorId] = [];
        if (!newData[actorId].includes(recipeId)) {
            newData[actorId].push(recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }

    /**
     * Remove a learned recipe from a specific actor.
     */
    async forgetRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "recipeData");
        let newData = foundry.utils.duplicate(recipeData);
        if (newData[actorId]) {
            newData[actorId] = newData[actorId].filter(id => id !== recipeId);
            await game.settings.set("artificer-foundry", "recipeData", newData);
        }
    }
}

