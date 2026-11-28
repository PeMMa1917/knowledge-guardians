import {postmarkPanel} from './riverPostmark';
import {riverBenches,ovenPanel,benchNames} from './riverNames';
import { hatchPanel } from './hatchSleeve';
import {grovePanel} from './walkingOrchard';
import {beds,bedName} from '../domain/walkingOrchard';
import {secondInkPanel} from './secondInk';
import {housePanel} from './openHouse';
import {quarterPanel} from './tideClock';
import {ferryRadioPanel} from './ferryRadio';
import {turningStacksPanel,signatureLamp} from './turningStacks';
import {lensLoanPanel} from './lensLoan';
import {firstCupPanel} from './firstCup';
import {streetAlmanacPanel} from './streetAlmanac';
import {giantPanel} from './giantSleeve';
import {petalRibbons} from './petalRibbons';
import {petalGears} from './petalGears';
import {petalWindow,petalLedge,petalStage,petalAudience} from './petalWindow';
import { ferryBillLine, ferryBillAudience } from './ferryBill';
import { printWheel, printPassenger } from './pictureFerry';
import { orchardMould } from './orchardMould';
import { plumChest, plumDrum } from './plumChest';
import { supperShadow } from './supperShadow';
import {fieldLoanPanel} from './fieldLoan';
import {loanStops,stops} from '../content/loanCrews';
import { foldingFlock } from './foldingFlock';
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
  ['river-postmark-out',{title:'The foil at the oven',open:(c,sound)=>postmarkPanel(c,sound,false)}],
  ['river-postmark-in',{title:'Three readers of the same postmark',open:(c,sound)=>postmarkPanel(c,sound,true)}],
  ...riverBenches.map((bench):[string,Panel<GamePanel>]=>['river-names-'+bench,{title:benchNames[bench],open:(c,sound)=>ovenPanel(c,sound,bench)}]),
  ['hatch-cricket', { title: 'The cricket in the sleeve', open: (c,sound) => hatchPanel(c,sound) }],
  ['hatch-readers', { title: 'The two-sided sleeve', open: (c,sound) => hatchPanel(c,sound,true) }],
  ['stacks-signature',{title:'The names under the count',open:signatureLamp}],
  ['turning-stacks',{title:'The house with six names',open:turningStacksPanel}],
  ...beds.map((bed):[string,{title:string;open:GamePanel}]=>['grove-bed-'+bed,{title:bedName[bed]+' nursery glass',open:(c,sound)=>grovePanel(c,sound,'nursery',bed)}]),
  ['grove-shutters',{title:'The counting cloth',open:(c,sound)=>grovePanel(c,sound,'shutters')}],
  ['grove-promise',{title:'An evening for the orchard',open:(c,sound)=>grovePanel(c,sound,'promise')}],
  ['grove-square',{title:'The third turn of the orchard',open:(c,sound)=>grovePanel(c,sound,'square')}],
  ['second-ink-press',{title:'The moth with two tails',open:(c,sound)=>secondInkPanel(c,sound)}],
  ['second-ink-corner',{title:'Where the notice went',open:(c,sound)=>secondInkPanel(c,sound,true)}],
  ['middlehouse-plan',{title:'The inn under the mat',open:(c,sound)=>housePanel(c,sound,'plan')}],
  ['middlehouse-roost',{title:'Three warm places',open:(c,sound)=>housePanel(c,sound,'roost')}],
  ['middlehouse-cart',{title:'The kettle in the yard',open:(c,sound)=>housePanel(c,sound,'cart')}],
  ['middlehouse-light',{title:'Where the lamp reaches',open:(c,sound)=>housePanel(c,sound,'light')}],
  ['middlehouse-table',{title:'Three keys to one house',open:(c,sound)=>housePanel(c,sound,'table')}],
  ['middlehouse-porch',{title:'Somebody lives here',open:(c,sound)=>housePanel(c,sound,'porch')}],
  ['quarter-house',{title:'The quarter that comes back',open:(c,sound)=>quarterPanel(c,sound,false)}],
  ['quarter-plan',{title:'A place at the end of the pier',open:(c,sound)=>quarterPanel(c,sound,true)}],
  ['ferry-wire-studio',{title:'The last word on the water',open:(c,sound)=>ferryRadioPanel(c,sound,false)}],
  ['ferry-wire-island',{title:'Four beats of quiet',open:(c,sound)=>ferryRadioPanel(c,sound,true)}],
  ['optics-loft',{title:'The drawer with two places',open:(c,sound)=>lensLoanPanel(c,sound,false)}],
  ['optics-curtain',{title:'Where the understudy waits',open:(c,sound)=>lensLoanPanel(c,sound,true)}],
  ['first-cup-shop',{title:'Who gets the first cup?',open:(c,sound)=>firstCupPanel(c,sound,false)}],
  ['first-cup-street',{title:'The cart in the rain',open:(c,sound)=>firstCupPanel(c,sound,true)}],
  ['street-compose',{title:'A birthday with four dates',open:(c,sound)=>streetAlmanacPanel(c,sound,false)}],
  ['street-evening',{title:'The parade at the window',open:(c,sound)=>streetAlmanacPanel(c,sound,true)}],
  ['giant-fitting',{title:'The giant who borrowed my elbow',open:(c,sound)=>giantPanel(c,sound,'fitting')}],
  ['giant-lottery',{title:'The fitter’s two sealed packets',open:(c,sound)=>giantPanel(c,sound,'lottery')}],
  ['giant-curtain',{title:'The hand inside the curtain',open:(c,sound)=>giantPanel(c,sound,'curtain')}],
  ...stops.map((stop):[string,Panel<GamePanel>]=>["field-loan."+stop,{title:loanStops[stop].title,open:(c,sound)=>fieldLoanPanel(c,stop,sound)}]),
  ["orchard-mould", { title: "Fen’s two practice tabs", open: orchardMould }],
  ["petal-ribbons",{title:"Two unopened watches",open:petalRibbons}],
  ["petal-gears",{title:"Viri’s rolling theatre",open:petalGears}],
  ["petal-window",{title:"The little window",open:petalWindow}],
  ["petal-ledge",{title:"Two mornings caught in glass",open:petalLedge}],
  ["petal-stage",{title:"The copper glove",open:petalStage}],
  ["petal-audience",{title:"Who takes the next turn?",open:petalAudience}],
  ["picture-ferry-bill", { title: "Three pegs for the evening show", open: ferryBillLine }],
  ["picture-ferry-gallery", { title: "The evening house", open: ferryBillAudience }],
  ["picture-ferry-wheel", { title: "The two-window lamp", open: printWheel }],
  ["picture-ferry-passenger", { title: "The returning passenger", open: printPassenger }],
  ["plum-chest", { title: "The orchard chest", open: plumChest }],
  ["plum-drum", { title: "The youngest drummer", open: plumDrum }],
  ["supper-shadow", { title: "Supper for a Shadow", open: supperShadow }],
  ["birdside-watch", { title: "The folding flock", open: foldingFlock }],
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
