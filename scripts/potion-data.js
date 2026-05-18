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
 */
export const POTION_DATA = {

  // ── A ────────────────────────────────────────────────────────────────────

  "alchemist's fire": {
    description: "This sticky, adhesive fluid ignites when exposed to air. As an action, you can throw this flask up to 20 feet, shattering it on impact. Make a ranged attack against a creature or object, treating the alchemist's fire as an improvised weapon. On a hit, the target takes 1d4 fire damage at the start of each of its turns. A creature can end this damage by using its action to make a DC 10 Dexterity check to extinguish the flames.",
    rarity: "common",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "antitoxin": {
    description: "As a Bonus Action, you can drink a vial of Antitoxin to gain Advantage on saving throws to avoid or end the Poisoned condition for 1 hour. It confers no benefit to undead or constructs.",
    rarity: "none",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── B ────────────────────────────────────────────────────────────────────

  "bottled breath": {
    description: "This bottle contains a breath of elemental air. When you inhale it, you either exhale it or hold it. If you exhale the breath, you gain the effect of the Gust of Wind spell. If you hold the breath, you don't need to breathe for 1 hour, though you can end this benefit early (for example, to speak). Ending it early doesn't give you the benefit of exhaling the breath.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: ["gust of wind"], bonusWeapon: null
  },

  // ── E ────────────────────────────────────────────────────────────────────

  "elixir of health": {
    description: "When you drink this potion, it cures any disease afflicting you, and it removes the blinded, deafened, paralyzed, and poisoned conditions. The clear red liquid has tiny bubbles of light in it.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "elixir of cloud giant strength": {
    description: "When you drink this potion, your Strength score changes to 27 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a cloud giant.",
    rarity: "very rare",
    resist: [], ability: { static: { str: 27 } }, attachedSpells: [], bonusWeapon: null
  },

  "elixir of fire giant strength": {
    description: "When you drink this potion, your Strength score changes to 25 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a fire giant.",
    rarity: "rare",
    resist: [], ability: { static: { str: 25 } }, attachedSpells: [], bonusWeapon: null
  },

  "elixir of frost giant strength": {
    description: "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a frost giant.",
    rarity: "rare",
    resist: [], ability: { static: { str: 23 } }, attachedSpells: [], bonusWeapon: null
  },

  "elixir of hill giant strength": {
    description: "When you drink this potion, your Strength score changes to 21 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a hill giant.",
    rarity: "uncommon",
    resist: [], ability: { static: { str: 21 } }, attachedSpells: [], bonusWeapon: null
  },

  "elixir of stone giant strength": {
    description: "When you drink this potion, your Strength score changes to 23 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a stone giant.",
    rarity: "rare",
    resist: [], ability: { static: { str: 23 } }, attachedSpells: [], bonusWeapon: null
  },

  "elixir of storm giant strength": {
    description: "When you drink this potion, your Strength score changes to 29 for 1 hour. The potion has no effect on you if your Strength is equal to or greater than that score. This potion's transparent liquid has floating in it a sliver of fingernail from a storm giant.",
    rarity: "legendary",
    resist: [], ability: { static: { str: 29 } }, attachedSpells: [], bonusWeapon: null
  },

  // ── O ────────────────────────────────────────────────────────────────────

  "oil of etherealness": {
    description: "One vial of this oil can cover one Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of the Etherealness spell for 1 hour. Beads of this cloudy, gray oil form on the outside of its container and quickly evaporate.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["etherealness"], bonusWeapon: null
  },

  "oil of sharpness": {
    description: "One vial of this oil can coat one melee weapon or twenty pieces of ammunition that deal slashing or piercing damage. Applying the oil takes 1 minute. For 1 hour, the coated item is magical and has a +3 bonus to attack and damage rolls. This clear, gelatinous oil sparkles with tiny, ultrathin silver shards.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: "+3"
  },

  "oil of slipperiness": {
    description: "This sticky black unguent is thick and heavy in the container, but it flows quickly when poured. The oil can cover a Medium or smaller creature, along with the equipment it's wearing and carrying (one additional vial is required for each size category above Medium). Applying the oil takes 10 minutes. The affected creature then gains the effect of a Freedom of Movement spell for 8 hours. Alternatively, the oil can be poured on the ground as an action, where it covers a 10-foot square, duplicating the effect of the Grease spell in that area for 8 hours.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: ["freedom of movement", "grease"], bonusWeapon: null
  },

  // ── P ────────────────────────────────────────────────────────────────────

  "philter of love": {
    description: "The next time you see a creature within 10 minutes after drinking this philter, you become charmed by that creature for 1 hour. If the creature is of a species and gender you are normally attracted to, you regard it as your true love while you are charmed. This potion's rose-hued, effervescent liquid contains one easy-to-miss bubble shaped like a heart.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "philosopher's stone": {
    description: "This rare alchemical find is an irregularly shaped, dull-red stone. As an action, a creature holding the stone can transmute 1 cubic foot of metal. The stone can be used to transmute metals into silver or gold. It can also be used to create a Potion of Supreme Healing — the stone is not consumed in this process. A creature can also use the stone to cast the resurrection spell (save DC 17), after which the stone disintegrates.",
    rarity: "legendary",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of acid resistance": {
    description: "When you drink this potion, you gain resistance to acid damage for 1 hour.",
    rarity: "uncommon",
    resist: ["acid"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of advantage": {
    description: "When you drink this potion, you gain advantage on one ability check, attack roll, or saving throw of your choice that you make within the next hour. This potion takes the form of a sparkling, golden mist that moves and pours like water.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of animal friendship": {
    description: "When you drink this potion, you can cast the Animal Friendship spell (save DC 13) for 1 hour at will. Shaking the bottle fails to mix the contents.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: ["animal friendship"], bonusWeapon: null
  },

  "potion of aqueous form": {
    description: "When you drink this potion, you transform into a pool of water. You return to your true form after 10 minutes or if you are incapacitated or die. While in this form you have a swimming speed of 30 feet, can move over or through liquids and enter other creatures' spaces, can rise to your normal height, and can pass through Tiny openings. You have resistance to nonmagical damage and advantage on Strength, Dexterity, and Constitution saving throws. You can't talk, attack, cast spells, or activate magic items.",
    rarity: "rare",
    resist: ["bludgeoning", "piercing", "slashing"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of clairvoyance": {
    description: "When you drink this potion, you gain the effect of the Clairvoyance spell. An eye forms on your forehead for the duration. The clear liquid has an eyeball-shaped cloud floating in it.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["clairvoyance"], bonusWeapon: null
  },

  "potion of climbing": {
    description: "When you drink this potion, you gain a climbing speed equal to your walking speed for 1 hour. During this time, you have advantage on Strength (Athletics) checks you make to climb. The potion is separated into brown, silver, and gray layers resembling bands of stone. Shaking the bottle fails to mix the colors.",
    rarity: "common",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of cold resistance": {
    description: "When you drink this potion, you gain resistance to cold damage for 1 hour.",
    rarity: "uncommon",
    resist: ["cold"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of comprehension": {
    description: "When you drink this potion, you gain the effect of a Comprehend Languages spell for 1 hour. This liquid is a clear concoction with bits of salt and soot swirling in it.",
    rarity: "common",
    resist: [], ability: null, attachedSpells: ["comprehend languages"], bonusWeapon: null
  },

  "potion of diminution": {
    description: "When you drink this potion, you gain the \"reduce\" effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion's liquid continuously contracts to a tiny bead and then expands to color the clear liquid around it. Shaking the bottle fails to interrupt this process.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["enlarge/reduce"], bonusWeapon: null
  },

  "potion of dragon strength": {
    description: "When you drink this potion, your Strength score becomes 30 for 1 hour. You also gain immunity to the breath weapon damage type of the dragon whose essence was used in the brewing. The potion has no effect if your Strength is already 30 or higher.",
    rarity: "legendary",
    resist: [], ability: { static: { str: 30 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of dragon's majesty": {
    description: "This potion looks like liquid gold, with a single scale from a chromatic, gem, or metallic dragon suspended in it. When you drink this potion, you transform into an adult dragon of the same kind as the dragon the scale came from for 1 hour. Any equipment you are wearing or carrying melds into your new form or falls to the ground (your choice). For the duration, you use the game statistics of the adult dragon instead of your own, but you retain your languages, personality, and memories. You can't use a dragon's Change Shape or its legendary or lair actions.",
    rarity: "legendary",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of fire breath": {
    description: "After drinking this potion, you can use a bonus action to exhale fire at a target within 30 feet of you. The target must make a DC 13 Dexterity saving throw, taking 4d6 fire damage on a failed save, or half as much damage on a successful one. The effect ends after you exhale the fire three times or when 1 hour has passed. This potion's orange liquid flickers, and smoke fills the top of the container and wafts out whenever it is opened.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of fire resistance": {
    description: "When you drink this potion, you gain resistance to fire damage for 1 hour.",
    rarity: "uncommon",
    resist: ["fire"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of flying": {
    description: "When you drink this potion, you gain a flying speed equal to your walking speed for 1 hour and can hover. If you're airborne when the potion wears off, you fall unless you have some other means of staying aloft. The potion's clear liquid floats at the top of its container and has cloudy white impurities drifting in it.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of force resistance": {
    description: "When you drink this potion, you gain resistance to force damage for 1 hour.",
    rarity: "uncommon",
    resist: ["force"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of gaseous form": {
    description: "When you drink this potion, you gain the effect of the Gaseous Form spell for 1 hour (no concentration required) or until you end the effect as a bonus action. This potion's container seems to hold fog that moves and pours like water.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: ["gaseous form"], bonusWeapon: null
  },

  "potion of giant size": {
    description: "When you drink this potion, you become Huge for 24 hours if you are Medium or smaller, otherwise the potion does nothing. Your Strength becomes 25 if it isn't already higher, and your hit point maximum is doubled (your current hit points are doubled when you drink the potion). The reach of your melee attacks increases by 5 feet. When rolling damage for weapons enlarged in this manner, roll three times the normal number of dice. When the effect ends, any hit points you have above your hit point maximum become temporary hit points.",
    rarity: "legendary",
    resist: [], ability: { static: { str: 25 } }, attachedSpells: [], bonusWeapon: null
  },

  "potion of greater healing": {
    description: "You regain 4d4 + 4 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of greater invisibility": {
    description: "This potion's container looks empty but feels as though it holds liquid. When you drink the potion, you have the Invisible condition for 1 hour. Unlike the Potion of Invisibility, this effect does not end when you attack or cast a spell.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of growth": {
    description: "When you drink this potion, you gain the \"enlarge\" effect of the Enlarge/Reduce spell for 1d4 hours (no concentration required). The red in the potion's liquid continuously expands from a tiny bead to color the clear liquid around it and then contracts. Shaking the bottle fails to interrupt this process.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: ["enlarge/reduce"], bonusWeapon: null
  },

  "potion of healing": {
    description: "You regain 2d4 + 2 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "common",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of heroism": {
    description: "For 1 hour after drinking it, you gain 10 temporary hit points that last for 1 hour. For the same duration, you are under the effect of the Bless spell (no concentration required). This blue potion bubbles and steams as if boiling.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["bless"], bonusWeapon: null
  },

  "potion of invisibility": {
    description: "This potion's container looks empty but feels as though it holds liquid. When you drink it, you become invisible for 1 hour. Anything you wear or carry is invisible with you. The effect ends early if you make an attack roll, deal damage, or cast a spell.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of invulnerability": {
    description: "For 1 minute after you drink this potion, you have resistance to all damage. The potion's syrupy liquid looks like liquefied iron.",
    rarity: "rare",
    resist: ["acid","bludgeoning","cold","fire","force","lightning","necrotic","piercing","poison","psychic","radiant","slashing","thunder"],
    ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of lightning resistance": {
    description: "When you drink this potion, you gain resistance to lightning damage for 1 hour.",
    rarity: "uncommon",
    resist: ["lightning"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of longevity": {
    description: "When you drink this potion, your physical age is reduced by 1d6 + 6 years, to a minimum of 13 years. Each time you subsequently drink a Potion of Longevity, there is a 10 percent cumulative chance that you instead age by 1d6 + 6 years. Suspended in this amber liquid are a scorpion's tail, an adder's fang, a dead spider, and a tiny heart that, against all reason, is still beating. These ingredients vanish when the potion is opened.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of maximum power": {
    description: "The first time you cast a damage-dealing spell of 4th level or lower within 1 minute after drinking the potion, instead of rolling dice to determine the damage dealt, you can instead use the highest number possible for each die. This glowing purple liquid smells of sugar and plum, but it has a muddy taste.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of mind control (beast)": {
    description: "When you drink this potion, you can cast the Dominate Beast spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don't, the potion is wasted. If the target's initial saving throw fails, the effect lasts for 1 hour with no concentration required. The charmed creature has disadvantage on new saving throws to break the effect during this time.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["dominate beast"], bonusWeapon: null
  },

  "potion of mind control (humanoid)": {
    description: "When you drink this potion, you can cast the Dominate Person spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don't, the potion is wasted. If the target's initial saving throw fails, the effect lasts for 1 hour with no concentration required. The charmed creature has disadvantage on new saving throws to break the effect during this time.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["dominate person"], bonusWeapon: null
  },

  "potion of mind control (monster)": {
    description: "When you drink this potion, you can cast the Dominate Monster spell (save DC 15) on a specific creature if you do so before the end of your next turn. If you don't, the potion is wasted. If the target's initial saving throw fails, the effect lasts for 1 hour with no concentration required. The charmed creature has disadvantage on new saving throws to break the effect during this time.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: ["dominate monster"], bonusWeapon: null
  },

  "potion of mind reading": {
    description: "When you drink this potion, you gain the effect of the Detect Thoughts spell (save DC 13). The potion's dense, purple liquid has an ovoid cloud of pink smoke floating in it.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: ["detect thoughts"], bonusWeapon: null
  },

  "potion of necrotic resistance": {
    description: "When you drink this potion, you gain resistance to necrotic damage for 1 hour.",
    rarity: "uncommon",
    resist: ["necrotic"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of poison": {
    description: "This concoction looks, smells, and tastes like a Potion of Healing or other beneficial potion. However, it is actually poison masked by illusion magic. An Identify spell reveals its true nature. If you drink it, you take 4d6 poison damage and must succeed on a DC 13 Constitution saving throw or have the Poisoned condition for 1 hour.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of poison resistance": {
    description: "When you drink this potion, you gain resistance to poison damage for 1 hour.",
    rarity: "uncommon",
    resist: ["poison"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of polychromy": {
    description: "When you drink this potion, you and everything you are wearing or carrying take on a rainbow-hued appearance for 1 hour. During that time, you can use a bonus action to turn any color or combination of colors you choose. If you mimic the colors of your surroundings, your hues continually shift to match your surroundings, and you have advantage on Dexterity (Stealth) checks until you change your colors again or the potion wears off. The potion is separated into seven brightly colored bands of immiscible liquids and has a syrupy taste.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of possibility": {
    description: "When you drink this clear potion, you gain two Fragments of Possibility, each of which looks like a Tiny, grayish bead of energy that follows you around. Each fragment lasts for 8 hours or until used. When you make an attack roll, an ability check, or a saving throw, you can expend your fragment to roll an additional d20 and choose which result to use. While you have one or more Fragments of Possibility from this potion, you can't gain another Fragment of Possibility from any source.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of psionic fortitude": {
    description: "When you drink this potion, you have advantage for 1 hour on saving throws you make to avoid or end the charmed or stunned condition on yourself. This black potion swirls with shimmering flecks of pink and purple.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of psychic resistance": {
    description: "When you drink this potion, you gain resistance to psychic damage for 1 hour.",
    rarity: "uncommon",
    resist: ["psychic"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of pugilism": {
    description: "After you drink this potion, each unarmed strike you make deals an extra 1d6 force damage on a hit. This effect lasts 10 minutes. This potion is a thick green fluid that tastes like spinach.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of radiant resistance": {
    description: "When you drink this potion, you gain resistance to radiant damage for 1 hour.",
    rarity: "uncommon",
    resist: ["radiant"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of resistance": {
    description: "When you drink this potion, you gain resistance to one type of damage for 1 hour. The DM chooses the type or determines it randomly.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of speed": {
    description: "When you drink this potion, you gain the effect of the Haste spell for 1 minute (no concentration required) without suffering the wave of lethargy that typically occurs when the effect ends. The potion's yellow fluid is streaked with black and swirls on its own.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: ["haste"], bonusWeapon: null
  },

  "potion of superior healing": {
    description: "You regain 8d4 + 8 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of supreme healing": {
    description: "You regain 10d4 + 20 hit points when you drink this potion. The potion's red liquid glimmers when agitated.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of thunder resistance": {
    description: "When you drink this potion, you gain resistance to thunder damage for 1 hour.",
    rarity: "uncommon",
    resist: ["thunder"], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of vitality": {
    description: "When you drink this potion, your exhaustion level, if any, is reduced by 1. In addition, if you are poisoned, the condition ends. For the next 24 hours, you regain the maximum number of hit points for any Hit Die you spend. The potion's crimson liquid regularly pulses with dull light, calling to mind a heartbeat.",
    rarity: "very rare",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of watchful rest": {
    description: "When you drink this potion, you gain the following benefits for the next 8 hours: magic can't put you to sleep, and you can remain awake during a long rest and still gain its benefits. This sweet, amber-colored brew has no effect on creatures that don't require sleep, such as elves.",
    rarity: "common",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  "potion of water breathing": {
    description: "You can breathe underwater for 24 hours after drinking this potion. This potion's cloudy green fluid smells of the sea and has a jellyfish-like bubble floating in it.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },

  // ── S ────────────────────────────────────────────────────────────────────

  "smoke bomb": {
    description: "When you throw this bomb as an action, it shatters and releases a cloud of thick, black smoke in a 20-foot-radius sphere centered on the point of impact. The area is heavily obscured. A moderate wind (at least 10 miles per hour) disperses the smoke in 4 rounds; a strong wind (at least 20 miles per hour) disperses it in 1 round.",
    rarity: "uncommon",
    resist: [], ability: null, attachedSpells: [], bonusWeapon: null
  },
};
