// Exact counts use inclusion–exclusion on disjoint required families. No giant product is materialised.
const designKinds = ['story', 'game'];
export const designScopes = [
  'any',
  'joint',
  'story',
  'game',
  'story-only',
  'game-only',
  'neither',
];
export const sequenceKinds = [
  'combination',
  'permutation',
  'repeated-sequence',
];

function model(entries, { design = 'joint', question = 'context', pool } = {}) {
  if (
    !designScopes.includes(design) ||
    !['context', 'selected'].includes(question)
  )
    throw Error('Unknown design or question policy.');
  const validKinds = new Set(entries.map((e) => e.kind));
  const required = [['concept'], ['framework'], ['area', 'theme']];
  if (question === 'selected') required.push(['question']);
  if (design === 'joint' || design === 'story' || design === 'story-only')
    required.push(['story']);
  if (design === 'joint' || design === 'game' || design === 'game-only')
    required.push(['game']);
  const omitted = new Set(
    design === 'story-only'
      ? ['game']
      : design === 'game-only'
        ? ['story']
        : design === 'neither'
          ? designKinds
          : [],
  );
  const wanted = pool ? new Set([...pool, ...required.flat()]) : undefined;
  if (pool?.some((k) => !validKinds.has(k)))
    throw Error('Unknown family in the pool.');
  const members = entries.filter(
    (e) => !omitted.has(e.kind) && (!wanted || wanted.has(e.kind)),
  );
  const groups = required.map(
    (g) => members.filter((e) => g.includes(e.kind)).length,
  );
  return { members, groups, required };
}
export function requirements(entries, ids, options = {}) {
  const selection = new Set(ids),
    { members, required } = model(entries, options);
  const allowed = new Map(members.map((e) => [e.id, e]));
  const unknown = [...selection].filter((id) => !allowed.has(id));
  const kinds = new Set([...selection].map((id) => allowed.get(id)?.kind));
  const missing = required
    .filter((g) => !g.some((k) => kinds.has(k)))
    .map((g) => g.join('-or-'));
  return {
    valid: unknown.length === 0 && missing.length === 0,
    missing,
    unknown,
  };
}
export function choose(n, k) {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(k) || k < 0 || k > n)
    return 0n;
  let value = 1n;
  for (let i = 1; i <= Math.min(k, n - k); i++)
    value = (value * BigInt(n - i + 1)) / BigInt(i);
  return value;
}
function nonnegative(value) {
  if (value === undefined || value === null) return undefined;
  if (!Number.isSafeInteger(value) || value < 0)
    throw Error('Length must be a non-negative safe integer.');
  return value;
}
export function factorial(n) {
  const length = nonnegative(n);
  if (length === undefined) throw Error('Missing size.');
  let f = 1n;
  for (let i = 2; i <= n; i++) f *= BigInt(i);
  return f;
}
function inclusion(n, groups, count) {
  let value = 0n;
  for (let mask = 0; mask < 2 ** groups.length; mask++) {
    let remaining = n,
      sign = 1n;
    for (let bit = 0; bit < groups.length; bit++)
      if (mask & (1 << bit)) {
        remaining -= groups[bit];
        sign = -sign;
      }
    value += sign * count(remaining);
  }
  return value;
}
export function spaceCount(
  entries,
  { order = 'combination', length, ...options } = {},
) {
  if (!sequenceKinds.includes(order)) throw Error('Unknown counting mode.');
  length = nonnegative(length);
  const { members, groups } = model(entries, options),
    n = members.length;
  if (groups.includes(0)) return 0n;
  if (order === 'repeated-sequence') {
    if (length === undefined)
      throw Error('Choose a finite length for sequences that may repeat.');
    return inclusion(n, groups, (t) => BigInt(t) ** BigInt(length));
  }
  if (length !== undefined) {
    if (length > n) return 0n;
    const sets = inclusion(n, groups, (t) => choose(t, length));
    return order === 'permutation' ? sets * factorial(length) : sets;
  }
  if (order === 'combination')
    return inclusion(n, groups, (t) => 1n << BigInt(t));
  const orders = [1n];
  for (let i = 1; i <= n; i++) orders.push(1n + BigInt(i) * orders[i - 1]);
  return inclusion(n, groups, (t) => orders[t]);
}
/** A zero-based index into valid sets of exactly length k in catalogue order. */
export function unrankCombination(entries, length, rank, options = {}) {
  length = nonnegative(length);
  if (length === undefined) throw Error('Choose a set size.');
  rank = BigInt(rank);
  const { members, required, groups } = model(entries, options);
  const total = spaceCount(entries, { ...options, length });
  if (rank < 0n || rank >= total)
    throw Error('Rank is outside the selected combination space.');
  const left = groups.slice(),
    met = groups.map(() => false),
    out = [];
  for (let i = 0; i < members.length && out.length < length; i++) {
    const group = required.findIndex((g) => g.includes(members[i].kind));
    if (group >= 0) left[group]--;
    const pending = left.filter((_, j) => !met[j] && j !== group);
    const need = length - out.length - 1;
    const withThis = inclusion(members.length - i - 1, pending, (t) =>
      choose(t, need),
    );
    if (rank < withThis) {
      out.push(members[i].id);
      if (group >= 0) met[group] = true;
    } else rank -= withThis;
  }
  return out;
}
/** Choose additions to an already anchored board in catalogue order, without listing earlier sets. */
export function additionalMembers(pool, size, rank) {
  const total = choose(pool.length, size);
  rank = BigInt(rank);
  if (rank < 0n || rank >= total)
    throw Error('Choose a number inside this combination range.');
  const selection = [];
  let need = size;
  let including = choose(pool.length - 1, need - 1);
  for (let i = 0; need && i < pool.length; i++) {
    const left = pool.length - i - 1;
    if (rank < including) {
      selection.push(pool[i]);
      if (--need === 0) break;
      including = (including * BigInt(need)) / BigInt(left);
    } else {
      rank -= including;
      including = (including * BigInt(left - need + 1)) / BigInt(left);
    }
  }
  return selection;
}
/** One ordered beat can contain many simultaneous facts. Two ordered beats require two distinct actions. */
export function matchesOrder(asked, observed, { contiguous = false } = {}) {
  if (!asked.length || asked.some((group) => !group.length)) return false;
  const fits = (a, b) => a.every((id) => b.includes(id));
  if (contiguous)
    return observed.some(
      (_, i) =>
        i + asked.length <= observed.length &&
        asked.every((a, j) => fits(a, observed[i + j])),
    );
  let i = 0;
  for (const beat of observed)
    if (fits(asked[i], beat) && ++i === asked.length) return true;
  return false;
}
