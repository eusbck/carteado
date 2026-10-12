import { describe, expect, it } from 'vitest';
import { dealDamage } from '../../motor/actions.ts';
import { hasKw } from '../../motor/chars.ts';
import { fixture as setup, removeCard } from '../../testes/artefatos.ts';

const N = 'Vigor';

describe(N, () => {
  it('atropelar; o dano a outra criatura sua é prevenido e vira marcadores +1/+1; o dano a Vigor, não', () => {
    const tg = setup({ battlefield: [[N, 'Silver Myr'], ['Serra Angel']] });
    const v = tg.bf(N);
    expect(tg.pt(v)).toEqual([6, 6]);
    expect(hasKw(tg.g, v, 'trample')).toBe(true);
    const anjo = tg.bf('Serra Angel');
    dealDamage(tg.g, [{ source: anjo, target: { kind: 'obj', id: tg.bf('Silver Myr') }, amount: 3, combat: false }, { source: anjo, target: { kind: 'obj', id: v }, amount: 2, combat: false }]);
    tg.refresh();
    expect(tg.pt(tg.bf('Silver Myr'))).toEqual([4, 4]);
    expect(tg.state.objects[tg.bf('Silver Myr')].damage).toBe(0);
    expect(tg.state.objects[v].damage).toBe(2);
  });

  it('indo para o cemitério, é embaralhado no grimório do dono', () => {
    const tg = setup({ battlefield: [[N], []], library: [['Island', 'Island'], []] });
    removeCard(tg, tg.bf(N));
    tg.resolveAll();
    expect(tg.names(0, 'graveyard')).toEqual([]);
    expect(tg.names(0, 'library')).toContain(N);
    expect(tg.names(0, 'library')).toHaveLength(3);
  });
});