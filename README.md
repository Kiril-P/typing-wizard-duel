# Typing Wizard Duel

![Typing Wizard Duel gameplay](docs/media/16-typing-wizard-duel.gif)

Type ridiculous incantations under pressure—three mistakes can turn a fireball into a fizzle.

**[▶ Play in browser](https://kpetrovski.me/play/typing-wizard-duel/)**

![Typing Wizard Duel: 01](docs/media/16-typing-wizard-duel-01.png)

![Typing Wizard Duel: fizzle](docs/media/16-typing-wizard-duel-fizzle.png)

## How to play

- Click **Start Duel**, then type each incantation exactly as shown. Lines advance automatically; do not press Enter between them.
- Finish a spell to cast it. Clean typing builds combo and guard.
- Wrong keys add strikes. **Three strikes** cause a fizzle, backlash damage, and a brief typing stun; spell progress stays.
- Finish a line during an incoming attack warning to resist it.

This is a local single-player duel against a CPU, with no online multiplayer or backend.

## Development

HTML, CSS, vanilla JavaScript; no build step.

Open `index.html` directly, or serve this directory:

```sh
python3 -m http.server 5175
```

[Development, verification, and deployment notes](DEVELOPMENT.md).
