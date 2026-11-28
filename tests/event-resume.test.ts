import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { totalXP } from '../src/domain/permanent';
import { emptyPair, parsePair, serialisePair, writeSuspend } from '../src/domain/saves';
import { Driver } from './driver';

const pack = buildPack();

function offer(d: Driver): string {
  for (let i = 0; i < 16 && !d.s.events.pending; i++) d.run({ type: 'Explore', seconds: 60 });
  expect(d.s.events.pending).toBeTruthy();
  return d.s.events.pending!;
}

describe('event resolution and reload', () => {
  it('keeps an invitation available in its own place and releases the deck after walking elsewhere',()=>{
    const d=new Driver();
    const pending=offer(d), ev=pack.events.find(e=>e.id===pending)!;
    d.run({type:'VisitPlace',name:'Still at the Archive'});
    expect(d.s.events.pending).toBe(pending);
    d.s.mapId=['council.gallery','market.square','water.gatehouse','stage.foyer'].find(id=>!ev.maps.includes(id))!;
    d.run({type:'VisitPlace',name:'An afternoon appointment'});
    expect(d.s.events.pending).toBeNull();
    expect(d.s.events.seen).not.toContain(pending);
    expect(d.s.events.next).toBe(240);
  });
  it('keeps the saved offer without issuing a second due command, then resolves it just once', () => {
    const d = new Driver();
    const pending = offer(d);
    const other = pack.events.find(({ id }) => id !== pending)!.id;
    const node = pack.events.find(({ id }) => id === pending)!.node;
    d.run({ type: 'SetFlag', flag: `event.resume.${pending}`, value: node });
    const saved = parsePair(serialisePair(writeSuspend(emptyPair(), {
      kind: 'suspend', location: d.s.mapId, label: 'Event waiting', savedAt: '2026-11-26T11:14:00.000Z', state: d.s,
    })));
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    d.s = saved.pair.continue!.state;
    expect(d.s.flags[`event.resume.${pending}`]).toBe(node);
    expect(d.run({ type: 'Explore', seconds: 60 }).events.some(({ kind }) => kind === 'event-due')).toBe(false);
    d.run({ type: 'ResolveEvent', event: other });
    expect(d.s.events.pending).toBe(pending);
    expect(d.s.events.seen).not.toContain(other);
    d.run({ type: 'ResolveEvent', event: pending });
    expect(d.s.events.pending).toBeNull();
    expect(d.s.events.seen).toEqual([pending]);
    expect(d.s.flags[`event.resume.${pending}`]).toBeUndefined();
    expect(d.s.flags['count.events']).toBe(1);
    const learned = structuredClone(d.p.met);
    d.run({ type: 'ResolveEvent', event: pending });
    expect(d.s.flags['count.events']).toBe(1);
    expect(d.p.met).toEqual(learned);
  });

  it('lets a dismissed invitation return after four exploration minutes without counting it as heard', () => {
    const d = new Driver();
    const earlier = offer(d);
    const xp = totalXP(d.p);
    d.run({ type: 'DelayEvent' });
    d.run({ type: 'ResolveEvent', event: earlier });
    expect(d.s.events.pending).toBeNull();
    expect(d.s.events.seen).not.toContain(earlier);
    expect(d.s.flags['count.events']).toBeUndefined();
    expect(totalXP(d.p)).toBe(xp);
    for (let i = 0; i < 3; i++) d.run({ type: 'Explore', seconds: 60 });
    expect(d.s.events.pending).toBeNull();
    expect(d.run({ type: 'Explore', seconds: 60 }).events.some(({ kind }) => kind === 'event-due')).toBe(true);
  });

  it('clears an already-seen offer from a legacy checkpoint without incrementing it again', () => {
    const d = new Driver();
    const pending = offer(d);
    d.run({ type: 'ResolveEvent', event: pending });
    d.s.events.pending = pending;
    const learned = structuredClone(d.p.met);
    d.run({ type: 'ResolveEvent', event: pending });
    expect(d.s.events.pending).toBeNull();
    expect(d.s.events.seen).toEqual([pending]);
    expect(d.s.flags['count.events']).toBe(1);
    expect(d.p.met).toEqual(learned);
  });
});
