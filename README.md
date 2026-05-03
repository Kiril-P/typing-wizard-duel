# Typing Wizard Duel

A goofy real-time wizard duel where spells are cast by typing them exactly.

Play the live demo: https://typing-wizard-duel.vercel.app

## What It Is

Typing Wizard Duel is a static HTML/CSS/vanilla JavaScript prototype. The player duels a local CPU opponent by typing multi-line spell incantations under pressure. Accurate typing builds combo and guard. Mistakes add strikes, fizzle the spell flow, and create openings for the opponent.

The project is intentionally lightweight: no backend, no build step, no framework, no package manager, and no multiplayer yet.

## Current Features

- Exact multi-line spell typing
- Immediate correct-character and active-character highlighting
- Mistake lockout, strike markers, and fizzle stun
- Combo meter and combo-based guard gains
- Player and opponent HP bars
- Local CPU opponent with timed spell casting
- Incoming attack warnings
- Line-completion resistance windows
- Block/guard absorption
- Enemy-specific spell animations
- Duel Events that interrupt the rhythm with short skill checks
- Tutorial overlay and one-time micro-hints
- Reduced motion, FPS, debug, and hint toggles
- Post-match summary stats
- Static deployment on Vercel

## Duel Events

Duel Events add interactive moments between normal spell typing:

- **Focus Surge**: finish the current line before the surge fades to gain guard.
- **Volatile Rune**: type 10 correct characters without a mistake to boost the next spell.
- **Counter Opening**: finish the current line while the enemy is exposed to delay their cast.

These events start only after the duel begins and avoid stacking over incoming attack warnings.

## Running Locally

Open `index.html` directly in a browser:

```text
index.html
```

No install step is required.

## Project Structure

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── GameManager.js
│   ├── UIManager.js
│   ├── DamageManager.js
│   ├── DuelEventManager.js
│   ├── TypingEngine.js
│   ├── EnemyAI.js
│   ├── InterruptManager.js
│   ├── AnimationManager.js
│   ├── AudioManager.js
│   ├── BalanceConfig.js
│   ├── DebugConfig.js
│   ├── MatchStats.js
│   ├── Spell.js
│   ├── SpellBook.js
│   ├── Character.js
│   └── ComboManager.js
├── PRD.md
├── ARCHITECTURE.md
├── SPECS.md
└── DEBUG_AND_PERF.md
```

Scripts are loaded directly by `index.html` and share the `window.WizardDuel` namespace so the game works from `file://`.

## Deployment

The live demo is deployed as a static Vercel site:

https://typing-wizard-duel.vercel.app

Vercel settings:

- Framework preset: Other
- Build command: none
- Output directory: project root

## Development Notes

This prototype is focused on local single-player game feel. Future multiplayer, backend, deckbuilding, loadouts, accounts, matchmaking, saves, and progression are intentionally out of scope until the local duel feels strong.

Before making implementation changes, read:

- `PRD.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `SPECS.md`
- `DEBUG_AND_PERF.md`

## Good Next Steps

- Add a difficulty selector: Apprentice, Standard, Chaos
- Add more Duel Events
- Add clutch-resist bonuses for last-second line completions
- Add real audio using the existing audio hooks
- Continue reducing `GameManager.js` into focused managers
- Add better match summary grades for accuracy and pace
