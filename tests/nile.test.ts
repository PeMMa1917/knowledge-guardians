import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { MAPS } from '../src/maps';
import { validateContent } from '../src/domain/validate';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { runNileTrial } from '../src/domain/nileModel';
import { Driver } from './driver';

const pack = buildPack();
function start() {
  const d = new Driver();
  d.s.objectivesDone.push('m02.o8.ise');
  d.s.inventory['tool.date-lens'] = 1;
  d.s.inventory['tool.provenance-thread'] = 1;
  d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
  d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
  d.s.mapId = 'nile.hall';
  return d;
}
function dipl(d: Driver, choice = 'poem') {
  d.s.mapId = 'nile.royal';
  for (const exhibit of ['OBJ-NILE-SALLIER', 'OBJ-NILE-TREATY']) {
    d.run({ type: 'InspectExhibit', exhibit });
    d.run({ type: 'UseLens', exhibit });
  }
  d.run({ type: 'BuildLabel', kit: 'nile-qadesh', subject: choice, criterion: choice === 'poem' ? 'account' : 'terms', limit: 'qualified' });
  expect(d.done('nile.diplomacy')).toBe(true);
}
function workers(d: Driver, first = 'workers stopping') {
  d.s.mapId = 'nile.workyard';
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
  for (const node of ['delay', 'payment', 'return']) d.run({ type: 'FollowThread', thread: 'nile-strike', node });
  d.talk('nile-leila', first);
  expect(d.done('nile.workers')).toBe(true);
}
function route(d: Driver, choice: 'cast' | 'copy' = 'cast') {
  d.s.mapId = 'nile.route';
  d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
  d.run({ type: 'NileRouteTrial', road: 'ridge' });
  d.run({ type: 'NileRouteTrial', road: 'wash' });
  d.run({ type: 'NileDelivery', choice });
  expect(d.done('nile.routes')).toBe(true);
}

describe('Chapter 2: the door without a name', () => {
  it('preserves the old campaign and does not offer Chapter 2 as an opening quest', () => {
    const d = new Driver();
    expect(d.e.activeMissions(d.s).some((m) => m.id.startsWith('KG-CH2'))).toBe(false);
    d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
    expect(d.e.activeMissions(d.s).some((m) => m.id.startsWith('KG-CH2'))).toBe(false);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('ise.look');
  });
  it('has grounded cards, valid content, reachable leads and a return from every new room', () => {
    expect(validateContent(pack)).toEqual([]);
    expect(pack.exhibits.filter((e) => e.id.startsWith('OBJ-NILE')).length).toBe(6);
    for (const map of Object.values(MAPS).filter((m) => m.id.startsWith('nile.'))) {
      expect(map.floor(map.spawn.x, map.spawn.y)).toBeTruthy();
      expect(map.interactables.some((x) => x.to?.map === 'nile.hall' || x.to?.map === 'nexus.archive')).toBe(true);
    }
  });
  it('will not let two repeats of one road replace a controlled comparison', () => {
    const d = start();
    expect(() => d.run({ type: 'NileRouteTrial', road: 'ridge' })).toThrow(/Mine Map/);
    d.s.mapId = 'nile.route';
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    expect(() => d.run({ type: 'NileDelivery', choice: 'copy' })).toThrow(/both roads/);
    d.run({ type: 'NileRouteTrial', road: 'ridge' });
    d.run({ type: 'NileRouteTrial', road: 'ridge' });
    expect(d.s.cards).not.toContain('card.nile.model');
    d.run({ type: 'NileRouteTrial', road: 'wash' });
    expect(d.s.cards).toContain('card.nile.model');
    expect(runNileTrial('ridge').upright).toBe(false);
    expect(runNileTrial('wash').upright).toBe(true);
    d.run({ type: 'NileDelivery', choice: 'cast' });
    expect(() => d.run({ type: 'NileDelivery', choice: 'copy' })).toThrow(/already/);
  });
  it('will not turn later peace into historical proof of victory', () => {
    const d = start();
    d.s.mapId = 'nile.royal';
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-TREATY' });
    d.run({ type: 'BuildLabel', kit: 'nile-qadesh', subject: 'treaty', criterion: 'proved', limit: 'qualified' });
    expect(d.s.flags['label.nile-qadesh.holds']).toBe(false);
    expect(d.done('nile.diplomacy')).toBe(false);
  });
  it.each([
    ['print', 'public case', 'Clip the correction', 'dipl-workers'],
    ['read', 'reading table', 'Lay both slips', 'workers-route'],
    ['pair', 'workshop table', 'Leave the ancient route', 'dipl-route'],
  ] as const)('two leads can publish the %s ending with equal permanent credit', (id, packet, action, pair) => {
    const d = start();
    const nileXP = () => Object.entries(d.p.credit).filter(([id]) => id.startsWith('credit.nile.')).reduce((n, [, xp]) => n + xp, 0);
    if (pair.includes('dipl')) dipl(d, id === 'pair' ? 'treaty' : 'poem');
    if (pair.includes('workers')) workers(d, id === 'read' ? 'Lead with the payment' : 'workers stopping');
    if (pair.includes('route')) route(d, id === 'pair' ? 'copy' : 'cast');
    d.s.mapId = 'nile.hall';
    expect(d.done('nile.two')).toBe(true);
    d.talk('nile-iman', packet);
    expect(d.s.flags['nile.dispatch']).toBe(id);
    expect(d.e.talkEntry('nile-iman', d.s)).toBe('nile.dispatch-return');
    d.s.mapId = 'nexus.archive';
    d.talk('warden-ise', action, 'come back');
    expect(d.done('nile.return')).toBe(true);
    expect(nileXP()).toBe(32);
    expect(d.e.talkEntry('warden-ise', d.s)).toBe('nile.nexus-resolved');
    const replayXP = totalXP(d.p);
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    expect(totalXP(d.p)).toBe(replayXP);
    const displays = MAPS['nexus.archive'].interactables.filter((i) => i.id.startsWith('nile-outcome-'));
    expect(displays.filter((i) => check(i.visibleIf, d.s)).map((x) => x.id)).toEqual(['nile-outcome-' + id]);
    expect(d.e.activeMissions(d.s).some((m) => m.id === 'KG-CH2-R04')).toBe(true);
  });
  it.each([['fragment', 'record'], ['story', 'tradition']])('the Singapore transfer can foreground %s without claiming identity', (subject, criterion) => {
    const d = start();
    d.s.mapId = 'nexus.archive';
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STONE' });
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-BADANG' });
    d.run({ type: 'BuildLabel', kit: 'nile-stone', subject, criterion, limit: 'bound' });
    expect(d.done('nile.stone.publish')).toBe(true);
    expect(d.s.flags['label.nile-stone.holds']).toBe(true);
  });
  it.each([['square', 'Hang a dated correction'], ['talk', 'carried the old story']])('brings a correction back to Emberford by the %s route', (id, pick) => {
    const d = start();
    d.s.mapId = 'aethelgard.emberford';
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    d.talk('keeper-oduya', 'carry corrections', pick);
    expect(d.done('nile.ember.return')).toBe(true);
    expect(d.p.credit['credit.nile.ember']).toBe(6);
    const props = MAPS[d.s.mapId].interactables.filter((i) => i.id.startsWith('nile-correction-'));
    expect(props.filter((i) => check(i.visibleIf, d.s)).map((i) => i.id)).toEqual(['nile-correction-' + id]);
  });
  it('uses a Chapter 1 keepsake to recover an extra trail clue', () => {
    const d = start();
    d.run({ type: 'SetFlag', flag: 'seal.found', value: true });
    d.run({ type: 'ReadClue', clue: 'nile-blank-tag' });
    d.run({ type: 'UseKeepsake', clue: 'nile-blank-tag', keepsake: 'seal' });
    expect(d.s.flags['nile.sealMatched']).toBe(true);
    expect(d.s.flags['study.views']).toBeUndefined();
  });

});
