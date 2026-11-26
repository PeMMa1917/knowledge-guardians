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
import Phaser from 'phaser';
import { ctx } from './app/context';
import { GameController } from './app/controller';
import { applySettingsToDocument, loadSettings } from './app/settings';
import { setupCaptions } from './app/captions';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { UI } from './ui/ui';
import { observeConceptText } from './ui/conceptMarkup';
import { flushJournalWriting } from './ui/journalWriting';

ctx.settings = loadSettings();
applySettingsToDocument(ctx.settings);
setupCaptions(() => ctx.settings.captions);
ctx.controller = new GameController();

let game: Phaser.Game | null = null;

function startWorld(): void {
  if (!game) return;
  if (game.scene.isActive('world')) game.scene.getScene('world').scene.restart({});
  else game.scene.start('world', {});
}

const uiRoot = document.getElementById('ui')!;
observeConceptText(uiRoot);
const ui = new UI(uiRoot, () => {
  if (booted) startWorld(); else pendingStart = true;
});
ctx.ui = ui;

let booted = false, pendingStart = false;

const gameParent = document.getElementById('game')!;
game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameParent,
  backgroundColor: '#120f24',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  audio: { disableWebAudio: false },
  scene: [BootScene, WorldScene],
});
const { events, scale } = game;
events.once(Phaser.Core.Events.READY, () => {
  // Native resize can leave Phaser waiting for a game step. Reconcile with the laid-out parent.
  const viewport = new ResizeObserver(([{ contentRect: { width, height } }]) => {
    if (width > 0 && height > 0 && (width !== scale.width || height !== scale.height)) {
      scale.setParentSize(width, height);
    }
  });
  viewport.observe(gameParent);
  events.once(Phaser.Core.Events.DESTROY, () => viewport.disconnect());
});
game.events.once('boot-complete', () => {
  booted = true;
  if (pendingStart) startWorld();
});

/** Return to the title screen (used by "Save and leave" and the chapter end). */
(window as any).kgToTitle = () => {
  if (game?.scene.isActive('world')) game.scene.stop('world');
  ctx.world = null;
  game?.sound.stopAll();
  ui.showTitle();
};

ui.showTitle();

// A reload can fire pagehide before or after visibilitychange. Save once for
// either order, and start a new cycle if the player returns to the page.
let handledExitSave = false;
function saveOnExit(includeAdventure: boolean): void {
  if (handledExitSave || !ctx.world || !ctx.controller.state) return;
  const label = 'Auto-save when leaving';
  if (flushJournalWriting(ctx.controller, label) !== null) handledExitSave = true;
  else if (includeAdventure) {
    handledExitSave = true;
    ctx.controller.suspend(label);
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') saveOnExit(true);
  else handledExitSave = false;
});
window.addEventListener('pagehide', () => saveOnExit(false));
window.addEventListener('pageshow', () => { handledExitSave = false; });

// The Guardian's Ledger: count active play time (input in the last 2 minutes, tab visible, in the world).
for (const ev of ['keydown', 'pointerdown', 'wheel'] as const) window.addEventListener(ev, () => ctx.controller.noteInput(), { passive: true });
setInterval(() => { if (ctx.world) ctx.controller.tickActive(document.visibilityState === 'visible'); }, 15_000);
// Debug/test hook: lets automated tests read state. Not used by the game.
(window as any).kg = ctx;
