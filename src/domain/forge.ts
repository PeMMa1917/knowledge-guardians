/**
 * Hesper's forge (spec 29.1 item 5, PLAY-001 "forge it, do not sort it").
 *
 * The player makes a small test billet by one of two routes and then cuts a
 * cross-section. The pattern comes from what the player did, not from an
 * answer key. At the assay table the player compares the section with the
 * blade's etched section. SCHEMATIC ONLY: this is not a working recipe.
 *
 * Factual base (HIS-S14, HIS-S15): pattern welding joins and works different
 * iron or steel pieces, so the layers follow the folds and twists. Crucible
 * steel is melted in a closed pot; its watered pattern does not come from
 * welded layers.
 */
import type { ForgeState } from './types';

export type ForgeAction = 'stack' | 'weld' | 'twist' | 'fold' | 'crucible' | 'melt' | 'cool' | 'cut' | 'reset';

export function newForge(): ForgeState {
  return { route: 'none', steels: 0, welded: false, twists: 0, folds: 0, melted: false, cooled: false, cut: false };
}

/** Apply one forge action. Throws with a plain reason if the step is not possible now. */
export function forgeStep(f0: ForgeState, a: ForgeAction): { forge: ForgeState; line: string } {
  const f: ForgeState = { ...f0 };
  if (a === 'reset') return { forge: newForge(), line: 'Hesper clears the anvil. "Again. Nothing wasted but time."' };
  if (f.cut) throw new Error('This billet is already cut. Start a new one.');
  switch (a) {
    case 'stack':
      if (f.route === 'crucible') throw new Error('The crucible is in use. Start a new billet to stack steels.');
      if (f.welded) throw new Error('The stack is already welded.');
      if (f.steels >= 7) throw new Error('The stack is as tall as the tongs can hold.');
      f.route = 'pattern'; f.steels += 1;
      return { forge: f, line: f.steels % 2 ? 'You add a strip of soft, pale iron.' : 'You add a strip of hard, dark high-carbon steel.' };
    case 'weld':
      if (f.route !== 'pattern' || f.steels < 2) throw new Error('Stack at least two strips first.');
      if (f.welded) throw new Error('The stack is already welded.');
      f.welded = true;
      return { forge: f, line: `You heat the stack and hammer it. ${f.steels} strips become one bar with ${f.steels} layers.` };
    case 'twist':
      if (!f.welded) throw new Error('Weld the stack first.');
      if (f.twists >= 3) throw new Error('One more twist would tear the bar.');
      f.twists += 1;
      return { forge: f, line: 'You twist the hot bar. The layers spiral inside it.' };
    case 'fold':
      if (!f.welded) throw new Error('Weld the stack first.');
      if (f.folds >= 4) throw new Error('The layers are already very thin. Hesper stops you.');
      f.folds += 1;
      return { forge: f, line: `You fold and weld the bar again. Now it has ${layers(f)} layers.` };
    case 'crucible':
      if (f.route === 'pattern') throw new Error('The anvil holds a stack. Start a new billet to use the crucible.');
      if (f.route === 'crucible') throw new Error('The crucible is already loaded.');
      f.route = 'crucible';
      return { forge: f, line: 'You load iron and charcoal into Hesper\'s small clay crucible and seal the lid.' };
    case 'melt':
      if (f.route !== 'crucible') throw new Error('Load and seal the crucible first.');
      if (f.melted) throw new Error('It has already melted.');
      f.melted = true;
      return { forge: f, line: 'You heat the sealed pot for a long time. Inside, the metal melts.' };
    case 'cool':
      if (!f.melted) throw new Error('Melt it first.');
      if (f.cooled) throw new Error('It has already cooled.');
      f.cooled = true;
      return { forge: f, line: 'The pot cools slowly. You break it open: a small, round cake of steel.' };
    case 'cut':
      if (!(f.route === 'pattern' && f.welded) && !(f.route === 'crucible' && f.cooled)) throw new Error('Finish a billet before you cut it.');
      f.cut = true;
      return { forge: f, line: `You cut the billet, polish the face and etch it. ${describeSection(f)}` };
  }
}

export function layers(f: ForgeState): number {
  return f.route === 'pattern' ? f.steels * 2 ** f.folds : 0;
}

/** What the etched cross-section shows. Read as text by screen readers (LENS-003). */
export function describeSection(f: ForgeState): string {
  if (f.route === 'crucible') return 'The face shows soft, wavy bands with no straight joins. Nothing in it follows a fold, because nothing was folded.';
  if (f.route === 'pattern') {
    const n = layers(f);
    const tw = f.twists ? ` The twist makes the lines curl into ${f.twists > 1 ? 'tight rosettes' : 'a ladder of loops'}.` : '';
    return `The face shows ${n} light and dark lines. They bend where you folded the bar.${tw} Thin weld lines mark each join.`;
  }
  return 'There is nothing on the anvil yet.';
}

/** Compare a cut billet with the blade at the assay table. */
export function compareWithBlade(f: ForgeState): { match: boolean; card: string; line: string } {
  if (!f.cut) throw new Error('Cut a billet first, then bring the section to the assay table.');
  if (f.route === 'pattern') {
    return { match: true, card: 'card.forge-pattern', line: 'Side by side, the blade and your billet show the same thing: light and dark layers that follow the folds, with thin weld lines. That is evidence for welded layers. The cross-section cannot date the blade or name its workshop.' };
  }
  return { match: false, card: 'card.forge-crucible', line: 'Side by side, they differ. The blade shows welded layers that follow folds. Your crucible cake shows soft bands with no welds. A watery pattern alone cannot tell you which route made a blade.' };
}
