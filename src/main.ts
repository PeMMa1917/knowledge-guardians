import { prepareCore, prepareMap } from 'virtual:kg-chapters';
import {classroom} from './classroom/client';
/**
 * Entry point. Creates the controller, the HTML interface and the Phaser game.
 * See docs/ARCHITECTURE.md for how the parts fit together.
 */
import '@fontsource/lexend/300.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import '@fontsource/lexend/700.css';
import './ui/styles.css';
import './ui/conceptMarkup.css';
import { ctx } from './app/context';
import { GameController } from './app/controller';
import { type Settings } from './app/settings';
import { setupCaptions } from './app/captions';
import { UI } from './ui/ui';
import { observeConceptText } from './ui/conceptMarkup';
import { flushJournalWriting } from './ui/journalWriting';

export function enterGame(settings: Settings, action?: import('./ui/titleActions').TitleAction): void {
  ctx.settings = settings;
  setupCaptions(() => ctx.settings.captions);
  ctx.controller = new GameController();

  let runtime: typeof import('./app/worldRuntime') | undefined;
  async function prepareWorld(mapId?: string) {
    runtime ??= await import('./app/worldRuntime');
    if (!mapId) return runtime.prepareWorld();
    await Promise.all([runtime.prepareWorld(), prepareCore().then(() => prepareMap(mapId))]);
    await runtime.prepareRoomPictures(mapId);
  }

  const uiRoot = document.getElementById('ui')!;
  observeConceptText(uiRoot);
  const ui = new UI(uiRoot, prepareWorld, () => runtime?.startWorld());
  ctx.ui = ui;

  /** Return to the title screen (used by "Save and leave" and the chapter end). */
  (window as any).kgToTitle = () => {
    runtime?.stopWorld();
    ctx.world = null;
    ui.showTitle();
  };

  ui.showTitle();
  if (action && !(action==='new' && (ctx.controller.loadProblem || ctx.controller.pair.continue || ctx.controller.pair.recovery))) ui.openTitleAction(action);

  // A reload can fire pagehide before or after visibilitychange. Save once for
  // either order, and start a new cycle if the player returns to the page.
  let handledExitSave = false;
  function saveOnExit(): void {
    if (handledExitSave || !ctx.world || !ctx.controller.state) return;
    const label = 'Auto-save when leaving';
    handledExitSave = flushJournalWriting(ctx.controller, label) ?? ctx.controller.suspend(label);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { saveOnExit(); void classroom?.sync(true); }
    else handledExitSave = false;
  });
  window.addEventListener('pagehide', () => { saveOnExit(); void classroom?.sync(true); });
  window.addEventListener('pageshow', () => { handledExitSave = false; });

  // The Guardian's Ledger: count active play time (input in the last 2 minutes, tab visible, in the world).
  for (const ev of ['keydown', 'pointerdown', 'wheel'] as const) window.addEventListener(ev, () => ctx.controller.noteInput(), { passive: true });
  setInterval(() => { if (ctx.world) ctx.controller.tickActive(document.visibilityState === 'visible'); }, 15_000);
  // Debug/test hook: lets automated tests read state. Not used by the game.
  (window as any).kg = ctx;

  window.addEventListener('kg-class-status',()=>{ for(const label of document.querySelectorAll('[data-class-status]')) label.textContent=classroom?.status ?? ''; });
}
