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
- **Side quest "The East Well"** (Emberford, CAS habits, spec 92.3): Efua Asante's well is low. The player listens to three people first, plans a fair comparison with them, reads knotted ropes at two wells, reflects, and shows the guildmaster. The game says plainly that play is not CAS (CAS-001). 10 XP, the same on every route.
- **Smart glossary** (spec 47.10, C1): 18 key words (claim, evidence, justification, perspective, bias, knowledge question and others) are underlined in conversations. Tapping one shows Lumen's plain explanation and, where possible, an example from the player's own play (for example their own label). A Glossary tab is in the journal. It can be turned off in Settings.
- **Titles** (spec 47.1, C1): each award gives a title that names the deed (for example "Thread-Follower", "One Who Asks First"). The player can wear one (Journal, Awards). It shows in the top bar.
- **Question Stones and Lumen's last word** (spec 62, KQ-003, C1): 12 chapter steps carry one of six knowledge questions (our own paraphrases, in `src/content/questions.json`). When a step is done, Lumen names the question in one sentence, and its stone gets brighter for each new way (a new place or a new kind of action, up to five). Journal tab "Question Stones". Never a quiz (KQ-001). `PERMANENT_SCHEMA` is now 3, with a migration.
- **Campfire logs** at Waystones (C1): one optional prompt about the latest step ("What helped you…?"), saved as a private note. Never graded.
- **Read aloud** (spec 21): a "Read aloud" button on every conversation line, and a setting that reads each line and its options automatically. It uses the browser's own voice (Web Speech API).
- **Key remapping** (spec 21.6): Controls, "Change keys". Players choose their own letter keys for walking, talking, hints, journal, portfolio and bag, or pick a ready-made layout (QWERTY, AZERTY, E S D F). A clash swaps the two keys. Arrows, Space, Enter, Esc and number keys always keep their jobs. Rules in `src/app/keymap.ts`. The top bar shows the player's keys.
- **Colour-safe marks** (Settings): a blue and orange palette, and a symbol (✓, ✗, ~, !) on every good or bad result, so colour never carries meaning alone.
- **Pronouns and origins** (spec 35.1): on the new-game screen the player chooses pronouns (they, she, he, or their own words) and, optionally, one of five origins (Archive child, Harbour runner, Workshop apprentice, Village singer, Traveller). An origin gives one Lens hint in the journal and one extra conversation option in each world (Ise in the Nexus, Sefa in Emberford). It gives no XP, marks or cards. Characters use the chosen pronouns through text tokens (`{name}`, `{they}`, `{them}`, `{their}`). Pronouns can be changed at any time (Menu, My Guardian). `CAMPAIGN_SCHEMA` is now 4: old saves get they/them and no origin. Each origin also has a **small personal side quest** with its own quest giver, who appears only for that origin: The Misfiled Slip (Archive child, Nexus), Two Words for First (Traveller, Nexus), The Changed Message (Harbour runner), One Quench Is Not a Test (Workshop apprentice) and The Missing Verse (Village singer), all in Emberford. Each one is: hear a problem, ask one other person, choose together. It gives a journal entry and a portfolio prompt, and no XP. 
- **Appearance** (spec 35.1): four ready-made looks, or choose skin (8 tones), hair (9 colours), outfit (10), trousers (6), and an accessory (headband, scarf or both) in 6 colours, with a live preview. Every option is open from the start. The look can be changed at any time (Menu, My Guardian). Sheets are made in the browser by recolouring the CC0 base sheet (`src/domain/appearance.ts`, `src/scenes/looks.ts`), and the look is stored as a short string in `player.look` (no schema change). Side characters now use made looks too (`"sprite": "custom:..."` in `common.json`), so fewer of them share a sheet. Not done yet: hair styles, glasses and mobility aids (they need new pixel art).
- **Talk sounds and voice** (spec 35.1 voice barks): each character has its own short voice blips while they speak (made in code with Web Audio, `src/app/voice.ts`; no files). The player picks a voice (or none) on the new-game screen and in My Guardian. Talk sounds can be turned off in Settings, and they stop when Read aloud is on.
- **The Alcove of Firsts** (Exhibition Hall alcove, SYM-001, Craft Fray; Hall of Firsts, after the label): the player stands one object on a plinth, says what knowledge it shows in the world, and answers "so what?". A symbol (glasses for "perspective", a trophy, a light bulb, a crown) brings the **Symbol Mirage** and the lamps stay dark. A list of concept names brings the **Checklist Golem**, whose ticks fall off. "So it is important" brings the **So-What Sphinx**. Four real objects can light it, each with two good implications; 10 XP on every route, badge and title "Lamp-Lighter", an exhibition entry in the portfolio. Rules in `src/domain/exhibition.ts`, content in `src/content/exhibition.json`.
- **Side quest "Words That Hold"** (Emberford, spec Part I, C1): the **Sign-Smith's notice board** (three notices where a comma, a pronoun or a describing word changes what the market does; wrong choices show a funny result) and the **Citation Thread bridge** (put MLA core elements for Sefa's song in order and leave out notes and opinions; a gap shows where it fails). 5 XP each. Rules in `src/domain/puzzles.ts`, content in `src/content/puzzles.json`. These have right answers because grammar and citation are conventions, not contested knowledge.
- **Interface themes and Lumen's glow** (Settings): five interface colour themes (Archive night, Ember, Forest, Ocean, Dusk) and five colours for Lumen's glow. High contrast still wins over any theme.
- **Footstep dust:** a small puff at each step (off with "Reduce visual effects").
- **Ambient sound:** the forge hammer rings in Emberford (louder near Hesper's anvil) and soft chimes sound in the Nexus hall. Made in code (`src/app/ambience.ts`), following the sound-effects volume.
- **Speech marks:** a small gold "!" bubble floats over a person who has a line the player has not seen yet. Seen lines are kept as `node.<id>` flags. It helps players find the next step without a quest arrow.
- **Showdown on phones:** "Explain the moves" shows what each move does under its button (on by default on touch screens, where hover titles do not show). Narrow screens get a compact layout, and toasts move to the bottom.
- **Skill Atlas** (spec 76.1, journal tab "Skills"): about 50 skills in 17 regions grow from Seen (1 use) to Practised (3), Confident (8 uses, 3 worlds, 2 kinds of action) and Transferred (15 uses, 2 areas of knowledge, 4 kinds of action). Chapter steps carry `skills` tags; each completed step records a use. Stages are words, never grades, and each skill shows its next step. Rules in `src/domain/skills.ts`, content in `src/content/skills.json`. `PERMANENT_SCHEMA` is now 4, with a migration. The progress file for the teacher holds the stage of each skill met (not the uses), and the teacher view shows a class Skill Atlas (students per stage) and the stages in each student report. Older progress files without skills still load.
- **Sound captions** (Settings, spec 21): a short text line at the bottom centre for each sound, for example [Forge hammer rings (to the left)], [Soft chimes], [Page turns] or the kind of music. Captions show even when the volume is off. The same caption does not repeat within 4 seconds. Rules in `src/app/captions.ts`; a test checks that every loaded sound has a caption.
- **Lorelings: the Glimmermoth** (spec 36.1, Nexus archive hall): a small, made-up moth that glows where knowledge is strong. The player befriends it by observation only: watch it in at least two of three places, write a pattern note (what draws it, when it glows), then choose where to wait. Light is present twice but is not the cause; a dark table and a bright, untouched cabinet are the counterexamples. A wrong note: it does not come, and the panel names the sighting to look at again (or a place not yet watched). No loss for wrong tries. Friend: 10 XP (same for everyone), badge and title "Patient Watcher", a journal entry. The player names it (six suggestions or their own name) and takes it into the field or leaves it at camp. In the field it follows the player and now and then flies to the nearest place not yet examined and glows there (with a shimmer sound and a caption). It grows to Lanternmoth (wider search) when evidence is used in steps in two worlds. Journal tab "Lorelings" shows the Loreling Atlas: all 24 Lorelings, two per concept, unknown ones as "???". Rules in `src/domain/lorelings.ts`, content in `src/content/lorelings.json`, original pixel art in `illustrations.ts`. No schema change (flags `lor.*`, `used.*`).
- **Fray Bestiary** (spec 36.2, journal tab): errors in reasoning shown as creatures, recorded automatically the first time the player meets one (a toast says so), with the error's name, its pattern, its weakness (always a good move), where it was first met and how often. Nine can be met in Chapter 1: Swell Wisp (overclaiming: a label that does not hold, or a Showdown press on a claim bigger than its support), Shadow Twins (correlation is not causation: a wrong Loreling note), Hasty Hydra (a counterexample narrows a general claim), Glimmer Knight (a seal with nothing under it), Echo Moths (shouting), Hornet of Blame (attacking the person), and the Symbol Mirage, Checklist Golem and So-What Sphinx of the alcove. Eleven more show as "???" for later chapters. Fixed rules on results only, never on values (`Engine.frayMet`). Content in `src/content/fray.json`. Not done yet: a real, sourced example for each page (needs source checking).
- **Photo mode** (Menu, Photo mode): hides the interface and speech marks, with zoom, seven colour filters (archive print, black and white, old photo, warm film, night, pinhole; WebGL camera effects), four frames, Lumen and the Loreling on or off, and a caption with the player's name, place and date. "Save picture" downloads a PNG to this device only. The player can walk to set up the shot; Esc leaves.
- **Day and evening in Emberford:** over 15 minutes of play the town light moves from morning through midday, golden hour and dusk to night and back (`src/app/daylight.ts`). Lamps glow stronger at night, fireflies come out, and a distant town bell rings at dusk (with a caption). Visual and sound only: nothing in play depends on the time. Off with "Reduce visual effects".
- **Balance reminder:** every 45 minutes of active play, Lumen suggests a real break. It never blocks play.
- **MIS-10 and MIS-11 (Indigenous knowledge) are left out on purpose.** They need Indigenous content made with community advisors (spec section 88). Do not add them with a quick signal.

- **Teacher view:** EE practice steps column and report panel (practice only, EE-003), a teacher guide, and a printed summary that leaves out the private progress list.
- Teacher view (`teacher.html`): class dashboard, weekly summary, concept, ATL, area and subject coverage, class learner-profile totals, misconception alerts with "Not a misconception", private progress list, and a printable student report. This also covers most of L2's dashboard, summary and report items.

### Tests

`npm test`: 162 tests pass (content checks, saves and migrations, full playthroughs of all label and Showdown routes, teacher report rules). `npm run build` passes. A full browser run from the title screen to the chapter end had no page errors.

## Next steps (in order)

1. **Playtest with students** (the "fun gate", CORE-012). Note where players get stuck. Tune hints, Showdown patience and crowd numbers.
2. **Phase L2 is done.** Phase L3 has started (38 of 40 misconceptions). Next in L3: quests for more subjects, and CAS stories about real people (Hokusai, Abebe Bikila, Wangari Maathai and others in spec 92.3; each needs a checked source first) and the C1 list in spec section 51 (rings, titles, Zen mode, clue board and others). Pick the ones that fit chapter 1 without making it too large.
3. **Teacher view:** export of the weekly summary as a printable page; a guide page for teachers. Keep TEACH-001 to TEACH-005.
4. **Art:** replace the code-drawn placeholders for the forge, plaques and label stand with richer pixel art (free licence, credited). Add music per area if a CC0 track fits.
5. **Chapter 2** (next world in spec section 27). Use the same tools (label kit, Showdown, thread) with new real objects. Keep people from every continent and period.
6. **Phase L3 and later:** all 40 misconceptions, quests for all subjects, CAS stories (play is never CAS), more reports.

## Known limits and problems

- **Toasts:** at most three show at once and the rest wait their turn; XP from one action shows as one toast. A busy moment can still take about ten seconds to read through.
- **Network:** this build environment could not open museum or encyclopedia websites, so no new historical sources were added after HIS-S31. New real people (for example the CAS figures) need a source that someone has opened and checked.

- **Phone layout:** the Showdown panel now has a one-column layout, a two-column move grid and smaller text on narrow screens. Other panels (label builder, forge, Title Lock) have not had a phone pass yet.
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
