import type { CampaignState, Effect } from './types';

export const RELAY_CHANNELS = ['bell', 'trace'] as const;
export const RELAY_CLIPS = ['record', 'detail'] as const;
export const RELAY_WEATHER = ['still', 'gust'] as const;

export type RelayChannel = typeof RELAY_CHANNELS[number];
export type RelayClip = typeof RELAY_CLIPS[number];
export type RelayWeather = typeof RELAY_WEATHER[number];
type RelayFlags = CampaignState['flags'];

export function weaveLine(first: RelayClip, weather: RelayWeather): { arrived: RelayClip[]; held: RelayClip[] } {
  const second = first === 'record' ? 'detail' : 'record';
  return weather === 'still' ? { arrived: [first, second], held: [] } : { arrived: [first], held: [second] };
}

export function relayState(key: string, flags: RelayFlags) {
  const loaded = RELAY_CLIPS.find((clip) => flags[`${key}.loaded`] === clip);
  const delivery = RELAY_CHANNELS.flatMap((channel) => RELAY_CLIPS.map((first) => ({ channel, first })))
    .find(({ channel, first }) => flags[`${key}.sent`] === `${channel}-${first}`);
  const compared = !!loaded && RELAY_WEATHER.every((weather) => flags[`${key}.trial.${loaded}.${weather}`] === true);
  const callback = flags[`${key}.callback`] === true;
  const checked = flags[`${key}.checked`] === true;
  return { loaded, delivery, compared, callback, checked };
}

type RelayAction =
  | { type: 'thread'; first: RelayClip }
  | { type: 'trial'; weather: RelayWeather }
  | { type: 'send'; channel: RelayChannel }
  | { type: 'request-missing' }
  | { type: 'reunite'; channel: RelayChannel };

/** Keep each step atomic. A bell delivery needs a callback; a trace arrives with both clips. */
export function relayMove(key: string, flags: RelayFlags, action: RelayAction): Extract<Effect, { setFlag: string }> | null {
  const state = relayState(key, flags);
  switch (action.type) {
    case 'thread':
      return state.delivery ? null : { setFlag: `${key}.loaded`, value: action.first };
    case 'trial':
      return state.delivery || !state.loaded ? null : { setFlag: `${key}.trial.${state.loaded}.${action.weather}`, value: true };
    case 'send':
      return state.delivery || !state.compared ? null : { setFlag: `${key}.sent`, value: `${action.channel}-${state.loaded}` };
    case 'request-missing':
      return state.delivery?.channel !== 'bell' || state.callback || state.checked ? null : { setFlag: `${key}.callback`, value: true };
    case 'reunite':
      return state.checked || state.delivery?.channel !== action.channel || (action.channel === 'bell' && !state.callback)
        ? null : { setFlag: `${key}.checked`, value: true };
  }
}
