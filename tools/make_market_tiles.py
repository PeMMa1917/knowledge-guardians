#!/usr/bin/env python3
"""Draw the original Market of Measures tile sheet with Python's standard library."""
from pathlib import Path
from struct import pack
from zlib import compress, crc32

TILE = 16
WIDTH = 18 * TILE
HEIGHT = 9 * TILE
PIXELS = bytearray(WIDTH * HEIGHT * 4)


def stamp(tile_x, tile_y):
    """Return a rectangle painter in local coordinates for this stamp."""
    offset_x, offset_y = tile_x * TILE, tile_y * TILE

    def rect(x, y, w, h, colour):
        row = bytes.fromhex(colour) + b'\xff'
        row *= w
        for line in range(offset_y + y, offset_y + y + h):
            start = (line * WIDTH + offset_x + x) * 4
            PIXELS[start:start + len(row)] = row

    return rect


def paving(tile, top, mortar, light, seam):
    r = stamp(tile, 0)
    r(0, 0, 16, 16, mortar)
    for row, y in enumerate((0, 5, 10, 15)):
        offset = (tile * 3 + row * 4) % 8
        for start in (-8 + offset, offset, 8 + offset):
            left = max(0, start)
            right = min(16, start + 7)
            if right <= left:
                continue
            r(left, y, right - left, min(4, 16 - y), top)
            r(left, y, right - left, 1, light if row == 1 else seam)


for tile, tones in enumerate((
    ('69777a', '4d6265', '82918d', '788682'),
    ('657377', '4d6265', '82918d', '74817e'),
    ('6d797a', '4d6265', '82918d', '778783'),
    ('687471', '4d6265', '82918d', '74827e'),
)):
    paving(tile, *tones)

# Ochre road and a darker border along the courtyard.
paving(4, '8f8575', '635f58', 'a89c82', '9b907b')
paving(5, '647570', '465e5c', '799486', '73857e')


def building(tile, width, roof, ridge, eave, inset, door_width, emblem):
    r = stamp(tile, 1)
    r(5, 61, width - 10, 3, '474047')
    r(6, 20, width - 12, 42, 'a68c76')
    r(7, 30, width - 16, 29, inset)
    r(7, 28, width - 14, 5, eave)
    r(4, 9, width - 8, 21, roof)
    r(9, 5, width - 18, 21, roof)
    r(15, 2, width - 30, 5, ridge)
    for y in (10, 16, 22):
        r(5, y, width - 10, 1, ridge)
        for x in range(11 + (y % 4), width - 8, 9):
            r(x, y + 1, 1, 4, eave)
    r(3, 27, width - 6, 3, eave)
    r(5, 27, width - 10, 1, ridge)

    landing = (width - door_width) // 2
    r(landing - 2, 38, door_width + 4, 23, '887269')
    r(landing, 40, door_width, 21, '4d4b53')
    r(landing + 2, 42, door_width - 4, 19, '6c5556')
    r(landing + door_width - 5, 52, 2, 3, 'd6af70')
    r(landing - 5, 60, door_width + 10, 3, '7c7570')

    for x in (13, width - 24):
        r(x - 1, 39, 13, 13, '856f68')
        r(x, 40, 11, 10, 'e0b87e')
        r(x + 5, 40, 1, 10, '80695f')
        r(x, 44, 11, 1, '80695f')
        r(x - 2, 50, 15, 2, '6d5d59')

    emblem(r, width)


def standards(r, width):
    centre = width // 2
    r(centre - 10, 26, 20, 11, '403d47')
    r(centre - 9, 26, 18, 1, 'd1ab79')
    r(centre, 28, 1, 7, 'e6c88f')
    r(centre - 6, 29, 13, 1, 'e6c88f')
    r(centre - 5, 30, 1, 3, 'e6c88f')
    r(centre + 5, 30, 1, 3, 'e6c88f')
    r(centre - 7, 33, 5, 1, 'd4a975')
    r(centre + 3, 33, 5, 1, 'd4a975')


def workshop(r, width):
    r(width // 2 - 9, 27, 18, 10, '66505c')
    r(width // 2 - 6, 29, 12, 1, 'e0b87e')
    r(width // 2 - 3, 31, 6, 3, 'd6a97c')
    r(8, 55, 11, 4, '836d65')
    r(11, 56, 7, 2, 'c7ad84')


def house(r, width):
    for x in (12, width - 23):
        r(x, 53, 10, 5, '52665d')
        r(x + 1, 53, 7, 2, '8e9a6d')
        r(x + 4, 51, 2, 4, '8e9a6d')


building(0, 80, '466965', '678878', '3b5352', 'd7bc94', 16, standards)
building(5, 80, '725a69', '91707f', '574756', 'cca481', 22, workshop)
building(10, 64, '9a6965', 'b9897a', '7d5755', 'd0a995', 12, house)


def stall(tile, cloth, stripe, goods):
    r = stamp(tile, 5)
    r(5, 43, 54, 5, '53555a')
    r(9, 16, 3, 30, '664f4c')
    r(53, 16, 3, 30, '664f4c')
    r(7, 31, 50, 12, '8e6a53')
    r(5, 29, 54, 4, 'b2926f')
    r(8, 29, 48, 1, 'cea779')
    r(9, 39, 46, 1, '664f4c')
    r(5, 6, 54, 14, cloth)
    r(11, 3, 42, 5, cloth)
    for x in (15, 29, 43):
        r(x, 6, 6, 14, stripe)
    r(5, 19, 54, 3, '8c695f')
    r(6, 18, 52, 2, stripe)
    for x in (7, 19, 31, 43, 53):
        r(x, 22, 4, 2, '9f8067')
    for x, hue in zip((16, 28, 40), goods):
        r(x, 25, 9, 4, hue)
        r(x + 1, 24, 6, 2, hue)


stall(0, '778670', 'b4be87', ('bba671', 'c9b47e', 'a99469'))
stall(4, 'ad666c', 'd58b7e', ('c5ac77', 'd7c495', 'ab906e'))
stall(8, '608b91', '93b5ad', ('9591a2', 'b4a886', 'a26b59'))

# The loaded balance is drawn in the tool itself. This map stand is empty.
r = stamp(12, 5)
r(4, 27, 40, 4, '4e515b')
r(7, 17, 34, 12, '896a5b')
r(5, 16, 38, 4, 'c3a17b')
r(21, 5, 6, 11, '71645f')
r(23, 3, 2, 13, 'd5b377')
r(9, 7, 30, 2, 'd5b377')
r(10, 9, 2, 3, '9a805f')
r(36, 9, 2, 3, '9a805f')
r(7, 12, 8, 2, 'b29370')
r(33, 12, 8, 2, 'b29370')

r = stamp(15, 5)
r(3, 14, 42, 8, '886752')
r(4, 13, 40, 3, 'b19774')
r(7, 22, 4, 8, '675551')
r(36, 22, 4, 8, '675551')

r = stamp(15, 7)
r(6, 9, 4, 22, '544f61')
r(7, 9, 1, 22, '85736c')
r(3, 5, 10, 8, '6b676c')
r(5, 6, 6, 5, 'efc57c')
r(6, 7, 4, 2, 'fae8aa')
r(4, 4, 8, 1, 'ad8670')

r = stamp(16, 7)
r(1, 15, 30, 13, '805b54')
r(2, 14, 28, 4, 'a67e71')
for x, y in ((3, 10), (9, 6), (14, 9), (19, 5), (25, 11)):
    r(x, y, 5, 11, '567260')
    r(x + 1, y - 1, 3, 4, '7e9478')
    r(x + 2, y + 1, 2, 2, 'd5a47d')
r(3, 19, 26, 2, '6e514f')


def chunk(kind, data):
    return pack('!I', len(data)) + kind + data + pack('!I', crc32(kind + data))


def write_png(path):
    stride = WIDTH * 4
    lines = bytearray()
    for start in range(0, len(PIXELS), stride):
        lines.extend(b'\0')
        lines.extend(PIXELS[start:start + stride])
    header = pack('!2I5B', WIDTH, HEIGHT, 8, 6, 0, 0, 0)
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header)
                     + chunk(b'IDAT', compress(lines, 9)) + chunk(b'IEND', b''))


destination = Path(__file__).resolve().parents[1] / 'public/assets/art/generated/market_tiles.png'
write_png(destination)
print(f'Wrote {destination.name} ({WIDTH} × {HEIGHT})')
