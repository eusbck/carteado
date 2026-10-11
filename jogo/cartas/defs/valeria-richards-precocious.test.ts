import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Valeria Richards, Precocious';
const lib = Array(8).fill('Forest');

describe(N, () => {
  it('as suas mágicas que não são de criatura custam {1} a menos; as de criatura não', () => {
    // Frantic Search ({2}{U}) sai com duas Islands
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Frantic Search'], []], library: [lib, lib] });
    expect(tg.pt(tg.bf(N))).toEqual([3, 3]);
    expect(tg.canCast('Frantic Search')).toBe(true);
    const sem = setup({ battlefield: [['Island', 'Island'], []], hand: [['Frantic Search'], []], library: [lib, lib] });
    expect(sem.canCast('Frantic Search')).toBe(false);
    // Silver Myr ({2}) é mágica de criatura: com uma Island só não dá, mesmo com Valeria
    const criatura = setup({ battlefield: [[N, 'Island'], []], hand: [['Silver Myr'], []], library: [lib, lib] });
    expect(criatura.canCast('Silver Myr')).toBe(false);
  });

  it('compra uma carta na primeira mágica que não é de criatura de cada turno, só nela', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island'], []], hand: [['Sol Ring', 'Sol Ring'], []], library: [lib, lib] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Sol Ring', 'Forest']);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Forest']);
  });
});
