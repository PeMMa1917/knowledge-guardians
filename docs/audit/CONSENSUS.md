# Consensus fixes

A consensus fix is a change that no persona has a strong reason against. Each fix keeps the AGENTS.md rules. Status values: **done** (in this branch), **started**, **planned**.

When you change code for a fix, update its status and the "Where" column.

| ID | Fix | Who asked most | Status | Where |
| --- | --- | --- | --- | --- |
| C-001 | Keep this audit and its evidence tool, and run the tool after content changes. | B12, E10, H2 | done | `docs/audit/`, `tools/audit-personas.mjs` |
| C-002 | Lumen's glossary explains the world's work words. Each entry has a word history, two earned examples and a fallback. | A4, I2, J3 | done (8 words: slip, docket, tally, ledger, custody, testimony, attribution, accession) | `src/content/glossary.json` |
| C-003 | Step titles use plain words and name objects by their title, not by an accession number. | A3, A4, I2, I3, E1, K1 | done for 405 generated titles, the hardest chapter 1 and 2 titles, and the chapter 3 gallery; more chapters planned | 17 generators in `src/content/*.ts`; `door-fold.json`, `nexus-reading-rests.json`, `pigment-window.json` |
| C-004 | Spread play variety: each chapter gets one signature game, and new games and puzzles from the Drive lesson ideas go into chapters 2 to 15. | E1, D5, H4, G8, G2 | started (chapter 2: The Copyists' Ladder; chapter 5: The Three Trees) | see [DRIVE_WEAVE.md](DRIVE_WEAVE.md); `src/domain/wordLadder.ts` |
| C-005 | Voice sheet: each named character has a belief, a worry, a way of speaking and a reason. A test checks that each speaker with more than 20 scenes has a sheet. | E2, E3, E4, G5 | planned | `docs/VOICES.md` (new) |
| C-006 | More Showdowns: Seal agents (including Vesper) in chapters 3, 6, 7 and 10, and a town-meeting form with more than two voices. | G4, D1, D8, E1 | planned | `src/content/` showdowns |
| C-007 | "At a glance" pack for IT, data security, families and school leaders: no network calls, what is stored on the device, two saves, no accounts in this build. It says the game is not endorsed by the IB. | B5, B6, B8, B9, B10, B11 | planned | `docs/FOR_SCHOOLS.md` (new) |
| C-008 | Teacher map made from the weave tags (concepts, AoKs, subjects, thinking levels), with debrief prompts per chapter. | B1, B2, B4, C1 | planned | `tools/`, `docs/` |
| C-009 | After a choice, the journal can show the TOK words for what the player just did. Journal only, never a pop-up. | A7, B1, H2 | planned | journal UI |
| C-010 | "Good place to stop" notes, and a journal that shows pathways. No main-story badge and no single main path (Mika, X-010). All cases stay. | A5, G9, G11, I3 | planned | mission data and journal UI |
| C-011 | Choices are remembered: Echoes change the map, tone choices change later greetings, titles change how people speak to the player, origin characters return. | G5, G10, E3, H4 | planned | dialogue conditions |
| C-012 | Each chapter has at least one main-route encounter with a DP subject, so the subject link is not only in side missions. | B3, B4, B12 | planned | chapters 2 to 15 |
| C-013 | Phone and low-end device check, and a keyboard path for every drag action. | I1, K1, B7, E10 | planned | QA notes |
| C-014 | Content notes for sensitive real objects (human remains, conflict, colonial collection). | J1, J2, B8, I4 | started (chapter 3 human remains) | `src/content/content-notes.json`, `src/domain/contentNotes.ts` |
| C-015 | Progression table per chapter: what the player can do at the end that they could not do at the start. | H1, H2, H6 | planned | `docs/` |
| C-016 | Some missions end with a weighed judgement that a character pushes back on, not only "a reader uses the display". | D1, D2, C3, E1 | planned | R- and S-series missions |
| C-017 | A peer apprentice: a student-age friend who joins some side missions and sometimes disagrees. Friendship only. | A1, A9, E4, G3 | planned | new character |
| C-018 | Colour script: one palette shift per chapter that keeps the single art style. | E6, E7 | planned | art notes |
| C-019 | A registry for field-game panels, so `src/ui/ui.ts` gets smaller and new games use one shared layout. | E8, E14, K1 | planned | `src/ui/` |
| C-020 | Task music layers: a light layer for focus tasks, and a short sound for each trial result. | E9, H4 | planned | `src/domain/campaignScore.ts` |
| C-021 | Chapter 1 polish list. | many | started | [chapters/CH01.md](chapters/CH01.md#18-chapter-1-polish-list-c-021) |
| C-022 | Collectible-use check: every object the player gets is used somewhere else. A test lists objects with no later use. | G6, E1, Mika's rule | planned | `tests/` |
| C-023 | Real custodian voices: when a real object has a living community, its text says who keeps it today and how they describe it. | J1, J2, D7 | planned | object data |
| C-024 | When oral history is checked against written history, written history is also checked against oral history. | J1, D7, D2 | planned | dialogue |
| C-025 | The journal's 20 tabs go into 4 groups: Story, Evidence, Me, Help. | K1, I1, A5 | planned | `src/ui/ui.ts` |
| C-026 | Lumen's first line separates facts that can be checked from judgements that belong to the player. | D2, C3, B1 | done | `src/content/m01-nexus.json` |
| C-027 | EE practice step titles use world words. The EE tag stays in the weave data for teachers. | A5, A8, E1, B5 | done (14 titles) | `src/content/ee-trails.json` |
| C-028 | Every knowledge question is a real question, not an instruction. A test checks it. | B1, C1, A4 | done (22 missions fixed) | `earlier-viewing.json`, `star-paths.json`, `tests/audit-rules.test.ts` |

Mika's decisions on the contested list (X-001 to X-019) add more work. See [DECISIONS.md](DECISIONS.md). Two are done: X-013 (EE mission and board titles are in-world) and X-014 (the East Well uses notched tally sticks).
