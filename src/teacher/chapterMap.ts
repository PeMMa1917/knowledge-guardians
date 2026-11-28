import { AOK_NAMES, CONCEPT_NAMES, SUBJECTS } from '../domain/curriculum';
import { BLOOM, FINK, FRAMEWORK, SOLO } from '../domain/learningLevels';
import type { TeacherContent } from './content';
import { h } from '../ui/dom';

export interface ChapterFilters {
  chapter: string;
  concept: string;
  area: string;
  framework: string;
  subject: string;
  dok: string;
  bloom: string;
  fink: string;
  solo: string;
}
const blank = (): ChapterFilters => ({
  chapter: '',
  concept: '',
  area: '',
  framework: '',
  subject: '',
  dok: '',
  bloom: '',
  fink: '',
  solo: '',
});
const words = (v: string) => v.replace(/-/g, ' ');
const term = (k: string) =>
  (
    ({
      'methods-and-tools': 'Methods and tools',
      human: 'Human dimension',
      foundational: 'Foundational knowledge',
      extended: 'Extended abstract',
      'learning-to-learn': 'Learning how to learn',
    }) as Record<string, string>
  )[k] ?? words(k);
const format = (names: readonly string[]) => names.map(term).join(', ');
export function matchingWork(pack: TeacherContent, f: ChapterFilters) {
  return pack.missions.flatMap((m) => {
    if (f.chapter && String(m.chapter) !== f.chapter) return [];
    return m.objectives.flatMap((o) => {
      const w = o.weave;
      if (!w) return [];
      const tags = pack.strands[w.strand],
        t = tags.thinking;
      if (f.concept && !w.concepts.some((c) => c === f.concept)) return [];
      if (f.area && !w.aoks?.some((a) => a === f.area)) return [];
      if (f.framework && !tags.framework?.some((k) => k === f.framework)) return [];
      if (f.subject && !tags.subjects?.includes(f.subject)) return [];
      if (f.dok && String(t?.dok) !== f.dok) return [];
      if (
        (f.bloom && t?.bloom !== f.bloom) ||
        (f.fink && t?.fink !== f.fink) ||
        (f.solo && t?.solo !== f.solo)
      )
        return [];
      return [
        {
          id: o.id,
          chapter: m.chapter,
          mission: m.title,
          title: o.title,
          question: m.knowledgeQuestion,
          weave: w,
          tags,
        },
      ];
    });
  });
}
export function chapterMap(pack: TeacherContent) {
  const controls = h('form', { class: 'plan-filters no-print', 'aria-label': 'Filter the chapter map' });
  const guides = h('section', { class: 'panel' }),
    status = h('p', { role: 'status' }),
    list = h('ol', { class: 'plan-results' });
  const more = h('button', { type: 'button', class: 'no-print' }, 'Show more activities');
  const filters = blank(),
    fields = new Map<keyof ChapterFilters, HTMLSelectElement>();
  let limit = 12;
  const select = (field: keyof ChapterFilters, label: string, values: [string, string][]) => {
    const pick = h(
      'select',
      { name: field },
      h('option', { value: '' }, 'All'),
      ...values.map(([id, name]) => h('option', { value: id }, name)),
    );
    fields.set(field, pick);
    pick.addEventListener('change', () => {
      filters[field] = pick.value;
      limit = 12;
      draw();
    });
    controls.append(h('label', {}, label, pick));
  };
  const menu = (ids: readonly string[]): [string, string][] => ids.map((k) => [k, term(k)]);
  select(
    'chapter',
    'Chapter',
    Array.from({ length: 15 }, (_, i) => [String(i + 1), 'Chapter ' + (i + 1)]),
  );
  select('concept', 'TOK concept', Object.entries(CONCEPT_NAMES));
  select('area', 'Area or theme', Object.entries(AOK_NAMES));
  select('framework', 'Framework', menu(FRAMEWORK));
  select(
    'subject',
    'DP subject',
    Object.entries(SUBJECTS).map(([id, v]) => [id, v.name]),
  );
  select('dok', 'Depth of knowledge', menu(['1', '2', '3', '4']));
  select('bloom', 'Bloom', menu(BLOOM));
  select('fink', 'Fink', menu(FINK));
  select('solo', 'SOLO', menu(SOLO));
  const reset = h(
    'button',
    {
      type: 'button',
      onclick: () => {
        Object.assign(filters, blank());
        fields.forEach((el) => (el.value = ''));
        limit = 12;
        draw();
        fields.get('chapter')!.focus();
      },
    },
    'Clear filters',
  );
  const print = h('button', { type: 'button', onclick: () => window.print() }, 'Print this view');
  controls.append(h('div', { class: 'row' }, reset, print));
  controls.onsubmit = (e) => e.preventDefault();
  const active = h('p', { class: 'print-filters' });
  const visits = new Map(pack.returnVisits.map((r) => [r.objective, r]));
  function draw() {
    const rows = matchingWork(pack, filters);
    const path = rows.filter((r) => visits.has(r.id));
    guides.replaceChildren(h('h2', {}, 'What changes through play'));
    for (const row of path) {
      const v = visits.get(row.id)!;
      guides.append(
        h(
          'article',
          { class: 'plan-visit' },
          h('h3', {}, 'Chapter ' + row.chapter + ' · ' + v.stop),
          h('p', {}, v.start),
          h('p', {}, v.change),
          h('p', {}, h('strong', {}, 'Invite a discussion. '), v.question),
        ),
      );
    }
    guides.hidden = !path.length;
    const applied = [...fields]
      .filter(([k]) => filters[k])
      .map(([, el]) => el.selectedOptions[0].textContent);
    active.textContent = applied.length
      ? 'Selected for this view · ' + applied.join(' · ')
      : 'All chapters and learning tags';
    status.textContent = rows.length
      ? rows.length + ' matching activities. Showing ' + Math.min(limit, rows.length) + '.'
      : 'No activity has this combination of recorded tags. Change or clear a filter.';
    list.replaceChildren(
      ...rows.slice(0, limit).map((r) => {
        const t = r.tags.thinking;
        return h(
          'li',
          {},
          h('h3', {}, r.title),
          h('p', { class: 'note' }, 'Chapter ' + r.chapter + ' · ' + r.mission),
          h('p', {}, r.question),
          h(
            'p',
            { class: 'note' },
            [
              r.weave.concepts.map((c) => CONCEPT_NAMES[c]).join(', '),
              r.weave.aoks?.map((a) => AOK_NAMES[a]).join(', '),
              format(r.tags.framework ?? []),
              r.tags.subjects?.map((id) => SUBJECTS[id]?.name ?? id).join(', '),
              t &&
                [
                  'DOK ' + t.dok,
                  'Bloom · ' + term(t.bloom),
                  'Fink · ' + term(t.fink),
                  'SOLO · ' + term(t.solo),
                ].join(' / '),
            ]
              .filter(Boolean)
              .join(' · '),
          ),
        );
      }),
    );
    more.hidden = rows.length <= limit;
  }
  more.addEventListener('click', () => {
    const next = limit;
    limit += 12;
    draw();
    const first = list.children[next] as HTMLElement | undefined;
    if (first) {
      first.tabIndex = -1;
      first.focus();
    }
  });
  draw();
  return h(
    'main',
    {},
    h(
      'header',
      {},
      h('a', { class: 'no-print', href: './teacher.html' }, 'Teacher dashboard'),
      h('h1', {}, 'Chapter map'),
      h(
        'p',
        {},
        'Choose a chapter or combine filters to find a particular decision, investigation or conversation. The tags describe the activity a player can try.',
      ),
    ),
    controls,
    active,
    guides,
    h('section', { class: 'panel' }, h('h2', {}, 'Activities'), status, list, more),
  );
}
