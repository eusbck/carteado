import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Lurking Predators';

describe(N, () => {
  it('a criatura revelada entra antes de a mágica do oponente resolver', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island']], hand: [[], ['Sol Ring']], library: [['Indomitable Ancients', 'Forest'], ['Forest']] });
    tg.cast('Sol Ring');
    tg.resolve();
    expect(tg.names(0, 'battlefield').sort()).toEqual(['Indomitable Ancients', N]);
    expect(tg.names(1, 'battlefield')).toEqual(['Island']);
    tg.resolveAll();
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Island', 'Sol Ring']);
  });

  it('carta que não é de criatura pode ir para o fundo ou ficar no topo', () => {
    const tg = setup({ active: 1, battlefield: [[N], ['Island', 'Island']], hand: [[], ['Sol Ring', 'Sol Ring']], library: [['Forest', 'Plains', 'Island'], ['Forest']] });
    tg.yes('Lurking Predators', true);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Island', 'Forest']);
    tg.script.length = 0;
    tg.yes('Lurking Predators', false);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'library')).toEqual(['Plains', 'Island', 'Forest']);
  });

  it('as suas próprias mágicas não disparam', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], hand: [['Sol Ring'], []], library: [['Indomitable Ancients'], []] });
    tg.cast('Sol Ring').resolveAll();
    expect(tg.find('Indomitable Ancients')).toBeNull();
  });
});
