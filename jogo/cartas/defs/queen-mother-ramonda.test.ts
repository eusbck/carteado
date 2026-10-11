import { describe, expect, it } from 'vitest';
import { becomeMonarch } from '../../motor/actions.ts';
import { attackCandidates } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Queen Mother Ramonda';

describe(N, () => {
  it('entrando, você vira o monarca; enquanto for, criaturas de força 2 ou menor não podem atacar você', () => {
    // Indomitable Ancients tem força 2; Serra Angel, 4
    const tg = setup({ battlefield: [Array(5).fill('Plains'), ['Indomitable Ancients', 'Serra Angel']], hand: [[N], []] });
    tg.cast(N).resolveAll();
    expect(tg.pt(tg.bf(N))).toEqual([3, 5]);
    expect(tg.state.monarch).toBe(0);
    tg.passTo('main1', 1);
    const podem = attackCandidates(tg.g, 1).map((a) => tg.state.objects[a.obj].def);
    expect(podem).toEqual(['Serra Angel']);
    // perdendo a coroa, a restrição acaba
    becomeMonarch(tg.g, 1);
    tg.refresh();
    expect(attackCandidates(tg.g, 1)).toHaveLength(2);
  });
});