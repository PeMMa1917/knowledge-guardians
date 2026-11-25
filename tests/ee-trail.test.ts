import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { buildPack } from '../src/content';
import { totalXP } from '../src/domain/permanent';
import { tryLock } from '../src/domain/lock';

const pack = buildPack();
const lock = pack.locks.find((l) => l.id === 'inventor')!;

/** A recruit who has finished the Nexus label (the trail opens after it). */
function ready(): Driver {
  const d = new Driver();
  for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit: id });
  d.talk('clerk-venn', 'What about');
  d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'patent', limit: 'none' });
  d.s = { ...d.s, objectivesDone: [...d.s.objectivesDone, 'm01.o6.label'], inventory: { ...d.s.inventory, 'tool.date-lens': 1 } };
  return d;
}

function playTrail(d: Driver, q: Record<string, string>, claim: { subject: string; criterion: string; limit: string }, reflect: string) {
  d.talk('archivist-tull', 'Show me the lock');
  d.run({ type: 'TurnLock', lock: 'inventor', choice: q });
  expect(d.done('ee1.o1.lock')).toBe(true);
  d.talk('archivist-tull', 'Patent records');
  d.talk('archivist-tull', 'Museum object');
  d.talk('archivist-tull', 'Company and licence');
  d.talk('archivist-tull', 'That is my plan');
  expect(d.done('ee1.o2.plan')).toBe(true);
  for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'UseLens', exhibit: id });
  expect(d.done('ee1.o3.weigh')).toBe(true);
  d.run({ type: 'BuildLabel', kit: 'ee.inventor', ...claim });
  expect(d.done('ee1.o4.argue')).toBe(true);
  d.talk('archivist-tull', 'US Patent', 'German patent office');
  expect(d.done('ee1.o5.cite')).toBe(true);
  d.talk('archivist-tull', 'word for word', 'Memoirs', 'no citation', 'That is all three');
  expect(d.done('ee1.o6.integrity')).toBe(true);
  d.talk('archivist-tull', reflect);
  expect(d.done('ee1.o7.reflect')).toBe(true);
}

describe('EE practice trail (spec 92.2)', () => {
  it('Tull waits until the label is repaired', () => {
    const d = new Driver();
    expect(d.e.talkEntry('archivist-tull', d.s)).toBe('tull.busy');
  });
  it('several different questions open the lock (OPEN-001)', () => {
    const open = new Set<string>();
    for (const frame of ['extent', 'howfar']) for (const driver of ['patents', 'records']) for (const c of ['credit', 'paid']) {
      const r = tryLock(lock, { frame, driver, case: c });
      expect(r.opened).toBe(true);
      open.add(r.question);
    }
    expect(open.size).toBe(8);
    expect([...open][0]).toMatch(/^To what extent did patents decide who was credited/);
  });
  it('a closed lock says why, ring by ring, and never says "wrong"', () => {
    const r = tryLock(lock, { frame: 'why', driver: 'technology', case: 'all' });
    expect(r.opened).toBe(false);
    expect(r.lines.length).toBe(3);
    for (const l of r.lines) expect(l).not.toMatch(/wrong|incorrect/i);
  });
  it('the full trail completes, gives the award, and adds a private portfolio entry', () => {
    const d = ready();
    playTrail(d, { frame: 'extent', driver: 'patents', case: 'credit' }, { subject: 'patents', criterion: 'factor', limit: 'counter' }, 'smaller');
    expect(d.p.awards['skill.ee-practice-1']).toBeTruthy();
    const pf = d.p.portfolio.find((e) => e.title === "EE practice: The Inventor's Share")!;
    expect(pf.shared).toBe(false);
    expect(d.p.moments['PM-15']).toBeTruthy();
  });
  it('every question, claim and reflection gives the same XP', () => {
    const routes: [Record<string, string>, { subject: string; criterion: string; limit: string }, string][] = [
      [{ frame: 'extent', driver: 'patents', case: 'credit' }, { subject: 'patents', criterion: 'factor', limit: 'counter' }, 'smaller'],
      [{ frame: 'howfar', driver: 'records', case: 'paid' }, { subject: 'records', criterion: 'less', limit: 'dates' }, 'not sure'],
      [{ frame: 'extent', driver: 'records', case: 'credit' }, { subject: 'patents', criterion: 'less', limit: 'counter' }, 'counterclaim'],
    ];
    const xp = routes.map(([q, c, r]) => { const d = ready(); const before = totalXP(d.p); playTrail(d, q, c, r); expect(d.p.credit['crit.justification.ee-practice']).toBe(15); return totalXP(d.p) - before; });
    expect(new Set(xp).size).toBe(1);
  });
  it('"Patents decided who was credited" does not hold and signals MIS-34', () => {
    const d = ready();
    const o = d.run({ type: 'BuildLabel', kit: 'ee.inventor', subject: 'patents', criterion: 'decided', limit: 'counter' });
    expect((o.events.find((e) => e.kind === 'label') as any).result.holds).toBe(false);
    expect(d.p.signals['MIS-34']?.length).toBe(1);
  });
  it('collecting many web pages signals MIS-05 and does not count towards the plan', () => {
    const d = ready();
    d.run({ type: 'SetFlag', flag: 'lock.inventor.open', value: true });
    d.s = { ...d.s, objectivesDone: [...d.s.objectivesDone, 'ee1.o1.lock'] };
    d.run({ type: 'EnterNode', node: 'tull.plan' });
    const o = d.e.visibleOptions('tull.plan', d.s).find((x) => x.option.text.includes('web pages'))!;
    d.run({ type: 'ChooseDialogueOption', node: 'tull.plan', index: o.index });
    expect(d.p.signals['MIS-05']?.length).toBe(1);
    expect(d.s.flags['count.ee1.plan']).toBeUndefined();
  });
  it('EE-002: the game never asks for the student\'s own question', () => {
    const text = JSON.stringify(pack.dialogue.filter((n) => n.id.startsWith('tull.')));
    expect(text).not.toMatch(/your own (research )?question|type your question/i);
  });
});
