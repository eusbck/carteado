import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Reconnaissance Partition';

describe(N, () => {
  it('entra com dois marcadores de carga', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains')], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge).toBe(2);
  });

  it('{T}, remover um marcador: compre uma carta', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 2 } }], []] });
    const id = tg.bf(N);
    const mao = tg.state.zones.hand[0].length;
    tg.choose('escolha', ['Compre uma carta.']).activate(N, 'Remova').resolveAll();
    expect(tg.state.objects[id].counters.charge).toBe(1);
    expect(tg.state.zones.hand[0].length).toBe(mao + 1);
  });

  it('o outro modo busca um terreno básico e o põe no campo virado', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 1 } }], []], library: [['Island', 'Plains', ...Array(20).fill('Forest')], []] });
    tg.choose('escolha', ['Procure no seu grimório uma carta de terreno básico, coloque-a no campo virada e depois embaralhe.']).choose('terreno básico', ['Plains']).activate(N, 'Remova').resolveAll();
    expect(tg.state.objects[tg.bf(N)].counters.charge ?? 0).toBe(0);
    expect(tg.state.objects[tg.bf('Plains')].tapped).toBe(true);
  });
});
