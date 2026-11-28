export class ServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export async function request<T>(path: string, method = 'GET', value?: unknown, onExit = false): Promise<T> {
  const payload = value === undefined ? undefined : JSON.stringify(value);
  const res = await fetch('/api/classroom/' + path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: value === undefined ? {} : { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: onExit && !!payload && new Blob([payload]).size <= 60_000,
  });
  if (!res.headers.get('Content-Type')?.includes('application/json'))
    throw new Error('Class sign-in requires a school server. Local play is available here.');
  const body = await res.json();
  if (!res.ok) throw new ServiceError(body.error || 'The class service is unavailable.', res.status);
  return body as T;
}
