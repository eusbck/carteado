import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Access Denied';
const ilhas = Array(5).fill('Island');

describe(N, () => {
  it('anula a mágica e cria tantas Thopters quanto o valor de mana dela', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, Array(5).fill('Forest')], hand: [[N], ['Gigantosaurus']] });
    tg.cast('Gigantosaurus').pass();
    tg.choose('mágica alvo', ['Gigantosaurus']).cast(N).resolve();
    expect(tg.names(1, 'graveyard')).toEqual(['Gigantosaurus']);
    const th = tg.all('Thopter');
    expect(th).toHaveLength(5);
    expect(hasKw(tg.g, th[0], 'flying')).toBe(true);
  });

  it('a mágica que não pode ser anulada continua, mas as Thopters são criadas', () => {
    const tg = setup({ active: 1, battlefield: [ilhas, Array(6).fill('Forest')], hand: [[N], ['Carnage Tyrant']] });
    tg.cast('Carnage Tyrant').pass();
    tg.choose('mágica alvo', ['Carnage Tyrant']).cast(N).resolve();
    expect(tg.all('Thopter')).toHaveLength(6);
    tg.resolveAll();
    expect(tg.find('Carnage Tyrant')).not.toBeNull();
  });
});
