import { h } from './dom';

export type TitleAction = 'new' | 'class' | 'settings' | 'credits';
export function titleActions(
  open: (action: TitleAction) => void,
  saved: boolean,
  signedIn: boolean,
): HTMLElement[] {
  const choice = (action: TitleAction, title: string, note?: string) =>
    h(
      'button',
      {
        type: 'button',
        'data-autofocus': action === 'new' && !saved,
        onclick: () => open(action),
      },
      h('strong', {}, title),
      note ? h('small', {}, note) : null,
    );
  return [
    choice(
      'new',
      'New game',
      saved
        ? 'Starts a new campaign. Your awards stay.'
        : 'Begin as a new recruit',
    ),
    choice('class', signedIn ? 'Manage class adventure' : 'Class sign-in'),
    choice('settings', 'Settings', 'Text size, motion, sound, guide prompts'),
    choice(
      'credits',
      'Credits and sources',
      'Who made the art, music and sounds, and the historical sources',
    ),
  ];
}
