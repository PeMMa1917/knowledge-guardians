import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Hint, Objective } from '../domain/types';
import records from './price-drawers-records.json';

export const PRICE_ROOM = 'market.price-drawers';
export const PRICE_RETURN = 'aethelgard.emberford';
export const PRICE_READY: Condition = { flag: 'market.arrived', eq: true };
export const PRICE_ACTIVE = 'price-drawers.active';
export const PRICE_RETURN_ACTIVE = 'price-drawers.receive';
export const PRICE_MODES = ['offer', 'check'] as const;
export type PriceMode = typeof PRICE_MODES[number];

export const PRICE_CASES = records.map((record) => {
  const flag = `price-drawers.${record.slug}`;
  return { ...record, flag, source: `HIS-PRICE-DRAWERS-${record.slug.toUpperCase()}`,
    exhibit: `OBJ-PRICE-DRAWERS-${record.slug.toUpperCase()}`, card: `card.${flag}`,
    art: `${flag}.case`, checked: `${flag}.checked`, returned: `${flag}.returned`,
    returnProp: `price-drawers-${record.slug}-return` };
});
export type PriceCase = (typeof PRICE_CASES)[number];
const minidokaContext = {
  id: 'HIS-PRICE-MINIDOKA-CONTEXT',
  title: 'National Park Service, Minidoka National Historic Site',
  url: 'https://www.nps.gov/miin/index.htm',
  accessed: '2026-11-26',
  locator: 'Site overview and historical introduction',
  supports: 'People of Japanese ancestry were forcibly removed from their homes and incarcerated at Minidoka during World War II.',
};
const priceSources = (entry: PriceCase) => entry.slug === 'minidoka-letter'
  ? [entry.source, minidokaContext.id] : [entry.source];


const clerk = 'price-drawers-sella';
export const priceRead = (entry: PriceCase): Condition => ({ card: entry.card });
export const priceTurn = (entry: PriceCase, mode: PriceMode): Condition => ({
  all: [{ flag: PRICE_ACTIVE, eq: entry.slug }, { flag: `${entry.flag}.mode`, eq: mode }],
});
export const priceEquipped = (entry: PriceCase): Condition => ({
  all: [{ objective: entry.checked }, specimenEquipped(entry.key)],
});
export const priceReceived = (entry: PriceCase, mode: PriceMode): Condition => ({
  all: [{ flag: PRICE_RETURN_ACTIVE, eq: entry.slug }, { flag: `${entry.flag}.return-mode`, eq: mode }],
});

const counterUse = {
  count: ['The visible figure lets one buyer compare quickly. The output shows which entry it counts.',
    'The clerk keeps the entries in separate rows before adding. A buyer can follow a figure to its own mark.'],
  token: ['The first seller recognises the placed mark and shows where it is useful. The displayed amount stays with that issuer.',
    'The second seller puts its own rule beside the sample. The first seller’s acceptance does not fill the second’s blank.'],
  record: ['A waiting reader can use the date and named purpose of the record immediately. A different event retains its own space.',
    'The receipt reader matches the purpose and the date to a separate practice transaction. The advertised or pictured event stays in its own row.'],
  permit: ['With the category visible, a buyer can proceed to the right counter. The placed paper does not fill the delivery slot.',
    'A counter worker checks one case, then puts the confirmed use beside the stated terms. Other buyers need a separate check.'],
} as const;

export function priceReceipt(entry: PriceCase, mode: PriceMode, emberford = false): string {
  const role = mode === 'offer' ? 0 : 1;
  const receipt = counterUse[entry.family as keyof typeof counterUse][role];
  const form = mode === 'offer' ? entry.offer : entry.check;
  const recipient = emberford
    ? mode === 'offer' ? 'Hana follows the new public tab. The waiting buyer gets an immediate comparison and can request a separate check.'
      : 'Hana leaves the current buyer’s checked slip with the staffed tray. Later readers request its check instead of assuming it applies to them.'
    : receipt;
  return `${form} ${recipient} ${entry.limit}`;
}

function dialogue(entry: PriceCase): DialogueNode[] {
  return [{
    id: `${entry.flag}.trial`, speaker: clerk, historicalLabel: 'fictional-world',
    text: 'This drawer has two working pockets. Put a scoped copy on the offer rail for a first comparison, or file it at the staffed counter for a particular check. Walk to the receiving point and see what the clerk can do.',
    options: [...PRICE_MODES.map((mode) => ({
      text: entry[mode], if: priceRead(entry),
      effects: [{ setFlag: PRICE_ACTIVE, value: entry.slug }, { setFlag: `${entry.flag}.mode`, value: mode }],
    })), { text: 'Leave room for the next person.' }],
  }, {
    id: `${entry.flag}.return`, speaker: 'stallkeeper-hana', historicalLabel: 'fictional-world',
    text: 'One customer needs to see the terms from the path. Another has brought a slip we could check here. Help with one today and leave a useful place for the other.',
    options: [...PRICE_MODES.map((mode) => ({
      text: mode === 'offer' ? 'Fit the limited comparison on the public tab.' : 'Fit a separate check into the staffed receipt tray.',
      if: priceEquipped(entry),
      effects: [{ setFlag: PRICE_RETURN_ACTIVE, value: entry.slug }, { setFlag: `${entry.flag}.return-mode`, value: mode }],
    })), { text: 'Keep the copy with me.' }],
  }];
}

function objectives(entry: PriceCase): Objective[] {
  return [{
    id: entry.checked, title: `Test one counter use for ${entry.title}`, essential: false,
    visible: priceRead(entry), done: { all: [priceRead(entry), { flag: `${entry.flag}.tested`, eq: true }] },
    weave: {
      concepts: ['evidence', 'interpretation', 'objectivity', 'power'], atl: ['research', 'thinking', 'communication'],
      aoks: ['HUM', 'HIS'], subjects: ['economics', 'business', ...(entry.family === 'permit' ? ['global-politics'] : [])],
      framework: ['scope', 'methods-and-tools', 'perspectives'], minutes: 4,
      thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' },
    },
  }, {
    id: entry.returned, title: `See a customer use ${entry.accession} in Emberford`, essential: false,
    visible: { objective: entry.checked },
    done: { all: [{ objective: entry.checked }, { flag: `${entry.flag}.received`, eq: true }] },
    weave: {
      concepts: ['values', 'responsibility', 'power', 'justification'], aoks: ['HUM', 'HIS'], subjects: ['business', 'economics'],
      atl: ['communication', 'social', 'thinking'], framework: ['scope', 'perspectives', 'ethics'], minutes: 4,
      thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
    },
  }];
}

function hints(entry: PriceCase): Hint[] {
  const steps = [
    ['Open one specific source case.', 'The working tray is by its case.', 'Send a copy to the public rail or the staffed counter, then check where it arrived.',
      `Read the case for ${entry.accession}, choose a supported use at its tray, walk to the marked destination and return to request the object.`],
    ['The counter’s verified specimen can travel.', 'Equip the loan and look for Hana’s working board near the south approach in Emberford.',
      'Fit the public tab or the staffed receipt, then check that recipient’s mark.',
      `Equip ${entry.accession}. Meet Hana at the south working board. Use the new public tab or staffed tray to see who the choice served.`],
  ];
  return steps.flatMap((lines, part) => lines.map((text, step) => ({
    id: `h.${entry.flag}.${part}.${step+1}`, objective: part === 0 ? entry.checked : entry.returned,
    depth: (step + 1) as Hint['depth'], text,
  })));
}

export const priceDrawersContent: Partial<ContentPack> = {
  characters: [{ id: clerk, name: 'Sella Marn', role: 'Workshop clerk who records promises and uses in separate pockets',
    sprite: 'clerk-venn', mode: 'fictional', talk: [{ node: 'price-drawers.greeting' }] }],
  dialogue: [{ id: 'price-drawers.greeting', speaker: clerk, historicalLabel: 'fictional-world',
    text: 'A promise can lead someone to a shop. I keep the receipt in another pocket. Try one, then look in the receiving drawer.' }, ...PRICE_CASES.flatMap(dialogue)],
  missions: [{
    id: 'price-drawers', title: 'The Price That Travels', world: 'WORLD-11', available: PRICE_READY,
    knowledgeQuestion: 'Which choices and payments can a market’s records show?',
    stake: 'A hurried customer misses their turn when someone treats an advertised amount as a verified receipt.',
    objectives: PRICE_CASES.flatMap(objectives), caseVisits: PRICE_CASES.map((entry) => [entry.checked, entry.returned]),
  }],
  exhibits: PRICE_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, art: entry.art, dateText: entry.date, dateKind: entry.dateKind,
    historicalLabel: 'documented', summary: entry.summary, sources: priceSources(entry), grantsCard: entry.card,
    altText: `Original pixel study diagram for ${entry.title}. Its source records the exact object.`,
    specimen: { key: entry.key, institution: entry.institution, accession: entry.accession, source: entry.source, objective: entry.checked,
      revisit: { map: PRICE_RETURN, prop: entry.returnProp, method: 'Help a different customer compare a limited offer and a checked payment.',
        hint: 'Equip the object loan and find Hana’s working board by the southeast approach in Emberford.' } },
  })),
  cards: PRICE_CASES.map((entry) => ({
    id: entry.card, title: `${entry.accession} · ${entry.title}`, text: entry.summary, sources: priceSources(entry),
    limits: entry.limit, claimKind: 'observation', historicalLabel: 'documented',
  })),
  sources: [minidokaContext, ...PRICE_CASES.map((entry) => ({
    id: entry.source, title: `${entry.institution}, ${entry.title} (${entry.accession})`, url: entry.url,
    accessed: '2026-11-26', locator: 'Exact accession, date, identification, object description, and roles',
    supports: entry.slug === 'minidoka-letter' ? 'The catalogue identifies the sender, recipient and date of the letter.' : entry.summary, mla: { kind: 'page', title: entry.title, container: entry.institution, showAccessDate: true },
  }))],
  hints: PRICE_CASES.flatMap(hints),
};
