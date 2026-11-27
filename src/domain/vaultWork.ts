import {
  vaultLetter,
  vaultNights,
  vaultStations,
  vaultWork,
  waiting,
  type VaultStation,
} from "../content/vaultNight";
import { diaryEvent } from "./adventureEvents";
import {
  allSealsOpen,
  BOSS,
  bossDone,
  bossPhase,
  SEALS,
  sealOpen,
} from "./undercroft";
import type { CampaignState, Effect } from "./types";

export type VaultCommand = { type: "WorkVault"; station: VaultStation } & (
  | { action: "ring"; felt: boolean }
  | { action: "latch" }
  | { action: "link"; open: boolean }
  | { action: "unhook" }
  | { action: "shutter"; place: number }
  | { action: "shelf"; start: "tabs" | 0 | 1 | 2 | 3 }
  | { action: "wax"; layer: 0 | 1 | 2 }
  | { action: "peg"; count: 0 | 1 | 2 }
  | { action: "flap"; leaf: 0 | 1 }
  | { action: "letter"; edge: "before" | "after" }
  | { action: "ear"; who: "Elsbet" | "Archivist" }
  | { action: "leave"; for: 0 | 1 }
);
type State = Pick<CampaignState, "mapId" | "flags">;
const k = (s: VaultStation, id: string) => "vault-work." + s + "." + id;
const effect = (
  s: VaultStation,
  id: string,
  value: number | boolean | string,
): Effect => ({
  setFlag: k(s, id),
  value,
});
function value(state: State, station: VaultStation, id: string) {
  return state.flags[k(station, id)];
}
const has = (s: State, who: VaultStation, id: string) =>
  value(s, who, id) === true;
const num = (
  s: State,
  who: VaultStation,
  id: string,
  max: number,
  otherwise = 0,
) => {
  const v = value(s, who, id);
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= max
    ? v
    : otherwise;
};
const bit = (n: number, i: number) => (n & (1 << i)) !== 0;
const option = (n: unknown, max: number) =>
  typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max;
export function openedVaultSeal(
  flags: CampaignState["flags"],
  seal: (typeof SEALS)[number],
): Effect[] {
  return sealOpen(flags, seal.id)
    ? []
    : [
        { setFlag: "trap." + seal.id + ".open", value: true },
        { setFlag: "meet.fray." + seal.fray, value: true },
        { addMarks: 2 },
      ];
}
export function advancedVaultPhase(phase: number): Effect[] {
  return [
    { setFlag: "boss." + BOSS.id + ".phase", value: phase + 1 },
    { setFlag: "meet.fray." + BOSS.phases[phase].fray, value: true },
    ...(phase === BOSS.phases.length - 1
      ? ([
          { setFlag: "undercroft.done", value: true },
          { addMarks: 10 },
          { giveItem: "item.brass-lamp" },
        ] as Effect[])
      : []),
  ];
}
export function vaultPhaseStation(s: State): VaultStation {
  return vaultStations[3 + Math.min(2, bossPhase(s.flags))];
}
export const gateMask = (s: State) => num(s, "twogates", "mask", 7);
export const gateApart = (s: State) => has(s, "twogates", "apart");
export const sawLinked = (s: State) => num(s, "twogates", "joined", 3) === 3;
export function gateReport(mask: number) {
  return (
    waiting
      .map(
        (who, i) =>
          who + (bit(mask, i) ? " goes through" : " waits at the rail"),
      )
      .join(". ") + "."
  );
}
export function shelfView(n: "tabs" | number) {
  const indices = n === "tabs" ? [0, 2, 3] : [n, n + 1, n + 2];
  return (
    indices.map((i) => "Night " + (i + 1) + " · " + vaultNights[i]).join(". ") +
    "."
  );
}
export const flapCount = (s: State) => num(s, "margin", "flaps", 3);
export const firstPeg = (s: State) => num(s, "margin", "first", 2, -1);
export const nextPeg = (s: State) => num(s, "margin", "next", 2, -1);
export const veil = (s: State) => num(s, "promise", "edge", 3);
export const waxSeen = (s: State) => num(s, "stamp", "wax", 7);
export const listeners = (s: State) => num(s, "promise", "ears", 3);
export function letterView(mask: number) {
  return vaultLetter
    .slice(bit(mask, 0) ? 0 : 1, bit(mask, 1) ? 4 : 2)
    .join(" ");
}
export function vaultReady(s: State, station: VaultStation) {
  switch (station) {
    case "many":
      return num(s, station, "ring", 3) === 3 && has(s, station, "latch");
    case "twogates":
      return gateApart(s) && has(s, station, "mixed");
    case "chosen":
      return (
        has(s, station, "tabs") &&
        has(s, station, "torn") &&
        has(s, station, "wet")
      );
    case "stamp":
      return waxSeen(s) === 7;
    case "margin":
      return flapCount(s) === 3 && nextPeg(s) >= 0;
    case "promise":
      return veil(s) === 3 && listeners(s) === 3;
  }
}
export function vaultReport(s: State, c: VaultCommand): string {
  switch (c.action) {
    case "ring":
      return c.felt
        ? "The three market tubes go quiet under one piece of felt. At my knee the service bell still taps against its own brass tongue."
        : "Four voices! The three from the market start on exactly the same cracked note. A small bell taps twice down by my knee.";
    case "latch":
      return "I pulled the short service cord. On the other side a hand lifted the latch and let a slice of cold air through.";
    case "link":
      return c.open
        ? "All three shutters rose together. " + gateReport(7)
        : "All three shutters fell together. " + gateReport(0);
    case "unhook":
      return "I lifted the link between the three shutters. Each has a handle of its own.";
    case "shutter":
      return gateReport(gateMask(s));
    case "shelf":
      return (
        (c.start === "tabs"
          ? "The three green tabs kept only dry crossings. "
          : "The drawer opened on three consecutive nights. ") +
        shelfView(c.start)
      );
    case "wax":
      return [
        "In the top wax I read KEEPER. The seal covers the fastening string. It tells me who closed the packet.",
        "Inside the fold I found Mella’s mark. She stood at the far sluice. Her line describes only the upper plank.",
        "Under the paper I found a watch time at the eighth bell. The filing stamp on the wrapper is dated the following morning.",
      ][c.layer];
    case "peg":
      return (
        (flapCount(s) === 3
          ? "My peg for the next watch marks "
          : "Before opening the leaves I pegged ") +
        c.count +
        " dry crossings out of two."
      );
    case "flap":
      return c.leaf === 0
        ? "The fifth watch got across on dry boards. I can still see my first peg."
        : "The sixth watch waited above the water. Its folded leaf was filed under missed journeys.";
    case "letter":
      return (
        "The open part of Elsbet’s letter now reads “" +
        letterView(veil(s)) +
        "”"
      );
    case "ear":
      return c.who === "Elsbet"
        ? "In Elsbet’s chair I heard her fear for a witness quoted after they leave. She wants a way for that person to put the claim right."
        : "From the keeper’s chair I could see the lamp at the top of the steps. Its keeper had waited ten years for somebody to ask what the watch had been like.";
    case "leave":
      return vaultWork[c.station].replies[c.for];
  }
}
export function workVault(s: State, c: VaultCommand): Effect[] {
  const id = c.station;
  if (s.mapId !== "aethelgard.undercroft" || !vaultStations.includes(id))
    throw Error("Find this instrument in Elsbet’s records vault.");
  const key = (name: string, val: number | boolean | string) =>
    effect(id, name, val);
  const station = (expected: VaultStation) => {
    if (id !== expected) throw Error("That part belongs on a different stand.");
  };
  const i = vaultStations.indexOf(id);
  if (
    i >= 3 &&
    (!allSealsOpen(s.flags) || bossDone(s.flags) || vaultPhaseStation(s) !== id)
  )
    throw Error("The Archivist has a different leaf in its hands.");
  if (
    i < 3 &&
    vaultStations.slice(0, i).some((previous) => !sealOpen(s.flags, previous))
  )
    throw Error("Open the earlier grate to reach this stand.");
  if (i < 3 && sealOpen(s.flags, id))
    throw Error("The way through this grate is already open.");
  switch (c.action) {
    case "ring":
      station("many");
      if (typeof c.felt !== "boolean")
        throw Error("Try the felt sleeve or lift it off.");
      return [
        key("ring", num(s, id, "ring", 3) | (c.felt ? 2 : 1)),
        key("felt", c.felt),
      ];
    case "latch":
      station("many");
      return [key("latch", true)];
    case "link":
      station("twogates");
      if (typeof c.open !== "boolean")
        throw Error("Raise or lower the handle.");
      return [
        key("joined", num(s, id, "joined", 3) | (c.open ? 2 : 1)),
        key("apart", false),
        key("mask", c.open ? 7 : 0),
      ];
    case "unhook":
      station("twogates");
      if (!sawLinked(s))
        throw Error("Try each end of the linked handle first.");
      return [key("apart", true)];
    case "shutter": {
      station("twogates");
      if (!gateApart(s) || !option(c.place, 2))
        throw Error("Lift the link before moving a single shutter.");
      const mask = gateMask(s) ^ (1 << c.place);
      return [
        key("mask", mask),
        ...(mask !== 0 && mask !== 7 ? [key("mixed", true)] : []),
      ];
    }
    case "shelf": {
      station("chosen");
      if (c.start === "tabs") return [key("tabs", true), key("window", "tabs")];
      if (!option(c.start, 3))
        throw Error("The frame fits three consecutive nights.");
      const nights = vaultNights.slice(c.start, c.start + 3);
      return [
        key("window", c.start),
        ...(nights.some((n) => n.startsWith("Water"))
          ? [key("wet", true)]
          : []),
        ...(nights.includes(vaultNights[5]) ? [key("torn", true)] : []),
      ];
    }
    case "wax":
      station("stamp");
      if (!option(c.layer, 2))
        throw Error("Turn the lamp onto one of the three layers.");
      return [key("wax", waxSeen(s) | (1 << c.layer)), key("face", c.layer)];
    case "peg":
      station("margin");
      if (!option(c.count, 2)) throw Error("There are two crossing leaves.");
      if (flapCount(s) > 0 && flapCount(s) < 3)
        throw Error(
          "The first peg stays put. Raise the second flap before setting another.",
        );
      return [key(flapCount(s) === 3 ? "next" : "first", c.count)];
    case "flap":
      station("margin");
      if (firstPeg(s) < 0 || !option(c.leaf, 1))
        throw Error("Set a peg before opening either leaf.");
      return [key("flaps", flapCount(s) | (1 << c.leaf))];
    case "letter":
      station("promise");
      if (c.edge !== "before" && c.edge !== "after")
        throw Error("Lift one of the paper shutters.");
      return [key("edge", veil(s) | (c.edge === "before" ? 1 : 2))];
    case "ear":
      station("promise");
      if (veil(s) !== 3 || !["Elsbet", "Archivist"].includes(c.who))
        throw Error("Unfold both edges before taking the chairs.");
      return [key("ears", listeners(s) | (c.who === "Elsbet" ? 1 : 2))];
    case "leave": {
      if (!option(c.for, 1) || !vaultReady(s, id))
        throw Error(vaultWork[id].help);
      return [
        key("left", c.for),
        key("receipt", vaultWork[id].replies[c.for]),
        ...(id === "twogates" ? [key("sent-mask", gateMask(s))] : []),
        ...(i < 3
          ? openedVaultSeal(s.flags, SEALS[i])
          : advancedVaultPhase(i - 3)),
      ];
    }
  }
}
export function vaultReceipts(s: State) {
  return vaultStations.flatMap((station) => {
    const hand = value(s, station, "left");
    if (hand !== 0 && hand !== 1) return [];
    const work = vaultWork[station];
    const copied = value(s, station, "receipt");
    const lines = [typeof copied === "string" ? copied : work.replies[hand]];
    const sent = value(s, "twogates", "sent-mask");
    if (station === "twogates" && typeof sent === "number" && option(sent, 7))
      lines.push(gateReport(sent));
    if (station === "margin" && firstPeg(s) >= 0 && nextPeg(s) >= 0) {
      lines.push(
        "My first peg marked " +
          firstPeg(s) +
          " dry crossings out of two. The fifth watch crossed dry and the sixth waited. I left the next watch a peg at " +
          nextPeg(s) +
          ".",
      );
    }
    return [{ station, title: work.title, text: lines.join(" ") }];
  });
}

export function vaultDiary(s: State, c: VaultCommand) {
  return diaryEvent(
    "vault:" + c.station + ":" + c.action,
    "tool",
    "vault." + c.station,
    vaultWork[c.station].title,
    vaultReport(s, c),
    {},
    "after-break",
  );
}
