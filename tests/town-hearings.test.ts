import { describe, expect, it } from "vitest";
import { hearingCard, hearingKey, townHearings } from "../src/content/hearings";
import { repairBook } from "../src/content/hearings/repairBook";
import { check } from "../src/domain/rules";
import { MAPS } from "../src/maps";
import { Driver } from "./driver";

const scenes = (d: Driver, id: string) =>
  d.e.visibleOptions(id, d.s).map((v) => v.option);
function choose(d: Driver, id: string, text: string) {
  const option = d.e
    .visibleOptions(id, d.s)
    .find((v) => v.option.text.includes(text));
  expect(option, text + " at " + id).toBeDefined();
  return d.run({ type: "ChooseDialogueOption", node: id, index: option!.index })
    .nextNode;
}

describe.each(townHearings)("$title", (h) => {
  const key = hearingKey(h);
  function chair(d: Driver, i: number) {
    const choice = choose(d, key + ".chair", "Unfold");
    expect(choice).toBe(key + ".ruling." + d.s.flags["sd." + key + ".outcome"]);
    d.walk(choice!, [h.stations[i].chair]);
    expect(d.s.flags[key + ".seat"]).toBe(i);
    const props = MAPS[h.map].interactables.filter(
      (p) => p.id.startsWith(key + ".chair") && check(p.visibleIf, d.s),
    );
    expect(props.map((p) => p.node)).toEqual([key + ".seated" + i]);
  }

  it("lets a newcomer decline or start without a card and gives both witnesses different limits on what they saw", () => {
    const d = new Driver();
    d.s.mapId = h.map;
    expect(d.e.talkEntry(h.host, d.s)).toBe(key + ".invite");
    d.talk(h.host, "Leave the chair");
    expect(d.s.showdown).toBeNull();
    expect(
      scenes(d, key + ".invite").some((o) => o.next === key + ".chair"),
    ).toBe(false);
    const rec = d.e.pack.showdowns.find((x) => x.id === key)!;
    expect(rec.witnesses.filter((w) => check(w.if, d.s))).toHaveLength(0);
    for (const [i, s] of h.stations.entries()) {
      const id = key + ".station" + i;
      d.run({ type: "EnterNode", node: id });
      expect(scenes(d, id).some((o) => o.next === id + ".signed")).toBe(false);
      const first = i,
        second = 1 - i;
      d.run({ type: "EnterNode", node: choose(d, id, s.readings[first][0])! });
      expect(
        scenes(d, id + ".read" + first).some((o) => o.next === id + ".signed"),
      ).toBe(false);
      d.run({
        type: "EnterNode",
        node: choose(d, id + ".read" + first, "other position")!,
      });
      d.walk(choose(d, id + ".read" + second, "Take the two")!);
      expect(d.s.cards).toContain(hearingCard(h, i));
      expect(d.done(id)).toBe(true);
    }
    expect(rec.witnesses.filter((w) => check(w.if, d.s))).toHaveLength(2);
    const gate = scenes(d, key + ".invite").find((o) => o.open);
    expect(gate?.open).toBe("showdown:" + key);
    d.run({ type: "ShowdownStart", showdown: key, relaxed: true });
    d.moves(
      { move: "claim", claim: "proposal0" },
      { move: "witness", witness: h.stations[0].speaker },
      { move: "concede" },
      { move: "witness", witness: h.stations[1].speaker },
    );
    expect(d.s.showdown?.log.map((line) => line.text).join(" ")).toContain(
      h.stations[1].witness,
    );
    d.moves({ move: "challenge", link: "link0", card: hearingCard(h, 1) });
    expect(d.done(key + ".checked0")).toBe(false);
    for (const i of [0, 1]) {
      d.moves({ move: "challenge", link: "link" + i, card: hearingCard(h, i) });
      expect(d.done(key + ".checked" + i)).toBe(true);
    }
    expect(d.s.flags["sd." + key + ".outcome"]).toBe("won-over");
    chair(d, 0);
    chair(d, 1);
    expect(d.s.journal).toEqual(
      expect.arrayContaining([
        "j." + key + ".seated0",
        "j." + key + ".seated1",
      ]),
    );
  });

  it("retains the two source editions in all eight repairs and unlocks the travelling book only after a reply", () => {
    const prev = townHearings[(townHearings.indexOf(h) + 3) % 4],
      old = hearingKey(prev);
    for (const first of [0, 1])
      for (const local of [0, 1])
        for (const method of [0, 1]) {
          const d = new Driver();
          d.s.mapId = h.map;
          d.run({ type: "EnterNode", node: key + ".invite" });
          d.run({ type: "ShowdownStart", showdown: key });
          d.moves({ move: "claim", claim: "proposal1" }, { move: "rest" });
          chair(d, local);
          const agate = d.e.talkEntry("agate-vale", d.s)!;
          expect(scenes(d, agate).some((o) => o.text.includes("reply"))).toBe(
            false,
          );
          const travelled = d.e.pack.showdowns
            .find((x) => x.id === key)!
            .witnesses.at(-1)!;
          expect(check(travelled.if, d.s)).toBe(false);
          d.run({ type: "SetFlag", flag: old + ".seat", value: first });
          const letter = choose(d, agate, "Open the reply")!;
          d.run({ type: "EnterNode", node: letter });
          expect(d.e.node(letter).text).toBe(prev.stations[first].nextTown);
          expect(check(travelled.if, d.s)).toBe(true);
          const bench = choose(d, letter, "repair bench")!;
          expect(d.e.node(bench).text).toContain(h.stations[local].handover);
          const finish = choose(d, bench, repairBook[h.id].methods[method])!;
          d.walk(finish);
          expect(d.done(key + ".amended")).toBe(true);
          const props = MAPS[h.map].interactables.filter(
            (p) => p.id.startsWith(key + ".repair") && check(p.visibleIf, d.s),
          );
          expect(props.map((p) => p.label)).toEqual([
            repairBook[h.id].plaque[method],
          ]);
          d.run({ type: "SetFlag", flag: old + ".seat", value: 1 - first });
          chair(d, 1 - local);
          expect(d.s.flags[key + ".amended.from"]).toBe(first);
          expect(d.s.flags[key + ".amended.local"]).toBe(local);
          expect(d.s.flags[key + ".amended"]).toBe(method);
        }
  });
});
