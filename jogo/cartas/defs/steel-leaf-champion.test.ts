import { describe, expect, it } from 'vitest';
import { fixture } from '../../testes/artefatos.ts';

const N = 'Steel Leaf Champion';

describe(N, () => {
  it('não pode ser bloqueada por criaturas com força 2 ou menos; com força 3 ou mais, pode', () => {
    const tg = fixture({ battlefield: [[N], ['Indomitable Ancients', 'Elder Gargaroth']] });
    let podem: number[] = [];
    tg.script.push((d) => { if (d.kind === 'blockers') podem = d.candidates.map((x) => x.obj); return null; });
    tg.attack([[N, 1]]).passTo('combatDamage');
    expect(podem).toEqual([tg.bf('Elder Gargaroth')]);
  });
});
