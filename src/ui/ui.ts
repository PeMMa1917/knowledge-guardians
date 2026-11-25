/**
 * The HTML interface laid over the game canvas: menus, HUD, dialogue,
 * inspection, evidence board, minigames, journal and settings.
 *
 * Ordinary HTML controls are used for reading and choosing, so they work with
 * keyboard, screen readers, browser zoom and text scaling (spec 22.2, 21.6).
 * Every action goes through ctx.controller.dispatch (domain commands).
 */
import { ctx, type UIApi } from '../app/context';
import { LUMEN_COLOURS, LUMEN_FORMS, THEMES, lumenArt, saveSettings, type Settings } from '../app/settings';
import { PRONOUN_SETS, cleanPronouns, personalise } from '../domain/player';
import { ACCENT, ACCESSORIES, AIDS, GLASSES, STYLES, HAIR, LABELS, cloakThreads, OUTFIT, PRESET_LOOKS, SKIN, TROUSERS, decodeLook, encodeLook, type LookChoice } from '../domain/appearance';
import { previewLook } from '../scenes/looks';
import { MAPS } from '../maps';
import { lorelingForm } from '../domain/lorelings';
import { chordFigure, circlePoints, panes, sightBlock, tiltOf } from '../domain/puzzles';
import { chime, playNotes } from '../app/ambience';
import { MOTIFS, SONG_MAX, openMotifs, readSong, songNotes } from '../domain/musicbox';
import { CHARGES, DEFAULT_CREST, DIVISIONS, FIELDS, MOTTOS, SHAPES, crestPixels, decodeCrest, encodeCrest, type Crest } from '../domain/crest';
import { DEFAULT_ROOM, FLOORS, LAMPS, PLANTS, RUGS, SLOTS, VIEWS, WALLS, decodeRoom, encodeRoom, placeKeepsake, starsFor, type Room } from '../domain/quarters';
import { ROOM_H, ROOM_W, drawRoom, iconCanvas } from './quarters';
import { ALBUM_MAX, loadAlbum, saveAlbum } from '../app/albumStore';
import { captionLines, checkLine } from '../domain/album';
import { caption } from '../app/captions';
import { OPPONENT, judgeYarn, viewBoard } from '../domain/clueboard';
import { EMOTES } from '../domain/emotes';
import { STAGE_LABEL, nextStep, skillStage, type SkillStage } from '../domain/skills';
import { PLAYER_VOICES, babble, bark, voiceFor } from '../app/voice';
import type { PlaqueFace, Pronouns, RestoreLayer, PuzzleRecord } from '../domain/types';
import { ACTIONS, PRESETS, actionFor, assignKey, mappableKey, type Action } from '../app/keymap';
import type { GameEvent, SimulationResult } from '../domain/engine';
import { conceptRings, conceptXP, totalXP } from '../domain/permanent';
import { describeSection, layers, type ForgeAction } from '../domain/forge';
import { labelText, type LabelResult } from '../domain/label';
import { exampleFor, segmentText } from '../domain/glossary';
import { studentAlerts } from '../domain/learning';
import { MOVE_HELP, type ShowdownMove } from '../domain/showdown';
import { ATL_NAMES, CONCEPT_NAMES, PROFILE_NAMES, SUBJECTS } from '../domain/curriculum';
import type { ClaimKind, DialogueNode, EvidenceCard, HistoricalLabel, ShowdownState, TitleLockRecord } from '../domain/types';
import { PLAYER_LOOKS } from '../scenes/art';
import { artURL, BIG_ART } from './illustrations';
import { clear, h, trapFocus } from './dom';

const HIST_LABEL_TEXT: Record<HistoricalLabel, [string, string]> = {
  'documented': ['Documented', 'Supported by a named, checkable source. Open the source link to see it.'],
  'reconstruction': ['Reconstruction', 'Made or modelled today to show how something might have been. Not historical evidence by itself.'],
  'scholarly-interpretation': ['Scholarly interpretation', 'An expert account or argument based on sources. It can be questioned.'],
  'imagined-alternate': ['Imagined alternative', 'An invented outcome for play. It did not happen.'],
  'fictional-world': ['Game world (fiction)', 'Part of the invented world of the game. Not a historical claim.'],
};
const CLAIM_TEXT: Record<ClaimKind, [string, string]> = {
  observation: ['Observation', 'Reports what a source, instrument or record shows.'],
  interpretation: ['Interpretation', 'Proposes what observations mean.'],
  value: ['Value judgement', 'Expresses a priority or obligation.'],
  simulation: ['Simulation', "Follows the game's model. Not a real measurement."],
};
const PEN_NAMES: Record<string, string> = { 'loud-model': 'Model of Loud design (coarse ball, thick ink)', 'biro-type': 'Bíró-type model (fine ball, thin ink)' };
const SURFACES: Record<string, string> = { paper: 'Paper', leather: 'Rough leather', wood: 'Rough wood' };
const RING_COLOURS: Record<string, string> = { evidence: '#e9cf7a', certainty: '#9fe8ff', truth: '#f6efd9', interpretation: '#c39bff', power: '#ff8a7a', justification: '#7fd3a8',
  explanation: '#ffb35c', objectivity: '#8fb6ff', perspective: '#ff9fd0', culture: '#d9a066', values: '#b4e07a', responsibility: '#5fd0d0' };

/** One competency ring: a circle that fills as the concept's XP grows. */
function ringSvg(name: string, got: number, max: number, colour: string): HTMLElement {
  const r = 26, len = 2 * Math.PI * r, f = max ? got / max : 0;
  const el = h('figure', { class: `ring ${f >= 1 ? 'full' : ''}`, 'aria-label': `${name}: ${got} of ${max} XP in this chapter` });
  el.innerHTML = `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="7"/>
    ${f > 0 ? `<circle cx="32" cy="32" r="${r}" fill="none" stroke="${colour}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(len * f).toFixed(1)} ${len.toFixed(1)}" transform="rotate(-90 32 32)"/>` : ''}
    <text x="32" y="36" text-anchor="middle" font-size="12" fill="currentColor">${got}</text></svg>`;
  el.append(h('figcaption', {}, name, h('small', {}, ` ${got}/${max}`)));
  return el;
}

/** A crest as a small pixel canvas, scaled up crisply. */
function crestCanvas(c: Crest, px: number, scale: number): HTMLCanvasElement {
  const t = document.createElement('canvas'); t.width = px; t.height = px;
  const id = t.getContext('2d')!.createImageData(px, px); id.data.set(crestPixels(c, px)); t.getContext('2d')!.putImageData(id, 0, 0);
  const out = document.createElement('canvas'); out.width = px * scale; out.height = px * scale;
  const g = out.getContext('2d')!; g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, px * scale, px * scale);
  out.className = 'crest'; out.setAttribute('aria-hidden', 'true');
  return out;
}

function chip(text: string, title: string, cls: string): HTMLElement {
  return h('span', { class: `chip ${cls}`, title, 'aria-label': `${text}: ${title}` }, text);
}
export function histChip(l: HistoricalLabel): HTMLElement { return chip(HIST_LABEL_TEXT[l][0], HIST_LABEL_TEXT[l][1], `hist-${l}`); }
export function claimChip(k: ClaimKind): HTMLElement { return chip(CLAIM_TEXT[k][0], CLAIM_TEXT[k][1], `claim-${k}`); }

/** A brass balance, drawn in SVG. `deg` > 0 means the right (weights) pan is lower. */
function balanceSvg(load: string, weights: { label: string; mass: number; untrusted: boolean }[], deg: number): HTMLElement {
  const wrap = h('div', { class: 'balance-wrap', 'aria-hidden': 'true' });
  const dy = Math.sin((deg * Math.PI) / 180) * 100;
  const esc = (t: string) => t.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);
  let x = 228;
  const blocks = weights.map((w) => {
    const bw = 8 + Math.min(16, w.mass * 2.4), bh = 6 + Math.min(14, w.mass * 1.6);
    const r = `<rect x="${x}" y="${-bh}" width="${bw}" height="${bh}" rx="1.5" fill="${w.untrusted ? '#8b8f99' : '#d9b45a'}" stroke="${w.untrusted ? '#4a4d55' : '#6b4f19'}"/>`;
    x += bw + 2; return r;
  }).join('');
  wrap.innerHTML = `<svg viewBox="0 0 320 180" width="320" height="180" role="presentation">
  <rect x="120" y="164" width="80" height="10" rx="3" fill="#5b3b22"/><rect x="154" y="40" width="12" height="126" fill="#8a6a2a"/>
  <circle cx="160" cy="34" r="7" fill="#e9cf7a" stroke="#6b4f19"/>
  <g class="beam" style="transform: rotate(${deg}deg)"><rect x="58" y="36" width="204" height="8" rx="3" fill="#c9a24a" stroke="#6b4f19"/>
    <path d="M156 44 L160 58 L164 44 Z" fill="#6b4f19"/></g>
  <g class="pan" style="transform: translate(0px, ${-dy}px)"><line x1="60" y1="40" x2="34" y2="112" stroke="#6b4f19"/><line x1="60" y1="40" x2="86" y2="112" stroke="#6b4f19"/>
    <path d="M24 112 Q60 132 96 112 Z" fill="#c9a24a" stroke="#6b4f19"/>
    <rect x="40" y="94" width="40" height="18" rx="4" fill="#7d5bc4" stroke="#3a2b5e"/><text x="60" y="88" text-anchor="middle" font-size="10" fill="currentColor">${esc(load.length > 22 ? load.slice(0, 21) + '…' : load)}</text></g>
  <g class="pan" style="transform: translate(0px, ${dy}px)"><line x1="260" y1="40" x2="234" y2="112" stroke="#6b4f19"/><line x1="260" y1="40" x2="286" y2="112" stroke="#6b4f19"/>
    <path d="M224 112 Q260 132 296 112 Z" fill="#c9a24a" stroke="#6b4f19"/><g transform="translate(0,112)">${blocks}</g></g>
</svg>`;
  return wrap;
}

const escSvg = (t: string) => t.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

const GLASS = ['#c0392b', '#2e86c1', '#f1c40f', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#d35400', '#2c3e9f', '#c2185b', '#7cb342', '#00838f'];
/** A round window: chords between the points, panes filled like stained glass (flood fill). */
function glassWindow(angles: number[], lit: boolean): HTMLCanvasElement {
  const S = 260, cx = S / 2, cy = S / 2, r = 118;
  const c = document.createElement('canvas'); c.width = S; c.height = S; c.className = 'glass-window';
  const g = c.getContext('2d')!;
  const pts = circlePoints(angles).map(([x, y]) => [cx + x * r, cy - y * r] as [number, number]);
  const lead = (w: number, col: string) => {
    g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { g.beginPath(); g.moveTo(...pts[i]); g.lineTo(...pts[j]); g.stroke(); }
  };
  lead(2.5, '#000');
  const img = g.getImageData(0, 0, S, S), d = img.data;
  const seen = new Uint8Array(S * S);
  let k = 0;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x;
    if (seen[i] || d[i * 4 + 3] > 40 || Math.hypot(x - cx, y - cy) > r - 2) continue;
    const col = GLASS[k++ % GLASS.length];
    const rgb = [parseInt(col.slice(1, 3), 16), parseInt(col.slice(3, 5), 16), parseInt(col.slice(5, 7), 16)];
    const stack = [i]; seen[i] = 1;
    while (stack.length) {
      const q = stack.pop()!, qx = q % S, qy = (q / S) | 0;
      const shade = lit ? 1 : 0.45, sh = 0.85 + 0.15 * Math.sin((qx + qy) / 9);
      d[q * 4] = rgb[0] * shade * sh; d[q * 4 + 1] = rgb[1] * shade * sh; d[q * 4 + 2] = rgb[2] * shade * sh; d[q * 4 + 3] = 255;
      for (const n of [q - 1, q + 1, q - S, q + S]) {
        if (n < 0 || n >= S * S || seen[n]) continue;
        const nx = n % S, ny = (n / S) | 0;
        if (Math.abs(nx - qx) > 1 || d[n * 4 + 3] > 40 || Math.hypot(nx - cx, ny - cy) > r - 2) continue;
        seen[n] = 1; stack.push(n);
      }
    }
  }
  g.putImageData(img, 0, 0);
  lead(4, '#2a2a33');
  g.strokeStyle = '#6b6b78'; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, r + 4, 0, Math.PI * 2); g.stroke();
  pts.forEach(([x, y]) => { g.fillStyle = '#e9cf7a'; g.beginPath(); g.arc(x, y, 5, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#6b4f19'; g.lineWidth = 1.5; g.stroke(); });
  c.setAttribute('role', 'img');
  c.setAttribute('aria-label', `A round window with ${angles.length} points on its edge, every pair joined with lead: ${panes(angles.length)} panes of coloured glass.`);
  return c;
}

/** The guild clerk's map for a sightlines puzzle. Blue lines are clear views; orange stops with ✕. */
function sightMapSvg(p: Extract<PuzzleRecord, { type: 'sightlines' }>, active: string | null, onPick: (id: string) => void): HTMLElement {
  const C = 20, W = p.grid.w * C, H = p.grid.h * C;
  const wrap = h('div', { class: 'sight-wrap' });
  const blocks = p.blocks.map((b) => {
    const x = b.x * C, y = b.y * C, w = b.w * C, hh = b.h * C;
    if (b.kind === 'fountain') return `<circle cx="${x + w / 2}" cy="${y + hh / 2}" r="${Math.min(w, hh) / 2 - 1}" fill="#9fb7c8" stroke="#5b6b7a" stroke-width="3"/><circle cx="${x + w / 2}" cy="${y + hh / 2}" r="${Math.min(w, hh) / 5}" fill="#cfe3ef"/>`;
    if (b.kind === 'crates') return `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${hh - 2}" fill="#a87445" stroke="#5b3b22" stroke-width="2"/><path d="M${x + 1} ${y + hh / 2}H${x + w - 1}M${x + 1} ${y + 1}L${x + w - 1} ${y + hh / 2}" stroke="#5b3b22"/>`;
    return `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${hh - 2}" rx="3" fill="#d9534a" stroke="#7a2a22" stroke-width="2"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 2 + i * (w - 4) / 5}" y="${y + 2}" width="${(w - 4) / 10}" height="${hh - 4}" fill="#f3eee0" opacity="0.8"/>`).join('')}`;
  }).join('');
  const letters = 'ABCDEFGH';
  const spots = p.spots.map((s, i) => `<g><circle cx="${s.x * C + C / 2}" cy="${s.y * C + C / 2}" r="8" fill="#e9cf7a" stroke="#6b4f19" stroke-width="2"/><text x="${s.x * C + C / 2}" y="${s.y * C + C / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#2a1d14">${letters[i]}</text></g>`).join('');
  let rays = '';
  const w = p.witnesses.find((x) => x.id === active);
  if (w) for (const s of p.spots) {
    const ax = w.x * C + C / 2, ay = w.y * C + C / 2, bx = s.x * C + C / 2, by = s.y * C + C / 2;
    const b = sightBlock(p.blocks, w.x, w.y, s.x, s.y);
    if (!b) rays += `<line class="ray" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#4aa3ff" stroke-width="3"/>`;
    else {
      const mx = b.x * C, my = b.y * C;
      rays += `<line class="ray" x1="${ax}" y1="${ay}" x2="${mx}" y2="${my}" stroke="#4aa3ff" stroke-width="3"/><line x1="${mx}" y1="${my}" x2="${bx}" y2="${by}" stroke="#ff8a3a" stroke-width="2" stroke-dasharray="4 4" opacity="0.8"/><text x="${mx}" y="${my + 5}" text-anchor="middle" font-size="16" font-weight="700" fill="#ff8a3a" stroke="#2a1d14" stroke-width="0.8">✕</text>`;
    }
  }
  const people = p.witnesses.map((x) => `<g class="witness" data-w="${x.id}" tabindex="-1"><circle cx="${x.x * C + C / 2}" cy="${x.y * C + C / 2}" r="${active === x.id ? 10 : 8}" fill="${x.colour}" stroke="${active === x.id ? '#fff3c4' : '#2a1d14'}" stroke-width="${active === x.id ? 3 : 2}"/><text x="${x.x * C + C / 2}" y="${x.y * C + C / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#14101c">${x.name[0]}</text></g>`).join('');
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><defs><pattern id="cobble" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#bdb4a2"/><path d="M0 10H20M10 0V10M0 20V10M20 20V10" stroke="#a39a88" stroke-width="1"/></pattern></defs>
  <rect width="${W}" height="${H}" rx="6" fill="url(#cobble)"/>${blocks}${rays}${spots}${people}</svg>`;
  wrap.querySelectorAll<SVGGElement>('.witness').forEach((g) => g.addEventListener('click', () => onPick(g.dataset.w!)));
  return wrap;
}

/** The face of a restored object (data-driven: background, ink, lines, optional window). */
function plaqueSvg(f: PlaqueFace, label: string): HTMLElement {
  const wrap = h('div', { class: 'plaque-wrap', role: 'img', 'aria-label': `${label}: ${f.lines.join(' ')}${f.window ? `. A small window shows: ${f.window.lines.join(' ')}` : ''}` });
  const lines = (ls: string[], x: number, y0: number, size: number, ink: string) => ls.map((t, i) =>
    `<text x="${x}" y="${y0 + i * (size + 6)}" text-anchor="middle" font-size="${size}" font-weight="700" fill="${ink}" letter-spacing="1">${escSvg(t)}</text>`).join('');
  const w = f.window;
  wrap.innerHTML = `<svg viewBox="0 0 320 150" width="320" height="150" aria-hidden="true">
  <rect x="6" y="6" width="308" height="138" rx="10" fill="#3b2a1a"/><rect x="12" y="12" width="296" height="126" rx="7" fill="${f.bg}"/>
  <circle cx="22" cy="22" r="3" fill="#8a7a5a"/><circle cx="298" cy="22" r="3" fill="#8a7a5a"/><circle cx="22" cy="128" r="3" fill="#8a7a5a"/><circle cx="298" cy="128" r="3" fill="#8a7a5a"/>
  ${lines(f.lines, 160, f.lines.length > 2 ? 46 : 64, f.lines.length > 2 ? 15 : 20, f.ink)}
  ${w ? `<rect x="24" y="96" width="96" height="36" rx="3" fill="${w.bg}" stroke="#f3eee0" stroke-dasharray="3 2"/>${lines(w.lines, 72, 110, 9, w.ink)}` : ''}
</svg>`;
  return wrap;
}

/** A cross-section of the layers, top first. Unseen layers are hatched; lost layers fade. */
function layerStackSvg(layers: RestoreLayer[], seen: number, lost: string[]): HTMLElement {
  const wrap = h('div', { class: 'stack-wrap', 'aria-hidden': 'true' });
  const bh = 22;
  const rows = layers.map((l, i) => {
    const y = 8 + i * (bh + 4);
    if (i >= seen) return `<rect x="8" y="${y}" width="304" height="${bh}" rx="4" fill="url(#hatch)" stroke="#6a5a48"/><text x="20" y="${y + 15}" font-size="11" fill="#cfc4b0">? Not seen yet</text>`;
    const gone = lost.includes(l.id);
    return `<rect x="8" y="${y}" width="304" height="${bh}" rx="4" fill="${l.colour}" opacity="${gone ? 0.25 : 1}" stroke="${gone ? '#d9534a' : '#2a2018'}" ${gone ? 'stroke-dasharray="5 3"' : ''}/>
      <text x="20" y="${y + 15}" font-size="11" font-weight="700" fill="${gone ? '#d9534a' : lightInk(l.colour)}">${i + 1}. ${escSvg(l.name)}${gone ? ' (lost)' : ''}</text>`;
  }).join('');
  const hgt = 16 + layers.length * (bh + 4);
  wrap.innerHTML = `<svg viewBox="0 0 320 ${hgt}" width="320" height="${hgt}"><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#3a3028"/><line x1="0" y1="0" x2="0" y2="8" stroke="#5a4a3a" stroke-width="3"/></pattern></defs>${rows}</svg>`;
  return wrap;
}
function lightInk(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return lum > 140 ? '#1d1610' : '#f6efe2';
}

export class UI implements UIApi {
  private root: HTMLElement;
  private hud!: HTMLElement;
  private modal: HTMLElement | null = null;
  private releaseTrap: (() => void) | null = null;
  private promptEl!: HTMLElement;
  private toastBox!: HTMLElement;
  private lumenBubble!: HTMLElement;
  private onStart: () => void;
  private pendingChapterEnd = false;
  private seenObjectives = new Set<string>();
  private fullRings = new Set<string>();
  /** Things that wait until the open panel closes: events and reflection offers. */
  private queue: (() => void)[] = [];
  private activeEvent: string | null = null;

  constructor(root: HTMLElement, onStart: () => void) {
    this.root = root;
    this.onStart = onStart;
    this.toastBox = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    this.root.append(this.toastBox);
    ctx.controller.onEvents((ev) => this.handleEvents(ev));
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  // --------------------------------------------------------------- basics

  isModalOpen(): boolean { return !!this.modal; }

  private sfx(key: string): void { ctx.world?.playSfx(key); }

  private openModal(cls: string, label: string, ...content: (Node | string)[]): HTMLElement {
    this.closeModal(false);
    const box = h('div', { class: `panel ${cls}`, role: 'dialog', 'aria-modal': 'true', 'aria-label': label }, ...content);
    const wrap = h('div', { class: 'modal-wrap', onclick: (e: MouseEvent) => { if (e.target === wrap && !cls.includes('dialogue')) this.closeModal(); } }, box);
    this.root.append(wrap);
    this.modal = wrap;
    this.releaseTrap = trapFocus(box);
    this.setPrompt(null);
    return box;
  }

  closeModal(sound = true): void {
    try { if (ctx.settings.readAloud) window.speechSynthesis?.cancel(); } catch { /* no speech */ }
    if (!this.modal) return;
    this.releaseTrap?.();
    this.modal.remove();
    this.modal = null;
    if (sound) this.sfx('sfx.click');
    (document.querySelector('#game canvas') as HTMLElement | null)?.focus();
    this.refreshHud();
    if (this.pendingChapterEnd) { this.pendingChapterEnd = false; this.chapterEnd(); return; }
    const next = this.queue.shift();
    if (next) setTimeout(next, 0);
  }

  /** Run now if nothing is open; otherwise run when the open panel closes. */
  private whenFree(fn: () => void): void {
    if (this.modal) this.queue.push(fn); else fn();
  }

  private closeBtn(): HTMLElement {
    return h('button', { class: 'close', 'aria-label': 'Close', onclick: () => this.closeModal() }, '✕');
  }

  /** At most three toasts at once; the rest wait their turn, so a busy moment stays readable. */
  private toastQueue: { text: string; kind: string }[] = [];
  toast(text: string, kind = 'info'): void {
    this.toastQueue.push({ text, kind });
    this.pumpToasts();
  }
  private pumpToasts(): void {
    while (this.toastQueue.length && this.toastBox.querySelectorAll('.toast:not(.out)').length < 3) {
      const { text, kind } = this.toastQueue.shift()!;
      const t = h('div', { class: `toast toast-${kind}` }, text);
      this.toastBox.append(t);
      setTimeout(() => { t.classList.add('out'); this.pumpToasts(); }, 3600);
      setTimeout(() => t.remove(), 4200);
    }
  }

  setPrompt(text: string | null): void {
    if (!this.promptEl) return;
    if (!text || this.modal) { this.promptEl.hidden = true; return; }
    this.promptEl.hidden = false;
    clear(this.promptEl);
    this.promptEl.append(h('kbd', {}, ctx.settings.keys.interact), ` ${text}`);
  }

  private onKey(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { if (e.key === 'Escape') this.closeModal(); return; }
    if (!this.hud?.isConnected) return;
    if (this.photoBar) { if (e.key === 'Escape') this.closePhotoMode(); return; }
    if (this.emoteBar) {
      if (e.key === 'Escape' || actionFor(ctx.settings.keys, e.key) === 'emote') { this.closeEmotes(); return; }
      if (/^[1-9]$/.test(e.key)) { this.emoteBar.querySelectorAll<HTMLButtonElement>('button')[Number(e.key) - 1]?.click(); return; }
    }
    if (e.key === 'Escape') { if (this.modal) this.closeModal(); else this.openMenu(); return; }
    if (this.modal?.querySelector('.map-panel') && actionFor(ctx.settings.keys, e.key) === 'map') { this.closeModal(); return; }
    if (this.modal) {
      // Number keys choose dialogue options.
      if (/^[1-9]$/.test(e.key)) this.modal.querySelectorAll<HTMLButtonElement>('.options button')[Number(e.key) - 1]?.click();
      return;
    }
    const a = actionFor(ctx.settings.keys, e.key);
    if (a === 'journal') this.openJournal();
    else if (a === 'portfolio') this.openJournal('portfolio');
    else if (a === 'bag') this.openBag();
    else if (a === 'hint') this.askLumen();
    else if (a === 'emote') this.openEmotes();
    else if (a === 'map') this.openMap();
  }

  // ------------------------------------------------- diegetic UI: compass and folding map

  private compassEl: HTMLElement | null = null;
  private compassDeg: number | null = null;
  setCompass(deg: number | null, label: string): void {
    const el = this.compassEl;
    if (!el || !el.isConnected) return;
    const needle = el.querySelector<HTMLElement>('.needle');
    if (needle) {
      // Turn the short way round, so the needle never spins a full circle.
      if (deg !== null && this.compassDeg !== null) { let d = deg - (this.compassDeg % 360); d = ((d + 540) % 360) - 180; deg = this.compassDeg + d; }
      this.compassDeg = deg;
      needle.style.transform = `rotate(${(deg ?? -90) + 90}deg)`;
      needle.classList.toggle('idle', deg === null);
    }
    const t = `Compass: ${deg === null ? label : `points to ${label}`}. Click or press ${ctx.settings.keys.map} for the map.`;
    if (el.getAttribute('aria-label') !== t) { el.setAttribute('aria-label', t); el.title = t; }
  }

  /** The folding map: a picture of the whole place, with pins. */
  openMap(): void {
    const c = ctx.controller;
    if (!ctx.world) return;
    const box = this.openModal('map-panel wide', 'Map', this.closeBtn(), h('h2', {}, MAPS[c.state.mapId]?.name ?? 'Map'), h('p', { class: 'fine' }, 'Unfolding the map…'));
    this.sfx('sfx.page');
    ctx.world.mapSnap((r) => {
      if (!box.isConnected) return;
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, MAPS[c.state.mapId]?.name ?? 'Map'));
      if (!r) { box.append(h('p', {}, 'This browser could not draw the map.')); return; }
      const paper = h('div', { class: 'chart' });
      const img = h('img', { src: r.img.src, alt: `Map of ${MAPS[c.state.mapId]?.name ?? 'this place'}` }) as HTMLImageElement;
      paper.append(img, h('div', { class: 'folds', 'aria-hidden': 'true' }));
      const pins = h('div', { class: 'pins' });
      const ICON: Record<string, string> = { you: '★', new: '!', place: '•', waystone: '◆', portal: '⇲' };
      img.addEventListener('load', () => {
        const sx = img.clientWidth / r.img.naturalWidth || img.clientWidth / img.naturalWidth, sy = img.clientHeight / img.naturalHeight;
        for (const m of r.marks) {
          const [px, py] = r.at(m.x, m.y);
          pins.append(h('span', { class: `pin-${m.kind}`, title: m.label, 'aria-label': m.label, role: 'img', style: { left: `${px * sx}px`, top: `${py * sy}px` } }, ICON[m.kind]));
        }
      }, { once: true });
      paper.append(pins);
      box.append(paper,
        h('ul', { class: 'legend' }, h('li', {}, h('span', { class: 'pin-you' }, '★'), ' You'), h('li', {}, h('span', { class: 'pin-new' }, '!'), ' Someone has something new to say'),
          h('li', {}, h('span', { class: 'pin-place' }, '•'), ' A place you have not used yet'), h('li', {}, h('span', { class: 'pin-waystone' }, '◆'), ' Waystone (save and rest)'), h('li', {}, h('span', { class: 'pin-portal' }, '⇲'), ' Way out')),
        h('p', { class: 'fine' }, `Press ${ctx.settings.keys.map} or Esc to fold the map.`));
    });
  }

  private emoteBar: HTMLElement | null = null;

  /** Emotes (spec 47.4): a small row of buttons; 1 to 6 or a click chooses. No game effect. */
  openEmotes(): void {
    if (!ctx.world || this.emoteBar) return;
    const bar = h('div', { class: 'emote-bar', role: 'toolbar', 'aria-label': 'Emotes' },
      ...EMOTES.map((e, i) => h('button', { type: 'button', onclick: () => { ctx.world?.emote(e.id); this.closeEmotes(); } }, h('kbd', {}, String(i + 1)), ` ${e.label}`)));
    this.emoteBar = bar;
    this.root.append(bar);
    (bar.querySelector('button') as HTMLButtonElement)?.focus();
  }

  private closeEmotes(): void { this.emoteBar?.remove(); this.emoteBar = null; }

  // ------------------------------------------------------------- title

  showTitle(): void {
    clear(this.root); this.root.append(this.toastBox);
    const c = ctx.controller;
    const cont = c.pair.continue, rec = c.pair.recovery;
    const fmt = (e: typeof cont) => e ? `${e.label} · ${e.location} · ${e.kind === 'suspend' ? 'Suspended' : 'Checkpoint'} · ${new Date(e.savedAt).toLocaleString()}` : '';
    const box = h('div', { class: 'title-screen' },
      h('div', { class: 'title-art', 'aria-hidden': 'true' }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '' })),
      h('h1', {}, 'Knowledge Guardians'),
      h('p', { class: 'subtitle' }, 'Chapter 1: Three Firsts and The Label on the Blade'),
      c.loadProblem ? h('p', { class: 'warn', role: 'alert' }, `Your save could not be opened: ${c.loadProblem} Your saved data has not been changed. You can still start a new game, but starting a new game will replace it.`) : null,
      c.contentProblems.length ? h('p', { class: 'warn', role: 'alert' }, `Content problems: ${c.contentProblems.join('; ')}`) : null,
      h('div', { class: 'menu' },
        cont ? h('button', { 'data-autofocus': true, onclick: () => { c.loadContinue(); this.startPlaying(true); } }, h('strong', {}, 'Continue'), h('small', {}, fmt(cont))) : null,
        rec ? h('button', { onclick: () => this.confirmRecovery() }, h('strong', {}, 'Checkpoint recovery'), h('small', {}, fmt(rec))) : null,
        h('button', { 'data-autofocus': !cont, onclick: () => this.characterCreation() }, h('strong', {}, 'New game'), h('small', {}, cont ? 'Starts a new campaign. Your awards stay.' : 'Begin as a new recruit')),
        h('button', { onclick: () => this.openSettings() }, h('strong', {}, 'Settings'), h('small', {}, 'Text size, motion, sound, guide prompts')),
        h('button', { onclick: () => this.openCredits() }, h('strong', {}, 'Credits and sources'), h('small', {}, 'Who made the art, music and sounds, and the historical sources')),
      ),
      h('p', { class: 'fine' }, 'Local demo: progress is saved in this browser only. No account. No AI service. Works offline after the first load.'),
    );
    this.root.append(box);
    setTimeout(() => box.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 0);
  }

  private confirmRecovery(): void {
    const c = ctx.controller;
    const rec = c.pair.recovery!;
    const box = this.openModal('confirm', 'Restore checkpoint recovery',
      this.closeBtn(),
      h('h2', {}, 'Restore checkpoint recovery?'),
      h('p', {}, `This makes "${rec.label}" (${rec.location}, ${new Date(rec.savedAt).toLocaleString()}) your current game. Your current Continue save will be replaced.`),
      h('p', {}, 'Awards, concept XP and badges you already earned are kept.'),
      h('div', { class: 'row' },
        h('button', { class: 'primary', 'data-autofocus': true, onclick: () => { this.closeModal(); c.loadRecovery(); this.startPlaying(true); } }, 'Restore'),
        h('button', { onclick: () => this.closeModal() }, 'Cancel')));
    void box;
  }

  private characterCreation(): void {
    clear(this.root); this.root.append(this.toastBox);
    const lookPick = this.lookPicker(PLAYER_LOOKS[0]);
    const name = h('input', { id: 'pname', maxlength: '24', value: '', placeholder: 'Your Guardian name', autocomplete: 'off', 'data-autofocus': true }) as HTMLInputElement;
    const pron = this.pronounPicker(PRONOUN_SETS[0].p);
    let origin: string | null = null;
    const originBox = h('div', { class: 'origins', role: 'radiogroup', 'aria-label': 'Origin' },
      ...ctx.controller.pack.origins.map((o) => {
        const b = h('button', { class: 'origin', role: 'radio', 'aria-checked': 'false', onclick: () => {
          origin = o.id; originBox.querySelectorAll('.origin').forEach((x) => x.setAttribute('aria-checked', 'false')); b.setAttribute('aria-checked', 'true');
        } }, h('strong', {}, o.name), h('small', {}, o.background), h('small', { class: 'link' }, o.link));
        return b;
      }));
    const start = () => {
      const n = name.value.trim() || 'Recruit';
      ctx.controller.newGame(n.slice(0, 24), lookPick.value(), { pronouns: pron.value(), origin });
      this.startPlaying(false);
    };
    name.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
    const box = h('div', { class: 'title-screen create' },
      h('h1', {}, 'A new Guardian'),
      h('p', {}, 'Every student is a Knowledge Guardian from the first day. Choose a name and how you look. You can play in any way you like.'),
      h('label', { for: 'pname' }, 'Name'), name,
      h('p', { class: 'label' }, 'Appearance (every option is open from the start; you can change it later in the menu)'), lookPick.el,
      h('p', { class: 'label' }, 'Voice (a short sound when you speak)'), this.voicePicker(),
      h('p', { class: 'label' }, 'Pronouns (characters use these; you can change them later in the menu)'), pron.el,
      h('p', { class: 'label' }, 'Origin (optional). It gives one Lens hint and one extra conversation option in each world. It gives no advantage.'), originBox,
      h('div', { class: 'row' }, h('button', { class: 'primary', onclick: start }, 'Begin'), h('button', { onclick: () => this.showTitle() }, 'Back')));
    this.root.append(box);
    setTimeout(() => name.focus(), 0);
  }

  /** Appearance choice (spec 35.1): four ready-made looks, or choose each colour and an accessory, with a live preview. */
  private lookPicker(current: string): { el: HTMLElement; value: () => string } {
    let choice: LookChoice = decodeLook(current);
    let presetId: string | null = PRESET_LOOKS[current] ? current : null;
    const preview = h('div', { class: 'look-preview', role: 'img' });
    const describe = () => `${LABELS[choice.skin]} skin, ${LABELS[choice.style ?? 'short']} ${LABELS[choice.hair]} hair${choice.style === 'covered' ? ` under a ${LABELS[choice.accent]} head scarf` : ''}, ${LABELS[choice.outfit]} outfit, ${LABELS[choice.trousers]} trousers${choice.accessory === 'none' ? '' : `, ${LABELS[choice.accent]} ${LABELS[choice.accessory]}`}${choice.glasses && choice.glasses !== 'none' ? `, ${LABELS[choice.glasses]}` : ''}${choice.aid && choice.aid !== 'none' ? `, ${LABELS[choice.aid]}` : ''}`;
    const sel = (label: string, k: 'style' | 'glasses' | 'aid' | 'accessory', list: readonly string[]) => h('div', { class: 'swatch-row' }, h('span', {}, label),
      h('select', { 'aria-label': label, onchange: (e: Event) => { (choice as any)[k] = (e.target as HTMLSelectElement).value; presetId = null; draw(); } },
        ...list.map((a) => h('option', { value: a, selected: (choice[k] ?? list[0]) === a }, LABELS[a] ?? a))));
    const draw = () => { clear(preview); preview.append(previewLook(presetId ?? encodeLook(choice), 4)); preview.setAttribute('aria-label', `Preview: ${describe()}`); };
    const swatches = (label: string, k: keyof LookChoice, table: Record<string, any>) => {
      const row = h('div', { class: 'swatches', role: 'radiogroup', 'aria-label': label });
      const paint = () => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.v === choice[k])));
      for (const id of Object.keys(table)) {
        const col = Array.isArray(table[id]) ? table[id][0] : table[id];
        row.append(h('button', { type: 'button', class: 'swatch', role: 'radio', 'data-v': id, title: LABELS[id] ?? id, 'aria-label': `${label}: ${LABELS[id] ?? id}`,
          style: { background: `#${col}` }, onclick: () => { (choice as any)[k] = id; presetId = null; paint(); draw(); } }));
      }
      paint();
      return h('div', { class: 'swatch-row' }, h('span', {}, label), row);
    };
    const accSel = h('select', { 'aria-label': 'Accessory', onchange: (e: Event) => { choice.accessory = (e.target as HTMLSelectElement).value as any; presetId = null; draw(); } },
      ...ACCESSORIES.map((a) => h('option', { value: a, selected: choice.accessory === a }, LABELS[a]))) as HTMLSelectElement;
    const custom = h('div', { class: 'look-custom' },
      swatches('Skin', 'skin', SKIN), swatches('Hair', 'hair', HAIR), swatches('Outfit', 'outfit', OUTFIT), swatches('Trousers', 'trousers', TROUSERS),
      sel('Hair style', 'style', STYLES), sel('Glasses', 'glasses', GLASSES), sel('Mobility aid', 'aid', AIDS),
      h('div', { class: 'swatch-row' }, h('span', {}, 'Accessory'), accSel), swatches('Accessory and scarf colour', 'accent', ACCENT));
    const presets = h('div', { class: 'looks', role: 'radiogroup', 'aria-label': 'Ready-made looks' },
      ...PLAYER_LOOKS.map((id, i) => h('button', { type: 'button', class: 'look', role: 'radio', 'aria-checked': String(id === presetId), 'aria-label': `Ready-made look ${i + 1}`, onclick: (e: Event) => {
        presetId = id; choice = decodeLook(id);
        presets.querySelectorAll('.look').forEach((x) => x.setAttribute('aria-checked', String(x === e.currentTarget)));
        const fresh = this.lookPicker(id); el.replaceWith(fresh.el); api.value = () => fresh.value();
      } }, h('span', { class: 'sprite', style: { backgroundImage: `url(assets/art/generated/characters/${id}.png)` } }))));
    const el = h('div', { class: 'look-picker' }, presets, h('div', { class: 'look-body' }, preview, custom));
    draw();
    const api = { el, value: () => presetId ?? encodeLook(choice) };
    return api;
  }

  /** Voice choice (spec 35.1 voice barks): stored in Settings on this device. */
  private voicePicker(): HTMLElement {
    const st = ctx.settings;
    const sel = h('select', { 'aria-label': 'Your voice', onchange: (e: Event) => {
      st.playerVoice = (e.target as HTMLSelectElement).value; saveSettings(st);
      bark(PLAYER_VOICES.find((x) => x.id === st.playerVoice)?.v ?? null, Math.max(0.4, st.sfxVolume));
    } }, ...PLAYER_VOICES.map((v) => h('option', { value: v.id, selected: st.playerVoice === v.id }, v.label))) as HTMLSelectElement;
    return h('div', { class: 'row voice-pick' }, sel,
      h('button', { type: 'button', onclick: () => bark(PLAYER_VOICES.find((x) => x.id === sel.value)?.v ?? null, Math.max(0.4, st.sfxVolume)) }, '🔊 Listen'));
  }

  /** Pronoun choice (spec 35.1): three common sets, or the player's own words. */
  private pronounPicker(current: Pronouns): { el: HTMLElement; value: () => Pronouns } {
    const preset = PRONOUN_SETS.find((x) => x.p.subject === current.subject && x.p.object === current.object && x.p.possessive === current.possessive);
    let mode = preset?.id ?? 'own';
    const inp = (k: keyof Pronouns, label: string) => h('input', { maxlength: '16', 'aria-label': label, placeholder: label, value: preset ? '' : current[k] }) as HTMLInputElement;
    const own = { subject: inp('subject', 'they'), object: inp('object', 'them'), possessive: inp('possessive', 'their') };
    const ownRow = h('div', { class: 'row own-pronouns', style: { display: mode === 'own' ? '' : 'none' } }, own.subject, own.object, own.possessive);
    const radios = [...PRONOUN_SETS.map((x) => ({ id: x.id, label: x.label })), { id: 'own', label: 'my own words' }].map((x) =>
      h('label', { class: 'check' }, h('input', { type: 'radio', name: 'pronouns', value: x.id, checked: mode === x.id, onchange: () => { mode = x.id; ownRow.style.display = mode === 'own' ? '' : 'none'; } }), ` ${x.label}`));
    const el = h('div', { class: 'pronouns', role: 'radiogroup', 'aria-label': 'Pronouns' }, h('div', { class: 'row' }, ...radios), ownRow);
    const value = () => mode === 'own'
      ? cleanPronouns({ subject: own.subject.value, object: own.object.value, possessive: own.possessive.value })
      : PRONOUN_SETS.find((x) => x.id === mode)!.p;
    return { el, value };
  }

  /** Cloak embroidery (spec 32.6): one stitched thread for each world arc resolved. */
  private threadView(look: string): HTMLElement {
    const got = cloakThreads(ctx.controller.state.objectivesDone);
    return h('div', { class: 'threads row' }, h('span', { class: 'thread-preview' }, previewLook(look, 3, got.map((t) => t.colour))),
      got.length ? h('ul', {}, ...got.map((t) => h('li', {}, h('span', { class: 'swatch', style: { background: `#${t.colour}` }, 'aria-hidden': 'true' }), ` ${t.name}`)))
        : h('p', { class: 'fine' }, 'No threads yet. Your outfit gets an embroidered thread for each world story you resolve.'));
  }

  private crestSummary(): HTMLElement {
    const cr = decodeCrest(ctx.controller.state.flags['crest']);
    return h('div', { class: 'row' }, cr ? crestCanvas(cr, 30, 2) : h('span', { class: 'fine' }, 'No crest yet.'),
      cr ? h('em', {}, `“${MOTTOS[cr.motto]}”`) : '', h('button', { onclick: () => this.openCrest() }, cr ? 'Change my crest' : 'Design a crest'));
  }

  /** The crest designer (spec 47.4 heraldry). Every choice is from a list. The crest shows on the back of the cloak. */
  openCrest(): void {
    const c = ctx.controller;
    let cr: Crest = decodeCrest(c.state.flags['crest']) ?? { ...DEFAULT_CREST };
    const box = this.openModal('crest-panel wide', 'Crest');
    const pick = <K extends keyof Crest>(label: string, k: K, opts: [string, string][]) => h('label', { class: 'crest-pick' }, h('span', {}, label),
      h('select', { onchange: (e: Event) => { const v = (e.target as HTMLSelectElement).value; (cr as any)[k] = k === 'motto' ? Number(v) : v; render(); } },
        ...opts.map(([v, t]) => h('option', { value: v, selected: String(cr[k]) === v }, t))));
    const colours = Object.keys(FIELDS).map((k) => [k, k[0].toUpperCase() + k.slice(1)] as [string, string]);
    const render = () => {
      clear(box);
      const preview = h('div', { class: 'crest-preview', role: 'img', 'aria-label': `Crest: a ${cr.shape} shield, ${cr.division === 'plain' ? cr.a : `${cr.a} and ${cr.b}, divided ${cr.division}`}, with a ${cr.ink} ${CHARGES[cr.charge].name}. Motto: ${MOTTOS[cr.motto]}` },
        crestCanvas(cr, 30, 6), h('p', { class: 'motto' }, MOTTOS[cr.motto]));
      box.append(this.closeBtn(), h('h2', {}, 'Your crest'),
        h('p', {}, 'Design a crest for your Guardian. It is stitched on the back of your cloak and stamped on your photos. Every choice comes from a list, so it is always kind.'),
        h('div', { class: 'crest-body' }, preview, h('div', { class: 'crest-picks' },
          pick('Shape', 'shape', SHAPES.map((x) => [x, { heater: 'Heater shield', round: 'Round shield', banner: 'Banner', kite: 'Kite shield' }[x]] as [string, string])),
          pick('Division', 'division', DIVISIONS.map((x) => [x, { plain: 'Plain', pale: 'Split down the middle', fess: 'Split across', quarterly: 'Quarters', chevron: 'Chevron', bend: 'Diagonal band' }[x]] as [string, string])),
          pick('First colour', 'a', colours), pick('Second colour', 'b', colours),
          pick('Symbol', 'charge', Object.entries(CHARGES).map(([k, v]) => [k, v.name[0].toUpperCase() + v.name.slice(1)] as [string, string])),
          pick('Symbol colour', 'ink', colours),
          pick('Motto', 'motto', MOTTOS.map((m, i) => [String(i), m] as [string, string])))),
        h('div', { class: 'row' },
          h('button', { class: 'primary', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'crest', value: encodeCrest(cr) }); this.sfx('sfx.sparkle'); this.toast('Crest saved. It is on your cloak now.', 'save'); this.closeModal(); ctx.world?.refreshWorld(); } }, 'Save crest'),
          h('button', { onclick: () => { cr = { ...DEFAULT_CREST, a: Object.keys(FIELDS)[Math.floor(Math.random() * 10)], charge: Object.keys(CHARGES)[Math.floor(Math.random() * 10)], motto: Math.floor(Math.random() * MOTTOS.length) }; render(); } }, 'Surprise me'),
          h('button', { onclick: () => this.closeModal() }, 'Cancel')));
    };
    render();
  }

  /** My Guardian: change pronouns at any time; see the origin. */
  private openGuardian(): void {
    const c = ctx.controller;
    const pl = c.state.player;
    const pron = this.pronounPicker(pl.pronouns);
    const lookPick = this.lookPicker(pl.look);
    const o = c.pack.origins.find((x) => x.id === pl.origin);
    this.openModal('guardian wide', 'My Guardian', this.closeBtn(), h('h2', {}, pl.name),
      h('p', { class: 'label' }, 'Appearance'), lookPick.el,
      h('p', { class: 'label' }, 'Cloak threads'), this.threadView(pl.look),
      h('p', { class: 'label' }, 'Crest'), this.crestSummary(),
      h('p', { class: 'label' }, 'Lumen'), this.lumenPicker(),
      h('p', { class: 'label' }, 'Voice'), this.voicePicker(),
      h('p', { class: 'label' }, 'Pronouns'), pron.el,
      h('p', { class: 'label' }, 'Origin'),
      o ? h('p', {}, h('strong', {}, o.name), `. ${o.background} ${o.link}`) : h('p', { class: 'fine' }, 'No origin. (This game started before origins existed, or you chose none.)'),
      h('div', { class: 'row' },
        h('button', { class: 'primary', onclick: () => {
          c.dispatch({ type: 'SetPronouns', pronouns: pron.value() });
          const look = lookPick.value();
          const changed = look !== c.state.player.look;
          if (changed) c.dispatch({ type: 'SetLook', look });
          this.toast('Saved.', 'save'); this.closeModal();
          if (changed) ctx.world?.applySettings();
        } }, 'Save'),
        h('button', { onclick: () => this.closeModal() }, 'Cancel')));
  }

  private startPlaying(returning: boolean): void {
    const pc = ctx.controller;
    this.fullRings = new Set(conceptRings(pc.permanent, pc.pack).filter((r) => r.got >= r.max).map((r) => r.concept));
    clear(this.root); this.root.append(this.toastBox);
    this.buildHud();
    this.seenObjectives = new Set(ctx.controller.engine.visibleObjectives(ctx.controller.state).map((o) => o.id));
    this.onStart();
    if (returning) this.showRecap();
    else if (!ctx.controller.state.flags['seen.coldopen']) setTimeout(() => this.playScene('cold.open'), ctx.settings.reducedMotion ? 50 : 700);
  }

  playScene(node: string): void { this.whenFree(() => this.showNode(node)); }

  private showRecap(): void {
    const r = ctx.controller.recap();
    this.openModal('recap', 'Recap', h('h2', {}, r.title), h('ul', {}, ...r.lines.map((l) => h('li', {}, l))),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Continue playing')));
  }

  // --------------------------------------------------------------- HUD

  private buildHud(): void {
    this.hud = h('div', { class: 'hud' });
    this.promptEl = h('button', { class: 'prompt', hidden: true, onclick: () => (ctx.world as any)?.tryInteract?.() });
    this.lumenBubble = h('div', { class: 'lumen-bubble', hidden: true, role: 'status', 'aria-live': 'polite' });
    this.root.append(this.hud, this.promptEl, this.lumenBubble);
    this.refreshHud();
  }

  refreshHud(): void {
    if (!this.hud) return;
    const c = ctx.controller, s = c.state;
    if (!s) return;
    clear(this.hud);
    const objs = c.engine.visibleObjectives(s);
    const missions = [...new Set(objs.map((o) => o.mission))];
    const tracker = h('section', { class: 'tracker', 'aria-label': 'Objectives' },
      ...missions.filter((m) => objs.some((o) => o.mission === m && !o.complete)).slice(-1).map((m) => h('div', {},
        h('h2', {}, m.title),
        h('p', { class: 'kq' }, m.knowledgeQuestion),
        h('ul', {}, ...objs.filter((o) => o.mission === m).map((o) => h('li', { class: o.complete ? 'done' : '' }, h('span', { 'aria-hidden': 'true' }, o.complete ? '✓ ' : '◇ '), h('span', { class: 'sr' }, o.complete ? 'Done: ' : 'To do: '), o.title))))),
      objs.length && objs.every((o) => o.complete) ? h('div', {}, h('h2', {}, 'Chapter complete'), h('p', {}, 'Explore freely, or open the menu.')) : null);
    const km = ctx.settings.keys;
    const bar = h('nav', { class: 'hud-buttons', 'aria-label': 'Game menu' },
      h('span', { class: 'marks', title: 'Marks (campaign money)' }, h('img', { src: artURL('icon.card'), alt: '' }), ` ${s.marks} marks`),
      s.flags['title.worn'] ? h('span', { class: 'marks worn-title', title: 'Your title (choose in Journal, Awards)' }, `${s.player.name}, ${s.flags['title.worn']}`) : '',
      h('button', { onclick: () => this.askLumen(), title: `Ask Lumen for a hint (${km.hint})` }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '' }), ' Hint ', h('kbd', {}, km.hint)),
      h('button', { onclick: () => this.openJournal(), title: `Journal (${km.journal})` }, 'Journal ', h('kbd', {}, km.journal)),
      h('button', { onclick: () => this.openJournal('portfolio'), title: `Portfolio (${km.portfolio})` }, 'Portfolio ', h('kbd', {}, km.portfolio)),
      h('button', { onclick: () => this.openBag(), title: `Bag (${km.bag})` }, 'Bag ', h('kbd', {}, km.bag)),
      h('button', { onclick: () => this.openMenu(), title: 'Menu (Esc)' }, 'Menu ', h('kbd', {}, 'Esc')));
    this.compassEl ??= h('button', { class: 'compass', type: 'button', onclick: () => this.openMap(), 'aria-label': 'Compass. Click for the map.' },
      h('span', { class: 'rose', 'aria-hidden': 'true' }, 'N'), h('span', { class: 'needle idle', 'aria-hidden': 'true' }));
    this.hud.append(tracker, bar, this.compassEl);
    // New objectives: Lumen mentions them once if the player allows prompts (GUIDE-001).
    for (const o of objs) {
      if (!this.seenObjectives.has(o.id)) {
        this.seenObjectives.add(o.id);
        if (!o.complete && ctx.settings.guidePrompts) this.lumenSay(`New step: ${o.title}`);
      }
    }
  }

  private lumenSay(text: string): void {
    clear(this.lumenBubble);
    this.lumenBubble.append(h('img', { src: artURL(lumenArt(ctx.settings)), alt: '' }), h('span', {}, h('strong', {}, 'Lumen: '), text),
      h('button', { class: 'mini', 'aria-label': 'Hide message', onclick: () => { this.lumenBubble.hidden = true; } }, '✕'));
    this.lumenBubble.hidden = false;
    clearTimeout((this.lumenBubble as any)._t);
    (this.lumenBubble as any)._t = setTimeout(() => { this.lumenBubble.hidden = true; }, 7000);
  }

  private askLumen(): void {
    const c = ctx.controller;
    const cur = c.engine.currentObjective(c.state);
    if (!cur) { this.lumenSay('Nothing urgent. Explore, read your journal, or talk to people again.'); return; }
    const ev = c.dispatch({ type: 'RequestHint', objective: cur.id });
    const hint = ev.find((e) => e.kind === 'hint') as Extract<GameEvent, { kind: 'hint' }> | undefined;
    ctx.world?.lumenBurst();
    this.sfx('sfx.sparkle');
    if (!hint) return;
    const box = this.openModal('hint', 'Lumen hint', this.closeBtn(),
      h('div', { class: 'lumen-head' }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '', class: 'lumen-big' }), h('h2', {}, 'Lumen')),
      h('p', { class: 'hint-depth' }, `Hint ${hint.hint.depth} of 4 · ${cur.title}`),
      h('p', { class: 'hint-text' }, hint.hint.text),
      h('p', { class: 'fine' }, 'Asking for help never lowers your XP or blocks an award.'),
      h('div', { class: 'row' },
        hint.hint.depth < 4 ? h('button', { onclick: () => this.askLumen() }, 'More help') : null,
        h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Thanks')));
    void box;
  }

  // ------------------------------------------------------------ events

  private handleEvents(events: GameEvent[]): void {
    // One XP toast per action, not one per criterion.
    const xp = events.filter((e) => e.kind === 'xp').reduce((n, e) => n + (e as Extract<GameEvent, { kind: 'xp' }>).amount, 0);
    if (xp) events = [...events.filter((e) => e.kind !== 'xp'), { kind: 'xp', amount: xp }];
    const c = ctx.controller;
    for (const e of events) {
      switch (e.kind) {
        case 'card': { const card = c.pack.cards.find((x) => x.id === e.id); this.toast(`New evidence card: ${card?.title}`, 'card'); this.sfx('sfx.page'); break; }
        case 'item': { const it = c.pack.items.find((x) => x.id === e.id); this.toast(`${e.qty > 0 ? 'Received' : 'Gave'}: ${it?.name ?? e.id}`, 'item'); this.sfx('sfx.pickup'); break; }
        case 'stone': {
          const q = c.pack.questions.find((x) => x.id === e.question);
          if (q) this.toast(`Lumen's last word: ${q.lastWord}${e.newWay ? ` (Question Stone: ${Math.min(e.ways, 5)} of 5 ways)` : ''}`, 'info');
          break;
        }
        case 'marks': this.toast(`${e.delta > 0 ? '+' : ''}${e.delta} marks`, 'item'); this.sfx('sfx.coins'); break;
        case 'objective':
          this.toast(`Step complete: ${e.title}`, 'objective'); this.sfx('sfx.complete');
          if (e.id === 'm02.o8.ise') this.pendingChapterEnd = true;
          break;
        case 'award': this.toast(`${e.award.kind === 'badge' ? 'Badge' : e.award.kind === 'skill-milestone' ? 'Skill milestone' : 'Concept award'}: ${e.award.name}. ${e.award.earnedBy}`, 'award'); this.sfx('sfx.award'); ctx.world?.lumenBurst(); break;
        case 'xp': {
          this.toast(`+${e.amount} concept XP (permanent)`, 'xp');
          // A ring closes: a small celebration, once per concept per session.
          for (const r of conceptRings(c.permanent, c.pack)) if (r.got >= r.max && !this.fullRings.has(r.concept)) {
            this.fullRings.add(r.concept);
            this.toast(`The ${CONCEPT_NAMES[r.concept]} ring is complete!`, 'award'); this.sfx('sfx.award');
          }
          break;
        }
        case 'checkpoint': this.toast(`Checkpoint saved: ${e.label}`, 'save'); break;
        case 'error': this.toast(e.message, 'error'); break;
        case 'moment': this.toast(`Learner profile moment: ${PROFILE_NAMES[e.moment.attribute]}. ${e.moment.did}`, 'moment'); break;
        case 'portfolio': this.toast(`Added to your portfolio: ${e.title}`, 'info'); break;
        case 'fray': this.toast(`New in your Fray Bestiary: ${e.name} (${e.error.toLowerCase()}). See Journal, Fray Bestiary.`, 'info'); break;
        case 'reflection': { const m = e.misconception; this.whenFree(() => this.offerReflection(m.title, m.reflection)); break; }
        case 'event-due': { const id = e.event; this.whenFree(() => this.showEvent(id)); break; }
        default: break;
      }
    }
    this.refreshHud();
    ctx.world?.refreshWorld();
  }

  // ------------------------------------------------- events and reflection

  /** An event from the deck (spec 93). Calm mode warns first and lets the player delay it. */
  private showEvent(id: string): void {
    const c = ctx.controller;
    const ev = c.pack.events.find((x) => x.id === id);
    if (!ev || c.state.events.pending !== id) return;
    const play = () => { this.closeModal(false); this.activeEvent = id; this.showNode(ev.node); };
    if (!ctx.settings.calmMode && !ctx.settings.zenMode) { play(); return; }
    this.openModal('event', ev.title,
      h('h2', {}, ev.title), h('p', {}, ev.calm),
      h('p', { class: 'fine' }, 'Nothing here is timed, and waiting costs you nothing.'),
      h('div', { class: 'row' },
        h('button', { class: 'primary', 'data-autofocus': true, onclick: play }, 'Now'),
        h('button', { onclick: () => { c.dispatch({ type: 'DelayEvent' }); this.closeModal(); } }, 'Later')));
  }

  /** A reflection offer at the student threshold (spec 95.1). Never "wrong", always optional. */
  private offerReflection(title: string, question: string): void {
    const ta = h('textarea', { rows: '3', maxlength: '500', 'aria-label': 'Your reflection (optional)', placeholder: 'Write a few words, or leave it empty.' }) as HTMLTextAreaElement;
    this.openModal('reflection', 'A question to think about', this.closeBtn(),
      h('div', { class: 'lumen-head' }, h('img', { src: artURL(lumenArt(ctx.settings)), alt: '', class: 'lumen-big' }), h('h2', {}, 'A question to think about')),
      h('p', { class: 'fine' }, `Lumen noticed a pattern in your play: ${title.toLowerCase()}. This is not a mark. It may even be wrong.`),
      h('p', { class: 'hint-text' }, question), ta,
      h('div', { class: 'row' },
        h('button', { class: 'primary', onclick: () => { if (ta.value.trim()) ctx.controller.dispatch({ type: 'AddNote', text: `Reflection: ${ta.value}` }); this.closeModal(); } }, 'Keep it in my journal'),
        h('button', { onclick: () => this.closeModal() }, 'Not now')));
  }

  /** Close a conversation, then open the tool it names and finish an event. */
  private endDialogue(open?: string): void {
    this.closeModal(false);
    if (this.activeEvent) { const id = this.activeEvent; this.activeEvent = null; ctx.controller.dispatch({ type: 'ResolveEvent', event: id }); }
    if (!open) return;
    const [kind, id] = open.split(':');
    if (kind === 'showdown') this.openShowdown(id);
    else if (kind === 'label') this.openLabel(id);
    else if (kind === 'forge') this.openForge();
    else if (kind === 'assay') this.openAssay('AE-ASSAY');
    else if (kind === 'lock') this.openLock(id);
  }

  // ---------------------------------------------------------- dialogue

  openDialogue(characterId: string): void {
    const c = ctx.controller;
    const node = c.engine.talkEntry(characterId, c.state);
    if (!node) return;
    this.sfx('sfx.open');
    this.showNode(node);
  }

  private showNode(id: string): void {
    const c = ctx.controller;
    const ev = c.dispatch({ type: 'EnterNode', node: id });
    if (ev.some((e) => e.kind === 'error')) { this.closeModal(); return; }
    const raw: DialogueNode = c.engine.node(id);
    const n: DialogueNode = { ...raw, text: personalise(raw.text, c.state.player) };
    const speaker = n.speaker === 'lumen' ? { name: 'Lumen', role: 'Fairy guide', sprite: '' }
      : n.speaker === 'narrator' ? { name: '', role: '', sprite: '' } : c.pack.characters.find((x) => x.id === n.speaker);
    const portrait = n.speaker === 'lumen'
      ? h('img', { class: 'portrait lumen-portrait', src: artURL(lumenArt(ctx.settings)), alt: '' })
      : n.speaker === 'narrator' ? null
      : String((speaker as any)?.sprite ?? '').startsWith('custom:')
        ? h('span', { class: 'portrait custom', 'aria-hidden': 'true' }, previewLook((speaker as any).sprite, 3))
        : h('span', { class: 'portrait', style: { backgroundImage: `url(assets/art/generated/characters/${(speaker as any)?.sprite}.png)` }, 'aria-hidden': 'true' });
    const opts = c.engine.visibleOptions(id, c.state);
    const optionList = h('div', { class: 'options' });
    if (opts.length) {
      opts.forEach((o, i) => optionList.append(h('button', { 'data-autofocus': i === 0, onclick: () => {
        if (ctx.settings.talkSounds) bark(PLAYER_VOICES.find((x) => x.id === ctx.settings.playerVoice)?.v ?? null, ctx.settings.sfxVolume); else this.sfx('sfx.click');
        const r = c.dispatch({ type: 'ChooseDialogueOption', node: id, index: o.index }) as any;
        if (r.some((e: GameEvent) => e.kind === 'error')) return;
        const next = r.nextNode as string | null;
        if (next) this.showNode(next); else this.endDialogue(o.option.open);
      } }, h('span', { class: 'num', 'aria-hidden': 'true' }, `${i + 1}`), o.option.tag ? h('em', {}, `${o.option.tag}: `) : null, personalise(o.option.text, c.state.player))));
    } else {
      optionList.append(h('button', { 'data-autofocus': true, onclick: () => { this.sfx('sfx.click'); if (n.next) this.showNode(n.next); else this.endDialogue(n.open); } }, n.next ? 'Continue ▸' : 'Close'));
    }
    const extra = id === 'sefa.free' ? this.freeQuestion() : null;
    this.openModal('dialogue', speaker?.name ? `Conversation with ${speaker.name}` : 'Scene',
      speaker?.name ? h('div', { class: 'speaker' }, portrait, h('div', {}, h('strong', {}, speaker.name), h('small', {}, speaker.role ?? ''))) : '',
      this.glossLine(n.text),
      'speechSynthesis' in window ? h('button', { class: 'mini speak', type: 'button', 'aria-label': 'Read this line aloud', onclick: () => this.speak(`${speaker?.name ? `${speaker.name}: ` : ''}${n.text}`) }, '🔊 Read aloud') : '',
      h('div', { class: 'chips' }, n.claimKind ? claimChip(n.claimKind) : null, n.historicalLabel ? histChip(n.historicalLabel) : null),
      extra ?? '', optionList);
    if (!ctx.settings.readAloud && ctx.settings.talkSounds && n.speaker !== 'narrator') babble(n.text, voiceFor(n.speaker), ctx.settings.sfxVolume);
    if (ctx.settings.readAloud) this.speak(`${speaker?.name ? `${speaker.name}: ` : ''}${n.text}. ${opts.map((o, i) => `Option ${i + 1}: ${o.option.text}`).join('. ')}`);
  }

  /** Text-to-speech with the browser's own voice (spec 21). */
  speak(text: string): void {
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-GB';
      u.rate = 0.95;
      synth.speak(u);
    } catch { /* no speech support */ }
  }

  /** Dialogue text with tappable glossary words (spec 47.10). */
  private glossLine(text: string): HTMLElement {
    const c = ctx.controller;
    if (!ctx.settings.glossary) return h('p', { class: 'line' }, text);
    const pop = h('div', { class: 'gloss-pop', role: 'note', 'aria-live': 'polite', style: { display: 'none' } });
    const line = h('p', { class: 'line' }, ...segmentText(text, c.pack.glossary).map((sg) => sg.term
      ? h('button', { type: 'button', class: 'gloss', 'aria-label': `${sg.text}: explain this word`, onclick: () => this.fillGloss(sg.term!, pop) }, sg.text)
      : sg.text));
    return h('div', {}, line, pop);
  }

  private fillGloss(id: string, pop: HTMLElement): void {
    const c = ctx.controller;
    const g = c.pack.glossary.find((x) => x.id === id);
    if (!g) return;
    clear(pop);
    const ex = exampleFor(g, c.state, (cond) => c.check(cond));
    pop.append(h('img', { src: artURL(lumenArt(ctx.settings)), alt: '', class: 'gloss-lumen' }),
      h('div', {}, h('strong', {}, g.term), ' ', g.text, ex ? h('p', { class: 'fine' }, h('em', {}, 'From your play: '), ex) : ''));
    pop.style.display = '';
  }

  /**
   * Free question to Sefa. Keyword search over prepared topics only.
   * Unsupported questions get an honest fallback (spec 22.3, 27.1).
   */
  private freeQuestion(): HTMLElement {
    const input = h('input', { type: 'text', maxlength: '200', placeholder: 'Type a question…', 'aria-label': 'Your question', 'data-autofocus': true }) as HTMLInputElement;
    const out = h('div', { class: 'free-out', role: 'status', 'aria-live': 'polite' });
    const topics: [RegExp, string][] = [
      [/wootz|crucible|ingot/i, 'sefa.wootz'],
      [/example|museum|met\b|record|probabl/i, 'sefa.example'],
    ];
    const ask = () => {
      const q = input.value.trim();
      if (!q) return;
      const hit = topics.find(([re]) => re.test(q));
      clear(out);
      if (hit) { this.showNode(hit[1]); return; }
      out.append(h('p', {}, 'Sefa: "I have no prepared answer for that. Choose one of my topics, or keep the question in your journal."'),
        h('button', { onclick: () => { ctx.controller.dispatch({ type: 'AddNote', text: `Question for Sefa: ${q}` }); this.toast('Saved to your journal notes', 'info'); input.value = ''; } }, 'Keep it in my journal'));
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') ask(); });
    return h('div', { class: 'free' }, h('p', { class: 'fine' }, 'Sefa can answer prepared topics: wootz, crucible steel, ingots and the museum example. Other questions are kept in your journal. Nothing you type is sent anywhere.'),
      h('div', { class: 'row' }, input, h('button', { onclick: ask }, 'Ask')), out);
  }

  // ----------------------------------------------------------- exhibit

  openExhibit(exhibitId: string): void {
    const c = ctx.controller;
    const ex = c.pack.exhibits.find((x) => x.id === exhibitId)!;
    c.dispatch({ type: 'InspectExhibit', exhibit: exhibitId });
    this.sfx('sfx.book');
    const lensOut = h('div', { class: 'lens-out', role: 'status', 'aria-live': 'polite' });
    const showLens = () => { clear(lensOut); lensOut.append(h('p', {}, h('strong', {}, 'Date-Kind Lens: '), ex.dateKind)); };
    if (c.state.flags[`lens.${exhibitId}`]) showLens();
    const hasLens = !!c.state.inventory['tool.date-lens'];
    const card = c.pack.cards.find((x) => x.id === ex.grantsCard)!;
    const thread = c.state.inventory['tool.provenance-thread'] ? c.pack.threads.find((t) => t.object === exhibitId) : undefined;
    this.openModal('exhibit', ex.name, this.closeBtn(),
      h('div', { class: 'exhibit-grid' },
        h('figure', {}, h('img', { class: 'big-art', src: artURL(BIG_ART[ex.art] ?? 'big.patent'), alt: ex.altText }), h('figcaption', {}, 'Original game illustration based on the written record.')),
        h('div', {},
          h('h2', {}, ex.name),
          h('div', { class: 'chips' }, histChip(ex.historicalLabel)),
          h('p', { class: 'date' }, h('strong', {}, 'Date: '), ex.dateText),
          h('p', {}, ex.summary),
          ex.sources.length ? h('p', { class: 'sources' }, h('strong', {}, 'Sources: '), ...ex.sources.flatMap((sid) => {
            const s = c.pack.sources.find((x) => x.id === sid)!;
            return [h('a', { href: s.url, target: '_blank', rel: 'noopener' }, `${s.id}: ${s.title}`), ' '];
          })) : h('p', { class: 'sources fine' }, 'No historical source: this object belongs to the game world or is a modern reconstruction.'),
          hasLens ? h('button', { 'data-autofocus': true, onclick: () => { c.dispatch({ type: 'UseLens', exhibit: exhibitId }); this.sfx('sfx.sparkle'); showLens(); } }, 'Use Date-Kind Lens') : null,
          lensOut,
          ex.labelKit ? h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => this.openLabel(ex.labelKit!) }, c.state.flags[`label.${ex.labelKit}.everHeld`] ? 'Change this plaque' : 'Repair this plaque')) : null,
          thread ? h('div', { class: 'row' }, h('button', { class: 'primary', onclick: () => this.followThread(thread.id, thread.nodes[0].id) }, 'Follow the Provenance Thread')) : null,
          h('div', { class: 'card-mini' }, h('p', { class: 'fine' }, 'Evidence card in your journal:'), this.cardView(card)))));
  }

  private cardView(card: EvidenceCard, extra?: Node): HTMLElement {
    return h('article', { class: 'card' },
      h('h3', {}, card.title),
      h('div', { class: 'chips' }, claimChip(card.claimKind), histChip(card.historicalLabel)),
      card.person ? h('p', { class: 'fine' }, `${card.person.name} (${card.person.life}) · ${card.person.region} · ${card.person.era}`) : null,
      h('p', {}, card.text),
      h('p', { class: 'limits' }, h('strong', {}, 'Does not show: '), card.limits),
      card.sources.length ? h('p', { class: 'fine' }, ...card.sources.map((sid) => {
        const s = ctx.controller.pack.sources.find((x) => x.id === sid)!;
        return h('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.id);
      })) : null,
      extra ?? null);
  }

  showSign(title: string, text: string): void {
    this.openModal('sign', title, this.closeBtn(), h('h2', {}, title), h('p', {}, text),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  // ----------------------------------------------- bench: marking test

  openBench(): void {
    const c = ctx.controller;
    if (!c.state.flags['talked.ise']) { this.toast('Report to Warden Ise first.', 'info'); return; }
    let pen = 'loud-model', surface = 'paper';
    const history = h('ol', { class: 'history' });
    const result = h('div', { class: 'sim-result', role: 'status', 'aria-live': 'polite' });
    const radios = (name: string, opts: Record<string, string>, cur: string, set: (v: string) => void) =>
      h('fieldset', {}, h('legend', {}, name), ...Object.entries(opts).map(([v, label]) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name, value: v, checked: v === cur, onchange: () => set(v) }), ` ${label}`)));
    const run = () => {
      const ev = c.dispatch({ type: 'RunSimulation', pen, surface });
      const r = (ev.find((e) => e.kind === 'simulation') as any)?.result as SimulationResult | undefined;
      if (!r) return;
      this.sfx('sfx.metal');
      clear(result);
      result.append(this.markCanvas(r.markQuality), h('p', {}, r.note),
        h('p', { class: r.fairTest ? 'fair' : 'unfair' }, r.testCount === 1 ? 'First test. Run another to compare.' : r.fairTest ? 'Fair comparison: you changed exactly one thing since the last test.' : 'Not a fair comparison: you changed both the pen and the surface (or nothing). You cannot tell which change made the difference.'));
      history.append(h('li', {}, `${PEN_NAMES[r.pen]} on ${SURFACES[r.surface].toLowerCase()}: mark quality ${r.markQuality}/3${r.fairTest ? ' (fair comparison)' : ''}`));
    };
    this.openModal('bench', 'Marking test', this.closeBtn(),
      h('h2', {}, 'Workshop bench: marking test'),
      h('div', { class: 'chips' }, claimChip('simulation'), histChip('reconstruction')),
      h('p', { class: 'fine' }, 'A controlled simulation. The values are MODEL ASSUMPTIONS for play, not measurements of historical pens. Change one thing at a time.'),
      h('div', { class: 'two-col' }, radios('Pen', PEN_NAMES, pen, (v) => { pen = v; }), radios('Surface', SURFACES, surface, (v) => { surface = v; })),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: run }, 'Run test')),
      result, h('h3', {}, 'Your tests'), history);
  }

  private markCanvas(q: number): HTMLElement {
    const cv = h('canvas', { width: '160', height: '24', class: 'mark', role: 'img', 'aria-label': `Mark quality ${q} out of 3` }) as HTMLCanvasElement;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#efe4c4'; g.fillRect(0, 0, 160, 24);
    g.fillStyle = '#1d2b45';
    for (let x = 6; x < 154; x++) {
      const skip = q === 1 ? (x % 9 < 5) : q === 2 ? (x % 17 < 3) : false;
      if (!skip) g.fillRect(x, 11 + Math.round(Math.sin(x / 9) * 2), 1, q === 3 ? 2 : q === 2 ? 2 : 1);
    }
    return cv;
  }

  // ------------------------------------------------- label builder (29.1 item 2)

  /**
   * Build a label from a subject, a criterion and a limit. Visitors read it
   * and repeat it; the gold glow fades when force matches support. The game
   * never says "wrong": the world responds (PLAY-001, spec 2.11).
   */
  openLabel(kitId: string): void {
    const c = ctx.controller;
    const kit = c.pack.labelKits.find((k) => k.id === kitId);
    if (!kit) return;
    // Cold open: before the recruit talks to Ise, the stand only shows the old label.
    if (kit.id === 'pen' && !c.state.flags['talked.ise']) {
      c.dispatch({ type: 'SetFlag', flag: 'read.oldlabel', value: true });
      this.openModal('label-panel', 'The old label', this.closeBtn(),
        h('h2', {}, 'The old label'),
        h('p', { class: 'fray-label', 'aria-describedby': 'fray-note' }, kit.oldLabel),
        h('p', { id: 'fray-note', class: 'fine' }, 'The label glows a sickly gold. A visitor reads it aloud in a flat voice, and her friend repeats it word for word. Nobody looks at the exhibits.'),
        h('p', {}, 'Warden Ise is waiting for you in the centre of the hall.'),
        h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
      return;
    }
    const prev = (k: string, d: string) => String(c.state.flags[`label.${kit.id}.${k}`] ?? d);
    const choice = { subject: prev('subject', kit.subjects[0].id), criterion: prev('criterion', kit.criteria[0].id), limit: prev('limit', kit.limits[0].id) };
    const preview = h('p', { class: 'label-preview', 'aria-live': 'polite' });
    const result = h('div', { class: 'label-result', role: 'status', 'aria-live': 'polite' });
    const update = () => { clear(preview); preview.append(labelText(kit, choice)); };
    const group = (legend: string, name: keyof typeof choice, opts: { id: string; text: string }[], note: (id: string) => string) =>
      h('fieldset', {}, h('legend', {}, legend), ...opts.map((o) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name: `${kit.id}-${name}`, value: o.id, checked: choice[name] === o.id, onchange: () => { choice[name] = o.id; update(); } }),
        ` ${o.text || '(no limit)'}`, note(o.id) ? h('small', { class: 'fine' }, ` ${note(o.id)}`) : '')));
    const put = () => {
      const ev = c.dispatch({ type: 'BuildLabel', kit: kit.id, ...choice });
      const r = (ev.find((e) => e.kind === 'label') as Extract<GameEvent, { kind: 'label' }> | undefined)?.result;
      if (!r) return;
      this.sfx(r.holds ? 'sfx.sparkle' : 'sfx.page');
      clear(result);
      result.append(this.labelOutcome(r));
      result.scrollIntoView({ block: 'nearest', behavior: ctx.settings.reducedMotion ? 'auto' : 'smooth' });
    };
    const held = kit.supports.flatMap((x) => x.cards.map((k) => k.card)).filter((id, i, a) => a.indexOf(id) === i && c.state.cards.includes(id));
    update();
    this.openModal('label-panel wide', kit.title, this.closeBtn(),
      h('h2', {}, kit.title),
      h('p', {}, h('span', { class: 'fine' }, 'Old label: '), h('span', { class: c.state.flags[`label.${kit.id}.holds`] ? '' : 'fray-label small' }, kit.oldLabel)),
      h('p', { class: 'fine' }, kit.legends?.intro ?? 'Build a label that visitors can repeat correctly. A bigger claim needs more support. A limit makes a claim smaller. Many labels can hold.'),
      kit.subjects.length > 1 ? group(kit.legends?.subject ?? 'Who or what', 'subject', kit.subjects, () => '') : '',
      group(kit.legends?.criterion ?? 'What kind of "first"', 'criterion', kit.criteria, (id) => `(force ${kit.criteria.find((x) => x.id === id)!.force})`),
      group(kit.legends?.limit ?? 'A limit (optional)', 'limit', kit.limits, (id) => { const l = kit.limits.find((x) => x.id === id)!; return l.lower ? `(force −${l.lower})` : ''; }),
      h('h3', {}, kit.sentence ? 'Your claim' : 'Your label'), preview,
      h('p', { class: 'fine' }, held.length ? `Cards you hold that may support a label here: ${held.map((id) => c.pack.cards.find((x) => x.id === id)?.title).join('; ')}.` : 'You hold no cards for this label yet. Inspect the exhibits and talk to people first.'),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: put }, kit.legends?.button ?? 'Put up the label')),
      result);
  }

  private labelOutcome(r: LabelResult): HTMLElement {
    const force = r.force - r.lower;
    return h('div', {},
      h('p', { class: r.holds ? 'fair' : 'unfair' }, r.holds ? 'The label holds. The gold glow fades.' : 'The gold glow stays on the label.'),
      h('p', {}, r.heard),
      h('div', { class: 'meter', role: 'img', 'aria-label': `Force ${force}, support ${r.support}` },
        h('span', {}, `Force ${force}`), h('span', { class: 'bar' }, h('i', { style: { width: `${Math.min(100, force * 20)}%` } })),
        h('span', {}, `Support ${r.support}`), h('span', { class: 'bar sup' }, h('i', { style: { width: `${Math.min(100, r.support * 20)}%` } }))),
      h('p', { class: 'fine' }, r.used.length ? `Support came from: ${r.used.map((id) => ctx.controller.pack.cards.find((x) => x.id === id)?.title).join('; ')}.` : 'None of your cards supports this exact label.'));
  }

  // ------------------------------------------------- Title Lock (EE practice, 92.2)

  /** Word puzzles: Sign-Smith lock (rounds) and Citation Thread bridge (order). */
  openPuzzle(puzzleId: string): void {
    const c = ctx.controller;
    const rec = c.pack.puzzles.find((x) => x.id === puzzleId);
    if (!rec) return;
    const F = `puzzle.${rec.id}`;
    if (rec.needs && !c.state.inventory[rec.needs.item]) {
      this.openModal('puzzle-panel', rec.title, this.closeBtn(), h('h2', {}, rec.title), h('p', {}, rec.needs.sealed),
        h('div', { class: 'row' }, h('button', { 'data-autofocus': true, onclick: () => this.closeModal() }, 'Leave it for now')));
      return;
    }
    const box = this.openModal('puzzle-panel wide', rec.title);
    let feedback: { ok: boolean; text: string } | null = null;
    let placed: string[] = [];
    let gapAt: number | null = null;
    let pan: string[] = [];
    let panRound = -1;
    let pickMethod: string | null = null;
    let activeW: string | null = null;
    const sightNotes = new Map<string, string>();
    // A fixed shuffle (not random), so the tiles never sit in the answer order.
    const pool = rec.type === 'order' ? [...rec.tiles].sort((a, b) => (a.id.length * 7 + a.text.length) % 5 - (b.id.length * 7 + b.text.length) % 5 || a.text.localeCompare(b.text)) : [];
    const take = (ev: GameEvent[]) => {
      const r = ev.find((e) => e.kind === 'puzzle') as Extract<GameEvent, { kind: 'puzzle' }> | undefined;
      if (!r) return;
      feedback = { ok: r.ok, text: r.text }; gapAt = r.gapAt ?? null;
      this.sfx(r.ok ? 'sfx.sparkle' : 'sfx.page');
      render();
    };
    const render = () => {
      const done = c.state.flags[`${F}.done`] === true;
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', {}, rec.intro));
      if (rec.type === 'rounds') {
        const n = Number(c.state.flags[`${F}.rounds`] ?? 0);
        box.append(h('p', { class: 'fine' }, `Notice ${Math.min(n + 1, rec.rounds.length)} of ${rec.rounds.length}`));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (n < rec.rounds.length) {
          const r = rec.rounds[n];
          box.append(h('h3', {}, r.prompt), h('div', { class: 'options notice-options' },
            ...r.options.map((o, i) => h('button', { type: 'button', onclick: () => take(c.dispatch({ type: 'PuzzleRound', puzzle: rec.id, round: n, index: i })) }, h('span', { class: 'notice-text' }, o.text)))));
        } else if (done) box.append(h('p', { class: 'fair' }, 'All three notices are up. The gate is open.'));
      } else if (rec.type === 'balance') {
        const n = Number(c.state.flags[`${F}.rounds`] ?? 0);
        if (n !== panRound) { pan = []; panRound = n; }
        box.append(h('p', { class: 'fine' }, `Weighing ${Math.min(n + 1, rec.rounds.length)} of ${rec.rounds.length}`));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (n < rec.rounds.length) {
          const r = rec.rounds[n];
          const on = pan.map((id) => r.weights.find((w) => w.id === id)!);
          const sum = on.reduce((a, w) => a + w.mass, 0);
          const t = tiltOf(r.load.mass, sum);
          const deg = t === 0 ? 0 : t * Math.min(12, 4 + Math.abs(sum - r.load.mass) * 2);
          box.append(h('h3', {}, r.prompt), balanceSvg(r.load.label, on.map((w) => ({ label: w.label, mass: w.mass, untrusted: !!w.untrusted })), deg),
            h('p', { class: 'fine', 'aria-live': 'polite' }, t === 0 ? 'The beam is level.' : t > 0 ? 'The weights pan is lower.' : 'The load pan is lower.'),
            h('h3', {}, 'Weights on the pan'),
            h('div', { class: 'row wrap tiles on-pan' }, ...(on.length ? on.map((w) => h('button', { type: 'button', class: `weight ${w.untrusted ? 'untrusted' : ''}`, title: 'Take it off', onclick: () => { pan = pan.filter((x) => x !== w.id); this.sfx('sfx.click'); render(); } }, w.label))
              : [h('span', { class: 'fine' }, 'None yet.')])),
            h('h3', {}, 'Weights in the tray'),
            h('div', { class: 'row wrap tiles tray' }, ...r.weights.filter((w) => !pan.includes(w.id)).map((w) => h('button', { type: 'button', class: `weight ${w.untrusted ? 'untrusted' : ''}`, onclick: () => { pan.push(w.id); feedback = null; this.sfx('sfx.metal'); render(); } }, w.label))),
            h('div', { class: 'row' },
              h('button', { class: 'primary', onclick: () => take(c.dispatch({ type: 'PuzzleWeigh', puzzle: rec.id, round: n, weights: [...pan] })) }, 'Record this weighing'),
              h('button', { onclick: () => { pan = []; feedback = null; render(); } }, 'Clear the pan')));
        } else if (done) box.append(h('p', { class: 'fair' }, 'Every weighing is in the record book.'));
      } else if (rec.type === 'conjecture') {
        const n = Number(c.state.flags[`${F}.n`] ?? 0);
        const predicted = typeof c.state.flags[`${F}.predict`] === 'number';
        const table = h('table', { class: 'pane-table' }, h('thead', {}, h('tr', {}, h('th', {}, 'Points'), h('th', {}, 'Panes counted'), h('th', {}, 'Doubling rule says'))),
          h('tbody', {}, ...Array.from({ length: rec.angles.length }, (_, i) => i + 1).map((k) => h('tr', { class: k <= n && panes(k) !== 2 ** (k - 1) ? 'broke' : '' },
            h('td', {}, String(k)), h('td', {}, k <= n ? String(panes(k)) : '?'), h('td', {}, k <= n || k === rec.predictAt ? String(2 ** (k - 1)) : '')))));
        box.append(h('p', { class: 'fine' }, `Imre's rule: ${rec.claim}`),
          h('div', { class: 'conj-top' }, h('div', { class: 'glass-wrap' }, n ? glassWindow(rec.angles.slice(0, n), done) : h('div', { class: 'glass-empty' }, 'An empty frame')), table));
        if (n < rec.angles.length && !(n + 1 === rec.predictAt && !predicted)) {
          box.append(h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => { take(c.dispatch({ type: 'PuzzleAddPoint', puzzle: rec.id })); chime(ctx.settings.sfxVolume * 0.6); caption('amb.chime'); } }, n ? 'Add a point and join it with lead' : 'Put the first point on the circle')));
        } else if (n + 1 === rec.predictAt && !predicted) {
          box.append(h('h3', {}, `Before you add point ${rec.predictAt}: what do you expect?`), h('p', { class: 'fine' }, 'Any answer is fine. This is your guess, not a test.'),
            h('div', { class: 'options notice-options' }, ...rec.predictions.map((pr, i) => h('button', { type: 'button', onclick: () => take(c.dispatch({ type: 'PuzzlePredict', puzzle: rec.id, index: i })) }, h('span', { class: 'notice-text' }, pr.text)))));
        }
        if (n >= rec.predictAt && !done) {
          box.append(h('h3', {}, `${panes(rec.predictAt)} panes, not ${2 ** (rec.predictAt - 1)}. What does this show?`),
            h('div', { class: 'options notice-options' }, ...rec.reflect.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text)))));
        }
        if (done) {
          const f = chordFigure(rec.angles.slice(0, n));
          box.append(h('details', { class: 'proof-box', open: true }, h('summary', {}, 'Show me why (a proof)'),
            h('ol', {}, ...rec.proof.map((t) => h('li', {}, t))),
            h('p', { class: 'fair' }, `Your window now: 1 + ${f.chords} chords + ${f.crossings} crossings = ${1 + f.chords + f.crossings} panes.`)));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'sightlines') {
        const judged = (w: string, i: number) => c.state.flags[`${F}.c.${w}.${i}`] === true;
        const all = rec.witnesses.every((w) => w.claims.every((_, i) => judged(w.id, i)));
        const letters = 'ABCDEFGH';
        box.append(h('div', { class: 'sight-top' },
          sightMapSvg(rec, activeW, (id) => { activeW = id; this.sfx('sfx.click'); render(); }),
          h('div', { class: 'sight-legend' },
            h('p', { class: 'fine' }, 'Click a person on the map, or a name below.'),
            h('ul', {}, ...rec.spots.map((sp, i) => h('li', {}, h('strong', {}, `${letters[i]}: `), sp.label))),
            h('p', { class: 'fine' }, '━ Blue: a clear view. ✕ Orange: something is in the way.'))));
        box.append(h('div', { class: 'witness-grid' }, ...rec.witnesses.map((w) => h('div', { class: `witness-card ${activeW === w.id ? 'active' : ''}` },
          h('button', { type: 'button', class: 'who', style: { borderColor: w.colour }, 'aria-pressed': String(activeW === w.id), onclick: () => { activeW = w.id; render(); } },
            h('span', { class: 'dot', style: { background: w.colour } }), `${w.name}: draw sightlines`),
          ...w.claims.map((cl, i) => {
            const key = `${w.id}.${i}`;
            return h('div', { class: `claim ${judged(w.id, i) ? 'sorted' : ''}` }, h('p', {}, `“${cl.text}”`),
              judged(w.id, i) ? h('p', { class: 'fine' }, sightNotes.get(key) ?? 'Sorted.')
                : h('div', { class: 'row' },
                  ...([[true, 'Saw it'], [false, 'Could not see it']] as const).map(([saw, t]) => h('button', { type: 'button', onclick: () => {
                    const ev = c.dispatch({ type: 'PuzzleSight', puzzle: rec.id, witness: w.id, claim: i, saw });
                    const r = ev.find((e) => e.kind === 'puzzle') as Extract<GameEvent, { kind: 'puzzle' }> | undefined;
                    if (r?.ok) sightNotes.set(key, r.text);
                    activeW = w.id; take(ev);
                  } }, t))));
          })))));
        if (all) {
          box.append(h('h3', {}, done ? 'Your report' : 'Write the report for the driver'),
            done ? h('p', { class: 'fair' }, rec.reports.find((r) => r.honest)!.text)
              : h('div', { class: 'options notice-options' }, ...rec.reports.map((r, i) => h('button', { type: 'button', onclick: () => { const ev = c.dispatch({ type: 'PuzzleReport', puzzle: rec.id, index: i }); take(ev); if (c.state.flags[`${F}.done`] === true) this.sfx('sfx.complete'); } }, h('span', { class: 'notice-text' }, r.text)))));
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else if (rec.type === 'restore') {
        const seen = Number(c.state.flags[`${F}.peeled`] ?? 0);
        const cur = c.state.flags[`${F}.method`];
        const curM = typeof cur === 'string' ? rec.methods.find((m) => m.id === cur) : undefined;
        if (!pickMethod && curM) pickMethod = curM.id;
        const pm = rec.methods.find((m) => m.id === pickMethod);
        const showFace = done && curM ? curM.face : pm && seen >= rec.layers.length ? pm.face : rec.face;
        box.append(h('div', { class: 'restore-top' },
          h('div', {}, h('p', { class: 'fine' }, done && curM ? `Now: ${curM.label}` : pm ? `Preview: ${pm.label}` : rec.object), plaqueSvg(showFace, rec.object)),
          h('div', {}, h('p', { class: 'fine' }, `Layers seen: ${Math.min(seen, rec.layers.length)} of ${rec.layers.length}`), layerStackSvg(rec.layers, seen, (done && curM ? curM : pm)?.loses ?? []))));
        if (seen < rec.layers.length) {
          box.append(h('h3', {}, 'Step 1. Look under each layer'),
            h('ul', { class: 'layer-notes' }, ...rec.layers.slice(0, seen).map((l) => h('li', {}, h('strong', {}, l.name), ` ${l.text}`))),
            h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => take(c.dispatch({ type: 'PuzzlePeel', puzzle: rec.id })) },
              seen === 0 ? 'Swab a small test patch' : 'Swab one layer deeper')));
        } else {
          box.append(h('details', { class: 'layer-notes-box' }, h('summary', {}, 'Your notes on each layer'),
            h('ul', { class: 'layer-notes' }, ...rec.layers.map((l) => h('li', {}, h('strong', {}, l.name), ` ${l.text}`)))));
          const name = (id: string) => rec.layers.find((l) => l.id === id)?.name ?? id;
          box.append(h('h3', {}, done ? 'Change the method?' : 'Step 2. Choose how to restore it'),
            h('p', { class: 'fine' }, 'Each method is allowed. Each keeps some layers and loses others. Think about the next person who looks at this plaque.'),
            h('div', { class: 'method-grid' }, ...rec.methods.map((m) => {
              const locked = !!curM && !curM.reversible && curM.id !== m.id;
              return h('button', { type: 'button', class: `method-card ${pickMethod === m.id ? 'picked' : ''}`, disabled: locked, 'aria-pressed': String(pickMethod === m.id),
                onclick: () => { pickMethod = m.id; feedback = null; this.sfx('sfx.click'); render(); } },
                h('strong', {}, m.label), h('span', {}, m.does),
                h('span', { class: 'keeps' }, `Keeps: ${m.keeps.map(name).join(', ') || 'nothing'}`),
                h('span', { class: 'loses' }, `Loses: ${m.loses.map(name).join(', ') || 'nothing'}`),
                h('span', { class: `rev ${m.reversible ? 'yes' : 'no'}` }, m.reversible ? '↺ Can be undone later' : '✕ Cannot be undone'),
                locked ? h('span', { class: 'fine' }, `Locked: ${curM!.label.toLowerCase()} cannot be undone.`) : '');
            })));
          if (pm && !(curM && curM.id === pm.id && done)) {
            box.append(h('h3', {}, 'Step 3. Choose the label for the gate'),
              h('p', { class: 'fine' }, 'Visitors will read this label. It must say what you kept and what you changed.'),
              h('div', { class: 'options notice-options' }, ...pm.labels.map((l, i) => h('button', { type: 'button',
                onclick: () => { const ev = c.dispatch({ type: 'PuzzleRestore', puzzle: rec.id, method: pm.id, label: i }); take(ev); if (c.state.flags[`${F}.method`] === pm.id) this.sfx('sfx.complete'); } },
                h('span', { class: 'notice-text' }, l.text)))));
          } else if (done && curM) {
            const lab = curM.labels[Number(c.state.flags[`${F}.label`] ?? 0)];
            box.append(h('p', { class: 'fair' }, `The plaque is back on the gate. Its label says: "${lab?.text ?? ''}"`));
          }
        }
        if (feedback) {
          const fb = h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text);
          box.append(fb); requestAnimationFrame(() => fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
        }
      } else {
        const tile = (id: string) => rec.tiles.find((t) => t.id === id)!;
        box.append(h('div', { class: 'bridge', role: 'list', 'aria-label': 'Your citation, in order' },
          ...(placed.length ? placed : ['']).map((id, i) => id ? h('button', { type: 'button', role: 'listitem', class: `plank ${gapAt === i ? 'gap' : ''}`, title: 'Take this piece off', onclick: () => { placed.splice(i, 1); gapAt = null; feedback = null; render(); } }, tile(id).text)
            : h('span', { class: 'plank empty' }, 'Click the pieces below, in order.'))));
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        box.append(h('h3', {}, 'Pieces'), h('div', { class: 'row wrap tiles' },
          ...pool.filter((t) => !placed.includes(t.id)).map((t) => h('button', { type: 'button', onclick: () => { placed.push(t.id); gapAt = null; render(); } }, t.text))),
          h('div', { class: 'row' },
            h('button', { class: 'primary', onclick: () => take(c.dispatch({ type: 'PuzzleOrder', puzzle: rec.id, order: [...placed] })) }, rec.words ? 'Light the timeline' : 'Test the bridge'),
            h('button', { onclick: () => { placed = []; gapAt = null; feedback = null; render(); } }, 'Start again')));
        if (done && feedback?.ok) box.append(h('p', { class: 'fair' }, rec.words ? 'The door is open.' : 'The bridge holds.'));
      }
    };
    render();
  }


  /**
   * The practice clue board (spec 47): tie evidence cards to claims with yarn.
   * Red yarn challenges Corvan's claim; gold yarn supports one of yours.
   */
  openClueBoard(boardId: string): void {
    const c = ctx.controller;
    const rec = (c.pack.clueBoards ?? []).find((x) => x.id === boardId);
    const sd = rec && c.pack.showdowns.find((x) => x.id === rec.showdown);
    if (!rec || !sd) return;
    const box = this.openModal('clue-panel wide', rec.title);
    let picked: string | null = null;
    let feedback: { tone: string; text: string } | null = null;
    const cardTitle = (id: string) => c.pack.cards.find((x) => x.id === id)?.title ?? id;
    const pinsNow = () => Object.keys(c.state.flags).filter((k) => k.startsWith(`yarn.${rec.id}.`) && c.state.flags[k] === true)
      .map((k) => { const [claim, ...card] = k.slice(`yarn.${rec.id}.`.length).split('.'); return { claim, card: card.join('.') }; });
    const render = () => {
      clear(box);
      const pins = pinsNow();
      const view = viewBoard(sd, pins);
      const claims = [{ id: OPPONENT, text: sd.opponentClaim.text, who: 'Corvan claims' }, ...sd.playerClaims.map((x) => ({ id: x.id, text: x.text, who: 'You could claim' }))];
      const cork = h('div', { class: 'cork' });
      const notes = h('div', { class: 'cork-claims' }, ...claims.map((cl) => {
        const v = view.claims[cl.id];
        const mine = pins.filter((p) => p.claim === cl.id);
        const extra = cl.id === OPPONENT ? h('ul', { class: 'cork-links' }, ...sd.opponentClaim.links.map((l) => h('li', { class: view.cracked.includes(l.id) ? 'cracked' : '' }, view.cracked.includes(l.id) ? `Cracked: ${l.text}` : l.text))) : null;
        return h('button', { type: 'button', class: `cork-note ${cl.id === OPPONENT ? 'theirs' : 'yours'} ${v.glow ? 'glow' : ''}`, 'data-claim': cl.id,
          'aria-label': `${cl.who}: ${cl.text}. ${v.taut} taut, ${v.sag} sagging.${v.glow ? ' Unsupported.' : ''}${picked ? ' Tie the picked card here.' : ''}`,
          onclick: () => {
            if (!picked) { feedback = { tone: 'sag', text: 'Pick a card first, then the claim to tie it to.' }; render(); return; }
            const ev = c.dispatch({ type: 'PinYarn', board: rec.id, claim: cl.id, card: picked });
            const y = ev.find((e) => e.kind === 'yarn') as Extract<GameEvent, { kind: 'yarn' }> | undefined;
            if (y) { feedback = { tone: y.tone, text: `${cardTitle(picked)}: ${y.text}` }; this.sfx(y.tone === 'taut' ? 'sfx.sparkle' : y.tone === 'sag' ? 'sfx.page' : 'sfx.click'); if (y.done) this.sfx('sfx.complete'); }
            picked = null; render();
          } },
          h('span', { class: 'pin' }), h('span', { class: 'fine' }, cl.who), h('strong', {}, cl.text), extra,
          mine.length ? h('span', { class: 'fine' }, `${v.taut} taut${v.sag ? `, ${v.sag} sagging` : ''}`) : h('span', { class: 'fine' }, v.glow ? 'Nothing holds it up yet.' : ''));
      }));
      const held = c.state.cards.filter((id) => c.pack.cards.some((x) => x.id === id));
      const cards = h('div', { class: 'cork-cards' }, ...held.map((id) => h('button', { type: 'button', class: `cork-card ${picked === id ? 'picked' : ''}`, 'data-card': id, 'aria-pressed': picked === id ? 'true' : 'false',
        onclick: () => { picked = picked === id ? null : id; this.sfx('sfx.pickup'); render(); } }, h('span', { class: 'pin' }), cardTitle(id))));
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'yarn-layer'); svg.setAttribute('aria-hidden', 'true');
      cork.append(notes, svg, cards);
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', {}, rec.intro));
      if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.tone === 'taut' ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
      box.append(h('p', { class: 'fine' }, picked ? `Picked: ${cardTitle(picked)}. Now click a claim.` : 'Click a card, then click a claim to tie yarn.'), cork);
      if (pins.length) box.append(h('h3', {}, 'Yarn on the board'), h('ul', { class: 'yarn-list' }, ...pins.map((p) => {
        const v = judgeYarn(sd, p.claim, p.card);
        return h('li', {}, `${v.tone === 'taut' ? 'Taut' : 'Sagging'} ${p.claim === OPPONENT ? 'red' : 'gold'} yarn: ${cardTitle(p.card)} to "${claims.find((x) => x.id === p.claim)?.text}" `,
          h('button', { type: 'button', class: 'link', onclick: () => { c.dispatch({ type: 'UnpinYarn', board: rec.id, claim: p.claim, card: p.card }); feedback = null; render(); } }, 'Untie'));
      })));
      if (view.done) box.append(h('p', { class: 'fair' }, 'Every link of Corvan\'s claim is cracked, and a fair claim of yours holds. You are ready for the Showdown, if you choose it.'));
      // Draw the yarn once the layout is known.
      requestAnimationFrame(() => {
        const base = cork.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${base.width} ${base.height}`); svg.setAttribute('width', String(base.width)); svg.setAttribute('height', String(base.height));
        for (const p of pins) {
          const a = cork.querySelector(`[data-card="${CSS.escape(p.card)}"]`)?.getBoundingClientRect();
          const b = cork.querySelector(`[data-claim="${CSS.escape(p.claim)}"]`)?.getBoundingClientRect();
          if (!a || !b) continue;
          const x1 = a.left + a.width / 2 - base.left, y1 = a.top + 6 - base.top, x2 = b.left + b.width / 2 - base.left, y2 = b.bottom - 6 - base.top;
          const sag = judgeYarn(sd, p.claim, p.card).tone === 'sag' ? 70 : 6;
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', `M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`);
          path.setAttribute('class', `yarn ${p.claim === OPPONENT ? 'red' : 'gold'} ${sag > 10 ? 'sag' : ''}`);
          svg.append(path);
        }
      });
    };
    render();
  }

  /**
   * A Loreling (spec 36.1): watch it, write a pattern note, wait where the note says.
   * After it is a friend: name it, take it into the field or leave it at camp.
   */
  openLoreling(lorelingId: string, sightingId?: string): void {
    const c = ctx.controller;
    const rec = c.pack.lorelings.find((x) => x.id === lorelingId);
    if (!rec) return;
    const F = `lor.${rec.id}`;
    let watched: string | null = null;
    if (sightingId && c.state.flags[`${F}.friend`] !== true) {
      const ev = c.dispatch({ type: 'LorelingWatch', loreling: rec.id, sighting: sightingId });
      const r = ev.find((e) => e.kind === 'loreling') as Extract<GameEvent, { kind: 'loreling' }> | undefined;
      if (r) { watched = sightingId; this.sfx('sfx.page'); }
    }
    const box = this.openModal('loreling-panel wide', rec.name);
    let feedback: { ok: boolean; text: string; recheck?: string | null } | null = null;
    const render = () => {
      const st = c.state;
      const friend = st.flags[`${F}.friend`] === true;
      const seen = rec.sightings.filter((x) => st.flags[`${F}.seen.${x.id}`] === true);
      clear(box);
      box.append(this.closeBtn(), h('div', { class: 'loreling-head' }, h('img', { class: 'moth-big', src: artURL('moth.big'), alt: `${rec.name}: a tiny moth with pale gold wings` }),
        h('div', {}, h('h2', {}, friend ? String(st.flags[`${F}.name`] ?? rec.name) : rec.name), h('p', { class: 'fine' }, `A Loreling of ${CONCEPT_NAMES[rec.concept]}. Lorelings are made up for this game.`))));
      if (!friend) {
        if (!seen.length || (watched && seen.length === 1)) box.append(h('p', {}, rec.intro));
        if (watched) {
          const sg = rec.sightings.find((x) => x.id === watched)!;
          box.append(h('div', { class: 'sighting now' }, h('strong', {}, `You watch at ${sg.place}. `), sg.text));
        }
        box.append(h('h3', {}, `Field notes (${seen.length} of ${rec.sightings.length} places)`),
          h('ul', { class: 'field-notes' }, ...rec.sightings.map((x) => {
            const got = seen.some((y) => y.id === x.id);
            return h('li', { class: `${got ? '' : 'unseen'} ${feedback?.recheck === x.id ? 'recheck' : ''}` }, got ? [h('strong', {}, `${x.place}: `), x.text] : `Not watched yet: ${x.place}.`);
          })));
        if (seen.length < rec.minSightings) {
          box.append(h('p', { class: 'fair' }, `Watch it in ${rec.minSightings - seen.length} more place${rec.minSightings - seen.length === 1 ? '' : 's'} before you write your pattern note. One sighting can mislead.`));
          return;
        }
        box.append(h('h3', {}, 'Your pattern note'), h('p', { class: 'fine' }, 'Choose the answer that fits every place you watched, not just one.'));
        for (const q of rec.questions) {
          const pick = st.flags[`${F}.note.${q.id}`];
          box.append(h('fieldset', { class: 'note-q' }, h('legend', {}, q.prompt), ...q.options.map((o) => h('button', {
            type: 'button', class: pick === o.id ? 'chosen' : '', 'aria-pressed': String(pick === o.id),
            onclick: () => { c.dispatch({ type: 'LorelingNote', loreling: rec.id, question: q.id, option: o.id }); this.sfx('sfx.click'); feedback = null; render(); },
          }, o.text))));
        }
        const ready = rec.questions.every((q) => st.flags[`${F}.note.${q.id}`]);
        if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.ok ? 'ok' : 'sphinx'}`, role: 'status', 'aria-live': 'polite' }, feedback.text));
        if (ready) {
          box.append(h('h3', {}, rec.offer.prompt), h('div', { class: 'options' }, ...rec.offer.options.map((o) => h('button', {
            type: 'button', onclick: () => {
              const ev = c.dispatch({ type: 'LorelingOffer', loreling: rec.id, place: o.id });
              const r = ev.find((e) => e.kind === 'loreling') as Extract<GameEvent, { kind: 'loreling' }> | undefined;
              if (r) { feedback = { ok: r.ok, text: r.text, recheck: r.recheck }; this.sfx(r.ok ? 'sfx.sparkle' : 'sfx.page'); if (r.ok) ctx.world?.lumenBurst(); }
              render();
            },
          }, o.text))));
        }
        return;
      }
      // A friend: name, form and field.
      if (feedback?.ok) box.append(h('div', { class: 'alcove-feedback ok', role: 'status' }, feedback.text));
      const g = lorelingForm(rec, c.pack, st.objectivesDone);
      const form = rec.forms[g.form - 1], next = rec.forms[g.form];
      box.append(h('p', {}, h('strong', {}, `Form ${g.form}: ${form.name}. `), form.power),
        next ? h('p', { class: 'fine' }, `Next form, ${next.name}: ${next.needs ?? ''} So far: ${g.worlds} world${g.worlds === 1 ? '' : 's'}, ${g.actions} kind${g.actions === 1 ? '' : 's'} of action.`) : '');
      const input = h('input', { type: 'text', maxlength: '16', value: String(st.flags[`${F}.name`] ?? rec.name), 'aria-label': 'Name' }) as HTMLInputElement;
      const setName = (n: string) => {
        const ev = c.dispatch({ type: 'LorelingName', loreling: rec.id, name: n });
        if (ev.some((e) => e.kind === 'loreling')) { this.sfx('sfx.sparkle'); feedback = null; render(); }
        else this.toast('A name has 1 to 16 letters, numbers or spaces.', 'info');
      };
      box.append(h('h3', {}, 'Give it a name'), h('div', { class: 'row wrap' }, ...rec.names.map((n) => h('button', { type: 'button', onclick: () => setName(n) }, n))),
        h('div', { class: 'row' }, input, h('button', { onclick: () => setName(input.value) }, 'Use this name')));
      const out = st.flags['lor.out'] === rec.id;
      box.append(h('h3', {}, 'In the field'), h('p', { class: 'fine' }, out ? 'It flies with you and looks for places you have not examined yet.' : 'It rests at camp. Lorelings never fight and never get hurt.'),
        h('button', { class: 'primary', onclick: () => { c.dispatch({ type: 'LorelingField', loreling: rec.id, out: !out }); render(); } }, out ? 'Let it rest at camp' : 'Take it into the field'));
    };
    render();
  }

  /** Exhibition Hall alcove (SYM-001): object, what it shows, and "so what?". */
  openAlcove(alcoveId: string): void {
    const c = ctx.controller;
    const rec = c.pack.alcoves.find((x) => x.id === alcoveId);
    if (!rec) return;
    const F = `alcove.${rec.id}`;
    const box = this.openModal('alcove-panel wide', rec.title);
    let feedback: { cls: string; text: string; who?: string } | null = null;
    const run = (cmd: any) => {
      const ev = c.dispatch(cmd);
      const r = ev.find((e) => e.kind === 'alcove') as Extract<GameEvent, { kind: 'alcove' }> | undefined;
      if (!r) return;
      const who = { mirage: 'Symbol Mirage', golem: 'Checklist Golem', sphinx: 'So-What Sphinx' }[r.result as string];
      feedback = { cls: r.result, text: r.text, who };
      this.sfx(['lit', 'ok'].includes(r.result) ? 'sfx.sparkle' : 'sfx.page');
      render();
    };
    const render = () => {
      const st = c.state;
      const item = st.flags[`${F}.item`] as string | undefined;
      const obj = rec.objects.find((o) => o.card === item);
      const linked = typeof st.flags[`${F}.link`] === 'number';
      const done = st.flags[`${F}.done`] === true;
      const lit = !!obj;
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, rec.title),
        h('p', { class: 'alcove-prompt' }, h('em', {}, 'Alcove card: '), rec.prompt),
        h('div', { class: `alcove-stage ${lit ? 'lit' : 'dark'} ${feedback?.cls ?? ''}`, role: 'img', 'aria-label': lit ? 'The alcove lamps are lit.' : 'The alcove lamps are dark.' },
          h('span', { class: 'lamp' }), h('span', { class: 'plinth' }, lit ? (c.pack.cards.find((x) => x.id === item)?.title ?? '') : feedback?.cls === 'mirage' ? '〰' : '—'), h('span', { class: 'lamp' })));
      if (feedback) box.append(h('div', { class: `alcove-feedback ${feedback.cls}`, role: 'status', 'aria-live': 'polite' }, feedback.who ? h('strong', {}, `${feedback.who}: `) : '', feedback.text));
      const cardBtns = st.cards.map((id) => c.pack.cards.find((x) => x.id === id)).filter(Boolean).map((card) =>
        h('button', { type: 'button', class: item === card!.id ? 'chosen' : '', onclick: () => run({ type: 'AlcovePlace', alcove: rec.id, item: card!.id }) }, card!.title));
      box.append(h('h3', {}, lit ? 'Change the object' : 'Stand something on the plinth'),
        h('div', { class: 'alcove-items' }, h('p', { class: 'fine' }, 'Your evidence cards'), h('div', { class: 'row wrap' }, ...cardBtns),
          h('p', { class: 'fine' }, 'Symbols'), h('div', { class: 'row wrap' }, ...rec.symbols.map((sy) => h('button', { type: 'button', class: 'symbol', onclick: () => run({ type: 'AlcovePlace', alcove: rec.id, item: sy.id }) }, sy.name)))));
      if (obj) {
        box.append(h('h3', {}, 'What knowledge does it show in the world?'), h('div', { class: 'options' },
          ...obj.links.map((l, i) => h('button', { type: 'button', class: st.flags[`${F}.link`] === i ? 'chosen' : '', onclick: () => run({ type: 'AlcoveLink', alcove: rec.id, index: i }) }, l.text))));
      }
      if (obj && linked) {
        box.append(h('h3', {}, 'The So-What Sphinx asks: so what?'), h('div', { class: 'options' },
          ...obj.implications.map((im, i) => h('button', { type: 'button', class: st.flags[`${F}.implication`] === i && done ? 'chosen' : '', onclick: () => run({ type: 'AlcoveImply', alcove: rec.id, index: i }) }, im.text))));
      }
      if (done) box.append(h('p', { class: 'fair' }, 'The alcove is complete. Your alcove card is in your portfolio. You can change the object and try another one.'));
    };
    render();
  }

  openLock(lockId: string): void {
    const c = ctx.controller;
    const rec = c.pack.locks.find((x) => x.id === lockId);
    if (!rec) return;
    const choice: Record<string, string> = {};
    for (const p of rec.parts) choice[p.id] = p.options[0].id;
    const preview = h('p', { class: 'label-preview', 'aria-live': 'polite' });
    const result = h('div', { class: 'label-result', role: 'status', 'aria-live': 'polite' });
    const update = () => { clear(preview); preview.append(rec.parts.map((p) => p.options.find((o) => o.id === choice[p.id])!.text).join(' ').replace(/\s+([?,.])/g, '$1')); };
    const ring = (p: TitleLockRecord['parts'][number]) => h('fieldset', {}, h('legend', {}, p.label),
      ...p.options.map((o) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name: `${rec.id}-${p.id}`, value: o.id, checked: choice[p.id] === o.id, onchange: () => { choice[p.id] = o.id; update(); } }), ` ${o.text}`)));
    const turn = () => {
      const ev = c.dispatch({ type: 'TurnLock', lock: rec.id, choice: { ...choice } });
      const r = (ev.find((e) => e.kind === 'lock') as Extract<GameEvent, { kind: 'lock' }> | undefined)?.result;
      if (!r) return;
      this.sfx(r.opened ? 'sfx.sparkle' : 'sfx.page');
      clear(result);
      result.append(h('p', { class: r.opened ? 'fair' : 'unfair' }, r.opened ? 'The lock opens.' : 'The rings slip back. The lock stays closed.'),
        ...r.lines.map((l) => h('p', {}, l)),
        r.opened ? h('p', { class: 'fine' }, 'Your practice question is in your portfolio. Talk to Archivist Tull for the next step.') : '');
      result.scrollIntoView({ block: 'nearest', behavior: ctx.settings.reducedMotion ? 'auto' : 'smooth' });
    };
    update();
    this.openModal('label-panel wide', rec.title, this.closeBtn(),
      h('h2', {}, `Title Lock: ${rec.title}`),
      h('p', {}, rec.intro),
      ...rec.parts.map(ring),
      h('h3', {}, 'Your question'), preview,
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: turn }, 'Turn the lock')),
      result);
  }

  // ------------------------------------------------- Provenance Thread (12.23)

  followThread(threadId: string, nodeId: string): void {
    const c = ctx.controller;
    const t = c.pack.threads.find((x) => x.id === threadId);
    if (!t) return;
    if (!c.state.inventory['tool.provenance-thread']) { this.toast('You need the Provenance Thread. Warden Ise gives it to Guardians on assignment.', 'info'); return; }
    const ev = c.dispatch({ type: 'FollowThread', thread: threadId, node: nodeId });
    const r = ev.find((e) => e.kind === 'thread') as Extract<GameEvent, { kind: 'thread' }> | undefined;
    if (!r) return;
    this.sfx('sfx.sparkle');
    const node = t.nodes.find((n) => n.id === nodeId)!;
    const next = t.nodes[t.nodes.indexOf(node) + 1];
    this.openModal('thread-panel', t.title, this.closeBtn(),
      h('h2', {}, `${t.title}: ${node.label}`),
      h('ol', { class: 'thread-steps' }, ...t.nodes.map((n) => h('li', { class: c.state.flags[`thread.${t.id}.${n.id}`] ? 'done' : '' }, n.label)),
        h('li', { class: `gap ${c.state.flags[`thread.${t.id}.gap`] ? 'done' : ''}` }, '?')),
      h('p', {}, r.text),
      r.gap ? h('p', { class: 'gap-text' }, r.gap) : next ? h('p', { class: 'fine' }, `The thread leads on to: ${next.label}.`) : '',
      h('p', { class: 'fine' }, h('strong', {}, 'What the thread cannot show: '), t.limit),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Close')));
  }

  // ------------------------------------------------------- forge (29.1 item 5)

  openForge(): void {
    const c = ctx.controller;
    if (!c.state.flags['heard.hesper']) { this.toast('This is Hesper\'s anvil. Talk to her first.', 'info'); return; }
    const log = h('ol', { class: 'history', 'aria-live': 'polite' });
    const art = h('div', { class: 'forge-art' });
    const status = h('p', { class: 'fine' });
    const btns = h('div', { class: 'forge-buttons' });
    const labels: Record<ForgeAction, string> = {
      stack: 'Stack a strip', weld: 'Weld the stack', twist: 'Twist', fold: 'Fold and weld',
      crucible: 'Load the crucible', melt: 'Heat until it melts', cool: 'Cool slowly', cut: 'Cut, polish and etch', reset: 'Start a new billet',
    };
    const render = () => {
      const f = c.state.forge;
      clear(art); art.append(this.billetCanvas());
      clear(status); status.append(f.route === 'none' ? 'The anvil is empty.' : f.route === 'pattern' ? `Pattern route: ${f.steels} strips${f.welded ? `, welded, ${layers(f)} layers` : ''}${f.twists ? `, ${f.twists} twist(s)` : ''}.${f.cut ? ' Cut.' : ''}` : `Crucible route: ${f.melted ? 'melted' : 'loaded'}${f.cooled ? ', cooled' : ''}.${f.cut ? ' Cut.' : ''}`);
      clear(btns);
      btns.append(
        h('fieldset', {}, h('legend', {}, 'Weld layers'), ...(['stack', 'weld', 'twist', 'fold'] as ForgeAction[]).map((a) => h('button', { onclick: () => act(a) }, labels[a]))),
        h('fieldset', {}, h('legend', {}, 'Sealed pot'), ...(['crucible', 'melt', 'cool'] as ForgeAction[]).map((a) => h('button', { onclick: () => act(a) }, labels[a]))),
        h('fieldset', {}, h('legend', {}, 'Finish'), ...(['cut', 'reset'] as ForgeAction[]).map((a) => h('button', { class: a === 'cut' ? 'primary' : '', onclick: () => act(a) }, labels[a]))));
    };
    const act = (a: ForgeAction) => {
      const ev = c.dispatch({ type: 'Forge', action: a });
      const r = ev.find((e) => e.kind === 'forge') as Extract<GameEvent, { kind: 'forge' }> | undefined;
      if (!r) return; // the error toast explains why
      this.sfx(a === 'cut' ? 'sfx.sparkle' : 'sfx.metal');
      log.append(h('li', {}, r.line));
      if (a === 'cut') log.append(h('li', { class: 'fair' }, 'Take the section to the assay table, east of the square, and compare it with the blade.'));
      render();
    };
    render();
    this.openModal('forge-panel wide', "Hesper's anvil", this.closeBtn(),
      h('h2', {}, "Hesper's anvil"),
      h('div', { class: 'chips' }, claimChip('simulation'), histChip('fictional-world')),
      h('p', { class: 'fine' }, 'Schematic only: this is not a working recipe. Make a small test billet by one route. Watch the pattern form, then cut it.'),
      h('div', { class: 'two-col' }, h('div', {}, art, status), btns), h('h3', {}, 'What happened'), log);
  }

  /** A drawing of the billet's cut face, made from what the player did. */
  private billetCanvas(): HTMLElement {
    const f = ctx.controller.state.forge;
    const W = 160, H = 64;
    const cv = h('canvas', { width: String(W), height: String(H), class: 'billet', role: 'img', 'aria-label': describeSection(f) }) as HTMLCanvasElement;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#1e2230'; g.fillRect(0, 0, W, H);
    if (f.route === 'pattern' && f.steels) {
      const n = Math.max(f.steels, layers(f) || f.steels);
      const band = (H - 8) / Math.min(n, 56);
      for (let x = 0; x < W - 16; x++) {
        for (let y = 0; y < H - 8; y++) {
          const curl = f.twists ? Math.sin((x / 9) + (y / 6) * f.twists) * 3 * f.twists : 0;
          const bend = f.folds ? Math.sin(x / 14) * 2 * f.folds : 0;
          const k = Math.floor((y + curl + bend) / band);
          g.fillStyle = k % 2 ? '#7a8496' : '#cfd6e2';
          g.fillRect(8 + x, 4 + y, 1, 1);
        }
      }
      if (!f.welded) { g.fillStyle = '#1e2230'; for (let i = 1; i < f.steels; i++) g.fillRect(8, 4 + i * ((H - 8) / f.steels), W - 16, 1); }
    } else if (f.route === 'crucible') {
      g.fillStyle = f.melted ? '#ff9a3a' : '#5a3a2a'; g.beginPath(); g.ellipse(W / 2, H / 2, 40, 24, 0, 0, Math.PI * 2); g.fill();
      if (f.cooled) {
        for (let x = -40; x < 40; x++) for (let y = -22; y < 22; y++) {
          if ((x * x) / 1600 + (y * y) / 484 > 1) continue;
          const v = Math.sin(x / 5 + Math.sin(y / 4) * 2);
          g.fillStyle = v > 0.3 ? '#aab3c4' : '#7a8496'; g.fillRect(W / 2 + x, H / 2 + y, 1, 1);
        }
      }
    } else {
      g.fillStyle = '#ffffff22'; g.fillRect(8, H / 2 - 2, W - 16, 4);
    }
    return cv;
  }

  openAssay(exhibitId: string): void {
    const c = ctx.controller;
    const ex = c.pack.exhibits.find((x) => x.id === exhibitId)!;
    c.dispatch({ type: 'InspectExhibit', exhibit: exhibitId });
    const out = h('div', { role: 'status', 'aria-live': 'polite' });
    const f = c.state.forge;
    const compare = () => {
      const ev = c.dispatch({ type: 'CompareAssay' });
      const r = ev.find((e) => e.kind === 'compare') as Extract<GameEvent, { kind: 'compare' }> | undefined;
      if (!r) return;
      this.sfx('sfx.metal');
      clear(out); out.append(h('p', { class: r.match ? 'fair' : 'unfair' }, r.match ? 'They match.' : 'They differ.'), h('p', {}, r.line));
    };
    this.openModal('assay-panel wide', ex.name, this.closeBtn(),
      h('h2', {}, ex.name), h('div', { class: 'chips' }, histChip(ex.historicalLabel)),
      h('div', { class: 'two-col' },
        h('figure', {}, h('img', { class: 'big-art', src: artURL('big.assay'), alt: ex.altText }), h('figcaption', {}, 'The blade: etched section (schematic).')),
        h('figure', {}, this.billetCanvas(), h('figcaption', {}, f.cut ? `Your billet: ${describeSection(f)}` : 'Your billet: not cut yet. Forge and cut one at Hesper\'s anvil.'))),
      h('p', {}, ex.summary),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, disabled: !f.cut, onclick: compare }, 'Compare my billet with the blade')),
      out);
  }

  // ------------------------------------------------------------ Showdown (12.24)

  openShowdown(id: string): void {
    const c = ctx.controller;
    const rec = c.pack.showdowns.find((x) => x.id === id);
    if (!rec) return;
    c.dispatch({ type: 'ShowdownStart', showdown: id, relaxed: ctx.settings.zenMode });
    const box = this.openModal('showdown wide', rec.title);
    // Touch screens cannot show hover titles, so move explanations start visible there (phone pass).
    let explain = (() => { try { return window.matchMedia('(pointer: coarse)').matches; } catch { return false; } })();
    const opp = c.pack.characters.find((x) => x.id === rec.opponent);
    const move = (m: ShowdownMove) => { c.dispatch({ type: 'ShowdownMove', move: m }); this.sfx('sfx.click'); render(); };
    const pick = (label: string, opts: { v: string; t: string }[], go: (v: string) => void) => {
      const sel = h('select', { 'aria-label': label }, h('option', { value: '' }, `${label}…`), ...opts.map((o) => h('option', { value: o.v }, o.t))) as HTMLSelectElement;
      sel.addEventListener('change', () => { if (sel.value) go(sel.value); });
      return sel;
    };
    const render = () => {
      const sd = c.state.showdown as ShowdownState;
      clear(box);
      const myClaim = rec.playerClaims.find((x) => x.id === sd.claim);
      const cards = c.state.cards.map((cid) => ({ v: cid, t: c.pack.cards.find((x) => x.id === cid)?.title ?? cid }));
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', { class: 'fine' }, `${rec.place}. No timer. ${sd.relaxed ? 'Zen mode: the crowd waits as long as you like. ' : ''}Each move says why it worked or not.`),
        h('div', { class: 'crowd', role: 'img', 'aria-label': `Crowd trust: you ${sd.trust.player}, ${opp?.name} ${sd.trust.opponent}` },
          h('span', {}, 'You'), h('span', { class: 'bar' }, h('i', { style: { width: `${sd.trust.player}%` } })), h('span', {}, String(sd.trust.player)),
          h('span', {}, opp?.name ?? ''), h('span', { class: 'bar opp' }, h('i', { style: { width: `${sd.trust.opponent}%` } })), h('span', {}, String(sd.trust.opponent))),
        h('div', { class: 'two-col' },
          h('section', {}, h('h3', {}, `${opp?.name ?? 'Opponent'} claims`),
            h('p', { class: 'claim-text' }, `“${sd.narrowed ? rec.opponentClaim.narrowed : rec.opponentClaim.text}”`, rec.opponentClaim.seal && !sd.sealShown ? h('span', { class: 'seal', title: 'A gold mark. What is under it?' }, ' ◉') : ''),
            h('ul', { class: 'links' }, ...rec.opponentClaim.links.map((l) => h('li', { class: sd.cracked.includes(l.id) ? 'cracked' : '' }, sd.cracked.includes(l.id) ? '✗ ' : '— ', l.text)))),
          h('section', {}, h('h3', {}, 'Your claim'),
            myClaim ? h('p', { class: 'claim-text' }, `“${myClaim.text}”`) : h('p', { class: 'fine' }, 'Not placed yet.'),
            myClaim ? h('p', { class: sd.force > sd.support ? 'unfair' : 'fair' }, `Force ${sd.force} · Support ${sd.support}`) : null)),
        h('ol', { class: 'sd-log', 'aria-live': 'polite' }, ...sd.log.slice(-8).map((l) => h('li', { class: `who-${l.who}` }, l.text, l.why ? h('small', {}, ` ${l.why}`) : ''))));
      if (sd.outcome) {
        box.append(h('h3', {}, `Outcome: ${sd.outcome.replace('-', ' ')}`), h('p', {}, rec.outcomes[sd.outcome].text),
          h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Leave the square')));
        this.sfx('sfx.complete');
        return;
      }
      if (!sd.claim) {
        box.append(h('h3', {}, 'Choose your claim'), h('div', { class: 'options' }, ...rec.playerClaims.map((pc, i) =>
          h('button', { 'data-autofocus': i === 0, title: MOVE_HELP.claim, onclick: () => move({ move: 'claim', claim: pc.id }) }, h('em', {}, `Force ${pc.force}: `), pc.text))));
        return;
      }
      const wit = rec.witnesses.filter((w) => !sd.used.includes(`witness:${w.id}`) && c.check(w.if));
      const mv = (k: keyof typeof MOVE_HELP, label: string, m: ShowdownMove, cls = '') =>
        h('button', { class: cls, title: MOVE_HELP[k], onclick: () => move(m) }, label, h('small', { class: 'move-desc' }, MOVE_HELP[k]));
      box.classList.toggle('explain', explain);
      if (sd.testimony === 'open') {
        box.append(h('div', { class: 'objection', role: 'alert' }, h('strong', {}, 'A new statement! '),
          `${opp?.name ?? 'The opponent'} just said something new. If a card you hold contradicts it, present it now. You can also let it pass.`,
          h('div', { class: 'row' }, pick('Present a card', cards, (v) => move({ move: 'present', card: v })))));
      }
      box.append(h('div', { class: 'row move-head' }, h('h3', {}, 'Your move'),
        h('button', { class: 'link-btn', 'aria-pressed': String(explain), onclick: () => { explain = !explain; render(); } }, explain ? 'Hide what moves do' : 'Explain the moves')),
        h('div', { class: 'moves' },
        pick('Support with a card', cards.filter((x) => !sd.used.includes(x.v)), (v) => move({ move: 'support', card: v })),
        h('span', { class: 'move-pair' },
          pick('Challenge a link', rec.opponentClaim.links.filter((l) => !sd.cracked.includes(l.id)).map((l) => ({ v: l.id, t: l.text })), (v) => {
            const s2 = h('div', { class: 'row' }, h('span', {}, 'With which card?'), pick('Card', cards, (cv) => move({ move: 'challenge', link: v, card: cv })));
            box.querySelector('.move-pair')!.append(s2);
          })),
        pick('Counterexample', cards, (v) => move({ move: 'counter', card: v })),
        wit.length ? pick('Call a witness', wit.map((w) => ({ v: w.id, t: w.name })), (v) => move({ move: 'witness', witness: v })) : '',
        mv('qualify', 'Qualify my claim', { move: 'qualify' }),
        mv('reframe', 'Reframe the question', { move: 'reframe' }),
        sd.openPoint ? mv('concede', 'Concede the fair point', { move: 'concede' }, 'primary') : '',
        mv('source', 'Ask for the source', { move: 'source' }),
        mv('attack', 'Attack the person', { move: 'attack' }, 'cheap'),
        mv('shout', 'Shout louder', { move: 'shout' }, 'cheap'),
        mv('rest', 'Rest my case', { move: 'rest' }, 'primary')),
        h('p', { class: 'fine' }, 'Hover a move, or use "Explain the moves", to see what each one does. Cheap shots never damage a claim.'));
      const logEl = box.querySelector('.sd-log'); if (logEl) logEl.scrollTop = logEl.scrollHeight;
      if (sd.claim) box.scrollTop = box.scrollHeight;
    };
    render();
  }

  // ------------------------------------------------------------- Waystone (38.7)

  /** A short, optional breathing pause at a Waystone (Balanced, spec 90; Zen and explorer mode, 47.4). */
  openBreathing(): void {
    const c = ctx.controller;
    const still = ctx.settings.reducedMotion;
    const orb = h('div', { class: `breath-orb ${still ? 'still' : ''}`, 'aria-hidden': 'true' });
    const say = h('p', { class: 'breath-say', 'aria-live': 'polite' }, 'Sit. Let your shoulders drop.');
    const box = this.openModal('breath-panel', 'Sit a while', this.closeBtn(), h('h2', {}, 'Sit a while'),
      h('p', { class: 'fine' }, 'Three slow breaths by the Waystone. Close this at any time.'), orb, say);
    let n = 0;
    const timers: number[] = [];
    const step = () => {
      if (!box.isConnected) { timers.forEach(clearTimeout); return; }
      if (n >= 6) {
        say.textContent = 'Done. The square is still there when you are ready.';
        orb.classList.remove('in', 'out');
        c.dispatch({ type: 'SetFlag', flag: 'zen.sat', value: true });
        c.dispatch({ type: 'SetFlag', flag: 'count.sit', value: Number(c.state.flags['count.sit'] ?? 0) + 1 });
        box.append(h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Go on')));
        (box.querySelector('[data-autofocus]') as HTMLElement | null)?.focus();
        return;
      }
      const inhale = n % 2 === 0;
      say.textContent = inhale ? `Breathe in… (${n / 2 + 1} of 3)` : 'Breathe out…';
      orb.classList.toggle('in', inhale); orb.classList.toggle('out', !inhale);
      if (inhale) { chime(ctx.settings.sfxVolume * 0.5); caption('amb.chime'); }
      n++;
      timers.push(window.setTimeout(step, 4000));
    };
    timers.push(window.setTimeout(step, 800));
  }

  openWaystone(place: string): void {
    const c = ctx.controller;
    c.dispatch({ type: 'Rest', place });
    // Campfire log (spec 47.10, C1): one short, optional prompt about the latest step. Never graded.
    const lastId = [...c.state.objectivesDone].reverse()[0];
    const last = c.pack.missions.flatMap((m) => m.objectives).find((o) => o.id === lastId);
    const prompts = last
      ? [`What helped you with this step: "${last.title}"?`, 'What would you do differently next time?', 'What are you still not sure about?']
      : ['What are you thinking about right now?'];
    const prompt = prompts[Number(c.state.flags['count.rests'] ?? 0) % prompts.length];
    const ta = h('textarea', { rows: '3', maxlength: '500', 'aria-label': `Campfire log (optional): ${prompt}`, placeholder: 'Optional. Write in your own words. Nobody grades this.' }) as HTMLTextAreaElement;
    const r = c.recap();
    this.openModal('waystone-panel', 'Waystone', this.closeBtn(),
      h('h2', {}, 'Waystone'),
      h('p', {}, 'The Waystone hums softly. Your progress is saved here. Resting is never required, and nothing is lost if you keep going.'),
      h('ul', {}, ...r.lines.slice(1).map((l) => h('li', {}, l))),
      h('p', { class: 'hint-text' }, h('strong', {}, 'Campfire log: '), prompt), ta,
      h('div', { class: 'row' },
        h('button', { class: 'primary', 'data-autofocus': true, onclick: () => {
          if (ta.value.trim()) {
            c.dispatch({ type: 'AddNote', text: `Campfire log: ${prompt} ${ta.value.trim()}` });
            if (lastId) c.dispatch({ type: 'SetFlag', flag: `log.${lastId}`, value: true });
          }
          this.closeModal();
          const mine = String(c.state.flags['musicbox.song'] ?? '').split(',').filter(Boolean);
          if (mine.length) { playNotes(songNotes(mine), Number(c.state.flags['musicbox.tempo'] ?? 0.32), (c.state.flags['musicbox.voice'] as any) ?? 'box', ctx.settings.sfxVolume * 0.6); caption('music.box'); }
        } }, 'Rest and go on'),
        h('button', { onclick: () => this.openBreathing() }, 'Sit a while'),
        h('button', { onclick: () => { c.suspend('Save and leave'); this.closeModal(false); (window as any).kgToTitle?.(); } }, 'Save and leave')));
  }

  // ------------------------------------------------- share with teacher (94)

  /**
   * The student's own progress file (TEACH-003: least data; TEACH-005: the
   * student sees all of it first). Notes and private journal entries are never
   * in it. Portfolio entries are included only when the student shared them.
   */
  progressExport(): Record<string, unknown> {
    const c = ctx.controller, s = c.state, p = c.permanent;
    const now = new Date().toISOString();
    return {
      format: 'knowledge-guardians-progress', version: 1, exportedAt: now,
      player: s.player.name, content: `${c.pack.id} v${c.pack.contentVersion}`,
      objectivesDone: s.objectivesDone,
      awards: Object.keys(p.awards), conceptXP: conceptXP(p, c.pack), totalXP: totalXP(p),
      moments: Object.fromEntries(Object.entries(p.moments).map(([id, at]) => [id, { attribute: c.pack.moments.find((m) => m.id === id)?.attribute, at }])),
      met: p.met,
      misconceptions: studentAlerts(p, c.pack, now).map((a) => ({ id: a.misconception.id, title: a.misconception.title, count: a.count, level: a.level })),
      portfolio: p.portfolio.filter((e) => e.shared).map(({ id, at, world, kind, title, text, reflection }) => ({ id, at, world, kind, title, text, reflection })),
      skills: Object.fromEntries(Object.entries(p.skills ?? {}).map(([id, u]) => [id, skillStage(u)]).filter(([, st]) => st !== 'unseen')),
    };
  }

  private openShare(): void {
    const data = this.progressExport();
    const json = JSON.stringify(data, null, 2);
    const download = () => {
      const a = h('a', { href: URL.createObjectURL(new Blob([json], { type: 'application/json' })), download: `kg-progress-${String(data.player).replace(/[^\w-]+/g, '_')}.json` }) as HTMLAnchorElement;
      document.body.append(a); a.click(); a.remove();
      this.toast('Progress file saved. Give it to your teacher if you want to.', 'save');
    };
    const shared = (data.portfolio as unknown[]).length;
    this.openModal('share wide', 'Share with my teacher', this.closeBtn(), h('h2', {}, 'Share with my teacher'),
      h('p', {}, 'This makes a file on this device. Nothing is sent anywhere. You choose whether to give it to your teacher.'),
      h('ul', {},
        h('li', {}, 'In the file: your Guardian name, the steps and awards you finished, your concept XP, your learner-profile moments, which concepts, ATL skills and subjects you met, and any pattern that Lumen noticed.'),
        h('li', {}, `Portfolio entries you chose to share: ${shared}. Change this in the Portfolio tab.`),
        h('li', {}, 'NOT in the file: your notes, your journal, your unshared portfolio entries, your choices in conversations.')),
      h('details', {}, h('summary', {}, 'See everything in the file'), h('pre', { class: 'json' }, json)),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: download }, 'Save the file'), h('button', { onclick: () => this.closeModal() }, 'Cancel')));
  }

  // --------------------------------------------------- journal & bag

  openJournal(tab = 'entries'): void {
    if (!ctx.controller.state) return;
    this.sfx('sfx.book');
    const c = ctx.controller, s = c.state;
    const tabs: Record<string, string> = { entries: 'Entries', cards: 'Evidence cards', notes: 'My notes', moments: 'Moments', portfolio: 'Portfolio', atlas: 'Atlas', skills: 'Skill Atlas', lorelings: 'Lorelings', bestiary: 'Fray Bestiary', stones: 'Question Stones', glossary: 'Glossary', awards: 'Awards and XP', sources: 'Sources' };
    const body = h('div', { class: 'tab-body' });
    const nav = h('div', { class: 'tabs', role: 'tablist' }, ...Object.entries(tabs).map(([k, l]) => h('button', { role: 'tab', 'aria-selected': String(k === tab), onclick: () => this.openJournal(k) }, l)));
    if (tab === 'entries') {
      body.append(h('ol', { class: 'journal' }, ...s.journal.map((id) => {
        const j = c.pack.journal.find((x) => x.id === id)!;
        return h('li', {}, j.claimKind ? claimChip(j.claimKind) : null, ' ', j.text);
      })));
      if (!s.journal.length) body.append(h('p', {}, 'No entries yet.'));
    } else if (tab === 'cards') {
      body.append(...s.cards.map((id) => this.cardView(c.pack.cards.find((x) => x.id === id)!)));
      if (!s.cards.length) body.append(h('p', {}, 'No evidence cards yet. Inspect exhibits and talk to people.'));
    } else if (tab === 'notes') {
      const ta = h('textarea', { rows: '3', maxlength: '500', 'aria-label': 'New note', placeholder: 'Write a note in your own words. Notes are never graded.' }) as HTMLTextAreaElement;
      body.append(h('ul', { class: 'notes' }, ...s.notes.map((n) => h('li', {}, n))), ta,
        h('button', { onclick: () => { if (ta.value.trim()) { c.dispatch({ type: 'AddNote', text: ta.value }); this.openJournal('notes'); } } }, 'Add note'));
    } else if (tab === 'moments') {
      // Learner profile (spec 90): moments, never scores or grades (PROFILE-001).
      const got = c.pack.moments.filter((m) => c.permanent.moments[m.id]);
      body.append(h('p', { class: 'fine' }, 'Moments when you acted like the IB learner profile describes. These are not scores. Nobody is ranked.'));
      if (!got.length) body.append(h('p', {}, 'No moments yet. They appear as you play.'));
      body.append(h('ul', { class: 'moments' }, ...got.map((m) => h('li', {}, h('strong', {}, `${PROFILE_NAMES[m.attribute]}: `), m.did,
        m.prompt ? h('br', {}) : '', m.prompt ? h('small', { class: 'fine' }, `To think about: ${m.prompt}`) : ''))));
    } else if (tab === 'portfolio') {
      // Evidence portfolio (spec 94.4): private, owned by the student, shared only by choice.
      const list = [...c.permanent.portfolio].reverse();
      body.append(h('p', { class: 'fine' }, 'Your portfolio is private. An entry goes to your teacher only if you tick "Share" and then save a progress file (Menu, Share with my teacher).'));
      if (!list.length) body.append(h('p', {}, 'No entries yet. Labels, Showdowns and tests add entries.'));
      for (const e of list) {
        const ta = h('textarea', { rows: '2', maxlength: '800', 'aria-label': `Reflection on ${e.title}`, placeholder: 'Add a reflection (optional)' }) as HTMLTextAreaElement;
        ta.value = e.reflection;
        ta.addEventListener('change', () => c.dispatch({ type: 'PortfolioReflect', entry: e.id, text: ta.value }));
        body.append(h('article', { class: 'card' }, h('h3', {}, e.title), h('p', { class: 'fine' }, `${new Date(e.at).toLocaleString()} · ${e.world}`), h('p', {}, e.text), ta,
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: e.shared, onchange: (ev: Event) => c.dispatch({ type: 'PortfolioShare', entry: e.id, shared: (ev.target as HTMLInputElement).checked }) }), ' Share with my teacher')));
      }
    } else if (tab === 'skills') {
      // Skill Atlas (spec 76.1): practice in the game, never a grade or a rank.
      const p = c.permanent;
      const icon: Record<SkillStage, string> = { unseen: '○', seen: '◔', practised: '◑', confident: '◕', transferred: '●' };
      body.append(h('p', { class: 'fine' }, 'Each skill grows when you use it somewhere new: Seen, Practised, Confident, Transferred. This shows practice in the game. It is not a grade.'),
        h('div', { class: 'skill-map' }, ...c.pack.skillDomains.map((d) => {
          const list = c.pack.skills.filter((k) => k.domain === d.id);
          return h('section', { class: `skill-region ${list.length ? '' : 'later'}` }, h('h4', {}, d.name),
            list.length ? h('ul', {}, ...list.map((k) => {
              const st = skillStage(p.skills?.[k.id]);
              return h('li', { class: `stage-${st}`, title: nextStep(p.skills?.[k.id]) }, h('span', { class: 'stage-icon', 'aria-hidden': 'true' }, icon[st]), ` ${k.name} `, h('small', {}, STAGE_LABEL[st]));
            })) : h('p', { class: 'fine' }, 'In later chapters.'));
        })));
    } else if (tab === 'lorelings') {
      // Loreling Atlas (spec 36.1): friends, and the others that live in later worlds.
      const friends = c.pack.lorelings.filter((l) => s.flags[`lor.${l.id}.friend`] === true);
      body.append(h('p', { class: 'fine' }, 'Lorelings are small made-up creatures that live where knowledge is strong. You befriend one by watching it carefully, never by catching it.'),
        h('ul', { class: 'loreling-atlas' }, ...c.pack.lorelingAtlas.map((a) => {
          const rec = c.pack.lorelings.find((l) => l.name === a.name);
          const friend = rec && friends.includes(rec);
          const met = rec && Number(s.flags[`lor.${rec.id}.seenCount`] ?? 0) > 0;
          return h('li', { class: friend ? 'friend' : met ? 'met' : 'unknown' },
            friend || met ? h('img', { src: artURL('moth.big'), alt: '' }) : h('span', { class: 'silhouette', 'aria-hidden': 'true' }, '?'),
            h('div', {}, h('strong', {}, friend ? `${String(s.flags[`lor.${rec!.id}.name`] ?? a.name)} (${a.name})` : met ? a.name : '???'), h('br', {}),
              h('small', {}, `${CONCEPT_NAMES[a.concept]}${friend || met ? `: ${a.power}` : ''}`),
              friend ? h('button', { class: 'mini', onclick: () => this.openLoreling(rec!.id) }, 'Visit') : ''));
        })));
    } else if (tab === 'bestiary') {
      // Fray Bestiary (spec 36.2): a living vocabulary book of reasoning errors, filled in by play.
      const PLACE: Record<string, string> = { 'nexus.archive': 'the Nexus archive hall', 'aethelgard.emberford': 'Emberford' };
      const met = c.pack.fray.filter((f) => s.flags[`fray.${f.id}`] !== undefined);
      body.append(h('p', { class: 'fine' }, `Fray creatures are errors in reasoning, shown as monsters. A page fills in the first time you meet one. You have met ${met.length} of ${c.pack.fray.length}.`),
        h('ul', { class: 'bestiary' }, ...c.pack.fray.map((f) => {
          const at = s.flags[`fray.${f.id}`];
          if (at === undefined) return h('li', { class: 'unknown' }, h('strong', {}, '???'), h('br', {}), h('small', {}, f.chapter ? 'You can meet this one in this chapter.' : 'In later chapters.'));
          const n = Number(s.flags[`fray.${f.id}.n`] ?? 1);
          return h('li', {}, h('strong', {}, f.name), ' ', h('span', { class: 'chip' }, f.error), h('p', {}, f.pattern), h('p', {}, h('strong', {}, 'Weakness: '), f.weakness),
            h('small', { class: 'fine' }, `First met in ${PLACE[String(at)] ?? at}. Met ${n} time${n === 1 ? '' : 's'}.`));
        })));
    } else if (tab === 'stones') {
      // Question Stones (KQ-003): a stone gets brighter with each new way of meeting the question. Never a quiz.
      const ACTION: Record<string, string> = { label: 'a label', exhibition: 'a museum plaque', test: 'a fair test', showdown: 'a Showdown', thread: 'a Provenance Thread', forge: 'the forge', reflection: 'a mystery', research: 'EE practice', community: 'listening to a community', fieldwork: 'fieldwork' };
      const WORLD: Record<string, string> = { 'WORLD-01': 'the Nexus', 'WORLD-02': 'Emberford' };
      body.append(h('p', { class: 'fine' }, 'Each stone holds a question about knowledge that sat under something you did. A stone gets brighter when you meet the same question in a new way: a new place or a new kind of action. Five ways light it fully. Nothing here is a test.'));
      const got = c.pack.questions.filter((q) => (c.permanent.stones?.[q.id] ?? []).length);
      if (!got.length) body.append(h('p', {}, 'No stones yet. They appear when you finish a step that has a question under it.'));
      body.append(h('ul', { class: 'stones' }, ...got.map((q) => {
        const ways = c.permanent.stones[q.id];
        return h('li', { style: { '--glow': String(Math.min(ways.length, 5) / 5) } },
          h('span', { class: 'stone', 'aria-hidden': 'true' }, ...[0, 1, 2, 3, 4].map((i) => h('i', { class: i < ways.length ? 'lit' : '' }))),
          h('div', {}, h('strong', {}, q.text), h('br', {}),
            h('small', { class: 'fine' }, `${Math.min(ways.length, 5)} of 5 ways: ${ways.map((w) => { const [wd, a] = w.split('|'); return `${ACTION[a] ?? a} in ${WORLD[wd] ?? wd}`; }).join('; ')}.`)));
      })));
    } else if (tab === 'glossary') {
      body.append(h('p', { class: 'fine' }, 'Key words, in plain English. Where you have already done something that shows the word, Lumen adds an example from your play.'),
        h('dl', { class: 'glossary' }, ...c.pack.glossary.flatMap((g) => {
          const ex = exampleFor(g, s, (cond) => c.check(cond));
          return [h('dt', {}, g.term), h('dd', {}, g.text, ex ? h('br', {}) : '', ex ? h('small', { class: 'fine' }, `From your play: ${ex}`) : '')];
        })));
    } else if (tab === 'atlas') {
      // Concepts, ATL ribbons and subjects met (spec 91, 92). Counts of meetings, not grades.
      const m = c.permanent.met;
      const list = (title: string, names: Record<string, string>, got: Record<string, number>) => h('section', {}, h('h3', {}, title),
        h('ul', { class: 'atlas' }, ...Object.entries(names).map(([k, n]) => h('li', { class: got[k] ? 'met' : '' }, n, got[k] ? h('small', {}, ` met ${got[k]}×`) : ''))));
      body.append(h('p', { class: 'fine' }, 'Where your play touched the TOK concepts, the ATL skills and the DP subjects. This shows coverage, not quality.'),
        list('ATL skills (ribbons)', ATL_NAMES, m.atl), list('TOK concepts', CONCEPT_NAMES, m.concepts),
        list('DP subjects', Object.fromEntries(Object.entries(SUBJECTS).filter(([k]) => m.subjects[k]).map(([k, v]) => [k, v.name])), m.subjects));
      if (!Object.keys(m.subjects).length) body.append(h('p', { class: 'fine' }, 'No subjects met yet.'));
    } else if (tab === 'awards') {
      const xp = conceptXP(c.permanent, c.pack);
      body.append(h('p', {}, h('strong', {}, `Total concept XP: ${totalXP(c.permanent)}`), ' (permanent; it stays if you load an earlier checkpoint)'),
        h('p', { class: 'fine' }, 'Each ring fills as you earn XP for that concept in this chapter. A full ring means you met every chance this chapter gives for it.'),
        h('div', { class: 'rings' }, ...conceptRings(c.permanent, c.pack).sort((a, b) => Object.keys(CONCEPT_NAMES).indexOf(a.concept) - Object.keys(CONCEPT_NAMES).indexOf(b.concept)).map((r) => ringSvg(CONCEPT_NAMES[r.concept], r.got, r.max, RING_COLOURS[r.concept] ?? '#e9cf7a'))),
        h('ul', { class: 'xp sr-list' }, ...Object.entries(xp).map(([k, v]) => h('li', {}, `${k[0].toUpperCase()}${k.slice(1)}: ${v}`))),
        h('h3', {}, 'Earned'),
        h('ul', { class: 'awards' }, ...c.pack.awards.filter((a) => c.permanent.awards[a.id]).map((a) => h('li', {}, h('strong', {}, `${a.name} `), h('small', {}, `(${a.kind.replace('-', ' ')})`), h('br', {}), a.earnedBy,
          a.title ? h('div', { class: 'row' }, s.flags['title.worn'] === a.title
            ? h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'title.worn', value: '' }); this.refreshHud(); this.openJournal('awards'); } }, `Stop wearing "${a.title}"`)
            : h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'SetFlag', flag: 'title.worn', value: a.title! }); this.refreshHud(); this.openJournal('awards'); } }, `Wear the title "${a.title}"`)) : ''))),
        h('h3', {}, 'Not yet earned'),
        h('ul', { class: 'awards locked' }, ...c.pack.awards.filter((a) => !c.permanent.awards[a.id]).map((a) => h('li', {}, `${a.name} (${a.kind.replace('-', ' ')})`))));
    } else if (tab === 'sources') {
      body.append(h('p', { class: 'fine' }, 'Historical claims in this chapter come from these sources. Dialogue by characters is original fiction, not quotation.'),
        h('ul', { class: 'sources-list' }, ...c.pack.sources.map((src) => h('li', {}, h('a', { href: src.url, target: '_blank', rel: 'noopener' }, `${src.id}: ${src.title}`), h('br', {}), h('small', {}, `Supports: ${src.supports}`)))));
    }
    const jc = decodeCrest(s.flags['crest']);
    this.openModal('journal wide', 'Journal', this.closeBtn(), h('h2', { class: 'journal-title' }, jc ? crestCanvas(jc, 30, 1) : '', `${s.player.name}'s journal`, jc ? h('small', { class: 'motto' }, ` · ${MOTTOS[jc.motto]}`) : ''), nav, body);
  }

  private openBag(): void {
    const c = ctx.controller, s = c.state;
    this.sfx('sfx.pickup');
    this.openModal('bag satchel', 'Bag', this.closeBtn(), h('div', { class: 'flap', 'aria-hidden': 'true' }), h('h2', {}, 'Satchel'),
      h('p', {}, `${s.marks} marks`),
      h('ul', { class: 'bag' }, ...Object.entries(s.inventory).map(([id, q]) => {
        const it = c.pack.items.find((x) => x.id === id);
        return h('li', {}, h('img', { src: artURL(it?.art ?? 'icon.card'), alt: '' }), h('div', {}, h('strong', {}, `${it?.name ?? id}${q > 1 ? ` ×${q}` : ''}`), h('br', {}), h('small', {}, it?.description ?? '')));
      })),
      Object.keys(s.inventory).length ? '' : h('p', {}, 'Your bag is empty.'));
  }

  // -------------------------------------------------------------- menu

  private openMenu(): void {
    const c = ctx.controller;
    this.openModal('menu-panel', 'Menu', this.closeBtn(), h('h2', {}, 'Menu'),
      h('div', { class: 'menu' },
        h('button', { 'data-autofocus': true, onclick: () => this.closeModal() }, 'Resume'),
        h('button', { onclick: () => { c.suspend('Save and leave'); this.closeModal(false); this.toast('Saved. You can close the tab.', 'save'); (window as any).kgToTitle?.(); } }, 'Save and leave'),
        h('button', { onclick: () => this.openGuardian() }, 'My Guardian (look and pronouns)'),
        h('button', { onclick: () => this.openCrest() }, 'Crest'),
        h('button', { onclick: () => { this.closeModal(false); this.openPhotoMode(); } }, 'Photo mode'),
        h('button', { onclick: () => this.openAlbum() }, 'Photo album'),
        h('button', { onclick: () => this.openMusicBox() }, 'Music box'),
        h('button', { onclick: () => this.openQuarters() }, 'My quarters'),
        h('button', { onclick: () => this.openSettings() }, 'Settings'),
        h('button', { onclick: () => this.openShare() }, 'Share with my teacher'),
        h('button', { onclick: () => this.openControls() }, 'Controls'),
        c.canRecover() ? h('button', { onclick: () => this.confirmRecovery() }, 'Checkpoint recovery…') : null,
        h('button', { onclick: () => this.openCredits() }, 'Credits and sources')));
  }

  // ---------------------------------------------------------- photo mode

  private photoBar: HTMLElement | null = null;

  /**
   * Photo mode: hide the interface, frame the scene, add a filter, and save a picture
   * to this device. Nothing is uploaded. The player can still walk to set up the shot.
   */
  openPhotoMode(): void {
    if (!ctx.world || this.photoBar) return;
    const c = ctx.controller;
    const FILTERS: [string, string][] = [['none', 'No filter'], ['sepia', 'Archive print'], ['mono', 'Black and white'], ['print', 'Old photo'], ['warm', 'Warm film'], ['night', 'Night'], ['pinhole', 'Pinhole camera']];
    const FRAMES: [string, string][] = [['none', 'No frame'], ['gold', 'Gold'], ['archive', 'Archive violet'], ['wood', 'Wood'],
      ...(c.state.flags['puzzle.timeline-door.done'] === true ? [['timeline', 'Timeline brass (from the Timeline Door)'] as [string, string]] : [])];
    const o = { zoom: Math.round(ctx.world.photoZoom()), filter: 'none', lumen: true, pet: true, frame: 'gold', caption: true };
    let filters = true;
    const apply = () => { filters = ctx.world!.photoSet({ zoom: o.zoom, filter: o.filter, lumen: o.lumen, pet: o.pet }); };
    const bar = h('div', { class: 'photo-bar', role: 'region', 'aria-label': 'Photo mode' });
    const render = () => {
      clear(bar);
      const pick = (list: [string, string][], key: 'filter' | 'frame', label: string) => h('label', {}, `${label} `,
        h('select', { onchange: (e: Event) => { (o as any)[key] = (e.target as HTMLSelectElement).value; apply(); render(); } },
          ...list.map(([id, name]) => h('option', { value: id, selected: o[key] === id }, name))));
      const tick = (key: 'lumen' | 'pet' | 'caption', label: string) => h('label', { class: 'check' },
        h('input', { type: 'checkbox', checked: o[key], onchange: (e: Event) => { o[key] = (e.target as HTMLInputElement).checked; apply(); } }), ` ${label}`);
      const hasPet = !!c.state.flags['lor.out'];
      bar.append(h('strong', {}, '📷 Photo mode'),
        h('span', { class: 'row' }, h('button', { 'aria-label': 'Zoom out', onclick: () => { o.zoom = Math.max(1, o.zoom - 1); apply(); } }, '−'), ' Zoom ', h('button', { 'aria-label': 'Zoom in', onclick: () => { o.zoom = Math.min(6, o.zoom + 1); apply(); } }, '+')),
        filters ? pick(FILTERS, 'filter', 'Filter') : h('span', { class: 'fine' }, 'Filters need WebGL.'),
        pick(FRAMES, 'frame', 'Frame'), tick('lumen', 'Lumen'), hasPet ? tick('pet', 'Loreling') : '', tick('caption', 'Caption'),
        h('button', { class: 'primary', onclick: () => this.savePhoto(o) }, 'Save picture'),
        h('button', { onclick: () => { this.closePhotoMode(); this.openAlbum(); } }, 'Album'),
        h('button', { onclick: () => this.closePhotoMode() }, 'Done (Esc)'),
        h('small', { class: 'fine' }, 'Walk to set up the shot. The picture is saved only on this device.'));
    };
    this.photoBar = bar;
    document.body.classList.add('photo-mode');
    this.root.append(bar);
    apply(); render();
  }

  /** The music box (spec 47.4): arrange the motifs of the concepts you have used into a song. */
  private stopSong: (() => void) | null = null;
  /** Lumen's form and glow (customisation). Saved at once, like other settings. */
  private lumenPicker(): HTMLElement {
    const wrap = h('div', { class: 'lumen-forms', role: 'group', 'aria-label': "Lumen's form" });
    const render = () => {
      clear(wrap);
      const glow = '#' + LUMEN_COLOURS[ctx.settings.lumenColour].toString(16).padStart(6, '0');
      wrap.append(...LUMEN_FORMS.map((f) => h('button', { type: 'button', class: `lumen-form ${ctx.settings.lumenForm === f.id ? 'picked' : ''}`, 'aria-pressed': String(ctx.settings.lumenForm === f.id),
        style: { '--glow': glow }, onclick: () => { ctx.settings.lumenForm = f.id; saveSettings(ctx.settings); this.sfx('sfx.sparkle'); render(); this.refreshHud(); ctx.world?.refreshLumen(); } },
        h('img', { src: artURL(lumenArt({ lumenForm: f.id })), alt: '' }), h('span', {}, f.label))),
        h('label', { class: 'range' }, 'Glow ', h('select', { onchange: (e: Event) => { ctx.settings.lumenColour = (e.target as HTMLSelectElement).value as Settings['lumenColour']; saveSettings(ctx.settings); render(); ctx.world?.refreshLumen(); } },
          ...Object.keys(LUMEN_COLOURS).map((k) => h('option', { value: k, selected: ctx.settings.lumenColour === k }, k)))));
    };
    render();
    return wrap;
  }

  /**
   * The Guardian's quarters (spec 12.16 and 32.6): decorate a room from preset parts and
   * put earned keepsakes on the shelves. The ceiling is the Star Chart. Cosmetic only.
   */
  openQuarters(): void {
    const c = ctx.controller;
    let room: Room = decodeRoom(c.state.flags['room']) ?? structuredClone(DEFAULT_ROOM);
    let selected: number | null = null;
    let info: string | null = null;
    const box = this.openModal('quarters-panel wide', 'My quarters');
    const owned = (c.pack.keepsakes ?? []).filter((k) => c.check(k.if));
    room = { ...room, shelf: room.shelf.map((x) => (x && owned.some((k) => k.id === x) ? x : null)) };
    const rings = conceptRings(c.permanent, c.pack).sort((a, b) => Object.keys(CONCEPT_NAMES).indexOf(a.concept) - Object.keys(CONCEPT_NAMES).indexOf(b.concept));
    const ringData = rings.map((r) => ({ got: r.got, max: r.max, colour: RING_COLOURS[r.concept] ?? '#e9cf7a' }));
    const stars = rings.reduce((a, r) => a + starsFor(r.got, r.max), 0);
    const glowHex = '#' + LUMEN_COLOURS[ctx.settings.lumenColour].toString(16).padStart(6, '0');
    const canvas = h('canvas', { class: 'room-canvas', width: ROOM_W, height: ROOM_H, role: 'img' }) as HTMLCanvasElement;
    const g = canvas.getContext('2d')!;
    const crest = decodeCrest(c.state.flags['crest']);
    const paint = (t: number) => drawRoom(g, room, { rings: ringData, crest, lumen: glowHex, selected, t });
    const describe = () => {
      const items = room.shelf.filter(Boolean).map((id) => owned.find((k) => k.id === id)?.name.toLowerCase()).join(', ');
      canvas.setAttribute('aria-label', `Your quarters: ${WALLS[room.wall].name} walls, ${FLOORS[room.floor].name.toLowerCase()}, a ${LAMPS[room.lamp].name.toLowerCase()}, a window onto ${VIEWS[room.view].name.toLowerCase()}. Star Chart: ${stars} stars. Shelves: ${items || 'empty'}.`);
    };
    const save = () => { c.dispatch({ type: 'SetFlag', flag: 'room', value: encodeRoom(room) }); describe(); };
    const loop = (t: number) => { if (!canvas.isConnected) return; paint(t); if (!ctx.settings.reducedEffects) requestAnimationFrame(loop); };
    const pick = (label: string, k: 'wall' | 'floor' | 'rug' | 'lamp' | 'view' | 'plant', opts: Record<string, { name: string } | null>) => h('label', { class: 'room-pick' }, h('span', {}, label),
      h('select', { onchange: (e: Event) => { room = { ...room, [k]: (e.target as HTMLSelectElement).value }; this.sfx('sfx.click'); save(); paint(performance.now()); } },
        ...Object.entries(opts).map(([v, o]) => h('option', { value: v, selected: room[k] === v }, o?.name ?? 'None'))));
    const shelfRow = h('div', { class: 'row wrap shelf-slots', role: 'group', 'aria-label': 'Shelf slots' });
    const ksList = h('div', { class: 'keepsakes' });
    const infoBox = h('p', { class: 'fine keepsake-info', 'aria-live': 'polite' });
    const renderLists = () => {
      clear(shelfRow); clear(ksList);
      for (let i = 0; i < SLOTS; i++) {
        const id = room.shelf[i];
        const k = owned.find((x) => x.id === id);
        shelfRow.append(h('button', { type: 'button', class: `slot-btn ${selected === i ? 'picked' : ''}`, 'aria-pressed': String(selected === i),
          onclick: () => { selected = selected === i ? null : i; info = k ? `${k.name}. ${k.text}` : 'An empty place. Choose a keepsake below to put here.'; renderLists(); paint(performance.now()); } },
          k ? iconCanvas(k.id, 2) : h('span', { class: 'fine' }, '·'), h('span', {}, `${i < 3 ? 'Top' : 'Low'} ${(i % 3) + 1}`)));
      }
      ksList.append(...(c.pack.keepsakes ?? []).map((k) => {
        const have = owned.includes(k);
        if (!have) return h('div', { class: 'keepsake locked' }, h('span', { class: 'q', 'aria-hidden': 'true' }, '?'), h('span', {}, h('strong', {}, 'Not found yet'), h('br'), h('span', { class: 'fine' }, k.where)));
        const at = room.shelf.indexOf(k.id);
        return h('button', { type: 'button', class: `keepsake ${at >= 0 ? 'placed' : ''}`, title: k.text,
          onclick: () => {
            if (selected === null) { info = `${k.name}. ${k.text} ${at >= 0 ? 'It is on your shelf.' : 'Choose a shelf place first, then this keepsake.'}`; renderLists(); return; }
            room = placeKeepsake(room, selected, room.shelf[selected] === k.id ? null : k.id);
            info = room.shelf[selected] ? `${k.name} is on the shelf. ${k.text}` : `${k.name} is back in your satchel.`;
            this.sfx('sfx.sparkle'); save(); renderLists(); paint(performance.now());
          } }, iconCanvas(k.id, 3), h('span', {}, h('strong', {}, k.name), at >= 0 ? h('span', { class: 'fine' }, ` (shelf ${at < 3 ? 'top' : 'low'} ${(at % 3) + 1})`) : ''));
      }));
      infoBox.textContent = info ?? `${owned.length} of ${(c.pack.keepsakes ?? []).length} keepsakes found. Choose a shelf place, then a keepsake.`;
    };
    box.append(this.closeBtn(), h('h2', {}, 'My quarters'),
      h('p', {}, 'Your own room in the Nexus. The ceiling is your Star Chart: each concept ring you fill adds a star, and a full ring joins its stars into a constellation. The shelves hold keepsakes from the places you have helped.'),
      h('div', { class: 'room-wrap' }, canvas),
      h('p', { class: 'fine' }, `Star Chart: ${stars} of ${rings.length * 5} stars lit.`),
      h('div', { class: 'room-picks' }, pick('Walls', 'wall', WALLS), pick('Floor', 'floor', FLOORS), pick('Rug', 'rug', RUGS), pick('Lamp', 'lamp', LAMPS), pick('Window view', 'view', VIEWS), pick('Plant', 'plant', PLANTS)),
      h('h3', {}, 'Shelves'), shelfRow, infoBox, h('h3', {}, 'Keepsakes'), ksList);
    describe(); renderLists(); paint(0);
    if (!ctx.settings.reducedEffects) requestAnimationFrame(loop);
  }

  openMusicBox(): void {
    const c = ctx.controller;
    const visited = ['nexus.archive', ...(c.state.objectivesDone.includes('m02.o1.arrive') || c.state.mapId === 'aethelgard.emberford' ? ['aethelgard.emberford'] : [])];
    const open = openMotifs(conceptXP(c.permanent, c.pack), visited);
    let song = readSong(c.state.flags['musicbox.song'], open);
    let voice = (['box', 'marimba', 'flute'].includes(String(c.state.flags['musicbox.voice'])) ? c.state.flags['musicbox.voice'] : 'box') as 'box' | 'marimba' | 'flute';
    let tempo = Number(c.state.flags['musicbox.tempo'] ?? 0.32);
    const timers: number[] = [];
    const stop = () => { this.stopSong?.(); this.stopSong = null; timers.forEach(clearTimeout); timers.length = 0; box.querySelectorAll('.slot.on').forEach((x) => x.classList.remove('on')); };
    const save = () => { c.dispatch({ type: 'SetFlag', flag: 'musicbox.song', value: song.join(',') }); c.dispatch({ type: 'SetFlag', flag: 'musicbox.voice', value: voice }); c.dispatch({ type: 'SetFlag', flag: 'musicbox.tempo', value: tempo }); };
    const play = (ids: string[]) => {
      stop();
      const notes = songNotes(ids);
      this.stopSong = playNotes(notes, tempo, voice, ctx.settings.sfxVolume);
      caption('music.box');
      // Light each slot while it plays.
      const slots = [...box.querySelectorAll<HTMLElement>('.song .slot')];
      if (ids === song) for (const n of notes) {
        timers.push(window.setTimeout(() => { slots.forEach((x, i) => x.classList.toggle('on', i === n.slot)); }, n.at * tempo * 1000));
      }
      const end = notes.length ? (notes[notes.length - 1].at + notes[notes.length - 1].beats) * tempo * 1000 + 300 : 0;
      timers.push(window.setTimeout(() => slots.forEach((x) => x.classList.remove('on')), end));
    };
    const box = this.openModal('musicbox-panel wide', 'Music box');
    const render = () => {
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, 'Music box'),
        h('p', {}, 'Each TOK concept has its own short tune. A tune opens the first time you earn XP for that concept. Arrange up to eight into your own song.'),
        h('div', { class: 'song', role: 'list', 'aria-label': 'Your song' }, ...Array.from({ length: SONG_MAX }, (_, i) => {
          const m = MOTIFS.find((x) => x.id === song[i]);
          return m ? h('button', { type: 'button', role: 'listitem', class: `slot ${m.concept ?? 'place'}`, title: `${m.name}. Click to take it out.`, onclick: () => { song.splice(i, 1); save(); stop(); render(); } }, h('span', { class: 'pins', 'aria-hidden': 'true' }, ...m.steps.map((st) => h('i', { style: { bottom: `${8 + ((st + 5) % 10) * 3}px` } }))), h('small', {}, m.name.split(':')[0]))
            : h('span', { class: 'slot empty', role: 'listitem' }, String(i + 1));
        })),
        h('div', { class: 'row' },
          h('button', { class: 'primary', disabled: !song.length, onclick: () => play(song) }, '▶ Play my song'),
          h('button', { onclick: stop }, '■ Stop'),
          h('label', {}, 'Sound ', h('select', { onchange: (e: Event) => { voice = (e.target as HTMLSelectElement).value as any; save(); } },
            ...[['box', 'Music box'], ['marimba', 'Marimba'], ['flute', 'Flute']].map(([v, t]) => h('option', { value: v, selected: v === voice }, t)))),
          h('label', {}, 'Speed ', h('select', { onchange: (e: Event) => { tempo = Number((e.target as HTMLSelectElement).value); save(); } },
            ...[[0.42, 'Slow'], [0.32, 'Walking'], [0.24, 'Quick']].map(([v, t]) => h('option', { value: String(v), selected: v === tempo }, String(t)))))),
        h('h3', {}, `Tunes you have (${open.length} of ${MOTIFS.length})`),
        h('div', { class: 'motifs' }, ...MOTIFS.map((m) => {
          const has = open.includes(m);
          return h('div', { class: `motif ${has ? '' : 'locked'}` },
            h('span', {}, has ? m.name : m.concept ? `${CONCEPT_NAMES[m.concept]}: earn XP for this concept to open it` : 'A place tune: visit the place to open it'),
            has ? h('span', { class: 'row' },
              h('button', { type: 'button', class: 'mini', 'aria-label': `Listen to ${m.name}`, onclick: () => play([m.id]) }, '♪ Listen'),
              h('button', { type: 'button', class: 'mini', disabled: song.length >= SONG_MAX, 'aria-label': `Add ${m.name} to your song`, onclick: () => { song.push(m.id); save(); render(); } }, '+ Add')) : '');
        })),
        h('p', { class: 'fine' }, 'Your song plays softly when you rest at a Waystone. Sound follows the sound-effects volume.'));
    };
    render();
    const obs = new MutationObserver(() => { if (!box.isConnected) { stop(); obs.disconnect(); } });
    obs.observe(this.root, { childList: true, subtree: true });
  }

  /** The photo album and its caption check (spec 47.4). Kept only on this device. */
  openAlbum(openId?: string): void {
    const c = ctx.controller;
    const album = loadAlbum();
    const box = this.openModal('album-panel wide', 'Photo album');
    const render = (sel?: string) => {
      clear(box);
      box.append(this.closeBtn(), h('h2', {}, 'Photo album'));
      const ph = album.find((p) => p.id === sel);
      if (!ph) {
        box.append(h('p', {}, 'Your pictures, kept only on this device. Open one to write its caption: sort each line into what the photo shows and what you think.'));
        if (!album.length) { box.append(h('p', { class: 'fine' }, 'No pictures yet. Use Photo mode (in the menu) to take one.')); return; }
        box.append(h('div', { class: 'album-grid' }, ...[...album].reverse().map((p) => h('button', { type: 'button', class: 'album-thumb', onclick: () => render(p.id), 'aria-label': `Picture from ${p.place}, ${new Date(p.at).toLocaleDateString()}${p.checked ? ', caption done' : ''}` },
          h('img', { src: p.thumb, alt: '' }), h('span', { class: 'fine' }, `${p.place.split(':').pop()?.trim()} ${p.checked ? '✓' : ''}`)))));
        return;
      }
      const all = ph.lines.length > 0 && ph.lines.every((l) => ph.answers[l.id]);
      box.append(h('div', { class: 'album-photo' }, h('img', { src: ph.thumb, alt: `Your picture from ${ph.place}` })),
        h('p', { class: 'fine' }, `${ph.place}, ${new Date(ph.at).toLocaleString()}`),
        h('h3', {}, 'Is this what the photo shows, or what you think?'),
        h('ul', { class: 'caption-lines' }, ...ph.lines.map((l) => {
          const a = ph.answers[l.id];
          const r = a ? checkLine(l, a) : null;
          const choose = (ans: 'shows' | 'thinks') => {
            if (a) return;
            ph.answers[l.id] = ans; saveAlbum(album);
            this.sfx(checkLine(l, ans).ok ? 'sfx.sparkle' : 'sfx.page');
            if (ph.lines.every((x) => ph.answers[x.id]) && !ph.checked) {
              ph.checked = true; saveAlbum(album);
              c.dispatch({ type: 'PhotoCaptioned', right: ph.lines.filter((x) => checkLine(x, ph.answers[x.id]).ok).length, total: ph.lines.length });
            }
            render(ph.id);
          };
          return h('li', { class: r ? (r.ok ? 'ok' : 'miss') : '' }, h('span', {}, l.text),
            a ? h('small', {}, `${r!.ok ? '✓' : '✗'} ${r!.text}`)
              : h('span', { class: 'row' }, h('button', { type: 'button', onclick: () => choose('shows') }, 'The photo shows this'), h('button', { type: 'button', onclick: () => choose('thinks') }, 'I think this')));
        })));
      if (all) {
        const shows = ph.lines.filter((l) => l.kind === 'shows').map((l) => l.text);
        const thinks = ph.lines.filter((l) => l.kind === 'thinks').map((l) => l.text);
        box.append(h('div', { class: 'album-caption' }, h('strong', {}, 'Caption: '), shows.join(' '), h('br'), h('em', {}, `I wonder: ${thinks.join(' ')}`)));
      }
      box.append(h('div', { class: 'row' }, h('button', { onclick: () => render() }, 'All pictures'),
        h('button', { onclick: () => { const i = album.findIndex((p) => p.id === ph.id); album.splice(i, 1); saveAlbum(album); render(); } }, 'Delete this picture')));
    };
    render(openId);
  }

  private closePhotoMode(): void {
    this.photoBar?.remove(); this.photoBar = null;
    document.body.classList.remove('photo-mode');
    ctx.world?.photoSet(null);
  }

  private savePhoto(o: { frame: string; caption: boolean }): void {
    const c = ctx.controller;
    const subjects = ctx.world?.photoSubjects() ?? [];
    ctx.world?.photoSnap((img) => {
      if (!img) { this.toast('This browser could not take the picture.', 'error'); return; }
      const pad = o.frame === 'none' ? 0 : 18, capH = o.caption ? 44 : 0;
      const cv = document.createElement('canvas');
      cv.width = img.width + pad * 2; cv.height = img.height + pad * 2 + capH;
      const g = cv.getContext('2d')!;
      const FRAME: Record<string, [string, string]> = { timeline: ['#6b4f19', '#e9cf7a'], gold: ['#c9a24a', '#f2d27a'], archive: ['#3a2b5e', '#7d5bc4'], wood: ['#5b3b22', '#8a6448'], none: ['#120f24', '#120f24'] };
      const [dark, light] = FRAME[o.frame] ?? FRAME.none;
      g.fillStyle = dark; g.fillRect(0, 0, cv.width, cv.height);
      if (pad) { g.fillStyle = light; g.fillRect(4, 4, cv.width - 8, 3); g.fillRect(4, 4, 3, cv.height - 8); }
      if (o.frame === 'timeline') { g.fillStyle = light; for (let x = 24; x < cv.width - 12; x += 24) g.fillRect(x, 9, 2, x % 96 === 0 ? 7 : 4); }
      g.drawImage(img, pad, pad);
      if (o.caption) {
        const place = MAPS[c.state.mapId]?.name ?? '';
        g.fillStyle = o.frame === 'gold' ? '#2a1a0a' : '#fff8e6'; g.font = '600 18px Lexend, sans-serif'; g.textBaseline = 'middle';
        const cr = decodeCrest(c.state.flags['crest']);
        let tx = pad + 6;
        if (cr) { const cc = crestCanvas(cr, 30, 1); g.drawImage(cc, tx, img.height + pad * 2 + capH / 2 - (pad ? 6 : 0) - 15); tx += 36; }
        g.fillText(`${c.state.player.name} · ${place} · ${new Date().toLocaleDateString()}`, tx, img.height + pad * 2 + capH / 2 - (pad ? 6 : 0));
      }
      const a = h('a', { href: cv.toDataURL('image/png'), download: `knowledge-guardians-${Date.now()}.png` }) as HTMLAnchorElement;
      document.body.append(a); a.click(); a.remove();
      this.sfx('sfx.sparkle');
      // A small copy goes into the album, for the caption check.
      const tw = 360, th = Math.round((cv.height / cv.width) * tw);
      const t = document.createElement('canvas'); t.width = tw; t.height = th;
      t.getContext('2d')!.drawImage(cv, 0, 0, tw, th);
      const album = loadAlbum();
      const seed = Date.now();
      album.push({ id: `p${seed}`, at: new Date().toISOString(), place: MAPS[c.state.mapId]?.name ?? '', thumb: t.toDataURL('image/jpeg', 0.8),
        lines: captionLines(subjects, seed % 97), answers: {}, checked: false });
      const kept = saveAlbum(album);
      this.toast(kept ? `Picture saved to this device and to your album (${Math.min(album.length, ALBUM_MAX)} of ${ALBUM_MAX}).` : 'Picture saved to this device. The album is full or blocked.', 'save');
    });
  }

  private openControls(): void {
    const km = ctx.settings.keys;
    const box = this.openModal('controls', 'Controls', this.closeBtn(), h('h2', {}, 'Controls'),
      h('ul', {},
        h('li', {}, `Walk: arrow keys or ${km.up} ${km.left} ${km.down} ${km.right}. Or click/tap a spot.`),
        h('li', {}, `Talk / inspect / use: ${km.interact}, Space or Enter. Or click/tap a person or object.`),
        h('li', {}, 'Choose a dialogue option: click it, or press its number.'),
        h('li', {}, `Hint from Lumen: ${km.hint}. Journal: ${km.journal}. Portfolio: ${km.portfolio}. Bag: ${km.bag}. Menu: Esc.`),
        h('li', {}, 'All menus work with Tab, Shift+Tab and Enter. No task needs fast reactions.')));
    box.append(h('button', { class: 'primary', onclick: () => this.openKeys() }, 'Change keys'));
  }

  /** Key remapping (spec 21.6). Letters only; arrows, Space, Enter, Esc and numbers keep their jobs. */
  private openKeys(): void {
    const st = ctx.settings;
    const save = () => { saveSettings(st); ctx.world?.applySettings(); this.openKeys(); };
    let waiting: Action | null = null;
    const status = h('p', { class: 'fine', role: 'status', 'aria-live': 'polite' }, 'Choose an action, then press a letter key. If another action has that letter, the two swap.');
    const rows = ACTIONS.map((a) => {
      const btn = h('button', { 'aria-label': `${a.label}: ${st.keys[a.id]}. Change` , onclick: () => {
        waiting = a.id; status.textContent = `Press a letter key for "${a.label}". Press Esc to stop.`;
        rows.forEach((r) => r.classList.remove('waiting')); btn.classList.add('waiting');
      } }, h('kbd', {}, st.keys[a.id]));
      return h('div', { class: 'key-row' }, h('span', {}, a.label), btn);
    });
    const box = this.openModal('controls keys', 'Change keys', this.closeBtn(), h('h2', {}, 'Change keys'), status,
      h('div', { class: 'key-grid' }, ...rows),
      h('p', {}, 'Ready-made layouts:'),
      h('div', { class: 'key-presets' }, ...PRESETS.map((p) => h('button', { onclick: () => { st.keys = { ...p.keys }; save(); } }, p.label))),
      h('p', { class: 'fine' }, 'The arrow keys, Space, Enter, Esc and the number keys always keep their jobs.'));
    box.addEventListener('keydown', (e: KeyboardEvent) => {
      if (!waiting) return;
      if (e.key === 'Escape') { waiting = null; e.stopPropagation(); e.preventDefault(); this.openKeys(); return; }
      if (!mappableKey(e.key)) { status.textContent = 'Only letter keys can be changed. Try a letter.'; return; }
      e.preventDefault(); e.stopPropagation();
      st.keys = assignKey(st.keys, waiting, e.key); save();
    }, true);
  }

  openSettings(): void {
    const st = ctx.settings;
    const set = <K extends keyof Settings>(k: K, v: Settings[K]) => { st[k] = v; saveSettings(st); ctx.world?.applySettings(); };
    const check = (k: keyof Settings, label: string) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!st[k], onchange: (e: Event) => set(k, (e.target as HTMLInputElement).checked as any) }), ` ${label}`);
    const range = (k: 'musicVolume' | 'sfxVolume', label: string) => h('label', { class: 'range' }, `${label} `,
      h('input', { type: 'range', min: '0', max: '1', step: '0.1', value: String(st[k]), onchange: (e: Event) => set(k, Number((e.target as HTMLInputElement).value)) }));
    this.openModal('settings', 'Settings', this.closeBtn(), h('h2', {}, 'Settings'),
      h('label', { class: 'range' }, 'Text size ', h('select', { onchange: (e: Event) => set('textScale', Number((e.target as HTMLSelectElement).value)) },
        ...[1, 1.25, 1.5, 1.75].map((v) => h('option', { value: String(v), selected: st.textScale === v }, `${Math.round(v * 100)}%`)))),
      h('label', { class: 'range' }, 'Interface colours ', h('select', { onchange: (e: Event) => set('theme', (e.target as HTMLSelectElement).value as any) },
        ...THEMES.map((t) => h('option', { value: t.id, selected: st.theme === t.id }, t.label)))),
      h('label', { class: 'range' }, "Lumen's glow ", h('select', { onchange: (e: Event) => set('lumenColour', (e.target as HTMLSelectElement).value as any) },
        ...Object.keys(LUMEN_COLOURS).map((k) => h('option', { value: k, selected: st.lumenColour === k }, k)))),
      check('reducedMotion', 'Reduce motion (no camera fades, sway or flicker)'),
      check('reducedEffects', 'Reduce visual effects (lighting, glow, particles)'),
      check('highContrast', 'High-contrast interface'),
      check('dyslexiaSpacing', 'Wider letter and line spacing'),
      check('guidePrompts', 'Lumen may show short prompts without being asked'),
      check('calmMode', 'Calm mode: surprise events warn first, and you can choose "Later"'),
      check('zenMode', 'Zen mode: no turn limit in Showdowns (the crowd waits), surprise events always ask first, and nothing can be failed'),
      check('glossary', 'Smart glossary: underline key words in conversations, so you can tap them for an explanation'),
      check('talkSounds', 'Talk sounds: short voice sounds while characters speak'),
      check('captions', 'Sound captions: a short text line for each sound (for example [Forge hammer rings])'),
      check('colourSafe', 'Colour-safe marks: blue and orange, with a symbol on every result'),
      'speechSynthesis' in window ? check('readAloud', 'Read conversations aloud (uses your browser\'s voice)') : '',
      range('musicVolume', 'Music volume'), range('sfxVolume', 'Sound effects volume'),
      h('p', { class: 'fine' }, 'Sound is never needed to play. Every sound has a text message.'));
  }

  private openCredits(): void {
    const c = ctx.controller;
    this.openModal('credits wide', 'Credits and sources', this.closeBtn(), h('h2', {}, 'Credits and sources'),
      h('p', {}, 'All art, music and sound in this build are free assets with the CC0 licence (public domain dedication), or original art drawn in code for this game. The full list with links is in CREDITS.md in the project repository.'),
      h('ul', {},
        h('li', {}, 'Tiles and character base: ArMM1998, "Zelda-like tilesets and sprites" (CC0), OpenGameArt.org. Characters recoloured for this game.'),
        h('li', {}, 'Music: cynicmusic, "Town Theme RPG", "Mysterious Ambience (song21)", "Happy Lullaby (song17)" (CC0), OpenGameArt.org.'),
        h('li', {}, 'Sound effects: Kenney, "51 UI sound effects" (CC0); rubberduck, "80 CC0 RPG SFX" (CC0); wobbleboxx, "Level up, power up, Coin get" (CC0); HaelDB, "Completion sound" (CC0). All from OpenGameArt.org.'),
        h('li', {}, 'Font: Lexend (SIL Open Font License), via @fontsource/lexend.'),
        h('li', {}, 'Game engine: Phaser 3 (MIT licence).')),
      h('h3', {}, 'Historical sources'),
      h('ul', { class: 'sources-list' }, ...c.pack.sources.map((src) => h('li', {}, h('a', { href: src.url, target: '_blank', rel: 'noopener' }, `${src.id}: ${src.title}`)))),
      h('p', { class: 'fine' }, 'This game uses no AI service at runtime. Characters speak authored, reviewed lines.'));
  }

  // ------------------------------------------------------- chapter end

  chapterEnd(): void {
    const c = ctx.controller, s = c.state;
    const label = String(s.flags['label.pen.text'] ?? '—');
    const sign = { honest: 'Corvan now sells the blade as pattern-welded, made in the Lyle workshop this season.', down: 'Corvan took his sign down.', note: 'Corvan kept his sign but added the maker\'s name.', old: 'Corvan kept his old sign for now.' }[String(s.flags['sign.state'])] ?? '—';
    const rel = Object.entries(s.relations).filter(([, v]) => v !== 0).map(([id, v]) => `${c.pack.characters.find((x) => x.id === id)?.name}: ${v > 0 ? 'closer' : 'more distant'} (${v > 0 ? '+' : ''}${v})`);
    const firsts = Number(s.flags['count.firsts'] ?? 0);
    this.openModal('chapter-end wide', 'Chapter summary', h('h2', {}, 'Chapter 1 complete'),
      h('h3', {}, 'What you achieved'),
      h('ul', {}, h('li', {}, `The Nexus label now says: "${label}"`), h('li', {}, `In the market square: ${sign}`),
        firsts ? h('li', {}, `You repaired ${firsts} plaque(s) in the Hall of Firsts.`) : null),
      h('h3', {}, 'What remains uncertain'),
      h('ul', {}, h('li', {}, 'Who deserves credit for an invention depends on what "first" means: a patent, a working pen, or a pen people could buy.'),
        h('li', {}, 'The thread went dark: nobody recorded where Hesper\'s steel stock came from.'),
        h('li', {}, 'Nobody knows who made the small gold seal, or why it was on Corvan\'s sign. Warden Ise went quiet when she saw it.')),
      h('h3', {}, 'Who was affected'),
      h('ul', {}, ...(rel.length ? rel.map((r) => h('li', {}, r)) : [h('li', {}, 'No relationships changed much.')])),
      h('p', { class: 'fine' }, 'Different choices lead to different consequences. None of them is the hidden "right answer". Your awards, concept XP, moments and portfolio are kept if you start again.'),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Keep exploring'), h('button', { onclick: () => { this.closeModal(); (window as any).kgToTitle?.(); } }, 'Title screen')));
    this.sfx('sfx.award');
  }
}
