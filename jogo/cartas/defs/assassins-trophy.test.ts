import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';

describe("Assassin's Trophy", () => {
  it('alvo indestrutível não é destruído, mas o controlador pode procurar', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], ['Zetalpa, Primal Dawn']], hand: [["Assassin's Trophy"], []], library: [[], ['Plains']] });
    tg.yes('Procurar', true).choose('terreno básico', ['Plains']);
    tg.choose('oponente controla', ['Zetalpa, Primal Dawn']).cast("Assassin's Trophy").resolve();
    expect(tg.find('Zetalpa, Primal Dawn')).not.toBeNull();
    expect(tg.state.objects[tg.bf('Plains', 1)].tapped).toBe(false);
  });
  it('sem procurar, o grimório não é embaralhado', () => {
    const tg = setup({ battlefield: [['Swamp', 'Forest'], ['Sol Ring']], hand: [["Assassin's Trophy"], []], library: [[], ['Wall of Omens', 'Plains', 'Island']] });
    tg.yes('Procurar', false).choose('oponente controla', ['Sol Ring']).cast("Assassin's Trophy").resolve();
    expect(tg.find('Sol Ring')).toBeNull();
    expect(tg.names(1, 'library')).toEqual(['Wall of Omens', 'Plains', 'Island']);
  });
});
