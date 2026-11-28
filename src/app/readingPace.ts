/** DOM writing, speech, input and sound keep their own clocks while the painted room is in the background. */
type WorldClock = { running: boolean; sleep(): void; wake(seamless: boolean): void; tick(): void };
const readingPanels = new Set(['reading-bench', 'journal', 'class-save', 'recap', 'dialogue', 'two-replies', 'menu', 'settings', 'bag', 'map-panel', 'exhibit', 'sign']);
let panel = '';
let changed: (() => void) | undefined;

export function paceForPanel(classes = '') {
  panel = classes.split(' ')[0];
  changed?.();
}

/** Installed once per game. A manual tick lets the camera finish a fade, capture a photo or restart a scene. */
export function paceReadingRoom(clock: WorldClock, ready: () => boolean, hidden: () => boolean, quiet: () => boolean) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let ownsClock = false;
  let disposed = false;
  function restore() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
    if (ownsClock && !clock.running) clock.wake(true);
    ownsClock = false;
  }
  function update() {
    if (disposed) return;
    if (!readingPanels.has(panel) || !ready() || hidden()) {
      restore();
      return;
    }
    if (timer !== undefined || (!ownsClock && !clock.running)) return;
    if (!ownsClock) {
      clock.sleep();
      ownsClock = true;
    }
    timer = setTimeout(() => {
      timer = undefined;
      if (!readingPanels.has(panel) || !ready() || hidden()) {
        restore();
        return;
      }
      clock.tick();
      update();
    }, quiet() ? 250 : 100);
  }
  changed = () => {
    // Let any Phaser frame that opened or replaced a panel finish before stopping its RAF.
    if (ownsClock) update();
    else queueMicrotask(update);
  };
  const notify = changed;
  update();
  return {
    update,
    dispose() {
      disposed = true;
      if (changed === notify) changed = undefined;
      restore();
    },
  };
}
