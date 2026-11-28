import { hearingKey, townHearings } from "../content/hearings";
import { repairBook } from "../content/hearings/repairBook";
import type { Interactable, MapDef } from "./types";

export function withTownHearing(map: MapDef): MapDef {
  const h = townHearings.find((town) => town.map === map.id);
  if (!h) return map;
  const key = hearingKey(h);
  const work: Interactable[] = h.stations.map((s, i) => ({
    id: key + ".work" + i,
    kind: "scene",
    node: key + ".station" + i,
    label: s.title,
    art: s.art,
    x: h.x + i * 4,
    y: h.y,
    w: 1,
    h: 1,
  }));
  const chairs: Interactable[] = h.stations.map((s, i) => ({
    id: key + ".chair" + i,
    kind: "scene",
    node: key + ".seated" + i,
    label: s.chair,
    art: "hearing-chair",
    x: h.x + 1 + 2 * i,
    y: h.y + 1,
    w: 1,
    h: 1,
    walkThrough: true,
    visibleIf: { flag: key + ".seat", eq: i },
  }));
  const amendments: Interactable[] = repairBook[h.id].plaque.map(
    (label, method) => ({
      id: key + ".repair" + method,
      kind: "scene",
      node: key + ".amend" + method,
      label,
      art: "ledger",
      walkThrough: true,
      x: h.x + 2,
      y: h.y - 1,
      w: 1,
      h: 1,
      visibleIf: { flag: key + ".amended", eq: method },
    }),
  );
  const arrivals: MapDef["npcs"] = [
    { id: h.host, x: h.x + 2, y: h.y, facing: "down" },
  ];
  if (h.host !== "agate-vale")
    arrivals.push({ id: "agate-vale", x: h.x + 3, y: h.y - 2, facing: "down" });
  return {
    ...map,
    npcs: [...map.npcs, ...arrivals],
    interactables: [...map.interactables, ...work, ...chairs, ...amendments],
  };
}
