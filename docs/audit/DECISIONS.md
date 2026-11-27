# Mika's decisions on the contested list

Mika answered the contested list on 27 November 2026. These decisions are rules for every developer, human or AI. They replace the recommendations in [CONTESTED.md](CONTESTED.md). Where a decision changes an older rule in [AGENTS.md](../../AGENTS.md), AGENTS.md now says so.

What was built, and why, is in [CHANGES.md](CHANGES.md).

Each item has the decision, then **How to build it**: notes that keep the decision inside the other project rules. A note is not a new decision. If a note seems to go against Mika's words, Mika's words win and you ask Mika.

| ID | Topic | Decision | Status |
| --- | --- | --- | --- |
| X-001 | Leaderboards and streaks | Keep. Each student can choose not to show on a leaderboard and to hide the streak. | done (streak can be hidden; leaderboard sharing is opt-in); hosted leaderboard later |
| X-002 | Exam practice | A "training gym" outside the story. No exam practice in the story. | done |
| X-003 | Timers | Optional timed replay of a field game after the first play. | done |
| X-004 | Romance | No romance. | rule |
| X-005 | Difficult real history | Include, as objects, testimony and serious play, with content notes and links to reliable sources. | started (content note before human remains in chapter 3; the study at Tuskegee in chapter 12) |
| X-006 | Indigenous knowledge | Include and weave through. Verify with reliable sources. | started (chapter 8: Marshall Islands stick charts) |
| X-007 | Failure states | Story consequences, trial sections that restart, and fail-and-retry in mini-games. | started (Proving Floor, Corvan's trust) |
| X-008 | Model answers | After a choice, two characters who disagree each give a strong reply. | done (59 moments, in every chapter) |
| X-009 | Translations | English only for now. | rule |
| X-010 | Volume | Keep all missions. No single main path that leads to a win. | rule |
| X-011 | Lumen when stuck | A setting, on by default. Lumen offers, the student clicks to hear it. | done |
| X-012 | Ethics and truth theories | Characters argue from each view and say its name. The journal names and tracks each view. Students meet the thinkers who held each view and get quests from them. | started (views, advisor call, journal tab; quests from Mozi and Ibn al-Haytham) |
| X-013 | "EE practice" in titles | In-world titles. EE shows only in the teacher map and the journal. | done |
| X-014 | Knotted ropes at the East Well | Change to notched tally sticks. | done |
| X-015 | Real philosophers | In dialogue and as people to meet. Lumen can call one as an advisor when the student is stuck. | started (13 thinkers as advisors; Mozi met in chapter 11, Ibn al-Haytham in chapter 4) |
| X-016 | Code licence | No licence, as now. | rule |
| X-017 | Credit lesson authors | A credits page names where each idea came from, without its wording. Everything is paraphrased and adapted to the world. | done |
| X-018 | Research data | Yes: real data shows what works. | done (off until the hosted build and school consent) |
| X-019 | Class "same seed" mode | No mode that suggests one correct path to a goal. | rule |

---

## X-001 Leaderboards and streaks

**Decision.** Keep leaderboards and streaks. A student can choose not to appear on a leaderboard. A student can choose to hide the streak.

**How to build it.**
- Leaderboards need the hosted build ([ACCOUNTS_AND_HOSTING.md](../ACCOUNTS_AND_HOSTING.md)). Show usernames only, never real names.
- Rank only play results: field-game scores, puzzles solved, objects found, Waystones reached. Never rank TOK judgements, because every reasoned judgement gets the same credit (OPEN-001).
- The two settings sit in the student's own settings and work at once.
- A missed streak never removes credit or items. It only resets the streak count.
- AGENTS.md rule 13 said "no public ranking of named students". It now says rankings use usernames and each student can opt out.

## X-002 Training gym

**Decision.** A "training gym" where students can see example exams, practise exhibition skills with the objects they found, and use flashcards. No exam practice in the story outside the gym.

**How to build it.**
- The gym is a place the student chooses to visit. It is not part of the storyline, and the story never sends the student there.
- The "nothing may feel like flashcards or an exam" rule still holds everywhere else. Inside the gym, flashcards and exam-style tasks are allowed.
- Example exams and prompts must be original. Do not copy IB papers, prescribed titles, exhibition prompts or examiner wording (the repository is public and these are IB copyright).
- Exhibition practice uses the student's own found objects, so the gym rewards exploring.
- Gym work stays private to the student unless they share it (portfolio rule 14).

## X-003 Timers

**Decision.** A field game can be replayed with a timer, only after the student has played it once without one.

**How to build it.** The timed replay is a separate button. It never gives more permanent credit than the untimed game. It can feed the leaderboard (X-001).

## X-004 Romance

**Decision.** No romance. Friendships only. This was already a rule.

## X-005 Difficult real history

**Decision.** Include hard cases. Avoiding them is itself a choice, and suggests that they did not happen or do not matter. Include them as objects and testimony with content notes, and as part of the game in respectful, serious play, with links to reliable sources.

**How to build it.**
- Each case gets a content note before it starts (C-014) and a way to step out.
- The play is serious: weighing testimony, tracing a record, hearing people who were there. Never comic, never a race, never a score for suffering, never a timer.
- Each case links to reliable sources (museums, archives, scholarly histories) in its `sources` records, with `historicalLabel` set correctly.
- Victims and survivors speak through documented testimony where it exists. Invented lines are labelled.
- Topics from the lesson folder: the Nanking massacre, slavery and Nat Turner's revolt, the Lewis and Clark expedition and the Blackfeet, Columbus. Plan them one at a time.

## X-006 Indigenous knowledge

**Decision.** Do not leave it out. Verify with reliable sources. Weave it through the game, and present each Indigenous culture, value and belief as valuable and with respect.

**How to build it.**
- Each people is separate. Never group peoples by continent or region.
- Use the people's own names for themselves and their places (rule 17).
- Prefer sources made by the people themselves: their nations, councils, museums and cultural centres. Follow published principles such as the CARE principles for Indigenous data governance.
- Do not invent sacred knowledge, ceremonies or stories for a real people. Show what the people have chosen to share in public.
- Present their knowledge as knowledge, with its own methods. It is not only a "perspective" to compare with science.
- Review by people from the community is still welcome when possible. It is no longer a gate that keeps the content out.

## X-007 Failure states

**Decision.** Three kinds of failure:
1. Consequences that change the story, for example a person stops trusting the player for a while.
2. Trial sections where a "fail" restarts the section or level.
3. Fail and retry in mini-games.

**How to build it.**
- Failure comes from play (a wrong step, a trap, a missed timing, a broken chain of evidence). A reasoned TOK judgement is never a failure (OPEN-001).
- A restart never removes permanent credit, items or saves.
- Trial sections are original designs. Do not copy level designs from any existing game.
- Lost trust comes back through the story, never by paying.

## X-008 Replies after a choice

**Decision.** After a choice, show two strong replies from characters who disagree with each other.

**How to build it.** The two replies give reasons from different views. Neither is marked as the better one.

## X-009 Translations

**Decision.** English only for now. Keep text in content files, not in code, so translation stays possible later.

## X-010 Volume and pathways

**Decision.** Keep all missions. Students choose which pathway to follow. There is no single right path, and no main path that leads to a win.

**How to build it.** The planned "main-story badge" (C-010) is dropped. C-010 now means good stopping points and a journal that shows pathways, not one main line. Large case rooms keep all their cases.

## X-011 Lumen when the student is stuck

**Decision.** A setting, on by default. Lumen does not speak until the student clicks or interacts.

**How to build it.** After a pause, the lantern button glows or Lumen gives a small sign. The hint shows only after the student clicks. The setting can turn the sign off.

## X-012 Ethics and truth theories

**Decision.** Characters argue from each view and say its name. The journal names each view and tracks which ones the student has met. Students learn each view by meeting the people in history who held it, and each person gives a quest or task. Mika's examples: Aristotle and Bertrand Russell for the correspondence theory of truth; Spinoza and Hegel for the coherence theory.

**How to build it.**
- Cover ethics views (virtue, duty, consequences and others) and theories of truth (correspondence, coherence, pragmatic and others).
- Include thinkers from many traditions, not only European ones, in line with the rule on many peoples and periods.
- What a thinker says must match their documented views, with a source. Invented lines get the right `historicalLabel`.
- The quest is play (a task in the world), not a lecture.

## X-013 EE practice titles

**Decision.** In-world titles. EE shows only in the teacher map and the journal.

**Done.** Mission titles are now "The Inventor's Share" and "Who Holds the Pen?". Board titles are "Tull's claim board" and "Keeper Oduya's table". The map labels no longer say "EE practice". Portfolio entries (the journal) keep "EE practice:".

## X-014 East Well depth marks

**Decision.** Change the knotted ropes to notched tally sticks.

**Done.** Each well has a notched depth stick with a notch for every hand of depth. Lumen's "tally" entry has a new example for the east well.

## X-015 Real philosophers

**Decision.** Real philosophers appear in dialogue and as people the student meets. Lumen can call one as an "advisor" when the student is stuck.

**How to build it.** All lines are written in advance (no runtime AI). An advisor gives a hint in the thinker's own way of thinking, at Lumen's four hint depths. See also X-012.

## X-016 Code licence

**Decision (27 November 2026).** No licence, as now. Do not add a LICENSE file or a licence field for the code. Use stays classroom only, not commercial. Assets keep their own licences in CREDITS.md.

## X-017 Credits for lesson ideas

**Decision.** A credits page names the source of each idea, without its wording. Everything is paraphrased and adapted to fit the world.

**How to build it.** Add a section to [CREDITS.md](../../CREDITS.md) and an in-game credits page. Name the idea and its source (author or publication) when known. Never quote the handout.

## X-018 Research data

**Decision.** Collect real data to see what works.

**How to build it.**
- This changes the old promise of "no network calls". Data goes only to the project's own hosted server ([ACCOUNTS_AND_HOSTING.md](../ACCOUNTS_AND_HOSTING.md)), never to a third-party analytics service.
- Collect the least data that answers a question: play events (mission started, finished, hints used, time in a field game). Never free text, never names.
- Tell schools and families what is collected, in the "at a glance" pack (C-007). Schools turn it on for their classes.
- The offline build still works with no network.

## X-019 Class mode

**Decision.** There must not be a single correct pathway to a goal. No "same seed" class mode that suggests one.
