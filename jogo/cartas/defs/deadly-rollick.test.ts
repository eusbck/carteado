import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Deadly Rollick';

describe(N, () => {
  it('controlando um comandante, exila a criatura alvo sem pagar o custo de mana', () => {
    const tg = setup({ battlefield: [[{ name: 'Elvish Mystic', commander: true, tapped: true }], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura alvo', ['Indomitable Ancients']).cast(N, 'gratis').resolveAll();
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
  });

  it('sem comandante, precisa pagar {3}{B}', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], ['Indomitable Ancients']], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(false);
    const pago = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp'], ['Indomitable Ancients']], hand: [[N], []] });
    pago.choose('criatura alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(pago.names(1, 'exile')).toEqual(['Indomitable Ancients']);
  });
});
