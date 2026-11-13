import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Draco';

describe(N, () => {
  it('conta tipos básicos de terreno, não terrenos', () => {
    // 4 Islands, 1 Swamp, 1 Forest: três tipos -> custa {10}; com 10 terrenos dá
    const terrenos = ['Island', 'Island', 'Island', 'Island', 'Swamp', 'Forest', 'Island', 'Island', 'Island', 'Island'];
    const tg = setup({ battlefield: [terrenos, []], hand: [[N], []] });
    expect(tg.canCast(N)).toBe(true);
    const tg2 = setup({ battlefield: [terrenos.slice(0, 9), []], hand: [[N], []] });
    expect(tg2.canCast(N)).toBe(false);
  });
  it('na manutenção, sacrifica a menos que pague {10} menos {2} por tipo', () => {
    const tg = setup({ step: 'untap', battlefield: [[N, 'Island', 'Swamp', 'Forest', 'Mountain', 'Plains'], []], library: [['Island'], []] });
    // cinco tipos: custo 0, nada a pagar
    tg.passTo('main1', 0);
    expect(tg.find(N)).not.toBeNull();
    const tg2 = setup({ step: 'untap', battlefield: [[N, 'Island', 'Swamp'], []], library: [['Island'], []] });
    // dois tipos: {6}, sem mana suficiente
    tg2.yes('Pagar {6}', false);
    tg2.passTo('main1', 0);
    expect(tg2.find(N)).toBeNull();
  });
});
