# Accounts, classes and hosting

Status: **plan approved, not built.** The project owner (Mika) chose this design on 26 November 2026. Read this file before you add any login, online save or class feature.

## 1. The decision

- **Hosting:** Cloudflare. One Worker serves the game files (static assets), the teacher page and a small JSON API. One D1 database holds accounts, classes and saves. Above about 30,000 students, save files move to R2 storage.
- **Login:** our own code in the Worker. No third-party login product.
- **Students:** username and password only. Students never give an email, a real name, a birthday, a photo or a location.
- **Teachers:** email and password. Email confirmation and password reset by email.
- **Cost target:** the Workers Paid plan ($5 a month) for real classes. The free plan CPU limit (10 ms) is too small for safe password hashing.

Options that we did not choose: Supabase, Firebase, PocketBase on a rented server, an own Node server. Reasons: traffic limits on the free plans for a 12 MB game, paused free projects, open-ended bills, third-party logins, or server admin work.

## 2. Rules (in addition to AGENTS.md)

1. **No runtime AI** (CORE-005). The service only stores and returns data.
2. **Least data.** Store only: username, password hash, class membership, save packages, progress summary, assignments, shared portfolio entries. Usernames must not be real names. The game suggests Guardian-style names.
3. **The teacher is the gate.** A student joins a class with a class code, and the teacher must accept the request.
4. **Student password reset by the teacher.** The teacher presses Reset. The student gets a one-time code to set a new password.
5. **No tracking.** No analytics, no ads, no third-party scripts, no data sale.
6. **Private stays private.** Diary notes, portfolio writing and photos stay with the student unless the student shares them (TEACH-005, portfolio rule). The photo album never leaves the device.
7. **Delete.** A teacher can delete one student or a whole class. Accounts with no sign-in for 18 months are deleted automatically. A student can download their own data.
8. **No student-to-student features.** No chat, no sharing of creations (NOMAKE-001).
9. **Local-only mode stays.** The game must work with no account, as it does now.
10. **Security.** Slow password hashes (never plain text), sign-in rate limits, HTTPS only, HttpOnly session cookies.

## 3. Saves

- Waystones, checkpoints, the two slots and the quiet backup do not change (section 24 of the spec, AGENTS.md rules 2 and 3).
- `src/domain/saves.ts` uses a `KeyValueStore`. Add an online store that writes the local copy first, then sends the save to the service. If the device is offline, queue the save and send it later.
- On sign-in, the game gets the newest save. If the local save and the online save differ, show both (place, time) and let the student choose. Use the `revision` number of the slot pair.
- The service keeps the last 5 save packages for each student, so a bad release cannot lose work.

## 4. Stable while the game changes

The game is still in development. The service must not depend on game content.

- **The service never reads a save.** It stores a sealed package: `{ schema, savedAt, revision, data }`. Only the game opens `data`.
- **Every game release loads every older save.** Use `CAMPAIGN_SCHEMA` and `PERMANENT_SCHEMA` migrations, and add a test for each new version.
- **Teacher data uses the progress summary** (`format: knowledge-guardians-progress`, `version: 1`, see `src/teacher/report.ts`). Change its version when you change its shape, and keep reading old versions.
- **Two addresses.** Every branch gets a Cloudflare preview address for tests. Students use the stable address, which changes only when the project owner approves a release.
- **Updates during play.** When a new release is out, ask the student to reload at the next Waystone, never during a dialogue, a tool or a puzzle.

## 5. Teacher tools

- Class list: accept, remove, reset password, delete data.
- Assignments: choose skills, concepts or areas of knowledge from the content pack. In the game, an assignment arrives as a **Council commission** in the story. It is never a task list or a quiz, and it gives no extra XP (PLAY-001, OPEN-001).
- Progress: the current `teacher.html` views with live data. Formative only, no ranking, class totals only for the learner profile (TEACH-001 to TEACH-005, PROFILE-001).

## 6. Privacy and law

This is not legal advice. A privacy lawyer must check the privacy notice, the teacher terms and the data processing agreement (DPA) before sign-up opens to teachers outside the pilot.

Laws to check: COPPA (amended rule, compliance from 22 April 2026), FERPA and US state student-privacy laws, GDPR and UK GDPR with the UK Children's Code, PDPA (Singapore, Malaysia, Thailand), India's DPDP Act (parent consent under 18), China's PIPL. The school is the data controller; the project is the processor. Choose a D1 data location that fits the users (for example the EU).

## 7. Build order

1. Accounts service: teacher and student accounts, sessions, class codes, join requests, teacher reset.
2. Save sync in the game, with the choice screen and the offline queue.
3. Online teacher page.
4. Council commissions for assignments.
5. Privacy notice, teacher terms, deletion and export.
6. Pilot with the project owner's own classes on the preview address, on computers, phones and tablets.
7. Open sign-up for other TOK teachers after the lawyer review.

The full comparison with costs is in the project owner's planning document (not in this repository).
