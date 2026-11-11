import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Horizon of Progress';
const opcoes = (tg: ReturnType<typeof setup>) => manaOptions(tg.g, 0).filter((o) => o.obj === tg.bf(N)).map((o) => o.alt.join('')).sort();

describe(N, () => {
  it('produz o que os seus terrenos produziriam; não olha custo nem se o terreno está virado', () => {
    const tg = setup({ battlefield: [[N, { name: 'Forest', tapped: true }, 'Ipnu Rivulet'], ['Swamp']] });
    expect(opcoes(tg)).toEqual(['C', 'G', 'U']);
  });
  it('{3}, {T}: põe uma carta de terreno da mão no campo virada', () => {
    const tg = setup({ battlefield: [[N, 'Island', 'Island', 'Island'], []], hand: [['Forest'], []] });
    tg.choose('pôr uma carta de terreno', ['Forest']).activate(N, 'pôr uma carta').resolve();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.state.turn.landsPlayed).toBe(0);
  });
  it('{1}, {T}, sacrifique: compre uma carta', () => {
    const tg = setup({ battlefield: [[N, 'Island'], []], library: [['Opt'], []] });
    tg.activate(N, 'Compre').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Opt']);
    expect(tg.names(0, 'graveyard')).toEqual([N]);
  });
});
