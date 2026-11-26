/** A folded display card. A passing reader can see the outside strip from the rail. */
export const SCRIPT_LAYOUTS = ['cue', 'catalogue'] as const;
export type ScriptLayout = typeof SCRIPT_LAYOUTS[number];
export type ScriptView = 'rail' | 'open';

export function scriptRailView(outer: ScriptLayout, view: ScriptView): readonly ScriptLayout[] {
  if (view === 'rail') return [outer];
  return [outer, outer === 'cue' ? 'catalogue' : 'cue'];
}
