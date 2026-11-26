import { describe, expect, it } from 'vitest';
import { buildPack } from '../src/content';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { Driver } from './driver';

const rule = 'edge-rule';

function prop(d: Driver, id: string) {
  const item = MAPS[d.s.mapId].interactables.find((candidate) => candidate.id === id);
  expect(item, id).toBeDefined();
  return item!;
}

function visible(d: Driver, id: string) {
  return check(prop(d, id).visibleIf, d.s);
}

function cross(d: Driver, id: string) {
  const item = prop(d, id);
  expect(visible(d, id) && check(item.openIf, d.s), id).toBe(true);
  expect(item.to, id).toBeDefined();
  if (item.flag) d.run({ type: 'SetFlag', flag: item.flag, value: true });
  d.s.mapId = item.to!.map;
}

function inspect(d: Driver, id: string) {
  expect(visible(d, id), id).toBe(true);
  d.run({ type: 'InspectExhibit', exhibit: prop(d, id).exhibit! });
}

function scene(d: Driver, id: string, ...choices: string[]) {
  expect(visible(d, id), id).toBe(true);
  d.walk(prop(d, id).node!, choices);
}

function start() {
  const d = new Driver();
  d.s.flags['nile.returned'] = true;
  d.s.flags['preserved.display'] = 'paired';
  d.s.flags['stage.response'] = 'pause';
  d.s.objectivesDone.push('sea.finish', 'preserved.publish');
  cross(d, 'preserved-door');
  cross(d, 'preserved-door-workroom');
  return d;
}

describe('The Gap in the Backdrop and The Edge That Stayed', () => {
  it('dates and attributes the embroidery and separately catalogued print and locates Arke’s four prints', () => {
    const pack = buildPack();
    const textile = pack.exhibits.find(({ id }) => id === 'OBJ-SEAM-GARJJAT')!;
    expect(textile.sources).toEqual(['HIS-SEAM-01', 'HIS-SEAM-02', 'HIS-SEAM-03']);
    expect(textile.dateText).toEqual('1981 embroidery and 2024 print');
    const textileCard = pack.cards.find(({ id }) => id === textile.grantsCard)!;
    expect(textileCard.text).toContain('hand-coloured serigraph on paper, MOM/2024/133');
    expect(textileCard.person?.place).toBe('Idivuoma, Sápmi');
    expect(textileCard.limits).toContain('1981 embroidery');
    const point = pack.exhibits.find(({ id }) => id === 'OBJ-SEAM-NUUGAARSUK')!;
    expect(point.sources).toEqual(['HIS-SEAM-04', 'HIS-SEAM-05']);
    const pointCard = pack.cards.find(({ id }) => id === point.grantsCard)!;
    expect(pointCard.text).toContain('four 1990 silver-gelatin prints on baryta paper');
    expect(pointCard.person?.place).toContain('near Narsaq');
    expect(pointCard.limits).toContain('a separate part of her work in Ittoqqortoormiit');
  });

  it('can move the backing without recording a result or covering a missing section', () => {
    const d = start();
    expect(visible(d, 'cold-seam-jig')).toBe(false);
    inspect(d, 'cold-seam-garjjat');
    d.run({ type: 'EquipPerspective', keepsake: rule });
    scene(d, 'cold-seam-jig', 'Slide the detachable', 'Lift the rule');
    expect(d.s.flags['seam.cold.face']).toBe('support');
    expect(d.s.flags['seam.cold.support']).toBeUndefined();
    scene(d, 'cold-seam-jig', 'Rest the cloth', 'Mark the loose');
    expect(d.s.flags['seam.cold.face']).toBe('free');
    scene(d, 'cold-seam-jig', 'Slide the detachable', 'Mark the supported');
    expect(d.s.flags['seam.cold.face']).toBe('support');
    expect(visible(d, 'cold-seam-pack')).toBe(false);
    scene(d, 'cold-seam-marks', 'Line up the maker');
    expect(visible(d, 'cold-seam-pack')).toBe(true);
  });

  it.each([
    { delivery: 'brace', placement: 'play', receipt: 'Leave the support date' },
    { delivery: 'brace', placement: 'bench', receipt: 'Sign the close-view' },
    { delivery: 'trace', placement: 'play', receipt: 'Sign the stage sheet' },
    { delivery: 'trace', placement: 'bench', receipt: 'Add a clear source' },
  ])('checks a $delivery delivery independently at the $placement mount', ({ delivery, placement, receipt }) => {
    const d = start();
    const brace = delivery === 'brace';
    const play = placement === 'play';
    const credit = { ...d.p.credit };
    inspect(d, 'cold-seam-garjjat');
    d.run({ type: 'EquipPerspective', keepsake: rule });
    scene(d, 'cold-seam-jig', 'Rest the cloth', 'Mark the loose');
    scene(d, 'cold-seam-jig', 'Slide the detachable', 'Mark the supported');
    scene(d, 'cold-seam-marks', 'Line up the maker');
    scene(d, 'cold-seam-pack', brace ? 'Lend the cloth' : 'Keep the cloth');
    expect(visible(d, 'cold-seam-away')).toBe(brace);
    expect(visible(d, 'cold-seam-jig')).toBe(!brace);
    expect(d.done('seam.cold.checked')).toBe(false);
    scene(d, `cold-seam-${delivery}-receipt`, brace ? 'Record the cloth' : 'Record that the packet');
    expect(d.done('seam.cold.checked')).toBe(true);
    expect(d.s.journal).toContain('j.seam.cold');
    cross(d, 'preserved-workroom-back');
    cross(d, 'preserved-door-nexus');
    cross(d, 'stage-door');
    expect(d.done('stage.arrival')).toBe(true);
    cross(d, 'stage-gallery-path');

    expect(visible(d, 'stage-seam-near')).toBe(false);
    inspect(d, 'stage-seam-point');
    d.run({ type: 'EquipPerspective', keepsake: null });
    expect(visible(d, 'stage-seam-far')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: rule });
    scene(d, 'stage-seam-near', 'Line up the two pegs');
    expect(visible(d, 'stage-seam-choose')).toBe(false);
    scene(d, 'stage-seam-far', 'Lower the baffle');
    expect(check(prop(d, 'stage-seam-far').artOpen?.if, d.s)).toBe(true);
    scene(d, 'stage-seam-choose', play ? 'Hang the wide view' : 'Leave the evidence');
    expect(d.done('seam.stage.checked')).toBe(false);
    expect(visible(d, `stage-seam-${placement}-${brace ? 'trace' : 'brace'}`)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: null });
    scene(d, `stage-seam-${placement}-${delivery}`, receipt);
    expect(d.s.flags['seam.stage.used']).toBe(placement);
    expect(d.done('seam.stage.checked')).toBe(true);
    expect(visible(d, `stage-seam-${placement}-reply`)).toBe(true);
    expect(visible(d, `stage-seam-${placement}-${delivery}`)).toBe(false);
    expect(d.s.journal).toContain('j.seam.stage');
    expect(d.p.credit).toEqual(credit);
    expect(d.s.flags['stage.response']).toBe('pause');

    cross(d, 'stage-gallery-return');
    cross(d, 'stage-nexus-return');
    cross(d, 'preserved-door');
    cross(d, 'preserved-door-workroom');
    expect(visible(d, 'cold-seam-away')).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: rule });
    expect(visible(d, 'cold-seam-jig')).toBe(true);
    expect(visible(d, `cold-seam-${placement}-reply`)).toBe(true);
    expect(visible(d, `cold-seam-${play ? 'bench' : 'play'}-reply`)).toBe(false);
  });
});
