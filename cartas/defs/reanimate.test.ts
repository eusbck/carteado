import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe('Reanimate', () => {
  it('põe uma criatura de qualquer cemitério sob seu controle e você perde vida igual ao valor de mana', () => {
    const tg = setup({ battlefield: [['Swamp'], []], graveyard: [[], ['Zetalpa, Primal Dawn']], hand: [['Reanimate'], []] });
    tg.choose('carta de criatura', ['Zetalpa, Primal Dawn']).cast('Reanimate').resolve();
    expect(tg.names(0, 'battlefield')).toContain('Zetalpa, Primal Dawn');
    expect(tg.life(0)).toBe(32);
  });
  it('gatilhos de entrar resolvem depois da perda de vida', () => {
    const tg = setup({ battlefield: [['Swamp'], []], graveyard: [['Wall of Omens'], []], hand: [['Reanimate'], []], library: [['Island'], []] });
    tg.choose('carta de criatura', ['Wall of Omens']).cast('Reanimate').resolve();
    expect(tg.life(0)).toBe(38);
    expect(tg.state.zones.stack.length).toBe(1);
  });
  it('CR 800.4a: se você sai da partida, a criatura reanimada de outro dono é exilada', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp'], [], []], graveyard: [[], ['Indomitable Ancients'], []], hand: [['Reanimate'], [], []] });
    tg.choose('carta de criatura', ['Indomitable Ancients']).cast('Reanimate').resolve();
    tg.game.concede(0);
    expect(tg.names(1, 'exile')).toEqual(['Indomitable Ancients']);
  });
});
