/** Audit documented intersections of one authored action, one learning dimension and one RPG element. */
import { coatProofs } from './coat-action-evidence.mjs';
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
  {
    objective:'field-loan.press.compared',map:'copies.landing',target:'field-loan.press.bench',
    source:'tests/field-loans.test.ts',anchor:'keeps the %s loan attached to this object, position and receipt',
    action:'Move a particular title, accession, or qualified date up to the left stop. Compare the characters that survive a narrow impression with the whole wording on a folded slip. Moving the type requires another matched pair.',
    reasoning:[{mode:'deductive',basis:'With a fixed count of available type spaces and this starting point, every character outside the opening has to fall off the short slip.'}],
    dimensions:['micro:193','area:HIS','theme:LAN','concept:evidence','concept:interpretation','framework:methods-and-tools'],elements:['game:234','story:29'],
  },
  {
    objective:'field-loan.stage.questioned',map:'stage.foyer',target:'field-loan.stage.bench',
    source:'tests/field-loans.test.ts',anchor:'expect(d.done(loanSite(stop) +',
    action:'Give the usher an identified object, then ask whether a performance of it can warrant a historical claim. The near lamp and the distant bell allow different readers to report what reached them. Edda brings the catalogue limit back to the new staging.',
    comparison:{concepts:['evidence'],framework:['methods-and-tools'],areas:[
      {id:'ART',method:'Make the signal at a chosen beat and position. Attend to which of two seats perceives it.',limit:'A successful cue shows something about access during this staging.'},
      {id:'HIS',method:'Locate the identified object in its own collection record and compare the curator’s limit with the new visual or sounding cue.',limit:'An identification and the limits attached to the surviving object cannot reconstruct every earlier performance or use.'}],
      connection:'A performance can establish who receives a new cue. A historical claim about the object calls for a dated source and an explicit limit.'},
    dimensions:['micro:2','area:ART','area:HIS','concept:evidence','concept:interpretation','framework:methods-and-tools','subject:theatre'],
    elements:['game:21','story:29'],
  },
  {
    objective:'field-loan.dispatch.issued',map:'civic.dispatch',target:'field-loan.dispatch.bench',
    source:'tests/field-loans.test.ts',anchor:'admits all 295 earned objects in exactly two other worlds',
    action:'Hang the identity on the strap and compare it with the limitation inside. Send a public reader through the hatch or keep both lines at a staffed desk. Follow the chosen passage to give a caller a quieter reply or a reliable opening bell.',
    reasoning:[{mode:'pragmatic',basis:'The public slip reaches a waiting caller sooner. The desk can show both parts privately and costs the canal messenger a wait.'}],
    dimensions:['micro:470','area:HUM','theme:POL','concept:responsibility','concept:power','framework:ethics','subject:global-politics'],
    elements:['game:22','story:15'],
  },
  {
    objective:'field-loan.fern.questioned',map:'forest.station',target:'field-loan.fern.bench',
    source:'tests/field-loans.test.ts',anchor:'expect(d.done(loanSite(stop) +',
    action:'Identify a natural or historical specimen and then change the watcher’s question. Pass the dated face and the return face through the wet sleeve and ask what can still be warranted from the surviving strip. The specific catalogue limit stays available.',
    reasoning:[{mode:'causal',basis:'The field model keeps the text fixed while the sleeve, orientation and wax change which lines remain legible.'}],
    dimensions:['micro:2','area:NAT','area:HIS','concept:evidence','framework:methods-and-tools','framework:scope','subject:geography'],
    elements:['game:21','story:29'],
  },
  {
    objective:'birdside.cloth',map:'sea.harbour',target:'birdside.cloth',
    source:'tests/folding-flock.test.ts',anchor:'holds the observation side fixed across the two hours',
    action:'Pin the same ledge for the same westward arrow at first and last light on separate watches. Unfold the rain strip and see how a peg still fixes a position when the observations cannot locate a roost.',
    reasoning:[{mode:'deductive',basis:'Given the model’s stipulated departure at dawn and return at dusk, a westward path places its land endpoint on opposite sides at the two hours.'},{mode:'abductive',basis:'An unrecognised flight in rain provides several possible accounts. The peg records the proposed position without settling which account fits.'}],
    comparison:{concepts:['evidence','certainty'],framework:['scope','methods-and-tools'],areas:[
      {id:'MAT',method:'Hold the arrow and peg fixed, then reverse which endpoint counts as the start of the directed route.',limit:'The geometric relation can identify an endpoint only after the direction and the rule are specified.'},
      {id:'NAT',method:'Check a particular flock at a stated hour. Compare its visible behaviour with the expected outbound or returning pattern.',limit:'The rain watch gives neither species identification nor a coherent direction. An abstract arrow cannot restore that missing observation.'}],
      connection:'The same direction can support different claims about land. A mathematical implication in the paper model requires an observational premise to say anything about the actual birds.'},
    dimensions:['area:NAT','area:MAT','concept:evidence','concept:certainty','framework:scope','framework:methods-and-tools','subject:biology','subject:math-ai'],elements:['game:121','game:234'],
  },
  {
    objective:'birdside.paper',map:'sea.harbour',target:'birdside.folder',
    source:'tests/folding-flock.test.ts',anchor:'checks a printed caption with the learner’s account',
    action:'Try two public voyage dates against Renna’s claim about learning without writing. The dates leave it unresolved. Use Thompson’s account of his pencil to reset the caption.',
    reasoning:[{mode:'deductive',basis:'If a general caption excludes all writing in this lesson, one described use of a pencil in this lesson contradicts it. A voyage date alone cannot answer the claim.'}],
    dimensions:['area:HIS','theme:IND','concept:evidence','concept:culture','framework:scope','framework:perspectives'],elements:['game:108','story:112'],
  },
  {
    objective:'birdside.projection.image',map:'stage.gallery',target:'birdside.projector',
    source:'tests/folding-flock.test.ts',anchor:'opens each of four handovers only with the earned canoe',
    action:'Try a second cutout with the same shadow. Expose the launch place and date or two dated voyages of the same identified canoe, and inspect the particular slide now standing beside the projection.',
    reasoning:[{mode:'analogical',basis:'Two props can agree in silhouette. Matching their visible outlines does not carry the name or the chronology of one object to the other.'}],
    comparison:{concepts:['interpretation','evidence'],framework:['scope','methods-and-tools'],areas:[
      {id:'ART',method:'Frame a silhouette on glass and test a different cutout against the shadow. Choose the details a viewer can take away.',limit:'The silhouette can represent a kind of canoe while leaving the individual hulls indistinguishable.'},
      {id:'HIS',method:'Attach a named launch at a specific place and date or compare two voyage entries for the same vessel.',limit:'The public launch does not identify the navigator in a later year. The voyage record cannot identify every teaching exchange.'}],
      connection:'A spectator can recognise the form while misidentifying the historical vessel. A dated frame makes that particular identification open to checking.'},
    dimensions:['micro:172','area:ART','area:HIS','concept:evidence','concept:interpretation','framework:scope','framework:methods-and-tools','subject:film','subject:history'],elements:['game:108','story:112'],
  },
  {
    objective:'birdside.projection.range',map:'stage.gallery',target:'birdside.projector',
    source:'tests/folding-flock.test.ts',anchor:'opens each of four handovers only with the earned canoe',
    action:'Try the sweeping caption on two different learning histories. Leave the named learner in the programme or leave room for another historian to check a second crew’s teaching roles.',
    reasoning:[{mode:'inductive',basis:'A named teaching case suggests another record worth comparing. It supplies no prevalence estimate for how navigators or their teachers learned.'}],
    dimensions:['micro:136','area:HIS','theme:IND','framework:scope','concept:justification'],elements:['game:22','story:119'],
  },
  {
    objective:'birdside.returned',map:'island.dock',target:'birdside.return',
    source:'tests/folding-flock.test.ts',anchor:'opens each of four handovers only with the earned canoe',
    action:'Equip the named canoe and try the earlier board or lamp from a lower pier. Waiting with a second person opens the Quiet Margin. Trading the lead opens the chalk walk and changes Sora’s account back home.',
    reasoning:[{mode:'pragmatic',basis:'Either handover can make an instruction usable. Test who can reach the cord or read the upper row and who has to wait for the next boat.'}],
    dimensions:['area:HUM','theme:POL','concept:responsibility','concept:values','framework:ethics','subject:design-tech'],elements:['game:22','story:119'],
  },
  {
    objective:'hearing.empty-chair.amended',map:'preserved.archive',target:'agate-vale',
    source:'tests/town-hearings.test.ts',anchor:'retains the two source editions in all eight repairs',
    action:'Bring a market token decision to the family door. Offer a return hook or a witness bell and see how a visitor can enter a place but still have no opportunity to speak.',
    dimensions:['area:HIS','area:HUM','concept:evidence','concept:power','framework:scope','framework:perspectives'],
    elements:['game:180','story:114'],
    reasoning:[{mode:'analogical',basis:'Being issued a ticket differs from being served. The distinction transfers to being admitted and being heard, although the gate and people differ.'}],
    comparison:{concepts:['evidence','power'],framework:['scope','perspectives'],areas:[
      {id:'HIS',method:'Date a visit and identify which part of the bedside account can be corroborated by a second person.',limit:'A family roll cannot establish that a relative witnessed the night.'},
      {id:'HUM',method:'Track the practical effect of an access rule on two visitors with different schedules.',limit:'Counting admissions cannot establish that each visitor got a hearing.'}],
      connection:'Fit a return hook or offer a bell. The visitor who returns can tell the keeper which part of the record needs a second witness.'},
  },
  {
    objective:'hearing.missing-tooth.amended',map:'metalworks.yard',target:'agate-vale',
    source:'tests/town-hearings.test.ts',anchor:'retains the two source editions in all eight repairs',
    action:'Carry the distinction between a bedside key and a witnessed event to a jig. Split delivery provenance from the pull and put a second person in a position to sign or repeat it.',
    dimensions:['area:HIS','area:NAT','concept:justification','concept:certainty','framework:scope','framework:methods-and-tools'],
    elements:['game:267','story:114'],
    reasoning:[{mode:'inductive',basis:'A marked spare that held informs the next inspection. The observation of a single spare does not license a rate for eighteen unseen teeth.'}],
    comparison:{concepts:['justification','certainty'],framework:['scope','methods-and-tools'],areas:[
      {id:'HIS',method:'Trace the distinct stamped ends through the delivery chain, as the dated key is traced to a named visitor.',limit:'A delivery history identifies the part to inspect without establishing its material behaviour.'},
      {id:'NAT',method:'Compare the two teeth on the same pull, then let the late shift examine the setting.',limit:'One spare holding a pull cannot predict whether every tooth in another delivery will hold.'}],
      connection:'Keep the dated tag with its owner and separately sign or repeat the pull. A follow-up can identify what was tested and which setting produced the reading.'},
  },
  {
    objective:'hearing.dropped-verb.amended',map:'copies.press',target:'agate-vale',
    source:'tests/town-hearings.test.ts',anchor:'retains the two source editions in all eight repairs',
    action:'Use the wheel crews’ traced delivery to separate two jobs in a printed sentence. Set the collecting address below the counting docket or compare how two desks read the proof.',
    dimensions:['area:ART','area:NAT','concept:interpretation','concept:explanation','framework:methods-and-tools','framework:perspectives'],
    elements:['game:267','story:114'],
    reasoning:[{mode:'causal',basis:'Changing the subject changes the assignment of the opening phrase on the proof. Returned time slips show whether changing the wording was enough to coordinate a collection.'}],
    comparison:{concepts:['interpretation','explanation'],framework:['methods-and-tools','perspectives'],areas:[
      {id:'NAT',method:'Trace the stamped delivery and test a named tooth at a defined setting before attributing a result to it.',limit:'Co-location in a tray cannot establish common origin or the same mechanical response.'},
      {id:'ART',method:'Move the subject in a printer’s forme and compare two intended readers’ responses to the words.',limit:'A formally clear subject cannot establish that its two readers took the same action.'}],
      connection:'Separately trace counting and collecting through the public proof. A named address helps a runner reach the next desk, and two independent replies can reveal a difference in dates.'},
  },
  {
    objective:'hearing.last-cup.amended',map:'market.square',target:'agate-vale',
    source:'tests/town-hearings.test.ts',anchor:'retains the two source editions in all eight repairs',
    action:'Compare issued and used tickets or invite holders to explain an unused ticket privately. A buyer may leave without giving a reason, leaving the counted gap intact.',
    dimensions:['area:MAT','area:HUM','concept:objectivity','concept:values','framework:scope','framework:ethics'],
    elements:['game:180','story:114'],
    reasoning:[{mode:'abductive',basis:'An unused ticket is compatible with a ferry shift and several other causes. An account can distinguish a particular case, while a refusal keeps the cause open.'},
      {mode:'pragmatic',basis:'Separate strings show where to look without identifying buyers. A voluntary private account can reveal a particular obstacle but cannot describe people who declined.'}],
    comparison:{concepts:['objectivity','values'],framework:['scope','ethics'],areas:[
      {id:'MAT',method:'Compare the extra coin to four and ten, and distinguish counts of issued and used tickets.',limit:'Ratios require a named denominator. A difference in the totals carries no explanation of its cause.'},
      {id:'HUM',method:'Compare the two workers’ schedules and seek a voluntary account of an unused ticket.',limit:'Privacy and the people who return limit the group about whom any explanation can be made.'}],
      connection:'Two counting strings preserve the gap. At the quiet desk an individual can help explain one case or decline with their ticket intact.'},
  },
  ...coatProofs,
  {
    objective:'whistle.fern.sent',map:'forest.station',target:'whistle.fern.table',
    source:'tests/whistle-watch.test.ts',anchor:'keeps two signatures with their own impressions',
    action:'Overlay the bank tracing and the turned heel. Each person can sign only the impression their own work establishes. The local hands may retain both slips or invite a visitor to compare them at the original tray.',
    reasoning:[{mode:'abductive',basis:'The turned heel fits the square interruption in the fan. Two overlapping impressions explain the apparent extra foot, without identifying the unseen animal or the time of passage.'}],
    dimensions:['micro:15','concept:evidence','framework:scope','subject:biology','area:NAT'],elements:['game:267','story:29'],
  },
  {
    objective:'whistle.stage.sent',map:'stage.rehearsal',target:'whistle.stage.table',
    source:'tests/whistle-watch.test.ts',anchor:'tests open, listener-covered and both-names-covered reports',
    action:'Return reviews under all three name covers. At a fixed cover listen from both seats. The back panel changes the audible result while the review arrangement changes who can ask whom about it.',
    comparison:{concepts:['objectivity','perspective'],framework:['methods-and-tools','perspectives'],
      areas:[{id:'ART',method:'Keep the two-note warning fixed and listen to the front and back of the rehearsal room. Read the heard timing back to the performer.',limit:'A prompt book establishes the two intended attacks. It cannot tell a performer whether the back row could hear the second.'},
        {id:'HUM',method:'Vary which participant identities are shown on the reviewing slip. Retain each listener’s seat so accounts under different arrangements can be interpreted.',limit:'Hiding a written name changes access to provenance but can still identify the sole occupant of a particular seat. Two listeners cannot measure the prevalence of bias.'}],
      connection:'A published review can protect a name while explaining the acoustic difference. Keeping the seat can help a repair technician and can also make the listener recognisable.'},
    dimensions:['micro:544','concept:objectivity','concept:perspective','framework:methods-and-tools','framework:perspectives','area:ART','area:HUM','subject:music','subject:psychology'],elements:['game:234'],
  },
  {
    objective:'whistle.island.recalled',map:'island.workshop',target:'whistle.island.table',
    source:'tests/whistle-watch.test.ts',anchor:'recalls a printed ferry route',
    action:'Fold the local nesting record under the public ferry sheet and test both frames. When the community withdraws the circulating route, sound the recall. The ferry shortcut closes and an in-person route remains.',
    reasoning:[{mode:'pragmatic',basis:'A visitor can still reach a custodian after a copy is withdrawn. The two audience arrangements solve different access problems without assuming permission travels with cartographic precision.'}],
    dimensions:['micro:825','concept:responsibility','framework:ethics','subject:geography','theme:IND'],elements:['game:234','story:15'],
  },
  {
    objective:'vault-work.twogates.left',map:'aethelgard.undercroft',target:'seal-twogates',
    source:'tests/vault-work.test.ts',anchor:'leaves any of eight arrangements',
    action:'Record both states of the shared chain. Lift its link, move one shutter independently, and entrust the actual resulting admission arrangement to a visitor or the porter.',
    reasoning:[{mode:'deductive',basis:'A mixed arrangement supplies a counterexample to the claim that all three callers must pass together or all wait.'}],
    dimensions:['micro:96','concept:power','framework:scope','subject:global-politics'],elements:['game:234'],
  },
  {
    objective:'vault-work.chosen.left',map:'aethelgard.undercroft',target:'seal-chosen',
    source:'tests/vault-work.test.ts',anchor:'requires the unselected run of nights',
    action:'Move a frame away from the three dry tabs. It uncovers an overtopped board and a torn gauge reading at specified dates. The ferry crew receives the book or a list of the omissions.',
    reasoning:[{mode:'inductive',basis:'Three selected dry crossings make the general claim look strong. A wet night counters the generalisation, and the torn leaf reduces the basis for a numerical estimate.'}],
    dimensions:['micro:302','concept:evidence','framework:methods-and-tools','subject:history'],elements:['game:267'],
  },
  {
    objective:'vault-work.promise.left',map:'aethelgard.undercroft',target:'archivist',
    source:'tests/vault-work.test.ts',anchor:'gives each chair a fair hearing',
    action:'Unfold the conditions on Elsbet’s sentence and hear what each person fears from the other chair. The two readings change who gets a seat and who carries the lamp to the morning watch.',
    dimensions:['micro:113','concept:perspective','framework:ethics','subject:theatre'],elements:['story:95'],
  },
  {
    objective:'weir-lamp.to',map:'water.gatehouse',target:'weir-lamp-table',
    source:'tests/vault-work.test.ts',anchor:'lets a returning keeper use a legacy lamp',
    action:'Overlay the dry-year folder and the later inquiry. Find where the red pencil crosses the fold between dates, then let the watch or the families carry that limitation into the hearing.',
    dimensions:['micro:1069','concept:interpretation','framework:methods-and-tools','subject:history'],elements:['game:267'],
  },
  {
    objective:'weir-lamp.compared-first-peg',map:'water.gatehouse',target:'weir-lamp-table',
    source:'tests/vault-work.test.ts',anchor:'carries the earlier forecast to both possible council recipients',
    action:'Compare the preserved personal expectation made before the crossing leaves were opened with the red line drawn on the inquiry after the flood. Retain the two different ways of dating a judgement for the hearing.',
    comparison:{concepts:['certainty','interpretation'],framework:['methods-and-tools','scope'],
      areas:[{id:'HUM',method:'Record the player’s forecast in advance, reveal both outcomes, then record a new forecast while retaining the first.',limit:'This individual pair of predictions can expose a change for this watcher. It cannot establish a general psychological effect.'},
        {id:'HIS',method:'Establish the relative dates of the watch’s question and the inquiry’s pencil from their placement on two dated sheets.',limit:'The later annotation dates the reader’s hindsight. Its presence cannot show who read the earlier question at the time.'}],
      connection:'Each method restricts what can be attributed to an earlier knower. The recipient sees which information existed before the reveal and what was supplied after.'},
    dimensions:['concept:certainty','concept:interpretation','framework:methods-and-tools','framework:scope','area:HUM','area:HIS','subject:psychology','subject:history'],elements:['game:267'],
  },
  {
    objective: 'mill-shift.nile.compared', map: 'night-register.nile', target: 'mill-shift.nile',
    source: 'tests/mill-shift.test.ts', anchor: 'reaches every conserved division of six counters',
    action: 'Refill the same three bowls from the gate book and the signed piece book. The porter worked three bells and carries no stamp.',
    reasoning: [{mode:'pragmatic',basis:'Giving time or stamped output standing affects who can pay for breakfast. Each split still spends the same six counters.'}],
    dimensions: ['concept:power','concept:values','concept:evidence','framework:perspectives','framework:ethics','area:HUM','area:HIS'],
    elements:['game:234','story:72'],
  },
  {
    objective:'mill-shift.yard.joint',map:'night-register.yard',target:'mill-shift.yard',
    source:'tests/mill-shift.test.ts',anchor:'keeps all sixteen punch strips independent under all four rigs',
    action:'Keep four moves on the strip. Try each wheel alone and with a porter. On feed, turn, turn, turn, the notches rise from three to six only if both settings change.',
    reasoning:[{mode:'deductive',basis:'A lone worker starts the three turns with three blanks. The single tooth can cut at most one per turn. Six cuts therefore require both extra feed and two teeth for this four-bell strip.'}],
    dimensions:['micro:93','concept:explanation','concept:evidence','framework:methods-and-tools','area:MAT','subject:design-tech'],
    elements:['game:234','story:91'],
  },
  {
    objective:'mill-shift.press.estimate',map:'night-register.press',target:'mill-shift.press',
    source:'tests/mill-shift.test.ts',anchor:'puts two equally fitting estimates beside a held-out reconstruction',
    action:'Tie the four dated tickets by wheel, then rota. Compare the two estimates for a configuration absent from both sets of shifts against a personally tested four-bell strip.',
    reasoning:[{mode:'inductive',basis:'The old group means are three and six. Their agreement on the observed shifts permits competing estimates for the unobserved crew and tool pairing.'},
      {mode:'causal',basis:'The guild admitted a porter on the same date that an apprentice fitted the second tooth. Changing the pair in the working model tests separate effects under its rules.'}],
    comparison:{
      concepts:['interpretation','justification'], framework:['scope','methods-and-tools'],
      areas:[{id:'HUM',method:'Use the observed output of the four paid shifts to estimate output for two new staffing and technology combinations.',limit:'Both grouping rules recover the same old averages. Neither supplies an independent historical change in staffing.'},
        {id:'HIS',method:'Read the dated guild decision and the apprentice’s fitting beside the pay register to establish when the changes were admitted.',limit:'The signed papers date both changes together. They supply neither the unrun shift nor all the people whose work was unstamped.'}],
      connection:'Publish a dated statement, a conditional reconstruction or a future proposal. The printed copy distinguishes the counted history from the Guardian’s newly made strip.'},
    dimensions:['micro:1127','concept:interpretation','concept:justification','area:HIS','area:HUM','framework:scope','framework:methods-and-tools','subject:economics','subject:history'],
    elements:['game:234','story:91'],
  },
  {
    objective:'mill-shift.press.edited-moods',map:'night-register.press',target:'mill-shift.press',
    source:'tests/mill-shift.test.ts',anchor:'puts two equally fitting estimates beside a held-out reconstruction',
    action:'Print a missed possibility and an open future in separate editions. The workers keep the version they opened before a later edition is sent.',
    dimensions:['micro:689','subject:lang-langlit','concept:interpretation','framework:scope'],elements:['game:234','story:15'],
  },
  {
    objective: 'maker.rain-gauge.compared-bounds', map: 'aethelgard.emberford', target: 'reading-rain',
    source: 'tests/maker-field.test.ts', anchor: 'puts two independent edges on the same field slip',
    action: 'Shade the catch and the calibration ring separately. Retain both margins on the slip for the bridge watch and reopen the one-limit edition.',
    reasoning: [{mode:'deductive',basis:'Given two possible errors bounded by half a millimetre, the central value of nine can differ by up to one in either direction. The range makes no probability claim about the next flood.'}],
    dimensions: ['micro:621','concept:certainty','framework:methods-and-tools','question:KQ-ROUTE-08'],elements: ['game:234'],
  },
  {
    objective: 'maker.plumb-line.compared-bounds', map: 'aethelgard.emberford', target: 'reading-tower',
    source: 'tests/maker-field.test.ts', anchor: 'puts two independent edges on the same field slip',
    action: 'Set the present line against the notch beneath Maren’s grandmother’s button. Open both edge margins and deliver the allowable change to the morning shift.',
    reasoning: [{mode:'deductive',basis:'Two agreeing centre readings with a half-width error on each can hide one finger-width of change in either direction.'}],
    dimensions: ['micro:621','concept:certainty','framework:methods-and-tools','question:KQ-ROUTE-08'],elements: ['game:234'],
  },
  {
    objective: 'maker.reed-pen.recipient', map: 'aethelgard.emberford', target: 'reading-flood',
    source: 'tests/maker-field.test.ts', anchor: 'works at each mounting on both reference orders',
    action: 'Take the surviving strokes from the worn post and hear Venn place his father’s entry beside them. Pass on the gap or mount the signed recollection alongside it. The two versions have different readers.',
    dimensions:['concept:evidence','concept:interpretation','framework:perspectives','question:KQ-ROUTE-07'],elements:['game:234'],
  },
  {
    objective: 'night-register.archive.caption', map: 'night-register.archive', target: 'night-case-26807',
    source: 'tests/night-register.test.ts', anchor: 'expect(missingCaption(d.s, w.site)).toBe(w)',
    action: 'Follow the pencil marks to the mount of Ruth M. Barnes’s Needle Book. A neighbouring case does not fit. Match the accession before deciding whether the label travels on the sleeve or stays where another reader can find it.',
    dimensions: ['micro:1003', 'concept:evidence', 'framework:methods-and-tools'], elements: ['game:267', 'story:48'],
  },
  {
    objective: 'night-register.nile.memory-folders', map: 'night-register.nile', target: 'night-register.nile.desk',
    source: 'tests/night-register.test.ts', anchor: "expect(traceMemory(d.s, dest, 'home')).toContain(a.replies[1])",
    action: 'Hear what Imani did with a reading, unseal the edition Button carried, then consult the revised desk in the Archive. Dates, witnesses and recipients explain how the original handover and the later account can both be accurate.',
    dimensions: ['micro:1115', 'concept:interpretation', 'framework:perspectives'], elements: ['game:158', 'story:15'],
    reasoning: [{ mode: 'abductive', basis: 'The courier version still records the low reading frame after the Archive starts sending copies upstairs. A later change at the desk explains the discrepancy while preserving what the two witnesses actually received.' }],
  },
  {
    objective: 'night.work.20806', map: 'night-register.gate', target: 'night-case-20806',
    source: 'tools/night-register-journey.mjs', anchor: "panel.getByText('Both frames open together here.'",
    action: 'Bring Button to Dana Bartlett’s Water Barrel or Runlet. Use the same edge tool as for the Needle Book and leave a reading. Open the pair together at the perch to examine what the shared classification leaves out about materials and makers.',
    dimensions: ['concept:interpretation', 'framework:methods-and-tools', 'subject:visual-arts'], elements: ['game:20', 'story:31'],
    reasoning: [{ mode: 'analogical', basis: 'Apply the same crop to a second drawing in the shared classification. Compare each with its own whole frame and medium before carrying a claim from one drawing to the other.' }],
  },
  ...nexusEvidenceInvestigations,
  ...emberfordEvidenceInvestigations,
  ...copiesEvidenceInvestigations,
  {
    objective: 'ink.q41585.landed', map: 'nexus.archive', target: 'ink-post.archive',
    source: 'tests/ink-post.test.ts', anchor: "Play out a short proof on the tiles",
    action: "Play out a short proof on the tiles. A spectator can check each move. The line settles one claim about these rules.",
    reasoning: [{ mode: 'deductive', basis: "The spectator can check each legal move against the displayed rules. Changing an initial rule requires a fresh argument for the conclusion." }],
    dimensions: ["concept:certainty", "concept:justification", "micro:261"], elements: ['game:21', 'story:114'],
  },
  {
    objective: 'ink.q83163.landed', map: 'nile.hall', target: 'ink-post.nile',
    source: 'tests/ink-post.test.ts', anchor: "Stitch in a small worked case",
    action: "Stitch in a small worked case. The finder can check the first few terms before deciding whether to chase the rest.",
    reasoning: [{ mode: 'inductive', basis: "The finder checks the pattern against early terms and decides whether to pursue the rest. Agreement in that finite sample leaves later terms open." }],
    dimensions: ["concept:certainty", "concept:justification", "micro:263"], elements: ['game:21', 'story:114'],
  },
  {
    objective: 'ink.q381783.landed', map: 'stage.rehearsal', target: 'ink-post.stage',
    source: 'tests/ink-post.test.ts', anchor: "Map ash against paths and walls",
    action: "Map ash against paths and walls. One patch lies in a walking lane. That gives the crew a second explanation to examine.",
    reasoning: [{ mode: 'abductive', basis: "The location of ash in a walking lane makes another cause plausible. Its position alone cannot distinguish a hearth from redistributed ash." }],
    dimensions: ["concept:explanation", "concept:evidence", "micro:270"], elements: ['game:21', 'story:114'],
  },
  {
    objective: 'ink.q7967775.landed', map: 'island.workshop', target: 'ink-post.island',
    source: 'tests/ink-post.test.ts', anchor: "Let the child move the ball's shadow",
    action: "Let the child move the ball's shadow. The little eclipse crosses the table. It explains the alignment while leaving real distances open.",
    reasoning: [{ mode: 'causal', basis: "Moving the ball in the lamp model moves the shadow. The resulting local eclipse explains alignment, with the real distances still unknown." }],
    comparison: {
      areas: [
        { id: "NAT", method: "Move a ball relative to a lamp and watch the shadow change.", limit: "The lamp and table do not reproduce astronomical scale." },
        { id: "MAT", method: "Compare the alignment of the observer, light and ball from two positions.", limit: "An alignment diagram alone gives no distance to the actual bodies." },
      ], concepts: ["explanation"], framework: ["methods-and-tools"],
      connection: "Use the geometry to locate an illuminated observer, then use the model to test what that position would see.",
    },
    dimensions: ["concept:perspective", "concept:explanation", "micro:503", "area:NAT", "area:MAT", "framework:methods-and-tools"], elements: ['game:21', 'story:114'],
  },
  {
    objective: 'ink.q7259.landed', map: 'council.hall', target: 'ink-post.council',
    source: 'tests/ink-post.test.ts', anchor: "Thread the same pattern through a music roll",
    action: "Thread the same pattern through a music roll. The mechanism repeats the arrangement as sound. It needs a musician to assign the pitches.",
    reasoning: [{ mode: 'analogical', basis: "The weaver transfers an ordered repeat to a score. The arrangement survives the transfer. Pitch requires a new convention supplied by the musician." }],
    comparison: {
      areas: [
        { id: "MAT", method: "Track the repeat when the same ordered pattern drives a different mechanism.", limit: "An ordering alone assigns no pitches." },
        { id: "ART", method: "Give the marks musical intervals and listen for the repeated arrangement.", limit: "The chosen encoding belongs to this rendering and leaves other scores possible." },
      ], concepts: ["interpretation"], framework: ["scope"],
      connection: "The arrangement can travel from one medium to the other. Its musical meaning depends on a mapping that the loom cannot supply.",
    },
    dimensions: ["concept:interpretation", "concept:explanation", "micro:874", "area:MAT", "area:ART", "framework:scope"], elements: ['game:21', 'story:114'],
  },
  {
    objective: 'ink.q153761.landed', map: 'forest.station', target: 'ink-post.fern',
    source: 'tests/ink-post.test.ts', anchor: "Give each shift a seal for repairs",
    action: "Give each shift a seal for repairs. The clerk can see who noticed a leak. A visitor working between shifts needs somebody to vouch for her.",
    reasoning: [{ mode: 'pragmatic', basis: "A shift seal makes repairs traceable. A worker between shifts still needs a neighbour to vouch for her. The practical cost puts a limit on this way of distributing responsibility." }],
    dimensions: ["concept:responsibility", "concept:values", "micro:233"], elements: ['game:21', 'story:114'],
  },
  {
    objective: 'first-clap.measure', map: 'stage.gallery', target: 'first-clap-seated',
    source: 'tests/first-clap.test.ts', anchor: "use(d, 'seated', 'Stand up')",
    action: 'Lower the gallery seat under your weight and stand up again. The clap follows the change in the seat, even with your hands still. The mechanism cannot identify who attended the childhood performance.',
    reasoning: [{ mode: 'causal', basis: 'Changing the load on the board reproduces the clap. The result explains a possible sound source under these conditions.' }],
    dimensions: ['area:NAT', 'concept:evidence', 'framework:methods-and-tools', 'subject:physics', 'micro:611'],
    elements: ['game:267', 'story:77'],
  },
  {
    objective: 'underpan.separate', map: 'market.underpan', target: 'underpan-wall',
    source: 'tests/underpan.test.ts', anchor: "expect(d.done('underpan.separate')).toBe(clue === 'wall')",
    action: 'Turn the lamp, go around the divider and mark the separated receipt, nail and moving shadow. The change explains part of the image. It cannot identify who set the price.',
    reasoning: [{ mode: 'causal', basis: 'Changing the angle alters the overlap. The remaining moving outline gives Fen grounds to leave one source open.' }],
    dimensions: ['area:NAT', 'concept:explanation', 'framework:scope', 'micro:411'], elements: ['game:267', 'story:48'],
  },
  {
    objective: 'underpan.account', map: 'market.underpan', target: 'fen-clove',
    source: 'tests/underpan.test.ts', anchor: "expect(homes).toEqual([watch === 'lamps' ? 'market.square' : cellar])",
    action: 'After investigating the shadow or receipts, choose a public demonstration or private reading. Return to find Fen and hear whom her arrangement allows her to help.',
    reasoning: [{ mode: 'pragmatic', basis: 'A public demonstration can rebut blame while exposing a customer. A private reading lets a family check its claim but leaves an accusation unanswered in the square.' }],
    dimensions: ['area:HUM', 'concept:responsibility', 'framework:ethics'], elements: ['game:253', 'story:106'],
  },
  {
    objective: 'spare-moon.keep-watch', map: 'nexus.spare-moon', target: 'moon-offer-bell',
    source: 'tests/spare-moon.test.ts', anchor: "expect(d.s.journal).toContain('j.spare-moon.' + night)",
    action: 'Take Ket’s watch and ring, pass a private cord or make a bed. The next guest can now find help in a particular way while another guest is left waiting.',
    reasoning: [{ mode: 'pragmatic', basis: 'Making the inn visible helps a stranger who lacks an introduction. A private signal helps someone unwilling to make a public request. A prepared bed has a limit of one.' }],
    dimensions: ['area:HUM', 'concept:responsibility', 'framework:ethics'], elements: ['game:253', 'story:106'],
  },
  {
    objective: 'tail.metal', map: 'metalworks.yard', target: 'blue-tail-metal',
    source: 'tests/blue-tail.test.ts', anchor: 'distinguishes causal tests from hypotheses about an earlier event',
    action: 'Pull the same practice strip through the shallow and deep slots. The shallow slot catches the doubled seam. The older tear remains evidence about a separate event.',
    reasoning: [{ mode: 'causal', basis: 'The same strip and pull give different results only when the slot depth changes. The trial supports the cause of the new tear under those conditions.' }],
    dimensions: ['area:NAT', 'concept:explanation', 'framework:methods-and-tools'], elements: ['game:267'],
  },
  {
    objective: 'tail.copies', map: 'copies.press', target: 'blue-tail-copies',
    source: 'tests/blue-tail.test.ts', anchor: 'stitches on the runner’s later fold',
    action: 'Use the original strip to align the printed tear, then clip the later runner’s proof beside it with the stitched name sleeve closed.',
    reasoning: [{ mode: 'abductive', basis: 'A likely printing mechanism explains the torn edge shared by the original and copy. The dated later stitches explain why another line is held. The missing line cannot assign authorship.' }],
    dimensions: ['area:HIS', 'concept:evidence', 'concept:explanation', 'framework:scope'], elements: ['game:267'],
  },
  {
    objective: 'tail.decision', map: 'council.gallery', target: 'blue-tail-council',
    source: 'tests/blue-tail.test.ts', anchor: 'before a different final %s, via %s',
    action: 'Align dispatch B17, hear either the printer’s comparison or Rook’s signed account, preserve the witness’s permission, then place the approved warning on a public rail or a staffed desk.',
    reasoning: [{ mode: 'pragmatic', basis: 'The public route remains available after a shift. A staffed hand-off lets somebody ask a question and produces a new return check within its staffed time.' }],
    comparison: {
      concepts: ['justification', 'responsibility'], framework: ['scope', 'ethics'],
      areas: [
        { id: 'HIS', method: 'Match the counterfoil’s forked tear and its number to the surviving strip. Keep the checked dispatch field separate from the empty return field.',
          limit: 'The matched documents identify an instruction and a dispatch. They do not settle an arrival.' },
        { id: 'HUM', method: 'Carry the participant’s authorized account and check how the end receiver can use it. Keep the tied sleeve private and compare the service costs of each receiver.',
          limit: 'One consenting witness and one receiving exchange provide situated accounts. They do not establish who every visitor can reach.' },
      ],
      connection: 'Use only the matched record’s warranted fields and the words the witness allows to guide the next receiver. A new arrival belongs to its own shift.',
    },
    dimensions: ['area:HIS', 'area:HUM', 'concept:justification', 'concept:responsibility', 'framework:ethics', 'framework:scope'], elements: ['game:267', 'story:114'],
  },
  {
    objective: 'forest.hands.context', map: 'forest.station', target: 'forest-hands-board',
    source: 'tests/observation-sheet.test.ts', anchor: "expect(d.done('forest.hands.context')).toBe(true)",
    action: 'Keep the old two-mark observation when the moved bench permits three. At the recording frame, attach the 1960 Gombe observation and the later team account to distinct tabs.',
    comparison: {
      concepts: ['evidence', 'perspective'], framework: ['scope', 'perspectives'],
      areas: [
        { id: 'NAT', method: 'Repeat the same three-mark watch from the moved recorder seat. Keep the original strip that identifies the copied mark.',
          limit: 'A fuller view on the second run cannot supply a firsthand observation from the first seat.' },
        { id: 'HIS', method: 'Separate the dated tool-use observation attributed to Jane Goodall from the later account naming Baraka Daniel on a particular datasheet.',
          limit: 'The dates and attributions concern separate acts. The fictional practice run supplies no new historical testimony.' },
      ],
      connection: 'Use the source and position of each record to decide what Ayla can attribute to the observer and the recorder on her next-watch sheet.',
    },
    dimensions: ['area:NAT', 'area:HIS', 'concept:evidence', 'concept:perspective', 'framework:scope', 'framework:perspectives'],
    elements: ['game:267'],
  },
  {
    objective: 'stage.hands.compare', map: 'stage.gallery', target: 'stage-hands-floor',
    source: 'tests/observation-sheet.test.ts', anchor: "expect(d.done('stage.hands.compare')).toBe(true)",
    action: 'Bring the notebook earned after the Forest watch. Give the knocks from the screened wing, then follow the low pin from the gallery before assigning the next confirmation.',
    reasoning: [{ mode: 'analogical', basis: 'Transfer the distinction between a firsthand and a copied Forest mark to the stage. Giving a cue and seeing its effect require separate evidence from the two positions.' }],
    dimensions: ['concept:perspective', 'concept:evidence', 'framework:scope'],
    elements: ['game:267'],
  },
  {
    objective: 'preserved.scale.compare', map: 'preserved.royal', target: 'preserved-scale-board',
    source: 'tests/preserved-scale.test.ts', anchor: 'opens a checked %s handover after a recoverable draft',
    action: 'Follow burial, cache and catalogue entries. From a common zero walk the two practice distances before giving the next carrier or file reader the appropriate record.',
    comparison: {
      concepts: ['evidence', 'justification'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'MAT', method: 'Measure two paving strips and six from the same bracket. Compare the physical lengths with the equal intervals in a drawing.',
          limit: 'Only the distances between these practice pegs have been measured.' },
        { id: 'HIS', method: 'Follow the custody entries from KV 7 to the later cache and the catalogue. Keep their sequence when making a file slip.',
          limit: 'The order in this file gives neither the distance traveled nor the scale of the arrows.' },
      ],
      connection: 'Decide what “next” lets a carrier do at the practice bench and what it lets a later reader say about the custody record.',
    },
    dimensions: ['area:MAT', 'area:HIS', 'concept:evidence', 'concept:justification', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:267'],
  },
  {
    objective: 'pigment-sample.reconciled', map: 'aethelgard.emberford', target: 'pigment-sample.bench',
    source: 'tests/pigment-sample.test.ts', anchor: "expect(d.done(prefix + 'reconciled')).toBe(true)",
    action: 'Distinguish the borrowed W27 from the consented R13 swatch. Retain the last R13 edge for another viewing or give it up for the workshop report. Correct the shared heading and follow the reader to the result.',
    comparison: {
      concepts: ['evidence', 'responsibility'], framework: ['scope', 'ethics'],
      areas: [
        { id: 'ART', method: 'Use the glass window to view the older loan and compare the notches on the separate workshop swatch. Preserve or document what the next viewer can inspect.',
          limit: 'The appearance of either object gives no chemical identification of its colourants.' },
        { id: 'NAT', method: 'Check the specific sample number on the analysis record. The report route has a material result and an empty wrapper. On the intact route the report stays blank.',
          limit: 'A result from R13 cannot establish the material of W27. Once the workshop consumes R13, a later visitor cannot repeat the edge check on it.' },
      ],
      connection: 'Decide which future inquiry the workshop will support, then check the reader uses the right object number on each caption.',
    },
    dimensions: ['micro:911', 'area:ART', 'area:NAT', 'concept:evidence', 'concept:responsibility', 'framework:scope', 'framework:ethics'],
    elements: ['game:267'],
  },
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
    objective: 'metal.tag.explained', map: 'metalworks.records', target: 'metal-tag-explanation-clips',
    source: 'tests/metalworks-side.test.ts', anchor: 'publishes both hole traces and workshop keys',
    action: 'Reverse the triangle by turning the old tag and by fitting a fresh tag on the same cord. Check the trip note and both workshop keys before leaving the explanations at the yard or the Hall index.',
    reasoning: [{ mode: 'abductive', basis: 'Both candidate explanations reproduce the changed direction and unchanged colour. A nicked hole distinguishes turning from replacement on the stand. The trip note leaves that field blank, so it cannot settle which explanation fits the trip.' }],
    comparison: {
      concepts: ['evidence', 'explanation'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'NAT', method: 'Hold the stand and cord fixed. Turn the existing practice tag, then repeat with a fresh tag and compare the edge of each hole.',
          limit: 'The replica demonstrates two possible mechanisms. It cannot establish which one occurred on the earlier trip.' },
        { id: 'HIS', method: 'Read the earlier trip note for the reported direction and colour, then read each workshop’s key to learn what a triangle meant at that stage.',
          limit: 'The shop keys explain the local conventions. The trip note records appearance and leaves no sketch of the hole to distinguish the proposed events.' },
      ],
      connection: 'Leave both runs with the two shop keys and the limited trip entry. The yard offers a hands-on comparison. The Hall copy preserves the separate accounts beside its index.',
    },
    dimensions: ['area:NAT', 'area:HIS', 'concept:evidence', 'concept:explanation', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:267'],
  },
  {
    objective: 'metal.rim.compare', map: 'metalworks.records', target: 'metal-rim-compare',
    source: 'tests/metal-rim.test.ts', anchor: 'requires the dated entry and the runs, then personally lays both sources on the stand',
    action: 'Compare the same blue sample after an unsupported slip and two supported runs. Clip the earlier dated grey-sample docket beside those runs before opening a receiving station.',
    reasoning: [{ mode: 'causal', basis: 'The blue sample and starting and stopping marks stay fixed. The unsupported sample crosses the rim. The peg and sleeve each keep it inside on the practice rack.' }],
    comparison: {
      concepts: ['evidence', 'explanation'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'NAT', method: 'Pull the same tray and blue sample between the chalk marks, first loose and then with each support. Observe whether the sample crosses the inside edge.',
          limit: 'The change in outcome applies to this sample and these simulated runs. A different load or receiving arrangement needs its own check.' },
        { id: 'HIS', method: 'Lift the undated caption and date the underlying grey-sample entry. Check which bench and crew arrangement it actually records.',
          limit: 'The docket supports a staffed Hall sleeve check in that shift. Its blank yard line leaves the caption’s claim about both benches unsupported.' },
      ],
      connection: 'Clip the prior test beside the new runs under its own date. Then either seat the first small tray behind Corra’s yard peg or release the wide tray at Bea’s staffed cradle.',
    },
    dimensions: ['area:NAT', 'area:HIS', 'concept:evidence', 'concept:explanation', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:195'],
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
    objective: 'forest.finish', map: 'forest.community', target: 'forest-steward',
    source: 'tests/living-forest.test.ts', anchor: 'compares lookout counts and crew accounts before its correction',
    action: 'Compare the two timed lookout counts with the bridge crews’ hearing accounts, choose what to tell visitors, then take a return watch at each lookout and correct the notice.',
    reasoning: [{ mode: 'inductive', basis: 'The ridge records more crossings early and the creek more late. The return pair records two crossings at each lookout, with one hidden creek beat. These samples support a local pattern while leaving wider behavior and hidden crossings open.' }],
    comparison: {
      concepts: ['evidence', 'perspective'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'NAT', method: 'Count crossings in three beats from each lookout at early, late and return watches. Record the blocked return beat as a gap.',
          limit: 'These counts describe the crossings visible in these watches. Equal observed totals cannot establish equal views or wider bird numbers.' },
        { id: 'HUM', method: 'Read the distinct crews’ hearing accounts in the route book and keep their work location and shift attached. Choose how to set those accounts beside the lookout counts.',
          limit: 'The reports describe what people heard on their routes. They use no shared visual count and leave the sources of the sounds uncertain.' },
      ],
      connection: 'Use the work accounts and observed crossings to choose a small-group creek stop or a bridge briefing. Add the hidden beat to that public response after testing both lookouts again.',
    },
    dimensions: ['area:NAT', 'area:HUM', 'concept:evidence', 'concept:perspective', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:267'],
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
    objective: 'boundary.civic.post', map: 'civic.steps', target: 'boundary-civic-post',
    source: 'tests/service-boundary.test.ts', anchor: 'sends a different first delivery while retaining the other five',
    action: 'Group the same nine recorded waits by the dated ditch and by the crew’s current footbridge route. Send the four-place cart to the selected bank and keep the other five requests visible.',
    reasoning: [{ mode: 'pragmatic', basis: 'Choose whether the first order follows the established docket or the crew’s current turn. Those two feasible rules give the remaining fourth place to different people while each leaves five requests pending.' }],
    comparison: {
      concepts: ['evidence', 'values'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'MAT', method: 'Change only the dividing line, recompute each group’s mean and compare which group has the longer mean wait. Check the four longest waits that the chosen group can send.',
          limit: 'The change in priority comes from regrouping the same nine waits, with no change to what any person waited. The mean cannot choose the service boundary.' },
        { id: 'HUM', method: 'Use the nine requests at their recorded waiting locations and Lin’s account of the crew’s new turn at the repaired footbridge. Check who is served by the dated and current routes under the same capacity.',
          limit: 'These shift records and receipts describe one service decision. They cannot show that either route is fair for all users or performs better across shifts.' },
      ],
      connection: 'The plotted requests and crew practice both inform the signed first-cart order. The Water Commons receives a different fourth stop under each route and keeps a named record of those still waiting.',
    },
    dimensions: ['area:MAT', 'area:HUM', 'concept:evidence', 'concept:values', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:271'],
  },
  {
    objective:'night-watch.gate.handover', map:'water.gatehouse', target:'lamplight.gate.bench',
    source:'tests/lamplight.test.ts', anchor:'3 dry-night calls and 0 missed',
    action:'Move the bell clip across the same six nights and weigh missed floods against unnecessary calls before choosing who bears the cost of tonight’s watch.',
    dimensions:['micro:1061','micro:1083','concept:evidence','concept:responsibility','framework:ethics','area:MAT'],
    elements:['game:234'], reasoning:[{mode:'pragmatic',basis:'Each threshold changes who loses sleep and who must watch the steps. The decision uses these costs.'}],
  },
  {
    objective:'night-watch.dispatch.handover', map:'civic.dispatch', target:'lamplight.dispatch.bench',
    source:'tests/lamplight.test.ts', anchor:'4 of 6 households',
    action:'Stretch the cord across the four replies and again across all six addresses. Decide who goes to the two unconfirmed doors.',
    dimensions:['micro:1092','concept:certainty','concept:evidence','framework:scope','area:MAT'],
    elements:['game:234'], reasoning:[{mode:'deductive',basis:'Four responses establish at most four confirmed households. Two households remain unconfirmed under either staffing choice.'}],
  },
  {
    objective: 'survey.o1.report', map: 'aethelgard.emberford', target: 'survey-box',
    source: 'tests/survey.test.ts', anchor: "wording: 'plain', sample: 'houses'",
    action: 'Run Venn’s plain wording along the household route. Inspect who answered, then send the results to a second hearing, the west bank, a public route or a reading of both questions.',
    dimensions: ['micro:1015', 'concept:evidence', 'framework:scope', 'area:HUM'], elements: ['game:114'],
  },
  {
    objective: 'ferry.o1.send', map: 'aethelgard.emberford', target: 'ferry-slate',
    source: 'tests/translate.test.ts', anchor: 'picks: [1, 1, 1, 1]',
    action: 'Use the limited space on Sefa’s slate to preserve who must bring the ropes, the slow rise, who can use the ford and when to arrive. Put the finished wording in a particular listener’s hands.',
    dimensions: ['micro:1154', 'concept:interpretation', 'framework:perspectives', 'theme:LAN'],
    elements: ['game:158'],
  },
  {
    objective: 'bells.o1.check', map: 'aethelgard.emberford', target: 'bell-rope',
    source: 'tests/bells.test.ts', anchor: "action: 'compare'",
    action: 'Record how the sequence sounded to a listener, compare the first and last tuning-glass bands and give another listener a way to test the join.',
    dimensions: ['micro:1077', 'concept:evidence', 'concept:certainty', 'framework:methods-and-tools', 'area:NAT', 'area:HUM'],
    elements: ['game:234'],
    comparison: {
      concepts: ['evidence', 'certainty'], framework: ['methods-and-tools'],
      areas: [
        { id: 'NAT', method: 'Compare the pitch bands and relative amplitudes at the two ends of the cycle.', limit: 'The displayed match establishes the simulated endpoints. It cannot tell how a person perceived the intervening steps.' },
        { id: 'HUM', method: 'Let the listener report their experience before they inspect the endpoint comparison.', limit: 'One report establishes neither the universal response of listeners nor the physical frequencies of the bells.' },
      ],
      connection: 'Both observations survive the handover. At the two-listener bench Maren seats people who heard different things beside the same recorded bands.',
    },
  },
  {
    objective: 'last-bell.voices.sleeve', map: 'voices.listening', target: 'lamplight.voices.bench',
    source: 'tools/last-bell-journey.mjs', anchor: "button('Follow W–17')",
    action: 'Follow the shelf mark that survived on the chalk strip. Read the matching cylinder sleeve and identify the permission attached to this particular recording.',
    dimensions: ['micro:1016', 'concept:evidence', 'framework:methods-and-tools'], elements: ['story:48'],
  },
  {
    objective: 'last-bell.voices.left', map: 'voices.listening', target: 'lamplight.voices.bench',
    source: 'tests/last-bell.test.ts', anchor: 'can hear six different cuts',
    action: 'Wind the single chalked groove and the complete testimony. The next sentence identifies the kitchen bell. Decide how the witness’s full voice or her unsigned account can reach the next listener.',
    dimensions: ['micro:1010', 'micro:1157', 'concept:interpretation', 'framework:scope', 'question:KQ-ROUTE-07'],
    elements: ['game:287', 'story:48'],
  },
  {
    objective: 'last-bell.island.left', map: 'island.workshop', target: 'lamplight.island.bench',
    source: 'tests/last-bell.test.ts', anchor: 'expect(relayRun(choice, false).beats).toEqual([2, 2])',
    action: 'Close the model tower’s shutter, try the one runner on either lane, then open the shutter on the same route. Track which household receives the warning by the fourth beat.',
    dimensions: ['micro:1090', 'concept:explanation', 'framework:methods-and-tools', 'question:KQ-ROUTE-05'],
    elements: ['game:158', 'game:234'],
    reasoning: [{ mode: 'causal', basis: 'Hold the runner’s route fixed and move only the shutter. In this model the tower reaches both houses at beat two in clear air. Fog removes that shared relay.' }],
  },
  {
    objective: 'last-bell.island.field-check', map: 'island.workshop', target: 'lamplight.island.bench',
    source: 'tests/last-bell.test.ts', anchor: 'expect(relayRun(choice, true, true).beats)',
    action: 'Carry both crossing times back from the hinged plank. Retest the chosen fog route at the plinth before giving the crew an amended chart.',
    dimensions: ['micro:1080', 'micro:1086', 'concept:evidence', 'framework:methods-and-tools', 'question:KQ-ROUTE-04'],
    elements: ['game:234'],
  },
  {
    objective: 'last-bell.council.left', map: 'council.hall', target: 'lamplight.council.bench',
    source: 'tests/last-bell.test.ts', anchor: 'gives both chairs a hearing with records',
    action: 'Give the floor to the witness, runner or clerk and hear another speak to the first account. Decide who can summon the next meeting. The signed minute keeps the two sources in their chosen order.',
    dimensions: ['micro:1142', 'micro:1158', 'concept:power', 'framework:perspectives', 'question:KQ-ROUTE-01'],
    elements: ['game:114'],
  },
  {
    objective: 'last-bell.council.left', map: 'council.hall', target: 'lamplight.council.bench',
    source: 'tools/last-bell-journey.mjs', anchor: 'line getting to our door',
    action: 'Put the kitchen cylinder and runner’s chart on the desk in both orders. Hear Joss use the account to propose a route and the girl explain what a line reaching the house leaves unknown.',
    dimensions: ['area:HIS', 'area:MAT', 'concept:evidence', 'concept:justification', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:114'],
    comparison: {
      concepts: ['evidence', 'justification'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'HIS', method: 'Recover the referent from the witness’s complete account and compare it with the chalked fragment.',
          limit: 'The girl can identify the bell she heard beside the stove. She cannot establish what happened at the tower.' },
        { id: 'MAT', method: 'Trace the warning through the selected shutter and runner settings and use the bridge times to establish which stops the model reaches by the fourth beat.',
          limit: 'A route reaching a household by the deadline cannot establish that a particular person heard the warning on that night.' },
      ],
      connection: 'The spoken exchange changes when the record order reverses. The signed minute preserves both records and the specific limit identified by the second speaker.',
    },
  },
  {
    objective: 'last-bell.council.reopened', map: 'council.hall', target: 'lamplight.council.bench',
    source: 'tests/last-bell.test.ts', anchor: 'requires the four field records for either second hearing',
    action: 'Reopen the minute with Maro’s flood tally, Ro’s missing replies, the witness’s publication choice and Joss’s revised route. Give the households control of the trial design or offer the two houses comparable roles measuring the crossing.',
    dimensions: ['micro:1180', 'micro:1200', 'concept:responsibility', 'framework:ethics', 'question:KQ-ROUTE-07'],
    elements: ['game:114', 'story:15'],
    reasoning: [{ mode: 'pragmatic', basis: 'Giving households a choice of contact makes the trial accessible to different witnesses. A paired timed walk yields a comparable measurement. Choose which purpose the next shift can serve first.' }],
  },
  {
    objective: 'council.publish', map: 'council.gallery', target: 'council-reader',
    source: 'tests/council-story.test.ts', anchor: 'checks the two readings and keeps the $policy docket',
    action: 'Check the working and stopped watches against the drum at two marks. Check the signed repair seal before choosing a repeated shift check or a dated record with a fallback.',
    reasoning: [{ mode: 'deductive', basis: 'A working watch and a stopped watch both show 12:00 at the opening mark. At the next mark only the working watch advances. A single counterexample defeats the proposed rule that a first match establishes a working watch.' }],
    comparison: {
      concepts: ['evidence', 'certainty'], framework: ['scope', 'methods-and-tools'],
      areas: [
        { id: 'NAT', method: 'Compare each watch with the independent rail drum, then check whether its reading changes at the second mark.',
          limit: 'The practice tests show what the displayed readings support within a minute. A match alone cannot establish a watch’s longer-term reliability.' },
        { id: 'HIS', method: 'Check the previous signed test for its shift, reference drum and two readings. Keep that record separate from the present tests.',
          limit: 'The seal covers its named shift and reading pair. An old, broken or undated seal calls for a fresh independent check.' },
      ],
      connection: 'Post a new rail check each shift or a signed-reading rule with an explicit fallback. Both policies respond to the practice counterexample while keeping the earlier record within its scope.',
    },
    dimensions: ['area:NAT', 'area:HIS', 'concept:evidence', 'concept:certainty', 'framework:scope', 'framework:methods-and-tools'],
    elements: ['game:267'],
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
    ...suppliedMicro.map((number) => ({
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
      { SUPPLIED_SKILL_IDS, NEW_SKILL_NAMES }, game, story, titleSources] =
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
      micro: [...NEW_SKILL_NAMES, ...MICRO_SKILLS], suppliedMicro: SUPPLIED_SKILL_IDS, microSkillId, titleSources });
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
  'All 1,200 numbered micro-skill definitions were supplied. A source definition counts toward the inventory; only reviewed, reachable actions count toward the target.',
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
