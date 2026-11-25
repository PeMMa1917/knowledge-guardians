/**
 * The HTML interface laid over the game canvas: menus, HUD, dialogue,
 * inspection, evidence board, minigames, journal and settings.
 *
 * Ordinary HTML controls are used for reading and choosing, so they work with
 * keyboard, screen readers, browser zoom and text scaling (spec 22.2, 21.6).
 * Every action goes through ctx.controller.dispatch (domain commands).
 */
import { ctx, type UIApi } from '../app/context';
import { saveSettings, type Settings } from '../app/settings';
import { ACTIONS, PRESETS, actionFor, assignKey, mappableKey, type Action } from '../app/keymap';
import type { GameEvent, SimulationResult } from '../domain/engine';
import { conceptXP, totalXP } from '../domain/permanent';
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
function chip(text: string, title: string, cls: string): HTMLElement {
  return h('span', { class: `chip ${cls}`, title, 'aria-label': `${text}: ${title}` }, text);
}
export function histChip(l: HistoricalLabel): HTMLElement { return chip(HIST_LABEL_TEXT[l][0], HIST_LABEL_TEXT[l][1], `hist-${l}`); }
export function claimChip(k: ClaimKind): HTMLElement { return chip(CLAIM_TEXT[k][0], CLAIM_TEXT[k][1], `claim-${k}`); }

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
    if (e.key === 'Escape') { if (this.modal) this.closeModal(); else this.openMenu(); return; }
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
  }

  // ------------------------------------------------------------- title

  showTitle(): void {
    clear(this.root); this.root.append(this.toastBox);
    const c = ctx.controller;
    const cont = c.pair.continue, rec = c.pair.recovery;
    const fmt = (e: typeof cont) => e ? `${e.label} · ${e.location} · ${e.kind === 'suspend' ? 'Suspended' : 'Checkpoint'} · ${new Date(e.savedAt).toLocaleString()}` : '';
    const box = h('div', { class: 'title-screen' },
      h('div', { class: 'title-art', 'aria-hidden': 'true' }, h('img', { src: artURL('lumen'), alt: '' })),
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
    let look: string = PLAYER_LOOKS[0];
    const name = h('input', { id: 'pname', maxlength: '24', value: '', placeholder: 'Your Guardian name', autocomplete: 'off', 'data-autofocus': true }) as HTMLInputElement;
    const looks = h('div', { class: 'looks', role: 'radiogroup', 'aria-label': 'Appearance' },
      ...PLAYER_LOOKS.map((id, i) => {
        const b = h('button', { class: 'look', role: 'radio', 'aria-checked': String(i === 0), 'aria-label': `Appearance ${i + 1}`, onclick: () => {
          look = id; looks.querySelectorAll('.look').forEach((x) => x.setAttribute('aria-checked', 'false')); b.setAttribute('aria-checked', 'true');
        } }, h('span', { class: 'sprite', style: { backgroundImage: `url(assets/art/generated/characters/${id}.png)` } }));
        return b;
      }));
    const start = () => {
      const n = name.value.trim() || 'Recruit';
      ctx.controller.newGame(n.slice(0, 24), look);
      this.startPlaying(false);
    };
    name.addEventListener('keydown', (e) => { if (e.key === 'Enter') start(); });
    const box = h('div', { class: 'title-screen create' },
      h('h1', {}, 'A new Guardian'),
      h('p', {}, 'Every student is a Knowledge Guardian from the first day. Choose a name and how you look. You can play in any way you like.'),
      h('label', { for: 'pname' }, 'Name'), name,
      h('p', { class: 'label' }, 'Appearance'), looks,
      h('div', { class: 'row' }, h('button', { class: 'primary', onclick: start }, 'Begin'), h('button', { onclick: () => this.showTitle() }, 'Back')));
    this.root.append(box);
    setTimeout(() => name.focus(), 0);
  }

  private startPlaying(returning: boolean): void {
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
      h('button', { onclick: () => this.askLumen(), title: `Ask Lumen for a hint (${km.hint})` }, h('img', { src: artURL('lumen'), alt: '' }), ' Hint ', h('kbd', {}, km.hint)),
      h('button', { onclick: () => this.openJournal(), title: `Journal (${km.journal})` }, 'Journal ', h('kbd', {}, km.journal)),
      h('button', { onclick: () => this.openJournal('portfolio'), title: `Portfolio (${km.portfolio})` }, 'Portfolio ', h('kbd', {}, km.portfolio)),
      h('button', { onclick: () => this.openBag(), title: `Bag (${km.bag})` }, 'Bag ', h('kbd', {}, km.bag)),
      h('button', { onclick: () => this.openMenu(), title: 'Menu (Esc)' }, 'Menu ', h('kbd', {}, 'Esc')));
    this.hud.append(tracker, bar);
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
    this.lumenBubble.append(h('img', { src: artURL('lumen'), alt: '' }), h('span', {}, h('strong', {}, 'Lumen: '), text),
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
      h('div', { class: 'lumen-head' }, h('img', { src: artURL('lumen'), alt: '', class: 'lumen-big' }), h('h2', {}, 'Lumen')),
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
        case 'xp': this.toast(`+${e.amount} concept XP (permanent)`, 'xp'); break;
        case 'checkpoint': this.toast(`Checkpoint saved: ${e.label}`, 'save'); break;
        case 'error': this.toast(e.message, 'error'); break;
        case 'moment': this.toast(`Learner profile moment: ${PROFILE_NAMES[e.moment.attribute]}. ${e.moment.did}`, 'moment'); break;
        case 'portfolio': this.toast(`Added to your portfolio: ${e.title}`, 'info'); break;
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
    if (!ctx.settings.calmMode) { play(); return; }
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
      h('div', { class: 'lumen-head' }, h('img', { src: artURL('lumen'), alt: '', class: 'lumen-big' }), h('h2', {}, 'A question to think about')),
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
    const n: DialogueNode = c.engine.node(id);
    const speaker = n.speaker === 'lumen' ? { name: 'Lumen', role: 'Fairy guide', sprite: '' }
      : n.speaker === 'narrator' ? { name: '', role: '', sprite: '' } : c.pack.characters.find((x) => x.id === n.speaker);
    const portrait = n.speaker === 'lumen'
      ? h('img', { class: 'portrait lumen-portrait', src: artURL('lumen'), alt: '' })
      : n.speaker === 'narrator' ? null
      : h('span', { class: 'portrait', style: { backgroundImage: `url(assets/art/generated/characters/${(speaker as any)?.sprite}.png)` }, 'aria-hidden': 'true' });
    const opts = c.engine.visibleOptions(id, c.state);
    const optionList = h('div', { class: 'options' });
    if (opts.length) {
      opts.forEach((o, i) => optionList.append(h('button', { 'data-autofocus': i === 0, onclick: () => {
        this.sfx('sfx.click');
        const r = c.dispatch({ type: 'ChooseDialogueOption', node: id, index: o.index }) as any;
        if (r.some((e: GameEvent) => e.kind === 'error')) return;
        const next = r.nextNode as string | null;
        if (next) this.showNode(next); else this.endDialogue(o.option.open);
      } }, h('span', { class: 'num', 'aria-hidden': 'true' }, `${i + 1}`), o.option.tag ? h('em', {}, `${o.option.tag}: `) : null, o.option.text)));
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
    pop.append(h('img', { src: artURL('lumen'), alt: '', class: 'gloss-lumen' }),
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
    c.dispatch({ type: 'ShowdownStart', showdown: id });
    const box = this.openModal('showdown wide', rec.title);
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
      box.append(this.closeBtn(), h('h2', {}, rec.title), h('p', { class: 'fine' }, `${rec.place}. No timer. Each move says why it worked or not.`),
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
      box.append(h('h3', {}, 'Your move'), h('div', { class: 'moves' },
        pick('Support with a card', cards.filter((x) => !sd.used.includes(x.v)), (v) => move({ move: 'support', card: v })),
        h('span', { class: 'move-pair' },
          pick('Challenge a link', rec.opponentClaim.links.filter((l) => !sd.cracked.includes(l.id)).map((l) => ({ v: l.id, t: l.text })), (v) => {
            const s2 = h('div', { class: 'row' }, h('span', {}, 'With which card?'), pick('Card', cards, (cv) => move({ move: 'challenge', link: v, card: cv })));
            box.querySelector('.move-pair')!.append(s2);
          })),
        pick('Counterexample', cards, (v) => move({ move: 'counter', card: v })),
        wit.length ? pick('Call a witness', wit.map((w) => ({ v: w.id, t: w.name })), (v) => move({ move: 'witness', witness: v })) : '',
        h('button', { title: MOVE_HELP.qualify, onclick: () => move({ move: 'qualify' }) }, 'Qualify my claim'),
        h('button', { title: MOVE_HELP.reframe, onclick: () => move({ move: 'reframe' }) }, 'Reframe the question'),
        sd.openPoint ? h('button', { class: 'primary', title: MOVE_HELP.concede, onclick: () => move({ move: 'concede' }) }, 'Concede the fair point') : '',
        h('button', { title: MOVE_HELP.source, onclick: () => move({ move: 'source' }) }, 'Ask for the source'),
        h('button', { class: 'cheap', title: MOVE_HELP.attack, onclick: () => move({ move: 'attack' }) }, 'Attack the person'),
        h('button', { class: 'cheap', title: MOVE_HELP.shout, onclick: () => move({ move: 'shout' }) }, 'Shout louder'),
        h('button', { class: 'primary', title: MOVE_HELP.rest, onclick: () => move({ move: 'rest' }) }, 'Rest my case')),
        h('p', { class: 'fine' }, 'Hover or focus a move to see what it does. Cheap shots never damage a claim.'));
      const logEl = box.querySelector('.sd-log'); if (logEl) logEl.scrollTop = logEl.scrollHeight;
      if (sd.claim) box.scrollTop = box.scrollHeight;
    };
    render();
  }

  // ------------------------------------------------------------- Waystone (38.7)

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
        } }, 'Rest and go on'),
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
    const tabs: Record<string, string> = { entries: 'Entries', cards: 'Evidence cards', notes: 'My notes', moments: 'Moments', portfolio: 'Portfolio', atlas: 'Atlas', stones: 'Question Stones', glossary: 'Glossary', awards: 'Awards and XP', sources: 'Sources' };
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
        h('ul', { class: 'xp' }, ...Object.entries(xp).map(([k, v]) => h('li', {}, `${k[0].toUpperCase()}${k.slice(1)}: ${v}`))),
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
    this.openModal('journal wide', 'Journal', this.closeBtn(), h('h2', {}, `${s.player.name}'s journal`), nav, body);
  }

  private openBag(): void {
    const c = ctx.controller, s = c.state;
    this.openModal('bag', 'Bag', this.closeBtn(), h('h2', {}, 'Bag'),
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
        h('button', { onclick: () => this.openSettings() }, 'Settings'),
        h('button', { onclick: () => this.openShare() }, 'Share with my teacher'),
        h('button', { onclick: () => this.openControls() }, 'Controls'),
        c.canRecover() ? h('button', { onclick: () => this.confirmRecovery() }, 'Checkpoint recovery…') : null,
        h('button', { onclick: () => this.openCredits() }, 'Credits and sources')));
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
      check('reducedMotion', 'Reduce motion (no camera fades, sway or flicker)'),
      check('reducedEffects', 'Reduce visual effects (lighting, glow, particles)'),
      check('highContrast', 'High-contrast interface'),
      check('dyslexiaSpacing', 'Wider letter and line spacing'),
      check('guidePrompts', 'Lumen may show short prompts without being asked'),
      check('calmMode', 'Calm mode: surprise events warn first, and you can choose "Later"'),
      check('glossary', 'Smart glossary: underline key words in conversations, so you can tap them for an explanation'),
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
