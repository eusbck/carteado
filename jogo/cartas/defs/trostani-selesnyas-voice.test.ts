import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = "Trostani, Selesnya's Voice";

describe(N, () => {
  it('quando outra criatura sua entra, você ganha vida igual à resistência dela', () => {
    const tg = setup({ battlefield: [[N], []] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 5]);
    enterCard(tg, 'Indomitable Ancients', 0);
    tg.resolveAll();
    expect(tg.life(0)).toBe(50);
    // a criatura do oponente não conta
    enterCard(tg, 'Silver Myr', 1);
    tg.resolveAll();
    expect(tg.life(0)).toBe(50);
  });

  it('{1}{G}{W}, {T}: popula, copiando uma ficha de criatura sua; a ficha nova faz Trostani disparar', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Plains', { name: 'Horse', token: true }], []] });
    tg.activate(N).resolveAll();
    const cavalos = tg.all('Horse');
    expect(cavalos).toHaveLength(2);
    for (const id of cavalos) expect(tg.pt(id)).toEqual([5, 5]);
    expect(tg.life(0)).toBe(45);
  });

  it('sem ficha de criatura, popular não faz nada', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Plains', 'Silver Myr'], []] });
    tg.activate(N).resolveAll();
    expect(tg.all('Silver Myr')).toHaveLength(1);
  });
});