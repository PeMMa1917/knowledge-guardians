# Multi-persona audit

Mika asked on 26 November 2026 for a full critique of Knowledge Guardians from more than seventy points of view: students of many kinds, teachers, school leaders, the IB and its examiners, universities, philosophers, game makers and critics, players of every type, historians, Indigenous communities, accessibility and inclusion specialists, learning scientists, and others. The main focus is TOK. The other DP subjects help students see how areas of knowledge connect and differ, and give them concrete examples from subjects they know.

The audit has three steps:

1. **Critique.** Each persona says what they like, what concerns them, and what they would change, chapter by chapter and encounter by encounter.
2. **Fix what everyone can accept.** A change goes ahead only if no persona has a strong reason against it. These are the *consensus fixes*.
3. **List the disagreements.** When one persona wants a change that another thinks is wrong, the item goes to Mika to decide. These are the *contested changes*.

Play, engagement and enjoyable learning stay the main goal. Other views can still change the game.

## Files

| File | What it holds |
| --- | --- |
| [PERSONAS.md](PERSONAS.md) | Every persona: who they are, what they value, and their game-wide likes, concerns and solutions. |
| [chapters/](chapters/) | One file per chapter. Each encounter has the persona notes that are specific to it, then the agreed fixes and the open disagreements. |
| [CONSENSUS.md](CONSENSUS.md) | The agreed fixes, numbered `C-###`, with their status and where they are in the code. |
| [DECISIONS.md](DECISIONS.md) | Mika's decisions on the contested list. These are rules for all developers. |
| [CONTESTED.md](CONTESTED.md) | The disagreements, numbered `X-###`, with who wants what, why, the options, and a recommendation for Mika. |
| [DRIVE_WEAVE.md](DRIVE_WEAVE.md) | Ideas from Mika's lesson folder and where they go in the story. Ideas only: no handout wording (the repository is public). |
| [EVIDENCE.md](EVIDENCE.md) | Measured facts: play shape, reading load, dialogue texture, counts. Made by `tools/audit-personas.mjs`. |

## Method

- **Personas speak from evidence.** Each note points to a mission ID, a file or a measured number. When a note is a judgement without measurement, it says so ("expected", "likely").
- **We do not speak for real communities.** The notes for Indigenous communities, cultural critics and similar personas use published principles (for example the CARE principles for Indigenous data governance) and the project's own care rules (AGENTS.md rule 17). They are questions to take to real advisors, not testimony. Real review by the people concerned replaces these notes.
- **Granularity.** Chapter 1 alone has 94 missions and more than 200 objective steps, and the game has 5,109 dialogue scenes. A note for every persona on every step would be tens of thousands of lines and would hide the signal. So each chapter file goes encounter by encounter. Each encounter lists every persona who has something specific to say about it. Each chapter also has a whole-chapter section where every persona group speaks. The persona file gives each persona's view of the whole game.
- **A consensus fix must keep the project rules.** Fixes never break AGENTS.md (no runtime AI, two saves, no hidden right answer, play first, no student-made content, no news, cultural care, and the rest).
- **Order of work.** Chapter by chapter, from chapter 1. Each chapter gets its audit file, then its consensus fixes in a commit, then an update to CONSENSUS.md and CONTESTED.md.

## Status

| Chapter | Audit written | Consensus fixes |
| --- | --- | --- |
| Whole game | [PERSONAS.md](PERSONAS.md) | C-001, C-002, C-003 done; others planned |
| 1 Emberford and the Nexus | [CH01](chapters/CH01.md) | C-026, C-027 done; polish list C-021 started |
| 2 to 15 | next | next |

## How to use this audit (for developers)

1. Before you change an encounter, read its section in the chapter file.
2. If your change touches a consensus fix, update its status in CONSENSUS.md.
3. If your change touches a contested item, follow [DECISIONS.md](DECISIONS.md). If the item is still open, ask Mika.
4. After a content change, run `node tools/audit-personas.mjs --md` and update EVIDENCE.md.
