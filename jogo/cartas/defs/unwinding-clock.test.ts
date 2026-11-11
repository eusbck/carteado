import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Unwinding Clock', () => {
  it('desvira os seus artefatos na etapa de desvirar do outro jogador', () => {
    const tg = setup({ battlefield: [['Unwinding Clock', { name: 'Sol Ring', tapped: true }, { name: 'Island', tapped: true }], []], library: [['Opt'], ['Opt']] });
    tg.passTo('upkeep', 1);
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
});
