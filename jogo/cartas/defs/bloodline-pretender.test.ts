import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { enterCard, fixture as setup, runEffect } from '../../testes/artefatos.ts';
import { setup as montar } from '../../testes/harness.ts';

const N = 'Bloodline Pretender';

describe(N, () => {
  it('ganha um marcador +1/+1 quando outra criatura sua do tipo escolhido entra', () => {
    const tg = montar({ battlefield: [['Forest', 'Forest', 'Forest'], []], hand: [[N], []] });
    tg.choose('tipo de criatura', ['Cat']).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.pt(id)).toEqual([2, 2]);
    tg.run(createTokens(tg.g, 0, 'Cat', 1));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    // criatura de outro tipo e Cat do oponente não contam
    tg.run(createTokens(tg.g, 0, 'Rat', 1));
    tg.run(createTokens(tg.g, 1, 'Cat', 1));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
  });

  it('sem tipo escolhido, não dispara', () => {
    const tg = setup({ battlefield: [[], []] });
    const id = enterCard(tg, N, 0)!;
    delete tg.state.objects[id].choices.creatureType;
    runEffect(tg, createTokens(tg.g, 0, 'Cat', 1));
    tg.resolveAll();
    expect(tg.state.objects[id].counters['+1/+1'] ?? 0).toBe(0);
  });
});
