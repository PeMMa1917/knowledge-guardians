/** Audit documented intersections of one authored action, one learning dimension and one RPG element. */
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
export const TARGET = 10;
const reasoningModes = new Map([
  ['deductive', 'Deductive'], ['inductive', 'Inductive'], ['abductive', 'Abductive'],
  ['analogical', 'Analogical'], ['causal', 'Causal'], ['pragmatic', 'Pragmatic'],
]);
const catalogueStatus = new Map([['✓', 'playable'], ['◐', 'partial'], ['○', 'planned'], ['✗', 'excluded']]);
const listId = (kind, id) => `${kind}:${id}`;
const distinct = (items) => [...new Set(items)];
const cellKey = (world, dimension, element) => [world, dimension, element].join('|');

// GAME_ELEMENTS 267 includes physical comparisons that investigate a specific discrepancy.
// Each listed action has a different discrepancy and an independently observable check.
const nexusEvidenceInvestigations = [
  {
    objective: 'corner.compare', map: 'nexus.archive', target: 'fourth-corner-inserts',
    source: 'tests/fourth-corner.test.ts', anchor: 'no date or sketch for the first weaving',
    action: 'Try both inserts at the missing corner and check the matching repair order. A repeat can fit the cloth even though the order only dates the repair.',
  },
  {
    objective: 'nexus.ribbon.checked', map: 'nexus.archive', target: 'nexus-ribbon-setup',
    source: 'tests/opening-date-ribbon.test.ts', anchor: 'leaves the start of use blank',
    action: 'Compare one dated grant with the museum’s range for the pen. Keep the start of everyday use open when someone tries to read it off the rail.',
  },
  {
    objective: 'nexus.seal.checked', map: 'nexus.archive', target: 'curator-dace',
    source: 'tests/opening-seal.test.ts', anchor: 'draws a limited claim from the two records',
    action: 'Use the lens on the model, lift the handling seal to find the separate docket and trace what each source supports at the label.',
  },
  {
    objective: 'nexus.viewer.compared', map: 'nexus.archive', target: 'nexus-viewer-start',
    source: 'tests/opening-viewer.test.ts', anchor: 'trials both views and repairs the %s copy for the next reader',
    action: 'Move the hinged reader between the enlarged marking point and the whole patent. Check which view shows the ball and which retains the grant number and date.',
  },
  {
    objective: 'nexus.print.checked', map: 'nexus.archive', target: 'nexus-print-edge',
    source: 'tests/opening-print.test.ts', anchor: 'shows the offset trial and lets a player recover without losing anything',
    action: 'On the edge-first route, square the ferry sheets at a corner and find the floating landing mark. Set the same sheets on the pins and see both marks meet their drawn jetties.',
  },
  {
    objective: 'nexus.stroke.compared', map: 'nexus.archive', target: 'bench',
    source: 'tests/opening-practice.test.ts', anchor: 'keeps both surface results in the %s display',
    action: 'Test each pen on paper and wood. Compare the opposing results of the two matched pairs, then open the second pair of strips on the display.',
  },
  {
    objective: 'vindolanda.compare', map: 'nexus.archive', target: 'nexus-vind-trace',
    source: 'tests/vindolanda.test.ts', anchor: "expect(d.done('vindolanda.compare')).toBe(true)",
    action: 'Place both editorial slips beside the traced Vindolanda mark. Compare the different ways of restoring the letters while keeping the documented invitation separate from the question of who attended.',
  },
  {
    objective: 'fold.access.compare', map: 'nexus.archive', target: 'nexus-fold-porch',
    source: 'tests/door-fold.test.ts', anchor: "use(d, nexus, 'nexus-fold-receipt')",
    action: 'Check the two named visitor books, the visible porch landmark and the separate permission slip. The picture locates the porch and the slip gives the conditions for a particular handover.',
  },
  {
    objective: 'nexus.guide.helped', map: 'nexus.archive', target: 'nexus-guide-mount',
    source: 'tests/opening-wayfinding.test.ts', anchor: 'asks both readers to try the same wording',
    action: 'Hold the same arrow for two readers facing opposite ways. Each turns left and heads in a different direction, so the evidence identifies what the direction depends on.',
  },
  {
    objective: 'nexus.shutter.verify', map: 'nexus.two-shutters', target: 'shutter-board',
    source: 'tests/shutter-board.test.ts', anchor: 'requires both physical checks, hears each civilian once',
    action: 'Trace the light in the old setting to the baffle. Move the mirrors to reach each shutter and check the two lit destinations separately before receiving the fitting.',
  },
].map((row) => ({ ...row, dimensions: ['concept:evidence'], elements: ['game:267'] }));

const emberfordEvidenceInvestigations = [
  {
    objective: 'ember.circle.trace', map: 'aethelgard.emberford', target: 'circlereport-ledger',
    source: 'tests/circular-report.test.ts', anchor: 'awards row 317 once after physically tracing',
    action: 'Trace the tea copy, stall report and replacement notice back to their common source. The issue book identifies the loop. A separate witness saw only the upper landing.',
  },
  {
    objective: 'm02.o3.thread', map: 'aethelgard.emberford', target: 'thread-workshop',
    source: 'tests/playthrough.test.ts', anchor: 'Nobody recorded',
    action: 'Follow the thread from the stall through the guild ledger to the workshop sheet. The chain identifies the maker and stops before the stock’s earlier origin.',
  },
  {
    objective: 'copy.o.trace', map: 'aethelgard.emberford', target: 'copy-order',
    source: 'tests/emberford-followups.test.ts', anchor: 'only opens the board when its records have been compared',
    action: 'Check what the dated order establishes about the sale, take the maker’s conditions for public use, and compare the open stock-age claim with the outside account of attribution.',
  },
  {
    objective: 'bell.order.o.align', map: 'aethelgard.emberford', target: 'bell-order-board',
    source: 'tests/emberford-followups.test.ts', anchor: 'matches the two records after taking the %s first and leaves the arrival open',
    action: 'Fit the two pieces of Order 34 together. The guild mark gives a deadline and the ferry marks record a handover. Neither supplies an arrival time.',
  },
  {
    objective: 'washhouse.o.trace', map: 'aethelgard.emberford', target: 'washhouse-screen',
    source: 'tests/emberford-followups.test.ts', anchor: 'can be started on arrival and uses both downstream readings for a repair order',
    action: 'Follow the wet side step and dry rinse tray below the same head peg. Find the side run at the screen before issuing a repair order.',
  },
  {
    objective: 'hands.o.compare', map: 'aethelgard.emberford', target: 'hands-tray',
    source: 'tests/emberford-followups.test.ts', anchor: 'needs the actual counterexample from the specimen tray',
    action: 'Bring the pen’s museum entry back to the one-name tag. The record names both brothers and the separate patent-office account gives the practical pen’s development a wider set of contributors.',
  },
  {
    objective: 'linen.o.compare', map: 'aethelgard.emberford', target: 'linen-open',
    source: 'tests/emberford-linen.test.ts', anchor: 'preserve both notes, and hang either priority',
    action: 'Keep the two clipped cloth cuttings together and move them between the shade and open light. Both change appearance together, while the ferry crew still needs its separate check on the folds.',
  },
  {
    objective: 'pigment-window.controlled', map: 'aethelgard.emberford', target: 'pigment-window.stand',
    source: 'tests/pigment-window.test.ts', anchor: 'controls the lamp and custody comparisons',
    action: 'Change lamps over the same strip, then keep the lamp fixed over open and covered strips. The first comparison changes brightness. Only the second follows change during storage.',
  },
  {
    objective: 'last-turn.compare', map: 'aethelgard.emberford', target: 'last-turn.slate',
    source: 'tests/last-turn.test.ts', anchor: 'turns the same slate and checks both witnesses',
    action: 'Turn the speaking slate and check the two accounts of the same gesture. At the tally desk a face-down slate closes a turn. At the forge it reserves one.',
  },
  {
    objective: 'cart.o1.sight', map: 'aethelgard.emberford', target: 'cart-map',
    source: 'tests/sightlines.test.ts', anchor: 'the map decides; a wrong sort asks the player to look again',
    action: 'Trace the six parts of three accounts around the fruit stall, fountain and crates. Identify who could see each event and where a second voice repeats a single sighting.',
  },
].map((row) => ({ ...row, dimensions: ['concept:evidence'], elements: ['game:267'] }));

const copiesEvidenceInvestigations = [
  {
    objective: 'copies.check.press', map: 'copies.press', target: 'copies-compare-press',
    source: 'tests/copies-story.test.ts', anchor: 'expect(d.done(\'copies.check.press\')).toBe(true)',
    action: 'Align the source slip and press proof. The claim and named clerk survive, but losing the Tuesday trial qualification changes which queues the line appears to describe.',
  },
  {
    objective: 'copies.check.landing', map: 'copies.landing', target: 'copies-compare-landing',
    source: 'tests/copies-story.test.ts', anchor: 'expect(d.done(\'copies.check.landing\')).toBe(true)',
    action: 'Align the press and stall versions. The shortened words survive but the named log disappears. Find the point where readers lose a way to trace the claim.',
  },
].map((row) => ({ ...row, dimensions: ['concept:evidence'], elements: ['game:267'] }));

// Each row identifies a complete action and the intersection its trace actually supports.
// Routes count once per objective or separately observed outcome in one physical world.
const proofRows = [
  ...nexusEvidenceInvestigations,
  ...emberfordEvidenceInvestigations,
  ...copiesEvidenceInvestigations,
  {
    objective: 'clearbay.use', map: 'preserved.archive', target: 'clear-bay-board',
    source: 'tests/clear-bay.test.ts', anchor: 'awards 78 only for the full comparison and observed %s handover',
    action: 'Test the cart with and without a helper, compare gates, pin two first-bell accounts and a later repair, fold a private name and deliver the resulting opening notice to its reader.',
    comparison: {
      concepts: ['evidence', 'responsibility'], framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
      areas: [
        { id: 'MAT', method: 'Hold the gate fixed and compare space for the cart alone, the handled cart and a parcel. Take the handled cart to the other opening to locate the bound.',
          limit: 'These measured widths cover the tested loads at the present gates. The cart alone leaves its handler out of the calculation.' },
        { id: 'HIS', method: 'Pin the duty book and a visitor’s account to the same bell. Date the later moved post separately and fold the name while keeping the account of the queue visible.',
          limit: 'The staff entry and visitor’s account describe different experiences of an earlier opening. Its later repair prevents using that record as a present measurement.' },
      ],
      connection: 'Use both records for the same access notice. One reader opens a staffed cart rail later. Another receives parcels at first bell and stages a cart transfer.',
    },
    dimensions: ['micro:78', 'area:MAT', 'area:HIS', 'concept:evidence', 'concept:responsibility', 'framework:scope', 'framework:perspectives', 'framework:methods-and-tools', 'framework:ethics'],
    elements: ['game:223', 'story:72'],
  },
  {
    objective: 'ember.circle.trace', map: 'aethelgard.emberford', target: 'circlereport-ledger',
    source: 'tests/circular-report.test.ts', anchor: 'awards row 317 once after physically tracing the return citation and keeping the limited independent view',
    action: 'Follow the tea copy to the stall report and then the replacement notice citing the tea copy. Use the printer’s issue book to trace the loop. Havra’s separate view reaches the upper landing at one bell.',
    dimensions: ['micro:317', 'concept:evidence', 'concept:justification', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:258', 'story:77'],
  },
  {
    objective: 'nexus.facing.compare', map: 'nexus.archive', target: 'facing-cue-nexus',
    source: 'tests/facing-cue.test.ts', anchor: 'runs the %s Nexus readback and the %s House handover',
    action: 'Repeat the four-beat phrase from the two facings and see how the same call changes the endpoint.',
    dimensions: ['concept:perspective', 'area:ART', 'subject:dance', 'micro:449'], elements: ['game:247'],
  },
  {
    objective: 'sill.bridge.checked', map: 'emberford.sill-bridge', target: 'sill-bell-wheel',
    source: 'tests/sill-bridge.test.ts', anchor: 'serves the %s route only through its own passage',
    action: 'Use both walked locations and test the French instruction at an open notch and at the second ring before opening either route.',
    dimensions: ['concept:interpretation', 'framework:methods-and-tools', 'subject:lang-ab-initio'], elements: ['game:195'],
  },
  {
    objective: 'bend.nile.compare', map: 'nile.route', target: 'nile-bend-board',
    source: 'tests/strip-bend.test.ts', anchor: "d.done('bend.nile.compare')",
    action: 'Load and lift the same practice weight at two stops on both strips before approving a work arrangement.',
    dimensions: ['concept:evidence', 'framework:methods-and-tools', 'subject:physics'], elements: ['game:195'],
  },
  {
    objective: 'catchment.compare', map: 'water.culvert', target: 'catchment-model',
    source: 'tests/catchment.test.ts', anchor: 'keeps the upper pulse fixed and lets the player find the missing floats',
    action: 'Trace the same six floats through each setting and account for the lower count at the changed pocket.',
    reasoning: [{ mode: 'causal', basis: 'Only the pocket setting changes. Two of the same six floats stay in the exposed pocket and the lower count rises from four to six when it is covered.' }],
    dimensions: ['concept:evidence', 'concept:objectivity', 'framework:methods-and-tools', 'subject:physics', 'micro:411',
      'question:KQ-CATCHMENT-01'], elements: ['game:195', 'story:77'],
  },
  {
    objective: 'catchment.local-receipt', map: 'water.lower-channel', target: 'catchment-terrace-receipt',
    source: 'tests/catchment.test.ts', anchor: 'keeps the %s receipt, then opens the revised %s route',
    action: 'Open one of two staffed passages and record who still has to wait before testing the other notice.',
    dimensions: ['concept:values', 'concept:responsibility', 'framework:ethics', 'micro:350'], elements: ['game:22', 'story:11'],
  },
  {
    objective: 'catchment.civic.receipt', map: 'civic.canal', target: 'catchment-civic-rail',
    source: 'tests/catchment.test.ts', anchor: "d.done('catchment.civic.receipt')",
    action: 'Bring the Commons signed notice to its matching Canal Walk crew and check whose load still waits.',
    dimensions: ['framework:scope', 'concept:responsibility', 'micro:887'], elements: ['game:263', 'story:15'],
  },
  {
    objective: 'copies.wordclip.deliver', map: 'copies.archive', target: 'wordclip-receive.records',
    source: 'tests/witness-clip.test.ts', anchor: 'carries one object to different receivers',
    action: 'Bring the bound, dated wrapper record to its receiver, preserving the gloss and the witness’s limited report.',
    dimensions: ['vocabulary:version', 'vocabulary:gloss', 'vocabulary:witness'], elements: ['game:263'],
  },
  {
    objective: 'nexus.rest.checked', map: 'nexus.archive', target: 'nexus-rest-pair-ready',
    source: 'tests/opening-rests.test.ts', anchor: 'helps the pair at the low table and keeps the borrower’s unmet request',
    action: 'Place both rests at the low table and clip the borrower’s outstanding request beside the loan total.',
    dimensions: ['concept:values', 'concept:responsibility', 'framework:ethics', 'profile:caring'],
    elements: ['game:271', 'story:72'],
  },
  {
    objective: 'corner.compare', map: 'nexus.archive', target: 'fourth-corner-inserts',
    source: 'tests/fourth-corner.test.ts', anchor: 'no date or sketch for the first weaving',
    action: 'Try both inserts against the pinned hanging and check the dated repair tab before choosing how to display the gap.',
    comparison: {
      concepts: ['evidence', 'justification'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'MAT', method: 'Turn the square to extend the repeating diamond and slide the clipped insert to compare the two fits.',
          limit: 'A pattern match shows which completion follows the repeat. It leaves the original missing corner unresolved.' },
        { id: 'HIS', method: 'Match the shelf number to the dated order and relate it to the old edge and later stitches.',
          limit: 'The order establishes the recorded repair. It gives neither a date nor a diagram of the first weaving.' },
      ],
      connection: 'The display decision uses both results. It can make a full tracing available as a proposed repeat or preserve the gap beside the dated repair.',
    },
    dimensions: ['concept:evidence', 'concept:justification', 'area:MAT', 'area:HIS', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:184'],
  },
  {
    objective: 'nile.way.compare', map: 'nile.route', target: 'nile-way-board',
    source: 'tests/nile-map-guide.test.ts', anchor: 'Hold the room marks steady',
    action: 'Check the aisle and shelf ends of the same room, then turn its sketch against the fixed landmarks.',
    dimensions: ['concept:perspective', 'concept:interpretation', 'framework:perspectives', 'subject:geography',
      'question:KQ-NEW-003', 'question:KQ-ROUTE-24', 'micro:79'],
    elements: ['game:13'],
  },
  {
    objective: 'nile.routes', map: 'nile.route', target: 'nile-route-model',
    source: 'tests/nile.test.ts', anchor: "d.done('nile.routes')",
    action: 'Run the same cart load on the model’s two roads and leave the trial conditions separate from the Mine Map record.',
    dimensions: ['concept:objectivity', 'concept:evidence', 'framework:methods-and-tools', 'question:KQ-ROUTE-32', 'micro:611'],
    elements: ['game:195'],
  },
  {
    objective: 'nile.lamp.compare', map: 'nile.workyard', target: 'nile-lamp-slip',
    source: 'tests/nile-followups.test.ts', anchor: 'Return the lamp above',
    action: 'Change the lamp position on a fixed slip, then restore the original light to compare what can be seen.',
    reasoning: [{ mode: 'abductive', basis: 'The first view fits an erased groove or a hidden one. Reappearance from the side and disappearance on return favor the viewing-angle account.' }],
    dimensions: ['concept:explanation', 'framework:methods-and-tools'], elements: ['game:267', 'story:77'],
  },
  {
    objective: 'forest.moss.place', map: 'forest.community', target: 'forest-moss-table',
    source: 'tests/forest-sampling.test.ts', anchor: 'compares both light pairs and publishes only the %s route',
    action: 'Pair four frame counts by light, add the crew’s boot tally and replace the shade notice with a local observation or next check.',
    reasoning: [{ mode: 'inductive', basis: 'Both light pairs show fewer green squares beside the path. The notice keeps that provisional pattern bounded to the four sampled places.' }],
    comparison: {
      concepts: ['evidence', 'explanation'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'NAT', method: 'Count squares showing green in fixed-size frames near and away from the path in each light condition.',
          limit: 'Four frame counts support a local pattern. Other conditions such as moisture were not tested.' },
        { id: 'HUM', method: 'The crew’s separate tally records where walkers’ boots contacted the ground during one round.',
          limit: 'The tally describes observed behavior. It leaves open whether walkers chose already-bare ground.' },
      ],
      connection: 'Put the two records beside each other before replacing the shade notice. The frame counts locate a pattern and the human observations suggest one explanation that a later check could distinguish.',
    },
    dimensions: ['concept:evidence', 'concept:explanation', 'area:NAT', 'area:HUM', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:146'],
  },
  {
    objective: 'sea.finish', map: 'sea.harbour', target: 'sea-harbourkeeper',
    source: 'tests/cartographers-story.test.ts', anchor: "d.done('sea.finish')",
    action: 'After hearing the reader, revise directions to show where the harbour and shoal surveys stop.',
    dimensions: ['concept:responsibility', 'framework:scope', 'subject:geography', 'question:KQ-ROUTE-15', 'micro:350'],
    elements: ['game:13', 'story:130'],
  },
  {
    objective: 'coast.breeze.follow', map: 'observatory.station', target: 'coast-breeze-headland',
    source: 'tests/coast-breeze.test.ts', anchor: 'allows the %s comparison first, surviving a retest and a later %s receipt',
    action: 'Record the same two practice marks in still air and at the first gust. Use that strip to request a comparison at Olwen’s hood or a second gust at Ruan’s exposed stand, then attach the measured receipt.',
    titleApplications: [{
      id: 'essay-title:PT-M25-06', area: 'NAT',
      basis: 'Making the first dip measurable gives Neri a question about where it can be seen. The receipt adds a specific next test, either a third peg at the same interval or an exposed reading beside a hooded one.',
      foil: 'The repeat at the exposed stand can settle whether the dip returns within this exercise. The matched gust under the hood can settle whether both stands see it. Each result closes a different uncertainty and leaves a narrower one open.',
      limit: 'The two stands differ in both position and shelter, so their matched gust leaves each factor’s separate contribution open. This scripted practice and its authored questions give no measure of wonder or evidence about real gusts.',
    }],
    dimensions: ['area:NAT'], elements: ['game:267', 'story:77'],
  },
  {
    objective: 'stage.compare', map: 'stage.rehearsal', target: 'stage-director',
    source: 'tests/performance-story.test.ts', anchor: "d.done('stage.compare')",
    action: 'Rehearse identical words and movement with the pause on either side of the crate move, then pin the contrast.',
    dimensions: ['concept:interpretation', 'area:ART', 'subject:theatre', 'question:KQ-ROUTE-30', 'micro:449'],
    elements: ['game:234', 'game:247'],
  },
  {
    objective: 'stage.light.o.display', map: 'stage.rehearsal', target: 'stage-light-stand',
    source: 'tests/performance-story.test.ts', anchor: 'lets both first-look arrangements change the scene in either order',
    action: 'Invite a visitor to the same paper relief after hanging the foyer display. Either leave the lamp fixed for their first look or move it in front of them and hear what they ask.',
    observation: { flag: 'stage.light.visitor', values: ['quiet', 'shown'] },
    titleApplications: [{
      id: 'essay-title:PT-M25-06', area: 'ART',
      basis: 'Showing how the paper grip or shadow is made prompts a specific new inquiry. The fixed relief makes the lighting change visible.',
      foil: 'The quiet first look also prompts a specific inquiry without a demonstration. The question is different after the player moves the lamp.',
      limit: 'The responses are written for individual fictional visitors. The encounter cannot establish changes in a real learner’s curiosity or feelings.',
    }],
    dimensions: ['area:ART'], elements: ['game:253', 'story:106'],
  },
  {
    objective: 'water.publish', map: 'water.council', target: 'water-scribe',
    source: 'tests/water-story.test.ts', anchor: "d.done('water.publish')",
    action: 'Use measured drought flows and two work cards to post a tested allocation and show which work must wait.',
    reasoning: [{ mode: 'pragmatic', basis: 'Choose a feasible tested setting according to which work must go first, then keep its cost for the crew that waits visible on the order.' }],
    dimensions: ['concept:values', 'concept:responsibility', 'framework:ethics', 'question:KQ-NEW-006', 'question:KQ-ROUTE-35', 'micro:436'],
    elements: ['game:271', 'story:11'],
  },
  {
    objective: 'civic.overlap.evidence', map: 'civic.dispatch', target: 'civic-overlap-rack',
    source: 'tests/civic-story.test.ts', anchor: 'Group the remaining rows',
    action: 'Fill and group the arrival rows, then check them against the local crew’s release time.',
    reasoning: [{ mode: 'deductive', basis: 'Three ordered arrivals have four possible marks each. Grouping all 64 assignments gives 24 using separate marks and 40 sharing a mark under the stated rules.' }],
    comparison: {
      concepts: ['evidence', 'certainty'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'MAT', method: 'Enumerate ordered outcomes in a four-mark model and distinguish separate from shared arrivals.',
          limit: 'The proportions treat the 64 assignments as equally likely under independent draws.' },
        { id: 'HUM', method: 'Check the crew’s end-of-shift account for a working practice affecting when couriers arrive.',
          limit: 'The shared release bell makes grouped arrivals plausible. One crew’s slip supplies no frequency for the four marks.' },
      ],
      connection: 'The rack tells which outcomes are possible under its rules. The crew’s record tells when those rules might misdescribe a real queue in the game. Both enter the same dispatch decision.',
    },
    dimensions: ['concept:evidence', 'concept:certainty', 'area:MAT', 'area:HUM', 'framework:scope',
      'framework:methods-and-tools', 'atl:thinking', 'subject:math-ai'],
    elements: ['game:184', 'story:72'],
  },
  {
    objective: 'asia.loft.compare', map: 'island.label-loft', target: 'loft-copy',
    source: 'tests/asia-label-loft.test.ts', anchor: 'uses distinct methods, then changes the open physical lane',
    action: 'Compare case strips and carry a method for tying a claim to its setting into a different two-berth dock copy.',
    reasoning: [{ mode: 'analogical', basis: 'A measurement or named provenance belongs to its own case. Use the same relationship to attach each dock trial figure or place tag to its corresponding berth row.' }],
    dimensions: ['concept:interpretation', 'framework:scope'], elements: ['game:179'],
  },
];

export function parseCatalogue(text, kind, size) {
  const rows = new Map();
  for (const line of text.split(/\r?\n/)) {
    const columns = line.split('|').map((column) => column.trim());
    if (!/^\d+$/.test(columns[1] ?? '')) continue;
    const number = Number(columns[1]);
    const status = catalogueStatus.get(columns[kind === 'game' ? 3 : 4]);
    if (!status || !columns[2] || rows.has(number)) throw Error(`Invalid ${kind} catalogue row ${number}.`);
    rows.set(number, { id: listId(kind, number), number, kind, name: columns[2], status });
  }
  if (rows.size !== size || Array.from({ length: size }, (_, index) => index + 1).some((number) => !rows.has(number))) {
    throw Error(`The ${kind} catalogue should contain rows 1–${size} once each.`);
  }
  return [...rows.values()].sort((a, b) => a.number - b.number);
}

/** These metadata rows carry access evidence only. A source ordinal is not a gameplay link. */
export function essayTitleInventory(sources) {
  const codes = new Set();
  const urls = new Set();
  return sources.flatMap(({ code, session, source, page, ordinals, verifiedOn }) => {
    const match = /^(May|Nov) (20\d{2})$/.exec(session);
    if (!match || code !== `${match[1][0]}${match[2].slice(-2)}` || codes.has(code) || urls.has(source)
      || !/^https:\/\/drive\.google\.com\/file\/d\/[A-Za-z\d_-]+\/view$/.test(source)
      || !Number.isInteger(page) || page < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(verifiedOn)
      || !Array.isArray(ordinals) || ordinals.length !== 6 || !ordinals.every((ordinal, i) => ordinal === i + 1)) {
      throw Error(`Invalid prescribed title source for ${session}.`);
    }
    codes.add(code);
    urls.add(source);
    return ordinals.map((ordinal) => ({
      id: `essay-title:PT-${code}-${String(ordinal).padStart(2, '0')}`, kind: 'essay-title',
      name: `${session} title ${ordinal}`, session, ordinal, source, page, verifiedOn,
    }));
  });
}

function makeDimensions({ pack, curriculum, levels, topics, exhibition, micro, suppliedMicro, microSkillId, titleSources }) {
  const group = (kind, items) => items.map(([value, name]) => ({ id: listId(kind, value), kind, name }));
  const named = (values) => Object.entries(values).map(([id, name]) => [id, name]);
  const names = (values) => values.map((id) => [id, id]);
  const questionPrompts = new Set(exhibition.map(({ question }) => question.id));
  const microNames = new Map(micro.map(({ number, name }) => [number, name]));
  const supplied = new Set(suppliedMicro);
  if (questionPrompts.size !== 35 || exhibition.length !== 35) throw Error('The exhibition prompt registry should have 35 unique IDs.');
  const questions = pack.questions.map(({ id }) => ({
    id: listId('question', id), kind: 'question', name: id, exhibitionPrompt: questionPrompts.has(id),
  }));
  if (questions.filter(({ exhibitionPrompt }) => exhibitionPrompt).length !== questionPrompts.size) {
    throw Error('An exhibition prompt is missing from the registered question inventory.');
  }
  return [
    ...group('concept', named(curriculum.CONCEPT_NAMES)),
    ...group('framework', names(levels.FRAMEWORK)),
    ...group('area', topics.TOK_AREAS.map((id) => [id, curriculum.AOK_NAMES[id]])),
    ...group('theme', topics.TOK_OPTIONAL_THEMES.map((id) => [id, curriculum.AOK_NAMES[id]])),
    { id: 'theme:knower', kind: 'theme', name: 'Knowledge and the knower' },
    ...group('subject', Object.entries(curriculum.SUBJECTS).map(([id, { name }]) => [id, name])),
    ...group('atl', named(curriculum.ATL_NAMES)),
    ...group('profile', named(curriculum.PROFILE_NAMES)),
    ...group('att', [
      ['inquiry', 'Inquiry'], ['conceptual', 'Conceptual understanding'], ['contexts', 'Local and global contexts'],
      ['teams', 'Teamwork and collaboration'], ['barriers', 'Removing barriers'], ['feedback', 'Formative feedback'],
    ]),
    ...group('cas-practice', names(['creativity', 'activity', 'service'])),
    { id: 'ee-practice:bounded-inquiry', kind: 'ee-practice', name: 'Bounded research practice' },
    ...group('skill', pack.skills.filter(({ domain }) => domain !== 'MICRO').map(({ id, name }) => [id, name])),
    ...group('vocabulary', pack.glossary.map(({ id, term }) => [id, term])),
    ...group('etymology', pack.glossary.map(({ id, term }) => [id, term])),
    ...questions,
    ...essayTitleInventory(titleSources),
    ...group('reasoning', [...reasoningModes]),
    ...Array.from({ length: 1000 }, (_, i) => i + 1).map((number) => ({
      id: listId('micro', number), kind: 'micro', name: microNames.get(number) ?? `#${number}`,
      supplied: supplied.has(number), skillId: microSkillId(number),
    })),
  ];
}

function countsBy(rows, key) {
  const counts = {};
  for (const row of rows) counts[row[key]] = (counts[row[key]] ?? 0) + 1;
  return counts;
}

function reviewComparison(row, dimensions) {
  if (!row.comparison) return;
  const { areas = [], concepts = [], framework = [], connection } = row.comparison;
  const attached = [
    ...areas.map(({ id }) => listId('area', id)),
    ...concepts.map((id) => listId('concept', id)),
    ...framework.map((id) => listId('framework', id)),
  ];
  if (areas.length !== 2 || distinct(areas.map(({ id }) => id)).length !== 2
    || distinct(areas.map(({ method }) => method)).length !== 2 || !concepts.length || !framework.length
    || areas.some(({ method, limit }) => !method?.trim() || !limit?.trim()) || !connection?.trim()
    || attached.some((id) => !dimensions.includes(id))) {
    throw Error(`Incomplete cross-area evidence for ${row.objective}.`);
  }
}

function reviewObservation(row, dialogue, trace) {
  if (!row.observation) return;
  const { flag, values = [] } = row.observation;
  const effects = dialogue.flatMap((node) => (node.options ?? []).flatMap((option) => option.effects ?? []));
  if (!flag || !trace.includes(flag) || values.length < 2 || distinct(values).length !== values.length
    || values.some((value) => typeof value !== 'string' || !value.trim() || !trace.includes(value)
      || !effects.some((effect) => effect.setFlag === flag && effect.value === value))) {
    throw Error(`Unresolved optional outcome for ${row.objective}.`);
  }
}

export function collectProofs({ objectives, maps, elements, dimensions, rows, sourceText, dialogue = [] }) {
  const elementById = new Map(elements.map((row) => [row.id, row]));
  const dimensionById = new Map(dimensions.map((row) => [row.id, row]));
  return rows.map((row) => {
    const place = objectives.get(row.objective);
    const map = maps[row.map];
    const targets = [...(map?.interactables ?? []), ...(map?.npcs ?? [])];
    const trace = sourceText.get(row.source);
    if (!place || !targets.some(({ id }) => id === row.target) || !row.anchor || !trace?.includes(row.anchor)) {
      throw Error(`Unresolved action proof for ${row.objective} at ${row.map}/${row.target}.`);
    }
    reviewObservation(row, dialogue, trace);
    const reasoning = row.reasoning ?? [];
    const reasoningIds = new Set(reasoning.map(({ mode, basis }) => {
      if (!reasoningModes.has(mode) || !basis?.trim()) throw Error(`Unresolved reasoning evidence for ${row.objective}.`);
      return listId('reasoning', mode);
    }));
    const titleApplications = (row.titleApplications ?? []).map(({ id, area, basis, foil, limit }) => {
      const title = dimensionById.get(id);
      const areaId = listId('area', area);
      const areaName = dimensionById.get(areaId)?.name;
      if (title?.kind !== 'essay-title' || !areaName || !row.dimensions.includes(areaId)
        || !basis?.trim() || !foil?.trim() || !limit?.trim()) {
        throw Error(`Unresolved title adaptation for ${row.objective}.`);
      }
      const { session, ordinal, source, page } = title;
      return { id, session, ordinal, source, page, area, areaName, basis, foil, limit };
    });
    const titleIds = new Set(titleApplications.map(({ id }) => id));
    const linked = distinct([...row.dimensions, ...reasoningIds, ...titleIds]);
    if (!row.action.trim() || !linked.length || !row.elements.length) throw Error(`Empty proof for ${row.objective}.`);
    for (const id of linked) {
      const dimension = dimensionById.get(id);
      if (!dimension || dimension.supplied === false) throw Error(`Unavailable dimension ${id} in proof for ${row.objective}.`);
      if (dimension.kind === 'question') {
        const question = id.slice('question:'.length);
        if (![place.step.kq, ...(place.step.questionWays ?? [])].some((link) => link?.id === question)) {
          throw Error(`Unsupported question ${question} in proof for ${row.objective}.`);
        }
      }
      if (dimension.kind === 'micro' && !place.step.skills?.includes(dimension.skillId)) {
        throw Error(`Unsupported micro-skill ${id} in proof for ${row.objective}.`);
      }
      if (dimension.kind === 'reasoning' && !reasoningIds.has(id)) {
        throw Error(`Unresolved reasoning evidence for ${row.objective}.`);
      }
      if (dimension.kind === 'essay-title' && !titleIds.has(id)) {
        throw Error(`Unresolved title adaptation for ${row.objective}.`);
      }
    }
    for (const id of row.elements) {
      const element = elementById.get(id);
      if (!element || !['playable', 'partial'].includes(element.status)) throw Error(`Unavailable element ${id} in proof for ${row.objective}.`);
    }
    reviewComparison(row, linked);
    const actionId = row.observation ? `outcome:${row.observation.flag}` : row.objective;
    return { ...row, actionId, dimensions: linked, world: map.world, mission: place.mission.id, missionWorld: place.mission.world,
      ...(titleApplications.length ? { titleApplications } : {}) };
  });
}

/** A reviewed action is counted once in the same physical world and pair, even with several proof rows. */
export function indexPairs(proofs) {
  const cells = new Map();
  for (const row of proofs) {
    for (const dimension of row.dimensions) for (const element of row.elements) {
      const key = cellKey(row.world, dimension, element);
      const actions = cells.get(key) ?? new Set();
      actions.add(row.actionId ?? row.objective);
      cells.set(key, actions);
    }
  }
  return cells;
}

export function pairStatus(dimension, element, count) {
  if (count >= TARGET) return 'meets-target';
  if (count > 0) return 'below-target';
  if (element.status === 'excluded') return 'excluded-by-design';
  if (element.status === 'planned') return 'planned-element';
  if (dimension.supplied === false) return 'source-unavailable';
  return 'no-action-proof';
}

export function totalsFor(worlds, dimensions, elements, index) {
  const worldSet = new Set(worlds.map(({ id }) => id));
  const dims = new Set(dimensions.map(({ id }) => id));
  const elems = new Set(elements.map(({ id }) => id));
  const count = worlds.length * dimensions.length;
  const excluded = count * elements.filter(({ status }) => status === 'excluded').length;
  const planned = count * elements.filter(({ status }) => status === 'planned').length;
  const unavailable = worlds.length * dimensions.filter(({ supplied }) => supplied === false).length
    * elements.filter(({ status }) => status === 'playable' || status === 'partial').length;
  let present = 0;
  let meets = 0;
  for (const [key, actions] of index) {
    const [world, dimension, element] = key.split('|');
    if (!worldSet.has(world) || !dims.has(dimension) || !elems.has(element)) continue;
    present++;
    if (actions.size >= TARGET) meets++;
  }
  const possible = count * elements.length;
  return {
    cells: possible, 'meets-target': meets, 'below-target': present - meets,
    'no-action-proof': possible - present - excluded - planned - unavailable,
    'planned-element': planned, 'excluded-by-design': excluded, 'source-unavailable': unavailable,
  };
}

function authoredLinks(objectives, micro, elements) {
  const statuses = new Map(elements.map(({ id, status }) => [id, status]));
  return micro.flatMap(({ number, uses }) => uses.map(({ objective, action, game, story, styles, modes }) => {
    const place = objectives.get(objective);
    const elementIds = [listId('game', game), listId('story', story)];
    const issues = elementIds.filter((id) => !['playable', 'partial'].includes(statuses.get(id)));
    return {
      objective, action, dimension: listId('micro', number), elements: elementIds, styles, modes,
      missionWorld: place?.mission.world ?? null,
      note: !place ? 'unknown-objective' : issues.length ? 'check-element-status' : 'needs-action-and-map-review',
    };
  }));
}

async function loadAudit() {
  const server = await createServer({
    root, configFile: false, optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
  });
  try {
    const [{ buildPack }, { MAPS }, curriculum, levels, topics, { QUESTION_ROUTES }, { MICRO_SKILLS, microSkillId },
      { SUPPLIED_SKILL_IDS }, game, story, titleSources] =
      await Promise.all([
        server.ssrLoadModule('/src/content/index.ts'), server.ssrLoadModule('/src/maps/index.ts'),
        server.ssrLoadModule('/src/domain/curriculum.ts'), server.ssrLoadModule('/src/domain/learningLevels.ts'),
        server.ssrLoadModule('/tools/tok-floor.ts'), server.ssrLoadModule('/src/content/questionEncounters.ts'),
        server.ssrLoadModule('/src/content/microSkillEvidence.ts'), server.ssrLoadModule('/src/domain/microSkillAudit.ts'),
        readFile(resolve(root, 'docs/GAME_ELEMENTS.md'), 'utf8'), readFile(resolve(root, 'docs/STORY_ELEMENTS.md'), 'utf8'),
        readFile(resolve(root, 'tools/prescribed-title-sources.json'), 'utf8').then(JSON.parse),
      ]);
    const pack = buildPack();
    const objectives = new Map(pack.missions.flatMap((mission) => mission.objectives.map((step) => [step.id, { mission, step }])));
    const maps = Object.values(MAPS);
    const worlds = distinct(maps.map(({ world }) => world)).sort().map((id) => ({
      id, maps: maps.filter(({ world }) => world === id).map((map) => map.id),
    }));
    const elements = [...parseCatalogue(game, 'game', 288), ...parseCatalogue(story, 'story', 150)];
    const dimensions = makeDimensions({ pack, curriculum, levels, topics, exhibition: QUESTION_ROUTES,
      micro: MICRO_SKILLS, suppliedMicro: SUPPLIED_SKILL_IDS, microSkillId, titleSources });
    if (new Set(dimensions.map(({ id }) => id)).size !== dimensions.length) throw Error('Duplicate learning dimension IDs.');
    const sourceText = new Map(await Promise.all(distinct(proofRows.map(({ source }) => source)).map(async (file) =>
      [file, await readFile(resolve(root, file), 'utf8')])));
    const proofs = collectProofs({ objectives, maps: MAPS, elements, dimensions, rows: proofRows, sourceText, dialogue: pack.dialogue });
    const candidates = authoredLinks(objectives, MICRO_SKILLS, elements);
    return { worlds, elements, dimensions, proofs, candidates };
  } finally {
    await server.close();
  }
}

const limitations = [
  'Proof rows are source-reviewed actions anchored to a map target and a representative test. This audit does not run gameplay, measure participation, or establish learning.',
  'An objective can cover several steps. Mission-wide tags, shared world, item names, text matches, repeated plays and micro-skill candidate records do not themselves count as action-level proof.',
  'Vocabulary and etymology use the current glossary IDs as a bounded inventory. Each needs an explicit action proof. The glossary does not define all TOK vocabulary.',
  'Seven past essay sets have verified source metadata. These 42 title ordinals establish access to those sources. Any gameplay adaptation needs its own reviewed action proof. Extended Essay and CAS are practice opportunities only.',
  'The 35 exhibition question families are a labeled subset of the knowledge-question IDs and enter the denominator once.',
  'The 197 unsupplied micro-skill numbers are reported as source-unavailable. Their descriptions and action links are unknown.',
  'Thinking taxonomies and player or encounter preferences have their own separate semantics and reports. They do not multiply this intersection census.',
  'A reasoning or cross-area entry describes the action available to players. It does not assert their reasoning, or infer an area comparison from co-occurring tags.',
];

const unknownInventories = [
  { scope: 'past-essay-prompts-beyond-the-verified-sets', total: null, reason: 'No itemized source was verified for sessions outside the listed inventory.' },
  { scope: 'tok-vocabulary-beyond-the-glossary', total: null, reason: 'The registered terms define the bounded vocabulary and etymology census.' },
];

function readOptions(args) {
  const options = {};
  while (args.length) {
    const key = args.shift();
    if (['--help', '--json', '--cells', '--action-report'].includes(key)) options[key.slice(2)] = true;
    else if (['--world', '--dimension', '--element'].includes(key) && args[0] && !args[0].startsWith('--')) {
      options[key.slice(2)] = args.shift();
    } else throw Error(`Unknown or incomplete audit option ${key}. Use --help.`);
  }
  if ([options.json, options.cells, options['action-report']].filter(Boolean).length > 1) {
    throw Error('Choose one output format: --json, --cells or --action-report.');
  }
  return options;
}

function select(rows, query, label) {
  if (!query) return rows;
  const result = rows.filter(({ id, kind, exhibitionPrompt }) => id === query || kind === query
    || (query === 'exhibition-prompt' && exhibitionPrompt));
  if (!result.length) throw Error(`Unknown ${label} ${query}.`);
  return result;
}

async function expand(worlds, dimensions, elements, index) {
  for (const { id: world } of worlds) for (const dimension of dimensions) for (const element of elements) {
    const actions = [...(index.get(cellKey(world, dimension.id, element.id)) ?? [])];
    const status = pairStatus(dimension, element, actions.length);
    const missingToTarget = ['no-action-proof', 'below-target', 'meets-target'].includes(status)
      ? Math.max(0, TARGET - actions.length) : null;
    const row = { world, dimension: dimension.id, element: element.id, actions, count: actions.length, missingToTarget, status };
    if (!process.stdout.write(`${JSON.stringify(row)}\n`)) await once(process.stdout, 'drain');
  }
}

async function main() {
  const options = readOptions(process.argv.slice(2));
  if (options.help) {
    console.log('node tools/audit-cross-weave.mjs [--json | --cells | --action-report] [--world WORLD-01] [--dimension concept:evidence] [--element game:271]');
    console.log('--json returns the sparse audit with inventories. --cells expands selected pairs. --action-report prints reviewed actions.');
    console.log('Use a kind such as concept or story to select the whole kind. Exhibition prompts can be selected as exhibition-prompt.');
    return;
  }
  const audit = await loadAudit();
  const worlds = select(audit.worlds, options.world, 'world');
  const dimensions = select(audit.dimensions, options.dimension, 'dimension');
  const elements = select(audit.elements, options.element, 'element');
  const index = indexPairs(audit.proofs);
  if (options.cells) return expand(worlds, dimensions, elements, index);
  const worldIds = new Set(worlds.map(({ id }) => id));
  const dimIds = new Set(dimensions.map(({ id }) => id));
  const elementIds = new Set(elements.map(({ id }) => id));
  const proofs = audit.proofs.filter((row) => worldIds.has(row.world) && row.dimensions.some((id) => dimIds.has(id))
    && row.elements.some((id) => elementIds.has(id)));
  const crossAreaComparisons = proofs.flatMap((row) => row.comparison ? [{
    objective: row.objective, world: row.world, map: row.map, source: row.source, action: row.action, ...row.comparison,
  }] : []);
  if (options['action-report']) {
    console.log(`${proofs.length} reviewed ${proofs.length === 1 ? 'action' : 'actions'}. Each shown action has its own source and map proof.`);
    for (const row of proofs) {
      console.log(`\n${row.world} · ${row.actionId} · ${row.source}`);
      console.log(row.action);
      if (row.observation) {
        console.log(`Observed optional outcome ${row.observation.flag} (${row.observation.values.join(' or ')}). Prerequisite ${row.objective}.`);
      }
      for (const title of row.titleApplications ?? []) {
        console.log(`${title.session} title ${title.ordinal} · ${title.areaName} · page ${title.page} · ${title.basis}`);
        console.log(`Foil · ${title.foil}`);
        console.log(`Limit · ${title.limit}`);
        console.log(title.source);
      }
      for (const { mode, basis } of row.reasoning ?? []) console.log(`${reasoningModes.get(mode)} · ${basis}`);
      if (row.comparison) {
        for (const { id, method, limit } of row.comparison.areas) console.log(`${id} · ${method} ${limit}`);
        console.log(`${row.comparison.concepts.join(', ')} · ${row.comparison.framework.join(', ')}`);
        console.log(row.comparison.connection);
      }
    }
    return;
  }
  const summary = totalsFor(worlds, dimensions, elements, index);
  const worldSummary = worlds.map((world) => ({ world: world.id, ...totalsFor([world], dimensions, elements, index) }));
  const elementSummary = distinct(elements.map(({ kind }) => kind)).map((kind) => {
    const group = elements.filter((row) => row.kind === kind);
    return { kind, catalogue: countsBy(group, 'status'), ...totalsFor(worlds, dimensions, group, index) };
  });
  if (options.json) {
    const provenCells = [...index].flatMap(([key, actions]) => {
      const [world, dimension, element] = key.split('|');
      return worldIds.has(world) && dimIds.has(dimension) && elementIds.has(element)
        ? [{ world, dimension, element, actions: [...actions], count: actions.size,
          missingToTarget: Math.max(0, TARGET - actions.size), status: actions.size >= TARGET ? 'meets-target' : 'below-target' }] : [];
    });
    console.log(JSON.stringify({
      schema: 2, target: TARGET, summary, worldSummary, elementSummary, limitations, unknownInventories,
      worlds, dimensions, elements, provenCells, proofs, crossAreaComparisons,
      authoredCandidates: audit.candidates.filter((row) => worldIds.has(row.missionWorld) && dimIds.has(row.dimension)
        && row.elements.some((id) => elementIds.has(id))),
      allCandidateNotes: countsBy(audit.candidates, 'note'),
      candidateIssues: audit.candidates.filter(({ note }) => note !== 'needs-action-and-map-review'),
    }, null, 2));
    return;
  }
  console.log(`Target ${TARGET} distinct documented actions for each learning dimension × element in each world.`);
  console.log(`${worlds.length} worlds, ${dimensions.length} dimensions, ${elements.length} elements.`);
  console.log(`${crossAreaComparisons.length} reviewed actions compare two areas using explicit methods and limits.`);
  console.log(`Dimension inventories ${JSON.stringify(countsBy(dimensions, 'kind'))}`);
  console.log(`Catalogue statuses ${JSON.stringify(countsBy(elements, 'status'))}`);
  console.log(JSON.stringify(summary));
  for (const { kind, ...counts } of elementSummary) console.log(`${kind} catalogue ${JSON.stringify(counts)}`);
  for (const { world, ...counts } of worldSummary) console.log(`${world} ${JSON.stringify(counts)}`);
  console.log(`${audit.candidates.length} authored micro-skill candidate rows. Candidate rows provide no automatic pair credit.`);
  for (const limit of limitations) console.log(limit);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
