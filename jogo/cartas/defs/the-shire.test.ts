import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'The Shire';

describe(N, () => {
  it('entra virado sem criatura lendária; desvirado com uma já no campo', () => {
    const tg = setup({ battlefield: [['Elvish Mystic'], []], hand: [[N], []] });
    tg.play(N);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    const lenda = setup({ battlefield: [['Samwise Gamgee'], []], hand: [[N], []] });
    lenda.play(N);
    expect(lenda.state.objects[lenda.bf(N)].tapped).toBe(false);
  });

  it('{1}{G}, {T}, vire uma criatura desvirada sua (mesmo com enjoo de invocação): crie uma Food', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', { name: 'Elvish Mystic', ready: false }], []] });
    tg.activate(N, 'Food').resolveAll();
    expect(tg.all('Food')).toHaveLength(1);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
  });
});
