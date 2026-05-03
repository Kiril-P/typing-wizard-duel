(function attachDamageManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class DamageManager {
    constructor(config) {
      this.animations = config.animations;
      this.stats = config.stats;
      this.audio = config.audio || null;
    }

    applyAttack(target, targetElement, amount, damageType) {
      const result = target.takeDamage(amount);
      this.stats.recordDamageDealt(result);
      this.showDamageResult(targetElement, result, damageType);
      return result;
    }

    applyDefense(target, targetElement, blockAmount, label) {
      target.addBlock(blockAmount);
      this.animations.showBlock(targetElement, blockAmount, label);
      return {
        requested: blockAmount,
        gained: blockAmount,
        capped: false,
        block: target.block,
      };
    }

    grantCappedBlock(target, targetElement, blockAmount, maxBlock, label, cappedLabel) {
      const requested = Math.max(0, Math.round(blockAmount));
      const cap = Math.max(0, Math.round(maxBlock));
      const available = Math.max(0, cap - target.block);
      const gained = Math.min(requested, available);

      if (gained > 0) {
        target.addBlock(gained);
        this.animations.showBlock(targetElement, gained, this.formatGuardLabel(label, gained));
        this.emitAudio("guardGain", { amount: gained, block: target.block, cap });
        return {
          requested,
          gained,
          capped: gained < requested,
          block: target.block,
        };
      }

      if (requested > 0) {
        this.animations.showBlock(targetElement, 0, cappedLabel || "Guard Full");
      }

      return {
        requested,
        gained: 0,
        capped: requested > 0,
        block: target.block,
      };
    }

    applyIncoming(target, targetElement, amount, options) {
      const settings = options || {};
      const result = target.takeDamage(amount, { ignoreBlock: settings.ignoreBlock });
      this.stats.recordDamageTaken(result);
      if (settings.showVisual !== false) {
        this.showDamageResult(targetElement, result, settings.damageType);
      }
      return result;
    }

    showDamageResult(targetElement, result, damageType) {
      if (result.blocked > 0) {
        this.animations.showBlocked(targetElement, result.blocked);
      }

      if (result.damage > 0 || result.blocked === 0) {
        this.animations.showDamage(targetElement, result.damage, result.damage > 0 ? damageType || "damage" : "block");
      }
    }

    showSpellReward(spell, result, comboMultiplier, blockResult) {
      const details = [];

      if (spell.damage > 0) {
        const damageText = result.damage > 0 ? `-${result.damage} HP` : "Blocked";
        details.push(damageText);

        if (result.damage >= 45) {
          details.push("DEVASTATING");
          this.emitAudio("bigHit", { spell: spell.name, damage: result.damage });
        } else if (result.damage >= 35) {
          details.push("BIG HIT");
          this.emitAudio("bigHit", { spell: spell.name, damage: result.damage });
        } else if (comboMultiplier > 1) {
          details.push(`Combo Boost x${comboMultiplier.toFixed(1)}`);
        } else if (result.damage > 0) {
          details.push("Clean hit");
        }
      }

      if (spell.block > 0) {
        if (blockResult && blockResult.gained > 0) {
          details.push(`+${blockResult.gained} Guard`);
        } else if (blockResult && blockResult.capped) {
          details.push("Guard Full");
        } else {
          details.push(`+${spell.block} Guard`);
        }
      }

      this.animations.spellReward(`CAST: ${spell.name}`, details.join(" / "), spell.animation);
    }

    describeDamage(prefix, result) {
      if (result.blocked > 0 && result.damage > 0) {
        return `${prefix}: ${result.blocked} blocked, ${result.damage} HP damage.`;
      }

      if (result.blocked > 0) {
        return `${prefix}: blocked ${result.blocked} damage.`;
      }

      return `${prefix}: ${result.damage} damage.`;
    }

    formatGuardLabel(label, amount) {
      if (!label) {
        return `+${amount} block`;
      }

      if (label.includes("+")) {
        return label;
      }

      if (label === "Combo Guard") {
        return `${label} +${amount}`;
      }

      return `${label} +${amount} Guard`;
    }

    emitAudio(eventName, details) {
      if (this.audio) {
        this.audio.emit(eventName, details);
      }
    }
  }

  WizardDuel.DamageManager = DamageManager;
})(window);
