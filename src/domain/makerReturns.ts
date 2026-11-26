export const MAKER_RETURNS = [
  { slug: 'jiahu', key: 'henan:7052472642044956672', x: 8, y: 24, prop: 'makers-return-jiahu',
    method: 'Tune a second practice tube to the reference sample', hint: 'Bring the Jiahu copy to the low sound rack in the Makers’ Room.' },
  { slug: 'disk', key: 'penn:b16665', x: 11, y: 24, prop: 'makers-return-disk',
    method: 'Set a name strip where the mount keeps one side hidden', hint: 'Bring the disk copy to the spare caption swivel near the stairs.' },
  { slug: 'laguna', key: 'nmp:laguna-copperplate', x: 23, y: 24, prop: 'makers-return-laguna',
    method: 'Reopen an account with a matched dated receipt', hint: 'Bring the copperplate copy to the two open accounts near the cabinet.' },
] as const;
export type MakerReturn = (typeof MAKER_RETURNS)[number];
