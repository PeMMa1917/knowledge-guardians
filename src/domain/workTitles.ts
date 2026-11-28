import forms from '../content/world-work/forms.json';
import type { Ticket } from './worldWork';

const hookTitles = [
  'Supper for Two', 'The Paid Signature', 'A Price over a Word', 'Where the Tune Stops',
  'The Smooth Corner', 'A Ring in the Dust', 'The Extra Notch', 'An Engraving in the Drawer',
  'Dry Paper Feet', 'The Sixth Drawing', 'The Dropped Key', 'A Darn in the Scarf',
  'Under the Board', 'Three Cracks in Ash', 'A Breath in the Notice', 'The Receipt and the Goat',
  'A Row of Turning Chairs', 'The Key on the Belt', 'The Reversed Date', 'The Porter’s Pocket',
  'A Name off the Guest List', 'The Returning Shortcut', 'Paper Stems', 'A Brass Bird’s Hiccup',
];

// Add context only where two titles would otherwise be indistinguishable.
// Always build this index on the full shelf so a search or invitation keeps its normal title.
export function workTitles(group: number, tickets: Ticket[]): Map<number, string> {
  const titles = new Map(tickets.map(t => [t[0], forms[group][t[1]] + ' · ' + t[4]]));
  for (const part of [(t: Ticket) => t[3], (t: Ticket) => t[5], (t: Ticket) => hookTitles[(t[13] - 1) % hookTitles.length]]) {
    const seen = new Set<string>(), collisions = new Set<string>();
    for (const title of titles.values()) {
      if (seen.has(title)) collisions.add(title);
      seen.add(title);
    }
    if (!collisions.size) break;
    for (const t of tickets) {
      const current = titles.get(t[0])!;
      if (collisions.has(current)) titles.set(t[0], current + ' · ' + part(t));
    }
  }
  return titles;
}
