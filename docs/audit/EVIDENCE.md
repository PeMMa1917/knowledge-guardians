# Audit evidence (measured)

This file holds the numbers that the persona audit uses. Make it again after a content change:

```bash
node tools/audit-personas.mjs --md > /tmp/evidence.md   # then paste the tables below
```

The script reads the whole content pack (`buildPack()`), so it also counts missions and scenes that TypeScript files make. Its word rules are a first filter for a human reviewer, not a judgement. Read a mission before you change it.

Measured on 26 November 2026, branch `claude/project-thread-xnvpyf` (from `feat/tok-gameplay-weave` at `dbc2aab`). 2,263 tests passed before the audit.

## Play shape and reading load per chapter

"Standard loop" means a mission whose steps both compare two things and leave a result for someone. "Play" means a step that names a game action (play, roll, race, dig, guess, rounds, music). A mission can count in more than one column.

| Chapter | Missions | Standard loop | Share | Fetch | Make | Argue | Play | Explore | Words per step | Long words | Abstract words | With stake |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 94 | 16 | 0.17 | 23 | 20 | 6 | 4 | 26 | 12.2 | 0.06 | 0.05 | 37 |
| 2 | 31 | 8 | 0.26 | 5 | 6 | 1 | 1 | 5 | 11.6 | 0.06 | 0.05 | 13 |
| 3 | 25 | 9 | 0.36 | 5 | 5 | 0 | 2 | 4 | 11.2 | 0.09 | 0.06 | 14 |
| 4 | 24 | 6 | 0.25 | 7 | 1 | 0 | 1 | 9 | 11.5 | 0.06 | 0.06 | 15 |
| 5 | 20 | 3 | 0.15 | 6 | 4 | 1 | 2 | 9 | 11.7 | 0.11 | 0.05 | 14 |
| 6 | 15 | 4 | 0.27 | 4 | 7 | 0 | 2 | 5 | 12.2 | 0.06 | 0.06 | 8 |
| 7 | 25 | 8 | 0.32 | 10 | 5 | 0 | 2 | 4 | 11.9 | 0.09 | 0.06 | 15 |
| 8 | 16 | 3 | 0.19 | 2 | 1 | 1 | 2 | 3 | 11.6 | 0.07 | 0.04 | 11 |
| 9 | 22 | 7 | 0.32 | 1 | 5 | 0 | 0 | 3 | 12.6 | 0.08 | 0.06 | 14 |
| 10 | 14 | 2 | 0.14 | 4 | 1 | 0 | 2 | 4 | 11 | 0.06 | 0.06 | 7 |
| 11 | 18 | 6 | 0.33 | 7 | 8 | 1 | 2 | 4 | 12.2 | 0.09 | 0.06 | 13 |
| 12 | 15 | 4 | 0.27 | 1 | 1 | 2 | 2 | 6 | 11 | 0.06 | 0.07 | 11 |
| 13 | 16 | 3 | 0.19 | 5 | 4 | 1 | 1 | 5 | 12.1 | 0.09 | 0.06 | 6 |
| 14 | 14 | 3 | 0.21 | 3 | 2 | 0 | 4 | 4 | 12 | 0.05 | 0.04 | 8 |
| 15 | 11 | 3 | 0.27 | 2 | 4 | 0 | 1 | 2 | 11.5 | 0.06 | 0.07 | 5 |

## Hardest objective steps to read

These missions have the largest share of long words (three or more syllables) and of abstract work nouns (record, display, route, check, slip, proof, and others) in their step titles.

- Ch 5 `KG-CH5-R02` Names in the Notebook (long 0.25, abstract 0.25)
- Ch 10 `KG-CH10-R31` The Market Borrows a Reference (long 0.14, abstract 0.29)
- Ch 2 `KG-CH2-R08` The Reading Window (long 0.17, abstract 0.17)
- Ch 2 `KG-CH2-R17` The Lane Through the Model (long 0.2, abstract 0.13)
- Ch 7 `KG-CH7-R02` Two Lines Back (long 0.11, abstract 0.22)
- Ch 8 `shore-reply` The Reply from Shore (long 0.24, abstract 0.08)
- Ch 8 `KG-CH8-R24` The Address for the Question (long 0.2, abstract 0.1)
- Ch 9 `KG-CH9-R31` The Caller and the Check (long 0.15, abstract 0.15)
- Ch 13 `KG-CH13-R05` The Bench at the Turning (long 0.19, abstract 0.1)
- Ch 1 `KG-CH1-R58` A Name on the Load (long 0.15, abstract 0.14)
- Ch 7 `KG-CH7-R42` Which Part of the Letter Travels? (long 0.22, abstract 0.07)
- Ch 15 `KG-CH15-R06` Eleven at the Council (long 0.14, abstract 0.14)
- Ch 4 `KG-CH4-R04` One Yard, Two Ways (long 0.09, abstract 0.18)
- Ch 15 `second-reading` The Second Reading Store (long 0.22, abstract 0.05)
- Ch 3 `earlier-viewing-repair-and-memory` The bench that holds a family’s record (long 0.27, abstract 0)

## Dialogue texture

Dialogue: 5109 scenes, about 214600 words, 164 speakers.

Most frequent work words in dialogue (times used): slip 1060, bell 692, rail 566, strip 348, runner 338, peg 309, fold 283, receipt 187, tag 157, sleeve 127, rack 113, crate 105, tally 62, docket 56.

Scenes per speaker, core cast: warden-ise 49, kip-arden 36, smith-hesper 72, scholar-sefa 35, rook-tamsin 14, vesper-quill 21, lumen 3.

Scenes per speaker, five busiest: field-store-aven 293, reference-line-noll 241, ferry-window-merrit 217, correspondence-ansel 204, ferry-window-nessa 178.

Showdowns: 3. Puzzles: 15.

**Caution.** Companion lines also come from other systems (Hearth talks in `src/domain/hearth.ts`, banter, letters in `src/domain/letters.ts`, loyalty missions in `src/domain/loyalty.ts`, world-memory lines in `src/content/chapter-voices.json`). The scene counts above count dialogue scenes only. They still show the balance: the people who speak most are keepers of specimen rooms, and they speak in the same procedural voice.

## Other facts the audit uses

| Fact | Value | Where to check |
| --- | --- | --- |
| Missions in the pack | 360 | `buildPack().missions` |
| Field games | 9; 7 of them at Emberford or the ferry landing (chapter 1) | `src/domain/fieldgames.ts` |
| Side puzzles | 15, all in chapter 1 places | `src/content/puzzles.json` |
| Showdowns | 3 (two in chapter 1, Vesper in chapter 9) | `showdowns` in the pack |
| Music | 3 recorded loops plus one synthesised score per world | `public/assets/audio/music`, `src/domain/campaignScore.ts` |
| Network use | None in game code. Links to museums and encyclopedia pages open only when the player clicks them. | `grep -rn "fetch(" src` |
| Saves | Browser storage only (`kg.slots`, `kg.permanent`, `kg.settings`) | `docs/ARCHITECTURE.md` |
| Accessibility settings | text scale, reduced motion, reduced effects, high contrast, dyslexia spacing, calm mode, zen mode, glossary, read aloud, colour-safe marks, captions, key remapping | `src/app/settings.ts` |
| Languages | English only | |
| Production bundle | about 2.1 MB gzip | `docs/PLAYTEST_PRIORITIES.md` |
