import { composingRoom, paradeRoom, calendarCases, calendarTopics } from '../domain/streetAlmanac';
import type { ContentPack, DialogueNode, Hint, Mission } from '../domain/types';

export const almanacPrinters = {
  stone: {
    character: 'almanac-bland',
    surname: 'Bland',
    role: 'Surgeon and early copyist of the Singapore Stone',
    greeting:
      'William Bland lays a scrap across the edge of Jori’s lantern. Half of his pencil line falls across the hole in the scrap. “When I stood by the river I had the whole slab in front of me. My hand could keep only so much of it.” He holds his own sheet up beside the surviving edge.',
    tools: ['Trace the surviving boundary onto the invitation.', 'Clip the old copy beside the broken edge.'],
    marks: ['border of the surviving stone', 'outline beside an early copy'],
    responses: [
      'Bland guides the pencil to the last visible mark, then lifts it. The white paper beyond the boundary stays clean.',
      'The two edges fail to meet. Bland turns the lamp a little and leaves the space between the sheets uncovered.',
    ],
    return: 'A builder has asked him to extend the missing line to make a sign fit its frame.',
    callbacks: [
      'He trims the frame down to the surviving outline. The sign takes less space and the river still runs off its edge.',
      'He gives the second sheet its own frame. A passer-by can follow the copy and still see where the surviving stone ends.',
    ],
  },
  report: {
    character: 'almanac-lucas',
    surname: 'Lucas',
    role: 'Conservator and author of the February 1923 report',
    greeting:
      'Alfred Lucas has given Rix two slips about the same untidy room. On one somebody put things down that way. On the other somebody moved them later. “The disorder is on both slips.” He lays his handwritten report in between. “Which face of this page will your visitor get?”',
    tools: ['Leave the changed verbs visible in the block.', 'Set a clear reading beside the manuscript card.'],
    marks: ['visible revisions on the reporting card', 'reading beside the original handwriting'],
    responses: [
      'A line of ink crosses the first verb. The later word is still squeezed above it. “They can watch me try to say what I saw,” Lucas says.',
      'Lucas puts the clear type beside the crowded card. A reader can follow the line easily, then turn back to the alterations at the point where the wording matters.',
    ],
    return:
      'Two stagehands have scattered their rehearsal tickets. Lucas has arrived with a tray to keep each ticket where it fell.',
    callbacks: [
      'Jori draws a second outline around a ticket that someone has already moved. The first position stays visible.',
      'Rix reads a clean list into the stairwell. The stagehands call him back to an uncertain word he can check against the card.',
    ],
  },
  volume: {
    character: 'orchard-louis-braille',
    surname: 'Braille',
    role: 'Designer of writing and music notation using points',
    greeting:
      'Louis Braille slips the invitation under the closed window. Rix can see its heading through the pane. Louis asks him to find the first beat with his hand while Jori folds the lamp away. Rix’s finger slides straight across the ink. There is a grooved practice strip on the sill.',
    tools: ['Fit a raised corner to the practice strip.', 'Put a second, visible start mark beside the strip.'],
    marks: ['a corner that the hand can return to', 'a visible starting place beside the same strip'],
    responses: [
      'Rix comes back to the corner three times with his eyes closed. Louis lets him set the starting corner himself on the last pass. The flat image of the library page stays alongside for another kind of reading.',
      'Jori lines up the start mark with a nick in the window frame. A reader outside finds beat one while the hand inside can still turn the strip. The marker belongs to the street performance.',
    ],
    return: 'A young caller wants to conduct from the far side of the window this evening.',
    callbacks: [
      'Rix makes a little pocket for the corner so the strip stays under the caller’s hand while the street moves.',
      'Jori lowers the extra mark to the height of the young caller’s eyes. The grown-ups at the back wait for a smaller hand to rise.',
    ],
  },
  shell: {
    character: 'almanac-gill',
    surname: 'Gill',
    role: 'Collector named in the British Museum record for Oc.9941',
    greeting:
      'William Wyatt Gill recognises his name on a museum slip. Rix lifts a pen towards the line for the maker. Gill puts a second slip under the nib. His name is on the line about collecting. Jori asks where the other line will go on their printed page.',
    tools: ['Keep a place open for the maker.', 'Separate the collector and donor on two slips.'],
    marks: ['an open maker line', 'separate collecting and gift slips'],
    responses: [
      'Rix leaves the line wide enough for a name. Jori stands the receipt for Franks’s gift at the side. The person who made this shell instrument still has a place in the programme.',
      'One slip names Gill. Another names Franks. Each describes a different part of the route from Mangaia to the museum. Neither supplies the maker’s name.',
    ],
    return: 'The invitation printer has room for a single name on the front of the envelope.',
    callbacks: [
      'Rix keeps the maker line open on the front and folds the dated gift record inside for the reader.',
      'Jori turns the envelope over for a second line. Both names have room beside their jobs. The front carries the object number.',
    ],
  },
} as const;

export function installAlmanacPrinters(pack: ContentPack) {
  const errands: Mission = {
    id: 'KG-CH7-INVITATION-BLOCKS',
    world: 'WORLD-08',
    title: 'Ink on both sides',
    knowledgeQuestion: 'What gets harder to see when an editor makes a record easier to read?',
    stake:
      'The printer has left one picture block open for the guest. What they set in that space must survive the trip to the street.',
    objectives: [],
  };
  for (const c of calendarCases) {
    const p = almanacPrinters[c.id as keyof typeof almanacPrinters],
      id = 'almanac.printer.' + c.id;
    const existing = pack.characters.find((w) => w.id === p.character);
    const greets = { [composingRoom]: id, [paradeRoom]: id + '.return' };
    if (existing) existing.localGreeting = { ...existing.localGreeting, ...greets };
    else
      pack.characters.push({
        id: p.character,
        name: c.person.name,
        role: p.role,
        mode: 'historical',
        sprite: 'villager-2',
        localGreeting: greets,
        talk: [{ node: id }],
      });
    const line = (
      suffix: string,
      text: string,
      options: DialogueNode['options'] = [],
      speaker = p.character as string,
    ): DialogueNode => ({
      id: id + suffix,
      speaker,
      text,
      options,
      historicalLabel: speaker === p.character ? 'imagined-alternate' : 'fictional-world',
      citationSource: speaker === p.character ? c.source : undefined,
    });
    const flag = 'almanac.' + c.id + '.block',
      printed = 'almanac.' + c.id + '.sentBlock';
    pack.dialogue.push(
      line(
        '',
        p.greeting,
        p.tools.map((text, i) => ({ text, next: id + '.block.' + i, effects: [{ setFlag: flag, value: i }] })),
      ),
      line('.return', p.return, [
        ...p.marks.map((mark, i) => ({
          text: 'Unfold the invitation with ' + mark + '.',
          if: { flag: printed, eq: i },
          next: id + '.after.' + i,
        })),
        {
          text: 'Turn the still-unmarked invitation over.',
          if: { not: { flag: printed, in: [0, 1] } },
          next: id + '.plain',
        },
      ]),
      line(
        '.plain',
        'The two faces of the envelope have been left clear. “You can still choose which of us begins,” Jori says. She closes one hand over the blue dancer.',
        [],
        'almanac-jori',
      ),
      ...p.responses.map((text, i) => line('.block.' + i, text)),
      ...p.callbacks.map((text, i) => ({
        ...line('.after.' + i, text, [], 'almanac-jori'),
        effects: [{ setFlag: 'almanac.' + c.id + '.unfolded', value: i }],
      })),
    );
    const proof = 'almanac.' + c.id + '.proof';
    errands.objectives.push({
      id: proof,
      title: c.blockGoal,
      essential: false,
      visible: { flag: printed, in: [0, 1] },
      done: { flag: 'almanac.' + c.id + '.unfolded', in: [0, 1] },
      weave: { ...calendarTopics(c), thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' } },
      onComplete: [{ journal: 'j.' + proof }],
    });
    pack.journal.push({
      id: 'j.' + proof,
      text: 'I took the printed invitation back to ' + c.person.name + '. ' + p.return,
      claimKind: 'observation',
    });
    [
      errands.stake!,
      c.person.detail,
      'Carry the equipped object into the musicians’ room and choose a picture block with the visitor. Send an invitation after you have listened from both places.',
      'Find the same visitor beside the striped awning in the Copies Record Room. Open the envelope they received.',
    ].forEach((text, n) =>
      pack.hints.push({ id: 'h.' + proof + '.' + n, depth: (n + 1) as Hint['depth'], objective: proof, text }),
    );
  }
  pack.missions.push(errands);
}
