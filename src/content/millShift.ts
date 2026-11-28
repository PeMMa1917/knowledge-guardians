import type { Weave } from '../domain/types';

export const millSites = ['nile', 'yard', 'press'] as const;
export type MillSite = (typeof millSites)[number];
export const millWorkers = ['Liri Pell', 'Tessel Fen', 'Aven Dorr'] as const;
export const millHands = [
  'Liri cut the new iron tooth. She has already signed her name on the spare. She wants it on something that works.',
  'Tessel carried blanks up from the boats. He took the long way so the boards stayed dry. The stamp never passed through his hands.',
  'Aven trained both workers. She put her own name on three boards so the guild would accept them. She wishes she had asked Tessel first.',
];
export const millAccounts = {
  nile: {
    title: 'Six brass counters',
    keeper: 'Imani',
    guest: 'q153761',
    guestName: 'Elinor Ostrom',
    opening:
      'The coin in Imani’s shoe has worn a circle in her heel. Six counters were set aside to settle an old mill shift. Three people worked it. Only two of their names reached the pay drawer.',
    work: 'Ostrom sets out three bowls. “Show me who can make a mark under each rule. Tessel can tell you what it costs to have somebody else make yours.”',
    lead: 'At the Metalworks the old mill can still run four bells. At the Copies press Bayette is holding a blank line for whichever account arrives.',
    weave: {
      aoks: ['HUM', 'HIS', 'POL'],
      subjects: ['economics', 'history', 'global-politics'],
      concepts: ['power', 'values', 'responsibility', 'evidence'],
      framework: ['perspectives', 'ethics', 'methods-and-tools'],
    },
  },
  yard: {
    title: 'A mill with an empty rack',
    keeper: 'Hesper',
    guest: 'q37103',
    guestName: 'Florence Nightingale',
    opening:
      'Hesper has kept the old iron tooth. The apprentice would like it thrown in the river. “Everybody calls the new one mine. Nobody remembers who carried the boards.” There are four bells before the demonstration ends.',
    work: 'Nightingale sets a tally beside the wheel. “A total alone will make the busier shift look worse. Give me the turns as well as the slips, and let the next shift repeat your four marks.”',
    lead: 'At the Nile register Imani has the pay bowls. Bayette is still waiting at the Copies press for a slip that tells her which part of the shift was tried again.',
    weave: {
      aoks: ['MAT', 'NAT', 'HUM', 'TEC'],
      subjects: ['math-ai', 'design-tech', 'economics'],
      concepts: ['explanation', 'justification', 'certainty', 'evidence'],
      framework: ['scope', 'methods-and-tools', 'perspectives'],
    },
  },
  press: {
    title: 'The line that ate a worker',
    keeper: 'Bayette',
    guest: 'q6836249',
    guestName: 'Michel-Rolph Trouillot',
    opening:
      'There is room in the headline for an inventor. There is room in the ledger for a paid hand. Bayette’s friend Tessel is kneeling on the floor, picking his name out of the box of spare type. “I knew you kept it,” he says.',
    work: 'Trouillot slides the press bed towards the light. “The slip was made before the book. The book was made before this headline. At which of those doors could Tessel put his own name down?”',
    lead: 'A proof sent back through the registers reaches the people who did the work. Their replies are waiting at the pay bowls and the mill.',
    weave: {
      aoks: ['HIS', 'HUM', 'ART', 'LAN', 'POL'],
      subjects: ['history', 'lang-langlit', 'economics', 'visual-arts'],
      concepts: ['interpretation', 'truth', 'power', 'perspective', 'justification'],
      framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'],
    },
  },
} satisfies Record<
  MillSite,
  {
    title: string;
    keeper: string;
    guest: string;
    guestName: string;
    opening: string;
    work: string;
    lead: string;
    weave: Pick<Weave, 'aoks' | 'subjects' | 'concepts' | 'framework'>;
  }
>;
export const millPages = [
  'The gate book counts working bells. Liri is marked twice, Tessel three times and Aven once. The book lets a porter sign while waiting with a load.',
  'The closed piece book pays the name stamped on each accepted board. Three bear Liri’s mark and three bear Aven’s. Unstamped carrying earns no entry here.',
] as const;
export const millClaims = [
  {
    title: 'Put the iron tooth in the headline',
    line: 'Liri’s new tooth can cut two notches on a turn. Whether it does depends on how many blanks reach the rack.',
    lead: 'Liri asks for the old tooth back. She wants the next apprentice to try both.',
  },
  {
    title: 'Put the night rota in the headline',
    line: 'The extra hand kept the rack supplied. Who received the money depended on which book the pay clerk opened.',
    lead: 'Tessel brings the old pay bowl to the door. Two other porters have come to read beside him.',
  },
  {
    title: 'Set the tooth and the rota side by side',
    line: 'The tooth sets a limit on each turn. The hands on the rota determine whether enough blanks reach it. Either change leaves work for somebody else to do.',
    lead: 'Aven leaves a seat between the wheel and the pay desk. Liri and Tessel can reach it from either side.',
  },
] as const;
export const millCorrections = [
  {
    title: 'Pin the proof where the shifts change',
    reply:
      'Bayette leaves the proof at the door. Aven reads it before work. Tessel’s sister waits for the crowd to thin before she reads the counters.',
  },
  {
    title: 'Send a folded proof to the three workers',
    reply:
      'The three workers open a leaf each before breakfast. At the public door a stranger finds only the earlier notice and must wait for a worker to come out.',
  },
] as const;
export function millWeave(site: MillSite, extended = false): Weave {
  return {
    ...millAccounts[site].weave,
    atl: ['thinking', 'research', 'communication'],
    minutes: extended ? 5 : 3,
    thinking: extended
      ? { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' }
      : { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' },
  };
}
