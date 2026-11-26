/**
 * Photo album caption check (spec 47.4 "photography and field-guide scrapbooks").
 * After a picture, the player sorts caption lines: "The photo shows this" or
 * "I think this (it is not in the photo)". Lines come from what was in the frame,
 * so every "shows" line is true of the picture. Pure rules, no DOM.
 */
export interface PhotoSubject { kind: 'person' | 'object' | 'loreling'; id: string; name: string }
export interface CaptionLine { id: string; text: string; kind: 'shows' | 'thinks'; why: string }

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const THINK = {
  person: ['{n} is waiting for someone.', '{n} is happy today.', '{n} is the most important person here.'],
  object: ['{n} is very old.', '{n} is worth a lot of money.', 'Someone put {n} here on purpose.'],
  loreling: ['{n} is posing for the camera.'],
};
const WHY = {
  person: 'A photo shows where someone stands and how they look. It does not show thoughts, feelings or rank. You would need to ask, or find other evidence.',
  object: 'Age, value and reasons are not in a picture. They need other evidence, such as a record or a test.',
  loreling: 'The photo shows where it is, not why it is there.',
};

/** Up to three subjects, each with one "shows" line and one "thinks" line. `seed` keeps the choice stable. */
export function captionLines(subjects: PhotoSubject[], seed: number): CaptionLine[] {
  const pick = [...subjects].sort((a, b) => (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind.localeCompare(b.kind))).slice(0, 3);
  if (!pick.length) {
    return [
      { id: 'empty.shows', text: 'The picture shows a floor and walls, with no people in it.', kind: 'shows', why: 'You can check this by looking at the picture.' },
      { id: 'empty.thinks', text: 'Nobody ever comes to this place.', kind: 'thinks', why: 'One picture is one moment. It cannot show what happens at other times.' },
    ];
  }
  const lines: CaptionLine[] = [];
  pick.forEach((sb, i) => {
    const n = sb.kind === 'loreling' ? `the ${sb.name}` : sb.name;
    lines.push({ id: `${sb.id}.shows`, text: `${cap(n)} ${sb.kind === 'person' ? 'is' : 'can be seen'} in the picture.`, kind: 'shows', why: `You can point to ${n} in the photo.` });
    const t = THINK[sb.kind];
    lines.push({ id: `${sb.id}.thinks`, text: cap(t[(seed + i) % t.length].replace('{n}', n)), kind: 'thinks', why: WHY[sb.kind] });
  });
  // Mix the order so the answers do not alternate.
  return lines.sort((a, b) => ((a.id.length * 31 + seed) % 7) - ((b.id.length * 31 + seed) % 7) || a.id.localeCompare(b.id));
}

export function checkLine(line: CaptionLine, answer: 'shows' | 'thinks'): { ok: boolean; text: string } {
  const ok = line.kind === answer;
  return { ok, text: ok ? (line.kind === 'shows' ? 'Yes: anyone can check this by looking.' : 'Yes: that is what someone might think, not what the photo shows.') + ' ' + line.why : line.why };
}
