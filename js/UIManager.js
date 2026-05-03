(function attachUIManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class UIManager {
    constructor(documentRef, config) {
      this.document = documentRef;
      this.config = config || WizardDuel.DebugConfig || {};
      this.elements = this.collectElements();
      this.fpsSampleMs = 0;
      this.fpsFrames = 0;
      this.currentFps = 0;
    }

    setupSettings(callbacks) {
      const handlers = callbacks || {};
      this.syncSettingsUi();

      this.elements.reducedMotionToggle.addEventListener("change", () => {
        this.config.reducedMotion = this.elements.reducedMotionToggle.checked;
        this.config.enableScreenShake = !this.config.reducedMotion;
        this.applyAccessibilityFlags();
      });

      this.elements.showFpsToggle.addEventListener("change", () => {
        this.config.showFps = this.elements.showFpsToggle.checked;
        this.elements.fpsReadout.hidden = !this.config.showFps;
      });

      this.elements.showDebugToggle.addEventListener("change", () => {
        this.config.showDebugState = this.elements.showDebugToggle.checked;
        this.elements.debugReadout.hidden = !this.config.showDebugState;
      });

      this.elements.showHintsToggle.addEventListener("change", () => {
        this.config.showMicroHints = this.elements.showHintsToggle.checked;
        if (!this.config.showMicroHints && handlers.onHintsDisabled) {
          handlers.onHintsDisabled();
        }
      });
    }

    setupTutorial(onStartDuel) {
      this.elements.tutorialStartButton.addEventListener("click", onStartDuel);
    }

    syncSettingsUi() {
      this.elements.reducedMotionToggle.checked = Boolean(this.config.reducedMotion);
      this.elements.showFpsToggle.checked = Boolean(this.config.showFps);
      this.elements.showDebugToggle.checked = Boolean(this.config.showDebugState);
      this.elements.showHintsToggle.checked = this.config.showMicroHints !== false;
      this.elements.fpsReadout.hidden = !this.config.showFps;
      this.elements.debugReadout.hidden = !this.config.showDebugState;
      this.applyAccessibilityFlags();
    }

    applyAccessibilityFlags() {
      this.elements.gameRoot.classList.toggle("reduced-motion", Boolean(this.config.reducedMotion));
    }

    updateFps(deltaMs) {
      this.fpsSampleMs += deltaMs;
      this.fpsFrames += 1;

      if (this.fpsSampleMs >= 500) {
        this.currentFps = Math.round((this.fpsFrames * 1000) / this.fpsSampleMs);
        this.fpsSampleMs = 0;
        this.fpsFrames = 0;
      }
    }

    renderAll(context) {
      this.applyTensionClasses(context);
      this.renderCharacters(context.player, context.opponent);
      this.renderSpellHeader(context);
      this.renderSpellLines(context);
      this.renderStrikes(context.typing.strikes);
      this.renderCombo(context.combo);
      this.renderCharge(context.typing.chargePercent);
      this.renderEnemyCasting(context.enemy, context.incoming.active);
      this.renderIncomingWarning(context.incoming);
      this.renderDuelEvent(context.duelEvent);
    }

    renderFrame(context, deltaMs) {
      this.updateFps(deltaMs);
      this.applyTensionClasses(context);
      this.renderEnemyCasting(context.enemy, context.incoming.active);
      this.renderIncomingWarning(context.incoming);
      this.renderDuelEvent(context.duelEvent);
      this.renderDebug(context);
    }

    renderCharacters(player, opponent) {
      this.renderCharacter(player, this.elements.playerHpText, this.elements.playerHpFill, this.elements.playerBlockBadge);
      this.renderCharacter(
        opponent,
        this.elements.opponentHpText,
        this.elements.opponentHpFill,
        this.elements.opponentBlockBadge
      );
    }

    renderCharacter(character, hpTextElement, hpFillElement, blockBadgeElement) {
      hpTextElement.textContent = `${character.currentHp} / ${character.maxHp} HP`;
      hpFillElement.style.width = `${character.hpPercent}%`;
      blockBadgeElement.textContent = `Block ${character.block}`;
      blockBadgeElement.classList.toggle("has-block", character.block > 0);
    }

    renderSpellHeader(context) {
      const state = context.typing;
      const spell = state.spell || context.currentSpell;
      const activeLine = Math.min(state.lineIndex + 1, spell.lineCount);

      this.elements.spellName.textContent = spell.name;
      this.elements.spellTypeLabel.textContent = `${spell.type} spell`;
      this.elements.sequenceLabel.textContent = context.sequenceLabel;
      this.elements.lineProgressText.textContent = `Line ${activeLine} / ${spell.lineCount}`;
      this.elements.phaseLabel.textContent = spell.getPhaseName(Math.min(state.lineIndex, spell.lineCount - 1));
    }

    renderSpellLines(context) {
      const state = context.typing;
      const spell = state.spell || context.currentSpell;
      this.elements.spellLines.innerHTML = "";

      spell.lines.forEach((line, lineIndex) => {
        const lineElement = this.document.createElement("li");
        lineElement.className = "spell-line";
        lineElement.dataset.line = String(lineIndex);

        if (lineIndex < state.lineIndex) {
          lineElement.classList.add("completed");
        } else if (lineIndex === state.lineIndex && context.gameState !== "ended") {
          lineElement.classList.add("active");
        }

        const number = this.document.createElement("span");
        number.className = "line-number";
        number.textContent = String(lineIndex + 1).padStart(2, "0");

        const text = this.document.createElement("span");
        text.className = "line-text";

        for (let charIndex = 0; charIndex < line.length; charIndex += 1) {
          const char = line[charIndex];
          const charElement = this.document.createElement("span");
          charElement.classList.add("char");
          charElement.dataset.line = String(lineIndex);
          charElement.dataset.char = String(charIndex);
          charElement.textContent = char;

          if (char === " ") {
            charElement.classList.add("space");
          }

          if (lineIndex < state.lineIndex || (lineIndex === state.lineIndex && charIndex < state.charIndex)) {
            charElement.classList.add("correct");
          } else if (lineIndex === state.lineIndex && charIndex === state.charIndex && context.gameState === "playing") {
            charElement.classList.add("current");
          } else {
            charElement.classList.add("remaining");
          }

          text.appendChild(charElement);
        }

        lineElement.append(number, text);
        this.elements.spellLines.appendChild(lineElement);
      });
    }

    renderStrikes(strikes) {
      this.elements.strikeMarkers.forEach((marker, index) => {
        marker.classList.toggle("spent", index < strikes);
      });
    }

    renderCombo(combo) {
      this.elements.comboCount.textContent = String(combo.combo);
      this.elements.comboFill.style.width = `${combo.getMeterPercent()}%`;
    }

    renderCharge(chargePercent) {
      this.elements.spellChargeFill.style.width = `${chargePercent}%`;
    }

    renderEnemyCasting(state, incomingActive) {
      const spell = state.spell;

      this.elements.enemySpellName.textContent = spell ? spell.name : "Preparing...";
      this.elements.enemyCastFill.style.width = `${state.progressPercent}%`;
      this.elements.enemyCastTimer.textContent = !state.enabled
        ? "Start duel"
        : state.castDurationMs > 0
          ? `${Math.max(0, (state.castDurationMs - state.elapsedMs) / 1000).toFixed(1)}s to cast`
          : "0.0s";

      if (!incomingActive) {
        if (!state.enabled) {
          this.elements.enemyStateLabel.textContent = "Waiting";
        } else if (state.stumbling) {
          this.elements.enemyStateLabel.textContent = "Fumbled";
        } else if (state.startDelayMs > 0) {
          this.elements.enemyStateLabel.textContent = "Aiming";
        } else {
          this.elements.enemyStateLabel.textContent = state.paused ? "Holding" : "Casting";
        }
      }
    }

    renderIncomingWarning(state) {
      if (!state.active) {
        return;
      }

      this.elements.incomingWarningFill.style.width = `${state.remainingPercent}%`;
      this.elements.incomingWarning.classList.toggle("urgent", state.remainingMs <= 500);
      if (state.payload && state.payload.spell) {
        this.elements.incomingSpellName.textContent = `INCOMING: ${state.payload.spell.name}`;
      }
    }

    renderDebug(context) {
      if (this.config.showFps) {
        this.elements.fpsReadout.textContent = `FPS: ${this.currentFps || "--"}`;
      }

      if (!this.config.showDebugState) {
        return;
      }

      this.elements.debugReadout.textContent =
        `State ${context.gameState} | ` +
        `Line ${context.typing.lineIndex + 1}:${context.typing.charIndex} | ` +
        `Combo ${context.combo.combo} | ` +
        `Enemy ${context.enemy.progressPercent.toFixed(0)}% | ` +
        `Warn ${context.incoming.active ? Math.ceil(context.incoming.remainingMs) + "ms" : "none"} | ` +
        `Event ${context.duelEvent.visible ? context.duelEvent.id : "none"}`;
    }

    applyTensionClasses(context) {
      const state = context.typing;
      const spell = state.spell || context.currentSpell;
      const activeLine = spell && spell.getLine(state.lineIndex);
      const remaining = activeLine ? Math.max(0, activeLine.length - state.charIndex) : 0;
      const typingActive = context.gameState === "playing" && Boolean(activeLine);
      const finalLine = spell && state.lineIndex === spell.lineCount - 1;

      this.elements.gameRoot.classList.toggle("low-health", context.player.hpPercent <= 35);
      this.elements.gameRoot.classList.toggle("line-near-complete", typingActive && remaining > 0 && remaining <= 6);
      this.elements.gameRoot.classList.toggle("spell-final-line", typingActive && Boolean(finalLine));
      this.elements.gameRoot.classList.toggle("incoming-brace", Boolean(context.incoming.active));
      this.elements.gameRoot.classList.toggle("duel-event-active", Boolean(context.duelEvent.active));
      ["focus-surge", "volatile-rune", "counter-opening"].forEach((eventId) => {
        this.elements.gameRoot.classList.toggle(
          `duel-event-${eventId}`,
          Boolean(context.duelEvent.active && context.duelEvent.id === eventId)
        );
      });
    }

    renderDuelEvent(state) {
      if (!state || !state.visible) {
        this.elements.duelEventPanel.hidden = true;
        this.elements.duelEventPanel.className = "duel-event-panel";
        this.elements.duelEventFill.style.width = "0%";
        return;
      }

      this.elements.duelEventPanel.hidden = false;
      this.elements.duelEventPanel.className = `duel-event-panel ${state.id} ${state.result}`;
      this.elements.duelEventName.textContent = state.name;
      this.elements.duelEventInstruction.textContent = state.instruction;
      this.elements.duelEventFill.style.width = `${state.remainingPercent}%`;
    }

    showIncomingWarning(spell) {
      this.elements.incomingSpellName.textContent = `INCOMING: ${spell.name}`;
      this.elements.incomingHint.textContent = "Finish current line to resist!";
      this.elements.incomingWarning.hidden = false;
      this.elements.incomingWarning.classList.remove("urgent");
      this.elements.gameRoot.classList.add("incoming-tension");
      this.elements.opponentWizard.classList.add("casting");
    }

    hideIncomingWarning() {
      this.elements.incomingWarning.hidden = true;
      this.elements.incomingWarning.classList.remove("urgent");
      this.elements.incomingWarningFill.style.width = "0%";
      this.elements.gameRoot.classList.remove("incoming-tension");
    }

    showStunOverlay(title, message, durationMs) {
      this.elements.stunTitle.textContent = title;
      this.elements.stunMessage.textContent = message;
      this.elements.stunTimerFill.style.transition = "none";
      this.elements.stunTimerFill.style.width = "100%";
      this.elements.stunOverlay.hidden = false;
      this.elements.spellPanel.classList.add("stunned");

      requestAnimationFrame(() => {
        this.elements.stunTimerFill.style.transition = `width ${durationMs}ms linear`;
        this.elements.stunTimerFill.style.width = "0%";
      });
    }

    hideStunOverlay() {
      this.elements.stunOverlay.hidden = true;
      this.elements.spellPanel.classList.remove("stunned");
      this.elements.stunTimerFill.style.transition = "none";
      this.elements.stunTimerFill.style.width = "0%";
    }

    showTutorial() {
      this.elements.tutorialOverlay.hidden = false;
    }

    hideTutorial() {
      this.elements.tutorialOverlay.hidden = true;
    }

    hideResult() {
      this.elements.matchOverlay.hidden = true;
      this.elements.matchSummary.textContent = "";
    }

    showMatchResult(result, stats) {
      if (result === "win") {
        this.elements.resultKicker.textContent = "Opponent defeated";
        this.elements.resultTitle.textContent = "Victory";
        this.elements.resultDescription.textContent =
          "The Practice Golem has been reduced to gravel by questionable typing magic.";
      } else {
        this.elements.resultKicker.textContent = "Wizard down";
        this.elements.resultTitle.textContent = "Defeat";
        this.elements.resultDescription.textContent =
          "Incoming spells and unstable typing knocked the player wizard out of the duel.";
      }

      this.renderMatchSummary(result, stats);
      this.elements.matchOverlay.hidden = false;
    }

    renderMatchSummary(result, stats) {
      this.elements.matchSummary.textContent = "";

      const rows = [
        ["Result", result === "win" ? "Victory" : "Defeat"],
        ["Spells cast", stats.spellsCast],
        ["Best combo", stats.bestCombo],
        ["Correct chars", stats.correctCharacters],
        ["Mistakes", stats.wrongKeyPresses],
        ["Fizzles", stats.fizzles],
        ["Damage dealt", stats.damageDealt],
        ["Damage taken", stats.damageTaken],
        ["Successful resists", stats.successfulResists],
        ["Block absorbed", stats.blocksAbsorbed],
        ["Duel events won", stats.duelEventsCompleted],
        ["Duel events missed", stats.duelEventsMissed],
        ["Counter-hexes", stats.counterHexes],
      ];

      rows.forEach(([label, value]) => {
        const term = this.document.createElement("dt");
        const definition = this.document.createElement("dd");
        term.textContent = label;
        definition.textContent = String(value);
        this.elements.matchSummary.append(term, definition);
      });
    }

    setStatus(message) {
      this.elements.statusMessage.textContent = message;
    }

    getLineElement(lineIndex) {
      return this.elements.spellLines.querySelector(`[data-line="${lineIndex}"]`);
    }

    getCharacterElement(lineIndex, charIndex) {
      return this.elements.spellLines.querySelector(`[data-line="${lineIndex}"][data-char="${charIndex}"]`);
    }

    collectElements() {
      return {
        gameRoot: this.document.getElementById("game"),
        arena: this.document.getElementById("arena"),
        spellPanel: this.document.getElementById("spellPanel"),
        effectsLayer: this.document.getElementById("effectsLayer"),
        playerWizard: this.document.getElementById("playerWizard"),
        opponentWizard: this.document.getElementById("opponentWizard"),
        playerHpText: this.document.getElementById("playerHpText"),
        playerHpFill: this.document.getElementById("playerHpFill"),
        playerBlockBadge: this.document.getElementById("playerBlockBadge"),
        opponentHpText: this.document.getElementById("opponentHpText"),
        opponentHpFill: this.document.getElementById("opponentHpFill"),
        opponentBlockBadge: this.document.getElementById("opponentBlockBadge"),
        enemyStateLabel: this.document.getElementById("enemyStateLabel"),
        enemySpellName: this.document.getElementById("enemySpellName"),
        enemyCastFill: this.document.getElementById("enemyCastFill"),
        enemyCastTimer: this.document.getElementById("enemyCastTimer"),
        spellName: this.document.getElementById("spellName"),
        spellTypeLabel: this.document.getElementById("spellTypeLabel"),
        sequenceLabel: this.document.getElementById("sequenceLabel"),
        phaseLabel: this.document.getElementById("phaseLabel"),
        lineProgressText: this.document.getElementById("lineProgressText"),
        statusMessage: this.document.getElementById("statusMessage"),
        duelEventPanel: this.document.getElementById("duelEventPanel"),
        duelEventName: this.document.getElementById("duelEventName"),
        duelEventInstruction: this.document.getElementById("duelEventInstruction"),
        duelEventFill: this.document.getElementById("duelEventFill"),
        spellLines: this.document.getElementById("spellLines"),
        strikeMarkers: Array.from(this.document.querySelectorAll(".strike-marker")),
        comboCount: this.document.getElementById("comboCount"),
        comboFill: this.document.getElementById("comboFill"),
        spellChargeFill: this.document.getElementById("spellChargeFill"),
        incomingWarning: this.document.getElementById("incomingWarning"),
        incomingSpellName: this.document.getElementById("incomingSpellName"),
        incomingHint: this.document.getElementById("incomingHint"),
        incomingWarningFill: this.document.getElementById("incomingWarningFill"),
        reducedMotionToggle: this.document.getElementById("reducedMotionToggle"),
        showFpsToggle: this.document.getElementById("showFpsToggle"),
        showDebugToggle: this.document.getElementById("showDebugToggle"),
        showHintsToggle: this.document.getElementById("showHintsToggle"),
        fpsReadout: this.document.getElementById("fpsReadout"),
        debugReadout: this.document.getElementById("debugReadout"),
        hintToast: this.document.getElementById("hintToast"),
        stunOverlay: this.document.getElementById("stunOverlay"),
        stunTitle: this.document.getElementById("stunTitle"),
        stunMessage: this.document.getElementById("stunMessage"),
        stunTimerFill: this.document.getElementById("stunTimerFill"),
        matchOverlay: this.document.getElementById("matchOverlay"),
        resultKicker: this.document.getElementById("resultKicker"),
        resultTitle: this.document.getElementById("resultTitle"),
        resultDescription: this.document.getElementById("resultDescription"),
        matchSummary: this.document.getElementById("matchSummary"),
        tutorialOverlay: this.document.getElementById("tutorialOverlay"),
        tutorialStartButton: this.document.getElementById("tutorialStartButton"),
      };
    }
  }

  WizardDuel.UIManager = UIManager;
})(window);
