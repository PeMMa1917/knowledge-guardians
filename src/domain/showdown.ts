/**
 * The Showdown system (spec 12.24, PLAY-006).
 *
 * A turn-based confrontation about a claim in a public place. The crowd's
 * trust is the score. Every move's strength comes from authored claim and
 * evidence records, never from a random roll (SHOW-002). Every move returns
 * one short line that says why it worked or failed (SHOW-004). There is no
 * timer (SHOW-003). No outcome is "you lose, try again".
 */
import type { CampaignState, ShowdownOutcome, ShowdownRecord, ShowdownState } from './types';
import { check } from './rules';

export type ShowdownMove =
  | { move: 'claim'; claim: string }
  | { move: 'support'; card: string }
  | { move: 'challenge'; link: string; card: string }
  | { move: 'counter'; card: string }
  | { move: 'qualify' }
  | { move: 'reframe' }
  | { move: 'concede' }
  | { move: 'witness'; witness: string }
  | { move: 'source' }
  | { move: 'attack' }
  | { move: 'shout' }
  | { move: 'present'; card: string }
  | { move: 'rest' };

export const MOVE_HELP: Record<ShowdownMove['move'], string> = {
  claim: 'Put your claim on the board.',
  support: 'Attach evidence under your claim. Strong, dated records add more support.',
  challenge: "Attack the link between the opponent's claim and one of its supports.",
  counter: 'Play one strong case against a general claim. A bold claim can fall to one good counterexample.',
  qualify: 'Lower the force of your own claim. It moves the crowd more slowly, but it is harder to crack.',
  reframe: 'Show that the two claims answer different questions. Both can stand.',
  concede: 'Accept a fair point. You give a little ground, and the crowd trusts you more.',
  witness: 'Call a person you met. What they saw shapes what they can say.',
  source: 'Ask the opponent to show the support under their claim.',
  attack: "Point at the opponent's motive. (The claim itself takes no damage.)",
  shout: 'Repeat your claim, louder. (Volume is not support.)',
  present: 'Present a card at the moment the opponent says something it contradicts.',
  rest: 'Rest your case. The crowd decides.',
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function startShowdown(rec: ShowdownRecord, relaxed = false): ShowdownState {
  return {
    id: rec.id, turn: 0, ...(relaxed ? { relaxed: true } : {}),
    trust: { player: rec.crowd.player, opponent: rec.crowd.opponent },
    claim: null, force: 0, support: 0, used: [], cracked: [],
    opponentForce: rec.opponentClaim.force,
    exposed: false, narrowed: false, reframed: false, sealShown: false,
    openPoint: null, conceded: [], cheapShots: 0,
    log: [{ who: 'crowd', text: rec.intro }],
    outcome: null,
  };
}

export interface MoveResult { state: ShowdownState; signals: string[] }

/** Apply one player move, then the opponent's reply. Pure: returns a new state. */
export function playMove(rec: ShowdownRecord, sd0: ShowdownState, mv: ShowdownMove, s: CampaignState): MoveResult {
  if (sd0.outcome) throw new Error('This Showdown has ended');
  const sd: ShowdownState = structuredClone(sd0);
  const signals: string[] = [];
  const say = (text: string, why?: string) => sd.log.push({ who: 'player', text, why });
  const claim = rec.playerClaims.find((c) => c.id === sd.claim);

  if (mv.move === 'claim') {
    if (sd.claim) throw new Error('You already placed a claim');
    const c = rec.playerClaims.find((x) => x.id === mv.claim);
    if (!c) throw new Error('Unknown claim');
    sd.claim = c.id; sd.force = c.force;
    if (c.signal) signals.push(c.signal);
    sd.trust.player += c.force; // a bold claim gets attention at first
    say(`You claim: "${c.text}"`, c.force >= 4 ? 'A bold claim. It moves the crowd fast, but it has more weak points.' : 'A careful claim. It moves the crowd slowly, but it is hard to crack.');
    sd.trust = { player: clamp(sd.trust.player), opponent: clamp(sd.trust.opponent) };
    return { state: sd, signals };
  }
  if (!claim && mv.move !== 'rest') throw new Error('Put your claim on the board first');
  const testimonyWasOpen = sd.testimony === 'open';
  if (mv.move === 'present' && !testimonyWasOpen) throw new Error('There is no new statement to answer now');

  switch (mv.move) {
    case 'support': {
      if (!s.cards.includes(mv.card)) throw new Error('You do not have that card');
      if (sd.used.includes(mv.card)) throw new Error('That card is already under your claim');
      const sup = claim!.supports.find((x) => x.card === mv.card);
      sd.used.push(mv.card);
      if (sup) {
        sd.support += sup.strength;
        sd.trust.player += sup.strength * (2 + sd.force);
        say(`You place a card under your claim.`, sup.why);
      } else {
        sd.trust.player -= 1;
        say('You place a card under your claim.', 'This card does not bear on your claim. The crowd shrugs.');
      }
      break;
    }
    case 'challenge': {
      if (!s.cards.includes(mv.card)) throw new Error('You do not have that card');
      const link = rec.opponentClaim.links.find((l) => l.id === mv.link);
      if (!link) throw new Error('Unknown link');
      if (sd.cracked.includes(link.id)) throw new Error('That link is already cracked');
      if (link.weakTo.includes(mv.card)) {
        sd.cracked.push(link.id);
        sd.trust.opponent -= 10; sd.trust.player += 4;
        sd.opponentForce = Math.max(1, sd.opponentForce - 1);
        say(`You challenge: "${link.text}"`, link.cracked);
      } else {
        sd.trust.player -= 2;
        say(`You challenge: "${link.text}"`, link.holds);
      }
      break;
    }
    case 'counter': {
      if (!s.cards.includes(mv.card)) throw new Error('You do not have that card');
      const ce = rec.opponentClaim.counterexamples.find((x) => x.card === mv.card);
      if (!ce) { sd.trust.player -= 2; say('You offer a counterexample.', 'This case does not go against the general claim.'); break; }
      if (sd.narrowed) { say('You offer a counterexample.', 'The claim is already narrow. One case does not break a narrow claim.'); break; }
      if (sd.opponentForce >= 4) {
        sd.narrowed = true; sd.opponentForce = 2;
        sd.trust.opponent -= 12; sd.trust.player += 6;
        say('You offer a counterexample.', ce.why);
        sd.log.push({ who: 'opponent', text: `Fine. Then I say only this: "${rec.opponentClaim.narrowed}"` });
      } else {
        say('You offer a counterexample.', 'A qualified claim survives one counterexample.');
      }
      break;
    }
    case 'qualify': {
      if (sd.force <= 1) throw new Error('Your claim cannot be smaller');
      sd.force -= 1; sd.trust.player += 2;
      say('You narrow your claim.', `Force ${sd.force + 1} → ${sd.force}. A smaller claim is harder to crack.`);
      break;
    }
    case 'reframe': {
      if (sd.reframed) throw new Error('You already reframed the question');
      if (!claim!.reframe) { sd.trust.player -= 1; say('You try to reframe the question.', 'Your claim answers the same question as theirs. Reframing does not help here.'); break; }
      sd.reframed = true; sd.trust.player += 6; sd.trust.opponent += 2;
      say('You reframe the question.', claim!.reframe);
      break;
    }
    case 'concede': {
      if (!sd.openPoint) throw new Error('There is no fair point to concede now');
      const fp = rec.fairPoints.find((x) => x.id === sd.openPoint)!;
      sd.conceded.push(fp.id); sd.openPoint = null;
      sd.trust.player += 8; sd.trust.opponent += 2;
      say('You concede a fair point.', fp.concede);
      break;
    }
    case 'witness': {
      const w = rec.witnesses.find((x) => x.id === mv.witness);
      if (!w) throw new Error('Unknown witness');
      if (!check(w.if, s)) throw new Error(`${w.name} has not seen enough to speak here`);
      if (sd.used.includes(`witness:${w.id}`)) throw new Error(`${w.name} has already spoken`);
      sd.used.push(`witness:${w.id}`);
      sd.support += w.strength; sd.trust.player += w.strength * 3;
      sd.log.push({ who: 'witness', text: `${w.name}: "${w.line}"`, why: 'A witness can speak only about what they could see or do.' });
      break;
    }
    case 'source': {
      sd.log.push({ who: 'opponent', text: rec.opponentClaim.sourceReply });
      if (rec.opponentClaim.seal && !sd.sealShown) {
        sd.sealShown = true; sd.trust.opponent -= 8; sd.trust.player += 3;
        say('You ask for the source.', 'A gold seal with nothing under it. The seal is not support.');
      } else {
        say('You ask for the source.', 'The opponent shows what they have. Now you can test each link.');
      }
      break;
    }
    case 'attack': {
      if (sd.openPoint && rec.dodgeSignal) signals.push(rec.dodgeSignal);
      sd.cheapShots += 1; sd.trust.player -= 3;
      say("You point at the opponent's motive.", 'The claim takes no damage. The crowd sees a cheap shot.');
      break;
    }
    case 'shout': {
      if (sd.openPoint && rec.dodgeSignal) signals.push(rec.dodgeSignal);
      sd.trust.player -= 1;
      say('You repeat your claim, louder.', 'Louder is not stronger. The crowd gets bored.');
      break;
    }
    case 'present': {
      if (!s.cards.includes(mv.card)) throw new Error('You do not have that card');
      const t = rec.testimony!;
      if (t.contradictedBy.includes(mv.card)) {
        sd.testimony = 'caught'; sd.trust.opponent -= 12; sd.trust.player += 6;
        say('You present a card: "That is not what the record says."', t.caught);
      } else {
        sd.trust.player -= 1;
        say('You present a card.', t.wrong);
      }
      break;
    }
    case 'rest': {
      sd.outcome = decideOutcome(rec, sd);
      sd.log.push({ who: 'crowd', text: rec.outcomes[sd.outcome].text });
      sd.trust = { player: clamp(sd.trust.player), opponent: clamp(sd.trust.opponent) };
      return { state: sd, signals };
    }
  }

  if (testimonyWasOpen && sd.testimony === 'open') sd.testimony = 'missed';
  opponentTurn(rec, sd);
  sd.turn += 1;
  if (rec.testimony && !sd.testimony && sd.turn === rec.testimony.afterTurn) {
    sd.testimony = 'open';
    sd.log.push({ who: 'opponent', text: rec.testimony.line, why: 'A new statement. Does any card you hold contradict it? You can present it now, on your next move only.' });
  }
  sd.trust = { player: clamp(sd.trust.player), opponent: clamp(sd.trust.opponent) };
  if (!sd.relaxed && sd.turn >= rec.crowd.patience || everyLinkCracked(rec, sd) && (sd.narrowed || sd.sealShown || !rec.opponentClaim.seal)) {
    sd.outcome = decideOutcome(rec, sd);
    sd.log.push({ who: 'crowd', text: rec.outcomes[sd.outcome].text });
  }
  return { state: sd, signals };
}

function everyLinkCracked(rec: ShowdownRecord, sd: ShowdownState): boolean {
  return rec.opponentClaim.links.every((l) => sd.cracked.includes(l.id));
}

function opponentTurn(rec: ShowdownRecord, sd: ShowdownState): void {
  if (!rec.script.length) return;
  const step = rec.script[sd.turn % rec.script.length];
  const opp = (text: string, why?: string) => sd.log.push({ who: 'opponent', text, why });
  switch (step.move) {
    case 'press': {
      const gap = sd.force - sd.support;
      if (gap > 0) {
        sd.trust.player -= gap * 4; sd.trust.opponent += 2;
        opp(step.line, `Your claim says more than its support (force ${sd.force}, support ${sd.support}). It cracks a little.`);
      } else {
        sd.trust.opponent -= 2;
        opp(step.line, `Your claim holds. Its support (${sd.support}) carries its force (${sd.force}).`);
      }
      break;
    }
    case 'seal':
      if (sd.sealShown) opp(step.line, 'The crowd has already seen under the seal. It does nothing now.');
      else { sd.trust.opponent += 6; opp(step.line, 'A famous mark gives a short burst of trust. Nothing is under it yet.'); }
      break;
    case 'shout':
      sd.trust.opponent += 1;
      opp(step.line, 'Louder, not stronger.');
      break;
    case 'point': {
      const fp = rec.fairPoints.find((x) => x.id === step.point);
      if (fp && !sd.conceded.includes(fp.id)) { sd.openPoint = fp.id; opp(fp.text, 'This is a fair point. You can concede it.'); }
      break;
    }
  }
}

export function decideOutcome(rec: ShowdownRecord, sd: ShowdownState): ShowdownOutcome {
  const p = sd.trust.player, o = sd.trust.opponent;
  const allCracked = everyLinkCracked(rec, sd);
  if (!rec.valueShowdown && allCracked && (!rec.opponentClaim.seal || sd.sealShown) && p >= o + 20 && sd.conceded.length === 0) return 'exposed';
  if (rec.canBeWonOver && sd.conceded.length > 0 && sd.cheapShots === 0 && (sd.cracked.length > 0 || sd.reframed) && p >= 55) return 'won-over';
  if ((sd.narrowed || sd.reframed || sd.cracked.length > 0) && sd.force <= 3 && p >= o) return 'narrowed';
  if (Math.abs(p - o) < 12) return 'split';
  if (p > o) return sd.cracked.length > 0 || sd.reframed ? 'narrowed' : 'split';
  return 'lost-ground';
}
