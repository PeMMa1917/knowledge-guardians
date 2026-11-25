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
  | { boardLinks: number }
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
  | { checkpoint: string };       // ask the shell to write a checkpoint with this label

// ---------------------------------------------------------------------------
// Content records
// ---------------------------------------------------------------------------

export interface SourceRecord {
  id: string;                 // e.g. HIS-S11 (spec 20.5)
  title: string;
  url: string;
  locator: string;            // which part of the source
  supports: string;           // the narrow claim it supports
  accessed: string;           // ISO date the spec authors consulted it
}

export interface EvidenceCard {
  id: string;
  title: string;
  text: string;
  claimKind: ClaimKind;
  historicalLabel: HistoricalLabel;
  sources: string[];          // SourceRecord ids; empty for fictional-world cards
  limits: string;             // what this card does NOT show
  /**
   * How this card bears on board claims. Used to DESCRIBE support and limits
   * (spec 2.1 OPEN-002). It is not a right/wrong key.
   */
  bears?: Record<string, 'supports' | 'qualifies' | 'challenges'>;
}

export interface ExhibitRecord {
  id: string;                 // e.g. OBJ-001-A
  name: string;
  art: string;                // key in src/scenes/artKeys.ts
  historicalLabel: HistoricalLabel;
  dateText: string;           // human readable, with qualifiers kept (e.g. "probably")
  dateKind: string;           // what the date describes (Date-Kind Lens result)
  summary: string;
  sources: string[];
  grantsCard: string;
  altText: string;            // accessible description of the picture
}

export interface DialogueOption {
  text: string;
  if?: Condition;
  effects?: Effect[];
  next?: string | null;       // null or missing = end conversation
  /** Optional tag shown to the player, e.g. "Ask for a source". */
  tag?: string;
}

export interface DialogueNode {
  id: string;
  speaker: string;            // character id or "narrator"
  text: string;
  claimKind?: ClaimKind;
  historicalLabel?: HistoricalLabel;
  effects?: Effect[];
  options?: DialogueOption[];
  next?: string | null;
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
  claims: { id: string; text: string; claimKind: ClaimKind; mission: string }[];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export const CAMPAIGN_SCHEMA = 2;
export const PERMANENT_SCHEMA = 1;

/** Everything that rolls back together when a checkpoint loads (spec 24.2). */
export interface CampaignState {
  schema: number;
  contentVersion: number;
  player: { name: string; look: string };
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
  board: Record<string, string[]>;  // claim id -> attached card ids
  objectivesDone: string[];
  companion: string | null;
  rng: { seed: number; state: number };
  playSeconds: number;
}

/** Permanent credit, kept apart from campaign rollback (spec 24.2, 23.3). */
export interface PermanentRecord {
  schema: number;
  credit: Record<string, number>;   // criterion id -> credited amount (<= maximum)
  awards: Record<string, string>;   // award id -> ISO time first earned
}
