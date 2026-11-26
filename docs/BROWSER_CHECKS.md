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

## Integrated preview

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

## Resizing and reduced effects

At a 390 × 844 CSS-pixel viewport, the production build of `8fafb19` ran 56 world-camera callbacks for one resize after visiting all 52 maps and rebuilding scenes during settings changes. Resizing again after returning to the title threw an exception when a callback reached the stopped camera. The patched build ran one world-camera callback while playing and none on the title screen. The access smoke now checks both counts and resumes the saved map through Continue. [World scene](../src/scenes/WorldScene.ts), [Smoke runner](../tools/smoke-worlds.mjs)

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

A separate Chromium save staged the three completed Makers cases, then claimed and equipped each copy through its usual item and tool controls. Only the matching fixture appeared. The player compared unequal and equal practice tones, moved the name and relief guides at the disk swivel and posted two different ledger outcomes with the dated receipt. The final outcomes still appeared after each fixture was reopened. [Makers’ Room tests](../tests/maker-room.test.ts)

### The Second Reading Store

A production preview showed all 36 Council case positions. At 390 CSS pixels, the route checked both positions, took and equipped 63.166a–j and 2429, then used their distinct public rail and staffed table at the Bell Archive. At 1100 CSS pixels, the same checks reached both handovers with 1974-541 and PIA22115. In each route, the initial exhibit had no claim button, the stand graphic changed with the selected setting, and the earlier archive scene stayed gated until the earned object was equipped. The route staged the earlier chapter prerequisites and used the normal doors and interaction controls after that. [Object and return checks](../tests/second-reading.test.ts)
