/**
 * The Undercroft (Mika 2026-11-25: dungeons, traps, bosses). Under Elsbet's study is her records
 * vault. Records that nobody checked for ten years fed a Fray: the Hollow Archivist. Three fallacy
 * seals block the corridor; each one speaks a bad argument, and the player opens it by naming the
 * flaw. The 'boss' changes its argument in each of three phases. A wrong answer is explained and the
 * player tries again (no damage, no fail state; calm). Fictional; no real historical claims.
 * TOK link: bandwagon, false dilemma, cherry-picking, appeal to authority, confirmation bias, straw man.
 */
export interface Choice { text: string; ok: boolean; why: string }
export interface Seal { id: string; fray: string; name: string; says: string; options: Choice[] }
export interface Phase { fray: string; says: string; options: Choice[] }

export const SEALS: Seal[] = [
  { id: 'many', fray: 'bandwagon-beetles', name: 'The seal of many voices',
    says: "'Everyone in the market says this door cannot be opened. Hundreds of people! So it cannot be opened. Turn back.'",
    options: [
      { text: 'How many people say a thing is not evidence that it is true.', ok: true, why: 'Yes: that is the bandwagon error. Many voices can repeat one guess. Ask what any of them checked.' },
      { text: 'The market people are fools, so they are wrong.', ok: false, why: 'That attacks the people, not the claim. They may be right or wrong; you have not checked yet.' },
      { text: 'Hundreds of people cannot all be wrong. Turn back.', ok: false, why: 'They can, if they all heard the same story and none of them tried the door.' },
    ] },
  { id: 'twogates', fray: 'twin-gate-hound', name: 'The seal of two gates',
    says: "'Either you trust every record in this vault, or you trust none of them. Choose one gate!'",
    options: [
      { text: 'There are more than two choices: I can check each record and trust some more than others.', ok: true, why: 'Yes: that is a false dilemma. Most real choices have more than two doors.' },
      { text: 'Then I trust none of them.', ok: false, why: 'You walked through one of the two gates it gave you. Is there really no third way?' },
      { text: 'Then I trust all of them. Elsbet kept them.', ok: false, why: 'You picked a gate it offered you, and you leaned on who kept the records. Look for a third way.' },
    ] },
  { id: 'chosen', fray: 'cherry-picker-crow', name: 'The seal of chosen pages',
    says: "'Here are three records of floods when the bridge held. So the bridge always holds. Why read any more?'",
    options: [
      { text: 'Three records that agree are enough.', ok: false, why: 'Enough for what? You have not seen the records it left out.' },
      { text: 'It shows only the records that agree. I want to see the others too.', ok: true, why: 'Yes: that is cherry-picking. The flood post and Noa\'s book show nights when the water went over. Ask what was left out.' },
      { text: 'Floods are rare, so it does not matter.', ok: false, why: 'Rare is not never. And the question is what the records show, all of them.' },
    ] },
];

export const BOSS = {
  id: 'hollow-archivist',
  name: 'The Hollow Archivist',
  intro: "A shape of dust and loose pages rises from the shelves. It has no face, only a label where a face should be: KEEPER. 'Ten years,' it whispers. 'Ten years, and nobody asked. I grew in the quiet.'",
  phases: [
    { fray: 'glimmer-knight', says: "'I am the Keeper. A record is true because I keep it. Who are you to ask how it was made?'",
      options: [
        { text: 'Ask: who wrote this record, when, and how did they know?', ok: true, why: 'The label on its face flickers. A keeper is not a source. The record must show how it was made.' },
        { text: 'Shout that it is wrong, louder and louder.', ok: false, why: 'The pages flutter and grow. Noise is not a reason. Ask a question instead.' },
        { text: 'Bow: a keeper must know best.', ok: false, why: 'The Archivist grows taller. Being in charge of records is not the same as knowing they are right.' },
      ] },
    { fray: 'confirmling', says: "'Very well. I keep only the pages that agree with what I already know. The others, I burn. Look how well they all agree!'",
      options: [
        { text: 'Agreement is good. A tidy archive is a true archive.', ok: false, why: 'The pages close around you. They agree because the others were burned.' },
        { text: 'Ask for the pages that disagree, and ask what would show you are wrong.', ok: true, why: 'Pages fall from its arms. Looking for what would show you wrong is how you stop seeing only what you expect.' },
        { text: 'Burn the pages that agree, then.', ok: false, why: 'That is the same error, turned around. Keep all the pages, and weigh them.' },
      ] },
    { fray: 'strawman', says: "'Your Elsbet wrote \"check every claim\". So she thought nobody can ever be trusted! What a sad, foolish Guardian.'",
      options: [
        { text: 'Agree: she was too doubtful.', ok: false, why: 'You answered a claim she did not make. Read what she wrote.' },
        { text: 'Say what she actually wrote, then answer that: checking a claim is not the same as trusting nobody.', ok: true, why: 'The label falls from its face. Under it there is only dust, and a small brass lamp. A straw man is easy to knock down; it was never the real argument.' },
        { text: 'Attack the Archivist for being made of dust.', ok: false, why: 'What it is made of does not answer what it said. Answer the argument.' },
      ] },
  ] as Phase[],
  end: "The dust settles. The vault is only a vault again: shelves, boxes, and ten years of records waiting to be read. On the last shelf is Elsbet's index of the vault, in her small hand. The first line says: 'Every record here can be wrong. That is why they are kept where anyone can check them.'",
};

type Flags = Record<string, unknown>;
export const sealOpen = (f: Flags, id: string): boolean => f[`trap.${id}.open`] === true;
export const allSealsOpen = (f: Flags): boolean => SEALS.every((x) => sealOpen(f, x.id));
export const bossPhase = (f: Flags): number => Number(f[`boss.${BOSS.id}.phase`] ?? 0);
export const bossDone = (f: Flags): boolean => f['undercroft.done'] === true;
