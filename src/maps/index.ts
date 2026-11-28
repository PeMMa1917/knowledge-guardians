import { guardianRooms, templeDoors, sagaDesk } from './temples';
import { returnCoatAt, liningLanding } from './returnCoat';
import { pocketTheatreAt } from './pocketTheatre';
import {ovenLane, letterQuay, riverDoors} from './riverNames';
import {groveNursery,groveStage,groveDoors} from './walkingOrchard';
import {inkProps,inkPeople} from './secondInk';
import {middleRoom,middleLanding,houseAt,houseVisitors} from './openHouse';
import {quarterRoom,clockProps,clockGuests} from './tideClock';
import {wireRoom,radioProps,radioVisitors} from './ferryRadio';
import {stackProps,stackPeople,turningRoom} from './turningStacks';
import {lensRoom,lensAt,lensVisitors} from './lensLoan';
import {cupStreet,cupVisitors,firstCupRoom} from './firstCup';
import {almanacAt,almanacRoom,almanacVisitors} from './streetAlmanac';
import {courierAt,underWeight} from './courierLift';
import {elbowAt,sleeveRoom} from './giantSleeve';
import {petalHouse} from './petalHouse';
import { withOriginVisitor } from './originTours';
import { pictureFerryRoom } from './pictureFerry';
import { plumLoft } from './plumLoft';
import { SUPPER_MAP } from './supperRoom';
import {fieldLoansAt} from './fieldLoans';
import {foldingFlockAt} from './foldingFlock';
import { withTownHearing } from './hearings';
import {withWhistleWatch} from './whistleWatch';
import { nightDoor, nightRooms } from './nightRegister';
import type { MapDef } from './types';
import { HINGED_PLANK } from './hingedPlank';
import { UNDERPAN } from './underpan';
import { BELL_LOFT, SPARE_MOON } from './spareMoon';
import { NEXUS } from './nexus';
import { HALF_LIGHT_ROOM } from './lanternWeave';
import { TWO_SHUTTER_ROOM } from './shutterBoard';
import { NEXT_BENCH } from './afterCouncil';
import { HANDOVER_GALLERY } from './handoverGallery';
import { EMBERFORD, REPAIR_YARD } from './emberford';
import { STUDY } from './study';
import { SHELF_MODEL, SHELF_ROOM } from './shelfRoom';
import { CLEARANCE_GALLERY } from './clearanceGallery';
import { DATE_PEG_ROOM } from './datePeg';
import { SEA_RELAY_ROOM } from './specimenRelay';
import { ASIA_LABEL_LOFT } from './asiaLabelLoft';
import { MARKET_SAMPLE_SHED, STAGE_PROP_ROOM } from './specimenWork';
import { POLAR_RECORDS, POLAR_TRIAL } from './polarStore';
import { DATE_REGISTER_ROOM } from './dateRegister';
import { SHOAL_PROOF_SHELTER } from './specimenPassage';
import { WINDOW_SHOP } from './windowShop';
import { READING_WORKS } from './readingWorks';
import { STORY_ARCHIVE } from './storyArchive';
import { COPIES_PROOF_ROOM } from './copyImprint';
import { NUMBER_LEAF_ROOM } from './numberLeaves';
import { SPECIMEN_VAULT } from './specimenVault';
import { SURVEY_DEPOT } from './surveyDepot';
import { REFERENCE_FLOOR, REFERENCE_LANES } from './referenceLine';
import { TURNING_ROOM } from './turningTable';
import { NILE_MAKERS_ROOM } from './makerRoom';
import { OBJECT_USE_WORKSHOPS } from './objectUse';
import { REFERENCE_STATION } from './referenceStation';
import { CIVIC_CALLBOARD } from './civicCallboard';
import { QUIET_RECORDS } from './quietRecords';
import { CUE_WORKSHOP } from './cueWorkshop';
import { MODEL_RECORD_ROOM } from './modelRecords';
import { SECOND_READING_STORE } from './secondReading';
import { TIME_ROOM } from './timeRoom';
import { FIELD_STORE } from './fieldStore';
import { MATERIAL_STORE_MAPS } from './materialStores';
import { COUNCIL_LOADING_BAY, COUNCIL_LOAD_CHECK } from './loadingBay';
import { PRESERVED_GLASS_RACK } from './glassRack';
import { SHORE_REPLY_SHED } from './shoreReply';
import { FERRY_WINDOW } from './ferryWindow';
import { BADGE_ANNEX } from './badgeRoom';
import { FERRY_PACKING_ROOM } from './ferryPacking';
import { WORK_SCHEDULE_MAPS } from './workSchedule';
import { BEARING_ROOM, BEARING_RETURN_ROOM } from './bearingBay';
import { JIG_SHOP_MAP } from './jigShop';
import { inkPostAt } from './inkPost';
import { earlierViewingAt } from './earlierViewing';
import { publicationReturnsAt } from './publicationReturns';
import { blueTailAt } from './blueTail';
import { PRICE_DRAWERS_MAP } from './priceDrawers';
import { WARM_ROOM } from './warmRoom';
import { ALIGN_ROOM } from './mapAlignment';
import { SCRIPT_RAIL_MAPS } from './scriptRail';
import { CORRESPONDENCE_ROOM } from './correspondenceRoom';
import { FERRY } from './ferry';
import { NILE_HALL, NILE_ROYAL, NILE_ROUTE, NILE_WORKYARD } from './nile';
import { UNDERCROFT } from './undercroft';
import { PRESERVED_ARCHIVE, PRESERVED_COAST, PRESERVED_COPPER, PRESERVED_GALLERY, PRESERVED_INQUIRY, PRESERVED_ROYAL, PRESERVED_WORKROOM } from './preserved';
import { OBSERVATORY_ARCHIVE, OBSERVATORY_HARBOUR, OBSERVATORY_INLAND, OBSERVATORY_STATION } from './observatory';
import { FOREST_STATION, FOREST_TRAIL, FOREST_COMMUNITY } from './forest';
import { FERN_RECORD_ROOM } from './fernRecordRoom';
import { METALWORKS_YARD, METALWORKS_RECORDS } from './metalworks';
import { METAL_BENCH_MEETING } from './benchDebate';
import { METAL_LATCH_BAY, WATER_SERVICE_LANE } from './latchCheck';
import { COPIES_ARCHIVE, COPIES_PRESS, COPIES_LANDING } from './copies';
import { SEA_HARBOUR, SEA_CHARTROOM, SEA_SHOAL } from './sea';
import { STAGE_FOYER, STAGE_GALLERY, STAGE_REHEARSAL } from './stage';
import { MARKET_SQUARE } from './market';
import { COUNCIL_GALLERY, COUNCIL_HALL } from './council';
import { ISLAND_DOCK, ISLAND_MARGIN, ISLAND_WORKSHOP } from './island';
import { VOICES_LISTENING, VOICES_QUAY, VOICES_WALK } from './voices';
import { VESPER_PROOF_ROOM } from './vesperTrust';
import { CIVIC_CANAL, CIVIC_DISPATCH, CIVIC_STEPS } from './civic';
import { WATER_COUNCIL, WATER_GATEHOUSE, WATER_LOWER_CHANNEL } from './water';
import { WATER_CULVERT } from './catchment';
import { SILL_BRIDGE, SILL_RECEIVING } from './sillBridge';

const campaignMaps: Record<string, MapDef> = {
  [HINGED_PLANK.id]: HINGED_PLANK,
  [WATER_CULVERT.id]: WATER_CULVERT,
  [NEXUS.id]: NEXUS,
  [UNDERPAN.id]: UNDERPAN,
  [BELL_LOFT.id]: BELL_LOFT,
  [SPARE_MOON.id]: SPARE_MOON,
  [HALF_LIGHT_ROOM.id]: HALF_LIGHT_ROOM,
  [TWO_SHUTTER_ROOM.id]: TWO_SHUTTER_ROOM,
  [NUMBER_LEAF_ROOM.id]: NUMBER_LEAF_ROOM,
  [SPECIMEN_VAULT.id]: SPECIMEN_VAULT,
  [NEXT_BENCH.id]: NEXT_BENCH,
  [HANDOVER_GALLERY.id]: HANDOVER_GALLERY,
  [EMBERFORD.id]: EMBERFORD,
  [REPAIR_YARD.id]: REPAIR_YARD,
  [SILL_BRIDGE.id]: SILL_BRIDGE,
  [SILL_RECEIVING.id]: SILL_RECEIVING,
  [STUDY.id]: STUDY,
  [TIME_ROOM.id]: TIME_ROOM,
  [SHELF_ROOM.id]: SHELF_ROOM,
  [SHELF_MODEL.id]: SHELF_MODEL,
  [FERRY.id]: FERRY,
  [FERRY_WINDOW.id]: FERRY_WINDOW,
  [FERRY_PACKING_ROOM.id]: FERRY_PACKING_ROOM,
  [UNDERCROFT.id]: UNDERCROFT,
  [NILE_HALL.id]: NILE_HALL,
  [NILE_ROYAL.id]: NILE_ROYAL,
  [NILE_WORKYARD.id]: NILE_WORKYARD,
  [NILE_ROUTE.id]: NILE_ROUTE,
  [NILE_MAKERS_ROOM.id]: NILE_MAKERS_ROOM,
  [PRESERVED_ARCHIVE.id]: PRESERVED_ARCHIVE,
  [CLEARANCE_GALLERY.id]: CLEARANCE_GALLERY,
  [POLAR_RECORDS.id]: POLAR_RECORDS,
  [POLAR_TRIAL.id]: POLAR_TRIAL,
  [PRESERVED_ROYAL.id]: PRESERVED_ROYAL,
  [PRESERVED_COAST.id]: PRESERVED_COAST,
  [PRESERVED_INQUIRY.id]: PRESERVED_INQUIRY,
  [PRESERVED_WORKROOM.id]: PRESERVED_WORKROOM,
  [PRESERVED_COPPER.id]: PRESERVED_COPPER,
  [PRESERVED_GALLERY.id]: PRESERVED_GALLERY,
  [OBSERVATORY_HARBOUR.id]: OBSERVATORY_HARBOUR,
  [WINDOW_SHOP.id]: WINDOW_SHOP,
  [SURVEY_DEPOT.id]: SURVEY_DEPOT,
  [REFERENCE_STATION.id]: REFERENCE_STATION,
  [OBSERVATORY_ARCHIVE.id]: OBSERVATORY_ARCHIVE,
  [OBSERVATORY_STATION.id]: OBSERVATORY_STATION,
  [BEARING_ROOM.id]: BEARING_ROOM,
  [BEARING_RETURN_ROOM.id]: BEARING_RETURN_ROOM,
  [OBSERVATORY_INLAND.id]: OBSERVATORY_INLAND,
  [FOREST_STATION.id]: FOREST_STATION,
  [FERN_RECORD_ROOM.id]: FERN_RECORD_ROOM,
  [FOREST_TRAIL.id]: FOREST_TRAIL,
  [FOREST_COMMUNITY.id]: FOREST_COMMUNITY,
  ...Object.fromEntries(WORK_SCHEDULE_MAPS.map((room) => [room.id, room])),
  [METALWORKS_YARD.id]: METALWORKS_YARD,
  [JIG_SHOP_MAP.id]: JIG_SHOP_MAP,
  [REFERENCE_FLOOR.id]: REFERENCE_FLOOR,
  [REFERENCE_LANES.id]: REFERENCE_LANES,
  [METALWORKS_RECORDS.id]: METALWORKS_RECORDS,
  [WARM_ROOM.id]: WARM_ROOM,
  [METAL_BENCH_MEETING.id]: METAL_BENCH_MEETING,
  [METAL_LATCH_BAY.id]: METAL_LATCH_BAY,
  [COPIES_ARCHIVE.id]: COPIES_ARCHIVE,
  [ALIGN_ROOM.id]: ALIGN_ROOM,
  [CORRESPONDENCE_ROOM.id]: CORRESPONDENCE_ROOM,
  [READING_WORKS.id]: READING_WORKS,
  [COPIES_PROOF_ROOM.id]: COPIES_PROOF_ROOM,
  [COPIES_PRESS.id]: COPIES_PRESS,
  [COPIES_LANDING.id]: COPIES_LANDING,
  [SUPPER_MAP.id]: SUPPER_MAP,
  [SEA_HARBOUR.id]: SEA_HARBOUR,
  [SEA_CHARTROOM.id]: SEA_CHARTROOM,
  [DATE_PEG_ROOM.id]: DATE_PEG_ROOM,
  [DATE_REGISTER_ROOM.id]: DATE_REGISTER_ROOM,
  [SEA_RELAY_ROOM.id]: SEA_RELAY_ROOM,
  [TURNING_ROOM.id]: TURNING_ROOM,
  [SHOAL_PROOF_SHELTER.id]: SHOAL_PROOF_SHELTER,
  [SEA_SHOAL.id]: SEA_SHOAL,
  [SHORE_REPLY_SHED.id]: SHORE_REPLY_SHED,
  [sleeveRoom.id]:sleeveRoom,
  [petalHouse.id]:petalHouse,
  [pictureFerryRoom.id]: pictureFerryRoom,
  [plumLoft.id]: plumLoft,
  [STAGE_FOYER.id]: STAGE_FOYER,
  ...Object.fromEntries(SCRIPT_RAIL_MAPS.map((map) => [map.id, map])),
  [STAGE_REHEARSAL.id]: STAGE_REHEARSAL,
  [STAGE_GALLERY.id]: STAGE_GALLERY,
  [STAGE_PROP_ROOM.id]: STAGE_PROP_ROOM,
  [STORY_ARCHIVE.id]: STORY_ARCHIVE,
  [MARKET_SQUARE.id]: MARKET_SQUARE,
  [PRICE_DRAWERS_MAP.id]: PRICE_DRAWERS_MAP,
  [MARKET_SAMPLE_SHED.id]: MARKET_SAMPLE_SHED,
  ...Object.fromEntries(OBJECT_USE_WORKSHOPS.map((room) => [room.id, room])),
  [WATER_GATEHOUSE.id]: WATER_GATEHOUSE,
  [WATER_COUNCIL.id]: WATER_COUNCIL,
  [FIELD_STORE.id]: FIELD_STORE,
  ...Object.fromEntries(MATERIAL_STORE_MAPS.map((room) => [room.id, room])),
  [WATER_LOWER_CHANNEL.id]: WATER_LOWER_CHANNEL,
  [WATER_SERVICE_LANE.id]: WATER_SERVICE_LANE,
  [CIVIC_DISPATCH.id]: CIVIC_DISPATCH,
  [CIVIC_CALLBOARD.id]: CIVIC_CALLBOARD,
  [QUIET_RECORDS.id]: QUIET_RECORDS,
  [CIVIC_STEPS.id]: CIVIC_STEPS,
  [CIVIC_CANAL.id]: CIVIC_CANAL,
  [VOICES_LISTENING.id]: VOICES_LISTENING,
  [VOICES_WALK.id]: VOICES_WALK,
  [VOICES_QUAY.id]: VOICES_QUAY,
  [CUE_WORKSHOP.id]: CUE_WORKSHOP,
  [VESPER_PROOF_ROOM.id]: VESPER_PROOF_ROOM,
  [ISLAND_WORKSHOP.id]: ISLAND_WORKSHOP,
  [MODEL_RECORD_ROOM.id]: MODEL_RECORD_ROOM,
  [ASIA_LABEL_LOFT.id]: ASIA_LABEL_LOFT,
  [ISLAND_DOCK.id]: ISLAND_DOCK,
  [ISLAND_MARGIN.id]: ISLAND_MARGIN,
  [COUNCIL_HALL.id]: COUNCIL_HALL,
  [SECOND_READING_STORE.id]: SECOND_READING_STORE,
  [groveNursery.id]:groveNursery, [groveStage.id]:groveStage,
  [ovenLane.id]:ovenLane, [letterQuay.id]:letterQuay,
  [middleRoom.id]:middleRoom, [middleLanding.id]:middleLanding,
  [quarterRoom.id]:quarterRoom,
  [wireRoom.id]:wireRoom,
  [lensRoom.id]:lensRoom,
  [firstCupRoom.id]:firstCupRoom,
  [turningRoom.id]:turningRoom,
  [almanacRoom.id]:almanacRoom,
  [underWeight.id]:underWeight,
  [liningLanding.id]:liningLanding,
  [COUNCIL_GALLERY.id]: COUNCIL_GALLERY,
  [COUNCIL_LOADING_BAY.id]: COUNCIL_LOADING_BAY,
  [COUNCIL_LOAD_CHECK.id]: COUNCIL_LOAD_CHECK,
  [PRESERVED_GLASS_RACK.id]: PRESERVED_GLASS_RACK,
  [BADGE_ANNEX.id]: BADGE_ANNEX,
};

for (const room of nightRooms) {
  const door = room.interactables.find(prop => prop.id === room.id+'.back')!;
  campaignMaps[room.id] = { ...room, music: campaignMaps[door.to!.map].music };
}

for (const room of guardianRooms(campaignMaps)) campaignMaps[room.id] = room;

export const MAPS: Record<string, MapDef> = Object.fromEntries(Object.values(campaignMaps).map((map) => {
  const returns = [...templeDoors(map.id), ...sagaDesk(map.id),...returnCoatAt(map.id), ...pocketTheatreAt(map.id), ...riverDoors(map.id), ...inkProps(map.id), ...houseAt(map.id), ...groveDoors(map.id), ...clockProps(map.id), ...radioProps(map.id), ...lensAt(map.id), ...stackProps(map.id), ...cupStreet(map.id), ...almanacAt(map.id), ...elbowAt(map.id), ...courierAt(map.id), ...earlierViewingAt(map.id), ...blueTailAt(map.id), ...publicationReturnsAt(map.id), ...inkPostAt(map.id), ...nightDoor(map.id), ...foldingFlockAt(map.id), ...fieldLoansAt(map.id)];
  const guests=[...inkPeople(map.id), ...houseVisitors(map.id), ...radioVisitors(map.id), ...clockGuests(map.id), ...lensVisitors(map.id), ...stackPeople(map.id),...cupVisitors(map.id),...almanacVisitors(map.id)];
  const room = returns.length||guests.length ? {...map,interactables:[...map.interactables,...returns],npcs:[...map.npcs,...guests]} : map;
  return [map.id, withOriginVisitor(withTownHearing(withWhistleWatch(room)))];
}));
