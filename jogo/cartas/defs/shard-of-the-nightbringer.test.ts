import { describe, expect, it } from 'vitest';
import { enterCard, fixture as setup } from '../../testes/artefatos.ts';

const N = 'Shard of the Nightbringer';

describe(N, () => {
  it('conjurada: o oponente alvo perde metade da vida, arredondada para cima, e você ganha o mesmo', () => {
    const tg = setup({ battlefield: [Array(8).fill('Swamp'), []], hand: [[N], []] });
    tg.state.players[1].life = 21;
    const eu = tg.life(0);
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('oponente alvo') ? { kind: 'select', ids: [d.items[0].id] } : null));
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([8, 8]);
    expect(tg.life(1)).toBe(10);
    expect(tg.life(0)).toBe(eu + 11);
  });

  it('posta no campo sem ser conjurada, não dispara', () => {
    const tg = setup({ battlefield: [[], []] });
    const ele = tg.life(1);
    enterCard(tg, N, 0);
    tg.resolveAll();
    expect(tg.life(1)).toBe(ele);
  });
});