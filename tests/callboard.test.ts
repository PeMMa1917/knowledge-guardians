import { describe, expect, it } from 'vitest';
import { CALLBOARD_CASES, CALLBOARD_SHORT, GAGE, QUETZALECATZIN, callboardEntries } from '../src/content/callboardCases';
import { DATE_REGISTER_CASES } from '../src/content/dateRegisterCases';
import { callboardLayout } from '../src/domain/callboard';
import { check } from '../src/domain/rules';
import { specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function visible(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}
function move(d: Driver, id: string) {
  const to = visible(d, id);
  if (!to?.to || !check(to.openIf, d.s)) throw new Error('Passage closed: ' + id);
  d.s.mapId = to.to.map;
}
function enter(d: Driver) {
  d.s.mapId = 'civic.dispatch';
  d.s.objectivesDone.push('civic.finish');
  move(d, 'civic-callboard-door');
}

describe('The Callboard Turn', () => {
  it('has different complete first reads and a folio-backed short route that changes Neris’s position', () => {
    expect(callboardLayout('bench').first).toEqual(['view', 'record']);
    expect(callboardLayout('separate')).toMatchObject({ first: ['view'], second: ['record'] });
    const d = new Driver();
    d.s.mapId = 'civic.dispatch';
    expect(visible(d, 'civic-callboard-door')).toBeUndefined();
    enter(d);
    expect(visible(d, 'callboard-seal-folio')).toBeUndefined();
    expect(() => move(d, 'callboard-short-passage')).toThrow(/closed/);
    const actor = () => MAPS['civic.callboard'].npcs.find((npc) => npc.id === 'callboard-reader' && check(npc.visibleIf, d.s));
    expect(actor()?.x).toBe(7);
    const signed = DATE_REGISTER_CASES[0];
    d.s.inventory[signed.item] = 1;
    expect(visible(d, 'callboard-seal-folio')).toBeUndefined();
    d.s.objectivesDone.push(signed.civicObjective);
    d.walk(visible(d, 'callboard-seal-folio')!.node!, ['File the signed folio']);
    expect(check(CALLBOARD_SHORT, d.s)).toBe(true);
    move(d, 'callboard-short-passage');
    expect(actor()?.x).toBe(33);
  });

  it.each(CALLBOARD_CASES)('earns and reuses the exact $accession after each possible route', (record) => {
    for (const [layout, pick] of [['bench', 2], ['separate', 3]] as const) {
      const d = new Driver();
      const choose = (node: string, index: number) => d.run({ type: 'ChooseDialogueOption', node, index });
      enter(d);
      expect(visible(d, `callboard-case-${record.slug}`)?.exhibit).toBe(record.artifact);
      expect(callboardEntries(visible(d, `callboard-${record.slug}`)!.game!)).toEqual([record.nodes.check]);
      expect(() => choose(record.nodes.check, 0)).toThrow(/not available/);
      d.run({ type: 'InspectExhibit', exhibit: record.artifact });
      choose(record.nodes.check, 0);
      expect(() => choose(record.nodes.check, pick)).toThrow(/not available/);
      choose(record.nodes.check, 1);
      choose(record.nodes.check, pick);
      expect(d.s.inventory[record.item]).toBe(1);
      expect(() => d.run({ type: 'ClaimSpecimen', exhibit: record.artifact })).toThrow(/Finish the object/);
      if (layout === 'separate') {
        expect(() => choose(record.nodes.second, 0)).toThrow(/not available/);
        choose(record.nodes.first, 1);
        expect(d.done(record.objective)).toBe(false);
        choose(record.nodes.second, 0);
      } else choose(record.nodes.first, 0);
      expect(d.done(record.objective)).toBe(true);
      expect(d.s.flags[`${record.flag}.heard`]).toBe(layout);
      d.run({ type: 'ClaimSpecimen', exhibit: record.artifact });
      expect(d.s.inventory[specimenItemId(record.key)]).toBe(1);
      d.s.mapId = record.revisit.map;
      expect(visible(d, record.revisit.prop)).toBeUndefined();
      d.run({ type: 'EquipPerspective', keepsake: specimenToolId(record.key) });
      expect(visible(d, record.revisit.prop)).toBeDefined();
      choose(record.nodes.return, 0);
      expect(() => choose(record.nodes.return, 2)).toThrow(/not available/);
      choose(record.nodes.return, 1);
      choose(record.nodes.return, 2);
      expect(d.s.flags[`${record.flag}.returned`]).toBe(true);
      if (record.key === QUETZALECATZIN) expect(record.revisit.map).toBe('sea.chartroom');
      if (record.key === GAGE) expect(record.revisit.map).toBe('metalworks.records');
    }
  });
});
