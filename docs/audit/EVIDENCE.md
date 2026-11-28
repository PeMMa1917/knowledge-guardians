# Audit evidence (measured)

This file holds the numbers that the persona audit uses. Make it again after a content change:

```bash
node tools/audit-personas.mjs --md > /tmp/evidence.md
node tools/audit-personas.mjs --inventory
```

The script reads the whole content pack (`buildPack()`), so it also counts missions and scenes that TypeScript files make. Its word rules are a first filter for a human reviewer, not a judgement. Read a mission before you change it.

The chapter counts and dialogue inventory below come from the 28 November build with the loan loft and the curtain rehearsal. The earlier audit identified repetitive handovers and long quest labels. The new music goals were shortened after the first measurement put them among the fifteen hardest sets of objective titles. Museum names and accession details remain available on the object and in the journal. The counts use all missions that the content pack registers. Whether a student can find or enjoy a particular path needs play observation. [Class and field review](NIGHT_REGISTER.md)

## Play shape and reading load per chapter

A mission may appear in several action columns. “Standard loop” counts titles that name both a comparison and a handover. “Play” counts a short list of words such as play, roll, race and music. A player may experience other kinds of play that the wording misses.

| Chapter | Missions | Standard loop | Share | Fetch | Make | Argue | Play | Explore | Words per step | Long words | Abstract words | With stake |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 128 | 22 | 0.17 | 32 | 26 | 6 | 5 | 38 | 13.3 | 0.05 | 0.04 | 73 |
| 2 | 61 | 9 | 0.15 | 6 | 6 | 3 | 3 | 8 | 14.2 | 0.05 | 0.02 | 43 |
| 3 | 59 | 10 | 0.17 | 7 | 6 | 0 | 2 | 5 | 14.6 | 0.07 | 0.02 | 47 |
| 4 | 56 | 7 | 0.13 | 10 | 2 | 0 | 3 | 12 | 14.6 | 0.05 | 0.02 | 47 |
| 5 | 54 | 6 | 0.11 | 10 | 5 | 1 | 4 | 13 | 15 | 0.08 | 0.02 | 47 |
| 6 | 48 | 5 | 0.1 | 5 | 11 | 0 | 3 | 8 | 15.7 | 0.05 | 0.02 | 41 |
| 7 | 58 | 12 | 0.21 | 12 | 7 | 0 | 15 | 8 | 14 | 0.07 | 0.04 | 48 |
| 8 | 51 | 6 | 0.12 | 4 | 1 | 1 | 4 | 5 | 15.7 | 0.05 | 0.01 | 46 |
| 9 | 63 | 13 | 0.21 | 4 | 8 | 1 | 2 | 7 | 14.9 | 0.07 | 0.02 | 54 |
| 10 | 48 | 3 | 0.06 | 8 | 4 | 0 | 3 | 6 | 15.2 | 0.05 | 0.02 | 41 |
| 11 | 46 | 8 | 0.17 | 9 | 8 | 1 | 4 | 7 | 14.8 | 0.07 | 0.03 | 41 |
| 12 | 45 | 6 | 0.13 | 2 | 3 | 2 | 3 | 9 | 14.6 | 0.05 | 0.03 | 41 |
| 13 | 53 | 4 | 0.08 | 10 | 6 | 2 | 1 | 8 | 16.5 | 0.09 | 0.02 | 43 |
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

Dialogue: 8161 scenes, about 329500 words, 453 speakers.

Most frequent work words in dialogue (times used): slip 1183, fold 875, bell 831, rail 626, strip 408, runner 408, peg 338, receipt 225, tag 181, sleeve 170, crate 131, rack 114, tally 92, docket 61.

Scenes per speaker, core cast: warden-ise 93, kip-arden 50, smith-hesper 80, scholar-sefa 35, rook-tamsin 14, vesper-quill 34, lumen 6.

Scenes per speaker, five busiest: field-store-aven 293, reference-line-noll 241, ferry-window-merrit 217, correspondence-ansel 204, ferry-window-nessa 178.

Showdowns: 7. Puzzles: 15.

## Other facts the audit uses

| Fact | Value | Where to check |
| --- | --- | --- |
| Missions in the pack | 847 missions and 3,902 objectives | [Live inventory](../../tools/audit-personas.mjs) |
| Field games | 1,200 stands in 118 rooms use 1,143 field-game IDs. Different editions and receiving stations can share a mechanic. | [Live map inventory](../../tools/audit-personas.mjs) |
| Side puzzles | 15 entries in the original word-puzzle bank, with dedicated puzzle stands in two rooms. Other playable puzzles also use instruments and map scenes. | `src/content/puzzles.json` |
| Showdowns | 7 registered showdowns | `showdowns` in the pack |
| Music | 3 recorded loops plus one synthesised score per world | `public/assets/audio/music`, `src/domain/campaignScore.ts` |
| Network use | The static game serves its assets and can open reader-selected source links. When class hosting is configured and a student opts into a class adventure, the approved class service receives recovery data, diary writing and labelled drafts. | [Hosting design](../ACCOUNTS_AND_HOSTING.md) |
| Saves | Local play uses browser storage. Class play can recover text and progress across devices. Student photos stay on the originating device. Separate portfolio entries retain their own sharing controls. | [Recovery and audience](../ACCOUNTS_AND_HOSTING.md) |
| Accessibility settings | text scale, reduced motion, reduced effects, high contrast, dyslexia spacing, calm mode, zen mode, glossary, read aloud, colour-safe marks, captions, key remapping | `src/app/settings.ts` |
| Languages | English only | |
| Production bundle | about 2.46 MB gzip for the largest main JavaScript chunk in the 27 November review build, plus other chunks and assets | `docs/PLAYTEST_PRIORITIES.md` |
