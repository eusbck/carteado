import { describe, expect, it } from 'vitest';
import { alternativasDeMana, setup } from '../../testes/padroes.ts';

const N = 'Marble Diamond';

describe(N, () => {
  it('CR 605: {T} dá {W}', () => expect(alternativasDeMana(N)).toEqual(['W']));
  it('CR 614.1c: entra virado', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
