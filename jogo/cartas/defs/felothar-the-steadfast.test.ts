import { describe, expect, it } from 'vitest';
import { buildView } from '../../motor/view.ts';
import { setup } from '../../testes/harness.ts';

describe('Felothar the Steadfast', () => {
  it('defensores atacam e causam dano pela resistência; só o dano atribuído muda, a força continua', () => {
    const tg = setup({ battlefield: [['Felothar the Steadfast', 'Wall of Omens'], []] });
    tg.attack([['Wall of Omens', 1]]).passTo('combatDamage');
    expect(tg.life(1)).toBe(36);
    expect(tg.pt(tg.bf('Wall of Omens'))).toEqual([0, 4]);
  });
  it('vista: as criaturas do controlador mostram o dano pela resistência (selo da carta); as do oponente não', () => {
    const tg = setup({ battlefield: [['Felothar the Steadfast', 'Wall of Omens', 'Plains'], ['Indomitable Ancients']] });
    for (const viewer of [0, 1]) {
      const v = buildView(tg.g, viewer, tg.pending);
      const obj = (name: string) => v.battlefield.find((o) => o.id === tg.bf(name))!;
      expect(obj('Wall of Omens').damageByToughness).toEqual({ amount: 4, source: 'Felothar the Steadfast', sourceDef: 'Felothar the Steadfast' });
      expect(obj('Wall of Omens')).toMatchObject({ power: 0, toughness: 4 });
      expect(obj('Felothar the Steadfast').damageByToughness?.amount).toBe(5);
      // sem o efeito, a vista fica como antes (nem a chave aparece)
      expect('damageByToughness' in obj('Indomitable Ancients')).toBe(false);
      expect('damageByToughness' in obj('Plains')).toBe(false);
    }
  });
  it('{3}, {T}, sacrifique: compra pela resistência e descarta pela força', () => {
    const tg = setup({ battlefield: [['Felothar the Steadfast', 'Indomitable Ancients', 'Plains', 'Plains', 'Plains'], []], library: [Array(10).fill('Island'), []] });
    tg.choose('escarte', ['Island', 'Island']).activate('Felothar the Steadfast').resolve();
    expect(tg.names(0, 'hand').length).toBe(8);
  });
});
