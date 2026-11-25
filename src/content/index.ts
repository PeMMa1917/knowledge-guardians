/**
 * Builds the content pack for the first chapter from the JSON files in this
 * folder. To add content, edit the JSON and run `npm test`: the content tests
 * validate every reference (see docs/CONTENT_GUIDE.md).
 */
import type { ContentPack } from '../domain/types';
import sources from './sources.json';
import common from './common.json';
import m01 from './m01-nexus.json';
import m02 from './m02-aethelgard.json';
import firsts from './firsts.json';

export const CONTENT_VERSION = 2;

const parts: any[] = [sources, common, m01, m02, firsts];
const keys = ['sources', 'cards', 'exhibits', 'characters', 'dialogue', 'missions', 'hints', 'criteria', 'awards', 'items', 'offers', 'journal',
  'labelKits', 'showdowns', 'threads', 'moments', 'misconceptions', 'portfolio', 'events'] as const;

export function buildPack(): ContentPack {
  const pack: any = { id: 'chapter-1', contentVersion: CONTENT_VERSION };
  for (const k of keys) pack[k] = parts.flatMap((p) => p[k] ?? []);
  return pack as ContentPack;
}
