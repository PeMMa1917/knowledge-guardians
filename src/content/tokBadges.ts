import type { AwardRecord, Condition, ContentPack } from '../domain/types';

export const BADGE_FAMILIES = [
  { id: 'pillars', name: 'Pillars of Knowledge', privilege: 'Open the two-sided evidence case.' },
  { id: 'realms', name: 'Realms of Understanding', privilege: 'Unfold the map of different ways to check a claim.' },
  { id: 'toolkit', name: 'Navigator’s Toolkit', privilege: 'Set out a usable guide for the next keeper.' },
  { id: 'oracle', name: 'Oracle’s Challenge', privilege: 'Keep a second observer’s clip beside the press.' },
  { id: 'record', name: 'Guardian’s Record', privilege: 'Leave an earlier wording with a visible correction.' },
  { id: 'fellowship', name: 'Odyssey Fellowship', privilege: 'Open the handover passage to the visitors’ bench.' },
  { id: 'paths', name: 'Archetype Quests', privilege: 'Set out the alternate carrier’s route.' },
  { id: 'legend', name: 'Legendary Achievements', privilege: 'Set the final lantern beside a shared record.' },
] as const;

export type BadgeFamily = (typeof BADGE_FAMILIES)[number]['id'];
type Stage = [objective: string, action: string];
type BadgeDefinition = { id: string; family: BadgeFamily; name: string; action: string; when: Condition; level?: number };

export const BADGE_ROOM_OPEN: Condition = { objective: 'm01.o6.label' };
export const objective = (id: string): Condition => ({ objective: id });
const all = (...conditions: Condition[]): Condition => ({ all: conditions });
const any = (...conditions: Condition[]): Condition => ({ any: conditions });
const flag = (name: string, eq: string | boolean = true): Condition => ({ flag: name, eq });
const acts = (...names: string[]): Condition => all(...names.map(objective));

const pillars: [name: string, key: string, stages: [Stage, Stage, Stage]][] = [
  ['Evidence', 'evidence', [
    ['m01.o3.lens', 'Use the Date-Kind Lens to find what two pen records actually date.'],
    ['forest.compare', 'Compare repeated watches from two lookouts.'],
    ['sea.compare', 'Align two charts that have different surveyed edges.'],
  ]],
  ['Certainty', 'certainty', [
    ['nexus.seal.checked', 'Work out which check a handling seal can certify.'],
    ['coast.observe-again', 'Return to the gauge and compare the new reading with the earlier notice.'],
    ['voices.verify', 'Give the trial and the public opening their own recorded dates.'],
  ]],
  ['Truth', 'truth', [
    ['nile.mark.publish', 'Move a name from a supposed maker to what the receiving record states.'],
    ['copies.compare', 'Find both changes introduced by two public copies of a trial.'],
    ['water.finish', 'Keep the first gate order beside the measured result after repair.'],
  ]],
  ['Interpretation', 'interpretation', [
    ['m02.o3.thread', 'Follow the records that give the Emberford blade’s mark different readings.'],
    ['stage.compare', 'Hold a scene’s words fixed and compare two cue orders.'],
    ['sea.finish', 'Show the earlier chart reader where each survey stops.'],
  ]],
  ['Power', 'power', [
    ['m02.o5.showdown', 'Bring evidence to the public argument about Corvan’s sign.'],
    ['forest.publish', 'Choose which trail visitors get the new record.'],
    ['civic.finish', 'Attach a way to hear the next reader to the published schedule.'],
  ]],
  ['Justification', 'justification', [
    ['m01.o6.label', 'Fit a durable pen label to its support and limit.'],
    ['coast.forecast', 'Carry a model forecast with a stated limit into the notice.'],
    ['civic.overlap.finish', 'Use the possible arrivals and the real release time to choose a receiving arrangement.'],
  ]],
  ['Explanation', 'explanation', [
    ['m01.o4.test', 'Change one part of the workshop test while holding the rest steady.'],
    ['nile.workers.proof', 'Move the opening slip while keeping the reading frame and source steady.'],
    ['metal.tag.explained', 'Leave two tested ways the same workshop tag could turn.'],
  ]],
  ['Objectivity', 'objectivity', [
    ['m02.o4.forge', 'Compare cut samples at Hesper’s test bench.'],
    ['nile.lamp.compare', 'Move the light on the same slip and restore the first view.'],
    ['council.compare', 'Advance the same watch case against controlled and drifting references.'],
  ]],
  ['Perspective', 'perspective', [
    ['m01.o5.practice', 'Hear two speakers and try the first public exchange with Venn.'],
    ['nile.way.compare', 'Read the same sketch from the two ends of its table.'],
    ['stage.finish', 'Revise the programme after checking what the audience could see.'],
  ]],
  ['Culture', 'culture', [
    ['nile.closing.post', 'Keep the wagon-stock slip and the lending slip in their different work practices.'],
    ['coast.clear.share', 'Set the menders’ and lookout’s meanings of “clear” where each can be used.'],
    ['island.signal', 'Check what the landing square means in the local crew’s handover.'],
  ]],
  ['Values', 'values', [
    ['nile.reply.place', 'Choose who gets the earlier evidence copy at the Nile Archive.'],
    ['market.publish', 'Use the practice purse while choosing who sees the first market display.'],
    ['council.bench', 'Balance handover access and a solo approach when you place the practice dial.'],
  ]],
  ['Responsibility', 'responsibility', [
    ['nile.return', 'Bring the signed first packet back and put it into use at the Nexus.'],
    ['copies.revise', 'Repair what the printed trial guidance led a reader to assume.'],
    ['council.team.post', 'Leave the checked packet and courier reply where the waiting crew can use them.'],
  ]],
];

const realms: [name: string, key: string, stages: [Stage, Stage, Stage]][] = [
  ['Natural Sciences', 'nature', [
    ['coast.readings', 'Take readings at both coastal sites and compare them.'],
    ['forest.moss.survey', 'Use one fixed frame at four trail placements, then bring a separate boot tally.'],
    ['water.retest', 'Repeat the earlier gate setting after the repair and compare another repaired run.'],
  ]],
  ['Human Sciences', 'human', [
    ['survey.o1.report', 'Carry out and report the bridge toll survey.'],
    ['civic.compare', 'Hold the rule steady across two different request tallies.'],
    ['civic.finish', 'Rework the schedule after listening to a reader whose stop was missed.'],
  ]],
  ['History', 'history', [
    ['m02.o3.thread', 'Check which hands and records the blade passed through.'],
    ['preserved.proof.checked', 'Compare the dated excavation journal and later report.'],
    ['voices.verify', 'Keep testimony, trial and opening records in their own places.'],
  ]],
  ['Arts', 'arts', [
    ['frame.o1.posters', 'Cut distinct views from the same market picture for different posters.'],
    ['stage.light.o.compare', 'Try fixed light positions on the same relief and check its maker’s source.'],
    ['stage.finish', 'Use performance and audience evidence to revise the programme.'],
  ]],
  ['Mathematics', 'maths', [
    ['win.o1.count', 'Try the glazier’s counting rule at more than one size.'],
    ['civic.overlap.evidence', 'Group all dispatch arrangements and check an actual release observation.'],
    ['island.retest', 'Recalculate crossings for the same eight crates at two landing heights.'],
  ]],
  ['Tools and Technology', 'technology', [
    ['sorter.o1.teach', 'Find which fruit the brass sorter has seen and give it suitable examples.'],
    ['civic.rules', 'Run two rules with the same joined requests.'],
    ['oracle.holdout', 'Send the same unseen record copies through two configured readers.'],
  ]],
];

const badge = (family: BadgeFamily, id: string, name: string, action: string, when: Condition, level?: number): BadgeDefinition =>
  ({ id: `badge.tok.${family}.${id}`, family, name, action, when, level });

function tiers(family: 'pillars' | 'realms', label: string, key: string, stages: [Stage, Stage, Stage]): BadgeDefinition[] {
  const names = ['First Hand', 'Wider Use', 'Linked Practice'];
  return stages.map(([, action], index) =>
    badge(family, key + '.' + (index + 1), `${label} · ${names[index]}`,
      index === 0 ? action : `${action} Builds on the earlier ${label.toLowerCase()} work.`,
      acts(...stages.slice(0, index + 1).map(([id]) => id)), index + 1));
}

const pillarBadges = pillars.flatMap(([label, key, stages]) => tiers('pillars', label, key, stages));
const realmBadges = realms.flatMap(([label, key, stages]) => tiers('realms', label, key, stages));

const toolkit = [
  badge('toolkit', 'practitioner', 'Handful of Methods', 'Try a different way of checking at the Lens, bench, archive, survey and stage.',
    acts('m01.o3.lens', 'm01.o4.test', 'nile.way.compare', 'survey.o1.report', 'stage.compare')),
  badge('toolkit', 'specialist', 'The Steady Comparison', 'Keep a setting steady through repeated fair comparisons in five workplaces.',
    acts('m01.o4.test', 'nile.lamp.compare', 'forest.compare', 'metal.compare', 'island.retest')),
  badge('toolkit', 'innovator', 'The Two-Tool Check', 'Combine calculation and receiving evidence to improve a dispatch setup.',
    acts('civic.overlap.evidence', 'civic.overlap.finish')),
  badge('toolkit', 'communication', 'A Notice That Reaches', 'Get a qualified notice to a reader, then act on how the reader understood it.',
    acts('copies.publish', 'copies.revise', 'voices.finish')),
  badge('toolkit', 'research', 'The Evidence Trail', 'Check the maker’s trail, an excavation note and the name on a historic record.',
    acts('m02.o3.thread', 'preserved.proof.checked', 'nile.name.file')),
  badge('toolkit', 'collaboration', 'The Signed Handover', 'Help a team make, carry and confirm the same packet.',
    acts('council.team.trial', 'council.team.post')),
  badge('toolkit', 'reflection', 'Changed by a Return', 'Let a second observation alter a working account in two settings.',
    acts('forest.finish', 'water.finish')),
  badge('toolkit', 'organization', 'The Next Stop Ready', 'Keep the two times and the receiving job straight through a delivery and a call.',
    acts('stage.transfer.check', 'stage.transfer.copy', 'civic.overlap.finish')),
  badge('toolkit', 'perspective', 'Five Approaches', 'Read from another approach at the sketch, trail, chart, gallery and quay.',
    acts('nile.way.compare', 'forest.account', 'sea.names', 'stage.sightline', 'voices.reader')),
  badge('toolkit', 'ethics', 'Permission at the Edge', 'Keep an agreed access boundary during placement, press use and record handover.',
    acts('voices.quote', 'oracle.custody', 'preserved.handoff.respond')),
  badge('toolkit', 'community', 'Room at the Bench', 'Make useful room for a reader in the forest and in the Council hall.',
    acts('forest.access', 'council.bench')),
];

const oracle = [
  badge('oracle', 'scribe', 'Press Work Log', 'Clip separately which slips fed the two runs.', objective('oracle.examples'), 1),
  badge('oracle', 'novice', 'Two Requests', 'Run both fixed briefs and keep track of what each output is for.', objective('oracle.brief'), 1),
  badge('oracle', 'human-review', 'The Keeper’s Check', 'Open the source slips withheld from both runs and make the return to a person.', objective('oracle.holdout'), 1),
  badge('oracle', 'instructions', 'The Narrow Instruction', 'Compare an immediate direction with a sourced account before publishing.', acts('oracle.brief', 'oracle.publish'), 2),
  badge('oracle', 'bias', 'The Sample Gap', 'Compare the effects of a narrow sample and a wider one using the same reader.', acts('oracle.examples', 'oracle.switch'), 2),
  badge('oracle', 'evaluation', 'Two Receipts Still Open', 'Compare the limits of both readers against withheld slips that the keeper can check.', acts('oracle.switch', 'oracle.holdout'), 2),
  badge('oracle', 'investigator', 'Under the Cover', 'Check who cut the press copy and which part changed its claim.', objective('oracle.trace'), 2),
  badge('oracle', 'ethics', 'Permission Before Printing', 'Use the permission register before moving one notice to readers.', acts('oracle.brief', 'oracle.custody', 'oracle.publish'), 3),
  badge('oracle', 'joint-work', 'Part Worked by Hand', 'Compare machine attempts, check a source in person and keep both roles on the final notice.',
    acts('oracle.examples', 'oracle.switch', 'oracle.holdout', 'oracle.publish'), 3),
  badge('oracle', 'provenance', 'The Uncut Record', 'Overlay a polished copy and its saved source, then keep the edited limit and permissions visible.',
    acts('oracle.trace', 'oracle.custody', 'oracle.publish'), 3),
];

const keeper = [
  badge('record', 'exhibit-debut', 'First Hand at the Display', 'Fit a distinct object, audience and constraint to three teaching displays.',
    acts('nile.exhibit.used', 'preserved.binak.finish', 'metal.exhibit.used')),
  badge('record', 'curator', 'Three Useful Mounts', 'Prepare displays that do a different job on the shore, in the Archive and at the forge.',
    acts('sea.finish', 'nile.exhibit.mounted', 'metal.exhibit.mounted')),
  badge('record', 'argument', 'The Other Case', 'Use a counter-position in the market and revise a public proposal after both benches hear it.',
    acts('m02.o5.showdown', 'bench.debate.exchange', 'bench.debate.minute')),
  badge('record', 'chronicler', 'A Record Still in Use', 'Keep the first dispatch and reopen it after another reader uses it.',
    acts('nile.return', 'nile.reply.compare', 'nile.reply.place')),
  badge('record', 'reviser', 'Changed Because', 'Trace the first claim and correct a different step in a notice after two return checks.',
    acts('coast.revise', 'water.finish', 'postgame.retrace')),
];

const fellowship = [
  badge('fellowship', 'helpful', 'A Useful Second Look', 'Leave a checked response for a specific reader in the Archive and at the performance.',
    acts('nile.reply.place', 'stage.finish')),
  badge('fellowship', 'voices', 'Two Speakers Heard', 'Hear the two openings of a workers’ reading and leave distinct voices in the walks notice.',
    acts('nile.workers.proof', 'voices.finish')),
  badge('fellowship', 'mentor', 'Make Space for the Next Hand', 'Choose useful support for a new reader at the trail and practice dial.',
    acts('forest.access', 'council.bench')),
  badge('fellowship', 'team', 'Everyone’s Handover', 'Keep a shared action moving from gathered evidence to checked arrival and readback.',
    acts('council.team.trial', 'council.team.post')),
];

const paths = [
  badge('paths', 'inquirer', 'The Question That Opens a Door', 'Follow two archive accounts and check the return file when a first display leaves a question open.',
    acts('nile.two', 'preserved.proof.checked', 'preserved.proof.hung')),
  badge('paths', 'synthesizer', 'The Two-Method Thread', 'Connect chart and survey, marks and experiment, and a mathematical rack with a public route.',
    acts('sea.compare', 'metal.tag.explained', 'bench.debate.civic.used')),
  badge('paths', 'empath', 'Along the Other Approach', 'Check from the aisle and shelf, the gallery, and the quay and stairs before choosing an access route.',
    acts('nile.way.publish', 'stage.sightline', 'voices.finish')),
  badge('paths', 'innovator', 'A Tool That Travels', 'Fit an alternate method to the sluice and let the runner counter adapt to another receipt order.',
    acts('water.routing.finish', 'water.counter.finish')),
  badge('paths', 'guardian', 'The Shared Check', 'Keep a trainee’s agreement, post a next check in Civic Dispatch, and leave a public correction at the old bench.',
    acts('preserved.handoff.respond', 'civic.finish', 'postgame.complete')),
];

const realmCapstones = realmBadges.filter(({ level, id }) => level === 3 && !id.includes('.technology.'));
const fourRealms = any(...realmCapstones.map((_, omitted) =>
  all(...realmCapstones.flatMap(({ when }, index) => index === omitted ? [] : [when]))));

const legend = [
  badge('legend', 'pillars', 'The Many Pillars', 'Bring together the third linked practice for all twelve concepts.',
    all(...pillarBadges.filter(({ level }) => level === 3).map(({ when }) => when))),
  badge('legend', 'realms', 'The Connected Realms', 'Finish the linked practice in any four of the five Areas of Knowledge.',
    fourRealms),
  badge('legend', 'oracle', 'The Press Reopened', 'Carry through permission, human and press work, and an evidenced revision of a copied image.',
    all(...oracle.filter(({ level }) => level === 3).map(({ when }) => when))),
];

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  ...pillarBadges, ...realmBadges, ...toolkit, ...oracle, ...keeper, ...fellowship, ...paths, ...legend,
  badge('legend', 'together', 'Aethelgard’s Shared Record', 'Join the three capstone records and leave one path in use.',
    all(...legend.map(({ when }) => when), any(...paths.map(({ when }) => when)))),
];

export const TOK_BADGES: AwardRecord[] = BADGE_DEFINITIONS.map((definition) => ({
  id: definition.id, name: definition.name, earnedBy: definition.action, kind: 'badge', criteria: [],
  title: definition.name, when: definition.when,
}));

export function badgeFamilyReady(family: BadgeFamily): Condition {
  const members = BADGE_DEFINITIONS.filter((entry) => entry.family === family);
  return any(...members.map(({ when }) => when), { flag: 'title.worn', in: members.map(({ name }) => name) });
}

export const selectedFamily = (family: BadgeFamily): Condition => flag(`badge-room.${family}.used`);

export function badgeFamilyOf(id: string): BadgeFamily | undefined {
  return BADGE_DEFINITIONS.find((definition) => definition.id === id)?.family;
}

export const tokBadgeAwards = { awards: TOK_BADGES } satisfies Partial<ContentPack>;
