import { describe, expect, it } from 'vitest';
import { attackCandidates } from '../../motor/combat.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Bolsa Família';

describe(N, () => {
  it('ao entrar cria um Eleitor; a criatura encantada recebe +1/+1', () => {
    const tg = setup({ battlefield: [['Plains', 'Plains'], ['Elvish Mystic']], hand: [[N], []] });
    tg.choose('criatura', ['Elvish Mystic']).cast(N).resolveAll();
    expect(tg.names(0, 'battlefield')).toContain('Eleitor');
    expect(tg.pt(tg.bf('Elvish Mystic'))).toEqual([2, 2]);
  });

  it('a criatura encantada não pode atacar quem controla a Aura', () => {
    const tg = setup({ players: 3, active: 1, battlefield: [[{ name: N, attachTo: 'Indomitable Ancients' }], ['Indomitable Ancients'], []] });
    const a = tg.bf('Indomitable Ancients');
    expect(attackCandidates(tg.g, 1).find((x) => x.obj === a)!.targets).toEqual([{ kind: 'player', id: 2 }]);
  });
});
