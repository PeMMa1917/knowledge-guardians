import type { Condition, ContentPack, Hint, Objective } from '../domain/types';
import { starFlag, starMethodReady, starRouteRead, type StarPath } from '../domain/starPaths';
import source from './star-paths.json';

export const STAR_PATHS: StarPath[] = source;

const uses = [
  { world: 'WORLD-01', name: 'Dace and Venn’s test rail', place: 'the Archive Hall', aoks: ['NAT', 'HIS'], subjects: ['physics', 'history'],
    concepts: ['evidence', 'objectivity', 'justification', 'certainty'], atl: ['thinking', 'research'] },
  { world: 'WORLD-13', name: 'the clerk’s checking tray', place: 'Library Dispatch', aoks: ['TEC', 'HUM'], subjects: ['design-tech', 'digital-society', 'computer-science'],
    concepts: ['power', 'evidence', 'explanation', 'responsibility'], atl: ['thinking', 'research'] },
  { world: 'WORLD-14', name: 'the listening room’s route clips', place: 'the Archive of Voices', aoks: ['HIS', 'ART'], subjects: ['lang-b', 'anthropology'],
    concepts: ['perspective', 'culture', 'values', 'interpretation'], atl: ['social', 'communication'] },
  { world: 'WORLD-02', name: 'the repair follow-up board', place: 'Emberford', aoks: ['HIS', 'NAT'], subjects: ['history', 'design-tech'],
    concepts: ['evidence', 'certainty', 'truth', 'responsibility'], atl: ['self-management', 'thinking'] },
  { world: 'WORLD-03', name: 'the public copy board', place: 'the Workmen’s Room', aoks: ['HIS', 'ART'], subjects: ['lang-lit', 'theatre'],
    concepts: ['perspective', 'interpretation', 'explanation', 'responsibility'], atl: ['communication', 'social'] },
] satisfies { world: string; name: string; place: string; concepts: NonNullable<Objective['weave']>['concepts'];
  aoks: NonNullable<Objective['weave']>['aoks']; subjects: string[]; atl: NonNullable<Objective['weave']>['atl'] }[];

export const STAR_STATIONS = STAR_PATHS.map((path, index) => ({ ...uses[index], path }));
export type StarStation = typeof STAR_STATIONS[number];
export const starStation = (id: string) => STAR_STATIONS.find(({ path }) => path.id === id);
export const starStationOpen = ({ path }: StarStation): Condition => ({ any: path.skills.map(starMethodReady) });

export const starPathContent = {
  missions: STAR_STATIONS.map((site) => ({
    id: `star-path-${site.path.id}`,
    title: `${site.path.name} at ${site.name}`,
    available: starStationOpen(site),
    world: site.world,
    stake: 'A nearby keeper needs a layout they can use again.',
    knowledgeQuestion: site.path.focus,
    caseVisits: site.path.skills.map((skill) => [starFlag(site.path, skill)]),
    objectives: site.path.skills.map((skill): Objective => ({
      id: starFlag(site.path, skill), title: `Set a field aid for ${skill.name.toLowerCase()} and check the other end of its rail.`, essential: false,
      visible: starMethodReady(skill), done: starRouteRead(site.path, skill), onComplete: [{ journal: `j.${starFlag(site.path, skill)}` }],
      weave: { concepts: site.concepts, aoks: site.aoks, subjects: site.subjects, atl: site.atl,
        framework: ['perspectives', 'methods-and-tools', 'ethics'], thinking: { dok: 3, bloom: 'apply', fink: 'integration', solo: 'relational' }, minutes: 3 },
    })),
  })),
  journal: STAR_STATIONS.flatMap(({ path, place }) => path.skills.map((skill) => ({
    id: `j.${starFlag(path, skill)}`, text: `I used ${skill.name.toLowerCase()} to help a keeper in ${place}. The next reader can follow the arrangement I tried.`, claimKind: 'observation',
  }))),
  hints: STAR_STATIONS.flatMap(({ path, place, name }) => path.skills.flatMap((skill) => [
    `Try this method at ${name}.`,
    `The field aid uses work you have already done. Its two settings help different readers in ${place}.`,
    'Place one aid under its clip. A new notice appears beside the bench.',
    'Set the aid and use the posted notice beside the bench. A keeper will tell you what the new arrangement makes possible.',
  ].map((text, i) => ({ id: `h.${starFlag(path, skill)}.${i + 1}`, objective: starFlag(path, skill), depth: (i + 1) as Hint['depth'], text })))),
} satisfies Partial<ContentPack>;
