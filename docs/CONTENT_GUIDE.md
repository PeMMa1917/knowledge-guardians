# Content guide

This guide tells you how to add or change game content: missions, objectives, dialogue, exhibits, evidence cards, sources, hints, items, awards and maps.

**Rule:** after each change, run `npm test`. The content tests find broken references, missing sources and missing hints. Do not merge content that fails the tests.

## Files

| File | Holds |
|---|---|
| `src/content/sources.json` | Historical source records (`HIS-S…`). |
| `src/content/common.json` | Items, characters, credit criteria, awards, shop offers. |
| `src/content/m01-nexus.json` | Mission KG-CH1-M01 "Three Firsts" (The Nexus). |
| `src/content/m02-aethelgard.json` | Mission KG-CH1-M02 "The Label on the Blade" (Emberford). |
| `src/content/index.ts` | Joins the JSON files into one content pack. **Add a new file to `parts` here.** |
| `src/maps/*.ts` | Map layouts. Register a new map in `src/maps/index.ts`. |

All record types are in `src/domain/types.ts`. Each field has a comment.

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
- No runtime AI. All text is written in advance. Free text from the player (for example the question to Sefa) is matched to written answers, and has an honest fallback answer.

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
