import { describe, expect, it } from 'vitest';
import { hasKw } from '../../motor/api.ts';
import { enterCard, fixture } from '../../testes/artefatos.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Shivan Devastator';

describe(N, () => {
  it('entra com X marcadores +1/+1, com voar e ímpeto', () => {
    const tg = setup({ battlefield: [['Mountain', 'Mountain', 'Mountain', 'Mountain', 'Mountain'], []], hand: [[N], []] });
    tg.number('valor de X', 4).cast(N).resolveAll();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(4);
    expect(tg.pt(id)).toEqual([4, 4]);
    expect(hasKw(tg.g, id, 'flying') && hasKw(tg.g, id, 'haste')).toBe(true);
  });

  it('CR 107.3m: posta no campo sem ser conjurada, X é 0 e ela morre como 0/0', () => {
    const tg = fixture();
    enterCard(tg, N, 0);
    tg.settle();
    expect(tg.find(N)).toBeNull();
    expect(tg.find(N, 'graveyard', 0)).not.toBeNull();
  });
});
