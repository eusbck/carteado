import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Skysovereign, Consul Flagship";
describe(N, () => {
  it("tripula com criaturas com enjoo, permite excesso e dura só até fim do turno", () => {

    const tg = setup({ battlefield: [[N, { name: 'Indomitable Ancients', ready: false }, { name: 'Elvish Mystic', ready: false }, { name: 'Silver Myr', ready: false }], []] }); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['Silver Myr']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll(); expect(isCreature(tg.g, tg.bf(N))).toBe(true);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true); tg.passTo('upkeep', 1); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
  });

  it("entrada causa três de dano a criatura de oponente; alvo que sai torna o gatilho ineficaz", () => {

    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Island'], ['Indomitable Ancients']], hand: [[N], []] }); tg.choose('criatura ou planeswalker', ['Indomitable Ancients']).cast(N).resolveAll(); expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(isCreature(tg.g, tg.bf(N))).toBe(false); expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
