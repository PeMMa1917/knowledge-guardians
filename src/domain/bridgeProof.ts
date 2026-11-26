export const BRIDGE_PROOF_TOOL = 'bridge-proof';
export const BRIDGE_PROOF_CHECKED = 'bridge.proof.checked';
export const BRIDGE_PROOF_POSTED = 'bridge.proof.posted';
export const BRIDGE_PROOF_WAYPOINT = 'bridge.proof.waypoint';
export const BRIDGE_PROOF_RECEIPT = 'bridge.proof.receipt';
export const BRIDGE_PARITY_CHECKED = 'bridge.proof.banks';
export const BRIDGE_TRIAL_MOVES = 3;

export const BRIDGE_RULES = ['banks', 'plank'] as const;
export type BridgeRule = (typeof BRIDGE_RULES)[number];

export const BRIDGE_STOPS = {
  start: { name: 'Start', bank: 'Oak' },
  round: { name: 'Round peg', bank: 'Stone' },
  square: { name: 'Square peg', bank: 'Stone' },
  turn: { name: 'Turn board', bank: 'Oak' },
  lower: { name: 'Lower bridge', bank: 'Stone' },
  rack: { name: 'Receiving rack', bank: 'Oak' },
} as const;
export type BridgeStop = keyof typeof BRIDGE_STOPS;
export type BridgeBank = (typeof BRIDGE_STOPS)[BridgeStop]['bank'];

const ordinaryLinks = [
  ['start', 'round'], ['start', 'square'], ['round', 'turn'], ['square', 'turn'],
  ['turn', 'lower'], ['lower', 'rack'],
] as const satisfies readonly (readonly [BridgeStop, BridgeStop])[];

const sameBankPlank = ['turn', 'rack'] as const;
export const BRIDGE_BRANCHES = ['round', 'square'] as const;
export type BridgeBranch = (typeof BRIDGE_BRANCHES)[number];

export function bridgeLinks(rule: BridgeRule): readonly (readonly [BridgeStop, BridgeStop])[] {
  return rule === 'plank' ? [...ordinaryLinks, sameBankPlank] : ordinaryLinks;
}

export function traceBridgeBranch(rule: BridgeRule, first: BridgeBranch, moves = BRIDGE_TRIAL_MOVES): BridgeStop[][] {
  const links = bridgeLinks(rule);
  function expand(path: BridgeStop[]): BridgeStop[][] {
    if (path.length === moves + 1) return [path];
    const current = path[path.length - 1];
    const choices = links.flatMap(([a, b]) => a === current ? [b] : b === current ? [a] : []);
    return choices.filter((stop) => !path.includes(stop)).flatMap((stop) => expand([...path, stop]));
  }
  return expand(['start', first]);
}

export function alternateBank(start: BridgeBank, moves: number): BridgeBank {
  if (moves % 2 === 0) return start;
  return start === 'Oak' ? 'Stone' : 'Oak';
}

export const bridgeTraceFlag = (rule: BridgeRule, branch: BridgeBranch) => `bridge.proof.${rule}.${branch}`;
