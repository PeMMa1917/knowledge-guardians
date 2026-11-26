import { crossingOf, crossingWay } from './crossings';
import { RUMOURS } from './rumours';
import { LOYALTY } from './loyalty';
import { specimenReferences, type SpecimenReference } from './specimenReferences';
import { earlierViews } from '../content/earlierViewing';
import { STAR_PATHS } from '../content/starPaths';
import { STAR_METHODS, starFlag } from './starPaths';
import type { Command, GameEvent } from './engine';
import type {
  AdventureDiary, CampaignState, ContentPack, DialogueNode, DialogueOption, DiaryEntry, DiaryNoteDetails,
  DiaryNoteKind, Effect, Mission, Objective,
} from './types';

type EntryDraft = Omit<DiaryEntry, 'at' | 'mapId'>;
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
}

export interface AdventureJournalView {
  name: string;
  entries: (EntryDraft & { at: string | null; mapId: string | null })[];
  notes: JournalNote[];
  quests: JournalQuest[];
  references: SpecimenReference[];
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
  return {
    id: `quest:${objective.id}`, kind: 'quest', title: mission.title,
    text: note ? firstPerson(note.text) : `I finished the step “${objective.title}” in ${mission.title}.`,
  };
}

function authorEntryId(effect: Effect): string[] {
  return 'journal' in effect ? [effect.journal] : [];
}

function journalDraft(pack: ContentPack, id: string): EntryDraft | undefined {
  const note = pack.journal.find((row) => row.id === id);
  if (note) return { id: `record:${id}`, kind: 'experience', title: 'From my field notes', text: firstPerson(note.text) };
}

function choiceCanChange(effects: Effect[] | undefined): boolean {
  return effects?.some((effect) => 'setFlag' in effect || 'relation' in effect || 'addCard' in effect
    || 'giveItem' in effect || 'takeItem' in effect || 'companion' in effect || 'addMarks' in effect) ?? false;
}

/** Only distinguish actual alternatives with an authored consequence or inquiry tag. */
export function diaryDialogueChoice(pack: ContentPack, node: DialogueNode, option: DialogueOption, index: number, alternatives: number): EntryDraft | undefined {
  if (alternatives < 2) return;
  const next = option.next ? pack.dialogue.find((line) => line.id === option.next) : undefined;
  if (!option.tag && !choiceCanChange(option.effects) && !choiceCanChange(next?.effects)) return;
  const person = pack.characters.find((character) => character.id === node.speaker)?.name;
  return {
    id: `choice:${node.id}:${index}`, kind: 'choice', title: person ? `With ${person}` : 'A choice on the road',
    text: `I chose “${option.text}”${person ? ` when I spoke with ${person}` : ''}.`,
  };
}

function recordedDecision(cmd: Command, previous: CampaignState, next: CampaignState): EntryDraft | undefined {
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

function experienceDraft(pack: ContentPack, cmd: Command, event: GameEvent): EntryDraft | undefined {
  switch (event.kind) {
    case 'label':
      if (cmd.type === 'BuildLabel') return {
        id: `label:${cmd.kit}:${cmd.subject}:${cmd.criterion}:${cmd.limit}:${event.result.holds}`,
        kind: 'choice', title: pack.labelKits.find((kit) => kit.id === cmd.kit)?.title ?? 'A label I tried',
        text: `I set up a label that read “${event.result.text}” ${event.result.holds ? 'It held.' : 'The Fray stayed on the label.'} ${event.result.heard}`,
      };
      break;
    case 'showdown': {
      if (!event.state.outcome) break;
      const showdown = pack.showdowns.find((record) => record.id === event.state.id);
      if (!showdown) break;
      const result = showdown.outcomes[event.state.outcome];
      return {
        id: `showdown:${event.state.id}:${event.state.outcome}:${event.state.claim ?? ''}`,
        kind: 'experience', title: showdown.title,
        text: `I took part in the Showdown. ${result.text}`,
      };
    }
    case 'thread': {
      if (cmd.type !== 'FollowThread') break;
      const thread = pack.threads.find((row) => row.id === cmd.thread);
      return {
        id: `thread:${cmd.thread}:${event.node}`, kind: 'experience', title: thread?.title ?? 'A provenance trail',
        text: `I followed the Provenance Thread. ${event.text}${event.gap ? ` ${event.gap}` : ''}`,
      };
    }
    case 'rumour': {
      if (cmd.type !== 'RouteRumour' || !event.ok) break;
      const rumour = RUMOURS.find((r) => r.id === cmd.rumour);
      if (rumour) return {
        id: `rumour:${rumour.id}:${cmd.desk}`, kind: 'choice', title: rumour.title,
        text: `I chose to ${rumour.handoffs[cmd.desk].action[0].toLowerCase()}${rumour.handoffs[cmd.desk].action.slice(1)}. ${event.why}`,
      };
      break;
    }
    case 'simulation':
      if (event.result.fairTest) return {
        id: `simulation:${event.result.pen}:${event.result.surface}`, kind: 'experience', title: 'The workshop marking test',
        text: `I changed one thing in a marking test and compared the new mark. ${event.result.note}`,
      };
      break;
    case 'puzzle':
      if (event.ok) return {
        id: `puzzle:${event.puzzle}`, kind: 'experience', title: pack.puzzles.find((row) => row.id === event.puzzle)?.title ?? 'A tool I used',
        text: `I used the puzzle tool and recorded what happened. ${event.text}`,
      };
      break;
    case 'secret':
      return { id: `secret:${event.id}`, kind: 'experience', title: event.name, text: `I found ${event.name}.` };
    case 'keepsake':
      return { id: `keepsake:${event.id}`, kind: 'experience', title: event.name, text: `I found a keepsake called “${event.name}”.${event.use ? ` ${event.use}` : ''}` };
    case 'lamp':
      return { id: `lamp:${event.id}`, kind: 'experience', title: event.name, text: `I helped light a lamp. ${event.lit}` };
    case 'fieldgame':
      if (event.first) return { id: `field:${event.game}`, kind: 'experience', title: event.name, text: `I finished the field game “${event.name}”.` };
      break;
    case 'loreling':
      if (event.ok && event.stage === 'offer') return {
        id: `loreling:${event.loreling}`, kind: 'experience', title: 'A Loreling friend', text: `I made a Loreling friend. ${event.text}`,
      };
      break;
  }
}

/** Store entries only after the engine has confirmed the action and its results. */
export function recordAdventure(
  pack: ContentPack, previous: CampaignState, next: CampaignState, cmd: Command, events: readonly GameEvent[], now: string, choice?: EntryDraft,
): CampaignState {
  const drafts: EntryDraft[] = [];
  if (choice) drafts.push(choice);
  const decision = recordedDecision(cmd, previous, next);
  if (decision) drafts.push(decision);
  if (cmd.type === 'VisitPlace') drafts.push({
    id: `place:${next.mapId}`, kind: 'experience', title: cmd.name, text: `I arrived at ${cmd.name}.`,
  });
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
      : experienceDraft(pack, cmd, event);
    if (entry) drafts.push(entry);
  }
  if (!drafts.length) return next;
  const known = new Set(next.adventureDiary.entries.map((entry) => entry.id));
  const added: DiaryEntry[] = [];
  for (const draft of drafts) {
    if (known.has(draft.id)) continue;
    known.add(draft.id);
    added.push({ ...draft, at: now, mapId: next.mapId });
  }
  return added.length ? {
    ...next, adventureDiary: { ...next.adventureDiary, entries: [...next.adventureDiary.entries, ...added] },
  } : next;
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
  return {
    name: state.player.name,
    entries: [...prior.map((entry) => ({ ...entry, at: null, mapId: null })), ...state.adventureDiary.entries],
    notes: state.notes.map((text, index) => ({ text, index, ...state.adventureDiary.noteDetails[index] })),
    quests: [...quests.values()],
    references: specimenReferences(pack, state),
  };
}
