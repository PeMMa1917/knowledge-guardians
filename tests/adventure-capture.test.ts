import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { setDiaryPortfolioWriting } from '../src/domain/adventureWriting';
import { Engine, newCampaign, type Command } from '../src/domain/engine';
import { newPermanent } from '../src/domain/permanent';
import { emptyPair, migrateCampaign, parsePair, restoreRecovery, serialisePair, writeCheckpoint, writeSuspend } from '../src/domain/saves';
import { hasSpecimen } from '../src/domain/specimenGear';
import type { CampaignState, PermanentRecord } from '../src/domain/types';
import { COPIES_ARCHIVE } from '../src/maps/copies';

const pack = buildPack();
const engine = new Engine(pack);
const first = '2026-11-26T06:00:00.000Z';
const second = '2026-11-26T06:12:00.000Z';

function setup(state = newCampaign(pack, 'Route test', 'diary-player', 7), permanent = newPermanent()) {
  return {
    get state() { return state; },
    get permanent() { return permanent; },
    action(command: Command, at = first) {
      const result = engine.dispatch(command, state, permanent, at);
      state = result.state;
      permanent = result.permanent;
      return result;
    },
    view() { return adventureJournalView(pack, state, engine.visibleObjectives(state)); },
  };
}

describe('Adventure encounter capture', () => {
  it('records real routes, a sign, a conversation and a later return without replaying ordinary scene restore', () => {
    const d = setup();
    d.action({ type: 'VisitPlace', name: 'The Nexus' });
    d.state.mapId = COPIES_ARCHIVE.id;
    d.action({ type: 'VisitPlace', name: COPIES_ARCHIVE.name, via: { id: 'copies-door', label: 'the door to the City of Copies', from: 'nexus.archive' } });
    const sign = COPIES_ARCHIVE.interactables.find(({ id }) => id === 'copies-source')!;
    const read: Command = { type: 'ReadWorldSign', id: sign.id, title: sign.label, text: sign.text!, readFlag: sign.flag };
    d.action(read);
    d.action(read);
    d.action({ type: 'VisitPlace', name: COPIES_ARCHIVE.name });
    d.action({ type: 'EnterNode', node: 'cold.open3' }, second);
    d.action(read, second);
    d.state.mapId = 'nexus.archive';
    d.action({ type: 'VisitPlace', name: 'The Nexus', via: { id: 'copies-nexus-return', label: 'the return arch', from: COPIES_ARCHIVE.id } }, second);
    expect(d.state.flags['copies.source']).toBe(true);
    expect(d.view().entries.filter(({ event }) => event?.kind !== 'quest').map(({ id, event }) => [id, event?.kind])).toEqual([
      ['place:nexus.archive', 'arrival'],
      ['route:nexus.archive:copies-door:copies.archive', 'route'],
      ['sign:copies.archive:copies-source', 'sign'],
      ['conversation:cold.open3', 'conversation'],
      ['sign:copies.archive:copies-source@2', 'sign'],
      ['route:copies.archive:copies-nexus-return:nexus.archive', 'route'],
    ]);
    expect(d.view().entries.find(({ id }) => id.endsWith('@2'))).toMatchObject({
      at: second, mapId: COPIES_ARCHIVE.id, event: { key: 'sign:copies.archive:copies-source' },
    });
  });

  it('records blocked feedback, coalesces identical copy checks and keeps a later revisit and repair', () => {
    const fresh = newCampaign(pack, 'Route test', 'diary-player', 7);
    const d = setup({ ...fresh, mapId: 'copies.press', flags: { ...fresh.flags, 'copies.arrived': true } });
    const failed = d.action({ type: 'CompareCopy', edition: 'landing' });
    expect(failed.events[0]?.kind).toBe('error');
    expect(d.view().entries).toEqual([]);
    d.action({ type: 'ReadWorldSign', id: 'closed-lane', title: 'the short lane', text: 'Use the ordinary steps until the keeper waves it open.', blocked: true });
    const press: Command = { type: 'CompareCopy', edition: 'press' };
    d.action(press);
    const firstReading = d.state;
    const permanent = d.permanent;
    d.action(press, second);
    expect(d.state).toBe(firstReading);
    expect(d.permanent).toBe(permanent);
    expect(d.view().entries.map(({ id }) => id)).toEqual(['blocked-route:copies.press:closed-lane', 'copy-check:press']);
    expect(d.view().entries[0]).toMatchObject({ text: expect.stringContaining('ordinary steps'), event: { outcome: 'blocked' } });
    d.state.mapId = 'copies.landing';
    d.action({ type: 'CompareCopy', edition: 'landing' });
    d.state.mapId = 'copies.press';
    const beforeRevisit = d.state;
    const permanentBeforeRevisit = d.permanent;
    d.action(press, second);
    expect(d.state).toEqual({ ...beforeRevisit, adventureDiary: d.state.adventureDiary });
    expect(d.permanent).toEqual(permanentBeforeRevisit);
    expect(d.view().entries.find(({ id }) => id === 'copy-check:press@2')).toMatchObject({
      at: second, text: expect.stringMatching(/lost .During Tuesday.s trial/),
    });
    d.state.mapId = 'copies.landing';
    expect(d.action({ type: 'CompareCopy', edition: 'proof' }).events[0]?.kind).toBe('error');
    d.state.flags['copies.followup'] = true;
    d.action({ type: 'CompareCopy', edition: 'proof' }, second);
    expect(d.view().entries).toContainEqual(expect.objectContaining({
      id: 'copy-check:proof', at: second, mapId: 'copies.landing', text: expect.stringMatching(/restored.*Tuesday.*trial log/),
      event: expect.objectContaining({ kind: 'correction', outcome: 'checked' }),
    }));
  });

  it('keeps a changed gate condition and each actual experiment at the marking bench', () => {
    const fresh = newCampaign(pack, 'Route test', 'diary-player', 7);
    const d = setup({ ...fresh, mapId: 'water.gatehouse', flags: { ...fresh.flags, 'water.arrived': true } });
    const run: Command = { type: 'RunWaterTrial', setting: 'fields' };
    d.action(run);
    d.action({ type: 'SetFlag', flag: 'water.repaired', value: true });
    d.action(run, second);
    d.action(run, second);
    const tests = d.view().entries.filter(({ event }) => event?.kind === 'tool');
    expect(tests).toMatchObject([
      { id: 'water-run:drought:fields', text: expect.stringContaining('2 leaked at the gate') },
      { id: 'water-run:repaired:fields', text: expect.stringContaining('0 leaked at the gate') },
    ]);

    const workshop = setup();
    const simulate: Command = { type: 'RunSimulation', pen: 'loud-model', surface: 'paper' };
    workshop.action(simulate);
    workshop.action(simulate, second);
    expect(workshop.state.flags['sim.tests']).toBe(2);
    expect(workshop.view().entries.filter(({ event }) => event?.kind === 'tool').map(({ id }) => id)).toEqual([
      'simulation:loud-model:paper', 'simulation:loud-model:paper@2',
    ]);
  });

  it('remembers the same personalized conversation that actually opened', () => {
    const d = setup();
    d.action({ type: 'EnterNode', node: 'visitor.after' });
    expect(d.view().entries).toContainEqual(expect.objectContaining({ id: 'conversation:visitor.after',
      text: expect.stringContaining('a Guardian called Route test, and that I would thank them') }));
  });

  it('records a deliberate effect-free deferral, coalesces an immediate repeat and preserves a later different choice', () => {
    const d = setup();
    d.action({ type: 'EnterNode', node: 'kip.start' });
    const decline: Command = { type: 'ChooseDialogueOption', node: 'kip.start', index: 1 };
    expect(d.action(decline).nextNode).toBeNull();
    d.action(decline, second);
    expect(d.view().entries.filter(({ event }) => event?.kind === 'choice')).toEqual([expect.objectContaining({
      id: 'choice:kip.start:1', at: first, text: expect.stringContaining('Not now, thanks.'),
    })]);
    d.action({ type: 'InspectExhibit', exhibit: 'OBJ-001-A' }, second);
    d.action({ type: 'EnterNode', node: 'kip.start' }, second);
    d.action(decline, second);
    expect(d.action({ type: 'ChooseDialogueOption', node: 'kip.start', index: 0 }, second).nextNode).toBe('kip.idea');
    expect(d.view().entries.filter(({ event }) => event?.kind === 'choice').map(({ id }) => id)).toEqual([
      'choice:kip.start:1', 'choice:kip.start:1@2', 'choice:kip.start:0',
    ]);
  });

  it('leaves the generated panel dismissal out while keeping the actual keepsake choice', () => {
    const keepsake = pack.keepsakes![0].id;
    const localPack = { ...pack, dialogue: pack.dialogue.map((node) =>
      node.id === 'kip.start' ? { ...node, options: [] } : node),
    keepsakeTalks: [{ id: 'capture-test', character: 'kip-arden', node: 'kip.idea', keepsake, text: 'Show Kip this keepsake.' }] };
    const localEngine = new Engine(localPack);
    const s = newCampaign(localPack, 'Route test', 'diary-player', 7);
    s.flags[`keepsake.${keepsake}`] = true;
    const p = newPermanent();
    const options = localEngine.visibleOptions('kip.start', s);
    expect(options.map(({ option }) => option.text)).toEqual(['Show Kip this keepsake.', 'Goodbye.']);
    const dismiss = localEngine.dispatch({ type: 'ChooseDialogueOption', node: 'kip.start', index: options[1].index }, s, p, first);
    const choose = localEngine.dispatch({ type: 'ChooseDialogueOption', node: 'kip.start', index: options[0].index }, s, p, first);
    expect(dismiss.nextNode).toBeNull();
    expect(dismiss.state.adventureDiary.entries.some(({ event }) => event?.kind === 'choice')).toBe(false);
    expect(choose.nextNode).toBe('kip.idea');
    expect(choose.state.adventureDiary.entries).toContainEqual(expect.objectContaining({
      event: expect.objectContaining({ kind: 'choice', ref: 'kip.start' }),
      text: expect.stringContaining('Show Kip this keepsake.'),
    }));
  });

  it('allows exact specimen collection citations only after the actual claim', () => {
    const d = setup();
    const specimen = pack.exhibits.find(hasSpecimen)!;
    d.action({ type: 'InspectExhibit', exhibit: specimen.id });
    expect(d.view().entries.find(({ event }) => event?.ref === specimen.id)?.event?.sourceIds ?? [])
      .not.toContain(specimen.specimen.source);
    d.state.objectivesDone.push(specimen.specimen.objective);
    d.action({ type: 'ClaimSpecimen', exhibit: specimen.id });
    d.action({ type: 'ClaimSpecimen', exhibit: specimen.id });
    expect(d.view().entries.filter(({ event }) => event?.kind === 'finding' && event.ref === specimen.id)).toEqual([
      expect.objectContaining({ event: expect.objectContaining({ sourceIds: expect.arrayContaining([specimen.specimen.source]) }) }),
    ]);
  });

  it('preserves schema 5 entries as written, keeps revisits after Continue and isolates Checkpoint recovery', () => {
    const base = setup();
    base.action({ type: 'VisitPlace', name: 'The Nexus' });
    const diary = { entries: base.state.adventureDiary.entries.map(({ event: _, ...entry }) => entry), noteDetails: [] };
    const legacy = { ...base.state, schema: 5, adventureDiary: diary };
    const migrated = migrateCampaign(legacy);
    expect(migrated.migrated).toBe(true);
    expect(migrated.state.adventureDiary).toEqual({ ...diary, reflectionResponses: {}, noteDraft: null, portfolioWriting: {} });
    const d = setup(migrated.state);
    d.action({ type: 'ChooseDialogueOption', node: 'cold.open3', index: 1 }, second);
    const slot = (state: CampaignState) => ({ kind: 'checkpoint' as const, state, label: 'The archive', location: 'Nexus', savedAt: first });
    const saved = parsePair(serialisePair(writeSuspend(writeCheckpoint(emptyPair(), slot(base.state)), slot(d.state))));
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    expect(saved.pair.continue?.state.adventureDiary.entries.map(({ id }) => id)).toEqual(['place:nexus.archive', 'choice:cold.open3:1']);
    expect(restoreRecovery(saved.pair).continue?.state.adventureDiary.entries.map(({ id }) => id)).toEqual(['place:nexus.archive']);
  });

  it('keeps portfolio edits and their empty-draft marker private to this campaign with full text and no duplicate entry', () => {
    const old: PermanentRecord = { ...newPermanent(), portfolio: [{
      id: 'portfolio-1', world: 'WORLD-01', title: 'Checking a sign', text: 'Authored proof.',
      kind: pack.portfolio[0].kind, weave: pack.portfolio[0].weave, at: first, shared: false, reflection: 'Older adventure text',
    }] };
    const d = setup(undefined, old);
    expect(d.view().portfolioWriting).toEqual([]);
    const entry = old.portfolio[0];
    const emptyDraft = setDiaryPortfolioWriting(d.state.adventureDiary, entry, '', first, d.state.mapId, true);
    const draftState = migrateCampaign({ ...d.state, adventureDiary: emptyDraft }).state;
    expect(draftState.adventureDiary.portfolioWriting[entry.id]).toMatchObject({ draft: true, text: '' });
    expect(setup(draftState, old).view().portfolioWriting).toEqual([]);
    const text = '  A line with spaces.\n'.repeat(100);
    d.action({ type: 'PortfolioReflect', entry: entry.id, text });
    d.action({ type: 'PortfolioReflect', entry: entry.id, text }, second);
    expect(d.view().portfolioWriting).toEqual([{ id: entry.id, title: entry.title, text, mapId: 'nexus.archive', at: first }]);
    expect(d.permanent.portfolio[0]).toMatchObject({ reflection: text, shared: false });
    const edit = 'Second line kept.\n';
    d.action({ type: 'PortfolioReflect', entry: entry.id, text: edit }, second);
    expect(d.view().portfolioWriting).toHaveLength(1);
    expect(d.view().portfolioWriting?.[0]).toMatchObject({ text: edit, at: second });
    d.action({ type: 'PortfolioReflect', entry: entry.id, text: '' }, second);
    expect(d.view().portfolioWriting).toEqual([]);
    expect(d.permanent.portfolio[0]).toMatchObject({ reflection: '', shared: false });
    expect(old.portfolio[0].reflection).toBe('Older adventure text');
  });
});
