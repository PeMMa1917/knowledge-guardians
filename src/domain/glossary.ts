/**
 * Smart glossary (spec 47.10, C1): key words in game text can be tapped.
 * Lumen explains the word in plain English and, where possible, gives an
 * example from the player's own play. Pure rules, no DOM.
 */
import type { CampaignState, Condition, GlossaryEntry } from './types';

export interface Segment { text: string; term?: string }

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split text into plain parts and glossary terms. Each term is marked once (its first use). */
export function segmentText(text: string, glossary: GlossaryEntry[]): Segment[] {
  const forms = glossary.flatMap((g) => g.match.map((m) => ({ id: g.id, m }))).sort((a, b) => b.m.length - a.m.length);
  if (!forms.length) return [{ text }];
  const re = new RegExp(`\\b(${forms.map((f) => esc(f.m)).join('|')})\\b`, 'gi');
  const out: Segment[] = [];
  const used = new Set<string>();
  let last = 0;
  for (const hit of text.matchAll(re)) {
    const id = forms.find((f) => f.m.toLowerCase() === hit[0].toLowerCase())!.id;
    if (used.has(id)) continue;
    used.add(id);
    if (hit.index! > last) out.push({ text: text.slice(last, hit.index) });
    out.push({ text: hit[0], term: id });
    last = hit.index! + hit[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** The first example whose condition holds, with {flag:name} replaced by the flag's value. */
export function exampleFor(entry: GlossaryEntry, s: CampaignState, check: (c: Condition | undefined) => boolean): string {
  const ex = entry.examples.find((e) => check(e.if));
  if (!ex) return '';
  return ex.text.replace(/\{flag:([\w.-]+)\}/g, (_, f: string) => String(s.flags[f] ?? '…'));
}
