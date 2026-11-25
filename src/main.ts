/**
 * Entry point. Creates the controller, the HTML interface and the Phaser game.
 * See docs/ARCHITECTURE.md for how the parts fit together.
 */
import '@fontsource/lexend/300.css';
import '@fontsource/lexend/400.css';
import '@fontsource/lexend/600.css';
import './ui/styles.css';
import Phaser from 'phaser';
import { ctx } from './app/context';
import { GameController } from './app/controller';
import { applySettingsToDocument, loadSettings } from './app/settings';
import { setupCaptions } from './app/captions';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { UI } from './ui/ui';

ctx.settings = loadSettings();
applySettingsToDocument(ctx.settings);
setupCaptions(() => ctx.settings.captions);
ctx.controller = new GameController();

let game: Phaser.Game | null = null;

function startWorld(): void {
  if (!game) return;
  if (game.scene.isActive('world')) game.scene.getScene('world').scene.restart();
  else game.scene.start('world');
}

const ui = new UI(document.getElementById('ui')!, () => {
  if (booted) startWorld(); else pendingStart = true;
});
ctx.ui = ui;

let booted = false, pendingStart = false;

game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#120f24',
  pixelArt: true,
  roundPixels: true,
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  audio: { disableWebAudio: false },
  scene: [BootScene, WorldScene],
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

// Save a suspend state when the tab is hidden. A browser may still close
// before this finishes, so this is a convenience, not a guarantee (spec 24.1).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && ctx.world && ctx.controller.state) ctx.controller.suspend('Auto-save when leaving');
});

// The Guardian's Ledger: count active play time (input in the last 2 minutes, tab visible, in the world).
for (const ev of ['keydown', 'pointerdown', 'wheel'] as const) window.addEventListener(ev, () => ctx.controller.noteInput(), { passive: true });
setInterval(() => { if (ctx.world) ctx.controller.tickActive(document.visibilityState === 'visible'); }, 15_000);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && ctx.controller.state) ctx.controller.saves.savePermanent(ctx.controller.permanent);
});

// Debug/test hook: lets automated tests read state. Not used by the game.
(window as any).kg = ctx;
