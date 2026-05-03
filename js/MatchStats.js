(function attachMatchStats(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class MatchStats {
    constructor() {
      this.reset();
    }

    reset() {
      this.correctCharacters = 0;
      this.wrongKeyPresses = 0;
      this.fizzles = 0;
      this.spellsCast = 0;
      this.damageDealt = 0;
      this.damageTaken = 0;
      this.successfulResists = 0;
      this.blocksAbsorbed = 0;
      this.duelEventsCompleted = 0;
      this.duelEventsMissed = 0;
      this.counterHexes = 0;
      this.bestCombo = 0;
    }

    recordCorrect(bestCombo) {
      this.correctCharacters += 1;
      this.bestCombo = Math.max(this.bestCombo, bestCombo || 0);
    }

    recordMistake() {
      this.wrongKeyPresses += 1;
    }

    recordFizzle() {
      this.fizzles += 1;
    }

    recordSpellCast() {
      this.spellsCast += 1;
    }

    recordDamageDealt(result) {
      this.damageDealt += result && result.damage ? result.damage : 0;
    }

    recordDamageTaken(result) {
      if (!result) {
        return;
      }

      this.damageTaken += result.damage || 0;
      this.blocksAbsorbed += result.blocked || 0;
    }

    recordResist() {
      this.successfulResists += 1;
    }

    recordDuelEventCompleted() {
      this.duelEventsCompleted += 1;
    }

    recordDuelEventMissed() {
      this.duelEventsMissed += 1;
    }

    recordCounterHex() {
      this.counterHexes += 1;
    }
  }

  WizardDuel.MatchStats = MatchStats;
})(window);
