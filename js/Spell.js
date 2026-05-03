(function attachSpell(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class Spell {
    constructor(config) {
      this.id = config.id;
      this.name = config.name;
      this.type = config.type;
      this.damage = config.damage || 0;
      this.block = config.block || 0;
      this.difficulty = config.difficulty || "Prototype";
      this.animation = config.animation || "generic";
      this.lines = config.lines.slice();
      this.phaseNames = config.phaseNames || ["Ignition", "Charge", "Unstable buildup", "Release"];
      this.totalCharacters = this.lines.reduce((sum, line) => sum + line.length, 0);
    }

    get lineCount() {
      return this.lines.length;
    }

    getLine(index) {
      return this.lines[index] || "";
    }

    getPhaseName(lineIndex) {
      if (lineIndex >= this.lines.length - 1) {
        return this.phaseNames[this.phaseNames.length - 1];
      }

      const phaseIndex = Math.min(lineIndex, this.phaseNames.length - 2);
      return this.phaseNames[phaseIndex];
    }
  }

  WizardDuel.Spell = Spell;
})(window);
