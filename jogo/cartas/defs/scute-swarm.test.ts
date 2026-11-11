import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Scute Swarm';

describe(N, () => {
  it('com menos de seis terrenos, cria um Insect 1/1; com seis, uma cópia que também se copia', () => {
    const tg = setup({ battlefield: [[N, 'Forest'], []], hand: [['Forest'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.pt(tg.bf('Insect'))).toEqual([1, 1]);

    const seis = setup({ battlefield: [[N, 'Forest', 'Forest', 'Forest', 'Forest', 'Forest'], []], hand: [['Forest'], []] });
    seis.play('Forest').resolveAll();
    const enxames = seis.state.zones.battlefield.filter((id) => seis.state.objects[id].def === N || seis.state.objects[id].copyOf?.def === N);
    expect(enxames.length).toBe(2);
    expect(seis.find('Insect')).toBeNull();
  });
});
