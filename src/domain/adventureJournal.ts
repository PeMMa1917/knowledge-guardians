import { crossingOf, crossingWay } from './crossings';
import { RUMOURS } from './rumours';
import { personalise } from './player';
import { LOYALTY } from './loyalty';
import { DISPATCH_DESKS, dispatchFlag, dispatchSlip } from './tiles';
import { specimenReferences, type SpecimenReference } from './specimenReferences';
import { encyclopediaForDiaryEvent, encyclopediaLinks, type EncyclopediaLink } from './encyclopedia';
import { earlierViews } from '../content/earlierViewing';
import { STAR_PATHS } from '../content/starPaths';
import { STAR_METHODS, starFlag } from './starPaths';
import { commandDiaryEvent, diaryEvent, type DiaryEntryDraft } from './adventureEvents';
import type { Command, GameEvent } from './engine';
import { diaryNoteQuestions, diaryQuestions, journalReflections, type JournalReflection } from './diaryReflection';
export type { JournalReflection } from './diaryReflection';
import type {
  AdventureDiary, CampaignState, ContentPack, DialogueNode, DialogueOption, DiaryEntry, DiaryNoteDetails, DiaryPortfolioWriting,
  DiaryNoteKind, Effect, Mission, Objective,
} from './types';

type EntryDraft = Omit<DiaryEntryDraft, 'repeat'>;
type VisibleObjective = Objective & { mission: Mission; complete: boolean };

export interface JournalQuest {
  id: string;
  title: string;
  question: string;
  steps: string[];
}

export interface JournalNote extends DiaryNoteDetails {
  index: number;
  text: string;
  reflections?: JournalReflection[];
  draft?: true;
}

export type JournalEntry = EntryDraft & { at: string | null; mapId: string | null; reflections?: JournalReflection[]; encyclopedia?: EncyclopediaLink };

export interface AdventureJournalView {
  name: string;
  entries: JournalEntry[];
  notes: JournalNote[];
  portfolioWriting?: readonly JournalPortfolioWriting[];
  quests: JournalQuest[];
  references: SpecimenReference[];
  encyclopedia: EncyclopediaLink[];
}

export interface JournalPortfolioWriting extends DiaryPortfolioWriting {
  id: string;
}

export function diaryNoteKind(text: string): DiaryNoteKind {
  if (/^Question for Sefa:/i.test(text)) return 'question';
  if (/^(Reflection|Campfire log):/i.test(text)) return 'reflection';
  return 'note';
}

export function newAdventureDiary(notes: readonly string[] = []): AdventureDiary {
  return {
    entries: [],
    noteDetails: notes.map((text) => ({ kind: diaryNoteKind(text), at: null, mapId: null, resolved: false })),
    reflectionResponses: {},
    noteDraft: null,
    portfolioWriting: {},
  };
}

function firstPerson(text: string): string {
  return /^(I\b|My\b|We\b|Our\b)/.test(text) ? text : `I recorded this in my journal. ${text}`;
}

function objectiveEntries(pack: ContentPack) {
  return pack.missions.flatMap((mission) => mission.objectives.map((objective) => ({ mission, objective })));
}

function objectiveDraft(pack: ContentPack, mission: Mission, objective: Objective): EntryDraft {
  const journalEffect = objective.onComplete?.find((effect) => 'journal' in effect);
  const note = journalEffect && pack.journal.find((row) => row.id === journalEffect.journal);
  return diaryEvent(`quest:${objective.id}`, 'quest', objective.id, mission.title,
    note ? firstPerson(note.text) : `I finished the step “${objective.title}” in ${mission.title}.`);
}

function authorEntryId(effect: Effect): string[] {
  return 'journal' in effect ? [effect.journal] : [];
}

function journalDraft(pack: ContentPack, id: string): EntryDraft | undefined {
  const note = pack.journal.find((row) => row.id === id);
  if (note) return diaryEvent(`record:${id}`, 'finding', id, 'From my field notes', firstPerson(note.text));
}

/** Record deliberate dialogue selections, including leaving something as it is. */
export function diaryDialogueChoice(pack: ContentPack, node: DialogueNode, option: DialogueOption, index: number, player: CampaignState['player']): DiaryEntryDraft {
  const person = pack.characters.find((character) => character.id === node.speaker)?.name;
  return diaryEvent(`choice:${node.id}:${index}`, 'choice', node.id, person ? `With ${person}` : 'A choice on the road',
    `I chose “${personalise(option.text, player)}”${person ? ` when I spoke with ${person}` : ''}.`, {}, 'after-break');
}

function recordedDecision(cmd: Command, previous: CampaignState, next: CampaignState): EntryDraft | undefined {
  if (cmd.type === 'SendTileDispatch' || cmd.type === 'ReceiveTileDispatch') {
    const flag = dispatchFlag(cmd.desk, cmd.slip);
    const slip = dispatchSlip(cmd.slip);
    if (!slip || previous.flags[flag] === next.flags[flag]) return;
    const desk = DISPATCH_DESKS[cmd.desk];
    return cmd.type === 'SendTileDispatch'
      ? { id: flag + ':sent', kind: 'choice', title: `${slip.name} dispatch`,
        text: `I sent the two halves of the ${slip.name.toLowerCase()} slip to the ${desk}. ${slip.limit}` }
      : { id: flag + ':received', kind: 'experience', title: `${slip.name} at the ${desk}`,
        text: `I carried the reading and its limit to the desk. ${slip[cmd.desk]}` };
  }
  if (cmd.type !== 'SetFlag' || previous.flags[cmd.flag] === next.flags[cmd.flag]) return;
  if (cmd.flag.startsWith('earlier-viewing.') && cmd.flag.endsWith('.layout')) {
    const record = earlierViews.find(({ flag }) => cmd.flag === `${flag}.layout`);
    const pick = record?.placements[cmd.value === 'single' ? 0 : cmd.value === 'paired' ? 1 : -1];
    if (record && pick) return { id: `layout:${record.flag}:${cmd.value}`, kind: 'choice', title: record.title,
      text: `I chose “${pick.label}”. ${pick.after}` };
  }
  if (cmd.flag.startsWith('star-path.') && cmd.flag.endsWith('.checked')) {
    for (const path of STAR_PATHS) for (const skill of path.skills) {
      const flag = starFlag(path, skill);
      if (cmd.flag !== `${flag}.checked`) continue;
      const pick = skill.choices[STAR_METHODS.findIndex((method) => method === cmd.value)];
      if (pick) return { id: `layout:${flag}:${cmd.value}`, kind: 'choice', title: skill.name,
        text: `I checked what happened after I chose “${pick.label}”. ${pick.result}` };
    }
  }
  if (cmd.flag.startsWith('cross.')) {
    const id = cmd.flag.slice('cross.'.length);
    const crossing = crossingOf(id);
    const way = crossingWay(next.flags, id);
    if (crossing && way) return {
      id: `crossing:${id}:${way.id}`, kind: 'choice', title: crossing.title,
      text: `I chose “${way.text}” The result was recorded in the crossing. “${way.result}”`,
    };
  }
  if (cmd.flag.startsWith('loyalty.')) {
    const pledge = LOYALTY.find((entry) => cmd.flag === `loyalty.${entry.id}`);
    const choice = pledge?.choices.find((entry) => entry.id === cmd.value);
    if (pledge && choice) return {
      id: `loyalty:${pledge.id}:${choice.id}`, kind: 'choice', title: pledge.title,
      text: `I chose “${choice.text}” ${pledge.who} replied, ${choice.reply}`,
    };
  }
}

function experienceDraft(pack: ContentPack, previous: CampaignState, cmd: Command, event: GameEvent): DiaryEntryDraft | undefined {
  switch (event.kind) {
    case 'label': {
      if (cmd.type !== 'BuildLabel') break;
      const wasFrayed = Number(previous.flags[`label.${cmd.kit}.tries`] ?? 0) > 0 && previous.flags[`label.${cmd.kit}.holds`] === false;
      return diaryEvent(`label:${cmd.kit}:${cmd.subject}:${cmd.criterion}:${cmd.limit}:${event.result.holds}`,
        wasFrayed && event.result.holds ? 'correction' : 'choice', cmd.kit, pack.labelKits.find((kit) => kit.id === cmd.kit)?.title ?? 'A label I tried',
        `I set up a label that read “${event.result.text}” ${event.result.holds ? 'It held.' : 'The Fray stayed on the label.'} ${event.result.heard}`,
        { outcome: event.result.holds ? 'checked' : 'tried' }, 'always');
    }
    case 'lock':
      return diaryEvent(`lock:${event.lock}:${event.result.opened}`, 'tool', event.lock, 'At the title lock',
        `I set the rings to “${event.result.question}” ${event.result.lines.join(' ')}`, { outcome: event.result.opened ? 'checked' : 'tried' }, 'always');
    case 'fray':
      return diaryEvent(`fray:${event.id}`, 'finding', event.id, event.name, `I met this Fray. ${event.error}`);
    case 'compare':
      return diaryEvent('forge:assay', 'tool', 'forge', 'Checking the billet and blade',
        `I compared the billet with the blade. ${event.line}`, { outcome: event.match ? 'checked' : 'tried' }, 'always');
    case 'forge':
      return diaryEvent(`forge:${cmd.type === 'Forge' ? cmd.action : 'test'}`, 'tool', 'forge', 'At Hesper’s forge', event.line, { outcome: 'tried' }, 'always');
    case 'clue':
      return diaryEvent(`clue-view:${event.clue}:${event.keepsake}`, 'tool', event.clue, 'A new view of a clue',
        `I used a keepsake to look again. ${event.text}`, { outcome: 'checked' }, 'after-break');
    case 'craft':
      return diaryEvent(`craft:${event.recipe}`, 'tool', event.recipe, 'At the workbench', event.why, { outcome: event.ok ? 'checked' : 'tried' }, 'always');
    case 'reading':
      return diaryEvent(`reading:${event.reading}`, 'tool', event.reading, 'A reading I took', event.why, { outcome: event.ok ? 'checked' : 'tried' }, 'always');
    case 'yarn':
      return diaryEvent(`board:${event.board}:${event.claim}:${event.card}`, 'tool', event.board, 'At the clue board', event.text, { outcome: event.done ? 'checked' : 'tried' }, 'after-break');
    case 'alcove':
      return diaryEvent(`alcove:${event.alcove}:${event.stage}`, 'tool', event.alcove, 'At the exhibition alcove', event.text, { outcome: 'tried' }, 'always');
    case 'seal':
      return diaryEvent(`seal:${event.seal}`, 'tool', event.seal, 'Checking the seal', event.why, { outcome: event.ok ? 'checked' : 'tried' }, 'always');
    case 'boss':
      return diaryEvent(`vault:${event.phase}`, 'tool', 'vault', 'At the vault', event.why, { outcome: event.ok ? 'checked' : 'tried' }, 'always');
    case 'rest':
      return diaryEvent(`rest:${previous.mapId}`, 'route', previous.mapId, event.place, `I rested at the Waystone in ${event.place}.`, {}, 'after-break');
    case 'hint':
      return diaryEvent(`hint:${event.hint.objective}:${event.hint.depth}`, 'tool', event.hint.objective, 'Help from Lumen',
        `I asked Lumen for help. ${event.hint.text}`, {}, 'after-break');
    case 'showdown': {
      const showdown = pack.showdowns.find((record) => record.id === event.state.id);
      if (!showdown) break;
      if (cmd.type !== 'ShowdownMove') break;
      const lines = event.state.log.slice(previous.showdown?.log.length ?? 0);
      const spoken = lines.map((line) => `${line.who === 'player' ? 'I said or did this. ' : ''}${line.text}${line.why ? ` ${line.why}` : ''}`).join(' ');
      if (event.state.outcome) {
        const outcome = showdown.outcomes[event.state.outcome].text;
        return diaryEvent(`showdown:${event.state.id}:${event.state.outcome}:${event.state.claim ?? ''}`,
          'tool', showdown.id, showdown.title, spoken.includes(outcome) ? spoken : `${spoken || 'I took part in the Showdown.'} ${outcome}`,
          { outcome: 'checked' }, 'always');
      }
      if (spoken) return diaryEvent(`showdown-move:${showdown.id}:${cmd.move.move}`, 'choice', showdown.id, showdown.title, spoken, {}, 'always');
      break;
    }
    case 'thread': {
      if (cmd.type !== 'FollowThread') break;
      const thread = pack.threads.find((row) => row.id === cmd.thread);
      return diaryEvent(`thread:${cmd.thread}:${event.node}`, 'tool', cmd.thread, thread?.title ?? 'A provenance trail',
        `I followed the Provenance Thread. ${event.text}${event.gap ? ` ${event.gap}` : ''}`, { outcome: 'checked' }, 'after-break');
    }
    case 'rumour': {
      const rumour = RUMOURS.find((r) => r.id === event.rumour);
      if (!rumour) break;
      if (cmd.type === 'RouteRumour' && event.ok) {
        const action = rumour.handoffs[cmd.desk].action;
        return diaryEvent(`rumour:${rumour.id}:${cmd.desk}`, 'choice', rumour.id, rumour.title,
          `I chose to ${action[0].toLowerCase()}${action.slice(1)}. ${event.why}`, {}, 'after-break');
      }
      return diaryEvent(`rumour-review:${rumour.id}`, 'tool', rumour.id, rumour.title, event.why, { outcome: event.ok ? 'checked' : 'tried' }, 'after-break');
    }
    case 'simulation': {
      const { fairTest, pen, surface, note } = event.result;
      return diaryEvent(`simulation:${pen}:${surface}`, 'tool', 'marking-test', 'The workshop marking test',
        `${fairTest ? 'I changed one thing in a marking test and compared the new mark.' : 'I tried another setup at the marking bench.'} ${note}`,
        { outcome: fairTest ? 'checked' : 'tried' }, 'always');
    }
    case 'puzzle':
      return diaryEvent(`puzzle:${event.puzzle}`, 'tool', event.puzzle, pack.puzzles.find((row) => row.id === event.puzzle)?.title ?? 'A tool I used',
        `I used the puzzle tool and recorded what happened. ${event.text}`, { outcome: event.ok ? 'checked' : 'tried' }, 'always');
    case 'secret':
      return diaryEvent(`secret:${event.id}`, 'finding', event.id, event.name, `I found ${event.name}.`);
    case 'keepsake':
      return diaryEvent(`keepsake:${event.id}`, 'finding', event.id, event.name, `I found a keepsake called “${event.name}”.${event.use ? ` ${event.use}` : ''}`);
    case 'lamp':
      return diaryEvent(`lamp:${event.id}`, 'finding', event.id, event.name, `I helped light a lamp. ${event.lit}`);
    case 'fieldgame':
      return diaryEvent(`field:${event.game}`, 'tool', event.game, event.name, `I finished the field game “${event.name}”.`, { outcome: 'checked' }, 'after-break');
    case 'loreling':
      if (event.stage === 'watch' || event.stage === 'note' || event.stage === 'offer') {
        const key = event.ok && event.stage === 'offer' ? `loreling:${event.loreling}` : `loreling:${event.loreling}:${event.stage}`;
        return diaryEvent(key, 'tool', event.loreling, 'With a Loreling', event.text, { outcome: event.ok ? 'checked' : 'tried' }, 'after-break');
      }
      break;
  }
}

/** Store entries only after the engine has confirmed the action and its results. */
export function recordAdventure(
  pack: ContentPack, previous: CampaignState, next: CampaignState, cmd: Command, events: readonly GameEvent[], now: string, choice?: DiaryEntryDraft,
): CampaignState {
  const drafts: DiaryEntryDraft[] = [];
  if (choice) drafts.push(choice);
  const command = commandDiaryEvent(pack, previous, next, cmd);
  if (command) drafts.push(command);
  const decision = recordedDecision(cmd, previous, next);
  if (decision) drafts.push({ ...decision, event: { kind: decision.kind === 'choice' ? 'choice' : 'finding', key: decision.id, ref: decision.id }, repeat: 'after-break' });
  const completed = new Set(events.flatMap((event) => event.kind === 'objective' ? [event.id] : []));
  const objectives = completed.size ? objectiveEntries(pack).filter(({ objective }) => completed.has(objective.id)) : [];
  const authored = new Set(objectives.flatMap(({ objective }) => (objective.onComplete ?? []).flatMap(authorEntryId)));
  for (const event of events) {
    if (event.kind === 'objective') {
      const completedObjective = objectives.find(({ objective }) => objective.id === event.id);
      if (completedObjective) drafts.push(objectiveDraft(pack, completedObjective.mission, completedObjective.objective));
      continue;
    }
    const entry = event.kind === 'journal'
      ? (authored.has(event.id) ? undefined : journalDraft(pack, event.id))
      : experienceDraft(pack, previous, cmd, event);
    if (entry) drafts.push(entry);
  }
  if (!drafts.length) return next;
  const entries = next.adventureDiary.entries;
  const known = new Set(entries.map((entry) => entry.id));
  // Automatic quest completion and field-note effects do not make reopening the
  // same panel a new encounter. Different player actions leave distinct visits.
  const canSeparate = (entry: DiaryEntry) => entry.event && entry.event.kind !== 'quest' && entry.event.kind !== 'finding';
  let previousAction: DiaryEntry | undefined;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (!canSeparate(entries[i])) continue;
    previousAction = entries[i];
    break;
  }
  const checkedThisVisit = (key: string, text: string, prefix: string) => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if (!canSeparate(entry)) continue;
      if (entry.mapId !== next.mapId || !entry.event?.key.startsWith(prefix)) return false;
      if (entry.event.key === key && entry.text === text) return true;
    }
    return false;
  };
  const added: DiaryEntry[] = [];
  for (const draft of drafts) {
    const { repeat, ...data } = draft;
    if (!repeat && known.has(data.id)) continue;
    if (repeat === 'after-break' && previousAction?.event?.key === data.id && previousAction.mapId === next.mapId
      && previousAction.text === data.text) continue;
    if (typeof repeat === 'object' && known.has(data.id)
      && checkedThisVisit(data.id, data.text, repeat.fixedToolPrefix)) continue;
    let id = data.id;
    for (let occurrence = 2; known.has(id); occurrence++) id = `${data.id}@${occurrence}`;
    const entry = { ...data, id, at: now, mapId: next.mapId };
    known.add(id);
    added.push(entry);
    if (canSeparate(entry)) previousAction = entry;
  }
  return added.length ? {
    ...next, adventureDiary: { ...next.adventureDiary, entries: [...next.adventureDiary.entries, ...added] },
  } : next;
}

function availableDiaryQuestions(pack: ContentPack, state: CampaignState, entry: string) {
  const recorded = state.adventureDiary.entries.find(({ id }) => id === entry);
  if (recorded) return diaryQuestions(recorded);
  if (entry.startsWith('quest:')) {
    const id = entry.slice('quest:'.length);
    if (!state.objectivesDone.includes(id)) return;
    const prior = objectiveEntries(pack).find(({ objective }) => objective.id === id);
    if (prior) return diaryQuestions(objectiveDraft(pack, prior.mission, prior.objective));
  }
  if (entry.startsWith('record:')) {
    const id = entry.slice('record:'.length);
    if (!state.journal.includes(id)) return;
    // Quest-owned records appear through their quest entry even in earlier saves.
    if (objectiveEntries(pack).some(({ objective }) => state.objectivesDone.includes(objective.id)
      && objective.onComplete?.some((effect) => 'journal' in effect && effect.journal === id))) return;
    const prior = journalDraft(pack, id);
    if (prior) return diaryQuestions(prior);
  }
  if (/^note:(0|[1-9][0-9]*)$/.test(entry)) {
    const index = Number(entry.slice('note:'.length));
    const text = state.notes[index];
    if (text !== undefined) return diaryNoteQuestions(state.adventureDiary.noteDetails[index]?.kind ?? diaryNoteKind(text));
  }
}

export function setDiaryReflection(pack: ContentPack, state: CampaignState, entry: string, prompt: string, text: string): CampaignState {
  const questions = availableDiaryQuestions(pack, state, entry);
  if (!questions || !Object.hasOwn(questions, prompt)) throw new Error('This journal question is unavailable.');
  if (typeof text !== 'string') throw new Error('Write your reflection as text.');
  const all = state.adventureDiary.reflectionResponses ?? {};
  const current = Object.hasOwn(all, entry) ? all[entry] : {};
  if ((current[prompt] ?? '') === text) return state;
  const revised = { ...current };
  if (text.length) revised[prompt] = text;
  else delete revised[prompt];
  const responses = { ...all, [entry]: revised };
  if (!Object.keys(revised).length) delete responses[entry];
  return { ...state, adventureDiary: { ...state.adventureDiary, reflectionResponses: responses } };
}

/** Retroactive choices and timestamps are unavailable. Only recover facts already stored in the campaign. */
export function adventureJournalView(pack: ContentPack, state: CampaignState, objectives: readonly VisibleObjective[]): AdventureJournalView {
  const known = new Set(state.adventureDiary.entries.map((entry) => entry.id));
  const objectivesById = new Map(objectiveEntries(pack).map((entry) => [entry.objective.id, entry]));
  const prior: EntryDraft[] = [];
  const authored = new Set<string>();
  for (const id of state.objectivesDone) {
    const entry = objectivesById.get(id);
    if (!entry) continue;
    const { mission, objective } = entry;
    const draft = objectiveDraft(pack, mission, objective);
    if (!known.has(draft.id)) prior.push(draft);
    for (const id of (objective.onComplete ?? []).flatMap(authorEntryId)) authored.add(id);
  }
  for (const id of state.journal) {
    if (authored.has(id) || known.has(`record:${id}`)) continue;
    const note = journalDraft(pack, id);
    if (note) prior.push(note);
  }
  const quests = new Map<string, JournalQuest>();
  for (const objective of objectives) {
    if (objective.complete) continue;
    const mission = objective.mission;
    const quest = quests.get(mission.id) ?? { id: mission.id, title: mission.title, question: mission.knowledgeQuestion, steps: [] };
    quest.steps.push(objective.title);
    quests.set(mission.id, quest);
  }
  const notes: JournalNote[] = state.notes.map((text, index) => {
    const details = state.adventureDiary.noteDetails[index]
      ?? { kind: diaryNoteKind(text), at: null, mapId: null, resolved: false };
    return { text, index, ...details, reflections: journalReflections(state.adventureDiary, `note:${index}`, diaryNoteQuestions(details.kind)) };
  });
  const draft = state.adventureDiary.noteDraft;
  if (draft?.text.length) notes.push({ ...draft, index: -1, at: null, mapId: null, resolved: false, draft: true });
  const entries = [...prior.map((entry) => ({ ...entry, at: null, mapId: null })), ...state.adventureDiary.entries];
  return {
    name: state.player.name,
    entries: entries.map((entry) => {
      const encyclopedia = encyclopediaForDiaryEvent(pack, entry.event);
      return { ...entry, ...(encyclopedia && { encyclopedia }), reflections: journalReflections(state.adventureDiary, entry.id, diaryQuestions(entry)) };
    }),
    notes,
    portfolioWriting: Object.entries(state.adventureDiary.portfolioWriting).flatMap(([id, writing]) => writing.text ? [{ id, ...writing }] : []),
    quests: [...quests.values()],
    references: specimenReferences(pack, state),
    encyclopedia: encyclopediaLinks(pack, state),
  };
}
