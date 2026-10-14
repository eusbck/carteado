import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { destroy } from '../../motor/api.ts';
import { hasKw } from '../../motor/chars.ts';

const NOME = 'Garruk, Cursed Huntsman';

describe(NOME, () => {
  it('0: duas fichas Wolf 2/2; quando uma morre, Garruk ganha um marcador de lealdade', () => {
    const tg = setup({ battlefield: [[NOME], []] });
    tg.activate(NOME, '0:').resolve();
    const lobos = tg.all('Wolf');
    expect(lobos.length).toBe(2);
    expect(tg.pt(lobos[0])).toEqual([2, 2]);
    expect(tg.state.objects[tg.bf(NOME)].counters.loyalty).toBe(5);
    tg.run(destroy(tg.g, [lobos[0]]));
    tg.resolveAll();
    expect(tg.state.objects[tg.bf(NOME)].counters.loyalty).toBe(6);
  });

  it('−3 destrói a criatura alvo e compra; indestrutível, compra mesmo assim', () => {
    const tg = setup({ battlefield: [[NOME], ['Zetalpa, Primal Dawn']], library: [['Island'], []] });
    tg.choose('criatura alvo', ['Zetalpa, Primal Dawn']).activate(NOME, '−3').resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.state.objects[tg.bf(NOME)].counters.loyalty).toBe(2);
  });

  it('−6: emblema; suas criaturas recebem +3/+3 e atropelar', () => {
    const tg = setup({ battlefield: [[{ name: NOME, counters: { loyalty: 6 } }, 'Wall of Omens'], []] });
    tg.activate(NOME, '−6').resolve();
    const w = tg.bf('Wall of Omens');
    expect(tg.pt(w)).toEqual([3, 7]);
    expect(hasKw(tg.g, w, 'trample')).toBe(true);
  });
});
