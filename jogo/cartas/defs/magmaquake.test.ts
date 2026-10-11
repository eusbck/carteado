import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const M = 'Magmaquake';
const E = "Elspeth, Sun's Champion";

describe(M, () => {
  it('causa X de dano a cada criatura sem voar e a cada planeswalker', () => {
    const tg = setup({
      battlefield: [[...Array(5).fill('Mountain'), 'Wall of Omens', 'Rapacious Dragon'], ['Indomitable Ancients', { name: E, counters: { loyalty: 5 } }, 'Birds of Paradise']],
      hand: [[M], []],
    });
    tg.number('valor de X', 3).cast(M).resolve();
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(tg.state.objects[tg.bf(E)].counters.loyalty).toBe(2);
    // criaturas com voar não são atingidas
    expect(tg.state.objects[tg.bf('Rapacious Dragon')].damage).toBe(0);
    expect(tg.state.objects[tg.bf('Birds of Paradise')].damage).toBe(0);
    // jogadores não são atingidos
    expect([tg.life(0), tg.life(1)]).toEqual([40, 40]);
  });
  it('não mira: causa dano a uma criatura com resistência a magia (hexproof)', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], ['Sylvan Caryatid']], hand: [[M], []] });
    tg.number('valor de X', 3).cast(M).resolve();
    expect(tg.find('Sylvan Caryatid')).toBeNull();
  });
  it('é instantânea: com X = 0, nada acontece', () => {
    const tg = setup({ active: 1, battlefield: [['Mountain', 'Mountain'], ['Elvish Mystic']], hand: [[M], []] });
    tg.pass();
    tg.number('valor de X', 0).cast(M).resolve();
    expect(tg.find('Elvish Mystic')).not.toBeNull();
  });
});
