import type { CampaignState, Effect } from './types';

export interface Passage {
  name: string;
  hall: string;
  arrived: string;
  finish: string;
  delegate: string;
  testimony: string;
}

// The archive and Emberford share one chapter. A visit to the Nexus between two doors
// belongs to the hub, so it never wipes out the world remembered by the next visitor.
export const PASSAGES: Passage[] = [
  ['Emberford and the Nexus','nexus.archive','talked.ise','m02.o8.ise','Kip','I still have the draft we nearly hung. I can show the scrape where we took a word back.'],
  ['Nile Archive','nile.hall','nile.arrived','nile.return','Imani','I kept both dates. The space between them was part of what happened.'],
  ['Cold Store','preserved.archive','preserved.arrived','preserved.publish','Odile','My family had to live with a blank in that file. You left us room to write beside it.'],
  ['Observatory Coast','observatory.harbour','coast.arrived','coast.revise','Ruan','I have brought the old signal as well as the correction. You ought to see how alike they look from shore.'],
  ['Living Forest','forest.station','forest.arrived','forest.finish','Ayla','Listen first. A bird answering its own echo once counted as two birds on my sheet.'],
  ['Metalworks','metalworks.yard','metal.arrived','metal.finish','Corra','Feel the nick in this sample. A buyer can run our test again. That matters more to me than the stamp.'],
  ['City of Copies','copies.archive','copies.arrived','copies.revise','Mina','One of my borrowers found the missing line. Put a chair at the table for the next reader.'],
  ['Cartographers’ Sea','sea.harbour','sea.arrived','sea.finish','Sora','My crew still sails past the blank on that chart. I will tell you what we do there.'],
  ['House of Performance','stage.foyer','stage.arrived','stage.finish','Hari','Stand where the last usher stands. Then decide whether the people at the back heard the same thing.'],
  ['Market of Measures','market.square','market.arrived','market.finish','Dagny','I brought the empty basket. We used to charge somebody for its weight every time.'],
  ['Water Commons','water.gatehouse','water.arrived','water.finish','Omi','Both banks drank from our decision. Only one bank got to name it on the order.'],
  ['Civic Machine','civic.dispatch','civic.arrived','civic.finish','Lin','I walked the street our rule had missed. I wrote down the house numbers on my cuff.'],
  ['Archive of Voices','voices.listening','voices.arrived','voices.finish','Wren','There is a breath between those takes. Leave it in when you play them here.'],
  ['Island of Models','island.workshop','island.arrived','island.finish','Vesper','I had a stamp in my pocket when the crates landed. For once I left it there.'],
  ['Council of Inquiry','council.hall','council.arrived','council.finish','Kip','There are pencil sharpenings on every seat. Somebody expects us to make changes.'],
].map(([name,hall,arrived,finish,delegate,testimony]) => ({name,hall,arrived,finish,delegate,testimony}));

export function passed(s: CampaignState, chapter: number, completed?: ReadonlySet<string>): boolean {
  const id = PASSAGES[chapter - 1].finish;
  return Boolean(completed?.has(id) ?? s.objectivesDone.includes(id)) || (chapter === 2 && s.flags['nile.returned'] === true);
}

export function corridorOpen(s: CampaignState, chapter: number, completed?: ReadonlySet<string>): boolean {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 15) return false;
  const done = (n: number) => passed(s, n, completed);
  if (chapter === 1) return true;
  if (chapter === 2) return done(1) && s.flags['study.letter'] === true;
  if (chapter <= 8) return done(2);
  if (chapter <= 10) return [3,4,5,6,7,8].filter(done).length >= 3;
  if (chapter === 11) return done(9) && done(10);
  if (chapter <= 14) return done(11);
  return PASSAGES.slice(0,14).every((_, i) => done(i + 1) && s.flags['temple.gift.' + (i + 1)] === true);
}

export function routeOrder(s: CampaignState): number[] {
  const stored = s.flags['corridor.order'];
  if (typeof stored === 'string') return stored.split(',').map(Number).filter(n => n >= 1 && n <= 15);
  // Older campaigns followed the original linear corridor. Side rooms alone do not establish an arrival.
  return PASSAGES.flatMap((p,i) => s.flags['visited.map.' + p.hall] || passed(s,i+1) ? [i+1] : []);
}

export function corridorArrival(s: CampaignState): Effect[] {
  const n = PASSAGES.findIndex(p => p.hall === s.mapId) + 1;
  if (!n) return [];
  const order = routeOrder(s);
  const effects: Effect[] = [];
  if (n > 1 && !s.flags[PASSAGES[n-1].arrived])
    effects.push({setFlag:PASSAGES[n-1].arrived,value:true});
  if (!order.includes(n)) {
    if (order.length) effects.push({ setFlag: 'corridor.from.' + n, value: s.flags['corridor.last'] ?? order[order.length-1] });
    order.push(n);
  }
  if (!s.flags['corridor.order'] || String(s.flags['corridor.order']) !== order.join(','))
    effects.push({setFlag:'corridor.order',value:order.join(',')});
  if ((n > 1 || !s.flags['corridor.last']) && n !== s.flags['corridor.last'])
    effects.push({setFlag:'corridor.last',value:n});
  return effects;
}

export function ribbon(s: CampaignState): string {
  const names = routeOrder(s).map(n => PASSAGES[n-1].name);
  return names.length ? names.join(' → ') : 'The brass pegs have room for your first journey.';
}

export function openDestinations(s: CampaignState): string[] {
  return PASSAGES.flatMap((p,i) => corridorOpen(s,i+1) && !passed(s,i+1) ? [p.name] : []);
}

export function delegations(s: CampaignState): Passage[] {
  const free = routeOrder(s).filter(n => n >= 3 && n < 15);
  return [...new Set([free[0], free[free.length-1]])].filter(Boolean).map(n => PASSAGES[n-1]);
}

const welcomes: Record<number,string> = {
  3: 'Give me your coat. The stove is the one thing here with no catalogue number.',
  4: 'I can lend you the dry half of my signal book. The half with the weather in it got wet.',
  5: 'Stay by me a minute. I want to hear what the birds do when we both stop walking.',
  6: 'Hold out your hands. Good. My spare gloves will fit you.',
  7: 'Mind the ink on that chair. Somebody sat on the correction before it dried.',
  8: 'I left a bit of land blank for you. Come see it from my boat before you fill it in.',
  12: 'Walk the last street with me. The route slip ends a house too early.',
  13: 'Come inside. I saved the bit of the recording where nobody speaks.',
  14: 'Take the little crate. I promised the ferryman we would try this with weight in our hands.',
};

export function arrivalLine(chapter: number, s: CampaignState): string {
  const previous = PASSAGES[Number(s.flags['corridor.from.' + chapter])-1];
  return previous && welcomes[chapter] ? 'You came by way of ' + previous.name + '? ' + welcomes[chapter] : '';
}

export function letterPostscript(s: CampaignState): string {
  const last = PASSAGES[Number(s.flags['corridor.last'])-1];
  if (!last) return '';
  const open = openDestinations(s);
  return 'P.S. My copy is postmarked ' + last.name + '. ' + (open.length
    ? 'The runner has envelopes for ' + open.join(', ') + '. Which should I give her first?'
    : 'The runner has put down her satchel. I owe her a cup of tea.');
}
