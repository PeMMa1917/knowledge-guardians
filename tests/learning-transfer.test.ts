import { expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { restoreMicroSkillUses, skillStage } from '../src/domain/skills';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function useStation(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  if (!prop || !check(prop.visibleIf, d.s)) throw new Error(`Unavailable station ${id}`);
  if (prop.node) d.walk(prop.node);
  return prop;
}

function requestClues(d: Driver, objective: string, finalClue: string) {
  expect(d.e.visibleObjectives(d.s).find(({ id }) => id === objective)?.complete).toBe(false);
  const before = d.p;
  const clues = Array.from({ length: 5 }, () => {
    const event = d.run({ type: 'RequestHint', objective }).events.find(({ kind }) => kind === 'hint');
    if (event?.kind !== 'hint') throw new Error(`Missing clue for ${objective}`);
    return event.hint;
  });
  expect(clues.map(({ depth }) => depth)).toEqual([1, 2, 3, 4, 4]);
  expect(new Set(clues.map(({ text }) => text)).size).toBe(4);
  expect(clues[3].text).toContain(finalClue);
  expect(d.p).toBe(before);
  expect(d.done(objective)).toBe(false);
}

it('uses a linked folio in two worlds and awards field practice only after each actual use', () => {
  const d = new Driver();
  const ids = ['SK-MICRO-0761', 'SK-MICRO-0801'];
  const set = (flag: string, value: string | boolean = true) => d.run({ type: 'SetFlag', flag: `linked.${flag}`, value });

  // Earlier chapter gates are staged. The sources and decisions in the two stations are played.
  d.s.mapId = 'aethelgard.study';
  d.run({ type: 'Reach', zone: 'study' });
  requestClues(d, 'linked.study.bound', 'Clip both sources');
  useStation(d, 'linked-study-issue');
  useStation(d, 'linked-study-trace');
  expect(useStation(d, 'linked-study-folio').game).toBe('linked-study-folio');
  set('study.clip.issue');
  set('study.clip.trace');
  expect(ids.every((id) => !d.p.skills[id])).toBe(true);
  set('study.bound');
  expect(d.done('linked.study.bound')).toBe(true);
  const studyUses = ids.map((id) => d.p.skills[id][0]);
  expect(studyUses.every((use) => use.includes('WORLD-02|') && use.includes('|linked.study.bound|'))).toBe(true);

  d.s.objectivesDone.push('civic.finish');
  d.s.mapId = 'nexus.archive';
  const entrance = useStation(d, 'voices-door');
  d.s.mapId = entrance.to!.map;
  d.run({ type: 'SetFlag', flag: entrance.flag!, value: true });
  requestClues(d, 'linked.voices.indexed', 'Return to the filing bench and link both records');
  expect(useStation(d, 'linked-voices-bench').game).toBe('linked-voices-bench');
  set('voices.entry', 'carried');
  set('voices.search.date');
  set('voices.search.subject');
  useStation(d, 'linked-voices-date');
  expect(ids.map((id) => d.p.skills[id])).toEqual(studyUses.map((use) => [use]));
  useStation(d, 'linked-voices-subject');
  set('voices.indexed');
  expect(d.done('linked.voices.indexed')).toBe(true);
  for (const [index, id] of ids.entries()) {
    expect(d.p.skills[id]).toEqual([studyUses[index], expect.stringMatching(/^WORLD-14\|.*\|linked\.voices\.indexed\|/)]);
    expect(skillStage(d.p.skills[id])).toBe('seen');
  }
  expect(restoreMicroSkillUses(d.p, d.e.pack, ['linked.study.bound', 'linked.voices.indexed'])).toBe(d.p);
});
