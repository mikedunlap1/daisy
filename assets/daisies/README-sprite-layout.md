# Daisy Sprite Sheet Layout

File: `daisy-sheet.png`  
Atlas: `daisy-atlas.json`  
Frame size: `160 x 128`  
Grid: `8 columns x 10 rows`

Each frame is named in the atlas as `<animation>_<frame>.png`.

| Row | Animation | Frames | Notes |
| --- | --- | ---: | --- |
| 0 | `idle` | 0-5 | Neutral standing loop |
| 1 | `walk` | 0-7 | Low-speed movement |
| 2 | `run` | 0-7 | Normal chase |
| 3 | `sprint` | 0-7 | High-speed chase |
| 4 | `pounce` | 0-5 | Catch animation, non-looping |
| 5 | `return` | 0-7 | Daisy carrying the ball |
| 6 | `shake` | 0-7 | Celebration or future hit reaction |
| 7 | `tired-flop` | 0-7 | Tired Daisy variant idle |
| 8 | `zoomies-vibrate` | 0-7 | Zoomies Daisy variant idle |
| 9 | `sassy-idle` | 0-7 | Sassy Daisy variant idle |

To redraw Daisy later, keep the same frame size and atlas frame names. The game logic only calls animation names, so the art can be replaced without touching code.
