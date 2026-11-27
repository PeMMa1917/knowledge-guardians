import { describe, expect, it } from 'vitest';
import { KINDS, NOTICES, ORDERS, ORDER_REPLIES, PIECES, tryPiece } from '../src/domain/reassemblyLine';

const piece = (id: string) => PIECES.find((p) => p.id === id)!;

describe('The Reassembly Line (chapter 2, C-004)', () => {
  it('has one claim, one evidence and one limit for every notice, and one rumour', () => {
    for (const n of NOTICES) for (const k of KINDS) expect(PIECES.filter((p) => p.notice === n.id && p.kind === k), `${n.id} ${k}`).toHaveLength(1);
    expect(PIECES.filter((p) => p.notice === null)).toHaveLength(1);
  });
  it('accepts a piece from the same notice and gives a reason for any other', () => {
    expect(tryPiece(piece('c-well'), piece('e-well'))).toBeNull();
    expect(tryPiece(piece('c-well'), piece('l-flood'))).toMatch(/the north well.*the flood/);
    expect(tryPiece(piece('c-ferry'), piece('e-rumour'))).toMatch(/who believes it/);
  });
  it('gives both keepers a reply for every order, so none is the answer', () => {
    for (const o of ORDERS) {
      expect(ORDER_REPLIES[o.id].marek.length).toBeGreaterThan(40);
      expect(ORDER_REPLIES[o.id].nasir.length).toBeGreaterThan(40);
    }
  });
});
