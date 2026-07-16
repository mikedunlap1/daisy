# Daisy Sprite Sheet Layout

Current game art is generated in `BootScene.js` as a canvas texture named `daisy`.
Legacy atlas file: `daisy-sheet.png` / `daisy-atlas.json`
Current generated frame size: `190 x 150`
Current generated grid: `8 columns x 10 rows`

Each frame is named in Phaser as `<animation>_<frame>.png`.

| Row | Animation | Frames | Notes |
| --- | --- | ---: | --- |
| 0 | `idle` | 0-5 | Neutral standing loop |
| 1 | `walk` | 0-7 | Low-speed movement |
| 2 | `run` | 0-7 | Normal chase |
| 3 | `sprint` | 0-7 | High-speed chase |
| 4 | `pounce` | 0-5 | Catch animation, non-looping |
| 5 | `return` | 0-7 | Daisy carrying the ball |
| 6 | `shake` | 0-7 | Celebration or future hit reaction |
| 7 | `tired-flop` | 0-7 | Tired/resting expression |
| 8 | `zoomies-vibrate` | 0-7 | Active/zoomy expression |
| 9 | `sassy-idle` | 0-7 | Sassy idle expression |

For the next clean game-art pass, keep the gameplay animation names stable: `idle`, `walk`, `run`, `sprint`, `pounce`, `return`, `shake`, `tired-flop`, `zoomies-vibrate`, and `sassy-idle`.
