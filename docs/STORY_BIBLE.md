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
| 1 | The Hollow Archivist (Undercroft) | Supernatural | M | serious | name each error | The brass lamp (ch 15) |
| 1 | The Lamb on the Ford Stone | Nature | s | mixed | face, around (pay marks), leave | The ballad |
| 1 | The Prophecy over the Arch | Fate, Supernatural | m | mixed | face (source), around (a hope), leave (believe it) | Madame Quandary (ch 9) |
| 1 | The Missing Word (toll notice) | Society, Person | s | mixed | three wordings; coin a word | Who chooses words has power |
| 1 | A Second Handle | Self, Person | s | mixed | carry together, mend in private, set the case down | Kip recalls when to offer help or share a setback in Emberford |
| 1 | Across the Missing Stroke | Person, Technology | s | mixed | bring the invitation to the front, put the editorial traces at the front, or leave both slips on the rail | A folio reaches Bea with the invitation, two readings and an address. |
| 1 and 13 | The Borrowed Straightedge | Person, Technology | s | quiet | bind two source tabs and later search by issue date and press work, or start with Wren’s spare tabs | The reader finds the signed issue and the current tool separately. The mender gets a working tray or a keeper’s check-out turn. |
| 1 | At the Door Before the Bell | Person, Society | s | mixed | follow a porch picture and a separate permission slip, then combine them or serve both approaches | Suri finds the desk or has to ask another visitor. The fold changes a later lantern-house delivery. |
| 1 and 4 | Three Cases at the Bell | Technology, Society | s | mixed | lift each possible drawer and choose a complete visiting copy or a quick checked dispatch at Marl Fold | The next weather crew sees all visits together or has a separate return date for missing checks. |
| 1 and 2 | The Shelf That Became a Wall | Nature, Society | s | mixed | walk the current annex and a reconstruction, then reopen the west gap or keep a staffed desk | The repairer or the borrower walks farther. Marek uses the revision peg to separate his old cart practice from today's permission. |
| 1 | The Repair Queue | Person, Society | m | mixed | pay for paired tickets and open the yard, carry a relay tray across the market, return the slate and keep appointments | Kip follows the handoff to its end. The Council can recall what the public kept and what stayed private. |
| 1 | The Lantern Fair: Two Places to Stand | Society, Person | s | mixed | rehearse the ring or the trail from both stations, dispatch one tested plan, or leave the rehearsal open | The Island fair borrows the sketch and its limits. |
| 1 | A Bookmark in Three Volumes | Technology, Society | s | mixed | carry the named leaf or bring both methods on one source slip | Lark knows which exact library record and printed example the reference belongs to. |
| 1 | A Cup before the Bell | Person, Society | s | mixed | try both heating orders, serve the stock at once or in two rounds, or leave the kettle on its hook | Enna’s serving card changes who gets a cup and goes on to the Market. |
| 1 | The Back of the Bill | Person, Society | s | mixed | use Nell’s frame, unfold the loose crease, or leave the fragment | Bill 12 reaches Lark with what Kip and Sefa could see. |
| 1 | The Departure Strip | Person, Society | s | mixed | try the road and the stair, pin both approaches, address Wenna at her peg, or leave the trial open | Tova lends a strip. It puts a shared loan number beside two dated receipts at the Bell Archive. |
| 2 | The dispatch: a king's boast | Self, Society | M | serious | pair, print, read | Vesper is right that the case over-claims |
| 2 | The Borrowed Translation | Person | s | funny | argue, go elsewhere, do without | Ambry's footnotes |
| 2 | The Runner's Second Line | Person, Society | m | mixed | split the public docket, fold the receipt, leave the runner's form | Nellis remembers who could see the correction and when the packet arrived |
| 2 | The Corner That Moved | Person, Nature | s | mixed | clip the entrance guide, shelter it, leave the readings by the rack | Leila's witness strip carries a fixed starting place to the Metalworks |
| 3 | The gap in the file | Society, Self | M | serious | chapter response | The Seal agent remembers |
| 3 | The Warm Room | Nature, Self | m | serious | fix (Hesper), save letters, save counts, let the keeper choose | What survives shapes what is known |
| 3 | Where the Slip Takes You (opens at Seagrass Steps) | Society, Person | s | mixed | compare local receipts, hang a two-place slip or a current ticket, or let the practice desk wait | A caller reaches the right desk via the older receipt or a direct instruction with a pull-out reference. |
| 3 | A Place for the Next Name | Person, Society | m | serious | put the source on the rail, offer a staffed check, leave the review open | The trainee gets private credit and the older display can accept new evidence |
| 3 | The Fold in the Gauge (opens in the Nexus) | Person, Society | s | mixed | leave the owner line open, return the checked tool, or arrange its owner's loan | Nima returns, the tool works again, and the Nexus closes the found entry |
| 3 | A Door in Two Lines | Person, Society | s | mixed | turn the writing rail, mount both forms, or give a reader a turn at the ramp | Pilar’s fold carries a separate place for a guide and a reply. |
| 3 | The Gap in the Backdrop | Person, Technology | s | mixed | test the cloth loose and on a backing, then lend it, send its edge traces or leave the jig open | Hari can inspect the actual material or its checked outline. |
| 3 | What Reached the Far Bench | Technology, Society | s | mixed | fit both outlines, send the source sleeve or the two parcels, or leave the practice run open | Orsa can check the sources or hand over the parcels. Her receipt changes the notice in the Cold Store. |
| 4 | The forecast: how sure to say it | Self, Society | M | serious | signal, runner | Vesper uses Ise's phrase |
| 4 | The Narrow Line | Person, Society | m | mixed | replace a signed notice or turn the correction toward the closed approach and arrange a staffed shift | Tavia and the carried strip reopen the question at Lamp Quay. |
| 4 | The Tide Engine | Technology | m | mixed | reset (readings), post both, trust it | The furnace dial |
| 4 | The Shadow on the Handover | Nature, Technology | s | serious | compare both lamps, then leave a board or send the runner with a traced notch | The screen opens the service arch and supports a new check at the Council. |
| 4 | The Name on the Back | Person, Society | s | mixed | match the two receipts, link the two drawer tabs, send the borrower to a keeper, or come back later | A borrower finds the wick receipt from either slip. Tova gets the working index tab or the keeper’s request, and the strip helps file it against the right entry. |
| 4 | When That View Was Taken | Person, Technology | s | mixed | lead with today’s direction or give the landmark and stair instruction separate places | A carrier takes the stone steps. The posted result shows how the carrier found the correct route and keeps the old frame dated. |
| 5 | The biased count | Self, Nature | M | serious | chapter response | A sighting nobody explains |
| 5 | A Room for Two Dates | Person, Technology | s | mixed | set a cradle, mask or measure, then take a practice copy to Lio, file a check with Nemi, or leave the frame open | A bridge visitor can repeat the check, or a record reader can trace it to the exact source. The return hook shows which use was made. |
| 5 | The Geese on the Path | Nature | s | funny | watch, wade, turn back | Observer effect |
| 5 | The Creek Keeps Its Own Time | Nature | m | mixed | check both banks and open the north rail, mark the sheltered cart bend, or let Ayla’s crew take the usual round | The next watch can check both banks. The Council files the crossing that the player actually used. |
| 5 | The Edge of the Page | Nature, Society | s | mixed | bind the view limits or the crew handovers first and follow the resulting trail | Elian’s field notebook carries the method to Water Commons |
| 5 | The Silent Slot | Technology, Nature | s | mixed | replay both runner orders, fit a source clip, place a reversible pending marker or handover ledger | Water Commons checks whether two messengers bring two sources |
| 5 | A Corner for Two | Person, Nature | s | mixed | check the footing, pass the lead handle or rest both ends, then call the clear corner with Ayla | Both carries earn the Bridge Partner badge. Mina can ask another keeper to help in the City of Copies. |
| 5 | Room at the Sill | Nature, Self | s | quiet | watch the reed hollow from two marked heights, then wait one stone back | The Stiltfrog keeps the sill free and can show the player where to look for an upper rim at Shoal Shelf. |
| 6 | The material call | Technology, Self | M | serious | chapter response | Hesper's loyalty mission |
| 6 | The Name on the Outside | Person, Society | s | mixed | keep the address and witness on one sleeve, send them to different desks, or leave the witness line open | The next carrier can deliver a record without taking over the fitter’s job. |
| 6 | The Sleeves That Come Back | Society, Technology | s | mixed | reuse clean sleeves locally, sort at one stand, leave the counts open | The next shift finds four usable sleeves and two awaiting repair with a single count |
| 6 | The Second Turn | Person, Society | m | mixed | set both turns on one model, switch speaking stands, hear a listener, sign one full turn or two short turns | Bea and Ressa carry both cases on one minute. The checked wording prompts a different question at North Steps. |
| 6 | The Furnace Dial | Technology, Person | s | mixed | tin test, ask about colour, leave | The gate machine |
| 6 | The Traveller's Quench (Hesper) | Self, Person | m | serious | sign, private, find Imre's family | Hesper's epilogue |
| 6 | The Other Face of the Plate | Technology, Society | s | mixed | turn the sample on its hinge, check the paper copy, lend the plate or send two face prints | Bea’s frame lets the Council check the delivery. The next yard learner can handle the plate whenever it is home. |
| 6 | The Mark Beneath the Lip | Technology, Person | s | serious | move a fitting from lamp to plate, turn it at the fixed stop, then send an outline or paired views | The Commons can mark a visible feature promptly or check its own hidden locator later. |
| 7 | The missing Tuesday | Society | M | serious | chapter response | Lark: "The Nexus did the same" |
| 7 | The Same Red | Technology, Society | s | mixed | pull two matching impressions, check the hand-added line, send the class pair or the outer table’s later hour | A reader uses the selected fictional proof. The other request keeps its own place. |
| 7 | The Crowd at the Press | Society | m | serious | read the ledger, invite three, shut the doors | Osk keeps checking |
| 7 | The Crooked Margin | Technology, Society | m | mixed | compare both proofs, then fold the full order, send linked strips, or let the crew call turns | Lark hints at an earlier missing limit. The Council receives the actual landing outcome. |
| 7 | A Lane for the Frame | Person, Society | m | mixed | check the local turn, use the cart or signal a badge-backed partner, then help a reader | The cart carries the frame to a low stool and uses overflow space. The partner carry briefly closes a usable lane and leaves a higher frame with a loose-page service. |
| 7 | The Back of the Bill: Lark’s Proof | Society, Technology | s | mixed | match the press proof and the signed division, or leave the proof at the press | The checked copy shows Hari what the player checked. |
| 1 → 7 | The Line a Reader Can Follow → A Sunset on the Proof | Society, Technology | s | mixed | build a full citation, leave it with a claim or give the reader a location to trace, then use Dace’s comb to repair Lark’s proof | Dace sees how the reader found A606881. Lark’s runner carries the Full Sheet and spare, or the group checks NG524 and the gallery account at the Record Room table. |
| 7 | Where the Welcome Goes: The Shared Bench | Society, Person | s | mixed | hang a low invitation, give the two lines to a host, or leave the bench as it is | The Market clerk can use the checked two-part welcome slip. |
| 8 | The chart's blank | Nature, Society | M | serious | chapter response | Local names |
| 8 | The Bell under the Water | Supernatural | m | mixed | listen, write in the margin, dismiss | A myth that carries a fact |
| 8 | The Paper Landing | Supernatural, Technology | s | mixed | peg before turning, turn before pegging, or reset the cutouts | A clearly labelled fictional paper play supplies a reading method for the Cold Store’s separate practice receipts. |
| 8 | The Rim above the Reeds | Nature, Person | s | quiet | verify the guide’s dry rim or check Sora’s staff before walking the south planks | The high frame shows the join. The low frame makes room for two and shows the sheltered run. Both leave the reeds alone. |
| 8 | One Clip Before the Bell | Nature, Technology | s | mixed | test one thread order in still air and a gust, then send an early clip to Sora, leave both in Renna’s late tray, or leave the cord unthreaded | Work can start at the bell before the reference or detail arrives. A complete late dispatch keeps both pieces together. Each reader keeps a checked copy for the specific object. |
| 8 | Two Dates at a Peg | Person, Technology | s | quiet | check two date-peg positions, carry the paired guide to Irven, take the pocket guide to Mireth, or leave the bench open | Irven can show both dated pictures at once. Mireth can carry one picture under the dock cover and uses its reverse to recover the other source. Both readers keep the exact records. |
| 9 | One Line Before the Bell (optional foyer Showdown) | Person, Society | M | serious | step away or reach one of five Showdown outcomes | Vesper's lead to Harrowmere opens after the Showdown |
| 9 | Madame Quandary's Card | Fate, Self | s | funny | ask how often, fail on purpose, worry | Before the Curtain |
| 9 | Before the Curtain | Self | s | mixed | speak, read cards, pass to a companion | Courage while unsure |
| 9 | The Third Fold | Person, Technology | s | mixed | hold the open rail, agree a staffed folio, or keep the test at the table | The foyer keeps the late readers' check. A dated proof travels to the Island. |
| 9 | The First Frame | Person, Technology | s | mixed | shoot from both positions, screen both orders, post one or leave it at the stand | Delwen goes to the gallery rail or the foyer route post. His marked strip opens a separate route decision at Slate Harbour. |
| 9 | The Back of the Bill: The Usher’s Rack | Society, Person | s | mixed | hang the price at the door with a separate split, hang both at the bench, or let Hari wait | A visitor gets a checked answer and the next shift can use the rack. |
| 9 | The Edge That Stayed | Person, Technology | s | mixed | compare the far view with the exposed edge, then hang it for the scene or leave it at the low bench | The audience can see the recorded gap. Pilar receives a checked receipt and the loan returns. |
| 9 | The Prop Room jobs | Person, Technology | s | quiet | move a loom shuttle, align door views, shift a lamp, or compare a cloth receipt and its traces, then choose a gallery handoff | The rehearsal rail, scenery rack, usher or research bench keeps a different working result. The stage props are fictional and refer to separate Baule, Zanzibar, Duala and interior hanging records. |
| 10 | The weighed-in basket | Society, Person | M | serious | chapter response | Rook joins |
| 10 | Three Goods, Two Bells | Society, Person | m | mixed | seal one basket for two dated quotes, reserve its contents or take reviewable credit, then collect at Emberford | Oduya holds an exact basket. Corvan offers a flexible fill with a later, capped review. Each counter keeps its own receipt. |
| 10 | The Lady of Fair Measure | God (invented), Society | m | serious | ask the keeper, test beside it, step back | Harrowmere (a claim sold as sacred certainty) |
| 10 | The Goat Who Was Certain | Nature, Person | s | funny | chase, follow the slips, let it eat | Memory fills gaps |
| 10 | Where the Welcome Goes: The Resting Place | Society, Person | s | mixed | move the mat to the rail, keep it covered and give a guide the strip, or let the work wait | A guest can find a seat during the count and the clerk still protects the tally. |
| 10 | The Cups on the Rain Shelf | Society | s | mixed | keep the two counts with the carrier, mark the pending cups at the table, or wait | Dagny can check which cups went with the first carrier and who can find the second pair. |
| 10 | The Sample Shed jobs | Person, Technology | s | quiet | try two meshes, check a hidden base, compare covered and uncovered vessels, or track a fleck in matched tubes | A different cook, carrier, repair learner or keeper can use each choice outside the shed. The Chokwe-style basket, Kuba-style bowl, Zulu pot and Ganda straw give each job its own checked reference. |
| 10 | Source, or Story? (hearth) | Person (friends) | s | funny | four tones | Rook and Sefa's truce |
| 11 | The drought plan | Society, Self | M | serious | chapter response | The Harrowmere card |
| 11 | The Night Surge | Nature, Self | M | serious | open, half open (gauge), keep shut | Harrowmere: a flood choice made long ago |
| 11 | Room in the Relief Basin | Nature, Technology | m | mixed | rehearse two pulse sizes, widen the rows or the lower channel, keep the other request | Ade sees the unmet request beside the installed Water Commons plan |
| 11 | The Bell Behind the Reeds | Nature, Society | s | mixed | find a same-bell view or a dated handover, leave local notes or pair the readings | The crew can follow the notebook’s return track and check the next reading |
| 11 | Three Messengers | Technology, Society | s | mixed | track the originating checks through two orders, post a bank signal or keep the council docket | The next crew can see the open check and the two earlier observers |
| 11 | The Commons’ Reading Bench | Technology, Society | s | mixed | fit the west board’s outer arrow or align a reference and shift the east bench’s locator | A trainee checks the new mark. The other request stays on the waiting hook. |
| 11 | Ise's confession | Self, Person | M | serious | quiet, open, herself | Letters 11 and 12; epilogue |
| 11 | The Clean Well (Rook) | Self, Society | m | serious | public, quiet, the family | Rook's epilogue |
| 12 | The dispatch rule | Technology, Society | M | serious | chapter response | Ise defends quiet correction |
| 12 | Who Takes the Next Turn | Society, Person | s | mixed | try both local schedules, reserve the rack for a full trace or call two quick copies | A local reader can check what a mark counts. Lin retains a separate time for work still due. |
| 12 | Three Boxes for a Name | Technology, Society | m | serious | rewrite the rule, write by hand, leave | Who designs the boxes |
| 12 | A Place Beyond the Steps | Technology, Society | s | mixed | try both ramp placements, back the school families or the late-shift crew, keep a reachable-time request open | A place count and a route together show who can attend |
| 12 | The Second Delivery | Society, Person | m | mixed | carry sealed objections, guarantee staffed collection or send the early cart, hear an appeal or keep it open | Sena opens a permit gate for the second delivery. Ade can publish two separate handovers and keep the claimants’ names sealed. |
| 12 | Ready by the Bell | Technology, Society | m | mixed | post a target, trace two bells under each rule and fit the received pairs | The Island’s kept tally names what was counted. The crew can keep its early hook rack or collect complete kits together. |
| 13 | The remembered walk | Self, Society | M | serious | chapter response | Where Elsbet went |
| 13 | The Second Take | Person, Society | m | serious | wind both takes, then keep the public passage at the desk or copy it to the waiting bench | Elsbet’s index lets the player show Vesper who each passage was for. |
| 13 | Two Friends, One Walk | Person (friends) | s | funny | find the ledger, record both, leave | Both partly right |
| 13 | The Lamp We Owe | God (invented promise), Society | m | mixed | staff the quay bench, bring the welcome indoors, hand over to the morning keeper | The Council's review of what a rule and a promise can each do |
| 13 | The Bench at the Turning | Person, Society | s | mixed | read the guide and work instruction, then carry the mat along the public passage or accept Eren’s escort for that job | A visitor gets a dry seat. Pilar receives a receipt that keeps the public route and one authorised carry distinct. |
| 13 | The Edge of the Record | Society | s | serious | open with Article 5 or Tecumseh’s challenge, then choose where to post the separately checked records | Civic readers keep a treaty declaration, a request and a decision tied to their own records |
| 13 | The Famous Ancestor (Kip) | Self | m | mixed | proud, not, mixed | Kip's epilogue |
| 14 | The island plan with Vesper | Person, Nature | M | mixed | chapter response | Vesper comes to the Council |
| 13 | The Other End of OPEN | Person, Society | m | mixed | verify an earlier correction or two local records, reopen the Proof Room, replace the incoming copy or staff the dead end | Vesper’s part in the old print stays visible. A caller uses the checked route and the recall continues. |
| 14 | When to Launch | Society, Nature | m | mixed | test both, launch when both agree, leave | Two communities of knowers |
| 14 | A Frame at the Dock | Society, Technology | s | mixed | install the clipped rail, agree staffed turns, or leave the trials on file | Carriers shape a new waiting cue or basket hook after the dock check. |
| 14 | The Held Count | Person, Society | s | mixed | compare two movement phrases and a blocked sightline, stage one shared cue or a separate practice cue, or leave | Rella’s copy changes the rehearsal rail in the workshop without changing the delivery model. |
| 14 | The Lantern Fair: An Answer at the Bend | Society, Nature | s | mixed | fit the welcome under the shelter, carry the answer along the landward trail, or leave the lamps on the rack | The loading crew keeps its turn and a place in the celebration. |
| 14 | Joss’s Skiff | Nature, Society | m | mixed | rehearse the same load and crew at two bells, steer to the stair or step-free ramp, or return to the dock | Actual cargo reaches a different receiver. The course record keeps the weather and crew, and the south delivery uses the shared cart. |
| 14 | The Water That Comes Back and A Smaller Inlet | Technology, Society | m | mixed | compare a fixed inlet at the Archive, then use its strip or a local starting card to retest for Ivo | The Island uses fresh readings to open a rain-garden path or the powered tide-plate passage. One attendant covers the choice. |
| 14 | A Slip for Both Berths | Technology, Society | s | mixed | use two kinds of evidence strip to prepare the dock copy, then open walk-up copies, staff the reading bench or leave the hooks empty | One bay opens. A crew or a reader acts on the dispatch. The Quiet Margin rack carries those berth rows or the bench pointer. |
| 15 | The Council: what do the Guardians owe? | Self, Person, Society | M | serious | correct, recruit, expose, both (or "Not yet") | Afterwards |
| 15 | The Handover Before the Bell | Person, Society | s | mixed | use an earlier proof or a fresh packet, then post the pair or staff the relay | The next hearing and the crew's epilogue |
| 15 | Eleven at the Council | Technology, Society | s | mixed | check the delivered plate or its prints, then open the early rail or staff a fitting bench | The visitor takes a checked diagram or a fitting. The yard receives the loan back with its signed record. |
| 15 | The Pointer and Its Shadow | Technology, Society | s | serious | compare actual movement with a change in light, then post the notch or staff the rail | The next carrier can check the cue while handling a load. |
| 10 and 15 | Two Objects, One Number | Technology, Society | s | mixed | follow two object records from the short number to the full reference, then witness a case release and a separate call | Two crews find their own cases. A later caller or waiting keeper can check a source they previously shared by mistake. |
| Coda | Room for the Next Check | Society, Self | s | mixed | open both pieces with local tools or a carried method, then leave a public notice or a keeper’s copy | The next visitor can work a new bundle while the current display stays on the wall or bench |

**Gaps to fill next:** Seal agents who remember the player in chapters 6 and 7, a weather or creature crossing in chapter 15, and a technology crossing that uses the Civic Machine itself.

## 16. The 150 story elements

Mika's list of 150 story elements is adapted to this game in [STORY_ELEMENTS.md](STORY_ELEMENTS.md), with a mark for each (in the game, partly, planned). Check it when you plan new content.
