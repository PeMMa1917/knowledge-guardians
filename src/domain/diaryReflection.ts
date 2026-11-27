import { lanternQuestions } from './lamplight';
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
