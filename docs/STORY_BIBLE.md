# Story bible: the whole campaign (chapters 1 to 15)

This file sets the story rules for the whole game. Every developer (human or AI) reads it before writing a scene, a character, a quest or a minigame. Mika asked for these rules on 2026-11-26: the game must feel like one coherent story in a real world, and player choices must matter everywhere.

The design spec (private) defines the rival, the companions and the Echo rules. This file turns them into a plan for all 15 chapters. If this file and the spec disagree, follow the spec and fix this file.

All people, towns and groups in this file are fictional, unless a chapter's real historical objects are named. Real objects keep their sources in `docs/SOURCES.md`.

## 1. The surface plot (one sentence)

**Find Elsbet, the Guardian who vanished, and stop the Fray before the worlds forget how to ask "how do we know?"**

A player who reads nothing else must still know this goal. Every chapter opens with one line that says how this chapter moves the player toward it.

## 2. The central dramatic question

**How sure must we be before we tell other people, and what do we owe them when we were wrong?**

The game never answers this question for the player. Different characters give different answers, and each answer has a real strength and a real cost:

| Character | Their answer | Strength | Cost |
|---|---|---|---|
| Warden Ise | Protect trust in the Nexus. Correct quietly. | People keep a place they can rely on. | Quiet corrections hide old harm. |
| Vesper Quill (rival) | People need certainty now. Caveats leave them with nothing. | People must act today: harvest, evacuate, buy. | A stamped claim feels solid when it is not. |
| Elsbet Varro | Check together, in the open, where anyone can check. | Trust that can survive a mistake. | Slow. Needs a community that comes to check. |
| Kip Arden | Ask the next question. | Finds the hidden assumption. | Leaves the first question unfinished. |
| Hesper Lyle | If I can make it, I know it. | Hands-on proof. | Misses why a thing mattered to people. |
| Sefa Okon | Stories carry what records lose. | Keeps memory that records drop. | Can protect a good story from bad news. |
| Rook Tamsin | Trust nothing that has no source. | Hard to fool. | Dismisses lived experience; can be cruel. |

TOK link: certainty, evidence, responsibility, power, perspective. The question is a knowledge question, so the whole campaign is a long exploration of it.

## 3. The player: want and need

- **Want (external):** become a full Guardian, relight the lamps, find Elsbet. Underneath: be right, and be trusted.
- **Need (internal):** act well when nobody can be certain; say what you do not know; admit a mistake (your own, and the Nexus's) and repair it in the open.
- **Blind spot:** the player starts on the side of the institution. The game lets them trust the Nexus, then shows why that trust needs checking too.

**Ludonarrative harmony.** The core mechanic carries the theme: a label whose force matches its support makes the Fray fade; a label that says more than its evidence feeds the Fray. Lamps light only when a community works something out together. The player cannot light a lamp alone.

## 4. World rules (internal consistency)

Keep these rules in every chapter. A solution must follow from them, never from a new exception.

1. **The Nexus** is a hall of memory between worlds. Portals open where people keep knowledge. The Nexus cannot travel in time and cannot settle a question without evidence.
2. **The Fray** grows where a claim is stronger than its support, and where nobody checks. It looks like a gold glow, grey fog, cracked bridges, lost routes. It has three causes (spec 6.1): honest limits, institutional habits, and the Gilded Seal. In each case the player finds out which cause is at work. A single villain never explains every problem.
3. **Lamps** are warm amber light. A lamp lights when a community works out a hard question together. A lamp can go dark again if nobody keeps checking.
4. **The gold glow** is the opposite of lamp light: cold, bright, and it flatters. A Gilded Seal stamp gives a claim a short boost of public trust and feeds the Fray.
5. **Fray creatures** are named errors of reasoning (the Fray Bestiary). They are never real people or groups. Naming one correctly makes it weaker.
6. **Waystones** are diegetic saves: a Guardian writes the day into the stone, so the record can be checked later. Portal stones are diegetic fast travel: Guardians can only travel to places whose way they have recorded.
7. **Lumen** is a fictional fairy in a world of real objects. Lumen can be wrong, and after the Cottingley case marks hints as "Lumen's guess" or "from the record".
8. **Knowledge opens doors.** Areas open because the player understands something (a method, a convention, a weakness), not because they found a key.
9. **Failure moves forward.** No game-over. A lost Showdown, a wrong guess or a bad label opens a branch: a new rival, an Echo, a second chance with a cost. Calm mode stays available.

## 5. Cast

Each person needs a want, a need or blind spot, a voice that you can recognise without the name, and their own quest or side quest. Never reuse a name. Check with `grep -rw <Name> src` before you add a person.

| Character | Want | Blind spot | Voice (sample) | Leitmotif |
|---|---|---|---|---|
| Warden Ise | Keep the Nexus trusted | Hides old mistakes to protect trust | Formal, short, avoids one name: "We will speak of Elsbet later." | Low strings, the archive theme |
| Kip Arden (Questioner) | Prove a family story | Leaves questions half done | Fast, many questions: "First at what? Wait, who said?" | Quick pizzicato |
| Hesper Lyle (Maker) | Keep the forge's name | Trusts making over records | Plain, about hands and heat: "Show me. Then I'll believe it." | Anvil rhythm |
| Sefa Okon (Storyteller) | Keep the town's songs true | Protects a good story | Sayings and verses: "A song keeps what a ledger drops." | A sung line |
| Rook Tamsin (Sceptic, joins ch 10) | Undo a false seal they stamped | Dismisses testimony | Dry, cutting, then kind: "Source. No? Then it's a guess." | Muted brass |
| Lumen | Be a good guide | Over-believes pretty evidence | Curious, light, admits doubt: "That's my guess, not the record." | Chime |
| Elsbet Varro (absent mentor) | Make knowledge checkable by anyone | Left without a word | Letters, small hand, warm, exact: "Every record here can be wrong." | The music box tune |
| Vesper Quill (rival) | Give people certainty they can use | Sells certainty that is not there | Charming, polite, funny, sad under the charm: "You leave them with caveats. I leave them with an answer." | The music box tune in a minor key, on a harpsichord |
| Orrin Pell | Keep Emberford trading | Prefers peace to truth | Guild-master warmth: "Now, now. Let's not shout in the square." | Town theme |

Each chapter also has a **local guide** who joins for that chapter only. Local guides must have a want of their own, a reason to doubt the player, and one line that shows a life outside the plot (an idiom, a routine, a worry).

## 6. The rival: Vesper Quill and the Gilded Seal

- Vesper is a former Guardian who trained with Elsbet under Ise. Vesper leads the Gilded Seal, which stamps gold seals on claims for a price.
- Vesper believes they are right: people need to act now, and the Guardians' caveats leave them with nothing. **In at least one case per chapter, Vesper is right and the Nexus over-claims.**
- **Recurring rival rules.** Vesper writes the player a short letter after each chapter. Each letter remembers one explicit choice (a flag) and answers it. Seal agents remember encounters: if the player exposes an agent fairly, the agent may switch sides later; if the player humiliates them, they hold a grudge (spec 12.19). Vesper escapes every confrontation until chapter 15.
- The Headland’s optional repair starts with a written reply from Vesper. At Lamp Quay the same heading has escaped into another print run. Vesper can sign the replacement or cover the turn where callers still arrive with old cards. Tavia keeps control over what the public notice can say about her. The Council still hears the larger case about Harrowmere and the Seal.
- **Recurring Fray.** The Hollow Archivist was a keeper that nobody checked. Its kind returns wherever records go unchecked, and it remembers the player.

## 7. The long mystery, setup and payoff

**The open loop:** Elsbet's letter (chapter 1) says something beyond the Nexus teaches people to stop asking. Players will assume it is Vesper. Leave that gap open: do not confirm or deny it before chapter 11.

**The paradigm shift (chapter 11):** years ago the Nexus published a confident, wrong label about the weir at Harrowmere, Vesper's home town: "This weir is safe in all floods." The caveat in the surveyor's draft ("tested only in a dry year") was cut before the label went up. The weir failed. Ise signed the label. Elsbet found out, and went to Vesper to understand, not to fight. "Something beyond the Nexus" was partly the Nexus's own habit of confident labels.

**Clues to plant before chapter 11** (each must be findable, never required):

| Chapter | Clue |
|---|---|
| 1 | Ise never says Elsbet's name first (subtext). Corvan's sign has a tiny gold stamp in one corner. Elsbet's vault index has one box: "Weir report, Harrowmere: last checked by - " with no name. |
| 2 | In the Nile Archive, an old Nexus label has a scraped line under the main text. Lumen cannot read it yet. |
| 4 | Vesper's letter uses a phrase only Ise uses ("Correct quietly"). |
| 7 | A reprint in the City of Copies drops a caveat; Lark the printer says, "The Nexus did the same once, they say." |
| 9 | After the public confrontation, Vesper leaves one line: "Ask Ise about Harrowmere." |
| 10 | Rook joins and says the Seal's first customer was "someone who used to wear your badge". |

**The payoff (chapter 15):** the brass lamp from the Undercroft (a Chekhov's prop) reveals the scraped caveat on the original Harrowmere label. The player chooses what the Guardians owe: expose Vesper, recruit Vesper back, change the Nexus with a public correction, or another defensible path. Every ending is valid if the reasons fit the evidence (spec OPEN-001). Elsbet's choice depends on the player's choice.

## 8. Motifs and Chekhov's props

- **Lamp light vs gold glow.** Warm amber means a shared check. Cold gold means flattering certainty. Use these colours consistently in art and lights.
- **"Last checked by ..."** Elsbet's phrase. It appears in her vault index, on Waystones, and on the final corrected label, with the player's name.
- **The music box tune** (Elsbet's). It plays in a major key at the start, in a minor key on harpsichord with Vesper, and in a full major key when the player sets the final correction.
- **The brass lamp** (left by the Hollow Archivist). Small, odd, and easy to forget. It is the key to the finale.
- **The door with no name.** The visible destination: the player sees it in the Nexus from the first hour. Chapter 2 opens it. Behind it, the corridor of worlds. At the end of the corridor is one more door, which opens only after chapter 15.
- **Mirrored scenes.** Chapter 1: the player writes their first true label. Chapter 15: the player corrects the oldest false label. Same bench, same tools, reversed task.

## 9. Structure, causality and pacing

- **But and therefore.** Each chapter's opening is caused by the last chapter's result (a correction opens the next door). Inside a chapter, each step must follow from the one before. Never "and then".
- **Episode rhythm** (spec 6.7): cold open (something happens on screen), hands on, climax, hook. A hook is a new question, a letter, or a surprise.
- **Nested hooks.** When a chapter quest ends, a mid-term mystery (the chapter's open thread) must be peaking and the long mystery (Vesper, Harrowmere) must be stirring.
- **Tonal contrast.** After every intense scene, give a quiet one: a hub visit, a comic side quest, a fair game, a song. Each chapter needs at least one funny moment.
- **Safe-harbour hubs.** The Nexus quarters and Emberford are home. Companions banter there, visitors react to the player's exhibits, and the stakes drop.
- **False peak.** After the chapter 9 programme revision, players can face Vesper in the foyer. Taking down or narrowing the cue can feel like a win. The other outcomes keep the disagreement visible. Vesper's parting line gives the player somewhere else to look.
- **Expanding horizon.** Chapter 15 ends with the last door opening on the wider network (the spec's later packs).

## 10. Choices, reactivity and the living world

- **Every chapter has at least one dilemma between two good values**, and each option has a real cost. No hidden right answer on contested matters.
- **Echoes** (spec 6.8): each chapter receives at least three Echoes from earlier chapters and sends at least three forward. An Echo names its cause.
- **Small acknowledgements.** People comment on the player's look, Knower role, keepsakes, recent wins and old choices (world memory lines). Add at least five per chapter.
- **Visible world state.** Lamps, repaired bridges, notices the player painted, exhibits the player hung. Progress must be visible on the map.
- **Tone choices.** In key dialogues offer humour, scepticism, empathy or pragmatism, even when the outcome is the same.
- **Companion banter.** Companions talk to each other, not only to the player: friendships, rivalries, inside jokes.
- **Earned vulnerability.** Every stern or comic character gets one quiet moment of doubt or kindness.

## 11. Iceberg depth

- **Surface:** the one-sentence goal and the chapter's local stake, clear to any player.
- **Hidden layers:** Lore codex, secrets, item text, the Undercroft index, letters, overheard lines.
- **Deliberate gaps:** leave some questions open on purpose (who cut the caveat? what did Elsbet agree with?). Players who piece it together first should feel that they own the answer.
- **Micro-stories:** short side moments with feeling: a toll-keeper blamed for a rule she did not choose, a cook with a superstition, a letter never sent.

## 12. Sound and look

- One art style: rich, colourful pixel art with light, the same scale and palette rules everywhere (see AGENTS.md).
- Each chapter has its own colour accent and its own music loop. A theme returns in changed form when its character or idea returns.
- Each task type has fitting sound: calm for thinking, bright for discovery, low for tension.

## 13. Checklist for any new scene or quest

1. Which chapter goal does it serve, and what causes it (but or therefore)?
2. What does a named person want here, and what do they risk?
3. Is there a real choice? Where does its Echo show later?
4. Which TOK idea is played (not told)?
5. Does a person speak in their own voice, in few words?
6. Is there one small acknowledgement of an earlier choice?
7. Does the art, colour and sound fit the style and the mood?
8. Does an object here matter in another place?
9. Which conflict type and size is it, how can the player end it (face, go around, leave), and what does it lead to? Add it to the conflict map (section 15).
10. Is there a light moment near a heavy one (a joke, a pun, a misunderstanding)?

## 14. Chapter plan

The chapters exist in code (see STATUS.md). This table adds what each one needs for the whole arc. "Stake" is the local, personal loss if the player fails, in one sentence. "Vesper" is the rival's beat, including where Vesper is right.

| Ch | Place | Stake (one sentence) | Vesper and the Seal | Companion beat | Hook out |
|---|---|---|---|---|---|
| 1 | Emberford, Nexus | If the market keeps believing the loudest voice, Corvan's 'ancient' blade sets the prices and the lamps stay dark. | Corvan's sign carries a tiny gold stamp, bought from a Seal agent. | Kip joins; Hesper and Sefa meet the player. | Elsbet's letter; the door with no name. |
| 2 | Nile Archive | If the dispatch repeats a king's boast as fact, the Nexus case teaches a battle that the records do not show. | First letter from Vesper. Vesper is right that the Nexus case already over-claims. | Lumen's Cottingley case (Lumen learns it is part of a story). | A scraped line under an old Nexus label. |
| 3 | Cold Store | If the gap in the file is hidden, a family loses its claim to an ancestor's name. | A Seal agent offers to stamp the heading 'complete'. | Sefa: a good story against a gap in the record. | The agent remembers how the player treated them. |
| 4 | Next Bell | If the forecast is too sure, the harbour does not evacuate in time. | Vesper: "They need yes or no, not a percentage." A fair point about how to tell people. | Kip's half-finished question costs time. | Vesper's letter uses Ise's phrase. |
| 5 | Living Forest | If the count is biased, the crews close the wrong route and the birds lose their crossing. | Vesper is right that the Guardians' first briefing was too sure. | Hesper wants to build a counter; it counts the wrong thing. | A sighting nobody can explain. |
| 6 | Metalworks | If the material call is wrong, a weak part goes into the ferry winch. | Seal-stamped ingots in the yard. | Hesper's loyalty mission: the family technique came from a traveller who got no credit. | The traveller's name on a docket. |
| 7 | City of Copies | If the missing Tuesday stays missing, readers lose a lending day and blame the hall. | A press prints 'Seal-certified' reprints that drop caveats. | Lark: "The Nexus did the same once, they say." | A copy that differs from its original. |
| 8 | Seagrass Steps | If the chart hides its blank, a skiff runs onto the shoal. | Vesper sells 'complete' charts. | Sefa's loyalty mission: local names against the survey. | A local name for a place the Nexus calls empty. |
| 9 | House of Performance | If the programme misleads, the audience leaves sure of something they did not see. | Optional face-to-face Showdown with Vesper after the revised programme. He asks for a cue the usher can say before the bell. | Companions disagree about what the audience saw. | A finished Showdown opens Vesper's lead to Harrowmere. |
| 10 | Market of Measures | If the basket is weighed in, households pay more for less. | Seal agents certify weights. Rook Tamsin quits the Seal and joins. | Rook and Sefa clash (testimony against source). | Rook: the Seal's first customer wore a Guardian badge. |
| 11 | Water Commons | If the drought plan hides its trade-off, one crew's fields fail. | The paradigm shift: the old Harrowmere weir label, signed by Ise. | Rook's loyalty mission: the false seal Rook stamped. | Ise asks the player to keep it quiet. |
| 12 | Civic Machine | If the dispatch rule stays, one district is never served. | A machine rule mirrors the Nexus's habit: confident and blind. | Ise, in subtext, defends quiet correction. | The player's choice about Ise's request echoes here. |
| 13 | Archive of Voices | If the remembered walk is filed as a record, a lantern opening is dated wrong. | Elsbet’s public take concedes a point to Vesper. Her second take has a different audience. | Kip's loyalty mission: the family story, with mixed evidence. | The signed listening index travels to Vesper at the Council. |
| 14 | Island of Models | If the plan fails, the island's harvest fair has no crates. | Vesper and the player must work together on one plan. | Banter: every companion has a different model. | Vesper agrees to come to the Council. |
| 15 | Council of Inquiry | If the old label stands, Harrowmere's loss is never owned. | The final choice: expose, recruit, change the Nexus, or another path. The brass lamp reveals the cut caveat. | All four companions prepare a practice handover for an open hearing. | The last door opens. |

## 15. Conflict map

In Emberford’s Tipped Cart, the driver needs names to follow up on a missing pot. Passing carters need an immediate warning about a loose stone. Sending the driver the full accounts leaves the stone without a public mark. Marking a public detour leaves the pot’s story at the clerk’s desk. The receipt on the lane rail changes when the Guardian redirects the report.


Mika asked for a wide variety of conflicts (2026-11-26): every type, every size, and different ways to end them. Conflicts must connect and build: each one moves the plot, a character's arc, or the theme forward. Misunderstandings, jokes and puns sit next to serious moments.

**Code.** Small and mid conflicts in the world are **crossings** (`src/domain/crossings.ts`, flag `cross.<id>`). Each has a way to face it, a way around it, and a way to leave it, with a resolution method, stakes, a cost, a tone and a `leadsTo` link. `tests/crossings.test.ts` checks that all eight types, all three scales and all tones are present. Big conflicts are the chapter quests, Showdowns, loyalty missions and the Council.

### The eight types, and how they end here

| Type | What it looks like here | Ways it can end (methods) | Stakes we use |
|---|---|---|---|
| Self | Doubt, fear, a wish to be chosen, a choice where every option hurts. | Epiphany, a personal choice, overcoming or giving in to a weakness, new information. | Your own voice; living with a choice; who you become. |
| Person | Rivals, stubborn people, friends who disagree, a goat. | Convince with evidence, compromise, agree to disagree, go separate ways, one side changes. | Trust, friendship, a plot goal. |
| Nature | Floods, warm rooms, geese, storms, tides. | Preparation, new knowledge, skill, coping, help from others. | Time, records, food, safety. |
| Society | Crowds, rules, institutions, two communities of knowers. | Educate, compromise, persuade, withdraw, both groups see more. | Trust in an institution; who fits the rules. |
| God | An **invented** patron of one fictional town (the Lady of Fair Measure). The conflict is with a person who claims to speak for the belief, never with the belief. | A better understanding of the belief; separating the questions; stepping back respectfully. | Faith used for profit; respect for belief. |
| Fate | An invented prophecy over an arch; a fortune-teller's card. | Learn where it came from, fulfil it in an unexpected way, embrace it, give in to it. | Being chosen against choosing. |
| Supernatural | Fray creatures (named errors); the drowned bell myth with three versions. | Learn how the unknown works, live with it, dismiss it. | A true warning missed or heard. |
| Technology | The tide engine, the furnace dial, the gate machine, the Civic Machine. | Learn to use it, check it against something fixed, change it, be beaten by it. | Dependence; who the machine leaves out. |

**Rules.** Never make a real religion's God or sacred figures an opponent. Use invented in-world patrons, myths and prophecies only, and treat real belief as a TOK lens with respect. Animals are never hurt. No crime: no theft, no betting. Every "leave it" way is valid: the world goes on and remembers.

### By chapter

Scale: **M** major, **m** mid, **s** small. Tone: serious, mixed, funny. "Ends" lists the ways open to the player.

| Ch | Conflict | Type | Scale | Tone | Ends | Builds to |
|---|---|---|---|---|---|---|
| 1 | Corvan's 'ancient' blade (Showdown) | Person, Society | M | mixed | expose, narrow, split, win over, lose ground | Vesper's first letter |
| 1 | The Fourth Corner | Person, Technology | s | quiet | fit two inserts and match the later repair order to the cord holes | Aro takes a cutting pattern for new cloth, or Junel carries a removable repair sample. |
| 1 | The tea table runner | Society, Person | s | neighbourly | trace a rumour and choose a reader for the next shift | For the east-well slip, pair Noa’s dated water leaves at the guild or put down Efua’s peg and carry the route to the family at the landing. The two readers can check different things. The runner can move each slip again. |
| 1 | The Copy That Came Back | Society, Person | s | quiet | beside the tea table, trace the stall’s return citation, then check the limited signed sightline and prepare a runner slip or a dated source packet | Kip stages one parcel pending a fresh lookout. Venn keeps the first report, the copy and its return with a separate blank line for a new observation. |
| 1 | Hesper’s visit | Person, Society | s | mixed | inspect the repair and arrival marks, then reserve one bell at the Nexus bench or send the drawer packet | The physical handover either uses Hesper’s demonstration or leaves the bench free and puts both records in the drawer. |
| 1 | The Step Across the Line | Person, Society | s | mixed | run a fixed four-beat phrase from each facing, then hang one lamp-side cue or two entrance cards | A shared cue needs Sella’s lead-in and frees a hook. Paired cards let late runners enter alone. The House uses the slip beside a moved lamp. |
| 1 | The Hollow Archivist (Undercroft) | Supernatural | M | serious | name each error | The brass lamp (ch 15) |
| 1 | The Lamb on the Ford Stone | Nature | s | mixed | face, around (pay marks), leave | The ballad |
| 1 | The Prophecy over the Arch | Fate, Supernatural | m | mixed | face (source), around (a hope), leave (believe it) | Madame Quandary (ch 9) |
| 1 | The Missing Word (toll notice) | Society, Person | s | mixed | three wordings; coin a word | Who chooses words has power |
| 1 | The Queue at Sill Bridge | Society, Person | m | mixed | check the pegs and the bell wheel; send one signed deputy, staff a public second turn or leave the claim for later | The matching recipient needs a different bell cue at the old ferry landing. |
| 1 | A Second Handle | Self, Person | s | mixed | carry together, mend in private, set the case down | Kip recalls when to offer help or share a setback in Emberford |
| 1 | Across the Missing Stroke | Person, Technology | s | mixed | bring the invitation to the front, put the editorial traces at the front, or leave both slips on the rail | A folio reaches Bea with the invitation, two readings and an address. |
| 1 and 13 | The Borrowed Straightedge | Person, Technology | s | quiet | bind two source tabs and later search by issue date and press work, or start with Wren’s spare tabs | The reader finds the signed issue and the current tool separately. The mender gets a working tray or a keeper’s check-out turn. |
| 1 | At the Door Before the Bell | Person, Society | s | mixed | follow a porch picture and a separate permission slip, then combine them or serve both approaches | Suri finds the desk or has to ask another visitor. The fold changes a later lantern-house delivery. |
| 1 and 4 | Three Cases at the Bell | Technology, Society | s | mixed | lift each possible drawer and choose a complete visiting copy or a quick checked dispatch at Marl Fold | The next weather crew sees all visits together or has a separate return date for missing checks. |
| 1 and 2 | The Shelf That Became a Wall | Nature, Society | s | mixed | walk the current annex and a reconstruction, then reopen the west gap or keep a staffed desk | The repairer or the borrower walks farther. Marek uses the revision peg to separate his old cart practice from today's permission. |
| 1 | Three Bands Through One Window | Technology, Person | s | quiet | keep the three practice readings fixed, try both renderings and choose who gets the first holder | Nell can follow the seam at the low drying rack. Venn can trace the pinholes at the window. The earned Webb working copy opens a choice of shape key or greyscale at the Study’s dim light. |
| 1 | The Repair Queue | Person, Society | m | mixed | pay for paired tickets and open the yard, carry a relay tray across the market, return the slate and keep appointments | Kip follows the handoff to its end. The Council can recall what the public kept and what stayed private. |
| 1 | The Cart Before the Bell | Person, Society | s | mixed | preserve either first view, open a closed witness slot and replay two checks, then post a direct pickup or send an escort | Edrin names where the reported stop came from. The next collector finds a crate through evidence they can use. |
| 1 | The Last Turn | Person, Society | s | quiet | lift the slate after the Showdown, compare the two workplaces’ customs, and hold one public speaking turn or open a dated intake | The buyers wait to hear Derva or leave with a referral. The Study shows where her own account reached the record. |
| 1 and 7 | The Colour That Stayed | Technology, Society | s | quiet | change the lamp on one strip, hold it steady across two custody checks, then carry the paired proof or leave it | The lending keeper offers a fixed-light comparison or a hatch that people can find from the outdoor path. |
| 1 | The Lantern Fair: Two Places to Stand | Society, Person | s | mixed | rehearse the ring or the trail from both stations, dispatch one tested plan, or leave the rehearsal open | The Island fair borrows the sketch and its limits. |
| 1 | A Bookmark in Three Volumes | Technology, Society | s | mixed | carry the named leaf or bring both methods on one source slip | Lark knows which exact library record and printed example the reference belongs to. |
| 1 | A Cup before the Bell | Person, Society | s | mixed | try both heating orders, serve the stock at once or in two rounds, or leave the kettle on its hook | Enna’s serving card changes who gets a cup and goes on to the Market. |
| 1 | The Back of the Bill | Person, Society | s | mixed | use Nell’s frame, unfold the loose crease, or leave the fragment | Bill 12 reaches Lark with what Kip and Sefa could see. |
| 1 | The Departure Strip | Person, Society | s | mixed | try the road and the stair, pin both approaches, address Wenna at her peg, or leave the trial open | Tova lends a strip. It puts a shared loan number beside two dated receipts at the Bell Archive. |
| 1 | The View from the Rope | Person, Technology | s | mixed | swing the box screen and try the short opening, or keep the load in place and walk to the side ledge | Merrit tries the view from the new route. An equipped photographic copy gives the old east road board a separate checked mark. |
| 1 | The Ribbon on the Wrong Rack | Society, Technology | s | mixed | compare the same loads through two weather shutters, then post a bounded shift slip or staff the side-by-side weather rail | Orla can reopen the count that serves her shift. A parcel gets its own arrival receipt, and an optional stamp trial gives a marked box a separate seal check. |
| 1 | When the Two Clocks Agree | Technology, Society | s | mixed | match a first cue and try a separate pace test on the same model, then post the appropriate record for a runner or keeper | The collected clock copy lets the player adjust a fresh study standard and give that reader a new checked reading. |
| 1 | A Name on the Load | Society, Technology | s | mixed | test who can read a claim at the hook and the table, then collect Tova’s queue receipt or Wenna’s drying-table receipt | An equipped carrier copy helps the Nexus keeper set a fresh approach and keep a signed or held-for-copy receipt. |
| 1 | A Plank on the Same Bank | Technology, Society | s | mixed | fold the three bank turns, unfold both route branches under each rule, then post the regular route or open the thin plank passage | The east rack retains a separate handoff for a shared crate route or an earlier light packet. |
| 1 | The Two Shutter Room | Technology, Society | s | quiet | check two marks, open a hidden hatch, trace a stalled beam and confirm both corrected settings. Fit the spare pin for a tray rest or a quiet seat, or leave the room. | Tavin and Merra each give a reply. The waiting group keeps its request. The desk can be fitted again after both groups have been heard. |
| 1 and 11 | The Pace of a Load | Person, Technology | s | quiet | carry four parcels under two pacing patterns with two recovery beats, then preserve the chosen pace for the Water Commons staffing trial | The first receipt earns a signed slip. Sena uses it to keep the local pace fixed and files a roster that either keeps the rinse worker or adds a half-route carrier. |
| 2 | The dispatch: a king's boast | Self, Society | M | serious | pair, print, read | Vesper is right that the case over-claims |
| 2 | The Date Through the Door | Person, Technology | s | quiet | fit two slips to the same packet and choose the public clip or staffed pickup | Sol can see the public dates and their limits, or a waiting reader can get the signed pair from Tull. |
| 2 | The Borrowed Translation | Person | s | funny | argue, go elsewhere, do without | Ambry's footnotes |
| 2 and 12 | The Spare Seat | Person, Society | s | quiet | test a blue peg against yesterday's handback and an unmarked current request, then hang a public rail or staff a check | Marek’s warrant leads the player to check who can reach each Canal Walk stop. One reader collects today and Lin files a follow-up for the other. |
| 2 | Two Circles on the Rail | Person, Technology | s | quiet | hold the carrier and reading copies against the same pins, then mount a handling copy, set a flat guide in the tray, or leave both at the rack | The carrier keeps both hands under the box, or the seated reader can follow the guide to Ketta’s case independently. |
| 2 | The Runner's Second Line | Person, Society | m | mixed | split the public docket, fold the receipt, leave the runner's form | Nellis remembers who could see the correction and when the packet arrived |
| 2 | The Corner That Moved | Person, Nature | s | mixed | clip the entrance guide, shelter it, leave the readings by the rack | Leila's witness strip carries a fixed starting place to the Metalworks |
| 2 | A Turn at the Workbench | Technology, Society | s | mixed | open the same cut in two toy builds, then offer a front pattern or carry both section records | The later reader sets the pattern or repeats the checked cut. A found difference stays tied to that band. |
| 2 | Changing One Opening, Set the Disk on Its Other Face, The Receipt That Still Holds | Technology, Society | s | mixed | test two practice sounds, set two faces in the mount or put named records in their own slots | A later reader checks the sound samples, follows Enheduanna’s named line or uses the scoped clearance for Namwran. |
| 2 | Three Earned Tools at the Old Bench | Technology, Society | s | mixed | compare a second tube with the carried sound, change the first view of the disk mount, or apply a dated clearance to two fictional accounts | Each equipped copy opens its own earlier fixture and leaves a new result on the bench. |
| 1 and later | What the Work Leaves | Person, Society | s | quiet | fit a dry footboard, arrange a different cue rest, or bring an index back to a loose order | Returning field deeds open different assistance for Tova, Ethren or a market reader. |
| 1 and 2 | The Call behind the Curtain | Person, Technology | s | mixed | repeat the same call at two listening marks, then fit a tick-board or pad the latch | Ethren can finish the carry and leaves a matching gift. Leila uses it on the Workmen’s Room rail without changing the old call. |
| 1 | The Press and the Keeper | Technology, Society | s | mixed | compare two example packets and two rules, then follow the checked source to the rail or staffed desk | Thessa gets a dated direction or a traceable excerpt. The Badge Annex keeps the keeper’s separate clip. |
| 3 | The gap in the file | Society, Self | M | serious | chapter response | The Seal agent remembers |
| 3 | The Warm Room | Nature, Self | m | serious | fix (Hesper), save letters, save counts, let the keeper choose | What survives shapes what is known |
| 3 | Both Faces at the Same Stop | Technology, Society | s | quiet | press two faces of a plain block at one stop, then set out an alignment rail or staff a fresh repeat | Aster leaves the matched traces and their stop where a visitor or trainee can use them. |
| 3 | Where the Slip Takes You (opens at Seagrass Steps) | Society, Person | s | mixed | compare local receipts, hang a two-place slip or a current ticket, or let the practice desk wait | A caller reaches the right desk via the older receipt or a direct instruction with a pull-out reference. |
| 3 | A Place for the Next Name | Person, Society | m | serious | put the source on the rail, offer a staffed check, leave the review open | The trainee gets private credit and the older display can accept new evidence |
| 3 | The Fold in the Gauge (opens in the Nexus) | Person, Society | s | mixed | leave the owner line open, return the checked tool, or arrange its owner's loan | Nima returns, the tool works again, and the Nexus closes the found entry |
| 3 | A Door in Two Lines | Person, Society | s | mixed | turn the writing rail, mount both forms, or give a reader a turn at the ramp | Pilar’s fold carries a separate place for a guide and a reply. |
| 3 | The Gap in the Backdrop | Person, Technology | s | mixed | test the cloth loose and on a backing, then lend it, send its edge traces or leave the jig open | Hari can inspect the actual material or its checked outline. |
| 3 | The First Bell at the Cold Store | Person, Society | s | quiet | try the cart with and without its handler, bring together two first-bell records, then post a limited opening | Tarin brings a cart through North at second bell or hands a parcel through West at first bell and leaves the cart with the relay. |
| 3 | The Space Between Stops | Person, Technology | s | quiet | check two practice pegs after an equal-arrow draft, then file a measured guide or the next recorded place | The carrier takes the nearer parcel at the west bench or the eastern reader files the documented place and leaves distance open. |
| 3 | What Reached the Far Bench | Technology, Society | s | mixed | fit both outlines, send the source sleeve or the two parcels, or leave the practice run open | Orsa can check the sources or hand over the parcels. Her receipt changes the notice in the Cold Store. |
| 3 and 2 | The Missing Face | Technology, Society | s | mixed | return to the first view after moving the glass, then send a broad rail or a hinged reading pocket | Both options earn the exact object. Marek can use its two views at one of the Map Room’s three matching fixtures and leave either a public pair or a staffed comparison. |
| 4 | Where the Needles Stop | Technology, Society | s | mixed | sweep the same dock markers with both detector ranges, then dispatch the wide strip for the first ramp bell or both strips for the later stair crew | Ruan’s receiving rail shows which practice ropes were set and what light comparisons remain open. |
| 4 | A Second Look at the Step | Technology, Nature | s | mixed | compare a practice peg in still air and in a gust, then change the receiving stand or follow the same marked position through another interval | Olwen or Ruan asks what a further check could show and keeps the measured strip. |
| 4 | The two names at the gauges | Person, Technology | s | quiet | fit the dated strip or walk both named places and prepare the map handover | The next crew has one comparison in reach or has a guide back to each source. The dispatch remains open. |
| 4 | The forecast and the correction catch | Nature, Society | M | serious | send the notice by signal or runner, repeat the gauge and lend one dated catch to the quay or steps | One crew can post a field check at its hook. The other can submit it through Ruan. The next Wallfoot reading stays open. Vesper uses Ise’s phrase. |
| 4 | The Narrow Line | Person, Society | m | mixed | replace a signed notice or turn the correction toward the closed approach and arrange a staffed shift | Tavia and the carried strip reopen the question at Lamp Quay. |
| 4 | The Tide Engine | Technology | m | mixed | reset (readings), post both, trust it | The furnace dial |
| 4 | The Shadow on the Handover | Nature, Technology | s | serious | compare both lamps, then leave a board or send the runner with a traced notch | The screen opens the service arch and supports a new check at the Council. |
| 4 | The Back of the Glass | Technology, Nature | s | mixed | flip a practice plate against fixed corners, check a control on two views, and keep the matched chart or the next watch | A visitor finds the same marks or a watcher can add another dated check. The working plate helps Marek register an older drawing. |
| 4 | The Name on the Back | Person, Society | s | mixed | match the two receipts, link the two drawer tabs, send the borrower to a keeper, or come back later | A borrower finds the wick receipt from either slip. Tova gets the working index tab or the keeper’s request, and the strip helps file it against the right entry. |
| 4 | When That View Was Taken | Person, Technology | s | mixed | lead with today’s direction or give the landmark and stair instruction separate places | A carrier takes the stone steps. The posted result shows how the carrier found the correct route and keeps the old frame dated. |
| 4 | A Window in the Record | Technology, Society | s | mixed | test two frames and lamp positions, compare a window sketch with separate sightings, then mount the trace or picture or wait | A pilot gets the whole route or a clerk sees the full-size sketch. The receipt directs the other reader to the staffed copy. |
| 4 | A Lid with Two Names | Technology, Society | s | mixed | inspect case and body separately, then keep a joint view or send the loan record with a staffed retrieval link | Mayle compares both numbers or takes the loan slot now. The quay keeps each number with its source. |
| 4 | The Line That Stayed | Technology, Society | s | mixed | check three reference benches, then post a local observation or arrange a separately checked repeat | Loen preserves the open interpretation. Equipped objects disclose a new fixed-point, trace or independent-source check at an earlier site. |
| 4 | One Arm and Two Place Plates | Technology, Society | s | mixed | read the same simulated arm position on both place plates, carry the quay reading or post the pair, or leave the readings on file | The receiving copy keeps its place scale and stays tied to the checked arm position when someone tests again. |
| 4 | Past the Roof Line | Nature, Society | s | quiet | trace the same paths against two model skylines, carry a portable quay trace or a paired headland sheet, or leave | Readers can repeat the roof observation or compare both skyline effects. The accession and date of the Timbuktu copy travel with either preparation. |
| 4 | Where the Two Sights Meet | Nature, Technology, Society | s | quiet | trace the same practice lamp from two posts, fit a low dock lamp or a guided Fold rail, then equip the working copy to test a changed view | A carrier can use the dock mark alone or follow the two strips with a guide. The return shutter keeps the lost sight and sets a next-bell rack or another valid view from the side. |
| 5 | The biased count | Self, Nature | M | serious | chapter response | A sighting nobody explains |
| 5 and 9 | Two Hands on the Sheet | Person, Technology | s | quiet | watch from two working places, move the recorder, preserve the first gap and prepare Ayla’s next sheet | The equipped notebook keeps the stage caller’s cue separate from the person who sees the cloth rise. Hari can keep a gallery helper or ask the caller to move and wait. |
| 5 | The Empty Hook | Person, Society | s | quiet | check the slate from both sides, then carry signed accounts to the bench, hang a direction at the rail, or leave the slips on the bench. Cabinet experience adds a fold for both readers. | Tirren asks for Sorell’s account or follows the new direction. The next carrier can find the exact slip used. |
| 5 | A Room for Two Dates | Person, Technology | s | mixed | set a cradle, mask or measure, then take a practice copy to Lio, file a check with Nemi, or leave the frame open | A bridge visitor can repeat the check, or a record reader can trace it to the exact source. The return hook shows which use was made. |
| 5 | The Geese on the Path | Nature | s | funny | watch, wade, turn back | Observer effect |
| 5 | The Creek Keeps Its Own Time | Nature | m | mixed | check both banks and open the north rail, mark the sheltered cart bend, or let Ayla’s crew take the usual round | The next watch can check both banks. The Council files the crossing that the player actually used. |
| 5 | The Edge of the Page | Nature, Society | s | mixed | bind the view limits or the crew handovers first and follow the resulting trail | Elian’s field notebook carries the method to Water Commons |
| 5 | The Silent Slot | Technology, Nature | s | mixed | replay both runner orders, fit a source clip, place a reversible pending marker or handover ledger | Water Commons checks whether two messengers bring two sources |
| 5 | A Corner for Two | Person, Nature | s | mixed | check the footing, pass the lead handle or rest both ends, then call the clear corner with Ayla | Both carries earn the Bridge Partner badge. Mina can ask another keeper to help in the City of Copies. |
| 5 | Room at the Sill | Nature, Self | s | quiet | watch the reed hollow from two marked heights, then wait one stone back | The Stiltfrog keeps the sill free and can show the player where to look for an upper rim at Shoal Shelf. |
| 6 and 1 | The Warm Side | Technology, Person | s | quiet | compare body and short contact readings under matched pulses, then post counter service or a padded carrier | Bea keeps the selected receipt, and Enna’s earlier landing uses the equipped copy in cooler air with a new wait. |
| 6 | The material call | Technology, Self | M | serious | chapter response | Hesper's loyalty mission |
| 6 | The Rim That Slipped | Technology, Person | s | neighbourly | retry the same tray with two supports, check the earlier docket and fit a low receiving peg or a staffed cradle | Corra can serve the small carriers early or Bea can free a wider tray at her bell. Each receipt keeps the blue practice run and the older grey run on their own dates. |
| 6 and 1 | The Parts You Can Replace | Technology, Person | s | mixed | take a practice blank to a real fitting lane, repeat on the other support or leave, then fit a reusable bench or separate support in Emberford | Nesta requires evidence of an actual use. Hesper keeps a lane for the next worker and leaves the conditions on the parts that can travel. |
| 6 | A Line That Travels | Person, Technology | s | mixed | take a single reference through the narrow testing lane, align the shared supports and take the wide lane, or leave the model at the shop | Noll keeps the tested layout in the Sample Yard. The exact source stays in the hall with its own reply. |
| 6 | The Name on the Outside | Person, Society | s | mixed | keep the address and witness on one sleeve, send them to different desks, or leave the witness line open | The next carrier can deliver a record without taking over the fitter’s job. |
| 6 | The Sleeves That Come Back | Society, Technology | s | mixed | reuse clean sleeves locally, sort at one stand, leave the counts open | The next shift finds four usable sleeves and two awaiting repair with a single count |
| 6 | The Second Turn | Person, Society | m | mixed | set both turns on one model, switch speaking stands, hear a listener, sign one full turn or two short turns | Bea and Ressa carry both cases on one minute. The checked wording prompts a different question at North Steps. |
| 6 | The Furnace Dial | Technology, Person | s | mixed | tin test, ask about colour, leave | The gate machine |
| 6 | The Traveller's Quench (Hesper) | Self, Person | m | serious | sign, private, find Imre's family | Hesper's epilogue |
| 6 | The Other Face of the Plate | Technology, Society | s | mixed | turn the sample on its hinge, check the paper copy, lend the plate or send two face prints | Bea’s frame lets the Council check the delivery. The next yard learner can handle the plate whenever it is home. |
| 6 | The Mark Beneath the Lip | Technology, Person | s | serious | move a fitting from lamp to plate, turn it at the fixed stop, then send an outline or paired views | The Commons can mark a visible feature promptly or check its own hidden locator later. |
| 7 and 9 | What the Gold Says | Society, Person | s | quiet | compare adornment and commissioning beside the same museum folio, then face one context toward visitors | A reader at the low rail can lift both tabs without waiting. Hari keeps both contexts present at the staffed desk and leaves the original commissioner unnamed. |
| 7 | The missing Tuesday | Society | M | serious | chapter response | Lark: "The Nexus did the same" |
| 7 | Two Calls After Tuesday | Person, Technology | m | mixed | carry the Metalworks minute, run two proofs, check the changed approaches and retest both responses before fitting one | The Landing gets a wider board or staffed pocket. A separate return check at the archive shows which reader received the evidence. |
| 7 | The Reader Across the Landing | Person, Technology | s | mixed | try a second way of reading each setup, take one to the low landing board, or leave both in the workroom | Vara and Kori use and keep the selected arrangement. Each case carries its own reply when revisited. |
| 7 | The Same Red | Technology, Society | s | mixed | pull two matching impressions, check the hand-added line, send the class pair or the outer table’s later hour | A reader uses the selected fictional proof. The other request keeps its own place. |
| 7 | The Second Imprint | Technology, Society | s | mixed | pull the same view at different ink charges, send one checked copy to the counter or several to the drawer | A runner carries one checked picture to the queue. The drawer can keep the tested views beside the collection image. |
| 7 | The Witness Clip | Person, Society | s | quiet | clip two dated forms, a gloss and limited testimony, then put the witness or gloss first | The binder can retrieve either wrapper from a dated slot. The reader at the rail can find the first written page. |
| 7 | Two Dates for One Object and The Volume and the Proof | Technology, Society | s | mixed | collect two documentary tabs or change a piece of practice type, then send a short guide or keep the longer evidence at the press | The reader receives a guide with the checked period and gift or the checked accession, edition and printing method. |
| 7 and 2 | The Third Landmark | Technology, Society | s | quiet | slide and turn the practice sheet, compare two spans under the same control marks and choose the landing or press handover | Mina fits a short guide. Lark keeps the two scales and the differently placed far turn. An earned copy lets Marek test a changed third mark and fit a shorter guide or a separate reading frame in the Nile Archive. |
| 2 and 7 | The Bend That Stayed | Technology, Person | s | quiet | load and lift two modern strips at matched stops, leave a checked practice card, then check a used strip and two fresh setups at the Landing | Marek gives space to the seated reader or the runner. Mina keeps a worn starting mark with either checked service plan. A short stand helps during load. The far tray saves moving the wide bundle. The player can leave either board without a plan. |
| 7 | The Crowd at the Press | Society | m | serious | read the ledger, invite three, shut the doors | Osk keeps checking |
| 7 | The Crooked Margin | Technology, Society | m | mixed | compare both proofs, then fold the full order, send linked strips, or let the crew call turns | Lark hints at an earlier missing limit. The Council receives the actual landing outcome. |
| 7 | A Lane for the Frame | Person, Society | m | mixed | check the local turn, use the cart or signal a badge-backed partner, then help a reader | The cart carries the frame to a low stool and uses overflow space. The partner carry briefly closes a usable lane and leaves a higher frame with a loose-page service. |
| 7 | The Back of the Bill: Lark’s Proof | Society, Technology | s | mixed | match the press proof and the signed division, or leave the proof at the press | The checked copy shows Hari what the player checked. |
| 1 → 7 | The Line a Reader Can Follow → A Sunset on the Proof | Society, Technology | s | mixed | build a full citation, leave it with a claim or give the reader a location to trace, then use Dace’s comb to repair Lark’s proof | Dace sees how the reader found A606881. Lark’s runner carries the Full Sheet and spare, or the group checks NG524 and the gallery account at the Record Room table. |
| 7 | Where the Welcome Goes: The Shared Bench | Society, Person | s | mixed | hang a low invitation, give the two lines to a host, or leave the bench as it is | The Market clerk can use the checked two-part welcome slip. |
| 7 | Which Part of the Letter Travels? | Person, Society | s | mixed | send the short wrapper to a moving runner or keep both readings open at the staffed desk, then bring back the signed reply | The reader can act and still find the source. Each equipped copy repairs a different correspondence detail at the earlier Nexus stand. |
| 8 | The chart's blank | Nature, Society | M | serious | chapter response | Local names |
| 8 | The Bell under the Water | Supernatural | m | mixed | listen, write in the margin, dismiss | A myth that carries a fact |
| 8 | The Paper Landing | Supernatural, Technology | s | mixed | peg before turning, turn before pegging, or reset the cutouts | A clearly labelled fictional paper play supplies a reading method for the Cold Store’s separate practice receipts. |
| 8 | The Thread at the Bend | Person, Technology | s | quiet | keep Ariadne’s fixed start, try both loads and retie after a stop, then roll the envelope-only or tray guide | The first crew can use its checked route. The other load keeps its later turn. The practice cord remains available. |
| 8 | The Rim above the Reeds | Nature, Person | s | quiet | verify the guide’s dry rim or check Sora’s staff before walking the south planks | The high frame shows the join. The low frame makes room for two and shows the sheltered run. Both leave the reeds alone. |
| 8 and 4 | The Reply from Shore | Society, Technology | s | mixed | check the two ends of a chart, cue or issue record and carry the loan to an upper lookout or a lower receiver | The east pier marks the actual use and keeps what the receiving point still cannot show. The early watch can change which reply it displays. |
| 8 | One Clip Before the Bell | Nature, Technology | s | mixed | test one thread order in still air and a gust, then send an early clip to Sora, leave both in Renna’s late tray, or leave the cord unthreaded | Work can start at the bell before the reference or detail arrives. A complete late dispatch keeps both pieces together. Each reader keeps a checked copy for the specific object. |
| 8 | Which Edge Reached the Landing | Person, Society | s | quiet | compare two leaves for an exact record, then carry a working strip to Halen or both leaves to Clio | A checked reference stays with the person who can use it. The other stop can point readers back to the same public record. |
| 8 | The Address for the Question | Person, Society | s | quiet | separate the two dated public records from the teacher’s request to copy the designs, then leave a walk-up locator or book Clio’s help | The rail makes both records available immediately. Clio can explain who made and who presented them. The question about copying stays with the community. |
| 8 | A Shore You Can Turn | Person, Technology | s | quiet | turn a practice block and move the separate offshore peg, then leave a fixed starting mark or arrange a keeper’s demonstration | Kunit’s coast piece keeps its own maker, exchange date and archive reference. The equipped working copy opens a second choice about who can turn the practice block. |
| 8 and 13 | The Other Half of the Copy | Person, Technology | s | quiet | lift the rubbing and account, check a one-leaf delivery, then pair both or match the tabs at separate stations | Eren’s bench has both leaves in reach or a courier can take the account while the rubbing stays available. Kunit’s role and Holm’s published account stay distinct. |
| 8 | Two Dates at a Peg | Person, Technology | s | quiet | check two date-peg positions, carry the paired guide to Irven, take the pocket guide to Mireth, or leave the bench open | Irven can show both dated pictures at once. Mireth can carry one picture under the dock cover and uses its reverse to recover the other source. Both readers keep the exact records. |
| 8 and 12 | The Beside Date | Person, Technology | s | quiet | lift two date faces, carry an open object guide or a narrow event line, or leave the folio at the bench | Eneth and Caren sign for different uses of one record. Elwen files their receipt in a different Civic tray, where the other date stays recoverable. |
| 9 | One Line Before the Bell (optional foyer Showdown) | Person, Society | M | serious | step away or reach one of five Showdown outcomes | Vesper's lead to Harrowmere opens after the Showdown |
| 9 | The Call at the Side Bench | Person, Society | s | mixed | check the hidden move, give Hari a spoken cue, clip a cue that needs passing, or keep looking | A different bench receives the checked cue. The spoken call reaches the back before the line. The slip preserves the quiet start and takes longer to reach a reader. |
| 9 | Madame Quandary's Card | Fate, Self | s | funny | ask how often, fail on purpose, worry | Before the Curtain |
| 9 | Before the Curtain | Self | s | mixed | speak, read cards, pass to a companion | Courage while unsure |
| 9 | The Third Fold | Person, Technology | s | mixed | hold the open rail, agree a staffed folio, or keep the test at the table | The foyer keeps the late readers' check. A dated proof travels to the Island. |
| 9 | The First Frame | Person, Technology | s | mixed | shoot from both positions, screen both orders, post one or leave it at the stand | Delwen goes to the gallery rail or the foyer route post. His marked strip opens a separate route decision at Slate Harbour. |
| 9 | The Back of the Bill: The Usher’s Rack | Society, Person | s | mixed | hang the price at the door with a separate split, hang both at the bench, or let Hari wait | A visitor gets a checked answer and the next shift can use the rack. |
| 9 | The Edge That Stayed | Person, Technology | s | mixed | compare the far view with the exposed edge, then hang it for the scene or leave it at the low bench | The audience can see the recorded gap. Pilar receives a checked receipt and the loan returns. |
| 9 | The Prop Room jobs | Person, Technology | s | quiet | move a loom shuttle, align door views, shift a lamp, or compare a cloth receipt and its traces, then choose a gallery handoff | The rehearsal rail, scenery rack, usher or research bench keeps a different working result. The stage props are fictional and refer to separate Baule, Zanzibar, Duala and interior hanging records. |
| 9 | The Story Archive | Person, Society | s | quiet | try both caption layouts for a museum record, choose a reader’s place and return with the relevant sources | The Gallery keeps a portable locator or a two-source reading spread for the Luba board. The tricycle caption leads with Shinichi’s name or with the dated custody record. Both keep Nobuo’s publicly reported remembrance with its own source. |
| 7 and 9 | The Script Cabinet | Person, Society | s | quiet | turn the practice fold, compare the passing rail and the seated rest, then install a cue-first or catalogue-first view. The Cabinet can wait. | A gallery reader finds a voice or follows its accession. The exact working copy opens a second retrieval line in the City’s older index. |
| 9 | The Joinery Bay and Trace Gallery | Person, Technology | s | quiet | align two projected features or capture two windows in a fictional trace, then choose a quick rail copy, a fuller bench copy, or leave | Ten different slips stay where a reader can use them in the adjoining Prop Room. A finished vessel slip can take the earlier bowl tracing as a second check on apparent materials. |
| 10 | The weighed-in basket | Society, Person | M | serious | chapter response | Rook joins |
| 10 to 12 | Before the Next Count | Person, Society | s | quiet | pin the quoted lot letters or put a fresh-weigh ticket at the next crate | The Water Commons runner receives a dated instruction or blank tally. Reading it earns a title and makes Ade’s related slip available after the two Civic registers are combined. |
| 10 and 1 | The Price That Travels | Person, Society | s | mixed | put a limited comparison on the offer rail, send an independently checked use to the staffed pocket, or leave the tray open | An equipped loan gives Hana’s buyer a readable offer or a separate checked receipt by the south path. |
| 10 | Three Goods, Two Bells | Society, Person | m | mixed | seal one basket for two dated quotes, reserve its contents or take reviewable credit, then collect at Emberford | Oduya holds an exact basket. Corvan offers a flexible fill with a later, capped review. Each counter keeps its own receipt. |
| 10 | The Lady of Fair Measure | God (invented), Society | m | serious | ask the keeper, test beside it, step back | Harrowmere (a claim sold as sacred certainty) |
| 10 | The Goat Who Was Certain | Nature, Person | s | funny | chase, follow the slips, let it eat | Memory fills gaps |
| 10 | Where the Welcome Goes: The Resting Place | Society, Person | s | mixed | move the mat to the rail, keep it covered and give a guide the strip, or let the work wait | A guest can find a seat during the count and the clerk still protects the tally. |
| 10 | The Cups on the Rain Shelf | Society | s | mixed | keep the two counts with the carrier, mark the pending cups at the table, or wait | Dagny can check which cups went with the first carrier and who can find the second pair. |
| 10 | The Sample Shed jobs | Person, Technology | s | quiet | try two meshes, check a hidden base, compare covered and uncovered vessels, or track a fleck in matched tubes | A different cook, carrier, repair learner or keeper can use each choice outside the shed. The Chokwe-style basket, Kuba-style bowl, Zulu pot and Ganda straw give each job its own checked reference. |
| 10 | The Packing Loft and Exchange Bench | Person, Technology | s | quiet | turn two spans against an aperture or move a tally strip between registers, then choose a quick handoff, a sourced comparison, or leave | Ten different slips stay where handlers can check a clearance or resolve a count in the Sample Shed. Both receiving choices keep the object’s source. |
| 10 | Source, or Story? (hearth) | Person (friends) | s | funny | four tones | Rook and Sefa's truce |
| 11 | The drought plan | Society, Self | M | serious | chapter response | The Harrowmere card |
| 11 | The Night Surge | Nature, Self | M | serious | open, half open (gauge), keep shut | Harrowmere: a flood choice made long ago |
| 11 | Room in the Relief Basin | Nature, Technology | m | mixed | rehearse two pulse sizes, widen the rows or the lower channel, keep the other request | Ade sees the unmet request beside the installed Water Commons plan |
| 11–12 | The Material Stores | Person, Technology | s | quiet | pull swatches, tilt loads, trace handover dockets or turn a lamp, then place one of two working copies | Council Yard or Lower Channel readers can use the prepared copy. The equipped object gives Canal Walk a separate correction to check and keep. |
| 11 | The Bell Behind the Reeds | Nature, Society | s | mixed | find a same-bell view or a dated handover, leave local notes or pair the readings | The crew can follow the notebook’s return track and check the next reading |
| 11 | Three Messengers | Technology, Society | s | mixed | track the originating checks through two orders, post a bank signal or keep the council docket | The next crew can see the open check and the two earlier observers |
| 11 | The Commons’ Reading Bench | Technology, Society | s | mixed | fit the west board’s outer arrow or align a reference and shift the east bench’s locator | A trainee checks the new mark. The other request stays on the waiting hook. |
| 11 | The Place and the Bell | Nature, Technology | s | mixed | hold a place across two model bells, compare two places at one bell, or return the reference | Aven keeps the method with the finding. Each earned copy can add a different check to the Fold’s wet-day rail. |
| 11 | Below the Gauge | Nature, Society | s | mixed | trace two readings to a hidden culvert, check both pocket settings, then post and test one of two crossing notices | One crew crosses sooner or both banks gain a watch after a wait. The signed copy lets Canal Walk try a related handover. |
| 11 | Ise's confession | Self, Person | M | serious | quiet, open, herself | Letters 11 and 12; epilogue |
| 11 | The Clean Well (Rook) | Self, Society | m | serious | public, quiet, the family | Rook's epilogue |
| 12 | The dispatch rule | Technology, Society | M | serious | chapter response | Ise defends quiet correction |
| 12 | The Callboard Turn | Person, Society | s | mixed | send a view and source together or open with the view and arrange a later stop | Neris reads the same object in two layouts. With a signed Lantern House folio, Orella opens a short passage and Neris reaches the other desk from a new approach. |
| 12 | Who Takes the Next Turn | Society, Person | s | mixed | try both local schedules, reserve the rack for a full trace or call two quick copies | A local reader can check what a mark counts. Lin retains a separate time for work still due. |
| 12 | Three Boxes for a Name | Technology, Society | m | serious | rewrite the rule, write by hand, leave | Who designs the boxes |
| 12 | A Place Beyond the Steps | Technology, Society | s | mixed | try both ramp placements, back the school families or the late-shift crew, keep a reachable-time request open | A place count and a route together show who can attend |
| 12 | The Second Delivery | Society, Person | m | mixed | carry sealed objections, guarantee staffed collection or send the early cart, hear an appeal or keep it open | Sena opens a permit gate for the second delivery. Ade can publish two separate handovers and keep the claimants’ names sealed. |
| 12 | Ready by the Bell | Technology, Society | m | mixed | post a target, trace two bells under each rule and fit the received pairs | The Island’s kept tally names what was counted. The crew can keep its early hook rack or collect complete kits together. |
| 13 | The remembered walk | Self, Society | M | serious | chapter response | Where Elsbet went |
| 13 | A Cue Beyond the Door | Technology, Society | s | mixed | keep one cue order and change the service noise, then fit a live indicator at Glass Walk or a timing strip at the House | Eren’s indicator has visible marks for covered sounds. Hari keeps the time strip where a side-seat reader can check it. |
| 13 | What the Receiver Can Repeat | Technology, Society | s | mixed | set a front pattern at Lamp Quay or reopen both marked cuts on the Glass Walk | The installed copy has a visible result. Its reference stays with it and its specimen copy is earned here. |
| 13 | The Second Take | Person, Society | m | serious | wind both takes, then keep the public passage at the desk or copy it to the waiting bench | Elsbet’s index lets the player show Vesper who each passage was for. |
| 13 | Two Friends, One Walk | Person (friends) | s | funny | find the ledger, record both, leave | Both partly right |
| 13 | The Lamp We Owe | God (invented promise), Society | m | mixed | staff the quay bench, bring the welcome indoors, hand over to the morning keeper | The Council's review of what a rule and a promise can each do |
| 13 | The Bench at the Turning | Person, Society | s | mixed | read the guide and work instruction, then carry the mat along the public passage or accept Eren’s escort for that job | A visitor gets a dry seat. Pilar receives a receipt that keeps the public route and one authorised carry distinct. |
| 13 | The Edge of the Record | Society | s | serious | open with Article 5 or Tecumseh’s challenge, then choose where to post the separately checked records | Civic readers keep a treaty declaration, a request and a decision tied to their own records |
| 13 | The Famous Ancestor (Kip) | Self | m | mixed | proud, not, mixed | Kip's epilogue |
| 14 | Two Cards, One Cart Job and A Sleeve with Room for a Name | Society, Technology | s | mixed | compare the two ways a record can be counted or measured, then deliver to the dock, use the staffed stand or leave the work open | A checked record opens a cart slot or gives a loader a sleeve while a name stays open. |
| 14 | The island plan with Vesper | Person, Nature | M | mixed | chapter response | Vesper comes to the Council |
| 13 | The Other End of OPEN | Person, Society | m | mixed | verify an earlier correction or two local records, reopen the Proof Room, replace the incoming copy or staff the dead end | Vesper’s part in the old print stays visible. A caller uses the checked route and the recall continues. |
| 14 | When to Launch | Society, Nature | m | mixed | test both, launch when both agree, leave | Two communities of knowers |
| 14 | The Two Supports | Technology, Person | s | quiet | move the same packet on two supports, then check a centred rack delivery or a two-person ledge transfer | The workshop can keep its draft sheets flat or the dock can keep the outside shelf ready for a side delivery. |
| 14 | A Frame at the Dock | Society, Technology | s | mixed | install the clipped rail, agree staffed turns, or leave the trials on file | Carriers shape a new waiting cue or basket hook after the dock check. |
| 14 | The Held Count | Person, Society | s | mixed | compare two movement phrases and a blocked sightline, stage one shared cue or a separate practice cue, or leave | Rella’s copy changes the rehearsal rail in the workshop without changing the delivery model. |
| 14 | The Lantern Fair: An Answer at the Bend | Society, Nature | s | mixed | fit the welcome under the shelter, carry the answer along the landward trail, or leave the lamps on the rack | The loading crew keeps its turn and a place in the celebration. |
| 14 | Joss’s Skiff | Nature, Society | m | mixed | rehearse the same load and crew at two bells, steer to the stair or step-free ramp, or return to the dock | Actual cargo reaches a different receiver. The course record keeps the weather and crew, and the south delivery uses the shared cart. |
| 14 | The Water That Comes Back and A Smaller Inlet | Technology, Society | m | mixed | compare a fixed inlet at the Archive, then use its strip or a local starting card to retest for Ivo | The Island uses fresh readings to open a rain-garden path or the powered tide-plate passage. One attendant covers the choice. |
| 14 | A Slip for Both Berths | Technology, Society | s | mixed | use two kinds of evidence strip to prepare the dock copy, then open walk-up copies, staff the reading bench or leave the hooks empty | One bay opens. A crew or a reader acts on the dispatch. The Quiet Margin rack carries those berth rows or the bench pointer. |
| 15 | The Council: what do the Guardians owe? | Self, Person, Society | M | serious | correct, recruit, expose, both (or "Not yet") | Afterwards |
| 15 | The Handover Before the Bell | Person, Society | s | mixed | use an earlier proof or a fresh packet, then post the pair or staff the relay | The next hearing and the crew's epilogue |
| 12 and 15 | The Place Left Open | Person, Society | s | quiet | keep the empty invitation, check Ione’s shift, call both again, then hold a public hearing or file a signed witness pocket | North Steps keeps the public minutes and a further question. Canal Walk keeps the approved dissent and the next reply time. |
| 15 | Eleven at the Council | Technology, Society | s | mixed | check the delivered plate or its prints, then open the early rail or staff a fitting bench | The visitor takes a checked diagram or a fitting. The yard receives the loan back with its signed record. |
| 15 | The Pointer and Its Shadow | Technology, Society | s | serious | compare actual movement with a change in light, then post the notch or staff the rail | The next carrier can check the cue while handling a load. |
| 15 | The Second Reading Store | Technology, Society | s | mixed | operate two case-specific settings, carry a checked loan, and hang the reproducible record on the fast rail or keep the practice model at the staffed table | Olwen’s Bell Archive shows the separate follow-up for the equipped object. Each handover keeps its limit with the result. |
| 15 | The Cart Finds Its Centre | Technology, Society | s | mixed | compare two axle positions under the same fictional load, set a cart for the low bench or the staffed rail, then equip the working copy to recheck a changed load | Hale keeps a tray that opens between shifts or Essi keeps time for a group comparison. The changed load stays on a checked axle stop or a nearer strap ring at its own rack. |
| 10 and 15 | Two Objects, One Number | Technology, Society | s | mixed | follow two object records from the short number to the full reference, then witness a case release and a separate call | Two crews find their own cases. A later caller or waiting keeper can check a source they previously shared by mistake. |
| Coda | Room for the Next Check | Society, Self | s | mixed | open both pieces with local tools or a carried method, then leave a public notice or a keeper’s copy | The next visitor can work a new bundle while the current display stays on the wall or bench |

**Gaps to fill next:** Seal agents who remember the player in chapters 6 and 7, a weather or creature crossing in chapter 15, and a technology crossing that uses the Civic Machine itself.

## 16. The 150 story elements

Mika's list of 150 story elements is adapted to this game in [STORY_ELEMENTS.md](STORY_ELEMENTS.md), with a mark for each (in the game, partly, planned). Check it when you plan new content.
