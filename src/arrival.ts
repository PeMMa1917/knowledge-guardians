import { reloadGame } from './app/reloadGame';

// The HTML supplies an immediate, readable title even on a slow first download.
void import('./main').catch(() => {
  const status = document.getElementById('arrival-status');
  const retry = document.getElementById('arrival-retry');
  if (status) status.textContent = 'The game menu could not finish loading. Check your connection and reload.';
  if (retry) {
    retry.hidden = false;
    retry.addEventListener('click', reloadGame, {once:true});
  }
});
