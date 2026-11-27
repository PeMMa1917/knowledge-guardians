// Each half of a neighbourhood story belongs to a different person. Their
// neighbour can respond to a choice even if the Guardian meets them much later.
import type { DiaryTopics } from './diarySelection';
import stories from '../content/neighbours.json';
import type { CampaignState, Condition, DialogueNode } from './types';

type Resident = (typeof stories)[number]['people'][number];
const residents = new Map<string, { person: Resident; neighbour: Resident }>();
for (const { people: [left, right] } of stories) {
  residents.set(left.id, { person: left, neighbour: right });
  residents.set(right.id, { person: right, neighbour: left });
}
const storyId = (person: Resident) => 'neighbour.' + person.id;
const followupId = (person: Resident, choice: string) => storyId(person) + '.heard-' + choice;

/** Offer a personal conversation only on a visit to its speaker. Finishing a
 * chapter (or approaching the other person first) never closes the invitation. */
export function neighbourInvitation(character: string, flags: CampaignState['flags']) {
  const pair = residents.get(character);
  if (!pair) return;
  const { person, neighbour } = pair;
  const otherChoice = neighbour.choices.find((choice) => choice.id === flags[storyId(neighbour)]);
  if (otherChoice) {
    const node = followupId(person, otherChoice.id);
    if (!flags['node.' + node]) return { text: person.hook, node };
  }
  if (!flags[storyId(person)]) return { text: person.hook, node: storyId(person) };
}

export function neighbourDialogues(): DialogueNode[] {
  const nodes: DialogueNode[] = [];
  for (const { person, neighbour } of residents.values()) {
    const id = storyId(person);
    const available: Condition = { not: { flagSet: id } };
    const speaker = { speaker: person.id, historicalLabel: 'fictional-world' } as const;
    nodes.push({
      ...speaker, id, text: person.opening,
      options: [
        ...person.choices.map((choice) => ({
          text: choice.action, if: available, next: id + '.' + choice.id,
          effects: [{ setFlag: id, value: choice.id }],
        })),
        { text: 'Give them a little time.' },
      ],
    });
    for (const choice of person.choices) {
      nodes.push({ ...speaker, id: id + '.' + choice.id, text: choice.reply });
    }
    for (const otherChoice of neighbour.choices) {
      nodes.push({
        ...speaker, id: followupId(person, otherChoice.id), text: otherChoice.neighbour,
        // Staying leads into this person's own problem. Visiting them after
        // their decision shows the new reply without reopening a settled choice.
        options: [{ text: person.hook, if: available, next: id }, { text: 'Leave them to it.' }],
      });
    }
  }
  return nodes;
}

// Used by diary export for an actual encounter with this speaker. A tag records
// what the scene was about. It gives no XP or mastery credit.
const journalTopics: Record<string, DiaryTopics> = {
  'nile-iman': { concepts: ['power', 'interpretation'], framework: ['scope'], areas: ['HUM'], themes: ['LAN'] },
  'nile-nasir': { concepts: ['evidence', 'values'], framework: ['perspectives'], areas: ['ART', 'HIS'] },
  'nile-leila': { concepts: ['perspective', 'responsibility'], framework: ['ethics'], areas: ['HUM'], themes: ['TEC'] },
  'nile-marek': { concepts: ['explanation', 'evidence'], framework: ['methods-and-tools'], areas: ['NAT', 'MAT'] },
  'preserved-registrar': { concepts: ['interpretation', 'evidence'], framework: ['perspectives'], areas: ['HIS', 'ART'] },
  'preserved-royal-keeper': { concepts: ['objectivity', 'power'], framework: ['ethics', 'perspectives'], areas: ['ART', 'HUM'] },
  'preserved-coast-keeper': { concepts: ['truth', 'justification'], framework: ['methods-and-tools'], areas: ['NAT', 'ART'] },
  'preserved-inquiry-keeper': { concepts: ['explanation', 'certainty'], framework: ['scope'], areas: ['NAT'], themes: ['LAN'] },
  'coast-signalkeeper': { concepts: ['interpretation', 'responsibility'], framework: ['ethics'], areas: ['HUM'], themes: ['LAN'] },
  'coast-forecaster': { concepts: ['perspective', 'values'], framework: ['perspectives'], areas: ['NAT', 'HUM'] },
  'forest-naturalist': { concepts: ['evidence', 'explanation'], framework: ['methods-and-tools'], areas: ['NAT'] },
  'forest-steward': { concepts: ['responsibility', 'perspective'], framework: ['ethics', 'methods-and-tools'], areas: ['NAT', 'HUM'] },
  'metal-inspector': { concepts: ['values', 'evidence'], framework: ['methods-and-tools'], areas: ['ART', 'HIS'], themes: ['TEC'] },
  'metal-steward': { concepts: ['justification', 'interpretation'], framework: ['scope'], areas: ['NAT', 'ART'], themes: ['TEC'] },
  'copies-presskeeper': { concepts: ['responsibility', 'values'], framework: ['ethics'], areas: ['ART'], themes: ['TEC'] },
  'copies-lendingkeeper': { concepts: ['power', 'values'], framework: ['ethics'], areas: ['HUM'], themes: ['POL'] },
  'sea-cartographer': { concepts: ['perspective', 'interpretation'], framework: ['scope', 'ethics'], areas: ['ART', 'HUM'] },
  'sea-harbourkeeper': { concepts: ['culture', 'evidence'], framework: ['methods-and-tools'], areas: ['HUM'], themes: ['LAN'] },
  'stage-director': { concepts: ['interpretation', 'perspective'], framework: ['perspectives'], areas: ['ART', 'HIS'] },
  'stage-host': { concepts: ['values', 'power'], framework: ['ethics'], areas: ['ART', 'HIS'] },
  'market-assayer': { concepts: ['justification', 'responsibility'], framework: ['ethics', 'methods-and-tools'], areas: ['NAT', 'HUM'] },
  'market-clerk': { concepts: ['power', 'values'], framework: ['ethics'], areas: ['HUM', 'MAT'], themes: ['POL'] },
  'water-keeper': { concepts: ['certainty', 'evidence'], framework: ['methods-and-tools'], areas: ['NAT', 'HIS'] },
  'water-scribe': { concepts: ['responsibility', 'perspective'], framework: ['ethics'], areas: ['HUM'], themes: ['POL'] },
  'civic-operator': { concepts: ['evidence', 'power'], framework: ['methods-and-tools', 'ethics'], areas: ['HUM'], themes: ['TEC', 'POL'] },
  'civic-clerk': { concepts: ['truth', 'interpretation'], framework: ['scope'], areas: ['HUM'], themes: ['TEC'] },
  'voices-steward': { concepts: ['objectivity', 'responsibility'], framework: ['ethics', 'perspectives'], areas: ['HIS', 'ART'], themes: ['TEC'] },
  'voices-clerk': { concepts: ['perspective', 'interpretation'], framework: ['scope'], areas: ['HIS', 'ART'] },
  'island-planner': { concepts: ['explanation', 'certainty'], framework: ['methods-and-tools'], areas: ['HUM', 'NAT'] },
  'island-dockhand': { concepts: ['power', 'responsibility'], framework: ['ethics'], areas: ['HUM'], themes: ['POL'] },
  'council-keeper': { concepts: ['truth', 'justification'], framework: ['ethics'], areas: ['HIS'], themes: ['TEC'] },
  'council-reader': { concepts: ['culture', 'values'], framework: ['scope', 'perspectives'], areas: ['ART'] },
};
export function neighbourJournalTopics(ref: string): DiaryTopics | undefined {
  if (!ref.startsWith('neighbour.')) return;
  const [, actor, moment] = ref.split('.');
  const pair = residents.get(actor);
  if (!pair) return;
  return journalTopics[moment?.startsWith('heard-') ? pair.neighbour.id : actor];
}
