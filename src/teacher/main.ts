/**
 * Teacher view (teacher.html): a class dashboard and printable student
 * reports, built from progress files that students choose to share
 * (spec 94). No server and no account: files are read in this tab only.
 */
import '@fontsource/lexend/300.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import './teacher.css';
import { teacherContent as pack } from 'virtual:kg-teacher-content';
import { AOK_NAMES, ATL_NAMES, CONCEPT_NAMES, PROFILE_NAMES, SUBJECTS } from '../domain/curriculum';
import { clear, h } from '../ui/dom';
import { STAGE_LABEL, type SkillStage } from '../domain/skills';
import { latestPerStudent, readProgress, subjectCsv, summarise, type ProgressFile } from './report';

const root = document.getElementById('teacher')!;
let files: ProgressFile[] = [];
const problems: string[] = [];
let dismissed: string[] = [];
try { dismissed = JSON.parse(localStorage.getItem('kg.teacher.dismissed') ?? '[]'); } catch { /* storage blocked */ }

const essentialByChapter = new Map<number, Set<string>>();
for (const mission of pack.missions) {
  const chapter = Number(/^KG-CH(\d+)-/.exec(mission.id)?.[1] ?? 1);
  const ids = essentialByChapter.get(chapter) ?? new Set<string>();
  for (const objective of mission.objectives) if (objective.essential) ids.add(objective.id);
  if (ids.size) essentialByChapter.set(chapter, ids);
}
const chapterSteps = [...essentialByChapter].sort(([a], [b]) => a - b)
  .map(([chapter, ids]) => ({ label: `Chapter ${chapter} steps`, ids }));

/** EE practice trails (spec 92.2): shown as practice only (EE-003). */
const EE_STEPS = pack.missions.filter((m) => m.id.includes('-EE')).flatMap((m) => m.objectives);
const pct = (x: number) => `${Math.round(x * 100)}%`;

function bars(title: string, names: Record<string, string>, data: Record<string, { total: number; students: number }>, n: number, note: string): HTMLElement {
  return h('section', { class: 'panel' }, h('h2', {}, title), h('p', { class: 'note' }, note),
    h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', {}, 'Students who met it'), h('th', {}, 'Times met'))),
      h('tbody', {}, ...Object.entries(names).map(([k, name]) => {
        const d = data[k] ?? { total: 0, students: 0 };
        return h('tr', { class: d.students ? '' : 'gap' }, h('th', { scope: 'row' }, name),
          h('td', {}, h('span', { class: 'bar', role: 'img', 'aria-label': `${d.students} of ${n}` }, h('i', { style: { width: n ? pct(d.students / n) : '0%' } })), ` ${d.students} of ${n}`),
          h('td', {}, String(d.total)));
      }))));
}

const STAGES: SkillStage[] = ['seen', 'practised', 'confident', 'transferred'];
const skillName = (id: string) => pack.skills.find((x) => x.id === id)?.name ?? id;
const domainName = (id: string) => pack.skillDomains.find((d) => d.id === pack.skills.find((x) => x.id === id)?.domain)?.name ?? '';

/** Skill Atlas for the class (spec 76.1): students per stage. Stages are practice in the game, not grades. */
function skillPanel(data: Record<string, Partial<Record<SkillStage, number>>>, n: number): HTMLElement {
  const ids = pack.skills.map((x) => x.id).filter((id) => data[id]);
  return h('section', { class: 'panel wide' }, h('h2', {}, 'Skill Atlas (class)'),
    h('p', { class: 'note' }, 'How many students reached each stage of each skill in play. Seen: used once. Practised: 3 uses. Confident: 8 uses in 3 worlds. Transferred: 15 uses across 2 areas of knowledge. These describe practice in the game. They are not grades and do not mean mastery.'),
    ids.length ? h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Skill'), ...STAGES.map((st) => h('th', {}, STAGE_LABEL[st])), h('th', {}, 'Not met yet'))),
      h('tbody', {}, ...ids.map((id) => {
        const d = data[id]; const met = STAGES.reduce((a, st) => a + (d[st] ?? 0), 0);
        return h('tr', {}, h('th', { scope: 'row' }, skillName(id), h('br', {}), h('small', {}, domainName(id))), ...STAGES.map((st) => h('td', {}, String(d[st] ?? 0))), h('td', {}, String(Math.max(0, n - met))));
      }))) : h('p', {}, 'No skills met yet, or the files come from an older version of the game.'));
}

function dashboard(): void {
  clear(root);
  const s = summarise(files, pack, dismissed);
  const input = h('input', { type: 'file', accept: '.json,application/json', multiple: true, id: 'files' }) as HTMLInputElement;
  input.addEventListener('change', async () => {
    for (const f of Array.from(input.files ?? [])) {
      try {
        const r = readProgress(JSON.parse(await f.text()));
        if (r.ok) files.push(r.file); else problems.push(`${f.name}: ${r.reason}`);
      } catch { problems.push(`${f.name}: this file could not be read.`); }
    }
    dashboard();
  });
  const students = latestPerStudent(files);
  root.append(
    h('header', {}, h('h1', {}, 'Knowledge Guardians: Teacher view'),
      h('p', {}, 'Formative evidence from play. This is not a mark or a predicted grade. "Met in play" does not mean "mastered".'),
      h('div', { class: 'no-print row' }, h('label', { for: 'files', class: 'button' }, 'Add progress files'), input,
        files.length ? h('button', { onclick: () => { files = []; problems.length = 0; dashboard(); } }, 'Clear all') : '',
        files.length ? h('button', { onclick: () => window.print() }, 'Print the class summary') : '',
        files.length ? h('button', { onclick: () => download('subject-links.csv', subjectCsv(files), 'text/csv') }, 'Subject links (CSV)') : ''),
      h('p', { class: 'note no-print' }, 'Students save a progress file in the game (Menu, "Share with my teacher") and give it to you. The files stay in this browser tab. Nothing is uploaded or stored. Close the tab to remove them.'),
      problems.length ? h('ul', { class: 'problems', role: 'alert' }, ...problems.map((p) => h('li', {}, p))) : ''),
    guide(),
  );
  if (!students.length) { root.append(h('p', {}, 'No progress files yet.'), activities([])); return; }

  root.append(h('section', { class: 'panel summary' }, h('h2', {}, `Weekly class summary (${s.students} students)`), h('p', { class: 'note' }, `Made on ${new Date().toLocaleDateString()} from the latest file of each student. Formative only.`),
    h('ul', {},
      h('li', {}, `Concepts met by the fewest students: ${s.gaps.map((g) => CONCEPT_NAMES[g as keyof typeof CONCEPT_NAMES]).join(', ')}. A possible focus for the next lesson.`),
      s.alerts.filter((a) => a.classLevel).length
        ? h('li', {}, `Common patterns to look at: ${s.alerts.filter((a) => a.classLevel).map((a) => a.title.toLowerCase()).join('; ')}.`)
        : h('li', {}, 'No class-level misconception alert.'),
      h('li', {}, 'Suggested next step: run one short discussion on the top pattern, using the move in the alert panel.'))));

  root.append(h('div', { class: 'grid' },
    bars('Concept coverage', CONCEPT_NAMES, s.concepts, s.students, 'The twelve TOK concepts. Rows in grey: nobody met them yet.'),
    bars('Skills (ATL)', ATL_NAMES, s.atl, s.students, 'ATL categories met in play, for the class.'),
    bars('Areas of knowledge and themes', AOK_NAMES, s.aoks, s.students, 'Balance of the course so far.'),
    bars('Subjects', Object.fromEntries(Object.entries(SUBJECTS).filter(([k]) => s.subjects[k]).map(([k, v]) => [k, v.name])), s.subjects, s.students, 'DP subjects that play linked to. Compare with your school\'s subject offer.'),
    skillPanel(s.skills, s.students),
    h('section', { class: 'panel' }, h('h2', {}, 'Learner profile moments (class totals)'),
      h('p', { class: 'note' }, 'Counts for the whole class only. There are no student scores for the learner profile.'),
      h('ul', { class: 'chips' }, ...Object.entries(PROFILE_NAMES).map(([k, n]) => h('li', {}, `${n}: ${s.profile[k] ?? 0}`)))),
    h('section', { class: 'panel' }, h('h2', {}, 'Misconception alerts'),
      h('p', { class: 'note' }, 'Fixed rules on choices in play. An alert is a prompt to look, not a judgement, and it may be wrong. Values never raise alerts.'),
      s.alerts.length ? h('ul', { class: 'alerts' }, ...s.alerts.map((a) => h('li', { class: a.classLevel ? 'alert' : 'watch' },
        h('strong', {}, `${a.id} ${a.title}`), ` · ${a.students} student(s), ${pct(a.share)} of the class${a.classLevel ? ' · ALERT' : ' · watch'}`,
        h('br', {}), h('small', {}, `Suggested move: ${a.teacherMove}`),
        h('button', { class: 'mini no-print', onclick: () => { dismissed.push(a.id); try { localStorage.setItem('kg.teacher.dismissed', JSON.stringify(dismissed)); } catch { /* ignore */ } dashboard(); } }, 'Not a misconception')))) : h('p', {}, 'No patterns seen.')),
    h('section', { class: 'panel no-print wide' }, h('h2', {}, 'Progress and pacing'),
      h('p', { class: 'note' }, 'For you only. Do not show this list to the class (no public ranking). Names are in alphabetical order. This panel is left out when you print.'),
      h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Student'), ...chapterSteps.map(({ label }) => h('th', {}, label)), h('th', {}, 'EE practice steps'), h('th', {}, 'File saved'), h('th', {}, ''))),
        h('tbody', {}, ...students.map((f) => h('tr', {}, h('th', { scope: 'row' }, f.player),
          ...chapterSteps.map(({ ids }) => h('td', {}, `${f.objectivesDone.filter((o) => ids.has(o)).length} of ${ids.size}`)),
          h('td', {}, `${f.objectivesDone.filter((o) => EE_STEPS.some((x) => x.id === o)).length} of ${EE_STEPS.length}`),
          h('td', {}, new Date(f.exportedAt).toLocaleDateString()), h('td', {}, h('button', { class: 'mini', onclick: () => studentReport(f) }, 'Open report')))))))),
    activities(students));
}

/** Optional activities in the chapter, as lesson links: what each one is about, and how many students finished it. */
const OPTIONAL = pack.missions.filter((m) => !m.id.includes('-EE') && m.objectives.length && m.objectives.every((o) => !o.essential));
function activities(students: ProgressFile[]): HTMLElement {
  return h('section', { class: 'panel wide activities' }, h('h2', {}, 'Optional activities (lesson links)'),
    h('p', { class: 'note' }, 'Short activities that students can do at any time. Each one has a knowledge question you can use to start or end a lesson. You can ask the class to try one before a discussion.'),
    h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Activity'), h('th', {}, 'Knowledge question'), h('th', {}, 'Concepts'), h('th', {}, 'Areas of knowledge'), students.length ? h('th', {}, 'Finished') : '')),
      h('tbody', {}, ...OPTIONAL.map((m) => {
        const w = m.objectives[0].weave;
        const done = students.filter((f) => m.objectives.every((o) => f.objectivesDone.includes(o.id))).length;
        return h('tr', {}, h('th', { scope: 'row' }, m.title, h('br', {}), h('small', {}, m.objectives[0].title.replace(/^Optional: /, ''))),
          h('td', {}, m.knowledgeQuestion ?? ''),
          h('td', {}, (w?.concepts ?? []).map((k) => CONCEPT_NAMES[k as keyof typeof CONCEPT_NAMES] ?? k).join(', ')),
          h('td', {}, (w?.aoks ?? []).map((k) => AOK_NAMES[k as keyof typeof AOK_NAMES] ?? k).join(', ')),
          students.length ? h('td', {}, `${done} of ${students.length}`) : '');
      }))));
}

function guide(): HTMLElement {
  return h('details', { class: 'panel guide no-print' }, h('summary', {}, h('strong', {}, 'How to use this view (teacher guide)')),
    h('ol', {},
      h('li', {}, 'Ask students to open Menu in the game and choose "Share with my teacher". They choose which portfolio entries to include. Notes and the journal are never included.'),
      h('li', {}, 'Collect the files (for example through your school\'s usual hand-in). Add them here. A later file from the same student replaces an earlier one.'),
      h('li', {}, 'Read the weekly summary first. The concepts met by the fewest students are a possible focus for the next lesson.'),
      h('li', {}, 'Misconception alerts are fixed rules on choices in play. They can be wrong. Talk with the student before you decide anything. Use "Not a misconception" to hide an alert in this browser.'),
      h('li', {}, 'Learner-profile moments are class totals only. There are no student scores for the learner profile.'),
      h('li', {}, 'EE practice steps are practice on a set topic. They are not the student\'s Extended Essay, and the game never asks for the student\'s own question.'),
      h('li', {}, 'Nothing in this view is a mark or a predicted grade. Do not show the progress list to the class.')),
    h('p', { class: 'note' }, 'Privacy: the files stay in this browser tab. Nothing is uploaded or stored, except the list of alerts that you marked "Not a misconception".'));
}

function studentReport(f: ProgressFile): void {
  clear(root);
  const list = (title: string, names: Record<string, string>, data: Record<string, number>) => h('section', { class: 'panel' }, h('h2', {}, title),
    h('ul', { class: 'chips' }, ...Object.entries(names).map(([k, n]) => h('li', { class: data[k] ? 'met' : '' }, `${n}${data[k] ? ` (${data[k]})` : ''}`))));
  root.append(
    h('header', {}, h('div', { class: 'no-print row' }, h('button', { onclick: dashboard }, '← Class dashboard'), h('button', { onclick: () => window.print() }, 'Print or save as PDF')),
      h('h1', {}, `Student report: ${f.player}`),
      h('p', { class: 'note' }, `From the progress file saved on ${new Date(f.exportedAt).toLocaleString()}. Formative only: this shows what was met in play, not a mark. The student can see all of this in their own journal.`)),
    h('div', { class: 'grid' },
      list('Concepts met', CONCEPT_NAMES, f.met.concepts),
      list('Skills (ATL)', ATL_NAMES, f.met.atl),
      list('Areas of knowledge', AOK_NAMES, f.met.aoks),
      list('Subjects', Object.fromEntries(Object.entries(SUBJECTS).filter(([k]) => f.met.subjects[k]).map(([k, v]) => [k, v.name])), f.met.subjects),
      h('section', { class: 'panel' }, h('h2', {}, 'Skill Atlas'), h('p', { class: 'note' }, 'Stages of practice in the game, not grades.'),
        Object.keys(f.skills ?? {}).length ? h('ul', { class: 'chips' }, ...pack.skills.filter((x) => f.skills?.[x.id]).map((x) => h('li', { class: 'met' }, `${x.name}: ${STAGE_LABEL[f.skills![x.id]]}`))) : h('p', {}, 'None in this file yet.')),
      h('section', { class: 'panel' }, h('h2', {}, 'Awards'), f.awards.length ? h('ul', {}, ...f.awards.map((id) => {
        const a = pack.awards.find((x) => x.id === id);
        return h('li', {}, h('strong', {}, a?.name ?? id), a ? ` · ${a.earnedBy}` : '');
      })) : h('p', {}, 'None yet.')),
      h('section', { class: 'panel' }, h('h2', {}, 'EE practice (not the Extended Essay)'),
        h('p', { class: 'note' }, 'Practice on a set topic in the game. The student\'s real Extended Essay is their own work with their supervisor.'),
        h('ul', { class: 'chips' }, ...EE_STEPS.map((o) => h('li', { class: f.objectivesDone.includes(o.id) ? 'met' : '' }, o.title.replace(/^EE practice: /, '').replace(/ \(.*\)\.$/, '.').replace(/\.$/, ''))))),
      h('section', { class: 'panel' }, h('h2', {}, 'Open alerts'),
        h('p', { class: 'note' }, 'An alert may be wrong. Talk with the student before you decide anything.'),
        f.misconceptions.length ? h('ul', {}, ...f.misconceptions.map((m) => h('li', {}, `${m.id} ${m.title}: seen ${m.count} time(s) recently (${m.level}). Suggested move: ${pack.misconceptions.find((x) => x.id === m.id)?.teacherMove ?? ''}`))) : h('p', {}, 'None.'))),
    h('section', { class: 'panel' }, h('h2', {}, 'Portfolio entries the student chose to share'),
      f.portfolio.length ? h('div', {}, ...f.portfolio.map((e) => h('article', { class: 'entry' }, h('h3', {}, e.title), h('p', { class: 'note' }, `${new Date(e.at).toLocaleDateString()} · ${e.world}`), h('p', {}, e.text),
        e.reflection ? h('p', {}, h('strong', {}, 'Student reflection: '), e.reflection) : ''))) : h('p', {}, 'The student has not shared any entries.')),
    h('footer', {}, 'Practice in a game. A student\'s real TOK essay and exhibition are their own work outside the game; game text is not their own words.'),
  );
  window.scrollTo(0, 0);
}

function download(name: string, text: string, type: string): void {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name }) as HTMLAnchorElement;
  document.body.append(a); a.click(); a.remove();
}

dashboard();
