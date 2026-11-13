import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Elvish Reclaimer';

describe(N, () => {
  it('+2/+2 com três ou mais cartas de terreno no cemitério', () => {
    const tg = setup({ battlefield: [[N], []], graveyard: [['Forest', 'Forest'], []] });
    expect(tg.pt(tg.bf(N))).toEqual([1, 2]);
    const tg2 = setup({ battlefield: [[N], []], graveyard: [['Forest', 'Forest', 'Mountain'], []] });
    expect(tg2.pt(tg2.bf(N))).toEqual([3, 4]);
  });
  it('{2}, {T}, sacrifique um terreno: busca um terreno qualquer para o campo virado', () => {
    const tg = setup({ battlefield: [[N, 'Forest', 'Forest', 'Swamp'], []], library: [['Island', 'Glacial Chasm'], []] });
    tg.choose('Sacrifique', ['Swamp']).choose('Procure uma carta de terreno', ['Island']).activate(N).resolve();
    expect(tg.find('Swamp')).toBeNull();
    expect(tg.state.objects[tg.bf('Island')].tapped).toBe(true);
  });
});
