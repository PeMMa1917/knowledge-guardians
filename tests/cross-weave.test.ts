import { describe, expect, it } from 'vitest';
// @ts-expect-error The audit is a standalone Node JavaScript entry point.
import { collectProofs, indexPairs, pairStatus, parseCatalogue, totalsFor } from '../tools/audit-cross-weave.mjs';

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
});
