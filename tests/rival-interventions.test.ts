import { expect, it } from 'vitest';
import { PASSAGES } from '../src/domain/corridor';
import { apply, emptyOutputs } from '../src/domain/rules';
import { rivalIntervention, rivalReply } from '../src/domain/rivalInterventions';
import { needsPrediction, revision, ticketKey, workAction, type Ticket, type WorkCommand, type WorkOrder } from '../src/domain/worldWork';
import { workDiaryTopics, workTopicStamp } from '../src/domain/workTopics';
import { Driver } from './driver';

const books = import.meta.glob<{default: Ticket[]}>('../src/content/world-work/w*-g*.json', { eager: true });
const rows = (chapter: number, group: number) => books['../src/content/world-work/w' + chapter + '-g' + group + '.json'].default;

it('matches each world’s 660 objectors to a specific intervention and keeps the quiet cases available', () => {
  const moves = new Set<string>(), replies = new Set<string>();
  for (let chapter = 1; chapter <= PASSAGES.length; chapter++) {
    for (const [group, count] of [60, 200, 200, 200].entries()) {
      const active = [];
      for (const ticket of rows(chapter, group)) {
        const move = rivalIntervention({chapter, group, ticket});
        if (Boolean(move) !== Boolean(ticket[10])) throw Error('Rival mismatch for ' + [chapter,group,ticket[0]]);
        if (move) {
          active.push(move);
          moves.add(move.scene);
          move.paths.forEach(path => replies.add(path.action));
        }
      }
      expect(active).toHaveLength(count);
    }
  }
  expect(moves.size).toBe(15);
  expect(replies.size).toBe(30);
});

it('checks the figure and micro-skill assignments and the opportunities to compare subjects on all fifteen activity shelves', () => {
  for (let chapter = 1; chapter <= PASSAGES.length; chapter++) {
    const skills = new Set<number>(), people = new Set<string>();
    for (const group of [0, 1, 2, 3]) {
      let comparisons = 0;
      for (const ticket of rows(chapter, group)) {
        skills.add(ticket[18]);
        ticket[6].forEach(p => people.add(p));
        const topics = workDiaryTopics(workTopicStamp({chapter,group,ticket}));
        if (topics.concepts!.length >= 6 && topics.areas!.length >= 2 && topics.themes!.length) comparisons++;
      }
      expect(comparisons).toBeGreaterThanOrEqual(120);
    }
    expect([...skills].sort((a,b) => a-b)).toEqual(Array.from({length:1200},(_,i)=>i+1));
    expect(people.size).toBe(501);
  }
});

it('lets the Guardian answer each kind of objection twice and passes on only the account signed in the issued edition', () => {
  const d = new Driver(), seen = new Set<string>();
  for (let chapter = 1; chapter <= PASSAGES.length; chapter++) {
    for (const [group, tickets] of [0,1,2,3].map(g=>rows(chapter,g)).entries()) {
      for (const ticket of tickets) {
        const o: WorkOrder = {chapter,group,ticket};
        const move = rivalIntervention(o);
        if (!move || !ticket[7].length || seen.has(move.scene)) continue;
        seen.add(move.scene);
        const key = ticketKey(o), home = PASSAGES[chapter-1].hall;
        let s = {...d.s,mapId:home, flags:{...d.s.flags}};
        const play = (action: WorkCommand['action'], value=0) => {
          const result = workAction(s,{type:'WorldWork',order:o,action,value});
          s = apply(result.effects,s,emptyOutputs());
          return result.text;
        };
        expect(()=>play('answer-rival')).toThrow();
        s.flags[key+'.worked']=true;
        play('hear');
        if (needsPrediction(o)) play('predict',0);
        play('test',0);play('test',1);
        expect(()=>play('answer-rival',2)).toThrow();
        for (const i of [0,1]) {
          expect(play('answer-rival',i)).toBe(move.paths[i].result);
          expect(rivalReply(s,o,key,true)).not.toBe(move.paths[i].result);
          play('issue',2);
          const version=revision(s,o);
          play('issue',2);expect(revision(s,o)).toBe(version);
          s={...s,mapId:PASSAGES[ticket[7][0]-1].hall};
          expect(play('receive')).toContain(move.paths[i].result);
          expect(()=>play('answer-rival')).toThrow();
          s={...s,mapId:home};
        }
        play('issue',0);
        expect(rivalReply(s,o,key,true)).toBeUndefined();
        expect(rivalReply(s,o,key,false)).toBe(move.paths[1].result);
      }
    }
  }
  expect(seen.size).toBe(15);
});
