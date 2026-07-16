# Daisy Sprite Sheet Layout

Current game file: `daisy-pet-sheet.png`  
Legacy atlas file: `daisy-sheet.png` / `daisy-atlas.json`  
Current frame size: `192 x 208`  
Current grid: `8 columns x 9 rows`

The current pet sheet is loaded as a Phaser spritesheet and mapped to the gameplay animation names in `BootScene.js`.

| Row | Animation | Frames | Notes |
| --- | --- | ---: | --- |
| 0 | `idle` | 0-5 | Neutral standing loop |
| 1 | `walk`, `run`, `sprint`, `return` | 0-7 | Temporary chase loop from the ChatGPT pet sprite |
| 3 | `shake` | 0-7 | Celebration/funny reaction |
| 4 | `pounce` | 0-5 | Temporary jump/catch animation, non-looping |
| 6 | `tired-flop` | 0-7 | Tired/resting expression |
| 7 | `zoomies-vibrate` | 0-7 | Active/zoomy expression |
| 8 | `sassy-idle` | 0-7 | Sassy idle expression |

For the next clean game-art pass, keep the gameplay animation names stable: `idle`, `walk`, `run`, `sprint`, `pounce`, `return`, `shake`, `tired-flop`, `zoomies-vibrate`, and `sassy-idle`.
