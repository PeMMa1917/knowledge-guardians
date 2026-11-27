import type { CampaignState, Effect } from "./types";
import { diaryEvent } from "./adventureEvents";

export type WeirLampCommand = { type: "UseWeirLamp" } & (
  | { action: "pin"; slip: "before" | "after" }
  | { action: "overlay" }
  | { action: "deliver"; to: "watch" | "inquiry" }
);
type State = Pick<CampaignState, "inventory" | "mapId" | "flags">;
const prefix = "weir-lamp.";
export const lampWindow = "water.gatehouse";
export const envelope = (s: State) => {
  const to = s.flags[prefix + "to"];
  return to === "watch" || to === "inquiry" ? to : undefined;
};
export function firstWatch(s: State) {
  const guess = s.flags["vault-work.margin.first"];
  return typeof guess === "number" &&
    Number.isInteger(guess) &&
    guess >= 0 &&
    guess <= 2
    ? "In the vault I had pegged " +
        guess +
        " dry crossings out of two before the last leaves were opened."
    : "The old vault copy has no dated first peg. Its keeper left that part of the margin open.";
}
export const lampReadings = {
  before:
    "Before the rising water, the weir folder contained four dry-weather checks. Someone left a pencilled question about the high boards. The leaf has no reply or time of delivery.",
  after:
    "The inquiry drew a red line from that pencilled question to the spring flood. It knows where the water reached. Its line was drawn after the flood.",
};
export function weirLampLine(s: State, c: WeirLampCommand) {
  if (c.action === "pin") return lampReadings[c.slip];
  if (c.action === "overlay")
    return (
      "The red line continues across the fold onto the later sheet. The question was there before the water rose. I could find no earlier mark proving somebody had read it or predicted the height. " +
      firstWatch(s)
    );
  return (
    (c.to === "watch"
      ? "The next watch gets the old question with a blank space for the first person who checks the high boards."
      : "The inquiry gets the two dates on separate leaves. The families may read how the later line was drawn and ask for another witness.") +
    " " +
    firstWatch(s)
  );
}
export function useWeirLamp(s: State, c: WeirLampCommand): Effect[] {
  if (s.mapId !== lampWindow || !(s.inventory["item.brass-lamp"] > 0))
    throw Error("Bring Elsbet’s brass lamp to the table by the Old Weir.");
  const put = (id: string, value: string | boolean): Effect => ({
    setFlag: prefix + id,
    value,
  });
  if (c.action === "pin") {
    if (c.slip !== "before" && c.slip !== "after")
      throw Error("There are two dated leaves on the table.");
    return [put(c.slip, true)];
  }
  if (!s.flags[prefix + "before"] || !s.flags[prefix + "after"])
    throw Error("Set both leaves under the lamp.");
  if (c.action === "overlay") return [put("overlaid", true)];
  if (!s.flags[prefix + "overlaid"] || !["watch", "inquiry"].includes(c.to))
    throw Error("Hold the sheets together before sending a copy.");
  return [
    put("to", c.to),
    put("letter", weirLampLine(s, c)),
    ...(Number.isInteger(s.flags["vault-work.margin.first"]) &&
    Number.isInteger(s.flags["vault-work.margin.next"]) &&
    s.flags["vault-work.margin.flaps"] === 3
      ? [put("compared-first-peg", true)]
      : []),
  ];
}
export function weirLampDiary(s: State, c: WeirLampCommand) {
  return diaryEvent(
    "weir-lamp:" + c.action + (c.action === "pin" ? ":" + c.slip : ""),
    c.action === "deliver" ? "choice" : "tool",
    "weir-lamp",
    "The red line on the flood sheet",
    weirLampLine(s, c),
    {},
    "after-break",
  );
}
