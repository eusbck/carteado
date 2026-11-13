import { describe, expect, it } from 'vitest';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = 'Silver-Fur Master';

describe(N, () => {
  it('as outras criaturas Ninja e Rogue que você controla recebem +1/+1', () => {
    const tg = setup({ battlefield: [[N, 'Universal Automaton', 'Memnite'], ['Changeling Outcast']] });
    expect(tg.pt(tg.bf(N))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Universal Automaton'))).toEqual([2, 2]);
    expect(tg.pt(tg.bf('Memnite'))).toEqual([1, 1]);
    expect(tg.pt(tg.bf('Changeling Outcast'))).toEqual([1, 1]);
  });
  it('o ninjutsu custa {1} a menos: Ninja of the Deep Hours entra pagando só {U}', () => {
    const tg = setup({ battlefield: [[N, 'Memnite', 'Island'], []], hand: [['Ninja of the Deep Hours'], []] });
    tg.attack([['Memnite', 1]]).passTo('declareBlockers');
    tg.activate('Ninja of the Deep Hours', 'Ninjutsu').resolveAll();
    expect(tg.find('Ninja of the Deep Hours', 'battlefield')).not.toBeNull();
  });
});
