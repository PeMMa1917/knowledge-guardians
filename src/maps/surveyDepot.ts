import { DEPOT_RECORDS } from '../content/surveyDepot';
import type { Condition } from '../domain/types';
import type { Interactable, MapDef } from './types';

const harbour = 'observatory.harbour';
const depot = 'observatory.survey-depot';
const arrived: Condition = { flag: 'coast.arrived', eq: true };
const flag = (id: string, eq: string | true = true): Condition => ({ flag: `depot.${id}`, eq });
const set = (id: string): Condition => ({ flagSet: `depot.${id}` });
const objective = (id: string): Condition => ({ objective: `depot.${id}` });
const all = (...clauses: Condition[]): Condition => ({ all: clauses });
const not = (clause: Condition): Condition => ({ not: clause });
const sources = (group: string): Condition => ({ all: DEPOT_RECORDS.filter((r) => r.group === group).map(({ card }) => ({ card })) });

function scene(id: string, x: number, y: number, label: string, art: string, visibleIf?: Condition, node = id): Interactable {
  return { id: `depot-${id}`, kind: 'scene', x, y, w: 1, h: 1, label,
    art: `depot.${art}`, node: `depot.${node}`, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf?: Condition, readFlag?: string): Interactable {
  return { id: `depot-${id}`, kind: 'sign', x, y, w: 1, h: 1, label, art: `depot.${art}`,
    text, visibleIf, flag: readFlag && `depot.${readFlag}`, walkThrough: true };
}

const pairsChecked = all(objective('known'), objective('reused'));
const atIndex = (mode: string) => flag('index', mode);
export const DEPOT_HARBOUR_PROPS: Interactable[] = [
  { id: 'depot-door', kind: 'door', x: 4, y: 14, w: 1, h: 1, art: 'preserved.door', label: 'the instrument and sample depot',
    visibleIf: arrived, to: { map: depot, x: 17, y: 24 } },
  scene('proof-paired', 2, 13, 'Mayle’s joint viewing tray', 'paired', all(atIndex('paired'), not(objective('proof'))), 'proof.paired'),
  scene('proof-linked', 5, 14, 'the departing loan card and staffed case link', 'linked', all(atIndex('linked'), not(objective('proof'))), 'proof.linked'),
  sign('used-paired', 2, 13, 'the two checked indices at the public tray', 'paired',
    'Mayle compares the number plates together with the lid’s past record. The body remains on the open tray, so the next loan awaits the keeper’s later receipt.', flag('proof', 'paired')),
  sign('used-linked', 5, 14, 'the checked loan mark with its case appointment', 'linked',
    'The runner can use the loan card for body 16616 at once. The older lid, its plate and its association are available in the keeper’s next session.', flag('proof', 'linked')),
];

const groups: Record<string, { x: number; y: number; gap: number }> = {
  identity: { x: 4, y: 5, gap: 3 }, pressure: { x: 20, y: 5, gap: 3 },
  date: { x: 4, y: 10, gap: 3 }, models: { x: 19, y: 10, gap: 3 },
  counts: { x: 4, y: 15, gap: 4 }, signal: { x: 4, y: 21, gap: 4 }, water: { x: 25, y: 21, gap: 4 },
};

const caseProps = Object.entries(groups).flatMap(([id, { x, y, gap }]) =>
  DEPOT_RECORDS.filter(({ group }) => group === id).map((record, i): Interactable => ({
    id: `depot-case-${record.slug}`, kind: 'exhibit', exhibit: record.exhibit, x: x + gap * i, y, w: 1, h: 1,
    label: record.title, art: record.art,
  })));

const knownView = all(flag('pair', 'known'), not(pairsChecked));
const reusedView = all(flag('pair', 'reused'), not(pairsChecked));
const pressureMeasured = all(flag('seen.dial'), flag('seen.trace'));
const countMeasured = all(flag('seen.bundles'), flag('seen.slides'));
const signalMeasured = all(flag('seen.low'), flag('seen.high'));

export const SURVEY_DEPOT: MapDef = {
  id: depot, name: 'Observatory Coast: The Instrument Depot', world: 'WORLD-05', width: 34, height: 27,
  spawn: { x: 17, y: 24 }, background: 0x20343e, music: 'music.archive', ambience: 'study',
  floor: (x, y) => {
    if (x < 1 || x > 32 || y < 0 || y > 26) return null;
    if (y < 3) return ['wall-top', 'wall-mid', 'wall-base'][y];
    return y === 18 || x === 17 ? 'stone-b' : 'stone-c';
  },
  blocks: [[1, 0, 32, 3]], zones: [],
  npcs: [{ id: 'depot-keeper-eland', x: 15, y: 7, facing: 'left' }, { id: 'depot-visitor-mayle', x: 12, y: 19, facing: 'right' }],
  stamps: [{ stamp: 'bookshelf', x: 1, y: 2 }, { stamp: 'bookshelf', x: 30, y: 2 },
    { stamp: 'window', x: 6, y: 1 }, { stamp: 'window', x: 15, y: 1 }, { stamp: 'window', x: 24, y: 1 },
    { stamp: 'bench', x: 3, y: 24 }, { stamp: 'bench', x: 28, y: 24 }, { stamp: 'rug-green', x: 16, y: 23 }],
  lights: [{ x: 9, y: 6, r: 86, color: 0xe7cb9a }, { x: 25, y: 6, r: 89, color: 0xacd5ec },
    { x: 10, y: 13, r: 83, color: 0xbcdfde }, { x: 25, y: 13, r: 88, color: 0xf1cf9d },
    { x: 14, y: 17, r: 91, color: 0xb0d4e5 }, { x: 10, y: 22, r: 91, color: 0xf6dbac }, { x: 26, y: 22, r: 75, color: 0xb1e2df }],
  interactables: [
    ...caseProps,
    { id: 'depot-return', kind: 'door', x: 17, y: 26, w: 1, h: 1, art: 'preserved.door',
      label: 'the depot passage to the west quay', to: { map: harbour, x: 5, y: 14 } },
    sign('directory', 16, 24, 'the depot’s bench directory', 'ledger',
      'At the far left: the linked stand and reused case. Start with Eland at the top. Other benches hold the dated slips, pressure readings, remakes, slide counts, field signals and water records.'),
    { ...scene('load', 5, 7, 'the two practice fittings at Eland’s stand', 'empty', all(sources('identity'), not(pairsChecked))),
      artBy: { flag: 'depot.pair', keys: { known: 'depot.scope', reused: 'depot.reused' } } },
    sign('known-body', 8, 7, 'the exposed known scope plate', 'scope',
      'The practice inscription reproduces 16166. It belongs to the body, as SPRI records for the Zeiss scope.', knownView, 'known.body'),
    sign('known-lid', 11, 7, 'the linked scope case reference', 'linked',
      'The case file refers explicitly to the scope’s accession N: 115a. The catalogue links it to the scope marked 16166. The practice box keeps the entry as its clip.', knownView, 'known.lid'),
    sign('reused-body', 8, 7, 'the exposed reused microscope body plate', 'reused',
      'The direct body view identifies J. Swift & Son serial 16616. It is visible on the body, behind the foot of the stand.', reusedView, 'reused.body'),
    sign('reused-lid', 11, 7, 'the microscope’s older lid plate', 'paired',
      'The lid plate gives 30607. SPRI records the case used with the older body 16616. This plate preserves the identity of a different instrument.', reusedView, 'reused.lid'),
    scene('compare', 13, 8, 'the intake card and two checked locations', 'ledger', all(pairsChecked, not(set('index')))),
    sign('index-paired', 13, 8, 'the shared tray record and waiting loan', 'paired',
      'The open tray has the lid and body beside each other. The original marks are readable. The loan clerk has a later time.', atIndex('paired')),
    sign('index-linked', 13, 8, 'the separate loan and viewing records', 'linked',
      'The body is indexed for the loan. The older lid stays with a record of its use and a staffed appointment at the workshop.', atIndex('linked')),

    { ...scene('pressure', 21, 7, 'the fixed paper storm and its two views', 'dial', all(sources('pressure'), not(pressureMeasured))),
      artBy: { flag: 'depot.pressure.view', keys: { dial: 'depot.dial', trace: 'depot.trace' } } },
    sign('pressure-dial', 24, 7, 'the last dial tick', 'dial',
      'Final tick: four. The starting mark was four. At the end the dial gives no value for the middle of the shift.',
      all(flag('pressure.view', 'dial'), not(pressureMeasured)), 'seen.dial'),
    sign('pressure-trace', 24, 7, 'the strip with three time marks', 'trace',
      'First tick: four. Middle: two. Last: four. The history strip spreads all three values over the recorded interval.',
      all(flag('pressure.view', 'trace'), not(pressureMeasured)), 'seen.trace'),
    scene('pressure-pin', 21, 7, 'the two tested pressure records', 'trace', all(pressureMeasured, not(set('pressure'))), 'pressure.pin'),
    sign('pressure-current', 21, 7, 'the final dial beside the current turn slip', 'dial',
      'The runner needs the current four. The companion strip records that the value fell to two in the middle and came back.', flag('pressure', 'current')),
    sign('pressure-history', 21, 7, 'the time trace at the keeper’s stand', 'trace',
      'The keeper can trace the temporary drop. A date clip at the right gives the last tick for the runner.', flag('pressure', 'history')),

    scene('date', 10, 12, 'the three kinds of date on separate clips', 'ledger', all(sources('date'), not(set('date')))),
    sign('date-line', 10, 12, 'the dated event line', 'trace',
      'The two certificates, the travel year and the recovery dates each keep their own source. The earlier object is not inferred from the order of recovery.', flag('date', 'line')),
    sign('date-rows', 10, 12, 'the three dated event rows', 'linked',
      'Examination, use and retrieval have separate rows. A reader can keep the types of dates straight while tracing more than one row.', flag('date', 'rows')),

    scene('models', 25, 12, 'the dated model and handling shelf', 'empty', all(sources('models'), not(set('models')))),
    sign('models-touch', 25, 12, 'the handling replicas and their source tabs', 'scope',
      'The model can be lifted and the newer packet can be compared for shape. The original biscuit record stays under glass, with its own purpose label.', flag('models', 'touch')),
    sign('models-trail', 25, 12, 'the record trail and second model shelf', 'ledger',
      'The exact object records are first. The wheel’s type and actual journey have separate fields. The biscuit and the modern replica packet keep their own labels and dates.', flag('models', 'trail')),

    { ...scene('count', 13, 17, 'the two-unit tally wheel and paper bundles', 'bundles', all(sources('counts'), not(countMeasured))),
      artBy: { flag: 'depot.count.mode', keys: { bundles: 'depot.bundles', slides: 'depot.slides' } } },
    sign('count-bundles', 16, 17, 'the six package tabs', 'bundles',
      'One container has six package positions. These marks count packages. Each package continues to have its own accession.',
      all(flag('count.mode', 'bundles'), not(countMeasured)), 'seen.bundles'),
    sign('count-slides', 16, 17, 'the six distinct slide tallies', 'slides',
      '7, 5, 21, 25, 21 and 18 slides, in the six records. Total: 97 recorded slides. A pair of 21s keeps two different accession tabs.',
      all(flag('count.mode', 'slides'), not(countMeasured)), 'seen.slides'),
    scene('count-pin', 13, 17, 'the two checked tallies ready for a reader', 'bundles', all(countMeasured, not(set('count'))), 'count.pin'),
    sign('count-pack', 13, 17, 'the six places on the carrier bench', 'bundles',
      'The courier sees six labelled package places. The study rail holds the 97-slide number by accession.', flag('count', 'pack')),
    sign('count-study', 13, 17, 'the study rail with six accession numbers', 'slides',
      'The examiner can check the count for any accession. The courier’s six-package comparison remains on the box card.', flag('count', 'study')),

    { ...scene('signal', 9, 23, 'the same paper signal with two positions', 'signal-low', all(sources('signal'), not(signalMeasured))),
      artBy: { flag: 'depot.signal.view', keys: { low: 'depot.signal-low', high: 'depot.signal-high' } } },
    sign('signal-low', 6, 23, 'the low rail’s view of the signal', 'signal-low',
      'The shape faces the low rail. The other approach shows its unmarked back. The signal was sent in a known direction.',
      all(flag('signal.view', 'low'), not(signalMeasured)), 'seen.low'),
    sign('signal-high', 14, 23, 'the far post’s view of the same signal', 'signal-high',
      'The far post sees the mark from this setting. The reader at the rail needs the walk-around or the runner.',
      all(flag('signal.view', 'high'), not(signalMeasured)), 'seen.high'),
    scene('signal-pin', 9, 23, 'the two checked positions and one hanger', 'signal-high', all(signalMeasured, not(set('signal'))), 'signal.pin'),
    sign('signal-rail', 6, 23, 'the mark facing the near rail', 'signal-low',
      'A seated reader can see the mark from here. A runner has gone to tell the far post where to check it.', flag('signal', 'rail')),
    sign('signal-post', 14, 23, 'the mark and low-rail runner note', 'signal-high',
      'The far post receives the mark. The runner puts a copy in front of the low viewer, with the same place attached.', flag('signal', 'post')),

    scene('water', 26, 23, 'the two sending clips for the dock and study bench', 'linked', all(sources('water'), not(set('water')))),
    sign('water-height', 26, 23, 'the sent height mark and waiting bottle', 'trace',
      'The receiver can compare the dock’s dated height. The practice bottle is ready for a new field record.', flag('water', 'height')),
    sign('water-sample', 26, 23, 'the empty sample worksheet by the carrying clip', 'ledger',
      'The receiver knows where to fill a later date and location. The height remains a dated record at the dock.', flag('water', 'sample')),
  ],
};
