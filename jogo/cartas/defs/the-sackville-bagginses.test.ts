import { describe, expect, it } from 'vitest';
import { activateMana, fixture as setup } from '../../testes/artefatos.ts';

const N = 'The Sackville-Bagginses';

describe(N, () => {
  it('ao entrar, sacrificar uma ficha compra uma carta, cria um Treasure e faz o oponente alvo perder 1 de vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', { name: 'Food', token: true }], []], hand: [[N], []] });
    tg.choose('você pode sacrificar', ['Food']);
    tg.cast(N).resolveAll();
    expect(tg.all('Food')).toHaveLength(0);
    expect(tg.names(0, 'hand')).toHaveLength(1);
    expect(tg.all('Treasure')).toHaveLength(1);
    expect(tg.life(1)).toBe(39);
    // sacrificar o Treasure (ficha) dispara de novo
    activateMana(tg, 'Treasure', 'B');
    tg.resolveAll();
    expect(tg.life(1)).toBe(38);
  });

  it('sem sacrificar, nada acontece; sacrificar o que não é ficha não faz perder vida', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [[N], []] });
    tg.choose('você pode sacrificar', []);
    tg.cast(N).resolveAll();
    expect(tg.names(0, 'hand')).toHaveLength(0);
    const tg2 = setup({ battlefield: [['Swamp', 'Swamp', 'Elvish Mystic'], []], hand: [[N], []] });
    tg2.choose('você pode sacrificar', ['Elvish Mystic']);
    tg2.cast(N).resolveAll();
    expect(tg2.names(0, 'hand')).toHaveLength(1);
    expect(tg2.life(1)).toBe(40);
  });
});
