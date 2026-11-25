/**
 * Core data types for Knowledge Guardians.
 *
 * This module has NO Phaser or DOM imports. Rules live in the domain layer so
 * they can be tested without rendering (spec section 22.2).
 *
 * Content is authored as JSON in src/content/ and checked at startup and in
 * tests by src/domain/validate.ts. Content never contains executable code;
 * conditions and effects use the small vocabulary below (spec 22.2).
 */

// ---------------------------------------------------------------------------
// Claim labels (spec 2.2 and 17). Two separate axes.
// ---------------------------------------------------------------------------

/** What kind of claim a text or card makes (spec 2.2, field claim_kind). */
export type ClaimKind = 'observation' | 'interpretation' | 'value' | 'simulation';

/** Historical status of material (spec 2.2 / 17, field historical_evidence_label). */
export type HistoricalLabel =
  | 'documented'
  | 'reconstruction'
  | 'scholarly-interpretation'
  | 'imagined-alternate'
  | 'fictional-world';

export type Concept =
  | 'evidence' | 'certainty' | 'truth' | 'interpretation' | 'power' | 'justification'
  | 'explanation' | 'objectivity' | 'perspective' | 'culture' | 'values' | 'responsibility';

export const CONCEPTS: Concept[] = [
  'evidence', 'certainty', 'truth', 'interpretation', 'power', 'justification',
  'explanation', 'objectivity', 'perspective', 'culture', 'values', 'responsibility',
];

// ---------------------------------------------------------------------------
// The curriculum weave (Parts C, I and L). Tags only: they never grade.
// ---------------------------------------------------------------------------

/** The five ATL skill categories (spec 91.1). */
export type ATL = 'thinking' | 'communication' | 'social' | 'self-management' | 'research';
export const ATLS: ATL[] = ['thinking', 'communication', 'social', 'self-management', 'research'];

/** The ten learner profile attributes (spec 90). Shown as moments, never as scores. */
export type ProfileAttribute =
  | 'inquirer' | 'knowledgeable' | 'thinker' | 'communicator' | 'principled'
  | 'open-minded' | 'caring' | 'risk-taker' | 'balanced' | 'reflective';
export const PROFILE: ProfileAttribute[] = [
  'inquirer', 'knowledgeable', 'thinker', 'communicator', 'principled',
  'open-minded', 'caring', 'risk-taker', 'balanced', 'reflective',
];

/** Areas of knowledge and optional themes (short codes, spec 4.1). */
export type AOK = 'HIS' | 'NAT' | 'HUM' | 'ART' | 'MAT' | 'TEC' | 'LAN' | 'POL' | 'REL' | 'IND';

/** Course links of one activity (spec 42.2 "weave set", 91.1 "ATL ribbon"). */
export interface Weave {
  concepts: Concept[];
  atl: ATL[];
  aoks?: AOK[];
  /** DP subject ids from src/domain/curriculum.ts. */
  subjects?: string[];
}

// ---------------------------------------------------------------------------
// Conditions and effects: a restricted, data-only vocabulary.
// ---------------------------------------------------------------------------

export type FlagValue = string | number | boolean;

export type Condition =
  | { flag: string; eq: FlagValue }
  | { flag: string; in: FlagValue[] }
  | { flagSet: string }
  | { num: string; gte?: number; lte?: number }
  | { item: string; min?: number }
  | { marks: number }
  | { card: string }
  | { objective: string }
  | { origin: string }              // the player's chosen origin (spec 35.1)
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition };

export type Effect =
  | { setFlag: string; value: FlagValue }
  | { addNum: string; by: number }
  | { giveItem: string; qty?: number }
  | { takeItem: string; qty?: number }
  | { addMarks: number }
  | { addCard: string }
  | { journal: string }
  | { relation: string; by: number }
  | { companion: string | null }
  | { credit: string }            // grant a permanent credit criterion (idempotent)
  | { checkpoint: string }        // ask the shell to write a checkpoint with this label
  | { signal: string }            // a misconception signal (spec 95), e.g. "MIS-29"
  | { portfolio: string };        // add an authored portfolio entry (spec 94.4)

// ---------------------------------------------------------------------------
// Content records
// ---------------------------------------------------------------------------

export interface SourceRecord {
  id: string;                 // e.g. HIS-S11 (spec 20.5)
  title: string;
  url: string;
  locator: string;            // which part of the source
  supports: string;           // the narrow claim it supports
  accessed: string;           // ISO date the authors consulted it
}

export interface EvidenceCard {
  id: string;
  title: string;
  text: string;
  claimKind: ClaimKind;
  historicalLabel: HistoricalLabel;
  sources: string[];          // SourceRecord ids; empty for fictional-world cards
  limits: string;             // what this card does NOT show
  /** Real person this card is about (Guardian Card mode C, spec 44.1). */
  /** `place` is shown to players: the person's own place or people, never a continent group. `continent` is an internal coverage check only. */
  person?: { name: string; life: string; place: string; era: string; continent: string };
}

export interface ExhibitRecord {
  id: string;                 // e.g. OBJ-001-A
  name: string;
  art: string;                // key in src/ui/illustrations.ts
  historicalLabel: HistoricalLabel;
  dateText: string;           // human readable, with qualifiers kept (e.g. "probably")
  dateKind: string;           // what the date describes (Date-Kind Lens result)
  summary: string;
  sources: string[];
  grantsCard: string;
  altText: string;            // accessible description of the picture
  /** Optional label kit that repairs this exhibit's label (Hall of Firsts). */
  labelKit?: string;
}

export interface DialogueOption {
  text: string;
  if?: Condition;
  effects?: Effect[];
  next?: string | null;       // null or missing = end conversation
  /** Optional tag shown to the player, e.g. "Ask for a source". */
  tag?: string;
  /** Opens a tool when the conversation closes (see OPENABLE in validate.ts). */
  open?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;            // character id, "narrator", "lumen" or "mentor:<name>"
  text: string;
  claimKind?: ClaimKind;
  historicalLabel?: HistoricalLabel;
  effects?: Effect[];
  options?: DialogueOption[];
  next?: string | null;
  /** Opens a tool when this node is the last one: "showdown:<id>", "label:<kit>", "forge", "thread:<id>". */
  open?: string;
}

export interface CharacterRecord {
  id: string;
  name: string;
  role: string;
  sprite: string;             // file id in public/assets/art/generated/characters
  mode: 'fictional' | 'historical';
  /** Dialogue entry points, first matching condition wins. */
  talk: { if?: Condition; node: string }[];
}

export interface Hint {
  id: string;
  objective: string;
  depth: 1 | 2 | 3 | 4;
  text: string;
  if?: Condition;
}

export interface Objective {
  id: string;
  title: string;
  /** Objective completes when this holds. Checked after every command. */
  done: Condition;
  /** Objective is visible when this holds (default: always). */
  visible?: Condition;
  essential: boolean;
  onComplete?: Effect[];
  weave?: Weave;
  /** Skill ids practised in this step (Skill Atlas, spec 76). */
  skills?: string[];
  /** The knowledge question under this step, and how the player meets it (KQ-002, KQ-003). */
  kq?: { id: string; action: string };
}

export interface Mission {
  id: string;
  world: string;
  title: string;
  knowledgeQuestion: string;
  objectives: Objective[];
  available?: Condition;
}

export interface CreditCriterion {
  id: string;                 // stable award identity (spec 23.3)
  concept: Concept;
  maximum: number;            // fixed maximum permanent XP for this criterion
}

export interface AwardRecord {
  id: string;
  kind: 'concept-award' | 'skill-milestone' | 'badge';
  name: string;
  /** Names the action that earned it (spec 6.2). */
  earnedBy: string;
  /** A title the player may wear once earned (spec 47.1, C1). It names the deed. */
  title?: string;
  criteria: string[];         // CreditCriterion ids that are credited with it
  when: Condition;
}

export interface ItemRecord {
  id: string;
  name: string;
  description: string;
  historicalLabel: HistoricalLabel;
  art: string;
}

export interface Offer {
  id: string;
  item: string;
  price: number;
  if?: Condition;
  effects?: Effect[];
}

// ---------------------------------------------------------------------------
// Label builder (spec 29.1 item 2, PLAY-001, the Fray 2.11)
// ---------------------------------------------------------------------------

/**
 * A label is built from parts: who, what kind of "first" (criterion) and a
 * limit. Force is what the label claims; support is the evidence the player
 * holds for that exact combination. If force is bigger than support, the Fray
 * stays and visitors repeat a distorted version. Many combinations hold.
 */
export interface LabelKit {
  id: string;
  title: string;
  oldLabel: string;
  /** Flag prefix and place name for the world response. */
  place: string;
  subjects: { id: string; text: string }[];
  criteria: { id: string; text: string; force: number; signal?: string }[];
  limits: { id: string; text: string; lower: number }[];
  /** Support for one subject + criterion pair. Each held card adds its weight. */
  supports: { subject: string; criterion: string; cards: { card: string; weight: number }[]; heard: string; weak?: string; signal?: string }[];
  /** What visitors say when the label does not hold. */
  weak: { noSupport: string; tooStrong: string };
  onHold?: Effect[];
  /** Join as one sentence ("Patents were one factor…") instead of a museum label ("First patent: Loud."). */
  sentence?: boolean;
  /** Words for the builder panel when the kit is not a museum label (for example an EE claim board). */
  legends?: { intro?: string; subject?: string; criterion?: string; limit?: string; button?: string };
  weave: Weave;
}

// ---------------------------------------------------------------------------
// Showdown (spec 12.24)
// ---------------------------------------------------------------------------

export type ShowdownOutcome = 'exposed' | 'narrowed' | 'split' | 'won-over' | 'lost-ground';

export interface ShowdownLink {
  id: string;
  text: string;               // what this support says
  /** Cards that show this link is weak. */
  weakTo: string[];
  cracked: string;            // one-line reason when a challenge works (SHOW-004)
  holds: string;              // one-line reason when a challenge fails
}

export interface ShowdownRecord {
  id: string;
  title: string;
  place: string;
  opponent: string;           // character id
  intro: string;
  /** A value disagreement allows many stable outcomes (SHOW-001). */
  valueShowdown: boolean;
  crowd: { player: number; opponent: number; patience: number };
  opponentClaim: {
    text: string; force: number; seal?: boolean;
    links: ShowdownLink[];
    /** Cards that work as a counterexample to the general claim. */
    counterexamples: { card: string; why: string }[];
    narrowed: string;         // what the opponent claims after narrowing
    sourceReply: string;      // what the opponent says when asked for the source
  };
  playerClaims: {
    id: string; text: string; force: number;
    supports: { card: string; strength: number; why: string }[];
    reframe?: string;         // line when this claim reframes the opponent's claim
    signal?: string;          // misconception signal when chosen (e.g. MIS-34)
  }[];
  witnesses: { id: string; name: string; if?: Condition; strength: number; line: string }[];
  /** Fair points the opponent makes; conceding one raises crowd trust. */
  fairPoints: { id: string; text: string; concede: string }[];
  /** Opponent moves, used in order and repeated. */
  script: ({ move: 'press'; line: string } | { move: 'seal'; line: string } | { move: 'shout'; line: string } | { move: 'point'; point: string })[];
  outcomes: Record<ShowdownOutcome, { text: string; effects: Effect[] }>;
  canBeWonOver: boolean;
  /**
   * Cross-examination (spec 47, C1 one use): after this many opponent turns, the opponent
   * makes a new statement. For one move only, the player can present a card that contradicts it.
   */
  testimony?: { afterTurn: number; line: string; contradictedBy: string[]; caught: string; wrong: string };
  /** Misconception signal when the player answers an open fair point with a cheap shot or a shout (MIS-36). */
  dodgeSignal?: string;
  weave: Weave;
}

// ---------------------------------------------------------------------------
// Knowledge questions (spec 62): our own paraphrases, never IB wording
// ---------------------------------------------------------------------------

export interface KnowledgeQuestion {
  id: string;                 // KQ-NEW-...
  text: string;
  /** Lumen's last word after a step that carries this question (one sentence). */
  lastWord: string;
}

// ---------------------------------------------------------------------------
// Smart glossary (spec 47.10)
// ---------------------------------------------------------------------------

export interface GlossaryEntry {
  id: string;
  term: string;
  /** Word forms to mark in text, lower case (for example "claim", "claims"). */
  match: string[];
  /** Plain explanation in our own words (no copied course wording). */
  text: string;
  /** Examples from play: the first whose condition holds is shown. {flag:name} shows a flag's value. */
  examples: { if?: Condition; text: string }[];
}

// ---------------------------------------------------------------------------
// Title Lock (spec 92.2): EE practice, narrowing a question
// ---------------------------------------------------------------------------

export interface TitleLockRecord {
  id: string;
  title: string;
  /** DP subject id the practice trail sits near (EE-001). */
  subject: string;
  intro: string;
  /** Rings, in the order their texts join into the question. */
  parts: { id: string; label: string; options: { id: string; text: string; ok: boolean; why: string }[] }[];
  openLine: string;
  /** Applied the first time the lock opens. */
  onOpen?: Effect[];
  weave: Weave;
}

// ---------------------------------------------------------------------------
// Provenance Thread (spec 12.23)
// ---------------------------------------------------------------------------

export interface ThreadRecord {
  id: string;
  title: string;
  object: string;
  nodes: { id: string; label: string; map: string; x: number; y: number; text: string; card?: string }[];
  gap: { after: string; text: string; x: number; y: number };
  limit: string;              // LENS-001: what the thread cannot show
  weave: Weave;
}

// ---------------------------------------------------------------------------
// Learner profile moments, misconceptions, portfolio, events
// ---------------------------------------------------------------------------

export interface MomentRule {
  id: string;
  attribute: ProfileAttribute;
  when: Condition;
  /** What the player did, in the second person. */
  did: string;
  /** An optional reflection question (PROFILE-002). */
  prompt: string;
}

export interface MisconceptionRecord {
  id: string;                 // MIS-01 .. MIS-40 (spec 95.2)
  title: string;
  signal: string;             // the pattern of play that raises a signal
  worldResponse: string;
  reflection: string;         // shown to the student at the student threshold
  teacherMove: string;
  concepts: Concept[];
  student: { count: number; days: number };
  teacher: { count: number; days: number };
}

export interface PortfolioTemplate {
  id: string;
  kind: 'label' | 'showdown' | 'test' | 'reflection' | 'crossing' | 'exhibition' | 'essay';
  title: string;
  text: string;
  weave: Weave;
}

export type EventType =
  | 'EV-VIS' | 'EV-FIND' | 'EV-TWIST' | 'EV-SKY' | 'EV-FRAY' | 'EV-FEST'
  | 'EV-LORE' | 'EV-LUCK' | 'EV-ECHO' | 'EV-MYST' | 'EV-HELP' | 'EV-CROSS';

export interface EventRecord {
  id: string;
  deckId: string;             // the spec event it adapts, e.g. EVT-07
  type: EventType;
  maps: string[];
  title: string;
  /** Dialogue node that plays the event. */
  node: string;
  when?: Condition;
  /** Calm-mode text: warns first, can be delayed, never timed (spec 93.3). */
  calm: string;
  /** Marked lucky breaks have no course link (WEAVE-018). */
  luck?: boolean;
  weave: Weave;
}

/** An Exhibition Hall alcove (SYM-001). */
export interface AlcoveRecord {
  id: string;
  title: string;
  /** The alcove's prompt: a question about knowledge (our own paraphrase). */
  prompt: string;
  /** Symbol icons the player can try. They never light the lamps. */
  symbols: { id: string; name: string; mirage: string }[];
  /** Reply when the player places a card that is not an object (a person, an essay). */
  notObject: string;
  /** Real objects (evidence cards) that can light the alcove. */
  objects: {
    card: string;
    lit: string;
    links: { text: string; kind: 'specific' | 'checklist' | 'generic'; response: string }[];
    implications: { text: string; ok: boolean; response: string }[];
  }[];
  onComplete?: Effect[];
  weave: Weave;
}

/** A word puzzle (Sign-Smith lock or Citation Thread bridge; see puzzles.ts). */
export type PuzzleRecord = {
  id: string;
  title: string;
  intro: string;
  /** A knowledge-gated puzzle (spec 12.23): it opens only with this tool; until then it shows `sealed`. */
  needs?: { item: string; sealed: string };
  /** Skill ids from the private skills inventory (paraphrased, e.g. "SK-GRM-05"). */
  skills: string[];
  onComplete?: Effect[];
  weave: Weave;
} & (
  | { type: 'rounds'; rounds: { prompt: string; options: { text: string; ok: boolean; result: string }[] }[] }
  | { type: 'order'; tiles: { id: string; text: string; role: string; why?: string }[]; answer: string[]; success: string;
      /** Words for the feedback (default: a bridge thread). */
      words?: { stops: string; sags: string; done: string; notPart: string } }
  /**
   * A balance bench (spec 47 "balance scales", C1 test bench): put weights on the right pan
   * until it balances the load. Weights marked `untrusted` (the thing under test's own
   * measure) never count as a fair weighing, even when the pans balance.
   */
  | { type: 'balance'; rounds: BalanceRound[] }
  /**
   * A restorer's trestle (spec 12 IT14 and EV02, C1): look under each layer with a small
   * test swab, choose a restoration method, then write a label that says honestly what
   * was kept and what was lost. Every method is valid; only the label is checked.
   */
  | { type: 'restore'; object: string; layers: RestoreLayer[]; methods: RestoreMethod[]; face: PlaqueFace }
  /**
   * Sightlines (perspective; first-hand and second-hand knowledge): witnesses stand in a
   * small map with things that block the view. The player draws each witness's sightlines
   * and sorts each claim into "saw it" or "could not see it". Then the player chooses a
   * fair report. The map decides what each person could see, so the answer is checkable.
   */
  /**
   * A conjecture window (mathematics; a pattern is evidence, not a proof): the player adds
   * points on a circle one at a time and the window counts its panes. Before the point
   * where the pattern breaks, the player makes a prediction (never graded). Then the
   * player says what the break shows.
   */
  | { type: 'conjecture'; angles: number[]; claim: string; predictAt: number; predictions: { text: string; reply: string }[]; reflect: { text: string; honest: boolean; why: string }[]; proof: string[] }
  /**
   * A mapmaker's table (a model is not the thing): the sheet holds only a few layers. The
   * player makes a map for each person, who uses it on a short trip. Any map that gives
   * the person what they need works. Then the player says which map is "true".
   */
  | { type: 'mapmaker'; maxLayers: number; layers: { id: string; label: string }[]; audiences: { id: string; name: string; wants: string; need: string[]; success: string; lost: string }[]; reflect: { text: string; honest: boolean; why: string }[] }
  /**
   * A learning sorter (technology AOK): a brass machine sorts fruit by copying the examples
   * it was given. First the player sees it sort with a narrow set of examples and says why
   * it failed; then the player chooses examples; then the player reflects.
   */
  | { type: 'sorter'; slots: number; fruits: SorterFruit[]; crate: string[]; basket: string[]; start: string[]; diagnose: { text: string; honest: boolean; why: string }[]; reflect: { text: string; honest: boolean; why: string }[]; farms: Record<string, string> }
  /**
   * An echo measurement (natural sciences; error and uncertainty): clap, press when the
   * echo returns, and work out the distance. Then measure your own reaction time, and
   * see how a delay that is always there pushes every result the same way.
   */
  | { type: 'echo'; distance: number; speed: number; minTimes: number; reflect: { text: string; honest: boolean; why: string }[] }
  /**
   * A survey (human sciences): the wording of a question and who is asked both change the
   * answer. Every person has a fixed view; a leading question flips people whose view is
   * not firm. The player runs surveys, compares them, then chooses a fair report.
   */
  | { type: 'survey'; groups: Record<string, string>; people: SurveyPerson[]; wordings: { id: string; text: string; lean: 'none' | 'yes' | 'no' }[]; samples: { id: string; label: string; people: string[] }[]; fair: { wording: string; sample: string }; reflect: { text: string; honest: boolean; why: string }[] }
  /**
   * A translation relay (language AOK): a message in the ferryfolk's cant must reach the
   * council in English. Some cant words mark a difference that English does not mark in one
   * word. The player picks a rendering for each word within the crier's word limit. Many
   * translations work: a translation works when it keeps every difference the reader needs.
   */
  | { type: 'translate'; speaker: string; source: string; frame: string; budget: number; words: TranslateWord[]; parts: { id: string; name: string; lost: string }[]; reflect: { text: string; honest: boolean; why: string }[] }
  /**
   * The painter's frame (the arts): one wide, true scene; people ask for posters. Where the
   * player puts the frame decides what the poster says. Every poster is true, and none of
   * them shows the whole scene. An item is in the frame when its centre is inside it.
   */
  | { type: 'frame'; scene: { w: number; h: number }; frame: { w: number; h: number }; items: FrameItem[]; briefs: FrameBrief[]; reflect: { text: string; honest: boolean; why: string }[] }
  /**
   * The endless bell stair (perception; natural and human sciences): a Shepard scale. Each
   * step sounds higher, but after `steps` steps the notes are the same as at the start. The
   * player listens, says what they heard (never graded), then compares with a measurement.
   */
  | { type: 'shepard'; steps: number; base: number; octaves: number; guesses: { text: string; reply: string }[]; reflect: { text: string; honest: boolean; why: string }[] }
  /**
   * The forecast board (certainty; natural sciences and mathematics): for each day the player
   * reads the clues and says how likely rain is. The days are fixed, never random. At the end
   * the board compares the player's forecasts with 'always 50%' and the almanac. The score is
   * shown, never graded: only the reflection has a fair answer.
   */
  | { type: 'forecast'; choices: number[]; notes: string[]; days: ForecastDay[]; reflect: { text: string; honest: boolean; why: string }[] }
  | { type: 'sightlines'; grid: { w: number; h: number }; blocks: SightBlock[]; spots: SightSpot[]; witnesses: Witness[]; reports: { text: string; honest: boolean; why: string }[] }
);

export interface ForecastDay { baro: 'falling' | 'steady' | 'rising'; clouds: 'low' | 'high' | 'none'; birds: 'low' | 'high'; rain: boolean; almanac: number }
export interface FrameItem { id: string; label: string; art: string; x: number; y: number; w: number; h: number }
export interface FrameBrief { id: string; who: string; wants: string; need: string[]; avoid: string[]; success: string }
export interface TranslateWord { id: string; word: string; note: string; choices: { text: string; keeps: string[]; back: string }[] }
export interface SurveyPerson { id: string; group: string; yes: boolean; firm: boolean }
export interface SorterFruit { id: string; colour: 'red' | 'green' | 'yellow'; size: 'small' | 'large'; bruised: boolean; farm: string }
export interface SightBlock { x: number; y: number; w: number; h: number; label: string; kind: 'stall' | 'fountain' | 'crates' | 'cart' }
export interface SightSpot { id: string; x: number; y: number; label: string }
export interface Witness { id: string; name: string; x: number; y: number; colour: string; claims: { spot: string; text: string; heard?: string }[] }

/** How the object's face looks: background, ink and short lines; an optional small window. */
export interface PlaqueFace { bg: string; ink: string; lines: string[]; window?: { bg: string; ink: string; lines: string[] } }

/** One layer of an object, top layer first. */
export interface RestoreLayer { id: string; name: string; colour: string; text: string }

export interface RestoreMethod {
  id: string;
  label: string;
  does: string;
  /** Layer ids that stay (visible or hidden). */
  keeps: string[];
  /** Layer ids that are gone after this method. Together with keeps: every layer once. */
  loses: string[];
  /** A reversible method can be changed later; an irreversible one cannot. */
  reversible: boolean;
  result: string;
  face: PlaqueFace;
  labels: { text: string; honest: boolean; why: string }[];
}

/** A keepsake for the Guardian's quarters (spec 12.16): shown on a shelf once `if` holds. Cosmetic only. */
/** `use` says where the keepsake matters in the world (shown when it is earned and in the quarters). */
export interface Keepsake { id: string; name: string; text: string; if: Condition; where: string; use?: string }
/** The Lamp Wall (storyline): one lamp for each of Emberford's knots that the player helps untie. */
export interface Knot { id: string; name: string; who: string; lit: string; if: Condition }
/** A clue object: a base description, and new views that a keepsake reveals (a perspective or a pathway). */
export interface ClueView { keepsake: string; text: string; effects?: Effect[] }
export interface ClueRecord { id: string; name: string; text: string; views: ClueView[]; onRead?: Effect[]; study?: boolean }
/** A dialogue option that appears with a character once the player holds a keepsake. */
/** The story so far (Journal): one beat shown once its condition holds. `{lamps}` is the number of lamps lit. */
export interface ChronicleBeat { id: string; title: string; text: string; if?: Condition }
export interface KeepsakeTalk { id: string; character: string; keepsake: string; text: string; node: string; if?: Condition }

/** World memory (spec 47, C1): a short line a person says when the player passes, once the condition holds. */
export interface MemoryLine { id: string; character: string; if: Condition; line: string }

/** A practice clue board for a Showdown (spec 47, C1). */
export interface ClueBoardRecord {
  id: string;
  showdown: string;
  title: string;
  intro: string;
  onComplete?: Effect[];
  weave: Weave;
}

export interface BalanceRound {
  prompt: string;
  load: { label: string; mass: number };
  weights: { id: string; label: string; mass: number; untrusted?: string }[];
  success: string;
}

/**
 * A Loreling (spec 36.1): a small fictional creature linked to one concept. The player
 * befriends it by patient observation: watch it, note its pattern, then wait in the
 * right place. A wrong note means it does not come; the player watches again and revises.
 */
export interface LorelingRecord {
  id: string;
  name: string;
  concept: Concept;
  intro: string;
  sightings: { id: string; place: string; text: string }[];
  /** Pattern questions. Every wrong option names the sighting that contradicts it. */
  questions: { id: string; prompt: string; answer: string; options: { id: string; text: string; contradicts?: string; why?: string }[] }[];
  offer: { prompt: string; answer: string; options: { id: string; text: string; result?: string }[] };
  /** Watching in this many places before the note can be written. */
  minSightings: number;
  befriended: string;
  names: string[];
  forms: { name: string; power: string; needs?: string }[];
  skills: string[];
  weave: Weave;
  onComplete?: Effect[];
}

/** Pronouns the player chose (spec 35.1). Characters use them in text through {they}, {them} and {their}. */
export interface Pronouns { subject: string; object: string; possessive: string }

/** A player origin (spec 35.1): a background, one starting Lens hint and one unique option in each world. No stat advantage. */
export interface OriginRecord {
  id: string;
  name: string;
  background: string;
  /** What this background helps the player notice (course link, paraphrased). */
  link: string;
  /** Journal entry id given at the start: the extra Lens hint. */
  journal: string;
}

export interface PlayerRecord {
  name: string;
  look: string;
  pronouns: Pronouns;
  /** Origin id, or null for saves made before origins existed. */
  origin: string | null;
}

export interface ContentPack {
  id: string;
  contentVersion: number;
  sources: SourceRecord[];
  cards: EvidenceCard[];
  exhibits: ExhibitRecord[];
  characters: CharacterRecord[];
  dialogue: DialogueNode[];
  missions: Mission[];
  hints: Hint[];
  criteria: CreditCriterion[];
  awards: AwardRecord[];
  items: ItemRecord[];
  offers: Offer[];
  journal: { id: string; text: string; claimKind?: ClaimKind }[];
  labelKits: LabelKit[];
  showdowns: ShowdownRecord[];
  locks: TitleLockRecord[];
  glossary: GlossaryEntry[];
  questions: KnowledgeQuestion[];
  threads: ThreadRecord[];
  moments: MomentRule[];
  misconceptions: MisconceptionRecord[];
  portfolio: PortfolioTemplate[];
  events: EventRecord[];
  origins: OriginRecord[];
  alcoves: AlcoveRecord[];
  puzzles: PuzzleRecord[];
  lorelings: LorelingRecord[];
  clueBoards?: ClueBoardRecord[];
  keepsakes?: Keepsake[];
  knots?: Knot[];
  clues?: ClueRecord[];
  keepsakeTalks?: KeepsakeTalk[];
  chronicle?: ChronicleBeat[];
  /** The Deep Dive (spec 59): prompts and the things a player can answer with. */
  divePrompts?: import('./dive').DivePrompt[];
  diveItems?: import('./dive').DiveItem[];
  memories?: MemoryLine[];
  /** The Fray Bestiary (spec 36.2): errors in reasoning shown as creatures. Recorded on first meeting. */
  fray: { id: string; name: string; error: string; pattern: string; weakness: string; chapter: number | null }[];
  /** The whole Loreling Atlas (spec 36.1): every Loreling, with the concept it lives near. */
  lorelingAtlas: { name: string; concept: Concept; power: string }[];
  skillDomains: { id: string; name: string }[];
  skills: { id: string; domain: string; name: string }[];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export const CAMPAIGN_SCHEMA = 4;
export const PERMANENT_SCHEMA = 4;

export interface ShowdownLogLine { who: 'player' | 'opponent' | 'crowd' | 'witness'; text: string; why?: string }

/** A Showdown in progress. Saved with the campaign so a stop at the bell loses nothing. */
export interface ShowdownState {
  id: string;
  turn: number;
  trust: { player: number; opponent: number };
  claim: string | null;       // chosen player claim id
  force: number;              // current force of the player's claim
  support: number;            // support the player has placed
  used: string[];             // cards and witnesses already played
  cracked: string[];          // opponent links cracked
  opponentForce: number;
  exposed: boolean;
  narrowed: boolean;
  reframed: boolean;
  sealShown: boolean;
  openPoint: string | null;   // a fair point the player can concede now
  conceded: string[];
  cheapShots: number;
  /** Cross-examination: the statement is open for one move, then caught or missed. */
  testimony?: 'open' | 'caught' | 'missed';
  /** Zen mode: the crowd waits; the Showdown ends only when the player rests or every link is cracked. */
  relaxed?: boolean;
  log: ShowdownLogLine[];
  outcome: ShowdownOutcome | null;
}

/** The test billet at Hesper's forge (spec 29.1 item 5). Schematic only. */
export interface ForgeState {
  route: 'none' | 'pattern' | 'crucible';
  steels: number;             // pieces stacked (pattern route)
  welded: boolean;
  twists: number;
  folds: number;
  melted: boolean;            // crucible route
  cooled: boolean;
  cut: boolean;
}

/** Everything that rolls back together when a checkpoint loads (spec 24.2). */
export interface CampaignState {
  schema: number;
  contentVersion: number;
  player: PlayerRecord;
  mapId: string;
  pos: { x: number; y: number };
  facing: 'down' | 'up' | 'left' | 'right';
  flags: Record<string, FlagValue>;
  inventory: Record<string, number>;
  marks: number;                    // campaign currency
  relations: Record<string, number>;
  journal: string[];
  /** The player's own free-text notes. Never graded (spec 22.3). */
  notes: string[];
  cards: string[];
  objectivesDone: string[];
  companion: string | null;
  rng: { seed: number; state: number };
  playSeconds: number;
  showdown: ShowdownState | null;
  forge: ForgeState;
  /** Event deck clock in seconds of exploration (spec 93.1). */
  events: { clock: number; next: number; seen: string[]; pending: string | null };
}

export interface PortfolioEntry {
  id: string;                 // unique per entry
  at: string;                 // ISO time
  world: string;
  kind: PortfolioTemplate['kind'];
  title: string;
  text: string;
  weave: Weave;
  /** The student chooses what the teacher may see (TEACH-002, 94.4). */
  shared: boolean;
  reflection: string;
}

/** Permanent record, kept apart from campaign rollback (spec 24.2, 23.3). */
export interface PermanentRecord {
  schema: number;
  credit: Record<string, number>;   // criterion id -> credited amount (<= maximum)
  awards: Record<string, string>;   // award id -> ISO time first earned
  /** Learner profile moments: rule id -> ISO time (PROFILE-001: no scores). */
  moments: Record<string, string>;
  /** Misconception signals: id -> ISO times seen (spec 95.1). */
  signals: Record<string, string[]>;
  /** Alerts the teacher marked "not a misconception" (MISC-001). */
  dismissed: string[];
  /** Reflections already offered to the student. */
  offered: string[];
  /** Weave tags met in play (counts), for the dashboard (spec 94.2). */
  met: { concepts: Record<string, number>; atl: Record<string, number>; subjects: Record<string, number>; aoks: Record<string, number> };
  portfolio: PortfolioEntry[];
  /** Question Stones (KQ-003): knowledge question id -> ways met ("world|action"). */
  stones: Record<string, string[]>;
  /** Skill Atlas: skill id -> distinct use signatures (see skills.ts). Schema 4. */
  skills: Record<string, string[]>;
}
