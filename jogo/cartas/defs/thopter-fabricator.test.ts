import { describe, expect, it } from 'vitest';
import { draw, isCreature } from '../../motor/api.ts';
import { runEffect, fixture as setup } from '../../testes/artefatos.ts';

const N = "Thopter Fabricator";
describe(N, () => {
  it("tripula com criaturas com enjoo, permite excesso e dura só até fim do turno", () => {

    const tg = setup({ battlefield: [[N, { name: 'Indomitable Ancients', ready: false }, { name: 'Elvish Mystic', ready: false }, { name: 'Silver Myr', ready: false }], []] }); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['Silver Myr']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll(); expect(isCreature(tg.g, tg.bf(N))).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true); tg.passTo('upkeep', 1); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
  });

  it("a segunda compra de cada turno cria só um Thopter, mesmo sem tripular", () => {

    const tg = setup({ battlefield: [[N], []] }); runEffect(tg, draw(tg.g, 0, 3)); tg.settle(); tg.resolveAll(); expect(tg.all('Thopter')).toHaveLength(1); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    tg.passTo('upkeep', 1); runEffect(tg, draw(tg.g, 0, 2)); tg.settle(); tg.resolveAll(); expect(tg.all('Thopter')).toHaveLength(2);
  });
});
