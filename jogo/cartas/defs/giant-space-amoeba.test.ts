import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Giant Space Amoeba';

describe(N, () => {
  it('ao atacar, a criatura do defensor recebe -3/-0 e cria uma cópia da Amoeba', () => {
    const tg = setup({ battlefield: [[N], ['Elder Gargaroth']] });
    tg.attack([[N, 1]]).passTo('declareBlockers');
    tg.resolveAll();
    const [p] = tg.pt(tg.bf('Elder Gargaroth'));
    expect(p).toBe(3);
    const amebas = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === N || tg.state.objects[id].copyOf?.def === N);
    expect(amebas.length).toBe(2);
  });
});
