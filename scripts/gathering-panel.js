import { BIOMES, ABUNDANCE_MODIFIERS, TIME_UNITS, resolveForagingByDC, addIngredientToActor } from "./ingredient-data.js";

const MODULE_ID = "artificer-foundry";

// Weather modifier options
const WEATHER_MODIFIERS = [
    { value: "0",  label: "Clear",       dcMod: 0 },
    { value: "1",  label: "Overcast",    dcMod: 1 },
    { value: "2",  label: "Light Rain",  dcMod: 2 },
    { value: "4",  label: "Heavy Rain",  dcMod: 4 },
    { value: "6",  label: "Storm",       dcMod: 6 },
];

// Season modifier options
const SEASON_MODIFIERS = [
    { value: "-1", label: "Spring", dcMod: -1 },
    { value: "0",  label: "Summer", dcMod: 0  },
    { value: "1",  label: "Autumn", dcMod: 1  },
    { value: "3",  label: "Winter", dcMod: 3  },
];

// Skill options for the roll
const SKILL_OPTIONS = [
    { value: "sur", label: "Survival" },
    { value: "nat", label: "Nature"   },
    { value: "prc", label: "Perception" },
    { value: "ath", label: "Athletics" },
];

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { AbstractSidebarTab } = foundry.applications.sidebar;

export class GatheringPanel extends HandlebarsApplicationMixin(AbstractSidebarTab) {

    static tabName = "af-gathering";

    static PARTS = {
        gathering: {
            template: "modules/artificer-foundry/templates/gathering-panel.hbs",
        }
    };

    static DEFAULT_OPTIONS = {
        id: "af-gathering",
        classes: ["af-gathering-tab"],
    };

    constructor(options = {}) {
        super(options);
        // Environment state
        this.biome      = game.settings?.get(MODULE_ID, "defaultBiome") || "forest";
        this.abundance  = "medium";
        this.timeAmount = 1;
        this.timeUnit   = "hours";
        this.weatherMod = 0;
        this.seasonMod  = 0;
        this.manualDC   = null; // null = auto-computed
        this.skillKey   = "sur";
        // Player selection
        this.selectedActorIds = new Set();
    }

    // ─── Computed DC ────────────────────────────────────────────────────────────

    _computeAutoDC() {
        const biome     = BIOMES[this.biome]              ?? { baseDC: 10 };
        const abundance = ABUNDANCE_MODIFIERS[this.abundance] ?? { dcMod: 0 };
        const hours     = this.timeAmount * (TIME_UNITS[this.timeUnit]?.hours ?? 1);

        let timeMod = 0;
        if      (hours <= 1/600) timeMod = +6;
        else if (hours <= 1/60)  timeMod = +4;
        else if (hours <= 10/60) timeMod = +2;
        else if (hours <= 1)     timeMod = 0;
        else timeMod = -Math.min(4, Math.floor(Math.floor(hours) / 2));

        return Math.max(1, biome.baseDC + abundance.dcMod + timeMod + this.weatherMod + this.seasonMod);
    }

    // ─── Template data ───────────────────────────────────────────────────────────

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        if (!game.user.isGM) return context;

        // Collect player-controlled tokens in the active scene
        const scene = game.scenes?.active;
        const sceneActors = [];
        if (scene) {
            for (const token of scene.tokens) {
                if (!token.actor) continue;
                if (token.actor.hasPlayerOwner && token.actor.type !== "npc") {
                    if (!sceneActors.find(a => a.id === token.actor.id)) {
                        sceneActors.push({ id: token.actor.id, name: token.actor.name, selected: this.selectedActorIds.has(token.actor.id) });
                    }
                }
            }
        }

        const autoDC    = this._computeAutoDC();
        const displayDC = this.manualDC !== null ? this.manualDC : autoDC;

        Object.assign(context, {
            sceneActors,
            biomes:     Object.entries(BIOMES).map(([k, v])             => ({ value: k, ...v })),
            abundances: Object.entries(ABUNDANCE_MODIFIERS).map(([k, v]) => ({ value: k, ...v })),
            timeUnits:  Object.entries(TIME_UNITS).map(([k, v])          => ({ value: k, ...v })),
            weatherOptions: WEATHER_MODIFIERS,
            seasonOptions:  SEASON_MODIFIERS,
            skillOptions:   SKILL_OPTIONS,
            // Current selections
            biome:      this.biome,
            abundance:  this.abundance,
            timeAmount: this.timeAmount,
            timeUnit:   this.timeUnit,
            weatherMod: String(this.weatherMod),
            seasonMod:  String(this.seasonMod),
            skillKey:   this.skillKey,
            // DC
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

        // Manual DC override
        el.querySelector('.dc-display')?.addEventListener('change', e => {
            const val = parseInt(e.target.value);
            this.manualDC = isNaN(val) ? null : val;
            const autoLabel = el.querySelector('.dc-auto-label');
            if (autoLabel) autoLabel.textContent = this.manualDC !== null ? `Auto: ${this._computeAutoDC()}` : `Auto: ${this._computeAutoDC()}`;
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

    // ─── Request Roll ────────────────────────────────────────────────────────────

    async _onRequestRoll() {
        if (this.selectedActorIds.size === 0) {
            ui.notifications.warn("Select at least one player before requesting a roll.");
            return;
        }

        const dc      = this.manualDC !== null ? this.manualDC : this._computeAutoDC();
        const reqId   = foundry.utils.randomID();
        const actorIds = [...this.selectedActorIds];
        const skillOpt = SKILL_OPTIONS.find(s => s.value === this.skillKey);
        const skillLabel = skillOpt?.label ?? "Survival";

        // Persist request so players can roll even after page reload
        const active = game.settings.get(MODULE_ID, "activeGatherRequests");
        active[reqId] = { dc, biomeKey: this.biome, actorIds, skillKey: this.skillKey };
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

        const content = `
            <div class="af-gather-request-msg">
                <p><i class="fas fa-shopping-bag"></i> <strong>Gathering Roll Requested</strong></p>
                <p>The DM has asked you to roll <strong>${skillLabel}</strong> to gather ingredients.</p>
                ${btnHtml}
            </div>`;

        await ChatMessage.create({
            content,
            whisper: whisperUserIds.length ? whisperUserIds : ChatMessage.getWhisperRecipients("players").map(u => u.id),
            speaker: { alias: "Artificer Foundry" },
        });

        ui.notifications.info(`Gathering roll requested from ${actorIds.length} player(s).`);
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

        const result = resolveForagingByDC(req.dc, req.biomeKey, rollTotal);

        let msgContent;
        if (result.critFail) {
            msgContent = `<p><strong>Critical failure!</strong> ${actor.name} found nothing and disturbed the area.</p>`;
        } else if (!result.success) {
            msgContent = `<p><strong>Failed.</strong> ${actor.name} didn't find anything useful. <em>(DC was ${result.dc})</em></p>`;
        } else {
            msgContent = `<strong>${actor.name} found:</strong><ul>`;
            for (const item of result.items) {
                await addIngredientToActor(actor, item.name, item.type, item.qty);
                msgContent += `<li>${item.qty}× ${item.name}</li>`;
            }
            msgContent += `</ul><em>(DC was ${result.dc})</em>`;
        }

        await ChatMessage.create({
            content: msgContent,
            speaker: { alias: "Artificer Foundry" },
        });

        // Clean up completed request
        delete active[requestId];
        await game.settings.set(MODULE_ID, "activeGatherRequests", active);
    }
}
