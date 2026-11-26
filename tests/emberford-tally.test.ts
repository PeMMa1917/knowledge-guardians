import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { EMBERFORD } from '../src/maps/emberford';
import { Driver } from './driver';

const tally = 'emberford.tally';
const result = `${tally}.o.readback`;

function arrive() {
  const d = new Driver();
  d.s.mapId = EMBERFORD.id;
  return d;
}

function prop(id: string) {
  const match = EMBERFORD.interactables.find((row) => row.id === id);
  if (!match) throw new Error(`Missing Emberford prop ${id}`);
  return match;
}

function visible(d: Driver, id: string) {
  return check(prop(id).visibleIf, d.s);
}

function use(d: Driver, id: string, ...choices: string[]) {
  const target = prop(id);
  expect(visible(d, id)).toBe(true);
  if (!target.node) throw new Error(`Missing scene for ${id}`);
  d.walk(target.node, choices);
}

function read(d: Driver, id: string) {
  const target = prop(id);
  expect(visible(d, id)).toBe(true);
  if (!target.text) throw new Error(`Missing text for ${id}`);
  d.run({ type: 'ReadWorldSign', id, title: target.label, text: target.text, readFlag: target.flag });
}

function reload(d: Driver) {
  d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
}

describe('Two Sixes', () => {
  it.each([
    { heading: 'loaves', lead: 'loaf counts', active: 'tally-bake-plan', other: 'tally-load-slip', receipt: 'Small tray for six stalls' },
    { heading: 'weight', lead: 'scale weights', active: 'tally-load-slip', other: 'tally-bake-plan', receipt: 'Tie the three large loaves' },
  ])('records the result only after reading the $heading recipient’s own slip', ({ heading, lead, active, other, receipt }) => {
    const d = arrive();
    const credit = { ...d.p.credit };
    use(d, tally, 'Leave it for now');
    expect(d.s.flags[tally]).toBeUndefined();
    expect(visible(d, 'tally-ferry-read')).toBe(false);
    use(d, tally, `Lead with ${lead}`);
    expect(d.s.flags[tally]).toBe(heading);
    expect(visible(d, active)).toBe(false);
    expect(visible(d, other)).toBe(false);
    expect(d.done(result)).toBe(false);

    if (heading === 'loaves') {
      use(d, 'tally-ferry-read', 'Leave it for now');
      d.talk('baker-della', 'Leave it for now');
      expect(visible(d, active)).toBe(false);
      d.talk('baker-della', 'Hold the tally while');
    } else {
      expect(d.e.talkEntry('baker-della', d.s)).toBe('emberford.tally.bake.weight');
      d.talk('baker-della');
      use(d, 'tally-ferry-read', 'Leave it for now');
      expect(visible(d, active)).toBe(false);
      use(d, 'tally-ferry-read', 'Hold the cloth while');
    }
    expect(prop(active).text).toContain(receipt);
    expect(visible(d, other)).toBe(false);
    expect(d.done(result)).toBe(false);
    reload(d);
    read(d, active);
    expect(d.done(result)).toBe(true);
    expect(d.s.adventureDiary?.entries.some(({ text }) => text.includes(receipt))).toBe(true);
    expect(d.e.pack.missions.flatMap(({ objectives }) => objectives).find(({ id }) => id === result)?.weave?.aoks).toContain('LAN');
    reload(d);
    expect(visible(d, active)).toBe(true);
    expect(d.done(result)).toBe(true);
    expect(d.p.credit).toEqual(credit);
  });

  it('can turn both copies after an observed result and leave the new slip for another visit', () => {
    const d = arrive();
    use(d, tally, 'Lead with loaf counts');
    d.talk('baker-della', 'Hold the tally while');
    read(d, 'tally-bake-plan');
    use(d, `${tally}.loaves`, 'Turn both copies');
    expect(d.s.flags[tally]).toBe('weight');
    expect(visible(d, 'tally-bake-plan')).toBe(false);
    expect(visible(d, 'tally-load-slip')).toBe(false);
    use(d, 'tally-ferry-read', 'Leave it for now');
    reload(d);
    use(d, 'tally-ferry-read', 'Hold the cloth while');
    read(d, 'tally-load-slip');
    expect(d.s.adventureDiary?.entries.some(({ text }) => text.includes('Small tray for six stalls'))).toBe(true);
    expect(d.s.adventureDiary?.entries.some(({ text }) => text.includes('Tie the three large loaves'))).toBe(true);
    expect(d.events.filter((event) => event.kind === 'objective' && event.id === result)).toHaveLength(1);
  });

  it.each(['loaves', 'weight', 'old-unknown'])('keeps a saved %s heading actionable without awarding an earlier result', (heading) => {
    const d = arrive();
    d.s.flags[tally] = heading;
    reload(d);
    expect(d.done(result)).toBe(false);
    if (heading === 'old-unknown') {
      use(d, tally, 'Lead with loaf counts');
      expect(d.s.flags[tally]).toBe('loaves');
    } else {
      expect(visible(d, tally)).toBe(false);
      expect(visible(d, `${tally}.${heading}`)).toBe(true);
      expect(visible(d, 'tally-ferry-read')).toBe(true);
    }
    expect(visible(d, 'tally-bake-plan')).toBe(false);
    expect(visible(d, 'tally-load-slip')).toBe(false);
  });
});
