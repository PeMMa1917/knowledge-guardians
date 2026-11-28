import type { Condition, DialogueNode, DialogueOption } from '../domain/types';
import lives from './keeper-lives.json';

export function keeperConversations(): DialogueNode[] {
  return Object.entries(lives).flatMap(([speaker, life]) => {
    const key = 'offshift.' + speaker;
    const known: Condition = { flag: key, in: ['cover', 'work'] };
    const options: DialogueOption[] = [];
    for (const [route, text] of [['cover', life.need], ['work', life.method]] as const) {
      // Only the first offer changes trust. A saved visit can always be revised.
      options.push({
        text, if: { not: known }, next: key + '.' + route,
        effects: [{ setFlag: key, value: route }, { relation: speaker, by: 1 }],
      }, {
        text, if: known, next: key + '.' + route, effects: [{ setFlag: key, value: route }],
      });
    }
    return [
      { id: key + '.offer', speaker, text: life.want, historicalLabel: 'fictional-world', options },
      ...(['cover', 'work'] as const).map((route): DialogueNode => ({
        id: key + '.' + route, speaker, text: route === 'cover' ? life.reply : life.belief,
        historicalLabel: 'fictional-world',
        options: [{ text: 'Take leave' }, { text: 'Try the other way of helping', next: key + '.offer' }],
      })),
    ];
  });
}
