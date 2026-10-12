import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Urza, Lord High Artificer';

describe(N, () => {
  it('ao entrar cria um Construct que recebe +1/+1 por artefato seu, contando a si mesmo', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Island'), 'Lotus Petal'], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([1, 4]);
    expect(tg.pt(tg.bf('Construct'))).toEqual([2, 2]);
    // virar um artefato desvirado gera {U}
    expect(manaOptions(tg.g, 0).some((o) => o.obj === tg.bf(N))).toBe(true);
  });

  it('{5}: embaralha, exila o topo e você pode jogar essa carta de graça neste turno', () => {
    const tg = setup({ battlefield: [[N, ...Array(5).fill('Island')], []], library: [Array(3).fill('Serra Angel'), ['Island']] });
    tg.activate(N, 'Embaralhe').resolveAll();
    expect(tg.names(0, 'exile')).toEqual(['Serra Angel']);
    expect(tg.canCast('Serra Angel')).toBe(true);
  });
});