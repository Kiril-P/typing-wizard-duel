(function attachCharacter(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class Character {
    constructor(config) {
      this.name = config.name;
      this.maxHp = config.maxHp;
      this.currentHp = config.currentHp == null ? config.maxHp : config.currentHp;
      this.block = config.block || 0;
    }

    get hpPercent() {
      return Math.max(0, Math.min(100, (this.currentHp / this.maxHp) * 100));
    }

    get isDefeated() {
      return this.currentHp <= 0;
    }

    addBlock(amount) {
      this.block += Math.max(0, amount);
      return this.block;
    }

    takeDamage(amount, options) {
      const settings = options || {};
      const rawDamage = Math.max(0, Math.round(amount));
      let blocked = 0;
      let damage = rawDamage;

      if (!settings.ignoreBlock && this.block > 0) {
        blocked = Math.min(this.block, damage);
        this.block -= blocked;
        damage -= blocked;
      }

      this.currentHp = Math.max(0, this.currentHp - damage);

      return {
        rawDamage,
        damage,
        blocked,
        defeated: this.isDefeated,
      };
    }

    reset() {
      this.currentHp = this.maxHp;
      this.block = 0;
    }
  }

  WizardDuel.Character = Character;
})(window);
