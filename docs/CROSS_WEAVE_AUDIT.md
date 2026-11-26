# Learning actions across worlds and RPG elements

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

## Prescribed title sources

Seven publicly accessible source PDFs contain 42 verified session and ordinal references. Page 2 of each contains titles 1–6. The verified sets are May 2022–2025 and November 2022–2024. The audit records the source, page and ordinal in `essay-title` dimensions such as `essay-title:PT-M25-03`. These IDs document access to the listed source. Each gameplay adaptation requires a separate action proof. The rest of the historical inventory is unknown. [Title source metadata](../tools/prescribed-title-sources.json)

**May 2025, ordinal 6.** At the House of Performance, leave the light in place for a visitor’s first look at a relief or move it in front of them to reveal how a shadow or grip is made. Each option prompts a different specific question from a fictional visitor. The quiet first look shows that curiosity can also arise without a demonstration. The audit credits the actual optional readback, which a player can skip even after completing the foyer display. The authored responses do not measure a learner’s curiosity. [Route test](../tests/performance-story.test.ts) · [Source, p. 2](https://drive.google.com/file/d/13bWJb21r-h4G7pnt8Qrbl_a-5Pka4OO6/view)

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

**Nexus · The Fourth Corner.** Compare the two physical inserts and check the dated repair order before choosing how to display the missing corner. The mathematical fit shows which completion follows the diamond repeat. The historical record dates the documented repair and leaves the first weaving unresolved. The same display decision uses each source for what it can establish, either by making the proposed repeat available on a separate tracing or by leaving the gap open beside the order. The encounter applies evidence and justification through scope, and methods and tools. [Nexus route test](../tests/fourth-corner.test.ts) · [Display and readbacks](../src/maps/fourthCorner.ts)
