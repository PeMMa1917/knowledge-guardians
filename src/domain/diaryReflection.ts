import { courierCases } from './courierLift';
import {whistlePlaces,whistleStories} from '../content/whistleWatch';
import {vaultStations,vaultWork} from '../content/vaultNight';
import { pocketStories } from '../content/pocketStories';
import { nightQuestions } from './nightRegister';
import {lastBellScenes, type LastBellSite} from '../content/lastBell';
import { watches, type WatchSite } from './watchBell';
import { lanternCase, lanternQuestions } from './lamplight';
import { inkDiaryQuestions } from './inkPost';
import authored from '../content/journal-reflections.json';
import type { AdventureDiary, DiaryEntry, DiaryNoteKind } from './types';

export interface JournalReflection {
  id: string;
  prompt: string;
  response?: string;
  earlier?: true;
}

type ReflectionSource = Pick<DiaryEntry, 'id' | 'title' | 'kind'> & {
  event?: { kind: string; key: string; outcome?: string };
};
type Questions = Readonly<Record<string, string>>;
function questPrompt(title: string) {
  return `Which part of your work in “${title}” would you show a Guardian who had just arrived?`;
}
const questionsByEntry: Readonly<Record<string, Questions>> = authored;

export function isDiaryNoteKind(value: unknown): value is DiaryNoteKind {
  return value === 'note' || value === 'reflection' || value === 'question';
}

export function diaryQuestions(entry: ReflectionSource, saved?: Readonly<Record<string, string>>): Questions {
  const key = entry.event?.key ?? entry.id;
  if(key.startsWith('trail-thread:')) return key.endsWith(':voice')
    ? {voice:'Whose account do I want to hear on my return, and what might they have missed?'}
    : {object:'Which detail would I look for next time, and what might it help me reconsider?'};
  if(key.startsWith('tideclock:')){
    if(key.startsWith('tideclock:compare:') || key.startsWith('tideclock:trace:'))
      return {criterion:'Which person’s request changes what counts as a good place for the same board?',distance:'What do the plank counts tell me, and what would I need to ask someone who used the pier?'};
    if(/:(try|issue|read|place|proposal):/.test(key))return {'shift':'Who had time to use this arrangement, and who would still need someone else to speak for them?','return':'What would you move after walking the plan at the other hour?'};
    if(/:(step|round|reorder|reverse):/.test(key))return {'procedure':'Which part of the moth’s record came from your instructions?','missing':'Where could someone have been working while this strip went past?'};
    return {'time':'Which part of this hearing would survive another turn of the clock?','place':'What might a person on a different pier hear at that same moment?'};
  }
  if(key.startsWith('ferry-wire:')){
    const act=key.split(':')[1].split('.')[0];
    if(act==='align')return {ear:'What lets me identify a reused recording?',limit:'What can those matching sounds tell me about the word itself?'};
    if(act==='pin'||act==='balance')return {mix:'Whose share of the count changed between nights?',frame:'Who might need the pooled count and who needs the two stops separately?'};
    if(act==='issue'||act==='quote')return {public:'Which part of a hearing did the listener allow me to repeat?',silence:'Whose place did my edition leave open?'};
    if(act==='invite'||act==='file')return {clock:'Whose shift was missing at the hour I chose?',next:'What time would let somebody else answer?'};
    if(act==='hear'||act==='receive')return {cost:'Who got a better hearing from this edition?',return:'What could I change for the next ferry?'};
    return {voice:'Who supplied the last word on this line?',method:'What would change if I kept the listener and changed only my question?'};
  }
  if(key.startsWith('turning-stacks:')){
    if(key.startsWith('turning-stacks:headline.'))return {notice:'What did the new first line make easiest to notice?',fixed:'Which count and denominator stayed the same?'};
    if(key.startsWith('turning-stacks:signature.'))return {work:'What work did those signatures accomplish on this page?',scope:'Whose choices are still private?'};
    if(key.startsWith('turning-stacks:glass.'))return {voice:'Which institution or Nation stands behind each leaf?',limit:'What would be lost if a single date or byline covered the pair?'};
    if(key.startsWith('turning-stacks:count.'))return {group:'Which people are in my denominator and which are outside it?',change:'What happens to the percentage when I keep the count of 115 fixed?'};
    if(key.startsWith('turning-stacks:read.'))return {owner:'Whose public account did I read, and what can this particular source establish?',reach:'What would I need a different source to investigate?'};
    if(key.startsWith('turning-stacks:bind.'))return {credit:'Whose credit would be lost if one heading covered both pages?',sequence:'What would a reader who opens the other end encounter first?'};
    if(key.startsWith('turning-stacks:reply.')||key.startsWith('turning-stacks:open.'))return {neighbour:'Which visitor needed the light somewhere else?',listen:'Whose account could help me change the display again?'};
    return {view:'What could someone who came in through the other door see first?',model:'Which part of the walk could the little model never show?'};
  }
  if(key.startsWith('lens-loan:')){
    const act=key.split(':')[1].split('.')[0];
    if(act==='unroll'||act==='margin')return {reach:'What guaranteed a return for every grid square?',new:'Which claim about the light could a new rehearsal change?'};
    if(act==='fitCard')return {source:'Which number would I enter for the body if I had seen only the case?',absence:'Which part of the instrument’s history is still missing?'};
    if(act==='register'||act==='pan'||act==='frame')return {field:'Which squares could I account for from both views?',edge:'What was outside the frame when I first decided what the shape was?'};
    if(act==='isolate'||act==='cover'||act==='turn')return {control:'Which part moved when I turned one fitting at a time?',limit:'What could still come from the holder?'};
    if(act==='blend'||act==='trace'||act==='slide')return {trace:'Which marks did both slips let me compare?',preparation:'How could preparing the study have changed what I saw?'};
    if(act==='forecast'||act==='rehearse'||act==='entrust')return {model:'Which seat could tell the two drawings apart?',use:'What would make me trust a drawing to call an entrance or explain the light?'};
    if(act==='print'||act==='lamp'||act==='listen')return {audience:'Which seat would I choose if I wanted to see why the entrance mattered to someone else?'};
    if(act==='travel')return {edition:'What could the company reconstruct from the two slips I actually sent?'};
    return {choice:'What did my two fittings let me try, and which other pair would I want beside them?'};
  }
  if(key.startsWith('first-cup:')){
    if(key.startsWith('first-cup:passers.'))return {missing:'What would happen to my conclusion if I entered zero for every absent offer?',voice:'Whom would I need to ask before setting a price for this whole street?'};
    if(key.startsWith('first-cup:tip.'))return {bench:'Who had a chance to make an offer and who passed the cart?',person:'Which two individual offers complicate the pattern in the crew?'};
    if(key.startsWith('first-cup:serve.'))return {distance:'Who could decide from the far end of the street?',voice:'Whose reason would I need to hear in their own words?'};
    if(key.startsWith('first-cup:hang.'))return {meaning:'What can I do about a systematic error in a dial that I cannot do to another person’s offer?',case:'Which person’s account would I lose if I treated the two kinds of bias alike?'};
    if(key.startsWith('first-cup:unfold.'))return {reason:'What could I learn from one person’s note that the crew average left out?'};
    if(key.startsWith('first-cup:readTin'))return {tin:'Which detail belongs to the surviving tin and which would require a different witness?'};
    if(key.startsWith('first-cup:taste.')||key.startsWith('first-cup:compareGauge'))return {instrument:'What changed when the two dials stood in the same shade?',change:'Which difference could still come from the journey?'};
    return {hands:'Whose hands was I making this cup for?',model:'Where might the street behave differently from Kit’s mixing rule?'};
  }
  if (key.startsWith('street-almanac:')) {
    const [, object, act] = key.split(':');
    if (act === 'turn') {
      const gap: Record<string,string> = {
        stone:'What could someone have checked before the slab broke that I can only ask about now?',
        report:'Whose action can I date from the handwriting on this card?',
        volume:'Which part of a reading experience can travel in a scan?',
        shell:'Whose name can be traced on the gift receipt, and whose name would I still need to ask about?'
      };
      return {holding:gap[object] ?? 'What event does the date on this leaf belong to?'};
    }
    if(act==='send'||act==='perform') return {date:'Whose anniversary did my caption make public?',access:'What could someone at the far window change about the next performance?'};
    return {cue:'Which beats reached just one listener?',revision:'If I moved one cue, who would notice?'};
  }
  if (key.startsWith('courier:')) {
    const [shape, action, place, , opening] = key.slice('courier:'.length).split('.');
    const record = courierCases.find(c => c.shape === shape);
    if (record) {
      const q = record.questions;
      if (place === 'market' || place === 'theatre') {
        return action === 'receive' && opening === 'person'
          ? { person: q.person, landing: q[place] }
          : { mark: q.mark, landing: q[place] };
      }
      return { mark: q.mark, person: q.person };
    }
  }
  if(key.startsWith('origin-work:')){
    if(key.includes('.send.')||key.includes('.return.'))return {who:'Who gained a place in the work because of my choice?',cost:'Who still had to ask or wait?'};
    if(key.startsWith('origin-work:archive'))return {lens:'What did an empty drawer tell the visitor? What did it leave open?'};
    if(key.startsWith('origin-work:traveller'))return {lens:'Which person did my cord select, and at what moment?'};
    if(key.startsWith('origin-work:harbour'))return {lens:'Which missing detail mattered most to the person at the far end?'};
    if(key.startsWith('origin-work:workshop'))return {lens:'Which other comparison could change my account of the curled edge?'};
    return {lens:'What could a listener hear about the fourth verse that the singer did not say aloud?'};
  }
  if (key.startsWith('giant-elbow:')) {
    const act = key.slice('giant-elbow:'.length).split('.')[0];
    if (act === 'hinge') return {chain:'Which measurement predicted what happened at the chain?',ribbon:'How did Vee change what a missed catch could mean to the audience?'};
    if (act === 'hang' || act === 'fit' || act === 'patch' || act === 'cast') return {
      arm: 'Whose little hand was hardest to fit under my pattern?', number: 'What stayed hidden when Pip told me only the average reach?'};
    if (act === 'pledge' || act === 'stamp' || act === 'sheet' || act === 'print') return {
      draw: 'Which part of the result depended on the direction I pinned before looking?', hinge: 'What mattered to the puppeteer that the count of rare draws could not tell her?'};
    return {credit:'Whose contribution could an audience member recognise from the face of the cuff I showed?', sister:'How might Pip and Vee remember the same entrance differently?'};
  }
  if(key.startsWith('tally-tray:')) return {doors:'Which tray could I take to six separate doors?',measure:'What stays equal when I switch between two untouched trays?'};
  if (key.startsWith('moth-perch:home:')) return {
    place: 'What made me move our resting place or keep it here?',
    companion: 'What might my companion notice in a room I have already visited?',
  };
  if(key.startsWith('moth-perch:'))return {watch:'Which part of the moth’s visit did I actually see?',next:'Which one thing could I change at this same perch to check my hunch?'};
  if (key.startsWith('picture-bill:')) return {part:'What did each object let the audience discover that the other two could not?', order:'How did the first image or question affect the way I understood the final act?'};
  if(key.startsWith('petal-ribbon:'))return {world:'What did the landing do to the promise on my ribbon?',craft:'What made the new gesture worth keeping even when a promise failed?'};
  if(key.startsWith('petal-gear:'))return {change:'What could my roller still tell the cast after I changed its face?',loss:'Which movement would become misleading if it used a different kind of number?'};
  if(key.startsWith('petal-window:tape.'))return {hour:'Which other feature changed when I switched the flowers?',test:'What would a second pair of watches allow me to compare?'};
  if(key.startsWith('petal-window:reading.'))return {print:'Which feature came from the flower crop and which from the gain?',bee:'What could the slip tell me about a bee before I watched one land?'};
  if(key.startsWith('petal-window:silk')||key.startsWith('petal-window:garden'))return {who:'Who could make a new move in this version of the show?',cost:'What did the audience give up to let them do that?'};
  if(key.startsWith('petal-window:'))return {lens:'What did I change about the instrument or the ledge, and what stayed the same?'};
  if (key.startsWith('picture-ferry:')) return {
    window: 'What could a passenger at the other window see that I missed?',
    record: 'Which part of my account could I check against the print or its collection ticket?',
  };
  if (key.startsWith('plum:mould:')) return {join:'Which notch let me tell a pair from a ridge on this draw?',hand:'What changed when I adjusted my hand and kept the wood the same?'};
  if (key.startsWith('plum:bar:')) return {room:'Which player could feel my last bar, and who could hear it?',wait:'What might I miss if I decided in advance how long an answer should take?'};
  if (key.startsWith('plum:press:') || key.startsWith('plum:slide:')) return {contact:'What could I learn from the part that moved or sprang back?',neighbour:'Which neighbouring face would I trace next?'};
  if (key.startsWith('plum:')) return {turn:'Which part of the chest kept the same neighbour after my turn?'};
  if (key.startsWith('choice:plum.verse:') || key.startsWith('choice:plum.pia:')) return {fruit:'Which part of the song did my version make easier to perform?',word:'What did the audience supply that the original words left open?'};
  if (key.startsWith('choice:plum.cart:') || key.startsWith('choice:plum.grove:') || key.startsWith('choice:plum.commission:')) return {care:'Who does the work of making this performance possible now?',seat:'What would the last person to receive my signal tell the front row?'};
  if (key.startsWith('supper:')) return {edge:'Which part of the scene could another arrangement produce too?',source:'What would I need to know about Thursday to carry this finding back to that meal?'};
  if(key.startsWith('whistle:')){const site=whistlePlaces.find(p=>key.startsWith('whistle:'+p.id+':'));if(site){const [basis,visitor]=whistleStories[site.id].questions;return {basis,visitor};}}
  if(key.startsWith('field-loan:press:'))return {edge:'Which part of the claim changed when I put it in a smaller space?',reader:'Who can still find the rest of it?'};
  if(key.startsWith('field-loan:stage:'))return {seat:'What could each seat know before the other gave its cue?',reply:'Which difference did a second signal actually resolve?'};
  if(key.startsWith('field-loan:dispatch:'))return {street:'What could a caller infer just by seeing the strap?',care:'Who gets to decide what travels outside the bag?'};
  if(key.startsWith('field-loan:fern:'))return {wet:'What did the wet seam change about the evidence I could show?',date:'Which date would the next watcher need to check before using my roll?'};
  if(key.startsWith('birdside:')) return {before:'Which end of the bird’s flight did I treat as evidence of land?',after:key.includes('squall')?'What further observation could distinguish the two ledges?':'What happened to my inference when the direction stayed fixed and the hour changed?'};
  if(key.startsWith('weir-lamp:')) return {before:'Who could have read the first sheet at the time?',after:'Which part of the later account depends on knowing how high the water rose?'};
  if(key.startsWith('vault:')){const who=vaultStations.find(id=>key.startsWith('vault:'+id+':')); if(who){const [trace,after]=vaultWork[who].reflections;return {trace,after};}}
  if (key.startsWith('mill:lamplight.nile.')) return {rule:'Who could make an entry in each book?',pay:'Which kind of work would somebody miss if they saw only the settlement?'};
  if (key.startsWith('mill:lamplight.yard.')) return {trial:'What changed when the same four movements were tried by another shift?',limit:'Which part of the old morning can the model never witness?'};
  if (key.startsWith('mill:lamplight.press.')) return {voice:'Which hand is easiest to hear in this edition?',repair:'What could another worker bring you that would change the next edition?'};
  if (key.startsWith('maker-trial:')) return {reference:'Which mark belonged to the reference, and which one came from your tool?', hand:'What would another worker need to repeat your reading?'};
  if (key.startsWith('maker-field:')) {
    const [,field]=key.split(':');
    if (field==='rain') return {place:'What would a worker upstream have to check before using this cup’s reading?'};
    if (field==='tower') return {joint:'How far up the tower does the old mark let your claim reach?'};
    if (field==='flood-post') return {hand:'What could the printer read from the post alone?', voice:'Which part needed Venn’s name beside it?'};
  }
  if (key.startsWith('coat-tracing:')) {
    const [,ref,move] = key.split(':');
    const guest = lanternCase(ref);
    if (guest) return {
      guest:guest.person.question,
      margin:move.startsWith('unfold') ? 'What can this piece contribute that the one sewn on top cannot?' : 'Where would a comparison help this keeper, and where would they need evidence from their own shift?',
    };
  }
  if (key.startsWith('coat:')) {
    const [, site, action] = key.split(':');
    if (Object.hasOwn(pocketStories,site)) return action === 'pull' || action === 'recheck'
      ? { fitting: pocketStories[site].question, trial: 'Which detail stayed the same when you changed the fitting?' }
      : { reader: pocketStories[site].question };
  }
  const register = nightQuestions(key);
  if (register) return register;
  const watch = /^night-watch\.(gate|dispatch):/.exec(key);
  if (watch) {
    const question = watches[watch[1] as WatchSite].question;
    // The original prompts and their IDs keep reflections written before this journey readable.
    return entry.event?.kind === 'choice'
      ? {choice: `Looking back at “${entry.title}”, who could use the option you chose? Who might need something different?`, watch: question}
      : {tool: `Which part of “${entry.title}” would you repeat if another keeper wanted to check your reading?`, watch: question};
  }
  const bell = /^last-bell\.(voices|island|council):/.exec(key);
  if (bell) {
    const [evidence, people] = lastBellScenes[bell[1] as LastBellSite].prompts;
    return {evidence, people};
  }
  const ink = lanternQuestions(key) ?? inkDiaryQuestions(key);
  if (ink) return ink;
  if (Object.hasOwn(questionsByEntry, key)) {
    const questions = questionsByEntry[key];
    // A student may already have answered the earlier general question on this quest.
    if (key.startsWith('quest:') && saved && Object.hasOwn(saved, 'quest') && !Object.hasOwn(questions, 'quest')) {
      const retained: Record<string, string> = { quest: questPrompt(entry.title) };
      for (const [id, prompt] of Object.entries(questions)) {
        if (Object.hasOwn(saved, id)) retained[id] = prompt;
      }
      for (const [id, prompt] of Object.entries(questions)) {
        if (Object.keys(retained).length >= 3) break;
        retained[id] = prompt;
      }
      return retained;
    }
    return questions;
  }
  const title = entry.title;
  const event = entry.event?.kind ?? entry.kind;
  switch (event) {
    case 'arrival':
      return { arrival: `What first caught your eye at ${title}, and where did it lead you?` };
    case 'route':
      return { route: entry.event?.outcome === 'blocked'
        ? `What could you check next before trying “${title}” again?`
        : `On the way to ${title}, what would you point out to someone taking the route for the first time?` };
    case 'conversation':
      return { conversation: `Looking back at “${title}”, what would you ask before taking that account to another person?` };
    case 'sign':
      return { sign: `Where would you stand to check that the reader of “${title}” can follow it?` };
    case 'inspection':
      return { inspection: `What could you point out directly on “${title}” to someone who had only read its description?` };
    case 'choice':
      return { choice: `Looking back at “${title}”, who could use the option you chose? Who might need something different?` };
    case 'tool':
      return { tool: `Which part of “${title}” would you repeat if another keeper wanted to check your reading?` };
    case 'finding':
      return { finding: `Where would you take “${title}” if you wanted to find out who used it or what it could do?` };
    case 'correction':
      return { correction: `After “${title}”, what would you check to see whether the person affected got the update?` };
    case 'quest':
      return { quest: questPrompt(title) };
    default:
      if (entry.id.startsWith('place:')) return { arrival: `What first caught your eye at ${title}, and where did it lead you?` };
      if (entry.id.startsWith('thread:')) return { thread: `Where on “${title}” did you want to ask who left the next record?` };
      return { revisit: `What part of “${title}” might be worth a second look?` };
  }
}

const noteQuestions: Record<DiaryNoteKind, Questions> = {
  note: { 'note-return': 'What would you add to this note after another visit?' },
  reflection: { 'reflection-return': 'What would you want to notice if this happened again?' },
  question: { 'question-return': 'Where might you look next for something that could change this question?' },
};

export function diaryNoteQuestions(kind: DiaryNoteKind): Questions {
  return noteQuestions[kind];
}

export function journalReflections(diary: AdventureDiary, entry: string, questions: Questions): JournalReflection[] {
  const all = diary.reflectionResponses ?? {};
  const responses = Object.hasOwn(all, entry) ? all[entry] : undefined;
  return Object.entries(questions).map(([id, prompt]) => {
    const response = responses?.[id];
    // Older saves can contain answers to the former prompt and all three current ones.
    if (id === 'quest' && Object.keys(questions).length > 3 && response !== undefined) {
      return { id, prompt, response, earlier: true };
    }
    return response === undefined ? { id, prompt } : { id, prompt, response };
  });
}
