import visits from './hall-visitors.json';
import { PASSAGES } from '../domain/corridor';
import type { ContentPack, DialogueNode, DialogueOption } from '../domain/types';

export function installHallVisits(pack: ContentPack): void {
  for (const trip of visits) {
    const person = pack.characters.find(c => c.id === trip.person)!;
    const key = 'journeyman.' + person.id;
    const home = PASSAGES[trip.home - 1];
    const away = PASSAGES[trip.away - 1];
    person.localGreeting = { ...person.localGreeting, [home.hall]: key + '.home', [away.hall]: key + '.away' };
    const say = (id: string, text: string, options?: DialogueOption[]): DialogueNode => ({
      id: key + '.' + id, speaker: person.id, text, options, historicalLabel: 'fictional-world',
    });
    const packOptions: DialogueOption[] = trip.packs.map((text, i) => ({
      text, next: key + '.sent', effects: [
        { setFlag: key + '.packet', value: i }, { setFlag: key + '.travelling', value: true },
        { setFlag: key + '.reported', value: false },
      ],
    }));
    const returnOptions: DialogueOption[] = trip.answers.map((text, i) => ({
      text, next: key + '.settled' + i, effects: [
        { setFlag: key + '.reply', value: i }, { setFlag: key + '.travelling', value: false },
      ],
    }));
    pack.dialogue.push(
      say('home', trip.opening, [
        ...trip.returns.map((_, i) => ({
          text: 'Hear what came home from ' + away.name, if: { flag: key + '.reply', eq: i },
          next: key + '.return' + i, effects: [{ setFlag: key + '.reported', value: true }],
        })),
        ...packOptions, { text: 'Leave the visit for another day' },
      ]),
      say('sent', trip.departure),
      say('away', trip.meeting, trip.packs.map((text, i) => ({
        text: 'Unpack the parcel · ' + text, if: { flag: key + '.packet', eq: i }, next: key + '.trace' + i,
      }))),
    );
    for (const i of [0, 1]) {
      pack.dialogue.push(
        say('trace' + i, trip.traces[i], returnOptions),
        say('settled' + i, trip.results[i] + ' We can meet again in ' + home.name + '.'),
        say('return' + i, trip.returns[i], [...packOptions, { text: 'Leave the keeper at home' }]),
      );
    }
  }
}
