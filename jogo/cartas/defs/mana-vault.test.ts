import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Mana Vault';

describe(N, () => {
  it('{T}: {C}{C}{C}; não desvira na sua etapa de desvirar e, virado, causa 1 de dano na sua etapa de compra', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, tapped: true }], []], library: [['Opt', 'Opt'], ['Forest', 'Forest']] });
    tg.yes('desvirar Mana Vault', false);
    tg.passTo('main1', 0);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    expect(tg.life(0)).toBe(39);
  });
  it('na manutenção, pagar {4} desvira; desvirado, não causa dano', () => {
    const tg = setup({ active: 1, battlefield: [[{ name: N, tapped: true }, 'Island', 'Island', 'Island', 'Island'], []], library: [['Opt', 'Opt'], ['Forest', 'Forest']] });
    tg.yes('desvirar Mana Vault', true);
    tg.passTo('main1', 0);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(false);
    expect(tg.life(0)).toBe(40);
  });
  it('desvirado, produz três manas incolores', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Thran Dynamo'], []] });
    tg.cast('Thran Dynamo').resolve();
    expect(tg.find('Thran Dynamo')).not.toBeNull();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
