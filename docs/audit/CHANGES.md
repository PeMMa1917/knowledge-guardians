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

## Not done yet

These decisions need more content work. They will be done chapter by chapter, with research from reliable sources.

| Decision | What is still to do |
| --- | --- |
| X-005 Difficult real history | Plan each case (for example the Nanking massacre, Nat Turner's revolt, the Lewis and Clark expedition and the Blackfeet, Columbus) with content notes, documented testimony and reliable sources. |
| X-006 Indigenous knowledge | Weave knowledge from separate Indigenous peoples into the chapters, from sources made by the peoples themselves. |
| X-012, X-015 Thinkers in the world | Add thinkers as people the student meets in the chapters, each with a quest. The advisor call and the Views tab are ready for them. |
| X-007 More trials | Add more restartable trial sections in later chapters, each with its own idea. |
| X-008 More replies | Add two-reply moments in chapters 2 to 15. |
| X-001 Leaderboard in the hosted build | Connect the opt-in leaderboard to the hosted build when accounts exist. |
