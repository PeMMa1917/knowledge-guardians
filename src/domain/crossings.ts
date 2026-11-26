/**
 * Crossings: small and large conflicts in the world (Mika, 2026-11-26: "a huge variety of the types
 * of conflict ... if players have to defeat the conflict, if they can get around or ignore it, if it
 * is major or minor"). Each crossing is one problem in one place, with two or three ways through:
 *
 * - overcome: face the problem and solve it (often needs knowledge, a companion, an item or marks);
 * - around:   avoid or reduce it, with a smaller cost;
 * - ignore:   walk away. The world goes on without you, and people remember (respecting refusal).
 *
 * No way is a game over (fail forward). Every way has a cost, and the TOK idea is said after.
 * Types follow Mika's conflict list: self, person, nature, society, god, fate, supernatural, technology.
 * Supernatural, fate and god crossings use invented in-world myths, prophecies and patrons only.
 * No real religion's God or sacred figures are ever an opponent, and no real belief is judged:
 * the conflict is with a person who claims to speak for a belief, or with a reading of a sign. Animals are never hurt. Fictional people and places only. Flag `cross.<id>`
 * holds the way id. The conflict map in docs/STORY_BIBLE.md lists these with the chapter conflicts.
 */
import type { CampaignState, Condition } from './types';
import { check } from './rules';

export type ConflictType = 'self' | 'person' | 'nature' | 'society' | 'god' | 'fate' | 'supernatural' | 'technology';
export type ConflictTone = 'funny' | 'serious' | 'mixed';
export type ConflictScale = 'minor' | 'mid' | 'major';
export type WayKind = 'overcome' | 'around' | 'ignore';

export interface CrossingWay {
  id: string;
  kind: WayKind;
  text: string;
  /** A key that some players have and others do not (knowledge, a companion, an item, marks). */
  needs?: { if?: Condition; companion?: string; why: string };
  /** How it resolves, in the words of the conflict list (for example 'learning new information', 'compromise'). */
  method: string;
  result: string;
  cost: string;
}

export interface Crossing {
  id: string;
  chapter: number;
  map: string;
  /** The main type first. */
  types: ConflictType[];
  scale: ConflictScale;
  tone: ConflictTone;
  /** What is at risk, and what can be won. */
  stakes: { lose: string; gain: string };
  /** What it moves forward: the plot, a character's arc, or the theme. */
  serves: 'plot' | 'arc' | 'theme';
  /** How it connects to a later conflict or beat, so conflicts build (a crossing id or a beat). */
  leadsTo?: string;
  title: string;
  scene: string;
  ways: CrossingWay[];
  idea: string;
}

export const WAY_LABEL: Record<WayKind, string> = { overcome: 'Face it', around: 'Find a way around', ignore: 'Leave it' };

export const CROSSINGS: Crossing[] = [
  { id: 'lamb', chapter: 1, map: 'aethelgard.ferry', types: ['nature'], scale: 'minor', tone: 'mixed', serves: 'theme', leadsTo: 'ballad',
    stakes: { lose: 'a cold lamb and a frightened boy', gain: 'a calm way to tell which way the water moves' }, title: 'The Lamb on the Ford Stone',
    scene: "The river is high after the rain. A lamb stands on the middle stone of the old ford and bleats. Its owner, a boy called Hollis, wrings his cap. 'The water is still rising! Is it? I think it is. Everyone says it is.' The flood post stands by the bank.",
    ways: [
      { id: 'post', kind: 'overcome', method: 'learning new information', text: 'Read the flood post twice, ten minutes apart, before you do anything.', result: "The first reading is just under the third notch. The second reading is lower. The water is falling. You and Hollis wait, and at dusk the lamb hops across the stones by itself. Hollis: 'Everyone said it was rising. Nobody looked.'", cost: 'You lose the afternoon. The fruit stalls close before you get back.' },
      { id: 'punt', kind: 'around', method: 'help from others', text: "Pay Juno 2 marks to pole the ferry punt out to the stone.", needs: { if: { marks: 2 }, why: '2 marks' }, result: "Juno poles out, grumbling about wet boots. The lamb is carried back like a queen. Hollis cannot stop thanking you.", cost: "2 marks, and Juno's good boots." },
      { id: 'leave', kind: 'ignore', method: 'coping: nature runs its course', text: "Leave it. 'Lambs are good at stones.'", result: 'You walk on. Later, Tova tells you the lamb swam back by itself at dusk, cold and cross. Hollis waited all afternoon in the rain.', cost: 'Hollis remembers that you walked past.' },
    ],
    idea: 'Panic spreads from person to person faster than water rises. One honest measurement, taken twice, can tell you which way a thing is moving.' },

  { id: 'lintel', chapter: 1, map: 'nexus.archive', types: ['fate', 'supernatural'], scale: 'mid', tone: 'mixed', serves: 'arc', leadsTo: 'fortune',
    stakes: { lose: 'the player believes the story is about being chosen', gain: 'the player chooses the work for their own reasons' }, title: 'The Prophecy over the Arch',
    scene: "Words are cut into the stone over an old arch: WHEN THE LAMPS GO DARK, ONE FROM OUTSIDE SHALL LIGHT THEM. Lumen glows very bright. 'That is you! You came from outside! It is a prophecy!' Lumen does a loop. 'Is it?'",
    ways: [
      { id: 'source', kind: 'overcome', method: 'learning new information', text: 'Look up the carving in the Nexus catalogue: who cut it, and when?', result: "The catalogue says: 'Motto, carved by the stonecutter Gethin for the lamp fund, forty years ago. A hope, not a forecast.' Lumen dims a little. 'So nobody chose you.' You answer: 'Then I choose it.'", cost: 'The magic goes out of the words. Lumen is quiet for a while.' },
      { id: 'motto', kind: 'around', method: 'fulfilling a prophecy in an unexpected way', text: "Say: 'Maybe. I will treat it as a hope, not as a fact.'", result: "Lumen thinks. 'A hope you can work for. A fact you can only wait for.' It brightens again.", cost: 'You never find out who carved it. Some visitors still think you are the chosen one, and expect too much.' },
      { id: 'believe', kind: 'ignore', method: 'embracing the destiny', text: "Grin. 'It says what it says.' Walk on.", result: "Lumen tells everyone. Visitors bow to you a little. It is nice for a day. Then a child asks why the lamps are still dark, if you are the one.", cost: 'People wait for you to fix things alone, so fewer of them help.' },
    ],
    idea: 'A prophecy gets its power from where it came from. Ask who said it and why. Some prophecies come true only because people believe them, and some stop people from acting.' },

  { id: 'repair-queue', chapter: 1, map: 'aethelgard.emberford', types: ['person', 'society'], scale: 'mid', tone: 'mixed', serves: 'arc', leadsTo: 'harrowmere',
    stakes: { lose: 'a way to collect a repair without explaining a private fee waiver', gain: 'a handoff that customers and apprentices can both check' },
    title: 'The Repair Queue',
    scene: 'Hesper has a kettle to return and two slips marked 12. Sefa keeps her hand over the names on the fee slate. Kip waits for an answer to the first question: what lets someone collect the right repair?',
    ways: [
      { id: 'paired', kind: 'overcome', method: 'helping both groups agree on a shared check', text: 'Open the yard with the paired tickets. Keep fee decisions on the inside of the counter.',
        needs: { if: { all: [{ flag: 'repair.queue.tested', eq: true }, { flag: 'repair.queue.permission', eq: true }, { flag: 'repair.queue.blanks', eq: true }] }, why: 'a checked pair, sharing permission and new blanks from the workbench' },
        result: 'Hesper unlatches the little yard. A holder can show the matching edge at the hatch. Sefa takes the fee slate inside. The first kettle is ready to collect.',
        cost: 'You paid two marks for blanks. Hesper stays by the hatch at the end of the shift while the apprentices practise.' },
      { id: 'relay', kind: 'around', method: 'agreeing on a separate route', text: 'Take a covered tray across the square and use a return slip at Hana’s stall.',
        needs: { if: { flag: 'repair.queue.permission', eq: true }, why: 'permission to make a relay slip without names' },
        result: 'Hesper brings the covered tray outside. The yard stays closed. Hana can receive the tray at her stall if someone carries it over and brings back the return slip.',
        cost: 'Someone makes the extra crossing and the market pickup waits for the next handoff. Hana cannot leave her stall to fetch the tray.' },
      { id: 'leave', kind: 'ignore', method: 'returning the decision to the people responsible', text: 'Return the borrowed slate. Let the apprentices carry on with private pickup appointments.',
        result: 'Sefa takes the slate back. Hesper writes the next appointment times on the outside board and puts the original slips away. Check the board before you go.',
        cost: 'The yard stays shut to walk-ins. People who cannot reach an appointment wait for another day.' },
    ],
    idea: 'The public notice needs a way to match the work to its owner. It can leave the reason for a fee waiver inside the workshop.' },

  { id: 'borrowed', chapter: 2, map: 'nile.hall', types: ['person'], scale: 'minor', tone: 'funny', serves: 'theme',
    stakes: { lose: 'a dispatch built on one translation', gain: 'two readings, and a footnote-loving friend' }, title: 'The Borrowed Translation',
    scene: "A visiting scholar, Ambry, sits on the only reading copy of the second translation like a hen on an egg. 'You may borrow it when you agree that my reading of the boast is the right one. Not before.'",
    ways: [
      { id: 'argue', kind: 'overcome', method: 'convincing with evidence', text: 'Show Ambry the line on the tablet that supports both readings, and ask what would change his mind.', result: "Ambry reads it for a long time. 'Hm. I would change my mind if the word for \"enemy\" appeared twice.' It does not. He hands over the copy. 'Both readings, then. In footnotes. I insist on the footnotes.'", cost: 'It takes an hour, and Ambry now follows you around to discuss footnotes. Lumen whispers: "He is a real foot-noter."' },
      { id: 'second', kind: 'around', method: 'going separate ways', text: 'Go to the royal room and read the old reference copy there instead.', result: 'The old reference copy is faded but complete. You read it standing up.', cost: 'Your back hurts, and Ambry tells the archive you "ran away from a debate".' },
      { id: 'without', kind: 'ignore', method: 'agreeing to go without', text: 'Do without the second translation.', result: "You work from one translation only. Your notes say so honestly: 'One translation checked.'", cost: 'Your dispatch is less sure than it could be, and you know it.' },
    ],
    idea: 'A translation is a reading, and every reading makes choices. When someone holds a source back as a bargain, there is often another way to the evidence.' },

  { id: 'warm-room', chapter: 3, map: 'preserved.archive', types: ['nature', 'self'], scale: 'mid', tone: 'serious', serves: 'theme',
    stakes: { lose: 'part of the record, for good', gain: 'a record kept on purpose, with its gaps named' }, title: 'The Warm Room',
    scene: "The cooling fan in the record store stops with a clunk. The room starts to warm, and damp creeps up the walls. Keeper Odile counts the minutes. 'You can carry three boxes before the damp reaches them. Six are on the shelf. Which do we save?'",
    ways: [
      { id: 'fan', kind: 'overcome', method: 'proper preparation and skill', text: "Ask Hesper to open the fan housing and fix the belt.", needs: { companion: 'smith-hesper', why: 'Hesper as your companion' }, result: "Hesper has the cover off in a breath. 'Belt slipped. Old leather.' She ties it with her own bootlace. The fan coughs and turns. All six boxes stay dry.", cost: 'Hesper limps around in one loose boot for the rest of the day, and complains.' },
      { id: 'letters', kind: 'around', method: 'making a personal choice', text: "Save the three boxes of family letters.", result: 'The letters stay dry. The voices of the families are kept. The official counts in the other boxes are spotted with mould, and some numbers are lost.', cost: 'Later, nobody can say for sure how many people were on the lists. The letters are moving, but they do not add up.' },
      { id: 'counts', kind: 'around', method: 'making a personal choice', text: 'Save the three boxes of official counts.', result: "The counts stay dry. Every number is safe. The family letters are spotted with mould, and some pages are lost.", cost: 'Later, the numbers are complete, but nobody can say what the numbers felt like to the people in them.' },
      { id: 'keeper', kind: 'ignore', method: 'another person decides', text: "Step back. 'You know this room, Odile. You choose.'", result: 'Odile saves the boxes that the catalogue marks as most used. Those are the official counts.', cost: "What gets saved depends on what was used before. The letters nobody asked for are lost first." },
    ],
    idea: 'What survives decides what can be known later. Every archive is shaped by choices about what to keep, often made in a hurry.' },

  { id: 'tide-engine', chapter: 4, map: 'observatory.harbour', types: ['technology'], scale: 'mid', tone: 'mixed', serves: 'plot', leadsTo: 'furnace',
    stakes: { lose: "wet stalls, and the harbour's trust in its board", gain: 'a machine checked against today' }, title: 'The Tide Engine',
    scene: "A brass tide engine ticks on the harbour wall. Its dial says high tide at noon. Harbourmaster Teodor trusts it more than his own eyes. 'It has never been wrong.' But the water is already over the bottom step, and it is only ten.",
    ways: [
      { id: 'reset', kind: 'overcome', method: 'learning how to use the technology', text: "Set the engine with the station's own readings from this week.", needs: { if: { objective: 'coast.readings' }, why: "the station's readings (finish the second step of this chapter)" }, result: "The gears were set with last year's moon table. With this week's readings, the dial jumps to eleven. Teodor stares. 'It was right for a year that is over.'", cost: 'Teodor is embarrassed in front of his crew, and is short with you all day.' },
      { id: 'both', kind: 'around', method: 'overcoming technology with human judgement', text: 'Chalk two times on the board: the engine says noon; the steps say sooner.', result: 'The fishers read both, and most of them move their boats early. Two do not.', cost: 'Two boats bump against the wall. Nobody is hurt, but the board now looks unsure, and some people stop reading it.' },
      { id: 'trust', kind: 'ignore', method: 'being defeated by technology', text: 'Trust the engine. It has a good record.', result: "At eleven the tide comes in. The fish stalls on the low steps get wet feet and wet fish.", cost: 'The stall-holders blame the engine. Then they blame the Guardians who looked at it and said nothing.' },
    ],
    idea: 'A machine can extend what we know, but it carries the assumptions of the people who set it. A good record in the past does not check today.' },

  { id: 'geese', chapter: 5, map: 'forest.trail', types: ['nature'], scale: 'minor', tone: 'funny', serves: 'theme',
    stakes: { lose: 'a gap in the bird count', gain: 'a count that did not disturb what it counted' }, title: 'The Geese on the Path',
    scene: 'A row of nesting geese blocks the trail to the far count point. They hiss as one. The trail is narrow, with marsh on both sides.',
    ways: [
      { id: 'watch', kind: 'overcome', method: 'gaining experience and skill', text: 'Sit quietly in the hide and watch them for a while.', result: 'You learn their routine: at feeding time, the whole row walks to the water. You pass then, and you count three new nests on the way. They never knew you were there.', cost: 'It takes most of an hour, and you get cramp.' },
      { id: 'marsh', kind: 'around', method: 'coping with the situation', text: 'Wade round through the marsh edge.', result: 'Wet to the knees, you reach the count point.', cost: 'Your boots squelch all day, and your count from the far point starts late, so it misses the morning birds.' },
      { id: 'turn', kind: 'ignore', method: 'giving way to nature', text: 'Turn back and count somewhere else today.', result: 'You count at the near point twice instead.', cost: 'Your count has a gap: no birds from the far point. A gap like that can make a route look empty.' },
    ],
    idea: 'Watching without disturbing is a skill. If you change what you watch, you measure your own effect. A gap in where you looked is a gap in what you know.' },

  { id: 'furnace', chapter: 6, map: 'metalworks.yard', types: ['technology', 'person'], scale: 'minor', tone: 'mixed', serves: 'theme', leadsTo: 'name-box',
    stakes: { lose: "a day's work and fuel", gain: 'a dial checked against a fixed point' }, title: 'The Furnace Dial',
    scene: "The furnace dial says the heat is low, so the stoker, Brindle, keeps shovelling fuel. The steel in the furnace looks a very bright yellow. 'The dial is the dial,' Brindle says. 'I am paid to read it, not to argue with it.'",
    ways: [
      { id: 'tin', kind: 'overcome', method: 'overcoming technology with a better check', text: 'Do a check: put a sliver of tin on a rod near the furnace mouth. Tin melts at a known heat.', result: "The tin melts at once, far from the hottest part. The dial is reading low: soot is caked on its probe. Brindle stops shovelling and cleans it, frowning. 'I was not being stubborn. I was being steely.' Nobody laughs. Brindle laughs alone.", cost: "Brindle says nothing kind to you for the rest of the day. Being right in someone's workplace has a price." },
      { id: 'colour', kind: 'around', method: 'overcoming technology with human skill', text: "Ask Brindle what colour the steel should be. Then ask what colour it is.", result: "Brindle looks. 'Cherry red, it should be. That is... yellow.' Brindle stops shovelling, but keeps the dial as it is.", cost: 'This batch is saved, but the dial still lies, and the next stoker will trust it.' },
      { id: 'leave', kind: 'ignore', method: 'being defeated by technology', text: "It is Brindle's furnace. Walk on.", result: 'The batch overheats. The smiths throw it back to be melted again.', cost: 'A day of fuel and work is lost. Nobody knows why, so it may happen again.' },
    ],
    idea: 'An instrument stands between us and the world. When the instrument and the trained eye disagree, check one against a fixed point that does not depend on either.' },

  { id: 'crowd', chapter: 7, map: 'copies.press', types: ['society'], scale: 'mid', tone: 'serious', serves: 'plot',
    stakes: { lose: "the hall's good name", gain: 'a public that can check for itself' }, title: 'The Crowd at the Press',
    scene: "A crowd has gathered at the press door. A rumour says the hall burned a book on purpose to hide something. A man with a loud voice, Osk, stands on a barrel. 'Why would they hide the Tuesday copies, unless they had something to hide?'",
    ways: [
      { id: 'ledger', kind: 'overcome', method: 'educating society', text: 'Bring out the lending ledger and read the Tuesday page aloud, to everyone.', result: "The page shows a water stain, not a fire. People lean in to see. Osk climbs down. 'Well. Who started the fire story, then?' Nobody knows. That is the point.", cost: 'The crowd now asks for the ledger every week. You have made a promise to be open, and it takes time.' },
      { id: 'three', kind: 'around', method: 'a compromise with the crowd', text: 'Invite three people from the crowd, chosen by the crowd, to look inside for themselves.', result: 'The three come out and tell the others what they saw. Most believe them. A few say the three were fooled.', cost: 'The rumour gets smaller, but it does not die. Trust now rests on three people, not on the evidence.' },
      { id: 'doors', kind: 'ignore', method: 'withdrawing from society', text: 'Close the doors and wait for the crowd to go home.', result: 'The crowd goes home at dark.', cost: 'Next day the rumour is bigger: "they shut the doors." A closed door is evidence to people who are already sure.' },
    ],
    idea: 'A rumour is knowledge passed person to person with nobody checking. Openness costs time, but closing the door often feeds the story you wanted to stop.' },

  { id: 'drowned-bell', chapter: 8, map: 'sea.harbour', types: ['supernatural'], scale: 'mid', tone: 'mixed', serves: 'theme',
    stakes: { lose: 'a true warning, missed', gain: 'a story and a cause that both keep people safe' }, title: 'The Bell under the Water',
    scene: "The harbour folk say a drowned bell rings under the water before a storm. Three people tell it three ways. Old Linnet: 'It is the bell of the first harbour, warning its children.' The chart clerk: 'A story for tourists.' A child, Pippa: 'It is a big fish that swallowed a bell!' Tonight, a low note hums across the water.",
    ways: [
      { id: 'listen', kind: 'overcome', method: 'learning how the unknown works', text: 'Compare the three stories. What do they all agree on? Then go and listen at the old pier.', result: "All three agree on one thing: a sound comes before storms. At the old pier you find hollow iron posts. When the storm wind rises, it sings through them, low, like a bell. Linnet smiles. 'So the warning is real. My grandmother was right to listen.'", cost: 'The child is a little sad that it is not a fish. The chart clerk is a little sad that it is not nonsense.' },
      { id: 'margin', kind: 'around', method: 'learning to live with the unknown', text: "Write the story in the chart margin as a local name: 'The Bell, sounds before storms.'", result: 'The next chart carries the name. Sailors who do not know the story learn to listen for the sound.', cost: 'You do not find out what makes the sound. The chart now holds a warning that nobody can explain.' },
      { id: 'tale', kind: 'ignore', method: 'dismissing the unknown', text: "Smile. 'A good story.' Go to bed.", result: 'You sleep well. In the morning the storm comes in early. Linnet had already moved the boats.', cost: 'You missed a true warning because it came in the shape of a story.' },
    ],
    idea: 'A myth can carry real knowledge in a memorable shape. Different versions can disagree on the cause and agree on what was seen. Ask what each version keeps.' },

  { id: 'stage-fright', chapter: 9, map: 'stage.foyer', types: ['self'], scale: 'minor', tone: 'mixed', serves: 'arc',
    stakes: { lose: 'your own voice', gain: 'the courage to say what you do not know, in public' }, title: 'Before the Curtain',
    scene: "The stage manager points at you. 'Two minutes. You tell the audience what the programme gets wrong.' Your mouth is dry. The hall is full. Somewhere in the dark, someone coughs.",
    ways: [
      { id: 'speak', kind: 'overcome', method: 'overcoming a personal weakness', text: "Walk out and say it plainly: what you know, and what you do not know.", result: "Your voice shakes on the first line and steadies on the second. When you say 'we do not know this part', the hall goes quiet, and then someone nods.", cost: 'Your hands shake for an hour after. That is what courage costs.' },
      { id: 'cards', kind: 'around', method: 'taking a safe personal action', text: 'Read it from cards, word for word.', result: 'It is clear and correct. It is also flat, and some people drift off.', cost: 'The facts arrive. The feeling does not, so fewer people remember them tomorrow.' },
      { id: 'pass', kind: 'ignore', method: 'giving in to a personal weakness', text: "Ask your companion to speak instead.", result: 'Your companion speaks in their own way. Kip asks the audience questions; Hesper shows a prop; Sefa sings a line; Rook is very blunt. It works, in a way you did not plan.', cost: 'It was not your voice. You will have to find it another day.' },
    ],
    idea: 'Knowing something and telling it are different skills. How a thing is said changes what people take away. Courage is acting while unsure.' },

  { id: 'fortune', chapter: 9, map: 'stage.foyer', types: ['fate', 'self'], scale: 'minor', tone: 'funny', serves: 'arc', leadsTo: 'stage-fright',
    stakes: { lose: 'a night spent waiting for a failure that was foretold', gain: 'a prophecy met on your own terms' },
    title: "Madame Quandary's Card",
    scene: "In the foyer, a fortune-teller in a hat made of programmes, Madame Quandary, turns a card for you. It shows a broken mask. 'Tonight,' she says, in a deep and theatrical voice, 'you will fail on the stage.' Then, in her normal voice: 'That is two pennies. Sorry. It is the card.'",
    ways: [
      { id: 'ask', kind: 'overcome', method: 'learning new information', text: "Ask her how many fortunes she has told tonight, and what the other cards said.", result: "Madame Quandary counts on her fingers. 'Eleven. Nine said \"fail\". It is a theatre, dear. Everyone is afraid of failing. The cards know their audience.' She winks. 'I am an actor too.'", cost: 'The card loses its grip on you. So does the fun of it.' },
      { id: 'flip', kind: 'around', method: 'fulfilling a prophecy in an unexpected way', text: "Decide to fail on purpose, in a small way: trip on the first step and laugh.", result: 'You trip on the step on purpose. The hall laughs with you, not at you. The fortune came true, and now it is spent.', cost: 'Lumen calls you "the Guardian who fell up the stairs" for a week.' },
      { id: 'worry', kind: 'ignore', method: 'giving in to a personal weakness', text: 'Pay the two pennies and walk off, worried.', result: 'You carry the broken mask in your head all evening. It makes the next part harder.', cost: 'A prophecy you believe can help make itself come true.' },
    ],
    idea: 'A prophecy can fulfil itself: fear of failing can cause the failing. A prediction told to many people at once will come true for some of them by chance. Ask how often the fortune is told.' },

  { id: 'patron', chapter: 10, map: 'market.square', types: ['god', 'society'], scale: 'mid', tone: 'serious', serves: 'plot', leadsTo: 'harrowmere',
    stakes: { lose: "people's faith used to sell false weights", gain: 'faith and fair measure kept side by side, each with its own respect' },
    title: 'The Lady of Fair Measure',
    scene: "In the market square stands a small shrine to the Lady of Fair Measure, the market's old patron in this town's own tradition. People touch her stone scales for luck. Today a Seal agent, Sallow, has hung gold stamps on the shrine. 'The Lady blesses Seal weights,' Sallow tells the queue. 'Doubt the stamp, doubt the Lady.' Some people look uneasy. Some look angry.",
    ways: [
      { id: 'keeper', kind: 'overcome', method: 'a better understanding of the belief', text: "Ask the shrine keeper, old Ottilie, what the Lady's sayings ask of traders.", result: "Ottilie recites, slowly: 'Weigh as if the Lady holds the other pan.' People nod. Ottilie looks at Sallow. 'She asks for honest weights. She never sold a stamp.' Ottilie takes the gold stamps down, gently, and gives them back.", cost: "Sallow leaves angry and will tell the Seal about you. Nobody's faith was questioned; one person's claim to speak for it was." },
      { id: 'test', kind: 'around', method: 'separating the questions', text: 'Leave the shrine alone. Set up a test bench beside the well and weigh the stamped weights against the town standard.', result: 'Two stamped weights are light. People see it with their own eyes. Some still touch the shrine on the way past. That is their business, and you do not make it yours.', cost: 'Sallow says the Guardians "test the Lady". It is not true, but it travels.' },
      { id: 'leave', kind: 'ignore', method: 'stepping back from a belief that is not yours to judge', text: "Say: 'Faith is not my field.' Walk on.", result: 'You walk on. The stamps stay on the shrine for a week.', cost: 'The light weights stay in use, and the people who trust the shrine most pay the most for it.' },
    ],
    idea: 'Faith and measurement are different ways of knowing, and each deserves respect on its own ground. The conflict here is not with a belief: it is with a person who claims to speak for it, to sell something. Ask who benefits from the claim.' },

  { id: 'goat', chapter: 10, map: 'market.square', types: ['nature', 'person'], scale: 'minor', tone: 'funny', serves: 'theme',
    stakes: { lose: 'eleven price slips and your dignity', gain: 'a lesson about memory that fills gaps in its own favour' }, title: 'The Goat Who Was Certain',
    scene: "A goat with a very confident face is eating the price slips off the stalls, one by one. It looks at you as if it is sure it is right. Its owner, Jory, is asleep under a cart.",
    ways: [
      { id: 'chase', kind: 'overcome', method: 'defeating the other (physically, badly)', text: 'Chase the goat.', result: "You chase the goat round the well. The goat chases you round the well. A crowd gathers and cheers for the goat. At last Jory wakes up and calls it by name, and it trots over like a saint. Jory yawns: 'He is not baaad. He is just very sure of himself.'", cost: 'Your dignity. Also eleven price slips.' },
      { id: 'trail', kind: 'around', method: 'learning new information', text: 'Ignore the goat. Follow the trail of half-eaten slips and help the stall-holders write the prices again from memory.', result: "Each stall-holder remembers their own price exactly. Then you notice: three of them remember a slightly higher price than the half-slips show.", cost: 'Memory filled the gaps, and it filled them in its own favour. You must decide whether to say so.' },
      { id: 'let', kind: 'ignore', method: 'agreeing to disagree with a goat', text: "Let the goat eat. Goats will be goats.", result: 'The goat eats every slip and lies down, full and certain. The stalls trade by word of mouth all afternoon.', cost: 'By evening, prices have crept up, and nobody can prove what they were this morning.' },
    ],
    idea: 'When records are lost, memory fills the gap, and memory is not neutral. Being certain, like the goat, is not the same as being right.' },

  { id: 'sluice', chapter: 11, map: 'water.lower-channel', types: ['nature', 'self'], scale: 'major', tone: 'serious', serves: 'arc', leadsTo: 'harrowmere',
    stakes: { lose: "a season's seedlings, or a street's winter food", gain: 'a choice you can explain to the people who lose' }, title: 'The Night Surge',
    scene: "Rain in the hills. At midnight the lower channel rises fast. Gatekeeper Sorrel shouts over the water: 'If we open the upper sluice, the seed rows flood but the lower houses stay dry. If we keep it shut, the seed rows live and the cellars on Low Street fill. Choose, Guardian. You have the badge.'",
    ways: [
      { id: 'open', kind: 'overcome', method: 'making a personal choice', text: 'Open the sluice. Save the houses, lose the seed rows.', result: 'The water pours into the seed rows. Low Street stays dry. In the morning, the crews stand in the mud and say nothing.', cost: 'A season of seedlings is lost. The crew who planted them must start again, and they remember who chose.' },
      { id: 'gauge', kind: 'around', method: 'gaining knowledge, then a compromise', text: 'Read the weir gauge first. Open the sluice halfway, and watch it.', needs: { if: { objective: 'water.drought' }, why: 'the weir gauge readings (finish the drought step of this chapter)' }, result: 'Half open, with the gauge watched every ten minutes. Some rows flood, some cellars get wet. Nobody loses everything.', cost: 'Everybody loses something, and nobody is fully happy with you. You were awake all night.' },
      { id: 'shut', kind: 'ignore', method: 'refusing to choose (also a choice)', text: "Keep it shut. 'I will not choose who loses.'", result: 'The seed rows live. The cellars on Low Street fill. Families carry their winter food up the stairs at two in the morning.', cost: "Not choosing was also a choice. Sorrel tells you so, gently." },
    ],
    idea: 'Some problems have no option without harm, only a choice of which harm. Better evidence cannot make the choice for you, but it can make the harm smaller and the reasons clearer.' },

  { id: 'name-box', chapter: 12, map: 'civic.steps', types: ['technology', 'society'], scale: 'mid', tone: 'serious', serves: 'plot',
    stakes: { lose: "a traveller's own name", gain: 'a rule that fits the people it serves' }, title: 'Three Boxes for a Name',
    scene: "The gate machine at the civic steps has two boxes for a name: first and family. A traveller, Cassia Doran Vey, has a three-part name. The machine refuses her ticket. 'NAME NOT VALID.' She has been here an hour.",
    ways: [
      { id: 'rule', kind: 'overcome', method: 'changing the technology', text: "Rewrite the machine's rule card: one free box for the whole name.", needs: { if: { objective: 'civic.sources' }, why: 'the rule cards (finish the sources step of this chapter)' }, result: 'The machine takes the new card. Cassia goes through. Behind her, two more travellers with long names go through too. You did not know they were waiting.', cost: 'The clerks must now sort names by hand at the end of the day. They grumble.' },
      { id: 'hand', kind: 'around', method: 'overcoming technology with a human hand', text: 'Ask the clerk to write Cassia in by hand.', result: 'The clerk writes her in. She thanks you and goes.', cost: 'The next traveller with a long name meets the same machine tomorrow.' },
      { id: 'leave', kind: 'ignore', method: 'being defeated by technology', text: "It is not your machine. Walk on.", result: 'Cassia is still there when you come back. She has cut her name to fit the boxes.', cost: 'The machine is working as designed. That is the problem.' },
    ],
    idea: 'Every system of categories decides who fits. A rule that works for most people can still erase someone. Who designs the boxes has power.' },

  { id: 'two-elders', chapter: 13, map: 'voices.walk', types: ['person'], scale: 'minor', tone: 'funny', serves: 'theme',
    stakes: { lose: 'an old friendship', gain: 'two memories that were both partly right' }, title: 'Two Friends, One Walk',
    scene: "Two old friends, Nan and Bellwether, have not spoken for a week. Each remembers the first lantern walk differently. Nan: 'It was the year of the snow.' Bellwether: 'It was the year after. I remember because my boots were new.' Both are sure.",
    ways: [
      { id: 'ledger', kind: 'overcome', method: 'learning new information', text: "Look for the bell-ringers' ledger, which notes every walk.", result: "The ledger says: the walk was in the year of the snow. But it also says the snow came late, after the new year. So both were right, about different months. Nan and Bellwether laugh until they cry.", cost: 'Nobody won, which annoys both of them a little.' },
      { id: 'both', kind: 'around', method: 'agreeing to disagree', text: 'Record both memories, side by side, with both names.', result: "They read each other's account. Bellwether: 'Hm. Your version has better boots in it.' They walk home together.", cost: 'The date stays open in the archive. A future reader must decide.' },
      { id: 'leave', kind: 'ignore', method: 'they settle it themselves', text: 'It is their quarrel. Leave them to it.', result: 'A week later they are friends again, without your help. Neither will say who gave way.', cost: 'The archive has no record of either memory now.' },
    ],
    idea: 'Two honest memories can disagree. A record can sometimes show that both kept part of the truth. Friendship can survive a disagreement that is never settled.' },

  { id: 'last-lamp', chapter: 13, map: 'voices.quay', types: ['god', 'society'], scale: 'mid', tone: 'mixed', serves: 'arc', leadsTo: 'harrowmere',
    stakes: { lose: 'a place to sit when the check-in desk has closed', gain: 'a welcome that tells people where a keeper will be' },
    title: 'The Lamp We Owe',
    scene: 'Eren has checked in every issued pass and closed the desk. The lamplighters still keep a promise to whoever arrives late. Wren has brought a small lamp and a folded coat. “My father swore the lamp could wait by itself. Then he’d put his coat on and come down here.” Eren turns the closing board towards the quay. “People read lights as directions. Which duty can we keep visible tonight?”',
    ways: [
      { id: 'quay', kind: 'overcome', method: 'keeping two duties visible in the same place', text: 'Hang the small lamp at the quay bench and put Wren’s extra turn on the rota.',
        needs: { if: { all: [{ flag: 'voices.vow.promise', eq: true }, { flag: 'voices.vow.roll', eq: true }, { flag: 'voices.vow.rail', eq: true }, { flag: 'voices.vow.bench', eq: true }] }, why: 'the dedication, return roll and both lamp views' },
        result: 'Wren takes one turn by the bench. A late carrier sits down. Eren’s closing hours remain in view, and the carrier’s name stays off the public slate.',
        cost: 'Wren comes off the evening listening desk for one turn. A reader there waits longer for a recording.' },
      { id: 'room', kind: 'around', method: 'moving the welcome to a place with a keeper', text: 'Put the lamp at the staffed Listening Room seat and pin a clear arrow at the quay bench.',
        needs: { if: { all: [{ flag: 'voices.vow.promise', eq: true }, { flag: 'voices.vow.roll', eq: true }, { flag: 'voices.vow.room', eq: true }] }, why: 'the dedication, return roll and reading-room arrow check' },
        result: 'The lamp goes to the waiting seat inside. A carrier follows the arrow before the reading turn ends and asks the keeper to sit for a while.',
        cost: 'People approaching from the quay have an extra walk. One carrier later puts a mark where the turn is easy to miss.' },
      { id: 'defer', kind: 'ignore', method: 'letting the next keeper take the watch', text: 'Keep this shift’s closing time and put tomorrow’s keeper on the handover.',
        result: 'The lamplighters bank the little lamp. Eren gives the first turn tomorrow to a keeper who volunteered. A visitor who comes late chooses to come back when the bench opens.',
        cost: 'The current keepers go home together. The late visitor has to wait until morning for somebody to sit with.' },
    ],
    idea: 'The roll accounts for Eren’s passes. A person makes good on the promise. The way you set out the light tells a late traveller what they can expect.' },

  { id: 'launch', chapter: 14, map: 'island.dock', types: ['society', 'nature'], scale: 'mid', tone: 'mixed', serves: 'theme',
    stakes: { lose: 'boats caught by a squall, and trust between two groups', gain: 'two kinds of knowing that check each other' }, title: 'When to Launch',
    scene: "The island fishers say: 'When the gulls sit on the water, stay on the land.' The visiting planners say their model shows calm until dusk. The gulls are sitting on the water. Both groups look at you, and both are proud.",
    ways: [
      { id: 'test', kind: 'overcome', method: 'helping both groups see more (a shared revelation)', text: "Test both against last year's harbour log: every day the gulls sat, and every day the model said calm.", result: 'The log shows both are often right. The gulls catch fast squalls that the model misses. The model sees big fronts days before the gulls. The two groups grumble, and then they start to compare notes.', cost: 'A day without fishing, spent with a dusty log. Nobody thanks you at first.' },
      { id: 'agree', kind: 'around', method: 'a compromise between two groups', text: 'Launch only when both the gulls and the model agree.', result: 'Boats stay in today. Fewer days at sea this month, but no boat is caught out.', cost: 'Less fish, and a rule nobody fully understands, so it may be dropped next year.' },
      { id: 'leave', kind: 'ignore', method: 'going separate ways', text: 'Let each group decide for its own boats.', result: 'The fishers stay in. The planners sail. A squall catches them at noon, and the fishers tow them home.', cost: 'Nobody is hurt, but the planners are shaken and the fishers are smug. The two groups trust each other less.' },
    ],
    idea: 'Two communities of knowers can hold different kinds of knowledge about the same sea. Testing both against the same record can turn a contest into a conversation.' },
];

/** Beats outside this list that a crossing can lead to. */
export const CROSSING_BEATS = ['ballad', 'harrowmere'];

export const crossingOf = (id: string): Crossing | undefined => CROSSINGS.find((c) => c.id === id);
export const crossingWay = (flags: Record<string, unknown>, id: string): CrossingWay | undefined => {
  const v = flags[`cross.${id}`];
  return typeof v === 'string' ? crossingOf(id)?.ways.find((w) => w.id === v) : undefined;
};

/** Can the player take this way now? (Ways without a key are always open.) */
export function wayOpen(w: CrossingWay, s: CampaignState): boolean {
  if (!w.needs) return true;
  if (w.needs.companion && s.companion !== w.needs.companion) return false;
  return w.needs.if ? check(w.needs.if, s) : true;
}

/** How the player has met the conflicts so far: counts by kind. Used for the epithet and the epilogue. */
export function crossingStyle(flags: Record<string, unknown>): Record<WayKind, number> {
  const out: Record<WayKind, number> = { overcome: 0, around: 0, ignore: 0 };
  for (const c of CROSSINGS) { const w = crossingWay(flags, c.id); if (w) out[w.kind]++; }
  return out;
}
