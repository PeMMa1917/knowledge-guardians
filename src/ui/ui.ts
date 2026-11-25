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
import type { GameEvent, SimulationResult } from '../domain/engine';
import { SORT_KEY } from '../domain/engine';
import { conceptXP, totalXP } from '../domain/permanent';
import type { ClaimKind, DialogueNode, EvidenceCard, HistoricalLabel } from '../domain/types';
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
const SORT_STEPS: Record<string, string> = {
  'stack-pieces': 'Stack pieces of two different steels',
  'forge-weld': 'Heat the stack and hammer the layers together',
  'twist-rods': 'Twist and fold the welded bar to make layers bend',
  'seal-crucible': 'Seal iron and other materials in a closed clay pot',
  'melt-in-crucible': 'Heat the pot until the contents melt',
  'cool-to-ingot': 'Let it cool slowly into a small cake (ingot)',
  'shape-blade': 'Forge and grind the steel into a blade shape',
  'etch-surface': 'Polish and etch the surface so a pattern shows',
};
const ROUTES: Record<string, string> = { pattern: 'Pattern welding', crucible: 'Crucible steel', both: 'Both routes' };

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
    if (!this.modal) return;
    this.releaseTrap?.();
    this.modal.remove();
    this.modal = null;
    if (sound) this.sfx('sfx.click');
    (document.querySelector('#game canvas') as HTMLElement | null)?.focus();
    this.refreshHud();
    if (this.pendingChapterEnd) { this.pendingChapterEnd = false; this.chapterEnd(); }
  }

  private closeBtn(): HTMLElement {
    return h('button', { class: 'close', 'aria-label': 'Close', onclick: () => this.closeModal() }, '✕');
  }

  toast(text: string, kind = 'info'): void {
    const t = h('div', { class: `toast toast-${kind}` }, text);
    this.toastBox.append(t);
    setTimeout(() => t.classList.add('out'), 3600);
    setTimeout(() => t.remove(), 4200);
  }

  setPrompt(text: string | null): void {
    if (!this.promptEl) return;
    if (!text || this.modal) { this.promptEl.hidden = true; return; }
    this.promptEl.hidden = false;
    clear(this.promptEl);
    this.promptEl.append(h('kbd', {}, 'E'), ` ${text}`);
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
    const k = e.key.toLowerCase();
    if (k === 'j') this.openJournal();
    else if (k === 'b') this.openBoard();
    else if (k === 'i') this.openBag();
    else if (k === 'h') this.askLumen();
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
  }

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
    const bar = h('nav', { class: 'hud-buttons', 'aria-label': 'Game menu' },
      h('span', { class: 'marks', title: 'Marks (campaign money)' }, h('img', { src: artURL('icon.card'), alt: '' }), ` ${s.marks} marks`),
      h('button', { onclick: () => this.askLumen(), title: 'Ask Lumen for a hint (H)' }, h('img', { src: artURL('lumen'), alt: '' }), ' Hint ', h('kbd', {}, 'H')),
      h('button', { onclick: () => this.openJournal(), title: 'Journal (J)' }, 'Journal ', h('kbd', {}, 'J')),
      h('button', { onclick: () => this.openBoard(), title: 'Evidence board (B)' }, 'Board ', h('kbd', {}, 'B')),
      h('button', { onclick: () => this.openBag(), title: 'Bag (I)' }, 'Bag ', h('kbd', {}, 'I')),
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
    const c = ctx.controller;
    for (const e of events) {
      switch (e.kind) {
        case 'card': { const card = c.pack.cards.find((x) => x.id === e.id); this.toast(`New evidence card: ${card?.title}`, 'card'); this.sfx('sfx.page'); break; }
        case 'item': { const it = c.pack.items.find((x) => x.id === e.id); this.toast(`${e.qty > 0 ? 'Received' : 'Gave'}: ${it?.name ?? e.id}`, 'item'); this.sfx('sfx.pickup'); break; }
        case 'marks': this.toast(`${e.delta > 0 ? '+' : ''}${e.delta} marks`, 'item'); this.sfx('sfx.coins'); break;
        case 'objective':
          this.toast(`Step complete: ${e.title}`, 'objective'); this.sfx('sfx.complete');
          if (e.id === 'm02.o6.report') this.pendingChapterEnd = true;
          break;
        case 'award': this.toast(`${e.award.kind === 'badge' ? 'Badge' : e.award.kind === 'skill-milestone' ? 'Skill milestone' : 'Concept award'}: ${e.award.name}. ${e.award.earnedBy}`, 'award'); this.sfx('sfx.award'); ctx.world?.lumenBurst(); break;
        case 'xp': this.toast(`+${e.amount} concept XP (permanent)`, 'xp'); break;
        case 'checkpoint': this.toast(`Checkpoint saved: ${e.label}`, 'save'); break;
        case 'error': this.toast(e.message, 'error'); break;
        default: break;
      }
    }
    this.refreshHud();
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
    const speaker = n.speaker === 'lumen' ? { name: 'Lumen', role: 'Fairy guide', sprite: '' } : c.pack.characters.find((x) => x.id === n.speaker);
    const portrait = n.speaker === 'lumen'
      ? h('img', { class: 'portrait lumen-portrait', src: artURL('lumen'), alt: '' })
      : h('span', { class: 'portrait', style: { backgroundImage: `url(assets/art/generated/characters/${(speaker as any)?.sprite}.png)` }, 'aria-hidden': 'true' });
    const opts = c.engine.visibleOptions(id, c.state);
    const optionList = h('div', { class: 'options' });
    if (opts.length) {
      opts.forEach((o, i) => optionList.append(h('button', { 'data-autofocus': i === 0, onclick: () => {
        this.sfx('sfx.click');
        const r = c.dispatch({ type: 'ChooseDialogueOption', node: id, index: o.index }) as any;
        if (r.some((e: GameEvent) => e.kind === 'error')) return;
        const next = r.nextNode as string | null;
        if (next) this.showNode(next); else this.closeModal(false);
      } }, h('span', { class: 'num', 'aria-hidden': 'true' }, `${i + 1}`), o.option.tag ? h('em', {}, `${o.option.tag}: `) : null, o.option.text)));
    } else {
      optionList.append(h('button', { 'data-autofocus': true, onclick: () => { this.sfx('sfx.click'); if (n.next) this.showNode(n.next); else this.closeModal(false); } }, n.next ? 'Continue ▸' : 'Close'));
    }
    const extra = id === 'sefa.free' ? this.freeQuestion() : null;
    this.openModal('dialogue', `Conversation with ${speaker?.name}`,
      h('div', { class: 'speaker' }, portrait, h('div', {}, h('strong', {}, speaker?.name ?? ''), h('small', {}, speaker?.role ?? ''))),
      h('p', { class: 'line' }, n.text),
      h('div', { class: 'chips' }, n.claimKind ? claimChip(n.claimKind) : null, n.historicalLabel ? histChip(n.historicalLabel) : null),
      extra ?? '', optionList);
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
          h('div', { class: 'card-mini' }, h('p', { class: 'fine' }, 'Evidence card in your journal:'), this.cardView(card)))));
  }

  private cardView(card: EvidenceCard, extra?: Node): HTMLElement {
    return h('article', { class: 'card' },
      h('h3', {}, card.title),
      h('div', { class: 'chips' }, claimChip(card.claimKind), histChip(card.historicalLabel)),
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

  // ------------------------------------------------------- evidence board

  openBoard(): void {
    const c = ctx.controller, s = c.state;
    if (!s.flags['talked.ise']) { this.toast('Report to Warden Ise first.', 'info'); return; }
    const active = new Set(c.engine.activeMissions(s).map((m) => m.id));
    const claims = c.pack.claims.filter((cl) => active.has(cl.mission));
    const render = (box: HTMLElement) => {
      clear(box);
      const st = c.state;
      box.append(this.closeBtn(), h('h2', {}, 'Evidence board'),
        h('p', { class: 'fine' }, 'Attach a card to a claim to see how it bears on that claim. The board describes support and limits. It does not mark answers right or wrong.'));
      for (const cl of [...claims].reverse()) {
        const attached = (st.board[cl.id] ?? []).map((id) => c.pack.cards.find((x) => x.id === id)!).filter(Boolean);
        const counts = { supports: 0, qualifies: 0, challenges: 0, none: 0 };
        for (const card of attached) counts[(card.bears?.[cl.id] ?? 'none') as keyof typeof counts]++;
        const summary = attached.length === 0 ? 'Unsupported so far: no evidence attached.'
          : [counts.supports ? `${counts.supports} card(s) support it` : '', counts.qualifies ? `${counts.qualifies} card(s) limit or qualify it` : '', counts.challenges ? `${counts.challenges} card(s) challenge it` : '', counts.none ? `${counts.none} card(s) do not bear on it` : ''].filter(Boolean).join('; ') + '.';
        const available = st.cards.filter((id) => !attached.some((a) => a.id === id));
        const sel = h('select', { 'aria-label': `Choose a card for: ${cl.text}` }, h('option', { value: '' }, 'Attach a card…'),
          ...available.map((id) => h('option', { value: id }, c.pack.cards.find((x) => x.id === id)?.title ?? id))) as HTMLSelectElement;
        sel.addEventListener('change', () => { if (!sel.value) return; c.dispatch({ type: 'AttachEvidence', claim: cl.id, card: sel.value }); this.sfx('sfx.page'); render(box); });
        box.append(h('section', { class: 'claim' },
          h('h3', {}, `“${cl.text}”`), h('div', { class: 'chips' }, claimChip(cl.claimKind)),
          h('p', { class: 'summary' }, summary),
          h('div', { class: 'attached' }, ...attached.map((card) => {
            const how = card.bears?.[cl.id];
            const word = how === 'supports' ? 'Supports' : how === 'qualifies' ? 'Qualifies' : how === 'challenges' ? 'Challenges' : 'Does not bear on this claim';
            return this.cardView(card, h('div', { class: 'row' }, h('span', { class: `bear bear-${how ?? 'none'}` }, word),
              h('button', { class: 'mini', onclick: () => { c.dispatch({ type: 'DetachEvidence', claim: cl.id, card: card.id }); render(box); } }, 'Remove')));
          })),
          available.length ? sel : h('p', { class: 'fine' }, 'No more cards to attach. Inspect and talk to find more.')));
      }
    };
    const box = this.openModal('board-panel wide', 'Evidence board');
    render(box);
  }

  // ------------------------------------------------------------- sort

  openSort(): void {
    const c = ctx.controller;
    if (!c.state.flags['open.sort'] && !c.state.flags['sort.done']) { this.toast('Ask Hesper about the process cards first.', 'info'); return; }
    const placements: Record<string, string> = {};
    const steps = Object.keys(SORT_KEY).sort((a, b) => SORT_STEPS[a].localeCompare(SORT_STEPS[b]));
    const feedback = h('div', { class: 'sort-feedback', role: 'status', 'aria-live': 'polite' });
    const rows = steps.map((id) => {
      const sel = h('select', { 'aria-label': `Route for: ${SORT_STEPS[id]}` }, h('option', { value: '' }, 'Choose…'),
        ...Object.entries(ROUTES).map(([v, l]) => h('option', { value: v }, l))) as HTMLSelectElement;
      if (c.state.flags['sort.done']) sel.value = SORT_KEY[id];
      sel.addEventListener('change', () => { placements[id] = sel.value; });
      if (sel.value) placements[id] = sel.value;
      return h('li', { 'data-step': id }, h('span', {}, SORT_STEPS[id]), sel);
    });
    const submit = () => {
      const ev = c.dispatch({ type: 'SubmitSort', placements });
      const r = (ev.find((e) => e.kind === 'sort') as any)?.result;
      if (!r) return;
      this.sfx(r.complete ? 'sfx.metal' : 'sfx.click');
      rows.forEach((li) => li.classList.toggle('mismatch', r.mismatched.includes(li.dataset.step!)));
      clear(feedback);
      feedback.append(r.complete
        ? h('p', {}, 'Hesper nods. "That is how the two routes go. And see: shaping and etching happen in both. So a pattern on the surface cannot tell you which route made the steel."')
        : h('p', {}, `Hesper taps ${r.mismatched.length} card(s). "Look again at these. Does this step happen only when you weld pieces together, only when you melt steel in a sealed pot, or in both?" The highlighted cards do not match how the routes work. Change them and try again. There is no penalty.`));
    };
    this.openModal('sort wide', 'Process cards', this.closeBtn(),
      h('h2', {}, "Hesper's process cards"),
      h('div', { class: 'chips' }, histChip('fictional-world')),
      h('p', { class: 'fine' }, 'Schematic only, not a working recipe. Sort each step: pattern welding, crucible steel, or both routes.'),
      h('ul', { class: 'sort-list' }, ...rows),
      h('div', { class: 'row' }, h('button', { class: 'primary', onclick: submit }, 'Show Hesper')), feedback);
  }

  // --------------------------------------------------- journal & bag

  openJournal(tab = 'entries'): void {
    if (!ctx.controller.state) return;
    this.sfx('sfx.book');
    const c = ctx.controller, s = c.state;
    const tabs: Record<string, string> = { entries: 'Entries', cards: 'Evidence cards', notes: 'My notes', awards: 'Awards and XP', sources: 'Sources' };
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
    } else if (tab === 'awards') {
      const xp = conceptXP(c.permanent, c.pack);
      body.append(h('p', {}, h('strong', {}, `Total concept XP: ${totalXP(c.permanent)}`), ' (permanent; it stays if you load an earlier checkpoint)'),
        h('ul', { class: 'xp' }, ...Object.entries(xp).map(([k, v]) => h('li', {}, `${k[0].toUpperCase()}${k.slice(1)}: ${v}`))),
        h('h3', {}, 'Earned'),
        h('ul', { class: 'awards' }, ...c.pack.awards.filter((a) => c.permanent.awards[a.id]).map((a) => h('li', {}, h('strong', {}, `${a.name} `), h('small', {}, `(${a.kind.replace('-', ' ')})`), h('br', {}), a.earnedBy))),
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
        h('button', { onclick: () => this.openControls() }, 'Controls'),
        c.canRecover() ? h('button', { onclick: () => this.confirmRecovery() }, 'Checkpoint recovery…') : null,
        h('button', { onclick: () => this.openCredits() }, 'Credits and sources')));
  }

  private openControls(): void {
    this.openModal('controls', 'Controls', this.closeBtn(), h('h2', {}, 'Controls'),
      h('ul', {},
        h('li', {}, 'Walk: arrow keys or W A S D. Or click/tap a spot.'),
        h('li', {}, 'Talk / inspect / use: E, Space or Enter. Or click/tap a person or object.'),
        h('li', {}, 'Choose a dialogue option: click it, or press its number.'),
        h('li', {}, 'Hint from Lumen: H. Journal: J. Evidence board: B. Bag: I. Menu: Esc.'),
        h('li', {}, 'All menus work with Tab, Shift+Tab and Enter. No task needs fast reactions.')));
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
    const label = { patent: 'the first documented patent (Loud, 1888)', practical: 'the first practical writing pen (the Bíró brothers and others)', timeline: 'a three-part timeline instead of one "first"', question: 'a question for visitors: "First at what?"' }[String(s.flags['label.choice'])] ?? '—';
    const blade = { 'relabel-buy': 'bought it at a fair price with an honest label', 'buy-annotate': 'paid the full price and annotated your own record', 'public-correction': 'posted a public correction on the guild board', decline: 'declined to buy it' }[String(s.flags['blade.choice'])] ?? '—';
    const rel = Object.entries(s.relations).filter(([, v]) => v !== 0).map(([id, v]) => `${c.pack.characters.find((x) => x.id === id)?.name}: ${v > 0 ? 'closer' : 'more distant'} (${v > 0 ? '+' : ''}${v})`);
    this.openModal('chapter-end wide', 'Chapter summary', h('h2', {}, 'Chapter 1 complete'),
      h('h3', {}, 'What you achieved'),
      h('ul', {}, h('li', {}, `You rewrote the Nexus label around ${label}.`), h('li', {}, `In Emberford, you ${blade}.`)),
      h('h3', {}, 'What remains uncertain'),
      h('ul', {}, h('li', {}, 'Who deserves credit for an invention depends on what "first" means: a patent, a working pen, or a pen people could buy.'), h('li', {}, 'Where Hesper\'s steel stock came from is not in any record you saw.')),
      h('h3', {}, 'Who was affected'),
      h('ul', {}, ...(rel.length ? rel.map((r) => h('li', {}, r)) : [h('li', {}, 'No relationships changed much.')])),
      h('p', { class: 'fine' }, 'Different choices lead to different consequences. None of them is the hidden "right answer". Your awards and concept XP are kept if you start again.'),
      h('div', { class: 'row' }, h('button', { class: 'primary', 'data-autofocus': true, onclick: () => this.closeModal() }, 'Keep exploring'), h('button', { onclick: () => { this.closeModal(); (window as any).kgToTitle?.(); } }, 'Title screen')));
    this.sfx('sfx.award');
  }
}
