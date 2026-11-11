import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = "Agna Qel'a";

describe(N, () => {
  it('entra virado sem terreno básico no campo; desvirado com um', () => {
    const tg = setup({ battlefield: [['Ipnu Rivulet'], []], hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const tg2 = setup({ battlefield: [['Island'], []], hand: [[N], []] });
    tg2.play(N);
    expect(tg2.state.objects[tg2.bf(N)].tapped).toBe(false);
  });
  it('{2}{U}, {T}: compre uma carta e depois descarte uma', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Forest'], []], library: [['Opt'], []] });
    tg.choose('Descarte', ['Forest']).activate(N, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    expect(tg.names(0, 'graveyard')).toEqual(['Forest']);
  });
});
