import type { AdventureDiary, DiaryPortfolioWriting } from './types';

/** Update only writing explicitly entered in the current campaign. */
export function setDiaryPortfolioWriting(
  diary: AdventureDiary, entry: { id: string; title: string }, text: string, at: string, mapId: string, draft = false,
): AdventureDiary {
  const previous = diary.portfolioWriting[entry.id];
  if (previous?.text === text && (previous.draft === true) === draft) return diary;
  if (!text && !draft && !previous) return diary;
  const portfolioWriting = { ...diary.portfolioWriting };
  if (text || draft) {
    const writing: DiaryPortfolioWriting = { title: entry.title, text, at, mapId };
    if (draft) writing.draft = true;
    portfolioWriting[entry.id] = writing;
  } else {
    delete portfolioWriting[entry.id];
  }
  return { ...diary, portfolioWriting };
}
