import { FORGE_CRAFTING_TIMES } from "./forge-data.js";

export class ForgeRecipeManager {
    constructor() {
        this.recipes = this.loadDefaultRecipes();
    }

    loadDefaultRecipes() {
        return [
            // ── COMMON BLUEPRINTS ─────────────────────────────────────────────
            {
                id: "silvered-weapon",
                name: "Silvered Weapon",
                rarity: "common",
                category: "weapon",
                learned: true,
                description: "Coat a weapon in silver to bypass resistances of lycanthropes and devils.",
                ingredients: [
                    { name: "Iron Ingot", quantity: 1, type: "metal" },
                    { name: "Silver Dust", quantity: 2, type: "metal" },
                    { name: "Leather Strips", quantity: 1, type: "crafting_supply" }
                ],
                output: {
                    name: "Silvered Weapon",
                    img: "icons/weapons/swords/greatsword-crossguard-silver.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "adamantine-ammunition",
                name: "Adamantine Ammunition",
                rarity: "common",
                category: "ammunition",
                learned: true,
                description: "Forge 10 pieces of adamantine-tipped ammunition.",
                ingredients: [
                    { name: "Adamantine Shard", quantity: 1, type: "rare_metal" },
                    { name: "Iron Ingot", quantity: 1, type: "metal" }
                ],
                output: {
                    name: "Adamantine Ammunition",
                    img: "icons/weapons/ammunition/arrowhead-glowing-orange.webp",
                    type: "ammunition",
                    quantity: 10
                }
            },
            {
                id: "shield-plus-1",
                name: "Shield +1",
                rarity: "common",
                category: "shield",
                learned: true,
                description: "A reinforced shield granting +1 AC beyond normal.",
                ingredients: [
                    { name: "Iron Ingot", quantity: 2, type: "metal" },
                    { name: "Hardwood Plank", quantity: 1, type: "crafting_supply" },
                    { name: "Leather Strips", quantity: 1, type: "crafting_supply" }
                ],
                output: {
                    name: "Shield +1",
                    img: "icons/equipment/shield/heater-steel-worn.webp",
                    type: "equipment",
                    quantity: 1
                }
            },

            // ── UNCOMMON BLUEPRINTS ───────────────────────────────────────────
            {
                id: "weapon-plus-1",
                name: "Weapon +1",
                rarity: "uncommon",
                category: "weapon",
                learned: false,
                description: "A finely crafted magical weapon with +1 to attack and damage.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 2, type: "metal" },
                    { name: "Arcane Essence", quantity: 1, type: "essence" },
                    { name: "Leather Strips", quantity: 1, type: "crafting_supply" }
                ],
                output: {
                    name: "Weapon +1",
                    img: "icons/weapons/swords/greatsword-crossguard-steel.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "armor-plus-1",
                name: "Armor +1",
                rarity: "uncommon",
                category: "armor",
                learned: false,
                description: "Magically reinforced armor granting +1 AC.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 3, type: "metal" },
                    { name: "Arcane Essence", quantity: 1, type: "essence" },
                    { name: "Leather Strips", quantity: 2, type: "crafting_supply" }
                ],
                output: {
                    name: "Armor +1",
                    img: "icons/equipment/chest/breastplate-layered-steel.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "adamantine-armor",
                name: "Adamantine Armor",
                rarity: "uncommon",
                category: "armor",
                learned: false,
                description: "Armor reinforced with adamantine; critical hits become normal hits.",
                ingredients: [
                    { name: "Adamantine Shard", quantity: 3, type: "rare_metal" },
                    { name: "Steel Ingot", quantity: 2, type: "metal" },
                    { name: "Leather Strips", quantity: 2, type: "crafting_supply" }
                ],
                output: {
                    name: "Adamantine Armor",
                    img: "icons/equipment/chest/breastplate-layered-steel.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "mithral-armor",
                name: "Mithral Armor",
                rarity: "uncommon",
                category: "armor",
                learned: false,
                description: "Light, flexible mithral armor with no stealth penalty.",
                ingredients: [
                    { name: "Mithral Ore", quantity: 3, type: "rare_metal" },
                    { name: "Steel Ingot", quantity: 1, type: "metal" },
                    { name: "Silk Thread", quantity: 2, type: "crafting_supply" }
                ],
                output: {
                    name: "Mithral Armor",
                    img: "icons/equipment/chest/breastplate-riveted-grey.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "javelin-of-lightning",
                name: "Javelin of Lightning",
                rarity: "uncommon",
                category: "weapon",
                learned: false,
                description: "A javelin that transforms into a bolt of lightning when thrown.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 1, type: "metal" },
                    { name: "Storm Shard", quantity: 1, type: "essence" },
                    { name: "Hardwood Plank", quantity: 1, type: "crafting_supply" }
                ],
                output: {
                    name: "Javelin of Lightning",
                    img: "icons/weapons/polearms/javelin-lightning-blue.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "sentinel-shield",
                name: "Sentinel Shield",
                rarity: "uncommon",
                category: "shield",
                learned: false,
                description: "A shield granting advantage on initiative and Perception checks.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 2, type: "metal" },
                    { name: "Arcane Essence", quantity: 1, type: "essence" },
                    { name: "Gemstone Chip", quantity: 1, type: "gem" }
                ],
                output: {
                    name: "Sentinel Shield",
                    img: "icons/equipment/shield/heater-steel-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "cloak-of-protection",
                name: "Cloak of Protection",
                rarity: "uncommon",
                category: "wondrous",
                learned: false,
                description: "+1 bonus to AC and saving throws.",
                ingredients: [
                    { name: "Silk Thread", quantity: 3, type: "crafting_supply" },
                    { name: "Arcane Essence", quantity: 2, type: "essence" },
                    { name: "Moonstone", quantity: 1, type: "gem" }
                ],
                output: {
                    name: "Cloak of Protection",
                    img: "icons/equipment/back/cloak-collared-blue.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "gauntlets-of-ogre-power",
                name: "Gauntlets of Ogre Power",
                rarity: "uncommon",
                category: "wondrous",
                learned: false,
                description: "Strength becomes 19 while wearing these gauntlets.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 2, type: "metal" },
                    { name: "Ogre Knucklebone", quantity: 2, type: "monster_part" },
                    { name: "Arcane Essence", quantity: 1, type: "essence" }
                ],
                output: {
                    name: "Gauntlets of Ogre Power",
                    img: "icons/equipment/hand/gauntlet-plate-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "boots-of-elvenkind",
                name: "Boots of Elvenkind",
                rarity: "uncommon",
                category: "wondrous",
                learned: false,
                description: "Silent steps; advantage on Stealth checks for moving silently.",
                ingredients: [
                    { name: "Leather Strips", quantity: 3, type: "crafting_supply" },
                    { name: "Silk Thread", quantity: 1, type: "crafting_supply" },
                    { name: "Arcane Essence", quantity: 1, type: "essence" }
                ],
                output: {
                    name: "Boots of Elvenkind",
                    img: "icons/equipment/feet/boots-leather-engraved-brown.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "bag-of-holding",
                name: "Bag of Holding",
                rarity: "uncommon",
                category: "wondrous",
                learned: false,
                description: "An extradimensional bag that holds up to 500 pounds.",
                ingredients: [
                    { name: "Leather Strips", quantity: 2, type: "crafting_supply" },
                    { name: "Silk Thread", quantity: 2, type: "crafting_supply" },
                    { name: "Arcane Essence", quantity: 2, type: "essence" }
                ],
                output: {
                    name: "Bag of Holding",
                    img: "icons/containers/bags/pack-leather-black-brown.webp",
                    type: "equipment",
                    quantity: 1
                }
            },

            // ── RARE BLUEPRINTS ───────────────────────────────────────────────
            {
                id: "weapon-plus-2",
                name: "Weapon +2",
                rarity: "rare",
                category: "weapon",
                learned: false,
                description: "A masterwork magical weapon with +2 to attack and damage.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 3, type: "metal" },
                    { name: "Mithral Ore", quantity: 1, type: "rare_metal" },
                    { name: "Greater Arcane Essence", quantity: 1, type: "rare_essence" },
                    { name: "Elemental Core", quantity: 1, type: "rare_essence" }
                ],
                output: {
                    name: "Weapon +2",
                    img: "icons/weapons/swords/greatsword-crossguard-gold.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "armor-plus-2",
                name: "Armor +2",
                rarity: "rare",
                category: "armor",
                learned: false,
                description: "Masterwork magical armor granting +2 AC.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 4, type: "metal" },
                    { name: "Mithral Ore", quantity: 2, type: "rare_metal" },
                    { name: "Greater Arcane Essence", quantity: 1, type: "rare_essence" },
                    { name: "Leather Strips", quantity: 2, type: "crafting_supply" }
                ],
                output: {
                    name: "Armor +2",
                    img: "icons/equipment/chest/breastplate-layered-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "shield-plus-2",
                name: "Shield +2",
                rarity: "rare",
                category: "shield",
                learned: false,
                description: "A masterwork shield granting +2 AC beyond normal.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 3, type: "metal" },
                    { name: "Mithral Ore", quantity: 1, type: "rare_metal" },
                    { name: "Greater Arcane Essence", quantity: 1, type: "rare_essence" }
                ],
                output: {
                    name: "Shield +2",
                    img: "icons/equipment/shield/heater-steel-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "flame-tongue",
                name: "Flame Tongue",
                rarity: "rare",
                category: "weapon",
                learned: false,
                description: "A sword that erupts in flames on command, dealing extra 2d6 fire damage.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 3, type: "metal" },
                    { name: "Elemental Core", quantity: 2, type: "rare_essence" },
                    { name: "Fire Giant Heartstring", quantity: 1, type: "rare_monster_part" },
                    { name: "Ruby", quantity: 1, type: "rare_gem" }
                ],
                output: {
                    name: "Flame Tongue",
                    img: "icons/weapons/swords/greatsword-fire.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "dragon-scale-mail",
                name: "Dragon Scale Mail",
                rarity: "rare",
                category: "armor",
                learned: false,
                description: "Armor made from dragon scales; +1 AC and resistance to a damage type.",
                ingredients: [
                    { name: "Dragon Scale", quantity: 6, type: "legendary_component" },
                    { name: "Steel Ingot", quantity: 2, type: "metal" },
                    { name: "Greater Arcane Essence", quantity: 1, type: "rare_essence" },
                    { name: "Leather Strips", quantity: 3, type: "crafting_supply" }
                ],
                output: {
                    name: "Dragon Scale Mail",
                    img: "icons/equipment/chest/breastplate-scale-green.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "amulet-of-health",
                name: "Amulet of Health",
                rarity: "rare",
                category: "wondrous",
                learned: false,
                description: "Constitution becomes 19 while wearing this amulet.",
                ingredients: [
                    { name: "Gold Ingot", quantity: 2, type: "metal" },
                    { name: "Greater Arcane Essence", quantity: 2, type: "rare_essence" },
                    { name: "Ruby", quantity: 1, type: "rare_gem" }
                ],
                output: {
                    name: "Amulet of Health",
                    img: "icons/equipment/neck/necklace-pendant-ruby-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "belt-of-dwarvenkind",
                name: "Belt of Dwarvenkind",
                rarity: "rare",
                category: "wondrous",
                learned: false,
                description: "+2 Constitution, darkvision, and dwarven affinity.",
                ingredients: [
                    { name: "Steel Ingot", quantity: 2, type: "metal" },
                    { name: "Leather Strips", quantity: 3, type: "crafting_supply" },
                    { name: "Greater Arcane Essence", quantity: 1, type: "rare_essence" },
                    { name: "Sapphire", quantity: 1, type: "rare_gem" }
                ],
                output: {
                    name: "Belt of Dwarvenkind",
                    img: "icons/equipment/waist/belt-buckle-steel.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "cloak-of-displacement",
                name: "Cloak of Displacement",
                rarity: "rare",
                category: "wondrous",
                learned: false,
                description: "Projects an illusion causing disadvantage on attacks against you.",
                ingredients: [
                    { name: "Silk Thread", quantity: 4, type: "crafting_supply" },
                    { name: "Displacer Beast Tentacle", quantity: 2, type: "rare_monster_part" },
                    { name: "Greater Arcane Essence", quantity: 2, type: "rare_essence" }
                ],
                output: {
                    name: "Cloak of Displacement",
                    img: "icons/equipment/back/cloak-collared-purple.webp",
                    type: "equipment",
                    quantity: 1
                }
            },

            // ── VERY RARE BLUEPRINTS ──────────────────────────────────────────
            {
                id: "weapon-plus-3",
                name: "Weapon +3",
                rarity: "very_rare",
                category: "weapon",
                learned: false,
                description: "A legendary-quality weapon with +3 to attack and damage.",
                ingredients: [
                    { name: "Mithral Ore", quantity: 3, type: "rare_metal" },
                    { name: "Adamantine Shard", quantity: 2, type: "rare_metal" },
                    { name: "Superior Arcane Essence", quantity: 2, type: "very_rare_essence" },
                    { name: "Star Metal Fragment", quantity: 1, type: "very_rare_metal" }
                ],
                output: {
                    name: "Weapon +3",
                    img: "icons/weapons/swords/greatsword-crossguard-gold.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "armor-plus-3",
                name: "Armor +3",
                rarity: "very_rare",
                category: "armor",
                learned: false,
                description: "Legendary-quality armor granting +3 AC.",
                ingredients: [
                    { name: "Mithral Ore", quantity: 4, type: "rare_metal" },
                    { name: "Adamantine Shard", quantity: 3, type: "rare_metal" },
                    { name: "Superior Arcane Essence", quantity: 2, type: "very_rare_essence" },
                    { name: "Leather Strips", quantity: 3, type: "crafting_supply" }
                ],
                output: {
                    name: "Armor +3",
                    img: "icons/equipment/chest/breastplate-layered-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "shield-plus-3",
                name: "Shield +3",
                rarity: "very_rare",
                category: "shield",
                learned: false,
                description: "A legendary shield granting +3 AC beyond normal.",
                ingredients: [
                    { name: "Mithral Ore", quantity: 3, type: "rare_metal" },
                    { name: "Adamantine Shard", quantity: 2, type: "rare_metal" },
                    { name: "Superior Arcane Essence", quantity: 1, type: "very_rare_essence" }
                ],
                output: {
                    name: "Shield +3",
                    img: "icons/equipment/shield/heater-steel-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "frost-brand",
                name: "Frost Brand",
                rarity: "very_rare",
                category: "weapon",
                learned: false,
                description: "A sword dealing extra 1d6 cold damage and granting fire resistance.",
                ingredients: [
                    { name: "Mithral Ore", quantity: 2, type: "rare_metal" },
                    { name: "Frost Giant Knuckle", quantity: 2, type: "rare_monster_part" },
                    { name: "Superior Arcane Essence", quantity: 2, type: "very_rare_essence" },
                    { name: "Sapphire", quantity: 2, type: "rare_gem" }
                ],
                output: {
                    name: "Frost Brand",
                    img: "icons/weapons/swords/greatsword-blue.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "animated-shield",
                name: "Animated Shield",
                rarity: "very_rare",
                category: "shield",
                learned: false,
                description: "A shield that animates and hovers to protect you hands-free.",
                ingredients: [
                    { name: "Mithral Ore", quantity: 3, type: "rare_metal" },
                    { name: "Superior Arcane Essence", quantity: 2, type: "very_rare_essence" },
                    { name: "Elemental Core", quantity: 2, type: "rare_essence" },
                    { name: "Star Metal Fragment", quantity: 1, type: "very_rare_metal" }
                ],
                output: {
                    name: "Animated Shield",
                    img: "icons/equipment/shield/heater-steel-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "belt-of-fire-giant-strength",
                name: "Belt of Fire Giant Strength",
                rarity: "very_rare",
                category: "wondrous",
                learned: false,
                description: "Strength becomes 25 while wearing this belt.",
                ingredients: [
                    { name: "Fire Giant Heartstring", quantity: 3, type: "rare_monster_part" },
                    { name: "Star Metal Fragment", quantity: 1, type: "very_rare_metal" },
                    { name: "Superior Arcane Essence", quantity: 2, type: "very_rare_essence" },
                    { name: "Ruby", quantity: 2, type: "rare_gem" }
                ],
                output: {
                    name: "Belt of Fire Giant Strength",
                    img: "icons/equipment/waist/belt-buckle-gold-red.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "wings-of-flying",
                name: "Wings of Flying",
                rarity: "very_rare",
                category: "wondrous",
                learned: false,
                description: "A cloak that transforms into wings granting 60 ft flying speed.",
                ingredients: [
                    { name: "Silk Thread", quantity: 6, type: "crafting_supply" },
                    { name: "Pegasus Hair", quantity: 3, type: "rare_monster_part" },
                    { name: "Superior Arcane Essence", quantity: 2, type: "very_rare_essence" },
                    { name: "Celestial Feather", quantity: 1, type: "very_rare_component" }
                ],
                output: {
                    name: "Wings of Flying",
                    img: "icons/equipment/back/cloak-collared-white.webp",
                    type: "equipment",
                    quantity: 1
                }
            },

            // ── LEGENDARY BLUEPRINTS ──────────────────────────────────────────
            {
                id: "vorpal-sword",
                name: "Vorpal Sword",
                rarity: "legendary",
                category: "weapon",
                learned: false,
                description: "+3 weapon that can decapitate on a natural 20.",
                ingredients: [
                    { name: "Star Metal Fragment", quantity: 3, type: "very_rare_metal" },
                    { name: "Adamantine Shard", quantity: 4, type: "rare_metal" },
                    { name: "Legendary Arcane Essence", quantity: 2, type: "legendary_essence" },
                    { name: "Dragon Blood", quantity: 2, type: "legendary_component" }
                ],
                output: {
                    name: "Vorpal Sword",
                    img: "icons/weapons/swords/greatsword-crossguard-gold.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "holy-avenger",
                name: "Holy Avenger",
                rarity: "legendary",
                category: "weapon",
                learned: false,
                description: "+3 weapon dealing extra 2d10 radiant to fiends/undead; aura of protection.",
                ingredients: [
                    { name: "Star Metal Fragment", quantity: 2, type: "very_rare_metal" },
                    { name: "Mithral Ore", quantity: 4, type: "rare_metal" },
                    { name: "Legendary Arcane Essence", quantity: 2, type: "legendary_essence" },
                    { name: "Unicorn Horn", quantity: 1, type: "legendary_component" },
                    { name: "Diamond", quantity: 1, type: "legendary_gem" }
                ],
                output: {
                    name: "Holy Avenger",
                    img: "icons/weapons/swords/greatsword-holy-gold.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "armor-of-invulnerability",
                name: "Armor of Invulnerability",
                rarity: "legendary",
                category: "armor",
                learned: false,
                description: "Resistance to nonmagical damage; can become immune for 10 minutes.",
                ingredients: [
                    { name: "Star Metal Fragment", quantity: 3, type: "very_rare_metal" },
                    { name: "Adamantine Shard", quantity: 6, type: "rare_metal" },
                    { name: "Legendary Arcane Essence", quantity: 3, type: "legendary_essence" },
                    { name: "Dragon Scale", quantity: 4, type: "legendary_component" }
                ],
                output: {
                    name: "Armor of Invulnerability",
                    img: "icons/equipment/chest/breastplate-layered-gold.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
            {
                id: "defender",
                name: "Defender",
                rarity: "legendary",
                category: "weapon",
                learned: false,
                description: "+3 weapon; can transfer bonus to AC instead of attacks.",
                ingredients: [
                    { name: "Star Metal Fragment", quantity: 2, type: "very_rare_metal" },
                    { name: "Mithral Ore", quantity: 3, type: "rare_metal" },
                    { name: "Legendary Arcane Essence", quantity: 2, type: "legendary_essence" },
                    { name: "Storm Giant Blood", quantity: 1, type: "legendary_component" },
                    { name: "Diamond", quantity: 1, type: "legendary_gem" }
                ],
                output: {
                    name: "Defender",
                    img: "icons/weapons/swords/greatsword-crossguard-gold.webp",
                    type: "weapon",
                    quantity: 1
                }
            },
            {
                id: "belt-of-storm-giant-strength",
                name: "Belt of Storm Giant Strength",
                rarity: "legendary",
                category: "wondrous",
                learned: false,
                description: "Strength becomes 29 while wearing this belt.",
                ingredients: [
                    { name: "Storm Giant Blood", quantity: 3, type: "legendary_component" },
                    { name: "Star Metal Fragment", quantity: 2, type: "very_rare_metal" },
                    { name: "Legendary Arcane Essence", quantity: 2, type: "legendary_essence" },
                    { name: "Diamond", quantity: 1, type: "legendary_gem" }
                ],
                output: {
                    name: "Belt of Storm Giant Strength",
                    img: "icons/equipment/waist/belt-buckle-gold-blue.webp",
                    type: "equipment",
                    quantity: 1
                }
            },
        ];
    }

    getRecipesForActor(actor) {
        const actorId = actor?.id;
        if (!actorId) return this.recipes.map(r => ({ ...r, isLearned: r.learned }));

        const recipeData = game.settings.get("artificer-foundry", "forgeRecipeData") ?? {};
        const learnedIds = recipeData[actorId] ?? [];

        return this.recipes.map(r => ({
            ...r,
            isLearned: r.learned || learnedIds.includes(r.id)
        }));
    }

    async learnRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "forgeRecipeData");
        let newData = foundry.utils.duplicate(recipeData);
        if (!newData[actorId]) newData[actorId] = [];
        if (!newData[actorId].includes(recipeId)) {
            newData[actorId].push(recipeId);
            await game.settings.set("artificer-foundry", "forgeRecipeData", newData);
        }
    }

    async forgetRecipe(actorId, recipeId) {
        let recipeData = game.settings.get("artificer-foundry", "forgeRecipeData");
        let newData = foundry.utils.duplicate(recipeData);
        if (newData[actorId]) {
            newData[actorId] = newData[actorId].filter(id => id !== recipeId);
            await game.settings.set("artificer-foundry", "forgeRecipeData", newData);
        }
    }
}
