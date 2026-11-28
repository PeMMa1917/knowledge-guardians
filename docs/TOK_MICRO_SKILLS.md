# Micro-skills in the campaign

[Look up each skill’s linked chapters and documented cognitive cells](audit/SKILL_REVIEW_INDEX.md).

All 1,200 supplied numbers have public descriptions in the [member index](audit/COMBINATION_MEMBERS.md#family-micro). To review a skill, find it in the [combination checklist](audit/COMBINATION_CHECKLIST.html), choose its chapter and add the relevant story, game and TOK elements. Each combination has an independent cell for every Bloom level at every DOK. The current campaign links 619 micro-skills to an objective. A reviewer can still track any of the other 581 while investigating or designing a new encounter.

Look up one or more numbered micro-skills together with story elements, mechanics, reasoning patterns and questions. [Combination atlas](audit/COMBINATION_ATLAS.md)

The ferry stories link the sampling hour, a leading word, permission to quote, a repeated sound and a musical rest to decisions at two different stops. The current ledger records 1,375 uses across 602 of 1,200 supplied skills. Of these, 376 have an evidenced use in more than one world. [Ferry practice records](../src/content/skillPractice/ferry-radio.json)

Della lets the Guardian weigh both trays before and after leaving one loaf at a door. That action develops skill 1087 in a situation where counting alone could leave a family out. Hana’s dated correction has to allow for a failure somebody might see tomorrow (90). At rehearsal a repeatable moth trial and an understudy’s open cue give the same Guardian two reasons to try again (1106). [Actions and their evidence](../src/content/microSkillsPerches.json)

The travelling orchard gives a literal translation and a three-beat translation to the same actor. She can catch a different fruit or change the timing. The drummer hears a shared rest both as a fixed count and as a wait for an answer. Fen’s stylus also lets the Guardian adjust the hand pressure that hides or reveals the hollow between two carved bumps. These actions supply evidence for skills 608, 741, 855 and 1110. [Orchard encounters](../src/content/microSkillsOrchard.json)

The complete first spreadsheet and the five subsequent 200-row blocks supply 1,200 numbered definitions. The latest file contributes rows 1001–1200 in ten domains, including research verification, conceptual pairings, epistemic traditions, risk, quantitative reasoning, disciplinary vocabulary, debates within subjects, writing craft, transfer and final review. The catalogue uses original wording. The source’s assessment advice describes a resource for adaptation. The game awards practice only for a specific action. [Newest source inventory](../src/content/research-practice-catalog.json)

The campaign records a use when a player completes a linked action. For example, the Nile player turns a sketch after standing at both entrances. A later understudy uses a rehearsal cue from the bench. Both encounters make a specialised mark usable in another situation. The optional Skill Atlas lists the encounters the player has met. The normal sets of marks, quests and story choices remain separate from the skill record. [Evidence links](../src/content/microSkillEvidence.ts)

In Emberford an unsteady edge on the old door notch and an unsteady edge on the measuring line can pull in different directions. Players open both margins to discover how matching centres can hide a small change. The rain gauge transfers the same practice to a catch and a reference ring. The edition at the Lamp Wall retains the range the player actually sent. [Skill 621 at two field stations](../tests/maker-field.test.ts)

The current audit identifies **1,296 skill-to-action links** for **589 of 1,200 skills**. A single action can develop several skills. For 356 skills there is evidence in multiple worlds. 1,213 world, learning-dimension and RPG-element combinations have one to nine independently reviewed actions. Two reach ten. Reusing a guest’s instrument across chapters adds a chance to practice without multiplying the authored action count. A further 611 skills need observable play. [Action inventory](../src/content/microSkillEvidence.ts) · [World evidence](CROSS_WEAVE_AUDIT.md)

The river case starts with finding sleeve W–17 and can end with the Guardian designing a further hearing across five chapters. Across the campaign, linked objectives span Webb 1–4, all six Bloom levels and all six Fink dimensions. The SOLO stages in these links are unistructural, multistructural, relational and extended abstract. The audit checked 247 combinations of the eight learning and play dimensions. It found 1,063 links with entries for all eight. A count describes opportunities on specific actions. Student depth and transfer need an independent task. [Flood-bell actions](../src/content/microSkillsLastBell.json) · [Night Register actions](../tests/night-register.test.ts) · [Audit command](../tools/audit-micro-skills.mjs)

The folding flock links the chapter 8 pencil lesson to the scope of a programme in chapter 9. Replacing a generic shadow with an identified canoe requires the visitor to try the spare cutout and expose a view with an actual date and place or dated voyage roles. [Source and projection checks](../tests/folding-flock.test.ts)

## Play preferences

Players can shift among these motives. The examples describe approaches a route offers and help authors check whether it leaves another approach open.

| Model | Motives and their campaign expressions |
| --- | --- |
| Bartle | The Planner targets a lead. The Opportunist finds a side use. The Scientist controls a comparison. The Hacker tests an assumption or tries a surprising route. The Networker asks people with different roles. The Friend stays with a companion. The Politician challenges who controls a decision. The Griefer’s appetite for disruption can be exercised by testing a flawed rule in a fictional setting where the keeper can repair it. |
| HEXAD | Philanthropists help a reader or crew. Socialisers exchange perspectives. Free Spirits follow optional routes. Achievers seek a proof or title. Players use an earned item or unlock. Disruptors expose an assumption and change a shared rule. |
| Player Head Model | Entertainers shape a performance. Strategic players plan a use. Leaders divide work. Testers rerun a case. Artistic players edit an arrangement. Researchers follow records. Socializers work alongside a character. |
| Temperament-based play styles | Artisan routes offer making and movement. Guardian routes protect a person or a record. Rational routes compare rules and models. Idealist routes invite a judgment about what a keeper owes others. |

The evidence links record opportunities to see, navigate, hear, read, write, operate, interpret language, reason through data, interact, reflect privately and observe environments. Combinations such as listening with a written record or reading a route while walking are supported in the same action when that action actually offers both.

## Checking combinations

`node tools/audit-micro-skills.mjs` reports the current linked skill and action counts. Use `--json` for the full list by objective, region, and grouping. The audit checks the 247 groupings of two to eight dimensions. It draws combinations only from fields attached to the same use. Several configurations can describe one action, so the action count stays separate.

- Each use points to an actual quest objective, an original description of the player’s action, the motives and modes it offers, and relevant numbered game and story examples.
- The audit reads Webb, Bloom, Fink and SOLO tags from that objective. An unknown thinking level leaves the related combinations open.
- Different actions in different settings provide opportunities for transfer. Neither a journal entry nor an author count measures how well a student transfers a skill.
- Keep authored works, editable copies, assumptions and what a reader can do distinct. Add the smallest verifiable action that gives a player a missing way to practise. [Content guide](CONTENT_GUIDE.md) · [Playtest priorities](PLAYTEST_PRIORITIES.md)

`node tools/audit-learning-transfer.mjs` checks the hint stages, attainable author-linked ranks, and same-objective subject and skill intersections for DP Groups 1–6. Add `--json` for the individual entries. The current audit found 14,800 hint entries across 3,699 objectives. Each objective has four distinct layers, including 10 sets that recur across different objectives. For 409 linked skills the highest attainable stage is Seen. Another 136 can reach Practised, and six can reach Confident. Matching a claim to its exact object can reach Confident through eight distinct uses across six worlds. An engine playthrough earns all eight on one save with earlier chapter access staged. The Transferred stage remains open. [Eight object-specific uses](../tests/object-specific-skill.test.ts) Two Calls After Tuesday links #985 to a DOK 4 objective where the player leaves a dated revision trail and a separate reader receipt. The Market and Water Commons link #350 and #887 around a count that can travel only with its conditions.

The Nile pin test connects #260 to a failed fit that limits a claim, #411 to the visible cause of that fit and #919 to the shared reference. It awards #79 after a reader actually uses the installed guide. Emberford’s bank proof applies separate route and load limits to #332 and #887. The Nexus citation rail and the Nile packet dates extend #399 and #529 through hands-on source checking. [Nile pins](../tests/nile-entry-pins.test.ts) · [Citation rail](../tests/citation-rail.test.ts) · [Bridge proof](../tests/bridge-proof.test.ts)

The Night Map and Second Delivery now list their eligible receiving steps in Water Commons. Loading an older record moves four affected Skill Atlas uses to Water Commons, with duplicates collapsed and the earlier Civic comparison kept under Civic. The tests cover an older Recovery slot, past awards and the next available hint. [Delivery recovery tests](../tests/delivery-attribution.test.ts)

The First Bell records #78 when a reader uses the Cold Store access notice. The player has already compared a measured gate with a pair of dated accounts from the same bell. The Copy That Came Back records #317 after the player follows a second notice back to its own source and checks an independent witness’s limited view. [First Bell](../tests/clear-bay.test.ts) · [Copy trail](../tests/circular-report.test.ts)

The 27 November folded-wing cases add 140 authored action links. The earlier audit found 797 links for 359 distinct skills among 803 definitions supplied. Of those, 243 skills have links in more than one world. Seven newly evidenced definitions involve such practices as reconstructing a constructive argument or noticing what a filing system displaced. A partner's presence on a watermark alone does not establish practice. [Delivery evidence](../src/content/microSkillEvidence.ts) · [Working encounters](../src/content/ink-post-letters.json)

The lantern and night-watch update first recorded 1,099 authored action links for 485 distinct skills, including 47 from the new block. At that checkpoint, 300 skills had evidence in multiple worlds and 715 were open. The two settings of Maro’s clip exercise threshold sensitivity and asymmetric costs. Counting the same four reply lamps against the full six-household rota exercises a change of denominator. Both decisions affect the next person’s job. [Newly mapped actions](../src/content/microSkillsNightWatch.json) · [Playable rules](../src/domain/watchBell.ts)

### Checking an image and checking a memory

At each chapter register a loose image carries a drawer position and an accession on its mount. Trace it to the case, see the original caption and decide how the next reader can find it. This is practice 1003. After a delivery, the receiving keeper's recollection, the sealed copy and the latest home account can disagree. Read all three to complete practice 1115. Each of these skills has a separate playable objective in every chapter. [Evidence records](../src/content/microSkillsNightRegister.json) · [Save and replay checks](../tests/night-register.test.ts)


### Borrowing another keeper's instrument

Pull two impressions with one fitting held still. At Ostel's table the five waits are 9, 9, 10, 11 and 21 minutes. Both the mean and median can be checked against those waits. Moving the start of the ruler changes the apparent jump on the chart. It leaves all five waits intact. Send an impression to the flood gate and test another fitting there. The first inscription stays available for comparison.

The fifteen coats add 84 actionable links for 42 previously unlinked skills. Nine reviewed contrasts give examples of all six reasoning forms. The source and receiving objectives also use the existing 35 exhibition question families in different combinations. Repeated impressions in one setting have no effect on the permanent use count. [Evidence links](../src/content/microSkillsCoat.json) · [Playable trials](../tests/pocket-coat.test.ts)


The mill earns four distinct practices. Holding the punch strip fixed across four rigs separates changes that suffice from changes that work only together (93). Putting a person and a guild rule in different leads tests accounts of intention and structure (293). Publishing yesterday’s missed possibility and tomorrow’s open one gives both verb forms a reader (689). An old wheel with an extra worker distinguishes two estimates that fit all four dated tickets (1127). Only a run, comparison or delivered edition earns the associated use. [Skill actions](../src/content/microSkillsMill.json) · [Behavior checks](../tests/mill-shift.test.ts)

### Five travelling instruments

Bela’s catalogue forces the player to try different claims on one pen. Lio pulls the departure cord and the music cord at different moments. Tamar keeps a missing price visible on a tally with two rows. Ren releases three numbered tickets at a time and tests another packet. Teodora can preserve a lost line by leaving a beat for someone else to sing. Each receiver gets the actual edition that travelled. Eight additional links bring the register to 1,304 uses for 589 distinct supplied skills. A further 611 still await reachable evidence. [Skill links](../src/content/origin-tour-skill-uses.json) · [Instruments](../src/domain/originInstruments.ts)
