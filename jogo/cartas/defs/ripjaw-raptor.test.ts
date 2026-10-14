import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Ripjaw Raptor';

describe(N, () => {
  it('bloqueada por duas criaturas ao mesmo tempo, compra uma carta só', () => {
    const tg = fixture({ battlefield: [[N], ['Elvish Mystic', 'Elvish Mystic']] });
    const ursos = tg.all('Elvish Mystic');
    tg.attack([[N, 1]]).block([[ursos[0], N], [ursos[1], N]]).passTo('combatDamage');
    tg.resolveAll();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });

  it('com dano letal, dispara e compra mesmo assim', () => {
    const tg = fixture({ battlefield: [[N], ['Gigantosaurus']] });
    tg.attack([[N, 1]]).block([['Gigantosaurus', N]]).passTo('combatDamage');
    tg.resolveAll();
    expect(tg.find(N)).toBeNull();
    expect(tg.state.zones.hand[0]).toHaveLength(1);
  });
});
