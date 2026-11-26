# Rules for developers (human and AI)

Many people and AI agents work on this repository. Read this file before you change anything. It is short on purpose. Details are in `docs/`. The current state of the work and the next steps are in [STATUS.md](STATUS.md).

## 1. Start here

```bash
npm install
npm test            # must pass before and after your change
npm run dev         # play at http://localhost:5173 (teacher view: /teacher.html)
```

- [STATUS.md](STATUS.md): what is done, what is next, known problems. **Update it when you stop.**
- [README.md](README.md): what the game is, commands, folder map.
- [docs/DESIGN_SUMMARY.md](docs/DESIGN_SUMMARY.md): a short paraphrase of the design (the full spec is private).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the code fits together.
- [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md): how to add missions, dialogue, exhibits, label kits, Showdowns, events and maps.
- [docs/ASSETS.md](docs/ASSETS.md): how to add art and audio, and the licence rules.
- [docs/SOURCES.md](docs/SOURCES.md): the historical objects and people, and their sources.
- [CREDITS.md](CREDITS.md): every asset with source, author and licence.

## 2. Rules from the design spec

The design spec is `Knowledge_Guardians_spec_v2.10.md`. The project owner keeps it. **Do not put the spec, or any IB wording from it, in this repository** (the repository is public). The rule IDs below are from the spec. They **must not be broken**:

1. **No runtime AI** (CORE-005). The game never calls an AI model or any generative service. All text is written in advance.
2. **Two save slots only** (section 24): Continue and Checkpoint recovery. A checkpoint moves the old Continue into Recovery.
3. **Permanent credit is separate** (sections 23 and 24). XP and awards live in the permanent record. Loading a save never removes them. Each criterion has a fixed maximum.
4. **No hidden correct answer** (OPEN-001). Every reasoned judgement gets the same permanent credit. Consequences show in the story, not in XP. Hints never lower XP. A label kit needs at least two criteria that can hold.
5. **Play first** (PLAY-001). The player acts on the world (builds a label, argues in a Showdown, follows a thread, forges). Do not add sorting or quiz screens.
6. **The Fray.** A label holds when `force − limit − support ≤ 0`. A label that is too strong for its evidence makes the room glow and visitors repeat a distorted line. Never call it "wrong".
7. **Showdowns** (SHOW-001 to SHOW-004). Arguments in public with crowd trust, links, counterexamples, qualifiers, reframes, concessions, witnesses and sources. A fair concession gains trust. A cheap shot loses trust. Every outcome (exposed, narrowed, split, won-over, lost-ground) gives the same credit.
8. **Two separate labels** (sections 2.2 and 17): `claimKind` (observation, interpretation, value, simulation) and `historicalLabel` (documented, reconstruction, scholarly-interpretation, imagined-alternate, fictional-world). Never mix them. A `documented` record needs a source that supports the narrow claim. Keep qualifiers such as "probably".
9. **Lumen hints have four depths** (section 16) for every objective.
10. **Fair randomness** (RAND-001 to RAND-006). Events come from a seeded deck: no repeats in a chapter, one event in about 10 to 15 minutes of exploration, never during a dialogue or a tool. Luck never takes away credit. **Calm mode** (setting) lets the player delay any event.
11. **Learner profile only as moments** (PROFILE-001). Moments are short notes in the journal. Never a score, grade or bar for one student. The teacher sees class totals only.
12. **Misconception signals** (MISC-001 to MISC-003). Fixed rules on choices, never a model. They never fire on a value choice. Student threshold: 3 in 14 days, then a private reflection. Teacher threshold: 5 in 21 days, or 30% of a class. Every alert says that it may be wrong.
13. **Teacher view** (TEACH-001 to TEACH-005). Formative only, never a mark. Least data. No public ranking of named students. The student shares a progress file by choice.
14. **Portfolio** is private and owned by the student. An entry goes to the teacher only when the student shares it.
15. **No student-made content** (NOMAKE-001) and **no news or current events** (NONEWS-001). `validate.ts` checks for news words in sources.
16. **Weave** (WEAVE-016 to WEAVE-018). Content records list the TOK concepts, ATL skills, areas of knowledge and DP subjects they touch. EE and CAS appear as practice only. Play is never CAS. The game never asks for, stores or suggests a student's own EE question (EE-002).
17. **Cultural care** (section 88). Name people and places with care. Give local names (for example Chomolungma and Sagarmatha). Do not use a culture as a costume. Fictional cultures must not copy a real one.
18. **Content is data.** JSON with the restricted vocabulary in `src/domain/types.ts`. No code in content.
19. **Accessibility** (section 21): every action works with the keyboard. Keep text scaling, reduced motion, reduced effects, high contrast and dyslexia spacing working. Give `altText` for pictures.

## 3. Rules from the project owner

- **Classroom use only, not commercial.**
- **People from many peoples, places and time periods.** Keep the balance when you add people or objects. Treat each people, nation and culture as separate: never group people by continent or region in anything players see. See the table in [docs/SOURCES.md](docs/SOURCES.md).
- **Real historical objects.** Objects must be real, specific, dated and clear. Fictional things (Aethelgard and its people) are `fictional-world`.
- **Free assets only.** CC0 first. CC-BY or OGA-BY only with attribution. No NC or ND licences. Every file in `public/assets/` must be in `public/assets/credits.json` and `CREDITS.md`. `npm run assets:check` checks this.
- **Art direction:** rich, colourful pixel art with lighting. **Never copy** art, characters, music or levels from an existing game.
- **Writing style:** plain, short sentences (Simplified Technical English where possible). Font: Lexend everywhere.
- **Documents:** any `.docx` file uses A4 paper with 1.5 cm margins.
- **Quality goals for every chapter (Mika 2026-11-26).** Check each new feature against all five:
  1. **A branching story where choices matter.** Give real options. A choice must change something later (a line, a path, a person's trust, an ending). Say in the code or content where the effect shows.
  2. **One cohesive, colourful art style.** Rich pixel art with light, in the same palette and scale as the existing maps and sprites. No art that looks like a different game.
  3. **Fitting music and sound.** Each place and task has a sound that fits it (calm for thinking, bright for a win). Never silent, never jarring.
  4. **Distinct characters.** Each person has their own name, background, perspective, way of speaking, and their own quests or side quests. Do not reuse a voice.
  5. **Objects that matter elsewhere.** Every object, keepsake, memento or artefact must be used in another place: a new view, a path, a dialogue option, a trade or a puzzle.
- **Story bible (Mika 2026-11-26).** Read [docs/STORY_BIBLE.md](docs/STORY_BIBLE.md) before you write any scene, person or quest. Use its checklist (section 13). Never reuse a character name. Keep the conflict map (section 15) current when you add a conflict, and check [docs/STORY_ELEMENTS.md](docs/STORY_ELEMENTS.md) (Mika's 150 story elements, adapted) when you plan content. Never make a real religion's God or sacred figures an opponent: use invented in-world patrons, myths and prophecies only.
- **TOK lessons as play, never as school work (Mika 2026-11-26).** Ideas from the TOK lessons become minigames, quests, side quests and character moments. Nothing may feel like a quiz, flashcards, an essay or homework. Adapt ideas into original, fictional mechanics; never copy handout or IB wording into this public repository.

## 4. Code rules

- Game rules go in `src/domain/` only. That folder must not import Phaser or use the DOM. The same applies to `src/teacher/report.ts`.
- The UI and scenes send commands to `GameController`. They do not change state directly.
- If you change `CampaignState`, raise `CAMPAIGN_SCHEMA` (now 4) and add a migration in `src/domain/saves.ts`, with a test. The same for `PERMANENT_SCHEMA` (now 3).
- Do not rename content IDs after release. Saves refer to them.
- Use exact dependency versions in `package.json` (no `^` or `~`).
- TypeScript is strict. `npm run build` must pass.
- Add a test for each new rule or route. `tests/playthrough.test.ts` plays every route of the chapter.

## 5. Before you finish

1. `npm test` passes.
2. `npm run build` passes.
3. `npm run assets:check` passes (if you changed assets).
4. You played the change in the browser (`npm run dev`).
5. You updated the docs that your change affects, and [STATUS.md](STATUS.md).
6. Work on a branch and open a pull request. Do not push to `main`.

## 6. Debug help

In the browser console, `window.kg` gives `{ controller, ui, world, settings }`. Examples:

```js
window.kg.controller.state                                  // current campaign state
window.kg.world.changeMap('aethelgard.emberford', 20, 21)   // go to a map
window.kg.ui.openLabel('pen')                               // open the label builder
window.kg.ui.openForge()                                    // open the forge
```

To clear all saves: `localStorage.clear()` and reload.
