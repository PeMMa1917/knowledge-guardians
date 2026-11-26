import { describe, expect, it } from 'vitest';
import { vignettesFor } from '../src/domain/epilogue';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const hall = 'council.hall';
const gallery = 'council.gallery';
const brief = 'council.team.brief';

function prop(d: Driver, id: string) {
  const entry = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!entry || !check(entry.visibleIf, d.s)) throw new Error(`Cannot use ${id} here`);
  return entry;
}

function visit(d: Driver, id: string) {
  const to = prop(d, id).to;
  if (!to) throw new Error(`${id} is not a passage`);
  d.s.mapId = to.map;
}

function read(d: Driver, id: string) {
  const sign = prop(d, id);
  if (sign.flag) d.run({ type: 'SetFlag', flag: sign.flag, value: true });
  return sign.text;
}

function scene(d: Driver, id: string, ...text: string[]) {
  const entry = prop(d, `council-team-${id}`);
  if (!entry.node) throw new Error(`${entry.id} is not a scene`);
  d.walk(entry.node, text);
}

function start() {
  const d = new Driver();
  d.s.mapId = hall;
  d.s.objectivesDone.push('council.arrival');
  d.s.flags['council.response'] = 'record';
  d.s.flags['council.revision'] = 'mark';
  d.s.flags['harrowmere.found'] = true;
  return d;
}

const earlier = [
  ['copies', 'copies.margin.sent', 'fold', 'council-folded-ramp-proof', 'Bring Lark’s full order'],
  ['copies', 'copies.margin.sent', 'pair', 'council-paired-ramp-proof', 'Bring Lark’s clipped strips'],
  ['copies', 'copies.margin.sent', 'wait', 'council-held-ramp-proof', 'Bring Lark’s caller sheet'],
  ['repair', 'repair.queue.receipt', 'paired', 'council-repair-tokens', 'Bring Emberford’s paired stubs'],
  ['repair', 'repair.queue.receipt', 'relay', 'council-repair-relay', 'Bring Hana’s relay ticket'],
  ['repair', 'repair.queue.receipt', 'leave', 'council-repair-rota', 'Bring Emberford’s appointment rota'],
] as const;

const clipChoices = {
  copies: 'Fold the bell line',
  repair: 'Match the two notches',
  fresh: 'Clip a new strip',
};

describe('The Handover Before the Bell', () => {
  it.each(earlier)('offers the %s proof from the actual %s=%s outcome after the player reads it', (workflow, flag, value, object, select) => {
    const d = start();
    d.run({ type: 'SetFlag', flag, value });
    const choices = () => d.e.visibleOptions(brief, d.s).map(({ option }) => option.text);
    expect(choices()).toEqual(['Start a new packet with the blank slips.', 'Leave the bench ready for later.']);
    visit(d, 'council-gallery-path');
    expect(read(d, object)).toBeTruthy();
    visit(d, 'council-gallery-return');
    expect(choices().filter((line) => line.startsWith('Bring'))).toEqual([expect.stringContaining(select)]);
    scene(d, 'brief', select);
    expect(d.s.flags['council.team.workflow']).toBe(workflow);
    expect(choices().filter((line) => line.startsWith('Bring'))).toEqual([]);
    visit(d, 'council-gallery-path');
    expect(prop(d, object).kind).toBe('sign');
  });

  const paths = (['fresh', 'copies', 'repair'] as const).flatMap((workflow) =>
    (['table', 'relay'] as const).map((edition) => ({ workflow, edition })));

  it.each(paths)('finishes the $workflow rehearsal with a $edition that remembers the real handover', ({ workflow, edition }) => {
    const d = start();
    const credit = { ...d.p.credit };
    expect(d.e.talkEntry('vesper-quill', d.s)).toBe('vesper.meet');
    if (workflow === 'fresh') {
      scene(d, 'brief', 'Start a new packet');
    } else {
      const [, flag, value, object, select] = earlier.find(([family]) => family === workflow)!;
      d.run({ type: 'SetFlag', flag, value });
      visit(d, 'council-gallery-path');
      read(d, object);
      visit(d, 'council-gallery-return');
      scene(d, 'brief', select);
    }

    expect(() => prop(d, 'council-team-receive')).toThrow();
    expect(d.e.visibleOptions('council.team.clip', d.s).map(({ option }) => option.text))
      .toEqual([expect.stringContaining(clipChoices[workflow]), 'Set the clip down.']);
    scene(d, 'clip', clipChoices[workflow]);
    visit(d, 'council-gallery-path');
    scene(d, 'call', 'Give Sefa the opening call');
    expect(() => prop(d, 'council-team-check')).toThrow();
    visit(d, 'council-gallery-return');
    scene(d, 'receive', 'Have Kip echo');

    visit(d, 'council-gallery-path');
    expect(d.e.visibleOptions('council.team.check', d.s).some(({ option }) => option.next === 'council.team.checked')).toBe(false);
    expect(d.e.node('council.team.check').text).toContain('scribbled NOW');
    expect(() => prop(d, 'council-team-set')).toThrow();
    visit(d, 'council-gallery-return');
    expect(read(d, 'council-team-original')).toContain('signed before the trial call');
    visit(d, 'council-gallery-path');
    scene(d, 'check', 'Slide Hale’s signed docket');
    expect(d.done('council.team.trial')).toBe(true);
    expect(d.e.node('council.team.checked').text).toContain('Turn the NOW strip under it');
    expect(check(prop(d, 'council-team-check').artOpen?.if, d.s)).toBe(true);

    scene(d, 'set', edition === 'table' ? 'Set the checked pair' : 'Give the runner');
    expect(d.done('council.team.post')).toBe(false);
    expect(MAPS[gallery].interactables.filter((item) => item.id.startsWith('council-team-workflow-') && check(item.visibleIf, d.s))
      .map(({ id }) => id)).toEqual([`council-team-workflow-${workflow}`]);
    if (edition === 'table') {
      expect(() => prop(d, 'council-team-relay-call')).toThrow();
      expect(read(d, 'council-team-table')).toContain('signed practice heading');
    } else {
      expect(() => prop(d, 'council-team-table')).toThrow();
      expect(read(d, 'council-team-relay-call')).toContain('Kip’s bench');
      expect(d.done('council.team.post')).toBe(false);
      visit(d, 'council-gallery-return');
      expect(read(d, 'council-team-relay-bench')).toContain('a hand short at the copying desk');
    }
    expect(d.done('council.team.post')).toBe(true);
    expect(d.s.journal).toContain('j.council.team');
    expect(vignettesFor(d.s).filter(({ who }) => who === 'The Council crew')).toHaveLength(1);
    expect(d.s.flags['council.response']).toBe('record');
    expect(d.s.flags['council.revision']).toBe('mark');
    expect(d.s.flags['ending.council']).toBeUndefined();
    expect(d.e.talkEntry('vesper-quill', d.s)).toBe('vesper.meet');
    expect(d.p.credit).toEqual(credit);
  });

  it('lets an older Council save finish the team work after an ending', () => {
    const d = start();
    d.run({ type: 'SetFlag', flag: 'ending.council', value: 'correct' });
    expect(d.e.talkEntry('vesper-quill', d.s)).toBe('vesper.after');
    scene(d, 'brief', 'Start a new packet');
    expect(d.s.flags['council.team.workflow']).toBe('fresh');
    expect(d.s.flags['ending.council']).toBe('correct');
    expect(d.e.talkEntry('vesper-quill', d.s)).toBe('vesper.after');
  });
});
