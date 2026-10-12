import { describe, expect, it } from 'vitest';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Sceptre of Eternal Glory';

describe(N, () => {
  it('{T}: uma mana de qualquer cor; com três terrenos de mesmo nome, {T}: três manas de uma cor', () => {
    const com = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Swamp'], []] });
    // cinco opções da primeira habilidade e cinco da segunda
    expect(manaOptions(com.g, 0).filter((o) => o.obj === com.bf(N))).toHaveLength(10);
    const sem = setup({ battlefield: [[N, 'Swamp', 'Swamp', 'Island'], []] });
    expect(manaOptions(sem.g, 0).filter((o) => o.obj === sem.bf(N))).toHaveLength(5);
  });
});