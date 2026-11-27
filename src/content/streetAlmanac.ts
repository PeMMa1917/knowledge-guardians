import { installAlmanacPrinters } from './almanacPrinters';
import { calendarCases, calendarTopics } from '../domain/streetAlmanac';
import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Hint, Mission, SourceRecord } from '../domain/types';

export const issuedScore: Condition = {
  any: calendarCases.map((c) => ({ all: [specimenEquipped(c.key), { flagSet: 'almanac.' + c.id + '.sentBar' }] })),
};
const rix = 'almanac-rix',
  jori = 'almanac-jori';
function speech(id: string, speaker: string, text: string, options: DialogueNode['options'] = []): DialogueNode {
  return { id: 'almanac.' + id, speaker, text, options, historicalLabel: 'fictional-world' };
}
const dialogue = [
  speech(
    'rix',
    rix,
    'Rix Pottle has written “birthday” on a drum small enough to hide in his coat. Half the letters have rubbed off on the lining. “I promised the street a parade. Then somebody asked me whose birthday.” He slips it over your wrist. “Try standing where I can’t hear you.”',
    [
      { text: 'Tap the drum from behind the closed door.', next: 'almanac.under' },
      { text: 'Show him the dates under the drumskin.', next: 'almanac.takings' },
      { text: 'Ask which entrance he remembers.', if: { flagSet: 'almanac.lastShow' }, next: 'almanac.after' },
    ],
  ),
  speech(
    'under',
    jori,
    'A square of lamplight appears under the door. “He’s tapping. I can feel the hinge in my palm.” Jori opens the door by an inch. She has drawn a tiny dancing heel on the glass. “Did my dancer come through to your side?”',
  ),
  speech(
    'takings',
    rix,
    'Four committee slips. The day a stone came home. The day a man wrote on a card. A date on a title page. A date on a gift receipt. “Four invitations,” Rix says. “I was going to save on printing and put the same heading on all of them.” The back of each slip is still clean.',
  ),
  speech(
    'jori',
    jori,
    'Jori Wicks balances a square of blue glass above a lamp. The street gets a blue dancer. Her side of the window gets a scorch mark. “They wanted a birthday for the shop where I trained. They picked the day it closed. That was when it first made the paper.”',
    [
      { text: 'Hold the glass while she adjusts the frame.', next: 'almanac.frame' },
      { text: 'Ask to see the inside of the shade.', next: 'almanac.shade' },
    ],
  ),
  speech(
    'frame',
    jori,
    'Jori straightens the frame, then steps into the street to see her own dancer for the first time. Through the window, Rix holds the glass very still. “His hands shake on a platform,” she tells you. “Look at them now.”',
  ),
  speech(
    'shade',
    jori,
    'There is a shelf for six little panes. Three are plain glass. “My neighbour works nights. Some mornings I give the tune to the window and leave the drum alone. Some nights she comes down with two spoons and starts us off herself.”',
  ),
  speech(
    'after',
    rix,
    'Rix folds the invitation into a paper house. The printed date fits above a door the size of his thumbnail. He draws one extra window on the side. “Someone always gets the parade from here.”',
  ),
];

const gallery: SourceRecord = {
  id: 'HIS-SG-GALLERY-FRAGMENT',
  title: 'Singapore History Gallery',
  url: 'https://www.nationalmuseum.nhb.gov.sg/whats-on/exhibition/singapore-history-gallery',
  locator: 'Gallery highlight identifying the surviving Singapore Stone fragment',
  supports:
    'The National Museum identifies the Singapore Stone as a surviving part of the inscribed sandstone slab.',
  accessed: '2026-11-27',
  mla: {
    kind: 'page',
    title: 'Singapore History Gallery',
    container: 'National Museum of Singapore',
    showAccessDate: true,
  },
};

export function installStreetAlmanac(pack: ContentPack) {
  pack.sources.push(gallery);
  const mla: Record<string, NonNullable<SourceRecord['mla']>> = {
    'HIS-PRES-06': {
      kind: 'page',
      title: 'Handwritten Report on the Robberies, Page 1',
      author: 'Lucas, Alfred',
      container: 'Tutankhamun: Anatomy of an Excavation',
      repository: 'Griffith Institute, University of Oxford',
      showAccessDate: true,
    },
    'HIS-READING-WORKS-BRAILLE': {
      kind: 'artwork',
      title: 'Procédé pour écrire les paroles, la musique et le plain-chant au moyen de points',
      author: 'Braille, Louis',
      container: 'Internet Archive',
      repository: 'M. C. Migel Library, American Printing House for the Blind',
      showAccessDate: true,
    },
    'HIS-ID-02': { kind: 'page', title: 'Trumpet, Oc.9941', container: 'British Museum', showAccessDate: true },
  };
  for (const s of pack.sources) if (mla[s.id]) s.mla = mla[s.id];
  for (const c of calendarCases) {
    const e = pack.exhibits.find((e) => e.id === c.exhibit)!;
    // At the Market, the two parallel shelf labels make their accession prefixes easy to compare.
    if (c.id !== 'shell') e.name = c.title;
    if (c.id === 'shell') e.dateText += ' The museum records the gift on 18 November 1876.';
    if (c.id === 'volume') e.dateText += ' This copy was scanned on 5 March 2020.';
    e.dateKind += ' ' + c.date;
    e.sources = [...new Set([...e.sources, c.source, c.context])];
    e.art = 'street.' + c.id;
    e.altText = c.alt;
    e.specimen = {
      key: c.key,
      institution: c.institution,
      accession: c.accession,
      source: c.source,
      objective: c.objective,
      people: [c.person],
      fieldUse:
        'Equip this object at the music room off your Nexus collection. Score a date for the street and carry your edition to the window in the City of Copies.',
    };
  }
  pack.characters.push(
    {
      id: rix,
      name: 'Rix Pottle',
      role: 'Street drummer and invitation printer',
      sprite: 'villager-2',
      mode: 'fictional',
      talk: [{ node: 'almanac.rix' }],
    },
    {
      id: jori,
      name: 'Jori Wicks',
      role: 'Glazier and lantern player',
      sprite: 'villager-1',
      mode: 'fictional',
      talk: [{ node: 'almanac.jori' }],
    },
  );
  pack.dialogue.push(...dialogue);
  installAlmanacPrinters(pack);
  const mission: Mission = {
    id: 'KG-CH7-STREET-ALMANAC',
    world: 'WORLD-08',
    title: 'A birthday with four dates',
    knowledgeQuestion: 'Who gets to choose the event an object’s anniversary remembers?',
    stake:
      'The printers have left their invitations blank. A drummer and a glazier want the people at home to get a say in what the street celebrates.',
    objectives: calendarCases.map((c) => ({
      id: 'almanac.' + c.id + '.evening',
      title: c.eveningGoal,
      essential: false,
      visible: { flagSet: 'almanac.' + c.id + '.sentBar' },
      done: { flagSet: 'almanac.' + c.id + '.show' },
      weave: calendarTopics(c),
      onComplete: [{ journal: 'j.almanac.' + c.id }],
    })),
  };
  pack.missions.push(mission);
  for (const [i, o] of mission.objectives.entries()) {
    const c = calendarCases[i];
    pack.journal.push({
      id: 'j.almanac.' + c.id,
      text: 'I brought the printed date to two people who receive the same parade differently. ' + c.reply,
      claimKind: 'observation',
    });
    [
      mission.stake!,
      c.first.line,
      'Open the three leaves in the musicians’ room. Try your six beats from each listening place. You can leave any beat quiet.',
      'Equip this object and carry its issued score to the striped awning in the Copies Record Room. Hear out both listeners and call the entrance.',
    ].forEach((text, index) =>
      pack.hints.push({
        id: 'h.' + o.id + '.' + index,
        depth: (index + 1) as Hint['depth'],
        objective: o.id,
        text,
      }),
    );
  }
}
