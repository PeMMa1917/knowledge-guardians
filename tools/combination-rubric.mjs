// Each entry is a review prompt for the cognitive pairing, independent of the game's evidence ledger.
export const cognitiveGuide = {
  remember: [
    ['Retrieve an identified detail.', 'At the listening shelf, follow W–17 to its matching sleeve and retrieve the permission written on it. Record what the player had to remember or recognise.'],
    ['Look for a distinction between recall and sorting.', 'If the player recalls a shelf mark and then groups permissions by audience, identify which part required interpreting a category. The recalled mark can have its own DOK 1 record.'],
    ['Locate the decision that required a strategy.', 'A player who remembers two conflicting statements still has to decide how to investigate them. Record the retrieval and the investigation separately. Leave this pairing open if retrieval was the entire demand.'],
    ['Identify the contribution of memory to a sustained inquiry.', 'A remembered fare matters when another chapter reopens Kip’s case. The length of the journey alone cannot elevate the recall. Identify the extended demand and its own Bloom process.'],
  ],
  understand: [
    ['Express a familiar meaning.', 'A borrower puts a signed tag beside the name of the person who promised to pay. Look for a restatement or representation that shows what the tag means.'],
    ['Interpret the same idea in another form.', 'At the inn, use what a resident can sense to explain why help from the mat differs from help at the sill. Record the interpretation the player acts on.'],
    ['Reconcile interpretations that matter to different people.', 'Ask what the shopkeeper’s count could mean to a coat borrower. Identify the conflicting evidence the explanation has to accommodate and how the player can test it.'],
    ['Build and revisit an interpretation over time.', 'Trace the meaning of a public mark from a sleeve to a till and into a council record. Look for evidence gathered in separate settings that changes the eventual explanation.'],
  ],
  apply: [
    ['Carry out a specified, familiar procedure.', 'Follow a known rule for identifying the side of a sleeve with the transfer mark. Record the actual rule and the observable step.'],
    ['Select and use a method in a new case.', 'Take a hearing rule from the well to the weir. Try a rubbing and a knock in the available time slot and inspect what the arriving keeper can recover.'],
    ['Adapt a method to uncertain conditions.', 'The short crossing is dry when the first runner goes through. At high water, select a new test point and show how that decision changes whom the delivery reaches.'],
    ['Transfer and revise a method across contexts.', 'Follow a loan procedure from the hatch to two receiving crews, test it with people who face different access costs, and revise the handover from what each crew reports.'],
  ],
  analyse: [
    ['Check whether identification alone settles the task.', 'Pointing to the two bells in a picture is recognition. To claim analysis, identify a necessary relationship the player must establish and explain why little reasoning suffices.'],
    ['Compare components and the relation between them.', 'At the coat rail, press the wet cuff against a blank sleeve. Compare two matching pear marks with the number of people who handled the cloth.'],
    ['Separate rival explanations using a discriminating observation.', 'On the kitchen recording, listen beyond “it rang” to the next two grooves. Identify which bell the witness heard and which claim about the tower is still open.'],
    ['Integrate linked analyses across an extended investigation.', 'Trace a payment, two different handling histories and the order in which the marks appeared. Check how a test devised in one place changes the reading in another.'],
  ],
  evaluate: [
    ['Identify whether the decision is predetermined.', 'Matching a tag to a printed standard can be a routine check. If the response is predetermined, document the simpler process. A genuine judgement needs identifiable criteria.'],
    ['Judge a bounded case using supplied criteria.', 'Apply the stated access and repair criteria to two coat hooks. Record which criterion is decisive for this borrower and what the other arrangement still offers.'],
    ['Weigh competing evidence and consequences.', 'Sign a hearing rule after trying the staffed bell and the chalk slot. Show who can make a claim using each one and what might warrant revising the choice.'],
    ['Defend and revisit a judgement across an extended inquiry.', 'Use the inn’s earlier invitation, a tested cart route and the lamps’ sightline when assigning the evening key. Return to inspect the consequences for the other neighbour.'],
  ],
  create: [
    ['Ask what the player actually originated.', 'Copying a keeper’s supplied signal shows reproduction. For a claimed low-depth creation, identify an original contribution and show how the task permits it within a tightly constrained operation.'],
    ['Combine familiar components into a new working product.', 'Compose a four-beat rain effect, hear it from two positions and issue the score. Capture the particular arrangement the player made and what a second crew can do with it.'],
    ['Design and test a response to competing needs.', 'Create an entrance and shift at the claim bell. Try it with both claimants, then send the resulting arrangement to a keeper with different obligations.'],
    ['Design, transfer, test and revise over time.', 'Follow the player’s design across independent trials. Record the first version, what another community experienced, what the maker changed and how the revised version performed.'],
  ],
};
export const rubricSources = [
  { citation: 'Hess, Karin K., et al. “Cognitive Rigor: Blending the Strengths of Bloom’s Taxonomy and Webb’s Depth of Knowledge to Enhance Classroom-Level Processes.” 7 Mar. 2009. ERIC, ED517804.', url: 'https://eric.ed.gov/?id=ED517804' },
  { citation: 'Krathwohl, David R. “A Revision of Bloom’s Taxonomy: An Overview.” Theory Into Practice, vol. 41, no. 4, 2002, pp. 212–18.', url: 'https://doi.org/10.1207/s15430421tip4104_2' },
  { citation: 'Webb, Norman L. Criteria for Alignment of Expectations and Assessments in Mathematics and Science Education. Research Monograph No. 6, Apr. 1997. ERIC, ED414305.', url: 'https://eric.ed.gov/?id=ED414305' },
];
export function guideDocument() {
  const out = [
    '# Reviewing a Bloom and DOK cell', '',
    'Use the six Bloom processes for what the player must do. Use Webb’s Depth of Knowledge for the reasoning that the task demands. Identify the action, who depends on it, what the player can change and the evidence that would warrant a check.', '',
    'Some examples below are design or playtest prompts. The implementation register identifies the actions that already have documented evidence. A remembered detail can support an extended investigation while its own retrieval still belongs at DOK 1. A high-level verb, time spent playing, or a difficult interface is insufficient evidence of cognitive depth.', '',
    '[Open the checklist](COMBINATION_CHECKLIST.html) · [Inspect registered evidence](COMBINATION_REVIEW_STATUS.md) · [Find a skill](SKILL_REVIEW_INDEX.md)', '',
  ];
  for (const [level, rows] of Object.entries(cognitiveGuide)) {
    out.push('## '+level[0].toUpperCase()+level.slice(1), '');
    rows.forEach(([title, detail], i) => out.push('### DOK '+(i+1), '', '**'+title+'** '+detail, ''));
  }
  out.push('## Observing transfer', '', 'For a transfer claim, describe what changed in the new context, what help was available, what the learner independently adapted and how the outcome could be checked. Two routes or two valid endings can present different evidence for the same skill.', '');
  out.push('## Works cited', '', ...rubricSources.flatMap(s => [s.citation + ' [Source](' + s.url + ')', '']));
  return out.join('\n');
}
