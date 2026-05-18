/**
 * Potion & oil data for the Artificer Foundry crafting system.
 * Extracted and cleaned from 5e.tools data (items.json / items-base.json).
 *
 * Keyed by lowercase item name matching recipe output names.
 *
 * Fields:
 *   description  {string}   – Plain-text item description for Foundry
 *   rarity       {string}   – none | common | uncommon | rare | very rare | legendary
 *   resist       {string[]} – Damage types the item grants resistance to
 *   ability      {object}   – e.g. { static: { str: 21 } } for giant-strength potions
 *   attachedSpells {string[]} – Spell names associated with this item
 *   bonusWeapon  {string|null} – Weapon bonus (e.g. "+3" for Oil of Sharpness)
 *   price        {number}      – Market price in gold pieces (XGE consumable pricing)
 */
export const POTION_DATA = {

  // ── A ────────────────────────────────────────────────────────────────────

  "aqua delerium": {
    description: "When you drink this swirling, iridescent potion, you enter a hallucinatory state for 1 minute. During this time, you have advantage on Charisma checks and saving throws, but disadvantage on Wisdom checks and saving throws. The liquid shifts between impossible colors and smells faintly of ozone.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "aqua expurgo": {
    description: "When you drink this crystal-clear potion, it purges your body of toxins and corruption. You end one disease or one condition afflicting you (blinded, deafened, paralyzed, or poisoned). Additionally, if you are cursed, you can make a DC 15 Charisma saving throw to end one curse affecting you. The liquid is perfectly transparent and has no taste or smell.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── B ────────────────────────────────────────────────────────────────────

  "bath potion": {
    description: "When poured into a body of water large enough to submerge yourself in, this potion transforms the water into a restorative bath for 1 hour. Any creature that spends at least 10 minutes soaking in the bath removes one level of exhaustion and gains 1d4 temporary hit points that last until the next long rest. The potion smells of lavender and chamomile and turns the water a soft, glowing blue.",
    rarity: "common",
    price: 50,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "bottled abyss": {
    description: "This black, viscous liquid writhes within its container as if alive. When you throw this bottle at a point within 60 feet, it shatters and opens a momentary rift to the Abyss in a 20-foot-radius sphere. Each creature in the area must make a DC 18 Charisma saving throw or take 8d6 necrotic damage and be frightened for 1 minute. On a success, a creature takes half damage and isn't frightened. The area becomes difficult terrain for 1 minute as tendrils of abyssal energy linger.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "bottled breath": {
    description: "This bottle contains a breath of elemental air. When you inhale it, you either exhale it or hold it. If you exhale the breath, you gain the effect of the Gust of Wind spell. If you hold the breath, you don't need to breathe for 1 hour, though you can end this benefit early (for example, to speak). Ending it early doesn't give you the benefit of exhaling the breath.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: ["gust of wind"], bonusWeapon: null
  },

  // ── E ────────────────────────────────────────────────────────────────────

  "elixir of health": {
    description: "When you drink this potion, it cures any disease afflicting you, and it removes the blinded, deafened, paralyzed, and poisoned conditions. The clear red liquid has tiny bubbles of light in it.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "essence of rage": {
    description: "When you drink this thick, red-black potion, you enter a furious state for 1 minute. You gain the benefits of the Rage feature as if you were a barbarian: you have advantage on Strength checks and saving throws, you gain a +2 bonus to melee weapon damage rolls, and you have resistance to bludgeoning, piercing, and slashing damage. You can't cast spells or concentrate on them while in this state. The rage ends early if you are knocked unconscious or if your turn ends and you haven't attacked a hostile creature or taken damage since your last turn.",
    rarity: "rare",
    price: 2500,
    resist: ["bludgeoning", "piercing", "slashing"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── G ────────────────────────────────────────────────────────────────────

  "greater rejuvenation potion": {
    description: "When you drink this radiant golden potion, you regain 10d4 + 20 hit points, all levels of exhaustion are removed, and any conditions afflicting you (blinded, deafened, paralyzed, poisoned, or stunned) end. Additionally, your hit point maximum cannot be reduced for 24 hours. The liquid glows with a warm, pulsing light and tastes of honeyed sunlight.",
    rarity: "legendary",
    price: 50000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "gunnspier (rare)": {
    description: "This potent alchemical concoction is brewed from rare subterranean fungi and enchanted mineral salts. When you drink it, you gain darkvision out to 120 feet and tremorsense out to 30 feet for 8 hours. During this time, you have advantage on Wisdom (Perception) checks that rely on hearing. The liquid is thick, gray, and gritty, with tiny luminescent specks suspended throughout.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "gunnspier (very rare)": {
    description: "This highly refined alchemical concoction is brewed from exceedingly rare subterranean fungi and heavily enchanted mineral salts. When you drink it, you gain darkvision out to 120 feet, tremorsense out to 60 feet, and blindsight out to 30 feet for 8 hours. During this time, you have advantage on Wisdom (Perception) checks and cannot be surprised. The liquid is thick, silvery, and luminous, swirling with motes of light.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── O ────────────────────────────────────────────────────────────────────

  "oil of etherealness": {
    description: "One vial of this oil can cover one Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Etherealness spell for 1 hour. Beads of this cloudy, gray oil form on the outside of its container and quickly evaporate.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["etherealness"], bonusWeapon: null
  },

  "oil of sharpness": {
    description: "One vial of this oil can coat one melee weapon or twenty pieces of ammunition that deal slashing or piercing damage. Applying the oil takes 1 minute. For 1 hour, the coated item is magical and has a +3 bonus to attack and damage rolls. This clear, gelatinous oil sparkles with tiny, ultrathin silver shards.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: "+3"
  },

  "oil of slipperiness": {
    description: "This sticky black unguent is thick and heavy in the container, but it flows quickly when poured. The oil can cover a Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of a Freedom of Movement spell for 8 hours. Alternatively, the oil can be poured on the ground as an action, where it covers a 10-foot square, duplicating the effect of the Grease spell in that area for 8 hours.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: ["freedom of movement", "grease"], bonusWeapon: null
  },

  // ── P ────────────────────────────────────────────────────────────────────

  "philter of love": {
    description: "The next time you see a creature within 10 minutes after drinking this philter, you become charmed by that creature for 1 hour. If the creature is of a species and gender you are normally attracted to, you regard it as your true love while you are charmed. This potion's rose-hued, effervescent liquid contains one easy-to-miss bubble shaped like a heart.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of acid resistance": {
    description: "When you drink this potion, you gain resistance to acid damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["acid"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of advantage": {
    description: "When you drink this potion, you gain advantage on one ability check, attack roll, or saving throw of your choice that you make within the next hour. This potion takes the form of a sparkling, golden mist that moves and pours like water.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of animal friendship": {
    description: "When you drink this potion, you can cast the Animal Friendship spell (save DC 13) for 1 hour at will. Shaking the bottle fails to mix the contents.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: ["animal friendship"], bonusWeapon: null
  },

  "potion of aqueous form": {
    description: "When you drink this potion, you transform into a pool of water. You return to your true form after 10 minutes or if you are incapacitated or die. While in this form you have a swimming speed of 30 feet, can move over or through liquids and enter other creatures' spaces, can rise to your normal height, and can pass through Tiny openings. You have resistance to nonmagical damage and advantage on Strength, Dexterity, and Constitution saving throws. You can't talk, attack, cast spells, or activate magic items.",
    rarity: "rare",
    price: 2500,
    resist: ["bludgeoning", "piercing", "slashing"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of clairvoyance": {
    description: "When you drink this potion, you gain the effect of the Clairvoyance spell. An eye forms on your forehead for the duration. The clear liquid has an eyeball-shaped cloud floating in it.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["clairvoyance"], bonusWeapon: null
  },

  "potion of climbing": {
    description: "When you drink this potion, you gain a climbing speed equal to your walking speed for 1 hour. During this time, you have advantage on Strength (Athletics) checks you make to climb. The potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors.",
    rarity: "common",
    price: 50,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of cloud giant strength": {
    description: "When you drink this potion, your Strength score changes to 27 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a cloud giant.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: { static: { str: 27 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of cold resistance": {
    description: "When you drink this potion, you gain resistance to cold damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["cold"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of comprehension": {
    description: "When you drink this potion, you gain the effect of a Comprehend Languages spell for 1 hour. This liquid is a clear concoction with bits of salt and soot swirling in it.",
    rarity: "common",
    price: 50,
    resist: [], ability: null, attachedSpells: ["comprehend languages"], bonusWeapon: null
  },

  "potion of controlled mutation": {
    description: "When you drink this bubbling, multicolored potion, your body undergoes a temporary controlled mutation for 1 hour. Roll on the following table to determine the effect: (1-2) you grow gills and gain a swimming speed of 40 feet, (3-4) your skin hardens granting +2 AC, (5-6) you sprout wings and gain a flying speed of 30 feet, (7-8) your limbs elongate granting 10 feet additional reach, (9-10) you gain darkvision 120 feet and advantage on Perception checks. The mutation is visibly obvious.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of diminution": {
    description: "When you drink this potion, you gain the \"reduce\" effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion's liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["enlarge/reduce"], bonusWeapon: null
  },

  "potion of dragon's breath (uncommon)": {
    description: "After drinking this potion, you can use a bonus action to exhale a 15-foot cone of elemental energy. Each creature in the area must make a DC 13 Dexterity saving throw, taking 2d6 damage of a type determined by the dragon whose essence was used (acid, cold, fire, lightning, or poison) on a failed save, or half as much on a success. The effect ends after you exhale three times or when 1 hour has passed.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of dragon's breath (rare)": {
    description: "After drinking this potion, you can use a bonus action to exhale a 30-foot cone of elemental energy. Each creature in the area must make a DC 15 Dexterity saving throw, taking 4d6 damage of a type determined by the dragon whose essence was used (acid, cold, fire, lightning, or poison) on a failed save, or half as much on a success. The effect ends after you exhale three times or when 1 hour has passed.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of dragon's breath (very rare)": {
    description: "After drinking this potion, you can use a bonus action to exhale a 60-foot cone of elemental energy. Each creature in the area must make a DC 17 Dexterity saving throw, taking 8d6 damage of a type determined by the dragon whose essence was used (acid, cold, fire, lightning, or poison) on a failed save, or half as much on a success. The effect ends after you exhale three times or when 1 hour has passed.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of dragon's majesty": {
    description: "This potion looks like liquid gold, with a single scale from a chromatic, gem, or metallic dragon suspended in it. When you drink this potion, you transform into an adult dragon of the same kind as the dragon the scale came from for 1 hour. Any equipment you are wearing or carrying melds into your new form or falls to the ground (your choice). For the duration, you use the game statistics of the adult dragon instead of your own, but you retain your languages, personality, and memories. You can't use a dragon's Change Shape or its legendary or lair actions.",
    rarity: "legendary",
    price: 50000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of fire breath": {
    description: "After drinking this potion, you can use a bonus action to exhale fire at a target within 30 feet of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed. This potion's orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of fire giant strength": {
    description: "When you drink this potion, your Strength score changes to 25 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a fire giant.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: { static: { str: 25 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of fire resistance": {
    description: "When you drink this potion, you gain resistance to fire damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["fire"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of flying": {
    description: "When you drink this potion, you gain a flying speed equal to your walking speed for 1 hour and can hover. If you're airborne when the potion wears off, you fall unless you have some other means of staying aloft. The potion's clear liquid floats at the top of its container and has cloudy white impurities drifting in it.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of force resistance": {
    description: "When you drink this potion, you gain resistance to force damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["force"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of frost giant strength": {
    description: "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a frost giant.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: { static: { str: 23 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of gaseous form": {
    description: "When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no concentration required) or until you end the effect as a bonus action. This potion's container seems to hold fog that moves and pours like water.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["gaseous form"], bonusWeapon: null
  },

  "potion of giant size": {
    description: "When you drink this potion, you become Huge for 24 hours if you are Medium or smaller, otherwise the potion does nothing. Your Strength becomes 25 if it isn't already higher, and your hit point maximum is doubled (your current hit points are doubled when you drink the potion). The reach of your melee attacks increases by 5 feet. When rolling damage for weapons enlarged in this manner, roll three times the normal number of dice. When the effect ends, any hit points you have above your hit point maximum become temporary hit points.",
    rarity: "legendary",
    price: 50000,
    resist: [], ability: { static: { str: 25 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of greater healing": {
    description: "You regain 4d4 + 4 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "uncommon",
    price: 150,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of greater invisibility": {
    description: "This potion's container looks empty but feels as though it holds liquid. When you drink the potion, you have the Invisible condition for 1 hour. Unlike the Potion of Invisibility, this effect does not end when you attack or cast a spell.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of growth": {
    description: "When you drink this potion, you gain the \"enlarge\" effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion's liquid continuously expands from a tiny bead to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: ["enlarge/reduce"], bonusWeapon: null
  },

  "potion of healing": {
    description: "You regain 2d4 + 2 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "common",
    price: 50,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of heroism": {
    description: "For 1 hour after drinking it, you gain 10 temporary hit points that last for 1 hour. For the same duration, you are under the effect of the Bless spell (no concentration required). This blue potion bubbles and steams as if boiling.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["bless"], bonusWeapon: null
  },

  "potion of hill giant strength": {
    description: "When you drink this potion, your Strength score changes to 21 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a hill giant.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: { static: { str: 21 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of invisibility": {
    description: "This potion's container looks empty but feels as though it holds liquid. When you drink it, you become invisible for 1 hour. Anything you wear or carry is invisible with you. The effect ends early if you make an attack roll, deal damage, or cast a spell.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of invulnerability": {
    description: "For 1 minute after you drink this potion, you have resistance to all damage. The potion's syrupy liquid looks like liquefied iron.",
    rarity: "rare",
    price: 2500,
    resist: ["acid","bludgeoning","cold","fire","force","lightning","necrotic","piercing","poison","psychic","radiant","slashing","thunder"],
    ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of lightning resistance": {
    description: "When you drink this potion, you gain resistance to lightning damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["lightning"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of longevity": {
    description: "When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a Potion of Longevity, there is a 10 percent cumulative chance that you instead age by 1d6 + 6 years. Suspended in this amber liquid are a scorpion's tail, an adder's fang, a dead spider, and a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of maximum power": {
    description: "The first time you cast a damage-dealing spell of 4th level or lower within 1 minute after drinking the potion, instead of rolling dice to determine the damage dealt, you can instead use the highest number possible for each die. This glowing purple liquid smells of sugar and plum, but it has a muddy taste.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of mind control (beast)": {
    description: "When you drink this potion, you can cast the Dominate Beast spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don't, the potion is wasted. If the target's initial saving throw fails, the effect lasts for 1 hour with no concentration required. The charmed creature has disadvantage on new saving throws to break the effect during this time.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["dominate beast"], bonusWeapon: null
  },

  "potion of mind control (humanoid)": {
    description: "When you drink this potion, you can cast the Dominate Person spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don't, the potion is wasted. If the target's initial saving throw fails, the effect lasts for 1 hour with no concentration required. The charmed creature has disadvantage on new saving throws to break the effect during this time.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["dominate person"], bonusWeapon: null
  },

  "potion of mind control (monster)": {
    description: "When you drink this potion, you can cast the Dominate Monster spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don't, the potion is wasted. If the target's initial saving throw fails, the effect lasts for 1 hour with no concentration required. The charmed creature has disadvantage on new saving throws to break the effect during this time.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: ["dominate monster"], bonusWeapon: null
  },

  "potion of mind reading": {
    description: "When you drink this potion, you gain the effect of the Detect Thoughts spell (save DC 13). The potion's dense, purple liquid has an ovoid cloud of pink smoke floating in it.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: ["detect thoughts"], bonusWeapon: null
  },

  "potion of necrotic resistance": {
    description: "When you drink this potion, you gain resistance to necrotic damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["necrotic"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of poison": {
    description: "This concoction looks, smells, and tastes like a Potion of Healing or other beneficial potion. However, it is actually poison masked by illusion magic. An Identify spell reveals its true nature. If you drink it, you take 4d6 poison damage and must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of poison resistance": {
    description: "When you drink this potion, you gain resistance to poison damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["poison"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of polychromy": {
    description: "When you drink this potion, you and everything you are wearing or carrying take on a rainbow-hued appearance for 1 hour. During that time, you can use a bonus action to turn any color or combination of colors you choose. If you mimic the colors of your surroundings, your hues continually shift to match your surroundings, and you have advantage on Dexterity (Stealth) checks until you change your colors again or the potion wears off. The potion is separated into seven brightly colored bands of immiscible liquids and has a syrupy taste.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of possibility": {
    description: "When you drink this clear potion, you gain two Fragments of Possibility, each of which looks like a Tiny, grayish bead of energy that follows you around. Each fragment lasts for 8 hours or until used. When you make an attack roll, an ability check, or a saving throw, you can expend your fragment to roll an additional d20 and choose which result to use. While you have one or more Fragments of Possibility from this potion, you can't gain another Fragment of Possibility from any source.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of psionic fortitude": {
    description: "When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. This black potion swirls with shimmering flecks of pink and purple.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of psychic resistance": {
    description: "When you drink this potion, you gain resistance to psychic damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["psychic"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of pugilism": {
    description: "After you drink this potion, each unarmed strike you make deals an extra 1d6 force damage on a hit. This effect lasts 10 minutes. This potion is a thick green fluid that tastes like spinach.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of radiant resistance": {
    description: "When you drink this potion, you gain resistance to radiant damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["radiant"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of resistance": {
    description: "When you drink this potion, you gain resistance to one type of damage for 1 hour. The DM chooses the type or determines it randomly.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of speed": {
    description: "When you drink this potion, you gain the effect of the Haste spell for 1 minute (no concentration required) without suffering the wave of lethargy that typically occurs when the effect ends. The potion's yellow fluid is streaked with black and swirls on its own.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: ["haste"], bonusWeapon: null
  },

  "potion of spell recovery": {
    description: "When you drink this shimmering, arcane-infused potion, you regain one expended spell slot. If you are a spellcaster with multiple spell slots, the slot recovered is of 3rd level or lower (your choice). The liquid is translucent blue with tiny runes that dissolve as you drink.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of stone giant strength": {
    description: "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a stone giant.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: { static: { str: 23 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of storm giant strength": {
    description: "When you drink this potion, your Strength score changes to 29 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a storm giant.",
    rarity: "legendary",
    price: 50000,
    resist: [], ability: { static: { str: 29 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of superior healing": {
    description: "You regain 8d4 + 8 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "rare",
    price: 450,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of supreme healing": {
    description: "You regain 10d4 + 20 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "very rare",
    price: 1350,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of thunder resistance": {
    description: "When you drink this potion, you gain resistance to thunder damage for 1 hour.",
    rarity: "uncommon",
    price: 250,
    resist: ["thunder"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of vitality": {
    description: "When you drink this potion, your exhaustion level, if any, is reduced by 1. In addition, if you are poisoned, the condition ends. For the next 24 hours, you regain the maximum number of hit points for any Hit Die you spend. The potion's crimson liquid regularly pulses with dull light, calling to mind a heartbeat.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of watchful rest": {
    description: "When you drink this potion, you gain the following benefits for the next 8 hours: magic can't put you to sleep, and you can remain awake during a long rest and still gain its benefits. This sweet, amber-colored brew has no effect on creatures that don't require sleep, such as elves.",
    rarity: "common",
    price: 50,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of water breathing": {
    description: "You can breathe underwater for 24 hours after drinking this potion. This potion's cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it.",
    rarity: "uncommon",
    price: 250,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── R ────────────────────────────────────────────────────────────────────

  "rejuvenation potion": {
    description: "When you drink this potion, you regain 8d4 + 8 hit points and one level of exhaustion is removed. Additionally, any reduction to your hit point maximum is removed. The potion glows with a soft amber light and tastes of warm honey and citrus.",
    rarity: "very rare",
    price: 25000,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── T ────────────────────────────────────────────────────────────────────

  "trollblood potion": {
    description: "When you drink this chunky, green potion, you gain regeneration for 1 minute. At the start of each of your turns, you regain 2d4 hit points. If you take acid or fire damage, this regeneration doesn't function at the start of your next turn. The potion has a thick, unpleasant consistency and smells of moss and iron.",
    rarity: "rare",
    price: 2500,
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── V ────────────────────────────────────────────────────────────────────

  "vampire blood potion": {
    description: "When you drink this dark crimson potion, you gain several vampiric traits for 1 hour. You have resistance to necrotic damage, darkvision out to 60 feet, and a climbing speed equal to your walking speed. When you hit with a melee attack, you regain hit points equal to half the necrotic damage dealt. However, you have vulnerability to radiant damage and take 1d10 radiant damage if you start your turn in direct sunlight. The thick liquid clings to the bottle and smells of copper.",
    rarity: "very rare",
    price: 25000,
    resist: ["necrotic"], ability: null, attachedSpells: [], bonusWeapon: null
  },
};

