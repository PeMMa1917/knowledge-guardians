import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { totalXP } from '../src/domain/permanent';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const cases: { dispatch: string; reply: string; proof: string; placements: [string, string, string][] }[] = [
  {
    dispatch: 'print', reply: 'nile.royal', proof: 'nile.workyard',
    placements: [
      ['Hang a hinged copy', 'print-hinge', 'nile.royal'],
      ['Send folded copies', 'print-fold', 'nile.hall'],
    ],
  },
  {
    dispatch: 'read', reply: 'nile.workyard', proof: 'nile.route',
    placements: [
      ['Keep the paired slips', 'read-table', 'nile.workyard'],
      ['Put a two-reader copy', 'read-voices', 'nile.hall'],
    ],
  },
  {
    dispatch: 'pair', reply: 'nile.route', proof: 'nile.royal',
    placements: [
      ['Tie the run card', 'pair-bench', 'nile.route'],
      ['File the source', 'pair-ledger', 'nile.royal'],
    ],
  },
];
const props = Object.values(MAPS).flatMap((room) => room.interactables
  .filter((prop) => /^(nile-(reply|proof)-)/.test(prop.id))
  .map((prop) => ({ room: room.id, ...prop })));

const visible = (d: Driver) => props.filter((prop) => check(prop.visibleIf, d.s));

describe('a slip comes back', () => {
  it('opens after returning the first packet and keeps earlier saves playable', () => {
    const d = new Driver();
    expect(visible(d)).toEqual([]);
    d.run({ type: 'SetFlag', flag: 'nile.dispatch', value: 'read' });
    expect(visible(d)).toEqual([]);
    expect(d.e.visibleOptions('nile.dispatch-return', d.s)).toEqual([]);
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    expect(visible(d).map((prop) => prop.id)).toEqual(['nile-reply-read']);
    expect(d.e.visibleObjectives(d.s).some((o) => o.id === 'nile.reply.compare')).toBe(true);
  });

  for (const { dispatch, reply, proof, placements } of cases) {
    it.each(placements)(`${dispatch}: %s places a persistent copy`, (pick, destination, room) => {
      const d = new Driver();
      // Resume from an older save after Warden Ise displayed the first packet.
      d.s.flags['nile.dispatch'] = dispatch;
      d.s.flags['nile.returned'] = true;
      d.s.mapId = 'nile.hall';
      const xp = totalXP(d.p);

      d.talk('nile-iman', 'Where did a reader send');
      expect(visible(d).map((prop) => [prop.id, prop.room])).toEqual([[`nile-reply-${dispatch}`, reply]]);
      expect(d.done('nile.reply.compare')).toBe(false);

      d.s.mapId = reply;
      d.run({ type: 'ReadClue', clue: `nile-reply-${dispatch}` });
      expect(visible(d).find((prop) => prop.id === `nile-proof-${dispatch}`)?.room).toBe(proof);
      expect(d.done('nile.reply.compare')).toBe(false);

      d.s.mapId = proof;
      d.run({ type: 'ReadClue', clue: `nile-proof-${dispatch}` });
      expect(d.done('nile.reply.compare')).toBe(true);
      expect(d.done('nile.reply.place')).toBe(false);

      d.s.mapId = 'nile.hall';
      d.talk('nile-iman', 'Put our paired copy', 'Leave both copies');
      expect(d.done('nile.reply.place')).toBe(false);
      d.talk('nile-iman', 'Put our paired copy', pick);
      expect(d.done('nile.reply.place')).toBe(true);
      expect(d.s.flags['nile.dispatch']).toBe(dispatch);
      expect(visible(d).filter((prop) => prop.id.startsWith('nile-reply-outcome-')).map((prop) =>
        [prop.id, prop.room])).toEqual([[`nile-reply-outcome-${destination}`, room]]);
      expect(d.e.visibleOptions('nile.dispatch-return', d.s).map(({ option }) => option.text))
        .toEqual(['Leave the archive open.']);
      expect(totalXP(d.p)).toBe(xp);
    });
  }
});

describe('the borrowed mark', () => {
  it.each([
    ['tag', 'received'],
    ['cloth', 'shared'],
  ])('shares evidence from the %s without appointing a maker', (subject, criterion) => {
    const d = new Driver();
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    d.s.mapId = 'nile.hall';
    const mark = MAPS['nile.hall'].interactables.find((prop) => prop.id === 'nile-mark-tag');
    const cloth = MAPS['nile.workyard'].interactables.find((prop) => prop.id === 'nile-mark-swatch');
    expect(mark?.exhibit).toBeTruthy();
    expect(cloth?.exhibit).toBeTruthy();
    d.run({ type: 'InspectExhibit', exhibit: mark!.exhibit! });
    const kit = 'nile-borrowed-mark';
    d.run({ type: 'BuildLabel', kit, subject: 'tag', criterion: 'first', limit: 'open' });
    expect(d.s.flags[`label.${kit}.holds`]).toBe(false);
    expect(d.done('nile.mark.publish')).toBe(false);

    d.s.mapId = 'nile.workyard';
    d.run({ type: 'InspectExhibit', exhibit: cloth!.exhibit! });
    d.s.mapId = 'nile.hall';
    const xp = totalXP(d.p);
    d.run({ type: 'BuildLabel', kit, subject, criterion, limit: 'open' });
    expect(d.done('nile.mark.publish')).toBe(true);
    expect(d.s.flags['nile.dispatch']).toBeUndefined();
    expect(MAPS['nile.hall'].interactables
      .filter((prop) => prop.id.startsWith('nile-mark-') && prop.id.endsWith('-copy') && check(prop.visibleIf, d.s))
      .map((prop) => prop.id)).toEqual([`nile-mark-${subject}-copy`]);
    expect(totalXP(d.p)).toBe(xp);
  });
});

describe('the reading window', () => {
  it.each([
    ['workers stopping', 'voices', 'Hang both ways', 'pair'],
    ['Lead with the payment', 'payment', 'Keep the reading window', 'fold'],
  ])('turns the clips after choosing %s and preserves the dispatch option', (pick, lead, placement, display) => {
    const d = new Driver();
    d.s.mapId = 'nile.workyard';
    d.s.inventory['tool.provenance-thread'] = 1;
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    for (const node of ['delay', 'payment', 'return']) d.run({ type: 'FollowThread', thread: 'nile-strike', node });

    // The completed investigation remains available on its original conditions.
    d.talk('nile-leila', pick, 'Leave the opening');
    expect(d.done('nile.workers')).toBe(true);
    expect(d.done('nile.workers.proof')).toBe(false);
    expect(d.s.flags['nile.workerLead']).toBe(lead);

    const xp = totalXP(d.p);
    d.talk('nile-leila', 'Try the two readings', 'Turn the clips', 'Ask Leila how', placement);
    expect(d.done('nile.workers.proof')).toBe(true);
    expect(d.s.flags['nile.workerLead']).toBe(lead);
    expect(MAPS['nile.workyard'].interactables
      .filter((prop) => prop.id.startsWith('nile-window-') && check(prop.visibleIf, d.s))
      .map((prop) => prop.id)).toEqual([`nile-window-${display}`]);
    expect(totalXP(d.p)).toBe(xp);
  });
});

describe('the seal on the copy', () => {
  it.each([
    ['Move the seal to the catalogue', 'catalogue'],
    ['Move the seal under', 'docket'],
  ])('places a check where it can be traced after both Lens readings: %s', (pick, destination) => {
    const d = new Driver();
    d.s.mapId = 'nile.royal';
    d.s.inventory['tool.date-lens'] = 1;
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    const props = MAPS['nile.royal'].interactables.filter(({ id }) =>
      id.startsWith('nile-royal-seal-') || id.endsWith('-caption'));
    const visibleIds = () => props.filter(({ visibleIf }) => check(visibleIf, d.s)).map(({ id }) => id);
    const canMoveSeal = () => d.e.visibleOptions(d.e.talkEntry('nile-nasir', d.s)!, d.s)
      .some(({ option }) => option.text.startsWith('Move the seal'));
    expect(visibleIds()).toEqual([]);

    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-SALLIER' });
    d.run({ type: 'UseLens', exhibit: 'OBJ-NILE-SALLIER' });
    expect(visibleIds()).toEqual([]);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-TREATY' });
    d.run({ type: 'UseLens', exhibit: 'OBJ-NILE-TREATY' });
    expect(visibleIds()).toEqual(['nile-royal-seal-backing']);
    expect(canMoveSeal()).toBe(false);

    d.run({ type: 'ReadClue', clue: 'nile-royal-seal-backing' });
    expect(canMoveSeal()).toBe(true);
    const xp = totalXP(d.p);
    d.talk('nile-nasir', 'Move the seal to what', pick);
    expect(visibleIds()).toEqual([
      `nile-royal-seal-${destination}`,
      'nile-royal-papyrus-caption',
      'nile-royal-treaty-caption',
    ]);
    expect(d.done('nile.royal.seal')).toBe(true);
    expect(d.done('nile.diplomacy')).toBe(false);
    expect(totalXP(d.p)).toBe(xp);

    d.run({ type: 'BuildLabel', kit: 'nile-qadesh', subject: 'poem', criterion: 'account', limit: 'qualified' });
    expect(d.done('nile.diplomacy')).toBe(true);
    expect(canMoveSeal()).toBe(true);
  });
});
