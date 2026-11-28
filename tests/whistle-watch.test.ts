import { describe, expect, it } from "vitest";
import { Driver } from "./driver";
import { buildPack } from "../src/content";
import { whistlePlaces, type WhistleSite } from "../src/content/whistleWatch";
import { adventureJournalView } from "../src/domain/adventureJournal";
import { check } from "../src/domain/rules";
import { migrateCampaign } from "../src/domain/saves";
import { microSkillId } from "../src/domain/skills";
import {
  hearing,
  whistleReport,
  whistleReady,
  whoSigned,
  type WhistleCommand,
} from "../src/domain/whistleWatch";
import { MAPS } from "../src/maps";

type Move = WhistleCommand extends infer C
  ? C extends WhistleCommand
    ? Omit<C, "type" | "site">
    : never
  : never;
const place = (id: WhistleSite) => whistlePlaces.find((p) => p.id === id)!;
function arrive(d: Driver, id: WhistleSite) {
  d.s.mapId = place(id).map;
}
function doIt(d: Driver, site: WhistleSite, m: Move) {
  d.run({ type: "WorkWhistle", site, ...m });
}
const tools: Record<WhistleSite, Move[]> = {
  fern: [
    { action: "lay", piece: 0 },
    { action: "lay", piece: 1 },
    { action: "lay", piece: 2 },
    { action: "sign", part: "fan", by: "walker" },
    { action: "sign", part: "boot", by: "mender" },
  ],
  stage: [
    { action: "screen", cover: 0 },
    { action: "hear", seat: "front" },
    { action: "screen", cover: 1 },
    { action: "hear", seat: "front" },
    { action: "hear", seat: "rear" },
    { action: "screen", cover: 2 },
    { action: "hear", seat: "rear" },
  ],
  island: [
    { action: "layer", piece: 0 },
    { action: "layer", piece: 1 },
    { action: "carry" },
    { action: "layer", piece: 2 },
    { action: "carry" },
  ],
};
function door(d: Driver, id: string) {
  const p = MAPS[d.s.mapId].interactables.find((a) => a.id === id);
  return p && check(p.visibleIf, d.s) ? p.to?.map : undefined;
}

describe("Liri’s whistle watches", () => {
  it("keeps two signatures with their own impressions, including a visitor who declines to sign", () => {
    const d = new Driver();
    arrive(d, "fern");
    expect(() =>
      doIt(d, "fern", { action: "sign", part: "boot", by: "mender" }),
    ).toThrow(/impression/);
    expect(() => doIt(d, "island", { action: "layer", piece: 0 })).toThrow(
      /table/,
    );
    for (const p of [1, 2, 0] as const)
      doIt(d, "fern", { action: "lay", piece: p });
    doIt(d, "fern", { action: "sign", part: "fan", by: "mender" });
    expect(whoSigned(d.s, "fan")).toBeUndefined();
    doIt(d, "fern", { action: "sign", part: "fan", by: "walker" });
    doIt(d, "fern", { action: "sign", part: "boot", by: "walker" });
    expect(whistleReady(d.s, "fern")).toBe(false);
    doIt(d, "fern", { action: "sign", part: "boot", by: "mender" });
    for (const hand of [0, 1] as const) {
      doIt(d, "fern", { action: "send", hand });
      expect(d.s.flags["whistle.fern.sent"]).toBe(hand);
    }
    expect(d.p.skills[microSkillId(15)]).toHaveLength(1);
  });
  it("tests open, listener-covered and both-names-covered reports in either seat, and keeps their conditions separate", () => {
    const d = new Driver();
    arrive(d, "stage");
    expect(() => doIt(d, "stage", { action: "hear", seat: "rear" })).toThrow(
      /cloth/,
    );
    for (const cover of [2, 0, 1] as const) {
      doIt(d, "stage", { action: "screen", cover });
      doIt(d, "stage", { action: "hear", seat: "rear" });
    }
    expect([0, 1, 2].map((n) => hearing(d.s, n))).toEqual([2, 2, 2]);
    expect(whistleReady(d.s, "stage")).toBe(false);
    for (const cover of [1, 2, 0] as const) {
      doIt(d, "stage", { action: "screen", cover });
      doIt(d, "stage", { action: "hear", seat: "front" });
      expect(hearing(d.s, cover)).toBe(3);
      const shows = (seat: "front" | "rear") =>
        whistleReport(d.s, {
          type: "WorkWhistle",
          site: "stage",
          action: "hear",
          seat,
        });
      expect(shows("front")).toContain("two separated taps");
      expect(shows("rear")).toContain("only quivered");
    }
    for (const hand of [1, 0] as const)
      doIt(d, "stage", { action: "send", hand });
    expect(d.p.skills[microSkillId(544)]).toHaveLength(1);
  });
  it("lets all eight combinations travel in either chapter order with a remembered peer, separate reasons and a single whistle", () => {
    for (const order of [
      ["fern", "stage", "island"],
      ["island", "stage", "fern"],
    ] as const)
      for (let n = 0; n < 8; n++) {
        const d = new Driver();
        for (const [i, site] of order.entries()) {
          arrive(d, site);
          d.talk("liri-pell", i % 2 ? "on her own" : "Offer to take");
          expect(d.s.flags["whistle." + site + ".together"]).toBe(i % 2 === 0);
          for (const m of tools[site]) doIt(d, site, m);
          const hand = ((n >> i) & 1) as 0 | 1;
          doIt(d, site, { action: "send", hand });
          d.talk("liri-pell", "how the handover went");
          expect(d.s.flags["node.whistle." + site + ".recall" + hand]).toBe(
            true,
          );
        }
        for (const site of whistlePlaces) {
          arrive(d, site.id);
          d.talk("liri-pell", "other watch");
        }
        expect(d.s.inventory["item.notched-whistle"]).toBe(1);
        expect(
          d.s.flags[
            "node.whistle.stage.neighbour" +
              String(d.s.flags["whistle.fern.sent"])
          ],
        ).toBe(true);
        expect(
          d.s.flags[
            "node.whistle.island.neighbour" +
              String(d.s.flags["whistle.stage.sent"])
          ],
        ).toBe(true);
      }
  }, 30000);
  it("lets the two friends relieve another worker and remembers each watch across reload", () => {
    const d = new Driver();
    for (const p of whistlePlaces) {
      arrive(d, p.id);
      for (const move of tools[p.id]) doIt(d, p.id, move);
      doIt(d, p.id, { action: "send", hand: 1 });
      d.talk("liri-pell", "on her own");
      expect(() => doIt(d, p.id, { action: "relieve" })).toThrow(/offer/);
      d.talk("liri-pell", "Offer to take");
      doIt(d, p.id, { action: "relieve" });
      d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
      expect(() => doIt(d, p.id, { action: "relieve" })).toThrow(/already/);
      d.talk("liri-pell", "Ask about");
      expect(d.s.flags["node.whistle." + p.id + ".relief"]).toBe(true);
    }
  });
  it("recalls a printed ferry route, keeps the local details at the table and opens the other visitors’ path after a reload", () => {
    const d = new Driver();
    arrive(d, "island");
    const run = (m: Move) => doIt(d, "island", m);
    expect(() => run({ action: "carry" })).toThrow(/layers/);
    expect(() => run({ action: "layer", piece: 2 })).toThrow(/local inset/);
    run({ action: "layer", piece: 0 });
    run({ action: "layer", piece: 1 });
    run({ action: "layer", piece: 2 });
    run({ action: "carry" });
    expect(() => run({ action: "send", hand: 1 })).toThrow(/space/);
    run({ action: "layer", piece: 1 });
    run({ action: "carry" });
    run({ action: "layer", piece: 2 });
    expect(door(d, "whistle.day-ferry")).toBeUndefined();
    run({ action: "send", hand: 1 });
    expect(door(d, "whistle.keep-table")).toBe("island.margin");
    expect(() => run({ action: "recall" })).toThrow(/circulating/);
    run({ action: "send", hand: 0 });
    expect(door(d, "whistle.day-ferry")).toBe("island.dock");
    expect(door(d, "whistle.keep-table")).toBeUndefined();
    run({ action: "recall" });
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(door(d, "whistle.day-ferry")).toBeUndefined();
    expect(door(d, "whistle.keep-table")).toBe("island.margin");
    expect(() => run({ action: "send", hand: 0 })).toThrow(/permission/);
    expect(() => run({ action: "recall" })).toThrow(/circulating/);
    d.talk("liri-pell", "who recalled");
    expect(d.s.flags["node.whistle.island.withdrawn"]).toBe(true);
    expect(d.p.skills[microSkillId(825)]).toHaveLength(1);
    const entries = adventureJournalView(buildPack(), d.s, []).entries.filter(
      (e) => e.event?.key.startsWith("whistle:"),
    );
    expect(
      entries.some((e) => e.text.includes("suspend the copied route")),
    ).toBe(true);
    expect(
      entries.some((e) =>
        e.text.includes("Her sister finds the high-water turn"),
      ),
    ).toBe(true);
    expect(
      entries.every(
        (e) =>
          e.reflections?.length === 2 &&
          e.topics?.concepts?.includes("responsibility"),
      ),
    ).toBe(true);
  });
});
