import { expect, it } from 'vitest';
import { hallShift, hallCost, shiftReading } from '../src/domain/hallStories';
import { workTitles } from '../src/domain/workTitles';
import { PASSAGES } from '../src/domain/corridor';
import type { Ticket } from '../src/domain/worldWork';
import { Driver } from './driver';

const shelves = import.meta.glob<{default:Ticket[]}>('../src/content/world-work/w*-g*.json',{eager:true});

it('gives every available order a distinct title within its world, including invitations found through search', () => {
  for (let chapter = 1; chapter <= PASSAGES.length; chapter++) {
    const all: string[] = [];
    for (let group = 0; group < 5; group++) {
      const rows = shelves['../src/content/world-work/w'+chapter+'-g'+group+'.json'].default;
      const named = workTitles(group, rows);
      expect(workTitles(group, [...rows].reverse()).get(rows[0][0])).toBe(named.get(rows[0][0]));
      all.push(...named.values());
    }
    expect(new Set(all).size).toBe(all.length);
  }
});

it('gives all fifteen halls a local clock, a missed departure, a reveal, people who bear the cost, kindness and comedy', () => {
  const s = new Driver().s;
  const all = PASSAGES.map((_,i) => hallShift(i+1));
  for (const tag of ['opening','clock','late','discovery','turn','firstCost','secondCost','quiet','humour'] as const)
    expect(new Set(all.map(b => b[tag])).size,tag).toBe(15);
  all.forEach((b,i) => {
    expect(shiftReading(s,'example',i+1)).toBe(b.clock);
    expect(shiftReading({...s,flags:{'example.late':true}},'example',i+1)).toBe(b.late);
    expect(hallCost(i+1,2)).toContain(hallCost(i+1,0));
    expect(hallCost(i+1,2)).toContain(hallCost(i+1,1));
  });
});
