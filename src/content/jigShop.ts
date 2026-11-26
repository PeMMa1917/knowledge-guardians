import { specimenEquipped } from '../domain/specimenGear';
import type { Condition, ContentPack, DialogueNode, Hint, Objective, Weave } from '../domain/types';
import records from './jig-shop-records.json';

export const JIG_SHOP = 'metalworks.jig-shop';
export const JIG_RETURN = 'aethelgard.emberford';
export const JIG_SHOP_GATE: Condition = { objective: 'metal.arrival' };
export const JIG_ACTIVE = 'jig-shop.active-case';
export const JIG_LANE = 'jig-shop.open-lane';
export const JIG_RETURN_ACTIVE = 'jig-shop.active-return';
export type JigMode = 'common' | 'fitted';
export type JigReturn = 'bench' | 'tray';
export const JIG_MODES: JigMode[] = ['common', 'fitted'];
export const JIG_RETURN_MODES: JigReturn[] = ['bench', 'tray'];

export const JIG_CASES = records.map((record) => {
  const flag = `jig-shop.${record.slug}`;
  return {
    ...record, flag, source: `HIS-JIG-SHOP-${record.slug.toUpperCase()}`,
    exhibit: `OBJ-JIG-SHOP-${record.slug.toUpperCase()}`, art: `${flag}.case`, card: `card.${flag}`,
    checked: `${flag}.checked`, returned: `${flag}.returned`, returnProp: `jig-shop-${record.slug}-return`,
  };
});
export type JigCase = (typeof JIG_CASES)[number];

export const jigSeen = (entry: JigCase): Condition => ({ card: entry.card });
export const jigActive = (entry: JigCase): Condition => ({ flag: JIG_ACTIVE, eq: entry.slug });
export const jigLane = (mode: JigMode): Condition => ({ flag: JIG_LANE, eq: mode });
export const jigEquipped = (entry: JigCase): Condition => ({
  all: [{ objective: entry.checked }, specimenEquipped(entry.key)],
});
export const jigReturned = (entry: JigCase, mode: JigReturn): Condition => ({
  all: [{ flag: JIG_RETURN_ACTIVE, eq: entry.slug }, { flag: `${entry.flag}.installation`, eq: mode }],
});

const smith = 'jig-shop-nesta';
const recipient = 'smith-hesper';

function jigDialogue(entry: JigCase): DialogueNode[] {
  return [{
    id: `${entry.flag}.take`, historicalLabel: 'fictional-world', speaker: smith,
    text: 'I’ve hung two practice fixtures at the end of the hall. You need a working blank from this case before you can open either lane.',
    options: [{
      text: 'Carry this case’s practice blank to the fitting stand.',
      if: jigSeen(entry),
      effects: [{ setFlag: JIG_ACTIVE, value: entry.slug }, { setFlag: JIG_LANE, value: 'closed' }],
    }, { text: 'Leave the blank on its case hook.' }],
  }, {
    id: `${entry.flag}.fit`, historicalLabel: 'fictional-world', speaker: smith,
    text: 'The common support leaves room for a repeatable check. The fitted support works here for the part you brought. Go in and see which witness has signed.',
    options: [...JIG_MODES.map((mode) => ({
      text: entry[`${mode}Action`], if: jigActive(entry),
      effects: [{ setFlag: JIG_LANE, value: mode }],
    })), { text: 'Keep the sample on the stand.' }],
  }, {
    id: `${entry.flag}.return`, historicalLabel: 'fictional-world', speaker: recipient,
    text: entry.returnEvidence,
    options: [...JIG_RETURN_MODES.map((mode) => ({
      text: entry[mode],
      if: jigEquipped(entry),
      effects: [{ setFlag: JIG_RETURN_ACTIVE, value: entry.slug },
        { setFlag: `${entry.flag}.installation`, value: mode }],
    })), { text: 'Keep the loan in hand.' }],
  }];
}

export function jigReceipt(entry: JigCase, mode: JigReturn): string {
  return mode === 'bench'
    ? `${entry.bench} Hesper leaves the shared reference at the open bench. The next apprentice can repeat the supported check while wider questions stay on paper. ${entry.limit}`
    : `${entry.tray} Hesper closes the regular work slot and seats the fitted tray nearby. The next customer can check the different part with the witness. ${entry.limit}`;
}

function jigWeave(entry: JigCase): Weave {
  const subjects = ['design-tech', entry.family === 'ledger' ? 'history' : entry.family === 'shape' ? 'visual-arts' : 'physics'];
  return {
    concepts: entry.family === 'ledger' ? ['evidence', 'interpretation', 'power', 'responsibility'] :
      ['evidence', 'objectivity', 'certainty', 'explanation', 'justification'],
    atl: ['thinking', 'research', 'self-management'],
    aoks: entry.family === 'ledger' ? ['HIS', 'HUM'] : ['NAT', 'TEC'],
    subjects, framework: ['scope', 'methods-and-tools', 'perspectives'], minutes: 5,
    thinking: { dok: 3, bloom: 'apply', fink: 'application', solo: 'relational' },
  };
}

function objectives(entry: JigCase): Objective[] {
  return [{
    id: entry.checked, title: `Verify a support for ${entry.title}`, essential: false, visible: jigSeen(entry),
    done: { all: [jigSeen(entry), { any: JIG_MODES.map((mode) => ({ flag: `${entry.flag}.used.${mode}`, eq: true })) }] },
    onComplete: [{ journal: `j.${entry.flag}.check` }], weave: jigWeave(entry),
  }, {
    id: entry.returned, title: `Use ${entry.accession} at Hesper’s Emberford bench`, essential: false,
    visible: { objective: entry.checked },
    done: { all: [{ objective: entry.checked }, { flag: `${entry.flag}.used.return`, eq: true }] },
    onComplete: [{ journal: `j.${entry.flag}.return` }],
    weave: {
      concepts: ['responsibility', 'values', 'perspective', 'power'], atl: ['thinking', 'communication', 'social'],
      aoks: ['HIS', 'TEC'], subjects: ['design-tech'], framework: ['perspectives', 'ethics', 'methods-and-tools'],
      minutes: 4, thinking: { dok: 3, bloom: 'evaluate', fink: 'human', solo: 'relational' },
    },
  }];
}

function hints(entry: JigCase): Hint[] {
  const groups = [[
    'Open an object case and take its paper practice blank.',
    'The far fitting stand takes whatever case’s blank you picked up last.',
    'The fixture you set clears one lane. Follow its floor to the witness, then return to the case.',
    `Bring the blank for ${entry.accession} to the stand, fit one support, walk its nearer or farther lane, and read the witness. Open the object case again to take the verified loan.`,
  ], [
    'Carry and equip the verified object for a use in Emberford.',
    'Hesper has a working tray south of the Maker’s bench.',
    'Choose the reusable shared reference or a separate fitted tray. Check it where Hesper sets it down.',
    `Equip ${entry.accession}, return to Emberford and meet Hesper south of the Maker’s bench. Read the resulting fixture or tray at its own site.`,
  ]];
  return groups.flatMap((texts, group) => texts.map((text, index) => ({
    id: `h.${entry.flag}.${group + 1}.${index + 1}`, depth: (index + 1) as Hint['depth'],
    objective: group === 0 ? entry.checked : entry.returned, text,
  })));
}

export const jigShopContent: Partial<ContentPack> = {
  characters: [{
    id: smith, name: 'Nesta Thrum', mode: 'fictional', sprite: 'clerk-venn',
    role: 'Metalworks jig shop foreperson who teaches by trying actual fits', talk: [{ node: 'jig-shop.welcome' }],
  }],
  dialogue: [{
    id: 'jig-shop.welcome', speaker: smith, historicalLabel: 'fictional-world',
    text: 'A crooked label fits a straight box. Try a paper blank; it has edges that will show you what is actually supported. Take it through either lane. Hesper can put the checked method to work.',
  }, ...JIG_CASES.flatMap(jigDialogue)],
  missions: [{
    id: 'jig-shop', world: 'WORLD-07', title: 'The Parts You Can Replace',
    knowledgeQuestion: 'When can a tested solution be repeated, and when should the next worker ask for a different support?',
    stake: 'If a part arrives with the wrong reference, the apprentice has to leave the repair halfway through and the customer waits another day.',
    available: JIG_SHOP_GATE, objectives: JIG_CASES.flatMap(objectives),
    caseVisits: JIG_CASES.map((entry) => [entry.checked, entry.returned]),
  }],
  exhibits: JIG_CASES.map((entry) => ({
    id: entry.exhibit, name: entry.title, art: entry.art, dateText: entry.date, dateKind: entry.dateKind,
    historicalLabel: 'documented', summary: entry.summary, sources: [entry.source], grantsCard: entry.card,
    altText: entry.artDescription ?? `Original character-scale study graphic for the ${entry.family} trial linked to ${entry.accession}.`,
    specimen: {
      key: entry.key, institution: entry.institution, accession: entry.accession, source: entry.source, objective: entry.checked,
      revisit: { map: JIG_RETURN, prop: entry.returnProp, method: 'Adapt the checked support at an earlier working bench.',
        hint: 'Equip the object and meet Hesper just south of the Maker’s bench in Emberford.' },
    },
  })),
  cards: JIG_CASES.map((entry) => ({
    id: entry.card, title: `${entry.accession} · ${entry.title}`, text: entry.summary,
    sources: [entry.source], limits: entry.limit, historicalLabel: 'documented', claimKind: 'observation',
  })),
  sources: JIG_CASES.map((entry) => ({
    id: entry.source, title: `${entry.institution}, ${entry.title} (${entry.accession})`, url: entry.url,
    locator: 'Exact item identity, dated history, descriptive record and roles as named', supports: entry.summary,
    accessed: '2026-11-26', mla: { kind: 'page', title: entry.title, container: entry.institution, showAccessDate: true },
  })),
  hints: JIG_CASES.flatMap(hints),
  journal: JIG_CASES.flatMap((entry) => [{
    id: `j.${entry.flag}.check`, claimKind: 'simulation' as const,
    text: `The Jig Shop witnessed a fitted practice support for ${entry.accession}. ${entry.limit}`,
  }, {
    id: `j.${entry.flag}.return`, claimKind: 'simulation' as const,
    text: `Hesper gave the checked use for ${entry.accession} a working place in Emberford. ${entry.limit}`,
  }]),
};
