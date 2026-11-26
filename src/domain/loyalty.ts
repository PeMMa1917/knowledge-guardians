/**
 * Companion loyalty missions (spec 15.9; docs/STORY_BIBLE.md sections 5 and 10). Each core companion has
 * a personal problem tied to their way of knowing. The player checks three sources; on the way, the
 * companion's blind spot causes a real slip that the player can notice and help fix (spec COMP-003).
 * The mission ends in a dilemma between two good values: every choice has a cost, and the companion
 * answers the player's reasons, never agreement (COMP-002). Flag `loyalty.<id>` = the choice id.
 * Fictional people and places only. Pure data and rules; no DOM.
 */
import type { Condition } from './types';

export interface LoyaltySource { label: string; text: string }
export interface LoyaltyChoice { id: string; text: string; cost: string; reply: string }
export interface Loyalty {
  id: string;
  companion: string;
  who: string;
  title: string;
  /** When the mission spot appears. */
  available: Condition;
  intro: string;
  sources: LoyaltySource[];
  /** After the first source: the companion's blind spot shows. */
  slip: { says: string; notice: string; fixed: string; miss: string };
  question: string;
  choices: LoyaltyChoice[];
  idea: string;
}

export const LOYALTY: Loyalty[] = [
  { id: 'sefa', companion: 'scholar-sefa', who: 'Sefa', title: 'The Flood Song',
    available: { num: 'lamps.lit', gte: 6 },
    intro: "Sefa holds a song sheet with both hands. 'Next week is the flood memorial. I sing the old verse every year: \"The water reached the third step, and the guild stood fast.\" My grandmother taught it to me. This year, Orrin asked me to check it. Nobody ever asked me to check a song before.'",
    sources: [
      { label: 'The guild ledger for that spring', text: "In a clerk's neat hand: 'Water to the sixth step by the hall. Guild doors shut by order. The ferry folk carried the grain up the hill in the night.'" },
      { label: 'The flood post by the river', text: 'The old high mark is cut deep, at the height of the sixth step, with the year beside it. The third-step mark is from a smaller flood, years later.' },
      { label: "Tova's memory of her grandfather", text: "'My grandfather carried grain that night. He said the guild hall was shut tight. He never minded. He minded that the song forgot the boats.'" },
    ],
    slip: { says: "Sefa reads the ledger and frowns. 'A clerk wrote this in an office, after. A song is made by the people who were there. The song must be right.'",
      notice: 'Ask Sefa who made the song, and when.', fixed: "Sefa is quiet. 'My grandmother learned it from a guild singer. Years after.' A small laugh. 'So the song was made in an office too, in a way. Let us look at everything.'",
      miss: "You let it pass. Later, Sefa reads the flood post and goes pale. 'I nearly sang the third step to a town that will meet the next flood on the third step.'" },
    question: 'What will Sefa sing at the memorial?',
    choices: [
      { id: 'old', text: 'Sing the old verse, as her grandmother taught it.', cost: 'The guild families are comforted. But the ferry folk stay unsung, and children learn that the water stops at the third step.', reply: "'Comfort is a real thing. I will sing it. But I will tell Tova why, to her face. I owe her that.'" },
      { id: 'ledger', text: "Sing the ledger's story: the sixth step, the shut doors, the boats.", cost: 'The record is honoured. But the guild families feel shamed in front of the whole town, at a memorial.', reply: "'It will hurt. True things sometimes do. I will sing it gently, and I will sing it once a year until it stops hurting.'" },
      { id: 'both', text: 'Write a new verse that keeps the old one and adds the sixth step and the boats.', cost: "The song is truer and kinder. But Sefa must change her grandmother's song, and the old verse is never sung alone again.", reply: "'A song that grows is still a song. My grandmother changed it too, I think. She never said.'" },
    ],
    idea: 'Stories carry knowledge that records lose, and records keep what stories smooth over. A good knower checks both, and chooses what to pass on with care.' },
  { id: 'kip', companion: 'kip-arden', who: 'Kip', title: 'The Famous Ancestor',
    available: { flag: 'study.letter', eq: true },
    intro: "Kip unrolls an old map on the archive table. 'My family says Great-great-grandmother Arden drew the first map of the river. We have it on the wall at home! Can we prove it? Then I can ask the next question. Then the next one...'",
    sources: [
      { label: 'The map itself', text: "Signed 'Arden' in one corner. The handwriting on the map is upright and square." },
      { label: 'Arden\'s letters in the Nexus', text: "Three letters from Arden. Her handwriting leans hard to the right. In one she writes: 'The pilots and I walked the bank for six days. They named every bend.'" },
      { label: 'A ferry ledger', text: "'Paid: A. Arden and the river pilots, for the survey of the bends.' Two weeks later: 'Paid: surveyor Coll, for the fair copy of the river map.'" },
    ],
    slip: { says: "Kip is already pulling out a second roll. 'Brilliant, the signature! Now my great-uncle: he says he found a ship in a bottle that—'",
      notice: "Stop Kip: 'Finish this question first.'", fixed: "Kip stops, rolls the second map back up, and laughs. 'Right. One question at a time. The bottle can wait. It is a very patient bottle.'",
      miss: "Kip races ahead. Later, Kip notices that nobody compared the handwriting. 'I nearly told my whole family the wrong thing because I was bored. That is a terrible reason.'" },
    question: 'What will Kip tell the family?',
    choices: [
      { id: 'proud', text: "Tell them it is true: Arden drew the first map.", cost: 'The family is delighted. But the pilots and Coll disappear from the story, and the claim is stronger than the evidence.', reply: "'They will be so happy. I just... I will keep the ledger page. In case someone asks me how I know.'" },
      { id: 'not', text: 'Tell them she did not draw it: Coll did.', cost: 'Clear and simple. But it is wrong too: Arden and the pilots walked the river and named the bends. The fair copy is not the whole map.', reply: "'Huh. That is also more than the evidence, is it not? I swapped one big claim for another big claim.'" },
      { id: 'mixed', text: 'Tell them she led the survey with the river pilots, and Coll made the fair copy. The evidence is mixed, and that is the story.', cost: 'Honest, and the pilots get their due. But the story loses its shine, and Kip\'s grandmother is cross for a week.', reply: "'A smaller claim with more people in it. Grandmother will be cross. Then she will tell it at dinner for twenty years.'" },
    ],
    idea: 'A proud family story and a record can both be partly right. Matching a claim to its evidence often makes it smaller, and fairer to the people who were left out.' },
  { id: 'hesper', companion: 'smith-hesper', who: 'Hesper', title: "The Traveller's Quench",
    available: { num: 'lamps.lit', gte: 6 },
    intro: "Hesper turns a blade in the forge light. 'The salt quench. My great-grandfather's technique. Every smith in Emberford knows the Lyle quench.' She hesitates, which she never does. 'Bea at the trade hall found a record. She says I should see it. I would rather hit something.'",
    sources: [
      { label: 'The trade hall record', text: "'A traveller, Imre of the eastern road, stayed the winter at the Lyle forge and showed the salt quench for his keep. Left in spring.'" },
      { label: "Hesper's great-grandfather's notebook", text: "'Tried the stranger's salt bath. Cracked four blades. Changed the salt, and the heat. Now it holds. Ours now.'" },
      { label: 'The ferry guest book', text: "A signature from that spring: 'Imre, smith, going home east. Left a good trick in Emberford. Hope they use it well.'" },
    ],
    slip: { says: "Hesper snaps the notebook shut. 'There. He made it work. Four cracked blades. If I can make it, I know it. It is ours.'",
      notice: "Ask Hesper: 'Would he have tried it without Imre?'", fixed: "Hesper is quiet for a long breath. 'No. He would not have known to try.' She opens the notebook again. 'Making it better is not the same as making it first. Fine. Fine.'",
      miss: "Hesper puts the notebook away. Later, at the guest book, she reads Imre's line twice. 'He hoped we would use it well. And we put our name on it. That is not well.'" },
    question: "What will Hesper do about the forge's famous name?",
    choices: [
      { id: 'sign', text: "Add Imre to the forge sign: 'The salt quench of Imre and the Lyles.'", cost: 'Imre gets his credit in public. But some buyers think less of the Lyle forge, and Hesper hears about it every market day.', reply: "'It looks strange on the sign. It looks true, though. I will get used to strange.'" },
      { id: 'private', text: 'Keep the sign, and tell the story to every apprentice.', cost: "The forge keeps its pride and the story lives in the forge. But the town never hears Imre's name.", reply: "'The apprentices will know. That is something. It is not everything. I know that.'" },
      { id: 'find', text: "Send a letter east by the ferry, to find Imre's family, before changing anything.", cost: "The fairest path, perhaps. But it is slow and may find nothing, and meanwhile nothing changes.", reply: "'Waiting is the hardest thing you could ask a smith. I will do it anyway. Then we decide together, with them.'" },
    ],
    idea: 'Knowing how to make something is real knowledge, but it does not tell you where the idea came from. Credit is a knowledge claim too, and it can be checked.' },
  { id: 'rook', companion: 'rook-tamsin', who: 'Rook', title: 'The Clean Well',
    available: { flag: 'rook.joined', eq: true },
    intro: "Rook stops at an old well by the seed rows. A gold seal, flaking, is nailed to the post: 'CLEAN'. Rook does not touch it. 'I stamped that. Two summers ago. A girl got sick in the autumn. I want to make it right. I do not trust anyone to help. Present company included.'",
    sources: [
      { label: "Rook's old test notes", text: "'Water clear, no smell. Tested one bucket, first week of spring. Good enough. Stamp it.'" },
      { label: 'The seed-row crew', text: "'The water turns in late summer, when the channel runs low and the cattle use the upper bank. Everyone here knows that. Nobody asked us.'" },
      { label: "The girl's mother", text: "'She got sick in the autumn, after the dry month. The doctor said the water. I do not blame the stamp. I blame that nobody told us to boil it in the dry months.'" },
    ],
    slip: { says: "Rook waves the crew's words away. 'Stories. People always \"know\" things. Give me a test, not a feeling.'",
      notice: "Ask Rook: 'When did you test, and when do they say it turns?'", fixed: "Rook looks at the notes for a long moment. 'Spring. They said late summer.' A hard laugh. 'My test was real. It was the wrong season. Their \"story\" had the one fact I did not.'",
      miss: "Rook moves on. Later, the mother says 'the dry months', and Rook goes very still. 'The crew told me that an hour ago, and I called it a story. I do it every time.'" },
    question: 'How will Rook make it right?',
    choices: [
      { id: 'public', text: "Test the well again in the dry month, and post the result beside the old seal, with Rook's name.", cost: "The truth is in the open, and people will boil water in the dry months. But Rook's name is on the failure, in public, for good.", reply: "'My name on my mistake. That is fair. It is also the first thing I have signed in years that I believe.'" },
      { id: 'quiet', text: 'Take the seal down quietly, and boil-water notices go up without any names.', cost: 'The danger is fixed fast. But the people who were harmed never hear what went wrong, or who did it.', reply: "'Clean and quiet. That is how the Seal did things too.' Rook does not look at you." },
      { id: 'family', text: "Bring the girl's family to see the new test, and let Rook tell them.", cost: "Hardest for Rook, and the family may not forgive. But they hear it from the person who did it, with the evidence in front of them.", reply: "Rook's hands shake on the bucket rope. 'Fine. Yes. Stay near.' Afterwards, quietly: 'She shook my hand. I did not expect that. I do not know what to do with it.'" },
    ],
    idea: "A test is only as good as when and where it was made. Testimony can carry the fact a test missed. A sceptic who dismisses every story can be fooled by their own test." },
];

export const loyaltyOf = (id: string): Loyalty | undefined => LOYALTY.find((l) => l.id === id);
export const loyaltyDone = (flags: Record<string, unknown>, id: string): boolean => typeof flags[`loyalty.${id}`] === 'string';
