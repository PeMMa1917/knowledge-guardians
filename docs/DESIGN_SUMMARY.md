# Design summary

This is a short paraphrase of the design for Knowledge Guardians. The full spec (version 2.10) is private and belongs to the project owner. It is **not** in this public repository, and no IB course wording is copied here. The rules that the code must follow are in [AGENTS.md](../AGENTS.md).

## The idea

Knowledge Guardians is a 2D top-down pixel-art RPG for students in an IB Diploma Theory of Knowledge (TOK) class. It is for classroom use, not for sale. The player joins the Knowledge Guardians, who look after the honest record of what people know. The player examines real objects from history, follows where claims come from, and argues in public about what the evidence supports.

The game does not grade the player. It gives the same credit for every reasoned judgement. It shows the result of a judgement in the world: a sign changes, a crowd reacts, a label holds or frays.

## Worlds

- **The Nexus** is a museum hub. Each wing holds real, dated objects from many places and periods.
- **Aethelgard** is a fictional world (labelled `fictional-world`). Its towns have their own people, trades and stories. Fictional cultures do not copy a real culture.
- Chapter 2 takes the Guardian from the Nexus to the Nile Archive and back. The full design has many more worlds.
- The Cold Store opens the Preserved Lives arc in Chapter 3. Its royal and Chinchorro rooms each distinguish a claim, the record that supports it, and a gap that stays visible.
- Chapter 4 opens the fictional Observatory Coast. Its harbour and headland produce different readings. The first notice reaches different people depending on how the player sends it, which matters when a new reading arrives.

## Core tools (play, not quizzes)

| Tool | What the player does | TOK idea |
|---|---|---|
| Date Lens | Sees what kind of date a record gives (made, patented, catalogued). | Evidence, interpretation |
| Fair test bench | Runs a model test and reads its stated assumptions. | Explanation, methods |
| Label builder | Writes a museum label from a subject, a criterion, a limit and support cards. | Justification, certainty |
| The Fray | A label that claims more than its evidence makes the room glow and visitors repeat a distorted line. | Responsibility, truth |
| Showdown | Argues in public: challenge a link, give a counterexample, qualify, reframe, concede a fair point, call a witness, ask for the source. | Perspective, power, values |
| Provenance Thread | Follows an object back through records until the record stops. | Evidence, interpretation |
| Forge and assay | Makes a schematic billet and compares it with an object. | Explanation, objectivity |

## Learning layer

- **Recurring choices:** the entrance guide, translation proofs, river gauge and archive displays let small decisions leave visible changes the player can revisit. The [content guide](CONTENT_GUIDE.md#introduce-ideas-through-decisions-and-consequences) maps the opening route and later encounters to the curriculum for authors.
- **Learner profile:** short "moments" in the journal when the player acts in a way that fits an attribute. Never a score.
- **ATL skills, areas of knowledge, DP subjects:** content records carry tags. The teacher view counts them for the class.
- **EE and CAS:** practice only. Play is never CAS.
- **Misconceptions:** fixed rules notice a repeated reasoning pattern. The student gets a private reflection. The teacher sees a class alert that may be wrong. Values never raise alerts.
- **Portfolio:** private entries (labels, Showdowns, tests, reflections). The student shares an entry with the teacher only by choice.
- **Random events:** a fair, seeded deck of short scenes. Calm mode lets the player delay them.

## Teacher view

A separate page that reads progress files that students choose to share. No server and no accounts. It shows class coverage, learner-profile class totals, misconception alerts, a private progress list and printable student reports. It never shows a mark, a predicted grade or a public ranking.

## Saves and credit

Two save slots (Continue and Checkpoint recovery). Permanent credit (XP, awards, moments) is kept apart from the campaign, so loading a save never removes it.

## Things the design excludes

- Runtime AI or generated text.
- Student-made content that other players see.
- News or current events.
- Loot boxes, paid currency or other harmful commercial patterns.
- Copies of other games' names, characters, art, music or levels.
