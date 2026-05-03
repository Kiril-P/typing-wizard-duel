# AGENTS.md

## Project Overview

Typing Wizard Duel is a browser-based real-time typing wizard duel game.

The game is built with:

- HTML
- CSS
- vanilla JavaScript

The prototype must run directly by opening `index.html` in a browser.

Do not add:

- online multiplayer
- backend or server code
- npm, Vite, React, TypeScript, bundlers, or build tooling
- deckbuilding
- spell loadouts
- accounts, matchmaking, saves, or progression systems

The game should remain a goofy, competitive, readable arcane typing duel where typing feel is the primary product quality.

---

## Current Prototype State

The project currently contains a Phase 2 local simulated duel prototype.

Working systems include:

- fixed spell sequence
- exact multi-line typing
- correct character highlights
- active character highlight
- combo meter
- strike markers
- mistake lockout
- 3-strike fizzle/stun instead of full spell restart
- backlash damage
- player/opponent HP bars
- spell charge/phase display
- cast animations
- damage numbers
- defense block display
- opponent AI spell cast progress
- timed enemy spell casts
- incoming attack warnings
- 1.5s resistance window
- line-completion resistance
- reduced resisted damage
- full unresisted damage
- short impact stun
- block consumption
- win/loss states

---

## Development Process Rules

- Before making code changes, read `PRD.md`, `AGENTS.md`, and `ARCHITECTURE.md` if they exist.
- `PRD.md` must live in the project root for implementation work. If it is missing, stop and ask for it to be copied into the workspace instead of relying on an external copy.
- If a referenced source document is outside the workspace, read it before editing and create/update the workspace document only when asked.
- For significant implementation changes, update `ARCHITECTURE.md` before finishing.
- For behavior changes, update `SPECS.md` before finishing.
- For debug, profiling, flags, loops, or performance-sensitive changes, update `DEBUG_AND_PERF.md` before finishing.
- Do not rewrite working systems unless the user explicitly asks for that or the current design blocks the requested change.
- Preserve the current aesthetic and satisfying typing feel unless explicitly asked to change it.
- Prefer incremental changes over large rewrites.
- Keep changes tightly scoped to the requested phase or task.
- Do not use third-party libraries for core gameplay unless explicitly requested.
- Do not introduce a build step. Scripts are loaded from `index.html` and share the existing `window.WizardDuel` namespace.
- Every implementation report must include:
  - files changed
  - systems changed
  - known bugs or limitations
  - suggested next step
  - recommended `AGENTS.md` updates based on lessons learned

---

## File Size And Modularity Rules

- Keep files focused and modular.
- Avoid creating files larger than roughly 300 lines when practical.
- If a file grows too large, suggest or perform a safe refactor.
- One file should have one main responsibility.
- Avoid duplicating game state across multiple classes.
- Avoid hidden global state except for the existing `window.WizardDuel` namespace pattern.
- Prefer new small manager classes over expanding `GameManager.js` when a feature has a clear isolated responsibility.
- `GameManager.js` may coordinate systems, but should not become the permanent home for every subsystem.
- Keep constants easy to find and tune.
- Keep DOM ownership clear. A class should not mutate UI it does not conceptually own unless coordinated by `GameManager`.

---

## UI And Feel Rules

- Typing text readability is sacred.
- Do not let animations obscure active typing text.
- Correct typing must feel immediate.
- Mistakes must feel obvious but not unfair.
- Spell completion must feel big.
- Preserve the goofy arcane tone.
- Keep important gameplay UI text in English.
- Avoid unreadable fantasy glyphs for required gameplay text.
- Preserve visible game state: HP, block, combo, strikes, current spell, active line, player progress, enemy progress, and incoming warnings.
- Do not make failure feedback silent or subtle.
- Do not make enemy attacks instant or unreadable.

---

## Debug And Feature Flag Rules

- New experimental features should be toggleable where practical.
- Add debug flags in one central place.
- Do not permanently hide debug values inside unrelated files.
- Debug UI should not interfere with normal gameplay.
- Prefer debug values that help verify actual game state: FPS, enemy timers, interrupt timer, current spell, line index, character index, combo, strikes, block, and game state.
- Keep debug UI optional and off by default unless the user asks otherwise.

---

## Performance Rules

- Avoid expensive per-frame DOM rewrites.
- Prefer updating only changed UI elements, especially inside animation loops.
- Avoid unnecessary intervals/timeouts.
- Keep animation loops simple.
- If adding recurring loops, document what starts and stops them.
- Stop loops when the match ends or the game restarts.
- Avoid long synchronous work during keypress handling.
- Keep the prototype performant and responsive before adding visual complexity.

---

## Recommended File Structure

```text
typing-wizard-duel/
├── index.html
├── AGENTS.md
├── PRD.md
├── ARCHITECTURE.md
├── SPECS.md
├── DEBUG_AND_PERF.md
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── GameManager.js
│   ├── TypingEngine.js
│   ├── Spell.js
│   ├── SpellBook.js
│   ├── Character.js
│   ├── ComboManager.js
│   ├── InterruptManager.js
│   ├── AnimationManager.js
│   └── EnemyAI.js
└── Assets/
```

It is acceptable for `Assets/` to be absent while placeholder CSS/HTML visuals are used.

---

## Roadmap Guardrails

### Phase 1: Single-Player Typing Prototype

Completed locally.

### Phase 2: Local Simulated Duel

Completed locally.

### Phase 3: Polish

Appropriate next work:

- stronger enemy-specific spell direction and impact readability
- better warning and resistance feedback
- AI variance and readable fake mistakes
- audio-ready hooks
- accessibility/readability options
- performance-oriented UI updates

Do not add online multiplayer in Phase 3.

### Phase 4: Online Multiplayer

Do only after local gameplay feels good and only when explicitly requested.

---

## Verification Rules

After meaningful changes, verify:

- `index.html` opens directly in a browser.
- No console/runtime errors are introduced.
- Correct typing advances progress.
- Wrong typing does not advance progress.
- Mistake lockout prevents rapid stacked punishments.
- 3 strikes fizzle/stun without restarting the entire spell.
- Spell completion still casts.
- Enemy AI still progresses and casts.
- Incoming warnings still appear and expire.
- Completing the current line during a warning resists.
- Block absorbs incoming damage.
- HP bars update from actual HP values.
- Win and loss states stop normal gameplay.

If full browser verification is not possible, report exactly what was and was not verified.
