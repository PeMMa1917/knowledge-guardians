/**
 * Map definitions. A map is plain data: floor, stamps (art + collision),
 * characters, interactable objects, zones and lights. Units are tiles.
 * The WorldScene turns this data into a playable place.
 */
export type InteractKind = 'exhibit' | 'bench' | 'label' | 'waystone' | 'forge' | 'assay' | 'thread' | 'portal' | 'sign' | 'lock' | 'alcove' | 'puzzle' | 'loreling' | 'board' | 'quarters' | 'dive' | 'lamps' | 'clue' | 'door' | 'secret' | 'tiles' | 'shop' | 'gather' | 'workbench' | 'reading' | 'rumours' | 'trader' | 'seal' | 'boss' | 'model' | 'scene' | 'forest-watch' | 'metal-trial' | 'copy-compare' | 'sea-chart';

export interface Interactable {
  id: string;
  kind: InteractKind;
  x: number; y: number; w: number; h: number;
  label: string;              // shown in the prompt: "E: Inspect <label>"
  exhibit?: string;           // for kind 'exhibit' and 'assay'
  kit?: string;               // for kind 'label': the label kit it repairs
  lock?: string;              // for kind 'lock': the Title Lock (EE practice)
  puzzle?: string;            // for kind 'puzzle': a word puzzle (Sign-Smith lock, Citation Thread)
  board?: string;             // for kind 'board': a practice clue board (spec 47)
  loreling?: string;          // for kind 'loreling': a Loreling sighting (spec 36.1)
  sighting?: string;
  alcove?: string;            // for kind 'alcove': an Exhibition Hall alcove (SYM-001)
  thread?: string;            // for kind 'thread'
  node?: string;              // node, watch site, sample, edition or chart ID, depending on kind
  place?: string;             // for kind 'waystone': the place name
  text?: string;              // for kind 'sign'
  flag?: string;              // for kind 'sign': set to true when read; for kind 'door': set when used
  /** Procedural art key drawn at this spot (see BootScene.makeTextures). */
  art?: string;
  /** Different art once a condition holds (for example an opened door). */
  artOpen?: { key: string; if: import('../domain/types').Condition };
  /** Picture chosen by a string flag's value (e.g. the restoration method); `art` when unset. */
  artBy?: { flag: string; keys: Record<string, string> };
  visibleIf?: import('../domain/types').Condition;
  /** A paper notice or other prop that does not block walking. */
  walkThrough?: boolean;
  /** For kind 'clue': the clue record (a keepsake can show a new view). */
  clue?: string;
  /** For kind 'secret': the secret record (no art; found by searching). */
  secret?: string;
  /** For kind 'gather': what the player can gather here (ore, clay, reed). */
  resource?: 'ore' | 'clay' | 'reed';
  /** For kind 'reading': the field reading taken here with a made tool (src/domain/readings.ts). */
  reading?: string;
  /** For kind 'seal': the fallacy seal (src/domain/undercroft.ts). It stops blocking once opened. */
  seal?: string;
  /** For kind 'door': where it leads, when it opens (else `text` is shown). */
  to?: { map: string; x: number; y: number };
  openIf?: import('../domain/types').Condition;
}

export interface MapDef {
  id: string;
  name: string;
  world: string;
  width: number; height: number;
  music: string;
  ambience: 'archive' | 'town' | 'study';
  background: number;
  floor: (x: number, y: number) => string | null;
  stamps: { stamp: string; x: number; y: number; anim?: string[] }[];
  blocks: [number, number, number, number][];
  npcs: { id: string; x: number; y: number; facing: 'down' | 'up' | 'left' | 'right'; visibleIf?: import('../domain/types').Condition }[];
  interactables: Interactable[];
  zones: { id: string; x: number; y: number; w: number; h: number; to?: { map: string; x: number; y: number }; if?: import('../domain/types').Condition }[];
  lights: { x: number; y: number; r: number; color: number; flicker?: boolean }[];
  spawn: { x: number; y: number };
}
