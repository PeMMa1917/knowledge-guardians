import { describe, expect, it } from 'vitest';
import { Driver } from './driver';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import sites from '../src/content/return-coat-sites.json';
import objects from '../src/content/return-coat-keepsakes.json';
import quarters from '../src/content/quarters.json';
import { coatEndings } from '../src/content/returnCoat';

function position(d: Driver, site: string) {
  const s = sites.find((s) => s.id === site)!;
  d.s.mapId = s.map;
  const available = MAPS[s.map].interactables.filter(
    (p) =>
      p.id.startsWith('return-coat-' + site + '-') &&
      p.kind === 'scene' &&
      check(p.visibleIf, d.s),
  );
  expect(available).toHaveLength(1);
  return available[0];
}
function visit(d: Driver, site: string, ...labels: string[]) {
  d.walk(position(d, site).node!, labels);
}
const endings = {
  hook: 'Leave the dry peg',
  book: 'Put a named guarantor',
  stage: 'Give the wardrobe',
};
describe('Two coats for one fare', () => {
  it.each(
    sites.flatMap((s) =>
      s.trials.map((t) => ({
        site: s.id,
        id: t[0],
        choice: t[2],
        entry: t[5],
      })),
    ),
  )(
    'records only the operation the Guardian actually tried at $site/$id',
    ({ site, id, choice, entry }) => {
      const d = new Driver();
      visit(d, site, choice);
      expect(d.done('returned-coat.' + site + '.' + id)).toBe(true);
      const other = sites
        .find((s) => s.id === site)!
        .trials.find((t) => t[0] !== id)!;
      expect(d.done('returned-coat.' + site + '.' + other[0])).toBe(false);
      const ref = 'j.returned-coat.' + site + '.' + id;
      expect(d.s.journal).toContain(ref);
      expect(d.e.pack.journal.find((j) => j.id === ref)?.text).toBe(entry);
    },
  );
  it.each(sites)(
    'can start at $name and reach all three arrangements without collectibles',
    (site) => {
      const d = new Driver();
      expect(position(d, site.id).id.endsWith('-first')).toBe(true);
      visit(d, site.id, site.trials[0][2]);
      expect(d.done('returned-coat.' + site.id + '.witness')).toBe(true);
      expect(
        d.e
          .visibleOptions('returned-coat.' + site.id + '.work', d.s)
          .some((o) => o.option.text.startsWith('Decide how')),
      ).toBe(false);
      visit(d, site.id, site.trials[1][2]);
      for (const e of coatEndings) {
        visit(d, site.id, 'Decide how', endings[e]);
        expect(d.s.flags['returned-coat.policy']).toBe(e);
        expect(position(d, site.id).id.endsWith('-' + e)).toBe(true);
        visit(d, site.id, 'Hear the two');
        expect(d.s.flags['returned-coat.' + site.id + '.worked.' + e]).toBe(
          true,
        );
        expect(d.s.journal).toContain('j.returned-coat.choose.' + e);
      }
    },
  );
  it.each([
    ['hook', 'kip-arden'],
    ['book', 'warden-ise'],
    ['stage', 'optics-nim'],
  ])(
    'gives the %s shift a distinct person who can accept two kinds of help',
    (policy, who) => {
      const d = new Driver();
      visit(d, 'council', sites[3].trials[0][2]);
      visit(d, 'council', sites[3].trials[1][2]);
      visit(
        d,
        'council',
        'Decide how',
        endings[policy as keyof typeof endings],
      );
      d.s.mapId = 'nexus.coat-lining';
      expect(
        MAPS[d.s.mapId].npcs
          .filter((n) => check(n.visibleIf, d.s))
          .map((n) => n.id),
      ).toEqual([who]);
      const greeting = d.e.talkEntry(who, d.s)!;
      expect(greeting).toBe('returned-coat.watch.' + policy);
      const options = d.e.visibleOptions(greeting, d.s);
      for (const [i, o] of options.slice(0, 2).entries()) {
        d.talk(who, o.option.text);
        expect(d.s.flags['returned-coat.watch.' + policy + '.' + i]).toBe(true);
      }
    },
  );
  it.each(objects)(
    '$id reveals its own observation and a particular reply at another site',
    (o) => {
      const d = new Driver();
      const clue = 'returned-coat.' + o.site + '.clue';
      const target = sites.find((x) => x.id === o.site)!;
      const receivingSite = sites.find((x) => x.id === o.receiver)!;
      visit(d, o.site, 'Let the people');
      expect(
        d.e
          .visibleOptions('returned-coat.' + o.receiver + '.work', d.s)
          .some((v) => v.option.text === o.offer),
      ).toBe(false);
      const keeper = quarters.keepsakes.find((k) => k.id === o.id)!;
      expect(keeper.use).toContain(o.use.slice(1));
      d.s.flags['keepsake.' + o.id] = true;
      const prop = MAPS[target.map].interactables.find((p) => p.clue === clue)!;
      expect(check(prop.visibleIf, d.s)).toBe(true);
      d.run({ type: 'ReadClue', clue });
      const use = d.run({ type: 'UseKeepsake', clue, keepsake: o.id });
      expect(use.events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ kind: 'clue', text: o.reading }),
        ]),
      );
      const entries = d.s.journal.length;
      d.run({ type: 'UseKeepsake', clue, keepsake: o.id });
      expect(d.s.journal.length).toBe(entries);
      // Recover the existing game save shape before carrying the observation to another district.
      d.s = JSON.parse(JSON.stringify(d.s));
      visit(d, receivingSite.id, o.offer);
      expect(d.s.flags['returned-coat.reply.' + o.id]).toBe(true);
      expect(d.s.journal).toContain('j.returned-coat.reply.' + o.id);
      expect(d.e.node('returned-coat.reply.' + o.id)).toMatchObject({
        speaker: o.speaker,
        text: o.reply,
      });
      const door = MAPS['nexus.archive'].interactables.find(
        (p) => p.id === 'return-coat-hook-pass',
      )!;
      expect(check(door.visibleIf, d.s)).toBe(o.kind === 'lining');
    },
  );
  it('keeps the unearned object off the rack and gives the hidden landing an unconditional way back', () => {
    const d = new Driver();
    expect(() =>
      d.run({
        type: 'UseKeepsake',
        clue: 'returned-coat.hook.clue',
        keepsake: 'moth-lamp',
      }),
    ).toThrow(/keepsake/);
    const pass = MAPS['nexus.archive'].interactables.find(
      (p) => p.id === 'return-coat-hook-pass',
    )!;
    expect(check(pass.visibleIf, d.s)).toBe(false);
    visit(d, 'hook', sites[0].trials[0][2]);
    visit(d, 'hook', sites[0].trials[1][2]);
    visit(d, 'hook', 'Decide how', endings.hook);
    expect(check(pass.visibleIf, d.s)).toBe(true);
    const room = MAPS[pass.to!.map];
    d.s.mapId = room.id;
    d.walk(room.interactables.find((p) => p.id === 'coat-inside-cuff')!.node!, [
      'Pull the loop',
    ]);
    expect(d.s.journal).toContain('j.returned-coat.loop');
    expect(
      room.interactables.find((p) => p.id === 'coat-inside-back'),
    ).toMatchObject({ to: { map: 'nexus.archive' }, walkThrough: true });
    expect(new Set(objects.map((x) => x.id))).toEqual(
      new Set(quarters.keepsakes.map((x) => x.id)),
    );
    expect(new Set(objects.map((x) => x.reply)).size).toBe(objects.length);
  });
});
