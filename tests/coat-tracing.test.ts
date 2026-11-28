import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { coatMargins } from '../src/content/coatMargins';
import { pocketStories } from '../src/content/pocketStories';
import { adventureJournalView } from '../src/domain/adventureJournal';
import {
  coatSlip,
  coatSlipReply,
  decodeCoatSlip,
  mountedCoatSlips,
  openedCoatSlip,
} from '../src/domain/coatTracing';
import {
  LANTERN_PEOPLE,
  LANTERN_SITES,
  lanternEffects,
  type LanternCommand,
} from '../src/domain/lamplight';
import { coatEffects, type PocketCommand } from '../src/domain/pocketCoat';
import { apply, emptyOutputs } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { Driver } from './driver';

type Move = PocketCommand extends infer T ? (T extends PocketCommand ? Omit<T, 'type'> : never) : never;
const pocket = (move: Move): PocketCommand => ({ type: 'WorkCoatPocket', ...move });

describe('a different pair of hands on the keeper’s tracing', () => {
  it('takes each of the 250 guests from every chapter to its receiving keeper with either original piece on top and both ways of replying', () => {
    const initial = new Driver().s;
    for (const [i, guest] of LANTERN_PEOPLE.entries())
      for (const [j, site] of LANTERN_SITES.entries()) {
        let s = { ...initial, mapId: site.map };
        const lantern = (c: LanternCommand) => {
          s = apply(lanternEffects(c, s), s, emptyOutputs());
        };
        const move = (m: Move) => {
          s = apply(coatEffects(pocket(m), s), s, emptyOutputs());
        };
        const command = { type: 'WorkWithLantern' as const, site: site.id, person: guest.id };
        lantern({ ...command, stage: 'meet' });
        lantern({ ...command, stage: 'pin', piece: (i % 3) as 0 | 1 | 2 });
        lantern({ ...command, stage: 'pin', piece: ((i + 1) % 3) as 0 | 1 | 2 });
        lantern({ ...command, stage: 'trace', option: (i % 2) as 0 | 1 });
        lantern({ ...command, stage: 'use', option: (j % 2) as 0 | 1 });
        const from = 'night-register.' + site.id;
        const to = 'night-register.' + pocketStories[site.id].to;
        s = { ...s, mapId: from };
        move({ action: 'pull' });
        move({ action: 'turn', rail: 0, side: 1 });
        move({ action: 'pull' });
        const options = mountedCoatSlips(s, site.id);
        expect(options).toHaveLength(2);
        for (const slip of options) {
          s = { ...s, mapId: from };
          move({ action: 'thread', slip: slip.value });
          move({ action: 'stitch', seam: 0 });
          s = { ...s, mapId: to };
          move({ action: 'read' });
          const saved = openedCoatSlip(s, site.id)!;
          expect(saved.slip.pinned).toEqual(slip.pinned);
          expect(new Set([saved.slip.pinned, saved.slip.other, saved.slip.loose]).size).toBe(3);
          expect(saved.both).toBe(false);
          move({ action: 'unfold', leaf: 'loose' });
          move({ action: 'unfold', leaf: 'other' });
          for (const reading of ['alongside', 'limit'] as const) {
            move({ action: 'reply', reading });
            expect(coatSlipReply(s, site.id)).toBe(reading);
          }
        }
      }
  }, 30000);

  it('keeps mounted, threaded, sent and received versions apart on resume, and honours a later decision to send the coat alone', () => {
    const d = new Driver(),
      site = LANTERN_SITES[0],
      guest = LANTERN_PEOPLE[0],
      target = pocketStories[site.id].to;
    const atLamp = () => {
      d.s.mapId = site.map;
    };
    const atPeg = (room: string) => {
      d.s.mapId = 'night-register.' + room;
    };
    const work = (m: Move) => d.run(pocket(m));
    const lamp = { type: 'WorkWithLantern' as const, site: site.id, person: guest.id };
    atPeg(site.id);
    expect(() => work({ action: 'thread', slip: guest.id + '.0.0.01.1' })).toThrow();
    atLamp();
    d.run({ ...lamp, stage: 'meet' });
    d.run({ ...lamp, stage: 'pin', piece: 0 });
    d.run({ ...lamp, stage: 'pin', piece: 1 });
    d.run({ ...lamp, stage: 'trace', option: 1 });
    d.run({ ...lamp, stage: 'use', option: 0 });
    atPeg(site.id);
    const [first, second] = mountedCoatSlips(d.s, site.id);
    work({ action: 'thread', slip: first.value });
    work({ action: 'pull' });
    work({ action: 'turn', rail: 1, side: 1 });
    work({ action: 'pull' });
    work({ action: 'stitch', seam: 0 });
    atPeg(target);
    work({ action: 'read' });
    work({ action: 'unfold', leaf: 'other' });
    expect(() => work({ action: 'reply', reading: 'limit' })).toThrow();
    atPeg(site.id);
    work({ action: 'thread', slip: second.value });
    work({ action: 'stitch', seam: 0 });
    atLamp();
    d.run({ ...lamp, stage: 'pin', piece: 2 });
    d.run({ ...lamp, stage: 'trace', option: 0 });
    d.run({ ...lamp, stage: 'use', option: 1 });
    atPeg(target);
    d.s = migrateCampaign(JSON.parse(JSON.stringify(d.s))).state;
    expect(openedCoatSlip(d.s, site.id)?.slip.value).toBe(first.value);
    work({ action: 'unfold', leaf: 'loose' });
    work({ action: 'reply', reading: 'limit' });
    work({ action: 'read' });
    expect(coatSlipReply(d.s, site.id)).toBeUndefined();
    expect(openedCoatSlip(d.s, site.id)?.both).toBe(false);
    expect(openedCoatSlip(d.s, site.id)?.slip.value).toBe(second.value);
    atPeg(site.id);
    work({ action: 'unthread' });
    work({ action: 'stitch', seam: 1 });
    expect(coatSlip(d.s, site.id, 'sent')).toBeUndefined();
    atPeg(target);
    work({ action: 'read' });
    expect(() => work({ action: 'unfold', leaf: 'loose' })).toThrow();
    const view = adventureJournalView(buildPack(), d.s, []);
    const returned = view.entries.find((e) => e.event?.key.includes(':reply-limit:'));
    expect(returned?.text).toContain(coatMargins[target].limit);
    expect(returned?.reflections?.length).toBe(2);
    expect(returned?.encyclopedia?.name).toBe(guest.name);
    expect(returned?.encyclopedia?.kind).toBe('article');
    expect(returned?.event?.sourceIds).toEqual(['HIS-INK-' + guest.id]);
    expect(returned?.topics?.areas?.length).toBeGreaterThan(0);
  });
  it('treats a missing or malformed old tracing as an empty loop', () => {
    const id = LANTERN_PEOPLE[0].id;
    for (const v of [
      true,
      1,
      'missing.0.0.01.1',
      id + '.1.1.00.0',
      id + '.0.0.01.2',
      id + '.0.0.01.1.extra',
      id + '.2.0.01.1',
    ]) {
      expect(decodeCoatSlip('archive', v)).toBeUndefined();
    }
  });
});
