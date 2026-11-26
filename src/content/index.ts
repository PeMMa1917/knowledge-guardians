/**
 * Builds the content pack for the first chapter from the JSON files in this
 * folder. To add content, edit the JSON and run `npm test`: the content tests
 * validate every reference (see docs/CONTENT_GUIDE.md).
 */
import type { ContentPack } from '../domain/types';
import sources from './sources.json';
import common from './common.json';
import m01 from './m01-nexus.json';
import fourthCorner from './nexus-fourth-corner.json';
import coldFirstBell from './cold-first-bell.json';
import openingPractice from './opening-practice.json';
import doorFold from './door-fold.json';
import shelfRoom from './shelf-room.json';
import linkedNotes from './linked-notes.json';
import drawerCases from './drawer-cases.json';
import nexusWayfinding from './nexus-wayfinding.json';
import nexusReadingRests from './nexus-reading-rests.json';
import nexusDateRibbon from './nexus-date-ribbon.json';
import nexusPrint from './nexus-print.json';
import nexusPacking from './nexus-pack.json';
import nexusViewer from './nexus-viewer.json';
import nexusHandle from './nexus-handle.json';
import nexusLostGauge from './nexus-lost-gauge.json';
import vindolanda from './vindolanda.json';
import m02 from './m02-aethelgard.json';
import emberfordSide from './emberford-side.json';
import circularReport from './circular-report.json';
import lanternfair from './lanternfair.json';
import backbill from './backbill.json';
import welcome from './welcome.json';
import firsts from './firsts.json';
import ee from './ee-trails.json';
import side from './side-quests.json';
import glossary from './glossary.json';
import questions from './questions.json';
import origins from './origins.json';
import exhibition from './exhibition.json';
import puzzles from './puzzles.json';
import lorelings from './lorelings.json';
import stiltfrog from './stiltfrog.json';
import fray from './fray.json';
import rumour from './rumour.json';
import rumourWell from './rumour-well.json';
import skills from './skills.json';
import clueboard from './clueboard.json';
import memories from './memories.json';
import chapterVoices from './chapter-voices.json';
import rook from './rook.json';
import harrowmere from './harrowmere.json';
import vesper from './vesper.json';
import vesperTrust from './vesper-trust.json';
import quarters from './quarters.json';
import dive from './dive.json';
import story from './story.json';
import nile from './m03-nile.json';
import scenes from './prop-scenes.json';
import preservedRecords from './preserved-records.json';
import preserved from './m04-preserved.json';
import preservedScaleStrip from './preserved-scale-strip.json';
import reconstruction from './preserved-reconstruction.json';
import beaterProof from './beater-proof.json';
import copper from './preserved-copper.json';
import preservedExhibition from './preserved-exhibition.json';
import observatory from './m05-observatory.json';
import waterLoop from './water-loop.json';
import opticsScreen from './optics-screen.json';
import forest from './m06-forest.json';
import forestSide from './forest-side.json';
import observationSheet from './observation-sheet.json';
import forestReader from './forest-reader.json';
import forestNarrators from './forest-narrators.json';
import sharedCarry from './shared-carry.json';
import metalworks from './m07-metalworks.json';
import metalworksSide from './metalworks-side.json';
import metalRim from './metal-rim.json';
import benchDebate from './bench-debate.json';
import fittingViews from './fitting-views.json';
import copies from './m08-copies.json';
import sameRed from './same-red.json';
import copiesSide from './copies-side.json';
import copiesMargin from './copies-margin.json';
import citationRail from './citation-rail.json';
import cartographers from './m09-cartographers.json';
import cartographersSide from './cartographers-side.json';
import performance from './m10-performance.json';
import performanceFrames from './performance-frames.json';
import filmCuts from './film-cuts.json';
import paperLanding from './paper-landing.json';
import market from './m11-market.json';
import marketBasket from './market-basket.json';
import pairedAccessions from './paired-accessions.json';
import water from './m12-water.json';
import latchCheck from './latch-check.json';
import civic from './m13-civic.json';
import civicAppeal from './civic-appeal.json';
import civicIncentive from './civic-incentive.json';
import serviceBoundary from './service-boundary.json';
import voices from './m14-voices.json';
import elsbetReel from './voices-elsbet.json';
import island from './m15-island.json';
import joinedCloth from './joined-cloth.json';
import islandMovement from './island-movement.json';
import islandSkiff from './island-skiff.json';
import council from './m16-council.json';
import afterCouncil from './after-council.json';
import handoverGallery from './handover-gallery.json';
import observatoryInland from './observatory-inland.json';
import observatoryArchive from './observatory-archive.json';
import departureStrip from './departure-strip.json';
import ferryKettle from './ferry-kettle.json';
import transferFaces from './transfer-faces.json';
import lintelFold from './lintel-fold.json';
import seamWitness from './seam-witness.json';
import { QUESTION_ROUTES, questionWaysByObjective } from './questionEncounters';
import { addMicroSkills } from './microSkillEvidence';
import { clearanceContent } from './clearanceCases';
import { datePegContent } from './datePegCases';
import { relayContent } from './relayCases';
import { asiaLabelContent } from './asiaLabelCases';
import { specimenWorkContent } from './specimenWorkCases';
import polarStore from './polar-store.json';
import { fernRecordContent } from './fernRecords';
import { lanternWeaveContent } from './lanternWeave';
import { dateRegisterContent } from './dateRegisterCases';
import { passageContent } from './passageCases';
import windowShop from './window-shop.json';
import { readingWorksContent } from './readingWorks';
import { storyArchiveContent } from './storyArchive';
import { copyImprintContent } from './copyImprintCases';
import referenceProofs from './reference-proofs.json';
import { numberLeafContent } from './numberLeaves';
import { surveyDepotContent } from './surveyDepot';
import { referenceLineContent } from './referenceLine';
import { islandProofRackContent } from './islandProofRack';
import { specimenEquipment } from '../domain/specimenGear';
import { addSpecimenPeople } from './specimenPeople';
import { turningTableContent } from './turningTable';
import { coastCopyContent } from './coastCopy';
import { makerRoomContent, makerExactContent } from './makerRoomCases';
import { timbuktuManuscriptContent } from './timbuktuManuscript';
import { objectUseContent } from './objectUseCases';
import { leavittPlateContent } from './leavittPlate';
import referenceStation from './reference-station.json';
import { callboardContent } from './callboardCases';
import { cueWorkshopContent } from './cueWorkshop';
import { modelRecordsContent } from './modelRecords';
import { secondReadingContent } from './secondReading';
import { timeRoomContent } from './timeRoomCases';
import { fieldStoreContent } from './fieldStore';
import { materialStoreContent } from './materialStores';
import { loadingBayContent } from './loadingBay';
import { glassRackContent } from './glassRack';
import { shoreReplyContent } from './shoreReply';
import { ferryWindowContent } from './ferryWindow';
import { starPathContent } from './starPaths';
import { tokBadgeContent } from './badgeRoom';
import { ferryPackingContent } from './ferryPackingCases';
import { workScheduleContent } from './workScheduleCases';
import { bearingBayContent } from './bearingBay';
import { jigShopContent } from './jigShop';
import { earlierViewsContent, installEarlierViews } from './earlierViewing';
import { curtainContent } from './curtainCall';
import coastDetector from './coast-detector.json';
import coastBreeze from './coast-breeze.json';
import bridgeProof from './bridge-proof.json';
import memoryCart from './memory-cart.json';
import { dispatchStatsContent } from './dispatchStats';
import { prismViewerContent } from './prismViewer';
import { priceDrawersContent } from './priceDrawers';
import { warmRoomContent } from './warmRoomCases';
import { mapAlignmentContent } from './mapAlignment';
import { scriptRailContent } from './scriptRail';
import twoCalls from './two-calls.json';
import twoShutters from './two-shutters.json';
import openPlace from './open-place.json';
import pigmentWindow from './pigment-window.json';
import pigmentSample from './pigment-sample.json';
import { correspondenceRoomContent } from './correspondenceRoom';
import porterPace from './porter-pace.json';
import leafFrame from './leaf-frame.json';
import spareSeat from './spare-seat.json';
import lastTurn from './last-turn.json';
import stripBend from './strip-bend.json';
import { catchmentContent } from './catchment';
import { facingCueContent } from './facingCue';
import witnessClip from './witness-clip.json';
import threadBend from './thread-bend.json';
import sillBridge from './sill-bridge.json';

export const CONTENT_VERSION = 5;

const parts: any[] = [sources, common, m01, fourthCorner, openingPractice, doorFold, shelfRoom, linkedNotes, drawerCases, nexusWayfinding, nexusReadingRests, nexusDateRibbon, nexusPrint, nexusPacking, nexusViewer, nexusHandle, nexusLostGauge, vindolanda, m02, emberfordSide, lanternfair, backbill, welcome, firsts, ee, side, glossary, questions, origins, exhibition, puzzles, skills, lorelings, stiltfrog, fray, rumour, rumourWell, clueboard, memories, chapterVoices, quarters, dive, story, nile, scenes, coldFirstBell, preservedRecords, preserved, preservedScaleStrip, reconstruction, copper, preservedExhibition, observatory, opticsScreen, observatoryInland, observatoryArchive, waterLoop, departureStrip, ferryKettle, transferFaces, lintelFold, seamWitness, forest, forestSide, observationSheet, forestReader, sharedCarry, metalworks, metalworksSide, metalRim, benchDebate, fittingViews, copies, copiesSide, copiesMargin, sameRed, citationRail, cartographers, cartographersSide, paperLanding, performance, performanceFrames, filmCuts, market, marketBasket, pairedAccessions, rook, water, latchCheck, harrowmere, vesper, vesperTrust, civic, civicAppeal, civicIncentive, serviceBoundary, voices, elsbetReel, island, islandMovement, islandSkiff, council, afterCouncil, handoverGallery];
const keys = ['sources', 'cards', 'exhibits', 'characters', 'dialogue', 'missions', 'hints', 'criteria', 'awards', 'items', 'offers', 'journal',
  'labelKits', 'showdowns', 'threads', 'moments', 'misconceptions', 'portfolio', 'events', 'locks', 'glossary', 'questions', 'origins', 'alcoves', 'puzzles', 'skillDomains', 'skills', 'lorelings', 'lorelingAtlas', 'fray', 'clueBoards', 'memories', 'keepsakes', 'divePrompts', 'diveItems', 'knots', 'clues', 'keepsakeTalks', 'chronicle', 'secrets', 'communities'] as const;

export function buildPack(): ContentPack {
  const pack: any = { id: 'chapter-1', contentVersion: CONTENT_VERSION };
  const collectionRooms = [clearanceContent, beaterProof, datePegContent, relayContent, joinedCloth, asiaLabelContent, specimenWorkContent, polarStore, fernRecordContent,
    lanternWeaveContent, dateRegisterContent, passageContent, windowShop, readingWorksContent, storyArchiveContent, copyImprintContent,
    referenceProofs, numberLeafContent, surveyDepotContent, referenceLineContent, islandProofRackContent, turningTableContent, coastCopyContent, makerRoomContent, makerExactContent,
    timbuktuManuscriptContent, objectUseContent, leavittPlateContent, referenceStation, callboardContent, cueWorkshopContent,
    modelRecordsContent, secondReadingContent, timeRoomContent, fieldStoreContent, materialStoreContent,
    loadingBayContent, glassRackContent, shoreReplyContent, ferryWindowContent, starPathContent, tokBadgeContent,
    ferryPackingContent, workScheduleContent, bearingBayContent, jigShopContent, earlierViewsContent, curtainContent,
    coastDetector, coastBreeze, bridgeProof, memoryCart, dispatchStatsContent, prismViewerContent, priceDrawersContent, warmRoomContent,
    mapAlignmentContent, scriptRailContent, pigmentWindow, pigmentSample, correspondenceRoomContent, porterPace, leafFrame, forestNarrators, spareSeat, lastTurn, twoCalls, twoShutters, openPlace, catchmentContent, facingCueContent, witnessClip, stripBend, sillBridge,
    threadBend, circularReport];
  for (const k of keys) pack[k] = [...parts, ...collectionRooms].flatMap((p) => p[k] ?? []);
  const content = pack as ContentPack;
  content.questions.push(...QUESTION_ROUTES.map(({ question }) => question));
  const ways = questionWaysByObjective();
  content.missions = content.missions.map((mission) => ({
    ...mission,
    objectives: mission.objectives.map((objective) => {
      const questionWays = ways.get(objective.id);
      return questionWays ? { ...objective, questionWays } : objective;
    }),
  }));
  addSpecimenPeople(content);
  installEarlierViews(content);
  specimenEquipment(content);
  addMicroSkills(content);
  return content;
}
