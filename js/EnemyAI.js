(function attachEnemyAI(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  const DEFAULT_CAST_RANGES = {
    "static-shock": [3200, 4100],
    fireball: [5200, 6400],
    "tiny-doom": [6500, 7800],
    "dramatic-meteor": [8600, 10400],
    "probably-shield": [4300, 5400],
  };

  class EnemyAI {
    constructor(config) {
      this.balance = config.balance || WizardDuel.BalanceConfig || {};
      this.spellBook = config.spellBook || new WizardDuel.SpellBook();
      this.castRanges = config.castRanges || this.balance.enemyCastRanges || DEFAULT_CAST_RANGES;
      this.onSpellReady = config.onSpellReady;
      this.onStumble = config.onStumble;
      this.random = config.random || Math.random;
      this.enabled = false;
      this.paused = false;
      this.elapsedMs = 0;
      this.castDurationMs = 0;
      this.currentSpell = null;
      this.startDelayMs = 0;
      this.stumble = null;
    }

    start() {
      this.enabled = true;
      this.paused = false;
      this.spellBook.reset();
      this.beginCurrentSpell();
    }

    stop() {
      this.enabled = false;
      this.paused = false;
      this.elapsedMs = 0;
      this.castDurationMs = 0;
      this.currentSpell = null;
      this.startDelayMs = 0;
      this.stumble = null;
    }

    setPaused(paused) {
      this.paused = paused;
    }

    delayCurrentCast(durationMs) {
      if (!this.enabled || !this.currentSpell) {
        return 0;
      }

      const delay = Math.max(0, Math.round(durationMs));
      this.startDelayMs += delay;
      return delay;
    }

    update(deltaMs) {
      if (!this.enabled || this.paused || !this.currentSpell) {
        return;
      }

      if (this.startDelayMs > 0) {
        this.startDelayMs = Math.max(0, this.startDelayMs - deltaMs);
        return;
      }

      if (this.stumble && this.stumble.active) {
        this.stumble.remainingMs -= deltaMs;
        if (this.stumble.remainingMs <= 0) {
          this.stumble.active = false;
          this.stumble.done = true;
        }
        return;
      }

      if (this.shouldStartStumble()) {
        this.stumble.active = true;
        this.stumble.remainingMs = this.stumble.durationMs;
        this.onStumble && this.onStumble(this.currentSpell);
        return;
      }

      this.elapsedMs = Math.min(this.castDurationMs, this.elapsedMs + deltaMs);

      if (this.elapsedMs >= this.castDurationMs) {
        const completedSpell = this.currentSpell;
        this.paused = true;
        this.onSpellReady && this.onSpellReady(completedSpell);
      }
    }

    advance() {
      if (!this.enabled) {
        return;
      }

      this.spellBook.advance();
      this.beginCurrentSpell();
    }

    beginCurrentSpell() {
      this.currentSpell = this.spellBook.getCurrentSpell();
      this.elapsedMs = 0;
      this.castDurationMs = this.rollCastDuration(this.currentSpell);
      this.startDelayMs = this.rollStartDelay(this.spellBook.currentIndex === 0);
      this.stumble = this.rollStumble(this.currentSpell);
      this.paused = false;
    }

    rollCastDuration(spell) {
      const range = this.castRanges[spell.id] || [5000, 6500];
      const [min, max] = range;
      return Math.round(min + (max - min) * this.random());
    }

    rollStartDelay(openingSpell) {
      const range = openingSpell
        ? this.balance.enemyOpeningStartDelayMs || [160, 680]
        : this.balance.enemyStartDelayMs || [160, 680];
      const [min, max] = range;
      return Math.round(min + (max - min) * this.random());
    }

    rollStumble(spell) {
      const chance = this.balance.enemyStumbleChance == null ? 0.24 : this.balance.enemyStumbleChance;
      if (!spell || this.random() > chance) {
        return null;
      }

      const triggerRange = this.balance.enemyStumbleTriggerRange || [0.3, 0.72];
      const durationRange = this.balance.enemyStumbleDurationMs || [400, 900];
      const [triggerMin, triggerMax] = triggerRange;
      const [durationMin, durationMax] = durationRange;

      return {
        active: false,
        done: false,
        triggerMs: Math.round(this.castDurationMs * (triggerMin + this.random() * (triggerMax - triggerMin))),
        durationMs: Math.round(durationMin + this.random() * (durationMax - durationMin)),
        remainingMs: 0,
      };
    }

    shouldStartStumble() {
      return (
        this.stumble &&
        !this.stumble.active &&
        !this.stumble.done &&
        this.elapsedMs >= this.stumble.triggerMs
      );
    }

    getDisplayState() {
      const progressPercent = this.castDurationMs > 0 ? (this.elapsedMs / this.castDurationMs) * 100 : 0;

      return {
        spell: this.currentSpell,
        elapsedMs: this.elapsedMs,
        castDurationMs: this.castDurationMs,
        startDelayMs: this.startDelayMs,
        stumbling: Boolean(this.stumble && this.stumble.active),
        stumbleRemainingMs: this.stumble && this.stumble.active ? Math.max(0, this.stumble.remainingMs) : 0,
        progressPercent: Math.max(0, Math.min(100, progressPercent)),
        paused: this.paused,
        enabled: this.enabled,
      };
    }
  }

  WizardDuel.EnemyAI = EnemyAI;
})(window);
