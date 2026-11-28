import { describe, it, expect } from "vitest";
import { Driver } from "./driver";
import { MAPS } from "../src/maps";
import { adventureJournalView } from "../src/domain/adventureJournal";
import { check } from "../src/domain/rules";
import {
  carryFlag,
  hasSpecimen,
  PERSPECTIVE_FLAG,
  specimenItemId,
  specimenToolId,
} from "../src/domain/specimenGear";
import {
  equippedLoan,
  loanMark,
  loanReading,
  loanSite,
  returnedLoan,
  workFieldLoan,
  type FieldLoanCommand,
  type Setting,
} from "../src/domain/fieldLoan";
import {
  loanBench,
  loanFamily,
  loanJobs,
  loanKeys,
  loanStops,
  stops,
  type LoanEdition,
  type LoanStop,
} from "../src/content/loanCrews";
import type { CampaignState, Effect } from "../src/domain/types";

const move = (
  key: string,
  stop: LoanStop,
  setting: Setting,
): FieldLoanCommand => ({
  type: "WorkFieldLoan",
  key,
  stop,
  mode: "try",
  setting,
});
const issue = (
  key: string,
  stop: LoanStop,
  edition: LoanEdition,
): FieldLoanCommand => ({
  type: "WorkFieldLoan",
  key,
  stop,
  mode: "issue",
  edition,
});
function flags(state: CampaignState, effects: Effect[]) {
  for (const e of effects) {
    if (!("setFlag" in e)) throw Error("Unexpected non-reversible event");
    state.flags[e.setFlag] = e.value;
  }
}
describe("The four receiving benches", () => {
  it("admits all 295 earned objects in exactly two other worlds and issues both editions for each receipt", () => {
    const d = new Driver(),
      pack = d.e.pack,
      specimens = pack.exhibits.filter(hasSpecimen);
    const records = new Map(specimens.map((e) => [e.specimen.key, e]));
    const places = new Map(
      Object.values(MAPS).flatMap((m) =>
        m.interactables
          .filter((p) => p.exhibit)
          .map((p) => [p.exhibit!, m.world] as const),
      ),
    );
    const keys = Object.values(loanKeys).flat();
    expect(keys).toHaveLength(295);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) {
      const record = records.get(key)!,
        job = loanJobs[loanFamily(key)!];
      expect(
        new Set([
          places.get(record.id),
          loanStops[job.primary].world,
          loanStops[job.other].world,
        ]).size,
      ).toBe(3);
      const accepted: LoanStop[] = [];
      d.s.inventory = { [specimenItemId(key)]: 1 };
      d.s.flags = {
        [carryFlag(key)]: true,
        [PERSPECTIVE_FLAG]: specimenToolId(key),
      };
      for (const stop of stops) {
        d.s.mapId = loanStops[stop].map;
        const bench = MAPS[d.s.mapId].interactables.find(
          (p) => p.id === loanBench(stop),
        )!;
        expect(check(bench.visibleIf, d.s)).toBe(
          stop === job.primary || stop === job.other,
        );
        const active = equippedLoan(pack, d.s, stop);
        if (!active) continue;
        accepted.push(stop);
        for (const incoming of [undefined, "carry", "keep"] as const) {
          const transfer = loanMark(active.peer, key) + ".sent";
          if (incoming) d.s.flags[transfer] = incoming;
          else delete d.s.flags[transfer];
          for (const setting of [0, 1, 2] as const)
            flags(d.s, workFieldLoan(pack, d.s, move(key, stop, setting)));
          for (const edition of ["carry", "keep"] as const) {
            flags(d.s, workFieldLoan(pack, d.s, issue(key, stop, edition)));
            expect(returnedLoan(d.s, stop, key)).toBe(edition);
            const route = MAPS[d.s.mapId].interactables.filter(
              (p) =>
                p.id.startsWith(loanSite(stop) + ".way.") &&
                check(p.visibleIf, d.s),
            );
            expect(route.map((p) => p.to?.map)).toEqual([
              loanStops[stop].targets[edition === "carry" ? 0 : 1],
            ]);
          }
        }
      }
      expect(new Set(accepted)).toEqual(new Set([job.primary, job.other]));
    }
  });
  it.each(stops)(
    "keeps the %s loan attached to this object, position and receipt across a reload",
    (stop) => {
      const d = new Driver(),
        job = Object.entries(loanJobs).find(([, j]) => j.primary === stop)!,
        key = loanKeys[job[0] as keyof typeof loanKeys][0],
        desk = loanStops[stop];
      const record = d.e.pack.exhibits
        .filter(hasSpecimen)
        .find((e) => e.specimen.key === key)!;
      const run = (cmd: FieldLoanCommand) => d.run(cmd);
      d.s.mapId = desk.map;
      expect(() => run(move(key, stop, 0))).toThrow("satchel");
      d.run({ type: "InspectExhibit", exhibit: record.id });
      d.s.objectivesDone.push(record.specimen.objective);
      d.run({ type: "ClaimSpecimen", exhibit: record.id });
      d.run({ type: "EquipPerspective", keepsake: specimenToolId(key) });
      expect(() => run(move("different-object", stop, 0))).toThrow("satchel");
      const model = equippedLoan(d.e.pack, d.s, stop)!;
      const sample = (i: Setting, position: Setting = 0) =>
        loanReading(record, model.card, stop, i, model.incoming, position);
      expect(sample(0)).not.toEqual(sample(1));
      expect(() =>
        run({ type: "WorkFieldLoan", key, stop, mode: "letter", letter: 0 }),
      ).toThrow("impression");
      run(move(key, stop, 0));
      expect(() =>
        run({ type: "WorkFieldLoan", key, stop, mode: "letter", letter: 2 }),
      ).toThrow("object");
      run({ type: "WorkFieldLoan", key, stop, mode: "letter", letter: 0 });
      for (const letter of [1, 2] as const)
        run({ type: "WorkFieldLoan", key, stop, mode: "letter", letter });
      expect(d.done(loanSite(stop) + ".questioned")).toBe(true);
      expect(d.s.adventureDiary.entries.at(-1)?.text).toContain(
        model.card.limits,
      );
      expect(() => run(issue(key, stop, "keep"))).toThrow("first two");
      run({ type: "WorkFieldLoan", key, stop, mode: "adjust", position: 1 });
      expect(sample(0, 0)).not.toEqual(sample(0, 1));
      run(move(key, stop, 1));
      expect(() => run(issue(key, stop, "keep"))).toThrow("first two");
      run(move(key, stop, 0));
      run(issue(key, stop, "keep"));
      const read = adventureJournalView(d.e.pack, d.s, []).entries.find((e) =>
        e.event?.key?.startsWith("field-loan:"),
      );
      expect(read?.specimenReference).toBe(key);
      expect(read?.topics?.concepts).toContain("evidence");
      expect(read?.event?.sourceIds).toEqual([record.specimen.source]);
      d.s = JSON.parse(JSON.stringify(d.s));
      const peer = model.peer;
      d.s.mapId = loanStops[peer].map;
      expect(() => run(move(key, stop, 0))).toThrow("satchel");
      const answer = equippedLoan(d.e.pack, d.s, peer)!;
      expect(answer.incoming).toBe("keep");
      run(move(key, peer, 0));
      run(move(key, peer, 1));
      run(issue(key, peer, "carry"));
      expect(d.done(loanSite(peer) + ".answered")).toBe(true);
      d.s.mapId = desk.map;
      expect(() => run(issue(key, stop, "carry"))).toThrow("first two");
      run(move(key, stop, 0));
      run(move(key, stop, 1));
      run(issue(key, stop, "carry"));
      expect(d.s.inventory[specimenItemId(key)]).toBe(1);
      d.s.flags[carryFlag(key)] = false;
      expect(() => run(move(key, stop, 1))).toThrow("satchel");
    },
  );
  it.each(stops)(
    "changes a physical reading at %s when a different receipt or arrangement arrives",
    (stop) => {
      const d = new Driver(),
        family = Object.keys(loanKeys).find(
          (k) => loanJobs[k as keyof typeof loanKeys].primary === stop,
        )! as keyof typeof loanKeys;
      const key = loanKeys[family][0],
        r = d.e.pack.exhibits
          .filter(hasSpecimen)
          .find((e) => e.specimen.key === key)!,
        card = d.e.pack.cards.find((c) => c.id === r.grantsCard)!;
      if (stop === "stage") {
        expect(loanReading(r, card, stop, 1, "first", 0).bell).toBe(false);
        expect(loanReading(r, card, stop, 1, "first", 1).bell).toBe(true);
        expect(loanReading(r, card, stop, 0, "carry", 2).bell).toBe(true);
      }
      const readings = (receipt: "first" | "keep" | "carry") =>
        [0, 1, 2].flatMap((position) =>
          [0, 1, 2].map((setting) =>
            loanReading(
              r,
              card,
              stop,
              setting as Setting,
              receipt,
              position as Setting,
            ),
          ),
        );
      const all = [readings("first"), readings("keep"), readings("carry")].map(
        (x) => JSON.stringify(x),
      );
      expect(new Set(all).size).toBe(3);
    },
  );
});
