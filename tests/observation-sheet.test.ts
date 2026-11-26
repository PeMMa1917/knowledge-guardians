import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { migrateCampaign } from '../src/domain/saves';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

function spot(d: Driver, id: string) {
  return MAPS[d.s.mapId].interactables.find((prop) => prop.id === id && check(prop.visibleIf, d.s));
}

function visit(d: Driver, id: string) {
  const door = spot(d, id);
  expect(door?.to, id).toBeDefined();
  expect(check(door?.openIf, d.s)).toBe(true);
  d.s.mapId = door!.to!.map;
  if (door!.flag) d.run({ type: 'SetFlag', flag: door!.flag, value: true });
}

function scene(d: Driver, id: string, ...choices: string[]) {
  const target = spot(d, id);
  expect(target?.node, id).toBeDefined();
  d.walk(target!.node!, choices);
}

function begin() {
  const d = new Driver();
  expect(spot(d, 'forest-door')).toBeUndefined();
  d.s.objectivesDone.push('coast.revise');
  visit(d, 'forest-door');
  expect(d.done('forest.arrival')).toBe(true);
  scene(d, 'forest-hands-board', 'Run the three-mark', 'Leave the frame');
  return d;
}

function exhibit(d: Driver, second = false) {
  const target = spot(d, second ? 'forest-gombe-context' : 'forest-gombe-field-notes');
  d.run({ type: 'InspectExhibit', exhibit: target!.exhibit! });
}

function readBoth(d: Driver, layout: 'separate' | 'relay') {
  scene(d, 'forest-hands-front', 'Mark all three');
  scene(d, 'forest-hands-side', 'Lift the side cover');
  scene(d, 'forest-hands-board', 'Move the recorder', 'Leave the frame');
  scene(d, 'forest-hands-side', 'Take the moved seat');
  exhibit(d);
  exhibit(d, true);
  scene(d, 'forest-hands-board', 'Set the two dated Gombe');
  visit(d, 'forest-community-path');
  scene(d, 'forest-hands-receiver', layout === 'separate' ? 'Clip a separate record' : 'Move the recorder');
}

describe('Two Hands on the Sheet', () => {
  it('keeps the limited first record when a later position permits a fuller reading', () => {
    const d = begin();
    scene(d, 'forest-hands-side', 'Lift the side cover');
    expect(d.done('forest.hands.first')).toBe(false);
    expect(d.e.visibleOptions(spot(d, 'forest-hands-board')!.node!, d.s).every(({option}) => !option.text.startsWith('Move the recorder'))).toBe(true);
    scene(d, 'forest-hands-front', 'Mark all three');
    expect(d.done('forest.hands.first')).toBe(true);
    d.s = migrateCampaign(structuredClone(d.s)).state;
    scene(d, 'forest-hands-board', 'Move the recorder', 'Leave the frame');
    scene(d, 'forest-hands-side', 'Take the moved seat');
    expect(d.done('forest.hands.retry')).toBe(true);
    expect(d.s.flags['forest.hands.side']).toBe(true);
    exhibit(d);
    expect(d.e.visibleOptions('forest.hands.board', d.s).every(({option}) => !option.text.startsWith('Set the two dated'))).toBe(true);
    exhibit(d, true);
    scene(d, 'forest-hands-board', 'Set the two dated Gombe');
    expect(d.done('forest.hands.context')).toBe(true);
    expect(d.done('forest.gombe-credit')).toBe(false);
    expect(d.done('forest.compare')).toBe(false);
  });

  it.each(['separate','relay'] as const)('keeps the %s handover and makes the notebook useful in the House', (layout) => {
    const d = begin();
    readBoth(d, layout);
    expect(d.done('forest.hands.kept')).toBe(true);
    expect(d.s.flags['forest.hands.layout']).toBe(layout);
    visit(d, 'forest-bridge-to-trail');
    for (const site of ['creek','ridge'] as const) {
      for (const window of ['early','late'] as const) d.run({ type:'ObserveForest', site, window });
    }
    visit(d, 'forest-trail-back');
    d.talk('forest-naturalist', 'under the same watch');
    d.talk('forest-naturalist', 'put the Gombe team back');
    expect(d.done('forest.gombe-credit')).toBe(true);
    scene(d, 'forest-observer-book', 'Stitch in a first section for the limits');
    expect(d.s.flags['keepsake.observer-notebook']).toBe(true);
    visit(d, 'forest-nexus-return');
    d.s.objectivesDone.push('sea.finish');
    visit(d, 'stage-door');
    visit(d, 'stage-rehearsal-path');
    expect(spot(d, 'stage-hands-prompt')).toBeUndefined();
    d.run({ type:'EquipPerspective', keepsake:'observer-notebook' });
    scene(d, 'stage-hands-prompt', 'Give the two knocks');
    expect(d.done('stage.hands.compare')).toBe(false);
    visit(d, 'stage-rehearsal-to-gallery');
    expect(spot(d, 'stage-hands-plan')).toBeUndefined();
    d.run({ type:'EquipPerspective', keepsake:null });
    expect(spot(d, 'stage-hands-floor')).toBeUndefined();
    d.run({ type:'EquipPerspective', keepsake:'observer-notebook' });
    scene(d, 'stage-hands-floor', 'Follow the pin');
    expect(d.done('stage.hands.compare')).toBe(true);
    scene(d, 'stage-hands-plan', layout === 'separate' ? 'Let the gallery helper' : 'Have the caller wait');
    expect(d.done('stage.hands.served')).toBe(true);
    expect(d.s.flags['stage.hands.used']).toBe(layout === 'separate' ? 'helper' : 'caller');
    expect(d.done('stage.compare')).toBe(false);
  });

  it('keeps the two public source dates, limits and credited work independently identified', () => {
    const pack = buildPack();
    const observation = pack.cards.find((card) => card.id === 'card.forest.gombe')!;
    const team = pack.cards.find((card) => card.id === 'card.forest.team')!;
    expect(observation.sources).toEqual(['HIS-S17']);
    expect(team.sources).toEqual(['HIS-S18']);
    expect(observation.text).toMatch(/Goodall.*Gombe.*1960/);
    expect(team.text).toMatch(/Tanzanian.*Baraka Daniel.*data/);
    expect(team.limits).toContain('who was present at the 1960 observation');
    expect(pack.dialogue.find((item) => item.id === 'forest.hands.sources')?.historicalLabel).toBe('fictional-world');
  });
});
