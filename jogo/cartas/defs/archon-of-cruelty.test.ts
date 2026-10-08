import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Archon of Cruelty', () => {
  it('ao entrar: o oponente alvo escolhe o que sacrificar (criatura ou planeswalker), descarta, perde 3; você compra e ganha 3', () => {
    const tg = setup({
      battlefield: [[...Array(8).fill('Swamp')], ['Wall of Omens', "Vraska, Betrayal's Sting", 'Sol Ring']],
      hand: [['Archon of Cruelty'], ['Island', 'Swamp']], library: [['Plains'], ['Island']],
    });
    const quem: Record<string, number> = {};
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Sacrifique uma criatura ou planeswalker')) return null;
      quem.sacrificio = d.player;
      expect(d.items.map((i) => i.label).sort()).toEqual(['Vraska, Betrayal\'s Sting', 'Wall of Omens']);
      return { kind: 'select', ids: d.items.filter((i) => i.label === "Vraska, Betrayal's Sting").map((i) => i.id) };
    });
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.includes('Descarte')) return null;
      quem.descarte = d.player;
      return { kind: 'select', ids: d.items.filter((i) => i.label === 'Swamp').map((i) => i.id) };
    });
    tg.cast('Archon of Cruelty').resolve().resolveAll();
    expect(quem).toEqual({ sacrificio: 1, descarte: 1 });
    expect(tg.names(1, 'battlefield').sort()).toEqual(['Sol Ring', 'Wall of Omens']);
    expect(tg.names(1, 'graveyard').sort()).toEqual(['Swamp', "Vraska, Betrayal's Sting"]);
    expect(tg.names(1, 'hand')).toEqual(['Island']);
    expect(tg.life(1)).toBe(37);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.life(0)).toBe(43);
  });

  it('dispara ao atacar; sem criatura nem carta na mão, o oponente só perde 3 de vida', () => {
    const tg = setup({ battlefield: [['Archon of Cruelty'], ['Sol Ring']], library: [['Plains'], ['Island']] });
    tg.attack([['Archon of Cruelty', 1]]).passTo('declareAttackers').resolveAll();
    expect(tg.life(1)).toBe(37);
    expect(tg.names(1, 'battlefield')).toEqual(['Sol Ring']);
    expect(tg.names(0, 'hand')).toEqual(['Plains']);
    expect(tg.life(0)).toBe(43);
  });

  it('ruling 1 — o gatilho de morte do sacrificado espera; se o oponente perde o jogo pelos 3 de vida, o gatilho dele não vai para a pilha', () => {
    const vivo = setup({ battlefield: [[...Array(8).fill('Swamp')], ['Haywire Mite']], hand: [['Archon of Cruelty'], []], library: [['Plains'], ['Island']] });
    vivo.cast('Archon of Cruelty').resolve();
    vivo.resolve(); // gatilho de entrar do Archon
    expect(vivo.life(1)).toBe(37); // perdeu 3 antes de o gatilho do Haywire Mite resolver
    vivo.resolveAll();
    expect(vivo.life(1)).toBe(39);

    const tg = setup({
      players: 3, battlefield: [[...Array(8).fill('Swamp')], ['Haywire Mite'], []], hand: [['Archon of Cruelty'], [], []],
      library: [['Plains'], ['Island'], ['Island']],
    });
    tg.state.players[1].life = 3;
    tg.choose('oponente alvo', ['Bruno']);
    tg.cast('Archon of Cruelty').resolve().resolveAll();
    expect(tg.state.players[1].left).toBe(true);
    expect(tg.state.players[1].life).toBe(0);
    expect(tg.state.zones.stack).toEqual([]);
  });
});
