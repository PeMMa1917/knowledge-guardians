#!/usr/bin/env python3
"""Draw the original Water Commons tile sheet."""
from pathlib import Path

from PIL import Image, ImageDraw

TILE = 16
image = Image.new('RGBA', (14 * TILE, 5 * TILE))
draw = ImageDraw.Draw(image)


def stamp(tile_x, tile_y):
    offset_x, offset_y = tile_x * TILE, tile_y * TILE

    def rect(x, y, w, h, colour):
        left, top = offset_x + x, offset_y + y
        draw.rectangle((left, top, left + w - 1, top + h - 1), fill='#' + colour)

    return rect


for index, water in enumerate(('467888', '487d8b', '457685')):
    r = stamp(index, 0)
    r(0, 0, 16, 16, water)
    for x, y, w in ((1, 3, 5), (8, 5, 6), (4, 10, 7), (1, 14, 4), (11, 13, 4)):
        r((x + index * 2) % (16 - w), y, w, 1, '63969e')
    r(2 + index, 8, 3, 1, '3a697d')

r = stamp(3, 0)
r(0, 0, 16, 16, 'aa936e')
for x, y, w in ((1, 2, 5), (10, 4, 4), (4, 8, 9), (0, 12, 5), (10, 14, 5)):
    r(x, y, w, 1, 'b8a27c')
r(8, 6, 2, 1, '91816a')
r(1, 11, 2, 1, '91816a')

r = stamp(4, 0)
r(0, 0, 16, 16, '7b675f')
for y in (0, 4, 8, 12):
    r(0, y, 16, 3, 'b59871')
    r(0, y, 16, 1, 'cbb289')
r(2, 0, 1, 16, '8b765f')
r(13, 0, 1, 16, '8b765f')

for index in range(2):
    r = stamp(5 + index, 0)
    r(0, 0, 16, 16, '886b54')
    for y in (3, 9, 15):
        r(0, y, 16, 1, 'a78962')
        for x in (2, 6, 10, 14):
            r(x, y - 2, 1, 2, '728255')
            r(x - (index % 2), y - 2, 2, 1, 'a1a76d')

r = stamp(7, 0)
r(0, 0, 16, 16, '718566')
for x, y, w in ((1, 3, 4), (10, 1, 4), (7, 8, 3), (2, 13, 5), (13, 12, 3)):
    r(x, y, w, 1, '8c9b6d')
r(3, 8, 2, 1, '65755c')
r(11, 11, 2, 1, '65755c')

# Council hall, with a wide porch and two low windows.
r = stamp(0, 1)
r(9, 60, 78, 4, '6f6053')
r(7, 21, 82, 40, '9c816f')
r(9, 27, 78, 31, 'd1b58d')
r(5, 17, 86, 10, '55737a')
r(10, 5, 76, 13, '638b84')
r(20, 1, 56, 6, '74978a')
for y in (6, 11, 16):
    r(10, y, 76, 1, '83a096')
    for x in range(16 + y % 3, 85, 10):
        r(x, y + 1, 1, 4, '517575')
r(8, 24, 80, 3, 'b4a58b')
r(28, 58, 40, 4, 'b39a78')
r(31, 55, 34, 4, 'ceb38b')
r(39, 33, 18, 23, '6a605b')
r(43, 35, 10, 21, '90917b')
r(48, 35, 1, 21, '675956')
for x in (16, 68):
    r(x - 1, 36, 13, 13, '806d61')
    r(x, 37, 11, 10, 'e2b97e')
    r(x + 5, 37, 1, 10, '806d61')
for x in (7, 83):
    r(x, 27, 5, 34, 'a08771')
    r(x + 1, 29, 2, 27, 'dac19a')

# Schematic weir structure. The artwork is scenery for the model.
r = stamp(6, 1)
r(5, 29, 70, 12, '557786')
for y in (33, 37, 41):
    r(25, y, 32, 1, '8cbbb5')
r(6, 22, 68, 7, '7b7871')
r(5, 21, 70, 3, 'b4a699')
for x in (6, 61):
    r(x, 12, 13, 29, '80756c')
    r(x + 1, 13, 10, 5, 'bcac99')
    r(x + 1, 18, 3, 20, '9e8e7e')
r(19, 13, 42, 2, 'a99176')
r(19, 15, 42, 2, '6c6260')
r(24, 16, 3, 13, '7d6860')
r(53, 16, 3, 13, '7d6860')
r(34, 17, 12, 5, 'c79766')

# A water mark, a lamp, and a council ribbon.
r = stamp(11, 1)
r(6, 7, 4, 24, '685d58')
r(5, 5, 6, 14, 'b49873')
r(6, 6, 4, 12, 'ddc49b')
for y in (8, 11, 14, 17):
    r(7, y, 3, 1, '5c7375')

r = stamp(12, 1)
r(6, 8, 4, 23, '515b59')
r(4, 4, 8, 10, '786652')
r(5, 5, 6, 7, 'dbbd89')
r(6, 6, 4, 4, 'f8e6b3')

r = stamp(13, 1)
r(6, 8, 3, 22, '776e59')
r(1, 6, 14, 2, 'aa9372')
r(3, 8, 10, 10, '6b9194')
r(4, 17, 8, 3, '547e83')
r(4, 10, 8, 1, 'b5cabb')

# Low retaining wall between the field rows and the path.
r = stamp(11, 3)
r(4, 17, 40, 9, '7e7568')
r(4, 14, 40, 5, 'b5a188')
for x in (11, 24, 36):
    r(x, 19, 1, 7, '998c7b')
r(8, 15, 30, 1, 'c9b49a')

destination = Path(__file__).resolve().parents[1] / 'public/assets/art/generated/water_tiles.png'
image.save(destination)
print(f'Wrote {destination.name} ({image.width} × {image.height})')
