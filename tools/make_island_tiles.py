#!/usr/bin/env python3
"""Draw original Island of Models tiles without external art assets."""
from pathlib import Path

from PIL import Image, ImageDraw

TILE = 16
image = Image.new('RGBA', (15 * TILE, 6 * TILE))
draw = ImageDraw.Draw(image)


def stamp(tile_x, tile_y):
    offset_x, offset_y = tile_x * TILE, tile_y * TILE

    def rect(x, y, w, h, colour):
        left, top = offset_x + x, offset_y + y
        draw.rectangle((left, top, left + w - 1, top + h - 1), fill='#' + colour)

    return rect


# Stone workshop floor, worn lane, beach, shallow bay, planks and marsh.
for i, (base, edge, grain) in enumerate((('7a8877', '646e64', '9da38d'), ('a7a386', '909078', 'c9bb92'),
                                          ('b4a07c', 'a49170', 'c9b28e'))):
    r = stamp(i, 0)
    r(0, 0, 16, 16, base)
    r(0, 15, 16, 1, edge)
    r(15, 1, 1, 14, edge)
    r(1, 0, 12, 1, grain)
    r(1 + 2 * i, 7, 4, 1, grain)
    r(8, 11, 2, 1, edge)
for i, (base, swell) in enumerate((('487b83', '75a5a4'), ('4b8387', '82b1a8'), ('5e8c8d', '91b5a9'))):
    r = stamp(3 + i, 0)
    r(0, 0, 16, 16, base)
    for x, y, w in ((1, 3, 5), (8, 7, 6), (5, 11, 7), (2, 14, 5)):
        r((x + 2 * i) % (16 - w), y, w, 1, swell)
    r(2 + i, 8, 3, 1, '426f77')

r = stamp(6, 0)
r(0, 0, 16, 16, '796452')
for y in (0, 4, 8, 12):
    r(0, y, 16, 3, 'ad9170')
    r(0, y, 16, 1, 'c2a681')
    r((y + 2) % 10, y + 1, 4, 1, '9b8065')

for i, base in enumerate(('7d8260', '82916c')):
    r = stamp(7 + i, 0)
    r(0, 0, 16, 16, base)
    r(9 - 2 * i, 3, 4, 1, 'a1a575')
    r(3 + 4 * i, 8, 1, 4, '758151')
    r(2 + 4 * i, 9, 3, 1, '9ca477')
    r(9, 13, 4, 1, 'a4a66e')

# A painted workshop panel with three miniature features and an inset bay.
r = stamp(0, 1)
r(2, 5, 92, 54, '635a50')
r(4, 7, 88, 50, '95785e')
r(7, 10, 82, 44, 'bdbea0')
r(10, 13, 76, 37, '678d8a')
r(22, 23, 49, 18, 'bca980')
r(26, 18, 28, 6, 'bca980')
r(34, 36, 22, 5, '85a27d')
r(52, 30, 15, 9, '91a37a')
r(30, 23, 26, 2, 'd3bb8c')
r(43, 22, 3, 17, 'd3bb8c')
for x, y in ((30, 21), (54, 28), (44, 36)):
    r(x, y, 4, 4, '806874')
for x, y in ((15, 18), (69, 19), (74, 43), (16, 46)):
    r(x, y, 8, 1, 'a0bdb0')

# Dock shelter and its separate timber landing.
r = stamp(6, 1)
r(5, 42, 69, 6, '9c8067')
r(10, 23, 59, 20, 'aa8d74')
r(12, 25, 55, 16, 'c7ae8e')
r(5, 15, 70, 10, '8a6d5b')
r(8, 10, 64, 8, 'b18468')
r(14, 5, 52, 7, 'c99a76')
for x in range(14, 67, 8):
    r(x, 11, 2, 6, 'a77b67')
r(22, 30, 10, 11, '739094')
r(48, 30, 10, 11, '739094')
r(35, 31, 10, 12, '77665d')

r = stamp(11, 1)
r(4, 17, 54, 12, '857265')
for y in (17, 22, 27):
    r(4, y, 54, 2, 'c7a481')
for x in (7, 50):
    r(x, 10, 4, 20, '836e57')
    r(x + 1, 10, 2, 3, 'c09a78')

# Bundles of reeds, a maker's bench and a little weather mast.
r = stamp(6, 4)
r(2, 26, 44, 4, '788461')
for x, height, colour in ((4, 11, '9ca178'), (10, 17, 'a4ad80'), (16, 13, '879464'),
                           (22, 20, 'a5b189'), (28, 14, '92a079'), (34, 18, 'b3b78a'),
                           (42, 11, 'a4ad80')):
    r(x, 27 - height, 2, height, colour)
    r(x - 1, 26 - height, 3, 4, '8a8d64')

r = stamp(9, 4)
r(2, 17, 44, 5, '886d58')
r(3, 16, 42, 2, 'c19d79')
r(6, 21, 5, 10, '786453')
r(37, 21, 5, 10, '786453')
r(18, 12, 13, 4, 'a0a893')
r(20, 11, 7, 2, 'c8bca3')

r = stamp(12, 4)
r(6, 6, 3, 25, '746b59')
r(5, 12, 11, 4, '87a4a3')
r(8, 13, 4, 2, 'd2c49a')
r(3, 5, 10, 2, '98836a')
r(5, 5, 4, 2, 'bcb096')

r = stamp(13, 4)
r(2, 20, 28, 8, '85815f')
r(2, 20, 28, 2, 'b5aa7e')
r(12, 7, 8, 13, '9a927a')
r(13, 8, 6, 7, 'd0c2a0')
r(14, 9, 4, 1, '7a8e7a')

destination = Path(__file__).resolve().parents[1] / 'public/assets/art/generated/island_tiles.png'
image.save(destination)
print(f'Wrote {destination.name} ({image.width} × {image.height})')
