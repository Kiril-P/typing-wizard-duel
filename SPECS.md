# SPECS.md

This is a lightweight behavior checklist for Typing Wizard Duel. Use it after every major change. Do not add a test framework unless explicitly requested.

## Typing Engine

- [ ] Typing is disabled while the tutorial overlay is visible.
- [ ] Correct characters advance progress.
- [ ] Correct characters highlight immediately.
- [ ] Wrong characters do not advance progress.
- [ ] Wrong characters trigger visible mistake feedback.
- [ ] Mistake lockout prevents rapid stacked punishments.
- [ ] Completing a line advances to the next line.
- [ ] Completing a mistake-free line emits clean-line behavior.
- [ ] Completing the final line casts the spell.
- [ ] Typing is ignored while the game is ended, resolving, or stunned.
- [ ] Active character remains readable.

## Strike/Fizzle System

- [ ] Strikes increment on mistakes.
- [ ] Strike markers visibly update.
- [ ] 3 strikes causes fizzle/stun.
- [ ] Fizzle does not restart the entire spell.
- [ ] Fizzle preserves the current spell and line.
- [ ] Fizzle applies backlash damage.
- [ ] Fizzle resets combo.
- [ ] Fizzle resets strikes after the stun.
- [ ] Typing resumes after stun.

## Combo System

- [ ] Correct typing increases combo.
- [ ] Mistakes reset or heavily reduce combo.
- [ ] Combo meter updates visibly.
- [ ] Combo milestone feedback still appears when implemented.
- [ ] Combo milestones grant capped player guard.
- [ ] Spell completion uses combo feedback/damage scaling if implemented.

## Combo Guard System

- [ ] Clean line completion grants player guard.
- [ ] Combo milestone completion grants player guard.
- [ ] Player guard gains use the same `Character.block` resource as shield block.
- [ ] Player guard is capped at the configured maximum.
- [ ] Guard gain feedback shows `Clean Line +X Guard`, `Combo Guard +X`, or `Guard Full`.
- [ ] Mistakes do not directly remove guard.

## Player Spell Casting

- [ ] Current spell name is visible.
- [ ] All spell lines are visible.
- [ ] Completed characters, current character, and remaining characters are visually distinct.
- [ ] Completing an attack spell damages the opponent.
- [ ] Completing a defense or guard spell grants block/guard.
- [ ] Hybrid player spells can deal damage and grant guard in the same cast.
- [ ] Probably Shield deals light opponent damage and grants player guard.
- [ ] Spell completion animation feels bigger than normal typing feedback.
- [ ] Spell reward feedback clearly shows what was cast.
- [ ] Attack reward feedback shows damage or blocked result.
- [ ] Defense reward feedback shows block gained.
- [ ] Hybrid reward feedback shows both damage and guard gained.
- [ ] High-impact spells can show `BIG HIT` or `DEVASTATING`.
- [ ] Combo boost feedback appears when combo modifies spell payoff.
- [ ] Player advances to the next fixed-sequence spell after cast resolution.

## Enemy AI

- [ ] Enemy AI does not start while the tutorial is visible.
- [ ] Enemy AI starts after Start Duel is pressed.
- [ ] The first enemy attack is delayed enough that the opening is understandable.
- [ ] Enemy progresses toward spell cast.
- [ ] Enemy current spell name is visible.
- [ ] Enemy cast progress is visible.
- [ ] Enemy casts after progress completes.
- [ ] Enemy continues through its spell sequence.
- [ ] Enemy attack spells can damage the player.
- [ ] Enemy defense spells can grant opponent block.
- [ ] Enemy Probably Shield stays defensive only and does not create incoming damage.
- [ ] Enemy may pause briefly for a readable fake stumble.
- [ ] Enemy stumble feedback does not spam.
- [ ] Enemy does not keep casting after match end.
- [ ] Counter Opening success can briefly delay enemy casting.

## Duel Events

- [ ] Duel events do not start while tutorial is visible.
- [ ] Duel events start only after Start Duel.
- [ ] Duel events stop after match end.
- [ ] Duel event panel does not cover active typing text.
- [ ] Duel events do not stack on top of incoming attack warnings.
- [ ] Focus Surge asks the player to finish the current line.
- [ ] Focus Surge success grants capped guard.
- [ ] Focus Surge timeout shows a readable miss message without damage.
- [ ] Volatile Rune asks for clean correct characters.
- [ ] Volatile Rune success grants a one-time next-cast damage boost.
- [ ] Volatile Rune fails on mistake or timeout without extra strikes/backlash.
- [ ] Counter Opening asks the player to finish the current line.
- [ ] Counter Opening success shows `COUNTER-HEX` and delays enemy casting.
- [ ] Counter Opening timeout has no direct penalty.
- [ ] Duel event success/fail feedback is visible and concise.

## Interrupt System

- [ ] Enemy attack creates an incoming warning.
- [ ] Warning lasts long enough to be readable, with spell-specific variance where intended.
- [ ] Warning shows `INCOMING: spell name`.
- [ ] Warning shows a countdown/progress bar.
- [ ] Warning becomes more urgent during the final 0.5 seconds.
- [ ] Warning tells the player to finish the current line to resist.
- [ ] Completing the current player line during warning resists.
- [ ] Player only needs to complete the current line, not the whole spell.
- [ ] Resisted attacks deal reduced damage.
- [ ] Unresisted attacks deal full damage.
- [ ] Unresisted attacks may briefly stun player.
- [ ] The incoming warning clears after either resistance or expiration.

## Block System

- [ ] Block absorbs incoming damage first.
- [ ] Block decreases by absorbed amount.
- [ ] Remaining damage affects HP.
- [ ] Block UI updates correctly.
- [ ] Damage numbers distinguish blocked damage from HP damage.
- [ ] Backlash damage can bypass block when configured.

## Enemy Spell Readability

- [ ] Static Shock has a quick zap and delayed stronger lightning hit.
- [ ] I Cast Fireball visibly travels from enemy side to player side.
- [ ] Tiny Doom shows a small harmless object before a larger explosion.
- [ ] Dramatic Meteor shows a marker/meteor impact on player side.
- [ ] Enemy Probably Shield reads as defense and not incoming damage.
- [ ] Enemy attack direction and target are readable.

## Health And Match End

- [ ] Player HP text and bar match actual current/max HP.
- [ ] Opponent HP text and bar match actual current/max HP.
- [ ] Health bars do not display full unless the character is actually at full HP.
- [ ] Opponent at 0 HP triggers win.
- [ ] Player at 0 HP triggers loss.
- [ ] Game should not continue normal gameplay after end state.
- [ ] Match result overlay includes a real stat summary.
- [ ] Summary includes result, spells cast, best combo, mistakes, fizzles, damage dealt, damage taken, resists, and block absorbed.
- [ ] Restart clears end state and restores a fresh match.
- [ ] Restart resets stats and shows onboarding again.

## Onboarding And Hints

- [ ] Tutorial overlay appears after restart before the duel starts.
- [ ] Tutorial explains exact typing, casting all lines, wrong-key strikes, 3-strike fizzle, incoming resistance, and shields.
- [ ] Tutorial has a clear Start Duel button.
- [ ] Tutorial text is concise, readable, and in English.
- [ ] Tutorial does not start enemy AI pressure before dismissal.
- [ ] One-time hint appears on first mistake.
- [ ] One-time hint appears on first incoming attack.
- [ ] One-time hint appears on first shield spell.
- [ ] One-time hint appears on first fizzle.
- [ ] Each hint appears only once per match.
- [ ] Hints disappear automatically.
- [ ] Hints do not cover active typing text.
- [ ] Hints can be disabled through the settings/debug panel.

## Match Stats

- [ ] Correct characters are tracked.
- [ ] Registered wrong key presses are tracked.
- [ ] Fizzles are tracked.
- [ ] Player spells cast are tracked.
- [ ] HP damage dealt is tracked.
- [ ] HP damage taken is tracked.
- [ ] Successful resists are tracked.
- [ ] Player block absorbed is tracked.
- [ ] Duel events completed are tracked.
- [ ] Duel events missed are tracked.
- [ ] Counter-hexes are tracked.
- [ ] Best combo is tracked.
- [ ] Stats reset on restart.

## Readability And Feel

- [ ] Active typing text remains readable during animations.
- [ ] Important UI text is in English.
- [ ] Correct typing feels immediate.
- [ ] Mistakes feel obvious but not unfair.
- [ ] Spell completion feels big.
- [ ] Near-complete lines, final lines, incoming warnings, and low HP create tension without hiding typing text.
- [ ] Reduced motion keeps tension feedback readable while reducing pulse/shake intensity.
- [ ] Incoming attacks are readable and not instant.
- [ ] Full, resisted, blocked, and fizzle damage feedback are visually distinct.
- [ ] Goofy arcane tone is preserved.

## Accessibility And Debug

- [ ] Reduced motion toggle reduces strong shake/flash.
- [ ] FPS display can be toggled without interfering with gameplay.
- [ ] Debug state display can be toggled without covering active typing text.
- [ ] Hints can be toggled without affecting core gameplay.
- [ ] Debug flags are centralized.

## Audio Hooks

- [ ] Audio hooks exist for common gameplay events.
- [ ] Audio hooks include clean line, guard gain, big hit, and low health events.
- [ ] Audio hooks include duel event start, success, fail, and counter-hex events.
- [ ] Audio hooks do not require audio files.
- [ ] Audio hooks do not log unless audio debug is enabled.

## Static Runtime

- [ ] `index.html` opens directly in a browser.
- [ ] No backend/server is required.
- [ ] No npm, Vite, React, TypeScript, or build step is required.
- [ ] No online multiplayer, deckbuilding, or loadouts are introduced.
