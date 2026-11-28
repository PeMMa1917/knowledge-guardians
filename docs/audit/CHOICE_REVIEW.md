# Reviewing a choice in the room where it happens

The 28 November checkpoint indexes 12,790 choices and 8,314 placed interactions. All choices have a room entrance in the graph. The 84 simulated perspectives produce 1,772,736 possible choice or placement inspections. The reader links an option to its guard, dialogue destination and later map readers so a reviewer can play the particular case. [Current audit](ELEMENTS_CHECKPOINT.md)

### Earlier replay at 86e04e2

Revision 86e04e2 has 12,403 individual dialogue options under review. Each has at least one entrance through a room, a character, a scene, a field station or an event available on that map. The graph includes acquired keepsakes and the generated exit a player can use while a keepsake is offered. It also indexes 8,180 placed interactables across 155 rooms. A station is counted once per placement. Internal controls in a station can have additional pathways.

The replay entered every one of the 12,403 source nodes for the selected options, chose the option through the engine and verified its exact destination. It checked all 6,876 conditional options when their condition held and when it failed. Denied choices left the flags and permanent awards alone. Every opening produced a diary entry. All 12,374 deliberate choices also produced their own entries. The remaining 29 were navigation controls for leaving a keepsake conversation. A separate scan found no simultaneously selectable, identically labelled options among the same-node pairs for which the fixture builder could produce a witness.

Each record retains the speaker, exact option, entry condition, reply, written values, possible receiving map objects and physical stations. A map reader consults a value. Additional conditions can determine whether the object actually appears in a particular save. These replays stage the local conditions for an action. Some field panels dispatch a choice directly. For those panels, the replay exercises the authored dialogue node, while a visit in a browser establishes which words and controls the player actually sees. Continuous walks, physical devices, screen readers and actual learners supply different evidence. [Rehearsal](../../tools/choice-rehearsal.mjs) · [Browser checks](../BROWSER_CHECKS.md)

## The 84 review profiles

The profile file includes the requested student, teacher, subject specialist, curriculum, accessibility, technical, creative and cultural perspectives and twelve play preferences. One additional heading points back to two existing reviewers. The audit pairs all 84 substantive profiles with 12,403 choices and 8,180 placements, giving 1,728,972 inspectable review records. Each brings a distinct playtest probe, a grounded strength, a possible concern and a proposed response if someone observes that concern. These are simulated inspections. They establish neither approval from the IB or a named community nor findings from interviews or tested learning gains. [Profile descriptions](PERSONAS.md) · [Review questions](../../tools/review-choice-perspectives.mjs)

## Inspecting the evidence

From the project root, these examples show the same archive action through two perspectives, all gated choices for a returning understudy, and the stations in a particular chapter.

```sh
node tools/audit-choice-paths.mjs --mode dialogue --action 'tail.cold#0' --persona I1 --format md
node tools/audit-choice-paths.mjs --mode dialogue --action 'tail.cold#0' --persona B3 --format md
node tools/audit-choice-paths.mjs --mode dialogue --chapter 9 --speaker optics-nim
node tools/audit-choice-paths.mjs --mode station --chapter 6 --persona J1 --limit 8 --format md
node tools/audit-choice-paths.mjs --mode readers --action 'tail.cold#0'
node tools/audit-choice-paths.mjs --mode exercise --errors-only
node tools/audit-choice-paths.mjs --mode collisions
node tools/audit-choice-paths.mjs --mode matrix
node tools/audit-choice-paths.mjs --mode personas
```

JSON Lines output can be streamed by room, speaker, chapter, individual option and profile. The chapter reports each carry a specific choice, its human stakes and a distinct stress test. The disagreements cover who can reasonably settle an issue. [Chapter files](chapters) · [Consensus](CONSENSUS.md) · [Decisions on conflicting requests](DECISIONS.md)

## A copy for a reviewer

Run `node tools/export-choice-review.mjs "Knowledge Guardians - Choice Review.html"` from the project root. Open the resulting HTML to read it offline. Search for a line or a character, select a chapter and room, and compare two perspectives on the same choice. The address remembers the selection on refresh. Printing includes the selected encounter and both reviews. Each concern remains a question for observation or consultation. [Review reader](../../tools/export-choice-review.mjs)

## Four decisions that affect the same player differently

| Decision | A reason to choose it | A reason to choose differently | How the game handles both interests |
| --- | --- | --- | --- |
| Leave a dispatch sleeve closed | The late shift can follow the drawer without disclosing its contents | A researcher may want to inspect the original mark | Nima offers a movement record. The provenance of a private detail remains an open question. |
| Use an entrance cue tonight | Nim and the audience can go on with the show | Huygens can learn more from a seat where two forecasts differ | The player can try another edition, revisit the stage and hear the other response. |
| Put a name on a class leaderboard | Some students want recognition for a particular achievement | Others want feedback without their username appearing in the class ranking | Publication, metric, time period and withdrawal have explicit controls. |
| Show evidence of developing writing | The assigned teacher can help before a draft is complete | A student needs to know the audience before beginning and may prefer local play | The class editor gives advance notice, draft labels and recovery. Local play and portfolio sharing retain their own rules. |
