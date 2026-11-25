# Status and next steps

This file is for the next developer, human or AI. Read [AGENTS.md](AGENTS.md) first. **Update this file when you stop work.**

Last update: 2026-11-25. Branch `feat/first-chapter`, pull request #1. Spec version: 2.10 (private; see [docs/DESIGN_SUMMARY.md](docs/DESIGN_SUMMARY.md)).

## What works now

### Chapter 1 (spec 29.1, the chapter rework, items 1 to 8)

- **Cold open** on a new game, then the Nexus mission "Three Firsts" (KG-CH1-M01): inspect three ballpoint-pen exhibits, use the Date Lens, run a fair test, a practice Showdown with the clerk Venn, and the label builder with the Fray.
- **Hall of Firsts** (optional): seven plaques, people from Africa, West Asia and North Africa, East Asia, South Asia, South America, Oceania and Europe, ancient to 20th century. Each plaque has its own small label kit.
- **Emberford** mission "The Label on the Blade" (KG-CH1-M02): Corvan's claim, the Provenance Thread (gap after the workshop), the schematic forge and assay comparison, a public Showdown with five outcomes (the town sign changes), Hesper, Kip finds the gold seal, back to Ise.
- **Equal credit** on all routes: 105 XP for the main chapter, plus 15 XP for the side quest. Tests check this.
- Waystones (rest and travel), checkpoints, the two save slots, the permanent record.

### Phase L1 (spec 97.3)

- Learner-profile moments (14 rules) and ATL tags. Moments are journal notes only.
- 15 random events (7 in the Nexus, 8 in Emberford) from a seeded deck. Calm mode in Settings.
- Private journal with tabs: moments, portfolio (share and reflect), atlas.
- 10 misconceptions with fixed rules. Private reflection at the student threshold.

### Phase L2 (in progress)

- **25 misconceptions** (MIS-01 to 09, 12, 15, 16, 18 to 22, 27 to 29, 31, 33, 34, 36 and 40). Each one has at least one place in play that can signal it (the validator checks this), next to a good option. MIS-36 fires when the player shouts or takes a cheap shot at an open fair point in a Showdown (`dodgeSignal`).
- **EE practice trail 1, "The Inventor's Share"** (Business management, east wing of the Nexus, after the label): Archivist Noor Tull, the **Title Lock** (8 questions open it; closed rings say why), a search plan that names a gap (no licence records), the Date Lens to weigh sources, a claim board with counterclaims (label kit `ee.inventor`), citations, an academic-integrity draft (copied paragraph, invented source, missing citation) and a reflection. 15 XP, the same on every route. Practice only (EE-002).
- **EE practice trail 2, "Who Holds the Pen?"** (History, Emberford, after the thread reaches the guild ledger): Keeper Ruth Oduya, a wooden Title Lock (cases: Bi Sheng known through Shen Kuo, and Eratosthenes), a plan back to the writer, weighing the guild ledger against Sefa's song, a claim table (`ee.authors`), citations to HIS-S21 and HIS-S22, a second integrity draft (patchwriting, a quotation with no edition, an uncredited picture) and a reflection. 15 XP.
### Phase L3 (started)

- **38 of 40 misconceptions** have a place in play. New: MIS-13, 14, 17, 23, 24, 25, 26, 30, 32, 35, 37, 38, 39. Sol, a visitor in the Hall of Firsts, argues about maths and culture, faith and science, and calculations. Ise answers "what is the real question?" (a knowledge question) and "should examples come from the news?".
- **MIS-10 and MIS-11 (Indigenous knowledge) are left out on purpose.** They need Indigenous content made with community advisors (spec section 88). Do not add them with a quick signal.

- **Teacher view:** EE practice steps column and report panel (practice only, EE-003), a teacher guide, and a printed summary that leaves out the private progress list.
- Teacher view (`teacher.html`): class dashboard, weekly summary, concept, ATL, area and subject coverage, class learner-profile totals, misconception alerts with "Not a misconception", private progress list, and a printable student report. This also covers most of L2's dashboard, summary and report items.

### Tests

`npm test`: 102 tests pass (content checks, saves and migrations, full playthroughs of all label and Showdown routes, teacher report rules). `npm run build` passes. A full browser run from the title screen to the chapter end had no page errors.

## Next steps (in order)

1. **Playtest with students** (the "fun gate", CORE-012). Note where players get stuck. Tune hints, Showdown patience and crowd numbers.
2. **Phase L2 is done.** Phase L3 has started (38 of 40 misconceptions). Next in L3: quests for more subjects and CAS stories and the C1 list in spec section 51 (rings, titles, Zen mode, clue board and others). Pick the ones that fit chapter 1 without making it too large.
3. **Teacher view:** export of the weekly summary as a printable page; a guide page for teachers. Keep TEACH-001 to TEACH-005.
4. **Art:** replace the code-drawn placeholders for the forge, plaques and label stand with richer pixel art (free licence, credited). Add music per area if a CC0 track fits.
5. **Chapter 2** (next world in spec section 27). Use the same tools (label kit, Showdown, thread) with new real objects. Keep people from every continent and period.
6. **Phase L3 and later:** all 40 misconceptions, quests for all subjects, CAS stories (play is never CAS), more reports.

## Known limits and problems

- The Showdown panel is long on small phone screens. The log scrolls, but the layout needs a phone pass.
- Event pacing uses play time, so a player who idles in one place can still get an event. This is within the rules, but check it in playtests.
- The teacher view trusts the player name in each file. Two students with the same name merge. Ask students to use full names.
- Code licence is not chosen yet (project owner decision).

## Decisions from the project owner (Mika)

- Classroom use only, not commercial.
- People from every continent and time period throughout.
- No student-made content and no news or current-events features.
- Learner profile as moments only, never as grades.
- Portfolios are private and owned by the student; shared only by choice.
- Real, specific, dated historical objects. Aethelgard is a fictional world.
- Free assets only (CC0 first). Lexend font. Simplified Technical English. `.docx` on A4 with 1.5 cm margins.
