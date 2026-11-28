import Phaser from 'phaser';
import { ctx } from './context';
import { paceReadingRoom } from './readingPace';
import { BootScene } from '../scenes/BootScene';
import { WorldScene } from '../scenes/WorldScene';

let game: Phaser.Game | undefined;
let boot: Promise<void> | undefined;

function createWorld(parent: HTMLElement) {
  const world = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#120f24',
    pixelArt: true,
    roundPixels: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    audio: { disableWebAudio: false },
    scene: [BootScene, WorldScene],
  });
  world.events.once(Phaser.Core.Events.POST_RENDER, () => {
    const reading = paceReadingRoom(
      world.loop, () => world.scene.isActive('world'),
      () => document.hidden, () => ctx.settings.reducedEffects || ctx.settings.reducedMotion,
    );
    document.addEventListener('visibilitychange', reading.update);
    world.events.once(Phaser.Core.Events.DESTROY, () => {
      document.removeEventListener('visibilitychange', reading.update);
      reading.dispose();
    });
  });
  world.events.once(Phaser.Core.Events.READY, () => {
    if (typeof ResizeObserver === 'undefined') return;
    const viewport = new ResizeObserver(
      ([
        {
          contentRect: { width, height },
        },
      ]) => {
        if (width > 0 && height > 0 && (width !== world.scale.width || height !== world.scale.height))
          world.scale.setParentSize(width, height);
      },
    );
    viewport.observe(parent);
    world.events.once(Phaser.Core.Events.DESTROY, () => viewport.disconnect());
  });
  return world;
}

/** The title, accessibility settings and class sign-in can open before the world renderer. */
export function prepareWorld(): Promise<void> {
  if (boot) return boot;
  const retry = !!game;
  game ??= createWorld(document.getElementById('game')!);
  const current = game;
  boot = new Promise<void>((resolve, reject) => {
    const ready = () => {
      current.events.off('boot-failed', failed);
      resolve();
    };
    const failed = () => {
      current.events.off('boot-complete', ready);
      reject(new Error('The map pictures could not be loaded.'));
    };
    current.events.once('boot-complete', ready);
    current.events.once('boot-failed', failed);
    if (retry) current.scene.getScene('boot').scene.restart();
  }).catch((error: unknown) => {
    boot = undefined;
    throw error;
  });
  return boot;
}
export function startWorld() {
  if (!game) return;
  if (game.scene.isActive('world')) game.scene.getScene('world').scene.restart({});
  else game.scene.start('world', {});
}
export function stopWorld() {
  if (game?.scene.isActive('world')) game.scene.stop('world');
  game?.sound.stopAll();
}
