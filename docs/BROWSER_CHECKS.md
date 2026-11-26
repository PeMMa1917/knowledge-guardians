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

The later kettle feature also passed a production browser route. I staged the label and folded map, used the Emberford portal and ferry road, replayed the service with two different shifts, and carried one card through the gated Market entry after staging the Performance finish. The covered-table placement showed the final two cups after the first handoff. [Kettle route tests](../tests/ferry-kettle.test.ts)

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
