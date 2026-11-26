import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const proof = 'item.paper-landing-proof';
const phase = 'paper.landing.phase';

function visible(d: Driver, id: string) {
  const item = MAPS[d.s.mapId].interactables.find((prop) => prop.id === id);
  return item && check(item.visibleIf, d.s) ? item : undefined;
}

function use(d: Driver, id: string, option?: string) {
  const item = visible(d, `paper-${id}`);
  if (item?.kind !== 'scene' || !item.node) throw new Error(`Cannot use ${id} at ${d.s.mapId}`);
  d.walk(item.node, option ? [option] : []);
}

function cross(d: Driver, id: string) {
  const item = visible(d, id);
  if (item?.kind !== 'door' || !item.to || !check(item.openIf, d.s)) throw new Error(`Cannot cross ${id}`);
  d.s.mapId = item.to.map;
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
}

function openPlay(d: Driver) {
  d.s.objectivesDone.push('copies.revise');
  d.s.flags['nile.returned'] = true;
  cross(d, 'sea-door');
  expect(visible(d, 'paper-board')).toBeUndefined();
  d.run({ type: 'ReadSeaChart', chart: 'harbour' });
  cross(d, 'sea-shoal-path');
  d.run({ type: 'ReadSeaChart', chart: 'shoal' });
  cross(d, 'sea-shoal-to-chartroom');
  d.talk('sea-cartographer', 'Pin both sheets at the Lantern House mark');
  const routeBook = visible(d, 'sea-routebook');
  if (!routeBook?.flag) throw new Error('Route book is missing');
  d.run({ type: 'SetFlag', flag: routeBook.flag, value: true });
  cross(d, 'sea-chartroom-return');
  d.talk('sea-harbourkeeper', 'Mark the carriers’ place names');
  d.talk('sea-harbourkeeper', 'Hang the shore plan first');
  const reader = visible(d, 'sea-reader-note');
  if (!reader?.flag) throw new Error('Reader note is missing');
  d.run({ type: 'SetFlag', flag: reader.flag, value: true });
  d.talk('sea-harbourkeeper', 'Mark the rail as the end of the shore walk');
  expect(d.done('sea.finish')).toBe(true);
  use(d, 'board', 'Unfold the play');
}

function act(d: Driver, mode: 'trail' | 'arrival') {
  expect(visible(d, 'paper-press')).toBeUndefined();
  if (mode === 'trail') {
    use(d, 'peg', 'Push the peg in beside the rail');
    expect(d.s.flags[phase]).toBe('near-tagged');
    expect(visible(d, 'paper-peg')).toBeUndefined();
    use(d, 'wheel', 'Turn the wheel while holding');
  } else {
    use(d, 'wheel', 'Turn the wheel and bring');
    expect(d.s.flags[phase]).toBe('far-unmarked');
    expect(visible(d, 'paper-wheel')).toBeUndefined();
    use(d, 'peg', 'Push the peg in under the shelter');
  }
  expect(d.s.flags[phase]).toBe(mode);
  expect(visible(d, 'paper-board')?.artBy?.keys[mode]).toBe(`paper-landing.${mode}`);
  expect(d.s.inventory[proof]).toBeUndefined();
  expect(d.e.visibleOptions('paper.landing.press', d.s)).toHaveLength(2);
}

describe('The Paper Landing', () => {
  it.each(['trail', 'arrival'] as const)('keeps the %s reading and routes a reader to the matching Cold Store rail', (mode) => {
    const d = new Driver();
    openPlay(d);
    const credit = { ...d.p.credit };
    act(d, mode);
    use(d, 'press', mode === 'trail' ? 'Press a two-place proof' : 'Press an arrival proof');
    expect(d.s.inventory[proof]).toBe(1);
    expect(d.s.flags['paper.landing.order']).toBe(mode);
    expect(d.done('paper.landing.proof')).toBe(true);
    expect(visible(d, 'paper-press')).toBeUndefined();
    expect(d.e.node(`paper.landing.kept.${mode}`)).toMatchObject({
      claimKind: 'simulation', historicalLabel: 'fictional-world', text: expect.stringContaining('FICTIONAL PAPER PLAY'),
    });
    use(d, `sea-kept-${mode}`);
    expect(d.s.inventory[proof]).toBe(1);
    cross(d, 'sea-nexus-return');
    cross(d, 'preserved-door');
    expect(visible(d, 'paper-receipt')).toBeUndefined();
    use(d, `cold-open-${mode}`, 'Place the fictional print');
    expect(visible(d, `paper-cold-plan-${mode}`)).toBeUndefined();
    expect(d.e.node('paper.landing.receipt')).toMatchObject({ claimKind: 'observation', historicalLabel: 'fictional-world' });
    use(d, 'receipt', 'Set the actual receipts beside the fiction');
    expect(d.done('paper.landing.compare')).toBe(true);
    use(d, `cold-plan-${mode}`, mode === 'trail' ? 'Fold the dated slips together' : 'Cut a current-room ticket');
    const prop = visible(d, `paper-cold-fit-${mode}`);
    expect([prop?.x, prop?.y]).toEqual(mode === 'trail' ? [6, 13] : [22, 11]);
    expect(visible(d, `paper-cold-fit-${mode === 'trail' ? 'arrival' : 'trail'}`)).toBeUndefined();
    use(d, `cold-fit-${mode}`, mode === 'trail' ? 'Hook the two dated panels' : 'Attach the short ticket');
    expect(d.done('paper.landing.checked')).toBe(false);
    expect(visible(d, `paper-cold-use-${mode}`)?.art).toBe(`paper-landing.ticket-${mode}`);
    use(d, `cold-use-${mode}`, mode === 'trail' ? 'Align her receipt' : 'Slide the request tray');
    expect(d.done('paper.landing.checked')).toBe(true);
    expect(d.done('preserved.publish')).toBe(false);
    expect(d.s.journal).toContain('j.paper.landing.checked');
    expect(d.p.credit).toEqual(credit);
    cross(d, 'preserved-door-nexus');
    cross(d, 'preserved-door');
    expect(visible(d, `paper-cold-checked-${mode}`)?.art).toBe(`paper-landing.checked-${mode}`);
  });

  it('can reset and replay before binding, and the practice receipts stay separate without a print', () => {
    const d = new Driver();
    openPlay(d);
    act(d, 'trail');
    use(d, 'board', 'Lift the peg');
    expect(d.s.flags[phase]).toBe('near');
    act(d, 'arrival');
    cross(d, 'sea-nexus-return');
    cross(d, 'preserved-door');
    expect(visible(d, 'paper-receipt')).toBeUndefined();
    expect(visible(d, 'paper-cold-open-arrival')).toBeUndefined();
    expect(d.done('paper.landing.compare')).toBe(false);
    cross(d, 'preserved-door-nexus');
    cross(d, 'sea-door');
    expect(visible(d, 'paper-press')).toBeDefined();
    use(d, 'press', 'Press an arrival proof');
    expect(d.s.flags['paper.landing.order']).toBe('arrival');
    expect(d.e.visibleOptions('paper.landing.board', d.s).map(({ option }) => option.text)).toEqual(['Step back from the practice rail.']);
  });
});
