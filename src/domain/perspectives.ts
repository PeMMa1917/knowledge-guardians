import type { CampaignState, ContentPack, Keepsake } from './types';
import { carriesSpecimen, PERSPECTIVE_FLAG, specimenFromTool } from './specimenGear';

export { PERSPECTIVE_FLAG } from './specimenGear';
export type PerspectiveTool = Keepsake & { equip: NonNullable<Keepsake['equip']> };

export function perspectiveTools(pack: ContentPack): PerspectiveTool[] {
  return (pack.keepsakes ?? []).filter((k): k is PerspectiveTool => !!k.equip);
}

export function ownedPerspective(pack: ContentPack, s: CampaignState, id: string): PerspectiveTool | undefined {
  if (s.flags[`keepsake.${id}`] !== true) return;
  const specimen = specimenFromTool(id);
  if (specimen && !carriesSpecimen(s, specimen)) return;
  return perspectiveTools(pack).find((tool) => tool.id === id);
}

export function activePerspective(pack: ContentPack, s: CampaignState): PerspectiveTool | undefined {
  const id = s.flags[PERSPECTIVE_FLAG];
  return typeof id === 'string' ? ownedPerspective(pack, s, id) : undefined;
}
