import { describe, expect, it } from "vitest";
import {
  BIRD_DOCK,
  BIRD_HARBOUR,
  HOKULEA,
  birdReading,
  type Berth,
  type Watch,
} from "../src/domain/birdSide";
import { canoeExhibit } from "../src/content/seaBirdWatch";
import {
  encyclopediaForBiography,
  encyclopediaForExhibit,
  encyclopediaForDiaryEvent,
  encyclopediaLinks,
} from "../src/domain/encyclopedia";
import { check } from "../src/domain/rules";
import {
  canClaimSpecimen,
  hasSpecimen,
  specimenItemId,
  specimenToolId,
} from "../src/domain/specimenGear";
import { MAPS } from "../src/maps";
import { Driver } from "./driver";

const home = "birdside.folder";
const choices = (d: Driver, node: string) => d.e.visibleOptions(node, d.s);
function pick(d: Driver, node: string, text: string) {
  const choice = choices(d, node).find((v) => v.option.text.includes(text));
  expect(choice, node + " / " + text).toBeDefined();
  const next = d.run({
    type: "ChooseDialogueOption",
    node,
    index: choice!.index,
  }).nextNode;
  if (next) d.run({ type: "EnterNode", node: next });
  return next;
}
const pull = (d: Driver, watch: Watch, berth: Berth) =>
  d.run({ type: "PinBirdWatch", watch, berth });
const read = (d: Driver, which: string) => {
  const page = pick(d, home, which)!;
  pick(d, page, "back into the pocket");
};

describe("Sora’s spare key", () => {
  it("checks a printed caption with the learner’s account and a spoken inference with the voyage history", () => {
    const d = new Driver();
    d.s.mapId = BIRD_HARBOUR;
    d.run({ type: "EnterNode", node: home });
    for (const first of ["learner’s account", "crew’s voyage"]) {
      const learner = first === "learner’s account";
      const copy = new Driver();
      copy.s.mapId = BIRD_HARBOUR;
      read(copy, first);
      expect(choices(copy, home).map((v) => v.option.next)).not.toContain(
        "birdside.crew",
      );
      expect(
        encyclopediaLinks(copy.e.pack, copy.s).map((l) => l.title),
      ).toEqual([learner ? "Nainoa Thompson" : "Mau Piailug"]);
      read(copy, learner ? "crew’s voyage" : "learner’s account");
      expect(
        encyclopediaForDiaryEvent(copy.e.pack, {
          kind: "conversation",
          key: "conversation:birdside.memory",
          ref: "birdside.memory",
        })?.title,
      ).toBe("Nainoa Thompson");
      expect(pick(copy, home, "Renna printed")).toBe("birdside.paper");
      expect(pick(copy, "birdside.paper", "voyage dates")).toBe(
        "birdside.dates-limit",
      );
      expect(copy.done("birdside.paper")).toBe(false);
      pick(copy, "birdside.dates-limit", "Try the account");
      pick(copy, "birdside.paper", "learner’s pencil");
      expect(copy.done("birdside.paper")).toBe(true);
      pick(copy, "birdside.paper-mended", "second learning place");
      pick(copy, "birdside.second-lesson", learner ? "blank line" : "question");
      expect(copy.done("birdside.lesson-range")).toBe(true);
      pick(copy, home, "who else");
      pick(copy, "birdside.crew", "pencil lesson");
      expect(copy.done("birdside.crew")).toBe(false);
      pick(copy, "birdside.memory-limit", "who sailed");
      pick(copy, "birdside.crew", "voyage record");
      expect(copy.done("birdside.crew")).toBe(true);
      expect(choices(copy, home).map((v) => v.option.next)).not.toContain(
        "birdside.offer",
      );
      for (const [id, title] of [
        ["memory", "Nainoa Thompson"],
        ["voyage", "Mau Piailug"],
      ]) {
        const card = copy.e.pack.cards.find(
          (c) => c.id === "card.birdside." + id,
        )!;
        expect(encyclopediaForBiography(card)?.title).toBe(title);
      }
    }
  });
  it("holds the observation side fixed across the two hours, accepts either peg and leaves the squall unresolved", () => {
    const d = new Driver();
    expect(() => pull(d, "dawn", "west")).toThrow("Seagrass Steps");
    d.s.mapId = BIRD_HARBOUR;
    expect(() => pull(d, "noon" as Watch, "west")).toThrow("watch");
    pull(d, "dawn", "east");
    pull(d, "dusk", "west");
    pull(d, "squall", "west");
    expect(d.done("birdside.cloth")).toBe(false);
    pull(d, "dawn", "west");
    expect(d.done("birdside.cloth")).toBe(true);
    for (const side of ["west", "east"] as const) {
      expect(birdReading("squall", side)).toContain("still hides both");
      expect(birdReading("dawn", side)).toContain("leaves the east");
      expect(birdReading("dusk", side)).toContain("returns to the west");
    }
    expect(
      d.s.adventureDiary.entries.some(
        (e) => e.event?.key === "birdside:dawn:west",
      ),
    ).toBe(true);
  });
  it("opens each of four handovers only with the earned canoe and carries the reply home", () => {
    for (const guide of ["board", "lamp"])
      for (const route of ["wait", "walk"]) {
        const d = new Driver();
        d.s.mapId = BIRD_HARBOUR;
        const exhibit = d.e.pack.exhibits.find((ex) => ex.id === canoeExhibit)!;
        if (!hasSpecimen(exhibit)) throw Error("Expected the identified canoe");
        d.run({ type: "InspectExhibit", exhibit: canoeExhibit });
        expect(canClaimSpecimen(d.s, exhibit)).toBe(false);
        read(d, "crew’s voyage");
        read(d, "learner’s account");
        pick(d, home, "Renna printed");
        pick(d, "birdside.paper", "learner’s pencil");
        pick(d, home, "who else");
        pick(d, "birdside.crew", "voyage record");
        for (const watch of ["dusk", "dawn", "squall"] as const)
          pull(d, watch, "east");
        pick(d, home, "Fit a guide");
        pick(
          d,
          "birdside.offer",
          guide === "board" ? "a board" : "turning lamp",
        );
        expect(canClaimSpecimen(d.s, exhibit)).toBe(true);
        d.run({ type: "ClaimSpecimen", exhibit: canoeExhibit });
        d.run({ type: "ClaimSpecimen", exhibit: canoeExhibit });
        expect(d.s.inventory[specimenItemId(HOKULEA)]).toBe(1);
        expect(encyclopediaForExhibit(exhibit)?.title).toBe("Hōkūleʻa");
        d.s = JSON.parse(JSON.stringify(d.s));
        d.s.mapId = BIRD_DOCK;
        const props = MAPS[BIRD_DOCK].interactables.filter((p) =>
          p.id.startsWith("birdside."),
        );
        const rail = props.find((p) => p.node === "birdside.return")!;
        expect(check(rail.visibleIf, d.s)).toBe(false);
        d.run({ type: "EquipPerspective", keepsake: specimenToolId(HOKULEA) });
        expect(check(rail.visibleIf, d.s)).toBe(true);
        const page = pick(
          d,
          rail.node!,
          guide === "board" ? "two-row" : "two-person",
        );
        expect(page).toBe("birdside.return-" + guide);
        pick(d, page!, route === "wait" ? "Wait at the rail" : "Walk the two");
        expect(
          props
            .filter((p) => p.kind === "door" && check(p.visibleIf, d.s))
            .map((p) => p.to?.map),
        ).toEqual([route === "wait" ? "island.margin" : "island.workshop"]);
        d.s.mapId = "stage.gallery";
        const projector = MAPS[d.s.mapId].interactables.find(
          (p) => p.id === "birdside.projector",
        )!;
        expect(check(projector.visibleIf, d.s)).toBe(true);
        pick(d, projector.node!, "stock silhouette");
        expect(d.done("birdside.projection.image")).toBe(false);
        pick(d, "birdside.stock", "Slide the glass");
        const slide = pick(
          d,
          projector.node!,
          guide === "board" ? "launch record" : "two voyages",
        )!;
        pick(d, slide, "Expose");
        expect(d.done("birdside.projection.image")).toBe(true);
        pick(d, "birdside.project-range", "Every navigator");
        expect(d.done("birdside.projection.range")).toBe(false);
        pick(d, "birdside.every", "Move the edge");
        pick(
          d,
          "birdside.project-range",
          route === "wait" ? "one learner" : "next historian",
        );
        expect(d.s.flags["birdside.projection.range"]).toBe(
          route === "wait" ? "particular" : "compare",
        );
        d.s.mapId = BIRD_HARBOUR;
        expect(pick(d, home, "returned key")).toBe("birdside.key");
        expect(choices(d, "birdside.key").map((v) => v.option.next)).toEqual([
          "birdside.key-" + route,
        ]);
      }
  });
});
