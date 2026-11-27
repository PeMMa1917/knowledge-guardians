import {courierDiary,courierTopics,courierCases} from './courierLift';
import {wagerDiary} from './petalWager';
import {gearDiary} from './petalGears';
import {petalDiary, flowerWeave} from './petalWindow';
import { originInstrumentDiary, originWeave, origins } from './originInstruments';
import { bakeryDiary } from './bakeryTrays';
import { mothPerchDiary } from './mothPerches';
import { billDiary, billWeave } from './ferryBill';
import { mouldDiary } from './orchardMould';
import { ferryDiary, ferryWeave } from './pictureFerry';
import { chestDiary, beatDiary, chestWeave, performanceWeave, craftWeave } from './plumChest';
import { shadowDiary, supperWeave } from './supperShadow';
import {loanWeave} from './fieldLoan';
import {stops as loanStops} from '../content/loanCrews';
import {whistleDiary} from './whistleWatch';
import {whistlePlaces,whistleWeave} from '../content/whistleWatch';
import {birdDiary,birdWeave} from './birdSide';
import {weirLampDiary} from './weirLamp';
import {vaultDiary} from './vaultWork';
import {vaultWeave,vaultStations,weirLampWeave} from '../content/vaultNight';
import { millDiary } from './millShift';
import { millSites, millWeave } from '../content/millShift';
import { makerWeave } from '../content/makerMissions';
import { makerTrialForReading, makerTrialForTool } from '../content/makerTrials';
import { makerDiary } from './makerField';
import { coatDiary } from './pocketCoat';
import { coatWeave } from '../content/coatMissions';
import { pocketStories } from '../content/pocketStories';
import { nightDiary, nightSites } from './nightRegister';
import { registerWeave } from '../content/nightCollection';
import {lastBellDiary} from './lastBell';
import {watches,watchReading,watchEnding} from './watchBell';
import { guestInstrument, materialLine } from './lanternInstruments';
import { LANTERN_SITES, lanternCase, lanternRead, lanternRef, lanternSource, lanternTopics, tracingBasis } from './lamplight';
import { inkDiaryTopics } from './inkPost';
import { neighbourJournalTopics } from './neighbours';
import { moonBeatNames, moonPerformance } from './spareMoonMusic';
import { crossingOf, crossingWay } from './crossings';
import { PARCEL_REPLY } from './parcelLedger';
import { RUMOURS } from './rumours';
import { personalise } from './player';
import { check } from './rules';
import { LOYALTY } from './loyalty';
import { DISPATCH_DESKS, dispatchFlag, dispatchSlip } from './tiles';
import { specimenReferences, type SpecimenReference } from './specimenReferences';
import { encyclopediaForDiaryEvent, encyclopediaLinks, type EncyclopediaLink } from './encyclopedia';
import { earlierViews } from '../content/earlierViewing';
import { STAR_PATHS } from '../content/starPaths';
import { STAR_METHODS, starFlag } from './starPaths';
import { commandDiaryEvent, diaryEvent, type DiaryEntryDraft } from './adventureEvents';
import { diaryTopics, type DiaryTopics } from './diarySelection';
import { FIELD_GAMES } from './fieldgames';
import { CONCEPTS } from './types';
import type { Command, GameEvent } from './engine';
import { diaryNoteQuestions, diaryQuestions, journalReflections, type JournalReflection } from './diaryReflection';
export type { JournalReflection } from './diaryReflection';
import type {
  AdventureDiary, CampaignState, ContentPack, DialogueNode, DialogueOption, DiaryEntry, DiaryNoteDetails, DiaryPortfolioWriting,
  DiaryNoteKind, Effect, Mission, Objective, Weave,
} from './types';

type EntryDraft = Omit<DiaryEntryDraft, 'repeat'>;
type VisibleObjective = Objective & { mission: Mission; complete: boolean };

export interface JournalQuest {
  id: string;
  title: string;
  question: string;
  steps: string[];
  /** The chapter world, so the journal can group quests into pathways (C-010). */
  world: string;
  /** Steps done and steps in all, so the journal can show a good place to stop (C-010). */
  done: number;
  total: number;
}

export interface JournalNote extends DiaryNoteDetails {
  index: number;
  text: string;
  reflections?: JournalReflection[];
  draft?: true;
}

export type JournalEntry = EntryDraft & {
  at: string | null; mapId: string | null; reflections?: JournalReflection[]; encyclopedia?: EncyclopediaLink;
  topics?: DiaryTopics; specimenReference?: string;
};

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

export function journalText(note: ContentPack['journal'][number], state: CampaignState): string {
  return note.readings?.find((reading) => check(reading.when, state))?.text ?? note.text;
}

function objectiveDraft(pack: ContentPack, mission: Mission, objective: Objective, state: CampaignState): EntryDraft {
  const journalEffect = objective.onComplete?.find((effect) => 'journal' in effect);
  const note = journalEffect && pack.journal.find((row) => row.id === journalEffect.journal);
  return diaryEvent(`quest:${objective.id}`, 'quest', objective.id, mission.title,
    note ? firstPerson(journalText(note, state)) : `I finished the step “${objective.title}” in ${mission.title}.`);
}

function authorEntryId(effect: Effect): string[] {
  return 'journal' in effect ? [effect.journal] : [];
}

function journalDraft(pack: ContentPack, id: string, state: CampaignState): EntryDraft | undefined {
  const note = pack.journal.find((row) => row.id === id);
  if (note) return diaryEvent(`record:${id}`, 'finding', id, 'From my field notes', firstPerson(journalText(note, state)));
}

/** Record deliberate dialogue selections, including leaving something as it is. */
export function diaryDialogueChoice(pack: ContentPack, node: DialogueNode, option: DialogueOption, index: number, player: CampaignState['player']): DiaryEntryDraft {
  const person = pack.characters.find((character) => character.id === node.speaker)?.name;
  return diaryEvent(`choice:${node.id}:${index}`, 'choice', node.id, person ? `With ${person}` : 'A choice on the road',
    `I chose “${personalise(option.text, player)}”${person ? ` when I spoke with ${person}` : ''}.`, {}, 'after-break');
}

function recordedDecision(cmd: Command, previous: CampaignState, next: CampaignState): EntryDraft | undefined {
  if (cmd.type === 'WorkOriginInstrument') return originInstrumentDiary(next, cmd);
  if (cmd.type === 'MoveBakeryTray') return bakeryDiary(next, cmd);
  if (cmd.type==='TryMothPerch') return mothPerchDiary(cmd);
  if (cmd.type==='DrawOrchardStylus') return mouldDiary(cmd);
  if (cmd.type === 'HangFerryPrint' || cmd.type === 'OpenFerryBill' || cmd.type === 'HearFerryBill') return billDiary(previous, next, cmd);
  if (cmd.type === 'WorkCourierLift') return courierDiary(next,cmd);
  if(cmd.type==='DrawPetalRibbon')return wagerDiary(next,cmd);
  if(cmd.type==='WindPetalGear')return gearDiary(next,cmd);
  if (cmd.type === 'WorkPetalWindow') return petalDiary(previous,next,cmd);
  if (cmd.type === 'TurnPictureFerry') return ferryDiary(previous, next, cmd);
  if (cmd.type==='WorkPlumChest') return chestDiary(previous,cmd);
  if (cmd.type==='StrikeOrchardBeat') return beatDiary(previous,cmd);
  if (cmd.type==='CastSupperShadow') return shadowDiary(cmd);
  if(cmd.type==='PinBirdWatch') return birdDiary(cmd);
  if(cmd.type==='WorkWhistle') return whistleDiary(next,cmd);
  if(cmd.type==='UseWeirLamp') return weirLampDiary(next,cmd);
  if (cmd.type === 'WorkVault') return vaultDiary(next,cmd);
  if (cmd.type === 'WorkMillShift') return millDiary(next,cmd);
  if (cmd.type === 'WorkMakerInstrument' || cmd.type === 'WorkTownReading') return makerDiary(next,cmd);
  if (cmd.type === 'WorkCoatPocket') return coatDiary(cmd, previous, next);
  if (cmd.type === 'WorkNightRegister') return nightDiary(cmd, previous, next);
  if (cmd.type === 'WorkLastBell') return lastBellDiary(cmd, previous, next);
  if (cmd.type === 'WorkNightWatch') {
    const ref='night-watch.'+cmd.site;
    const flag=ref+(cmd.stage==='try'?'.current':'.left');
    if(previous.flags[flag]===next.flags[flag]) return;
    return diaryEvent(ref+':'+cmd.stage+':'+cmd.setting, cmd.stage==='try'?'tool':'choice',ref,watches[cmd.site].title,
      cmd.stage==='try'?'I tried the watch record. '+watchReading(cmd.site,cmd.setting):'I stayed for the handover. '+watchEnding(cmd.site,cmd.setting)+' '+watches[cmd.site].lead,{},'after-break');
  }
  if (cmd.type === 'TurnLanternGlass') {
    const site = LANTERN_SITES.find((s) => s.id === cmd.site);
    if (!site) return;
    const ref = 'lamplight-pair.' + site.id;
    const flag = cmd.stage === 'look' ? ref + '.seen.' + cmd.aperture : ref + '.mounted';
    if (previous.flags[flag] === next.flags[flag]) return;
    return cmd.stage === 'look'
      ? diaryEvent('lantern-pair:' + site.id + ':look:' + cmd.aperture, 'tool', ref, site.pair.title,
        'I turned the glass at ' + site.bench + '. ' + site.pair.sights[cmd.aperture])
      : diaryEvent('lantern-pair:' + site.id + ':mount:' + cmd.choice, 'choice', ref, site.pair.title,
        'I chose “' + site.pair.choices[cmd.choice].action + '”. ' + site.pair.choices[cmd.choice].reply);
  }
  if (cmd.type === 'WorkWithLantern') {
    const ref = lanternRef(cmd.site, cmd.person), pair = lanternCase(ref);
    if (!pair) return;
    const { site, person } = pair, now = lanternRead(next, site, person), then = lanternRead(previous, site, person);
    const key = 'lantern:' + ref + ':' + cmd.stage;
    const sources = {sourceIds: [lanternSource(person)]};
    if (cmd.stage === 'meet' && now.met && !then.met) return diaryEvent(key, 'conversation', ref, person.title,
      'I called ' + person.name + ' to the post at ' + site.place + '. ' + person.name + ' said, “' + person.opening + '”', sources);
    if (cmd.stage === 'recall') {
      const earlier = tracingBasis(next, ref);
      if (!earlier || (next.flags[ref + '.basis'] === previous.flags[ref + '.basis'] && now.pieces.join('') === then.pieces.join(''))) return;
      return diaryEvent(key + ':' + earlier.site.id + ':' + earlier.value, 'tool', ref, person.title,
        'I unpacked my tracing from ' + earlier.site.place + ' with ' + person.name + '. ' + materialLine(person.id, earlier.pieces), sources, 'after-break');
    }
    if (cmd.stage === 'pin' && now.pieces.join('') !== then.pieces.join('')) {
      const piece = guestInstrument(person.id)!.pieces[cmd.piece];
      return diaryEvent(key + ':' + now.pieces.join(''), 'tool', ref, person.title,
        'I tried the ' + piece.label + ' with ' + person.name + '. ' + piece.reading, sources);
    }
    if (cmd.stage === 'trace' && now.trace !== undefined && now.trace !== then.trace) return diaryEvent(key + ':' + now.trace, 'tool', ref, person.title,
      'With ' + person.name + ', I tried “' + person.folds[now.trace].action + '”. I carried our tracing towards ' + site.bench + '.', sources);
    if (cmd.stage === 'use' && now.trace !== undefined && now.use !== undefined &&
        (now.use !== then.use || next.flags['lamplight.' + site.id + '.shown'] !== previous.flags['lamplight.' + site.id + '.shown'])) {
      return diaryEvent(key + ':' + now.trace + ':' + now.use, 'choice', ref, site.title,
        'I met ' + person.name + ' again at ' + site.bench + '. “' + person.folds[now.trace].arrival + '” I chose “' +
        site.uses[now.use].action + '”. ' + site.uses[now.use].reply + ' In our tracing: ' + materialLine(person.id, now.pieces), sources);
    }
    return;
  }
  if (cmd.type === 'PlayMoonTune') {
    const site = moonPerformance(next);
    if (!site || next === previous) return;
    const beats = moonBeatNames(cmd.tune).join(', ');
    return diaryEvent(`moon-tune:${next.mapId}:${cmd.tune}`, 'tool', 'spare-moon.tune', site.title,
      `I played ${beats}. I left a beat for the other player and heard ${moonBeatNames(site.reply).join(', ')} come back.`);
  }
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
  if (cmd.flag === 'parcel.reply' && (cmd.value === 'desk' || cmd.value === 'token')) {
    return diaryEvent(`parcel:reply:${cmd.value}`, 'choice', 'parcel.reply', 'At the parcel counter', PARCEL_REPLY[cmd.value].journal);
  }
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
      text: choice.journal ?? `I chose “${choice.text}” ${pledge.who} replied, ${choice.reply}`,
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
    case 'puzzle': {
      const job = pack.puzzles.find((row) => row.id === event.puzzle);
      if (job && 'handoffs' in job && cmd.type === 'PuzzleReport') {
        const delivery = job.handoffs[cmd.index];
        if (previous.flags['puzzle.' + job.id + '.handoff'] === cmd.index) return;
        return diaryEvent(`puzzle:${job.id}:handoff:${cmd.index}`, 'choice', job.id, job.title,
          `I chose “${delivery.label}”. ${delivery.result}`, {}, 'after-break');
      }
      return diaryEvent(`puzzle:${event.puzzle}`, 'tool', event.puzzle, job?.title ?? 'A tool I used',
        `I used the puzzle tool and recorded what happened. ${event.text}`, { outcome: event.ok ? 'checked' : 'tried' }, 'always');
    }
    case 'secret':
      return diaryEvent(`secret:${event.id}`, 'finding', event.id, event.name, `I found ${event.name}.`);
    case 'keepsake':
      return diaryEvent(`keepsake:${event.id}`, 'finding', event.id, event.name, `I found a keepsake called “${event.name}”.${event.use ? ` ${event.use}` : ''}`);
    case 'lamp':
      return diaryEvent(`lamp:${event.id}`, 'finding', event.id, event.name, `I helped light a lamp. ${event.lit}`);
    case 'fieldgame':
      return diaryEvent(`field:${event.game}`, 'tool', event.game, event.name, `I finished the field game “${event.name}”.`, { outcome: 'checked' }, 'after-break');
    case 'loreling':
      if (event.stage === 'home' && cmd.type === 'WelcomeMoth') {
        return diaryEvent('moth-perch:home:' + cmd.perch, 'choice', event.loreling, 'Our resting place',
          'I went back with my companion. ' + event.text, {outcome: event.ok ? 'checked' : 'tried'}, 'after-break');
      }
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
  if (decision) drafts.push({ ...decision, event: decision.event ?? {
    kind: decision.kind === 'choice' ? 'choice' : 'finding', key: decision.id, ref: decision.id,
  }, repeat: 'after-break' });
  const completed = new Set(events.flatMap((event) => event.kind === 'objective' ? [event.id] : []));
  const objectives = completed.size ? objectiveEntries(pack).filter(({ objective }) => completed.has(objective.id)) : [];
  const authored = new Set(objectives.flatMap(({ objective }) => (objective.onComplete ?? []).flatMap(authorEntryId)));
  for (const event of events) {
    if (event.kind === 'objective') {
      const completedObjective = objectives.find(({ objective }) => objective.id === event.id);
      if (completedObjective) drafts.push(objectiveDraft(pack, completedObjective.mission, completedObjective.objective, next));
      continue;
    }
    const entry = event.kind === 'journal'
      ? (authored.has(event.id) ? undefined : journalDraft(pack, event.id, next))
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
    const action = data.event;
    if (action && objectives.length === 1 && (action.kind === 'choice' || action.kind === 'correction' || action.kind === 'tool')) {
      data.event = { ...action, completedObjective: objectives[0].objective.id };
    }
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
  const saved = state.adventureDiary.reflectionResponses?.[entry];
  if (recorded) return diaryQuestions(recorded, saved);
  if (entry.startsWith('quest:')) {
    const id = entry.slice('quest:'.length);
    if (!state.objectivesDone.includes(id)) return;
    const prior = objectiveEntries(pack).find(({ objective }) => objective.id === id);
    if (prior) return diaryQuestions(objectiveDraft(pack, prior.mission, prior.objective, state), saved);
  }
  if (entry.startsWith('record:')) {
    const id = entry.slice('record:'.length);
    if (!state.journal.includes(id)) return;
    // Quest-owned records appear through their quest entry even in earlier saves.
    if (objectiveEntries(pack).some(({ objective }) => state.objectivesDone.includes(objective.id)
      && objective.onComplete?.some((effect) => 'journal' in effect && effect.journal === id))) return;
    const prior = journalDraft(pack, id, state);
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
    const draft = objectiveDraft(pack, mission, objective, state);
    if (!known.has(draft.id)) prior.push(draft);
    for (const id of (objective.onComplete ?? []).flatMap(authorEntryId)) authored.add(id);
  }
  for (const id of state.journal) {
    if (authored.has(id) || known.has(`record:${id}`)) continue;
    const note = journalDraft(pack, id, state);
    if (note) prior.push(note);
  }
  const quests = new Map<string, JournalQuest>();
  for (const objective of objectives) {
    if (objective.complete) continue;
    const mission = objective.mission;
    const quest = quests.get(mission.id) ?? {
      id: mission.id, title: mission.title, question: mission.knowledgeQuestion, steps: [], world: mission.world,
      done: mission.objectives.filter((o) => state.objectivesDone.includes(o.id)).length, total: mission.objectives.length,
    };
    quest.steps.push(objective.title);
    quests.set(mission.id, quest);
  }
  const notes: JournalNote[] = state.notes.map((text, index) => {
    const details = state.adventureDiary.noteDetails[index]
      ?? { kind: diaryNoteKind(text), at: null, mapId: null, resolved: false };
    return { text, index, ...details, reflections: journalReflections(state.adventureDiary, `note:${index}`, diaryNoteQuestions(details.kind)) };
  });
  const draft = state.adventureDiary.noteDraft;
  if (draft?.text.length) notes.push({ ...draft, index: -1, at: draft.at ?? null, mapId: draft.mapId ?? null, resolved: false, draft: true });
  const entries = [...prior.map((entry) => ({ ...entry, at: null, mapId: null })), ...state.adventureDiary.entries];
  const exhibits = new Map(pack.exhibits.map((entry) => [entry.id, entry]));
  const taggedTools = new Map<string, Weave | undefined>([
    ...pack.labelKits.map(({ id, weave }) => [`label:${id}`, weave] as const),
    ...pack.showdowns.flatMap(({ id, weave }) => [[`showdown:${id}`, weave], [`showdown-move:${id}`, weave]] as const),
    ...pack.locks.map(({ id, weave }) => [`lock:${id}`, weave] as const),
    ...pack.threads.map(({ id, weave }) => [`thread:${id}`, weave] as const),
    ...pack.puzzles.map(({ id, weave }) => [`puzzle:${id}`, weave] as const),
    ...pack.alcoves.map(({ id, weave }) => [`alcove:${id}`, weave] as const),
    ...pack.lorelings.map(({ id, weave }) => [`loreling:${id}`, weave] as const),
    ...(pack.clueBoards ?? []).map(({ id, weave }) => [`board:${id}`, weave] as const),
  ]);
  function linkedTopics(entry: JournalEntry) {
    const event = entry.event;
    if (!event) return undefined;
    const [family] = event.key.split(':', 1);
    const specimen = family === 'specimen' ? exhibits.get(event.ref)?.specimen : undefined;
    if (family === 'mill') {
      const site = millSites.find(key => event.ref.split('.')[1] === key);
      if (site) return diaryTopics(millWeave(site));
    }
    if(family==='whistle'){const site=whistlePlaces.find(p=>event.ref==='whistle.'+p.id);if(site)return diaryTopics(whistleWeave(site.id));}
    if(family==='field-loan'){const stop=loanStops.find(id=>event.key.startsWith('field-loan:'+id+':')); if(stop)return diaryTopics(loanWeave(stop));}
    if (family === 'tally-tray') { const objective=objectivesById.get('emberford.tally.weigh')?.objective; if(objective?.weave) return diaryTopics(objective.weave); }
    if (family==='moth-perch') { const moth=pack.lorelings.find(r=>r.id==='glimmermoth'); if(moth)return diaryTopics(moth.weave); }
    if (family === 'origin-work') { const o = origins.find(x => x === event.ref); if (o) return diaryTopics(originWeave[o]); }
    if (family === 'picture-bill') return diaryTopics(billWeave);
    if (family === 'courier') {
      const record = courierCases.find(c => c.exhibit === event.ref);
      const landing = event.key.split('.')[2];
      if (record) return diaryTopics(courierTopics(record, landing === 'market' || landing === 'theatre' ? landing : undefined));
    }
    if (family === 'petal-window'||family === 'petal-gear'||family === 'petal-ribbon') return diaryTopics(flowerWeave);
    if (family === 'picture-ferry') return diaryTopics(ferryWeave);
    if (family === 'plum') {
      if (event.ref === 'plum.drum') return diaryTopics(performanceWeave);
      if (event.ref === 'plum.mould') return diaryTopics(craftWeave);
      return diaryTopics(chestWeave);
    }
    if(family==='supper') return diaryTopics(supperWeave);
    if(family==='birdside') return diaryTopics(birdWeave);
    if(family==='weir-lamp') return diaryTopics(weirLampWeave);
    if(family==='vault') { const station=vaultStations.find(id=>event.ref==='vault.'+id); if(station) return diaryTopics(vaultWeave(station)); }
    if (family === 'maker-trial' || family === 'maker-field') {
      const trial = makerTrialForTool(event.ref.slice('maker.'.length));
      if (trial) return diaryTopics(makerWeave(trial.tool, family === 'maker-trial' ? 'fit' : event.key.includes(':limits:') ? 'compared-bounds' : 'recipient'));
    }
    if (family === 'sign' && event.ref.startsWith('maker-reply.')) {
      const trial = makerTrialForReading(event.ref.split('.')[1]);
      if (trial) return diaryTopics(makerWeave(trial.tool));
    }
    if (family === 'coat-tracing') {
      const pair = lanternCase(event.ref);
      if (pair && pocketStories[pair.site.id]) {
        const work = coatWeave(pair.site.id);
        return diaryTopics({...work, concepts:[...new Set([...work.concepts,...pair.person.weave.concepts as typeof work.concepts])],
          aoks:[...new Set([...(work.aoks ?? []),...pair.person.weave.aoks as NonNullable<typeof work.aoks>])]});
      }
    }
    if (family === 'coat') {
      const site = event.key.split(':')[1];
      if (Object.hasOwn(pocketStories,site)) return diaryTopics(coatWeave(site));
    }
    if (nightSites.some(site => site.room === event.ref)) return diaryTopics(registerWeave);
    const watch = event.ref === 'night-watch.gate' || event.ref === 'night-watch.dispatch';
    const objective = objectivesById.get(watch ? event.ref + '.handover' : event.ref)
      ?? (specimen ? objectivesById.get(specimen.objective) : undefined);
    const completed = event.completedObjective ? objectivesById.get(event.completedObjective) : undefined;
    const fieldReply = family === 'sign' ? /^field-reply\.([\w-]+)\.\d+$/.exec(event.ref) : null;
    if (fieldReply) {
      const weave = taggedTools.get('puzzle:' + fieldReply[1]);
      if (weave) return diaryTopics(weave);
    }
    const weave = objective?.objective.weave ?? taggedTools.get(`${family}:${event.ref}`) ?? completed?.objective.weave;
    if (weave) return diaryTopics(weave);
    const neighbourhood = neighbourJournalTopics(event.ref) ?? inkDiaryTopics(event.ref) ?? lanternTopics(event.ref);
    if (neighbourhood) return neighbourhood;
    const fieldConcept = family === 'field' ? FIELD_GAMES.find(({ id }) => id === event.ref)?.concept : undefined;
    const concept = CONCEPTS.find((id) => id === fieldConcept);
    return concept ? { concepts: [concept] } : undefined;
  }
  return {
    name: state.player.name,
    entries: entries.map((entry) => {
      const historical = entry.event?.key.startsWith('lantern:') && !entry.event.sourceIds?.length ? lanternCase(entry.event.ref) : undefined;
      const event = historical && entry.event ? {...entry.event, sourceIds:[lanternSource(historical.person)]} : entry.event;
      const encyclopedia = encyclopediaForDiaryEvent(pack, event);
      const specimen = entry.event && exhibits.get(entry.event.ref)?.specimen;
      const specimenReference = specimen && entry.event?.sourceIds?.includes(specimen.source) ? specimen.key : undefined;
      const topics = linkedTopics(entry);
      return { ...entry, ...(event && {event}), ...(encyclopedia && { encyclopedia }), ...(topics && { topics }), ...(specimenReference && { specimenReference }),
        reflections: journalReflections(state.adventureDiary, entry.id, diaryQuestions(entry, state.adventureDiary.reflectionResponses?.[entry.id])) };
    }),
    notes,
    portfolioWriting: Object.entries(state.adventureDiary.portfolioWriting).flatMap(([id, writing]) => writing.text ? [{ id, ...writing }] : []),
    quests: [...quests.values()],
    references: specimenReferences(pack, state),
    encyclopedia: encyclopediaLinks(pack, state),
  };
}
