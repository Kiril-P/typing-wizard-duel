# PRD — Typing Wizard Duel

## 1. Product Summary

Typing Wizard Duel is a real-time 1v1 typing combat game where two goofy arcane duelists cast spells by typing multi-line incantations exactly. Players race to complete spells, build combos through accurate typing, survive incoming attacks, and interrupt their opponent through well-timed casts.

The game should feel competitive, chaotic, funny, and satisfying. The main emotional goals are:

- Typing correctly feels heavy, precise, and rewarding.
- Mistakes feel immediately punishing.
- Finishing a spell feels extremely satisfying.
- Spell animations feel exaggerated, magical, and goofy.
- Matches feel tense and fast, lasting about 2–3 minutes.

The first prototype should not include online multiplayer. Build the local single-player / simulated duel experience first.

---

## 2. Core Fantasy

Two ridiculous wizards are locked in an arcane duel. Instead of calmly casting elegant spells, they frantically type unstable incantations. Every completed spell releases a dramatic magical effect. Sometimes the spell looks pathetic at first, then turns into something absurdly powerful.

The tone is:

- Arcane
- Competitive
- Lighthearted
- Goofy
- Slightly chaotic
- Visually exaggerated

The world should feel magical but not too serious.

---

## 3. Target Experience

A player should feel:

1. "I need to type this perfectly."
2. "I am under pressure."
3. "Mistakes hurt."
4. "My combo is building and I do not want to lose it."
5. "I am almost done with the spell."
6. "I finished it — huge payoff."
7. "Now the opponent is under pressure."

The game should create a back-and-forth rhythm of:

- typing pressure
- spell buildup
- incoming attack warning
- interruption threat
- spell payoff
- recovery
- next spell

---

## 4. Target Match Length

Each match should last approximately 2–3 minutes.

Prototype balancing can be adjusted through:

- player max HP
- opponent max HP
- spell damage
- spell line count
- AI typing speed
- mistake/backlash damage
- interrupt punishment

---

## 5. Prototype Scope

### Phase 1: Single-Player Typing Prototype

Build first:

- player typing system
- current spell display
- multi-line spell progression
- exact input matching
- correct character feedback
- mistake feedback
- 3-strike failure
- combo meter
- HP bars
- spell completion
- damage application
- simple dummy opponent

### Phase 2: Local Simulated Duel

Add next:

- opponent spell progress
- simple enemy AI typing/casting behavior
- incoming attack warnings
- basic interrupt logic
- match win/loss state

### Phase 3: Polish

Add:

- stronger animation feedback
- spell phase buildup
- better screen shake / visual impact
- improved combo feedback
- better pacing and balance

### Phase 4: Online Multiplayer

Do only after the local prototype feels good.

Potential future technologies:

- WebSockets
- Socket.io
- Firebase/Supabase realtime
- server-authoritative match state

Do not implement online multiplayer in the initial version.

---

## 6. Core Gameplay Loop

1. The player receives the current spell from a fixed spell sequence.
2. The spell contains 4–8 lines of text.
3. The player types the current line exactly.
4. Each correct character advances progress and gives immediate feedback.
5. Each incorrect character adds a strike and gives harsh feedback.
6. At 3 strikes:
   - the spell fails
   - combo resets
   - the player takes small backlash damage
   - the spell restarts from line 1
7. Completing a line advances to the next line.
8. Completing all lines casts the spell.
9. Casting triggers a large spell animation.
10. Damage, block, or interruption effects are applied.
11. The next spell appears.
12. First side to reduce the opponent to 0 HP wins.

---

## 7. Typing System Requirements

### Exact Typing

The player must type the spell text exactly.

The system should track:

- current spell
- current line index
- current character index
- typed progress
- strikes
- combo
- spell phase progress

### Correct Input

When the player presses the correct key:

- highlight the character as correct
- advance the character index
- increase combo
- slightly pulse the character or line
- add spell energy/build-up
- optionally play a small positive feedback effect

Correct typing must feel tactile and satisfying.

### Incorrect Input

When the player presses the wrong key:

- do not advance the character index
- add 1 strike
- flash the current line red
- shake the current line or spell panel
- reduce/reset combo
- play negative feedback
- briefly show the wrong input feedback
- make the mistake feel immediate and punishing

### 3-Strike Failure

Each spell allows 3 strikes.

When 3 strikes are reached:

- fail the spell
- reset spell progress to line 1
- reset strikes
- reset combo
- apply small backlash damage to the caster
- trigger a comedic spell failure animation
- example: spell fizzles, explodes in the caster’s face, or drops a tiny useless puff

The player should clearly understand why the spell failed.

---

## 8. Combo System

The combo system rewards accurate typing.

### Combo Gain

Combo increases when the player types correct characters.

Potential combo rules:

- +1 combo per correct character
- extra pulse every 10 combo
- bigger visual milestone at 25 combo
- major visual milestone at 50 combo

### Combo Loss

Mistakes should heavily punish combo.

Prototype rule:

- one mistake resets combo to 0

Alternative future rule:

- one mistake reduces combo by 50%

For the first prototype, use the harsher reset rule unless it feels too frustrating.

### Combo Rewards

Higher combo can increase:

- spell damage
- spell visual intensity
- casting animation size
- screen shake
- aura around the spell text
- final impact effect

Typing perfectly should feel better than simply typing quickly.

---

## 9. Spell Structure

Each spell consists of 4–8 lines.

Each line should be short enough to be readable under pressure.

Example line length target:

- minimum: 12 characters
- maximum: 45 characters
- avoid extremely long lines in the first prototype

### Spell Phases

Each spell has phases tied to line completion:

- Phase 1: Ignition
- Phase 2: Charge
- Phase 3: Unstable buildup
- Final Phase: Release

As the player completes lines:

- the spell visual effect grows
- the spell panel becomes more intense
- magical particles increase
- the character or arena reacts
- tension increases near the final line

The final line should feel especially tense.

---

## 10. Starting Spell List

Use a fixed spell sequence for the prototype. Do not implement spell choice, decks, or loadouts yet.

### Spell 1 — I Cast Fireball

Type: Attack  
Difficulty: Medium  
Effect: Deals damage to opponent.

Visual joke:
The wizard appears to drink a bottle labeled "Fireball" before accidentally breathing actual flames.

Example lines:
- I hereby cast the ancient flame.
- Wait, why is it cinnamon flavored?
- Ignite the bottle of questionable power.
- Please explode in the correct direction.

### Spell 2 — Probably Shield

Type: Defense  
Difficulty: Easy  
Effect: Grants block or reduces incoming damage.

Visual joke:
A sad cardboard shield appears, wobbles, and somehow blocks a huge attack.

Example lines:
- Raise the barrier of mild confidence.
- This shield is probably certified.
- Stand behind the cardboard of destiny.
- Nothing bad can happen now.

### Spell 3 — Tiny Doom

Type: Attack  
Difficulty: Medium-Hard  
Effect: Deals high damage after a short delay.

Visual joke:
A tiny harmless blob appears, squeaks, then causes a ridiculous explosion.

Example lines:
- Summon the smallest doom imaginable.
- Do not underestimate the tiny one.
- Let the little guy finish charging.
- Unleash unreasonable consequences.

### Spell 4 — Static Shock

Type: Quick Attack  
Difficulty: Easy-Medium  
Effect: Deals low or medium damage quickly.

Visual joke:
A weak static zap happens first, then a delayed lightning strike hits way harder than expected.

Example lines:
- Rub the socks of thunder together.
- Gather the awkward little sparks.
- Point dramatically at the enemy.
- Zap now, apologize later.

### Spell 5 — Dramatic Meteor

Type: Heavy Attack  
Difficulty: Hard  
Effect: Deals large damage.

Visual joke:
The wizard throws a pebble upward. After a pause, an enormous meteor crashes down.

Example lines:
- Request one dramatic rock from space.
- Make it flashy but legally safe.
- Aim somewhere near the opponent.
- Begin the extremely slow descent.
- Pretend this was under control.
- Deliver the final bonk from orbit.

---

## 11. Damage and Health

Both sides have:

- max HP
- current HP
- optional block
- status display

Prototype values:

- Player HP: 100
- Opponent HP: 100
- Backlash damage on spell failure: 5
- Quick attack damage: 8–12
- Medium attack damage: 15–20
- Heavy attack damage: 25–35
- Defense spell block: 15–25

Health bars must update based on current HP and maximum HP.

Health bars must not visually start at 100% unless the character is actually at full health.

---

## 12. Interrupt System

The interrupt system should create real-time pressure without feeling unfair.

### Design Goal

Interrupts should feel like fight stages. A player should see danger coming and have a chance to respond.

Avoid instant, unreadable punishment.

### Prototype Interrupt Rule

When a player completes an attack spell:

1. The opponent receives an incoming attack warning.
2. The warning lasts approximately 1.5 seconds.
3. During the warning, the opponent can reduce the impact by completing their current line.
4. If the opponent completes their current line in time:
   - reduce incoming damage
   - prevent spell progress loss
   - show a successful "brace" or "counter-focus" feedback
5. If the opponent does not complete the line in time:
   - apply full damage
   - reset the opponent’s current spell progress
   - show a strong interruption animation

### Why This Works

This creates:
- readable pressure
- reaction windows
- clutch moments
- back-and-forth pacing
- less frustration than instant interruption

---

## 13. Real-Time Pressure Systems

The game should feel active even while typing.

Use:

- incoming attack warnings
- spell charge meters
- combo decay after long inactivity
- screen shake near incoming impact
- visual instability when near 3 strikes
- intensified music/visuals near low HP
- spell buildup particles

Optional future ideas:

- sudden "panic line" during powerful enemy spells
- clash event when both players finish spells nearly simultaneously
- overtime mode if match lasts too long

---

## 14. Enemy AI for Prototype

Before multiplayer, create a simple AI opponent.

The AI should:

- progress through its own spell sequence
- cast spells over time
- occasionally fail or slow down
- trigger incoming attack warnings
- deal damage to the player
- be beatable within 2–3 minutes

Simple implementation:

- AI has a spell timer.
- Each spell has a base completion duration.
- AI progress fills over time.
- AI can randomly make mistakes.
- When AI completes the spell, it casts against the player.

The AI does not need to type actual text in the first version, but its progress should be visible.

---

## 15. UI Requirements

The UI should clearly show:

- player name
- opponent name
- player HP
- opponent HP
- optional block
- current spell name
- current spell lines
- current active line
- typed characters
- remaining characters
- strike markers
- combo meter
- spell phase or charge progress
- incoming attack warning
- match result

Important UI text must be in English.

Do not use unreadable fantasy glyphs for important gameplay UI.

---

## 16. Visual Style

Style direction:

- stylized 2D
- cartoon fantasy
- arcane duel arena
- magical particles
- exaggerated spell effects
- clean readable UI
- goofy character reactions
- polished indie-game look

Color palette:

- deep purples
- magical blues
- gold accents
- red flashes for mistakes
- bright impact colors for spell completion

The UI should remain readable even during chaotic animations.

---

## 17. Animation Requirements

Animations should support the typing and spellcasting feel.

### Correct Typing

- small character pulse
- soft glow
- subtle sound-ready visual cue
- spell charge increases

### Mistake

- red flash
- line shake
- strike marker slam
- combo break effect
- small explosion/fizzle

### Spell Completion

- brief anticipation
- character cast pose
- large effect release
- screen shake
- impact flash
- damage number
- opponent reaction

### Spell Failure

- unstable buildup
- fizzle
- backlash pop
- comedic failure reaction

### Incoming Attack

- warning banner
- countdown bar
- screen tension
- impact effect if not resisted

---

## 18. Audio Direction

Audio is optional for the first prototype, but the game should be designed so audio can be added later.

Future audio cues:

- correct key tap
- combo milestone
- mistake buzz
- strike slam
- spell charge hum
- spell release explosion
- shield block
- low HP warning

---

## 19. Accessibility and Readability

Typing text must be highly readable.

Requirements:

- clear font
- strong contrast
- active character clearly highlighted
- completed characters visibly distinct
- mistake feedback obvious
- avoid overly decorative fonts for spell text
- allow enough spacing between lines

Future accessibility options:

- reduce screen shake
- high contrast mode
- larger text size
- colorblind-safe indicators
- sound volume controls

---

## 20. Out of Scope for First Prototype

Do not implement these yet:

- online multiplayer
- matchmaking
- accounts
- deckbuilding
- spell loadouts
- progression systems
- unlockable characters
- complex AI behavior
- asset generation pipeline
- save system
- mobile support

---

## 21. Success Criteria for Phase 1

Phase 1 is complete when:

- index.html runs locally in a browser
- the player can type a multi-line spell
- correct characters highlight immediately
- mistakes add strikes immediately
- 3 strikes fail and restart the spell
- failure causes small backlash damage
- combo increases on correct input
- combo resets or drops on mistake
- completing all lines casts a spell
- spell completion damages the opponent
- HP bars update correctly
- the experience already feels responsive and satisfying

---

## 22. Success Criteria for Phase 2

Phase 2 is complete when:

- opponent AI progresses through spells
- opponent casts attacks
- incoming attack warnings appear
- player can partially resist by completing current line during warning
- failed resistance causes full damage and progress loss
- match can end in win or loss
- match length is roughly 2–3 minutes

---

## 23. Future Expansion Ideas

After the core prototype works:

- online multiplayer
- ranked duels
- spell loadouts
- deckbuilding
- character classes
- cosmetic spell skins
- daily typing challenges
- boss fights
- tournaments
- replay system
- typing accuracy stats
- words-per-minute tracking
- spell clash mechanic
- cooperative mode
