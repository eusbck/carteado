import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { putOntoBattlefield } from '../../motor/api.ts';

describe('Nissa, Leyline Tamer', () => {
  it('primeira resolução no turno: compra, depois revela até uma criatura, que entra; o resto vai para o fundo', () => {
    const tg = setup({
      battlefield: [['Nissa, Leyline Tamer'], []], hand: [['Forest'], []],
      library: [['Island', 'Plains', 'Swamp', 'Elvish Mystic', 'Mountain'], []],
    });
    tg.play('Forest').resolveAll();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.find('Elvish Mystic', 'battlefield', 0)).not.toBeNull();
    const lib = tg.names(0, 'library');
    expect(lib[0]).toBe('Mountain');
    expect(lib.slice(1).sort()).toEqual(['Plains', 'Swamp']);
  });

  it('da segunda vez no mesmo turno, só compra; no turno seguinte volta a revelar', () => {
    const tg = setup({
      battlefield: [['Nissa, Leyline Tamer'], []], hand: [['Forest', 'Plains', 'Swamp'], []],
      library: [['Island', 'Elvish Mystic', 'Island', 'Island', 'Wall of Omens', 'Island'], ['Island', 'Island']],
    });
    tg.play('Forest').resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Elvish Mystic').length).toBe(1);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Plains', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.find('Wall of Omens')).toBeNull(); // não revelou
    expect(tg.names(0, 'hand')).toEqual(['Swamp', 'Island', 'Island']);
    // no turno do oponente, um terreno seu entrando é a primeira resolução daquele turno
    tg.passTo('main1', 1);
    tg.run(putOntoBattlefield(tg.g, [{ id: tg.find('Swamp', 'hand')!, controller: 0 }], 'effect'));
    tg.resolveAll();
    expect(tg.find('Wall of Omens', 'battlefield', 0)).not.toBeNull();
  });

  it('terreno de um oponente não dispara', () => {
    const tg = setup({ active: 1, battlefield: [['Nissa, Leyline Tamer'], []], hand: [[], ['Forest']], library: [['Island', 'Elvish Mystic'], []] });
    tg.play('Forest').resolveAll();
    expect(tg.names(0, 'hand')).toEqual([]);
    expect(tg.find('Elvish Mystic')).toBeNull();
  });
});
