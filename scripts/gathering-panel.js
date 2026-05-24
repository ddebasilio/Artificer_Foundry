import {
    loadIngredientData,
    getBiomes, getAbundanceModifiers, getTimeUnits,
    getWeatherModifiers, getSeasonModifiers, getSkillOptions,
    resolveForagingByDC, addIngredientToActor
} from "./ingredient-data.js";
import { addForgeMaterialToActor } from "./forge-data.js";
import {
    loadLootTables, getCRTiers, getLootTypes,
    rollIndividualTreasure, rollTreasureHoard, rerollItem
} from "./loot-generator.js";
import { PartyInventory } from "./party-inventory.js";

const MODULE_ID = "artificer-foundry";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;

export class GatheringPanel extends HandlebarsApplicationMixin(AbstractSidebarTab) {

    static tabName = "af-gathering";

    static PARTS = {
        gathering: {
            template: "modules/artificer-foundry/templates/loot-generator-panel.hbs",
        }
    };

    static DEFAULT_OPTIONS = {
        id: "af-gathering",
        classes: ["af-gathering-tab"],
    };

    constructor(options = {}) {
        super(options);
        this.biome      = game.settings?.get(MODULE_ID, "defaultBiome") || "forest";
        this.abundance  = "medium";
        this.timeAmount = 1;
        this.timeUnit   = "hours";
        this.weatherMod = 0;
        this.seasonMod  = 0;
        this.manualDC   = null;
        this.skillKey   = "sur";
        this.gatherMode = "ingredients"; // "ingredients" or "materials"
        this.selectedActorIds = new Set();

        // Loot generator state
        this.mode      = "loot";       // "loot" or "gathering"
        this.lootType  = "hoard";      // "hoard" or "individual"
        this.crTier    = "CR0-4";
        this.lootResults = [];        // Array of { coins, items } from rolls (newest first)
    }

    // ─── Computed DC ────────────────────────────────────────────────────────────

    _computeAutoDC() {
        const biomes    = getBiomes();
        const abundance = getAbundanceModifiers();
        const timeUnits = getTimeUnits();
        const biome     = biomes[this.biome]              ?? { baseDC: 10 };
        const abund     = abundance[this.abundance]        ?? { dcMod: 0 };
        const hours     = this.timeAmount * (timeUnits[this.timeUnit]?.hours ?? 1);

        let timeMod = 0;
        if      (hours <= 1/600) timeMod = +6;
        else if (hours <= 1/60)  timeMod = +4;
        else if (hours <= 10/60) timeMod = +2;
        else if (hours <= 1)     timeMod = 0;
        else timeMod = -Math.min(4, Math.floor(Math.floor(hours) / 2));

        // Materials are harder to find
        const modeDCMod = this.gatherMode === "materials" ? 3 : 0;

        return Math.max(1, biome.baseDC + abund.dcMod + timeMod + this.weatherMod + this.seasonMod + modeDCMod);
    }

    // ─── Template data ───────────────────────────────────────────────────────────

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        if (!game.user.isGM) return context;

        // Ensure data is loaded
        await loadIngredientData();
        await loadLootTables();

        const scene = game.scenes?.active;
        const sceneActors = [];
        if (scene) {
            for (const token of scene.tokens) {
                if (!token.actor) continue;
                if (token.actor.hasPlayerOwner && token.actor.type !== "npc") {
                    if (!sceneActors.find(a => a.id === token.actor.id)) {
                        const ownerUser = game.users.find(u => !u.isGM && token.actor.testUserPermission(u, "OWNER"));
                        sceneActors.push({ id: token.actor.id, name: token.actor.name, playerName: ownerUser?.name ?? "Unknown", selected: this.selectedActorIds.has(token.actor.id) });
                    }
                }
            }
        }

        const autoDC    = this._computeAutoDC();
        const displayDC = this.manualDC !== null ? this.manualDC : autoDC;

        const biomes = getBiomes();
        const abundanceMods = getAbundanceModifiers();
        const timeUnits = getTimeUnits();

        // Format loot results for template (multiple rolls)
        const coinLabels = { cp: "Copper", sp: "Silver", ep: "Electrum", gp: "Gold", pp: "Platinum" };
        const coinOrder = ["pp", "gp", "ep", "sp", "cp"];
        const lootResults = this.lootResults.map((lr, idx) => {
            const coins = coinOrder
                .filter(c => (lr.coins?.[c] || 0) > 0)
                .map(c => ({ type: c, label: coinLabels[c], amount: lr.coins[c] }));
            return {
                rollIndex: idx,
                coins,
                hasCoins: coins.length > 0,
                items: lr.items || [],
                hasItems: (lr.items || []).length > 0,
            };
        });
        const hasLootResults = lootResults.length > 0;

        Object.assign(context, {
            // Mode
            mode: this.mode,

            // Loot generator
            crTiers:   getCRTiers(),
            lootTypes: getLootTypes(),
            crTier:    this.crTier,
            lootType:  this.lootType,
            lootResults,
            hasLootResults,

            // Gathering
            sceneActors,
            biomes:     Object.entries(biomes).map(([k, v])             => ({ value: k, ...v })),
            abundances: Object.entries(abundanceMods).map(([k, v]) => ({ value: k, ...v })),
            timeUnits:  Object.entries(timeUnits).map(([k, v])          => ({ value: k, ...v })),
            weatherOptions: getWeatherModifiers(),
            seasonOptions:  getSeasonModifiers(),
            skillOptions:   getSkillOptions(),
            biome:      this.biome,
            abundance:  this.abundance,
            timeAmount: this.timeAmount,
            timeUnit:   this.timeUnit,
            weatherMod: String(this.weatherMod),
            seasonMod:  String(this.seasonMod),
            skillKey:   this.skillKey,
            gatherMode: this.gatherMode,
            autoDC,
            displayDC,
            isManualDC: this.manualDC !== null,
        });

        return context;
    }

    // ─── Listeners ───────────────────────────────────────────────────────────────

    _onRender(context, options) {
        super._onRender(context, options);
        if (!game.user.isGM) return;

        const el = this.element;

        // ── Mode tabs ──
        el.querySelectorAll('.af-lg-mode-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.mode = btn.dataset.mode;
                el.querySelector('.af-lg-loot-mode').style.display = this.mode === 'loot' ? '' : 'none';
                el.querySelector('.af-lg-gathering-mode').style.display = this.mode === 'gathering' ? '' : 'none';
                el.querySelectorAll('.af-lg-mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === this.mode));
            });
        });

        // ── Loot generator controls ──
        el.querySelector('.af-lg-loot-type')?.addEventListener('change', e => { this.lootType = e.target.value; });
        el.querySelector('.af-lg-cr-tier')?.addEventListener('change', e => { this.crTier = e.target.value; });
        el.querySelector('.af-lg-roll-btn')?.addEventListener('click', () => this._onRollLoot());

        // Reroll individual items
        el.querySelectorAll('.af-lg-reroll-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const rollIndex = parseInt(btn.closest('[data-roll-index]').dataset.rollIndex);
                const itemId = btn.dataset.itemId;
                const rarity = btn.dataset.rarity;
                this._onRerollItem(rollIndex, itemId, rarity);
            });
        });

        // Click on rolled item row to view its native sheet
        el.querySelectorAll('.af-lg-item-row').forEach(row => {
            row.addEventListener('click', (e) => {
                // Ignore if clicked on the reroll button
                if (e.target.closest('.af-lg-reroll-item')) return;
                if (e.target.closest('.af-lg-send-item-to-party')) return;
                const itemId = row.dataset.itemId;
                const item = game.items.get(itemId);
                if (item) item.sheet.render(true);
            });
        });

        // Send individual item to party inventory
        el.querySelectorAll('.af-lg-send-item-to-party').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const rollIndex = parseInt(btn.closest('[data-roll-index]').dataset.rollIndex);
                const itemId = btn.dataset.itemId;
                this._onSendItemToParty(rollIndex, itemId);
            });
        });

        // Send all loot from a roll to party inventory
        el.querySelectorAll('.af-lg-send-to-party').forEach(btn => {
            btn.addEventListener('click', () => {
                const rollIndex = parseInt(btn.closest('[data-roll-index]').dataset.rollIndex);
                this._onSendToParty(rollIndex);
            });
        });

        // ── Gathering controls (same as before) ──

        // Player checkboxes
        el.querySelectorAll('.gathering-player-check').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.dataset.actorId;
                if (cb.checked) this.selectedActorIds.add(id);
                else this.selectedActorIds.delete(id);
            });
        });

        // Environment dropdowns → auto-update DC
        const updateDC = () => {
            if (this.manualDC === null) {
                el.querySelector('.dc-display').value = this._computeAutoDC();
                el.querySelector('.dc-auto-label').textContent = `Auto: ${this._computeAutoDC()}`;
            }
        };

        el.querySelector('.gather-biome')?.addEventListener('change', e => {
            this.biome = e.target.value;
            updateDC();
        });
        el.querySelector('.gather-abundance')?.addEventListener('change', e => {
            this.abundance = e.target.value;
            updateDC();
        });
        el.querySelector('.gather-time-amount')?.addEventListener('change', e => {
            this.timeAmount = Number(e.target.value) || 1;
            updateDC();
        });
        el.querySelector('.gather-time-unit')?.addEventListener('change', e => {
            this.timeUnit = e.target.value;
            updateDC();
        });
        el.querySelector('.gather-weather')?.addEventListener('change', e => {
            this.weatherMod = Number(e.target.value);
            updateDC();
        });
        el.querySelector('.gather-season')?.addEventListener('change', e => {
            this.seasonMod = Number(e.target.value);
            updateDC();
        });

        // Gather mode toggle (ingredients vs materials)
        el.querySelectorAll('.gather-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                el.querySelectorAll('.gather-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gatherMode = btn.dataset.mode;
                updateDC();
            });
        });

        // Manual DC override
        el.querySelector('.dc-display')?.addEventListener('change', e => {
            const val = parseInt(e.target.value);
            this.manualDC = isNaN(val) ? null : val;
            const autoLabel = el.querySelector('.dc-auto-label');
            if (autoLabel) autoLabel.textContent = `Auto: ${this._computeAutoDC()}`;
            const resetBtn = el.querySelector('.dc-reset-btn');
            if (resetBtn) resetBtn.style.display = this.manualDC !== null ? '' : 'none';
        });
        el.querySelector('.dc-reset-btn')?.addEventListener('click', () => {
            this.manualDC = null;
            el.querySelector('.dc-display').value = this._computeAutoDC();
            el.querySelector('.dc-auto-label').textContent = `Auto: ${this._computeAutoDC()}`;
            el.querySelector('.dc-reset-btn').style.display = 'none';
        });

        // Skill dropdown
        el.querySelector('.gather-skill')?.addEventListener('change', e => {
            this.skillKey = e.target.value;
        });

        // Select All / None
        el.querySelector('.gather-select-all')?.addEventListener('click', () => {
            el.querySelectorAll('.gathering-player-check').forEach(cb => {
                cb.checked = true;
                this.selectedActorIds.add(cb.dataset.actorId);
            });
        });
        el.querySelector('.gather-select-none')?.addEventListener('click', () => {
            el.querySelectorAll('.gathering-player-check').forEach(cb => {
                cb.checked = false;
            });
            this.selectedActorIds.clear();
        });

        // Request Roll
        el.querySelector('.request-roll-btn')?.addEventListener('click', this._onRequestRoll.bind(this));
    }

    // ─── Loot Generator Actions ──────────────────────────────────────────────────

    async _onRollLoot() {
        try {
            let rolledLoot;
            if (this.lootType === "individual") {
                rolledLoot = await rollIndividualTreasure(this.crTier);
            } else {
                rolledLoot = await rollTreasureHoard(this.crTier);
            }

            if (rolledLoot?.items?.length) {
                const worldItems = [];
                for (const itemData of rolledLoot.items) {
                    const createdItem = await PartyInventory._createItemInWorld(itemData);
                    if (createdItem) {
                        worldItems.push({
                            id: createdItem.id,
                            name: createdItem.name,
                            img: createdItem.img || "icons/svg/item-bag.svg",
                            rarity: createdItem.system?.rarity || itemData.rarity || "common",
                            text: createdItem.system?.description?.value || itemData.text || ""
                        });
                    }
                }
                rolledLoot.items = worldItems;
            }

            this.lootResults.unshift(rolledLoot);
            this.render(true);
        } catch (err) {
            console.error("Artificer Foundry | Loot roll error:", err);
            ui.notifications.error("Failed to roll loot. Check console for details.");
        }
    }

    async _onRerollItem(rollIndex, itemId, rarity) {
        const roll = this.lootResults[rollIndex];
        if (!roll?.items) return;
        const idx = roll.items.findIndex(i => i.id === itemId);
        if (idx === -1) return;

        // Delete the old world Item document
        try {
            await game.items.get(itemId)?.delete();
        } catch (e) {
            console.warn("Artificer Foundry | Failed to delete rerolled world item:", e);
        }

        const newItem = rerollItem(rarity);
        if (newItem) {
            const createdItem = await PartyInventory._createItemInWorld(newItem);
            if (createdItem) {
                roll.items[idx] = {
                    id: createdItem.id,
                    name: createdItem.name,
                    img: createdItem.img || "icons/svg/item-bag.svg",
                    rarity: createdItem.system?.rarity || newItem.rarity || "common",
                    text: createdItem.system?.description?.value || newItem.text || ""
                };
            }
            this.render(true);
        }
    }

    async _onSendItemToParty(rollIndex, itemId) {
        const roll = this.lootResults[rollIndex];
        if (!roll?.items) return;
        const idx = roll.items.findIndex(i => i.id === itemId);
        if (idx === -1) return;

        const item = roll.items[idx];
        await PartyInventory.addItems([{ id: item.id }]);
        roll.items.splice(idx, 1);

        ui.notifications.info(`${item.name} sent to Party Inventory!`);
        await ChatMessage.create({
            content: `<p><strong><i class="fas fa-treasure-chest"></i> ${item.name}</strong> <em>(${item.rarity})</em> added to Party Inventory.</p>`,
            speaker: { alias: "Loot Generator" },
        });

        this.render(true);
    }

    async _onSendToParty(rollIndex) {
        const roll = this.lootResults[rollIndex];
        if (!roll) return;

        await PartyInventory.addLoot(roll);
        ui.notifications.info("Loot sent to Party Inventory!");

        // Post to chat
        let msg = `<p><strong><i class="fas fa-treasure-chest"></i> Loot added to Party Inventory</strong></p>`;
        const coinLabels = { cp: "Copper", sp: "Silver", ep: "Electrum", gp: "Gold", pp: "Platinum" };
        if (roll.coins) {
            const coinEntries = Object.entries(roll.coins).filter(([, v]) => v > 0);
            if (coinEntries.length) {
                msg += `<p><strong>Coins:</strong> ${coinEntries.map(([t, a]) => `${a} ${coinLabels[t] || t}`).join(", ")}</p>`;
            }
        }
        if (roll.items?.length) {
            msg += `<p><strong>Items:</strong></p><ul>`;
            for (const item of roll.items) {
                msg += `<li>${item.name} <em>(${item.rarity})</em></li>`;
            }
            msg += `</ul>`;
        }
        await ChatMessage.create({ content: msg, speaker: { alias: "Loot Generator" } });

        this.lootResults.splice(rollIndex, 1);
        this.render(true);
    }

    // ─── Request Roll (gathering) ────────────────────────────────────────────────

    async _onRequestRoll() {
        if (this.selectedActorIds.size === 0) {
            ui.notifications.warn("Select at least one player before requesting a roll.");
            return;
        }

        const dc      = this.manualDC !== null ? this.manualDC : this._computeAutoDC();
        const reqId   = foundry.utils.randomID();
        const actorIds = [...this.selectedActorIds];
        const skillOptions = getSkillOptions();
        const skillOpt = skillOptions.find(s => s.value === this.skillKey);
        const skillLabel = skillOpt?.label ?? "Survival";
        const modeLabel = this.gatherMode === "materials" ? "Forge Materials" : "Ingredients";

        // Persist request so players can roll even after page reload
        const active = game.settings.get(MODULE_ID, "activeGatherRequests");
        active[reqId] = { dc, biomeKey: this.biome, actorIds, skillKey: this.skillKey, gatherMode: this.gatherMode };
        await game.settings.set(MODULE_ID, "activeGatherRequests", active);

        // Build whisper list from actor owners
        const whisperUserIds = [];
        for (const actorId of actorIds) {
            const actor = game.actors.get(actorId);
            if (!actor) continue;
            for (const user of game.users) {
                if (user.isGM) continue;
                if (actor.testUserPermission(user, "OWNER")) whisperUserIds.push(user.id);
            }
        }

        // Build roll buttons (one per actor)
        const btnHtml = actorIds.map(actorId => {
            const actor = game.actors.get(actorId);
            if (!actor) return '';
            return `<div class="af-gather-request-row">
                <strong>${actor.name}</strong>
                <button data-action="af-gather-roll" data-request-id="${reqId}" data-actor-id="${actorId}" class="af-gather-roll-btn">
                    <i class="fas fa-dice-d20"></i> Roll ${skillLabel}
                </button>
            </div>`;
        }).join('');

        const modeIcon = this.gatherMode === "materials" ? "fa-hammer" : "fa-leaf";
        const content = `
            <div class="af-gather-request-msg">
                <p><i class="fas ${modeIcon}"></i> <strong>${modeLabel} Gathering Roll Requested</strong></p>
                <p>The DM has asked you to roll <strong>${skillLabel}</strong> to gather ${modeLabel.toLowerCase()}.</p>
                ${btnHtml}
            </div>`;

        await ChatMessage.create({
            content,
            whisper: whisperUserIds.length ? whisperUserIds : ChatMessage.getWhisperRecipients("players").map(u => u.id),
            speaker: { alias: "Artificer Foundry" },
        });

        ui.notifications.info(`${modeLabel} gathering roll requested from ${actorIds.length} player(s).`);
    }

    // ─── Socket: handle incoming roll result (called from main.js) ───────────────

    static async handleRollResult({ requestId, actorId, rollTotal }) {
        if (!game.user.isGM) return;

        const active = game.settings.get(MODULE_ID, "activeGatherRequests");
        const req = active[requestId];
        if (!req) {
            console.warn(`Artificer Foundry | Received roll for unknown request ${requestId}`);
            return;
        }

        const actor = game.actors.get(actorId);
        if (!actor) return;

        const gatherMode = req.gatherMode ?? "ingredients";
        const result = resolveForagingByDC(req.dc, req.biomeKey, rollTotal);

        let msgContent;
        if (result.critFail) {
            msgContent = `<p><strong>Critical failure!</strong> ${actor.name} found nothing and disturbed the area.</p>`;
        } else if (!result.success) {
            msgContent = `<p><strong>Failed.</strong> ${actor.name} didn't find anything useful. <em>(DC was ${result.dc})</em></p>`;
        } else {
            const modeLabel = gatherMode === "materials" ? "forge materials" : "ingredients";
            msgContent = `<strong>${actor.name} found ${modeLabel}:</strong><ul>`;
            for (const item of result.items) {
                if (gatherMode === "materials") {
                    await addForgeMaterialToActor(actor, item.name, item.type, item.qty);
                } else {
                    await addIngredientToActor(actor, item.name, item.type, item.qty);
                }
                msgContent += `<li>${item.qty}× ${item.name}</li>`;
            }
            msgContent += `</ul><em>(DC was ${result.dc})</em>`;
        }

        await ChatMessage.create({
            content: msgContent,
            speaker: { alias: "Artificer Foundry" },
        });

        delete active[requestId];
        await game.settings.set(MODULE_ID, "activeGatherRequests", active);
    }
}
