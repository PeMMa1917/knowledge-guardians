import { vaultReturnSquare } from "../src/maps/undercroft";
import { describe, expect, it } from "vitest";
import { buildPack } from "../src/content";
import {
  vaultStations,
  vaultWork,
  type VaultStation,
} from "../src/content/vaultNight";
import { adventureJournalView } from "../src/domain/adventureJournal";
import { apply, emptyOutputs } from "../src/domain/rules";
import { migrateCampaign } from "../src/domain/saves";
import { microSkillId } from "../src/domain/skills";
import {
  firstPeg,
  gateMask,
  nextPeg,
  vaultReceipts,
  workVault,
  vaultReady,
  type VaultCommand,
} from "../src/domain/vaultWork";
import { firstWatch, useWeirLamp } from "../src/domain/weirLamp";
import { Driver } from "./driver";

type Move = VaultCommand extends infer C
  ? C extends VaultCommand
    ? Omit<C, "station" | "type">
    : never
  : never;
const vault = "aethelgard.undercroft";
const go = (station: VaultStation, move: Move): VaultCommand => ({
  type: "WorkVault",
  station,
  ...move,
});
const moves: Record<VaultStation, Move[]> = {
  many: [
    { action: "ring", felt: false },
    { action: "ring", felt: true },
    { action: "latch" },
  ],
  twogates: [
    { action: "link", open: true },
    { action: "link", open: false },
    { action: "unhook" },
    { action: "shutter", place: 1 },
  ],
  chosen: [
    { action: "shelf", start: "tabs" },
    { action: "shelf", start: 3 },
  ],
  stamp: [0, 1, 2].map((layer) => ({
    action: "wax",
    layer: layer as 0 | 1 | 2,
  })),
  margin: [
    { action: "peg", count: 2 },
    { action: "flap", leaf: 0 },
    { action: "flap", leaf: 1 },
    { action: "peg", count: 1 },
  ],
  promise: [
    { action: "letter", edge: "after" },
    { action: "letter", edge: "before" },
    { action: "ear", who: "Archivist" },
    { action: "ear", who: "Elsbet" },
  ],
};
function stand() {
  const d = new Driver();
  d.s.mapId = vault;
  d.s.flags["undercroft.found"] = true;
  return d;
}
function open(d: Driver, station: VaultStation, hand: 0 | 1) {
  for (const m of moves[station]) d.run(go(station, m));
  d.run(go(station, { action: "leave", for: hand }));
}

describe("The watch under Elsbet’s study", () => {
  it("returns a legacy save on the old southern bypass to the near side of its first closed grate", () => {
    const s = stand().s,
      outside = { x: 29, y: 7 };
    for (const [gate, x] of [
      ["many", 8],
      ["twogates", 16],
      ["chosen", 24],
    ] as const) {
      expect(vaultReturnSquare(outside, s.flags)).toEqual({ x, y: 5 });
      const valid = { x: x - 2, y: 4 };
      expect(vaultReturnSquare(valid, s.flags)).toBe(valid);
      s.flags["trap." + gate + ".open"] = true;
    }
    expect(vaultReturnSquare(outside, s.flags)).toBe(outside);
  });
  it("takes all 64 routes to the lamp and remembers the individual handovers without a second reward", () => {
    const start = stand().s;
    for (let bits = 0; bits < 64; bits++) {
      let s = start;
      function act(c: VaultCommand) {
        s = apply(workVault(s, c), s, emptyOutputs());
      }
      for (const [i, station] of vaultStations.entries()) {
        expect(vaultReady(s, station)).toBe(false);
        expect(() => act(go(station, { action: "leave", for: 0 }))).toThrow();
        for (const m of moves[station]) act(go(station, m));
        const hand = ((bits >> i) & 1) as 0 | 1;
        act(go(station, { action: "leave", for: hand }));
        expect(vaultReceipts(s).at(-1)?.text).toContain(
          vaultWork[station].replies[hand],
        );
        expect(() =>
          act(go(station, { action: "leave", for: hand })),
        ).toThrow();
      }
      expect(vaultReceipts(s)).toHaveLength(6);
      expect(s.inventory["item.brass-lamp"]).toBe(1);
      expect(s.marks - start.marks).toBe(16);
      expect(s.flags["undercroft.done"]).toBe(true);
    }
  });
  it("leaves any of eight arrangements once a visitor has used a separate shutter", () => {
    const d = stand();
    open(d, "many", 0);
    expect(() =>
      d.run(go("twogates", { action: "shutter", place: 0 })),
    ).toThrow(/link/);
    expect(() => d.run(go("twogates", { action: "unhook" }))).toThrow(
      /each end/,
    );
    for (const m of moves.twogates) d.run(go("twogates", m));
    const start = d.s;
    for (let mask = 0; mask < 8; mask++) {
      d.s = start;
      for (let i = 0; i < 3; i++)
        if ((mask ^ gateMask(d.s)) & (1 << i))
          d.run(go("twogates", { action: "shutter", place: i }));
      d.run(go("twogates", { action: "leave", for: 1 }));
      expect(d.s.flags["vault-work.twogates.sent-mask"]).toBe(mask);
      const text = vaultReceipts(d.s)[1].text;
      expect((text.match(/goes through/g) ?? []).length).toBe(
        mask.toString(2).split("1").length - 1,
      );
    }
  });
  it("requires the unselected run of nights and the partly lost record behind the green tabs", () => {
    const d = stand();
    expect(() => d.run(go("stamp", { action: "wax", layer: 1 }))).toThrow();
    open(d, "many", 1);
    open(d, "twogates", 1);
    d.run(go("chosen", { action: "shelf", start: "tabs" }));
    d.run(go("chosen", { action: "shelf", start: 1 }));
    expect(d.s.flags["vault-work.chosen.wet"]).toBe(true);
    expect(vaultReady(d.s, "chosen")).toBe(false);
    d.run(go("chosen", { action: "shelf", start: 3 }));
    expect(vaultReady(d.s, "chosen")).toBe(true);
    expect(() =>
      workVault(
        { ...d.s, mapId: "nexus.archive" },
        go("chosen", { action: "leave", for: 0 }),
      ),
    ).toThrow(/vault/);
  });
  it("retains the original forecast for either reveal order and any pair of pegs across a reload", () => {
    const d = stand();
    for (const id of ["many", "twogates", "chosen", "stamp"] as const)
      open(d, id, 1);
    const start = d.s;
    for (const first of [0, 1, 2] as const)
      for (const second of [0, 1, 2] as const)
        for (const leaf of [0, 1] as const) {
          let s = start;
          function act(m: Move) {
            s = apply(workVault(s, go("margin", m)), s, emptyOutputs());
          }
          expect(() => act({ action: "flap", leaf })).toThrow(/peg/);
          act({ action: "peg", count: first });
          act({ action: "flap", leaf });
          s = migrateCampaign(JSON.parse(JSON.stringify(s))).state;
          expect(() => act({ action: "peg", count: second })).toThrow(
            /stays put/,
          );
          act({ action: "flap", leaf: leaf === 0 ? 1 : 0 });
          act({ action: "peg", count: second });
          act({ action: "leave", for: 0 });
          expect([firstPeg(s), nextPeg(s)]).toEqual([first, second]);
          expect(vaultReceipts(s).at(-1)?.text).toContain(
            "My first peg marked " + first,
          );
        }
  });
  it("gives each chair a fair hearing and carries the earlier forecast to both possible council recipients", () => {
    const d = stand();
    for (const id of vaultStations.slice(0, 5)) open(d, id, 0);
    expect(() =>
      d.run(go("promise", { action: "ear", who: "Archivist" })),
    ).toThrow(/both edges/);
    open(d, "promise", 0);
    const s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(vaultReceipts(s).map((r) => r.station)).toEqual(vaultStations);
    d.s = {
      ...s,
      mapId: "water.gatehouse",
      flags: { ...s.flags, "visited.map.water.gatehouse": true },
    };
    expect(
      d.e.visibleOptions("vesper.lamp", d.s).map((o) => o.option.next),
    ).toEqual(["vesper.choose"]);
    expect(() => d.run({ type: "UseWeirLamp", action: "overlay" })).toThrow(
      /both/,
    );
    d.run({ type: "UseWeirLamp", action: "pin", slip: "after" });
    d.run({ type: "UseWeirLamp", action: "pin", slip: "before" });
    expect(() =>
      d.run({ type: "UseWeirLamp", action: "deliver", to: "watch" }),
    ).toThrow(/together/);
    d.run({ type: "UseWeirLamp", action: "overlay" });
    for (const to of ["inquiry", "watch"] as const) {
      d.run({ type: "UseWeirLamp", action: "deliver", to });
      expect(d.done("weir-lamp.compared-first-peg")).toBe(true);
      expect(
        d.e.visibleOptions("vesper.lamp", d.s).map((o) => o.option.next),
      ).toEqual(["vesper.weir-" + to, "vesper.choose"]);
      expect(d.e.node("vesper.weir-" + to).next).toBe("vesper.choose");
      expect(d.s.flags["weir-lamp.letter"]).toContain("2 dry crossings");
    }
    for (const id of [96, 302, 113, 1069])
      expect(d.p.skills[microSkillId(id)]).toHaveLength(1);
    const entries = adventureJournalView(buildPack(), d.s, []).entries.filter(
      (e) => e.event && /^(vault:|weir-lamp:)/.test(e.event.key),
    );
    for (const station of vaultStations)
      expect(entries.some((e) => e.event?.ref === "vault." + station)).toBe(
        true,
      );
    expect(
      entries.every(
        (e) => e.reflections?.length === 2 && e.topics?.concepts?.length,
      ),
    ).toBe(true);
  });
  it("lets a returning keeper use a legacy lamp and preserves the unknown first peg", () => {
    const d = stand();
    d.s.flags["trap.many.open"] = true;
    expect(() => d.run(go("many", { action: "latch" }))).toThrow(
      /already open/,
    );
    open(d, "twogates", 1);
    expect(vaultReceipts(d.s).map((r) => r.station)).toEqual(["twogates"]);
    d.s.mapId = "water.gatehouse";
    const pin = { type: "UseWeirLamp", action: "pin", slip: "before" } as const;
    expect(() => useWeirLamp(d.s, pin)).toThrow(/lamp/);
    d.s.inventory["item.brass-lamp"] = 1;
    expect(() => useWeirLamp({ ...d.s, mapId: vault }, pin)).toThrow(/Weir/);
    d.run(pin);
    d.run({ ...pin, slip: "after" });
    d.run({ type: "UseWeirLamp", action: "overlay" });
    d.run({ type: "UseWeirLamp", action: "deliver", to: "inquiry" });
    expect(firstWatch(d.s)).toContain("no dated first peg");
    expect(d.s.flags["weir-lamp.compared-first-peg"]).toBeUndefined();
    expect(d.s.flags["weir-lamp.letter"]).toContain("no dated first peg");
  });
});
