(function attachComboManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class ComboManager {
    constructor() {
      this.combo = 0;
      this.bestCombo = 0;
    }

    registerCorrect() {
      this.combo += 1;
      this.bestCombo = Math.max(this.bestCombo, this.combo);

      return {
        combo: this.combo,
        bestCombo: this.bestCombo,
        milestone: this.combo > 0 && this.combo % 10 === 0,
      };
    }

    registerMistake() {
      const previousCombo = this.combo;
      this.combo = 0;
      return previousCombo;
    }

    reset() {
      this.combo = 0;
    }

    resetAll() {
      this.combo = 0;
      this.bestCombo = 0;
    }

    getMeterPercent() {
      return Math.min(100, (this.combo / 50) * 100);
    }

    getDamageMultiplier() {
      const bonusSteps = Math.min(5, Math.floor(this.combo / 25));
      return 1 + bonusSteps * 0.1;
    }
  }

  WizardDuel.ComboManager = ComboManager;
})(window);
