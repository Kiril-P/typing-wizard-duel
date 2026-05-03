# ARCHITECTURE.md

This is a living architecture map for the current static Typing Wizard Duel prototype. Update it whenever code structure, state flow, or major gameplay responsibilities change.

## 1. Project Summary

Typing Wizard Duel is a local browser game where the player types exact multi-line spell text to cast attacks or guard effects against a simulated opponent. The current prototype is Phase 4D: a static HTML/CSS/vanilla JavaScript app with player typing, opponent AI timers, onboarding, one-time micro-hints, incoming attack warnings, resistance by completing the current line, combo-earned guard, lightweight duel events during typing, block consumption, match stats, win/loss summaries, and a smaller high-level `GameManager`.

The project must run directly by opening `index.html`. There is no backend, multiplayer, package manager, build step, or module bundler.

## 2. Runtime Model

The runtime is a single browser page:

- `index.html` loads CSS and ordered JavaScript files with `defer`.
- JavaScript files attach classes to `window.WizardDuel`.
- `js/main.js` creates one `WizardDuel.GameManager` after DOM readiness.
- `GameManager` owns the live match and coordinates all other managers.
- The main game loop uses `requestAnimationFrame`.
- Keyboard input is handled through a `window` `keydown` listener.
- CSS animations and timed callbacks provide visual feedback.
- Debug/settings flags live in `WizardDuel.DebugConfig`.
- Audio hooks are no-op by default through `WizardDuel.AudioManager`.
- Tunable gameplay values live in `WizardDuel.BalanceConfig`.
- DOM rendering and settings UI are centralized in `WizardDuel.UIManager`.
- Damage application, guard/block visuals, and damage text helpers are centralized in `WizardDuel.DamageManager`.
- Player guard rewards reuse `Character.block` and are capped by `BalanceConfig.comboGuard.maxPlayerBlock`.
- Timed non-network duel events are owned by `WizardDuel.DuelEventManager` and run from the existing game loop.
- Match reset enters a tutorial state. Enemy AI and typing pressure start only after the player presses Start Duel.

No ES module imports are used because the app must work from `file://`.

## 3. File-By-File Map

### `index.html`

Defines the static DOM shell:

- player and opponent HP panels
- player block and opponent block badges
- enemy spell name, cast bar, and cast timer
- small settings/debug panel
- tutorial overlay
- non-intrusive hint toast
- arena and placeholder character visuals
- incoming attack warning overlay
- duel event panel
- current spell panel
- combo meter
- strike markers
- fizzle/stun overlay
- win/loss overlay
- post-match stat summary
- ordered script loading

### `css/style.css`

Owns all presentation:

- layout and responsive behavior
- HP bars, combo meter, strike markers, cast bars, warning bars
- wizard and golem placeholder visuals
- active typing text states
- mistake, fizzle, cast, impact, shield, and incoming warning animations
- enemy-specific directional attack effects
- reduced-motion styling

Important: active typing text must stay readable during all animation states.

### `js/main.js`

Entry point:

- constructs `GameManager`
- starts the game
- wires keyboard input
- wires restart buttons
- exposes `window.WizardDuel.currentGame` for manual inspection/debugging

### `js/DebugConfig.js`

Central feature/debug flag object:

- `showFps`
- `showDebugState`
- `reducedMotion`
- `enableScreenShake`
- `enableSpellParticles`
- `enableEnemyAi`
- `showMicroHints`
- `audioDebug`

The settings UI mutates this shared object. Defaults preserve normal gameplay.

### `js/AudioManager.js`

No-op audio event layer:

- exposes `emit(eventName, details)`
- does not load audio files
- logs only when `DebugConfig.audioDebug` is true
- provides stable future hook names for sound implementation

### `js/BalanceConfig.js`

Central tuning table:

- typing and fizzle constants
- player/opponent HP
- enemy damage multiplier
- resisted damage multiplier
- incoming warning durations
- player spell damage/block values
- combo guard cap, clean-line guard, and combo-milestone guard values
- duel event timing, rewards, and enemy-delay values
- enemy cast ranges
- enemy opening/start delay ranges
- enemy stumble chance, trigger range, and duration range

`GameManager`, `SpellBook`, and `EnemyAI` read this file instead of burying Phase 4A balance values in separate modules.

### `js/HintManager.js`

Owns contextual micro-hints:

- one hint per id per match
- auto-hide timer
- reset on match restart
- checks `DebugConfig.showMicroHints`
- does not know gameplay rules beyond the text/id passed by `GameManager`

### `js/MatchStats.js`

Tracks local per-match stats:

- correct characters
- wrong key presses
- fizzles
- spells cast
- damage dealt
- damage taken
- successful resists
- block absorbed
- duel events completed
- duel events missed
- counter-hexes triggered
- best combo

Stats reset on restart and feed the match result summary. There is no persistence or analytics backend.

### `js/UIManager.js`

Owns DOM references and UI rendering:

- caches all DOM elements used by gameplay managers
- wires settings toggles
- wires the tutorial Start Duel button
- applies reduced-motion class
- samples and renders FPS
- applies tension state classes for low HP, near-complete lines, final lines, and incoming brace windows
- renders optional debug state
- renders player/opponent HP and block
- renders spell header, spell lines, combo, strikes, and charge
- renders enemy cast progress and incoming warning countdown
- renders the duel event panel and event glow state classes
- shows/hides tutorial, stun overlay, incoming warning, and match result overlay
- renders the post-match summary
- exposes element lookup helpers for active line/character feedback

`UIManager` does not own gameplay state; `GameManager` passes a render context built from the current managers.

### `js/DamageManager.js`

Owns damage/block application helpers:

- applies player attack damage to the opponent
- applies incoming or backlash damage to the player
- applies block grants for either combatant
- applies capped player guard grants for clean lines, combo milestones, and hybrid player spells
- records damage dealt/taken through `MatchStats`
- emits blocked and HP damage visuals through `AnimationManager`
- renders spell reward feedback, including combined damage/guard results and big-hit labels
- formats damage result status strings

It delegates actual HP/block math to `Character.takeDamage()` and does not decide match state.

### `js/GameManager.js`

Central coordinator:

- creates player and opponent `Character` instances
- owns the player `SpellBook`
- owns `TypingEngine`, `ComboManager`, `AnimationManager`, `EnemyAI`, `InterruptManager`, `AudioManager`, `DebugConfig`, `UIManager`, `DamageManager`, `HintManager`, and `MatchStats`
- owns `DuelEventManager`
- owns match state strings such as `idle`, `playing`, `resolving`, `stunned`, and `ended`
- uses `tutorial` state after restart before the duel starts
- owns the `requestAnimationFrame` loop
- coordinates damage/block through `DamageManager`
- grants clean-line and combo-milestone guard through `DamageManager`
- advances player spells
- reacts to enemy spell completion
- starts incoming warnings
- resolves resistance and unresisted impacts
- coordinates duel event start/success/failure effects
- asks `UIManager` to show/hide onboarding and overlays
- triggers one-time hints
- records match stats
- asks `UIManager` to render post-match summary
- starts fizzle and impact stuns
- passes render contexts to `UIManager`
- stops loops/timers on end/restart
- keeps high-level typing, enemy AI, spell completion, match start/restart/end coordination

This file is smaller after Phase 4B but still coordinates many flows. Avoid putting detailed DOM rendering or damage formatting back into it.

### `js/TypingEngine.js`

Owns player typing state:

- current spell
- line index
- character index
- strike count
- correct character count
- mistake lockout timestamp
- whether the current line has had a mistake
- enabled/disabled state

It emits callbacks for:

- correct input
- line complete with a `cleanLine` boolean
- mistake
- spell complete with a `cleanLine` boolean for the final line
- strike overload

It does not directly mutate the DOM.

### `js/Spell.js`

Defines a spell data object:

- id
- name
- type
- damage
- block
- difficulty
- animation key
- lines
- phase names
- total character count

### `js/SpellBook.js`

Defines the fixed prototype spell sequence:

1. I Cast Fireball
2. Probably Shield
3. Tiny Doom
4. Static Shock
5. Dramatic Meteor

`Probably Shield` is a player hybrid guard attack: it deals light damage and grants guard. Enemy AI still treats `Probably Shield` as defensive only. `SpellBook` also tracks a spell index and provides `getCurrentSpell()`, `advance()`, `reset()`, and `getSequenceLabel()`.

### `js/Character.js`

Stores combatant stats:

- name
- max HP
- current HP
- block

`takeDamage(amount, options)` consumes block first unless `ignoreBlock` is set, then reduces HP and returns a result object containing raw damage, actual HP damage, blocked amount, and defeat status.

### `js/ComboManager.js`

Stores combo:

- current combo
- best combo

Correct input increments combo. Mistakes reset combo. Damage multiplier currently scales from combo in small steps.

### `js/AnimationManager.js`

Coordinates visual feedback:

- correct key pop
- mistake shake
- combo milestone text
- spell cast animation timing
- spell-specific placeholder effects
- fizzle/stun feedback
- block and damage numbers
- incoming impact or resistance feedback
- enemy-specific directional attack effects
- enemy stumble feedback
- timer cleanup

It owns animation timers and clears them through `clear()`.

### `js/EnemyAI.js`

Simulates the opponent:

- owns its own `SpellBook`
- tracks current enemy spell
- rolls a cast duration from per-spell ranges
- increments elapsed time through `update(deltaMs)`
- calls `onSpellReady(spell)` when a spell reaches 100%
- rolls a small spell-start delay
- may trigger one fake stumble per spell
- calls `onStumble(spell)` when a stumble starts
- pauses while warnings or spell effects resolve

The opponent does not type actual text yet.

### `js/DuelEventManager.js`

Owns lightweight real-time events that make typing less static:

- schedules the first event after Start Duel
- schedules later events and optional post-spell opportunities
- tracks one active event or short feedback state
- supports Focus Surge, Volatile Rune, and Counter Opening
- reacts to correct input, mistakes, line completion, timeout, and incoming-warning cancellation
- exposes display state to `UIManager`

It does not mutate HP, block, enemy timers, audio, DOM, or match stats directly. It reports event outcomes back to `GameManager`.

### `js/InterruptManager.js`

Tracks one incoming attack warning:

- active flag
- elapsed warning time
- payload containing spell and damage
- warning duration

It can start a warning, update it, clear it, expire it, or resolve it as resisted.

## 4. Main Game State Flow

1. `main.js` constructs and starts `GameManager`.
2. `GameManager.restart()` resets characters, spellbooks, combo, stats, hints, interrupts, AI, overlays, and typing state.
3. Restart sets `state = "tutorial"`, disables typing, stops enemy AI, renders the first spell, and shows the onboarding overlay.
4. `GameManager.startDuel()` asks `UIManager` to hide onboarding, sets `state = "playing"`, enables typing, starts enemy AI, and begins the `requestAnimationFrame` loop.
5. Each frame, while `state === "playing"`:
   - enemy AI updates its cast progress
   - interrupt warning updates if active
   - duel events update if no incoming warning is active
   - `GameManager` passes a render context to `UIManager.renderFrame()`
6. Keyboard input goes to `TypingEngine` only while `state === "playing"`.
7. Player spell completion moves state to `resolving`.
8. Fizzle or impact stun moves state to `stunned`.
9. Win/loss moves state to `ended`, stops the loop, stops AI, clears warnings, disables typing, and renders the match summary.

## 5. Typing Flow

1. Browser `keydown` reaches `GameManager.handleKeyDown()`.
2. `GameManager` normalizes the key and prevents default browser behavior.
3. `TypingEngine.handleInput(key)` checks enabled state and mistake lockout.
4. The expected character is read from the current spell line and character index.
5. Correct key:
   - increments character index
   - increments correct character count
   - increments combo through `ComboManager`
   - grants capped `Combo Guard` on combo milestones
   - advances Volatile Rune progress if that event is active
   - emits `onCorrect`
   - emits `onLineComplete` with `cleanLine` if the line ended
   - emits `onSpellComplete` with `cleanLine` if the final line ended
   - `GameManager` increments combo and match correct-character stats, then asks `UIManager` and `AnimationManager` for feedback
   - `GameManager` grants capped `Clean Line` guard when a completed line had no mistakes
   - Focus Surge or Counter Opening can complete when the target line completes
6. Wrong key:
   - increments strikes
   - starts mistake lockout
   - emits `onMistake`
   - emits `onStrikeOverload` if strikes reached 3
   - `GameManager` records a wrong key and may show the first mistake hint
   - Volatile Rune fails if active

## 6. Mistake/Fizzle Flow

1. A wrong key increments strikes and resets combo through `GameManager.handleMistake()`.
2. Additional keys during the lockout window are ignored by `TypingEngine`.
3. At 3 strikes, `TypingEngine` disables itself and emits `onStrikeOverload`.
4. `GameManager.handleStrikeOverload()` starts a player stun:
   - state becomes `stunned`
   - enemy AI pauses
   - typing disables
   - combo resets
   - backlash damage is applied with `ignoreBlock`
   - fizzle/stun overlay appears
   - `DamageManager` applies backlash and records damage taken
   - the first fizzle hint may appear
5. After the stun timer:
   - strikes reset
   - typing resumes
   - state returns to `playing`
   - the spell, line, and character position are preserved

## 7. Spell Cast Flow

1. `TypingEngine` emits `onSpellComplete`.
2. If an incoming warning is active, `GameManager` first resolves it as resisted.
3. `GameManager` moves to `resolving`, pauses enemy AI, and disables typing.
4. Attack portions calculate damage using the combo multiplier and any one-time Volatile Rune boost.
5. Guard portions add capped player guard through `DamageManager.grantCappedBlock()`.
6. Match stats record the spell cast.
7. `AnimationManager.playSpellCast()` runs anticipation, effect, impact, and cleanup timing.
8. On impact:
   - attacks call `DamageManager.applyAttack()`
   - guard portions call `GameManager.grantPlayerGuard()`
   - hybrid spells such as `Probably Shield` can do both in one cast
   - UI updates through `UIManager`
   - reward feedback shows `CAST: spell name`, damage, combo boost, `BIG HIT`/`DEVASTATING`, and/or guard gained
   - match stats record HP damage dealt through `DamageManager`
9. If opponent HP reaches 0, `endMatch("win")` runs.
10. Otherwise, the player `SpellBook` advances and typing loads the next spell.
11. Loading `Probably Shield` may show the one-time shield hint.
12. `DuelEventManager.schedulePostSpellOpportunity()` may shorten the next duel event delay.

## 8. Enemy AI Flow

1. `EnemyAI.start()` resets its spell sequence and begins the first spell.
2. The opening spell uses a longer start delay from `BalanceConfig` so the first 10-15 seconds are more readable.
3. Each frame, `EnemyAI.update(deltaMs)` advances elapsed cast time unless paused.
4. A small start delay may hold progress before the cast bar moves.
5. A spell may trigger one fake stumble:
   - progress pauses briefly
   - `GameManager.handleEnemyStumble(spell)` asks `AnimationManager` and `UIManager` to show feedback
6. When elapsed time reaches cast duration:
   - AI pauses
   - `onSpellReady(spell)` calls `GameManager.handleEnemySpellReady(spell)`
6. Enemy attack spell:
   - starts an incoming warning
   - enemy waits until warning resolution
7. Enemy defense spell:
   - plays a cast animation
   - grants opponent block
   - advances to next enemy spell
   - enemy `Probably Shield` is defensive only even though the player version is hybrid

## 9. Interrupt/Resistance Flow

1. Enemy attack completion calls `GameManager.beginIncomingAttack(spell)`.
2. Any active duel event is cleared so incoming warnings do not stack with duel event UI.
3. Incoming payload stores spell and scaled enemy damage.
4. `InterruptManager` starts a spell-specific warning duration:
   - Static Shock: shorter
   - I Cast Fireball: medium
   - Tiny Doom: slightly longer
   - Dramatic Meteor: longest
5. Incoming UI shows `INCOMING: spell name`, a resist instruction, and countdown bar.
6. The warning enters an urgent visual state for the final 0.5s.
7. The first incoming warning may show a one-time micro-hint.
8. If player completes the current line while warning is active:
   - `GameManager.handleLineComplete()` calls `resistIncomingAttack()`
   - warning clears
   - damage is reduced by `RESISTED_DAMAGE_MULTIPLIER`
   - `RESISTED!` feedback appears
   - `DamageManager` applies resisted damage and records damage taken/block absorption
   - `GameManager` records a successful resist
9. If warning expires:
   - full incoming damage is applied
   - direct hit feedback appears
   - player receives a short typing stun
10. Enemy-specific directional impact effects play on warning resolution.
11. The enemy advances to the next spell after resolution.

## 10. Duel Event Flow

`DuelEventManager` starts only after `GameManager.startDuel()` and stops on restart/end.

1. First event is scheduled from `BalanceConfig.duelEvents.firstDelayMs`.
2. Later events use `duelEvents.intervalMs`, with optional shorter post-spell opportunities.
3. Incoming warnings take priority; active duel events are cleared before an incoming warning appears.
4. Focus Surge:
   - player must finish the current line before timeout
   - success grants capped player guard through `GameManager.grantPlayerGuard()`
5. Volatile Rune:
   - player must type the configured number of correct characters without a mistake
   - success stores one pending spell damage boost on `GameManager`
   - mistake or timeout records a missed duel event
6. Counter Opening:
   - player must finish the current line before timeout
   - success calls `EnemyAI.delayCurrentCast()` and records a counter-hex
7. `UIManager` renders event name, instruction, and timer bar without covering active spell text.

## 11. Block/Damage Flow

Damage math is centralized through `Character.takeDamage()` and coordinated through `DamageManager`.

Normal incoming damage:

1. Raw damage is rounded.
2. Existing block absorbs as much as possible.
3. Block decreases by absorbed amount.
4. Remaining damage reduces HP.
5. Result object drives damage numbers, block feedback, status text, and match stats through `DamageManager`.

Backlash fizzle damage passes `ignoreBlock: true`, so it bypasses block.

Player incoming damage and backlash damage are recorded in `MatchStats.damageTaken` by `DamageManager`. Player block absorbed against incoming damage is recorded in `MatchStats.blocksAbsorbed`.

Player guard is the same numeric resource as `Character.block`. It can be earned by:

- completing a clean line
- reaching a combo milestone
- casting the player version of `Probably Shield`

These player guard gains are capped by `BalanceConfig.comboGuard.maxPlayerBlock`. Enemy block grants are not capped by the combo guard rule.

## 12. Onboarding And Hint Flow

1. `GameManager.restart()` enters `tutorial` state.
2. Tutorial overlay explains exact typing, spell completion, strikes/fizzle, incoming resistance, and shields.
3. Typing is disabled and enemy AI is stopped while the tutorial is visible.
4. Pressing Start Duel is wired by `UIManager` and calls `GameManager.startDuel()`, which hides the tutorial, enables typing, starts enemy AI, and starts the main loop.
5. The tutorial appears again only after restart.
6. `HintManager` shows one-time per-match hints for:
   - first mistake
   - first incoming attack
   - first shield spell
   - first fizzle
7. Hints auto-hide, can be disabled by the Hints settings toggle, and are placed above spell lines instead of covering active typing text.

## 13. Match Stats And Summary Flow

`MatchStats` resets on restart and records local counters during gameplay. `GameManager.endMatch(result)` asks `UIManager.showMatchResult(result, stats)` to render:

- result
- spells cast
- best combo
- correct characters
- mistakes
- fizzles
- damage dealt
- damage taken
- successful resists
- block absorbed
- duel events completed
- duel events missed
- counter-hexes

The summary is local to the current match and is not persisted.

## 14. Animation/Feedback Flow

`GameManager` decides what happened. `AnimationManager` decides how it looks.

Examples:

- correct key: current character pops
- mistake: active line shakes and strike marker slams
- clean line: capped guard gain text such as `Clean Line +3 Guard`
- combo milestone: floating combo text and capped `Combo Guard +5`
- duel event success/fail: compact event panel feedback and floating result text
- player spell cast: caster pose, spell effect, impact flash, damage number
- player spell reward: `CAST: spell name`, damage/guard gained, combo boost text, `BIG HIT`, or `DEVASTATING`
- enemy spell impact: directional effect from enemy side or player-side impact marker
- tension UI: `low-health`, `line-near-complete`, `spell-final-line`, and `incoming-brace` classes alter glow/pulse without hiding typing text
- fizzle: panel shake, fizzle effect, stun overlay
- incoming warning: arena tension styling and warning countdown
- final warning urgency: faster pulse in final 0.5s
- resisted attack: floating `RESISTED!`
- unresisted attack: direct hit flash, screen shake, player hit animation
- block: shield glow and blocked damage number
- audio hooks: emitted silently unless `audioDebug` is enabled, including `cleanLine`, `guardGain`, `bigHit`, `lowHealth`, `duelEventStart`, `duelEventSuccess`, `duelEventFail`, and `counterHex`

## 15. Known Constraints

- Must run directly from `index.html`.
- Must remain HTML/CSS/vanilla JavaScript.
- Must keep ordered script loading and `window.WizardDuel` namespace.
- Must not add a backend, multiplayer, build tooling, deckbuilding, or loadouts unless explicitly requested.
- Important gameplay text must remain readable and in English.
- Placeholder CSS/HTML visuals are acceptable.
- Reduced motion must preserve feedback while reducing strong shake/flash.

## 16. Known Limitations

- `GameManager.js` is larger than the preferred 300-line target and owns many responsibilities.
- `UIManager.js` is intentionally broad after the Phase 4B extraction because it owns DOM references plus rendering; split it further only when a clear seam appears.
- `AnimationManager.js` is also above the preferred size and owns many effect styles.
- Per-frame rendering currently calls `UIManager.renderFrame()`, which updates enemy casting, warning UI, FPS sampling, and optional debug readout.
- Opponent AI uses timers, not actual typed text.
- Duel events are local-only timing prompts, not multiplayer-ready authoritative events.
- Enemy spell effects are placeholder CSS/HTML effects.
- Audio hooks exist but no real audio playback exists.
- No automated test framework exists; verification is manual/browser-based.
- Tutorial and hints are simple local UI state; there is no persistent first-run memory.

## 17. Rules For Updating This File

Update `ARCHITECTURE.md` when:

- a file is added, removed, renamed, or given a new responsibility
- game state flow changes
- typing, fizzle, casting, enemy AI, interrupt, block, or damage behavior changes
- a loop, timer, or recurring update path is added or removed
- debug flags or performance instrumentation are added
- architecture constraints change

Keep descriptions concrete. Mention actual files, classes, methods, state names, and ownership boundaries.
