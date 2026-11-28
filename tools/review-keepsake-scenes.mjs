// Two uses of the evidence, in the words of a reviewer. Everyone named here belongs to the fictional coat story.
import { readFileSync } from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL('../src/content/' + name, import.meta.url), 'utf8'));
const objects = read('return-coat-keepsakes.json');
const sites = new Map(read('return-coat-sites.json').map(site => [site.id, site]));
const topics = {
  'pen-tip': ['evidence', 'methods-and-tools', 'area:HIS',
    'The owner of a labelled coat can recognise the K without taking the seam apart.',
    'A keeper deciding who wore the spare must account for how a second K could be pressed into it.'],
  'date-lens': ['certainty', 'scope', 'area:HIS',
    'A clerk can put the arrival of the buttons and the entry of the price in order.',
    'A supper companion can account for particular evenings during the gap. Neither date gives a whole week of wear.'],
  'door-key': ['perspective', 'perspectives', 'area:HUM',
    'A keeper standing at the rail can see a narrow doorway that saves space.',
    'Someone reaching from a chair has to know whether they can operate the loop from inside.'],
  'moth-lamp': ['perspective', 'methods-and-tools', 'area:ART',
    'From the hall, the hanging coat and the plaster give the impression of a single wall.',
    'The changing position of the light lets a performer find an entrance the audience cannot see.'],
  'glass-piece': ['interpretation', 'methods-and-tools', 'area:NAT',
    'A borrower can recognise the pear shape on both coats at arm’s length.',
    'Turn the light sideways and a maker can distinguish a rounded button from a stamp with a flat back.'],
  'so-what': ['responsibility', 'ethics', 'theme:POL',
    'The clerk needs the deduction line to settle the outstanding fare.',
    'Kip has his own reason to keep the drawing and decide whether somebody accompanies him to the window.'],
  'check-weight': ['objectivity', 'methods-and-tools', 'area:MAT',
    'The trader can reproduce the old price per weight with the scale.',
    'The passenger owes a price per crossing. Applying the wool price to a person would change what is being measured.'],
  'brass-cog': ['evidence', 'scope', 'area:MAT',
    'The two wet pears really do establish that the stamp struck the ticket twice.',
    'One passenger can turn the cog twice. The number of impressions leaves the number of wearers open.'],
  'notice': ['interpretation', 'perspectives', 'theme:LAN',
    'A wearer reading across the line can think the obligation travels with the bundle.',
    'A keeper who recognises the stop can locate the obligation at the moment a bundle is taken in.'],
  'sign-splinter': ['values', 'perspectives', 'area:HIS',
    'Someone arriving today might reasonably expect to pay the figure on the visible tag.',
    'The layer beneath it tells a mender why people once brought damaged clothes to this same peg.'],
  'copper-pot': ['explanation', 'methods-and-tools', 'area:NAT',
    'A person under the awning can count three drops before the roof gets wet.',
    'The hand at the pipe gives a performer something that can be varied when trying to reproduce the third drop.'],
  'folded-map': ['perspective', 'scope', 'area:HUM',
    'The printed ticket tells a visitor which room normally receives a coat.',
    'A late borrower needs to know how the same hook can be reached from the street once the desk closes.'],
  'paper-frame': ['power', 'perspectives', 'area:ART',
    'A spectator can follow the grieving actor without being able to see the sponge.',
    'The worker in the wider picture has a claim on how the company tells the story of its rain.'],
  'tiny-bell': ['responsibility', 'ethics', 'theme:POL',
    'A keeper at a front desk can see who is waiting and offer a dry coat.',
    'Someone unwilling to stand in front of the queue can still be heard through the pipe.'],
  'yarn': ['truth', 'scope', 'area:HIS',
    'The stage bill can accurately record who worked the bulb during a show.',
    'A repair book can record a night when a coat came home wet. The two threads give those accounts different origins.'],
  'ferry-chalk': ['culture', 'perspectives', 'theme:LAN',
    'A cast-list reader may first look for a performer’s name beside the mark.',
    'A reader familiar with the ferry community can recognise a request to keep a place warm, independent of the latecomer’s name.'],
  'knot-rope': ['perspective', 'methods-and-tools', 'area:MAT',
    'The measured line from the wings falls short of the peg.',
    'The same length from the inside landing gives a seated borrower a working handoff. The starting point matters.'],
  'weather-glass': ['certainty', 'scope', 'area:NAT',
    'The theatre can make an indoor shower while the instrument under its roof stays steady.',
    'Kip can report the drop he saw at the hatch. Reproducing a shower in the theatre still leaves the hatch’s weather unresolved.'],
  'rumour-shard': ['justification', 'methods-and-tools', 'area:HIS',
    'A reader counting sheets sees two notices and can date the circulation of a story.',
    'A reader comparing their spelling can trace both papers to one text. Two pieces of paper may carry a single witness.'],
  'well-rope': ['power', 'perspectives', 'area:HUM',
    'The original hook suits the shoulder of the keeper who set it.',
    'A seated visitor can use the lower hook while the hem still clears the puddle. Choosing the height determines who can work alone.'],
  'survey-slip': ['objectivity', 'scope', 'area:HUM',
    'The signed returns can describe people who came to the desk.',
    'The family passing a coat through the lining was outside the form’s reach. Buying wool calls for a count of repairs too.'],
  'seal': ['justification', 'methods-and-tools', 'area:HIS',
    'The outer circle can identify a familiar Guardian design.',
    'A clerk comparing the inner cuts has grounds to question whether anybody signed this particular receipt.'],
  'thread-knot': ['interpretation', 'ethics', 'area:HIS',
    'The bill leads a keeper back to Vesper’s gift and the task it was meant to support.',
    'The giver left the next wearer unnamed. A cast member can decide how to honour that open part.'],
  'soot-jar': ['evidence', 'methods-and-tools', 'area:NAT',
    'A still handle on the public side gives a waiting visitor little reason to think the desk is open.',
    'The spring draws two arcs inside. A maker can test a lighter pull from the side that actually operates the latch.'],
};

// Check each observation against the same compiled clue, map placement, gate and receiving line exercised in the play test.
export function keepsakeScenes(pack, maps, trace) {
  const anchor = 'reveals its own observation and a particular reply at another site';
  if (!trace?.includes(anchor) || Object.keys(topics).length !== objects.length)
    throw Error('The keepsake review needs the return journey for every object.');
  return objects.map(item => {
    const site = sites.get(item.site), receiver = sites.get(item.receiver);
    const readFlag = 'returned-coat.used.' + item.id, replyFlag = 'returned-coat.reply.' + item.id;
    const field = maps[site.map].interactables.find(p => p.clue === 'returned-coat.' + site.id + '.clue');
    const bench = maps[receiver.map].interactables.find(p => p.id === 'return-coat-' + receiver.id + '-work');
    const clue = pack.clues.find(c => field && c.id === field.clue);
    const view = clue?.views.find(v => v.keepsake === item.id);
    const offer = pack.dialogue.find(n => bench && n.id === bench.node)?.options?.find(o => o.text === item.offer);
    const reply = pack.dialogue.find(n => n.id === offer?.next);
    const keepsake = pack.keepsakes.find(k => k.id === item.id);
    const recorded = (effects, flag) =>
      effects?.some(e => e.setFlag === flag && e.value === true) && effects.some(e => e.journal === 'j.' + flag);
    if (!field || !bench || site.world === receiver.world || !keepsake || !topics[item.id] ||
        !clue?.earnedViewsOnly || view?.label !== item.use || view.text !== item.reading || !recorded(view.effects, readFlag) ||
        offer?.if?.flagSet !== readFlag || reply?.id !== replyFlag || reply.speaker !== item.speaker ||
        reply.text !== item.reply || !recorded(reply.effects, replyFlag)) {
      throw Error('Missing earned observation, return gate or receiver for ' + item.id);
    }
    const [concept, framework, lens, ...views] = topics[item.id];
    const common = {
      dimensions: ['keepsake:' + item.id, 'concept:' + concept, 'framework:' + framework, lens],
      source: 'tests/return-coat.test.ts', anchor, views,
    };
    const fieldAction = {
      ...common, objective: readFlag, missionQuestion: site.question, actionId: readFlag,
      title: keepsake.name + ' at ' + site.name.toLowerCase(), world: site.world, map: site.map, target: field.id,
      story: 48, game: 170, bloom: 'apply', dok: 1, demand: item.use, consequence: item.reading,
    };
    const returnAction = {
      ...common, dimensions: [...common.dimensions, 'character:' + item.speaker],
      objective: replyFlag, missionQuestion: receiver.question, actionId: replyFlag,
      title: item.offer, world: receiver.world, map: receiver.map, target: bench.id,
      story: 15, game: 21, bloom: 'remember', dok: 1, demand: item.offer, consequence: item.reply,
    };
    return { id: item.id, name: keepsake.name, field: fieldAction, handover: returnAction };
  });
}
