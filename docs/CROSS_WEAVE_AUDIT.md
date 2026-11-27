# Learning actions across worlds and RPG elements

The current inventory contains 1,531 learning dimensions, 438 RPG elements and 16 worlds. Of 10,729,248 intersections, two have ten independently documented actions and 737 have one to nine. The flood-bell case adds six documented objectives in the Listening Room, Plan Workshop and Time Hall. In one hearing order the girl limits what the runner’s calculated journey can say about that night. Reverse the records and the runner uses the girl’s account to plan a new route. Maren’s bell stair adds a seventeenth reviewed comparison of two areas. A listener describes an apparently endless climb, while the player compares the frequency bands at its two ends. The glass shows what repeats. Only the listener can report what they heard. A source row alone adds no action to the numerator. [Night watches](../src/domain/watchBell.ts) · [Action evidence](../tools/audit-cross-weave.mjs)

At the Copies press the wage record and the wheel change on the same morning. Grouping the four original shifts by wheel or by rota gives the same means. A personally run trial with the new wheel and one worker separates the estimates. That trial can inform the next shift. A historian looking for what happened on the original morning must still work with the surviving papers. This brings the number of explicitly tested cross-area comparisons to 20. [Mill playthrough](../tests/mill-shift.test.ts)

At the bell tower, the difference between two central readings is zero. Two half-finger limits put the possible change between minus one and plus one finger-width. The tea seller’s cup offers a second way to test the same reasoning. At the flood post the player can trace the missing digit and decide how Venn’s recollection travels with the surviving strokes. [Three field investigations](../tests/maker-field.test.ts)

The Blue Shift Coat adds 58 distinct action records and two cross-area comparisons, bringing the latter to 19. At the Island a shortcut sign changes who goes through the hinge. The length and capacity of the lane determine the time only once the travellers' response is specified. At the Listening Room the dated first slip and two interview methods let a player trace when the colour of a boat entered the record. The skills attached to any one trial share a single action in this census. [Worked comparisons](../tools/coat-action-evidence.mjs) · [In-game route checks](../tools/pocket-coat-journey.mjs)

Three Night Register actions have replayable evidence. In the Archive the Guardian can try the wrong mount and then restore the caption for *Needle Book*. Imani and the courier can remember the old frame after the Archive changes it. At the Old Weir, Button lets the player carry the same way of looking from Barnes’s drawing to Bartlett’s and then inspect the differences. Each contributes evidence in the world where the action took place. [Browser journey](../tools/night-register-journey.mjs) · [Object and witness checks](../tests/night-register.test.ts)

The November 27 review adds four playable traces. At the Spare Moon the Guardian can see who reaches a bed. In the gallery, standing up isolates the clap from the person’s memory of an audience. In the Underpan, turning the lamp explains part of a silhouette, while deciding where Fen works changes who can show her a receipt. Hearing Fen’s story alone gives no credit for testing the light. The audit checks the world target and corresponding test for each trace. [Reviewed actions](../tools/audit-cross-weave.mjs)

Following the folded-wing post adds six checked reasoning actions. In the Council, Lovelace's musical roll preserves a mathematical repeat while pitch depends on a musician. At the Island, Wang Zhenyi's ball casts a shadow whose position can be explained geometrically while the scale of real celestial bodies remains open. These raise the number of explicit two-area comparisons to 15. That earlier census recorded 2 intersections meeting the target and 333 with one to nine reviewed actions, out of 9,327,648. [Actions and reasoning evidence](../tools/audit-cross-weave.mjs) · [Receiving-scene checks](../tests/ink-post.test.ts)

The audit checks a design target of ten distinct recorded actions for each world, learning dimension and numbered story or game element. A source-reviewed action can count in more than one pair when the same action supports each claim. An action only counts once in any one pair. The census is evidence of authored opportunities. It does not measure play frequency or learner attainment.

```sh
node tools/audit-cross-weave.mjs
node tools/audit-cross-weave.mjs --json > cross-weave.json
node tools/audit-cross-weave.mjs --cells --world WORLD-12 --dimension concept --element game:271
node tools/audit-cross-weave.mjs --action-report --dimension reasoning
node tools/audit-cross-weave.mjs --action-report --dimension essay-title
```

The JSON report contains world and registry inventories, counts for each gap status and the cells with a validated action. A `--cells` query emits every selected cell as a JSON line. Use a kind such as `concept` or an ID such as `question:KQ-ROUTE-35`. The `exhibition-prompt` filter selects the 35 exhibition questions. Filter by `game` or `story` to see a whole catalogue. An unfiltered expansion is large.

- `below-target` records one to nine actions. `meets-target` requires at least ten.
- `no-action-proof` means that the current evidence does not establish an intersection. It includes links that may exist but remain unreviewed.
- `excluded-by-design` and `planned-element` come from the project’s numbered [game](GAME_ELEMENTS.md) and [story](STORY_ELEMENTS.md) catalogues. A partial element can count only when the proof uses its actual implementation.
- `source-unavailable` identifies requested micro-skill numbers with no supplied row. Cells with an unavailable source and an excluded or planned catalogue item take the catalogue status. Both source and catalogue metadata stay visible in JSON. Cells with any of these three statuses leave the actionable gap count empty.

Add action evidence in `proofRows` after checking its actual source, map target, specific learning dimension and exact element ID. Record the interaction or consequence that demonstrates the intersection. Keep separate dimensions and elements on separate proof rows when only some combinations are supported. The tool validates map targets, source anchors, question and micro-skill bindings and catalogue status. The physical map provides world attribution. Candidate micro-skill links keep their authored mission world until someone checks the action location. They do not generate confirmed counts.

When a reviewed action happens after an objective, record the independently observed outcome. The tool checks the outcome against the option effects and the representative test. The objective remains a prerequisite and the two paths through the same optional encounter count as one action.

The vocabulary and etymology inventories use the registered glossary terms. Looking up a definition or seeing a word in dialogue does not establish active vocabulary use or a word-origin investigation. The 35 adapted exhibition families share the exact IDs they already occupy in the knowledge-question registry. Extended Essay and CAS refer to practice opportunities in the game. Thinking levels and player preferences have independent audits. [Learning design](LEARNING_DESIGN.md) · [Micro-skill links](TOK_MICRO_SKILLS.md)

## Nexus evidence investigations

The Nexus has ten verified actions for evidence and game element 267, Investigation and forensic comparisons. Each action checks different records, observations or physical traces to resolve a particular discrepancy or show what the evidence leaves open. The count covers opportunities across the world. It does not assert that each player takes all ten routes or completes them in a fixed time.

| Action | What the player checks |
| --- | --- |
| The Fourth Corner | Try both inserts and compare the resulting fit with the dated repair order. [Test](../tests/fourth-corner.test.ts) |
| Between the Marks | Place the grant date and the museum’s range on the rail while leaving the start of everyday use open. [Test](../tests/opening-date-ribbon.test.ts) |
| Seal at the Door | Lift the handling seal and compare its docket with the model’s dated record. [Test](../tests/opening-seal.test.ts) |
| The Hinged Reader | Change the same drawing’s view to distinguish the visible marking point from the grant record. [Test](../tests/opening-viewer.test.ts) |
| The Slipped Print | On the optional edge-first route, see the misleading mark before reseating the same sheets over their pins. [Test](../tests/opening-print.test.ts) |
| The Same Stroke | Compare both pens on paper and wood and keep the different results on the matching bench strips. [Test](../tests/opening-practice.test.ts) |
| The Vindolanda tablet | Compare two attributed editorial readings against the traced marks and dated object record. [Test](../tests/vindolanda.test.ts) |
| At the Door Before the Bell | Check which source supplies a landmark and which verifies permission for a handover. [Test](../tests/door-fold.test.ts) |
| The Arrow at the Turn | Watch two readers try the unchanged arrow from opposite approaches to the same cases. [Test](../tests/opening-wayfinding.test.ts) |
| The Two Shutter Room | Follow the old route to the baffle, then redirect the beam and inspect both lit shutters. [Test](../tests/shutter-board.test.ts) |

```sh
node tools/audit-cross-weave.mjs --cells --world WORLD-01 --dimension concept:evidence --element game:267
```

## Prescribed title sources

Seven publicly accessible source PDFs contain 42 verified session and ordinal references. Page 2 of each contains titles 1–6. The verified sets are May 2022–2025 and November 2022–2024. The audit records the source, page and ordinal in `essay-title` dimensions such as `essay-title:PT-M25-03`. These IDs document access to the listed source. Each gameplay adaptation requires a separate action proof. The rest of the historical inventory is unknown. [Title source metadata](../tools/prescribed-title-sources.json)

**May 2025, ordinal 6 · The arts.** At the House of Performance, leave the light in place for a visitor’s first look at a relief or move it in front of them to reveal how a shadow or grip is made. Each option prompts a different specific question from a fictional visitor. The quiet first look shows that curiosity can also arise without a demonstration. The audit credits the actual optional readback, which a player can skip even after completing the foyer display. [Route test](../tests/performance-story.test.ts) · [Source, p. 2](https://drive.google.com/file/d/13bWJb21r-h4G7pnt8Qrbl_a-5Pka4OO6/view)

**May 2025, ordinal 6 · The natural sciences.** At Observatory Coast, compare the same two practice marks in still air and at the first gust. A dip at the step prompts a location check under a hood or a repeat at the exposed stand. Each check resolves a different uncertainty and leads its receiver to ask for a specific next observation. The arts example changes what a viewer notices about one relief. The Coast example changes what an observer can ask and test about a repeatable pattern. Both cases use authored responses. They do not measure a learner’s curiosity or a change in their sense of wonder. [Route test](../tests/coast-breeze.test.ts) · [Receiving readbacks](../src/ui/coastBreeze.ts)

## Reviewed reasoning actions

These classifications describe reasoning opportunities in the action. The audit does not record how an individual approached it.

| Mode | Evidence in the action |
| --- | --- |
| Deductive | Group all 64 possible Civic arrival assignments under the four-mark rules and count which use three separate marks. [Civic route test](../tests/civic-story.test.ts) |
| Inductive | In the Forest, compare the path edge with a patch away from it under each light condition. The two pairs support a local pattern and a better next check. [Forest route test](../tests/forest-sampling.test.ts) |
| Abductive | In the Nile Workmen’s Room, an upper lamp leaves two candidate explanations for the visible grooves. The fixed slip reveals a third groove from the side and hides it again from above. This favors a viewing explanation. [Nile route test](../tests/nile-followups.test.ts) |
| Analogical | In the Label Loft, transfer the relationship between a case figure and its tested setting or attribution to the corresponding figures and names on a two-berth dock copy. [Island route test](../tests/asia-label-loft.test.ts) |
| Causal | Release the same six floats under two pocket settings. The trace shows where the two missing floats stayed, accounting for the change in the lower count within the model. [Culvert route test](../tests/catchment.test.ts) |
| Pragmatic | Post one feasible water allocation after testing the settings and checking both work cards. The first order shows whose work can start and whose work has to wait. [Water route test](../tests/water-story.test.ts) |

## Applying two areas to the same decision

**Civic Machine · Three Loads, Four Marks.** The dispatch rack gives a mathematical count of 24 separate-mark assignments out of 64 and makes assumptions about equally likely ordered draws explicit. The Canal Walk slip gives human-sciences evidence about how one crew’s release schedule gathers workers at the same bell. Players check both in the same route before planning the receiving lane. The count answers what follows from the model. The account describes a social practice that can violate the model’s independence assumption. One release account cannot supply the actual arrival distribution. The shared concepts are evidence and certainty. The shared framework areas are scope, and methods and tools. [Civic route test](../tests/civic-story.test.ts) · [Local record](../src/maps/civic.ts)

**Living Forest · The Green Squares.** Count squares showing green in fixed-size frames near and away from the path under two light conditions. Then use the crew’s separate tally of where walkers’ boots touched the surface during one round. The natural-sciences observations establish a local pattern. The human-sciences observations make foot traffic a possible explanation while leaving whether walkers prefer already-bare ground open. Players put both records together before replacing the old shade notice. The action compares evidence and explanation through scope, and methods and tools. [Forest route test](../tests/forest-sampling.test.ts) · [Field dialogue](../src/content/m06-forest.json)

**Living Forest · Where the Wings Go.** The early and late watches reverse which lookout records more crossings. The work crews have their own reports of what they heard at different places and shifts. A quiet creek stop and a bridge briefing each keep the two kinds of record available. Both can carry a correction when the return watches record two each and the reeds hide one beat. The accounts describe what people heard. The counts describe crossings visible in the sampled watches. [Both Forest responses](../tests/living-forest.test.ts)

**Metalworks · The Turned Tag.** A turned tag and a fresh tag both reverse the triangle on the same cord. The old hole has a nick and the new hole has a clean edge. The two shop keys document different uses of a triangle, and the old trip note leaves the hole unrecorded. Keep both candidate explanations available at the yard or by the Hall index. [Trials and publication](../tests/metalworks-side.test.ts) · [Trip record and both copies](../src/maps/metalworks.ts)

**Metalworks · The Rim That Slipped.** Keep the blue sample and chalk marks fixed while testing an unsupported tray, a low peg and a padded sleeve. The dated docket describes a grey sample and a staffed Hall trial. The copied caption claims both benches, though its underlying yard line is blank. Keep each run with its own date and serve a first tray at the yard peg or the staffed Hall cradle. [Comparison and both receivers](../tests/metal-rim.test.ts)

**Civic Machine and Water Commons · The Line on the Night Map.** Regroup the same nine waits by the older ditch or the current footbridge route. The group with the longer mean changes while individuals’ waits stay fixed. Lin’s account names the crew’s new turn. Each rule serves a different fourth stop and keeps five requests visible for the next run. The exercise gives no comparison across shifts. [Both orders and receipts](../tests/service-boundary.test.ts)

**Council of Inquiry · When the Hand Moves.** The stopped watch that matches the opening mark supplies a counterexample to the one-glance rule. The signed repair seal records which shift, drum and readings its check covered. Post a fresh two-mark check each shift or use the dated record with a fresh check when the seal no longer applies. [Both rules and fallback](../tests/council-story.test.ts)

**Nexus · The Fourth Corner.** Compare the two physical inserts and check the dated repair order before choosing how to display the missing corner. The mathematical fit shows which completion follows the diamond repeat. The historical record dates the documented repair and leaves the first weaving unresolved. The same display decision uses each source for what it can establish, either by making the proposed repeat available on a separate tracing or by leaving the gap open beside the order. The encounter applies evidence and justification through scope, and methods and tools. [Nexus route test](../tests/fourth-corner.test.ts) · [Display and readbacks](../src/maps/fourthCorner.ts)

**Cold Store · The First Bell.** Players fit the same cart body first alone and then with its handler. They pin a visitor’s account beside the duty book for that bell and locate a later repair that moved a post. Either opening notice must respect the tested load, acknowledge whose experience the old notice omitted and keep a family name private. The chosen reader then changes which loads can enter at first bell. The micro-skill for comparing the four framework parts is recorded at that handover. [Route tests](../tests/clear-bay.test.ts)

**Emberford · The Copy That Came Back.** The printer’s issue book connects a stall notice, a tea copy and the stall’s later claim of corroboration. Tracing both copies and recovering the independent lookout’s time and sightline earns the circular-reporting micro-skill. The ensuing choice determines whether a runner holds one parcel or the clerk preserves the paper trail. [Route tests](../tests/circular-report.test.ts)


## Emberford and the City of Copies

Emberford has ten source-traced opportunities to use evidence in an investigation. The clerk’s cart map tests witness positions. The stock thread and market copy expose different gaps in provenance and consent. A ferry stub and guild order distinguish a deadline from an arrival. The washhouse splits an upstream reading from two downstream effects. The pen tray returns several named contributors to a one-name tag. Moving linen changes its appearance. The pigment stand separates a lamp change from a storage change. The speaking slate gives two readings of one gesture, and the printer’s ledger reveals a circular citation. Each proof in the audit names the physical station and the test that exercises it.

The City of Copies has two further comparisons. At the press, a lost time clause widens a claim. At the landing, an omitted source name breaks its attribution. Both exercise historical source tracing and the language theme. The audit counts each once toward evidence and investigation.

At Fern Station a Guardian first changes the recorder’s sightline, then separates the dated Gombe observation from the later account crediting Baraka Daniel. At the House of Performance, the earned notebook lets the Guardian apply that distinction to the caller and the helper who actually sees the curtain pin rise. In the Royal Records room two measured floor distances can guide a carrier, while a dated custody sequence can guide a file reader. The cross-area register credits the Forest and Royal Records decisions. It credits the Forest-to-House transfer as an analogy. [Forest and House](../tests/observation-sheet.test.ts) · [Royal Records](../tests/preserved-scale.test.ts)

**The Blue Tail.** Try the same slip through two slot depths and compare the two outcomes. At the press, match a tear to its printed copy before ordering a later fold. Bind the original to counterfoil B17 and keep the historical return field open. A witness permits the current route wording through the steward. Give the next reader the words through the public rail or a staffed desk. The tested receivers change what can be read without staff and when a new arrival can be checked. The historical method supports the earlier dispatch. The human-sciences listening and receiver checks come with consent and a particular audience. [Actions, limits and receipts](../tests/blue-tail.test.ts)
