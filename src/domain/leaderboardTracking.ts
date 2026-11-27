/** Dated aggregates for successful game actions. Input is the engine's actual before/after result. */
import type { Command, GameEvent } from './engine';
import { diveDepth } from './dive';
import { mapChunkCount, mergeExploration } from './fog';
import { dayOf } from './ledger';
import { emptyLeaderboard, LEADERBOARD_AOKS, type LeaderboardRecord } from './leaderboard';
import { LEARN } from './learningLevels';
import { LOYALTY } from './loyalty';
import { brier, readForecasts } from './puzzles';
import type { CampaignState, ContentPack, Mission } from './types';

interface Area { id: string; width: number; height: number }
interface Quest { id: string; objectives: readonly string[] }

export interface LeaderboardIndex {
  pack: ContentPack;
  areas: Map<string, Area>;
  mapChunks: number;
  quests: Quest[];
  questsByObjective: Map<string, Quest[]>;
  objectives: Map<string, Mission['objectives'][number]>;
  characters: Set<string>;
}

export function leaderboardIndex(pack: ContentPack, areas: readonly Area[]): LeaderboardIndex {
  const quests: Quest[] = [];
  const questsByObjective = new Map<string, Quest[]>();
  const objectives = new Map<string, Mission['objectives'][number]>();
  for (const mission of pack.missions) {
    for (const objective of mission.objectives) objectives.set(objective.id, objective);
    const essential = mission.objectives.filter(step => step.essential).map(step => step.id);
    const cases = mission.caseVisits?.filter(ids => ids.length);
    const sequences: Quest[] = cases?.length ? cases.map(steps => ({
      id: mission.id + ':case-' + steps[steps.length - 1], objectives: [...new Set([...essential, ...steps])],
    })) : [{ id: mission.id, objectives: essential.length ? essential : mission.objectives.map(step => step.id) }];
    for (const quest of sequences) {
      if (!quest.objectives.length) continue;
      quests.push(quest);
      for (const step of quest.objectives) {
        const related = questsByObjective.get(step) ?? [];
        related.push(quest);
        questsByObjective.set(step, related);
      }
    }
  }
  return { pack, areas: new Map(areas.map(area => [area.id, area])),
    mapChunks: areas.reduce((sum, area) => sum + mapChunkCount(area.width, area.height), 0),
    quests, questsByObjective, objectives, characters: new Set(pack.characters.map(({ id }) => id)) };
}

function loyaltyFriends(index: LeaderboardIndex, state: CampaignState): string[] {
  return LOYALTY.filter(person => index.characters.has(person.companion)
    && person.choices.some(choice => choice.id === state.flags['loyalty.' + person.id])).map(({ companion }) => companion);
}

function lorelingFriends(index: LeaderboardIndex, state: CampaignState): string[] {
  return (index.pack.lorelings ?? []).filter(creature => state.flags['lor.' + creature.id + '.friend'] === true)
    .map(({ id }) => 'loreling:' + id);
}

export function startLeaderboard(index: LeaderboardIndex, saves: readonly CampaignState[], now: Date): LeaderboardRecord {
  const record = emptyLeaderboard(dayOf(now), index.mapChunks);
  const seen = new Set<string>();
  for (const save of saves) {
    const completed = new Set(save.objectivesDone);
    for (const id of completed) if (index.objectives.has(id)) seen.add('objective:' + id);
    for (const quest of index.quests) if (quest.objectives.every(id => completed.has(id))) seen.add('quest:' + quest.id);
    for (const friend of [...loyaltyFriends(index, save), ...lorelingFriends(index, save)]) {
      seen.add('friend:' + friend);
      seen.add('met:' + friend);
    }
    // Older saves did not distinguish a physical greeting from hearing a line.
    // Preserve physical meetings only when dated events are captured going forward.
    for (const [id, area] of index.areas) {
      const known = save.flags['fog.' + id];
      if (typeof known !== 'string') continue;
      record.maps[id] = mergeExploration(record.maps[id], known, area.width, area.height).hex;
    }
  }
  return { ...record, seen: [...seen] };
}

function dayUpdate(record: LeaderboardRecord, now: Date, added: Record<string, number>,
  reduced: Record<string, 'lower' | 'higher'> = {}): LeaderboardRecord {
  const day = dayOf(now);
  let summary = record.days[day] ?? {};
  const original = summary;
  for (const [key, number] of Object.entries(added)) {
    if (!Number.isFinite(number) || number < 0) continue;
    const old = summary[key];
    const operation = reduced[key];
    const value = old === undefined ? number
      : operation === 'higher' ? Math.max(old, number) : operation === 'lower' ? Math.min(old, number) : old + number;
    if (value === old) continue;
    if (summary === original) summary = { ...summary };
    summary[key] = value;
  }
  if (summary === original) return record;
  // Five extra dates cover a calendar week that starts just before New Year.
  const retainFrom = new Date(now.getTime());
  retainFrom.setDate(retainFrom.getDate() - 372);
  const oldest = dayOf(retainFrom);
  const days = Object.fromEntries(Object.entries(record.days).filter(([date]) => date >= oldest));
  days[day] = summary;
  return { ...record, startedOn: day < record.startedOn ? day : record.startedOn, days };
}

export function recordLeaderboardMeeting(record: LeaderboardRecord, index: LeaderboardIndex, id: string, now: Date): LeaderboardRecord {
  const key = 'met:' + id;
  if (!index.characters.has(id) || record.seen.includes(key)) return record;
  return dayUpdate({ ...record, seen: [...record.seen, key] }, now, { 'npcs-met': 1 });
}

export function recordLeaderboardAction(record: LeaderboardRecord, index: LeaderboardIndex, before: CampaignState,
  after: CampaignState, command: Command, events: readonly GameEvent[], now: Date): LeaderboardRecord {
  if (events.some(event => event.kind === 'error')) return record;
  const freshObjectives = events.flatMap(event => event.kind === 'objective' ? [event.id] : []);
  const loreling = events.find(event => event.kind === 'loreling' && event.ok);
  const relationMayHaveChanged = command.type === 'SetFlag' && command.flag.startsWith('loyalty.');
  const mapMayHaveChanged = command.type === 'SetFlag' && command.flag === 'fog.' + before.mapId;
  const scoreMayHaveChanged = command.type === 'DiveAnswer' || command.type === 'CompleteTileStitch'
    || command.type === 'PuzzleForecast' && command.puzzle === 'forecast-board';
  const playedFieldGame = command.type === 'FinishFieldGame';
  if (!freshObjectives.length && !playedFieldGame && !loreling && !relationMayHaveChanged && !mapMayHaveChanged && !scoreMayHaveChanged) return record;

  const counts: Record<string, number> = {};
  const direction: Record<string, 'lower' | 'higher'> = {};
  const seen = new Set(record.seen);
  const count = (key: string, by = 1) => { counts[key] = (counts[key] ?? 0) + by; };
  const once = (key: string, measure?: string) => {
    if (seen.has(key)) return false;
    seen.add(key);
    if (measure) count(measure);
    return true;
  };
  const practice = (tags: { concepts: readonly string[]; aoks?: readonly string[]; framework?: readonly string[] }) => {
    for (const id of new Set(tags.concepts)) count('concept:' + id);
    for (const id of LEADERBOARD_AOKS) if (tags.aoks?.includes(id)) count('aok:' + id);
    for (const id of new Set(tags.framework ?? [])) count('framework:' + id);
  };

  if (freshObjectives.length) {
    const completed = new Set(after.objectivesDone);
    for (const id of freshObjectives) {
      const objective = index.objectives.get(id);
      if (!objective) continue;
      if (once('objective:' + id) && objective.weave) practice(objective.weave);
      for (const quest of index.questsByObjective.get(id) ?? []) {
        if (quest.objectives.every(step => completed.has(step))) once('quest:' + quest.id, 'quests');
      }
    }
  }
  // Additional authored encounter kinds do not have objective records.
  if (command.type === 'FinishFieldGame' && events.some(event => event.kind === 'fieldgame' && event.first)) {
    const tags = LEARN['field:' + command.game];
    if (tags && once('objective:field:' + command.game)) practice(tags);
  }

  if (relationMayHaveChanged) for (const who of loyaltyFriends(index, after)) {
    once('met:' + who, 'npcs-met');
    once('friend:' + who, 'npcs-befriended');
  }
  if (loreling?.kind === 'loreling') {
    const who = 'loreling:' + loreling.loreling;
    once('met:' + who, 'npcs-met');
    if (loreling.stage === 'offer' && after.flags['lor.' + loreling.loreling + '.friend'] === true) {
      once('friend:' + who, 'npcs-befriended');
    }
  }

  if (mapMayHaveChanged && command.type === 'SetFlag') {
    const area = index.areas.get(before.mapId);
    if (area && typeof after.flags[command.flag] === 'string' && before.flags[command.flag] !== after.flags[command.flag]) {
      const earlier = mergeExploration(record.maps[area.id], before.flags[command.flag], area.width, area.height).hex;
      const merger = mergeExploration(earlier, after.flags[command.flag], area.width, area.height);
      if (merger.added > 0) {
        record = { ...record, mapChunks: index.mapChunks, maps: { ...record.maps, [area.id]: merger.hex } };
        count('map-discovery', merger.added);
      }
    }
  }

  const score = (id: string, value: number, order: 'lower' | 'higher') => {
    direction[id] = order;
    counts[id] = value;
  };
  if (command.type === 'CompleteTileStitch') {
    score('game:stitch-moves', command.moves, 'lower');
    score('game:stitch-seconds', command.secs, 'lower');
  }
  if (command.type === 'DiveAnswer' && before.flags['dive.' + command.day + '.' + command.prompt] !== after.flags['dive.' + command.day + '.' + command.prompt]) {
    const depth = diveDepth(index.pack.divePrompts ?? [], index.pack.diveItems ?? [], after.flags, command.day).metres;
    score('game:dive-depth', depth, 'higher');
  }
  if (command.type === 'PuzzleForecast' && command.puzzle === 'forecast-board') {
    const puzzle = index.pack.puzzles.find(entry => entry.id === command.puzzle);
    const forecasts = readForecasts(after.flags['puzzle.forecast-board.f']);
    if (puzzle?.type === 'forecast' && forecasts.length === puzzle.days.length
      && readForecasts(before.flags['puzzle.forecast-board.f']).length < forecasts.length) {
      score('game:forecast-brier', brier(forecasts.map(value => value / 100), puzzle.days.map(day => day.rain)), 'lower');
    }
  }

  if (seen.size > record.seen.length) record = { ...record, seen: [...seen] };
  return dayUpdate(record, now, counts, direction);
}
