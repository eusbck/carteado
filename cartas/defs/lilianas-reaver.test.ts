import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/api.ts';

describe("Liliana's Reaver", () => {
  it('tem toque mortífero', () => {
    const tg = setup({ battlefield: [["Liliana's Reaver"], []] });
    expect(hasKw(tg.g, tg.bf("Liliana's Reaver"), 'deathtouch')).toBe(true);
  });
  it('dano de combate a um jogador: esse jogador escolhe e descarta uma carta, você cria um Zombie 2/2 virado', () => {
    const tg = setup({ players: 3, battlefield: [["Liliana's Reaver"], [], []], hand: [[], [], ['Island', 'Plains']] });
    let quem = -1;
    tg.script.push((d) => {
      if (d.kind !== 'select' || !d.prompt.toLowerCase().includes('descart')) return null;
      quem = d.player;
      return { kind: 'select', ids: [d.items.find((i) => i.label === 'Plains')!.id] };
    });
    tg.attack([["Liliana's Reaver", 2]]).passTo('main2');
    expect(tg.life(2)).toBe(36);
    expect(quem).toBe(2);
    expect(tg.names(2, 'graveyard')).toEqual(['Plains']);
    expect(tg.names(2, 'hand')).toEqual(['Island']);
    const ficha = tg.bf('Zombie 2/2');
    expect(tg.state.objects[ficha].controller).toBe(0);
    expect(tg.state.objects[ficha].tapped).toBe(true);
  });
  it('com a mão do jogador vazia, a ficha é criada mesmo assim', () => {
    const tg = setup({ battlefield: [["Liliana's Reaver"], []] });
    tg.attack([["Liliana's Reaver", 1]]).passTo('main2');
    expect(tg.all('Zombie 2/2').length).toBe(1);
  });
  it('bloqueada, não dispara', () => {
    const tg = setup({ battlefield: [["Liliana's Reaver"], ['Wall of Omens']], hand: [[], ['Island']] });
    tg.attack([["Liliana's Reaver", 1]]).block([['Wall of Omens', "Liliana's Reaver"]]).passTo('main2');
    expect(tg.all('Zombie 2/2').length).toBe(0);
    expect(tg.names(1, 'hand')).toEqual(['Island']);
    expect(tg.find('Wall of Omens')).toBeNull();
  });
});
