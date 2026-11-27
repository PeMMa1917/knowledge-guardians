import type { GameController } from "../app/controller";
import { ladderPanel } from "./ladderPanel";
import { labyrinthPanel } from "./labyrinthPanel";
import { surveyPanel } from "./surveyPanel";
import { mirrorPanel } from "./mirrorPanel";
import { batPanel } from "./batPanel";
import { fairPanel } from "./fairPanel";
import { patternPanel } from "./patternPanel";
import { primerPanel } from "./primerPanel";
import { reassemblyPanel } from "./reassemblyPanel";
import { festivalPanel } from "./festivalPanel";
import { fogPanel } from "./fogPanel";
import { tokenPanel } from "./tokenPanel";
import { collagePanel } from "./collagePanel";
import { riverPanel } from "./riverPanel";
import { lensPanel } from "./lensPanel";
import { relayPanel } from "./relayPanel";
import { assayPanel } from "./assayPanel";
import { treesPanel } from "./treesPanel";
import { scriptRailPanel } from "./scriptRail";
import { workSchedulePanel } from "./workSchedule";
import { materialStorePanel } from "./materialStores";
import { objectUsePanel } from "./objectUse";
import { timbuktuHorizonPanel } from "./timbuktuHorizon";
import { earlierViewingPanel } from "./earlierViewing";
import { EARLIER_VIEWING } from "../content/earlierViewing";
import { starField } from "./starPaths";
import { STAR_GAME } from "../domain/starPaths";
import { warmRoomPanel } from "./warmRoom";
import { WARM_TOOL } from "../domain/warmRoom";
import { ferryPackingPanel } from "./ferryPacking";
import { PACKING_TOOL } from "../domain/ferryPacking";
import { modelRecordPanel } from "./modelRecords";
import { MODEL_RECORD_GROUP } from "../content/modelRecords";
import { numberLeavesPanel } from "./numberLeaves";
import { NUMBER_LEAF_GROUP } from "../content/numberLeaves";
import { lanternWeavePanel } from "./lanternWeave";
import { LANTERN_WEAVE } from "../content/lanternWeave";
import { copyImprint } from "./copyImprint";
import { IMPRINT_GROUP } from "../content/copyImprintCases";
import { referenceProofPanel } from "./referenceProofs";
import { REFERENCE_PROOF } from "../domain/referenceProofs";

type GamePanel = (
  controller: GameController,
  sound: (key: string) => void,
  finish: () => HTMLElement,
  close: () => void,
) => HTMLElement;
type StationPanel = (
  controller: GameController,
  station: string,
  sound: (key: string) => void,
  refresh: () => void,
) => HTMLElement;
interface Panel<T> {
  title: string;
  open: T;
}

export const fieldGamePanels = new Map<string, Panel<GamePanel>>([
  ["ladder", { title: "The Copyists' Ladder", open: ladderPanel }],
  ["maze", { title: "The Labyrinth Lens", open: labyrinthPanel }],
  ["survey", { title: "The Survey Bell", open: surveyPanel }],
  ["mirror", { title: "The Time Mirror", open: mirrorPanel }],
  ["bats", { title: "The Bat Keeper", open: batPanel }],
  ["fair", { title: "The Value Fair", open: fairPanel }],
  ["pattern", { title: "The Pattern Book", open: patternPanel }],
  ["primer", { title: "The Primer Page", open: primerPanel }],
  ["reassembly", { title: "The Reassembly Line", open: reassemblyPanel }],
  ["festival", { title: "The Festival Dilemma", open: festivalPanel }],
  ["fog", { title: "The Fog Chart", open: fogPanel }],
  ["tokens", { title: "The Token Drawer", open: tokenPanel }],
  ["collage", { title: "The Collage Wall", open: collagePanel }],
  ["river", { title: "The River Crossing Inquiry", open: riverPanel }],
  ["lens", { title: "The Lens Table", open: lensPanel }],
  ["relay", { title: "The Sketch Relay", open: relayPanel }],
  ["assay", { title: "The Assay Trial", open: assayPanel }],
  ["trees", { title: "The Three Trees", open: treesPanel }],
]);
const stationPanels = new Map<string, Panel<StationPanel>>([
  ["script-rail:", { title: "The Script Cabinet", open: scriptRailPanel }],
  [
    "work-schedule:",
    { title: "The Working Cupboards", open: workSchedulePanel },
  ],
  [
    "material-stores:",
    { title: "The Material Stores", open: materialStorePanel },
  ],
  ["object-use:", { title: "The workroom fixture", open: objectUsePanel }],
  ["timbuktu:", { title: "The season horizon", open: timbuktuHorizonPanel }],
  [EARLIER_VIEWING, { title: "A second view", open: earlierViewingPanel }],
  [STAR_GAME, { title: "Field methods", open: starField }],
  [`${WARM_TOOL}:`, { title: "The Warm Side", open: warmRoomPanel }],
  [
    `${PACKING_TOOL}:`,
    { title: "A Name on the Load", open: ferryPackingPanel },
  ],
  [
    `${MODEL_RECORD_GROUP}:`,
    { title: "What the Model Keeps", open: modelRecordPanel },
  ],
  [
    `${NUMBER_LEAF_GROUP}:`,
    { title: "The Ledger Room", open: numberLeavesPanel },
  ],
  [
    `${LANTERN_WEAVE}:`,
    { title: "The Half-Light Room", open: lanternWeavePanel },
  ],
  [`${IMPRINT_GROUP}:`, { title: "The Second Imprint", open: copyImprint }],
  [
    `${REFERENCE_PROOF}:`,
    { title: "The checked record", open: referenceProofPanel },
  ],
]);

export function fieldStationPanel(id: string) {
  const split = id.indexOf(":");
  if (split < 0) return;
  const panel = stationPanels.get(id.slice(0, split + 1));
  if (panel) return { ...panel, station: id.slice(split + 1) };
}
