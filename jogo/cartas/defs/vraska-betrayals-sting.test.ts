import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { chars } from '../../motor/chars.ts';
import { manaOptions } from '../../motor/costs.ts';

describe("Vraska, Betrayal's Sting", () => {
  it('entra com 6 de lealdade pagando tudo em mana; 0: compra, perde 1 e prolifera', () => {
    const tg = setup({ battlefield: [[...Array(6).fill('Swamp'), { name: 'Wall of Omens', counters: { '+1/+1': 1 } }], []], hand: [["Vraska, Betrayal's Sting"], []], library: [['Island'], []] });
    tg.script.push((d) => (d.kind === 'payment' ? { kind: 'payment', auto: true } : null));
    tg.cast("Vraska, Betrayal's Sting").resolve();
    const v = tg.bf("Vraska, Betrayal's Sting");
    expect(tg.state.objects[v].counters.loyalty).toBe(6);
    tg.choose('Prolifere', ['Wall of Omens']);
    tg.activate("Vraska, Betrayal's Sting", '0:').resolve();
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.life(0)).toBe(39);
  });
  it('a criatura vira só um artefato Tesouro', () => {
    const tg = setup({ battlefield: [[{ name: "Vraska, Betrayal's Sting", counters: { loyalty: 6 } }], ['Glissa Sunslayer']] });
    tg.choose('criatura alvo', ['Glissa Sunslayer']);
    tg.activate("Vraska, Betrayal's Sting", '−2').resolve();
    const g = tg.bf('Glissa Sunslayer');
    const c = chars(tg.g, g);
    expect([c.types, c.subtypes, c.supertypes]).toEqual([['Artifact'], ['Treasure'], ['Legendary']]);
    expect(c.abilities.length).toBe(1);
    expect(manaOptions(tg.g, 1).some((m) => m.obj === g)).toBe(true);
  });
  it('o alvo fica com nove marcadores de veneno', () => {
    const tg = setup({ battlefield: [[{ name: "Vraska, Betrayal's Sting", counters: { loyalty: 9 } }], []] });
    tg.state.players[1].counters.poison = 2;
    tg.refresh().choose('jogador alvo', ['Bruno']);
    tg.activate("Vraska, Betrayal's Sting", '−9').resolve();
    expect(tg.state.players[1].counters.poison).toBe(9);
  });
});
