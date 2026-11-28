import { clear, h } from '../ui/dom';
import { request } from './request';

export function signIn<T>(role: 'student' | 'teacher', success: (identity: T) => Promise<void>) {
  const login = h('input', { required: true, autocomplete: 'username', maxlength: 200 });
  const password = h('input', {
    required: true,
    type: 'password',
    autocomplete: 'current-password',
    maxlength: 256,
  });
  const button = h('button', { type: 'submit' }, 'Sign in');
  const status = h('p', { role: 'status' });
  const form = h(
    'form',
    {},
    h('label', {}, role === 'teacher' ? 'Teacher email' : 'Guardian username', login),
    h('label', {}, 'Password', password),
    button,
    status,
  );
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = 'Signing in…';
    try {
      const service = await request<{ service: string; version: number }>('capabilities');
      if (service.service !== 'kg-classroom' || service.version !== 1)
        throw new Error('This host supports local play. Use your school’s class address to sign in.');
      const who = await request<T>(role + '/login', 'POST', { login: login.value, password: password.value });
      password.value = '';
      if (form.isConnected) await success(who);
    } catch (e) {
      status.textContent = e instanceof Error ? e.message : 'Could not contact your class.';
    } finally {
      button.disabled = false;
      if (status.textContent === 'Signing in…') status.textContent = '';
    }
  });
  return form;
}
export function choices<T extends string>(box: HTMLElement, text: string, options: [T, string][]) {
  clear(box);
  box.append(h('p', {}, text));
  return new Promise<T>((resolve) => {
    for (const [value, label] of options)
      box.append(h('button', { type: 'button', onclick: () => resolve(value) }, label));
    box.querySelector('button')?.focus();
  });
}
