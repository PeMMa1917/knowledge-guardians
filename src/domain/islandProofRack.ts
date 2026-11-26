export const ISLAND_PROOF_TOOL = 'island-proof-rack:';
export const ISLAND_PROOF_CASES = ['paired-views', 'scale-bar'] as const;
export type IslandProofCase = (typeof ISLAND_PROOF_CASES)[number];
export const ISLAND_PROOF_ROUTES = ['dock', 'margin'] as const;
export type IslandProofRoute = (typeof ISLAND_PROOF_ROUTES)[number];

export const ISLAND_PROOF_KEYS: Record<IslandProofCase, string> = {
  'paired-views': 'usnm:pal-160174',
  'scale-bar': 'usnm:pal-247790',
};

export const islandProofFlag = (id: IslandProofCase, part: string) => `island.proof-rack.${id}.${part}`;
export const islandProofProp = (id: IslandProofCase) => `island-proof-rack-${id}`;
export const islandProofReceipt = (id: IslandProofCase) => `item.${islandProofFlag(id, 'receipt')}`;

const manifest = [
  { card: 'Part', job: 'two-face packet' },
  { card: 'Counterpart', job: 'two-face packet' },
  { card: 'Ferry tool roll', job: 'tool roll' },
];
export const proofManifest = (group: boolean) => group
  ? [...new Set(manifest.map(({ job }) => job))]
  : manifest.map(({ card }) => card);
export const ISLAND_CART_SLOTS = 3;
export const ISLAND_SLEEVE_LIMIT = 650;

const width = { small: { outline: 18, bar: 6 }, large: { outline: 36, bar: 12 } } as const;
export const scalePrints = ['small', 'large'] as const;
export type IslandPrint = (typeof scalePrints)[number];
// Both outline measurements belong to fictional practice prints, never the specimen.
export function proofScalePrint(print: IslandPrint) {
  const { outline, bar } = width[print];
  const modelDistance = (outline / bar) * 200;
  return { outline, bar, modelDistance, fits: modelDistance <= ISLAND_SLEEVE_LIMIT };
}

export const ISLAND_PROOF_TRIALS: Record<IslandProofCase, readonly [string, string]> = {
  'paired-views': ['cards', 'jobs'],
  'scale-bar': scalePrints,
};
