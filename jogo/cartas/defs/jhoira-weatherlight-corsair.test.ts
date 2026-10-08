import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { controllerOf } from '../../motor/api.ts';

describe('Jhoira, Weatherlight Corsair', () => {
  it('ao entrar: o oponente revela até uma carta de permanente histórica; ela entra sob seu controle e você perde o valor de mana dela', () => {
    const tg = setup({
      battlefield: [[...Array(6).fill('Swamp')], []], hand: [['Jhoira, Weatherlight Corsair'], []],
      library: [[], ['Island', "Night's Whisper", 'Wall of Omens', 'Sol Ring', 'Plains']],
    });
    tg.cast('Jhoira, Weatherlight Corsair').resolve().resolveAll();
    const anel = tg.bf('Sol Ring');
    expect(controllerOf(tg.g, anel)).toBe(0);
    expect(tg.state.objects[anel].owner).toBe(1);
    expect(tg.life(0)).toBe(39);
    const lib = tg.names(1, 'library');
    expect(lib[0]).toBe('Plains');
    expect(lib.slice(1).sort()).toEqual(['Island', "Night's Whisper", 'Wall of Omens']);
  });

  it('ao atacar; lendária conta como histórica (CR 700.6) e você perde o valor de mana dela', () => {
    const tg = setup({
      battlefield: [['Jhoira, Weatherlight Corsair'], []],
      library: [[], ['Elvish Mystic', 'Mangara, the Diplomat', 'Island']],
    });
    tg.attack([['Jhoira, Weatherlight Corsair', 1]]).passTo('declareAttackers').resolveAll();
    expect(controllerOf(tg.g, tg.bf('Mangara, the Diplomat'))).toBe(0);
    expect(tg.life(0)).toBe(36);
    expect(tg.names(1, 'library')).toEqual(['Island', 'Elvish Mystic']);
  });

  it('Saga é histórica', () => {
    const tg = setup({ battlefield: [['Jhoira, Weatherlight Corsair'], []], library: [[], ['Island', 'Summon: Esper Valigarmanda']] });
    tg.attack([['Jhoira, Weatherlight Corsair', 1]]).passTo('declareAttackers').resolveAll();
    expect(controllerOf(tg.g, tg.bf('Summon: Esper Valigarmanda'))).toBe(0);
    expect(tg.life(0)).toBe(36);
  });

  it('sem carta histórica, todas as reveladas vão para o fundo e ninguém perde vida', () => {
    const tg = setup({ battlefield: [['Jhoira, Weatherlight Corsair'], []], library: [[], ['Island', 'Wall of Omens', 'Elvish Mystic']] });
    tg.attack([['Jhoira, Weatherlight Corsair', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.names(1, 'library').sort()).toEqual(['Elvish Mystic', 'Island', 'Wall of Omens']);
    expect(tg.life(0)).toBe(40);
    expect(tg.names(0, 'battlefield')).toEqual(['Jhoira, Weatherlight Corsair']);
  });
});
