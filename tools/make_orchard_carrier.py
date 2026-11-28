"""Draw Tallowheel's original orchard-stage sprite in the campaign's 16 by 32 frame grid."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/assets/art/generated/characters/tallowheel.png"
INK, FOOT, JAW = "#342338", "#64a68d", "#add39d"
SHELL, LIGHT, MID = "#b45567", "#ffd498", "#e39875"


def carrier(direction, beat):
    image = Image.new("RGBA", (16, 32))
    pen = ImageDraw.Draw(image)
    rise = (0, 0, 1, 0)[beat]
    waving = beat % 2
    # A plume of green leaves and a pale spiral distinguish her from the baby's shell.
    pen.ellipse((1, 9 + rise, 12, 21 + rise), fill=INK)
    pen.ellipse((2, 10 + rise, 11, 20 + rise), fill=SHELL)
    pen.line([(3, 16 + rise), (3, 13 + rise), (5, 11 + rise), (8, 11 + rise),
              (10, 13 + rise), (10, 16 + rise), (8, 18 + rise), (6, 18 + rise),
              (5, 16 + rise), (6, 14 + rise), (8, 14 + rise), (8, 16 + rise)], fill=LIGHT)
    pen.point((4, 18 + rise), fill=MID)
    pen.line([(3, 10 + rise), (2, 7 + rise), (4, 8 + rise), (5, 10 + rise)], fill=FOOT)
    pen.polygon([(0, 21), (3, 19), (10, 19), (12, 16), (15, 17), (15, 22),
                 (12, 24), (4 - waving, 24), (0, 23)], fill=INK)
    pen.polygon([(1, 22), (6, 20), (11, 20), (12, 18), (14, 18), (14, 22),
                 (11, 23), (3, 23)], fill=FOOT)
    if direction in ("right", "left"):
        pen.line((12, 18, 11, 14 + waving), fill=INK)
        pen.line((14, 18, 15, 13 - waving), fill=INK)
        pen.point((11, 14 + waving), fill=JAW)
        pen.point((15, 13 - waving), fill=JAW)
        pen.point((13, 20), fill=JAW)
        if direction == "left":
            image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    elif direction == "down":
        pen.ellipse((5, 17, 12, 23), fill=FOOT, outline=INK)
        for x, dx in [(6, -2), (10, 2)]:
            pen.line((x, 19, x + dx, 15 + waving), fill=INK)
            pen.point((x + dx, 15 + waving), fill=JAW)
        pen.line((7, 21, 9, 21), fill=JAW)
    else:
        pen.line((11, 15, 12, 11 - waving), fill=INK)
        pen.line((13, 16, 15, 13 + waving), fill=FOOT)
    return image


if __name__ == "__main__":
    sheet = Image.new("RGBA", (272, 128))
    for row, direction in enumerate(("down", "right", "up", "left")):
        for frame in range(4):
            sheet.paste(carrier(direction, frame), (frame * 16, row * 32))
    sheet.save(OUT)

# Silhouettes on Fen's trunk. Faces read as objects at play size and keep the same orientation as the turning wood.
faces = [
    ["..######....","..######....","...####.....","...####.....","...####.....","...#####....",
     "...######...","...########.","..##########","..##########","..###..#####","............"],
    [".......##...","......##.##.",".....##..##.","..#######...","..########..",".##########.",
     ".##########.",".##########.","..########..","..########..","...######...","....####...."],
    [".....##.....","....####....","...######...","...##..##...","..##....##..","..##....##..",
     "..##....##..",".##......##.",".##########.","############",".....##.....",".....##....."],
    ["....###.....","....###..##.",".....##.##..","..##.####...","...#####....",".....##.....",
     "....####....","...##..##...","..##...###..",".##...##.##.","##....#...##","............"],
    ["......####..","....####....","...###......","..###.......",".####.......",".###........",
     ".####.......","..###.......","..####....#.","...########.","....######..","......##...."],
    ["............","..#########.",".###########",".###########",".##.#.#.#.#.",".##.#.#.#.#.",
     ".##.#.#.#.#.",".##.#.#.#.#.",".##.#.#.#.#.",".#..#.#.#.#.","............","............"],
]
atlas = Image.new("RGBA", (12 * len(faces),12))
for index, face in enumerate(faces):
    for y, row in enumerate(face):
        assert len(row) == 12
        for x, mark in enumerate(row):
            if mark == "#":
                atlas.putpixel((12 * index + x,y),(255,255,255,255))
atlas.save(ROOT / "src/ui/plumFaces.png")
