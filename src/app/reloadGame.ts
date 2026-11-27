/** A failed module fetch can stay cached across a normal reload in WebKit. */
export function reloadGame(): void {
  const url = new URL(location.href);
  url.searchParams.set('kg_reopen', Date.now().toString());
  location.replace(url);
}
