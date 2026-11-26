# Assets: where they are and how to add them

## Where assets are

| Folder | Holds | Loaded by |
|---|---|---|
| `public/assets/art/armm1998/` | CC0 tile sheets and the source character sheet by ArMM1998. | `src/scenes/BootScene.ts` (`ow` = Overworld.png, `in` = Inner.png) |
| `public/assets/art/generated/characters/` | Character sheets made by `tools/make_character_variants.py`. | `CHARACTER_SHEETS` in `BootScene.ts` |
| `public/assets/art/generated/market_tiles.png` | Original pavements, stalls, buildings and furniture for Lantern Square. | `market` sheet in `BootScene.ts` |
| `public/assets/art/generated/water_tiles.png` | Original Water Commons channels, bridges, field rows, weir and council hall. | `water` sheet in `BootScene.ts` |
| `public/assets/art/generated/civic_tiles.png` | Original Civic Machine offices, book carts, route mural and canal walk. | `civic` sheet in `BootScene.ts` |
| `public/assets/audio/music/` | Music loops. | `AUDIO` in `BootScene.ts` |
| `public/assets/audio/sfx/` | Sound effects. | `AUDIO` in `BootScene.ts` |
| `public/assets/credits.json` | Source, author and licence of **every** file above. | `tools/check-assets.mjs` |
| `assets-src/` | Original downloads, kept so that anyone can check or rebuild. | not loaded |
| `src/ui/illustrations.ts` | Original pixel art drawn in code (exhibits, Lumen, icons, inspection pictures). | `BootScene.ts` and the UI |

Files in `public/` are copied to the build as they are. Paths in code are relative, for example `assets/audio/sfx/ui-click-kenney.mp3`.

## Licence rules

- **Use CC0 first.** CC-BY and OGA-BY are also allowed. Then you must give the attribution that the licence asks for in `CREDITS.md`.
- **Do not use** assets with NC (non-commercial), ND (no derivatives) or unclear licences. The project owner wants assets that are free for commercial use.
- Do not use art, music, characters or levels from existing commercial games, also when "inspired by". Do not use AI-generated imitations of a named game's art.
- Museum photographs: use only when the record gives an open licence (for example CC0 open access). Rights are different for each image. Record the rights statement.

## How to add an asset

1. Download the file from its source page. Keep the original download in `assets-src/<pack>/` if it is small (less than 5 MB), or write the download URL in `credits.json`.
2. Put the file you use in the correct folder under `public/assets/`. Use the name pattern `<what-it-is>-<author>.<ext>`, in lower case with hyphens.
3. Add the pack (if new) and the file to `public/assets/credits.json`: `pack`, `original` (the file name in the download), `changes` (what you changed, or "none").
4. Add a row to `CREDITS.md`.
5. Load it: add a key to `AUDIO` in `BootScene.ts`, or add a stamp to `src/scenes/art.ts` for a tile sheet.
6. Run `npm run assets:check` and `npm run build`.

## How to remove an asset

Delete the file, remove its entries from `credits.json` and `CREDITS.md`, and remove the key in `BootScene.ts`. Run `npm run assets:check`.

## Audio format

Sound effects: mono MP3, 96 kbit/s. Example:

```bash
ffmpeg -i original.wav -ac 1 -b:a 96k public/assets/audio/sfx/new-sound-author.mp3
```

Music: stereo MP3 is fine. Keep each file under about 5 MB. Audio is never needed to play: all important information is also given as text, and the game keeps working if an audio file is missing.

## Character sheets

`character.png` (ArMM1998) has walk frames of 16 × 32 pixels: 17 frames in each row, rows in the order down, right, up, left. `tools/make_character_variants.py` changes the hair, skin, shirt and trouser colours to make each character. To add a character:

1. Add a palette to the script and run `npm run assets:variants` (needs Python 3 and Pillow: `pip install pillow`).
2. Add the id to `CHARACTER_SHEETS` in `BootScene.ts`.
3. Add the file to `credits.json` (pack `generated-characters`).

## Tile sheets and stamps

`Overworld.png` is 40 × 36 tiles and `Inner.png` is 40 × 25 tiles, each tile 16 × 16 pixels. A stamp in `src/scenes/art.ts` names a rectangle in tiles: `{ sheet: 'ow', x, y, w, h }`. Options: `collide` (blocks movement), `above` (drawn over the player, for tree tops), `flat` (drawn under characters, for rugs).

Lantern Square uses an 18 × 9 tile sheet with the same tile size. Run `python3 tools/make_market_tiles.py` to regenerate it from the original drawings in the script.

The Water Commons uses a 14 × 5 sheet. Run `python3 tools/make_water_tiles.py` with Pillow to regenerate it.

Library Dispatch, North Steps and Canal Walk use a 15 × 6 sheet. Run `python3 tools/make_civic_tiles.py` with Pillow to regenerate it.
