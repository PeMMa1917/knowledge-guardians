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
