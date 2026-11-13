// lote4-b: habilidade de mana cuja quantidade depende do que foi pago no custo (CR 605.1a, 608.2h; `produceFromCost` em
// ManaAbilityDef): Soldevi Adnate adiciona {B} igual ao valor de mana da criatura sacrificada.
import { describe, expect, it } from 'vitest';
import { activateManaAbility, manaOptions } from '../motor/costs.ts';
import { runEffect } from './artefatos.ts';
import { setup } from './harness.ts';

describe('mana que depende do custo pago', () => {
  it('CR 608.2h: a mana vem do valor de mana da criatura sacrificada, pela última informação', () => {
    const tg = setup({ battlefield: [['Soldevi Adnate', 'Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel', 'Burnished Hart', 'Wall of Omens'], []] });
    const adnate = tg.bf('Soldevi Adnate');
    const opcoes = manaOptions(tg.g, 0).filter((o) => o.obj === adnate);
    // estimativas: Soldevi (2) e Sephiroth (3) são pretas; Burnished Hart (3) é artefato; Wall of Omens (branca) não serve
    expect(opcoes.map((o) => o.alt.length).sort()).toEqual([2, 3]);
    tg.choose('Sacrifique', ['Burnished Hart']);
    runEffect(tg, activateManaAbility(tg.g, 0, opcoes[0]));
    expect(tg.state.players[0].manaPool.map((u) => u.type)).toEqual(['B', 'B', 'B']);
    expect(tg.state.objects[adnate].tapped).toBe(true);
    expect(tg.find('Burnished Hart')).toBeNull();
  });
});
