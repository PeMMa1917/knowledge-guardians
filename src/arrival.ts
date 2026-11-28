import { titleActions, type TitleAction } from './ui/titleActions';
import { KEY_SLOTS, KEY_PERMANENT } from './domain/saveKeys';
import { reloadGame } from './app/reloadGame';
import {
  applySettingsToDocument,
  loadSettings,
  saveSettings,
} from './app/settings';
import { readingControls } from './ui/readingControls';

const settings = loadSettings();
applySettingsToDocument(settings);

const reading = document.querySelector<HTMLDetailsElement>('#arrival-reading')!;
const controls = document.getElementById('arrival-controls')!;
const status = document.getElementById('arrival-status')!;
const retry = document.getElementById('arrival-retry')!;
controls.append(...readingControls(settings, () => saveSettings(settings)));
reading.hidden = false;

function failedDownload() {
  status.textContent =
    'The game menu could not finish loading. Check your connection and reload.';
  retry.hidden = false;
  retry.addEventListener('click', reloadGame, { once: true });
}

let opening = false;
function openApplication(action?: TitleAction) {
  if (opening) return;
  opening = true;
  status.textContent = 'Opening the game menu…';
  void import('./main')
    .then(({ enterGame }) => {
      const enter = () => {
        if (reading.open) return;
        reading.removeEventListener('toggle', enter);
        try {
          enterGame(settings, action);
        } catch {
          failedDownload();
        }
      };
      if (reading.open) {
        status.textContent =
          'The game is ready. Close Reading settings to open the menu.';
        reading.addEventListener('toggle', enter);
      } else enter();
    })
    .catch(failedDownload);
}

// A first-time visitor can act on the title without fetching the simulation.
// Existing and unreadable saves go through the normal validated slot picker.
function needsSlotPicker() {
  try {
    return (
      localStorage.getItem(KEY_SLOTS) !== null ||
      localStorage.getItem(KEY_PERMANENT) !== null
    );
  } catch {
    return true;
  }
}
if (needsSlotPicker()) openApplication();
else {
  status.textContent = 'From Three Firsts to the Door Without a Name';
  const menu = document.createElement('div');
  menu.className = 'arrival-actions';
  menu.append(
    ...titleActions((action) => openApplication(action), false, false),
  );
  reading.before(menu);
  reading.addEventListener('toggle', () => {
    menu.hidden = reading.open;
  });
}
