/** Training packets for two fictional crews. A courier may carry another copy of one record. */
export const COUNTER_ORDERS = ['outbound', 'return'] as const;
export type CounterOrder = typeof COUNTER_ORDERS[number];
export type CounterCase = 'forest' | 'water';

interface Reading {
  id: string;
  slot: string;
  origin: string;
  value: number;
}
interface Packet {
  courier: string;
  reading: Reading;
}

const forestCreek = { id: 'creek-first', slot: 'Creek first beat', origin: 'Fern watcher’s first-light creek slip', value: 0 };
const forestRidge = { id: 'ridge-first', slot: 'Ridge first beat', origin: 'Ridge keeper’s first-light slip', value: 1 };
const waterOmi = { id: 'upper-clearance', slot: 'Omi at the upper rail', origin: 'Omi’s first rehearsal slip', value: 0 };
const waterLower = { id: 'lower-clearance', slot: 'Crew at the lower line', origin: 'Lower crew’s own rehearsal slip', value: 0 };

export const COUNTER_CASES: Record<CounterCase, {
  slots: readonly string[]; packets: readonly Packet[]; unit: string;
}> = {
  forest: {
    slots: [forestCreek.slot, forestRidge.slot, 'Creek after the next bell'],
    packets: [
      { courier: 'West runner', reading: forestCreek },
      { courier: 'Ridge keeper', reading: forestRidge },
      { courier: 'Bridge runner', reading: forestRidge },
    ],
    unit: 'crossings',
  },
  water: {
    slots: [waterOmi.slot, waterLower.slot, 'Practice pulse after the bell'],
    packets: [
      { courier: 'Weirkeeper Omi', reading: waterOmi },
      { courier: 'Lower crew runner', reading: waterLower },
      { courier: 'Council scribe Sena', reading: waterOmi },
    ],
    unit: 'buckets across the spill line',
  },
};

const packetOrder = { outbound: [0, 1, 2], return: [2, 0, 1] } as const;

/** Origin membership is determined by the slip carried, including when its copy arrives first. */
export function replayCounter(which: CounterCase, order: CounterOrder, received: number) {
  const { slots, packets } = COUNTER_CASES[which];
  const accepted = new Map<string, Reading>();
  const deliveries = packetOrder[order].slice(0, received).map((index) => {
    const packet = packets[index];
    const duplicate = accepted.has(packet.reading.id);
    if (!duplicate) accepted.set(packet.reading.id, packet.reading);
    return { courier: packet.courier, origin: packet.reading.origin, duplicate };
  });
  const counts = new Map([...accepted.values()].map(({ slot, value }) => [slot, value]));
  const marks = slots.map((slot) => ({ slot, value: counts.get(slot) ?? null }));
  return { deliveries, marks, unique: accepted.size };
}
