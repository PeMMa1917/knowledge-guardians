/** Each profile has a concrete inspection a reviewer can carry into the scene. These are authored simulations. */
const probes = {
  A1: [
    'reply',
    'Return to the person who will live with the choice. Ask a player to point to the first difference they noticed.',
  ],
  A2: [
    'limits',
    'Try the branch using evidence that supports an alternative. Leave a route to a stronger qualification after the first result.',
  ],
  A3: [
    'clarity',
    'Let a hesitant reader request a first clue and retry. Check whether they can say what they are doing for the character.',
  ],
  A4: [
    'clarity',
    'Read the option aloud without its surrounding art. Pair an unfamiliar work word with an action or object the learner can point to.',
  ],
  A5: [
    'agency',
    'Stop after this response. On return, test whether the player can identify one person who still needs something from them.',
  ],
  A6: [
    'limits',
    'Follow the trail after the first reply. Look for an observation that could change somebody’s mind.',
  ],
  A7: [
    'limits',
    'Restage the decision through a different area of knowledge. Ask what would count as evidence in each.',
  ],
  A8: [
    'agency',
    'Hide the course vocabulary and let a student choose for story reasons. Check whether the person’s need still makes sense.',
  ],
  A9: [
    'access',
    'Attempt the same action by reading, inspecting the scene and following a spoken or captioned cue. Keep these ways interchangeable.',
  ],
  B1: [
    'limits',
    'Play the branch before class. Identify a moment a teacher could ask about afterward without interrupting the scene.',
  ],
  B2: [
    'transfer',
    'Ask two teachers to locate the same learning action using the chapter and encounter names. Record where they disagree.',
  ],
  B3: [
    'limits',
    'Have a teacher in the linked discipline inspect the inference. Keep the material, method and uncertainty specific.',
  ],
  B4: [
    'return',
    'Stop here at the end of class. Resume in the next lesson and test whether the player can recover the task without course-specific instructions.',
  ],
  B5: [
    'transfer',
    'Trace one concrete TOK action back to the subject method used. Keep the activity understandable to a coordinator comparing lesson time.',
  ],
  B6: [
    'transfer',
    'Request a second independent example of the transfer before drawing a school-wide conclusion about attainment.',
  ],
  B7: [
    'access',
    'Repeat on a small screen with limited connectivity. Check whether the same educational choice remains available.',
  ],
  B8: [
    'privacy',
    'Inspect the journal before the first written response. Verify that the audience for family or personal reflections is explained in time.',
  ],
  B9: [
    'return',
    'Disconnect after the visible response, then load Continue. Confirm the room, decision and return route without assuming a school network.',
  ],
  B10: [
    'privacy',
    'Use fictional students in two classes. Verify that this observation stays with its owner and that teacher access follows the disclosed class rule.',
  ],
  B11: [
    'limits',
    'Verify that the record describes a learning opportunity and leaves the student’s eventual assessed work their own.',
  ],
  B12: [
    'transfer',
    'Locate the resource, the action and its limit in the chapter. Check whether an alternate path also reaches a worthwhile knowledge question.',
  ],
  B13: [
    'transfer',
    'Read the preceding and following encounters. Check whether the same idea is used differently at the next level of demand.',
  ],
  B14: [
    'limits',
    'Offer a new example beyond the game. Check whether the learner can carry the distinction into that unfamiliar case.',
  ],
  B15: [
    'voice',
    'Follow the consequence to the people affected. Check who has authorship, who has authority to speak and whose interests are still absent.',
  ],
  C1: [
    'limits',
    'Try two well-reasoned positions. Check that both can cite the evidence and receive the same permanent credit.',
  ],
  C2: [
    'source',
    'Trace one specific object to its context and establish exactly how it supports this inference. Ask what a second example would contribute.',
  ],
  C3: [
    'transfer',
    'Look for evidence of reasoning separate from time played, badges and reading speed. Record the limits of the observation.',
  ],
  D1: [
    'limits',
    'Challenge the argument from a different premise. Allow the disagreement to survive the scene without a penalty.',
  ],
  D2: [
    'limits',
    'Try a counterexample that forces a narrower claim. Check who would still have a reason to defend the earlier position.',
  ],
  D3: [
    'voice',
    'Read the encounter in two intellectual traditions. Identify the distinction the activity preserves and one that requires further discussion.',
  ],
  D4: [
    'transfer',
    'Define a comparison task before collecting any outcome. Keep the intervention, sample and follow-up separate in the report.',
  ],
  D5: [
    'agency',
    'Trace a player who turns down the obvious route. Observe whether the mechanic still produces an interesting decision.',
  ],
  D6: [
    'transfer',
    'Replay with the explanatory labels concealed. Observe which game action actually elicits the target reasoning.',
  ],
  D7: [
    'source',
    'Follow the primary record. Locate the date, maker or recorder and a qualification that would disappear in a simplified retelling.',
  ],
  D8: [
    'voice',
    'Look for a beneficiary and a person bearing a cost. Follow the decision far enough to hear the latter in their own terms.',
  ],
  E1: [
    'agency',
    'Try both an immediate and an exploratory approach. Check that their consequences differ in something the player can perceive.',
  ],
  E2: [
    'voice',
    'Read both characters’ lines in sequence. Make each reply arise from a prior want, a debt or a fear the player has seen.',
  ],
  E3: [
    'return',
    'Visit the same speaker after a different branch. Check the greeting for stale information and a believable change in tone.',
  ],
  E4: [
    'voice',
    'Replay the response as a teenager reluctant to ask for help. Check whether the character gives them something dignified to do.',
  ],
  E5: [
    'voice',
    'Follow the relationship beyond this exchange. Make room for responsibility, uncertainty or mutual dependence within the game’s age range.',
  ],
  E6: [
    'art',
    'Inspect the branch at ordinary and enlarged text sizes. Let the image reveal one narrative detail that survives in its description.',
  ],
  E7: [
    'art',
    'Inspect each branch-specific art key at the rendered resolution. Verify the art, bounds and the physical interaction agree.',
  ],
  E8: [
    'return',
    'Repeat the action and recover an earlier save. Compare the campaign, diary and permanent credit in both states.',
  ],
  E9: [
    'sound',
    'Play the encounter with sound first, then muted with captions. Verify that timing, mood and important information remain intelligible.',
  ],
  E10: [
    'guard',
    'Run the normal option, denied option, repeated input and reload. Inspect the first divergent state and confirm a usable recovery.',
  ],
  E11: [
    'return',
    'Replay this branch after a long campaign at both screen sizes. Check state persistence, UI cost and content consistency together.',
  ],
  E12: [
    'agency',
    'Identify the smallest reusable mechanic that gives this particular character a distinct consequence. Preserve its bespoke line.',
  ],
  E13: [
    'transfer',
    'Attempt the game action with no assessment prompt. Observe how the learner justifies a decision through play.',
  ],
  E14: [
    'guard',
    'Trace the model from input to changed state. Try a boundary value that a student can reach through the published controls.',
  ],
  E15: [
    'agency',
    'Let a design student predict which affordance will change after the choice. Compare the prediction with the actual next scene.',
  ],
  F1: [
    'source',
    'Capture a short, reproducible route and distinguish what the player actually sees from the project’s stated ambition.',
  ],
  F2: [
    'agency',
    'Compare this exchange with the preceding and following scenes. Identify whether the choice creates surprise or repeats their structure.',
  ],
  F3: [
    'transfer',
    'Verify the learner action and its disclosed data audience independently before describing educational or privacy benefits.',
  ],
  F4: [
    'voice',
    'Read the dialogue with a newcomer. Check for wording someone might repeat out of context and whether the portrayal survives that reading.',
  ],
  F5: [
    'return',
    'Try the feature on a school device and a second account. Verify recovery and access before assessing suitability for adoption.',
  ],
  F6: [
    'transfer',
    'Keep the student’s decision and its consequence central. Remove an explanatory layer if the play already teaches the distinction.',
  ],
  G1: [
    'reward',
    'Repeat the choice after earning credit. Check whether mastery is visible without rewarding a single preferred judgement.',
  ],
  G2: [
    'agency',
    'Look for another physical entrance, another witness or another use of the evidence. Return to the original scene with the discovery.',
  ],
  G3: [
    'voice',
    'Seek out both the speaker and the affected companion after the decision. Check what each remembers about the player.',
  ],
  G4: [
    'reward',
    'Compare opposite reasoned outcomes and a no-ranking account. Check that competition remains optional and cannot set a correct TOK belief.',
  ],
  G5: [
    'reply',
    'Follow the last line to a later payoff. Check that the person who needed help has a reason to reappear.',
  ],
  G6: [
    'source',
    'Trace each collectible to a unique record, its earning action and a later use. Check whether visiting alone exposes an unearned citation.',
  ],
  G7: [
    'access',
    'Set Calm mode and pause halfway through. Check that suspense can coexist with an unhurried route back.',
  ],
  G8: [
    'guard',
    'Try changing one variable at a time. Confirm the feedback distinguishes the state that changed from the learner’s interpretation.',
  ],
  G9: [
    'return',
    'Reach the next scene promptly, save and return. Check that quick inputs do not skip a required handover or lose the intended branch.',
  ],
  G10: [
    'agency',
    'Choose against the speaker’s preference for a defensible in-character reason. Follow the response and the price of that choice.',
  ],
  G11: [
    'return',
    'Stop after one decision. Check that the next session identifies what happened, where to resume and a small next step.',
  ],
  G12: [
    'art',
    'Change the arrangement or framing. Look for an audience response that recognises the player’s expressive choice.',
  ],
  H1: [
    'transfer',
    'Ask what the learner does independently before and after help. Look for a support the player can remove once it is familiar.',
  ],
  H2: [
    'transfer',
    'Use a delayed and genuinely different transfer case. Separate observed performance, recall and claims about learning.',
  ],
  H3: [
    'clarity',
    'Observe whether a player can retain the competing claims while choosing. Move nonessential detail behind an optional reveal.',
  ],
  H4: [
    'agency',
    'Offer an easy stopping point. Observe who elects to return and why before attributing motivation to the mechanic.',
  ],
  H5: [
    'reward',
    'Check what the feedback rewards after each alternative. Preserve autonomy and keep cosmetic recognition separate from judgement.',
  ],
  H6: [
    'transfer',
    'Follow a reward back to an actual revised model, comparison or justified choice. Avoid treating the reward itself as evidence of the skill.',
  ],
  H7: [
    'limits',
    'Offer a defensible counter-case that changes the conditions. See whether a student can use the deeper route without repeating introductory work.',
  ],
  H12: [
    'access',
    'Switch modes during the decision. Let the same player use more than one input or representation without assigning a fixed learner type.',
  ],
  I1: [
    'access',
    'Complete the interaction by keyboard and by screen reader. Verify focus order, the name of the action and one useful announcement of its result.',
  ],
  I2: [
    'access',
    'Try the scene with reduced effects, clear routine, increased spacing and an untimed retry. Check each need independently with a learner.',
  ],
  I3: [
    'clarity',
    'Try the first two hint depths and resume independently. Check that requesting support preserves the full range of later choices.',
  ],
  I4: [
    'voice',
    'Identify whose experience is visible in the response. Review assumptions about language, race, gender, disability and who gets to speak.',
  ],
  J1: [
    'source',
    'Find the named Nation’s own record and distinguish it from outsider accounts. Invite the particular community to review its representation.',
  ],
  J2: [
    'voice',
    'Follow who authors the statement, who displays it and who benefits from the choice. Keep these roles visible when they differ.',
  ],
  J3: [
    'clarity',
    'Compare the key term in the option and the reply. Check whose register or translation it represents and whether its meaning shifts.',
  ],
  K1: [
    'access',
    'Check the minimum viewport, focus ring and enlarged text after activating the choice. Confirm that the next available action remains discoverable.',
  ],
};
const quote = (s) => '“' + s + '”';
function describeAction(row) {
  const after = row.replySpeaker
    ? 'the reply from ' + row.replySpeaker
    : row.opens
      ? 'the ' + row.opens + ' activity'
      : 'the close of this conversation';
  return {
    reply: [
      row.reply
        ? 'The next authored line comes from ' + row.replySpeaker + '.'
        : 'The conversation ends at this choice.',
      row.reply
        ? 'A local reply establishes an immediate reaction. A later payoff still needs a return visit.'
        : 'The last visible action gives the player no spoken reply at this node.',
    ],
    limits: [
      row.citationSource
        ? 'The speaker has a named historical source (' + row.citationSource + ').'
        : 'The player can inspect the exact wording of the claim before ' + after + '.',
      'A stored choice records what a player did. It cannot show the reasoning behind it on its own.',
    ],
    clarity: [
      'The option uses ' +
        row.reading.words +
        ' words; ' +
        row.reading.long +
        ' have at least three estimated syllables.',
      'These counts do not show whether a learner understood ' +
        quote(row.label) +
        ' in the speaker’s register.',
    ],
    agency: [
      row.offered > 1
        ? 'The node authors ' + row.offered + ' options before applying their conditions.'
        : 'This exchange offers one authored decision or continuation.',
      row.callbacks.length
        ? 'Other props consult a changed value. Check which difference a first-time player can actually perceive.'
        : 'A later world change is not identified by the option-to-map scan. Follow ' +
          after +
          ' before crediting a lasting consequence.',
    ],
    source: [
      row.citationSource
        ? 'The source attached to this line is ' + row.citationSource + '.'
        : 'The line carries the history classification ' + (row.historicalLabel ?? 'unspecified') + '.',
      'This classification alone cannot identify the source of each claim or establish approval from anyone represented.',
    ],
    access: [
      'The input is a named choice, ' + quote(row.label) + '.',
      'A text label cannot establish focus order, speech output or usability of the next interaction.',
    ],
    privacy: [
      'The normal choice can leave a diary record of this authored exchange.',
      'Class diary writing, learner-profile moments, private photos and separately shared portfolio entries have different audiences. This branch alone cannot verify them.',
    ],
    transfer: [
      'The decision can be repeated from ' + row.id + ' and compared with ' + after + '.',
      'The presence of the opportunity cannot establish retention, transfer, assessment attainment or the effect of an hour of play.',
    ],
    voice: [
      row.replySpeaker
        ? 'The voice changes from ' +
          row.speaker +
          ' to ' +
          row.replySpeaker +
          ' or continues in that speaker’s register.'
        : row.speaker + ' has the last spoken line at this point.',
      'A named speaker does not establish an independent motive or a fair account of another person’s experience.',
    ],
    art: [
      row.callbacks.some((c) => c.detail === 'art')
        ? 'A state change can select different artwork.'
        : 'The option can be matched to its physical approach through the listed rooms.',
      'Source data cannot establish how legible or distinctive the branch looks on the player’s screen.',
    ],
    sound: [
      'The route identifies where to listen, from ' + row.speaker + ' to ' + after + '.',
      'Sound availability, caption equivalence and the emotional effect of a cue require a rendered playthrough.',
    ],
    return: [
      row.callbacks.length
        ? 'A condition used by ' + row.callbacks[0].label + ' reads a value changed here.'
        : 'The destination of this option is ' + (row.next ?? 'the end of the exchange') + '.',
      'Restoring the same line does not prove that the previous choice, object or unfinished writing also survived.',
    ],
    reward: [
      row.effects.length
        ? 'The option declares ' + row.effects.length + ' immediate effects.'
        : 'The option declares no immediate effect of its own.',
      'Later objective completion can grant credit. Equality of rewards must include those later consequences.',
    ],
    guard: [
      row.guard
        ? 'The option has a recorded availability condition.'
        : 'The option is unconditional at this node.',
      'Exercising a staged flag does not establish a physical route from the start of the chapter.',
    ],
  };
}
const interventions = {
  reply: (where, after) =>
    'Give ' + after + ' a reaction another character can recognize on returning to ' + where + '.',
  limits: (where, after) =>
    'Give the player a concrete boundary case to bring back to ' + after + ' in ' + where + '.',
  clarity: (where, after) =>
    'Put the familiar action first in ' +
    where +
    ' and let the player hear the unfamiliar term again from ' +
    after +
    '.',
  agency: (where, after) =>
    'Make a later difference visible to a returning visitor in ' +
    where +
    ' and leave a way to reconsider the choice with ' +
    after +
    '.',
  source: (where, after) =>
    'Attach the specific author or custodian to the claim in ' +
    where +
    ' and make the narrower claim available through ' +
    after +
    '.',
  access: (where, after) =>
    'Keep the next control reachable after ' +
    after +
    ' responds. Return focus to a named control on re-entering ' +
    where +
    '.',
  privacy: (where, after) =>
    'Explain the audience before opening any writing surface from ' +
    where +
    ' and exercise that boundary with fictional accounts.',
  transfer: (where, after) =>
    'Give ' +
    after +
    ' a second case in different conditions and let the player take something learned in ' +
    where +
    ' into it.',
  voice: (where, after) =>
    'Let ' +
    after +
    ' give an independent reason for accepting, qualifying or resisting the choice made in ' +
    where +
    '.',
  art: (where, after) =>
    'Add a visible state change in ' +
    where +
    ' that a returning player can also inspect in words with ' +
    after +
    '.',
  sound: (where, after) =>
    'Time a short cue to the change at ' +
    where +
    ' and give the same information in visible text with ' +
    after +
    '.',
  return: (where, after) =>
    'Give the player a recognisable return point in ' +
    where +
    ' where ' +
    after +
    ' can react to what changed.',
  reward: (where, after) =>
    'Let the reward change an available use in ' +
    where +
    ' and keep conversation with ' +
    after +
    ' available after a different choice.',
  guard: (where, after) =>
    'Explain the missing prerequisite in world language at ' +
    where +
    ' and restore a route back to ' +
    after +
    '.',
};
function proposed(lens, where, after) {
  return interventions[lens](where, after);
}
export function reviewChoice(person, row) {
  const [lens, check] = probes[person.id];
  const [strength, concern] = describeAction(row)[lens];
  const place = row.rooms[0] ?? row.node,
    recipient = row.replySpeaker || row.speaker;
  return {
    persona: person.id,
    name: person.name,
    strength,
    concern,
    check,
    ifConcernObserved: proposed(lens, place, recipient),
    action: row.id,
  };
}
export function reviewStation(person, station) {
  const [lens, check] = probes[person.id];
  const destination = station.destination
    ? ' leads to ' + station.destination.map
    : station.tool
      ? ' opens ' + station.tool
      : station.node
        ? ' starts ' + station.node
        : ' is encountered in ' + station.map;
  const name = quote(station.label);
  return {
    persona: person.id,
    name: person.name,
    strength: name + destination + '.',
    concern: station.guard
      ? 'A visit to ' +
        station.map +
        ' alone cannot establish whether ' +
        name +
        ' was visible under its current condition.'
      : 'The placement locates ' + name + '. Its consequence needs a separate observed interaction.',
    lens,
    check,
    ifConcernObserved: proposed(lens, station.map, 'the next person at ' + name),
    action: station.id,
  };
}
