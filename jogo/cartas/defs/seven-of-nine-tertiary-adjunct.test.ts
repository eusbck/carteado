import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Seven of Nine, Tertiary Adjunct';

describe(N, () => {
  it('compra e descarta; descartando uma carta que não é terreno, dois marcadores de carga num artefato alvo', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], hand: [['Wall of Omens'], []] });
    tg.choose('Descarte', ['Wall of Omens']).choose('artefato alvo', ['Sol Ring']).activate(N, 'Compre').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Wall of Omens']);
    expect(tg.state.objects[tg.bf('Sol Ring')].counters.charge).toBe(2);
  });

  it('descartando um terreno, nada mais acontece', () => {
    const tg = setup({ battlefield: [[N, 'Sol Ring'], []], hand: [['Island'], []] });
    tg.choose('Descarte', ['Island']).activate(N, 'Compre').resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf('Sol Ring')].counters.charge ?? 0).toBe(0);
  });
});
