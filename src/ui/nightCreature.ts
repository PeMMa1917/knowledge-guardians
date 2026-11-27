import type { NightFriend } from '../domain/nightRegister';

// At field scale the silhouettes carry the species, with a separate local coat and light markings.
const bodies: Record<string, string[]> = {
  hare: [
    '..oo.oo......',
    '..oo.oo......',
    '..o+.o+......',
    '..ooooo......',
    '..ooo@o......',
    '...oooo.ooo..',
    '....ooooooo.o',
    '..ooooooooooo',
    '...oo...oo...',
  ],
  mouse: [
    '.............',
    '..oo...oo....',
    '..ooooooo....',
    '..o@ooooo....',
    '.ooooooo.....',
    '...oooooo...o',
    '....oooooo..o',
    '....oooooo.oo',
    '...oo..ooooo.',
  ],
  swift: [
    'o...........o',
    '.oo.......oo.',
    '..ooo...ooo..',
    '...ooouooo...',
    '....ooooo....',
    '.....o@o.....',
    '.....oo......',
    '....o..o.....',
  ],
  newt: [
    '....o..o.....',
    '.....oo......',
    '.oo..ooo....o',
    'ooo@ooooo..oo',
    '.ooooooo..oo.',
    '....ooooooo..',
    '....o...o....',
    '...o.....o...',
  ],
  owl: [
    '..o.....o....',
    '..ooooooo....',
    '..u@uuu@u....',
    '..ooouooo....',
    '..ooooooo....',
    '..ouououo....',
    '...ooooo.....',
    '...o...o.....',
  ],
  beetle: [
    '...o...o.....',
    '....ooo......',
    '..ooouooo....',
    '.o.oo+oo.o...',
    '..ooo+ooo....',
    '.o.oo+oo.o...',
    '..o.ooo.o....',
    '...o...o.....',
  ],
  moth: [
    '.oo.....oo...',
    '.o+o...o+o...',
    '..ooouooo....',
    '...ooooo.....',
    '..o+ouo+o....',
    '.ooo.u.ooo...',
    '.....u.......',
  ],
  gecko: [
    '..oo.o.......',
    '..ooo..o...o.',
    '.oo@oooo..oo.',
    '..ooooo..ooo.',
    '....ooooooo..',
    '...oo.o......',
    '...o...oo....',
  ],
  wren: [
    '.....ooo.....',
    '....oo@oo....',
    '..ooooooo....',
    'o.oo+ooo.....',
    '.oooooo......',
    '...ooo.......',
    '...o.o.......',
  ],
  snail: [
    '.o.o.........',
    '.o.o..oooo...',
    '.ooo.oo+ooo..',
    '.o@o.o+oo+o..',
    '..ooooo++oo..',
    '...ooooooo...',
    '..oooooooooo.',
  ],
  fox: [
    '..o...o.....o',
    '..ooooo....oo',
    '..o@ooo...o+o',
    '.ooo+ooooo+oo',
    '...ooooooo+o.',
    '....ooooooo..',
    '...oo....oo..',
  ],
  mole: [
    '.............',
    '....ooooo....',
    '..oooooooo...',
    '.uo@ooooooo..',
    '..ooooooooo..',
    '...uooooou...',
    '..uuu...uuu..',
  ],
  stoat: [
    '..oo.......o.',
    '..o@oo.....o.',
    '..ooooo...oo.',
    '...uooooooo..',
    '...uuooooo...',
    '...o...oo....',
  ],
  crab: [
    'oo.......oo..',
    'oooo...oooo..',
    '.o.ooooo.o...',
    '..oo@o@oo....',
    '.ooooooooo...',
    'o..ooooo..o..',
    '.o.o...o.o...',
  ],
  spider: [
    'o..o...o..o..',
    '.o.o...o.o...',
    '..ooooooo....',
    '..oo@@@oo....',
    '..ooooooo....',
    '.o.o...o.o...',
    'o..o...o..o..',
  ],
  ray: [
    '......o......',
    '....ooooo....',
    '..ooo@ooooo..',
    'ooouuuuuooooo',
    '..ooooooo....',
    '.....oo......',
    '......oo.....',
    '.......o.....',
  ],
};
const coats = [
  '#a78cdf',
  '#67a7b4',
  '#91b3db',
  '#7ab5ad',
  '#80ad70',
  '#d18c69',
  '#8ea1cf',
  '#65b9c4',
  '#cd8daa',
  '#c4a764',
  '#79aca0',
  '#90a8cb',
  '#bd93c8',
  '#8eafce',
  '#bd9d76',
];
export function creaturePortrait(friend: NightFriend) {
  const rows = bodies[friend.family.shape];
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 14;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', friend.name + ', a ' + friend.family.species);
  const g = canvas.getContext('2d');
  if (!g) return canvas;
  const centre = Math.floor((14 - rows.length) / 2);
  const colours: Record<string, string> = {
    o: coats[friend.site.index],
    u: '#f6e4a6',
    '+': '#f3beb4',
    '@': '#201c32',
  };
  for (const [y, row] of rows.entries())
    for (const [x, c] of [...row].entries())
      if (c !== '.') {
        g.fillStyle = '#272436';
        g.fillRect(x, y + centre - 1, 3, 3);
      }
  for (const [y, row] of rows.entries())
    for (const [x, c] of [...row].entries())
      if (c !== '.') {
        g.fillStyle = colours[c];
        g.fillRect(x + 1, y + centre, 1, 1);
      }
  return canvas;
}
