import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Starfleet Communicator';

describe(N, () => {
  it('conjurando, copia a mágica: ficam dois Communicators (um é ficha)', () => {
    const tg = setup({ battlefield: [['Sol Ring', 'Island'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    const comunicadores = tg.state.zones.battlefield.filter((id) => tg.state.objects[id].def === N);
    expect(comunicadores.length).toBe(2);
    expect(comunicadores.some((id) => tg.state.objects[id].isToken)).toBe(true);
  });
  it('a equipada, ao atacar, compra X (outras com Communicator) e põe até X terrenos da mão, virados', () => {
    const tg = setup({
      battlefield: [[{ name: 'Elvish Mystic' }, 'Indomitable Ancients', { name: N, attachTo: 'Elvish Mystic' }, { name: N, attachTo: 'Indomitable Ancients' }], []],
      library: [['Forest', 'Island'], []],
    });
    tg.choose('Starfleet Communicator: você pode pôr', ['Forest']);
    tg.attack([['Elvish Mystic', 1]]).passTo('declareBlockers');
    tg.resolveAll();
    expect(tg.state.objects[tg.bf('Forest')].tapped).toBe(true);
    expect(tg.state.zones.library[0].length).toBe(1);
  });
});
