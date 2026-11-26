export const WARM_TOOL = 'warm-room';
export const WARM_FIXTURES = ['bench', 'carrier'] as const;
export type WarmFixture = (typeof WARM_FIXTURES)[number];
export type WarmVesselModel = { capacity: number; loss: number; grip: number };

export const WARM_INTERVALS = 3;

const fixtures: Record<WarmFixture, { loss: number; gripBuffer: number }> = {
  bench: { loss: 2, gripBuffer: 0 },
  carrier: { loss: 0, gripBuffer: 6 },
};

export function warmReading(model: WarmVesselModel, fixture: WarmFixture, intervals: number, crossing = false) {
  const support = fixtures[fixture];
  const ambient = crossing ? 4 : 10;
  const resistance = (12 - model.loss - support.loss - Number(crossing)) / 12;
  const remaining = (72 / model.capacity) * resistance ** intervals;
  return {
    body: Math.round(ambient + remaining),
    contact: Math.round(remaining * model.grip / (8 + support.gripBuffer)),
  };
}

export const warmTrace = (stem: string, fixture: WarmFixture) => `${stem}.checked.${fixture}`;
export const warmHandoff = (stem: string) => `${stem}.posted`;
export const warmFerry = (stem: string) => `${stem}.ferry`;

export const WARM_LATEST = 'warm.latest';
export const warmReceipt = (stem: string) => `${stem}.received`;

export function warmNotice(model: WarmVesselModel, fixture: WarmFixture) {
  const times = WARM_INTERVALS + (fixture === 'carrier' ? 1 : 0);
  const { body, contact } = warmReading(model, fixture, times);
  const words = fixture === 'bench'
    ? 'Bea set the vessel at the hall counter for the first readers.'
    : 'Bea sent the padded carrier to the side table after an extra interval.';
  return `${words} Body ${body} warmth marks. Probe contact ${contact} marks.`;
}
