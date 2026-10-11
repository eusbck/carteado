import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Reiver Demon';

describe(N, () => {
  it('conjurada da mão, destrói todas as criaturas que não são artefatos nem pretas', () => {
    // Thief of Sanity é preta e azul; Silver Myr é artefato; Indomitable Ancients é branca
    const tg = setup({ battlefield: [[...Array(8).fill('Swamp'), 'Serra Angel'], ['Indomitable Ancients', 'Thief of Sanity', 'Silver Myr']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([6, 6]);
    expect(hasKw(tg.g, id, 'flying')).toBe(true);
    expect(tg.find('Indomitable Ancients')).toBeNull();
    expect(tg.find('Serra Angel')).toBeNull();
    expect(tg.find('Thief of Sanity')).not.toBeNull();
    expect(tg.find('Silver Myr')).not.toBeNull();
  });

  it('posta no campo sem ser conjurada da mão, não destrói nada', () => {
    const tg = setup({ battlefield: [[], ['Indomitable Ancients']] });
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.find('Indomitable Ancients')).not.toBeNull();
  });
});