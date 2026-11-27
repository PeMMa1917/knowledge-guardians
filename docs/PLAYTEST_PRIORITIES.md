# Playtest and development priorities

Knowledge Guardians has fifteen playable chapters and a post-Council return. The next round should measure what students encounter, what they can carry into a new setting, and which story choices they want to pursue. [Browser checks](BROWSER_CHECKS.md) · [Learning design](LEARNING_DESIGN.md)

Across 60 executable chapter routes, 41 reach six concepts, two framework parts, an area of knowledge and an optional theme in the first estimated 30 minutes. Twenty-four sustain that floor in every 30-minute window. In the 20-minute test, the counts are 29 and six. The current micro-skill audit records 1,157 links between playable actions and 509 of the 1,200 supplied skills. For 136 skills the highest available stage is Practised. Six can reach Confident. Time real sessions on the routes with gaps and ask students to use the same method on an unfamiliar object. [Learning audit](LEARNING_DESIGN.md#the-20--and-30-minute-opportunity-floor) · [Micro-skills audit](TOK_MICRO_SKILLS.md)

| Priority | Work to do | How to check the improvement |
| --- | --- | --- |
| 1. Sustained TOK encounters | Time a fresh story route, a social route and long optional detours with students. Give recurring concepts more short, consequential appearances where the existing route models show gaps. | Track actions and route choices in each rolling 30-minute window. Compare how often a distinct action and another perspective carry the same idea. [Design audit](LEARNING_DESIGN.md#the-30-minute-design-audit) |
| 2. Transfer and examiner feedback | Expand the shortest subject and theme strands through different tools. Test whether a student distinguishes an original object from a different edition or a representation, keeps a claim within its evidence, revises a conclusion, and can tell who will act on it. | Watch these decisions during later play. Compare the student’s explanation of the consequence with the relevant mechanism and source limit. [TOK alignment](TOK_ALIGNMENT.md) |
| 3. Local voices and collections | Commission or review further public, community-led examples with named makers and custodians. Add new regionally grounded stories and multiple uses for each record. Keep restricted materials outside the exhibit register. | Have relevant communities or historians review each case, its dated source, and the job or choice it changes. [Source register](SOURCES.md) |
| 4. Wider branching and later payoffs | Add distinct objectives and routes for role-playing, discovery, creative play and procedural challenges. Extend more early friends and promises into the ending. Prioritize documented gaps in the two RPG inventories. | On new and returning saves, reach outcomes after skipping the earlier optional encounter, then replay with a matching tool or achievement and observe what changes in the world. [Story elements](STORY_ELEMENTS.md) · [Game elements](GAME_ELEMENTS.md) |
| 5. Access, devices and long sessions | Test screen readers, touch targets, low-end school hardware, audio disabled, switching language settings, carrying an old save, and printing on managed devices. Use long trips across rooms to catch resource growth and small viewports to catch clipped controls. | Capture cold startup and interaction timings, verify keyboard focus and return paths, and check A4 Word/PDF copies with both privacy choices. The current main JavaScript bundle is 2.52 MB in gzip format. [Browser checks](BROWSER_CHECKS.md) |
| 6. Curriculum breadth and volume | Audit guide question families and essay topics by period and topic before adding more original gameplay interpretations. Build a stronger variety of consequences around each question family, DP subject, learner attribute and inquiry habit. | Keep a source-to-action inventory that names the observable consequence. Confirm several materially different ways to meet the topic, with no requirement to answer a classroom prompt. [Exhibition examples](TOK_ALIGNMENT.md#exhibition-habits-in-play) |

The current subject audit lists 23 Language ab initio objectives, seven World religions objectives and six Sports, exercise and health science objectives. All are optional. Main routes need independent opportunities for these subjects alongside their existing side cases. Repeat the audit after adding new actions and check whether players can apply the same method in a second world. [Subject and level audit](../tools/audit-curriculum.mjs) · [Transfer audit](../tools/audit-learning-transfer.mjs)

## Platform evidence and persona review

Record the build, operating system, browser engine and version, input method, and whether the test used physical hardware or emulation. Include startup, settings, movement and navigation, guidance, interruption and save recovery, and the journal or progress export on the relevant platforms. Record the specific fixture, observed outcome and any untested combinations. [Browser checks](BROWSER_CHECKS.md)

Use the platform evidence to prepare the requested persona review after the game reaches readiness. Give every role its own observations, concerns, proposed changes and a replayable stress scenario. Keep proposed hidden humor optional and link it to a believable scene. Keep common fixes and disagreements visible, and identify the source of evidence for each view. Leave testimony from a specific community, institution or participant attributed to the people who actually supplied it.


## Where the shorter visits lose breadth

The story route has seven gaps under the 20-minute rule. The puzzler route has four under the 30-minute rule. The ranges below give the modeled minute at the **end** of a rolling window. Adjacent gaps are grouped by place. A classroom observer can use the landmarks even when a learner plays at a different pace.

| Route and window end | What drops below target | What to watch in play |
| --- | --- | --- |
| Story, minutes 74–83, from the Weigh-House to Oskar’s maps | An optional theme throughout and the concept count from minute 76 to 78 | Let the player decide who gets the dry frame. Watch whether they notice whose route disappears when Oskar changes the map’s audience. |
| Story, minutes 103–112, leaving Elsbet’s study | Concept and optional-theme breadth, with framework breadth also low from minute 108 | Ask the player to show another person how a keepsake changed their reading of the letter. Check whether they can distinguish the words Elsbet left from what the Guardian inferred. |
| Story, minutes 132–134 and 137–139, and puzzler, minutes 207–212, after the Nile packet | The earlier story interval and the puzzler interval lack an optional theme. The later story interval is short of concepts. | Watch which slip a learner puts first and what Ise does with it. Ask who would need the second slip before acting on that first account. |
| Puzzler, minutes 103–116, from the bell stair and easel to the lintel | An optional theme | Have one player leave Nell’s whole scene with a seller and another display it behind Bram’s crop. Later, ask each to identify who got to change what visitors saw. |
| Puzzler, minutes 166–177, around the cellar letter | An optional theme | After the ballad and trade encounters, watch which source the player voluntarily takes back to the letter and whether it changes their reading. |
| Puzzler, minutes 273–274, at the headland gauge | An optional theme | Return after the next bell. Ask the player to distinguish the instrument reading from the claim the quay can print about it. |

These are proposed participant observations. The automated intervals can be reproduced with `node tools/audit-tok-floor.mjs --json`. [Timing rules](../tools/tok-floor.ts)

## Choices to watch in the next classroom playtest

- Hand the same student the runner’s chart a week after they play the river story. Ask what else they would need before telling a family its warning was heard. Observe whether the student spontaneously distinguishes arrival of a signal from someone hearing it.
- In a new chapter, let a returning player find a guest unaided, retrieve their own tracing and decide whether the omitted piece changes their reading. Observe the search, the decision and whether they choose another visit.

- Watch where players first follow the blue thread. Can they explain why two witnesses might leave the same mark for different reasons? At the recheck, ask whom the public rail or private desk allowed to reply.
- Let players try the parcel counter with either keeper. Listen for a distinction between finding a matching tag and identifying the owner. Check what a player changes after seeing the line at the stair.
- Invite one student to share a single local score and another to keep their alias private. Check whether each can tell what the recipient gets and what the withdrawal file does. A count of recorded practice measures participation. Evidence of learning needs an unfamiliar task.
- Observe a student exporting one week of science entries and a personal reflection. Verify that their intended reader gets the chosen entries, that the student can withhold private writing, and that their own accents, line breaks and source links survive.
- Compare free exploration with guided play in a class using screen readers, switch input, touch and high zoom. A hint can remove a control barrier while leaving both story choices available.
