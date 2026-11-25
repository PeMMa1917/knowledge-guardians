# Knowledge Guardians

Knowledge Guardians is a 2D top-down pixel-art RPG for IB Diploma Theory of Knowledge (TOK) students. The player is a new Knowledge Guardian. The player examines real historical objects, compares claims and evidence, and makes honest labels.

This repository holds the **first playable chapter** (spec sections 27.1 and 29.1):

1. **The Nexus** (WORLD-01). Recruitment mission "Three Firsts". The player inspects three real objects about the ballpoint pen (Loud's 1888 patent, a Biro pen of 1945–1948, and a fair-test model), runs a fair test, builds an evidence board, and writes a museum label.
2. **Emberford, Aethelgard** (WORLD-02). Field mission "The Label on the Blade". The player looks at a patterned blade that a trader sells as "Damascus wootz", collects evidence, sorts process steps, and decides what to do about the label.

The game runs in a web browser. It has no server and no runtime AI.

## Quick start

You need [Node.js](https://nodejs.org/) 20 or later (the project uses Node 22).

```bash
npm install        # install dependencies (exact versions in package.json)
npm run dev        # start the game at http://localhost:5173
```

Other commands:

| Command | What it does |
|---|---|
| `npm test` | Run all tests (content checks, save system, full playthroughs of every route). |
| `npm run typecheck` | Check the TypeScript types. |
| `npm run build` | Type-check, then make a static build in `dist/`. |
| `npm run preview` | Serve the `dist/` build at http://localhost:4173. |
| `npm run validate:content` | Check only the game content (JSON) for broken links and missing sources. |
| `npm run assets:check` | Check that every asset file has a source, an author and a licence. |
| `npm run assets:variants` | Make the character sprite sheets again from the source sheet (needs Python 3 and Pillow). |

The build in `dist/` is static. You can put it on any static web host (for example GitHub Pages). It uses relative paths.

## Controls

| Action | Keys | Mouse or touch |
|---|---|---|
| Move | Arrow keys or WASD | Click a place on the map |
| Talk, inspect, use | E, Space or Enter | Click a person or an object |
| Choose a dialogue option | 1 to 9 | Click the option |
| Hint from Lumen | H | Hint button |
| Journal | J | Journal button |
| Evidence board | B | Board button |
| Bag | I | Bag button |
| Menu (save, settings, credits) | Esc | Menu button |

Settings include text size, reduced motion, reduced effects, high contrast, dyslexia-friendly spacing, sound volumes and Lumen prompts.

## Where things are

| Path | What it holds |
|---|---|
| `src/domain/` | Game rules in pure TypeScript (no Phaser). Engine, conditions and effects, saves, permanent credit, content validation. |
| `src/content/` | All game content as JSON: missions, dialogue, exhibits, evidence cards, sources, items, awards. |
| `src/maps/` | Map layouts as TypeScript data (floor, decoration stamps, characters, objects, zones, lights). |
| `src/scenes/` | Phaser scenes: `BootScene` (loads assets) and `WorldScene` (the playable world). `art.ts` names the parts of the tile sheets. |
| `src/ui/` | The HTML interface over the game: dialogue, journal, exhibits, board, menus, settings. Also original pixel art drawn in code (`illustrations.ts`). |
| `src/app/` | Glue between the rules, the saves, the world and the interface. |
| `public/assets/` | Art and audio files. **Each file is listed in `public/assets/credits.json`.** |
| `assets-src/` | Original downloads that we keep for reference. |
| `tests/` | Vitest tests. |
| `tools/` | Helper scripts (asset check, character variants). |
| `docs/` | Documentation for developers. |

## Documentation

- [AGENTS.md](AGENTS.md): rules for every developer, human or AI. **Read this first.**
- [CREDITS.md](CREDITS.md): every asset with its source, author and licence.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code fits together.
- [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md): how to add missions, dialogue, exhibits and maps.
- [docs/ASSETS.md](docs/ASSETS.md): how to find, add and credit art and audio.
- [docs/SOURCES.md](docs/SOURCES.md): the historical objects and the sources for each claim.

## Status and limits

- This is a local demo. Saves are in the browser (`localStorage`). There are no accounts, no teacher tools and no server.
- Only the first chapter exists. The full spec describes 24 worlds.
- The design spec (`Knowledge_Guardians_spec.md`, version 2.0) is not in this public repository. Ask the project owner for a copy. AGENTS.md lists the rules from it that the code must follow.

## Licences

- Code: no licence is chosen yet. The project owner will choose one.
- Assets: see [CREDITS.md](CREDITS.md). All third-party assets are CC0 (public domain).
- Font: Lexend, SIL Open Font License 1.1, through `@fontsource/lexend`.
- Engine: Phaser 3, MIT licence.
