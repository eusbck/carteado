import { describe, expect, it } from 'vitest';
import { addEffect, destroy, discard, gainControl, permanentsSacrificedThisTurn, sacrifice } from '../motor/api.ts';
import { fixture as setup, runEffect } from './artefatos.ts';

describe('Histórico de sacrifícios no turno', () => {
  it('CR 701.21a: conta cada permanente do lote, inclusive terrenos, criaturas e fichas', () => {
    const tg = setup({ battlefield: [['Forest', 'Elvish Mystic', { name: 'Food', token: true }], ['Sol Ring']] });
    runEffect(tg, sacrifice(tg.g, [tg.bf('Forest'), tg.bf('Elvish Mystic'), tg.bf('Food')]));
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(3);
    expect(permanentsSacrificedThisTurn(tg.g, 1)).toBe(0);
    expect(tg.state.turnStats[0].foodsSacrificed).toBe(1);
    expect(tg.state.turnStats[0].sacrificedCreature).toBe(true);
  });
  it('CR 701.21a, 614.6: continua sendo sacrifício quando o destino é substituído por exílio', () => {
    const tg = setup({ battlefield: [[{ name: 'Elvish Mystic', counters: { finality: 1 } }], []] });
    runEffect(tg, sacrifice(tg.g, [tg.bf('Elvish Mystic')]));
    expect(tg.find('Elvish Mystic', 'exile')).not.toBeNull();
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(1);
    expect(tg.state.turnStats[0].creaturesDied).toBe(0);
  });
  it('CR 701.21a: conta para o controlador que sacrificou, mesmo que o dono seja outro jogador', () => {
    const tg = setup({ battlefield: [[], ['Sol Ring']] });
    const id = tg.bf('Sol Ring');
    gainControl(tg.g, id, 0, { kind: 'endOfTurn' }, id);
    runEffect(tg, sacrifice(tg.g, [id]));
    expect(tg.names(1, 'graveyard')).toContain('Sol Ring');
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(1);
    expect(permanentsSacrificedThisTurn(tg.g, 1)).toBe(0);
  });
  it('CR 701.21a: destruir e descartar não contam; um sacrifício proibido também não conta', () => {
    const tg = setup({ battlefield: [['Elvish Mystic', 'Sol Ring'], []], hand: [['Forest'], []] });
    runEffect(tg, destroy(tg.g, [tg.bf('Elvish Mystic')]));
    runEffect(tg, discard(tg.g, 0, 1));
    addEffect(tg.g, { source: tg.bf('Sol Ring'), sourceDef: '', controller: 0, duration: { kind: 'endOfTurn' }, affected: [tg.bf('Sol Ring')], mods: [{ k: 'rule', id: 'rule:cantBeSacrificed' }] });
    runEffect(tg, sacrifice(tg.g, [tg.bf('Sol Ring')]));
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(0);
    expect(tg.find('Sol Ring')).not.toBeNull();
  });
  it('CR 500.1: a contagem recomeça em cada turno e aceita estados antigos sem o campo novo', () => {
    const tg = setup({ battlefield: [['Sol Ring'], []] });
    delete tg.state.turnStats[0].permanentsSacrificed;
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(0);
    runEffect(tg, sacrifice(tg.g, [tg.bf('Sol Ring')]));
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(1);
    tg.passTo('main1', 1);
    expect(permanentsSacrificedThisTurn(tg.g, 0)).toBe(0);
  });
});
