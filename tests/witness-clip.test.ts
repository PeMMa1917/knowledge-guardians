import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { WITNESS_CLIP_ARCHIVE, WITNESS_CLIP_LANDING, WITNESS_CLIP_PRESS } from '../src/maps/witnessClip';
import { Driver } from './driver';

const scope = 'copies.wordclip.';
const proof = 'item.copies.wordclip-proof';

function visible(d: Driver, id: string) {
  const prop = MAPS[d.s.mapId].interactables.find((item) => item.id === id);
  return prop && check(prop.visibleIf, d.s) ? prop : undefined;
}

function visit(d: Driver, door: string) {
  const prop = visible(d, door);
  expect(prop?.to, door).toBeDefined();
  expect(check(prop?.openIf, d.s)).toBe(true);
  d.s.mapId = prop!.to!.map;
}

function use(d: Driver, name: string, ...options: string[]) {
  const prop = visible(d, 'wordclip-' + name);
  expect(prop?.node, name).toBeDefined();
  d.walk(prop!.node!, options);
}

function gather(d: Driver) {
  d.s.mapId = 'copies.archive';
  expect(visible(d, 'wordclip-start')).toBeUndefined();
  d.s.objectivesDone.push('copies.revise');
  use(d, 'start', 'Take the empty clip');
  use(d, 'version', 'Clip the dates');
  visit(d, 'copies-press-path');
  expect(visible(d, 'wordclip-bind')).toBeUndefined();
  use(d, 'gloss', 'Fold back');
  visit(d, 'copies-press-to-landing');
  use(d, 'witness', 'Clip the witness’s signed arrival');
  expect(d.done(scope + 'gather')).toBe(true);
  visit(d, 'copies-landing-to-press');
}

describe('The Witness Clip', () => {
  it('keeps the optional dictionary citations separate from acting on fictional evidence', () => {
    const d = new Driver();
    d.s.mapId = 'copies.archive';
    d.s.objectivesDone.push('copies.revise');
    use(d, 'start', 'Take the empty clip');
    use(d, 'version', 'Open the dictionary', 'Return to the working paper', 'Leave the paper here');
    expect(d.s.flags[scope + 'version']).toBeUndefined();
    for (const word of ['version', 'gloss', 'witness']) {
      const node = d.e.node(scope + word + '.history');
      expect(node.historicalLabel).toBe('documented');
      const record = d.e.pack.sources.find(({ id }) => id === node.citationSource);
      expect(record?.url).toMatch(new RegExp(`/dictionary/${word}(#h3)?$`));
      expect(record?.mla?.container).toBe('Merriam-Webster.com Dictionary');
    }
  });

  it('uses all three pieces, carries one object to different receivers, and leaves two different records with equal credit', () => {
    const credit = (['records', 'landing'] as const).map((choice) => {
      const d = new Driver();
      gather(d);
      use(d, 'bind', choice === 'records' ? 'Bind the witness first' : 'Bind the gloss first');
      expect(d.s.inventory[proof]).toBe(1);
      visit(d, choice === 'records' ? 'copies-press-to-landing' : 'copies-press-return');
      expect(visible(d, choice === 'records' ? 'wordclip-receive.landing' : 'wordclip-receive.records')).toBeUndefined();
      visit(d, choice === 'records' ? 'copies-landing-return' : 'copies-landing-path');
      use(d, `receive.${choice}`, choice === 'records' ? 'Set the one-punch and two-punch wrappers' : 'Open the proof at the first written page');
      expect(d.done(scope + 'deliver')).toBe(true);
      expect(visible(d, 'wordclip-finished-' + choice)?.text).toContain(choice === 'records' ? 'Both dated forms' : 'first written page');
      expect(d.s.journal.filter((id) => id === 'j.copies.wordclip')).toHaveLength(1);
      return d.p.credit;
    });
    expect(credit[0]).toEqual(credit[1]);
  });

  it.each([
    ['copies.archive', WITNESS_CLIP_ARCHIVE],
    ['copies.press', WITNESS_CLIP_PRESS],
    ['copies.landing', WITNESS_CLIP_LANDING],
  ] as const)('gives the feature its own spaces in %s', (mapId, props) => {
    const map = MAPS[mapId];
    for (const { x, y, id } of props) {
      const overlap = [...map.npcs, ...map.interactables].filter((entry) => !entry.id.startsWith('wordclip-')
        && x >= entry.x && x < entry.x + ('w' in entry ? entry.w : 1)
        && y >= entry.y && y < entry.y + ('h' in entry ? entry.h : 1));
      expect(overlap.map((entry) => entry.id), id).toEqual([]);
    }
  });
});
