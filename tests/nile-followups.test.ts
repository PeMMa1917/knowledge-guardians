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

describe('the closed slips by the workmen’s exit', () => {
  const stock = ['Turn over the stock', 'Put the slip back with its box'] as const;
  const reader = ['Turn over the lending', 'Put the slip back with both voices'] as const;

  it.each([
    ['workers stopping', stock, reader, 'Pin a “Delivery entered”', 'desk'],
    ['Lead with the payment', reader, stock, 'Leave a second voice', 'bench'],
  ] as const)('tests both meanings after %s and posts only the selected note', (lead, first, second, publish, placement) => {
    const d = new Driver();
    d.s.inventory['tool.provenance-thread'] = 1;
    d.s.mapId = 'nile.workyard';
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    const props = MAPS[d.s.mapId].interactables;
    const peg = props.find((prop) => prop.id === 'nile-closing-peg')!;
    const notes = () => props.filter((prop) => prop.kind === 'sign' && prop.id.startsWith('nile-closing-') && check(prop.visibleIf, d.s));
    expect(check(peg.visibleIf, d.s)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    for (const node of ['delay', 'payment', 'return']) d.run({ type: 'FollowThread', thread: 'nile-strike', node });
    d.talk('nile-leila', lead, 'Leave the opening slip');
    expect(d.done('nile.workers')).toBe(true);
    expect(d.done('nile.two')).toBe(false);
    expect(check(peg.visibleIf, d.s)).toBe(true);
    const xp = totalXP(d.p);
    const options = () => d.e.visibleOptions(peg.node!, d.s).map(({ option }) => option.text);

    d.walk(peg.node!, [...first, 'Leave the slips']);
    expect(options().some((text) => text.startsWith(first[0]))).toBe(false);
    expect(options()).not.toContain('Lay both slips beside the later stoppage.');
    expect(notes()).toEqual([]);

    d.walk(peg.node!, [...second, 'Lay both slips', 'Keep the slips together']);
    expect(d.done('nile.closing.post')).toBe(false);
    expect(d.e.node('nile.closing.compare').text).toContain('These three entries show work stopped again.');
    d.walk(peg.node!, ['Lay both slips', publish]);
    expect(d.done('nile.closing.post')).toBe(true);
    expect(notes().map(({ id }) => id)).toEqual([`nile-closing-${placement}`]);
    expect(notes()[0].text).toContain('Amunnakht');
    expect(options()).not.toContain('Lay both slips beside the later stoppage.');
    expect(d.done('nile.two')).toBe(false);
    expect(d.s.flags['nile.dispatch']).toBeUndefined();
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

describe('the tilt tray', () => {
  it.each([
    ['Set the tray level', 'Raise the same tray', 'Carry the two settings', 'cart'],
    ['Raise the same tray', 'Set the tray level', 'Keep the trial limits', 'map'],
  ])('compares the same block before putting up a %s note',
    (first, second, display, location) => {
      const d = new Driver();
      d.s.mapId = 'nile.route';
      d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
      expect(d.e.talkEntry('nile-marek', d.s)).toBe('nile.route-before');

      d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
      const xp = totalXP(d.p);
      d.talk('nile-marek', 'Try the tilt tray', first, 'Reset the tray', first, 'Leave the tray');
      expect(d.done('nile.tray.compare')).toBe(false);
      expect(d.e.visibleOptions('nile.tray.start', d.s).some(({ option }) => option.text.startsWith('Pin'))).toBe(false);
      expect(d.s.flags['nile.routeLead']).toBeUndefined();

      d.talk('nile-marek', 'Try the tilt tray', second, 'Pin a note', display);
      expect(d.done('nile.tray.compare')).toBe(true);
      expect(d.s.cards).not.toContain('card.nile.model');
      expect(totalXP(d.p)).toBe(xp);
      expect(MAPS['nile.route'].interactables
        .filter((prop) => prop.id.startsWith('nile-tilt-note-') && check(prop.visibleIf, d.s))
        .map((prop) => prop.id)).toEqual([`nile-tilt-note-${location}`]);

      d.run({ type: 'NileRouteTrial', road: 'ridge' });
      d.run({ type: 'NileRouteTrial', road: 'wash' });
      d.run({ type: 'NileDelivery', choice: 'copy' });
      expect(d.done('nile.routes')).toBe(true);
    });
});

describe('a name in two places', () => {
  it.each([
    ['index', 'Add a cross-index', false],
    ['slips', 'Send one slip to each room', true],
  ] as const)('uses both dated records and the keepers’ limits before filing by %s', (filing, pick, finishedLeads) => {
    const d = new Driver();
    d.s.flags['nile.arrived'] = true;
    d.s.flags['nile.dispatch'] = 'print';
    d.s.flags['nile.returned'] = true;
    d.s.inventory['tool.date-lens'] = 1;
    if (finishedLeads) d.s.objectivesDone.push('nile.workers', 'nile.routes');
    const choices = (who: string) => d.e.visibleOptions(d.e.talkEntry(who, d.s)!, d.s)
      .map(({ option }) => option.next);
    expect(choices('nile-iman')).not.toContain('nile.name.invite');

    d.s.mapId = 'nile.workyard';
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    d.run({ type: 'UseLens', exhibit: 'OBJ-NILE-STRIKE' });
    d.s.mapId = 'nile.hall';
    d.talk('nile-iman', 'Check the visitor’s link');
    expect(d.done('nile.name.read')).toBe(false);
    expect(choices('nile-leila')).not.toContain('nile.name.workers');
    expect(choices('nile-iman')).not.toContain('nile.name.desk');

    d.s.mapId = 'nile.route';
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    expect(d.done('nile.name.read')).toBe(false);
    d.run({ type: 'UseLens', exhibit: 'OBJ-NILE-MINE' });
    expect(d.done('nile.name.read')).toBe(true);
    d.talk('nile-marek', 'Check what the museum');
    expect(d.done('nile.name.voices')).toBe(false);
    expect(choices('nile-iman')).not.toContain('nile.name.desk');

    d.s.mapId = 'nile.workyard';
    d.talk('nile-leila', 'Ask how the papyrus');
    expect(d.done('nile.name.voices')).toBe(true);
    d.s.mapId = 'nile.hall';
    const xp = totalXP(d.p);
    d.talk('nile-iman', 'Bring the two keepers', pick);
    expect(d.done('nile.name.file')).toBe(true);
    expect(d.s.flags['nile.name.filing']).toBe(filing);
    expect(d.s.flags['nile.dispatch']).toBe('print');
    expect(totalXP(d.p)).toBe(xp);
    expect(choices('nile-iman')).toContain(`nile.name.${filing}`);
    expect(choices('nile-iman')).not.toContain('nile.name.desk');
    expect(choices('nile-leila').includes('nile.name.slip.workers')).toBe(filing === 'slips');
    expect(choices('nile-marek').includes('nile.name.slip.map')).toBe(filing === 'slips');
  });
});

describe('the third groove', () => {
  it.each([
    ['Leave a guide beside', 'desk', 'nile.workyard'],
    ['Send the paired view notes', 'copy', 'nile.hall'],
  ])('restores the original view before making the %s record', (pick, placement, room) => {
    const d = new Driver();
    d.run({ type: 'SetFlag', flag: 'nile.arrived', value: true });
    d.s.mapId = 'nile.workyard';
    const slip = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'nile-lamp-slip')!;
    const visiblePlacements = () => Object.values(MAPS).flatMap((map) => map.interactables
      .filter((prop) => prop.id.startsWith('nile-lamp-note-') && check(prop.visibleIf, d.s))
      .map((prop) => [prop.id, map.id]));
    expect(check(slip.visibleIf, d.s)).toBe(false);
    expect(visiblePlacements()).toEqual([]);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    expect(check(slip.visibleIf, d.s)).toBe(true);
    expect(d.e.visibleOptions(slip.node!, d.s).map(({ option }) => option.next))
      .toEqual(['nile.lamp.above', undefined]);

    const xp = totalXP(d.p);
    d.walk(slip.node!, ['Look down with the lamp above', 'Leave the lamp above']);
    expect(d.s.flags['nile.lamp.phase']).toBe('above');
    expect(d.done('nile.lamp.compare')).toBe(false);
    d.walk(slip.node!, ['Move the lamp to the side', 'Leave the lamp to the side']);
    expect(d.s.flags['nile.lamp.phase']).toBe('side');
    expect(slip.artBy?.keys.side).toBe('nile.lamp-side');
    expect(d.done('nile.lamp.compare')).toBe(false);
    expect(d.e.visibleOptions('nile.lamp.repeat', d.s).map(({ option }) => option.next)).toEqual([undefined]);
    d.walk(slip.node!, ['Return the lamp above', 'Leave the readings ready']);
    expect(d.s.flags['nile.lamp.phase']).toBe('repeat');
    expect(slip.art).toBe('nile.lamp-above');
    expect(d.done('nile.lamp.compare')).toBe(true);
    expect(d.done('nile.lamp.file')).toBe(false);

    d.walk(slip.node!, ['Set out the two readings', pick]);
    expect(d.done('nile.lamp.file')).toBe(true);
    expect(visiblePlacements()).toEqual([[`nile-lamp-note-${placement}`, room]]);
    expect(d.s.flags['nile.dispatch']).toBeUndefined();
    expect(d.done('nile.workers')).toBe(false);
    expect(totalXP(d.p)).toBe(xp);
  });
});
