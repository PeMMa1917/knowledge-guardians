# Learning design: concepts, framework and levels of thinking

Mika's rule (2026-11-26): the 12 TOK key concepts and the four parts of the knowledge framework must show up very often, in varied ways, in every part of the game. The thinking each encounter asks for must vary: Webb's depth of knowledge (DOK), Bloom's levels, Fink's dimensions of significant learning, and SOLO levels. Students never see these tags, and nothing in the game is an exam. Developer tests are fine.

## Where the tags live

| Content | Concepts | Framework parts | Levels and minutes |
|---|---|---|---|
| Mission objectives (JSON) | `weave.concepts` | `weave.framework`, else derived from the concepts | `weave.minutes`, else estimated |
| Crossings, hearth talks, field games, loyalty missions | `LEARN` in `src/domain/learningLevels.ts` | same | same |

Framework parts: `scope`, `perspectives`, `methods-and-tools`, `ethics`. When an objective does not list them, `frameworkFromConcepts` derives them (methods and tools from evidence, objectivity, explanation and justification; perspectives from perspective, culture and interpretation; ethics from values, responsibility and power; scope from truth and certainty). Add explicit parts when the play says more than the rule.

## How to vary the levels

Use a different rung for each encounter in a chapter, and climb across a chapter:

| Level set | Low | Middle | High |
|---|---|---|---|
| DOK | 1: notice or recall (read the flood post) | 2: use a method (brush, measure, roll) | 3: reason with evidence (compare two pictures); 4: extended, many sources over time (the night surge, the Lady of Fair Measure) |
| Bloom | remember, understand | apply, analyse | evaluate, create |
| Fink | foundational knowledge | application, integration | human dimension, caring, learning how to learn |
| SOLO | unistructural | multistructural | relational, extended abstract |

A funny scene can be high level (the goat asks how memory fills gaps), and a serious one can be low (a farewell remembers). Do not make every hard moment serious.

## The 30-minute design audit

`src/domain/learningPaths.ts` builds five estimated play-style paths through all 15 chapters: **story** (main steps only), **social** (hearth, loyalty, person and society crossings), **explorer** (every crossing and side mission), **puzzler** (field games, technology and fate crossings, puzzle lamps) and **cozy** (hearth, field games, lighter crossings). Minutes are design estimates, not measurements.

`tests/learning.test.ts` checks each path: every 30 estimated minutes should meet all 12 concepts and all four framework parts. The test keeps a budget of windows that still miss something. The budget may only go down. To see each gap:

```
npx vitest run tests/learning.test.ts --mode tok-report
```

The older route audit (`tests/tok-coverage.test.ts`) runs real actions for the first visit to each chapter and reports gaps in the same way.

**Gaps today (2026-11-26):** story 36, social 63, explorer 130, puzzler 47, cozy 63 windows. Most gaps are in chapter 1 (between the Showdown and the lamps) and in side missions with only one or two concepts tagged. Some objectives are tagged more thinly than their play. Fix order:

1. Chapter 1 from the Showdown to the study: add culture, interpretation and values beats to the Emberford steps.
2. Review the tags of side missions against their dialogue, and add the concepts that the play really uses.
3. Single-concept gaps in chapters 4 to 14 (for example culture in chapter 4, certainty in chapters 10 and 11): add one short beat each, not a tag.

Never add a tag that the play does not support. Add play.
