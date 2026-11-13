import { describe, expect, it } from 'vitest';
import { nameOf } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Mist-Syndicate Naga';

describe(N, () => {
  it('a ficha é uma cópia sem os marcadores e também tem a habilidade', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { '+1/+1': 2 } }], []], library: [['Island', 'Island'], ['Island', 'Island']] });
    tg.attack([[N, 1]]).passTo('main2', 0);
    const nagas = tg.state.zones.battlefield.filter((id) => nameOf(tg.g, id) === N);
    expect(nagas.length).toBe(2);
    const ficha = nagas.find((id) => tg.state.objects[id].isToken)!;
    expect(tg.pt(ficha)).toEqual([3, 1]);
    // no próximo ataque, as duas criam cópias
    tg.passTo('main1', 1).passTo('main1', 0);
    tg.attack(nagas.map((id) => [id, 1] as [number, number])).passTo('main2', 0);
    expect(tg.state.zones.battlefield.filter((id) => nameOf(tg.g, id) === N).length).toBe(4);
  });
});
