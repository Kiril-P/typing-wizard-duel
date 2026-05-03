(function attachAudioManager(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  class AudioManager {
    constructor(config) {
      this.config = config || WizardDuel.DebugConfig || {};
    }

    emit(eventName, details) {
      if (!this.config.audioDebug) {
        return;
      }

      console.debug("[audio-hook]", eventName, details || {});
    }
  }

  WizardDuel.AudioManager = AudioManager;
})(window);
