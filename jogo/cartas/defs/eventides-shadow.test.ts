import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Eventide's Shadow", () => {
  it('remove de permanentes de qualquer jogador; compra e perde vida por marcador', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Swamp', { name: 'Wall of Omens', counters: { '-1/-1': 1 } }], [{ name: 'Indomitable Ancients', counters: { '+1/+1': 2 } }]],
      hand: [["Eventide's Shadow"], []], library: [['Island', 'Island', 'Island'], []],
    });
    tg.choose('marcadores a remover', ['Wall of Omens: marcador −1/−1 1', 'Indomitable Ancients: marcador +1/+1 1', 'Indomitable Ancients: marcador +1/+1 2']);
    tg.cast("Eventide's Shadow").resolve();
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([2, 10]);
    expect(tg.names(0, 'hand').length).toBe(3);
    expect(tg.life(0)).toBe(37);
  });
});
