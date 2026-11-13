import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

const N = 'Last March of the Ents';

describe(N, () => {
  it('compra pela maior resistência e põe as criaturas escolhidas da mão no campo', () => {
    const tg = setup({
      battlefield: [['Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Forest', 'Wall of Omens'], []],
      hand: [[N, 'Woodland Bellower'], []],
      library: [['Llanowar Elves', 'Island', 'Island', 'Island', 'Island'], []],
    });
    tg.choose('coloque no campo', ['Woodland Bellower', 'Llanowar Elves']).yes('Woodland Bellower', false);
    tg.cast(N).resolve();
    tg.resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island', 'Island', 'Island']);
    expect(tg.find('Woodland Bellower')).not.toBeNull();
    expect(tg.find('Llanowar Elves')).not.toBeNull();
  });
});
