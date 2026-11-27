import { PRISM_ACCESS, PRISM_LENSES } from '../domain/prismViewer';
import type { Condition, ContentPack, Hint } from '../domain/types';

export const PRISM_GROUP = 'prism-viewer';
export const PRISM_EXHIBIT = 'OBJ-WEBB-WEIC2212A';
export const PRISM_KEY = 'esa-webb:weic2212a';
export const PRISM_CARD = 'card.prism.webb';
export const PRISM_DONE = 'prism.delivered';
export const PRISM_RETURN = 'prism.accessible';
export const PRISM_AVAILABLE: Condition = { flag: 'study.letter', eq: true };
export const PRISM_REVISIT = { map: 'aethelgard.study', prop: 'prism-reading-light',
  method: 'Test a shape key and a greyscale reading under the Study’s dim lamp.',
  hint: 'Equip Webb’s Tarantula Nebula image in the Bag. Try both settings at the Study’s dim reading light.' };
const WEBB_CATALOGUE = 'HIS-PRISM-WEBB';
const WEBB_FILTERS = 'HIS-PRISM-NASA';
const routes = PRISM_LENSES.map((lens) => ({ flag: `prism.fitted.${lens}`, eq: true }));

export const prismViewerContent = {
  sources: [{ id: WEBB_CATALOGUE, title: 'ESA/Webb, Tarantula Nebula (NIRCam Image), weic2212a', url: 'https://esawebb.org/images/weic2212a/',
    locator: 'Observation ID, release date, image credit and three named rows in the filter table',
    supports: 'ESA/Webb dates release of observation weic2212a to September 6, 2022. Its table links 900 nm to blue, 2.0 µm to green and 4.44 µm to red. The published mosaic also uses a further assigned hue.', accessed: '2026-11-26' },
  { id: WEBB_FILTERS, title: 'NASA Science, Tarantula Nebula (NIRCam Image)', url: 'https://science.nasa.gov/asset/webb/tarantula-nebula-nircam-image/',
    locator: 'Image caption and Color Info filter assignments',
    supports: 'NASA explains that hue was assigned to grayscale filter images and lists F090W blue, F200W green and F444W red among the inputs to this composite.', accessed: '2026-11-26' }],
  exhibits: [{ id: PRISM_EXHIBIT, name: 'Webb’s Tarantula Nebula image', art: 'prism.image', historicalLabel: 'documented',
    dateText: '6 September 2022', dateKind: 'Release date of the complete composite image, ESA/Webb ID weic2212a.',
    summary: 'Webb’s NIRCam mosaic of 30 Doradus uses separate measurements from infrared filters. The image team assigned blue to the band near 0.9 µm, green near 2.0 µm and red near 4.44 µm. A further filter contributes another hue. The full catalogue image is 14,557 × 8,418 pixels. Image credit NASA, ESA, CSA, and STScI. CC BY 4.0. This copy was reduced for display.',
    altText: 'A dark cavity filled with bright blue star points lies beside a bright irregular cloud. Pale threads rise through reddish and amber patches.',
    sources: [WEBB_CATALOGUE, WEBB_FILTERS], grantsCard: PRISM_CARD,
    specimen: { key: PRISM_KEY, accession: 'weic2212a', institution: 'ESA/Webb', source: WEBB_CATALOGUE, objective: PRISM_DONE,
      pixelAsset: 'specimens/webb-weic2212a.jpg', revisit: PRISM_REVISIT, people: [{ name: 'Webb ERO Production Team', role: 'Published image production',
        detail: 'NASA names the production team alongside NASA, ESA, CSA, and STScI in the image credit.', source: WEBB_FILTERS }] } }],
  cards: [{ id: PRISM_CARD, title: 'Separate filters, assigned colours', claimKind: 'observation', historicalLabel: 'documented',
    sources: [WEBB_CATALOGUE, WEBB_FILTERS], text: 'Webb’s camera recorded light separately through infrared filters. The published mosaic uses assigned visible colours. Three named inputs are F090W in blue, F200W in green and F444W in red.',
    limits: 'The published colours are a rendering of measured bands. The Annex viewer uses the same three filter names with invented intensities on the workshop’s three-band viewer.' }],
  missions: [{ id: 'KG-CH1-R29-PRISM', title: 'Three Bands Through One Window', world: 'WORLD-02', available: PRISM_AVAILABLE,
    stake: 'Nell needs the fold before her support can dry. Venn needs the separated pinholes before the dispatch leaves. The Annex can fit either holder first.',
    knowledgeQuestion: 'What can change in the way a signal is shown while its measured values stay the same?',
    caseVisits: [[PRISM_DONE], [PRISM_RETURN]],
    objectives: [{ id: PRISM_DONE, title: 'Convert the three band readings into two views and fit both readers’ holders.', essential: false,
      visible: { card: PRISM_CARD }, done: { all: [{ card: PRISM_CARD }, ...PRISM_LENSES.map((lens) => ({ flag: `prism.viewed.${lens}`, eq: true })),
        { flag: 'prism.first', in: [...PRISM_LENSES] }, ...routes] }, onComplete: [{ journal: 'j.prism.delivered' }],
      weave: { concepts: ['evidence', 'interpretation', 'explanation', 'perspective', 'objectivity', 'responsibility'],
        framework: ['scope', 'perspectives', 'methods-and-tools', 'ethics'], atl: ['thinking', 'communication', 'social'], aoks: ['NAT', 'ART'],
        subjects: ['physics', 'visual-arts', 'design-tech'], thinking: { dok: 3, bloom: 'analyse', fink: 'application', solo: 'relational' }, minutes: 5 },
    }, {
      id: PRISM_RETURN, title: 'Return with the Webb copy and install a display for the dim reading light.', essential: false,
      visible: { item: `item.specimen.${PRISM_KEY}` }, done: { all: [{ objective: PRISM_DONE }, ...PRISM_ACCESS.map((method) => ({ flag: `prism.consulted.${method}`, eq: true })),
        { flag: 'prism.access', in: [...PRISM_ACCESS] }] }, onComplete: [{ journal: 'j.prism.accessible' }],
      weave: { concepts: ['perspective', 'interpretation', 'values', 'responsibility'], framework: ['perspectives', 'methods-and-tools', 'ethics'],
        atl: ['thinking', 'communication'], aoks: ['NAT', 'ART'], subjects: ['physics', 'design-tech'],
        thinking: { dok: 3, bloom: 'evaluate', fink: 'caring', solo: 'relational' }, minutes: 3 },
    }],
  }],
  journal: [{ id: 'j.prism.delivered', claimKind: 'observation', text: 'I kept the Annex’s three practice readings fixed. Turning the viewing sliders brought out the seam or the pinholes. Nell used the seam and Venn used the separate pinholes. Webb’s dated filter record stayed beside the practice viewer.' },
  { id: 'j.prism.accessible', claimKind: 'observation', text: 'I used Webb’s Tarantula Nebula image at the Study’s dim reading light. I compared added marks with greyscale and fitted one display without changing the three readings.' }],
  hints: [
    [PRISM_DONE, ['The same sheet stays in the viewer when a rendering changes.', 'Read the Webb case in the Loan Annex, then try both slider combinations.',
      'Keep an eye on the three sample values as you change each assigned visible hue.', 'Choose a first reader, walk to their holder and fit the view. Bring the other rendering to the other holder afterwards.']],
    [PRISM_RETURN, ['A reader may distinguish a shape more readily than a hue.', 'Claim and equip Webb’s Tarantula Nebula image, then use the Study’s dim light by the stairs.',
      'Compare the shape key and the greyscale. Both draw from the same three numbers.', 'Leave one display at the dim lamp. The nearby holder keeps your choice when you return.']],
  ].flatMap(([objective, texts]) => (texts as string[]).map((text, index) => ({
    id: `h.${objective}.${index + 1}`, objective: objective as string, depth: (index + 1) as Hint['depth'], text,
  }))),
} satisfies Partial<ContentPack>;
