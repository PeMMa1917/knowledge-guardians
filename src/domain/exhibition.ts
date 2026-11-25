/**
 * Exhibition Hall alcove (spec SYM-001, Craft Fray: Symbol Mirage, Checklist Golem,
 * So-What Sphinx). The player puts one object in an alcove, says what knowledge it
 * shows in the world, and then says what follows. Pure rules, no DOM.
 *  - A symbol (glasses for "perspective") shows no knowledge in the world: the Symbol Mirage appears.
 *  - A list of concept names with no use: the Checklist Golem ticks them, then the ticks fall off.
 *  - An answer with no consequence: the So-What Sphinx asks "So what?" again.
 * Every real object can complete the alcove, with the same credit (no hidden right answer).
 */
import type { AlcoveRecord } from './types';

export type PlaceResult = { result: 'mirage' | 'not-object' | 'lit'; text: string };
export type LinkResult = { result: 'golem' | 'generic' | 'ok'; text: string };
export type ImplyResult = { result: 'sphinx' | 'ok'; text: string };

export function placeInAlcove(rec: AlcoveRecord, item: string): PlaceResult {
  const sym = rec.symbols.find((x) => x.id === item);
  if (sym) return { result: 'mirage', text: sym.mirage };
  const obj = rec.objects.find((x) => x.card === item);
  if (obj) return { result: 'lit', text: obj.lit };
  return { result: 'not-object', text: rec.notObject };
}

export function linkAlcove(rec: AlcoveRecord, card: string, index: number): LinkResult {
  const obj = rec.objects.find((x) => x.card === card);
  const l = obj?.links[index];
  if (!l) return { result: 'generic', text: rec.notObject };
  return { result: l.kind === 'specific' ? 'ok' : l.kind === 'checklist' ? 'golem' : 'generic', text: l.response };
}

export function implyAlcove(rec: AlcoveRecord, card: string, index: number): ImplyResult {
  const obj = rec.objects.find((x) => x.card === card);
  const i = obj?.implications[index];
  if (!i) return { result: 'sphinx', text: 'So what?' };
  return { result: i.ok ? 'ok' : 'sphinx', text: i.response };
}
