/**
 * Letters from Vesper Quill, the rival (spec 15.10; docs/STORY_BIBLE.md section 6). One letter arrives
 * after each chapter. Each letter remembers one explicit choice (a flag or objective) and answers it,
 * makes one fair point (where Vesper is right), and plants a clue for the long mystery (Harrowmere).
 * Vesper is charming, polite and funny, and sad under the charm. Fictional; no real person or group.
 * Pure rules: `dueLetters` says which letters can arrive; `composeLetter` picks the remembered line.
 */
import { check } from './rules';
import type { CampaignState, Condition } from './types';

export interface Remember { if: Condition; text: string }
export interface Letter {
  id: string;
  chapter: number;
  /** When the letter can arrive (usually the chapter's last objective). */
  when: Condition;
  opening: string;
  /** The first matching line is used; the last one should have no condition (a fallback). */
  remembers: { if?: Condition; text: string }[];
  /** Where Vesper is right. The player must answer it, not only defeat it. */
  fair: string;
  /** A clue for the long mystery, or a hook. */
  hook: string;
}

const obj = (id: string): Condition => ({ objective: id });
const corvan = (v: string): Condition => ({ flag: 'sd.corvan.outcome', eq: v });

export const LETTERS: Letter[] = [
  { id: 'l01', chapter: 1, when: { flagSet: 'sd.corvan.outcome' },
    opening: 'Dear new Guardian, congratulations on your first public argument. I watched from the back of the crowd. You did not see me. Nobody does, at first.',
    remembers: [
      { if: corvan('exposed'), text: 'You exposed poor Corvan in front of the whole market. Clean work. But he paid good money for a little gold stamp on that sign, and now he has neither the stamp nor his pride. Where will he go next, do you think?' },
      { if: corvan('won-over'), text: 'You won Corvan over. Charming. He wrote to me to ask for his money back. I sent it. I am not a monster; I am a merchant.' },
      { if: corvan('lost-ground'), text: 'The crowd stayed with Corvan. Do not be sad. People want an answer they can hold, and he gave them one. You gave them a question. Questions are heavy.' },
      { text: 'You left Corvan with a smaller claim and a red face. The market will forget the claim and remember the face.' },
    ],
    fair: 'Here is my small point. The baker cannot wait ten years for your lamps. She must buy flour on Thursday. Who helps her decide by Thursday?',
    hook: 'Ask Warden Ise who else trained in that hall with Elsbet. Ise will straighten a label that is already straight. Yours, with real respect, V. Q.' },
  { id: 'l02', chapter: 2, when: obj('nile.dispatch'),
    opening: 'Dear Guardian, so the door with no name opened for you. It opened for me once.',
    remembers: [
      { if: obj('nile.dispatch-pair'), text: 'You sent the two records as a pair. Careful. Most visitors will read the first one and walk on.' },
      { if: obj('nile.dispatch-print'), text: 'You sent a printed copy with its limit stated. Good. Now count how many readers read the limit.' },
      { text: 'Your dispatch was honest. Honest and slow. The Nexus likes slow.' },
    ],
    fair: 'Look at the old label on the public case, the one the Nexus wrote before you came. It says more than its records. I did not stamp that one. Your Nexus did.',
    hook: 'There is a line scraped away under one old label in that archive. Someone did not want it read. V. Q.' },
  { id: 'l03', chapter: 3, when: obj('preserved.publish'),
    opening: 'Dear Guardian, one of my agents met you in the Cold Store. She says you were polite. That is rarer than you think.',
    remembers: [{ text: 'You would not let her stamp the heading "complete". So a family must live with a file that has a hole in it. Holes are honest. They are also cold.' }],
    fair: 'A gap you show is better than a gap you hide. I agree. But a family asked you a simple question, and you gave them a careful one back.',
    hook: 'My agent will remember you. So will the family. V. Q.' },
  { id: 'l04', chapter: 4, when: obj('coast.dispatch'),
    opening: 'Dear Guardian, the bell rang, and the harbour moved. Well done. Truly.',
    remembers: [
      { if: obj('coast.dispatch.signal'), text: 'You sent the notice by signal: fast, but a signal cannot carry a "maybe".' },
      { if: obj('coast.dispatch.runner'), text: 'You sent a runner: slower, but a person can answer questions. Your runner was out of breath, and still kinder than a flag.' },
      { text: 'Your notice went out with its uncertainty. Good. Did the fishers read it as "go" or as "perhaps"?' },
    ],
    fair: 'People need "yes" or "no", not a percentage. You may say that is wrong. Then tell me how a fisher in a storm should read your percentage.',
    hook: 'Correct quietly, as someone we both know likes to say. V. Q.' },
  { id: 'l05', chapter: 5, when: obj('forest.finish'),
    opening: 'Dear Guardian, the birds are crossing again, I hear.',
    remembers: [{ text: 'You corrected your first forest notice in public. Most Guardians would rather lose a finger. I mean it as praise.' }],
    fair: 'Your first briefing was too sure. I said so to the bridge crews before you did. Sometimes I am the one who checks.',
    hook: 'Ask yourself why the Nexus finds it so hard to say "we were wrong". V. Q.' },
  { id: 'l06', chapter: 6, when: obj('metal.finish'),
    opening: 'Dear Guardian, my stamped ingots did not impress you. They impressed the buyers, for a week.',
    remembers: [{ text: 'You would not name a metal from its weight alone. Very proper. The winch maker wanted a name, not a lesson.' }],
    fair: 'A week of trust can feed a family for a week. Your care feeds them later. Later is a luxury.',
    hook: "Hesper's family technique has a story. Ask her where it came from, gently. V. Q." },
  { id: 'l07', chapter: 7, when: obj('copies.publish'),
    opening: 'Dear Guardian, the presses in the City of Copies print my seal now. Do not be cross. They asked.',
    remembers: [{ text: 'You chased two missing lines through every copy. I counted: you were right about both. Copies are how a careful claim becomes a careless one.' }],
    fair: 'Every reprint drops a little care. Mine drop it on purpose. Yours drop it by accident. Which is worse for the reader?',
    hook: 'Ask the old printers about the time the Nexus dropped a caveat. They tell it as a joke. It was not one. V. Q.' },
  { id: 'l08', chapter: 8, when: obj('sea.finish'),
    opening: 'Dear Guardian, I sell complete charts. You sell charts with blanks. Guess which sell.',
    remembers: [{ text: 'You marked the blank on the chart. A skiff will slow down there, and a skipper will curse you, and live.' }],
    fair: 'The local names were there before any survey. You listened to them. The Nexus did not, once.',
    hook: 'I will be at the House of Performance. Come and argue with me in front of people. It is more fun. V. Q.' },
  { id: 'l09', chapter: 9, when: obj('stage.finish'),
    opening: 'Dear Guardian, you won. The audience was with you. I bowed. Did you notice that I bowed?',
    remembers: [{ text: 'You made them ask what they could see from their own seat. It was a good argument. I lost it fairly.' }],
    fair: 'But you only beat a claim. You did not answer my question: who helps people decide on Thursday?',
    hook: 'Since you like sources: ask Ise about Harrowmere. Ask her what the weir label said. V. Q.' },
  { id: 'l10', chapter: 10, when: obj('market.finish'),
    opening: 'Dear Guardian, I hear Rook Tamsin left my company and walks with you now. Look after Rook. Rook is harder than glass and breaks the same way.',
    remembers: [
      { if: obj('market.publish.window'), text: 'You put the price comparison in the window, where households could see it. My agents could not sell a weighed-in basket on that street for a month.' },
      { if: obj('market.publish.desk'), text: 'You left the records at the trade desk. Safe, checkable, and read by clerks. The households still buy by the basket.' },
      { text: 'You took the basket out of the weight. Small thing. Big thing.' },
    ],
    fair: 'Rook will tell you that my first customer wore your badge. Rook is right.',
    hook: 'The Water Commons is next for you. Read the old orders by the weir. Read the signatures. V. Q.' },
  { id: 'l11', chapter: 11, when: obj('water.finish'),
    opening: 'Dear Guardian. Now you know.',
    remembers: [{ text: 'Harrowmere had a weir. The Nexus put up a label: "safe in all floods". The surveyor wrote "tested only in a dry year". That line was cut. Ise signed the label. The weir did not hold. My house was by the weir.' }],
    fair: 'I did not leave because I stopped believing in checking. I left because the Nexus would not check itself.',
    hook: 'Ise will ask you to keep this quiet. Elsbet was asked the same thing. You know what Elsbet did. V. Q.' },
  { id: 'l12', chapter: 12, when: obj('civic.finish'),
    opening: 'Dear Guardian, a machine that sends a library to some streets and not others. A rule that is sure and blind. Does it remind you of anyone?',
    remembers: [
      { if: obj('civic.publish.even'), text: 'You chose the even rule. Same for every street, so nobody can complain. Except the streets that needed more.' },
      { if: obj('civic.publish.reserve'), text: 'You kept a reserve window for the street the rule forgot. That is what Harrowmere needed: a window for the case nobody tested.' },
      { text: 'You changed the rule in the open. I wish the Nexus had changed its label that way.' },
    ],
    fair: 'Rules make people feel safe. I never said that was bad. I only said it is not the same as being safe.',
    hook: "Elsbet's voice is in the Archive of Voices. She recorded it for you, not for me. Go and listen. V. Q." },
  { id: 'l13', chapter: 13, when: obj('voices.finish'),
    opening: "Dear Guardian, you heard her. I listened to the same recording when it was new. She sounded younger.",
    remembers: [{ text: "Elsbet said: 'Vesper is right about the harm, and wrong about the cure.' I have been angry with that sentence for ten years." }],
    fair: 'She also said the Nexus owes Harrowmere more than a quiet correction. Did you hear that part, or did the record stop?',
    hook: 'On the Island of Models, I need your help. That is a strange letter to write. V. Q.' },
  { id: 'l14', chapter: 14, when: obj('island.finish'),
    opening: 'Dear Guardian, we made one plan together, and the crates arrived. I did not stamp it. You did not caveat it to death.',
    remembers: [
      { if: obj('island.publish.ferry'), text: 'You trusted the ferry route. So did I, in the end.' },
      { text: 'Your plan showed its trade-off on the sheet. The islanders argued about it, and then used it.' },
    ],
    fair: 'Perhaps certainty and care are not enemies. Perhaps they need a third thing: people who come to check.',
    hook: 'I will come to the Council of Inquiry. Bring the little brass lamp from the Undercroft. Elsbet left it for a reason. V. Q.' },
  { id: 'l15', chapter: 15, when: obj('council.finish'),
    opening: 'Dear Guardian, it is done, one way or another.',
    remembers: [{ text: 'Whatever you chose at the Council, you chose it with the scraped line in your hand. Nobody can say you did not know.' }],
    fair: 'I still think people need an answer by Thursday. Now I think they also need a lamp, and someone who comes to check it.',
    hook: 'There is one more door at the end of the corridor. I never opened it. Last checked by: you. V. Q.' },
];

/** Letters that may arrive now and have not arrived yet. */
export function dueLetters(s: CampaignState): Letter[] {
  return LETTERS.filter((l) => s.flags[`letter.${l.id}`] !== true && check(l.when, s));
}

/** The paragraphs of a letter for this player, with the first remembered line that fits. */
export function composeLetter(l: Letter, s: CampaignState): string[] {
  const line = l.remembers.find((r) => !r.if || check(r.if, s));
  return [l.opening, line ? line.text : '', l.fair, l.hook].filter(Boolean);
}

export const arrivedLetters = (s: CampaignState): Letter[] => LETTERS.filter((l) => s.flags[`letter.${l.id}`] === true);
