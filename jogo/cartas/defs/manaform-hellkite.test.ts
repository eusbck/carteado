import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Manaform Hellkite', () => {
  it('X é a mana gasta, não o valor de mana; a ficha é exilada na etapa final', () => {
    const tg = setup({ battlefield: [['Manaform Hellkite', 'Swamp', 'Swamp', 'Mountain'], ['Elvish Mystic']], hand: [['Fire Covenant'], []], library: [['Island'], ['Island']] });
    tg.number('valor de X', 1).choose('criaturas alvo do dano dividido', ['Elvish Mystic']);
    tg.cast('Fire Covenant').resolveAll();
    const d = tg.bf('Dragon Illusion');
    expect(tg.pt(d)).toEqual([3, 3]);
    tg.passTo('end').resolveAll();
    expect(tg.find('Dragon Illusion')).toBeNull();
  });
});
