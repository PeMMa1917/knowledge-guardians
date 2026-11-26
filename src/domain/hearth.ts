/**
 * Hearth talks (story bible 9 and 10; the 150-elements list: campfire breathers, companion banter,
 * constructive party friction, found family, tone choices). After a big step, the companions sit by
 * the hearth in the Nexus and talk to EACH OTHER: jokes, puns, a misunderstanding, a disagreement,
 * a doubt. The player can join in with a tone (joke, doubt, care or plain). The tone changes the
 * reply, not the plot: it lets the player say who they are. Flag `hearth.<id>` = the tone.
 * Kip has no set pronoun: write around it. Fictional people only. Pure data, no DOM.
 */
import type { Condition } from './types';

export type HearthTone = 'joke' | 'doubt' | 'care' | 'plain';
export interface HearthLine { who: string; text: string; if?: Condition }
export interface HearthTalk {
  id: string;
  title: string;
  /** When the talk is ready (after a big step). */
  after: Condition;
  /** What kind of moment it is, for the story bible audit. */
  kind: 'humour' | 'friction' | 'doubt' | 'misunderstanding' | 'farewell';
  lines: HearthLine[];
  join: { tone: HearthTone; text: string; reply: string }[];
}

export const TONE_LABEL: Record<HearthTone, string> = { joke: 'Make a joke', doubt: 'Ask a hard question', care: 'Say something kind', plain: 'Say it plainly' };

const ROOK: Condition = { flag: 'rook.joined', eq: true };

export const HEARTH: HearthTalk[] = [
  { id: 'essay', title: 'Assay, Essay', kind: 'misunderstanding', after: { num: 'lamps.lit', gte: 3 },
    lines: [
      { who: 'kip-arden', text: "Hesper says I have to do an essay on the spoon. A whole essay! On a spoon!" },
      { who: 'smith-hesper', text: 'An ASSAY. A test. You scratch the spoon and see what it is made of.' },
      { who: 'kip-arden', text: "Oh. Oh! ...Can I still write the essay? I have questions about the spoon." },
      { who: 'scholar-sefa', text: 'Kip will write three. With footnotes.' },
      { who: 'smith-hesper', text: 'Nobody writes an essay about a spoon.' },
      { who: 'kip-arden', text: 'Who made it? Who used it? Why is it bent? That is at least two essays.' },
    ],
    join: [
      { tone: 'joke', text: "'Sounds like the spoon is in for a stirring read.'", reply: "Hesper groans. Sefa laughs so hard she has to put her tea down. Kip writes 'stirring' in a notebook." },
      { tone: 'doubt', text: "'Wait. Are the test and the essay asking the same question?'", reply: "Hesper thinks. 'No. Mine asks what it is. Kip's asks what it meant.' Kip: 'So we need both.' Hesper: 'Fine. Both.'" },
      { tone: 'care', text: "'I mix words up all the time. It is how you find new ones.'", reply: "Kip looks relieved. 'Yes! That is exactly what I did. On purpose. Mostly.'" },
      { tone: 'plain', text: "'An assay tests what a thing is. An essay asks what it means.'", reply: "Hesper nods once. 'Good. Write that on the wall.' Kip does, in chalk, very large." },
    ] },
  { id: 'bridge', title: 'A Song Cannot Hold a Bridge', kind: 'friction', after: { objective: 'nile.dispatch' },
    lines: [
      { who: 'smith-hesper', text: "All that talk in the archive about whose story counts. A story cannot hold a bridge up." },
      { who: 'scholar-sefa', text: 'And a bridge cannot remember who built it. The song can.' },
      { who: 'smith-hesper', text: 'The bridge does not need to remember. It needs to stand.' },
      { who: 'scholar-sefa', text: 'Then why does every bridge in Emberford have a name?' },
      { who: 'smith-hesper', text: '...Because people like names.' },
      { who: 'scholar-sefa', text: 'Because people like to know. That is knowledge too, Hesper.' },
    ],
    join: [
      { tone: 'joke', text: "'You are both building bridges. Just to different banks.'", reply: "Sefa smiles. Hesper rolls her eyes, but she is smiling too. 'That is terrible. Keep it.'" },
      { tone: 'doubt', text: "'Can a story ever be wrong about a bridge in a way that matters?'", reply: "Sefa is quiet. 'Yes. If the song says the bridge is strong, and it is not.' Hesper: 'Then you need me.' Sefa: 'And you need me to tell people why.'" },
      { tone: 'care', text: "'You two argue like people who trust each other.'", reply: "They both look at you, then at each other. Hesper: 'Hm.' Sefa: 'They are right, you know.' Hesper: 'Hm.'" },
      { tone: 'plain', text: "'You need both: one to test the bridge, one to tell why it matters.'", reply: "Hesper: 'Fine.' Sefa: 'Fine.' They clink cups like two people who will have this argument again next week." },
    ] },
  { id: 'glow', title: 'What if I Am Wrong?', kind: 'doubt', after: { objective: 'coast.dispatch' },
    lines: [
      { who: 'lumen', text: 'I was so sure about the fairy photos. I glowed about them. I told everyone.' },
      { who: 'kip-arden', text: 'You also told everyone when you found out. That counts.' },
      { who: 'lumen', text: 'What if my next guess is wrong too? What if all my guesses are wrong?' },
      { who: 'smith-hesper', text: 'Then you will be the most tested guess-maker in the Nexus. I crack a blade a week. I still make blades.' },
      { who: 'scholar-sefa', text: "Glow a little less at first, little light. Glow more when it's checked." },
    ],
    join: [
      { tone: 'joke', text: "'Lumen, you are the brightest one here. Being wrong just means you are lighting up the gaps.'", reply: "Lumen flickers, and then does a small, slightly embarrassed loop. 'That is a very bad pun. Thank you.'" },
      { tone: 'doubt', text: "'How sure should a guide be, before it says something?'", reply: "Lumen thinks. 'Sure enough to help. Not so sure it stops you looking.' It glows a steady, smaller light." },
      { tone: 'care', text: "'I trust you more now than before. You showed me how you check.'", reply: "Lumen's light goes warm amber, the lamp colour. It does not say anything for a while." },
      { tone: 'plain', text: "'From now on, say \"my guess\" or \"from the record\". Then we always know.'", reply: "'My guess: that will help,' Lumen says, and then giggles at itself." },
    ] },
  { id: 'unfinished', title: 'Half a Question', kind: 'doubt', after: { objective: 'forest.finish' },
    lines: [
      { who: 'kip-arden', text: "Can I ask something? Do people think I never finish anything?" },
      { who: 'smith-hesper', text: 'Yes.' },
      { who: 'scholar-sefa', text: 'Hesper!' },
      { who: 'smith-hesper', text: "What? Kip asked. Kip, you start ten questions and finish two. But your two are better than most people's ten." },
      { who: 'kip-arden', text: "...That is the nicest mean thing anyone has said to me." },
    ],
    join: [
      { tone: 'joke', text: "'You finish questions. You just finish them in the next chapter.'", reply: "Kip laughs. 'A cliffhanger person! I like that. I am keeping that.'" },
      { tone: 'doubt', text: "'Which questions do you drop? The hard ones, or the boring ones?'", reply: "Kip goes quiet. 'The ones where the answer might be no.' Sefa puts a hand on Kip's shoulder." },
      { tone: 'care', text: "'Your questions got us through the forest. I noticed.'", reply: "Kip sits up straighter. 'You did? Which one? No, wait. I will finish this conversation first.'" },
      { tone: 'plain', text: "'Write each question down. Tick it when you finish it.'", reply: "Kip fetches a notebook at once. By morning it has forty questions and three ticks. It is a start." },
    ] },
  { id: 'puns', title: 'Pun Night', kind: 'humour', after: { objective: 'copies.publish' },
    lines: [
      { who: 'scholar-sefa', text: "In Emberford, after a long job, we tell riddles. Who has one?" },
      { who: 'kip-arden', text: "Why did the archivist never trust the stairs? They were always up to something." },
      { who: 'lumen', text: "Why do Guardians make terrible liars? They keep citing their sources!" },
      { who: 'smith-hesper', text: "I have one. What do you call a forged blade? A real piece of work." },
      { who: 'scholar-sefa', text: "Mine is old. What gets bigger every time it is told, and smaller every time it is checked?" },
      { who: 'kip-arden', text: "...A rumour! Oh, that is good. That is also TOK." },
    ],
    join: [
      { tone: 'joke', text: "'Why did the copy go to the original? It needed to find itself.'", reply: "A long silence. Then Hesper laughs first, which nobody expected. Sefa writes it down for next year." },
      { tone: 'doubt', text: "'Is a pun a kind of ambiguity? Two meanings, one word?'", reply: "Kip gasps. 'Every pun is a tiny translation problem!' Hesper: 'Do not ruin pun night.'" },
      { tone: 'care', text: "'This is the best night I have had in the Nexus.'", reply: "Sefa hums the town theme, softly. Nobody says anything clever for a while. That is fine." },
      { tone: 'plain', text: "'I do not get Hesper's one.'", reply: "Hesper explains it. Slowly. With a diagram. By the end it is the funniest thing anyone has heard." },
    ] },
  { id: 'source', title: 'Source, or Story?', kind: 'friction', after: { flag: 'rook.joined', eq: true },
    lines: [
      { who: 'rook-tamsin', text: "So the singer is the one who trusts stories. Source for your songs?", if: ROOK },
      { who: 'scholar-sefa', text: 'My grandmother. And hers. And the people who were there.' },
      { who: 'rook-tamsin', text: "So: hearsay, with a tune.", if: ROOK },
      { who: 'scholar-sefa', text: 'And your stamps, Rook? What was their source? A price?' },
      { who: 'rook-tamsin', text: "...Fair hit. I deserved that one.", if: ROOK },
      { who: 'kip-arden', text: 'Is this a fight? Should I get snacks? I will get snacks.' },
    ],
    join: [
      { tone: 'joke', text: "'You two should start a band. The Hearsays.'", reply: "Rook snorts, and then has to look away to hide a real laugh. Sefa: 'Rook can play the cowbell. One note. Very sceptical.'" },
      { tone: 'doubt', text: "'Rook, what would a song have to do before you trusted it?'", reply: "Rook thinks, properly. 'Match something written down. Or something I can see.' Sefa: 'The flood post matched my song.' Rook: '...Then I trust that verse.'" },
      { tone: 'care', text: "'You both want the same thing: for people not to be fooled.'", reply: "Rook and Sefa look at each other, then away. Rook: 'Annoying, but correct.' Sefa: 'Very annoying.'" },
      { tone: 'plain', text: "'Testimony is evidence. It needs checking, like any other evidence.'", reply: "Rook: 'Checking. Fine. Not dismissing.' Sefa: 'And not swallowing whole.' Kip comes back with snacks and is sad to have missed it." },
    ] },
  { id: 'harrowmere', title: 'After Ise Told You', kind: 'friction', after: { flagSet: 'ise.harrowmere' },
    lines: [
      { who: 'smith-hesper', text: 'She signed it. A label that said safe. And the weir broke.' },
      { who: 'scholar-sefa', text: 'She was younger. She trusted the surveyor.' },
      { who: 'smith-hesper', text: 'If I sign a blade, I test it. Every time.' },
      { who: 'rook-tamsin', text: "I stamped a well clean after testing one bucket. I am not the one to throw stones.", if: ROOK },
      { who: 'kip-arden', text: 'Can I ask the question nobody is asking? Did anyone ever tell the people at Harrowmere?' },
      { who: 'lumen', text: '...No. I looked. Nobody did.' },
    ],
    join: [
      { tone: 'joke', text: "'I would make a joke, but I do not think there is one here.'", reply: "Hesper nods. 'Good. Not everything needs one.' The quiet that follows is not unkind." },
      { tone: 'doubt', text: "'Can we judge Ise, if we would have done the same with what she knew?'", reply: "Hesper is quiet a long time. 'We can judge what she did after. She kept quiet for years.' Sefa: 'Yes. That part is hers.'" },
      { tone: 'care', text: "'Ise is not here tonight. I think she is alone with it.'", reply: "Sefa stands. 'I will take her some tea.' Hesper, after a moment: 'Take two cups.'" },
      { tone: 'plain', text: "'Then telling Harrowmere is the next job.'", reply: "Kip: 'Yes. That.' Rook, if present, just nods. Hesper: 'Agreed.' For once, nobody argues." },
    ] },
  { id: 'farewell', title: 'The Last Hearth', kind: 'farewell', after: { flagSet: 'ending.council' },
    lines: [
      { who: 'scholar-sefa', text: 'I am going home for the memorial. Then I will come back. The Nexus needs a singer.' },
      { who: 'smith-hesper', text: "The forge will not run itself. I'll visit. Bring your broken things." },
      { who: 'kip-arden', text: 'I have three hundred unfinished questions. I am going to finish ONE. Then I will choose the next.' },
      { who: 'rook-tamsin', text: "I am going back to every well I stamped. All of them. Then I'll see.", if: ROOK },
      { who: 'lumen', text: 'I am staying. Somebody has to check the labels. My guess is it will be fun.' },
    ],
    join: [
      { tone: 'joke', text: "'Same time next chapter?'", reply: "Everybody laughs, a little wet-eyed. Kip: 'Is there a next chapter?' Lumen: 'There is a door.'" },
      { tone: 'doubt', text: "'Did we get it right?'", reply: "Sefa: 'We got it checked. That is what we can do.' Hesper: 'And we will check it again.'" },
      { tone: 'care', text: "'You are my people. Wherever you go.'", reply: "Nobody speaks. Hesper clears her throat very loudly. Kip hugs everyone, including Lumen, which is difficult." },
      { tone: 'plain', text: "'Thank you. All of you.'", reply: "Sefa hums the music box tune, in the major key. One by one, the others join in, badly and together." },
    ] },
];

export const hearthOf = (id: string): HearthTalk | undefined => HEARTH.find((t) => t.id === id);
