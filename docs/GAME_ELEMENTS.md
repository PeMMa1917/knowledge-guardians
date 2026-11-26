# Game elements in Knowledge Guardians

This tracker maps each numbered item in the supplied *Ultimate Universal RPG Compendium* to a playable example, an adaptation with a remaining gap, a planned feature or a design exclusion. The attachment supplies items 1–288 and nine player preference rows. Its headline and catalogue subtitle give higher counts than its enumeration.

| Status | Meaning | Numbered items |
| --- | --- | ---: |
| ✓ Playable | At least one playable example demonstrates the core adapted idea. | 106 |
| ◐ Partial | A reachable analogue covers part of the idea, or operates in a narrower setting. The gap is stated. | 109 |
| ○ Planned | The example identifies a possible design or integration point. The feature is not playable. | 46 |
| ✗ Excluded | The classroom, privacy or nonviolent game rules exclude the original system. | 27 |

The marks reflect inspection of authored maps, dialogue, interfaces and tests. A mark does not measure how often players find the activity, how long they spend, or what they learn. Each numbered row refers to the attachment’s item number. Source links point to playable evidence or the existing feature nearest to a planned adaptation.

Contests use arguments, tests and investigation. Records, chance tools and school-friendly cooperation support play without wagering, grades, violence or student publishing. Progress stays on the device unless voluntarily shared. The [story tracker](STORY_ELEMENTS.md), [learning design](LEARNING_DESIGN.md) and [repository rules](../AGENTS.md) govern adaptations.

## I. Exploration and navigation

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 1 | Art, lighting and sound | ✓ | Pixel-art rooms, original interface illustrations, lighting and captioned sound cues support looking and listening. | [BootScene.ts](../src/scenes/BootScene.ts), [ASSETS.md](ASSETS.md) |
| 2 | Connected exploration | ✓ | The Nexus connects 15 chapters. Players explore local streets, archives and side rooms on foot. | [index.ts](../src/maps/index.ts), [nexus.ts](../src/maps/nexus.ts) |
| 3 | Landmark-led navigation | ✓ | The unnamed door, flood post and quay lamps orient the player and invite investigation. | [nexus.ts](../src/maps/nexus.ts), [emberford.ts](../src/maps/emberford.ts), [voices.ts](../src/maps/voices.ts) |
| 4 | Layered world lore | ✓ | Letters, marks on objects and optional archives let players reconstruct who kept a record and why. | [story.json](../src/content/story.json), [letters.ts](../src/domain/letters.ts) |
| 5 | Map revealed by walking | ✓ | Visited areas are recorded locally and shown in the folding map. | [fog.ts](../src/domain/fog.ts), [ui.ts](../src/ui/ui.ts) |
| 6 | Compass and map annotations | ◐ | The compass points toward a nearby lead and opens the folding map. Player-defined waypoint tools are limited. | [WorldScene.ts](../src/scenes/WorldScene.ts), [ui.ts](../src/ui/ui.ts) |
| 7 | Fast travel and rides | ◐ | Discovered portal stones provide fast travel. The Island skiff provides a piloted crossing to the Quiet Margin. | [nexus.ts](../src/maps/nexus.ts), [islandSkiff.ts](../src/maps/islandSkiff.ts), [talents.ts](../src/domain/talents.ts) |
| 8 | Player-piloted transport | ✓ | Players steer the Island skiff one marker at a time. Weather, cargo and the second crew station change handling. Two usable berths lead to different handovers. | [islandSkiff.ts](../src/domain/islandSkiff.ts), [islandSkiff.ts](../src/ui/islandSkiff.ts) |
| 9 | Time and weather | ◐ | World lighting changes with time. The Observatory and Water Commons portray weather in authored cases; weather does not continuously change terrain or routines. | [WorldScene.ts](../src/scenes/WorldScene.ts), [observatory.ts](../src/maps/observatory.ts), [water.ts](../src/maps/water.ts) |
| 10 | Resource gathering | ✓ | Collect ore, clay and reeds for tools and barter. | [craft.ts](../src/domain/craft.ts), [emberford.ts](../src/maps/emberford.ts) |
| 11 | Secrets and optional discoveries | ✓ | Find hidden shelves and other secrets off the marked route. Keepsakes can uncover different evidence. | [nexus.ts](../src/maps/nexus.ts), [study.ts](../src/maps/study.ts) |
| 12 | Scout from a vantage | ◐ | Scout reports support route trials in Emberford. Observatory sight marks and Star Pictures add fixed viewpoints; distant map pinning through a spyglass remains open. | [scoutRoutes.ts](../src/ui/scoutRoutes.ts), [observatory.ts](../src/maps/observatory.ts), [compendiumGames.ts](../src/domain/compendiumGames.ts) |
| 13 | Active mapmaking | ✓ | Build a map at the Mapmaker's Table and revise survey edges in Cartographers' Sea. | [mapmaker.test.ts](../tests/mapmaker.test.ts), [cartographers-story.test.ts](../tests/cartographers-story.test.ts) |
| 14 | Read different states of one place | ✓ | Walk Elsbet’s loan annex and a model of the room before the flood. A surviving hinge and a broken drawing support different parts of the reconstruction. The player can make a present-day path usable. | [shelf-room.test.ts](../tests/shelf-room.test.ts), [shelfRoom.ts](../src/maps/shelfRoom.ts) |
| 15 | Terrain-specialist companions | ✓ | Two Forest watches win the Stiltfrog’s company. It points out the dry seep rim on Shoal Shelf before the player checks the footing. The south planks reach a different view without a companion. | [stiltfrog.json](../src/content/stiltfrog.json), [forest.ts](../src/maps/forest.ts), [sea.ts](../src/maps/sea.ts) |
| 16 | Lost-property retrieval | ◐ | Nima records a found gauge, the player checks its provenance in the Cold Store and returns with a receipt. This is one authored recovery. | [lost-gauge.test.ts](../tests/lost-gauge.test.ts), [nexus-lost-gauge.json](../src/content/nexus-lost-gauge.json) |

## II. Story, characters and companions

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 17 | Campaign and personal subplots | ✓ | Elsbet's trail and the Harrowmere case connect local chapters; the case handle and companion loyalty stories add personal stakes. | [story.json](../src/content/story.json), [harrowmere.json](../src/content/harrowmere.json), [loyalty.ts](../src/domain/loyalty.ts) |
| 18 | NPC lives and voices | ◐ | Chapter characters have jobs, named voices and stateful lines. Regular work calendars and independently changing goals are limited. | [chapter-voices.json](../src/content/chapter-voices.json), [voice.ts](../src/app/voice.ts) |
| 19 | Avatar and identity choices | ✓ | Choose appearance, origin, pronouns and voice. Assistive options are available without earning them. | [appearance.ts](../src/domain/appearance.ts), [player.ts](../src/domain/player.ts), [origins.json](../src/content/origins.json) |
| 20 | Companions in exploration | ✓ | Choose allies, hear route banter and gain inquiry-based trust. Individual companions have loyalty choices. | [approval.ts](../src/domain/approval.ts), [loyalty.ts](../src/domain/loyalty.ts), [hearth.ts](../src/domain/hearth.ts) |
| 21 | Branching conversations | ✓ | Question testimony, set the tone with Rook and choose evidence or wording that produces distinct replies. | [rook.json](../src/content/rook.json), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 22 | Consequences that change play | ✓ | A repair queue choice changes service at the yard; Forest routes change later travel and appear at the Council. | [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts), [council.ts](../src/maps/council.ts) |
| 23 | Community trust | ◐ | Actions change relationships in Emberford; campaign-wide faction standing is limited. | [communities.ts](../src/domain/communities.ts), [memories.json](../src/content/memories.json) |
| 24 | Character stance and epithets | ◐ | Opening motives and published choices change titles and vignettes. No personality axis rates a student. | [epilogue.ts](../src/domain/epilogue.ts), [origins.json](../src/content/origins.json) |
| 25 | Guilds and affiliations | ◐ | Emberford communities and the Seal have preferences and memory. Multi-chapter affiliation ranks remain open. | [communities.ts](../src/domain/communities.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts) |
| 26 | Loyalty and mentorship | ✓ | Four companion investigations test trust through evidence and costly acts of care. | [loyalty.ts](../src/domain/loyalty.ts), [loyalty.test.ts](../tests/loyalty.test.ts) |
| 27 | Ending branches | ✓ | The Council resolution sets one of four endings and changes letters, memory and the Afterwards account. | [vesper.json](../src/content/vesper.json), [epilogue.ts](../src/domain/epilogue.ts), [letters.test.ts](../tests/letters.test.ts) |
| 28 | Hearth conversations and food | ◐ | Hearth discussions let companions exchange views or take a breath. The ferry service has preparation effects. Shared preparation at the companion hearth remains open. | [hearth.ts](../src/domain/hearth.ts), [ferry-kettle.test.ts](../tests/ferry-kettle.test.ts) |
| 29 | Configurable companion help | ○ | A future helper could offer a chosen task, such as keeping a second source in view. No programmable helper system is live. | [loyalty.ts](../src/domain/loyalty.ts) |
| 30 | Lending companions online | ✗ | The campaign is offline and has no shared accounts or lending. NPC companionship is the local alternative. | [loyalty.ts](../src/domain/loyalty.ts), [DESIGN_SUMMARY.md](DESIGN_SUMMARY.md) |
| 31 | Recall a returning person | ◐ | Use the conversation recall while talking or open the Journal history. A short profile card dedicated to returning people remains open. | [conversationHistory.ts](../src/domain/conversationHistory.ts), [ui.ts](../src/ui/ui.ts) |

## III. Progress, roles and crafting

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 32 | Progress through practice | ✓ | Concept XP and permanent credits recognize game actions. Player choices keep their story consequences. | [permanent.ts](../src/domain/permanent.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 33 | Branching upgrades | ✓ | Insight talents open routes or change how a player investigates. Refunds let players try another approach. | [talents.ts](../src/domain/talents.ts) |
| 34 | Combat-style attributes | ✗ | Play is supported by tools and choices. Damage and character attributes do not govern access. | [roles.ts](../src/domain/roles.ts), [AGENTS.md](../AGENTS.md) |
| 35 | Distinct inquiry roles | ✓ | Knower roles offer different skills, viewpoints and routes. | [roles.ts](../src/domain/roles.ts), [player.test.ts](../tests/player.test.ts) |
| 36 | Advanced vocation paths | ○ | A longer apprenticeship could extend current roles through methods and new cases. Prestige classes are unimplemented. | [roles.ts](../src/domain/roles.ts), [talents.ts](../src/domain/talents.ts) |
| 37 | Reselect roles and talents | ✓ | Players can change role and refund Insight choices. | [roles.ts](../src/domain/roles.ts), [talents.ts](../src/domain/talents.ts), [ui.ts](../src/ui/ui.ts) |
| 38 | Tool expertise | ◐ | Players make and calibrate tools and use marked readings. Individual tools do not gain proficiency ranks from repetition. | [craft.ts](../src/domain/craft.ts), [readings.ts](../src/domain/readings.ts) |
| 39 | Bag and meaningful items | ✓ | Carry cards, tools, resources and keepsakes. Evidence and keepsakes have specific uses elsewhere. | [engine.ts](../src/domain/engine.ts), [story.json](../src/content/story.json) |
| 40 | Detailed combat loadouts | ✗ | The outfit and bag support the player without a combat equipment grid. | [appearance.ts](../src/domain/appearance.ts), [shop.ts](../src/domain/shop.ts), [AGENTS.md](../AGENTS.md) |
| 41 | Sets with combined uses | ○ | A future evidence set could reveal a different interpretation when brought together. Currently sets record discoveries and unlocks. | [clueboard.ts](../src/domain/clueboard.ts), [permanent.ts](../src/domain/permanent.ts) |
| 42 | Appearance independent of skill | ✓ | Wardrobe, dyes and heraldry change the look without changing success at a task. | [appearance.ts](../src/domain/appearance.ts), [crest.ts](../src/domain/crest.ts), [shop.ts](../src/domain/shop.ts) |
| 43 | Maintenance as care | ◐ | Craft and calibrate measuring instruments; Kip's case gets a repaired handle. Repeated use does not wear down gear. | [craft.ts](../src/domain/craft.ts), [opening-handle.test.ts](../tests/opening-handle.test.ts) |
| 44 | Forging and crafting | ✓ | Forge a sample, make tools and choose dyes. Forge and assay distinguish a production method from authorship. | [forge.ts](../src/domain/forge.ts), [craft.ts](../src/domain/craft.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 45 | Modular instrument fittings | ○ | A holder with interchangeable test fittings could change what a tool measures. Combat modifiers are outside the game. | [readings.ts](../src/domain/readings.ts), [talents.ts](../src/domain/talents.ts) |
| 46 | Appraise uncertain objects | ✓ | Compare assay samples and inspect Elsbet's lamp and several archival objects before claiming their histories. | [forge.ts](../src/domain/forge.ts), [undercroft.ts](../src/domain/undercroft.ts), [m04-preserved.json](../src/content/m04-preserved.json) |
| 47 | Creature and helper care | ◐ | Lorelings can be observed, offered a place and befriended. They are not summoned to fight or upgraded as combat pets. | [lorelings.ts](../src/domain/lorelings.ts), [lorelings.test.ts](../tests/lorelings.test.ts) |
| 48 | Heirloom with later meaning | ◐ | Elsbet's lamp reveals a cut line at the Council and the opening bench returns. There are no gear stages or evolving statistics. | [undercroft.ts](../src/domain/undercroft.ts), [vesper.json](../src/content/vesper.json) |
| 49 | Remember a set of work tools | ○ | An optional preset could remember a research kit. Today role and talent changes are separate choices. | [roles.ts](../src/domain/roles.ts), [talents.ts](../src/domain/talents.ts) |
| 50 | Sortable inventory by purpose | ◐ | Items and evidence have distinct records in the interface. Specialized pouches and user sorting presets are unimplemented. | [ui.ts](../src/ui/ui.ts), [types.ts](../src/domain/types.ts) |
| 51 | Fair randomness and recovery | ◐ | A seeded event deck prevents repeats, and calm mode lets players defer events. Rare-drop pity odds are unused. | [engine.ts](../src/domain/engine.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |

## IV. Conflicts, observation and world systems

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 52 | Structured contest | ✓ | Showdowns support claims, support, counters, concessions and reframing with a responsive audience. | [showdown.ts](../src/domain/showdown.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 53 | Temporary encounter state | ◐ | Patience, crowd trust and opening conditions change what can be attempted. General status-effect and cleansing systems are absent. | [showdown.ts](../src/domain/showdown.ts) |
| 54 | Moves work together | ◐ | A counter can narrow a claim, and evidence can support the resulting reframe. There is no general combination or elemental system. | [showdown.ts](../src/domain/showdown.ts) |
| 55 | Timed input | ◐ | Music and bell games offer kinetic input outside contests. Showdowns do not require fast reactions. | [musicbox.ts](../src/domain/musicbox.ts), [bells.test.ts](../tests/bells.test.ts), [showdown.ts](../src/domain/showdown.ts) |
| 56 | Finite action resources | ◐ | Showdown patience limits moves. Movement has no stamina pressure. | [showdown.ts](../src/domain/showdown.ts), [WorldScene.ts](../src/scenes/WorldScene.ts) |
| 57 | Position affects access | ○ | Rail and shutter observations show what people can check by position. A persistent proximity support effect is still open. | [council.ts](../src/maps/council.ts) |
| 58 | Place people advantageously | ◐ | The House seating decision and Council relay change who can see or hear. There is no tactical party formation grid. | [performance-story.test.ts](../tests/performance-story.test.ts), [council-story.test.ts](../tests/council-story.test.ts) |
| 59 | Coordinated specialist help | ◐ | Kip and the player can test a shared carry. The full party does not perform combined actions in encounters. | [opening-handle.test.ts](../tests/opening-handle.test.ts), [hearth.ts](../src/domain/hearth.ts) |
| 60 | A multi-room dungeon | ✓ | The Undercroft combines clues, seals and an argument encounter, with nonviolent paths. | [undercroft.ts](../src/maps/undercroft.ts), [undercroft.ts](../src/domain/undercroft.ts) |
| 61 | Multi-phase climax | ✓ | The Hollow Archivist changes the encounter through phases; the argument itself exposes reasoning failures. | [undercroft.ts](../src/domain/undercroft.ts), [story.test.ts](../tests/story.test.ts) |
| 62 | Environmental constraints | ◐ | The washhouse, flood and tide cases require observing conditions and choosing a response. Active traversal hazards are limited. | [emberford-followups.test.ts](../tests/emberford-followups.test.ts), [crossings.ts](../src/domain/crossings.ts) |
| 63 | Material interactions | ◐ | Pen surfaces, a water gate and a model ramp change how an experiment behaves. These are authored tools, with no general environmental simulation. | [playthrough.test.ts](../tests/playthrough.test.ts), [waterGate.ts](../src/domain/waterGate.ts), [nileModel.ts](../src/domain/nileModel.ts) |
| 64 | Animal and habitat patterns | ◐ | Forest lookouts record crossing patterns and hidden beats. Autonomous predator and rivalry systems are absent. | [forestWatch.ts](../src/domain/forestWatch.ts), [crossings.ts](../src/domain/crossings.ts) |
| 65 | Quiet observation and sightlines | ◐ | Players compare viewpoints and wait quietly at the Forest. Theft and evading guards are excluded. | [forest-watch.test.ts](../tests/forest-watch.test.ts), [sightlines.test.ts](../tests/sightlines.test.ts) |
| 66 | Identity and permission checks | ○ | A future role badge could allow an approved visit and reveal what the badge certifies. Disguise and bluff systems are absent. | [preserved-records.json](../src/content/preserved-records.json) |
| 67 | Punitive brig and bounty systems | ✗ | The story uses permits and disputes without player theft, jail or fines for mischief. | [AGENTS.md](../AGENTS.md), [archive-handoff.test.ts](../tests/archive-handoff.test.ts) |
| 68 | Optional field preparation | ○ | The warm room and water trials model competing needs. Optional equipment preparation could extend these cases without survival meters. | [crossings.ts](../src/domain/crossings.ts), [waterGate.ts](../src/domain/waterGate.ts) |
| 69 | Transparent chance and method checks | ✓ | Lanterns and Bones shows dice and evidence without stakes. The scout board shows the rule behind an apparent chance outcome. | [fairgames.ts](../src/domain/fairgames.ts), [emberford-scout.test.ts](../tests/emberford-scout.test.ts) |
| 70 | A rival who responds | ◐ | Vesper's letters and subsequent scenes remember decisions. There is no procedural system creating or upgrading rivals. | [letters.ts](../src/domain/letters.ts), [performance-vesper.test.ts](../tests/performance-vesper.test.ts) |
| 71 | Waystones and save recovery | ✓ | Waystones support rest and deliberate checkpoints. Continue and Recovery are the two save slots. | [saves.ts](../src/domain/saves.ts), [saves.test.ts](../tests/saves.test.ts) |
| 72 | Replay with knowledge retained | ○ | Repeatable investigations and separate recovery exist. A dedicated post-ending replay with remixed cases remains open. | [saves.ts](../src/domain/saves.ts), [epilogue.ts](../src/domain/epilogue.ts) |

## V. Economy, home and collections

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 73 | Local currency and shops | ✓ | Earn and spend marks, gather trade material and barter with Wenna. | [shop.ts](../src/domain/shop.ts), [trade.ts](../src/domain/trade.ts), [ferry.ts](../src/maps/ferry.ts) |
| 74 | Economic changes and investment | ◐ | Market weighing and barter let the player see different measures of value. Town investment and changing supply are absent. | [marketScale.ts](../src/domain/marketScale.ts), [trade.ts](../src/domain/trade.ts) |
| 75 | Collections and unlocks | ✓ | Gather keepsakes, cards, Lorelings, secrets and Question Stones. Some open or change a later investigation. | [story.json](../src/content/story.json), [lorelings.ts](../src/domain/lorelings.ts), [permanent.ts](../src/domain/permanent.ts) |
| 76 | Fray Bestiary and lore | ✓ | Find reasoning errors and read their habits in the Bestiary; lore entries expand as sites are found. | [fray.json](../src/content/fray.json), [ui.ts](../src/ui/ui.ts) |
| 77 | Journal and mystery tracker | ✓ | Track quests, evidence, letters and the story account. The clue board provides a separate place to examine links. | [ui.ts](../src/ui/ui.ts), [clueboard.ts](../src/domain/clueboard.ts) |
| 78 | Short board or rumor jobs | ◐ | Rumors, roadside leads and brief field games give optional jobs. Replenishing guild contracts remain open. | [rumours.ts](../src/domain/rumours.ts), [fieldgames.ts](../src/domain/fieldgames.ts) |
| 79 | A customizable home | ◐ | Arrange keepsakes and décor in quarters. Expansion, functional rooms and visits by allies remain gaps. | [quarters.ts](../src/domain/quarters.ts), [quarters.ts](../src/ui/quarters.ts) |
| 80 | Traveling merchant | ○ | A trader who appears after a particular weather event remains open. Wenna already has a fixed barter landing. | [ferry.ts](../src/maps/ferry.ts), [trade.ts](../src/domain/trade.ts) |

## VI. Progress and feedback

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 81 | Local active-time counter | ✓ | The Guardian's Ledger records local play time. It is an in-game record of activity. | [ledger.ts](../src/domain/ledger.ts), [ledger.test.ts](../tests/ledger.test.ts) |
| 82 | Local XP over time | ✓ | See XP today, this week, this month and overall. Data stays in the local record unless voluntarily exported. | [ledger.ts](../src/domain/ledger.ts), [ui.ts](../src/ui/ui.ts) |
| 83 | Skill practice record | ✓ | Skill Atlas entries record practiced game skills. Those entries are neither subject grades nor exam scores. | [skills.ts](../src/domain/skills.ts), [ui.ts](../src/ui/ui.ts) |
| 84 | Record and chapter progress | ◐ | Quest and chapter completions are tracked. There are no per-text mastery meters. | [ui.ts](../src/ui/ui.ts), [types.ts](../src/domain/types.ts) |
| 85 | Exam readiness and papers | ✗ | The game excludes test-readiness gauges. The Forecast Board supports calibration in a fictional task. | [AGENTS.md](../AGENTS.md), [forecast.test.ts](../tests/forecast.test.ts) |
| 86 | Personal bests and discovery counts | ◐ | Word Tiles records personal results and a daily challenge. A cabinet covering every minigame and errand remains open. | [tiles.ts](../src/domain/tiles.ts), [ledger.ts](../src/domain/ledger.ts) |
| 87 | Awards and in-world currencies | ✓ | Unlock awards and spend marks; Insight allows different talents. | [permanent.ts](../src/domain/permanent.ts), [shop.ts](../src/domain/shop.ts), [talents.ts](../src/domain/talents.ts) |
| 88 | Forgiving streaks | ✓ | The local ledger shows a streak with protections. These are optional habits, not assessment. | [ledger.ts](../src/domain/ledger.ts), [ledger.test.ts](../tests/ledger.test.ts) |
| 89 | Rings and progress colors | ◐ | Concept rings and local skill colors show credited game activity. Cohort heatmaps are not an equivalent measure of mastery. | [permanent.ts](../src/domain/permanent.ts), [ui.ts](../src/ui/ui.ts) |
| 90 | Progress by discipline | ◐ | The interface shows concept XP and practiced curriculum links, with no subject-specific XP tracks. | [permanent.ts](../src/domain/permanent.ts), [curriculum.ts](../src/domain/curriculum.ts) |
| 91 | Calendar view | ◐ | Daily entries inform the ledger; a separate calendar grid is unimplemented. | [ledger.ts](../src/domain/ledger.ts), [ui.ts](../src/ui/ui.ts) |
| 92 | Post-encounter grades | ✗ | Consequences and helpful response text replace multi-axis grading. Reasoned branches share credit. | [AGENTS.md](../AGENTS.md), [showdown.ts](../src/domain/showdown.ts) |
| 93 | Personal replay ghost | ◐ | Word Tiles can replay a personal best time. There is no general pace comparator or student comparison. | [tiles.ts](../src/domain/tiles.ts), [ui.ts](../src/ui/ui.ts) |
| 94 | Skill decay | ✗ | Permanent credit survives revisits and breaks. Optional retries carry no loss of competence or awards. | [permanent.ts](../src/domain/permanent.ts), [saves.ts](../src/domain/saves.ts) |
| 95 | Answer streak multipliers | ✗ | The game avoids correctness combos and grade-like incentives. Independent follow-up decisions change the world. | [AGENTS.md](../AGENTS.md), [showdown.ts](../src/domain/showdown.ts) |
| 96 | Progress analytics | ◐ | Local concept rings and voluntary aggregate exports show credited activity. There is no individual radar chart of ability. | [permanent.ts](../src/domain/permanent.ts), [report.ts](../src/teacher/report.ts) |
| 97 | Visible home growth | ◐ | Collected objects can decorate quarters and concept rings light the room's Star Chart. Campaign-scale appearance changes are limited. | [quarters.ts](../src/domain/quarters.ts), [quarters.ts](../src/ui/quarters.ts) |
| 98 | Seasonal reward passes | ✗ | No server or seasonal pass. The same local quests and awards remain available. | [DESIGN_SUMMARY.md](DESIGN_SUMMARY.md), [permanent.ts](../src/domain/permanent.ts) |
| 99 | Tiered achievements and hidden finds | ✓ | Awards, keepsakes and secret finds can be collected locally. | [permanent.ts](../src/domain/permanent.ts), [nexus.ts](../src/maps/nexus.ts) |
| 100 | Regional passport | ○ | A passport for visited places or completed handoffs could use the existing journal. No dedicated stamp book is in play. | [fog.ts](../src/domain/fog.ts), [ui.ts](../src/ui/ui.ts) |
| 101 | Wearable titles | ✓ | Choose an earned title; crossings and the ballad remember how a player acted. | [permanent.ts](../src/domain/permanent.ts), [ballad.ts](../src/domain/ballad.ts), [ui.ts](../src/ui/ui.ts) |
| 102 | Aggregate classroom progress | ◐ | The teacher page summarizes imported, voluntarily shared progress. There is no live public cohort scoreboard. | [report.ts](../src/teacher/report.ts), [DESIGN_SUMMARY.md](DESIGN_SUMMARY.md) |
| 103 | Hall of fame and public ranking | ✗ | No public archive ranks named students. Private individual and class aggregate tools remain distinct. | [report.ts](../src/teacher/report.ts), [AGENTS.md](../AGENTS.md) |
| 104 | Visible improvement after revision | ◐ | Original and revised records remain available in multiple chapters. There are no numeric first-versus-last student scores. | [copies-story.test.ts](../tests/copies-story.test.ts), [water-story.test.ts](../tests/water-story.test.ts), [voices-story.test.ts](../tests/voices-story.test.ts) |
| 105 | Mistake log and rematches | ◐ | The Fray Bestiary names encountered reasoning errors. It does not reconstruct every encounter for rematches. | [fray.json](../src/content/fray.json), [ui.ts](../src/ui/ui.ts) |
| 106 | Personal goals without wagers | ○ | A private, optional goal could identify a case to revisit. No stakes, wager or goal contract is live. | [ledger.ts](../src/domain/ledger.ts), [AGENTS.md](../AGENTS.md) |
| 107 | Hint independence | ◐ | Players can choose minimal hints and retry with the same credit. A speed or efficiency rating is absent. | [settings.ts](../src/app/settings.ts), [lumen.test.ts](../tests/lumen.test.ts), [AGENTS.md](../AGENTS.md) |

## VII. Cards and tabletop strategy

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 108 | Evidence cards and combinations | ◐ | Choose and connect evidence cards in Showdowns. Campaign deck construction and combat card synergies are absent. | [showdown.ts](../src/domain/showdown.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 109 | Limited evidence draft | ○ | A Showdown using an optional limited set of source cards remains open. Current confrontations use the evidence the player has collected. | [showdown.ts](../src/domain/showdown.ts) |
| 110 | Transparent probability games | ✓ | Three Doors and Lanterns and Bones expose the draw rules and compare outcomes with no wagering. | [fairgames.ts](../src/domain/fairgames.ts), [fairgames.test.ts](../tests/fairgames.test.ts) |
| 111 | Push-your-luck banking | ✗ | Chance investigations explain streaks and decision rules. They do not risk money or progress on a wager. | [fairgames.ts](../src/domain/fairgames.ts), [AGENTS.md](../AGENTS.md) |
| 112 | Build an efficient process | ○ | Packing and Civic receiving let players compare procedures. Persistent, combinable workflow upgrades remain open. | [opening-packing.test.ts](../tests/opening-packing.test.ts), [civicArrivals.ts](../src/domain/civicArrivals.ts) |
| 113 | Place-based strategy grid | ○ | Current route models compare use of space. A nonviolent strategy grid for allocating shared ground remains open. | [islandPlan.ts](../src/domain/islandPlan.ts), [civicConsole.ts](../src/domain/civicConsole.ts) |
| 114 | Allocate roles and turns | ◐ | Civic service windows, Council relay and repair queue choices allocate time and people. There is no reusable worker-placement board. | [civic-story.test.ts](../tests/civic-story.test.ts), [council-story.test.ts](../tests/council-story.test.ts), [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts) |
| 115 | Combine sources into an edition | ○ | The City of Copies restores omissions in a proof. A reusable way of joining two provenance cards into a new edition remains open. | [copies-side.test.ts](../tests/copies-side.test.ts), [clueboard.ts](../src/domain/clueboard.ts) |
| 116 | Manage a hand of evidence | ◐ | Context-sensitive plays use collected sources; drawing, discarding and cycling a hand are absent. | [showdown.ts](../src/domain/showdown.ts) |
| 117 | Optional personal constraint | ○ | A private goal such as relying on a limited set of sources could add variety. It does not currently affect a Showdown. | [showdown.ts](../src/domain/showdown.ts), [AGENTS.md](../AGENTS.md) |
| 118 | Pace scarce resources | ◐ | Patience paces a debate, and the Civic routes allocate limited service. There is no combat energy or mana system. | [showdown.ts](../src/domain/showdown.ts), [civicConsole.ts](../src/domain/civicConsole.ts) |
| 119 | Compare starting price anchors | ○ | The Market compares price by mass and budget. A no-stake auction demonstration remains open. | [marketScale.ts](../src/domain/marketScale.ts), [market-story.test.ts](../tests/market-story.test.ts) |
| 120 | Seeded shifts in events | ✓ | A seeded deck draws authored encounters and avoids repeats in a chapter. Calm mode lets players postpone an event. | [engine.ts](../src/domain/engine.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 121 | Turn timing as evidence | ◐ | A performance tool changes the order of silence and movement. Players do not manipulate party initiative in a general combat system. | [stageRehearsal.ts](../src/domain/stageRehearsal.ts), [performance-story.test.ts](../tests/performance-story.test.ts) |
| 122 | Lay route tiles | ✓ | Civic players tile a lane and check who can reach the receiving rack. Water Commons adds a second routing board with field and channel constraints. | [route-tiles.test.ts](../tests/route-tiles.test.ts), [routingBoards.ts](../src/ui/routingBoards.ts), [civic.ts](../src/maps/civic.ts), [water.ts](../src/maps/water.ts) |
| 123 | Tabletop route models | ○ | The Island uses miniature route trials. Moving figures on a shared strategy board remains open. | [islandPlan.ts](../src/domain/islandPlan.ts), [island.ts](../src/maps/island.ts) |

## VIII. Replay and challenge

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 124 | Procedural campaign mazes | ✗ | Authored chapters preserve named places, archives and cross-chapter consequences. Generated campaign rooms are unused. | [index.ts](../src/maps/index.ts), [STORY_BIBLE.md](STORY_BIBLE.md) |
| 125 | Try a temporary research kit | ○ | Current packs and role changes are permanent or local to a scene. A small, optional run with a loaned kit remains open. | [roles.ts](../src/domain/roles.ts), [opening-packing.test.ts](../tests/opening-packing.test.ts) |
| 126 | Seeded challenges | ◐ | Word Tiles offers a daily shared seed. Weekly challenges across games are not available. | [tiles.ts](../src/domain/tiles.ts), [ui.ts](../src/ui/ui.ts) |
| 127 | Voluntary challenge constraints | ○ | Calm mode and manual restraint let players vary play now. An explicit no-hint, no-tool or one-source challenge remains open. | [settings.ts](../src/app/settings.ts), [lumen.test.ts](../tests/lumen.test.ts) |
| 128 | Progress between attempts | ◐ | Permanent credits, keepsakes and insights survive recovery. A second campaign or run currency is absent. | [permanent.ts](../src/domain/permanent.ts), [saves.ts](../src/domain/saves.ts) |
| 129 | Endless survival waves | ✗ | The campaign uses bounded disputes and cases instead of survival or combat waves. | [showdown.ts](../src/domain/showdown.ts), [AGENTS.md](../AGENTS.md) |
| 130 | Post-ending argument gauntlet | ○ | The Hollow Archivist has phases. A separate rematch or sequential Fray challenge remains open. | [undercroft.ts](../src/domain/undercroft.ts) |
| 131 | Opt-in no-hint run | ○ | Players can take a calm or minimal-hint route. There is no formal Ironman rule, title or deletion of a save. | [settings.ts](../src/app/settings.ts), [saves.ts](../src/domain/saves.ts) |
| 132 | Compare times on a local activity | ◐ | Word Tiles has a personal pace comparison. There are no campaign split timers or timed main-story requirements. | [tiles.ts](../src/domain/tiles.ts), [ui.ts](../src/ui/ui.ts) |
| 133 | Trade-offs with costs | ◐ | Crossings state who gains, waits or loses a resource. There are no random wagers at shrines. | [crossings.ts](../src/domain/crossings.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 134 | Recover a misplaced object | ✓ | The Fold in the Gauge separates intake from ownership, checks a witness and the object, then leaves a return or loan receipt. | [lost-gauge.test.ts](../tests/lost-gauge.test.ts), [preserved.ts](../src/maps/preserved.ts) |
| 135 | Branching route choices | ◐ | Bank works open different Forest paths and a later Council account. There is no randomized run map. | [forest-guide.test.ts](../tests/forest-guide.test.ts), [council.ts](../src/maps/council.ts) |
| 136 | Prestige resets | ✗ | Current credits and collections persist across recoveries. The campaign does not reset progress for prestige rewards. | [saves.ts](../src/domain/saves.ts), [permanent.ts](../src/domain/permanent.ts) |
| 137 | Personal replay ghost | ◐ | Word Tiles shows a local ghost of the player's best run. A rival ghost across encounters remains open. | [tiles.ts](../src/domain/tiles.ts), [ui.ts](../src/ui/ui.ts) |

## IX. Creativity and self-expression

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 138 | Arrange a small historical scene | ○ | Quarters can display acquired objects. A diorama to compare reconstructions and their assumptions remains open. | [quarters.ts](../src/domain/quarters.ts), [preserved-reconstruction.test.ts](../tests/preserved-reconstruction.test.ts) |
| 139 | Photography and an album | ✓ | Take and caption observations in the local album. At the House, record from two positions and track which cues each frame contains. | [album.test.ts](../tests/album.test.ts), [film-cuts.test.ts](../tests/film-cuts.test.ts) |
| 140 | Player-built levels | ✗ | In-game quests and layouts are authored. Classroom play has no level editor or student publishing tools. | [AGENTS.md](../AGENTS.md), [exhibition.ts](../src/domain/exhibition.ts) |
| 141 | Music box and sound choice | ◐ | The music box lets players try and play notes. Custom room soundtracks are absent. | [musicbox.ts](../src/domain/musicbox.ts), [musicbox.test.ts](../tests/musicbox.test.ts) |
| 142 | Dyes and heraldry | ✓ | Choose palette, crest and dyes. Appearances carry identity rather than stat bonuses. | [crest.ts](../src/domain/crest.ts), [appearance.ts](../src/domain/appearance.ts), [shop.ts](../src/domain/shop.ts) |
| 143 | Visible restoration | ✓ | The Lamp Wall, washhouse and Forest banks respond to local work. | [story.json](../src/content/story.json), [emberford-followups.test.ts](../tests/emberford-followups.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 144 | Museum curation | ✓ | Players curate particular historical objects and decide on label, layout and audience. Visitors respond to what is displayed. | [exhibition.ts](../src/domain/exhibition.ts), [preserved-exhibition.test.ts](../tests/preserved-exhibition.test.ts) |
| 145 | Befriend and observe creatures | ◐ | Observe and offer Lorelings a suitable location. Pet homes, tricks and routine care remain open. | [lorelings.ts](../src/domain/lorelings.ts), [lorelings.test.ts](../tests/lorelings.test.ts) |
| 146 | Plant and habitat variation | ○ | The Forest samples moss in four settings. A garden that lets players compare plant care and environmental effects remains open. | [forest-sampling.test.ts](../tests/forest-sampling.test.ts) |
| 147 | Expressive emotes | ✓ | Choose character gestures for playful in-world expression. | [emotes.ts](../src/domain/emotes.ts), [WorldScene.ts](../src/scenes/WorldScene.ts) |
| 148 | A town celebration | ◐ | Emberford and Island stage a connected Lantern Fair with runner or host tests and an arrival choice. A seasonal or real-term calendar remains open. | [lanternfair.test.ts](../tests/lanternfair.test.ts), [lanternfair.ts](../src/maps/lanternfair.ts) |
| 149 | Calm exploration option | ✓ | Calm mode lets players delay interruptions and retain control over the pace. | [settings.ts](../src/app/settings.ts), [engine.ts](../src/domain/engine.ts) |
| 150 | Letters across places | ◐ | Authored community letters carry a previous choice forward in the local Journal. Sending messages between players is outside the offline design. | [community-letters.json](../src/content/community-letters.json), [communityLetters.ts](../src/domain/communityLetters.ts), [AGENTS.md](../AGENTS.md) |
| 151 | Reshape a small public space | ○ | Players repair banks and choose access routes. A customizable sanctuary landscape remains open. | [forest-guide.test.ts](../tests/forest-guide.test.ts), [quarters.ts](../src/domain/quarters.ts) |
| 152 | Shared tea or cocoa preparation | ○ | Hearth conversations offer a low-pressure gathering. A playable brewing task remains open. | [hearth.ts](../src/domain/hearth.ts) |
| 153 | Sky observations and drawing | ✓ | Star Pictures compares sky traditions and asks players to make and interpret a marked picture. | [compendiumGames.ts](../src/domain/compendiumGames.ts), [learning.test.ts](../tests/learning.test.ts) |

## X. Social and classroom play

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 154 | Networked class encounters | ✗ | The game has no live team server. A teacher can discuss local Showdown cases together. | [AGENTS.md](../AGENTS.md), [showdown.ts](../src/domain/showdown.ts) |
| 155 | Different roles within a shared task | ◐ | Players can choose roles and hear specialists' different perspectives; remote or paired-player control is absent. | [roles.ts](../src/domain/roles.ts), [council-story.test.ts](../tests/council-story.test.ts) |
| 156 | Mentorship and buddy support | ◐ | Ise, Kip and the loyalty quests model help and shared reasoning. No student accounts pair players or award peer bonuses. | [nexus-handle.json](../src/content/nexus-handle.json), [loyalty.ts](../src/domain/loyalty.ts) |
| 157 | Safe exchanges | ◐ | Wenna and The Spare Tag offer local NPC trade. There is no online student exchange board. | [trade.ts](../src/domain/trade.ts), [compendiumGames.ts](../src/domain/compendiumGames.ts) |
| 158 | Pass work along a relay | ✓ | The Packing Table, Cold Store handoff and Council carry checks or information from one person to another. | [opening-packing.test.ts](../tests/opening-packing.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [council-story.test.ts](../tests/council-story.test.ts) |
| 159 | Student-authored hint stones | ✗ | Lumen gives authored hints. Players cannot broadcast tips to others. | [AGENTS.md](../AGENTS.md), [lumen.test.ts](../tests/lumen.test.ts) |
| 160 | Gathering in team spaces | ◐ | The Nexus, guild spaces and hearth are in-world meeting places. There are no shared player-controlled guild halls. | [nexus.ts](../src/maps/nexus.ts), [emberford.ts](../src/maps/emberford.ts), [hearth.ts](../src/domain/hearth.ts) |
| 161 | Optional rhetorical duels | ✓ | The practice and public Showdowns let players make, challenge and revise claims. Trivia duels are excluded. | [showdown.ts](../src/domain/showdown.ts), [playthrough.test.ts](../tests/playthrough.test.ts) |
| 162 | Friendly competing plans | ○ | Competing policies are playable. A noncompetitive shared-space planning challenge between two NPC groups remains open. | [civicConsole.ts](../src/domain/civicConsole.ts), [emberford.ts](../src/maps/emberford.ts) |
| 163 | Spectating and sharing replays | ✗ | The offline interface has no spectator lounge or replay publication. A teacher can discuss a case on one device. | [AGENTS.md](../AGENTS.md), [DESIGN_SUMMARY.md](DESIGN_SUMMARY.md) |
| 164 | Peer commendations online | ✗ | Game characters can thank a player. The game does not collect or share peer ratings. | [AGENTS.md](../AGENTS.md), [memories.json](../src/content/memories.json) |
| 165 | Community repair projects | ◐ | Characters repair paths, labels and the washhouse after player decisions. Simultaneous player construction is absent. | [forest-guide.test.ts](../tests/forest-guide.test.ts), [emberford-followups.test.ts](../tests/emberford-followups.test.ts) |
| 166 | Collaborative puzzle structure | ◐ | The Undercroft and approach checks use clues and let players compare records. They run for one player rather than as networked escape rooms. | [undercroft.ts](../src/maps/undercroft.ts), [nile-map-guide.test.ts](../tests/nile-map-guide.test.ts) |
| 167 | Assign online squads | ✗ | The offline campaign has no class roster or rotation system. Companion swaps are player-controlled. | [AGENTS.md](../AGENTS.md), [roles.ts](../src/domain/roles.ts) |
| 168 | Multiplayer level synchronization | ✗ | No multiplayer levels or matching service. Access options and adjustable hints apply locally. | [settings.ts](../src/app/settings.ts), [AGENTS.md](../AGENTS.md) |

## XI. Mystery and investigation

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 169 | Connect clues visually | ✓ | Thread and clue-board play relates claims to dated evidence and sources. | [clueboard.ts](../src/domain/clueboard.ts), [clueboard.test.ts](../tests/clueboard.test.ts) |
| 170 | Change what a tool reveals | ✓ | The Date-Kind Lens and Hinged Reader change which parts of a record a player can inspect. | [playthrough.test.ts](../tests/playthrough.test.ts), [opening-viewer.test.ts](../tests/opening-viewer.test.ts) |
| 171 | Challenge a contradiction | ✓ | Corvan's cross-examination and Emberford's one-name tag let players counter claims using a particular source. | [showdown.ts](../src/domain/showdown.ts), [emberford-followups.test.ts](../tests/emberford-followups.test.ts) |
| 172 | Follow a repeating event | ○ | Repeated watches and bell times are authored cases. A looping day with persistent clues remains open. | [living-forest.test.ts](../tests/living-forest.test.ts), [m05-observatory.json](../src/content/m05-observatory.json) |
| 173 | Witnesses tell different versions | ✓ | Drowned Bell and the Nile reading window compare accounts and framing. Elsbet’s two takes add a different case: one person addresses two audiences, and the signed index follows the evidence. | [crossings.ts](../src/domain/crossings.ts), [nile-followups.test.ts](../tests/nile-followups.test.ts), [voices-elsbet.json](../src/content/voices-elsbet.json), [vesper.json](../src/content/vesper.json) |
| 174 | Trace rumors to their sources | ✓ | Learn a rumor, identify the route by which it spread and compare the original record. | [rumours.ts](../src/domain/rumours.ts), [rumour.json](../src/content/rumour.json) |
| 175 | Interpret language in use | ◐ | Compare ferry cant, local signs and a guide beside original words. A multi-chapter cipher system is absent. | [translate.test.ts](../tests/translate.test.ts), [voices-story.test.ts](../tests/voices-story.test.ts) |
| 176 | Choice-based epilogue vignettes | ✓ | The journal's Afterwards account reads specific route choices and opening motive. | [epilogue.ts](../src/domain/epilogue.ts), [crossings.test.ts](../tests/crossings.test.ts) |
| 177 | Persistent world memory | ✓ | Characters and some signs and paths respond to earlier choices, including cross-chapter handoffs. | [echoes.test.ts](../tests/echoes.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 178 | Act within staged beats | ◐ | The cold open, illustrated scenes and interactive world actions change what happens. A comic-panel or cinematic editor remains open. | [m01-nexus.json](../src/content/m01-nexus.json), [illustrations.ts](../src/ui/illustrations.ts) |
| 179 | Rebuild a document with limits | ✓ | Repair a copied notice and compare restored lines; keep chronological source limits in the Nile. | [copies-side.test.ts](../tests/copies-side.test.ts), [nile-followups.test.ts](../tests/nile-followups.test.ts) |
| 180 | Public debate and persuasion | ✓ | Practice, Corvan and Vesper scenes support concessions and changes of argument in front of an audience. | [showdown.ts](../src/domain/showdown.ts), [performance-vesper.test.ts](../tests/performance-vesper.test.ts) |
| 181 | A faction and people revealed by letters | ✓ | Vesper writes from within the Seal story, and five community letters respond to earlier choices. Nellis carries a disputed record between chapters. | [letters.ts](../src/domain/letters.ts), [communityLetters.ts](../src/domain/communityLetters.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts) |
| 182 | Episodic campaign progression | ✓ | Fifteen authored chapters open through campaign gates; each has a concrete local investigation. | [nexus.ts](../src/maps/nexus.ts), [chapter-maps.test.ts](../tests/chapter-maps.test.ts) |
| 183 | Revisit a memory through objects | ◐ | Players wind Elsbet’s reel, check the signed permission slip and compare two takes presented in dialogue. They choose where the public take can be used. A walkable frozen scene remains open. | [voices-elsbet.json](../src/content/voices-elsbet.json), [voices.ts](../src/maps/voices.ts) |

## XII. Logic and tinkering

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 184 | Constraint deductions | ✓ | The Weigh-House Slate and Civic arrival rack let players reason about which arrangements satisfy fixed conditions. | [fairgames.ts](../src/domain/fairgames.ts), [civic-story.test.ts](../tests/civic-story.test.ts) |
| 185 | Route a flow | ✓ | Water Commons compares gate settings before and after repair and lets players route a relief branch on a tile board. | [water-gate.test.ts](../tests/water-gate.test.ts), [route-tiles.test.ts](../tests/route-tiles.test.ts), [water.ts](../src/maps/water.ts) |
| 186 | Wordplay and meaning | ✓ | Sign-Smith and translation choices change how people read a notice. Word Tiles separately matches glossary terms and meanings. | [puzzles.test.ts](../tests/puzzles.test.ts), [translate.test.ts](../tests/translate.test.ts), [tiles.ts](../src/domain/tiles.ts) |
| 187 | Push objects through constraints | ○ | Island crates and the Packing Table model grouping and route capacity. A push-block room remains open. | [island-story.test.ts](../tests/island-story.test.ts), [opening-packing.test.ts](../tests/opening-packing.test.ts) |
| 188 | Optics and light | ◐ | The Third Groove compares the same pinned slip under light from two positions. Prism refraction puzzles are absent. | [nile-followups.test.ts](../tests/nile-followups.test.ts) |
| 189 | Align a view | ✓ | Rotate a map against fixed landmarks in Nile and align shore marks at Lantern House. | [nile-map-guide.test.ts](../tests/nile-map-guide.test.ts), [cartographers-side.test.ts](../tests/cartographers-side.test.ts) |
| 190 | Recognize rhythmic patterns | ✓ | The bell stair, music box and rehearsal tools show what repeating or reordering a sequence changes. | [bells.test.ts](../tests/bells.test.ts), [musicbox.test.ts](../tests/musicbox.test.ts), [stage-rehearsal.test.ts](../tests/stage-rehearsal.test.ts) |
| 191 | Balance and compare measures | ✓ | Balance the shared standard; compare mass, work and what a reading warrants. | [balance.test.ts](../tests/balance.test.ts), [market-scale.test.ts](../tests/market-scale.test.ts) |
| 192 | Reorder a visible procedure | ○ | The Civic and Island tools let a player compare rules. Visual instructions for a clockwork helper remain open. | [civicConsole.ts](../src/domain/civicConsole.ts), [islandPlan.ts](../src/domain/islandPlan.ts) |
| 193 | Pair records by content | ✓ | Word Tiles uses a recall grid. City of Copies offers a story-based comparison where matching the date and source restores a legible record. | [tiles.ts](../src/domain/tiles.ts), [copies-side.test.ts](../tests/copies-side.test.ts) |
| 194 | Manipulate a small object in several views | ○ | The Hinged Reader and Tilt Tray give two controlled views. A rotatable tactile puzzle box remains open. | [opening-viewer.test.ts](../tests/opening-viewer.test.ts), [nile-followups.test.ts](../tests/nile-followups.test.ts) |
| 195 | Test a route or repair before opening it | ◐ | Forest bank work and the Nile load model expose physical constraints. There is no free-form bridge builder. | [forest-guide.test.ts](../tests/forest-guide.test.ts), [nileModel.ts](../src/domain/nileModel.ts) |
| 196 | Layered hints without penalties | ✓ | Lumen gives four hint depths. Asking for help does not cost permanent credit. | [lumen.test.ts](../tests/lumen.test.ts), [AGENTS.md](../AGENTS.md) |
| 197 | Check a changing shadow or light | ◐ | The Third Groove changes what grooves a reader can see under different light. A shadow-operated lock remains open. | [nile-followups.test.ts](../tests/nile-followups.test.ts) |
| 198 | Study a clock's mechanism | ◐ | The Council checks advancing and stopped watches against an independent reference. Players do not assemble or tune gear ratios. | [council-clock.test.ts](../tests/council-clock.test.ts), [council-story.test.ts](../tests/council-story.test.ts) |

## XIII. Movement and rhythm

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 199 | Terrain traversal tools | ○ | Forest works alter routes, but equipment-driven traversal such as a cord or landing pole remains open. | [forest-guide.test.ts](../tests/forest-guide.test.ts), [forest.ts](../src/maps/forest.ts) |
| 200 | Route timing and momentum | ○ | The Nile cart evaluates alternative plans. An optional needs-based foot course without precision jumping remains open. | [nileModel.ts](../src/domain/nileModel.ts), [forest.ts](../src/maps/forest.ts) |
| 201 | Revisit with a new ability | ✓ | Keepsakes reveal views in Elsbet's study, and Kip's map opens the old ferry road. The player returns with a meaningful tool. | [story.json](../src/content/story.json), [study.ts](../src/maps/study.ts), [story.test.ts](../tests/story.test.ts) |
| 202 | Match a rhythm | ✓ | The music box and bell stair use rhythmic sequences and accessible feedback. | [musicbox.test.ts](../tests/musicbox.test.ts), [bells.test.ts](../tests/bells.test.ts) |
| 203 | Combat reaction windows | ✗ | The campaign's challenges are inquiry, practice and retesting. Reaction-based defense is outside the school-game brief. | [AGENTS.md](../AGENTS.md), [showdown.ts](../src/domain/showdown.ts) |
| 204 | Surroundings change during play | ◐ | The plaque, print, forest paths and quay notices change after player choices. Destructible arenas are outside the adaptation. | [restore.test.ts](../tests/restore.test.ts), [opening-print.test.ts](../tests/opening-print.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 205 | Dodge patterns under attack | ✗ | World traversal supports calm observation. Dodging projectiles is outside the nonviolent campaign. | [AGENTS.md](../AGENTS.md), [WorldScene.ts](../src/scenes/WorldScene.ts) |
| 206 | Explore physical cause and effect | ◐ | Try cart routes, weigh materials and test water settings. Physical effects are bounded by the tools rather than a sandbox. | [nileModel.ts](../src/domain/nileModel.ts), [marketScale.ts](../src/domain/marketScale.ts), [waterGate.ts](../src/domain/waterGate.ts) |
| 207 | Forgiving timing inputs | ◐ | Optional timing games offer retries. Main-route confirmations allow deliberate input; cinematic quick-time events remain absent. | [bells.test.ts](../tests/bells.test.ts), [musicbox.ts](../src/domain/musicbox.ts), [settings.ts](../src/app/settings.ts) |
| 208 | Control a rolling object | ○ | A safe rolling-object comparison could extend the cart test to momentum. Physics-based bowling and knockback are unimplemented. | [nileModel.ts](../src/domain/nileModel.ts) |
| 209 | Read layered viewpoints | ◐ | Headland, stairs, dock and terrace positions provide distinct sightlines. Movement is organized across discrete map routes. | [observatory.ts](../src/maps/observatory.ts), [voices.ts](../src/maps/voices.ts), [nile-map-guide.test.ts](../tests/nile-map-guide.test.ts) |
| 210 | Gravity changes and zero-gravity travel | ✗ | The campaign stays on grounded, walkable maps. Gravity overlays are outside the current travel rules. | [types.ts](../src/maps/types.ts), [DESIGN_SUMMARY.md](DESIGN_SUMMARY.md) |
| 211 | Expressive movement choices | ○ | Emotes give local expression. A free-form movement route about accuracy and observation remains open. | [emotes.ts](../src/domain/emotes.ts), [forest.ts](../src/maps/forest.ts) |

## XIV. Simulation and management

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 212 | Supply and delivery logistics | ✓ | Pack eight records, coordinate receiving and move eight crates in fixed conditions. Each plan exposes a different bottleneck. | [opening-packing.test.ts](../tests/opening-packing.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [island-story.test.ts](../tests/island-story.test.ts) |
| 213 | Delegate work with limits | ◐ | Choose a helper for the washhouse, civic desk or Council relay. Ongoing staff recruitment and management remain open. | [emberford-followups.test.ts](../tests/emberford-followups.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [council-story.test.ts](../tests/council-story.test.ts) |
| 214 | Plan shared spaces | ○ | Seating and service choices use fixed layouts. A reusable campus zoning tool would be a separate feature. | [performance-story.test.ts](../tests/performance-story.test.ts), [civicConsole.ts](../src/domain/civicConsole.ts) |
| 215 | Budgets and finite supplies | ◐ | A Market purse and marks limit purchasing choices. The campaign has no bank or interest loop. | [marketScale.ts](../src/domain/marketScale.ts), [shop.ts](../src/domain/shop.ts) |
| 216 | Care for habitats | ◐ | Green Squares and Forest guidance support observing and adjusting paths. Ecological populations are not simulated across seasons. | [forest-sampling.test.ts](../tests/forest-sampling.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 217 | Unlock new methods over time | ◐ | Insight talents and acquired tools change available checks. There is no separate technology era tree. | [talents.ts](../src/domain/talents.ts), [story.test.ts](../tests/story.test.ts) |
| 218 | Prepare for changing conditions | ✓ | Check flood, rain, tide and allocation conditions before publishing a practical response, then revise when conditions change. | [crossings.ts](../src/domain/crossings.ts), [observatory.test.ts](../tests/observatory.test.ts), [water-story.test.ts](../tests/water-story.test.ts), [island-story.test.ts](../tests/island-story.test.ts) |
| 219 | Trade and fulfill local requests | ◐ | Barter, weigh lots and trade a spare tag. Players do not run an ongoing shop with generated orders. | [trade.ts](../src/domain/trade.ts), [compendiumGames.ts](../src/domain/compendiumGames.ts), [marketScale.ts](../src/domain/marketScale.ts) |
| 220 | Allocate a work schedule | ◐ | Civic publication and the Council compare limited windows and timing overlaps. A player calendar remains open. | [civic-story.test.ts](../tests/civic-story.test.ts), [council-story.test.ts](../tests/council-story.test.ts) |
| 221 | Plan a visit or attraction | ◐ | The Lantern Fair lets the player rehearse, place and open a welcome along two routes. Formal attraction ratings and dignitary systems remain open. | [lanternfair.test.ts](../tests/lanternfair.test.ts) |
| 222 | Send work beyond the current scene | ◐ | NPC couriers carry player decisions to later sites and reply. A reusable companion expedition service remains open. | [opening-ferry.test.ts](../tests/opening-ferry.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts) |
| 223 | Plan an exhibit and its resources | ◐ | Exhibition choices coordinate access, source context and layout. There is no grant application or money allocation board. | [exhibition.ts](../src/domain/exhibition.ts), [preserved-exhibition.test.ts](../tests/preserved-exhibition.test.ts) |
| 224 | Change a repeated workflow | ○ | The City of Copies offers a corrected procedure. Repeated chores and optional automation of them remain open. | [copies-story.test.ts](../tests/copies-story.test.ts) |

## XV. Feedback, access and course connections

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 225 | Automatic difficulty based on tracking | ✗ | Players choose comfort and hint settings. The offline game does not infer ability to adjust challenge. | [settings.ts](../src/app/settings.ts), [AGENTS.md](../AGENTS.md) |
| 226 | Access settings and inputs | ✓ | Use keyboard controls, captions, text scaling, contrast and reduced effects. Read-aloud is available where supported. | [settings.ts](../src/app/settings.ts), [keymap.ts](../src/app/keymap.ts), [captions.test.ts](../tests/captions.test.ts) |
| 227 | Comfort choices | ◐ | Calm, contrast, sound and reduced-motion settings support comfort. Theme-specific phobia filters are separate open work. | [settings.ts](../src/app/settings.ts), [WorldScene.ts](../src/scenes/WorldScene.ts) |
| 228 | Interface inside the world | ✓ | Open the folding map from the compass and use the Journal and Waystones. | [ui.ts](../src/ui/ui.ts), [WorldScene.ts](../src/scenes/WorldScene.ts) |
| 229 | Sound responds to the story | ◐ | An original theme returns in different arrangements at the opening, the rival encounter and the Council. The rest of the map music uses shared tracks. | [storyMotifs.ts](../src/domain/storyMotifs.ts), [ambience.ts](../src/app/ambience.ts) |
| 230 | Responsive feedback | ✓ | Finishing, revising and unlocking actions give visual and audio responses. Captions support the same events. | [WorldScene.ts](../src/scenes/WorldScene.ts), [captions.ts](../src/app/captions.ts) |
| 231 | In-world notices and dispatches | ◐ | The City of Copies, ferry and Nile circulate authored local records. These are fictional notices independent of current news. | [copies-story.test.ts](../tests/copies-story.test.ts), [opening-ferry.test.ts](../tests/opening-ferry.test.ts), [AGENTS.md](../AGENTS.md) |
| 232 | Course ideas embedded in play | ◐ | Actual objects, practice actions and the optional teacher progress import bridge classroom reasoning. No external codes unlock story play. | [TOK_ALIGNMENT.md](TOK_ALIGNMENT.md), [report.ts](../src/teacher/report.ts) |
| 233 | Guide character and glossary | ✓ | Lumen offers contextual hints; the glossary ties terms to in-game situations. | [lumen.test.ts](../tests/lumen.test.ts), [glossary.test.ts](../tests/glossary.test.ts) |
| 234 | Low-stakes rehearsal | ✓ | Practice Showdowns, ink strips, stage cues and timing trials let players compare before publishing. | [playthrough.test.ts](../tests/playthrough.test.ts), [stage-rehearsal.test.ts](../tests/stage-rehearsal.test.ts), [council-clock.test.ts](../tests/council-clock.test.ts) |
| 235 | Reflect through character moments | ✓ | Hearth talks, source revisions and journal consequences invite reflection through decisions and dialogue. | [hearth.ts](../src/domain/hearth.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 236 | Inclusive avatar choices | ✓ | Origins, pronouns, accessible looks and voice are elective and do not penalize play. | [appearance.ts](../src/domain/appearance.ts), [player.ts](../src/domain/player.ts), [origins.json](../src/content/origins.json) |
| 237 | Change activity during a chapter | ◐ | Seeded events and brief field games offer varied local interruptions. There is no calendar of genre rotations. | [engine.ts](../src/domain/engine.ts), [fieldgames.ts](../src/domain/fieldgames.ts) |
| 238 | Compare alternative approaches safely | ◐ | Replay tool trials before publication, including pack layouts and sea symbols. The journal cannot replay a chapter in a separate timeline. | [opening-packing.test.ts](../tests/opening-packing.test.ts), [cartographers-side.test.ts](../tests/cartographers-side.test.ts), [saves.ts](../src/domain/saves.ts) |
| 239 | Cheat and toybox switches | ✗ | Optional relaxed play uses comfort and hint settings while leaving honest evidence and authored story effects legible. | [AGENTS.md](../AGENTS.md), [settings.ts](../src/app/settings.ts) |
| 240 | Student-published guidebooks | ✗ | The journal and dialogue are authored. Student accounts, public guides and player-created quest content are excluded. | [AGENTS.md](../AGENTS.md), [ui.ts](../src/ui/ui.ts) |
| 241 | Break-friendly progress | ◐ | Ledger streak shields and separate permanent credit protect breaks. Time away does not create an XP multiplier. | [ledger.ts](../src/domain/ledger.ts), [permanent.ts](../src/domain/permanent.ts) |
| 242 | Short and longer activities | ✓ | Brief crossings, field games and 15 longer chapters give different stopping points. Duration depends on the player. | [fieldgames.ts](../src/domain/fieldgames.ts), [crossings.ts](../src/domain/crossings.ts), [LEARNING_DESIGN.md](LEARNING_DESIGN.md) |
| 243 | Optional term reflection | ○ | Afterwards and the Ledger summarize play. An explicit private term-highlight reel remains open. | [epilogue.ts](../src/domain/epilogue.ts), [ledger.ts](../src/domain/ledger.ts) |

## XVI. Minigames

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 244 | Timing and reflex games | ◐ | The bell stair and music box give optional timing input. Balance evidence can be checked without speed scoring. | [bells.test.ts](../tests/bells.test.ts), [musicbox.test.ts](../tests/musicbox.test.ts), [balance.test.ts](../tests/balance.test.ts) |
| 245 | Cards, boards and chance without stakes | ✓ | Showdowns use evidence cards and Three Doors uses disclosed chance. There are no token wagers. | [playthrough.test.ts](../tests/playthrough.test.ts), [fairgames.test.ts](../tests/fairgames.test.ts) |
| 246 | Logic and constraints | ✓ | The Weigh-House Slate, civic rack, and puzzle props use logical arrangement and visible outcomes. | [fairgames.ts](../src/domain/fairgames.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [puzzles.test.ts](../tests/puzzles.test.ts) |
| 247 | Rhythm and performance | ✓ | The music box and House of Performance distinguish timing, silence and interpretation. | [musicbox.test.ts](../tests/musicbox.test.ts), [performance-story.test.ts](../tests/performance-story.test.ts) |
| 248 | Hands-on making | ◐ | Forge, repair, dye, pack, and calibrate things. Cooking and alchemy loops remain open. | [craft.ts](../src/domain/craft.ts), [opening-handle.test.ts](../tests/opening-handle.test.ts), [opening-packing.test.ts](../tests/opening-packing.test.ts) |
| 249 | Friendly contests | ◐ | Argument arenas and local games offer structured challenge. Sports fixtures and racing mounts are absent. | [showdown.ts](../src/domain/showdown.ts), [fieldgames.ts](../src/domain/fieldgames.ts) |
| 250 | Small management models | ◐ | Markets, Water Commons and Civic compare different rules and allocations. A lasting tycoon loop remains open. | [market-story.test.ts](../tests/market-story.test.ts), [water-story.test.ts](../tests/water-story.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts) |
| 251 | Games inside the world | ✓ | Word Tiles, Three Doors and Lanterns and Bones are optional games held inside the story's locations. | [tiles.ts](../src/domain/tiles.ts), [fieldgames.ts](../src/domain/fieldgames.ts) |
| 252 | Photography and field observation | ◐ | Players caption photos, record wildlife and compare two rehearsal camera positions. A moving wildlife assignment remains open. | [album.test.ts](../tests/album.test.ts), [forest-watch.test.ts](../tests/forest-watch.test.ts), [film-cuts.test.ts](../tests/film-cuts.test.ts) |
| 253 | Persuasion and reading a room | ✓ | Showdowns, hearth choices and public placements respond to audience and wording. | [showdown.ts](../src/domain/showdown.ts), [hearth.ts](../src/domain/hearth.ts), [copies-margin.test.ts](../tests/copies-margin.test.ts) |
| 254 | Compare prices and exchange terms | ◐ | Barter and the Market compare price bases, budget and uses. Auction play remains open without a stake. | [trade.ts](../src/domain/trade.ts), [market-story.test.ts](../tests/market-story.test.ts) |
| 255 | Defend a public record | ○ | A later notice-board challenge could protect source and date through a succession of competing claims. Tactical combat is outside the adaptation. | [copies-story.test.ts](../tests/copies-story.test.ts), [showdown.ts](../src/domain/showdown.ts) |
| 256 | Observe and befriend creatures | ◐ | Lorelings respond to habitat and observations. Catching for combat and breeding are excluded. | [lorelings.ts](../src/domain/lorelings.ts), [lorelings.test.ts](../tests/lorelings.test.ts) |
| 257 | A timed observation course | ○ | The Island timing is modeled. A calm-capable walking route that compares haste and missed observations remains open. | [islandPlan.ts](../src/domain/islandPlan.ts), [forest.ts](../src/maps/forest.ts) |
| 258 | Find a story's weak link through play | ✓ | Check sources in The Mark and the Hands or use the Forecast Board. Trivia quizzes are outside the classroom design. | [emberford-followups.test.ts](../tests/emberford-followups.test.ts), [forecast.test.ts](../tests/forecast.test.ts), [AGENTS.md](../AGENTS.md) |
| 259 | Art, clothing and decorating | ◐ | Dyes, crest, quarters and exhibit layout support creative decisions. Runways and appearance grades are absent. | [appearance.ts](../src/domain/appearance.ts), [quarters.ts](../src/domain/quarters.ts), [preserved-exhibition.test.ts](../tests/preserved-exhibition.test.ts) |
| 260 | Delicate dig and restoration | ✓ | The Careful Dig weighs how excavation changes an observation. The Founders' Plaque compares restoration choices and what survives. | [compendiumGames.ts](../src/domain/compendiumGames.ts), [learning.test.ts](../tests/learning.test.ts), [restore.test.ts](../tests/restore.test.ts) |
| 261 | Prepare food for a visitor | ✓ | Try two heating orders for the same six measures, choose when to serve and see who actually got a cup. Reopen the practice bench with a different shift. | [ferry-kettle.test.ts](../tests/ferry-kettle.test.ts), [ferryKettle.ts](../src/maps/ferryKettle.ts) |
| 262 | Trace the sky and measure a view | ✓ | Star Pictures compares constellation traditions and measures the same height from the instrument. | [compendiumGames.ts](../src/domain/compendiumGames.ts), [observatory.ts](../src/maps/observatory.ts) |

## XVI. Side quests

| # | Adapted idea | Status | Playable example or remaining work | Reference |
| ---: | --- | :---: | --- | --- |
| 263 | Purposeful courier errands | ✓ | Emberford repair tickets, archive copies and public notices reach distinct receivers and produce a checkable receipt or response. | [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [opening-packing.test.ts](../tests/opening-packing.test.ts) |
| 264 | Protect papers in transit | ◐ | The City of Copies preserves linked strips across a delivery, and the Packing Table changes which papers travel together. There is no no-teleport restriction. | [copies-margin.test.ts](../tests/copies-margin.test.ts), [opening-packing.test.ts](../tests/opening-packing.test.ts) |
| 265 | Clear a source of trouble | ◐ | Investigate the Undercroft and name reasoning errors. A recurring Fray contract board remains open. | [undercroft.ts](../src/maps/undercroft.ts), [fray.json](../src/content/fray.json) |
| 266 | Accompany a vulnerable courier | ○ | The Council receives a courier's timing question and the handoff moves a live record. A sustained playable escort route remains open. | [council-story.test.ts](../tests/council-story.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts) |
| 267 | Investigation and forensic comparisons | ✓ | Trace the blade, compare panel weight and custody, and reconstruct who wrote which record. | [playthrough.test.ts](../tests/playthrough.test.ts), [metalworks-story.test.ts](../tests/metalworks-story.test.ts), [preserved.test.ts](../tests/preserved.test.ts) |
| 268 | Explore unmarked sites | ✓ | Find the Undercroft, side rooms, secrets and Question Stones through observation and clues. | [undercroft.ts](../src/maps/undercroft.ts), [nexus.ts](../src/maps/nexus.ts), [story.json](../src/content/story.json) |
| 269 | Companion history quests | ✓ | Four loyalty investigations involve a mistake, repair and personal choice. | [loyalty.ts](../src/domain/loyalty.ts), [loyalty.test.ts](../tests/loyalty.test.ts) |
| 270 | Guild responsibilities | ◐ | Emberford community standing affects lines. A staged career across guild ranks remains open. | [communities.ts](../src/domain/communities.ts), [emberford.ts](../src/maps/emberford.ts) |
| 271 | Dilemmas with real trade-offs | ✓ | Choose who receives water, entry or reading support. Physical and interpersonal effects persist after the choice. | [water-story.test.ts](../tests/water-story.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [voices-last-lamp.test.ts](../tests/voices-last-lamp.test.ts) |
| 272 | Collect across linked places | ◐ | Keep and reuse evidence, artifacts and keepsakes. A campaign-long collection route with its own conclusion remains open. | [story.json](../src/content/story.json), [permanent.ts](../src/domain/permanent.ts) |
| 273 | Repeatable local leads | ◐ | The rumor mill and seeded Word Tiles support optional revisits. Generated daily guild errands remain open. | [rumours.ts](../src/domain/rumours.ts), [tiles.ts](../src/domain/tiles.ts) |
| 274 | Retrieve a record with permission | ○ | Quiet observation and handoffs use legitimate access. A stealth-like approved retrieval remains open; theft is excluded. | [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [AGENTS.md](../AGENTS.md) |
| 275 | A chain of exchanges | ✓ | The Spare Tag moves goods between characters with different uses and reasons for agreeing. | [compendiumGames.ts](../src/domain/compendiumGames.ts), [learning.test.ts](../tests/learning.test.ts) |
| 276 | Restore part of a settlement | ✓ | Light lamps, repair a washhouse and open a better Forest crossing. Changes remain visible in the world. | [story.json](../src/content/story.json), [emberford-followups.test.ts](../tests/emberford-followups.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| 277 | Find a place from a drawing | ◐ | Lantern House, the Mine Map guide and the old ferry route use different map conventions. A standalone riddle-led treasure trail remains open. | [cartographers-side.test.ts](../tests/cartographers-side.test.ts), [nile-map-guide.test.ts](../tests/nile-map-guide.test.ts), [story.test.ts](../tests/story.test.ts) |
| 278 | Post-ending mastery challenge | ○ | A higher-complexity Fray debate or audit after the Council remains open. The Hollow Archivist is an existing earlier encounter. | [undercroft.ts](../src/domain/undercroft.ts), [epilogue.ts](../src/domain/epilogue.ts) |
| 279 | Plan an authorized audit | ◐ | Nellis uses the inspected carriers' copy and permissions in two chapters. A multi-stage authorized retrieval under time pressure remains open. | [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [preserved.test.ts](../tests/preserved.test.ts) |
| 280 | Playful detours | ✓ | The goat, Madame Quandary, puns and overheard disagreements offer humor tied to perspective or inference. | [crossings.ts](../src/domain/crossings.ts), [hearth.ts](../src/domain/hearth.ts) |
| 281 | Festival and friendly gathering | ✓ | Rehearse the Emberford fair, send the plan and open a distinct welcome on the Island. A local plan works if the courier never arrives. | [lanternfair.test.ts](../tests/lanternfair.test.ts), [lanternfair.ts](../src/maps/lanternfair.ts) |
| 282 | Investigate a schedule | ◐ | The Forester's watches, Civic arrivals and Council overlap depend on timing. A repeating story day remains open. | [living-forest.test.ts](../tests/living-forest.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [council-story.test.ts](../tests/council-story.test.ts) |
| 283 | Take on an optional limitation | ○ | Players can voluntarily ignore tools and hints. A formal mastery mission with declared limits remains open. | [lumen.test.ts](../tests/lumen.test.ts), [roles.ts](../src/domain/roles.ts) |
| 284 | Deliberate in council | ✓ | Read historical and local sources, compare checks, issue a first decision and revise for the shutter courier. | [council-story.test.ts](../tests/council-story.test.ts), [vesper.json](../src/content/vesper.json) |
| 285 | Reporting and public correction | ◐ | Restore an omitted time or source and decide which edition to send. A separate headline-writing activity remains open. | [copies-story.test.ts](../tests/copies-story.test.ts), [copies-side.test.ts](../tests/copies-side.test.ts) |
| 286 | Seat placement as negotiation | ◐ | The House of Performance compares seating access and sightlines. A summit between rival guilds remains open. | [performance-story.test.ts](../tests/performance-story.test.ts) |
| 287 | Reconstruct a past voice or event | ✓ | Follow Elsbet’s traces in her study, compare preserved material, then check the audiences for her two takes and carry the signed listening index to the Council. | [story.test.ts](../tests/story.test.ts), [preserved-reconstruction.test.ts](../tests/preserved-reconstruction.test.ts), [voices-elsbet.json](../src/content/voices-elsbet.json), [vesper.json](../src/content/vesper.json) |
| 288 | An apprenticeship culminating in a proof | ○ | Hesper's forge and loyalty case offer stages. A dedicated finished work returned for a later audience remains open. | [forge.ts](../src/domain/forge.ts), [loyalty.ts](../src/domain/loyalty.ts) |

## XVII. Player preferences

These nine preferences pair an early invitation with later play. Six have a playable route for the core preference and three have partial adaptations. Players can switch between activities.

| Preference | Status | Early play | Later opportunity or gap | Reference |
| --- | :---: | --- | --- | --- |
| Achievements and data | ✓ | Open the local Ledger, Skill Atlas and collections. A first repair or resource record can become a visible credit or keepsake. | Unlock honors and see distinct evidence histories. Chapter passports remain open (100). | [ledger.ts](../src/domain/ledger.ts), [permanent.ts](../src/domain/permanent.ts) |
| Exploration and wandering | ✓ | Use the folding map, ask about the unnamed door, find unmarked clues and approach the study with a keepsake. | Chart where surveys stop in Cartographers’ Sea and walk a changed Forest bank route. | [nexus.ts](../src/maps/nexus.ts), [story.test.ts](../tests/story.test.ts), [cartographers-story.test.ts](../tests/cartographers-story.test.ts), [forest-guide.test.ts](../tests/forest-guide.test.ts) |
| Social play and teamwork | ◐ | Help Kip test a shared carry and choose how to disclose an Emberford repair queue decision. | Take a later handoff with a returning courier and assign work to four companions at the Council. Networked class play is outside scope. | [opening-handle.test.ts](../tests/opening-handle.test.ts), [emberford-repair-queue.test.ts](../tests/emberford-repair-queue.test.ts), [archive-handoff.test.ts](../tests/archive-handoff.test.ts), [council-team.test.ts](../tests/council-team.test.ts) |
| Tactics and strategy | ✓ | Try controlled marking and prepare evidence for a Showdown. Compare an informed and an independent scout. | Allocate limited Civic windows and plan the Island’s changing ferry load. The campaign uses nonviolent strategy. | [playthrough.test.ts](../tests/playthrough.test.ts), [emberford-scout.test.ts](../tests/emberford-scout.test.ts), [civic-story.test.ts](../tests/civic-story.test.ts), [island-story.test.ts](../tests/island-story.test.ts) |
| Movement and hands-on learning | ◐ | Forge a sample, operate the hinged print aid or play the bell stair. Walk to check two sightlines. | Test forest plots, align a chart and route a water supply. A calm-capable timed movement course is still open (257). | [playthrough.test.ts](../tests/playthrough.test.ts), [opening-viewer.test.ts](../tests/opening-viewer.test.ts), [bells.test.ts](../tests/bells.test.ts), [forest-sampling.test.ts](../tests/forest-sampling.test.ts), [routeTiles.ts](../src/domain/routeTiles.ts) |
| Cozy, creative and noncombat play | ✓ | Adjust warm or calm settings, place reading rests, select colors and furnish quarters. | Curate a display, make a song or sky picture, and choose how a fair welcomes a visitor. | [settings.ts](../src/app/settings.ts), [opening-rests.test.ts](../tests/opening-rests.test.ts), [quarters.ts](../src/domain/quarters.ts), [preserved-exhibition.test.ts](../tests/preserved-exhibition.test.ts), [lanternfair.test.ts](../tests/lanternfair.test.ts) |
| Story, mystery and humanities | ✓ | Visit the opening exhibits, choose a motive and check the different uses of a label. | Follow Harrowmere through records and letters, play loyalty branches and decide what the Council publishes. | [playthrough.test.ts](../tests/playthrough.test.ts), [harrowmere.json](../src/content/harrowmere.json), [loyalty.test.ts](../tests/loyalty.test.ts), [vesper.json](../src/content/vesper.json) |
| Experienced players and demanding choices | ◐ | Choose evidence with limited patience, attempt optional Undercroft seals or decline a hint. | Preserve conflicting duties, compare alternative trials and shape the Council outcome. A rematch gauntlet and New Game Plus remain open. | [showdown.ts](../src/domain/showdown.ts), [undercroft.ts](../src/domain/undercroft.ts), [council-story.test.ts](../tests/council-story.test.ts), [saves.ts](../src/domain/saves.ts) |
| Younger, casual or time-limited players | ✓ | Choose text and input settings, ask Lumen for a layered hint and finish a small scene without permanent credit loss. | Use Waystones, the recap and conversation recall to pick up the story after a break. | [settings.ts](../src/app/settings.ts), [lumen.test.ts](../tests/lumen.test.ts), [saves.test.ts](../tests/saves.test.ts), [conversationHistory.ts](../src/domain/conversationHistory.ts) |

### Unfilled opportunities

- A piloted ferry, a calm movement course, a recurring research challenge and a post-ending replay remain open. Existing convoy models and private retry support are listed alongside those gaps.
- A diorama, a portable passport, a specialist traversal tool and advanced apprenticeship remain open. Each has a nearby authored case that can be expanded through play.
- Online systems, student publishing, wagers, grading and combat are governed by the [repository rules](../AGENTS.md). The adapted alternatives sit in the individual rows.
