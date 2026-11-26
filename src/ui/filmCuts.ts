import type { GameController } from '../app/controller';
import { CAMERA_BLOCKING, FILM_CUTS, FILM_READER, filmEdit, filmTake, type FilmCut, type FilmFrame, type FilmStation } from '../domain/filmCuts';
import { clear, h } from './dom';

function still(frame: FilmFrame): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 105;
  canvas.height = 50;
  canvas.className = 'film-still';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', frame.description);
  const g = canvas.getContext('2d')!;
  const x = (logical: number) => Math.round((logical - frame.left) * canvas.width / frame.width);
  const block = (colour: string, from: number, y: number, to: number, height: number) => {
    g.fillStyle = colour;
    g.fillRect(x(from), y, x(to) - x(from), height);
  };
  block('#352844', frame.left, 0, frame.left + frame.width, 50);
  block('#8f6552', frame.left, 36, frame.left + frame.width, 14);
  block('#e2b58d', CAMERA_BLOCKING.stripe, 39, CAMERA_BLOCKING.stripe + 1, 11);
  block('#6d556e', CAMERA_BLOCKING.doorway, 5, CAMERA_BLOCKING.doorway + 3, 31);
  block('#e0b582', CAMERA_BLOCKING.doorway + 1, 5, CAMERA_BLOCKING.doorway + 2, 30);
  block('#f2cd9f', CAMERA_BLOCKING.keeper - 1, 15, CAMERA_BLOCKING.keeper + 1, 5);
  block('#88b2ad', CAMERA_BLOCKING.keeper - 1, 20, CAMERA_BLOCKING.keeper + 1, 15);
  if (frame.handRaised) block('#f2cd9f', CAMERA_BLOCKING.keeper + 1, 14, CAMERA_BLOCKING.keeper + 3, 4);
  block('#623c41', frame.cart - 1, 25, frame.cart + 4, 13);
  block('#dd906e', frame.cart, 25, frame.cart + 3, 8);
  block('#2a243b', frame.cart, 36, frame.cart + 1, 6);
  block('#2a243b', frame.cart + 2, 36, frame.cart + 3, 6);
  return canvas;
}

function figure(frame: FilmFrame): HTMLElement {
  return h('figure', {}, still(frame), h('figcaption', {}, 'Beat ' + frame.time + '. ' + frame.title + '. ' + frame.description));
}

export function cameraPanel(controller: GameController, station: FilmStation): HTMLElement {
  const frames = filmTake(station);
  const panel = h('div', { class: 'film-camera' });
  const preview = h('div', { 'aria-live': 'polite' });
  const advance = h('button', { type: 'button', 'data-autofocus': true, onclick: () => {
    if (beat < frames.length - 1) {
      beat++;
      render();
      return;
    }
    const result = controller.dispatch({ type: 'CaptureFilmTake', station });
    if (!result.some(({ kind }) => kind === 'error')) {
      saved = true;
      render();
      rewind.focus();
    }
  } }) as HTMLButtonElement;
  const rewind = h('button', { type: 'button', onclick: () => {
    beat = 0;
    render();
    advance.focus();
  } }, 'Rewind to the first beat');
  panel.append(preview, h('div', { class: 'row' }, advance, rewind));
  let beat = 0;
  let saved = controller.state.flags['film.take.' + station] === true;

  function render(): void {
    clear(preview);
    preview.append(figure(frames[beat]));
    if (saved) preview.append(h('p', { class: 'fine' }, 'This camera’s take is filed at the editing stand.'));
    advance.textContent = beat < frames.length - 1 ? 'Advance to the next beat' : 'File these three frames';
    advance.disabled = beat === frames.length - 1 && saved;
  }

  render();
  return panel;
}

export function filmEditorPanel(controller: GameController): HTMLElement {
  const panel = h('div');
  const preview = h('div', { class: 'film-strip' });
  const readback = h('p', { role: 'status' });
  const swap = h('button', { type: 'button', 'data-autofocus': true, onclick: () => {
    cut = cut === 'cue' ? 'motion' : 'cue';
    render();
  } });
  const screen = h('button', { type: 'button', onclick: () => {
    const events = controller.dispatch({ type: 'ScreenFilmCut', cut });
    if (!events.some(({ kind }) => kind === 'error')) render();
  } }, 'Show this cut to the waiting reader');
  const post = h('button', { type: 'button', class: 'primary', onclick: () => {
    const events = controller.dispatch({ type: 'PostFilmCut', cut });
    if (!events.some(({ kind }) => kind === 'error')) {
      render();
      swap.focus();
    }
  } }, 'Post this cut with its beat marks') as HTMLButtonElement;
  panel.append(preview, h('div', { class: 'row' }, swap, screen, post), readback);
  let cut: FilmCut = 'cue';
  const saved = controller.state.flags['film.stage.cut'];
  if (saved === 'cue' || saved === 'motion') cut = saved;

  function render(): void {
    clear(preview);
    preview.append(...filmEdit(cut).map(figure));
    swap.textContent = cut === 'cue' ? 'Move the cart frame to the front' : 'Move the cue frame to the front';
    const posted = controller.state.flags['film.stage.cut'];
    post.disabled = !!posted || !FILM_CUTS.every((id) => controller.state.flags['film.screen.' + id] === true);
    const note = controller.state.flags['film.screen.' + cut] === true ? FILM_READER[cut]
      : 'Let a reader see where this sequence starts.';
    const location = posted === 'cue' ? 'The posted copy is on the low gallery rail.' : 'The posted copy is by the foyer’s route post.';
    readback.textContent = posted ? note + ' ' + location : note;
  }

  render();
  return panel;
}
