import { runNileTrial, nileDelivery, type NileRoad, type NileDelivery } from './nileModel';
import { bendEffects, type BendAction } from './stripBend';
import { forestWatch, type ForestWindow } from './forestWatch';
import { readMetalSample } from './metalSample';
import { compareCopy } from './copyComparison';
import { seaChart } from './seaCharts';
import { stageRehearsal, type StageCue } from './stageRehearsal';
import { filmEffects, type FilmAction } from './filmCuts';
import { tileDispatchEffects, type TileDispatchAction } from './tiles';
import { marketComparison, type MarketBasis } from './marketScale';
import { waterTrial, type WaterSetting } from './waterGate';
import { civicAllocation, type CivicRule, type CivicSample } from './civicConsole';
import { civicIncentiveEffects, type IncentiveAction } from './civicIncentive';
import { boundaryEffects, type BoundaryAction } from './boundaryBoard';
import { voiceReading, type VoiceSource, type VoiceView } from './voiceReadings';
import { islandPlan, type IslandLanding, type IslandRoute } from './islandPlan';
import { changeSkiff, type SkiffAction } from './islandSkiff';
import { marketBasketEffects, type BasketAction } from './marketBasket';
import { waterLoopEffects, type LoopAction } from './waterLoop';
import { catchmentEffects, type CatchmentAction } from './catchment';
import { councilClock, type CouncilTrial } from './councilClock';
import { scoutDecision, scoutNextTrial, scoutTrials, type ScoutDecision, type ScoutProtocol, type ScoutRoute } from './scoutRoutes';
import { ownedPerspective, PERSPECTIVE_FLAG } from './perspectives';
import { moveSharedCarry, type CarrySite, type CarryStop } from './sharedCarry';
/**
 * Domain engine. Scenes send typed commands; the engine checks preconditions,
 * computes ONE valid state transition and returns events for the view to show
 * (spec 22.2). A button never writes XP or state directly.
 */
import { trustOf, rankOf } from './communities';
import { WARES, priceFor } from './shop';
import { TALENTS, cannotLearn, hasTalent } from './talents';
import { GATHER_YIELD, RECIPES, RESOURCES, cannotCraft } from './craft';
import { cannotRead, readingOf } from './readings';
import { RUMOUR_DESKS, RUMOURS, type RumourDesk, missingRumourSources, rumourDone } from './rumours';
import { BARTER, DYES, ferryPrice } from './trade';
import { approvalOf, approvalRank, isInquiry } from './approval';
import { ROLES } from './roles';
import { BOSS, SEALS, allSealsOpen, bossDone, bossPhase } from './undercroft';
import { FIELD_GAMES } from './fieldgames';
import { DRAWER_MASK, flipDrawer } from './drawerCases';
import type {
  AwardRecord, CampaignState, ContentPack, DialogueNode, DialogueOption, DiaryNoteKind, Effect, Hint, MisconceptionRecord, Mission,
  MomentRule, Objective, PermanentRecord, ShowdownState, Weave,
} from './types';
import { CAMPAIGN_SCHEMA, type Pronouns } from './types';
import { cleanPronouns } from './player';
import { isValidLook } from './appearance';
import { implyAlcove, linkAlcove, placeInAlcove } from './exhibition';
import { dailyPrompts, diveDepth, diveItems, judgeDive } from './dive';
import { TIME_MAX, TIME_MIN, answerRound, runSurvey, translateLine, judgeFrame, readForecasts, checkOrder, judgeSight, panes, readTimes, runSorter, tryMap, peelLayer, restoreWith, weighRound } from './puzzles';
import { judgeYarn, viewBoard, type Tone } from './clueboard';
import { checkOffer, cleanPetName } from './lorelings';
import { objectiveSkillUse, recordSkillUse } from './skills';
import { apply, check, emptyOutputs, type EffectOutputs } from './rules';
import { addQuestionWay, checkAwards, grantCredit } from './permanent';
import { evaluateLabel, type LabelResult } from './label';
import { canClaimSpecimen, carriedSpecimenCount, carryFlag, hasSpecimen, ownsSpecimen, SPECIMEN_BASE, SPECIMEN_CAPACITY,
  specimenEquipped, specimenItemId, specimenReadingFlag, specimenToolId } from './specimenGear';
import { playMove, startShowdown, type ShowdownMove } from './showdown';
import { tryLock, type LockResult } from './lock';
import { compareWithBlade, forgeStep, newForge, type ForgeAction } from './forge';
import { addPortfolio, addSignal, checkMoments, recordWeave, tickEvents } from './learning';
import { diaryDialogueChoice, diaryNoteKind, newAdventureDiary, recordAdventure, setDiaryReflection } from './adventureJournal';
import { isDiaryNoteKind } from './diaryReflection';
import { setDiaryPortfolioWriting } from './adventureWriting';
import { biographyReadFlag, isHistoricalBiography } from './historicalEncounters';

const DIALOGUE_FALLBACK = 999;

export type Command =
  | IncentiveAction
  | BendAction
  | SkiffAction
  | BasketAction
  | LoopAction
  | CatchmentAction
  | FilmAction
  | TileDispatchAction
  | { type: 'Reach'; zone: string }
  | { type: 'VisitPlace'; name: string; via?: { from: string; id: string; label: string } }
  | { type: 'ReadWorldSign'; id: string; title: string; text: string; readFlag?: string; blocked?: true }
  | { type: 'EquipPerspective'; keepsake: string | null }
  | { type: 'SharedCarry'; site: CarrySite; stop: CarryStop; action: string }
  | { type: 'SetPronouns'; pronouns: Pronouns }
  | { type: 'SetLook'; look: string }
  | { type: 'AlcovePlace'; alcove: string; item: string }
  | { type: 'PuzzleRound'; puzzle: string; round: number; index: number }
  | { type: 'PuzzleOrder'; puzzle: string; order: string[] }
  | { type: 'PuzzleWeigh'; puzzle: string; round: number; weights: string[] }
  | { type: 'PuzzlePeel'; puzzle: string }
  | { type: 'PuzzleRestore'; puzzle: string; method: string; label: number }
  | { type: 'PuzzleSight'; puzzle: string; witness: string; claim: number; saw: boolean }
  | { type: 'PuzzleReport'; puzzle: string; index: number }
  | { type: 'PuzzleAddPoint'; puzzle: string }
  | { type: 'PuzzlePredict'; puzzle: string; index: number }
  | { type: 'PuzzleMap'; puzzle: string; audience: string; layers: string[] }
  | { type: 'PuzzleDiagnose'; puzzle: string; index: number }
  | { type: 'PuzzleTrain'; puzzle: string; examples: string[] }
  | { type: 'PuzzleTime'; puzzle: string; kind: 'echo' | 'react'; ms: number }
  | { type: 'PuzzleSurvey'; puzzle: string; wording: string; sample: string }
  | { type: 'PuzzleTranslate'; puzzle: string; picks: number[] }
  | { type: 'PuzzleFrame'; puzzle: string; brief: string; x: number; y: number }
  | { type: 'PuzzleForecast'; puzzle: string; chance: number }
  | { type: 'UseKeepsake'; clue: string; keepsake: string }
  | { type: 'ReadClue'; clue: string }
  | { type: 'FindSecret'; secret: string }
  | { type: 'BuyWare'; ware: string }
  | { type: 'LearnTalent'; talent: string }
  | { type: 'ForgetTalents' }
  | { type: 'Gather'; node: string; resource: string; day: string }
  | { type: 'Craft'; recipe: string; choice: number }
  | { type: 'Calibrate'; recipe: string; choice: number }
  | { type: 'TakeReading'; reading: string; choice: number }
  | { type: 'CheckRumourSource'; rumour: string; source: number }
  | { type: 'BuyDye'; dye: string }
  | { type: 'Barter'; resource: string; dir: 'buy' | 'sell' }
  | { type: 'CompareDyePrices' }
  | { type: 'ChooseRole'; role: string }
  | { type: 'DisarmSeal'; seal: string; choice: number }
  | { type: 'BossMove'; choice: number }
  | { type: 'FinishFieldGame'; game: string }
  | { type: 'OpenDrawerCase'; face: number }
  | { type: 'RouteRumour'; rumour: string; desk: RumourDesk }
  | { type: 'JudgeRumour'; rumour: string; verdict: number }
  | { type: 'DiveAnswer'; day: string; prompt: string; item: string; facet: number }
  | { type: 'PuzzleListen'; puzzle: string; action: 'play' | 'guess' | 'compare'; index?: number }
  | { type: 'PinYarn'; board: string; claim: string; card: string }
  | { type: 'PhotoCaptioned'; right: number; total: number }
  | { type: 'UnpinYarn'; board: string; claim: string; card: string }
  | { type: 'LorelingWatch'; loreling: string; sighting: string }
  | { type: 'LorelingNote'; loreling: string; question: string; option: string }
  | { type: 'LorelingOffer'; loreling: string; place: string }
  | { type: 'LorelingName'; loreling: string; name: string }
  | { type: 'LorelingField'; loreling: string; out: boolean }
  | { type: 'AlcoveLink'; alcove: string; index: number }
  | { type: 'AlcoveImply'; alcove: string; index: number }
  | { type: 'EnterNode'; node: string }
  | { type: 'ChooseDialogueOption'; node: string; index: number }
  | { type: 'InspectExhibit'; exhibit: string }
  | { type: 'ReadBiography'; card: string }
  | { type: 'ClaimSpecimen'; exhibit: string }
  | { type: 'CarrySpecimen'; key: string; carry: boolean }
  | { type: 'SetSpecimenReading'; exhibit: string; reading: 'use' | 'source' }
  | { type: 'UseLens'; exhibit: string }
  | { type: 'RunSimulation'; pen: string; surface: string }
  | { type: 'NileRouteTrial'; road: NileRoad }
  | { type: 'NileDelivery'; choice: NileDelivery }
  | { type: 'ObserveForest'; site: string; window: ForestWindow }
  | { type: 'CompareMetalSample'; sample: string }
  | { type: 'CompareCopy'; edition: string }
  | { type: 'ReadSeaChart'; chart: string }
  | { type: 'RunStageRehearsal'; cue: StageCue }
  | { type: 'WeighMarketLots'; basis: MarketBasis }
  | { type: 'RunWaterTrial'; setting: WaterSetting }
  | { type: 'RunCivicTrial'; sample: CivicSample; rule: CivicRule }
  | BoundaryAction
  | { type: 'RunVoiceReading'; source: VoiceSource; view: VoiceView }
  | { type: 'RunIslandPlan'; route: IslandRoute; landing: IslandLanding }
  | { type: 'RunCouncilClock'; trial: CouncilTrial }
  | { type: 'RunScoutRoute'; protocol: ScoutProtocol; first: ScoutRoute; trial: number; decision: ScoutDecision }
  | { type: 'ReviewScoutProtocol'; protocol: ScoutProtocol }
  | { type: 'BuildLabel'; kit: string; subject: string; criterion: string; limit: string }
  | { type: 'TurnLock'; lock: string; choice: Record<string, string> }
  | { type: 'ShowdownStart'; showdown: string; relaxed?: boolean }
  | { type: 'ShowdownMove'; move: ShowdownMove }
  | { type: 'FollowThread'; thread: string; node: string }
  | { type: 'Forge'; action: ForgeAction }
  | { type: 'CompareAssay' }
  | { type: 'Explore'; seconds: number }
  | { type: 'ResolveEvent'; event: string }
  | { type: 'DelayEvent' }
  | { type: 'Rest'; place: string }
  | { type: 'Purchase'; offer: string }
  | { type: 'RequestHint'; objective: string }
  | { type: 'SetFlag'; flag: string; value: string | number | boolean }
  | { type: 'AddNote'; text: string; kind?: DiaryNoteKind; fromDraft?: boolean }
  | { type: 'SetDiaryNoteDraft'; text: string; kind: DiaryNoteKind }
  | { type: 'SetDiaryReflection'; entry: string; prompt: string; text: string }
  | { type: 'SetDiaryPortfolioDraft'; entry: string; text: string; attach?: true }
  | { type: 'SetDiaryQuestion'; index: number; resolved: boolean }
  | { type: 'PortfolioShare'; entry: string; shared: boolean }
  | { type: 'PortfolioReflect'; entry: string; text: string };

export type GameEvent =
  | { kind: 'card'; id: string }
  | { kind: 'journal'; id: string }
  | { kind: 'item'; id: string; qty: number }
  | { kind: 'marks'; delta: number }
  | { kind: 'objective'; id: string; title: string }
  | { kind: 'stone'; question: string; ways: number; newWay: boolean }
  | { kind: 'award'; award: AwardRecord; xp: number }
  | { kind: 'xp'; amount: number }
  | { kind: 'checkpoint'; label: string }
  | { kind: 'hint'; hint: Hint }
  | { kind: 'simulation'; result: SimulationResult }
  | { kind: 'label'; result: LabelResult }
  | { kind: 'lock'; lock: string; result: LockResult }
  | { kind: 'puzzle'; puzzle: string; ok: boolean; text: string; gapAt?: number | null }
  | { kind: 'fray'; id: string; name: string; error: string }
  | { kind: 'yarn'; board: string; claim: string; card: string; tone: Tone; text: string; done: boolean }
  | { kind: 'loreling'; loreling: string; stage: 'watch' | 'note' | 'offer' | 'name' | 'field'; ok: boolean; text: string; recheck?: string | null }
  | { kind: 'alcove'; alcove: string; stage: 'place' | 'link' | 'imply'; result: string; text: string }
  | { kind: 'showdown'; state: ShowdownState }
  | { kind: 'forge'; line: string }
  | { kind: 'compare'; match: boolean; line: string }
  | { kind: 'thread'; node: string; text: string; gap?: string }
  | { kind: 'event-due'; event: string }
  | { kind: 'moment'; moment: MomentRule }
  | { kind: 'reflection'; misconception: MisconceptionRecord }
  | { kind: 'portfolio'; title: string }
  | { kind: 'rest'; place: string }
  | { kind: 'keepsake'; id: string; name: string; use: string }
  | { kind: 'lamp'; id: string; name: string; lit: string; count: number; total: number }
  | { kind: 'clue'; clue: string; keepsake: string; text: string }
  | { kind: 'craft'; recipe: string; ok: boolean; why: string }
  | { kind: 'reading'; reading: string; ok: boolean; why: string; first: boolean }
  | { kind: 'rumour'; rumour: string; ok: boolean; why: string }
  | { kind: 'seal'; seal: string; ok: boolean; why: string }
  | { kind: 'boss'; phase: number; ok: boolean; why: string; done: boolean }
  | { kind: 'fieldgame'; game: string; name: string; first: boolean }
  | { kind: 'approval'; who: string; n: number; rank: string; up: boolean }
  | { kind: 'trust'; id: string; name: string; rank: string }
  | { kind: 'secret'; id: string; name: string; found: number; total: number }
  | { kind: 'error'; message: string };

export interface SimulationResult {
  pen: string; surface: string; markQuality: number; note: string; fairTest: boolean; testCount: number;
}

export interface Outcome {
  state: CampaignState;
  permanent: PermanentRecord;
  events: GameEvent[];
  nextNode?: string | null;
}

export function newCampaign(pack: ContentPack, name: string, look: string, seed: number, opts: { pronouns?: Pronouns; origin?: string | null } = {}): CampaignState {
  const origin = pack.origins.find((o) => o.id === opts.origin) ?? null;
  return {
    schema: CAMPAIGN_SCHEMA,
    contentVersion: pack.contentVersion,
    player: { name, look, pronouns: cleanPronouns(opts.pronouns ?? {}), origin: origin?.id ?? null },
    mapId: 'nexus.archive',
    pos: { x: -1, y: -1 },
    facing: 'up',
    flags: {},
    inventory: {},
    marks: 0,
    relations: {},
    journal: origin ? [origin.journal] : [],
    notes: [],
    adventureDiary: newAdventureDiary(),
    cards: [],
    objectivesDone: [],
    companion: null,
    rng: { seed, state: seed >>> 0 },
    playSeconds: 0,
    showdown: null,
    forge: newForge(),
    events: { clock: 0, next: 600, seen: [], pending: null },
  };
}

/** World code for portfolio entries, from the map id (e.g. "nexus.archive" -> "nexus"). */
export function worldOf(s: CampaignState): string {
  return s.mapId.split('.')[0];
}

// ---------------------------------------------------------------------------
// Simulation model for the marking test minigame (OBJ-001 playable case).
// Values are MODEL ASSUMPTIONS for play, labelled as such in the interface.
// They are not measurements of historical pens.
// ---------------------------------------------------------------------------
export const SIM_MODEL: Record<string, Record<string, { q: number; note: string }>> = {
  'loud-model': {
    paper: { q: 1, note: 'Model assumption: the coarse ball tears the paper fibres and the thick ink skips. The line is faint and broken.' },
    leather: { q: 3, note: 'Model assumption: the ball rolls well on the rough grain and leaves a clear, broad mark.' },
    wood: { q: 3, note: 'Model assumption: a broad, readable mark on the rough board.' },
  },
  'biro-type': {
    paper: { q: 3, note: 'Model assumption: a fine ball with thin, quick-drying ink makes a smooth, even line.' },
    leather: { q: 1, note: 'Model assumption: the fine ball skates on the grain and the thin ink beads. The mark is patchy.' },
    wood: { q: 2, note: 'Model assumption: a thin line that catches on the grain in places.' },
  },
};

export class Engine {
  constructor(public pack: ContentPack) {}

  /** Companion approval for a good question (src/domain/approval.ts). Each source of approval counts once. */
  private approve(s: CampaignState, out: EffectOutputs, events: GameEvent[], key: string): CampaignState {
    const who = s.companion!;
    if (s.flags[`approved.${who}.${key}`] === true) return s;
    const before = approvalRank(approvalOf(s.flags, who));
    s = apply([{ setFlag: `approved.${who}.${key}`, value: true }, { addNum: `approval.${who}`, by: 1 }], s, out);
    const n = approvalOf(s.flags, who), rank = approvalRank(n);
    events.push({ kind: 'approval', who, n, rank, up: rank !== before });
    return s;
  }

  node(id: string): DialogueNode {
    const n = this.pack.dialogue.find((x) => x.id === id);
    if (!n) throw new Error(`Unknown dialogue node ${id}`);
    return n;
  }

  /** Options the player can choose now. If none pass, the node's fallback "next" applies. */
  visibleOptions(nodeId: string, s: CampaignState): { option: DialogueOption; index: number }[] {
    const base = (this.node(nodeId).options ?? []).map((option, index) => ({ option, index })).filter((o) => check(o.option.if, s));
    const extra = this.keepsakeOptions(nodeId, s);
    if (!extra.length) return base;
    const n = this.node(nodeId);
    return [...base, ...extra, ...(base.length ? [] : [{ option: { text: n.next ? 'Go on.' : 'Goodbye.', next: n.next ?? null }, index: DIALOGUE_FALLBACK }])];
  }

  /**
   * Keepsake talk (Mika 2026-11-26: keepsakes matter): on a character's entry node, a keepsake the
   * player holds adds an option, once. Indexes from 1000. Not added to a node that leads straight on
   * to another line, so story chains are never cut.
   */
  keepsakeOptions(nodeId: string, s: CampaignState): { option: DialogueOption; index: number }[] {
    const n = this.node(nodeId);
    const c = this.pack.characters.find((x) => x.id === n.speaker);
    if (!c || !c.talk.some((t) => t.node === nodeId) || (n.next && !n.options?.length)) return [];
    return (this.pack.keepsakeTalks ?? []).map((t, i) => ({ t, i }))
      .filter(({ t }) => t.character === c.id && s.flags[`keepsake.${t.keepsake}`] === true && s.flags[`ktalk.${t.id}`] !== true && check(t.if, s))
      .map(({ t, i }) => ({ option: { text: t.text, tag: `Show ${(this.pack.keepsakes ?? []).find((k) => k.id === t.keepsake)?.name.replace(/^an? /i, '') ?? 'a keepsake'}`, next: t.node, effects: [{ setFlag: `ktalk.${t.id}`, value: true }] }, index: 1000 + i }));
  }

  talkEntry(characterId: string, s: CampaignState): string | null {
    const c = this.pack.characters.find((x) => x.id === characterId);
    if (!c) return null;
    const t = c.talk.find((x) => check(x.if, s));
    return t ? t.node : null;
  }

  activeMissions(s: CampaignState): Mission[] {
    return this.pack.missions.filter((m) => check(m.available, s));
  }

  visibleObjectives(s: CampaignState): (Objective & { mission: Mission; complete: boolean })[] {
    return this.activeMissions(s).flatMap((m) =>
      m.objectives.filter((o) => check(o.visible, s)).map((o) => ({ ...o, mission: m, complete: s.objectivesDone.includes(o.id) })),
    );
  }

  /** The first open, visible objective. Used by the guide and the recap. */
  currentObjective(s: CampaignState): (Objective & { mission: Mission }) | null {
    const open = this.visibleObjectives(s).filter((o) => !o.complete);
    const main = open.filter((o) => /-M\d+$/.test(o.mission.id));
    return main.find((o) => o.essential) ?? main[0] ?? open[0] ?? null;
  }

  /** Which Fray creatures this command met (fixed rules on results, never on values). */
  private frayMet(cmd: Command, s0: CampaignState, s: CampaignState, events: GameEvent[]): string[] {
    const met = new Set<string>();
    for (const e of events) {
      if (e.kind === 'alcove') {
        const m = { mirage: 'symbol-mirage', golem: 'checklist-golem', sphinx: 'so-what-sphinx' }[e.result as string];
        if (m) met.add(m);
      }
      if (e.kind === 'label' && !e.result.holds) met.add('swell-wisp');
      if (e.kind === 'loreling' && e.stage === 'offer' && !e.ok && e.recheck) met.add('shadow-twins');
    }
    // Content can introduce a creature with the flag "meet.fray.<id>" (for example at the end of a quest).
    for (const k of Object.keys(s.flags)) if (k.startsWith('meet.fray.') && s0.flags[k] === undefined) met.add(k.slice(10));
    if (cmd.type === 'ShowdownMove' && s0.showdown && s.showdown) {
      const a = s0.showdown, b = s.showdown;
      const rec = this.pack.showdowns.find((x) => x.id === a.id);
      if (cmd.move.move === 'attack') met.add('hornet-of-blame');
      if (cmd.move.move === 'shout') met.add('echo-moths');
      if (!a.sealShown && b.sealShown) met.add('glimmer-knight');
      if (!a.narrowed && b.narrowed) met.add('hasty-hydra');
      const step = rec?.script.length ? rec.script[a.turn % rec.script.length] : null;
      if (step && b.turn > a.turn) {
        if (step.move === 'seal' && !a.sealShown) met.add('glimmer-knight');
        if (step.move === 'shout') met.add('echo-moths');
        if (step.move === 'press' && b.force > b.support) met.add('swell-wisp');
      }
    }
    return [...met];
  }

  dispatch(cmd: Command, s0: CampaignState, p0: PermanentRecord, now = new Date().toISOString()): Outcome {
    const out = emptyOutputs();
    const events: GameEvent[] = [];
    const weaves: Weave[] = [];
    const stones: { id: string; way: string }[] = [];
    const skillUses: { id: string; sig: string }[] = [];
    const portfolio: { kind: Parameters<typeof addPortfolio>[1]['kind']; title: string; text: string; weave: Weave }[] = [];
    let s = s0;
    let p = p0;
    let nextNode: string | null | undefined;
    let diaryChoice: ReturnType<typeof diaryDialogueChoice> | undefined;
    try {
      switch (cmd.type) {
        case 'VisitPlace':
          if (!cmd.name.trim()) throw new Error('This place has no name');
          if (s.flags[`visited.map.${s.mapId}`] !== true) s = apply([{ setFlag: `visited.map.${s.mapId}`, value: true }], s, out);
          break;
        case 'ReadWorldSign':
          if (!cmd.id || !cmd.title.trim()) throw new Error('This notice has no name');
          if (cmd.readFlag && s.flags[cmd.readFlag] !== true) s = apply([{ setFlag: cmd.readFlag, value: true }], s, out);
          break;
        case 'Reach':
          s = apply([{ setFlag: `reached.${cmd.zone}`, value: true }], s, out);
          break;
        case 'SetFlag':
          s = apply([{ setFlag: cmd.flag, value: cmd.value }], s, out);
          break;
        case 'CompleteTileStitch': case 'SendTileDispatch': case 'ReceiveTileDispatch':
          s = apply(tileDispatchEffects(cmd, s), s, out);
          break;
        case 'SharedCarry':
          s = apply(moveSharedCarry(cmd.site, cmd.stop, cmd.action, s, p), s, out);
          break;
        case 'EquipPerspective': {
          const id = cmd.keepsake;
          if (id !== null && !ownedPerspective(this.pack, s, id)) throw new Error('You have not earned that field tool');
          if (s.flags[PERSPECTIVE_FLAG] !== (id ?? false)) {
            s = apply([{ setFlag: PERSPECTIVE_FLAG, value: id ?? false }], s, out);
          }
          break;
        }
        case 'UseKeepsake': case 'ReadClue': {
          const cl = (this.pack.clues ?? []).find((x) => x.id === cmd.clue);
          if (!cl) throw new Error('Unknown clue');
          if (cmd.type === 'ReadClue') {
            if (s.flags[`clue.${cl.id}.read`] !== true) s = apply([{ setFlag: `clue.${cl.id}.read`, value: true }, ...(cl.study ? [{ addNum: 'study.read', by: 1 } as Effect] : []), ...(cl.onRead ?? [])], s, out);
            break;
          }
          const v = cl.views.find((x) => x.keepsake === cmd.keepsake);
          if (!v) throw new Error('Nothing happens.');
          if (s.flags[`keepsake.${cmd.keepsake}`] !== true) throw new Error('You do not have that keepsake yet');
          const key = `clue.${cl.id}.${cmd.keepsake}`;
          if (s.flags[key] !== true) s = apply([{ setFlag: key, value: true }, ...(cl.study ? [{ addNum: 'study.views', by: 1 } as Effect] : []), ...(v.effects ?? [])], s, out);
          events.push({ kind: 'clue', clue: cl.id, keepsake: cmd.keepsake, text: v.text });
          break;
        }
        case 'Gather': {
          if (!(cmd.resource in RESOURCES)) throw new Error('Nothing to gather here');
          if (s.flags[`gather.${cmd.node}`] === cmd.day) throw new Error('You took what you need here today. It will be ready again tomorrow.');
          s = apply([{ setFlag: `gather.${cmd.node}`, value: cmd.day }, { addNum: `res.${cmd.resource}`, by: GATHER_YIELD }], s, out);
          break;
        }
        case 'Craft': case 'Calibrate': {
          const r = RECIPES.find((x) => x.id === cmd.recipe);
          if (!r) throw new Error('Unknown recipe');
          const o = r.check.options[cmd.choice];
          if (!o) throw new Error('Choose an answer');
          const fx: Effect[] = [{ setFlag: `craft.${r.id}.calibrated`, value: o.ok || s.flags[`craft.${r.id}.calibrated`] === true }];
          if (cmd.type === 'Craft') {
            if (s.inventory[r.item]) throw new Error('You have one already. You can calibrate it again.');
            const why = cannotCraft(s.flags, r.id);
            if (why) throw new Error(why);
            for (const [k, n] of Object.entries(r.cost)) fx.push({ addNum: `res.${k}`, by: -(n as number) });
            fx.push({ giveItem: r.item }, { addNum: 'count.crafted', by: 1 });
          } else if (!s.inventory[r.item]) throw new Error('Make the tool first');
          s = apply(fx, s, out);
          events.push({ kind: 'craft', recipe: r.id, ok: o.ok, why: o.why });
          break;
        }
        case 'TakeReading': {
          const why = cannotRead(s, cmd.reading);
          if (why) throw new Error(why);
          const r = readingOf(cmd.reading)!;
          const o = r.options[cmd.choice];
          if (!o) throw new Error('Choose an answer');
          const first = s.flags[`reading.${r.id}`] !== true;
          if (first) s = apply([{ setFlag: `reading.${r.id}`, value: true }, { addNum: 'count.readings', by: 1 }, { addMarks: 4 }], s, out);
          events.push({ kind: 'reading', reading: r.id, ok: o.ok, why: o.why, first });
          break;
        }
        case 'CheckRumourSource': case 'RouteRumour': case 'JudgeRumour': {
          const r = RUMOURS.find((x) => x.id === cmd.rumour);
          if (!r) throw new Error('Unknown rumour');
          if (cmd.type === 'CheckRumourSource') {
            if (!r.sources[cmd.source]) throw new Error('Unknown source');
            s = apply([{ setFlag: `mill.${r.id}.s${cmd.source}`, value: true }], s, out);
            break;
          }
          if (missingRumourSources(s.flags, r).length) throw new Error("Check the rumour’s listed sources before giving a verdict.");
          let why: string;
          let ok: boolean;
          const fx: Effect[] = [];
          if (cmd.type === 'RouteRumour') {
            if (s.mapId !== 'aethelgard.emberford' || !RUMOUR_DESKS.includes(cmd.desk)) throw new Error('Choose a receiver at the tea table.');
            const flag = `mill.${r.id}.desk`;
            if (s.flags[flag] !== cmd.desk) fx.push({ setFlag: flag, value: cmd.desk });
            why = cmd.desk === 'ledger' ? 'The slip is in the guild’s public record book.' : 'The slip is in Tova’s guest book at the old ferry landing.';
            ok = true;
          } else {
            why = r.whys[cmd.verdict];
            if (why === undefined) throw new Error('Choose a verdict');
            ok = cmd.verdict === r.best;
            fx.push({ addNum: `mill.${r.id}.tries`, by: 1 });
          }
          if (ok && !rumourDone(s.flags, r.id)) {
            fx.push({ setFlag: `mill.${r.id}.done`, value: true }, { addNum: 'count.rumours', by: 1 }, { addMarks: 5 });
            if (r.fray) fx.push({ setFlag: `meet.fray.${r.fray}`, value: true });
          }
          s = apply(fx, s, out);
          if (ok && s.companion) s = this.approve(s, out, events, `mill.${r.id}`);
          events.push({ kind: 'rumour', rumour: r.id, ok, why });
          break;
        }
        case 'BuyDye': {
          const d = DYES.find((x) => x.id === cmd.dye);
          if (!d) throw new Error('Wenna does not sell that');
          if (s.flags[`owned.dye.${d.id}`] === true) throw new Error('You already have that dye');
          if (s.marks < ferryPrice(d)) throw new Error('You do not have enough marks');
          s = apply([{ addMarks: -ferryPrice(d) }, { setFlag: `owned.dye.${d.id}`, value: true }], s, out);
          break;
        }
        case 'Barter': {
          const b = BARTER[cmd.resource as keyof typeof BARTER];
          if (!b) throw new Error('Wenna does not trade that');
          if (cmd.dir === 'buy') {
            if (!b.buy) throw new Error('Wenna has none of that to sell');
            if (s.marks < b.buy) throw new Error('You do not have enough marks');
            s = apply([{ addMarks: -b.buy }, { addNum: `res.${cmd.resource}`, by: 1 }], s, out);
          } else {
            if (!b.sell) throw new Error('Wenna has plenty of that already');
            if (Number(s.flags[`res.${cmd.resource}`] ?? 0) < 1) throw new Error('You have none to sell');
            s = apply([{ addMarks: b.sell }, { addNum: `res.${cmd.resource}`, by: -1 }], s, out);
          }
          break;
        }
        case 'CompareDyePrices': {
          if (s.mapId !== 'aethelgard.ferry') throw new Error("The price slips are at Wenna’s boat.");
          if (s.flags['trade.price-compared'] !== true) {
            s = apply([{ setFlag: 'trade.price-compared', value: true }], s, out);
          }
          break;
        }
        case 'DisarmSeal': {
          const x = SEALS.find((y) => y.id === cmd.seal);
          if (!x) throw new Error('Unknown seal');
          const o = x.options[cmd.choice];
          if (!o) throw new Error('Choose an answer');
          if (o.ok && s.flags[`trap.${x.id}.open`] !== true) s = apply([{ setFlag: `trap.${x.id}.open`, value: true }, { setFlag: `meet.fray.${x.fray}`, value: true }, { addMarks: 2 }], s, out);
          events.push({ kind: 'seal', seal: x.id, ok: o.ok, why: o.why });
          break;
        }
        case 'OpenDrawerCase': {
          if (s.mapId !== 'aethelgard.emberford') throw new Error('The drawers are at Dov’s stall.');
          const mask = Number(s.flags[DRAWER_MASK] ?? 0);
          const updated = flipDrawer(mask, cmd.face);
          if (updated !== mask) s = apply([{ setFlag: DRAWER_MASK, value: updated }], s, out);
          break;
        }
        case 'FinishFieldGame': {
          const g = FIELD_GAMES.find((x) => x.id === cmd.game);
          if (!g) throw new Error('Unknown game');
          const first = s.flags[`field.${g.id}.done`] !== true;
          if (first) s = apply([{ setFlag: `field.${g.id}.done`, value: true }, { addNum: 'count.fieldgames', by: 1 }, { addMarks: 3 }, ...(g.fray ? [{ setFlag: `meet.fray.${g.fray}`, value: true } as Effect] : [])], s, out);
          events.push({ kind: 'fieldgame', game: g.id, name: g.name, first });
          break;
        }
        case 'BossMove': {
          if (!allSealsOpen(s.flags)) throw new Error('The seals still block the way');
          if (bossDone(s.flags)) throw new Error('The vault is quiet now');
          const ph = bossPhase(s.flags), p = BOSS.phases[ph];
          const o = p.options[cmd.choice];
          if (!o) throw new Error('Choose an answer');
          const done = o.ok && ph + 1 >= BOSS.phases.length;
          s = apply(o.ok
            ? [{ setFlag: `boss.${BOSS.id}.phase`, value: ph + 1 }, { setFlag: `meet.fray.${p.fray}`, value: true }, ...(done ? [{ setFlag: 'undercroft.done', value: true }, { addMarks: 10 }, { giveItem: 'item.brass-lamp' }] as Effect[] : [])]
            : [{ addNum: `boss.${BOSS.id}.hollow`, by: 1 }], s, out);
          events.push({ kind: 'boss', phase: ph, ok: o.ok, why: o.why, done });
          break;
        }
        case 'ChooseRole': {
          if (!ROLES.some((r) => r.id === cmd.role)) throw new Error('Unknown role');
          s = apply([{ setFlag: 'role', value: cmd.role }], s, out);
          break;
        }
        case 'LearnTalent': {
          const why = cannotLearn(s, cmd.talent);
          if (why) throw new Error(why);
          s = apply([{ setFlag: `talent.${cmd.talent}`, value: true }], s, out);
          break;
        }
        case 'ForgetTalents': {
          s = apply(TALENTS.filter((t) => hasTalent(s, t.id)).map((t) => ({ setFlag: `talent.${t.id}`, value: false })), s, out);
          break;
        }
        case 'BuyWare': {
          const w = WARES.find((x) => x.id === cmd.ware);
          if (!w) throw new Error('Corvan does not sell that');
          if (s.flags[`owned.${w.id}`] === true) throw new Error('You already have that');
          const price = priceFor(w, s, this.pack);
          if (s.marks < price) throw new Error('You do not have enough marks');
          s = apply([{ addMarks: -price }, { setFlag: `owned.${w.id}`, value: true }], s, out);
          break;
        }
        case 'FindSecret': {
          const all = this.pack.secrets ?? [];
          const x = all.find((y) => y.id === cmd.secret);
          if (!x) throw new Error('Unknown secret');
          if (s.flags[`secret.${x.id}`] !== true) {
            s = apply([{ setFlag: `secret.${x.id}`, value: true }, { addNum: 'secrets.found', by: 1 }, { addMarks: 3 }], s, out);
            events.push({ kind: 'secret', id: x.id, name: x.name, found: Number(s.flags['secrets.found']), total: all.length });
          }
          break;
        }
        case 'DiveAnswer': {
          // The Deep Dive (spec 59): only valid answers are kept; a wrong facet costs nothing.
          if (!/^\d{4}-\d{2}-\d{2}$/.test(cmd.day)) throw new Error('Bad day');
          const prompts = this.pack.divePrompts ?? [], items = this.pack.diveItems ?? [];
          const pr = dailyPrompts(prompts, cmd.day).find((x) => x.id === cmd.prompt);
          if (!pr) throw new Error("That is not one of this day's prompts");
          const key = `dive.${cmd.day}.${pr.id}`;
          if (typeof s.flags[key] === 'string') throw new Error('You already answered this prompt today');
          const it = diveItems(items, s).find((x) => x.id === cmd.item);
          if (!it) throw new Error('You have not found that yet');
          const r = judgeDive(pr, it, cmd.facet);
          if (r.ok) {
            s = apply([{ setFlag: key, value: `${it.id}:${cmd.facet}` }], s, out);
            const d = diveDepth(prompts, items, s.flags, cmd.day).metres;
            if (d > Number(s.flags['dive.best'] ?? 0)) s = apply([{ setFlag: 'dive.best', value: d }], s, out);
          }
          break;
        }
        case 'EnterNode': {
          const n = this.node(cmd.node);
          // Remember seen lines, so the world can mark people with something new to say.
          if (!s.flags[`node.${n.id}`]) s = apply([{ setFlag: `node.${n.id}`, value: true }], s, out);
          s = apply(n.effects, s, out);
          break;
        }
        case 'ChooseDialogueOption': {
          const n = this.node(cmd.node);
          const opt = cmd.index >= DIALOGUE_FALLBACK ? this.visibleOptions(cmd.node, s).find((o) => o.index === cmd.index)?.option : n.options?.[cmd.index];
          if (!opt) throw new Error('That option does not exist');
          if (!check(opt.if, s)) throw new Error('That option is not available now');
          // The generated fallback mirrors the ordinary next/close control.
          if (cmd.index !== DIALOGUE_FALLBACK) diaryChoice = diaryDialogueChoice(this.pack, n, opt, cmd.index, s.player);
          s = apply(opt.effects, s, out);
          if (s.companion && isInquiry(opt.tag)) s = this.approve(s, out, events, `${cmd.node}.${cmd.index}`);
          nextNode = opt.next ?? null;
          break;
        }
        case 'InspectExhibit': {
          const e = this.pack.exhibits.find((x) => x.id === cmd.exhibit);
          if (!e) throw new Error('Unknown exhibit');
          s = apply([{ setFlag: `inspected.${e.id}`, value: true }, { addCard: e.grantsCard }, { addNum: 'count.inspected', by: s.flags[`inspected.${e.id}`] ? 0 : 1 }], s, out);
          break;
        }
        case 'ReadBiography': {
          const card = this.pack.cards.find(({ id }) => id === cmd.card);
          if (!card || !isHistoricalBiography(card) || !s.cards.includes(card.id)) throw new Error('Open a historical evidence card first');
          const flag = biographyReadFlag(card.id);
          if (s.flags[flag] !== true) s = apply([{ setFlag: flag, value: true }], s, out);
          break;
        }
        case 'ClaimSpecimen': {
          const exhibit = this.pack.exhibits.find((record) => record.id === cmd.exhibit);
          if (!exhibit || !hasSpecimen(exhibit)) throw new Error('Unknown collection object');
          const { key } = exhibit.specimen;
          if (ownsSpecimen(s, key)) break;
          if (!canClaimSpecimen(s, exhibit)) throw new Error('Finish the object’s quest first');
          const inSatchel = carriedSpecimenCount(s) < SPECIMEN_CAPACITY;
          s = apply([{ giveItem: specimenItemId(key) }, { setFlag: carryFlag(key), value: inSatchel },
            { setFlag: 'specimens.collected', value: true }], s, out);
          break;
        }
        case 'CarrySpecimen': {
          const { key, carry } = cmd;
          if (s.mapId !== SPECIMEN_BASE) throw new Error('Swap collection objects at the Nexus');
          if (!ownsSpecimen(s, key)) throw new Error('You have not collected that object');
          if ((s.flags[carryFlag(key)] === true) === carry) break;
          if (carry && carriedSpecimenCount(s) >= SPECIMEN_CAPACITY) throw new Error('The satchel’s object slots are full');
          const effects: Effect[] = [{ setFlag: carryFlag(key), value: carry }];
          if (!carry && s.flags[PERSPECTIVE_FLAG] === specimenToolId(key)) effects.push({ setFlag: PERSPECTIVE_FLAG, value: false });
          s = apply(effects, s, out);
          break;
        }
        case 'SetSpecimenReading': {
          const exhibit = this.pack.exhibits.find((record) => record.id === cmd.exhibit);
          if (!exhibit || !hasSpecimen(exhibit) || !check(specimenEquipped(exhibit.specimen.key), s)) throw new Error('Bring the object to its stand');
          s = apply([{ setFlag: specimenReadingFlag(exhibit.specimen.key), value: cmd.reading }], s, out);
          break;
        }
        case 'UseLens': {
          if (!s.inventory['tool.date-lens']) throw new Error('You do not have the Date-Kind Lens yet');
          s = apply([{ setFlag: `lens.${cmd.exhibit}`, value: true }, { addNum: 'count.lens', by: s.flags[`lens.${cmd.exhibit}`] ? 0 : 1 }], s, out);
          break;
        }
        case 'RunSimulation': {
          const m = SIM_MODEL[cmd.pen]?.[cmd.surface];
          if (!m) throw new Error('Unknown test setup');
          const prevPen = s.flags['sim.lastPen'];
          const prevSurface = s.flags['sim.lastSurface'];
          // A fair comparison changes exactly one variable from the last test.
          const changed = (prevPen !== undefined ? Number(prevPen !== cmd.pen) : 0) + (prevSurface !== undefined ? Number(prevSurface !== cmd.surface) : 0);
          const fair = prevPen !== undefined && changed === 1;
          const count = Number(s.flags['sim.tests'] ?? 0) + 1;
          const fx: Effect[] = [
            { setFlag: 'sim.lastPen', value: cmd.pen }, { setFlag: 'sim.lastSurface', value: cmd.surface },
            { setFlag: 'sim.tests', value: count },
            { setFlag: `sim.ran.${cmd.pen}.${cmd.surface}`, value: true },
          ];
          if (fair) fx.push({ addNum: 'sim.fair', by: 1 });
          if (prevPen !== undefined && changed === 2) fx.push({ addNum: 'sim.unfair', by: 1 });
          s = apply(fx, s, out);
          events.push({ kind: 'simulation', result: { pen: cmd.pen, surface: cmd.surface, markQuality: m.q, note: m.note, fairTest: fair, testCount: count } });
          break;
        }
        case 'RunCouncilClock': {
          if (s.mapId !== 'council.hall' || s.flags['council.arrived'] !== true) throw new Error('Use the watch bench in the Council of Inquiry.');
          councilClock(cmd.trial);
          const key = `council.trial.${cmd.trial}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'RunScoutRoute': {
          if (s.mapId !== 'aethelgard.emberford') throw new Error('Use the cart at Emberford’s scout board.');
          const trials = scoutTrials(cmd.first, cmd.protocol);
          const rounds = `scout.rounds.${cmd.protocol}`;
          const played = Number(s.flags[rounds] ?? 0);
          if (cmd.trial !== scoutNextTrial(played)) throw new Error('Set the cart up for the current round.');
          const { fits } = scoutDecision(trials[cmd.trial], cmd.decision);
          s = apply([
            { setFlag: rounds, value: played + 1 },
            { setFlag: `scout.played.${cmd.protocol}`, value: true },
            { setFlag: `scout.result.${cmd.protocol}`, value: `${cmd.decision}.${fits ? 'fits' : 'blocked'}` },
          ], s, out);
          break;
        }
        case 'ReviewScoutProtocol': {
          if (s.mapId !== 'aethelgard.emberford') throw new Error('Use the cart at Emberford’s scout board.');
          scoutTrials('orchard', cmd.protocol);
          if (s.flags[`scout.played.${cmd.protocol}`] !== true) throw new Error('Send the practice cart around first.');
          const key = `scout.checked.${cmd.protocol}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'RunIslandPlan': {
          if (s.mapId !== 'island.workshop' || s.flags['island.arrived'] !== true) throw new Error('Use the planning table on the Island of Models.');
          islandPlan(cmd.landing, cmd.route);
          if (cmd.landing === 'low' && s.flags['island.lower.read'] !== true) throw new Error('Bring the lower landing update from the dock.');
          const key = `island.plan.${cmd.landing}.${cmd.route}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'SkiffStart': case 'SkiffStroke': case 'SkiffMoor': case 'SkiffLand':
          s = changeSkiff(cmd, s);
          break;
        case 'SealMarketBasket': case 'QuoteMarketBasket': case 'IssueBasketTicket': case 'ReviewBasketCredit': case 'RedeemBasketTicket':
          s = apply(marketBasketEffects(cmd, s), s, out);
          break;
        case 'RunWaterLoop': case 'ReadWaterLoop': case 'FitWaterLoopCard': case 'SetWaterLoopService':
          s = apply(waterLoopEffects(cmd, s), s, out);
          break;
        case 'TraceCatchment': case 'PostCatchmentNotice':
          s = apply(catchmentEffects(cmd, s), s, out);
          break;
        case 'PublishDispatchTarget': case 'CheckDispatchReceipt': case 'CallDispatchBell': case 'CheckDispatchKit': case 'KeepDispatchTarget':
          s = apply(civicIncentiveEffects(cmd, s), s, out);
          break;
        case 'RunVoiceReading': {
          if (s.mapId !== 'voices.listening' || s.flags['voices.arrived'] !== true) throw new Error('Use the listening desk in the Archive of Voices.');
          voiceReading(cmd.source, cmd.view);
          if (cmd.source === 'carrier' && s.flags['voices.permissions.read'] !== true) throw new Error('Check the carrier’s permissions card.');
          const key = `voices.read.${cmd.source}.${cmd.view}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'RunCivicTrial': {
          if (s.mapId !== 'civic.dispatch' || s.flags['civic.arrived'] !== true) throw new Error('Use the route console in the Civic Machine.');
          civicAllocation(cmd.sample, cmd.rule);
          if (cmd.sample === 'combined' && s.flags['civic.walk.read'] !== true) throw new Error('Bring the walking register from Canal Walk.');
          const key = `civic.trial.${cmd.sample}.${cmd.rule}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'SetServiceBoundary':
          s = apply(boundaryEffects(cmd, s), s, out);
          break;
        case 'RunWaterTrial': {
          if (s.mapId !== 'water.gatehouse' || s.flags['water.arrived'] !== true) throw new Error('Use the trial gate in the Water Commons.');
          const condition = s.flags['water.repaired'] === true ? 'repaired' : 'drought';
          waterTrial(condition, cmd.setting);
          const key = `water.trial.${condition}.${cmd.setting}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'WeighMarketLots': {
          marketComparison(cmd.basis);
          if (s.mapId !== 'market.square' || s.flags['market.arrived'] !== true) throw new Error('Use the test scale in the Market of Measures.');
          const key = `market.weigh.${cmd.basis}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'RunStageRehearsal': {
          stageRehearsal(cmd.cue);
          if (s.mapId !== 'stage.rehearsal' || s.flags['stage.arrived'] !== true) throw new Error('Use the cue table in the House of Performance.');
          const key = `stage.rehearsal.${cmd.cue}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'CaptureFilmTake':
        case 'ScreenFilmCut':
        case 'PostFilmCut':
          s = apply(filmEffects(cmd, s), s, out);
          break;
        case 'ReadSeaChart': {
          seaChart(cmd.chart);
          if (s.mapId !== `sea.${cmd.chart}` || s.flags['sea.arrived'] !== true) throw new Error('Use the matching survey stand in the Cartographers’ Sea.');
          const key = `sea.read.${cmd.chart}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'CompareCopy': {
          compareCopy(cmd.edition);
          const location = cmd.edition === 'press' ? 'copies.press' : 'copies.landing';
          if (s.mapId !== location || s.flags['copies.arrived'] !== true) throw new Error('Use the matching comparison table in the City of Copies.');
          if (cmd.edition === 'proof' && s.flags['copies.followup'] !== true) throw new Error('Read the visitor’s response and revise the notice before checking the repair.');
          const key = `copies.checked.${cmd.edition}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'CompareMetalSample': {
          if (s.mapId !== 'metalworks.yard' || s.flags['metal.arrived'] !== true) throw new Error('Use the comparison bench in the Metalworks yard.');
          readMetalSample(cmd.sample);
          const key = `metal.test.${cmd.sample}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'ObserveForest': {
          if (s.mapId !== 'forest.trail' || s.flags['forest.arrived'] !== true) throw new Error('Use a watch spot on the forest trail.');
          if (cmd.window === 'return' && !s.flags['forest.response']) throw new Error('Agree on the trail response before making the return watch.');
          forestWatch(cmd.site, cmd.window);
          const key = `forest.watch.${cmd.site}.${cmd.window}`;
          if (!s.flags[key]) s = apply([{ setFlag: key, value: true }], s, out);
          break;
        }
        case 'RecordBendTrial': case 'FileBendPlan':
          s = apply(bendEffects(cmd, s), s, out);
          break;
        case 'NileRouteTrial': {
          if (s.mapId !== 'nile.route' || !s.cards.includes('card.nile.mine')) throw new Error('Read the Mine Map before using the table.');
          const r = runNileTrial(cmd.road);
          const key = `nile.trial.${r.route}`;
          if (!s.flags[key]) {
            const both = s.flags[r.route === 'wash' ? 'nile.trial.ridge' : 'nile.trial.wash'];
            s = apply([{ setFlag: key, value: true }, ...(both ? [{ addCard: 'card.nile.model' } as Effect] : [])], s, out);
          }
          break;
        }
        case 'NileDelivery': {
          if (s.mapId !== 'nile.route' || !s.cards.includes('card.nile.model')) throw new Error('Try both roads with the same load first.');
          if (s.flags['nile.routeLead']) throw new Error('Your delivery tag is already on the hook.');
          const r = nileDelivery(cmd.choice);
          s = apply([{ setFlag: 'nile.routeLead', value: cmd.choice }], s, out);
          portfolio.push({ kind: 'reflection', title: 'A Map Is Not a Road', text: r.line,
            weave: { concepts: ['objectivity', 'certainty'], atl: ['thinking', 'research'], aoks: ['HIS', 'NAT'], subjects: ['geography', 'history'] } });
          break;
        }
        case 'BuildLabel': {
          const kit = this.pack.labelKits.find((k) => k.id === cmd.kit);
          if (!kit) throw new Error('Unknown label');
          const r = evaluateLabel(kit, cmd, s);
          const tries = Number(s.flags[`label.${kit.id}.tries`] ?? 0) + 1;
          const everHeld = s.flags[`label.${kit.id}.everHeld`] === true;
          s = apply([
            { setFlag: `label.${kit.id}.text`, value: r.text },
            { setFlag: `label.${kit.id}.criterion`, value: cmd.criterion },
            { setFlag: `label.${kit.id}.subject`, value: cmd.subject },
            { setFlag: `label.${kit.id}.limit`, value: cmd.limit },
            { setFlag: `label.${kit.id}.gap`, value: r.gap },
            { setFlag: `label.${kit.id}.holds`, value: r.holds },
            { setFlag: `label.${kit.id}.tries`, value: tries },
            ...(r.holds && !everHeld ? [{ addNum: 'count.labels.holding', by: 1 } as Effect, { setFlag: `label.${kit.id}.everHeld`, value: true } as Effect] : []),
            ...(!r.holds && tries === 1 ? [{ setFlag: `label.${kit.id}.failedOnce`, value: true } as Effect] : []),
            ...(r.holds && !everHeld ? kit.onHold ?? [] : []),
          ], s, out);
          r.signals.forEach((x) => out.signals.push(x));
          events.push({ kind: 'label', result: r });
          portfolio.push({ kind: 'label', title: `Label: ${kit.title}`, text: `${r.text} (${r.holds ? 'the label held' : 'visitors repeated a distorted version'}; force ${r.force - r.lower}, support ${r.support})`, weave: kit.weave });
          weaves.push(kit.weave);
          break;
        }
        case 'TurnLock': {
          const rec = this.pack.locks.find((x) => x.id === cmd.lock);
          if (!rec) throw new Error('Unknown lock');
          const r = tryLock(rec, cmd.choice);
          const wasOpen = s.flags[`lock.${rec.id}.open`] === true;
          s = apply([
            { addNum: `lock.${rec.id}.turns`, by: 1 },
            ...(r.opened ? [{ setFlag: `lock.${rec.id}.open`, value: true } as Effect, { setFlag: `lock.${rec.id}.question`, value: r.question } as Effect] : []),
            ...(r.opened && !wasOpen ? rec.onOpen ?? [] : []),
          ], s, out);
          events.push({ kind: 'lock', lock: rec.id, result: r });
          if (r.opened && !wasOpen) { portfolio.push({ kind: 'reflection', title: `EE practice: ${rec.title}`, text: `My practice question: ${r.question}`, weave: rec.weave }); weaves.push(rec.weave); }
          break;
        }
        case 'ShowdownStart': {
          const rec = this.pack.showdowns.find((x) => x.id === cmd.showdown);
          if (!rec) throw new Error('Unknown Showdown');
          if (s.showdown && s.showdown.id === rec.id && !s.showdown.outcome) break; // resume
          s = structuredClone(s);
          s.showdown = startShowdown(rec, cmd.relaxed === true);
          events.push({ kind: 'showdown', state: s.showdown });
          break;
        }
        case 'ShowdownMove': {
          if (!s.showdown) throw new Error('No Showdown is running');
          const rec = this.pack.showdowns.find((x) => x.id === s.showdown!.id)!;
          const r = playMove(rec, s.showdown, cmd.move, s);
          s = structuredClone(s);
          s.showdown = r.state;
          r.signals.forEach((x) => out.signals.push(x));
          if (r.state.outcome) {
            const o = rec.outcomes[r.state.outcome];
            s = apply([
              { setFlag: `sd.${rec.id}.outcome`, value: r.state.outcome },
              { setFlag: `sd.${rec.id}.conceded`, value: r.state.conceded.length > 0 },
              { setFlag: `sd.${rec.id}.reframed`, value: r.state.reframed },
              { setFlag: `sd.${rec.id}.claim`, value: r.state.claim ?? '' },
              ...o.effects,
            ], s, out);
            const claim = rec.playerClaims.find((c) => c.id === r.state.claim);
            portfolio.push({ kind: 'showdown', title: `Showdown: ${rec.title}`, text: `My claim: "${claim?.text ?? '—'}" (force ${r.state.force}, support ${r.state.support}). Outcome: ${r.state.outcome}. ${o.text}`, weave: rec.weave });
            weaves.push(rec.weave);
          }
          events.push({ kind: 'showdown', state: s.showdown! });
          break;
        }
        case 'FollowThread': {
          const t = this.pack.threads.find((x) => x.id === cmd.thread);
          if (!t) throw new Error('Unknown thread');
          if (!s.inventory['tool.provenance-thread']) throw new Error('You do not have the Provenance Thread yet');
          const idx = t.nodes.findIndex((n) => n.id === cmd.node);
          if (idx < 0) throw new Error('Unknown place on the thread');
          if (idx > 0 && !s.flags[`thread.${t.id}.${t.nodes[idx - 1].id}`]) throw new Error('The thread does not lead here yet. Follow it from its start.');
          const n = t.nodes[idx];
          const first = !s.flags[`thread.${t.id}.${n.id}`];
          const fx: Effect[] = [{ setFlag: `thread.${t.id}.${n.id}`, value: true }, { setFlag: `thread.${t.id}.at`, value: idx + 1 }];
          if (n.card) fx.push({ addCard: n.card });
          const gap = t.gap.after === n.id;
          if (gap) fx.push({ setFlag: `thread.${t.id}.gap`, value: true });
          s = apply(fx, s, out);
          events.push({ kind: 'thread', node: n.id, text: n.text, gap: gap ? t.gap.text : undefined });
          if (first && idx === t.nodes.length - 1) weaves.push(t.weave);
          break;
        }
        case 'Forge': {
          const r = forgeStep(s.forge, cmd.action);
          s = structuredClone(s);
          s.forge = r.forge;
          const fx: Effect[] = [{ addNum: 'forge.steps', by: 1 }];
          if (cmd.action === 'cut') fx.push({ setFlag: `forge.cut.${r.forge.route}`, value: true });
          if (cmd.action === 'crucible') fx.push({ setFlag: 'forge.triedCrucible', value: true });
          s = apply(fx, s, out);
          events.push({ kind: 'forge', line: r.line });
          break;
        }
        case 'CompareAssay': {
          const r = compareWithBlade(s.forge);
          s = apply([{ addCard: r.card }, { setFlag: 'forge.compared', value: true }, { setFlag: `forge.compared.${s.forge.route}`, value: true }], s, out);
          events.push({ kind: 'compare', match: r.match, line: r.line });
          portfolio.push({ kind: 'test', title: 'Forge test: billet and blade compared', text: r.line, weave: { concepts: ['evidence', 'explanation'], atl: ['thinking', 'research'], subjects: ['chemistry', 'design-tech', 'history'], aoks: ['NAT', 'HIS'] } });
          weaves.push({ concepts: ['evidence', 'explanation'], atl: ['thinking', 'research'], subjects: ['chemistry', 'design-tech', 'history'], aoks: ['NAT', 'HIS'] });
          break;
        }
        case 'Explore': {
          const before = s.events.pending;
          s = tickEvents(this.pack, s, Math.max(0, Math.min(60, cmd.seconds)));
          if (!before && s.events.pending) events.push({ kind: 'event-due', event: s.events.pending });
          break;
        }
        case 'DelayEvent': {
          if (!s.events.pending) break;
          s = structuredClone(s);
          s.events.pending = null; s.events.clock = 0; s.events.next = 240; // ask again in about four minutes
          break;
        }
        case 'ResolveEvent': {
          const ev = this.pack.events.find((e) => e.id === cmd.event);
          if (!ev) throw new Error('Unknown event');
          if (s.events.pending !== ev.id) break;
          s = structuredClone(s);
          s.events.pending = null;
          delete s.flags[`event.resume.${ev.id}`];
          if (s.events.seen.includes(ev.id)) break;
          s.events.seen.push(ev.id);
          s = apply([{ addNum: 'count.events', by: 1 }], s, out);
          weaves.push(ev.weave);
          break;
        }
        case 'Rest': {
          // Waystone (spec 38.7): save, rest, and an optional reflection.
          s = apply([{ addNum: 'count.rests', by: 1 }, { setFlag: 'rested', value: true }, { checkpoint: `Waystone: ${cmd.place}` }], s, out);
          events.push({ kind: 'rest', place: cmd.place });
          break;
        }
        case 'Purchase': {
          const o = this.pack.offers.find((x) => x.id === cmd.offer);
          if (!o) throw new Error('Unknown offer');
          if (!check(o.if, s)) throw new Error('That offer is not available');
          if (s.marks < o.price) throw new Error('You do not have enough marks');
          s = apply([{ addMarks: -o.price }, { giveItem: o.item }, ...(o.effects ?? [])], s, out);
          break;
        }
        case 'LorelingWatch': case 'LorelingNote': case 'LorelingOffer': case 'LorelingName': case 'LorelingField': {
          const rec = this.pack.lorelings.find((x) => x.id === cmd.loreling);
          if (!rec) throw new Error('Unknown Loreling');
          const F = `lor.${rec.id}`;
          const friend = s.flags[`${F}.friend`] === true;
          const seen = rec.sightings.filter((x) => s.flags[`${F}.seen.${x.id}`] === true).map((x) => x.id);
          if (cmd.type === 'LorelingWatch') {
            const sg = rec.sightings.find((x) => x.id === cmd.sighting);
            if (!sg) throw new Error('Unknown sighting');
            if (!seen.includes(sg.id)) s = apply([{ setFlag: `${F}.seen.${sg.id}`, value: true }, { addNum: `${F}.seenCount`, by: 1 }], s, out);
            events.push({ kind: 'loreling', loreling: rec.id, stage: 'watch', ok: true, text: sg.text });
          } else if (cmd.type === 'LorelingNote') {
            if (friend) throw new Error('Already a friend');
            if (seen.length < rec.minSightings) throw new Error('Watch it in more places first');
            const q = rec.questions.find((x) => x.id === cmd.question);
            if (!q || !q.options.some((o) => o.id === cmd.option)) throw new Error('No such option');
            s = apply([{ setFlag: `${F}.note.${q.id}`, value: cmd.option }], s, out);
            events.push({ kind: 'loreling', loreling: rec.id, stage: 'note', ok: true, text: '' });
          } else if (cmd.type === 'LorelingOffer') {
            if (friend) throw new Error('Already a friend');
            const note = Object.fromEntries(rec.questions.map((q) => [q.id, s.flags[`${F}.note.${q.id}`] as string | undefined]));
            const r = checkOffer(rec, note, cmd.place, seen);
            s = apply(r.ok ? [{ setFlag: `${F}.friend`, value: true }, { setFlag: `${F}.name`, value: rec.name }, { setFlag: 'lor.out', value: rec.id }, ...(rec.onComplete ?? [])]
              : [{ addNum: `${F}.misses`, by: 1 }], s, out);
            if (r.ok) weaves.push(rec.weave);
            events.push({ kind: 'loreling', loreling: rec.id, stage: 'offer', ok: r.ok, text: r.text, recheck: r.recheck });
          } else if (cmd.type === 'LorelingName') {
            if (!friend) throw new Error('Not a friend yet');
            const n = cleanPetName(cmd.name);
            if (!n) throw new Error('Use 1 to 16 letters, numbers or spaces');
            s = apply([{ setFlag: `${F}.name`, value: n }], s, out);
            events.push({ kind: 'loreling', loreling: rec.id, stage: 'name', ok: true, text: n });
          } else {
            if (!friend) throw new Error('Not a friend yet');
            s = apply([{ setFlag: 'lor.out', value: cmd.out ? rec.id : '' }], s, out);
            events.push({ kind: 'loreling', loreling: rec.id, stage: 'field', ok: true, text: cmd.out ? 'out' : 'camp' });
          }
          break;
        }
        case 'PhotoCaptioned': {
          // The album caption check (spec 47.4). Paid once, for a caption sorted fully right.
          s = apply([{ addNum: 'count.captions', by: 1 }], s, out);
          if (cmd.total >= 2 && cmd.right === cmd.total && s.flags['album.checked'] !== true)
            s = apply([{ setFlag: 'album.checked', value: true }, { credit: 'crit.evidence.caption' }, { journal: 'j.caption' }], s, out);
          break;
        }
        case 'PinYarn': case 'UnpinYarn': {
          const rec = (this.pack.clueBoards ?? []).find((x) => x.id === cmd.board);
          const sd = rec && this.pack.showdowns.find((x) => x.id === rec.showdown);
          if (!rec || !sd) throw new Error('Unknown clue board');
          const key = `yarn.${rec.id}.${cmd.claim}.${cmd.card}`;
          if (cmd.type === 'UnpinYarn') { s = apply([{ setFlag: key, value: false }], s, out); break; }
          if (!s.cards.includes(cmd.card)) throw new Error('You do not have that card yet');
          const v = judgeYarn(sd, cmd.claim, cmd.card);
          if (v.tone !== 'falls') s = apply([{ setFlag: key, value: true }], s, out);
          const pins = Object.keys(s.flags).filter((k) => k.startsWith(`yarn.${rec.id}.`) && s.flags[k] === true)
            .map((k) => { const [claim, ...card] = k.slice(`yarn.${rec.id}.`.length).split('.'); return { claim, card: card.join('.') }; });
          const done = viewBoard(sd, pins).done;
          const DF = `board.${rec.id}.done`;
          if (done && s.flags[DF] !== true) { s = apply([{ setFlag: DF, value: true }, ...(rec.onComplete ?? [])], s, out); weaves.push(rec.weave); }
          events.push({ kind: 'yarn', board: rec.id, claim: cmd.claim, card: cmd.card, tone: v.tone, text: v.text, done });
          break;
        }
        case 'PuzzleRound': case 'PuzzleOrder': case 'PuzzleWeigh': case 'PuzzlePeel': case 'PuzzleRestore': case 'PuzzleSight': case 'PuzzleReport': case 'PuzzleAddPoint': case 'PuzzlePredict': case 'PuzzleMap': case 'PuzzleDiagnose': case 'PuzzleTrain': case 'PuzzleTime': case 'PuzzleSurvey': case 'PuzzleTranslate': case 'PuzzleFrame': case 'PuzzleListen': case 'PuzzleForecast': {
          const rec = this.pack.puzzles.find((x) => x.id === cmd.puzzle);
          if (!rec) throw new Error('Unknown puzzle');
          if (rec.needs && !s.inventory[rec.needs.item]) throw new Error(rec.needs.sealed);
          const F = `puzzle.${rec.id}`;
          const wasDone = s.flags[`${F}.done`] === true;
          let ok: boolean, text: string, solved: boolean, gapAt: number | null = null;
          if (cmd.type === 'PuzzleForecast') {
            if (rec.type !== 'forecast') throw new Error('Not a forecast puzzle');
            const list = readForecasts(s.flags[`${F}.f`]);
            if (list.length >= rec.days.length) throw new Error('Every day already has a forecast');
            if (!rec.choices.includes(cmd.chance)) throw new Error('Choose one of the chances on the board');
            const day = rec.days[list.length];
            s = apply([{ setFlag: `${F}.f`, value: [...list, cmd.chance].join(',') }], s, out);
            ok = true; solved = false;
            text = `Day ${list.length + 1}: you said ${cmd.chance}%. ${day.rain ? 'It rained.' : 'It stayed dry.'}`;
          } else if (cmd.type === 'PuzzleListen') {
            if (rec.type !== 'shepard') throw new Error('Not a listening puzzle');
            solved = false; ok = true;
            if (cmd.action === 'play') { s = apply([{ addNum: `${F}.played`, by: 1 }], s, out); text = 'The bells ring, step by step.'; }
            else if (cmd.action === 'guess') {
              if (!Number(s.flags[`${F}.played`] ?? 0)) throw new Error('Listen to the bells first');
              const g = rec.guesses[cmd.index ?? -1];
              if (!g) throw new Error('No such answer');
              s = apply([{ setFlag: `${F}.guess`, value: cmd.index! }], s, out); text = g.reply;
            } else {
              if (typeof s.flags[`${F}.guess`] !== 'number') throw new Error('Say what you heard first');
              s = apply([{ setFlag: `${F}.compared`, value: true }], s, out);
              text = `The tuning glass shows step 0 and step ${rec.steps}: the same notes, at the same loudness.`;
            }
          } else if (cmd.type === 'PuzzleFrame') {
            const r = judgeFrame(rec, cmd.brief, cmd.x, cmd.y);
            ok = r.ok; text = r.text; solved = false;
            s = apply(r.ok ? [{ setFlag: `${F}.b.${cmd.brief}`, value: `${cmd.x},${cmd.y}` }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzleTranslate') {
            const r = translateLine(rec, cmd.picks);
            solved = false;
            if (r.over) { ok = false; text = `The crier's slate holds ${rec.type === 'translate' ? rec.budget : 0} words. This line has ${r.words}.`; }
            else {
              ok = r.lost.length === 0;
              text = ok ? 'The council reads it and acts on every part of the message.' : r.lost.map((x) => x.lost).join(' ');
              s = apply([{ setFlag: `${F}.last`, value: cmd.picks.join(',') }, ...(ok ? [{ setFlag: `${F}.sent`, value: cmd.picks.join(',') }] : [{ addNum: `${F}.tries`, by: 1 }])], s, out);
            }
          } else if (cmd.type === 'PuzzleSurvey') {
            const r = runSurvey(rec, cmd.wording, cmd.sample);
            const key = `${F}.runs`, pair = `${cmd.wording}:${cmd.sample}`;
            const runs = String(s.flags[key] ?? '').split(',').filter(Boolean);
            if (!runs.includes(pair)) s = apply([{ setFlag: key, value: [...runs, pair].join(',') }], s, out);
            ok = true; solved = false; text = `${r.yes} of ${r.total} said yes.`;
          } else if (cmd.type === 'PuzzleTime') {
            if (rec.type !== 'echo') throw new Error('Not an echo puzzle');
            const ms = Math.round(cmd.ms);
            if (!(ms >= TIME_MIN && ms <= TIME_MAX)) { ok = false; text = ms < TIME_MIN ? 'Too quick: you pressed before the sound could come back. Try again.' : 'Too slow to count. Try again.'; }
            else {
              const key = `${F}.${cmd.kind}`;
              const list = [...readTimes(s.flags[key]), ms].slice(-8);
              s = apply([{ setFlag: key, value: list.join(',') }], s, out);
              ok = true; text = `${(ms / 1000).toFixed(2)} s.`;
            }
            solved = false;
          } else if (cmd.type === 'PuzzleDiagnose' || cmd.type === 'PuzzleTrain') {
            if (rec.type !== 'sorter') throw new Error('Not a sorter puzzle');
            if (cmd.type === 'PuzzleDiagnose') {
              const r = rec.diagnose[cmd.index];
              if (!r) throw new Error('No such answer');
              ok = r.honest; text = r.why;
              s = apply(r.honest ? [{ setFlag: `${F}.diagnosed`, value: true }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
            } else {
              if (s.flags[`${F}.diagnosed`] !== true) throw new Error('Say why the sorter failed first');
              if (cmd.examples.length > rec.slots) throw new Error(`The sorter holds only ${rec.slots} examples`);
              if (new Set(cmd.examples).size !== cmd.examples.length || cmd.examples.some((x) => !rec.crate.includes(x))) throw new Error('Choose examples from the crate');
              const r = runSorter(rec, cmd.examples);
              ok = r.right === r.total;
              text = ok ? `Every fruit in the basket is sorted right (${r.right} of ${r.total}).` : `${r.right} of ${r.total} sorted right.${r.farmsHurt.length ? ` Good fruit set aside from: ${r.farmsHurt.map((x) => rec.farms[x]).join(', ')}.` : ''}`;
              s = apply(ok ? [{ setFlag: `${F}.trained`, value: cmd.examples.join(',') }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
            }
            solved = false;
          } else if (cmd.type === 'PuzzleMap') {
            const r = tryMap(rec, cmd.audience, cmd.layers);
            ok = r.ok; text = r.text; solved = false;
            s = apply(r.ok ? [{ setFlag: `${F}.a.${cmd.audience}`, value: cmd.layers.join(',') }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzleSight') {
            const r = judgeSight(rec, cmd.witness, cmd.claim, cmd.saw);
            ok = r.ok; text = r.text; solved = false;
            s = apply(r.ok ? [{ setFlag: `${F}.c.${cmd.witness}.${cmd.claim}`, value: true }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzleAddPoint' || cmd.type === 'PuzzlePredict') {
            if (rec.type !== 'conjecture') throw new Error('Not a conjecture puzzle');
            const n = Number(s.flags[`${F}.n`] ?? 0);
            if (cmd.type === 'PuzzleAddPoint') {
              if (n >= rec.angles.length) throw new Error('The window has no more places for points');
              if (n + 1 === rec.predictAt && typeof s.flags[`${F}.predict`] !== 'number') throw new Error('Make a prediction first');
              s = apply([{ setFlag: `${F}.n`, value: n + 1 }], s, out);
              ok = true; text = `${n + 1} point${n ? 's' : ''}: ${panes(n + 1)} pane${n ? 's' : ''}.`;
            } else {
              const pr = rec.predictions[cmd.index];
              if (!pr) throw new Error('No such prediction');
              if (n + 1 !== rec.predictAt) throw new Error('Predict just before that point');
              s = apply([{ setFlag: `${F}.predict`, value: cmd.index }], s, out);
              ok = true; text = pr.reply;
            }
            solved = false;
          } else if (cmd.type === 'PuzzleReport') {
            if (rec.type === 'sightlines' && !rec.witnesses.every((w) => w.claims.every((_, i) => s.flags[`${F}.c.${w.id}.${i}`] === true))) throw new Error('Sort every claim first');
            if (rec.type === 'conjecture' && Number(s.flags[`${F}.n`] ?? 0) < rec.predictAt) throw new Error('Add the next point first');
            if (rec.type === 'mapmaker' && !rec.audiences.every((a) => typeof s.flags[`${F}.a.${a.id}`] === 'string')) throw new Error('Make a map for everyone first');
            if (rec.type === 'sorter' && typeof s.flags[`${F}.trained`] !== 'string') throw new Error('Teach the sorter first');
            if (rec.type === 'echo' && (readTimes(s.flags[`${F}.echo`]).length < rec.minTimes || readTimes(s.flags[`${F}.react`]).length < rec.minTimes)) throw new Error('Time the echo and your reaction first');
            if (rec.type === 'survey' && !String(s.flags[`${F}.runs`] ?? '').split(',').includes(`${rec.fair.wording}:${rec.fair.sample}`)) throw new Error('Run a survey with a plain question and a fair group first');
            if (rec.type === 'translate' && typeof s.flags[`${F}.sent`] !== 'string') throw new Error('Send a translation that keeps every part first');
            if (rec.type === 'forecast' && readForecasts(s.flags[`${F}.f`]).length < rec.days.length) throw new Error('Forecast every day first');
            if (rec.type === 'shepard' && s.flags[`${F}.compared`] !== true) throw new Error('Compare with the tuning glass first');
            if (rec.type === 'frame' && !rec.briefs.every((b) => typeof s.flags[`${F}.b.${b.id}`] === 'string')) throw new Error('Paint a poster for everyone first');
            if (rec.type !== 'forecast' && rec.type !== 'shepard' && rec.type !== 'frame' && rec.type !== 'sightlines' && rec.type !== 'conjecture' && rec.type !== 'mapmaker' && rec.type !== 'sorter' && rec.type !== 'echo' && rec.type !== 'survey' && rec.type !== 'translate') throw new Error('This puzzle has no report');
            const r = rec.type === 'sightlines' ? rec.reports[cmd.index] : rec.reflect[cmd.index];
            if (!r) throw new Error('No such report');
            ok = r.honest; text = r.why; solved = r.honest;
            if (rec.type === 'sightlines' && solved) {
              const delivery = rec.reports[cmd.index].delivery;
              if (delivery) s = apply([{ setFlag: `${F}.delivery`, value: delivery }], s, out);
            }
            if (!r.honest) s = apply([{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzlePeel') {
            const r = peelLayer(rec, Number(s.flags[`${F}.peeled`] ?? 0));
            ok = r.ok; text = r.text; solved = false;
            s = apply([{ addNum: `${F}.peeled`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzleRestore') {
            const cur = s.flags[`${F}.method`];
            const r = restoreWith(rec, Number(s.flags[`${F}.peeled`] ?? 0), typeof cur === 'string' ? cur : null, cmd.method, cmd.label);
            ok = r.ok; text = r.text; solved = r.solved;
            s = apply(r.ok ? [{ setFlag: `${F}.method`, value: cmd.method }, { setFlag: `${F}.label`, value: cmd.label }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzleWeigh') {
            const r = weighRound(rec, Number(s.flags[`${F}.rounds`] ?? 0), cmd.round, cmd.weights);
            ok = r.ok; text = r.text; solved = r.solved;
            s = apply(r.ok ? [{ addNum: `${F}.rounds`, by: 1 }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else if (cmd.type === 'PuzzleRound') {
            const r = answerRound(rec, Number(s.flags[`${F}.rounds`] ?? 0), cmd.round, cmd.index);
            ok = r.ok; text = r.text; solved = r.solved;
            s = apply(r.ok ? [{ addNum: `${F}.rounds`, by: 1 }] : [{ addNum: `${F}.misses`, by: 1 }], s, out);
          } else {
            const r = checkOrder(rec, cmd.order);
            ok = r.ok; text = r.text; solved = r.ok; gapAt = r.gapAt;
            if (!r.ok) s = apply([{ addNum: `${F}.misses`, by: 1 }], s, out);
          }
          if (solved) s = apply([{ setFlag: `${F}.done`, value: true }, ...(!wasDone ? rec.onComplete ?? [] : [])], s, out);
          if (solved && !wasDone) weaves.push(rec.weave);
          events.push({ kind: 'puzzle', puzzle: rec.id, ok, text, gapAt });
          break;
        }
        case 'AlcovePlace': case 'AlcoveLink': case 'AlcoveImply': {
          const rec = this.pack.alcoves.find((x) => x.id === cmd.alcove);
          if (!rec) throw new Error('Unknown alcove');
          const F = `alcove.${rec.id}`;
          if (cmd.type === 'AlcovePlace') {
            const r = placeInAlcove(rec, cmd.item);
            if (r.result !== 'mirage' && r.result !== 'lit' && !this.pack.cards.some((c) => c.id === cmd.item)) throw new Error('Unknown item');
            if (r.result !== 'mirage' && !s.cards.includes(cmd.item)) throw new Error('You do not have that card');
            s = structuredClone(s);
            if (r.result === 'mirage') s = apply([{ addNum: `${F}.mirages`, by: 1 }], s, out);
            if (r.result === 'lit') { delete s.flags[`${F}.link`]; delete s.flags[`${F}.done`]; s = apply([{ setFlag: `${F}.item`, value: cmd.item }], s, out); }
            events.push({ kind: 'alcove', alcove: rec.id, stage: 'place', result: r.result, text: r.text });
          } else {
            const item = s.flags[`${F}.item`];
            if (typeof item !== 'string') throw new Error('Place an object first');
            if (cmd.type === 'AlcoveLink') {
              const r = linkAlcove(rec, item, cmd.index);
              if (r.result === 'ok') s = apply([{ setFlag: `${F}.link`, value: cmd.index }], s, out);
              else s = apply([{ addNum: `${F}.${r.result}`, by: 1 }], s, out);
              events.push({ kind: 'alcove', alcove: rec.id, stage: 'link', result: r.result, text: r.text });
            } else {
              if (typeof s.flags[`${F}.link`] !== 'number') throw new Error('Say what the object shows first');
              const r = implyAlcove(rec, item, cmd.index);
              const first = !s.flags[`${F}.done`];
              if (r.result === 'ok') {
                s = apply([{ setFlag: `${F}.done`, value: true }, { setFlag: `${F}.implication`, value: cmd.index }, ...(first && !s.flags[`${F}.ever`] ? rec.onComplete ?? [] : []), { setFlag: `${F}.ever`, value: true }], s, out);
                if (first) {
                  const obj = rec.objects.find((o) => o.card === item)!;
                  const title = this.pack.cards.find((c) => c.id === item)?.title ?? item;
                  portfolio.push({ kind: 'exhibition', title: `Alcove: ${title}`, text: `${rec.prompt}\nObject: ${title}.\n${obj.links[s.flags[`${F}.link`] as number].text}\n${obj.implications[cmd.index].text}`, weave: rec.weave });
                  weaves.push(rec.weave);
                }
              } else s = apply([{ addNum: `${F}.sphinx`, by: 1 }], s, out);
              events.push({ kind: 'alcove', alcove: rec.id, stage: 'imply', result: r.result, text: r.text });
            }
          }
          break;
        }
        case 'SetLook': {
          if (!isValidLook(cmd.look)) throw new Error('Unknown look');
          s = structuredClone(s);
          s.player.look = cmd.look;
          break;
        }
        case 'SetPronouns': {
          s = structuredClone(s);
          s.player.pronouns = cleanPronouns(cmd.pronouns);
          break;
        }
        case 'SetDiaryPortfolioDraft': {
          const entry = p.portfolio.find(({ id }) => id === cmd.entry);
          if (!entry || typeof cmd.text !== 'string') throw new Error('Unknown portfolio entry');
          const adventureDiary = setDiaryPortfolioWriting(s.adventureDiary, entry, cmd.text, now, s.mapId, !cmd.attach);
          const state = adventureDiary === s.adventureDiary ? s : { ...s, adventureDiary };
          return { state, permanent: p, events };
        }
        case 'SetDiaryReflection': {
          const state = setDiaryReflection(this.pack, s, cmd.entry, cmd.prompt, cmd.text);
          return { state, permanent: p, events };
        }
        case 'SetDiaryNoteDraft': {
          if (!isDiaryNoteKind(cmd.kind) || typeof cmd.text !== 'string') throw new Error('Unknown note type');
          const noteDraft = cmd.text.length || cmd.kind !== 'note' ? { text: cmd.text, kind: cmd.kind } : null;
          const current = s.adventureDiary.noteDraft;
          if (current?.text === noteDraft?.text && current?.kind === noteDraft?.kind) return { state: s, permanent: p, events };
          const state = { ...s, adventureDiary: { ...s.adventureDiary, noteDraft } };
          return { state, permanent: p, events };
        }
        case 'AddNote': {
          if (typeof cmd.text !== 'string' || !cmd.text.length) throw new Error('The note is empty');
          const kind = cmd.kind ?? diaryNoteKind(cmd.text);
          if (!isDiaryNoteKind(kind)) throw new Error('Unknown note type');
          s = structuredClone(s);
          s.notes.push(cmd.text);
          s.adventureDiary.noteDetails.push({ kind, at: now, mapId: s.mapId, resolved: false });
          if (cmd.fromDraft) s.adventureDiary.noteDraft = null;
          s = apply([{ addNum: 'count.notes', by: 1 }], s, out);
          break;
        }
        case 'SetDiaryQuestion': {
          const note = s.adventureDiary.noteDetails[cmd.index];
          if (!Number.isInteger(cmd.index) || note?.kind !== 'question' || typeof cmd.resolved !== 'boolean') throw new Error('Unknown journal question');
          s = structuredClone(s);
          s.adventureDiary.noteDetails[cmd.index].resolved = cmd.resolved;
          break;
        }
        case 'RequestHint': {
          const used = Number(s.flags[`hint.${cmd.objective}`] ?? 0);
          const depth = Math.min(4, used + 1) as 1 | 2 | 3 | 4;
          const hint = this.pack.hints.find((h) => h.objective === cmd.objective && h.depth === depth && check(h.if, s))
            ?? this.pack.hints.find((h) => h.objective === cmd.objective && h.depth === depth);
          if (!hint) throw new Error('Choose a quest step with a clue');
          // Asking for help never reduces XP or blocks awards (GUIDE-002).
          s = apply([{ setFlag: `hint.${cmd.objective}`, value: depth }], s, out);
          events.push({ kind: 'hint', hint });
          break;
        }
        case 'PortfolioShare': {
          const i = p.portfolio.findIndex((e) => e.id === cmd.entry);
          if (i < 0) throw new Error('Unknown portfolio entry');
          const list = [...p.portfolio]; list[i] = { ...list[i], shared: cmd.shared };
          p = { ...p, portfolio: list };
          break;
        }
        case 'PortfolioReflect': {
          const i = p.portfolio.findIndex((e) => e.id === cmd.entry);
          if (i < 0) throw new Error('Unknown portfolio entry');
          const entry = p.portfolio[i];
          const reflection = cmd.text;
          if (entry.reflection !== reflection) {
            const list = [...p.portfolio];
            list[i] = { ...entry, reflection };
            p = { ...p, portfolio: list };
          }
          const adventureDiary = setDiaryPortfolioWriting(s.adventureDiary, entry, cmd.text, now, s.mapId);
          if (adventureDiary !== s.adventureDiary) s = { ...s, adventureDiary };
          break;
        }
      }
    } catch (err) {
      return { state: s0, permanent: p0, events: [{ kind: 'error', message: (err as Error).message }] };
    }

    // The Fray Bestiary (spec 36.2): record a reasoning error the first time the player meets it.
    for (const id of this.frayMet(cmd, s0, s, events)) {
      const f = this.pack.fray.find((x) => x.id === id);
      if (!f) continue;
      const first = s.flags[`fray.${id}`] === undefined;
      s = apply([...(first ? [{ setFlag: `fray.${id}`, value: s.mapId } as Effect] : []), { addNum: `fray.${id}.n`, by: 1 }], s, out);
      if (first) events.push({ kind: 'fray', id, name: f.name, error: f.error });
    }

    // Objectives, then awards. Repeat so that completion effects can chain.
    for (let guard = 0; guard < 10; guard++) {
      let changed = false;
      // Keepsakes and the Lamp Wall (the storyline): mark each new one with a flag and a moment.
      for (const k of this.pack.keepsakes ?? []) {
        if (s.flags[`keepsake.${k.id}`] === true || !check(k.if, s)) continue;
        s = apply([{ setFlag: `keepsake.${k.id}`, value: true }], s, out);
        events.push({ kind: 'keepsake', id: k.id, name: k.name, use: k.use ?? '' });
        changed = true;
      }
      const knots = this.pack.knots ?? [];
      for (const kn of knots) {
        if (s.flags[`lamp.${kn.id}`] === true || !check(kn.if, s)) continue;
        s = apply([{ setFlag: `lamp.${kn.id}`, value: true }, { addNum: 'lamps.lit', by: 1 }, { addMarks: 5 }], s, out);
        events.push({ kind: 'lamp', id: kn.id, name: kn.name, lit: kn.lit, count: Number(s.flags['lamps.lit']), total: knots.length });
        changed = true;
      }
      // Communities (reputation): store each trust score as a number, and say when a rank rises.
      for (const cm of this.pack.communities ?? []) {
        const pts = trustOf(cm, s).pts, was = Number(s.flags[`trust.${cm.id}`] ?? 0);
        if (pts <= was) continue;
        s = apply([{ setFlag: `trust.${cm.id}`, value: pts }], s, out);
        if (rankOf(pts) !== rankOf(was)) events.push({ kind: 'trust', id: cm.id, name: cm.name, rank: rankOf(pts) });
        changed = true;
      }
      for (const m of this.activeMissions(s)) {
        for (const o of m.objectives) {
          if (s.objectivesDone.includes(o.id)) continue;
          if (!check(o.visible, s) || !check(o.done, s)) continue;
          s = structuredClone(s);
          s.objectivesDone.push(o.id);
          events.push({ kind: 'objective', id: o.id, title: o.title });
          s = apply(o.onComplete, s, out);
          if (o.weave) weaves.push(o.weave);
          if (o.kq) stones.push({ id: o.kq.id, way: `${m.world}|${o.kq.action}` });
          for (const q of o.questionWays ?? []) stones.push({ id: q.id, way: `${m.world}|${q.action}` });
          for (const sk of o.skills ?? []) skillUses.push({ id: sk, sig: objectiveSkillUse(m.world, o, sk) });
          changed = true;
        }
      }
      if (!changed) break;
    }
    for (const cid of out.credits) {
      const r = grantCredit(p, this.pack, cid);
      p = r.record;
      if (r.gained) events.push({ kind: 'xp', amount: r.gained });
    }
    const aw = checkAwards(p, this.pack, s, now);
    p = aw.record;
    for (const a of aw.newly) events.push({ kind: 'award', award: a, xp: 0 });
    if (aw.xp) events.push({ kind: 'xp', amount: aw.xp });

    // Learning records (Part L). They ride on actions; they add no tasks.
    for (const w of weaves) p = recordWeave(p, w);
    const mo = checkMoments(p, this.pack, s, now);
    p = mo.record;
    for (const m of mo.newly) events.push({ kind: 'moment', moment: m });
    for (const id of out.signals) {
      const r = addSignal(p, this.pack, id, now);
      p = r.record;
      if (r.offer) events.push({ kind: 'reflection', misconception: r.offer });
    }
    // Question Stones (KQ-003): Lumen names the question; a new way makes the stone brighter.
    for (const st of stones) {
      const record = addQuestionWay(p, st.id, st.way);
      events.push({ kind: 'stone', question: st.id, ways: record.stones[st.id].length, newWay: record !== p });
      p = record;
    }
    // Skill Atlas (spec 76.1): one use per distinct context.
    for (const { id, sig } of skillUses) p = recordSkillUse(p, id, sig);
    for (const tid of out.portfolio) {
      const t = this.pack.portfolio.find((x) => x.id === tid);
      if (t) portfolio.push({ kind: t.kind, title: t.title, text: t.text, weave: t.weave });
    }
    for (const e of portfolio) {
      p = addPortfolio(p, { ...e, at: now, world: worldOf(s) });
      events.push({ kind: 'portfolio', title: e.title });
    }

    pushOutputs(out, events);
    s = recordAdventure(this.pack, s0, s, cmd, events, now, diaryChoice);
    return { state: s, permanent: p, events, nextNode };
  }
}

function pushOutputs(out: EffectOutputs, events: GameEvent[]): void {
  out.cards.forEach((id) => events.push({ kind: 'card', id }));
  out.journal.forEach((id) => events.push({ kind: 'journal', id }));
  out.items.forEach((i) => events.push({ kind: 'item', id: i.id, qty: i.qty }));
  if (out.marks) events.push({ kind: 'marks', delta: out.marks });
  out.checkpoints.forEach((label) => events.push({ kind: 'checkpoint', label }));
}
