import type { KnowledgeQuestion, Objective } from '../domain/types';

export const ROUTE_ACTIONS = {
  cataloguing: 'cataloguing an object',
  comparing: 'comparing records',
  giving: 'handing a source on',
  investigating: 'following a lead',
  listening: 'listening from another place',
  making: 'making a usable copy',
  modelling: 'running a model',
  observing: 'watching a change',
  rehearsing: 'trying a scene',
  revising: 'revising a public record',
  staging: 'arranging a public space',
  testing: 'testing a material or condition',
  tracing: 'tracing a name or source',
} as const;

type Encounter = readonly [objective: string, action: keyof typeof ROUTE_ACTIONS];
type QuestionRoute = { question: KnowledgeQuestion; encounters: readonly Encounter[] };

function route(number: number, text: string, lastWord: string, ...encounters: Encounter[]): QuestionRoute {
  return {
    question: { id: `KQ-ROUTE-${String(number).padStart(2, '0')}`, text, lastWord, journalOnly: true },
    encounters,
  };
}

// The numbers let authors cross-reference the exhibition question families.
// All questions and conclusions below were written for these particular scenes.
export const QUESTION_ROUTES = [
  route(1, 'What can I put on a public label and expect the next person to check?',
    'A visitor can repeat a supported claim when the object and the reason stay together.',
    ['m01.o6.label', 'revising'], ['preserved.proof.hung', 'staging'], ['council.team.trial', 'rehearsing']),
  route(2, 'Which information saves the next keeper a wasted trip?',
    'A detail can be exact and still fail to help a particular person take their next step.',
    ['fold.access.finish', 'giving'], ['nile.way.publish', 'staging'], ['voices.finish', 'revising']),
  route(3, 'When is it safe to act on a record I did not make?',
    'A second record carries more weight when its maker could have found something different.',
    ['m02.o3.thread', 'tracing'], ['water.counter.compare', 'rehearsing'], ['council.sources', 'investigating']),
  route(4, 'What detail should make me pause before carrying the usual story onward?',
    'Even a small disagreement can show which piece needs checking before the story travels.',
    ['nexus.stroke.compared', 'comparing'], ['nile.reply.compare', 'tracing'], ['coast.observe-again', 'observing']),
  route(5, 'What could settle the point these two records disagree about?',
    'A new observation helps when it distinguishes the competing accounts.',
    ['m01.o4.test', 'testing'], ['forest.counter.compare', 'rehearsing'], ['civic.compare', 'modelling']),
  route(6, 'What will I find later if I file this record under that heading?',
    'A heading can bring related things together and can bury the detail someone came to find.',
    ['m01.o3.lens', 'cataloguing'], ['nile.name.file', 'cataloguing'], ['accession.market.compare', 'tracing']),
  route(7, 'Whose next move changes when this becomes the public version?',
    'A public copy changes what people can do even before anyone comes back to correct it.',
    ['m02.o5.showdown', 'revising'], ['market.publish', 'staging'], ['civic.reader', 'listening']),
  route(8, 'When can I make a firm promise from a test?',
    'A sound result about one trial leaves the next set of conditions open.',
    ['m02.o4.forge', 'testing'], ['nile.tray.compare', 'modelling'], ['island.retest', 'modelling']),
  route(9, 'What could make two readers see different things in the same mark?',
    'The mark, the viewing conditions and the reader’s conventions can each change what comes through.',
    ['vindolanda.compare', 'comparing'], ['nile.lamp.compare', 'testing'], ['stage.light.o.compare', 'observing']),
  route(10, 'How can a message stay useful after it leaves its first reader?',
    'A copy can carry the source, and a readback can show whether the message arrived.',
    ['copy.o.relay', 'giving'], ['copies.proof', 'comparing'], ['accession.council.hand', 'rehearsing']),
  route(11, 'What would let someone who acted on the first notice change their mind?',
    'Leave a connection between the older decision and the new check so the first reader can follow it.',
    ['coast.revise', 'revising'], ['water.retest', 'modelling'], ['island.frames.finished', 'staging']),
  route(12, 'Whose experience slips out of the picture when I count from here?',
    'Change positions and keep track of who still falls outside the count.',
    ['forest.compare', 'observing'], ['stage.sightline', 'rehearsing'], ['civic.routing.compare', 'modelling']),
  route(13, 'How could a later keeper tell which part of the record improved?',
    'Set the earlier explanation beside the new check so the difference stays visible.',
    ['nile.reply.compare', 'tracing'], ['copies.revise', 'revising'], ['water.finish', 'revising']),
  route(14, 'Which people can make sense of the name a map carries?',
    'A chart can travel farther than the people who made its names useful.',
    ['sea.names', 'tracing'], ['departure.archive.compare', 'comparing'], ['record.edge.civic.compare', 'tracing']),
  route(15, 'What still cannot be checked from the place where I stand?',
    'A boundary on a record tells the next person where a fresh check begins.',
    ['forest.recheck', 'observing'], ['sea.finish', 'revising'], ['stage.frames.checked', 'testing']),
  route(16, 'When should a keeper leave a true detail out of the public copy?',
    'Someone can check a claim without taking ownership of every private detail behind it.',
    ['voices.sources', 'tracing'], ['welcome.market.o.route', 'staging'], ['postgame.complete', 'giving']),
  route(17, 'Who might benefit from doing the work to check the first story?',
    'The person who needs the answer can help decide which part of a story deserves the first check.',
    ['nile.exhibit.scope', 'investigating'], ['water.needs', 'listening'], ['island.listener', 'observing']),
  route(18, 'What should stay open even after both sources have been read?',
    'Some records support a limited claim and leave the question they cannot answer in view.',
    ['preserved.coast', 'investigating'], ['metal.finish', 'revising'], ['sea.feedback', 'listening']),
  route(19, 'Which part of my reason would survive if the card went missing?',
    'A reason is easier to check when the next keeper can trace it back to the original observation.',
    ['backbill.copies.o.seal', 'making'], ['nile.handoff.check', 'tracing'], ['council.team.post', 'staging']),
  route(20, 'What changed when I tried the other person’s vantage point?',
    'Trying a view for yourself reveals a blind spot and still leaves room for the other person’s account.',
    ['departure.ferry.compare', 'observing'], ['island.movement.compare', 'rehearsing'], ['voices.reader', 'listening']),
  route(21, 'What gets lost if I use one heading for practices from different places?',
    'Keep a practice with the named people, place and purpose that give its public record meaning.',
    ['nile.stone.publish', 'revising'], ['welcome.market.o.sources', 'comparing'], ['preserved.binak.sources', 'cataloguing']),
  route(22, 'Where does the specialist’s check end and someone else’s work begin?',
    'A specialist may settle a narrow point and leave the next question to a different record or person.',
    ['nile.royal.seal', 'tracing'], ['forest.gombe-credit', 'investigating'], ['metal.trace', 'cataloguing']),
  route(23, 'What part of the situation can this instrument make visible?',
    'A useful instrument makes a specific feature easier to check and leaves other features open.',
    ['nile.exhibit.used', 'testing'], ['water.routing.compare', 'modelling'], ['market.wick', 'testing']),
  route(24, 'Why did a notice work in one place and miss people in another?',
    'The next site brings its own entry points, room and ways of checking a message.',
    ['nile.way.compare', 'modelling'], ['welcome.copies.o.send', 'giving'], ['island.frames.checked', 'observing']),
  route(25, 'Which part did I observe and which part am I prepared to infer?',
    'Keep the reading itself close enough for another person to disagree with the inference.',
    ['coast.forecast', 'modelling'], ['civic.overlap.evidence', 'comparing'], ['stage.finish', 'revising']),
  route(26, 'What could our crew find together that each of us would miss?',
    'People can combine partial views without treating repeated copies as independent accounts.',
    ['backbill.copies.o.check', 'tracing'], ['water.observer.readings', 'observing'], ['council.team.trial', 'rehearsing']),
  route(27, 'What do I owe the person who may act on the evidence I send?',
    'A useful handover keeps the limits within reach of the people who will bear the result.',
    ['nile.handoff.send', 'giving'], ['copies.publish', 'making'], ['council.finish', 'revising']),
  route(28, 'Which parts of a result would stay the same if someone else ran the check?',
    'Hold the conditions steady, then see which parts of the difference can be repeated.',
    ['nile.witness.compare', 'testing'], ['market.compare', 'testing'], ['island.compare', 'modelling']),
  route(29, 'Who has the authority to file, release, or pass on this account?',
    'Being able to read a public record does not grant the right to speak for everyone it names.',
    ['preserved.handoff.respond', 'staging'], ['record.edge.voices.compare', 'tracing'], ['voices.quote', 'giving']),
  route(30, 'What can a model or an imagined scene help us notice about the real case?',
    'A reconstruction can suggest several possible accounts and give us a new check to try.',
    ['stage.compare', 'rehearsing'], ['water.drought', 'modelling'], ['island.movement.deliver', 'staging']),
  route(31, 'What would make this evidence enough to take the next step?',
    'The evidence a trial needs depends on what the crew will do if the notice is wrong.',
    ['nile.workers.proof', 'rehearsing'], ['civic.rules', 'modelling'], ['council.bench', 'staging']),
  route(32, 'What should a useful explanation let someone do here?',
    'An explanation earns its place when someone can use its conditions to predict or check what happens next.',
    ['nile.routes', 'modelling'], ['stage.frames.served', 'staging'], ['island.signal', 'giving']),
  route(33, 'What earlier filing decision is still shaping what I find today?',
    'Older names and catalogues leave paths for later readers, including places a newer record needs to reopen.',
    ['preserved.proof.checked', 'cataloguing'], ['departure.archive.checked', 'investigating'], ['accession.market.read', 'giving']),
  route(34, 'What would I miss if I only looked for the result I wanted?',
    'Remember the need that brought you here and make room to check a different one.',
    ['nile.exhibit.mounted', 'staging'], ['market.terms', 'comparing'], ['water.routing.sources', 'listening']),
  route(35, 'Whose priorities did we build into this rule or performance?',
    'A record of the arrangement helps the next crew see who gets served first and who still waits.',
    ['stage.seats.o.place', 'staging'], ['civic.publish', 'staging'], ['water.publish', 'giving']),
];

export function questionWaysByObjective(): Map<string, NonNullable<Objective['questionWays']>> {
  const ways = new Map<string, NonNullable<Objective['questionWays']>>();
  for (const { question, encounters } of QUESTION_ROUTES) {
    for (const [objective, action] of encounters) {
      const row = ways.get(objective) ?? [];
      row.push({ id: question.id, action });
      ways.set(objective, row);
    }
  }
  return ways;
}
