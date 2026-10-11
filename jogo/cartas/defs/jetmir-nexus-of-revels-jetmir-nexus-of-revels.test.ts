import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/chars.ts';
import { enterCard, fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Jetmir, Nexus of Revels // Jetmir, Nexus of Revels';
const gatos = (n: number) => Array.from({ length: n }, () => ({ name: 'Cat verde 1/1', token: true }));

describe(N, () => {
  it('com menos de três criaturas, nada; com três, +1/+0 e vigilância', () => {
    const tg = setup({ battlefield: [[N, ...gatos(1)], [{ name: 'Cat verde 1/1', token: true }]] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([5, 4]);
    expect(hasKw(tg.g, id, 'vigilance')).toBe(false);
    const novo = enterCard(tg, 'Elvish Mystic', 0)!;
    expect(tg.pt(id)).toEqual([6, 4]);
    expect(tg.pt(novo)).toEqual([2, 1]);
    expect(hasKw(tg.g, novo, 'vigilance')).toBe(true);
    expect(hasKw(tg.g, novo, 'trample')).toBe(false);
    // a criatura do oponente não recebe nada
    expect(tg.pt(tg.bf('Cat verde 1/1', 1))).toEqual([1, 1]);
    // voltando a duas criaturas, o bônus some
    removeCard(tg, novo);
    expect(tg.pt(id)).toEqual([5, 4]);
  });

  it('com seis criaturas, +2/+0, vigilância e atropelar', () => {
    const tg = setup({ battlefield: [[N, ...gatos(5)], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([7, 4]);
    expect(hasKw(tg.g, id, 'vigilance') && hasKw(tg.g, id, 'trample')).toBe(true);
    expect(hasKw(tg.g, id, 'double strike')).toBe(false);
    expect(tg.pt(tg.all('Cat verde 1/1')[0])).toEqual([3, 1]);
  });

  it('com nove criaturas, +3/+0, vigilância, atropelar e golpe duplo', () => {
    const tg = setup({ battlefield: [[N, ...gatos(8)], []] });
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([8, 4]);
    expect(hasKw(tg.g, id, 'double strike')).toBe(true);
    const gato = tg.all('Cat verde 1/1')[0];
    expect(tg.pt(gato)).toEqual([4, 1]);
    expect(hasKw(tg.g, gato, 'vigilance') && hasKw(tg.g, gato, 'trample') && hasKw(tg.g, gato, 'double strike')).toBe(true);
  });
});
