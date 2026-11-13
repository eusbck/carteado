import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Ingenious Prodigy';

describe(N, () => {
  it('entra com X marcadores; na manutenção, troca um marcador por uma carta', () => {
    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island'], []], hand: [[N], []], library: [['Forest', 'Swamp', 'Plains'], ['Island', 'Island']] });
    tg.number('X', 3);
    tg.cast(N).resolve();
    const id = tg.bf(N);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(3);
    expect(tg.pt(id)).toEqual([3, 4]);
    tg.yes('Ingenious Prodigy', true);
    tg.passTo('main1', 1).passTo('main1', 0);
    expect(tg.state.objects[id].counters['+1/+1']).toBe(2);
    // a do gatilho e a da etapa de compra
    expect(tg.names(0, 'hand').length).toBe(2);
  });
  it('sem marcadores, o gatilho não dispara', () => {
    const tg = setup({ step: 'untap', battlefield: [[N], []], library: [['Forest'], []] });
    let perguntou = false;
    tg.script.push((d) => { if (d.prompt?.includes('Ingenious Prodigy')) perguntou = true; return null; });
    tg.passTo('main1', 0);
    expect(perguntou).toBe(false);
  });
});
