# Daisy Sprite Sheet Layout

Current source sprite: `daisy-pet-sheet.png`
Legacy atlas file: `daisy-sheet.png` / `daisy-atlas.json`
Source frame size: `192 x 208`
Source grid: `8 columns x 9 rows`

`BootScene.js` loads the pet sheet, copies selected frames into a cleaned runtime canvas texture named `daisy`, and names each runtime frame as `<animation>_<frame>.png`.

| Row | Animation | Frames | Notes |
| --- | --- | ---: | --- |
| 0 | `idle` | 0-5 | Neutral standing loop |
| 1 | `walk`, `run`, `sprint` | 0-7 | Chase loop, with baked-in pet tennis ball cleared from the runtime copy |
| 3 | `shake` | 0-7 | Celebration/funny reaction |
| 4 | `pounce` | 0-5 | Jump/catch animation, non-looping |
| 5 | `tired-flop` | 0-7 | Tired/resting expression |
| 7 | `zoomies-vibrate` | 0-7 | Active/zoomy expression |
| 8 | `return`, `sassy-idle` | 0-7 | Ball/rope-adjacent pet states reused for now |

For the next clean game-art pass, keep the gameplay animation names stable: `idle`, `walk`, `run`, `sprint`, `pounce`, `return`, `shake`, `tired-flop`, `zoomies-vibrate`, and `sassy-idle`.
