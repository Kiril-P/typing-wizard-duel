(function attachBalanceConfig(global) {
  const WizardDuel = (global.WizardDuel = global.WizardDuel || {});

  WizardDuel.BalanceConfig = {
    maxStrikes: 3,
    mistakeLockoutMs: 380,
    fizzleStunMs: 1150,
    incomingStunMs: 450,
    backlashDamage: 3,
    playerMaxHp: 150,
    opponentMaxHp: 155,
    incomingWarningMs: 1600,
    resistedDamageMultiplier: 0.25,
    enemyDamageMultiplier: 0.5,
    incomingWarningDurations: {
      static: 1700,
      fireball: 2100,
      "tiny-doom": 2400,
      meteor: 3000,
    },
    comboGuard: {
      maxPlayerBlock: 40,
      comboMilestoneBlock: 5,
      cleanLineBlock: 3,
      minimumShownGain: 1,
    },
    playerSpells: {
      fireball: { damage: 28 },
      "probably-shield": { damage: 14, block: 18 },
      "tiny-doom": { damage: 38 },
      "static-shock": { damage: 20 },
      "dramatic-meteor": { damage: 48 },
    },
    enemyCastRanges: {
      "static-shock": [5000, 6200],
      fireball: [7800, 9600],
      "tiny-doom": [9500, 11500],
      "dramatic-meteor": [12000, 15000],
      "probably-shield": [6500, 8200],
    },
    enemyStartDelayMs: [420, 1050],
    enemyOpeningStartDelayMs: [2200, 3200],
    enemyStumbleChance: 0.18,
    enemyStumbleDurationMs: [380, 780],
    enemyStumbleTriggerRange: [0.34, 0.72],
  };
})(window);
