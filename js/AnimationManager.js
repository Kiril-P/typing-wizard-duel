(function attachAnimationManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class AnimationManager {
    constructor(elements, options) {
      this.elements = elements;
      this.config = (options && options.config) || WizardDuel.DebugConfig || {};
      this.audio = (options && options.audio) || null;
      this.timers = new Set();
    }

    clear() {
      this.timers.forEach((timer) => window.clearTimeout(timer));
      this.timers.clear();
      this.elements.effectsLayer.innerHTML = "";
      this.elements.gameRoot.classList.remove(
        "screen-shake",
        "big-shake",
        "incoming-tension",
        "low-health",
        "line-near-complete",
        "spell-final-line",
        "incoming-brace"
      );
      this.elements.spellPanel.classList.remove("danger", "failed", "stunned");
      this.elements.playerWizard.classList.remove("casting", "failed", "shielded", "hit");
      this.elements.opponentWizard.classList.remove("casting", "failed", "shielded", "hit");
    }

    correctKey(charElement, lineElement) {
      this.emitAudio("correctKey");

      if (charElement) {
        charElement.classList.add("key-pop");
      }

      if (lineElement) {
        lineElement.classList.add("active-pulse");
      }

      this.after(190, () => {
        charElement && charElement.classList.remove("key-pop");
        lineElement && lineElement.classList.remove("active-pulse");
      });
    }

    mistake(lineElement, strikeElement) {
      this.emitAudio("wrongKey");
      this.elements.spellPanel.classList.add("danger");
      this.addShake("screen-shake");

      if (lineElement) {
        lineElement.classList.add("mistake");
      }

      if (strikeElement) {
        strikeElement.classList.add("spent");
      }

      this.after(280, () => {
        this.elements.spellPanel.classList.remove("danger");
        this.elements.gameRoot.classList.remove("screen-shake");
        lineElement && lineElement.classList.remove("mistake");
      });
    }

    comboMilestone(combo) {
      this.emitAudio("comboMilestone", { combo });
      const label = this.createEffect("floating-text", `Combo ${combo}`);
      this.elements.effectsLayer.appendChild(label);
      this.after(900, () => label.remove());
    }

    spellReward(title, detail, type) {
      const reward = this.createEffect(`spell-reward ${type || ""}`);
      const titleElement = document.createElement("strong");
      const detailElement = document.createElement("span");
      titleElement.textContent = title;
      detailElement.textContent = detail;
      reward.append(titleElement, detailElement);
      this.elements.effectsLayer.appendChild(reward);
      this.after(1250, () => reward.remove());
    }

    spellFailure(damage) {
      return this.spellFizzle(damage, 780, "SPELL FIZZLED!");
    }

    spellFizzle(damage, durationMs, labelText) {
      return new Promise((resolve) => {
        this.emitAudio("spellFizzle", { damage });
        this.elements.spellPanel.classList.add("failed");
        this.elements.playerWizard.classList.add("failed");
        this.addShake("screen-shake");

        const fizzle = this.createEffect("effect fizzle");
        const label = this.createEffect("floating-text fizzle-label", labelText || "SPELL FIZZLED!");
        this.elements.effectsLayer.appendChild(fizzle);
        this.elements.effectsLayer.appendChild(label);

        if (damage > 0) {
          this.showDamage(this.elements.playerWizard, damage, "backlash");
        }

        this.after(durationMs, () => {
          this.elements.spellPanel.classList.remove("failed");
          this.elements.playerWizard.classList.remove("failed");
          this.elements.gameRoot.classList.remove("screen-shake");
          fizzle.remove();
          label.remove();
          resolve();
        });
      });
    }

    shortStun(labelText, durationMs) {
      return new Promise((resolve) => {
        this.elements.spellPanel.classList.add("failed");
        this.elements.playerWizard.classList.add("failed");
        this.addShake("screen-shake");

        const label = this.createEffect("floating-text fizzle-label", labelText || "STUNNED!");
        this.elements.effectsLayer.appendChild(label);

        this.after(durationMs, () => {
          this.elements.spellPanel.classList.remove("failed");
          this.elements.playerWizard.classList.remove("failed");
          this.elements.gameRoot.classList.remove("screen-shake");
          label.remove();
          resolve();
        });
      });
    }

    playSpellCast(config) {
      const spell = config.spell;
      const caster = config.casterElement;
      const target = config.targetElement;
      const timings = this.getSpellTimings(spell.animation);

      return new Promise((resolve) => {
        this.emitAudio("spellCast", { spell: spell.name });
        caster.classList.add("casting");
        if (this.config.enableSpellParticles !== false) {
          this.spawnSpellEffects(spell.animation);
        }

        this.after(timings.impact, () => {
          config.onImpact && config.onImpact();
          this.emitAudio("spellImpact", { spell: spell.name });

          if (target) {
            target.classList.add("hit");
            this.after(460, () => target.classList.remove("hit"));
          }

          this.addImpactFlash();
          this.addShake("big-shake");
          this.after(540, () => this.elements.gameRoot.classList.remove("big-shake"));
        });

        this.after(timings.total, () => {
          caster.classList.remove("casting");
          resolve();
        });
      });
    }

    playEnemyAttack(spell, resisted) {
      if (this.config.enableSpellParticles === false) {
        this.incomingResolved(resisted, spell);
        return;
      }

      if (spell.animation === "static") {
        this.scheduleEffect("effect enemy-static-zap", 0, 520);
        this.scheduleEffect("effect player-lightning-column", 430, 620);
        return;
      }

      if (spell.animation === "fireball") {
        this.scheduleEffect("effect enemy-fireball", 0, 760);
        this.scheduleEffect("effect player-fireburst", 610, 540);
        return;
      }

      if (spell.animation === "tiny-doom") {
        this.scheduleEffect("effect player-tiny-blob", 0, 760);
        this.scheduleEffect("effect player-doom-explosion", 720, 720);
        return;
      }

      if (spell.animation === "meteor") {
        this.scheduleEffect("effect player-meteor-marker", 0, 920);
        this.scheduleEffect("effect player-meteor", 680, 1040);
      }
    }

    spawnSpellEffects(animation) {
      if (animation === "fireball") {
        this.scheduleEffect("effect fireball-bottle", 80, 900);
        this.scheduleEffect("effect flame-wave", 620, 850);
        return;
      }

      if (animation === "shield") {
        this.scheduleEffect("effect cardboard-shield", 150, 1280);
        return;
      }

      if (animation === "tiny-doom") {
        this.scheduleEffect("effect tiny-blob", 160, 960);
        this.scheduleEffect("effect doom-explosion", 890, 820);
        return;
      }

      if (animation === "static") {
        this.scheduleEffect("effect static-zap", 140, 620);
        this.scheduleEffect("effect lightning-column", 780, 700);
        return;
      }

      if (animation === "meteor") {
        this.scheduleEffect("effect pebble", 160, 900);
        this.scheduleEffect("effect meteor", 980, 1060);
      }
    }

    getSpellTimings(animation) {
      const timings = {
        fireball: { impact: 1040, total: 1580 },
        shield: { impact: 610, total: 1320 },
        "tiny-doom": { impact: 1080, total: 1640 },
        static: { impact: 1030, total: 1480 },
        meteor: { impact: 1470, total: 1980 },
      };

      return timings[animation] || { impact: 700, total: 1200 };
    }

    scheduleEffect(className, delay, lifetime) {
      this.after(delay, () => {
        const effect = this.createEffect(className);
        this.elements.effectsLayer.appendChild(effect);
        this.after(lifetime, () => effect.remove());
      });
    }

    showDamage(targetElement, amount, type) {
      const number = this.createEffect(`damage-number ${type || ""}`, amount > 0 ? `-${amount}` : "Blocked");
      targetElement.appendChild(number);
      this.after(920, () => number.remove());
    }

    showBlocked(targetElement, amount) {
      this.emitAudio("blocked", { amount });
      const number = this.createEffect("damage-number absorb", `Blocked ${amount}`);
      targetElement.appendChild(number);
      targetElement.classList.add("shielded");
      this.after(920, () => number.remove());
      this.after(680, () => targetElement.classList.remove("shielded"));
    }

    showBlock(targetElement, amount, label) {
      const number = this.createEffect("damage-number block", label || `+${amount} block`);
      targetElement.appendChild(number);
      targetElement.classList.add("shielded");
      this.after(920, () => number.remove());
      this.after(1300, () => targetElement.classList.remove("shielded"));
    }

    addImpactFlash() {
      if (this.config.reducedMotion) {
        return;
      }

      const flash = this.createEffect("impact-flash");
      this.elements.effectsLayer.appendChild(flash);
      this.after(280, () => flash.remove());
    }

    incomingResolved(resisted, spell) {
      this.elements.gameRoot.classList.remove("incoming-tension");

      if (resisted) {
        this.emitAudio("resisted", { spell: spell && spell.name });
        const label = this.createEffect("floating-text resist-label", "RESISTED!");
        this.elements.effectsLayer.appendChild(label);
        this.elements.playerWizard.classList.add("shielded");
        this.scheduleEffect("effect resist-ring", 0, 650);
        this.after(520, () => this.elements.playerWizard.classList.remove("shielded"));
        this.after(920, () => label.remove());
        return;
      }

      this.emitAudio("spellImpact", { spell: spell && spell.name, fullHit: true });
      const label = this.createEffect("floating-text impact-label", "DIRECT HIT!");
      this.elements.effectsLayer.appendChild(label);
      this.addImpactFlash();
      this.addShake(spell && spell.animation === "meteor" ? "meteor-shake" : "big-shake");
      this.elements.playerWizard.classList.add("hit");

      this.after(560, () => {
        this.elements.gameRoot.classList.remove("big-shake");
        this.elements.gameRoot.classList.remove("meteor-shake");
        this.elements.playerWizard.classList.remove("hit");
      });
      this.after(920, () => label.remove());
    }

    enemyStumble(spell) {
      this.elements.opponentWizard.classList.add("failed");
      const label = this.createEffect("floating-text enemy-fumble-label", "Enemy fumbled!");
      this.elements.effectsLayer.appendChild(label);
      this.after(720, () => {
        this.elements.opponentWizard.classList.remove("failed");
        label.remove();
      });
    }

    createEffect(className, text) {
      const effect = document.createElement("div");
      effect.className = className;
      if (text) {
        effect.textContent = text;
      }
      return effect;
    }

    after(delay, callback) {
      const timer = window.setTimeout(() => {
        this.timers.delete(timer);
        callback();
      }, delay);

      this.timers.add(timer);
      return timer;
    }

    addShake(className) {
      if (this.config.reducedMotion || this.config.enableScreenShake === false) {
        return;
      }

      this.elements.gameRoot.classList.add(className);
    }

    emitAudio(eventName, details) {
      if (this.audio) {
        this.audio.emit(eventName, details);
      }
    }
  }

  WizardDuel.AnimationManager = AnimationManager;
})(window);
