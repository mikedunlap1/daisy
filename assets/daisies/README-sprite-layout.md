# Daisy directional sprite atlas

Runtime assets:

- `daisy-directional.png` / `daisy-directional.json`: production locomotion atlas.
- `daisy-directional-source.png`: generated 6 x 5 chroma source retained for reproducible normalization.
- `daisy-pet-sheet.png`: original character-art source, no longer loaded at runtime.
- `backups/2026-07-17-pre-directional-pass/`: source assets before the directional pass.

## Atlas layout

- Cell: `192 x 208` transparent pixels.
- Grid: 6 frames x 5 authored directions.
- Rows: `n`, `ne`, `e`, `se`, `s`.
- Frames: `run-{direction}-{0..5}.png`.
- Pivot: bottom-center at `(0.5, 192 / 208)`; every silhouette is padded and paw-aligned.
- `w`, `nw`, and `sw` mirror `e`, `ne`, and `se` in `DaisyController`.

Walk, run, and sprint share the six-frame authored cycle at different rates. Idle and short action/recovery poses select stable frames from the same clean directional atlas. A carried tennis ball is a separate Phaser sprite and is never part of a Daisy frame.

Regenerate the normalized atlas with the bundled Python/Pillow runtime:

```powershell
python tools/build_directional_atlas.py assets/daisies/daisy-directional-source.png assets/daisies/daisy-directional.png assets/daisies/daisy-directional.json
```

The builder detects chroma-separated row/column bands, removes the green matte, scales each complete silhouette inside a safe content box, and emits Phaser atlas source-size and pivot metadata.
