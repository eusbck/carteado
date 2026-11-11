import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Guardian Project';

describe(N, () => {
  it('CR 603.4: com outra criatura de mesmo nome no campo ou no cemitério, não dispara; sendo a primeira, compra', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], library: [['Island'], []] });
    tg.cast('Elvish Mystic').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);

    const cem = setup({ battlefield: [[N, 'Forest'], []], hand: [['Elvish Mystic'], []], graveyard: [['Elvish Mystic'], []], library: [['Island'], []] });
    cem.cast('Elvish Mystic').resolveAll();
    expect(cem.names(0, 'hand')).toEqual([]);

    const campo = setup({ battlefield: [[N, 'Forest', 'Elvish Mystic'], []], hand: [['Elvish Mystic'], []], library: [['Island'], []] });
    campo.cast('Elvish Mystic').resolveAll();
    expect(campo.names(0, 'hand')).toEqual([]);
  });
});
