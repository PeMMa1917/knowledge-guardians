import { describe, expect, it } from 'vitest';
import { civicAllocation, type CivicRule, type CivicSample } from '../src/domain/civicConsole';
import { CIVIC_ARRIVAL_TRAYS, civicReceivingArrangements, civicReceivingLoad } from '../src/domain/civicArrivals';
import { curtainCall } from '../src/domain/curtainCall';
import { compareCopy } from '../src/domain/copyComparison';
import { councilClock, type CouncilTrial } from '../src/domain/councilClock';
import { forestWatch, type ForestWindow } from '../src/domain/forestWatch';
import { islandPlan, type IslandLanding, type IslandRoute } from '../src/domain/islandPlan';
import { marketComparison, type MarketBasis } from '../src/domain/marketScale';
import { readMetalSample } from '../src/domain/metalSample';
import { check } from '../src/domain/rules';
import { scoutNextTrial, scoutReport, scoutTrials } from '../src/domain/scoutRoutes';
import { seaChart } from '../src/domain/seaCharts';
import { stageRehearsal, type StageCue } from '../src/domain/stageRehearsal';
import { voiceReading, type VoiceSource, type VoiceView } from '../src/domain/voiceReadings';
import { waterTrial, type WaterCondition, type WaterSetting } from '../src/domain/waterGate';
import { MAPS } from '../src/maps';
import { coverageGaps, singleActionDimensions, type TimedEncounter } from '../tools/tok-coverage';
import { Driver } from './driver';

type Format = 'object inspection' | 'source tracing' | 'tool trials' | 'field observations'
  | 'archive tools' | 'record reading' | 'map visits' | 'conversations' | 'environmental choices'
  | 'public debate' | 'label building' | 'forging';
type Command = Parameters<Driver['run']>[0];
const commandFormats: Partial<Record<Command['type'], Format>> = {
  InspectExhibit: 'object inspection',
  UseLens: 'object inspection',
  FollowThread: 'source tracing',
  RunSimulation: 'tool trials',
  NileRouteTrial: 'tool trials',
  CompareMetalSample: 'tool trials',
  CompareAssay: 'tool trials',
  RunStageRehearsal: 'tool trials',
  WeighMarketLots: 'tool trials',
  RunWaterTrial: 'tool trials',
  RunCivicTrial: 'tool trials',
  RunIslandPlan: 'tool trials',
  RunCouncilClock: 'tool trials',
  RunScoutRoute: 'tool trials',
  ReviewScoutProtocol: 'tool trials',
  RunVoiceReading: 'archive tools',
  ReadClue: 'record reading',
  CompareCopy: 'archive tools',
  ReadSeaChart: 'archive tools',
  Reach: 'map visits',
  ObserveForest: 'field observations',
  ShowdownStart: 'public debate',
  ShowdownMove: 'public debate',
  BuildLabel: 'label building',
  Forge: 'forging',
};

class AuditDriver extends Driver {
  readonly formats = new Set<Format>();

  override run(command: Command) {
    const result = super.run(command);
    const format = commandFormats[command.type];
    if (format) this.formats.add(format);
    return result;
  }

  override talk(who: string, ...picks: string[]): void {
    super.talk(who, ...picks);
    this.formats.add('conversations');
  }
}

type Play = (driver: AuditDriver) => void;
type PlayedEncounter = TimedEncounter & { formats: Format[] };

class Route {
  readonly driver = new AuditDriver();
  readonly encounters: PlayedEncounter[] = [];

  at(minute: number, action: string, dimensions: TimedEncounter['dimensions'], play: Play): void {
    this.driver.formats.clear();
    play(this.driver);
    this.encounters.push({ minute, action, dimensions, formats: [...this.driver.formats] });
  }

  formatsThrough(minute: number): Format[] {
    return [...new Set(this.encounters.filter((encounter) => encounter.minute <= minute)
      .flatMap((encounter) => encounter.formats))].sort();
  }
}

function walkScene(d: AuditDriver, id: string, next?: string, ...picks: string[]): void {
  const prop = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'scene');
  if (!prop?.node) throw new Error(`Missing scene prop ${id}`);
  expect(check(prop.visibleIf, d.s), `${id} visible`).toBe(true);
  const choice = next ? d.e.visibleOptions(prop.node, d.s).find(({ option }) => option.next === next) : undefined;
  if (next && !choice) throw new Error(`Missing choice from ${id} to ${next}`);
  d.walk(prop.node, choice ? [choice.option.text, ...picks] : picks);
  d.formats.add('environmental choices');
}

function useProp(id: string, choice: string): Play {
  return (d) => {
    walkScene(d, id, `${id}.${choice}`);
    expect(d.s.flags[id], `${id} consequence`).toBe(choice);
  };
}

function useDoor(d: AuditDriver, id: string): void {
  const door = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'door');
  expect(door?.to, `${id} destination`).toBeDefined();
  expect(check(door!.visibleIf, d.s) && check(door!.openIf, d.s), `${id} open`).toBe(true);
  if (door!.flag) d.run({ type: 'SetFlag', flag: door!.flag, value: true });
  d.s.mapId = door!.to!.map;
  d.formats.add('map visits');
}

function readSign(d: AuditDriver, id: string): string {
  const sign = MAPS[d.s.mapId].interactables.find((p) => p.id === id && p.kind === 'sign');
  if (!sign?.text) throw new Error(`Missing sign text for ${id}`);
  expect(check(sign.visibleIf, d.s), `${id} visible`).toBe(true);
  if (sign.flag) d.run({ type: 'SetFlag', flag: sign.flag, value: true });
  d.formats.add('record reading');
  return sign.text;
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
function nexusToEmberford(style: 'main' | 'explore' | 'records' | 'guide' | 'rests' | 'ribbon' | 'print' | 'packing' | 'scout' | 'viewer' | 'curtain' | 'last-turn'): Route {
  const route = new Route();
  const explore = style !== 'main';
  const records = style === 'records';
  const guide = style === 'guide';
  const print = style === 'print';
  const packing = style === 'packing';
  const scouting = style === 'scout';
  const curtain = style === 'curtain';
  const arrivalExtra = explore ? 1 : 0;
  const arrival = records ? 'Leave a stand number with the copied claim, then find that stand on the plan'
    : explore ? 'Clip a blank page beside the archive’s words and open it for a second view'
      : 'Question the label carrying the archive seal';
  route.at(3 + arrivalExtra, arrival, explore ? ['power', 'truth', 'evidence', 'scope'] : ['power', 'truth'], (d) => {
    d.walk('cold.open', explore ? [records ? 'Copy the stand number' : 'Clip a blank page'] : []);
    if (explore) {
      const display = records ? 'reference' : 'view';
      expect(d.s.flags['nexus.arrival.note']).toBe(display);
      walkScene(d, `nexus-arrival-${display}`, `cold.arrival-${display}-read`);
    }
    d.run({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
    d.talk('warden-ise', 'How can all three');
    expect(d.done('m01.o1.look')).toBe(true);
  });
  if (guide) {
    route.at(6, 'Check the same arrow with readers approaching from the door and the cases', [
      'interpretation', 'perspective', 'perspectives', 'explanation', 'objectivity', 'scope', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'nexus-guide-start', 'nexus.guide.accepted');
      walkScene(d, 'nexus-guide-door-trial', 'nexus.guide.door-seen');
      walkScene(d, 'nexus-guide-case-trial', 'nexus.guide.case-seen');
    });
    route.at(8, 'Use a shared landmark so visitors can follow the sign regardless of their approach', ['values', 'responsibility', 'justification', 'ethics'], (d) => {
      walkScene(d, 'nexus-guide-mount', 'nexus.guide.landmark-set');
      walkScene(d, 'nexus-guide-landmark', 'nexus.guide.landmark-read');
      expect(d.done('nexus.guide.helped')).toBe(true);
    });
  }
  if (style === 'rests') {
    route.at(6, 'Move the used counters and compare loans with the requests still waiting at the table', [
      'evidence', 'scope', 'perspective', 'perspectives', 'interpretation', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'nexus-rest-counter', 'nexus.rest.counter-read');
      walkScene(d, 'nexus-rest-request', 'nexus.rest.requests-read');
      expect(d.s.flags['nexus.rest.counted']).toBe(true);
      expect(d.s.flags['nexus.rest.waiting']).toBe(true);
    });
    route.at(8, 'Set both rests together so the readers can compare the two copies directly', [
      'values', 'power', 'justification', 'ethics',
    ], (d) => {
      walkScene(d, 'nexus-rest-bench', 'nexus.rest.pair-plan');
      walkScene(d, 'nexus-rest-pair-slot', 'nexus.rest.pair-placed');
      expect(d.s.flags['nexus.rest.layout']).toBe('together');
      expect(d.done('nexus.rest.checked')).toBe(false);
    });
    route.at(9, 'Keep the landing reading group’s request on its own line beside the loan count', [
      'responsibility', 'culture', 'scope', 'perspectives', 'ethics',
    ], (d) => {
      expect(d.e.node('nexus.rest.pair-ready').text).toContain('single slip for the whole group');
      walkScene(d, 'nexus-rest-pair-ready', 'nexus.rest.pair-read');
      expect(d.done('nexus.rest.checked')).toBe(true);
    });
  }
  if (print) {
    route.at(7, 'Recover a ferry print by changing how the same two sheets line up', [
      'objectivity', 'explanation', 'evidence', 'interpretation', 'truth', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'nexus-print-setup', 'nexus.print.edge-placed');
      expect(d.e.node('nexus.print.edge').text).toContain('sits out in the river');
      walkScene(d, 'nexus-print-edge', 'nexus.print.pins-placed');
      expect(d.s.flags['nexus.print.tried-edge']).toBe(true);
      expect(d.e.node('nexus.print.pinned').text).toContain('marks now meet the ends');
    });
    route.at(9, 'Send a key with both print layers so the next printer can distinguish ferry and cart signs', [
      'values', 'perspective', 'perspectives', 'scope', 'responsibility', 'justification', 'culture', 'ethics',
    ], (d) => {
      expect(d.e.node('nexus.print.pinned').text).toContain('Cart crews read red as a place to stop');
      walkScene(d, 'nexus-print-pinned', 'nexus.print.layers');
      expect(d.done('nexus.print.checked')).toBe(true);
      expect(d.s.flags['nexus.print.edition']).toBe('layers');
      walkScene(d, 'nexus-print-layers');
      expect(d.e.node('nexus.print.layers').text).toContain('The shelter will get a proof after the next printing');
    });
  }
  if (packing) {
    route.at(7, 'Test the wallet with the source slips under the crate lid and see which papers stay behind', [
      'evidence', 'certainty', 'methods-and-tools', 'scope',
    ], (d) => {
      walkScene(d, 'nexus-pack-prep', 'nexus.pack.outer-placed');
      walkScene(d, 'nexus-pack-outer', 'nexus.pack.outer-tested');
      expect(d.e.node('nexus.pack.outer-tested').text).toContain('Both red slips are still at the rack');
    });
    route.at(9, 'Repack the same eight sheets with a source slip in each wallet and repeat the gate trial', [
      'evidence', 'objectivity', 'explanation', 'truth', 'interpretation', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'nexus-pack-ready-outer', 'nexus.pack.reopened');
      walkScene(d, 'nexus-pack-prep', 'nexus.pack.kits-placed');
      walkScene(d, 'nexus-pack-kits', 'nexus.pack.kits-tested');
      expect(d.e.node('nexus.pack.kits-tested').text).toContain('Three sketches and a slip come out together');
    });
    route.at(11, 'Give the runner a grouped tag so each keeper can check the sketches that arrive', [
      'power', 'values', 'responsibility', 'justification', 'ethics', 'perspective', 'perspectives',
    ], (d) => {
      walkScene(d, 'nexus-pack-ready-kits', 'nexus.pack.route-tagged');
      walkScene(d, 'nexus-pack-dock-route', 'nexus.pack.kits-route');
      expect(d.s.flags['nexus.pack.sent']).toBe('kits-route');
      expect(d.done('nexus.pack.checked')).toBe(true);
      walkScene(d, 'nexus-pack-kits-route');
    });
  }
  if (curtain) {
    route.at(7, 'Try the same three knocks at the rail and from behind the curtain while Ethren compares crew practices', [
      'culture', 'evidence', 'objectivity', 'explanation', 'perspective', 'perspectives', 'methods-and-tools',
    ], (d) => {
      d.talk('curtain-ethren', 'Mark the two places');
      for (const station of ['open', 'curtain'] as const) {
        const prop = MAPS[d.s.mapId].interactables.find(({ id }) => id === `curtain-call-${station}`)!;
        expect(check(prop.visibleIf, d.s)).toBe(true);
        for (const index of [0, 1, 2]) d.run({ type: 'ChooseDialogueOption', node: `curtain.run.${station}`, index });
      }
      d.formats.add('tool trials');
      expect(curtainCall('open', 3).map(({ heard }) => heard)).toEqual([true, true, true]);
      expect(curtainCall('curtain', 3).map(({ heard }) => heard)).toEqual([true, false, true]);
      expect(d.done('curtain.compare')).toBe(true);
    });
    route.at(10, 'Pad the latch so the quiet corner receives the whole call, then check the count with Ethren', [
      'certainty', 'values', 'responsibility', 'justification', 'culture', 'ethics',
    ], (d) => {
      d.talk('curtain-ethren', 'Slide a pad');
      walkScene(d, 'curtain-end-felt', undefined, 'Wait with Ethren');
      walkScene(d, 'curtain-gift-felt', undefined, 'Take the spare felt');
      expect(d.s.inventory['item.curtain.felt']).toBe(1);
      expect(d.done('curtain.receive')).toBe(true);
    });
  }
  const openingMinutes = arrivalExtra + (guide ? 4 : 0) + (style === 'rests' || print ? 5 : 0) + (packing ? 6 : 0) + (curtain ? 6 : 0);
  if (explore) route.at(5 + openingMinutes, 'Direct visitors toward the practical pen', ['scope', 'perspective'], useProp('nexus.entrance-guide', 'use'));
  route.at(9 + openingMinutes, 'Compare the patent, model and pen dates', ['scope', 'evidence', 'certainty', 'interpretation', 'methods-and-tools'], (d) => {
    for (const exhibit of ['OBJ-001-A', 'OBJ-001-B', 'OBJ-001-C']) d.run({ type: 'InspectExhibit', exhibit });
    for (const exhibit of ['OBJ-001-A', 'OBJ-001-C']) d.run({ type: 'UseLens', exhibit });
    expect(d.done('m01.o3.lens')).toBe(true);
  });
  const caseMinutes = style === 'ribbon' ? 3 : style === 'viewer' ? 5 : 0;
  if (style === 'ribbon') route.at(13, 'Put the grant date and the museum’s date range on separate rails and link them for comparison', [
    'certainty', 'evidence', 'truth', 'scope', 'interpretation', 'culture', 'responsibility', 'perspectives', 'methods-and-tools', 'ethics',
  ], (d) => {
    expect(d.s.flags['inspected.OBJ-001-A']).toBe(true);
    expect(d.s.flags['inspected.OBJ-001-C']).toBe(true);
    walkScene(d, 'nexus-ribbon-setup', 'nexus.ribbon.split-placed');
    expect(d.e.node('nexus.ribbon.split-placed').text).toContain('30 October 1888');
    expect(d.e.node('nexus.ribbon.split-placed').text).toContain('1945 to 1948');
    expect(d.e.node('nexus.ribbon.split').text).toContain('date the pen by the fair');
    walkScene(d, 'nexus-ribbon-split', 'nexus.ribbon.bridged');
    expect(d.done('nexus.ribbon.checked')).toBe(true);
    walkScene(d, 'nexus-ribbon-bridged');
    expect(d.e.node('nexus.ribbon.bridged').text).toContain('leaves the start of use blank');
  });
  if (style === 'viewer') {
    route.at(12, 'Magnify the point and fold the reader back to check how the window changes the evidence in view', [
      'evidence', 'objectivity', 'explanation', 'interpretation', 'certainty', 'scope', 'methods-and-tools',
    ], (d) => {
      expect(d.s.flags['inspected.OBJ-001-A']).toBe(true);
      walkScene(d, 'nexus-viewer-start', 'nexus.viewer.detail-check');
      expect(d.e.node('nexus.viewer.detail-check').text).toContain('covers the file number and grant line');
      walkScene(d, 'nexus-viewer-preview-detail', 'nexus.viewer.sheet-check');
      expect(d.e.node('nexus.viewer.sheet-check').text).toContain('the grant line and number back');
      expect(d.done('nexus.viewer.compared')).toBe(true);
    });
    route.at(15, 'Help the repair reader find the file and keep the working-model check separate from the drawing', [
      'truth', 'power', 'values', 'justification', 'responsibility', 'perspective', 'perspectives', 'ethics', 'scope',
    ], (d) => {
      walkScene(d, 'nexus-viewer-preview-sheet', 'nexus.viewer.hang-detail');
      walkScene(d, 'nexus-viewer-detail', 'nexus.viewer.fixed-detail');
      expect(d.done('nexus.viewer.finished')).toBe(true);
      walkScene(d, 'nexus-viewer-fixed-detail');
      expect(d.e.node('nexus.viewer.seen-detail').text).toContain('U.S. Patent 392,046');
      expect(d.e.node('nexus.viewer.seen-detail').text).toContain('a separate question about a model’s behaviour');
    });
  }
  if (explore) route.at(12 + openingMinutes + caseMinutes, 'Send competing translations back together', ['culture', 'interpretation', 'perspectives'], useProp('nexus.translation-slip', 'gloss'));
  if (records) {
    route.at(15 + openingMinutes, 'Check the model date and turn over the curator’s seal to see what it actually certifies', ['evidence', 'power', 'certainty', 'scope', 'methods-and-tools'], (d) => {
      d.run({ type: 'UseLens', exhibit: 'OBJ-001-B' });
      d.talk('curator-dace', 'Why do you favour');
      d.talk('curator-dace', 'Turn over the seal', 'Lift the backing', 'Set a card beside the seal');
    });
    route.at(19 + openingMinutes, 'Put the model’s build date beside the narrower handling seal and trace it at the case', ['truth', 'responsibility', 'scope', 'justification', 'ethics'], (d) => {
      d.run({ type: 'BuildLabel', kit: 'nexus.handling-seal', subject: 'model', criterion: 'paired', limit: 'build' });
      walkScene(d, 'nexus-seal-case', 'nexus.seal.paired-read');
      expect(d.done('nexus.seal.checked')).toBe(true);
    });
  }
  const extra = openingMinutes + caseMinutes + (records ? 7 : 0);
  route.at(16 + extra, 'Compare two mark strips using the same pen', ['objectivity', 'explanation', 'methods-and-tools'], (d) => {
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'paper' });
    d.run({ type: 'RunSimulation', pen: 'loud-model', surface: 'leather' });
    expect(d.done('m01.o4.test')).toBe(true);
  });
  route.at(22 + extra, 'Hear the curator and clerk, then reframe their disagreement for the crowd', ['perspective', 'values', 'justification', 'perspectives'], (d) => {
    if (!records) d.talk('curator-dace', 'Why do you favour');
    d.talk('clerk-venn', 'Does a patent prove');
    d.run({ type: 'ShowdownStart', showdown: 'practice' });
    d.moves({ move: 'claim', claim: 'practical' }, { move: 'support', card: 'card.dpma-history' },
      { move: 'support', card: 'card.biro-object' }, { move: 'concede' }, { move: 'reframe' }, { move: 'rest' });
    expect(d.done('m01.o5.practice')).toBe(true);
  });
  if (explore) route.at(25 + extra, 'Publish a checkable loan number while withholding a maker’s name', ['responsibility', 'ethics'], useProp('nexus.loan-slip', 'number'));
  route.at(28 + extra, 'Put up a limited label, then hear visitors compare it with what “first” meant back home', ['evidence', 'truth', 'culture', 'justification', 'responsibility', 'scope', 'ethics'], (d) => {
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
  if (guide) {
    route.at(37, 'Follow the washhouse water from the head peg to the dry tray and the clogged screen', [
      'evidence', 'explanation', 'scope', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'washhouse-intake', 'washhouse.intake.note');
      walkScene(d, 'washhouse-tail', 'washhouse.tail.note');
      walkScene(d, 'washhouse-screen', 'washhouse.screen.note');
      expect(d.done('washhouse.o.trace')).toBe(true);
    });
    route.at(40, 'Use the one available helper to make a dry crossing and leave a separate order for the tray', [
      'perspective', 'perspectives', 'power', 'values', 'responsibility', 'ethics',
    ], (d) => {
      walkScene(d, 'washhouse-board', 'washhouse.order.step');
      expect(d.done('washhouse.o.order')).toBe(true);
    });
    route.at(44, 'Check the same head mark and verify that the new crossing is dry while the rinse tray still needs work', [
      'truth', 'certainty', 'objectivity', 'justification', 'scope', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'washhouse-head-again', 'washhouse.head-matched');
      walkScene(d, 'washhouse-step-check', 'washhouse.end.step');
      expect(d.done('washhouse.o.recheck')).toBe(true);
      readSign(d, 'washhouse-step-note');
    });
  }
  if (print) {
    route.at(38, 'Bring back the passed-over museum entry and workshop history for the same one-name tag', [
      'evidence', 'truth', 'certainty', 'interpretation', 'scope', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'hands-strap', 'hands.look');
      walkScene(d, 'hands-tray', 'hands.receipt.held');
      expect(d.done('hands.o.compare')).toBe(true);
      expect(d.s.cards).toEqual(expect.arrayContaining(['card.biro-object', 'card.dpma-history']));
    });
    route.at(41, 'Keep the short mark for deliveries and clip the fuller attribution behind it', [
      'power', 'perspective', 'perspectives', 'justification', 'responsibility', 'ethics', 'scope',
    ], (d) => {
      walkScene(d, 'hands-return', 'hands.end.concede');
      expect(d.done('hands.o.revise')).toBe(true);
      expect(readSign(d, 'hands-concede')).toContain('Idris left room for another tag');
    });
  }
  if (scouting) {
    route.at(34, 'Send the same cart after identical blocked reports, then see a scout without notes open the clear way', [
      'evidence', 'truth', 'objectivity', 'interpretation', 'certainty', 'scope', 'methods-and-tools',
    ], (d) => {
      const board = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'scout-turn-board');
      expect(board?.kind).toBe('scout-table');
      expect(check(board?.visibleIf, d.s)).toBe(true);
      const first = 'orchard';
      for (const protocol of ['informed', 'independent'] as const) {
        const trial = scoutNextTrial(0);
        expect(scoutTrials(first, protocol)[trial]).toEqual({ first, clear: 'arch', slip: 'steps', opened: 'steps', other: 'arch' });
        d.run({ type: 'RunScoutRoute', protocol, first, trial, decision: 'change' });
        expect(d.s.flags[`scout.result.${protocol}`]).toBe('change.fits');
      }
      const trial = scoutNextTrial(1);
      expect(scoutTrials(first, 'independent')[trial].other).toBeNull();
      d.run({ type: 'RunScoutRoute', protocol: 'independent', first, trial, decision: 'revealed' });
      expect(d.s.flags['scout.result.independent']).toBe('revealed.fits');
    });
    route.at(37, 'Compare the full sets of deals and limit the rule to rounds where a scout reported a blocked route', [
      'evidence', 'explanation', 'certainty', 'justification', 'scope', 'methods-and-tools',
    ], (d) => {
      expect(scoutReport(scoutTrials('orchard', 'informed'))).toEqual({ rounds: 6, revealed: 0, blocked: 6, hold: 2, change: 4 });
      expect(scoutReport(scoutTrials('orchard', 'independent'))).toEqual({ rounds: 6, revealed: 2, blocked: 4, hold: 2, change: 2 });
      for (const protocol of ['informed', 'independent'] as const) {
        d.run({ type: 'ReviewScoutProtocol', protocol });
        expect(d.s.flags[`scout.checked.${protocol}`]).toBe(true);
      }
      expect(d.done('scout.o.compare')).toBe(true);
    });
    route.at(40, 'Post the route instruction with the scout’s access to the route notes made explicit', [
      'power', 'values', 'perspective', 'responsibility', 'justification', 'ethics',
    ], (d) => {
      walkScene(d, 'scout-brief', 'scout.sent.briefed');
      expect(d.s.flags['scout.notice']).toBe('briefed');
      expect(readSign(d, 'scout-notice-briefed')).toContain('a blocked report with these notes');
    });
  }
  const emberfordExtra = extra + (guide ? 11 : 0) + (print ? 7 : 0) + (scouting ? 10 : 0);
  route.at(33 + emberfordExtra, 'Question a seller about his blade and inspect the object', ['power', 'evidence'], (d) => {
    d.talk('merchant-corvan', 'How do you know');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-003-AE' });
    expect(d.done('m02.o2.claim')).toBe(true);
  });
  route.at(39 + emberfordExtra, 'Follow the provenance thread and find where the record ends', ['certainty', 'truth', 'scope', 'methods-and-tools'], (d) => {
    for (const node of ['stall', 'ledger', 'workshop']) d.run({ type: 'FollowThread', thread: 'blade', node });
    expect(d.done('m02.o3.thread')).toBe(true);
  });
  if (explore) {
    route.at(44 + emberfordExtra, 'Arrange a repeat water reading from a fixed mark', ['objectivity', 'explanation', 'methods-and-tools'], useProp('emberford.gauge', 'repeat'));
    route.at(49 + emberfordExtra, 'Keep both weights and loaf counts for different readers', ['perspective', 'values', 'perspectives'], useProp('emberford.tally', 'loaves'));
    route.at(53 + emberfordExtra, 'Hang the sketch of the safe bridge approach', ['responsibility', 'ethics'], useProp('emberford.repair-notice', 'sketch'));
    route.at(57 + emberfordExtra, 'Keep the sample separate from the untraced blade', ['interpretation', 'justification', 'scope'], useProp('emberford.pattern-order', 'record'));
    route.at(64 + emberfordExtra, 'Compare the workshop’s test sample with the seller’s blade', ['evidence', 'explanation', 'objectivity', 'methods-and-tools'], (d) => {
      d.talk('smith-hesper', 'Can I try it');
      d.talk('scholar-sefa', 'What is wootz');
      d.run({ type: 'InspectExhibit', exhibit: 'OBJ-002' });
      for (const action of ['stack', 'stack', 'weld', 'fold', 'cut'] as const) d.run({ type: 'Forge', action });
      d.run({ type: 'InspectExhibit', exhibit: 'AE-ASSAY' });
      d.run({ type: 'CompareAssay' });
      expect(d.done('m02.o4.forge')).toBe(true);
    });
    route.at(71 + emberfordExtra, 'Narrow the maker’s claim before the market crowd', ['truth', 'justification', 'perspective', 'perspectives'], (d) => {
      d.talk('merchant-corvan', 'In the square');
      d.run({ type: 'ShowdownStart', showdown: 'corvan' });
      d.moves({ move: 'claim', claim: 'honest' }, { move: 'support', card: 'card.workshop-diagram' },
        { move: 'counter', card: 'card.forge-pattern' }, { move: 'support', card: 'card.guild-ledger' }, { move: 'rest' });
      expect(d.done('m02.o5.showdown')).toBe(true);
    });
    if (style === 'last-turn') {
      route.at(74 + emberfordExtra, 'Lift Derva’s slate and compare the apprentice’s retained turn with the tally clerk’s closed entry', [
        'culture', 'interpretation', 'evidence', 'perspective', 'perspectives', 'methods-and-tools',
      ], (d) => {
        walkScene(d, 'last-turn.slate', undefined, 'Lift Derva’s slate');
        expect(readSign(d, 'last-turn.forge')).toContain('hold a turn');
        expect(readSign(d, 'last-turn.desk')).toContain('its entry is closed');
        expect(d.done('last-turn.compare')).toBe(true);
      });
      route.at(76 + emberfordExtra, 'Give buyers their collection turn and reserve a dated place for the back-row account', [
        'values', 'power', 'responsibility', 'justification', 'perspectives', 'ethics',
      ], (d) => {
        walkScene(d, 'last-turn.post', undefined, 'Release the queue');
        expect(readSign(d, 'last-turn.file')).toContain('They have only this stub');
        expect(d.done('last-turn.publish')).toBe(true);
      });
      route.at(78 + emberfordExtra, 'Arrange a bench handover while keeping the forge’s repair mark separate from the archive’s receipt', [
        'culture', 'interpretation', 'values', 'perspective', 'perspectives', 'ethics',
      ], (d) => {
        d.talk('smith-hesper', 'Yes. Come');
        expect(d.done('m02.o6.hesper')).toBe(true);
      });
      route.at(84 + emberfordExtra, 'Set a traceable source beside Sefa’s song, then use the cellar’s six-lamp entrance', [
        'evidence', 'responsibility', 'methods-and-tools',
      ], (d) => {
        // This variant arrives with four other local knots and the guild half of Words That Hold already resolved.
        for (const puzzle of ['weigh-house', 'tipped-cart', 'map-table', 'brass-sorter', 'guild-notice']) {
          d.run({ type: 'SetFlag', flag: `puzzle.${puzzle}.done`, value: true });
        }
        expect(d.s.flags['lamps.lit']).toBe(5);
        d.run({ type: 'PuzzleOrder', puzzle: 'song-bridge', order: ['author', 'title', 'container', 'publisher', 'date', 'location'] });
        useDoor(d, 'cellar-door');
        expect(d.done('lamp.o3.cellar')).toBe(true);
      });
      route.at(86 + emberfordExtra, 'Open Derva’s dated intake in the Study and keep her back-row account apart from the speaking tally', [
        'interpretation', 'values', 'responsibility', 'evidence', 'scope', 'ethics',
      ], (d) => {
        walkScene(d, 'last-turn.study-intake', undefined, 'Open her intake sleeve');
        expect(readSign(d, 'last-turn.study-file')).toContain('where the first hearing stopped');
        expect(d.done('last-turn.follow')).toBe(true);
      });
      return route;
    }
    if (records) {
      route.at(75 + extra, 'Read the guild’s deadline and the ferry crew’s marks for the same order', ['culture', 'evidence', 'perspective', 'perspectives'], (d) => {
        walkScene(d, 'bell-order-clerk', 'bell.order.clerk.trace');
        walkScene(d, 'bell-order-ferry', 'bell.order.ferry.trace');
        expect(d.done('bell.order.o.collect')).toBe(true);
      });
      route.at(79 + extra, 'Match the notches to verify the shared order and distinguish handover from an arrival time', [
        'objectivity', 'truth', 'interpretation', 'certainty', 'scope', 'methods-and-tools',
      ], (d) => {
        walkScene(d, 'bell-order-board', 'bell.order.align.proof');
        expect(d.done('bell.order.o.align')).toBe(true);
      });
      route.at(83 + extra, 'Post the paired order with distinct headings and leave the missing arrival open', ['values', 'power', 'responsibility', 'justification', 'ethics'], (d) => {
        walkScene(d, 'bell-order-proof', 'bell.order.end.pair');
        expect(d.done('bell.order.o.post')).toBe(true);
        readSign(d, 'bell-order-pair');
      });
    }
    const later = emberfordExtra + (records ? 12 : 0);
    route.at(76 + later, 'Compare the order record, workshop consent and Sefa’s source packet', ['certainty', 'interpretation', 'scope', 'ethics'], (d) => {
      walkScene(d, 'copy-spare', 'copy.started');
      for (const prop of ['copy-order', 'copy-consent', 'copy-anchor']) walkScene(d, prop);
      expect(d.done('copy.o.trace')).toBe(true);
    });
    route.at(81 + later, 'Use the market’s spoken handover and leave a source people can check', ['power', 'culture', 'values', 'responsibility', 'perspectives', 'ethics'], (d) => {
      walkScene(d, 'copy-board', 'copy.plan.market');
      walkScene(d, 'copy-west-handover', 'copy.end.market');
      expect(d.done('copy.o.relay')).toBe(true);
    });
  }
  return route;
}

type NileFirstLead = 'workers' | 'reading-window' | 'borrowed-mark' | 'lamp-slip' | 'closing-peg' | 'royal-seal';

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
  if (lead === 'lamp-slip') route.at(22, 'Return the lamp above the same slip to check the groove count and keep two uses for the marks distinct', [
    'truth', 'certainty', 'culture', 'explanation', 'objectivity', 'evidence', 'justification', 'scope', 'methods-and-tools',
  ], (d) => {
    walkScene(d, 'nile-lamp-slip', 'nile.lamp.above', 'Move the lamp to the side', 'Return the lamp above', 'Leave a guide beside');
    expect(d.done('nile.lamp.compare')).toBe(true);
    expect(d.done('nile.lamp.file')).toBe(true);
    readSign(d, 'nile-lamp-note-desk');
  });
  if (lead === 'closing-peg') route.at(22, 'Open both closed slips and use the later stoppage to separate a recorded delivery from a settled dispute', [
    'truth', 'certainty', 'culture', 'evidence', 'scope', 'interpretation', 'justification',
  ], (d) => {
    walkScene(d, 'nile-closing-peg', 'nile.closing.stock', 'Put the slip back with its box showing',
      'Turn over the lending bench slip', 'Put the slip back with both voices showing', 'Lay both slips beside',
      'Leave a second voice open');
    expect(d.done('nile.closing.post')).toBe(true);
    expect(d.s.flags['nile.closing.post']).toBe('bench');
    expect(readSign(d, 'nile-closing-bench')).toContain('the workers stopped again');
  });
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

function nileDispatch(lead: NileFirstLead = 'workers', mapStop?: 'tilt-tray' | 'wayfinding', checkTransit = false): Route {
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
  const extra = { workers: 0, 'reading-window': 3, 'borrowed-mark': 5, 'lamp-slip': 4, 'closing-peg': 3, 'royal-seal': 4 }[lead]
    + (mapStop === 'wayfinding' ? 6 : mapStop === 'tilt-tray' ? 3 : 0);
  const enterMapRoom = (d: AuditDriver) => {
    if (lead !== 'borrowed-mark') useDoor(d, royal ? 'royal-back' : 'workyard-back');
    useDoor(d, 'nile-maps');
    d.run({ type: 'InspectExhibit', exhibit: 'OBJ-NILE-MINE' });
  };
  if (mapStop === 'tilt-tray') route.at(29, 'Compare the same block on a level and raised tray and pin the limited explanation beside the cart',
    ['objectivity', 'explanation', 'evidence', 'methods-and-tools'], (d) => {
      enterMapRoom(d);
      d.talk('nile-marek', 'Try the tilt tray', 'Set the tray level', 'Reset the tray', 'Raise the same tray', 'Pin a note', 'Carry the two settings');
      expect(d.done('nile.tray.compare')).toBe(true);
      readSign(d, 'nile-tilt-note-cart');
    });
  if (mapStop === 'wayfinding') {
    route.at(24, 'Read the same room from both ends and check what the square means in a carrier handover', [
      'truth', 'evidence', 'certainty', 'culture', 'interpretation', 'perspective', 'perspectives', 'scope',
    ], (d) => {
      enterMapRoom(d);
      expect(readSign(d, 'nile-way-aisle-view')).toContain('map case is on your left');
      expect(readSign(d, 'nile-way-shelf-view')).toContain('map case is now on your right');
      expect(readSign(d, 'nile-way-carrier-note')).toContain('marks the crate rack with a square');
    });
    route.at(29, 'Rotate the sketch without moving the landmarks, then leave one guide with the case and crate paths', [
      'objectivity', 'explanation', 'methods-and-tools', 'justification', 'scope', 'responsibility',
    ], (d) => {
      walkScene(d, 'nile-way-board', undefined, 'Hold the room marks steady', 'Set out the revised room guide', 'Put one guide on the board');
      expect(d.done('nile.way.compare')).toBe(true);
      expect(d.s.flags['nile.way.layout']).toBe('fixed');
      expect(readSign(d, 'nile-way-fixed-read')).toContain('carrier follows the crate line');
      expect(d.done('nile.way.publish')).toBe(true);
    });
  }
  route.at(27 + extra, 'Compare two model roads and choose what travels', ['objectivity', 'explanation', 'values', 'justification', 'scope', 'methods-and-tools'], (d) => {
    if (!mapStop) enterMapRoom(d);
    d.run({ type: 'NileRouteTrial', road: 'ridge' });
    d.run({ type: 'NileRouteTrial', road: 'wash' });
    d.run({ type: 'NileDelivery', choice: royal ? 'cast' : 'copy' });
    expect(d.done('nile.routes')).toBe(true);
  });
  route.at(31 + extra, 'Leave the next keeper the conditions of the model trial', ['certainty', 'scope', 'methods-and-tools'], useProp('nile.model-handover', 'repeat'));
  if (checkTransit) route.at(35 + extra, 'Fit both First Bell slips to one packet, distinguish what the two desks dated, and keep the originals at pickup', [
    'evidence', 'truth', 'certainty', 'culture', 'perspective', 'interpretation', 'values', 'responsibility', 'scope', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'route-back');
    d.talk('nile-iman', 'Check the folded packet', 'Fit the sending stub', 'Return the stub', 'Fit the shelving slip',
      'Return the shelving slip', 'Clip both fitted slips', 'staffed pickup desk');
    expect(d.done('nile.transit.compare')).toBe(true);
    expect(d.s.flags['nile.transit.layout']).toBe('desk');
    expect(d.s.flags['nile.dispatch']).toBeUndefined();
  });
  const transitMinutes = checkTransit ? 4 : 0;
  const dispatch = royal ? 'Keep the ancient map and the route trial side by side in the Nexus workshop' : 'Send the workmen’s slips and open the Nexus reading table';
  route.at(38 + extra + transitMinutes, dispatch, ['responsibility', 'power', 'perspectives', 'ethics'], (d) => {
    if (!checkTransit) useDoor(d, 'route-back');
    d.talk('nile-iman', royal ? 'workshop table' : 'reading table');
    useDoor(d, 'nile-nexus');
    d.talk('warden-ise', royal ? 'Leave the ancient route' : 'Lay both slips', 'come back');
    expect(d.done('nile.return')).toBe(true);
    readSign(d, royal ? 'nile-outcome-pair' : 'nile-outcome-read');
  });
  if (checkTransit) route.at(44 + extra, 'Visit the staffed pickup: match the signed dates and see which reader must ask', [
    'evidence', 'perspective', 'interpretation', 'values', 'responsibility', 'ethics',
  ], (d) => {
    expect(readSign(d, 'nile-transit-desk')).toContain('keeper puts both signed slips');
    expect(d.done('nile.transit.readback')).toBe(true);
  });
  route.at(47 + extra + transitMinutes, 'Present the Singapore Stone and the Malay Annals without conflating them', ['culture', 'truth', 'interpretation', 'scope'], (d) => {
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

function observatoryCoast(stop?: 'bell-slip' | 'clear-terms'): Route {
  const route = new Route();
  const extra = stop === 'clear-terms' ? 4 : stop ? 2 : 0;
  // Independent Chapter 4 session. The Cold Store's first display is already open.
  route.driver.s.objectivesDone.push('preserved.publish');
  route.at(4, 'Ask which crews need the notice and which route each follows', ['perspective', 'perspectives'], (d) => {
    useDoor(d, 'observatory-door');
    d.talk('coast-signalkeeper', 'Who is waiting');
    expect(d.done('coast.arrival')).toBe(true);
  });
  route.at(8, 'Match the basket crews’ Wallfoot to the sheltered gauge and its dated measuring interval', ['evidence', 'scope', 'methods-and-tools'], (d) => {
    expect(readSign(d, 'coast-harbour-gauge')).toContain('Wallfoot');
  });
  if (stop === 'bell-slip') route.at(10, 'Keep the quay crew’s way of counting alongside the timed station marks',
    ['culture', 'interpretation', 'perspectives'], useProp('coast.bell-slip', 'both'));
  if (stop === 'clear-terms') route.at(10, 'Move the same ribbon through the marked row and unmarked edge to check the net-menders’ claim', [
    'evidence', 'truth', 'objectivity', 'certainty', 'scope', 'methods-and-tools',
  ], (d) => {
    walkScene(d, 'coast-clear-net-frame', 'coast.clear.row', 'Pass the same ribbon', 'Keep the two readings');
    expect(d.done('coast.clear.test')).toBe(true);
  });
  route.at(16 + (stop ? 2 : 0), 'Align Wallfoot and Wind Peg by measuring interval and keep each crew’s name beside the station record', [
    'evidence', 'truth', 'objectivity', 'certainty', 'culture', 'interpretation', 'perspectives', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'coast-headland-path');
    expect(readSign(d, 'coast-station-gauge')).toContain('Wind Peg');
    d.talk('coast-forecaster', 'Pin each reading to the place');
    expect(d.done('coast.readings')).toBe(true);
  });
  if (stop === 'clear-terms') route.at(20, 'Distinguish the menders’ clear row from the lookout’s clear view, then let each crew update its own heading', [
    'culture', 'interpretation', 'scope', 'perspective', 'perspectives', 'power', 'values', 'justification', 'responsibility', 'ethics',
  ], (d) => {
    readSign(d, 'coast-clear-visibility');
    walkScene(d, 'coast-clear-terms', 'coast.clear.tags');
    expect(d.done('coast.clear.share')).toBe(true);
    readSign(d, 'coast-clear-tower-tag');
  });
  route.at(22 + extra, 'Separate the forecast from the measurements and keep the wind assumption with the estimate', ['explanation', 'interpretation', 'justification', 'scope'], (d) => {
    readSign(d, 'coast-chart-board');
    d.talk('coast-forecaster', 'Put the estimate on a separate strip');
    expect(d.done('coast.forecast')).toBe(true);
  });
  route.at(28 + extra, 'Send a written copy with the runner to the crews who cannot see the quay board', ['perspective', 'values', 'power', 'responsibility', 'perspectives', 'ethics'], (d) => {
    useDoor(d, 'coast-headland-return');
    if (stop === 'clear-terms') readSign(d, 'coast-clear-net-tag');
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

function livingForest(pathbookFirst: boolean, greenSquares = false): Route {
  const route = new Route();
  const surveyMinutes = greenSquares ? 12 : 0;
  // Independent Chapter 5 session. The coast's revised notice is already up.
  route.driver.s.objectivesDone.push('coast.revise');
  const readPathbook = (d: AuditDriver) => {
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
  if (greenSquares) route.at(7, 'Borrow a fixed six-cell frame and keep the same counting rule at every placement', [
    'scope', 'methods-and-tools',
  ], (d) => {
    walkScene(d, 'forest-moss-frame', 'forest.moss.directions');
    expect(d.s.flags['forest.moss.frame']).toBe(true);
  });
  if (pathbookFirst) route.at(greenSquares ? 12 : 9, 'Separate what the bridge and lamp crews heard on their rounds from what observers saw', ['culture', 'perspective', 'interpretation', 'perspectives'], readPathbook);
  if (greenSquares) {
    route.at(19, 'Count occupied moss cells at shaded and open sites, beside and away from the walkway', [
      'evidence', 'objectivity', 'certainty', 'scope', 'methods-and-tools',
    ], (d) => {
      useDoor(d, 'forest-bridge-to-trail');
      for (const [site, count] of [['creek-away', 5], ['bridge-edge', 1], ['ridge-edge', 2], ['ridge-away', 4]] as const) {
        walkScene(d, `forest-moss-${site}`, `forest.moss.${site}-read`);
        expect(d.s.flags[`forest.moss.${site}`]).toBe(count);
      }
    });
    route.at(25, 'Pair the plots by light, keep the boot tally separate and put the stones route where walkers need it', [
      'explanation', 'interpretation', 'truth', 'evidence', 'power', 'values', 'responsibility', 'justification', 'ethics',
    ], (d) => {
      useDoor(d, 'forest-clearing-path');
      walkScene(d, 'forest-moss-boot-log', 'forest.moss.logged');
      expect(d.done('forest.moss.survey')).toBe(true);
      walkScene(d, 'forest-moss-table', undefined, 'Line up the two shaded', 'Leave the shaded cards', 'Line up the two open',
        'Leave the open cards', 'Slide the boot tally', 'Tie a keep-to-the-stones');
      expect(d.done('forest.moss.place')).toBe(true);
      expect(d.s.flags['forest.moss.result']).toBe('ribbon');
      readSign(d, 'forest-moss-revised-notice');
    });
  }
  const extraTrailMinutes = (pathbookFirst ? 3 : 0) + surveyMinutes;
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
  route.at(29 + surveyMinutes, publication, ['power', 'values', 'responsibility', 'ethics'], (d) => {
    if (pathbookFirst) useDoor(d, 'forest-community-path');
    d.talk('forest-steward', pathbookFirst ? 'Read both lookout notes' : 'Keep the creek stop');
    expect(d.done('forest.publish')).toBe(true);
    const response = pathbookFirst ? 'brief' : 'quiet';
    expect(d.s.flags['forest.response']).toBe(response);
    readSign(d, `forest-response-${response}`);
  });
  route.at(37 + surveyMinutes, 'Record two crossings at each return watch and keep the blocked creek beat unknown', ['truth', 'certainty', 'objectivity', 'evidence', 'methods-and-tools'], (d) => {
    useDoor(d, 'forest-bridge-to-trail');
    expect(watchForest(d, 'creek', 'return')).toEqual([1, null, 1]);
    expect(watchForest(d, 'ridge', 'return')).toEqual([0, 1, 1]);
    expect(d.done('forest.recheck')).toBe(true);
  });
  const correction = pathbookFirst
    ? 'Return to the bridge readers to show why two equal counts do not imply two identical views'
    : 'Show how an unseen crossing could make the recorded counts match';
  route.at(42 + surveyMinutes, correction, ['interpretation', 'justification', 'explanation', 'responsibility', 'scope', 'ethics'], (d) => {
    useDoor(d, 'forest-clearing-path');
    d.talk('forest-steward', pathbookFirst ? 'Brief the bridge readers' : 'mark the hidden stretch');
    expect(d.done('forest.finish')).toBe(true);
    readSign(d, 'forest-followup-note');
  });
  route.at(47 + surveyMinutes, 'Bring both notes and the view limits down to the low bench', ['power', 'responsibility', 'perspective', 'perspectives', 'ethics'], (d) => {
    d.talk('forest-steward', 'Bring both notes');
    expect(d.done('forest.access')).toBe(true);
    readSign(d, 'forest-low-route');
  });
  route.at(52 + surveyMinutes, 'Give the Gombe field caption the date and the people behind the record', ['evidence', 'culture', 'responsibility', 'power'], (d) => {
    useDoor(d, 'forest-community-back');
    for (const exhibit of ['OBJ-FOREST-GOMBE', 'OBJ-FOREST-GOMBE-CONTEXT']) d.run({ type: 'InspectExhibit', exhibit });
    d.talk('forest-naturalist', 'put the Gombe team back');
    expect(d.done('forest.gombe-credit')).toBe(true);
    if (greenSquares) readSign(d, 'forest-moss-station-sheet');
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

function cityOfCopies(checkRamp = false): Route {
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
  if (checkRamp) {
    route.at(51, 'Change the width of the same press run and compare the two proofs with the signed ramp order', [
      'evidence', 'objectivity', 'certainty', 'explanation', 'scope', 'methods-and-tools',
    ], (d) => {
      useDoor(d, 'copies-landing-to-press');
      walkScene(d, 'copies.margin.short', 'copies.margin.short.tested');
      walkScene(d, 'copies.margin.wide', 'copies.margin.wide.tested');
      useDoor(d, 'copies-press-to-landing');
      expect(readSign(d, 'copies-margin-master')).toContain('after a trial with an empty cart');
      expect(d.done('copies.margin.compare')).toBe(true);
    });
    route.at(55, 'Match a warning strip to the route arrow and hang both before a runner sets out', [
      'responsibility', 'justification', 'interpretation', 'perspective', 'values', 'perspectives', 'ethics', 'methods-and-tools',
    ], (d) => {
      useDoor(d, 'copies-landing-to-press');
      walkScene(d, 'copies-margin-press-tray', 'copies.margin.packed-pair');
      useDoor(d, 'copies-press-to-landing');
      walkScene(d, 'copies-margin-pair', 'copies.margin.sent-pair');
      expect(d.done('copies.margin.deliver')).toBe(true);
      expect(readSign(d, 'copies-margin-paired')).toContain('outer stalls');
    });
  }
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

function cartographersSea(checkSymbols = false): Route {
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
  if (checkSymbols) {
    route.at(45, 'Use one sketch and the same readers to compare a shore roof mark with two lights read from the deck', [
      'culture', 'interpretation', 'objectivity', 'explanation', 'perspectives', 'methods-and-tools',
    ], (d) => {
      useDoor(d, 'sea-chartroom-path');
      walkScene(d, 'sea-symbol-desk', 'sea.symbol.roof', 'Leave the copy');
      walkScene(d, 'sea-symbol-desk', 'sea.symbol.lights', 'Leave the copy');
      expect(d.done('sea.symbol.compared')).toBe(false);
    });
    route.at(48, 'Follow both marks at the shore sight frame to verify that they identify the same landing', [
      'truth', 'certainty', 'evidence', 'scope', 'methods-and-tools',
    ], (d) => {
      useDoor(d, 'sea-chartroom-return');
      expect(readSign(d, 'sea-symbol-sight-frame')).toContain('same upstairs landing at Lantern House');
      expect(d.done('sea.symbol.compared')).toBe(true);
    });
    route.at(51, 'Hang a key with both marks at Market Rail so a shore reader can use a deck copy', [
      'culture', 'perspective', 'perspectives', 'justification', 'responsibility', 'ethics',
    ], (d) => {
      walkScene(d, 'sea-symbol-key-holder', 'sea.symbol.place.rail');
      expect(d.done('sea.symbol.placed')).toBe(true);
      readSign(d, 'sea-symbol-key-rail');
    });
  }
  route.at(checkSymbols ? 54 : 47, 'Leave an accessible key with both local names and written survey limits', ['culture', 'responsibility', 'perspective', 'perspectives', 'ethics'], (d) => {
    d.talk('sea-harbourkeeper', 'Leave a wider key');
    expect(d.done('sea.access')).toBe(true);
    readSign(d, 'sea-wide-key');
  });
  return route;
}

function runStage(d: Driver, cue: StageCue) {
  const stand = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'stage-rehearsal');
  expect(stand).toBeDefined();
  expect(check(stand?.visibleIf, d.s), 'rehearsal stand visible').toBe(true);
  const beats = stageRehearsal(cue);
  expect(beats.map((beat) => beat.kind)).toEqual(['line', cue, cue === 'pause' ? 'move' : 'pause', 'line']);
  d.run({ type: 'RunStageRehearsal', cue });
  expect(d.s.flags[`stage.rehearsal.${cue}`]).toBe(true);
  return beats;
}

function houseOfPerformance(firstCue: StageCue, seatRequest = false): Route {
  const route = new Route();
  const galleryFirst = firstCue === 'move';
  const extra = (galleryFirst ? 3 : 0) + (seatRequest ? 4 : 0);
  const alternateCue = galleryFirst ? 'pause' : 'move';
  // Independent Chapter 9 session. Both survey edges have been published.
  route.driver.s.objectivesDone.push('sea.finish');
  useDoor(route.driver, 'stage-door');
  expect(route.driver.done('stage.arrival')).toBe(true);
  readSign(route.driver, 'stage-foyer-programme');
  if (galleryFirst) route.at(7, 'Start from the gallery and find the post that hides the crate from the side seats', ['perspective', 'perspectives', 'scope'], (d) => {
    useDoor(d, 'stage-gallery-path');
    readSign(d, 'stage-vantage');
    d.talk('stage-host');
  });
  if (seatRequest) route.at(11, 'Compare seat customs and reserve an aisle place without posting the reason for the request', [
    'culture', 'evidence', 'values', 'power', 'responsibility', 'justification', 'ethics',
  ], (d) => {
    walkScene(d, 'stage-seat-request', undefined, 'Keep the folded request');
    walkScene(d, 'stage-seat-post', undefined, 'Check where the post can stand');
    walkScene(d, 'stage-seat-desk', undefined, 'Reserve the aisle place');
    expect(d.done('stage.seats.o.place')).toBe(true);
    expect(d.s.flags['stage.seats.plan']).toBe('reserve');
    readSign(d, 'stage-seat-reserve');
  });
  route.at(10 + extra, 'Check the positions in the blocking plan and run one order of the scene', ['evidence', 'scope', 'methods-and-tools'], (d) => {
    useDoor(d, galleryFirst ? 'stage-gallery-to-rehearsal' : 'stage-rehearsal-path');
    d.talk('stage-director');
    readSign(d, 'stage-blocking');
    readSign(d, 'stage-script-draft');
    runStage(d, firstCue);
    expect(d.s.flags[`stage.rehearsal.${alternateCue}`]).toBeUndefined();
  });
  route.at(16 + extra, 'Reverse silence and movement with the same spoken lines and crate move', ['objectivity', 'explanation', 'evidence', 'methods-and-tools'], (d) => {
    const second = runStage(d, alternateCue);
    const first = stageRehearsal(firstCue);
    expect(first[0]).toEqual({ kind: 'line', text: 'Keeper: “Leave it by the door.”' });
    expect(first[3]).toEqual({ kind: 'line', text: 'Worker: “I can wait.”' });
    expect(second).toEqual([first[0], first[2], first[1], first[3]]);
  });
  route.at(21 + extra, galleryFirst ? 'Check the printer’s claim and place the movement marks side by side' : 'Check the printer’s claim and circle the different pauses', ['truth', 'interpretation', 'certainty', 'explanation', 'scope'], (d) => {
    d.talk('stage-director', galleryFirst ? 'Set the two movement marks' : 'Circle the pause');
    expect(d.done('stage.compare')).toBe(true);
    readSign(d, 'stage-script-checked');
  });
  route.at(25 + extra, galleryFirst ? 'Keep the full front view and mark what a neighbour’s seat hides' : 'Give the side-seat account a place beside the same spoken lines', ['perspective', 'culture', 'perspectives'], (d) => {
    useDoor(d, 'stage-rehearsal-to-gallery');
    if (!galleryFirst) readSign(d, 'stage-vantage');
    d.talk('stage-host', galleryFirst ? 'Keep a front-seat view' : 'Keep the side view');
    expect(d.done('stage.sightline')).toBe(true);
  });
  route.at(29 + extra, galleryFirst ? 'Stage the crate move first so it catches the eye before the quiet beat' : 'Stage the silence first to give the worker a visible wait', ['values', 'power', 'responsibility', 'justification', 'ethics'], (d) => {
    d.talk('stage-host', galleryFirst ? 'Stage the crate move' : 'Stage the silence');
    expect(d.done('stage.perform')).toBe(true);
    expect(d.s.flags['stage.response']).toBe(firstCue);
    readSign(d, `stage-response-${firstCue}`);
  });
  route.at(36 + extra, 'Read an audience account that leaves the worker’s reason in question', ['perspective', 'interpretation', 'perspectives'], (d) => {
    readSign(d, 'stage-reader-note');
    expect(d.done('stage.feedback')).toBe(true);
  });
  route.at(41 + extra, 'Record what the actor did and what each seat could see so readers can check their accounts', ['truth', 'certainty', 'responsibility', 'justification', 'scope', 'ethics'], (d) => {
    d.talk('stage-host', galleryFirst ? 'Add the movement cue' : 'Add the pause cue');
    expect(d.done('stage.finish')).toBe(true);
    readSign(d, 'stage-followup-notice');
  });
  route.at(47 + extra, 'Give the understudy a large copy for rehearsing either order', ['objectivity', 'perspective', 'responsibility', 'perspectives', 'methods-and-tools'], (d) => {
    d.talk('stage-host', 'Leave the understudy');
    expect(d.done('stage.access')).toBe(true);
    readSign(d, 'stage-cue-copy');
  });
  return route;
}

function weighLots(d: Driver, basis: MarketBasis, masses: readonly [number, number]) {
  const scale = MAPS[d.s.mapId].interactables.find((p) => p.kind === 'market-scale');
  expect(scale).toBeDefined();
  expect(check(scale?.visibleIf, d.s), 'test scale visible').toBe(true);
  const readings = marketComparison(basis);
  expect(readings).toEqual([
    { id: 'a', price: 8, mass: masses[0] },
    { id: 'b', price: 10, mass: masses[1] },
  ]);
  d.run({ type: 'WeighMarketLots', basis });
  expect(d.s.flags[`market.weigh.${basis}`]).toBe(true);
  return readings;
}

function marketOfMeasures(): Route {
  const route = new Route();
  // Independent Chapter 10 session. The House programme has already been revised.
  route.driver.s.objectivesDone.push('stage.finish');
  route.at(4, 'Hear the terms of the offered lots before assuming which is a better purchase', ['perspective', 'scope'], (d) => {
    useDoor(d, 'market-door');
    d.talk('market-assayer');
    expect(d.done('market.arrival')).toBe(true);
  });
  route.at(10, 'Weigh both baskets and compare gross grams per credit, 120 against 90', ['evidence', 'methods-and-tools'], (d) => {
    const gross = weighLots(d, 'gross', [960, 900]);
    expect(gross.map(({ mass, price }) => mass / price)).toEqual([120, 90]);
    expect(d.s.flags['market.weigh.net']).toBeUndefined();
  });
  route.at(16, 'Take the baskets out of the readings and publish the reversed net rate beside the gross rate', ['truth', 'evidence', 'objectivity', 'explanation', 'certainty', 'scope', 'methods-and-tools'], (d) => {
    const net = weighLots(d, 'net', [600, 800]);
    expect(net.map(({ mass, price }) => mass / price)).toEqual([75, 80]);
    d.talk('market-assayer', 'Set both pairs');
    expect(d.done('market.compare')).toBe(true);
    expect(d.s.flags['market.comparison']).toBe('paired');
  });
  route.at(22, 'Read the two grading signs and explain how the makers and sellers use them for different jobs', ['culture', 'interpretation', 'perspective', 'explanation', 'perspectives'], (d) => {
    for (const prop of ['market-grade-sorting', 'market-grade-display']) readSign(d, prop);
    d.talk('market-clerk', 'Name what each grade does');
    expect(d.done('market.terms')).toBe(true);
  });
  route.at(27, 'Read the buyer’s budget and show the window rates with their measurement bases', ['values', 'power', 'responsibility', 'justification', 'scope', 'ethics'], (d) => {
    readSign(d, 'market-practice-purse');
    d.talk('market-clerk', 'Hang the prices by the window');
    expect(d.done('market.publish')).toBe(true);
    readSign(d, 'market-result-window');
  });
  route.at(35, 'Read why the buyer could not take the higher-rate lot home', ['perspective', 'interpretation', 'perspectives'], (d) => {
    readSign(d, 'market-buyer-note');
    expect(d.done('market.feedback')).toBe(true);
  });
  route.at(40, 'Pin the quoted lots beside the rate and keep the next crate’s quote separate', ['truth', 'certainty', 'responsibility', 'justification', 'scope', 'ethics'], (d) => {
    d.talk('market-clerk', 'Add a whole-lot line');
    expect(d.done('market.finish')).toBe(true);
    readSign(d, 'market-revised');
    readSign(d, 'market-quote-posted');
  });
  route.at(46, 'Repeat the comparison for the long fibres used in wicks', ['evidence', 'objectivity', 'certainty', 'scope', 'methods-and-tools'], (d) => {
    const usable = weighLots(d, 'wick', [480, 760]);
    expect(usable.map(({ mass, price }) => mass / price)).toEqual([60, 76]);
    d.talk('market-clerk', 'Clip the wick-length tally');
    expect(d.done('market.wick')).toBe(true);
    readSign(d, 'market-wick-note');
  });
  route.at(49, 'Leave a larger key separating price, quantities and the different uses', ['perspective', 'responsibility', 'interpretation', 'perspectives', 'ethics'], (d) => {
    d.talk('market-clerk', 'Leave a larger four-line key');
    expect(d.done('market.access')).toBe(true);
    readSign(d, 'market-access-key');
  });
  return route;
}

function checkWaterTrial(d: Driver, condition: WaterCondition, setting: WaterSetting, farm: number, river: number): void {
  const gate = MAPS[d.s.mapId].interactables.find((prop) => prop.kind === 'water-gate');
  expect(gate).toBeDefined();
  expect(check(gate?.visibleIf, d.s)).toBe(true);
  expect(waterTrial(condition, setting)).toEqual({ incoming: 12, leak: condition === 'drought' ? 2 : 0, farm, river });
  d.run({ type: 'RunWaterTrial', setting });
  expect(d.s.flags[`water.trial.${condition}.${setting}`]).toBe(true);
}

function waterCommons(): Route {
  const route = new Route();
  // Prepared Chapter 10 save. The Market's whole-lot comparison has been revised.
  route.driver.s.objectivesDone.push('market.finish');
  route.at(4, 'Ask what the gatehouse can measure and find the unchecked tally on the split board', ['scope', 'perspective'], (d) => {
    useDoor(d, 'water-door');
    d.talk('water-keeper');
    expect(d.done('water.arrival')).toBe(true);
    readSign(d, 'water-draft-split');
    expect(d.s.flags['water.draft.read']).toBe(true);
  });
  route.at(9, 'Route seven of the ten available measures to fields while recording the two lost from the fixed twelve', ['evidence', 'certainty', 'methods-and-tools'], (d) => {
    checkWaterTrial(d, 'drought', 'fields', 7, 3);
  });
  route.at(16, 'Run the split against the draft’s claim and check the posted correction beside the lever', [
    'truth', 'evidence', 'objectivity', 'explanation', 'interpretation', 'methods-and-tools',
  ], (d) => {
    checkWaterTrial(d, 'drought', 'split', 5, 5);
    expect(d.done('water.drought')).toBe(true);
    readSign(d, 'water-checked-split');
    expect(d.s.flags['water.checked.read']).toBe(true);
  });
  route.at(24, 'Use the scribe’s account and the work cards to distinguish rows from turns down the steps', ['perspective', 'culture', 'perspectives', 'scope'], (d) => {
    useDoor(d, 'water-council-path');
    d.talk('water-scribe');
    useDoor(d, 'water-council-to-lower');
    for (const prop of ['water-farm-card', 'water-channel-marker']) readSign(d, prop);
    expect(d.done('water.needs')).toBe(true);
  });
  route.at(30, 'Post the split for the measured twelve incoming and two lost, with the postponed work beside it', ['values', 'power', 'responsibility', 'justification', 'certainty', 'scope', 'ethics'], (d) => {
    useDoor(d, 'water-lower-to-council');
    d.talk('water-scribe', 'Split it five and five');
    expect(d.done('water.publish')).toBe(true);
    expect(d.s.flags['water.response']).toBe('split');
    expect(readSign(d, 'water-result-split')).toContain('twelve incoming and two lost');
  });
  route.at(34, 'Read the repair record and change what leaks out while leaving the inflow fixed', ['evidence', 'scope', 'methods-and-tools'], (d) => {
    readSign(d, 'water-repair-note');
    useDoor(d, 'water-council-return');
    d.talk('water-keeper', 'Fit the repaired gate');
    expect(d.done('water.repair')).toBe(true);
  });
  route.at(42, 'Recheck the same split and a field-first setting with twelve measures and zero leaked', [
    'objectivity', 'explanation', 'certainty', 'evidence', 'scope', 'methods-and-tools',
  ], (d) => {
    checkWaterTrial(d, 'repaired', 'split', 5, 7);
    checkWaterTrial(d, 'repaired', 'fields', 7, 5);
    expect(d.done('water.retest')).toBe(true);
  });
  route.at(47, 'Bring the contested claim back to the council alongside both sets of measurements', ['truth', 'interpretation', 'perspective', 'perspectives'], (d) => {
    useDoor(d, 'water-council-path');
    readSign(d, 'water-contested-slip');
    expect(d.done('water.claim')).toBe(true);
  });
  route.at(50, 'Publish a checked revision that gives the lower channel the two recovered measures', ['truth', 'justification', 'responsibility', 'power', 'values', 'ethics'], (d) => {
    d.talk('water-scribe', 'Keep two more in the lower channel');
    expect(d.done('water.finish')).toBe(true);
    readSign(d, 'water-revised-split');
  });
  route.at(54, 'Give readers both dated allocations beside the work cards they answer to', ['perspective', 'responsibility', 'perspectives', 'scope', 'ethics'], (d) => {
    d.talk('water-scribe', 'Leave a wider register copy');
    expect(d.done('water.register')).toBe(true);
    readSign(d, 'water-register-copy');
  });
  return route;
}

function checkCivicTrial(d: Driver, sample: CivicSample, rule: CivicRule, steps: number, canal: number): void {
  const console = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'civic-console');
  expect(console?.kind).toBe('civic-console');
  expect(check(console?.visibleIf, d.s)).toBe(true);
  const counts = sample === 'desk' ? { steps: 12, canal: 5 } : { steps: 15, canal: 16 };
  expect(civicAllocation(sample, rule)).toEqual({ counts, windows: { steps, canal } });
  d.run({ type: 'RunCivicTrial', sample, rule });
  expect(d.s.flags[`civic.trial.${sample}.${rule}`]).toBe(true);
}

function civicMachine(checkCouriers = false): Route {
  const route = new Route();
  const extra = checkCouriers ? 10 : 0;
  // Prepared Chapter 11 save. Both allocations at the weir have been entered.
  route.driver.s.objectivesDone.push('water.finish');
  route.at(4, 'Hear how the library allocates four windows and what is counted as a request', ['scope', 'perspective'], (d) => {
    useDoor(d, 'civic-door');
    d.talk('civic-operator');
    expect(d.done('civic.arrival')).toBe(true);
  });
  if (checkCouriers) {
    route.at(8, 'Run the same receiving desk with two groups of arrivals and check whether an empty mark rules out a wait', [
      'evidence', 'truth', 'certainty', 'objectivity', 'explanation', 'scope', 'methods-and-tools',
    ], (d) => {
      expect(civicReceivingLoad(CIVIC_ARRIVAL_TRAYS.red)).toEqual({ waiting: 1, free: 2 });
      expect(civicReceivingLoad(CIVIC_ARRIVAL_TRAYS.blue)).toEqual({ waiting: 0, free: 1 });
      walkScene(d, 'civic-overlap-red', 'civic.overlap.red.opened');
      expect(readSign(d, 'civic-overlap-red-loaded')).toContain('Loads waiting 1. Empty marks 2');
      walkScene(d, 'civic-overlap-blue', 'civic.overlap.blue.opened');
      expect(readSign(d, 'civic-overlap-blue-loaded')).toContain('Loads waiting 0. Empty marks 1');
      expect(d.done('civic.overlap.trays')).toBe(true);
    });
    route.at(12, 'Count possible matches under independent draws and check the local crew’s shared release time', [
      'evidence', 'interpretation', 'explanation', 'scope', 'perspective', 'perspectives', 'methods-and-tools',
    ], (d) => {
      walkScene(d, 'civic-overlap-rack', undefined, 'Start filling the rack', 'Group the remaining rows');
      expect(civicReceivingArrangements()).toEqual({ all: 64, separate: 24, shared: 40 });
      expect(readSign(d, 'civic-overlap-count')).toContain("24 separate and 40 with a shared mark");
      useDoor(d, 'civic-canal-path');
      expect(readSign(d, 'civic-overlap-local')).toContain('releases its crew at one bell');
      expect(d.done('civic.overlap.evidence')).toBe(true);
    });
    route.at(17, 'Give a busy mark a second receiving spot and check which arrivals would still make someone wait', [
      'values', 'power', 'responsibility', 'justification', 'ethics', 'scope',
    ], (d) => {
      useDoor(d, 'civic-canal-return');
      walkScene(d, 'civic-overlap-plan', 'civic.overlap.buffer');
      useDoor(d, 'civic-canal-path');
      expect(readSign(d, 'civic-overlap-buffer')).toContain('Three loads together would still make somebody wait');
      expect(d.done('civic.overlap.finish')).toBe(true);
      useDoor(d, 'civic-canal-return');
    });
  }
  route.at(9 + extra, 'Allocate all four windows by rank using only the desk requests', ['evidence', 'scope', 'methods-and-tools'], (d) => {
    checkCivicTrial(d, 'desk', 'rank', 4, 0);
    expect(d.done('civic.compare')).toBe(false);
  });
  route.at(18 + extra, 'Read the draft’s claim and check how the desk and walking crews record requests', ['evidence', 'perspective', 'perspectives', 'scope'], (d) => {
    useDoor(d, 'civic-steps-path');
    readSign(d, 'civic-ledger-draft');
    readSign(d, 'civic-desk-slip');
    useDoor(d, 'civic-steps-to-canal');
    readSign(d, 'civic-walk-slip');
    expect(d.done('civic.sources')).toBe(true);
  });
  route.at(24 + extra, 'Keep the rule fixed, change the register and see why the larger count reverses', [
    'certainty', 'evidence', 'objectivity', 'explanation', 'interpretation', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'civic-canal-return');
    d.talk('civic-operator');
    checkCivicTrial(d, 'combined', 'rank', 0, 4);
    expect(d.done('civic.compare')).toBe(true);
  });
  route.at(28 + extra, 'Keep the combined register fixed and try protecting one window in each district', [
    'objectivity', 'explanation', 'values', 'justification', 'methods-and-tools',
  ], (d) => {
    d.talk('civic-operator');
    checkCivicTrial(d, 'combined', 'reserve', 1, 3);
    expect(d.done('civic.rules')).toBe(true);
  });
  route.at(30 + extra, 'Return to the ledger and check the draft against the two counts it left out', ['truth', 'interpretation', 'scope'], (d) => {
    useDoor(d, 'civic-steps-path');
    readSign(d, 'civic-ledger-checked');
  });
  route.at(36 + extra, 'Post a starting window for each district and send the two remaining windows by demand', [
    'power', 'values', 'responsibility', 'justification', 'ethics',
  ], (d) => {
    d.talk('civic-clerk', 'Leave one starting window');
    expect(d.done('civic.publish')).toBe(true);
    expect(d.s.flags['civic.response']).toBe('reserve');
    readSign(d, 'civic-result-reserve');
  });
  route.at(43 + extra, 'Read how the published window still misses a reader who cannot use the desk in time', [
    'interpretation', 'perspective', 'perspectives', 'scope',
  ], (d) => {
    useDoor(d, 'civic-steps-to-canal');
    readSign(d, 'civic-reader-note');
    expect(d.done('civic.reader')).toBe(true);
  });
  route.at(50 + extra, 'Keep the original rule and add an evening request stop for the next count', [
    'evidence', 'responsibility', 'power', 'values', 'justification', 'ethics',
  ], (d) => {
    useDoor(d, 'civic-canal-to-steps');
    d.talk('civic-clerk', 'Leave an evening request stop');
    expect(d.done('civic.finish')).toBe(true);
    expect(d.s.flags['civic.response']).toBe('reserve');
    expect(d.s.flags['civic.revision']).toBe('evening');
    readSign(d, 'civic-revised');
  });
  route.at(55 + extra, 'Check that the evening crew’s notice gives readers a place to leave the times they could use', [
    'perspective', 'perspectives', 'responsibility', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'civic-steps-to-canal');
    readSign(d, 'civic-evening-call');
  });
  route.at(60 + extra, 'Leave a wider notice with the rule, both district counts and the details still needed', ['scope', 'responsibility', 'perspectives', 'ethics'], (d) => {
    useDoor(d, 'civic-canal-to-steps');
    d.talk('civic-clerk', 'Leave a wider route notice');
    expect(d.done('civic.access')).toBe(true);
    readSign(d, 'civic-wide-notice');
  });
  return route;
}

function openVoiceReading(d: Driver, source: VoiceSource, view: VoiceView) {
  const desk = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'voices-desk');
  expect(desk?.kind).toBe('voices-desk');
  expect(check(desk?.visibleIf, d.s)).toBe(true);
  d.run({ type: 'RunVoiceReading', source, view });
  expect(d.s.flags[`voices.read.${source}.${view}`]).toBe(true);
  return voiceReading(source, view);
}

function archiveOfVoices(quoteInQueue = false): Route {
  const route = new Route();
  const extra = quoteInQueue ? 3 : 0;
  // Prepared Chapter 12 save. The Civic Machine has a revised notice.
  route.driver.s.objectivesDone.push('civic.finish');
  route.driver.s.flags['civic.revised'] = true;
  route.at(4, 'Read a signed opening date presented as the first crossing and ask what it covered', ['scope', 'perspective'], (d) => {
    useDoor(d, 'voices-door');
    expect(d.done('voices.arrival')).toBe(true);
    d.talk('voices-steward');
    readSign(d, 'voices-draft-label');
  });
  route.at(10, 'Check what the carrier agreed to share and use the approved excerpt at the desk', [
    'evidence', 'responsibility', 'scope', 'methods-and-tools', 'ethics',
  ], (d) => {
    readSign(d, 'voices-permission');
    const carrier = openVoiceReading(d, 'carrier', 'original');
    expect(carrier.date).toBe('Lantern 4, dusk');
    expect(carrier.text).toContain('Second lamp, then the rail.');
    expect(d.done('voices.sources')).toBe(false);
  });
  route.at(17, 'Follow the dated record to the signing clerk and open its original entry beside the carrier’s', [
    'evidence', 'perspective', 'perspectives', 'scope',
  ], (d) => {
    useDoor(d, 'voices-walk-path');
    readSign(d, 'voices-opening-register');
    d.talk('voices-clerk');
    useDoor(d, 'voices-walk-return');
    const register = openVoiceReading(d, 'clerk', 'original');
    expect(register.date).toBe('Lantern 6');
    expect(register.text).toContain('opened for public passage');
    expect(d.done('voices.sources')).toBe(true);
  });
  if (quoteInQueue) route.at(20, 'Give people in the queue the approved excerpt with a date and a link to the fuller record', [
    'values', 'power', 'responsibility', 'justification', 'ethics', 'scope',
  ], (d) => {
    d.talk('voices-steward', 'Where should we put the approved reading copy', 'Give people in the queue an approved excerpt');
    expect(d.done('voices.quote')).toBe(true);
    expect(d.s.flags['voices.quote.layout']).toBe('queue');
    readSign(d, 'voices-quote-queue');
  });
  route.at(22 + extra, 'Give the carrier’s trial and the clerk’s public opening their own headings and leave the first crossing open', [
    'truth', 'certainty', 'interpretation', 'power', 'justification', 'scope',
  ], (d) => {
    d.talk('voices-steward', 'Pin the two dated records');
    expect(d.done('voices.verify')).toBe(true);
    readSign(d, 'voices-checked-label');
  });
  route.at(27 + extra, 'Keep both sources fixed while checking how each guide explains the local words or the public date', [
    'objectivity', 'explanation', 'culture', 'interpretation', 'perspectives', 'methods-and-tools',
  ], (d) => {
    d.talk('voices-steward');
    for (const source of ['carrier', 'clerk'] as const) {
      const original = voiceReading(source, 'original');
      const guide = openVoiceReading(d, source, 'guide');
      expect(guide.date).toBe(original.date);
      expect(guide.purpose).toBe(original.purpose);
      expect(guide.text).not.toBe(original.text);
    }
    expect(voiceReading('carrier', 'guide').text).toContain('From the quay');
    expect(d.done('voices.compare')).toBe(true);
  });
  route.at(33 + extra, 'Put the permitted quay phrase beside a plain direction so local and new carriers can use both', [
    'values', 'power', 'culture', 'responsibility', 'justification', 'ethics',
  ], (d) => {
    useDoor(d, 'voices-walk-path');
    d.talk('voices-clerk', 'Keep the carrier’s wording beside a plain direction');
    expect(d.done('voices.publish')).toBe(true);
    expect(d.s.flags['voices.response']).toBe('paired');
    readSign(d, 'voices-result-paired');
  });
  route.at(39 + extra, 'Find the stair reader’s question about the missing lamp at the end of the rail', [
    'perspective', 'perspectives', 'scope',
  ], (d) => {
    useDoor(d, 'voices-walk-to-quay');
    readSign(d, 'voices-reader-note');
    expect(d.done('voices.reader')).toBe(false);
  });
  route.at(46 + extra, 'Compare what can be seen along the quay and from the stair foot before changing the notice', [
    'evidence', 'explanation', 'truth', 'objectivity', 'perspective', 'perspectives', 'methods-and-tools',
  ], (d) => {
    for (const sign of ['voices-quay-first-lamp', 'voices-quay-second-lamp', 'voices-quay-view', 'voices-shared-rail']) {
      readSign(d, sign);
    }
    useDoor(d, 'voices-quay-to-walk');
    readSign(d, 'voices-stairs-view');
    expect(d.done('voices.reader')).toBe(true);
  });
  route.at(52 + extra, 'Use the library reader’s question to give each approach its own direction without removing the original notice', [
    'culture', 'interpretation', 'justification', 'responsibility', 'values', 'power', 'ethics',
  ], (d) => {
    d.talk('voices-clerk', 'A library reader asked us', 'Give each arrival point its own line');
    expect(d.done('voices.finish')).toBe(true);
    expect(d.s.flags['voices.response']).toBe('paired');
    expect(d.s.flags['voices.revision']).toBe('routes');
    readSign(d, 'voices-result-paired');
    readSign(d, 'voices-revised-routes');
  });
  route.at(57 + extra, 'Set a wider card by the arch so a carrier can set down a crate to read both approaches', [
    'scope', 'perspective', 'responsibility', 'ethics',
  ], (d) => {
    d.talk('voices-clerk', 'Put a larger card by the arch');
    expect(d.done('voices.access')).toBe(true);
    readSign(d, 'voices-wide-note');
  });
  return route;
}

function checkIslandPlan(d: Driver, landing: IslandLanding, route: IslandRoute, expected: ReturnType<typeof islandPlan>): void {
  const table = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'island-plan');
  expect(table?.kind).toBe('island-plan');
  expect(check(table?.visibleIf, d.s)).toBe(true);
  expect(islandPlan(landing, route)).toEqual(expected);
  d.run({ type: 'RunIslandPlan', landing, route });
  expect(d.s.flags[`island.plan.${landing}.${route}`]).toBe(true);
}

function islandOfModels(checkDockSignal = false): Route {
  const route = new Route();
  const extra = checkDockSignal ? 4 : 0;
  // Prepared Chapter 13 save. Both directions through the Archive of Voices have been checked.
  route.driver.s.objectivesDone.push('voices.finish');
  route.driver.s.flags['voices.revision'] = 'routes';
  route.at(4, 'Take the eight-crate order and read the claim about ferry capacity', ['scope', 'perspective'], (d) => {
    useDoor(d, 'island-door');
    expect(d.done('island.arrival')).toBe(true);
    d.talk('island-planner');
    expect(readSign(d, 'island-draft-plan')).toContain('ALWAYS HAS ROOM FOR FOUR');
  });
  route.at(10, 'Check how dock loading cycles account for the next load of crates', ['evidence', 'interpretation', 'scope'], (d) => {
    useDoor(d, 'island-dock-path');
    readSign(d, 'island-route-card');
    readSign(d, 'island-upper-pier');
    d.talk('island-dockhand');
  });
  if (checkDockSignal) {
    route.at(12, 'Check the open swing rail beneath the square and learn the local palm-up entry signal', [
      'truth', 'culture', 'interpretation', 'evidence', 'certainty', 'perspective', 'perspectives',
    ], (d) => {
      expect(readSign(d, 'island-square-claim')).toContain('CLOSES THIS RAMP');
      expect(readSign(d, 'island-signal-rail')).toContain('stands open');
      expect(readSign(d, 'island-signal-hand')).toContain('taught their apprentices to wait');
      expect(d.done('island.signal.checked')).toBe(true);
    });
    route.at(14, 'Post the waiting instruction by the square where newcomers can see who can wave them through', [
      'power', 'values', 'responsibility', 'justification', 'ethics',
    ], (d) => {
      d.talk('island-dockhand', 'Check the square board with me', 'Put the waiting line beside the square');
      expect(d.done('island.signal')).toBe(true);
      expect(readSign(d, 'island-signal-pair')).toContain('Wait for a palm-up call');
    });
  }
  route.at(16 + extra, 'Walk to the quiet strip and distinguish a crossing count from what happens farther out among the reeds', [
    'scope', 'perspective', 'perspectives', 'methods-and-tools', 'evidence',
  ], (d) => {
    useDoor(d, 'island-dock-to-margin');
    expect(readSign(d, 'island-quiet-strip')).toContain('a separate line for sound observed');
    expect(readSign(d, 'island-margin-window')).toContain('cannot show what happens farther out');
    expect(d.done('island.sources')).toBe(true);
  });
  const highFerry = { capacity: 4, circuits: 2, minutes: 24, crossings: 4 } as const;
  const lowFerry = { capacity: 2, circuits: 4, minutes: 48, crossings: 8 } as const;
  const ridge = { capacity: 4, circuits: 2, minutes: 36, crossings: 2 } as const;
  route.at(23 + extra, 'Use the same high landing and eight crates to compare two cycles on each route', [
    'objectivity', 'explanation', 'certainty', 'evidence', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'island-margin-return');
    checkIslandPlan(d, 'high', 'ferry', highFerry);
    checkIslandPlan(d, 'high', 'ridge', ridge);
    expect(d.done('island.compare')).toBe(true);
  });
  route.at(30 + extra, 'Post the faster high-landing ferry plan with its strip count so crews can see what it prioritises', [
    'values', 'power', 'responsibility', 'justification', 'ethics', 'scope',
  ], (d) => {
    useDoor(d, 'island-dock-path');
    d.talk('island-dockhand', 'Load the ferry from the upper landing');
    expect(d.done('island.publish')).toBe(true);
    expect(d.s.flags['island.response']).toBe('ferry');
    readSign(d, 'island-result-ferry');
  });
  route.at(36 + extra, 'Read the tide update and check the narrower lower berth before reusing the order', [
    'evidence', 'perspective', 'scope', 'methods-and-tools',
  ], (d) => {
    expect(readSign(d, 'island-low-landing')).toContain('two crates per ferry circuit');
    expect(d.done('island.lower')).toBe(true);
  });
  route.at(43 + extra, 'Hold the ferry and cargo fixed and test both routes again with the lower landing', [
    'objectivity', 'explanation', 'truth', 'certainty', 'evidence', 'interpretation', 'scope', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'island-dock-return');
    d.talk('island-planner');
    checkIslandPlan(d, 'low', 'ferry', lowFerry);
    checkIslandPlan(d, 'low', 'ridge', ridge);
    expect(d.done('island.retest')).toBe(true);
    expect(readSign(d, 'island-checked-plan')).toContain('The lower landing carries two');
  });
  route.at(50 + extra, 'Apply the two-approach check from Glass Walk, choose the ridge and keep the original ferry assumptions visible', [
    'responsibility', 'power', 'values', 'justification', 'ethics',
  ], (d) => {
    useDoor(d, 'island-dock-path');
    d.talk('island-dockhand', 'On Glass Walk we checked the route from two approaches', 'Put the ridge cart on the revised sheet');
    expect(d.done('island.finish')).toBe(true);
    expect(d.s.flags['island.response']).toBe('ferry');
    expect(d.s.flags['island.revision']).toBe('ridge');
    readSign(d, 'island-result-ferry');
    readSign(d, 'island-revised-ridge');
  });
  route.at(57 + extra, 'Read what a listener at one bend heard and see why it cannot measure the sound across the route', [
    'evidence', 'perspective', 'perspectives', 'scope', 'explanation',
  ], (d) => {
    useDoor(d, 'island-dock-to-margin');
    expect(readSign(d, 'island-listener-note')).toContain('could not tell how far it carried');
    expect(d.done('island.listener')).toBe(true);
  });
  route.at(64 + extra, 'Place a log where the next listener can record the observation’s place and time', [
    'justification', 'responsibility', 'ethics', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'island-margin-to-dock');
    d.talk('island-dockhand', 'Put a place-and-time log by the quiet strip');
    expect(d.done('island.log')).toBe(true);
    useDoor(d, 'island-dock-to-margin');
    expect(readSign(d, 'island-quiet-log')).toContain('The strip tally keeps its own page');
  });
  return route;
}

function checkCouncilClock(d: Driver, trial: CouncilTrial, expected: ReturnType<typeof councilClock>): void {
  const clock = MAPS[d.s.mapId].interactables.find((prop) => prop.id === 'council-clock');
  expect(clock?.kind).toBe('council-clock');
  expect(check(clock?.visibleIf, d.s)).toBe(true);
  expect(councilClock(trial)).toEqual(expected);
  d.run({ type: 'RunCouncilClock', trial });
  expect(d.s.flags[`council.trial.${trial}`]).toBe(true);
}

function councilOfInquiry(placePracticeDial = false): Route {
  const route = new Route();
  const extra = placePracticeDial ? 4 : 0;
  // Prepared Chapter 14 save. Both Island landing sheets still exist.
  route.driver.s.objectivesDone.push('island.finish');
  route.driver.s.flags['island.revision'] = 'ridge';
  route.at(4, 'Read the draft about a watch that agrees at one glance and ask when the shutter closes', [
    'scope', 'perspective',
  ], (d) => {
    useDoor(d, 'council-door');
    expect(d.done('council.arrival')).toBe(true);
    d.talk('council-keeper');
    expect(readSign(d, 'council-draft')).toContain('AT A GLANCE IS WORKING');
  });
  route.at(9, 'Find the dated repair seal and distinguish the signed past check from a new reading', [
    'evidence', 'scope', 'interpretation', 'methods-and-tools',
  ], (d) => {
    readSign(d, 'council-repair-record');
    if (placePracticeDial) expect(readSign(d, 'council-low-slot')).toContain('misses the shared handover');
    expect(d.s.flags['council.repair.read']).toBe(true);
    expect(d.done('council.sources')).toBe(false);
  });
  route.at(17, 'Read the historical accounts of checking claims and find the drum that is set independently of the watch', [
    'evidence', 'perspective', 'perspectives', 'scope', 'methods-and-tools',
  ], (d) => {
    useDoor(d, 'council-gallery-path');
    expect(readSign(d, 'council-optics-letter')).toContain('Ibn al-Haytham, Book of Optics');
    expect(readSign(d, 'council-mill-letter')).toContain('John Stuart Mill, On Liberty, 1859');
    expect(readSign(d, 'council-rail-record')).toContain('The watch does not set the drum');
    if (placePracticeDial) {
      expect(readSign(d, 'council-crew-slate')).toContain('The next checker can ask how they set it');
      expect(d.done('council.bench.sources')).toBe(true);
    }
    d.talk('council-reader');
    expect(d.done('council.sources')).toBe(true);
  });
  if (placePracticeDial) route.at(21, 'Let apprentices use the dial at a shared handover and ask who set each mark', [
    'power', 'values', 'culture', 'responsibility', 'justification', 'ethics', 'perspective', 'perspectives',
  ], (d) => {
    d.talk('council-reader', 'Find a place for the spare practice dial', 'Set the practice dial at the shared rail');
    expect(d.s.flags['council.bench.layout']).toBe('rail');
    expect(readSign(d, 'council-bench-rail')).toContain('during the handover');
    expect(d.done('council.bench')).toBe(true);
  });
  route.at(23 + extra, placePracticeDial ? 'Test the draft against two watches that agree at first and behave differently one minute later'
    : 'Start the working and stopped watches at the same time and compare what changes a minute later', [
    'evidence', 'explanation', 'objectivity', 'certainty', 'methods-and-tools',
    ...(placePracticeDial ? ['truth'] as const : []),
  ], (d) => {
    useDoor(d, 'council-gallery-return');
    d.talk('council-keeper');
    checkCouncilClock(d, 'working', { watch: '12:00', reference: '12:00', after: '12:01' });
    checkCouncilClock(d, 'matched', { watch: '12:00', reference: '12:00', after: '12:00' });
    expect(d.done('council.compare')).toBe(false);
    if (placePracticeDial) expect(readSign(d, 'council-draft')).toContain('AT A GLANCE IS WORKING');
  });
  route.at(28 + extra, 'Test the stopped watch against a different reference and check the fix to the one-glance instruction', [
    'truth', 'certainty', 'explanation', 'objectivity', 'interpretation', 'scope', 'methods-and-tools',
  ], (d) => {
    checkCouncilClock(d, 'drift', { watch: '12:00', reference: '11:00', after: '12:00' });
    expect(d.done('council.compare')).toBe(true);
    d.talk('council-keeper');
    expect(readSign(d, 'council-checked')).toContain('A stopped watch can match the reference at one moment');
  });
  route.at(34 + extra, 'Use the dated repair record for this shift and keep an independent check as a fallback', [
    'power', 'values', 'responsibility', 'justification', 'ethics', 'scope',
  ], (d) => {
    useDoor(d, 'council-gallery-path');
    d.talk('council-reader', 'Use the dated repair record and its fallback');
    expect(d.done('council.publish')).toBe(true);
    expect(d.s.flags['council.response']).toBe('record');
    readSign(d, 'council-result-record');
  });
  route.at(41 + extra, 'Read the courier’s question and check what gets through as the shutter falls', [
    'evidence', 'perspective', 'perspectives', 'scope', 'interpretation',
  ], (d) => {
    readSign(d, 'council-reader-note');
    expect(d.done('council.reader')).toBe(false);
    readSign(d, 'council-shutter-view');
    expect(d.done('council.reader')).toBe(true);
  });
  route.at(47 + extra, 'Apply the Island’s practice of keeping both records and relay each time mark across the short overlap', [
    'power', 'values', 'perspectives', 'responsibility', 'justification', 'ethics', 'methods-and-tools',
  ], (d) => {
    d.talk('council-reader', 'I kept both landing sheets on the island', 'Set a spoken relay across the short overlap');
    expect(d.done('council.finish')).toBe(true);
    expect(d.s.flags['council.response']).toBe('record');
    expect(d.s.flags['council.revision']).toBe('relay');
    readSign(d, 'council-result-record');
    expect(readSign(d, 'council-revised-relay')).toContain('repeats the pair back');
  });
  route.at(53 + extra, 'Leave a large copy so the next checker can see who checked which reference and when', [
    'evidence', 'perspective', 'scope', 'responsibility', 'methods-and-tools', 'ethics',
  ], (d) => {
    d.talk('council-reader', 'Leave a wide copy of the check instructions');
    expect(d.done('council.copy')).toBe(true);
    readSign(d, 'council-check-copy');
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
    { name: 'Nexus main route into Emberford', end: 42, play: () => nexusToEmberford('main') },
    { name: 'Nexus and Emberford with optional stops', end: 86, play: () => nexusToEmberford('explore') },
    { name: 'Nexus seal and Emberford’s Two-Bell Order', end: 105, play: () => nexusToEmberford('records') },
    { name: 'Nexus with the Arrow at the Turn and the Emberford washhouse', end: 101, play: () => nexusToEmberford('guide') },
    { name: 'Nexus with the Uncounted Reader and two reading rests', end: 91, play: () => nexusToEmberford('rests') },
    { name: 'Nexus with the separate grant and museum date rails', end: 89, play: () => nexusToEmberford('ribbon') },
    { name: 'Nexus with the slipped print and Emberford’s one-name tag', end: 98, play: () => nexusToEmberford('print') },
    { name: 'Nexus with both layouts at the Packing Table', end: 92, play: () => nexusToEmberford('packing') },
    { name: 'Nexus and Emberford with both scout protocols', end: 96, play: () => nexusToEmberford('scout') },
    { name: 'Nexus with the Hinged Reader and the working-model check', end: 91, play: () => nexusToEmberford('viewer') },
    { name: 'Nexus with the call at the curtain and Ethren’s spare felt', end: 92, play: () => nexusToEmberford('curtain') },
    { name: 'Emberford’s Last Turn from the Showdown to the Study', end: 91, play: () => nexusToEmberford('last-turn') },
    { name: 'Nile first visit from a prepared Chapter 1 save', end: 50, play: () => nileDispatch() },
    { name: 'Nile first visit with the matched packet dates', end: 54, play: () => nileDispatch('workers', undefined, true) },
    { name: 'Nile first visit with the Reading Window', end: 53, play: () => nileDispatch('reading-window') },
    { name: 'Nile first visit with the Borrowed Mark stop', end: 55, play: () => nileDispatch('borrowed-mark') },
    { name: 'Nile first visit with the lamp and the pinned slip', end: 54, play: () => nileDispatch('lamp-slip') },
    { name: 'Nile first visit with the two closing slips', end: 53, play: () => nileDispatch('closing-peg') },
    { name: 'Nile route through Royal Records and the route model', end: 54, play: () => nileDispatch('royal-seal') },
    { name: 'Nile Royal Records route with the Tilt Tray stop', end: 57, play: () => nileDispatch('royal-seal', 'tilt-tray') },
    { name: 'Nile first visit with the Map Room sketch', end: 56, play: () => nileDispatch('workers', 'wayfinding') },
    { name: 'Preserved Lives from a prepared Chapter 2 save', end: 50, play: preservedLives },
    { name: 'Observatory Coast from a prepared Chapter 3 save', end: 50, play: observatoryCoast },
    { name: 'Observatory Coast with the quay bell slip', end: 52, play: () => observatoryCoast('bell-slip') },
    { name: 'Observatory Coast with the menders’ frame and lookout’s check', end: 54, play: () => observatoryCoast('clear-terms') },
    { name: 'Living Forest from a prepared Chapter 4 save', end: 55, play: () => livingForest(false) },
    { name: 'Living Forest starting with the bridge route book', end: 55, play: () => livingForest(true) },
    { name: 'Living Forest with the Green Squares survey', end: 67, play: () => livingForest(true, true) },
    { name: 'Metalworks from a prepared Chapter 5 save', end: 50, play: () => metalworks(false) },
    { name: 'Metalworks with the Turned Tag investigation', end: 57, play: () => metalworks(true) },
    { name: 'City of Copies from a prepared Chapter 6 save', end: 51, play: () => cityOfCopies() },
    { name: 'City of Copies with a matched ramp warning', end: 59, play: () => cityOfCopies(true) },
    { name: 'Cartographers’ Sea from a prepared Chapter 7 save', end: 51, play: () => cartographersSea() },
    { name: 'Cartographers’ Sea with the roof and lantern key', end: 58, play: () => cartographersSea(true) },
    { name: 'House of Performance with the silence first', end: 51, play: () => houseOfPerformance('pause') },
    { name: 'House of Performance starting from a gallery seat', end: 54, play: () => houseOfPerformance('move') },
    { name: 'House of Performance with an early aisle-seat request', end: 58, play: () => houseOfPerformance('move', true) },
    { name: 'Market of Measures from a prepared Chapter 9 save', end: 52, play: marketOfMeasures },
    { name: 'Water Commons from a prepared Chapter 10 save', end: 57, play: waterCommons },
    { name: 'Civic Machine from a prepared Chapter 11 save', end: 63, play: () => civicMachine() },
    { name: 'Civic Machine with the shared receiving mark', end: 73, play: () => civicMachine(true) },
    { name: 'Archive of Voices from a prepared Chapter 12 save', end: 60, play: () => archiveOfVoices() },
    { name: 'Archive of Voices with the approved queue excerpt', end: 63, play: () => archiveOfVoices(true) },
    { name: 'Island of Models from a prepared Chapter 13 save', end: 67, play: () => islandOfModels() },
    { name: 'Island of Models with the dock’s square-board check', end: 71, play: () => islandOfModels(true) },
    { name: 'Council of Inquiry from a prepared Chapter 14 save', end: 56, play: () => councilOfInquiry() },
    { name: 'Council of Inquiry with the shared practice dial', end: 60, play: () => councilOfInquiry(true) },
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
      `Gameplay formats traced by 30m: ${route.formatsThrough(30).join(', ') || 'none recorded'}`,
      `Gameplay formats traced across the route: ${route.formatsThrough(end).join(', ') || 'none recorded'}`,
      'Trailing 30m gaps (end times of windows):',
      ...(gaps.length ? gaps.map(({ dimension, from, until }) =>
        `  ${dimension}: ${from}m ${until === null ? 'through the trace end' : `to before ${until}m`}`) : ['  None in this trace']),
      `Only one distinct annotated action in at least one full window: ${narrow.join(', ') || 'none in this trace'}`,
    ].join('\n'));
  });
});
