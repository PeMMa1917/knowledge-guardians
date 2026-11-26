import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { microSkillId } from '../src/content/microSkillEvidence';
import { CLEAR_BAY_TRIALS, clearanceReading } from '../src/domain/clearBay';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const skill = microSkillId(78);

function prop(d: Driver, key: string) {
  return MAPS['preserved.archive'].interactables.find(({ id, visibleIf }) =>
    id === 'clear-bay-' + key && check(visibleIf, d.s));
}

function choose(d: Driver, step: string, index: number) {
  d.run({ type: 'ChooseDialogueOption', node: 'clearbay.' + step, index });
}

function choices(d: Driver, step: string) {
  return d.e.visibleOptions('clearbay.' + step, d.s).map(({ index }) => index);
}

function arrive(d: Driver) {
  d.s.mapId = 'preserved.archive';
  d.run({ type: 'SetFlag', flag: 'preserved.arrived', value: true });
}

describe('The First Bell at the Cold Store', () => {
  it('leaves the Cold Store spawn and every existing arrival clear of the optional props', () => {
    const room = MAPS['preserved.archive'];
    const landings = Object.values(MAPS).flatMap(({ interactables }) => interactables.flatMap(({ to }) =>
      to?.map === room.id ? [to] : []));
    const props = room.interactables.filter(({ id }) => id.startsWith('clear-bay-'));
    for (const { x, y } of [room.spawn, ...landings]) {
      // A prop can also be clicked in the tile immediately above its footprint.
      expect(props.filter((prop) => x >= prop.x && x < prop.x + prop.w && y >= prop.y - 1 && y < prop.y + prop.h)).toEqual([]);
    }
  });

  it('holds the outer cart the same and tests who can use the two measured openings', () => {
    const [bare, west, north, parcel] = CLEAR_BAY_TRIALS;
    expect(bare.load).toBe(west.load);
    expect(west.load).toBe(north.load);
    expect(west.handler).toBe(north.handler);
    expect(parcel.gate).toBe(west.gate);
    expect(CLEAR_BAY_TRIALS.map(clearanceReading)).toEqual([
      { width: 3, needed: 3, fits: true }, { width: 3, needed: 4, fits: false },
      { width: 4, needed: 4, fits: true }, { width: 3, needed: 3, fits: true },
    ]);
  });

  it.each(['north', 'west'] as const)('awards 78 only for the full comparison and observed %s handover', (route) => {
    const d = new Driver();
    expect(prop(d, 'board')).toBeUndefined();
    expect(choices(d, 'trials')).toHaveLength(0);
    arrive(d);
    expect(prop(d, 'board')).toBeDefined();

    choose(d, 'trials', 0);
    choose(d, 'trials', 1);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(d.s.flags['clearbay.preview']).toBe('west');
    expect(choices(d, 'trials')).toEqual([2, 3]);
    expect(choices(d, 'prepare')).toHaveLength(0);
    choose(d, 'trials', 2);
    choose(d, 'trials', 3);
    expect(choices(d, 'prepare')).toHaveLength(0);
    d.walk(prop(d, 'duty')!.node!, ['Lift a copy']);
    expect(choices(d, 'prepare')).toHaveLength(0);
    d.walk(prop(d, 'visitor')!.node!, ['Clip a copy']);
    expect(choices(d, 'prepare')).toEqual([0]);
    choose(d, 'prepare', 0);
    expect(choices(d, 'prepare')).toEqual([1, 2]);
    choose(d, 'prepare', 1);
    expect(choices(d, 'publish')).toHaveLength(0);
    expect(d.p.skills[skill]).toBeUndefined();
    choose(d, 'prepare', 2);
    expect(d.done('clearbay.compare')).toBe(true);
    expect(d.p.skills[skill]).toBeUndefined();
    expect(choices(d, 'publish')).toEqual([0, 1]);
    choose(d, 'publish', route === 'north' ? 0 : 1);
    expect(d.p.skills[skill]).toBeUndefined();
    expect(prop(d, 'reader-' + (route === 'north' ? 'west' : 'north'))).toBeUndefined();
    const response = prop(d, 'reader-' + route)!;
    d.walk(response.node!, [route === 'north' ? 'Hold the measured line' : 'Pass Tarin’s parcel']);
    expect(d.done('clearbay.use')).toBe(true);
    expect(d.s.flags['clearbay.checked']).toBe(route);
    expect(d.p.skills[skill]).toEqual(['WORLD-04|game-223|clearbay.use|HIS,MAT']);
    expect(prop(d, 'reader-' + route)).toBeUndefined();
    expect(prop(d, 'marked-' + route)).toMatchObject({ x: response.x, y: response.y });
    expect(choices(d, 'publish')).toHaveLength(0);
  });

  it('maps mathematics and history across the four parallel parts with four clues for each step', () => {
    const pack = buildPack();
    const mission = pack.missions.find(({ id }) => id === 'KG-CH3-CLEAR-BAY')!;
    for (const objective of mission.objectives) {
      expect(objective.weave?.aoks).toEqual(['MAT', 'HIS']);
      expect(objective.weave?.framework).toEqual(['scope', 'perspectives', 'methods-and-tools', 'ethics']);
      expect(pack.hints.filter((hint) => hint.objective === objective.id).map(({ depth }) => depth)).toEqual([1, 2, 3, 4]);
    }
    expect(mission.objectives.filter(({ skills }) => skills?.includes(skill)).map(({ id }) => id)).toEqual(['clearbay.use']);
  });
});
