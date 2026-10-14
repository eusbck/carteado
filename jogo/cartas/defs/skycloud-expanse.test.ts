import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Skycloud Expanse';

describe(N, () => {
  it('{1}, {T}: adiciona {W}{U} — com outra fonte, paga uma mágica de {W}{U}', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [["Hanna, Ship's Navigator"], []] });
    // Hanna custa {1}{W}{U}: Forest paga o {1} do Expanse, e o Expanse dá {W}{U}; falta o {1} da Hanna
    expect(tg.canCast("Hanna, Ship's Navigator")).toBe(false);
    const tg2 = setup({ battlefield: [[N, 'Forest', 'Forest'], []], hand: [["Hanna, Ship's Navigator"], []] });
    tg2.cast("Hanna, Ship's Navigator").resolve();
    expect(tg2.find("Hanna, Ship's Navigator")).not.toBeNull();
  });
  it('sozinho, não produz mana', () => {
    const tg = setup({ battlefield: [[N], []], hand: [['Sol Ring'], []] });
    expect(tg.canCast('Sol Ring')).toBe(false);
  });
});
