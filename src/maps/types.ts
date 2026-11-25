/**
 * Map definitions. A map is plain data: floor, stamps (art + collision),
 * characters, interactable objects, zones and lights. Units are tiles.
 * The WorldScene turns this data into a playable place.
 */
export type InteractKind = 'exhibit' | 'bench' | 'board' | 'sort' | 'portal' | 'sign';

export interface Interactable {
  id: string;
  kind: InteractKind;
  x: number; y: number; w: number; h: number;
  label: string;              // shown in the prompt: "E: Inspect <label>"
  exhibit?: string;           // for kind 'exhibit'
  text?: string;              // for kind 'sign'
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
