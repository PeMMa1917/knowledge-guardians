/**
 * The Bat Keeper (chapter 4 night scene, C-004). Bat calls are mostly above human hearing (about 9 to
 * 200 kHz, against about 20 kHz for people). A heterodyne detector listens at one setting at a time and
 * turns the call into a sound people can hear. The player tunes it to find the bats feeding at the lamp,
 * hears a catch, then says what we can know of the bat's experience. Facts: src/content/bat-keeper.json.
 */
import data from '../content/bat-keeper.json';

export interface Setting { khz: number; hear: string; bat?: string; name?: string }
export const DIAL = data.dial as Setting[];
export const BUZZ = data.buzz;
export const FOUND_TO_LISTEN = data.found;
export const VIEWS = data.views;

/** Bats found so far, from the settings tried. */
export const batsFound = (tried: number[]): string[] =>
  [...new Set(DIAL.filter((d) => tried.includes(d.khz) && d.bat).map((d) => d.bat!))];
/** The catch can be heard once enough bats are found, and only at the common pipistrelle's setting. */
export const canHearBuzz = (tried: number[], now: number | null): boolean => batsFound(tried).length >= FOUND_TO_LISTEN && now === 45;
