import { describe, expect, it } from 'vitest';
import { chars, hasKw } from '../../motor/chars.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Class-4 Tactical Cube';

describe(N, () => {
  it('ao entrar cria duas fichas Borg; abaixo de 7 marcadores não dá +1/+1', () => {
    const tg = setup({ battlefield: [[...Array(4).fill('Plains')], []], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.all('Borg')).toHaveLength(2);
    expect(tg.pt(tg.all('Borg')[0])).toEqual([1, 1]);
    expect(chars(tg.g, tg.bf(N)).types).not.toContain('Creature');
  });

  it('com 7 marcadores é uma criatura 4/4 com voar e as criaturas artefato recebem +1/+1 (ela também)', () => {
    const tg = setup({ battlefield: [[{ name: N, counters: { charge: 7 } }, { name: 'Borg', token: true }], []] });
    expect(tg.pt(tg.bf('Borg'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
