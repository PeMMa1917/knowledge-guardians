// These are selectable review contexts. Registration does not award action or cognitive evidence.
export const contextFamilies = {
  exhibition: 'Exhibition prompt families',
  fink: 'Fink dimensions of learning',
  solo: 'SOLO learning outcomes',
  character: 'Characters and historical guests',
  exhibit: 'Exhibits',
  keepsake: 'Keepsakes',
  companion: 'Creature companions',
};
const finkNames = {
  foundational: 'Foundational knowledge',
  application: 'Application',
  integration: 'Integration',
  human: 'Human dimension',
  caring: 'Caring',
  'learning-to-learn': 'Learning how to learn',
};
const soloNames = {
  unistructural: 'One relevant aspect',
  multistructural: 'Several relevant aspects',
  relational: 'Connections between aspects',
  extended: 'A generalisation beyond the original task',
};
export function reviewContexts(pack, levels, exhibition, nightFriends) {
  const member = (kind, key, name, origin) => ({
    id: kind + ':' + key,
    kind,
    name,
    origin,
  });
  return [
    ...exhibition.map(({ question }) => {
      const match = /^KQ-ROUTE-(\d+)$/.exec(question.id);
      if (!match) throw Error('Missing source number for ' + question.id);
      return {
        ...member(
          'exhibition',
          match[1],
          'Prompt ' + Number(match[1]) + ' · ' + question.text,
          'Scene-specific adaptation',
        ),
        question: 'question:' + question.id,
      };
    }),
    ...levels.FINK.map((id) =>
      member('fink', id, finkNames[id], 'Available curriculum tag'),
    ),
    ...levels.SOLO.map((id) =>
      member('solo', id, soloNames[id], 'Available curriculum tag'),
    ),
    member(
      'solo',
      'prestructural',
      'No relevant connection is evident yet',
      'Planning a support or corrective response',
    ),
    ...pack.characters.map((c) =>
      member(
        'character',
        c.id,
        c.name,
        c.mode === 'historical' ? 'Historical guest' : 'Fictional character',
      ),
    ),
    ...pack.exhibits.map((e) => {
      const provenance = e.specimen
        ? [e.specimen.institution, e.specimen.accession]
            .filter(Boolean)
            .join(' · ')
        : e.historicalLabel;
      return member('exhibit', e.id, e.name, provenance);
    }),
    ...(pack.keepsakes ?? []).map((k) =>
      member('keepsake', k.id, k.name, 'Collectible'),
    ),
    ...pack.lorelingAtlas.map((c) => {
      const active = pack.lorelings.find((l) => l.name === c.name);
      const id =
        active?.id ?? 'atlas-' + c.name.toLowerCase().replaceAll(' ', '-');
      return member(
        'companion',
        id,
        c.name,
        (active ? 'Befriending record' : 'Atlas entry') + ' · ' + c.concept,
      );
    }),
    ...nightFriends.map((f) =>
      member(
        'companion',
        'night-' + f.id,
        f.name,
        f.family.species + ' · ' + f.family.job,
      ),
    ),
  ];
}
