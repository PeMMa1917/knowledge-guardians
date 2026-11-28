import type { GameEvent } from "./engine";
import type { ScoreLoop, WorldScore } from "./campaignScore";

export type TaskMode = "roam" | "work" | "hearing" | "listen";
export type TrialSound = "impression" | "again" | "handed-on";
const listeningGames = new Set(["bats", "spare-moon-music", "shift-coat"]);
export function taskMode(
  panelClass: string,
  game?: string,
  map?: string,
): TaskMode {
  const tokens = panelClass.split(/\s+/);
  if (
    tokens.includes("musicbox-panel") ||
    (game === "whistle-watch" && map === "stage.rehearsal")
  )
    return "listen";
  if (tokens.includes("showdown")) return "hearing";
  if (
    game &&
    (listeningGames.has(game) ||
      /^(curtain-call|time-room|maker-bench|facing-cue|callboard):/.test(game))
  )
    return "listen";
  if (
    game ||
    tokens.some((t) =>
      ["bench-panel", "tiles-panel", "label-panel", "puzzle-panel"].includes(t),
    )
  )
    return "work";
  return "roam";
}
export const taskVolume: Record<TaskMode, number> = {
  roam: 1,
  work: 0.52,
  hearing: 0.37,
  listen: 0.14,
};
export const taskCaptions: Record<string, string> = {
  "music.task.work": "A soft pulse joins the room music at the workbench",
  "music.task.hearing": "Two quiet notes trade places under the voices",
  "music.task.listen": "The room music falls back for the listening task",
  "trial.impression": "Two close wooden notes mark a reading",
  "trial.again": "A soft hollow tap leaves the trial open",
  "trial.handed-on": "A short bell marks the handover",
};
export function taskLayer(
  score: WorldScore,
  mode: "work" | "hearing",
): ScoreLoop {
  const beat = 60 / score.bpm,
    bar = score.meter * beat;
  const beats =
    mode === "work"
      ? [0, score.meter + 0.5, 3 * score.meter]
      : [1, 2 * score.meter + 1];
  const notes = beats.map((at, i) => ({
    midi: score.tonic + (i % 2 ? 7 : 0),
    voice: mode === "work" ? ("wood" as const) : ("felt" as const),
    at: at * beat,
    duration: beat * 0.32,
    strength: 0.62,
    pan: i % 2 ? 0.25 : -0.25,
  }));
  return { duration: 4 * bar, notes };
}
export function trialSound(event: GameEvent): TrialSound | undefined {
  switch (event.kind) {
    case "reading":
    case "puzzle":
    case "craft":
      return event.ok ? "impression" : "again";
    case "lock":
      return event.result.opened ? "impression" : "again";
    case "label":
      return event.result.holds ? "handed-on" : "again";
    case "showdown":
      return event.state.outcome ? "handed-on" : undefined;
    case "fieldgame":
      return "handed-on";
  }
}
export function trialPhrase(kind: TrialSound): ScoreLoop {
  const pitches =
    kind === "impression" ? [62, 64] : kind === "again" ? [58] : [65, 62, 67];
  return {
    duration: 0.8,
    notes: pitches.map((midi, i) => ({
      midi,
      voice: kind === "handed-on" ? "bell" : "wood",
      at: i * 0.095,
      duration: 0.11,
      strength: 0.62,
      pan: 0,
    })),
  };
}
