(function attachDebugConfig(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  WizardDuel.DebugConfig = {
    showFps: false,
    showDebugState: false,
    reducedMotion: false,
    enableScreenShake: true,
    enableSpellParticles: true,
    enableEnemyAi: true,
    enableDuelEvents: true,
    showMicroHints: true,
    audioDebug: false,
  };
})(window);
