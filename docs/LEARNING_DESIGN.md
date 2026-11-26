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
| Story | 108 | 504 |
| Social | 316 | 670 |
| Explorer, representative case visits | 959 | 2,024 |
| Puzzler | 228 | 592 |
| Cozy | 312 | 667 |

Among 52 chapter traces, 45 cover all 16 dimensions in their first 30 estimated minutes. Four stay complete in every full modeled window. An explorer who visits every filed case has a modeled gap during 4,170 of 5,351 minutes. Longer side trips can leave a dimension behind after the chapter’s main path has covered it.

Hesper’s required handover returns to culture, interpretation and values after the Showdown. The Observatory compares crew names and station records at the same gauges. In Water Commons, the player tracks which leak and intake gave rise to a measured result, and the Market procedure changes what the Water runner can carry. Two Calls After Tuesday asks players to preserve their first proof, return after the readers’ paths change, and check both repairs before somebody uses the result. The last two steps use DOK 4.

Two Circles on the Rail compares how the two copies fit the same pins at minute 8 and fixes one copy where a reader can use it at minute 9. The three tested Nile itineraries that take that stop each cover the full first window. The standard workers-first Nile route now reads the grain delivery and the later stoppage in order, then uses both fixed-load cart runs when preparing a delivery. The workers-first route and its matched-packet variant now reach all sixteen dimensions in their first 30 estimated minutes. The direct Royal Records and Borrowed Mark itineraries still reach the controlled comparison after minute 30. The House of Performance’s gallery-first itinerary uses a checked spoken cue at minute 9, giving it all sixteen dimensions by minute 30. Each of these routes still has later gaps.

1. Add another recurring use of certainty and widen the ways to encounter culture and values before the Nile and Study’s longest opening stretches.
2. Review long side missions against their actual play, adding short new encounters where a framework dimension expires.
3. Repeat the same measurements with fresh and returning players on different routes, including long periods of optional exploration.

The Last Turn now gives Emberford players an optional response to the first gap. In its 91-minute estimated route, players compare the forge and tally desk’s readings at minute 75, decide whose account reaches the market queue at minute 77, and open Derva’s dated account in the Study at minute 87. That trace has culture, interpretation and values in the trailing window from the market decision to the end. Certainty still lapses. The modeled social and explorer routes include this detour. The story route keeps the main steps.

Never add a tag that the play does not support. Add play.

## The 20- and 30-minute opportunity floor

The floor is six different key concepts, two explicitly authored framework parts, one area of knowledge and one optional theme in a rolling window. The report checks 20 and 30 minutes separately. It counts an action when the modeled player completes it, and keeps absent and unrecognized tags visible. The report distinguishes a tag supported by one authored action from a tag supported by multiple actions. Retaking the same action counts once for that comparison. The executable traces also list the gameplay formats used in each opening window. The cumulative first-hour report shows breadth across the five areas and five optional themes as well as the concepts and framework. [Floor implementation](../tools/tok-floor.ts)

```sh
node tools/audit-tok-floor.mjs
npm test -- tests/tok-coverage.test.ts --mode tok-floor
```

The itineraries give the first print and reading-rest decisions extra weight. A carrier and cart driver have different uses for the red mark, and the separate printing sheets let the next worker check how it moved. Hall stewards use the reading-rest register to allocate the next delivery, so the player's choice leaves an unmet request in view. Each of the six modeled openings now meets both first-window floors. In the first estimated hour, each has all 12 concepts and four framework parts, two to four areas of knowledge, and two to three optional themes.

Dov’s Three Doors reaches its registered conclusion after using both host protocols on the counting frame. The Missing Word uses two previews of a fixed toll with different wording before the player enacts the resulting notice. Counting their documented topics reduces the modeled minutes below the floor for the Puzzler from 441 to 404 at 20 minutes and from 381 to 331 at 30. The Cozy route changes from 471 to 433 and from 345 to 295 respectively. [Registry evidence](../src/domain/learningLevels.ts)

The executable chapter report uses the same floor with authored tags from the exact completed objectives. Of 52 traces, 23 meet it in the first 20 minutes and 33 meet it in the first 30. Six sustain it across every 20-minute window and 19 sustain it across every 30-minute window. The latter include twelve Nile, two City of Copies and three Observatory traces. Both Two Shutter Room fittings meet the floor in their opening windows. Each trace has gaps in 23 of its 98 estimated minutes under the 20-minute rule and eight under the 30-minute rule. Later detours still need distinct optional-theme actions and explicitly authored framework work. [Executable chapter tests](../tests/tok-coverage.test.ts)

At the City of Copies, the player lays a press proof over the dated notice, then follows its credit onto a landing copy. Preserving the issue date helps a clerk reconstruct the order of the changes. Pinning the dated clause and the observer’s credit beneath the repeated sentence helps a reader see which day and whose report it covers. Both tested routes meet the floor in every 20- and 30-minute window.

The three executable Observatory Coast traces now have zero gap minutes at both floor widths. Before the correction, the main, bell-slip and menders paths had 16, 14 and 16 minutes below the 20-minute floor, and four, four and six minutes below the 30-minute floor. Players match work names to register names, keep the model’s wind condition with the estimate, repeat the gauge on the same interval, and select which crew receives the signed correction catch. The selected hook accepts a dated blank. The second quay reading stays open. These are author-estimated traces.

The Rim That Slipped adds a choice along the existing Metalworks Sample Yard and Trade Hall route. The fixed chalk marks and same blue sample make the effect of each support separable in the practice model. The dated docket gives the limits of an earlier grey-sample trial. The player uses both kinds of evidence to set a station that serves a particular carrier, then checks the result. The rack gives a causal comparison and the service choice gives a pragmatic one. The two traced variants add nine estimated minutes to their respective comparison routes. Each has seven concepts and three explicit framework parts in the first 20 minutes and all twelve concepts and four parts in the first 30. Both meet the 30-minute opportunity floor in every modeled window. The short staffed-cradle route spends one minute below the 20-minute floor, and the low peg with Turned Tag spends three. The two earlier Metalworks traces remain in the report. [Route and recovery checks](../tests/metal-rim.test.ts) · [Timing cases](../tests/tok-coverage.test.ts)

The rolling audit reports opportunities a route offers at author-estimated times. A first-hour playtest should also record whether students can use a different object as specific evidence, keep a conclusion within its source, and revise it after a reader tests the result. These transfer observations address assessment preparation alongside the coverage counts. [Exhibition and essay habits](TOK_ALIGNMENT.md)
