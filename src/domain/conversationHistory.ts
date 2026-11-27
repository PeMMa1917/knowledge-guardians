import type { CampaignState, ContentPack, DialogueNode } from './types';

/** Newest first by first hearing. Returning to a line leaves its original place in the diary. */
export function conversationHistory(
  dialogue: ContentPack['dialogue'] | ReadonlyMap<string, DialogueNode>,
  flags: CampaignState['flags'],
  options: { except?: string; limit?: number } = {},
): DialogueNode[] {
  const byId = 'get' in dialogue ? dialogue : new Map(dialogue.map((node) => [node.id, node]));
  const heard: DialogueNode[] = [];
  const keys = Object.keys(flags);
  const limit = options.limit ?? Infinity;
  for (let i = keys.length - 1; i >= 0 && heard.length < limit; i--) {
    const key = keys[i];
    if (!key.startsWith('node.') || flags[key] !== true) continue;
    const id = key.slice(5);
    if (id === options.except) continue;
    const node = byId.get(id);
    if (node) heard.push(node);
  }
  return heard;
}
