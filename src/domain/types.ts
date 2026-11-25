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
  person?: { name: string; life: string; region: string; era: string };
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
  /** Skill ids from the private skills inventory (paraphrased, e.g. "SK-GRM-05"). */
  skills: string[];
  onComplete?: Effect[];
  weave: Weave;
} & (
  | { type: 'rounds'; rounds: { prompt: string; options: { text: string; ok: boolean; result: string }[] }[] }
  | { type: 'order'; tiles: { id: string; text: string; role: string; why?: string }[]; answer: string[]; success: string }
);

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
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export const CAMPAIGN_SCHEMA = 4;
export const PERMANENT_SCHEMA = 3;

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
}
