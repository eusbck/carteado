import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { gainLife } from '../../motor/api.ts';

describe('Marauding Blight-Priest', () => {
  it('dispara uma vez por evento de ganho de vida; ganho "para cada" é um evento só', () => {
    const tg = setup({ battlefield: [['Marauding Blight-Priest'], []] });
    gainLife(tg.g, 0, 4, null);
    tg.refresh().resolve();
    expect(tg.life(1)).toBe(39);
    expect(tg.state.zones.stack.length).toBe(0);
  });
  it('duas criaturas com vínculo com a vida causando dano ao mesmo tempo disparam duas vezes', () => {
    const tg = setup({ battlefield: [['Marauding Blight-Priest', 'Killian, Ink Duelist', { name: 'Moogle', token: true }], []] });
    tg.attack([['Killian, Ink Duelist', 1], ['Moogle', 1]]).passTo('combatDamage');
    // 2 de Killian, 1 do Moogle e 1 de cada um dos dois gatilhos
    expect(tg.life(1)).toBe(40 - 2 - 1 - 2);
    expect(tg.life(0)).toBe(43);
  });
});
