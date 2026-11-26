import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const shelf = MAPS['nexus.archive'].interactables.filter((item) => item.id.startsWith('nexus.ferry.'));
const visibleShelf = (d: Driver) => shelf.filter((item) => check(item.visibleIf, d.s)).map((item) => item.node);
const shelfChoices = (d: Driver) => d.e.visibleOptions('nexus.ferry.shelf', d.s).map(({ option }) => option.text);

function volunteer(d: Driver): void {
  d.talk('villager-2', 'outside the hall', 'help put a copy');
}

function lensDate(d: Driver, exhibit: string): void {
  d.run({ type: 'InspectExhibit', exhibit });
  d.run({ type: 'UseLens', exhibit });
}

const notes = MAPS['aethelgard.ferry'].interactables.filter((item) => item.id.startsWith('ferry-copy-'));
const visibleNotes = (d: Driver) => notes.filter((item) => check(item.visibleIf, d.s)).map((item) => item.node);

const preparations = [
  {
    packet: 'dates', text: 'Clip the patent grant', followup: 'Unclip the two dated records',
    prepare(d: Driver) {
      d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
      d.talk('warden-ise', 'How can all three');
      lensDate(d, 'OBJ-001-A');
      expect(shelfChoices(d)).not.toContainEqual(expect.stringContaining(this.text));
      lensDate(d, 'OBJ-001-C');
    },
  },
  {
    packet: 'strips', text: "Pin the model's paper strip", followup: 'Lift the two strips',
    prepare(d: Driver) {
      d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
      expect(shelfChoices(d)).not.toContainEqual(expect.stringContaining(this.text));
      d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'leather' });
    },
  },
  {
    packet: 'proofs', detail: 'date', text: 'Pack the revised caption', followup: 'Turn over the translation proofs',
    prepare(d: Driver) {
      d.walk('nexus.translation-slip', ['Clip on the grant record']);
    },
  },
  {
    packet: 'proofs', detail: 'gloss', text: 'Pack both proofs', followup: 'Open the fold with both words',
    prepare(d: Driver) {
      d.walk('nexus.translation-slip', ['Clip the two slips']);
    },
  },
];

describe('A Copy for the Ferry', () => {
  it('leaves the main route and the shelf alone unless the player volunteers', () => {
    const d = new Driver();
    expect(visibleShelf(d)).toEqual([]);
    d.talk('villager-2', 'outside the hall', 'See you in the hall');
    expect(visibleShelf(d)).toEqual([]);
    expect(d.e.currentObjective(d.s)?.id).toBe('m01.o1.look');

    volunteer(d);
    expect(visibleShelf(d)).toEqual(['nexus.ferry.shelf']);
    expect(shelfChoices(d)).toEqual(['Look at what can go in the envelope.', 'Leave it for now.']);
    expect(d.e.currentObjective(d.s)?.id).toBe('m01.o1.look');
    expect(d.done('nexus.ferry.published')).toBe(false);
  });

  it('keeps the existing landing conversation available on a save without the packet', () => {
    const d = new Driver();
    d.s.mapId = 'aethelgard.ferry';
    expect(visibleNotes(d)).toEqual([]);
    expect(d.e.visibleOptions(d.e.talkEntry('ferry-tova', d.s)!, d.s).map(({ option }) => option.text))
      .not.toContain('Did our Nexus packet reach the landing?');
    d.talk('ferry-tova', 'What does the town get wrong', 'Goodbye');
    expect(d.s.flags['ferry.met']).toBe(true);
  });

  it.each(preparations)('holds $text until it is sent and shows either edition afterwards', (route) => {
    for (const [edition, destination] of [
      ['copies', 'Put copies by the rack'],
      ['reading', 'Ask the landing reader'],
    ] as const) {
      const d = new Driver();
      volunteer(d);
      route.prepare(d);
      expect(shelfChoices(d)).toContainEqual(expect.stringContaining(route.text));
      const previousCredit = d.p.credit;
      d.walk('nexus.ferry.shelf', [route.text, 'Leave the packet here']);
      expect(d.s.flags['nexus.ferry.packet']).toBe(route.packet);
      expect(d.s.flags['nexus.ferry.proof']).toBe(route.detail);
      expect(d.done('nexus.ferry.published')).toBe(false);
      expect(visibleShelf(d)).toEqual(['nexus.ferry.dispatch']);

      d.walk('nexus.ferry.dispatch', [destination, route.followup]);
      expect(d.done('nexus.ferry.published')).toBe(true);
      expect(d.p.credit).toEqual(previousCredit);
      expect(visibleShelf(d)).toEqual([`nexus.ferry.${edition}`]);
      expect(d.e.visibleOptions('nexus.ferry.dispatch', d.s).map(({ option }) => option.text))
        .toEqual(['Leave the packet here for a moment.']);
      const oldWeave = d.p.met;
      d.talk('villager-2', 'next reader', route.followup);
      expect(d.p.met).toEqual(oldWeave);

      d.s.mapId = 'aethelgard.ferry';
      expect(visibleNotes(d)).toEqual([]);
      const [place, placeText] = edition === 'copies'
        ? ['ledger', 'File the note']
        : ['slate', 'Clip the note'];
      d.talk('ferry-tova', 'Did our Nexus packet reach', "I can come back");
      expect(visibleNotes(d)).toEqual([]);
      d.talk('ferry-tova', 'Did our Nexus packet reach', 'What happened', placeText);
      expect(d.s.flags[`node.tova.nexus-copy.${route.packet}`]).toBe(true);
      expect(d.s.flags['nexus.ferry.edition']).toBe(edition);
      expect(visibleNotes(d)).toEqual([`tova.nexus-copy.${place}`]);
      d.talk('ferry-tova', 'Show me where you kept');
      expect(visibleNotes(d)).toEqual([`tova.nexus-copy.${place}`]);
    }
  });
});
