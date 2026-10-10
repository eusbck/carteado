import { describe, expect, it } from 'vitest';
import { canBlock } from '../../motor/combat.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Whirler Rogue";
describe(N, () => {
  it('ganhar evasão depois de bloqueada não remove a criatura do bloqueio', () => {
    const tg = setup({ battlefield: [[N, 'Elvish Mystic', { name: 'Thopter', token: true }, { name: 'Thopter', token: true }], ['Wall of Omens']] });
    tg.attack([['Elvish Mystic', 1]]).block([['Wall of Omens', 'Elvish Mystic']]).passTo('declareBlockers');
    tg.choose('criatura alvo', ['Elvish Mystic']).choose('Vire', ['Thopter', 'Thopter']).activate(N).resolveAll();
    expect(tg.state.combat!.attackers[0].blocked).toBe(true);
    expect(tg.state.combat!.attackers[0].blockers).toEqual([tg.bf('Wall of Omens')]);
    tg.passTo('main2'); expect(tg.life(1)).toBe(40);
  });
  it("cria dois Thopters e pode virá-los recém-criados para impedir bloqueio", () => {

    const tg = setup({ battlefield: [['Island', 'Island', 'Island', 'Island', 'Elvish Mystic'], ['Wall of Omens']], hand: [[N], []] }); tg.cast(N).resolveAll(); expect(tg.all('Thopter')).toHaveLength(2);
    tg.choose('criatura alvo', ['Elvish Mystic']).choose('Vire', ['Thopter', 'Thopter']).activate(N).resolveAll(); expect(canBlock(tg.g, tg.bf('Wall of Omens'), tg.bf('Elvish Mystic'))).toBe(false);
    tg.attack([['Elvish Mystic', 1]]).passTo('main2'); expect(tg.life(1)).toBe(39);
  });
});
