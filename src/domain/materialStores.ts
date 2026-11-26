export const STORE_SIDES = [0, 1] as const;
export type StoreSide = typeof STORE_SIDES[number];

export const STORE_FAMILIES = ['fibres', 'forms', 'travel', 'surfaces'] as const;
export type StoreFamily = typeof STORE_FAMILIES[number];

export type MaterialFixture =
  | { kind: 'fibres'; span: number; stretch: [number, number]; load: number }
  | { kind: 'forms'; edge: [number, number]; centre: [number, number]; incline: number }
  | { kind: 'travel'; legs: [number[], number[]] }
  | { kind: 'surfaces'; angle: [number, number]; patch: [number, number] };

export function targetSetting(fixture: MaterialFixture, side: StoreSide): number {
  switch (fixture.kind) {
    case 'fibres': return fixture.load;
    case 'forms': return fixture.incline;
    case 'travel': return fixture.legs[side].length - 1;
    case 'surfaces': return fixture.angle[side];
  }
}

export function checkTension(fixture: Extract<MaterialFixture, { kind: 'fibres' }>, side: StoreSide, load: number) {
  return Math.round((fixture.span + fixture.stretch[side] * load) * 10) / 10;
}

export function checkTilt(fixture: Extract<MaterialFixture, { kind: 'forms' }>, side: StoreSide, tilt: number): number {
  return fixture.edge[side] - fixture.centre[side] - tilt;
}

export function checkRoute(fixture: Extract<MaterialFixture, { kind: 'travel' }>, side: StoreSide, stop: number): number {
  return fixture.legs[side].slice(0, stop + 1).reduce((total, leg) => total + leg, 0);
}

export function litFeature(fixture: Extract<MaterialFixture, { kind: 'surfaces' }>, side: StoreSide, tilt: number): number {
  return Math.max(0, fixture.patch[side] - Math.abs(fixture.angle[side] - tilt));
}
