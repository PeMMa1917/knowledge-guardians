import { nightJob, nightSites, nightWorks, type NightSite } from '../domain/nightRegister';
import type { ContentPack, Hint, Weave } from '../domain/types';

const museum = 'National Gallery of Art, Washington';
export const registerWeave: Weave = {
  concepts: ['evidence', 'interpretation', 'perspective', 'responsibility', 'justification', 'values'],
  framework: ['methods-and-tools', 'perspectives', 'ethics'],
  aoks: ['HIS', 'ART', 'TEC'],
  subjects: ['visual-arts', 'history', 'design-tech'],
  atl: ['thinking', 'communication', 'research'],
  thinking: { dok: 3, bloom: 'evaluate', fink: 'integration', solo: 'relational' },
  minutes: 5,
};
function hints(pack: ContentPack, goal: string, lines: string[]) {
  lines.forEach((text, i) =>
    pack.hints.push({ id: 'h.' + goal + '.' + i, objective: goal, depth: (i + 1) as Hint['depth'], text }),
  );
}
function installKeeper(pack: ContentPack, site: NightSite) {
  const entry = site.room + '.keeper';
  const gate = { node: entry };
  const actor = pack.characters.find((c) => c.id === site.actor);
  if (actor) {
    pack.characters = pack.characters.map((c) =>
      c === actor ? { ...c, localGreeting: { ...c.localGreeting, [site.room]: entry } } : c,
    );
  } else {
    const coats: Record<string, string> = {
      cold: 'olive.grey.teal.indigo.scarf.gold.bun.none.none',
      coast: 'deep.black.blue.charcoal.headband.gold.curls.none.none',
      fern: 'brown.brown.green.indigo.none.cyan.long.none.none',
      press: 'pale.black.plum.charcoal.scarf.gold.short.darkframes.none',
      chart: 'tan.grey.teal.charcoal.none.green.curls.none.none',
      stage: 'warm.black.plum.indigo.headband.cyan.bun.none.none',
      market: 'dark.brown.green.wine.scarf.gold.covered.none.none',
      gate: 'light.grey.blue.indigo.headband.green',
      dispatch: 'brown.black.teal.wine.scarf.cyan.curls.lightframes.none',
    };
    pack.characters.push({
      id: site.actor,
      name: site.keeper,
      role: 'Keeper of ' + site.title,
      sprite: 'custom:' + coats[site.site],
      mode: 'fictional',
      talk: [gate],
    });
  }
  pack.dialogue.push(
    {
      id: entry,
      speaker: site.actor,
      text: site.opening,
      historicalLabel: 'fictional-world',
      options: [
        { text: 'Look where the last carrier stood.', next: entry + '.trace' },
        { text: 'Offer to take a shift.', next: entry + '.shift' },
        ...site.favours.map((_, i) => ({
          text: 'Stay to hear what happened the next morning.',
          if: { flag: site.room + '.favour', eq: i },
          next: entry + '.morning.' + i,
        })),
      ],
    },
    { id: entry + '.trace', speaker: site.actor, text: site.clue },
    { id: entry + '.shift', speaker: site.actor, text: site.work + ' The register desk is beside me.' },
    ...site.nextMorning.map((text, i) => ({ id: entry + '.morning.' + i, speaker: site.actor, text })),
  );
  const works = nightWorks.filter((w) => w.site === site);
  const receive = site.room + '.received',
    caption = site.room + '.caption',
    memory = site.room + '.memory-folders';
  pack.missions.push({
    id: 'KG-CH' + (site.index + 1) + '-NIGHT-REGISTER',
    world: site.world,
    title: site.title,
    available: { flag: site.room + '.open', eq: true },
    stake: site.work,
    knowledgeQuestion: 'Whose work becomes visible when a record changes hands?',
    caseVisits: works.map((w) => [w.objective]),
    objectives: [
      ...works.map((w) => ({
        id: w.objective,
        title: 'Prepare ' + w.title + ' for the night shift.',
        essential: false,
        visible: { flag: 'inspected.' + w.exhibit, eq: true },
        done: { flag: nightJob(w) + '.sent', in: [0, 1] },
        weave: registerWeave,
      })),
      {
        id: receive,
        title: 'Bring a reading from another chapter to ' + site.keeper + '.',
        essential: false,
        visible: { flag: 'night.has-parcel', eq: true },
        done: { flagSet: receive },
        weave: { ...registerWeave, aoks: ['HIS', 'ART', 'LAN'] },
      },
      {
        id: caption,
        title: 'Find the caption that was separated from its picture.',
        essential: false,
        visible: { flagSet: site.room + '.slip' },
        done: { flagSet: site.room + '.bound-caption' },
        weave: {
          ...registerWeave,
          thinking: { dok: 2, bloom: 'apply', fink: 'application', solo: 'multistructural' },
        },
      },
      {
        id: memory,
        title: 'Hear three accounts of a single handover.',
        essential: false,
        visible: { flagSet: receive },
        done: { flag: site.room + '.compared-memory', eq: true },
        weave: {
          ...registerWeave,
          thinking: { dok: 3, bloom: 'analyse', fink: 'human', solo: 'relational' },
        },
      },
    ],
  });
  hints(pack, caption, [
    site.clue,
    'The desk has a loose picture and the drawer address.',
    'Count the rows from the north and positions from the left. The same collection number is on both mounts.',
    'Open that frame. Keep its caption on the sleeve or identify it in the register, where the next reader can find it.',
  ]);
  hints(pack, memory, [
    site.clue,
    'First bring a reading across a chapter boundary.',
    'Open the three witness folders at the receiving desk.',
    'Hear the keeper, unseal the travelling record and take the latest word from home.',
  ]);
  hints(pack, receive, [
    site.clue,
    'A neighbouring keeper can use a record that came from another room.',
    'At a case in another chapter, compare the altered reading with the original and leave a handover.',
    'Pack that reading and bring it to this chapter’s register desk. Choose who gets to use it here.',
  ]);
  for (const w of works) {
    const sourceLine = w.maker + '. ' + w.medium + '. ' + w.date + '.';
    pack.sources.push({
      id: w.source,
      title: 'National Gallery of Art collection record ' + w.accession,
      url: w.url,
      locator: 'Collection record ' + w.accession,
      supports: sourceLine,
      accessed: '2026-11-27',
      mla: {
        kind: 'artwork',
        author: w.maker,
        title: w.title,
        workDate: w.date,
        container: museum,
        showAccessDate: true,
      },
    });
    pack.cards.push({
      id: w.card,
      title: w.title + ' · ' + w.accession,
      text: sourceLine,
      historicalLabel: 'documented',
      claimKind: 'observation',
      sources: [w.source],
      limits:
        'The accession identifies the work in this collection. The digital view cannot establish its physical scale, texture or earlier use on its own.',
    });
    pack.exhibits.push({
      id: w.exhibit,
      name: w.title + ' · ' + w.accession,
      art: 'preserved.catalogue',
      dateText: w.date,
      dateKind: 'The museum’s creation date for this work',
      summary: sourceLine,
      historicalLabel: 'documented',
      altText: w.title + ', ' + w.maker + '. ' + w.kind + ' in ' + w.medium + '.',
      grantsCard: w.card,
      sources: [w.source],
      specimen: {
        key: w.key,
        institution: museum,
        accession: w.accession,
        source: w.source,
        objective: w.objective,
        pixelAsset: w.image,
        fieldUse:
          'Take the equipped object to any other chapter’s night register. The keeper can use the edition you left in its home room.',
        people: [
          {
            name: w.maker,
            role: 'Museum attribution',
            detail: 'Credit as listed for accession ' + w.accession + '.',
            source: w.source,
          },
        ],
      },
    });
    hints(pack, w.objective, [
      site.clue,
      'Find the frame marked ' + w.accession + ' in the register. Its label names ' + w.maker + '.',
      'Try a companion’s view or a hand tool. Open the whole record beside the altered view.',
      'Leave your reading with either recipient. Return to the object to take it or send its reading to another chapter.',
    ]);
  }
}
export function installNightCollection(pack: ContentPack) {
  for (const site of nightSites) installKeeper(pack, site);
}
