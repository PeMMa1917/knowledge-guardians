import { SERVICE_BOUNDARIES, SERVICE_CUTS, servicePlan, type ServiceBoundary } from '../domain/boundaryBoard';
import type { Condition } from '../domain/types';
import type { Interactable } from './types';

const started: Condition = { flag: 'boundary.civic.started', eq: true };
const compared: Condition = { objective: 'boundary.civic.compare' };
const signed: Condition = { objective: 'boundary.civic.post' };
const received: Condition = { flag: 'boundary.water.received', eq: true };
const delivered: Condition = { flag: 'boundary.water.checked', eq: true };

const posted = (seam: ServiceBoundary): Condition => ({ flag: 'boundary.civic.choice', eq: seam });
const names = (rows: readonly { label: string }[]): string => rows.map(({ label }) => label).join(', ');

function scene(id: string, node: string, x: number, y: number, label: string, art: string, visibleIf: Condition): Interactable {
  return { id, kind: 'scene', node, x, y, w: 1, h: 1, label, art, visibleIf, walkThrough: true };
}

function sign(id: string, x: number, y: number, label: string, art: string, text: string, visibleIf: Condition): Interactable {
  return { id, kind: 'sign', x, y, w: 1, h: 1, label, art, text, visibleIf, walkThrough: true };
}

export const CIVIC_BOUNDARY: Interactable[] = [
  scene('boundary-civic-start', 'boundary.civic.start', 23, 14, 'Lin and the pegged night requests', 'civic.ledger',
    { all: [{ objective: 'civic.finish' }, { not: started }] }),
  { id: 'boundary-civic-board', kind: 'fieldgame', game: 'service-boundary', x: 24, y: 14, w: 1, h: 1,
    label: 'the night map with a moveable dividing line', art: 'civic.console', walkThrough: true, visibleIf: started },
  scene('boundary-civic-post', 'boundary.civic.post', 23, 14, 'the first-cart order for the Water Commons', 'civic.notice',
    { all: [compared, { not: signed }] }),
  ...SERVICE_BOUNDARIES.map((seam) => {
    const { first, delivered } = servicePlan(seam);
    return sign('boundary-civic-signed-' + seam, 23, 14, 'the signed first-cart route', 'preserved.folder',
      SERVICE_CUTS[seam].name + ' line. First cart to the ' + first + ' bank. First-round stops: ' + names(delivered) + '. The original nine requests stay on the map.',
      posted(seam));
  }),
];

export const COUNCIL_BOUNDARY: Interactable[] = [
  scene('boundary-water-receive', 'boundary.water.receive', 13, 10, 'Sena’s tray for the signed night route', 'preserved.folder',
    { all: [{ item: 'item.boundary.plan' }, { not: received }] }),
  ...SERVICE_BOUNDARIES.map((seam) => {
    const slips = servicePlan(seam).remaining.map(({ label, x, y, wait }) => `${label} (square ${x}, ${y}, waited ${wait} min)`);
    return sign('boundary-water-pending-' + seam, 13, 10, 'the remaining requests at the council tray', 'preserved.display-records',
      'NEXT CART. ' + slips.join('. ') + '.', { all: [posted(seam), received] });
  }),
];

function receivingRoute(seam: ServiceBoundary, x: number, y: number): Interactable[] {
  const plan = servicePlan(seam);
  return [
    scene('boundary-water-cart-' + plan.first, 'boundary.water.cart.' + plan.first, x, y,
      'the ' + plan.first + ' bank’s first cart', 'water.waypost', { all: [posted(seam), received, { not: delivered }] }),
    sign('boundary-water-receipt-' + plan.first, x, y,
      'the signed receipt for the ' + plan.first + ' bank', 'water.notice',
      'FIRST CART SERVED. ' + names(plan.delivered) + '. The crew took four requests. The other five stay on Sena’s next-cart list.',
      { all: [posted(seam), delivered] }),
  ];
}

export const UPPER_BOUNDARY = receivingRoute('bridge', 8, 14);
export const LOWER_BOUNDARY = receivingRoute('ditch', 26, 9);
