import { canoeExhibit } from "../content/seaBirdWatch";
import { BIRD_DOCK, BIRD_HARBOUR, HOKULEA } from "../domain/birdSide";
import { specimenEquipped } from "../domain/specimenGear";
import type { Interactable } from "./types";

export function foldingFlockAt(map: string): Interactable[] {
  if (map === BIRD_HARBOUR)
    return [
      {
        id: "birdside.folder",
        kind: "scene",
        node: "birdside.folder",
        label: "Sora’s spare key and two pockets",
        art: "ledger",
        x: 13,
        y: 12,
        w: 1,
        h: 1,
      },
      {
        id: "birdside.model",
        kind: "exhibit",
        exhibit: canoeExhibit,
        label: "Hōkūleʻa at the launch stand",
        art: "birdside.canoe",
        x: 14,
        y: 12,
        w: 1,
        h: 1,
      },
      {
        id: "birdside.cloth",
        kind: "fieldgame",
        game: "birdside-watch",
        label: "The folding flock",
        art: "birdside.cloth",
        x: 15,
        y: 12,
        w: 1,
        h: 1,
      },
    ];
  if (map === "stage.gallery")
    return [
      {
        id: "birdside.projector",
        kind: "scene",
        node: "birdside.project",
        label: "The canoe mask in the projection booth",
        art: "birdside.cloth",
        x: 11,
        y: 14,
        w: 1,
        h: 1,
        visibleIf: specimenEquipped(HOKULEA),
      },
      {
        id: "birdside.dated-slide",
        kind: "scene",
        node: "birdside.launch-slide",
        label: "The Kualoa launch slide",
        art: "birdside.cloth",
        x: 13,
        y: 14,
        w: 1,
        h: 1,
        walkThrough: true,
        visibleIf: { flag: "birdside.projection.image", eq: "launch" },
      },
      {
        id: "birdside.crew-slide",
        kind: "scene",
        node: "birdside.voyage-slide",
        label: "Two voyages on the same hulls",
        art: "ledger",
        x: 13,
        y: 14,
        w: 1,
        h: 1,
        walkThrough: true,
        visibleIf: { flag: "birdside.projection.image", eq: "voyages" },
      },
    ];
  if (map === BIRD_DOCK)
    return [
      {
        id: "birdside.return",
        kind: "scene",
        node: "birdside.return",
        label: "The mitten and the folding rail",
        art: "birdside.cloth",
        x: 9,
        y: 10,
        w: 1,
        h: 1,
        visibleIf: specimenEquipped(HOKULEA),
      },
      {
        id: "birdside.second-watch",
        kind: "door",
        label: "The paired watch passage to the Quiet Margin",
        art: "lantern",
        x: 11,
        y: 10,
        w: 1,
        h: 1,
        walkThrough: true,
        visibleIf: { flag: "birdside.harbour-reply", eq: "wait" },
        to: { map: "island.margin", x: 5, y: 10 },
      },
      {
        id: "birdside.pier-walk",
        kind: "door",
        label: "The chalked walk to the Plan Workshop",
        art: "road-post",
        x: 11,
        y: 10,
        w: 1,
        h: 1,
        walkThrough: true,
        visibleIf: { flag: "birdside.harbour-reply", eq: "walk" },
        to: { map: "island.workshop", x: 12, y: 12 },
      },
    ];
  return [];
}
