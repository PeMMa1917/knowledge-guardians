# Rules for developers (human and AI)

Many people and AI agents work on this repository. Read this file before you change anything. It is short on purpose. Details are in `docs/`.

## 1. Start here

```bash
npm install
npm test            # must pass before and after your change
npm run dev         # play at http://localhost:5173
```

- [README.md](README.md): what the game is, commands, folder map.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code fits together.
- [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md): how to add missions, dialogue, exhibits, maps.
- [docs/ASSETS.md](docs/ASSETS.md): how to add art and audio, and the licence rules.
- [docs/SOURCES.md](docs/SOURCES.md): the historical objects and their sources.
- [CREDITS.md](CREDITS.md): every asset with source, author and licence.

## 2. Rules from the design spec

The design spec is `Knowledge_Guardians_spec.md` (version 2.0). The project owner keeps it. These rules come from it and **must not be broken**:

1. **No runtime AI** (CORE-005). The game never calls an AI model or any generative service. All text is written in advance.
2. **Two save slots only** (section 24): Continue and Checkpoint recovery. A checkpoint moves the old Continue into Recovery. Do not add more campaign slots.
3. **Permanent credit is separate** (sections 23 and 24). XP and awards live in the permanent record. Loading a save never removes them. Credit is idempotent: each criterion has a fixed maximum.
4. **No hidden correct answer** (OPEN-001). Every reasoned judgement gets the same permanent credit. Consequences show in the story, not in XP. Hints never lower XP.
5. **Two separate labels** (sections 2.2 and 17): `claimKind` (observation, interpretation, value, simulation) and `historicalLabel` (documented, reconstruction, scholarly-interpretation, imagined-alternate, fictional-world). Never mix them.
6. **Documented means sourced.** A `documented` record needs a source that supports the narrow claim. Keep qualifiers such as "probably".
7. **Lumen hints have four depths** (section 16) for every objective, from a nudge (1) to the exact step (4).
8. **Content is data.** Missions and dialogue are JSON with the restricted condition and effect vocabulary in `src/domain/types.ts`. No code in content.
9. **Accessibility** (section 21): every action works with the keyboard. Keep text scaling, reduced motion, reduced effects, high contrast and dyslexia spacing working. Give `altText` for pictures.

## 3. Rules from the project owner

- **Real historical objects.** Objects in the game must be real, from history, specific, dated and clear. Fictional things (Aethelgard and its people) are labelled `fictional-world`.
- **Free assets only, free for commercial use.** CC0 first. CC-BY or OGA-BY only with attribution. No NC or ND licences. Every file in `public/assets/` must be in `public/assets/credits.json` and `CREDITS.md`. `npm run assets:check` checks this.
- **Art direction:** rich, colourful pixel art with lighting, inspired in general by modern pixel-art RPGs. **Never copy** art, characters, music or levels from an existing game.
- **Writing style:** plain, short sentences (Simplified Technical English where possible). Font: Lexend everywhere.
- **Documents:** any `.docx` file uses A4 paper with 1.5 cm margins.

## 4. Code rules

- Game rules go in `src/domain/` only. That folder must not import Phaser or use the DOM.
- The UI and scenes send commands to `GameController`. They do not change state directly.
- If you change `CampaignState`, raise `CAMPAIGN_SCHEMA` and add a migration in `src/domain/saves.ts`, with a test.
- Do not rename content IDs after release. Saves refer to them.
- Use exact dependency versions in `package.json` (no `^` or `~`).
- TypeScript is strict. `npm run build` must pass.
- Add a test for each new rule or route. `tests/playthrough.test.ts` plays every route of the chapter.

## 5. Before you finish

1. `npm test` passes.
2. `npm run build` passes.
3. `npm run assets:check` passes (if you changed assets).
4. You played the change in the browser (`npm run dev`).
5. You updated the docs that your change affects: README, CREDITS, `docs/`.
6. Work on a branch and open a pull request. Do not push to `main`.

## 6. Debug help

In the browser console, `window.kg` gives `{ controller, ui, world, settings }`. Examples:

```js
window.kg.controller.state                              // current campaign state
window.kg.world.changeMap('aethelgard.emberford', 20, 21) // go to a map
```

To clear all saves: `localStorage.clear()` and reload.
