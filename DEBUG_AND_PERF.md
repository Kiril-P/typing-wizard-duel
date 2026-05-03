# DEBUG_AND_PERF.md

This document describes debug and performance guidance for Typing Wizard Duel. A small settings/debug panel now exists, but it is intentionally lightweight and off by default.

## 1. Current Debug Needs

Useful current debug questions:

- What is the current `GameManager.state`?
- Is typing enabled?
- What spell, line index, and character index is the player on?
- What are the current strikes and combo?
- Is mistake lockout active?
- What enemy spell is being cast?
- How much time remains on the enemy cast timer?
- Is an incoming warning active?
- How much time remains in the interrupt window?
- Is a duel event active or showing feedback?
- How much time remains on the duel event?
- Did a duel event complete, miss, or clear because an incoming warning took priority?
- What are player/opponent HP and block values?
- Is player guard capped at the configured `comboGuard.maxPlayerBlock`?
- Did the current completed line count as clean or mistake-tainted?
- Are `low-health`, `line-near-complete`, `spell-final-line`, and `incoming-brace` classes being applied only when appropriate?
- Are animation timers being cleaned up on restart/end?
- Is the tutorial state preventing enemy AI and typing pressure before Start Duel?
- Are one-time hints resetting on restart and hiding their timers?
- Are match stats reset on restart and rendered only at end state?
- Is `UIManager` receiving a complete render context from `GameManager`?
- Is `DamageManager` still recording damage dealt/taken correctly after combat events?

Current manual debug entry point:

- `window.WizardDuel.currentGame`

Current central flags:

- `window.WizardDuel.DebugConfig`
- `window.WizardDuel.currentGame.ui`

## 2. Suggested Debug Flags

Implemented in `js/DebugConfig.js`:

- `showFps`
- `showDebugState`
- `reducedMotion`
- `enableScreenShake`
- `enableSpellParticles`
- `enableEnemyAi`
- `enableDuelEvents`
- `showMicroHints`
- `audioDebug`

Still suggested for future expansion:

- `showHitboxesOrEffectAnchors`
- `forceEnemySpell`
- `forceIncomingWarning`
- `slowMotionCombat`

Flags should default to normal gameplay behavior:

- debug UI off
- screen shake on
- particles on
- enemy AI on
- audio debug off

## 3. Suggested Debug Panel Values

The current settings panel supports:

- reduced motion
- show FPS
- show debug state
- hints on/off

Current debug state line includes:

- game state
- player line/character index
- combo
- enemy cast progress
- interrupt warning remaining time
- active duel event id and feedback state

Current non-debug onboarding values:

- tutorial overlay visibility is controlled by `GameManager.state === "tutorial"` and `UIManager`
- enemy AI stays stopped until `GameManager.startDuel()`
- hint visibility is controlled by `HintManager` and `DebugConfig.showMicroHints`

Future debug panel values may include:

- player spell name
- strikes
- combo
- player HP/block
- opponent HP/block
- enemy spell name
- enemy spell index
- enemy cast elapsed/duration
- incoming warning active
- incoming warning remaining time
- typing enabled
- mistake lockout remaining time
- active animation timer count, if easy
- hint ids already shown this match
- match stats counters
- current balance preset or key balance constants
- combo guard cap and current player guard
- current clean-line eligibility
- active tension classes
- duel event next timer, active event, and feedback state

The panel should not overlap active typing text or incoming warnings.

## 4. Performance Watchpoints

Watch these areas before adding more visual complexity:

- `GameManager.tick()` runs every animation frame and passes state to `UIManager.renderFrame()`.
- `UIManager.renderEnemyCasting()` currently updates cast progress every frame.
- `UIManager.renderIncomingWarning()` updates warning countdown every frame while active.
- `UIManager.renderDuelEvent()` updates only the compact event panel and timer bar while visible.
- `UIManager.applyTensionClasses()` toggles only root classes each frame; keep this cheap and avoid adding DOM queries inside it.
- `UIManager.renderDebug()` runs every frame but only writes optional small debug text when enabled.
- `UIManager.renderSpellLines()` rebuilds all spell line DOM and should not be called every frame.
- Keypress handling should stay short and synchronous.
- CSS effects should avoid forcing layout every frame.
- Animation timers should be cleared on restart/end through `AnimationManager.clear()` and `GameManager.clearStunTimer()`.
- `EnemyAI.stop()` and `GameManager.stopLoop()` must run on match end.
- `EnemyAI.update()` now handles start delay and stumble pauses without adding intervals/timeouts.
- `AudioManager.emit()` is no-op unless `audioDebug` is enabled.
- New Phase 4C hooks `cleanLine`, `guardGain`, `bigHit`, and `lowHealth` should remain silent unless audio debug or real audio playback is intentionally added.
- Duel event hooks `duelEventStart`, `duelEventSuccess`, `duelEventFail`, and `counterHex` should also stay silent unless audio debug or real audio playback is intentionally added.
- `HintManager` uses one short timeout for the currently visible hint and clears it on restart/hide.
- Tutorial overlay does not run its own loop.
- Match summary rendering happens once at match end, not per frame.
- Balance tuning lives in `BalanceConfig.js`; avoid duplicating tunables across files.
- Duel event tuning lives under `BalanceConfig.duelEvents`; do not hide event durations or rewards in `GameManager`.
- Combo guard tuning lives under `BalanceConfig.comboGuard`; do not hard-code the guard cap in `GameManager` or `DamageManager`.
- `DamageManager` should stay event-driven; do not move damage work into the per-frame loop.
- `DuelEventManager` is driven by the existing `GameManager.tick()` loop and must not add independent intervals.

Avoid:

- per-frame full DOM rewrites
- multiple independent game loops for the same match state
- untracked intervals
- long chained timeouts without cleanup
- debug overlays that cause layout shifts in gameplay UI
- onboarding or summary timers that survive restart

## 5. Future Benchmark Ideas

Manual checks:

- Record FPS while enemy warning, spell effects, and typing all happen together.
- Check whether typing response feels immediate during large spell animations.
- Verify restart does not leave old timers or warnings running.
- Verify restart hides old hints, clears old summaries, and returns to tutorial.
- Verify restart clears active duel events and feedback state.
- Verify a 2-3 minute match does not degrade responsiveness.

Possible future instrumentation:

- max frame time tracker
- keypress-to-render latency sampling
- animation timer count display
- UI render timing samples
- simple browser console benchmark helper for one scripted match

Do not add a benchmark framework or dependency unless explicitly requested.
