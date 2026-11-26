import { describe, expect, it } from 'vitest';
import { compareCopy } from '../src/domain/copyComparison';
import { forestWatch, type ForestWindow } from '../src/domain/forestWatch';
import { readMetalSample } from '../src/domain/metalSample';
import { check } from '../src/domain/rules';
import { seaChart } from '../src/domain/seaCharts';
import { MAPS } from '../src/maps';
import { coverageGaps, singleActionDimensions, type TimedEncounter } from '../tools/tok-coverage';
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

function walkScene(d: Driver, id: string, next?: string, ...picks: string[]): void {
  const prop = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'scene');
  if (!prop?.node) throw new Error(`Missing scene prop ${id}`);
  expect(check(prop.visibleIf, d.s), `${id} visible`).toBe(true);
  const choice = next ? d.e.visibleOptions(prop.node, d.s).find(({ option }) => option.next === next) : undefined;
  if (next && !choice) throw new Error(`Missing choice from ${id} to ${next}`);
  d.walk(prop.node, choice ? [choice.option.text, ...picks] : picks);
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

function watchForest(d: Driver, site: string, window: ForestWindow) {
  const spot = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'forest-watch' && p.node === site);
  if (!spot) throw new Error(`Missing watch spot for ${site}`);
  expect(check(spot.visibleIf, d.s), `${site} watch spot visible`).toBe(true);
  d.run({ type: 'ObserveForest', site, window });
  expect(d.s.flags[`forest.watch.${site}.${window}`]).toBe(true);
  return forestWatch(site, window);
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

type NileFirstLead = 'workers' | 'reading-window' | 'borrowed-mark' | 'royal-seal';

function nileWorkersLead(route: Route, lead: Exclude<NileFirstLead, 'royal-seal'>): void {
  route.at(15, 'Follow the scribe’s record and decide what to put in front', ['evidence', 'power', 'perspective', 'interpretation', 'perspectives'], (d) => {
    useDoor(d, 'nile-workers');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-STRIKE' });
    for (const node of ['delay', 'payment', 'return']) d.run({ type: 'FollowThread', thread: 'nile-strike', node });
    d.talk('nile-leila', 'workers stopping');
    expect(d.done('nile.workers')).toBe(true);
  });
  if (lead === 'reading-window') route.at(18, 'Change the opening under the same reading window, then show both reading customs beside the same dated record', [
    'objectivity', 'explanation', 'interpretation', 'truth', 'certainty', 'culture', 'scope', 'methods-and-tools',
  ], (d) => {
    d.talk('nile-leila', 'Try the two readings again', 'Turn the clips', 'Ask Leila how', 'Hang both ways');
    expect(d.done('nile.workers.proof')).toBe(true);
    expect(d.s.flags['nile.workerLead']).toBe('voices');
    readSign(d, 'nile-window-pair');
  });
  route.at(lead === 'reading-window' ? 21 : 18, 'Put the scribe’s name first and make space for missing voices', ['perspectives', 'ethics'], useProp('nile.reader-seat', 'slip'));
  if (lead === 'borrowed-mark') route.at(23, 'Use the keepers’ swatch to justify a label about shared practice with the maker left unnamed', ['truth', 'certainty', 'culture', 'justification', 'scope', 'methods-and-tools'], (d) => {
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-ARCHIVE-PRACTICE-SWATCH' });
    useDoor(d, 'workyard-back');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-ARCHIVE-RECEIVING-TAG' });
    d.run({ type: 'BuildLabel', kit: 'nile-borrowed-mark', subject: 'cloth', criterion: 'shared', limit: 'open' });
    expect(d.done('nile.mark.publish')).toBe(true);
  });
}

function nileRoyalLead(route: Route): void {
  route.at(13, 'Use the Lens on the Egyptian royal account and the later treaty record', ['evidence', 'interpretation', 'certainty', 'scope', 'methods-and-tools'], (d) => {
    useDoor(d, 'nile-royal');
    for (const exhibit of ['OBJ-NILE-SALLIER', 'OBJ-NILE-TREATY']) {
      d.run({ type: 'InspectExhibit', exhibit });
      d.run({ type: 'UseLens', exhibit });
    }
  });
  route.at(17, 'Give the treaty a label about terms of peace, keeping its claim separate from the account of battle', ['perspective', 'perspectives', 'justification', 'scope'], (d) => {
    d.run({ type: 'BuildLabel', kit: 'nile-qadesh', subject: 'treaty', criterion: 'terms', limit: 'qualified' });
    expect(d.done('nile.diplomacy')).toBe(true);
  });
  route.at(22, 'Turn over the seal, limit it to the copies it checked, and keep distinct captions at both cases', ['truth', 'certainty', 'culture', 'power', 'responsibility', 'ethics', 'scope', 'methods-and-tools'], (d) => {
    const backing = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'clue' && p.clue === 'nile-royal-seal-backing');
    expect(backing).toBeDefined();
    expect(check(backing?.visibleIf, d.s)).toBe(true);
    d.run({ type: 'ReadClue', clue: 'nile-royal-seal-backing' });
    d.talk('nile-nasir', 'Move the seal to what', 'Move the seal under');
    expect(d.done('nile.royal.seal')).toBe(true);
    for (const prop of ['nile-royal-seal-docket', 'nile-royal-papyrus-caption', 'nile-royal-treaty-caption']) readSign(d, prop);
  });
}

function nileDispatch(lead: NileFirstLead = 'workers', tiltTray = false): Route {
  const route = new Route();
  const d = route.driver;
  // Independent return-session fixture. These flags represent earlier progress.
  d.s.objectivesDone.push('m02.o8.ise');
  d.s.inventory['tool.provenance-thread'] = 1;
  d.s.inventory['tool.date-lens'] = 1;
  d.run({ type: 'SetFlag', flag: 'study.letter', value: true });
  useDoor(d, 'door-without-a-name');
  route.at(5, 'Give the bench to a reader who needs the large copy while marking the missing line', ['values', 'ethics', 'responsibility'], useProp('nile.reading-bench', 'copy'));
  const royal = lead === 'royal-seal';
  if (royal) nileRoyalLead(route);
  else nileWorkersLead(route, lead);
  const extra = { workers: 0, 'reading-window': 3, 'borrowed-mark': 5, 'royal-seal': 4 }[lead] + (tiltTray ? 3 : 0);
  const enterMapRoom = (d: Driver) => {
    if (lead !== 'borrowed-mark') useDoor(d, royal ? 'royal-back' : 'workyard-back');
    useDoor(d, 'nile-maps');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
  };
  if (tiltTray) route.at(29, 'Compare the same block on a level and raised tray and pin the limited explanation beside the cart',
    ['objectivity', 'explanation', 'evidence', 'methods-and-tools'], (d) => {
      enterMapRoom(d);
      d.talk('nile-marek', 'Try the tilt tray', 'Set the tray level', 'Reset the tray', 'Raise the same tray', 'Pin a note', 'Carry the two settings');
      expect(d.done('nile.tray.compare')).toBe(true);
      readSign(d, 'nile-tilt-note-cart');
    });
  route.at(27 + extra, 'Compare two model roads and choose what travels', ['objectivity', 'explanation', 'values', 'justification', 'scope', 'methods-and-tools'], (d) => {
    if (!tiltTray) enterMapRoom(d);
    d.run({ type: 'NileRouteTrial', road: 'ridge' });
    d.run({ type: 'NileRouteTrial', road: 'wash' });
    d.run({ type: 'NileDelivery', choice: royal ? 'cast' : 'copy' });
    expect(d.done('nile.routes')).toBe(true);
  });
  route.at(31 + extra, 'Leave the next keeper the conditions of the model trial', ['certainty', 'scope', 'methods-and-tools'], useProp('nile.model-handover', 'repeat'));
  const dispatch = royal ? 'Keep the ancient map and the route trial side by side in the Nexus workshop' : 'Send the workmen’s slips and open the Nexus reading table';
  route.at(38 + extra, dispatch, ['responsibility', 'power', 'perspectives', 'ethics'], (d) => {
    useDoor(d, 'route-back');
    d.talk('nile-iman', royal ? 'workshop table' : 'reading table');
    useDoor(d, 'nile-nexus');
    d.talk('warden-ise', royal ? 'Leave the ancient route' : 'Lay both slips', 'come back');
    expect(d.done('nile.return')).toBe(true);
    readSign(d, royal ? 'nile-outcome-pair' : 'nile-outcome-read');
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

function livingForest(pathbookFirst: boolean): Route {
  const route = new Route();
  // Independent Chapter 5 session. The coast's revised notice is already up.
  route.driver.s.objectivesDone.push('coast.revise');
  const readPathbook = (d: Driver) => {
    useDoor(d, 'forest-community-path');
    readSign(d, 'forest-pathbook');
    d.talk('forest-steward', pathbookFirst ? 'Give heard and seen' : 'Keep the crews’ own words');
    expect(d.done('forest.account')).toBe(true);
  };
  route.at(4, 'Hear what a lookout crossing counts before heading out to check the bridge claim', ['perspective', 'scope'], (d) => {
    useDoor(d, 'forest-door');
    d.talk('forest-naturalist', 'What do we call a crossing');
    expect(d.done('forest.arrival')).toBe(true);
  });
  if (pathbookFirst) route.at(9, 'Separate what the bridge and lamp crews heard on their rounds from what observers saw', ['culture', 'perspective', 'interpretation', 'perspectives'], readPathbook);
  const extraTrailMinutes = pathbookFirst ? 3 : 0;
  route.at(11 + extraTrailMinutes, 'Compare early crossings at the creek and ridge, one against three', ['evidence', 'methods-and-tools'], (d) => {
    useDoor(d, pathbookFirst ? 'forest-bridge-to-trail' : 'forest-trail-path');
    expect(watchForest(d, 'creek', 'early')).toEqual([0, 1, 0]);
    expect(watchForest(d, 'ridge', 'early')).toEqual([1, 2, 0]);
  });
  route.at(18 + extraTrailMinutes, 'Repeat at the same sites in a later window and find the order reversed, three crossings against one', ['objectivity', 'certainty', 'truth', 'methods-and-tools'], (d) => {
    expect(watchForest(d, 'creek', 'late')).toEqual([1, 0, 2]);
    expect(watchForest(d, 'ridge', 'late')).toEqual([0, 0, 1]);
  });
  const comparison = pathbookFirst
    ? 'Put the early and late notes side by side for each lookout, where a combined total would hide the difference'
    : 'Compare matching windows with the naturalist and state how visibility limits a crossing count';
  route.at(22 + extraTrailMinutes, comparison, ['explanation', 'interpretation', 'justification', 'scope'], (d) => {
    useDoor(d, 'forest-trail-back');
    d.talk('forest-naturalist', pathbookFirst ? 'each lookout’s early' : 'same watch');
    expect(d.done('forest.compare')).toBe(true);
  });
  if (!pathbookFirst) route.at(26, 'Keep the words of the lamp crew and the bridge keepers with their own rounds in the pathbook', ['culture', 'perspective', 'perspectives'], readPathbook);
  const publication = pathbookFirst
    ? 'Brief people at the bridge with both records where they can hear them before choosing a path'
    : 'Choose a quiet watch route and point large groups toward the wider lookout';
  route.at(29, publication, ['power', 'values', 'responsibility', 'ethics'], (d) => {
    if (pathbookFirst) useDoor(d, 'forest-community-path');
    d.talk('forest-steward', pathbookFirst ? 'Read both lookout notes' : 'Keep the creek stop');
    expect(d.done('forest.publish')).toBe(true);
    const response = pathbookFirst ? 'brief' : 'quiet';
    expect(d.s.flags['forest.response']).toBe(response);
    readSign(d, `forest-response-${response}`);
  });
  route.at(37, 'Record two crossings at each return watch and keep the blocked creek beat unknown', ['truth', 'certainty', 'objectivity', 'evidence', 'methods-and-tools'], (d) => {
    useDoor(d, 'forest-bridge-to-trail');
    expect(watchForest(d, 'creek', 'return')).toEqual([1, null, 1]);
    expect(watchForest(d, 'ridge', 'return')).toEqual([0, 1, 1]);
    expect(d.done('forest.recheck')).toBe(true);
  });
  const correction = pathbookFirst
    ? 'Return to the bridge readers to show why two equal counts do not imply two identical views'
    : 'Show how an unseen crossing could make the recorded counts match';
  route.at(42, correction, ['interpretation', 'justification', 'explanation', 'responsibility', 'scope', 'ethics'], (d) => {
    useDoor(d, 'forest-clearing-path');
    d.talk('forest-steward', pathbookFirst ? 'Brief the bridge readers' : 'mark the hidden stretch');
    expect(d.done('forest.finish')).toBe(true);
    readSign(d, 'forest-followup-note');
  });
  route.at(47, 'Bring both notes and the view limits down to the low bench', ['power', 'responsibility', 'perspective', 'perspectives', 'ethics'], (d) => {
    d.talk('forest-steward', 'Bring both notes');
    expect(d.done('forest.access')).toBe(true);
    readSign(d, 'forest-low-route');
  });
  route.at(52, 'Give the Gombe field caption the date and the people behind the record', ['evidence', 'culture', 'responsibility', 'power'], (d) => {
    useDoor(d, 'forest-community-back');
    for (const exhibit of ['OBJ-FOREST-GOMBE', 'OBJ-FOREST-GOMBE-CONTEXT']) d.run({ type: 'InspectExhibit', exhibit });
    d.talk('forest-naturalist', 'put the Gombe team back');
    expect(d.done('forest.gombe-credit')).toBe(true);
  });
  return route;
}

function metalworks(turnedTag: boolean): Route {
  const route = new Route();
  // Independent Chapter 6 session. The Forest keepers already revised their notice.
  route.driver.s.objectivesDone.push('forest.finish');
  route.at(4, 'Hear the seller’s claim of a matched set and why it raises the price', ['perspective', 'power', 'values'], (d) => {
    useDoor(d, 'metalworks-door');
    readSign(d, 'metal-weight-tag');
    d.talk('metal-inspector');
    expect(d.done('metal.arrival')).toBe(true);
  });
  route.at(13, 'Check the matched-weight claim, replace it with readings of two and four, and leave composition open', ['evidence', 'truth', 'objectivity', 'explanation', 'scope', 'methods-and-tools'], (d) => {
    const readings = ['panel-a', 'panel-b'].map((sample) => {
      const stand = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'metal-trial' && p.node === sample);
      expect(stand, `${sample} has its own stand`).toBeDefined();
      expect(check(stand?.visibleIf, d.s), `${sample} stand visible`).toBe(true);
      d.run({ type: 'CompareMetalSample', sample });
      expect(d.s.flags[`metal.test.${sample}`]).toBe(true);
      return readMetalSample(sample).mass;
    });
    expect(readings).toEqual([2, 4]);
    d.talk('metal-inspector', 'Pin the two balance readings');
    expect(d.done('metal.compare')).toBe(true);
    readSign(d, 'metal-weight-correction');
  });
  route.at(17, 'Hear how a paint shop and a seller use “matched set” for different claims', ['culture', 'interpretation', 'perspective', 'perspectives'], (d) => {
    readSign(d, 'metal-custody-intake');
    useDoor(d, 'metal-records-path');
    expect(d.e.talkEntry('metal-steward', d.s)).toBe('metal.steward.welcome');
    d.talk('metal-steward');
  });
  route.at(23, 'File the mineral-panel and coated-metal descriptions beside their own custody stages', ['evidence', 'certainty', 'interpretation', 'scope', 'methods-and-tools'], (d) => {
    readSign(d, 'metal-custody-repair');
    d.talk('metal-steward', 'Pin each slip');
    expect(d.done('metal.trace')).toBe(true);
    expect(d.s.flags['metal.custody.return']).toBeUndefined();
  });
  route.at(28, 'Open the window display with the panel readings and a blank clip for the maker', ['values', 'power', 'responsibility', 'justification', 'perspectives', 'ethics'], (d) => {
    d.talk('metal-steward', 'Put the two panel readings');
    expect(d.done('metal.publish')).toBe(true);
    readSign(d, 'metal-response-window');
  });
  route.at(35, 'Read the transfer docket to check which trip the two boxes actually shared', ['evidence', 'truth', 'certainty', 'scope'], (d) => {
    readSign(d, 'metal-custody-return');
    expect(d.done('metal.docket')).toBe(true);
  });
  route.at(40, 'Add the dated cart card without giving either panel a maker', ['truth', 'responsibility', 'justification', 'interpretation', 'ethics'], (d) => {
    d.talk('metal-steward', 'Add a dated cart card');
    expect(d.done('metal.finish')).toBe(true);
    readSign(d, 'metal-followup-notice');
  });
  if (turnedTag) {
    route.at(47, 'Turn the tag and replace it in separate runs on the same cord, then compare the two shop keys', [
      'evidence', 'objectivity', 'explanation', 'certainty', 'culture', 'scope', 'methods-and-tools',
    ], (d) => {
      for (const prop of ['metal-tag-transfer-note', 'metal-tag-coat-key']) readSign(d, prop);
      useDoor(d, 'metal-yard-return');
      readSign(d, 'metal-tag-fit-key');
      walkScene(d, 'metal-tag-bench', 'metal.tag.turn', 'Reset the stand', 'Keep the stand still', 'Leave the stand');
      expect(d.done('metal.tag.compared')).toBe(true);
    });
    route.at(50, 'File both runs by the index and show what would separate them', ['justification', 'culture', 'responsibility', 'ethics'], (d) => {
      useDoor(d, 'metal-records-path');
      walkScene(d, 'metal-tag-explanation-clips', 'metal.tag.place.hall');
      expect(d.done('metal.tag.explained')).toBe(true);
      readSign(d, 'metal-tag-handoff-hall');
    });
  }
  route.at(turnedTag ? 54 : 46, 'Make a copy with one line per box so more readers can check the records', ['perspective', 'objectivity', 'responsibility', 'perspectives', 'ethics'], (d) => {
    d.talk('metal-steward', 'Make a larger copy');
    expect(d.done('metal.copy')).toBe(true);
    readSign(d, 'metal-large-copy');
  });
  return route;
}

function checkCopyEdition(d: Driver, edition: 'press' | 'landing', missing: string): void {
  const table = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'copy-compare' && p.node === edition);
  expect(table, `${edition} has a comparison table`).toBeDefined();
  expect(check(table?.visibleIf, d.s), `${edition} table visible`).toBe(true);
  const result = compareCopy(edition);
  expect(result.before.claim).toBe('The return-slip line moved faster.');
  expect(result.after.claim).toBe(result.before.claim);
  expect(result.lost).toEqual([missing]);
  d.run({ type: 'CompareCopy', edition });
  expect(d.s.flags[`copies.checked.${edition}`]).toBe(true);
}

function cityOfCopies(): Route {
  const route = new Route();
  // Independent Chapter 7 session. The Trade Hall's transfer addition is already up.
  route.driver.s.objectivesDone.push('metal.finish');
  route.at(4, 'Read the clerk’s original observation with the day of the trial attached', ['evidence', 'certainty', 'scope'], (d) => {
    useDoor(d, 'copies-door');
    readSign(d, 'copies-source');
    expect(d.done('copies.arrival')).toBe(true);
  });
  route.at(10, 'Line up the original and press proof and find the trial day missing', ['evidence', 'objectivity', 'scope', 'methods-and-tools'], (d) => {
    useDoor(d, 'copies-press-path');
    d.talk('copies-presskeeper');
    checkCopyEdition(d, 'press', 'During Tuesday’s trial');
  });
  route.at(16, 'Check the landing copy against the press sheet and follow the loss of the clerk’s credit', ['evidence', 'objectivity', 'certainty', 'methods-and-tools'], (d) => {
    useDoor(d, 'copies-press-to-landing');
    checkCopyEdition(d, 'landing', 'Lending Clerk, trial log');
  });
  route.at(21, 'Pin the missing lines where each edition dropped them to show how the observation came to sound like a rule', ['truth', 'interpretation', 'explanation', 'scope'], (d) => {
    useDoor(d, 'copies-landing-to-press');
    d.talk('copies-presskeeper', 'Pin the missing time');
    expect(d.done('copies.compare')).toBe(true);
  });
  route.at(26, 'Mark the routes of full sheets and stall strips for readers who check different marks and names', ['perspective', 'culture', 'explanation', 'perspectives'], (d) => {
    useDoor(d, 'copies-press-return');
    readSign(d, 'copies-route-book');
    useDoor(d, 'copies-landing-path');
    d.talk('copies-lendingkeeper', 'Mark where the runners');
    expect(d.done('copies.trace')).toBe(true);
  });
  route.at(30, 'Send a dated correction along the routes that still carry older copies', ['values', 'power', 'responsibility', 'justification', 'ethics'], (d) => {
    d.talk('copies-lendingkeeper', 'Send correction strips');
    expect(d.done('copies.publish')).toBe(true);
    readSign(d, 'copies-response-strip');
  });
  route.at(36, 'Read the visitor’s question and see how the corrected trial line still sounded like an entry rule', ['interpretation', 'perspective', 'perspectives'], (d) => {
    readSign(d, 'copies-reader-note');
    expect(d.done('copies.feedback')).toBe(true);
  });
  route.at(41, 'Give the hall’s entry conditions a separate line from the dated trial observation', ['truth', 'responsibility', 'justification', 'scope', 'ethics'], (d) => {
    d.talk('copies-lendingkeeper', 'Ask the runners to put a separate entry line');
    expect(d.done('copies.revise')).toBe(true);
    readSign(d, 'copies-followup-notice');
  });
  route.at(44, 'Check the corrected proof against the landing copy and locate both restored lines', ['evidence', 'certainty', 'objectivity', 'methods-and-tools'], (d) => {
    const table = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'copies-compare-proof');
    expect(table?.node).toBe('proof');
    expect(check(table?.visibleIf, d.s)).toBe(true);
    expect(compareCopy('proof').restored).toEqual(['During Tuesday’s trial', 'Lending Clerk, trial log']);
    d.run({ type: 'CompareCopy', edition: 'proof' });
    expect(d.done('copies.proof')).toBe(true);
  });
  route.at(47, 'Put a larger copy where someone at the bench can read the rule and check its source', ['perspective', 'responsibility', 'values', 'perspectives', 'ethics'], (d) => {
    d.talk('copies-lendingkeeper', 'Put a larger copy');
    expect(d.done('copies.access')).toBe(true);
    readSign(d, 'copies-readable');
  });
  return route;
}

function checkSeaChart(d: Driver, chartId: 'harbour' | 'shoal', names: readonly string[], edge: number, limit: string): void {
  const board = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'sea-chart' && p.node === chartId);
  expect(board, `${chartId} has a chart board`).toBeDefined();
  expect(check(board?.visibleIf, d.s), `${chartId} board visible`).toBe(true);
  const chart = seaChart(chartId);
  expect(chart.marks.map((mark) => mark.name)).toEqual(names);
  expect(chart.edge).toBe(edge);
  expect(chart.marks.every((mark) => mark.x < chart.edge)).toBe(true);
  expect(chart.limit).toContain(limit);
  d.run({ type: 'ReadSeaChart', chart: chartId });
  expect(d.s.flags[`sea.read.${chartId}`]).toBe(true);
}

function cartographersSea(): Route {
  const route = new Route();
  // Independent Chapter 8 session. The City has already revised the entry notice.
  route.driver.s.objectivesDone.push('copies.revise');
  route.at(4, 'Hear which landmarks market carriers and boat crews start from', ['perspective', 'perspectives'], (d) => {
    useDoor(d, 'sea-door');
    d.talk('sea-harbourkeeper');
    expect(d.done('sea.arrival')).toBe(true);
  });
  route.at(9, 'Reveal three shore marks and the end of the walked survey at Market Rail', ['evidence', 'certainty', 'scope', 'methods-and-tools'], (d) => {
    checkSeaChart(d, 'harbour', ['Seagrass Steps', 'Lantern House', 'Market Rail'], 125, 'past it was not walked');
  });
  route.at(16, 'Reveal the boat crew’s sight point and Shoal Shelf within its surveyed strip', ['evidence', 'certainty', 'scope', 'methods-and-tools'], (d) => {
    useDoor(d, 'sea-shoal-path');
    checkSeaChart(d, 'shoal', ['Lantern House sight point', 'Shoal Shelf'], 113, 'outside that strip was not surveyed');
  });
  route.at(21, 'Check the draft page-edge claim against both surveys, then correct it at their shared landmark', ['truth', 'objectivity', 'interpretation', 'evidence', 'scope', 'methods-and-tools'], (d) => {
    useDoor(d, 'sea-shoal-to-chartroom');
    readSign(d, 'sea-edge-draft');
    d.talk('sea-cartographer', 'Pin both sheets');
    expect(d.done('sea.compare')).toBe(true);
    readSign(d, 'sea-edge-correction');
  });
  route.at(25, 'Use the route book to explain why different crews name places by the work they do there', ['culture', 'explanation', 'perspective', 'perspectives'], (d) => {
    readSign(d, 'sea-routebook');
    useDoor(d, 'sea-chartroom-return');
    d.talk('sea-harbourkeeper', 'Put the crew’s names');
    expect(d.done('sea.names')).toBe(true);
  });
  route.at(29, 'Give the shoal survey space without taking away the carriers’ shore plan', ['values', 'power', 'responsibility', 'justification', 'ethics'], (d) => {
    d.talk('sea-harbourkeeper', 'Give the shoal chart');
    expect(d.done('sea.publish')).toBe(true);
    readSign(d, 'sea-response-water');
  });
  route.at(36, 'Read why a visitor took the unwalked part of the shore for clear ground', ['interpretation', 'perspective', 'perspectives'], (d) => {
    readSign(d, 'sea-reader-note');
    expect(d.done('sea.feedback')).toBe(true);
  });
  route.at(41, 'Mark both survey edges so readers can check where the observations end', ['truth', 'certainty', 'responsibility', 'justification', 'scope', 'ethics'], (d) => {
    d.talk('sea-harbourkeeper', 'Mark both survey edges');
    expect(d.done('sea.finish')).toBe(true);
    readSign(d, 'sea-followup-notice');
  });
  route.at(47, 'Leave an accessible key with both local names and written survey limits', ['culture', 'responsibility', 'perspective', 'perspectives', 'ethics'], (d) => {
    d.talk('sea-harbourkeeper', 'Leave a wider key');
    expect(d.done('sea.access')).toBe(true);
    readSign(d, 'sea-wide-key');
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

  it('reports single-action windows without counting repeat attempts twice', () => {
    const encounters: TimedEncounter[] = [
      { minute: 4, action: 'Read the label', dimensions: ['evidence', 'scope'] },
      { minute: 8, action: 'Inspect the mark', dimensions: ['scope'] },
      { minute: 10, action: 'Read the label', dimensions: ['evidence'] },
    ];
    expect(singleActionDimensions(33, encounters)).toEqual(['evidence']);
    expect(singleActionDimensions(34, encounters)).toEqual(['evidence', 'scope']);
    expect(singleActionDimensions(29, encounters)).toEqual([]);
  });

  it.each([
    { name: 'Nexus main route into Emberford', end: 42, play: () => nexusToEmberford(false) },
    { name: 'Nexus and Emberford with optional stops', end: 85, play: () => nexusToEmberford(true) },
    { name: 'Nile first visit from a prepared Chapter 1 save', end: 50, play: () => nileDispatch() },
    { name: 'Nile first visit with the Reading Window', end: 53, play: () => nileDispatch('reading-window') },
    { name: 'Nile first visit with the Borrowed Mark stop', end: 55, play: () => nileDispatch('borrowed-mark') },
    { name: 'Nile route through Royal Records and the route model', end: 54, play: () => nileDispatch('royal-seal') },
    { name: 'Nile Royal Records route with the Tilt Tray stop', end: 57, play: () => nileDispatch('royal-seal', true) },
    { name: 'Preserved Lives from a prepared Chapter 2 save', end: 50, play: preservedLives },
    { name: 'Observatory Coast from a prepared Chapter 3 save', end: 50, play: () => observatoryCoast(false) },
    { name: 'Observatory Coast with the quay bell slip', end: 52, play: () => observatoryCoast(true) },
    { name: 'Living Forest from a prepared Chapter 4 save', end: 55, play: () => livingForest(false) },
    { name: 'Living Forest starting with the bridge route book', end: 55, play: () => livingForest(true) },
    { name: 'Metalworks from a prepared Chapter 5 save', end: 50, play: () => metalworks(false) },
    { name: 'Metalworks with the Turned Tag investigation', end: 57, play: () => metalworks(true) },
    { name: 'City of Copies from a prepared Chapter 6 save', end: 51, play: cityOfCopies },
    { name: 'Cartographers’ Sea from a prepared Chapter 7 save', end: 51, play: cartographersSea },
  ])('can execute the modeled route for $name and report its gaps', ({ name, end, play }) => {
    const route = play();
    const gaps = coverageGaps(end, route.encounters);
    if (import.meta.env.MODE !== 'tok-report') return;
    const opening = gaps.filter((gap) => gap.from === 30).map((gap) => gap.dimension);
    const narrow = singleActionDimensions(end, route.encounters);
    console.log([
      `\n${name} (${end} estimated minutes)`,
      ...route.encounters.map(({ minute, action, dimensions }) => `  ${minute}m  ${action} [${dimensions.join(', ')}]`),
      `Missing in the first 30m: ${opening.join(', ') || 'none in this trace'}`,
      'Trailing 30m gaps (end times of windows):',
      ...(gaps.length ? gaps.map(({ dimension, from, until }) =>
        `  ${dimension}: ${from}m ${until === null ? 'through the trace end' : `to before ${until}m`}`) : ['  None in this trace']),
      `Only one distinct annotated action in at least one full window: ${narrow.join(', ') || 'none in this trace'}`,
    ].join('\n'));
  });
});
