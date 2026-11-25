"""Make recoloured character sheets from the CC0 ArMM1998 character sheet.

Input : public/assets/art/armm1998/character.png  (CC0, see CREDITS.md)
Output: public/assets/art/generated/characters/<id>.png

Each output is a palette swap of the walk rows (top 128 px: rows down, right,
up, left; 4 frames each; frame size 16x32). The outputs are derivative works
of a CC0 file, so they are also free to use. Run:  npm run assets:variants
Requires Python 3 and Pillow.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/assets/art/armm1998/character.png"
OUT = ROOT / "public/assets/art/generated/characters"

# Source palette (hex) -> role
SRC_PAL = {
    "hair_dark": "432e27", "hair_light": "6a4834",
    "skin": "e8d4b2", "skin_shade": "bfa787",
    "shirt": "c43c3c", "shirt_dark": "882e2e", "shirt_darker": "681c1c",
    "pants": "65659b", "pants_light": "5586b9",
}

HAIR = {
    "brown": ("432e27", "6a4834"), "black": ("1f1a24", "3a3342"),
    "blonde": ("a8742a", "e0b450"), "grey": ("6e6e78", "b4b4bc"),
    "auburn": ("6b2a1a", "a4462a"), "white": ("9a9aa6", "e6e6ee"),
}
SKIN = {
    "light": ("e8d4b2", "bfa787"), "warm": ("d9a77a", "b07f55"),
    "tan": ("b98157", "8e5e3b"), "deep": ("7a4e33", "5a3624"),
    "dark": ("5a3a28", "3f281b"),
}
SHIRT = {
    "red": ("c43c3c", "882e2e", "681c1c"), "teal": ("2f9e9a", "1f6e6b", "154a48"),
    "violet": ("7d5bc4", "56408a", "3a2b5e"), "gold": ("d4a23a", "9c7426", "6b4f19"),
    "green": ("4f9a3f", "35692b", "244a1d"), "blue": ("3f6fc4", "2c4e8a", "1e365e"),
    "plum": ("9a3f73", "6b2b50", "4a1d37"), "slate": ("5d6b7a", "414b56", "2d343c"),
    "orange": ("d46a2a", "9c4c1d", "6b3313"),
}
PANTS = {
    "indigo": ("65659b", "5586b9"), "brown": ("6a4834", "8a6448"),
    "charcoal": ("3d3d46", "5a5a66"), "olive": ("5b6332", "7a8448"),
}

# id: (hair, skin, shirt, pants). Player looks are p1..p4. NPC ids match content.
VARIANTS = {
    "player-a": ("brown", "light", "teal", "indigo"),
    "player-b": ("black", "deep", "violet", "charcoal"),
    "player-c": ("auburn", "warm", "gold", "brown"),
    "player-d": ("blonde", "tan", "blue", "olive"),
    "warden-ise": ("white", "tan", "slate", "charcoal"),
    "curator-dace": ("black", "warm", "plum", "charcoal"),
    "clerk-venn": ("grey", "light", "blue", "brown"),
    "kip-arden": ("auburn", "dark", "orange", "indigo"),
    "merchant-corvan": ("brown", "warm", "red", "brown"),
    "smith-hesper": ("black", "deep", "slate", "olive"),
    "guildmaster-orrin": ("grey", "tan", "gold", "charcoal"),
    "scholar-sefa": ("black", "dark", "teal", "brown"),
    "villager-1": ("blonde", "light", "green", "brown"),
    "villager-2": ("brown", "deep", "violet", "olive"),
}

def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    base = Image.open(SRC).convert("RGBA").crop((0, 0, 272, 128))
    for vid, (hair, skin, shirt, pants) in VARIANTS.items():
        m = {}
        h = HAIR[hair]; s = SKIN[skin]; t = SHIRT[shirt]; p = PANTS[pants]
        for role, new in (("hair_dark", h[0]), ("hair_light", h[1]), ("skin", s[0]),
                          ("skin_shade", s[1]), ("shirt", t[0]), ("shirt_dark", t[1]),
                          ("shirt_darker", t[2]), ("pants", p[0]), ("pants_light", p[1])):
            m[rgb(SRC_PAL[role])] = rgb(new)
        im = base.copy(); px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if a and (r, g, b) in m:
                    px[x, y] = (*m[(r, g, b)], a)
        im.save(OUT / f"{vid}.png")
    print(f"Wrote {len(VARIANTS)} sheets to {OUT.relative_to(ROOT)}")

if __name__ == "__main__":
    main()
