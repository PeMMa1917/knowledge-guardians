import type { GlossaryEntry } from '../domain/types';
import { CLEAR_BAY_GAME } from '../domain/clearBay';
import { clearBayPanel } from './clearBay';
import { NILE_TRIALS, NILE_DELIVERIES, type NileDelivery } from '../domain/nileModel';
import { FOREST_WATCH, FOREST_WINDOWS, forestWatch, type ForestWindow } from '../domain/forestWatch';
import { METAL_SAMPLES, readMetalSample } from '../domain/metalSample';
import { compareCopy } from '../domain/copyComparison';
import { mlaCitation } from '../domain/mla';
import { encyclopediaForBiography, encyclopediaForCharacter, encyclopediaForExhibit } from '../domain/encyclopedia';
import { wikipediaLink } from './adventureEncyclopedia';
import { seaChart } from '../domain/seaCharts';
import { STAGE_CUES, stageRehearsal, type StageCue } from '../domain/stageRehearsal';
import { FILM_STATIONS, isFilmStation } from '../domain/filmCuts';
import { cameraPanel, filmEditorPanel } from './filmCuts';
import { MARKET_BASES, marketComparison, marketOffersWithin, type MarketBasis } from '../domain/marketScale';
import { WATER_SETTINGS, waterTrial, type WaterCondition, type WaterSetting } from '../domain/waterGate';
import { CIVIC_RULES, CIVIC_SAMPLES, civicAllocation, type CivicRule, type CivicSample } from '../domain/civicConsole';
import { VOICE_SOURCES, VOICE_VIEWS, voiceReading, type VoiceView } from '../domain/voiceReadings';
import { ISLAND_CRATES, ISLAND_LANDINGS, ISLAND_ROUTES, islandPlan, type IslandLanding, type IslandRoute } from '../domain/islandPlan';
import { COUNCIL_TRIALS, councilClock, type CouncilTrial } from '../domain/councilClock';
import { buildScoutBoard } from './scoutRoutes';
import { adventureJournalTab } from './adventureJournal';
import { bindJournalEditor, discardPendingJournalWriting, flushJournalWriting, queueJournalWriting } from './journalWriting';
import { conceptEditor } from './conceptEditor';
import { ROUTE_ACTIONS } from '../content/questionEncounters';
/**
 * The HTML interface laid over the game canvas: menus, HUD, dialogue,
 * inspection, evidence board, minigames, journal and settings.
 *
 * Ordinary HTML controls are used for reading and choosing, so they work with
 * keyboard, screen readers, browser zoom and text scaling (spec 22.2, 21.6).
 * Every action goes through ctx.controller.dispatch (domain commands).
 */
import { ctx, type UIApi } from '../app/context';
import { LUMEN_COLOURS, LUMEN_FORMS, THEMES, lumenArt, saveSettings, type Settings } from '../app/settings';
import { PRONOUN_SETS, cleanPronouns, personalise } from '../domain/player';
import { ACCENT, ACCESSORIES, AIDS, GLASSES, STYLES, HAIR, LABELS, cloakThreads, DYE_KEYS, OUTFIT, PRESET_LOOKS, SKIN, TROUSERS, decodeLook, encodeLook, type LookChoice } from '../domain/appearance';
import { previewLook } from '../scenes/looks';
import { MAPS } from '../maps';
import { lorelingForm } from '../domain/lorelings';
import { chordFigure, circlePoints, echoDelay, echoDistance, panes, readTimes, runSorter, framed, shepardParts, brier, calibration, readForecasts, runSurvey, sightBlock, tiltOf, timeStats, translateLine, type SorterRun } from '../domain/puzzles';
import { audioNow, chime, clapEcho, playNotes, playShepard } from '../app/ambience';
import { MOTIFS, SONG_MAX, openMotifs, readSong, songNotes } from '../domain/musicbox';
import { CHARGES, DEFAULT_CREST, DIVISIONS, FIELDS, MOTTOS, SHAPES, crestPixels, decodeCrest, encodeCrest, type Crest } from '../domain/crest';
import { DIVE_ZONES, dailyPrompts, dayKey, diveDepth, diveItems, judgeDive, zoneAt } from '../domain/dive';
import { DEFAULT_ROOM, FLOORS, LAMPS, PETS, PLANTS, RUGS, SLOTS, VIEWS, WALLS, decodeRoom, encodeRoom, placeKeepsake, starsFor, type Room } from '../domain/quarters';
import { ROOM_H, ROOM_W, drawRoom, iconCanvas } from './quarters';
import { ALBUM_MAX, loadAlbum, saveAlbum } from '../app/albumStore';
import { captionLines, checkLine } from '../domain/album';
import { caption } from '../app/captions';
import { OPPONENT, judgeYarn, viewBoard } from '../domain/clueboard';
import { EMOTES } from '../domain/emotes';
import { STAGE_LABEL, nextStep, skillStage, type SkillStage } from '../domain/skills';
import { PLAYER_VOICES, babble, bark, voiceFor } from '../app/voice';
import type { FrameItem, PlaqueFace, Pronouns, RestoreLayer, PuzzleRecord, SorterFruit } from '../domain/types';
import { ACTIONS, PRESETS, actionFor, assignKey, mappableKey, type Action } from '../app/keymap';
import { SIM_MODEL, type GameEvent } from '../domain/engine';
import { conceptRings, conceptXP, totalXP } from '../domain/permanent';
import { describeSection, layers, type ForgeAction } from '../domain/forge';
import { labelText, type LabelResult } from '../domain/label';
import { examplesFor, segmentText } from '../domain/glossary';
import { studentAlerts } from '../domain/learning';
import { MOVE_HELP, type ShowdownMove } from '../domain/showdown';
import { AOK_NAMES, ATL_NAMES, CONCEPT_NAMES, PROFILE_NAMES, SUBJECTS } from '../domain/curriculum';
import type { ClaimKind, DialogueNode, EvidenceCard, HistoricalLabel, ShowdownState, TitleLockRecord } from '../domain/types';
import { PLAYER_LOOKS, TILE } from '../scenes/art';
import { artURL, BIG_ART } from './illustrations';
import { clear, h, trapFocus } from './dom';
import { DISPATCH_DESKS, DISPATCH_GAME } from '../domain/tiles';
import { SEFA_TABLE, sefaDeskPanel, sefaStitching } from './sefaDispatch';
import { TRUST_RANKS, rankOf, trustOf } from '../domain/communities';
import { RECIPES, RESOURCES, cannotCraft, resCount, type Resource } from '../domain/craft';
import { READINGS, cannotRead, readingOf, toolOf } from '../domain/readings';
import { approvalOf, approvalRank } from '../domain/approval';
import { ROLES, fitsRole, roleOf } from '../domain/roles';
import { BOSS, SEALS, allSealsOpen, bossDone, bossPhase } from '../domain/undercroft';
import { FIELD_GAMES } from '../domain/fieldgames';
import { routingBoard } from './routingBoards';
import { counterReplayBoard } from './counterReplayBoard';
import { islandSkiffPanel } from './islandSkiff';
import { drawerCases } from './drawerCases';
import { mapPinControls } from './mapPinControls';
import { PIN_PURPOSES } from '../domain/mapPins';
import { MICRO_SKILL_DOMAIN } from '../content/microSkillEvidence';
import { specimenArt } from '../app/specimenArt';
import { CLEARANCE_GROUP } from '../content/clearanceCases';
import { clearanceGallery } from './clearanceGallery';
import { RELAY_GROUP } from '../content/relayCases';
import { specimenRelayPanel } from './specimenRelay';
import { PASSAGE_GROUP } from '../content/passageCases';
import { specimenPassagePanel } from './specimenPassage';
import { TURNING_GROUP } from '../content/turningTable';
import { turningPanel } from './turningTable';
import { CUE_GROUP } from '../content/cueWorkshop';
import { LOAD_GROUP } from '../content/loadingBay';
import { BEARING_GROUP } from '../content/bearingBay';
import { PRISM_GROUP } from '../content/prismViewer';
import { prismViewerPanel } from './prismViewer';
import { ALIGN_GROUP } from '../content/mapAlignment';
import { mapAlignmentPanel } from './mapAlignment';
import { scriptRailPanel } from './scriptRail';
import { twoCallsPanel } from './twoCalls';
import { localGuide, workFeedback } from './localGuide';
import { bearingBayPanel } from './bearingBay';
import { loadingBayPanel } from './loadingBay';
import { cueWorkshopPanel } from './cueWorkshop';
import { datePegPanel } from './datePeg';
import { LANTERN_WEAVE } from '../content/lanternWeave';
import { lanternWeavePanel } from './lanternWeave';
import { shutterBoardPanel } from './shutterBoard';
import { DATE_REGISTER_GROUP } from '../content/dateRegisterCases';
import { dateRegisterPanel } from './dateRegister';
import { STORY_FRAME_GROUP } from '../content/storyArchive';
import { storyFramePanel } from './storyFrames';
import { NUMBER_LEAF_GROUP } from '../content/numberLeaves';
import { numberLeavesPanel } from './numberLeaves';
import { IMPRINT_GROUP } from '../content/copyImprintCases';
import { REFERENCE_PROOF } from '../domain/referenceProofs';
import { copyImprint } from './copyImprint';
import { referenceProofPanel } from './referenceProofs';
import { MAKER_EXACT, MAKER_TOOL } from '../domain/makerRoom';
import { makerRoom } from './makerRoom';
import { makerExact } from './makerExact';
import { marketBasketPanel } from './marketBasket';
import { waterLoopPanel } from './waterLoop';
import { catchmentPanel } from './catchment';
import { civicIncentivePanel, incentiveStation } from './civicIncentive';
import { serviceBoundaryPanel } from './boundaryBoard';
import { waterLoopStation } from '../maps/waterLoop';
import { SKIFF_LANDINGS } from '../maps/islandSkiff';
import { handoverGallery } from './handoverGallery';
import { sharedCarry } from './sharedCarry';
import { stiltfrogWatch } from './stiltfrogWatch';
import { linkedNotes } from './linkedNotes';
import { CARRY, carryLocation } from '../domain/sharedCarry';
import { opticsTrial } from './opticsTrial';
import { DETECTOR_GAME } from '../domain/coastDetector';
import { coastDetectorPanel } from './coastDetector';
import { BREEZE_CHECK, BREEZE_FOLLOW, BREEZE_TOOL } from '../domain/coastBreeze';
import { coastBreezePanel } from './coastBreeze';
import { ISLAND_PROOF_CASES, ISLAND_PROOF_TOOL, islandProofFlag } from '../domain/islandProofRack';
import { islandProofRackPanel } from './islandProofRack';
import { BRIDGE_PROOF_TOOL } from '../domain/bridgeProof';
import { bridgeProofPanel } from './bridgeProof';
import { SILL_CLOCK } from '../domain/sillBridge';
import { sillBridgePanel, sillGuideObjective } from './sillBridge';
import { PORTER_TOOL } from '../domain/porterPace';
import { porterPacePanel } from './porterPace';
import { WARM_TOOL } from '../domain/warmRoom';
import { warmRoomPanel } from './warmRoom';
import { BEND_TOOL, type BendSite } from '../domain/stripBend';
import { stripBendPanel } from './stripBend';
import { loyaltyOf } from '../domain/loyalty';
import { CROSSINGS, WAY_LABEL, crossingOf, crossingWay, wayOpen } from '../domain/crossings';
import { HEARTH, TONE_LABEL, type HearthTalk } from '../domain/hearth';
import { VERSES, balladName, versesFor } from '../domain/ballad';
import { crossingEpithet, lingering, mirror, vignettesFor } from '../domain/epilogue';
import { BRUSH_STROKES, CHART_CHOICES, DIG_CHOICES, DIG_LIGHT, DIG_W, MY_PICTURE_NAMES, SKY_PICTURES, STARS, STAR_HEIGHT, TRADE_KIND, TRADE_START, TRADE_STEPS, digNote, digReport, digSite, digStroke, type DigTool, type Trader } from '../domain/compendiumGames';
import { arrivedLetters, composeLetter, dueLetters } from '../domain/letters';
import { communityLetterFlag, dueCommunityLetters, receivedCommunityLetters } from '../domain/communityLetters';
import { conversationHistory } from '../domain/conversationHistory';
import { storyMotif, storyMotifKey, type StoryMotif } from '../domain/storyMotifs';
import { activePerspective, ownedPerspective, perspectiveTools } from '../domain/perspectives';
import { canClaimSpecimen, carriesSpecimen, carriedSpecimenCount, hasSpecimen, isSpecimenItem, ownsSpecimen, SPECIMEN_CAPACITY,
  SPECIMEN_SHELF, specimenEquipped, specimenFromTool, specimenReadingFlag } from '../domain/specimenGear';
import { specimenCase, specimenThumbnail, specimenVault } from './specimenVault';
import { journalEvidence, specimenReferences, type SpecimenReference } from '../domain/specimenReferences';
import { timbuktuHorizonPanel } from './timbuktuHorizon';
import { objectUsePanel } from './objectUse';
import { callboardPanel } from './callboardPanel';
import { MODEL_RECORD_GROUP } from '../content/modelRecords';
import { modelRecordPanel } from './modelRecords';
import { TIME_TOOL } from '../domain/timeRoom';
import { PACKING_TOOL } from '../domain/ferryPacking';
import { ferryPackingPanel } from './ferryPacking';
import { timeRoomPanel } from './timeRoom';
import { materialStorePanel } from './materialStores';
import { GLASS_RACK_PREFIX } from '../content/glassRack';
import { glassRackPanel } from './glassRack';
import { STAR_GAME } from '../domain/starPaths';
import { starChart, starField } from './starPaths';
import { BADGE_ANNEX_PREFIX } from '../content/badgeRoom';
import { badgeAnnexPanel } from './badgeAnnex';
import { workSchedulePanel } from './workSchedule';
import { EARLIER_VIEWING } from '../content/earlierViewing';
import { earlierViewingPanel } from './earlierViewing';
import { BEATER_GAME } from '../domain/beaterProof';
import { beaterProofPanel } from './beaterProof';
import { JOINED_CLOTH_GAME, JOINED_CLOTH_OBJECTIVE } from '../domain/joinedCloth';
import { joinedClothPanel } from './joinedCloth';
import { CURTAIN_PREFIX } from '../content/curtainCall';
import { curtainCallPanel } from './curtainCall';
import { FACING_CUE_PREFIX } from '../content/facingCue';
import { facingCuePanel } from './facingCue';
import { COINAGES, FACT, READERS, WITH_REASON, WORDINGS, ATTEMPTS, coinageOf, paintedNotice, wordingOf, type Coinage, type Wording } from '../domain/wordgames';
import { SLATE, boatGuests, dayName, doorPrize, evalClear, pellOpens, rng as fairRng, roll, dueTest, diceFor, runDoors, shareChance } from '../domain/fairgames';
import { BARTER, DYES, TOWN_COSTS, WOAD_BLUE, ferryPrice, ownsDye, townPrice } from '../domain/trade';
import { RUMOURS, RUMOUR_DESKS, type RumourDesk, VERDICTS, currentRumour, missingRumourSources, sourcesChecked } from '../domain/rumours';
import { TALENTS, cannotLearn, hasTalent, insight, spent } from '../domain/talents';
import { WARES, honestLabels, lockedOption, owns, priceFor } from '../domain/shop';
import { calendarGrid, fmtTime, ledgerSums, shade, MAX_SHIELDS } from '../domain/ledger';

const HIST_LABEL_TEXT: Record<HistoricalLabel, [string, string]> = {
  'documented': ['Documented', 'Supported by a named, checkable source. Open the source link to see it.'],
  'reconstruction': ['Reconstruction', 'Made or modelled today to show how something might have been. Not historical evidence by itself.'],
  'scholarly-interpretation': ['Scholarly interpretation', 'An expert account or argument based on sources. It can be questioned.'],
  'imagined-alternate': ['Imagined alternative', 'An invented outcome for play. It did not happen.'],
  'fictional-world': ['Game world (fiction)', 'Part of the invented world of the game. Not a historical claim.'],
};
const CLAIM_TEXT: Record<ClaimKind, [string, string]> = {
  observation: ['Observation', 'Reports what a source, instrument or record shows.'],
  interpretation: ['Interpretation', 'Proposes what observations mean.'],
  value: ['Value judgement', 'Expresses a priority or obligation.'],
  simulation: ['Simulation', "Follows the game's model. Not a real measurement."],
};
const PEN_NAMES: Record<string, string> = { 'loud-model': 'Model of Loud design (coarse ball, thick ink)', 'biro-type': 'Bíró-type model (fine ball, thin ink)' };
const SURFACES: Record<string, string> = { paper: 'Paper', leather: 'Rough leather', wood: 'Rough wood' };
const RING_COLOURS: Record<string, string> = { evidence: '#e9cf7a', certainty: '#9fe8ff', truth: '#f6efd9', interpretation: '#c39bff', power: '#ff8a7a', justification: '#7fd3a8',
  explanation: '#ffb35c', objectivity: '#8fb6ff', perspective: '#ff9fd0', culture: '#d9a066', values: '#b4e07a', responsibility: '#5fd0d0' };

/** One competency ring: a circle that fills as the concept's XP grows. */
function ringSvg(name: string, got: number, max: number, colour: string): HTMLElement {
  const r = 26, len = 2 * Math.PI * r, f = max ? got / max : 0;
  const el = h('figure', { class: `ring ${f >= 1 ? 'full' : ''}`, 'aria-label': `${name}: ${got} of ${max} XP in this chapter` });
  el.innerHTML = `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7"/>
    ${f > 0 ? `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${colour}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(len * f).toFixed(1)} ${len.toFixed(1)}" transform="rotate(-90 32 32)"/>` : ''}
    <text x="32" y="36" text-anchor="middle" font-size="12" fill="currentColor">${got}</text></svg>`;
  el.append(h('figcaption', {}, name, h('small', {}, ` ${got}/${max}`)));
  return el;
}

/** A crest as a small pixel canvas, scaled up crisply. */
function crestCanvas(c: Crest, px: number, scale: number): HTMLCanvasElement {
  const t = document.createElement('canvas'); t.width = px; t.height = px;
  const id = t.getContext('2d')!.createImageData(px, px); id.data.set(crestPixels(c, px)); t.getContext('2d')!.putImageData(id, 0, 0);
  const out = document.createElement('canvas'); out.width = px * scale; out.height = px * scale;
  const g = out.getContext('2d')!; g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, px * scale, px * scale);
  out.className = 'crest'; out.setAttribute('aria-hidden', 'true');
  return out;
}

function chip(text: string, title: string, cls: string): HTMLElement {
  return h('span', { class: `chip ${cls}`, title, 'aria-label': `${text}: ${title}` }, text);
}
export function histChip(l: HistoricalLabel): HTMLElement { return chip(HIST_LABEL_TEXT[l][0], HIST_LABEL_TEXT[l][1], `hist-${l}`); }
export function claimChip(k: ClaimKind): HTMLElement { return chip(CLAIM_TEXT[k][0], CLAIM_TEXT[k][1], `claim-${k}`); }

/** A brass balance, drawn in SVG. `deg` > 0 means the right (weights) pan is lower. */
function balanceSvg(load: string, weights: { label: string; mass: number; untrusted: boolean }[], deg: number): HTMLElement {
  const wrap = h('div', { class: 'balance-wrap', 'aria-hidden': 'true' });
  const dy = Math.sin((deg * Math.PI) / 180) * 100;
  const esc = (t: string) => t.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
  let x = 228;
  const blocks = weights.map((w) => {
    const bw = 8 + Math.min(16, w.mass * 2.4), bh = 6 + Math.min(14, w.mass * 1.6);
    const r = `<rect x="${x}" y="${-bh}" width="${bw}" height="${bh}" rx="1.5" fill="${w.untrusted ? '#8b8f99' : '#d9b45a'}" stroke="${w.untrusted ? '#4a4d55' : '#6b4f19'}"/>`;
    x += bw + 2; return r;
  }).join('');
  wrap.innerHTML = `<svg viewBox="0 0 320 180" width="320" height="180" role="presentation">
  <rect x="120" y="164" width="80" height="10" rx="3" fill="#5b3b22"/><rect x="154" y="40" width="12" height="126" fill="#8a6a2a"/>
  <circle cx="160" cy="34" r="7" fill="#e9cf7a" stroke="#6b4f19"/>
  <g class="beam" style="transform: rotate(${deg}deg)"><rect x="58" y="36" width="204" height="8" rx="3" fill="#c9a24a" stroke="#6b4f19"/>
    <path d="M156 44 L160 58 L164 44 Z" fill="#6b4f19"/></g>
  <g class="pan" style="transform: translate(0px, ${-dy}px)"><line x1="60" y1="40" x2="34" y2="112" stroke="#6b4f19"/><line x1="60" y1="40" x2="86" y2="112" stroke="#6b4f19"/>
    <path d="M24 112 Q60 132 96 112 Z" fill="#c9a24a" stroke="#6b4f19"/>
    <rect x="40" y="94" width="40" height="18" rx="4" fill="#7d5bc4" stroke="#3a2b5e"/><text x="60" y="88" text-anchor="middle" font-size="10" fill="currentColor">${esc(load.length > 22 ? load.slice(0, 21) + '…' : load)}</text></g>
  <g class="pan" style="transform: translate(0px, ${dy}px)"><line x1="260" y1="40" x2="234" y2="112" stroke="#6b4f19"/><line x1="260" y1="40" x2="286" y2="112" stroke="#6b4f19"/>
    <path d="M224 112 Q260 132 296 112 Z" fill="#c9a24a" stroke="#6b4f19"/><g transform="translate(0,112)">${blocks}</g></g>
</svg>`;
  return wrap;
}

const escSvg = (t: string) => t.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

const GLASS = ['#c0392b', '#2e86c1', '#f1c40f', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#d35400', '#2c3e9f', '#c2185b', '#7cb342', '#00838f'];
/** A round window: chords between the points, panes filled like stained glass (flood fill). */
function glassWindow(angles: number[], lit: boolean): HTMLCanvasElement {
  const S = 260, cx = S / 2, cy = S / 2, r = 118;
  const c = document.createElement('canvas'); c.width = S; c.height = S; c.className = 'glass-window';
  const g = c.getContext('2d')!;
  const pts = circlePoints(angles).map(([x, y]) => [cx + x * r, cy - y * r] as [number, number]);
  const lead = (w: number, col: string) => {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { g.beginPath(); g.moveTo(...pts[i]); g.lineTo(...pts[j]); g.stroke(); }
  };
  lead(2.5, '#000');
  const img = g.getImageData(0, 0, S, S), d = img.data;
  const seen = new Uint8Array(S * S);
  let k = 0;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x;
    if (seen[i] || d[i * 4 + 3] > 40 || Math.hypot(x - cx, y - cy) > r - 2) continue;
    const col = GLASS[k++ % GLASS.length];
    const rgb = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
    const stack = [i]; seen[i] = 1;
    while (stack.length) {
      const q = stack.pop()!, qx = q % S, qy = (q / S) | 0;
      const shade = lit ? 1 : 0.45, sh = 0.85 + 0.15 * Math.sin((qx + qy) / 9);
      d[q * 4] = rgb[0] * shade * sh; d[q * 4 + 1] = rgb[1] * shade * sh; d[q * 4 + 2] = rgb[2] * shade * sh; d[q * 4 + 3] = 255;
      for (const n of [q - 1, q + 1, q - S, q + S]) {
        if (n < 0 || n >= S * S || seen[n]) continue;
        const nx = n % S, ny = (n / S) | 0;
        if (Math.abs(nx - qx) > 1 || d[n * 4 + 3] > 40 || Math.hypot(nx - cx, ny - cy) > r - 2) continue;
        seen[n] = 1; stack.push(n);
      }
    }
  }
  g.putImageData(img, 0, 0);
  lead(4, '#2a2a33');
  g.strokeStyle = '#6b6b78'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, r + 4, 0, Math.PI * 2); g.stroke();
  pts.forEach(([x, y]) => { g.fillStyle = '#e9cf7a'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#6b4f19'; g.lineWidth = 1.5; g.stroke(); });
  c.setAttribute('role', 'img');
  c.setAttribute('aria-label', `A round window with ${angles.length} points on its edge, every pair joined with lead: ${panes(angles.length)} panes of coloured glass.`);
  return c;
}

const FRUIT_COL: Record<SorterFruit['colour'], [string, string]> = { red: ['#c0392b', '#7a1f18'], green: ['#7cb342', '#3f6a1e'], yellow: ['#f1c40f', '#9a7a08'] };
/** One fruit, drawn in SVG: colour, size and bruise marks. */
function fruitSvg(f: SorterFruit): string {
  const r = f.size === 'large' ? 11 : 8, [c, e] = FRUIT_COL[f.colour];
  return `<svg viewBox="-14 -16 28 30" width="34" height="36" aria-hidden="true"><circle r="${r}" fill="${c}" stroke="${e}" stroke-width="1.5"/><ellipse cx="${-r / 3}" cy="${-r / 3}" rx="${r / 4}" ry="${r / 6}" fill="#fff" opacity="0.5"/>
    <path d="M0 ${-r} q1 -4 3 -5" stroke="#5b3b22" stroke-width="1.5" fill="none"/><path d="M1 ${-r - 2} q5 -3 7 0 q-4 2 -7 0" fill="#4f8a4a"/>
    ${f.bruised ? `<circle cx="${r / 3}" cy="${r / 4}" r="${r / 3.2}" fill="#6b4a22" opacity="0.85"/><circle cx="${-r / 4}" cy="${r / 2}" r="${r / 5}" fill="#6b4a22" opacity="0.8"/>` : ''}</svg>`;
}
function fruitLabel(f: SorterFruit): string { return `${f.size} ${f.colour} fruit${f.bruised ? ', bruised' : ''}`; }
/** The brass sorter and its two chutes, with the basket sorted into them. */
function sorterView(p: Extract<PuzzleRecord, { type: 'sorter' }>, run: SorterRun | null): HTMLElement {
  const byId = new Map(p.fruits.map((f) => [f.id, f]));
  const bin = (title: string, calls: SorterRun['calls']) => h('div', { class: 'sorter-bin' }, h('strong', {}, title),
    h('div', { class: 'bin-fruits' }, ...calls.map((c, i) => { const f = byId.get(c.id)!; const el = h('span', { class: `bin-fruit ${c.right ? 'right' : 'wrong'}`, title: `${fruitLabel(f)}: ${c.call === 'unknown' ? 'never seen this colour' : c.call}`, style: { animationDelay: `${i * 0.12}s` } }); el.innerHTML = fruitSvg(f) + `<b aria-hidden="true">${c.right ? '✓' : '✕'}</b>`; return el; })),
    h('span', { class: 'sr-only' }, calls.map((c) => `${fruitLabel(byId.get(c.id)!)}: ${c.right ? 'right' : 'wrong'}`).join('; ')));
  const machine = h('div', { class: 'sorter-machine', 'aria-hidden': 'true' });
  machine.innerHTML = `<svg viewBox="0 0 160 110" width="160" height="110"><path d="M40 6 H120 L100 40 H60 Z" fill="#c9a24a" stroke="#6b4f19" stroke-width="2"/><rect x="58" y="40" width="44" height="34" rx="4" fill="#d9b45a" stroke="#6b4f19" stroke-width="2"/>
    <circle class="cog" cx="80" cy="57" r="10" fill="#e9cf7a" stroke="#6b4f19" stroke-width="2" stroke-dasharray="4 2"/><circle cx="80" cy="57" r="3" fill="#6b4f19"/>
    <path d="M62 74 L30 104" stroke="#8a6a2a" stroke-width="8" stroke-linecap="round"/><path d="M98 74 L130 104" stroke="#8a6a2a" stroke-width="8" stroke-linecap="round"/></svg>`;
  return h('div', { class: 'sorter-view' }, machine,
    run ? h('div', { class: 'sorter-bins' }, bin('To market', run.calls.filter((c) => c.call === 'market')), bin('Set aside', run.calls.filter((c) => c.call !== 'market'))) : h('p', { class: 'fine' }, 'The basket is waiting.'));
}

/** Oskar's map of Emberford: a parchment sheet with only the chosen layers drawn (original art). */
const DIVE_DEPTH_TEXT: Record<number, string> = { 1: 'down 10 m', 2: 'down 25 m', 3: 'down 45 m, rare' };

/** Weather clue pictures for the forecast board (original, drawn in code). */
function clueSvg(kind: 'baro' | 'clouds' | 'birds', v: string): string {
  if (kind === 'baro') {
    const ang = v === 'falling' ? 210 : v === 'rising' ? 330 : 270, r = (ang * Math.PI) / 180;
    return `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="26" fill="#f3eee0" stroke="#a87445" stroke-width="4"/><path d="M12 38 A20 20 0 0 1 48 38" stroke="#4a90d9" stroke-width="3" fill="none"/><text x="10" y="50" font-size="7" fill="#3b2a1a">rain</text><text x="38" y="50" font-size="7" fill="#3b2a1a">fair</text><line x1="30" y1="32" x2="${30 + Math.cos(r) * 18}" y2="${32 + Math.sin(r) * 18}" stroke="#b03a2e" stroke-width="3" stroke-linecap="round"/><circle cx="30" cy="32" r="3" fill="#3b2a1a"/>${v === 'steady' ? '' : `<path d="M${v === 'falling' ? '44 10 l6 0 l-3 6 z' : '44 16 l6 0 l-3 -6 z'}" fill="#b03a2e"/>`}</svg>`;
  }
  if (kind === 'clouds') {
    if (v === 'none') return `<svg viewBox="0 0 60 60" aria-hidden="true"><rect width="60" height="60" rx="8" fill="#9fd3ff"/><circle cx="30" cy="30" r="10" fill="#ffd25a"/></svg>`;
    const low = v === 'low';
    return `<svg viewBox="0 0 60 60" aria-hidden="true"><rect width="60" height="60" rx="8" fill="${low ? '#8794a6' : '#b9dcf5'}"/>${low ? '<g fill="#5d6675"><circle cx="18" cy="30" r="11"/><circle cx="32" cy="26" r="13"/><circle cx="45" cy="31" r="10"/><rect x="8" y="30" width="46" height="12" rx="6"/></g>' : '<g stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity="0.9"><path d="M8 14 q12 -6 24 0"/><path d="M26 22 q14 -6 28 0"/><path d="M10 30 q10 -4 20 0"/></g>'}</svg>`;
  }
  const y = v === 'low' ? 44 : 14;
  return `<svg viewBox="0 0 60 60" aria-hidden="true"><rect width="60" height="60" rx="8" fill="#cfe8d0"/><rect y="50" width="60" height="10" fill="#7aa06a"/>${[[14, y], [30, y + 4], [44, y - 2]].map(([x, yy]) => `<path d="M${x - 6} ${yy - 3} q6 4 6 3 q0 1 6 -3" stroke="#2a2a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/>`).join('')}</svg>`;
}

/** The painter's market scene (original art, drawn in code). 1 scene unit = 10 px. */
function frameScene(items: FrameItem[], w: number, h: number): string {
  const U = 10;
  const person = (cx: number, base: number, k: number, skin: string, shirt: string, hair: string, mood: 'smile' | 'sad' | 'cross' = 'smile') => {
    const hd = 3.2 * k, bodyH = 9 * k;
    const mouth = mood === 'smile' ? `<path d="M${cx - 1.2 * k} ${base - bodyH - hd + 1 * k} q${1.2 * k} ${1 * k} ${2.4 * k} 0" stroke="#3b2a1a" stroke-width="0.7" fill="none"/>`
      : mood === 'sad' ? `<path d="M${cx - 1.2 * k} ${base - bodyH - hd + 1.6 * k} q${1.2 * k} ${-1 * k} ${2.4 * k} 0" stroke="#3b2a1a" stroke-width="0.7" fill="none"/>`
        : `<path d="M${cx - 1.2 * k} ${base - bodyH - hd + 1.3 * k} h${2.4 * k}" stroke="#3b2a1a" stroke-width="0.8"/>`;
    return `<rect x="${cx - 2.6 * k}" y="${base - bodyH}" width="${5.2 * k}" height="${bodyH}" rx="${1.5 * k}" fill="${shirt}"/>
      <circle cx="${cx}" cy="${base - bodyH - hd + 0.4 * k}" r="${hd}" fill="${skin}"/>
      <path d="M${cx - hd} ${base - bodyH - hd} a${hd} ${hd} 0 0 1 ${2 * hd} 0 z" fill="${hair}"/>
      <circle cx="${cx - 1.1 * k}" cy="${base - bodyH - hd + 0.2 * k}" r="${0.45 * k}" fill="#2a1d14"/><circle cx="${cx + 1.1 * k}" cy="${base - bodyH - hd + 0.2 * k}" r="${0.45 * k}" fill="#2a1d14"/>${mouth}`;
  };
  const art: Record<string, (i: FrameItem) => string> = {
    sun: (i) => { const cx = (i.x + i.w / 2) * U, cy = (i.y + i.h / 2) * U; return `<g stroke="#ffd25a" stroke-width="2">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="${cx + Math.cos((a * Math.PI) / 180) * 11}" y1="${cy + Math.sin((a * Math.PI) / 180) * 11}" x2="${cx + Math.cos((a * Math.PI) / 180) * 15}" y2="${cy + Math.sin((a * Math.PI) / 180) * 15}"/>`).join('')}</g><circle cx="${cx}" cy="${cy}" r="8" fill="#ffd25a"/>`; },
    cloud: (i) => { const x = i.x * U, y = i.y * U; return `<g fill="#7d8796"><circle cx="${x + 12}" cy="${y + 12}" r="9"/><circle cx="${x + 25}" cy="${y + 8}" r="11"/><circle cx="${x + 38}" cy="${y + 13}" r="8"/><rect x="${x + 6}" y="${y + 12}" width="38" height="9" rx="4"/></g><g stroke="#9fc4e8" stroke-width="1.4">${[0, 1, 2, 3, 4, 5].map((n) => `<line x1="${x + 10 + n * 6}" y1="${y + 24 + (n % 2) * 4}" x2="${x + 7 + n * 6}" y2="${y + 32 + (n % 2) * 4}"/>`).join('')}</g>`; },
    stall: (i) => { const x = i.x * U, y = i.y * U, W = i.w * U, H = i.h * U; return `<rect x="${x + 4}" y="${y + 8}" width="3" height="${H - 8}" fill="#6b4a2a"/><rect x="${x + W - 7}" y="${y + 8}" width="3" height="${H - 8}" fill="#6b4a2a"/>${Array.from({ length: 7 }, (_, n) => `<rect x="${x + (n * W) / 7}" y="${y}" width="${W / 7}" height="9" fill="${n % 2 ? '#fff4e0' : '#d9534a'}"/>`).join('')}<rect x="${x + 2}" y="${y + H - 14}" width="${W - 4}" height="7" fill="#a87445"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((n) => `<circle cx="${x + 9 + n * 7}" cy="${y + H - 16}" r="3" fill="${['#f28c28', '#e04848', '#9bd35a', '#ffd25a'][n % 4]}"/>`).join('')}`; },
    crowd: (i) => { const x = i.x * U, b = (i.y + i.h) * U; return [[6, '#8d5524', '#4a90d9', '#2a1d14'], [18, '#f1c27d', '#c0392b', '#6b4423'], [31, '#c68642', '#27ae60', '#1b1b1b'], [44, '#e0ac69', '#8e44ad', '#b5651d'], [54, '#5a3825', '#e67e22', '#111']].map(([dx, sk, sh, hr], n) => person(x + (dx as number), b - (n % 2) * 2, 1.25, sk as string, sh as string, hr as string)).join(''); },
    child: (i) => { const cx = (i.x + i.w / 2) * U, b = (i.y + i.h) * U; return `<line x1="${cx + 4}" y1="${b - 16}" x2="${cx + 12}" y2="${b - 64}" stroke="#eee" stroke-width="0.8"/>${person(cx, b, 0.95, '#a0662f', '#f1c40f', '#1b1b1b')}<line x1="${cx + 2}" y1="${b - 9}" x2="${cx + 5}" y2="${b - 16}" stroke="#a0662f" stroke-width="1.6"/>`; },
    kite: (i) => { const cx = (i.x + i.w / 2) * U, cy = (i.y + i.h / 2) * U; return `<path d="M${cx} ${cy - 9} L${cx + 7} ${cy} L${cx} ${cy + 9} L${cx - 7} ${cy} z" fill="#e74c3c" stroke="#7a1f1a"/><path d="M${cx} ${cy - 9} V${cy + 9} M${cx - 7} ${cy} H${cx + 7}" stroke="#ffd25a" stroke-width="1"/><path d="M${cx} ${cy + 9} q4 6 0 10 q-4 5 2 9" stroke="#3498db" fill="none" stroke-width="1.2"/>`; },
    seller: (i) => { const x = i.x * U, y = i.y * U, W = i.w * U, H = i.h * U; return `<rect x="${x + 3}" y="${y + 6}" width="3" height="${H - 6}" fill="#5b4632"/><rect x="${x + W - 6}" y="${y + 6}" width="3" height="${H - 6}" fill="#5b4632"/><rect x="${x}" y="${y}" width="${W}" height="7" fill="#8a7f66"/><rect x="${x + 2}" y="${y + H - 16}" width="${W - 4}" height="6" fill="#7a5a3a"/><rect x="${x + 6}" y="${y + H - 4}" width="9" height="4" fill="#6b4a2a"/>${person(x + 11, y + H - 4, 1.1, '#d4a373', '#6c7a89', '#ddd', 'sad')}`; },
    argue: (i) => { const x = i.x * U, b = (i.y + i.h) * U; return `${person(x + 9, b, 1.25, '#f1c27d', '#2c3e50', '#6b4423', 'cross')}${person(x + 31, b, 1.25, '#8d5524', '#16a085', '#111', 'cross')}<path d="M${x + 15} ${b - 22} l4 -3 l1 4 l4 -3 l1 4" stroke="#e74c3c" stroke-width="1.6" fill="none"/><text x="${x + 20}" y="${b - 30}" font-size="10" font-weight="700" fill="#e74c3c" text-anchor="middle">!!</text>`; },
    guard: (i) => { const cx = (i.x + i.w / 2) * U, b = (i.y + i.h) * U; return `<line x1="${cx + 6}" y1="${b}" x2="${cx + 6}" y2="${b - 36}" stroke="#6b4a2a" stroke-width="1.6"/><path d="M${cx + 6} ${b - 40} l-2 5 h4 z" fill="#bbb"/>${person(cx, b, 1.25, '#c68642', '#7f8c8d', '#555', 'cross')}<path d="M${cx - 4.5} ${b - 15.5} a4.5 4.5 0 0 1 9 0 z" fill="#95a5a6"/>`; },
  };
  const H = h * U, W = w * U, ground = 6 * U;
  return `<defs><linearGradient id="fr-sky" x1="0" x2="1"><stop offset="0" stop-color="#9fd3ff"/><stop offset="0.6" stop-color="#b8cde0"/><stop offset="1" stop-color="#8794a6"/></linearGradient></defs>
  <rect width="${W}" height="${ground + 4}" fill="url(#fr-sky)"/>
  <path d="M0 ${ground} q40 -14 90 -4 q60 -16 120 -2 q60 -12 ${W - 210} 0 V${ground + 6} H0 z" fill="#7aa06a"/>
  <rect y="${ground + 4}" width="${W}" height="${H - ground - 4}" fill="#cdb894"/>
  <g stroke="#b59f78" stroke-width="0.6">${Array.from({ length: 9 }, (_, r) => `<line x1="0" y1="${ground + 12 + r * 10}" x2="${W}" y2="${ground + 12 + r * 10}"/>`).join('')}</g>
  ${items.map((i) => (art[i.art] ?? (() => ''))(i)).join('')}`;
}

function townMapSvg(layers: string[]): HTMLElement {
  const on = (id: string) => layers.includes(id);
  const wrap = h('div', { class: 'townmap-wrap', role: 'img', 'aria-label': `A map of Emberford showing: ${layers.length ? layers.join(', ') : 'nothing yet'}.` });
  const heart = (x: number, y: number) => `<path d="M${x} ${y + 4} l-5 -5 a3 3 0 0 1 5 -4 a3 3 0 0 1 5 4 z" fill="#e0607e" stroke="#7a1f3a" stroke-width="1"/>`;
  wrap.innerHTML = `<svg viewBox="0 0 320 220" width="320" height="220" aria-hidden="true">
  <defs><filter id="rough"><feTurbulence baseFrequency="0.04" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2"/></filter></defs>
  <rect x="4" y="4" width="312" height="212" rx="6" fill="#efe1bd" stroke="#8a6a3a" stroke-width="3"/>
  <path d="M292 4 C282 60 300 110 286 160 C278 190 290 205 288 216" stroke="#7fb3d1" stroke-width="12" fill="none" opacity="0.8"/>
  ${on('slope') ? `<g stroke="#9a6a3c" stroke-width="1.2" fill="none" stroke-dasharray="5 3" opacity="0.85"><ellipse cx="165" cy="142" rx="40" ry="18"/><ellipse cx="165" cy="140" rx="80" ry="40"/><ellipse cx="165" cy="136" rx="130" ry="70"/></g>
    <g fill="#9a6a3c">${[[60, 70], [270, 60], [80, 195], [240, 200]].map(([x, y]) => { const a = Math.atan2(142 - y, 165 - x); return `<path transform="translate(${x} ${y}) rotate(${(a * 180) / Math.PI})" d="M0 0 L10 0 M10 0 L6 -3 M10 0 L6 3" stroke="#9a6a3c" stroke-width="1.5"/>`; }).join('')}</g><text x="165" y="145" text-anchor="middle" font-size="8" fill="#7a4a22">low ground</text>` : ''}
  ${on('roads') ? `<g stroke="#b98d55" stroke-linecap="round" fill="none"><path d="M10 112 H286" stroke-width="10"/><path d="M160 112 V24" stroke-width="8"/><path d="M40 112 V180 H120" stroke-width="6"/><path d="M210 112 Q240 80 262 70" stroke-width="6"/><path d="M220 112 Q250 130 286 122" stroke-width="5"/></g><path d="M276 116 h20 v12 h-20z" fill="#8a6a3a"/>` : ''}
  ${on('wells') ? [[92, 70], [232, 172]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#5fa8d3" stroke="#2b5d7a" stroke-width="2"/><circle cx="${x}" cy="${y}" r="3" fill="#2b5d7a"/>`).join('') : ''}
  ${on('stalls') ? [[136, 122, 'M'], [152, 122, 'H'], [168, 122, 'C'], [184, 122, 'T'], [144, 136, 'O'], [176, 136, 'R']].map(([x, y, t]) => `<rect x="${x}" y="${y}" width="12" height="10" fill="#d9534a" stroke="#7a2a22"/><rect x="${x}" y="${y}" width="12" height="3" fill="#f3eee0"/><text x="${Number(x) + 6}" y="${Number(y) + 10}" text-anchor="middle" font-size="7" font-weight="700" fill="#2a1d14">${t}</text>`).join('') : ''}
  ${on('loved') ? `${heart(116, 152)}${heart(280, 112)}${heart(58, 186)}<text x="116" y="166" text-anchor="middle" font-size="7" fill="#7a1f3a">warm step</text><text x="270" y="98" text-anchor="middle" font-size="7" fill="#7a1f3a">echo</text><text x="58" y="202" text-anchor="middle" font-size="7" fill="#7a1f3a">climbing tree</text>` : ''}
  ${on('names') ? `<g font-size="9" font-weight="700" fill="#3b2a1a"><rect x="140" y="12" width="40" height="14" fill="#c9b48a" stroke="#6b4f19"/><text x="160" y="36" text-anchor="middle">Guild hall</text>
    <rect x="22" y="92" width="22" height="14" fill="#c9b48a" stroke="#6b4f19"/><text x="33" y="88" text-anchor="middle">Forge</text>
    <rect x="252" y="58" width="22" height="14" fill="#c9b48a" stroke="#6b4f19"/><text x="263" y="54" text-anchor="middle">Inn</text>
    <rect x="102" y="170" width="22" height="12" fill="#c9b48a" stroke="#6b4f19"/><text x="113" y="194" text-anchor="middle">Bakery</text>
    <text x="70" y="106" font-style="italic" font-weight="400">Anvil Street</text><text x="160" y="152" text-anchor="middle" font-weight="400" font-style="italic">Market</text></g>` : ''}
  <g transform="translate(26 30)"><circle r="12" fill="#f6ecd0" stroke="#8a6a3a"/><path d="M0 -10 L3 0 L0 10 L-3 0 Z" fill="#8a6a3a"/><text y="-14" text-anchor="middle" font-size="8" fill="#6b4f19">N</text></g>
  ${layers.length ? '' : '<text x="160" y="114" text-anchor="middle" font-size="12" fill="#8a6a3a">An empty sheet</text>'}
</svg>`;
  return wrap;
}

/** The guild clerk's map for a sightlines puzzle. Blue lines are clear views; orange stops with ✕. */
function sightMapSvg(p: Extract<PuzzleRecord, { type: 'sightlines' }>, active: string | null, onPick: (id: string) => void): HTMLElement {
  const C = 20, W = p.grid.w * C, H = p.grid.h * C;
  const wrap = h('div', { class: 'sight-wrap' });
  const blocks = p.blocks.map((b) => {
    const x = b.x * C, y = b.y * C, w = b.w * C, hh = b.h * C;
    if (b.kind === 'fountain') return `<circle cx="${x + w / 2}" cy="${y + hh / 2}" r="${Math.min(w, hh) / 2 - 1}" fill="#9fb7c8" stroke="#5b6b7a" stroke-width="3"/><circle cx="${x + w / 2}" cy="${y + hh / 2}" r="${Math.min(w, hh) / 5}" fill="#cfe3ef"/>`;
    if (b.kind === 'crates') return `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${hh - 2}" fill="#a87445" stroke="#5b3b22" stroke-width="2"/><path d="M${x + 1} ${y + hh / 2}H${x + w - 1}M${x + 1} ${y + 1}L${x + w - 1} ${y + hh / 2}" stroke="#5b3b22"/>`;
    return `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${hh - 2}" rx="3" fill="#d9534a" stroke="#7a2a22" stroke-width="2"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 2 + i * (w - 4) / 5}" y="${y + 2}" width="${(w - 4) / 10}" height="${hh - 4}" fill="#f3eee0" opacity="0.8"/>`).join('')}`;
  }).join('');
  const letters = 'ABCDEFGH';
  const spots = p.spots.map((s, i) => `<g><circle cx="${s.x * C + C / 2}" cy="${s.y * C + C / 2}" r="8" fill="#e9cf7a" stroke="#6b4f19" stroke-width="2"/><text x="${s.x * C + C / 2}" y="${s.y * C + C / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#2a1d14">${letters[i]}</text></g>`).join('');
  let rays = '';
  const w = p.witnesses.find((x) => x.id === active);
  if (w) for (const s of p.spots) {
    const ax = w.x * C + C / 2, ay = w.y * C + C / 2, bx = s.x * C + C / 2, by = s.y * C + C / 2;
    const b = sightBlock(p.blocks, w.x, w.y, s.x, s.y);
    if (!b) rays += `<line class="ray" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#4aa3ff" stroke-width="3"/>`;
    else {
      const mx = b.x * C, my = b.y * C;
      rays += `<line class="ray" x1="${ax}" y1="${ay}" x2="${mx}" y2="${my}" stroke="#4aa3ff" stroke-width="3"/><line x1="${mx}" y1="${my}" x2="${bx}" y2="${by}" stroke="#ff8a3a" stroke-width="2" stroke-dasharray="4 4" opacity="0.8"/><text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="16" font-weight="700" fill="#ff8a3a" stroke="#2a1d14" stroke-width="0.8">✕</text>`;
    }
  }
  const people = p.witnesses.map((x) => `<g class="witness" data-w="${x.id}" tabindex="-1"><circle cx="${x.x * C + C / 2}" cy="${x.y * C + C / 2}" r="${active === x.id ? 10 : 8}" fill="${x.colour}" stroke="${active === x.id ? '#fff3c4' : '#2a1d14'}" stroke-width="${active === x.id ? 3 : 2}"/><text x="${x.x * C + C / 2}" y="${x.y * C + C / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#14101c">${x.name[0]}</text></g>`).join('');
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><defs><pattern id="cobble" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#bdb4a2"/><path d="M0 10H20M10 0V10M0 20V10M20 20V10" stroke="#a39a88" stroke-width="1"/></pattern></defs>
  <rect width="${W}" height="${H}" rx="6" fill="url(#cobble)"/>${blocks}${rays}${spots}${people}</svg>`;
  wrap.querySelectorAll<SVGGElement>('.witness').forEach((g) => g.addEventListener('click', () => onPick(g.dataset.w!)));
  return wrap;
}

/** The face of a restored object (data-driven: background, ink, lines, optional window). */
function plaqueSvg(f: PlaqueFace, label: string): HTMLElement {
  const wrap = h('div', { class: 'plaque-wrap', role: 'img', 'aria-label': `${label}: ${f.lines.join(' ')}${f.window ? `. A small window shows: ${f.window.lines.join(' ')}` : ''}` });
  const lines = (ls: string[], x: number, y0: number, size: number, ink: string) => ls.map((t, i) =>
    `<text x="${x}" y="${y0 + i * (size + 6)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${ink}" letter-spacing="1">${escSvg(t)}</text>`).join('');
  const w = f.window;
  wrap.innerHTML = `<svg viewBox="0 0 320 150" width="320" height="150" aria-hidden="true">
  <rect x="6" y="6" width="308" height="138" rx="10" fill="#3b2a1a"/><rect x="12" y="12" width="296" height="126" rx="7" fill="${f.bg}"/>
  <circle cx="22" cy="22" r="3" fill="#8a7a5a"/><circle cx="298" cy="22" r="3" fill="#8a7a5a"/><circle cx="22" cy="128" r="3" fill="#8a7a5a"/><circle cx="298" cy="128" r="3" fill="#8a7a5a"/>
  ${lines(f.lines, 160, f.lines.length > 2 ? 46 : 64, f.lines.length > 2 ? 15 : 20, f.ink)}
  ${w ? `<rect x="24" y="96" width="96" height="36" rx="3" fill="${w.bg}" stroke="#f3eee0" stroke-dasharray="3 2"/>${lines(w.lines, 72, 110, 9, w.ink)}` : ''}
</svg>`;
  return wrap;
}

/** A cross-section of the layers, top first. Unseen layers are hatched; lost layers fade. */
function layerStackSvg(layers: RestoreLayer[], seen: number, lost: string[]): HTMLElement {
  const wrap = h('div', { class: 'stack-wrap', 'aria-hidden': 'true' });
  const bh = 22;
  const rows = layers.map((l, i) => {
    const y = 8 + i * (bh + 4);
    if (i >= seen) return `<rect x="8" y="${y}" width="304" height="${bh}" rx="4" fill="url(#hatch)" stroke="#6a5a48"/><text x="20" y="${y + 15}" font-size="11" fill="#cfc4b0">? Not seen yet</text>`;
    const gone = lost.includes(l.id);
    return `<rect x="8" y="${y}" width="304" height="${bh}" rx="4" fill="${l.colour}" opacity="${gone ? 0.25 : 1}" stroke="${gone ? '#d9534a' : '#2a2018'}" ${gone ? 'stroke-dasharray="5 3"' : ''}/>
      <text x="20" y="${y + 15}" font-size="11" font-weight="700" fill="${gone ? '#d9534a' : lightInk(l.colour)}">${i + 1}. ${escSvg(l.name)}${gone ? ' (lost)' : ''}</text>`;
  }).join('');
  const hgt = 16 + layers.length * (bh + 4);
  wrap.innerHTML = `<svg viewBox="0 0 320 ${hgt}" width="320" height="${hgt}"><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#3a3028"/><line x1="0" y1="0" x2="0" y2="8" stroke="#5a4a3a" stroke-width="3"/></pattern></defs>${rows}</svg>`;
  return wrap;
}
function lightInk(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum > 140 ? '#1d1610' : '#f6efe2';
}

export class UI implements UIApi {
  private root: HTMLElement;
  private hud!: HTMLElement;
  private hudDock!: HTMLElement;
  private modal: HTMLElement | null = null;
  private titleModalOpener: HTMLElement | null = null;
  private releaseTrap: (() => void) | null = null;
  private releaseStitching: (() => void) | null = null;
  private promptEl!: HTMLElement;
  private toastBox!: HTMLElement;
  private saveFeedback: HTMLElement | null = null;
  private lumenBubble!: HTMLElement;
  private onStart: () => void;
  private pendingChapterEnd = false;
  private seenObjectives = new Set<string>();
  private fullRings = new Set<string>();
  /** Things that wait until the open panel closes: events and reflection offers. */
  private queue: (() => void)[] = [];
  private activeEvent: string | null = null;
  private activeEventNode: string | null = null;
  private stopStoryCue: (() => void) | null = null;

  constructor(root: HTMLElement, onStart: () => void) {
    this.root = root;
    this.onStart = onStart;
    this.toastBox = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    this.root.append(this.toastBox);
    ctx.controller.onEvents((ev) => this.handleEvents(ev));
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  // --------------------------------------------------------------- basics

  isModalOpen(): boolean { return !!this.modal; }

  private sfx(key: string): void { ctx.world?.playSfx(key); }

  private openModal(cls: string, label: string, ...content: (Node | string)[]): HTMLElement {
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active.matches('.title-screen button') ? active : this.titleModalOpener;
    this.closeModal(false);
    this.titleModalOpener = opener;
    const box = h('div', { class: `panel ${cls}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, ...content);
    const state = ctx.controller.state;
    if (state && box.classList.contains('bench-panel') && !box.querySelector('.work-guide')) {
      box.append(localGuide(ctx.controller, MAPS[state.mapId]?.world ?? ''));
    }
    const wrap = h('div', { class: 'modal-wrap', onclick: (e: MouseEvent) => { if (e.target === wrap && !cls.includes('dialogue')) this.closeModal(); } }, box);
    this.root.append(wrap);
    this.modal = wrap;
    this.releaseTrap = trapFocus(box);
    this.setPrompt(null);
    return box;
  }

  closeModal(sound = true): void {
    if (!this.modal) return;
    if (this.modal.querySelector('.journal')) flushJournalWriting(ctx.controller);
    try { window.speechSynthesis?.cancel(); } catch { /* no speech */ }
    // A player can leave a Calm invitation or its conversation with Escape or a click.
    // Internal modal changes during dialogue use closeModal(false) and keep its state.
    const leaveEvent = sound && (
      this.modal.querySelector('[role="dialog"].event')
      || (this.activeEvent && this.modal.querySelector('[role="dialog"].dialogue'))
    );
    this.releaseTrap?.();
    this.releaseStitching?.();
    this.releaseStitching = null;
    this.modal.remove();
    this.modal = null;
    const opener = this.titleModalOpener;
    this.titleModalOpener = null;
    if (leaveEvent) {
      if (this.activeEvent && this.activeEventNode) {
        ctx.controller.dispatch({ type: 'SetFlag', flag: `event.resume.${this.activeEvent}`, value: this.activeEventNode });
      }
      this.activeEvent = null;
      this.activeEventNode = null;
      ctx.controller.dispatch({ type: 'DelayEvent' });
    }
    if (sound) this.sfx('sfx.click');
    const canvas = document.querySelector<HTMLCanvasElement>('#game canvas');
    if (opener?.isConnected) opener.focus();
    else if (canvas) {
      canvas.tabIndex = -1;
      canvas.focus();
    }
    this.refreshHud();
    if (this.pendingChapterEnd) { this.pendingChapterEnd = false; this.chapterEnd(); return; }
    if (this.queue.length) {
      setTimeout(() => {
        // A dialogue can replace its panel before this callback runs.
        if (!this.modal) this.queue.shift()?.();
      }, 0);
    }
  }

  /** Run now if nothing is open; otherwise run when the open panel closes. */
  private whenFree(fn: () => void): void {
    if (this.modal) this.queue.push(fn); else fn();
  }

  private closeBtn(): HTMLElement {
    return h('button', { class: 'close', 'aria-label': 'Close', onclick: () => this.closeModal() }, '✕');
  }

  /** At most three toasts at once; the rest wait their turn, so a busy moment stays readable. */
  private toastQueue: { text: string; kind: string }[] = [];
  toast(text: string, kind = 'info'): void {
    this.toastQueue.push({ text, kind });
    this.pumpToasts();
  }
  private pumpToasts(): void {
    while (this.toastQueue.length && this.toastBox.querySelectorAll('.toast:not(.out)').length < 3) {
      const { text, kind } = this.toastQueue.shift()!;
      const t = h('div', { class: `toast toast-${kind}` }, text);
      this.toastBox.append(t);
      setTimeout(() => { t.classList.add('out'); this.pumpToasts(); }, 3600);
      setTimeout(() => t.remove(), 4200);
    }
  }

  setPrompt(text: string | null): void {
    if (!this.promptEl) return;
    if (!text || this.modal) { this.promptEl.hidden = true; return; }
    this.promptEl.hidden = false;
    const key = ctx.settings.keys.interact;
    if (this.promptEl.textContent === `${key} ${text}`) return;
    clear(this.promptEl);
    this.promptEl.append(h('kbd', {}, key), ` ${text}`);
  }

  private onKey(e: KeyboardEvent): void {
    // Shortcuts act once per press, even when they change which panel has focus.
    if (e.repeat) return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { if (e.key === 'Escape') this.closeModal(); return; }
    if (!this.hud?.isConnected) {
      if (e.key === 'Escape' && this.modal) this.closeModal();
      return;
    }
    if (this.photoBar) { if (e.key === 'Escape') this.closePhotoMode(); return; }
    if (this.emoteBar) {
      if (e.key === 'Escape' || actionFor(ctx.settings.keys, e.key) === 'emote') { this.closeEmotes(); return; }
      if (/^[1-9]$/.test(e.key)) { this.emoteBar.querySelectorAll<HTMLButtonElement>('button')[Number(e.key) - 1]?.click(); return; }
    }
    if (e.key === 'Escape') { if (this.modal) this.closeModal(); else this.openMenu(); return; }
    if (this.modal?.querySelector('.map-panel') && actionFor(ctx.settings.keys, e.key) === 'map') { this.closeModal(); return; }
    if (this.modal) {
      // Number keys choose dialogue options.
      if (/^[1-9]$/.test(e.key)) this.modal.querySelectorAll<HTMLButtonElement>('.options button')[Number(e.key) - 1]?.click();
      return;
    }
    const a = actionFor(ctx.settings.keys, e.key);
    if (a === 'journal') this.openJournal();
    else if (a === 'portfolio') this.openJournal('portfolio');
    else if (a === 'bag') this.openBag();
    else if (a === 'hint') this.askLumen();
    else if (a === 'emote') this.openEmotes();
    else if (a === 'map') this.openMap();
  }

  // ------------------------------------------------- diegetic UI: compass and folding map

  private compassEl: HTMLElement | null = null;
  private compassDeg: number | null = null;
  setCompass(deg: number | null, label: string): void {
    const el = this.compassEl;
    if (!el || !el.isConnected) return;
    const needle = el.querySelector<HTMLElement>('.needle');
    if (needle) {
      // Turn the short way round, so the needle never spins a full circle.
      if (deg !== null && this.compassDeg !== null) { let d = deg - (this.compassDeg % 360); d = ((d + 540) % 360) - 180; deg = this.compassDeg + d; }
      this.compassDeg = deg;
      needle.style.transform = `rotate(${(deg ?? -90) + 90}deg)`;
      needle.classList.toggle('idle', deg === null);
    }
    const t = `Compass: ${deg === null ? label : `points to ${label}`}. Click or press ${ctx.settings.keys.map} for the map.`;
    if (el.getAttribute('aria-label') !== t) { el.setAttribute('aria-label', t); el.title = t; }
  }

  /** The folding map: a picture of the whole place, with pins. */
  openMap(): void {
    const c = ctx.controller, world = ctx.world;
    const map = MAPS[c.state.mapId];
    if (!world || !map) return;
    world.snapshotPosition();
    const box = this.openModal('map-panel wide', 'Map', this.closeBtn(), h('h2', {}, map.name), h('p', { class: 'fine' }, 'Unfolding the map…'));
    this.sfx('sfx.page');
    world.mapSnap((r) => {
      if (!box.isConnected) return;
      clear(box);
      const dismiss = this.closeBtn();
      box.append(dismiss, h('h2', {}, map.name));
      dismiss.focus();
      if (!r) { box.append(h('p', {}, 'This browser could not draw the map.')); return; }
      const paper = h('div', { class: 'chart' });
      const img = h('img', { src: r.img.src, alt: `Map of ${map.name}` });
      paper.append(img, h('div', { class: 'folds', 'aria-hidden': 'true' }));
      const pins = h('div', { class: 'pins' });
      const ICON: Record<string, string> = { you: '★', new: '!', place: '•', waystone: '◆', portal: '⇲' };
      const percentX = (x: number) => `${x / r.img.naturalWidth * 100}%`;
      const percentY = (y: number) => `${y / r.img.naturalHeight * 100}%`;
      const pinAt = (x: number, y: number, kind: string, label: string, symbol: string) => {
        const [px, py] = r.at(x, y);
        return h('span', { class: `pin-${kind}`, title: label, 'aria-label': label, role: 'img', style: { left: percentX(px), top: percentY(py) } }, symbol);
      };
      for (const mark of r.marks) pins.append(pinAt(mark.x, mark.y, mark.kind, mark.label, ICON[mark.kind]));
      const plan = mapPinControls(c, map.id, (pin) => {
        pins.querySelector('.pin-own')?.remove();
        if (pin) pins.append(pinAt((pin.x + 0.5) * TILE, (pin.y + 0.5) * TILE, 'own', PIN_PURPOSES[pin.purpose], '▲'));
      });
      paper.append(pins);
      // Fog of war: clouds over chunks not yet explored.
      const fogL = h('div', { class: 'fog', 'aria-hidden': 'true' });
      for (const f of r.fog) {
        const [x0, y0] = r.at(f.x, f.y), [x1, y1] = r.at(f.x + f.w, f.y + f.h);
        fogL.append(h('span', { style: { left: percentX(x0), top: percentY(y0), width: percentX(x1 - x0), height: percentY(y1 - y0) } }));
      }
      paper.insertBefore(fogL, pins);
      box.append(paper, plan,
        h('ul', { class: 'legend' }, h('li', {}, h('span', { class: 'pin-you' }, '★'), ' You'), h('li', {}, h('span', { class: 'pin-new' }, '!'), ' Someone has something new to say'),
          h('li', {}, h('span', { class: 'pin-place' }, '•'), ' A place you have not used yet'), h('li', {}, h('span', { class: 'pin-waystone' }, '◆'), ' Waystone (save and rest)'), h('li', {}, h('span', { class: 'pin-portal' }, '⇲'), ' Way out'),
          h('li', {}, h('span', { class: 'pin-own' }, '▲'), ' Your mark')),
        h('p', { class: 'fine' }, `Explored: ${Math.round(r.explored * 100)}%. Walk around to clear the clouds. Press ${ctx.settings.keys.map} or Esc to fold the map.`));
    });
  }

  private emoteBar: HTMLElement | null = null;

  /** Emotes (spec 47.4): a small row of buttons; 1 to 6 or a click chooses. No game effect. */
  openEmotes(): void {
    if (!ctx.world || this.emoteBar) return;
    const bar = h('div', { class: 'emote-bar', role: 'toolbar', 'aria-label': 'Emotes' },
      ...EMOTES.map((e, i) => h('button', { type: 'button', onclick: () => { ctx.world?.emote(e.id); this.closeEmotes(); } }, h('kbd', {}, String(i + 1)), ` ${e.label}`)));
    this.emoteBar = bar;
    this.root.append(bar);
    (bar.querySelector('button') as HTMLButtonElement)?.focus();
  }

  private closeEmotes(): void { this.emoteBar?.remove(); this.emoteBar = null; }

  // ------------------------------------------------------------- title

  showTitle(): void {
    clear(this.root); this.root.append(this.toastBox);
    const c = ctx.controller;
    const cont = c.pair.continue, rec = c.pair.recovery;
    const fmt = (e: typeof cont) => e ? `${e.label} · ${e.location} · ${e.kind === 'suspend' ? 'Suspended' : 'Checkpoint'} · ${new Date(e.savedAt).toLocaleString()}` : '';
    const box = h('div', { class: 'title-screen' },
      h('div', { class: 'title-art', 'aria-hidden': 'true' }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '' })),
      h('h1', {}, 'Knowledge Guardians'),
      h('p', { class: 'subtitle' }, 'From Three Firsts to the Door Without a Name'),
      c.loadProblem ? h('p', { class: 'warn', role: 'alert' }, `Your save could not be opened: ${c.loadProblem} Your saved data has not been changed. You can still start a new game, but starting a new game will replace it.`) : null,
      c.loadWarning ? h('p', { class: 'warn', role: 'alert' }, c.loadWarning) : null,
      c.saves.permanentLoadProblem ? h('p', { class: 'warn', role: 'alert' }, c.saves.permanentLoadProblem) : null,
      c.contentProblems.length ? h('p', { class: 'warn', role: 'alert' }, `Content problems: ${c.contentProblems.join('; ')}`) : null,
      h('div', { class: 'menu' },
        cont ? h('button', { 'data-autofocus': true, onclick: () => { discardPendingJournalWriting(c); c.loadContinue(); this.startPlaying(true); } }, h('strong', {}, 'Continue'), h('small', {}, fmt(cont))) : null,
        rec ? h('button', { 'data-autofocus': !cont, onclick: () => this.confirmRecovery() }, h('strong', {}, 'Checkpoint recovery'), h('small', {}, fmt(rec))) : null,
        h('button', { 'data-autofocus': !cont && !rec, onclick: () => this.characterCreation() }, h('strong', {}, 'New game'), h('small', {}, cont || rec ? 'Starts a new campaign. Your awards stay.' : 'Begin as a new recruit')),
        h('button', { onclick: () => this.openSettings() }, h('strong', {}, 'Settings'), h('small', {}, 'Text size, motion, sound, guide prompts')),
        h('button', { onclick: () => this.openCredits() }, h('strong', {}, 'Credits and sources'), h('small', {}, 'Who made the art, music and sounds, and the historical sources')),
      ),
      h('p', { class: 'fine' }, 'Local demo: progress is saved in this browser only. No account. No AI service. Works offline after the first load.'),
    );
    this.root.append(box);
    setTimeout(() => box.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 0);
  }

  private confirmRecovery(): void {
    const c = ctx.controller;
    const rec = c.pair.recovery!;
    const box = this.openModal('confirm', 'Restore checkpoint recovery',
      this.closeBtn(),
      h('h2', {}, 'Restore checkpoint recovery?'),
      h('p', {}, `This makes "${rec.label}" (${rec.location}, ${new Date(rec.savedAt).toLocaleString()}) your current game. Your current Continue save will be replaced.`),
      h('p', {}, 'Awards, concept XP and badges you already earned are kept.'),
      h('div', { class: 'row' },
        h('button', { class: 'primary', 'data-autofocus': true, onclick: () => { if (c.loadRecovery()) { discardPendingJournalWriting(c); this.closeModal(); this.startPlaying(true); } } }, 'Restore'),
        h('button', { onclick: () => this.closeModal() }, 'Cancel')));
    void box;
  }

  private characterCreation(): void {
    clear(this.root); this.root.append(this.toastBox);
    const lookPick = this.lookPicker(PLAYER_LOOKS[0]);
    const name = h('input', { id: 'pname', maxlength: '24', value: '', placeholder: 'Your Guardian name', autocomplete: 'off', 'data-autofocus': true }) as HTMLInputElement;
    const pron = this.pronounPicker(PRONOUN_SETS[0].p);
    let origin: string | null = null;
    const originBox = h('div', { class: 'origins', role: 'radiogroup', 'aria-label': 'Origin' },
      ...ctx.controller.pack.origins.map((o) => {
        const b = h('button', { class: 'origin', role: 'radio', 'aria-checked': 'false', onclick: () => {
          origin = o.id; originBox.querySelectorAll('.origin').forEach((x) => x.setAttribute('aria-checked', 'false')); b.setAttribute('aria-checked', 'true');
        } }, h('strong', {}, o.name), h('small', {}, o.background), h('small', { class: 'link' }, o.link));
        return b;
      }));
    const start = () => {
      const n = name.value.trim() || 'Recruit';
      discardPendingJournalWriting(ctx.controller);
      ctx.controller.newGame(n.slice(0, 24), lookPick.value(), { pronouns: pron.value(), origin });
      this.startPlaying(false);
    };
    name.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.repeat) start(); });
    const box = h('div', { class: 'title-screen create' },
      h('h1', {}, 'A new Guardian'),
      h('p', {}, 'Every student is a Knowledge Guardian from the first day. Choose a name and how you look. You can play in any way you like.'),
      h('label', { for: 'pname' }, 'Name'), name,
      h('p', { class: 'label' }, 'Appearance (every option is open from the start; you can change it later in the menu)'), lookPick.el,
      h('p', { class: 'label' }, 'Voice (a short sound when you speak)'), this.voicePicker(),
      h('p', { class: 'label' }, 'Pronouns (characters use these; you can change them later in the menu)'), pron.el,
      h('p', { class: 'label' }, 'Origin (optional). It gives one Lens hint and one extra conversation option in each world. It gives no advantage.'), originBox,
      h('div', { class: 'row' }, h('button', { class: 'primary', onclick: start }, 'Begin'), h('button', { onclick: () => this.showTitle() }, 'Back')));
    this.root.append(box);
    setTimeout(() => name.focus(), 0);
  }

  /** Appearance choice (spec 35.1): four ready-made looks, or choose each colour and an accessory, with a live preview. */
  private lookPicker(current: string, dyes: string[] = []): { el: HTMLElement; value: () => string } {
    let choice: LookChoice = decodeLook(current);
    let presetId: string | null = PRESET_LOOKS[current] ? current : null;
    const preview = h('div', { class: 'look-preview', role: 'img' });
    const describe = () => `${LABELS[choice.skin]} skin, ${LABELS[choice.style ?? 'short']} ${LABELS[choice.hair]} hair${choice.style === 'covered' ? ` under a ${LABELS[choice.accent]} head scarf` : ''}, ${LABELS[choice.outfit]} outfit, ${LABELS[choice.trousers]} trousers${choice.accessory === 'none' ? '' : `, ${LABELS[choice.accent]} ${LABELS[choice.accessory]}`}${choice.glasses && choice.glasses !== 'none' ? `, ${LABELS[choice.glasses]}` : ''}${choice.aid && choice.aid !== 'none' ? `, ${LABELS[choice.aid]}` : ''}`;
    const sel = (label: string, k: 'style' | 'glasses' | 'aid' | 'accessory', list: readonly string[]) => h('div', { class: 'swatch-row' }, h('span', {}, label),
      h('select', { 'aria-label': label, onchange: (e: Event) => { (choice as any)[k] = (e.target as HTMLSelectElement).value; presetId = null; draw(); } },
        ...list.map((a) => h('option', { value: a, selected: (choice[k] ?? list[0]) === a }, LABELS[a] ?? a))));
    const draw = () => { clear(preview); preview.append(previewLook(presetId ?? encodeLook(choice), 4)); preview.setAttribute('aria-label', `Preview: ${describe()}`); };
    const swatches = (label: string, k: keyof LookChoice, table: Record<string, any>) => {
      const row = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': label });
      const paint = () => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === choice[k])));
      for (const id of Object.keys(table)) {
        if (table === OUTFIT && DYE_KEYS.includes(id) && !dyes.includes(id) && choice.outfit !== id) continue; // a dye shows once bought
        const col = Array.isArray(table[id]) ? table[id][0] : table[id];
        row.append(h('button', { type: 'button', class: 'swatch', role: 'radio', 'data-v': id, title: LABELS[id] ?? id, 'aria-label': `${label}: ${LABELS[id] ?? id}`,
          style: { background: `#${col}` }, onclick: () => { (choice as any)[k] = id; presetId = null; paint(); draw(); } }));
      }
      paint();
      return h('div', { class: 'swatch-row' }, h('span', {}, label), row);
    };
    const accSel = h('select', { 'aria-label': 'Accessory', onchange: (e: Event) => { choice.accessory = (e.target as HTMLSelectElement).value as any; presetId = null; draw(); } },
      ...ACCESSORIES.map((a) => h('option', { value: a, selected: choice.accessory === a }, LABELS[a]))) as HTMLSelectElement;
    const custom = h('div', { class: 'look-custom' },
      swatches('Skin', 'skin', SKIN), swatches('Hair', 'hair', HAIR), swatches('Outfit', 'outfit', OUTFIT), swatches('Trousers', 'trousers', TROUSERS),
      sel('Hair style', 'style', STYLES), sel('Glasses', 'glasses', GLASSES), sel('Mobility aid', 'aid', AIDS),
      h('div', { class: 'swatch-row' }, h('span', {}, 'Accessory'), accSel), swatches('Accessory and scarf colour', 'accent', ACCENT));
    const presets = h('div', { class: 'looks', role: 'radiogroup', 'aria-label': 'Ready-made looks' },
      ...PLAYER_LOOKS.map((id, i) => h('button', { type: 'button', class: 'look', role: 'radio', 'aria-checked': String(id === presetId), 'aria-label': `Ready-made look ${i + 1}`, onclick: (e: Event) => {
        presetId = id; choice = decodeLook(id);
        presets.querySelectorAll('.look').forEach((x) => x.setAttribute('aria-checked', String(x === e.currentTarget)));
        const fresh = this.lookPicker(id, dyes); el.replaceWith(fresh.el); api.value = () => fresh.value();
      } }, h('span', { class: 'sprite', style: { backgroundImage: `url(assets/art/generated/characters/${id}.png)` } }))));
    const el = h('div', { class: 'look-picker' }, presets, h('div', { class: 'look-body' }, preview, custom));
    draw();
    const api = { el, value: () => presetId ?? encodeLook(choice) };
    return api;
  }

  /** Voice choice (spec 35.1 voice barks): stored in Settings on this device. */
  private voicePicker(): HTMLElement {
    const st = ctx.settings;
    const sel = h('select', { 'aria-label': 'Your voice', onchange: (e: Event) => {
      st.playerVoice = (e.target as HTMLSelectElement).value; saveSettings(st);
      bark(PLAYER_VOICES.find((x) => x.id === st.playerVoice)?.v ?? null, Math.max(0.4, st.sfxVolume));
    } }, ...PLAYER_VOICES.map((v) => h('option', { value: v.id, selected: st.playerVoice === v.id }, v.label))) as HTMLSelectElement;
    return h('div', { class: 'row voice-pick' }, sel,
      h('button', { type: 'button', onclick: () => bark(PLAYER_VOICES.find((x) => x.id === sel.value)?.v ?? null, Math.max(0.4, st.sfxVolume)) }, '🔊 Listen'));
  }

  /** Pronoun choice (spec 35.1): three common sets, or the player's own words. */
  private pronounPicker(current: Pronouns): { el: HTMLElement; value: () => Pronouns } {
    const preset = PRONOUN_SETS.find((x) => x.p.subject === current.subject && x.p.object === current.object && x.p.possessive === current.possessive);
    let mode = preset?.id ?? 'own';
    const inp = (k: keyof Pronouns, label: string) => h('input', { maxlength: '16', 'aria-label': label, placeholder: label, value: preset ? '' : current[k] }) as HTMLInputElement;
    const own = { subject: inp('subject', 'they'), object: inp('object', 'them'), possessive: inp('possessive', 'their') };
    const ownRow = h('div', { class: 'row own-pronouns', style: { display: mode === 'own' ? '' : 'none' } }, own.subject, own.object, own.possessive);
    const radios = [...PRONOUN_SETS.map((x) => ({ id: x.id, label: x.label })), { id: 'own', label: 'my own words' }].map((x) =>
      h('label', { class: 'check' }, h('input', { type: 'radio', name: 'pronouns', value: x.id, checked: mode === x.id, onchange: () => { mode = x.id; ownRow.style.display = mode === 'own' ? '' : 'none'; } }), ` ${x.label}`));
    const el = h('div', { class: 'pronouns', role: 'radiogroup', 'aria-label': 'Pronouns' }, h('div', { class: 'row' }, ...radios), ownRow);
    const value = () => mode === 'own'
      ? cleanPronouns({ subject: own.subject.value, object: own.object.value, possessive: own.possessive.value })
      : PRONOUN_SETS.find((x) => x.id === mode)!.p;
    return { el, value };
  }

  /** Cloak embroidery (spec 32.6): one stitched thread for each world arc resolved. */
  private threadView(look: string): HTMLElement {
    const got = cloakThreads(ctx.controller.state.objectivesDone);
    return h('div', { class: 'threads row' }, h('span', { class: 'thread-preview' }, previewLook(look, 3, got.map((t) => t.colour))),
      got.length ? h('ul', {}, ...got.map((t) => h('li', {}, h('span', { class: 'swatch', style: { background: `#${t.colour}` }, 'aria-hidden': 'true' }), ` ${t.name}`)))
        : h('p', { class: 'fine' }, 'No threads yet. Your outfit gets an embroidered thread for each world story you resolve.'));
  }

  private crestSummary(): HTMLElement {
    const cr = decodeCrest(ctx.controller.state.flags['crest']);
    return h('div', { class: 'row' }, cr ? crestCanvas(cr, 30, 2) : h('span', { class: 'fine' }, 'No crest yet.'),
      cr ? h('em', {}, `“${MOTTOS[cr.motto]}”`) : '', h('button', { onclick: () => this.openCrest() }, cr ? 'Change my crest' : 'Design a crest'));
  }

  /** The crest designer (spec 47.4 heraldry). Every choice is from a list. The crest shows on the back of the cloak. */
  openCrest(): void {
    const c = ctx.controller;
    let cr: Crest = decodeCrest(c.state.flags['crest']) ?? { ...DEFAULT_CREST };
    const box = this.openModal('crest-panel wide', 'Crest');
    const pick = <K extends keyof Crest>(label: string, k: K, opts: [string, string][]) => h('label', { class: 'crest-pick' }, h('span', {}, label),
      h('select', { onchange: (e: Event) => { const v = (e.target as HTMLSelectElement).value; (cr as any)[k] = k === 'motto' ? Number(v) : v; render(); } },
        ...opts.map(([v, t]) => h('option', { value: v, selected: String(cr[k]) === v }, t))));
    const colours = Object.keys(FIELDS).map((k) => [k, k[0].toUpperCase() + k.slice(1)] as [string, string]);
    const render = () => {
      clear(box);
      const preview = h('div', { class: 'crest-preview', role: 'img', 'aria-label': `Crest: a ${cr.shape} shield, ${cr.division === 'plain' ? cr.a : `${cr.a} and ${cr.b}, divided ${cr.division}`}, with a ${cr.ink} ${CHARGES[cr.charge].name}. Motto: ${MOTTOS[cr.motto]}` },
        crestCanvas(cr, 30, 6), h('p', { class: 'motto' }, MOTTOS[cr.motto]));
      box.append(this.closeBtn(), h('h2', {}, 'Your crest'),
        h('p', {}, 'Design a crest for your Guardian. It is stitched on the back of your cloak and stamped on your photos. Every choice comes from a list, so it is always kind.'),
        h('div', { class: 'crest-body' }, preview, h('div', { class: 'crest-picks' },
          pick('Shape', 'shape', SHAPES.map((x) => [x, { heater: 'Heater shield', round: 'Round shield', banner: 'Banner', kite: 'Kite shield' }[x]] as [string, string])),
          pick('Division', 'division', DIVISIONS.map((x) => [x, { plain: 'Plain', pale: 'Split down the middle', fess: 'Split across', quarterly: 'Quarters', chevron: 'Chevron', bend: 'Diagonal band' }[x]] as [string, string])),
          pick('First colour', 'a', colours), pick('Second colour', 'b', colours),
          pick('Symbol', 'charge', Object.entries(CHARGES).map(([k, v]) => [k, v.name[0].toUpperCase() + v.name.slice(1)] as [string, string])),
          pick('Symbol colour', 'ink', colours),
          pick('Motto', 'motto', MOTTOS.map((m, i) => [String(i), m] as [string, string])))),
        h('div', { class: 'row' },
          h('button', { class: 'primary', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'crest', value: encodeCrest(cr) }); this.sfx('sfx.sparkle'); this.toast('Crest saved. It is on your cloak now.', 'save'); this.closeModal(); ctx.world?.refreshWorld(); } }, 'Save crest'),
          h('button', { onclick: () => { cr = { ...DEFAULT_CREST, a: Object.keys(FIELDS)[Math.floor(Math.random() * 10)], charge: Object.keys(CHARGES)[Math.floor(Math.random() * 10)], motto: Math.floor(Math.random() * MOTTOS.length) }; render(); } }, 'Surprise me'),
          h('button', { onclick: () => this.closeModal() }, 'Cancel')));
    };
    render();
  }

  /** My Guardian: change pronouns at any time; see the origin. */
  private openGuardian(): void {
    const c = ctx.controller;
    const pl = c.state.player;
    const pron = this.pronounPicker(pl.pronouns);
    const lookPick = this.lookPicker(pl.look, DYE_KEYS.filter((k) => ownsDye(c.state.flags, k)));
    const o = c.pack.origins.find((x) => x.id === pl.origin);
    this.openModal('guardian wide', 'My Guardian', this.closeBtn(), h('h2', {}, pl.name),
      h('p', { class: 'label' }, 'Appearance'), lookPick.el,
      h('p', { class: 'label' }, 'Cloak threads'), this.threadView(pl.look),
      h('p', { class: 'label' }, 'Crest'), this.crestSummary(),
      h('p', { class: 'label' }, 'Lumen'), this.lumenPicker(),
      h('p', { class: 'label' }, 'Voice'), this.voicePicker(),
      h('p', { class: 'label' }, 'Pronouns'), pron.el,
      h('p', { class: 'label' }, 'Origin'),
      o ? h('p', {}, h('strong', {}, o.name), `. ${o.background} ${o.link}`) : h('p', { class: 'fine' }, 'No origin. (This game started before origins existed, or you chose none.)'),
      h('div', { class: 'row' },
        h('button', { class: 'primary', onclick: () => {
          c.dispatch({ type: 'SetPronouns', pronouns: pron.value() });
          const look = lookPick.value();
          const changed = look !== c.state.player.look;
          if (changed) c.dispatch({ type: 'SetLook', look });
          this.toast('Saved.', 'save'); this.closeModal();
          if (changed) ctx.world?.applySettings();
        } }, 'Save'),
        h('button', { onclick: () => this.closeModal() }, 'Cancel')));
  }

  private startPlaying(returning: boolean): void {
    const pc = ctx.controller;
    this.stopStoryCue?.(); this.stopStoryCue = null;
    this.fullRings = new Set(conceptRings(pc.permanent, pc.pack).filter((r) => r.got >= r.max).map((r) => r.concept));
    clear(this.root); this.root.append(this.toastBox);
    this.buildHud();
    this.seenObjectives = new Set(ctx.controller.engine.visibleObjectives(ctx.controller.state).map((o) => o.id));
    this.activeEvent = null;
    this.activeEventNode = null;
    this.onStart();
    if (returning) {
      this.showRecap();
      const pending = pc.state.events.pending;
      if (pending) {
        const event = pc.pack.events.find(({ id }) => id === pending);
        if (event?.maps.includes(pc.state.mapId) && !pc.state.events.seen.includes(pending)) {
          this.whenFree(() => this.showEvent(pending));
        } else {
          pc.dispatch({ type: 'DelayEvent' });
        }
      }
    } else if (!ctx.controller.state.flags['seen.coldopen']) {
      setTimeout(() => this.playScene('cold.open'), ctx.settings.reducedMotion ? 50 : 700);
    }
  }

  playScene(node: string): void { this.whenFree(() => this.showNode(node)); }

  private showRecap(): void {
    const r = ctx.controller.recap();
    this.openModal('recap', 'Recap', h('h2', {}, r.title), h('ul', {}, ...r.lines.map((l) => h('li', {}, l))),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Continue playing')));
  }

  // --------------------------------------------------------------- HUD

  private buildHud(): void {
    this.hud = h('div', { class: 'hud' });
    this.promptEl = h('button', { class: 'prompt', hidden: true, onclick: () => (ctx.world as any)?.tryInteract?.() });
    this.lumenBubble = h('div', { class: 'lumen-bubble', hidden: true, role: 'status', 'aria-live': 'polite' });
    this.hudDock = h('div', { class: 'hud-dock' }, this.lumenBubble, this.promptEl);
    this.hud.append(this.hudDock);
    this.root.append(this.hud);
    this.refreshHud();
  }

  refreshHud(): void {
    if (!this.hud) return;
    const c = ctx.controller, s = c.state;
    if (!s) return;
    const objs = c.engine.visibleObjectives(s);
    const missions = [...new Set(objs.map((o) => o.mission))];
    const tracker = h('section', { class: 'tracker', 'aria-label': 'Objectives', tabindex: 0 },
      ...missions.filter((m) => objs.some((o) => o.mission === m && !o.complete)).slice(-1).map((m) => h('div', {},
        h('h2', {}, m.title),
        h('p', { class: 'kq' }, m.knowledgeQuestion),
        ...(m.stake ? [h('p', { class: 'stake' }, h('strong', {}, 'At stake: '), m.stake)] : []),
        h('ul', {}, ...objs.filter((o) => o.mission === m).map((o) => h('li', { class: o.complete ? 'done' : '' }, h('span', { 'aria-hidden': 'true' }, o.complete ? '✓ ' : '◇ '), h('span', { class: 'sr' }, o.complete ? 'Done: ' : 'To do: '), o.title))))),
      objs.length && objs.every((o) => o.complete) ? h('div', {}, h('h2', {}, 'Chapter complete'), h('p', {}, 'Explore freely, or open the menu.')) : null);
    const km = ctx.settings.keys;
    const bar = h('nav', { class: 'hud-buttons', 'aria-label': 'Game menu' },
      h('span', { class: 'marks', title: 'Marks (campaign money)' }, h('img', { src: artURL('icon.card'), alt: '' }), ` ${s.marks} marks`),
      s.flags['title.worn'] ? h('span', { class: 'marks worn-title', title: 'Your title (choose in Journal, Awards)' }, `${s.player.name}, ${s.flags['title.worn']}`) : '',
      h('button', { onclick: () => this.askLumen(), title: `Ask Lumen for a hint (${km.hint})` }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '' }), ' Hint ', h('kbd', {}, km.hint)),
      h('button', { onclick: () => this.openJournal(), title: `Journal (${km.journal})` }, 'Journal ', h('kbd', {}, km.journal)),
      h('button', { onclick: () => this.openJournal('portfolio'), title: `Portfolio (${km.portfolio})` }, 'Portfolio ', h('kbd', {}, km.portfolio)),
      h('button', { onclick: () => this.openBag(), title: `Bag (${km.bag})` }, 'Bag ', h('kbd', {}, km.bag)),
      h('button', { onclick: () => this.openMenu(), title: 'Menu (Esc)' }, 'Menu ', h('kbd', {}, 'Esc')));
    this.compassEl ??= h('button', { class: 'compass', type: 'button', onclick: () => this.openMap(), 'aria-label': 'Compass. Click for the map.' },
      h('span', { class: 'rose', 'aria-hidden': 'true' }, 'N'), h('span', { class: 'needle idle', 'aria-hidden': 'true' }));
    bar.append(this.compassEl);
    this.hud.querySelector('.tracker')?.remove();
    this.hud.prepend(tracker);
    this.hudDock.querySelector('.hud-buttons')?.remove();
    this.hudDock.append(bar);
    // New objectives: Lumen mentions them once if the player allows prompts (GUIDE-001).
    for (const o of objs) {
      if (!this.seenObjectives.has(o.id)) {
        this.seenObjectives.add(o.id);
        if (!o.complete && ctx.settings.guidePrompts) this.lumenSay(`New step: ${o.title}`);
      }
    }
  }

  private lumenSay(text: string): void {
    clear(this.lumenBubble);
    this.lumenBubble.append(h('img', { src: artURL(lumenArt(ctx.settings)), alt: '' }), h('span', {}, h('strong', {}, 'Lumen: '), text),
      h('button', { class: 'mini', 'aria-label': 'Hide message', onclick: () => { this.lumenBubble.hidden = true; } }, '✕'));
    this.lumenBubble.hidden = false;
    clearTimeout((this.lumenBubble as any)._t);
    (this.lumenBubble as any)._t = setTimeout(() => { this.lumenBubble.hidden = true; }, 7000);
  }

  private askLumen(): void {
    const c = ctx.controller;
    const cur = c.engine.currentObjective(c.state);
    if (!cur) { this.lumenSay('Nothing urgent. Explore, read your journal, or talk to people again.'); return; }
    const ev = c.dispatch({ type: 'RequestHint', objective: cur.id });
    const hint = ev.find((e) => e.kind === 'hint') as Extract<GameEvent, { kind: 'hint' }> | undefined;
    ctx.world?.lumenBurst();
    this.sfx('sfx.sparkle');
    if (!hint) return;
    const box = this.openModal('hint', 'Lumen hint', this.closeBtn(),
      h('div', { class: 'lumen-head' }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '', class: 'lumen-big' }), h('h2', {}, 'Lumen')),
      h('p', { class: 'hint-depth' }, `Hint ${hint.hint.depth} of 4 · ${cur.title}`),
      h('p', { class: 'hint-text' }, hint.hint.text),
      ...(roleOf(c.state.flags) ? [h('p', { class: 'fine' }, h('strong', {}, `As a ${roleOf(c.state.flags)!.name}, ask: `), roleOf(c.state.flags)!.ask, ' ', h('em', {}, `Watch your blind spot: ${roleOf(c.state.flags)!.blind}`))] : []),
      h('p', { class: 'fine' }, 'Asking for help never lowers your XP or blocks an award.'),
      h('div', { class: 'row' },
        hint.hint.depth < 4 ? h('button', { onclick: () => this.askLumen() }, 'More help') : null,
        h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Thanks')));
    void box;
  }

  // ------------------------------------------------------------ events

  private handleEvents(events: GameEvent[]): void {
    // One XP toast per action, not one per criterion.
    const xp = events.filter((e) => e.kind === 'xp').reduce((n, e) => n + (e as Extract<GameEvent, { kind: 'xp' }>).amount, 0);
    if (xp) events = [...events.filter((e) => e.kind !== 'xp'), { kind: 'xp', amount: xp }];
    const c = ctx.controller;
    // An old save can earn many keepsakes or lamps at once: one summary toast, not a flood.
    for (const kind of ['keepsake', 'lamp'] as const) {
      const many = events.filter((e) => e.kind === kind);
      if (many.length <= 2) continue;
      events = events.filter((e) => e.kind !== kind);
      this.toast(kind === 'keepsake' ? `${many.length} new keepsakes. See My quarters.` : `${many.length} lamps are lit on the Lamp Wall.`, 'award');
    }
    for (const e of events) {
      switch (e.kind) {
        case 'card': { const card = c.pack.cards.find((x) => x.id === e.id); this.toast(`New evidence card: ${card?.title}`, 'card'); this.sfx('sfx.page'); break; }
        case 'item': { const it = c.pack.items.find((x) => x.id === e.id); this.toast(`${e.qty > 0 ? 'Received' : 'Gave'}: ${it?.name ?? e.id}`, 'item'); this.sfx('sfx.pickup'); break; }
        case 'stone': {
          const q = c.pack.questions.find((x) => x.id === e.question);
          if (q && !q.journalOnly) this.toast(`Lumen's last word: ${q.lastWord}${e.newWay ? ` (Question Stone: ${Math.min(e.ways, 5)} of 5 ways)` : ''}`, 'info');
          break;
        }
        case 'marks': this.toast(`${e.delta > 0 ? '+' : ''}${e.delta} marks`, 'item'); this.sfx('sfx.coins'); break;
        case 'objective':
          this.toast(`Step complete: ${e.title}`, 'objective'); this.sfx('sfx.complete');
          if (e.id === 'm02.o8.ise') this.pendingChapterEnd = true;
          break;
        case 'award': this.toast(`${e.award.kind === 'badge' ? 'Badge' : e.award.kind === 'skill-milestone' ? 'Skill milestone' : 'Concept award'}: ${e.award.name}. ${e.award.earnedBy}`, 'award'); this.sfx('sfx.award'); ctx.world?.lumenBurst(); break;
        case 'xp': {
          this.toast(`+${e.amount} concept XP (permanent)`, 'xp');
          // A ring closes: a small celebration, once per concept per session.
          for (const r of conceptRings(c.permanent, c.pack)) if (r.got >= r.max && !this.fullRings.has(r.concept)) {
            this.fullRings.add(r.concept);
            this.toast(`The ${CONCEPT_NAMES[r.concept]} ring is complete!`, 'award'); this.sfx('sfx.award');
          }
          break;
        }
        case 'checkpoint': this.toast(`Checkpoint saved: ${e.label}`, 'save'); break;
        case 'error': {
          if (this.saveFeedback) {
            this.saveFeedback.textContent = e.message;
            break;
          }
          const box = this.modal?.querySelector<HTMLElement>('.bench-panel, .exhibit');
          if (box) workFeedback(box, e.message);
          else this.toast(e.message, 'error');
          break;
        }
        case 'moment': this.toast(`Learner profile moment: ${PROFILE_NAMES[e.moment.attribute]}. ${e.moment.did}`, 'moment'); break;
        case 'portfolio': this.toast(`Added to your portfolio: ${e.title}`, 'info'); break;
        case 'fray': this.toast(`New in your Fray Bestiary: ${e.name} (${e.error.toLowerCase()}). See Journal, Fray Bestiary.`, 'info'); break;
        case 'reflection': { const m = e.misconception; this.whenFree(() => this.offerReflection(m.title, m.reflection)); break; }
        case 'event-due': { const id = e.event; this.whenFree(() => this.showEvent(id)); break; }
        case 'trust': this.toast(`Trust grows. ${e.name}: you are now ${e.rank}. See Menu, Communities of Emberford.`, 'award'); this.sfx('sfx.award'); break;
        case 'approval': {
          const nm = (ctx.controller.pack.characters.find((x) => x.id === e.who)?.name ?? 'Your companion').split(' ')[0];
          this.toast(e.up ? `${nm}: ${e.rank}. Good questions count, never agreement.` : `${nm} liked that question.`, e.up ? 'award' : 'info');
          if (e.up) this.sfx('sfx.award');
          break;
        }
        case 'secret': this.toast(`Secret found: ${e.name} (${e.found} of ${e.total}). See Journal, Lore.`, 'award'); this.sfx('sfx.sparkle'); ctx.world?.lumenBurst(); break;
        case 'keepsake': this.toast(`New keepsake: ${e.name}. ${e.use}`, 'item'); this.sfx('sfx.sparkle'); break;
        case 'lamp': this.toast(`A lamp is lit on the Lamp Wall: ${e.name} (${e.count} of ${e.total}). ${e.lit}`, 'award'); this.sfx('sfx.award'); ctx.world?.lumenBurst(); break;
        default: break;
      }
    }
    // Vesper Quill's letters (docs/STORY_BIBLE.md section 6): one after each chapter, at most one per action.
    const letter = c.state ? dueLetters(c.state)[0] : undefined;
    if (letter) {
      c.dispatch({ type: 'SetFlag', flag: `letter.${letter.id}`, value: true });
      this.toast('A letter with a small gold seal has arrived. See Journal, Letters.', 'award'); this.sfx('sfx.page');
    }
    this.deliverCommunityLetters(true);
    this.refreshHud();
    ctx.world?.refreshWorld();
  }

  private deliverCommunityLetters(announce: boolean): void {
    const c = ctx.controller;
    const due = dueCommunityLetters(c.state);
    for (const letter of due) c.dispatch({ type: 'SetFlag', flag: communityLetterFlag(letter.id), value: letter.outcome });
    if (announce && due.length) {
      this.toast(due.length === 1 ? 'A traveller left you a letter. See Journal, Letters.' : 'Travellers left you letters. See Journal, Letters.', 'info');
      this.sfx('sfx.page');
    }
  }

  // ------------------------------------------------- events and reflection

  /** An event from the deck (spec 93). Calm mode warns first and lets the player delay it. */
  private showEvent(id: string): void {
    const c = ctx.controller;
    const ev = c.pack.events.find((x) => x.id === id);
    if (!this.hud?.isConnected || !ev || c.state.events.pending !== id) return;
    const play = () => {
      this.closeModal(false);
      this.activeEvent = id;
      const saved = c.state.flags[`event.resume.${id}`];
      const resume = typeof saved === 'string' && c.state.flags[`node.${saved}`] === true
        && c.pack.dialogue.some(({ id }) => id === saved);
      this.showNode(resume ? saved : ev.node, !resume);
    };
    if (!ctx.settings.calmMode && !ctx.settings.zenMode) { play(); return; }
    this.openModal('event', ev.title,
      h('h2', {}, ev.title), h('p', {}, ev.calm),
      h('p', { class: 'fine' }, 'Nothing here is timed, and waiting costs you nothing.'),
      h('div', { class: 'row' },
        h('button', { class: 'primary', 'data-autofocus': true, onclick: play }, 'Now'),
        h('button', { onclick: () => this.closeModal() }, 'Later')));
  }

  /** A reflection offer at the student threshold (spec 95.1). Never "wrong", always optional. */
  private offerReflection(title: string, question: string): void {
    const ta = h('textarea', { rows: '3', 'aria-label': 'Your reflection (optional)', placeholder: 'Write a few words, or leave it empty.' }) as HTMLTextAreaElement;
    this.openModal('reflection', 'A question to think about', this.closeBtn(),
      h('div', { class: 'lumen-head' }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '', class: 'lumen-big' }), h('h2', {}, 'A question to think about')),
      h('p', { class: 'fine' }, `Lumen noticed a pattern in your play: ${title.toLowerCase()}. This is not a mark. It may even be wrong.`),
      h('p', { class: 'hint-text' }, question), ta,
      h('div', { class: 'row' },
        h('button', { class: 'primary', onclick: () => {
          if (ta.value.length) {
            const c = ctx.controller;
            if (c.dispatch({ type: 'AddNote', text: ta.value, kind: 'reflection' }).some(({ kind }) => kind === 'error')) return;
            queueJournalWriting(c);
            flushJournalWriting(c);
          }
          this.closeModal();
        } }, 'Keep it in my journal'),
        h('button', { onclick: () => this.closeModal() }, 'Not now')));
  }

  /** Close a conversation, then open the tool it names and finish an event. */
  private endDialogue(open?: string): void {
    this.closeModal(false);
    if (this.activeEvent) {
      const id = this.activeEvent;
      this.activeEvent = null;
      this.activeEventNode = null;
      ctx.controller.dispatch({ type: 'ResolveEvent', event: id });
    }
    if (!open) return;
    const [kind, id] = open.split(':');
    if (kind === 'showdown') this.openShowdown(id);
    else if (kind === 'label') this.openLabel(id);
    else if (kind === 'forge') this.openForge();
    else if (kind === 'assay') this.openAssay('AE-ASSAY');
    else if (kind === 'lock') this.openLock(id);
  }

  // ---------------------------------------------------------- dialogue

  openDialogue(characterId: string): void {
    const c = ctx.controller;
    const node = c.engine.talkEntry(characterId, c.state);
    if (!node) return;
    this.sfx('sfx.open');
    this.showNode(node);
  }

  private showNode(id: string, enter = true): void {
    const c = ctx.controller;
    const firstHearing = enter && c.state.flags[`node.${id}`] !== true;
    if (enter) {
      const events = c.dispatch({ type: 'EnterNode', node: id });
      if (events.some((event) => event.kind === 'error')) { this.closeModal(); return; }
    }
    if (this.activeEvent) this.activeEventNode = id;
    const raw: DialogueNode = c.engine.node(id);
    const n: DialogueNode = { ...raw, text: personalise(raw.text, c.state.player) };
    const speaker = n.speaker === 'lumen' ? { name: 'Lumen', role: 'Fairy guide', sprite: '' }
      : n.speaker === 'narrator' ? { name: '', role: '', sprite: '' } : c.pack.characters.find((x) => x.id === n.speaker);
    const portrait = n.speaker === 'lumen'
      ? h('img', { class: 'portrait lumen-portrait', src: artURL(lumenArt(ctx.settings)), alt: '' })
      : n.speaker === 'narrator' ? null
      : String((speaker as any)?.sprite ?? '').startsWith('custom:')
        ? h('span', { class: 'portrait custom', 'aria-hidden': 'true' }, previewLook((speaker as any).sprite, 3))
        : h('span', { class: 'portrait', style: { backgroundImage: `url(assets/art/generated/characters/${(speaker as any)?.sprite}.png)` }, 'aria-hidden': 'true' });
    const opts = c.engine.visibleOptions(id, c.state);
    const optionList = h('div', { class: 'options' });
    if (opts.length) {
      opts.forEach((o, i) => optionList.append(h('button', { 'data-autofocus': i === 0, onclick: () => {
        if (ctx.settings.talkSounds) bark(PLAYER_VOICES.find((x) => x.id === ctx.settings.playerVoice)?.v ?? null, ctx.settings.sfxVolume); else this.sfx('sfx.click');
        const r = c.dispatch({ type: 'ChooseDialogueOption', node: id, index: o.index }) as any;
        if (r.some((e: GameEvent) => e.kind === 'error')) return;
        // A choice can change map props without emitting feedback events.
        if (r.length === 0) ctx.world?.refreshWorld();
        const next = r.nextNode as string | null;
        if (next) this.showNode(next); else this.endDialogue(o.option.open);
      } }, h('span', { class: 'num', 'aria-hidden': 'true' }, `${i + 1}`), o.option.tag ? h('em', {}, `${o.option.tag}: `) : null, personalise(o.option.text, c.state.player),
        fitsRole(roleOf(c.state.flags), o.option.tag) ? h('span', { class: 'role-mark', title: 'This fits your knower role' }, ` ◆ ${roleOf(c.state.flags)!.name}`) : null)));
    } else {
      optionList.append(h('button', { 'data-autofocus': true, onclick: () => { this.sfx('sfx.click'); if (n.next) this.showNode(n.next); else this.endDialogue(n.open); } }, n.next ? 'Continue ▸' : 'Close'));
    }
    const cornerObjective = id.startsWith('corner.') && c.state.flags['corner.found'] && !c.state.objectivesDone.includes('corner.receive')
      ? c.state.objectivesDone.includes('corner.compare') ? 'corner.receive' : 'corner.compare'
      : undefined;
    const guidedCase = ['sea.threadbend.', 'ember.circle.'].find((prefix) => id.startsWith(prefix));
    const guideObjective = guidedCase
      ? c.engine.visibleObjectives(c.state).find((step) => !step.complete && step.id.startsWith(guidedCase))?.id
      : id === 'stage.call.stand' ? 'stage.call.audience' : cornerObjective;
    const extra = id === 'sefa.free' ? this.freeQuestion() : null;
    const earlier = conversationHistory(c.pack.dialogue, c.state.flags).filter((line) => line.id !== id).slice(0, 5);
    const source = n.citationSource ? c.pack.sources.find((entry) => entry.id === n.citationSource) : undefined;
    const citation = source ? mlaCitation(source) : [];
    const spoken = `${speaker?.name ? `${speaker.name}: ` : ''}${n.text}${citation.length ? ` ${citation.map((part) => part.text).join('')}` : ''}`;
    const encyclopedia = speaker && 'mode' in speaker ? encyclopediaForCharacter(speaker) : undefined;
    this.openModal('dialogue', speaker?.name ? `Conversation with ${speaker.name}` : 'Scene',
      speaker?.name ? h('div', { class: 'speaker' }, portrait, h('div', {}, h('strong', {}, speaker.name), h('small', {}, speaker.role ?? ''))) : '',
      this.glossLine(n.text),
      encyclopedia ? h('p', { class: 'fine' }, wikipediaLink(encyclopedia)) : '',
      citation.length ? h('p', { class: 'citation-line' }, ...citation.map((part) => part.cite ? h('cite', {}, part.text)
        : part.href ? h('a', { href: part.href, target: '_blank', rel: 'noopener' }, part.text) : part.text)) : '',
      'speechSynthesis' in window ? h('button', { class: 'mini speak', type: 'button', 'aria-label': 'Read this line aloud', onclick: () => this.speak(spoken) }, '🔊 Read aloud') : '',
      h('div', { class: 'chips' }, n.claimKind ? claimChip(n.claimKind) : null, n.historicalLabel ? histChip(n.historicalLabel) : null),
      extra ?? '', optionList,
      guideObjective ? localGuide(c, MAPS[c.state.mapId]?.world ?? '', guideObjective) : '',
      earlier.length ? h('details', { class: 'dialogue-recall' }, h('summary', {}, 'Earlier dialogue'),
        ...earlier.map((line) => this.dialogueMemory(line))) : '');
    if (n.motif && firstHearing) this.playStoryCue(n.motif);
    if (!ctx.settings.readAloud && ctx.settings.talkSounds && n.speaker !== 'narrator') babble(n.text, voiceFor(n.speaker), ctx.settings.sfxVolume);
    if (ctx.settings.readAloud) this.speak(`${spoken}${citation.length ? '' : '.'} ${opts.map((o, i) => `Option ${i + 1}: ${o.option.text}`).join('. ')}`);
  }

  private playStoryCue(motif: StoryMotif): void {
    this.stopStoryCue?.();
    const { notes, beat, voice } = storyMotif(motif);
    this.stopStoryCue = playNotes(notes, beat, voice, ctx.settings.musicVolume * 0.85);
    caption(storyMotifKey(motif));
  }

  private dialogueMemory(node: DialogueNode, includeMotif = false): HTMLElement {
    const c = ctx.controller;
    const name = node.speaker === 'lumen' ? 'Lumen' : node.speaker === 'player' ? c.state.player.name
      : c.pack.characters.find((character) => character.id === node.speaker)?.name;
    const text = personalise(node.text, c.state.player);
    const motif = node.motif;
    return h('div', { class: 'lore-entry' }, name ? h('strong', {}, name) : '', h('p', {}, text),
      includeMotif && motif ? h('button', { type: 'button', class: 'mini', onclick: () => this.playStoryCue(motif) }, 'Replay the scene’s music') : '');
  }

  /** Text-to-speech with the browser's own voice (spec 21). */
  speak(text: string): void {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      u.rate = 0.95;
      synth.speak(u);
    } catch { /* no speech support */ }
  }

  /** Dialogue text with tappable glossary words (spec 47.10). */
  private glossLine(text: string): HTMLElement {
    const c = ctx.controller;
    if (!ctx.settings.glossary) return h('p', { class: 'line' }, text);
    const pop = h('div', { class: 'gloss-pop', role: 'note', 'aria-live': 'polite', style: { display: 'none' } });
    const line = h('p', { class: 'line' }, ...segmentText(text, c.pack.glossary).map((sg) => sg.term
      ? h('button', { type: 'button', class: 'gloss', 'aria-label': `${sg.text}: explain this word`, onclick: () => this.fillGloss(sg.term!, pop) }, sg.text)
      : sg.text));
    return h('div', {}, line, pop);
  }

  private wordHistory(entry: GlossaryEntry): HTMLElement | null {
    if (!entry.history) return null;
    return h('details', { class: 'fine' }, h('summary', {}, 'Word history'),
      h('p', {}, entry.history.note, ' ', h('a', { href: entry.history.url, target: '_blank', rel: 'noopener' }, 'Dictionary entry')));
  }

  private glossaryExamples(entry: GlossaryEntry): HTMLElement | null {
    const c = ctx.controller;
    const [first, ...others] = examplesFor(entry, c.state, (condition) => c.check(condition));
    if (!first) return null;
    return h('div', { class: 'fine' }, h('p', {}, first),
      others.length ? h('details', {}, h('summary', {}, 'Other moments from my journey'),
        h('ul', {}, ...others.map((text) => h('li', {}, text)))) : null);
  }

  private fillGloss(id: string, pop: HTMLElement): void {
    const c = ctx.controller;
    const g = c.pack.glossary.find((x) => x.id === id);
    if (!g) return;
    clear(pop);
    pop.append(h('img', { src: artURL(lumenArt(ctx.settings)), alt: '', class: 'gloss-lumen' }),
      h('div', {}, h('strong', {}, g.term), ' ', g.text, this.glossaryExamples(g), this.wordHistory(g)));
    pop.style.display = '';
  }

  /**
   * Free question to Sefa. Keyword search over prepared topics only.
   * Unsupported questions get an honest fallback (spec 22.3, 27.1).
   */
  private freeQuestion(): HTMLElement {
    const input = h('input', { type: 'text', placeholder: 'Type a question…', 'aria-label': 'Your question', 'data-autofocus': true }) as HTMLInputElement;
    const out = h('div', { class: 'free-out', role: 'status', 'aria-live': 'polite' });
    const topics: [RegExp, string][] = [
      [/wootz|crucible|ingot/i, 'sefa.wootz'],
      [/example|museum|met\b|record|probabl/i, 'sefa.example'],
    ];
    const ask = () => {
      const q = input.value;
      if (!q.trim()) return;
      const hit = topics.find(([re]) => re.test(q));
      clear(out);
      if (hit) { this.showNode(hit[1]); return; }
      out.append(h('p', {}, 'Sefa: "I have no prepared answer for that. Choose one of my topics, or keep the question in your journal."'),
        h('button', { onclick: () => {
          const c = ctx.controller;
          if (c.dispatch({ type: 'AddNote', kind: 'question', text: `Question for Sefa: ${q}` }).some(({ kind }) => kind === 'error')) return;
          queueJournalWriting(c);
          if (flushJournalWriting(c)) this.toast('Saved to your journal notes', 'info');
          input.value = '';
          clear(out);
        } }, 'Keep it in my journal'));
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) ask(); });
    return h('div', { class: 'free' }, h('p', { class: 'fine' }, 'Sefa can answer prepared topics: wootz, crucible steel, ingots and the museum example. Other questions are kept in your journal. Nothing you type is sent anywhere.'),
      h('div', { class: 'row' }, input, h('button', { onclick: ask }, 'Ask')), out);
  }

  // ----------------------------------------------------------- exhibit

  openExhibit(exhibitId: string): void {
    const c = ctx.controller;
    const ex = c.pack.exhibits.find((x) => x.id === exhibitId)!;
    c.dispatch({ type: 'InspectExhibit', exhibit: exhibitId });
    this.sfx('sfx.book');
    const lensOut = h('div', { class: 'lens-out', role: 'status', 'aria-live': 'polite' });
    const showLens = () => { clear(lensOut); lensOut.append(h('p', {}, h('strong', {}, 'Date-Kind Lens: '), ex.dateKind)); };
    if (c.state.flags[`lens.${exhibitId}`]) showLens();
    const hasLens = !!c.state.inventory['tool.date-lens'];
    const card = c.pack.cards.find((x) => x.id === ex.grantsCard)!;
    const encyclopedia = encyclopediaForExhibit(ex);
    const thread = c.state.inventory['tool.provenance-thread'] ? c.pack.threads.find((t) => t.object === exhibitId) : undefined;
    const pixel = ex.specimen?.pixelAsset;
    const image = h('img', { class: 'big-art', src: artURL(BIG_ART[ex.art] ?? (ex.specimen ? ex.art : 'big.patent')), alt: pixel ? '' : ex.altText });
    const artCredit = h('figcaption', {}, pixel ? `Collection image from ${ex.specimen!.institution}.` : 'Original game illustration based on the written record.');
    const claim = h('div', { class: 'row', 'aria-live': 'polite' });
    const stand = h('div', { class: 'specimen-return-reading' });
    if (hasSpecimen(ex)) {
      const showClaim = () => {
        const key = ex.specimen.key;
        if (ownsSpecimen(c.state, key)) {
          claim.replaceChildren(h('p', { class: 'fine' }, carriesSpecimen(c.state, key) ? 'In your satchel.' : 'On display at the Nexus.'));
        } else if (canClaimSpecimen(c.state, ex)) {
          claim.replaceChildren(h('button', { type: 'button', class: 'primary', onclick: () => {
            if (c.dispatch({ type: 'ClaimSpecimen', exhibit: ex.id }).some(({ kind }) => kind === 'error')) return;
            ctx.world?.refreshWorld();
            showClaim();
            claim.tabIndex = -1;
            claim.focus();
          } }, 'Take this object'));
        }
      };
      showClaim();
      const key = ex.specimen.key;
      const reading = h('p', { class: 'fine', role: 'status' });
      const read = () => {
        const kind = c.state.flags[specimenReadingFlag(key)];
        if (kind === 'use') reading.textContent = `The stand leads with what a visitor can check. ${card.text}`;
        else if (kind === 'source') reading.textContent = `The stand keeps the collection number and the open question together. ${card.limits}`;
      };
      if (c.check(specimenEquipped(key))) {
        const mount = (kind: 'use' | 'source', text: string) => h('button', { type: 'button', onclick: () => {
          c.dispatch({ type: 'SetSpecimenReading', exhibit: ex.id, reading: kind });
          ctx.world?.refreshWorld();
          read();
        } }, text);
        stand.append(h('h3', {}, 'Leave a reading at this stand'),
          h('div', { class: 'row' }, mount('use', 'Put the observation first'), mount('source', 'Keep its source and limits together')));
      }
      stand.append(reading);
      read();
    }
    if (pixel) void specimenArt(pixel).then((drawing) => {
      if (!image.isConnected) return;
      if (drawing) {
        image.src = drawing.toDataURL('image/png');
        image.alt = ex.altText;
        artCredit.textContent = `Pixel illustration from a collection image at ${ex.specimen!.institution}.`;
      } else {
        artCredit.textContent = 'Collection image unavailable. The catalogue record is linked below.';
      }
    });
    const box = this.openModal('exhibit', ex.name, this.closeBtn(),
      h('div', { class: 'exhibit-grid' },
        h('figure', {}, image, artCredit),
        h('div', {},
          h('h2', {}, ex.name),
          h('div', { class: 'chips' }, histChip(ex.historicalLabel)),
          h('p', { class: 'date' }, h('strong', {}, 'Date: '), ex.dateText),
          ex.specimen ? h('p', { class: 'fine' }, `${ex.specimen.institution} · ${ex.specimen.accession}`) : null,
          h('p', {}, ex.summary),
          claim,
          stand,
          ex.specimen?.people?.length ? h('ul', { class: 'fine' }, ...ex.specimen.people.map((person) => {
            const record = c.pack.sources.find(({ id }) => id === person.source);
            return h('li', {}, h('strong', {}, person.name), ` · ${person.role}. ${person.detail}`,
              record ? [' ', h('a', { href: record.url, target: '_blank', rel: 'noopener' }, 'Source')] : []);
          })) : null,
          ex.sources.length ? h('p', { class: 'sources' }, h('strong', {}, 'Sources: '), ...ex.sources.flatMap((sid) => {
            const s = c.pack.sources.find((x) => x.id === sid)!;
            return [h('a', { href: s.url, target: '_blank', rel: 'noopener' }, `${s.id}: ${s.title}`), ' '];
          })) : h('p', { class: 'sources fine' }, 'No historical source: this object belongs to the game world or is a modern reconstruction.'),
          hasLens ? h('button', { 'data-autofocus': true, onclick: () => { c.dispatch({ type: 'UseLens', exhibit: exhibitId }); this.sfx('sfx.sparkle'); showLens(); } }, 'Use Date-Kind Lens') : null,
          lensOut,
          ex.labelKit ? h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => this.openLabel(ex.labelKit!) }, c.state.flags[`label.${ex.labelKit}.everHeld`] ? 'Change this plaque' : 'Repair this plaque')) : null,
          thread ? h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => this.followThread(thread.id, thread.nodes[0].id) }, 'Follow the Provenance Thread')) : null,
          encyclopedia ? h('p', { class: 'fine' }, wikipediaLink(encyclopedia)) : null,
          h('div', { class: 'card-mini' }, this.cardView(card)))));
    if (ex.specimen && !ownsSpecimen(c.state, ex.specimen.key)) {
      box.append(localGuide(c, MAPS[c.state.mapId]?.world ?? '', ex.specimen.objective));
    }
  }

  private cardView(card: EvidenceCard, includeSources = true): HTMLElement {
    const encyclopedia = encyclopediaForBiography(card);
    const person = card.person;
    const biography = encyclopedia && person ? h('details', {
      ontoggle: (event: Event) => {
        if (event.currentTarget instanceof HTMLDetailsElement && event.currentTarget.open) {
          ctx.controller.dispatch({ type: 'ReadBiography', card: card.id });
        }
      },
    }, h('summary', {}, `Read about ${person.name}`), h('p', { class: 'fine' }, `${person.life} · ${person.place} · ${person.era}`),
    h('p', { class: 'fine' }, wikipediaLink(encyclopedia))) : null;
    return h('article', { class: 'card' },
      h('h3', {}, card.title),
      h('div', { class: 'chips' }, claimChip(card.claimKind), histChip(card.historicalLabel)),
      biography,
      h('p', {}, card.text),
      h('p', { class: 'limits' }, h('strong', {}, 'Does not show: '), card.limits),
      includeSources && card.sources.length ? h('p', { class: 'fine' }, ...card.sources.map((sid) => {
        const s = ctx.controller.pack.sources.find((x) => x.id === sid)!;
        return h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.id);
      })) : null);
  }

  showSign(title: string, text: string, propId?: string): void {
    this.openModal('sign', title, this.closeBtn(), h('h2', {}, title), h('p', {}, text),
      ...(propId === 'record-book' ? this.rumourReplies('ledger') : []),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  // ----------------------------------------------- bench: marking test

  openBench(): void {
    const c = ctx.controller;
    if (!c.state.flags['talked.ise']) { this.toast('Report to Warden Ise first.', 'info'); return; }
    let pen = 'loud-model', surface = 'paper';
    const history = h('ol', { class: 'history' });
    const result = h('div', { class: 'sim-result', role: 'status', 'aria-live': 'polite' });
    const radios = (name: string, opts: Record<string, string>, cur: string, set: (v: string) => void) =>
      h('fieldset', {}, h('legend', {}, name), ...Object.entries(opts).map(([v, label]) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name, value: v, checked: v === cur, onchange: () => set(v) }), ` ${label}`)));
    const setup = (pen: string, surface: string) => `${PEN_NAMES[pen]} on ${SURFACES[surface].toLowerCase()}`;
    const strip = (label: string, pen: string, surface: string, mark: number, note: string) =>
      h('section', {}, h('h3', {}, label), h('p', {}, setup(pen, surface)),
        this.markCanvas(mark), h('p', { class: 'fine' }, note));
    const run = () => {
      const oldPen = String(c.state.flags['sim.lastPen'] ?? '');
      const oldSurface = String(c.state.flags['sim.lastSurface'] ?? '');
      const previous = SIM_MODEL[oldPen]?.[oldSurface];
      const r = c.dispatch({ type: 'RunSimulation', pen, surface }).find((e) => e.kind === 'simulation')?.result;
      if (!r) return;
      this.sfx('sfx.metal');
      clear(result);
      const comparison = !previous ? 'Pin a second strip beside this one to compare.'
        : r.fairTest ? (r.pen === oldPen ? 'Same pen, different surface.' : 'Same surface, different pen.')
          : r.pen === oldPen && r.surface === oldSurface ? 'Same setup again. Try changing the pen or the surface.'
            : 'Both the pen and the surface changed. Try one change to see which made the difference.';
      result.append(h('div', { class: 'two-col' },
        previous ? strip('Previous strip', oldPen, oldSurface, previous.q, previous.note) : null,
        strip('New strip', r.pen, r.surface, r.markQuality, r.note)),
        h('p', { class: r.fairTest ? 'fair' : 'fine' }, comparison));
      history.append(h('li', {}, setup(r.pen, r.surface)));
    };
    this.openModal('bench', 'Marking test', this.closeBtn(),
      h('h2', {}, 'Workshop bench: marking test'),
      h('div', { class: 'chips' }, claimChip('simulation'), histChip('reconstruction')),
      h('p', { class: 'fine' }, 'Make two marks and pin the strips together. Each strip comes from the workshop model. It tells you how this setup behaves in the simulation.'),
      h('div', { class: 'two-col' }, radios('Pen', PEN_NAMES, pen, (v) => { pen = v; }), radios('Surface', SURFACES, surface, (v) => { surface = v; })),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: run }, 'Run test')),
      result, h('h3', {}, 'Your tests'), history);
  }

  private markCanvas(q: number): HTMLElement {
    const cv = h('canvas', { width: '160', height: '24', class: 'mark', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#efe4c4'; g.fillRect(0, 0, 160, 24);
    g.fillStyle = '#1d2b45';
    for (let x = 6; x < 154; x++) {
      const skip = q === 1 ? (x % 9 < 5) : q === 2 ? (x % 17 < 3) : false;
      if (!skip) g.fillRect(x, 11 + Math.round(Math.sin(x / 9) * 2), 1, q === 3 ? 2 : q === 2 ? 2 : 1);
    }
    return cv;
  }

  // ------------------------------------------------- label builder (29.1 item 2)

  /**
   * Build a label from a subject, a criterion and a limit. Visitors read it
   * and repeat it; the gold glow fades when force matches support. The game
   * never says "wrong": the world responds (PLAY-001, spec 2.11).
   */
  openLabel(kitId: string): void {
    const c = ctx.controller;
    const kit = c.pack.labelKits.find((k) => k.id === kitId);
    if (!kit) return;
    // Cold open: before the recruit talks to Ise, the stand only shows the old label.
    if (kit.id === 'pen' && !c.state.flags['talked.ise']) {
      c.dispatch({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
      this.openModal('label-panel', 'The old label', this.closeBtn(),
        h('h2', {}, 'The old label'),
        h('p', { class: 'fray-label', 'aria-describedby': 'fray-note' }, kit.oldLabel),
        h('p', { id: 'fray-note', class: 'fine' }, 'The label glows a sickly gold. A visitor reads it aloud in a flat voice, and her friend repeats it word for word. Nobody looks at the exhibits.'),
        h('p', {}, 'Warden Ise is waiting for you in the centre of the hall.'),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      return;
    }
    const prev = (k: string, d: string) => String(c.state.flags[`label.${kit.id}.${k}`] ?? d);
    const choice = { subject: prev('subject', kit.subjects[0].id), criterion: prev('criterion', kit.criteria[0].id), limit: prev('limit', kit.limits[0].id) };
    const preview = h('p', { class: 'label-preview', 'aria-live': 'polite' });
    const result = h('div', { class: 'label-result', role: 'status', 'aria-live': 'polite' });
    const update = () => { clear(preview); preview.append(labelText(kit, choice)); };
    const group = (legend: string, name: keyof typeof choice, opts: { id: string; text: string }[], note: (id: string) => string) =>
      h('fieldset', {}, h('legend', {}, legend), ...opts.map((o) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name: `${kit.id}-${name}`, value: o.id, checked: choice[name] === o.id, onchange: () => { choice[name] = o.id; update(); } }),
        ` ${o.text || '(no limit)'}`, note(o.id) ? h('small', { class: 'fine' }, ` ${note(o.id)}`) : '')));
    const put = () => {
      const ev = c.dispatch({ type: 'BuildLabel', kit: kit.id, ...choice });
      const r = (ev.find((e) => e.kind === 'label') as Extract<GameEvent, { kind: 'label' }> | undefined)?.result;
      if (!r) return;
      this.sfx(r.holds ? 'sfx.sparkle' : 'sfx.page');
      clear(result);
      result.append(this.labelOutcome(r));
      result.scrollIntoView({ block: 'nearest', behavior: ctx.settings.reducedMotion ? 'auto' : 'smooth' });
    };
    const held = kit.supports.flatMap((x) => x.cards.map((k) => k.card)).filter((id, i, a) => a.indexOf(id) === i && c.state.cards.includes(id));
    update();
    this.openModal('label-panel wide', kit.title, this.closeBtn(),
      h('h2', {}, kit.title),
      h('p', {}, h('span', { class: 'fine' }, 'Old label: '), h('span', { class: c.state.flags[`label.${kit.id}.holds`] ? '' : 'fray-label small' }, kit.oldLabel)),
      h('p', { class: 'fine' }, kit.legends?.intro ?? 'Build a label that visitors can repeat correctly. A bigger claim needs more support. A limit makes a claim smaller. Many labels can hold.'),
      kit.subjects.length > 1 ? group(kit.legends?.subject ?? 'Who or what', 'subject', kit.subjects, () => '') : '',
      group(kit.legends?.criterion ?? 'What kind of "first"', 'criterion', kit.criteria, (id) => `(force ${kit.criteria.find((x) => x.id === id)!.force})`),
      group(kit.legends?.limit ?? 'A limit (optional)', 'limit', kit.limits, (id) => { const l = kit.limits.find((x) => x.id === id)!; return l.lower ? `(force −${l.lower})` : ''; }),
      h('h3', {}, kit.sentence ? 'Your claim' : 'Your label'), preview,
      h('p', { class: 'fine' }, held.length ? `Cards you hold that may support a label here: ${held.map((id) => c.pack.cards.find((x) => x.id === id)?.title).join('; ')}.` : 'You hold no cards for this label yet. Inspect the exhibits and talk to people first.'),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: put }, kit.legends?.button ?? 'Put up the label')),
      result);
  }

  private labelOutcome(r: LabelResult): HTMLElement {
    const force = r.force - r.lower;
    return h('div', {},
      h('p', { class: r.holds ? 'fair' : 'unfair' }, r.holds ? 'The label holds. The gold glow fades.' : 'The gold glow stays on the label.'),
      h('p', {}, r.heard),
      h('div', { class: 'meter', role: 'img', 'aria-label': `Force ${force}, support ${r.support}` },
        h('span', {}, `Force ${force}`), h('span', { class: 'bar' }, h('i', { style: { width: `${Math.min(100, force * 20)}%` } })),
        h('span', {}, `Support ${r.support}`), h('span', { class: 'bar sup' }, h('i', { style: { width: `${Math.min(100, r.support * 20)}%` } }))),
      h('p', { class: 'fine' }, r.used.length ? `Support came from: ${r.used.map((id) => ctx.controller.pack.cards.find((x) => x.id === id)?.title).join('; ')}.` : 'None of your cards supports this exact label.'));
  }

  // ------------------------------------------------- Title Lock (EE practice, 92.2)

  /** Word puzzles: Sign-Smith lock (rounds) and Citation Thread bridge (order). */
  openPuzzle(puzzleId: string): void {
    const c = ctx.controller;
    const rec = c.pack.puzzles.find((x) => x.id === puzzleId);
    if (!rec) return;
    const F = `puzzle.${rec.id}`;
    if (rec.needs && !c.state.inventory[rec.needs.item]) {
      this.openModal('puzzle-panel', rec.title, this.closeBtn(), h('h2', {}, rec.title), h('p', {}, rec.needs.sealed),
        h('div', { class: 'row' }, h('button', { 'data-autofocus': true, onclick: () => this.closeModal() }, 'Leave it for now')));
      return;
    }
    const box = this.openModal('puzzle-panel wide', rec.title);
    let feedback: { ok: boolean; text: string } | null = null;
    let placed: string[] = [];
    let gapAt: number | null = null;
    let pan: string[] = [];
    let panRound = -1;
    let pickMethod: string | null = null;
    let activeW: string | null = null;
    let mapFor: string | null = null;
    let sorterRun: SorterRun | null = null;
    let echo: { mode: 'idle' | 'listen' | 'wait' | 'go'; t0: number; audio: boolean; timer: number } = { mode: 'idle', t0: 0, audio: false, timer: 0 };
    let flashEcho = ctx.settings.sfxVolume <= 0.01;
    let surveyW: string | null = null, surveyS: string | null = null;
    let frameB = 0;
    let bell: { stop: () => void; timer: number; step: number } | null = null, glassStep = 0;
    const framePos = new Map<string, { x: number; y: number }>();
    if (rec.type === 'frame') rec.briefs.forEach((b) => { const v = String(c.state.flags[`puzzle.${rec.id}.b.${b.id}`] ?? ''); const [x, y] = v.split(',').map(Number); framePos.set(b.id, v ? { x, y } : { x: Math.floor((rec.scene.w - rec.frame.w) / 2), y: Math.floor((rec.scene.h - rec.frame.h) / 2) }); });
    const lastPicks = String(c.state.flags[`puzzle.${rec.id}.sent`] ?? c.state.flags[`puzzle.${rec.id}.last`] ?? '').split(',').filter(Boolean).map(Number);
    const tPicks: number[] = rec.type === 'translate' ? rec.words.map((_, i) => lastPicks[i] ?? 0) : [];
    let examples: string[] = [];
    let sheet: string[] = [];
    const sightNotes = new Map<string, string>();
    // A fixed shuffle (not random), so the tiles never sit in the answer order.
    const pool = rec.type === 'order' ? [...rec.tiles].sort((a, b) => (a.id.length * 7 + a.text.length) % 5 - (b.id.length * 7 + b.text.length) % 5 || a.text.localeCompare(b.text)) : [];
    const take = (ev: GameEvent[]) => {
      const r = ev.find((e) => e.kind === 'puzzle') as Extract<GameEvent, { kind: 'puzzle' }> | undefined;
      if (!r) return;
      feedback = { ok: r.ok, text: r.text }; gapAt = r.gapAt ?? null;
      this.sfx(r.ok ? 'sfx.sparkle' : 'sfx.page');
      render();
    };
    const render = () => {
      const done = c.state.flags[`${F}.done`] === true;
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', {}, rec.intro));
      if (rec.type === 'rounds') {
        const n = Number(c.state.flags[`${F}.rounds`] ?? 0);
        box.append(h('p', { class: 'fine' }, `Notice ${Math.min(n + 1, rec.rounds.length)} of ${rec.rounds.length}`));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (n < rec.rounds.length) {
          const r = rec.rounds[n];
          box.append(h('h3', {}, r.prompt), h('div', { class: 'options notice-options' },
            ...r.options.map((o, i) => h('button', { type: 'button', onclick: () => take(c.dispatch({ type: 'PuzzleRound', puzzle: rec.id, round: n, index: i })) }, h('span', { class: 'notice-text' }, o.text)))));
        } else if (done) box.append(h('p', { class: 'fair' }, 'All three notices are up. The gate is open.'));
      } else if (rec.type === 'balance') {
        const n = Number(c.state.flags[`${F}.rounds`] ?? 0);
        if (n !== panRound) { pan = []; panRound = n; }
        box.append(h('p', { class: 'fine' }, `Weighing ${Math.min(n + 1, rec.rounds.length)} of ${rec.rounds.length}`));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (n < rec.rounds.length) {
          const r = rec.rounds[n];
          const on = pan.map((id) => r.weights.find((w) => w.id === id)!);
          const sum = on.reduce((a, w) => a + w.mass, 0);
          const t = tiltOf(r.load.mass, sum);
          const deg = t === 0 ? 0 : t * Math.min(12, 4 + Math.abs(sum - r.load.mass) * 2);
          box.append(h('h3', {}, r.prompt), balanceSvg(r.load.label, on.map((w) => ({ label: w.label, mass: w.mass, untrusted: !!w.untrusted })), deg),
            h('p', { class: 'fine', 'aria-live': 'polite' }, t === 0 ? 'The beam is level.' : t > 0 ? 'The weights pan is lower.' : 'The load pan is lower.'),
            h('h3', {}, 'Weights on the pan'),
            h('div', { class: 'row wrap tiles on-pan' }, ...(on.length ? on.map((w) => h('button', { type: 'button', class: `weight ${w.untrusted ? 'untrusted' : ''}`, title: 'Take it off', onclick: () => { pan = pan.filter((x) => x !== w.id); this.sfx('sfx.click'); render(); } }, w.label))
              : [h('span', { class: 'fine' }, 'None yet.')])),
            h('h3', {}, 'Weights in the tray'),
            h('div', { class: 'row wrap tiles tray' }, ...r.weights.filter((w) => !pan.includes(w.id)).map((w) => h('button', { type: 'button', class: `weight ${w.untrusted ? 'untrusted' : ''}`, onclick: () => { pan.push(w.id); feedback = null; this.sfx('sfx.metal'); render(); } }, w.label))),
            h('div', { class: 'row' },
              h('button', { class: 'primary', onclick: () => take(c.dispatch({ type: 'PuzzleWeigh', puzzle: rec.id, round: n, weights: [...pan] })) }, 'Record this weighing'),
              h('button', { onclick: () => { pan = []; feedback = null; render(); } }, 'Clear the pan')));
        } else if (done) box.append(h('p', { class: 'fair' }, 'Every weighing is in the record book.'));
      } else if (rec.type === 'forecast') {
        const list = readForecasts(c.state.flags[`${F}.f`]);
        const n = list.length, all = n >= rec.days.length;
        const CLUE: Record<string, Record<string, string>> = {
          baro: { falling: 'The weather glass is falling', steady: 'The weather glass is steady', rising: 'The weather glass is rising' },
          clouds: { low: 'Low grey clouds', high: 'High, thin clouds', none: 'No clouds' },
          birds: { low: 'Swallows fly low', high: 'Swallows fly high' },
        };
        const WORD: Record<number, string> = { 10: 'very unlikely', 30: 'unlikely', 50: 'as likely as not', 70: 'likely', 90: 'very likely' };
        box.append(h('details', { class: 'forecast-notes' }, h('summary', {}, "The fishers' almanac (what the clues mean)"), h('ul', {}, ...rec.notes.map((t) => h('li', {}, t)))));
        box.append(h('ol', { class: 'forecast-days', 'aria-label': 'Days' }, ...rec.days.map((d, i) => h('li', { class: `fday ${i === n ? 'now' : ''} ${i < n ? (d.rain ? 'wet' : 'dry') : ''}` },
          h('span', { class: 'fd-n' }, `Day ${i + 1}`), i < n ? h('span', { class: 'fd-w', 'aria-label': d.rain ? 'rain' : 'dry' }, d.rain ? '☔' : '☀') : h('span', { class: 'fd-w' }, '·'), i < n ? h('span', { class: 'fd-p' }, `${list[i]}%`) : ''))));
        if (!all) {
          const d = rec.days[n];
          const tile = (k: 'baro' | 'clouds' | 'birds') => { const el = h('figure', { class: 'clue' }); el.innerHTML = clueSvg(k, d[k]); el.append(h('figcaption', {}, CLUE[k][d[k]])); return el; };
          box.append(h('h3', {}, `Day ${n + 1} of ${rec.days.length}: will it rain today?`),
            h('div', { class: 'row wrap clues' }, tile('baro'), tile('clouds'), tile('birds')),
            h('div', { class: 'row wrap chances' }, ...rec.choices.map((ch) => h('button', { type: 'button', class: 'chance', onclick: () => {
              take(c.dispatch({ type: 'PuzzleForecast', puzzle: rec.id, chance: ch }));
              if (d.rain) playNotes([{ f: 1318, at: 0, beats: 0.5 }, { f: 1046, at: 0.4, beats: 0.5 }, { f: 880, at: 0.8, beats: 0.5 }, { f: 1174, at: 1.1, beats: 0.5 }], 0.18, 'marimba', ctx.settings.sfxVolume);
              else chime(ctx.settings.sfxVolume);
            } }, h('strong', {}, `${ch}%`), h('small', {}, WORD[ch] ?? '')))));
        }
        if (n > 0) {
          const last = rec.days[n - 1];
          box.append(h('div', { class: `sky ${last.rain ? 'wet' : 'dry'}`, 'aria-hidden': 'true' }, ...(last.rain ? Array.from({ length: 24 }, (_, i) => h('span', { class: 'drop', style: { left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.12}s` } })) : [h('span', { class: 'sun' })])));
        }
        if (all) {
          const rained = rec.days.map((d) => d.rain);
          const you = brier(list.map((x) => x / 100), rained), half = brier(rec.days.map(() => 0.5), rained), alm = brier(rec.days.map((d) => d.almanac), rained);
          const bar = (label: string, v: number, cls: string) => h('div', { class: `score-row ${cls}` }, h('span', {}, label), h('span', { class: 'score-bar' }, h('span', { style: { width: `${Math.min(100, (v / 0.5) * 100)}%` } })), h('strong', {}, v.toFixed(3)));
          const cal = calibration(list, rained);
          const chart = h('div', { class: 'calib', role: 'img', 'aria-label': cal.map((g) => `When you said ${g.p}%, it rained on ${g.rain} of ${g.days} days`).join('. ') });
          chart.innerHTML = `<svg viewBox="0 0 220 140" aria-hidden="true"><rect width="220" height="140" rx="8" fill="#14202b"/><line x1="20" y1="120" x2="210" y2="120" stroke="#4a6a85"/><line x1="20" y1="120" x2="210" y2="20" stroke="#f6c453" stroke-dasharray="4 3"/>${cal.map((g) => { const x = 20 + (g.p / 100) * 190, hgt = (g.rain / g.days) * 100; return `<rect x="${x - 8}" y="${120 - hgt}" width="16" height="${hgt}" fill="#7cc4ff" opacity="0.9"/><text x="${x}" y="133" font-size="8" fill="#9fb3c8" text-anchor="middle">${g.p}%</text><text x="${x}" y="${116 - hgt}" font-size="8" fill="#e8efe8" text-anchor="middle">${g.rain}/${g.days}</text>`; }).join('')}</svg>`;
          box.append(h('h3', {}, 'How did the forecasts do?'),
            h('p', { class: 'fine' }, 'The score is the average of (forecast − what happened)², so lower is better. 0 would mean certain and always right. It is not a mark: no score is a pass or a fail.'),
            h('div', { class: 'scores' }, bar('Your forecasts', you, 'you'), bar("Always '50%'", half, 'half'), bar('The almanac', alm, 'alm')),
            h('p', { class: 'fine' }, 'The bars show how often it rained when you said each chance. On a well-matched forecast, the bars reach the dashed line.'), chart,
            h('h3', {}, done ? 'What you learned' : 'What does this tell you about being sure?'),
            done ? h('p', { class: 'fair' }, rec.reflect.find((x) => x.honest)!.text)
              : h('div', { class: 'options notice-options' }, ...rec.reflect.map((x, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, x.text)))));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'shepard') {
        const played = Number(c.state.flags[`${F}.played`] ?? 0), guess = c.state.flags[`${F}.guess`], compared = c.state.flags[`${F}.compared`] === true;
        const parts = (st: number) => shepardParts(st, rec.steps, rec.base, rec.octaves);
        const LOOPS = 2, STEP = ctx.settings.reducedMotion ? 0.6 : 0.5;
        // The bell stair: one bell per step, lit in turn while the scale plays.
        const stair = h('div', { class: 'bell-stair', 'aria-hidden': 'true' }, ...Array.from({ length: rec.steps }, (_, i) => h('span', { class: 'bell-step', style: { bottom: `${(i / rec.steps) * 72}%`, left: `${(i / rec.steps) * 88}%` } }, '🔔')));
        const nowStep = h('p', { class: 'fine bell-now', 'aria-live': 'polite' }, bell ? `Step ${bell.step % rec.steps}` : '');
        const stopBell = () => { if (!bell) return; bell.stop(); clearInterval(bell.timer); bell = null; };
        box.append(h('div', { class: 'bell-scene' }, stair, h('div', { class: 'bell-rope' })), nowStep,
          h('h3', {}, '1. Listen to the bell stair'),
          h('div', { class: 'row' }, h('button', { class: played ? '' : 'primary', disabled: !!bell, onclick: () => {
            const all = Array.from({ length: rec.steps * LOOPS + 1 }, (_, i) => parts(i));
            const stop = playShepard(all, STEP, ctx.settings.sfxVolume);
            caption('sfx.bellstair');
            bell = { stop, step: 0, timer: 0 };
            take(c.dispatch({ type: 'PuzzleListen', puzzle: rec.id, action: 'play' }));
            const light = () => { if (!bell) return; box.querySelectorAll('.bell-step').forEach((el, i) => el.classList.toggle('lit', i === bell!.step % rec.steps)); const np = box.querySelector('.bell-now'); if (np) np.textContent = `Step ${bell.step} of ${rec.steps * LOOPS}`; };
            light();
            bell.timer = window.setInterval(() => { if (!bell) return; if (!box.isConnected) { stopBell(); return; } bell.step++; if (bell.step > rec.steps * LOOPS) { stopBell(); render(); return; } light(); }, STEP * 1000);
          } }, played ? 'Ring the stair again' : 'Ring the bell stair'), bell ? h('button', { onclick: () => { stopBell(); render(); } }, 'Stop') : '',
          ctx.settings.sfxVolume <= 0.01 ? h('span', { class: 'fine' }, 'Your sound is off. The tuning glass below shows the notes as bars.') : ''));
        if (played) {
          box.append(h('h3', {}, '2. What did you hear?'), h('p', { class: 'fine' }, 'There is no wrong answer here. Say what your ears told you.'),
            h('div', { class: 'options notice-options' }, ...rec.guesses.map((g, i) => h('button', { type: 'button', class: guess === i ? 'picked' : '', onclick: () => take(c.dispatch({ type: 'PuzzleListen', puzzle: rec.id, action: 'guess', index: i })) }, h('span', { class: 'notice-text' }, g.text)))));
        }
        const glass = (st: number, label: string) => {
          const ps = parts(st), W = 280, H = 90;
          const lx = (f: number) => 10 + ((Math.log2(f / rec.base)) / rec.octaves) * (W - 20);
          const el = h('div', { class: 'tuning-glass', role: 'img', 'aria-label': `${label}: ${ps.filter((p) => p.amp > 0.05).map((p) => `${Math.round(p.f)} hertz${p.amp > 0.6 ? ' (loud)' : p.amp < 0.2 ? ' (quiet)' : ''}`).join(', ')}` });
          el.innerHTML = `<svg viewBox="0 0 ${W} ${H + 18}" aria-hidden="true"><rect width="${W}" height="${H + 18}" rx="8" fill="#14202b"/>${ps.map((p) => `<rect x="${lx(p.f) - 3}" y="${H - p.amp * (H - 10)}" width="6" height="${p.amp * (H - 10)}" rx="2" fill="#7cc4ff"/>`).join('')}<line x1="10" y1="${H}" x2="${W - 10}" y2="${H}" stroke="#4a6a85"/>${Array.from({ length: rec.octaves + 1 }, (_, k) => `<text x="${lx(rec.base * 2 ** k)}" y="${H + 13}" font-size="8" fill="#9fb3c8" text-anchor="middle">${Math.round(rec.base * 2 ** k)}</text>`).join('')}</svg>`;
          return h('figure', { class: 'glass-fig' }, el, h('figcaption', { class: 'fine' }, label));
        };
        if (typeof guess === 'number') {
          box.append(h('h3', {}, '3. Look through the tuning glass'),
            h('p', { class: 'fine' }, 'Each bar is one note in the bell sound. Taller is louder. The numbers are hertz (vibrations each second).'),
            h('label', { class: 'glass-slider' }, `Step ${glassStep}: `, h('input', { type: 'range', min: 0, max: rec.steps, value: glassStep, 'aria-label': 'Step to look at', oninput: (e: Event) => { glassStep = Number((e.target as HTMLInputElement).value); render(); } })),
            glass(glassStep, `Step ${glassStep}`),
            compared ? h('div', { class: 'row wrap glass-pair' }, glass(0, 'Step 0 (the first bell)'), glass(rec.steps, `Step ${rec.steps} (after one full climb)`))
              : h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => take(c.dispatch({ type: 'PuzzleListen', puzzle: rec.id, action: 'compare' })) }, `Compare step 0 with step ${rec.steps}`)));
        }
        if (compared) {
          box.append(h('h3', {}, done ? 'What you learned' : '4. What do your ears and the glass tell you together?'),
            done ? h('p', { class: 'fair' }, rec.reflect.find((x) => x.honest)!.text)
              : h('div', { class: 'options notice-options' }, ...rec.reflect.map((x, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, x.text)))));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'frame') {
        const U = 10, SW = rec.scene.w * U, SH = rec.scene.h * U, FW = rec.frame.w * U, FH = rec.frame.h * U;
        const doneB = (id: string) => typeof c.state.flags[`${F}.b.${id}`] === 'string';
        const b = rec.briefs[frameB];
        const pos = framePos.get(b.id)!;
        const inner = frameScene(rec.items, rec.scene.w, rec.scene.h);
        const clamp = (x: number, y: number) => ({ x: Math.max(0, Math.min(rec.scene.w - rec.frame.w, Math.round(x))), y: Math.max(0, Math.min(rec.scene.h - rec.frame.h, Math.round(y))) });
        box.append(h('div', { class: 'frame-briefs', role: 'tablist' }, ...rec.briefs.map((q, i) => h('button', { type: 'button', role: 'tab', class: `frame-brief ${i === frameB ? 'picked' : ''} ${doneB(q.id) ? 'done' : ''}`, 'aria-selected': String(i === frameB),
          onclick: () => { frameB = i; feedback = null; this.sfx('sfx.click'); render(); } }, doneB(q.id) ? '✓ ' : '', q.who))));
        box.append(h('p', { class: 'frame-wants' }, h('strong', {}, `${b.who}: `), `“${b.wants}”`));
        const canvas = h('div', { class: 'frame-canvas', role: 'img', 'aria-label': `The whole market scene. Your frame shows: ${framed(rec, pos.x, pos.y).map((id) => rec.items.find((i) => i.id === id)!.label).join(', ') || 'nothing'}.` });
        canvas.innerHTML = `<svg viewBox="0 0 ${SW} ${SH}" aria-hidden="true"><defs><mask id="fr-hole"><rect width="${SW}" height="${SH}" fill="#fff"/><rect class="fr-hole" x="${pos.x * U}" y="${pos.y * U}" width="${FW}" height="${FH}" fill="#000"/></mask></defs>${inner}<rect width="${SW}" height="${SH}" fill="#0b0a1a" opacity="0.55" mask="url(#fr-hole)"/><rect class="fr-rect" x="${pos.x * U}" y="${pos.y * U}" width="${FW}" height="${FH}" fill="none" stroke="#f6c453" stroke-width="2.5" stroke-dasharray="6 3"/></svg>`;
        const svg = canvas.querySelector('svg')!;
        const poster = h('div', { class: 'frame-poster' });
        poster.innerHTML = `<svg viewBox="${pos.x * U} ${pos.y * U} ${FW} ${FH}" aria-hidden="true">${inner}</svg>`;
        let dragging = false;
        // While dragging, move the frame in place; draw the panel again when the drag ends.
        const moveTo = (ev: PointerEvent) => {
          const r = svg.getBoundingClientRect(); const ux = ((ev.clientX - r.left) / r.width) * rec.scene.w, uy = ((ev.clientY - r.top) / r.height) * rec.scene.h;
          const np = clamp(ux - rec.frame.w / 2, uy - rec.frame.h / 2);
          if (np.x === pos.x && np.y === pos.y) return;
          pos.x = np.x; pos.y = np.y; framePos.set(b.id, { ...np });
          svg.querySelectorAll('.fr-hole, .fr-rect').forEach((el) => { el.setAttribute('x', String(np.x * U)); el.setAttribute('y', String(np.y * U)); });
          poster.querySelector('svg')?.setAttribute('viewBox', `${np.x * U} ${np.y * U} ${FW} ${FH}`);
        };
        svg.addEventListener('pointerdown', (ev) => { dragging = true; svg.setPointerCapture(ev.pointerId); moveTo(ev); });
        svg.addEventListener('pointermove', (ev) => { if (dragging) moveTo(ev); });
        const endDrag = () => { if (!dragging) return; dragging = false; feedback = null; this.sfx('sfx.click'); render(); };
        svg.addEventListener('pointerup', endDrag); svg.addEventListener('pointercancel', endDrag);
        const nudge = (dx: number, dy: number) => { framePos.set(b.id, clamp(pos.x + dx, pos.y + dy)); feedback = null; render(); };
        box.append(h('div', { class: 'frame-body' }, h('div', {}, canvas,
          h('div', { class: 'row frame-nudge', 'aria-label': 'Move the frame' }, h('button', { type: 'button', 'aria-label': 'Move the frame left', onclick: () => nudge(-1, 0) }, '←'), h('button', { type: 'button', 'aria-label': 'Move the frame up', onclick: () => nudge(0, -1) }, '↑'), h('button', { type: 'button', 'aria-label': 'Move the frame down', onclick: () => nudge(0, 1) }, '↓'), h('button', { type: 'button', 'aria-label': 'Move the frame right', onclick: () => nudge(1, 0) }, '→'), h('span', { class: 'fine' }, 'Drag on the picture, or use the arrows.'))),
          h('div', { class: 'frame-side' }, h('p', { class: 'label' }, 'The poster'), poster,
            h('button', { class: 'primary', onclick: () => { const ev = c.dispatch({ type: 'PuzzleFrame', puzzle: rec.id, brief: b.id, x: pos.x, y: pos.y }); take(ev); if (doneB(b.id)) { this.sfx('sfx.sparkle'); const nx = rec.briefs.findIndex((q) => !doneB(q.id)); if (nx >= 0) frameB = nx; render(); } } }, `Give it to ${b.who.split(',')[0]}`))));
        if (rec.briefs.every((q) => doneB(q.id))) {
          const all = h('div', { class: 'frame-canvas all' });
          const COL = ['#f6c453', '#7cc4ff', '#ff8a7a', '#9fe0a8'];
          all.innerHTML = `<svg viewBox="0 0 ${SW} ${SH}" aria-hidden="true">${inner}${rec.briefs.map((q, i) => { const [x, y] = String(c.state.flags[`${F}.b.${q.id}`]).split(',').map(Number); return `<rect x="${x * U + i * 2}" y="${y * U + i * 2}" width="${FW - i * 4}" height="${FH - i * 4}" fill="none" stroke="${COL[i % 4]}" stroke-width="2.5"/>`; }).join('')}</svg>`;
          box.append(h('h3', {}, 'All three posters, on the whole painting'), all,
            h('ul', { class: 'row wrap frame-key' }, ...rec.briefs.map((q, i) => h('li', {}, h('span', { class: 'dot', style: { background: COL[i % 4] } }), ` ${q.who}`))),
            h('h3', {}, done ? 'What you learned' : 'Each poster is true. What do they teach you?'),
            done ? h('p', { class: 'fair' }, rec.reflect.find((x) => x.honest)!.text)
              : h('div', { class: 'options notice-options' }, ...rec.reflect.map((x, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, x.text)))));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'translate') {
        const sent = typeof c.state.flags[`${F}.sent`] === 'string';
        const last = c.state.flags[`${F}.last`];
        const r = translateLine(rec, tPicks);
        // The ferry slate: the message in the cant, each special word marked.
        const marked = (line: string) => { const parts: (string | HTMLElement)[] = []; let rest = line;
          while (rest) { const hit = rec.words.map((w) => ({ w, i: rest.indexOf(w.word) })).filter((x) => x.i >= 0).sort((a, b) => a.i - b.i)[0];
            if (!hit) { parts.push(rest); break; }
            parts.push(rest.slice(0, hit.i), h('mark', { class: 'cant' }, hit.w.word)); rest = rest.slice(hit.i + hit.w.word.length); }
          return parts; };
        box.append(h('div', { class: 'ferry-slate' }, h('span', { class: 'fine' }, `${rec.speaker} sends:`), h('p', { class: 'cant-line', lang: 'x-cant' }, ...marked(rec.source))));
        box.append(h('h3', {}, '1. Choose an English rendering for each marked word'),
          h('div', { class: 'tr-words' }, ...rec.words.map((w, wi) => h('div', { class: 'tr-word' },
            h('strong', { class: 'cant' }, w.word), h('p', { class: 'fine tr-note' }, `Sefa: ${w.note}`),
            h('div', { class: 'tr-choices' }, ...w.choices.map((ch, ci) => h('button', { type: 'button', class: `tr-choice ${tPicks[wi] === ci ? 'picked' : ''}`, 'aria-pressed': String(tPicks[wi] === ci),
              onclick: () => { tPicks[wi] = ci; feedback = null; this.sfx('sfx.click'); render(); } }, ch.text)))))));
        const pct = Math.min(100, (r.words / rec.budget) * 100);
        box.append(h('h3', {}, "2. Read it on the crier's slate"),
          h('div', { class: `crier-slate ${r.over ? 'over' : ''}` }, h('p', {}, r.text),
            h('div', { class: 'word-meter', role: 'img', 'aria-label': `${r.words} of ${rec.budget} words` }, h('span', { style: { width: `${pct}%` } }), h('strong', {}, `${r.words} / ${rec.budget} words`))),
          h('div', { class: 'row' }, h('button', { class: 'primary', disabled: r.over, onclick: () => {
            const ev = c.dispatch({ type: 'PuzzleTranslate', puzzle: rec.id, picks: [...tPicks] }); take(ev);
            this.sfx(c.state.flags[`${F}.sent`] === tPicks.join(',') ? 'sfx.sparkle' : 'sfx.page'); } }, 'Send it to the council'),
            r.over ? h('span', { class: 'fine' }, 'Too long for the slate. Make something shorter.') : ''));
        if (typeof last === 'string') {
          const lr = translateLine(rec, last.split(',').map(Number));
          box.append(h('h3', {}, 'Check: Sefa reads your last message back into the cant'),
            h('p', { class: 'fine' }, 'A back-translation is a check, not a proof. Where it differs from the first line, meaning may have moved.'),
            h('div', { class: 'tr-back' }, h('p', { class: 'cant-line' }, ...marked(rec.source)), h('p', { class: 'cant-line back' }, ...marked(lr.back)),
              h('ul', { class: 'tr-needs' }, ...rec.parts.map((n) => h('li', { class: lr.kept.includes(n.id) ? 'kept' : 'lost' }, `${lr.kept.includes(n.id) ? '✓' : '✕'} ${n.name}`)))));
        }
        if (sent) {
          box.append(h('h3', {}, done ? 'What you learned' : '3. What did the translation teach you?'),
            done ? h('p', { class: 'fair' }, rec.reflect.find((x) => x.honest)!.text)
              : h('div', { class: 'options notice-options' }, ...rec.reflect.map((x, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, x.text)))));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'survey') {
        const runs = String(c.state.flags[`${F}.runs`] ?? '').split(',').filter(Boolean);
        const fairDone = runs.includes(`${rec.fair.wording}:${rec.fair.sample}`);
        const GCOL: Record<string, string> = {};
        Object.keys(rec.groups).forEach((g, i) => { GCOL[g] = ['#c39bff', '#7fd3a8', '#ffb066', '#7cc4ff', '#ff8a7a'][i % 5]; });
        box.append(h('div', { class: 'row wrap survey-legend' }, ...Object.entries(rec.groups).map(([g, n]) => h('span', {}, h('span', { class: 'dot', style: { background: GCOL[g] } }), ` ${n}`))));
        box.append(h('h3', {}, '1. How will you ask?'), h('div', { class: 'survey-opts' }, ...rec.wordings.map((w) => h('button', { type: 'button', class: `survey-opt ${surveyW === w.id ? 'picked' : ''}`, 'aria-pressed': String(surveyW === w.id), onclick: () => { surveyW = w.id; this.sfx('sfx.click'); render(); } }, `“${w.text}”`))),
          h('h3', {}, '2. Whom will you ask?'), h('div', { class: 'survey-opts' }, ...rec.samples.map((sm) => h('button', { type: 'button', class: `survey-opt ${surveyS === sm.id ? 'picked' : ''}`, 'aria-pressed': String(surveyS === sm.id), onclick: () => { surveyS = sm.id; this.sfx('sfx.click'); render(); } }, `${sm.label} (${sm.people.length} people)`))),
          h('div', { class: 'row' }, h('button', { class: 'primary', disabled: !surveyW || !surveyS, onclick: () => { take(c.dispatch({ type: 'PuzzleSurvey', puzzle: rec.id, wording: surveyW!, sample: surveyS! })); this.sfx('sfx.page'); } }, 'Ask')));
        if (runs.length) {
          box.append(h('h3', {}, 'Your surveys'), h('div', { class: 'survey-runs' }, ...runs.map((pair) => {
            const [w, sm] = pair.split(':');
            const r = runSurvey(rec, w, sm);
            const people = h('div', { class: 'survey-people', 'aria-hidden': 'true' }, ...r.answers.map((a) => { const g = rec.people.find((x) => x.id === a.id)!.group; return h('span', { class: `voter ${a.yes ? 'yes' : 'no'}`, style: { background: GCOL[g] } }, a.yes ? '✓' : '✕'); }));
            return h('div', { class: 'survey-run' },
              h('p', { class: 'fine' }, `Asked: “${rec.wordings.find((x) => x.id === w)!.text}” To: ${rec.samples.find((x) => x.id === sm)!.label.toLowerCase()}.`),
              h('div', { class: 'survey-bar', role: 'img', 'aria-label': `${r.yes} of ${r.total} said yes` }, h('span', { class: 'yes', style: { width: `${(r.yes / r.total) * 100}%` } }), h('strong', {}, `${r.yes} of ${r.total} said yes (${Math.round((r.yes / r.total) * 100)}%)`)),
              people);
          })));
        }
        if (runs.length >= 2 || fairDone) {
          box.append(h('h3', {}, done ? 'Your report to the council' : 'Write the report to the council'),
            !fairDone && !done ? h('p', { class: 'fine' }, 'Before you report, try a plain question with a group from every part of town.') : '',
            done ? h('p', { class: 'fair' }, rec.reflect.find((r) => r.honest)!.text)
              : fairDone ? h('div', { class: 'options notice-options' }, ...rec.reflect.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text)))) : '');
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'echo') {
        const echoes = readTimes(c.state.flags[`${F}.echo`]), reacts = readTimes(c.state.flags[`${F}.react`]);
        const es = timeStats(echoes), rs = timeStats(reacts);
        const now = () => (echo.audio ? (audioNow() ?? 0) * 1000 : performance.now());
        const record = (kind: 'echo' | 'react') => { const ms = now() - echo.t0; clearTimeout(echo.timer); echo.mode = 'idle'; take(c.dispatch({ type: 'PuzzleTime', puzzle: rec.id, kind, ms })); };
        const lantern = h('div', { class: `echo-lantern ${echo.mode === 'go' ? 'lit' : ''} ${echo.mode === 'listen' ? 'listening' : ''}`, 'aria-hidden': 'true' });
        const fmt = (ms: number) => `${(ms / 1000).toFixed(2)} s`;
        box.append(h('div', { class: 'echo-scene', 'aria-hidden': 'true' }, h('span', { class: 'wall' }), h('span', { class: `wave ${echo.mode === 'listen' ? 'go' : ''}` }), h('span', { class: 'you' }, '👏'), lantern));
        // Step 1: the echo.
        box.append(h('h3', {}, `Step 1. Time the echo (${echoes.length} of ${rec.minTimes} or more)`),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: flashEcho, onchange: (e: Event) => { flashEcho = (e.target as HTMLInputElement).checked; render(); } }), ' Also show the echo as a flash (for no sound)'),
          h('div', { class: 'row' },
            echo.mode === 'listen'
              ? h('button', { class: 'primary big', 'data-autofocus': true, onclick: () => record('echo') }, 'Now! I hear the echo')
              : h('button', { class: echoes.length < rec.minTimes ? 'primary' : '', disabled: echo.mode !== 'idle', onclick: () => {
                const d = echoDelay(rec);
                const t = clapEcho(ctx.settings.sfxVolume, d);
                echo = { mode: 'listen', audio: t !== null, t0: t !== null ? t * 1000 : performance.now(), timer: 0 };
                if (t === null) flashEcho = true;
                caption('sfx.clap');
                echo.timer = window.setTimeout(() => { caption('sfx.echo'); if (flashEcho) box.querySelector('.echo-lantern')?.classList.add('flash'); }, d * 1000 + (t !== null ? Math.max(0, t * 1000 - now()) : 0));
                render();
              } }, 'Clap')),
          echoes.length ? h('p', {}, `Your times: ${echoes.map(fmt).join(', ')}. Mean ${fmt(es.mean)}, spread ${fmt(es.spread)}. Estimate: ${Math.round(echoDistance(es.mean, rec.speed))} m to the wall.`) : '');
        // Step 2: reaction time.
        if (echoes.length >= rec.minTimes) {
          box.append(h('h3', {}, `Step 2. How quickly do you react? (${reacts.length} of ${rec.minTimes} or more)`),
            h('p', { class: 'fine' }, 'Press Start, then press again as soon as the lantern lights. Wait for it!'),
            h('div', { class: 'row' }, echo.mode === 'wait' || echo.mode === 'go'
              ? h('button', { class: 'primary big', 'data-autofocus': true, onclick: () => {
                if (echo.mode === 'wait') { clearTimeout(echo.timer); echo.mode = 'idle'; feedback = { ok: false, text: 'Too early: the lantern was not lit yet. Try again.' }; render(); return; }
                record('react');
              } }, echo.mode === 'go' ? 'Now!' : 'Wait for the light…')
              : h('button', { onclick: () => {
                echo = { mode: 'wait', audio: false, t0: 0, timer: 0 };
                echo.timer = window.setTimeout(() => { echo.mode = 'go'; echo.t0 = performance.now(); this.sfx('sfx.click'); render(); }, 1000 + Math.random() * 2000);
                render();
              } }, 'Start')),
            reacts.length ? h('p', {}, `Your reaction times: ${reacts.map(fmt).join(', ')}. Mean ${fmt(rs.mean)}.`) : '');
        }
        // Step 3: compare.
        if (echoes.length >= rec.minTimes && reacts.length >= rec.minTimes) {
          const first = echoDistance(es.mean, rec.speed), fixed = echoDistance(Math.max(0, es.mean - rs.mean), rec.speed);
          const max = Math.max(first, fixed, rec.distance) * 1.1;
          const bar = (label: string, v: number, cls: string) => h('div', { class: 'echo-bar' }, h('span', {}, label), h('span', { class: `fill ${cls}`, style: { width: `${(v / max) * 100}%` } }), h('strong', {}, `${Math.round(v)} m`));
          box.append(h('h3', {}, 'Step 3. Check'),
            h('p', {}, `Idris and two friends walked a knotted rope to the wall: ${rec.distance} m.`),
            h('div', { class: 'echo-bars' }, bar('Your first estimate', first, 'first'), bar('Echo time minus your reaction time', fixed, 'fixed'), bar('The rope', rec.distance, 'rope')),
            Math.abs(fixed - rec.distance) > 15 ? h('p', { class: 'fine' }, `Your corrected estimate is still ${Math.round(Math.abs(fixed - rec.distance))} m from the rope. That is real data too: listening for a sound is not quite the same as watching for a light, and a careful scientist says so. Try a few more of each if you like.`) : '',
            done ? h('p', { class: 'fair' }, rec.reflect.find((r) => r.honest)!.text)
              : h('div', {}, h('h3', {}, 'What does this show?'), h('div', { class: 'options notice-options' }, ...rec.reflect.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text))))));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb);
        }
      } else if (rec.type === 'sorter') {
        const byId = new Map(rec.fruits.map((f) => [f.id, f]));
        const diagnosed = c.state.flags[`${F}.diagnosed`] === true;
        const trained = typeof c.state.flags[`${F}.trained`] === 'string';
        const fruitBtn = (id: string, picked: boolean, onclick?: () => void) => { const f = byId.get(id)!; const b = h('button', { type: 'button', class: `fruit-btn ${picked ? 'picked' : ''}`, 'aria-pressed': onclick ? String(picked) : null, 'aria-label': fruitLabel(f), disabled: !onclick, onclick }); b.innerHTML = fruitSvg(f); return b; };
        const runIt = (ids: string[]) => { sorterRun = runSorter(rec, ids); sorterRun.calls.forEach((_, i) => setTimeout(() => this.sfx('sfx.metal'), i * 120)); };
        if (!diagnosed) {
          box.append(h('h3', {}, "Mara's examples"), h('div', { class: 'row wrap' }, ...rec.start.map((id) => fruitBtn(id, true))),
            sorterView(rec, sorterRun),
            h('div', { class: 'row' }, h('button', { class: sorterRun ? '' : 'primary', onclick: () => { runIt(rec.start); render(); } }, sorterRun ? 'Run it again' : "Run the sorter on today's basket")));
          if (sorterRun) {
            const r = sorterRun;
            box.append(h('p', {}, `${r.right} of ${r.total} sorted right. Good fruit set aside from: ${r.farmsHurt.map((x) => rec.farms[x]).join(', ') || 'nobody'}.`),
              h('h3', {}, "Hana says: 'Why does it throw away my good apples?' What is the reason?"),
              h('div', { class: 'options notice-options' }, ...rec.diagnose.map((d, i) => h('button', { type: 'button', onclick: () => { take(c.dispatch({ type: 'PuzzleDiagnose', puzzle: rec.id, index: i })); if (c.state.flags[`${F}.diagnosed`] === true) sorterRun = null; } }, h('span', { class: 'notice-text' }, d.text)))));
          }
        } else {
          if (trained && !examples.length) examples = String(c.state.flags[`${F}.trained`]).split(',');
          box.append(h('h3', {}, `Choose up to ${rec.slots} examples from the crate (${examples.length} chosen)`),
            h('div', { class: 'row wrap crate' }, ...rec.crate.map((id) => { const on = examples.includes(id); return fruitBtn(id, on, () => { if (on) examples = examples.filter((x) => x !== id); else if (examples.length < rec.slots) examples = [...examples, id]; feedback = null; this.sfx('sfx.click'); render(); }); })),
            sorterView(rec, sorterRun),
            h('div', { class: 'row' }, h('button', { class: 'primary', disabled: !examples.length, onclick: () => { const ev = c.dispatch({ type: 'PuzzleTrain', puzzle: rec.id, examples: [...examples] }); runIt(examples); take(ev); } }, 'Teach the sorter and run the basket'),
              h('button', { onclick: () => { examples = []; sorterRun = null; feedback = null; render(); } }, 'Empty the example tray')));
          if (trained) {
            box.append(h('h3', {}, done ? 'What you learned' : 'The sorter is fair to all three farms now. What did you learn?'),
              done ? h('p', { class: 'fair' }, rec.reflect.find((r) => r.honest)!.text)
                : h('div', { class: 'options notice-options' }, ...rec.reflect.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text)))));
          }
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'mapmaker') {
        const served = (id: string) => typeof c.state.flags[`${F}.a.${id}`] === 'string';
        if (!mapFor) mapFor = rec.audiences.find((a) => !served(a.id))?.id ?? rec.audiences[0].id;
        const a = rec.audiences.find((x) => x.id === mapFor)!;
        box.append(h('div', { class: 'row wrap map-people', role: 'tablist' }, ...rec.audiences.map((x) => h('button', { type: 'button', role: 'tab', 'aria-selected': String(x.id === mapFor), class: `map-person ${x.id === mapFor ? 'picked' : ''} ${served(x.id) ? 'served' : ''}`,
          onclick: () => { mapFor = x.id; const f = c.state.flags[`${F}.a.${x.id}`]; sheet = typeof f === 'string' ? f.split(',') : []; feedback = null; render(); } }, served(x.id) ? `✓ ${x.name}` : x.name))));
        box.append(h('blockquote', { class: 'map-wants' }, h('strong', {}, `${a.name}: `), `“${a.wants}”`),
          h('div', { class: 'map-body' }, townMapSvg(sheet), h('div', { class: 'map-layers' },
            h('p', { class: 'fine' }, `Layers on the sheet: ${sheet.length} of ${rec.maxLayers}`),
            ...rec.layers.map((l) => { const onIt = sheet.includes(l.id); const full = !onIt && sheet.length >= rec.maxLayers;
              return h('button', { type: 'button', class: `layer-chip ${onIt ? 'on' : ''}`, 'aria-pressed': String(onIt), disabled: full, title: full ? 'The sheet is full. Take a layer off first.' : '',
                onclick: () => { sheet = onIt ? sheet.filter((x) => x !== l.id) : [...sheet, l.id]; feedback = null; this.sfx('sfx.page'); render(); } }, onIt ? `✓ ${l.label}` : l.label); }),
            h('button', { class: 'primary', onclick: () => take(c.dispatch({ type: 'PuzzleMap', puzzle: rec.id, audience: a.id, layers: [...sheet] })) }, `Give this map to ${a.name.split(',')[0]}`))));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (rec.audiences.every((x) => served(x.id))) {
          box.append(h('h3', {}, done ? 'Your answer' : 'Four maps of one town. Which one is the true map of Emberford?'),
            done ? h('p', { class: 'fair' }, rec.reflect.find((r) => r.honest)!.text)
              : h('div', { class: 'options notice-options' }, ...rec.reflect.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text)))));
          if (feedback && !feedback.ok) { const fb = box.querySelector('.alcove-feedback'); if (fb) box.append(fb); }
        }
      } else if (rec.type === 'conjecture') {
        const n = Number(c.state.flags[`${F}.n`] ?? 0);
        const predicted = typeof c.state.flags[`${F}.predict`] === 'number';
        const table = h('table', { class: 'pane-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'Points'), h('th', {}, 'Panes counted'), h('th', {}, 'Doubling rule says'))),
          h('tbody', {}, ...Array.from({ length: rec.angles.length }, (_, i) => i + 1).map((k) => h('tr', { class: k <= n && panes(k) !== 2 ** (k - 1) ? 'broke' : '' },
            h('td', {}, String(k)), h('td', {}, k <= n ? String(panes(k)) : '?'), h('td', {}, k <= n || k === rec.predictAt ? String(2 ** (k - 1)) : '')))));
        box.append(h('p', { class: 'fine' }, `Imre's rule: ${rec.claim}`),
          h('div', { class: 'conj-top' }, h('div', { class: 'glass-wrap' }, n ? glassWindow(rec.angles.slice(0, n), done) : h('div', { class: 'glass-empty' }, 'An empty frame')), table));
        if (n < rec.angles.length && !(n + 1 === rec.predictAt && !predicted)) {
          box.append(h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => { take(c.dispatch({ type: 'PuzzleAddPoint', puzzle: rec.id })); chime(ctx.settings.sfxVolume * 0.6); caption('amb.chime'); } }, n ? 'Add a point and join it with lead' : 'Put the first point on the circle')));
        } else if (n + 1 === rec.predictAt && !predicted) {
          box.append(h('h3', {}, `Before you add point ${rec.predictAt}: what do you expect?`), h('p', { class: 'fine' }, 'Any answer is fine. This is your guess, not a test.'),
            h('div', { class: 'options notice-options' }, ...rec.predictions.map((pr, i) => h('button', { type: 'button', onclick: () => take(c.dispatch({ type: 'PuzzlePredict', puzzle: rec.id, index: i })) }, h('span', { class: 'notice-text' }, pr.text)))));
        }
        if (n >= rec.predictAt && !done) {
          box.append(h('h3', {}, `${panes(rec.predictAt)} panes, not ${2 ** (rec.predictAt - 1)}. What does this show?`),
            h('div', { class: 'options notice-options' }, ...rec.reflect.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text)))));
        }
        if (done) {
          const f = chordFigure(rec.angles.slice(0, n));
          box.append(h('details', { class: 'proof-box', open: true }, h('summary', {}, 'Show me why (a proof)'),
            h('ol', {}, ...rec.proof.map((t) => h('li', {}, t))),
            h('p', { class: 'fair' }, `Your window now: 1 + ${f.chords} chords + ${f.crossings} crossings = ${1 + f.chords + f.crossings} panes.`)));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'sightlines') {
        const judged = (w: string, i: number) => c.state.flags[`${F}.c.${w}.${i}`] === true;
        const all = rec.witnesses.every((w) => w.claims.every((_, i) => judged(w.id, i)));
        const letters = 'ABCDEFGH';
        box.append(h('div', { class: 'sight-top' },
          sightMapSvg(rec, activeW, (id) => { activeW = id; this.sfx('sfx.click'); render(); }),
          h('div', { class: 'sight-legend' },
            h('p', { class: 'fine' }, 'Click a person on the map, or a name below.'),
            h('ul', {}, ...rec.spots.map((sp, i) => h('li', {}, h('strong', {}, `${letters[i]}: `), sp.label))),
            h('p', { class: 'fine' }, '━ Blue: a clear view. ✕ Orange: something is in the way.'))));
        box.append(h('div', { class: 'witness-grid' }, ...rec.witnesses.map((w) => h('div', { class: `witness-card ${activeW === w.id ? 'active' : ''}` },
          h('button', { type: 'button', class: 'who', style: { borderColor: w.colour }, 'aria-pressed': String(activeW === w.id), onclick: () => { activeW = w.id; render(); } },
            h('span', { class: 'dot', style: { background: w.colour } }), `${w.name}: draw sightlines`),
          ...w.claims.map((cl, i) => {
            const key = `${w.id}.${i}`;
            return h('div', { class: `claim ${judged(w.id, i) ? 'sorted' : ''}` }, h('p', {}, `“${cl.text}”`),
              judged(w.id, i) ? h('p', { class: 'fine' }, sightNotes.get(key) ?? 'Sorted.')
                : h('div', { class: 'row' },
                  ...([[true, 'Saw it'], [false, 'Could not see it']] as const).map(([saw, t]) => h('button', { type: 'button', onclick: () => {
                    const ev = c.dispatch({ type: 'PuzzleSight', puzzle: rec.id, witness: w.id, claim: i, saw });
                    const r = ev.find((e) => e.kind === 'puzzle') as Extract<GameEvent, { kind: 'puzzle' }> | undefined;
                    if (r?.ok) sightNotes.set(key, r.text);
                    activeW = w.id; take(ev);
                  } }, t))));
          })))));
        if (all) {
          const delivered = rec.reports.find((r) => r.delivery && r.delivery === c.state.flags[`${F}.delivery`])
            ?? rec.reports.find((r) => r.honest);
          if (done && delivered) box.append(h('h3', {}, 'On the rail'), h('p', { class: 'fair' }, delivered.text));
          box.append(h('h3', {}, done ? 'Send the account another way' : 'Where should the accounts go?'),
            h('div', { class: 'options notice-options' }, ...rec.reports.flatMap((r, index) => {
              if (done && (!r.honest || r === delivered)) return [];
              return [h('button', { type: 'button', onclick: () => {
                take(c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index }));
                if (r.honest) this.sfx('sfx.complete');
              } }, h('span', { class: 'notice-text' }, r.text))];
            })));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'restore') {
        const seen = Number(c.state.flags[`${F}.peeled`] ?? 0);
        const cur = c.state.flags[`${F}.method`];
        const curM = typeof cur === 'string' ? rec.methods.find((m) => m.id === cur) : undefined;
        if (!pickMethod && curM) pickMethod = curM.id;
        const pm = rec.methods.find((m) => m.id === pickMethod);
        const showFace = done && curM ? curM.face : pm && seen >= rec.layers.length ? pm.face : rec.face;
        box.append(h('div', { class: 'restore-top' },
          h('div', {}, h('p', { class: 'fine' }, done && curM ? `Now: ${curM.label}` : pm ? `Preview: ${pm.label}` : rec.object), plaqueSvg(showFace, rec.object)),
          h('div', {}, h('p', { class: 'fine' }, `Layers seen: ${Math.min(seen, rec.layers.length)} of ${rec.layers.length}`), layerStackSvg(rec.layers, seen, (done && curM ? curM : pm)?.loses ?? []))));
        if (seen < rec.layers.length) {
          box.append(h('h3', {}, 'Step 1. Look under each layer'),
            h('ul', { class: 'layer-notes' }, ...rec.layers.slice(0, seen).map((l) => h('li', {}, h('strong', {}, l.name), ` ${l.text}`))),
            h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => take(c.dispatch({ type: 'PuzzlePeel', puzzle: rec.id })) },
              seen === 0 ? 'Swab a small test patch' : 'Swab one layer deeper')));
        } else {
          box.append(h('details', { class: 'layer-notes-box' }, h('summary', {}, 'Your notes on each layer'),
            h('ul', { class: 'layer-notes' }, ...rec.layers.map((l) => h('li', {}, h('strong', {}, l.name), ` ${l.text}`)))));
          const name = (id: string) => rec.layers.find((l) => l.id === id)?.name ?? id;
          box.append(h('h3', {}, done ? 'Change the method?' : 'Step 2. Choose how to restore it'),
            h('p', { class: 'fine' }, 'Each method is allowed. Each keeps some layers and loses others. Think about the next person who looks at this plaque.'),
            h('div', { class: 'method-grid' }, ...rec.methods.map((m) => {
              const locked = !!curM && !curM.reversible && curM.id !== m.id;
              return h('button', { type: 'button', class: `method-card ${pickMethod === m.id ? 'picked' : ''}`, disabled: locked, 'aria-pressed': String(pickMethod === m.id),
                onclick: () => { pickMethod = m.id; feedback = null; this.sfx('sfx.click'); render(); } },
                h('strong', {}, m.label), h('span', {}, m.does),
                h('span', { class: 'keeps' }, `Keeps: ${m.keeps.map(name).join(', ') || 'nothing'}`),
                h('span', { class: 'loses' }, `Loses: ${m.loses.map(name).join(', ') || 'nothing'}`),
                h('span', { class: `rev ${m.reversible ? 'yes' : 'no'}` }, m.reversible ? '↺ Can be undone later' : '✕ Cannot be undone'),
                locked ? h('span', { class: 'fine' }, `Locked: ${curM!.label.toLowerCase()} cannot be undone.`) : '');
            })));
          if (pm && !(curM && curM.id === pm.id && done)) {
            box.append(h('h3', {}, 'Step 3. Choose the label for the gate'),
              h('p', { class: 'fine' }, 'Visitors will read this label. It must say what you kept and what you changed.'),
              h('div', { class: 'options notice-options' }, ...pm.labels.map((l, i) => h('button', { type: 'button',
                onclick: () => { const ev = c.dispatch({ type: 'PuzzleRestore', puzzle: rec.id, method: pm.id, label: i }); take(ev); if (c.state.flags[`${F}.method`] === pm.id) this.sfx('sfx.complete'); } },
                h('span', { class: 'notice-text' }, l.text)))));
          } else if (done && curM) {
            const lab = curM.labels[Number(c.state.flags[`${F}.label`] ?? 0)];
            box.append(h('p', { class: 'fair' }, `The plaque is back on the gate. Its label says: "${lab?.text ?? ''}"`));
          }
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else {
        const tile = (id: string) => rec.tiles.find((t) => t.id === id)!;
        box.append(h('div', { class: 'bridge', role: 'list', 'aria-label': 'Your citation, in order' },
          ...(placed.length ? placed : ['']).map((id, i) => id ? h('button', { type: 'button', role: 'listitem', class: `plank ${gapAt === i ? 'gap' : ''}`, title: 'Take this piece off', onclick: () => { placed.splice(i, 1); gapAt = null; feedback = null; render(); } }, tile(id).text)
            : h('span', { class: 'plank empty' }, 'Click the pieces below, in order.'))));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        box.append(h('h3', {}, 'Pieces'), h('div', { class: 'row wrap tiles' },
          ...pool.filter((t) => !placed.includes(t.id)).map((t) => h('button', { type: 'button', onclick: () => { placed.push(t.id); gapAt = null; render(); } }, t.text))),
          h('div', { class: 'row' },
            h('button', { class: 'primary', onclick: () => take(c.dispatch({ type: 'PuzzleOrder', puzzle: rec.id, order: [...placed] })) }, rec.words ? 'Light the timeline' : 'Test the bridge'),
            h('button', { onclick: () => { placed = []; gapAt = null; feedback = null; render(); } }, 'Start again')));
        if (done && feedback?.ok) box.append(h('p', { class: 'fair' }, rec.words ? 'The door is open.' : 'The bridge holds.'));
      }
    };
    render();
  }


  /**
   * The practice clue board (spec 47): tie evidence cards to claims with yarn.
   * Red yarn challenges Corvan's claim; gold yarn supports one of yours.
   */
  openClueBoard(boardId: string): void {
    const c = ctx.controller;
    const rec = (c.pack.clueBoards ?? []).find((x) => x.id === boardId);
    const sd = rec && c.pack.showdowns.find((x) => x.id === rec.showdown);
    if (!rec || !sd) return;
    const box = this.openModal('clue-panel wide', rec.title);
    let picked: string | null = null;
    let feedback: { tone: string; text: string } | null = null;
    const cardTitle = (id: string) => c.pack.cards.find((x) => x.id === id)?.title ?? id;
    const pinsNow = () => Object.keys(c.state.flags).filter((k) => k.startsWith(`yarn.${rec.id}.`) && c.state.flags[k] === true)
      .map((k) => { const [claim, ...card] = k.slice(`yarn.${rec.id}.`.length).split('.'); return { claim, card: card.join('.') }; });
    const render = () => {
      clear(box);
      const pins = pinsNow();
      const view = viewBoard(sd, pins);
      const claims = [{ id: OPPONENT, text: sd.opponentClaim.text, who: 'Corvan claims' }, ...sd.playerClaims.map((x) => ({ id: x.id, text: x.text, who: 'You could claim' }))];
      const cork = h('div', { class: 'cork' });
      const notes = h('div', { class: 'cork-claims' }, ...claims.map((cl) => {
        const v = view.claims[cl.id];
        const mine = pins.filter((p) => p.claim === cl.id);
        const extra = cl.id === OPPONENT ? h('ul', { class: 'cork-links' }, ...sd.opponentClaim.links.map((l) => h('li', { class: view.cracked.includes(l.id) ? 'cracked' : '' }, view.cracked.includes(l.id) ? `Cracked: ${l.text}` : l.text))) : null;
        return h('button', { type: 'button', class: `cork-note ${cl.id === OPPONENT ? 'theirs' : 'yours'} ${v.glow ? 'glow' : ''}`, 'data-claim': cl.id,
          'aria-label': `${cl.who}: ${cl.text}. ${v.taut} taut, ${v.sag} sagging.${v.glow ? ' Unsupported.' : ''}${picked ? ' Tie the picked card here.' : ''}`,
          onclick: () => {
            if (!picked) { feedback = { tone: 'sag', text: 'Pick a card first, then the claim to tie it to.' }; render(); return; }
            const ev = c.dispatch({ type: 'PinYarn', board: rec.id, claim: cl.id, card: picked });
            const y = ev.find((e) => e.kind === 'yarn') as Extract<GameEvent, { kind: 'yarn' }> | undefined;
            if (y) { feedback = { tone: y.tone, text: `${cardTitle(picked)}: ${y.text}` }; this.sfx(y.tone === 'taut' ? 'sfx.sparkle' : y.tone === 'sag' ? 'sfx.page' : 'sfx.click'); if (y.done) this.sfx('sfx.complete'); }
            picked = null; render();
          } },
          h('span', { class: 'pin' }), h('span', { class: 'fine' }, cl.who), h('strong', {}, cl.text), extra,
          mine.length ? h('span', { class: 'fine' }, `${v.taut} taut${v.sag ? `, ${v.sag} sagging` : ''}`) : h('span', { class: 'fine' }, v.glow ? 'Nothing holds it up yet.' : ''));
      }));
      const held = c.state.cards.filter((id) => c.pack.cards.some((x) => x.id === id));
      const cards = h('div', { class: 'cork-cards' }, ...held.map((id) => h('button', { type: 'button', class: `cork-card ${picked === id ? 'picked' : ''}`, 'data-card': id, 'aria-pressed': picked === id ? 'true' : 'false',
        onclick: () => { picked = picked === id ? null : id; this.sfx('sfx.pickup'); render(); } }, h('span', { class: 'pin' }), cardTitle(id))));
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'yarn-layer'); svg.setAttribute('aria-hidden', 'true');
      cork.append(notes, svg, cards);
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', {}, rec.intro));
      if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.tone === 'taut' ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
      box.append(h('p', { class: 'fine' }, picked ? `Picked: ${cardTitle(picked)}. Now click a claim.` : 'Click a card, then click a claim to tie yarn.'), cork);
      if (pins.length) box.append(h('h3', {}, 'Yarn on the board'), h('ul', { class: 'yarn-list' }, ...pins.map((p) => {
        const v = judgeYarn(sd, p.claim, p.card);
        return h('li', {}, `${v.tone === 'taut' ? 'Taut' : 'Sagging'} ${p.claim === OPPONENT ? 'red' : 'gold'} yarn: ${cardTitle(p.card)} to "${claims.find((x) => x.id === p.claim)?.text}" `,
          h('button', { type: 'button', class: 'link', onclick: () => { c.dispatch({ type: 'UnpinYarn', board: rec.id, claim: p.claim, card: p.card }); feedback = null; render(); } }, 'Untie'));
      })));
      if (view.done) box.append(h('p', { class: 'fair' }, 'Every link of Corvan\'s claim is cracked, and a fair claim of yours holds. You are ready for the Showdown, if you choose it.'));
      // Draw the yarn once the layout is known.
      requestAnimationFrame(() => {
        const base = cork.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`); svg.setAttribute('width', String(base.width)); svg.setAttribute('height', String(base.height));
        for (const p of pins) {
          const a = cork.querySelector(`[data-card="${CSS.escape(p.card)}"]`)?.getBoundingClientRect();
          const b = cork.querySelector(`[data-claim="${CSS.escape(p.claim)}"]`)?.getBoundingClientRect();
          if (!a || !b) continue;
          const x1 = a.left + a.width / 2 - base.left, y1 = a.top + 6 - base.top, x2 = b.left + b.width / 2 - base.left, y2 = b.bottom - 6 - base.top;
          const sag = judgeYarn(sd, p.claim, p.card).tone === 'sag' ? 70 : 6;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`);
          path.setAttribute('class', `yarn ${p.claim === OPPONENT ? 'red' : 'gold'} ${sag > 10 ? 'sag' : ''}`);
          svg.append(path);
        }
      });
    };
    render();
  }

  /**
   * A Loreling (spec 36.1): watch it, write a pattern note, wait where the note says.
   * After it is a friend: name it, take it into the field or leave it at camp.
   */
  openLoreling(lorelingId: string, sightingId?: string): void {
    const c = ctx.controller;
    const rec = c.pack.lorelings.find((x) => x.id === lorelingId);
    if (!rec) return;
    const F = `lor.${rec.id}`;
    let watched: string | null = null;
    if (sightingId && c.state.flags[`${F}.friend`] !== true) {
      const ev = c.dispatch({ type: 'LorelingWatch', loreling: rec.id, sighting: sightingId });
      const r = ev.find((e) => e.kind === 'loreling') as Extract<GameEvent, { kind: 'loreling' }> | undefined;
      if (r) { watched = sightingId; this.sfx('sfx.page'); }
    }
    const box = this.openModal('loreling-panel wide', rec.name);
    let feedback: { ok: boolean; text: string; recheck?: string | null } | null = null;
    const render = () => {
      const st = c.state;
      const friend = st.flags[`${F}.friend`] === true;
      const seen = rec.sightings.filter((x) => st.flags[`${F}.seen.${x.id}`] === true);
      clear(box);
      box.append(this.closeBtn(), h('div', { class: 'loreling-head' }, h('img', { class: 'moth-big',
        src: artURL(rec.fieldGuide?.portrait ?? 'moth.big'), alt: rec.fieldGuide?.portraitAlt ?? 'A tiny moth with pale gold wings.' }),
        h('div', {}, h('h2', {}, friend ? String(st.flags[`${F}.name`] ?? rec.name) : rec.name), h('p', { class: 'fine' }, `A Loreling of ${CONCEPT_NAMES[rec.concept]}. Lorelings are made up for this game.`))));
      if (!friend) {
        if (!seen.length || (watched && seen.length === 1)) box.append(h('p', {}, rec.intro));
        if (watched) {
          const sg = rec.sightings.find((x) => x.id === watched)!;
          box.append(h('div', { class: 'sighting now' }, h('strong', {}, `You watch at ${sg.place}. `), sg.text));
        }
        box.append(h('h3', {}, `Field notes (${seen.length} of ${rec.sightings.length} places)`),
          h('ul', { class: 'field-notes' }, ...rec.sightings.map((x) => {
            const got = seen.some((y) => y.id === x.id);
            return h('li', { class: `${got ? '' : 'unseen'} ${feedback?.recheck === x.id ? 'recheck' : ''}` }, got ? [h('strong', {}, `${x.place}: `), x.text] : `Not watched yet: ${x.place}.`);
          })));
        if (seen.length < rec.minSightings) {
          box.append(h('p', { class: 'fair' }, `Watch it in ${rec.minSightings - seen.length} more place${rec.minSightings - seen.length === 1 ? '' : 's'} before you write your pattern note. One sighting can mislead.`));
          return;
        }
        if (rec.questions.length) box.append(h('h3', {}, 'Your pattern note'), h('p', { class: 'fine' }, 'Choose the answer that fits every place you watched, not just one.'));
        for (const q of rec.questions) {
          const pick = st.flags[`${F}.note.${q.id}`];
          box.append(h('fieldset', { class: 'note-q' }, h('legend', {}, q.prompt), ...q.options.map((o) => h('button', {
            type: 'button', class: pick === o.id ? 'chosen' : '', 'aria-pressed': String(pick === o.id),
            onclick: () => { c.dispatch({ type: 'LorelingNote', loreling: rec.id, question: q.id, option: o.id }); this.sfx('sfx.click'); feedback = null; render(); },
          }, o.text))));
        }
        const ready = rec.questions.every((q) => st.flags[`${F}.note.${q.id}`]);
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (ready) {
          box.append(h('h3', {}, rec.offer.prompt), h('div', { class: 'options' }, ...rec.offer.options.map((o) => h('button', {
            type: 'button', onclick: () => {
              const ev = c.dispatch({ type: 'LorelingOffer', loreling: rec.id, place: o.id });
              const r = ev.find((e) => e.kind === 'loreling') as Extract<GameEvent, { kind: 'loreling' }> | undefined;
              if (r) { feedback = { ok: r.ok, text: r.text, recheck: r.recheck }; this.sfx(r.ok ? 'sfx.sparkle' : 'sfx.page'); if (r.ok) ctx.world?.lumenBurst(); }
              render();
            },
          }, o.text))));
        }
        return;
      }
      // A friend: name, form and field.
      if (feedback?.ok) box.append(h('div', { class: 'alcove-feedback ok', role: 'status' }, feedback.text));
      const g = lorelingForm(rec, c.pack, st.objectivesDone);
      const form = rec.forms[g.form - 1], next = rec.forms[g.form];
      box.append(h('p', {}, h('strong', {}, `Form ${g.form}: ${form.name}. `), form.power),
        next ? h('p', { class: 'fine' }, `Next form, ${next.name}: ${next.needs ?? ''} So far: ${g.worlds} world${g.worlds === 1 ? '' : 's'}, ${g.actions} kind${g.actions === 1 ? '' : 's'} of action.`) : '');
      const input = h('input', { type: 'text', maxlength: '16', value: String(st.flags[`${F}.name`] ?? rec.name), 'aria-label': 'Name' }) as HTMLInputElement;
      const setName = (n: string) => {
        const ev = c.dispatch({ type: 'LorelingName', loreling: rec.id, name: n });
        if (ev.some((e) => e.kind === 'loreling')) { this.sfx('sfx.sparkle'); feedback = null; render(); }
        else this.toast('A name has 1 to 16 letters, numbers or spaces.', 'info');
      };
      box.append(h('h3', {}, 'Give it a name'), h('div', { class: 'row wrap' }, ...rec.names.map((n) => h('button', { type: 'button', onclick: () => setName(n) }, n))),
        h('div', { class: 'row' }, input, h('button', { onclick: () => setName(input.value) }, 'Use this name')));
      const out = st.flags['lor.out'] === rec.id;
      box.append(h('h3', {}, 'In the field'), h('p', { class: 'fine' },
        out ? rec.fieldGuide?.activeText ?? 'It flies with you and looks for places you have not examined yet.'
          : 'It rests at camp. Lorelings never fight and never get hurt.'),
        h('button', { class: 'primary', onclick: () => { c.dispatch({ type: 'LorelingField', loreling: rec.id, out: !out }); render(); } }, out ? 'Let it rest at camp' : 'Take it into the field'));
    };
    render();
  }

  /** Exhibition Hall alcove (SYM-001): object, what it shows, and "so what?". */
  openAlcove(alcoveId: string): void {
    const c = ctx.controller;
    const rec = c.pack.alcoves.find((x) => x.id === alcoveId);
    if (!rec) return;
    const F = `alcove.${rec.id}`;
    const box = this.openModal('alcove-panel wide', rec.title);
    let feedback: { cls: string; text: string; who?: string } | null = null;
    const run = (cmd: any) => {
      const ev = c.dispatch(cmd);
      const r = ev.find((e) => e.kind === 'alcove') as Extract<GameEvent, { kind: 'alcove' }> | undefined;
      if (!r) return;
      const who = { mirage: 'Symbol Mirage', golem: 'Checklist Golem', sphinx: 'So-What Sphinx' }[r.result as string];
      feedback = { cls: r.result, text: r.text, who };
      this.sfx(['lit', 'ok'].includes(r.result) ? 'sfx.sparkle' : 'sfx.page');
      render();
    };
    const render = () => {
      const st = c.state;
      const item = st.flags[`${F}.item`] as string | undefined;
      const obj = rec.objects.find((o) => o.card === item);
      const linked = typeof st.flags[`${F}.link`] === 'number';
      const done = st.flags[`${F}.done`] === true;
      const lit = !!obj;
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, rec.title),
        h('p', { class: 'alcove-prompt' }, h('em', {}, 'Alcove card: '), rec.prompt),
        h('div', { class: `alcove-stage ${lit ? 'lit' : 'dark'} ${feedback?.cls ?? ''}`, role: 'img', 'aria-label': lit ? 'The alcove lamps are lit.' : 'The alcove lamps are dark.' },
          h('span', { class: 'lamp' }), h('span', { class: 'plinth' }, lit ? (c.pack.cards.find((x) => x.id === item)?.title ?? '') : feedback?.cls === 'mirage' ? '〰' : '—'), h('span', { class: 'lamp' })));
      if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.cls}`, role: 'status', 'aria-live': 'polite' }, feedback.who ? h('strong', {}, `${feedback.who}: `) : '', feedback.text));
      const cardBtns = st.cards.map((id) => c.pack.cards.find((x) => x.id === id)).filter(Boolean).map((card) =>
        h('button', { type: 'button', class: item === card!.id ? 'chosen' : '', onclick: () => run({ type: 'AlcovePlace', alcove: rec.id, item: card!.id }) }, card!.title));
      box.append(h('h3', {}, lit ? 'Change the object' : 'Stand something on the plinth'),
        h('div', { class: 'alcove-items' }, h('p', { class: 'fine' }, 'Your evidence cards'), h('div', { class: 'row wrap' }, ...cardBtns),
          h('p', { class: 'fine' }, 'Symbols'), h('div', { class: 'row wrap' }, ...rec.symbols.map((sy) => h('button', { type: 'button', class: 'symbol', onclick: () => run({ type: 'AlcovePlace', alcove: rec.id, item: sy.id }) }, sy.name)))));
      if (obj) {
        box.append(h('h3', {}, 'What knowledge does it show in the world?'), h('div', { class: 'options' },
          ...obj.links.map((l, i) => h('button', { type: 'button', class: st.flags[`${F}.link`] === i ? 'chosen' : '', onclick: () => run({ type: 'AlcoveLink', alcove: rec.id, index: i }) }, l.text))));
      }
      if (obj && linked) {
        box.append(h('h3', {}, 'The So-What Sphinx asks: so what?'), h('div', { class: 'options' },
          ...obj.implications.map((im, i) => h('button', { type: 'button', class: st.flags[`${F}.implication`] === i && done ? 'chosen' : '', onclick: () => run({ type: 'AlcoveImply', alcove: rec.id, index: i }) }, im.text))));
      }
      if (done) box.append(h('p', { class: 'fair' }, 'The alcove is complete. Your alcove card is in your portfolio. You can change the object and try another one.'));
    };
    render();
  }

  openLock(lockId: string): void {
    const c = ctx.controller;
    const rec = c.pack.locks.find((x) => x.id === lockId);
    if (!rec) return;
    const choice: Record<string, string> = {};
    for (const p of rec.parts) choice[p.id] = p.options[0].id;
    const preview = h('p', { class: 'label-preview', 'aria-live': 'polite' });
    const result = h('div', { class: 'label-result', role: 'status', 'aria-live': 'polite' });
    const update = () => { clear(preview); preview.append(rec.parts.map((p) => p.options.find((o) => o.id === choice[p.id])!.text).join(' ').replace(/\s+([?,.])/g, '$1')); };
    const ring = (p: TitleLockRecord['parts'][number]) => h('fieldset', {}, h('legend', {}, p.label),
      ...p.options.map((o) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name: `${rec.id}-${p.id}`, value: o.id, checked: choice[p.id] === o.id, onchange: () => { choice[p.id] = o.id; update(); } }), ` ${o.text}`)));
    const turn = () => {
      const ev = c.dispatch({ type: 'TurnLock', lock: rec.id, choice: { ...choice } });
      const r = (ev.find((e) => e.kind === 'lock') as Extract<GameEvent, { kind: 'lock' }> | undefined)?.result;
      if (!r) return;
      this.sfx(r.opened ? 'sfx.sparkle' : 'sfx.page');
      clear(result);
      result.append(h('p', { class: r.opened ? 'fair' : 'unfair' }, r.opened ? 'The lock opens.' : 'The rings slip back. The lock stays closed.'),
        ...r.lines.map((l) => h('p', {}, l)),
        r.opened ? h('p', { class: 'fine' }, 'Your practice question is in your portfolio. Talk to Archivist Tull for the next step.') : '');
      result.scrollIntoView({ block: 'nearest', behavior: ctx.settings.reducedMotion ? 'auto' : 'smooth' });
    };
    update();
    this.openModal('label-panel wide', rec.title, this.closeBtn(),
      h('h2', {}, `Title Lock: ${rec.title}`),
      h('p', {}, rec.intro),
      ...rec.parts.map(ring),
      h('h3', {}, 'Your question'), preview,
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: turn }, 'Turn the lock')),
      result);
  }

  // ------------------------------------------------- Provenance Thread (12.23)

  followThread(threadId: string, nodeId: string): void {
    const c = ctx.controller;
    const t = c.pack.threads.find((x) => x.id === threadId);
    if (!t) return;
    if (!c.state.inventory['tool.provenance-thread']) { this.toast('You need the Provenance Thread. Warden Ise gives it to Guardians on assignment.', 'info'); return; }
    const ev = c.dispatch({ type: 'FollowThread', thread: threadId, node: nodeId });
    const r = ev.find((e) => e.kind === 'thread') as Extract<GameEvent, { kind: 'thread' }> | undefined;
    if (!r) return;
    this.sfx('sfx.sparkle');
    const node = t.nodes.find((n) => n.id === nodeId)!;
    const next = t.nodes[t.nodes.indexOf(node) + 1];
    this.openModal('thread-panel', t.title, this.closeBtn(),
      h('h2', {}, `${t.title}: ${node.label}`),
      h('ol', { class: 'thread-steps' }, ...t.nodes.map((n) => h('li', { class: c.state.flags[`thread.${t.id}.${n.id}`] ? 'done' : '' }, n.label)),
        h('li', { class: `gap ${c.state.flags[`thread.${t.id}.gap`] ? 'done' : ''}` }, '?')),
      h('p', {}, r.text),
      r.gap ? h('p', { class: 'gap-text' }, r.gap) : next ? h('p', { class: 'fine' }, `The thread leads on to: ${next.label}.`) : '',
      h('p', { class: 'fine' }, h('strong', {}, 'What the thread cannot show: '), t.limit),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  // ------------------------------------------------------- forge (29.1 item 5)

  openForge(): void {
    const c = ctx.controller;
    if (!c.state.flags['heard.hesper']) { this.toast('This is Hesper\'s anvil. Talk to her first.', 'info'); return; }
    const log = h('ol', { class: 'history', 'aria-live': 'polite' });
    const art = h('div', { class: 'forge-art' });
    const status = h('p', { class: 'fine' });
    const btns = h('div', { class: 'forge-buttons' });
    const labels: Record<ForgeAction, string> = {
      stack: 'Stack a strip', weld: 'Weld the stack', twist: 'Twist', fold: 'Fold and weld',
      crucible: 'Load the crucible', melt: 'Heat until it melts', cool: 'Cool slowly', cut: 'Cut, polish and etch', reset: 'Start a new billet',
    };
    const render = () => {
      const f = c.state.forge;
      clear(art); art.append(this.billetCanvas());
      clear(status); status.append(f.route === 'none' ? 'The anvil is empty.' : f.route === 'pattern' ? `Pattern route: ${f.steels} strips${f.welded ? `, welded, ${layers(f)} layers` : ''}${f.twists ? `, ${f.twists} twist(s)` : ''}.${f.cut ? ' Cut.' : ''}` : `Crucible route: ${f.melted ? 'melted' : 'loaded'}${f.cooled ? ', cooled' : ''}.${f.cut ? ' Cut.' : ''}`);
    };
    const act = (a: ForgeAction) => {
      const ev = c.dispatch({ type: 'Forge', action: a });
      const r = ev.find((e) => e.kind === 'forge') as Extract<GameEvent, { kind: 'forge' }> | undefined;
      if (!r) return; // the error toast explains why
      this.sfx(a === 'cut' ? 'sfx.sparkle' : 'sfx.metal');
      log.append(h('li', {}, r.line));
      if (a === 'cut') log.append(h('li', { class: 'fair' }, 'Take the section to the assay table, east of the square, and compare it with the blade.'));
      render();
    };
    btns.append(
      h('fieldset', {}, h('legend', {}, 'Weld layers'), ...(['stack', 'weld', 'twist', 'fold'] as ForgeAction[]).map((a) => h('button', { onclick: () => act(a) }, labels[a]))),
      h('fieldset', {}, h('legend', {}, 'Sealed pot'), ...(['crucible', 'melt', 'cool'] as ForgeAction[]).map((a) => h('button', { onclick: () => act(a) }, labels[a]))),
      h('fieldset', {}, h('legend', {}, 'Finish'), ...(['cut', 'reset'] as ForgeAction[]).map((a) => h('button', { class: a === 'cut' ? 'primary' : '', onclick: () => act(a) }, labels[a]))));
    render();
    this.openModal('forge-panel wide', "Hesper's anvil", this.closeBtn(),
      h('h2', {}, "Hesper's anvil"),
      h('div', { class: 'chips' }, claimChip('simulation'), histChip('fictional-world')),
      h('p', { class: 'fine' }, 'Schematic only: this is not a working recipe. Make a small test billet by one route. Watch the pattern form, then cut it.'),
      h('div', { class: 'two-col' }, h('div', {}, art, status), btns), h('h3', {}, 'What happened'), log);
  }

  /** A drawing of the billet's cut face, made from what the player did. */
  private billetCanvas(): HTMLElement {
    const f = ctx.controller.state.forge;
    const W = 160, H = 64;
    const cv = h('canvas', { width: String(W), height: String(H), class: 'billet', role: 'img', 'aria-label': describeSection(f) }) as HTMLCanvasElement;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#1e2230'; g.fillRect(0, 0, W, H);
    if (f.route === 'pattern' && f.steels) {
      const n = Math.max(f.steels, layers(f) || f.steels);
      const band = (H - 8) / Math.min(n, 56);
      for (let x = 0; x < W - 16; x++) {
        for (let y = 0; y < H - 8; y++) {
          const curl = f.twists ? Math.sin((x / 9) + (y / 6) * f.twists) * 3 * f.twists : 0;
          const bend = f.folds ? Math.sin(x / 14) * 2 * f.folds : 0;
          const k = Math.floor((y + curl + bend) / band);
          g.fillStyle = k % 2 ? '#7a8496' : '#cfd6e2';
          g.fillRect(8 + x, 4 + y, 1, 1);
        }
      }
      if (!f.welded) { g.fillStyle = '#1e2230'; for (let i = 1; i < f.steels; i++) g.fillRect(8, 4 + i * ((H - 8) / f.steels), W - 16, 1); }
    } else if (f.route === 'crucible') {
      g.fillStyle = f.melted ? '#ff9a3a' : '#5a3a2a'; g.beginPath(); g.ellipse(W / 2, H / 2, 40, 24, 0, 0, Math.PI * 2); g.fill();
      if (f.cooled) {
        for (let x = -40; x < 40; x++) for (let y = -22; y < 22; y++) {
          if ((x * x) / 1600 + (y * y) / 484 > 1) continue;
          const v = Math.sin(x / 5 + Math.sin(y / 4) * 2);
          g.fillStyle = v > 0.3 ? '#aab3c4' : '#7a8496'; g.fillRect(W / 2 + x, H / 2 + y, 1, 1);
        }
      }
    } else {
      g.fillStyle = '#ffffff22'; g.fillRect(8, H / 2 - 2, W - 16, 4);
    }
    return cv;
  }

  openAssay(exhibitId: string): void {
    const c = ctx.controller;
    const ex = c.pack.exhibits.find((x) => x.id === exhibitId)!;
    c.dispatch({ type: 'InspectExhibit', exhibit: exhibitId });
    const out = h('div', { role: 'status', 'aria-live': 'polite' });
    const f = c.state.forge;
    const compare = () => {
      const ev = c.dispatch({ type: 'CompareAssay' });
      const r = ev.find((e) => e.kind === 'compare') as Extract<GameEvent, { kind: 'compare' }> | undefined;
      if (!r) return;
      this.sfx('sfx.metal');
      clear(out); out.append(h('p', { class: r.match ? 'fair' : 'unfair' }, r.match ? 'They match.' : 'They differ.'), h('p', {}, r.line));
    };
    this.openModal('assay-panel wide', ex.name, this.closeBtn(),
      h('h2', {}, ex.name), h('div', { class: 'chips' }, histChip(ex.historicalLabel)),
      h('div', { class: 'two-col' },
        h('figure', {}, h('img', { class: 'big-art', src: artURL('big.assay'), alt: ex.altText }), h('figcaption', {}, 'The blade: etched section (schematic).')),
        h('figure', {}, this.billetCanvas(), h('figcaption', {}, f.cut ? `Your billet: ${describeSection(f)}` : 'Your billet: not cut yet. Forge and cut one at Hesper\'s anvil.'))),
      h('p', {}, ex.summary),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, disabled: !f.cut, onclick: compare }, 'Compare my billet with the blade')),
      out);
  }

  // ------------------------------------------------------------ Showdown (12.24)

  openShowdown(id: string): void {
    const c = ctx.controller;
    const rec = c.pack.showdowns.find((x) => x.id === id);
    if (!rec) return;
    c.dispatch({ type: 'ShowdownStart', showdown: id, relaxed: ctx.settings.zenMode });
    const box = this.openModal('showdown wide', rec.title);
    // Touch screens cannot show hover titles, so move explanations start visible there (phone pass).
    let explain = (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
    const opp = c.pack.characters.find((x) => x.id === rec.opponent);
    const move = (m: ShowdownMove) => { c.dispatch({ type: 'ShowdownMove', move: m }); this.sfx('sfx.click'); render(); };
    const pick = (label: string, opts: { v: string; t: string }[], go: (v: string) => void) => {
      const sel = h('select', { 'aria-label': label }, h('option', { value: '' }, `${label}…`), ...opts.map((o) => h('option', { value: o.v }, o.t))) as HTMLSelectElement;
      sel.addEventListener('change', () => { if (sel.value) go(sel.value); });
      return sel;
    };
    const render = () => {
      const sd = c.state.showdown as ShowdownState;
      clear(box);
      const myClaim = rec.playerClaims.find((x) => x.id === sd.claim);
      const cards = c.state.cards.map((cid) => ({ v: cid, t: c.pack.cards.find((x) => x.id === cid)?.title ?? cid }));
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', { class: 'fine' }, `${rec.place}. No timer. ${sd.relaxed ? 'Zen mode: the crowd waits as long as you like. ' : ''}Each move says why it worked or not.`),
        h('div', { class: 'crowd', role: 'img', 'aria-label': `Crowd trust: you ${sd.trust.player}, ${opp?.name} ${sd.trust.opponent}` },
          h('span', {}, 'You'), h('span', { class: 'bar' }, h('i', { style: { width: `${sd.trust.player}%` } })), h('span', {}, String(sd.trust.player)),
          h('span', {}, opp?.name ?? ''), h('span', { class: 'bar opp' }, h('i', { style: { width: `${sd.trust.opponent}%` } })), h('span', {}, String(sd.trust.opponent))),
        h('div', { class: 'two-col' },
          h('section', {}, h('h3', {}, `${opp?.name ?? 'Opponent'} claims`),
            h('p', { class: 'claim-text' }, `“${sd.narrowed ? rec.opponentClaim.narrowed : rec.opponentClaim.text}”`, rec.opponentClaim.seal && !sd.sealShown ? h('span', { class: 'seal', title: 'A gold mark. What is under it?' }, ' ◉') : ''),
            h('ul', { class: 'links' }, ...rec.opponentClaim.links.map((l) => h('li', { class: sd.cracked.includes(l.id) ? 'cracked' : '' }, sd.cracked.includes(l.id) ? '✗ ' : '— ', l.text)))),
          h('section', {}, h('h3', {}, 'Your claim'),
            myClaim ? h('p', { class: 'claim-text' }, `“${myClaim.text}”`) : h('p', { class: 'fine' }, 'Not placed yet.'),
            myClaim ? h('p', { class: sd.force > sd.support ? 'unfair' : 'fair' }, `Force ${sd.force} · Support ${sd.support}`) : null)),
        h('ol', { class: 'sd-log', 'aria-live': 'polite' }, ...sd.log.slice(-8).map((l) => h('li', { class: `who-${l.who}` }, l.text, l.why ? h('small', {}, ` ${l.why}`) : ''))));
      if (sd.outcome) {
        box.append(h('h3', {}, `Outcome: ${sd.outcome.replace('-', ' ')}`), h('p', {}, rec.outcomes[sd.outcome].text),
          h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Leave the square')));
        this.sfx('sfx.complete');
        return;
      }
      if (!sd.claim) {
        box.append(h('h3', {}, 'Choose your claim'), h('div', { class: 'options' }, ...rec.playerClaims.map((pc, i) =>
          h('button', { 'data-autofocus': i === 0, title: MOVE_HELP.claim, onclick: () => move({ move: 'claim', claim: pc.id }) }, h('em', {}, `Force ${pc.force}: `), pc.text))));
        return;
      }
      const wit = rec.witnesses.filter((w) => !sd.used.includes(`witness:${w.id}`) && c.check(w.if));
      const mv = (k: keyof typeof MOVE_HELP, label: string, m: ShowdownMove, cls = '') =>
        h('button', { class: cls, title: MOVE_HELP[k], onclick: () => move(m) }, label, h('small', { class: 'move-desc' }, MOVE_HELP[k]));
      box.classList.toggle('explain', explain);
      if (sd.testimony === 'open') {
        box.append(h('div', { class: 'objection', role: 'alert' }, h('strong', {}, 'A new statement! '),
          `${opp?.name ?? 'The opponent'} just said something new. If a card you hold contradicts it, present it now. You can also let it pass.`,
          h('div', { class: 'row' }, pick('Present a card', cards, (v) => move({ move: 'present', card: v })))));
      }
      box.append(h('div', { class: 'row move-head' }, h('h3', {}, 'Your move'),
        h('button', { class: 'link-btn', 'aria-pressed': String(explain), onclick: () => { explain = !explain; render(); } }, explain ? 'Hide what moves do' : 'Explain the moves')),
        h('div', { class: 'moves' },
        pick('Support with a card', cards.filter((x) => !sd.used.includes(x.v)), (v) => move({ move: 'support', card: v })),
        h('span', { class: 'move-pair' },
          pick('Challenge a link', rec.opponentClaim.links.filter((l) => !sd.cracked.includes(l.id)).map((l) => ({ v: l.id, t: l.text })), (v) => {
            const s2 = h('div', { class: 'row' }, h('span', {}, 'With which card?'), pick('Card', cards, (cv) => move({ move: 'challenge', link: v, card: cv })));
            box.querySelector('.move-pair')!.append(s2);
          })),
        pick('Counterexample', cards, (v) => move({ move: 'counter', card: v })),
        wit.length ? pick('Call a witness', wit.map((w) => ({ v: w.id, t: w.name })), (v) => move({ move: 'witness', witness: v })) : '',
        mv('qualify', 'Qualify my claim', { move: 'qualify' }),
        mv('reframe', 'Reframe the question', { move: 'reframe' }),
        sd.openPoint ? mv('concede', 'Concede the fair point', { move: 'concede' }, 'primary') : '',
        mv('source', 'Ask for the source', { move: 'source' }),
        mv('attack', 'Attack the person', { move: 'attack' }, 'cheap'),
        mv('shout', 'Shout louder', { move: 'shout' }, 'cheap'),
        mv('rest', 'Rest my case', { move: 'rest' }, 'primary')),
        h('p', { class: 'fine' }, 'Hover a move, or use "Explain the moves", to see what each one does. Cheap shots never damage a claim.'));
      const logEl = box.querySelector('.sd-log'); if (logEl) logEl.scrollTop = logEl.scrollHeight;
      if (sd.claim) box.scrollTop = box.scrollHeight;
    };
    render();
  }

  // ------------------------------------------------------------- Waystone (38.7)

  /** A short, optional breathing pause at a Waystone (Balanced, spec 90; Zen and explorer mode, 47.4). */
  openBreathing(): void {
    const c = ctx.controller;
    const still = ctx.settings.reducedMotion;
    const orb = h('div', { class: `breath-orb ${still ? 'still' : ''}`, 'aria-hidden': 'true' });
    const say = h('p', { class: 'breath-say', 'aria-live': 'polite' }, 'Sit. Let your shoulders drop.');
    const box = this.openModal('breath-panel', 'Sit a while', this.closeBtn(), h('h2', {}, 'Sit a while'),
      h('p', { class: 'fine' }, 'Three slow breaths by the Waystone. Close this at any time.'), orb, say);
    let n = 0;
    const timers: number[] = [];
    const step = () => {
      if (!box.isConnected) { timers.forEach(clearTimeout); return; }
      if (n >= 6) {
        say.textContent = 'Done. The square is still there when you are ready.';
        orb.classList.remove('in', 'out');
        c.dispatch({ type: 'SetFlag', flag: 'zen.sat', value: true });
        c.dispatch({ type: 'SetFlag', flag: 'count.sit', value: Number(c.state.flags['count.sit'] ?? 0) + 1 });
        box.append(h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Go on')));
        (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
        return;
      }
      const inhale = n % 2 === 0;
      say.textContent = inhale ? `Breathe in… (${n / 2 + 1} of 3)` : 'Breathe out…';
      orb.classList.toggle('in', inhale); orb.classList.toggle('out', !inhale);
      if (inhale) { chime(ctx.settings.sfxVolume * 0.5); caption('amb.chime'); }
      n++;
      timers.push(window.setTimeout(step, 4000));
    };
    timers.push(window.setTimeout(step, 800));
  }

  openWaystone(place: string): void {
    const c = ctx.controller;
    c.dispatch({ type: 'Rest', place });
    // Campfire log (spec 47.10, C1): one short, optional prompt about the latest step. Never graded.
    const lastId = [...c.state.objectivesDone].reverse()[0];
    const last = c.pack.missions.flatMap((m) => m.objectives).find((o) => o.id === lastId);
    const prompts = last
      ? [`What helped you with this step: "${last.title}"?`, 'What would you do differently next time?', 'What are you still not sure about?']
      : ['What are you thinking about right now?'];
    const prompt = prompts[Number(c.state.flags['count.rests'] ?? 0) % prompts.length];
    const ta = h('textarea', { rows: '3', 'aria-label': `Campfire log (optional): ${prompt}`, placeholder: 'Optional. Write in your own words. Nobody grades this.' }) as HTMLTextAreaElement;
    const r = c.recap();
    this.openModal('waystone-panel', 'Waystone', this.closeBtn(),
      h('h2', {}, 'Waystone'),
      h('p', {}, 'The Waystone hums softly. Your progress is saved here. Resting is never required, and nothing is lost if you keep going.'),
      h('ul', {}, ...r.lines.slice(1).map((l) => h('li', {}, l))),
      h('p', { class: 'hint-text' }, h('strong', {}, 'Campfire log: '), prompt), ta,
      h('div', { class: 'row' },
        h('button', { class: 'primary', 'data-autofocus': true, onclick: () => {
          if (ta.value.length) {
            if (c.dispatch({ type: 'AddNote', kind: 'reflection', text: `Campfire log: ${prompt}\n${ta.value}` }).some(({ kind }) => kind === 'error')) return;
            if (lastId) c.dispatch({ type: 'SetFlag', flag: `log.${lastId}`, value: true });
            queueJournalWriting(c);
            flushJournalWriting(c);
          }
          this.closeModal();
          const mine = String(c.state.flags['musicbox.song'] ?? '').split(',').filter(Boolean);
          if (mine.length) { playNotes(songNotes(mine), Number(c.state.flags['musicbox.tempo'] ?? 0.32), (c.state.flags['musicbox.voice'] as any) ?? 'box', ctx.settings.sfxVolume * 0.6); caption('music.box'); }
        } }, 'Rest and go on'),
        h('button', { onclick: () => this.openBreathing() }, 'Sit a while'),
        h('button', { onclick: () => this.openTalents(true) }, 'Insight tree'),
        h('button', { onclick: () => this.openRoles(true) }, 'Knower role'),
        this.saveControl()));
  }

  // ------------------------------------------------- share with teacher (94)

  /**
   * The student's own progress file (TEACH-003: least data; TEACH-005: the
   * student sees all of it first). Notes and private journal entries are never
   * in it. Portfolio entries are included only when the student shared them.
   */
  progressExport(): Record<string, unknown> {
    const c = ctx.controller, s = c.state, p = c.permanent;
    const now = new Date().toISOString();
    return {
      format: 'knowledge-guardians-progress', version: 1, exportedAt: now,
      player: s.player.name, content: `${c.pack.id} v${c.pack.contentVersion}`,
      objectivesDone: s.objectivesDone,
      awards: Object.keys(p.awards), conceptXP: conceptXP(p, c.pack), totalXP: totalXP(p),
      moments: Object.fromEntries(Object.entries(p.moments).map(([id, at]) => [id, { attribute: c.pack.moments.find((m) => m.id === id)?.attribute, at }])),
      met: p.met,
      misconceptions: studentAlerts(p, c.pack, now).map((a) => ({ id: a.misconception.id, title: a.misconception.title, count: a.count, level: a.level })),
      portfolio: p.portfolio.filter((e) => e.shared).map(({ id, at, world, kind, title, text, reflection }) => ({ id, at, world, kind, title, text, reflection })),
      skills: Object.fromEntries(Object.entries(p.skills ?? {}).map(([id, u]) => [id, skillStage(u)]).filter(([, st]) => st !== 'unseen')),
    };
  }

  private openShare(): void {
    const data = this.progressExport();
    const json = JSON.stringify(data, null, 2);
    const download = () => {
      const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: `kg-progress-${String(data.player).replace(/[^\w-]+/g, '_')}.json` }) as HTMLAnchorElement;
      document.body.append(a); a.click(); a.remove();
      this.toast('Progress file saved. Give it to your teacher if you want to.', 'save');
    };
    const shared = (data.portfolio as unknown[]).length;
    this.openModal('share wide', 'Share with my teacher', this.closeBtn(), h('h2', {}, 'Share with my teacher'),
      h('p', {}, 'This makes a file on this device. Nothing is sent anywhere. You choose whether to give it to your teacher.'),
      h('ul', {},
        h('li', {}, 'In the file: your Guardian name, the steps and awards you finished, your concept XP, your learner-profile moments, which concepts, ATL skills and subjects you met, and any pattern that Lumen noticed.'),
        h('li', {}, `Portfolio entries you chose to share: ${shared}. Change this in the Portfolio tab.`),
        h('li', {}, 'NOT in the file: your notes, your journal, your unshared portfolio entries, your choices in conversations.')),
      h('details', {}, h('summary', {}, 'See everything in the file'), h('pre', { class: 'json' }, json)),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: download }, 'Save the file'), h('button', { onclick: () => this.closeModal() }, 'Cancel')));
  }

  // --------------------------------------------------- journal & bag

  openJournal(tab = 'diary'): void {
    if (!ctx.controller.state) return;
    this.sfx('sfx.book');
    if (tab === 'letters') this.deliverCommunityLetters(false);
    const c = ctx.controller, s = c.state;
    const tabs: Record<string, string> = { diary: 'Diary', notes: 'My notes', 'open-quests': 'Open quests', story: 'Story so far', conversations: 'Conversations', entries: 'Entries', cards: 'Evidence cards', moments: 'Moments', portfolio: 'Portfolio', atlas: 'Atlas', skills: 'Skill Atlas', lorelings: 'Lorelings', bestiary: 'Fray Bestiary', stones: 'Question Stones', lore: 'Lore', letters: 'Letters', crossings: 'Crossings', ...(s.flags['ending.council'] ? { afterwards: 'Afterwards' } : {}), glossary: 'Glossary', awards: 'Awards and XP', sources: 'Sources' };
    const body = h('div', { class: 'tab-body' });
    const nav = h('div', { class: 'tabs', role: 'tablist' }, ...Object.entries(tabs).map(([k, l]) => h('button', { role: 'tab', 'aria-selected': String(k === tab), onclick: () => this.openJournal(k) }, l)));
    if (tab === 'diary' || tab === 'notes' || tab === 'open-quests') {
      body.append(adventureJournalTab(tab, c, (page) => this.openJournal(page)));
    } else if (tab === 'crossings') {
      // Conflicts met in the world, and how the player met them.
      const met = CROSSINGS.filter((x) => crossingWay(s.flags, x.id));
      const ep = crossingEpithet(s.flags);
      body.append(h('p', { class: 'fine' }, met.length ? `${met.length} of ${CROSSINGS.length} crossings met. Each had more than one way through.` : 'No crossings yet. Problems wait in every world: floods, machines, crowds, old stories.'),
        ...(ep ? [h('p', {}, `People have started to call you ${s.player.name} ${ep}.`), h('div', { class: 'row' }, h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'title.worn', value: ep }); this.refreshHud(); this.openJournal('crossings'); } }, `Wear the name "${ep}"`))] : []),
        ...met.map((x) => { const w = crossingWay(s.flags, x.id)!; return h('div', { class: 'lore-entry' }, h('h3', {}, x.title), h('p', { class: 'fine' }, `Chapter ${x.chapter} · ${WAY_LABEL[w.kind]}`), h('p', {}, w.result), h('p', { class: 'fine' }, `Cost: ${w.cost}`)); }));
    } else if (tab === 'afterwards') {
      // The epilogue: where are they now, the mirror scene and the lingering thought.
      body.append(h('h3', {}, 'Where are they now'), ...vignettesFor(s).map((v) => h('div', { class: 'lore-entry' }, h('h3', {}, v.who), h('p', {}, v.text))),
        h('h3', {}, 'The same bench'), h('p', {}, mirror(s)), h('h3', {}, 'Last words'), ...lingering(s).map((t) => h('p', {}, t)),
        h('button', { type: 'button', onclick: () => this.openCredits() }, 'Credits from your journey'));
    } else if (tab === 'conversations') {
      const heard = conversationHistory(c.pack.dialogue, s.flags);
      if (!heard.length) body.append(h('p', {}, 'No conversations yet.'));
      else {
        let shown = 0;
        const lines = h('div', {});
        const more = h('button', { type: 'button', onclick: showOlder }, 'Show earlier conversations');
        const ui = this;
        function showOlder() {
          const older = heard.slice(shown, shown + 20);
          lines.append(...older.map((node) => ui.dialogueMemory(node, true)));
          shown += older.length;
          more.hidden = shown >= heard.length;
        }
        body.append(h('p', { class: 'fine' }, 'Scenes are listed once, newest first by when you first heard them.'), lines, more);
        showOlder();
      }
    } else if (tab === 'letters') {
      const gold = arrivedLetters(s);
      const neighbours = receivedCommunityLetters(s);
      if (!gold.length && !neighbours.length) body.append(h('p', {}, 'No letters yet.'));
      if (neighbours.length) body.append(h('h3', {}, 'From the road'), ...neighbours.reverse().map((letter) => {
        const sender = c.pack.characters.find((character) => character.id === letter.sender)?.name;
        return h('div', { class: 'lore-entry letter' }, h('h3', {}, letter.subject), h('p', { class: 'fine' }, `From ${sender}`), h('p', {}, letter.body));
      }));
      if (gold.length) body.append(h('h3', {}, 'The gold seal'),
        ...[...gold].reverse().map((l) => h('div', { class: 'lore-entry letter' }, h('h3', {}, `After chapter ${l.chapter}`), ...composeLetter(l, s).map((t) => h('p', {}, t)))));
    } else if (tab === 'lore') {
      // Lore codex: secrets found by exploring. Each is a small myth or record that asks a knowledge question.
      const all = c.pack.secrets ?? [];
      const found = all.filter((x) => s.flags[`secret.${x.id}`] === true);
      body.append(h('p', { class: 'fine' }, `${found.length} of ${all.length} secrets found. Search odd corners: loose bricks, reeds, the bottom of things.`),
        ...found.map((x) => h('div', { class: 'lore-entry' }, h('h3', {}, x.name), h('p', { class: 'fine' }, MAPS[x.map]?.name ?? ''), h('p', {}, x.text))));
      const games = FIELD_GAMES.filter((g) => s.flags[`field.${g.id}.done`] === true);
      if (games.length) body.append(h('h3', {}, 'Field games'),
        ...games.map((g) => h('div', { class: 'lore-entry' }, h('h3', {}, g.name), h('p', { class: 'fine' }, g.host), h('p', {}, g.idea),
          ...(g.id === 'word' && coinageOf(s.flags['word.coined']) ? [h('p', { class: 'fine' }, `Your word: '${coinageOf(s.flags['word.coined'])!.word}', ${coinageOf(s.flags['word.coined'])!.meaning}.`)] : []))));
    } else if (tab === 'story') {
      // The story so far: the beats the player has reached, written as a short chronicle.
      const lit = String(Number(s.flags['lamps.lit'] ?? 0));
      const beats = (c.pack.chronicle ?? []).filter((b) => c.check(b.if));
      body.append(h('ol', { class: 'chronicle' }, ...beats.map((b) => h('li', {}, h('h3', {}, b.title), h('p', {}, b.text.replace('{lamps}', lit))))));
      const next = (c.pack.chronicle ?? []).find((b) => !c.check(b.if));
      if (next) body.append(h('p', { class: 'fine' }, 'The story goes on. Your current steps are in the quest panel.'));
    } else if (tab === 'entries') {
      body.append(h('ol', { class: 'journal' }, ...s.journal.map((id) => {
        const j = c.pack.journal.find((x) => x.id === id)!;
        return h('li', {}, j.claimKind ? claimChip(j.claimKind) : null, ' ', j.text);
      })));
      if (!s.journal.length) body.append(h('p', {}, 'No entries yet.'));
    } else if (tab === 'cards') {
      const cards = journalEvidence(c.pack, s);
      body.append(...cards.map(({ card, includeSources }) => this.cardView(card, includeSources)));
      if (!cards.length) body.append(h('p', {}, 'Talk to people and earn objects to add evidence here.'));
    } else if (tab === 'moments') {
      // Learner profile (spec 90): moments, never scores or grades (PROFILE-001).
      const got = c.pack.moments.filter((m) => c.permanent.moments[m.id]);
      body.append(h('p', { class: 'fine' }, 'Moments when you acted like the IB learner profile describes. These are not scores. Nobody is ranked.'));
      if (!got.length) body.append(h('p', {}, 'No moments yet. They appear as you play.'));
      body.append(h('ul', { class: 'moments' }, ...got.map((m) => h('li', {}, h('strong', {}, `${PROFILE_NAMES[m.attribute]}: `), m.did,
        m.prompt ? h('br', {}) : '', m.prompt ? h('small', { class: 'fine' }, `To think about: ${m.prompt}`) : ''))));
    } else if (tab === 'portfolio') {
      // Evidence portfolio (spec 94.4): private, owned by the student, shared only by choice.
      const list = [...c.permanent.portfolio].reverse();
      body.append(h('p', { class: 'fine' }, 'Your portfolio is private. An entry goes to your teacher only if you tick "Share" and then save a progress file (Menu, Share with my teacher).'));
      if (!list.length) body.append(h('p', {}, 'No entries yet. Labels, Showdowns and tests add entries.'));
      for (const e of list) {
        const ta = h('textarea', { rows: '2', 'aria-label': `Reflection on ${e.title}`, placeholder: 'Add a reflection (optional)' });
        const current = c.state.adventureDiary.portfolioWriting?.[e.id];
        ta.value = current?.text ?? e.reflection;
        let edited = ta.value;
        let changedInPanel = false;
        const status = h('p', { class: 'fine', role: 'status' });
        const draft = (text: string) => {
          if (text === edited) return;
          if (c.dispatch({ type: 'SetDiaryPortfolioDraft', entry: e.id, text }).some(({ kind }) => kind === 'error')) return;
          edited = text;
          changedInPanel = true;
          queueJournalWriting(c, status);
        };
        bindJournalEditor(ta, draft, () => {
          if (changedInPanel && !c.dispatch({ type: 'PortfolioReflect', entry: e.id, text: edited }).some(({ kind }) => kind === 'error')) {
            changedInPanel = false;
            queueJournalWriting(c, status);
          }
          flushJournalWriting(c);
        });
        const attach = !current && e.reflection ? h('button', { type: 'button', onclick: () => {
          if (c.state.adventureDiary.portfolioWriting?.[e.id]
            || c.dispatch({ type: 'SetDiaryPortfolioDraft', entry: e.id, text: edited, attach: true }).some(({ kind }) => kind === 'error')) return;
          attach!.disabled = true;
          queueJournalWriting(c, status);
          flushJournalWriting(c);
        } }, 'Add this reflection to this adventure’s journal') : null;
        body.append(h('article', { class: 'card' }, h('h3', {}, e.title), h('p', { class: 'fine' }, `${new Date(e.at).toLocaleString()} · ${e.world}`), h('p', {}, e.text), conceptEditor(ta), attach, status,
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: e.shared, onchange: (ev: Event) => c.dispatch({ type: 'PortfolioShare', entry: e.id, shared: (ev.target as HTMLInputElement).checked }) }), ' Share with my teacher')));
      }
    } else if (tab === 'skills') {
      // Skill Atlas (spec 76.1): practice in the game, never a grade or a rank.
      const p = c.permanent;
      const icon: Record<SkillStage, string> = { unseen: '○', seen: '◔', practised: '◑', confident: '◕', transferred: '●' };
      body.append(h('p', { class: 'fine' }, 'Each skill grows when you use it somewhere new: Seen, Practised, Confident, Transferred. This shows practice in the game. It is not a grade.'),
        h('div', { class: 'skill-map' }, ...c.pack.skillDomains.flatMap((d) => {
          const list = c.pack.skills.filter((k) => k.domain === d.id && (k.domain !== MICRO_SKILL_DOMAIN || p.skills?.[k.id]?.length));
          if (d.id === MICRO_SKILL_DOMAIN && !list.length) return [];
          return [h('section', { class: `skill-region ${list.length ? '' : 'later'}` }, h('h4', {}, d.name),
            list.length ? h('ul', {}, ...list.map((k) => {
              const st = skillStage(p.skills?.[k.id]);
              return h('li', { class: `stage-${st}`, title: nextStep(p.skills?.[k.id]) }, h('span', { class: 'stage-icon', 'aria-hidden': 'true' }, icon[st]), ` ${k.name} `, h('small', {}, STAGE_LABEL[st]));
            })) : h('p', { class: 'fine' }, 'In later chapters.'))];
        })));
    } else if (tab === 'lorelings') {
      // Loreling Atlas (spec 36.1): friends, and the others that live in later worlds.
      const friends = c.pack.lorelings.filter((l) => s.flags[`lor.${l.id}.friend`] === true);
      body.append(h('p', { class: 'fine' }, 'Lorelings are small made-up creatures that live where knowledge is strong. You befriend one by watching it carefully, never by catching it.'),
        h('ul', { class: 'loreling-atlas' }, ...c.pack.lorelingAtlas.map((a) => {
          const rec = c.pack.lorelings.find((l) => l.name === a.name);
          const friend = rec && friends.includes(rec);
          const met = rec && Number(s.flags[`lor.${rec.id}.seenCount`] ?? 0) > 0;
          return h('li', { class: friend ? 'friend' : met ? 'met' : 'unknown' },
            friend || met ? h('img', { src: artURL('moth.big'), alt: '' }) : h('span', { class: 'silhouette', 'aria-hidden': 'true' }, '?'),
            h('div', {}, h('strong', {}, friend ? `${String(s.flags[`lor.${rec!.id}.name`] ?? a.name)} (${a.name})` : met ? a.name : '???'), h('br', {}),
              h('small', {}, `${CONCEPT_NAMES[a.concept]}${friend || met ? `: ${a.power}` : ''}`),
              friend ? h('button', { class: 'mini', onclick: () => this.openLoreling(rec!.id) }, 'Visit') : ''));
        })));
    } else if (tab === 'bestiary') {
      // Fray Bestiary (spec 36.2): a living vocabulary book of reasoning errors, filled in by play.
      const PLACE: Record<string, string> = { 'nexus.archive': 'the Nexus archive hall', 'aethelgard.emberford': 'Emberford' };
      const met = c.pack.fray.filter((f) => s.flags[`fray.${f.id}`] !== undefined);
      body.append(h('p', { class: 'fine' }, `Fray creatures are errors in reasoning, shown as monsters. A page fills in the first time you meet one. You have met ${met.length} of ${c.pack.fray.length}.`),
        h('ul', { class: 'bestiary' }, ...c.pack.fray.map((f) => {
          const at = s.flags[`fray.${f.id}`];
          if (at === undefined) return h('li', { class: 'unknown' }, h('strong', {}, '???'), h('br', {}), h('small', {}, f.chapter ? 'You can meet this one in this chapter.' : 'In later chapters.'));
          const n = Number(s.flags[`fray.${f.id}.n`] ?? 1);
          return h('li', {}, h('strong', {}, f.name), ' ', h('span', { class: 'chip' }, f.error), h('p', {}, f.pattern), h('p', {}, h('strong', {}, 'Weakness: '), f.weakness),
            h('small', { class: 'fine' }, `First met in ${PLACE[String(at)] ?? at}. Met ${n} time${n === 1 ? '' : 's'}.`));
        })));
    } else if (tab === 'stones') {
      // Question Stones (KQ-003): a stone gets brighter with each new way of meeting the question. Never a quiz.
      const ACTION: Record<string, string> = { ...ROUTE_ACTIONS, label: 'a label', exhibition: 'a museum plaque', test: 'a fair test', showdown: 'a Showdown', thread: 'a Provenance Thread', forge: 'the forge', reflection: 'a mystery', research: 'an investigation', community: 'listening to a community', fieldwork: 'fieldwork', trace: 'following a source' };
      const worlds = new Map<string, string>([['WORLD-01', 'the Nexus'], ['WORLD-02', 'Emberford']]);
      for (const map of Object.values(MAPS)) if (!worlds.has(map.world)) worlds.set(map.world, map.name.split(':')[0]);
      body.append(h('p', { class: 'fine' }, 'Each stone holds a question from something you did. A stone gets brighter when you meet that question in another place or through another action.'));
      const got = c.pack.questions.filter((q) => (c.permanent.stones?.[q.id] ?? []).length);
      if (!got.length) body.append(h('p', {}, 'No stones yet. They appear when you finish a step that has a question under it.'));
      body.append(h('ul', { class: 'stones' }, ...got.map((q) => {
        const ways = c.permanent.stones[q.id];
        const total = q.journalOnly ? 3 : 5;
        return h('li', { style: { '--glow': String(Math.min(ways.length, total) / total) } },
          h('span', { class: 'stone', 'aria-hidden': 'true' }, ...Array.from({ length: total }, (_, i) => h('i', { class: i < ways.length ? 'lit' : '' }))),
          h('div', {}, h('strong', {}, q.text), h('br', {}),
            q.journalOnly ? h('p', { class: 'fine' }, q.lastWord) : '',
            h('small', { class: 'fine' }, `${Math.min(ways.length, total)} of ${total} ways · ${ways.map((w) => { const [wd, a] = w.split('|'); return `${ACTION[a] ?? a} in ${worlds.get(wd) ?? wd}`; }).join(' · ')}.`)));
      })));
    } else if (tab === 'glossary') {
      body.append(h('p', { class: 'fine' }, 'Lumen remembers where a word came up on your journey. Open a word history to follow it further.'),
        h('dl', { class: 'glossary' }, ...c.pack.glossary.flatMap((g) => [
          h('dt', {}, g.term), h('dd', {}, g.text, this.glossaryExamples(g), this.wordHistory(g)),
        ])));
    } else if (tab === 'atlas') {
      // Concepts, ATL ribbons and subjects met (spec 91, 92). Counts of meetings, not grades.
      const m = c.permanent.met;
      const list = (title: string, names: Record<string, string>, got: Record<string, number>) => h('section', {}, h('h3', {}, title),
        h('ul', { class: 'atlas' }, ...Object.entries(names).map(([k, n]) => h('li', { class: got[k] ? 'met' : '' }, n, got[k] ? h('small', {}, ` met ${got[k]}×`) : ''))));
      body.append(h('p', { class: 'fine' }, 'Where your play touched the TOK concepts, the ATL skills and the DP subjects. This shows coverage, not quality.'),
        list('ATL skills (ribbons)', ATL_NAMES, m.atl), list('TOK concepts', CONCEPT_NAMES, m.concepts),
        list('DP subjects', Object.fromEntries(Object.entries(SUBJECTS).filter(([k]) => m.subjects[k]).map(([k, v]) => [k, v.name])), m.subjects));
      if (!Object.keys(m.subjects).length) body.append(h('p', { class: 'fine' }, 'No subjects met yet.'));
    } else if (tab === 'awards') {
      const xp = conceptXP(c.permanent, c.pack);
      body.append(h('p', {}, h('strong', {}, `Total concept XP: ${totalXP(c.permanent)}`), ' (permanent; it stays if you load an earlier checkpoint)'),
        h('p', { class: 'fine' }, 'Each ring fills as you earn XP for that concept in this chapter. A full ring means you met every chance this chapter gives for it.'),
        h('div', { class: 'rings' }, ...conceptRings(c.permanent, c.pack).sort((a, b) => Object.keys(CONCEPT_NAMES).indexOf(a.concept) - Object.keys(CONCEPT_NAMES).indexOf(b.concept)).map((r) => ringSvg(CONCEPT_NAMES[r.concept], r.got, r.max, RING_COLOURS[r.concept] ?? '#e9cf7a'))),
        h('ul', { class: 'xp sr-list' }, ...Object.entries(xp).map(([k, v]) => h('li', {}, `${k[0].toUpperCase()}${k.slice(1)}: ${v}`))),
        h('h3', {}, 'Earned'),
        h('ul', { class: 'awards' }, ...c.pack.awards.filter((a) => c.permanent.awards[a.id]).map((a) => h('li', {}, h('strong', {}, `${a.name} `), h('small', {}, `(${a.kind.replace('-', ' ')})`), h('br', {}), a.earnedBy,
          a.title ? h('div', { class: 'row' }, s.flags['title.worn'] === a.title
            ? h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'title.worn', value: '' }); this.refreshHud(); this.openJournal('awards'); } }, `Stop wearing "${a.title}"`)
            : h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'title.worn', value: a.title! }); this.refreshHud(); this.openJournal('awards'); } }, `Wear the title "${a.title}"`)) : ''))),
        h('h3', {}, 'Not yet earned'),
        h('ul', { class: 'awards locked' }, ...c.pack.awards.filter((a) => !c.permanent.awards[a.id]).map((a) => h('li', {}, `${a.name} (${a.kind.replace('-', ' ')})`))));
    } else if (tab === 'sources') {
      const entries = specimenReferences(c.pack, s);
      body.append(entries.length ? this.collectionBibliography(entries, 'Sources for objects I collected')
        : h('p', {}, 'Sources for the objects you collect will appear here.'));
    }
    const jc = decodeCrest(s.flags['crest']);
    this.openModal('journal wide', 'Journal', this.closeBtn(), h('h2', { class: 'journal-title' }, jc ? crestCanvas(jc, 30, 1) : '', `${s.player.name}'s journal`, jc ? h('small', { class: 'motto' }, ` · ${MOTTOS[jc.motto]}`) : ''), nav, body);
  }

  private openBag(): void {
    const c = ctx.controller, s = c.state;
    const tools = perspectiveTools(c.pack).filter((tool) => ownedPerspective(c.pack, s, tool.id));
    const active = activePerspective(c.pack, s);
    const equip = (keepsake: string | null) => {
      const events = c.dispatch({ type: 'EquipPerspective', keepsake });
      if (events.some((event) => event.kind === 'error')) return;
      ctx.world?.refreshWorld();
      this.openBag();
    };
    const toolsList = tools.map((tool) => {
      const inUse = active?.id === tool.id;
      const action = inUse ? `Put away ${tool.name}` : `Use ${tool.name}`;
      const specimen = c.pack.exhibits.filter(hasSpecimen).find((record) => record.specimen.key === specimenFromTool(tool.id));
      return h('li', {}, specimen ? specimenThumbnail(specimen) : h('img', { src: artURL(tool.equip.art ?? 'icon.book'), alt: '' }),
        h('div', {}, h('strong', {}, tool.name), inUse ? h('span', { class: 'chip' }, 'In use') : '',
          h('p', {}, tool.equip.method), h('small', {}, tool.equip.hint), h('br', {}),
          h('button', { type: 'button', onclick: () => equip(inUse ? null : tool.id) }, action)));
    });
    this.sfx('sfx.pickup');
    this.openModal('bag satchel', 'Bag', this.closeBtn(), h('div', { class: 'flap', 'aria-hidden': 'true' }), h('h2', {}, 'Satchel'),
      h('p', {}, `${s.marks} marks`),
      s.flags['specimens.collected'] === true ? h('p', { class: 'fine' }, `Satchel object slots ${carriedSpecimenCount(s)} / ${SPECIMEN_CAPACITY} · Swap objects in your collection room at the Nexus.`) : '',
      tools.length ? h('section', { class: 'field-tools' }, h('h3', {}, 'Field tools'),
        h('p', { class: 'fine' }, 'Carry one tool at a time. Each can reveal something different at a site.'),
        h('ul', { class: 'bag' }, ...toolsList)) : '',
      h('ul', { class: 'bag' }, ...Object.entries(s.inventory).filter(([id]) => !isSpecimenItem(id)).map(([id, q]) => {
        const it = c.pack.items.find((x) => x.id === id);
        return h('li', {}, h('img', { src: artURL(it?.art ?? 'icon.card'), alt: '' }), h('div', {}, h('strong', {}, `${it?.name ?? id}${q > 1 ? ` ×${q}` : ''}`), h('br', {}), h('small', {}, it?.description ?? '')));
      })),
      tools.length || Object.keys(s.inventory).length ? '' : h('p', {}, 'Your bag is empty.'));
  }

  private openSpecimenReturn(): void {
    const c = ctx.controller;
    const active = activePerspective(c.pack, c.state);
    const key = active && specimenFromTool(active.id);
    const exhibit = key ? c.pack.exhibits.filter(hasSpecimen).find((record) => record.specimen.key === key) : undefined;
    const destination = exhibit ? Object.values(MAPS).find((map) => map.interactables.some((prop) => prop.exhibit === exhibit.id)) : undefined;
    const revisit = exhibit?.specimen.revisit;
    const second = revisit && c.state.flags[`visited.map.${revisit.map}`] === true ? MAPS[revisit.map] : undefined;
    const travel = (map: NonNullable<typeof destination>) => {
      this.closeModal(false);
      ctx.world?.changeMap(map.id, map.spawn.x, map.spawn.y, { route: { id: 'specimen-return', label: 'the return arch' } });
    };
    this.openModal('bench-panel wide', 'The return arch', this.closeBtn(),
      destination && exhibit ? h('div', {}, h('h2', {}, destination.name), h('p', {}, exhibit.name),
        exhibit.specimen.revisit ? h('p', { class: 'fine' }, exhibit.specimen.revisit.hint) : null,
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => travel(destination) }, 'Return where I found it'),
          second && second.id !== destination.id ? h('button', { type: 'button', onclick: () => travel(second) }, `Return to ${second.name}`) : null))
        : h('p', {}, 'Equip a collected object in your satchel to open its route.'));
  }

  // -------------------------------------------------------------- menu

  private saveControl(): DocumentFragment {
    const feedback = h('p', { class: 'save-feedback warn', role: 'alert' });
    const control = document.createDocumentFragment();
    control.append(h('button', { onclick: () => this.saveAndLeave(feedback) }, 'Save and leave'), feedback);
    return control;
  }

  private saveAndLeave(feedback: HTMLElement): void {
    feedback.replaceChildren();
    this.saveFeedback = feedback;
    let saved: boolean;
    try {
      saved = ctx.controller.suspend();
    } finally {
      this.saveFeedback = null;
    }
    if (!saved) return;
    this.closeModal(false);
    this.toast('Saved. You can close the tab.', 'save');
    (window as any).kgToTitle?.();
  }

  private openMenu(): void {
    const c = ctx.controller;
    this.openModal('menu-panel', 'Menu', this.closeBtn(), h('h2', {}, 'Menu'),
      h('div', { class: 'menu' },
        h('button', { 'data-autofocus': true, onclick: () => this.closeModal() }, 'Resume'),
        this.saveControl(),
        h('button', { onclick: () => this.openGuardian() }, 'My Guardian (look and pronouns)'),
        h('button', { onclick: () => this.openCrest() }, 'Crest'),
        h('button', { onclick: () => { this.closeModal(false); this.openPhotoMode(); } }, 'Photo mode'),
        h('button', { onclick: () => this.openAlbum() }, 'Photo album'),
        h('button', { onclick: () => this.openMusicBox() }, 'Music box'),
        h('button', { onclick: () => this.openQuarters() }, 'My quarters'),
        h('button', { onclick: () => this.openDive() }, 'The Deep Dive (daily)'),
        h('button', { onclick: () => this.openTown() }, 'Communities of Emberford'),
        h('button', { onclick: () => this.openTalents() }, 'Insight tree'),
        h('button', { onclick: () => this.openRoles() }, 'Knower role'),
        h('button', { onclick: () => this.openLedger() }, "The Guardian's Ledger (progress)"),
        h('button', { onclick: () => this.openSettings() }, 'Settings'),
        h('button', { onclick: () => this.openShare() }, 'Share with my teacher'),
        h('button', { onclick: () => this.openControls() }, 'Controls'),
        c.canRecover() ? h('button', { onclick: () => this.confirmRecovery() }, 'Checkpoint recovery…') : null,
        h('button', { onclick: () => this.openCredits() }, 'Credits and sources')));
  }

  // ---------------------------------------------------------- photo mode

  private photoBar: HTMLElement | null = null;

  /**
   * Photo mode: hide the interface, frame the scene, add a filter, and save a picture
   * to this device. Nothing is uploaded. The player can still walk to set up the shot.
   */
  openPhotoMode(): void {
    if (!ctx.world || this.photoBar) return;
    const c = ctx.controller;
    const FILTERS: [string, string][] = [['none', 'No filter'], ['sepia', 'Archive print'], ['mono', 'Black and white'], ['print', 'Old photo'], ['warm', 'Warm film'], ['night', 'Night'], ['pinhole', 'Pinhole camera']];
    const FRAMES: [string, string][] = [['none', 'No frame'], ['gold', 'Gold'], ['archive', 'Archive violet'], ['wood', 'Wood'],
      ...(c.state.flags['puzzle.timeline-door.done'] === true ? [['timeline', 'Timeline brass (from the Timeline Door)'] as [string, string]] : [])];
    const o = { zoom: Math.round(ctx.world.photoZoom()), filter: 'none', lumen: true, pet: true, frame: 'gold', caption: true };
    let filters = true;
    const apply = () => { filters = ctx.world!.photoSet({ zoom: o.zoom, filter: o.filter, lumen: o.lumen, pet: o.pet }); };
    const bar = h('div', { class: 'photo-bar', role: 'region', 'aria-label': 'Photo mode' });
    const render = () => {
      clear(bar);
      const pick = (list: [string, string][], key: 'filter' | 'frame', label: string) => h('label', {}, `${label} `,
        h('select', { onchange: (e: Event) => { (o as any)[key] = (e.target as HTMLSelectElement).value; apply(); render(); } },
          ...list.map(([id, name]) => h('option', { value: id, selected: o[key] === id }, name))));
      const tick = (key: 'lumen' | 'pet' | 'caption', label: string) => h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: o[key], onchange: (e: Event) => { o[key] = (e.target as HTMLInputElement).checked; apply(); } }), ` ${label}`);
      const hasPet = !!c.state.flags['lor.out'];
      bar.append(h('strong', {}, '📷 Photo mode'),
        h('span', { class: 'row' }, h('button', { 'aria-label': 'Zoom out', onclick: () => { o.zoom = Math.max(1, o.zoom - 1); apply(); } }, '−'), ' Zoom ', h('button', { 'aria-label': 'Zoom in', onclick: () => { o.zoom = Math.min(6, o.zoom + 1); apply(); } }, '+')),
        filters ? pick(FILTERS, 'filter', 'Filter') : h('span', { class: 'fine' }, 'Filters need WebGL.'),
        pick(FRAMES, 'frame', 'Frame'), tick('lumen', 'Lumen'), hasPet ? tick('pet', 'Loreling') : '', tick('caption', 'Caption'),
        h('button', { class: 'primary', onclick: () => this.savePhoto(o) }, 'Save picture'),
        h('button', { onclick: () => { this.closePhotoMode(); this.openAlbum(); } }, 'Album'),
        h('button', { onclick: () => this.closePhotoMode() }, 'Done (Esc)'),
        h('small', { class: 'fine' }, 'Walk to set up the shot. The picture is saved only on this device.'));
    };
    this.photoBar = bar;
    document.body.classList.add('photo-mode');
    this.root.append(bar);
    apply(); render();
  }

  /** The music box (spec 47.4): arrange the motifs of the concepts you have used into a song. */
  private stopSong: (() => void) | null = null;
  /** Lumen's form and glow (customisation). Saved at once, like other settings. */
  private lumenPicker(): HTMLElement {
    const wrap = h('div', { class: 'lumen-forms', role: 'group', 'aria-label': "Lumen's form" });
    const render = () => {
      clear(wrap);
      const glow = '#' + LUMEN_COLOURS[ctx.settings.lumenColour].toString(16).padStart(6, '0');
      wrap.append(...LUMEN_FORMS.map((f) => h('button', { type: 'button', class: `lumen-form ${ctx.settings.lumenForm === f.id ? 'picked' : ''}`, 'aria-pressed': String(ctx.settings.lumenForm === f.id),
        style: { '--glow': glow }, onclick: () => { ctx.settings.lumenForm = f.id; saveSettings(ctx.settings); this.sfx('sfx.sparkle'); render(); this.refreshHud(); ctx.world?.refreshLumen(); } },
        h('img', { src: artURL(lumenArt({ lumenForm: f.id })), alt: '' }), h('span', {}, f.label))),
        h('label', { class: 'range' }, 'Glow ', h('select', { onchange: (e: Event) => { ctx.settings.lumenColour = (e.target as HTMLSelectElement).value as Settings['lumenColour']; saveSettings(ctx.settings); render(); ctx.world?.refreshLumen(); } },
          ...Object.keys(LUMEN_COLOURS).map((k) => h('option', { value: k, selected: ctx.settings.lumenColour === k }, k)))));
    };
    render();
    return wrap;
  }

  /**
   * The Guardian's quarters (spec 12.16 and 32.6): decorate a room from preset parts and
   * put earned keepsakes on the shelves. The ceiling is the Star Chart. Cosmetic only.
   */
  /** The Deep Dive (spec 59): seven prompts a day, answered with things found in play. */
  /**
   * The Guardian's Ledger (Mika 2026-11-25): time played, XP by day, week and month, a kind streak,
   * an activity calendar, a concept web and completion bars. Kept on this device. Never a grade.
   */
  openLedger(): void {
    const c = ctx.controller, s = c.state, pk = c.pack;
    const now = new Date();
    const L = ledgerSums(c.permanent.activity, now);
    const box = this.openModal('ledger-panel wide', "The Guardian's Ledger");
    this.sfx('sfx.book');
    const tile = (label: string, d: { secs: number; xp: number }) => h('div', { class: 'ledger-tile' }, h('span', { class: 'fine' }, label), h('strong', {}, fmtTime(d.secs)), h('span', {}, `${d.xp} XP`));
    // Activity calendar: 12 weeks, Monday at the top.
    const grid = calendarGrid(c.permanent.activity, now, 12);
    const cal = h('div', { class: 'ledger-cal', role: 'img', 'aria-label': `Activity calendar for 12 weeks. ${L.activeDays} active days.` },
      ...grid.map((wk) => h('div', { class: 'cal-col' }, ...wk.map((d) => h('span', { class: `cal-cell s${d.future ? 'f' : shade(d.secs)}`, title: `${d.day}: ${fmtTime(d.secs)}, ${d.xp} XP` })))));
    // Concept web: one spoke per concept, length = share of that ring.
    const rings = conceptRings(c.permanent, pk);
    const R = 90, cx = 120, cy = 112, n = rings.length;
    const pt = (i: number, f: number) => { const a = -Math.PI / 2 + (i / n) * Math.PI * 2; return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f]; };
    const poly = rings.map((r, i) => pt(i, r.max ? Math.max(0.04, r.got / r.max) : 0.04).join(',')).join(' ');
    const web = `<svg viewBox="-24 0 288 228" role="img" aria-label="Concept web: how full each concept ring is">
      ${[0.25, 0.5, 0.75, 1].map((f) => `<polygon points="${rings.map((_, i) => pt(i, f).join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-opacity="0.18"/>`).join('')}
      ${rings.map((_, i) => { const [x, y] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="currentColor" stroke-opacity="0.15"/>`; }).join('')}
      <polygon points="${poly}" fill="var(--gold)" fill-opacity="0.35" stroke="var(--gold)" stroke-width="2"/>
      ${rings.map((r, i) => { const [x, y] = pt(i, 1.17); return `<text x="${x}" y="${y + 3}" font-size="8.5" text-anchor="middle" fill="currentColor">${CONCEPT_NAMES[r.concept]}</text>`; }).join('')}
    </svg>`;
    const webEl = h('div', { class: 'ledger-web' }); webEl.innerHTML = web;
    // Completion bars.
    const flagsOn = (pre: string, list: string[]) => list.filter((id) => s.flags[`${pre}${id}`] === true).length;
    const puzzles = pk.puzzles.map((x) => x.id);
    const side = pk.missions.filter((m) => !['KG-CH1-M01', 'KG-CH1-M02'].includes(m.id));
    const sideDone = side.filter((m) => m.objectives.every((o) => s.objectivesDone.includes(o.id))).length;
    const places = Object.keys(MAPS).filter((id) => id === s.mapId || Object.keys(s.flags).some((k) => k.startsWith(`used.${id}.`))).length;
    const bars: [string, number, number][] = [
      ['Main story steps', pk.missions.filter((m) => ['KG-CH1-M01', 'KG-CH1-M02'].includes(m.id)).flatMap((m) => m.objectives).filter((o) => s.objectivesDone.includes(o.id)).length,
        pk.missions.filter((m) => ['KG-CH1-M01', 'KG-CH1-M02'].includes(m.id)).flatMap((m) => m.objectives).length],
      ['Side quests finished', sideDone, side.length],
      ['Puzzles solved', flagsOn('puzzle.', puzzles.map((id) => `${id}.done`)), puzzles.length],
      ['Lamps lit on the Lamp Wall', Number(s.flags['lamps.lit'] ?? 0), (pk.knots ?? []).length],
      ['Keepsakes found', flagsOn('keepsake.', (pk.keepsakes ?? []).map((k) => k.id)), (pk.keepsakes ?? []).length],
      ['Evidence cards', s.cards.length, pk.cards.length],
      ['Secrets found', flagsOn('secret.', (pk.secrets ?? []).map((k) => k.id)), (pk.secrets ?? []).length],
      ['Field readings taken', Number(s.flags['count.readings'] ?? 0), READINGS.length],
      ['Rumours traced to a source', Number(s.flags['count.rumours'] ?? 0), RUMOURS.length],
      ['Field games played', Number(s.flags['count.fieldgames'] ?? 0), FIELD_GAMES.length],
      ['Places visited', places, Object.keys(MAPS).length],
      ['Skills used (Skill Atlas)', Object.keys(c.permanent.skills ?? {}).length, (pk.skills ?? []).length],
      ['Areas of knowledge met', Object.keys(c.permanent.met.aoks).length, Object.keys(AOK_NAMES).length],
    ];
    const bar = ([label, got, max]: [string, number, number]) => max ? h('div', { class: 'ledger-bar' },
      h('span', {}, label), h('span', { class: 'track', role: 'progressbar', 'aria-valuenow': String(got), 'aria-valuemax': String(max), 'aria-label': label }, h('span', { class: 'fill', style: `width:${Math.round((100 * Math.min(got, max)) / max)}%` })),
      h('span', { class: 'fine' }, `${Math.min(got, max)} / ${max}`)) : null;
    // Mini-game scores.
    const fc = pk.puzzles.find((x) => x.id === 'forecast-board') as (PuzzleRecord & { days?: { rain: boolean }[] }) | undefined;
    const fs = readForecasts(s.flags['puzzle.forecast-board.f']);
    const scores: string[] = [
      `Deep Dive, deepest day: ${Number(s.flags['dive.best'] ?? 0)} m`,
      fc?.days && fs.length ? `Forecast Board: Brier score ${brier(fs.map((p) => p / 100), fc.days.slice(0, fs.length).map((d) => d.rain)).toFixed(2)} (lower is closer; 0.25 is 'always 50%')` : 'Forecast Board: not played yet',
      s.flags['tiles.best.moves'] ? `Sefa’s stitching table: best ${s.flags['tiles.best.moves']} moves, fastest ${s.flags['tiles.best.secs']} s` : 'Sefa’s stitching table: awaiting a tray',
      `Total play time in this campaign: ${fmtTime(s.playSeconds ?? 0)}`,
    ];
    box.append(this.closeBtn(), h('h2', {}, "The Guardian's Ledger"),
      h('p', { class: 'fine' }, 'Your own record, kept on this device. It is not a grade, and nobody ranks it. Time counts only while you are really playing.'),
      h('div', { class: 'ledger-tiles' }, tile('Today', L.today), tile('Last 7 days', L.week), tile('This month', L.month), tile('All time', L.total)),
      h('div', { class: 'ledger-streak' },
        h('span', { class: 'flame-big', 'aria-hidden': 'true' }),
        h('span', {}, h('strong', {}, `${L.streak}-day streak`), ` · best ${L.bestStreak} · `,
          h('span', { title: 'Every 7 active days in a row earn a shield. A missed day uses a shield, so a rest day keeps your streak.' }, `${'🛡'.repeat(L.shields)}${'·'.repeat(MAX_SHIELDS - L.shields)} freeze shields`)),
        h('span', { class: 'fine' }, ' A day counts after 5 active minutes or any XP. Rest days are good for learning too.')),
      h('h3', {}, 'Activity, last 12 weeks'), cal,
      h('div', { class: 'ledger-split' },
        h('div', {}, h('h3', {}, 'Concept web'), webEl),
        h('div', {}, h('h3', {}, 'Completion'), ...bars.map(bar).filter(Boolean) as HTMLElement[])),
      h('h3', {}, 'Scores'), h('ul', {}, ...scores.map((t) => h('li', {}, t))),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  /**
   * Communities of Emberford (reputation): how much each community trusts the player, what it knows,
   * and how it checks knowledge. Trust never falls. No community's way of knowing is 'the right one'.
   */
  openTown(): void {
    const c = ctx.controller, s = c.state;
    const box = this.openModal('town-panel wide', 'Communities of Emberford');
    this.sfx('sfx.page');
    const cards = (c.pack.communities ?? []).map((cm) => {
      const t = trustOf(cm, s);
      const rank = rankOf(t.pts);
      const next = TRUST_RANKS.find((r) => r.from > t.pts);
      const names = cm.who.map((w) => c.pack.characters.find((x) => x.id === w)?.name ?? w).join(', ');
      return h('section', { class: 'community' },
        h('h3', {}, cm.name, ' ', h('span', { class: `trust-rank r-${rank.toLowerCase()}` }, rank)),
        h('div', { class: 'trust-pips', role: 'img', 'aria-label': `Trust ${t.pts} of ${t.max}` }, ...Array.from({ length: t.max }, (_, i) => h('span', { class: i < t.pts ? 'on' : '' }))),
        h('p', { class: 'fine' }, names),
        h('p', {}, h('strong', {}, 'They know: '), cm.knows),
        h('p', {}, h('strong', {}, 'They check knowledge by: '), cm.checks),
        t.got.length ? h('ul', { class: 'fine' }, ...t.got.map((g) => h('li', {}, g.why))) : h('p', { class: 'fine' }, 'You have not helped them yet.'),
        next ? h('p', { class: 'fine' }, `${next.from - t.pts} more to be ${next.name}.`) : h('p', { class: 'fine' }, 'You are a friend of this community.'));
    });
    box.append(this.closeBtn(), h('h2', {}, 'Communities of Emberford'),
      h('p', {}, "Each community in Emberford knows different things, and checks knowledge in its own way. None of these ways is the only right one: a good Guardian learns how each one works. Trust grows when you help a community and listen to how it knows. It never falls."),
      h('div', { class: 'community-grid' }, ...cards),
      ...(s.companion ? [h('p', { class: 'fine' }, `Your companion, ${c.pack.characters.find((x) => x.id === s.companion)?.name ?? ''}: ${approvalRank(approvalOf(s.flags, s.companion))} (${approvalOf(s.flags, s.companion)}). Companions notice good questions, never agreement.`)] : []),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  /**
   * Corvan's stall: cosmetic things for the quarters, bought with marks from deeds. Before the market
   * Showdown his labels shout; after it, they say what he knows. Trust gives a fair-friend discount.
   */
  openShop(): void {
    const c = ctx.controller;
    const box = this.openModal('shop-panel wide', "Corvan's stall");
    this.sfx('sfx.coins');
    const render = (note?: string) => {
      const s = c.state, honest = honestLabels(s);
      box.replaceChildren(this.closeBtn(), h('h2', {}, "Corvan's stall"),
        h('p', {}, honest
          ? "Corvan: 'New labels. I say what I know, and what I don't. It is strange. Some customers like it better.'"
          : "Corvan: 'Everything here is the finest in Aethelgard! Ask anyone!' Read the labels carefully. What could he really know?"),
        h('p', { class: 'fine', role: 'status' }, `You have ${s.marks} marks. You earn marks when a lamp is lit (5) and when you find a secret (3). Things here are for your quarters only.`),
        ...(note ? [h('p', { class: 'fine', role: 'alert' }, note)] : []),
        h('div', { class: 'shop-grid' }, ...WARES.map((w) => {
          const have = owns(s, w), price = priceFor(w, s, c.pack), cm = (c.pack.communities ?? []).find((x) => x.id === w.community);
          return h('div', { class: `ware ${have ? 'owned' : ''}` },
            h('strong', {}, (({ wall: 'Walls', floor: 'Floor', rug: 'Rug', lamp: 'Lamp', view: 'Window', plant: 'Plant' }) as Record<string, string>)[w.part], ': ', this.wareName(w)),
            h('p', { class: honest ? 'label-honest' : 'label-hype' }, honest ? w.honest : w.hype),
            h('p', { class: 'fine' }, price < w.price ? `${price} marks (${w.price - price} off, for trust from ${cm?.name ?? ''})` : `${price} marks`),
            have ? h('span', { class: 'fine' }, 'Yours. Choose it in My quarters.')
              : h('button', { type: 'button', disabled: s.marks < price, onclick: () => {
                const ev = c.dispatch({ type: 'BuyWare', ware: w.id });
                if (ev.some((e) => e.kind === 'error')) return;
                this.sfx('sfx.pickup'); render(`Bought. Open My quarters to use it.`);
              } }, s.marks < price ? 'Not enough marks' : 'Buy'));
        })),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  /** Wenna's barter boat (ferry landing): cloak dyes with their price parts, and materials for the bench. */
  openTrader(): void {
    const c = ctx.controller;
    const box = this.openModal('shop-panel wide', "Wenna's barter boat");
    this.sfx('sfx.coins');
    const render = (note?: string) => {
      const s = c.state;
      const res = (k: Resource) => resCount(s.flags, k);
      const price = ferryPrice(WOAD_BLUE);
      const slips = h('details', { onToggle: () => {
        if (slips.open && c.state.flags['trade.price-compared'] !== true) c.dispatch({ type: 'CompareDyePrices' });
      } }, h('summary', {}, 'Lay the two woad price slips side by side'),
      h('p', {}, `Wenna’s slip: ${WOAD_BLUE.parts.material} for the dye and ${WOAD_BLUE.parts.work} for the work. Total ${price} marks.`),
      h('p', {}, `Corvan’s slip: ${price} for the dye and work, ${TOWN_COSTS.carrying} to carry it, ${TOWN_COSTS.toll} for the bridge and ${TOWN_COSTS.stall} for the stall. Total ${townPrice(WOAD_BLUE)} marks.`),
      h('p', {}, 'Wenna taps her slip. “Each part has a name. You can see where the difference comes from. The sums don’t tell me what a buyer can spare.”'));
      box.replaceChildren(this.closeBtn(), h('h2', {}, "Wenna's barter boat"),
        ...(note ? [h('p', { class: 'clue-view fresh', role: 'status' }, note)] : []),
        h('p', { class: 'fine', role: 'status' }, `You have ${s.marks} marks. Dyes add a cloak colour (change it in Menu, My Guardian). They give no XP and no power.`),
        slips,
        h('h3', {}, 'Cloak dyes, and the parts of each price'),
        h('div', { class: 'shop-grid' }, ...DYES.map((d) => {
          const have = ownsDye(s.flags, d.id), price = ferryPrice(d);
          return h('div', { class: `ware ${have ? 'owned' : ''}` },
            h('strong', {}, h('span', { class: 'dye-dot', style: { background: `#${OUTFIT[d.id][0]}` }, 'aria-hidden': 'true' }), ' ', d.name),
            h('p', {}, d.note),
            h('p', { class: 'fine' }, `Here: material ${d.parts.material} + work ${d.parts.work} = ${price} marks.`),
            h('p', { class: 'fine' }, `In Emberford: ${price} + carrying ${TOWN_COSTS.carrying} + toll ${TOWN_COSTS.toll} + stall ${TOWN_COSTS.stall} = ${townPrice(d)} marks.`),
            have ? h('span', { class: 'fine' }, 'Yours. Choose it in My Guardian.')
              : h('button', { type: 'button', disabled: s.marks < price, onclick: () => {
                const ev = c.dispatch({ type: 'BuyDye', dye: d.id });
                if (ev.some((e) => e.kind === 'error')) return;
                this.sfx('sfx.pickup'); render(`${d.name} is yours. Open Menu, then My Guardian, to dye your cloak.`);
              } }, s.marks < price ? 'Not enough marks' : `Buy for ${price}`));
        })),
        h('h3', {}, 'Materials for the Maker\'s bench'),
        h('p', { class: 'fine' }, "Reeds and clay are plenty here, so they are cheap. Ore comes from Emberford's hills, so Wenna pays well for it. A price says something about the place."),
        h('div', { class: 'row' },
          ...(Object.keys(BARTER) as Resource[]).map((k) => {
            const b = BARTER[k];
            return b.buy
              ? h('button', { type: 'button', disabled: s.marks < b.buy, onclick: () => { if (!c.dispatch({ type: 'Barter', resource: k, dir: 'buy' }).some((e) => e.kind === 'error')) { this.sfx('sfx.coins'); render(); } } }, `Buy 1 ${k === 'reed' ? 'reed' : RESOURCES[k].toLowerCase()} (${b.buy}) · you have ${res(k)}`)
              : h('button', { type: 'button', disabled: res(k) < 1, onclick: () => { if (!c.dispatch({ type: 'Barter', resource: k, dir: 'sell' }).some((e) => e.kind === 'error')) { this.sfx('sfx.coins'); render(); } } }, `Sell 1 ${RESOURCES[k].toLowerCase()} (+${b.sell}) · you have ${res(k)}`);
          })),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  private wareName(w: (typeof WARES)[number]): string {
    const lists: Record<string, Record<string, { name: string } | null>> = { wall: WALLS, floor: FLOORS, rug: RUGS, lamp: LAMPS, view: VIEWS, plant: PLANTS };
    return lists[w.part][w.key]?.name ?? w.key;
  }

  /** The Insight tree: spend Insight (one point per lamp lit) on small play helps named after TOK skills. */
  /** Field games from the TOK lessons: one entry point, one panel per game. */
  openFieldGame(id: string): void {
    if (id === CLEAR_BAY_GAME) {
      this.openModal('bench-panel wide', 'The First Bell at the Cold Store', this.closeBtn(),
        clearBayPanel(ctx.controller, () => ctx.world?.refreshWorld(), (key) => this.sfx(key)));
      return;
    }
    if (id.startsWith(DISPATCH_GAME)) {
      const desk = id.slice(DISPATCH_GAME.length);
      if (desk === 'guild' || desk === 'ferry') this.openModal('tiles-panel wide', DISPATCH_DESKS[desk], this.closeBtn(),
        sefaDeskPanel(ctx.controller, desk, () => ctx.world?.refreshWorld(), (key) => this.sfx(key)));
      return;
    }
    if (id === 'catchment-trace') {
      this.openModal('bench-panel wide', 'Below the Gauge', this.closeBtn(),
        catchmentPanel(ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
      return;
    }
    if (id === 'linked-study-folio' || id === 'linked-voices-bench') {
      this.openModal('bench-panel wide', id === 'linked-study-folio' ? 'Field folio' : 'Filing bench', this.closeBtn(),
        linkedNotes(id === 'linked-study-folio' ? 'study' : 'voices', ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
      return;
    }
    const carry = carryLocation(id);
    const loop = waterLoopStation(id);
    const incentive = incentiveStation(id);
    const islandProof = ISLAND_PROOF_CASES.find((entry) => id === `${ISLAND_PROOF_TOOL}${entry}`);
    if (islandProof) {
      const c = ctx.controller;
      const checked = islandProofFlag(islandProof, 'checked');
      this.openModal('bench-panel wide', 'Ivo’s proof rack', this.closeBtn(),
        islandProofRackPanel(islandProof, c, (key) => this.sfx(key), () => ctx.world?.refreshWorld()),
        localGuide(c, MAPS[c.state.mapId]?.world ?? '', () => c.check({ objective: checked }) ? islandProofFlag(islandProof, 'used') : checked));
    } else if (incentive) {
      this.openModal('bench-panel wide', 'Ready by the Bell', this.closeBtn(),
        civicIncentivePanel(incentive.station, ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (loop) {
      this.openModal('bench-panel wide', 'The Water That Comes Back', this.closeBtn(),
        waterLoopPanel(loop.site, loop.station, ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'service-boundary') {
      this.openModal('bench-panel wide', 'The Line on the Night Map', this.closeBtn(), h('h2', {}, 'Night service map'),
        serviceBoundaryPanel(ctx.controller));
    } else if (id.startsWith(`${CLEARANCE_GROUP}:`)) {
      const place = id.slice(CLEARANCE_GROUP.length + 1);
      this.openModal('bench-panel wide', 'The viewing rails', this.closeBtn(), clearanceGallery(ctx.controller, place, () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(BADGE_ANNEX_PREFIX)) {
      this.openModal('bench-panel wide', 'The Badge Annex', this.closeBtn(),
        badgeAnnexPanel(ctx.controller, id.slice(BADGE_ANNEX_PREFIX.length), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(FACING_CUE_PREFIX)) {
      this.openModal('bench-panel wide', 'The Step Across the Line', this.closeBtn(), facingCuePanel(
        ctx.controller, id.slice(FACING_CUE_PREFIX.length), () => ctx.world?.refreshWorld(), () => this.sfx('sfx.click')));
    } else if (id.startsWith(CURTAIN_PREFIX)) {
      this.openModal('bench-panel wide', 'The Call behind the Curtain', this.closeBtn(), curtainCallPanel(
        ctx.controller, id.slice(CURTAIN_PREFIX.length), () => ctx.world?.refreshWorld(), () => this.sfx('sfx.click')));
    } else if (id.startsWith(EARLIER_VIEWING)) {
      this.openModal('bench-panel wide', 'A second view', this.closeBtn(), earlierViewingPanel(ctx.controller,
        id.slice(EARLIER_VIEWING.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(BEATER_GAME)) {
      this.openModal('bench-panel wide', 'Both Faces at the Same Stop', this.closeBtn(), beaterProofPanel(ctx.controller,
        id.slice(BEATER_GAME.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()),
        localGuide(ctx.controller, MAPS[ctx.controller.state.mapId]?.world ?? '', 'beater.proof.placed'));
    } else if (id.startsWith(JOINED_CLOTH_GAME)) {
      this.openModal('bench-panel wide', 'The Two Supports', this.closeBtn(), joinedClothPanel(ctx.controller,
        id.slice(JOINED_CLOTH_GAME.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()),
        localGuide(ctx.controller, MAPS[ctx.controller.state.mapId]?.world ?? '', JOINED_CLOTH_OBJECTIVE));
    } else if (id.startsWith(STAR_GAME)) {
      this.openModal('bench-panel wide', 'Field methods', this.closeBtn(), starField(ctx.controller,
        id.slice(STAR_GAME.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith('script-rail:')) {
      this.openModal('bench-panel wide', 'The Script Cabinet', this.closeBtn(), scriptRailPanel(ctx.controller,
        id.slice('script-rail:'.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'copies-two-calls') {
      const c = ctx.controller;
      const firstOpenCall = () => c.engine.visibleObjectives(c.state).find(({ id, complete }) =>
        id.startsWith('copies.twocalls.') && !complete)?.id;
      this.openModal('bench-panel wide', 'Two Calls After Tuesday', this.closeBtn(),
        twoCallsPanel(c, () => ctx.world?.refreshWorld(), () => this.sfx('sfx.page')),
        localGuide(c, MAPS[c.state.mapId]?.world ?? '', firstOpenCall));
    } else if (id.startsWith('work-schedule:')) {
      this.openModal('bench-panel wide', 'The Working Cupboards', this.closeBtn(), workSchedulePanel(ctx.controller,
        id.slice('work-schedule:'.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith('material-stores:')) {
      this.openModal('bench-panel wide', 'The Material Stores', this.closeBtn(), materialStorePanel(ctx.controller,
        id.slice('material-stores:'.length), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(GLASS_RACK_PREFIX)) {
      this.openModal('bench-panel wide', 'The Missing Face', this.closeBtn(),
        glassRackPanel(ctx.controller, id.slice(GLASS_RACK_PREFIX.length), () => ctx.world?.refreshWorld()));
    } else if (id === BEND_TOOL + 'nile' || id === BEND_TOOL + 'landing') {
      const site = id.slice(BEND_TOOL.length) as BendSite;
      const c = ctx.controller;
      const nextBendStep = () => c.engine.visibleObjectives(c.state).find(({ id, complete }) =>
        id.startsWith(`bend.${site}.`) && !complete)?.id;
      this.openModal('bench-panel wide', 'The Bend That Stayed', this.closeBtn(),
        stripBendPanel(c, site, (key) => this.sfx(key), () => ctx.world?.refreshWorld()),
        localGuide(c, MAPS[c.state.mapId]?.world ?? '', nextBendStep));
    } else if (id.startsWith(`${WARM_TOOL}:`)) {
      this.openModal('bench-panel wide', 'The Warm Side', this.closeBtn(), warmRoomPanel(ctx.controller,
        id.slice(WARM_TOOL.length + 1), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === `${PORTER_TOOL}:emberford` || id === `${PORTER_TOOL}:water`) {
      const site = id.endsWith(':water') ? 'water' : 'emberford';
      this.openModal('bench-panel wide', site === 'emberford' ? 'Idris’s carry board' : 'Sena’s half-route board',
        this.closeBtn(), porterPacePanel(ctx.controller, site, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === `${SILL_CLOCK}bridge` || id === `${SILL_CLOCK}ferry`) {
      const c = ctx.controller;
      const site = id === `${SILL_CLOCK}bridge` ? 'bridge' : 'ferry';
      this.openModal('bench-panel wide', 'The bell wheel', this.closeBtn(),
        sillBridgePanel(site, c, (key) => this.sfx(key), () => ctx.world?.refreshWorld()),
        localGuide(c, MAPS[c.state.mapId]?.world ?? '', () => sillGuideObjective(site, c)));
    } else if (id === BRIDGE_PROOF_TOOL) {
      this.openModal('bench-panel wide', 'Idris’s practice bridge', this.closeBtn(),
        bridgeProofPanel(ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === `${BREEZE_TOOL}headland` || id === `${BREEZE_TOOL}archive` || id === `${BREEZE_TOOL}harbour`) {
      const site = id === `${BREEZE_TOOL}headland` ? 'headland' : id === `${BREEZE_TOOL}archive` ? 'archive' : 'harbour';
      const c = ctx.controller;
      this.openModal('bench-panel wide', 'A Second Look at the Step', this.closeBtn(),
        coastBreezePanel(site, c, (key) => this.sfx(key), () => ctx.world?.refreshWorld()),
        localGuide(c, MAPS[c.state.mapId]?.world ?? '', () => c.check({ objective: BREEZE_CHECK }) ? BREEZE_FOLLOW : BREEZE_CHECK));
    } else if (id === DETECTOR_GAME) {
      this.openModal('bench-panel wide', 'Neri’s light reader', this.closeBtn(),
        coastDetectorPanel(ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${PACKING_TOOL}:`)) {
      this.openModal('bench-panel wide', 'A Name on the Load', this.closeBtn(), ferryPackingPanel(ctx.controller,
        id.slice(PACKING_TOOL.length + 1), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${TIME_TOOL}:`)) {
      this.openModal('bench-panel wide', 'The Time Room', this.closeBtn(), timeRoomPanel(ctx.controller,
        id.slice(TIME_TOOL.length + 1), () => ctx.settings.sfxVolume, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${MODEL_RECORD_GROUP}:`)) {
      this.openModal('bench-panel wide', 'What the Model Keeps', this.closeBtn(),
        modelRecordPanel(ctx.controller, id.slice(MODEL_RECORD_GROUP.length + 1), (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith('callboard:')) {
      const place = id.slice('callboard:'.length);
      this.openModal('bench-panel wide', 'The Callboard Turn', this.closeBtn(), callboardPanel(ctx.controller, place, () => ctx.world?.refreshWorld()));
    } else if (id.startsWith('object-use:')) {
      const place = id.slice('object-use:'.length);
      this.openModal('bench-panel wide', 'The workroom fixture', this.closeBtn(),
        objectUsePanel(ctx.controller, place, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith('timbuktu:')) {
      const place = id.slice('timbuktu:'.length);
      this.openModal('bench-panel wide', 'The season horizon', this.closeBtn(),
        timbuktuHorizonPanel(ctx.controller, place, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'specimen-vault') {
      this.openModal('bench-panel wide', 'Your collection', this.closeBtn(), specimenVault(ctx.controller, () => {
        this.refreshHud(); ctx.world?.refreshWorld();
      }));
    } else if (id.startsWith(SPECIMEN_SHELF)) {
      this.openModal('bench-panel', 'Collection display', this.closeBtn(),
        specimenCase(ctx.controller, Number(id.slice(SPECIMEN_SHELF.length)), () => {
          this.refreshHud(); ctx.world?.refreshWorld();
        }));
    } else if (id === 'specimen-return') {
      this.openSpecimenReturn();
    } else if (id.startsWith(`${NUMBER_LEAF_GROUP}:`)) {
      const place = id.slice(NUMBER_LEAF_GROUP.length + 1);
      this.openModal('bench-panel wide', 'The Ledger Room', this.closeBtn(),
        numberLeavesPanel(ctx.controller, place, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${STORY_FRAME_GROUP}:`)) {
      const place = id.slice(STORY_FRAME_GROUP.length + 1);
      this.openModal('bench-panel wide', 'The Story Archive caption frame', this.closeBtn(),
        storyFramePanel(ctx.controller, place, () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${DATE_REGISTER_GROUP}:`)) {
      const place = id.slice(DATE_REGISTER_GROUP.length + 1);
      this.openModal('bench-panel wide', 'The Beside Date', this.closeBtn(),
        dateRegisterPanel(ctx.controller, place, () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${LANTERN_WEAVE}:`)) {
      const place = id.slice(LANTERN_WEAVE.length + 1);
      this.openModal('bench-panel wide', 'The Half-Light Room', this.closeBtn(),
        lanternWeavePanel(ctx.controller, place, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'shutter-board') {
      this.openModal('bench-panel wide', 'The Two Shutter Room', this.closeBtn(),
        shutterBoardPanel(ctx.controller, () => ctx.world?.refreshWorld(), () => this.sfx('sfx.page')));
    } else if (id.startsWith(`${IMPRINT_GROUP}:`)) {
      const place = id.slice(IMPRINT_GROUP.length + 1);
      this.openModal('bench-panel wide', 'The Second Imprint', this.closeBtn(),
        copyImprint(ctx.controller, place, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${REFERENCE_PROOF}:`)) {
      const place = id.slice(REFERENCE_PROOF.length + 1);
      this.openModal('bench-panel wide', 'The checked record', this.closeBtn(),
        referenceProofPanel(ctx.controller, place, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${MAKER_TOOL}:`)) {
      const place = id.slice(MAKER_TOOL.length + 1);
      this.openModal('bench-panel wide', 'A Turn at the Workbench', this.closeBtn(),
        makerRoom(ctx.controller, place, () => ctx.settings.sfxVolume, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${MAKER_EXACT}:`)) {
      const place = id.slice(MAKER_EXACT.length + 1);
      this.openModal('bench-panel wide', 'The Makers’ Room', this.closeBtn(),
        makerExact(ctx.controller, place, () => ctx.settings.sfxVolume, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith('date-peg:')) {
      const place = id.slice('date-peg:'.length);
      this.openModal('bench-panel wide', 'Two dates at a peg', this.closeBtn(), datePegPanel(ctx.controller, place, () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${RELAY_GROUP}:`)) {
      const place = id.slice(RELAY_GROUP.length + 1);
      this.openModal('bench-panel wide', 'One Clip Before the Bell', this.closeBtn(),
        specimenRelayPanel(place, ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${PASSAGE_GROUP}:`)) {
      const place = id.slice(PASSAGE_GROUP.length + 1);
      this.openModal('bench-panel wide', 'Which Edge Reached the Landing', this.closeBtn(),
        specimenPassagePanel(place, ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${TURNING_GROUP}:`)) {
      this.openModal('bench-panel wide', 'A Shore You Can Turn', this.closeBtn(),
        turningPanel(id.slice(TURNING_GROUP.length + 1), ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${CUE_GROUP}:`)) {
      this.openModal('bench-panel wide', 'A Cue Beyond the Door', this.closeBtn(),
        cueWorkshopPanel(id.slice(CUE_GROUP.length + 1), ctx.controller, ctx.settings, () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${LOAD_GROUP}:`)) {
      this.openModal('bench-panel wide', 'The Cart Finds Its Centre', this.closeBtn(),
        loadingBayPanel(id.slice(LOAD_GROUP.length + 1), ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${BEARING_GROUP}:`)) {
      this.openModal('bench-panel wide', 'Where the Two Sights Meet', this.closeBtn(),
        bearingBayPanel(id.slice(BEARING_GROUP.length + 1), ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${PRISM_GROUP}:`)) {
      this.openModal('bench-panel wide', 'Three Bands Through One Window', this.closeBtn(),
        prismViewerPanel(id.slice(PRISM_GROUP.length + 1), ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id.startsWith(`${ALIGN_GROUP}:`)) {
      this.openModal('bench-panel wide', 'The Third Landmark', this.closeBtn(),
        mapAlignmentPanel(id.slice(ALIGN_GROUP.length + 1), ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'drawer-cases') {
      const c = ctx.controller;
      this.openModal('bench-panel wide', 'Three Cases at the Bell', this.closeBtn(), drawerCases(c),
        localGuide(c, MAPS[c.state.mapId]?.world ?? '', 'drawer.cases.opened'));
    } else if (id === 'market-basket-bench' || id === 'market-basket-voucher' || id === 'market-basket-credit') {
      const site = id === 'market-basket-bench' ? 'bench' : id === 'market-basket-voucher' ? 'voucher' : 'credit';
      this.openModal('bench-panel wide', 'Three Goods, Two Bells', this.closeBtn(),
        marketBasketPanel(site, ctx.controller, (key) => this.sfx(key)));
    } else if (id === 'island-skiff') {
      this.openModal('bench-panel wide', 'Joss’s Skiff', this.closeBtn(),
        islandSkiffPanel(ctx.controller, (key) => this.sfx(key), (berth) => {
          const landing = SKIFF_LANDINGS[berth];
          this.closeModal(false);
          ctx.world?.changeMap(landing.map, landing.x, landing.y, { route: { id: 'skiff-landing', label: 'Joss’s skiff' } });
        }));
    } else if (id === 'stiltfrog-wait') {
      this.openLoreling('stiltfrog');
    } else if (id === 'stiltfrog-watch-low' || id === 'stiltfrog-watch-high') {
      this.openModal('bench-panel', 'Watch the reed hollow', this.closeBtn(),
        stiltfrogWatch(id === 'stiltfrog-watch-low' ? 'low' : 'high', ctx.controller, (key) => this.sfx(key)));
    } else if (carry) {
      const [site, stop] = carry;
      this.openModal('bench-panel wide', CARRY[site].title, this.closeBtn(),
        sharedCarry(site, stop, ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'handover-gallery') {
      this.openModal('bench-panel wide', 'Handover Room', this.closeBtn(),
        handoverGallery(ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'forest-counter' || id === 'water-counter') {
      const title = id === 'forest-counter' ? 'The Silent Slot' : 'Three Messengers';
      this.openModal('bench-panel wide', title, this.closeBtn(),
        counterReplayBoard(id === 'forest-counter' ? 'forest' : 'water', ctx.controller, (key) => this.sfx(key), () => ctx.world?.refreshWorld()));
    } else if (id === 'coast-shadow-board' || id === 'council-shadow-board') {
      this.openModal('bench-panel wide', 'Shadow board', this.closeBtn(), opticsTrial(id, ctx.controller, (key) => this.sfx(key)));
    } else if (id === 'relief-routing' || id === 'civic-lane-routing') {
      const title = id === 'relief-routing' ? 'The weir’s relief bench' : 'The library’s lane board';
      this.openModal('bench-panel wide', title, this.closeBtn(), routingBoard(id, ctx.controller, (key) => this.sfx(key)));
    }
    else if (id === 'doors') this.openDoors();
    else if (id === 'guests') this.openGuestBook();
    else if (id === 'slate') this.openSlate();
    else if (id === 'word') this.openMissingWord();
    else if (id === 'bones') this.openBones();
    else if (id.startsWith('loyalty-')) this.openLoyalty(id.slice(8));
    else if (id.startsWith('cross-')) this.openCrossing(id.slice(6));
    else if (id === 'hearth') this.openHearth();
    else if (id === 'ballad') this.openBallad();
    else if (id === 'stars') this.openStars();
    else if (id === 'dig') this.openDig();
    else if (id === 'trade') this.openTrade();
  }

  /** Star Pictures: draw your own picture, see two traditions, measure, then choose what the chart says. */
  openStars(): void {
    const c = ctx.controller;
    const box = this.openModal('bench-panel wide', 'Star Pictures');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'Star Pictures'),
      h('p', {}, "Night-keeper Anwen hands you a chalk stick and points at seven stars over the sea wall. 'Everyone sees the same seven. Join them up however you like. Then I will show you what my neighbours see.'")];
    const sky = (lines: [number, number][][], pick: number | null, onStar?: (i: number) => void) => {
      const cls = ['mine', 'heron', 'ladder'];
      const svg = `<svg viewBox="0 0 100 70" class="star-sky" role="img" aria-label="Seven stars and the lines drawn between them">` +
        lines.map((ls, k) => ls.map(([a, b]) => `<line x1="${STARS[a].x}" y1="${STARS[a].y}" x2="${STARS[b].x}" y2="${STARS[b].y}" class="${cls[k]}"/>`).join('')).join('') +
        STARS.map((st, i) => `<circle cx="${st.x}" cy="${st.y}" r="${st.bright ? 2.6 : 1.8}" class="${i === pick ? 'picked' : ''}"/>`).join('') + '</svg>';
      const wrap = h('div', { class: 'star-wrap' }); wrap.innerHTML = svg;
      if (onStar) wrap.append(h('div', { class: 'star-buttons' }, ...STARS.map((st, i) => h('button', { type: 'button', class: 'star-btn', style: `left:${st.x}%;top:${(st.y / 70) * 100}%`, 'aria-label': `Star ${i + 1}${st.bright ? ', the bright one' : ''}`, onclick: () => onStar(i) }))));
      return wrap;
    };
    const mine: [number, number][] = [];
    let pick: number | null = null;
    const draw = () => {
      box.replaceChildren(...head(), sky([mine], pick, (i) => {
        if (pick === null) { pick = i; this.sfx('sfx.click'); }
        else if (pick !== i) { mine.push([pick, i]); pick = null; this.sfx('sfx.sparkle'); }
        else pick = null;
        draw();
      }), h('p', { class: 'fine', role: 'status' }, pick === null ? `Click a star, then another, to draw a line. ${mine.length} line${mine.length === 1 ? '' : 's'} so far.` : `Star ${pick + 1} picked. Now click the star to join it to.`),
        mine.length >= 3 ? h('div', { class: 'notice-options' }, ...MY_PICTURE_NAMES.map((n) => h('button', { type: 'button', onclick: () => traditions(n) }, `Call it ${n}`))) : h('p', { class: 'fine' }, 'Draw at least three lines.'));
    };
    const traditions = (myName: string) => {
      box.replaceChildren(...head(), sky([mine, SKY_PICTURES[0].lines, SKY_PICTURES[1].lines], null),
        h('p', {}, `Anwen laughs. '${myName.replace('the ', 'A ')}! Good. Now look: the same stars, two more pictures.'`),
        ...SKY_PICTURES.map((sp) => h('p', { class: 'clue-view' }, h('strong', {}, `${sp.name[0].toUpperCase()}${sp.name.slice(1)}, as ${sp.who} see it: `), sp.knows)),
        h('p', {}, "'Which picture is right?' Anwen asks, and waits."),
        h('div', { class: 'notice-options' },
          h('button', { type: 'button', onclick: () => measure("'None of them is right. They are pictures.'") }, 'None of them. They are pictures.'),
          h('button', { type: 'button', onclick: () => measure("'All of them, in a way. Each one does a job.'") }, 'All of them, for different jobs.'),
          h('button', { type: 'button', onclick: () => measure("'Mine, obviously.'") }, 'Mine, obviously.')));
    };
    const measure = (said: string) => {
      box.replaceChildren(...head(), h('p', {}, `You say: ${said} Anwen nods. 'Then here is a question with one answer.' She gives you the brass quadrant, and a shepherd who is visiting takes a second one.`),
        h('p', { class: 'clue-view fresh' }, `You sight the bright star over the sea wall: ${STAR_HEIGHT} degrees. The shepherd, with the other quadrant: ${STAR_HEIGHT} degrees. The quay keeper, last week, wrote: ${STAR_HEIGHT} degrees.`),
        h('p', {}, "'The height is the same for anyone with a quadrant,' says Anwen. 'The picture is not. Both are knowledge. They answer different questions.' Now the harbour chart needs a label for these stars."),
        h('div', { class: 'notice-options' }, ...CHART_CHOICES.map((ch) => h('button', { type: 'button', onclick: () => {
          c.dispatch({ type: 'SetFlag', flag: 'field.stars.chart', value: ch.id });
          this.sfx('sfx.award');
          box.replaceChildren(...head(), h('p', { class: 'clue-view fresh' }, ch.text), h('p', { class: 'fine' }, `What it costs: ${ch.cost}`), this.finishField('stars'),
            h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
        } }, h('span', {}, ch.text), h('span', { class: 'fine', style: 'display:block' }, `Cost: ${ch.cost}`)))));
    };
    draw();
  }

  /** The Careful Dig: brush or pick, take notes, then decide whether to dig the second trench. */
  openDig(): void {
    const c = ctx.controller;
    const runs = Number(c.state.flags['field.dig.runs'] ?? 0);
    c.dispatch({ type: 'SetFlag', flag: 'field.dig.runs', value: runs + 1 });
    let site = digSite(runs + 2);
    let tool: DigTool = 'brush', strokes = 0;
    const calm = !!(ctx.settings.calmMode || ctx.settings.zenMode);
    const box = this.openModal('bench-panel wide', 'The Careful Dig');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'The Careful Dig'),
      h('p', {}, "Site lead Marisol kneels at an old charcoal-burners' camp in the forest. 'Something is under here. A pot, I think, from the old camp. The pick is fast. The brush is slow. Notes are slower. Your choice.'")];
    const render = () => {
      const r = digReport(site), dark = !calm && strokes >= DIG_LIGHT;
      const grid = h('div', { class: 'dig-grid', role: 'grid', style: `grid-template-columns:repeat(${DIG_W},1fr)` }, ...site.map((cell, i) => {
        const open = cell.cleared >= BRUSH_STROKES;
        const label = open ? (cell.find ? (cell.cracked ? 'a cracked piece of pot' : 'a whole piece of pot') : `${cell.layer}, nothing here`) : `soil, ${cell.cleared} of ${BRUSH_STROKES} brushed`;
        return h('button', { type: 'button', class: `dig-cell ${open ? `open ${cell.layer}` : `d${cell.cleared}`}${cell.find && open ? (cell.cracked ? ' cracked' : ' find') : ''}${cell.noted ? ' noted' : ''}`, disabled: dark || (open && cell.noted), 'aria-label': `${label}${cell.noted ? ', noted' : ''}`,
          onclick: () => { if (open) { site = digNote(site, i); this.sfx('sfx.page'); } else { site = digStroke(site, i, tool); strokes++; this.sfx(tool === 'pick' ? 'sfx.click' : 'sfx.page'); } render(); } },
          open ? (cell.find ? (cell.cracked ? '✕' : '◍') : '·') : '');
      }));
      box.replaceChildren(...head(),
        h('div', { class: 'row' }, ...(['brush', 'pick'] as DigTool[]).map((t) => h('button', { type: 'button', class: tool === t ? 'primary' : '', 'aria-pressed': String(tool === t), onclick: () => { tool = t; render(); } }, t === 'brush' ? `Brush (${BRUSH_STROKES} strokes a square, safe)` : 'Pick (one stroke, can crack a find)'))),
        grid,
        h('p', { class: 'fine', role: 'status' }, `Click soil to dig. Click an open square to write a note about the layer where it lay. Pieces found: ${r.pieces} (${r.whole} whole, ${r.cracked} cracked). Notes: ${r.notedAll}. ${calm ? 'Calm mode: no daylight limit.' : `Daylight left: ${Math.max(0, DIG_LIGHT - strokes)} strokes.`}`),
        r.pieces === 4 || dark ? h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => end() }, dark ? 'The light is gone. Show Marisol.' : 'Show Marisol what you found')) : '');
    };
    const end = () => {
      const r = digReport(site);
      box.replaceChildren(...head(),
        h('p', { class: 'clue-view fresh' }, `${r.pieces} of 4 pieces found: ${r.whole} whole, ${r.cracked} cracked. You noted where ${r.notedFinds} of them lay.`),
        h('p', {}, r.notedFinds >= r.pieces && r.pieces > 0
          ? "Marisol beams. 'Charcoal layer, every piece. So the pot was in the fire pit, not thrown away. Your notes tell us how it was used. Without them it is just a pot.'"
          : "Marisol turns a piece over. 'A pot. But where exactly did it lie? In the fire pit, or in the rubbish? Without the notes, we cannot tell how it was used. The soil is gone now, so we never will.'"),
        r.cracked ? h('p', { class: 'fine' }, "'And the pick was quick. That crack is from today, not from the old camp. A future reader may not know the difference, so write it down.'") : '',
        h('p', {}, "Marisol points to a second patch of dark soil. 'There is a second trench. What do we do?'"),
        h('div', { class: 'notice-options' }, ...DIG_CHOICES.map((ch) => h('button', { type: 'button', onclick: () => {
          c.dispatch({ type: 'SetFlag', flag: 'field.dig.trench', value: ch.id });
          this.sfx('sfx.award');
          box.replaceChildren(...head(), h('p', { class: 'clue-view fresh' }, ch.text), h('p', { class: 'fine' }, `What it costs: ${ch.cost}`), this.finishField('dig'),
            h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
        } }, h('span', {}, ch.text), h('span', { class: 'fine', style: 'display:block' }, `Cost: ${ch.cost}`)))));
    };
    render();
  }

  /** The Spare Tag: a trading chain. Each time, two people want what you hold, for different kinds of reasons. */
  openTrade(): void {
    const c = ctx.controller;
    const box = this.openModal('bench-panel wide', 'The Spare Tag');
    this.sfx('sfx.page');
    let have = TRADE_START;
    const kinds: Trader['kind'][] = [];
    const trail: string[] = [];
    const head = () => [this.closeBtn(), h('h2', {}, 'The Spare Tag'), h('p', { class: 'fine' }, `You hold: ${have}.`)];
    const step = (n: number) => {
      if (n >= TRADE_STEPS.length) return end();
      const offers = TRADE_STEPS[n](have);
      box.replaceChildren(...head(),
        h('p', {}, n === 0 ? "A carrier left a spare tag on the ferry step. Two people have seen it in your hand." : `Two people stop you. Both want ${have}.`),
        ...offers.map((o) => h('p', { class: 'clue-view' }, h('strong', {}, `${o.who}: `), o.why)),
        h('div', { class: 'notice-options' }, ...offers.map((o) => h('button', { type: 'button', onclick: () => {
          kinds.push(o.kind); trail.push(`${o.who} wanted it ${TRADE_KIND[o.kind]}`);
          have = o.gives; this.sfx('sfx.coins'); step(n + 1);
        } }, `Give it to ${o.who.split(' ')[0]} (they give you ${o.gives})`))));
    };
    const end = () => {
      c.dispatch({ type: 'SetFlag', flag: 'field.trade.end', value: have });
      const distinct = new Set(kinds).size;
      box.replaceChildren(...head(),
        h('p', {}, `From ${TRADE_START} to ${have}, in three trades.`),
        h('ul', {}, ...trail.map((t) => h('li', {}, t))),
        h('p', {}, `Lumen counts on its glow. 'The tag was worth ${distinct === 1 ? 'the same kind of thing' : `${distinct} different kinds of thing`} along the way. Nobody was wrong about its value. They were valuing different things.'`),
        this.finishField('trade'),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    step(0);
  }

  /** A crossing: one conflict, two or three ways through (face it, go around, leave it). Each way costs something. */
  openCrossing(id: string): void {
    const c = ctx.controller;
    const x = crossingOf(id);
    if (!x) return;
    const box = this.openModal('bench-panel wide', x.title);
    this.sfx('sfx.page');
    const done = crossingWay(c.state.flags, id);
    const close = () => h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close'));
    if (done) {
      box.replaceChildren(this.closeBtn(), h('h2', {}, x.title), h('p', {}, `You chose: ${done.text}`), h('p', { class: 'clue-view' }, done.result), h('p', { class: 'fine' }, `What it cost: ${done.cost}`), close());
      return;
    }
    box.replaceChildren(this.closeBtn(), h('h2', {}, x.title), h('p', {}, x.scene),
      h('p', { class: 'fine' }, `At stake: ${x.stakes.lose}. To win: ${x.stakes.gain}.`),
      h('div', { class: 'notice-options' }, ...x.ways.map((w) => {
        const open = wayOpen(w, c.state);
        return h('button', { type: 'button', disabled: !open, onclick: () => choose(w) },
          h('span', { class: 'fine', style: 'display:block' }, WAY_LABEL[w.kind]), h('span', {}, w.text),
          w.needs ? h('span', { class: 'fine', style: 'display:block' }, open ? `You have: ${w.needs.why}.` : `Needs: ${w.needs.why}. Come back later, or choose another way.`) : '');
      })));
    const choose = (w: (typeof x.ways)[number]) => {
      c.dispatch({ type: 'SetFlag', flag: `cross.${id}`, value: w.id });
      this.sfx(w.kind === 'ignore' ? 'sfx.page' : 'sfx.award');
      box.replaceChildren(this.closeBtn(), h('h2', {}, x.title), h('p', { class: 'clue-view fresh' }, w.result), h('p', { class: 'fine' }, `What it cost: ${w.cost}`),
        h('p', { class: 'clue-view' }, h('strong', {}, 'The idea: '), x.idea), close());
    };
  }

  /** Hearth talks in the Nexus: the companions talk to each other; the player joins with a tone. */
  openHearth(): void {
    const c = ctx.controller, s = c.state;
    const box = this.openModal('bench-panel wide', 'The Hearth');
    this.sfx('sfx.page');
    const name = (who: string) => (who === 'lumen' ? 'Lumen' : c.pack.characters.find((x) => x.id === who)?.name.split(' ')[0] ?? who);
    const ready = HEARTH.filter((t) => c.check(t.after));
    const fresh = ready.find((t) => typeof s.flags[`hearth.${t.id}`] !== 'string');
    const show = (t: HearthTalk) => {
      const heard = s.flags[`hearth.${t.id}`];
      const lines = t.lines.filter((l) => c.check(l.if)).map((l) => h('p', {}, h('strong', {}, `${name(l.who)}: `), l.text));
      const reply = (tone: string) => { const j = t.join.find((x) => x.tone === tone)!; return h('p', { class: 'clue-view fresh' }, h('strong', {}, `You: ${j.text} `), j.reply); };
      box.replaceChildren(this.closeBtn(), h('h2', {}, t.title), ...lines,
        typeof heard === 'string' ? reply(heard) : h('div', { class: 'notice-options' }, ...t.join.map((j) => h('button', { type: 'button', onclick: () => {
          c.dispatch({ type: 'SetFlag', flag: `hearth.${t.id}`, value: j.tone }); this.sfx('sfx.sparkle'); show(t);
        } }, h('span', { class: 'fine', style: 'display:block' }, TONE_LABEL[j.tone]), h('span', {}, j.text)))),
        ready.length > 1 ? h('details', {}, h('summary', {}, 'Remember another evening'), h('div', { class: 'notice-options' }, ...ready.filter((x) => x !== t).map((x) => h('button', { type: 'button', onclick: () => show(x) }, x.title)))) : '',
        h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => this.closeModal() }, 'Leave the hearth')));
    };
    if (fresh) show(fresh);
    else if (ready.length) show(ready[ready.length - 1]);
    else box.replaceChildren(this.closeBtn(), h('h2', {}, 'The Hearth'), h('p', {}, 'The hearth is laid but not lit. After the next big step, your friends will gather here.'),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  /** The Ballad of the Guardian: Wynn sings your deeds, taller than they were. Correct a verse or let it stand. */
  openBallad(): void {
    const c = ctx.controller;
    const box = this.openModal('bench-panel wide', 'The Ballad of the Guardian');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'The Ballad of the Guardian'),
      h('p', {}, "Wynn the ballad-singer tunes a battered fiddle by the well. 'I am making a song about you! Every word is true. Well. True-ish. Songs need a little lift, or nobody sings them twice.'")];
    const render = () => {
      const s = c.state, vs = versesFor(s);
      if (!vs.length) { box.replaceChildren(...head(), h('p', {}, "Wynn: 'Come back when you have done something. Anything! Light a lamp. Rescue a cat. I am not fussy.'"), h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => this.closeModal() }, 'Close'))); return; }
      const open = vs.find((v) => s.flags[`ballad.${v.id}`] !== 'true' && s.flags[`ballad.${v.id}`] !== 'tall');
      const sung = vs.filter((v) => v !== open && (s.flags[`ballad.${v.id}`] === 'true' || s.flags[`ballad.${v.id}`] === 'tall'));
      const parts: (HTMLElement | string)[] = [...head(), ...sung.map((v) => h('p', { class: 'slate-line small' }, `♪ ${s.flags[`ballad.${v.id}`] === 'true' ? v.true(s) : v.tall}`))];
      if (open) {
        parts.push(h('p', { class: 'clue-view fresh' }, `Wynn sings: ♪ ${open.tall}`),
          h('div', { class: 'notice-options' },
            h('button', { type: 'button', onclick: () => { c.dispatch({ type: 'SetFlag', flag: `ballad.${open.id}`, value: 'true' }); this.sfx('sfx.page'); verdict(open.id, 'true'); } }, `Correct it: '${open.true(s)}'`),
            h('button', { type: 'button', onclick: () => { c.dispatch({ type: 'SetFlag', flag: `ballad.${open.id}`, value: 'tall' }); this.sfx('sfx.sparkle'); verdict(open.id, 'tall'); } }, 'Let it stand. It is a song.')));
      } else {
        const nm = balladName(s.flags);
        parts.push(h('p', {}, `Wynn bows. 'That is all the verses you have earned so far. Do more things!'${nm ? ` In the taverns they call you ${s.player.name} ${nm}.` : ''}`),
          nm ? h('div', { class: 'row' }, h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'title.worn', value: nm }); this.refreshHud(); } }, `Wear the name "${nm}"`)) : '',
          this.finishField('ballad'), h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      }
      box.replaceChildren(...parts);
    };
    const verdict = (id: string, how: 'true' | 'tall') => {
      const v = VERSES.find((x) => x.id === id)!;
      box.replaceChildren(...head(), h('p', { class: 'clue-view' }, how === 'true' ? `Wynn sighs and sings the plain verse. 'Harder to dance to. But you were there, and I was not.'` : `Wynn beams. 'It will be all over the valley by Friday.'`),
        h('p', { class: 'fine' }, v.crowd), h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => render() }, 'Next verse')));
    };
    render();
  }

  /** Close a field game: first time gives marks and the idea in the Lore codex. */
  private finishField(id: string): HTMLElement {
    const g = FIELD_GAMES.find((x) => x.id === id)!;
    const ev = ctx.controller.dispatch({ type: 'FinishFieldGame', game: id });
    const first = ev.some((e) => e.kind === 'fieldgame' && e.first);
    if (first) this.sfx('sfx.award');
    return h('p', { class: 'clue-view fresh', role: 'status' }, h('strong', {}, 'The idea: '), g.idea, first ? ' (+3 marks; it is in your Lore codex.)' : '');
  }

  private barPair(rows: { label: string; n: number; of: number }[]): HTMLElement {
    return h('div', { class: 'field-bars' }, ...rows.map((r) => h('div', { class: 'field-bar' },
      h('span', {}, r.label),
      h('span', { class: 'track', role: 'img', 'aria-label': `${r.label}: ${r.n} of ${r.of}` }, h('span', { class: 'fill', style: `width:${r.of ? Math.round((100 * r.n) / r.of) : 0}%` })),
      h('span', { class: 'fine' }, `${r.n} of ${r.of} (${r.of ? Math.round((100 * r.n) / r.of) : 0}%)`))));
  }

  /** Dov's Three Doors: play by feel, then let the counting frame run 300 rounds, then change one assumption. */
  openDoors(): void {
    const c = ctx.controller;
    const runs = Number(c.state.flags['field.doors.runs'] ?? 0);
    c.dispatch({ type: 'SetFlag', flag: 'field.doors.runs', value: runs + 1 });
    const seed = runs + 11;
    const box = this.openModal('bench-panel wide', "Dov's Three Doors");
    this.sfx('sfx.page');
    const tally = { stay: { w: 0, n: 0 }, swap: { w: 0, n: 0 } };
    let round = 0, guess = '';
    const doorRow = (onPick: ((d: number) => void) | null, show: (d: number) => string, cls: (d: number) => string) =>
      h('div', { class: 'doors-row' }, ...[0, 1, 2].map((d) => h('button', { type: 'button', class: `door-crate ${cls(d)}`, disabled: !onPick, 'aria-label': `Crate ${d + 1}: ${show(d) || 'closed'}`, onclick: () => onPick?.(d) },
        h('span', { class: 'door-num' }, String(d + 1)), h('span', { class: 'door-show' }, show(d)))));
    const head = () => [this.closeBtn(), h('h2', {}, "Dov's Three Doors"),
      h('p', {}, "Dov hides a lantern under one of three crates. You pick one. Then Dov, who knows where the lantern is, lifts an empty crate you did not pick. Do you stay, or switch to the last crate?")];
    const tallyLine = () => h('p', { class: 'fine', role: 'status' }, `Your rounds: stayed ${tally.stay.n} times, won ${tally.stay.w} · switched ${tally.swap.n} times, won ${tally.swap.w}.`);
    const pick = () => {
      const prize = doorPrize(seed, round);
      box.replaceChildren(...head(), h('p', {}, h('strong', {}, `Round ${round + 1}. `), 'Pick a crate.'),
        doorRow((d) => decide(prize, d), () => '', () => ''), tallyLine(),
        round >= 6 ? h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => predict() }, "Enough rounds: ask for Dov's counting frame")) : h('p', { class: 'fine' }, `Play at least ${6 - round} more round${6 - round === 1 ? '' : 's'}. Try both plans.`));
    };
    const decide = (prize: number, mine: number) => {
      const opened = pellOpens(prize, mine, true, fairRng(seed * 31 + round));
      const other = [0, 1, 2].find((d) => d !== mine && d !== opened)!;
      box.replaceChildren(...head(), h('p', {}, `You picked crate ${mine + 1}. Dov lifts crate ${opened + 1}: empty. Crate ${other + 1} is still closed.`),
        doorRow(null, (d) => (d === opened ? 'empty' : ''), (d) => (d === mine ? 'mine' : d === opened ? 'open' : '')),
        h('div', { class: 'row' },
          h('button', { type: 'button', onclick: () => reveal(prize, mine, opened, mine) }, `Stay with crate ${mine + 1}`),
          h('button', { type: 'button', onclick: () => reveal(prize, mine, opened, other) }, `Switch to crate ${other + 1}`)), tallyLine());
    };
    const reveal = (prize: number, mine: number, opened: number, final: number) => {
      const plan = final === mine ? 'stay' : 'swap', won = final === prize;
      tally[plan].n++; if (won) tally[plan].w++;
      round++;
      this.sfx(won ? 'sfx.sparkle' : 'sfx.page');
      box.replaceChildren(...head(), h('p', {}, won ? `The lantern was under crate ${prize + 1}. You win it!` : `The lantern was under crate ${prize + 1}. Not this time.`),
        doorRow(null, (d) => (d === prize ? '🏮' : 'empty'), (d) => (d === final ? 'mine' : d === opened ? 'open' : '')), tallyLine(),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => pick() }, 'Next round')));
    };
    const predict = () => {
      box.replaceChildren(...head(), tallyLine(),
        h('p', {}, "Dov grins. 'Feelings are free. Before my counting frame runs 300 rounds: how often do you think switching wins?' Your guess is only for you."),
        h('div', { class: 'notice-options' }, ...['About 1 time in 3', 'About half the time', 'About 2 times in 3'].map((t) => h('button', { type: 'button', onclick: () => { guess = t; frame(); } }, t)),
          h('button', { type: 'button', onclick: () => frame() }, 'Run the counting frame')));
    };
    const frame = () => {
      const k = runDoors(300, seed, true);
      box.replaceChildren(...head(), h('p', {}, 'The counting frame clacks through 300 rounds, with the same rules.'),
        guess ? h('p', { class: 'fine' }, `Your forecast was ${guess.toLowerCase()}.`) : '',
        this.barPair([{ label: 'Stay wins', n: k.stay, of: k.counted }, { label: 'Switch wins', n: k.swap, of: k.counted }]),
        h('p', {}, "Dov: 'Your first pick is right 1 time in 3. When it is wrong (2 times in 3), I must leave the lantern under the other crate, because I never lift it. So switching wins 2 times in 3.'"),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => forgets() }, "But what if Dov forgets where the lantern is?")));
    };
    const forgets = () => {
      const k = runDoors(300, seed + 7, false);
      box.replaceChildren(...head(),
        h('p', {}, `Now Dov has forgotten. He lifts one of the other crates at random. In ${k.setAside} of 300 rounds he shows the lantern, so those rounds are set aside. In the rest:`),
        this.barPair([{ label: 'Stay wins', n: k.stay, of: k.counted }, { label: 'Switch wins', n: k.swap, of: k.counted }]),
        h('p', {}, 'The crates look the same, and so do the moves. The only change is what Dov knew. His knowledge was information, and it changed the answer: now it is about half and half.'),
        this.finishField('doors'),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    pick();
  }

  /** The Ferry Guest Book: guess how many passengers sign before two share a birthday, then watch twenty boats. */
  openGuestBook(): void {
    const c = ctx.controller;
    const runs = Number(c.state.flags['field.guests.runs'] ?? 0);
    c.dispatch({ type: 'SetFlag', flag: 'field.guests.runs', value: runs + 1 });
    const seed = runs + 5;
    const box = this.openModal('bench-panel wide', 'The Ferry Guest Book');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'The Ferry Guest Book'),
      h('p', {}, "Tova keeps a guest book on the ferry. Each passenger writes the day of their birthday. 'The ferry folk have an old bet,' she says. 'How many passengers sign before two have the same birthday?'")];
    let guess = 0;
    const ask = () => {
      const slider = h('input', { type: 'range', min: '2', max: '200', value: '60', 'aria-label': 'Your guess: passengers before two share a birthday' }) as HTMLInputElement;
      const out = h('strong', {}, '60');
      slider.oninput = () => { out.textContent = slider.value; };
      box.replaceChildren(...head(), h('p', {}, 'Your guess, for a usual boat: about how many passengers sign before the first shared birthday? (A year has 365 days.)'),
        ...this.rumourReplies('ferry'),
        h('div', { class: 'row' }, slider, out),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => { guess = Number(slider.value); boat(0); } }, 'Open the book for the first boat')));
    };
    const boat = (n: number) => {
      const g = boatGuests(seed, n);
      const last = g[g.length - 1], firstAt = g.indexOf(last);
      box.replaceChildren(...head(), h('p', {}, `Boat ${n + 1}. Your guess: ${guess}.`),
        h('ol', { class: 'guest-list' }, ...g.map((d, i) => h('li', { class: i === firstAt || i === g.length - 1 ? 'match' : '' }, dayName(d)))),
        h('p', { role: 'status' }, h('strong', {}, `Passenger ${g.length} shares a birthday with passenger ${firstAt + 1}: ${dayName(last)}.`)),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => many() }, 'Read the next twenty boats')));
    };
    const many = () => {
      const counts = Array.from({ length: 20 }, (_, i) => boatGuests(seed, i + 1).length);
      const max = Math.max(...counts), within23 = counts.filter((k) => k <= 23).length;
      const W = 280, H = 110, bw = W / counts.length;
      const svg = `<svg viewBox="0 0 ${W} ${H + 16}" class="guest-chart" role="img" aria-label="Passengers on each of twenty boats before a shared birthday">` +
        counts.map((k, i) => `<rect x="${i * bw + 2}" y="${H - (k / max) * H}" width="${bw - 4}" height="${(k / max) * H}" class="${k <= 23 ? 'low' : 'high'}"/>`).join('') +
        `<line x1="0" x2="${W}" y1="${H - (23 / max) * H}" y2="${H - (23 / max) * H}" class="mark"/><text x="2" y="${H - (23 / max) * H - 3}" class="lbl">23</text>` +
        `<line x1="0" x2="${W}" y1="${H - (Math.min(guess, max) / max) * H}" y2="${H - (Math.min(guess, max) / max) * H}" class="guess"/><text x="${W - 60}" y="${H - (Math.min(guess, max) / max) * H - 3}" class="lbl">your guess</text></svg>`;
      const chart = h('div', {}); chart.innerHTML = svg;
      box.replaceChildren(...head(), chart,
        h('p', { role: 'status' }, `On ${within23} of 20 boats, two passengers shared a birthday by passenger 23. The middle boat needed about ${[...counts].sort((a, b) => a - b)[10]} passengers. Your guess was ${guess}.`),
        h('p', {}, `Tova laughs. 'It feels like you need hundreds. But you are not waiting for someone to match you. Any two can match. Twenty-three people make 253 pairs.' The chance for 23 people is ${Math.round(shareChance(23) * 1000) / 10}%; for 50 people it is ${Math.round(shareChance(50) * 1000) / 10}%.`),
        this.finishField('guests'),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    ask();
  }

  /** The Weigh-House Slate: one line, two careful readers, two answers. The story decides; brackets make it clear. */
  openSlate(): void {
    const box = this.openModal('bench-panel wide', 'The Weigh-House Slate');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'The Weigh-House Slate'),
      h('p', {}, 'Someone chalked a line on the Weigh-House slate. Clerk Venn and young Ren both worked it out with care, and they do not agree.'),
      h('p', { class: 'slate-line' }, SLATE.written)];
    const readers = () => {
      box.replaceChildren(...head(),
        h('div', { class: 'slate-readers' }, ...SLATE.readers.map((r) => h('div', { class: 'ware' }, h('strong', {}, r.who), h('p', { class: 'fine' }, r.rule),
          h('ol', { class: 'slate-steps' }, ...r.steps.map((st) => h('li', {}, st)))))),
        h('p', {}, h('strong', {}, 'Who made a mistake?')),
        h('div', { class: 'notice-options' },
          h('button', { type: 'button', onclick: () => note('Venn did. Ren is right.') }, 'Venn did. Ren is right.'),
          h('button', { type: 'button', onclick: () => note('Ren did. Venn is right.') }, 'Ren did. Venn is right.'),
          h('button', { type: 'button', onclick: () => note('') }, 'Neither. They follow different rules.')));
    };
    const note = (blame: string) => {
      box.replaceChildren(...head(),
        h('p', { class: 'clue-view fresh' }, blame
          ? `${blame} ... but look again: each one followed a rule, step by step, with no slip. The trouble is the line, not the sums.`
          : 'Yes: both worked carefully. The rules for which sum to do first are a convention that people agreed on, and here two conventions meet.'),
        h('p', {}, 'Orrin finds the person who chalked it. They tell you what the line was for. Pick the story:'),
        h('div', { class: 'notice-options' }, ...SLATE.stories.map((st) => h('button', { type: 'button', onclick: () => write(st) }, st.text))));
    };
    const write = (st: (typeof SLATE.stories)[number]) => {
      box.replaceChildren(...head(), h('p', { class: 'clue-view' }, st.text),
        h('p', {}, 'Rewrite the line so that every reader gets the same answer, and it is the answer this story needs.'),
        h('div', { class: 'notice-options' }, ...SLATE.clear.map((line) => h('button', { type: 'button', class: 'slate-line small', onclick: () => {
          const v = evalClear(line);
          if (v !== st.result) { box.querySelector('.slate-msg')?.remove(); box.append(h('p', { class: 'clue-view slate-msg', role: 'status' }, `That line is clear: everyone gets ${v}. But this story needs ${st.result}. Try the other one.`)); return; }
          this.sfx('sfx.sparkle');
          box.replaceChildren(...head(), h('p', { class: 'slate-line' }, line, ` = ${v}`),
            h('p', {}, "Venn and Ren both read it the same way now. Venn: 'So the sums were never wrong. The line just did not say enough.' Ren: 'Then who decided the rule in the first place?' Orrin: 'People did. A long time ago, so that strangers could read each other's sums.'"),
            this.finishField('slate'),
            h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
        } }, line))));
    };
    readers();
  }

  /** A companion loyalty mission: three sources, the companion's blind spot, and a dilemma where every choice costs something. */
  openLoyalty(id: string): void {
    const c = ctx.controller;
    const m = loyaltyOf(id);
    if (!m) return;
    const box = this.openModal('bench-panel wide', m.title);
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, m.title), h('p', {}, m.intro)];
    const done = c.state.flags[`loyalty.${id}`];
    if (typeof done === 'string') {
      const ch = m.choices.find((x) => x.id === done)!;
      box.replaceChildren(this.closeBtn(), h('h2', {}, m.title), h('p', {}, `You chose: ${ch.text}`), h('p', { class: 'clue-view' }, `${m.who}: ${ch.reply}`), h('p', { class: 'fine' }, `What it cost: ${ch.cost}`),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      return;
    }
    const checked = new Set<number>();
    let slip: 'open' | 'fixed' | 'missed' | null = null;
    const render = () => {
      const parts: (HTMLElement | string)[] = [...head(),
        h('div', { class: 'notice-options' }, ...m.sources.map((src, i) => h('button', { type: 'button', class: checked.has(i) ? 'seen' : '', onclick: () => { checked.add(i); if (slip === null) slip = 'open'; this.sfx('sfx.page'); render(); } }, `${checked.has(i) ? '✓ ' : ''}${src.label}`))),
        ...m.sources.filter((_, i) => checked.has(i)).map((src) => h('p', { class: 'clue-view' }, h('strong', {}, `${src.label}: `), src.text))];
      if (slip === 'open') {
        parts.push(h('p', { class: 'clue-view fresh' }, m.slip.says),
          h('div', { class: 'notice-options' },
            h('button', { type: 'button', onclick: () => { slip = 'fixed'; c.dispatch({ type: 'SetFlag', flag: `loyalty.${id}.noticed`, value: true }); this.sfx('sfx.sparkle'); render(); } }, m.slip.notice),
            h('button', { type: 'button', onclick: () => { slip = 'missed'; render(); } }, 'Let it pass and keep reading.')));
      } else if (slip === 'fixed') parts.push(h('p', { class: 'fine' }, m.slip.fixed));
      if (slip === 'missed' && checked.size === m.sources.length) parts.push(h('p', { class: 'fine' }, m.slip.miss));
      if (checked.size === m.sources.length && slip !== 'open') {
        parts.push(h('h3', {}, m.question), h('p', { class: 'fine' }, 'Every choice here has a cost. There is no hidden right answer.'),
          h('div', { class: 'notice-options' }, ...m.choices.map((ch) => h('button', { type: 'button', onclick: () => choose(ch) }, h('span', {}, ch.text), h('span', { class: 'fine', style: 'display:block' }, `Cost: ${ch.cost}`)))));
      } else if (checked.size < m.sources.length) parts.push(h('p', { class: 'fine' }, `Check all three sources before you decide (${checked.size} of 3).`));
      box.replaceChildren(...parts);
    };
    const choose = (ch: (typeof m.choices)[number]) => {
      c.dispatch({ type: 'SetFlag', flag: `loyalty.${id}`, value: ch.id });
      this.sfx('sfx.award');
      box.replaceChildren(this.closeBtn(), h('h2', {}, m.title), h('p', { class: 'clue-view fresh' }, `${m.who}: ${ch.reply}`), h('p', { class: 'fine' }, `What it cost: ${ch.cost}`),
        h('p', { class: 'clue-view' }, h('strong', {}, 'The idea: '), m.idea),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  /** Lanterns and Bones: Juno's dice table. Is a six 'due'? Which die is loaded? No betting: only evidence. */
  openBones(): void {
    const c = ctx.controller;
    const runs = Number(c.state.flags['field.bones.runs'] ?? 0);
    c.dispatch({ type: 'SetFlag', flag: 'field.bones.runs', value: runs + 1 });
    const seed = runs + 3;
    const box = this.openModal('bench-panel wide', 'Lanterns and Bones');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'Lanterns and Bones'),
      h('p', {}, "Juno the ferry cook keeps a dice table by the landing. 'Nobody wins anything here,' Juno says, 'except a better guess. Old cooks say: the pot does not know how long you waited.' A small grey creature sits on the table edge, counting on its fingers.")];
    const r = fairRng(seed * 7 + 1);
    const rolls: number[] = [];
    const face = (v: number) => h('span', { class: `die-face${v === 6 ? ' six' : ''}`, 'aria-label': `rolled ${v}` }, String(v));
    const drought = () => { let n = 0; for (let i = rolls.length - 1; i >= 0 && rolls[i] !== 6; i--) n++; return n; };
    const table = () => {
      const d = drought();
      const claim = d >= 3;
      box.replaceChildren(...head(),
        h('div', { class: 'dice-row', role: 'list' }, ...rolls.slice(-12).map(face)),
        h('p', { class: 'fine', role: 'status' }, rolls.length ? `${rolls.length} rolls. ${d} in a row without a six.` : 'Roll the ferry die.'),
        claim ? h('p', { class: 'clue-view' }, `The creature squeaks: '${d} without a six! The next one must be a six. It is due! Everyone knows it!'`) : '',
        h('div', { class: 'row' },
          h('button', { type: 'button', class: claim ? '' : 'primary', onclick: () => { rolls.push(roll(r)); this.sfx('sfx.click'); table(); } }, 'Roll'),
          claim ? h('button', { type: 'button', class: 'primary', onclick: () => tally(d) }, "Ask Juno: 'Is it due?'") : ''));
    };
    const tally = (d: number) => {
      const k = dueTest(1200, seed, 3);
      box.replaceChildren(...head(),
        h('p', {}, `Juno opens a greasy tally book. 'Twelve hundred rolls of this same die, from many evenings. I marked every roll that came after three or more without a six. You said ${d} in a row. Let us look.'`),
        this.barPair([{ label: 'Six, after a dry run', n: k.sixes, of: k.after }, { label: 'Six, any roll', n: k.allSixes, of: k.all }]),
        h('p', {}, "Both are about 1 in 6. The die has no memory of the rolls before. The creature's 'due' feeling is strong, and it is wrong. Juno: 'Its name is the Gambler's Imp. It lives on long waits.'"),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => twoDice() }, "Juno: 'Now a harder one. Two dice.'")));
    };
    const twoDice = () => {
      const { loaded } = diceFor(seed);
      const rr = fairRng(seed * 19 + 2);
      const tallies = [[0, 0], [0, 0]];
      const add = (i: number, n: number) => { for (let k = 0; k < n; k++) { tallies[i][0]++; if (roll(rr, i === loaded ? 1 / 3 : 1 / 6) === 6) tallies[i][1]++; } render(); };
      const name = ['the red die', 'the bone die'];
      const render = (msg?: HTMLElement) => box.replaceChildren(...head(),
        h('p', {}, "Juno sets down a red die and a bone die. 'One of these is loaded: it shows six too often. Roll each as much as you like. Call it when you feel sure enough. No prize, no cost.'"),
        this.barPair(tallies.map((t, i) => ({ label: `Sixes on ${name[i]}`, n: t[1], of: t[0] }))),
        h('div', { class: 'row' }, ...[0, 1].flatMap((i) => [
          h('button', { type: 'button', onclick: () => add(i, 1) }, `Roll ${name[i]}`),
          h('button', { type: 'button', onclick: () => add(i, 10) }, `Roll ${name[i]} 10 times`)])),
        tallies[0][0] + tallies[1][0] >= 6
          ? h('div', { class: 'notice-options' }, ...[0, 1].map((i) => h('button', { type: 'button', onclick: () => call(i) }, `Call it: ${name[i]} is loaded`)))
          : h('p', { class: 'fine' }, 'Roll at least six times before you call it.'),
        ...(msg ? [msg] : []));
      const call = (i: number) => {
        const n = tallies[0][0] + tallies[1][0];
        if (i !== loaded) {
          render(h('p', { class: 'clue-view', role: 'status' }, `Juno turns ${name[i]} over. 'This one is fair. After ${n} rolls, the luck of the bones can still fool you. Roll more, and watch whether the gap stays.'`));
          return;
        }
        this.sfx('sfx.sparkle');
        box.replaceChildren(...head(),
          this.barPair(tallies.map((t, k) => ({ label: `Sixes on ${name[k]}`, n: t[1], of: t[0] }))),
          h('p', {}, `Juno nods. 'Right: ${name[loaded]} is loaded. You used ${n} rolls. ${n < 40 ? 'That was quick. Were you sure, or lucky? With so few rolls, a fair die can look loaded too.' : 'That is a good handful. The more rolls, the less likely a fair die looks this way by chance.'}'`),
          h('p', {}, "The Gambler's Imp hops off the table and into the reeds, muttering about its next long wait."),
          this.finishField('bones'),
          h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      };
      render();
    };
    table();
  }

  /** The Missing Word: paint one fact with a word you choose, see who notices what, then name a feeling that lost its word. */
  openMissingWord(): void {
    const c = ctx.controller;
    const box = this.openModal('bench-panel wide', 'The Missing Word');
    this.sfx('sfx.page');
    const head = () => [this.closeBtn(), h('h2', {}, 'The Missing Word'),
      h('p', {}, `Odo the sign-painter dips his brush. 'Maudie wants a notice: from next market day, ${FACT.what} goes from ${FACT.from} marks to ${FACT.to} marks. The fact is fixed. The word is yours. Every word paints a different picture, so choose with care.'`)];
    const seen = new Set<string>();
    const reactions = (w: Wording, reason: boolean) => h('div', { class: 'word-readers' }, ...READERS.map((r) => h('div', { class: 'ware' },
      h('strong', {}, r.who), h('p', { class: 'fine' }, r.about), h('p', {}, reason ? WITH_REASON[r.id] : w.says[r.id]))));
    const choose = () => {
      box.replaceChildren(...head(),
        h('p', {}, h('strong', {}, 'Try a word on the board. '), 'Odo chalks it lightly first, so you can see how people read it.'),
        h('div', { class: 'notice-options' }, ...WORDINGS.map((w) => h('button', { type: 'button', class: seen.has(w.id) ? 'seen' : '', onclick: () => preview(w) }, `'${w.word}'${seen.has(w.id) ? ' (tried)' : ''}`))));
    };
    const preview = (w: Wording) => {
      seen.add(w.id);
      box.replaceChildren(...head(), h('p', { class: 'slate-line small' }, w.line), h('p', { class: 'fine' }, w.tone), reactions(w, false),
        h('div', { class: 'row' },
          h('button', { type: 'button', onclick: () => choose() }, 'Chalk another word'),
          seen.size >= 2
            ? h('button', { type: 'button', class: 'primary', onclick: () => paint(w) }, `Paint '${w.word}' for good`)
            : h('span', { class: 'fine' }, 'Try one more word before you paint.')));
    };
    const paint = (w: Wording) => {
      box.replaceChildren(...head(), h('p', { class: 'slate-line small' }, w.line),
        h('p', {}, `Maudie hurries over. 'There is room for one more line. Will you paint why? ${FACT.reason[0].toUpperCase()}${FACT.reason.slice(1)}.'`),
        h('div', { class: 'notice-options' },
          h('button', { type: 'button', onclick: () => painted(w, true) }, 'Paint the reason too'),
          h('button', { type: 'button', onclick: () => painted(w, false) }, 'Leave only the toll')));
    };
    const painted = (w: Wording, reason: boolean) => {
      c.dispatch({ type: 'SetFlag', flag: 'word.painted', value: w.id });
      c.dispatch({ type: 'SetFlag', flag: 'word.reason', value: reason });
      this.sfx('sfx.sparkle');
      box.replaceChildren(...head(), h('p', { class: 'slate-line small' }, paintedNotice(c.state.flags) ?? w.line), reactions(w, reason),
        h('p', { class: 'fine' }, reason
          ? 'With a reason on the board, people argue about the beams, not only the price.'
          : 'With only the toll on the board, people read the word and fill in the reason for themselves.'),
        h('div', { class: 'row' }, h('button', { type: 'button', class: 'primary', onclick: () => chest() }, "Odo: 'Now, about my word chest...'")));
    };
    const chest = () => {
      const heard = new Set<string>();
      const render = () => box.replaceChildren(this.closeBtn(), h('h2', {}, 'The Missing Word'),
        h('p', {}, "Odo opens his word chest. One slot is empty, and grey dust is on the lid. A Hush Moth has eaten a word. Since then, people feel something they cannot say. Ask them what they feel."),
        h('div', { class: 'notice-options' }, ...READERS.map((r) => h('button', { type: 'button', onclick: () => { heard.add(r.id); render(); } }, `Ask ${r.who}${heard.has(r.id) ? ' (heard)' : ''}`))),
        ...READERS.filter((r) => heard.has(r.id)).map((r) => h('p', { class: 'clue-view' }, h('strong', {}, `${r.who}: `), ATTEMPTS[r.id])),
        heard.size === READERS.length
          ? h('div', {}, h('p', {}, "Odo: 'Three people, three pieces of one feeling. The old word is gone. We need a new one. Which will you carve?'"),
            h('div', { class: 'notice-options' }, ...COINAGES.map((k) => h('button', { type: 'button', onclick: () => coin(k) }, `'${k.word}': ${k.meaning}`))))
          : h('p', { class: 'fine' }, 'Hear everyone before you carve a word.'));
      render();
    };
    const coin = (k: Coinage) => {
      c.dispatch({ type: 'SetFlag', flag: 'word.coined', value: k.id });
      box.replaceChildren(this.closeBtn(), h('h2', {}, 'The Missing Word'),
        h('p', { class: 'slate-line small' }, k.word),
        h('p', {}, `You carve '${k.word}' into a new tile and drop it in the chest. The Hush Moth shakes the dust from its wings and flutters away. ${k.centre}`),
        h('p', {}, "Odo: 'A word is a lantern. The person who holds it decides where the light falls. You held it today.'"),
        this.finishField('word'),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    const now = paintedNotice(c.state.flags);
    if (now) {
      const w = wordingOf(c.state.flags['word.painted'])!, k = coinageOf(c.state.flags['word.coined']);
      box.replaceChildren(...head(), h('p', {}, 'Your notice is still on the board:'), h('p', { class: 'slate-line small' }, now), reactions(w, c.state.flags['word.reason'] === true),
        k ? h('p', { class: 'fine' }, `In Odo's word chest, your tile still says '${k.word}'. People use it now.`) : h('p', { class: 'fine' }, "Odo's word chest still has an empty slot."),
        h('div', { class: 'row' },
          h('button', { type: 'button', onclick: () => choose() }, 'Paint a new notice'),
          k ? h('button', { type: 'button', class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Leave it') : h('button', { type: 'button', class: 'primary', onclick: () => chest() }, 'Open the word chest')));
    } else choose();
  }

  /** A fallacy seal in the Undercroft: it speaks a bad argument; name the flaw to open it. */
  openSeal(id: string): void {
    const c = ctx.controller;
    const x = SEALS.find((y) => y.id === id);
    if (!x) return;
    const fray = (c.pack.fray ?? []).find((f) => f.id === x.fray);
    const box = this.openModal('bench-panel wide', x.name);
    this.sfx('sfx.page');
    const render = (note?: { ok: boolean; why: string }) => {
      box.replaceChildren(this.closeBtn(), h('h2', {}, x.name),
        h('p', {}, 'Runes of gold and violet fill the corridor from wall to wall. As you come near, they speak:'),
        h('p', { class: 'clue-view' }, x.says),
        ...(note ? [h('p', { class: `clue-view ${note.ok ? 'fresh' : ''}`, role: 'status' }, note.why)] : []),
        note?.ok
          ? h('div', {}, h('p', {}, `The runes fade, and the way is open.${fray ? ` You name it: ${fray.name} (${fray.error.toLowerCase()}). See the Fray Bestiary.` : ''}`),
            h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Go on')))
          : h('div', {}, h('p', {}, h('strong', {}, 'What is wrong with this argument?')),
            h('div', { class: 'notice-options' }, ...x.options.map((o, i) => h('button', { type: 'button', onclick: () => {
              const ev = c.dispatch({ type: 'DisarmSeal', seal: x.id, choice: i });
              const r = ev.find((e) => e.kind === 'seal') as Extract<GameEvent, { kind: 'seal' }> | undefined;
              if (!r) return;
              this.sfx(r.ok ? 'sfx.sparkle' : 'sfx.page');
              render({ ok: r.ok, why: r.ok ? r.why : `${r.why} The runes hold. Try again.` });
            } }, o.text)))));
    };
    render();
  }

  /** The Hollow Archivist: a Fray 'boss' in three phases. Each phase is a new argument; a wrong answer is explained, never punished. */
  openBoss(): void {
    const c = ctx.controller;
    if (!allSealsOpen(c.state.flags)) { this.showSign(BOSS.name, 'The seals still block the way.'); return; }
    const box = this.openModal('bench-panel wide boss-panel', BOSS.name);
    this.sfx('sfx.page');
    const art = h('img', { src: artURL('hollow-archivist'), alt: '', class: 'boss-art' });
    const render = (note?: { ok: boolean; why: string; done: boolean }) => {
      const f = c.state.flags;
      const ph = bossPhase(f), hollow = Number(f[`boss.${BOSS.id}.hollow`] ?? 0);
      const pips = h('div', { class: 'boss-phases', role: 'img', 'aria-label': `Phase ${Math.min(ph + 1, BOSS.phases.length)} of ${BOSS.phases.length}` },
        ...BOSS.phases.map((_, i) => h('span', { class: i < ph ? 'on' : '' })));
      if (bossDone(f)) {
        box.replaceChildren(this.closeBtn(), h('h2', {}, BOSS.name), pips,
          ...(note ? [h('p', { class: 'clue-view fresh' }, note.why)] : []),
          h('p', {}, BOSS.end),
          h('p', { class: 'fine', role: 'status' }, `+10 marks. Six Fray met in the Undercroft are in the Bestiary.${hollow ? ` The Archivist grew ${hollow} time${hollow === 1 ? '' : 's'}; each time, you tried again.` : ' You never fed it once.'}`),
          h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
        return;
      }
      const p = BOSS.phases[ph];
      art.style.transform = `scale(${1 + Math.min(hollow, 6) * 0.06 - ph * 0.1})`;
      box.replaceChildren(this.closeBtn(), h('h2', {}, BOSS.name), pips,
        h('div', { class: 'boss-stage' }, art, h('div', {},
          ph === 0 && !note ? h('p', {}, BOSS.intro) : null,
          h('p', { class: 'clue-view' }, p.says),
          ...(note ? [h('p', { class: `clue-view ${note.ok ? 'fresh' : ''}`, role: 'status' }, note.why)] : []))),
        h('p', {}, h('strong', {}, 'Your move')),
        h('div', { class: 'notice-options' }, ...p.options.map((o, i) => h('button', { type: 'button', onclick: () => {
          const ev = c.dispatch({ type: 'BossMove', choice: i });
          const r = ev.find((e) => e.kind === 'boss') as Extract<GameEvent, { kind: 'boss' }> | undefined;
          if (!r) return;
          this.sfx(r.ok ? (r.done ? 'sfx.award' : 'sfx.sparkle') : 'sfx.page');
          if (r.done) ctx.world?.lumenBurst();
          render({ ok: r.ok, why: r.why, done: r.done });
        } }, o.text))),
        h('p', { class: 'fine' }, 'A wrong move feeds the Archivist, but it never ends the fight. Read why, and try again.'));
    };
    render();
  }

  /** Knower roles: one way of knowing, with a strength and a blind spot. First choice anywhere; change at a Waystone. */
  openRoles(atWaystone = false): void {
    const c = ctx.controller;
    const box = this.openModal('talents-panel wide', 'Knower role');
    this.sfx('sfx.page');
    const render = (note?: string) => {
      const cur = roleOf(c.state.flags);
      const canPick = !cur || atWaystone;
      box.replaceChildren(this.closeBtn(), h('h2', {}, 'Knower role'),
        h('p', {}, 'Every knower has a way of knowing that comes easily, and a blind spot. Choose a role: it marks the dialogue options that fit it (◆), and Lumen\'s hints add its question and its blind spot. It never gives XP and never hides an option. You can try every role: change it at any Waystone.'),
        ...(note ? [h('p', { class: 'clue-view fresh', role: 'status' }, note)] : []),
        h('div', { class: 'shop-grid' }, ...ROLES.map((r) => h('div', { class: `ware ${cur?.id === r.id ? 'owned' : ''}` },
          h('strong', {}, r.name), h('p', { class: 'fine' }, `Like ${r.like}`),
          h('p', {}, h('strong', {}, 'Strength: '), r.strength), h('p', {}, h('strong', {}, 'Blind spot: '), r.blind),
          cur?.id === r.id ? h('span', { class: 'fine' }, 'Your role now.')
            : h('button', { type: 'button', disabled: !canPick, onclick: () => { c.dispatch({ type: 'ChooseRole', role: r.id }); this.sfx('sfx.sparkle'); render(`You are a ${r.name} now. Look for ◆ in conversations.`); } }, canPick ? 'Take this role' : 'Change at a Waystone')))),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  openTalents(atWaystone = false): void {
    const c = ctx.controller;
    const box = this.openModal('talents-panel wide', 'Insight tree');
    let shown: 'stars' | 'talents' = 'stars';
    const render = (note?: string) => {
      const s = c.state, free = insight(s) - spent(s);
      box.replaceChildren(this.closeBtn(), h('h2', {}, 'Insight tree'),
        h('div', { class: 'row', role: 'group', 'aria-label': 'Insight tree view' },
          ...([['stars', 'Field stars'], ['talents', 'Travel abilities']] as const).map(([id, label]) => h('button', {
            type: 'button', 'aria-pressed': String(shown === id), 'data-star-view': id,
            onclick: () => { shown = id; render(); box.querySelector<HTMLButtonElement>(`[data-star-view="${id}"]`)?.focus(); },
          }, label))),
        shown === 'stars' ? starChart(c) : h('div', {},
        h('p', {}, 'Each lamp you light gives one Insight point. Spend it on a travel ability.'),
        h('p', { class: 'fine', role: 'status' }, `Insight: ${free} free of ${insight(s)}.`),
        ...(note ? [h('p', { class: 'fine', role: 'alert' }, note)] : []),
        h('div', { class: 'talent-grid' }, ...TALENTS.map((t) => {
          const have = hasTalent(s, t.id), why = cannotLearn(s, t.id);
          return h('div', { class: `talent ${have ? 'have' : ''} ${t.needs ? 'branch' : 'root'}` },
            h('span', { class: 'fine' }, `${t.skill} · ${t.cost} Insight${t.needs ? ` · after ${TALENTS.find((x) => x.id === t.needs)?.name}` : ''}`),
            h('strong', {}, t.name), h('p', {}, t.text), h('p', { class: 'fine' }, t.why),
            have ? h('span', { class: 'fine' }, 'Learned') : h('button', { type: 'button', disabled: !!why, title: why ?? '', onclick: () => {
              const ev = c.dispatch({ type: 'LearnTalent', talent: t.id });
              if (ev.some((e) => e.kind === 'error')) return;
              this.sfx('sfx.sparkle'); render(`You learned ${t.name}.`);
            } }, why ?? 'Learn'));
        }))),
        h('div', { class: 'row' },
          shown === 'talents' && spent(c.state) ? atWaystone
            ? h('button', { onclick: () => { c.dispatch({ type: 'ForgetTalents' }); this.sfx('sfx.page'); render('All Insight is free again. Try another set.'); } }, 'Unlearn all (free at a Waystone)')
            : h('span', { class: 'fine' }, 'You can unlearn talents for free at any Waystone.') : null,
          h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  /**
   * The Maker's bench: make measuring tools from gathered ore, clay and reeds. Each tool asks one
   * calibration question. Any answer makes the tool; a checked tool is marked 'calibrated'.
   */
  openWorkbench(): void {
    const c = ctx.controller;
    const box = this.openModal('bench-panel wide', "The Maker's bench");
    this.sfx('sfx.page');
    const ask = (r: (typeof RECIPES)[number], mode: 'Craft' | 'Calibrate') => {
      box.replaceChildren(this.closeBtn(), h('h2', {}, `${mode === 'Craft' ? 'Make' : 'Calibrate'}: ${r.name}`),
        h('p', {}, 'Before a tool is used, it is checked. ', h('strong', {}, r.check.q)),
        h('div', { class: 'notice-options' }, ...r.check.options.map((o, i) => h('button', { type: 'button', onclick: () => {
          const ev = c.dispatch({ type: mode, recipe: r.id, choice: i });
          const res = ev.find((e) => e.kind === 'craft') as Extract<GameEvent, { kind: 'craft' }> | undefined;
          if (!res) return;
          this.sfx(res.ok ? 'sfx.sparkle' : 'sfx.page');
          render(`${res.ok ? 'Calibrated. ' : `${mode === 'Craft' ? 'The tool is made, but not calibrated. ' : 'Not calibrated yet. '}`}${res.why}`);
        } }, o.text))),
        h('div', { class: 'row' }, h('button', { onclick: () => render() }, 'Back')));
    };
    const render = (note?: string) => {
      const s = c.state;
      box.replaceChildren(this.closeBtn(), h('h2', {}, "The Maker's bench"),
        h('p', {}, "Hesper lets anyone use this bench. Gather iron ore, river clay and reeds around Emberford and at the ferry landing (each place gives 2 a day). A tool is only as good as its last check."),
        h('p', { class: 'fine', role: 'status' }, (Object.keys(RESOURCES) as Resource[]).map((k) => `${RESOURCES[k]}: ${resCount(s.flags, k)}`).join(' · ')),
        ...(note ? [h('p', { class: 'clue-view fresh' }, note)] : []),
        h('div', { class: 'shop-grid' }, ...RECIPES.map((r) => {
          const have = !!s.inventory[r.item], cal = s.flags[`craft.${r.id}.calibrated`] === true, why = cannotCraft(s.flags, r.id);
          return h('div', { class: `ware ${have && cal ? 'owned' : ''}` },
            h('strong', {}, r.name), h('p', {}, r.use),
            h('p', { class: 'fine' }, `Needs: ${(Object.entries(r.cost) as [Resource, number][]).map(([k, n]) => `${n} ${k === 'reed' && n === 1 ? 'reed' : RESOURCES[k].toLowerCase()}`).join(', ')}`),
            have ? h('p', { class: 'fine' }, cal ? 'Made and calibrated.' : 'Made, not calibrated.') : null,
            have ? (cal ? h('span', {}) : h('button', { type: 'button', onclick: () => ask(r, 'Calibrate') }, 'Calibrate'))
              : h('button', { type: 'button', disabled: !!why, onclick: () => ask(r, 'Craft') }, why ?? 'Make it'));
        })),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  private rumourReplies(desk: RumourDesk): HTMLElement[] {
    const received = RUMOURS.filter((r) => ctx.controller.state.flags[`mill.${r.id}.desk`] === desk);
    if (!received.length) return [];
    return [h('section', {}, h('h3', {}, 'Slips from the tea table'),
      ...received.map((r) => h('p', {}, h('strong', {}, r.title + '. '), r.handoffs[desk].reply)))];
  }

  openRumours(): void {
    const c = ctx.controller;
    const d = new Date();
    const seed = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    const box = this.openModal('bench-panel wide', 'The rumour mill');
    this.sfx('sfx.page');
    const render = (selected?: string, feedback = '', checkOpen = false) => {
      const flags = c.state.flags;
      const filed = RUMOURS.filter((caseFile) => flags[`mill.${caseFile.id}.done`] === true);
      const r = selected ? RUMOURS.find((candidate) => candidate.id === selected) : currentRumour(flags, seed);
      const focusNext = () => box.querySelector<HTMLElement>('.source-btn, .notice-options button:enabled, .slip-tray summary')?.focus();
      const tray = filed.length ? h('details', { class: 'slip-tray' }, h('summary', {}, 'Reopen a traced slip'),
        ...filed.map((file) => h('button', { type: 'button', onclick: () => { render(file.id); focusNext(); } }, file.title))) : null;
      const head = [this.closeBtn(), h('h2', {}, 'The rumour mill')];
      if (!r) {
        box.replaceChildren(...head, h('p', {}, 'The tea is cold. Every story has been traced. The afternoon runner can still move a slip to a different reader.'), ...(tray ? [tray] : []));
        return;
      }
      const seen = sourcesChecked(flags, r);
      const missing = missingRumourSources(flags, r);
      const ready = missing.length === 0;
      const done = filed.includes(r);
      const desk = flags[`mill.${r.id}.desk`];
      const route = (destination: RumourDesk) => {
        const event = c.dispatch({ type: 'RouteRumour', rumour: r.id, desk: destination }).find((e) => e.kind === 'rumour');
        if (!event) return;
        this.sfx('sfx.page');
        render(r.id, event.why);
        box.querySelector<HTMLElement>('.next-rumour')?.focus();
      };
      const verdict = (index: number) => {
        const event = c.dispatch({ type: 'JudgeRumour', rumour: r.id, verdict: index }).find((e) => e.kind === 'rumour');
        if (!event) return;
        this.sfx(event.ok ? 'sfx.sparkle' : 'sfx.page');
        render(r.id, event.why, !event.ok);
        (box.querySelector<HTMLElement>('.next-rumour') ?? box.querySelectorAll<HTMLElement>('.verdicts button')[index])?.focus();
      };
      box.replaceChildren(...head,
        h('p', { class: 'fine' }, r.heard), h('p', { class: 'clue-view' }, r.line),
        ...r.sources.map((src, index) => seen.includes(index)
          ? h('p', { class: 'clue-view fresh' }, h('strong', {}, src.label + '. '), src.text)
          : h('button', { type: 'button', class: 'source-btn', onclick: () => {
            c.dispatch({ type: 'CheckRumourSource', rumour: r.id, source: index });
            this.sfx('sfx.page'); render(r.id); focusNext();
          } }, src.label)),
        ...(!ready ? [h('p', { class: 'fine' }, `The runner waits for another record. ${missing.map((i) => r.sources[i].label).join(' · ')}.`)] : []),
        h('h3', {}, 'One slip for the next shift'),
        h('p', {}, 'The guild copy stays in town. The ferry copy goes to the landing. The runner can move it on a later shift.'),
        h('div', { class: 'notice-options' }, ...RUMOUR_DESKS.map((dest) =>
          h('button', { type: 'button', disabled: !ready || desk === dest, onclick: () => route(dest) }, r.handoffs[dest].action))),
        ...(desk === 'ledger' || desk === 'ferry' ? [h('small', {}, desk === 'ledger' ? 'Current slip in the guild’s public record book.' : 'Current slip in Tova’s ferry guest book.')] : []),
        ...(!done ? [h('details', { class: 'verdicts', open: checkOpen }, h('summary', {}, 'Record a verdict'),
          h('div', { class: 'notice-options' }, ...VERDICTS.map((v, i) => h('button', { type: 'button', disabled: !ready, onclick: () => verdict(i) }, v))))] : []),
        ...(feedback ? [h('p', { class: 'clue-view fresh', role: 'status' }, feedback)] : []),
        ...(done ? [h('button', { type: 'button', class: 'primary next-rumour', onclick: () => { render(); focusNext(); } }, 'Listen for the next rumour')] : []),
        ...(done ? [h('details', {}, h('summary', {}, 'Look back at the records'), h('p', {}, r.whys[r.best]), h('p', {}, r.idea))] : []),
        ...(tray ? [tray] : []), h('small', { class: 'fine' }, `Rumours traced: ${filed.length} of ${RUMOURS.length}.`));
    };
    render();
  }

  /** A field reading: a made, calibrated tool tests a claim someone in town makes. */
  openReading(id: string): void {
    const c = ctx.controller;
    const r = readingOf(id);
    if (!r) return;
    const t = toolOf(r);
    const box = this.openModal('bench-panel wide', r.place);
    this.sfx('sfx.page');
    const head = [this.closeBtn(), h('h2', {}, r.place), h('p', { class: 'clue-view' }, r.claim)];
    const blocked = cannotRead(c.state, id);
    if (blocked) {
      box.replaceChildren(...head, h('p', {}, blocked),
        h('p', { class: 'fine' }, `${t.name}: ${t.use}`),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      return;
    }
    const done = Number(c.state.flags['count.readings'] ?? 0);
    box.replaceChildren(...head,
      h('p', {}, h('strong', {}, `Your ${t.name.toLowerCase()}: `), r.result),
      h('p', {}, h('strong', {}, r.q)),
      h('div', { class: 'notice-options' }, ...r.options.map((o, i) => h('button', { type: 'button', onclick: () => {
        const ev = c.dispatch({ type: 'TakeReading', reading: id, choice: i });
        const res = ev.find((e) => e.kind === 'reading') as Extract<GameEvent, { kind: 'reading' }> | undefined;
        if (!res) return;
        this.sfx(res.ok ? 'sfx.sparkle' : 'sfx.page');
        const n = Number(c.state.flags['count.readings'] ?? 0);
        box.replaceChildren(...head,
          h('p', { class: 'clue-view fresh' }, res.why),
          ...(res.first ? [h('p', { class: 'fine', role: 'status' }, `Reading recorded (+4 marks). Field readings: ${n} of ${READINGS.length}.`)] : []),
          h('div', { class: 'row' },
            res.ok ? null : h('button', { type: 'button', onclick: () => this.openReading(id) }, 'Think again'),
            h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      } }, o.text))),
      h('p', { class: 'fine' }, `Field readings taken: ${done} of ${READINGS.length}. A reading is evidence; what it shows is your call, and you explain it.`));
  }

  openTiles(daily = false): void {
    const box = this.openModal('tiles-panel wide', SEFA_TABLE, this.closeBtn());
    const stitching = sefaStitching(ctx.controller, {
      daily,
      calm: ctx.settings.calmMode,
      sound: (key) => this.sfx(key),
      replay: (mode) => this.openTiles(mode),
      refresh: () => ctx.world?.refreshWorld(),
    });
    this.releaseStitching = stitching.dispose;
    box.append(stitching.panel);
  }

  /** The Lamp Wall (storyline): one lamp for each knot the town unties. Six lamps open the old Guardian's cellar. */
  openLamps(): void {
    const c = ctx.controller;
    const knots = c.pack.knots ?? [];
    const n = knots.filter((k) => c.state.flags[`lamp.${k.id}`] === true).length;
    const heard = c.state.flags['lamps.heard'] === true;
    const box = this.openModal('lamps-panel wide', 'The Lamp Wall');
    this.sfx('sfx.page');
    box.append(this.closeBtn(), h('h2', {}, 'The Lamp Wall'),
      h('p', {}, heard
        ? 'Each lamp is a hard question that Emberford worked out together, with evidence. Guardian Elsbet Varro lit them for years. Now you light them, with the people of the town.'
        : 'Sixteen small lamps on an old board by the guild hall door. A brass plate says: ONE LAMP FOR EACH KNOT THE TOWN UNTIES. Most lamps are dark. Guildmaster Orrin may know why.'),
      h('p', { class: 'lamp-count', role: 'status' }, `${n} of ${knots.length} lamps lit. `,
        n >= 6 ? 'The cellar door beside the guild hall is open.' : `${6 - n} more, and the cellar door beside the guild hall opens.`),
      h('ol', { class: 'lamp-grid' }, ...knots.map((k) => {
        const on = c.state.flags[`lamp.${k.id}`] === true;
        return h('li', { class: `lamp ${on ? 'on' : ''}` },
          h('span', { class: 'flame', 'aria-hidden': 'true' }),
          h('span', {}, h('strong', {}, k.name), h('br'), h('span', { class: 'fine' }, on ? k.lit : `Dark. Help ${k.who}.`)));
      })),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  /**
   * A clue object in the old Guardian's study. The first look gives the plain view. Each keepsake the
   * player holds can show a new view: another perspective, or a new pathway (a hidden thing opens).
   */
  openClue(id: string): void {
    const c = ctx.controller;
    const cl = (c.pack.clues ?? []).find((x) => x.id === id);
    if (!cl) return;
    c.dispatch({ type: 'ReadClue', clue: id });
    const keep = new Map((c.pack.keepsakes ?? []).map((k) => [k.id, k]));
    const low = (n: string) => n.replace(/^(A|An|The) /, (m) => m.toLowerCase());
    const box = this.openModal('clue-panel', cl.name);
    this.sfx('sfx.page');
    const render = (fresh?: string) => {
      box.replaceChildren(this.closeBtn(), h('h2', {}, cl.name), h('p', {}, cl.text));
      for (const v of cl.views) {
        const k = keep.get(v.keepsake);
        const has = c.state.flags[`keepsake.${v.keepsake}`] === true || (k ? c.check(k.if) : false);
        const seen = c.state.flags[`clue.${id}.${v.keepsake}`] === true;
        if (seen) box.append(h('div', { class: `clue-view ${fresh === v.keepsake ? 'fresh' : ''}` }, h('p', { class: 'fine' }, `With ${low(k?.name ?? v.keepsake)}:`), h('p', {}, v.text)));
        else if (has) box.append(h('button', { type: 'button', class: 'clue-use', onclick: () => {
          const ev = c.dispatch({ type: 'UseKeepsake', clue: id, keepsake: v.keepsake });
          if (ev.some((e) => e.kind === 'error')) return;
          this.sfx('sfx.sparkle'); render(v.keepsake);
          ctx.world?.refreshWorld();
        } }, `Use ${low(k?.name ?? v.keepsake)}`));
        else box.append(h('p', { class: 'fine clue-missing' }, `Something here would mean more with a keepsake you have not found yet${k ? ` (${k.where.replace(/\.$/, '')})` : ''}.`));
      }
      box.append(h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': !fresh, onclick: () => this.closeModal() }, 'Close')));
    };
    render();
  }

  openDive(): void {
    const c = ctx.controller;
    const day = dayKey(new Date());
    const prompts = c.pack.divePrompts ?? [], all = c.pack.diveItems ?? [];
    const today = dailyPrompts(prompts, day);
    let open: string | null = null, item: string | null = null, note: { ok: boolean; text: string } | null = null;
    let shown = diveDepth(prompts, all, c.state.flags, day).metres;
    const box = this.openModal('dive-panel wide', 'The Deep Dive');
    const MAXM = 330, y = (m: number) => 14 + (Math.min(m, MAXM) / MAXM) * 380;
    const creature = (m: number, svg: string, reached: number) => `<g opacity="${reached >= m - 5 ? 1 : 0.18}">${svg}</g>`;
    const ocean = (m: number) => `<svg viewBox="0 0 160 420" aria-hidden="true">
      <defs><linearGradient id="dv-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fc3e8"/><stop offset="0.2" stop-color="#2b7fb3"/><stop offset="0.45" stop-color="#174a7a"/><stop offset="0.75" stop-color="#0b2142"/><stop offset="1" stop-color="#04081a"/></linearGradient></defs>
      <rect width="160" height="420" fill="url(#dv-sea)"/>
      <path d="M0 8 q20 -6 40 0 t40 0 t40 0 t40 0 V0 H0 z" fill="#bfe8f7" opacity="0.7"/>
      ${DIVE_ZONES.map((z) => `<line x1="0" y1="${y(z.from)}" x2="160" y2="${y(z.from)}" stroke="#ffffff" stroke-opacity="0.15" stroke-dasharray="3 4"/><text x="156" y="${y(z.from) + 10}" font-size="7" fill="#e8f6ff" fill-opacity="0.7" text-anchor="end">${z.name} · ${z.from} m</text>`).join('')}
      ${creature(20, [[30, 40], [42, 46], [36, 52], [50, 40]].map(([fx, fy]) => `<path d="M${fx} ${fy} q5 -4 10 0 q-5 4 -10 0 z M${fx + 10} ${fy} l4 -3 v6 z" fill="#ffd25a"/>`).join(''), m)}
      ${creature(45, '<g fill="#7ad0a0"><path d="M120 60 q4 -20 0 -40" stroke="#4fa070" stroke-width="3" fill="none"/><path d="M130 62 q-4 -18 2 -34" stroke="#4fa070" stroke-width="3" fill="none"/></g>', m)}
      ${creature(90, '<g><path d="M50 110 a12 9 0 0 1 24 0 z" fill="#f2a7d8" opacity="0.85"/><path d="M53 110 q2 12 -2 20 M60 110 q1 14 0 22 M67 110 q-1 12 2 20" stroke="#f2a7d8" stroke-width="1.5" fill="none"/></g>', m)}
      ${creature(130, '<g fill="#9fb3c8"><path d="M98 160 q16 -10 32 0 q-16 10 -32 0 z"/><path d="M130 160 l8 -6 v12 z"/><circle cx="104" cy="158" r="1.5" fill="#04081a"/></g>', m)}
      ${creature(190, '<g><path d="M28 230 q12 -9 24 0 q-12 9 -24 0 z" fill="#2c3e60"/><path d="M40 222 q6 -10 14 -10" stroke="#5a7090" fill="none"/><circle cx="55" cy="212" r="3" fill="#9fe8ff"/><circle cx="55" cy="212" r="7" fill="#9fe8ff" opacity="0.3"/></g>', m)}
      ${creature(240, '<g fill="none" stroke="#c39bff" stroke-width="1.5"><circle cx="118" cy="270" r="6"/><path d="M112 276 q-6 10 0 18 M118 276 v20 M124 276 q6 10 0 18"/></g>', m)}
      ${creature(300, '<g><path d="M40 360 q40 -26 80 0 q-40 12 -80 0 z" fill="#3a2a6a"/><path d="M60 356 q20 -10 40 0" stroke="#ffd25a" stroke-width="1" fill="none"/><circle cx="72" cy="352" r="2" fill="#ffd25a"/><circle cx="88" cy="352" r="2" fill="#ffd25a"/><text x="80" y="384" font-size="7" fill="#e8f6ff" text-anchor="middle">a trench ray</text></g>', m)}
      <rect x="0" y="404" width="160" height="16" fill="#1b1330"/>
      <g class="dv-diver" style="transform: translateY(${y(m) - 14}px)"><line x1="80" y1="${-y(m) + 6}" x2="80" y2="0" stroke="#e8f6ff" stroke-opacity="0.5"/><path d="M70 12 q10 -16 20 0 z" fill="#c9a24a" stroke="#6b4f19"/><rect x="70" y="11" width="20" height="4" fill="#8a6a2a"/><circle cx="80" cy="6" r="3" fill="#9fe8ff"/>${ctx.settings.reducedMotion ? '' : '<circle class="dv-bub" cx="86" cy="0" r="1.6" fill="#e8f6ff"/><circle class="dv-bub b2" cx="76" cy="-2" r="1.2" fill="#e8f6ff"/>'}</g>
    </svg>`;
    const render = () => {
      clear(box);
      const st = diveDepth(prompts, all, c.state.flags, day);
      const mine = diveItems(all, c.state);
      const best = Number(c.state.flags['dive.best'] ?? 0);
      const sea = h('div', { class: 'dive-sea', role: 'img', 'aria-label': `Your diver is ${st.metres} metres down, in the ${zoneAt(st.metres).toLowerCase()}.` });
      sea.innerHTML = ocean(shown);
      if (shown !== st.metres) requestAnimationFrame(() => { shown = st.metres; const d = sea.querySelector('.dv-diver') as SVGGElement | null; if (d) d.style.transform = `translateY(${y(st.metres) - 14}px)`; setTimeout(() => { if (box.isConnected) render(); }, ctx.settings.reducedMotion ? 0 : 900); });
      const list = h('div', { class: 'dive-prompts' }, ...today.map((pr) => {
        const v = c.state.flags[`dive.${day}.${pr.id}`];
        const ans = typeof v === 'string' ? (() => { const [id, fi] = v.split(':'); const it = all.find((x) => x.id === id); return it ? { it, f: it.facets[Number(fi)] } : null; })() : null;
        const head = h('button', { type: 'button', class: `dive-prompt ${ans ? 'done' : ''} ${open === pr.id ? 'open' : ''}`, 'aria-expanded': String(open === pr.id), disabled: !!ans,
          onclick: () => { open = open === pr.id ? null : pr.id; item = null; note = null; this.sfx('sfx.click'); render(); } },
          h('span', { class: 'dp-text' }, pr.text), h('span', { class: 'dp-tags' }, `${CONCEPT_NAMES[pr.concept]} · ${AOK_NAMES[pr.aok]}`),
          ans ? h('span', { class: 'dp-ans' }, `✓ ${ans.it.name}: ${ans.f.text} (${DIVE_DEPTH_TEXT[ans.f.rarity]})`) : '');
        if (open !== pr.id || ans) return h('div', {}, head);
        const body = h('div', { class: 'dive-pick' });
        if (!mine.length) body.append(h('p', { class: 'fine' }, 'You have not found anything to dive with yet. Cards and finished activities appear here.'));
        else if (!item) body.append(h('p', { class: 'fine' }, 'Answer with something you found. Then choose which side of it fits.'),
          h('div', { class: 'row wrap dive-items' }, ...mine.map((it) => h('button', { type: 'button', class: `dive-item ${it.kind}`, onclick: () => { item = it.id; note = null; this.sfx('sfx.page'); render(); } }, it.kind === 'card' ? '🂠 ' : '★ ', it.name))));
        else {
          const it = mine.find((x) => x.id === item)!;
          body.append(h('p', {}, h('strong', {}, it.name), ' — which side of it answers the prompt?'),
            h('div', { class: 'options notice-options' }, ...it.facets.map((f, fi) => h('button', { type: 'button', onclick: () => {
              const r = judgeDive(pr, it, fi);
              note = r;
              if (r.ok) { c.dispatch({ type: 'DiveAnswer', day, prompt: pr.id, item: it.id, facet: fi }); open = null; item = null; playNotes([{ f: 523, at: 0, beats: 0.4 }, { f: 659, at: 0.25, beats: 0.4 }, { f: 784, at: 0.5, beats: 0.4 }, { f: 1046, at: 0.75, beats: 0.8 }].map((n) => ({ ...n, f: n.f / (1 + st.metres / 400) })), 0.22, 'flute', ctx.settings.sfxVolume); }
              else this.sfx('sfx.page');
              render();
            } }, h('span', { class: 'notice-text' }, f.text)))),
            h('button', { type: 'button', onclick: () => { item = null; note = null; render(); } }, '← Choose something else'));
        }
        return h('div', {}, head, body);
      }));
      box.append(this.closeBtn(), h('h2', {}, 'The Deep Dive'),
        h('p', {}, `Seven prompts for ${day}, the same for every diver today. Answer each with something you found in play. Any answer that fits takes you down; a less obvious one takes you deeper. There is no single right answer.`),
        h('div', { class: 'dive-body' }, h('div', {}, sea, h('p', { class: 'dive-depth' }, h('strong', {}, `${st.metres} m`), ` · ${zoneAt(st.metres)} · ${st.answered} of ${today.length} answered`), h('p', { class: 'fine' }, `Your deepest dive: ${Math.max(best, st.metres)} m.`)), list),
        note ? h('div', { class: `alcove-feedback ${note.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, note.text) : '',
        h('p', { class: 'fine' }, 'New prompts come each day. The dive gives no XP: it is for finding examples you would not think of first.'));
    };
    render();
  }

  openQuarters(): void {
    const c = ctx.controller;
    let room: Room = decodeRoom(c.state.flags['room']) ?? structuredClone(DEFAULT_ROOM);
    let selected: number | null = null;
    let info: string | null = null;
    const box = this.openModal('quarters-panel wide', 'My quarters');
    const owned = (c.pack.keepsakes ?? []).filter((k) => c.check(k.if));
    room = { ...room, shelf: room.shelf.map((x) => (x && owned.some((k) => k.id === x) ? x : null)) };
    const rings = conceptRings(c.permanent, c.pack).sort((a, b) => Object.keys(CONCEPT_NAMES).indexOf(a.concept) - Object.keys(CONCEPT_NAMES).indexOf(b.concept));
    const ringData = rings.map((r) => ({ got: r.got, max: r.max, colour: RING_COLOURS[r.concept] ?? '#e9cf7a' }));
    const stars = rings.reduce((a, r) => a + starsFor(r.got, r.max), 0);
    const glowHex = '#' + LUMEN_COLOURS[ctx.settings.lumenColour].toString(16).padStart(6, '0');
    const canvas = h('canvas', { class: 'room-canvas', width: ROOM_W, height: ROOM_H, role: 'img' }) as HTMLCanvasElement;
    const g = canvas.getContext('2d')!;
    const crest = decodeCrest(c.state.flags['crest']);
    const paint = (t: number) => drawRoom(g, room, { rings: ringData, crest, lumen: glowHex, selected, t });
    const describe = () => {
      const items = room.shelf.filter(Boolean).map((id) => owned.find((k) => k.id === id)?.name.toLowerCase()).join(', ');
      canvas.setAttribute('aria-label', `Your quarters: ${WALLS[room.wall].name} walls, ${FLOORS[room.floor].name.toLowerCase()}, a ${LAMPS[room.lamp].name.toLowerCase()}, a window onto ${VIEWS[room.view].name.toLowerCase()}${room.pet && PETS[room.pet] ? `, and ${/^[aeiou]/i.test(PETS[room.pet]!.name) ? 'an' : 'a'} ${PETS[room.pet]!.name.toLowerCase()} on the rug` : ''}. Star Chart: ${stars} stars. Shelves: ${items || 'empty'}.`);
    };
    const save = () => { c.dispatch({ type: 'SetFlag', flag: 'room', value: encodeRoom(room) }); describe(); };
    const loop = (t: number) => { if (!canvas.isConnected) return; paint(t); if (!ctx.settings.reducedEffects) requestAnimationFrame(loop); };
    const pick = (label: string, k: 'wall' | 'floor' | 'rug' | 'lamp' | 'view' | 'plant' | 'pet', opts: Record<string, { name: string } | null>) => h('label', { class: 'room-pick' }, h('span', {}, label),
      h('select', { onchange: (e: Event) => { room = { ...room, [k]: (e.target as HTMLSelectElement).value }; this.sfx('sfx.click'); save(); paint(performance.now()); } },
        ...Object.entries(opts).map(([v, o]) => { const lk = lockedOption(c.state, k, v); return h('option', { value: v, selected: (room[k] ?? 'none') === v, disabled: !!lk }, `${o?.name ?? 'None'}${lk ? " (at Corvan's stall)" : ''}`); })));
    const shelfRow = h('div', { class: 'row wrap shelf-slots', role: 'group', 'aria-label': 'Shelf slots' });
    const ksList = h('div', { class: 'keepsakes' });
    const infoBox = h('p', { class: 'fine keepsake-info', 'aria-live': 'polite' });
    const renderLists = () => {
      clear(shelfRow); clear(ksList);
      for (let i = 0; i < SLOTS; i++) {
        const id = room.shelf[i];
        const k = owned.find((x) => x.id === id);
        shelfRow.append(h('button', { type: 'button', class: `slot-btn ${selected === i ? 'picked' : ''}`, 'aria-pressed': String(selected === i),
          onclick: () => { selected = selected === i ? null : i; info = k ? `${k.name}. ${k.text}${k.use ? ` Use: ${k.use}` : ''}` : 'An empty place. Choose a keepsake below to put here.'; renderLists(); paint(performance.now()); } },
          k ? iconCanvas(k.id, 2) : h('span', { class: 'fine' }, '·'), h('span', {}, `${i < 3 ? 'Top' : 'Low'} ${(i % 3) + 1}`)));
      }
      ksList.append(...(c.pack.keepsakes ?? []).map((k) => {
        const have = owned.includes(k);
        if (!have) return h('div', { class: 'keepsake locked' }, h('span', { class: 'q', 'aria-hidden': 'true' }, '?'), h('span', {}, h('strong', {}, 'Not found yet'), h('br'), h('span', { class: 'fine' }, k.where)));
        const at = room.shelf.indexOf(k.id);
        return h('button', { type: 'button', class: `keepsake ${at >= 0 ? 'placed' : ''}`, title: k.text,
          onclick: () => {
            if (selected === null) { info = `${k.name}. ${k.text}${k.use ? ` Use: ${k.use}` : ''} ${at >= 0 ? 'It is on your shelf.' : 'Choose a shelf place first, then this keepsake.'}`; renderLists(); return; }
            room = placeKeepsake(room, selected, room.shelf[selected] === k.id ? null : k.id);
            info = room.shelf[selected] ? `${k.name} is on the shelf. ${k.text}` : `${k.name} is back in your satchel.`;
            this.sfx('sfx.sparkle'); save(); renderLists(); paint(performance.now());
          } }, iconCanvas(k.id, 3), h('span', {}, h('strong', {}, k.name), at >= 0 ? h('span', { class: 'fine' }, ` (shelf ${at < 3 ? 'top' : 'low'} ${(at % 3) + 1})`) : ''));
      }));
      infoBox.textContent = info ?? `${owned.length} of ${(c.pack.keepsakes ?? []).length} keepsakes found. Choose a shelf place, then a keepsake.`;
    };
    box.append(this.closeBtn(), h('h2', {}, 'My quarters'),
      h('p', {}, 'Your own room in the Nexus. The ceiling is your Star Chart: each concept ring you fill adds a star, and a full ring joins its stars into a constellation. The shelves hold keepsakes from the places you have helped.'),
      h('div', { class: 'room-wrap' }, canvas),
      h('p', { class: 'fine' }, `Star Chart: ${stars} of ${rings.length * 5} stars lit.`),
      h('div', { class: 'room-picks' }, pick('Walls', 'wall', WALLS), pick('Floor', 'floor', FLOORS), pick('Rug', 'rug', RUGS), pick('Lamp', 'lamp', LAMPS), pick('Window view', 'view', VIEWS), pick('Plant', 'plant', PLANTS), pick('Companion', 'pet', PETS)),
      h('h3', {}, 'Shelves'), shelfRow, infoBox, h('h3', {}, 'Keepsakes'), ksList);
    describe(); renderLists(); paint(0);
    if (!ctx.settings.reducedEffects) requestAnimationFrame(loop);
  }

  openScoutTable(): void {
    this.openModal('scout-table wide', 'Scout’s turn board', this.closeBtn(),
      h('h2', {}, 'Scout’s turn board'), buildScoutBoard(ctx.controller));
  }

  openCouncilClock(): void {
    const controller = ctx.controller;
    const picture = h('canvas', { class: 'mark', width: 172, height: 83, 'aria-hidden': 'true' });
    const watches = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Watches on the bench' });
    const output = h('div', { 'aria-live': 'polite' });
    const action = h('div', {});
    const paint = (watch: string, reference?: string) => {
      const g = picture.getContext('2d');
      if (!g) return;
      g.fillStyle = '#342e43'; g.fillRect(0, 0, picture.width, picture.height);
      const face = (x: number, time?: string) => {
        g.fillStyle = time ? '#ede1b4' : '#67627e';
        g.beginPath(); g.arc(x, 35, 27, 0, 2 * Math.PI); g.fill();
        if (!time) return;
        const [hour, minute] = time.split(':').map(Number);
        g.strokeStyle = '#443c44';
        const hand = (fraction: number, length: number, width: number) => {
          const angle = 2 * Math.PI * fraction - Math.PI / 2;
          g.lineWidth = width;
          g.beginPath(); g.moveTo(x, 35);
          g.lineTo(x + length * Math.cos(angle), 35 + length * Math.sin(angle)); g.stroke();
        };
        hand((hour + minute / 60) / 12, 13, 3);
        hand(minute / 60, 22, 1);
      };
      face(43, watch);
      face(129, reference);
      g.fillStyle = '#ede1b4'; g.font = '10px monospace'; g.textAlign = 'center';
      g.fillText('Watch', 43, 76); g.fillText('Reference', 129, 76);
    };
    const select = (trial: CouncilTrial) => {
      for (const button of watches.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.trial === trial));
      }
      const reading = councilClock(trial);
      paint(reading.watch);
      output.textContent = `The watch reads ${reading.watch}.`;
      const compare = h('button', { type: 'button', onclick: () => {
        paint(reading.watch, reading.reference);
        output.textContent = `Watch ${reading.watch} · Reference ${reading.reference}.`;
        const advance = h('button', { type: 'button', onclick: () => {
          const events = controller.dispatch({ type: 'RunCouncilClock', trial });
          if (events.some((event) => event.kind === 'error')) return;
          const nextReference = reading.reference.slice(0, 3) + '01';
          paint(reading.after, nextReference);
          output.textContent = `One minute later, watch ${reading.after} · reference ${nextReference}.`;
          clear(action);
          watches.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus();
        } }, 'Advance one minute');
        action.replaceChildren(advance);
        advance.focus();
      } }, 'Uncover the reference clock');
      action.replaceChildren(compare);
      compare.focus();
    };
    for (const [index, trial] of COUNCIL_TRIALS.entries()) {
      watches.append(h('button', { type: 'button', 'data-trial': trial, 'aria-pressed': 'false', onclick: () => select(trial) }, `Set watch ${index + 1} on the bench`));
    }
    paint(councilClock('working').watch);
    this.openModal('council-clock wide', 'Watch bench', this.closeBtn(), h('h2', {}, 'Watch bench'),
      h('p', {}, 'The three watches show the same time. Uncover the reference clock and watch what changes over a minute.'),
      picture, watches, output, action);
  }

  openIslandPlan(): void {
    const controller = ctx.controller;
    let landing: IslandLanding = 'high';
    let selected: IslandRoute | null = null;
    const labels: Record<IslandRoute, string> = { ridge: 'Ridge cart', ferry: 'Ferry', marsh: 'Marsh handcart' };
    const conditions = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Landing conditions' });
    const choices = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Routes for the order' });
    const output = h('div', { 'aria-live': 'polite' });
    const diagram = h('canvas', { class: 'mark', width: 188, height: 94, 'aria-hidden': 'true' });
    const traces = {
      ridge: [[15, 47], [27, 17], [134, 17], [171, 48]],
      ferry: [[15, 47], [57, 43], [106, 43], [171, 48]],
      marsh: [[15, 47], [37, 74], [127, 71], [171, 48]],
    } as const;
    const paint = () => {
      const g = diagram.getContext('2d');
      if (!g) return;
      g.fillStyle = '#447784'; g.fillRect(0, 0, 188, 94);
      g.fillStyle = '#74876c'; g.fillRect(0, 0, 42, 94); g.fillRect(142, 0, 46, 94);
      g.fillRect(32, 5, 120, 23); g.fillRect(27, 62, 122, 32);
      g.fillStyle = '#8e8366'; g.fillRect(57, 10, 50, 5); g.fillRect(72, 7, 40, 3);
      g.fillStyle = '#9bae8c';
      for (let x = 59; x <= 119; x += 21) g.fillRect(x, 65, 10, 21);
      for (const route of ISLAND_ROUTES) {
        g.strokeStyle = route === selected ? '#fff0ab' : '#283d42';
        g.lineWidth = route === selected ? 3 : 1;
        g.beginPath();
        for (const [i, [x, y]] of traces[route].entries()) {
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.fillStyle = '#eed9a3'; g.fillRect(10, 43, 10, 9); g.fillRect(167, 43, 10, 9);
    };
    for (const condition of ISLAND_LANDINGS) {
      const waiting = condition === 'low' && controller.state.flags['island.lower.read'] !== true;
      conditions.append(h('button', {
        type: 'button', 'data-landing': condition, 'aria-pressed': String(condition === landing), disabled: waiting,
        onclick: () => {
          landing = condition;
          selected = null;
          for (const button of conditions.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.landing === landing));
          for (const button of choices.querySelectorAll('button')) button.setAttribute('aria-pressed', 'false');
          clear(output);
          paint();
        },
      }, condition === 'high' ? 'High landing' : waiting ? 'Lower landing report at the dock' : 'Lower landing'));
    }
    for (const route of ISLAND_ROUTES) {
      choices.append(h('button', { type: 'button', 'data-route': route, 'aria-pressed': 'false', onclick: () => {
        const events = controller.dispatch({ type: 'RunIslandPlan', route, landing });
        if (events.some((event) => event.kind === 'error')) return;
        selected = route;
        for (const button of choices.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.route === route));
        const result = islandPlan(landing, route);
        output.replaceChildren(
          h('p', {}, h('strong', {}, 'Transport chart'), ` · ${result.capacity} crates per run · ${result.circuits} runs`,
            ` · first load at ${result.minutes / result.circuits} min · all crates at ${result.minutes} min`),
          h('p', {}, h('strong', {}, 'Quiet margin map'), ` · ${result.crossings} marked strip crossings across those runs`));
        paint();
      } }, labels[route]));
    }
    paint();
    this.openModal('island-plan wide', 'Planning table', this.closeBtn(), h('h2', {}, 'Planning table'),
      h('p', {}, `Move ${ISLAND_CRATES} crates in a 50-minute shift. The transport chart uses a complete circuit for each run. The quiet map counts visits to marked strips.`),
      diagram, conditions, choices, output);
  }

  openVoicesDesk(): void {
    const controller = ctx.controller;
    const headings: Record<VoiceView, string> = { original: 'Open the source', guide: 'Open the guide copy' };
    const cards = h('div', { class: 'voices-records' });
    for (const source of VOICE_SOURCES) {
      const { label, date } = voiceReading(source, 'original');
      const allowed = source !== 'carrier' || controller.state.flags['voices.permissions.read'] === true;
      const output = h('div', { 'aria-live': 'polite' });
      const controls = h('div', { class: 'row wrap' });
      for (const view of VOICE_VIEWS) {
        controls.append(h('button', {
          type: 'button', 'data-view': view, 'aria-pressed': 'false', disabled: !allowed,
          onclick: () => {
            const events = controller.dispatch({ type: 'RunVoiceReading', source, view });
            if (events.some((event) => event.kind === 'error')) return;
            for (const button of controls.querySelectorAll('button')) {
              button.setAttribute('aria-pressed', String(button.dataset.view === view));
            }
            const reading = voiceReading(source, view);
            output.replaceChildren(h('p', {}, reading.text), h('p', { class: 'fine' }, reading.purpose));
            if ('speechSynthesis' in window) output.append(h('button', { type: 'button', class: 'mini', onclick: () => this.speak(reading.text) }, 'Read this excerpt aloud'));
          },
        }, headings[view]));
      }
      cards.append(h('section', { class: 'voices-record' }, h('h3', {}, label), h('p', { class: 'fine' }, date),
        controls, allowed ? output : h('p', {}, 'See the permission card by the listening desk.')));
    }
    this.openModal('voices-desk wide', 'Listening desk', this.closeBtn(), h('h2', {}, 'Listening desk'), cards);
  }

  openCivicConsole(): void {
    const controller = ctx.controller;
    let sample: CivicSample = 'desk';
    const sampleLabels: Record<CivicSample, string> = { desk: 'Desk register', combined: 'Desk and walking registers' };
    const ruleLabels: Record<CivicRule, string> = {
      rank: 'Send all windows to the larger count',
      reserve: 'Start with one window per stop',
      even: 'Give both stops two windows',
    };
    const registers = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Registers on the console' });
    const rules = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Rules for assigning windows' });
    const counts = h('p', { 'aria-live': 'polite' });
    const plan = h('div', { 'aria-live': 'polite' });
    const drawSample = () => {
      const { counts: { steps, canal } } = civicAllocation(sample, 'even');
      counts.textContent = `Requests on this register: ${steps} at North Steps · ${canal} at Canal Walk.`;
      for (const button of registers.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.sample === sample));
      }
      for (const button of rules.querySelectorAll('button')) button.setAttribute('aria-pressed', 'false');
      clear(plan);
    };
    for (const register of CIVIC_SAMPLES) {
      const waiting = register === 'combined' && controller.state.flags['civic.walk.read'] !== true;
      registers.append(h('button', {
        type: 'button', 'data-sample': register, 'aria-pressed': 'false',
        disabled: waiting,
        onclick: () => { sample = register; drawSample(); },
      }, waiting ? 'Walking register at Canal Walk' : sampleLabels[register]));
    }
    for (const rule of CIVIC_RULES) {
      rules.append(h('button', { type: 'button', 'data-rule': rule, 'aria-pressed': 'false', onclick: () => {
        const events = controller.dispatch({ type: 'RunCivicTrial', sample, rule });
        if (events.some((event) => event.kind === 'error')) return;
        for (const button of rules.querySelectorAll('button')) {
          button.setAttribute('aria-pressed', String(button.dataset.rule === rule));
        }
        const { windows } = civicAllocation(sample, rule);
        plan.replaceChildren(h('p', {}, `Library windows: ${windows.steps} at North Steps · ${windows.canal} at Canal Walk.`),
          h('div', { class: 'civic-windows', 'aria-hidden': 'true' },
            ...Array.from({ length: 4 }, (_, index) => h('span', { class: index < windows.steps ? 'steps' : 'canal' },
              index < windows.steps ? 'Steps' : 'Canal'))));
      } }, ruleLabels[rule]));
    }
    drawSample();
    this.openModal('civic-console', 'Route console', this.closeBtn(), h('h2', {}, 'Route console'),
      h('p', {}, 'Four library appointment windows are free. Put a register on the console and run a rule.'),
      registers, counts, rules, plan);
  }

  openWaterGate(): void {
    const controller = ctx.controller;
    const condition: WaterCondition = controller.state.flags['water.repaired'] === true ? 'repaired' : 'drought';
    const labels: Record<WaterSetting, string> = { fields: 'Open toward fields', split: 'Split the flow', channel: 'Open toward the lower channel' };
    const picture = h('canvas', { class: 'mark', width: 184, height: 96, 'aria-hidden': 'true' });
    const controls = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Gate lever position' });
    const readings = h('div', { 'aria-live': 'polite' });
    const paint = (flow?: ReturnType<typeof waterTrial>) => {
      const g = picture.getContext('2d');
      if (!g) return;
      g.fillStyle = '#223b45'; g.fillRect(0, 0, 184, 96);
      g.fillStyle = '#654e3d'; g.fillRect(0, 3, 184, 23); g.fillRect(72, 42, 40, 51);
      g.fillStyle = '#745c45'; g.fillRect(3, 57, 56, 36); g.fillRect(127, 57, 54, 36);
      g.fillStyle = '#527258';
      for (let x = 7; x < 57; x += 8) g.fillRect(x, 63, 3, 25);
      g.fillStyle = '#4f6361';
      for (let x = 133; x < 175; x += 7) g.fillRect(x, 61, 3, 28);
      const stream = (x: number, y: number, w: number, height: number) => {
        g.fillStyle = '#398ba3'; g.fillRect(x, y, w, height);
        g.fillStyle = '#62b5c4'; g.fillRect(x, y, w, 2);
      };
      stream(83, 0, 18, 45);
      g.fillStyle = '#bba883'; g.fillRect(73, 28, 38, 7);
      g.fillStyle = '#453b37'; g.fillRect(89, 23, 6, 18);
      if (!flow) return;
      stream(33, 42, 58, flow.farm + 3);
      stream(33, 46, flow.farm + 3, 18);
      stream(93, 42, 54, flow.river + 3);
      stream(145, 45, flow.river + 3, 36);
      if (flow.leak) stream(89, 45, flow.leak + 2, 28);
    };
    for (const setting of WATER_SETTINGS) {
      controls.append(h('button', { type: 'button', 'data-setting': setting, 'aria-pressed': 'false', onclick: () => {
        const events = controller.dispatch({ type: 'RunWaterTrial', setting });
        if (events.some((event) => event.kind === 'error')) return;
        for (const button of controls.querySelectorAll('button')) {
          button.setAttribute('aria-pressed', String(button.dataset.setting === setting));
        }
        const flow = waterTrial(condition, setting);
        paint(flow);
        readings.replaceChildren(h('p', {}, h('strong', {}, `${flow.incoming} buckets in`),
          ` · ${flow.farm} to the fields · ${flow.river} to the lower channel · ${flow.leak} lost at the gate`));
        readings.append(h('p', {}, 'Keep the intake and the leak with these marks. Count again if either changes.'));
        if (condition === 'repaired' && controller.state.flags[`water.trial.drought.${setting}`] === true) {
          const before = waterTrial('drought', setting);
          readings.append(h('p', {}, `Before repair at this setting: ${before.farm} to the fields, ${before.river} to the lower channel, ${before.leak} lost at the gate.`));
        }
      } }, labels[setting]));
    }
    paint();
    this.openModal('water-gate', 'Trial gate', this.closeBtn(), h('h2', {}, 'Trial gate'),
      h('p', {}, condition === 'drought' ? 'Drought trial. Twelve buckets enter the model. Move the lever and follow where the water goes.' :
        'After the repair. Run the gate with the same twelve buckets entering the model.'),
      picture, controls, readings);
  }

  openMarketScale(): void {
    const controller = ctx.controller;
    const labels: Record<MarketBasis, string> = {
      gross: 'Weigh the filled baskets',
      net: 'Lift out the baskets',
      wick: 'Set aside the short fibres',
    };
    const masses: Record<MarketBasis, string> = {
      gross: 'Fibre and basket',
      net: 'All fibre',
      wick: 'Wick-length fibre',
    };
    const picture = h('canvas', { width: 184, height: 78, class: 'mark', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    const controls = h('div', { class: 'row wrap', role: 'group', 'aria-label': 'Choose what goes on the scale' });
    const live = h('div', { 'aria-live': 'polite' });
    const available = h('p', { role: 'status' });
    const purse = h('input', {
      type: 'range', id: 'market-purse', min: 6, max: 12, step: 1, value: 8,
      oninput: (event: Event) => updatePurse((event.currentTarget as HTMLInputElement).valueAsNumber),
      onkeydown: (event: KeyboardEvent) => { if (event.key.startsWith('Arrow')) event.stopPropagation(); },
    });
    const updatePurse = (credits: number) => {
      purse.setAttribute('aria-valuetext', `${credits} credits`);
      const within = marketOffersWithin(credits);
      const offers = within.length === 0 ? 'neither lot fits' :
        within.length === 1 ? `only lot ${within[0].toUpperCase()} fits` : 'either lot fits';
      available.textContent = `With ${credits} credits: ${offers}.`;
    };
    const paint = (basis?: MarketBasis) => {
      const g = picture.getContext('2d');
      if (!g) return;
      g.fillStyle = '#302c49'; g.fillRect(0, 0, 184, 78);
      g.fillStyle = '#705146'; g.fillRect(0, 59, 184, 19);
      g.fillStyle = '#a17151'; g.fillRect(0, 59, 184, 3);
      for (const [index, row] of marketComparison(basis ?? 'gross').entries()) {
        const x = 47 + index * 90;
        const depth = basis ? Math.round(row.mass / 170) : 0;
        g.fillStyle = '#382f3d'; g.fillRect(x - 28, 50, 56, 9);
        g.fillStyle = '#bf9f6b'; g.fillRect(x - 4, 40 + depth, 8, 12 - depth);
        g.fillStyle = '#7e9ea0'; g.fillRect(x - 28, 35 + depth, 56, 5);
        g.fillStyle = '#b2c7be'; g.fillRect(x - 27, 35 + depth, 54, 2);
        const top = 35 + depth;
        g.fillStyle = index === 0 ? '#dfb46c' : '#b1c981';
        const height = basis === 'wick' && index === 0 ? 11 : 17;
        for (let offset = -16; offset <= 16; offset += 4) {
          g.fillRect(x + offset, top - height + (Math.abs(offset) % 3), 2, height);
        }
        if (!basis || basis === 'gross') {
          g.fillStyle = '#b9774d'; g.fillRect(x - 20, top - 11, 40, 11);
          g.fillStyle = '#d79c59'; g.fillRect(x - 22, top - 11, 44, 2);
          for (let offset = -16; offset <= 16; offset += 8) g.fillRect(x + offset, top - 8, 2, 8);
        }
        g.fillStyle = '#e9d7a9'; g.font = 'bold 9px monospace';
        g.fillText(row.id.toUpperCase(), x - 3, 69);
      }
    };
    const read = (basis: MarketBasis) => {
      const events = controller.dispatch({ type: 'WeighMarketLots', basis });
      if (events.some((event) => event.kind === 'error')) return;
      for (const button of controls.querySelectorAll('button')) {
        button.setAttribute('aria-pressed', String(button.dataset.basis === basis));
      }
      paint(basis);
      clear(live);
      live.append(h('table', { class: 'market-readings' },
        h('caption', {}, masses[basis]),
        h('thead', {}, h('tr', {}, ...['Lot', 'Mass', 'Whole lot', 'Grams per credit'].map((text) => h('th', { scope: 'col' }, text)))),
        h('tbody', {}, ...marketComparison(basis).map(({ id, price, mass }) => h('tr', {},
          h('th', { scope: 'row' }, id.toUpperCase()), h('td', {}, `${mass} g`),
          h('td', {}, `${price} credits`), h('td', {}, (mass / price).toLocaleString('en', { maximumFractionDigits: 1 })))))));
    };
    for (const basis of MARKET_BASES) {
      controls.append(h('button', { type: 'button', 'data-basis': basis, 'aria-pressed': 'false', onclick: () => read(basis) }, labels[basis]));
    }
    paint();
    updatePurse(8);
    this.openModal('market-scale', 'Test scale', this.closeBtn(), h('h2', {}, 'Test scale'),
      h('p', {}, 'Two fibre lots from the simulated market. Their prices stay fixed while you change what goes on the scale.'),
      picture, controls, live,
      h('details', {}, h('summary', {}, 'Try a shopper’s purse'),
        h('label', { for: 'market-purse' }, 'Credits to spend'), purse, available));
  }

  openFilmCamera(station: string): void {
    const { controller } = ctx;
    if (!isFilmStation(station) || controller.state.mapId !== 'stage.rehearsal' || controller.state.flags['film.stage.started'] !== true) return;
    const title = station === 'front' ? 'Front camera' : 'Wing camera';
    this.openModal('film-panel', title, this.closeBtn(), h('h2', {}, title), cameraPanel(controller, station));
  }

  openFilmEditor(): void {
    const { controller } = ctx;
    if (controller.state.mapId !== 'stage.rehearsal'
      || !FILM_STATIONS.every((station) => controller.state.flags['film.take.' + station] === true)) return;
    this.openModal('film-panel wide', 'Editing stand', this.closeBtn(), h('h2', {}, 'Editing stand'),
      filmEditorPanel(controller));
  }

  openStageRehearsal(): void {
    const controller = ctx.controller;
    const labels = { pause: 'Pause before the move', move: 'Move before the pause' };
    const picture = h('canvas', { width: '170', height: '82', class: 'mark', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    const controls = h('div', { class: 'row' });
    const captions = h('ol', { class: 'history' });
    const live = h('p', { role: 'status', 'aria-live': 'polite' });
    const paint = (moved: boolean) => {
      const g = picture.getContext('2d');
      if (!g) return;
      g.fillStyle = '#302c48'; g.fillRect(0, 0, 170, 82);
      g.fillStyle = '#80556d'; g.fillRect(0, 0, 19, 63); g.fillRect(151, 0, 19, 63);
      g.fillStyle = '#b38b67'; g.fillRect(19, 62, 132, 20);
      g.fillStyle = '#d2ae79'; g.fillRect(116, 16, 24, 46);
      g.fillStyle = '#4d474f'; g.fillRect(120, 20, 16, 42);
      const actor = (x: number, colour: string) => {
        g.fillStyle = '#e0bd91'; g.fillRect(x + 3, 34, 8, 8);
        g.fillStyle = colour; g.fillRect(x, 42, 14, 15);
        g.fillStyle = '#292a35'; g.fillRect(x + 2, 57, 4, 5); g.fillRect(x + 8, 57, 4, 5);
      };
      actor(moved ? 92 : 39, '#4e9186');
      actor(128, '#ca9b5b');
      const crate = moved ? 108 : 58;
      g.fillStyle = '#7e5d4e'; g.fillRect(crate, 49, 13, 13);
      g.fillStyle = '#bc9265'; g.fillRect(crate, 50, 13, 2); g.fillRect(crate + 2, 53, 2, 8);
    };
    const choose = () => {
      clear(controls);
      for (const cue of STAGE_CUES) {
        const recorded = controller.state.flags[`stage.rehearsal.${cue}`] === true;
        controls.append(h('button', { type: 'button', onclick: () => start(cue) }, labels[cue] + (recorded ? ' (recorded)' : '')));
      }
    };
    const start = (cue: StageCue) => {
      const beats = stageRehearsal(cue);
      let position = 0;
      clear(captions); clear(controls); paint(false);
      live.textContent = labels[cue] + '.';
      const advance = h('button', { type: 'button', onclick: () => {
        const beat = beats[position++];
        captions.append(h('li', {}, beat.text));
        live.textContent = beat.text;
        if (beat.kind === 'move') paint(true);
        if (position < beats.length) return;
        const events = controller.dispatch({ type: 'RunStageRehearsal', cue });
        if (!events.some((event) => event.kind === 'error')) live.textContent += ' Rehearsal recorded.';
        choose();
        controls.querySelector('button')?.focus();
      } }, 'Advance the rehearsal');
      controls.append(advance);
      advance.focus();
    };
    choose();
    paint(false);
    this.openModal('stage-rehearsal', 'Cue table', this.closeBtn(), h('h2', {}, 'Cue table'),
      h('p', {}, 'Place the pause and see how the order changes the scene.'), picture, controls, captions, live);
  }

  openSeaChart(chartId: string): void {
    if (chartId !== 'harbour' && chartId !== 'shoal') return;
    const chart = seaChart(chartId);
    const picture = h('canvas', { width: '170', height: '90', class: 'mark', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    const notes = h('div', {});
    const live = h('p', { role: 'status', 'aria-live': 'polite' });
    const visible = new Set<'marks' | 'edge'>();
    const draw = () => {
      const g = picture.getContext('2d');
      if (g) {
        g.fillStyle = '#82b8c1'; g.fillRect(0, 0, 170, 90);
        g.fillStyle = '#e7d4a6';
        g.beginPath(); g.moveTo(0, 0); g.lineTo(170, 0); g.lineTo(170, 19);
        g.lineTo(84, 30); g.lineTo(50, 49); g.lineTo(0, 72); g.closePath(); g.fill();
        g.strokeStyle = '#2b4543'; g.lineWidth = 2; g.beginPath();
        for (const [i, mark] of chart.marks.entries()) {
          if (i === 0) g.moveTo(mark.x, mark.y); else g.lineTo(mark.x, mark.y);
        }
        g.stroke();
        if (visible.has('edge')) {
          g.fillStyle = 'rgba(30, 43, 50, 0.26)';
          const strip = () => {
            g.moveTo(19, 12); g.lineTo(chart.edge, 54); g.lineTo(chart.edge, 72); g.lineTo(19, 35); g.closePath();
          };
          if (chartId === 'shoal') {
            g.beginPath(); g.rect(0, 0, 170, 90); strip(); g.fill('evenodd');
          } else {
            g.fillRect(chart.edge, 0, 170 - chart.edge, 90);
          }
          g.setLineDash([4, 4]);
          g.beginPath();
          if (chartId === 'shoal') strip();
          else { g.moveTo(chart.edge, 2); g.lineTo(chart.edge, 88); }
          g.stroke();
          g.setLineDash([]);
        }
        if (visible.has('marks')) {
          g.fillStyle = '#273741'; g.font = 'bold 11px sans-serif';
          chart.marks.forEach((mark, i) => {
            g.fillRect(mark.x - 2, mark.y - 2, 5, 5);
            g.fillText(String(i + 1), mark.x + 4, mark.y - 5);
          });
        }
      }
      clear(notes);
      if (visible.has('marks')) notes.append(h('ol', {}, ...chart.marks.map((mark) => h('li', {}, mark.name))));
      if (visible.has('edge')) notes.append(h('p', {}, chart.limit));
    };
    const layer = (id: 'marks' | 'edge', label: string) => {
      const button = h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
        if (visible.has(id)) return;
        visible.add(id);
        button.setAttribute('aria-pressed', 'true');
        draw();
        if (visible.size === 2 && !ctx.controller.dispatch({ type: 'ReadSeaChart', chart: chartId }).some((event) => event.kind === 'error')) {
          live.textContent = 'Survey notes filed.';
        }
      } }, label);
      return button;
    };
    draw();
    this.openModal('sea-chart', chart.title, this.closeBtn(), h('h2', {}, chart.title),
      h('p', { class: 'fine' }, 'Fictional chart. The line shows the survey’s reach.'),
      picture, h('div', { class: 'row' }, layer('marks', 'Show named marks'), layer('edge', 'Show survey edge')), notes, live);
  }

  openCopyComparison(edition: string): void {
    if (edition !== 'press' && edition !== 'landing' && edition !== 'proof') return;
    const { before, after, lost, restored } = compareCopy(edition);
    const use = edition === 'press'
      ? 'The words match, but without Tuesday the line could sound like a report about any day.'
      : 'The words match, but without the clerk’s name the stall notice gives no way to tell who observed the trial.';
    const columns = h('div', { class: 'two-col' });
    const status = h('p', { role: 'status', 'aria-live': 'polite' });
    const aligned = new Set<'time' | 'credit'>();
    const draw = () => {
      clear(columns);
      for (const record of [before, after]) {
        columns.append(h('section', { class: 'card' },
          h('h3', {}, record.name),
          aligned.has('time') ? h('p', { class: 'fine' }, record.time || 'No time mark on this edition.') : null,
          h('p', {}, record.claim),
          aligned.has('credit') ? h('p', { class: 'fine' }, record.credit || 'No source line on this edition.') : null));
      }
    };
    const button = (field: 'time' | 'credit', label: string) => {
      const control = h('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
        if (aligned.has(field)) return;
        aligned.add(field);
        control.setAttribute('aria-pressed', 'true');
        draw();
        if (aligned.size === 2) {
          const events = ctx.controller.dispatch({ type: 'CompareCopy', edition });
          if (!events.some((e) => e.kind === 'error')) {
            status.textContent = restored.length ? `Repair checked. Both lines are back: “${restored.join('”, “')}”.`
              : `Copy checked. This step lost “${lost.join('”, “')}”. ${use}`;
          }
        } else {
          status.textContent = field === 'time' ? 'The time marks are lined up.' : 'The source lines are lined up.';
        }
      } }, label);
      return control;
    };
    draw();
    this.openModal('copy-comparison wide', after.name, this.closeBtn(), h('h2', {}, 'Compare the copies'),
      columns, h('div', { class: 'row' }, button('time', 'Line up the time marks'), button('credit', 'Line up the source lines')), status);
  }

  openMetalTrial(sampleId: string): void {
    if (!Object.hasOwn(METAL_SAMPLES, sampleId)) return;
    const sample = readMetalSample(sampleId);
    const controller = ctx.controller;
    const live = h('p', { role: 'status', 'aria-live': 'polite' }, 'The pan is empty.');
    const notes = h('ul', {});
    const refreshNotes = () => {
      clear(notes);
      for (const [id, reading] of Object.entries(METAL_SAMPLES)) {
        if (controller.state.flags[`metal.test.${id}`] === true) {
          notes.append(h('li', {}, `${reading.name}: ${reading.mass} balance units.`));
        }
      }
    };
    const picture = h('canvas', { width: '144', height: '64', class: 'mark', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    const paint = (mass: number) => {
      const g = picture.getContext('2d');
      if (!g) return;
      g.fillStyle = '#eee3c9'; g.fillRect(0, 0, 144, 64);
      g.fillStyle = '#3c4053';
      g.fillRect(37, 52, 70, 6); g.fillRect(68, 15, 8, 39);
      g.strokeStyle = '#3c4053'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(27, 20 + mass * 3); g.lineTo(117, 20 - mass * 3); g.stroke();
      g.fillRect(12, 22 + mass * 3, 33, 4); g.fillRect(99, 22 - mass * 3, 33, 4);
      if (mass) { g.fillStyle = '#386e86'; g.fillRect(17, 15 + mass * 3, 22, 7); }
    };
    const weigh = h('button', { type: 'button', disabled: true, onclick: () => {
      if (controller.dispatch({ type: 'CompareMetalSample', sample: sampleId }).some((e) => e.kind === 'error')) return;
      paint(sample.mass);
      live.textContent = `${sample.name} reads ${sample.mass} balance units.`;
      refreshNotes();
    } }, 'Set the panel on the pan');
    const zero = h('button', { type: 'button', onclick: () => {
      paint(0);
      live.textContent = 'Empty pan set to zero. The balance is ready.';
      weigh.disabled = false;
      weigh.focus();
    } }, 'Zero the empty balance');
    paint(0);
    refreshNotes();
    this.openModal('metal-trial', sample.name, this.closeBtn(), h('h2', {}, sample.name),
      h('p', {}, 'Both blue panels fit the same frame. See what an empty balance and a panel can tell you.'),
      picture, h('div', { class: 'row' }, zero, weigh), live,
      h('details', {}, h('summary', {}, 'Pinned balance readings'), notes));
  }

  openForestWatch(site: string): void {
    if (!Object.hasOwn(FOREST_WATCH, site)) return;
    const c = ctx.controller;
    const spot = FOREST_WATCH[site];
    const labels = { early: 'First light', late: 'Later watch', return: 'Return watch' };
    const controls = h('div', { class: 'row' });
    const sightings = h('ol', { class: 'history' });
    const live = h('p', { role: 'status', 'aria-live': 'polite' });
    const notes = h('ul', {});
    const recorded = (id: string, window: ForestWindow) => c.state.flags[`forest.watch.${id}.${window}`] === true;
    const summary = (id: string, window: ForestWindow) => {
      const watch = forestWatch(id, window);
      const total = watch.reduce<number>((sum, n) => sum + (n ?? 0), 0);
      return `${total} visible ${total === 1 ? 'crossing' : 'crossings'}.${watch.includes(null) ? ' The view was blocked for one beat.' : ''}`;
    };
    const refreshNotes = () => {
      clear(notes);
      for (const [id, lookout] of Object.entries(FOREST_WATCH)) {
        for (const window of FOREST_WINDOWS.filter((w) => recorded(id, w))) {
          notes.append(h('li', {}, `${lookout.name}, ${labels[window].toLowerCase()}: ${summary(id, window)}`));
        }
      }
      if (!notes.childElementCount) notes.append(h('li', {}, 'No watches recorded yet.'));
    };
    const picture = h('canvas', { width: '144', height: '54', class: 'mark', 'aria-hidden': 'true' }) as HTMLCanvasElement;
    const paint = (count: number | null) => {
      const g = picture.getContext('2d');
      if (!g) return;
      g.fillStyle = '#a0c8ad'; g.fillRect(0, 0, 144, 54);
      g.fillStyle = '#426858'; g.fillRect(0, 39, 144, 15);
      g.fillStyle = site === 'creek' ? '#88bfc4' : '#a19c80'; g.fillRect(0, 44, 144, 10);
      g.fillStyle = '#304e43';
      for (const x of [5, 17, 112, 129]) {
        g.fillRect(x, 16, 7, 29); g.fillRect(x - 5, 9, 17, 14);
      }
      if (count === null) {
        g.fillStyle = '#63774a';
        for (let x = 25; x < 112; x += 6) g.fillRect(x, 14 + x % 11, 4, 37);
      } else {
        g.fillStyle = '#212a38';
        for (let i = 0; i < count; i++) {
          const x = 50 + i * 30;
          g.fillRect(x, 26, 7, 2); g.fillRect(x - 3, 24, 3, 2); g.fillRect(x + 7, 24, 3, 2);
        }
      }
    };
    const description = (count: number | null) => count === null ? 'The view was blocked.'
      : count === 0 ? 'No crossings visible.' : count === 1 ? 'One crossing visible.' : `${count} crossings visible.`;
    const start = (window: ForestWindow) => {
      const watch = forestWatch(site, window);
      let beat = 0;
      clear(controls); clear(sightings);
      paint(0);
      live.textContent = `${labels[window]}. Watch for three beats.`;
      const advance = h('button', { type: 'button', class: 'primary', onclick: () => {
        const count = watch[beat++];
        paint(count);
        sightings.append(h('li', {}, description(count)));
        live.textContent = description(count);
        if (beat < watch.length) return;
        const events = c.dispatch({ type: 'ObserveForest', site, window });
        if (!events.some((e) => e.kind === 'error')) {
          live.textContent = `Watch recorded. ${summary(site, window)}`;
          refreshNotes();
        }
        clear(controls);
        const another = h('button', { type: 'button', onclick: () => {
          choose();
          controls.querySelector('button')?.focus();
        } }, 'Choose another watch');
        controls.append(another);
        another.focus();
      } }, 'Watch the next beat');
      controls.append(advance);
      advance.focus();
    };
    const choose = () => {
      clear(controls);
      const windows = FOREST_WINDOWS.filter((window) => window !== 'return' || !!c.state.flags['forest.response']);
      for (const window of windows) {
        controls.append(h('button', { type: 'button', onclick: () => start(window) },
          labels[window] + (recorded(site, window) ? ' (recorded)' : '')));
      }
    };
    choose();
    paint(0);
    refreshNotes();
    this.openModal('forest-watch', spot.name, this.closeBtn(), h('h2', {}, spot.name),
      h('p', {}, spot.view), h('p', { class: 'fine' }, 'The same three beats at each spot. A bird can cross more than once.'),
      picture, controls, sightings, live, h('details', {}, h('summary', {}, 'Pinned field notes'), notes));
  }

  /** A controlled comparison. The physical load stays fixed while the path changes. */
  openNileModel(): void {
    const c = ctx.controller;
    const box = this.openModal('nile-model wide', 'The shelf-top model');
    const live = h('p', { 'aria-live': 'polite', class: 'nile-report' });
    const guide = localGuide(c, MAPS[c.state.mapId]?.world ?? '', 'nile.routes');
    const roads = ['ridge', 'wash'] as const;
    box.append(this.closeBtn(), h('h2', {}, 'The shelf-top model'),
      h('p', {}, 'Marek sets the tall crate on the cart. Try each road with the same load.'),
      h('p', { class: 'fine' }, 'Fictional model. These routes and times are built for the archive trial.'));
    if (!c.state.cards.includes('card.nile.mine')) {
      box.append(h('p', {}, 'Marek points to the Mine Map case west of the bench. Read that record before setting out.'), guide);
      return;
    }
    box.append(h('p', {}, 'The Mine Map records routes and rock colours in Wadi Hammamat. Marek’s practice cart checks how a tall load fares on each model track.'));
    const tracks = h('div', { class: 'nile-tracks' });
    const destinations = h('div', { class: 'nile-deliveries' });
    const showDelivery = () => {
      clear(destinations);
      const remaining = roads.filter((road) => c.state.flags[`nile.trial.${road}`] !== true);
      if (!remaining.length) {
        const { ridge, wash } = NILE_TRIALS;
        destinations.append(h('p', {},
          `Both runs used the tall crate. On the wide wash the cart took ${wash.turns - ridge.turns} more turns and the crate stayed upright. It tipped at the ridge turn. Use these practice runs for Marek’s delivery.`));
      }
      const choice = c.state.flags['nile.routeLead'] as NileDelivery | undefined;
      if (choice) {
        const r = NILE_DELIVERIES[choice];
        destinations.append(h('h3', {}, 'Your delivery tag'), h('strong', {}, r.name), h('p', {}, r.line));
      } else if (c.state.cards.includes('card.nile.model')) {
        destinations.append(h('h3', {}, 'Tie on a delivery tag'),
          h('p', {}, 'Send the cast when the Nexus reader needs to check weight or texture. Send the paper copy when the image needs to reach the reader with the note.'),
          ...(['cast', 'copy'] as const).map((id) => h('button', { type: 'button', class: 'primary', onclick: () => {
            if (!c.dispatch({ type: 'NileDelivery', choice: id }).some((e) => e.kind === 'error')) {
              live.textContent = NILE_DELIVERIES[id].line;
              showDelivery();
              destinations.querySelector<HTMLElement>('h3')?.focus();
            }
          } }, NILE_DELIVERIES[id].name)));
      } else {
        const next = remaining[0];
        destinations.append(h('p', { role: 'status' }, next && remaining.length === 1
          ? `Run the cart on the ${next} to open the delivery tags. Keep the tall crate in place for the comparison.`
          : 'Run the cart on both roads to open the delivery tags.'));
      }
      destinations.querySelector('h3')?.setAttribute('tabindex', '-1');
    };
    for (const road of roads) {
      const r = NILE_TRIALS[road];
      const track = h('div', { class: `nile-track ${road}`, 'aria-hidden': 'true' }, h('i', { class: 'nile-cart' }, '▣'), h('span', {}, '◈'));
      const result = h('p', { class: 'fine' });
      const fill = () => { result.textContent = c.state.flags[`nile.trial.${road}`] ? `${r.turns} turns. ${r.line}` : 'Waiting for a run.'; };
      fill();
      tracks.append(h('section', {}, h('h3', {}, r.name), track, result, h('button', { type: 'button', onclick: () => {
        const failure = c.dispatch({ type: 'NileRouteTrial', road }).find((e) => e.kind === 'error');
        if (failure?.kind === 'error') {
          live.textContent = failure.message;
          return;
        }
        track.classList.remove('rolling');
        if (!ctx.settings.reducedMotion) requestAnimationFrame(() => track.classList.add('rolling'));
        else track.classList.add('rolling');
        fill();
        live.textContent = `${r.name}: ${r.turns} turns. ${r.line}`;
        showDelivery();
      } }, `Run the cart on the ${road}`)));
    }
    box.append(tracks, live, destinations, guide);
    showDelivery();
  }

  openMusicBox(): void {
    const c = ctx.controller;
    const visited = ['nexus.archive', ...(c.state.objectivesDone.includes('m02.o1.arrive') || c.state.mapId === 'aethelgard.emberford' ? ['aethelgard.emberford'] : [])];
    const open = openMotifs(conceptXP(c.permanent, c.pack), visited);
    let song = readSong(c.state.flags['musicbox.song'], open);
    let voice = (['box', 'marimba', 'flute'].includes(String(c.state.flags['musicbox.voice'])) ? c.state.flags['musicbox.voice'] : 'box') as 'box' | 'marimba' | 'flute';
    let tempo = Number(c.state.flags['musicbox.tempo'] ?? 0.32);
    const timers: number[] = [];
    const stop = () => { this.stopSong?.(); this.stopSong = null; timers.forEach(clearTimeout); timers.length = 0; box.querySelectorAll('.slot.on').forEach((x) => x.classList.remove('on')); };
    const save = () => { c.dispatch({ type: 'SetFlag', flag: 'musicbox.song', value: song.join(',') }); c.dispatch({ type: 'SetFlag', flag: 'musicbox.voice', value: voice }); c.dispatch({ type: 'SetFlag', flag: 'musicbox.tempo', value: tempo }); };
    const play = (ids: string[]) => {
      stop();
      const notes = songNotes(ids);
      this.stopSong = playNotes(notes, tempo, voice, ctx.settings.sfxVolume);
      caption('music.box');
      // Light each slot while it plays.
      const slots = [...box.querySelectorAll<HTMLElement>('.song .slot')];
      if (ids === song) for (const n of notes) {
        timers.push(window.setTimeout(() => { slots.forEach((x, i) => x.classList.toggle('on', i === n.slot)); }, n.at * tempo * 1000));
      }
      const end = notes.length ? (notes[notes.length - 1].at + notes[notes.length - 1].beats) * tempo * 1000 + 300 : 0;
      timers.push(window.setTimeout(() => slots.forEach((x) => x.classList.remove('on')), end));
    };
    const box = this.openModal('musicbox-panel wide', 'Music box');
    const render = () => {
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, 'Music box'),
        h('p', {}, 'Each TOK concept has its own short tune. A tune opens the first time you earn XP for that concept. Arrange up to eight into your own song.'),
        h('div', { class: 'song', role: 'list', 'aria-label': 'Your song' }, ...Array.from({ length: SONG_MAX }, (_, i) => {
          const m = MOTIFS.find((x) => x.id === song[i]);
          return m ? h('button', { type: 'button', role: 'listitem', class: `slot ${m.concept ?? 'place'}`, title: `${m.name}. Click to take it out.`, onclick: () => { song.splice(i, 1); save(); stop(); render(); } }, h('span', { class: 'pins', 'aria-hidden': 'true' }, ...m.steps.map((st) => h('i', { style: { bottom: `${8 + ((st + 5) % 10) * 3}px` } }))), h('small', {}, m.name.split(':')[0]))
            : h('span', { class: 'slot empty', role: 'listitem' }, String(i + 1));
        })),
        h('div', { class: 'row' },
          h('button', { class: 'primary', disabled: !song.length, onclick: () => play(song) }, '▶ Play my song'),
          h('button', { onclick: stop }, '■ Stop'),
          h('label', {}, 'Sound ', h('select', { onchange: (e: Event) => { voice = (e.target as HTMLSelectElement).value as any; save(); } },
            ...[['box', 'Music box'], ['marimba', 'Marimba'], ['flute', 'Flute']].map(([v, t]) => h('option', { value: v, selected: v === voice }, t)))),
          h('label', {}, 'Speed ', h('select', { onchange: (e: Event) => { tempo = Number((e.target as HTMLSelectElement).value); save(); } },
            ...[[0.42, 'Slow'], [0.32, 'Walking'], [0.24, 'Quick']].map(([v, t]) => h('option', { value: String(v), selected: v === tempo }, String(t)))))),
        h('h3', {}, `Tunes you have (${open.length} of ${MOTIFS.length})`),
        h('div', { class: 'motifs' }, ...MOTIFS.map((m) => {
          const has = open.includes(m);
          return h('div', { class: `motif ${has ? '' : 'locked'}` },
            h('span', {}, has ? m.name : m.concept ? `${CONCEPT_NAMES[m.concept]}: earn XP for this concept to open it` : 'A place tune: visit the place to open it'),
            has ? h('span', { class: 'row' },
              h('button', { type: 'button', class: 'mini', 'aria-label': `Listen to ${m.name}`, onclick: () => play([m.id]) }, '♪ Listen'),
              h('button', { type: 'button', class: 'mini', disabled: song.length >= SONG_MAX, 'aria-label': `Add ${m.name} to your song`, onclick: () => { song.push(m.id); save(); render(); } }, '+ Add')) : '');
        })),
        h('p', { class: 'fine' }, 'Your song plays softly when you rest at a Waystone. Sound follows the sound-effects volume.'));
    };
    render();
    const obs = new MutationObserver(() => { if (!box.isConnected) { stop(); obs.disconnect(); } });
    obs.observe(this.root, { childList: true, subtree: true });
  }

  /** The photo album and its caption check (spec 47.4). Kept only on this device. */
  openAlbum(openId?: string): void {
    const c = ctx.controller;
    const album = loadAlbum();
    const box = this.openModal('album-panel wide', 'Photo album');
    const render = (sel?: string) => {
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, 'Photo album'));
      const ph = album.find((p) => p.id === sel);
      if (!ph) {
        box.append(h('p', {}, 'Your pictures, kept only on this device. Open one to write its caption: sort each line into what the photo shows and what you think.'));
        if (!album.length) { box.append(h('p', { class: 'fine' }, 'No pictures yet. Use Photo mode (in the menu) to take one.')); return; }
        box.append(h('div', { class: 'album-grid' }, ...[...album].reverse().map((p) => h('button', { type: 'button', class: 'album-thumb', onclick: () => render(p.id), 'aria-label': `Picture from ${p.place}, ${new Date(p.at).toLocaleDateString()}${p.checked ? ', caption done' : ''}` },
          h('img', { src: p.thumb, alt: '' }), h('span', { class: 'fine' }, `${p.place.split(':').pop()?.trim()} ${p.checked ? '✓' : ''}`)))));
        return;
      }
      const all = ph.lines.length > 0 && ph.lines.every((l) => ph.answers[l.id]);
      box.append(h('div', { class: 'album-photo' }, h('img', { src: ph.thumb, alt: `Your picture from ${ph.place}` })),
        h('p', { class: 'fine' }, `${ph.place}, ${new Date(ph.at).toLocaleString()}`),
        h('h3', {}, 'Is this what the photo shows, or what you think?'),
        h('ul', { class: 'caption-lines' }, ...ph.lines.map((l) => {
          const a = ph.answers[l.id];
          const r = a ? checkLine(l, a) : null;
          const choose = (ans: 'shows' | 'thinks') => {
            if (a) return;
            ph.answers[l.id] = ans; saveAlbum(album);
            this.sfx(checkLine(l, ans).ok ? 'sfx.sparkle' : 'sfx.page');
            if (ph.lines.every((x) => ph.answers[x.id]) && !ph.checked) {
              ph.checked = true; saveAlbum(album);
              c.dispatch({ type: 'PhotoCaptioned', right: ph.lines.filter((x) => checkLine(x, ph.answers[x.id]).ok).length, total: ph.lines.length });
            }
            render(ph.id);
          };
          return h('li', { class: r ? (r.ok ? 'ok' : 'miss') : '' }, h('span', {}, l.text),
            a ? h('small', {}, `${r!.ok ? '✓' : '✗'} ${r!.text}`)
              : h('span', { class: 'row' }, h('button', { type: 'button', onclick: () => choose('shows') }, 'The photo shows this'), h('button', { type: 'button', onclick: () => choose('thinks') }, 'I think this')));
        })));
      if (all) {
        const shows = ph.lines.filter((l) => l.kind === 'shows').map((l) => l.text);
        const thinks = ph.lines.filter((l) => l.kind === 'thinks').map((l) => l.text);
        box.append(h('div', { class: 'album-caption' }, h('strong', {}, 'Caption: '), shows.join(' '), h('br'), h('em', {}, `I wonder: ${thinks.join(' ')}`)));
      }
      box.append(h('div', { class: 'row' }, h('button', { onclick: () => render() }, 'All pictures'),
        h('button', { onclick: () => { const i = album.findIndex((p) => p.id === ph.id); album.splice(i, 1); saveAlbum(album); render(); } }, 'Delete this picture')));
    };
    render(openId);
  }

  private closePhotoMode(): void {
    this.photoBar?.remove(); this.photoBar = null;
    document.body.classList.remove('photo-mode');
    ctx.world?.photoSet(null);
  }

  private savePhoto(o: { frame: string; caption: boolean }): void {
    const c = ctx.controller;
    const subjects = ctx.world?.photoSubjects() ?? [];
    ctx.world?.photoSnap((img) => {
      if (!img) { this.toast('This browser could not take the picture.', 'error'); return; }
      const pad = o.frame === 'none' ? 0 : 18, capH = o.caption ? 44 : 0;
      const cv = document.createElement('canvas');
      cv.width = img.width + pad * 2; cv.height = img.height + pad * 2 + capH;
      const g = cv.getContext('2d')!;
      const FRAME: Record<string, [string, string]> = { timeline: ['#6b4f19', '#e9cf7a'], gold: ['#c9a24a', '#f2d27a'], archive: ['#3a2b5e', '#7d5bc4'], wood: ['#5b3b22', '#8a6448'], none: ['#120f24', '#120f24'] };
      const [dark, light] = FRAME[o.frame] ?? FRAME.none;
      g.fillStyle = dark; g.fillRect(0, 0, cv.width, cv.height);
      if (pad) { g.fillStyle = light; g.fillRect(4, 4, cv.width - 8, 3); g.fillRect(4, 4, 3, cv.height - 8); }
      if (o.frame === 'timeline') { g.fillStyle = light; for (let x = 24; x < cv.width - 12; x += 24) g.fillRect(x, 9, 2, x % 96 === 0 ? 7 : 4); }
      g.drawImage(img, pad, pad);
      if (o.caption) {
        const place = MAPS[c.state.mapId]?.name ?? '';
        g.fillStyle = o.frame === 'gold' ? '#2a1a0a' : '#fff8e6'; g.font = '600 18px Lexend, sans-serif'; g.textBaseline = 'middle';
        const cr = decodeCrest(c.state.flags['crest']);
        let tx = pad + 6;
        if (cr) { const cc = crestCanvas(cr, 30, 1); g.drawImage(cc, tx, img.height + pad * 2 + capH / 2 - (pad ? 6 : 0) - 15); tx += 36; }
        g.fillText(`${c.state.player.name} · ${place} · ${new Date().toLocaleDateString()}`, tx, img.height + pad * 2 + capH / 2 - (pad ? 6 : 0));
      }
      const a = h('a', { href: cv.toDataURL('image/png'), download: `knowledge-guardians-${Date.now()}.png` }) as HTMLAnchorElement;
      document.body.append(a); a.click(); a.remove();
      this.sfx('sfx.sparkle');
      // A small copy goes into the album, for the caption check.
      const tw = 360, th = Math.round((cv.height / cv.width) * tw);
      const t = document.createElement('canvas'); t.width = tw; t.height = th;
      t.getContext('2d')!.drawImage(cv, 0, 0, tw, th);
      const album = loadAlbum();
      const seed = Date.now();
      album.push({ id: `p${seed}`, at: new Date().toISOString(), place: MAPS[c.state.mapId]?.name ?? '', thumb: t.toDataURL('image/jpeg', 0.8),
        lines: captionLines(subjects, seed % 97), answers: {}, checked: false });
      const kept = saveAlbum(album);
      this.toast(kept ? `Picture saved to this device and to your album (${Math.min(album.length, ALBUM_MAX)} of ${ALBUM_MAX}).` : 'Picture saved to this device. The album is full or blocked.', 'save');
    });
  }

  private openControls(): void {
    const km = ctx.settings.keys;
    const box = this.openModal('controls', 'Controls', this.closeBtn(), h('h2', {}, 'Controls'),
      h('ul', {},
        h('li', {}, `Walk: arrow keys or ${km.up} ${km.left} ${km.down} ${km.right}. Or click/tap a spot.`),
        h('li', {}, `Talk / inspect / use: ${km.interact}, Space or Enter. Or click/tap a person or object.`),
        h('li', {}, 'Choose a dialogue option: click it, or press its number.'),
        h('li', {}, `Hint from Lumen: ${km.hint}. Journal: ${km.journal}. Portfolio: ${km.portfolio}. Bag: ${km.bag}. Menu: Esc.`),
        h('li', {}, 'All menus work with Tab, Shift+Tab and Enter. No task needs fast reactions.')));
    box.append(h('button', { class: 'primary', onclick: () => this.openKeys() }, 'Change keys'));
  }

  /** Key remapping (spec 21.6). Letters only; arrows, Space, Enter, Esc and numbers keep their jobs. */
  private openKeys(): void {
    const st = ctx.settings;
    const save = () => { saveSettings(st); ctx.world?.applySettings(); this.openKeys(); };
    let waiting: Action | null = null;
    const status = h('p', { class: 'fine', role: 'status', 'aria-live': 'polite' }, 'Choose an action, then press a letter key. If another action has that letter, the two swap.');
    const rows = ACTIONS.map((a) => {
      const btn = h('button', { 'aria-label': `${a.label}: ${st.keys[a.id]}. Change` , onclick: () => {
        waiting = a.id; status.textContent = `Press a letter key for "${a.label}". Press Esc to stop.`;
        rows.forEach((r) => r.classList.remove('waiting')); btn.classList.add('waiting');
      } }, h('kbd', {}, st.keys[a.id]));
      return h('div', { class: 'key-row' }, h('span', {}, a.label), btn);
    });
    const box = this.openModal('controls keys', 'Change keys', this.closeBtn(), h('h2', {}, 'Change keys'), status,
      h('div', { class: 'key-grid' }, ...rows),
      h('p', {}, 'Ready-made layouts:'),
      h('div', { class: 'key-presets' }, ...PRESETS.map((p) => h('button', { onclick: () => { st.keys = { ...p.keys }; save(); } }, p.label))),
      h('p', { class: 'fine' }, 'The arrow keys, Space, Enter, Esc and the number keys always keep their jobs.'));
    box.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!waiting) return;
      if (e.key === 'Escape') { waiting = null; e.stopPropagation(); e.preventDefault(); this.openKeys(); return; }
      if (!mappableKey(e.key)) { status.textContent = 'Only letter keys can be changed. Try a letter.'; return; }
      e.preventDefault(); e.stopPropagation();
      st.keys = assignKey(st.keys, waiting, e.key); save();
    }, true);
  }

  openSettings(): void {
    const st = ctx.settings;
    const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { st[k] = v; saveSettings(st); ctx.world?.applySettings(); };
    const check = (k: keyof Settings, label: string) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!st[k], onchange: (e: Event) => set(k, (e.target as HTMLInputElement).checked as any) }), ` ${label}`);
    const range = (k: 'musicVolume' | 'sfxVolume', label: string) => h('label', { class: 'range' }, `${label} `,
      h('input', { type: 'range', min: '0', max: '1', step: '0.1', value: String(st[k]), onchange: (e: Event) => set(k, Number((e.target as HTMLInputElement).value)) }));
    this.openModal('settings', 'Settings', this.closeBtn(), h('h2', {}, 'Settings'),
      h('label', { class: 'range' }, 'Text size ', h('select', { onchange: (e: Event) => set('textScale', Number((e.target as HTMLSelectElement).value)) },
        ...[1, 1.25, 1.5, 1.75].map((v) => h('option', { value: String(v), selected: st.textScale === v }, `${Math.round(v * 100)}%`)))),
      h('label', { class: 'range' }, 'Interface colours ', h('select', { onchange: (e: Event) => set('theme', (e.target as HTMLSelectElement).value as any) },
        ...THEMES.map((t) => h('option', { value: t.id, selected: st.theme === t.id }, t.label)))),
      h('label', { class: 'range' }, "Lumen's glow ", h('select', { onchange: (e: Event) => set('lumenColour', (e.target as HTMLSelectElement).value as any) },
        ...Object.keys(LUMEN_COLOURS).map((k) => h('option', { value: k, selected: st.lumenColour === k }, k)))),
      check('reducedMotion', 'Reduce motion (no camera fades, sway or flicker)'),
      check('reducedEffects', 'Reduce visual effects (lighting, glow, particles)'),
      check('highContrast', 'High-contrast interface'),
      check('dyslexiaSpacing', 'Wider letter and line spacing'),
      check('guidePrompts', 'Lumen may show short prompts without being asked'),
      check('calmMode', 'Calm mode: surprise events warn first, and you can choose "Later"'),
      check('zenMode', 'Zen mode: no turn limit in Showdowns (the crowd waits), surprise events always ask first, and nothing can be failed'),
      check('glossary', 'Smart glossary: underline key words in conversations, so you can tap them for an explanation'),
      check('talkSounds', 'Talk sounds: short voice sounds while characters speak'),
      check('captions', 'Sound captions: a short text line for each sound (for example [Forge hammer rings])'),
      check('colourSafe', 'Colour-safe marks: blue and orange, with a symbol on every result'),
      'speechSynthesis' in window ? check('readAloud', 'Read conversations aloud (uses your browser\'s voice)') : '',
      range('musicVolume', 'Music volume'), range('sfxVolume', 'Sound effects volume'),
      h('p', { class: 'fine' }, 'Sound is never needed to play. Every sound has a text message.'));
  }

  private openCredits(): void {
    const c = ctx.controller;
    const s = c.state;
    const journey = s?.flags['ending.council'] ? vignettesFor(s) : [];
    this.openModal('credits wide', 'Credits and sources', this.closeBtn(), h('h2', {}, 'Credits and sources'),
      journey.length ? h('section', { class: 'journey-credits' }, h('h3', {}, 'From the first label to the Council'),
        h('div', { class: 'journey-memory' }, h('img', { src: artURL('nile.door'), alt: '' }), h('p', {}, mirror(s))),
        ...journey.slice(0, 4).map((moment, i) => h('div', { class: 'journey-memory' },
          h('img', { src: artURL(i === 0 ? 'council.record' : 'voices.lamp'), alt: '' }),
          h('div', {}, h('strong', {}, moment.who), h('p', {}, moment.text)))),
        h('button', { type: 'button', onclick: () => this.playStoryCue('in-the-open') }, 'Hear the closing theme')) : '',
      h('p', {}, 'The full art, music and sound credits, including rights for individual collection images, are in CREDITS.md in the project repository.'),
      h('ul', {},
        h('li', {}, 'Tiles and character base: ArMM1998, "Zelda-like tilesets and sprites" (CC0), OpenGameArt.org. Characters recoloured for this game.'),
        h('li', {}, 'Music: cynicmusic, "Town Theme RPG", "Mysterious Ambience (song21)", "Happy Lullaby (song17)" (CC0), OpenGameArt.org.'),
        h('li', {}, 'Sound effects: Kenney, "51 UI sound effects" (CC0); rubberduck, "80 CC0 RPG SFX" (CC0); wobbleboxx, "Level up, power up, Coin get" (CC0); HaelDB, "Completion sound" (CC0). All from OpenGameArt.org.'),
        h('li', {}, 'Font: Lexend (SIL Open Font License), via @fontsource/lexend.'),
        h('li', {}, 'Game engine: Phaser 3 (MIT licence).')),
      s?.flags['ending.council'] ? this.collectionBibliography(specimenReferences(c.pack), 'Works cited for the collection') : '');
  }

  private collectionBibliography(entries: SpecimenReference[], title: string): HTMLElement {
    const pageSize = 24;
    let page = 0;
    const pages = Math.max(1, Math.ceil(entries.length / pageSize));
    const list = h('ul', { class: 'sources-list specimen-bibliography' });
    const status = h('span', { role: 'status' });
    const previous = h('button', { type: 'button', onclick: () => { page--; show(); } }, 'Previous citations');
    const next = h('button', { type: 'button', onclick: () => { page++; show(); } }, 'More citations');
    function show() {
      list.replaceChildren(...entries.slice(page * pageSize, (page + 1) * pageSize).map((entry) => h('li', {},
        ...entry.runs.map((run) => run.href ? h('a', { href: run.href, target: '_blank', rel: 'noopener' }, run.text)
          : run.cite ? h('cite', {}, run.text) : run.text))));
      status.textContent = `${page + 1} / ${pages}`;
      previous.disabled = page === 0;
      next.disabled = page + 1 >= pages;
    }
    show();
    return h('section', {}, h('h3', {}, title), list, pages > 1 ? h('div', { class: 'row' }, previous, status, next) : null);
  }

  // ------------------------------------------------------- chapter end

  chapterEnd(): void {
    const c = ctx.controller, s = c.state;
    const label = String(s.flags['label.pen.text'] ?? '—');
    const sign = { honest: 'Corvan now sells the blade as pattern-welded, made in the Lyle workshop this season.', down: 'Corvan took his sign down.', note: 'Corvan kept his sign but added the maker\'s name.', old: 'Corvan kept his old sign for now.' }[String(s.flags['sign.state'])] ?? '—';
    const rel = Object.entries(s.relations).filter(([, v]) => v !== 0).map(([id, v]) => `${c.pack.characters.find((x) => x.id === id)?.name}: ${v > 0 ? 'closer' : 'more distant'} (${v > 0 ? '+' : ''}${v})`);
    const firsts = Number(s.flags['count.firsts'] ?? 0);
    this.openModal('chapter-end wide', 'Chapter summary', h('h2', {}, 'Chapter 1 complete'),
      h('h3', {}, 'What you achieved'),
      h('ul', {}, h('li', {}, `The Nexus label now says: "${label}"`), h('li', {}, `In the market square: ${sign}`),
        firsts ? h('li', {}, `You repaired ${firsts} plaque(s) in the Hall of Firsts.`) : null),
      h('h3', {}, 'What remains uncertain'),
      h('ul', {}, h('li', {}, 'Who deserves credit for an invention depends on what "first" means: a patent, a working pen, or a pen people could buy.'),
        h('li', {}, 'The thread went dark: nobody recorded where Hesper\'s steel stock came from.'),
        h('li', {}, 'Nobody knows who made the small gold seal, or why it was on Corvan\'s sign. Warden Ise went quiet when she saw it.')),
      h('h3', {}, 'Who was affected'),
      h('ul', {}, ...(rel.length ? rel.map((r) => h('li', {}, r)) : [h('li', {}, 'No relationships changed much.')])),
      h('p', { class: 'fine' }, 'Different choices lead to different consequences. None of them is the hidden "right answer". Your awards, concept XP, moments and portfolio are kept if you start again.'),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Keep exploring'), this.saveControl()));
    this.sfx('sfx.award');
  }
}
