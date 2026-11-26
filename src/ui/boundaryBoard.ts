import type { GameController } from '../app/controller';
import { CART_CAPACITY, SERVICE_BOUNDARIES, SERVICE_CUTS, WATER_REQUESTS, servicePlan, type ServiceBoundary } from '../domain/boundaryBoard';
import { clear, h } from './dom';
import './boundaryBoard.css';

function map(seam: ServiceBoundary | undefined): HTMLCanvasElement {
  const picture = document.createElement('canvas');
  picture.width = 300;
  picture.height = 144;
  picture.setAttribute('role', 'img');
  picture.setAttribute('aria-label', seam
    ? 'The same nine requests with a dividing line at ' + SERVICE_CUTS[seam].name + '. A complete list follows.'
    : 'Nine fixed requests from upper bank to lower bank. A complete list follows.');
  const g = picture.getContext('2d')!;
  const x = (column: number) => 18 + 27 * column;
  const cut = seam && x(SERVICE_CUTS[seam].line);
  g.fillStyle = '#273f49';
  g.fillRect(0, 0, picture.width, picture.height);
  if (cut) {
    g.fillStyle = '#46584c';
    g.fillRect(0, 0, cut, picture.height);
  }
  g.strokeStyle = '#76909a';
  g.lineWidth = 1;
  for (const y of [34, 66, 98, 130]) {
    g.beginPath();
    g.moveTo(9, y);
    g.lineTo(291, y);
    g.stroke();
  }
  g.fillStyle = '#fff5d9';
  g.font = '11px sans-serif';
  g.fillText('Upper bank', 10, 19);
  g.fillText('Lower bank', 229, 19);
  if (cut) {
    g.strokeStyle = '#ffcf77';
    g.lineWidth = 3;
    g.setLineDash([6, 4]);
    g.beginPath();
    g.moveTo(cut, 26);
    g.lineTo(cut, 138);
    g.stroke();
    g.setLineDash([]);
  }
  WATER_REQUESTS.forEach((request, index) => {
    const cx = x(request.x), cy = 26 + 18 * request.y;
    g.fillStyle = '#fff5d9';
    g.beginPath();
    g.arc(cx, cy, 8, 0, 2 * Math.PI);
    g.fill();
    g.fillStyle = '#24303a';
    g.fillText(String(index + 1), cx - 3, cy + 4);
  });
  return picture;
}

export function serviceBoundaryPanel(controller: GameController): HTMLElement {
  const panel = h('div', { class: 'service-boundary' });
  const output = h('div', {});
  const forecast = h('p', { role: 'status' });
  const last = controller.state.flags['boundary.civic.last'];
  let seam: ServiceBoundary | undefined = last === 'ditch' || last === 'bridge' ? last : undefined;
  const buttons = SERVICE_BOUNDARIES.map((id) => {
    const control = h('button', { type: 'button', onclick: () => {
      const events = controller.dispatch({ type: 'SetServiceBoundary', seam: id });
      if (!events.some(({ kind }) => kind === 'error')) {
        seam = id;
        render();
      }
    } }, 'Use the ' + SERVICE_CUTS[id].name.toLowerCase() + ' line');
    return { id, control };
  });
  panel.append(h('p', {}, 'Nine slips from one night shift. Move the dividing line and see how grouping changes which bank goes first. The cart fits ' + CART_CAPACITY + ' requests.'),
    h('div', { class: 'row' }, ...buttons.map(({ control }) => control)), output, forecast,
    h('details', {}, h('summary', {}, 'The nine original request slips'), h('ol', {},
      ...WATER_REQUESTS.map(({ label, x, y, wait }) => h('li', {}, label + ' · map square ' + x + ', ' + y + ' · waited ' + wait + ' min')))));

  function render(): void {
    clear(output);
    output.append(map(seam));
    for (const { id, control } of buttons) control.setAttribute('aria-pressed', String(id === seam));
    if (!seam) {
      forecast.textContent = 'Choose a line to see the two bank totals.';
      return;
    }
    const plan = servicePlan(seam);
    output.append(h('dl', { class: 'boundary-reading' },
      h('dt', {}, 'Upper bank'), h('dd', {}, plan.upper.requests.length + ' requests · average wait ' + plan.upper.average + ' min'),
      h('dt', {}, 'Lower bank'), h('dd', {}, plan.lower.requests.length + ' requests · average wait ' + plan.lower.average + ' min')));
    forecast.textContent = 'On this line the ' + plan.first + ' bank has the longer average wait. First-cart stops: '
      + plan.delivered.map(({ label }) => label).join(', ') + '.';
  }

  render();
  return panel;
}
