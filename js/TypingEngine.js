(function attachTypingEngine(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class TypingEngine {
    constructor(config) {
      this.maxStrikes = config.maxStrikes;
      this.mistakeLockoutMs = config.mistakeLockoutMs || 400;
      this.callbacks = config.callbacks || {};
      this.enabled = false;
      this.spell = null;
      this.lineIndex = 0;
      this.charIndex = 0;
      this.strikes = 0;
      this.correctCharacters = 0;
      this.mistakeLockedUntil = 0;
      this.lineHadMistake = false;
    }

    loadSpell(spell) {
      this.spell = spell;
      this.lineIndex = 0;
      this.charIndex = 0;
      this.strikes = 0;
      this.correctCharacters = 0;
      this.mistakeLockedUntil = 0;
      this.lineHadMistake = false;
      this.enabled = true;
    }

    setEnabled(enabled) {
      this.enabled = enabled;
    }

    handleInput(key) {
      if (!this.enabled || !this.spell) {
        return false;
      }

      if (Date.now() < this.mistakeLockedUntil) {
        return true;
      }

      const expected = this.getExpectedCharacter();
      if (expected == null) {
        return false;
      }

      if (key === expected) {
        this.applyCorrectInput(key);
      } else {
        this.applyMistake(key, expected);
      }

      return true;
    }

    applyCorrectInput(key) {
      const previousLineIndex = this.lineIndex;
      const previousCharIndex = this.charIndex;
      const currentLine = this.spell.getLine(this.lineIndex);

      this.charIndex += 1;
      this.correctCharacters += 1;

      const lineCompleted = this.charIndex >= currentLine.length;
      const cleanLine = lineCompleted && !this.lineHadMistake;
      if (lineCompleted) {
        this.lineIndex += 1;
        this.charIndex = 0;
        this.lineHadMistake = false;
      }

      const spellCompleted = this.lineIndex >= this.spell.lineCount;
      if (spellCompleted) {
        this.enabled = false;
      }

      this.callbacks.onCorrect &&
        this.callbacks.onCorrect({
          key,
          lineIndex: previousLineIndex,
          charIndex: previousCharIndex,
          lineCompleted,
          spellCompleted,
          cleanLine,
        });

      if (lineCompleted && !spellCompleted) {
        this.callbacks.onLineComplete &&
          this.callbacks.onLineComplete({
            lineIndex: previousLineIndex,
            nextLineIndex: this.lineIndex,
            cleanLine,
          });
      }

      if (spellCompleted) {
        this.callbacks.onSpellComplete &&
          this.callbacks.onSpellComplete({
            spell: this.spell,
            correctCharacters: this.correctCharacters,
            cleanLine,
          });
      }
    }

    applyMistake(actual, expected) {
      this.strikes += 1;
      this.mistakeLockedUntil = Date.now() + this.mistakeLockoutMs;
      this.lineHadMistake = true;

      this.callbacks.onMistake &&
        this.callbacks.onMistake({
          actual,
          expected,
          strikes: this.strikes,
          lineIndex: this.lineIndex,
          charIndex: this.charIndex,
          failed: this.strikes >= this.maxStrikes,
        });

      if (this.strikes >= this.maxStrikes) {
        this.enabled = false;
        this.callbacks.onStrikeOverload &&
          this.callbacks.onStrikeOverload({
            spell: this.spell,
            strikes: this.strikes,
            lineIndex: this.lineIndex,
            charIndex: this.charIndex,
          });
      }
    }

    resetStrikes() {
      this.strikes = 0;
    }

    resumeCurrentSpell() {
      this.enabled = true;
      this.mistakeLockedUntil = 0;
    }

    getExpectedCharacter() {
      const line = this.spell && this.spell.getLine(this.lineIndex);
      if (!line) {
        return null;
      }

      return line[this.charIndex];
    }

    getCompletedCharactersBeforeActiveLine() {
      if (!this.spell) {
        return 0;
      }

      return this.spell.lines
        .slice(0, this.lineIndex)
        .reduce((sum, line) => sum + line.length, 0);
    }

    getSpellProgressPercent() {
      if (!this.spell || this.spell.totalCharacters === 0) {
        return 0;
      }

      const complete = this.getCompletedCharactersBeforeActiveLine() + this.charIndex;
      return Math.min(100, (complete / this.spell.totalCharacters) * 100);
    }

    getDisplayState() {
      return {
        spell: this.spell,
        lineIndex: this.lineIndex,
        charIndex: this.charIndex,
        strikes: this.strikes,
        chargePercent: this.getSpellProgressPercent(),
      };
    }
  }

  WizardDuel.TypingEngine = TypingEngine;
})(window);
