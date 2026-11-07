#!/usr/bin/env python3
"""Build the exact approved Dylan rabbit sheet into a stable 4x5 atlas."""
from io import BytesIO
from pathlib import Path
from PIL import Image
import hashlib
from urllib.request import urlopen

SOURCE_URL = "https://d2ol7oe51mr4n9.cloudfront.net/user_3K2x5W0tg7Jy3v9iclccNUZQ3l8/84d371e3-b49e-4286-8074-8731aae66299.png"
SOURCE_SHA256 = "57857b92450172111fed03e5ba410b323c02d9e59df3019002ebbaf3d252a02c"
raw = urlopen(SOURCE_URL, timeout=50).read()
assert hashlib.sha256(raw).hexdigest() == SOURCE_SHA256, "Source image did not match approved Dylan artwork"
source = Image.open(BytesIO(raw)).convert("RGBA")
assert source.size == (1448, 1086), f"Unexpected source dimensions: {source.size}"
columns = [(260, 490), (490, 710), (710, 930), (930, 1135)]
rows = [(0, 235), (235, 415), (415, 616), (616, 824), (824, 1086)]
cell = 96
atlas = Image.new("RGBA", (4 * cell, 5 * cell), (0, 0, 0, 0))
for row, (y0, y1) in enumerate(rows):
    for col, (x0, x1) in enumerate(columns):
        if row == 4 and col == 3:
            continue
        if row == 4:
            x0, x1 = [(260, 553), (553, 868), (868, 1135)][col]
        tile = source.crop((x0, y0, x1, y1))
        pix = tile.load()
        for yy in range(tile.height):
            for xx in range(tile.width):
                r, g, b, a = pix[xx, yy]
                if a < 55 or (r > 165 and g < 86 and b < 100 and r > g * 1.9):
                    pix[xx, yy] = (0, 0, 0, 0)
        bbox = tile.getchannel("A").getbbox()
        assert bbox is not None, f"Empty Dylan frame {row}, {col}"
        sprite = tile.crop(bbox)
        factor = min(86 / sprite.width, 90 / sprite.height)
        width, height = round(sprite.width * factor), round(sprite.height * factor)
        sprite = sprite.resize((width, height), Image.Resampling.LANCZOS)
        x = col * cell + (cell - width) // 2
        y = row * cell + cell - 4 - height
        atlas.alpha_composite(sprite, (x, y))
target = Path("assets/dylan-rabbit-approved-v125.png")
target.parent.mkdir(exist_ok=True, parents=True)
atlas.save(target, optimize=True)
assert atlas.size == (384, 480) and target.stat().st_size > 100_000
print("Approved Dylan rabbit sprite atlas ready:", target, target.stat().st_size, "bytes")
