import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Propaganda";
describe(N, () => {
  it("custos se somam e não se aplicam ao planeswalker", () => {

    const tg = setup({ battlefield: [['Elvish Mystic', 'Forest', 'Forest', 'Forest', 'Forest'], [N, N, 'Aminatou, the Fateshifter']] });
    tg.attack([['Elvish Mystic', 1]]).passTo('main2'); expect(tg.life(1)).toBe(39); expect(tg.all('Forest').filter(id => tg.state.objects[id].tapped)).toHaveLength(4);
    const pw = setup({ battlefield: [['Elvish Mystic'], [N, 'Aminatou, the Fateshifter']] }); pw.attack([['Elvish Mystic', { kind: 'obj', id: pw.bf('Aminatou, the Fateshifter') }]]).passTo('main2'); expect(pw.state.objects[pw.bf('Aminatou, the Fateshifter')].counters.loyalty).toBe(2);
  });
});
