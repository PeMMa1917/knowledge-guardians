import type { Condition } from '../domain/types';
import type { Interactable } from './types';

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, node, kind: 'scene', x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function readback(id: string, x: number, y: number, label: string, art: string, text: string, flag: string,
  plan: 'market' | 'council', edition: string): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, flag, walkThrough: true,
    visibleIf: { flag: `accession.${plan}.route`, eq: edition } };
}

const marketCase: Condition = { objective: 'market.finish' };
const councilCase: Condition = { all: [{ objective: 'council.arrival' }, { item: 'item.accession-pair' }] };

export const MARKET_ACCESSIONS: Interactable[] = [
  { id: 'market-accession-khipu', kind: 'exhibit', exhibit: 'OBJ-MKT-AM9941', x: 5, y: 7, w: 1, h: 1,
    label: 'the cotton khipu record from Peru', art: 'big.accession-khipu', visibleIf: marketCase, walkThrough: true },
  { id: 'market-accession-shell', kind: 'exhibit', exhibit: 'OBJ-MKT-OC9941', x: 5, y: 11, w: 1, h: 1,
    label: 'the shell trumpet record from Mangaia', art: 'big.accession-shell', visibleIf: marketCase, walkThrough: true },
  scene('market-accession-pack', 'accession.market.pack', 7, 11, 'Dagny’s two cases with the same short number', 'preserved.folder',
    { all: [{ objective: 'accession.market.compare' }, { not: { flagSet: 'accession.market.route' } }] }),
  readback('market-accession-covers', 5, 13, 'the two full case sleeves', 'preserved.display-paired',
    'On a low shelf, a carrier turns the loose wrap until both reference letters show. They take the cotton case away and leave the shell case for the other crew.',
    'accession.market.checked', 'market', 'covers'),
  readback('market-accession-desk', 8, 12, 'the keeper’s two reference pockets', 'preserved.folder',
    'Dagny opens a different pocket for each case. A porter copies the full name beside the short one before leaving. The next keeper can take over at the same desk.',
    'accession.market.checked', 'market', 'desk'),
];

export const COUNCIL_ACCESSIONS: Interactable[] = [
  scene('council-accession-call', 'accession.council.call', 5, 5, 'the practice call behind the gallery screen', 'council.relay', councilCase),
  scene('council-accession-plan', 'accession.council.plan', 8, 6, 'Essi’s blank receipt clips', 'preserved.folder',
    { all: [councilCase, { flagSet: 'accession.council.heard' }, { not: { flagSet: 'accession.council.route' } }] }),
  readback('council-accession-written', 9, 7, 'a separate reference for each keeper', 'preserved.display-paired',
    'Am.9941 and Oc.9941 have separate lines beside the corresponding sources. Both keepers can check after the call stops. The porter takes the correct line to the door.',
    'accession.council.checked', 'council', 'written'),
  readback('council-accession-spoken', 8, 10, 'the second call and written source pair', 'council.relay',
    'The reader calls the full name. The keeper repeats its prefix and number. The second record stays on its own line for the later call.',
    'accession.council.checked', 'council', 'spoken'),
];
