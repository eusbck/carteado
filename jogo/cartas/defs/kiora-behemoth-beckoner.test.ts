import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

const KIORA = 'Kiora, Behemoth Beckoner';

describe(KIORA, () => {
  it('compra quando entra uma criatura sua com força 4 ou mais, não com força menor', () => {
    const tg = setup({ battlefield: [[KIORA], []], hand: [['Zetalpa, Primal Dawn', 'Indomitable Ancients'], ['Zetalpa, Primal Dawn']], library: [['Island', 'Plains'], []] });
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Indomitable Ancients', 'hand', 0)!, controller: 0 }], 'effect'));
    expect(tg.state.zones.stack.length).toBe(0);
    // a do oponente não conta
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Zetalpa, Primal Dawn', 'hand', 1)!, controller: 1 }], 'effect'));
    expect(tg.state.zones.stack.length).toBe(0);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Zetalpa, Primal Dawn', 'hand', 0)!, controller: 0 }], 'effect'));
    tg.resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
  });
  it('−1: desvira o permanente alvo', () => {
    const tg = setup({ battlefield: [[KIORA, { name: 'Sol Ring', tapped: true }], []] });
    tg.choose('alvo', ['Sol Ring']).activate(KIORA, '−1').resolve();
    expect(tg.state.objects[tg.bf('Sol Ring')].tapped).toBe(false);
    expect(tg.state.objects[tg.bf(KIORA)].counters.loyalty).toBe(6);
  });
});
