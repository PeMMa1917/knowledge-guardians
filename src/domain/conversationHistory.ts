import type { CampaignState, ContentPack, DialogueNode } from './types';

/** Read-only history in first-heard order, using the same marks that support returning dialogue. */
export function conversationHistory(dialogue: ContentPack['dialogue'], flags: CampaignState['flags']): DialogueNode[] {
  const byId = new Map(dialogue.map((node) => [node.id, node]));
  const heard: DialogueNode[] = [];
  for (const [flag, value] of Object.entries(flags)) {
    if (value !== true || !flag.startsWith('node.')) continue;
    const node = byId.get(flag.slice(5));
    if (node) heard.push(node);
  }
  return heard.reverse();
}
