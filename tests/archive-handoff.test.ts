import { describe, expect, it } from 'vitest';
import { totalXP } from '../src/domain/permanent';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const nile = 'nile.hall';
const cold = 'preserved.archive';
const item = 'item.handoff-copy';
const dispatch = {
  open: 'Split the stamp line',
  fold: 'Fold the open review',
  left: 'Leave the slip with Nellis',
};
const response = {
  public: 'Pin the source and its open question',
  desk: 'Open a source check at the staffed desk',
  leave: 'Leave Nellis the receipt and decline',
};

function visit(d: Driver, id: string): void {
  const door = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'door' && p.id === id);
  if (!door?.to || !check(door.visibleIf, d.s) || !check(door.openIf, d.s)) throw new Error(`Cannot use ${id} here`);
  if (door.flag) d.run({ type: 'SetFlag', flag: door.flag, value: true });
  d.s.mapId = door.to.map;
}

function read(d: Driver, id: string): void {
  const prop = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'sign' && p.id === id);
  if (!prop?.flag || !check(prop.visibleIf, d.s)) throw new Error(`Cannot read ${id} here`);
  d.run({ type: 'SetFlag', flag: prop.flag, value: true });
}

function showsNellis(d: Driver, map: string): boolean {
  const npc = MAPS[map].npcs.find((n) => n.id === 'handoff-nellis');
  return !!npc && check(npc.visibleIf, d.s);
}

describe('The runner moves from the Nile Archive to the Cold Store', () => {
  const routes = (['open', 'fold', 'left'] as const).flatMap((first) =>
    (['public', 'desk', 'leave'] as const).map((second) => ({ first, second })));

  it.each(routes)('carries the $first decision into the $second decision', ({ first, second }) => {
    const d = new Driver();
    d.s.mapId = nile;
    d.s.flags['nile.arrived'] = true;
    d.s.inventory['tool.provenance-thread'] = 1;
    expect(showsNellis(d, nile)).toBe(false);
    visit(d, 'nile-workers');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    for (const node of ['delay', 'payment', 'return']) d.run({ type: 'FollowThread', thread: 'nile-strike', node });
    d.talk('nile-leila', 'Lead with the workers', 'Leave the opening slip');
    expect(showsNellis(d, nile)).toBe(true);
    read(d, 'nile-handoff-sequence');
    expect(d.done('nile.handoff.check')).toBe(false);
    visit(d, 'workyard-back');
    expect(d.e.talkEntry('handoff-nellis', d.s)).toBe('nile.handoff.start');
    read(d, 'nile-handoff-draft');
    expect(d.done('nile.handoff.check')).toBe(true);

    const credit = totalXP(d.p);
    d.talk('handoff-nellis', 'I’ll come back to the stamp');
    expect(d.s.flags['nile.handoff.mode']).toBeUndefined();
    d.talk('handoff-nellis', dispatch[first]);
    expect(d.s.flags['nile.handoff.mode']).toBe(first);
    read(d, `nile-handoff-${first}`);
    expect(d.done('nile.handoff.send')).toBe(true);
    expect(d.s.inventory[item]).toBe(first === 'left' ? undefined : 1);
    expect(totalXP(d.p)).toBe(credit);

    visit(d, 'nile-nexus');
    expect(() => visit(d, 'preserved-door')).toThrow(/Cannot use/);
    // Resume a main-arc completion without driving either of its unrelated conversations.
    d.run({ type: 'SetFlag', flag: 'nile.dispatch', value: 'read' });
    d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
    visit(d, 'preserved-door');
    expect(showsNellis(d, cold)).toBe(true);
    expect(showsNellis(d, nile)).toBe(false);
    expect(d.e.talkEntry('handoff-nellis', d.s)).toBe(`preserved.handoff.start.${first}`);
    expect(() => visit(d, 'preserved-door-inquiry')).toThrow(/Cannot use/);
    d.talk('handoff-nellis', first === 'left' ? 'Ask Nellis for the receiving' : 'Unfold the carrier copy');
    read(d, 'preserved-handoff-receipt');
    expect(d.e.talkEntry('handoff-nellis', d.s)).toBe('preserved.handoff.work');

    d.run({ type: 'SetFlag', flag: 'preserved.display', value: 'paired' });
    visit(d, 'preserved-door-inquiry');
    const trays = MAPS[d.s.mapId].interactables.find((p) => p.id === 'preserved-handoff-file')!;
    expect(check(trays.visibleIf, d.s)).toBe(false);
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-PRES-TUT-WORKFORCE' });
    expect(check(trays.visibleIf, d.s)).toBe(true);
    expect(d.done('preserved.handoff.scope')).toBe(false);
    d.walk(trays.node!, ['Clip the excavation source']);
    expect(d.done('preserved.handoff.scope')).toBe(true);
    visit(d, 'preserved-inquiry-back');

    const creditAtResponse = totalXP(d.p);
    d.talk('handoff-nellis', response[second]);
    const layout = MAPS[cold].interactables
      .filter(({ id, visibleIf }) => /^preserved-handoff-(public|desk|leave)$/.test(id) && check(visibleIf, d.s));
    expect(layout.map(({ id }) => id)).toEqual([`preserved-handoff-${second}`]);
    expect(d.done('preserved.handoff.respond')).toBe(false);
    read(d, layout[0].id);
    expect(d.done('preserved.handoff.respond')).toBe(true);
    expect(d.s.flags['nile.dispatch']).toBe('read');
    expect(d.s.flags['preserved.display']).toBe('paired');
    expect(totalXP(d.p)).toBe(creditAtResponse);
  });

  it('lets a player who already visited the Cold Store start the Nile encounter later', () => {
    const d = new Driver();
    d.s.mapId = nile;
    d.s.flags['preserved.arrived'] = true;
    d.s.objectivesDone.push('nile.workers');
    expect(showsNellis(d, cold)).toBe(false);
    expect(showsNellis(d, nile)).toBe(true);
    expect(d.e.talkEntry('handoff-nellis', d.s)).toBe('nile.handoff.start');
  });
});
