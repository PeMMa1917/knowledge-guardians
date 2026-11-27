import type { CampaignState } from './types';

export const MOON_TUNE = 'spare-moon.tune';
export const MOON_INSTRUMENT = 'spare-moon-music';
const names = { l: 'low', h: 'high', r: 'rest' } as const;
export type MoonBeat = keyof typeof names;

export function validMoonTune(value: unknown): value is string {
  return typeof value === 'string' && /^[lhr]{4}$/.test(value);
}
export function moonBeatNames(tune: string): string[] {
  return [...tune].map((beat) => names[beat as MoonBeat]);
}
export function moonPerformance(state: CampaignState) {
  const flags = state.flags;
  switch (state.mapId) {
    case 'nexus.bell-loft':
      return {
        title: 'The Bootlace Fiddle',
        player: 'Noll taught the old strings a trick. Four beats, and their echo leaves room for a caller.',
        reply: 'rlhr',
      };
    case 'nexus.archive':
      return flags['spare-moon.noll'] === 'hall'
        ? {
            title: 'The Hall Conductors',
            player: 'The children hold their spoons up. Play your four beats. They want the last word.',
            reply: 'hhrr',
          }
        : undefined;
    case 'nexus.spare-moon':
      return flags['spare-moon.noll'] === 'home'
        ? {
            title: 'Spoons at the Spare Moon',
            player: 'A child steadies two spoons on the bench. Give them four beats and wait for their reply.',
            reply: 'lrrh',
          }
        : undefined;
    case 'aethelgard.emberford':
      return flags['spare-moon.auda'] === 'road'
        ? {
            title: 'A Song on the Bread Tin',
            player:
              'Auda knows the tune by feel. She holds a bread tin against your wrist so you can feel her answer.',
            reply: 'rhll',
          }
        : undefined;
    case 'stage.rehearsal':
      if (!flags['first-clap.bow']) return;
      return flags['first-clap.bow'] === 'light'
        ? {
            title: 'The House Takes a Bow',
            player:
              'At half light Hari conducts with his folded programme. Play a four-beat call for the people in the back row. They have practised an answer.',
            reply: 'rhlh',
          }
        : {
            title: 'One Seat in the Dark',
            player:
              'A small hand rests on the ribbon. Play a four-beat call on the footlights. The old seat and two small shoes have a part of their own.',
            reply: 'rrlh',
          };
    case 'council.hall': {
      if (!flags['ending.council']) return;
      switch (flags['spare-moon.night']) {
        case 'bell':
          return {
            title: 'The Last Night of the Hearing',
            player:
              'A pillowcase hangs from the public rail. Inside are two spoons and a note from the man who opened his window. Play your part. He remembers the street’s answer.',
            reply: 'hhlr',
          };
        case 'cord':
          return {
            title: 'The Last Night of the Hearing',
            player:
              'A strip of blue wool brushes your wrist. The woman who once went in with her coat over her face has come to hear the Council. She would like to play the reply herself.',
            reply: 'rlrh',
          };
        case 'bench':
          return {
            title: 'The Last Night of the Hearing',
            player:
              'There is flour on the Council rail. The traveller who kneaded bread on the step brings two rolls, two spoons and the rhythm Ket taught him in the small hours.',
            reply: 'lrll',
          };
      }
    }
  }
}

export function moonScore(tune: string, offset = 0) {
  return [...tune].flatMap((beat, i) =>
    beat === 'r' ? [] : [{ f: beat === 'l' ? 293.66 : 440, at: offset + i, beats: 0.65 }],
  );
}
