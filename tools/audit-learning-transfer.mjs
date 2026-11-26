/** Compare authored hints and skill routes with the game's Skill Atlas thresholds. */
import { createServer } from 'vite';

function groupBy(entries, keyOf) {
  const groups = new Map();
  for (const entry of entries) {
    const key = keyOf(entry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return groups;
}

const distinct = (values) => [...new Set(values)];
const depths = [1, 2, 3, 4];
const textKey = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();
const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
});

try {
  const { buildPack } = await server.ssrLoadModule('/src/content/index.ts');
  const { MICRO_SKILLS, microSkillId } = await server.ssrLoadModule('/src/content/microSkillEvidence.ts');
  const { microSkillRows } = await server.ssrLoadModule('/src/domain/microSkillAudit.ts');
  const { objectiveSkillUse, skillStage } = await server.ssrLoadModule('/src/domain/skills.ts');
  const { SUBJECTS } = await server.ssrLoadModule('/src/domain/curriculum.ts');
  const { LEARN } = await server.ssrLoadModule('/src/domain/learningLevels.ts');
  const pack = buildPack();
  const objectives = pack.missions.flatMap(({ world, objectives }) => objectives.map((step) => ({ world, step })));
  const objectiveById = new Map(objectives.map(({ step }) => [step.id, step]));
  const hintsByObjective = groupBy(pack.hints, ({ objective }) => objective);
  const hintSets = objectives.map(({ world, step }) => {
    const hints = hintsByObjective.get(step.id) ?? [];
    const groups = groupBy(hints, ({ depth }) => depth);
    return {
      id: step.id,
      world,
      missingDepths: depths.filter((depth) => !groups.get(depth)?.length),
      conditionalOnlyDepths: depths.filter((depth) => groups.get(depth)?.every((hint) => hint.if)),
      hasConditions: hints.some((hint) => hint.if),
      // Prefer the ordinary hint. Flag repeated wording for author review, not as a quality score.
      layers: depths.map((depth) => {
        const choices = groups.get(depth) ?? [];
        return textKey((choices.find((hint) => !hint.if) ?? choices[0])?.text ?? '');
      }),
    };
  });
  const explicitThinking = objectives.filter(({ step }) => step.weave?.thinking);
  const rows = microSkillRows(pack, MICRO_SKILLS);
  const skills = [...groupBy(rows, ({ skill }) => skill)].map(([number, uses]) => {
    const signatures = distinct(uses.map(({ world, objective }) =>
      objectiveSkillUse(world, objectiveById.get(objective), microSkillId(number))));
    return {
      number,
      useCount: signatures.length,
      worlds: distinct(uses.map(({ world }) => world)).sort(),
      actions: distinct(signatures.map((signature) => signature.split('|')[1])).sort(),
      aoks: distinct(uses.flatMap(({ objective }) => objectiveById.get(objective).weave?.aoks ?? [])).sort(),
      maximumAuthoredStage: skillStage(signatures),
    };
  });
  const subjects = Object.entries(SUBJECTS).filter(([, { group }]) => /^G[1-4]/.test(group))
    .map(([id, { name, group }]) => {
      // Join on the same objective so a neighbouring tag cannot supply evidence for another action.
      const linked = rows.filter(({ objective }) => objectiveById.get(objective).weave?.subjects?.includes(id));
      const bySkill = groupBy(linked, ({ skill }) => skill);
      return {
        id, name, group, links: linked.length,
        skills: [...bySkill.keys()],
        inMoreThanOneWorld: [...bySkill].filter(([, uses]) => distinct(uses.map(({ world }) => world)).length > 1)
          .map(([number]) => number),
        worlds: distinct(linked.map(({ world }) => world)).sort(),
        depths: distinct(linked.flatMap(({ thinking }) => thinking ? [thinking.dok] : [])).sort(),
        objectives: distinct(linked.map(({ objective }) => objective)),
      };
    });
  const report = {
    objectives: objectives.length,
    hintEntries: pack.hints.length,
    missingHintDepths: hintSets.filter(({ missingDepths }) => missingDepths.length),
    objectivesWithConditionalHints: hintSets.filter(({ hasConditions }) => hasConditions).length,
    conditionalOnlyHintDepths: hintSets.filter(({ conditionalOnlyDepths }) => conditionalOnlyDepths.length),
    repeatedDefaultHintText: hintSets.filter(({ layers }) => distinct(layers.filter(Boolean)).length < layers.filter(Boolean).length),
    sharedHintSets: [...groupBy(hintSets.filter(({ layers }) => layers.every(Boolean)), ({ layers }) => JSON.stringify(layers))]
      .filter(([, entries]) => entries.length > 1).map(([, entries]) => entries.map(({ id }) => id)),
    explicitThinkingObjectives: explicitThinking.length,
    dok4Objectives: explicitThinking.filter(({ step }) => step.weave.thinking.dok === 4).map(({ step }) => step.id),
    dok4RegistryEncounters: Object.entries(LEARN).filter(([, tag]) => tag.dok === 4).map(([id]) => id),
    dok4MicroSkillLinks: rows.filter(({ thinking }) => thinking?.dok === 4),
    skillLinks: rows.length,
    linksWithoutNumericChapter: rows.filter(({ chapter }) => chapter === 0).map(({ skill, objective, world }) => ({ skill, objective, world })),
    skills,
    subjects,
  };

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`${report.objectives} objectives, ${report.hintEntries} hints, ${report.missingHintDepths.length} objectives with a missing depth.`);
    console.log(`${report.repeatedDefaultHintText.length} objectives repeat wording within a hint set; ${report.sharedHintSets.length} full sets are reused.`);
    console.log(`${report.conditionalOnlyHintDepths.length} objectives have a depth with conditional hints only.`);
    const stages = [...groupBy(skills, ({ maximumAuthoredStage }) => maximumAuthoredStage)]
      .map(([stage, entries]) => `${stage} ${entries.length}`).join(', ');
    console.log(`Maximum authored Skill Atlas stages: ${stages}. ${skills.filter(({ worlds }) => worlds.length > 1).length} skills have links in multiple worlds.`);
    console.log(`${report.dok4Objectives.length} DOK4 objectives, ${report.dok4RegistryEncounters.length} DOK4 registry encounters, ${report.dok4MicroSkillLinks.length} DOK4 micro-skill links.`);
    console.log(`${report.linksWithoutNumericChapter.length} micro-skill links use mission IDs without a numeric chapter prefix.`);
    console.log('Subject | Group | Same-objective links | Worlds | Same skill in multiple worlds');
    for (const { name, group, links, worlds, inMoreThanOneWorld } of subjects) {
      console.log([name, group, links, worlds.length, inMoreThanOneWorld.length].join(' | '));
    }
  }
} finally {
  await server.close();
}
