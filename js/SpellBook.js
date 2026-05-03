(function attachSpellBook(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});
  const Spell = WizardDuel.Spell;
  const spellTuning = (WizardDuel.BalanceConfig && WizardDuel.BalanceConfig.playerSpells) || {};

  class SpellBook {
    constructor(spells) {
      this.spells = spells || createPrototypeSpellSequence();
      this.currentIndex = 0;
    }

    getCurrentSpell() {
      return this.spells[this.currentIndex];
    }

    advance() {
      this.currentIndex = (this.currentIndex + 1) % this.spells.length;
      return this.getCurrentSpell();
    }

    reset() {
      this.currentIndex = 0;
    }

    getSequenceLabel() {
      return `Spell ${this.currentIndex + 1} / ${this.spells.length}`;
    }
  }

  function createPrototypeSpellSequence() {
    return [
      new Spell({
        id: "fireball",
        name: "I Cast Fireball",
        type: "attack",
        damage: (spellTuning.fireball && spellTuning.fireball.damage) || 20,
        difficulty: "Medium",
        animation: "fireball",
        lines: [
          "I hereby cast the ancient flame.",
          "Wait, why is it cinnamon flavored?",
          "Ignite the bottle of questionable power.",
          "Please explode in the correct direction.",
        ],
      }),
      new Spell({
        id: "probably-shield",
        name: "Probably Shield",
        type: "guard attack",
        damage: (spellTuning["probably-shield"] && spellTuning["probably-shield"].damage) || 14,
        block: (spellTuning["probably-shield"] && spellTuning["probably-shield"].block) || 22,
        difficulty: "Easy",
        animation: "shield",
        lines: [
          "Raise the barrier of mild confidence.",
          "This shield is probably certified.",
          "Stand behind the cardboard of destiny.",
          "Nothing bad can happen now.",
        ],
      }),
      new Spell({
        id: "tiny-doom",
        name: "Tiny Doom",
        type: "attack",
        damage: (spellTuning["tiny-doom"] && spellTuning["tiny-doom"].damage) || 30,
        difficulty: "Medium-Hard",
        animation: "tiny-doom",
        lines: [
          "Summon the smallest doom imaginable.",
          "Do not underestimate the tiny one.",
          "Let the little blob finish charging.",
          "Unleash unreasonable consequences.",
        ],
      }),
      new Spell({
        id: "static-shock",
        name: "Static Shock",
        type: "quick attack",
        damage: (spellTuning["static-shock"] && spellTuning["static-shock"].damage) || 14,
        difficulty: "Easy-Medium",
        animation: "static",
        lines: [
          "Rub the socks of thunder together.",
          "Gather the awkward little sparks.",
          "Point dramatically at the enemy.",
          "Zap now, apologize later.",
        ],
      }),
      new Spell({
        id: "dramatic-meteor",
        name: "Dramatic Meteor",
        type: "heavy attack",
        damage: (spellTuning["dramatic-meteor"] && spellTuning["dramatic-meteor"].damage) || 36,
        difficulty: "Hard",
        animation: "meteor",
        lines: [
          "Request one dramatic rock from space.",
          "Make it flashy but legally safe.",
          "Aim somewhere near the opponent.",
          "Begin the extremely slow descent.",
          "Pretend this was under control.",
          "Deliver the final bonk from orbit.",
        ],
      }),
    ];
  }

  WizardDuel.SpellBook = SpellBook;
})(window);
