# Contested changes

These are changes that one persona wants and another persona thinks are wrong. Developers do not decide these. Mika decides. Until then, the game stays as it is.

Each item has: the question, who wants what and why, the options, and a recommendation. The recommendation is only advice.

---

## X-001 Leaderboards and streaks
- **For:** G4 (competitors), H5 (gamification), F4 (marketing): they raise return visits.
- **Against:** A3, A5, I2, I3, H1, B8: they reward speed and volume, not thought, and they shame slow players. They also need a server and student data (B10).
- **Options:** (a) none; (b) a private personal record only; (c) class leaderboard in the future hosted build.
- **Recommendation:** (b). It keeps the motivation and needs no data.

## X-002 Explicit exam practice
- **For:** B5, B6, C1, B7: schools judge tools by exam results.
- **Against:** Mika's rule (nothing like an exam), A8, E1, D5.
- **Options:** (a) none in the game, teacher map only (C-008); (b) an optional "practice room" outside the story; (c) exam-style tasks in the story.
- **Recommendation:** (a).

## X-003 Timers
- **For:** G4, G9: timed modes add tension.
- **Against:** I2 (ADHD, dyslexia), A3, A4, PLAY-001.
- **Options:** (a) no timers; (b) an optional timed replay of a field game after it is done once; (c) timers by default.
- **Recommendation:** (b).

## X-004 Romance
- **For:** E5 (new adult authors), some G5 players.
- **Against:** Mika's rule (friendships only), B8, B6.
- **Recommendation:** keep friendships only. Listed only because the persona asked.

## X-005 Difficult real history
Topics from the lesson folder: the Nanking massacre, slavery and Nat Turner, the Lewis and Clark expedition and the Blackfeet, Columbus.
- **For:** D7, D8, B3 (history): TOK history needs hard cases; avoiding them is itself a choice.
- **Against or cautious:** B8, B6, I4, J1: age, school context, and the risk of a game making light of suffering.
- **Options:** (a) leave out; (b) include as objects and testimony with content notes (C-014), never as play; (c) include in play.
- **Recommendation:** (b), one topic at a time, with review.

## X-006 Indigenous content timing
- **For sooner:** J2, B15, D7: leaving it out also teaches something.
- **For later:** J1, AGENTS.md: content stays locked until advisors approve.
- **Recommendation:** keep locked. Write the questions for advisors now (see C-023, C-024).

## X-007 Failure states
- **For:** E1, G4, D5: without a way to lose, choices feel light.
- **Against:** A3, I3, H1: fear of failure stops weaker students. OPEN-001 says no hidden right answer.
- **Options:** (a) no failure; (b) consequences that change the story (a person stops trusting the player for a while) but never a "game over"; (c) failure and retry.
- **Recommendation:** (b).

## X-008 Show a model answer after a choice
- **For:** B1, C1, H2: worked examples help learning.
- **Against:** OPEN-001, D1, D2: a model answer becomes the right answer.
- **Options:** (a) none; (b) show two different strong replies from characters who disagree; (c) one model answer.
- **Recommendation:** (b).

## X-009 Translations
- **For:** A4, J3, B15: many IB students do not have English as a first language.
- **Against for now:** E8, E10: 214,600 words of dialogue; quality risk; the game is not finished.
- **Recommendation:** prepare the text for translation now (no text in code), translate later.

## X-010 Cut volume, or keep it
- **For cutting:** A5, G11, I3, G9, F2: 94 missions in chapter 1 hide the story.
- **Against:** G6, G2, B12: the side missions hold most of the subject links and real objects.
- **Options:** (a) cut; (b) keep all and hide most until the player asks (C-010); (c) keep as it is.
- **Recommendation:** (b).

## X-011 Lumen speaks first when the player is stuck
- **For:** H2, I3, A3.
- **Against:** G2, G8, A6: it spoils the puzzle.
- **Options:** (a) never; (b) a setting, off by default; (c) a setting, on by default.
- **Recommendation:** (b).

## X-012 Name the ethics frameworks
Ideas from the School Dance and ethics-ranking lessons use virtue ethics, duty and consequences.
- **For:** D1, D2, B1, A7: the names help students in the essay.
- **Against:** E1, A8, Mika's play-first rule: labels in play feel like a lesson.
- **Options:** (a) characters argue from each view without the name, and the journal names it (C-009); (b) characters say the name.
- **Recommendation:** (a).

## X-013 "EE practice" in the mission title
- **For keeping:** B5, B1: students should know it helps with the extended essay.
- **Against:** A5, E1, G5, Mika's rule.
- **Options:** (a) keep "EE practice trail" in the mission title; (b) in-world title, EE shown only in the teacher map and journal.
- **Recommendation:** (b). Note: `tests/ee-trail.test.ts` checks the portfolio title, so that test changes too.

## X-014 The knotted ropes at the East Well
- **Question:** the ropes are records made of knots. Players may link them to the khipu of the Andes.
- **Keep:** E2: it is an invented Emberford custom and it is part of the story.
- **Change or check:** J1, J2: do not borrow a real people's record system without care.
- **Options:** (a) keep and add a line that it is an Emberford custom; (b) change to another record form (notched tally sticks, which Lumen's new "tally" entry explains); (c) ask cultural advisors.
- **Recommendation:** (b) or (c). (b) also links to the new glossary word.

## X-015 Named real philosophers
- **For:** D1, D2, A7, B14.
- **Against:** E2, G5: real names break the world. Risk of one tradition only (J2).
- **Options:** (a) none; (b) in the journal and glossary only, from many traditions; (c) in dialogue.
- **Recommendation:** (b).

## X-016 Code licence
- **Question:** open licence for code, separate from asset licences.
- **For open:** E12, E14, B15. **Cautious:** B6.
- **Recommendation:** Mika's choice. No change until decided.

## X-017 Credit lesson authors
- **Question:** some ideas in the Drive folder come from other teachers or published lessons.
- **For credit:** B1, D3. **Cautious:** handout wording must stay private.
- **Recommendation:** a credits page that names the idea's source without its wording, if Mika knows the source.

## X-018 Research build and analytics
- **For:** D4, D6, H2: real data shows what works.
- **Against:** B10, B8, B9: no network calls is a key promise.
- **Recommendation:** none in the student build. A separate research build only with school consent.

## X-019 Class "same seed" mode
- **For:** B1, G3: a class can compare the same choices.
- **Against:** G10, A9: it can make choices feel like there is one right path.
- **Recommendation:** optional teacher setting, later.
