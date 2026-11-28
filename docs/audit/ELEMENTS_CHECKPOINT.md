# Knowledge Guardians element audit

The combination atlas adds the full register of mission questions and same-action or ordered-route lookups. [Combination atlas](COMBINATION_ATLAS.md)

## Current combination review

The working checklist has 7,757 members in 29 families, including 1,200 named and numbered micro-skills, 47 further skills and 798 registered or mission-specific knowledge questions. Start from one member, find its reviewed actions, or pin it with the required TOK anchors and browse combinations by number. Each exact combination, sequence and chapter has 24 independent cells. The public evidence register contains 173 observations across 135 distinct action IDs and 57 ordered journeys. An unreviewed cell is available for a reviewer to investigate. [Open the checklist](COMBINATION_CHECKLIST.html) · [Inventory](COMBINATION_MEMBERS.md) · [Review method](COMBINATION_ATLAS.md)

There are 4,253 objectives across 913 missions with a concept, a framework link and an area or theme under the documented anchor rules. These structural links alone establish neither cognitive depth nor ten distinct opportunities at a requested cell. At the cloakroom and theatre, two different gestures can make the same sound. A reviewer can reproduce that comparison, or investigate whose hands an audience can see, before checking the corresponding cell. [Coat-rail activities](RETURN_COAT.md)

## Earlier checkpoint

**Review checkpoint 9c2cb1f, 28 November 2026.** The draft builds and the game contains fifteen playable chapters. A player can spend a first hour on the modeled story route encountering all twelve key concepts and all four framework parts. The wider promise of ten different actions for every learning and design element in every world remains open. The largest gaps concern practice across settings, variation in repeat visits, and evidence from students and communities. [Audited code](https://github.com/PeMMa1917/knowledge-guardians/tree/9c2cb1f9481bf83fc60558f5954c5e0f006fefc2) · [Draft pull request](https://github.com/PeMMa1917/knowledge-guardians/pull/11)

## What a reviewer can inspect

The spreadsheet-compatible register lists **every one of the 150 narrative elements and 288 numbered game elements**. Each row gives its design status, the number of distinct source-reviewed actions, the worlds in which they occur and a first place to reproduce one. The catalogues also explain partial adaptations and exclusions individually. [438-row register](element-evidence.csv) · [Narrative catalogue](../STORY_ELEMENTS.md) · [Game systems catalogue](../GAME_ELEMENTS.md)

The campaign contains **875 missions, 4,075 objectives and 1,293 physical field-game stands across 163 rooms**. It has 1,171 registered field-game tool identifiers, 15 conventional puzzle records, seven Showdowns and 459 character records. A stand can provide more than one activity. Visiting the same kind of stand twice is counted as two placements. The pause menu makes the optional training gym available in every chapter. It has an exhibition bench, practice titles and word cards. [Map and mission inventory](../../src/content/index.ts) · [Gym](../../src/ui/gymPanel.ts)

## Where the design meets its targets

| Inventory | Playable | Partial | Planned | Excluded |
| --- | ---: | ---: | ---: | ---: |
| 150 narrative elements | 135 | 14 | 0 | 1 |
| 288 game elements | 128 | 108 | 25 | 27 |

One example can earn a catalogue entry a playable status. The stricter test joins a particular learning dimension, numbered design element and physical world through a distinct tested or reviewed action. The two chapter-one worlds are counted separately, giving **16 worlds, 1,531 learning dimensions and 438 design elements**. Of 10,729,248 combinations, **2 reach ten**, 2,578 have one to nine actions, and 9,428,380 await their first action proof. A further 612,400 involve planned designs and 685,888 involve excluded designs. Both ten-action cases concern investigating evidence, in the Nexus and in Emberford. [Method and limitations](../CROSS_WEAVE_AUDIT.md) · [Reproduce an individual cell](../../tools/audit-cross-weave.mjs)

### TOK and DP learning

**614 of 1,200 supplied micro-skills** have a reachable authored use, giving 1,434 links. 385 skills recur in more than one world and 586 have no registered playable use. On the game's own opportunity rules, 439 can currently reach Seen, 165 Practised and 10 Confident. None reaches the Transferred threshold from the recorded opportunities. This measures what the adventure offers. Learning and transfer need a student using the method on a new problem. [Skill evidence](../../tools/audit-micro-skills.mjs) · [Transfer thresholds](../../tools/audit-learning-transfer.mjs)

The table counts distinct members of each inventory that have at least one action in the stricter review linking the member to a specific game or narrative element. Named subjects and active skills may have many additional teaching opportunities outside this ledger. The official scope beyond the verified question and title inventories is unknown.

| Inventory | At least one reviewed design intersection / inventoried |
| --- | --- |
| Key concepts | 12 / 12 |
| Framework parts | 4 / 4 |
| Areas of knowledge | 5 / 5 |
| Core and optional themes | 4 / 6 |
| DP subjects | 22 / 30 |
| Approaches to learning | 1 / 5 |
| Approaches to teaching | 0 / 6 |
| Learner profile attributes | 1 / 10 |
| CAS practice categories | 0 / 3 |
| Extended Essay practice category | 0 / 1 |
| Other registered skill IDs | 0 / 47 |
| Vocabulary | 3 / 51 |
| Word histories | 0 / 51 |
| Registered knowledge-question families | 31 / 52 |
| Verified past essay title ordinals | 1 / 42 |
| Reasoning modes | 6 / 6 |
| Numbered micro-skills | 171 / 1200 |

The 52 registered question families include 35 exhibition families. Twenty-eight of those 35 have a separate design-intersection proof. Seven sourced essay sessions account for 42 title ordinals. Two reviewed actions adapt the same title in different areas. The 51 glossary entries bound the word-history check. A source or a definition by itself does not demonstrate using its history to change a decision. The six reasoning modes appear in reviewed actions and 61 actions explicitly contrast methods and limits across areas. [Question encounters](../../src/content/questionEncounters.ts) · [Reviewed examples](../../tools/audit-cross-weave.mjs)

All 30 registered DP subjects have linked objectives. Sports, exercise and health science has 12 across five worlds, dance 15 across five, world religions 16 across six and chemistry 24 across five. Eleven subjects lack an explicitly tagged DOK 4 objective. Across the game, 3,824 objectives carry a thinking tag. Of 4,075 objectives, 99 carry DOK 4, and 29 micro-skill links carry DOK 4. [DP subject inventory](../../tools/audit-curriculum.mjs)

Testing the ten-occurrences target at a simpler level, **30 of 60** chapter-by-DOK levels have ten tagged objectives. The figures are **61 of 90** for Bloom, **47 of 90** for Fink, and **31 of 60** for the four SOLO levels used by this game. Counting tagged objectives does not establish that each skill occurs ten times at each level. The play-style and preference audit also reports combinations separately. A student can switch how they play, read, listen or operate a control. [Thinking framework](../LEARNING_DESIGN.md) · [Preference and level inventory](../../tools/audit-micro-skills.mjs)

### How quickly a student encounters TOK

Each full rolling window is checked for six different concepts, two framework parts, an area of knowledge and an optional theme. The figures are **estimated minutes during which the rolling window falls below that floor**. They describe authored itineraries and completion times. They do not predict an individual learner’s pace or assessment result. [Timing audit](../../tools/audit-tok-floor.mjs)

| Itinerary | Modeled minutes | Below floor at 20 min | Below floor at 30 min | First-hour concepts / framework / areas / optional themes |
| --- | --- | --- | --- | --- |
| story | 504 | 0 | 0 | 12 / 4 / 3 / 3 |
| social | 670 | 84 | 44 | 12 / 4 / 3 / 2 |
| explorer | 4,404 | 572 | 247 | 12 / 4 / 4 / 2 |
| puzzler | 700 | 67 | 14 | 12 / 4 / 4 / 2 |
| cozy | 775 | 82 | 13 | 12 / 4 / 4 / 3 |
| explorer, all filed cases | 12,421 | 3,096 | 2,611 | 12 / 4 / 4 / 2 |

A separate test actually executed the actions on 60 chapter routes, using estimated timestamps for the resulting objective completions. All 60 passed every rolling 30-minute window on their trace. At 20 minutes, 31 reached the floor in the first window and 13 sustained it. These shorter, prepared routes answer a different question from the six cumulative itineraries in the table. [Executable route fixtures](../../tests/tok-coverage.test.ts)

### People, objects and consequences

Each of the **250 historical guests** has a chapter workshop and a receiving encounter in each of fifteen chapters. Approved traces and omitted pieces can travel between them. There are **240 named Night Register companions** built from **16 recurring job families**. Each pair of works can be pursued in either order. The difference between 240 companions and 16 underlying interactions matters when judging replay variety. [Guest route tests](../../tests/lamplight.test.ts) · [Received tracings](../../tests/coat-tracing.test.ts) · [Companion trails](../../tests/night-register.test.ts)

The catalogue verifier accepted **2,057 distinct, dated objects**, each with one registered physical location, a specific institutional record and separate art. 1,798 have a licensed local pixel image. 1,020 have a dedicated equipped return, 1,333 have portable use at another chapter desk and 296 have both. All have a field use beyond the base. Thirty further historical displays still await exact-identity review. The ordinary-item and keepsake audit separately traced all **172** entries it checks to acquisition and a usable action elsewhere. [Specimen checks](../../tools/audit-specimens.mjs) · [Item-use checks](../../tools/audit-collectible-use.mjs)

The National Gallery of Art in Washington holds 1,020 of the 2,057 registered objects. A museum’s address cannot identify an object’s maker, people, place of creation or community’s permission to represent it. Reviews for a named community remain open where direct evidence is missing. The journal uses collection records and distinguishes an article about the exact object from a related maker, technique or type. The encyclopedia table has 40 exhibit-specific articles and 160 expressly related entries. A universal exact-article promise remains unverified. [Object sources](../SOURCES.md#encyclopedia-reading-after-encounters) · [Lesson-source review](DRIVE_WEAVE.md)

The reward registry has **125 awards**, comprising 116 badges, six skill milestones and three concept awards. Six purchasable Insight talents and 661 active skill records serve different purposes. The requested thousands of distinct awards and powers remain open. Personal choices retain equal permanent credit. Examples with visible costs include the two-address bakery, the tide-clock crew, and the three places where a caller can inspect Kip’s finding. [Awards](../../src/content/tokBadges.ts) · [Talents](../../src/domain/talents.ts) · [Authored character routes](../STORY_BIBLE.md)

### Accessibility, privacy and presentation

All 4,075 objectives offer all four hint depths, with 16,304 hint entries. Eighteen sets reuse an entire sequence across different objectives. Plain-language responses, redo controls, captions and keyboard operation need observation in the most demanding text and input conditions. The production game JavaScript on this checkpoint is about 8.98 MB before compression and 2.59 MB gzipped. Slow school Wi-Fi and low-memory phones are particularly valuable trial conditions. [Guidance evidence](../../tools/audit-learning-transfer.mjs) · [Browser and access checks](../BROWSER_CHECKS.md)

The diary supports session, week, specific dates and all-time views, combined with subject-matter filters. Typed notes, drafts, earned source links and reflections have distinct audiences. The twelve concepts have styled word boundaries, with first-person diary and export checks. Native editable fields, accessible previews, scene art, print and screen readers each need their own verification. The class dashboard distinguishes drafts from saved writing, the editor discloses its audience, photos stay on the device and portfolio sharing uses its own per-entry setting. A static local adventure and a fictional same-origin class service were exercised separately. The hosting plan still calls for an operational rollout. [Hosting](../ACCOUNTS_AND_HOSTING.md) · [Diary filters](../../src/domain/diarySelection.ts) · [Concept presentation](../../src/ui/conceptMarkup.ts)

### Stakeholder perspectives and playtest priorities

The choice index links all **12,790 selectable dialogue options** to room entrances. It includes **7,017 gated options, 8,314 placed interactions and 84 simulated review profiles**, including the requested stakeholder perspectives and twelve play preferences. The full matrix gives **1,772,736** profile-by-option or profile-by-placement inspections. It can be filtered down to a single action and persona and displays the strength, concern, suggested remedy and test. Its profiles represent testable perspectives. A community, learner, examiner or organisation must speak for itself. [Action and persona reader](CHOICE_REVIEW.md) · [Full profile descriptions](PERSONAS.md) · [Decisions where interests conflict](DECISIONS.md)

| Chapter | Missions | Options with an entrance | Physical placements | Missions flagged for a repeated comparison / handover structure |
| --- | --- | --- | --- | --- |
| 1 | 133 | 2,407 | 1,790 | 22 |
| 2 | 62 | 697 | 354 | 8 |
| 3 | 60 | 952 | 417 | 9 |
| 4 | 57 | 882 | 779 | 7 |
| 5 | 56 | 684 | 435 | 7 |
| 6 | 49 | 1,119 | 892 | 5 |
| 7 | 59 | 1,096 | 633 | 12 |
| 8 | 55 | 948 | 542 | 7 |
| 9 | 64 | 646 | 402 | 11 |
| 10 | 49 | 631 | 377 | 3 |
| 11 | 48 | 705 | 484 | 8 |
| 12 | 47 | 694 | 275 | 5 |
| 13 | 55 | 427 | 244 | 4 |
| 14 | 49 | 492 | 271 | 5 |
| 15 | 32 | 468 | 419 | 4 |

A choice available in several chapters appears in each applicable row. The total counts distinct options. Title-based screening flags the comparison-and-handover sequence in 117 missions and identifies explicit stakes in 705. A chapter can contain consequential choices without naming the stake in the mission record.

| Priority | Finding at this checkpoint | Concrete next test or repair |
| --- | --- | --- |
| Immediate • historical and scientific reasoning | At the East Well the keeper and guildmaster treat two matching drops as enough to attribute the change to the season. An equal change is compatible with several causes. | Preserve both readings, offer a test that could distinguish explanations and give the water-sharing decision its own consequences. A player should be able to support the smith without claiming to know what lowered the water. |
| High • cross-world learning | 586 micro-skills have no playable action link. Transfer and many chapter-level combinations remain open. | Start with a source-defined skill, put it in a different kind of action in two chapters, and verify what changes for each recipient. Add an independent reviewed proof for its curriculum and design intersection. |
| High • authorship and cultural authority | Current holdings are concentrated. Some books, folkways, religious accounts and oral histories have interpreters with competing obligations. | Identify the specific source, author and community for each scene. Obtain direct review for sensitive portrayals. A regional or generic persona cannot give that approval. |
| High • repeat play | The 250 guests recur, but shared instruments and return structures can make encounters predictable. | Watch an explorer and a social player revisit the same guest without prompts. Ask each to show what they found out on the second visit and whether the earlier decision mattered to someone. |
| High • access and class use | Three desktop engines can exercise a class scenario. Real mobile keyboards, assistive technologies, constrained storage and native PDF print controls introduce additional conditions. | Run signed-out, offline and class journeys on physical devices. Include keyboard-only, switch and screen-reader users. Confirm teacher disclosure and recovery with a fictional class before enrolling students. |
| High • assessment transfer | A successful in-game action can be a memorised routine. One hour of play has no measured exam effect here. | Invite learners to interpret a new object, compare two fields and revise a claim without game hints. Use independent reviewers and student consent for any evidence of learning. |
| Medium • different motivations | Published scores can encourage some students and deter others. A shorter hint can open a scene for one reader and disclose its mystery to another. | Test opt-in alias and withdrawal, optional streaks, on-demand hints, quiet exploration and the same consequential ending without a timer. Offer each pathway equal standing. |

### Follow-up to the well finding

The follow-up in the draft changes the two investigations, the notice, the sticks, the hints and the separate well event. The player can leave the cause open and still give the dawn kitchen or the late porters the covered jug. Both groups can be heard, and tomorrow’s turn can change. The follow-up is outside the counts for the original 9c2cb1f checkpoint. [Play and regression evidence](../BROWSER_CHECKS.md#the-covered-jug-at-the-east-well)

## Checks and reproduction

The production build succeeded and all 1,881 asset files passed licence, author and source checks. The option replay exercised all 12,790 choices and found zero incorrect destinations or state effects in its staged scenarios. The same-node label scan found no simultaneously selectable identically labelled choices among the fixtures it could construct. The 259 entries in the source-and-design ledger each describe a particular action. [Choice replay](../../tools/choice-rehearsal.mjs)

The focused content, reachability, chapter map, river, seal and two-reader tests passed all 179 tests. In the first full suite 2,902 of 2,907 tests passed. Five longer route tests reached their five-second limit while other audits and browser sweeps were running. The five belong to the ferry window, Cold Store field and folded-wing post. The complete suite and those specific files were scheduled again with the load and time allowance recorded separately.

Firefox and WebKit played different editions of the hatch story, heard both neighbours after the Nile packet, recovered their work and inspected the downloaded Word diary. The original browser harness assumed closing the workbench would leave the screen clear. It encountered the two neighbours actually waiting there. The revised journey explicitly reads both responses. The class-writing journeys on Firefox and WebKit verified the assigned teacher, rejection of access from another class, device-local photos and cross-device drafts. All three browser engines exercised the opt-in class board and withdrawal. Chromium recovered and exported the diary on a second device. Its first complete class test timed out while pointing at the Continue button in a later recovery. [Hatch journey](../../tools/hatch-sleeve-journey.mjs) · [Fictional class journey](../../tools/smoke-classroom.mjs)

In earlier pinned browser builds, Firefox completed all 250 guest routes over 15 stops each. At 04:00 UTC, Chromium had recorded 147 distinct completed guest routes and WebKit 97. Earlier one-hour wall-pressure runs recorded 24 verified world and engine cases by that time. These figures describe those builds. Physical devices, participant learning, and real community approval still require independent evidence.

Run these commands from a checkout of the audited revision with its locked dependencies. Individual browser journeys and the fictional class-service instructions are in the browser guide.

```sh
npm test
npm run build
npm run assets:check
node tools/audit-cross-weave.mjs --json
node tools/audit-micro-skills.mjs --json
node tools/audit-learning-transfer.mjs --json
node tools/audit-curriculum.mjs --json
node tools/audit-tok-floor.mjs --json
node tools/audit-specimens.mjs --release
npm run audit:collectibles
node tools/audit-choice-paths.mjs --mode exercise --errors-only
node tools/audit-choice-paths.mjs --mode matrix
node tools/audit-choice-paths.mjs --mode collisions
```

## Follow-up on the well and the pocket theatre

The original 2,907 checks subsequently passed in a single-worker run with a 60-second scenario allowance. A later full run at `f1cde61` passed 2,910 of 2,911 checks under the default five seconds. One uninterrupted 43-object ferry itinerary reached the time limit. Its two itineraries passed in isolation. The suite now gives that multi-object test an explicit twenty seconds. The intervening well build replayed 12,802 dialogue options with zero failed staged destinations or effects.

Efua's hearing rule supplies two playable word-history connections. The pocket theatre adds two original cases in each of the fifteen chapters. The stricter joint ledger distinguishes one curriculum element, a narrative element, a game element, a Bloom demand and a DOK demand supported by the same action. Commands, scope and interpretation appear in [the cognitive connections review](COGNITIVE_CONNECTIONS.md). The earlier checkpoint tables describe their original revision.
