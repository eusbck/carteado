import { describe, expect, it } from 'vitest';
import { isCreature } from '../../motor/api.ts';
import { manaOptions } from '../../motor/costs.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Cultivator's Caravan";
describe(N, () => {
  it("tripula com criaturas com enjoo, permite excesso e dura só até fim do turno", () => {

    const tg = setup({ battlefield: [[N, { name: 'Indomitable Ancients', ready: false }, { name: 'Elvish Mystic', ready: false }, { name: 'Silver Myr', ready: false }], []] }); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['Silver Myr']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll(); expect(isCreature(tg.g, tg.bf(N))).toBe(true);
    // ruling 2 (CR 301.7, 613.1): a força e a resistência impressas (5/5) valem enquanto é criatura
    expect(tg.pt(tg.bf(N))).toEqual([5, 5]);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true); tg.passTo('upkeep', 1); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
  });

  it("gera mana ao entrar, mas tripular não permite usar símbolo de virar com enjoo", () => {

    const tg = setup({ battlefield: [[{ name: N, ready: false }, 'Indomitable Ancients', 'Elvish Mystic'], []] }); expect(manaOptions(tg.g, 0).some(o => o.obj === tg.bf(N))).toBe(true);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll(); expect(manaOptions(tg.g, 0).some(o => o.obj === tg.bf(N))).toBe(false);
  });
});
