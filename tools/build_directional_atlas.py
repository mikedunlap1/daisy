"""Build Daisy's padded 5-direction locomotion atlas from a 6x5 chroma sheet."""

import argparse
import json
from pathlib import Path

from PIL import Image


DIRECTIONS = ("n", "ne", "e", "se", "s")
FRAME_COUNT = 6
CELL_W = 192
CELL_H = 208
CONTENT_W = 164
CONTENT_H = 174
PAW_BASELINE = 192


def is_foreground(pixel):
    r, g, b, _ = pixel
    return not (g > 145 and g > r * 1.28 and g > b * 1.28)


def projection_intervals(image, axis, minimum_pixels=5):
    """Find occupied row/column bands; chroma gaps define the generated grid."""
    pixels = image.load()
    length = image.height if axis == "y" else image.width
    cross = image.width if axis == "y" else image.height
    occupied = []
    for primary in range(length):
        count = 0
        for secondary in range(cross):
            x, y = (secondary, primary) if axis == "y" else (primary, secondary)
            count += is_foreground(pixels[x, y])
        occupied.append(count > minimum_pixels)

    intervals, start = [], None
    for index, value in enumerate(occupied + [False]):
        if value and start is None:
            start = index
        elif not value and start is not None:
            intervals.append((start, index))
            start = None
    return intervals


def remove_green(image):
    result = image.copy()
    pixels = result.load()
    for y in range(result.height):
        for x in range(result.width):
            r, g, b, _ = pixels[x, y]
            dominance = g - max(r, b)
            if g > 150 and dominance > 45:
                alpha = max(0, min(255, 255 - (dominance - 45) * 5))
                pixels[x, y] = (r, min(g, max(r, b)), b, alpha)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("png", type=Path)
    parser.add_argument("json", type=Path)
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    row_bands = projection_intervals(source, "y")
    column_bands = projection_intervals(source, "x")
    if len(row_bands) != len(DIRECTIONS) or len(column_bands) != FRAME_COUNT:
        raise RuntimeError(f"Expected a 6x5 chroma grid; found {len(column_bands)}x{len(row_bands)}")
    atlas = Image.new("RGBA", (CELL_W * FRAME_COUNT, CELL_H * len(DIRECTIONS)))
    frames = {}

    for row, direction in enumerate(DIRECTIONS):
        for column in range(FRAME_COUNT):
            x0, x1 = column_bands[column]
            y0, y1 = row_bands[row]
            bbox = (x0, y0, x1, y1)
            daisy = remove_green(source.crop(bbox))
            scale = min(CONTENT_W / daisy.width, CONTENT_H / daisy.height)
            size = (max(1, round(daisy.width * scale)), max(1, round(daisy.height * scale)))
            daisy = daisy.resize(size, Image.Resampling.NEAREST)
            px = column * CELL_W + (CELL_W - daisy.width) // 2
            py = row * CELL_H + PAW_BASELINE - daisy.height
            atlas.alpha_composite(daisy, (px, py))

            name = f"run-{direction}-{column}.png"
            frames[name] = {
                "frame": {"x": column * CELL_W, "y": row * CELL_H, "w": CELL_W, "h": CELL_H},
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": CELL_W, "h": CELL_H},
                "sourceSize": {"w": CELL_W, "h": CELL_H},
                "pivot": {"x": 0.5, "y": PAW_BASELINE / CELL_H},
            }

    args.png.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(args.png)
    args.json.write_text(json.dumps({"frames": frames, "meta": {
        "app": "tools/build_directional_atlas.py",
        "image": args.png.name,
        "format": "RGBA8888",
        "size": {"w": atlas.width, "h": atlas.height},
        "scale": "1",
    }}, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
