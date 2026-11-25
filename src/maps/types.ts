/**
 * Map definitions. A map is plain data: floor, stamps (art + collision),
 * characters, interactable objects, zones and lights. Units are tiles.
 * The WorldScene turns this data into a playable place.
 */
export type InteractKind = 'exhibit' | 'bench' | 'label' | 'waystone' | 'forge' | 'assay' | 'thread' | 'portal' | 'sign' | 'lock' | 'alcove';

export interface Interactable {
  id: string;
  kind: InteractKind;
  x: number; y: number; w: number; h: number;
  label: string;              // shown in the prompt: "E: Inspect <label>"
  exhibit?: string;           // for kind 'exhibit' and 'assay'
  kit?: string;               // for kind 'label': the label kit it repairs
  lock?: string;              // for kind 'lock': the Title Lock (EE practice)
  alcove?: string;            // for kind 'alcove': an Exhibition Hall alcove (SYM-001)
  thread?: string;            // for kind 'thread'
  node?: string;              // for kind 'thread': the node at this spot
  place?: string;             // for kind 'waystone': the place name
  text?: string;              // for kind 'sign'
  flag?: string;              // for kind 'sign': set to true when read
  /** Procedural art key drawn at this spot (see BootScene.makeTextures). */
  art?: string;
  visibleIf?: import('../domain/types').Condition;
}

export interface MapDef {
  id: string;
  name: string;
  world: string;
  width: number; height: number;
  music: string;
  ambience: 'archive' | 'town';
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
