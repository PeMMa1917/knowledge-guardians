import {workTopicStamp} from './workTopics';
import {workAction, ticketKey, orderName} from './worldWork';
import {sagaMove,sagaName} from './corridorSagas';
import {templeAction} from './temples';
import {tiedThread} from './trailThread';
import {equippedLoan,loanReading,readerAnswer,readerLetters,selectedLoan,setupLabels} from './fieldLoan';
import {loanStops} from '../content/loanCrews';
import { SERVICE_CUTS, servicePlan } from './boundaryBoard';
import { civicAllocation } from './civicConsole';
import { compareCopy } from './copyComparison';
import { councilClock } from './councilClock';
import { FILM_READER, filmTake } from './filmCuts';
import { FOREST_WATCH, forestWatch } from './forestWatch';
import { islandPlan } from './islandPlan';
import { marketComparison } from './marketScale';
import { readMetalSample } from './metalSample';
import { nileDelivery, runNileTrial } from './nileModel';
import { personalise } from './player';
import { scoutDecision, scoutReport, scoutTrials } from './scoutRoutes';
import { seaChart } from './seaCharts';
import { stageRehearsal } from './stageRehearsal';
import { voiceReading } from './voiceReadings';
import { waterTrial } from './waterGate';
import { hasSpecimen, ownsSpecimen, specimenSeat } from './specimenGear';
import { biographyReadFlag, isHistoricalBiography } from './historicalEncounters';
import type { Command } from './engine';
import type { CampaignState, ContentPack, DiaryEntry, DiaryEvent } from './types';

export type DiaryEntryDraft = Omit<DiaryEntry, 'at' | 'mapId'> & {
  repeat?: 'after-break' | 'always' | { fixedToolPrefix: string };
};

export function diaryEvent(
  key: string, kind: DiaryEvent['kind'], ref: string, title: string, text: string,
  details: Pick<DiaryEvent, 'sourceIds' | 'outcome'> = {}, repeat?: DiaryEntryDraft['repeat'],
): DiaryEntryDraft {
  return {
    id: key, kind: kind === 'quest' || kind === 'choice' ? kind : 'experience', title, text,
    event: { kind, key, ref, ...details }, repeat,
  };
}

// A fixed instrument can show several results during one visit. Cycling through
// those same results adds no new observation until the player has another encounter.
function fixedTrial(key: `${string}:${string}`, ref: string, title: string, text: string, correction = false) {
  const fixedToolPrefix = key.slice(0, key.indexOf(':') + 1);
  return diaryEvent(key, correction ? 'correction' : 'tool', ref, title, text, { outcome: 'checked' }, { fixedToolPrefix });
}

/** Describe completed commands from their validated parameters and the same authored models the tools display. */
export function commandDiaryEvent(pack: ContentPack, previous: CampaignState, next: CampaignState, cmd: Command): DiaryEntryDraft | undefined {
  switch (cmd.type) {
    case 'TieJournalThread':
    case 'UntieJournalThread': {
      const tie=tiedThread(pack,cmd.type==='TieJournalThread'?next:previous);
      if(!tie)return;
      const old=tiedThread(pack,previous);
      if(cmd.type==='TieJournalThread' && old?.objective.id===tie.objective.id && old.face===tie.face)return;
      const removed=cmd.type==='UntieJournalThread';
      return diaryEvent('trail-thread:'+(removed?'free':'tied')+':'+tie.objective.id+':'+tie.face,'choice',tie.objective.id,tie.marker.paper,
        removed?'I slipped my ribbon out of “'+tie.mission.title+'”. I can still return to that story.':'I marked “'+tie.objective.title+'” for my return. '+tie.marker[tie.face],{},'after-break');
    }
    case 'WorkFieldLoan': {
      const loan=equippedLoan(pack,previous,cmd.stop);
      if(!loan)return;
      const desk=loanStops[cmd.stop], ref=loan.record.id;
      const key='field-loan:'+cmd.stop+':'+loan.key+':'+loan.incoming+':'+loan.position+':';
      if(cmd.mode==='letter'){
        const setting=selectedLoan(previous,cmd.stop,loan);
        if(setting!==undefined)return diaryEvent(key+'letter:'+cmd.letter,'conversation',ref,readerLetters[cmd.stop][cmd.letter],
          'I passed the reader’s letter across the bench. '+readerAnswer(loan,cmd.stop,cmd.letter,setting),{sourceIds:[loan.record.specimen.source]},'after-break');
        break;
      }
      if(cmd.mode==='adjust')return diaryEvent(key+'adjust:'+cmd.position,'tool',ref,setupLabels[cmd.stop][cmd.position],
        'I changed the arrangement for '+loan.record.name+' to “'+setupLabels[cmd.stop][cmd.position]+'”. The next reading will use this arrangement.',
        {sourceIds:[loan.record.specimen.source]},{fixedToolPrefix:key+'adjust:'});
      if(cmd.mode==='issue')return diaryEvent(key+cmd.edition,'choice',ref,desk.doors[cmd.edition==='carry'?0:1],
        'I issued the slip for '+loan.record.name+'. '+desk.replies[cmd.edition==='carry'?0:1],{sourceIds:[loan.record.specimen.source]},'after-break');
      const result=loanReading(loan.record,loan.card,cmd.stop,cmd.setting,loan.incoming,loan.position);
      return diaryEvent(key+cmd.setting,'tool',ref,desk.controls[cmd.setting],
        'I tried '+loan.record.name+' at '+desk.place+'. '+result.strips.map(row=>row.label+' · '+row.text).join(' / ')+'. '+result.observation,
        {sourceIds:[loan.record.specimen.source]},{fixedToolPrefix:key});
    }
    case 'WorldWork': {
      const work = workAction(previous, cmd);
      const id = ticketKey(cmd.order);
      return diaryEvent(['work',id, previous.mapId, cmd.action, cmd.value, workTopicStamp(cmd.order)].join(':'), cmd.action === 'test' || cmd.action === 'work' ? 'tool' : 'choice',
        id, orderName(cmd.order), work.title + '. ' + work.text, {}, 'after-break');
    }
    case 'SagaMove': {
      const result=sagaMove(previous,cmd);
      return diaryEvent('saga:'+cmd.saga+':'+previous.mapId+':'+cmd.move+':'+cmd.choice,'choice','saga.'+cmd.saga,sagaName(cmd.saga),result.title+'. '+result.text);
    }
    case 'TempleAction': {
      const result=templeAction(previous,cmd);
      return diaryEvent('temple:'+previous.mapId+':'+cmd.action+':'+(cmd.choice ?? ''),'choice',previous.mapId,result.title,result.text);
    }
    case 'VisitPlace': {
      const mapId = next.mapId;
      if (cmd.via) return diaryEvent(`route:${cmd.via.from}:${cmd.via.id}:${mapId}`, 'route', cmd.via.id, cmd.name,
        cmd.via.from === mapId ? `I used ${cmd.via.label} at ${cmd.name}.` : `I arrived at ${cmd.name} by ${cmd.via.label}.`, {}, 'after-break');
      if (!previous.flags[`visited.map.${mapId}`]) return diaryEvent(`place:${mapId}`, 'arrival', mapId, cmd.name, `I arrived at ${cmd.name}.`);
      break;
    }
    case 'HearWorldMemory': {
      if (previous.flags['mem.' + cmd.id] === true || next.flags['mem.' + cmd.id] !== true) break;
      const line = pack.memories?.find((memory) => memory.id === cmd.id);
      if (!line) break;
      const speaker = pack.characters.find((character) => character.id === line.character)?.name ?? line.character;
      return diaryEvent('overheard:' + line.id, 'conversation', line.id, 'In passing with ' + speaker,
        'I heard ' + speaker + ' say, “' + personalise(line.line, next.player) + '”');
    }
    case 'ReadWorldSign': {
      const key = `${cmd.blocked ? 'blocked-route' : 'sign'}:${next.mapId}:${cmd.id}`;
      return diaryEvent(key, cmd.blocked ? 'route' : 'sign', cmd.id, cmd.title,
        cmd.blocked ? `I tried ${cmd.title}. ${cmd.text}` : `I read ${cmd.title}.${cmd.text ? ` ${cmd.text}` : ''}`,
        cmd.blocked ? { outcome: 'blocked' } : {}, 'after-break');
    }
    case 'EnterNode': {
      const node = pack.dialogue.find((entry) => entry.id === cmd.node);
      if (!node?.text.trim()) break;
      const actor = pack.characters.find(({ id }) => id === node.speaker)?.name;
      const title = actor ? `With ${actor}` : node.speaker === 'lumen' ? 'With Lumen' : 'On the road';
      return diaryEvent(`conversation:${node.id}`, 'conversation', node.id, title,
        `${actor ? `I heard ${actor}.` : 'I heard this along the way.'} ${personalise(node.text, next.player)}`,
        node.citationSource ? { sourceIds: [node.citationSource] } : {}, 'after-break');
    }
    case 'ReadBiography': {
      const card = pack.cards.find(({ id }) => id === cmd.card);
      if (card && isHistoricalBiography(card) && next.flags[biographyReadFlag(card.id)] === true) {
        return diaryEvent(`biography:${card.id}`, 'inspection', card.id, `About ${card.person.name}`,
          `I opened the biography for ${card.person.name}.`, {}, 'after-break');
      }
      break;
    }
    case 'InspectExhibit': case 'UseLens': case 'ClaimSpecimen': case 'SetSpecimenReading': {
      const object = pack.exhibits.find(({ id }) => id === cmd.exhibit);
      if (!object) break;
      // Exact collection citations remain behind the actual collection action.
      const sourceIds = hasSpecimen(object) && !ownsSpecimen(next, object.specimen.key)
        ? object.sources.filter((id) => id !== object.specimen.source) : object.sources;
      const sources = sourceIds.length ? { sourceIds } : {};
      if (cmd.type === 'InspectExhibit') return diaryEvent(`exhibit:${object.id}`, 'inspection', object.id, object.name,
        `I inspected this exhibit. ${object.dateText}. ${object.summary}`, sources, 'after-break');
      if (cmd.type === 'UseLens') return diaryEvent(`lens:${object.id}`, 'tool', object.id, object.name,
        `I checked what this date describes. ${object.dateKind}`, { ...sources, outcome: 'checked' }, 'after-break');
      if (!hasSpecimen(object)) break;
      if (cmd.type === 'ClaimSpecimen' && !ownsSpecimen(previous, object.specimen.key) && ownsSpecimen(next, object.specimen.key))
        return diaryEvent(`specimen:${object.specimen.key}`, 'finding', object.id, object.name, `I added this object to my collection.`, sources);
      if (cmd.type === 'SetSpecimenReading') return diaryEvent(`specimen-reading:${object.specimen.key}:${cmd.reading}`, 'choice', object.id, object.name,
        cmd.reading === 'use' ? 'I put the observation first at this stand.' : 'I kept the source and its limits together at this stand.', sources, 'after-break');
      break;
    }
    case 'SwapSpecimenPlaces': {
      const first = pack.exhibits.find(row => row.specimen?.key === cmd.first);
      const second = pack.exhibits.find(row => row.specimen?.key === cmd.second);
      if (!first?.specimen || !second?.specimen || specimenSeat(previous,cmd.first) === specimenSeat(next,cmd.first)) return;
      const action = cmd.satchel ? `I put ${first.name} in my satchel. I left ${second.name} in its case.` :
        `I exchanged the display places of ${first.name} and ${second.name} in my collection room.`;
      return diaryEvent(`specimen-swap:${cmd.first}:${cmd.second}:${cmd.targetSeat}`, 'choice', first.id, 'My collection room', action,
        {sourceIds:[first.specimen.source,second.specimen.source]}, 'after-break');
    }
    case 'ReadClue': {
      const clue = pack.clues?.find(({ id }) => id === cmd.clue);
      if (clue) return diaryEvent(`clue:${clue.id}`, 'inspection', clue.id, clue.name, `I examined this clue. ${clue.text}`, {}, 'after-break');
      break;
    }
    case 'NileRouteTrial': {
      const result = runNileTrial(cmd.road);
      return fixedTrial(`nile-trial:${cmd.road}`, cmd.road, result.name, `I tried this road with the same high crate. ${result.line}`);
    }
    case 'NileDelivery': {
      const result = nileDelivery(cmd.choice);
      return diaryEvent(`nile-delivery:${cmd.choice}`, 'choice', cmd.choice, result.name, `I chose what to send from the archive. ${result.line}`);
    }
    case 'ObserveForest': {
      const counts = forestWatch(cmd.site, cmd.window).map((count) => count ?? 'hidden');
      const site = FOREST_WATCH[cmd.site];
      return fixedTrial(`forest-watch:${cmd.site}:${cmd.window}`, cmd.site, site.name,
        `I kept the ${cmd.window} watch. Crossings in order: ${counts.join(', ')}. ${site.view}`);
    }
    case 'CompareMetalSample': {
      const sample = readMetalSample(cmd.sample);
      return fixedTrial(`metal-sample:${cmd.sample}`, cmd.sample, sample.name, `I weighed this panel. The balance read ${sample.mass}.`);
    }
    case 'CompareCopy': {
      const comparison = compareCopy(cmd.edition);
      const restored = comparison.restored.length > 0;
      const lines = (restored ? comparison.restored : comparison.lost).join('” and “');
      return fixedTrial(`copy-check:${cmd.edition}`, cmd.edition, comparison.after.name,
        `I lined up the date and source with the ${comparison.before.name.toLowerCase()}. This copy ${restored ? 'restored' : 'lost'} “${lines}”.`, restored);
    }
    case 'ReadSeaChart': {
      const chart = seaChart(cmd.chart);
      return fixedTrial(`sea-chart:${cmd.chart}`, cmd.chart, chart.title, `I checked the landmarks and the survey’s edge. ${chart.limit}`);
    }
    case 'RunStageRehearsal': {
      const beats = stageRehearsal(cmd.cue);
      return fixedTrial(`rehearsal:${cmd.cue}`, cmd.cue, 'Rehearsal at the doorway', `I played the middle of the scene in this order. ${beats[1].text} ${beats[2].text}`);
    }
    case 'WeighMarketLots': {
      const lots = marketComparison(cmd.basis);
      const basis = { gross: 'including the basket', net: 'without the basket', wick: 'usable for wicks' }[cmd.basis];
      return fixedTrial(`market-weigh:${cmd.basis}`, cmd.basis, 'The Market test scale',
        `I compared the weights ${basis}. Lot A gave ${lots[0].mass} g and lot B gave ${lots[1].mass} g.`);
    }
    case 'RunWaterTrial': {
      const condition = previous.flags['water.repaired'] === true ? 'repaired' : 'drought';
      const result = waterTrial(condition, cmd.setting);
      return fixedTrial(`water-run:${condition}:${cmd.setting}`, cmd.setting, 'The Water Commons trial gate',
        `I tried ${cmd.setting} at the ${condition} gate. The ${result.incoming} buckets split into ${result.farm} for the fields and ${result.river} for the channel. ${result.leak} leaked at the gate.`);
    }
    case 'RunCivicTrial': {
      const result = civicAllocation(cmd.sample, cmd.rule);
      return fixedTrial(`civic-run:${cmd.sample}:${cmd.rule}`, cmd.sample, 'Comparing the Civic registers',
        `I tried the ${cmd.rule} rule with the ${cmd.sample} register. North Steps and Canal Walk had ${result.counts.steps} and ${result.counts.canal} requests and received ${result.windows.steps} and ${result.windows.canal} windows.`);
    }
    case 'RunVoiceReading': {
      const reading = voiceReading(cmd.source, cmd.view);
      return fixedTrial(`voice-reading:${cmd.source}:${cmd.view}`, cmd.source, reading.label, `I checked the ${cmd.view} at the listening desk. ${reading.text} ${reading.purpose}`);
    }
    case 'RunIslandPlan': {
      const result = islandPlan(cmd.landing, cmd.route);
      return fixedTrial(`island-plan:${cmd.landing}:${cmd.route}`, cmd.route, 'The Island route model',
        `I tested the ${cmd.route} route with the ${cmd.landing} landing. The model gives ${result.circuits} trips and ${result.minutes} minutes for the same eight crates.`);
    }
    case 'RunScoutRoute': {
      const turn = scoutTrials(cmd.first, cmd.protocol)[cmd.trial];
      const result = scoutDecision(turn, cmd.decision);
      const scout = cmd.protocol === 'informed' ? 'The scout with the gate notes' : 'The scout without the gate notes';
      return diaryEvent(`scout-run:${cmd.protocol}:${cmd.trial}`, 'tool', cmd.protocol, 'The Emberford scout drill',
        `I started for ${cmd.first}. ${scout} opened ${turn.opened}. I sent the cart to ${result.route}, where it ${result.fits ? 'fit through' : 'had to back out'}.`,
        { outcome: result.fits ? 'checked' : 'tried' }, 'always');
    }
    case 'ReviewScoutProtocol': {
      const report = scoutReport(scoutTrials('orchard', cmd.protocol));
      const condition = cmd.protocol === 'informed' ? 'with' : 'without';
      return fixedTrial(`scout-review:${cmd.protocol}`, cmd.protocol, 'The scout’s six possible rounds',
        `I opened all ${report.rounds} possible rounds ${condition} gate notes. Of ${report.blocked} rounds that showed a blocked gate, holding worked in ${report.hold} and changing worked in ${report.change}.`);
    }
    case 'SetServiceBoundary': {
      const plan = servicePlan(cmd.seam);
      const stops = plan.delivered.map(({ label }) => label).join(', ');
      return fixedTrial(`civic-boundary:${cmd.seam}`, cmd.seam, 'The night service map',
        `I put the line at ${SERVICE_CUTS[cmd.seam].name}. The same requests were still on the map. The cart’s first stops would be ${stops}.`);
    }
    case 'CaptureFilmTake': {
      const first = filmTake(cmd.station)[0];
      return fixedTrial(`film-camera:${cmd.station}`, cmd.station, 'Filming the doorway', `I filmed the rehearsal. ${first.description}`);
    }
    case 'ScreenFilmCut':
      return fixedTrial(`film-screening:${cmd.cut}`, cmd.cut, 'Screening a doorway cut', `I showed the cut that opens with ${cmd.cut === 'cue' ? 'the keeper’s hand' : 'the moving cart'}. ${FILM_READER[cmd.cut]}`);
    case 'PostFilmCut':
      return diaryEvent(`film-post:${cmd.cut}`, 'choice', cmd.cut, 'Hanging the doorway cut',
        `I posted the cut that opens with ${cmd.cut === 'cue' ? 'the keeper’s hand' : 'the moving cart'}. ${FILM_READER[cmd.cut]}`, { outcome: 'changed' });
    case 'RunCouncilClock': {
      const result = councilClock(cmd.trial);
      return fixedTrial(`council-clock:${cmd.trial}`, cmd.trial, 'The Council watch test',
        `I checked the watch at ${result.watch} against the reference at ${result.reference}. At the next mark the watch read ${result.after}.`);
    }
  }
}
