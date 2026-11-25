# Content guide

This guide tells you how to add or change game content: missions, objectives, dialogue, exhibits, evidence cards, sources, hints, label kits, Showdowns, threads, events, moments, misconceptions, portfolio templates, items, awards and maps.

**Rule:** after each change, run `npm test`. The content tests find broken references, missing sources and missing hints. Do not merge content that fails the tests.

## Files

| File | Holds |
|---|---|
| `src/content/sources.json` | Historical source records (`HIS-S…`). |
| `src/content/common.json` | Items, characters, credit criteria, awards, shop offers, learner-profile moments, misconceptions, portfolio templates. |
| `src/content/firsts.json` | The Hall of Firsts: seven plaques (exhibits, cards and small label kits) about people from every continent. |
| `src/content/m01-nexus.json` | Mission KG-CH1-M01 "Three Firsts" (The Nexus): label kit `pen`, Showdown `practice`, events EV-N01 to EV-N07. |
| `src/content/m02-aethelgard.json` | Mission KG-CH1-M02 "The Label on the Blade" (Emberford): thread `blade`, Showdown `corvan`, events EV-E01 to EV-E08. |
| `src/content/index.ts` | Joins the JSON files into one content pack. **Add a new file to `parts` here.** Raise `CONTENT_VERSION` when content changes in a way that saves notice. |
| `src/maps/*.ts` | Map layouts. Register a new map in `src/maps/index.ts`. |

All record types are in `src/domain/types.ts`. Each field has a comment.

**Generators.** Some content files were first made with small Python scripts. The JSON files in `src/content/` are now the source of truth. Edit them directly.

## IDs

- Use stable, readable IDs: `card.loud-patent`, `m02.o3.evidence`, `hesper.start`, `HIS-S14`, `OBJ-001-A`.
- **Do not rename an ID after release.** Saves and permanent credit refer to IDs. If you must rename, add a save migration (see [ARCHITECTURE.md](ARCHITECTURE.md#saves-spec-section-24)).

## Two labels on every claim

The spec uses two separate labels. Do not mix them.

1. `claimKind`: what kind of claim the text makes. `observation`, `interpretation`, `value` or `simulation`.
2. `historicalLabel`: the status of the material. `documented`, `reconstruction`, `scholarly-interpretation`, `imagined-alternate` or `fictional-world`.

Rules for `historicalLabel`:

- `documented` needs at least one source in `sources` (the validator checks this). The source must support the **narrow** claim, not a larger one.
- Keep qualifiers from the source. If a museum says "probably eighteenth century", write "probably".
- Fictional places and people in Aethelgard are `fictional-world`. A fictional thing must never look like a historical record.

## Add a historical object (exhibit)

1. Find a specific, dated object in a public collection record or a primary document (a museum object page, a patent). Mika's rule: real, specific, time-bound, clear.
2. Add a source to `sources.json`: `id`, `title`, `url` (https), `locator` (which part), `supports` (the exact narrow claim), `accessed` (date).
3. Add the exhibit to the mission file: `id`, `name`, `art`, `historicalLabel`, `dateText`, `dateKind` (what the date describes), `summary`, `sources`, `grantsCard`, `altText`.
4. Add the evidence card it gives (`cards`), with `limits` (what the card does **not** show).
5. Add the art key. Draw it in `src/ui/illustrations.ts` (original pixel art in code) or use a credited asset. Do not copy museum photographs unless the record gives an open licence; then credit it in `CREDITS.md` and `public/assets/credits.json`.
6. Place it on a map as an `interactable` of kind `exhibit`.
7. Add the object to [SOURCES.md](SOURCES.md).

## Add a mission or objective

```jsonc
{
  "id": "m03.o1.example",
  "title": "Talk to the archivist.",          // shown in the tracker
  "essential": true,
  "visible": { "objective": "m02.o6.report" }, // optional
  "done": { "flag": "talked.archivist", "eq": true },
  "onComplete": [ { "journal": "j.m03.start" }, { "checkpoint": "Met the archivist" } ]
}
```

- Every objective **must** have hints at depths 1, 2, 3 and 4 (spec section 16). Depth 1 is a gentle nudge. Depth 4 tells the player exactly what to do. Hints never lower XP.
- Put a `checkpoint` effect at safe points. A checkpoint moves the old Continue save to Recovery.
- **No hidden correct answer** (OPEN-001). When the player makes a judgement (a label, a decision), every reasoned choice gets the same permanent credit. Show consequences in the story, not in XP. `tests/playthrough.test.ts` checks that all routes give equal XP. Add your new routes to that test.

## Add dialogue

```jsonc
{
  "id": "archivist.start",
  "speaker": "archivist",
  "text": "What do you want to know?",
  "claimKind": "observation",
  "options": [
    { "text": "Ask for a source.", "tag": "Ask for a source", "next": "archivist.source" },
    { "text": "Buy a copy (3 marks).", "if": { "marks": 3 },
      "effects": [ { "addMarks": -3 }, { "giveItem": "item.copy" } ], "next": null }
  ]
}
```

- Connect the character to the node with a `talk` entry in `common.json`. The first entry whose `if` holds is used.
- Players choose options with number keys. Keep option text short.
- No runtime AI. All text is written in advance. 

## Weave tags (WEAVE-016 to WEAVE-018)

Most records have a `weave` field: `{ "concepts": [...], "atl": [...], "aoks": [...], "subjects": [...] }`. The IDs are in `src/domain/curriculum.ts`. The game counts these when the player meets them, and the teacher view shows the totals. Tag only what the play really touches. A lucky event (`"luck": true`) has empty tags. EE and CAS appear as practice only. Never say that play counts as CAS.

## Add a label kit (the label builder and the Fray)

A label kit (`labelKits`) is a museum label that the player builds from parts: a **subject**, a **criterion** (what the subject was "first" at), a **limit** (a qualifier), and **support cards**.

- Each criterion has a `force` (how much it claims). Each limit has `lower`. Each support gives `weight` per card that the player holds.
- The label holds when `force − limit − support ≤ 0`. Otherwise the gap shows as the Fray: the room glows and visitors repeat a distorted line (`weak.tooStrong` or `weak.noSupport`, or the support's own `weak` line).
- OPEN-001: at least two criteria must be able to hold. The validator checks this. All held labels give the same credit (`onHold`, which applies only the first time).
- A criterion or support can have `signal` (a misconception ID). Use this for a pattern of reasoning, never for a value.
- Put the kit on a map as an interactable with `kit`. To open it from dialogue, use `"open": "label:<kit id>"`.

## Add an EE practice trail (spec 92.2)

A trail is an optional mission (see `src/content/ee-trails.json`) with seven steps: narrow the question at a **Title Lock**, plan the search, weigh sources, build an argument with a counterclaim, cite, find integrity problems in a practice draft, and reflect.

- A **Title Lock** (`locks`) has rings (`parts`). Each option has `ok` and, when it is not ok, a `why` line. The question is the option texts joined in order. At least two questions must open the lock (OPEN-001). Put it on a map as an interactable of kind `lock`, or open it from dialogue with `"open": "lock:<id>"`.
- The argument step reuses a label kit. Set `"sentence": true` and `legends` so the panel says "claim" and "counterclaim" instead of "label" and "limit".
- EE-001: put the trail near a DP subject (`subject`). EE-002: the topic is authored. **Never** ask for, store or suggest the student's own research question or essay text.
- EE-003: credit and the teacher report show the trail as practice only.

## Add a Showdown

A Showdown (`showdowns`) is a public argument. See `ShowdownRecord` in `types.ts`.

- The opponent's claim has `links` (supports that a card can crack, with a one-line reason each way), `counterexamples`, a `narrowed` claim and a `sourceReply`.
- `playerClaims` are the claims the player can make. A claim with too much force for its supports loses crowd trust.
- `witnesses` can speak if their condition holds. `fairPoints` are fair things the opponent says. Conceding a fair point **gains** trust (SHOW-002).
- `script` is the opponent's moves, in order. `outcomes` has text and effects for each of the five outcomes. All five give the same credit. Show the difference in the world (for example the Emberford sign).
- Set `dodgeSignal` (usually `MIS-36`) to signal when the player answers an open fair point with a shout or a cheap shot.
- Set `valueShowdown: true` when the disagreement is about values. Then a split is a stable outcome.
- Open it from dialogue with `"open": "showdown:<id>"`. Add the routes to `tests/playthrough.test.ts`.

## Add a Provenance Thread

A thread (`threads`) is a chain of nodes on maps. The player visits each node with the thread tool. After the node in `gap.after`, the thread stops at a gap: the record does not go further. `limit` says what the thread cannot show (LENS-001). Place each node on a map as an interactable of kind `thread` with `thread` and `node`.

## Add a random event (RAND-001 to RAND-006)

An event (`events`) is a short scene from the seeded deck. Give `deckId` (the spec event it adapts), `type`, the `maps` where it can happen, a dialogue `node`, an optional `when`, and a `calm` line for calm mode. Rules:

- One event in about 10 to 15 minutes of exploration. Never during a dialogue or a tool. No repeats in a chapter.
- Luck never takes away credit. A choice in an event must not be a trap.
- Calm mode shows the `calm` line first, with "Now" and "Later". Nothing in an event is timed.
- Add the event node to the reachability list in `tests/playthrough.test.ts`.

## Add a learner-profile moment (PROFILE-001)

A moment (`moments`) has an `attribute`, a condition `when`, a line `did` ("You…") and a reflection `prompt`. It shows once in the journal. **Never** make a score, level or bar from moments.

## Add a misconception (MISC-001 to MISC-003)

A misconception (`misconceptions`) has a paraphrased `title`, the play `signal`, a `worldResponse`, a private `reflection` for the student, a `teacherMove`, and the thresholds (student 3 in 14 days, teacher 5 in 21 days). Raise a signal with the effect `{ "signal": "MIS-xx" }` or with `signal` on a label criterion, a support or a Showdown claim.

- Signal reasoning patterns only. **Never** signal a value choice.
- Every misconception needs at least one place in play that can signal it. The validator checks this. Give the player a good option next to each signalling option, and let the world answer gently (no "wrong").
- Write the title in your own words. Do not copy IB or spec wording.

## Add a portfolio template

A template (`portfolio`) is an entry that the game adds with the effect `{ "portfolio": "pf.<id>" }`. Labels, Showdowns and forge tests also add entries. Entries are private. The student shares them by choice.

## Open a tool from dialogue

A dialogue node or option can have `"open"`: `showdown:<id>`, `label:<kit>`, `forge`, `assay` or `thread:<id>`. The tool opens when the dialogue closes.

## Things not to add

- No student-made content: no level editor, no player-written text that other players see (NOMAKE-001).
- No news or current events (NONEWS-001). The validator rejects news words in source titles.
- No IB copyrighted wording and no copy of the spec.

## Add a map

1. Copy `src/maps/emberford.ts`. Change `id`, size, `floor`, `stamps`, `npcs`, `interactables`, `zones`, `lights`, `spawn`.
2. A **stamp** is a named piece of a tile sheet (house, tree, table). Stamps are in `src/scenes/art.ts`. To add one, find the tile rectangle on `Overworld.png` or `Inner.png` (16 px tiles) and add `{ sheet, x, y, w, h, collide }`.
3. Register the map in `src/maps/index.ts`.
4. Connect it with a zone that has `to: { map, x, y }` and an optional `if` condition.
5. Check it: `npm run build && npm run preview`, then in the browser console run `window.kg.world.changeMap('<map id>', x, y)`.

## Writing style

- Write in plain, short sentences. The players are students aged about 16 to 19, and many read English as a second language.
- Name the action that earns an award ("You compared two sources…").
- Do not say "correct" or "wrong" about a judgement. Say what the evidence supports, qualifies or challenges.
- People from every continent and time period. Name people and places with care (spec section 88). Give local names where they exist.
