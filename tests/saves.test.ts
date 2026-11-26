import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { Engine, newCampaign } from '../src/domain/engine';
import { migratePermanent, newPermanent } from '../src/domain/permanent';
import {
  KEY_SLOTS, SaveService, emptyPair, memoryStore, parsePair, restoreRecovery, serialisePair, writeCheckpoint, writeSuspend,
  type SaveEntry,
} from '../src/domain/saves';
import type { CampaignState } from '../src/domain/types';
import { CAMPAIGN_SCHEMA } from '../src/domain/types';

const pack = buildPack();
const base = () => newCampaign(pack, 'Tester', 'player-a', 42);
const entry = (label: string, s: CampaignState = base()): SaveEntry => ({ kind: 'checkpoint', label, location: 'Archive', savedAt: '2026-01-01T00:00:00Z', state: s });

describe('two-slot rotation (spec 24.1)', () => {
  it('first checkpoint fills both slots', () => {
    const p = writeCheckpoint(emptyPair(), entry('A'));
    expect(p.continue?.label).toBe('A');
    expect(p.recovery?.label).toBe('A');
  });
  it('new checkpoint over a checkpoint keeps the previous one as recovery', () => {
    const p = writeCheckpoint(writeCheckpoint(emptyPair(), entry('A')), entry('B'));
    expect(p.continue?.label).toBe('B');
    expect(p.recovery?.label).toBe('A');
  });
  it('suspend writes update Continue while the stable checkpoint stays', () => {
    let p = writeCheckpoint(writeCheckpoint(emptyPair(), entry('A')), entry('B'));
    p = writeSuspend(p, { ...entry('S1'), kind: 'suspend' });
    expect(p.recovery?.label).toBe('B');
    p = writeSuspend(p, { ...entry('S2'), kind: 'suspend' });
    p = writeSuspend(p, { ...entry('S3'), kind: 'suspend' });
    expect(p.continue?.label).toBe('S3');
    expect(p.recovery?.label).toBe('B');
  });
  it('new checkpoint when Continue is a suspend keeps the stable checkpoint', () => {
    let p = writeCheckpoint(emptyPair(), entry('A'));
    p = writeSuspend(p, { ...entry('S'), kind: 'suspend' });
    p = writeCheckpoint(p, entry('C'));
    expect(p.continue?.label).toBe('C');
    expect(p.recovery?.label).toBe('A');
  });
  it('restoring recovery makes it current', () => {
    let p = writeCheckpoint(writeCheckpoint(emptyPair(), entry('A')), entry('B'));
    p = restoreRecovery(p);
    expect(p.continue?.label).toBe('A');
    expect(p.recovery?.label).toBe('A');
  });
  it('never has a third slot', () => {
    const p = writeCheckpoint(writeCheckpoint(writeCheckpoint(emptyPair(), entry('A')), entry('B')), entry('C'));
    expect(Object.keys(p).sort()).toEqual(['continue', 'recovery', 'revision']);
  });
});

describe('campaign rollback (spec 27.1)', () => {
  it('restoring recovery returns marks, inventory and quest flags together; permanent credit stays', () => {
    const e = new Engine(pack);
    let s = base();
    let perm = newPermanent();
    s = e.dispatch({ type: 'EnterNode', node: 'ise.start3' }, s, perm).state; // gives 30 marks + items
    const checkpoint = structuredClone(s);
    let pair = writeCheckpoint(emptyPair(), entry('cp', checkpoint));
    // Spend, gain, complete.
    for (const id of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) ({ state: s, permanent: perm } = e.dispatch({ type: 'InspectExhibit', exhibit: id }, s, perm));
    for (const id of ['OBJ-001-A', 'OBJ-001-B']) ({ state: s, permanent: perm } = e.dispatch({ type: 'UseLens', exhibit: id }, s, perm));
    s = { ...s, marks: s.marks - 10 };
    pair = writeSuspend(pair, { ...entry('later', s), kind: 'suspend' });
    expect(perm.awards['award.dates-have-kinds']).toBeTruthy();
    pair = restoreRecovery(pair);
    const restored = pair.continue!.state;
    expect(restored.marks).toBe(30);
    expect(restored.cards).toEqual([]);
    expect(restored.flags['count.inspected']).toBeUndefined();
    // Permanent credit is separate and unchanged by the restore.
    expect(perm.credit['crit.evidence.date-kinds']).toBe(20);
  });
});

describe('storage, checksum and migration', () => {
  it('round-trips through storage', () => {
    const store = memoryStore();
    const svc = new SaveService(store);
    const p = writeCheckpoint(emptyPair(), entry('A'));
    svc.commit(0, p);
    const r = svc.load();
    expect(r.ok && r.pair.continue?.label).toBe('A');
  });
  it('an interrupted write leaves the old complete pair (single-key write)', () => {
    const store = memoryStore();
    const svc = new SaveService(store);
    const p1 = writeCheckpoint(emptyPair(), entry('A'));
    svc.commit(0, p1);
    const before = store.data[KEY_SLOTS];
    const failing = { get: store.get, set: () => { throw new Error('power cut'); } };
    const svc2 = new SaveService(failing);
    expect(() => svc2.commit(p1.revision, writeCheckpoint(p1, entry('B')))).toThrow();
    expect(store.data[KEY_SLOTS]).toBe(before);
    const r = svc.load();
    expect(r.ok && r.pair.continue?.label).toBe('A');
  });
  it('rejects damaged data with a reason and does not change storage', () => {
    const store = memoryStore();
    const svc = new SaveService(store);
    svc.commit(0, writeCheckpoint(emptyPair(), entry('A')));
    const good = store.data[KEY_SLOTS];
    store.data[KEY_SLOTS] = good.replace('Archive', 'Archivf');
    const r = svc.load();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/damaged/);
  });
  it('rejects a save from a newer version', () => {
    const s: any = { ...base(), schema: 99 };
    const r = parsePair(serialisePair({ revision: 1, continue: entry('X', s), recovery: null }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/newer version/);
  });
  it('migrates a schema 1 save (gold, items[]) to schema 2', () => {
    const v1: any = { ...base(), schema: 1, gold: 7, items: ['item.journal', 'item.journal'] };
    delete v1.marks; delete v1.inventory; delete v1.notes;
    const r = parsePair(serialisePair({ revision: 3, continue: entry('old', v1), recovery: entry('old', v1) }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.migrated).toBe(true);
      expect(r.pair.continue!.state.marks).toBe(7);
      expect(r.pair.continue!.state.inventory['item.journal']).toBe(2);
    }
  });
  it('migrates a schema 2 save (evidence board) to schema 3 (Showdown, forge, events) and on', () => {
    const v2: any = { ...base(), schema: 2, board: { 'claim.x': ['card.loud-patent'] } };
    delete v2.showdown; delete v2.forge; delete v2.events;
    const r = parsePair(serialisePair({ revision: 4, continue: entry('v2', v2), recovery: null }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      const st: any = r.pair.continue!.state;
      expect(st.schema).toBe(CAMPAIGN_SCHEMA);
      expect(st.board).toBeUndefined();
      expect(st.showdown).toBeNull();
      expect(st.forge.route).toBe('none');
      expect(st.events.next).toBe(600);
    }
  });
  it('migrates a schema 3 save to schema 4 with they/them and no origin (spec 35.1)', () => {
    const v3: any = { ...base(), schema: 3, player: { name: 'Ana', look: 'player-a' } };
    const r = parsePair(serialisePair({ revision: 5, continue: entry('v3', v3), recovery: null }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      const st: any = r.pair.continue!.state;
      expect(st.schema).toBe(CAMPAIGN_SCHEMA);
      expect(st.player).toEqual({ name: 'Ana', look: 'player-a', pronouns: { subject: 'they', object: 'them', possessive: 'their' }, origin: null });
    }
  });
  it('rejects a save with bad pronouns', () => {
    const bad: any = { ...base(), player: { name: 'Ana', look: 'x', pronouns: { subject: '', object: 'them', possessive: 'their' }, origin: null } };
    const r = parsePair(serialisePair({ revision: 6, continue: entry('bad', bad), recovery: null }));
    expect(r.ok && r.pair.continue).toBeFalsy();
  });
  it('migrates a version 1 permanent record and keeps its credit and awards', () => {
    const p = migratePermanent({ schema: 1, credit: { 'crit.evidence.date-kinds': 20 }, awards: { 'award.dates-have-kinds': '2026-01-01' } });
    expect(p.credit['crit.evidence.date-kinds']).toBe(20);
    expect(p.awards['award.dates-have-kinds']).toBeTruthy();
    expect(p.portfolio).toEqual([]);
    expect(p.met.atl).toEqual({});
    expect(p.stones).toEqual({});
  });
  it('migrates a version 2 permanent record and adds Question Stones', () => {
    const p = migratePermanent({ ...newPermanent(), schema: 2, stones: undefined, credit: { 'crit.evidence.date-kinds': 20 } } as any);
    expect(p.schema).toBe(4);
    expect(p.credit['crit.evidence.date-kinds']).toBe(20);
    expect(p.stones).toEqual({});
    expect(p.skills).toEqual({});
  });
  it('detects a write from another tab (revision check)', () => {
    const store = memoryStore();
    const svc = new SaveService(store);
    svc.commit(0, writeCheckpoint(emptyPair(), entry('A')));
    expect(() => svc.commit(0, writeCheckpoint(emptyPair(), entry('B')))).toThrow(/another tab/);
  });
});
