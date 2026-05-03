(function attachGameManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});
  const BALANCE = WizardDuel.BalanceConfig || {};

  const MAX_STRIKES = BALANCE.maxStrikes || 3;
  const MISTAKE_LOCKOUT_MS = BALANCE.mistakeLockoutMs || 380;
  const FIZZLE_STUN_MS = BALANCE.fizzleStunMs || 1250;
  const INCOMING_STUN_MS = BALANCE.incomingStunMs || 700;
  const BACKLASH_DAMAGE = BALANCE.backlashDamage || 6;
  const BASE_PLAYER_HP = BALANCE.playerMaxHp || 125;
  const BASE_OPPONENT_HP = BALANCE.opponentMaxHp || 150;
  const INCOMING_WARNING_MS = BALANCE.incomingWarningMs || 1500;
  const RESISTED_DAMAGE_MULTIPLIER = BALANCE.resistedDamageMultiplier || 0.5;
  const ENEMY_DAMAGE_MULTIPLIER = BALANCE.enemyDamageMultiplier || 0.7;
  const INCOMING_WARNING_DURATIONS = BALANCE.incomingWarningDurations || {
    static: 1250,
    fireball: 1500,
    "tiny-doom": 1650,
    meteor: 2100,
  };
  const COMBO_GUARD = BALANCE.comboGuard || {
    maxPlayerBlock: 40,
    comboMilestoneBlock: 5,
    cleanLineBlock: 3,
    minimumShownGain: 1,
  };

  class GameManager {
    constructor(documentRef) {
      this.document = documentRef;
      this.config = WizardDuel.DebugConfig || {};
      this.ui = new WizardDuel.UIManager(documentRef, this.config);
      this.elements = this.ui.elements;
      this.audio = new WizardDuel.AudioManager(this.config);
      this.stats = new WizardDuel.MatchStats();
      this.player = new WizardDuel.Character({ name: "Keyboardius", maxHp: BASE_PLAYER_HP });
      this.opponent = new WizardDuel.Character({ name: "Practice Golem", maxHp: BASE_OPPONENT_HP });
      this.spellBook = new WizardDuel.SpellBook();
      this.combo = new WizardDuel.ComboManager();
      this.animations = new WizardDuel.AnimationManager(this.elements, {
        config: this.config,
        audio: this.audio,
      });
      this.damage = new WizardDuel.DamageManager({
        animations: this.animations,
        stats: this.stats,
        audio: this.audio,
      });
      this.enemyAI = new WizardDuel.EnemyAI({
        balance: BALANCE,
        onSpellReady: (spell) => this.handleEnemySpellReady(spell),
        onStumble: (spell) => this.handleEnemyStumble(spell),
      });
      this.hints = new WizardDuel.HintManager(this.elements.hintToast, this.config);
      this.interrupts = new WizardDuel.InterruptManager({
        durationMs: INCOMING_WARNING_MS,
        onExpired: (payload) => this.resolveIncomingAttack(payload, false),
      });
      this.state = "idle";
      this.currentSpell = this.spellBook.getCurrentSpell();
      this.frameId = null;
      this.lastFrameTime = 0;
      this.stunTimer = null;
      this.lowHealthHookEmitted = false;
      this.typingEngine = new WizardDuel.TypingEngine({
        maxStrikes: MAX_STRIKES,
        mistakeLockoutMs: MISTAKE_LOCKOUT_MS,
        callbacks: {
          onCorrect: (event) => this.handleCorrectInput(event),
          onLineComplete: (event) => this.handleLineComplete(event),
          onMistake: (event) => this.handleMistake(event),
          onSpellComplete: (event) => this.handleSpellComplete(event),
          onStrikeOverload: (event) => this.handleStrikeOverload(event),
        },
      });
      this.ui.setupSettings({ onHintsDisabled: () => this.hints.hide() });
      this.ui.setupTutorial(() => this.startDuel());
    }

    start() {
      this.restart();
    }

    restart() {
      this.stopLoop();
      this.clearStunTimer();
      this.animations.clear();
      this.hints.reset();
      this.stats.reset();
      this.player.reset();
      this.opponent.reset();
      this.spellBook.reset();
      this.combo.resetAll();
      this.interrupts.clear();
      this.enemyAI.stop();
      this.lowHealthHookEmitted = false;
      this.currentSpell = this.spellBook.getCurrentSpell();
      this.state = "tutorial";
      this.ui.hideResult();
      this.ui.hideIncomingWarning();
      this.ui.hideStunOverlay();
      this.typingEngine.loadSpell(this.currentSpell);
      this.typingEngine.setEnabled(false);
      this.ui.setStatus("Read the training scroll, then start the duel.");
      this.renderAll();
      this.ui.showTutorial();
    }

    startDuel() {
      if (this.state !== "tutorial") {
        return;
      }

      this.ui.hideTutorial();
      this.state = "playing";
      this.typingEngine.resumeCurrentSpell();
      if (this.config.enableEnemyAi !== false) {
        this.enemyAI.start();
      }
      this.ui.setStatus("Duel started. Type the spell exactly.");
      this.renderAll();
      this.startLoop();
    }

    startLoop() {
      this.lastFrameTime = performance.now();
      this.frameId = requestAnimationFrame((time) => this.tick(time));
    }

    stopLoop() {
      if (this.frameId != null) {
        cancelAnimationFrame(this.frameId);
        this.frameId = null;
      }
    }

    tick(time) {
      const deltaMs = Math.min(120, time - this.lastFrameTime);
      this.lastFrameTime = time;

      if (this.state === "playing") {
        if (this.config.enableEnemyAi !== false) {
          this.enemyAI.update(deltaMs);
        }
        this.interrupts.update(deltaMs);
      }

      this.ui.renderFrame(this.getRenderContext(), deltaMs);

      if (this.state !== "ended") {
        this.frameId = requestAnimationFrame((nextTime) => this.tick(nextTime));
      }
    }

    handleKeyDown(event) {
      if (this.state !== "playing") {
        return;
      }

      const key = this.normalizeKey(event);
      if (key == null) {
        return;
      }

      event.preventDefault();
      this.typingEngine.handleInput(key);
    }

    normalizeKey(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return null;
      }

      if (event.key && event.key.length === 1) {
        return event.key;
      }

      if (event.key === "Backspace" || event.key === "Enter") {
        return event.key;
      }

      return null;
    }

    handleCorrectInput(event) {
      const result = this.combo.registerCorrect();
      this.stats.recordCorrect(result.bestCombo);
      const guardResult = result.milestone
        ? this.grantPlayerGuard(COMBO_GUARD.comboMilestoneBlock, "Combo Guard")
        : null;
      this.renderAll();

      const charElement = this.ui.getCharacterElement(event.lineIndex, event.charIndex);
      const lineElement = this.ui.getLineElement(event.lineIndex);
      this.animations.correctKey(charElement, lineElement);

      if (result.milestone) {
        this.animations.comboMilestone(result.combo);
        const guardText = guardResult && guardResult.gained > 0 ? ` Combo Guard +${guardResult.gained}.` : " Guard Full.";
        this.ui.setStatus(`Combo ${result.combo}. Spell energy surges.${guardText}`);
      } else if (!event.lineCompleted && !event.spellCompleted) {
        this.ui.setStatus("Correct.");
      }
    }

    handleLineComplete(event) {
      let guardResult = null;
      if (event.cleanLine) {
        guardResult = this.grantCleanLineGuard();
      }

      if (this.interrupts.isActive()) {
        this.resistIncomingAttack();
        return;
      }

      const guardText =
        guardResult && guardResult.gained > 0
          ? ` Clean Line +${guardResult.gained} Guard.`
          : guardResult && guardResult.capped
            ? " Guard Full."
            : "";
      this.ui.setStatus(`Line ${event.lineIndex + 1} locked.${guardText}`);
      this.renderAll();
    }

    handleMistake(event) {
      this.combo.registerMistake();
      this.stats.recordMistake();
      this.renderAll();

      const lineElement = this.ui.getLineElement(event.lineIndex);
      const strikeElement = this.elements.strikeMarkers[event.strikes - 1];
      this.animations.mistake(lineElement, strikeElement);
      this.hints.showOnce("first-mistake", "Wrong key! Three strikes fizzle your spell.");
      this.ui.setStatus(
        `Strike ${event.strikes}: expected ${this.formatKey(event.expected)}, got ${this.formatKey(event.actual)}.`
      );
    }

    handleStrikeOverload() {
      this.stats.recordFizzle();
      this.hints.showOnce("first-fizzle", "Fizzle stuns you briefly, but your spell progress stays.");
      this.beginPlayerStun({
        durationMs: FIZZLE_STUN_MS,
        title: "SPELL FIZZLED!",
        message: "The spell stays intact, but typing focus is stunned.",
        damage: BACKLASH_DAMAGE,
        ignoreBlock: true,
        onRecovered: () => {
          if (this.player.isDefeated) {
            this.endMatch("loss");
            return;
          }

          this.typingEngine.resetStrikes();
          this.typingEngine.resumeCurrentSpell();
          this.state = "playing";
          this.ui.setStatus("Recovered. Continue the same line.");
          this.renderAll();
        },
      });
    }

    handleSpellComplete(event) {
      if (event.cleanLine) {
        this.grantCleanLineGuard();
      }

      if (this.interrupts.isActive()) {
        this.resistIncomingAttack();
        if (this.state === "ended") {
          return;
        }
      }

      this.state = "resolving";
      this.enemyAI.setPaused(true);
      this.typingEngine.setEnabled(false);
      this.renderAll();

      const spell = event.spell;
      const hasDamage = spell.damage > 0;
      const hasBlock = spell.block > 0;
      const comboMultiplier = this.combo.getDamageMultiplier();
      const damage = hasDamage ? Math.round(spell.damage * comboMultiplier) : 0;
      this.stats.recordSpellCast();

      this.ui.setStatus(`CAST: ${spell.name}${comboMultiplier > 1 ? " Combo Boost!" : ""}`);

      this.animations
        .playSpellCast({
          spell,
          casterElement: this.elements.playerWizard,
          targetElement: hasDamage ? this.elements.opponentWizard : null,
          onImpact: () => {
            let damageResult = { damage: 0, blocked: 0, rawDamage: 0 };
            let blockResult = null;

            if (hasDamage) {
              damageResult = this.damage.applyAttack(this.opponent, this.elements.opponentWizard, damage);
            }

            if (hasBlock) {
              blockResult = this.grantPlayerGuard(spell.block, "Probably Shield");
            }

            this.damage.showSpellReward(spell, damageResult, comboMultiplier, blockResult);
            this.ui.setStatus(this.describePlayerSpellResult(spell, damageResult, blockResult));
            this.renderAll();
          },
        })
        .then(() => {
          if (this.opponent.isDefeated) {
            this.endMatch("win");
            return;
          }

          this.currentSpell = this.spellBook.advance();
          this.typingEngine.loadSpell(this.currentSpell);
          this.state = "playing";
          this.enemyAI.setPaused(false);
          this.ui.setStatus("Next spell ready.");
          this.renderAll();
          this.maybeShowSpellHint(this.currentSpell);
        });
    }

    handleEnemySpellReady(spell) {
      if (this.state === "ended") {
        return;
      }

      this.enemyAI.setPaused(true);
      this.elements.enemyStateLabel.textContent = "Ready";

      if (spell.damage > 0 && spell.id !== "probably-shield") {
        this.beginIncomingAttack(spell);
        return;
      }

      this.resolveEnemyDefense(spell);
    }

    beginIncomingAttack(spell) {
      const damage = Math.max(1, Math.round(spell.damage * ENEMY_DAMAGE_MULTIPLIER));
      const warningDuration = this.getIncomingWarningDuration(spell);
      this.interrupts.start({
        spell,
        damage,
      }, warningDuration);

      this.audio.emit("incomingWarning", { spell: spell.name, durationMs: warningDuration });
      this.ui.showIncomingWarning(spell);
      this.hints.showOnce("first-incoming", "Incoming! Finish this line to resist.");
      this.ui.setStatus(`${spell.name} is incoming. Finish the current line.`);
    }

    resistIncomingAttack() {
      const payload = this.interrupts.resist();
      if (!payload) {
        return;
      }

      this.resolveIncomingAttack(payload, true);
    }

    resolveIncomingAttack(payload, resisted) {
      if (!payload || this.state === "ended") {
        return;
      }

      this.ui.hideIncomingWarning();
      this.elements.opponentWizard.classList.remove("casting");

      const adjustedDamage = resisted ? Math.ceil(payload.damage * RESISTED_DAMAGE_MULTIPLIER) : payload.damage;
      const result = this.damage.applyIncoming(this.player, this.elements.playerWizard, adjustedDamage, {
        damageType: resisted ? "resisted" : "damage",
      });
      if (resisted) {
        this.stats.recordResist();
      }
      this.animations.playEnemyAttack(payload.spell, resisted);
      this.animations.incomingResolved(resisted, payload.spell);
      this.renderAll();

      if (resisted) {
        this.ui.setStatus(this.damage.describeDamage(`RESISTED ${payload.spell.name}`, result));
      } else {
        this.ui.setStatus(this.damage.describeDamage(`${payload.spell.name} landed`, result));
      }

      if (this.player.isDefeated) {
        this.endMatch("loss");
        return;
      }

      this.enemyAI.advance();

      if (!resisted) {
        this.beginPlayerStun({
          durationMs: INCOMING_STUN_MS,
          title: "STUNNED!",
          message: "The impact rattled your typing focus.",
          damage: 0,
          ignoreBlock: false,
          onRecovered: () => {
            if (this.state === "ended") {
              return;
            }

            this.typingEngine.resumeCurrentSpell();
            this.state = "playing";
            this.enemyAI.setPaused(false);
            this.ui.setStatus("Recovered from impact.");
            this.renderAll();
          },
        });
        return;
      }

      this.enemyAI.setPaused(false);
    }

    handleEnemyStumble(spell) {
      if (this.state === "ended") {
        return;
      }

      this.animations.enemyStumble(spell);
      this.ui.setStatus(`Practice Golem fumbled ${spell.name}.`);
    }

    resolveEnemyDefense(spell) {
      this.ui.setStatus(`Practice Golem starts ${spell.name}.`);
      this.animations
        .playSpellCast({
          spell,
          casterElement: this.elements.opponentWizard,
          targetElement: null,
          onImpact: () => {
            this.damage.applyDefense(this.opponent, this.elements.opponentWizard, spell.block);
            this.ui.setStatus(`Practice Golem gained ${spell.block} block.`);
            this.renderAll();
          },
        })
        .then(() => {
          if (this.state === "ended") {
            return;
          }

          this.enemyAI.advance();
          this.enemyAI.setPaused(false);
        });
    }

    beginPlayerStun(config) {
      this.clearStunTimer();
      this.state = "stunned";
      this.enemyAI.setPaused(true);
      this.typingEngine.setEnabled(false);
      this.combo.reset();
      this.ui.showStunOverlay(config.title, config.message, config.durationMs);

      let damageResult = null;
      if (config.damage > 0) {
        damageResult = this.damage.applyIncoming(this.player, this.elements.playerWizard, config.damage, {
          ignoreBlock: config.ignoreBlock,
          showVisual: false,
        });
        this.animations.spellFizzle(damageResult.damage, config.durationMs, config.title);
        this.ui.setStatus(`${config.title} Backlash dealt ${damageResult.damage} HP.`);
      } else {
        this.animations.shortStun(config.title, config.durationMs);
        this.ui.setStatus(`${config.title} Typing focus paused.`);
      }

      this.renderAll();
      this.stunTimer = window.setTimeout(() => {
        this.stunTimer = null;
        this.ui.hideStunOverlay();
        this.typingEngine.resetStrikes();
        config.onRecovered && config.onRecovered(damageResult);
      }, config.durationMs);
    }

    endMatch(result) {
      this.state = "ended";
      this.stopLoop();
      this.clearStunTimer();
      this.enemyAI.stop();
      this.interrupts.clear();
      this.ui.hideIncomingWarning();
      this.ui.hideStunOverlay();
      this.typingEngine.setEnabled(false);
      this.renderAll();

      if (result === "win") {
        this.audio.emit("win");
      } else {
        this.audio.emit("loss");
      }

      this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo.bestCombo);
      this.ui.showMatchResult(result, this.stats);
    }

    maybeShowSpellHint(spell) {
      if (spell && spell.id === "probably-shield") {
        this.hints.showOnce("first-shield", "Shield block absorbs incoming damage.");
      }
    }

    grantCleanLineGuard() {
      this.audio.emit("cleanLine");
      return this.grantPlayerGuard(COMBO_GUARD.cleanLineBlock, "Clean Line");
    }

    grantPlayerGuard(amount, label) {
      if (amount < COMBO_GUARD.minimumShownGain) {
        return {
          requested: amount,
          gained: 0,
          capped: false,
          block: this.player.block,
        };
      }

      return this.damage.grantCappedBlock(
        this.player,
        this.elements.playerWizard,
        amount,
        COMBO_GUARD.maxPlayerBlock,
        label,
        "Guard Full"
      );
    }

    describePlayerSpellResult(spell, damageResult, blockResult) {
      const details = [];

      if (spell.damage > 0) {
        if (damageResult.blocked > 0 && damageResult.damage > 0) {
          details.push(`${damageResult.blocked} blocked, ${damageResult.damage} HP damage`);
        } else if (damageResult.blocked > 0) {
          details.push(`blocked by ${damageResult.blocked}`);
        } else {
          details.push(`${damageResult.damage} HP damage`);
        }
      }

      if (spell.block > 0) {
        details.push(blockResult && blockResult.gained > 0 ? `+${blockResult.gained} guard` : "guard full");
      }

      return `CAST: ${spell.name}. ${details.join(" / ")}.`;
    }

    renderAll() {
      this.maybeEmitLowHealthHook();
      this.ui.renderAll(this.getRenderContext());
    }

    maybeEmitLowHealthHook() {
      if (!this.lowHealthHookEmitted && this.state !== "tutorial" && this.player.hpPercent <= 35) {
        this.lowHealthHookEmitted = true;
        this.audio.emit("lowHealth", {
          hp: this.player.currentHp,
          maxHp: this.player.maxHp,
        });
      }
    }

    getRenderContext() {
      return {
        gameState: this.state,
        player: this.player,
        opponent: this.opponent,
        currentSpell: this.currentSpell,
        sequenceLabel: this.spellBook.getSequenceLabel(),
        typing: this.typingEngine.getDisplayState(),
        combo: this.combo,
        enemy: this.enemyAI.getDisplayState(),
        incoming: this.interrupts.getDisplayState(),
      };
    }

    clearStunTimer() {
      if (this.stunTimer != null) {
        window.clearTimeout(this.stunTimer);
        this.stunTimer = null;
      }
    }

    getIncomingWarningDuration(spell) {
      return INCOMING_WARNING_DURATIONS[spell.animation] || INCOMING_WARNING_MS;
    }

    formatKey(key) {
      if (key === " ") {
        return "space";
      }

      return `"${key}"`;
    }

  }

  WizardDuel.GameManager = GameManager;
})(window);
