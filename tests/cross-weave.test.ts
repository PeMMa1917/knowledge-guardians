import { describe, expect, it } from 'vitest';
// @ts-expect-error The audit is a standalone Node JavaScript entry point.
import { collectProofs, essayTitleInventory, indexPairs, pairStatus, parseCatalogue, totalsFor } from '../tools/audit-cross-weave.mjs';

const evidence = { id: 'concept:evidence', kind: 'concept' };
const stages = { id: 'story:3', status: 'playable' };
const dimensions = [evidence, { id: 'micro:1', kind: 'micro', supplied: false }];
const elements = [stages, { id: 'story:4', status: 'planned' }, { id: 'game:4', status: 'excluded' }];
const worlds = [{ id: 'WORLD-01' }, { id: 'WORLD-02' }];
const row = { world: 'WORLD-02', objective: 'check-record', dimensions: [evidence.id], elements: [stages.id] };

describe('action-level learning and RPG element census', () => {
  it('uses numbered rows from both catalogue layouts and rejects duplicate or missing rows', () => {
    const game = '| 1 | Dated entry | ◐ | Authored adaptation | Source |';
    const story = '| 1 | Two approaches | Description | ✓ | Source |';
    expect(parseCatalogue(game, 'game', 1)).toEqual([{ id: 'game:1', number: 1, kind: 'game', name: 'Dated entry', status: 'partial' }]);
    expect(parseCatalogue(story, 'story', 1)[0].status).toBe('playable');
    expect(() => parseCatalogue(`${game}\n${game}`, 'game', 1)).toThrow(/row 1/);
    expect(() => parseCatalogue(game, 'game', 2)).toThrow(/1–2/);
  });

  it('does not infer a new intersection from two evidence rows on the same objective', () => {
    const index = indexPairs([row, row, { ...row, dimensions: ['framework:ethics'], elements: ['game:3'] }]);
    expect(index.get('WORLD-02|concept:evidence|story:3')?.size).toBe(1);
    expect(index.get('WORLD-02|framework:ethics|game:3')?.size).toBe(1);
    expect(index.has('WORLD-02|framework:ethics|story:3')).toBe(false);
    expect(index.has('WORLD-01|concept:evidence|story:3')).toBe(false);
  });

  it('validates the physical target, source anchor and explicit question or micro-skill', () => {
    const input = {
      objectives: new Map([['check-record', { mission: { id: 'mission', world: 'WORLD-01' }, step: {} }]]),
      maps: { dispatch: { world: 'WORLD-02', interactables: [{ id: 'drawer' }] } },
      elements,
      dimensions: [...dimensions, { id: 'question:KQ-1', kind: 'question' }, { id: 'micro:79', kind: 'micro', skillId: 'SK-MICRO-0079' }],
      sourceText: new Map([['tests/route.test.ts', 'Closed the drawer after comparing the verified records.']]),
    };
    const proof = { ...row, map: 'dispatch', target: 'drawer', source: 'tests/route.test.ts',
      anchor: 'after comparing the verified records', action: 'Compare the drawer records.' };
    expect(collectProofs({ ...input, rows: [proof] })[0]).toMatchObject({ world: 'WORLD-02', missionWorld: 'WORLD-01' });
    expect(() => collectProofs({ ...input, rows: [{ ...proof, target: 'unknown' }] })).toThrow(/Unresolved action proof/);
    expect(() => collectProofs({ ...input, rows: [{ ...proof, anchor: 'absent from independent evidence' }] })).toThrow(/Unresolved action proof/);
    expect(() => collectProofs({ ...input, rows: [{ ...proof, dimensions: ['question:KQ-1'] }] })).toThrow(/Unsupported question/);
    expect(() => collectProofs({ ...input, rows: [{ ...proof, dimensions: ['micro:79'] }] })).toThrow(/Unsupported micro-skill/);
    expect(() => collectProofs({ ...input, rows: [{ ...proof, elements: ['game:4'] }] })).toThrow(/Unavailable element/);
  });

  it('counts all gap categories once and requires ten distinct objective IDs in one world', () => {
    const index = indexPairs([row, row]);
    expect(totalsFor(worlds, dimensions, elements, index)).toEqual({
      cells: 12, 'meets-target': 0, 'below-target': 1, 'no-action-proof': 1,
      'planned-element': 4, 'excluded-by-design': 4, 'source-unavailable': 2,
    });
    const ten = indexPairs(Array.from({ length: 10 }, (_, i) => ({ ...row, objective: `action-${i}` })));
    expect(totalsFor(worlds, dimensions, elements, ten)['meets-target']).toBe(1);
    expect(pairStatus(evidence, stages, 9)).toBe('below-target');
  });

  it('records sourced title ordinals without crediting a playable action', () => {
    const source = { code: 'M25', session: 'May 2025', source: 'https://drive.google.com/file/d/verified-source/view',
      page: 2, ordinals: [1, 2, 3, 4, 5, 6], verifiedOn: '2026-11-26' };
    const titles = essayTitleInventory([source]);
    expect(titles).toHaveLength(6);
    expect(titles[0]).toEqual({ id: 'essay-title:PT-M25-01', name: 'May 2025 title 1', kind: 'essay-title',
      session: source.session, ordinal: 1, page: source.page, source: source.source, verifiedOn: source.verifiedOn });
    expect(totalsFor(worlds, titles, [stages], indexPairs([]))['no-action-proof']).toBe(12);
    expect(() => essayTitleInventory([source, source])).toThrow(/Invalid prescribed title source/);
    expect(() => essayTitleInventory([source, { ...source, code: 'N25', session: 'Nov 2025' }])).toThrow(/Invalid prescribed title source/);
    expect(() => essayTitleInventory([{ ...source, ordinals: [1, 2, 3, 4, 5] }])).toThrow(/Invalid prescribed title source/);
  });

  it('counts a title adaptation only for the authored and traced optional outcome', () => {
    const id = 'essay-title:PT-M25-06';
    const source = 'https://drive.google.com/file/d/verified-source/view';
    const input = {
      objectives: new Map([['check-record', { mission: { id: 'route', world: 'WORLD-01' }, step: {} }]]),
      maps: { dispatch: { world: 'WORLD-02', interactables: [{ id: 'bench' }] } },
      elements, dimensions: [{ id, kind: 'essay-title', source, session: 'May 2025', ordinal: 6, page: 2 },
        { id: 'area:ART', name: 'The arts', kind: 'area' }],
      sourceText: new Map([['tests/route.test.ts', 'Compares visitor views in outcome.look: quiet or shown.']]),
      dialogue: [{ options: ['quiet', 'shown'].map((value) => ({ effects: [{ setFlag: 'outcome.look', value }] })) }],
    };
    const proof = { ...row, map: 'dispatch', target: 'bench', source: 'tests/route.test.ts',
      anchor: 'Compares visitor views', action: 'Choose when to show the lighting technique.', dimensions: [id] };
    expect(() => collectProofs({ ...input, rows: [proof] })).toThrow(/Unresolved title adaptation/);
    const adaptation = { ...proof, observation: { flag: 'outcome.look', values: ['quiet', 'shown'] }, titleApplications: [{
      id, area: 'ART', basis: 'A revealed technique prompts a new question.', foil: 'A quiet first look prompts a different question.',
      limit: 'The visitor responses are fictional.',
    }] };
    expect(() => collectProofs({ ...input, rows: [adaptation] })).toThrow(/Unresolved title adaptation/);
    const tagged = { ...adaptation, dimensions: [...adaptation.dimensions, 'area:ART'] };
    expect(() => collectProofs({ ...input, dialogue: [], rows: [tagged] })).toThrow(/Unresolved optional outcome/);
    expect(() => collectProofs({ ...input, rows: [tagged], sourceText: new Map([['tests/route.test.ts',
      'Compares visitor views but no outcome.']]) })).toThrow(/Unresolved optional outcome/);
    const reviews = collectProofs({ ...input, rows: [tagged, tagged] });
    expect(reviews[0]).toMatchObject({ actionId: 'outcome:outcome.look', objective: 'check-record',
      titleApplications: [{ id, source, ordinal: 6, page: 2, area: 'ART', areaName: 'The arts' }] });
    expect(indexPairs(reviews).get(`WORLD-02|${id}|story:3`)).toEqual(new Set(['outcome:outcome.look']));
  });

  it('needs an observed reasoning step and distinct methods for a cross-area claim', () => {
    const linked = [evidence, { id: 'area:MAT', kind: 'area' }, { id: 'area:HUM', kind: 'area' },
      { id: 'framework:scope', kind: 'framework' }, { id: 'reasoning:deductive', kind: 'reasoning' }];
    const input = {
      objectives: new Map([['check-record', { mission: { id: 'route', world: 'WORLD-01' }, step: {} }]]),
      maps: { dispatch: { world: 'WORLD-02', interactables: [{ id: 'rack' }] } },
      elements, dimensions: linked, sourceText: new Map([['tests/route.test.ts', 'Groups ordered rows and reads the record.']]),
    };
    const proof = { objective: 'check-record', map: 'dispatch', target: 'rack', source: 'tests/route.test.ts',
      anchor: 'Groups ordered rows', action: 'Group the rows then find who released the orders.', elements: [stages.id],
      dimensions: linked.slice(0, 4).map(({ id }) => id) };
    const comparison = { concepts: ['evidence'], framework: ['scope'], connection: 'Use the local record to check what the grouping assumes.',
      areas: [{ id: 'MAT', method: 'Count the rows.', limit: 'The count depends on the number of marks.' },
        { id: 'HUM', method: 'Read the release report.', limit: 'Only this shift was observed.' }] };
    expect(collectProofs({ ...input, rows: [proof] })[0].comparison).toBeUndefined();
    expect(() => collectProofs({ ...input, rows: [{ ...proof, dimensions: linked.map(({ id }) => id) }] }))
      .toThrow(/Unresolved reasoning evidence/);
    expect(() => collectProofs({ ...input, rows: [{ ...proof, comparison: { ...comparison, areas: [comparison.areas[0]] } }] }))
      .toThrow(/Incomplete cross-area evidence/);
    const reviewed = collectProofs({ ...input, rows: [{ ...proof, comparison,
      reasoning: [{ mode: 'deductive', basis: 'Group every possible assignment under two fixed rules.' }] }] });
    expect(reviewed[0]).toMatchObject({ comparison, world: 'WORLD-02' });
    expect(indexPairs(reviewed).get('WORLD-02|reasoning:deductive|story:3')?.size).toBe(1);
  });
});
