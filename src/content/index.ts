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
import ee from './ee-trails.json';
import side from './side-quests.json';
import glossary from './glossary.json';
import questions from './questions.json';
import origins from './origins.json';
import exhibition from './exhibition.json';
import puzzles from './puzzles.json';
import lorelings from './lorelings.json';
import fray from './fray.json';
import rumour from './rumour.json';
import skills from './skills.json';
import clueboard from './clueboard.json';
import memories from './memories.json';
import quarters from './quarters.json';
import dive from './dive.json';
import story from './story.json';
import nile from './m03-nile.json';
import scenes from './prop-scenes.json';
import preservedRecords from './preserved-records.json';
import preserved from './m04-preserved.json';
import reconstruction from './preserved-reconstruction.json';
import observatory from './m05-observatory.json';
import forest from './m06-forest.json';
import observatoryInland from './observatory-inland.json';

export const CONTENT_VERSION = 5;

const parts: any[] = [sources, common, m01, m02, firsts, ee, side, glossary, questions, origins, exhibition, puzzles, skills, lorelings, fray, rumour, clueboard, memories, quarters, dive, story, nile, scenes, preservedRecords, preserved, reconstruction, observatory, observatoryInland, forest];
const keys = ['sources', 'cards', 'exhibits', 'characters', 'dialogue', 'missions', 'hints', 'criteria', 'awards', 'items', 'offers', 'journal',
  'labelKits', 'showdowns', 'threads', 'moments', 'misconceptions', 'portfolio', 'events', 'locks', 'glossary', 'questions', 'origins', 'alcoves', 'puzzles', 'skillDomains', 'skills', 'lorelings', 'lorelingAtlas', 'fray', 'clueBoards', 'memories', 'keepsakes', 'divePrompts', 'diveItems', 'knots', 'clues', 'keepsakeTalks', 'chronicle', 'secrets', 'communities'] as const;

export function buildPack(): ContentPack {
  const pack: any = { id: 'chapter-1', contentVersion: CONTENT_VERSION };
  for (const k of keys) pack[k] = parts.flatMap((p) => p[k] ?? []);
  return pack as ContentPack;
}
