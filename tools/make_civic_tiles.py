#!/usr/bin/env python3
"""Draw the original Library Dispatch and Canal Walk tiles."""
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


# Hall flooring. The broad lighter lane connects all three doors.
for i, (base, seam, light) in enumerate((('5e6d71', '586469', '85908b'), ('8f9b89', '82907e', 'd2b887'))):
    r = stamp(i, 0)
    r(0, 0, 16, 16, base)
    r(0, 15, 16, 1, seam)
    r(15, 0, 1, 16, seam)
    r(1, 1, 14, 1, light)
    r(1, 2, 1, 12, light)
    r(5, 8, 4, 1, seam)

# Brick pavers, a smoother curb lane, and the edges of the shallow steps.
for i, base in enumerate(('8d8a7e', '85867c')):
    r = stamp(2 + i, 0)
    r(0, 0, 16, 16, '747a73')
    for row in range(3):
        y = row * 5
        split = 5 + (row * 5 + i * 3) % 6
        r(0, y, split, 4, base)
        r(split + 1, y, 15 - split, 4, base)
        r(2, y, 3, 1, 'a19b84')
        r(13, y + 2, 2, 1, '77796f')
r = stamp(4, 0)
r(0, 0, 16, 16, 'aea28c')
r(0, 0, 16, 1, 'c2b39a')
r(0, 15, 16, 1, '8f8b7b')
r(15, 0, 1, 16, '99917d')
r(3, 9, 3, 1, 'baad95')
r = stamp(5, 0)
r(0, 0, 16, 16, '958878')
for y in (0, 8):
    r(0, y, 16, 1, 'c5b59a')
    r(0, y + 5, 16, 2, '797a70')

# Evening reflections, with boardwalk above the canal.
for i, base in enumerate(('3f6477', '41697d')):
    r = stamp(6 + i, 0)
    r(0, 0, 16, 16, base)
    for x, y, width in ((1, 1, 6), (8, 6, 7), (2, 10, 5), (10, 14, 4)):
        r((x + i * 2) % (16 - width), y, width, 1, '6997a1')
    r(4 + i, 5, 3, 1, '536d87')
    r(7 + i, 12, 3, 1, '536d87')
r = stamp(8, 0)
r(0, 0, 16, 16, '6b6360')
for x in (0, 4, 8, 12):
    r(x, 0, 3, 16, '9c846e')
    r(x, 2, 1, 11, 'b7a084')
    r(x + 1, 3 + x % 5, 1, 1, '716966')

# Route mural. Branches mark the street directions above the hall's console.
r = stamp(0, 1)
r(2, 4, 92, 38, '424d58')
r(4, 6, 88, 34, '735e56')
r(6, 8, 84, 30, 'd3bb92')
r(9, 11, 78, 24, '526e77')
r(44, 28, 8, 5, 'ecd0a1')
r(46, 17, 4, 13, 'bc9b7a')
r(20, 15, 28, 3, 'cba17b')
r(48, 19, 28, 3, '87bbb1')
r(16, 13, 8, 7, 'e9b991')
r(72, 17, 8, 7, 'b2dcbd')
for x, y in ((12, 28), (29, 26), (64, 13), (80, 28)):
    r(x, y, 5, 1, '75918e')

# North Steps offices. Brickwork gives way to windows with distinct colours.
r = stamp(6, 1)
r(3, 59, 74, 4, '716c62')
r(7, 18, 66, 43, '9c7b6e')
r(6, 14, 68, 6, '805c59')
r(11, 7, 58, 8, 'a97a69')
r(18, 3, 44, 5, 'b68c79')
for x in range(15, 67, 8):
    r(x, 8, 1, 6, '94685f')
for y in (25, 33, 41, 49, 56):
    r(8, y, 64, 1, 'ad8b78')
    for x in range(9 + y % 5, 72, 7):
        r(x, y + 1, 1, 3, '866a64')
for x, glass in ((14, 'ecc797'), (52, 'afc6ad')):
    r(x, 29, 14, 15, '695757')
    r(x + 2, 30, 10, 11, glass)
    r(x + 6, 30, 1, 11, '866e6a')
    r(x - 1, 44, 16, 2, 'dac7a2')
r(31, 33, 18, 28, '715656')
r(34, 36, 12, 24, '786d64')
r(37, 38, 6, 8, 'b6ae98')
r(29, 59, 22, 3, 'c4a28a')

# The two-wheeled mobile library cart and its shallow rows of books.
r = stamp(11, 1)
r(2, 27, 59, 4, '5c5350')
r(3, 24, 11, 4, '8a7866')
r(10, 5, 44, 20, '705b55')
r(8, 3, 48, 5, 'bb9d76')
r(11, 8, 42, 3, 'a88c6c')
r(13, 11, 37, 11, 'd7b997')
for x, y, h, cover in ((15, 12, 9, '8f9b86'), (20, 13, 8, '9c6e66'),
                       (24, 12, 9, '818baa'), (30, 15, 6, 'b57f64'),
                       (35, 13, 8, '759d93'), (40, 12, 9, 'a780a0'), (45, 14, 7, 'c4a36e')):
    r(x, y, 3, h, cover)
r(13, 22, 39, 2, '8c6f64')
for x in (15, 45):
    r(x, 25, 9, 6, '4c5254')
    r(x + 3, 26, 3, 3, 'b69b83')

# Wall bookcases, a pane lamp and a stop marker.
r = stamp(0, 4)
r(3, 7, 57, 25, '674f4d')
r(3, 3, 57, 5, 'af8c6a')
r(7, 10, 49, 7, 'a5896d')
r(7, 20, 49, 8, 'a5896d')
for y in (10, 20):
    for i in range(13):
        r(8 + i * 3, y + i % 2, 2, 6, ('a1767e', 'dbad87', '7a9a94', '919ab3')[i % 4])
r(6, 17, 51, 2, 'ccaa84')
r(6, 27, 51, 2, 'ccaa84')

r = stamp(4, 4)
r(7, 9, 3, 22, '696363')
r(3, 4, 11, 10, '514f50')
r(5, 6, 7, 6, 'edc591')
r(7, 7, 4, 4, 'fff1ba')
r(4, 3, 9, 2, '8c7a6d')

r = stamp(5, 4)
r(4, 7, 7, 25, '675759')
r(2, 5, 11, 14, '626876')
r(3, 6, 9, 4, '9fc3bb')
r(4, 12, 7, 5, 'e5c6a4')
r(5, 13, 5, 1, '8b827a')

# Low rail along the canal. Its decorative upper half leaves the path open.
r = stamp(6, 4)
r(2, 8, 44, 3, '776b67')
r(2, 8, 44, 1, 'aa9385')
for x in (4, 23, 42):
    r(x, 8, 3, 8, '746763')
    r(x + 1, 9, 1, 6, 'a18f80')

destination = Path(__file__).resolve().parents[1] / 'public/assets/art/generated/civic_tiles.png'
image.save(destination)
print(f'Wrote {destination.name} ({image.width} × {image.height})')
