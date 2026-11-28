import { CONCEPTS } from './types';
import { DIARY_AREAS, DIARY_THEMES, type DiaryTopics } from './diarySelection';
import type { FrameworkPart } from './learningLevels';
import type { WorkOrder } from './worldWork';

const parts:FrameworkPart[]=['scope','methods-and-tools','perspectives','ethics'];

// A diary can be opened offline without downloading a shelf the player visited on another device.
export function workTopicStamp(o:WorkOrder) {
  const words=o.ticket[9].toLowerCase().split(', ');
  const concepts=CONCEPTS.reduce((bits,term,i)=>words.includes(term)?bits|(1<<i):bits,0);
  return [concepts,o.ticket[16],o.ticket[17]].join('/');
}

export function workDiaryTopics(stamp:string):DiaryTopics {
  const [concepts,framework,codes]=stamp.split('/');
  const areas=(codes??'').split(',');
  return {concepts:CONCEPTS.filter((_,i)=>Number(concepts)&(1<<i)),
    framework:parts.filter((_,i)=>Number(framework)&(1<<i)),
    areas:DIARY_AREAS.filter(code=>areas.includes(code)),themes:DIARY_THEMES.filter(code=>areas.includes(code))};
}
