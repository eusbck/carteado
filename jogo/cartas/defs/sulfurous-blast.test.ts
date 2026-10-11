import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sulfurous Blast';
const montanhas = ['Mountain', 'Mountain', 'Mountain', 'Mountain'];

describe(N, () => {
  it('conjurada na sua fase principal, causa 3 de dano a cada criatura e a cada jogador', () => {
    // Fatespinner é 1/2; Indomitable Ancients é 2/10
    const tg = setup({ battlefield: [[...montanhas, 'Fatespinner'], ['Indomitable Ancients', 'Thief of Sanity']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(37);
    expect(tg.life(1)).toBe(37);
    expect(tg.find('Fatespinner')).toBeNull();
    expect(tg.find('Thief of Sanity')).toBeNull();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
  });

  it('fora da sua fase principal, causa 2 de dano', () => {
    const tg = setup({ active: 1, battlefield: [montanhas, ['Indomitable Ancients']], hand: [[N], []] });
    tg.pass();
    expect(tg.pending?.player).toBe(0);
    tg.cast(N).resolveAll();
    expect(tg.life(0)).toBe(38);
    expect(tg.life(1)).toBe(38);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(2);
  });
});