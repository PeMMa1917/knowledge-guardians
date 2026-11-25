/**
 * Sound captions (spec 21 accessibility): a short text line for each sound, so a
 * player who cannot hear (or plays muted) still knows what happened. Captions show
 * in a small box at the bottom centre. They do not depend on volume: the event still
 * happens when the sound is off. Pure parts (captionFor, CaptionLog) are tested.
 */
export const CAPTIONS: Record<string, string> = {
  'sfx.click': 'Click',
  'sfx.open': 'Window opens',
  'sfx.book': 'Book opens',
  'sfx.page': 'Page turns',
  'sfx.coins': 'Coins clink',
  'sfx.coin': 'Coin clinks',
  'sfx.pickup': 'Item picked up',
  'sfx.metal': 'Metal rings',
  'sfx.sparkle': 'Sparkle',
  'sfx.lock': 'Lock clicks',
  'sfx.award': 'Fanfare',
  'sfx.complete': 'Success chime',
  'amb.forge': 'Forge hammer rings',
  'amb.chime': 'Soft chimes',
  'amb.moth': 'Glimmermoth hums and glows',
  'music.archive': 'Music: quiet, mysterious',
  'music.town': 'Music: warm town tune',
  'music.title': 'Music: gentle lullaby',
  'voice.player': 'You make a short sound',
};

/** Caption text for a sound key; `who` names the speaker for talk sounds. Null if the sound has no caption. */
export function captionFor(key: string, who?: string): string | null {
  if (key === 'voice' && who) return `${who} talks`;
  if (key === 'amb.forge' && who) return `${CAPTIONS[key]} (${who})`;
  return CAPTIONS[key] ?? null;
}

/** Keeps captions short and calm: the same caption is not shown again within `gap` ms, and at most `max` lines show. */
export class CaptionLog {
  lines: { text: string; at: number }[] = [];
  private last = new Map<string, number>();
  constructor(private max = 3, private gap = 4000, private life = 3500) {}
  add(text: string, now: number): boolean {
    const prev = this.last.get(text);
    if (prev !== undefined && now - prev < this.gap) return false;
    this.last.set(text, now);
    this.lines = [...this.lines.filter((l) => l.text !== text), { text, at: now }].slice(-this.max);
    return true;
  }
  visible(now: number): string[] {
    this.lines = this.lines.filter((l) => now - l.at < this.life);
    return this.lines.map((l) => l.text);
  }
}

const log = new CaptionLog();
let box: HTMLElement | null = null;
let timer: number | undefined;
let enabled = () => false;

/** Called once at start-up with a function that reads the current setting. */
export function setupCaptions(isOn: () => boolean): void { enabled = isOn; }

function render(): void {
  if (typeof document === 'undefined') return;
  const now = Date.now();
  const lines = log.visible(now);
  if (!box) {
    box = document.createElement('div');
    box.id = 'captions';
    box.setAttribute('aria-hidden', 'true'); // screen readers get the same events from toasts and text
    document.body.append(box);
  }
  box.replaceChildren(...lines.map((t) => { const d = document.createElement('div'); d.className = 'caption'; d.textContent = `[${t}]`; return d; }));
  box.hidden = lines.length === 0;
  if (timer) window.clearTimeout(timer);
  if (lines.length) timer = window.setTimeout(render, 500);
}

/** Show the caption for a sound, if captions are on. */
export function caption(key: string, who?: string): void {
  if (!enabled()) return;
  const text = captionFor(key, who);
  if (!text || !log.add(text, Date.now())) return;
  render();
}
