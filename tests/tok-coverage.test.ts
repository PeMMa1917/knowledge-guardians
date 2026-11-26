import { describe, expect, it } from 'vitest';
import { check } from '../src/domain/rules';
import { MAPS } from '../src/maps';
import { coverageGaps, type TimedEncounter } from '../tools/tok-coverage';
import { Driver } from './driver';

type Play = (driver: Driver) => void;

class Route {
  readonly driver = new Driver();
  readonly encounters: TimedEncounter[] = [];

  at(minute: number, action: string, dimensions: TimedEncounter['dimensions'], play: Play): void {
    play(this.driver);
    this.encounters.push({ minute, action, dimensions });
  }
}

function walkScene(d: Driver, id: string, next?: string): void {
  const prop = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'scene');
  if (!prop?.node) throw new Error(`Missing scene prop ${id}`);
  expect(check(prop.visibleIf, d.s), `${id} visible`).toBe(true);
  const choice = next ? d.e.visibleOptions(prop.node, d.s).find(({ option }) => option.next === next) : undefined;
  if (next && !choice) throw new Error(`Missing choice from ${id} to ${next}`);
  d.walk(prop.node, choice ? [choice.option.text] : []);
}

function useProp(id: string, choice: string): Play {
  return (d) => {
    walkScene(d, id, `${id}.${choice}`);
    expect(d.s.flags[id], `${id} consequence`).toBe(choice);
  };
}

function useDoor(d: Driver, id: string): void {
  const door = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'door');
  expect(door?.to, `${id} destination`).toBeDefined();
  expect(check(door!.visibleIf, d.s) && check(door!.openIf, d.s), `${id} open`).toBe(true);
  if (door!.flag) d.run({ type: 'SetFlag', flag: door!.flag, value: true });
  d.s.mapId = door!.to!.map;
}

function readSign(d: Driver, id: string): void {
  const sign = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'sign');
  if (!sign?.text) throw new Error(`Missing sign text for ${id}`);
  expect(check(sign.visibleIf, d.s), `${id} visible`).toBe(true);
  if (sign.flag) d.run({ type: 'SetFlag', flag: sign.flag, value: true });
}

// Times below are author estimates of when these actions could finish. This
// fixture exercises entry conditions and domain commands, not walking or reading speed.
function nexusToEmberford(explore: boolean): Route {
  const route = new Route();
  route.at(3, 'Question the label carrying the archive seal', ['power', 'truth'], (d) => {
    d.walk('cold.open');
    d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
    d.talk('warden-ise', 'How can all three');
    expect(d.done('m01.o1.look')).toBe(true);
  });
  if (explore) route.at(5, 'Direct visitors toward the practical pen', ['scope', 'perspective'], useProp('nexus.entrance-guide', 'use'));
  route.at(9, 'Compare the patent, model and pen dates', ['scope', 'evidence', 'certainty', 'interpretation', 'methods-and-tools'], (d) => {
    for (const exhibit of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit });
    for (const exhibit of ['OBJ-001-A', 'OBJ-001-C']) d.run({ type: 'UseLens', exhibit });
    expect(d.done('m01.o3.lens')).toBe(true);
  });
  if (explore) route.at(12, 'Send competing translations back together', ['culture', 'interpretation', 'perspectives'], useProp('nexus.translation-slip', 'gloss'));
  route.at(16, 'Compare two mark strips using the same pen', ['objectivity', 'explanation', 'methods-and-tools'], (d) => {
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'leather' });
    expect(d.done('m01.o4.test')).toBe(true);
  });
  route.at(22, 'Hear the curator and clerk, then reframe their disagreement for the crowd', ['perspective', 'values', 'justification', 'perspectives'], (d) => {
    d.talk('curator-dace', 'Why do you favour');
    d.talk('clerk-venn', 'Does a patent prove');
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.moves({ move: 'claim', claim: 'practical' }, { move: 'support', card: 'card.dpma-history' },
      { move: 'support', card: 'card.biro-object' }, { move: 'concede' }, { move: 'reframe' }, { move: 'rest' });
    expect(d.done('m01.o5.practice')).toBe(true);
  });
  if (explore) route.at(25, 'Publish a checkable loan number while withholding a maker’s name', ['responsibility', 'ethics'], useProp('nexus.loan-slip', 'number'));
  route.at(28, 'Put up a limited label, then hear visitors compare it with what “first” meant back home', ['evidence', 'truth', 'culture', 'justification', 'responsibility', 'scope', 'ethics'], (d) => {
    const result = d.run({ type: 'BuildLabel', kit: 'pen', subject: 'loud', criterion: 'patent', limit: 'notproof' });
    const notice = result.events.find((event) => event.kind === 'label');
    expect(notice?.result.heard).toContain('Where I grew up');
    expect(d.s.flags['label.pen.holds']).toBe(true);
    d.talk('warden-ise');
    const portal = MAPS[d.s.mapId].zones.find((zone) => zone.id === 'portal')!;
    expect(check(portal.if, d.s)).toBe(true);
    d.run({ type: 'Reach', zone: 'portal' });
    d.s.mapId = portal.to!.map;
    d.run({ type: 'Reach', zone: 'emberford' });
  });
  route.at(33, 'Question a seller about his blade and inspect the object', ['power', 'evidence'], (d) => {
    d.talk('merchant-corvan', 'How do you know');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-003-AE' });
    expect(d.done('m02.o2.claim')).toBe(true);
  });
  route.at(39, 'Follow the provenance thread and find where the record ends', ['certainty', 'truth', 'scope', 'methods-and-tools'], (d) => {
    for (const node of ['stall', 'ledger', 'workshop']) d.run({ type: 'FollowThread', thread: 'blade', node });
    expect(d.done('m02.o3.thread')).toBe(true);
  });
  if (explore) {
    route.at(44, 'Arrange a repeat water reading from a fixed mark', ['objectivity', 'explanation', 'methods-and-tools'], useProp('emberford.gauge', 'repeat'));
    route.at(49, 'Keep both weights and loaf counts for different readers', ['perspective', 'values', 'perspectives'], useProp('emberford.tally', 'loaves'));
    route.at(53, 'Hang the sketch of the safe bridge approach', ['responsibility', 'ethics'], useProp('emberford.repair-notice', 'sketch'));
    route.at(57, 'Keep the sample separate from the untraced blade', ['interpretation', 'justification', 'scope'], useProp('emberford.pattern-order', 'record'));
    route.at(64, 'Compare the workshop’s test sample with the seller’s blade', ['evidence', 'explanation', 'objectivity', 'methods-and-tools'], (d) => {
      d.talk('smith-hesper', 'Can I try it');
      d.talk('scholar-sefa', 'What is wootz');
      d.run({ type: 'InspectExhibit', exhibit: 'OBJ-002' });
      for (const action of ['stack', 'stack', 'weld', 'fold', 'cut'] as const) d.run({ type: 'Forge', action });
      d.run({ type: 'InspectExhibit', exhibit: 'AE-ASSAY' });
      d.run({ type: 'CompareAssay' });
      expect(d.done('m02.o4.forge')).toBe(true);
    });
    route.at(71, 'Narrow the maker’s claim before the market crowd', ['truth', 'justification', 'perspective', 'perspectives'], (d) => {
      d.talk('merchant-corvan', 'In the square');
      d.run({ type: 'ShowdownStart', showdown: 'corvan' });
      d.moves({ move: 'claim', claim: 'honest' }, { move: 'support', card: 'card.workshop-diagram' },
        { move: 'counter', card: 'card.forge-pattern' }, { move: 'support', card: 'card.guild-ledger' }, { move: 'rest' });
      expect(d.done('m02.o5.showdown')).toBe(true);
    });
    route.at(76, 'Compare the order record, workshop consent and Sefa’s source packet', ['certainty', 'interpretation', 'scope', 'ethics'], (d) => {
      walkScene(d, 'copy-spare', 'copy.started');
      for (const prop of ['copy-order', 'copy-consent', 'copy-anchor']) walkScene(d, prop);
      expect(d.done('copy.o.trace')).toBe(true);
    });
    route.at(81, 'Use the market’s spoken handover and leave a source people can check', ['power', 'culture', 'values', 'responsibility', 'perspectives', 'ethics'], (d) => {
      walkScene(d, 'copy-board', 'copy.plan.market');
      walkScene(d, 'copy-west-handover', 'copy.end.market');
      expect(d.done('copy.o.relay')).toBe(true);
    });
  }
  return route;
}

function nileDispatch(borrowedMark: boolean): Route {
  const route = new Route();
  const d = route.driver;
  // Independent return-session fixture. These flags represent earlier progress.
  d.s.objectivesDone.push('m02.o8.ise');
  d.s.inventory['tool.provenance-thread'] = 1;
  d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
  useDoor(d, 'door-without-a-name');
  route.at(5, 'Give the bench to a reader who needs the large copy while marking the missing line', ['values', 'ethics', 'responsibility'], useProp('nile.reading-bench', 'copy'));
  route.at(15, 'Follow the scribe’s record and decide what to put in front', ['evidence', 'power', 'perspective', 'interpretation', 'perspectives'], (d) => {
    useDoor(d, 'nile-workers');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    for (const node of ['delay', 'payment', 'return']) d.run({ type: 'FollowThread', thread: 'nile-strike', node });
    d.talk('nile-leila', 'workers stopping');
    expect(d.done('nile.workers')).toBe(true);
  });
  route.at(18, 'Put the scribe’s name first and make space for missing voices', ['perspectives', 'ethics'], useProp('nile.reader-seat', 'slip'));
  if (borrowedMark) route.at(23, 'Use the keepers’ swatch to justify a label about shared practice with the maker left unnamed', ['truth', 'certainty', 'culture', 'justification', 'scope', 'methods-and-tools'], (d) => {
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-ARCHIVE-PRACTICE-SWATCH' });
    useDoor(d, 'workyard-back');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-ARCHIVE-RECEIVING-TAG' });
    d.run({ type: 'BuildLabel', kit: 'nile-borrowed-mark', subject: 'cloth', criterion: 'shared', limit: 'open' });
    expect(d.done('nile.mark.publish')).toBe(true);
  });
  const extra = borrowedMark ? 5 : 0;
  route.at(27 + extra, 'Compare two model roads and choose what travels', ['objectivity', 'explanation', 'values', 'justification', 'scope', 'methods-and-tools'], (d) => {
    if (!borrowedMark) useDoor(d, 'workyard-back');
    useDoor(d, 'nile-maps');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
    d.run({ type: 'NileRouteTrial', road: 'ridge' });
    d.run({ type: 'NileRouteTrial', road: 'wash' });
    d.run({ type: 'NileDelivery', choice: 'copy' });
    expect(d.done('nile.routes')).toBe(true);
  });
  route.at(31 + extra, 'Leave the next keeper the conditions of the model trial', ['certainty', 'scope', 'methods-and-tools'], useProp('nile.model-handover', 'repeat'));
  route.at(38 + extra, 'Send the workmen’s slips and open the Nexus reading table', ['responsibility', 'power', 'perspectives', 'ethics'], (d) => {
    useDoor(d, 'route-back');
    d.talk('nile-iman', 'reading table');
    useDoor(d, 'nile-nexus');
    d.talk('warden-ise', 'Lay both slips', 'come back');
    expect(d.done('nile.return')).toBe(true);
  });
  route.at(47 + extra, 'Present the Singapore Stone and the Malay Annals without conflating them', ['culture', 'truth', 'interpretation', 'scope'], (d) => {
    for (const exhibit of ['OBJ-NILE-STONE', 'OBJ-NILE-BADANG']) d.run({ type: 'InspectExhibit', exhibit });
    d.run({ type: 'BuildLabel', kit: 'nile-stone', subject: 'story', criterion: 'tradition', limit: 'bound' });
    expect(d.done('nile.stone.publish')).toBe(true);
  });
  return route;
}

function preservedLives(): Route {
  const route = new Route();
  const d = route.driver;
  // Independent Chapter 3 session. The previous chapter's packet already returned.
  d.s.inventory['tool.date-lens'] = 1;
  d.s.inventory['tool.provenance-thread'] = 1;
  d.run({ type: 'SetFlag', flag: 'nile.returned', value: true });
  route.at(3, 'Question one glowing heading for two distinct collections', ['power', 'scope'], (d) => {
    useDoor(d, 'preserved-door');
    d.talk('preserved-registrar', 'royal records first');
    expect(d.done('preserved.briefing')).toBe(true);
  });
  route.at(9, 'Use the Lens to distinguish the temple record and the custody file', ['evidence', 'certainty', 'interpretation', 'methods-and-tools'], (d) => {
    useDoor(d, 'preserved-door-royal');
    for (const exhibit of ['OBJ-PRES-RAMESSEUM', 'OBJ-PRES-RAM-CUSTODY']) {
      d.run({ type: 'InspectExhibit', exhibit });
      d.run({ type: 'UseLens', exhibit });
    }
  });
  route.at(15, 'Trace the documented locations and leave an unrecorded transfer open on the label', ['truth', 'justification', 'scope'], (d) => {
    for (const node of ['burial', 'cache', 'catalogue']) d.run({ type: 'FollowThread', thread: 'preserved-royal', node });
    d.run({ type: 'BuildLabel', kit: 'preserved-name', subject: 'catalogue', criterion: 'custody', limit: 'gap' });
    expect(d.done('preserved.royal')).toBe(true);
  });
  route.at(23, 'Compare the sites and conditions before drawing conclusions about burial practice', ['culture', 'explanation', 'objectivity', 'methods-and-tools'], (d) => {
    useDoor(d, 'preserved-royal-back');
    useDoor(d, 'preserved-door-coast');
    for (const exhibit of ['OBJ-PRES-CHIN-SITES', 'OBJ-PRES-CHIN-CONTEXT']) d.run({ type: 'InspectExhibit', exhibit });
    for (const node of ['site', 'conditions', 'context']) d.run({ type: 'FollowThread', thread: 'preserved-coast', node });
    expect(d.done('preserved.coast')).toBe(true);
  });
  route.at(25, 'Put the sites map first for a reader trying to find the place', ['perspective', 'perspectives'], (d) => {
    d.talk('preserved-coast-keeper', 'site map uppermost');
    expect(d.s.flags['preserved.coastLead']).toBe('map');
  });
  route.at(29, 'Publish a comparison while carrying the limits of each source into the public display', ['values', 'responsibility', 'ethics', 'scope'], (d) => {
    useDoor(d, 'preserved-coast-back');
    d.talk('preserved-registrar', 'comparison slip');
    expect(d.s.flags['preserved.display']).toBe('paired');
  });
  route.at(37, 'Answer visitors who took the comparison to mean a shared history by clipping references to each record', ['interpretation', 'power', 'responsibility', 'perspectives', 'ethics'], (d) => {
    useDoor(d, 'preserved-door-inquiry');
    d.talk('preserved-inquiry-keeper', 'Clip the limits');
    expect(d.done('preserved.answer')).toBe(true);
  });
  route.at(43, 'Check the excavation journal, later account and workforce record side by side', ['evidence', 'certainty', 'methods-and-tools'], (d) => {
    for (const exhibit of ['OBJ-PRES-TUT-JOURNAL', 'OBJ-PRES-TUT-NOTE', 'OBJ-PRES-TUT-WORKFORCE']) d.run({ type: 'InspectExhibit', exhibit });
    for (const exhibit of ['OBJ-PRES-TUT-JOURNAL', 'OBJ-PRES-TUT-NOTE']) d.run({ type: 'UseLens', exhibit });
    expect(d.done('preserved.proof.checked')).toBe(true);
  });
  route.at(47, 'Give the named foremen space on the display while leaving other names open', ['power', 'perspective', 'responsibility', 'ethics'], (d) => {
    useProp('preserved.tut.request', 'names')(d);
    expect(d.done('preserved.proof.hung')).toBe(true);
  });
  return route;
}

function observatoryCoast(bellSlip: boolean): Route {
  const route = new Route();
  const extra = bellSlip ? 2 : 0;
  // Independent Chapter 4 session. The Cold Store's first display is already open.
  route.driver.s.objectivesDone.push('preserved.publish');
  route.at(4, 'Ask which crews need the notice and which route each follows', ['perspective', 'perspectives'], (d) => {
    useDoor(d, 'observatory-door');
    d.talk('coast-signalkeeper', 'Who is waiting');
    expect(d.done('coast.arrival')).toBe(true);
  });
  route.at(8, 'Read the sheltered quay gauge with its place and interval attached', ['evidence', 'scope', 'methods-and-tools'], (d) => {
    readSign(d, 'coast-harbour-gauge');
  });
  if (bellSlip) route.at(10, 'Keep the quay crew’s way of counting alongside the timed station marks',
    ['culture', 'interpretation', 'perspectives'], useProp('coast.bell-slip', 'both'));
  route.at(16 + extra, 'Align the two sites by time and show how two rain reports can both be true', ['evidence', 'truth', 'objectivity', 'certainty', 'methods-and-tools'], (d) => {
    useDoor(d, 'coast-headland-path');
    readSign(d, 'coast-station-gauge');
    d.talk('coast-forecaster', 'Pin each reading to the place');
    expect(d.done('coast.readings')).toBe(true);
  });
  route.at(22 + extra, 'Separate the forecast from the measurements and keep the wind assumption with the estimate', ['explanation', 'interpretation', 'justification', 'scope'], (d) => {
    readSign(d, 'coast-chart-board');
    d.talk('coast-forecaster', 'Put the estimate on a separate strip');
    expect(d.done('coast.forecast')).toBe(true);
  });
  route.at(28 + extra, 'Send a written copy with the runner to the crews who cannot see the quay board', ['perspective', 'values', 'power', 'responsibility', 'perspectives', 'ethics'], (d) => {
    useDoor(d, 'coast-headland-return');
    d.talk('coast-signalkeeper', 'Send the runner to the basket crews');
    expect(d.done('coast.dispatch')).toBe(true);
    readSign(d, 'coast-notice-runner');
  });
  route.at(35 + extra, 'Repeat the reading with the same headland gauge and interval, and leave the second quay result open', ['evidence', 'certainty', 'truth', 'objectivity', 'scope', 'methods-and-tools'], (d) => {
    useDoor(d, 'coast-headland-path');
    readSign(d, 'coast-station-recheck');
    expect(d.done('coast.observe-again')).toBe(true);
  });
  route.at(41 + extra, 'Correct the notice sent to the crews while retaining a dated copy', ['responsibility', 'justification', 'truth', 'ethics'], (d) => {
    useDoor(d, 'coast-headland-return');
    d.talk('coast-signalkeeper', 'Send the runner back');
    expect(d.done('coast.revise')).toBe(true);
    readSign(d, 'coast-notice-revision');
  });
  route.at(47 + extra, 'Find where a shortcut misses the handover and arrange a copy at the crossing', ['perspective', 'power', 'responsibility', 'perspectives', 'ethics'], (d) => {
    readSign(d, 'coast-harbour-notebook');
    d.talk('coast-signalkeeper', 'Could a copy go at the crossing');
    expect(d.done('coast.missed-copy')).toBe(true);
    readSign(d, 'coast-notice-spare');
  });
  return route;
}

describe('rolling TOK coverage audit', () => {
  it('checks gaps between sampled actions and expires an encounter at the window boundary', () => {
    const encounters: TimedEncounter[] = [
      { minute: 4, action: 'First source', dimensions: ['evidence'] },
      { minute: 35.5, action: 'Different source', dimensions: ['evidence', 'ethics'] },
      { minute: 37, action: 'Comparison', dimensions: ['evidence'] },
    ];
    expect(coverageGaps(67, encounters).filter((gap) => gap.dimension === 'evidence')).toEqual([
      { dimension: 'evidence', from: 34, until: 35.5 }, { dimension: 'evidence', from: 67, until: null },
    ]);
    expect(coverageGaps(67, encounters).filter((gap) => gap.dimension === 'ethics')).toEqual([
      { dimension: 'ethics', from: 30, until: 35.5 }, { dimension: 'ethics', from: 65.5, until: null },
    ]);
  });

  it('requires a full window and rejects timings outside the trace', () => {
    expect(coverageGaps(29, [])).toEqual([]);
    expect(coverageGaps(30, [])).toHaveLength(16);
    expect(() => coverageGaps(30, [{ minute: 31, action: 'Future step', dimensions: [] }])).toThrow(RangeError);
  });

  it.each([
    { name: 'Nexus main route into Emberford', end: 42, play: () => nexusToEmberford(false) },
    { name: 'Nexus and Emberford with optional stops', end: 85, play: () => nexusToEmberford(true) },
    { name: 'Nile first visit from a prepared Chapter 1 save', end: 50, play: () => nileDispatch(false) },
    { name: 'Nile first visit with the Borrowed Mark stop', end: 55, play: () => nileDispatch(true) },
    { name: 'Preserved Lives from a prepared Chapter 2 save', end: 50, play: preservedLives },
    { name: 'Observatory Coast from a prepared Chapter 3 save', end: 50, play: () => observatoryCoast(false) },
    { name: 'Observatory Coast with the quay bell slip', end: 52, play: () => observatoryCoast(true) },
  ])('can execute the modeled route for $name and report its gaps', ({ name, end, play }) => {
    const route = play();
    const gaps = coverageGaps(end, route.encounters);
    if (import.meta.env.MODE !== 'tok-report') return;
    const opening = gaps.filter((gap) => gap.from === 30).map((gap) => gap.dimension);
    console.log([
      `\n${name} (${end} estimated minutes)`,
      ...route.encounters.map(({ minute, action, dimensions }) => `  ${minute}m  ${action} [${dimensions.join(', ')}]`),
      `Missing in the first 30m: ${opening.join(', ') || 'none in this trace'}`,
      'Trailing 30m gaps (end times of windows):',
      ...(gaps.length ? gaps.map(({ dimension, from, until }) =>
        `  ${dimension}: ${from}m ${until === null ? 'through the trace end' : `to before ${until}m`}`) : ['  None in this trace']),
    ].join('\n'));
  });
});
