import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { choiceIndex, readPersonas } from './audit-choice-paths.mjs';
import { reviewChoice, reviewStation } from './review-choice-perspectives.mjs';
const pack = {
  characters: [{ id: 'porter', name: 'Porter', talk: [{ node: 'outside' }], localGreeting: { hall: 'greet' } }],
  dialogue: [
    { id: 'outside', speaker: 'porter', text: 'Meet me outside.' },
    {
      id: 'greet',
      speaker: 'porter',
      text: 'One lamp remains.',
      options: [
        { text: 'Leave a light at the gate.', next: 'reply', effects: [{ setFlag: 'rail', value: 'gate' }] },
      ],
    },
    { id: 'reply', speaker: 'porter', text: 'I can find the key.', next: 'greet' },
    { id: 'bench', speaker: 'porter', text: 'Try the key.', options: [{ text: 'Try it.' }] },
    { id: 'party', speaker: 'porter', text: 'The ferry has arrived.', options: [{ text: 'Board.' }] },
  ],
  events: [{ node: 'party', maps: ['hall'] }],
};
const maps = {
  hall: {
    id: 'hall',
    world: 'WORLD-03',
    npcs: [{ id: 'porter' }],
    interactables: [
      { id: 'key', kind: 'fieldgame', game: 'key', x: 1, y: 1, label: 'Key barrel' },
      { id: 'gate', kind: 'door', x: 2, y: 1, label: 'Cold gate', openIf: { flag: 'rail', eq: 'gate' } },
      {
        id: 'glow',
        kind: 'sign',
        x: 2,
        y: 2,
        label: 'Light',
        artBy: { flag: 'rail', keys: { gate: 'light-gate' } },
      },
    ],
  },
};
const index = choiceIndex(pack, maps, { field: (id) => (id === 'key' ? ['bench'] : []), character: () => [] });
const row = index.options.find((r) => r.id === 'greet#0');
test('resolves cyclic greetings, station entrances, event maps and the actual receiving door', () => {
  assert.deepEqual(row.rooms, ['hall']);
  assert.deepEqual(row.chapters, [2]);
  assert.equal(row.reply, 'I can find the key.');
  assert.equal(row.callbacks.find((r) => r.id === 'gate').detail, 'door opens');
  assert.equal(row.callbacks.find((r) => r.id === 'glow').selectedArt, 'light-gate');
  for (const id of ['party#0', 'bench#0'])
    assert.deepEqual(index.options.find((x) => x.id === id).rooms, ['hall']);
});
test('gives every substantive profile a distinct review probe with a place-specific follow-up for both kinds of action', async () => {
  const personas = readPersonas(await readFile(new URL('../docs/audit/PERSONAS.md', import.meta.url), 'utf8'));
  const checks = new Set();
  assert.equal(personas.size, 84);
  assert.ok(!personas.has('J4'));
  for (const p of personas.values()) {
    const a = reviewChoice(p, row),
      b = reviewStation(p, index.objects[0]);
    assert.equal(a.persona, p.id);
    assert.equal(a.action, row.id);
    assert.match(a.ifConcernObserved, /hall/);
    assert.match(b.strength, /Key barrel/);
    assert.match(b.concern, /Key barrel/);
    assert.match(b.ifConcernObserved, /hall/);
    assert.ok(a.strength && a.concern && a.check);
    checks.add(a.check);
  }
  assert.equal(checks.size, personas.size);
});
