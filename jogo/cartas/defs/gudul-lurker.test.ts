import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Gudul Lurker';

describe(N, () => {
  it('virar pela megamorfose é ação especial: vira e ganha o marcador sem usar a pilha', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []] });
    tg.cast(N, 'morph').resolveAll();
    const id = tg.state.zones.battlefield.find((x) => tg.state.objects[x].faceDown)!;
    expect(tg.pt(id)).toEqual([2, 2]);
    const acao = tg.actionIds().find((a) => a === `morph:${id}`);
    expect(acao).toBeDefined();
    tg.answer({ kind: 'priority', action: acao! });
    tg.settle();
    expect(tg.state.zones.stack.length).toBe(0);
    expect(tg.state.objects[id].faceDown).toBe(false);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(1);
    expect(tg.pt(id)).toEqual([2, 2]);
  });
});
