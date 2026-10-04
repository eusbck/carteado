import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { hasKw } from '../../motor/chars.ts';

describe('Ohran Frostfang', () => {
  it('atacantes suas têm toque mortífero; cada uma que causa dano de combate a jogador compra', () => {
    const tg = setup({ battlefield: [['Ohran Frostfang', 'Elvish Mystic', 'Indomitable Ancients'], ['Wall of Omens']], library: [['Island', 'Island', 'Island'], []] });
    tg.attack([['Elvish Mystic', 1], ['Indomitable Ancients', 1]]).block([['Wall of Omens', 'Indomitable Ancients']]).passTo('declareBlockers');
    expect(hasKw(tg.g, tg.bf('Elvish Mystic'), 'deathtouch')).toBe(true);
    expect(hasKw(tg.g, tg.bf('Ohran Frostfang'), 'deathtouch')).toBe(false);
    tg.passTo('combatDamage');
    expect(tg.find('Wall of Omens')).toBeNull(); // toque mortífero
    expect(tg.names(0, 'hand').length).toBe(1);
  });
  it('CR 603.10a: morrendo no mesmo dano, ainda dispara para cada criatura', () => {
    const tg = setup({ battlefield: [['Ohran Frostfang', 'Elvish Mystic'], ['Indomitable Ancients']], library: [['Island', 'Island'], []] });
    tg.attack([['Ohran Frostfang', 1], ['Elvish Mystic', 1]]).block([['Indomitable Ancients', 'Ohran Frostfang']]);
    tg.passTo('declareBlockers');
    tg.state.objects[tg.bf('Ohran Frostfang')].damage = 4; // os 2 do bloqueador completam 6: morre junto com o dano do Mystic
    tg.passTo('combatDamage');
    expect(tg.find('Ohran Frostfang')).toBeNull();
    expect(tg.names(0, 'hand').length).toBe(1);
  });
});
