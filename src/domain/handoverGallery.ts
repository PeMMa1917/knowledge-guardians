/** Authored practice bundles for the next keeper. Each handover sets out the next bundle. */
export const HANDOVER_FLAG = 'handover.last';
export const HANDOVER_CASES = ['origin', 'condition', 'precision'] as const;
export const HANDOVER_PLACES = ['public', 'keeper'] as const;
export type HandoverCase = typeof HANDOVER_CASES[number];
export type HandoverPlace = typeof HANDOVER_PLACES[number];

interface HandoverPiece {
  action: string;
  tool?: { id: string; action: string };
  art: string;
  title: string;
  text: string;
}

interface HandoverBundle {
  name: string;
  arrival: string;
  pieces: readonly [HandoverPiece, HandoverPiece];
  public: string;
  keeper: string;
}

export const HANDOVER_BUNDLES: Record<HandoverCase, HandoverBundle> = {
  origin: {
    name: 'The travelling stand',
    arrival: 'Two runner slips both say the reading stand was on the move before the lamp. A third slip came from the east shelf. Lia needs a handover for someone who asks when it came in.',
    pieces: [
      { action: 'Line up the two runner slips', tool: { id: 'record-edge-folio', action: 'Open the folio at the two runner slips' },
        art: 'preserved.display-paired', title: 'The copied departure',
        text: 'Both slips copy the same West Window entry. The clerk saw the stand leave before the lamp. The copies carry separate runners’ names and the same source.' },
      { action: 'Open the east shelf receipt', art: 'preserved.catalogue', title: 'The shelf check',
        text: 'Lia signed the stand onto the east shelf at the next bell. The lamp had already been lit when she made that check.' },
    ],
    public: 'The stand left the West Window before the lamp. Lia found it on the east shelf at the next bell. The two runners’ slips point to one departure entry. A separate receipt gives the shelf check.',
    keeper: 'For the next keeper, keep the two copies behind the West Window entry. Place Lia’s own shelf receipt on the following line. Ask if anyone checked the shelf between the two reported times.',
  },
  condition: {
    name: 'The drying rack',
    arrival: 'The rack still carries a two-bell drying tag. The room crew moved the rack behind a shutter for today’s work. A reader has come for a fresh rubbing.',
    pieces: [
      { action: 'Set the old drying tag on its stand', art: 'preserved.slip', title: 'The open-window trial',
        text: 'The former keeper saw a rubbing dry at the second bell in the open window. The tray and paper were the same as today’s.' },
      { action: 'Lift the protective sheet at the shutter', tool: { id: 'folding-light-screen', action: 'Move the folding screen to check the damp edge' },
        art: 'coast.clear-frame', title: 'The shuttered rack',
        text: 'At the second bell the fresh rubbing still leaves a damp corner on its test slip. This rack is behind the shutter.' },
    ],
    public: 'At two bells today the shuttered rack still left a damp corner. Leave a place for the next check. The old two-bell result came from the open window.',
    keeper: 'For the next keeper, pin the old open-window tag beside the new damp test slip. Keep the rubbing on this rack and date the next check before setting a collection time.',
  },
  precision: {
    name: 'The mount with a broad line',
    arrival: 'A replacement mount needs seven thumb marks of clear width. The old dispatch slip says seven. Turn the mount and see where that number came from.',
    pieces: [
      { action: 'Set the mount against the width strip', art: 'forest.field-diagram', title: 'Where the edge can fall',
        text: 'The broad edge falls somewhere from 6.8 to 7.2 thumb marks on this strip. The mount needs a clear width of at least 7.' },
      { action: 'Unfold the measuring note beside the mount', tool: { id: 'observer-notebook', action: 'Clip the measuring note into the field notebook' },
        art: 'preserved.folder', title: 'A rounded report', text: 'The keeper wrote the nearest whole mark on the slip. Seven describes the rounded report. The original sighting still spans both sides of the fit line.' },
    ],
    public: 'The mount’s clear width is still open. The strip spans 6.8 to 7.2 marks and the fit line is 7. Keep the widest holder available for this visit.',
    keeper: 'For the next keeper, keep the rounded slip with the full range. Try the finer strip at the same edge before issuing a close-fitting holder.',
  },
};

export function handoverKey(bundle: HandoverCase, place: HandoverPlace): string {
  return `${bundle}.${place}`;
}

export function lastHandover(value: unknown): { bundle: HandoverCase; place: HandoverPlace } | null {
  for (const bundle of HANDOVER_CASES) {
    for (const place of HANDOVER_PLACES) {
      if (value === handoverKey(bundle, place)) return { bundle, place };
    }
  }
  return null;
}

export function nextHandover(value: unknown): HandoverCase {
  const previous = lastHandover(value);
  return previous ? HANDOVER_CASES[(HANDOVER_CASES.indexOf(previous.bundle) + 1) % HANDOVER_CASES.length] : HANDOVER_CASES[0];
}
