import { describe, it, expect } from 'vitest';
import { strFromU8, unzipSync } from 'fflate';
import { adventureJournalView } from '../src/domain/adventureJournal';
import { adventureDocx } from '../src/ui/adventureDocx';
import { Driver } from './driver';
import { MAPS } from '../src/maps';
import { check } from '../src/domain/rules';
import {
  carryFlag,
  specimenItemId,
  specimenToolId,
} from '../src/domain/specimenGear';
import {
  encyclopediaForCharacter,
  encyclopediaLinks,
} from '../src/domain/encyclopedia';
import { petalExtras } from '../src/content/petalGlasshouse';
import {
  cardsMatch,
  flowerAfterMap,
  flowerEnding,
  flowerFlag as F,
  flowers,
  gardenTape,
  measure,
  petalMap,
  petalPaper,
  petalSight,
  seen,
  watched,
  type PetalMove,
} from '../src/domain/petalWindow';
import {
  danceAfter,
  hours,
  lastDance,
  moves,
  opened,
  pinned,
  replyToRibbon,
  ribbons,
} from '../src/domain/petalWager';
import {
  gearRead,
  pairedGears,
  rollers,
  type GearCommand,
} from '../src/domain/petalGears';
const move = (d: Driver, c: PetalMove) =>
  d.run({ type: 'WorkPetalWindow', ...c });
const gear = (
  d: Driver,
  c: Omit<GearCommand, 'type'> & {
    roller?: (typeof rollers)[number];
    reader?: 'front' | 'wings';
  },
) => d.run({ type: 'WindPetalGear', ...c } as GearCommand);
function contact(d: Driver) {
  for (const band of ['day', 'uv'] as const) {
    move(d, { action: 'set-band', band });
    for (const flower of flowers) move(d, { action: 'sample', flower });
  }
}
function watch(d: Driver) {
  for (const place of ['left', 'right'] as const) {
    move(d, { action: 'shelf', place });
    move(d, { action: 'watch' });
  }
}
const house = () => {
  const d = new Driver();
  d.s.mapId = petalMap;
  d.run({ type: 'VisitPlace', name: 'The little glasshouse' });
  return d;
};
describe('the yellow dress with twenty-seven fingers', () => {
  it('separates the two identical daylight crops, the UV detector and the animal’s own landing', () => {
    const d = house();
    for (const gain of [1, 2, 4] as const) {
      expect(measure('apron', 'day', gain)).toEqual(
        measure('sleeve', 'day', gain),
      );
      for (const flower of flowers)
        for (const band of ['uv', 'day'] as const)
          expect(
            measure(flower, band, gain).cells.every((n) => n >= 0 && n <= 100),
          ).toBe(true);
    }
    expect(measure('apron', 'uv', 1).low).toBe(4);
    expect(measure('sleeve', 'uv', 1).low).toBe(12);
    expect(() => move(d, { action: 'show', ending: 'silk' })).toThrow(
      /both crops/,
    );
    contact(d);
    expect(cardsMatch(d.s, 'day', 1) && cardsMatch(d.s, 'uv', 1)).toBe(true);
    expect(watched(d.s)).toBe(false);
    expect(() => move(d, { action: 'show', ending: 'garden' })).toThrow();
    watch(d);
    expect(gardenTape('apron').onHem).toBe(2);
    expect(gardenTape('sleeve').onHem).toBe(1);
    expect(gardenTape('apron').time).not.toBe(gardenTape('sleeve').time);
    expect(
      d.s.adventureDiary.entries
        .filter((e) => e.event?.key.startsWith('petal-window:reading'))
        .every(
          (e) =>
            e.event?.sourceIds?.includes(petalSight) &&
            e.event.sourceIds.includes(petalPaper),
        ),
    ).toBe(true);
    const reading = d.s.adventureDiary.entries.filter((e) =>
      e.event?.key.startsWith('petal-window:reading'),
    );
    expect(reading).toHaveLength(4);
  });
  it('returns from upper-stop clipping to detail at the same two crops after saving mid-run', () => {
    const d = house();
    contact(d);
    expect(() => move(d, { action: 'flip-ink' })).toThrow(/pin/);
    d.s.inventory['item.nexus.shutter-pin'] = 1;
    move(d, { action: 'flip-ink' });
    expect(seen(d.s, 'reverse-ink')).toBe(true);
    move(d, { action: 'flip-ink' });
    expect(seen(d.s, 'reverse-ink')).toBe(false);
    move(d, { action: 'set-gain', gain: 4 });
    for (const flower of flowers) {
      move(d, { action: 'sample', flower });
      expect(measure(flower, 'uv', 4).clipped).toBeGreaterThan(0);
    }
    expect(d.done('petal.ceiling')).toBe(false);
    d.s = JSON.parse(JSON.stringify(d.s));
    move(d, { action: 'set-gain', gain: 1 });
    move(d, { action: 'sample', flower: 'sleeve' });
    expect(d.done('petal.ceiling')).toBe(false);
    move(d, { action: 'sample', flower: 'apron' });
    expect(d.done('petal.ceiling')).toBe(true);
  });
  it('moves each ending to a different audience and lets someone else change the next production', () => {
    const d = house();
    contact(d);
    watch(d);
    for (const ending of ['silk', 'garden'] as const) {
      d.s.mapId = petalMap;
      move(d, { action: 'show', ending });
      expect(flowerEnding(d.s)).toBe(ending);
      const door = MAPS[petalMap].interactables.find(
        (p) => p.id === 'petal-' + ending + '-door',
      )!;
      expect(check(door.visibleIf, d.s)).toBe(true);
      expect(door.to?.map).toBe(flowerAfterMap(ending));
      expect(() => move(d, { action: 'reply', choice: 'first' })).toThrow(
        /Find/,
      );
      d.s.mapId = door.to!.map;
      for (const choice of ['first', 'second'] as const) {
        move(d, { action: 'reply', choice });
        expect(d.s.flags[F('reply.' + ending)]).toBe(choice);
      }
      d.s = JSON.parse(JSON.stringify(d.s));
      expect(d.s.flags[F('answered')]).toBe(ending);
    }
    expect(
      d.s.adventureDiary.entries.filter((e) =>
        e.event?.key.match(/^petal-window:(silk|garden)\.(first|second)$/),
      ),
    ).toHaveLength(4);
  });
  it('preserves order, the interval and the count ratio under four distinct changes of scale', () => {
    const d = house();
    expect(() => gear(d, { action: 'pull' })).toThrow();
    contact(d);
    watch(d);
    move(d, { action: 'show', ending: 'silk' });
    expect(() => gear(d, { action: 'send', reader: 'front' })).toThrow(
      /four paper/,
    );
    for (const r of rollers) {
      gear(d, { action: 'fit', roller: r });
      gear(d, { action: 'pull' });
      gear(d, { action: 'turn' });
      d.s = JSON.parse(JSON.stringify(d.s));
      gear(d, { action: 'pull' });
    }
    expect(
      pairedGears(d.s) &&
        gearRead('hours', false).movement === gearRead('hours', true).movement,
    ).toBe(true);
    expect(gearRead('hours', true).face).toContain('10 and 70');
    expect(gearRead('hours', false).face).toContain('490 and 550');
    expect(gearRead('counts', true).face).toContain('2 and Cuff counts 6');
    expect(gearRead('grades', false).face).not.toEqual(
      gearRead('grades', true).face,
    );
    for (const reader of ['wings', 'front'] as const) {
      gear(d, { action: 'send', reader });
      expect(d.s.flags[F('gear.sent')]).toBe(reader);
    }
    expect(d.done('petal.gears')).toBe(true);
  });
  it('checks predictions against unopened landings and uses the same observations to expand a dancer’s repertoire', () => {
    for (const e of ['silk', 'garden'] as const)
      for (const ribbon of ribbons) {
        const d = house();
        contact(d);
        watch(d);
        move(d, { action: 'show', ending: e });
        expect(() =>
          d.run({ type: 'DrawPetalRibbon', hour: 'noon', action: 'release' }),
        ).toThrow(/audience/);
        d.s.mapId = flowerAfterMap(e);
        for (const hour of hours) {
          expect(() =>
            d.run({
              type: 'DrawPetalRibbon',
              hour,
              action: 'dance',
              move: 'wait',
            }),
          ).toThrow(/Unfold/);
          expect(() =>
            d.run({ type: 'DrawPetalRibbon', hour, action: 'release' }),
          ).toThrow(/ribbon/);
          d.run({
            type: 'DrawPetalRibbon',
            hour,
            action: 'pin',
            ribbon: 'open',
          });
          d.run({ type: 'DrawPetalRibbon', hour, action: 'pin', ribbon });
          d.s = JSON.parse(JSON.stringify(d.s));
          expect(pinned(d.s, hour)).toBe(ribbon);
          d.run({ type: 'DrawPetalRibbon', hour, action: 'release' });
          expect(opened(d.s, hour)).toBe(true);
          expect(() =>
            d.run({
              type: 'DrawPetalRibbon',
              hour,
              action: 'pin',
              ribbon: 'cuff',
            }),
          ).toThrow(/first public ribbon/);
          for (const m of moves) {
            d.run({ type: 'DrawPetalRibbon', hour, action: 'dance', move: m });
            expect(lastDance(d.s, hour)).toBe(m);
            expect(
              d.s.adventureDiary.entries.some((x) =>
                x.text.includes(danceAfter[m]),
              ),
            ).toBe(true);
          }
        }
        expect(d.done('petal.ribbons')).toBe(true);
      }
    expect(replyToRibbon('noon', 'cuff')).toContain('fits');
    expect(replyToRibbon('dusk', 'cuff')).toContain('exception');
    expect(replyToRibbon('noon', 'window')).toContain('takes down');
    expect(replyToRibbon('dusk', 'open')).toContain('no prediction');
  });
  it('ties eight returning tools to the player’s actual kit and gives the 1771 impression one identity', () => {
    const d = house(),
      map = MAPS[petalMap];
    for (const t of petalExtras) {
      const p = map.interactables.find((x) => x.id === 'petal-tool-' + t.id)!;
      expect(p).toBeTruthy();
      expect(check(p.visibleIf, d.s)).toBe(false);
      d.s.inventory[t.item] = 1;
      if ('requires' in t) {
        expect(check(p.visibleIf, d.s)).toBe(false);
        d.s.flags[t.requires] = true;
      }
      expect(check(p.visibleIf, d.s)).toBe(true);
      if (t.id === 'pin') {
        move(d, { action: 'flip-ink' });
        continue;
      }
      for (const [i, side] of ['first', 'second'].entries()) {
        const n = p.node!;
        d.run({ type: 'EnterNode', node: n });
        d.run({ type: 'ChooseDialogueOption', node: n, index: i });
        expect(d.s.flags[F('tool.' + t.id)]).toBe(side);
      }
      expect(d.s.inventory[t.item]).toBe(1);
    }
    const key = 'cma:1955.320',
      prop = map.interactables.find((x) => x.id === 'petal-engraving')!,
      person = map.npcs.find((n) => n.id === 'petal-merian')!;
    expect(check(prop.visibleIf, d.s)).toBe(false);
    const object = d.e.pack.exhibits.find((o) => o.specimen?.key === key)!;
    d.s.objectivesDone.push(object.specimen!.objective);
    d.run({ type: 'InspectExhibit', exhibit: object.id });
    d.run({ type: 'ClaimSpecimen', exhibit: object.id });
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(key) });
    expect(check(prop.visibleIf, d.s)).toBe(true);
    d.walk('petal.plate', ['Hinge the artist']);
    d.walk('petal.plate', ['Slide the 1771']);
    d.walk('petal.plate', ['Bring the two stops']);
    expect(check(person.visibleIf, d.s)).toBe(true);
    for (const pick of ['Uncoil', 'Frame all']) d.talk('petal-merian', pick);
    expect(d.done('petal.plate')).toBe(true);
    expect(d.s.inventory[specimenItemId(key)]).toBe(1);
    expect(
      encyclopediaForCharacter(
        d.e.pack.characters.find((x) => x.id === person.id)!,
      )?.url,
    ).toBe('https://en.wikipedia.org/wiki/Maria_Sibylla_Merian');
    for (const ending of ['garden', 'silk'] as const) {
      d.s.mapId = petalMap;
      contact(d);
      watch(d);
      move(d, { action: 'show', ending });
      d.s.mapId = flowerAfterMap(ending);
      const bench = MAPS[d.s.mapId].npcs.find((p) => p.id === 'petal-merian')!;
      expect(check(bench.visibleIf, d.s)).toBe(true);
      for (const choice of ['Let the audience', 'Bring the dancer'])
        d.talk('petal-merian', choice);
      expect(d.done('petal.second-page')).toBe(true);
      expect(
        encyclopediaLinks(d.e.pack, d.s).some((link) =>
          link.url.endsWith('/Maria_Sibylla_Merian'),
        ),
      ).toBe(true);
    }
    const journal = adventureJournalView(
      d.e.pack,
      d.s,
      d.e.visibleObjectives(d.s),
    );
    const citation = journal.references.find((r) => r.key === key)!;
    expect(citation.text).toContain('1771');
    expect(citation.text).toContain('Poivre d’inde');
    expect(journal.references).toHaveLength(1);
    const file = unzipSync(
      adventureDocx(journal, {
        placeName: (id) => MAPS[id]?.name ?? id,
        includeNotes: true,
      }),
    );
    const links = strFromU8(file['word/_rels/document.xml.rels']);
    expect(links).toContain(
      'https://en.wikipedia.org/wiki/Maria_Sibylla_Merian',
    );
    expect(links).toContain(citation.url);
    expect(strFromU8(file['word/document.xml'])).toContain('Poivre d’inde');
    d.s.flags[carryFlag(key)] = false;
    expect(check(prop.visibleIf, d.s)).toBe(false);
    expect(check(person.visibleIf, d.s)).toBe(false);
  });
});
