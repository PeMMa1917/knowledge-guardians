import {
  whistlePlaces,
  whistleRelief,
  whistleStories,
  type WhistleSite,
} from "../content/whistleWatch";
import { diaryEvent } from "./adventureEvents";
import type { CampaignState, Effect } from "./types";

export type WhistleCommand = { type: "WorkWhistle"; site: WhistleSite } & (
  | { action: "lay"; piece: 0 | 1 | 2 }
  | { action: "sign"; part: "fan" | "boot"; by: "walker" | "mender" }
  | { action: "screen"; cover: 0 | 1 | 2 }
  | { action: "hear"; seat: "front" | "rear" }
  | { action: "layer"; piece: 0 | 1 | 2 }
  | { action: "carry" }
  | { action: "relieve" }
  | { action: "recall" }
  | { action: "send"; hand: 0 | 1 }
);
type State = Pick<CampaignState, "mapId" | "flags" | "inventory">;
const bit = (n: number, i: number) => Boolean(n & (1 << i));
export function watchMark(s: State, site: WhistleSite, key: string) {
  return s.flags["whistle." + site + "." + key];
}
export function watchNumber(
  s: State,
  site: WhistleSite,
  key: string,
  max: number,
  missing = 0,
) {
  const val = watchMark(s, site, key);
  return typeof val === "number" &&
    Number.isInteger(val) &&
    val >= 0 &&
    val <= max
    ? val
    : missing;
}
export function whoSigned(s: State, part: "fan" | "boot") {
  const val = watchMark(s, "fern", part);
  return val === "mender" || val === "walker" ? val : undefined;
}
export function hearing(s: State, mode: number) {
  return watchNumber(s, "stage", "hearing" + mode, 3);
}
export function whistleReady(s: State, site: WhistleSite) {
  if (site === "fern")
    return (
      watchNumber(s, site, "work", 7) === 7 &&
      whoSigned(s, "fan") === "walker" &&
      whoSigned(s, "boot") === "mender"
    );
  if (site === "stage")
    return (
      watchNumber(s, site, "work", 7) === 7 &&
      [0, 1, 2].every((i) => hearing(s, i) > 0) &&
      [0, 1, 2].some((i) => hearing(s, i) === 3)
    );
  return (
    watchNumber(s, site, "work", 7) === 7 &&
    watchMark(s, site, "folded") === true &&
    watchMark(s, site, "boundary") === true &&
    watchMark(s, site, "trial") === true
  );
}
export function whistleReport(s: State, c: WhistleCommand): string {
  const w = whistleStories[c.site];
  switch (c.action) {
    case "lay":
    case "layer":
      return w.notes[c.piece];
    case "screen":
      return w.notes[c.cover];
    case "sign": {
      const firsthand = (c.part === "fan") === (c.by === "walker");
      const answer = c.by === "walker" ? "The bank walker" : "The boot mender";
      if (firsthand)
        return (
          answer +
          " signs the " +
          (c.part === "fan"
            ? "three-toed fan. She leaves the animal’s name open."
            : "notch and the worn tread. He dates his own repair and leaves the time of the print open.")
        );
      return (
        answer +
        (c.by === "walker"
          ? " can sketch the notch but cannot sign for where the nail was missing. The mender has the boot."
          : " can describe the nail. He asks the walker to sign for what she saw at low water.")
      );
    }
    case "hear": {
      const mode = watchNumber(s, "stage", "cover", 2);
      const sound =
        c.seat === "front"
          ? "From the front bench I heard two separated taps."
          : "The rear bench answered on the first tap. At the second mark the loose back panel only quivered.";
      return (
        sound +
        " " +
        [
          "Both names remain on this slip.",
          "The listener’s name is under the cloth.",
          "Only the seat and the two beat marks travel on this copy.",
        ][mode]
      );
    }
    case "carry":
      return watchMark(s, "island", "folded") === true
        ? "The deckhand can follow both steps and the high turn. The closed inset leaves her a place to ask a question when the boat comes back."
        : "The open inset catches on the carrying frame. The keeper lifts the local leaf back onto her table. She offers to take a separate request to the group after the season. The landing steps can still travel.";
    case "relieve":
      return whistleRelief[c.site].result;
    case "recall":
      return "The walkers suspend the copied route during nesting season. I ring the notched whistle. The deckhand folds the old sheet into the recall box and directs visitors to the keepers’ table. The earlier handover stays dated in my diary.";
    case "send":
      return w.replies[c.hand];
  }
}
export function workWhistle(s: State, c: WhistleCommand): Effect[] {
  const site = whistlePlaces.find((p) => p.id === c.site);
  if (!site || s.mapId !== site.map)
    throw Error("Find Liri’s table at this watch.");
  const id = site.id,
    key = (k: string, v: boolean | number | string): Effect => ({
      setFlag: "whistle." + id + "." + k,
      value: v,
    });
  function at(target: WhistleSite) {
    if (id !== target) throw Error("This job belongs to a different watch.");
  }
  function mark(n: number) {
    if (![0, 1, 2].includes(n)) throw Error("There are three fittings.");
    return key("work", watchNumber(s, id, "work", 7) | (1 << n));
  }
  switch (c.action) {
    case "lay":
      at("fern");
      return [mark(c.piece), key("face", c.piece)];
    case "sign": {
      at("fern");
      if (
        !["fan", "boot"].includes(c.part) ||
        !["walker", "mender"].includes(c.by)
      )
        throw Error("Bring a named strip to one of its readers.");
      if (!bit(watchNumber(s, id, "work", 7), c.part === "fan" ? 0 : 2))
        throw Error("Lay the matching impression over the strip first.");
      return [
        (c.part === "fan") === (c.by === "walker")
          ? key(c.part, c.by)
          : key("asked-" + c.part, c.by),
      ];
    }
    case "screen":
      at("stage");
      return [mark(c.cover), key("cover", c.cover)];
    case "hear": {
      at("stage");
      const cover = watchNumber(s, id, "cover", 2, -1);
      if (cover < 0 || !["front", "rear"].includes(c.seat))
        throw Error("Set the name cloth before trying a seat.");
      return [
        key(
          "hearing" + cover,
          hearing(s, cover) | (c.seat === "front" ? 1 : 2),
        ),
        key("last-seat", c.seat),
      ];
    }
    case "layer": {
      at("island");
      const work = watchNumber(s, id, "work", 7);
      if (c.piece === 1 && !bit(work, 0))
        throw Error("Put the public landmarks on the table first.");
      if (c.piece === 2 && !bit(work, 1))
        throw Error("Look at what the local inset contains first.");
      return [
        mark(c.piece),
        ...(c.piece === 0 ? [] : [key("folded", c.piece === 2)]),
      ];
    }
    case "carry": {
      at("island");
      if (!bit(watchNumber(s, id, "work", 7), 1))
        throw Error("Lay the local and travelling layers together first.");
      const folded = watchMark(s, id, "folded") === true;
      return [key(folded ? "trial" : "boundary", true)];
    }
    case "relieve":
      if (
        watchMark(s, id, "together") !== true ||
        watchNumber(s, id, "sent", 1, -1) < 0
      )
        throw Error(
          "Arrange the handover and offer to take a watch with Liri first.",
        );
      if (watchMark(s, id, "relieved") === true)
        throw Error("The next watch has already taken over.");
      return [key("relieved", true)];
    case "recall":
      at("island");
      if (
        watchMark(s, id, "sent") !== 0 ||
        watchMark(s, id, "recalled") === true
      )
        throw Error("Only a circulating ferry sheet can be called back.");
      return [key("recalled", true)];
    case "send": {
      if (
        id === "island" &&
        c.hand === 0 &&
        watchMark(s, id, "recalled") === true
      )
        throw Error(
          "The keepers have called that permission back for the season. Visitors can still go to the table.",
        );
      if (![0, 1].includes(c.hand) || !whistleReady(s, id))
        throw Error("The keeper points to an empty space on the stand.");
      return [
        key("sent", c.hand),
        key("letter", whistleReport(s, c)),
        ...(s.inventory["item.notched-whistle"] > 0
          ? []
          : [{ giveItem: "item.notched-whistle" }]),
      ];
    }
  }
}
export function whistleDiary(s: State, c: WhistleCommand) {
  const w = whistlePlaces.find((p) => p.id === c.site)!;
  const details =
    c.action === "lay" || c.action === "layer"
      ? c.piece
      : c.action === "screen"
        ? c.cover
        : c.action === "sign"
          ? c.part + "-" + c.by
          : c.action === "hear"
            ? watchNumber(s, c.site, "cover", 2) + "-" + c.seat
            : c.action === "send"
              ? c.hand
              : String(watchMark(s, c.site, "folded") === true);
  const firstPerson = () => {
    switch (c.action) {
      case "lay":
        return [
          "I fitted the walker’s tracing over the fan.",
          "I pressed the mender’s heel into the notch.",
          "I turned the heel to face the water.",
        ][c.piece];
      case "layer":
        return [
          "I put both public landing steps on the outer sheet.",
          "I opened the nesting leaf at the table.",
          "I folded the local survey back under its cord.",
        ][c.piece];
      case "screen":
        return [
          "I left the name cards facing out.",
          "I covered the listener’s name.",
          "I drew the cloth over both names.",
        ][c.cover];
      case "sign":
        return (
          "I took the " +
          (c.part === "fan" ? "fan tracing" : "heel strip") +
          " to the " +
          (c.by === "walker" ? "bank walker" : "boot mender") +
          "."
        );
      case "hear":
        return c.seat === "rear"
          ? "I took the seat beside the loose panel."
          : "";
      case "carry":
        return "I tested the frame against the ferry rail.";
      case "send":
        return {
          fern: [
            "I left the two signed slips on the bank.",
            "I walked the harbour observer to the original tray.",
          ],
          stage: [
            "I saved a counterfoil for each listener.",
            "I put the signatures in the repair room.",
          ],
          island: [
            "I carried the public route to the deckhand.",
            "I offered to bring visitors to the keepers.",
          ],
        }[c.site][c.hand];
      default:
        return "";
    }
  };
  return diaryEvent(
    "whistle:" + c.site + ":" + c.action + ":" + details,
    c.action === "send" || c.action === "relieve" ? "choice" : "tool",
    "whistle." + c.site,
    w.title,
    [firstPerson(), whistleReport(s, c)].filter(Boolean).join(" "),
    {},
    "after-break",
  );
}
