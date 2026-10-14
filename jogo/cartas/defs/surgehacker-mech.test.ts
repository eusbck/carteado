import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Surgehacker Mech';

describe(N, () => {
  it('ao entrar, causa o dobro do número de Veículos seus (ele incluído) à criatura do oponente', () => {
    const tg = setup({ battlefield: [["Cultivator's Caravan", ...Array(4).fill('Plains')], ['Indomitable Ancients']], hand: [[N], []] });
    tg.choose('criatura ou planeswalker alvo', ['Indomitable Ancients']).cast(N).resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(4);
    expect(hasKw(tg.g, tg.bf(N), 'menace')).toBe(true);
  });
});
