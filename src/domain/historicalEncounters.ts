import { ownsSpecimen } from './specimenGear';
import type { CampaignState, ContentPack, EvidenceCard } from './types';

type Biography = EvidenceCard & { person: NonNullable<EvidenceCard['person']> };

export function isHistoricalBiography(card: EvidenceCard): card is Biography {
  return !!card.person && card.sources.length > 0
    && card.historicalLabel !== 'fictional-world' && card.historicalLabel !== 'imagined-alternate';
}

export const biographyReadFlag = (card: string): string => `read.biography.${card}`;

export function historicalEncounters(pack: ContentPack, state: CampaignState) {
  const speakers = new Set(pack.dialogue.filter(({ id }) => state.flags[`node.${id}`] === true).map(({ speaker }) => speaker));
  return {
    peopleMet: pack.characters.filter(({ id, mode }) => mode === 'historical' && (speakers.has(id) || state.flags['lamplight.met.' + id] === true)),
    biographiesRead: pack.cards.filter(isHistoricalBiography)
      .filter(({ id }) => state.cards.includes(id) && state.flags[biographyReadFlag(id)] === true),
    exhibitsInspected: pack.exhibits.filter(({ id, historicalLabel, specimen }) => historicalLabel === 'documented'
      && (state.flags[`inspected.${id}`] === true || (specimen && ownsSpecimen(state, specimen.key)))),
  };
}
