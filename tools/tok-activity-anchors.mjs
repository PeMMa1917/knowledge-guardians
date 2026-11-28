// The mission question and a registered step question have different provenance.
export function activityAnchors(pack, levels, topics) {
  const areaIds = new Set(topics.TOK_AREAS);
  const themeIds = new Set(topics.TOK_OPTIONAL_THEMES);
  const questions = new Map(pack.questions.map((q) => [q.id, q.text]));
  return pack.missions.flatMap((mission) =>
    mission.objectives.map((step) => {
      const { concepts = [], framework = [], aoks = [] } = step.weave ?? {};
      const derived =
        framework.length || !concepts.length
          ? []
          : levels.frameworkFromConcepts(concepts);
      const linked = [
        ...new Set(
          [step.kq, ...(step.questionWays ?? [])]
            .map((q) => q?.id)
            .filter(Boolean),
        ),
      ];
      const areas = aoks.filter((k) => areaIds.has(k));
      const themes = aoks.filter((k) => themeIds.has(k));
      const gaps = [
        ...(!concepts.length ? ['concept'] : []),
        ...(!framework.length && !derived.length ? ['framework'] : []),
        ...(!areas.length && !themes.length ? ['area-or-theme'] : []),
        ...(!linked.some((k) => questions.has(k)) &&
        !mission.knowledgeQuestion?.trim()
          ? ['knowledge-question']
          : []),
      ];
      return {
        id: step.id,
        title: step.title,
        mission: mission.id,
        world: mission.world,
        concepts,
        framework,
        derivedFramework: derived,
        areas,
        themes,
        questions: linked,
        missionQuestion: mission.knowledgeQuestion ?? '',
        gaps,
      };
    }),
  );
}
