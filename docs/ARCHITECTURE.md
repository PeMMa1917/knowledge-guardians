# Architecture

This document tells you how the code fits together. Read [AGENTS.md](../AGENTS.md) first for the rules.

## Layers

```
 ┌──────────────────────────────────────────────────────────────────┐
 │ src/ui/  (HTML overlay)          src/scenes/  (Phaser canvas)      │
 │ dialogue, journal, board,        BootScene: load assets            │
 │ exhibits, menus, settings        WorldScene: map, movement, lights │
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

Every player action is a typed command (see `Command` in `src/domain/engine.ts`), for example `InspectExhibit`, `ChooseDialogueOption`, `AttachEvidence`, `RunSimulation`, `SubmitSort`, `RequestHint`.

`Engine.dispatch` does this:

1. Check the command against the state. If the command is not valid, return the old state and an `error` event. Nothing changes (atomic).
2. Apply the effects.
3. Complete each objective whose `done` condition now holds, and apply its `onComplete` effects.
4. Grant permanent credit and check awards.
5. Return the new state, the new permanent record and a list of events (card received, objective done, award, checkpoint, and so on).

The controller then saves and the UI shows toasts for the events.

## Content vocabulary

Content is JSON. It never holds code. Conditions and effects use a small vocabulary, defined in `src/domain/types.ts`:

- **Conditions:** `flag`/`eq`, `flag`/`in`, `flagSet`, `num`/`gte`/`lte`, `item`, `marks`, `card`, `objective`, `boardLinks`, `all`, `any`, `not`.
- **Effects:** `setFlag`, `addNum`, `giveItem`, `takeItem`, `addMarks`, `addCard`, `journal`, `relation`, `companion`, `credit`, `checkpoint`.

`src/domain/validate.ts` checks all references (cards, sources, nodes, items, objectives) when the game starts and in `npm test`.

## State

| Data | Where | Notes |
|---|---|---|
| Campaign state | `CampaignState` in `types.ts` | Position, flags (also used for counters such as `m02.evidence`), inventory, cards, board links, objectives done, journal, notes, marks (money), companion, RNG state. Schema version `CAMPAIGN_SCHEMA` (now 2). |
| Permanent record | `PermanentRecord` | XP per criterion and awards. **Never reset** by loading a save. Credit is idempotent: each criterion has a fixed maximum. |
| Settings | `src/app/settings.ts` | Accessibility and volume. |

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

## Debug hook

In the browser console, `window.kg` gives `{ controller, ui, world, settings }`. The test scripts use it (for example `window.kg.world.changeMap(...)`). Do not use it in game code.
