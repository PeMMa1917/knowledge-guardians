import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { CORRESPONDENCE_ROOM } from '../src/maps/correspondenceRoom';
import { STAGE_FOYER } from '../src/maps/stage';
import { Driver } from './driver';

const pack = buildPack();

describe('What the Gold Says', () => {
  it('uses one already placed museum accession and links each interpretive context to it', () => {
    const catalogue = pack.exhibits.filter(({ specimen }) => specimen?.key === 'cma:1979.23');
    expect(catalogue.map(({ id }) => id)).toEqual(['OBJ-CORRESPONDENCE-KALPA-TWO-SIDES']);
    const visibleFrames = pack.cards.filter(({ id }) => id.startsWith('card.leaf-frame.'));
    expect(visibleFrames).toHaveLength(2);
    expect(visibleFrames.every(({ claimKind, historicalLabel }) => claimKind === 'interpretation' && historicalLabel === 'scholarly-interpretation')).toBe(true);
    const source = pack.sources.find(({ id }) => id === visibleFrames[0].sources[0]);
    expect(source?.url).toBe('https://clevelandart.org/art/1979.23');
    expect(visibleFrames[1].sources).toEqual(visibleFrames[0].sources);
  });

  it.each([
    ['page', 'Face the adornment', 'Turn the sleeve', 'without waiting', 5],
    ['patrons', 'Face the commission', 'Open both tabs', 'commissioner unnamed', 25],
  ] as const)('fits the %s sleeve at its own public receiving point', (front, dispatch, placement, result, x) => {
    const d = new Driver();
    const firstRoom = CORRESPONDENCE_ROOM.interactables.filter(({ id }) => id.startsWith('leaf-frame-'));
    const foyer = STAGE_FOYER.interactables.filter(({ id }) => id.startsWith('leaf-frame-'));
    const visible = (props: typeof firstRoom) => props.filter(({ visibleIf }) => check(visibleIf, d.s));
    expect(visible(firstRoom)).toEqual([]);
    expect(visible(foyer)).toEqual([]);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-CORRESPONDENCE-KALPA-TWO-SIDES' });
    expect(d.s.flags['perspective.active']).toBeUndefined();
    expect(visible(firstRoom).map(({ id }) => id)).toEqual(['leaf-frame-object', 'leaf-frame-account']);
    d.walk('leaf-frame.object', ['Turn the ornament']);
    expect(d.done('leaf-frame.compared')).toBe(false);
    d.walk('leaf-frame.account', ['Lift the workshop']);
    expect(d.done('leaf-frame.compared')).toBe(true);
    expect(visible(firstRoom).map(({ id }) => id)).toContain('leaf-frame-layout');
    d.walk('leaf-frame.layout', [dispatch]);
    expect(d.s.flags['leaf-frame.front']).toBe(front);
    expect(d.s.inventory['item.leaf-frame.sleeve']).toBe(1);
    expect(visible(foyer).map(({ id }) => id)).toEqual([`leaf-frame-place-${front}`]);
    d.walk(`leaf-frame.receive-${front}`, [placement]);
    expect(d.done('leaf-frame.received')).toBe(false);
    const reception = visible(foyer);
    expect(reception.map(({ id }) => id)).toEqual([`leaf-frame-read-${front}`]);
    expect(reception[0]).toMatchObject({ x, y: 11, kind: 'sign' });
    expect(reception[0].text).toContain(result);
    d.run({ type: 'SetFlag', flag: reception[0].flag!, value: true });
    expect(d.done('leaf-frame.received')).toBe(true);
    expect(d.s.journal).toContain('j.leaf-frame.public');
    expect(d.p.credit).toEqual({});
  });
});
