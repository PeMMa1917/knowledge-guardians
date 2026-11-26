#!/usr/bin/env python3
"""Draw original Time Hall and Bell Rail tile art."""
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


# Time Hall stone and its inlay, two gallery tiles, brass terrace edges.
for i, (ground, joint, glaze) in enumerate((('606b80', '515c72', '7b8294'), ('98938b', '787d81', 'b5a68c'),
                                           ('776b78', '695f70', '8d7d8b'), ('a08994', '7f7183', 'b8a1a3'),
                                           ('8c8c8f', '727b85', 'a7a0a0'))):
    r = stamp(i, 0)
    r(0, 0, 16, 16, ground)
    r(15, 0, 1, 16, joint)
    r(0, 15, 16, 1, joint)
    r(1, 0, 12, 1, glaze)
    r((i * 3 + 2) % 10, 7, 4, 1, glaze)
    r(9, 12, 3, 1, joint)
    if i in (1, 3):
        r(3, 3, 2, 2, glaze)
        r(10, 10, 2, 2, glaze)

r = stamp(5, 0)
r(0, 0, 16, 16, '8b7b72')
for y in (0, 8):
    r(0, y, 16, 1, 'b8a58d')
    r(0, y + 5, 16, 2, '695f66')

# Decorative wall chart. Two scales sit on the same panel with separate marks.
r = stamp(0, 1)
r(4, 5, 87, 51, '524c5a')
r(6, 7, 83, 47, '806b5e')
r(8, 9, 79, 42, 'b4a296')
r(11, 12, 73, 36, '687589')
for x in (17, 56):
    r(x, 17, 22, 22, '9e9a8d')
    r(x + 3, 20, 16, 16, 'd0bd9d')
    r(x + 10, 23, 2, 7, '6c717c')
    r(x + 11, 27, 5, 2, '6c717c')
    r(x + 8, 14, 7, 2, 'dbc59f')
    r(x + 2, 42, 18, 1, 'adabc0')
r(45, 16, 2, 26, '9994a4')

# A glass-fronted instrument shelf, with small cases arranged separately.
r = stamp(6, 1)
r(2, 5, 59, 43, '6b625f')
r(3, 3, 57, 5, 'a58b77')
r(7, 11, 49, 29, '7a7587')
for x in (9, 26, 43):
    r(x, 16, 10, 10, '9c8d82')
    r(x + 2, 18, 6, 6, 'cbac87')
    r(x + 5, 19, 1, 4, '728285')
    r(x, 32, 9, 4, 'a1a5a1')
    r(x + 2, 32, 3, 1, 'b9c3be')
r(5, 27, 53, 3, 'ac917b')
r(5, 39, 53, 4, 'ac917b')

# Two equivalent display niches serve the historic records. These are original decor.
r = stamp(10, 1)
r(1, 5, 77, 37, '695a73')
r(3, 8, 73, 32, '9d848d')
r(5, 10, 69, 28, '72697c')
r(8, 13, 27, 21, 'b3a291')
r(44, 13, 27, 21, '9b9a9c')
r(10, 15, 23, 17, 'c4b3a0')
r(46, 15, 23, 17, 'b0a8ab')
for y in (19, 23, 27):
    r(15, y, 13, 1, '8c8279')
    r(50, y, 14, 1, '777487')
r(3, 39, 73, 4, '7e6b79')

# Independent drum and rail under a beam, with a shutter on the right.
r = stamp(0, 5)
r(4, 5, 88, 2, 'b5a088')
r(4, 7, 88, 7, '7a717d')
for x in (7, 45, 85):
    r(x, 4, 4, 11, '675f64')
    r(x + 1, 5, 1, 7, 'b29a83')

r = stamp(6, 4)
r(3, 10, 43, 13, '756269')
r(4, 9, 41, 2, '9b7c75')
r(8, 13, 31, 7, '967f8f')
r(8, 20, 3, 10, '5f5866')
r(37, 20, 3, 10, '5f5866')

r = stamp(9, 4)
r(6, 9, 4, 22, '645763')
r(3, 5, 10, 11, '8d736d')
r(4, 6, 8, 8, 'd4b891')
r(6, 7, 5, 5, 'ffdfa4')

r = stamp(10, 4)
r(2, 17, 77, 13, '826f72')
r(4, 16, 73, 4, 'af947e')
r(9, 18, 8, 13, '776472')
r(63, 18, 8, 13, '776472')
r(20, 7, 18, 14, '7a797c')
r(22, 6, 14, 12, 'bbac8d')
r(25, 8, 8, 8, 'e3cca3')
r(29, 8, 1, 5, '796d76')
r(50, 4, 25, 14, '967b78')
for y in (7, 11, 15):
    r(51, y, 23, 1, 'b79a89')

destination = Path(__file__).resolve().parents[1] / 'public/assets/art/generated/council_tiles.png'
image.save(destination)
print(f'Wrote {destination.name} ({image.width} × {image.height})')
