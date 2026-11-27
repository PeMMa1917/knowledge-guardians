import { reloadGame } from './app/reloadGame';
import { applySettingsToDocument, loadSettings, saveSettings } from './app/settings';
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
  status.textContent = 'The game menu could not finish loading. Check your connection and reload.';
  retry.hidden = false;
  retry.addEventListener('click', reloadGame, { once: true });
}

// A student may still be reading or changing a control when the download finishes.
// Keep the panel, focus and the live settings object until they close it themselves.
void import('./main').then(({ enterGame }) => {
  const enter = () => {
    if (reading.open) return;
    reading.removeEventListener('toggle', enter);
    try { enterGame(settings); } catch { failedDownload(); }
  };
  if (reading.open) {
    status.textContent = 'The game is ready. Close Reading settings to open the menu.';
    reading.addEventListener('toggle', enter);
  } else enter();
}).catch(failedDownload);
