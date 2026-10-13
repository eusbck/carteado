import { describe, expect, it } from 'vitest';
import { createTokens } from '../../motor/api.ts';
import { setup } from '../../testes/harness.ts';

const N = 'Lula, o Espanca Pobre';
const ilhas = Array(6).fill('Island');

describe(N, () => {
  it('conjurar um encantamento cria um Eleitor; outra mágica não cria', () => {
    const tg = setup({ battlefield: [[N, 'Plains', 'Plains', 'Plains', 'Swamp'], []], hand: [['Ghostly Prison', 'Sol Ring'], []] });
    tg.cast('Ghostly Prison').resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Eleitor')).toHaveLength(1);
    tg.cast('Sol Ring').resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Eleitor')).toHaveLength(1);
  });

  it('sacrificando dois Eleitores, a carta do topo do oponente com valor de mana 3 ou menos sai de graça', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Elvish Mystic', ...ilhas]] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 2));
    tg.activate(N, 'Sacrifique dois Eleitores').resolveAll();
    expect(tg.names(0, 'battlefield').filter((n) => n === 'Eleitor')).toHaveLength(0);
    expect(tg.names(1, 'exile')).toEqual(['Elvish Mystic']);
    tg.cast('Elvish Mystic', '*').resolveAll();
    expect(tg.state.objects[tg.bf('Elvish Mystic')].controller).toBe(0);
  });

  it('carta mais cara custa {3} a menos, paga com mana de qualquer tipo', () => {
    // Indomitable Ancients custa {2}{W}{W}: sobra {1}, paga com uma Mountain
    const tg = setup({ battlefield: [[N, 'Mountain'], []], library: [ilhas, ['Indomitable Ancients', ...ilhas]] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 2));
    tg.activate(N, 'Sacrifique dois Eleitores').resolveAll();
    tg.cast('Indomitable Ancients', '*').resolveAll();
    expect(tg.state.objects[tg.bf('Indomitable Ancients')].controller).toBe(0);
    expect(tg.state.objects[tg.bf('Mountain')].tapped).toBe(true);
  });

  it('um terreno exilado pode ser jogado', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Forest', ...ilhas]] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 2));
    tg.activate(N, 'Sacrifique dois Eleitores').resolveAll();
    tg.play('Forest');
    expect(tg.names(0, 'battlefield')).toContain('Forest');
  });

  it('com um Eleitor só, a habilidade não pode ser ativada; outras fichas não pagam', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ilhas] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 1));
    tg.run(createTokens(tg.g, 0, 'Patriota', 1));
    expect(tg.actionIds().some((a) => a.startsWith('activate:'))).toBe(false);
  });

  it('a permissão acaba no fim do turno', () => {
    const tg = setup({ battlefield: [[N], []], library: [ilhas, ['Elvish Mystic', ...ilhas]] });
    tg.run(createTokens(tg.g, 0, 'Eleitor', 2));
    tg.activate(N, 'Sacrifique dois Eleitores').resolveAll();
    tg.passTo('upkeep', 1);
    expect(tg.actionIds().some((a) => a.startsWith('cast:'))).toBe(false);
    expect(tg.names(1, 'exile')).toEqual(['Elvish Mystic']);
  });
});
