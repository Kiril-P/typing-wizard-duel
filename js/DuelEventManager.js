(function attachDuelEventManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  const EVENT_ORDER = ["focus-surge", "volatile-rune", "counter-opening"];

  class DuelEventManager {
    constructor(config) {
      const settings = config.settings || {};
      this.settings = settings;
      this.random = config.random || Math.random;
      this.getContext = config.getContext;
      this.callbacks = config.callbacks || {};
      this.enabled = false;
      this.activeEvent = null;
      this.feedback = null;
      this.nextEventMs = 0;
    }

    start() {
      this.enabled = true;
      this.activeEvent = null;
      this.feedback = null;
      this.nextEventMs = this.rollRange(this.settings.firstDelayMs || [10000, 14000]);
    }

    stop() {
      this.enabled = false;
      this.activeEvent = null;
      this.feedback = null;
      this.nextEventMs = 0;
    }

    update(deltaMs, options) {
      if (!this.enabled) {
        return;
      }

      this.updateFeedback(deltaMs);

      if (this.activeEvent) {
        this.activeEvent.remainingMs -= deltaMs;
        if (this.activeEvent.remainingMs <= 0) {
          this.failActiveEvent(this.getTimeoutMessage(this.activeEvent), true);
        }
        return;
      }

      const canStart = options && options.canStart;
      if (!canStart) {
        return;
      }

      this.nextEventMs -= deltaMs;
      if (this.nextEventMs <= 0) {
        this.startRandomEvent((options && options.context) || this.readContext());
      }
    }

    handleCorrectInput() {
      if (!this.activeEvent || this.activeEvent.id !== "volatile-rune") {
        return;
      }

      this.activeEvent.correctCharacters += 1;
      if (this.activeEvent.correctCharacters >= this.activeEvent.requiredCorrect) {
        this.succeedActiveEvent("RUNE STABILIZED");
      }
    }

    handleLineComplete(event) {
      if (!this.activeEvent || !event) {
        return;
      }

      if (event.lineIndex !== this.activeEvent.targetLineIndex) {
        return;
      }

      if (this.activeEvent.id === "focus-surge") {
        this.succeedActiveEvent("SURGE CAPTURED");
      } else if (this.activeEvent.id === "counter-opening") {
        this.succeedActiveEvent("COUNTER-HEX");
      }
    }

    handleMistake() {
      if (this.activeEvent && this.activeEvent.id === "volatile-rune") {
        this.failActiveEvent("Rune cracked", true);
      }
    }

    schedulePostSpellOpportunity() {
      if (!this.enabled || this.activeEvent || this.random() > (this.settings.postSpellChance || 0)) {
        return;
      }

      const delay = this.rollRange(this.settings.postSpellDelayMs || [1600, 3200]);
      this.nextEventMs = this.nextEventMs > 0 ? Math.min(this.nextEventMs, delay) : delay;
    }

    cancelForIncoming() {
      if (this.activeEvent) {
        this.activeEvent = null;
        this.feedback = null;
        this.scheduleNext();
      }
    }

    startRandomEvent(context) {
      const eventId = EVENT_ORDER[Math.floor(this.random() * EVENT_ORDER.length)];
      const event = this.createEvent(eventId, context);
      if (!event) {
        this.scheduleNext();
        return;
      }

      this.activeEvent = event;
      this.feedback = null;
      this.callbacks.onStart && this.callbacks.onStart(event);
    }

    createEvent(eventId, context) {
      const safeContext = context || {};
      const targetLineIndex = safeContext.lineIndex == null ? 0 : safeContext.lineIndex;

      if (eventId === "focus-surge") {
        const tuning = this.settings.focusSurge || {};
        const durationMs = tuning.durationMs || 5000;
        return {
          id: eventId,
          name: "Focus Surge",
          instruction: "Finish this line before the surge burns out.",
          targetLineIndex,
          durationMs,
          remainingMs: durationMs,
          guard: tuning.guard || 6,
        };
      }

      if (eventId === "volatile-rune") {
        const tuning = this.settings.volatileRune || {};
        const durationMs = tuning.durationMs || 4500;
        return {
          id: eventId,
          name: "Volatile Rune",
          instruction: `Type ${tuning.requiredCorrect || 10} clean characters.`,
          targetLineIndex,
          durationMs,
          remainingMs: durationMs,
          correctCharacters: 0,
          requiredCorrect: tuning.requiredCorrect || 10,
          damageBoostMultiplier: tuning.damageBoostMultiplier || 1.15,
        };
      }

      if (eventId === "counter-opening") {
        const tuning = this.settings.counterOpening || {};
        const durationMs = tuning.durationMs || 4000;
        return {
          id: eventId,
          name: "Counter Opening",
          instruction: "Finish this line to hex the enemy cast.",
          targetLineIndex,
          durationMs,
          remainingMs: durationMs,
          enemyDelayMs: tuning.enemyDelayMs || 1800,
        };
      }

      return null;
    }

    succeedActiveEvent(message) {
      const event = this.activeEvent;
      if (!event) {
        return;
      }

      this.activeEvent = null;
      this.showFeedback(event, message, "success");
      this.scheduleNext();
      this.callbacks.onSuccess && this.callbacks.onSuccess(event, message);
    }

    failActiveEvent(message, countsAsMiss) {
      const event = this.activeEvent;
      if (!event) {
        return;
      }

      this.activeEvent = null;
      this.showFeedback(event, message, "fail");
      this.scheduleNext();
      this.callbacks.onFail &&
        this.callbacks.onFail({
          event,
          message,
          countsAsMiss: Boolean(countsAsMiss),
        });
    }

    showFeedback(event, message, result) {
      this.feedback = {
        id: event.id,
        name: event.name,
        instruction: message,
        result,
        remainingMs: this.settings.feedbackMs || 1300,
      };
    }

    updateFeedback(deltaMs) {
      if (!this.feedback) {
        return;
      }

      this.feedback.remainingMs -= deltaMs;
      if (this.feedback.remainingMs <= 0) {
        this.feedback = null;
      }
    }

    scheduleNext() {
      this.nextEventMs = this.rollRange(this.settings.intervalMs || [14000, 22000]);
    }

    getTimeoutMessage(event) {
      if (event.id === "focus-surge") {
        return "Surge faded";
      }

      if (event.id === "volatile-rune") {
        return "Rune fizzled";
      }

      return "Opening closed";
    }

    getDisplayState() {
      if (this.activeEvent) {
        return {
          visible: true,
          active: true,
          id: this.activeEvent.id,
          name: this.activeEvent.name,
          instruction: this.getActiveInstruction(this.activeEvent),
          result: "active",
          remainingMs: Math.max(0, this.activeEvent.remainingMs),
          remainingPercent: Math.max(0, Math.min(100, (this.activeEvent.remainingMs / this.activeEvent.durationMs) * 100)),
        };
      }

      if (this.feedback) {
        return {
          visible: true,
          active: false,
          id: this.feedback.id,
          name: this.feedback.name,
          instruction: this.feedback.instruction,
          result: this.feedback.result,
          remainingMs: Math.max(0, this.feedback.remainingMs),
          remainingPercent: 100,
        };
      }

      return {
        visible: false,
        active: false,
        id: null,
        name: "",
        instruction: "",
        result: "idle",
        remainingMs: 0,
        remainingPercent: 0,
      };
    }

    getActiveInstruction(event) {
      if (event.id === "volatile-rune") {
        return `Clean chars ${event.correctCharacters} / ${event.requiredCorrect}`;
      }

      return event.instruction;
    }

    readContext() {
      return this.getContext ? this.getContext() : {};
    }

    rollRange(range) {
      const [min, max] = range;
      return Math.round(min + (max - min) * this.random());
    }
  }

  WizardDuel.DuelEventManager = DuelEventManager;
})(window);
