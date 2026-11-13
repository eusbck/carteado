import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Chord of Calling';

describe(N, () => {
  it('acha só criatura com valor de mana X ou menos e a põe no campo', () => {
    // X = 1 pago com 4 Forests; Zetalpa (8) não pode ser escolhida
    const tg = setup({ battlefield: [['Forest', 'Forest', 'Forest', 'Forest'], []], hand: [[N], []], library: [['Zetalpa, Primal Dawn', 'Elvish Mystic'], []] });
    let ofereceuZetalpa = true;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !/procure/i.test(d.prompt)) return null;
      ofereceuZetalpa = d.items.some((i) => i.label.includes('Zetalpa') && !i.disabled);
      const m = d.items.find((i) => i.label === 'Elvish Mystic')!;
      return { kind: 'select', ids: [m.id] };
    });
    tg.number('valor de X', 1).cast(N).resolve();
    expect(ofereceuZetalpa).toBe(false);
    expect(tg.bf('Elvish Mystic')).toBeTruthy();
    expect(tg.names(0, 'library')).toEqual(['Zetalpa, Primal Dawn']);
  });

  it('CR 702.51: X escolhido primeiro, criaturas viradas pagam parte do custo total', () => {
    // {2}{G}{G}{G} com X = 2: 3 Forests + 2 criaturas verdes convocando
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Llanowar Elves', 'Elvish Mystic'], []],
      hand: [[N], []], library: [['Wall of Omens'], []],
    });
    tg.choose('Convocar', ['Llanowar Elves', 'Elvish Mystic']).choose('procure', ['Wall of Omens']).number('valor de X', 2).cast(N).resolve();
    expect(tg.state.objects[tg.bf('Llanowar Elves')].tapped).toBe(true);
    expect(tg.state.objects[tg.bf('Elvish Mystic')].tapped).toBe(true);
    expect(tg.bf('Wall of Omens')).toBeTruthy();
  });
});
