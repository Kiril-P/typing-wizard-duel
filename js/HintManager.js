(function attachHintManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class HintManager {
    constructor(element, config) {
      this.element = element;
      this.config = config || WizardDuel.DebugConfig || {};
      this.seen = new Set();
      this.timer = null;
    }

    reset() {
      this.seen.clear();
      this.hide();
    }

    showOnce(id, message, durationMs) {
      if (!this.element || this.config.showMicroHints === false || this.seen.has(id)) {
        return;
      }

      this.seen.add(id);
      this.show(message, durationMs || 4200);
    }

    show(message, durationMs) {
      this.clearTimer();
      this.element.textContent = message;
      this.element.hidden = false;
      this.element.classList.add("visible");

      this.timer = window.setTimeout(() => this.hide(), durationMs);
    }

    hide() {
      this.clearTimer();
      if (!this.element) {
        return;
      }

      this.element.hidden = true;
      this.element.classList.remove("visible");
      this.element.textContent = "";
    }

    clearTimer() {
      if (this.timer != null) {
        window.clearTimeout(this.timer);
        this.timer = null;
      }
    }
  }

  WizardDuel.HintManager = HintManager;
})(window);
