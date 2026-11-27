# Changes from the audit, and why

This file lists each change that the multi-persona audit caused: what changed, why it changed, and where it is in the code. Read it with [DECISIONS.md](DECISIONS.md) (Mika's decisions) and [CONSENSUS.md](CONSENSUS.md) (fixes that all personas accept).

Each entry gives the source of the change: a consensus fix (`C-###`) or one of Mika's decisions (`X-###`).

Contents: [Stage 1: chapter 1 fixes](#stage-1-chapter-1-fixes-26-november-2026) · [Stage 2: Mika's decisions](#stage-2-mikas-decisions-27-november-2026) · [Not done yet](#not-done-yet)

---

## Stage 1: chapter 1 fixes (26 November 2026)

### Step titles name objects, not numbers (C-003)
- **What changed:** 405 step titles named a museum object only by its accession number, for example "Fit a repeatable view beside 2005.100.494.13." They now use the object's title in quotation marks.
- **Why:** every persona agreed that a number reads like a database, not a world. EAL students (A4), students with dyslexia (I2) and learning support (I3) found the titles hard to read.
- **Where:** the title templates in 17 generators in `src/content/*.ts` (for example `lanternWeave.ts`, `fieldStore.ts`, `referenceLine.ts`).

### Plain words in the hardest chapter 1 titles (C-003)
- **What changed:** four step titles now use plain words. For example, "Give the lamp carriers an arrangement and visit the handover that actually follows" is now "Choose how Iven's lamp crate is called for, then follow the crate to see who gets it."
- **Why:** these titles had the most long and abstract words in chapter 1 ([EVIDENCE.md](EVIDENCE.md)).
- **Where:** `door-fold.json`, `nexus-reading-rests.json`, `pigment-window.json`.

### Eight work words in Lumen's glossary (C-002)
- **What changed:** slip, docket, tally, ledger, custody, testimony, attribution and accession now have glossary entries, each with a word history and examples the player earns.
- **Why:** dialogue uses "slip" more than 1,000 times, but the game never explained it. Linguists (J3) and EAL students (A4) asked for the meaning in the world.
- **Where:** `src/content/glossary.json`.

### Lumen's first line (C-026)
- **What changed:** "I will not give you the 'right' opinion. I don't have one." is now "I can help you check facts. Judgements are yours, and I will not make one for you."
- **Why:** philosophers (D2) and examiners (C3) said the old line could teach that every question is only opinion. Some claims are facts that can be checked.
- **Where:** `src/content/m01-nexus.json`.

### EE practice step titles in world words (C-027)
- **What changed:** 14 step titles no longer start with "EE practice:". For example: "Open the Title Lock in the east wing: give Archivist Tull a question narrow enough to answer and open enough to argue."
- **Why:** Mika's rule says nothing may feel like homework. The EE tag stays in the weave data, so teachers still see it.
- **Where:** `src/content/ee-trails.json`.

---

## Stage 2: Mika's decisions (27 November 2026)

### EE missions have in-world names (X-013)
- **What changed:** "EE practice trail: The Inventor's Share" is now "The Inventor's Share", and the other trail is "Who Holds the Pen?". The boards are "Tull's claim board" and "Keeper Oduya's table". Map labels no longer say "EE practice". Portfolio entries in the journal keep the EE label.
- **Why:** Mika decided that EE shows only in the teacher map and the journal.
- **Where:** `ee-trails.json`, `src/maps/nexus.ts`, `src/maps/emberford.ts`.

### Notched tally sticks at the East Well (X-014)
- **What changed:** the knotted ropes at the two wells are now notched depth sticks, with a notch for every hand of depth. Lumen's "tally" entry has a new example for the east well.
- **Why:** knotted records could remind players of the khipu of the Andes, a real people's record system. Mika chose another record form.
- **Where:** `side-quests.json`, `common.json`, `src/maps/emberford.ts`, `glossary.json`.

### Lumen offers help when the player seems stuck (X-011)
- **What changed:** after three minutes with no progress, the Hint button glows and Lumen says it has an idea. The hint shows only when the player clicks Hint or presses the hint key. A new setting turns this off. It is on by default.
- **Why:** Mika decided "on by default, but requires a click". Learning support (I3) wanted help to come sooner, and puzzle players (G8) did not want it to spoil a puzzle. The click keeps both.
- **Where:** `src/domain/lumenOffer.ts`, `src/app/settings.ts` (`lumenOffers`), `src/ui/ui.ts` (`checkHelpOffer`). Test: `tests/lumen-offer.test.ts`.

### Timed replay of a field game (X-003)
- **What changed:** after a player finishes a field game once, a "Timed replay" button starts it again with a clock. The clock counts up. There is no time limit and no fail. The best time is kept.
- **Why:** Mika decided "an optional timed replay after it is done once". Competitive players (G4) and speedrunners (G9) get a challenge. Students who find timers stressful (I2) never meet one unless they choose it.
- **Where:** `src/domain/timedReplay.ts`, `src/ui/ui.ts` (`startTimedReplay`, `finishField`). Test: `tests/timed-replay.test.ts`.

### The streak can be hidden (X-001)
- **What changed:** a new setting, "Show my day streak in the Ledger", hides the streak. The streak is still kept. The leaderboard was already opt-in: a student shares a score file only when they choose, under an alias, and can withdraw it.
- **Why:** Mika decided to keep leaderboards and streaks, with options to not appear and to hide the streak.
- **Where:** `src/app/settings.ts` (`showStreak`), the Ledger in `src/ui/ui.ts`. The leaderboard rules are in `src/domain/leaderboard.ts`.

### Credits for the ideas behind the games (X-017)
- **What changed:** the in-game credits and CREDITS.md now list where each game idea came from. For example, Dov's Three Doors credits Mika's lesson folder and the Monty Hall problem (Steve Selvin, 1975; Marilyn vos Savant, 1990). No lesson wording is quoted.
- **Why:** Mika decided to credit idea sources without their wording.
- **Where:** `src/domain/ideaCredits.ts`, CREDITS.md ("Ideas behind the games"). Test: `tests/idea-credits.test.ts` checks that every field game is credited.

### The training gym (X-002)
- **What changed:** a new "Training gym (practice)" button in the menu opens a practice room outside the story. It has three rooms:
  1. **Word cards:** flashcards made from Lumen's glossary, with a simple order that shows cards the student is still learning first.
  2. **Exhibition bench:** the student picks a practice prompt, places three objects they found in the game, and notes what each object shows and what it does not show.
  3. **Practice titles:** essay-style questions for planning a claim, a counterclaim and examples.
- **Why:** Mika decided on a gym for exam-style practice and flashcards, with no exam practice in the story. The prompts are original to this project. They are not IB titles or exhibition prompts, which are IB copyright.
- **Privacy:** gym work stays on the device (`kg.gym`). It gives no XP and never goes to a teacher.
- **Where:** `src/domain/gym.ts`, `src/ui/gymPanel.ts`. Test: `tests/gym.test.ts`.

### Two replies after a key choice (X-008)
- **What changed:** after 8 key moments in chapter 1, two characters who disagree each give a strong reply. Examples: after the new label (Dace and Venn), after the test billet (Hesper and Corvan), after each Corvan sign outcome (Orrin and Hesper or Corvan), after the well plan (Efua and Hesper), after the archive slip (Bela and Dace) and after the rumour (Idris and Hana). Neither reply is marked as better.
- **Why:** Mika decided on two strong replies, not one model answer. This keeps the rule that there is no hidden right answer (OPEN-001).
- **Where:** `src/content/two-replies.json`, `src/domain/twoReplies.ts`, `src/ui/ui.ts` (`showTwoReplies`). Test: `tests/two-replies.test.ts`.

### Thinkers and named views (X-012, X-015)
- **What changed:**
  - There are 8 named views: three of truth (correspondence, coherence, pragmatic) and five of ethics (virtue, duty, consequences, care, ubuntu).
  - There are 12 thinkers who held these views: Aristotle, Bertrand Russell, Baruch Spinoza, Hegel, William James, Charles Sanders Peirce, Mozi, Kongzi (Confucius), Immanuel Kant, John Stuart Mill, Nel Noddings and Desmond Tutu.
  - In Lumen's hint panel, "Ask a thinker" lets the student hear how a thinker would look at the step.
  - A new "Views" journal tab tracks each view the student has met, with the thinker's life, place, a summary and a source.
- **Why:** Mika decided that characters say the names of views, that the journal tracks them, and that real philosophers appear and can be called as advisors.
- **Care:** each summary matches the thinker's documented views and cites a source. Advisor lines are labelled "Imagined advice", so nobody takes them for quotations. The thinkers come from more than one tradition.
- **Where:** `src/content/thinkers.json`, `src/domain/thinkers.ts`, `src/ui/ui.ts` (`thinkerAdvisor`, the `views` journal tab). Test: `tests/thinkers.test.ts`.

### The Proving Floor: a trial that restarts (X-007)
- **What changed:** a new field game under Emberford's bell tower. Each span shows three example tiles that follow a hidden rule. The player crosses four rows. A tile that breaks the rule cracks, and the span starts again with a new floor. In the last span, two rules fit the examples, so only a new tile shows which rule the floor follows.
- **Why:** Mika decided on trial sections where a fail restarts the section. The failure comes from play. It is never a judgement about a TOK question, and a restart removes nothing. The TOK idea is induction.
- **Where:** `src/domain/provingFloor.ts`, `src/ui/ui.ts` (`openProving`), the map prop in `src/maps/emberford.ts`. Test: `tests/proving-floor.test.ts`.

### Trust that is lost and won back (X-007)
- **What changed:** conditions can now check how much a character trusts the player (`{ "trust": "<character>", "lte": -1 }`). If the player exposed Corvan in front of the crowd, a new option lets the player offer to help him write a true sign. This wins back his trust once.
- **Why:** Mika decided that a person can stop trusting the player for a while. Lost trust now changes the story and can come back through the story.
- **Where:** `src/domain/types.ts`, `src/domain/rules.ts`, `src/domain/validate.ts`, the `corvan.mend` scene in `m02-aethelgard.json`. Test: `tests/trust.test.ts`.

### Research data (X-018)
- **What changed:** the game can record play events: steps done, hints asked, field games finished, timed replay times and trial cracks. It records nothing unless two conditions are both true. First, the build names the project's own https server. Second, the school has given consent for its classes.
- **Why:** Mika decided that real data shows what works. Data security (B10) and families (B8) need children's data kept safe.
- **Safety rules:**
  - Play events only: never names, free text or journal writing.
  - Day only, not the time of day.
  - The project's own server only, never an outside analytics service.
  - The default build stays offline and makes no network call.
- **Where:** `src/domain/research.ts`, `src/app/research.ts`. Test: `tests/research.test.ts`.

### Rules for developers (all decisions)
- **What changed:** AGENTS.md has a new owner rule that sums up the decisions and points to DECISIONS.md. The teacher-view rule now says how leaderboards work.
- **Why:** many developers, human and AI, work on this project. The decisions must be where everyone reads first.

---

## Stage 3: the second lesson folder (27 November 2026)

### The Copyists' Ladder, chapter 2's first game (C-004)

**What.** Nasir's copy desk in the Royal Records Room has a word ladder. The player turns "ship" into "dock", one letter at a time, with a real word on every rung. Then the player tests three patterns across four ladders. One pattern breaks on the table. One fits all four ladders, then breaks on an old sheet from Nasir's drawer. The last one holds, and the player builds a proof "arch" from the three rules that make it true for every ladder. A loose stone (such as "Nasir has never seen one without it") or a missing stone makes the arch slip, and the player tries again. Last, the player says what the proof covers. The proof shows that some word has two vowels. It does not show that they sit in the middle, so that part is still a guess. Marek and Nasir then give two replies (X-008).

**Why.** Chapter 2 had no game of its own (CH02). Mika's second folder has a lesson that uses a word ladder to show why mathematics can reach certainty. The game turns it into play and adds the scope step, so the player also sees the limit of a proof. A test checks the proof by search: no ladder of one-vowel words reaches "dock".

**Where.** `src/domain/wordLadder.ts`, `src/content/word-ladder.json`, `src/ui/ladderPanel.ts`, `src/maps/nile.ts`, `tests/word-ladder.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The second folder in the weave plan

**What.** [DRIVE_WEAVE.md](DRIVE_WEAVE.md) has a new section with 14 ideas from the second folder and a chapter for each. Examples: the Three Trees (is a shape found or chosen), the Pattern Book (consent and credit for a people's designs), the Survey Bell (ethics of research with people), the Primer Page (choosing a picture for a history book), and Tupaia's chart.

**Why.** Mika asked to weave the new material in the same way as the first folder: paraphrased, adapted into play, and never quiz-like.

### Chapter 3: content note, plain titles and replies (C-014, C-003, X-008)

**What.** The first time the player enters the royal or the Chinchorro records room, a short note says the room holds records about human remains. It links two sources and has a "Step back to the Cold Store" button. Stepping back costs nothing. The two-rail gallery titles no longer show accession numbers. Three two-reply moments follow the choice of how to open the display.

**Why.** Mika's decision X-005 asks for content notes and a way to step out before hard real history. The audit of chapter 3 ([CH03.md](chapters/CH03.md)) found no note and five titles with accession numbers.

**Where.** `src/content/content-notes.json`, `src/domain/contentNotes.ts`, `showContentNote` in `src/ui/ui.ts`, the scene hook in `src/scenes/WorldScene.ts`, `src/content/clearanceCases.ts`, `src/content/two-replies.json`, `tests/content-notes.test.ts`, `tests/audit-rules.test.ts`.

### Chapter 4: replies and plain titles (X-008, C-003)

**What.** Neri and Ruan now disagree after the two choices in "The Next Bell": how to carry the forecast's limit, and how to send the notice. The twelve bearing-room titles use plain words.

**Why.** The chapter 4 audit ([CH04.md](chapters/CH04.md)) found that the two keepers never disagree, and that the bearing titles were long and abstract.

**Where.** `src/content/two-replies.json`, `src/content/bearingBay.ts`.

### Chapter 5: replies, and object names without catalogue numbers (X-008, C-003)

**What.** Elian and Ayla now disagree after the layout of the crews' notes and after the choice of how to send visitors. Twelve object names in the forest, the reference line, the field store and the correspondence room lost their catalogue numbers (for example "Turtle Bell, Met 1977.187.26" is now "Turtle Bell"). The number stays in each object's source record.

**Why.** The chapter 5 audit ([CH05.md](chapters/CH05.md)) found the numbers in step titles, which C-003 rules out. The audit test now catches a number inside a quoted name.

**Where.** `src/content/two-replies.json`, `fern-records.json`, `reference-line-specimens.json`, `field-store-specimens.json`, `correspondence-specimens.json`, `tests/audit-rules.test.ts`.

### Chapter 6: replies and plain titles (X-008, C-003)

**What.** Corra and Bea now disagree after the layout of the balance readings and after the choice of where buyers see the evidence. The 40 jig-shop steps say "Check that a holder fits …" instead of "Verify a support for …".

**Why.** The chapter 6 audit ([CH06.md](chapters/CH06.md)).

**Where.** `src/content/two-replies.json`, `src/content/jigShop.ts`, `src/content/reference-line-specimens.json`.

### Chapter 7: replies and in-world titles (X-008, X-013)

**What.** Lark and Mina now disagree after the choice of sheet order and after the choice of reprint or strips. Three missions named after catalogue entries have in-world titles: "The Question on the Bone", "The Second Volume of Jikji" and "‘Umar’s Plates". The object cards keep the catalogue names.

**Why.** The chapter 7 audit ([CH07.md](chapters/CH07.md)).

**Where.** `src/content/two-replies.json`, `src/content/reference-proofs.json`.

### Chapter 8: replies (X-008)

**What.** Renna and Sora now disagree after the choice of which place names go first and after the choice of which chart takes the front of the display.

**Why.** The chapter 8 audit ([CH08.md](chapters/CH08.md)).

**Where.** `src/content/two-replies.json`.

### Chapter 9: replies (X-008)

**What.** Edda and Hari now disagree after the cue order (silence or move first) and after the choice of which seat view goes beside the cast plan.

**Why.** The chapter 9 audit ([CH09.md](chapters/CH09.md)).

**Where.** `src/content/two-replies.json`.

### Chapter 10: replies (X-008)

**What.** Tellen and Dagny now disagree after the layout of the basket readings and after the whole-lot quote rule.

**Why.** The chapter 10 audit ([CH10.md](chapters/CH10.md)).

**Where.** `src/content/two-replies.json`.

### Chapter 11: replies with named views (X-008, X-012)

**What.** After the drought choice, Omi argues from consequences and Sena from duty, and each names the view.

**Why.** The chapter 11 audit ([CH11.md](chapters/CH11.md)), and Mika's decision that characters argue from each view and say its name.

**Where.** `src/content/two-replies.json`.

### Chapter 12: replies (X-008)

**What.** Ade and Lin now disagree after the mobile-library window rule (follow the count, reserve a window in each district, or split evenly).

**Why.** The chapter 12 audit ([CH12.md](chapters/CH12.md)).

**Where.** `src/content/two-replies.json`.

### Chapter 13: replies (X-008)

**What.** Wren and Eren now disagree after the sign wording on the walk and after the choice of where the approved excerpt goes.

**Why.** The chapter 13 audit ([CH13.md](chapters/CH13.md)).

**Where.** `src/content/two-replies.json`.

### Chapters 14 and 15: replies (X-008)

**What.** Ivo and Joss now disagree after the route choice for the eight crates. Hale and Essi disagree after the choice between a rail comparison every shift and a dated repair record.

**Why.** The audits of chapters 14 and 15 ([CH14.md](chapters/CH14.md), [CH15.md](chapters/CH15.md)). Every chapter now has two-reply moments.

**Where.** `src/content/two-replies.json`.

### The Three Trees, chapter 5's signature game (C-004)

**What.** At the old grove on the Listening Trail, Elian asks the player to show "the triangle everyone sees". Three trees in a straight line are refused: the grove pushes back. Then Ayla shows her family's triangle and Elian shows a four-sided field in the same grove. The player says where the triangle came from (found, made, or both); each answer gets a reply and none is marked right. Last, Ayla and Elian pace one side from opposite ends and get the same number. Two replies follow (X-008).

**Why.** The second lesson folder has a lesson on whether mathematics is invented or discovered, built on a "triangle of trees". The game keeps both sides: the shape is chosen, the distances and the rule that three points in a line make no triangle are not.

**Where.** `src/domain/threeTrees.ts`, `src/content/three-trees.json`, `src/ui/treesPanel.ts`, `src/maps/forest.ts`, `tests/three-trees.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### Mozi at the Old Weir, the first thinker to meet in the world (X-012, X-015)

**What.** After the drought choice, Mozi waits at the Old Weir (chapter 11). Lumen first says that he is the Nexus's reconstruction, with his lines written for the game. Mozi asks the player to test a saying that the whole yard repeats: "Open the gate before the morning bell in a drought, and you waste the water." The player uses his three tests: the drought ledgers (what the past found), the crews' bench (what ordinary people saw and heard) and Omi's trial runnel (what happens in use). Then the player tells Mozi what the tests show. There are three answers, and each gets its own reply from Mozi. None is marked wrong. Omi and Sena then reply (X-008): Omi trusts the runnel, and Sena asks who was allowed to write the ledgers. Meeting Mozi adds the pragmatic and consequences views to the journal.

**Why.** Mika asked that students meet real thinkers as people who give quests (X-015), and that the views have names (X-012). The three Mohist tests are a clear, old method of testing a claim. The quest shows that a claim many people repeat can be tested, and that the test can narrow it ("it holds when nobody watches the channel") instead of only keeping or dropping it. The source is the Stanford Encyclopedia of Philosophy entry on Mohism.

**Where.** `src/content/thinker-mozi.json`, `src/maps/water.ts`, a new entry in `src/content/two-replies.json`, `tests/thinker-quests.test.ts`.

### Ibn al-Haytham at Headland Station (X-012, X-015)

**What.** After the notice is sent (chapter 4), Ibn al-Haytham waits at Headland Station. Lumen says he is the Nexus's reconstruction. He asks the player to test a line in the station manual: "the moon is bigger at the roof line because it is nearer then". The player uses three tests: the brass sighting ring (the moon fills three notches high and low), the chart tube (with the roof line hidden, the rising moon looks small), and the founder's notebook (careful tide measurements, but no measurement for the moon, only "as all the old books say"). There are three answers, and each gets its own reply. Neri and Ruan then disagree about how fast to change a trusted book (X-008). Meeting him adds the correspondence view to the journal.

**Why.** Ibn al-Haytham (about 965 to 1040) tested the claims of famous books with experiments anyone could repeat, and he also doubted his own judgement. He gave an explanation of the moon illusion based on how the eye judges distance. The audit asked for him in the chapter 4 optics pathway (X-015). He is now the 13th thinker. Source: Biographical Encyclopedia of Astronomers, https://islamsci.mcgill.ca/RASI/BEA/Ibn_al-Haytham_BEA.htm

**Where.** `src/content/thinker-haytham.json`, `src/content/thinkers.json`, `src/maps/observatory.ts`, `src/content/two-replies.json`, `tests/thinker-quests.test.ts` (one test file for every thinker quest).

### The Assay Trial, chapter 6's signature game (C-004, X-007)

**What.** At Corra's sample bench in the Sample Yard, four claims arrive, each with two samples. The player can look, rub both on a white tile (streak) and weigh both in a water jar (density, shown with its margin). Then the player calls the pair the same stone or different stones. A wrong call restarts that claim, with Corra saying what was missed. The four claims are built so that looks mislead both ways (gold and pyrite look alike; fresh and tarnished galena do not), one pair can only be told apart by streak (hematite and magnetite), and one only by density (chalcopyrite and pyrite). At the end the player says which test to trust, and Corra or Bea replies. Corra and Bea then disagree about what goes on the front of a label (X-008).

**Why.** Chapter 6 had no field game (G8, H4). The chapter's story is a label ("matched") that claims more than its test showed. The trial makes the player feel the main lesson in their hands: a test that cannot tell two things apart does not show that they are the same. Streak colours and densities are standard mineral data.

**Where.** `src/domain/assayTrial.ts`, `src/content/assay-trial.json`, `src/ui/assayPanel.ts`, `src/maps/metalworks.ts`, `tests/assay-trial.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md. The 30-minute audit keeps its original bound on the core path; see "The 30-minute audit and the new games" below.

### Marshall Islands stick charts in the Lantern House (X-006)

**What.** After the chapter 8 choice, the Lantern House has a new case. The player reads three documented records and keeps each as a card with its sources: what the three kinds of stick chart are for (they were learned ashore and left ashore); the voyages to Aur, where the navigator Korent Joel described a line of swells that the scientists' buoys did not detect; and who may share this knowledge (by family and permission). Then the player writes the display card. There are three cards to choose from, and each gets two replies from Renna and Sora (X-008).

**Why.** Reviewers J1 and J2 asked that the Marshallese tradition be shown as knowledge with its own method, not as a learning aid, and with sources from the Marshallese people (Mika's decision X-006). The case keeps the main TOK point: an instrument that finds nothing does not show that nothing is there. The game does not teach how to read the swells, because that knowledge belongs to Marshallese navigators to share. A news report was not used as a source (NONEWS-001).

**Sources.** Waan Aelõñ in Majel (the Marshallese canoe school), the Library of Congress, Smithsonian Ocean and Smithsonian Magazine. They are listed in `src/content/sea-stick-charts.json`.

**Where.** `src/content/sea-stick-charts.json`, `src/maps/sea.ts`, three entries in `src/content/two-replies.json`, `tests/sea-stick-charts.test.ts`.

### The study at Tuskegee, in the Quiet Records Room (X-005, C-014)

**What.** After the chapter 12 choice, a new room opens off Library Dispatch. A content note shows first, with sources and a way to step back. The room holds three documented records, each kept as a card with sources: what the men were told and promised; the cure (penicillin) that was not given for about 25 years, and how the study ended in 1972; and what came after (the 1974 settlement, health benefits, the 1997 apology, and the descendants' foundation that keeps the men's names). Then the player writes the Civic Machine's first rule for records of studies on people. There are three rules to choose from (consent, names, who can stop a study), and each gets two replies from Keeper Ade and Route Clerk Lin (X-008). There are no points, marks or timers in this room.

**Why.** Mika decided that difficult real history is included, with content notes and reliable sources (X-005). Chapter 12 is about how a system's records shape what it does. This case shows that a record can be accurate in its numbers and still hide the most important thing. Where the sources differ (600 men in the government count, 625 in the descendants' list; 1943, 1945 or 1947 for penicillin), the cards say so and name who keeps each version.

**Sources.** The CDC's pages on the study and its timeline, and the Voices for Our Fathers Legacy Foundation, formed by the men's descendants. They are listed in `src/content/civic-tuskegee.json`.

**Where.** `src/content/civic-tuskegee.json`, `src/maps/quietRecords.ts`, `src/maps/civic.ts`, `src/content/content-notes.json`, three entries in `src/content/two-replies.json`, `tests/civic-tuskegee.test.ts`.

### Ibn Khaldun in the Nile Map Room (X-012, X-015)

**What.** After the dispatch is sent (chapter 2), Ibn Khaldun waits in the Map Room. Lumen says he is the Nexus's reconstruction. He asks the player to test a chronicle's claim that an army of three hundred thousand marched south. The player reads the granary rolls (food for about twenty thousand for a month), the road record (wells that water a few thousand a day) and the copy chain (the oldest copy says thirty thousand; a later copyist added a stroke). Three answers, each with its own reply. Marek and Nasir then disagree (X-008): Marek trusts grain and water over any book, and Nasir asks who wanted the bigger number. Meeting him adds the coherence view.

**Why.** Ibn Khaldun (1332 to 1406) warned in the Muqaddimah that historians copy reports without testing them against what is possible, and he used army sizes as an example. The audit suggested him for chapter 2. He is now the 14th thinker. Source: Britannica, https://www.britannica.com/biography/Ibn-Khaldun/The-Muqaddimah-Ibn-Khalduns-philosophy-of-history

**Where.** `src/content/thinker-khaldun.json`, `src/content/thinkers.json`, `src/maps/nile.ts`, `src/content/two-replies.json`, `tests/thinker-quests.test.ts`.

### The Sketch Relay, chapter 7's signature game (C-004)

**What.** At the first signal tower on the Lending Hall Landing, Printer Lark asks the player to send "A storm is coming from the west. Bring the boats in." down the river by drawings only. The player chooses five marks. Two copyists each leave out the least bold mark, and the harbour reads what is left. With no key, the bold arrow is read the wrong way ("Go east!") and two crews sail into the storm. Lending Keeper Mina then offers keys to paint on every tower (what an arrow means, a bold rope sign, or lightning as "bring the boats in"). With one key, part of the message still fails. With two keys, including the arrow key, all of it can get through. At the end the player says what carried the meaning, and Lark or Mina replies. Lark and Mina then disagree about keys (X-008): a key helps the people who learned it and makes an outside for everyone else.

**Why.** The second lesson folder has a "draw a concept for others to guess" activity. The audit moved this game to the City of Copies, where it fits the chapter's question of what a copy keeps and loses. The game shows that bold is not the same as clear, and that meaning depends on a shared agreement that no copy shows.

**Where.** `src/domain/sketchRelay.ts`, `src/content/sketch-relay.json`, `src/ui/relayPanel.ts`, `src/maps/copies.ts`, `tests/sketch-relay.test.ts` (it checks that no single key is enough, and that two keys can be), credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### Tupaia's chart in the Lantern House (X-006)

**What.** Next to the stick chart, the Lantern House shows a copy of the chart made with Tupaia of Ra'iātea in 1769 and 1770. The player reads three records and keeps each as a card: who Tupaia was; how the chart's first readers called it wrong (and how it was later used to argue that Polynesians could not sail on purpose); and the 2019 reading by Eckstein and Schwarz (the centre word means noon, which is north, seen from a canoe), together with the scholars and Pacific navigators who disagree or ask to be part of the reading. Then the player writes the label: the 2019 reading with its critics, the chart unread with a note on its misreading, or a label left to Pacific navigators. Each gets two replies from Renna and Sora (X-008).

**Why.** The audit asked for Tupaia's chart in chapter 8, with Pacific sources (X-006). It is a strong TOK case: a map that follows rules its readers do not know looks like a mistake. The new reading is marked as a scholarly interpretation, not a fact, because the debate is open. Where sources differ (who drew the lines; how many islands), the cards say so.

**Sources.** Pacific Islander Biography (ANU), the Natural History Museum (London), the University of Potsdam project page, and Knowable Magazine. None of these is written by Pacific authors; Knowable Magazine quotes navigators from Tahiti and Ra'ivavae. A source from Tupaia's own people is still needed, and is listed below.

**Where.** `src/content/sea-tupaia.json`, `src/maps/sea.ts`, three entries in `src/content/two-replies.json`, `tests/sea-stick-charts.test.ts`.

### The Lens Table, chapter 9's signature game (C-004)

**What.** At the green card table in the Rehearsal Room, Director Edda tells of the night a performance was stopped two minutes before the opening. The player chooses two lens cards (Ilse the lead actor, the box office clerk, Bram the stagehand) and two object cards (the prompt book, the ticket ledger, the rigging log). Each lens and object pair gives one line, so every account has four lines. Edda or Hari then says what the account leaves out: why the show stopped, the frayed rope itself, the cost, or the company who were waiting. The player can choose other cards, then gives the night a title for the programme. Each title gets a reply, and none is marked right. Edda and Hari then disagree (X-008) about printing the cards that were chosen or one careful sentence.

**Why.** The first lesson folder has a historical lenses card game (lens, event, question and object cards). The audit made it chapter 9's game. The game shows that an account is built from a few people and a few things, and that a title can be true and still leave someone out. The event is invented, so the game does not reduce a real event to a card game.

**Where.** `src/domain/lensTable.ts`, `src/content/lens-table.json`, `src/ui/lensPanel.ts`, `src/maps/stage.ts`, `tests/lens-table.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Value Fair, chapter 10's signature game (C-004)

**What.** At her token table in Lantern Square, Clerk Dagny gives the player ten wooden tokens. Each token is an hour of getting ready for tomorrow's town meeting. The player spends them on five market rules (the checked scale, the hill farmers' basket measure, posted prices, opening at dawn, the market book). A rule needs three tokens to be defended and kept, so at most three can be kept. At the meeting the player sees which rules stand, where two kept rules clash, and which rules Assayer Tellen and Clerk Dagny would have kept with the same tokens. Then the player says what their biggest pile protected, and a keeper replies. Tellen and Dagny then disagree (X-008) about the market book.

**Why.** The first lesson folder has an auction of beliefs. Mika's rules exclude money, so the game uses tokens that stand for time. The game shows that the same facts lead to different rules, because what we spend effort on shows what we value. No set of rules is marked right (OPEN-001).

**Where.** `src/domain/valueFair.ts`, `src/content/value-fair.json`, `src/ui/fairPanel.ts`, `src/maps/market.ts`, `tests/value-fair.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Bat Keeper, chapter 4's night scene (C-004)

**What.** At the night lamp on Headland Station, Signalkeeper Ruan tells the player that bats are calling all around. The player hears nothing: people hear up to about 20 kHz, and bat calls run from about 9 to 200 kHz. With a heterodyne detector, which listens at one setting at a time, the player tunes the dial and finds a noctule (about 20 kHz), a Daubenton's bat (35), a common pipistrelle (45) and a soprano pipistrelle (55); one setting is empty. After three are found, the player waits at 45 and hears a feeding buzz: a catch. Then Ruan asks what that was like for the bat. Three answers, each with a reply. Neri and Ruan then disagree (X-008) about whether a station log should say what it cannot hold.

**Why.** The second lesson folder uses Thomas Nagel's question "What is it like to be a bat?" (1974). The audit placed it at the observatory, where the chapter is about instruments and what they report. The game separates what an instrument lets us know (which bat, where, a catch) from what it cannot give us (the bat's own experience). Bat facts come from the London Bat Group and the Maryland Department of Natural Resources.

**Where.** `src/domain/batKeeper.ts`, `src/content/bat-keeper.json`, `src/ui/batPanel.ts`, `src/maps/observatory.ts`, `tests/bat-keeper.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Time Mirror, chapter 15's signature scene (C-004)

**What.** In the Time Hall, Workshop Keeper Hale uncovers Elsbet's mirror. It shows a younger guardian holding the first page of the player's own journal: the first two entries ("Then") beside the latest two ("Now"). The guardian in the mirror asks whether the player would change the first entry: keep it, keep it and add a dated line, or add who else should have been asked. Each answer gets a reply from the past self, who then asks whether the next guardian will read the player's entries the same way. Hale and Essi then disagree (X-008) about keeping old wrong lines in a record.

**Why.** The second lesson folder has a "time mirror" (how a past self sees the present). The audit placed it at the end of the story, so reflection happens inside the story and uses the player's own words, not a quiz or an essay. It uses only the private journal; nothing is shared or graded.

**Where.** `src/domain/timeMirror.ts`, `src/content/time-mirror.json`, `src/ui/mirrorPanel.ts`, `src/maps/council.ts`, `tests/time-mirror.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Survey Bell, chapter 12's signature game (C-004)

**What.** After the player writes the first rule for study records in the Quiet Records Room, Keeper Ade brings out a brass bell. The council wants to study how people use the lanes. The player answers three design questions: how people join (counted unless they say no, sign a slip after an explanation, or forty households chosen by lot), what is kept (counts, token routes, or names and routes), and who sees the results first (the people in the study, the council, or the public board). Each answer shows what it gains and what it costs, and risky pairs raise a warning from Ade or Lin. A trial week then sums up the design. Ade and Lin disagree (X-008) about writing down what the data may never be used for. The design is kept as flags, so Vesper's Seal can use the same data later.

**Why.** The second lesson folder asks about ethics limits on research with people, and who decides. The game sits after the Tuskegee records, so the player designs a study having just read what a study without consent did. No design is marked right; each has a price.

**Where.** `src/domain/surveyBell.ts`, `src/content/survey-bell.json`, `src/ui/surveyPanel.ts`, `src/maps/quietRecords.ts`, `tests/survey-bell.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Labyrinth Lens, chapter 14's signature game (C-004)

**What.** At the harbour office on the Two-Tide Dock, Plan Keeper Ivo spreads three maps of the island: his plan, Landing Keeper Joss's footpaths, and the low-tide chart. The player must reach the last ferry, and can only step along a path that the current map shows. The plan shows a footbridge that is gone; the player who trusts it is stopped at two posts in the water. No map alone, and no two maps, reach the ferry; all three together do. Then Joss asks which sheet is the real map. Each answer gets a reply. Ivo and Joss then disagree (X-008) about the plan.

**Why.** The first lesson folder has a maze with lens toggles. Its scoring of answers as "nuanced" or "dogmatic" was left out, because it gives a hidden right answer (OPEN-001). The game shows that models are partial, that each perspective shows something real, and that the most official model can still be out of date.

**Where.** `src/domain/labyrinthLens.ts`, `src/content/labyrinth-lens.json`, `src/ui/labyrinthPanel.ts`, `src/maps/island.ts`, `tests/labyrinth-lens.test.ts` (it checks that no one or two lenses are enough), credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The River Crossing Inquiry, chapter 11's signature game (C-004)

**What.** At the ford log bench in the Council Yard, Weirkeeper Omi shows an original village story: a flood night at Reed Ford, a sick child on the far bank, and five people (Tamsin, Orrin the ferryman, Ravel the fisher, Tamsin's friend Pell, and the council that made the flood rule). The player ranks who acted worst. A villager who put the same person first speaks for that way of judging. Omi and Sena show their own, different orders. Then the log gives one more fact (Ravel knew his boat's keel was cracked), and the player can rank again or keep the order. Each outcome gets a reply. Omi and Sena then disagree (X-008) about what the argument was good for.

**Why.** The second lesson folder has a ranking story for ethics. The story was fully rewritten, with no sexual content, as the plan in DRIVE_WEAVE.md says. Each first place matches one way of judging (duty, character, care, consequences, justice). The game does not name them; the journal does (X-012). A new fact moves some judgements and not others, which shows that people who agree on the facts can still disagree for reasons they can say. No order is marked right (OPEN-001).

**Where.** `src/domain/riverCrossing.ts`, `src/content/river-crossing.json`, `src/ui/riverPanel.ts`, `src/maps/water.ts`, `tests/river-crossing.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Collage Wall, chapter 13's signature game (C-004)

**What.** In the Listening Room, Listener Wren pins four real records about child chimney sweeps in Britain: a coloured street print (1804, London Museum), William Blake's poem "The Chimney Sweeper" (1789, a copy at The Met), the House of Lords debate of 15 March 1819 (Hansard), and an engraving of George Smart's sweeping machine (Wellcome Collection). The player ties threads between pairs. Each of the six joins says something that neither card says alone. After three joins, Wren names the gap: every card was made by an adult, and no child's own words are on the wall. Eren then asks which card to send a visitor to, and every answer, including "none of them, alone", gets a reply. Wren and Eren then disagree (X-008) about how to show the gap.

**Why.** The second lesson folder asks whether a picture can tell the truth, with a collage, the 1819 debate and poems of the time. Decision X-005 includes difficult history with content notes and reliable sources, so the panel opens with a content note and a choice to come back later, and it lists its sources (museum and Parliament pages only, NONEWS-001). The game is about art, history and testimony as evidence, and about whose voice a record keeps.

**Where.** `src/domain/collageWall.ts`, `src/content/collage-wall.json` (with sources), `src/ui/collagePanel.ts`, `src/maps/voices.ts`, `tests/collage-wall.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Token Drawer, chapter 3's signature game (C-004)

**What.** In the Cold Store, Registrar Aster opens a drawer of real tokens left with babies at the Foundling Hospital in London (1740s to 1760s): an embroidered name ribbon, a ribbon with "My Name is Andrews" in ink, a bent and scratched shilling, a penny on a pink ribbon, a scrap of a baby's gown, and a child's ring. The player first acts as the clerk and chooses three lines for a billet; each line gets a reply, and Pilar explains why the real billets left off the birth name. Then three parents return and can only describe their token; the player finds the matching sealed packet (a wrong packet gets a gentle reply and another try). Last, the player labels a case of tokens that lost their billets. Aster and Pilar then disagree (X-008) about whether a record that keeps less can be kinder.

**Why.** The lesson folder asks who gets remembered. Chapter 3 is about a display board that gives two places one heading, so a game about what a record keeps and loses fits it. Decision X-005 includes difficult history with a content note and reliable sources: the panel opens with a note and a choice to come back later, and it lists the Foundling Museum and Coram pages it uses.

**Where.** `src/domain/tokenDrawer.ts`, `src/content/token-drawer.json` (with sources), `src/ui/tokenPanel.ts`, `src/maps/preserved.ts`, `tests/token-drawer.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Fog Chart, chapter 8's signature game (C-004)

**What.** On the Seagrass Steps, Cartographer Renna unrolls a fogged chart of a bay, six squares by six, with four hidden features: a reef, a deep channel, an old wreck and a moving sandbar. The player has sixteen soundings. A hit names the feature; sounding all of it shows the claim and what holds it up, and each rests on a different kind of support (a measurement today, ten years of ferry crossings, one diver's report, three old charts that disagree). Harbourkeeper Sora first gives three sailors' reports, and one of them, from a captain who was sure, is wrong. When the soundings run out or all four are found, the player decides how to print what was not sounded. Renna and Sora then disagree (X-008) about practice knowledge on a chart.

**Why.** The first lesson folder has a battleship grid of knowledge claims. The plan asked for two players; this version puts the player against the fog, with the keepers' reports as the second side, so it works alone and in class mode. Running out of soundings is an ending with its own text, not a failure screen (X-007). No print choice is marked right (OPEN-001).

**Where.** `src/domain/fogChart.ts`, `src/content/fog-chart.json`, `src/ui/fogPanel.ts`, `src/maps/sea.ts`, `tests/fog-chart.test.ts`, credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### The Festival Dilemma, chapter 11's second game (C-004, X-012)

**What.** On the lantern wall by the Lower Channel, Tess asks for help: she saw her cousin Maren loosen a rival's boat line before a race that Maren won, and Maren's family needs the prize. Four friends give four pieces of advice. Tess has three new facts (the rival says a cracked oar cost him the race; Maren's family will have to sell their boat; Maren asks Tess to keep quiet). The player tries each fact on each friend, and a small table shows whose advice changes and whose holds. A friend who has heard every fact says what moves them. After hearing out two friends, the player advises Tess, in a friend's way or in their own words. Omi and Sena then disagree (X-008) about what a council needs.

**Why.** The second lesson folder pairs the ranking story with friends who each argue one ethical view. The facts are built so that no two friends are moved by the same facts, so the player can find each way of judging by testing it, not by being told. The friends never name their views; the journal does (consequences, duty, virtue, care), as decision X-012 asks. No advice is marked right (OPEN-001).

**Where.** `src/domain/festivalDilemma.ts`, `src/content/festival-dilemma.json`, `src/ui/festivalPanel.ts`, `src/maps/water.ts`, `tests/festival-dilemma.test.ts` (it checks that the facts tell the friends apart), credits in `src/domain/ideaCredits.ts` and CREDITS.md.

### Custodian voices: Chinchorro sites, Yirrkala petitions, Shawnee sources (C-023, X-006)

**What.** Three changes about who keeps a record today, and how they describe it.
- **Chinchorro (chapter 3).** A new card in the Chinchorro Records room says who looks after the three sites now: Chile's National Monuments Council, which supervises them and must approve any change, and the Chinchorro Marka Corporation, which runs the management system. It also says what UNESCO asks: that the people of Arica and any community with a link to the sites share in decisions, and that questions about the treatment of the dead are still open. The card says plainly that it gives the institutions' words, and that the community's own words are not on it yet.
- **Yirrkala bark petitions.** A new "Yolŋu account" card in the Shoal Shelf Reading Shelter gives the makers' name for the petitions, Näku Dhäruk (bark, and word or message). It says that for Yolŋu they were an offering between equal powers, and that one petition returned to Yirrkala in December 2023. The card stands next to the parliamentary receipt, so the player sees two records of one event.
- **Shawnee (chapter 13).** The Tecumseh records already cite the Absentee Shawnee Tribe and the Eastern Shawnee Tribe of Oklahoma. The audit item is marked done. The Eastern Shawnee page names all three federally recognised Shawnee nations.

**Why.** Decision X-006 asks for Indigenous knowledge that is verified and woven in, with sources from the people themselves where possible. Where no community source was found (Chinchorro, Luba), the game says so in the text, instead of filling the gap with a guess.

**Where.** `src/maps/preserved.ts` (preserved-coast-custodians), `src/maps/specimenPassage.ts` (yirrkala-yolngu-account). Sources: UNESCO World Heritage Centre property 1634; National Museum of Australia, Defining Moments: Yirrkala bark petitions; East Arnhem Regional Council, on the fourth petition's return (4 December 2023).

### Pushback after a weighed judgement (C-016)

**What.** After seven weighed choices, a person affected by the choice pushes back, and the player answers. The words depend on what the player chose:
- **The Green Squares (chapter 5):** Elian pushes back on ribbons that turn a lead into a cause, or on ties that tell walkers nothing.
- **Where the Ink Stops (chapter 8):** a skiff crew who steered by the old chart pushes back on the new chart wall.
- **The Agreement at the Weir (chapter 11):** the crew who lost water pushes back on the order, whichever order the player chose.
- **The Next Bell (chapter 4):** a boat crew who acted on the first notice pushes back on the revision.
- **The Missing Tuesday (chapter 7):** a reader who walked to the closed hall asks who is responsible for that walk.
- **The Doorway Pause (chapter 9):** a note from the side gallery says the scene looked different from there.
- **A Place on the Route (chapter 12):** a reader from Canal Walk says the count counted only the people who could come.

The player can keep the choice and say why, change it, or ask what would change the other person's mind. Each answer gets a reply. The answer is kept as a flag (`push.<id>.answer`) for the journal and for research data.

**Why.** Personas D1, D2, C3 and E1 noted that many missions ended with "a reader uses the display", with no one who disagreed. A judgement that nobody challenges teaches less than one the player must defend. No answer is marked right (OPEN-001). Holding a choice can be as good as changing it, and the replies say so.

**Where.** `src/domain/pushbacks.ts`, `src/content/pushbacks.json`, `src/ui/ui.ts` (showPushback, after the two replies), `tests/pushbacks.test.ts`. More missions can be added in the JSON file alone.

### Open quests as pathways, with a good place to stop (C-010)

**What.** The journal's "Open quests" page now groups quests by place (the Nexus, the Living Forest, the Cartographers' Sea and so on). Each place is a section that opens and closes; the place where the player is now starts open. Each quest shows how many of its steps are done. When at least one step is done, it says that this is a good place to stop, and that the rest will wait. A quest with many steps shows the first four, and the rest go into a "more steps" drawer.

**Why.** Personas A5, G9, G11 and I3 found the journal hard to scan: one room listed 36 to 43 steps in a row, and nothing told a player with little time that it was safe to stop. Mika decided to keep every case and to mark no main path (X-010), so the fix groups and folds the list and removes nothing.

**Where.** `src/domain/adventureJournal.ts` (each quest now has its world and step counts), `src/ui/adventureJournal.ts` (the grouped view), `src/ui/styles.css`, `tests/quest-pathways.test.ts`. The material drawers planned for single rooms in chapters 2, 3 and 6 can build on this.

### Voice sheets (C-005)

**What.** A new file, `docs/VOICES.md`, gives 63 characters a voice sheet: what each one believes, the mistake each one fears most, how each one speaks, and why. It covers every keeper and every character with more than 20 lines. The two keepers in each chapter are built to pull against each other, as decision X-008 asks. A test (`tests/voices.test.ts`) fails if a character with more than 20 lines has no sheet, or if a sheet lacks one of its four parts.

**Why.** Personas E2, E3, E4 and G5 found that many characters sounded alike, and that the two keepers in a chapter rarely disagreed. The new two-reply moments, pushbacks and games already follow these sheets. Writers adding lines later now have one place to check a voice.

**Where.** `docs/VOICES.md`, `tests/voices.test.ts`. Pronouns are used only where the game's own text already uses them.

### The 30-minute audit and the new games

**What.** The audit test (`tests/learning.test.ts`) measures minutes of play in which a 30-minute window lacks some TOK concept or framework part. The new optional games add minutes inside windows that were already open, so the measure grew with each game. The test now checks the original bound on the path without the new games, and allows each new game to lengthen the gaps by at most three times its own minutes.

**Why.** Raising the bound after each game would have weakened the guard for the core campaign. This way the core guard stays as it was, and the cost of each new game stays visible and limited. Where a game honestly covers what its window lacked (for example ethics in The Lens Table, truth in The Bat Keeper), its learning tag says so.

## Not done yet

These decisions need more content work. They will be done chapter by chapter, with research from reliable sources.

| Decision | What is still to do |
| --- | --- |
| X-005 Difficult real history | Plan each case (for example the Nanking massacre, Nat Turner's revolt, the Lewis and Clark expedition and the Blackfeet, Columbus) with content notes, documented testimony and reliable sources. |
| X-006 Indigenous knowledge | Chapter 8 has the stick charts and Tupaia's chart. Still needed: a source from Ra'iātea or Tahiti for Tupaia's chart, Shawnee sources for chapter 13, Yolŋu and Luba sources for chapter 3, and a Chinchorro custodian voice (C-023). |
| X-012, X-015 Thinkers in the world | Mozi (chapter 11), Ibn al-Haytham (chapter 4) and Ibn Khaldun (chapter 2) are in. Add more thinkers as people the student meets, each with a quest. |
| X-007 More trials | Add more restartable trial sections in later chapters, each with its own idea. |
| X-008 More replies | Every chapter now has two-reply moments (59 in all). Add more where a chapter has other key choices. |
| X-001 Leaderboard in the hosted build | Connect the opt-in leaderboard to the hosted build when accounts exist. |
