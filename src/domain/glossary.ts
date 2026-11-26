/**
 * Smart glossary (spec 47.10, C1): key words in game text can be tapped.
 * Lumen explains the word in plain English and, where possible, gives an
 * example from the player's own play. Pure rules, no DOM.
 */
import type { CampaignState, Condition, GlossaryEntry } from './types';
import { WORD_CHARACTERS } from './conceptText';

export interface Segment { text: string; term?: string }

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split text into plain parts and glossary terms. Each term is marked once (its first use). */
export function segmentText(text: string, glossary: GlossaryEntry[]): Segment[] {
  const forms = glossary.flatMap((g) => g.match.map((m) => ({ id: g.id, m }))).sort((a, b) => b.m.length - a.m.length);
  if (!forms.length) return [{ text }];
  const byForm = new Map(forms.map(({ id, m }) => [m.toLowerCase(), id]));
  const re = new RegExp(`(^|[^${WORD_CHARACTERS}])(${forms.map((f) => esc(f.m)).join('|')})(?![${WORD_CHARACTERS}])`, 'giu');
  const out: Segment[] = [];
  const used = new Set<string>();
  let last = 0;
  for (const hit of text.matchAll(re)) {
    const [prefix, form] = hit.slice(1);
    const id = byForm.get(form.toLowerCase());
    if (!id || used.has(id)) continue;
    const start = hit.index + prefix.length;
    used.add(id);
    if (start > last) out.push({ text: text.slice(last, start) });
    out.push({ text: form, term: id });
    last = start + form.length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/** Remember only this campaign's actions. Offer one starting example until a memory is earned. */
export function examplesFor(entry: GlossaryEntry, s: CampaignState, check: (c: Condition | undefined) => boolean): string[] {
  const earned = entry.examples.filter((example) => example.if && check(example.if));
  const fallback = entry.examples.find((example) => !example.if);
  const visible = earned.length ? earned : fallback ? [fallback] : [];
  return visible.map(({ text }) => text.replace(/\{flag:([\w.-]+)\}/g, (_, f: string) => String(s.flags[f] ?? '…')));
}

export function exampleFor(entry: GlossaryEntry, s: CampaignState, check: (c: Condition | undefined) => boolean): string {
  return examplesFor(entry, s, check)[0] ?? '';
}
