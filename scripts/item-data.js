/**
 * Item data for the Artificer Foundry forge system.
 * Descriptions and metadata for craftable weapons, armor, and items.
 *
 * Fields:
 *   description  {string}   – Plain-text item description
 *   rarity       {string}   – common | uncommon | rare | very_rare | legendary
 *   type         {string}   – weapon | armor | shield | wondrous | ammunition
 *   price        {number}   – Market price in gold pieces
 *   attunement   {boolean}  – Whether the item requires attunement
 */
export const ITEM_DATA = {

  // ── COMMON ──────────────────────────────────────────────────────────────

  "silvered weapon": {
    description: "A weapon coated in silver, effective against creatures with vulnerability or immunity bypass for silvered weapons such as lycanthropes and certain devils.",
    rarity: "common",
    type: "weapon",
    price: 100,
    attunement: false
  },

  "adamantine ammunition": {
    description: "Ammunition made from adamantine, one of the hardest substances in existence. Any hit against an object with this ammunition is a critical hit.",
    rarity: "common",
    type: "ammunition",
    price: 25,
    attunement: false
  },

  "shield +1": {
    description: "While holding this shield, you have a +1 bonus to AC. This bonus is in addition to the shield's normal bonus to AC.",
    rarity: "common",
    type: "shield",
    price: 200,
    attunement: false
  },

  // ── UNCOMMON ────────────────────────────────────────────────────────────

  "weapon +1": {
    description: "You have a +1 bonus to attack and damage rolls made with this magic weapon.",
    rarity: "uncommon",
    type: "weapon",
    price: 500,
    attunement: false
  },

  "armor +1": {
    description: "You have a +1 bonus to AC while wearing this armor.",
    rarity: "uncommon",
    type: "armor",
    price: 500,
    attunement: false
  },

  "adamantine armor": {
    description: "This suit of armor is reinforced with adamantine, one of the hardest substances in existence. While you're wearing it, any critical hit against you becomes a normal hit.",
    rarity: "uncommon",
    type: "armor",
    price: 500,
    attunement: false
  },

  "mithral armor": {
    description: "Mithral is a light, flexible metal. A mithral chain shirt or breastplate can be worn under normal clothes. If the armor normally imposes disadvantage on Dexterity (Stealth) checks or has a Strength requirement, the mithral version of the armor doesn't.",
    rarity: "uncommon",
    type: "armor",
    price: 800,
    attunement: false
  },

  "javelin of lightning": {
    description: "This javelin is a magic weapon. When you hurl it and speak its command word, it transforms into a bolt of lightning, forming a line 5 feet wide that extends out from you to a target within 120 feet. Each creature in the line excluding you and the target must make a DC 13 Dexterity saving throw, taking 4d6 lightning damage on a failed save, and half as much damage on a successful one. The lightning bolt turns back into a javelin when it reaches the target.",
    rarity: "uncommon",
    type: "weapon",
    price: 500,
    attunement: false
  },

  "sentinel shield": {
    description: "While holding this shield, you have advantage on initiative rolls and Wisdom (Perception) checks. The shield is emblazoned with a symbol of an eye.",
    rarity: "uncommon",
    type: "shield",
    price: 500,
    attunement: false
  },

  "cloak of protection": {
    description: "You gain a +1 bonus to AC and saving throws while you wear this cloak.",
    rarity: "uncommon",
    type: "wondrous",
    price: 500,
    attunement: true
  },

  "gauntlets of ogre power": {
    description: "Your Strength score is 19 while you wear these gauntlets. They have no effect on you if your Strength is already 19 or higher.",
    rarity: "uncommon",
    type: "wondrous",
    price: 500,
    attunement: true
  },

  "boots of elvenkind": {
    description: "While you wear these boots, your steps make no sound, regardless of the surface you are moving across. You also have advantage on Dexterity (Stealth) checks that rely on moving silently.",
    rarity: "uncommon",
    type: "wondrous",
    price: 500,
    attunement: false
  },

  "bag of holding": {
    description: "This bag has an interior space considerably larger than its outside dimensions. The bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 15 pounds, regardless of its contents.",
    rarity: "uncommon",
    type: "wondrous",
    price: 500,
    attunement: false
  },

  // ── RARE ────────────────────────────────────────────────────────────────

  "weapon +2": {
    description: "You have a +2 bonus to attack and damage rolls made with this magic weapon.",
    rarity: "rare",
    type: "weapon",
    price: 5000,
    attunement: true
  },

  "armor +2": {
    description: "You have a +2 bonus to AC while wearing this armor.",
    rarity: "rare",
    type: "armor",
    price: 5000,
    attunement: false
  },

  "shield +2": {
    description: "While holding this shield, you have a +2 bonus to AC. This bonus is in addition to the shield's normal bonus to AC.",
    rarity: "rare",
    type: "shield",
    price: 5000,
    attunement: false
  },

  "flame tongue": {
    description: "You can use a bonus action to speak this magic sword's command word, causing flames to erupt from the blade. These flames shed bright light in a 40-foot radius and dim light for an additional 40 feet. While the sword is ablaze, it deals an extra 2d6 fire damage to any target it hits. The flames last until you use a bonus action to speak the command word again or until you drop or sheathe the sword.",
    rarity: "rare",
    type: "weapon",
    price: 5000,
    attunement: true
  },

  "dragon scale mail": {
    description: "Dragon scale mail is made of the scales of one kind of dragon. While wearing this armor, you gain a +1 bonus to AC, you have advantage on saving throws against the Frightful Presence and breath weapons of dragons, and you have resistance to one damage type determined by the kind of dragon that provided the scales.",
    rarity: "rare",
    type: "armor",
    price: 5000,
    attunement: true
  },

  "amulet of health": {
    description: "Your Constitution score is 19 while you wear this amulet. It has no effect on you if your Constitution is already 19 or higher.",
    rarity: "rare",
    type: "wondrous",
    price: 5000,
    attunement: true
  },

  "belt of dwarvenkind": {
    description: "While wearing this belt, you gain the following benefits: Your Constitution score increases by 2 (to a maximum of 20), you have advantage on Charisma (Persuasion) checks made to interact with dwarves, you have darkvision out to 60 feet, you can speak, read, and write Dwarvish, and you have a 50% chance each day at dawn of growing a full beard if you're capable of growing one.",
    rarity: "rare",
    type: "wondrous",
    price: 5000,
    attunement: true
  },

  "cloak of displacement": {
    description: "While you wear this cloak, it projects an illusion that makes you appear to be standing in a place near your actual location, causing any creature to have disadvantage on attack rolls against you. If you take damage, the property ceases to function until the start of your next turn.",
    rarity: "rare",
    type: "wondrous",
    price: 5000,
    attunement: true
  },

  // ── VERY RARE ───────────────────────────────────────────────────────────

  "weapon +3": {
    description: "You have a +3 bonus to attack and damage rolls made with this magic weapon.",
    rarity: "very_rare",
    type: "weapon",
    price: 50000,
    attunement: true
  },

  "armor +3": {
    description: "You have a +3 bonus to AC while wearing this armor.",
    rarity: "very_rare",
    type: "armor",
    price: 50000,
    attunement: false
  },

  "shield +3": {
    description: "While holding this shield, you have a +3 bonus to AC. This bonus is in addition to the shield's normal bonus to AC.",
    rarity: "very_rare",
    type: "shield",
    price: 50000,
    attunement: false
  },

  "frost brand": {
    description: "When you hit with an attack using this magic sword, the target takes an extra 1d6 cold damage. In addition, while you hold the sword, you have resistance to fire damage. In freezing temperatures, the blade sheds bright light in a 10-foot radius and dim light for an additional 10 feet. When you draw this weapon, you can extinguish all nonmagical flames within 30 feet of you.",
    rarity: "very_rare",
    type: "weapon",
    price: 50000,
    attunement: true
  },

  "animated shield": {
    description: "While holding this shield, you can speak its command word as a bonus action to cause it to animate. The shield leaps into the air and hovers in your space to protect you as if you were wielding it, leaving your hands free. The shield remains animated for 1 minute, until you use a bonus action to end this effect, or until you are incapacitated or die.",
    rarity: "very_rare",
    type: "shield",
    price: 50000,
    attunement: true
  },

  "belt of fire giant strength": {
    description: "While wearing this belt, your Strength score changes to 25. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score.",
    rarity: "very_rare",
    type: "wondrous",
    price: 50000,
    attunement: true
  },

  "wings of flying": {
    description: "While wearing this cloak, you can use an action to speak its command word. This turns the cloak into a pair of bat wings or bird wings on your back for 1 hour or until you repeat the command word as an action. The wings give you a flying speed of 60 feet.",
    rarity: "very_rare",
    type: "wondrous",
    price: 50000,
    attunement: true
  },

  // ── LEGENDARY ───────────────────────────────────────────────────────────

  "vorpal sword": {
    description: "You gain a +3 bonus to attack and damage rolls made with this magic weapon. In addition, the weapon ignores resistance to slashing damage. When you attack a creature that has at least one head with this weapon and roll a 20 on the attack roll, you cut off one of the creature's heads.",
    rarity: "legendary",
    type: "weapon",
    price: 100000,
    attunement: true
  },

  "holy avenger": {
    description: "You gain a +3 bonus to attack and damage rolls made with this magic weapon. When you hit a fiend or an undead with it, that creature takes an extra 2d10 radiant damage. While you hold the drawn sword, it creates an aura in a 10-foot radius around you. You and all creatures friendly to you in the aura have advantage on saving throws against spells and other magical effects.",
    rarity: "legendary",
    type: "weapon",
    price: 100000,
    attunement: true
  },

  "armor of invulnerability": {
    description: "You have resistance to nonmagical damage while you wear this armor. Additionally, you can use an action to make yourself immune to nonmagical damage for 10 minutes or until you are no longer wearing the armor. Once this special action is used, it can't be used again until the next dawn.",
    rarity: "legendary",
    type: "armor",
    price: 100000,
    attunement: true
  },

  "defender": {
    description: "You gain a +3 bonus to attack and damage rolls made with this magic weapon. The first time you attack with the sword on each of your turns, you can transfer some or all of the sword's bonus to your Armor Class, instead of using the bonus on any attacks that turn.",
    rarity: "legendary",
    type: "weapon",
    price: 100000,
    attunement: true
  },

  "belt of storm giant strength": {
    description: "While wearing this belt, your Strength score changes to 29. The item has no effect on you if your Strength without the belt is equal to or greater than the belt's score.",
    rarity: "legendary",
    type: "wondrous",
    price: 100000,
    attunement: true
  },
};
