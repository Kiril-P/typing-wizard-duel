(function attachInterruptManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class InterruptManager {
    constructor(config) {
      this.durationMs = config.durationMs;
      this.onExpired = config.onExpired;
      this.active = false;
      this.elapsedMs = 0;
      this.payload = null;
    }

    start(payload, durationMs) {
      this.active = true;
      this.elapsedMs = 0;
      this.payload = payload;
      this.durationMs = durationMs || this.durationMs;
    }

    update(deltaMs) {
      if (!this.active) {
        return;
      }

      this.elapsedMs += deltaMs;

      if (this.elapsedMs >= this.durationMs) {
        const expiredPayload = this.payload;
        this.clear();
        this.onExpired && this.onExpired(expiredPayload);
      }
    }

    resist() {
      if (!this.active) {
        return null;
      }

      const resistedPayload = this.payload;
      this.clear();
      return resistedPayload;
    }

    clear() {
      this.active = false;
      this.elapsedMs = 0;
      this.payload = null;
    }

    isActive() {
      return this.active;
    }

    getDisplayState() {
      const remainingMs = this.active ? Math.max(0, this.durationMs - this.elapsedMs) : 0;
      const remainingPercent = this.durationMs > 0 ? (remainingMs / this.durationMs) * 100 : 0;

      return {
        active: this.active,
        payload: this.payload,
        elapsedMs: this.elapsedMs,
        remainingMs,
        remainingPercent: Math.max(0, Math.min(100, remainingPercent)),
      };
    }
  }

  WizardDuel.InterruptManager = InterruptManager;
})(window);
