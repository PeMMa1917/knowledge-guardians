# Knowledge Guardians

Knowledge Guardians is a 2D top-down pixel-art RPG for IB Diploma Theory of Knowledge (TOK) students. The player is a new Knowledge Guardian. The player examines real historical objects, compares claims and evidence, and makes honest labels.

The playable opening begins in the Nexus and continues across six chapters:

1. **Chapter 1, the Nexus and Emberford.** Compare Loud's 1888 patent, a Bíró pen made between 1945 and 1948, and a modern workshop model. Run a fair test and argue your case in a practice Showdown. A claim that outruns the evidence makes the room glow and distorts what visitors repeat. In Emberford, trace the origin of Corvan's patterned blade, compare schematic billets and face the public Showdown. Send a packet to the ferry or carry a correction to the square when you want to see how your work travels.
2. **Chapter 2, The Door Without a Name.** Enter the Nile Archive from the Nexus. Choose two of three leads, send a packet and see where it arrives. An optional craft investigation and a reply from the first readers give you reasons to return.
3. **Chapter 3, The Missing Transfer.** Follow the royal custody record and compare the context of the Chinchorro sites. Decide how to open the Cold Store, then handle a reader's request and optionally prepare a proof based on excavation records.
4. **Chapter 4, The Next Bell.** Compare the rain at the quay and on the headland. Check what the forecast can say, send a notice by board or runner, then decide how to reach the same people when the reading changes.
5. **Chapter 5, Where the Wings Go.** Watch for crossings from the creek screen and the ridge. Compare the same-length watches with local accounts, agree on a trail response, and return to see what the next watch can show.
6. **Chapter 6, The Blue Panels.** Weigh two panels that look alike. Trace their separate records, choose how the Trade Hall presents the evidence, and decide what a later transfer docket changes.

Along the way: random events from a fair, seeded deck (calm mode can delay them), learner-profile moments in the journal, a private portfolio, and misconception reflections. A separate **teacher view** (`teacher.html`) builds a class dashboard and student reports from progress files that students choose to share.

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
| `npm test -- tests/tok-coverage.test.ts --mode tok-report` | Audit rolling 30-minute TOK coverage on authored route estimates. |
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
| Portfolio | P | Journal, Portfolio tab |
| Bag | I | Bag button |
| Menu (save, settings, credits) | Esc | Menu button |

Settings include calm mode (delay random events), text size, reduced motion, reduced effects, high contrast, dyslexia-friendly spacing, sound volumes and Lumen prompts.

## Where things are

| Path | What it holds |
|---|---|
| `src/domain/` | Game rules in pure TypeScript (no Phaser). Engine, conditions and effects, saves, permanent credit, content validation. |
| `src/content/` | All game content as JSON: missions, dialogue, exhibits, cards, sources, label kits, Showdowns, threads, events, moments, misconceptions, portfolio templates, items, awards. |
| `src/maps/` | Map layouts as TypeScript data (floor, decoration stamps, characters, objects, zones, lights). |
| `src/scenes/` | Phaser scenes: `BootScene` (loads assets) and `WorldScene` (the playable world). `art.ts` names the parts of the tile sheets. |
| `src/ui/` | The HTML interface over the game: dialogue, journal, portfolio, exhibits, label builder, Showdown, forge, thread, events, menus, settings. Also original pixel art drawn in code (`illustrations.ts`). |
| `src/teacher/` | The teacher view (`teacher.html`): class dashboard and student reports. `report.ts` has the pure rules. |
| `src/app/` | Glue between the rules, the saves, the world and the interface. |
| `public/assets/` | Art and audio files. **Each file is listed in `public/assets/credits.json`.** |
| `assets-src/` | Original downloads that we keep for reference. |
| `tests/` | Vitest tests. |
| `tools/` | Helper scripts (asset check, character variants). |
| `docs/` | Documentation for developers. |

## Documentation

- [AGENTS.md](AGENTS.md): rules for every developer, human or AI. **Read this first.**
- [STATUS.md](STATUS.md): what is done and what to do next.
- [docs/DESIGN_SUMMARY.md](docs/DESIGN_SUMMARY.md): a short paraphrase of the design.
- [CREDITS.md](CREDITS.md): every asset with its source, author and licence.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code fits together.
- [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md): how to add missions, dialogue, exhibits and maps.
- [docs/ASSETS.md](docs/ASSETS.md): how to find, add and credit art and audio.
- [docs/SOURCES.md](docs/SOURCES.md): the historical objects and the sources for each claim.

## Status and limits

- This is a classroom demo, not for commercial use. Saves are in the browser (`localStorage`). There are no accounts and no server.
- The teacher view reads progress files in the browser tab only. Nothing is uploaded.
- The downloadable build contains the playable opening and the early arcs described above. See [STATUS.md](STATUS.md) for current coverage and what still needs playtesting.
- The design spec (`Knowledge_Guardians_spec_v2.10.md`) is not in this public repository. Ask the project owner for a copy. [docs/DESIGN_SUMMARY.md](docs/DESIGN_SUMMARY.md) is a paraphrase, and AGENTS.md lists the rules.

## Licences

- Code: no licence is chosen yet. The project owner will choose one. Use is for the classroom only, not commercial.
- Assets: see [CREDITS.md](CREDITS.md). All third-party assets are CC0 (public domain).
- Font: Lexend, SIL Open Font License 1.1, through `@fontsource/lexend`.
- Engine: Phaser 3, MIT licence.

## Finding later chapters

The Nile Archive follows Elsbet's letter. Finish the main Emberford story, read the letter in her study and return to Ise in the Nexus. The blue-and-brass door is at the north end of the east wing. Complete two leads in any order, send a first packet with Imani and follow it back to Ise. That return opens the Cold Store in the southeast corner of the Nexus. Opening the Cold Store display or inquiry desk reveals the Observatory Coast waypost. Correcting the Observatory notice reveals the Living Forest passage in the south part of the hall. The revised Living Forest notice opens the passage to the Metalworks beside the Nexus workshop bench. See [STATUS.md](STATUS.md#chapter-2-the-door-without-a-name).
