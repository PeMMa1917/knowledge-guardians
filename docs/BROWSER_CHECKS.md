# Chromium release checks

## Run the map and access smoke

Build and serve a single checkout, then run the smoke against that preview with Node 22 or newer and Chromium installed.

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

```sh
node tools/smoke-worlds.mjs http://127.0.0.1:4173/
```

The script starts a fresh game in a disposable Chromium profile. It uses the checkout’s map registry and the game’s debug entry to start each scene at its registered spawn, then checks for a rendered floor, a non-blank frame, registered prop art and a short walk through the real pathfinder. With a separate built checkout, pass its directory as the second argument. Pass `maps` or `access` as a third argument to run either group by itself. [Smoke runner](../tools/smoke-worlds.mjs)

Use `stress` to compare the live scene against the map registry and to exercise solid edges, diagonal corners and pointer targets. It includes an accelerated hour at the Nexus wall and a live Ferry tab switch. Use `portal` to replay the held-key return from Emberford with the two prerequisites staged, or `focus` for the Ferry tab switch on its own. Use `soak` for a full hour of actual Chromium input with one continuously held key. The soak samples position, collision, animation and footstep calls while the browser advances, then checks that movement resumes after releasing the key. `KG_SOAK_MINUTES` allows a shorter run. The `guidance` mode checks the local four-clue sequence at mobile size and continues the same workbench trial. [Stress runner](../tools/smoke-navigation.mjs) · [Guidance runner](../tools/smoke-guidance.mjs)

## Integrated preview

The 1,018-object candidate rendered and completed a short walk on all 121 registered maps. The runner uses a fresh save and debug map entry for these visits. The release also has separate runs that use the story gates and keep their progress between chapters. [Smoke runner](../tools/smoke-worlds.mjs)

The production build of `8fafb19` passed rendered frames and short traversal on all 52 registered maps. The access run passed using the keyboard for the Settings menu, text-size control and modal actions, then moved the Guardian with an arrow key before exercising Calm.

The frozen `fa0b611` production build also passed all 52 map checks and the keyboard and Settings checks, including the 175% text setting at 390 CSS pixels. These runs used the access checks available before the resize lifecycle regression below was added.

The later kettle feature also passed a production browser route. I staged the label and folded map, used the Emberford portal and ferry road, replayed the service with two different shifts, and carried one card through the gated Market entry after staging the Performance finish. The covered-table placement showed the final two cups after the first handoff. [Kettle route tests](../tests/ferry-kettle.test.ts)

Both Film paths passed in Chromium on a frozen `fa0b611` build with the Film change applied. The House and Coast doors were closed in a fresh save. I staged `sea.finish` and `preserved.publish`, then walked the actual passages and used keyboard interaction at both cameras, the editing stand, the branch-specific reader and the two harbour records. I checked that the camera pixels differed, found the visitor at the gallery rail or the foyer route post, and confirmed that reading the historical frame alone kept the harbour placement locked. Both camera and editor panels fit at 390 CSS pixels with 175% text. Enter on the focused camera control advanced one beat. [Film route tests](../tests/film-cuts.test.ts)

## The Story Archive

Chromium used the House of Performance and Gallery doors after staging `sea.finish`. Two fresh profiles positioned the player beside reachable tiles and opened the exhibits and paper clips with E. Both profiles checked both caption previews and completed a different set of Gallery deliveries. One profile earned Dace’s comb in the Nexus and used it in the frame. The other reached both alternate readers with Enter on the frame controls at 390 CSS pixels and 175% text. Both cases showed the correct exact catalogue links, separate dates and original diagrams. [Story Archive tests](../tests/story-archive.test.ts)

## The Sample Shed and Prop Room

Two fresh Chromium profiles reached the new rooms through the regular Stage Gallery and Market doors. The runs staged `sea.finish` and later `stage.finish` for those chapter gates and positioned the player beside reachable tiles. The profiles used E to examine all eight museum specimens, ran both practice steps for each, and completed the two different sets of deliveries outside the rooms. The alternate set activated focused choices with Enter. Each exhibit showed a distinct local image, catalogue link and date. Each completed job left its own receiving display in place for a second visit. [Specimen work tests](../tests/specimen-work.test.ts)

## Source tracing in the Nexus and City of Copies

Chromium walked both optional citation routes from a fresh Nexus. The Full Source Strip led to the Full Sheet at Lark’s rail. The Short Tag led to the Nexus shelf, then the NG524 Card led to the Record Room. Each run staged only `metal.finish` after a reader found A606881, then walked through the regular City and Print Workshop doors. Both reader checks completed. The printed lines showed the page title in quotation marks, the artwork and container titles in italics, the right kinds of dates and the exact museums’ record links. A separate layout check positioned the player at the tray and confirmed that the long A606881 address stayed within the dialog at 390 CSS pixels and 175% text with wider spacing. [Citation route tests](../tests/citation-rail.test.ts)

## Fresh campaign through the Council

One disposable Chromium profile progressed from New game through all 15 chapters and Vesper’s ending. The run activated the game’s own controls and used its normal chapter gates and Save and leave/Continue. It used debug positioning at nearby tiles for most interactions and the game’s pathfinder to walk onto the Chapter 1 portals. No chapter prerequisites, objectives, tools, map transitions or story outcomes were seeded. The profile reached the Nexus after the Council with 111 earned objectives.

The run began on the `fa0b611` production snapshot with Film applied. It revealed that Kip’s required post-Showdown position in Emberford was also occupied by Idris, who took priority during keyboard interaction. With Idris moved to a nearby clear tile, the same profile could speak separately to both characters, collect the seal and debrief with Ise. The Nile door stayed closed until the player had relit six lamps and read Elsbet’s letter. Both Nile leads and the reading-table dispatch preceded the later chapter gates. The run found the Harrowmere card at the Water Commons and used it to reach Vesper’s side-by-side outcome at the Council. [Emberford map](../src/maps/emberford.ts) · [Layout regression](../tests/chapter-maps.test.ts)

Two copies of that completed save tested the Night Map on a later production build. I used the world pathfinder and keyboard interaction at each stand. Both runs checked the same nine underlying request locations and times against the two rendered dividing lines. The old ditch sent the first cart to the lower bank and included Mooring rail. The footbridge sent it to the upper bank and included Upper stair. In each case I read the receipt and checked that the stop served by the other route kept its coordinates and original wait on the Council Yard’s next-cart list. [Night Map route tests](../tests/service-boundary.test.ts)

## Results on the frozen baseline

The production build of `9ab5b34` rendered and traversed all 50 registered maps. The smoke completed a two-tile walk on each map and recorded no uncaught page exceptions or failed asset responses. Debug entrance bypasses chapter gates. The following additional checks used the live game controls and inspected visible outcomes. Most started a fresh save and staged previous chapters’ state. These were individual exercise routes through the build.

| Area | Exercised in Chromium | Setup |
|---|---|---|
| Nexus | Old label, Ise, the marking bench’s two materials and a physical copy sent back from the ferry. | Fresh Guardian. Jumped to the landing for the return visit. |
| Emberford | Post-Showdown copy revision, three inspections, ledger handoff and final notice. | Jumped to Emberford and seeded Showdown outcome. |
| Nile Archive | Door hidden with neither or only one prerequisite. Workers’ papyrus thread, one lead held, paired model runs, dispatch, debrief and Nexus reading-table result. | Staged prior debrief, study letter and thread tool. |
| Cold Store | Royal and coastal investigations, custody correction, paired publication, a visitor’s request and Nexus reference slips. | Staged prior Nile return. |
| Observatory Coast | Harbour and station gauges, bell slip, a notice route, recheck, correction and wider copy. | Staged paired Cold Store publication. |
| Living Forest | Entry gate, abandoned partial observation, four initial watches and a blocked return beat, low viewing route and saved notes. | Staged Coast revision. |
| Metalworks | Entry gate, balance zero, weighing both panels, pinned result on revisit and return. | Staged Forest finish. |
| City of Copies | Entry gate, partial alignment, both distinct omissions and independent comparisons retained on return. | Staged Metalworks finish. |
| Cartographers’ Sea | Entry gate, partial checks, chart marks and separate survey limits for the harbour and shoal. | Staged City revision. |
| House of Performance | Two cue orders, two seat views, audience feedback, revision and a transfer to the City’s signed entry rule. | Staged the Sea finish and access to the City for the return transfer. |
| Market of Measures | Gross, net and wick-grade comparisons, two purse sizes, publication and reader corrections. | Staged Performance finish. |
| Water Commons | Drought allocation, controlled repair recheck, revised result alongside the old result and wide copy. | Staged Market finish and an Emberford case for the callback. |
| Civic Machine | Same-rule comparison with different request samples, distinct post, reader follow-up and revised route. | Staged Water finish and the earlier Nexus rest flag for the callback. |
| Archive of Voices | Permission gate, allowed excerpts, two approaches, corrected signs and wide card. | Staged Civic finish and earlier callbacks. |
| Island of Models | Upper and lower route comparisons, required matched retest, separate boards and observation log. | Staged Voices finish and its route callback. |
| Council of Inquiry | Three watch trials, the two historical references, dated repair fallback, spoken relay and wide copy. | Staged Island finish and ferry revision for the callback. |

## Keyboard and text changes

In the baseline build browser Enter on a focused Settings button was cancelled by the game’s global keyboard capture. At a 390 CSS-pixel viewport, the Settings content also measured 497 pixels wide after raising text to 175% with wider spacing.

The patched production check activates Settings with Enter, wraps focus with Tab and Shift+Tab, changes the native text-size control, toggles contrast, spacing, Calm and captions, and returns focus to the game canvas on Escape. Settings fits its own panel at 175%. The check advances only the fictional event clock, then chooses Later through the normal Calm dialog and verifies that the event stays unconsumed. [Dialog focus](../src/ui/dom.ts), [Settings and focus return](../src/ui/ui.ts), [Settings width](../src/ui/styles.css)

The old reed hollow prompt covered all five menu buttons at 390 × 844 CSS pixels with 175% text and wider spacing. The patched access smoke keeps the full prompt at that size and checks the tracker, Lumen hint, compass and menu controls separately from the game canvas. It resizes through 390 × 844, 320 × 568 and 844 × 390, then returns to 320 × 568 and taps both Menu and the reed hollow prompt. [HUD layout](../src/ui/styles.css), [Smoke runner](../tools/smoke-worlds.mjs)

With automatic reading off, using Read aloud in the opening scene left the old line in the speech queue after advancing or closing the conversation. Manual speech now stops at both transitions. The Chromium regression uses Enter and Escape through the normal controls and holds a simulated speech queue open so the result is independent of voice speed and the installed speech engine. [Dialogue lifecycle](../src/ui/ui.ts) · [Smoke runner](../tools/smoke-worlds.mjs)

## Resizing and reduced effects

At a 390 × 844 CSS-pixel viewport, the production build of `8fafb19` ran 56 world-camera callbacks for one resize after visiting all 52 maps and rebuilding scenes during settings changes. Resizing again after returning to the title threw an exception when a callback reached the stopped camera. The patched build ran one world-camera callback while playing and none on the title screen. The access smoke now checks both counts and resumes the saved map through Continue. [World scene](../src/scenes/WorldScene.ts), [Smoke runner](../tools/smoke-worlds.mjs)

On `8646196`, repeated emulated phone and tablet rotation could send browser resize events and update the visible viewport while Phaser kept its previous canvas size. The game now observes the canvas parent and reconciles its dimensions when layout changes. The access smoke resizes once while the game is running and once while its loop is asleep. Each resize must run one world-camera callback. The smoke also changes the size on the title screen, checks that the removed camera receives no callback and resumes the saved map. [Game startup](../src/main.ts) · [Smoke runner](../tools/smoke-worlds.mjs)

In a separate 1.8-second sample in Emberford on the frozen build, the frame interval fell from 83.2 ms median and 116.6 ms at the 95th percentile to 16.7 ms median and 33.4 ms at the 95th percentile with reduced effects. The sample used Chromium 156 on x86-64 Debian 13 with SwiftShader software WebGL and reduced motion in both settings. Frame timing depends on the device and workload. [Reduced effects](../src/scenes/WorldScene.ts)

On a later integrated build, Chromium forced to its Canvas renderer visited all 54 registered maps twice and returned to the Nexus after each pass. At 390 × 844 CSS pixels the texture count was 405 on the first Nexus view, 447 after the first pass and 447 after the second. JavaScript heap after collection measured 14.66 MB, 16.98 MB and 17.17 MB at those same points. These measurements track Phaser’s texture registry and JavaScript heap. [World scene](../src/scenes/WorldScene.ts)

## Startup and teacher reporting

The game now fetches fallback music when playback needs it. The Web Audio path downloaded 146,789 bytes of sound effects at startup, down from 2,371,805 bytes of MP3 data including the old fallback music preload. It also avoided 63.46 MB of decoded fallback PCM. The median time from navigation to the Nexus dropped from 9.89 seconds to 6.14 seconds in three alternating cold runs for each build against `8fafb19`. These runs used Chromium 156 at 390 × 844 CSS pixels, a 6 Mb/s connection with 50 ms latency, 2× CPU throttling and an immediate Begin choice. The midpoint of the main screen startup samples stayed around three seconds. [Asset loader](../src/scenes/BootScene.ts), [Playback](../src/app/campaignPlayback.ts)

With the network disconnected after startup, the generated score changed when the player moved from the Nexus to Emberford. With synthesis deliberately unavailable, the corresponding archive and town tracks played as requested. The same fallback worked with Web Audio disabled. In a browser check that held the archive download until the town track started, the old request failed without interrupting the town track. Regression tests also cover returning to the title while music is loading. [Playback tests](../tests/campaign-playback.test.ts)

The production teacher page now receives the reporting fields derived from the campaign at build time. On `8fafb19` the projection reduced its compressed JavaScript from 393,418 to 32,676 bytes and kept all 137 optional activity rows. Chromium loaded the teacher page from the preview, then imported a local progress file and opened the class alert and private report with the network disconnected. The game build with the projection rendered and walked on all 52 frozen maps. [Teacher projection](../src/teacher/content.ts), [Teacher tests](../tests/teacher.test.ts)

## Two Dates at a Peg

Chromium replayed the ordinary Cartographers’ Sea chart, publication and revision from a disposable copy of an earned campaign with the Sea chapter state cleared. The annex and both receiving desks stayed hidden before revision. Afterward the test walked to both cases for the photograph and jar pairs, loaded their exact collection artwork and moved the peg twice with Enter. The overlap and separate date ranges rendered at 390 CSS pixels and 175% text. The player carried the two-sheet photograph guide to the market bench and the one-image jar guide to the dock. Each signed delivery removed its guide from inventory and left a dated receipt in the journal. [Route tests](../tests/date-peg.test.ts) · [Object records](../src/content/date-peg-specimens.json)

## The Beside Date

Chromium continued a disposable copy of the previously completed campaign and walked through the normal Sea and Civic doors. The test inspected Mscr.Dresd.R.310 and 70.177.69, compared both display models for each, and kept Winslow Homer’s 1885 source sketches distinct from the 1902 canvas. It sent a wide guide and two event strips through the separate harbour readers, then filed each signed receipt in the corresponding Civic tray. The controls worked with Enter at 390 CSS pixels and 175% text. No uncaught page exceptions occurred. The save returned to the Nexus. [Route tests](../tests/date-register.test.ts) · [Exact exhibit records](../src/content/date-register-specimens.json)

## Earned specimen references

Chromium continued the earned Nile campaign, walked to the Turin Mine Map and took the object through its exhibit control. The Diary showed one clickable collection citation. The downloaded Word file’s external hyperlink relationship and the PDF annotation both resolved to the exact Museo Egizio catalogue URL. The browser-generated documents kept private writing out of the default export. [Diary and Word tests](../tests/adventure-journal.test.ts) · [Catalogue item](https://collezionepapiri.museoegizio.it/en-gb/document/9/)

## The Callboard Turn

Chromium continued the previously earned Civic and Lantern House save. The signed folio opened a short passage into the Callboard Room and Neris appeared at the other desk. The test sent the Codex Quetzalecatzin on the paired bench route and the Gage mount account on the separate calls. After claiming and equipping the objects, the player returned to Lantern House and the Metalworks Trade Hall and mounted two different notices. The test used real paths, keyboard Enter, 175% text at 390 CSS pixels and a final Nexus save. [Callboard route tests](../tests/callboard.test.ts)

## City of Copies return visits

Hesper’s drawer and the City of Copies door originally shared one Nexus tile. When the drawer was visible, it received the interaction instead of the door. The drawer now sits one tile south. Chromium opened the drawer and entered the city through its ordinary door on a continued legacy save. A separate pass set the earlier bench arrangement and confirmed the same doorway. In the Record Room, the two equipped Date Register objects opened separate workstations. The Dresden folio left a two-frame conservation guide and the Brooklyn khipu left four study links under one accession. Both notices remained readable after changing tools. [Map regression](../tests/chapter-maps.test.ts) · [Date Register route tests](../tests/date-register.test.ts)

## Past the Roof Line and four workshops

Chromium used two disposable saves to inspect the 1733 Timbuktu manuscript record and trace the first sightings at columns 6 and 7 over the roof and columns 4 and 5 over the wall. The quay route reopened its pocket trace. The headland route reopened the paired frame. The test staged the earlier Cold Store publication and Coast revision, positioned the player beside each interaction, and used the normal doors and controls. [Sighting and handoff tests](../tests/timbuktu-manuscript.test.ts)

Two additional Chromium saves inspected all 20 different workshop records and loaded their local museum images. Each save tested both settings at every fixture before placing the results at the selected receiving stands in the Sample Shed or Prop Room. The two saves covered all 40 handoffs and reopened each completed stand. One used Enter to operate the work controls. The test staged the preceding chapter gates and positioned the player beside the normal doors and props. [Workshop tests](../tests/object-use.test.ts) · [Collection records](../src/content/object-use-cases.json)

## The Material Stores

Two Chromium saves inspected the 36 exact records and displayed 36 different local museum images per save. Both saves tested both settings at each fixture, then placed and reopened the work slips at the Council Yard or Lower Channel. The 72 combined handoffs covered both recipient choices for every case. After completing four representative cases, the player used the real exhibit and Bag controls to collect and equip the Merina wrapper, Nupe jar, repaired Sicilian comb and Gnaios intaglio working copies. Each gave its own persistent Canal Walk correction. The Lower Channel save used Enter at 390 CSS pixels, 175% text and wider spacing. The tests staged prior chapter gates and positioned the player beside the usual doors and props. [Routing and equipment tests](../tests/material-stores.test.ts) · [Collection records](../src/content/material-store-cases.json)

## The Working Cupboards

Two Chromium saves used the ordinary Forest doors, inspected all 38 sourced objects and loaded their different local images. Each save ran a late full opening and both first-bell orders with the movable queue tiles. The two saves placed and reopened all 76 first-bell receipts. Four completed cases also used the exhibit and Bag controls to earn, collect and equip the Coromandel wrapper, bidri bowl, Herat pen box and Muhammadi portrait working copies. The City of Copies shelf retained the second proof from each. The practice-tray route used Enter at 390 CSS pixels and 175% text with wider spacing. The tests staged the earlier Coast and Metalworks gates and positioned the player beside the usual interactions. [Schedule and equipment tests](../tests/work-schedule.test.ts) · [Exact catalogue records](../src/content/work-schedule-specimens.json)

## A Shore You Can Turn and the Departure Strip

Chromium walked from the Nexus through Seagrass Steps and Lantern House to Kunit’s coast-piece record. The player turned the practice block while the offshore peg stayed fixed, moved the peg, and installed the result at the low rail. The player claimed the working copy at its exhibit and fitted it in the satchel to reveal the reversible rack. A prepared copy of the earlier ferry quest then confirmed that Tupaia’s own equipped working copy opens the marked ferry footpath and reaches a separate dock-stair receipt. The historical collection record stays in its original ferry location. [Navigation checks](../tests/turning-table.test.ts)

## Which Edge Reached the Landing

Desktop Chromium used the completed cord relay to enter Shoal Shelf’s Reading Shelter. A 390 px run used the normal Cartographers’ Sea ending. Both runs carried a checked guide to Clio and another to Halen. The player put a first guide back, selected another recipient and tested the correct bench. A separate 390 px pass opened three independently illustrated documentary records for the Marshallese stick navigation chart and the two Yirrkala petitions. [Passage checks](../tests/specimen-passage.test.ts)

## A Cue Beyond the Door

Chromium at 390 px entered the Cue Workshop from Lamp Quay after staging the published guide. The Fiji reed-pipe case loaded its exact image. The same workshop order produced three cue tones on the quiet side and one surviving cue tone with two work sounds on the service side. The timing line marked the covered beats. Eren’s working indicator retained those visible marks after the handover. The Hawaiʻi puniu case played through with sound volume at zero. Its timing line remained readable and Hari’s copy persisted after the player walked to the House audience gallery and reopened the side-seat table. The fixtures emit original game sounds. [Cue tests](../tests/cue-workshop.test.ts)

## A Turn at the Workbench

Chromium checked the hidden entrance before the Nile return flag, then used the regular Nile and Archive of Voices doors from staged prior chapter progress. Two different catalogue cases produced different sections at their marked bands. The player installed a front pattern at Lamp Quay and repeated the full pair of cuts on the Glass Walk. The same run generated two practice sounds at 166 and 252 Hz, read both faces of B16665 and placed the named fields of the Laguna clearance. Each of the three mounted copies was checked at its later receiver. The B16665 exhibit gave one object to the satchel only after that mounting. These interactions used proximity positioning and the normal in-game controls. [Workbench tests](../tests/maker-room.test.ts)

## When the Two Clocks Agree and three equipped reuses

Chromium staged the earlier Emberford lamp count, opened the Study through its cellar door and checked that the Time Room appeared only after the letter. The gilt watch’s practice clock reached 18 against 24 with a matched start and 25 against 24 with matched pace. With the Egyptian shadow clock covered, the reference advanced while the shadow observation remained unset. The player posted both types of notice across the two cases. After taking and equipping the gilt watch, the separate Study fixture reopened and retained the chosen record of 30 against 30 after changes to the new starting mark and pace. [Time Room tests](../tests/time-room.test.ts)

Chromium staged Emberford progress and verified the old road was hidden until the folded-map clue. At the Ferry Packing Room, it opened and rendered the Timbisha jar-shaped basket and Lakota hide bag catalogue images. Each outside tag showed its initial name. The jar tag reached the table clear and the hide bag tag blurred under the set practice spray. Both inside tags stayed covered until opened and reached the table legible. The test chose Tova’s first queue slot for the jar and Wenna’s two-move drying-table handoff for the bag. It read both physical receipts and claimed the copies afterward. Equipping the jar at the Nexus opened only its receiving hook. With the extra spray the keeper held an exposed tag for a dry copy. Under the canopy the keeper signed it after one extra move and retained the choice when the hook reopened. [Ferry Packing tests](../tests/ferry-packing.test.ts)

Chromium staged Observatory arrival, entered Headland Station by the harbour steps and used both detector settings on the same four practice marks. The wide strip read 4 or lower, 4 or lower, 9 and 12. The amplified strip read 1, 3, 6 or higher and 6 or higher. Dispatch stayed disabled after one sweep. With both complete, one run sent the wide strip to the eastern ramp for first bell. A separate staged run sent both strips to the lower rail, where the crew kept both sets of marks after the later handover. The test opened each physical receipt and checked that the case completed at the receiving point. [Detector tests](../tests/coast-detector.test.ts)

Chromium staged early Emberford and checked Idris’s bridge rail. Three bank flips ended on Stone. Each starting branch produced zero qualifying trails out of two under bank crossings alone. After fitting the practice plank each branch produced one out of three. The rail also showed a working four-link route through the lower bridge. The test used the installed light passage and verified its actual destination east of the market. A separate staged run read the regular turn post. Each route revealed its own receipt at the east rack, and the case completed when the receipt was read. [Bridge proof tests](../tests/bridge-proof.test.ts)

Chromium staged the Metalworks arrival, entered the Trade Hall and Warm Room through their doors, then rendered the official images for the John Chartier coffee pot and Shi Dabin plum-blossom teapot. The Chartier model’s first body probe read 24 on both supports while its contact strip read 4 at the counter and 2 on the pad. After three intervals, the counter showed 12 and 0 and the carrier showed 14 and 1. The Shi Dabin model gave different traces. It posted the Chartier counter receipt and the Shi carrier receipt, then collected both copies only after reading the corresponding physical handoff. At the earlier ferry landing, only the equipped Chartier copy exposed its specific tray. The test reran both supports at two chosen waits, changed the service route, and reopened the tray to verify the kept wait and reply. [Warm Room tests](../tests/warm-room.test.ts)

Chromium staged arrival in Emberford and the Water Commons on two runs. It used pointer-driven walking to Idris’s board, each early receipt, the Old Weir crossing, Sena’s board and each later receipt. A click into the Guild Hall footprint queued no movement. The Water path crossed the river only on bridge tiles. The early trial recorded six turns, peak 28 and effort 20 after the pause with a quick start. The even trial recorded eight turns, peak 22 and effort 14. Sena reused the filed pace. She compared one carrier with the same load passed at halfway, then the test read the distinct relay and single-carrier rosters in separate runs. Native Space events advanced all four legs and one recovery beat in a separate keyboard check. [Porter trials](../tests/porter-pace.test.ts)

A separate Chromium save staged the three completed Makers cases, claimed each copy from its exhibit and equipped it through the game command. Only the matching fixture appeared. The player compared unequal and equal practice tones, moved the name and relief guides at the disk swivel and posted two different ledger outcomes with the dated receipt. The final outcomes still appeared after each fixture was reopened. [Makers’ Room tests](../tests/maker-room.test.ts)

### The Second Reading Store

A production preview showed all 36 Council case positions. At 390 CSS pixels, the route checked both positions, took and equipped 63.166a–j and 2429, then used their distinct public rail and staffed table at the Bell Archive. At 1100 CSS pixels, the same checks reached both handovers with 1974-541 and PIA22115. In each route, the initial exhibit had no claim button, the stand graphic changed with the selected setting, and the earlier archive scene stayed gated until the earned object was equipped. The route staged the earlier chapter prerequisites and used the normal doors and interaction controls after that. [Object and return checks](../tests/second-reading.test.ts)

### The Cart Finds Its Centre

At 390 CSS pixels, Chromium used the Nexus passage, Time Hall and Letter Gallery from a staged Island completion. At the Vaiala watercolour case (1970.120), the cart leaned 10 units at the left notch. After Hale received the cart and the player claimed and equipped the working copy, the wet wrap changed that reading to 18 units at the same notch. The other notch levelled the board. At the Akaroa etching (17.78.36), Essi received both readings. The player equipped that copy, repeated the old notch with the moved parcel, compared both fixes and secured the nearer ring. Both fitted outcomes persisted after reopening. The return rack remained hidden until its corresponding copy was equipped. [Cart Bay tests](../tests/loading-bay.test.ts)

### The Reply from Shore

The build contained 36 inspectable cases in the Signal Shed. Chromium at 390 CSS pixels carried Oc1993,03.13 and 17.3.2378 to the upper lookout and PEA1005 to the lower pier. The 1100-pixel run brought ZBA2245 to the lower runner and PH.275100 to the lookout. The two trials in each case changed the working stand, exposed separate readings, and enabled the loan. Both visits used the normal doors and the Bag’s equip action after staging the preceding chapter gates. [Shed and receipt checks](../tests/shore-reply.test.ts)

### The Parts You Can Replace

The production preview contained 40 inspectable Jig Shop cases. Both passages began blocked for each new practice blank. Setting the support opened just the selected passage. The browser walked through its gate tile to read the witness before using the case’s loan action. A 390-pixel route then took Y2000.35 to Hesper’s fitted tray and 2005.100.610 to the shared Emberford bench. A 1100-pixel route used 2020-115 at the bench and Heal,118.8 at the tray. Each route used the normal entry and return doors, portal and Bag actions after staging the preceding chapter gates. [Fixture and repeated case checks](../tests/jig-shop.test.ts)

### Where the Two Sights Meet

At 390 CSS pixels, Chromium used the Observatory passage and Headland Station from a staged Cold Store completion. The Tautira source (1966.6.1) narrowed seven practice squares to one when the two first-bell lines were combined. The player installed the low lamp at Slate Harbour, claimed and equipped its working copy, then compared a later paired reading with a current side sight under the fog screen. The Collier’s Point case (2015.189.1) reached Marl Fold’s guided rail. Its working copy revealed a moved east post, so the fresh pair began at the new origin. The player installed both kinds of return support across the two cases. The fitted results received keyboard focus, fit the mobile viewport and persisted after the racks were reopened. [Bearing Room tests](../tests/bearing-bay.test.ts)


## Quena’s Glass Rack and the Badge Annex

Chromium continued a campaign whose earlier gates and chapter displays had been earned in play. At the Glass Rack, the Bagobo backpack 1917.770 and Kamisaka Sekka box 1991.120 loaded distinct licensed images as the player shifted the view. The former went to the broad rail and the latter to the hinged pocket. The finished satchel shelved the fourth object at the Nexus. The player used the collection room to swap it in. The two equipped objects opened separate earlier Nile mounts. The public board showed a pair and a desk pointer. The desk showed the matching full pair.

The same save reopened at the Badge Annex. It recognised the carried opening Evidence achievement and showed eight family drawers. The player opened both faces of the Pillars case. At Nerin’s press, the player used both example packets, changed the feature on the same four case slips, walked to two withheld records, checked the two requests and compared the two versions of the quay print. The permission register enabled the rail placement. The finished route registered all ten Oracle deeds and its capstone. The alternate staffed desk is covered by the domain route test. Both visits used 390 CSS pixels, 175 percent text and keyboard activation. [Glass Rack checks](../tests/glass-rack.test.ts) · [Badge and press checks](../tests/tok-badges.test.ts)

## The Call behind the Curtain

Two independent Chromium New Games used the blank-page and stand-number arrivals respectively. Each compared the three knocks from both listening marks before the formal Ise objective, then took the gift from Ethren’s chest. The Nile door stayed locked in both fresh games. Two other replays began with an already completed Chapter 2, took each gift through the normal Nile doors, reused it at the Workmen’s Room, and checked the distinct visible result. The tick-board leaves the audible gap in place and adds a visible count. The felt restores the middle tap. Both routes earn the Third Knock badge on the checked handover. Play used Enter and the 390 CSS pixel view at 175 percent text. [Story and branch checks](../tests/curtain-call.test.ts) · [Modeled route and timing gaps](../tests/tok-coverage.test.ts)

### The Cart Before the Bell

After staging the first repaired label, the browser used the Nexus portal and found both openings near Emberford’s arrival path. At 390 CSS pixels, the first changed frame showed the wheel observation and the run ended at the public pickup tray. At 1100 pixels, the first frame showed the cord and the run ended at Nella’s escorted handover. Both production runs kept the first sketch before Edrin spoke, distinguished the missed notice from the tied witness flap, physically reached both replay readings, and used the preserved sketch before issuing a handover. [Encounter and route tests](../tests/memory-cart.test.ts)

### Three Bands Through One Window

At 390 CSS pixels, two Chromium runs used the cellar and annex doors after staging the earlier lamp and letter progress. Both rendered ESA/Webb observation weic2212a and used the keyboard to choose the same E3 sample in both false-colour views. Its readings stayed 4, 2, 0 while the visible colour changed. The runs sent the seam to Nell first or the pinholes to Venn first, walked to both receivers, and checked their separate results. Each earned Webb copy was claimed and equipped from the Bag. The Study light then allowed both accessibility trials. One player left the shape key and the other left a greyscale holder. Both fitted results persisted after reopening and received keyboard focus. [Prism Viewer tests](../tests/prism-viewer.test.ts)

### The Third Landmark

Two Chromium runs at 390 CSS pixels staged earlier chapter progress, then walked through the City of Copies and back to the Nile using normal doors. The 1874 Keppel Harbour chart (06_01_017687) went to Mina as a short guide. The Manila Bay chart (06_01_007301, surveyed in 1792 and printed in 1807) went to Lark as paired plates. Both runs shifted and turned the practice sheet, compared two controlled marks, and checked the remaining two-step offset at the far turn before filing. After claiming and equipping the corresponding working copies, the Nile replay showed an offset of one step for Keppel Harbour and three steps for Manila Bay. The shorter guide and separate outer frame each remained visible when reopened. [Alignment and equipped return tests](../tests/map-alignment.test.ts)

## Fieldwork title rewards

Chromium verified the three worksite consequences. The played Washhouse and Water Commons decisions unlocked a dry receiving footboard. The smoke staged the earlier optional map discovery so the normal Ferry road was visible, then took the ordinary route to the footboard and used it to reach the bag. A campaign with both earlier cue deeds let Ethren place the standing cue rail. Both original Emberford and Nile receipt routes were played before taking the split index to the earlier market order. The market displayed its delivery signature beside an open date check. [Fieldwork route checks](../tests/field-badges.test.ts)

### The Price That Travels

The production preview showed all 36 cases. At 390 CSS pixels, T.5784 reached the public offer rail and MA.316702 reached the staffed drawer. At 1100 pixels, 22.67.16 reached the offer rail and PEB0180 reached the staffed drawer. Each case exposed its own receipt before the claim action appeared. The browser used the normal doors and Bag controls to verify both equipped uses at Hana’s earlier Emberford board, after staging the chapter prerequisites. [Offer and receipt tests](../tests/price-drawers.test.ts)

### The Script Cabinet

Two production Chromium runs opened all 38 exact pictures and checked the accession, date, credit link and image description for each. Both played the one-strip and two-strip views in each order. The desktop run installed all 38 cue-first folds at the call rail. The 390 CSS pixel run used Enter at 175 percent text to install all 38 catalogue-first folds at the open rest. Each run reopened the Gallery to verify the matching reader replies. The earlier chapter prerequisites were staged, and debug positioning placed the player beside the interaction points. Both runs used the game’s doors and controls.

The desktop run claimed and equipped the Hokuchō triptych and *Le Corbeau*. The narrow view run did the same for Sanwalah’s Layla and Majnun folio and the Chaghatai poems. In the City of Copies, opening the return fold revealed the second strip. Each correct equipped copy enabled a different retrieval entry that stayed visible on reopening. Domain tests cover the equipped return of all 38 records. [Script Cabinet tests](../tests/script-rail.test.ts)

### The Colour That Stayed

A production preview checked both pigment routes. The browser held the intact strip fixed for readings 3 and 5 under the two lamps, then held the cool lamp fixed while comparing 5 and 5 at the start with 5 and 2 after the model interval. It collected the paired proof into the Bag and followed the normal crossings to the Lending Hall after staging earlier prerequisites. At 390 CSS pixels the browser used the fixed-lamp proof. At 1100 pixels it used the hatch-marked outdoor proof. [Lamp and custody tests](../tests/pigment-window.test.ts)

## Collection-wide checks and Calm event recovery

The collection regression scans each registered exact identity for its accession, source, physical approach, earned action and equippable tool. It exercises one representative collection through the engine on every exhibit map. The representative fixtures stage earlier quest completion, then check rejection of early actions, repeat collection, carrying and shelving, exact earned citations, and persisted route choices. The dedicated browser mode takes two distinct Glass Rack routes with previous chapter gates staged. It uses the actual collection controls, source links, save and return arches.

Use the existing preview with `node tools/smoke-worlds.mjs URL . collections` or `node tools/smoke-worlds.mjs URL . events`. The event fixture checks a naturally offered Calm invitation, then selects two eligible events for the reload cases. Chromium verified that Escape defers an invitation and keeps an interrupted dialogue at its current reply. Real reload and Continue recover that reply. Kip’s five marks were awarded once. The resumed two-step Tull conversation counted one completion. [Collection and route tests](../tests/collection-system.test.ts) · [Event replay tests](../tests/event-resume.test.ts)

## Arrival visibility, exhibit access and guidance

Two production snapshots reproduced and checked an Emberford visibility defect. On a direct test arrival before the main-story gate, the place and reached flags changed without emitting game events. Seven props stayed hidden even though their conditions were true. After the fix, all seven render on that arrival. The fresh campaign also checked the usual portal route, which emits a story event.

The Nile room test staged an equipped map and existing Glass Rack work so the alignment bench and both Glass fixtures were visible. At 390 CSS pixels, the player walked to the board’s east approach, opened its panel, used the reading desk, then reached the relocated alignment bench and ran both span checks. The small-screen guidance test separately opened all four contextual Lumen clues at 175 percent text. It checked the reason for a blocked action and completed the same trial from that panel. The Island arrival was staged. [Alignment tests](../tests/map-alignment.test.ts) · [Guidance tests](../tests/guidance.test.ts)

The collection display test staged ten previous investigations. The player used the real Nexus collection entrance, paged through the display cases, opened an exact case, and tried to take its object with a full satchel. The limit held. After freeing one place and collecting from the in-world case, the satchel again contained exactly three objects. [Collection system tests](../tests/collection-system.test.ts)

## Held controls, movement and recovery

The live stress sweep compared the floor, solid tiles, conditional art and doors with the registered rooms. It tried diagonal movement beside closed corners, long update frames, pointer targets in walls and gaps, and repeated Space at five boundaries. The first sweep found four props where pointer movement picked an unreachable side. A corrected production build sent real mouse clicks to both Label Loft shutters. The Guardian followed the available hallway and opened each sign. [Stress runner](../tools/smoke-navigation.mjs)

The corrected registry sweep checked 70,154 tiles, including 18,412 solid tiles, 1,801 visible prop frames, 1,447 sampled routes, 335 boundary probes, 39 diagonal corners and 333 solid targets rejected by the pointer. A separate Chromium session held ArrowLeft at the Nexus archive wall for 60 actual minutes. After initial wall contact the player stayed in place, made no repeated footstep calls or walking animation, and moved away normally after the key was released. The final follow-up build also passed a short repeat of the same fixture.

Separate desktop and mobile runs held a dialogue number, Enter, Space, the map key and Escape. After the input fix, a held key made one choice or opened one panel. Movement and typing still repeated, and a newly mapped key opened the Folding Map. A fresh intro awarded one Date Lens and 30 marks through rapid input. Journal notes survived phone rotation and saved once. A separate door test used eight Nexus and Cold Store transitions, 40 native key-repeat events and both motion settings. Each new press after release could still interact normally.

The automatic portal run verified both locked gates, then crossed both ways while holding diagonal input through the camera fades. It staged the repaired label and earned the seal through the ordinary Emberford sequence. Before the fix, holding Up from the south edge of the Emberford portal carried the Guardian through a second crossing as soon as the Nexus appeared. After the fix, the Guardian walked to the Nexus wall and stayed there. A fresh press inside the zone kept the Guardian in the Nexus. Stepping out and back in deliberately reopened the passage. The smaller `portal` fixture stages both prerequisites and reruns the south approach with native input. [Portal regression](../tools/smoke-navigation.mjs)

The save test recovered a readable checkpoint when the Continue slot was damaged, then saved and reopened it. Chromium also reopened saves with a retired room, invalid coordinates and a position standing in Ferry water. The Guardian arrived on legal floor and the older checkpoint survived the next ordinary save. The domain tests exercise conflict recovery between two concurrent revisions. [Save tests](../tests/saves.test.ts)

The journal export test used a disposable copy of the campaign that had reached the Council. Inspecting the Turin Mine Map through the normal exhibit control left the source list empty. Taking it added one MLA citation to the exact Museo Egizio record. The downloaded Word file contained a working hyperlink, italicized title and hanging indent. The rendered PDF contained a clickable link to the same source. Both exports omitted a private note with the default setting. [Exact catalogue record](https://collezionepapiri.museoegizio.it/en-gb/document/9/)

The full credits catalogue stayed hidden in a fresh game. After the earned Council ending, the tester paged through 43 pages and found 1,018 distinct citations. There are 1,017 distinct URLs because the two individually dated Yirrkala bark petitions share one official catalogue page. The title keyboard test used native Enter and Escape for both Credits and Settings and verified focus returned to the button that opened the panel. [Shared Yirrkala source](https://www.foundingdocs.gov.au/item-did-104.html)

In a separate copy of the completed campaign, Lia accepted the original pen as a private loan. Her signed reply unlocked the Handover Room. The player placed a travelling-stand notice on the east wall, returned through the normal doors and ran a drying-rack handover. Saving and reopening kept the west-bench copy and advanced to the next case. The Council outcome and ordinary credit stayed intact. A pointer click selected Kip when he passed in front of the Archive doorway. The keyboard interaction opened the door from that approach.

The audio checks used both Web Audio and a separately confirmed HTML5-only Chromium session. They exercised consent from a physical click, continuity across rooms within a world, live volume and mute, captions, fallback tracks and release of the previous track on a scene change. The Web Audio run also checked cleanup after returning to the title.

## Four connecting story routes

- **The Last Turn.** Staged the prior Showdown and study work, then used both market readings and both routes to Elsbet’s file. The cellar stayed closed at five lamps and opened at six. The timed domain trace also plays the original Showdown and citation knot. [Route and timing checks](../tests/tok-coverage.test.ts)
- **The Spare Seat.** At 390 and 1100 CSS pixels, both tabs challenged the same lending rule. The player took the checked warrant through the normal Nile and Civic doors and installed either a referral or a moved service stop. The two browser runs staged earlier chapter requirements. [Branch tests](../tests/spare-seat.test.ts)
- **The Empty Hook.** Three separate browser profiles checked the two viewpoints and each signed account. The rail and bench routes worked before the House of Performance. The folded route first earned its Parrot Warning preparation in the Script Cabinet. Each installation persisted and received a distinct response. The runs staged earlier chapter gates and used adjacent test positioning. [Branch tests](../tests/forest-narrators.test.ts)
- **What the Gold Says.** Chromium opened the exact Cleveland folio 1979.23, read both source-backed frames and took each route through the receiving foyer. One reader used the self-guided rail and another heard the staffed explanation. Earlier gates were staged. [Branch tests](../tests/leaf-frame.test.ts)
- **Both Faces at the Same Stop.** Two Chromium saves staged the earlier Cold Store publication, earned and equipped the working copy of CMA 1971.152 through its clearance trial, and operated the plain practice press. Strips from different stops could not travel as a pair. One player slid the Light-stop spare strip into alignment at the low rail at 390 CSS pixels and 175% text. The other repeated the Firm-stop Face B trace at the staffed east bench. Save and leave followed by Continue kept the chosen fixture and the recorded stop. [Proof tests](../tests/beater-proof.test.ts)

## Later handovers and clue continuity

- Hesper’s required post-Showdown visit used both readings of the same ink square and both arrangements. From a prepared Corvan result, the player used the dialogue, walked to Kip, returned through the portal and spoke to Ise. Only the matching bench or return drawer appeared. [Hesper route tests](../tests/hesper-visit.test.ts)
- The Date Through the Door used both clipped slips, Imani’s existing dispatch choices, the normal Nexus return and the physical public-board or staffed-pickup readback. Chromium used prepared Chapter 1 and Nile investigation prerequisites at 390 and 1100 CSS pixels. The domain tests also execute the investigations and dispatch branches. [Nile route tests](../tests/nile.test.ts)
- The Observatory used both named places and both handovers at 390 CSS pixels. After the previous display was staged, the player walked the normal crossings, checked the records, used Tab and Enter and verified the fitted strip or walking guide. The existing signal and runner routes remained available. [Observatory route tests](../tests/observatory.test.ts)
- Two Calls After Tuesday earned the signed minute in Metalworks and used it at the City press. Chromium tried both notice repairs, installed each at the landing in its own profile, and checked the signed result at the archive. At 390 CSS pixels and 175 percent text, the integrated build also picked the current proof or revision when Lumen’s help opened. Both browser routes staged earlier main gates and positioned the player beside interactions. [Notice tests](../tests/two-calls.test.ts)
- At Shoal Shelf, each Chromium route earned the Yirritja guide, opened the fictional teacher’s request, and checked both dated parliamentary records and the community link. The player walked to the matching rail or Clio handover. The other station stayed hidden. [Passage tests](../tests/specimen-passage.test.ts)
- In two profiles at 390 CSS pixels, the Market’s posted or reweigh choice produced its own physical Water Commons receipt after the first allocation. Each profile earned the Keeper of the Next Count title, completed both water trials, combined the Civic registers and read Ade’s next-round slip. The reweigh run saved, chose Continue and reopened the same Civic slip. The previous Stage gate was prepared. The run used native interaction keys from alongside stations with the regular tool controls. [Market and Water tests](../tests/market-story.test.ts)
- At Dov’s drawers, Chromium at 390 CSS pixels and 175 percent text opened the relevant clue and used all four depths. Turning drawers kept the help and keyboard focus in place. The completed step dropped out of the clue choices. [Guidance tests](../tests/guidance.test.ts)
- The Study to Archive of Voices handover used actual binding, searches and receipt placement after staging earlier chapter gates. Four separate clues were available at both places. Repeating the final clue changed no marks, credit or skill use. The resulting skill records kept the two settings distinct. [Transfer tests](../tests/learning-transfer.test.ts)
- On the Ferry, Chromium switched to a second tab while a held direction was moving the player toward the water. The key was released in the second tab. On return, the player stayed on the same legal tile and a fresh sideways press moved normally.
- Two Circles on the Rail was checked at 390 and 1100 CSS pixels after staging Chapter 1’s portal prerequisites. Each browser checked both copies in a different order, placed one, inspected the distinct visible installation, and walked through the unchanged Workmen’s Room or Royal Records door. Both investigations stayed open until the player went to them. [Entry pin tests](../tests/nile-entry-pins.test.ts)
- At the House of Performance, two 390 CSS pixel profiles at 175 percent text each read the sightline, opened the call slip, used all four local clues and chose a cue with the keyboard. The gallery gave a separate readback for the spoken cue and the quiet rail slip. Earlier prerequisites were prepared and the player was positioned in the gallery. [Performance tests](../tests/performance-story.test.ts)
- In the two Civic deliveries, Chromium used a disposable copy of a campaign that reached the Council. It carried the signed Night Map order and the Second Delivery’s docket to their Water Commons receivers, checked the dated journal entries and opened the Skill Atlas. Only the active delivery appeared in Water Lumen help. A reload and Checkpoint Recovery restored the unfinished delivery and its hint depth. Completed awards survived, old and duplicate skill uses collapsed to one Water use, and the earlier Civic comparison kept its own credit. [Delivery recovery tests](../tests/delivery-attribution.test.ts)
- Two Chromium profiles saved and resumed a prepared Market record from before the new procedure existed. Each player deferred the blank-ticket decision, returned to choose posting or reweighing, and earned the Water title with the earlier whole-lot notice still in place. [Market tests](../tests/market-story.test.ts)
- The Two Shutter Room opened in a fresh game after both discovery marks. Chromium used native Enter at 390 CSS pixels and 175 percent text. It exited and re-entered before solving, traced both baffles, corrected each, checked both physical shutters, reset the board and retained the earned fitting. The player tried both hall fittings, heard Tavin and Merra, and found a refit unavailable until both replies were filed. The original Nile door stayed locked. The fixture positioned the player beside some interactions. The domain checks enumerated all eight mirror orientations, all sixteen press records at both stops, repeated inputs and malformed stored values. [Shutter tests](../tests/shutter-board.test.ts) · [Beater tests](../tests/beater-proof.test.ts)

The new registry sweep covered 122 maps, 70,420 tiles, 1,807 visible prop frames and 1,459 sampled routes. It probed 338 boundaries and 39 tight corners and rejected 336 solid pointer targets. The accelerated wall hour, held-key portal return and trusted Ferry tab switch passed on the same build. [Navigation runner](../tools/smoke-navigation.mjs)

Two native input tests held a direction toward the barrier, Right and Space, then clicked the blocked tile during the hold and again after release. The fixtures started next to Ferry water at tile (7, 9) and an Emberford house at (34, 6). The player slid along each edge and stayed on legal floor throughout 176 sampled animation frames. The blocked clicks queued no movement or interaction. A click on legal ground worked after release. [Registry stress tests](../tools/smoke-navigation.mjs)

A second uninterrupted real-time wall test ran for 60 minutes on the earlier handover build. Chromium sent one held movement key, sampled legal position, animation, footsteps and frame progress, then released it. Movement away resumed normally.

- **The Place Left Open.** Two Chromium profiles staged earlier Water, Civic and Island prerequisites. Starting beside interactions, each checked the missed invitation, the signed handover, the moved call and two firsthand replies. The existing Time Hall doorway took the player to the live hearing or the written witness station. Each preserved Ione’s objection and produced its own district receipt. The written route used Enter at 390 CSS pixels and 175 percent text. [Participation tests](../tests/open-place.test.ts)
- **The Joined Cover at Two Tides.** Two Chromium profiles earned Cleveland 1971.160 through its original relay and equipped it through the Satchel. Each tested the same packet with both support arrangements. At the ledge, the centered position cleared the model pin and then hit the receiving post. Moving the packet outward let the two supports finish the real handover. The workshop rack used a separate centered result. Both persisted through Save and leave followed by Continue. Earlier access was staged. [Joined cloth tests](../tests/joined-cloth.test.ts)

### Journal and progress privacy

In a disposable Chromium profile on the shutter checkpoint, ordinary page load and New Game made 54 same-origin GET requests. Passive tab monitoring observed no further requests during a settings change, saving a synthetic journal entry, two Word exports or teacher progress preview and download. The default Word file omitted the note. Explicit inclusion added it, and reopening the diary reset the checkbox. The downloaded teacher file omitted the note. The run covered one tab and used invented text. [Journal export tests](../tests/adventure-journal.test.ts)

### Additional engine evidence

Playwright WebKit 26.0 WPE on Linux loaded the shutter checkpoint in a fresh 1280 × 800 viewport. The player made the opening choice, held a movement key, opened and closed the folding map and menu, then used Save and leave. Reloading and selecting Continue retained the Guardian name, choice and saved tile. The Council and joined-cloth build passed a separate startup, movement, map and menu check in the same engine. Both runs used WebGL with zero JavaScript exceptions and zero failed same-origin requests. Firefox 146.0.1 timed out during launch on this host before opening a game page. [Platform readiness](PLAYTEST_PRIORITIES.md#platform-evidence-and-persona-review)

Firefox 153.5.1 ESR with geckodriver 0.36.0 on x86-64 Debian 13 subsequently opened the same build using Canvas. A new Guardian chose an origin, moved with native keyboard input, opened and closed the map and menu, saved, reloaded and resumed at the saved tile with the same origin. A separate native tab switch stored the active tile, kept the map open and restored canvas focus and movement when the player closed it. This run used headless Firefox. [Platform readiness](PLAYTEST_PRIORITIES.md#platform-evidence-and-persona-review)

Chromium 156 on Debian 13 passed native touch input in emulated 390 × 844 and 844 × 390 phone viewports and 820 × 1180 and 1180 × 820 tablet viewports at DPR 2. The player opened the first label and clues, rotated with help open at 175 percent text, interrupted a held touch, used the entrance guide, saved, continued and walked again. One cancelled touch left the clue at the same depth. The platform matrix tracks these as emulated viewports. [Platform readiness](PLAYTEST_PRIORITIES.md#platform-evidence-and-persona-review)

### Saving when storage is unavailable

On `fa4f364`, Chromium and Firefox ESR returned to the title and displayed a success notice after a simulated browser storage rejection. Chromium reproduced the same false success from a stale tab after a newer tab saved, leaving that newer save intact while losing unsaved progress in the older tab. With the save correction, the menu and adventure remain open, the stale tab retains its unsaved choice, and the newer save stays intact. Chromium, Firefox ESR and WPE WebKit saved again once storage accepted writes and resumed the original choice after a full reload. A separate learning-record write failure preserves the action and its feedback, and retry persists the new record. The regression checks also cover an older tab's normal activity timer attempting to replace a learning record changed by another tab. These tests injected a storage denial and used two real tabs for the campaign revision conflict. [Save tests](../tests/saves.test.ts)

### Recovery and feedback at the interaction

At 175 percent text in Chromium's 390 × 844 phone and 1180 × 820 tablet emulation, the objectives tracker covered the viewport position of the mirror board and the low shutter. The touch layout limits the panel height and keeps the full objectives scrollable. Native taps then opened the same board and checked the low shutter from the same camera positions. A separate Chromium run required both replies after refitting the pin, including after a save and reload. The joined-cloth frame retained its instructions for both destinations before and after checking the receiving spot. [Shutter tests](../tests/shutter-board.test.ts) · [Cloth tests](../tests/joined-cloth.test.ts)

The Rumour Mill now identifies the unopened source required to support its feedback. In Chromium, reading Noa's record unlocked the verdicts. The feedback distinguishes similar mineral levels from evidence that the well water affects learning. Lumen's reflection waited for Sol's conversation to close. The browser fixture prepared the location or conversation and used the visible controls for the reported checks. [Rumour tests](../tests/story.test.ts)

At the ferry landing, Chromium reproduced the old shop opening question which awarded trust before the prices were itemized. Players with three River folk trust paid 18 marks for Corvan’s wallpaper after the expected choice and 20 after another choice. The corrected shop opens directly, and the optional comparison of the two woad slips awards the same trust once. Chromium bought the dye with the slips closed, opened them with Enter and verified the later discount. Existing earned trust stayed available in the legacy-save tests. [Trade tests](../tests/story.test.ts)

With three status messages already queued, Firefox ESR did not show a failed Save and leave until the toast queue advanced. The updated save dialog shows the error beside the retry button and keeps focus there. The browser check used 175 percent text, injected a failed write and retried after restoring the writer. Chromium’s accessibility tree exposed the error as an assertive alert inside the dialog. [Save dialog](../src/ui/ui.ts)

In Chromium, ordinary Continue previously replaced a later-format learning record while restoring an older adventure. A separate incomplete record could throw during Continue. The game now warns about unreadable learning data and keeps the original bytes while opening a readable adventure. The save tests also cover temporarily denied reads, campaign bytes that change in another tab and supported older learning records. [Save read protection tests](../tests/saves-read-protection.test.ts)

The Emberford recovery run used native key and touch input at 175 percent text. It interrupted a tap-to-walk with an arrow, checked the locked cellar, recovered from an unsuccessful forge action and reached the assay. The fixed Forge retained focus on the action and Tab reached the next control. Separate taps opened Nell’s easel and the Weigh-House balance. The Nexus drawer and Ibn al-Haytham plaque also have separate spots, as do the Ferry slate and guest book. [Map layout tests](../tests/chapter-maps.test.ts)

In the Nile Archive, Chromium saved a single completed ridge trial, continued, then opened the shelf-top model again at 390 CSS pixels and 175 percent text. It found the saved reading, followed the model’s hint to the remaining wash route and completed a delivery. The HUD directed the player to the active Nile investigation. [Guidance tests](../tests/guidance.test.ts)

## Five investigation routes

Chromium played the new Nexus rehearsal from a fresh title. It held the rhythm fixed across two facings, cancelled a touch during rotation, kept the recorded run across Continue and reached the matching cue receipt. The House replay staged the earlier chapter gate and used the real gallery board and arrival. Sill Bridge replays exercised the wheel, both receiving routes and the ferry’s different timing rule, with the earlier ferry-road permission staged. [Facing tests](../tests/facing-cue.test.ts) · [Sill Bridge tests](../tests/sill-bridge.test.ts)

The Nile bend route read the source, cancelled under the weight, resumed a saved result and moved the card into a fresh City trial. The Witness Clip used the normal City doors after staging earlier prerequisites, then exercised both recipients and their durable notes. Below the Gauge used earlier Water and Civic entry fixtures. The two required pegs, both notices, the physical receivers and the later Canal responses used the real interaction controls. [Bend tests](../tests/strip-bend.test.ts) · [Witness Clip tests](../tests/witness-clip.test.ts) · [Below the Gauge tests](../tests/catchment.test.ts)

The Chromium navigation sweep covered 125 maps, 71,149 tiles, 1,497 sampled routes, 346 boundary probes and 40 diagonal corners. The simulated hour against the archive wall, the held-key Emberford return and the Ferry tab switch also passed. [Navigation runner](../tools/smoke-navigation.mjs)

### Startup with delayed sound

Fresh headless Firefox ESR 153.5.1 reached the opening text on the previous and five-investigation builds, then waited on audio decoding through a 60-second observation. In a diagnostic build, all 37 files finished downloading and the 14 sound effects were still processing. The startup path now builds the world from the art and continues loading effects in the background. [Startup scene](../src/scenes/BootScene.ts)
