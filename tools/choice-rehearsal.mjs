/** Fictional state fixtures for replaying authored dialogue. The reachability report separately identifies room entrances. */
import assert from 'node:assert/strict';

function bound(c, positive) {
  const low = c.gte ?? -Infinity,
    high = c.lte ?? Infinity;
  return positive ? Math.max(low, Math.min(0, high)) : Number.isFinite(low) ? low - 1 : high + 1;
}
function condition(caseState, c, want, check) {
  if (!c || check(c, caseState) === want) return caseState;
  if (c.not) return condition(caseState, c.not, !want, check);
  if (c.all || c.any) {
    const parts = c.all ?? c.any;
    if (Boolean(c.all) === want) {
      let attempt = caseState;
      for (const part of parts) {
        attempt = condition(attempt, part, want, check);
        if (!attempt) return null;
      }
      return check(c, attempt) === want ? attempt : null;
    }
    for (const part of parts) {
      const attempt = condition(caseState, part, want, check);
      if (attempt && check(c, attempt) === want) return attempt;
    }
    return null;
  }
  const s = { ...caseState };
  if ('flag' in c || 'flagSet' in c || 'num' in c) {
    s.flags = { ...s.flags };
    if ('flag' in c) {
      if (want) s.flags[c.flag] = 'eq' in c ? c.eq : c.in[0];
      else delete s.flags[c.flag];
    } else if ('flagSet' in c) {
      if (want) s.flags[c.flagSet] = true;
      else delete s.flags[c.flagSet];
    } else s.flags[c.num] = bound(c, want);
  } else if ('item' in c) {
    s.inventory = { ...s.inventory, [c.item]: want ? (c.min ?? 1) : 0 };
  } else if ('marks' in c) {
    s.marks = want ? c.marks : Math.max(0, c.marks - 1);
  } else if ('card' in c) {
    s.cards = want ? [...s.cards, c.card] : s.cards.filter((x) => x !== c.card);
  } else if ('objective' in c) {
    s.objectivesDone = want
      ? [...s.objectivesDone, c.objective]
      : s.objectivesDone.filter((x) => x !== c.objective);
  } else if ('origin' in c) {
    s.player = { ...s.player, origin: want ? c.origin : null };
  } else if ('trust' in c) {
    s.relations = { ...s.relations, [c.trust]: bound(c, want) };
  }
  return check(c, s) === want ? s : null;
}
/** Return a witness only if both guards are simultaneously true in the resulting fixture. */
export function coexist(base, left, right, check) {
  const guards = [left, right].filter(Boolean);
  return (
    condition(base, { all: guards }, true, check) ??
    condition(base, { all: [...guards].reverse() }, true, check)
  );
}
function provisionPayments(s, effects) {
  const inventory = { ...s.inventory };
  let balance = s.marks,
    minimum = balance;
  const balanceOf = new Map(),
    deficits = new Map();
  for (const e of effects ?? []) {
    if ('addMarks' in e) {
      balance += e.addMarks;
      minimum = Math.min(minimum, balance);
    }
    if ('giveItem' in e || 'takeItem' in e) {
      const id = e.giveItem ?? e.takeItem;
      const n = (balanceOf.get(id) ?? inventory[id] ?? 0) + ('giveItem' in e ? 1 : -1) * (e.qty ?? 1);
      balanceOf.set(id, n);
      deficits.set(id, Math.min(deficits.get(id) ?? 0, n));
    }
  }
  for (const [id, negative] of deficits) if (negative < 0) inventory[id] = (inventory[id] ?? 0) - negative;
  return { ...s, inventory, marks: s.marks - Math.min(0, minimum) };
}
/** Every visible option uses the real EnterNode, ChooseDialogueOption, journal and permanent record. */
export function rehearseChoice({ engine, base, permanent, node, option, index, check, map }) {
  const here = { ...base, mapId: map ?? base.mapId };
  let fixture = condition(here, option.if, true, check);
  if (!fixture)
    return { result: 'fixture-unresolved', reason: 'No satisfying state from the declared option condition.' };
  fixture = provisionPayments(fixture, [...(node.effects ?? []), ...(option.effects ?? [])]);
  if (!check(option.if, fixture))
    return { result: 'fixture-unresolved', reason: 'Payment would change the guard.' };
  const at = '2026-11-27T12:00:00Z';
  const enter = engine.dispatch({ type: 'EnterNode', node: node.id }, fixture, permanent, at);
  const enterError = enter.events.find((e) => e.kind === 'error');
  if (enterError) return { result: 'entry-error', reason: enterError.message };
  if (!engine.visibleOptions(node.id, enter.state).some((o) => o.index === index))
    return { result: 'fixture-unresolved', reason: 'Entry itself changed the selected guard.' };
  const selected = engine.dispatch(
    { type: 'ChooseDialogueOption', node: node.id, index },
    enter.state,
    enter.permanent,
    at,
  );
  const err = selected.events.find((e) => e.kind === 'error');
  if (err) return { result: 'choice-error', reason: err.message };
  assert.equal(
    selected.nextNode ?? null,
    option.next ?? null,
    'Branch arrived at a different node: ' + node.id + ' #' + index,
  );
  const receipt = selected.state.adventureDiary.entries.find(
    (entry) => entry.event?.key === 'conversation:' + node.id,
  );
  // Some nodes deliberately lead to the next line without prose. Report this as a separate fact.
  if (node.text?.trim()) assert.ok(receipt, 'Missing diary record of entering ' + node.id);
  const picked = selected.state.adventureDiary.entries.find(
    (entry) => entry.event?.key === 'choice:' + node.id + ':' + index,
  );
  if (index !== 999)
    assert.ok(picked, 'Missing diary record of the selected option at ' + node.id + ' #' + index);
  const changes = (option.effects ?? []).flatMap((effect) => {
    if ('setFlag' in effect || 'addNum' in effect) {
      const key = effect.setFlag ?? effect.addNum;
      return [{ flag: key, before: enter.state.flags[key] ?? null, after: selected.state.flags[key] ?? null }];
    }
    if ('giveItem' in effect || 'takeItem' in effect) {
      const key = effect.giveItem ?? effect.takeItem;
      return [
        { item: key, before: enter.state.inventory[key] ?? 0, after: selected.state.inventory[key] ?? 0 },
      ];
    }
    if ('addCard' in effect)
      return [{ card: effect.addCard, held: selected.state.cards.includes(effect.addCard) }];
    return [];
  });
  const observed = { diary: !!receipt, choiceDiary: !!picked, changes };
  if (option.if) {
    const barred = condition(here, option.if, false, check);
    if (barred) {
      const hidden = engine.visibleOptions(node.id, barred).some((o) => o.index === index);
      assert.ok(!hidden, 'Guard exposed an unavailable option: ' + node.id + ' #' + index);
      const denied = engine.dispatch(
        { type: 'ChooseDialogueOption', node: node.id, index },
        barred,
        permanent,
        at,
      );
      assert.ok(
        denied.events.some((e) => e.kind === 'error'),
        'Unavailable option made a move: ' + node.id,
      );
      assert.deepEqual(denied.state.flags, barred.flags, 'A refused choice changed the campaign flags');
      assert.deepEqual(denied.permanent, permanent, 'A refused choice changed credit');
      return { result: 'passed', guard: 'tested-hidden', ...observed };
    }
    return { result: 'passed', guard: 'unsatisfied-fixture-unavailable', ...observed };
  }
  return { result: 'passed', guard: 'unconditional', ...observed };
}
