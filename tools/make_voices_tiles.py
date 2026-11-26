#!/usr/bin/env python3
"""Draw original tiles for the Listening Room, Glass Walk, and Lamp Quay."""
from pathlib import Path

from PIL import Image, ImageDraw

TILE = 16
image = Image.new('RGBA', (14 * TILE, 6 * TILE))
draw = ImageDraw.Draw(image)


def stamp(tile_x, tile_y):
    offset_x, offset_y = tile_x * TILE, tile_y * TILE

    def rect(x, y, w, h, colour):
        left, top = offset_x + x, offset_y + y
        draw.rectangle((left, top, left + w - 1, top + h - 1), fill='#' + colour)

    return rect


# Muted slate in the archive, a fabric-coloured aisle and outdoor pavers.
for i, (base, edge, grain) in enumerate((('6b6778', '565769', '7c7585'), ('9f848f', '7e6b7e', 'b49aa2'),
                                          ('8d958a', '78887e', 'a8aa97'), ('879086', '7c8b81', 'a6a99a'),
                                          ('b3aa98', '958f84', 'bfb6a6'))):
    r = stamp(i, 0)
    r(0, 0, 16, 16, base)
    r(0, 15, 16, 1, edge)
    r(15, 0, 1, 16, edge)
    r(1, 0, 13, 1, grain)
    r(2 + i % 3, 7, 5, 1, grain)
    r(9, 12 - i, 3, 1, edge)

# The raised walk has ribbed glass. Fine shades follow the edge of each pane.
r = stamp(5, 0)
r(0, 0, 16, 16, '769e9b')
r(0, 0, 16, 2, '5b8286')
r(0, 15, 16, 1, 'a8c4b5')
r(0, 1, 2, 14, '597d7d')
r(13, 1, 1, 14, 'a7c6ba')
r(5, 3, 1, 8, '92b8ad')
r(6, 2, 2, 1, 'afccc2')

r = stamp(6, 0)
r(0, 0, 16, 16, 'a69a89')
for y in (0, 8):
    r(0, y, 16, 1, 'd1bfaa')
    r(0, y + 5, 16, 2, '7d817a')

# Quay boards followed by two reflected water tiles.
r = stamp(7, 0)
r(0, 0, 16, 16, '756868')
for y in (0, 4, 8, 12):
    r(0, y, 16, 3, 'a89178')
    r(0, y, 16, 1, 'bea38a')
    r((2 + y) % 12, y + 1, 3, 1, '8e7b72')
for i, water in enumerate(('3c6276', '406a7d')):
    r = stamp(8 + i, 0)
    r(0, 0, 16, 16, water)
    for x, y, w in ((1, 4, 5), (8, 8, 6), (3, 11, 8), (9, 14, 5)):
        r((x + i * 3) % (16 - w), y, w, 1, '7099a1')
    r(5 + i, 6, 3, 1, '4c7d91')

# Archive screens have sections of felt, in a quiet rose and late-green palette.
r = stamp(0, 1)
r(4, 9, 58, 28, '675563')
r(4, 5, 58, 4, '806c71')
for i, felt in enumerate(('8f707d', '718d8c', '9c808f', '7a878f')):
    x = 6 + i * 14
    r(x, 8, 12, 27, felt)
    r(x + 1, 9, 10, 1, 'a38f96')
    r(x + 2, 13, 2, 16, '7c727f')
    r(x + 9, 12, 1, 17, 'b298a2')
r(7, 36, 4, 6, '574e59')
r(54, 36, 4, 6, '574e59')

# The arch recurs at both ends of the level. Sides use contrasting pale stone.
r = stamp(4, 1)
r(1, 53, 15, 10, '6d767a')
r(64, 53, 15, 10, '6d767a')
r(3, 25, 12, 32, '8a9995')
r(65, 25, 12, 32, '8a9995')
r(5, 25, 7, 30, 'b5b8a8')
r(68, 25, 7, 30, 'b5b8a8')
for y in (30, 40, 50):
    r(3, y, 12, 1, '788c88')
    r(65, y, 12, 1, '788c88')
r(9, 17, 13, 10, '95a3a0')
r(58, 17, 13, 10, '95a3a0')
r(17, 10, 17, 10, 'a5aaa2')
r(46, 10, 17, 10, 'a5aaa2')
r(28, 5, 24, 10, 'b2b8ab')
r(35, 2, 10, 13, '839795')
r(36, 4, 8, 3, 'bfd0b6')
r(4, 55, 13, 2, 'c3c0a8')
r(63, 55, 13, 2, 'c3c0a8')

# Low bench and cases. The discreet archive labels have no invented script.
r = stamp(9, 1)
r(3, 15, 43, 4, '8b7472')
r(4, 15, 41, 1, 'b89583')
r(5, 19, 39, 5, '725d62')
r(6, 25, 4, 5, '68545b')
r(38, 25, 4, 5, '68545b')
r(8, 12, 32, 3, '8c8496')

r = stamp(12, 1)
r(2, 7, 28, 23, '75606a')
r(1, 5, 30, 4, 'ad8e7d')
r(5, 11, 22, 16, '927970')
r(6, 12, 8, 13, 'b39785')
r(17, 12, 8, 13, 'b39785')
r(10, 18, 3, 1, '6d655e')
r(18, 18, 3, 1, '6d655e')

r = stamp(9, 3)
r(2, 4, 45, 27, '6c5d65')
r(4, 4, 41, 4, 'ac8d7a')
r(5, 10, 38, 16, '9d877b')
for x, hue in ((8, '9b778b'), (17, '7e9d99'), (26, '9b95a2'), (35, 'c29c83')):
    r(x, 13, 6, 8, hue)
    r(x + 2, 15, 2, 3, 'e0c5a0')
r(5, 24, 38, 3, 'c7ac96')

# The bent inner rail and a separate retaining rail used near the water edge.
r = stamp(0, 4)
r(7, 1, 3, 30, '6d797a')
r(7, 1, 1, 29, 'c0b59f')
for y in (2, 16, 29):
    r(5, y, 5, 2, '8b8073')
    r(5, y, 1, 2, 'c0b59f')

r = stamp(1, 4)
r(1, 7, 45, 3, '6e7880')
r(1, 7, 45, 1, 'a1afa7')
for x in (3, 24, 43):
    r(x, 6, 3, 9, '7d867e')
    r(x, 7, 1, 7, 'b8ae9b')

destination = Path(__file__).resolve().parents[1] / 'public/assets/art/generated/voices_tiles.png'
image.save(destination)
print(f'Wrote {destination.name} ({image.width} × {image.height})')
