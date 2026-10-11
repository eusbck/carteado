import { describe, expect, it } from 'vitest';
import { hasKw, isCreature } from '../../motor/api.ts';
import { fixture as setup } from '../../testes/artefatos.ts';

const N = "Skysovereign, Consul Flagship";
describe(N, () => {
  it("tripula com criaturas com enjoo, permite excesso e dura só até fim do turno", () => {

    const tg = setup({ battlefield: [[N, { name: 'Indomitable Ancients', ready: false }, { name: 'Elvish Mystic', ready: false }, { name: 'Silver Myr', ready: false }], []] }); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['Silver Myr']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll(); expect(isCreature(tg.g, tg.bf(N))).toBe(true);
    // ruling 1 (CR 301.7, 613.1): a força e a resistência impressas (6/5) valem enquanto é criatura
    expect(tg.pt(tg.bf(N))).toEqual([6, 5]);
    expect(tg.state.objects[tg.bf('Silver Myr')].tapped).toBe(true); tg.passTo('upkeep', 1); expect(isCreature(tg.g, tg.bf(N))).toBe(false);
  });

  it('tripulado, ataca e o gatilho de ataque causa três de dano à criatura de oponente alvo', () => {
    const tg = setup({ battlefield: [[N, 'Indomitable Ancients', 'Elvish Mystic'], ['Wall of Omens']] });
    tg.choose('Tripular:', ['Indomitable Ancients']).choose('Tripular:', ['Elvish Mystic']).choose('Tripular:', ['done']).activate(N, 'Tripular').resolveAll();
    expect(isCreature(tg.g, tg.bf(N))).toBe(true);
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(0);
    tg.choose('criatura ou planeswalker', ['Wall of Omens']).attack([[N, 1]]).passTo('declareBlockers');
    expect(tg.state.objects[tg.bf(N)].tapped).toBe(true);
    // o gatilho resolveu antes dos bloqueadores: o dano é dele, não do combate
    expect(tg.state.objects[tg.bf('Wall of Omens')].damage).toBe(3);
    expect(tg.life(1)).toBe(40);
  });

  it("entrada causa três de dano a criatura de oponente; alvo que sai torna o gatilho ineficaz", () => {

    const tg = setup({ battlefield: [['Sol Ring', 'Sol Ring', 'Island'], ['Indomitable Ancients']], hand: [[N], []] }); tg.choose('criatura ou planeswalker', ['Indomitable Ancients']).cast(N).resolveAll(); expect(tg.state.objects[tg.bf('Indomitable Ancients')].damage).toBe(3);
    expect(isCreature(tg.g, tg.bf(N))).toBe(false); expect(hasKw(tg.g, tg.bf(N), 'flying')).toBe(true);
  });
});
