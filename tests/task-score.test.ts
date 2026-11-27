import { describe, expect, it } from "vitest";
import { scoreAt } from "../src/domain/campaignScore";
import { renderScoreLoop } from "../src/app/campaignSynth";
import { captionFor } from "../src/app/captions";
import {
  taskLayer,
  taskMode,
  taskVolume,
  trialPhrase,
  trialSound,
} from "../src/domain/taskScore";
import { buildPack } from "../src/content";
import { startShowdown } from "../src/domain/showdown";

describe("the room music at a working table", () => {
  it("leaves audible clues room and keeps ordinary conversation and the diary in the original score", () => {
    expect(
      taskMode("bench-panel wide", "whistle-watch", "forest.station"),
    ).toBe("work");
    expect(
      taskMode("bench-panel wide", "whistle-watch", "stage.rehearsal"),
    ).toBe("listen");
    expect(taskMode("bench-panel wide", "bats")).toBe("listen");
    expect(taskMode("musicbox-panel wide")).toBe("listen");
    expect(taskMode("showdown wide")).toBe("hearing");
    expect(taskMode("journal wide")).toBe("roam");
    expect(taskMode("dialogue")).toBe("roam");
    expect(taskVolume.listen).toBeLessThan(taskVolume.work);
  });
  it("renders an identifiable, sparse four-bar layer in every chapter’s own key and meter", () => {
    for (let i = 1; i <= 16; i++) {
      const score = scoreAt("WORLD-" + String(i).padStart(2, "0"), "")!;
      for (const mode of ["work", "hearing"] as const) {
        const layer = taskLayer(score, mode);
        expect(layer.duration).toBeCloseTo((4 * score.meter * 60) / score.bpm);
        expect(layer.notes).toHaveLength(mode === "work" ? 3 : 2);
        expect(layer.notes[0].midi).toBe(score.tonic);
        expect(layer.notes[1].midi).toBe(score.tonic + 7);
        expect(captionFor("music.task." + mode)).toBeTruthy();
      }
    }
    const pcm = renderScoreLoop(taskLayer(scoreAt("WORLD-01", "")!, "hearing"));
    expect(pcm.left.some((v) => Math.abs(v) > 0.001)).toBe(true);
    expect(pcm.left[0]).toBe(0);
    expect(Math.abs(pcm.right.at(-1)!)).toBe(0);
  });
  it("gives opposed hearing endings the same receipt and leaves a repeated trial open to revision", () => {
    const hearing = buildPack().showdowns[0];
    const start = startShowdown(hearing);
    for (const outcome of ["split", "lost-ground", "won-over"] as const)
      expect(
        trialSound({ kind: "showdown", state: { ...start, outcome } }),
      ).toBe("handed-on");
    expect(trialSound({ kind: "showdown", state: start })).toBeUndefined();
    expect(
      trialSound({
        kind: "puzzle",
        puzzle: "case",
        ok: false,
        text: "The mark changes.",
      }),
    ).toBe("again");
    expect(
      trialSound({
        kind: "puzzle",
        puzzle: "case",
        ok: true,
        text: "Both marks fit.",
      }),
    ).toBe("impression");
    for (const kind of ["again", "impression", "handed-on"] as const) {
      expect(captionFor("trial." + kind)).toBeTruthy();
      const pcm = renderScoreLoop(trialPhrase(kind));
      expect(pcm.left.some((v) => Math.abs(v) > 0.001)).toBe(true);
      expect(pcm.left.every(Number.isFinite)).toBe(true);
    }
  });
});
