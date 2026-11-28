import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Effect, Hint, Objective, Weave } from '../domain/types';
import records from './shore-reply-records.json';

export const SHORE_REPLY_GATE: Condition = { objective: 'sea.arrival' };
export const SHORE_REPLY_ROOM = 'sea.signal-shed';
export const SHORE_REPLY_PIER = 'observatory.harbour';
export const SHORE_REPLY_LAST = 'shore-reply.current-delivery';

export const SHORE_REPLY_CASES = records.map((record) => {
  const flag = `shore-reply.${record.slug}`;
  return {
    ...record, flag, source: `HIS-REPLY-SHORE-${record.slug.toUpperCase()}`,
    exhibit: `OBJ-REPLY-SHORE-${record.slug.toUpperCase()}`, card: `card.${flag}`,
    art: `${flag}.case`, check: `${flag}.checked`, received: `${flag}.received`,
    returnProp: `shore-reply-${record.slug}-return`,
  };
});

export type ShoreReplyCase = (typeof SHORE_REPLY_CASES)[number];
export type TrialStep = 'first' | 'second';
export type PierStop = 'high' | 'low';

export const SHORE_STEPS: TrialStep[] = ['first', 'second'];
export const PIER_STOPS: PierStop[] = ['high', 'low'];
export const shoreOpen = (entry: ShoreReplyCase): Condition => ({ card: entry.card });
export const shoreSet = (entry: ShoreReplyCase, step: TrialStep): Condition => ({
  flag: `${entry.flag}.${step}.positioned`, eq: true,
});
export const shoreSeen = (entry: ShoreReplyCase, step: TrialStep): Condition => ({
  flag: `${entry.flag}.${step}.seen`, eq: true,
});
export const shoreEquipped = (entry: ShoreReplyCase): Condition => ({
  all: [{ objective: entry.check }, specimenEquipped(entry.key)],
});
export const shoreDelivered = (entry: ShoreReplyCase, stop: PierStop): Condition => ({
  all: [{ flag: SHORE_REPLY_LAST, eq: entry.slug }, { flag: `${entry.flag}.landing`, eq: stop }],
});

const shoreLeader = 'shore-reply-velna';
const deckReader = 'shore-reply-miri';
const quayReader = 'coast-signalkeeper';

const optionsByType: Record<string, [string, string]> = {
  chart: ['Clip a chart detail into the table’s frame. The separate view below will show what the line still covers.',
    'Reader here. Bring the other part beside the footmark so the next person knows which piece you moved.'],
  signal: ['I’ll hold the signal here. Set the first cue and see whether it reaches the watching end.',
    'You’re at the receiving window now. Set the second marker here and check the dispatch-side card for its reply.'],
  ledger: ['Check the object’s working record. Fit the paper in the issue tray and check what the left intake records.',
    'The issue stays visible. Open the matched local file and compare the second custody record at its own tray.'],
};

function workDialogue(entry: ShoreReplyCase): DialogueNode[] {
  const pair = optionsByType[entry.family];
  return SHORE_STEPS.map((step, index) => {
    const ifAvailable: Condition = {
      all: [shoreOpen(entry), ...(step === 'second' ? [shoreSeen(entry, 'first')] : [])],
    };
    return {
      id: `${entry.flag}.${step}`, speaker: step === 'first' ? shoreLeader : deckReader,
      text: pair[index], historicalLabel: 'fictional-world',
      options: [{
        text: step === 'first' ? entry.firstAction : entry.secondAction, if: ifAvailable,
        effects: [{ setFlag: `${entry.flag}.${step}.positioned`, value: true }],
      }, { text: 'Leave the practice tray open.' }],
    };
  });
}

function sendPair(entry: ShoreReplyCase, stop: PierStop): Effect[] {
  return [{ setFlag: SHORE_REPLY_LAST, value: entry.slug }, { setFlag: `${entry.flag}.landing`, value: stop }];
}

function returnDialogue(entry: ShoreReplyCase): DialogueNode {
  return {
    id: `${entry.flag}.return`, speaker: quayReader, text: entry.returnEvidence, historicalLabel: 'fictional-world',
    options: [...PIER_STOPS.map((stop) => ({
      text: stop === 'high' ? entry.high : entry.low, if: shoreEquipped(entry),
      effects: sendPair(entry, stop),
    })), { text: 'Keep the outgoing slip at the cabinet.' }],
  };
}

export function shoreReceipt(entry: ShoreReplyCase, stop: PierStop): string {
  const publicBoard = {
    chart: 'The lookout clips the chosen locator to its dated observation line. The full route’s gaps stay marked.',
    signal: 'The lookout logs a clear viewing position and the cue received there. The low receiver’s line is left open.',
    ledger: 'The upper index can be read immediately. The original file retains any private or uncertain entries.',
  };
  const staffedReply = {
    chart: 'A lower runner checks the named place with the folded working card. The whole chart is still available in the shelter.',
    signal: 'The lower receiver checks the written reply and signs for the local stop. The keeper keeps the visible cue separately.',
    ledger: 'The clerk uses the two named record roles to enter a separate receipt, leaving the source slip in its own file.',
  };
  const reply = stop === 'high' ? publicBoard : staffedReply;
  return `${stop === 'high' ? entry.high : entry.low} ${reply[entry.family as keyof typeof reply]} ${entry.limit}`;
}

function topics(entry: ShoreReplyCase): Weave {
  switch (entry.family) {
    case 'chart':
      return {
        concepts: ['evidence', 'interpretation', 'perspective', 'explanation'],
        atl: ['thinking', 'research'], aoks: ['HIS', 'NAT'], subjects: ['geography', 'history'],
        framework: ['scope', 'perspectives', 'methods-and-tools'], minutes: 5,
        thinking: { dok: 2, bloom: 'analyse', fink: 'application', solo: 'relational' },
      };
    case 'signal':
      return {
        concepts: ['evidence', 'truth', 'certainty', 'objectivity', 'explanation'],
        atl: ['thinking', 'communication'], aoks: ['NAT', 'TEC'], subjects: ['physics', 'design-tech'],
        framework: ['scope', 'methods-and-tools'], minutes: 5,
        thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' },
      };
    default:
      return {
        concepts: ['evidence', 'justification', 'power', 'interpretation', 'responsibility'],
        atl: ['thinking', 'research'], aoks: ['HIS', 'HUM'], subjects: ['history'],
        framework: ['ethics', 'methods-and-tools'], minutes: 5,
        thinking: { dok: 2, bloom: 'analyse', fink: 'integration', solo: 'relational' },
      };
  }
}

function shoreObjectives(entry: ShoreReplyCase): Objective[] {
  return [{
    id: entry.check, title: `Complete the source handover for ${entry.title}`, essential: false,
    visible: shoreOpen(entry),
    done: { all: [shoreOpen(entry), ...SHORE_STEPS.map((step) => shoreSeen(entry, step))] },
    onComplete: [{ journal: `j.${entry.flag}.check` }], weave: topics(entry),
  }, {
    id: entry.received, title: `Use “${entry.title}” on a separate Slate Harbour delivery`, essential: false,
    visible: { objective: entry.check },
    done: { all: [{ objective: entry.check }, { flag: `${entry.flag}.landed`, eq: true }] },
    onComplete: [{ journal: `j.${entry.flag}.received` }],
    weave: { concepts: ['values', 'responsibility', 'power', 'perspective'],
      atl: ['communication', 'social', 'thinking'], aoks: ['HIS', 'TEC'], subjects: ['history', 'geography'],
      framework: ['perspectives', 'ethics', 'methods-and-tools'], minutes: 4,
      thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' } },
  }];
}

function shoreHints(entry: ShoreReplyCase): Hint[] {
  const first = [
    'Open an exact case before using its fictional practice piece.',
    'Operate the issue stand. The first result appears at a different checking position.',
    'Use the checked result to open the second operation. Walk back to see the second record.',
    `Read case ${entry.accession}. Set the first working position and read what it changes. Act from the next stand, then read the second result. Return to the case to take the loan.`,
  ];
  const second = [
    'The checked object can travel in the satchel.',
    'Equip it and visit the east pier at Slate Harbour.',
    'Anwen can arrange an upper sight check or a separately signed lower reply.',
    `Equip the loan for ${entry.accession}. Open the east-pier cabinet at Slate Harbour. Make a delivery and follow it to the displayed recipient.`,
  ];
  return [first, second].flatMap((texts, i) => texts.map((text, n) => ({
    id: `h.${entry.flag}.${i + 1}.${n + 1}`, depth: (n + 1) as Hint['depth'],
    objective: i === 0 ? entry.check : entry.received, text,
  })));
}

export const shoreReplyContent: Partial<ContentPack> = {
  characters: [{
    id: shoreLeader, name: 'Velna Cair', mode: 'fictional', sprite: 'clerk-venn',
    role: 'Signal shed keeper who keeps the outgoing register', talk: [{ node: 'shore-reply.welcome' }],
  }, {
    id: deckReader, name: 'Miri Vale', mode: 'fictional', sprite: 'scholar-sefa',
    role: 'Recipient of the shed’s independent practice signals', talk: [{ node: 'shore-reply.receiver' }],
  }],
  dialogue: [{
    id: 'shore-reply.welcome', speaker: shoreLeader, historicalLabel: 'fictional-world',
    text: 'I can mark that a slip left my hands. You’ll need Miri to say that it reached hers. Try the model for any loan. She puts a different mark at the receiving end.',
  }, {
    id: 'shore-reply.receiver', speaker: deckReader, historicalLabel: 'fictional-world',
    text: 'If Velna asks whether I saw a signal, I tell her exactly where I was. Once you’ve seen both ends, try it on the older pier at Slate Harbour.',
  }, ...SHORE_REPLY_CASES.flatMap((entry) => [...workDialogue(entry), returnDialogue(entry)])],
  missions: [{
    id: 'shore-reply', title: 'The Reply from Shore', world: 'WORLD-09',
    knowledgeQuestion: 'What can a receiver verify when a message was designed for somebody else’s view?',
    stake: 'A keeper who sees only the outgoing slot can mark somebody served while their lower receiver still has nothing to use.',
    available: SHORE_REPLY_GATE, caseVisits: SHORE_REPLY_CASES.map((entry) => [entry.check, entry.received]),
    objectives: SHORE_REPLY_CASES.flatMap(shoreObjectives),
  }],
  exhibits: SHORE_REPLY_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, art: entry.art, dateText: entry.date, dateKind: entry.dateKind,
    historicalLabel: 'documented', summary: entry.summary, sources: [entry.source], grantsCard: entry.card,
    altText: `Original diagram for the fictional ${entry.family} exercise linked to ${entry.accession}. The exhibit text describes the original object.`,
    specimen: {
      key: entry.key, institution: entry.institution, accession: entry.accession, objective: entry.check,
      source: entry.source, revisit: {
        map: SHORE_REPLY_PIER, prop: entry.returnProp, method: 'Hand over a narrower view or a separate acknowledgement.',
        hint: 'Equip the loan and use the working cabinet at the east pier in Slate Harbour.',
      },
    },
  })),
  sources: SHORE_REPLY_CASES.map((entry) => ({
    id: entry.source, title: `${entry.institution}, ${entry.title} (${entry.accession})`, url: entry.url,
    accessed: '2026-11-26', locator: 'Object identity, credited role, dated production or use, and catalogue description',
    supports: entry.summary, mla: { kind: 'page', title: entry.title, container: entry.institution, showAccessDate: true },
  })),
  cards: SHORE_REPLY_CASES.map((entry) => ({
    id: entry.card, title: `${entry.accession} · ${entry.title}`, historicalLabel: 'documented',
    claimKind: 'observation', text: entry.summary, limits: entry.limit, sources: [entry.source],
  })),
  hints: SHORE_REPLY_CASES.flatMap(shoreHints),
  journal: SHORE_REPLY_CASES.flatMap((entry) => [{
    id: `j.${entry.flag}.check`, claimKind: 'simulation' as const, text: `${entry.firstView} ${entry.secondView}`,
  }, {
    id: `j.${entry.flag}.received`, claimKind: 'simulation' as const,
    text: `The east pier logged the actual receipt for ${entry.accession}. ${entry.limit}`,
  }]),
};
