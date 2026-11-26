# Learning actions across worlds and RPG elements

The audit checks a design target of ten distinct recorded actions for each world, learning dimension and numbered story or game element. A source-reviewed action can count in more than one pair when the same action supports each claim. An action only counts once in any one pair. The census is evidence of authored opportunities. It does not measure play frequency or learner attainment.

```sh
node tools/audit-cross-weave.mjs
node tools/audit-cross-weave.mjs --json > cross-weave.json
node tools/audit-cross-weave.mjs --cells --world WORLD-12 --dimension concept --element game:271
```

The JSON report contains world and registry inventories, counts for each gap status and the cells with a validated action. A `--cells` query emits every selected cell as a JSON line. Use a kind such as `concept` or an ID such as `question:KQ-ROUTE-35`. The `exhibition-prompt` filter selects the 35 exhibition questions. Filter by `game` or `story` to see a whole catalogue. An unfiltered expansion is large.

- `below-target` records one to nine actions. `meets-target` requires at least ten.
- `no-action-proof` means that the current evidence does not establish an intersection. It includes links that may exist but remain unreviewed.
- `excluded-by-design` and `planned-element` come from the project’s numbered [game](GAME_ELEMENTS.md) and [story](STORY_ELEMENTS.md) catalogues. A partial element can count only when the proof uses its actual implementation.
- `source-unavailable` identifies requested micro-skill numbers with no supplied row. Cells with an unavailable source and an excluded or planned catalogue item take the catalogue status. Both source and catalogue metadata stay visible in JSON. Cells with any of these three statuses leave the actionable gap count empty.

Add action evidence in `proofRows` after checking its actual source, map target, specific learning dimension and exact element ID. Record the interaction or consequence that demonstrates the intersection. Keep separate dimensions and elements on separate proof rows when only some combinations are supported. The tool validates map targets, source anchors, question and micro-skill bindings and catalogue status. The physical map provides world attribution. Candidate micro-skill links keep their authored mission world until someone checks the action location. They do not generate confirmed counts.

The vocabulary and etymology inventories use the registered glossary terms. Looking up a definition or seeing a word in dialogue does not establish active vocabulary use or a word-origin investigation. The 35 adapted exhibition families share the exact IDs they already occupy in the knowledge-question registry. The audit has no itemized inventory of past essay prompts. Extended Essay and CAS refer to practice opportunities in the game. Thinking levels and player preferences have independent audits. [Learning design](LEARNING_DESIGN.md) · [Micro-skill links](TOK_MICRO_SKILLS.md)
