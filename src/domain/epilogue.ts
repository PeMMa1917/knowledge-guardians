/**
 * Afterwards: the epilogue (the 150-elements list: "where are they now" vignettes, choice-driven
 * ending variations, a full-circle mirror scene, a lingering thought). It opens in the Journal once
 * the Council ending is chosen (`ending.council`). Every line comes from a real flag, so two players
 * read two different epilogues. Fictional people and places only. Pure data, no DOM.
 */
import type { CampaignState, Condition } from './types';
import { check } from './rules';
import { crossingStyle } from './crossings';

export interface Vignette { who: string; if: Condition; text: string }

const f = (flag: string, value: string): Condition => ({ flag, eq: value });

export const VIGNETTES: Vignette[] = [
  // The Council ending.
  { who: 'The Nexus', if: f('ending.council', 'correct'), text: "The Harrowmere label hangs in the entrance hall now, corrected, with both signatures on it: the old one, and yours. School groups stop and read it. Some of them ask who cut the caveat. The guides say: 'We do not fully know. Here is what we do know.'" },
  { who: 'The Nexus', if: f('ending.council', 'recruit'), text: 'Vesper teaches a class on Thursdays: "How to sell certainty, and why you should not." It is always full. Vesper still wears one gold ring, and says it is to remember.' },
  { who: 'The Nexus', if: f('ending.council', 'expose'), text: "The Gilded Seal closed its stalls within a season. Some of its agents took honest work; some went quiet. Vesper left a letter on Elsbet's old desk. Nobody has opened it yet." },
  { who: 'The Nexus', if: f('ending.council', 'both'), text: 'The corrected label hangs by the door, and Vesper checks new labels in the room next to it. They argue every day, Ise says, and every label is better for it.' },
  { who: 'Lia Vann', if: { all: [f('postgame.edition', 'public'), { flagSet: 'postgame.closed' }] }, text: 'Lia leaves the pen on the new bench. People bring the dates their own families remember. She marks the source of each one before it goes near the main label.' },
  { who: 'Lia Vann', if: { all: [f('postgame.edition', 'loan'), { flagSet: 'postgame.closed' }] }, text: 'Lia and an apprentice share the loan visits now. They point out the place where a visitor can leave a new lead without leaving their name.' },
  // Ise.
  { who: 'Warden Ise', if: f('ise.harrowmere', 'herself'), text: 'Ise went to Harrowmere herself, alone, and stood in the town square, and told them. She came back older and lighter. She says the name Elsbet first now.' },
  { who: 'Warden Ise', if: f('ise.harrowmere', 'open'), text: 'Ise signs her labels with a new line under her name: "Last checked by". She leaves a space after it for the next person.' },
  { who: 'Warden Ise', if: f('ise.harrowmere', 'quiet'), text: "Ise kept the secret, as you agreed. Most days it holds. Some evenings she stands in front of the corrected labels and does not say why." },
  // Companions (loyalty choices).
  { who: 'Sefa', if: f('loyalty.sefa', 'old'), text: 'Sefa still sings the old verse at the memorial. Afterwards, every year, she walks to the ferry and tells Tova the other story, to her face.' },
  { who: 'Sefa', if: f('loyalty.sefa', 'ledger'), text: 'Sefa sings the sixth step and the boats. The first year it hurt. The third year, a guild child sang it with her.' },
  { who: 'Sefa', if: f('loyalty.sefa', 'both'), text: "Sefa's flood song has two verses now. Children in Emberford learn both, and argue about which one is better." },
  { who: 'Kip', if: { flagSet: 'loyalty.kip' }, text: "Kip finished one question, all the way to the end, and wrote it up. It was about the river map. The second question took a month. Kip says the third will take a year, and is delighted." },
  { who: 'Hesper', if: f('loyalty.hesper', 'sign'), text: 'The forge sign says: "The salt quench of Imre and the Lyles." Buyers ask about Imre. Hesper tells them. She has started to enjoy it.' },
  { who: 'Hesper', if: f('loyalty.hesper', 'private'), text: "Every Lyle apprentice learns Imre's name on their first day. The sign stays the same. Hesper looks at it sometimes." },
  { who: 'Hesper', if: f('loyalty.hesper', 'find'), text: "A letter came back from the east: Imre's granddaughter. She is coming to Emberford in spring. Hesper has cleaned the forge twice." },
  { who: 'Rook', if: { flagSet: 'loyalty.rook' }, text: 'Rook went back to every well they ever stamped. Eleven so far. At each one, they test in the dry month and post the result, with their own name.' },
  { who: 'Rook', if: { all: [{ flag: 'rook.joined', eq: true }, { not: { flagSet: 'loyalty.rook' } }] }, text: 'Rook still carries the old Seal stamp in a pocket. They have not decided what to do with it. They have stopped using it.' },
  // Places and small faces (chapter choices and crossings).
  { who: 'Hollis', if: { flagSet: 'cross.lamb' }, text: 'Hollis keeps a little notebook of flood-post readings now, twice a day. The lamb is a sheep. It still stands on stones.' },
  { who: 'The Emberford forge', if: f('cross.repair-queue', 'paired'), text: 'The apprentices take turns at the pickup hatch now. When the rain blurs a number, a customer can still feel the edge of a ticket.' },
  { who: 'The Tide Engine', if: f('cross.tide-engine', 'reset'), text: "Teodor checks the tide engine against the steps every Monday. He has painted 'CHECK ME' on its brass case." },
  { who: 'Brindle', if: f('cross.furnace', 'tin'), text: 'Brindle keeps a sliver of tin by the furnace door, and teaches every new stoker the trick. Brindle tells it as if it were Brindle\'s own idea. You allow this.' },
  { who: 'The Press', if: f('cross.crowd', 'ledger'), text: 'The lending ledger is read aloud every week now, on the press steps. Osk comes every time, to check.' },
  { who: 'Printer Lark', if: f('copies.margin.sent', 'fold'), text: 'There is a place on the landing ramp for a whole sheet now. The far stalls have asked for a full-size board of their own.' },
  { who: 'Printer Lark', if: f('copies.margin.sent', 'pair'), text: 'The landing runners still carry two matched strips. One is on a string now, after a wet afternoon and a long discussion about clips.' },
  { who: 'Printer Lark', if: f('copies.margin.sent', 'wait'), text: 'The ramp crew has a spare caller on print days. The caller keeps the signed order under a stone where anyone can read it.' },
  { who: 'Linnet', if: f('cross.drowned-bell', 'listen'), text: 'The iron posts on the old pier have a little sign: "The Bell. Listen before storms." Pippa still says it is a fish.' },
  { who: 'Cassia', if: f('cross.name-box', 'rule'), text: 'The gate machine has one long box for a name now. Cassia Doran Vey sent a postcard, signed in full, with a very large flourish.' },
  { who: 'Nan and Bellwether', if: { flagSet: 'cross.two-elders' }, text: 'Nan and Bellwether lead the lantern walk together. They still argue about the year. It is their favourite thing.' },
  { who: 'The Lamp Quay', if: f('cross.last-lamp', 'quay'), text: 'Three people take turns at Wren’s bench now. Each takes one turn a week and hands the coat to the next. The slate still shows how many people sat down, with room for another tally.' },
  { who: 'The Lamp Quay', if: f('cross.last-lamp', 'room'), text: 'The promise lamp stands just inside the Listening Room. A carrier who took the longer walk now helps set out the arrow before the reading turn.' },
  { who: 'The Lamp Quay', if: f('cross.last-lamp', 'defer'), text: 'The morning keeper sets a second cup beside the lamp. A visitor who came after closing is often the first through the door now.' },
  { who: 'The Council crew', if: f('council.team.edition', 'table'), text: 'People set their bundles down beside the low board. Hale clips a fresh signed time under the heading for each open hearing. Sefa reads both lines when the bench fills.' },
  { who: 'The Council crew', if: f('council.team.edition', 'relay'), text: 'An apprentice takes Kip’s turn at the far bench. Kip stays until the apprentice can say both lines back from that side of the passage. The next crew keeps two places on the rota.' },
  { who: 'The Island', if: f('cross.launch', 'test'), text: "The island's harbour board has two columns now: 'Gulls' and 'Model'. When they disagree, the boats stay in, and both groups compare notes." },
  { who: 'Ottilie', if: f('cross.patron', 'keeper'), text: "The Lady's shrine in the market has its stone scales back, and nothing else on it. Ottilie dusts it every morning, and checks the town standard weight every evening." },
];

/** "Where are they now": every vignette whose flag is set. */
export const vignettesFor = (s: CampaignState): Vignette[] => VIGNETTES.filter((v) => check(v.if, s));

/** Why the player came (the first Ise question, flag `why.came`), and what they found. */
export const WHY: Record<string, { said: string; found: string }> = {
  curious: { said: 'You came to find out how people know things.', found: 'You found out that knowing is something people do together, and keep doing.' },
  friend: { said: 'You came because someone you trusted told you to.', found: 'You found out that trust is strongest when it can be checked.' },
  duty: { said: 'You came because somebody had to keep the records honest.', found: 'You found out that honesty includes saying what you do not know.' },
  repair: { said: 'You came because you once believed something false, and it cost someone.', found: 'You found out that a mistake owned in the open can be the start of trust, not the end of it.' },
};

/** The mirror scene: the first label and the last. */
export function mirror(s: CampaignState): string {
  const firstDay = 'On your first day, you wrote a new label with a borrowed pen at the low bench in the Nexus.';
  if (s.flags['postgame.closed']) return `${firstDay} You came back and left that pen and a trail for the next keeper. Someone had already followed it when you left.`;
  return `${firstDay} The pen is back beside the first label stand.`;
}

/** How you met the crossings: the reputation you earned without trying. */
export function crossingEpithet(flags: Record<string, unknown>): string | null {
  const k = crossingStyle(flags);
  const n = k.overcome + k.around + k.ignore;
  if (n < 3) return null;
  if (k.overcome >= k.around && k.overcome >= k.ignore) return 'who Faces Things';
  if (k.around >= k.ignore) return 'of the Long Way Round';
  return 'who Lets the World Turn';
}

/** The lingering thought: the last words, built from why the player came. */
export function lingering(s: CampaignState): string[] {
  const w = WHY[String(s.flags['why.came'])];
  return [
    ...(w ? [w.said, w.found] : []),
    'Somewhere, a label is a little too sure of itself. Somewhere, a person is about to believe it.',
    'How sure must we be before we tell other people? You still do not have one answer. You have a way of asking.',
  ];
}
