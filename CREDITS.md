# Credits and licences

This file lists every asset in the game: where it came from, who made it, and its licence.

The same data is in machine-readable form in [`public/assets/credits.json`](public/assets/credits.json). The command `npm run assets:check` makes sure that every file in `public/assets/` has an entry there. **When you add or remove an asset, update both files.** See [docs/ASSETS.md](docs/ASSETS.md).

All third-party assets are **CC0 1.0** (public domain). You can use them for commercial work. Attribution is not required, but we give it.

The art direction is "rich, colourful pixel art with lighting", inspired in general by modern pixel-art RPGs. We do not copy art, characters, music or levels from any existing game.

## Art

| File(s) in `public/assets/` | Source | Author | Licence | Changes |
|---|---|---|---|---|
| `art/armm1998/Overworld.png`, `Inner.png`, `character.png`, `cave.png`, `objects.png` | [Zelda-like tilesets and sprites](https://opengameart.org/content/zelda-like-tilesets-and-sprites) (OpenGameArt) | ArMM1998 | CC0 1.0 | None. Original zip kept in `assets-src/armm1998/gfx_3.zip`. `cave.png` and `objects.png` are not used yet. |
| `art/generated/characters/*.png` (14 sheets) | Made from `character.png` above | Knowledge Guardians project | CC0 1.0 | Colour (palette) swaps of the walk frames, made by `tools/make_character_variants.py`. |
| `art/generated/market_tiles.png` | [Market tile generator](tools/make_market_tiles.py) | Knowledge Guardians project | CC0 1.0 | Original Market of Measures pavements, buildings, and furniture. |
| `art/generated/water_tiles.png` | [Water Commons tile generator](tools/make_water_tiles.py) | Knowledge Guardians project | CC0 1.0 | Original channels, field terraces, weir and council hall. |
| `art/generated/civic_tiles.png` | [Civic Machine tile generator](tools/make_civic_tiles.py) | Knowledge Guardians project | CC0 1.0 | Original pavers, book carts, offices and canal walk. |
| `art/generated/voices_tiles.png` | [Archive of Voices tile generator](tools/make_voices_tiles.py) | Knowledge Guardians project | CC0 1.0 | Original listening screens, Glass Walk and Lamp Quay. |
| `art/generated/island_tiles.png` | [Island tile generator](tools/make_island_tiles.py) | Knowledge Guardians project | CC0 1.0 | Original workshop model, landings, boardwalks and habitat margin. |
| `art/generated/council_tiles.png` | [Council tile generator](tools/make_council_tiles.py) | Knowledge Guardians project | CC0 1.0 | Original Time Hall scales, Letter Gallery niches and Bell Rail. |
| Collection images from Cleveland in `specimens/` | [Cleveland Museum of Art Open Access](https://www.clevelandart.org/open-access) | The Cleveland Museum of Art | CC0 1.0 | Reduced for download and rendered in the game’s pixel style. |
| Collection images from The Met in `specimens/` | [The Met Open Access](https://www.metmuseum.org/hubs/open-access) | The Metropolitan Museum of Art | CC0 1.0 | The manifest links the accession and exact source image for each file. |
| Smithsonian collection images in `specimens/` | [Smithsonian Open Access](https://www.si.edu/openaccess) | Smithsonian Institution | CC0 1.0 | Images with documented open rights in the National Museum of Asian Art, National Museum of African Art and National Museum of Natural History collections. |
| Yale Peabody collection image in `specimens/` | [Yale Peabody Museum specimen and image record](https://api.gbif.org/v1/occurrence/1039401135) | Marilyn Fox, Yale Peabody Museum | CC0 1.0 | The manifest links the museum accession, image and rights evidence. |

Other art is **original** and drawn in code: exhibit pedestals, the evidence board, the blade, the catalogue, the assay table, the anvil, the portal, the fairy guide Lumen, icons and the large inspection pictures. See `src/ui/illustrations.ts`. Lighting, particles and glow are made in code too.

## Music

The campaign soundtrack and returning story phrase are original music created for Knowledge Guardians. The arrangements and instrument synthesis are defined in [`campaignScore.ts`](src/domain/campaignScore.ts), [`storyMotifs.ts`](src/domain/storyMotifs.ts) and [`campaignSynth.ts`](src/app/campaignSynth.ts).

| File in `public/assets/audio/music/` | Source | Author | Licence | Use in game |
|---|---|---|---|---|
| `mysterious-ambience-cynicmusic.mp3` | [Mysterious Ambience (song21)](https://opengameart.org/content/mysterious-ambience-song21) | cynicmusic | CC0 1.0 (the page also offers CC-BY 3.0, CC-BY-SA 3.0 and GPL 3.0; we use CC0) | Archive music fallback |
| `town-theme-cynicmusic.mp3` | [Town Theme RPG](https://opengameart.org/content/town-theme-rpg) | cynicmusic | CC0 1.0 | Town music fallback |
| `happy-lullaby-cynicmusic.mp3` | [Happy Lullaby (song17)](https://opengameart.org/content/happy-lullaby-song17) | cynicmusic | CC0 1.0 | Title cue and secondary fallback |

## Sound effects

All sound effects were converted to mono 96 kbit/s MP3 with ffmpeg. The sound did not change in other ways.

| File in `public/assets/audio/sfx/` | Original file | Source | Author | Licence |
|---|---|---|---|---|
| `ui-click-kenney.mp3` | click1 | [51 UI sound effects](https://opengameart.org/content/51-ui-sound-effects-buttons-switches-and-clicks) | Kenney (kenney.nl) | CC0 1.0 |
| `ui-hover-kenney.mp3` | rollover2 | same | Kenney | CC0 1.0 |
| `ui-open-kenney.mp3` | switch2 | same | Kenney | CC0 1.0 |
| `book-open-rubberduck.mp3` | book_01 | [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) | rubberduck | CC0 1.0 |
| `page-turn-rubberduck.mp3` | book_03 | same | rubberduck | CC0 1.0 |
| `coins-rubberduck.mp3` | item_coins_02 | same | rubberduck | CC0 1.0 |
| `pickup-rubberduck.mp3` | item_misc_02 | same | rubberduck | CC0 1.0 |
| `metal-rubberduck.mp3` | metal_02 | same | rubberduck | CC0 1.0 |
| `sparkle-rubberduck.mp3` | spell_01 | same | rubberduck | CC0 1.0 |
| `lock-rubberduck.mp3` | lock_01 | same | rubberduck | CC0 1.0 |
| `step-rubberduck.mp3` | stones_01 | same | rubberduck | CC0 1.0 |
| `award-wobbleboxx.mp3` | Rise03.aif | [Level up, power up, Coin get (13 Sounds)](https://opengameart.org/content/level-up-power-up-coin-get-13-sounds) | wobbleboxx | CC0 1.0 |
| `coin-wobbleboxx.mp3` | Coin01.aif | same | wobbleboxx | CC0 1.0 |
| `complete-haeldb.mp3` | completetask_0.mp3 | [Completion sound.](https://opengameart.org/content/completion-sound) | HaelDB | CC0 1.0 (the page also offers OGA-BY 3.0; we use CC0) |

## Software and fonts

| Item | Author | Licence |
|---|---|---|
| [Phaser 3.90.0](https://phaser.io/) | Phaser Studio | MIT |
| [Lexend](https://www.lexend.com/) through [@fontsource/lexend](https://fontsource.org/fonts/lexend) | Bonnie Shaver-Troup, Thomas Jockin and others | SIL Open Font License 1.1 |
| [Vite](https://vite.dev/), [Vitest](https://vitest.dev/), [TypeScript](https://www.typescriptlang.org/) (development only) | their authors | MIT / Apache 2.0 |

## Historical sources

The historical sources for the real objects in the game are in [docs/SOURCES.md](docs/SOURCES.md) and in the chapter content. The game uses original pixel drawings and transforms collection images released under verified open licences. The Polar Store’s exact accession illustrations are original drawings based on catalogue descriptions. Per-image rights, catalogue and download links are in [the asset manifest](public/assets/credits.json).
