import type { ContentPack, DialogueNode, Hint } from '../domain/types';
import {
  originFlag,
  originWeave,
  origins,
  originPlaces,
  type Origin,
} from '../domain/originInstruments';

export const homecomingMap = 'council.gallery';
type LastNight = {
  gift: string;
  task: string;
  note: string;
  meeting: string;
  direction: string;
  trace: string;
  from: [string, string];
  use: [string, string];
  result: [string, string];
  back: [string, string];
};
const lastNights: Record<Origin, LastNight> = {
  archive: {
    task: "Follow Bela’s empty envelope to the Council gallery.",
    note: "I found a place for the envelope from the school that closed. The address someone put on it may outlast the drawer.",
    meeting: "Bela tastes the glue on the flap. “Mina made me promise somebody could find it. She never said it had to stay here.”",
    direction: "Bela is taking a schoolchild’s empty envelope to the Council gallery.",
    trace: "Find out where Mina’s envelope went.",
    gift: 'Bela has carried an envelope with nothing in it all the way to Council. The old school is closing. A pupil asked her to carry the absence of their model into the new catalogue.',
    from: [
      'The reader who started with the school’s name has written the address on it.',
      'A maker sketched the seam on the back. The school name is still inside.',
    ],
    use: [
      'Give the empty envelope a drawer of its own',
      'Put the envelope in the child’s travelling case',
    ],
    result: [
      'A visitor looking for the gift finds a record of its absence. The pupil lets Bela put a forwarding address inside the flap.',
      'The child carries the empty envelope to their new school. A visitor to the old drawer will need to ask Bela where it went.',
    ],
    back: [
      'Beside the model drawer is a space the size of a child’s envelope. Under it someone has written ASK WHERE IT WENT.',
      'There is a new stamp from another school on Bela’s desk. The envelope is travelling again.',
    ],
  },
  traveller: {
    task: "Carry a band cue back to Lio’s sister in the Council gallery.",
    note: "I saw Lio’s sister lift her baton from the back. For once we could all see whose hand gave the last beat.",
    meeting: "Lio turns the baton over. Their sister scratched a tiny arrow on its handle, pointing back at whoever holds it. The players start tuning.",
    direction: "Lio’s sister wants her baton at the Council gallery before the band begins.",
    trace: "See whose hands have marked the baton.",
    gift: 'Lio’s sister has sent her old baton to the gallery. It comes with a request. “I would like to play from the back again. I would also like somebody to hear me finish.”',
    from: [
      'The departure caller has pinned a small brass clock to its case.',
      'The island conductor has sent the last player’s stand with it.',
    ],
    use: [
      'Keep the last beat for Lio’s sister',
      'Pass the baton back through the whole band',
    ],
    result: [
      'The players turn on the last beat. A girl at the very back gets one note entirely to herself. The travelling clock keeps running.',
      'Each musician holds the baton once. The band finishes late enough to miss the usual boat, laughing when they notice the silent runner waiting by the door.',
    ],
    back: [
      'Lio has drawn a rest after the last figure on the paper gate. A note can come from behind it.',
      'There are coloured thumbprints all the way down the baton in Lio’s little model. The clock still belongs to the gate.',
    ],
  },
  harbour: {
    task: "Look under Tamar’s boat at the Council arrivals board.",
    note: "The arrivals clerk showed me who got to sign the line. I turned the little hull over to see who had carried it there.",
    meeting: "Tamar almost rubs the signature off with a thumb. “I taught them to keep their name off public boards.” The child holds out the chalk anyway.",
    direction: "Tamar is saving the bottom of the tin boat for someone at the Council arrivals board.",
    trace: "Turn the little boat over once more.",
    gift: 'Tamar turns the little tin boat upside down. Underneath, in the dock child’s writing, somebody has scratched “I brought it.” The Council has room for one more name on the arrivals board.',
    from: [
      'The child learned to read a blank peg hole beside the signed receipt.',
      'The second boat brought back a different tide mark from the stall.',
    ],
    use: [
      'Let the child sign for carrying the boat',
      'Give the empty line to the person who counted the carts',
    ],
    result: [
      'The child signs while Tamar steadies the board. The market still needs a separate count. Everybody can find the person who ferried the message.',
      'The loader writes a count and a place. The child turns the little hull over to show a younger runner the signature underneath.',
    ],
    back: [
      'A small copy of a child’s delivery signature hangs where the market runners take turns. The price board still has a blank.',
      'Tamar has polished the underside of the boat. A name you can only see by picking it up is still there.',
    ],
  },
  workshop: {
    task: "Save Hesper a place at the opening in the Council gallery.",
    note: "Ren and I found Hesper at the opening. I had seen that curled corner measured in millimetres. Tonight it could mark a place for a person.",
    meeting: "Hesper arrives with a spare brass button in her hand. “Somebody said my ticket was ruined.” Ren has kept the little clip in a coat pocket all this time.",
    direction: "Hesper has asked for the last ticket at the Council gallery. Ren is holding it for her.",
    trace: "Look for the ticket Hesper carried home.",
    gift: 'Hesper wants the very last ticket. Ren has two pieces left, one with a curl and one with the crossed-out word ALWAYS. Neither has a seat number. “She did come,” Ren says.',
    from: [
      'The later sheet showed a different curl. Ren copied both batch names onto the envelope.',
      'The old ticket hung in a window. A stranger asked to see the rest of the packet.',
    ],
    use: [
      'Make Hesper a seat with the curled ticket',
      'Give Hesper the crossed-out notice to keep',
    ],
    result: [
      'Hesper chooses a chair against the wall. Ren draws her seat number above the curled corner, where she can find it with a thumb.',
      'Hesper folds the notice into her work apron. “I kept my first one too.” She asks the ticket seller for a place near the door.',
    ],
    back: [
      'Hesper’s brass button is on the clip again. The ticket beneath it has a real seat number and a corner Ren chose to keep.',
      'Ren has left the wall notice blank. Beside it is an apron pattern with a pocket big enough for a first mistake.',
    ],
  },
  singer: {
    task: "Meet the traveller beside Teodora’s fourth stool at Council.",
    note: "I heard one word Teodora recognised in a stranger’s verse. We could give the traveller a place and leave a space for the family’s line.",
    meeting: "The traveller folds a coat over the stool. “My aunt always sang while she put things away. She would have hated me standing up to do this.” Teodora sits down first.",
    direction: "A traveller with a different fourth verse is waiting beside Teodora’s stool in the Council gallery.",
    trace: "Look under the stool for news of the traveller.",
    gift: 'The fourth stool has arrived at Council folded into the third. A stranger knows a verse their aunt sang. Teodora recognises one word. The stranger is leaving on the dawn boat.',
    from: [
      'A late singer had the first entrance in the foyer. This traveller heard the song through the door.',
      'The shared quiet in the foyer left room for one more person to hum.',
    ],
    use: [
      'Make space for the traveller’s verse tonight',
      'Give the traveller the fourth stool for their next stop',
    ],
    result: [
      'Teodora introduces the traveller and their aunt by name. One old word sounds familiar. Beside the family’s missing verse she writes “still listening”.',
      'The stranger carries the stool to the dawn boat. Teodora sings three family verses on three seats and asks what might come back on the next tide.',
    ],
    back: [
      'There are two scraps of paper under the fourth stool. One names a traveller’s aunt. The other waits for the family line.',
      'The smallest stool is away. There is a chalk outline on the floor so nobody sets a crate where it belongs.',
    ],
  },
};
export const councilDirection = (o: Origin) => lastNights[o].direction;
export const originReturned = (o: Origin) => ({
  all: [{ origin: o }, { objective: 'origin-tour.' + o + '.tour' }],
});
export function homecomingDialogue(pack: ContentPack) {
  for (const o of origins) {
    const [, away, who] = originPlaces[o],
      h = lastNights[o],
      k = 'origin-final.' + o;
    const goal = 'origin-tour.' + o + '.homecoming';
    pack.missions.find((m) => m.id === 'KG-CH1-O-' + o)!.objectives.push({
      id: goal, title: h.task, essential: false, visible: originReturned(o),
      done: { flagSet: originFlag(o, 'homecoming') }, weave: originWeave[o],
      onComplete: [{ journal: 'j.' + goal }],
    });
    pack.journal.push({ id: 'j.' + goal, text: h.note, claimKind: 'interpretation' });
    [h.direction, h.gift, h.meeting, h.use.join(' / ')].forEach((text, i) =>
      pack.hints.push({id:'h.' + goal + '.' + i, depth:(i+1) as Hint['depth'],objective:goal,text}));
    const say = (
      id: string,
      text: string,
      options: DialogueNode['options'] = [],
    ): DialogueNode => ({
      id: k + '.' + id,
      speaker: who,
      text,
      options,
      historicalLabel: 'fictional-world',
    });
    const person = pack.characters.find((c) => c.id === who)!;
    person.localGreeting = {
      ...person.localGreeting,
      [homecomingMap]: k + '.visit',
    };
    pack.dialogue.push(
      say(
        'visit',
        h.gift,
        h.from.map((text, i) => ({
          text,
          if: {
            flag: originFlag(o, 'returned'),
            eq: i === 0 ? 'first' : 'second',
          },
          next: k + '.offer',
        })),
      ),
      say(
        'offer',
        h.meeting,
        h.use.map((text, i) => ({
          text,
          next: k + '.answer.' + i,
          effects: [
            {
              setFlag: originFlag(o, 'homecoming'),
              value: i === 0 ? 'kept' : 'given',
            },
          ],
        })),
      ),
      ...h.result.map((text, i) => say('answer.' + i, text)),
      ...h.back.map((text, i) => say('home.' + i, text)),
    );
    const names = ['kept', 'given'];
    const options = names.map((v, i) => ({
      text: h.trace,
      if: { flag: originFlag(o, 'homecoming'), eq: v },
      next: k + '.home.' + i,
    }));
    for (const id of ['os.' + o + '.idle', person.localGreeting[away]]) {
      const n = pack.dialogue.find((n) => n.id === id)!;
      n.options = [...options, ...(n.options ?? [])];
    }
  }
}
