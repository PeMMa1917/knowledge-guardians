import { diaryEvent } from "./adventureEvents";
import type { CampaignState, Effect, Weave } from "./types";

export const BIRD_HARBOUR = "sea.harbour";
export const BIRD_DOCK = "island.dock";
export const HOKULEA = "pvs:hokulea-1975";
export type Watch = "dawn" | "dusk" | "squall";
export type Berth = "west" | "east";
export type BirdCommand = { type: "PinBirdWatch"; watch: Watch; berth: Berth };
const watches: Watch[] = ["dawn", "dusk", "squall"];
const berths: Berth[] = ["west", "east"];
export const wingPin = (watch: Watch, berth: Berth) =>
  "birdside." + watch + "." + berth;
export const birdWeave: Weave = {
  concepts: [
    "evidence",
    "interpretation",
    "certainty",
    "explanation",
    "objectivity",
    "perspective",
  ],
  framework: ["scope", "methods-and-tools", "perspectives"],
  atl: ["thinking", "research"],
  aoks: ["NAT", "MAT", "IND"],
  subjects: ["biology", "geography", "math-ai"],
  thinking: {
    dok: 3,
    bloom: "analyse",
    fink: "integration",
    solo: "relational",
  },
  minutes: 5,
};

export const watchStrips: Record<
  Watch,
  { label: string; left: string; right: string; flight: string; note: string }
> = {
  dawn: {
    label: "First light",
    left: "open water",
    right: "nest ledge",
    flight: "west",
    note: "One flock crosses the middle buoy towards the west. The harbour clock still has its night cover on. A keeper lifts it. First light.",
  },
  dusk: {
    label: "Last light",
    left: "nest ledge",
    right: "open water",
    flight: "west",
    note: "A second crew logged a westbound flock at the same buoy on another day. The baker has already hung the evening lamp.",
  },
  squall: {
    label: "Rain watch",
    left: "unseen",
    right: "unseen",
    flight: "both ways",
    note: "A rain curtain hides the buoy. Two wings turn east and one turns west. The observer cannot see their markings or say whether any returned to a ledge.",
  },
};

export function pinBirds(
  s: Pick<CampaignState, "mapId">,
  cmd: BirdCommand,
): Effect[] {
  if (s.mapId !== BIRD_HARBOUR)
    throw new Error("The folding flock is at Seagrass Steps.");
  if (!watches.includes(cmd.watch) || !berths.includes(cmd.berth))
    throw new Error("Choose one watch and one ledge.");
  return [
    { setFlag: wingPin(cmd.watch, cmd.berth), value: true },
    { setFlag: "birdside.last", value: cmd.watch + "." + cmd.berth },
  ];
}

export function birdReading(watch: Watch, berth: Berth): string {
  if (watch === "squall")
    return (
      "My peg sits on the " +
      berth +
      " ledge. When I pull the cloth, the rain still hides both landings. A peg fixes a place on the board. It gives the lookout no new sighting."
    );
  const ledge: Berth = watch === "dawn" ? "east" : "west";
  const flight =
    watch === "dawn"
      ? "leaves the east ledge to feed"
      : "returns to the west ledge to roost";
  return (
    "I put the peg on the " +
    berth +
    " ledge. On this cloth the flock " +
    flight +
    ". " +
    (ledge === berth
      ? "The wing passes over my peg at the ledge. I still have only this watch’s record."
      : "The wing passes my peg on the open-water side. Turning the cloth changes what the westward arrow means.")
  );
}

export function birdDiary(cmd: BirdCommand) {
  return diaryEvent(
    "birdside:" + cmd.watch + ":" + cmd.berth,
    "tool",
    "birdside.watch",
    watchStrips[cmd.watch].label + " on the folding flock",
    birdReading(cmd.watch, cmd.berth),
    { sourceIds: ["HIS-PVS-LANDFALL"] },
  );
}
