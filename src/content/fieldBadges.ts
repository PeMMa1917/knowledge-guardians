import type { AwardRecord, Condition, ContentPack, DialogueNode, Effect, Hint, Objective } from '../domain/types';

const acts = (...objectives: string[]): Condition => ({ all: objectives.map((objective) => ({ objective })) });
const state = (flag: string, eq: string | boolean = true): Condition => ({ flag, eq });
const set = (setFlag: string, value: string | boolean = true): Effect => ({ setFlag, value });
const missing = (flag: string): Condition => ({ not: { flagSet: flag } });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });

type DeedBadge = {
  id: string;
  title: string;
  deed: string;
  earned: Condition;
  invitation?: string;
};

const dryStep: DeedBadge = {
  id: 'dry-step', title: 'Dry-foot Receiver', deed: 'Recheck the washhouse after fitting a chosen repair and verify the relief route at Water Commons.',
  earned: acts('washhouse.o.recheck', 'water.routing.finish'), invitation: 'Tova has left a spare ramp board at the old ferry.',
};
const audiences: DeedBadge = {
  id: 'audiences', title: 'Cues in Reach', deed: 'Reuse Ethren’s gift with Leila and revise the performance programme after listening to its audience.',
  earned: acts('curtain.workmen', 'stage.finish'), invitation: 'The Archive Hall has an unused cue rest near the practice bench.',
};
const signedCopy: DeedBadge = {
  id: 'signed-copy', title: 'Keeper of Two Receipts', deed: 'Get Emberford’s dated correction to its reader and settle where Nellis’s checked paper may be seen.',
  earned: acts('copy.o.relay', 'nile.handoff.send'), invitation: 'Look for the metal index at the Badge Annex and take it to the earlier Emberford recheck.',
};

export const FIELD_BADGES: DeedBadge[] = [
  dryStep, audiences, signedCopy,
  { id: 'survey-margin', title: 'The Survey Margin', deed: 'Mark where each shore survey stopped. Retest the island delivery plan when the ferry is lower.',
    earned: acts('sea.finish', 'island.retest') },
  { id: 'source-return', title: 'The Source That Came Back', deed: 'Bring the equipped Quetzalecatzin Codex or Gage rod back to its earlier checking station and leave the supported notice.',
    earned: { any: [state('callboard.quetzalecatzin.returned'), state('callboard.gage-mount.returned')] } },
  { id: 'named-work', title: 'Named Work on the Record', deed: 'Check whose work appears in the Gombe accounts and follow the Cold Store’s separate request for a name and permission.',
    earned: acts('forest.gombe-credit', 'preserved.handoff.respond') },
  { id: 'return-watch', title: 'The Watch Returned', deed: 'Revise the first coastal notice after a new reading and put the return forest watch into its public record.',
    earned: acts('coast.revise', 'forest.finish') },
  { id: 'first-look', title: 'First Look Kept', deed: 'Keep the first cart view recoverable through the replay and keep the two differently closed Workmen’s records with their own uses.',
    earned: acts('memory-cart.handover', 'nile.closing.post') },
  { id: 'three-checks', title: 'Three Supporting Sights', deed: 'Repeat the lamp view, compare the Metalworks tag’s two possible changes and leave the checked symbol key on the shore.',
    earned: acts('nile.lamp.compare', 'metal.tag.explained', 'sea.symbol.placed') },
  { id: 'waiting-queue', title: 'The People Still Waiting', deed: 'Collect the Market ticket at its Emberford counter and deliver the remaining parcels after the signed Civic review.',
    earned: acts('market.basket.collect', 'parcel.o.finish') },
  { id: 'separate-rules', title: 'Proof Beside the Mark', deed: 'Test two dispatch rules on the same joined count and check an installed receiving arrangement against the actual crew.',
    earned: acts('civic.rules', 'civic.overlap.finish') },
  { id: 'handover-place', title: 'Signals in Two Places', deed: 'Check the marked observer track, leave a dated island listening log and put the Council’s jointly checked handover where crews can use it.',
    earned: acts('water.observer.finish', 'island.log', 'council.team.post') },
];

export const FIELD_WORK = {
  dry: { badge: dryStep, ready: 'field-work.dry.ready', seen: 'field-work.dry.checked' },
  cue: { badge: audiences, ready: 'field-work.cue.place', seen: 'field-work.cue.checked' },
  docket: { badge: signedCopy, ready: 'field-work.docket.loan', seen: 'field-work.docket.checked' },
} as const;

export const FIELD_INDEX = 'item.field-docket-index';

export function fieldBadgeReady(caseId: keyof typeof FIELD_WORK): Condition {
  const badge = FIELD_WORK[caseId].badge;
  return { any: [badge.earned, state('title.worn', badge.title)] };
}

export function fieldWorkReady(caseId: keyof typeof FIELD_WORK): Condition {
  return all(fieldBadgeReady(caseId), missing(FIELD_WORK[caseId].ready));
}

const fieldAwards: AwardRecord[] = FIELD_BADGES.map((badge) => ({
  id: 'badge.field.' + badge.id,
  kind: 'badge', name: badge.title, title: badge.title,
  earnedBy: [badge.deed, badge.invitation].filter(Boolean).join(' '),
  criteria: [], when: badge.earned,
}));

const fieldDialogues: DialogueNode[] = [
  { id: 'field-work.dry', speaker: 'ferry-tova', historicalLabel: 'fictional-world',
    text: 'Leave the water’s room and the carrier’s room on different lines. The old dry board reaches the receiving bag. A wheeled tray still needs the cart path.',
    options: [{ text: 'Lay the dry board for the foot carrier.', if: fieldWorkReady('dry'), effects: [set(FIELD_WORK.dry.ready)] }] },
  { id: 'field-work.cue', speaker: 'curtain-ethren', historicalLabel: 'fictional-world',
    text: 'The performers sent two cue copies. A caller who needs a hand free can watch the rail. A visitor who wants the details can sit at the bench before choosing when to join.',
    options: [
      { text: 'Raise the three visible marks on the rail.', if: fieldWorkReady('cue'), effects: [set(FIELD_WORK.cue.ready, 'rail')] },
      { text: 'Slide the cue and its explanation into the bench pocket.', if: fieldWorkReady('cue'), effects: [set(FIELD_WORK.cue.ready, 'bench')] },
    ] },
  { id: 'field-work.docket', speaker: 'badge-keeper', historicalLabel: 'fictional-world',
    text: 'One receipt shows a copy reached a reader. Another records what somebody actually checked. Take this split index to the loose order at the earlier market. Its clips never put one job on both lines.',
    options: [{ text: 'Take the split index to Emberford.', if: fieldWorkReady('docket'),
      effects: [{ giveItem: FIELD_INDEX }, set(FIELD_WORK.docket.ready)] }] },
  { id: 'field-work.docket.return', speaker: 'narrator', historicalLabel: 'fictional-world',
    text: 'This old market order signed the delivery of a sleeve. No one signed that the date inside the sleeve was verified. Leave the handover signature while lifting it clear of the date check.',
    options: [{ text: 'Fit the index under the two lines and leave the date check open.',
      if: all({ item: FIELD_INDEX }, missing(FIELD_WORK.docket.seen)), effects: [set(FIELD_WORK.docket.seen)] }] },
];

const objectives: Objective[] = [
  { id: 'field-work.dry.receipt', title: 'Take the marked footpath and check the dry receiving bag.', essential: false,
    visible: state(FIELD_WORK.dry.ready), done: state(FIELD_WORK.dry.seen),
    weave: { concepts: ['explanation', 'objectivity', 'responsibility'], framework: ['scope', 'methods-and-tools'],
      thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'relational' }, atl: ['thinking', 'communication'],
      aoks: ['NAT', 'HUM'], subjects: ['design-tech'], minutes: 3 } },
  { id: 'field-work.cue.receipt', title: 'Check what a hall visitor can do at the new cue rest.', essential: false,
    visible: { flagSet: FIELD_WORK.cue.ready }, done: state(FIELD_WORK.cue.seen),
    weave: { concepts: ['perspective', 'explanation', 'responsibility'], framework: ['perspectives', 'methods-and-tools', 'ethics'],
      thinking: { dok: 2, bloom: 'apply', fink: 'human', solo: 'relational' }, atl: ['social', 'communication'],
      aoks: ['ART', 'HUM'], subjects: ['theatre', 'music'], minutes: 3 } },
  { id: 'field-work.docket.receipt', title: 'Check what was signed at the earlier Emberford market.', essential: false,
    visible: { item: FIELD_INDEX }, done: state(FIELD_WORK.docket.seen),
    weave: { concepts: ['evidence', 'power', 'certainty'],
      framework: ['scope', 'methods-and-tools'], thinking: { dok: 2, bloom: 'analyse', fink: 'integration', solo: 'relational' },
      atl: ['research', 'thinking'], aoks: ['HIS', 'HUM'], subjects: ['history'], minutes: 3 } },
];
const hints = [
  ['The receiving bag has a path for feet.', 'Read Tova’s board when the two repairs have been checked.', 'Leave the cart lane in use while putting down a board for one carrier.', 'Take the new board past the stream and read the signed receiving bag.'],
  ['The cue and the reason can be read at different paces.', 'Open Ethren’s spare rest in the Archive Hall.', 'Give one aid a sightline or a pocket, depending on the visitor.', 'Walk to the side you fitted and check what the visitor could use.'],
  ['A delivery signature can live beside an open check.', 'The Badge Annex has an index with two movable clips.', 'Take it to the earlier Emberford order when the two receipts are known.', 'Fit the two headings over the separate lines and inspect the remaining check.'],
];

export const fieldBadgeContent = {
  awards: fieldAwards,
  dialogue: fieldDialogues,
  items: [{ id: FIELD_INDEX, name: 'The split receipt index', art: 'preserved.display-paired', historicalLabel: 'fictional-world',
    description: 'Two clips keep “received” and “checked” apart. The loose order at Emberford can use it.' }],
  missions: [{ id: 'KG-CH1-R48', world: 'WORLD-01', title: 'What the Work Leaves',
    stake: 'A returning carrier and two readers need work they can use at the place they are waiting.',
    knowledgeQuestion: 'How does a past check make help possible at a new place?', objectives }],
  hints: objectives.flatMap(({ id }, row) => hints[row].map((text, index) =>
    ({ id: `h.${id}.${index + 1}`, objective: id, depth: (index + 1) as Hint['depth'], text }))),
} satisfies Partial<ContentPack>;
