import { describe, expect, it } from 'vitest';
import { CALLBOARD_CASES, HEARTH } from '../src/content/callboardCases';
import { IMPRINT_CASES } from '../src/content/copyImprintCases';
import credits from '../src/content/historical-credit-people.json';
import { RELAY_CASES } from '../src/content/relayCases';
import { SPECIMEN_WORK } from '../src/content/specimenWorkCases';
import { imprintHeading, imprintHeadingFlag, imprintPacket, installFlag, pressFlag, pullFlag } from '../src/domain/imprint';
import { check } from '../src/domain/rules';
import { canClaimSpecimen, findCollectedSpecimens, hasSpecimen, specimenDisplay, specimenItemId, specimenToolId } from '../src/domain/specimenGear';
import { relayMove, weaveLine } from '../src/domain/specimenRelay';
import type { FlagValue } from '../src/domain/types';
import { MAPS } from '../src/maps';
import { specimenWorkId } from '../src/maps/specimenWork';
import { Driver } from './driver';

function options(d: Driver, node: string, index: number) {
  d.run({ type: 'ChooseDialogueOption', node, index });
}

function prop(d: Driver, map: string, id: string) {
  const entry = MAPS[map].interactables.find((candidate) => candidate.id === id);
  expect(entry, id).toBeDefined();
  expect(check(entry!.visibleIf, d.s), id).toBe(true);
  return entry!;
}

function claim(d: Driver, exhibit: string) {
  const record = d.e.pack.exhibits.find((entry) => entry.id === exhibit)!;
  expect(hasSpecimen(record)).toBe(true);
  if (!hasSpecimen(record)) throw new Error(`${exhibit} lacks a collection record`);
  expect(canClaimSpecimen(d.s, record)).toBe(true);
  d.run({ type: 'ClaimSpecimen', exhibit });
  expect(d.s.inventory[specimenItemId(record.specimen.key)]).toBe(1);
  return record.specimen;
}

function set(d: Driver, flag: string, value: FlagValue) {
  d.run({ type: 'SetFlag', flag, value });
}

const hearth = CALLBOARD_CASES.find((entry) => entry.key === HEARTH)!;
const painting = IMPRINT_CASES.find((entry) => entry.accession === '1987.162')!;
const fan = RELAY_CASES.find((entry) => entry.accession === '1979.206.1757')!;
const hanging = SPECIMEN_WORK.find((entry) => entry.object.accession === '1971.30')!;

describe('Historical credits attached to exact collection records', () => {
  it('resolves every new credit to its own accession and preserves qualified roles', () => {
    const d = new Driver();
    const exhibits = d.e.pack.exhibits.filter(hasSpecimen);
    for (const [key, people] of Object.entries(credits)) {
      const entries = exhibits.filter(({ specimen }) => specimen.key === key);
      expect(entries, key).toHaveLength(1);
      const { specimen } = entries[0];
      expect(specimen.people, key).toEqual(people);
      const holding = d.e.pack.sources.find(({ id }) => id === specimen.source);
      expect(people.every(({ source }) => source === holding?.id), key).toBe(true);
      if (key.startsWith('cma:')) expect(holding?.url).toMatch(new RegExp(`/art/${specimen.accession.replaceAll('.', '\\.')}$`));
      else expect(holding?.url).toMatch(/^https:\/\/www\.metmuseum\.org\/art\/collection\/search\/\d+$/);
    }
    expect(credits['cma:2024.151'].map(({ role }) => role)).toEqual([
      'Engraver of the accessioned print', 'Artist of the scene used as a model', 'Publisher named in the record',
    ]);
    expect(credits['cma:1964.506'][0].role).toBe('Probable manufacturer');
    expect(credits['cma:1929.552'][0].role).toContain('unidentified');
    expect(credits['met:1985.203'][0].role).toContain('qualified');
    expect(credits['met:1971.30'][0].detail).toContain('three possible attributions');
  });

  it.each(['bench', 'separate'] as const)('carries The Hearth through the %s reading and an earned three-line return', (layout) => {
    const d = new Driver();
    d.s.objectivesDone.push('civic.finish');
    expect(prop(d, 'civic.dispatch', 'civic-callboard-door').to?.map).toBe('civic.callboard');
    const stand = prop(d, 'civic.callboard', `callboard-case-${hearth.slug}`);
    const work = prop(d, 'civic.callboard', `callboard-${hearth.slug}`);
    expect(work.game).toBe(`callboard:${hearth.slug}`);
    expect(() => options(d, hearth.nodes.check, 0)).toThrow(/not available/);
    d.run({ type: 'InspectExhibit', exhibit: stand.exhibit! });
    options(d, hearth.nodes.check, 0);
    options(d, hearth.nodes.check, 1);
    options(d, hearth.nodes.check, layout === 'bench' ? 2 : 3);
    expect(() => d.run({ type: 'ClaimSpecimen', exhibit: stand.exhibit! })).toThrow(/Finish the object/);
    expect(findCollectedSpecimens(specimenDisplay(d.e.pack, d.s), 'Auguste Clot')).toEqual([]);
    expect(prop(d, 'civic.callboard', 'callboard-first').game).toBe('callboard:first');
    if (layout === 'bench') options(d, hearth.nodes.first, 0);
    else {
      expect(() => options(d, hearth.nodes.second, 0)).toThrow(/not available/);
      options(d, hearth.nodes.first, 1);
      expect(d.done(hearth.objective)).toBe(false);
      expect(prop(d, 'civic.callboard', 'callboard-second').game).toBe('callboard:second');
      options(d, hearth.nodes.second, 0);
    }
    expect(d.s.flags[`${hearth.flag}.heard`]).toBe(layout);
    const specimen = claim(d, stand.exhibit!);
    expect(specimen.people?.map(({ name }) => name)).toEqual(['Édouard Vuillard', 'Auguste Clot', 'Ambroise Vollard']);
    expect(findCollectedSpecimens(specimenDisplay(d.e.pack, d.s), 'eDOUARD VUILLARD').map(({ record }) => record.id)).toEqual([stand.exhibit]);
    const revisit = MAPS[hearth.revisit.map].interactables.find(({ id }) => id === hearth.revisit.prop)!;
    expect(check(revisit.visibleIf, d.s)).toBe(false);
    d.run({ type: 'EquipPerspective', keepsake: specimenToolId(HEARTH) });
    expect(check(revisit.visibleIf, d.s)).toBe(true);
    options(d, hearth.nodes.return, 0);
    expect(() => options(d, hearth.nodes.return, 2)).toThrow(/not available/);
    options(d, hearth.nodes.return, 1);
    options(d, hearth.nodes.return, 2);
    expect(check(revisit.artOpen?.if, d.s)).toBe(true);
  });

  it.each([['counter', 'work'], ['drawer', 'artist']] as const)('mounts Kehar Singh’s %s proof with the selected %s heading', (route, heading) => {
    const d = new Driver();
    d.s.objectivesDone.push('copies.revise');
    expect(prop(d, 'copies.press', 'copies-proof-path').to?.map).toBe('copies.proof-room');
    const source = prop(d, 'copies.proof-room', `imprint-case-${painting.slug}`);
    d.run({ type: 'InspectExhibit', exhibit: source.exhibit! });
    expect(prop(d, 'copies.proof-room', `imprint-pull-${painting.slug}`).game).toBe(`imprint-press:${painting.slug}`);
    expect(imprintHeading(d.s, painting.stem)).toBe('artist');
    set(d, pullFlag(painting.stem, 'light'), true);
    set(d, pullFlag(painting.stem, 'even'), true);
    set(d, imprintHeadingFlag(painting.stem), heading);
    const packet = imprintPacket(route, 'even');
    set(d, pressFlag(painting.stem), packet);
    expect(d.done(painting.objective)).toBe(false);
    const receiver = prop(d, route === 'counter' ? 'copies.landing' : 'copies.proof-room', `copies-imprint-${route}`);
    expect(check(receiver.artOpen?.if, d.s)).toBe(false);
    set(d, installFlag(painting.stem), packet);
    expect(check(receiver.artOpen?.if, d.s)).toBe(true);
    expect(imprintHeading(d.s, painting.stem)).toBe(heading);
    expect(claim(d, source.exhibit!).people?.[0].name).toBe('Kehar Singh');
  });

  it.each([['bell', 'detail'], ['bell', 'record'], ['trace', 'record']] as const)('reunites the Ènata maker clip on the %s route with %s first', (channel, first) => {
    const d = new Driver();
    d.s.objectivesDone.push('sea.arrival');
    expect(prop(d, 'sea.chartroom', 'specimen-relay-entrance').to?.map).toBe('sea.relay-room');
    const caseOnMap = prop(d, 'sea.relay-room', `specimen-relay-${fan.slug}-exhibit`);
    d.run({ type: 'InspectExhibit', exhibit: caseOnMap.exhibit! });
    function act(action: Parameters<typeof relayMove>[2]) {
      const effect = relayMove(fan.key, d.s.flags, action)!;
      expect(effect).toBeTruthy();
      set(d, effect.setFlag, effect.value);
    }
    act({ type: 'thread', first });
    act({ type: 'trial', weather: 'still' });
    act({ type: 'trial', weather: 'gust' });
    act({ type: 'send', channel });
    expect(prop(d, channel === 'bell' ? 'sea.harbour' : 'sea.chartroom', `specimen-relay-${channel}-receiver`).game).toBe(`specimen-relay:${channel}`);
    if (channel === 'bell') {
      expect(weaveLine(first, 'gust').arrived).toEqual([first]);
      expect(relayMove(fan.key, d.s.flags, { type: 'reunite', channel })).toBeNull();
      act({ type: 'request-missing' });
    }
    expect(d.done(fan.objective)).toBe(false);
    act({ type: 'reunite', channel });
    expect(claim(d, caseOnMap.exhibit!).people?.[0].name).toBe('An unnamed Ènata artist');
  });

  it.each(hanging.branches)('keeps the hanging’s three possibilities open at $delivery', (branch) => {
    const d = new Driver();
    d.s.objectivesDone.push('stage.arrival');
    const room = prop(d, 'stage.gallery', 'specimen-work-stage-entrance').to!.map;
    const look = (map: string, step: string) => prop(d, map, specimenWorkId(hanging, step));
    const exhibit = look(room, 'exhibit').exhibit!;
    d.run({ type: 'InspectExhibit', exhibit });
    hanging.trials.forEach((trial, index) => d.walk(look(room, `trial-${index + 1}`).node!, [trial.action]));
    d.walk(look(room, 'arrange').node!, [branch.choice]);
    expect(d.done(hanging.objective)).toBe(false);
    d.walk(look('stage.gallery', `deliver-${branch.key}`).node!, [branch.action]);
    const receipt = d.e.node(look('stage.gallery', `deliver-${branch.key}-result`).node!);
    expect(receipt.text).toContain('Mende, Vai, and Temne');
    expect(receipt.text).toContain(branch.key === 'tag' ? 'before the bell' : 'full bench');
    expect(claim(d, exhibit).people?.[0].role).toBe('Community attribution remains open');
  });
});
