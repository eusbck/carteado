import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Tamiyo's Safekeeping";

describe(N, () => {
  it('em resposta a uma remoção, a permanente ganha resistência a magia e indestrutível, e você ganha 2 de vida', () => {
    const tg = setup({ active: 1, battlefield: [['Ripjaw Raptor', 'Forest'], ['Swamp', 'Swamp']], hand: [[N], ['Infernal Grasp']] });
    tg.choose('criatura alvo', ['Ripjaw Raptor']).cast('Infernal Grasp').pass();
    tg.choose('permanente alvo que você controla', ['Ripjaw Raptor']).cast(N);
    tg.resolveAll();
    // a remoção perdeu o alvo (resistência a magia): o Raptor fica
    expect(tg.find('Ripjaw Raptor')).not.toBeNull();
    expect(tg.life(0)).toBe(42);
  });
});
