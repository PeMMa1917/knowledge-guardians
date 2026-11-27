# Audit evidence (measured)

This file holds the numbers that the persona audit uses. Make it again after a content change:

```bash
node tools/audit-personas.mjs --md > /tmp/evidence.md   # then paste the tables below
```

The script reads the whole content pack (`buildPack()`), so it also counts missions and scenes that TypeScript files make. Its word rules are a first filter for a human reviewer, not a judgement. Read a mission before you change it.

The chapter counts and dialogue inventory below come from the 27 November review build after the cocoa cart and its two stops were added. The earlier audit identified repetitive handovers and long quest labels. The new music goals were shortened after the first measurement put them among the fifteen hardest sets of objective titles. Museum names and accession details remain available on the object and in the journal. The counts use all missions that the content pack registers. Whether a student can find or enjoy a particular path needs play observation. [Class and field review](NIGHT_REGISTER.md)

## Play shape and reading load per chapter

A mission may appear in several action columns. “Standard loop” counts titles that name both a comparison and a handover. “Play” counts a short list of words such as play, roll, race and music. A player may experience other kinds of play that the wording misses.

| Chapter | Missions | Standard loop | Share | Fetch | Make | Argue | Play | Explore | Words per step | Long words | Abstract words | With stake |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 128 | 22 | 0.17 | 32 | 26 | 6 | 5 | 38 | 13.3 | 0.05 | 0.04 | 73 |
| 2 | 61 | 9 | 0.15 | 6 | 6 | 3 | 3 | 8 | 14.2 | 0.05 | 0.02 | 43 |
| 3 | 59 | 10 | 0.17 | 7 | 6 | 0 | 2 | 5 | 14.6 | 0.07 | 0.02 | 47 |
| 4 | 55 | 6 | 0.11 | 9 | 2 | 0 | 3 | 11 | 14.8 | 0.05 | 0.03 | 46 |
| 5 | 54 | 6 | 0.11 | 10 | 5 | 1 | 4 | 13 | 15 | 0.08 | 0.02 | 47 |
| 6 | 48 | 5 | 0.1 | 5 | 11 | 0 | 3 | 8 | 15.7 | 0.05 | 0.02 | 41 |
| 7 | 58 | 12 | 0.21 | 12 | 7 | 0 | 15 | 8 | 14 | 0.07 | 0.04 | 48 |
| 8 | 51 | 6 | 0.12 | 4 | 1 | 1 | 4 | 5 | 15.7 | 0.05 | 0.01 | 46 |
| 9 | 62 | 12 | 0.19 | 3 | 7 | 1 | 2 | 6 | 15 | 0.07 | 0.02 | 53 |
| 10 | 48 | 3 | 0.06 | 8 | 4 | 0 | 3 | 6 | 15.2 | 0.05 | 0.02 | 41 |
| 11 | 46 | 8 | 0.17 | 9 | 8 | 1 | 4 | 7 | 14.8 | 0.07 | 0.03 | 41 |
| 12 | 44 | 6 | 0.14 | 2 | 3 | 2 | 3 | 8 | 14.7 | 0.05 | 0.03 | 40 |
| 13 | 52 | 3 | 0.06 | 10 | 5 | 2 | 1 | 7 | 16.6 | 0.09 | 0.02 | 42 |
| 14 | 46 | 4 | 0.09 | 4 | 3 | 0 | 6 | 7 | 16.2 | 0.05 | 0.01 | 40 |
| 15 | 31 | 4 | 0.13 | 4 | 4 | 0 | 8 | 3 | 15.6 | 0.06 | 0.03 | 25 |

## Hardest objective steps to read

These missions have the highest combined shares of longer words and abstract work nouns in their objective titles.

- Ch 5 `KG-CH5-R02` Names in the Notebook (long 0.25, abstract 0.25)
- Ch 10 `KG-CH10-R31` The Market Borrows a Reference (long 0.14, abstract 0.29)
- Ch 7 `KG-CH7-R02` Two Lines Back (long 0.11, abstract 0.22)
- Ch 8 `shore-reply` The Reply from Shore (long 0.24, abstract 0.08)
- Ch 8 `KG-CH8-R24` The Address for the Question (long 0.2, abstract 0.1)
- Ch 7 `KG-CH7-R42` Which Part of the Letter Travels? (long 0.23, abstract 0.07)
- Ch 9 `KG-CH9-R31` The Caller and the Check (long 0.15, abstract 0.15)
- Ch 13 `KG-CH13-R05` The Bench at the Turning (long 0.19, abstract 0.1)
- Ch 1 `KG-CH1-R58` A Name on the Load (long 0.15, abstract 0.14)
- Ch 15 `KG-CH15-R06` Eleven at the Council (long 0.14, abstract 0.14)
- Ch 4 `KG-CH4-R04` One Yard, Two Ways (long 0.09, abstract 0.18)
- Ch 11 `KG-CH11-LOWER-RAIL` The Lower Rail at the Weir (long 0.09, abstract 0.18)
- Ch 15 `second-reading` The Second Reading Store (long 0.22, abstract 0.05)
- Ch 3 `earlier-viewing-repair-and-memory` The bench that holds a family’s record (long 0.27, abstract 0)
- Ch 9 `KG-CH9-R92` The Room of Story Voices (long 0.13, abstract 0.14)

## Dialogue texture

Dialogue: 8125 scenes, about 327900 words, 450 speakers.

Most frequent work words in dialogue (times used): slip 1180, fold 873, bell 831, rail 624, strip 406, runner 406, peg 338, receipt 225, tag 181, sleeve 167, crate 131, rack 114, tally 92, docket 61.

Scenes per speaker, core cast: warden-ise 93, kip-arden 50, smith-hesper 80, scholar-sefa 35, rook-tamsin 14, vesper-quill 34, lumen 6.

Scenes per speaker, five busiest: field-store-aven 293, reference-line-noll 241, ferry-window-merrit 217, correspondence-ansel 204, ferry-window-nessa 178.

Showdowns: 7. Puzzles: 15.

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
