import { describe, expect, it } from 'vitest';
import { setup } from '../../testes/harness.ts';
import { createTokens } from '../../motor/api.ts';

describe('Ayara, First of Locthwain', () => {
  it('no multijogador: ao entrar, cada oponente perde 1 e você ganha só 1', () => {
    const tg = setup({ players: 3, battlefield: [['Swamp', 'Swamp', 'Swamp'], [], []], hand: [['Ayara, First of Locthwain'], [], []] });
    tg.cast('Ayara, First of Locthwain').resolveAll();
    expect([tg.life(0), tg.life(1), tg.life(2)]).toEqual([41, 39, 39]);
  });

  it('dispara com outra criatura preta sua (inclusive ficha); não com criatura não preta nem com a de um oponente', () => {
    const tg = setup({ battlefield: [['Ayara, First of Locthwain', 'Swamp', 'Forest'], ['Swamp']], hand: [['Viscera Seer', 'Elvish Mystic'], ['Hateful Eidolon']] });
    tg.cast('Viscera Seer').resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
    tg.cast('Elvish Mystic').resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([41, 39]);
    tg.run(createTokens(tg.g, 0, 'Zombie 2/2', 2));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([43, 37]);
    tg.run(createTokens(tg.g, 1, 'Zombie 2/2', 1));
    tg.resolveAll();
    expect([tg.life(0), tg.life(1)]).toEqual([43, 37]);
  });

  it('{T}, sacrificar outra criatura preta: compra uma carta; criatura não preta não serve', () => {
    const tg = setup({ battlefield: [['Ayara, First of Locthwain', 'Viscera Seer', 'Elvish Mystic'], []], library: [['Island'], []] });
    let opcoes: string[] = [];
    tg.script.push((d) => (d.kind === 'select' && d.prompt.includes('Sacrifique') ? (opcoes = d.items.map((i) => i.label), { kind: 'select', ids: [d.items[0].id] }) : null));
    tg.activate('Ayara, First of Locthwain', 'Compre').resolve();
    expect(opcoes).toEqual(['Viscera Seer']);
    expect(tg.names(0, 'hand')).toEqual(['Island']);
    expect(tg.names(0, 'graveyard')).toEqual(['Viscera Seer']);
  });

  it('só com criaturas não pretas, a habilidade de comprar não fica disponível', () => {
    const tg = setup({ battlefield: [['Ayara, First of Locthwain', 'Elvish Mystic'], []], library: [['Island'], []] });
    expect(tg.actionIds().some((a) => a.startsWith(`act:${tg.bf('Ayara, First of Locthwain')}:`))).toBe(false);
  });
});
