import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens, putOntoBattlefield } from '../../motor/api.ts';

const NOME = 'Mutilate';

describe(NOME, () => {
  it('todas as criaturas recebem -1/-1 por Swamp que você controla (Swamps do oponente não contam)', () => {
    const tg = setup({
      battlefield: [['Swamp', 'Swamp', 'Swamp', "Witch's Cottage", 'Indomitable Ancients', 'Viscera Seer'], ['Swamp', 'Tree of Perdition', 'Blight Pile']],
      hand: [[NOME], []],
    });
    tg.cast(NOME).resolve();
    expect(tg.pt(tg.bf('Indomitable Ancients'))).toEqual([-2, 6]);
    expect(tg.pt(tg.bf('Tree of Perdition'))).toEqual([-4, 9]);
    expect(tg.find('Viscera Seer')).toBeNull();
    expect(tg.find('Blight Pile')).toBeNull();
  });

  it('o número de Swamps e as criaturas afetadas ficam fixos na resolução', () => {
    const tg = setup({ battlefield: [['Swamp', 'Swamp', 'Swamp', 'Swamp', 'Indomitable Ancients'], []], hand: [[NOME], []], library: [['Swamp'], []] });
    tg.cast(NOME).resolve();
    const a = tg.bf('Indomitable Ancients');
    expect(tg.pt(a)).toEqual([-2, 6]);
    // mais um Swamp depois não muda nada; criatura que entra depois não é afetada
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.state.zones.library[0][0], controller: 0 }], 'effect'));
    const [z] = tg.run(createTokens(tg.g, 0, 'Zombie 2/2', 1));
    expect(tg.pt(a)).toEqual([-2, 6]);
    expect(tg.pt(z)).toEqual([2, 2]);
  });
});
