# Accounts, classes and hosting

The review build includes opt-in class adventures, cross-device recovery and the assigned teacher’s writing dashboard. The game and the teacher page still run on a static host for local play. The service uses a same-origin Cloudflare Worker with D1. The reviewed configuration targets a separate preview database. Production enrolment and release require a later rollout.

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
6. **Writing audiences.** In a class adventure the student and their currently assigned teacher can read saved diary notes, questions, reflections and unfinished diary writing. The student sees the teacher’s name and class before opening the adventure and a reminder at the editor. The teacher sees unfinished work labelled Draft. Separate portfolio entries appear to the teacher only while shared. A student's private recovery package can restore private portfolio writing for its owner. The photo album lives on the device. The optional progress-file export keeps its existing sharing controls.
7. **Delete.** A teacher can delete one student or a whole class. Accounts with no sign-in for 18 months are deleted automatically. A student can download their own data.
8. **No student-to-student features.** No chat, no sharing of creations (NOMAKE-001).
9. **Local-only mode stays.** The game must work with no account, as it does now.
10. **Security.** Slow password hashes (never plain text), sign-in rate limits, HTTPS only, HttpOnly session cookies.

## 3. Saves

- Waystones, checkpoints, the two slots and the quiet backup do not change (section 24 of the spec, AGENTS.md rules 2 and 3).
- Local play uses the existing device saves. Class sign-in opens a separate adventure scoped to the account, accepted class and assigned teacher. An older local diary stays in local play. Class sign-in requires connectivity. A signed-in tab can continue writing offline.
- A save first writes the two slots, permanent record and current scene drafts to a single local class record. The client uploads a compressed personal recovery package and a separate, small teacher projection in one revision. A journal entry already being typed is persisted after the editor autosave. On another device sign in, read the audience notice, and select Continue.
- A pending revision survives closing the tab. Reconnection, refocus, sign-in and the retry control retry pending work. Concurrent edits stop automatic upload. Reopen the class at the title to compare the locations and saved times and select a copy. Only an acknowledged revision displays as synced. D1 retains the latest five revisions under the same account and assignment.
- D1 checks accepted membership and the teacher’s assignment for requests. The class dashboard returns the latest writing projection and reads no recovery package. A changed assignment requires fresh disclosure and has a separate save namespace. The teacher can refresh writing to pick up new revisions and withdrawn portfolio shares. Classmates have no writing view. Local session and browser storage on a shared device require the school’s normal device protections.
- A request larger than the preview service limit stays saved here and shows as pending. The pilot must measure actual long saves before selecting production storage limits or moving packages to R2.

## 4. Stable while the game changes

The game is still in development. The service must not depend on game content.

- **Recovery and dashboard have distinct payloads.** The Worker stores the versioned student package as an opaque compressed value. The dashboard projection accepts only a kind, title and text per entry. Photos and device storage keys are outside both payloads. The database stores application-readable data and requires restricted operator access.
- **Every game release loads every older save.** Use `CAMPAIGN_SCHEMA` and `PERMANENT_SCHEMA` migrations, and add a test for each new version.
- **Teacher data uses the progress summary** (`format: knowledge-guardians-progress`, `version: 1`, see `src/teacher/report.ts`). Change its version when you change its shape, and keep reading old versions.
- **Two addresses.** Every branch gets a Cloudflare preview address for tests. Students use the stable address, which changes only when the project owner approves a release.
- **Updates during play.** When a new release is out, ask the student to reload at the next Waystone, never during a dialogue, a tool or a puzzle.

## 5. Teacher tools

- Class list: accept, remove, reset password, delete data.
- Assignments: choose skills, concepts or areas of knowledge from the content pack. In the game, an assignment arrives as a **Council commission** in the story. It is never a task list or a quiz, and it gives no extra XP (PLAY-001, OPEN-001).
- Writing: sign in at `teacher.html`, select an assigned class, and refresh its writing. Drafts, saved entries and shared portfolio entries have distinct labels.
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

## Review the working build

Run `npm ci`, `npm run build`, and `node tools/classroom-preview.mjs` with Node 24. Open `http://127.0.0.1:8787` in two separate browser profiles. The loopback preview uses an in-memory SQLite database and the same request handler as the Worker. Restarting it clears its fictional accounts’ work. The student usernames are `ash-moth` in North Lanterns and `moss-wren` in South Lanterns. Their teachers sign in at `/teacher.html` as `north@example.invalid` and `south@example.invalid`. The fixture password is `Lantern-Fiction-42`. The Worker has no fixture or public account-creation endpoint.

Run `node --test tools/test-classroom.mjs` for the fictional access and version tests. The Worker configuration example and the D1 migration live in `server/`. A school deployment still needs account provisioning, confirmation/reset, deletion and retention jobs, operational limits, and a tested backup/restore process. Sign-up and production deployment remain pending.
