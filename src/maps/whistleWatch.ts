import { whistlePlaces } from "../content/whistleWatch";
import type { Interactable, MapDef } from "./types";

export function withWhistleWatch(map: MapDef): MapDef {
  const p = whistlePlaces.find((x) => x.map === map.id);
  if (!p) return map;
  const table: Interactable = {
    id: "whistle." + p.id + ".table",
    kind: "fieldgame",
    game: "whistle-watch",
    label: p.title,
    x: p.table[0],
    y: p.table[1],
    w: 1,
    h: 1,
    art:
      p.id === "fern"
        ? "whistle.notched"
        : p.id === "stage"
          ? "workbench"
          : "ledger",
  };
  const routes: Interactable[] =
    p.id === "island"
      ? [
          {
            id: "whistle.day-ferry",
            kind: "door",
            label: "the daytime ferry marked on Liri’s public sheet",
            art: "study-stairs",
            x: 25,
            y: 14,
            w: 1,
            h: 1,
            visibleIf: {
              all: [
                { item: "item.notched-whistle" },
                { flag: "whistle.island.sent", eq: 0 },
                { not: { flag: "whistle.island.recalled", eq: true } },
              ],
            },
            to: { map: "island.dock", x: 7, y: 10 },
          },
          {
            id: "whistle.keep-table",
            kind: "door",
            label: "the visitors’ path up to the keepers’ table",
            art: "study-stairs",
            x: 25,
            y: 14,
            w: 1,
            h: 1,
            visibleIf: {
              all: [
                { item: "item.notched-whistle" },
                {
                  any: [
                    { flag: "whistle.island.sent", eq: 1 },
                    { flag: "whistle.island.recalled", eq: true },
                  ],
                },
              ],
            },
            to: { map: "island.margin", x: 5, y: 10 },
          },
        ]
      : [];
  return {
    ...map,
    npcs: [
      ...map.npcs,
      { id: "liri-pell", x: p.actor[0], y: p.actor[1], facing: "down" },
    ],
    interactables: [...map.interactables, table, ...routes],
  };
}
