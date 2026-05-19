const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MODULE_ID = "artificer-foundry";

const SKILL_LABELS = {
    sur: "Survival",
    nat: "Nature",
    prc: "Perception",
    ath: "Athletics",
};

export class GatheringRollDialog extends HandlebarsApplicationMixin(ApplicationV2) {

    constructor(actor, requestId, options = {}) {
        super(options);
        this.actor     = actor;
        this.requestId = requestId;
    }

    static DEFAULT_OPTIONS = {
        window: { title: "Gathering Roll", icon: "fas fa-dice-d20", resizable: false },
        classes: ["artificer-foundry", "gathering-roll-dialog"],
        position: { width: 340, height: "auto" },
    };

    static PARTS = {
        dialog: { template: "modules/artificer-foundry/templates/gathering-roll-dialog.hbs" }
    };

    async _prepareContext() {
        // Look up the active request so we know which skill to roll
        const active    = game.settings.get(MODULE_ID, "activeGatherRequests");
        const req       = active[this.requestId];
        const skillKey  = req?.skillKey ?? "sur";
        const skillLabel = SKILL_LABELS[skillKey] ?? "Survival";

        return {
            actorName:  this.actor.name,
            skillLabel,
            skillKey,
            requestId: this.requestId,
            actorId:   this.actor.id,
        };
    }

    _onRender(context, options) {
        const el = this.element;
        el.querySelector('.do-gather-roll')?.addEventListener('click', () => this._onRoll(context.skillKey));
    }

    async _onRoll(skillKey) {
        if (!this.actor.isOwner) {
            ui.notifications.warn("You do not own this character.");
            return;
        }

        let rollTotal;

        // Use dnd5e skill roll if available (shows the proper dnd5e roll dialog with modifiers)
        if (typeof this.actor.rollSkill === 'function') {
            try {
                const roll = await this.actor.rollSkill(skillKey);
                // rollSkill may return null if the user cancelled
                if (!roll) return;
                rollTotal = Array.isArray(roll) ? roll[0]?.total : roll.total;
            } catch (err) {
                console.warn("Artificer Foundry | rollSkill failed, falling back to plain d20:", err);
                rollTotal = await this._plainD20Roll();
            }
        } else {
            rollTotal = await this._plainD20Roll();
        }

        if (rollTotal == null) return;

        // Emit result to GM via socket
        game.socket.emit(`module.${MODULE_ID}`, {
            type:      "gatherRollResult",
            requestId: this.requestId,
            actorId:   this.actor.id,
            rollTotal,
        });

        this.close();
    }

    async _plainD20Roll() {
        const roll = await new Roll("1d20").evaluate();
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor:  "<strong>Gathering Roll</strong>",
        });
        return roll.total;
    }
}
