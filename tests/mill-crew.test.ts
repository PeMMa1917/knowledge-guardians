import { it, expect } from 'vitest';
import { millCrew } from '../src/content/millCrew';
import { Driver } from './driver';
it('each worker can ask for help with another job and hear about both of another worker’s decisions', () => {
  for (const person of millCrew)
    for (const choice of [0, 1]) {
      const d = new Driver();
      const giver = millCrew.find((g) => g.id === person.from)!;
      d.s.mapId = 'night-register.' + giver.site;
      d.talk(giver.id, giver.invite, giver.offers[choice]);
      d.s.mapId = 'night-register.' + person.site;
      const entry = d.e.talkEntry(person.id, d.s)!;
      const news = d.e.visibleOptions(entry, d.s).filter((o) => o.option.text === person.news);
      expect(news).toHaveLength(1);
      expect(d.e.node(news[0].option.next!).text).toBe(person.heard[choice]);
      d.talk(person.id, person.news);
      d.s.flags[person.site === 'press' ? 'mill-shift.press.print' : 'mill-shift.' + person.site + '.read'] =
        true;
      expect(d.e.node(d.e.talkEntry(person.id, d.s)!).text).toBe(person.returned);
    }
});
