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
| `src/content/origins.json` | The five player origins (spec 35.1), their starting Lens hints, and the answers to each origin's own option in each world. |
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
- **The player in text (spec 35.1).** Use `{name}`, `{they}`, `{them}`, `{their}` (and `{They}`, `{Them}`, `{Their}` at the start of a sentence). The game puts in the player's name and chosen pronouns. Write the line so that the verb does not change with the pronoun: "{they} checked every date", not "{they} is careful".
- **Character looks.** A character's `sprite` is a sheet in `public/assets/art/generated/characters/`, or a made look such as `"custom:olive.black.blue.sand.scarf.white"` (skin, hair, outfit, trousers, accessory, accent; the names are in `src/domain/appearance.ts`). Give each new character its own look.
- **Origin options.** An option with `"if": { "origin": "singer" }` shows only for that origin. Each origin needs one option in each world (the validator checks this). Origin options must not give credit, marks or cards: an origin gives no advantage. 

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

## Add an Exhibition alcove (SYM-001)

Alcoves are in `src/content/exhibition.json` (`alcoves`). Each has a prompt, at least two `symbols` (they bring the Symbol Mirage), and `objects` (evidence cards). Each object needs one `specific` link, one `checklist` link (the Checklist Golem) and usually one `generic` link, plus at least two good `implications` and one "so what?" trap (the So-What Sphinx). The validator checks this. Mix the order of the options. Place the alcove on a map with `kind: 'alcove'`.

## Add a Loreling (spec 36.1)

Add a record to `src/content/lorelings.json` (`lorelings`). A Loreling is befriended by observation only. Give it at least two sightings (`sightings`, each with a `place` and what the player sees), pattern questions (`questions`) and an `offer` (where to wait). Every wrong option in a question must name the sighting that shows it is wrong (`contradicts`), so careful watching always finds the pattern; the validator checks this. Design the sightings so that one feature is present often but is not the cause (a confound), and one sighting breaks it (a counterexample). Put the sightings on a map as interactables of kind `loreling` with `loreling` and `sighting`, and hide them with `visibleIf` when the Loreling is a friend. Forms grow from completed steps whose `weave.concepts` include the Loreling's concept (`src/domain/lorelings.ts`). Lorelings never fight, never get hurt and are fictional; real animals stay real.

## Add a puzzle: timeline door, balance bench or restorer's trestle

Puzzles are in `src/content/puzzles.json`. An `order` puzzle can be a knowledge-gated door: give it `needs` (`item` and a `sealed` text shown without the tool) and `words` (the feedback words: `stops`, `sags`, `done`, `notPart`). Put only one kind of date on one timeline, and give every distractor a `why`. A `balance` puzzle has `rounds`, each with a `load` (`label`, `mass`) and `weights`. Mark a weight `untrusted` (with the reason) when it belongs to the thing under test; it never counts, even when the pans balance. The validator checks that the trusted weights can balance every load. To swap a map object's art when it opens, give it `artOpen: { key, if }`.

A `restore` puzzle has `layers` (top first: `id`, `name`, `colour`, `text`), a `face` (how the object looks now: `bg`, `ink`, `lines`, optional `window`) and `methods`. Each method has `keeps` and `loses` (together they name every layer once), `reversible`, a `result`, its own `face`, and `labels` (at least one `honest` and one not, each with a `why`). Every method must be a fair choice: the puzzle checks only that the label says honestly what was kept and lost. Give each method the same reward. To show the chosen method on the map, give the object `artBy: { flag, keys }`.

A `sightlines` puzzle has a `grid` (`w`, `h`), `blocks` (cells that block the view: `x`, `y`, `w`, `h`, `label`, `kind`), `spots` (where things happened) and `witnesses`, each with a place and `claims` (`spot`, `text`). The map decides what each witness could see. A claim that cannot be seen must have `heard` (who told the witness); the validator checks this against the map. Give the puzzle exactly one fair report in `reports`. After you change the map, run `npm test`.

## Add a practice clue board

Add a record to `clueBoards` (in `src/content/clueboard.json`) with the `showdown` id, a `title`, an `intro`, `onComplete` and a `weave`. The board takes its claims, links and support from the Showdown record, so no other data is needed. Place it on a map with `kind: 'board'` and `board: <id>`.

## Add a world-memory line

`src/content/memories.json` (`memories`) holds short lines that a person says once when the player passes. Each has a `character`, a condition `if` on explicit state (a flag, a card, an objective) and a `line` of one or two sentences. Put the more specific line first (for example "after a few tries" before "after you solved it"): a person says only the first line that holds, and the others that hold are marked as heard. Remember choices and patient mistakes, never grades, and never shame the player.

## Tag a step with a knowledge question (Question Stones)

Give an objective `"kq": { "id": "KQ-NEW-001", "action": "label" }`. The question is in `src/content/questions.json`, in our own words (never IB wording), with Lumen's one-sentence `lastWord`. Each new world and action pair makes the stone brighter. Never ask the player to "answer" a knowledge question for points (KQ-001).

## Add a glossary word (smart glossary)

`src/content/glossary.json` holds key words. Each entry has a `term`, lower-case `match` forms, a plain explanation in our own words, and `examples` with optional conditions (`{flag:name}` shows a flag's value, for example the player's own label). The first use of a word in a conversation is underlined; the player can tap it. A test checks that every word appears in the chapter text. Never copy course wording into explanations.

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

## Add a keepsake

Keepsakes are in `src/content/quarters.json`. Each has an `id` (short lowercase words with hyphens), a `name`, a one-line `text`, a condition `if` (the deed that earns it) and `where` (the hint shown while it is locked). Draw its 12 x 12 icon in `ICONS` in `src/ui/quarters.ts`; without one, a plain box is shown. Keepsakes are cosmetic: never give XP for them.
