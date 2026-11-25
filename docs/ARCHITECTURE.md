# Architecture

This document tells you how the code fits together. Read [AGENTS.md](../AGENTS.md) first for the rules.

## Layers

```
 ┌──────────────────────────────────────────────────────────────────┐
 │ src/ui/  (HTML overlay)          src/scenes/  (Phaser canvas)      │
 │ dialogue, journal, label,        BootScene: load assets            │
 │ Showdown, forge, events, menus   WorldScene: map, movement, lights │
 └──────────────┬───────────────────────────────┬───────────────────┘
                │ commands                      │ commands (Reach zone)
                ▼                               ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ src/app/controller.ts  GameController                              │
 │ owns state, sends commands to the engine, writes saves             │
 └──────────────┬───────────────────────────────────────────────────┘
                ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ src/domain/  (pure TypeScript, no Phaser, no DOM)                  │
 │ engine.ts   Engine.dispatch(command, state, permanent) → outcome   │
 │ rules.ts    check(condition), apply(effects)                       │
 │ label.ts, showdown.ts, forge.ts, events.ts, learning.ts           │
 │ saves.ts    two save slots, checksum, migrations                   │
 │ permanent.ts  permanent XP and awards                              │
 │ validate.ts content and save validation                            │
 └──────────────┬───────────────────────────────────────────────────┘
                ▼
 ┌──────────────────────────────────────────────────────────────────┐
 │ src/content/*.json  (data only)   src/maps/*.ts  (layout data)     │
 └──────────────────────────────────────────────────────────────────┘
```

The important rule: **game rules live only in `src/domain/`**. The UI and the scenes send commands and show results. They do not change state directly. This makes the rules testable without a browser (`tests/playthrough.test.ts` plays every route).

## Commands and events

Every player action is a typed command (see `Command` in `src/domain/engine.ts`):

| Command | What it does |
|---|---|
| `InspectExhibit`, `UseLens` | Look at an exhibit; use the Date Lens on it. |
| `ChooseDialogueOption`, `EnterNode` | Dialogue. |
| `RunSimulation` | The fair test at the bench (a stated model, `claimKind: simulation`). |
| `BuildLabel` | Label builder: subject, criterion, limit, support cards. Gives a `LabelResult` with the Fray gap (`label.ts`). |
| `ShowdownStart`, `ShowdownMove` | Public argument with crowd trust and patience (`showdown.ts`). |
| `FollowThread` | Provenance Thread: visit nodes; a gap shows where the record stops. |
| `Forge`, `CompareAssay` | Forge billets and compare them with the blade at the assay table (`forge.ts`). |
| `Explore`, `ResolveEvent`, `DelayEvent` | Exploration time and the seeded event deck (`tickEvents`, `eligibleEvents` in `learning.ts`). `DelayEvent` is for calm mode. |
| `PortfolioShare`, `PortfolioReflect` | The student shares a portfolio entry or adds a reflection. |
| `RequestHint`, `AddNote`, `Purchase`, `Rest`, `Reach`, `SetFlag` | Hints, notes, shop, rest at a waystone, reach a zone, debug flag. |

`Engine.dispatch` does this:

1. Check the command against the state. If the command is not valid, return the old state and an `error` event. Nothing changes (atomic).
2. Apply the effects.
3. Complete each objective whose `done` condition now holds, and apply its `onComplete` effects.
4. Grant permanent credit and check awards.
5. Record learner-profile moments and misconception signals (`learning.ts`).
6. Return the new state, the new permanent record and a list of events (card, objective, award, label, showdown, thread, forge, event-due, moment, reflection, portfolio, checkpoint, and so on).

The controller then saves and the UI shows toasts for the events.

## Content vocabulary

Content is JSON. It never holds code. Conditions and effects use a small vocabulary, defined in `src/domain/types.ts`:

- **Conditions:** `flag`/`eq`, `flag`/`in`, `flagSet`, `num`/`gte`/`lte`, `item`, `marks`, `card`, `objective`, `all`, `any`, `not`.
- **Effects:** `setFlag`, `addNum`, `giveItem`, `takeItem`, `addMarks`, `addCard`, `journal`, `relation`, `companion`, `credit`, `checkpoint`, `signal` (a misconception signal), `portfolio` (add an entry from a template).
- **Dialogue `open`:** a node or option can open a tool when the dialogue closes: `showdown:<id>`, `label:<kit>`, `forge`, `assay`, `thread:<id>`. `validate.ts` checks these.

`src/domain/validate.ts` checks all references (cards, sources, nodes, items, objectives) when the game starts and in `npm test`.

## State

| Data | Where | Notes |
|---|---|---|
| Campaign state | `CampaignState` in `types.ts` | Position, flags (also counters such as `count.inspected`), inventory, cards, objectives done, journal, notes, marks (money), companion, RNG state, play time, Showdown state, forge billets, event deck. Schema version `CAMPAIGN_SCHEMA` (now 3). |
| Permanent record | `PermanentRecord` | XP per criterion, awards, learner-profile moments, misconception signals, met weave tags and the portfolio. **Never reset** by loading a save. Each criterion has a fixed maximum. `PERMANENT_SCHEMA` is now 2. |
| Settings | `src/app/settings.ts` | Accessibility, volume and calm mode. |

## Saves (spec section 24)

There are exactly **two campaign slots**: **Continue** and **Checkpoint recovery**.

- At a checkpoint, the old Continue moves to Recovery, and the new checkpoint becomes Continue.
- When the player leaves or the tab is hidden, a suspend save updates Continue only.
- "Restore recovery" copies Recovery into Continue.

Both slots are written in one `localStorage` key (`kg.slots`) in one write, with an FNV checksum and a revision number. If another tab changed the save, the write stops with "Save changed in another tab". The permanent record is in `kg.permanent`. Settings are in `kg.settings`.

**Schema changes:** when you change `CampaignState`, raise `CAMPAIGN_SCHEMA` and add a function to `MIGRATIONS` in `src/domain/saves.ts`. Add a test in `tests/saves.test.ts`. A save from a newer version is refused, not damaged.

## The world (Phaser)

- `BootScene` loads the tile sheets, the character sheets and the audio. It registers each **stamp** (a named rectangle on a tile sheet, defined in `src/scenes/art.ts`) as a texture frame. It also draws the original procedural art from `src/ui/illustrations.ts`.
- `WorldScene` builds a map from a `MapDef` (`src/maps/types.ts`): floor tiles, stamps (with collision), characters, interactable objects, zones and lights. It handles movement (keys, or click-to-move with path finding), interaction prompts, the companion who follows the player, the fairy guide Lumen, lighting (ambient multiply layer, additive glows, particles, bloom and vignette) and map changes.
- Tiles are 16 × 16 pixels. Characters are 16 × 32 frames. The camera uses whole-number zoom so pixels stay sharp.

## The interface (HTML)

`src/ui/ui.ts` makes all panels in HTML over the canvas (`#ui`). HTML gives keyboard focus, screen-reader text, text scaling and high contrast. Modals trap focus. Esc closes them.

## Teacher view

`teacher.html` is a second Vite entry (see `vite.config.ts`). It has no server.

1. In the game, the student opens Menu, "Share with my teacher". The game makes a progress JSON file: objectives, awards, XP, moments, met concepts, ATL, subjects and areas of knowledge, open misconception signals, and **only** the portfolio entries that the student shared. Notes and the journal are not in the file.
2. The teacher opens `teacher.html` and adds the files. `src/teacher/report.ts` (pure, tested in `tests/teacher.test.ts`) checks each file, keeps the latest file per student, and makes the class summary.
3. The dashboard shows a weekly summary, concept, ATL, area and subject coverage, learner-profile class totals, misconception alerts (with "Not a misconception"), and a private progress list. Each student has a printable report (A4, 1.5 cm margins).

## Debug hook

In the browser console, `window.kg` gives `{ controller, ui, world, settings }`. The test scripts use it (for example `window.kg.world.changeMap(...)`). Do not use it in game code.
