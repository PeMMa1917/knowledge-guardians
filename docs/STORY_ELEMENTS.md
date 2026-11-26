# Story elements in Knowledge Guardians

This tracker maps every numbered story element in the supplied *Universal RPG Blueprint* to the campaign. Each example is a place, action or consequence that can be found in the current build, or a stated gap linked to its nearest authored material. The [game systems and player preferences](GAME_ELEMENTS.md) have a separate tracker.

| Status | Meaning | Story elements |
| --- | --- | ---: |
| ✓ Playable | At least one authored scene demonstrates the core adapted idea. | 129 |
| ◐ Partial | The story uses the idea in limited form. The remaining work is named. | 19 |
| ○ Planned | The corresponding scene or system is open. | 1 |
| ✗ Excluded | The original aspect is outside the classroom design. | 1 |

These are examples, not a measure of whether every player will find, enjoy or interpret them the same way. The story uses argument, investigation and material checks as challenges. Relationships are platonic. In-world myths and patrons are fictional. See the [story bible](STORY_BIBLE.md) for the conflict map and [learning design](LEARNING_DESIGN.md) for timed route estimates.

## I. Hook and opening (1 to 10)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 1 | Play at once | The cold open is playable: the glowing label, the visitors, a choice about the notebook (`cold.open`). | ✓ | [opening-notebook.test.ts](../tests/opening-notebook.test.ts), [m01-nexus.json](../src/content/m01-nexus.json) |
| 2 | One-sentence premise | The player follows Elsbet’s missing evidence and learns what a Guardian owes the people who act on a public claim. | ✓ | [STORY_BIBLE.md](STORY_BIBLE.md), [story.json](../src/content/story.json) |
| 3 | Early emotional anchor | Kip hesitates over his first carry, and Hollis needs a safe way to reach the lamb at the ford. Both make an early choice about how to help. | ✓ | [opening-handle.test.ts](../tests/opening-handle.test.ts), [story.json](../src/content/story.json), [crossings.ts](../src/domain/crossings.ts) |
| 4 | Micro-decision at once | The notebook choice in the cold open; Ise's first question, "Why are you here?" (`why.came`). | ✓ | [opening-notebook.test.ts](../tests/opening-notebook.test.ts), [m01-nexus.json](../src/content/m01-nexus.json) |
| 5 | Mystery on the horizon | The player sees the locked door in the Nexus and later follows the prerequisites that open it. | ✓ | [nile.test.ts](../tests/nile.test.ts), [nexus.ts](../src/maps/nexus.ts) |
| 6 | Personal stakes first | Corvan’s claim affects the price people pay. At the Water Commons the allocation leaves a crew with work they must delay. | ✓ | [m02-aethelgard.json](../src/content/m02-aethelgard.json), [m12-water.json](../src/content/m12-water.json) |
| 7 | Short exposition | Ise: "Do not listen to me yet. Look at that label." | ✓ | [m01-nexus.json](../src/content/m01-nexus.json) |
| 8 | Clear inciting incident | The lamps go dark; Elsbet's letter. | ✓ | [story.json](../src/content/story.json), [story.test.ts](../tests/story.test.ts) |
| 9 | Clear first goals | The quest panel, "At stake:", the brass compass. | ✓ | [ui.ts](../src/ui/ui.ts), [WorldScene.ts](../src/scenes/WorldScene.ts) |
| 10 | Promise of change | Knower roles, the Lens and Insight give the recruit more ways to check a claim as the story advances. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [roles.ts](../src/domain/roles.ts), [talents.ts](../src/domain/talents.ts) |

## II. Agency and choice (11 to 20)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 11 | Dilemmas between two goods | Water allocation, the Civic timetable and the night surge show costs on both sides of a defensible choice. | ✓ | [water-story.test.ts](../tests/water-story.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [crossings.ts](../src/domain/crossings.ts) |
| 12 | Non-violent paths | The whole game. Showdowns are arguments; Fray creatures are errors you name. | ✓ | [AGENTS.md](../AGENTS.md), [showdown.ts](../src/domain/showdown.ts) |
| 13 | Fail forward | No game over. Lost Showdowns branch; crossings have a way to leave it, and the world goes on. | ✓ | [playthrough.test.ts](../tests/playthrough.test.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 14 | Tone choices | Rook's first talk; hearth talks (joke, hard question, kind word, plain words). | ✓ | [rook.json](../src/content/rook.json), [hearth.ts](../src/domain/hearth.ts) |
| 15 | Delayed ripples | Vesper's letters, Echo lines, epilogue vignettes and ballad verses. Council gallery objects reflect choices at the Emberford repair queue, Living Forest creek, City of Copies press and Archive of Voices quay. | ✓ | [echoes.test.ts](../tests/echoes.test.ts), [council.ts](../src/maps/council.ts), [communityLetters.ts](../src/domain/communityLetters.ts) |
| 16 | Instant reactions | A queue choice changes who waits and what the next worker reads. A Forest bank choice opens a different walkable route. | ✓ | [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 17 | Respect refusal | Players can leave optional crossings. At the last lamp and the Council, a pause or refusal leaves the world available. | ✓ | [voices-last-lamp.test.ts](../tests/voices-last-lamp.test.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 18 | Many keys to one lock | Crossings open with knowledge (an objective), a companion, marks, or patience. | ✓ | [crossings.ts](../src/domain/crossings.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 19 | Honest option text | Loyalty and repair queue choices state the requested action and visible cost before selection. | ✓ | [loyalty.test.ts](../tests/loyalty.test.ts), [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts) |
| 20 | Warn before no return | The Council choice says it cannot be changed, and offers "Not yet". | ✓ | [vesper.json](../src/content/vesper.json), [council-team.test.ts](../tests/council-team.test.ts) |

## III. The player (21 to 30)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 21 | Any archetype fits | Five modeled play styles use the shared opening and select different detours. This is a design sample of available routes. A route for every possible archetype has not been demonstrated. | ◐ | [learningPaths.ts](../src/domain/learningPaths.ts), [learning.test.ts](../tests/learning.test.ts) |
| 22 | Personal tie to the plot | The recruit follows Elsbet’s keepsakes into her study. Afterwards recalls the same label bench through the player’s final decision. | ✓ | [story.json](../src/content/story.json), [epilogue.ts](../src/domain/epilogue.ts) |
| 23 | Background is noticed | Origin and Knower role choices change available lines and approaches. | ✓ | [origins.json](../src/content/origins.json), [roles.ts](../src/domain/roles.ts), [player.test.ts](../tests/player.test.ts) |
| 24 | Skill is recognised | Awards, titles, ledger rows, the ballad. | ✓ | [ballad.ts](../src/domain/ballad.ts), [permanent.ts](../src/domain/permanent.ts), [ledger.ts](../src/domain/ledger.ts) |
| 25 | Vulnerability | Kip doubts his first carry in A Second Handle. Before the Curtain and Madame Quandary let players act despite uncertainty. | ✓ | [crossings.ts](../src/domain/crossings.ts), [opening-handle.test.ts](../tests/opening-handle.test.ts) |
| 26 | Your own reason | Ise asks why you came: curious, a friend, duty, or to repair a wrong. The last words answer it. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [epilogue.ts](../src/domain/epilogue.ts) |
| 27 | Act in big scenes | Players choose moves in a public Showdown and decide the Council conclusion. | ✓ | [playthrough.test.ts](../tests/playthrough.test.ts), [council-team.test.ts](../tests/council-team.test.ts) |
| 28 | Growth in story and play | Lamps lit, Lens views and talents grow with the story; Lumen learns to say "my guess". | ✓ | [story.test.ts](../tests/story.test.ts), [talents.ts](../src/domain/talents.ts) |
| 29 | Journal in a voice | Read the story account, character letters and the player’s heard conversations in the Journal. Most mission instructions use a plain voice. | ◐ | [ui.ts](../src/ui/ui.ts), [letters.ts](../src/domain/letters.ts) |
| 30 | Earned names | Titles from awards; names from the ballad ("the Plain-Sung") and from crossings ("of the Long Way Round"). | ✓ | [ballad.ts](../src/domain/ballad.ts), [epilogue.ts](../src/domain/epilogue.ts) |

## IV. Companions and people (31 to 40)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 31 | Companions with own goals | Loyalty missions give companions their own reasons, mistakes and later responses. Rook can join after a conversation about earlier work. | ✓ | [loyalty.ts](../src/domain/loyalty.ts), [rook.json](../src/content/rook.json) |
| 32 | Banter | Companion lines while walking; hearth talks where companions talk to each other. | ✓ | [WorldScene.ts](../src/scenes/WorldScene.ts), [hearth.ts](../src/domain/hearth.ts) |
| 33 | Friction with respect | A song and a source can lead two companions to different obligations in hearth dialogue. | ✓ | [hearth.ts](../src/domain/hearth.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 34 | Companion arcs | Each companion loyalty case includes a slip, a repair and an ethical choice. Signature abilities remain open. | ◐ | [loyalty.test.ts](../tests/loyalty.test.ts), [loyalty.ts](../src/domain/loyalty.ts) |
| 35 | Found family | Hearth talks, "The Last Hearth". | ✓ | [hearth.ts](../src/domain/hearth.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 36 | Opt-in romance | The school story uses optional friendship, mentorship and found family. Romance is outside the design. | ✗ | [AGENTS.md](../AGENTS.md), [loyalty.ts](../src/domain/loyalty.ts) |
| 37 | Memorable townsfolk | Dov, Juno, Tova, Wynn and the chapter workers have roles and specific views the player can encounter. | ✓ | [fieldgames.ts](../src/domain/fieldgames.ts), [chapter-voices.json](../src/content/chapter-voices.json) |
| 38 | Mascot ally | Lumen; Lorelings. | ✓ | [lorelings.ts](../src/domain/lorelings.ts), [lumen.test.ts](../tests/lumen.test.ts) |
| 39 | Everyone uses their talent | At the Council, Hesper clips the packet, Sefa makes the call, Kip checks what reached the far bench and Rook brings in the independent docket. | ✓ | [council-team.test.ts](../tests/council-team.test.ts), [m16-council.json](../src/content/m16-council.json) |
| 40 | Trust through moments | Approval comes from inquiry moves and shared scenes, not gifts. | ✓ | [approval.ts](../src/domain/approval.ts), [loyalty.test.ts](../tests/loyalty.test.ts) |

## V. Antagonists (41 to 50)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 41 | A rival with a reason | Vesper: Harrowmere was hurt by a confident Nexus label. | ✓ | [harrowmere.json](../src/content/harrowmere.json), [vesper.json](../src/content/vesper.json) |
| 42 | The rival appears often | Letters recur across chapters, Nellis carries a disputed record and Vesper appears in the House and Council. Broader recurring Seal agents remain open. | ◐ | [letters.ts](../src/domain/letters.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [performance-vesper.test.ts](../tests/performance-vesper.test.ts) |
| 43 | Tiered gallery | Corvan, the Hollow Archivist and Vesper test different ways of challenging a story. A similarly structured adversary in every chapter remains open. | ◐ | [undercroft.ts](../src/domain/undercroft.ts), [playthrough.test.ts](../tests/playthrough.test.ts), [performance-vesper.test.ts](../tests/performance-vesper.test.ts) |
| 44 | A growing rival | Vesper acknowledges changes in the player’s decisions. There is no mechanical rivalry that grows with the player’s skill. | ◐ | [letters.ts](../src/domain/letters.ts), [letters.test.ts](../tests/letters.test.ts), [performance-vesper.test.ts](../tests/performance-vesper.test.ts) |
| 45 | Nature and society too | Crossings: floods, geese, machines, crowds, rules. | ✓ | [crossings.ts](../src/domain/crossings.ts), [water-story.test.ts](../tests/water-story.test.ts) |
| 46 | Presence | Vesper has a distinct look and dialogue. The recurring tune changes arrangement during the encounter. | ✓ | [vesper.json](../src/content/vesper.json), [storyMotifs.ts](../src/domain/storyMotifs.ts) |
| 47 | Arguing with the rival | Vesper's letters make a fair point; the Council lets you answer. | ✓ | [performance-vesper.test.ts](../tests/performance-vesper.test.ts), [vesper.json](../src/content/vesper.json) |
| 48 | Fair clues | Corvan’s stamp and the scraped Nile label point toward Harrowmere. Elsbet’s two takes and signed listening index supply a traceable lead the player can bring to the Council. | ✓ | [performance-vesper.test.ts](../tests/performance-vesper.test.ts), [harrowmere.json](../src/content/harrowmere.json), [voices-elsbet.json](../src/content/voices-elsbet.json), [vesper.json](../src/content/vesper.json) |
| 49 | Redemption | Rook leaves the Seal; Vesper can be recruited; Brindle and Osk change. | ✓ | [rook.json](../src/content/rook.json), [vesper.json](../src/content/vesper.json), [epilogue.ts](../src/domain/epilogue.ts) |
| 50 | A satisfying climax | The Council offers an expose ending that closes the Seal and shows the remaining cost of that choice. | ✓ | [vesper.json](../src/content/vesper.json), [epilogue.ts](../src/domain/epilogue.ts) |

## VI. World (51 to 60)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 51 | Wordless storytelling | The flood post marks, the gold stamp on Corvan's sign, the scraped label. | ✓ | [emberford.ts](../src/maps/emberford.ts), [nile.ts](../src/maps/nile.ts), [opening-print.test.ts](../tests/opening-print.test.ts) |
| 52 | Distinct cultures | Quay crews count lamps, clerks use signed opening dates, shore and deck readers name landmarks by different practices. The response keeps those differences visible. | ✓ | [voices-story.test.ts](../tests/voices-story.test.ts), [cartographers-side.test.ts](../tests/cartographers-side.test.ts), [forest-reader.test.ts](../tests/forest-reader.test.ts) |
| 53 | Daily routines | Forest watches, crew handoffs and a few epilogue routines connect evidence to work and time. Whole-town schedules remain open. | ◐ | [crossings.ts](../src/domain/crossings.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 54 | Layers of history | The Undercroft below Emberford; old labels under new ones. | ✓ | [undercroft.ts](../src/maps/undercroft.ts), [restore.test.ts](../tests/restore.test.ts) |
| 55 | Material culture | Forge, dyes, ferry, grain, tide engine, seed rows. | ✓ | [forge.ts](../src/domain/forge.ts), [ferry.ts](../src/maps/ferry.ts), [water.ts](../src/maps/water.ts) |
| 56 | Landmarks with lore | The flood post, the drowned bell, the shrine, the Door Without a Name. | ✓ | [emberford.ts](../src/maps/emberford.ts), [nexus.ts](../src/maps/nexus.ts), [crossings.ts](../src/domain/crossings.ts) |
| 57 | Varied moods | Emberford’s warm streets, the Undercroft and the exposed Observatory Coast give different spaces for calm, risk and observation. | ✓ | [emberford.ts](../src/maps/emberford.ts), [undercroft.ts](../src/maps/undercroft.ts), [observatory.ts](../src/maps/observatory.ts) |
| 58 | Clear rules for the strange | World rules in the story bible: the Fray, lamps, the gold glow. | ✓ | [STORY_BIBLE.md](STORY_BIBLE.md), [WorldScene.ts](../src/scenes/WorldScene.ts), [fray.test.ts](../tests/fray.test.ts) |
| 59 | Touch the world | Ring the bell stair, read flood posts, play the music box, roll dice. | ✓ | [emberford.ts](../src/maps/emberford.ts), [bells.test.ts](../tests/bells.test.ts), [musicbox.test.ts](../tests/musicbox.test.ts) |
| 60 | Mood shifts | The lamp wall, gold glow and recurring musical theme respond to key beats. Weather sequences remain authored for individual scenes. | ◐ | [storyMotifs.ts](../src/domain/storyMotifs.ts), [WorldScene.ts](../src/scenes/WorldScene.ts) |

## VII. Pacing (61 to 70)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 61 | Campfire breathers | Hearth talks after big steps. | ✓ | [hearth.ts](../src/domain/hearth.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 62 | Episodes | Fifteen chapters, each with a stake and a hook. | ✓ | [nexus.ts](../src/maps/nexus.ts), [chapter-maps.test.ts](../tests/chapter-maps.test.ts) |
| 63 | Lean main path | Crossings, games and loyalty cases are optional. Chapter 1 still needs a selection of lamp work before the plot advances. Student timing remains unmeasured. | ◐ | [playthrough.test.ts](../tests/playthrough.test.ts), [nile.test.ts](../tests/nile.test.ts), [learningPaths.ts](../src/domain/learningPaths.ts) |
| 64 | Story-so-far recap | Recap on loading; Journal "Story so far". | ✓ | [controller.ts](../src/app/controller.ts), [ui.ts](../src/ui/ui.ts) |
| 65 | Smooth flow | World props, NPC dialogue and visible replacements let the player move directly between checking, deciding and reading back. | ✓ | [WorldScene.ts](../src/scenes/WorldScene.ts), [ui.ts](../src/ui/ui.ts) |
| 66 | Tension wave | Hearth, fair and playful crossing scenes give breathing room after serious cases. Their placement across the full campaign remains open. | ◐ | [hearth.ts](../src/domain/hearth.ts), [crossings.ts](../src/domain/crossings.ts), [lanternfair.test.ts](../tests/lanternfair.test.ts) |
| 67 | Player controls time | Big steps wait for the player ("Not yet" at the Council). | ✓ | [vesper.json](../src/content/vesper.json), [settings.ts](../src/app/settings.ts) |
| 68 | Varied missions | Investigate copies, walk bank routes, coordinate a relay, plan an Island delivery and rehearse both Lantern Fairs. | ✓ | [copies-margin.test.ts](../tests/copies-margin.test.ts), [lanternfair.test.ts](../tests/lanternfair.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 69 | Answer before new mystery | The Nile sends a particular dispatch and the Metalworks posts a revision before the player takes the next lead. Other archive questions remain open by design. | ✓ | [nile.test.ts](../tests/nile.test.ts), [metalworks-story.test.ts](../tests/metalworks-story.test.ts) |
| 70 | Short required, deep optional | Opening conversations state the immediate task; letters, hearth inquiries and deeper lore remain optional. | ✓ | [hearth.ts](../src/domain/hearth.ts), [letters.ts](../src/domain/letters.ts), [m01-nexus.json](../src/content/m01-nexus.json) |

## VIII. Side quests (71 to 80)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 71 | No empty fetch quests | Repair tickets, packed source slips and a disputed archive handoff reveal who needs the item and what can be checked when it arrives. | ✓ | [opening-packing.test.ts](../tests/opening-packing.test.ts), [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts) |
| 72 | Side stories echo the theme | Reading rests and Civic arrival trays show how an official count can omit the people or timing behind it. The optional action has a visible consequence. | ✓ | [opening-rests.test.ts](../tests/opening-rests.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [crossings.ts](../src/domain/crossings.ts) |
| 73 | Small favour grows | A small keepsake in Elsbet’s study opens a ferry route. The lamb case later contributes to Wynn’s account. | ✓ | [story.test.ts](../tests/story.test.ts), [ballad.ts](../src/domain/ballad.ts), [crossings.ts](../src/domain/crossings.ts) |
| 74 | Linked side quests | Crossing `leadsTo` links, epilogue vignettes and ballad verses. "The Runner’s Second Line" changes the receiving conversation in "A Place for the Next Name" across Chapters 2 and 3. | ✓ | [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [lanternfair.test.ts](../tests/lanternfair.test.ts), [witness-strips.test.ts](../tests/witness-strips.test.ts) |
| 75 | Guild arcs | The Communities of Emberford track local trust. A multi-part vocation with ranks across chapters remains open. | ◐ | [communities.ts](../src/domain/communities.ts), [emberford.ts](../src/maps/emberford.ts) |
| 76 | Cozy quests | Quarters, dyes, the hearth, Juno's dice table. | ✓ | [quarters.ts](../src/domain/quarters.ts), [hearth.ts](../src/domain/hearth.ts), [fieldgames.ts](../src/domain/fieldgames.ts) |
| 77 | Observation mysteries | Clue boards, the flood post, the tide engine. | ✓ | [clueboard.ts](../src/domain/clueboard.ts), [emberford.ts](../src/maps/emberford.ts), [observatory.test.ts](../tests/observatory.test.ts) |
| 78 | Challenges with flair | Showdown spectators react to how an argument changes. The goat and other crossings give low-stakes alternatives. | ✓ | [showdown.ts](../src/domain/showdown.ts), [playthrough.test.ts](../tests/playthrough.test.ts), [crossings.ts](../src/domain/crossings.ts) |
| 79 | Rumours | The rumour mill; the press crowd. | ✓ | [rumours.ts](../src/domain/rumours.ts), [copies-story.test.ts](../tests/copies-story.test.ts) |
| 80 | Rewards that show | Lamps, keepsakes, epilogue lines, names. | ✓ | [story.test.ts](../tests/story.test.ts), [epilogue.ts](../src/domain/epilogue.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |

## IX. Play and story together (81 to 90)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 81 | Story unlocks abilities | Lens views, talents and tools come from story steps. | ✓ | [playthrough.test.ts](../tests/playthrough.test.ts), [story.test.ts](../tests/story.test.ts), [talents.ts](../src/domain/talents.ts) |
| 82 | Story in boss fights | The Hollow Archivist speaks in phases; Showdown crowds react. | ✓ | [undercroft.ts](../src/domain/undercroft.ts), [showdown.ts](../src/domain/showdown.ts) |
| 83 | Item text | The notable keepsakes carry a short history and can reveal a different view of a clue in Elsbet’s study. | ✓ | [story.json](../src/content/story.json), [quarters.json](../src/content/quarters.json) |
| 84 | Play mirrors mood | The Lamp Wall responds visually to repairs, and the theme changes from the opening to the Council. | ✓ | [WorldScene.ts](../src/scenes/WorldScene.ts), [storyMotifs.ts](../src/domain/storyMotifs.ts) |
| 85 | Easy retry | Waystones and Recovery support returning to a previous place; many tool trials can be repeated directly. Checkpoints before every major confrontation remain open. | ◐ | [saves.test.ts](../tests/saves.test.ts), [saves.ts](../src/domain/saves.ts) |
| 86 | Home base grows | Players can furnish quarters and see new records and passageways in the Nexus. A home hub filled by returning companions remains open. | ◐ | [quarters.ts](../src/domain/quarters.ts), [nexus.ts](../src/maps/nexus.ts) |
| 87 | Non-fight skills pay off | Knowledge and companions open crossing ways. | ✓ | [crossings.test.ts](../tests/crossings.test.ts), [roles.ts](../src/domain/roles.ts) |
| 88 | Story mode | Calm mode, layered hints and accessible inputs support deliberate play. Distinct story and advanced modes for the whole campaign remain open. | ◐ | [settings.ts](../src/app/settings.ts), [lumen.test.ts](../tests/lumen.test.ts) |
| 89 | Tutorials in story | The cold open; Dov's stall teaches the counting frame. | ✓ | [opening-notebook.test.ts](../tests/opening-notebook.test.ts), [fieldgames.ts](../src/domain/fieldgames.ts) |
| 90 | Relics feel rare | Elsbet’s unique lamp supplies a separate proof at the Council; it changes the evidence rather than the player’s power. | ✓ | [undercroft.ts](../src/domain/undercroft.ts), [vesper.json](../src/content/vesper.json) |

## X. Themes for every age (91 to 100)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 91 | Two layers | A playful goat encounter also lets the player check how missing details in a remembered story become certainty. | ✓ | [crossings.ts](../src/domain/crossings.ts), [hearth.ts](../src/domain/hearth.ts) |
| 92 | Belonging | Recruit to Guardian; found family at the hearth. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [hearth.ts](../src/domain/hearth.ts) |
| 93 | Legacy | Elsbet leaves a distinction between what can get a person through a shift and what the next person must be able to check. The player can carry the signed listening index to Vesper. | ✓ | [story.json](../src/content/story.json), [voices-elsbet.json](../src/content/voices-elsbet.json), [vesper.json](../src/content/vesper.json) |
| 94 | Courage while unsure | "Before the Curtain"; the night surge. | ✓ | [crossings.ts](../src/domain/crossings.ts), [voices-last-lamp.test.ts](../tests/voices-last-lamp.test.ts) |
| 95 | Empathy across divides | Different ways of naming a route and hearing a short instruction let readers at the quay and stair explain what their approach leaves out. | ✓ | [crossings.ts](../src/domain/crossings.ts), [voices-story.test.ts](../tests/voices-story.test.ts) |
| 96 | Weight without shock | Harrowmere's loss, told with care. | ✓ | [harrowmere.json](../src/content/harrowmere.json), [vesper.json](../src/content/vesper.json) |
| 97 | Wonder | Opening beneath the stars leads into a living archive; Star Pictures makes familiar lights part of a different kind of map. | ✓ | [nexus.ts](../src/maps/nexus.ts), [compendiumGames.ts](../src/domain/compendiumGames.ts) |
| 98 | Humour for all | Puns, the goat, Kip's "essay", Madame Quandary. | ✓ | [hearth.ts](../src/domain/hearth.ts), [crossings.ts](../src/domain/crossings.ts) |
| 99 | Inner shadows | Kip questions his ability to finish a job; Ise must acknowledge her own earlier label. Help and better evidence produce different responses. | ✓ | [hearth.ts](../src/domain/hearth.ts), [nexus-handle.json](../src/content/nexus-handle.json), [harrowmere.json](../src/content/harrowmere.json) |
| 100 | Earned hope | Small checks matter: the epilogue shows them. | ✓ | [epilogue.ts](../src/domain/epilogue.ts), [crossings.test.ts](../tests/crossings.test.ts) |

## XI. Dialogue and access (101 to 110)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 101 | Few words | Ise gives the recruit an immediate instruction to inspect the disputed label. Longer lore can wait until the player asks for it. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [AGENTS.md](../AGENTS.md) |
| 102 | Distinct voices | Chapter responses use named speakers and changing lines. Dialogue has character-specific voices and is also presented as text. | ✓ | [chapter-voices.json](../src/content/chapter-voices.json), [voice.ts](../src/app/voice.ts) |
| 103 | Glossary pop-ups | With the smart glossary enabled, selected words open short explanations beside the dialogue. A separate Journal tab holds the glossary. | ✓ | [ui.ts](../src/ui/ui.ts), [glossary.test.ts](../tests/glossary.test.ts) |
| 104 | Conversation log | Earlier dialogue is available during a scene. The private Journal records the first-heard authored lines of conversations, separate from the teacher export. | ✓ | [conversationHistory.ts](../src/domain/conversationHistory.ts), [ui.ts](../src/ui/ui.ts) |
| 105 | Skip summaries | On returning to a save, the player can use the recap and the Story so far tab. A separate summary for every skipped scene remains open. | ◐ | [controller.ts](../src/app/controller.ts), [ui.ts](../src/ui/ui.ts) |
| 106 | Expressive staging | Dialogue portraits, emotes and short sound cues mark a character’s response. More complex camera blocking and facial animation remain open. | ◐ | [emotes.ts](../src/domain/emotes.ts), [illustrations.ts](../src/ui/illustrations.ts), [voice.ts](../src/app/voice.ts) |
| 107 | Sayings | Juno: "The pot does not know how long you waited." The Lady: "Weigh as if the Lady holds the other pan." Sefa's riddle about rumours. | ✓ | [fieldgames.ts](../src/domain/fieldgames.ts), [crossings.ts](../src/domain/crossings.ts) |
| 108 | Simple words | Opening instructions and quest goals use short action prompts. Optional read-aloud and text settings help the player understand them. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [settings.ts](../src/app/settings.ts), [AGENTS.md](../AGENTS.md) |
| 109 | Silence and subtext | Ise pauses over Elsbet’s history. The Harrowmere hearth can hold a quiet response when the other companion asks about loss. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [hearth.ts](../src/domain/hearth.ts) |
| 110 | Reading aids | Use text sizing, contrast, captions, read-aloud and reduced motion to support reading and listening. | ✓ | [settings.ts](../src/app/settings.ts), [captions.ts](../src/app/captions.ts), [ui.ts](../src/ui/ui.ts) |

## XII. Reactivity (111 to 120)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 111 | Chatter changes | World memory lines (life, echo, ack). | ✓ | [chapter-voices.json](../src/content/chapter-voices.json), [echoes.test.ts](../tests/echoes.test.ts) |
| 112 | Visible repair | The Lamp Wall, repaired banks and selected Council notices change on their maps after the relevant decisions. | ✓ | [story.test.ts](../tests/story.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 113 | Songs of your deeds | Wynn's ballad: tall verses you can correct (fame is not evidence). | ✓ | [ballad.ts](../src/domain/ballad.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 114 | Old faces return | Nellis brings the runner’s chosen copy from Nile to the Cold Store. Lark can bring the press proof to the Council rehearsal. | ✓ | [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [council-team.test.ts](../tests/council-team.test.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 115 | Factions warm or cool | Nellis remembers a public stamp correction, a folded receipt or a deferred role. Wider faction reactions remain open. | ◐ | [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [communities.ts](../src/domain/communities.ts) |
| 116 | Keepsakes at home | Collected mementos can be placed in the player’s quarters. These are deliberate displays. | ✓ | [quarters.ts](../src/domain/quarters.ts), [quarters.ts](../src/ui/quarters.ts), [quarters.test.ts](../tests/quarters.test.ts) |
| 117 | Companion reactions | Loyalty memory lines; hearth replies. | ✓ | [loyalty.ts](../src/domain/loyalty.ts), [loyalty.test.ts](../tests/loyalty.test.ts), [opening-handle.test.ts](../tests/opening-handle.test.ts) |
| 118 | Safer roads | The Forest opens a corrected rail or sheltered path after the player checks the dated marks. The Council can show the result later. | ✓ | [forest-guide.test.ts](../tests/forest-guide.test.ts), [forest.ts](../src/maps/forest.ts) |
| 119 | Fair consequences | The Council can proceed without the lamp and allows a pause before the ending. Optional Forest paths and crossing refusals leave the main route available. | ✓ | [nile.test.ts](../tests/nile.test.ts), [council-team.test.ts](../tests/council-team.test.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 120 | Letters from afar | Vesper’s letters and five private replies from community members carry earlier choices across later visits. | ✓ | [letters.ts](../src/domain/letters.ts), [communityLetters.ts](../src/domain/communityLetters.ts), [community-letters.json](../src/content/community-letters.json) |

## XIII. Mystery and lore (121 to 130)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 121 | Iceberg lore | Optional keepsakes uncover copies and routes in the study. Later, the spare reel shelf offers a two-part account behind a separate permission check on Glass Walk. | ✓ | [story.json](../src/content/story.json), [study.ts](../src/maps/study.ts), [voices-elsbet.json](../src/content/voices-elsbet.json), [voices.ts](../src/maps/voices.ts) |
| 122 | Lively codex | Lore codex as short myths; Fray Bestiary. | ✓ | [fray.json](../src/content/fray.json), [ui.ts](../src/ui/ui.ts) |
| 123 | Myths in versions | The drowned bell (three versions, one shared fact). | ✓ | [crossings.ts](../src/domain/crossings.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 124 | Secret places | Secrets, Question Stones, the Undercroft. | ✓ | [nexus.ts](../src/maps/nexus.ts), [undercroft.ts](../src/maps/undercroft.ts) |
| 125 | Replay foreshadowing | Corvan's gold stamp; Ise's pause; the scraped label. | ✓ | [emberford.ts](../src/maps/emberford.ts), [nile.ts](../src/maps/nile.ts), [harrowmere.json](../src/content/harrowmere.json) |
| 126 | Trope twists | A crossing takes the words of a prophecy as a possible hope and lets the player ask what its placement actually warrants. | ✓ | [crossings.ts](../src/domain/crossings.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 127 | Relics with a story | The brass lamp from the Hollow Archivist. | ✓ | [undercroft.ts](../src/domain/undercroft.ts), [vesper.json](../src/content/vesper.json) |
| 128 | Bestiary lore | The Fray Bestiary shows how an encountered reasoning error behaves. Loreling notes give creatures their own observation records. | ✓ | [fray.json](../src/content/fray.json), [lorelings.ts](../src/domain/lorelings.ts) |
| 129 | Leitmotifs | One original theme recurs in three arrangements across the opening, rival and finale scenes. | ✓ | [storyMotifs.ts](../src/domain/storyMotifs.ts), [ambience.ts](../src/app/ambience.ts) |
| 130 | Edges of the map | Sea charts expose the limits of mapped water and land. A new explorable region beyond the Council remains open. | ◐ | [sea.ts](../src/maps/sea.ts), [cartographers-story.test.ts](../tests/cartographers-story.test.ts) |

## XIV. Feelings (131 to 140)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 131 | Earned catharsis | The lamp shows the cut caveat. | ✓ | [vesper.json](../src/content/vesper.json), [epilogue.ts](../src/domain/epilogue.ts) |
| 132 | Timely humour | The goat, Madame Quandary and hearth puns let humor sit alongside uncertainty without replacing the consequence. | ✓ | [hearth.ts](../src/domain/hearth.ts), [crossings.ts](../src/domain/crossings.ts) |
| 133 | Celebrations | Players rehearse and adapt an optional Lantern Fair across Emberford and the Island. Hearth gatherings provide quieter celebrations. | ✓ | [lanternfair.test.ts](../tests/lanternfair.test.ts), [hearth.ts](../src/domain/hearth.ts) |
| 134 | Real loss | Harrowmere; the warm room; the night surge. | ✓ | [harrowmere.json](../src/content/harrowmere.json), [crossings.ts](../src/domain/crossings.ts) |
| 135 | Big empowering moment | The Council gives the player control of which records the public sees. Preparation can change who is present and what they bring. | ✓ | [council-team.test.ts](../tests/council-team.test.ts), [vesper.json](../src/content/vesper.json) |
| 136 | Bittersweet growth | "The Last Hearth". | ✓ | [hearth.ts](../src/domain/hearth.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 137 | Teamwork | In "The Handover Before the Bell", each companion's work supports the next. Players choose how to staff and post the checked handover. | ✓ | [council-team.test.ts](../tests/council-team.test.ts), [m16-council.json](../src/content/m16-council.json) |
| 138 | Suspense | The warm room, night surge and falling tide require a decision with specific people waiting for it. | ✓ | [crossings.ts](../src/domain/crossings.ts), [island-story.test.ts](../tests/island-story.test.ts) |
| 139 | Mentors | Ise, Elsbet's letters, Orrin. | ✓ | [m01-nexus.json](../src/content/m01-nexus.json), [story.json](../src/content/story.json), [m02-aethelgard.json](../src/content/m02-aethelgard.json) |
| 140 | Whimsy | Lumen, Lorelings, Madame Quandary, the goat. | ✓ | [lumen.test.ts](../tests/lumen.test.ts), [lorelings.ts](../src/domain/lorelings.ts), [crossings.ts](../src/domain/crossings.ts) |

## XV. Climax and legacy (141 to 150)

| # | Story element | Adaptation and current scope | Status | Reference |
| ---: | --- | --- | :---: | --- |
| 141 | Allies return | Lark can bring the earlier print proof into the Council's rehearsal. A second route uses an actual Emberford handoff; the team can also start with blank slips. | ✓ | [council-team.test.ts](../tests/council-team.test.ts), [m16-council.json](../src/content/m16-council.json) |
| 142 | Final showdown tests the theme | The Council tests whether to display, correct or act on evidence people trusted, and who bears the cost of each response. | ✓ | [vesper.json](../src/content/vesper.json), [council-team.test.ts](../tests/council-team.test.ts) |
| 143 | Whole party helps | The Council handover gives four companions distinct jobs and leaves their work visible after the hearing. Players can choose any Council ending. | ✓ | [council-team.test.ts](../tests/council-team.test.ts), [m16-council.json](../src/content/m16-council.json) |
| 144 | Ending reflects choices | Four endings; letter 15; the epilogue. | ✓ | [vesper.json](../src/content/vesper.json), [letters.ts](../src/domain/letters.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 145 | Walkable epilogue | After choosing an ending, players can continue to walk the worlds, finish optional Council work and attend The Last Hearth. | ✓ | [vesper.json](../src/content/vesper.json), [hearth.ts](../src/domain/hearth.ts), [council-team.test.ts](../tests/council-team.test.ts) |
| 146 | Where are they now | The Afterwards tab shows people’s later circumstances based on saved decisions. | ✓ | [epilogue.ts](../src/domain/epilogue.ts), [ui.ts](../src/ui/ui.ts) |
| 147 | Post-game | Formal post-ending rematches and New Game Plus remain open. Continuing to visit existing worlds is available. | ○ | [epilogue.ts](../src/domain/epilogue.ts), [saves.ts](../src/domain/saves.ts) |
| 148 | Mirror scene | Afterwards returns to the first label bench in a written scene. A separate interactive end-of-campaign visit to that bench remains open. | ◐ | [epilogue.ts](../src/domain/epilogue.ts), [ui.ts](../src/ui/ui.ts) |
| 149 | Credits with your choices | After the Council, the Journal’s Afterwards page opens illustrated vignettes drawn from the ending and earlier deeds. Players can hear an original theme reprise alongside the credits. | ✓ | [ui.ts](../src/ui/ui.ts), [epilogue.ts](../src/domain/epilogue.ts), [storyMotifs.ts](../src/domain/storyMotifs.ts) |
| 150 | A lingering thought | The last words in Afterwards, built from why you came. | ✓ | [epilogue.ts](../src/domain/epilogue.ts), [crossings.test.ts](../tests/crossings.test.ts) |

## Where the story is still too thin

- Recurring chapter characters need more decisions and consequences beyond the current cast. A catalogue of character names or lines cannot show a full arc.
- Full daily schedules, a return-to-character card and broader late faction responses could give more reasons to revisit the same room.
- A walkable mirror scene and a post-ending challenge remain open. The Journal’s aftermath and illustrated credits currently revisit the player’s earlier choices.
