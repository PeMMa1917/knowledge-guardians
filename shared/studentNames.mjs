import { confusables } from './nameConfusables.mjs';

const lookalikes = new Map();
for (const [latin, letters] of Object.entries(confusables))
  for (const letter of letters) lookalikes.set(letter, latin);

const digits = ['o', 'i', 'z', 'e', 'a', 's', 'g', 't', 'b', 'g'];
function foldDigit(c) {
  let start = c.codePointAt(0);
  const code = start;
  while (start > 0 && /\p{Nd}/u.test(String.fromCodePoint(start - 1))) start--;
  return digits[(code - start) % 10];
}

const fold = (s) => s.normalize('NFKD').toLowerCase().replaceAll('ß', 'ss').replace(/\p{M}/gu, '');
function skeleton(s, latin) {
  return Array.from(fold(s), (c) => {
    if (/\p{Nd}/u.test(c)) return foldDigit(c);
    if (c === '@') return 'a';
    if (c === '$') return 's';
    if (c === '!') return 'i';
    return latin ? (lookalikes.get(c) ?? c) : c;
  }).join('');
}

// Exact tokens avoid blocking ordinary names that contain short ambiguous words.
const tokens =
  'bitch bastard cunt dick cock pussy twat prick slut whore ass shit piss mierda puta puto pute salope merde scheisse fotze vaffanculo stronzo porra caralho kurwa сука блядь хуй пизда'.split(
    ' ',
  );
const strong =
  'fuck motherfucker asshole bullshit shithead dickhead cocksucker nigger faggot heilhitler killall'.split(
    ' ',
  );
const compact = (s) => s.replace(/[^\p{L}\p{N}]/gu, '');
const squash = (s) => s.replace(/(.)\1+/gu, '$1');
const altShapes = new Map(
  Object.entries({
    ғ: 'f',
    ƒ: 'f',
    ӄ: 'k',
    ӏ: 'l',
    1: 'l',
    ı: 'i',
    ш: 'w',
    υ: 'u',
    і: 'i',
    ι: 'i',
    н: 'h',
    η: 'h',
    с: 'c',
  }),
);
function wordFilter(latin) {
  const wordSet = new Set(tokens.map((word) => squash(skeleton(word, latin))));
  const stems = strong.map((word) => squash(skeleton(word, latin)));
  return (value) => {
    const reading = skeleton(value, latin);
    const joined = squash(compact(reading));
    if (stems.some((stem) => joined.includes(stem)) || wordSet.has(joined)) return true;
    return reading.split(/[^\p{L}\p{N}]+/u).some((word) => wordSet.has(squash(word)));
  };
}
const nativeWord = wordFilter(false),
  lookalikeWord = wordFilter(true);

/** Comparison is separate from the spelling shown to a student. */
export function studentName(value, field = 'alias') {
  if (typeof value !== 'string' || value.length > 160) return null;
  // Preserve contextual joining in the displayed spelling. Check the letters on both sides together.
  const checkable = value
    .replace(/(?<=\p{Script=Arabic})\u200c(?=\p{Script=Arabic})/gu, '')
    .replace(/(?<=[\u094d\u09cd\u0a4d\u0acd\u0b4d\u0bcd\u0c4d\u0ccd\u0d4d])[\u200c\u200d](?=\p{L})/gu, '');
  if (/[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/u.test(checkable)) return null;
  const name = value
    .normalize('NFC')
    .trim()
    .replace(/\p{Zs}+/gu, ' ');
  const screening = checkable
    .normalize('NFC')
    .trim()
    .replace(/\p{Zs}+/gu, ' ');
  const length = Array.from(name).length;
  if (
    length < (field === 'alias' ? 2 : 1) ||
    length > (field === 'login' ? 40 : field === 'display' ? 64 : 24)
  )
    return null;
  if (!/^[\p{L}\p{N}][\p{L}\p{M}\p{N} _.'’-]*$/u.test(screening) || (field === 'login' && name.includes(' ')))
    return null;
  // Counters and separators are common around an otherwise standalone word.
  const withoutCounter = screening.replace(/^[\p{Nd} _.'’-]+|[\p{Nd} _.'’-]+$/gu, '');
  for (const form of new Set([screening, withoutCounter])) {
    const alternative = Array.from(fold(form), (c) => altShapes.get(c) ?? c).join('');
    if (nativeWord(form) || lookalikeWord(form) || nativeWord(alternative) || lookalikeWord(alternative))
      return null;
  }
  return field === 'login' ? name.toLowerCase().normalize('NFC') : name;
}

/** A comparison key for nicknames already displayed on the same class board. */
export function boardNameKey(approvedName) {
  return compact(skeleton(approvedName, true));
}
