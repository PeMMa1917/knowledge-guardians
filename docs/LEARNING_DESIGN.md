# Learning design: concepts, framework and levels of thinking

Mika's rule (2026-11-26): the 12 TOK key concepts and the four parts of the knowledge framework must show up very often, in varied ways, in every part of the game. The thinking each encounter asks for must vary: Webb's depth of knowledge (DOK), Bloom's levels, Fink's dimensions of significant learning, and SOLO levels. Students never see these tags, and nothing in the game is an exam. Developer tests are fine.

## Where the tags live

| Content | Concepts | Framework parts | Levels and minutes |
|---|---|---|---|
| Mission objectives (JSON) | `weave.concepts` | `weave.framework`, else inferred from concepts | `weave.thinking` and `weave.minutes` |
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

`src/domain/learningPaths.ts` builds five estimated play-style paths through all 15 chapters. The story route follows main steps. The social route favours hearth conversations, loyalty and conflicts between people or groups. The explorer route visits side missions and tries a separately authored case in each repeatable collection. The puzzler route prioritises tools and puzzles. The cozy route combines hearth, field games and lighter crossings. The full explorer itinerary goes through every registered collection case. Both explorer itineraries appear in the report. Minutes come from author estimates.

`tests/learning.test.ts` counts an encounter at its estimated completion. The trailing window excludes its starting boundary and includes its ending boundary. The audit checks every point where coverage can change, then totals the duration with a missing dimension. It also lists framework parts supported only by inference, dimensions supported by only one distinct action, and steps with missing action or thinking tags. The tests require all 16 dimensions in the first half hour and track a separate gap budget for later play.

```
npx vitest run tests/learning.test.ts --mode tok-report
```

The route audit in `tests/tok-coverage.test.ts` exercises game actions in individual chapters, with earlier prerequisites staged for later chapters. The Explorer model now places missions with explicit late prerequisites after the required revision. That means the signed Island dock log comes before the fair, and the opening-directions revision comes before Elsbet’s recordings. The campaign models and the route audit use author estimates. Student playtests are needed to establish real timing and variation.

**26 November 2026.** All five modeled openings reach the 12 concepts and four explicitly tagged framework parts in 30 estimated minutes. The social model includes Kip’s case. The explorer, puzzler and cozy models use the date rails, ferry print and reading rests. Later gap time is still substantial. The denominator is each model’s total estimated play time.

| Path | Minutes with a gap | Total minutes |
|---|---:|---:|
| Story | 132 | 504 |
| Social | 322 | 663 |
| Explorer, representative case visits | 790 | 1,777 |
| Puzzler | 232 | 592 |
| Cozy | 314 | 667 |

The longest clusters start after the Nexus opening across Chapters 1 and 2. Later longer detours can leave a dimension behind even when the chapter’s main story has covered it. Focus the next round on these stretches.

1. Chapter 1 from the Showdown to the study: add culture, interpretation and values beats to the Emberford steps.
2. Review the tags of side missions against their dialogue, and add the concepts that the play really uses.
3. Single-concept gaps in chapters 4 to 14 (for example culture in chapter 4, certainty in chapters 10 and 11): add one short beat each, not a tag.

Never add a tag that the play does not support. Add play.
